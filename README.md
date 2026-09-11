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
- The Vortex Coffee (`team_id=A`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskMZkasdojASDU00129`
- Chuột Ôm Cheese Coffee (`team_id=B`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdbskMZkasdojASDV00821`
- AUREXA Coffee (`team_id=C`): `https://manage-university-club.vercel.app/cafe/zzhbSdhdaskNZkasdojASDU00492`
- Tabulous Beasts (`team_id=D`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdaSkMZkbsdojASDU00714`
- Ngự Hoa Viên (`team_id=E`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskMZkbsdojBSDU00387`
- The Ora café (`team_id=F`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdbskNZkasdojASDU00953`
- 7-Byte Brew (`team_id=G`): `https://manage-university-club.vercel.app/cafe/zzhbSdhdaSkMZkasdojASDV00640`
- Fortuna (Rise & Concordia) (`team_id=H`): `https://manage-university-club.vercel.app/cafe/zzhaSdhdaskNZkbsdojBSDU00276`
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
│   ├── visitor.css     # Component ghé thăm và chế độ chỉ xem
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

Landing mặc định đọc quán The Vortex Coffee (`team_id=A`). Trên Vercel, tám endpoint dùng token opaque, phân biệt hoa–thường và ánh xạ nội bộ tới `team_id` A–H. Bộ phân giải đường dẫn chấp nhận token thường hoặc token được percent-encode đúng chuẩn. Các alias cũ `/a`, `/b`… và query `?team=A`… không còn được chấp nhận; đường dẫn không hợp lệ sẽ hiện trang 404. Toàn bộ tên quán, số coin và danh sách nhân sự trên trang đều được hydrate từ cùng một lần tải dữ liệu. Khi bảng chưa có dòng, truy vấn thất bại hoặc cột mở rộng chưa có dữ liệu, các chỉ số liên quan giữ giá trị `0`.

Component **Ghé thăm quán khác** nằm dưới thanh điều hướng. Mỗi lần bấm sẽ mở quán kế tiếp theo thứ tự A → H, giữ lại mã quán gốc và bỏ qua quán gốc khi đi hết một vòng. Trong chế độ ghé thăm, nút **Quay về quán chính** đưa người xem về đúng quán ban đầu; giao diện chỉ dựng uy tín, thành viên và đơn hàng. Ứng dụng không truy vấn `coin_transactions`, `weekly_financial_settlements` hay các cột tài chính của `teams` trong chế độ này, đồng thời khóa nguồn và thao tác đơn hàng. Đây là giới hạn ở tầng giao diện dành cho luồng demo; nếu cần chống truy cập dữ liệu tuyệt đối thì phải bổ sung đăng nhập riêng cho từng quán và chính sách RLS tương ứng trên Supabase.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Tuần vận hành được tính từ ngày mở bán `30/08/2026`: ngày này là ngày 1 của tuần 1, cứ đủ 7 ngày sẽ tăng một tuần.

## Supabase

`teams.points` là số dư coin dùng chung giữa Landing và Admin. `members.team_id` là nguồn danh sách và số lượng nhân sự. Bản MVP sinh đúng 10 đơn đồ uống mỗi tuần từ bốn tên món: Cà phê đen, Cà phê sữa, Bạc Sỉu và Trà sữa. Mỗi món xuất hiện ít nhất một lần, phần còn lại được phân bổ bằng bộ random có seed theo mã tuần. Vì seed không chứa `team_id`, cả tám quán luôn nhận cùng danh sách trong một tuần; sang tuần mới danh sách sẽ tự đổi. Chu kỳ đơn bắt đầu vào thứ Hai và hết hạn lúc 23:59 thứ Bảy; Chủ nhật chuẩn bị danh sách của tuần kế tiếp. Đơn thường có thưởng `20 coin/đơn`; riêng Đơn đặc biệt hiển thị mức thưởng `Từ 200-800 coin` và tạm ẩn hạn ở cả thẻ danh sách lẫn phần chi tiết. Nút nguồn dùng liên hệ Zalo riêng theo quán từ `ORDER_CONTACTS_BY_TEAM`; Fortuna (Rise & Concordia) (`team_id=H`) tạm giữ link cũ cho tới khi có liên hệ thứ tám. Demo đánh dấu đơn đầu tiên là “Đơn đặc biệt”, làm nổi bật và luôn đưa đơn đó lên đầu danh sách. Chức năng tiến độ đang được tạm bỏ và danh sách đơn có vùng cuộn riêng để không kéo dài dashboard.

`teams.reputation` lưu uy tín quán theo thang 1–5 sao. Mọi quán bắt đầu ở mức 1 sao; giao diện luôn render đủ năm ngôi sao và chỉ tô sáng số sao tương ứng. Cơ chế tự tăng sao sẽ được bổ sung sau.

`coin_transactions` là sổ cái biến động coin. Ba ô tổng coin vào/ra/thay đổi ròng bên dưới Nhật ký tổng hợp các giao dịch đã tải từ sổ cái; riêng “Doanh thu tuần” chỉ cộng các giao dịch loại `income` phát sinh trong đúng chu kỳ hiện tại. Mỗi lần Admin cộng coin dương được ghi là doanh thu của tuần tại thời điểm cộng, xuất hiện trong nhật ký và được đưa vào kỳ kết toán; thao tác trừ thủ công vẫn là `adjustment`, không làm giảm doanh thu. Admin bắt buộc nhập lý do (tối đa 200 ký tự) cho mỗi lần cộng hoặc trừ thủ công; lý do được lưu riêng trong `coin_transactions.reason` và hiển thị trong Nhật ký coin của đúng quán. Khi tuần mới chưa được Admin cộng coin, doanh thu tuần hiển thị `0 coin`. RPC `add_points_to_team` cập nhật `teams.points` và ghi cả lý do vào nhật ký trong cùng một giao dịch SQL.

Mỗi quán có `1.000 coin` vốn ban đầu. Vốn được ghi vào sổ cái dưới dạng `adjustment`, không phải `income`, nên không được tính vào doanh thu hay lợi nhuận. Công thức đối soát là `tiền mặt = 1.000 vốn + doanh thu − chi phí`; kết toán tuần chỉ dùng `lợi nhuận = doanh thu − chi phí`.

Chi phí mỗi tuần của từng quán là `200 + 20 × số nhân viên` coin, trong đó quản lý không được tính lương và 200 coin gồm nguyên liệu 50, điện nước 50 và mặt bằng 100. Không có nhân viên thì lương là `0 coin × 0 người`, tổng chi phí vẫn là 200 coin. `weekly_financial_settlements` lưu ảnh chụp doanh thu, chi phí và lợi nhuận của lần kết toán gần nhất; vì vậy “Lợi nhuận kết toán” không chạy theo giao dịch trực tiếp mà giữ nguyên đến kỳ kế tiếp.

Chạy `scripts/supabase/schema.sql` để bổ sung đầy đủ các bảng/cột MVP, dọn đơn lập trình demo cũ, thiết lập mức thưởng mặc định 20 coin/đơn, uy tín mặc định 1/5 sao, bảng kết toán, quyền đọc công khai cho Landing và RPC `add_points_to_team`. Sau đó chạy `scripts/supabase/weekly_deduction.sql` để thêm kiểm tra quyền Admin cùng nghiệp vụ kết toán và trừ coin đầu chu kỳ. Riêng database cũ đang vận hành chỉ có `teams`, `members` và `weekly_coin_deductions`, có thể chạy trực tiếp `scripts/supabase/manual_coin_revenue.sql` một lần: script tự tạo phần tài chính còn thiếu, khôi phục khoản Admin cộng coin và chi phí đã trừ vào nhật ký, tạo kết toán, rồi in bảng kết quả để đối chiếu mà không thay đổi lại số dư. Mỗi chu kỳ bắt đầu theo mốc 30/08/2026, không theo thứ Hai. Phí thực trừ cũng được ghi vào `coin_transactions` để không lệch số dư và nhật ký.

Nếu database đã chạy bản khôi phục cũ và lỡ tính cả `1.000 coin` vốn ban đầu là doanh thu, chạy `scripts/supabase/correct_opening_capital_revenue.sql` đúng một lần để tách vốn thành `adjustment`, giữ phần vượt vốn là `income` và tính lại lợi nhuận mà không thay đổi `teams.points`.

Với database đang hoạt động đã có phần tài chính, chạy `scripts/supabase/add_coin_reason.sql` đúng một lần trước khi deploy nhánh có ô lý do. Migration thêm cột `reason`, thay RPC hai tham số bằng RPC ba tham số và tự rollback toàn bộ nếu có lỗi; script không thay đổi số dư hay nhật ký cũ.

Để đồng bộ tên The Vortex Coffee (`team_id=A`) và The Ora café (`team_id=F`) vào database đang hoạt động, chạy `scripts/supabase/rename_cafes.sql` một lần. Frontend cũng chuyển tiếp hai tên cũ sang tên mới để UI hiển thị đúng ngay khi deploy; các tên khác do Admin đặt sau này vẫn được giữ nguyên.

Trang Admin tại `pages/admin/admin.html` đọc bảng `teams` và cập nhật coin qua RPC, không ghi trực tiếp vào bảng từ giao diện.

Thẻ **Quản lý thành viên** và trang **Nhân sự** cùng đọc mảng `members` đã lọc theo `team_id`. Không có thành viên thì cả hai nơi cùng hiển thị `0`.
