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

alter table public.weekly_coin_deductions enable row level security;

drop policy if exists "admin" on public.weekly_coin_deductions;
create policy "admin" on public.weekly_coin_deductions
    as permissive
    for select
    to authenticated
    using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

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

    insert into public.weekly_coin_deductions (week_key, deduction_amount)
    values (week_key, deduction_amount)
    on conflict (week_key) do nothing;

    get diagnostics affected_rows = row_count;
    inserted := affected_rows > 0;

    if inserted then
        for team_record in select id, coalesce(points, 0) as points from public.teams
        loop
            actual_deduction := least(team_record.points, deduction_amount);

            update public.teams
            set points = team_record.points - actual_deduction
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
