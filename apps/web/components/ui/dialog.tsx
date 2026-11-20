'use client'

import type { ComponentProps } from 'react'
import { X } from '@phosphor-icons/react/ssr'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { body, closeBtn, desc, footer, overlay, panel, title } from './dialog-styles'
import { useNutMo } from './use-nut-mo'

/**
 * Dialog — khung shadcn (Radix Dialog), giá trị từ `.ui-overlay` / `.ui-dialog*` của ds/nguon/bundle.css qua
 * dialog-styles.ts.
 * - Overlay + hộp portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render gì (ra document.body là mất token).
 * - Radix lo: bẫy Tab trong hộp, Esc / bấm overlay đóng, khoá cuộn nền, aria-labelledby / aria-describedby theo
 *   DialogTitle / DialogDescription.
 * - Focus khi mở: Radix focus phần tử focus được ĐẦU TIÊN (thường là ô nhập). README artifact muốn focus nút AN TOÀN
 *   (Huỷ) → đặt `data-autofocus` lên nút đó (use-nut-mo.ts, qua onOpenAutoFocus của Radix). `autoFocus` của React cũng
 *   chạy nhưng Radix bỏ qua onOpenAutoFocus khi focus đã nằm trong hộp — dùng `data-autofocus` cho thống nhất.
 * - Focus khi đóng: về phần tử đã MỞ hộp (use-nut-mo.ts) — cả khi điều khiển bằng `open` không có DialogTrigger, mở từ
 *   mục menu (về nút/dòng đã mở menu), hay mount sẵn mở; phần tử đó đã mất thì để Radix lo (Trigger nếu có).
 * - LUÔN có `DialogTitle` (thiếu → hộp không có aria-labelledby, trình đọc màn hình không đọc được tên hộp).
 *   `DialogDescription` tuỳ chọn: Radix Dialog 1.3 (gói radix-ui 1.8) chỉ gắn aria-describedby khi có Description và
 *   không còn cảnh báo dev → KHÔNG cần `aria-describedby={undefined}` như shadcn dặn cho bản Radix cũ (đã đọc mã
 *   node_modules/@radix-ui/react-dialog 1.3.1: không có console.warn nào).
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
      <DialogPanel data-slot="dialog-content" className={cn(panel, className)} {...props}>
        {children}
        {showClose && (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Đóng" className={closeBtn}>
              <X aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPanel>
    </DialogPrimitive.Portal>
  )
}

/** Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. */
function DialogPanel(props: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Content {...props} {...useNutMo(props)} />
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
