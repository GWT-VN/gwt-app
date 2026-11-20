'use client'

import type { ComponentProps } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/ssr'
import { DayButton, DayPicker } from 'react-day-picker'
import { vi } from 'react-day-picker/locale'
import { hienNgay, isoNgay } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'

/**
 * Calendar — khung shadcn (react-day-picker 10 `DayPicker`) tô lại theo khối `.ui-cal*` của ds/nguon/bundle.css (kiểu
 * Airbnb, README DatePicker). DatePicker + DateRangePicker dùng chung.
 *
 * - Mặc định: tuần bắt đầu Thứ 2, `locale` vi, KHÔNG hiện ngày tháng khác. Tiêu đề "Tháng 11, 2026", thứ T2…CN, nhãn ô
 *   "18/11/2026, hôm nay" (README; dùng `hienNgay`/`isoNgay` của bang/ngay.ts, không `toISOString()`).
 * - Bàn phím của react-day-picker (APG Date Picker Dialog): ←→ ±1 ngày, ↑↓ ±1 tuần, PageUp/PageDown ±1 tháng, Home/End
 *   đầu/cuối tuần, Enter/Space chọn; một ô duy nhất tabIndex 0. Ngày bị chặn: nút `disabled` (đang focus thì
 *   `aria-disabled`) — y preview, phím đi qua thì bỏ qua.
 * - DOM của react-day-picker: ô lưới (`role=gridcell`, `aria-selected`) là `td`, hình tròn là `<button>` bên trong. Cờ
 *   trạng thái chép lên chính nút (`data-today`, `data-selected`, `data-range-start|middle|end`) để tô bằng class của
 *   nút — DateRangePicker tô dải qua `classNames` (range_start/range_middle/range_end áp lên `td`) và các cờ này.
 * - `classNames`/`components`/`formatters`/`labels` của người gọi ghép ĐÈ lên mặc định (theo khoá).
 * - Bố cục: `table` giữ ngữ nghĩa lưới; hàng cách 2 bằng border-spacing (bù −2 trên/dưới) thay cho row-gap của
 *   `.ui-cal-grid`. Khổ ≤ 640: bảng rộng hết, ô ngày giãn vuông (`aspect-ratio: 1`) như `.ui-cal-pop` của bundle.
 */

const thangNam = (d: Date) => `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`

/**
 * Đuôi nhãn đọc của ô ngày (thay đuôi "selected" của labelDayButton gốc react-day-picker): focus nằm trên `<button>`,
 * còn `aria-selected` ở `td` → trình đọc màn hình chỉ biết ngày đang chọn qua nhãn nút. Khoảng đủ 2 đầu: "ngày bắt đầu"
 * / "ngày kết thúc" / "trong khoảng đã chọn" (cùng logic `range_middle` của data-selected bên dưới); còn lại "đã chọn".
 */
const nhanTrangThai = (m: Record<string, boolean>) => [
  ...(m.today ? ['hôm nay'] : []),
  ...(m.range_start || m.range_end
    ? [...(m.range_start ? ['ngày bắt đầu'] : []), ...(m.range_end ? ['ngày kết thúc'] : [])]
    : m.range_middle
      ? ['trong khoảng đã chọn']
      : m.selected
        ? ['đã chọn']
        : []),
]

/** Tên thứ ngắn: T2…T7, CN (getDay: 0 = CN). */
const thuNgan = (d: Date) => (d.getDay() === 0 ? 'CN' : `T${d.getDay() + 1}`)

/**
 * `.ui-cal-day`: tròn 44 (--control-size-2xl), chữ 600 14/20 tabular-nums foreground, nền trong suốt, không viền. Hình
 * vẽ ở ::before (tròn, dưới chữ): rê → viền tròn 1.5 foreground (không đổi nền, không áp cho ô bị chặn/đang chọn) ·
 * đang chọn → tròn đặc primary-solid, chữ primary-solid, rê đậm hơn (…-hover) · hôm nay → chấm 4 cách đáy 6 (::after,
 * màu chữ) · bị chặn → chữ 400 color-text-disabled gạch ngang, not-allowed · focus phím → outline 2 ring theo hình tròn.
 */
