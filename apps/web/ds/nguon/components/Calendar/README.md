Lưới tháng để chọn một ngày hoặc một khoảng ngày — lõi của DatePicker, DateRangePicker, DateTimePicker.

**Lên artifact 23/11/2026** (lịch nằm trong DatePicker/DateRangePicker — cổng so khớp đo lịch qua hai khối đó) — khung shadcn new-york-v4 (`calendar.tsx` @45bbf9b, MIT) trên react-day-picker **10.0.2** (shadcn viết cho v9), chép ở Đợt 7 chép shadcn (21/11/2026). Token `.ui-cal*` của `bundle.css`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Tiêu đề | `.ui-cal-title` | "Tháng 11, 2026", 16/24 600; ‹ › Button `buttonVariant` (mặc định ghost) icon-sm tròn |
| Thứ | `.ui-cal-wd` | T2…CN, cao 28, 12/18 600 muted |
| Ô ngày | `.ui-cal-day` | tròn 44, 14/20 600; chọn = tròn đặc primary-solid; hôm nay = chấm 4; chặn = gạch ngang; ≤640 ô giãn vuông |
| Khoảng | `.ui-cal-day[data-range]` | hai đầu tròn đặc, giữa nền alpha-05 |
| Thả xuống (`captionLayout="dropdown"`) | viền ô nhập | select trong suốt phủ nhãn 14/20 500, viền `--input`, focus alpha-50 |
| Số tuần (`showWeekNumber`) | — | ô 44, 12/18 muted |

- **Đủ khung shadcn:** export `Calendar` + `CalendarDayButton`, prop `buttonVariant`, `captionLayout`, `data-slot="calendar"`, Chevron trái/phải/xuống, WeekNumber.
- **Đối chiếu v10:** WeekNumber là `th` (shadcn `td`); DayButton gốc tự focus nên DS bọc nó, không viết lại effect. Thành phần thay khai cấp module — arrow trong `components` làm cây lịch dựng lại mỗi lần vẽ lại (DateRangePicker mất lượt bấm).
- **GWT giữ:** tuần bắt đầu Thứ 2, `locale` vi, `showOutsideDays` mặc định tắt, nhãn ô đọc "21/11/2026, đã chọn".
- Màn nghiệp vụ dùng **DatePicker / DateRangePicker / DateTimePicker** (ô + pop + chân Áp dụng), không đặt Calendar trần.

**Code:** `components/ui/calendar.tsx` (+ `calendar-styles.ts`). Khối `/ds#calendar`.
