Dải thông báo trạng thái của **cả trang/app** (mất mạng, đang xem dữ liệu thử, có bản mới), nằm trên cùng. **Mới 18/11/2026.** Khác `Alert` (nằm trong nội dung, nói về một khối).

**Chọn kiểu phản hồi:** lỗi/hỏi trong luồng → `Alert` tại chỗ · trạng thái cả trang/app → `Banner` · xong việc → `Toast` · việc **không lùi được** → `ConfirmDialog` (lùi được thì làm luôn + Toast Hoàn tác, không hỏi trước).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Dải | `ui-banner` | cao tối thiểu `control-size-xl` 40px, padding 6/8/6/16, 14/20; nền `color-background-info-surface`, kẻ dưới `color-border-info-surface` |
| Icon | `control-icon-size-md` | `color-text-info` |
| Chữ | `ui-banner-text` | phần quan trọng `b` 600 |
| Màu | `data-color` | `warning` / `danger` đổi nền, kẻ, icon theo surface tương ứng |
| Nút | `Button sm` | tối đa 1 hành động + × đóng (nếu đóng được) |
| ≤640px | | xuống dòng, nút xuống hàng dưới |

**a11y:** `role="status"` (thông tin) hoặc `role="alert"` (lỗi mất kết nối).
**Code:** tự dựng (shadcn không có Banner).
Prototype: nhánh `prototype/v2-khung`, route `/prototype/phanhoi` (`apps/web/app/prototype/phanhoi/_ph/PhanHoiDemo.tsx`); CSS ở khối `BỔ SUNG DS PHẢN HỒI` cuối `khung/_proto/ui.css`.
