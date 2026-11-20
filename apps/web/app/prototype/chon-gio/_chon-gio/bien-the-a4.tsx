'use client'

// PROTOTYPE vứt đi — A4: hai ô gõ [ngày][giờ] ở đầu pop (kiểu Notion), lịch dưới đồng bộ hai chiều với ô ngày.
import { useState } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot } from '@/components/ui/calendar-styles'
import { Input } from '@/components/ui/input'
import { chanQua, docChu, ghepIso, GIO_MAC_DINH, gioCua, homNay, ngayCua, type PropsHan } from './gio'
import { OGio } from './o-gio'
import { NutXoa, useDongSau, VoHan } from './vo-han'

export function ChonHanA4({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const nay = homNay()
  const ngay = value ? ngayCua(value) : null
  const gio = value ? gioCua(value) : null
  const [chu, setChu] = useState('')
  const [thang, setThang] = useState(() => ngayTuIso(nay))
  // ponytail: đọc ô ngày bằng docChu của C → nhận cả "25/11", "25/11/2026", "mai", "thứ 2".
  const doc = chu.trim() ? docChu(chu) : null
  const go = doc ? ngayCua(doc) : null
  const hopLe = go && (go >= nay || go === ngay) ? go : null // ngày đã qua (trừ hạn đang có) = không nhận
  const dat = (n: string, g = gio ?? GIO_MAC_DINH) => onValueChange(ghepIso(n, g))
  const enter = useDongSau(() => setMo(false))

  const moPop = (m: boolean) => {
    if (m) {
      setChu(ngay ? hienNgay(ngay) : '')
      setThang(ngayTuIso(ngay ?? nay))
    }
    setMo(m)
  }

  return (
    <VoHan value={value} id={id} gon={gon} ma={ma} mo={mo} setMo={moPop}>
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
            aria-invalid={(chu.trim() !== '' && !hopLe) || undefined}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              setChu(e.target.value)
              const d = e.target.value.trim() ? docChu(e.target.value) : null
              if (d) setThang(ngayTuIso(ngayCua(d)))
            }}
            onBlur={() => hopLe && hopLe !== ngay && dat(hopLe)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
              e.preventDefault()
              if (!hopLe) return
              dat(hopLe)
              setMo(false)
            }}
          />
        </div>
        <div className="w-28 shrink-0 border-none border-current" {...enter.vo}>
          <OGio
            aria-label="Giờ"
            value={gio}
            onValueChange={(g) => {
              dat(hopLe ?? ngay ?? nay, g)
              enter.sau()
            }}
          />
        </div>
      </div>
      <Calendar
        mode="single"
        required
        selected={hopLe ? ngayTuIso(hopLe) : ngay ? ngayTuIso(ngay) : undefined}
        month={thang}
        onMonthChange={setThang}
        disabled={chanQua(nay, ngay)}
        onSelect={(d) => {
          setChu(hienNgay(isoNgay(d)))
          dat(isoNgay(d))
        }}
      />
      {/* CEO 20/11: thêm nút xác nhận ở góc phải chân pop. Vẫn lưu ngay khi đổi (như A1) — "Xong" chốt nốt ô ngày đang gõ dở rồi đóng. */}
      <div className={calendarFoot}>
        {value ? (
          <NutXoa
            onClick={() => {
              onValueChange(null)
              setMo(false)
            }}
          />
        ) : (
          <span />
        )}
        <Button
          size="sm"
          onClick={() => {
            if (hopLe && hopLe !== ngay) dat(hopLe)
            setMo(false)
          }}
        >
          Xong
        </Button>
      </div>
    </VoHan>
  )
}
