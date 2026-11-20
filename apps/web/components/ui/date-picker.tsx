'use client'

import { useState } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { menuContent } from './menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { selectTrigger, selectValue } from './select'
import { useMoBangChuot } from './use-mo-bang-chuot'

/**
 * `.ui-menu.ui-cal-pop` (+ `.b-noi.ui-cal-pop`): mặt Menu (nền popover, shadow + hairline, z-90) nhưng rộng theo lịch,
 * padding 20/24, bo --radius-4xl 24; trần cao 100vh − 16 (lịch cao hơn menu thường, không cắt chân). Khổ ≤ 640: rộng
 * 100vw − 16, padding 16. Xuất ra cho DateRangePicker và khối /ds dùng lại.
 */
export const calendarPop = cn(
  menuContent,
  'min-w-0 w-max px-[24px] py-[20px] rounded-(--radius-4xl) max-h-[calc(100vh-16px)]',
  'max-[640px]:w-[calc(100vw-16px)] max-[640px]:max-w-[calc(100vw-16px)] max-[640px]:p-[16px]',
)

/** `.ui-cal-foot`: kẻ trên alpha-08, cách lịch 12 (preview gõ margin-top 12), đệm trên 16; trái "Xoá ngày", phải nút chính. */
export const calendarFoot =
  'mt-[12px] flex items-center justify-between gap-3 pt-[16px] border-none border-current [box-shadow:inset_0_1px_0_var(--alpha-08)] max-[640px]:flex-wrap'

/** `.ui-cal-foot .ui-btn[data-variant=ghost]`: gạch chân, cách chữ 0.15em. */
export const calendarFootClear = 'underline underline-offset-[0.15em]'

/**
 * DatePicker — chọn MỘT ngày, kiểu Airbnb (README DatePicker). Lưu `YYYY-MM-DD` (`isoNgay`, giờ máy — không
 * `toISOString()`), hiện `dd/MM/yyyy`.
 *
 * - Trigger = `selectTrigger` (y Select) + icon CalendarBlank 16 đầu ô; `aria-haspopup="dialog"` + `aria-expanded` (Radix
 *   Popover). Đặt tên bằng `FieldLabel htmlFor={id}`; lỗi: `aria-invalid` + `aria-describedby` câu lỗi.
 * - Pop = `role="dialog"` "Chọn ngày" (Radix Popover, portal vùng DS, z-90 → mở được trong Dialog/Sheet). Mở: focus ô
 *   đang chọn, không có thì hôm nay (react-day-picker `autoFocus`). Chọn ngày / "Hôm nay" / "Xoá ngày" → đóng, focus về
 *   trigger. Esc đóng pop; trong Dialog chỉ đóng pop (DismissableLayer lớp trên cùng).
 * - Mở bằng chuột: vòng focus của ô ngày ẩn tới phím đầu tiên (`useMoBangChuot`) — preview mở bằng chuột không có vòng.
 * - `min`/`max` (`YYYY-MM-DD`, tính cả 2 đầu): ngày ngoài khoảng gạch ngang, không chọn được; "Hôm nay" tắt nếu hôm nay
 *   ngoài khoảng.
 */
export function DatePicker({
  value,
  onValueChange,
  min,
  max,
  placeholder = 'Chọn ngày',
  disabled,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: {
  value: string | null
  onValueChange(v: string | null): void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}) {
  const [mo, setMo] = useState(false)
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
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid || undefined}
          aria-describedby={ariaDescribedby}
          data-placeholder={value ? undefined : ''}
          data-slot="date-picker-trigger"
          // cn(): tailwind-merge bỏ chữ 400 của controlOutline để chữ 500 của selectTrigger thắng (y SelectTrigger).
          className={cn(selectTrigger)}
          onPointerDown={chuot.onPointerDown}
          onKeyDown={chuot.onKeyDown}
        >
          <CalendarBlank aria-hidden="true" />
          {/* `.ui-select-trigger > .ui-icon:first-child + .ui-select-value`: giá trị giãn hết phần còn lại, sát icon. */}
          <span data-slot="select-value" className={cn(selectValue, 'flex-1')}>
            {value ? hienNgay(value) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
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
          defaultMonth={ngayTuIso(value ?? homNay)}
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
