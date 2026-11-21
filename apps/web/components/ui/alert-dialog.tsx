// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { body, desc, footer, footerSm, header, media, overlay, panel, panelSm, title } from './dialog-styles'
import { useNutMo } from './use-nut-mo'

/**
 * AlertDialog — khung shadcn new-york-v4 (Radix AlertDialog): đủ 12 export, `data-slot`, `size` (default/sm) của Content,
 * `variant`/`size` của Action/Cancel (Action mặc định Button `default`, Cancel `outline`) như shadcn; cùng kiểu với Dialog
 * qua dialog-styles.ts. Khác Dialog:
 * - role="alertdialog"; bấm overlay KHÔNG đóng (Radix chặn); không nút ✕ — chỉ đóng bằng Huỷ / Esc / hành động.
 * - Mở: Radix focus `AlertDialogCancel` (nút an toàn). Muốn khác → `data-autofocus` trên phần tử con, hoặc
 *   `onOpenAutoFocus` (ConfirmDialog làm việc này). Đóng: focus về phần tử đã mở hộp (use-nut-mo.ts, như Dialog).
 * - `AlertDialogAction` ĐÓNG hộp ngay khi bấm (Radix Close) — việc chạy bất đồng bộ dùng nút thường + ConfirmDialog.
 * - Luôn có `AlertDialogTitle` (thiếu → hộp không có tên đọc được). Mô tả tuỳ chọn: Radix 1.3 chỉ gắn aria-describedby
 *   khi có `AlertDialogDescription`.
 * Phần GWT cộng thêm: `AlertDialogBody` (`.ui-dialog-body`); Portal mặc định vào ô DsRoot (chưa có ô → không render);
 * z-70 theo thang z; Header căn trái mọi khổ như artifact (shadcn căn giữa trên điện thoại / cỡ sm); Media mang giá trị
 * `.ui-dialog-icon`. Không có chuyển động zoom/fade của shadcn — dùng `ui-dialog-len` của artifact.
 * Màn nghiệp vụ dùng ConfirmDialog; primitive này cho trường hợp ConfirmDialog không vừa.
 */
function AlertDialog(props: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

/** shadcn: Portal trần. DS: mặc định vào ô portal của DsRoot; chưa có ô → không render. */
function AlertDialogPortal({ container, ...props }: ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" container={dich} {...props} />
}

function AlertDialogOverlay({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn(overlay, className)} {...props} />
}

function AlertDialogContent({
  className,
  size = 'default',
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content> & { size?: 'default' | 'sm' }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPanel
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn('group/alert-dialog-content', panel, panelSm, className)}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/** Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. */
function AlertDialogPanel(props: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return <AlertDialogPrimitive.Content {...props} {...useNutMo(props)} />
}

function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-header" className={cn(header, className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-footer" className={cn(footer, footerSm, className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn(title, className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn(desc, className)} {...props} />
  )
}

/** Icon đầu hộp (trang trí → bên gọi đặt `aria-hidden`). */
function AlertDialogMedia({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-media" className={cn(media, className)} {...props} />
}

/** Phần GWT: `.ui-dialog-body` — thân hộp (danh sách hậu quả, ô lý do…), cách phần trên 16. */
function AlertDialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-body" className={cn(body, className)} {...props} />
}

type NutProps = Pick<ComponentProps<typeof Button>, 'variant' | 'size'>

function AlertDialogAction({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action> & NutProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(className)} {...props} />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Cancel> & NutProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(className)} {...props} />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
