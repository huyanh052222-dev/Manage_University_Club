# Cafe Horizon Dashboard Demo

Dashboard vận hành quán café sinh viên, dựng theo phong cách sáng và ấm với dữ liệu minh họa.

## Chạy dự án

Dự án dùng HTML/CSS/JavaScript thuần, không cần cài package:

```bash
python3 -m http.server 4173
```

Sau đó mở:

- Landing công khai: `http://localhost:4173/`
- Admin đăng nhập riêng: `http://localhost:4173/pages/admin/login.html`

Khi deploy Vercel, `vercel.json` ánh xạ thành:

- Landing: `https://<project>.vercel.app/`
- Nhóm A: `https://<project>.vercel.app/cafe/zzhaSdhdaskMZkasdojASDU00129`
- Nhóm B: `https://<project>.vercel.app/cafe/zzhaSdhdbskMZkasdojASDV00821`
- Nhóm C: `https://<project>.vercel.app/cafe/zzhbSdhdaskNZkasdojASDU00492`
- Nhóm D: `https://<project>.vercel.app/cafe/zzhaSdhdaSkMZkbsdojASDU00714`
- Nhóm E: `https://<project>.vercel.app/cafe/zzhaSdhdaskMZkbsdojBSDU00387`
- Nhóm F: `https://<project>.vercel.app/cafe/zzhaSdhdbskNZkasdojASDU00953`
- Nhóm G: `https://<project>.vercel.app/cafe/zzhbSdhdaSkMZkasdojASDV00640`
- Nhóm H: `https://<project>.vercel.app/cafe/zzhaSdhdaskNZkbsdojBSDU00276`
- Admin: `https://<project>.vercel.app/admin`
- Admin dashboard sau đăng nhập: `https://<project>.vercel.app/admin/dashboard`

## Cấu trúc

```text
.
├── index.html
├── styles/
│   ├── index.css       # Điểm vào và thứ tự import
│   ├── tokens.css      # Design tokens
│   ├── base.css        # Reset và style nền
│   ├── layout.css      # Bố cục trang
│   ├── components.css  # Component UI
│   ├── auth.css        # Giao diện đăng nhập Admin
│   ├── member-directory.css # Danh sách hồ sơ thành viên
│   └── responsive.css  # Breakpoint responsive
├── assets/images/      # Ảnh hero Cafe Horizon
├── pages/admin/        # Admin Panel dùng dữ liệu Supabase
└── scripts/
    ├── main.js         # Entry: mount page rồi khởi tạo ứng dụng
    ├── app.js          # Điều phối dữ liệu, điều hướng và tương tác
    ├── pages/          # Page component cấp cao
    │   └── cafePage.js # Khung hiển thị Cafe Horizon
    ├── data/           # Store dùng chung và giá trị mặc định
    ├── components/     # Hàm render từng module giao diện
    ├── services/       # Xác thực Supabase và nghiệp vụ số dư coin
    ├── supabase/       # Client Supabase và migration SQL
    ├── ui/             # Modal, toast và feedback
    └── utils/          # Hàm định dạng dùng chung
```

## Luồng dữ liệu

Landing: `index.html` → `main.js` → `pages/cafePage.js` → `app.js` → `services/dashboardData.js` → Supabase → store dùng chung → component → DOM.

Admin: `pages/admin/login.html` → `login.js` → Supabase Auth → `pages/admin/admin.html` → `admin.js`.

`index.html` chỉ giữ điểm mount `#app`. Landing đọc công khai `teams` và `members` từ Supabase nhưng không yêu cầu đăng nhập và không liên kết sang Admin. Luồng xác thực chỉ tồn tại trong entry point riêng của Admin.

Landing mặc định đọc nhóm `A`. Trên Vercel, tám endpoint dùng token opaque, phân biệt hoa–thường và ánh xạ nội bộ tới `team_id` A–H. Bộ phân giải đường dẫn chấp nhận cả token thường lẫn token được percent-encode đúng chuẩn. Query string cũ như `/?team=B` vẫn được hỗ trợ khi chạy local. Toàn bộ tên nhóm, số coin và danh sách nhân sự trên trang đều được hydrate từ cùng một lần tải dữ liệu. Khi bảng chưa có dòng, truy vấn thất bại hoặc cột mở rộng chưa có dữ liệu, các chỉ số liên quan giữ giá trị `0`.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Tuần vận hành được tính từ ngày mở bán `30/08/2026`: ngày này là ngày 1 của tuần 1, cứ đủ 7 ngày sẽ tăng một tuần.

## Supabase

`teams.points` là số dư coin dùng chung giữa Landing và Admin. `members.team_id` là nguồn danh sách và số lượng nhân sự. `orders` là nguồn danh sách đơn hàng; đơn có `team_id = null` hiển thị cho mọi nhóm, còn đơn có `team_id` chỉ hiển thị ở endpoint của nhóm tương ứng. `order_completions` liên kết thành viên với đơn đã hoàn thành để tính tỷ lệ trên tổng thành viên của tất cả quán. Bản demo có đơn `c-hello-world`, nguồn `#`, thưởng `240 coin`, deadline sau một ngày và tiến độ mẫu `20%`.

`coin_transactions` là sổ cái biến động coin. Nhật ký, tổng coin vào/ra, lợi nhuận tuần và các số liệu tài chính trên Landing đều được tính từ cùng bảng này. Khi chưa có giao dịch, danh sách trống và toàn bộ tổng số hiển thị `0 coin`. RPC `add_points_to_team` cập nhật `teams.points` và ghi nhật ký trong cùng một giao dịch SQL.

Chạy `scripts/supabase/schema.sql` để bổ sung các bảng/cột MVP, đơn hàng mẫu, quyền đọc công khai cho Landing và RPC `add_points_to_team`. Sau đó chạy `scripts/supabase/weekly_deduction.sql` để thêm kiểm tra quyền Admin cùng nghiệp vụ trừ coin đầu tuần. Phí tuần cũng được ghi vào `coin_transactions` để không lệch số dư và nhật ký.

Trang Admin tại `pages/admin/admin.html` đọc bảng `teams` và cập nhật coin qua RPC, không ghi trực tiếp vào bảng từ giao diện.

Thẻ **Quản lý thành viên** và trang **Nhân sự** cùng đọc mảng `members` đã lọc theo `team_id`. Không có thành viên thì cả hai nơi cùng hiển thị `0`.
