'use client'

import type { ComponentProps } from 'react'
import { X } from '@phosphor-icons/react/ssr'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { body, closeBtn, desc, footer, overlay, panel, title } from './dialog-styles'

/**
 * Dialog — khung shadcn (Radix Dialog), giá trị từ `.ui-overlay` / `.ui-dialog*` của ds/nguon/bundle.css qua
 * dialog-styles.ts.
 * - Overlay + hộp portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render gì (ra document.body là mất token).
 * - Radix lo: bẫy Tab trong hộp, Esc / bấm overlay đóng, trả focus về trigger, khoá cuộn nền, aria-labelledby /
 *   aria-describedby theo DialogTitle / DialogDescription.
 * - Focus khi mở: Radix focus phần tử focus được ĐẦU TIÊN (thường là ô nhập). README artifact muốn focus nút AN TOÀN
 *   (Huỷ) → đặt `autoFocus` lên nút đó (React focus nó lúc mount, FocusScope của Radix giữ nguyên).
 * - Nút ✕ (`showClose`, mặc định bật) nằm CUỐI hộp trong DOM như preview → Tab đi thân → footer → ✕.
 * - Không có trạng thái đang chạy / lỗi trong hộp: đó là ConfirmDialog.
 */
export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlay} />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn(panel, className)} {...props}>
        {children}
        {showClose && (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Đóng" className={closeBtn}>
              <X aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(title, className)} {...props} />
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn(desc, className)} {...props} />
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cn(body, className)} {...props} />
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn(footer, className)} {...props} />
}
