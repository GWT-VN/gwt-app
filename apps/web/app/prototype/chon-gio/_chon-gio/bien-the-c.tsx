'use client'

// PROTOTYPE vứt đi — C: gõ chữ tự do ("mai 15h", "thứ 2 9h", "25/11 14:30") + đọc lại ngay dưới ô + nút lịch dự phòng.
import { useId, useRef, useState } from 'react'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react/ssr'
import { isoNgay, ngayTuIso } from '@/bang/ngay'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { calendarPop } from '@/components/ui/calendar-styles'
import { FieldDescription } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-affix'
import { oSua, oSuaMui } from '@/components/ui/inline-edit-styles'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMoBangChuot } from '@/components/ui/use-mo-bang-chuot'
import { docChu, ghepIso, GIO_MAC_DINH, gioCua, hienDay, hienGon, hienThu, homNay, ngayCua, type PropsHan } from './gio'

export function ChonHanC(p: PropsHan) {
  return p.gon ? <OBangC {...p} /> : <OChuC {...p} />
}

/** Ô gõ + dòng đọc lại. `onXong` gọi sau khi Enter chốt được (ô bảng đóng pop). */
function OChuC({ value, onValueChange, id, autoFocus, onXong }: PropsHan & { autoFocus?: boolean; onXong?(): void }) {
  const [chu, setChu] = useState(value ? hienDay(value) : '')
  const [goc, setGoc] = useState(value)
  if (value !== goc) {
    setGoc(value)
    setChu(value ? hienDay(value) : '')
  }
  const [moLich, setMoLich] = useState(false)
  const oRef = useRef<HTMLInputElement>(null)
  const huy = useRef(false) // Esc = bỏ, không chốt khi pop đóng làm ô mất focus
  const idDoc = useId()
  const chuot = useMoBangChuot()
  const doc = chu.trim() ? docChu(chu) : null
  const sai = chu.trim() !== '' && !doc

  const chot = () => {
    if (huy.current) return (huy.current = false)
    if (!chu.trim()) onValueChange(null)
    else if (doc) {
      onValueChange(doc)
      setChu(hienDay(doc))
    } else return false
    return true
  }

  return (
    <div className="flex flex-col gap-1.5 border-none border-current">
      <InputGroup className="pr-1">
        <InputGroupInput
          ref={oRef}
          id={id}
          autoFocus={autoFocus}
          autoComplete="off"
          value={chu}
          placeholder="vd: mai 15h · thứ 2 9h · 25/11 14:30"
          aria-invalid={sai || undefined}
          aria-describedby={idDoc}
          onChange={(e) => setChu(e.target.value)}
          onBlur={chot}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              huy.current = !!onXong
              setChu(value ? hienDay(value) : '')
            }
            if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            if (chot()) onXong?.()
          }}
        />
        <Popover open={moLich} onOpenChange={setMoLich}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              shape="rounded"
              aria-label="Chọn bằng lịch"
              className="shrink-0"
              onPointerDown={chuot.onPointerDown}
              onKeyDown={chuot.onKeyDown}
            >
              <CalendarBlank />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            aria-label="Chọn ngày"
            align="end"
            data-mo-chuot={chuot.chuot || undefined}
            className={cn(calendarPop, 'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!')}
            onKeyDownCapture={chuot.onKeyDown}
            onCloseAutoFocus={(e) => {
              e.preventDefault()
              oRef.current?.focus()
            }}
          >
            <Calendar
              mode="single"
              required
              autoFocus
              selected={(doc ?? value) ? ngayTuIso(ngayCua((doc ?? value)!)) : undefined}
              defaultMonth={ngayTuIso(ngayCua(doc ?? value ?? homNay()))}
              onSelect={(d) => {
                const g = doc ? gioCua(doc) : value ? gioCua(value) : GIO_MAC_DINH
                const moi = ghepIso(isoNgay(d), g)
                onValueChange(moi)
                setChu(hienDay(moi))
                setMoLich(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </InputGroup>
      <FieldDescription id={idDoc} aria-live="polite" className={cn('tabular-nums', sai && 'text-(--color-text-danger)')}>
        {doc ? (
          <span className="text-foreground">→ {hienThu(doc)}</span>
        ) : sai ? (
          'Chưa hiểu — thử: mai 15h / 25/11 14:30'
        ) : (
          `Gõ ngày + giờ; chỉ có ngày thì lấy ${GIO_MAC_DINH}.`
        )}
      </FieldDescription>
    </div>
  )
}

/** Ô bảng hẹp: bấm → pop nhỏ chứa ô gõ; Enter chốt + đóng. */
function OBangC(p: PropsHan) {
  const [mo, setMo] = useState(false)
  const { value, ma } = p
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        <button type="button" className={oSua} aria-label={`Sửa hạn ${ma}`}>
          <span className={cn('tabular-nums whitespace-nowrap', !value && 'text-(--color-text-tertiary)')}>
            {value ? hienGon(value) : 'Đặt hạn'}
          </span>
          <CaretDown aria-hidden="true" className={oSuaMui} />
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label={`Hạn ${ma}`} className={cn(menuContent, 'w-[320px] max-w-[calc(100vw-16px)] p-3')}>
        <OChuC {...p} gon={false} autoFocus onXong={() => setMo(false)} />
      </PopoverContent>
    </Popover>
  )
}
