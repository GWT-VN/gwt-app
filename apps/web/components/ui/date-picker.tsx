'use client'

import { useState } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, kepNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { calendarFoot, calendarFootClear, calendarPop } from './calendar-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { selectTrigger, selectValue } from './control-styles'
import { useMoBangChuot } from './use-mo-bang-chuot'
import { useTriggerChon, type TriggerChonProps } from './use-trigger-chon'

export { calendarFoot, calendarFootClear, calendarPop, kepNgay }

/**
 * DatePicker — chọn MỘT ngày, kiểu Airbnb (README DatePicker). Lưu `YYYY-MM-DD` (`isoNgay`, giờ máy — không
 * `toISOString()`), hiện `dd/MM/yyyy`.
 *
 * - Trigger = `selectTrigger` (y Select) + icon CalendarBlank 16 đầu ô; `aria-haspopup="dialog"` + `aria-expanded` (Radix
 *   Popover). Đặt tên bằng `FieldLabel htmlFor={id}` / `aria-labelledby` / `aria-label`; tên đọc = nhãn + ngày đang chọn
 *   (`useTriggerChon`). Lỗi: `aria-invalid` + `aria-describedby` câu lỗi. `name` → input ẩn `YYYY-MM-DD` cho form.
 *   `onBlur` khi focus rời trigger lúc pop đóng.
 * - Pop = `role="dialog"` "Chọn ngày" (Radix Popover, portal vùng DS, z-90 → mở được trong Dialog/Sheet). Mở: focus ô
 *   đang chọn, không có thì hôm nay (react-day-picker `autoFocus`). Chọn ngày / "Hôm nay" / "Xoá ngày" → đóng, focus về
 *   trigger. Esc đóng pop; trong Dialog chỉ đóng pop (DismissableLayer lớp trên cùng).
 * - Mở bằng chuột: vòng focus của ô ngày ẩn tới phím đầu tiên (`useMoBangChuot`) — preview mở bằng chuột không có vòng.
 * - `min`/`max` (`YYYY-MM-DD`, tính cả 2 đầu): ngày ngoài khoảng gạch ngang, không chọn được; "Hôm nay" tắt nếu hôm nay
 *   ngoài khoảng; tháng mở kẹp vào khoảng, ‹ › không đi ra ngoài tháng của min/max.
 * - `required` / `aria-required` → `aria-required` trên trigger.
 */
export function DatePicker({
  value,
  onValueChange,
  min,
  max,
  placeholder = 'Chọn ngày',
  name,
  ...trig
}: TriggerChonProps & {
  value: string | null
  onValueChange(v: string | null): void
  min?: string
  max?: string
  placeholder?: string
}) {
  const [mo, setMo] = useState(false)
  const { idGiaTri, trigger } = useTriggerChon(trig, !!value, mo)
  const chuot = useMoBangChuot()
  const homNay = isoNgay(new Date())
  const chon = (v: string | null) => {
    onValueChange(v)
    setMo(false)
  }
  const chan = [...(min ? [{ before: ngayTuIso(min) }] : []), ...(max ? [{ after: ngayTuIso(max) }] : [])]
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        <button
          type="button"
          {...trigger}
          data-placeholder={value ? undefined : ''}
          data-slot="date-picker-trigger"
          // cn(): tailwind-merge bỏ chữ 400 của controlOutline để chữ 500 của selectTrigger thắng (y SelectTrigger).
          className={cn(selectTrigger)}
          onPointerDown={chuot.onPointerDown}
          onKeyDown={chuot.onKeyDown}
        >
          <CalendarBlank aria-hidden="true" />
          {/* `.ui-select-trigger > .ui-icon:first-child + .ui-select-value`: giá trị giãn hết phần còn lại, sát icon. */}
          <span id={idGiaTri} data-slot="select-value" className={cn(selectValue, 'flex-1')}>
            {value ? hienNgay(value) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <PopoverContent
        aria-label="Chọn ngày"
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(
          calendarPop,
          // Mở bằng chuột: reset outline y `outline: none` (như mục Select) tới phím đầu tiên.
          'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!',
        )}
        // capture: react-day-picker chặn lan phím (stopPropagation) trong lưới ngày.
        onKeyDownCapture={chuot.onKeyDown}
      >
        <Calendar
          mode="single"
          required
          autoFocus
          selected={value ? ngayTuIso(value) : undefined}
          // Tháng mở kẹp vào [min, max]: hôm nay ngoài khoảng thì mở tháng toàn ô bị chặn, focus không còn chỗ đứng.
          defaultMonth={ngayTuIso(kepNgay(value ?? homNay, min, max))}
          startMonth={min ? ngayTuIso(min) : undefined}
          endMonth={max ? ngayTuIso(max) : undefined}
          disabled={chan}
          onSelect={(d) => chon(isoNgay(d))}
        />
        <div className={calendarFoot}>
          {value ? (
            <Button variant="ghost" size="sm" className={calendarFootClear} onClick={() => chon(null)}>
              Xoá ngày
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={(!!min && homNay < min) || (!!max && homNay > max)}
            onClick={() => chon(homNay)}
          >
            Hôm nay
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
