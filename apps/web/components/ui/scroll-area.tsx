// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * ScrollArea — vùng cuộn có thanh cuộn tự vẽ, giống nhau trên mọi hệ điều hành (Radix ScrollArea: cuộn vẫn là cuộn gốc
 * của trình duyệt — bánh xe, chạm, phím). Đặt chiều cao/rộng ở `className` của Root.
 * Token: thanh dày 10 (shadcn `w-2.5`, đệm 1px + viền trong suốt 1px phía nội dung → con chạy 7), con chạy bo tròn
 * màu alpha-30 — cùng màu `scrollbar-color` của danh sách Combobox. Viewport nhận focus phím (cuộn bằng ↑/↓) → outline 2 `ring` lùi vào trong 2px (vùng cuộn cắt outline
 * bên ngoài). Cuộn ngang: thêm `<ScrollBar orientation="horizontal" />` trong Root.
 */
function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative border-none border-current', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          'size-full rounded-[inherit] border-none border-current',
          '[outline:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-(--radius-full) border-none border-current bg-(--alpha-30)"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
