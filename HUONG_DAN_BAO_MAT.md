# Hướng Dẫn Bảo Mật, Chống Mở F12 & Mã Hóa Làm Rối Mã Nguồn (JS Obfuscation)

Tài liệu này mô tả chi tiết các cơ chế an ninh thông tin đã được triển khai trên nhánh **`update/security-update`**.

---

## 1. Tổng quan Các Lớp Bảo Mật

Hệ thống được thiết kế theo mô hình phòng thủ theo chiều sâu (Defense-in-Depth) với 4 lớp bảo vệ:

```
[Người dùng / Trình duyệt]
           │
           ▼
[LỚP 1] Anti-DevTools & Anti-F12 Guard (Chặn phím tắt, chuột phải, bẫy debugger loop)
           │
           ▼
[LỚP 2] JS Obfuscate & RC4/Base64 Encryption (Làm rối mã nguồn, biến logic thành spaghetti hex)
           │
           ▼
[LỚP 3] HTTP Security Headers (Chống Clickjacking, MIME Sniffing, Frame Injection qua Vercel)
           │
           ▼
[LỚP 4] Supabase Row Level Security (RLS) Patch (Khóa sổ cái giao dịch tài chính đối với Anon)
```

---

## 2. Chi tiết Từng Lớp Bảo Vệ

