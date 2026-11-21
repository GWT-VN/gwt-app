// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { X } from '@phosphor-icons/react/ssr'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { body, chuaNutDong, closeBtn, desc, footer, header, overlay, panel, title } from './dialog-styles'
import { useNutMo } from './use-nut-mo'

/**
 * Dialog — khung shadcn new-york-v4 (Radix Dialog): đủ 10 export, `data-slot`, prop `showCloseButton` như shadcn; giá
 * trị từ `.ui-overlay` / `.ui-dialog*` của ds/nguon/bundle.css qua dialog-styles.ts.
 * Phần GWT cộng thêm (shadcn không có):
 * - `DialogBody` (`.ui-dialog-body`, cách phần trên 16).
 * - `DialogPortal` tự lấy ô portal của DsRoot (`useDsPortal`); chưa có ô thì không render gì (ra document.body là mất
 *   token).
 * - Focus khi mở: Radix focus phần tử focus được ĐẦU TIÊN (thường là ô nhập). README artifact muốn focus nút AN TOÀN
 *   (Huỷ) → đặt `data-autofocus` lên nút đó (use-nut-mo.ts, qua onOpenAutoFocus của Radix). `autoFocus` của React cũng
 *   chạy nhưng Radix bỏ qua onOpenAutoFocus khi focus đã nằm trong hộp — dùng `data-autofocus` cho thống nhất.
 * - Focus khi đóng: về phần tử đã MỞ hộp (use-nut-mo.ts) — cả khi điều khiển bằng `open` không có DialogTrigger, mở từ
 *   mục menu (về nút/dòng đã mở menu), hay mount sẵn mở; phần tử đó đã mất thì để Radix lo (Trigger nếu có).
 * - Nút ✕ = Button ghost icon-sm `aria-label="Đóng"` (shadcn: nút trần + chữ sr-only "Close"), góc trên phải cách 19;
 *   có ✕ thì tiêu đề chừa lề phải 36 (`chuaNutDong`) để chữ dài xuống dòng thay vì chạy dưới ✕.
 * - z-70 theo thang z (ds/NGUON.md); không có chuyển động zoom/fade của shadcn — dùng `ui-dialog-len` của artifact.
 * Radix lo: bẫy Tab trong hộp, Esc / bấm overlay đóng (Esc đã preventDefault), khoá cuộn nền, aria-labelledby /
 * aria-describedby theo DialogTitle / DialogDescription.
 * - LUÔN có `DialogTitle` (thiếu → hộp không có aria-labelledby, trình đọc màn hình không đọc được tên hộp).
 *   `DialogDescription` tuỳ chọn: Radix Dialog 1.3 (gói radix-ui 1.8) chỉ gắn aria-describedby khi có Description và
 *   không còn cảnh báo dev → KHÔNG cần `aria-describedby={undefined}` như shadcn dặn cho bản Radix cũ.
 * - Nút ✕ (`showCloseButton`, mặc định bật) nằm CUỐI hộp trong DOM như shadcn và preview → Tab đi thân → footer → ✕.
 * - Không có trạng thái đang chạy / lỗi trong hộp: đó là ConfirmDialog.
 */
function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/** shadcn: Portal trần. DS: mặc định vào ô portal của DsRoot; chưa có ô → không render. */
function DialogPortal({ container, ...props }: ComponentProps<typeof DialogPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <DialogPrimitive.Portal data-slot="dialog-portal" container={dich} {...props} />
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn(overlay, className)} {...props} />
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPanel
        data-slot="dialog-content"
        className={cn(panel, showCloseButton && chuaNutDong, className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Đóng" className={closeBtn}>
              <X aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPanel>
    </DialogPortal>
  )
}

/** Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. */
function DialogPanel(props: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Content {...props} {...useNutMo(props)} />
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn(header, className)} {...props} />
}

/** shadcn: `showCloseButton` thêm nút outline "Đóng" cuối footer (mặc định tắt). */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: ComponentProps<'div'> & { showCloseButton?: boolean }) {
  return (
    <div data-slot="dialog-footer" className={cn(footer, className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Đóng</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(title, className)} {...props} />
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn(desc, className)} {...props} />
}

/** Phần GWT: `.ui-dialog-body` — thân hộp, cách phần trên 16. */
function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cn(body, className)} {...props} />
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
