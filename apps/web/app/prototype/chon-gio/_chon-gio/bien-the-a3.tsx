'use client'

// PROTOTYPE vứt đi — A3: mốc nhanh · lịch · hàng chip giờ + ô "Giờ khác". Không nút Xong: bấm chip / Enter = lưu + đóng.
import { useState } from 'react'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { chanQua, congNgay, ghepIso, GIO_MAC_DINH, gioCua, homNay, ngayCua, thuToi, type PropsHan } from './gio'
import { OGio } from './o-gio'
import { NutXoa, useDongSau, VoHan } from './vo-han'

const CHIP = ['08:00', '09:00', '12:00', '14:00', '17:30']

export function ChonHanA3({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const nay = homNay()
  const ngay = value ? ngayCua(value) : null
  const gio = value ? gioCua(value) : null
  const dat = (n: string, g = gio ?? GIO_MAC_DINH) => onValueChange(ghepIso(n, g))
  const chot = (n: string, g?: string) => {
    dat(n, g)
    setMo(false)
  }
  const enter = useDongSau(() => setMo(false))

  return (
    <VoHan value={value} id={id} gon={gon} ma={ma} mo={mo} setMo={setMo}>
      <div className="mb-3 flex flex-wrap items-center gap-2 border-none border-current">
        <Button variant="outline" size="sm" onClick={() => chot(nay)}>
          Hôm nay
        </Button>
        <Button variant="outline" size="sm" onClick={() => chot(congNgay(nay, 1), '09:00')}>
          Mai 9:00
        </Button>
        <Button variant="outline" size="sm" onClick={() => chot(thuToi(nay, 1))}>
          Thứ Hai tới
        </Button>
        {value && (
          <NutXoa
            className="ml-auto"
            onClick={() => {
              onValueChange(null)
              setMo(false)
            }}
          />
        )}
      </div>
      <Calendar
        mode="single"
        required
        autoFocus
        selected={ngay ? ngayTuIso(ngay) : undefined}
        defaultMonth={ngayTuIso(ngay ?? nay)}
        disabled={chanQua(nay, ngay)}
        onSelect={(d) => dat(isoNgay(d))}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2 border-none border-current" {...enter.vo}>
        {/* Chưa có hạn: 17:30 vẫn sáng = "chọn ngày thôi thì lấy giờ này". */}
        <ToggleGroup type="single" aria-label="Giờ hay dùng" value={gio ?? GIO_MAC_DINH} className="flex-wrap">
          {CHIP.map((g) => (
            <ToggleGroupItem key={g} value={g} size="sm" className="tabular-nums" onClick={() => chot(ngay ?? nay, g)}>
              {g}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <OGio
          aria-label="Giờ khác"
          placeholder="Giờ khác"
          value={gio && !CHIP.includes(gio) ? gio : null}
          onValueChange={(g) => {
            dat(ngay ?? nay, g)
            enter.sau()
          }}
          className="w-28"
        />
      </div>
    </VoHan>
  )
}
