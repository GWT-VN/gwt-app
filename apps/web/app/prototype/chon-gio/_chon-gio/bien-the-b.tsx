'use client'

// PROTOTYPE vứt đi — B: hai ô riêng cạnh nhau (DatePicker DS + ô giờ). Chọn giờ khi chưa có ngày → lấy hôm nay + nói rõ.
import { useId, useState } from 'react'
import { hienNgay, isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot, calendarPop } from '@/components/ui/calendar-styles'
import { DatePicker } from '@/components/ui/date-picker'
import { FieldDescription } from '@/components/ui/field'
import { oSua } from '@/components/ui/inline-edit-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMoBangChuot } from '@/components/ui/use-mo-bang-chuot'
import { ghepIso, GIO_MAC_DINH, gioCua, homNay, ngayCua, type PropsHan } from './gio'
import { OGio } from './o-gio'

export function ChonHanB(p: PropsHan) {
  const { value, onValueChange } = p
  const [tuLay, setTuLay] = useState(false) // giờ chọn trước, ngày tự lấy hôm nay
  const ngay = value ? ngayCua(value) : null
  const gio = value ? gioCua(value) : null
  const doiNgay = (n: string | null) => {
    setTuLay(false)
    onValueChange(n ? ghepIso(n, gio ?? GIO_MAC_DINH) : null)
  }
  const doiGio = (g: string) => {
    setTuLay(!ngay)
    onValueChange(ghepIso(ngay ?? homNay(), g))
  }
  return p.gon ? (
    <ONgayGon {...p} ngay={ngay} gio={gio} doiNgay={doiNgay} doiGio={doiGio} />
  ) : (
    <FormB {...p} ngay={ngay} gio={gio} doiNgay={doiNgay} doiGio={doiGio} tuLay={tuLay} />
  )
}

type Them = { ngay: string | null; gio: string | null; doiNgay(n: string | null): void; doiGio(g: string): void }

function FormB({ id, ngay, gio, doiNgay, doiGio, tuLay }: PropsHan & Them & { tuLay: boolean }) {
  const idGoiY = useId()
  return (
    <div className="flex flex-col gap-1.5 border-none border-current">
      <div className="flex gap-2 border-none border-current">
        <div className="min-w-0 flex-1 border-none border-current">
          <DatePicker id={id} value={ngay} onValueChange={doiNgay} aria-describedby={idGoiY} />
        </div>
        <OGio value={gio} onValueChange={doiGio} aria-label="Giờ hạn xử lý" aria-describedby={idGoiY} className="w-[112px] shrink-0" />
      </div>
      <FieldDescription id={idGoiY} aria-live="polite">
        {tuLay && ngay
          ? `Chưa chọn ngày → đã lấy hôm nay (${hienNgay(ngay)}). Đổi ở ô ngày nếu sai.`
          : ngay && gio === GIO_MAC_DINH
            ? `Giờ mặc định ${GIO_MAC_DINH} — gõ ô giờ để đổi.`
            : 'Chọn ngày; giờ để trống thì lấy ' + GIO_MAC_DINH + '.'}
      </FieldDescription>
    </div>
  )
}

/** Ô bảng hẹp: phần ngày (bấm → lịch) + phần giờ (gõ) — hai đích bấm riêng trong cùng ô. */
function ONgayGon({ ma, ngay, gio, doiNgay, doiGio }: PropsHan & Them) {
  const [mo, setMo] = useState(false)
  const chuot = useMoBangChuot()
  const nay = homNay()
  return (
    <span className="inline-flex items-center gap-2 border-none border-current">
      <Popover open={mo} onOpenChange={setMo}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(oSua, 'pr-1.5 tabular-nums whitespace-nowrap', !ngay && 'text-(--color-text-tertiary)')}
            aria-label={`Sửa ngày hạn ${ma}`}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            {ngay ? hienNgay(ngay).slice(0, 5) : 'Ngày'}
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Chọn ngày"
          data-mo-chuot={chuot.chuot || undefined}
          className={cn(calendarPop, 'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!')}
          onKeyDownCapture={chuot.onKeyDown}
        >
          <Calendar
            mode="single"
            required
            autoFocus
            selected={ngay ? ngayTuIso(ngay) : undefined}
            defaultMonth={ngayTuIso(ngay ?? nay)}
            onSelect={(d) => {
              doiNgay(isoNgay(d))
              setMo(false)
            }}
          />
          <div className={calendarFoot}>
            <span />
            <Button variant="outline" size="sm" onClick={() => (doiNgay(nay), setMo(false))}>
              Hôm nay
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <OGio gon value={gio} onValueChange={doiGio} aria-label={`Sửa giờ hạn ${ma}`} />
    </span>
  )
}
