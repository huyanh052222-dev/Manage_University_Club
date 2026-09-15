-- Chạy MỘT LẦN trên database đang vận hành trước khi deploy nhánh
-- update/financial-settlement-logs. Script không đổi teams.points hay số tiền.
-- Nó chỉ bổ sung lý do cho nhật ký cũ và tự gắn lý do cho các giao dịch hệ thống mới.

begin;

alter table public.coin_transactions
    add column if not exists reason text;

create or replace function public.fill_coin_transaction_reason()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.reason := nullif(btrim(coalesce(new.reason, '')), '');

    if new.reason is null then
        new.reason := case new.title
            when 'Phí vận hành tuần' then 'Hệ thống tự trừ chi phí vận hành đầu kỳ'
            when 'Vốn ban đầu' then 'Vốn khởi tạo; không tính vào doanh thu'
            when 'Admin cộng coin (khôi phục)' then 'Khôi phục doanh thu kỳ cũ từ số dư đã đối soát'
            when 'Admin cộng coin' then 'Giao dịch Admin cũ chưa có lý do'
            when 'Admin trừ coin' then 'Giao dịch Admin cũ chưa có lý do'
            else null
        end;
    end if;

    return new;
end;
$$;

drop trigger if exists fill_coin_transaction_reason_before_write on public.coin_transactions;
create trigger fill_coin_transaction_reason_before_write
before insert or update of title, reason on public.coin_transactions
for each row execute function public.fill_coin_transaction_reason();

-- Những dòng cũ cũng xuất hiện rõ lý do trong UI, không làm thay đổi amount/type/thời điểm.
update public.coin_transactions
set reason = case title
    when 'Phí vận hành tuần' then 'Hệ thống tự trừ chi phí vận hành đầu kỳ'
    when 'Vốn ban đầu' then 'Vốn khởi tạo; không tính vào doanh thu'
    when 'Admin cộng coin (khôi phục)' then 'Khôi phục doanh thu kỳ cũ từ số dư đã đối soát'
    when 'Admin cộng coin' then 'Giao dịch Admin cũ chưa có lý do'
    when 'Admin trừ coin' then 'Giao dịch Admin cũ chưa có lý do'
    else reason
end
where nullif(btrim(coalesce(reason, '')), '') is null;

commit;

-- Đối chiếu: giao dịch mới/cũ có title hệ thống phải có lý do.
select team_id, type, title, reason, amount, occurred_at
from public.coin_transactions
order by occurred_at desc, team_id
limit 50;
