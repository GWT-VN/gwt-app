'use client'

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { Clock } from '@phosphor-icons/react/ssr'
import { docGio, GIO_MAC_DINH, GOI_Y_GIO } from '@/lib/gio'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { menuContent, menuItem } from './menu-styles'
import { Popover, PopoverAnchor, PopoverContent } from './popover'

export { docGio, GOI_Y_GIO }

/**
 * TimeInput — ô giờ 24h gõ được + danh sách gợi ý (R17 lát 7, nâng từ prototype chon-gio `o-gio.tsx`, CEO duyệt 20/11).
 *
 * - Gõ "1430" / "14:30" / "9" (→ 09:00) / phút lẻ "14:45" (`docGio`, lib/gio.ts). Phút lẻ không có trong gợi ý → đứng
 *   đầu danh sách kèm "đã gõ".
 * - Combobox APG: `role="combobox"` + `aria-activedescendant`; ↑/↓ mở / dời mục sáng, Enter chốt mục sáng (không chốt khi
 *   bộ gõ IME đang ghép chữ), Esc khi danh sách mở trả chữ về giá trị cũ, rời ô chốt nếu đọc được (không thì trả lại).
 * - Danh sách = mặt menu DS (`menuContent`/`menuItem`) trong Popover portal vùng DS; focus ở lại ô gõ. Tự cuộn mục sáng
 *   bằng scrollTop (scrollIntoView kéo cả cửa sổ).
 * - `goiY` = danh sách gợi ý (mặc định mỗi 30 phút); `[]` = không có danh sách. `placeholder` mặc định "Giờ";
 *   DateTimePicker truyền giờ mặc định (R13). Mọi prop `<input>` khác (id, aria-*, disabled…) rơi vào ô.
 */
export function TimeInput({
  value,
  onValueChange,
  goiY = GOI_Y_GIO,
  placeholder = 'Giờ',
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'defaultValue'> & {
  value: string | null
  onValueChange(gio: string): void
  goiY?: string[]
}) {
  const [chu, setChu] = useState(value ?? '')
  const [goc, setGoc] = useState(value)
  if (value !== goc) {
    setGoc(value)
    setChu(value ?? '')
  }
  const [moGoc, setMo] = useState(false)
  const doc = docGio(chu)
  const ds = doc && !goiY.includes(doc) ? [doc, ...goiY] : goiY
  const mo = moGoc && ds.length > 0
  const macDinh = Math.max(0, ds.indexOf(doc ?? value ?? GIO_MAC_DINH))
  const [sang, setSang] = useState<number | null>(null) // null = theo chữ đang gõ
  const iSang = sang ?? macDinh
  const neoRef = useRef<HTMLDivElement>(null)
  const vuaFocus = useRef(false) // focus bằng chuột: mouseup bỏ vùng chọn → giữ "chọn hết" để gõ đè
  const dsRef = useRef<HTMLDivElement>(null)
  const idDs = useId()
  const sai = chu.trim() !== '' && !doc

  useLayoutEffect(() => {
    const l = dsRef.current
    const el = l?.querySelector<HTMLElement>(`[data-i="${iSang}"]`)
    if (!l || !el) return
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 6
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight)
      l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 6
  }, [iSang, mo])

  const chot = (g: string | null) => {
    if (g) {
      onValueChange(g)
      setChu(g)
    } else setChu(value ?? '')
    setSang(null)
    setMo(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!mo) return setMo(true)
      setSang(Math.min(ds.length - 1, Math.max(0, iSang + (e.key === 'ArrowDown' ? 1 : -1))))
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      chot(mo ? ds[iSang] : doc)
    } else if (e.key === 'Escape' && mo) {
      // Đóng danh sách do DismissableLayer của Popover (lớp trên cùng) lo; ở đây chỉ trả chữ về giá trị cũ.
      setChu(value ?? '')
      setSang(null)
    }
  }

  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverAnchor asChild>
        <div ref={neoRef} className="flex min-w-0 border-none border-current *:min-w-0 *:flex-1">
          <Input
            {...props}
            icon={<Clock />}
            role="combobox"
            aria-expanded={mo}
            aria-controls={mo ? idDs : undefined}
            aria-activedescendant={mo ? `${idDs}-${iSang}` : undefined}
            aria-autocomplete="list"
            aria-invalid={sai || props['aria-invalid'] || undefined}
            inputMode="numeric"
            autoComplete="off"
            placeholder={placeholder}
            className={cn('tabular-nums', className)}
            value={chu}
            onChange={(e) => {
              vuaFocus.current = false
              setChu(e.target.value)
              setSang(null)
              setMo(true)
            }}
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              props.onFocus?.(e)
              e.target.select()
              vuaFocus.current = true
              setMo(true)
            }}
            onMouseUp={(e: MouseEvent<HTMLInputElement>) => {
              if (vuaFocus.current) e.preventDefault()
              vuaFocus.current = false
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              chot(doc)
              props.onBlur?.(e)
            }}
            onKeyDown={onKeyDown}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        // Radix gắn role=dialog cho Content; ở đây chỉ là vỏ của listbox (focus ở lại ô gõ) — bỏ để không lồng dialog không tên.
        role="presentation"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (neoRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
        // Rộng theo ô (trần dưới 112 = w-28 của ô giờ trong DateTimePicker); đệm nằm ở danh sách để thanh cuộn sát mép.
        className={cn(menuContent, 'min-w-28 w-(--radix-popover-trigger-width) overflow-hidden p-0')}
      >
        <div
          ref={dsRef}
          id={idDs}
          role="listbox"
          aria-label="Gợi ý giờ"
          // 240 = 7½ mục 32 → thấy rõ còn cuộn tiếp (menu DS không có số này; giữ y prototype đã duyệt).
          className="max-h-[240px] overflow-y-auto p-(--menu-gutter) border-none border-current [scrollbar-color:var(--alpha-30)_transparent]"
        >
          {ds.map((g, i) => (
            <div
              key={g}
              id={`${idDs}-${i}`}
              data-i={i}
              role="option"
              aria-selected={g === value}
              data-highlighted={i === iSang ? '' : undefined}
              className={cn(menuItem, 'tabular-nums', g === value && 'font-medium')}
              onPointerDown={(e) => e.preventDefault()}
              onPointerMove={() => i !== iSang && setSang(i)}
              onClick={() => chot(g)}
            >
              {g}
              {i === 0 && ds !== goiY && <span className="ml-auto ds-text-xs text-muted-foreground">đã gõ</span>}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
