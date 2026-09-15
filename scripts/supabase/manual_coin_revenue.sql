-- Chạy MỘT LẦN trong Supabase SQL Editor cho database đang hoạt động.
-- Migration này dành cho database cũ chỉ có teams, members và weekly_coin_deductions.
-- Nó KHÔNG thay đổi teams.points, vì số dư đã được Admin cộng và hệ thống trừ đúng.

begin;

-- Các cột này được RPC kết toán tuần sử dụng nhưng database cũ chưa có.
alter table public.teams
    add column if not exists weekly_income integer not null default 0,
    add column if not exists weekly_expense integer not null default 0,
    add column if not exists updated_at timestamptz not null default now();

create table if not exists public.weekly_coin_deductions (
    week_key date primary key,
    deduction_amount integer not null,
    created_at timestamptz not null default now()
);

-- Sổ cái dùng chung cho Admin, nhật ký và trang của từng quán.
create table if not exists public.coin_transactions (
    id uuid primary key default gen_random_uuid(),
    team_id text not null references public.teams(id) on delete cascade,
    order_id text,
    type text not null check (type in ('income', 'expense', 'adjustment')),
    title text not null,
    reason text check (reason is null or char_length(btrim(reason)) between 1 and 200),
    amount integer not null check (amount <> 0),
    occurred_at timestamptz not null default now()
);

alter table public.coin_transactions
    add column if not exists order_id text,
    add column if not exists reason text;

create index if not exists coin_transactions_team_occurred_at_idx
    on public.coin_transactions (team_id, occurred_at desc);

-- Ảnh chụp tài chính của tuần đã kết thúc.
create table if not exists public.weekly_financial_settlements (
    id uuid primary key default gen_random_uuid(),
    team_id text not null references public.teams(id) on delete cascade,
    period_start date not null,
    period_end date not null,
    income integer not null default 0 check (income >= 0),
    expense integer not null default 0 check (expense >= 0),
    profit integer not null default 0,
    member_count integer not null default 0 check (member_count >= 0),
    settled_at timestamptz not null default now(),
    unique (team_id, period_start),
    check (period_end > period_start)
);

create index if not exists weekly_settlements_team_period_idx
    on public.weekly_financial_settlements (team_id, period_start desc);

alter table public.coin_transactions enable row level security;
alter table public.weekly_financial_settlements enable row level security;
alter table public.weekly_coin_deductions enable row level security;

drop policy if exists "admin" on public.weekly_coin_deductions;
create policy "admin" on public.weekly_coin_deductions
    as permissive
    for select
    to authenticated
    using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

drop policy if exists "public_read_coin_transactions" on public.coin_transactions;
create policy "public_read_coin_transactions"
    on public.coin_transactions
    for select
    to anon, authenticated
    using (true);

drop policy if exists "public_read_weekly_financial_settlements" on public.weekly_financial_settlements;
create policy "public_read_weekly_financial_settlements"
    on public.weekly_financial_settlements
    for select
    to anon, authenticated
    using (true);

grant select on public.coin_transactions to anon, authenticated;
grant select on public.weekly_financial_settlements to anon, authenticated;
grant select on public.weekly_coin_deductions to authenticated;

-- Nếu một bản schema trung gian đã ghi Admin cộng coin là adjustment thì sửa lại loại.
update public.coin_transactions
set type = 'income'
where type = 'adjustment'
    and amount > 0
    and title = 'Admin cộng coin';

-- Xác định tuần vừa kết toán. Nếu bảng cũ chưa lưu mốc, dùng chu kỳ Thứ Hai–Chủ nhật
-- bắt đầu từ 31/08/2026. Đây chỉ là dữ liệu tạm trong transaction.
create temporary table finance_recovery_context on commit drop as
with current_cycle as (
    select date '2026-08-31'
        + (((timezone('Asia/Ho_Chi_Minh', now())::date - date '2026-08-31') / 7) * 7) as period_end
), recorded_cycle as (
    select deductions.week_key as period_end, deductions.deduction_amount as base_cost
    from public.weekly_coin_deductions as deductions
    where deductions.week_key > date '2026-08-31'
    order by deductions.week_key desc
    limit 1
)
select
    coalesce(recorded_cycle.period_end, current_cycle.period_end) as period_end,
    coalesce(recorded_cycle.base_cost, 200) as base_cost,
    1000::integer as opening_capital
