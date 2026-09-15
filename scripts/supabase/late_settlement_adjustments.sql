-- Chạy MỘT LẦN trong Supabase SQL Editor trước khi deploy chức năng
-- "Chốt lại kỳ trễ". Toàn bộ script là một transaction.
--
-- Quy tắc:
-- 1) Coin đã cộng vào số dư trong tuần được hàm kết toán tuần tính tự động.
-- 2) Khi kỳ đã qua bị chậm, chỉ những coin vào ĐÃ TỒN TẠI mới được gán lại kỳ,
--    tuyệt đối không tạo coin mới hoặc sửa teams.points.
-- 3) Kết toán luôn cộng toàn bộ income có settlement_period_start trùng kỳ,
--    cộng thêm income bình thường phát sinh trong chính khoảng thời gian của kỳ.

begin;

alter table public.coin_transactions
    add column if not exists reason text,
    add column if not exists settlement_period_start date;

alter table public.coin_transactions
    drop constraint if exists coin_transactions_settlement_period_monday_check;

alter table public.coin_transactions
    add constraint coin_transactions_settlement_period_monday_check
    check (
        settlement_period_start is null
        or extract(isodow from settlement_period_start) = 1
    );

create index if not exists coin_transactions_settlement_period_idx
    on public.coin_transactions (team_id, settlement_period_start)
    where settlement_period_start is not null;

-- Bản trước từng có RPC cộng coin hồi tố. Loại bỏ nó để mục "kỳ trễ"
-- không thể làm thay đổi số dư; coin chỉ được cộng ở luồng Admin thông thường.
drop function if exists public.add_points_to_late_settlement(text, date, integer, text);

