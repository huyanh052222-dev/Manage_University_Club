-- Chạy MỘT LẦN trong Supabase SQL Editor để tên mới đồng bộ trên Admin và Vercel.
-- Nếu không tìm thấy đủ team_id A và F, toàn bộ thay đổi sẽ tự rollback.

begin;

do $$
declare
    updated_count integer;
begin
    update public.teams
    set name = case id
        when 'A' then 'The Vortex Coffee'
        when 'F' then 'The Ora café'
    end,
    updated_at = now()
    where id in ('A', 'F');

    get diagnostics updated_count = row_count;

    if updated_count <> 2 then
        raise exception 'Expected teams A and F, but updated % row(s)', updated_count;
    end if;
end;
$$;

commit;

select id as team_id, name
from public.teams
where id in ('A', 'F')
order by id;
