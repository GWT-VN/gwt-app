'use client'

import { createContext, useContext, useEffect, useId, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { itemDisabled, menuContent, menuItem, menuItemDestructive, menuLabel, menuSeparator } from './menu-styles'

/**
 * ContextMenu — khung shadcn (Radix ContextMenu) bọc mỗi dòng/thẻ, thay nút ⋯ cuối dòng. Giá trị: `.ui-menu*` qua
 * menu-styles.ts + `.b-chuotphai` (rộng 220, hiện 120ms ease-out từ opacity 0 / scale .98) + `.b-ds-hang[data-cp]` (dòng
 * đang mở nền alpha-05) của ds/nguon/bundle.css.
 * - Chuột phải → menu tại con trỏ, focus vào khung menu (không vòng focus ở item). Shift+F10 / phím Menu trên trigger
 *   đang focus → menu neo dưới mép trái dòng + focus mục đầu (Radix tự focus mục đầu khi lần tương tác cuối là phím).
 * - Chuột phải / nhấn giữ (cảm ứng) / Shift+F10 trong ô nhập (`input`, `textarea`, contenteditable) hoặc trong một menu khác nằm trong dòng →
 *   KHÔNG mở menu DS, để nguyên menu trình duyệt (không preventDefault).
 * - Không modal (khác mặc định Radix): đóng khi Esc, bấm ra ngoài, CUỘN (y artifact) — modal thì Radix khoá cuộn; chuột
 *   phải sang dòng khác mở luôn menu của dòng đó.
 * - `disabled` trên Trigger: không mở bằng gì (cả phím). `disabled` trên Item theo APG như DropdownMenu (xem `itemDisabled`). Không sub-menu/checkbox/radio: artifact không có.
 * - Dòng mang `data-ds-menu-trigger` và khung menu mang `data-trigger-id` cùng giá trị (không dùng `id`: dòng có `id`
 *   riêng thì Slot cho id của dòng thắng) → mục menu mở Dialog /
 *   ConfirmDialog thì hộp đóng xong focus về DÒNG (use-nut-mo.ts), không rơi body (mục menu đã bị gỡ).
 */
const IdDong = createContext<string | undefined>(undefined)

export function ContextMenu({
  open: openProp,
  onOpenChange,
  modal = false,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Root>) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const doi = (o: boolean) => {
    setOpenState(o)
    onOpenChange?.(o)
  }
  useEffect(() => {
    if (!open) return
    // Cuộn bên trong chính menu (nếu menu dài) thì giữ; cuộn trang/vùng khác → đóng.
    const dong = (e: Event) => {
      if (!(e.target instanceof Element && e.target.closest('[role="menu"]'))) {
        setOpenState(false)
        onOpenChange?.(false)
      }
    }
    window.addEventListener('scroll', dong, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', dong, { capture: true })
  }, [open, onOpenChange])
  const id = useId()
  return (
    <IdDong.Provider value={id}>
      <ContextMenuPrimitive.Root data-slot="context-menu" open={open} onOpenChange={doi} modal={modal} {...props} />
    </IdDong.Provider>
  )
}

/** Phần tử giữ menu trình duyệt: ô nhập, hoặc menu khác (vd DropdownMenu của ô trong dòng — portal vẫn nổi bọt React). */
function giuMenuTrinhDuyet(t: EventTarget) {
  return t instanceof HTMLElement && (t.isContentEditable || !!t.closest('input, textarea, [role="menu"]'))
}

export function ContextMenuTrigger({
  className,
  disabled,
  onContextMenuCapture,
  onPointerDownCapture,
  onKeyDown,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  const id = useContext(IdDong)
  return (
    <ContextMenuPrimitive.Trigger
      data-ds-menu-trigger={id}
      data-slot="context-menu-trigger"
      className={cn('data-[state=open]:bg-(--alpha-05)', className)}
      onContextMenuCapture={(e) => {
        onContextMenuCapture?.(e)
        // Chặn sự kiện đi tới handler của Radix (bubble ở chính trigger) mà KHÔNG preventDefault → menu trình duyệt.
        if (giuMenuTrinhDuyet(e.target)) e.stopPropagation()
      }}
      onPointerDownCapture={(e) => {
        onPointerDownCapture?.(e)
        // Nhấn giữ (cảm ứng/bút) trong ô nhập: chặn đường hẹn giờ 700ms của Radix (onPointerDown ở chính trigger) →
        // giữ chọn chữ/menu dán của hệ điều hành. Chuột không qua đường này (Radix chỉ hẹn giờ cho touch/pen).
        if (e.pointerType !== 'mouse' && giuMenuTrinhDuyet(e.target)) e.stopPropagation()
      }}
      onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
        onKeyDown?.(e)
        const phim = e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')
        if (disabled || !phim || e.defaultPrevented || giuMenuTrinhDuyet(e.target)) return
        // Radix không có đường phím riêng (chỉ nghe contextmenu). Tự mở neo dưới mép trái dòng; preventDefault để trình
        // duyệt không bắn thêm contextmenu của nó (toạ độ tuỳ trình duyệt) — đủ cho Shift+F10.
        e.preventDefault()
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.dispatchEvent(
          new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left, clientY: r.bottom }),
        )
        // Phím Menu: Chrome/Windows bắn thêm contextmenu gốc lúc NHẢ phím (đo thật qua CDP), vào item vừa được focus —
        // nằm ngoài trigger nên không ai chặn → menu trình duyệt đè lên menu DS. Chặn mọi contextmenu tới hết keyup đó.
        // Rời cửa sổ trước khi nhả (Alt+Tab…) thì keyup không tới → gỡ cả khi blur.
        if (e.key === 'ContextMenu') {
          const chan = (ev: Event) => ev.preventDefault()
          const go = () =>
            setTimeout(() => {
              window.removeEventListener('contextmenu', chan, true)
              window.removeEventListener('keyup', go, true)
              window.removeEventListener('blur', go)
            })
          window.addEventListener('contextmenu', chan, true)
          window.addEventListener('keyup', go, true)
          window.addEventListener('blur', go)
        }
      }}
      disabled={disabled}
      {...props}
    />
  )
}

/**
 * `side="bottom"` (Radix mặc định "right"): Popper chỉ dời theo trục căn → mở bên phải thì menu 220 tràn mép phải ở khổ
 * hẹp (đo 390: chuột ở giữa dòng, không đủ chỗ cả phải lẫn trái). Mở xuống dưới con trỏ thì dời ngang vào trong khung
 * nhìn, lật lên khi sát đáy — như menu chuột phải của hệ điều hành; phím Shift+F10 → ngay dưới mép trái dòng.
 * `collisionPadding` 8 = trần cao `calc(100vh-16px)` của menuContent: dời vào trong còn cách mép khung nhìn 8px.
 */
export function ContextMenuContent({
  className,
  side = 'bottom',
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  const container = useDsPortal()
  const idDong = useContext(IdDong)
  if (!container) return null
  return (
    <ContextMenuPrimitive.Portal container={container}>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        data-trigger-id={idDong}
        side={side}
        collisionPadding={collisionPadding}
        className={cn(
          menuContent,
          'w-[220px]',
          // `.b-chuotphai` animation b-hien: từ opacity 0 + scale .98, 120ms ease-out; giảm chuyển động → không.
          'transition-[opacity,scale] duration-120 ease-out starting:opacity-0 starting:scale-[0.98] motion-reduce:transition-none',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

export function ContextMenuItem({
  className,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-variant={variant}
      className={cn(menuItem, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

export function ContextMenuLabel({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Label>) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" className={cn(menuLabel, className)} {...props} />
}

export function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}