-- Tính doanh thu của một kỳ. Giao dịch được gán kỳ sẽ được ưu tiên hơn ngày phát sinh thật.
create or replace function public.get_settlement_income(
    team_id_in text,
    period_start_in date
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(sum(transactions.amount), 0)::integer
    from public.coin_transactions as transactions
    where transactions.team_id = team_id_in
        and transactions.type = 'income'
        and transactions.amount > 0
        and (
            transactions.settlement_period_start = period_start_in
            or (
                transactions.settlement_period_start is null
                and transactions.occurred_at >= (period_start_in::timestamp at time zone 'Asia/Ho_Chi_Minh')
                and transactions.occurred_at < ((period_start_in + 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
            )
        );
$$;

-- Tính lại một ảnh chụp kết toán. Nếu kỳ chưa có ảnh chụp, tạo ảnh chụp với
-- chi phí 200 + 20/nhân viên hiện tại; điều này được đánh dấu là dữ liệu hồi tố.
create or replace function public.refresh_late_financial_settlement(
    team_id_in text,
    period_start_in date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    current_week_start date;
    paid_staff_count integer;
    calculated_expense integer;
    calculated_income integer;
begin
    if auth.uid() is null or not coalesce(public.is_admin(), false) then
        raise exception 'admin access required';
    end if;

    current_week_start := ((now() at time zone 'Asia/Ho_Chi_Minh')::date
        - (extract(isodow from (now() at time zone 'Asia/Ho_Chi_Minh')::date)::integer - 1));

    if period_start_in is null
        or period_start_in < date '2026-08-31'
        or extract(isodow from period_start_in) <> 1
        or period_start_in + 7 > current_week_start then
        raise exception 'period must be a completed Monday-Sunday week';
    end if;

    if not exists (select 1 from public.teams where id = team_id_in) then
        raise exception 'team not found';
    end if;

    select count(members.id) filter (
        where lower(trim(coalesce(members.role, ''))) not in (
            'manage', 'manager', 'quản lý', 'quan ly', 'quản trị viên',
            'quan tri vien', 'trưởng nhóm', 'truong nhom', 'leader', 'admin'
        )
    )::integer
    into paid_staff_count
    from public.members as members
    where members.team_id = team_id_in;

    calculated_expense := 200 + (20 * coalesce(paid_staff_count, 0));
    calculated_income := public.get_settlement_income(team_id_in, period_start_in);

    insert into public.weekly_financial_settlements (
        team_id, period_start, period_end, income, expense, profit, member_count
    )
    values (
        team_id_in,
        period_start_in,
        period_start_in + 7,
        calculated_income,
        calculated_expense,
        calculated_income - calculated_expense,
        coalesce(paid_staff_count, 0)
    )
    on conflict (team_id, period_start) do update
    set income = excluded.income,
        profit = excluded.income - public.weekly_financial_settlements.expense,
        settled_at = now();
end;
$$;

-- Gán những coin vào đã tồn tại (ví dụ +103 và +93) vào một kỳ trễ.
-- Không sửa teams.points và không tạo dòng coin mới, nên không thể cộng trùng.
create or replace function public.assign_income_transactions_to_late_settlement(
    team_id_in text,
    period_start_in date,
    transaction_ids_in uuid[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    selected_count integer;
    eligible_count integer;
begin
    if auth.uid() is null or not coalesce(public.is_admin(), false) then
        raise exception 'admin access required';
    end if;

    selected_count := coalesce(array_length(transaction_ids_in, 1), 0);
    if selected_count = 0 then
        raise exception 'at least one income transaction is required';
    end if;

    if selected_count <> (select count(distinct transaction_id) from unnest(transaction_ids_in) as transaction_id) then
        raise exception 'duplicate transaction ids are not allowed';
    end if;

    -- Xác thực kỳ trước, đồng thời có thể tạo ảnh chụp kết toán nếu đang bị trễ.
    perform public.refresh_late_financial_settlement(team_id_in, period_start_in);

    select count(*)::integer
    into eligible_count
    from public.coin_transactions as transactions
    where transactions.id = any(transaction_ids_in)
        and transactions.team_id = team_id_in
        and transactions.type = 'income'
        and transactions.amount > 0
        and transactions.settlement_period_start is null
        and transactions.occurred_at >= ((period_start_in + 7)::timestamp at time zone 'Asia/Ho_Chi_Minh');

    if eligible_count <> selected_count then
        raise exception 'only unassigned income transactions created after the selected period can be assigned';
    end if;

    update public.coin_transactions
    set settlement_period_start = period_start_in
    where id = any(transaction_ids_in)
        and team_id = team_id_in;

    perform public.refresh_late_financial_settlement(team_id_in, period_start_in);
    return selected_count;
end;
$$;

revoke all on function public.get_settlement_income(text, date) from public;
revoke all on function public.refresh_late_financial_settlement(text, date) from public;
revoke all on function public.assign_income_transactions_to_late_settlement(text, date, uuid[]) from public;
revoke all on function public.assign_income_transactions_to_late_settlement(text, date, uuid[]) from anon;
grant execute on function public.refresh_late_financial_settlement(text, date) to authenticated;
grant execute on function public.assign_income_transactions_to_late_settlement(text, date, uuid[]) to authenticated;

comment on column public.coin_transactions.settlement_period_start is
    'Kỳ Thứ Hai được Admin gán cho giao dịch income hồi tố; giao dịch vẫn giữ thời điểm phát sinh thật.';

notify pgrst, 'reload schema';

commit;

-- Kiểm tra sau khi chạy: các income gán kỳ phải được tính vào đúng settlement.
select
    transactions.team_id,
    transactions.title,
    transactions.amount,
    transactions.occurred_at,
    transactions.settlement_period_start,
    settlements.income as settled_income,
    settlements.profit as settled_profit
from public.coin_transactions as transactions
left join public.weekly_financial_settlements as settlements
    on settlements.team_id = transactions.team_id
    and settlements.period_start = transactions.settlement_period_start
where transactions.settlement_period_start is not null
order by transactions.settlement_period_start desc, transactions.occurred_at desc;
