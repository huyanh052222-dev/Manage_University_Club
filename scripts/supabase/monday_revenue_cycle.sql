-- Chạy MỘT LẦN trong Supabase SQL Editor TRƯỚC KHI deploy frontend mới.
-- Chuyển chu kỳ cũ Chủ nhật–Thứ bảy sang Thứ hai–Chủ nhật mà không trừ coin lại.

begin;

-- Giữ tương thích với database đã chuyển chu kỳ nhưng chưa có cột lý do.
alter table public.coin_transactions
    add column if not exists reason text;

-- Dừng an toàn nếu database đã có đồng thời cả mốc Chủ nhật cũ và Thứ hai mới.
-- Trường hợp này có thể là đã bị trừ hai lần và cần đối soát thủ công trước khi tiếp tục.
do $$
begin
    if exists (
        select 1
        from public.weekly_coin_deductions as sunday_cycle
        join public.weekly_coin_deductions as monday_cycle
            on monday_cycle.week_key = sunday_cycle.week_key + 1
        where extract(isodow from sunday_cycle.week_key) = 7
    ) then
        raise exception 'both Sunday and Monday deduction markers exist; review possible duplicate deduction first';
    end if;

    if exists (
        select 1
        from public.weekly_financial_settlements as sunday_period
        join public.weekly_financial_settlements as monday_period
            on monday_period.team_id = sunday_period.team_id
            and monday_period.period_start = sunday_period.period_start + 1
        where extract(isodow from sunday_period.period_start) = 7
    ) then
        raise exception 'both Sunday and Monday settlements exist; review overlapping periods first';
    end if;
end;
$$;

-- Chỉ dời khóa chu kỳ, không tạo giao dịch chi phí mới và không đổi teams.points.
update public.weekly_coin_deductions
set week_key = week_key + 1
where extract(isodow from week_key) = 7;

update public.weekly_financial_settlements
set period_start = period_start + 1,
    period_end = period_end + 1,
    settled_at = now()
where extract(isodow from period_start) = 7;

-- Tính lại doanh thu/lợi nhuận theo [Thứ hai 00:00, Thứ hai kế tiếp 00:00).
with recalculated as (
    select
        settlements.id,
        coalesce(sum(transactions.amount) filter (
            where transactions.type = 'income' and transactions.amount > 0
        ), 0)::integer as income
    from public.weekly_financial_settlements as settlements
    left join public.coin_transactions as transactions
        on transactions.team_id = settlements.team_id
        and transactions.occurred_at >= (settlements.period_start::timestamp at time zone 'Asia/Ho_Chi_Minh')
        and transactions.occurred_at < (settlements.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh')
    where extract(isodow from settlements.period_start) = 1
    group by settlements.id
)
update public.weekly_financial_settlements as settlements
set income = recalculated.income,
    profit = recalculated.income - settlements.expense,
    settled_at = now()
from recalculated
where settlements.id = recalculated.id;

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
grant select on public.weekly_coin_deductions to authenticated;

commit;

-- Kết quả đối chiếu: mọi week_key/period_start phải là Thứ hai (isodow = 1).
select week_key, extract(isodow from week_key) as iso_day, deduction_amount
from public.weekly_coin_deductions
order by week_key desc;

select team_id, period_start, period_end, income, expense, profit
from public.weekly_financial_settlements
order by period_start desc, team_id;
