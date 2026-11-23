Thanh thao tác hàng loạt — **mới 18/11/2026**, thay thanh tự vẽ `b-hangloat`/`b-hl-nut` trong prototype. Nổi giữa đáy màn khi chọn ≥ 1 dòng.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Mặt | `color-background-primary-solid` / `color-text-primary-solid` | pill, padding 4/4/4/16, `shadow-400`, cách đáy 24px (prototype 72px để tránh nút Bắp), hiện trượt lên 180ms |
| Số | `ui-bulkbar-count` | "Đã chọn **15** ticket" 14/20, số 600 `tabular-nums`; phụ "(gồm cả trang khác)" `ui-bulkbar-sub` mờ 70% |
| Mời chọn toàn bộ | `Button link` | "Chọn tất cả 19 ticket khớp bộ lọc", gạch chân chấm, cùng màu chữ thanh |
| Vạch ngăn | `ui-bulkbar-sep` | 1×20px, `currentColor` 20% |
| Thao tác | `Button ghost sm` | màu chữ thanh; hover/đang mở menu `color-background-primary-solid-hover`; menu bật lên trên |
| Bỏ chọn | `Button ghost icon-sm` + `Tooltip` "Bỏ chọn (Esc)" | `ui-bulkbar-close`, mờ 70% → 100% khi hover |
| Cảnh báo | `ui-bulkbar-warn` `yellow-300` | "Chỉ chọn được tối đa N mỗi lượt — thu hẹp bộ lọc" |
| Biến thể mặt nổi `data-variant="surface"` (nền trắng ở theme sáng, popover tối ở theme tối) | `popover` / `popover-foreground`, `shadow-hairline` + `shadow-300` | thêm 23/11/2026 (CEO chốt trên màn Work): cùng bố cục; nút ghost rê `alpha-05`, nhấn `alpha-08`; cảnh báo `color-text-warning`. Code: `<CauHinhBangDs thanhHangLoat="surface">` |
| Điện thoại ≤ 640px | | rộng `100vw − 32px`, bo `radius-2xl`, **2–3 dòng**: số + × · các thao tác · "Chọn tất cả…" — không cuộn ngang giấu nút |

**Luật (từ `bang/ChonDong.tsx`):** ô chọn ở đầu bảng = **chọn hết trang đang xem**; hết trang mà còn trang khác → mời chọn toàn bộ; lựa chọn vượt trang **bắt buộc nói ra**; "Bỏ chọn" xoá **hết** (kể cả trang khác); đổi lọc → bỏ chọn. Thao tác ghi dữ liệu: hộp xác nhận ghi rõ **số dòng**, chia lô khi ghi, ghi vết trước/sau, toast có **Hoàn tác**. Chưa có thao tác → nói thật "Thao tác hàng loạt đang được bổ sung", không đặt nút giả.

**a11y:** `role="toolbar"` `aria-label="Thao tác hàng loạt"`; số đã chọn nên `aria-live="polite"`.

**Khoá giaoDien:** `chon_thanh` → `ui-bulkbar` · `chon_thanhPhuChu` → `ui-bulkbar-sub` · `chon_thanhCanhBao` → `ui-bulkbar-warn` · `chon_nutChonToanBo` → `ui-btn` link sm · `chon_nutBoChon` → `ui-btn` ghost icon-sm `ui-bulkbar-close` · `chon_khuHanhDong` → `display: contents` · `chon_checkbox` → `ui-checkbox`.

**Code thật:** logic đã có trong gói `apps/web/bang/` — chỉ truyền bộ class DS vào `giaoDien` của `<CauHinhBang>` (xem bảng "Khoá giaoDien"), **không viết lại logic**. Component: `KhungChon` + `OChonTatCa` + `OChonDong` + `ThanhDaChon`.
Prototype: nhánh `prototype/v2-khung`, `/prototype/bang?variant=B` — `apps/web/app/prototype/bang/_bang/chung.tsx` (`ThanhDangLoc`, `ChanTrang`, `ThanhHangLoat`, `LuuLoc`); CSS ở khối `BỔ SUNG DS XEM DỮ LIỆU` cuối `khung/_proto/ui.css`.
