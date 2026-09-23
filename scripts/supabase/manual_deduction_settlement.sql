-- Chạy một lần SAU late_settlement_adjustments.sql trong Supabase SQL Editor.
-- Sửa việc các lần "Admin trừ coin" không được phản ánh vào chi phí kết toán.
-- Script không đổi teams.points và không tạo giao dịch coin mới.

begin;

-- Chuẩn hóa các lần trừ thủ công cũ. Chỉ đổi nhãn loại giao dịch, không đổi
-- số tiền, thời điểm hay số dư; nhờ đó Nhật ký cũng hiển thị đúng là Coin ra.
update public.coin_transactions
set type = 'expense'
where type = 'adjustment'
  and amount < 0
  and title = 'Admin trừ coin';

-- Chi phí bổ sung là khoản Admin trừ coin. Phí vận hành tuần đã được tính bởi
-- công thức cố định 200 + 20 x nhân viên, nên phải loại ra để không tính hai lần.
create or replace function public.get_settlement_manual_expense(
    team_id_in text,
    period_start_in date
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(sum(abs(transactions.amount)), 0)::integer
    from public.coin_transactions as transactions
    where transactions.team_id = team_id_in
        and transactions.amount < 0
        and (
            (transactions.type = 'expense' and transactions.title <> 'Phí vận hành tuần')
            or (transactions.type = 'adjustment' and transactions.title = 'Admin trừ coin')
        )
        and (
            transactions.settlement_period_start = period_start_in
            or (
                transactions.settlement_period_start is null
                and transactions.occurred_at >= (period_start_in::timestamp at time zone 'Asia/Ho_Chi_Minh')
                and transactions.occurred_at < ((period_start_in + 7)::timestamp at time zone 'Asia/Ho_Chi_Minh')
            )
        );
$$;

-- Chốt/tính lại một kỳ trễ: chi phí cố định + mọi khoản Admin trừ coin của kỳ.
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

    calculated_income := public.get_settlement_income(team_id_in, period_start_in);
    calculated_expense := 200
        + (20 * coalesce(paid_staff_count, 0))
        + public.get_settlement_manual_expense(team_id_in, period_start_in);

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
        expense = excluded.expense,
        profit = excluded.income - excluded.expense,
        member_count = excluded.member_count,
        settled_at = now();
end;
$$;

-- Kỳ được Admin chọn áp dụng cho cả cộng lẫn trừ. Cộng là doanh thu, trừ là
-- chi phí bổ sung; số dư chỉ thay đổi đúng một lần.
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

    if points_to_add is null or points_to_add = 0 then
        raise exception 'points_to_add must not be zero';
    end if;

    if nullif(btrim(coalesce(reason_in, '')), '') is null then
        raise exception 'reason is required';
    end if;

    if char_length(btrim(reason_in)) > 200 then
        raise exception 'reason must not exceed 200 characters';
    end if;

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
        case when points_to_add > 0 then 'income' else 'expense' end,
        case when points_to_add > 0 then 'Admin cộng coin' else 'Admin trừ coin' end,
        btrim(reason_in),
        points_to_add,
        settlement_period_start_in
    );

    perform public.refresh_late_financial_settlement(team_id_in, settlement_period_start_in);
end;
$$;

-- Trừ coin trong tuần hiện tại cũng là một chi phí; các bản ghi cũ vẫn được
-- hàm phía trên nhận diện bằng title nên không cần sửa lịch sử giao dịch.
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
    if auth.uid() is null or not coalesce(public.is_admin(), false) then
        raise exception 'admin access required';
    end if;

    if points_to_add is null or points_to_add = 0 then
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
        case when points_to_add > 0 then 'income' else 'expense' end,
        case when points_to_add > 0 then 'Admin cộng coin' else 'Admin trừ coin' end,
        btrim(reason_in),
        points_to_add
    );
end;
$$;

-- Tính lại mọi kỳ đã có. member_count trong ảnh chụp cũ được giữ nguyên để
-- không lấy nhầm danh sách nhân sự hiện tại cho một tuần trong quá khứ.
with recalculated as (
    select
        settlements.id,
        public.get_settlement_income(settlements.team_id, settlements.period_start) as income,
        200
            + (20 * coalesce(settlements.member_count, 0))
            + public.get_settlement_manual_expense(settlements.team_id, settlements.period_start) as expense
    from public.weekly_financial_settlements as settlements
)
update public.weekly_financial_settlements as settlements
set income = recalculated.income,
    expense = recalculated.expense,
    profit = recalculated.income - recalculated.expense,
    settled_at = now()
from recalculated
where settlements.id = recalculated.id;

revoke all on function public.get_settlement_manual_expense(text, date) from public;
revoke all on function public.get_settlement_manual_expense(text, date) from anon;
revoke all on function public.refresh_late_financial_settlement(text, date) from public;
revoke all on function public.refresh_late_financial_settlement(text, date) from anon;
revoke all on function public.add_points_to_team_for_settlement_period(text, integer, text, date) from public;
revoke all on function public.add_points_to_team_for_settlement_period(text, integer, text, date) from anon;
revoke all on function public.add_points_to_team(text, integer, text) from public;
revoke all on function public.add_points_to_team(text, integer, text) from anon;
grant execute on function public.refresh_late_financial_settlement(text, date) to authenticated;
grant execute on function public.add_points_to_team_for_settlement_period(text, integer, text, date) to authenticated;
grant execute on function public.add_points_to_team(text, integer, text) to authenticated;

commit;

notify pgrst, 'reload schema';
