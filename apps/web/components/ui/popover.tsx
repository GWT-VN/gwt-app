// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { menuContent } from './menu-styles'

/**
 * Popover — khung shadcn new-york-v4 (Radix Popover): đủ 7 phần, cùng tên, cùng `data-slot`. Đổi bắt buộc: Portal vào ô
 * của DsRoot (`useDsPortal`; chưa có ô thì không render — ra document.body là mất token DS); class shadcn → token mặt
 * nổi `.ui-menu` / `.b-noi` (menuContent: nền popover, bo radius-xl, shadow + hairline, chữ 14/20, trần cao 420 + cuộn);
 * giữ `w-72` + `p-4` của shadcn; z-90 (thang NGUON, lớp menu → mở được BÊN TRONG Dialog/Sheet 70); không animation
 * (artifact không có).
 *
 * Phần GWT (lệch shadcn có chủ đích):
 * - `align` mặc định `start` (shadcn `center`): pop chọn của DS (Combobox, DatePicker, DateRangePicker…) căn mép trái
 *   trigger như artifact. `collisionPadding` 8 như menu: khổ 390 pop không dính mép khung nhìn.
 * - Người gọi có khung riêng (`calendarPop`, `cdKhung`, `svKhung`…) truyền `className` — `cn` đè đúng phần trùng; khung
 *   không tự đặt rộng thì thêm `w-auto` để bỏ `w-72`.
 * - Esc / bấm ngoài đóng, focus về trigger (Radix). Esc trong pop chỉ đóng pop: Radix DismissableLayer xử lý lớp trên
 *   cùng trước, Dialog bao ngoài không nhận.
 */
function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  // Dùng nội tuyến khi màn cũ chưa có DsRoot.
  noiTuyen = false,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content> & { noiTuyen?: boolean }) {
  const container = useDsPortal()
  if (!container && !noiTuyen) return null
  const noiDung = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(menuContent, 'w-72 p-4', className)}
      {...props}
    />
  )
  return noiTuyen ? noiDung : <PopoverPrimitive.Portal container={container}>{noiDung}</PopoverPrimitive.Portal>
}

function PopoverAnchor({ ...props }: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

/** shadcn `flex flex-col gap-1 text-sm` → cột cách 4, chữ 14/20. */
function PopoverHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-1 border-none border-current text-[14px] leading-[20px]', className)}
      {...props}
    />
  )
}

/** shadcn `font-medium` (500). Là div như shadcn, không phải heading — cần tên hộp thì `aria-labelledby` trỏ vào nó. */
function PopoverTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <div data-slot="popover-title" className={cn('border-none border-current font-medium', className)} {...props} />
  )
}

/** shadcn `text-muted-foreground`. */
function PopoverDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="popover-description"
      className={cn('m-0 border-none border-current text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription }
