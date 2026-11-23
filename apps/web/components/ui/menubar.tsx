// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react'
import { CaretRight, Check, Minus } from '@phosphor-icons/react/ssr'
import { Menubar as MenubarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import {
  MENUBAR_CONTENT,
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
  menubar,
  menubarTrigger,
} from './menu-styles'
import { GiaTriRadio, MenuTimKiem, PhimKbd, TuFocusMenuCon, phimSubContent, phimSubTrigger } from './menu-them'

/**
 * Menubar — khung shadcn new-york-v4 (Radix Menubar): đủ 16 phần, cùng tên, cùng `data-slot`, prop `inset` / `variant`.
 * Artifact CHƯA có Menubar → thanh + nút gán token theo shadcn (menu-styles.ts `menubar`, `menubarTrigger`); khung menu
 * và mục DÙNG CHUNG `.ui-menu*` với DropdownMenu/ContextMenu (cùng menu-styles.ts) nên mục trong Menubar trông y hệt.
 * Đổi bắt buộc: icon lucide → Phosphor; Portal vào ô DsRoot (`useDsPortal`); z-90 (thang NGUON); không animation.
 *
 * Phần GWT cộng thêm — giống hệt DropdownMenu: `disabled` theo APG (`itemDisabled`), ✓ / – bên phải, CheckboxItem
 * `checked="indeterminate"`, RadioItem `indicator`, Shortcut `phim`, SubTrigger `icon`/`phim`, MenuTimKiem, SubContent tự
 * portal + tự focus; nút mở mang `data-ds-menu-trigger`, khung mang `data-trigger-id` (use-nut-mo.ts trả focus về nút).
 *
 * Bàn phím (Radix): ←/→ giữa các nút trên thanh (roving, vòng lại), ↓/Enter/Space mở menu, ←/→ khi menu mở → sang menu
 * kế bên, Esc đóng và trả focus về nút. Đang mở một menu thì rê sang nút khác mở luôn menu đó.
 */
const IdNut = createContext<string | undefined>(undefined)

function Menubar({ className, ...props }: ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root data-slot="menubar" className={cn(menubar, className)} {...props} />
}

function MenubarMenu({ ...props }: ComponentProps<typeof MenubarPrimitive.Menu>) {
  const id = useId()
  return (
    <IdNut.Provider value={id}>
      <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
    </IdNut.Provider>
  )
}

function MenubarGroup({ ...props }: ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

/** Portal vào ô DsRoot (truyền `container` để đè). Content/SubContent đã tự portal — chỉ cần khi ghép tay. */
function MenubarPortal({ container, ...props }: ComponentProps<typeof MenubarPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <MenubarPrimitive.Portal data-slot="menubar-portal" container={dich} {...props} />
}

function MenubarRadioGroup({ value, ...props }: ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <GiaTriRadio.Provider value={value}>
      <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" value={value} {...props} />
    </GiaTriRadio.Provider>
  )
}

function MenubarTrigger({ className, ...props }: ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-ds-menu-trigger={useContext(IdNut)}
      data-slot="menubar-trigger"
      className={cn(menubarTrigger, className)}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = MENUBAR_CONTENT.align,
  alignOffset = MENUBAR_CONTENT.alignOffset,
  sideOffset = MENUBAR_CONTENT.sideOffset,
  // 8px mỗi mép = trần cao `calc(100vh-16px)` của menuContent (như DropdownMenu).
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Content>) {
  const container = useDsPortal()
  const idNut = useContext(IdNut)
  if (!container) return null
  return (
    <MenubarPrimitive.Portal container={container}>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        data-trigger-id={idNut}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(menuContent, className)}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItem, menuInset, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

/** Mục bật/tắt: ✓ bên phải khi bật; `checked="indeterminate"` → – và `aria-checked="mixed"` — như DropdownMenu. */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  disabled,
  onSelect,
  onCheckedChange,
  ...props
}: ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(menuItem, className)}
      checked={checked}
      {...props}
      {...itemDisabled(disabled, onSelect)}
      onCheckedChange={disabled ? undefined : onCheckedChange}
    >
      {children}
      <MenubarPrimitive.ItemIndicator asChild>
        {checked === 'indeterminate' ? (
          <Minus aria-hidden="true" data-chi-bao="mot-phan" className={menuCheck} />
        ) : (
          <Check aria-hidden="true" data-chi-bao="chon" className={menuCheck} />
        )}
      </MenubarPrimitive.ItemIndicator>
    </MenubarPrimitive.CheckboxItem>
  )
}

/** Mục chọn một: ✓ bên phải; `indicator` thay ✓; `disabled` theo APG — như DropdownMenuRadioItem. */
function MenubarRadioItem({
  className,
  children,
  disabled,
  onSelect,
  indicator,
  value,
  ...props
}: ComponentProps<typeof MenubarPrimitive.RadioItem> & { indicator?: ReactNode }) {
  const dangChon = useContext(GiaTriRadio) === value
  if (disabled)
    return (
      <MenubarPrimitive.Item
        data-slot="menubar-radio-item"
        role="menuitemradio"
        aria-checked={dangChon}
        data-state={dangChon ? 'checked' : 'unchecked'}
        className={cn(menuItem, className)}
        {...props}
        {...itemDisabled(true)}
      >
        {children}
        {indicator ?? (dangChon && <Check aria-hidden="true" className={menuCheck} />)}
      </MenubarPrimitive.Item>
    )
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      value={value}
      className={cn(menuItem, className)}
      onSelect={onSelect}
      {...props}
    >
      {children}
      {indicator ?? (
        <MenubarPrimitive.ItemIndicator asChild>
          <Check aria-hidden="true" className={menuCheck} />
        </MenubarPrimitive.ItemIndicator>
      )}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset || undefined}
      className={cn(menuLabel, menuInset, className)}
      {...props}
    />
  )
}

function MenubarSeparator({ className, ...props }: ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn(menuSeparator, className)} {...props} />
}

/** Phím tắt căn phải; `phim` → nhóm Kbd (GWT thêm) — như DropdownMenuShortcut. */
function MenubarShortcut({ className, phim, ...props }: ComponentProps<'span'> & { phim?: string[] }) {
  if (phim) return <PhimKbd data-slot="menubar-shortcut" phim={phim} className={className} {...props} />
  return <span data-slot="menubar-shortcut" className={cn(menuShortcut, className)} {...props} />
}

function MenubarSub({ ...props }: ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

/** Mục mở menu con: `icon` · nhãn · `phim` (Kbd) · ▸ — như DropdownMenuSubTrigger. */
function MenubarSubTrigger({
  className,
  inset,
  icon,
  phim,
  children,
  onKeyDown,
  ...props
}: ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
  icon?: ReactNode
  phim?: string[]
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
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
    </MenubarPrimitive.SubTrigger>
  )
}

/** Khung menu con: tự portal vào ô DsRoot, vị trí `MENU_SUB`, R14 không tràn ngang — như DropdownMenuSubContent. */
function MenubarSubContent({
  className,
  sideOffset = MENU_SUB.sideOffset,
  alignOffset = MENU_SUB.alignOffset,
  collisionPadding = 8,
  onKeyDownCapture,
  children,
  ...props
}: ComponentProps<typeof MenubarPrimitive.SubContent>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <MenubarPrimitive.Portal container={container}>
      <MenubarPrimitive.SubContent
        data-slot="menubar-sub-content"
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
      </MenubarPrimitive.SubContent>
    </MenubarPrimitive.Portal>
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  // GWT thêm (menu-them.tsx).
  MenuTimKiem,
}
