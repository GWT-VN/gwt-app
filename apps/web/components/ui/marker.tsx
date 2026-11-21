// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Marker — dòng mốc nhỏ chen giữa luồng tin chat: mốc ngày ("Hôm nay"), sự kiện hệ thống ("An đã thêm Bình vào
 * nhóm"), trạng thái ("Đang suy nghĩ…"). Ba vẻ: `default` (icon + chữ), `separator` (chữ giữa hai vạch),
 * `border` (gạch chân). File thường như shadcn.
 *
 * Gán token DS: chữ 14/20 muted-foreground (link trong mốc gạch chân, rê → foreground); icon 16 (control-icon-size-sm);
 * vạch và gạch chân màu `border` (alpha-10 sáng / alpha-12 tối). Pseudo vạch tắt viền preflight như phần tử thường.
 */
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: '',
        separator:
          'before:mr-1 before:h-px before:min-w-0 before:flex-1 before:border-none before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:border-none after:bg-border',
        border: 'border-b border-border pb-2',
      },
    },
  },
)

function Marker({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof markerVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp data-slot="marker" data-variant={variant} className={cn(markerVariants({ variant, className }))} {...props} />
  )
}

function MarkerIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        'min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }
