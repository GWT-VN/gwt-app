// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * Attachment — thẻ một tệp/ảnh đính kèm: ô media (icon/ảnh), tên + phụ (loại · cỡ · trạng thái), thao tác (bỏ, thử
 * lại), trạng thái tải `idle` | `uploading` | `processing` | `error` | `done` (`data-state`). Dùng cho tệp đính kèm
 * ticket / Composer / tin nhắn; `AttachmentGroup` xếp nhiều thẻ thành hàng cuộn ngang có snap.
 * Token = dòng tệp `.ui-file*` của ds/nguon/bundle.css (FileUpload): bo radius-lg, viền inset 1px alpha-08 (lỗi red-500),
 * đệm 8, gap 12; ô media 32 radius-md nền `muted` icon `muted-foreground`; tên 14/20 cắt "…"; phụ 12/18
 * `color-text-tertiary` số đều (lỗi `color-text-danger`). `idle` (chưa tải) = viền gạch alpha-25 như ô thả `.ui-drop`.
 * Rê thẻ có `AttachmentTrigger` → nền alpha-02 (như `.ui-drop:hover`); trigger focus phím → outline 2 `ring` offset 2
 * trên cả thẻ. sm/xs: chữ 12/18, ô media 28 / 24.
 * Không chép (cần utility của gói `shadcn/tailwind.css` mà DS không nạp): chữ `shimmer` khi uploading/processing → đặt
 * `Progress` dưới tên + % trong phụ; mép mờ `scroll-fade-x` của nhóm.
 * a11y: nút icon `AttachmentAction` luôn có `aria-label` gồm tên tệp ("Bỏ bao-gia.pdf"); `AttachmentTrigger` không có
 * chữ → `aria-label` ("Xem bao-gia.pdf"); lỗi phải ghi lý do bằng chữ trong `AttachmentDescription`, không chỉ đổi màu.
 * File thường (không 'use client'): khối /ds server dùng được.
 */
const attachmentVariants = cva(
  [
    'group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-(--radius-lg) border-none border-current',
    'bg-card text-card-foreground [box-shadow:inset_0_0_0_1px_var(--alpha-08)] transition-colors duration-150 ease-[ease]',
    'has-[>a,>button]:hover:bg-(--alpha-02)',
    'has-[>[data-slot=attachment-trigger]:focus-visible]:outline-2 has-[>[data-slot=attachment-trigger]:focus-visible]:outline-offset-2',
    'has-[>[data-slot=attachment-trigger]:focus-visible]:outline-solid has-[>[data-slot=attachment-trigger]:focus-visible]:outline-ring',
    'data-[state=error]:[box-shadow:inset_0_0_0_1px_var(--red-500)]',
    'data-[state=idle]:[box-shadow:none] data-[state=idle]:outline-1 data-[state=idle]:-outline-offset-1 data-[state=idle]:outline-dashed data-[state=idle]:outline-(--alpha-25)',
  ],
  {
    variants: {
      size: {
        default: 'gap-3 p-2 text-[14px] leading-[20px]',
        sm: 'gap-2.5 text-[12px] leading-[18px] has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5',
        xs: 'gap-1.5 rounded-(--radius-md) text-[12px] leading-[18px] has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1',
      },
      orientation: {
        horizontal: 'min-w-40 items-center',
        vertical: 'w-24 flex-col has-data-[slot=attachment-content]:w-30',
      },
    },
  },
)

function Attachment({
  className,
  state = 'done',
  size = 'default',
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof attachmentVariants> & {
    state?: 'idle' | 'uploading' | 'processing' | 'error' | 'done'
  }) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    />
  )
}

const attachmentMediaVariants = cva(
  [
    'relative flex aspect-square w-(--control-size-md) shrink-0 items-center justify-center overflow-hidden rounded-(--radius-md) border-none border-current bg-muted text-muted-foreground',
    'group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-(--control-size-sm)',
    'group-data-[size=xs]/attachment:w-(--control-size-2xs) group-data-[size=xs]/attachment:rounded-(--radius-sm)',
    'group-data-[state=error]/attachment:bg-(--color-background-danger-soft-alpha) group-data-[state=error]/attachment:text-(--color-text-danger)',
    'group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none',
    "[&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  ],
  {
    variants: {
      variant: {
        icon: '',
        image:
          'opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'icon',
    },
  },
)

function AttachmentMedia({
  className,
  variant = 'icon',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof attachmentMediaVariants>) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(attachmentMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

function AttachmentContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-content"
      className={cn(
        'max-w-full min-w-0 flex-1 border-none border-current group-data-[orientation=vertical]/attachment:px-1',
        className,
      )}
      {...props}
    />
  )
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="attachment-title"
      className={cn('block max-w-full min-w-0 truncate border-none border-current', className)}
      {...props}
    />
  )
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="attachment-description"
      className={cn(
        'block min-w-0 truncate border-none border-current text-[12px] leading-[18px] text-(--color-text-tertiary) tabular-nums',
        'group-data-[state=error]/attachment:text-(--color-text-danger)',
        'max-w-full',
        className,
      )}
      {...props}
    />
  )
}

function AttachmentActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn(
        'relative z-20 flex shrink-0 items-center border-none border-current group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1',
        className,
      )}
      {...props}
    />
  )
}

function AttachmentAction({ className, variant, size = 'icon-xs', ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="attachment-action"
      variant={variant ?? 'ghost'}
      size={size}
      className={cn(className)}
      {...props}
    />
  )
}

function AttachmentTrigger({
  className,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="attachment-trigger"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(
        'absolute inset-0 z-10 cursor-pointer rounded-[inherit] border-none border-current bg-transparent p-0 outline-none',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Hàng thẻ cuộn ngang có snap; thanh cuộn ẩn (như Kanban). GWT thêm đệm ngang 4 + lề âm: vùng `overflow-x:auto` cắt
 * outline focus (2 + offset 2) của thẻ đầu/cuối. Hàng chỉ để xem (thẻ không có nút) → tự thêm `tabIndex={0}`,
 * `role="group"`, `aria-label` để cuộn được bằng phím.
 */
function AttachmentGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        '-mx-1 flex min-w-0 snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain border-none border-current px-1 py-1',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start',
        className,
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
}