from current_cycle
left join recorded_cycle on true
where coalesce(recorded_cycle.period_end, current_cycle.period_end) > date '2026-08-31';

-- Ghi riêng vốn ban đầu để sổ cái khớp số dư nhưng không tính vốn là doanh thu.
insert into public.coin_transactions (team_id, type, title, reason, amount, occurred_at)
select
    teams.id,
    'adjustment',
    'Vốn ban đầu',
    'Vốn khởi tạo; không tính vào doanh thu',
    context.opening_capital,
    (context.period_end - 7)::timestamp at time zone 'Asia/Ho_Chi_Minh'
from public.teams as teams
cross join finance_recovery_context as context
where teams.points > 0
    and not exists (
        select 1
        from public.coin_transactions as transactions
        where transactions.team_id = teams.id
            and transactions.title = 'Vốn ban đầu'
    );

-- Khôi phục khoản Admin cộng trước khi database có sổ giao dịch.
-- Khi tuần mới bắt đầu: số dư = vốn ban đầu + doanh thu tuần cũ - chi phí tuần.
-- Chỉ khôi phục cho quán chưa có bất kỳ khoản thu nào trong kỳ, nên có thể chạy lại an toàn.
with paid_staff as (
    select
        teams.id as team_id,
        count(members.id) filter (
            where lower(trim(coalesce(members.role, ''))) not in (
                'manage',
                'manager',
                'quản lý',
                'quan ly',
                'quản trị viên',
                'quan tri vien',
                'trưởng nhóm',
                'truong nhom',
                'leader',
                'admin'
            )
        )::integer as staff_count
    from public.teams as teams
    left join public.members as members on members.team_id = teams.id
    group by teams.id
), recoverable_income as (
    select
        teams.id as team_id,
        context.period_end,
        teams.points + context.base_cost + (20 * paid_staff.staff_count) - context.opening_capital as income
    from public.teams as teams
    join paid_staff on paid_staff.team_id = teams.id
    cross join finance_recovery_context as context
    where teams.points + context.base_cost + (20 * paid_staff.staff_count) > context.opening_capital
        and not exists (
            select 1
            from public.coin_transactions as transactions
            where transactions.team_id = teams.id
                and transactions.type = 'income'
                and transactions.amount > 0
                and transactions.occurred_at >= ((context.period_end - 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
                and transactions.occurred_at < (context.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh')
        )
)
insert into public.coin_transactions (team_id, type, title, reason, amount, occurred_at)
select
    recovered.team_id,
    'income',
    'Admin cộng coin (khôi phục)',
    'Khôi phục doanh thu kỳ cũ từ số dư đã đối soát',
    recovered.income,
    (recovered.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh') - interval '1 second'
from recoverable_income as recovered;

-- Bổ sung dòng nhật ký chi phí đã bị trừ ở đầu tuần, không trừ teams.points lần nữa.
with paid_staff as (
    select
        teams.id as team_id,
        count(members.id) filter (
            where lower(trim(coalesce(members.role, ''))) not in (
                'manage',
                'manager',
                'quản lý',
                'quan ly',
                'quản trị viên',
                'quan tri vien',
                'trưởng nhóm',
                'truong nhom',
                'leader',
                'admin'
            )
        )::integer as staff_count
    from public.teams as teams
    left join public.members as members on members.team_id = teams.id
    group by teams.id
)
insert into public.coin_transactions (team_id, type, title, reason, amount, occurred_at)
select
    teams.id,
    'expense',
    'Phí vận hành tuần',
    'Khôi phục chi phí vận hành đã trừ ở đầu kỳ',
    -(context.base_cost + (20 * paid_staff.staff_count)),
    context.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh'
from public.teams as teams
join paid_staff on paid_staff.team_id = teams.id
cross join finance_recovery_context as context
where teams.points > 0
    and not exists (
        select 1
        from public.coin_transactions as transactions
        where transactions.team_id = teams.id
            and transactions.type = 'expense'
            and transactions.title = 'Phí vận hành tuần'
            and transactions.occurred_at >= (context.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh')
            and transactions.occurred_at < ((context.period_end + 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
    );

-- Tạo mới hoặc tính lại kỳ vừa chốt từ sổ giao dịch đã khôi phục.
with paid_staff as (
    select
        teams.id as team_id,
        count(members.id) filter (
            where lower(trim(coalesce(members.role, ''))) not in (
                'manage',
                'manager',
                'quản lý',
                'quan ly',
                'quản trị viên',
                'quan tri vien',
                'trưởng nhóm',
                'truong nhom',
                'leader',
                'admin'
            )
        )::integer as staff_count
    from public.teams as teams
    left join public.members as members on members.team_id = teams.id
    group by teams.id
), settlement_values as (
    select
        teams.id as team_id,
        context.period_end - 7 as period_start,
        context.period_end,
        coalesce(sum(transactions.amount) filter (
            where transactions.type = 'income' and transactions.amount > 0
        ), 0)::integer as income,
        (context.base_cost + (20 * paid_staff.staff_count))::integer as expense,
        paid_staff.staff_count
    from public.teams as teams
    join paid_staff on paid_staff.team_id = teams.id
    cross join finance_recovery_context as context
    left join public.coin_transactions as transactions
        on transactions.team_id = teams.id
        and transactions.occurred_at >= ((context.period_end - 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
        and transactions.occurred_at < (context.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh')
    group by teams.id, context.period_end, context.base_cost, paid_staff.staff_count
)
insert into public.weekly_financial_settlements (
    team_id,
    period_start,
    period_end,
    income,
    expense,
    profit,
    member_count
)
select
    values_to_store.team_id,
    values_to_store.period_start,
    values_to_store.period_end,
    values_to_store.income,
    values_to_store.expense,
    values_to_store.income - values_to_store.expense,
    values_to_store.staff_count
from settlement_values as values_to_store
on conflict (team_id, period_start) do update
set period_end = excluded.period_end,
    income = excluded.income,
    expense = excluded.expense,
    profit = excluded.profit,
    member_count = excluded.member_count,
    settled_at = now();

-- Từ lần triển khai này, Admin cộng coin là doanh thu; Admin trừ coin vẫn là điều chỉnh.
create or replace function public.add_points_to_team(
    team_id_in text,
    points_to_add integer,
    reason_in text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    if not coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) then
        raise exception 'admin access required';
    end if;

    if points_to_add = 0 then
        raise exception 'points_to_add must not be zero';
    end if;

    if nullif(btrim(coalesce(reason_in, '')), '') is null then
        raise exception 'reason is required';
    end if;

    if char_length(btrim(reason_in)) > 200 then
        raise exception 'reason must not exceed 200 characters';
    end if;

    update public.teams
    set points = coalesce(points, 0) + points_to_add,
        updated_at = now()
    where id = team_id_in;

    if not found then
        raise exception 'team not found';
    end if;

    insert into public.coin_transactions (team_id, type, title, reason, amount)
    values (
        team_id_in,
        case when points_to_add > 0 then 'income' else 'adjustment' end,
        case when points_to_add > 0 then 'Admin cộng coin' else 'Admin trừ coin' end,
        btrim(reason_in),
        points_to_add
    );
end;
$$;

drop function if exists public.add_points_to_team(text, integer);
revoke all on function public.add_points_to_team(text, integer, text) from public;
revoke all on function public.add_points_to_team(text, integer, text) from anon;
grant execute on function public.add_points_to_team(text, integer, text) to authenticated;

-- Giữ logic các tuần sau: chốt tuần cũ, trừ đúng 200 + 20/nhân viên,
-- ghi cả doanh thu, chi phí và lợi nhuận vào database.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.deduct_weekly_coins(
    deduction_amount integer,
    week_key date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    inserted boolean;
    affected_rows integer;
    team_record record;
    actual_deduction integer;
    weekly_cost integer;
    previous_week_start date;
    settled_income integer;
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    if not coalesce(public.is_admin(), false) then
        raise exception 'admin access required';
    end if;

    if deduction_amount <= 0 then
        raise exception 'deduction amount must be positive';
    end if;

    if week_key < date '2026-08-31' or extract(isodow from week_key) <> 1 then
        raise exception 'week_key must be a Monday on or after 2026-08-31';
    end if;

    insert into public.weekly_coin_deductions (week_key, deduction_amount)
    values (week_key, deduction_amount)
    on conflict (week_key) do nothing;

    get diagnostics affected_rows = row_count;
    inserted := affected_rows > 0;

    if inserted then
        for team_record in
            select
                teams.id,
                coalesce(teams.points, 0) as points,
                count(members.id) filter (
                    where lower(trim(coalesce(members.role, ''))) not in (
                        'manage',
                        'manager',
                        'quản lý',
                        'quan ly',
                        'quản trị viên',
                        'quan tri vien',
                        'trưởng nhóm',
                        'truong nhom',
                        'leader',
                        'admin'
                    )
                )::integer as paid_staff_count
            from public.teams as teams
            left join public.members as members on members.team_id = teams.id
            group by teams.id, teams.points
        loop
            weekly_cost := deduction_amount + (20 * team_record.paid_staff_count);

            if week_key > date '2026-08-31' then
                previous_week_start := week_key - 7;

                select coalesce(sum(amount), 0)::integer
                into settled_income
                from public.coin_transactions
                where team_id = team_record.id
                    and type = 'income'
                    and amount > 0
                    and occurred_at >= (previous_week_start::timestamp at time zone 'Asia/Ho_Chi_Minh')
                    and occurred_at < (week_key::timestamp at time zone 'Asia/Ho_Chi_Minh');

                insert into public.weekly_financial_settlements (
                    team_id,
                    period_start,
                    period_end,
                    income,
                    expense,
                    profit,
                    member_count
                )
                values (
                    team_record.id,
                    previous_week_start,
                    week_key,
                    settled_income,
                    weekly_cost,
                    settled_income - weekly_cost,
                    team_record.paid_staff_count
                )
                on conflict (team_id, period_start) do update
                set period_end = excluded.period_end,
                    income = excluded.income,
                    expense = excluded.expense,
                    profit = excluded.profit,
                    member_count = excluded.member_count,
                    settled_at = now();
            end if;

            actual_deduction := least(team_record.points, weekly_cost);

            update public.teams
            set points = team_record.points - actual_deduction,
                weekly_income = 0,
                weekly_expense = 0,
                updated_at = now()
            where id = team_record.id;

            if actual_deduction > 0 then
                insert into public.coin_transactions (team_id, type, title, reason, amount)
                values (
                    team_record.id,
                    'expense',
                    'Phí vận hành tuần',
                    'Hệ thống tự trừ chi phí vận hành cho tuần bắt đầu ' || to_char(week_key, 'DD/MM/YYYY'),
                    -actual_deduction
                );
            end if;
        end loop;
    end if;

    return inserted;
end;
$$;

grant execute on function public.deduct_weekly_coins(integer, date) to authenticated;

commit;

-- Bảng kết quả sau khi chạy: số dư không đổi, doanh thu/lợi nhuận kỳ gần nhất có dữ liệu.
select
    teams.id as team_id,
    teams.name as team_name,
    teams.points as current_balance,
    settlements.income as settled_revenue,
    settlements.expense as settled_expense,
    settlements.profit as settled_profit,
    settlements.period_start,
    settlements.period_end
from public.teams as teams
left join lateral (
    select income, expense, profit, period_start, period_end
    from public.weekly_financial_settlements
    where team_id = teams.id
    order by period_start desc
    limit 1
) as settlements on true
order by teams.id;

-- Nhật ký vừa khôi phục để đối chiếu.
select team_id, type, title, amount, occurred_at
from public.coin_transactions
where title in (
    'Vốn ban đầu',
    'Admin cộng coin',
    'Admin cộng coin (khôi phục)',
    'Admin cộng coin (khôi phục doanh thu)',
    'Phí vận hành tuần'
)
order by occurred_at desc, team_id;
