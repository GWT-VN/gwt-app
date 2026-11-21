// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { DotsThree } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import {
  breadcrumbEllipsis,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from './detail-styles'

/**
 * Breadcrumb — khung shadcn (Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage,
 * BreadcrumbSeparator, BreadcrumbEllipsis), giá trị từ `.ui-breadcrumb` của ds/nguon/bundle.css (README Breadcrumb).
 * - `<nav aria-label="Đường dẫn">`. Dấu "/" mặc định vẽ bằng ::before của mục đứng ngay sau mục (như artifact) → không
 *   nằm trong DOM, trình đọc màn hình không đọc. `BreadcrumbSeparator` (shadcn, `li` aria-hidden, mặc định "/") dùng
 *   khi cần dấu khác/icon — mục sau nó không vẽ ::before nữa.
 * - Mục cuối `BreadcrumbPage`: span `aria-current="page"`, KHÔNG phải liên kết (bỏ `role="link"` + `aria-disabled` của
 *   shadcn — README: "mục cuối không phải liên kết").
 * - `BreadcrumbLink asChild` cho `next/link`.
 */
function Breadcrumb({ 'aria-label': nhan = 'Đường dẫn', ...props }: ComponentProps<'nav'>) {
  return <nav data-slot="breadcrumb" aria-label={nhan} {...props} />
}

function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return <ol data-slot="breadcrumb-list" className={cn(breadcrumbList, className)} {...props} />
}

function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn(breadcrumbItem, className)} {...props} />
}

function BreadcrumbLink({ asChild, className, ...props }: ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a'
  return <Comp data-slot="breadcrumb-link" className={cn(breadcrumbLink, className)} {...props} />
}

function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return <span data-slot="breadcrumb-page" aria-current="page" className={cn(breadcrumbPage, className)} {...props} />
}

function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(breadcrumbSeparator, className)}
      {...props}
    >
      {children ?? '/'}
    </li>
  )
}

/** Thu gọn mục giữa (shadcn): "…" + chữ ẩn "Thêm" cho trình đọc khi bọc trong nút mở menu. */
function BreadcrumbEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(breadcrumbEllipsis, className)}
      {...props}
    >
      <DotsThree weight="bold" />
      <span className="sr-only">Thêm</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
