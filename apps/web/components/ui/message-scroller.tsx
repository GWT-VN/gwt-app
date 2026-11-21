// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from '@shadcn/react/message-scroller'
import { ArrowDown } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * MessageScroller — khung cuộn danh sách tin chat trên `@shadcn/react` 0.3.1 (không phải Radix: shadcn tự viết
 * primitive): mở ra ở cuối, giữ vị trí khi nạp thêm tin cũ phía trên, tự bám đáy khi `autoScroll`, nút "Cuộn xuống
 * cuối" chỉ hiện khi đã cuộn lên. Viewport `role="region"` focus được (cuộn bằng phím), Content `role="log"`.
 *
 * Gán token DS:
 * - `scroll-fade-b` của shadcn là utility trong gói CSS riêng của shadcn, DS không có → bỏ (không mờ đáy).
 * - Thanh cuộn mảnh màu alpha-30 như ScrollArea/Combobox; vòng focus viewport outline 2 `ring` lùi vào 2px (vùng cuộn cắt
 *   outline ngoài), y ScrollArea.
 * - Tên vùng mặc định "Tin nhắn" (primitive mặc định "Messages"); nút đọc "Cuộn xuống cuối" / "Cuộn lên đầu".
 * - Nút = Button DS `secondary` `icon-sm` (28) nhưng nền `background` + bóng `--shadow-200` + viền mảnh như shadcn
 *   (nút nổi trên tin) — hover nền muted.
 */

function MessageScrollerProvider(props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

function MessageScroller({ className, ...props }: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      className={cn('group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden', className)}
      {...props}
    />
  )
}

function MessageScrollerViewport({
  className,
  'aria-label': ariaLabel = 'Tin nhắn',
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>) {
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      aria-label={ariaLabel}
      className={cn(
        'size-full min-h-0 min-w-0 scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-none data-pending-scroll:invisible',
        '[scrollbar-color:var(--alpha-30)_transparent]',
        '[outline:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
        className,
      )}
      {...props}
    />
  )
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<typeof MessageScrollerPrimitive.Content>) {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      className={cn('flex h-max min-h-full flex-col gap-8', className)}
      {...props}
    />
  )
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      className={cn('min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]', className)}
      {...props}
    />
  )
}

function MessageScrollerButton({
  direction = 'end',
  className,
  children,
  render,
  variant = 'secondary',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      direction={direction}
      className={cn(
        'absolute inset-s-1/2 -translate-x-1/2 bg-background text-foreground [box-shadow:var(--shadow-200),var(--shadow-hairline)] not-disabled:not-aria-disabled:hover:bg-muted hover:text-foreground',
        'transition-[translate,scale,opacity,background-color] duration-200 data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180',
        'motion-reduce:transition-none',
        className,
      )}
      render={render ?? <Button variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDown />
          <span className="sr-only">{direction === 'end' ? 'Cuộn xuống cuối' : 'Cuộn lên đầu'}</span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
