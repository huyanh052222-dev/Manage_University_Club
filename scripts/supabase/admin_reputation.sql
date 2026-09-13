-- Chạy MỘT LẦN trong Supabase SQL Editor trước khi dùng mục "Quản lý sao".
-- Migration chỉ thêm/củng cố cột reputation và RPC dành cho Admin.

begin;

alter table public.teams
    add column if not exists reputation integer not null default 1,
    add column if not exists updated_at timestamptz not null default now();

update public.teams
set reputation = 1
where reputation is null or reputation < 1 or reputation > 5;

alter table public.teams alter column reputation set default 1;
alter table public.teams alter column reputation set not null;
alter table public.teams drop constraint if exists teams_reputation_check;
alter table public.teams add constraint teams_reputation_check check (reputation between 1 and 5);

create or replace function public.update_team_reputation(
    team_id_in text,
    reputation_in integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    saved_reputation integer;
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    if not coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) then
        raise exception 'admin access required';
    end if;

    if reputation_in is null or reputation_in < 1 or reputation_in > 5 then
        raise exception 'reputation must be between 1 and 5';
    end if;

    update public.teams
    set reputation = reputation_in,
        updated_at = now()
    where id = team_id_in
    returning reputation into saved_reputation;

    if not found then
        raise exception 'team not found';
    end if;

    return saved_reputation;
end;
$$;

revoke all on function public.update_team_reputation(text, integer) from public;
revoke all on function public.update_team_reputation(text, integer) from anon;
grant execute on function public.update_team_reputation(text, integer) to authenticated;

commit;

select id, name, reputation
from public.teams
order by id;
