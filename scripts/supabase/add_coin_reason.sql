-- Chạy MỘT LẦN trong Supabase SQL Editor trước khi deploy nhánh admin/update.
-- Toàn bộ thay đổi nằm trong một transaction: nếu có lỗi, PostgreSQL sẽ rollback.

begin;

alter table public.coin_transactions
    add column if not exists reason text;

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

comment on column public.coin_transactions.reason is
    'Lý do do Admin nhập khi cộng hoặc trừ coin thủ công.';

notify pgrst, 'reload schema';

commit;

-- Kết quả phải có cột reason và RPC với ba tham số team_id_in, points_to_add, reason_in.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
    and table_name = 'coin_transactions'
    and column_name = 'reason';

select routine_name, specific_name
from information_schema.routines
where routine_schema = 'public'
    and routine_name = 'add_points_to_team';
