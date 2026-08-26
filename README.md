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
- Admin alias khi dùng static server: `http://localhost:4173/admin/login/`

Khi deploy Vercel, `vercel.json` ánh xạ thành:

- Landing: `https://manage-university-club.vercel.app/`
- Nhóm A: `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskMZkasdojASDU00129`
- Nhóm B: `https://manage-university-club.vercel.app/cafe/zzhaSdhdbskMZkasdojASDV00821`
- Nhóm C: `https://manage-university-club.vercel.app/cafe/zzhbSdhdaskNZkasdojASDU00492`
- Nhóm D: `https://manage-university-club.vercel.app/cafe/zzhaSdhdaSkMZkbsdojASDU00714`
- Nhóm E: `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskMZkbsdojBSDU00387`
- Nhóm F: `https://manage-university-club.vercel.app/cafe/zzhaSdhdbskNZkasdojASDU00953`
- Nhóm G: `https://manage-university-club.vercel.app/cafe/zzhbSdhdaSkMZkasdojASDV00640`
- Nhóm H: `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskNZkbsdojBSDU00276`
- Admin: `https://manage-university-club.vercel.app/admin`
- Admin login (alias): `https://manage-university-club.vercel.app/admin/login`
- Admin dashboard sau đăng nhập: `https://manage-university-club.vercel.app/admin/dashboard`

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

Landing mặc định đọc nhóm `A`. Trên Vercel, tám endpoint dùng token opaque, phân biệt hoa–thường và ánh xạ nội bộ tới `team_id` A–H. Bộ phân giải đường dẫn chấp nhận token thường hoặc token được percent-encode đúng chuẩn. Các alias cũ `/a`, `/b`… và query `?team=A`… không còn được chấp nhận; đường dẫn không hợp lệ sẽ hiện trang 404. Toàn bộ tên nhóm, số coin và danh sách nhân sự trên trang đều được hydrate từ cùng một lần tải dữ liệu. Khi bảng chưa có dòng, truy vấn thất bại hoặc cột mở rộng chưa có dữ liệu, các chỉ số liên quan giữ giá trị `0`.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Tuần vận hành được tính từ ngày mở bán `30/08/2026`: ngày này là ngày 1 của tuần 1, cứ đủ 7 ngày sẽ tăng một tuần.

## Supabase

`teams.points` là số dư coin dùng chung giữa Landing và Admin. `members.team_id` là nguồn danh sách và số lượng nhân sự. Bản MVP sinh đúng 10 đơn đồ uống mỗi tuần từ bốn tên món: Cà phê đen, Cà phê sữa, Bạc Sỉu và Trà sữa. Mỗi món xuất hiện ít nhất một lần, phần còn lại được phân bổ bằng bộ random có seed theo mã tuần. Vì seed không chứa `team_id`, cả tám quán luôn nhận cùng danh sách trong một tuần; sang tuần mới danh sách sẽ tự đổi. Mỗi đơn thưởng cố định `200 coin`, có hạn 7 ngày, nguồn tạm thời là `#` và chức năng tiến độ đang được tạm bỏ. Danh sách đơn có vùng cuộn riêng để không kéo dài dashboard.

`coin_transactions` là sổ cái biến động coin. Nhật ký và tổng coin vào/ra đọc từ bảng này; “Doanh thu tuần” chỉ cộng giao dịch loại `income` trong đúng chu kỳ 7 ngày hiện tại nên tự trở về `0 coin` khi sang tuần mới. Khi chưa có giao dịch, các tổng số liên quan hiển thị `0 coin`. RPC `add_points_to_team` cập nhật `teams.points` và ghi nhật ký trong cùng một giao dịch SQL.

Chi phí mỗi tuần của từng quán là `200 + 20 × số nhân viên` coin, trong đó quản lý không được tính lương và 200 coin gồm nguyên liệu 50, điện nước 50 và mặt bằng 100. Không có nhân viên thì lương là `0 coin × 0 người`, tổng chi phí vẫn là 200 coin. `weekly_financial_settlements` lưu ảnh chụp doanh thu, chi phí và lợi nhuận của lần kết toán gần nhất; vì vậy “Lợi nhuận kết toán” không chạy theo giao dịch trực tiếp mà giữ nguyên đến kỳ kế tiếp.

Chạy `scripts/supabase/schema.sql` để bổ sung các bảng/cột MVP, dọn đơn lập trình demo cũ, thiết lập mức thưởng mặc định 200 coin, bảng kết toán, quyền đọc công khai cho Landing và RPC `add_points_to_team`. Sau đó chạy `scripts/supabase/weekly_deduction.sql` để thêm kiểm tra quyền Admin cùng nghiệp vụ kết toán và trừ coin đầu chu kỳ. Mỗi chu kỳ bắt đầu theo mốc 30/08/2026, không theo thứ Hai. Phí thực trừ cũng được ghi vào `coin_transactions` để không lệch số dư và nhật ký.

Trang Admin tại `pages/admin/admin.html` đọc bảng `teams` và cập nhật coin qua RPC, không ghi trực tiếp vào bảng từ giao diện.

Thẻ **Quản lý thành viên** và trang **Nhân sự** cùng đọc mảng `members` đã lọc theo `team_id`. Không có thành viên thì cả hai nơi cùng hiển thị `0`.
