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
