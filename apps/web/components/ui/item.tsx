// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Separator } from './separator'

/**
 * Item — một dòng nội dung: ô media (icon/ảnh), tiêu đề + mô tả, thao tác bên phải (thông báo, tệp, cài đặt, thành
 * viên). `asChild` với `<a>` → cả dòng là link, rê sáng nền `accent` (ghost hover).
 * Token (artifact chưa có Item): chữ 14/20, tiêu đề medium, mô tả `muted-foreground` tối đa 2 dòng; bo radius-md; viền
 * 1px trong suốt (variant `outline` → `--border`, không nhảy cỡ); ô icon như `.ui-file-thumb` (32, radius-md, nền `muted`,
 * icon 16 `muted-foreground`, không viền); ảnh 40 radius-md. Focus phím: outline 2 `ring` offset 2 (luật DS).
 * `ItemGroup` tự thêm role listitem cho các Item. Dòng asChild dùng phần tử bọc để giữ vai trò của link/nút.
 */
const TrongNhom = React.createContext(false)

function ItemGroup({ className, role = 'list', children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role={role}
      data-slot="item-group"
      className={cn('group/item-group flex flex-col border-none border-current', className)}
      {...props}
    >
      <TrongNhom.Provider value={role === 'list'}>{children}</TrongNhom.Provider>
    </div>
  )
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn('my-0', className)} {...props} />
}

const itemVariants = cva(
  [
    'group/item flex flex-wrap items-center rounded-(--radius-md) border border-solid border-transparent text-[14px] leading-[20px]',
    'transition-colors duration-100',
    '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
    '[a]:transition-colors [a]:hover:bg-accent',
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-(--border)',
        muted: 'bg-muted/50',
      },
      size: {
        default: 'gap-4 p-4',
        sm: 'gap-2.5 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  role,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'
  const laMuc = React.useContext(TrongNhom) && role === undefined
  const noiDung = (
    <Comp
      role={role ?? (laMuc && !asChild ? 'listitem' : undefined)}
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
  return laMuc && asChild ? <div role="listitem">{noiDung}</div> : noiDung
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 border-none border-current group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-(--control-size-md) rounded-(--radius-md) bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        image: 'size-10 overflow-hidden rounded-(--radius-md) [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn('flex flex-1 flex-col gap-1 border-none border-current [&+[data-slot=item-content]]:flex-none', className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 border-none border-current text-[14px] leading-[20px] font-medium',
        className,
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'm-0 line-clamp-2 border-none border-current text-[14px] leading-[20px] font-normal text-balance text-muted-foreground',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2 border-none border-current', className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn('flex basis-full items-center justify-between gap-2 border-none border-current', className)}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn('flex basis-full items-center justify-between gap-2 border-none border-current', className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
