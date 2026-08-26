-- Run this script once in Supabase SQL Editor.
-- It makes the weekly deduction idempotent: a week can only be charged once.

-- The login code expects this function to return true for admin users.
-- Set the user's app_metadata.role to "admin" in Supabase Auth.
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

create table if not exists public.weekly_coin_deductions (
    week_key date primary key,
    deduction_amount integer not null,
    created_at timestamptz not null default now()
);

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

alter table public.weekly_coin_deductions enable row level security;
alter table public.weekly_financial_settlements enable row level security;

drop policy if exists "admin" on public.weekly_coin_deductions;
create policy "admin" on public.weekly_coin_deductions
    as permissive
    for select
    to authenticated
    using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

drop policy if exists "public_read_weekly_financial_settlements" on public.weekly_financial_settlements;
create policy "public_read_weekly_financial_settlements"
    on public.weekly_financial_settlements
    for select
    to anon, authenticated
    using (true);

grant select on public.weekly_financial_settlements to anon, authenticated;

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

    if week_key < date '2026-08-30' then
        raise exception 'week_key is before the cafe opening date';
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
            -- Quản lý/trưởng nhóm không nhận lương; chỉ nhân viên được tính 20 coin/người.
            weekly_cost := deduction_amount + (20 * team_record.paid_staff_count);

            -- Khi mở tuần mới, chốt doanh thu và chi phí của chu kỳ 7 ngày vừa kết thúc.
            if week_key > date '2026-08-30' then
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
                on conflict (team_id, period_start) do nothing;
            end if;

            actual_deduction := least(team_record.points, weekly_cost);

            update public.teams
            set points = team_record.points - actual_deduction,
                weekly_income = 0,
                weekly_expense = 0,
                updated_at = now()
            where id = team_record.id;

            if actual_deduction > 0 then
                insert into public.coin_transactions (team_id, type, title, amount)
                values (team_record.id, 'expense', 'Phí vận hành tuần', -actual_deduction);
            end if;
        end loop;
    end if;

    return inserted;
end;
$$;

grant execute on function public.deduct_weekly_coins(integer, date) to authenticated;
