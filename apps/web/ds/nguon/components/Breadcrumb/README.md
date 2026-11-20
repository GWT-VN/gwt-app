Đường dẫn từ khu → danh sách → bản ghi đang xem, đặt ở hàng trên cùng của `PageHeader`. **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Hàng | `ui-breadcrumb` (`<ol>`) | flex, gap 6px, chữ 14/20 `muted-foreground` |
| Dấu ngăn | `color-text-tertiary` | "/" vẽ bằng `::before`, không phải chữ trong DOM (trình đọc màn hình không đọc) |
| Liên kết | | hover `foreground`; focus-visible outline 2px `ring`, bo `radius-sm` |
| Mục cuối | `aria-current="page"` | `foreground`, `tabular-nums` (mã bản ghi), cắt `…` khi hẹp |

**a11y:** bọc `<nav aria-label="Đường dẫn">`; mục cuối không phải liên kết.
**Code:** shadcn `Breadcrumb` (`BreadcrumbList/Item/Link/Page/Separator`) — đổi separator thành "/" và class theo bảng trên.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
