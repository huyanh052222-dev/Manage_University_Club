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
│   ├── member-directory.css # Danh sách hồ sơ thành viên
│   └── responsive.css  # Breakpoint responsive
├── assets/images/      # Ảnh hero Cafe Horizon
└── scripts/
    ├── app.js          # Khởi tạo và điều phối tương tác
    ├── data/           # Dữ liệu demo, có thể thay bằng API
    ├── components/     # Hàm render từng module giao diện
    ├── services/       # Nghiệp vụ điều chỉnh số dư coin
    ├── ui/             # Modal, toast và feedback
    └── utils/          # Hàm định dạng dùng chung
```

## Luồng dữ liệu

`data/dashboard.js` → component tương ứng → `components/dashboard.js` → `app.js` → DOM.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Hệ thống chỉ có một tài khoản admin. Admin có thể mở **Quản lý coin** để cộng hoặc trừ coin theo từng nhóm; dữ liệu hiện chỉ tồn tại trong phiên demo.

Nút **Xem danh sách thành viên** mở màn hình tại `#member-list`. Thành viên chỉ là hồ sơ hiển thị gồm avatar, tên và vai trò, không có tài khoản đăng nhập hoặc dữ liệu đóng góp cá nhân.
