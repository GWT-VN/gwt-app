Menu chuột phải trên dòng (Danh sách, Bảng) và thẻ (Kanban) — thay hẳn nút ⋯ cuối dòng — đã chốt 18/11/2026.

## Cấu tạo
Nhãn: mã bản ghi · **Mở ticket** · **Xem nhanh bên phải** (tự bật thẻ xem nhanh) · **Sao chép mã** · vạch · **Đóng ticket** / **Mở lại ticket** (theo trạng thái).

## Thông số
`ui-menu` rộng 220px, `position: fixed` tại con trỏ (kẹp trong màn), z trên mọi lớp; dòng đang mở menu tô `alpha-05` (thẻ Kanban: viền `alpha-15`).

## Hành vi
- Mở bằng chuột phải; bằng phím Menu / Shift+F10 trên dòng đang focus thì neo ngay dưới dòng và đưa focus vào mục đầu (mở bằng chuột thì không hiện viền focus).
- Đóng: Esc, bấm ra ngoài, cuộn.
- Chuột phải trong ô nhập/menu thì để menu mặc định của trình duyệt.

## Code
- shadcn `ContextMenu` (Radix) bọc từng dòng/thẻ — Radix đã lo phím Menu/Shift+F10, portal, va chạm mép; không tự viết như prototype.
- Thao tác dùng chung hàm với menu khác (đóng/mở lại có Hoàn tác).
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`MenuChuotPhai`, `moCp` trong `ManTicket`).

## Menu con · phím tắt · một phần

> Thêm ở repo 20/11, **chưa có trong artifact** — nguồn là prototype menu thuộc tính CEO duyệt (`app/prototype/menu-thuoc-tinh`). DropdownMenu và ContextMenu dùng chung một bộ (`taoPhanMenu` trong `dropdown-menu.tsx`).

| Phần | Code | Giá trị |
| --- | --- | --- |
| Mục mở menu con | `*SubTrigger icon phim` | icon · nhãn · phím (Kbd) · ▸; giữ nền đang trỏ khi menu con mở |
| Khung menu con | `*SubContent` | như khung menu; mục đầu thẳng hàng mục cha (alignOffset −6 = −gutter), cách 4px; rộng ≥ 200 nhưng kẹp theo chỗ trống (khổ hẹp không tràn ngang) |
| Phím tắt | `*Shortcut phim={['⇧','D']}` | nhóm Kbd căn phải; không truyền `phim` thì giữ chữ 12px như cũ |
| Một phần | `*CheckboxItem checked="indeterminate"` | dấu – thay ✓, `aria-checked="mixed"`; bấm → bật hết |
| Ô tìm | `MenuTimKiem value onValueChange placeholder` | đầu menu con khi quá 10 mục (CHUAN-FILTER); bên gọi tự lọc |

Bàn phím: → mở menu con và focus mục đang ✓ (có ô tìm thì focus ô), ← đóng về mục cha, Esc đóng hết và trả focus về chỗ mở. Menu con có ô tìm: gõ chữ ở mục cha (menu con đang mở) hay ở mục bất kỳ → chữ vào ô, không nhảy theo chữ đầu; ↓ trong ô sang mục đầu, ↑ ở mục đầu về ô; Enter chọn khi chỉ còn 1 mục; IME đang ghép không chốt.

Đang mở: khổ điện thoại kiểu "drill-in" (menu con thay chỗ menu cha) — v1 chỉ bảo đảm không tràn ngang; menu con lật sang trái vẫn hiện ▸.
