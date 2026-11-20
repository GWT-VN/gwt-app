Khung chờ đúng hình nội dung thật, để lúc dữ liệu về không nhảy chỗ. **Bổ sung 18/11/2026** cho `.ui-skeleton` có sẵn, kèm trạng thái **nút đang chạy**.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Hình | `data-shape` | `circle` (`control-size-3xs` 22px, avatar) · `pill` (60×20, badge) · `title` (cao 20px) · mặc định dòng chữ cao 12px |
| Bề rộng | `data-w` | bậc `1/4` `1/3` `1/2` `2/3` `3/4` — không gõ px lẻ |
| Dòng bảng | `ui-skeleton-row` | cao `control-size-2xl`, gap 12px, kẻ `alpha-05` |
| Chồng dọc | `ui-skeleton-stack` | gap 10px |
| Nút đang chạy | `data-loading` + `ui-spinner` | giữ bề rộng, chữ ẩn, vòng xoay ở giữa, `aria-busy="true"`, chặn bấm lần 2 |

**Hành vi:** chỉ hiện khi chờ > 300ms (tránh nháy). Vùng đang tải đặt `aria-busy="true"`.
**Code:** shadcn `Skeleton` + shadcn `Spinner` trong `Button`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/phanhoi` (`apps/web/app/prototype/phanhoi/_ph/PhanHoiDemo.tsx`); CSS ở khối `BỔ SUNG DS PHẢN HỒI` cuối `khung/_proto/ui.css`.
