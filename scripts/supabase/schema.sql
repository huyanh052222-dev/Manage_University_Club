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
    add column if not exists bg text;

create table if not exists public.members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    team_id text references public.teams(id)
);

update public.teams set icon = '🔥', color = '#FF5533', bg = '#FFE8E4' where id = 'A';
update public.teams set icon = '⚡', color = '#FFCC00', bg = '#FFF8E1' where id = 'B';
update public.teams set icon = '🌊', color = '#22C4A0', bg = '#E8FBF5' where id = 'C';
update public.teams set icon = '💜', color = '#7C5CFC', bg = '#F0EBFF' where id = 'D';
update public.teams set icon = '🍊', color = '#FF8C42', bg = '#FFF3EC' where id = 'E';
update public.teams set icon = '🌸', color = '#E83E8C', bg = '#FFE8F4' where id = 'F';
update public.teams set icon = '🍃', color = '#3A9E6C', bg = '#E8FBF0' where id = 'G';
update public.teams set icon = '🌙', color = '#5A6FCF', bg = '#EEF0FF' where id = 'H';

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
