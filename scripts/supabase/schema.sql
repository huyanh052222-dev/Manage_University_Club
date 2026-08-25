-- Run this script first in Supabase SQL Editor.
-- It creates the team/member model used by the student pages and Admin Panel.

create table if not exists public.teams (
    id text primary key,
    name text not null,
    points integer not null default 0
);

alter table public.teams
    add column if not exists icon text,
    add column if not exists color text,
    add column if not exists bg text,
    add column if not exists member_limit integer not null default 0,
    add column if not exists orders_completed integer not null default 0,
    add column if not exists orders_pending integer not null default 0,
    add column if not exists energy integer not null default 0,
    add column if not exists xp integer not null default 0,
    add column if not exists xp_target integer not null default 0,
    add column if not exists weekly_income integer not null default 0,
    add column if not exists weekly_expense integer not null default 0,
    add column if not exists updated_at timestamptz not null default now();

create table if not exists public.members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    team_id text references public.teams(id)
);

alter table public.members
    add column if not exists role text not null default 'Thành viên',
    add column if not exists attendance_status text;

update public.teams set icon = '🔥', color = '#FF5533', bg = '#FFE8E4' where id = 'A';
update public.teams set icon = '⚡', color = '#FFCC00', bg = '#FFF8E1' where id = 'B';
update public.teams set icon = '🌊', color = '#22C4A0', bg = '#E8FBF5' where id = 'C';
update public.teams set icon = '💜', color = '#7C5CFC', bg = '#F0EBFF' where id = 'D';
update public.teams set icon = '🍊', color = '#FF8C42', bg = '#FFF3EC' where id = 'E';
update public.teams set icon = '🌸', color = '#E83E8C', bg = '#FFE8F4' where id = 'F';
update public.teams set icon = '🍃', color = '#3A9E6C', bg = '#E8FBF0' where id = 'G';
update public.teams set icon = '🌙', color = '#5A6FCF', bg = '#EEF0FF' where id = 'H';

-- Landing page là trang công khai: chỉ cho phép đọc dữ liệu nhóm và thành viên.
alter table public.teams enable row level security;
alter table public.members enable row level security;

drop policy if exists "public_read_teams" on public.teams;
create policy "public_read_teams"
    on public.teams
    for select
    to anon, authenticated
    using (true);

drop policy if exists "public_read_members" on public.members;
create policy "public_read_members"
    on public.members
    for select
    to anon, authenticated
    using (true);

grant select on public.teams to anon, authenticated;
grant select on public.members to anon, authenticated;

create or replace function public.add_points_to_team(
    team_id_in text,
    points_to_add integer
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

    update public.teams
    set points = coalesce(points, 0) + points_to_add
    where id = team_id_in;
end;
$$;

revoke all on function public.add_points_to_team(text, integer) from public;
revoke all on function public.add_points_to_team(text, integer) from anon;
grant execute on function public.add_points_to_team(text, integer) to authenticated;
