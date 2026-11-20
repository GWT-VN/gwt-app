'use client'

// PROTOTYPE vứt đi — A1 (gốc): giờ nằm TRONG pop lịch (mốc nhanh · lịch tháng · dòng Giờ · Xoá / Xong).
import { useId, useState } from 'react'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react/ssr'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarFoot, calendarFootClear, calendarPop } from '@/components/ui/calendar-styles'
import { selectTrigger, selectValue } from '@/components/ui/control-styles'
import { FieldLabel } from '@/components/ui/field'
import { oSua, oSuaMui } from '@/components/ui/inline-edit-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMoBangChuot } from '@/components/ui/use-mo-bang-chuot'
import { chanQua, congNgay, ghepIso, GIO_MAC_DINH, gioCua, hienDay, hienGon, homNay, ngayCua, thuToi, type PropsHan } from './gio'
import { OGio } from './o-gio'

export function ChonHanA({ value, onValueChange, id, gon, ma }: PropsHan) {
  const [mo, setMo] = useState(false)
  const chuot = useMoBangChuot()
  const idGio = useId()
  const nay = homNay()
  const gio = value ? gioCua(value) : null
  const dat = (ngay: string, g = gio ?? GIO_MAC_DINH) => onValueChange(ghepIso(ngay, g))
  const moc = (ngay: string, g?: string) => {
    dat(ngay, g)
    setMo(false)
  }

  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        {gon ? (
          <button type="button" className={oSua} aria-label={`Sửa hạn ${ma}`} onPointerDown={chuot.onPointerDown} onKeyDown={chuot.onKeyDown}>
            <span className={cn('tabular-nums whitespace-nowrap', !value && 'text-(--color-text-tertiary)')}>
              {value ? hienGon(value) : 'Đặt hạn'}
            </span>
            <CaretDown aria-hidden="true" className={oSuaMui} />
          </button>
        ) : (
          <button
            type="button"
            id={id}
            data-placeholder={value ? undefined : ''}
            className={selectTrigger}
            onPointerDown={chuot.onPointerDown}
            onKeyDown={chuot.onKeyDown}
          >
            <CalendarBlank aria-hidden="true" />
            <span data-slot="select-value" className={cn(selectValue, 'flex-1 tabular-nums')}>
              {value ? hienDay(value) : 'Chọn hạn'}
            </span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        aria-label="Chọn hạn"
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(
          calendarPop,
          'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!',
        )}
        onKeyDownCapture={chuot.onKeyDown}
      >
        <div className="mb-3 flex flex-wrap gap-2 border-none border-current">
          <Button variant="outline" size="sm" onClick={() => moc(nay)}>
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={() => moc(congNgay(nay, 1), '09:00')}>
            Mai 9:00
          </Button>
          <Button variant="outline" size="sm" onClick={() => moc(thuToi(nay, 1))}>
            Thứ Hai tới
          </Button>
        </div>
        <Calendar
          mode="single"
          required
          autoFocus
          selected={value ? ngayTuIso(ngayCua(value)) : undefined}
          defaultMonth={ngayTuIso(value ? ngayCua(value) : nay)}
          disabled={chanQua(nay, value ? ngayCua(value) : null)}
          onSelect={(d) => dat(isoNgay(d))}
        />
        <div className="mt-3 flex items-center gap-3 border-none border-current">
          <FieldLabel htmlFor={idGio} className="w-10 shrink-0">
            Giờ
          </FieldLabel>
          <OGio id={idGio} value={gio} onValueChange={(g) => dat(value ? ngayCua(value) : nay, g)} className="w-[120px]" />
        </div>
        <div className={calendarFoot}>
          {value ? (
            <Button
              variant="ghost"
              size="sm"
              className={calendarFootClear}
              onClick={() => {
                onValueChange(null)
                setMo(false)
              }}
            >
              Xoá
            </Button>
          ) : (
            <span />
          )}
          <Button size="sm" onClick={() => setMo(false)}>
            Xong
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
