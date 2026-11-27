'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react/ssr'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { docNgay, ghepIso, hienNgayGio, hienNgayGioGon, laChiNgay, MUI_VN, tachIso } from '@/lib/gio'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { calendarFoot, calendarFootClear, calendarPop } from './calendar-styles'
import { selectTrigger, selectValue } from './control-styles'
import { useDeO } from './de-o'
import { oSua, oSuaDeO, oSuaMui } from './inline-edit-styles'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Switch } from './switch'
import { TimeInput } from './time-input'
import { useMoBangChuot } from './use-mo-bang-chuot'
import { useTriggerChon, type TriggerChonProps } from './use-trigger-chon'

export { ghepIso, hienNgayGio, hienNgayGioGon, laChiNgay, tachIso }

/**
 * DateTimePicker — chọn ngày, giờ tuỳ chọn (biến thể A4 của prototype chon-gio, CEO duyệt 20/11; sửa 22/11). Giá trị hai
 * dạng: có giờ = ISO có múi (`2026-11-25T14:30:00+07:00`) hiện "25/11 · 14:30" / gọn "25/11 14:30" (khác năm "25/11/25 …"); **chỉ ngày**
 * = `2026-11-25` hiện "25/11"; ô GÕ ngày vẫn dd/MM/yyyy (`docNgay` đọc lại) (CEO 22/11: chọn ngày không thì chỉ lưu ngày, KHÔNG tự gán giờ).
 *
 * - Pop: lịch trên, hai ô gõ [ngày][giờ] (`Input` + `TimeInput`) ngay dưới lịch (CEO 22/11), đồng bộ hai chiều; chân pop
 *   **Xoá** (trái, khi có giá trị) · **Huỷ** + **Xong** (phải). Mở pop là focus ô ngày (chọn hết chữ để gõ đè).
 * - **Chỉ lưu khi Xong** (hoặc Enter ở ô ngày / ô giờ; IME đang ghép thì không). Huỷ / Esc / bấm ra ngoài = bỏ nháp; mở
 *   lại luôn nạp từ `value`. Xoá có hiệu lực ngay (lệnh rõ ràng). Ô ngày gõ sai / ngày đã qua → `aria-invalid`, Xong tắt.
 * - Ô ngày nhận "dd/mm", "dd/mm/yyyy" (`docNgay`). Chỉ đổi giờ, ô ngày trống → ngày của `value`, chưa có thì hôm nay.
 *   Chỉ chọn ngày → giờ đang có của `value` (nếu có), không thì lưu CHỈ NGÀY. Ô giờ trống placeholder "Giờ"; có giờ thì
 *   nút ✕ "Xoá giờ" (TimeInput) đưa về chỉ ngày. `gioMacDinh`: KHÔNG có mặc định — chỉ khi bên gọi truyền mới tự gán giờ
 *   đó khi chỉ chọn ngày (và hiện làm placeholder).
 * - Ngày trước `tuNgay` (mặc định hôm nay) bị tắt, TRỪ ngày của `value` (hạn cũ đã qua vẫn hiện, chọn lại được).
 * - `value` từ DB ở múi khác (`…Z`) được đổi về `mui` trước khi hiện / sửa (`tachIso`).
 * - `open` / `onOpenChange` điều khiển từ ngoài được (vd mục menu "Đặt hạn…" mở pop tại ô Hạn).
 * - Học Notion 27/11: công tắc **Có giờ** (Notion "Include time") — tắt thì ẩn ô giờ và lưu CHỈ NGÀY (bỏ cả `gioMacDinh`);
 *   mở pop thì công tắc bật sẵn khi `value` có giờ hoặc bên gọi có `gioMacDinh`. Chân pop có **Hôm nay** (đặt ô ngày = hôm
 *   nay, lịch về tháng này — chưa lưu, vẫn bấm Xong).
 * - Trigger: ô form = `selectTrigger` + CalendarBlank (y DatePicker — cùng cao); `gon` = nút `oSua` của InlineEdit.
 *   Tên đọc = nhãn + giá trị (`useTriggerChon`). Pop `role="dialog"` "Chọn ngày giờ", portal vùng DS z-90.
 */
