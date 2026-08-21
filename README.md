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
│   ├── auth.css        # Landing page và biểu mẫu đăng nhập
│   ├── member-directory.css # Danh sách hồ sơ thành viên
│   └── responsive.css  # Breakpoint responsive
├── assets/images/      # Ảnh hero Cafe Horizon
└── scripts/
    ├── app.js          # Khởi tạo và điều phối tương tác
    ├── data/           # Dữ liệu demo, có thể thay bằng API
    ├── components/     # Hàm render từng module giao diện
    ├── services/       # Đăng nhập demo và nghiệp vụ số dư coin
    ├── ui/             # Modal, toast và feedback
    └── utils/          # Hàm định dạng dùng chung
```

## Luồng dữ liệu

`data/dashboard.js` → component tương ứng → `components/dashboard.js` → `app.js` → DOM.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Hệ thống chỉ có một tài khoản admin. Admin có thể mở **Quản lý coin** để cộng hoặc trừ coin theo từng nhóm; dữ liệu hiện chỉ tồn tại trong phiên demo.

Tài khoản kiểm thử: `admin` / `123456`. Trạng thái đăng nhập được lưu trong `sessionStorage`; đây là xác thực frontend dành cho demo, không dùng cho môi trường production.

Thẻ **Quản lý các nhóm** hiển thị nhanh bốn nhóm bằng cụm avatar. Nút **Xem danh sách thành viên** và mục **Nhân sự** ở sidebar cùng mở trang tổng quát tại `#personnel`, nơi các hồ sơ thành viên được chia theo từng nhóm từ 5–8 người.
