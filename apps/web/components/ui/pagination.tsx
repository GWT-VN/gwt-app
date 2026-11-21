// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import * as React from 'react'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import type { Button } from './button'
import { buttonVariants } from './button-variants'

/**
 * Pagination (shadcn) — dãy số trang dạng link: trang đang xem là nút `outline` + `aria-current="page"`, trang khác
 * `ghost`; trước/sau là nút cỡ `default` (chữ ẩn dưới 640px, còn mũi tên). Mọi giá trị lấy từ `buttonVariants` của DS
 * (cao 32, bo pill, hover/focus của Button); dấu "…" vuông 32 như nút icon.
 * Bảng dữ liệu của DS vẫn dùng `PhanTrang` (bang/ — "Dòng 1–15 trên 19" + Trang trước/sau, giữ tham số URL); Pagination
 * này cho chỗ cần nhảy thẳng tới số trang (danh sách bài wiki, kết quả tìm). Chữ tiếng Việt thay "Previous/Next".
 * Không có trang trước/sau (trang đầu/cuối) → không render nút đó (link không tắt được bằng `disabled`).
 * File thường (không 'use client'): khối /ds server dùng được.
 */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center border-none border-current', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('m-0 flex list-none flex-row items-center gap-1 border-none border-current p-0', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Về trang trước" size="default" className={cn('gap-1 px-2.5 sm:pl-2.5', className)} {...props}>
      <CaretLeft aria-hidden="true" />
      <span className="hidden sm:block">Trước</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Tới trang sau" size="default" className={cn('gap-1 px-2.5 sm:pr-2.5', className)} {...props}>
      <span className="hidden sm:block">Sau</span>
      <CaretRight aria-hidden="true" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-(--control-size-md) items-center justify-center border-none border-current', className)}
      {...props}
    >
      <DotsThree className="size-4" />
      <span className="sr-only">Còn trang khác</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
