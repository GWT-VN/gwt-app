'use client'

// PROTOTYPE vứt đi — vỏ chung A2–A5: nút mở (ô form / ô gọn trong bảng) + pop lịch. A1 giữ code gốc để so.
import { useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { calendarFootClear, calendarPop } from '@/components/ui/calendar-styles'
import { selectTrigger, selectValue } from '@/components/ui/control-styles'
import { oSua, oSuaMui } from '@/components/ui/inline-edit-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMoBangChuot } from '@/components/ui/use-mo-bang-chuot'
import { hienDay, hienGon, type PropsHan } from './gio'

export function VoHan({
  value,
  id,
  gon,
  ma,
  mo,
  setMo,
  children,
}: Pick<PropsHan, 'value' | 'id' | 'gon' | 'ma'> & { mo: boolean; setMo(m: boolean): void; children: ReactNode }) {
  const chuot = useMoBangChuot()
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
        data-pop-han=""
        data-mo-chuot={chuot.chuot || undefined}
        className={cn(calendarPop, 'data-mo-chuot:[&_:focus-visible]:[outline:none]! data-mo-chuot:[&_:focus-visible]:outline-offset-0!')}
        onKeyDownCapture={chuot.onKeyDown}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/**
 * OGio chốt bằng Enter / bấm gợi ý → đóng pop; Tab rời ô (blur cũng chốt) → KHÔNG đóng. Gắn `vo` lên khối bọc OGio
 * (capture chạy trước handler của OGio, kể cả click trong danh sách gợi ý portal — sự kiện React đi theo cây React).
 */
export function useDongSau(dong: () => void) {
  const can = useRef(false)
  return {
    vo: {
      onKeyDownCapture: (e: KeyboardEvent) => {
        can.current = e.key === 'Enter' && !e.nativeEvent.isComposing
      },
      onClickCapture: (e: MouseEvent) => {
        can.current = !!(e.target as HTMLElement).closest('[role=option]')
      },
    },
    sau: () => {
      if (!can.current) return
      can.current = false
      dong()
    },
  }
}

/** "Xoá" kiểu chân lịch DS (ghost gạch chân). */
export function NutXoa({ onClick, className }: { onClick(): void; className?: string }) {
  return (
    <Button variant="ghost" size="sm" className={cn(calendarFootClear, className)} onClick={onClick}>
      Xoá
    </Button>
  )
}
