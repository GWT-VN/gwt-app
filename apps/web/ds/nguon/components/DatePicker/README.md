Chọn **một ngày** — **kiểu Airbnb** (Dũng chốt 18/11/2026). Trigger dùng lại `Select` (+ icon lịch đầu ô); bảng nổi dùng lại mặt `Menu` (`popover`, `shadow`) nhưng bo lớn `radius-4xl`. Hiển thị **dd/MM/yyyy**, lưu `YYYY-MM-DD`.

**Đặc trưng Airbnb phải giữ:** ô ngày **tròn**; hover chỉ **viền tròn đậm** (không tô nền); ngày chọn **tròn đặc đen**; **không hiện ngày của tháng khác**; ngày không chọn được **gạch ngang**; tiêu đề tháng ở giữa, mũi tên tròn ở 2 mép; khoảng cách rộng rãi.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Trigger | `ui-select-trigger` | icon `CalendarBlank` 16px `muted-foreground` trước giá trị; placeholder "Chọn ngày" |
| Bảng nổi | `ui-menu ui-cal-pop` | padding 20/24, bo `radius-4xl` 24px, cách ô 4px, tự lật lên khi thiếu chỗ, ép vào trong màn |
| Tiêu đề tháng | `heading-xs` | "Tháng 11, 2026" 16/24 600, căn giữa; ‹ › = `Button ghost icon-sm` bo tròn |
| Thứ | `muted-foreground` | T2 … CN (**tuần bắt đầu Thứ 2**), 12/18 600 |
| Ô ngày | `control-size-2xl` | **44×44 tròn**, chữ 14/20 **600** `tabular-nums`, `foreground` |
| Hover | `foreground` | viền tròn 1.5px trong ô, **không đổi nền** |
| Đã chọn | `color-background-primary-solid` / `color-text-primary-solid` | hình tròn đặc; hover `…-hover` |
| Hôm nay | | chấm 4px dưới số |
| Bị chặn | `color-text-disabled` | chữ 400 + **gạch ngang**, không bấm/không hover |
| Focus (phím) | `ring` | outline 2px theo hình tròn |
| Chân | | trái "Xoá ngày" (`ghost sm`, gạch chân) khi đã có giá trị · phải "Hôm nay" (`outline sm`); kẻ trên `alpha-08` |
| Điện thoại ≤ 640px | | bảng rộng `100vw − 16px`, ô ngày giãn đủ ngang (vuông, `aspect-ratio: 1`) |

**Bàn phím & a11y (APG Date Picker Dialog):** trigger `aria-haspopup="dialog"` `aria-expanded`; bảng `role="dialog"` có nhãn; lưới `role="grid"`, ô `role="gridcell"` + `aria-selected`, `aria-label` đọc đủ ngày ("18/11/2026, hôm nay"). Một ô duy nhất `tabIndex=0`. ←→ ±1 ngày, ↑↓ ±1 tuần, PageUp/PageDown ±1 tháng, Home/End đầu/cuối tuần, Enter chọn, Esc đóng và trả focus về trigger.

**Dùng lại:** `isoNgay()` (`apps/web/bang/ngay.ts`) — **không dùng `toISOString()`** (lệch 1 ngày từ 0–7h sáng giờ VN, xem `ngay.test.ts`); `fmtDate()` để hiển thị.

**Code:** shadcn `Popover` + `Calendar` (react-day-picker v9: `weekStartsOn={1}`, `locale={vi}`, `showOutsideDays={false}`, `disabled={{ before: today }}`) — đổi class theo bảng trên (`day` tròn 44px, `day_button:hover` viền, `selected` tròn đặc, `disabled` gạch ngang). Chưa cài react-day-picker / date-fns: thêm khi code thật. Lọc ngày ở danh sách vẫn đi `LocNgay` (URL `ngtu`/`ngden`), chỉ đổi giao diện.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
