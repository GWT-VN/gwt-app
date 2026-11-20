'use client'

// PROTOTYPE vứt đi — A4: hai ô gõ [ngày][giờ] ở đầu pop (kiểu Notion), lịch dưới đồng bộ hai chiều với ô ngày.
// CEO 20/11: CHỈ LƯU KHI BẤM XONG (hoặc Enter). Mọi thay đổi trong pop là bản nháp; Huỷ / Esc / bấm ra ngoài = bỏ nháp.
// Xoá vẫn có hiệu lực ngay (là lệnh rõ ràng, không phải chỉnh dở).
import { useRef, useState } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot } from '@/components/ui/calendar-styles'
import { Input } from '@/components/ui/input'
import { chanQua, docChu, ghepIso, GIO_MAC_DINH, gioCua, homNay, ngayCua, type PropsHan } from './gio'
import { OGio } from './o-gio'
import { NutXoa, VoHan } from './vo-han'

export function ChonHanA4({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const nay = homNay()
  const ngayCu = value ? ngayCua(value) : null
  // Nháp: ô ngày (chữ gõ) + giờ. Lấy từ value mỗi lần mở pop.
  const [chu, setChu] = useState('')
  const [gioNhap, setGioNhap] = useState<string | null>(null)
  const [thang, setThang] = useState(() => ngayTuIso(nay))
  // ponytail: đọc ô ngày bằng docChu của C → nhận cả "25/11", "25/11/2026", "mai", "thứ 2".
  const doc = chu.trim() ? docChu(chu) : null
  const go = doc ? ngayCua(doc) : null
  const hopLe = go && (go >= nay || go === ngayCu) ? go : null // ngày đã qua (trừ hạn đang có) = không nhận
  const loiNgay = chu.trim() !== '' && !hopLe

  const chot = (g = gioNhap) => {
    if (loiNgay) return // ô ngày gõ sai → không lưu, giữ pop mở để sửa
    // Chỉ chọn giờ, ô ngày trống → lấy ngày cũ, chưa có thì hôm nay (như B).
    const n = hopLe ?? (g && !chu.trim() ? (ngayCu ?? nay) : null)
    if (n) onValueChange(ghepIso(n, g ?? GIO_MAC_DINH))
    setMo(false)
  }
  const enter = useRef(false) // phím vừa bấm trong ô giờ là Enter?

  const moPop = (m: boolean) => {
    if (m) {
      setChu(ngayCu ? hienNgay(ngayCu) : '')
      setGioNhap(value ? gioCua(value) : null)
      setThang(ngayTuIso(ngayCu ?? nay))
    }
    setMo(m) // đóng bằng Esc / bấm ra ngoài → nháp bỏ, value giữ nguyên
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
            aria-invalid={loiNgay || undefined}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              setChu(e.target.value)
              const d = e.target.value.trim() ? docChu(e.target.value) : null
              if (d) setThang(ngayTuIso(ngayCua(d)))
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
            enter.current = e.key === 'Enter' && !e.nativeEvent.isComposing
          }}
          onClickCapture={() => {
            enter.current = false
          }}
        >
          <OGio
            aria-label="Giờ"
            value={gioNhap}
            onValueChange={(g) => {
              setGioNhap(g)
              // Enter trong ô giờ = Xong (truyền thẳng g — state chưa kịp cập nhật). Bấm chuột vào gợi ý chỉ đổi nháp.
              if (enter.current) chot(g)
              enter.current = false
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
        disabled={chanQua(nay, ngayCu)}
        onSelect={(d) => setChu(hienNgay(isoNgay(d)))}
      />
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
        <div className="flex gap-2 border-none border-current">
          <Button size="sm" variant="outline" onClick={() => setMo(false)}>
            Huỷ
          </Button>
          <Button size="sm" disabled={loiNgay} onClick={() => chot()}>
            Xong
          </Button>
        </div>
      </div>
    </VoHan>
  )
}
