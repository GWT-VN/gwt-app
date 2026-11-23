// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { CaretRight, Check, Minus } from '@phosphor-icons/react/ssr'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import {
  MENU_SUB,
  itemDisabled,
  menuCheck,
  menuContent,
  menuInset,
  menuItem,
  menuItemDestructive,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubContent,
  menuSubTrigger,
} from './menu-styles'
import { GiaTriRadio, MenuTimKiem, PhimKbd, TuFocusMenuCon, phimSubContent, phimSubTrigger } from './menu-them'

/**
 * ContextMenu — khung shadcn new-york-v4 (Radix ContextMenu): đủ 15 phần, cùng tên, cùng `data-slot`, prop `inset` /
 * `variant`. Đổi bắt buộc: icon lucide → Phosphor; Portal vào ô DsRoot (`useDsPortal`); class shadcn → token `.ui-menu*`
 * qua menu-styles.ts + `.b-chuotphai` (rộng 220, hiện 120ms ease-out từ opacity 0 / scale .98) + `.b-ds-hang[data-cp]`
 * (dòng đang mở nền alpha-05) của ds/nguon/bundle.css; z-90 (thang NGUON).
 *
 * Phần GWT CỘNG THÊM (shadcn không có — giữ nguyên hành vi):
 * - Chuột phải → menu tại con trỏ, focus vào khung menu (không vòng focus ở item). Shift+F10 / phím Menu trên trigger
 *   đang focus → menu neo dưới mép trái dòng + focus mục đầu (Radix tự focus mục đầu khi lần tương tác cuối là phím).
 * - Chuột phải / nhấn giữ (cảm ứng) / Shift+F10 trong ô nhập (`input`, `textarea`, contenteditable) hoặc trong một menu
 *   khác nằm trong dòng → KHÔNG mở menu DS, để nguyên menu trình duyệt (không preventDefault).
 * - Không modal (khác mặc định Radix): đóng khi Esc, bấm ra ngoài, CUỘN (y artifact) — modal thì Radix khoá cuộn; chuột
 *   phải sang dòng khác mở luôn menu của dòng đó.
 * - `disabled` trên Trigger: không mở bằng gì (cả phím). `disabled` trên Item/CheckboxItem/RadioItem theo APG như
 *   DropdownMenu (xem `itemDisabled`).
 * - ✓ / – bên phải, CheckboxItem `checked="indeterminate"`, Shortcut `phim`, SubTrigger `icon`/`phim`, MenuTimKiem,
 *   SubContent tự portal + tự focus: cùng hành vi DropdownMenu (phần không phụ thuộc primitive ở menu-them.tsx).
 * - Dòng mang `data-ds-menu-trigger` và khung menu mang `data-trigger-id` cùng giá trị (không dùng `id`: dòng có `id`
 *   riêng thì Slot cho id của dòng thắng) → mục menu mở Dialog / ConfirmDialog thì hộp đóng xong focus về DÒNG
 *   (use-nut-mo.ts), không rơi body (mục menu đã bị gỡ).
 */
const IdDong = createContext<string | undefined>(undefined)

function ContextMenu({
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

/**
 * Đích KHÔNG mở menu dòng (giữ menu trình duyệt / chạm giữ của hệ điều hành): ô nhập, hoặc phần tử NGOÀI DOM của trigger
 * mà vẫn là con React của nó — portal nổi bọt React (DropdownMenu của ô trong dòng, pop DateTimePicker, danh sách gợi ý
 * TimeInput…): mở menu dòng ở đó là đóng pop, mất nháp.
 */
function giuMenuTrinhDuyet(e: SyntheticEvent<HTMLElement>) {
  const t = e.target
  if (!(t instanceof Node) || !e.currentTarget.contains(t)) return true
  return t instanceof HTMLElement && (t.isContentEditable || !!t.closest('input, textarea'))
}

function ContextMenuTrigger({
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
        if (giuMenuTrinhDuyet(e)) e.stopPropagation()
      }}
      onPointerDownCapture={(e) => {
        onPointerDownCapture?.(e)
        // Nhấn giữ (cảm ứng/bút) trong ô nhập: chặn đường hẹn giờ 700ms của Radix (onPointerDown ở chính trigger) →
        // giữ chọn chữ/menu dán của hệ điều hành. Chuột không qua đường này (Radix chỉ hẹn giờ cho touch/pen).
        if (e.pointerType !== 'mouse' && giuMenuTrinhDuyet(e)) e.stopPropagation()
      }}
      onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
        onKeyDown?.(e)
        const phim = e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')
        if (disabled || !phim || e.defaultPrevented || giuMenuTrinhDuyet(e)) return
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

function ContextMenuGroup({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

/** Portal vào ô DsRoot (truyền `container` để đè). Content/SubContent đã tự portal — chỉ cần khi ghép tay. */
function ContextMenuPortal({ container, ...props }: ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" container={dich} {...props} />
}

function ContextMenuSub({ ...props }: ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

/** Nhóm chọn một (vd menu con Trạng thái / Ưu tiên). */
function ContextMenuRadioGroup({ value, ...props }: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <GiaTriRadio.Provider value={value}>
      <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" value={value} {...props} />
    </GiaTriRadio.Provider>
  )
}

/** Mục mở menu con: `icon` · nhãn · `phim` (Kbd) · ▸ — như DropdownMenuSubTrigger. */
function ContextMenuSubTrigger({
  className,
  inset,
  icon,
  phim,
  children,
  onKeyDown,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
  icon?: ReactNode
  phim?: string[]
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuSubTrigger, menuInset, className)}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        phimSubTrigger(e)
      }}
      {...props}
    >
      {icon}
      {children}
      {phim && <PhimKbd phim={phim} />}
      <CaretRight aria-hidden="true" className={phim ? undefined : 'ml-auto'} />
    </ContextMenuPrimitive.SubTrigger>
  )
}

