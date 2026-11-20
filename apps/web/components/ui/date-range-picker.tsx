'use client'

import { useState, useSyncExternalStore } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, khoangPreset, ngayTuIso, PRESETS } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { calendarFoot, calendarFootClear, calendarPop } from './date-picker'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { selectTrigger, selectValue } from './select'
import { useMoBangChuot } from './use-mo-bang-chuot'

export type KhoangNgay = { tu: string; den: string }
type Nhap = { tu?: string; den?: string }

/** Khổ điện thoại (`@media (max-width: 640px)` của bundle) — đọc qua useSyncExternalStore; máy chủ/jsdom = khổ rộng. */
const HEP = '(max-width: 640px)'
const theoDoiHep = (bao: () => void) => {
  if (typeof matchMedia === 'undefined') return () => {}
  const m = matchMedia(HEP)
  m.addEventListener('change', bao)
  return () => m.removeEventListener('change', bao)
}
const useHep = () =>
  useSyncExternalStore(theoDoiHep, () => typeof matchMedia !== 'undefined' && matchMedia(HEP).matches, () => false)

const dauThang = (iso: string) => {
  const d = ngayTuIso(iso)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
const congThang = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
/** Số ngày tính cả 2 đầu. Math.round: an toàn cả ở múi giờ có đổi giờ (ngày 23/25 giờ). */
const soNgay = (k: KhoangNgay) => Math.round((ngayTuIso(k.den).getTime() - ngayTuIso(k.tu).getTime()) / 864e5) + 1
/** "01/11/2026 – 18/11/2026"; khoảng 1 ngày chỉ hiện 1 ngày. */
export const hienKhoang = (k: KhoangNgay) => (k.tu === k.den ? hienNgay(k.tu) : `${hienNgay(k.tu)} – ${hienNgay(k.den)}`)

/**
 * `.ui-cal-field`: ô Từ ngày / Đến ngày của đầu bảng — padding 6 12, bo --radius-lg, chữ 14/20 400 trái; nhãn 10/14 600
 * in hoa giãn 0.04em; trống → giá trị tertiary. Ô sau kẻ trái 1px input (`.ui-cal-field + .ui-cal-field`). Đang chọn
 * (`aria-pressed`) viền 2 foreground, nền background. Focus phím: outline 2 ring cách 2.
 */
function OKhoang({ nhan, gt, bat, sau, onClick }: { nhan: string; gt?: string; bat: boolean; sau?: boolean; onClick(): void }) {
  return (
    <button
      type="button"
      aria-pressed={bat}
      data-trong={gt ? undefined : ''}
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-0 px-[12px] py-[6px] rounded-(--radius-lg) border-none border-current bg-transparent',
        'text-left text-[14px] leading-[20px] font-normal text-foreground cursor-pointer',
        sau && '[box-shadow:inset_1px_0_0_var(--input)]',
        'aria-pressed:[box-shadow:inset_0_0_0_2px_var(--foreground)] aria-pressed:bg-background',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:outline-offset-2',
      )}
    >
      <span className="border-none border-current text-[10px] leading-[14px] font-semibold tracking-[0.04em] uppercase">{nhan}</span>
      <span className="border-none border-current in-data-trong:text-(--color-text-tertiary)">
        {gt ? hienNgay(gt) : 'Chọn ngày'}
      </span>
    </button>
  )
}

/**
 * Ruột bảng chọn khoảng (`.ui-cal-range`): đầu bảng · lịch · mốc nhanh · chân. Giữ BẢN NHÁP riêng, chỉ báo ra khi Áp dụng
 * (`onApply`) — DateRangePicker gắn vào Popover (nội dung unmount khi đóng → mở lại nháp = `value`). Xuất ra cho khối /ds
 * dựng bảng mở sẵn (ngày `today` cố định để đo).
 *
 * - Bấm lần 1 = ngày đầu; lần 2 = ngày cuối; bấm trước ngày đầu (khi chưa có cuối) hoặc khi đã đủ 2 đầu → làm lại ngày đầu.
 *   Tự xử lý bằng ngày bấm (`onSelect` đối số 2), không dùng `addToRange` của react-day-picker (nó nới khoảng về trước).
 * - Đã có ngày đầu, rê lên ngày sau → dải xem trước tới ô đang rê (modifier `preview_*` của Calendar).
 * - 2 tháng (tháng phải chứa ngày cuối / hôm nay); ≤ 640px chỉ 1 tháng đó, đủ ‹ ›. Phím đưa focus ra ngoài tháng đang
 *   xem → react-day-picker tự lật tháng.
 * - Mốc nhanh = `PRESETS`/`khoangPreset` của bang/ngay.ts ("30 ngày" = 31 ngày tính cả 2 đầu, giữ như ngay.ts). Mốc
 *   ngoài `min`/`max` tắt.
 * - Áp dụng tắt khi mới có 1 đầu; nháp trống (sau "Xoá ngày") + đang có giá trị → Áp dụng = xoá (`null`).
 */
