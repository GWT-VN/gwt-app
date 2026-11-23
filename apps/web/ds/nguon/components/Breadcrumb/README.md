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

## Đổi khi chép khung shadcn (21–23/11/2026)

- Thêm `BreadcrumbSeparator` (shadcn): `<li role="presentation" aria-hidden>`, mặc định "/" màu `color-text-tertiary`, icon con 14px. Chỉ dùng khi cần dấu khác "/" hoặc icon.
- Thêm `BreadcrumbEllipsis` (shadcn): ô 32px, icon "…" 16px, chữ ẩn "Thêm" — thu gọn mục giữa, bọc trong nút mở menu.
- Mặc định vẫn không cần `BreadcrumbSeparator`: dấu "/" vẽ bằng `::before`, nay chỉ ở mục đứng ngay sau một mục; mục đứng sau `BreadcrumbSeparator` không vẽ thêm. Thay vế "đổi separator thành '/'" ở dòng **Code:** trên.
- `data-slot` mới: `breadcrumb-separator`, `breadcrumb-ellipsis`. Các phần cũ (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink` có `asChild`, `BreadcrumbPage`) giữ tên và hình thức.
