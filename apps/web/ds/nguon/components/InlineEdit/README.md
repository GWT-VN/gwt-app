Sửa tại chỗ: bấm vào nội dung ô bất kỳ của dòng là sửa ngay, không mở form — đã chốt 18/11/2026.

## Các kiểu ô
| Ô | Bấm vào | Ghi chú |
| --- | --- | --- |
| Nhãn (ưu tiên, loại lỗi) | menu chọn | không khung, không mũi tên ngoài |
| Trạng thái | menu chọn (+ "Lý do chờ" khi Chờ) | DS `Badge` + `ui-caret` ▾ 10px **bên trong**, cùng màu chữ, mờ 60% → 100% khi hover |
| Chữ (việc tiếp theo) | ô nhập tại chỗ | Enter lưu, Esc huỷ, rời ô thì lưu |
| Ngày giờ (hạn) | chọn ngày | giữ giờ cũ |
| Người (chủ, người làm) | Combobox có tìm | ô hẹp < 112px chỉ avatar, không mũi tên |
| Khách | `RecordPicker` | bảng chọn đủ thông tin phân biệt |

## Hover — một lớp
- Ô dạng nhãn/avatar: **không** nền xám ô, **không** mũi tên đè; hover tô viền nhẹ trên chính nhãn (`0 0 0 2px alpha-08`; nhãn loại lỗi: viền trong `alpha-20` + nền `alpha-04`).
- Ô chữ/người: nền `alpha-05` bo `radius-md` + mũi tên ▾ 12px hiện ở phải khi hover.
- Menu chọn: DS `DropdownMenu` (hover `alpha-08`), mục đang chọn nền `alpha-04` + ✓.
- Nhãn dùng DS `Badge`: ưu tiên (P1 `solid danger` · P2 `warning` · P3 mặc định · P4 `outline`), loại lỗi (`outline` + `ui-dot` màu theo nhóm), trạng thái (`soft` theo nghĩa + `ui-caret`).

## Hành vi
- Sửa xong: toast đáy màn "TK-… → Đang xử lý · **Hoàn tác**" 5 giây.
- Menu nổi vẽ qua portal, `position: fixed` theo ô, thiếu chỗ thì lật lên; cuộn/đổi cỡ cửa sổ thì đóng; không bị vùng cuộn ngang của bảng cắt, không bị tiêu đề dính đè.
- Bấm ô không mở bản ghi (chặn nổi bọt lên dòng).

## Bàn phím & a11y
Ô sửa là `button` có `aria-label="Sửa <trường> <mã>"`, `aria-haspopup="menu"`, `aria-expanded`; menu `role="menu"`, mục `menuitemradio` + `aria-checked`; Esc đóng và trả focus về ô.

## Code
- shadcn `DropdownMenu` + `DropdownMenuRadioGroup` (nhãn, trạng thái) · `Popover` + `Command` (người, có tìm, > 10 mục bắt buộc gõ để tìm — `OChonGoiY` của `apps/web/bang/`) · `Input` (chữ) · `Popover` + `Calendar` (hạn) · `sonner` toast có action Hoàn tác.
- Ghi: cập nhật lạc quan + hoàn tác; lỗi thì trả giá trị cũ và báo.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`OTruong`, `OSua`, `SuaChu`, `SuaHan`) + `chung.tsx` (`MenuChon`, `ChipTT`, `NhanLoi`, `Noi`, `Toast`).