export const calendarDay = [
  'relative isolate grid place-content-center size-(--control-size-2xl) p-0 rounded-(--radius-full)',
  'border-none border-current bg-transparent text-foreground cursor-pointer',
  'text-[14px] leading-[20px] font-semibold tabular-nums',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:outline-offset-0',
  // border-none border-current trên ::before/::after: preflight Tailwind cho mọi pseudo viền 0 solid màu --border; bundle không viền.
  'before:absolute before:inset-0 before:-z-1 before:rounded-(--radius-full) before:border-none before:border-current',
  'enabled:not-aria-disabled:not-data-selected:hover:before:[box-shadow:inset_0_0_0_1.5px_var(--foreground)]',
  'data-selected:text-(--color-text-primary-solid) data-selected:before:bg-(--color-background-primary-solid)',
  'data-selected:hover:before:bg-(--color-background-primary-solid-hover)',
  'data-today:after:absolute data-today:after:bottom-[6px] data-today:after:left-1/2 data-today:after:-ml-[2px]',
  'data-today:after:size-1 data-today:after:rounded-(--radius-full) data-today:after:bg-current',
  'data-today:after:border-none data-today:after:border-current',
  'disabled:font-normal disabled:text-(--color-text-disabled) disabled:line-through disabled:cursor-not-allowed',
  'aria-disabled:font-normal aria-disabled:text-(--color-text-disabled) aria-disabled:line-through aria-disabled:cursor-not-allowed',
  // ≤ 640 (`.ui-cal-pop .ui-cal-day`): ô giãn đủ ngang, vuông.
  'max-[640px]:w-full max-[640px]:h-auto max-[640px]:aspect-square',
  // Dải khoảng (`.ui-cal-day[data-range]`, DateRangePicker): ô vuông (vòng focus vuông theo), hình tròn ::before giữ
  // nguyên. Giữa dải nền alpha-05; đầu/cuối nửa dải phía trong (gradient 50%); đầu = cuối (khoảng 1 ngày) không dải.
  // Xem trước (`[data-preview]`): ô đang rê khi mới có ngày đầu → viền tròn 1.5 foreground như rê.
  'data-range-start:rounded-none data-range-middle:rounded-none data-range-end:rounded-none',
  'data-range-middle:bg-(--alpha-05)',
  '[&[data-range-start]:not([data-range-end])]:bg-[linear-gradient(to_right,transparent_50%,var(--alpha-05)_50%)]',
  '[&[data-range-end]:not([data-range-start])]:bg-[linear-gradient(to_left,transparent_50%,var(--alpha-05)_50%)]',
  'data-preview:before:[box-shadow:inset_0_0_0_1.5px_var(--foreground)]',
].join(' ')

/** Nút ‹ › (`.ui-cal-head .ui-btn[data-size=icon-sm]`): Button ghost icon-sm bo tròn, nằm 2 mép dòng tiêu đề. */
const nutThang = cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'pointer-events-auto rounded-(--radius-full)')

/**
 * Cờ dải: `range_*` của react-day-picker (mode="range", chỉ khi đủ 2 đầu) HOẶC `preview_*` — modifier tự đặt của người
 * gọi cho dải xem trước lúc rê (DateRangePicker). Giữa dải (`range_middle`) KHÔNG mang `data-selected`: react-day-picker
 * coi cả khoảng là "selected" (aria-selected trên td), nhưng hình tròn đặc chỉ ở 2 đầu (bundle `.ui-cal-day[data-range="mid"]`).
 */
function CalendarDayButton({ modifiers, className, ...props }: ComponentProps<typeof DayButton>) {
  return (
    <DayButton
      modifiers={modifiers}
      data-today={modifiers.today || undefined}
      data-selected={(modifiers.selected && !modifiers.range_middle) || undefined}
      data-range-start={modifiers.range_start || modifiers.preview_start || undefined}
      data-range-middle={modifiers.range_middle || modifiers.preview_middle || undefined}
      data-range-end={modifiers.range_end || modifiers.preview_end || undefined}
      data-preview={modifiers.preview_end || undefined}
      className={cn(calendarDay, className)}
      {...props}
    />
  )
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  components,
  formatters,
  labels,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      weekStartsOn={1}
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn('border-none border-current', className)}
      formatters={{ formatCaption: thangNam, formatWeekdayName: thuNgan, ...formatters }}
      labels={{
        labelDayButton: (d, m) => [hienNgay(isoNgay(d)), ...nhanTrangThai(m)].join(', '),
        labelGrid: thangNam,
        labelPrevious: () => 'Tháng trước',
        labelNext: () => 'Tháng sau',
        labelNav: () => 'Đổi tháng',
        ...labels,
      }}
      classNames={{
        root: 'border-none border-current',
        // `.ui-cal-months`: các tháng cạnh nhau cách 40 (DateRangePicker); nav nổi trên dòng tiêu đề.
        months: 'relative flex gap-10 border-none border-current',
        // `.ui-cal-head`: cao 32, ‹ › hai mép (nav phủ ngang, chỉ nút nhận chuột).
        nav: 'pointer-events-none absolute inset-x-0 top-0 z-1 flex h-(--control-size-md) items-center justify-between border-none border-current',
        button_previous: nutThang,
        button_next: nutThang,
        // `.ui-cal`: dòng tiêu đề + lưới cách 8.
        month: 'flex min-w-0 flex-1 flex-col gap-2 border-none border-current',
        month_caption: 'flex h-(--control-size-md) items-center justify-center border-none border-current',
        // `.ui-cal-title`: 16/24 600, một dòng.
        caption_label: 'whitespace-nowrap border-none border-current text-[16px] leading-[24px] font-semibold',
        month_grid: 'border-separate border-spacing-x-0 border-spacing-y-[2px] -my-[2px] max-[640px]:w-full max-[640px]:table-fixed',
        weekdays: '',
        // `.ui-cal-wd`: cao 28 (--control-size-sm), 12/18 600 muted-foreground, giữa.
        weekday:
          'h-(--control-size-sm) w-(--control-size-2xl) p-0 border-none border-current text-center align-middle text-[12px] leading-[18px] font-semibold text-muted-foreground max-[640px]:w-auto',
        week: '',
        day: 'p-0 border-none border-current text-center',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <CaretLeft aria-hidden="true" /> : <CaretRight aria-hidden="true" />,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}
