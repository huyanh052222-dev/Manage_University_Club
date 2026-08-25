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

-- Đơn hàng có thể áp dụng cho một nhóm cụ thể hoặc cho tất cả nhóm khi team_id là null.
create table if not exists public.orders (
    id text primary key,
    team_id text references public.teams(id) on delete cascade,
    title text not null,
    description text not null default '',
    requirements text not null default '',
    source_url text not null default '#',
    reward integer not null default 0 check (reward >= 0),
    deadline timestamptz,
    status text not null default 'available',
    progress_mode text not null default 'live' check (progress_mode in ('live', 'demo')),
    demo_progress integer not null default 0 check (demo_progress between 0 and 100),
    icon text not null default 'code',
    tone text not null default 'purple',
    created_at timestamptz not null default now()
);

-- Cho phép chạy lại migration trên database đã tạo bảng orders từ phiên bản trước.
alter table public.orders
    add column if not exists progress_mode text not null default 'live',
    add column if not exists demo_progress integer not null default 0;

-- Một thành viên chỉ có một lần hoàn thành cho mỗi đơn hàng.
create table if not exists public.order_completions (
    order_id text not null references public.orders(id) on delete cascade,
    member_id uuid not null references public.members(id) on delete cascade,
    completed_at timestamptz not null default now(),
    primary key (order_id, member_id)
);

-- Mọi biến động số dư được lưu trong một sổ cái chung để Landing và Admin đọc cùng dữ liệu.
create table if not exists public.coin_transactions (
    id uuid primary key default gen_random_uuid(),
    team_id text not null references public.teams(id) on delete cascade,
    order_id text references public.orders(id) on delete set null,
    type text not null check (type in ('income', 'expense', 'adjustment')),
    title text not null,
    amount integer not null check (amount <> 0),
    occurred_at timestamptz not null default now()
);

create index if not exists coin_transactions_team_occurred_at_idx
    on public.coin_transactions (team_id, occurred_at desc);

-- Đơn demo: deadline được tính một ngày kể từ lần đầu chạy migration.
insert into public.orders (
    id,
    team_id,
    title,
    description,
    requirements,
    source_url,
    reward,
    deadline,
    status,
    progress_mode,
    demo_progress,
    icon,
    tone
)
values (
    'c-hello-world',
    null,
    'Bài tập C cơ bản: Hello World',
    'Viết chương trình C đầu tiên sử dụng printf để in lời chào.',
    'Tạo tệp main.c, sử dụng hàm printf và in chính xác dòng: Hello, World!',
    '#',
    240,
    now() + interval '1 day',
    'available',
    'demo',
    20,
    'code',
    'purple'
)
on conflict (id) do update
set progress_mode = excluded.progress_mode,
    demo_progress = excluded.demo_progress;

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
alter table public.orders enable row level security;
alter table public.order_completions enable row level security;
alter table public.coin_transactions enable row level security;

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

drop policy if exists "public_read_orders" on public.orders;
create policy "public_read_orders"
    on public.orders
    for select
    to anon, authenticated
    using (true);

drop policy if exists "public_read_order_completions" on public.order_completions;
create policy "public_read_order_completions"
    on public.order_completions
    for select
    to anon, authenticated
    using (true);

drop policy if exists "public_read_coin_transactions" on public.coin_transactions;
create policy "public_read_coin_transactions"
    on public.coin_transactions
    for select
    to anon, authenticated
    using (true);

grant select on public.teams to anon, authenticated;
grant select on public.members to anon, authenticated;
grant select on public.orders to anon, authenticated;
grant select on public.order_completions to anon, authenticated;
grant select on public.coin_transactions to anon, authenticated;

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

    if points_to_add = 0 then
        raise exception 'points_to_add must not be zero';
    end if;

    update public.teams
    set points = coalesce(points, 0) + points_to_add
    where id = team_id_in;

    if not found then
        raise exception 'team not found';
    end if;

    insert into public.coin_transactions (team_id, type, title, amount)
    values (
        team_id_in,
        'adjustment',
        case when points_to_add > 0 then 'Admin cộng coin' else 'Admin trừ coin' end,
        points_to_add
    );
end;
$$;

revoke all on function public.add_points_to_team(text, integer) from public;
revoke all on function public.add_points_to_team(text, integer) from anon;
grant execute on function public.add_points_to_team(text, integer) to authenticated;
