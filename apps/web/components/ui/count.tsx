import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Count — số nhỏ gắn góc nút icon (chuông thông báo), `.ui-count` của ds/nguon/bundle.css. README: Count.
 * - 0 → không render; > 9 → "9+". `aria-hidden`: tên nút tự đọc đủ ("Thông báo, 3 chưa đọc").
 * - Cao 16, rộng tối thiểu 16, đệm 0 4, pill; nền danger-solid, chữ 10/16 600 tabular-nums; góc trên phải lệch −2px.
 * - Viền 2px màu nền để tách khỏi icon: biến `--ui-count-ring` (mặc định `background`) — nút nằm trên nền khác thì đặt
 *   biến đó ở phần tử cha.
 * - Không 'use client': server component dùng thẳng. Bọc nút trong `CountNeo` (position relative).
 */
export function Count({ so, className }: { so: number; className?: string }) {
  if (!(so > 0)) return null
  return (
    <span
      aria-hidden="true"
      data-slot="count"
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-(--radius-full) border-none border-current',
        'bg-(--color-background-danger-solid) text-(--color-text-danger-solid)',
        'text-center text-[10px] leading-4 font-semibold tabular-nums',
        '[box-shadow:0_0_0_2px_var(--ui-count-ring,var(--background))]',
        className,
      )}
    >
      {so > 9 ? '9+' : so}
    </span>
  )
}

/** `.ui-notif-neo`: neo cho Count — bọc nút icon. */
export function CountNeo({ className, ...props }: ComponentProps<'span'>) {
  return <span data-slot="count-neo" className={cn('relative inline-flex border-none border-current', className)} {...props} />
}
