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
│   ├── member-management.css # Màn hình quản lý nhân sự
│   └── responsive.css  # Breakpoint responsive
├── assets/images/      # Ảnh hero Cafe Horizon
└── scripts/
    ├── app.js          # Khởi tạo và điều phối tương tác
    ├── data/           # Dữ liệu demo, có thể thay bằng API
    ├── components/     # Hàm render từng module giao diện
    ├── ui/             # Modal, toast và feedback
    └── utils/          # Hàm định dạng dùng chung
```

## Luồng dữ liệu

`data/dashboard.js` → component tương ứng → `components/dashboard.js` → `app.js` → DOM.

Menu mobile, thông báo, modal, toast và các nút điều hướng chính đã có tương tác demo.

Nút **Xem tất cả thành viên** mở màn hình quản trị riêng tại `#member-management`. Màn hình này hỗ trợ tìm kiếm, sắp xếp, theo dõi coin/nhiệm vụ/thời gian/XP/mức hoạt động và xem phân bổ đóng góp chi tiết của từng người.
