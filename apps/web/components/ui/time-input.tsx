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
import { Clock, X } from '@phosphor-icons/react/ssr'
import { docGio, GIO_GOI_Y_DAU, GOI_Y_GIO } from '@/lib/gio'
import { cn } from '@/lib/utils'
import { nutXoaTrongO } from './control-styles'
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
 * - Ô trống KHÔNG tự lấy giờ (CEO 22/11): danh sách mở ở quanh `GIO_GOI_Y_DAU` nhưng chưa mục nào sáng — Enter / rời ô
 *   lúc trống = `onValueChange(null)` (bỏ giờ). Có giờ → nút ✕ "Xoá giờ" ở mép phải ô (kiểu nút bỏ chọn của Combobox).
 * - Danh sách = mặt menu DS (`menuContent`/`menuItem`) trong Popover portal vùng DS; focus ở lại ô gõ. Tự cuộn mục sáng
 *   bằng scrollTop (scrollIntoView kéo cả cửa sổ).
 * - `goiY` = danh sách gợi ý (mặc định mỗi 30 phút); `[]` = không có danh sách. `placeholder` mặc định "Giờ";
 *   DateTimePicker truyền `gioMacDinh` nếu bên gọi có. Mọi prop `<input>` khác (id, aria-*, disabled…) rơi vào ô.
 */
export function TimeInput({
  value,
  onValueChange,
  onEnter,
  goiY = GOI_Y_GIO,
  goiYPhiaTren = false,
  placeholder = 'Giờ',
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'defaultValue'> & {
  value: string | null
  /** "HH:mm"; null = bỏ giờ (ô trống, hoặc bấm ✕). */
  onValueChange(gio: string | null): void
  /** Thay onValueChange khi Enter chốt một giá trị hợp lệ hoặc ô trống. */
  onEnter?(gio: string | null): void
  goiY?: string[]
  /** Danh sách chỉ mở phía trên ô giờ để chừa phần thao tác bên dưới. */
  goiYPhiaTren?: boolean
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
  const [sang, setSang] = useState<number | null>(null) // null = theo chữ đang gõ
  // Mục sáng: dời bằng ↑/↓, không thì mục khớp chữ đang gõ; ô trống → không mục nào (Enter không lấy gợi ý).
  const iSang = sang ?? (doc ? ds.indexOf(doc) : null)
  const iNeo = iSang ?? Math.max(0, ds.indexOf(GIO_GOI_Y_DAU)) // chỗ cuộn tới + mốc đầu của ↑/↓
  const neoRef = useRef<HTMLDivElement>(null)
  const vuaFocus = useRef(false) // focus bằng chuột: mouseup bỏ vùng chọn → giữ "chọn hết" để gõ đè
  const khongMoKhiFocus = useRef(false) // focus trả về từ nút ✕ → không bung danh sách gợi ý
  const [hopGoiY, datHopGoiY] = useState<HTMLDivElement | null>(null)
  const idDs = useId()
  const sai = chu.trim() !== '' && !doc

  useLayoutEffect(() => {
    const muc = hopGoiY?.querySelector<HTMLElement>(`[data-i="${iNeo}"]`)
    if (!hopGoiY || !muc) return
    const thayMuc = () => {
      if (muc.offsetTop < hopGoiY.scrollTop) hopGoiY.scrollTo({ top: muc.offsetTop - 6 })
      else if (muc.offsetTop + muc.offsetHeight > hopGoiY.scrollTop + hopGoiY.clientHeight)
        hopGoiY.scrollTo({ top: muc.offsetTop + muc.offsetHeight - hopGoiY.clientHeight + 6 })
    }
    thayMuc()
    // Popper có thể đổi chiều cao sau khi gắn portal hoặc khi cửa sổ co lại.
    const doLai = new ResizeObserver(thayMuc)
    doLai.observe(hopGoiY)
    return () => doLai.disconnect()
  }, [hopGoiY, iNeo])

  const chot = (g: string | null, bao = onValueChange) => {
    if (g) {
      bao(g)
      setChu(g)
    } else if (!chu.trim()) {
      bao(null)
      setChu('')
    } else setChu(value ?? '') // gõ sai → trả lại giá trị cũ
    setSang(null)
    setMo(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!mo) return setMo(true)
      setSang(iSang === null ? iNeo : Math.min(ds.length - 1, Math.max(0, iSang + (e.key === 'ArrowDown' ? 1 : -1))))
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      chot(mo && iSang !== null ? ds[iSang] : doc, onEnter)
    }
  }

  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverAnchor asChild>
        <div ref={neoRef} className="relative flex min-w-0 items-center border-none border-current [&>:first-child]:min-w-0 [&>:first-child]:flex-1">
          <Input
            {...props}
            icon={<Clock />}
            role="combobox"
            aria-expanded={mo}
            aria-controls={mo ? idDs : undefined}
            aria-activedescendant={mo && iSang !== null ? `${idDs}-${iSang}` : undefined}
            aria-autocomplete="list"
            aria-invalid={sai || props['aria-invalid'] || undefined}
            inputMode="numeric"
            autoComplete="off"
            placeholder={placeholder}
            // pr-8 = nút ✕ 20 + lề phải 6 + cách chữ 6.
            className={cn('tabular-nums', value && !props.disabled && 'pr-8', className)}
            value={chu}
            onChange={(e) => {
              vuaFocus.current = false
              setChu(e.target.value)
              setSang(null)
              setMo(true)
            }}
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              props.onFocus?.(e)
              if (khongMoKhiFocus.current) {
                khongMoKhiFocus.current = false
                return
              }
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
          {value && !props.disabled && (
            <button
              type="button"
              aria-label="Xoá giờ"
              // Giữ focus nơi đang đứng (không blur ô gõ giữa chừng); bấm là bỏ giờ ngay.
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                setChu('')
                setSang(null)
                setMo(false)
                onValueChange(null)
                // Bấm bằng phím (focus đang ở nút): nút sắp gỡ → focus rơi về body. Đưa về ô gõ, không bung gợi ý ở lượt
                // focus này (mẫu nutRef.focus() của Combobox).
                if (document.activeElement === e.currentTarget) {
                  khongMoKhiFocus.current = true
                  neoRef.current?.querySelector('input')?.focus()
                }
              }}
              // Y nút bỏ chọn của Combobox: 20, icon 14 muted, rê → foreground; mép phải 6.
              className={cn(nutXoaTrongO, 'right-1.5')}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        // Radix gắn role=dialog cho Content; ở đây chỉ là vỏ của listbox (focus ở lại ô gõ) — bỏ để không lồng dialog không tên.
        role="presentation"
        side={goiYPhiaTren ? 'top' : 'bottom'}
        avoidCollisions={!goiYPhiaTren}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={() => {
          setChu(value ?? '')
          setSang(null)
        }}
        onInteractOutside={(e) => {
          if (neoRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
        // Rộng theo ô (trần dưới 112 = w-28 của ô giờ trong DateTimePicker); đệm nằm ở danh sách để thanh cuộn sát mép.
        className={cn(menuContent, 'min-w-28 w-(--radix-popover-trigger-width) overflow-hidden p-0')}
      >
        <div
          ref={datHopGoiY}
          id={idDs}
          role="listbox"
          aria-label="Gợi ý giờ"
          // 240 = 7½ mục 32 → thấy rõ còn cuộn tiếp (menu DS không có số này; giữ y prototype đã duyệt).
          className="max-h-[min(240px,var(--radix-popover-content-available-height,240px))] overflow-y-auto p-(--menu-gutter) border-none border-current [scrollbar-color:var(--alpha-30)_transparent]"
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
