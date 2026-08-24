# Cafe Horizon Dashboard Demo

Dashboard vận hành quán café sinh viên, dựng theo phong cách sáng và ấm với dữ liệu minh họa.

## Chạy dự án

Dự án dùng HTML/CSS/JavaScript thuần, không cần cài package:

```bash
python3 -m http.server 4173
```

Sau đó mở `http://localhost:4173`.

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
    ├── data/           # Dữ liệu demo, có thể thay bằng API
    ├── components/     # Hàm render từng module giao diện
    ├── services/       # Xác thực Supabase và nghiệp vụ số dư coin
    ├── supabase/       # Client Supabase và migration SQL
    ├── ui/             # Modal, toast và feedback
    └── utils/          # Hàm định dạng dùng chung
```

## Luồng dữ liệu

`index.html` → `main.js` → `pages/cafePage.js` → `app.js` → component và dữ liệu tương ứng → DOM.

`index.html` chỉ giữ điểm mount `#app`. Toàn bộ khung giao diện nằm trong page component, sau khi page được render thì `app.js` mới khởi tạo các module chức năng.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Người quản lý có thể mở **Quản lý coin** để cộng hoặc trừ coin theo từng nhóm; dữ liệu hiện chỉ tồn tại trong phiên demo.

## Supabase

Chạy `scripts/supabase/schema.sql` trước để tạo `teams`, `members` và RPC `add_points_to_team`. Sau đó chạy `scripts/supabase/weekly_deduction.sql` để thêm kiểm tra quyền Admin cùng nghiệp vụ trừ coin đầu tuần.

Trang Admin tại `pages/admin/admin.html` đọc bảng `teams` và cập nhật coin qua RPC, không ghi trực tiếp vào bảng từ giao diện.

Thẻ **Quản lý thành viên** hiển thị nhanh 8 thành viên của Cafe Horizon. Nút **Xem danh sách thành viên** và mục **Nhân sự** ở sidebar cùng mở trang chi tiết tại `#personnel` với một danh sách thành viên duy nhất, không chia theo nhóm.
