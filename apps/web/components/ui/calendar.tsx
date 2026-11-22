// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { CaretDown, CaretLeft, CaretRight } from '@phosphor-icons/react/ssr'
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type RootProps,
  type WeekNumberProps,
} from 'react-day-picker'
import { vi } from 'react-day-picker/locale'
import { hienNgay, isoNgay } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import type { Button } from './button'
import { buttonVariants } from './button-variants'

/**
 * Calendar — khung shadcn new-york-v4 `calendar.tsx` (export `Calendar` + `CalendarDayButton`, prop `buttonVariant` +
 * `captionLayout`, `data-slot="calendar"` ở gốc, Chevron trái/phải/xuống, WeekNumber), tô lại theo khối `.ui-cal*` của
 * ds/nguon/bundle.css (kiểu Airbnb, README DatePicker). DatePicker + DateRangePicker + DateTimePicker dùng chung.
 *
 * Đối chiếu react-day-picker: shadcn viết cho v9, DS chạy **v10.0.2** — `WeekNumber` của v10 là `th` (shadcn vẽ `td`);
 * `DayButton` của v10 tự focus khi `modifiers.focused` (shadcn thay bằng Button nên tự viết lại effect focus) → DS bọc
 * `DayButton` gốc, không cần effect. Mọi khoá `classNames` giữ thêm tên mặc định `rdp-*` (`getDefaultClassNames`) như
 * shadcn — DS không nạp style.css của react-day-picker nên các tên đó không mang kiểu, chỉ để móc khi cần.
 *
 * Lệch shadcn có chủ đích (GWT): `showOutsideDays` mặc định TẮT (README DatePicker); cờ trạng thái chép lên nút dạng có
 * mặt/không (`data-selected`, `data-range-*`, `data-today`) thay cho `data-selected-single="true|false"`; hôm nay = chấm
 * dưới số (không tô nền ô); nút ngày không phải Button (hình tròn 44 của `.ui-cal-day`); không tô dải khoảng ở `td`
 * (DateRangePicker tự truyền `classNames` range_*).
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
  // Ngày tháng khác (`showOutsideDays`): chữ muted (shadcn `outside`).
  'data-outside:text-muted-foreground',
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

/** Nút ‹ › (`.ui-cal-head .ui-btn[data-size=icon-sm]`): Button `buttonVariant` (mặc định ghost) icon-sm bo tròn, 2 mép. */
const nutThang = (variant: ComponentProps<typeof Button>['variant']) =>
  cn(buttonVariants({ variant, size: 'icon-sm' }), 'pointer-events-auto rounded-(--radius-full)')

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
      data-outside={modifiers.outside || undefined}
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

/*
 * Thành phần thay của react-day-picker khai ở cấp module (shadcn viết arrow ngay trong `components`): arrow trong render
 * là KIỂU component mới mỗi lần Calendar vẽ lại → React gỡ + dựng lại cả cây lịch. DateRangePicker vẽ lại khi rê ô (xem
 * trước dải) → nút ngày bị gỡ giữa cú bấm, mất lượt chọn (bắt được ở date-range-picker.dom.test.tsx).
 */
function GocLich({ rootRef, ...props }: RootProps) {
  return <div data-slot="calendar" ref={rootRef} {...props} />
}

function MuiTen({ orientation, className }: ChevronProps) {
  if (orientation === 'left') return <CaretLeft aria-hidden="true" className={className} />
  if (orientation === 'right') return <CaretRight aria-hidden="true" className={className} />
  return <CaretDown aria-hidden="true" className={className} />
}

