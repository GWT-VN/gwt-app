// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { empty, emptyActions, emptyDesc, emptyHeader, emptyMedia, emptyMediaIcon, emptyTitle } from './feedback-styles'

/**
 * Empty — khung shadcn (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent), giá trị từ `.ui-empty*`
 * của ds/nguon/bundle.css (chuỗi class ở `feedback-styles.ts`). Mẫu ghép GWT 4 lý do trống: `EmptyState` (empty-state.tsx).
 * - Lệch có chủ đích so với shadcn: không viền đứt/bo (artifact không có), không `text-balance` (đổi chỗ xuống dòng so với
 *   artifact), đệm 40/16 (`data-size="sm"`: 24/16) thay p-6/md:p-12; EmptyContent là hàng nút cách 8 như `.ui-empty-actions`
 *   (shadcn cột cách 16).
 * - Phần GWT thêm: `EmptyTitle asChild` để dùng thẻ heading thật (h2–h6).
 */
function Empty({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="empty" className={cn(empty, className)} {...props} />
}

function EmptyHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="empty-header" className={cn(emptyHeader, className)} {...props} />
}

const emptyMediaVariants = cva(emptyMedia, {
  variants: {
    variant: {
      default: 'bg-transparent',
      icon: emptyMediaIcon,
    },
  },
  defaultVariants: { variant: 'default' },
})

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, asChild = false, ...props }: ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp data-slot="empty-title" className={cn(emptyTitle, className)} {...props} />
}

function EmptyDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p data-slot="empty-description" className={cn(emptyDesc, className)} {...props} />
}

function EmptyContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="empty-content" className={cn(emptyActions, className)} {...props} />
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