export function DateTimePicker({
  value,
  onValueChange,
  gioMacDinh,
  mui = MUI_VN,
  tuNgay,
  gon,
  open,
  onOpenChange,
  placeholder = 'Chọn ngày giờ',
  name,
  hienGon,
  choXoa = true,
  ...trig
}: TriggerChonProps & {
  /** ISO có múi (`2026-11-25T14:30:00+07:00`) hoặc chỉ ngày (`2026-11-25`); null = chưa có. */
  value: string | null
  onValueChange(v: string | null): void
  /** "HH:mm" tự gán khi chỉ chọn ngày. Bỏ trống (mặc định) = chỉ lưu ngày. */
  gioMacDinh?: string
  /** Múi lưu + hiện, mặc định "+07:00". */
  mui?: string
  /** "YYYY-MM-DD": ngày trước đó bị tắt (trừ ngày của value). Mặc định hôm nay. */
  tuNgay?: string
  /** Trigger kiểu ô sửa tại chỗ trong dòng bảng. */
  gon?: boolean
  open?: boolean
  onOpenChange?(o: boolean): void
  placeholder?: string
  /** `gon`: cách hiện giá trị trong ô, kể cả khi trống ("") — vd chữ hạn có màu / "—" của `OSuaHan`; mặc định `hienNgayGioGon`. */
  hienGon?: (v: string) => ReactNode
  /** false → không có nút "Xoá" ở chân pop (bên gọi có chỗ xoá riêng hoặc không cho xoá). */
  choXoa?: boolean
}) {
  const [moTrong, setMoTrong] = useState(false)
  const mo = open ?? moTrong
  const datMo = (m: boolean) => {
    if (open === undefined) setMoTrong(m)
    onOpenChange?.(m)
  }
  const { idGiaTri, trigger } = useTriggerChon(trig, !!value, mo)
  const chuot = useMoBangChuot()
  const deO = useDeO()

  const nay = isoNgay(new Date())
  const tu = tuNgay ?? nay
  const cu = value ? tachIso(value, mui) : null

  // Nháp: chữ ô ngày + giờ + tháng lịch. Nạp lại từ value mỗi lần pop chuyển sang mở (kể cả mở từ ngoài qua `open`).
  const [chu, setChu] = useState('')
  const [gio, setGio] = useState<string | null>(null)
  const [gioDaXoa, setGioDaXoa] = useState(false)
  const [coGio, setCoGio] = useState(false)
  const [thang, setThang] = useState(() => ngayTuIso(nay))
  const [moTruoc, setMoTruoc] = useState(false)
  if (mo !== moTruoc) {
    setMoTruoc(mo)
    if (mo) {
      setChu(cu ? hienNgay(cu.ngay, 'day-du') : '') // ô GÕ: đủ năm để docNgay đọc lại được
      setGio(cu?.gio ?? null)
      setGioDaXoa(false)
      setCoGio(!!cu?.gio || !!gioMacDinh)
      setThang(ngayTuIso(cu?.ngay ?? nay))
    }
  }

  const go = chu.trim() ? docNgay(chu, nay, cu?.ngay) : null
  const hopLe = go && (go >= tu || go === cu?.ngay) ? go : null
  const loiNgay = chu.trim() !== '' && !hopLe

  const doiGio = (g: string | null) => {
    if (g === null && gio !== null) setGioDaXoa(true)
    setGio(g)
  }
  const chot = (g = gio) => {
    if (loiNgay) return // ô ngày sai → giữ pop mở để sửa
    const n = hopLe ?? (g && !chu.trim() ? (cu?.ngay ?? (tu > nay ? tu : nay)) : null)
    const giuMacDinh = !gioDaXoa && gio === null
    if (n) onValueChange(ghepIso(n, g ?? (giuMacDinh ? gioMacDinh : null) ?? null, mui))
    datMo(false)
  }
  const oNgayRef = useRef<HTMLInputElement>(null)
  const idCoGio = useId()
  const batGio = (b: boolean) => {
    setCoGio(b)
    if (!b) {
      // Tắt giờ = chỉ ngày: xoá giờ nháp và KHÔNG tự gán gioMacDinh.
      setGio(null)
      setGioDaXoa(true)
    } else setGioDaXoa(false)
  }

  return (
    <Popover open={mo} onOpenChange={datMo}>
      <PopoverTrigger asChild>
        {gon ? (
          <button
            type="button"
            {...trigger}
            data-slot="date-time-picker-trigger"
            className={cn(oSua, deO && oSuaDeO)}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            <span id={idGiaTri} className={cn('tabular-nums whitespace-nowrap', !value && 'text-(--color-text-tertiary)')}>
              {hienGon ? hienGon(value ?? '') : value ? hienNgayGioGon(value, mui) : placeholder}
            </span>
            <CaretDown aria-hidden="true" className={oSuaMui} />
          </button>
        ) : (
          <button
            type="button"
            {...trigger}
            data-placeholder={value ? undefined : ''}
            data-slot="date-time-picker-trigger"
            className={cn(selectTrigger)}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            <CalendarBlank aria-hidden="true" />
            <span id={idGiaTri} data-slot="select-value" className={cn(selectValue, 'flex-1 tabular-nums')}>
              {value ? hienNgayGio(value, mui) : placeholder}
            </span>
          </button>
        )}
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <PopoverContent
        aria-label="Chọn ngày giờ"
        // Lớp nổi cách mép màn ≥ 16 (luật tu-kiem A; ô giãn cả hàng thuộc tính làm pop căn giữa sát mép phải — đo 27/11).
        collisionPadding={16}
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(calendarPop, 'flex flex-col overflow-hidden', 'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!')}
        onKeyDownCapture={chuot.onKeyDown}
        // Ô gõ nằm dưới lịch → Radix sẽ focus nút "Tháng trước"; mở pop là đứng ở ô ngày (chọn hết để gõ đè).
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          oNgayRef.current?.focus({ preventScroll: true })
        }}
      >
        <div className="-m-1 min-h-0 overflow-auto border-none border-current p-1">
          <Calendar
            mode="single"
            required
            selected={hopLe ? ngayTuIso(hopLe) : undefined}
            month={thang}
            onMonthChange={setThang}
            disabled={(d) => {
              const s = isoNgay(d)
              return s < tu && s !== cu?.ngay
            }}
            onSelect={(d) => setChu(hienNgay(isoNgay(d), 'day-du'))}
          />
        </div>
        {/* Hai ô gõ DƯỚI lịch (CEO 22/11), cách nhau 8, cách lịch 12 (= nhịp chân lịch `calendarFoot`). */}
        <div className="mt-3 flex shrink-0 gap-2 border-none border-current *:min-w-0">
          <div className="flex-1 border-none border-current">
            <Input
              ref={oNgayRef}
              icon={<CalendarBlank />}
              aria-label="Ngày"
              placeholder="dd/mm/yyyy"
              inputMode="numeric"
              autoComplete="off"
              className="tabular-nums"
              value={chu}
              aria-invalid={loiNgay || undefined}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setChu(e.target.value)
                const d = e.target.value.trim() ? docNgay(e.target.value, nay, cu?.ngay) : null
                if (d) setThang(ngayTuIso(d))
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                chot()
              }}
            />
          </div>
          {coGio && (
            <div className="w-28 shrink-0 border-none border-current">
              <TimeInput
                aria-label="Giờ"
                goiYPhiaTren
                placeholder={gioMacDinh ?? 'Giờ'}
                value={gio}
                onValueChange={doiGio}
                onEnter={(g) => {
                  doiGio(g)
                  chot(g)
                }}
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex shrink-0 items-center justify-between border-none border-current">
          <label htmlFor={idCoGio} className="cursor-pointer border-none border-current">
            Có giờ
          </label>
          <Switch id={idCoGio} size="sm" checked={coGio} onCheckedChange={batGio} />
        </div>
        <div className={cn(calendarFoot, 'shrink-0')}>
          <div className="flex gap-1 border-none border-current">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChu(hienNgay(nay, 'day-du'))
                setThang(ngayTuIso(nay))
              }}
            >
              Hôm nay
            </Button>
            {value && choXoa && (
              <Button
                variant="ghost"
                size="sm"
                className={calendarFootClear}
                onClick={() => {
                  onValueChange(null)
                  datMo(false)
                }}
              >
                Xoá
              </Button>
            )}
          </div>
          <div className="flex gap-2 border-none border-current">
            <Button size="sm" variant="outline" onClick={() => datMo(false)}>
              Huỷ
            </Button>
            <Button size="sm" disabled={loiNgay} onClick={() => chot()}>
              Xong
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
