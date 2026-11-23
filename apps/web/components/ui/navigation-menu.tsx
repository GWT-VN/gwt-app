// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cva } from 'class-variance-authority'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { menuContent } from './menu-styles'

/**
 * NavigationMenu — khung shadcn (Radix NavigationMenu): thanh link ngang có mục mở bảng con (mega menu). Artifact chưa có
 * → gán token theo các phần DS gần nhất:
 * - Trigger / link đơn: như Button ghost cao 36 (`navigationMenuTriggerStyle`), rê / đang mở nền `accent`.
 * - Bảng con (`NavigationMenuViewport`, hoặc chính Content khi `viewport={false}`): khung menu DS (`menuContent`: bo xl,
 *   nền popover, bóng + hairline, z 90 thang menu), cách trigger 6.
 * - Link trong bảng: như mục menu DS (bo 6, đệm 8, rê nền alpha-08 / tối alpha-10); `active` (trang đang mở) alpha-05.
 * - Khổ < 768 (shadcn: bảng con rộng hết gốc): ô bọc viewport thêm `max-md:w-full` — bản shadcn ô bọc co theo nội dung
 *   nên bảng con tràn mép phải điện thoại (đo 390: tràn 3px).
 * - Không chép class `animate-*`/`slide-*`/`zoom-*` của shadcn: DS chưa cài tw-animate-css, menu DS không có hiệu ứng.
 * - Focus: outline 2 ring (không chép `outline-none` + ring của shadcn — Tailwind 4 mất vòng focus, NGUON).
 * File không 'use client' như shadcn (Radix tự khai client) → `navigationMenuTriggerStyle` gọi được từ server.
 * App GWT điều hướng chính bằng Sidebar; NavigationMenu dành cho trang nội dung (wiki, hướng dẫn) cần menu ngang.
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center border-none border-current',
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('group m-0 flex flex-1 list-none items-center justify-center gap-1 p-0 border-none border-current', className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative border-none border-current', className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  [
    'group inline-flex h-(--control-size-lg) w-max cursor-pointer items-center justify-center rounded-(--radius-md) px-4',
    'border-none border-current bg-background text-[14px] leading-none font-medium text-foreground no-underline',
    'transition-[background-color,color] duration-150 ease-[ease]',
    'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
    'focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
  ].join(' '),
)

function NavigationMenuTrigger({ className, children, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), 'group', className)}
      {...props}
    >
      {children}{' '}
      <CaretDown
        className="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

/** Bảng con khi KHÔNG dùng viewport chung: tự mang khung menu DS, ngay dưới trigger cách 6. */
const contentRieng = cn(
  'group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5',
  'group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-(--radius-xl)',
  'group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground',
  'group-data-[viewport=false]/navigation-menu:z-90',
  'group-data-[viewport=false]/navigation-menu:[box-shadow:var(--shadow),var(--shadow-hairline)]',
)

function NavigationMenuContent({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn('top-0 left-0 w-full border-none border-current p-2 pr-2.5 md:absolute md:w-auto', contentRieng, className)}
      {...props}
    />
  )
}

function NavigationMenuViewport({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-90 flex justify-center border-none border-current max-md:w-full">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          menuContent,
          'relative mt-1.5 h-(--radix-navigation-menu-viewport-height) max-h-none w-full min-w-0 origin-top overflow-hidden p-0',
          'md:w-(--radix-navigation-menu-viewport-width)',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        'flex flex-col gap-1 rounded-[6px] p-2 border-none border-current text-[14px] leading-5 text-inherit no-underline [outline:none]',
        '[--menu-item-bg:var(--alpha-08)] in-data-[theme=dark]:[--menu-item-bg:var(--alpha-10)]',
        'hover:bg-(--menu-item-bg) focus:bg-(--menu-item-bg)',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(--ring)',
        'data-[active=true]:bg-(--alpha-05) data-[active=true]:hover:bg-(--menu-item-bg)',
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({ className, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn('top-full z-1 flex h-1.5 items-end justify-center overflow-hidden border-none border-current', className)}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-(--radius-xs) border-none border-current bg-(--border) [box-shadow:var(--shadow-200)]" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
