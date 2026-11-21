'use client'

import { useRef, useState } from 'react'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { docNgay, ghepIso, GIO_MAC_DINH, hienNgayGio, hienNgayGioGon, MUI_VN, tachIso } from '@/lib/gio'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { calendarFoot, calendarFootClear, calendarPop } from './calendar-styles'
import { selectTrigger, selectValue } from './control-styles'
import { oSua, oSuaMui } from './inline-edit-styles'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { TimeInput } from './time-input'
import { useMoBangChuot } from './use-mo-bang-chuot'
import { useTriggerChon, type TriggerChonProps } from './use-trigger-chon'

export { ghepIso, GIO_MAC_DINH, hienNgayGio, hienNgayGioGon, tachIso }

/**
 * DateTimePicker — chọn ngày + giờ (biến thể A4 của prototype chon-gio, CEO duyệt 20/11). Lưu ISO có múi
 * (`2026-11-25T14:30:00+07:00`), hiện "25/11/2026 · 14:30" (ô form) / "25/11 14:30" (`gon`, ô trong bảng).
 *
 * - Pop: đầu pop hai ô gõ [ngày][giờ] (`Input` + `TimeInput`), lịch bên dưới đồng bộ hai chiều với ô ngày; chân pop
 *   **Xoá** (trái, khi có giá trị) · **Huỷ** + **Xong** (phải). Mở pop là focus ô ngày (chọn hết chữ để gõ đè).
 * - **Chỉ lưu khi Xong** (hoặc Enter ở ô ngày / ô giờ; IME đang ghép thì không). Huỷ / Esc / bấm ra ngoài = bỏ nháp; mở
 *   lại luôn nạp từ `value`. Xoá có hiệu lực ngay (lệnh rõ ràng). Ô ngày gõ sai / ngày đã qua → `aria-invalid`, Xong tắt.
 * - Ô ngày nhận "dd/mm", "dd/mm/yyyy" (`docNgay`). Chỉ đổi giờ, ô ngày trống → ngày của `value`, chưa có thì hôm nay.
 *   Chỉ chọn ngày → giờ của `value`, chưa có thì `gioMacDinh` (R13: mặc định 17:30, CEO chưa chốt) — ô giờ trống hiện số
 *   đó làm placeholder.
 * - Ngày trước `tuNgay` (mặc định hôm nay) bị tắt, TRỪ ngày của `value` (hạn cũ đã qua vẫn hiện, chọn lại được).
 * - `value` từ DB ở múi khác (`…Z`) được đổi về `mui` trước khi hiện / sửa (`tachIso`).
 * - `open` / `onOpenChange` điều khiển từ ngoài được (vd mục menu "Đặt hạn…" mở pop tại ô Hạn).
 * - Trigger: ô form = `selectTrigger` + CalendarBlank (y DatePicker — cùng cao); `gon` = nút `oSua` của InlineEdit.
 *   Tên đọc = nhãn + giá trị (`useTriggerChon`). Pop `role="dialog"` "Chọn ngày giờ", portal vùng DS z-90.
 */
export function DateTimePicker({
  value,
  onValueChange,
  gioMacDinh = GIO_MAC_DINH,
  mui = MUI_VN,
  tuNgay,
  gon,
  open,
  onOpenChange,
  placeholder = 'Chọn ngày giờ',
  name,
  ...trig
}: TriggerChonProps & {
  /** ISO có múi, vd `2026-11-25T14:30:00+07:00`; null = chưa có. */
  value: string | null
  onValueChange(v: string | null): void
  /** "HH:mm" khi chỉ chọn ngày. */
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
}) {
  const [moTrong, setMoTrong] = useState(false)
  const mo = open ?? moTrong
  const datMo = (m: boolean) => {
    if (open === undefined) setMoTrong(m)
    onOpenChange?.(m)
  }
  const { idGiaTri, trigger } = useTriggerChon(trig, !!value, mo)
  const chuot = useMoBangChuot()

  const nay = isoNgay(new Date())
  const tu = tuNgay ?? nay
  const cu = value ? tachIso(value, mui) : null

  // Nháp: chữ ô ngày + giờ + tháng lịch. Nạp lại từ value mỗi lần pop chuyển sang mở (kể cả mở từ ngoài qua `open`).
  const [chu, setChu] = useState('')
  const [gio, setGio] = useState<string | null>(null)
  const [thang, setThang] = useState(() => ngayTuIso(nay))
  const [moTruoc, setMoTruoc] = useState(false)
  if (mo !== moTruoc) {
    setMoTruoc(mo)
    if (mo) {
      setChu(cu ? hienNgay(cu.ngay) : '')
      setGio(cu?.gio ?? null)
      setThang(ngayTuIso(cu?.ngay ?? nay))
    }
  }

  const go = chu.trim() ? docNgay(chu, nay, cu?.ngay) : null
  const hopLe = go && (go >= tu || go === cu?.ngay) ? go : null
  const loiNgay = chu.trim() !== '' && !hopLe

  const chot = (g = gio) => {
    if (loiNgay) return // ô ngày sai → giữ pop mở để sửa
    const n = hopLe ?? (g && !chu.trim() ? (cu?.ngay ?? (tu > nay ? tu : nay)) : null)
    if (n) onValueChange(ghepIso(n, g ?? gioMacDinh, mui))
    datMo(false)
  }
  const enterGio = useRef(false) // phím vừa bấm trong ô giờ là Enter (TimeInput chốt rồi mới báo onValueChange)

  return (
    <Popover open={mo} onOpenChange={datMo}>
      <PopoverTrigger asChild>
        {gon ? (
          <button
            type="button"
            {...trigger}
            data-slot="date-time-picker-trigger"
            className={oSua}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            <span id={idGiaTri} className={cn('tabular-nums whitespace-nowrap', !value && 'text-(--color-text-tertiary)')}>
              {value ? hienNgayGioGon(value, mui) : placeholder}
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
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(calendarPop, 'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!')}
        onKeyDownCapture={chuot.onKeyDown}
      >
        {/* Hai ô gõ cách nhau 8, cách lịch 12 (= nhịp chân lịch `calendarFoot`). */}
        <div className="mb-3 flex gap-2 border-none border-current *:min-w-0">
          <div className="flex-1 border-none border-current">
            <Input
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
                if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
                e.preventDefault()
                chot()
              }}
            />
          </div>
          <div
            className="w-28 shrink-0 border-none border-current"
            onKeyDownCapture={(e) => {
              enterGio.current = e.key === 'Enter' && !e.nativeEvent.isComposing
            }}
            onClickCapture={() => {
              enterGio.current = false
            }}
          >
            <TimeInput
              aria-label="Giờ"
              placeholder={gioMacDinh}
              value={gio}
              onValueChange={(g) => {
                setGio(g)
                // Enter trong ô giờ = Xong (truyền thẳng g — state chưa kịp cập nhật). Bấm gợi ý / rời ô chỉ đổi nháp.
                if (enterGio.current) chot(g)
                enterGio.current = false
              }}
            />
          </div>
        </div>
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
          onSelect={(d) => setChu(hienNgay(isoNgay(d)))}
        />
        <div className={calendarFoot}>
          {value ? (
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
          ) : (
            <span />
          )}
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
