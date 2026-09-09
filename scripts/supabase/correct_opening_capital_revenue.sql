-- Chạy MỘT LẦN sau manual_coin_revenue.sql nếu khoản khôi phục cũ đã tính
-- cả 1.000 coin vốn ban đầu vào doanh thu. Script không thay đổi teams.points.
C
begin;

-- Ghi vốn ban đầu thành điều chỉnh số dư, không phải doanh thu.
with recovered_teams as (
    select distinct team_id
    from public.coin_transactions
    where type = 'income'
        and title = 'Admin cộng coin (khôi phục)'
)
insert into public.coin_transactions (team_id, type, title, amount, occurred_at)
select
    recovered.team_id,
    'adjustment',
    'Vốn ban đầu',
    1000,
    coalesce(
        (
            select settlements.period_start::timestamp at time zone 'Asia/Ho_Chi_Minh'
            from public.weekly_financial_settlements as settlements
            where settlements.team_id = recovered.team_id
            order by settlements.period_start asc
            limit 1
        ),
        (date '2026-08-30')::timestamp at time zone 'Asia/Ho_Chi_Minh'
    )
from recovered_teams as recovered
where not exists (
        select 1
        from public.coin_transactions as capital
        where capital.team_id = recovered.team_id
            and capital.title = 'Vốn ban đầu'
    );

-- Nếu tổng khôi phục không vượt vốn thì không có doanh thu dương để giữ lại.
delete from public.coin_transactions
where type = 'income'
    and title = 'Admin cộng coin (khôi phục)'
    and amount <= 1000;

-- Phần vượt trên 1.000 mới là coin Admin cộng, tức doanh thu thực của tuần.
update public.coin_transactions
set amount = amount - 1000,
    title = 'Admin cộng coin (khôi phục doanh thu)'
where type = 'income'
    and title = 'Admin cộng coin (khôi phục)'
    and amount > 1000;

-- Tính lại doanh thu và lợi nhuận của mọi kỳ đã chốt.
with recalculated as (
    select
        settlements.id,
        coalesce(sum(transactions.amount) filter (
            where transactions.type = 'income' and transactions.amount > 0
        ), 0)::integer as income
    from public.weekly_financial_settlements as settlements
    left join public.coin_transactions as transactions
        on transactions.team_id = settlements.team_id
        and transactions.occurred_at >= (settlements.period_start::timestamp at time zone 'Asia/Ho_Chi_Minh')
        and transactions.occurred_at < (settlements.period_end::timestamp at time zone 'Asia/Ho_Chi_Minh')
    group by settlements.id
)
update public.weekly_financial_settlements as settlements
set income = recalculated.income,
    profit = recalculated.income - settlements.expense,
    settled_at = now()
from recalculated
where settlements.id = recalculated.id;

commit;

-- Kết quả đối chiếu: tiền mặt = vốn + doanh thu - chi phí.
select
    teams.id as team_id,
    teams.name as team_name,
    teams.points as current_balance,
    coalesce(capital.amount, 0) as opening_capital,
    settlements.income as settled_revenue,
    settlements.expense as settled_expense,
    settlements.profit as settled_profit,
    coalesce(capital.amount, 0) + settlements.income - settlements.expense as calculated_balance
from public.teams as teams
left join lateral (
    select amount
    from public.coin_transactions
    where team_id = teams.id and title = 'Vốn ban đầu'
    order by occurred_at asc
    limit 1
) as capital on true
left join lateral (
    select income, expense, profit
    from public.weekly_financial_settlements
    where team_id = teams.id
    order by period_start desc
    limit 1
) as settlements on true
order by teams.id;