/** Ô số tuần (`showWeekNumber`): vuông như ô ngày, 12/18 muted. v10 vẽ `th` (shadcn v9: `td`). */
function SoTuan({ children, week, ...props }: WeekNumberProps) {
  void week
  return (
    <th {...props}>
      <div className="flex size-(--control-size-2xl) items-center justify-center text-center max-[640px]:w-full max-[640px]:h-auto max-[640px]:aspect-square">
        {children}
      </div>
    </th>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  components,
  formatters,
  labels,
  ...props
}: ComponentProps<typeof DayPicker> & { buttonVariant?: ComponentProps<typeof Button>['variant'] }) {
  const md = getDefaultClassNames()
  return (
    <DayPicker
      weekStartsOn={1}
      locale={vi}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('border-none border-current', className)}
      formatters={{
        formatCaption: thangNam,
        formatWeekdayName: thuNgan,
        formatMonthDropdown: (d) => `Tháng ${d.getMonth() + 1}`,
        ...formatters,
      }}
      labels={{
        labelDayButton: (d, m) => [hienNgay(isoNgay(d)), ...nhanTrangThai(m)].join(', '),
        labelGrid: thangNam,
        labelPrevious: () => 'Tháng trước',
        labelNext: () => 'Tháng sau',
        labelNav: () => 'Đổi tháng',
        ...labels,
      }}
      classNames={{
        root: cn('border-none border-current', md.root),
        // `.ui-cal-months`: các tháng cạnh nhau cách 40 (DateRangePicker); nav nổi trên dòng tiêu đề.
        months: cn('relative flex gap-10 border-none border-current', md.months),
        // `.ui-cal-head`: cao 32, ‹ › hai mép (nav phủ ngang, chỉ nút nhận chuột).
        nav: cn(
          'pointer-events-none absolute inset-x-0 top-0 z-1 flex h-(--control-size-md) items-center justify-between border-none border-current',
          md.nav,
        ),
        button_previous: cn(nutThang(buttonVariant), md.button_previous),
        button_next: cn(nutThang(buttonVariant), md.button_next),
        // `.ui-cal`: dòng tiêu đề + lưới cách 8.
        month: cn('flex min-w-0 flex-1 flex-col gap-2 border-none border-current', md.month),
        month_caption: cn('flex h-(--control-size-md) items-center justify-center border-none border-current', md.month_caption),
        // captionLayout thả xuống (shadcn): select trong suốt phủ lên nhãn; khung = viền ô nhập (`--input`, focus alpha-50).
        dropdowns: cn('flex h-(--control-size-md) items-center justify-center gap-1.5 border-none border-current', md.dropdowns),
        dropdown_root: cn(
          'relative rounded-(--radius-md) border-none border-current [box-shadow:inset_0_0_0_1px_var(--input)]',
          'has-focus-visible:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
          md.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 w-full cursor-pointer opacity-0 bg-popover', md.dropdown),
        // `.ui-cal-title`: 16/24 600, một dòng. Dạng thả xuống: nhãn trong khung, 14/20 500, mũi tên 14 muted.
        caption_label: cn(
          'whitespace-nowrap border-none border-current',
          captionLayout === 'label'
            ? 'text-[16px] leading-[24px] font-semibold'
            : 'flex h-(--control-size-md) items-center gap-1 pl-2 pr-1 text-[14px] leading-[20px] font-medium [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          md.caption_label,
        ),
        month_grid: cn(
          'border-separate border-spacing-x-0 border-spacing-y-[2px] -my-[2px] max-[640px]:w-full max-[640px]:table-fixed',
          md.month_grid,
        ),
        weekdays: md.weekdays,
        // `.ui-cal-wd`: cao 28 (--control-size-sm), 12/18 600 muted-foreground, giữa.
        weekday: cn(
          'h-(--control-size-sm) w-(--control-size-2xl) p-0 border-none border-current text-center align-middle text-[12px] leading-[18px] font-semibold text-muted-foreground max-[640px]:w-auto',
          md.weekday,
        ),
        week: md.week,
        week_number_header: cn('w-(--control-size-2xl) p-0 border-none border-current max-[640px]:w-auto', md.week_number_header),
        week_number: cn(
          'p-0 border-none border-current text-[12px] leading-[18px] font-normal text-muted-foreground tabular-nums',
          md.week_number,
        ),
        day: cn('p-0 border-none border-current text-center', md.day),
        hidden: cn('invisible', md.hidden),
        ...classNames,
      }}
      components={{
        Root: GocLich,
        Chevron: MuiTen,
        DayButton: CalendarDayButton,
        WeekNumber: SoTuan,
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
