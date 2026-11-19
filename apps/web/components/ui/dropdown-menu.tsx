'use client'

import type { ComponentProps } from 'react'
import { Check } from '@phosphor-icons/react/ssr'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { menuCheck, menuContent, menuItem, menuItemDestructive, menuLabel, menuSeparator, menuShortcut } from './menu-styles'

/**
 * DropdownMenu — khung shadcn (Radix DropdownMenu), giá trị từ `.ui-menu*` của ds/nguon/bundle.css qua menu-styles.ts.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render nội dung (ra document.body là mất token DS).
 * - Item chặn quyền: truyền `disabled` → Radix gắn `aria-disabled` + `data-disabled`, không gọi onSelect, bàn phím bỏ
 *   qua; item VẪN HIỆN (mờ) để người dùng biết có thao tác đó nhưng mình không có quyền.
 * - Không animation, không sub-menu, không radio: artifact không định nghĩa.
 */
export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(menuContent, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(menuItem, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
    />
  )
}

/** Mục bật/tắt (vd "Cột hiển thị"): ✓ bên phải khi bật, không chừa chỗ khi tắt — y preview. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItem, className)}
      {...props}
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
