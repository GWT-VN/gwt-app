Dạng xem **Kanban** theo trạng thái: mỗi cột một trạng thái, kéo thẻ sang cột khác để đổi trạng thái — đã chốt 18/11/2026.

## Cấu tạo thẻ
Dòng 1: `[Ưu tiên][Loại lỗi]` · Dòng 2: tên khách (+ lưu ý, hỏi lại) · Dòng 3: việc tiếp theo (tối đa 2 dòng) · Chân: mã · hạn · avatar chủ.

## Thông số
| Phần | Token | Giá trị |
| --- | --- | --- |
| Cột | `muted`, `radius-xl` | đầu cột: tag trạng thái + số thẻ; danh sách tự cuộn, gap 8 |
| Thẻ | DS `Card` + `shadow-100` | padding 10/12; hover `shadow-200` |
| Đang kéo | | thẻ mờ; cột đích tô nền |
| Cột rỗng | | "Kéo thẻ vào đây" |
| Rỗng do lọc (cả màn) | DS `Empty` | như `Table` |

## Hành vi
- Kéo thả đổi trạng thái → toast có **Hoàn tác**; trạng thái "Chờ" hỏi lý do chờ (khách · KT · vật tư · hãng · duyệt).
- Bấm thẻ → mở bản ghi (như `ListView`); chuột phải → `ContextMenu`.
- Điện thoại: mỗi cột 82% bề ngang, cuộn ngang có snap.

## Bàn phím & a11y
Thẻ `tabIndex=0`, Enter mở; đổi trạng thái bằng bàn phím phải có (dnd-kit KeyboardSensor hoặc menu "Chuyển sang…").

## Code
- `@dnd-kit/core` + `sortable` (đa cột) — **đề xuất thay** HTML5 drag của prototype.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`KanbanTT`) + `bang.css` (`.b-kanban`, `.b-k-*`, `.b-the`).

## Tạo tại chỗ — dòng "+ Mới" (`DongThem`, CEO chốt 25/11/2026)
Chân mỗi cột (trừ cột cuối "Xong") có dòng "+ <tên> mới" (đệm 8, thẳng mép thẻ) qua prop `chanCot`; tạo thẳng vào trạng thái của cột, `nhanDoc` ghép tên cột. Luật đầy đủ (ô gõ kiểu dòng không khung form, Enter tạo, chỉ đặt ở chỗ không lọc): README `ListView` mục "Tạo tại chỗ".
