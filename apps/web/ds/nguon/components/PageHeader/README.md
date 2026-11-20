Đầu trang của mọi trang một bản ghi (ticket, khách, máy, phiếu chi): đường dẫn + chuyển bản ghi, tiêu đề + hành động, dòng meta. **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-page-header` | cột, gap 12px |
| Hàng trên | `ui-page-header-top` | `Breadcrumb` lấp chỗ + `ui-page-header-nav`: "3 / 19" (`ui-caption` `tabular-nums`) + ‹ › `Button ghost icon-sm` |
| Tiêu đề | `ui-page-header-title` | 24/28 600 (heading-lg), tối đa 2 dòng rồi `…`; ≤640px: 20/26 (heading-md) |
| Meta | `ui-page-header-meta` | 12/18 `muted-foreground`, các mục ngăn bằng "·" `color-text-tertiary`; xuống dòng không để "·" mồ côi ở đầu dòng |
| Hành động | `ui-page-header-actions` | gap 8px: tối đa 2 nút chữ + ⋯ (`DropdownMenu`) |
| ≤640px | | tiêu đề và hành động xếp dọc; 2 nút chữ chia đôi bề rộng, ⋯ giữ vuông; ẩn "3 / 19" |

**Hành vi:** ‹ › đi theo thứ tự của danh sách vừa mở (giữ lọc/sắp xếp); đầu/cuối danh sách thì nút tắt. Nút chính đổi theo trạng thái bản ghi.
**a11y:** tiêu đề là `<h1>`; nút ‹ › có `aria-label` "Ticket trước/sau" (theo loại bản ghi) + `Tooltip`.
**Code:** tự dựng (shadcn không có) — ghép `Breadcrumb`, `Button`, `DropdownMenu`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
