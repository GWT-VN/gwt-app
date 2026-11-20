shadcn `Checkbox` theo OpenAI: ô 18px, bo 4px, viền xám, khi chọn nền `gray-900` với dấu ✓ `gray-0`.

**Người dùng cung cấp:** nhãn bấm được (bọc `<label>`), `checked` / `indeterminate` (chọn một phần — dùng cho ô "chọn tất cả" của bảng), `disabled`, `aria-invalid` khi bắt buộc mà chưa tick.

| Trạng thái | Nguồn Checkbox.module.css |
| --- | --- |
| Mặc định | viền 1px gray-200 / dark gray-500, nền trong suốt |
| Hover | viền gray-300 / dark gray-600 |
| Đã chọn / một phần | viền + nền gray-900 |
| Focus-visible | outline 2px `ring`, offset 2px |
| Disabled | viền gray-150 / gray-300, nền gray-25 / gray-200 |

- Nhãn 14px/20px, cách ô 8px; ô lệch xuống 1px để thẳng dòng đầu nhãn.
- Mô tả dưới nhãn (`ui-choice-desc`): nối vào ô bằng `aria-describedby` — tên ô chỉ là nhãn, mô tả đọc sau; câu lỗi (nếu có) đứng trước mô tả.
- Lỗi: viền red-500 + dòng `ui-error` bên dưới (mở rộng GWT — OpenAI Checkbox không có trạng thái lỗi).

⚠️ Viền gray-200 (#cdcdcd) trên trắng = 1.6:1, dưới 3:1 của WCAG 1.4.11. Giữ đúng nguồn; xem "Quyết định còn mở".
