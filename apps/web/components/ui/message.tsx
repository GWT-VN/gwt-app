// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Message — một lượt nói trong khung chat (ảnh đại diện + nội dung + đầu/chân dòng). Nội dung thường là `Bubble`
 * (bubble.tsx); `align="end"` = tin của mình (đảo hàng, nội dung dạt phải). Cuộn danh sách tin: `MessageScroller`.
 * File thường (không 'use client') như shadcn — khối server gọi được.
 *
 * Gán token DS: chữ 14/20 (text-sm trùng DS); đầu/chân 12/18 (text-xs của DS, Tailwind mặc định 12/16), màu
 * muted-foreground; ảnh đại diện bo `--radius-full` (Tailwind 4 `rounded-full` ra calc(infinity)), nền muted.
 */

function MessageGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="message-group" className={cn('flex min-w-0 flex-col gap-2', className)} {...props} />
}

function Message({ className, align = 'start', ...props }: React.ComponentProps<'div'> & { align?: 'start' | 'end' }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        'group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse',
        className,
      )}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        'flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-(--radius-full) bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8',
        className,
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        'flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end',
        className,
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        'flex max-w-full min-w-0 items-center px-3 text-[12px] leading-[18px] font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0',
        className,
      )}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        'flex max-w-full min-w-0 items-center px-3 text-[12px] leading-[18px] font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end',
        className,
      )}
      {...props}
    />
  )
}

export { MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader }
