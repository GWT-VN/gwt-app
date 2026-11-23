Chọn **một ngày** — **kiểu Airbnb** (Dũng chốt 18/11/2026). Trigger dùng lại `Select` (+ icon lịch đầu ô); bảng nổi dùng lại mặt `Menu` (`popover`, `shadow`) nhưng bo lớn `radius-4xl`. Hiển thị **dd/MM/yyyy**, lưu `YYYY-MM-DD`.

**Đặc trưng Airbnb phải giữ:** ô ngày **tròn**; hover chỉ **viền tròn đậm** (không tô nền); ngày chọn **tròn đặc đen**; **không hiện ngày của tháng khác**; ngày không chọn được **gạch ngang**; tiêu đề tháng ở giữa, mũi tên tròn ở 2 mép; khoảng cách rộng rãi.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Trigger | `ui-select-trigger` | icon `CalendarBlank` 16px `muted-foreground` trước giá trị; placeholder "Chọn ngày" |
| Bảng nổi | `ui-menu ui-cal-pop` | padding 20/24, bo `radius-4xl` 24px, cách ô 4px, tự lật lên khi thiếu chỗ, ép vào trong màn; **trần cao = chỗ trống** tới mép màn (`--radix-popover-content-available-height`) + cuộn trong bảng → điện thoại không mất chân |
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

**`min`/`max`:** tháng mở **kẹp vào khoảng** (hôm nay ngoài khoảng → mở tháng gần nhất còn chọn được), ‹ › không đi ra ngoài tháng của min/max.

**Bàn phím & a11y (APG Date Picker Dialog):** trigger là nút thường, tên đọc = **nhãn + ngày đang chọn**; `aria-haspopup="dialog"` `aria-expanded`; bảng `role="dialog"` có nhãn; lưới `role="grid"`, ô `role="gridcell"` + `aria-selected`, `aria-label` đọc đủ ngày ("18/11/2026, hôm nay"). Một ô duy nhất `tabIndex=0`. ←→ ±1 ngày, ↑↓ ±1 tuần, PageUp/PageDown ±1 tháng, Home/End đầu/cuối tuần, Enter chọn, Esc đóng và trả focus về trigger.

**Dùng lại:** `isoNgay()` (`apps/web/bang/ngay.ts`) — **không dùng `toISOString()`** (lệch 1 ngày từ 0–7h sáng giờ VN, xem `ngay.test.ts`); `fmtDate()` để hiển thị.

**Code:** shadcn `Popover` + `Calendar` (react-day-picker v9: `weekStartsOn={1}`, `locale={vi}`, `showOutsideDays={false}`, `disabled={{ before: today }}`) — đổi class theo bảng trên (`day` tròn 44px, `day_button:hover` viền, `selected` tròn đặc, `disabled` gạch ngang). Chưa cài react-day-picker / date-fns: thêm khi code thật. Lọc ngày ở danh sách vẫn đi `LocNgay` (URL `ngtu`/`ngden`), chỉ đổi giao diện.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- `date-picker.tsx` không đổi: API và hình giữ nguyên.
- Thay dòng **Code** ở trên: đang chạy react-day-picker **10.0.2** (đã cài, không dùng date-fns); shadcn viết cho v9.
- `calendar.tsx` theo shadcn: export `Calendar` + `CalendarDayButton`, gốc `data-slot="calendar"`. Prop mới `buttonVariant` (biến thể Button của ‹ ›, mặc định `ghost`), `captionLayout` (mặc định `label`; dạng thả xuống chọn tháng/năm, khung viền ô nhập, "Tháng N"), `showWeekNumber` (ô số tuần 44, 12/18 muted).
- Lệch shadcn giữ: `showOutsideDays` mặc định TẮT; bật thì ngày tháng khác chữ muted (`data-outside`). Hôm nay vẫn là chấm dưới số.
- Cờ trên nút ngày dạng có mặt/không: `data-selected`, `data-today`, `data-outside`, `data-range-start|middle|end` (không dùng `data-selected-single` của shadcn).
- Lớp `rdp-*` mặc định được gắn thêm để móc khi cần, không mang kiểu (DS không nạp style.css của react-day-picker).
- `popover.tsx` theo shadcn: `PopoverContent` nay mang sẵn mặt `.ui-menu` (nền popover, bo radius-xl, bóng) + `w-72 p-4`; khung lịch truyền `className` riêng đè lên, khung không tự đặt rộng thì thêm `w-auto`. Mới: `PopoverHeader`, `PopoverTitle`, `PopoverDescription`. Giữ `align="start"`, `collisionPadding` 8, z-90.
- DateTimePicker (README riêng) dùng chung Calendar này.