export function DateRangePanel({
  value,
  onApply,
  onCancel,
  today,
  min,
  max,
  autoFocus,
}: {
  value: KhoangNgay | null
  onApply(v: KhoangNgay | null): void
  onCancel(): void
  /** 'YYYY-MM-DD' — mặc định hôm nay giờ máy. */
  today?: string
  min?: string
  max?: string
  autoFocus?: boolean
}) {
  const homNay = today ?? isoNgay(new Date())
  const hep = useHep()
  const [nhap, setNhap] = useState<Nhap>(value ?? {})
  const [re, setRe] = useState<string | null>(null)
  const [thangPhai, setThangPhai] = useState(() => dauThang(value?.den ?? homNay))
  const du = nhap.tu && nhap.den ? (nhap as KhoangNgay) : null
  const dangChon = nhap.tu && !nhap.den ? 'den' : 'tu'
  const xem = nhap.tu && !nhap.den && re && re > nhap.tu ? re : undefined
  const chon = (s: string) => setNhap((k) => (!k.tu || k.den || s < k.tu ? { tu: s } : { tu: k.tu, den: s }))
  const ngoai = (k: KhoangNgay) => (!!min && k.tu < min) || (!!max && k.den > max)
  return (
    <div className="flex flex-col gap-4 border-none border-current">
      {/* `.ui-cal-top`: trái số ngày, phải 2 ô; ≤ 640 xếp dọc cách 12, ô rộng hết. */}
      <div
        data-so="dau-bang"
        className="flex items-start justify-between gap-6 border-none border-current max-[640px]:flex-col max-[640px]:gap-3"
      >
        <div className="border-none border-current">
          {/* `.ui-cal-top-title` 18/26 600 (heading-sm). */}
          <p aria-live="polite" className="m-0 border-none border-current text-[18px] leading-[26px] font-semibold">
            {du ? `${soNgay(du)} ngày` : dangChon === 'tu' ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}
          </p>
          {/* `.ui-caption` 12/18 muted. */}
          <span className="border-none border-current text-[12px] leading-[18px] text-muted-foreground">
            {du ? `${hienNgay(du.tu)} – ${hienNgay(du.den)}` : 'Bấm ngày đầu rồi ngày cuối'}
          </span>
        </div>
        {/* `.ui-cal-fields`: lưới 2 cột rộng 280 (≤ 640 hết ngang), bo --radius-lg, viền 1px input. */}
        <div
          role="group"
          aria-label="Khoảng đang chọn"
          data-so="o-khoang"
          className="grid w-[280px] grid-cols-2 rounded-(--radius-lg) border-none border-current [box-shadow:inset_0_0_0_1px_var(--input)] max-[640px]:w-full"
        >
          <OKhoang nhan="Từ ngày" gt={nhap.tu} bat={dangChon === 'tu'} onClick={() => setNhap({})} />
          <OKhoang
            nhan="Đến ngày"
            gt={nhap.den}
            bat={dangChon === 'den'}
            sau
            onClick={() => nhap.tu && setNhap({ tu: nhap.tu })}
          />
        </div>
      </div>
      <div className="border-none border-current" onMouseLeave={() => setRe(null)}>
        <Calendar
          mode="range"
          autoFocus={autoFocus}
          today={ngayTuIso(homNay)}
          numberOfMonths={hep ? 1 : 2}
          month={hep ? thangPhai : congThang(thangPhai, -1)}
          onMonthChange={(m) => setThangPhai(hep ? m : congThang(m, 1))}
          selected={nhap.tu ? { from: ngayTuIso(nhap.tu), to: nhap.den ? ngayTuIso(nhap.den) : undefined } : undefined}
          onSelect={(_, d) => chon(isoNgay(d))}
          onDayMouseEnter={(d) => setRe(isoNgay(d))}
          modifiers={
            xem && nhap.tu
              ? {
                  preview_start: ngayTuIso(nhap.tu),
                  preview_middle: { after: ngayTuIso(nhap.tu), before: ngayTuIso(xem) },
                  preview_end: ngayTuIso(xem),
                }
              : undefined
          }
          disabled={[...(min ? [{ before: ngayTuIso(min) }] : []), ...(max ? [{ after: ngayTuIso(max) }] : [])]}
        />
      </div>
      {/* `.ui-cal-presets`: hàng nút outline sm cách 8; mốc đang khớp viền 2 foreground + nền alpha-04 (thắng cả hover). */}
      <div role="group" aria-label="Mốc nhanh" data-so="moc" className="flex flex-wrap gap-2 border-none border-current">
        {PRESETS.map((p) => {
          const k = khoangPreset(p.ma, ngayTuIso(homNay))
          return (
            <Button
              key={p.ma}
              variant="outline"
              size="sm"
              aria-pressed={nhap.tu === k.tu && nhap.den === k.den}
              disabled={ngoai(k)}
              className="aria-pressed:[box-shadow:inset_0_0_0_2px_var(--foreground)]! aria-pressed:bg-(--alpha-04)!"
              onClick={() => {
                setNhap(k)
                setThangPhai(dauThang(k.den))
              }}
            >
              {p.nhan}
            </Button>
          )
        })}
      </div>
      {/* `.ui-cal-foot` trong `.ui-cal-range` (gap 16 thay margin-top 12 của DatePicker): trái Xoá ngày, phải `.ui-row`. */}
      <div data-so="chan" className={cn(calendarFoot, 'mt-0')}>
        <Button variant="ghost" size="sm" className={calendarFootClear} disabled={!nhap.tu} onClick={() => setNhap({})}>
          Xoá ngày
        </Button>
        <span className="flex flex-wrap items-center gap-2 border-none border-current max-[640px]:ml-auto">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Huỷ
          </Button>
          <Button size="sm" disabled={du ? false : !!nhap.tu || !value} onClick={() => onApply(du)}>
            Áp dụng
          </Button>
        </span>
      </div>
    </div>
  )
}