### LỚP 1: Chống mở F12 & Khóa Công cụ Phát triển (Anti-DevTools)
File mã nguồn: [`scripts/security/securityGuard.js`](file:///Users/huy/QuanLy%20HTML/scripts/security/securityGuard.js)  
Bản mã hóa nhúng vào HTML: [`scripts/security/securityGuard.min.js`](file:///Users/huy/QuanLy%20HTML/scripts/security/securityGuard.min.js)

1. **Chặn phím tắt kiểm tra mã nguồn (Capture Phase)**:
   - `F12`: Vô hiệu hóa phím tắt mở DevTools.
   - `Ctrl+Shift+I` / `Cmd+Option+I`: Chặn mở cửa sổ Inspect Elements.
   - `Ctrl+Shift+J` / `Cmd+Option+J`: Chặn mở cửa sổ Console.
   - `Ctrl+Shift+C` / `Cmd+Option+C`: Chặn công cụ chọn phần tử.
   - `Ctrl+U` / `Cmd+Option+U`: Chặn chức năng Xem mã nguồn trang (View Source).
   - `Ctrl+S` / `Cmd+Option+S`: Chặn lưu trang web về máy tính.
   - Khi bấm phím bị cấm, hệ thống hiển thị thông báo toast: *"🛡️ Phím F12 / Thao tác đã bị vô hiệu hóa vì lý do an toàn."*

2. **Chặn menu chuột phải (Context Menu)**:
   - Vô hiệu hóa chuột phải trên toàn bộ trang để ngăn menu "Kiểm tra / Inspect".
   - Vẫn cho phép chuột phải bình thường tại các ô nhập liệu `<input>` và `<textarea>` để người dùng paste văn bản.

3. **Cơ chế bẫy Debugger Trap & phát hiện mở ngầm**:
   - Nếu người dùng cố tình mở DevTools thông qua menu trình duyệt (Menu Chrome > More Tools > Developer Tools):
     * **Đo thời gian thực thi**: Khi DevTools mở, lệnh `debugger` bị khựng lại hơn 100ms.
     * **Bẫy Debugger đệ quy liên tục**: Hệ thống tự động kích hoạt vòng lặp `(function(){}.constructor("debugger")())` khiến trình duyệt liên tục dừng lại, làm tê liệt khả năng debug hoặc trace code.
     * **Màn hình cảnh báo toàn trang**: Xuất hiện overlay cảnh báo an ninh màu tối yêu cầu đóng DevTools và tải lại trang.

4. **Bảo vệ Console**:
   - Làm sạch console tự động (`console.clear()`).
   - Hiển thị thông điệp cảnh báo đỏ: *"STOP! Trang web này được bảo vệ bởi cơ chế an ninh thông tin."*

5. **Chế độ dành cho Lập trình viên (Bypass Mode)**:
   - Nếu bạn là lập trình viên và cần mở DevTools để sửa lỗi trên máy của mình, bạn có thể kích hoạt cờ bypass trong `sessionStorage`:
     ```javascript
     sessionStorage.setItem("__ALLOW_DEVTOOLS__", "true");
     ```
     hoặc gọi:
     ```javascript
     __SECURITY_GUARD__.bypass("admin-debug-2026");
     ```
     Sau đó tải lại trang, DevTools sẽ không bị chặn nữa. Khi muốn bật lại bảo vệ:
     ```javascript
     sessionStorage.removeItem("__ALLOW_DEVTOOLS__");
     ```

---

### LỚP 2: Mã hóa làm rối mã nguồn JavaScript (JS Obfuscation & Encryption)
Công cụ: [`scripts/tools/obfuscate.js`](file:///Users/huy/QuanLy%20HTML/scripts/tools/obfuscate.js)

1. **Thuật toán & Cơ chế mã hóa**:
   - **Hexadecimal Identifier Mangling**: Toàn bộ tên biến, tham số, hàm nội bộ được đổi thành mã hex không thể đọc được (ví dụ `_0x4b1e`, `_0x89a1`).
   - **RC4 & Base64 String Encryption**: Tất cả chuỗi ký tự, URL, Supabase API key, thông báo, selector đều được trích xuất vào mảng chuỗi và mã hóa bằng thuật toán RC4 kết hợp Base64.
   - **Control Flow Flattening (Làm phẳng luồng điều khiển)**: Biến các luồng code tuần tự if-else thành cấu trúc switch-case dạng ma trận máy trạng thái, làm cho người dịch ngược (deobfuscator) không thể khôi phục lại logic ban đầu.
   - **Dead Code Injection**: Bơm các khối code giả để đánh lừa các công cụ phân tích tĩnh.
   - **Self-Defending**: Code tự bảo vệ; nếu ai đó cố dùng tính năng "Pretty Print" ({}) trong Chrome DevTools để format lại code, một hàm kiểm tra regex sẽ phát hiện và gây tràn stack/treo trình duyệt.
   - **Debug Protection**: Nhúng bẫy debugger định kỳ 2.5 giây trực tiếp vào các hàm đã mã hóa.

2. **Cách chạy mã hóa làm rối**:
   Chỉ cần chạy lệnh:
   ```bash
   npm run build:obfuscate
   ```
   hoặc:
   ```bash
   npm run build
   ```
   **Kết quả sinh ra**:
   - `scripts/security/securityGuard.min.js`: Bản mã hóa siêu bảo mật của module chống F12 (đã được nhúng trực tiếp vào các file HTML).
   - `dist/scripts/` & `dist/pages/`: Toàn bộ các file mã nguồn của dự án được mã hóa sang thư mục phân phối `dist/`.

---

### LỚP 3: Cấu hình HTTP Security Headers trên Vercel
File cấu hình: [`vercel.json`](file:///Users/huy/QuanLy%20HTML/vercel.json)

Đã bổ sung các header an ninh tiêu chuẩn:
- `X-Frame-Options: SAMEORIGIN`: Ngăn chặn website bị nhúng vào `<iframe>` của các trang web lừa đảo khác (chống tấn công Clickjacking).
- `X-Content-Type-Options: nosniff`: Ngăn chặn trình duyệt tự ý đoán sai định dạng file (chống MIME Sniffing attack).
- `Referrer-Policy: strict-origin-when-cross-origin`: Giới hạn thông tin đường dẫn gửi kèm khi điều hướng ra ngoài.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Vô hiệu hóa quyền truy cập phần cứng nhạy cảm.

---

### LỚP 4: Bản vá bảo mật Row Level Security (RLS) trên Supabase
File SQL: [`scripts/supabase/security_patch.sql`](file:///Users/huy/QuanLy%20HTML/scripts/supabase/security_patch.sql)  
File schema gốc đã cập nhật: [`scripts/supabase/schema.sql`](file:///Users/huy/QuanLy%20HTML/scripts/supabase/schema.sql)

1. **Lỗ hổng được khắc phục**:
   - Trước đây: Bảng `coin_transactions` và `weekly_financial_settlements` cấp quyền `SELECT` cho cả vai trò `anon`. Do đó bất kỳ ai có anon key đều có thể mở API đọc trộm toàn bộ nhật ký chi phí, doanh thu, lý do cộng trừ coin của các quán khác.
   - Bản vá:
     * Hủy bỏ quyền `SELECT` của vai trò `anon` trên 2 bảng tài chính này.
     * Chỉ cho phép vai trò `authenticated` (tài khoản Admin đã đăng nhập) đọc chi tiết nhật ký giao dịch và kết toán.
     * Các bảng công khai (`teams`, `members`, `orders`) vẫn mở cho `anon` để đảm bảo sinh viên xem được danh sách quán và điểm số thi đua bình thường.

2. **Cách áp dụng lên database Supabase**:
   - Bước 1: Mở Supabase Dashboard của dự án.
   - Bước 2: Chọn mục **SQL Editor**.
   - Bước 3: Mở file [`scripts/supabase/security_patch.sql`](file:///Users/huy/QuanLy%20HTML/scripts/supabase/security_patch.sql), copy toàn bộ nội dung và dán vào SQL Editor.
   - Bước 4: Nhấn nút **Run** để áp dụng bản vá ngay lập tức.
