import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { breadcrumbItem, breadcrumbLink, breadcrumbList, breadcrumbPage } from './detail-styles'

/**
 * Breadcrumb — khung shadcn (Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage), giá trị từ
 * `.ui-breadcrumb` của ds/nguon/bundle.css (README Breadcrumb).
 * - `<nav aria-label="Đường dẫn">`; dấu "/" vẽ bằng ::before của mục thứ hai trở đi → không có `BreadcrumbSeparator`
 *   (shadcn có) và trình đọc màn hình không đọc "/".
 * - Mục cuối `BreadcrumbPage`: span `aria-current="page"`, KHÔNG phải liên kết (bỏ `role="link"` + `aria-disabled` của
 *   shadcn — README: "mục cuối không phải liên kết").
 * - `BreadcrumbLink asChild` cho `next/link`.
 */
export function Breadcrumb({ 'aria-label': nhan = 'Đường dẫn', ...props }: ComponentProps<'nav'>) {
  return <nav data-slot="breadcrumb" aria-label={nhan} {...props} />
}

export function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return <ol data-slot="breadcrumb-list" className={cn(breadcrumbList, className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn(breadcrumbItem, className)} {...props} />
}

export function BreadcrumbLink({ asChild, className, ...props }: ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'a'
  return <Comp data-slot="breadcrumb-link" className={cn(breadcrumbLink, className)} {...props} />
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return <span data-slot="breadcrumb-page" aria-current="page" className={cn(breadcrumbPage, className)} {...props} />
}