/**
 * DateRangePicker — chọn KHOẢNG ngày, kiểu Airbnb (README DateRangePicker). Lưu `{ tu, den }` dạng `YYYY-MM-DD`
 * (`isoNgay`, giờ máy — không `toISOString()`), trigger hiện "dd/MM/yyyy – dd/MM/yyyy".
 *
 * - Trigger = `selectTrigger` + CalendarBlank 16 (y DatePicker); `aria-haspopup="dialog"`. Đặt tên bằng
 *   `FieldLabel htmlFor={id}`.
 * - Pop = `role="dialog"` "Chọn khoảng ngày" (Radix Popover, portal vùng DS, z-90 → mở được trong Dialog/Sheet), mặt
 *   `calendarPop` (≤ 640 rộng 100vw − 16). Mở: focus ngày đầu đang chọn, không có thì hôm nay.
 * - Giá trị CHỈ đổi khi Áp dụng (đóng + focus trigger). Huỷ / Esc / bấm ngoài = bỏ nháp, giữ giá trị cũ. Trong Dialog,
 *   Esc chỉ đóng bảng.
 * - `min`/`max` ('YYYY-MM-DD', tính cả 2 đầu): ngày ngoài khoảng gạch ngang, mốc nhanh ngoài khoảng tắt.
 */
export function DateRangePicker({
  value,
  onValueChange,
  min,
  max,
  placeholder = 'Chọn khoảng ngày',
  disabled,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: {
  value: KhoangNgay | null
  onValueChange(v: KhoangNgay | null): void
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
          data-slot="date-range-picker-trigger"
          className={cn(selectTrigger)}
          onPointerDown={chuot.onPointerDown}
          onKeyDown={chuot.onKeyDown}
        >
          <CalendarBlank aria-hidden="true" />
          <span data-slot="select-value" className={cn(selectValue, 'flex-1')}>
            {value ? hienKhoang(value) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Chọn khoảng ngày"
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(
          calendarPop,
          'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!',
        )}
        // capture: react-day-picker chặn lan phím (stopPropagation) trong lưới ngày.
        onKeyDownCapture={chuot.onKeyDown}
      >
        <DateRangePanel
          value={value}
          min={min}
          max={max}
          autoFocus
          onCancel={() => setMo(false)}
          onApply={(v) => {
            onValueChange(v)
            setMo(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
