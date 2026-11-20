Số đếm nhỏ gắn góc nút icon (chuông thông báo). **Mới 19/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Số | `ui-count` | cao 16px, rộng tối thiểu 16px, padding 0 4px, pill; nền `color-background-danger-solid`, chữ `color-text-danger-solid` 10/16 600 `tabular-nums` |
| Vị trí | | góc trên phải nút, lệch -2px; viền 2px màu nền (`--ui-count-ring`, mặc định `background`) để tách khỏi icon |
| Neo | `ui-notif-neo` | `position: relative` bọc nút |

**Hành vi:** 0 → ẩn; > 9 → "9+".
**a11y:** số `aria-hidden`; tên nút đọc đủ: "Thông báo, 3 chưa đọc".
**Code:** tự dựng (span tuyệt đối) — shadcn `Badge` không có biến thể gắn góc.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp#thongbao` và `#cauhinh` (`khung/_proto/ThongBao.tsx`, `khung/_proto/MaTranThongBao.tsx`); CSS ở khối `BỔ SUNG DS THÔNG BÁO` cuối `khung/_proto/ui.css`.
