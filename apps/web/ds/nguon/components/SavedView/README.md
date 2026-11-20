Lưu tổ hợp lọc + sắp xếp + dạng xem thành một **"Bộ lọc đã lưu"** (mục trong panel sidebar của khu) — **mới 18/11/2026**, ghép từ `Menu` + `Input` + `Checkbox` + `Button`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Popover | `ui-menu ui-saveview` | rộng 320px, padding 16, gap 12; neo phải nút "Lưu bộ lọc" |
| Tiêu đề | `heading-xs` | "Lưu bộ lọc" 16/24 600 |
| Tóm tắt | `ui-chip` (không ×) | các điều kiện sẽ lưu |
| Tên | `ui-field` + `ui-input` | bắt buộc, tối đa 40 ký tự, focus sẵn; trống → `ui-error` "Đặt tên để tìm lại trong sidebar." |
| Chia sẻ | `ui-checkbox-label` + `ui-choice-desc` | "Chia sẻ cho cả khu …" — tắt = chỉ mình thấy |
| Chân | | Huỷ (`outline sm`) · Lưu (`sm`, submit — Enter lưu được) |

**Hành vi:** lưu xong → toast "Đã lưu “…” vào Bộ lọc đã lưu", mục mới hiện trong sidebar (`Sidebar` → "Bộ lọc đã lưu"); bấm mục = áp lại đúng URL đã lưu. Sửa tên/xoá ở chuột phải mục sidebar (`ContextMenu`).

**Code:** lưu **chuỗi query URL** (`q`, `cot`, `chieu`, lọc cột, `bo-cuc`…) — không lưu dữ liệu; bảng `saved_views (id, owner, khu, ten, query, chia_se)` — chưa có, cần migration theo luật DB khi làm thật. Popover = shadcn `Popover`; lưu ý gắn nội dung khi đã hiện mới focus được ô tên (prototype: `requestAnimationFrame`).
Prototype: nhánh `prototype/v2-khung`, `/prototype/bang?variant=B` — `apps/web/app/prototype/bang/_bang/chung.tsx` (`ThanhDangLoc`, `ChanTrang`, `ThanhHangLoat`, `LuuLoc`); CSS ở khối `BỔ SUNG DS XEM DỮ LIỆU` cuối `khung/_proto/ui.css`.
