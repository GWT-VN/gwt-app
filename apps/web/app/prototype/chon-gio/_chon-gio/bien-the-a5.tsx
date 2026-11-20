'use client'

// PROTOTYPE vứt đi — A5: cột mốc nhanh bên trái (ghi rõ kết quả), lịch + dòng Giờ bên phải (kiểu Linear/Todoist).
import { useId, useState } from 'react'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { FieldLabel } from '@/components/ui/field'
import { chanQua, congNgay, ghepIso, GIO_MAC_DINH, gioCua, hienMoc, homNay, ngayCua, thuToi, type PropsHan } from './gio'
import { OGio } from './o-gio'
import { NutXoa, VoHan } from './vo-han'

/** Mốc tính từ hôm nay thật. ponytail: "Cuối tuần này" = thứ Sáu tuần này (hôm nay là T7/CN → thứ Sáu tuần sau). */
function dsMoc(nay: string): [string, string][] {
  const thu = ngayTuIso(nay).getDay()
  return [
    ['Hôm nay', ghepIso(nay, GIO_MAC_DINH)],
    ['Mai sáng', ghepIso(congNgay(nay, 1), '09:00')],
    ['Mai chiều', ghepIso(congNgay(nay, 1), GIO_MAC_DINH)],
    ['Thứ Hai tới', ghepIso(thuToi(nay, 1), '09:00')],
    ['Cuối tuần này', ghepIso(congNgay(nay, (5 - thu + 7) % 7), GIO_MAC_DINH)],
    ['1 tuần nữa', ghepIso(congNgay(nay, 7), GIO_MAC_DINH)],
  ]
}

export function ChonHanA5({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const idGio = useId()
  const nay = homNay()
  const ngay = value ? ngayCua(value) : null
  const gio = value ? gioCua(value) : null
  const dat = (n: string, g = gio ?? GIO_MAC_DINH) => onValueChange(ghepIso(n, g))

  return (
    <VoHan value={value} id={id} gon={gon} ma={ma} mo={mo} setMo={setMo}>
      {/* Rộng: [mốc | lịch+giờ] / [Xoá Xong | ]. Hẹp (≤ 640): mốc → lịch+giờ → Xoá Xong. */}
      <div className="grid grid-cols-[13.5rem_auto] gap-x-5 border-none border-current max-[640px]:grid-cols-1">
        <div className="col-start-1 row-start-1 flex flex-col gap-0.5 border-none border-current max-[640px]:mb-3">
          {dsMoc(nay).map(([nhan, iso]) => (
            <Button
              key={nhan}
              variant="ghost"
              size="sm"
              className="justify-between"
              onClick={() => {
                onValueChange(iso)
                setMo(false)
              }}
            >
              <span>{nhan}</span>
              <span className="font-normal tabular-nums text-muted-foreground">{hienMoc(iso, nay)}</span>
            </Button>
          ))}
        </div>
        <div className="col-start-2 row-span-2 row-start-1 border-none border-current max-[640px]:col-start-1 max-[640px]:row-span-1 max-[640px]:row-start-2">
          <Calendar
            mode="single"
            required
            autoFocus
            selected={ngay ? ngayTuIso(ngay) : undefined}
            defaultMonth={ngayTuIso(ngay ?? nay)}
            disabled={chanQua(nay, ngay)}
            onSelect={(d) => dat(isoNgay(d))}
          />
          <div className="mt-3 flex items-center gap-3 border-none border-current">
            <FieldLabel htmlFor={idGio} className="w-10 shrink-0">
              Giờ
            </FieldLabel>
            <OGio id={idGio} value={gio} onValueChange={(g) => dat(ngay ?? nay, g)} className="w-28" />
          </div>
        </div>
        <div className="col-start-1 row-start-2 flex items-center justify-between gap-2 self-end border-none border-current max-[640px]:row-start-3 max-[640px]:mt-3">
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
          <Button size="sm" onClick={() => setMo(false)}>
            Xong
          </Button>
        </div>
      </div>
    </VoHan>
  )
}
