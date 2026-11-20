'use client'

import { createContext, useContext, useId, type ComponentProps } from 'react'
import { Check } from '@phosphor-icons/react/ssr'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import {
  itemDisabled,
  menuCheck,
  menuContent,
  menuItem,
  menuItemDestructive,
  menuLabel,
  menuSeparator,
  menuShortcut,
} from './menu-styles'

/**
 * DropdownMenu — khung shadcn (Radix DropdownMenu), giá trị từ `.ui-menu*` của ds/nguon/bundle.css qua menu-styles.ts.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render nội dung (ra document.body là mất token DS).
 * - `disabled` trên Item/CheckboxItem theo APG (không phải nghĩa Radix): item VẪN HIỆN và VẪN FOCUS được (↑/↓, gõ chữ
 *   đầu dừng ở nó) nhưng không kích hoạt — onSelect/onCheckedChange không chạy, menu không đóng. Ghi lý do ngay trong
 *   chữ ("Chuyển kho (không có quyền)") để trình đọc màn hình đọc kèm. Xem `itemDisabled` trong menu-styles.ts.
 * - Không animation, không sub-menu, không radio: artifact không định nghĩa.
 */
/** Nút mở mang `data-ds-menu-trigger`, khung menu mang `data-trigger-id` cùng giá trị → mục menu mở Dialog/ConfirmDialog
 * thì hộp đóng xong focus về nút (use-nut-mo.ts). Không dựa `aria-labelledby` của Radix: nút `asChild` có `id` riêng
 * thì Slot cho id đó thắng, còn aria-labelledby vẫn là id Radix tự sinh. */
const IdNut = createContext<string | undefined>(undefined)

export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const id = useId()
  return (
    <IdNut.Provider value={id}>
      <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
    </IdNut.Provider>
  )
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger data-ds-menu-trigger={useContext(IdNut)} data-slot="dropdown-menu-trigger" {...props} />
  )
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const container = useDsPortal()
  const idNut = useContext(IdNut)
  if (!container) return null
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        data-trigger-id={idNut}
        sideOffset={sideOffset}
        // 8px mỗi mép = trần cao `calc(100vh-16px)` của menuContent: khổ 390 menu không dính mép khung nhìn.
        collisionPadding={collisionPadding}
        className={cn(menuContent, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(menuItem, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

/** Mục bật/tắt (vd "Cột hiển thị"): ✓ bên phải khi bật, không chừa chỗ khi tắt — y preview. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  disabled,
  onSelect,
  onCheckedChange,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItem, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
      onCheckedChange={disabled ? undefined : onCheckedChange}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator asChild>
        <Check aria-hidden="true" className={menuCheck} />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn(menuLabel, className)} {...props} />
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

export function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  return <span data-slot="dropdown-menu-shortcut" className={cn(menuShortcut, className)} {...props} />
}
