'use client'

// PROTOTYPE vứt đi — ô giờ gõ được + danh sách gợi ý mỗi 30 phút (dùng ở A và B). Dựng từ Input + Popover + menu DS.
import { useId, useLayoutEffect, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { Clock } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { oSua } from '@/components/ui/inline-edit-styles'
import { menuContent, menuItem } from '@/components/ui/menu-styles'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { docGio, GIO_MAC_DINH, GOI_Y_GIO } from './gio'

/**
 * Ô giờ 24h: gõ "1430" / "14:30" / "9" (→ 09:00) / phút lẻ "14:45"; ↑/↓ chọn gợi ý, Enter chốt (không chốt khi bộ gõ
 * đang ghép chữ), Esc trả về giá trị cũ, rời ô chốt nếu đọc được. `gon` = ô trong dòng bảng (vẻ InlineEdit, không viền).
 */
export function OGio({
  value,
  onValueChange,
  id,
  gon,
  className,
  goiY = true,
  placeholder,
  ...aria
}: {
  value: string | null
  onValueChange(gio: string): void
  id?: string
  gon?: boolean
  className?: string
  /** false = không bật danh sách gợi ý (A2 đã có cột giờ cạnh bên). */
  goiY?: boolean
  placeholder?: string
  'aria-label'?: string
  'aria-describedby'?: string
}) {
  const [chu, setChu] = useState(value ?? '')
  const [goc, setGoc] = useState(value)
  if (value !== goc) {
    setGoc(value)
    setChu(value ?? '')
  }
  const [moGoc, setMo] = useState(false)
  const mo = goiY && moGoc
  const doc = docGio(chu)
  const ds = doc && !GOI_Y_GIO.includes(doc) ? [doc, ...GOI_Y_GIO] : GOI_Y_GIO
  const macDinh = Math.max(0, ds.indexOf(doc ?? value ?? GIO_MAC_DINH))
  const [sang, setSang] = useState<number | null>(null) // null = theo chữ đang gõ
  const iSang = sang ?? macDinh
  const neoRef = useRef<HTMLDivElement>(null)
  const vuaFocus = useRef(false) // focus bằng chuột: mouseup bỏ vùng chọn → giữ "chọn hết" để gõ đè
  const dsRef = useRef<HTMLDivElement>(null)
  const idDs = useId()
  const sai = chu.trim() !== '' && !doc

  // Giữ mục sáng trong tầm nhìn của danh sách (tự tính scrollTop — scrollIntoView kéo cả cửa sổ).
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
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!mo) return setMo(true)
      setSang(Math.min(ds.length - 1, Math.max(0, iSang + (e.key === 'ArrowDown' ? 1 : -1))))
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      e.stopPropagation()
      chot(mo ? ds[iSang] : doc)
    } else if (e.key === 'Escape' && mo) {
      e.stopPropagation()
      setChu(value ?? '')
      setSang(null)
    }
  }

  const props = {
    id,
    ...aria,
    role: 'combobox',
    'aria-expanded': mo,
    'aria-controls': mo ? idDs : undefined,
    'aria-activedescendant': mo ? `${idDs}-${iSang}` : undefined,
    'aria-autocomplete': 'list' as const,
    'aria-invalid': sai || undefined,
    inputMode: 'numeric' as const,
    autoComplete: 'off',
    placeholder: placeholder ?? (gon ? '--:--' : 'Giờ'),
    value: chu,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      vuaFocus.current = false
      setChu(e.target.value)
      setSang(null)
      setMo(true)
    },
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      e.target.select()
      vuaFocus.current = true
      setMo(true)
    },
    onMouseUp: (e: MouseEvent<HTMLInputElement>) => {
      if (vuaFocus.current) e.preventDefault()
      vuaFocus.current = false
    },
    onBlur: () => chot(doc),
    onKeyDown,
  }

  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverAnchor asChild>
        <div ref={neoRef} className={cn('min-w-0 border-none border-current', gon ? 'inline-flex' : 'flex *:min-w-0 *:flex-1', className)}>
          {gon ? (
            <input {...props} className={cn(oSua, 'mx-0 w-[54px] pr-1.5 tabular-nums placeholder:text-(--color-text-tertiary) aria-invalid:text-(--color-text-danger)')} />
          ) : (
            <Input {...props} icon={<Clock />} className="tabular-nums" />
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (neoRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
        className={cn(menuContent, 'min-w-[112px] w-(--radix-popover-trigger-width) overflow-hidden p-0')}
      >
        <div
          ref={dsRef}
          id={idDs}
          role="listbox"
          aria-label="Gợi ý giờ"
          className="max-h-[240px] overflow-y-auto p-(--menu-gutter) [scrollbar-color:var(--alpha-30)_transparent]"
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
              {i === 0 && ds !== GOI_Y_GIO && <span className="ml-auto ds-text-xs text-muted-foreground">đã gõ</span>}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
