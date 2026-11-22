// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import * as s from './command-styles'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'

/**
 * Command — khung shadcn new-york-v4 (cmdk 1.1.1): đủ 9 export, cùng tên, cùng `data-slot`. Đổi bắt buộc: icon lucide →
 * Phosphor; class shadcn → token `.ui-menu*` (cỡ gọn) qua command-styles.ts; CommandDialog dựng trên Dialog của DS (portal
 * vào DsRoot, z-70, trả focus `useNutMo`).
 *
 * Phần GWT (lệch shadcn có chủ đích):
 * - `CommandInput`: `wrapperClassName` cho hàng bọc (shadcn không cho chỉnh hàng bọc) và `children` = phần đuôi hàng sau ô gõ
 *   (vd Kbd "Esc" của CommandPalette).
 * - `CommandDialog`: tiêu đề + mô tả sr-only nằm TRONG DialogContent (shadcn đặt ngoài → chữ sr-only nằm thường trực trên
 *   trang, kể cả lúc hộp đóng); chữ mặc định tiếng Việt.
 *
 * ⚠️ cmdk 1.1.1: (1) lúc MOUNT gọi `scrollIntoView({ block: 'nearest' })` lên mục sáng → Command sống đặt giữa trang dài kéo
 * CẢ CỬA SỔ tới nó. Mặt nằm sẵn trên trang: `defaultValue` không trùng mục nào (chưa sáng mục nào lúc nạp) hoặc mặt tĩnh
 * (`tinh` của CommandPanel/ComboboxPanel). (2) mục sáng chỉ tính lại khi chữ ô tìm đổi, `aria-activedescendant` chỉ gắn
 * khi đổi bằng ↑/↓ → lọc ngoài (`shouldFilter={false}`) thì tự giữ `value` + gắn lại (xem combobox.tsx). NGUON.md.
 */
function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn(s.command, className)} {...props} />
}

function CommandDialog({
  title = 'Bảng lệnh',
  description = 'Tìm một lệnh để chạy…',
  children,
  className,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn(s.commandDialogContent, className)} showCloseButton={showCloseButton}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className={s.commandDialog}>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  wrapperClassName,
  children,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input> & { wrapperClassName?: string }) {
  return (
    <div data-slot="command-input-wrapper" className={cn(s.commandInputWrapper, wrapperClassName)}>
      <MagnifyingGlass aria-hidden="true" className={s.commandInputIcon} />
      <CommandPrimitive.Input data-slot="command-input" className={cn(s.commandInput, className)} {...props} />
      {children}
    </div>
  )
}

function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn(s.commandList, className)} {...props} />
}

function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn(s.commandEmpty, className)} {...props} />
}

function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group data-slot="command-group" className={cn(s.commandGroup, className)} {...props} />
}

function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn(s.commandSeparator, className)} {...props} />
}

function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item data-slot="command-item" className={cn(s.commandItem, className)} {...props} />
}

function CommandShortcut({ className, ...props }: ComponentProps<'span'>) {
  return <span data-slot="command-shortcut" className={cn(s.commandShortcut, className)} {...props} />
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