/** Khung menu con: tự portal vào ô DsRoot, vị trí `MENU_SUB`, R14 không tràn ngang — như DropdownMenuSubContent. */
function ContextMenuSubContent({
  className,
  sideOffset = MENU_SUB.sideOffset,
  alignOffset = MENU_SUB.alignOffset,
  collisionPadding = 8,
  onKeyDownCapture,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <ContextMenuPrimitive.Portal container={container}>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={cn(menuSubContent, className)}
        onKeyDownCapture={(e) => {
          onKeyDownCapture?.(e)
          phimSubContent(e)
        }}
        {...props}
      >
        {children}
        <TuFocusMenuCon />
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  )
}

/**
 * `side="bottom"` (Radix mặc định "right"): Popper chỉ dời theo trục căn → mở bên phải thì menu 220 tràn mép phải ở khổ
 * hẹp (đo 390: chuột ở giữa dòng, không đủ chỗ cả phải lẫn trái). Mở xuống dưới con trỏ thì dời ngang vào trong khung
 * nhìn, lật lên khi sát đáy — như menu chuột phải của hệ điều hành; phím Shift+F10 → ngay dưới mép trái dòng.
 * `collisionPadding` 8 = trần cao `calc(100vh-16px)` của menuContent: dời vào trong còn cách mép khung nhìn 8px.
 */
function ContextMenuContent({
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

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItem, menuInset, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

/** Mục bật/tắt: ✓ bên phải khi bật; `checked="indeterminate"` → – và `aria-checked="mixed"` — như DropdownMenu. */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  onSelect,
  onCheckedChange,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(menuItem, className)}
      checked={checked}
      {...props}
      {...itemDisabled(disabled, onSelect)}
      onCheckedChange={disabled ? undefined : onCheckedChange}
    >
      {children}
      <ContextMenuPrimitive.ItemIndicator asChild>
        {checked === 'indeterminate' ? (
          <Minus aria-hidden="true" data-chi-bao="mot-phan" className={menuCheck} />
        ) : (
          <Check aria-hidden="true" data-chi-bao="chon" className={menuCheck} />
        )}
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.CheckboxItem>
  )
}

/** Mục chọn một: ✓ bên phải; `indicator` thay ✓; `disabled` theo APG — như DropdownMenuRadioItem. */
function ContextMenuRadioItem({
  className,
  children,
  disabled,
  onSelect,
  indicator,
  value,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem> & { indicator?: ReactNode }) {
  const dangChon = useContext(GiaTriRadio) === value
  if (disabled)
    return (
      <ContextMenuPrimitive.Item
        data-slot="context-menu-radio-item"
        role="menuitemradio"
        aria-checked={dangChon}
        data-state={dangChon ? 'checked' : 'unchecked'}
        className={cn(menuItem, className)}
        {...props}
        {...itemDisabled(true)}
      >
        {children}
        {indicator ?? (dangChon && <Check aria-hidden="true" className={menuCheck} />)}
      </ContextMenuPrimitive.Item>
    )
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      value={value}
      className={cn(menuItem, className)}
      onSelect={onSelect}
      {...props}
    >
      {children}
      {indicator ?? (
        <ContextMenuPrimitive.ItemIndicator asChild>
          <Check aria-hidden="true" className={menuCheck} />
        </ContextMenuPrimitive.ItemIndicator>
      )}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={cn(menuLabel, menuInset, className)}
      {...props}
    />
  )
}

function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

/** Phím tắt căn phải; `phim` → nhóm Kbd (GWT thêm) — như DropdownMenuShortcut. */
function ContextMenuShortcut({ className, phim, ...props }: ComponentProps<'span'> & { phim?: string[] }) {
  if (phim) return <PhimKbd data-slot="context-menu-shortcut" phim={phim} className={className} {...props} />
  return <span data-slot="context-menu-shortcut" className={cn(menuShortcut, className)} {...props} />
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  // GWT thêm (menu-them.tsx).
  MenuTimKiem,
}
