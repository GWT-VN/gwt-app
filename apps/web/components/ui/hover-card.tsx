// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import { HoverCard as HoverCardPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { menuContent } from './menu-styles'

/**
 * HoverCard — khung shadcn new-york-v4 (Radix HoverCard): 3 phần, cùng tên, cùng `data-slot`. Chưa có trong artifact.
 * Đổi bắt buộc: Portal vào ô của DsRoot (`useDsPortal`; chưa có ô thì không render); class shadcn → token mặt nổi như
 * Popover (menuContent: nền popover, bo radius-xl, shadow + hairline, chữ 14/20), giữ `w-64` + `p-4` của shadcn; z-90
 * (lớp pop, thang NGUON); không animation (artifact không có pop nào có animation).
 *
 * Dùng cho XEM NHANH (rê chuột vào mã khách/mã đơn → thẻ tóm tắt). Radix: thẻ bị trình đọc màn hình bỏ qua và không vào
 * được bằng Tab → chỉ chứa thông tin THÊM; trigger phải là link/nút tự đứng được (bấm vào là tới trang chi tiết). Cần
 * thao tác trong thẻ → dùng Popover.
 */
function HoverCard({ ...props }: ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal" container={container}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        // 8px mỗi mép như menu/Popover: khổ 390 thẻ không dính mép khung nhìn.
        collisionPadding={collisionPadding}
        className={cn(menuContent, 'w-64 p-4', className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
