-- Chạy một lần trong Supabase SQL Editor trước khi deploy giao diện đồng bộ sao.
-- Từ sau script này, số sao là dữ liệu chung trong public.teams, không còn lưu ở localStorage.

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
alter table public.teams
    add constraint teams_reputation_check check (reputation between 1 and 5);

-- Giữ lại mức sao demo đã được thống nhất trước đây, gồm Team B đã được
-- nâng thủ công lên 2 sao ở phiên bản localStorage cũ.
-- Chỉ nâng dữ liệu đang ở mức mặc định 1 sao, không hạ các mức cao hơn đã có.
update public.teams
set reputation = 2,
    updated_at = now()
where id in ('A', 'B', 'F', 'G', 'H')
  and reputation = 1;

create or replace function public.set_team_reputation(
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

    if reputation_in not between 1 and 5 then
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

revoke all on function public.set_team_reputation(text, integer) from public;
revoke all on function public.set_team_reputation(text, integer) from anon;
grant execute on function public.set_team_reputation(text, integer) to authenticated;

commit;

notify pgrst, 'reload schema';
