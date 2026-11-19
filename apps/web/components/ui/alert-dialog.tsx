'use client'

import type { ComponentProps } from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { body, desc, footer, overlay, panel, title } from './dialog-styles'

/**
 * AlertDialog — khung shadcn (Radix AlertDialog), cùng kiểu với Dialog qua dialog-styles.ts. Khác Dialog:
 * - role="alertdialog"; bấm overlay KHÔNG đóng (Radix chặn); không nút ✕ — chỉ đóng bằng Huỷ / Esc / hành động.
 * - Mở: Radix focus `AlertDialogCancel` (nút an toàn). Muốn khác → `onOpenAutoFocus` (ConfirmDialog làm việc này).
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render.
 * - `AlertDialogAction` ĐÓNG hộp ngay khi bấm (Radix Close) — việc chạy bất đồng bộ dùng nút thường + ConfirmDialog.
 * - Luôn có `AlertDialogTitle` (thiếu → hộp không có tên đọc được). Mô tả tuỳ chọn: Radix 1.3 chỉ gắn aria-describedby
 *   khi có `AlertDialogDescription`.
 * Màn nghiệp vụ dùng ConfirmDialog; primitive này cho trường hợp ConfirmDialog không vừa.
 */
export function AlertDialog(props: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

export function AlertDialogTrigger(props: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

export function AlertDialogContent({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <AlertDialogPrimitive.Portal container={container}>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlay} />
      <AlertDialogPrimitive.Content data-slot="alert-dialog-content" className={cn(panel, className)} {...props} />
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn(title, className)} {...props} />
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn(desc, className)} {...props} />
  )
}

export function AlertDialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-body" className={cn(body, className)} {...props} />
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-footer" className={cn(footer, className)} {...props} />
}

/** Bọc `Button` bằng `asChild` (vd `<AlertDialogCancel asChild><Button variant="outline">Huỷ</Button></AlertDialogCancel>`). */
export function AlertDialogCancel(props: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />
}

export function AlertDialogAction(props: ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />
}
