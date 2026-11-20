'use client'

import type { ComponentProps } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'

/**
 * Popover — khung shadcn (Radix Popover) dùng chung cho Combobox, DatePicker, DateRangePicker. Chỉ là khung: không tự
 * mang hình — người gọi thêm class (vd `menuContent` của menu-styles.ts, hay khung lịch).
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô (trước mount / ngoài DsRoot) thì không render nội dung —
 *   ra document.body là mất token DS.
 * - z-90 = lớp menu trong thang z của ds/NGUON.md (`.b-noi`) → mở được BÊN TRONG Dialog/Sheet (70).
 * - Esc / bấm ngoài đóng, focus về trigger (Radix). Esc trong pop chỉ đóng pop: Radix DismissableLayer xử lý lớp trên
 *   cùng trước, Dialog bao ngoài không nhận.
 */
export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        // 8px mỗi mép như menu: khổ 390 pop không dính mép khung nhìn.
        collisionPadding={collisionPadding}
        className={cn('z-90 outline-none', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
