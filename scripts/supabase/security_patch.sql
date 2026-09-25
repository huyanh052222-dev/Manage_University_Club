-- ====================================================================
-- SUPABASE SECURITY PATCH: Khóa lỗ hổng rò rỉ dữ liệu tài chính qua Anon
-- Chạy script này trong Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Bật Row Level Security (RLS) bắt buộc trên các bảng nhạy cảm
alter table if exists public.coin_transactions enable row level security;
alter table if exists public.weekly_financial_settlements enable row level security;

-- 2. Hủy quyền đọc trực tiếp bảng nhật ký coin của vai trò công khai (anon)
revoke select on public.coin_transactions from anon;
revoke select on public.weekly_financial_settlements from anon;

-- 3. Xóa các policy cũ cho phép anon đọc tất cả nhật ký
drop policy if exists "public_read_coin_transactions" on public.coin_transactions;
drop policy if exists "public_read_weekly_financial_settlements" on public.weekly_financial_settlements;

-- 4. Tạo policy bảo mật mới: Chỉ tài khoản đã đăng nhập (authenticated / admin)
-- mới được phép đọc sổ cái giao dịch và kết toán tài chính chi tiết
create policy "authenticated_read_coin_transactions"
    on public.coin_transactions
    for select
    to authenticated
    using (true);

create policy "authenticated_read_weekly_financial_settlements"
    on public.weekly_financial_settlements
    for select
    to authenticated
    using (true);

-- Đảm bảo chỉ authenticated có quyền SELECT
grant select on public.coin_transactions to authenticated;
grant select on public.weekly_financial_settlements to authenticated;

-- 5. Đảm bảo các bảng công khai cần thiết cho sinh viên xem (Teams, Members, Orders) vẫn hoạt động bình thường
grant select on public.teams to anon, authenticated;
grant select on public.members to anon, authenticated;
grant select on public.orders to anon, authenticated;
grant select on public.order_completions to anon, authenticated;

-- Hoàn tất patch bảo mật.
