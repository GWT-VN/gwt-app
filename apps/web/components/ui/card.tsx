// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Card — khung shadcn (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter), giá trị từ
 * khối Card của ds/nguon/bundle.css.
 * - `Card` = `.ui-card.ui-card-pad`: viền 1px `border`, bo `radius-xl`, nền `card`, chữ `card-foreground`, đệm 16.
 *   Không bóng (shadcn có shadow-sm; token `--card`: "Card tách khỏi trang bằng viền, không bằng màu khác").
 * - Đệm nằm ở `Card`, không ở từng phần như shadcn (px-6/py-6) → con bất kỳ (vd `FormLayout`) đặt thẳng vào vẫn có lề,
 *   giống preview FormLayout. Phần (Header/Content/Footer) đứng sau phần tử khác cách trên 16 (= đệm; shadcn gap-6
 *   bằng đệm py-6) — margin, không flex-gap, để `Card` vẫn là khối thường như `.ui-card`.
 * - Header: lưới, `CardAction` cột 2 phủ dòng tiêu đề + mô tả, sát phải (shadcn). Tiêu đề 16/24 600 (`heading-xs`, như
 *   tiêu đề khối form), mô tả 14/20 `muted-foreground` cách trên 4 (như mô tả Dialog). Footer: nút sát phải, cách 8
 *   (như chân form/Dialog — shadcn để trái).
 * - `CardTitle` là `div` như shadcn v4; thẻ là một mục của trang → `role="heading"` + `aria-level`.
 * - Header/Footer có kẻ (`border-b`/`border-t`) thì chừa 16 như shadcn chừa 24.
 */

/** div/p ăn preflight `0 solid var(--border)` của app; phần của artifact không viền. */
const khongVien = 'border-none border-current'
/** Phần đứng sau phần tử khác: cách trên 16 (bundle.css `:not(:first-child)`). */
const cachTren = 'not-first:mt-4'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-(--radius-xl) border border-solid border-(--border) bg-(--card) p-4 text-(--card-foreground)',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        khongVien,
        cachTren,
        'grid auto-rows-min items-start gap-x-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(khongVien, 'text-[16px] leading-[24px] font-semibold', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(khongVien, 'mt-1 text-[14px] leading-[20px] text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(khongVien, 'col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(khongVien, cachTren, className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(khongVien, cachTren, 'flex items-center justify-end gap-2 [.border-t]:pt-4', className)}
      {...props}
    />
  )
}
