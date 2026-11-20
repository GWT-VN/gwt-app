Thông báo ngắn sau một thao tác — **18/11/2026**, bổ sung **lỗi** và **đang chạy** cùng ngày.

**Chọn kiểu phản hồi:** lỗi/hỏi trong luồng → `Alert` tại chỗ · trạng thái cả trang/app → `Banner` · xong việc → `Toast` · việc **không lùi được** → `ConfirmDialog` (lùi được thì làm luôn + Toast Hoàn tác, không hỏi trước).

| Loại | Hành vi |
| --- | --- |
| Thành công | ✓ + "mã → giá trị mới" + **Hoàn tác**; tự tắt sau 5 giây |
| Lỗi | ✕ đỏ + lý do ngắn + **Thử lại** + nút đóng; **không** tự tắt |
| Đang chạy | vòng xoay + việc đang làm + thanh tiến độ; không tự tắt, xong thì đổi sang Thành công |

| Phần | Token | Giá trị |
| --- | --- | --- |
| Vị trí | | đáy giữa màn, cách đáy 72px (trên thanh thao tác hàng loạt); căn giữa bằng `margin-inline: auto` + `width: max-content`, cách mép 16px |
| Nền / chữ | `color-background-primary-solid` / `color-text-primary-solid` | 13px, pill |
| Icon ✓ | `green-400` (tối `green-600`, 4.2:1) | 14px |
| Icon lỗi | `data-color="danger"` · `red-400` (tối `red-600`, 5.6:1) | 14px |
| Nút Hoàn tác / Thử lại | `color-background-primary-solid-hover` | cao `control-size-xs` 26px, pill, 13px 500 |
| Nút đóng | `ui-toast-x` | 26px vuông, icon màu chữ (không mang màu trạng thái) |
| Tiến độ | `ui-progress` | rộng 72px, nền màu chữ 20%, phần chạy màu chữ |
| Chuyển động | | trượt lên 180ms; tắt khi giảm chuyển động |

**a11y:** `role="status"` `aria-live="polite"` (lỗi: `role="alert"`); thanh tiến độ `role="progressbar"` có `aria-valuenow`.
**Code:** `sonner` (shadcn Sonner) — `toast.success(chu, { action: { label: 'Hoàn tác', onClick }, duration: 5000 })`, `toast.error(..., { duration: Infinity })`, `toast.loading(...)` → `toast.success(..., { id })`; giao diện chỉnh theo bảng trên.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/phanhoi` (`apps/web/app/prototype/phanhoi/_ph/PhanHoiDemo.tsx`); CSS ở khối `BỔ SUNG DS PHẢN HỒI` cuối `khung/_proto/ui.css`.
