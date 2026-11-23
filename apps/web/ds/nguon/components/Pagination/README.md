Chân bảng phân trang — **mới 18/11/2026**, đặt trong `ui-table-foot` có sẵn của `Table`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-table-foot` | flex space-between, cách bảng 12px, chữ 12/18 `muted-foreground` |
| Trái | | "1–15 trên 19 ticket" `tabular-nums` |
| Phải | `ui-pagination` | ‹ `Button ghost icon-sm` + `Tooltip` · "Trang 1 / 2" (`ui-pagination-page`, `foreground`, rộng tối thiểu 88px để không nhảy) · › |
| Tắt | | nút đầu/cuối `disabled` (không ẩn — giữ vị trí) |

**Hành vi:** 1 trang → **ẩn cả chân**. Đổi lọc/sắp/từ khoá → về trang 1. Lựa chọn dòng **giữ qua các trang** (xem `BulkActionBar`). Mặc định 50 dòng/trang (`bang/`); prototype dùng 15 để thấy 2 trang.

**a11y:** `<nav aria-label="Phân trang">`, số trang `aria-current="page"`; nút có `aria-label` "Trang trước/sau".

**Khoá giaoDien:** `phanTrang_khung` → `ui-table-foot` (+ `ui-pagination` cho cụm nút) · `phanTrang_nut` → `ui-btn` ghost icon-sm · `phanTrang_nutTat` → như trên + `disabled` · `phanTrang_chuSo` → `ui-pagination-page`.

**Code thật:** logic đã có trong gói `apps/web/bang/` — chỉ truyền bộ class DS vào `giaoDien` của `<CauHinhBang>` (xem bảng "Khoá giaoDien"), **không viết lại logic**. Component: `PhanTrang` (giữ mọi tham số URL khác, chỉ đổi `trang`; cần `Suspense`).
Prototype: nhánh `prototype/v2-khung`, `/prototype/bang?variant=B` — `apps/web/app/prototype/bang/_bang/chung.tsx` (`ThanhDangLoc`, `ChanTrang`, `ThanhHangLoat`, `LuuLoc`); CSS ở khối `BỔ SUNG DS XEM DỮ LIỆU` cuối `khung/_proto/ui.css`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- Chân bảng vẫn dùng `PhanTrang` của `bang/` như trên — không đổi.
- File mới `components/ui/pagination.tsx` = `Pagination` của shadcn, cho chỗ cần nhảy thẳng tới số trang (danh sách bài wiki, kết quả tìm), không dùng cho bảng dữ liệu.
- Export: `Pagination` (`<nav aria-label="Phân trang">`), `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`; `data-slot` cùng tên kiểu `pagination-*`.
- `PaginationLink` là thẻ `<a>`: `isActive` → nút `outline` + `aria-current="page"`, trang khác `ghost`; `size` theo Button, mặc định `icon` (32×32, bo pill).
- `PaginationPrevious`/`PaginationNext`: chữ "Trước"/"Sau" (ẩn dưới 640px, còn mũi tên), `aria-label` "Về trang trước"/"Tới trang sau". Trang đầu/cuối → không render nút đó (link không `disabled` được) — khác chân bảng giữ nút tắt.
- `PaginationEllipsis`: ô "…" vuông 32px.
