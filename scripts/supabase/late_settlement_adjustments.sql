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

-- Thay thế hàm chốt tuần để một giao dịch đã được gán cho kỳ cũ không bị
-- tính lần nữa vào tuần có thời điểm nhập liệu. Đây là phần bảo đảm doanh thu
-- tuần hiện tại về 0 sau khi Admin chọn một kỳ cũ cho khoản cộng coin.
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

    if week_key < date '2026-08-31' or extract(isodow from week_key) <> 1 then
        raise exception 'week_key must be a Monday on or after 2026-08-31';
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
                        'manage', 'manager', 'quản lý', 'quan ly', 'quản trị viên',
                        'quan tri vien', 'trưởng nhóm', 'truong nhom', 'leader', 'admin'
                    )
                )::integer as paid_staff_count
            from public.teams as teams
            left join public.members as members on members.team_id = teams.id
            group by teams.id, teams.points
        loop
            weekly_cost := deduction_amount + (20 * team_record.paid_staff_count);

            if week_key > date '2026-08-31' then
                previous_week_start := week_key - 7;
                settled_income := public.get_settlement_income(team_record.id, previous_week_start);

                insert into public.weekly_financial_settlements (
                    team_id, period_start, period_end, income, expense, profit, member_count
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
                on conflict (team_id, period_start) do update
                set period_end = excluded.period_end,
                    income = excluded.income,
                    expense = excluded.expense,
                    profit = excluded.profit,
                    member_count = excluded.member_count,
                    settled_at = now();
            end if;

            actual_deduction := least(team_record.points, weekly_cost);

            update public.teams
            set points = team_record.points - actual_deduction,
                weekly_income = 0,
                weekly_expense = 0,
                updated_at = now()
            where id = team_record.id;

            if actual_deduction > 0 then
                insert into public.coin_transactions (team_id, type, title, reason, amount)
                values (
                    team_record.id,
                    'expense',
                    'Phí vận hành tuần',
                    'Hệ thống tự trừ chi phí vận hành cho tuần bắt đầu ' || to_char(week_key, 'DD/MM/YYYY'),
                    -actual_deduction
                );
            end if;
        end loop;
    end if;

    return inserted;
end;
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

-- Luồng cộng coin THÔNG THƯỜNG có thể chọn một kỳ đã hoàn tất. Số dư chỉ
-- tăng một lần; giao dịch income mới được gắn kỳ ngay khi tạo để doanh thu
-- tuần hiện tại không nhận nhầm khoản này.
create or replace function public.add_points_to_team_for_settlement_period(
    team_id_in text,
    points_to_add integer,
    reason_in text,
    settlement_period_start_in date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null or not coalesce(public.is_admin(), false) then
        raise exception 'admin access required';
    end if;

    if points_to_add is null or points_to_add <= 0 then
        raise exception 'points_to_add must be positive for a settlement period';
    end if;

    if nullif(btrim(coalesce(reason_in, '')), '') is null then
        raise exception 'reason is required';
    end if;

    if char_length(btrim(reason_in)) > 200 then
        raise exception 'reason must not exceed 200 characters';
    end if;

    -- Xác thực kỳ đã hoàn tất và lấy lại ảnh chụp trước khi ghi giao dịch.
    perform public.refresh_late_financial_settlement(team_id_in, settlement_period_start_in);

    update public.teams
    set points = coalesce(points, 0) + points_to_add,
        updated_at = now()
    where id = team_id_in;

    if not found then
        raise exception 'team not found';
    end if;

    insert into public.coin_transactions (
        team_id, type, title, reason, amount, settlement_period_start
    )
    values (
        team_id_in,
        'income',
        'Admin cộng coin',
        btrim(reason_in),
        points_to_add,
        settlement_period_start_in
    );

    perform public.refresh_late_financial_settlement(team_id_in, settlement_period_start_in);
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
    target_week_number integer;
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
    target_week_number := ((period_start_in - date '2026-08-31') / 7) + 1;

    select count(*)::integer
    into eligible_count
    from public.coin_transactions as transactions
    where transactions.id = any(transaction_ids_in)
        and transactions.team_id = team_id_in
        and transactions.type = 'income'
        and transactions.amount > 0
        and transactions.settlement_period_start is null
        and transactions.occurred_at >= ((period_start_in + 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
        and (
            regexp_match(
                concat_ws(' ', transactions.title, transactions.reason),
                '(tuần|tuan)[[:space:]]*([0-9]+)',
                'i'
            ) is null
            or (
                regexp_match(
                    concat_ws(' ', transactions.title, transactions.reason),
                    '(tuần|tuan)[[:space:]]*([0-9]+)',
                    'i'
                )
            )[2]::integer = target_week_number
        );

    if eligible_count <> selected_count then
        raise exception 'only unassigned income for the selected week can be assigned';
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
revoke all on function public.add_points_to_team_for_settlement_period(text, integer, text, date) from public;
revoke all on function public.assign_income_transactions_to_late_settlement(text, date, uuid[]) from anon;
revoke all on function public.add_points_to_team_for_settlement_period(text, integer, text, date) from anon;
grant execute on function public.refresh_late_financial_settlement(text, date) to authenticated;
grant execute on function public.assign_income_transactions_to_late_settlement(text, date, uuid[]) to authenticated;
grant execute on function public.add_points_to_team_for_settlement_period(text, integer, text, date) to authenticated;

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
