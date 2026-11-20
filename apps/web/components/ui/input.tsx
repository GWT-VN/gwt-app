import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { controlOutline } from './control-styles'

/**
 * Input — khung shadcn, giá trị chép từ `.ui-input` / `.ui-input-wrap` của ds/nguon/bundle.css qua `controlOutline`
 * (control-styles.ts): cao 32, bo 8, viền inset 1px, focus làm đậm viền thay vì quầng sáng.
 * - Người gọi: nhãn `FieldLabel htmlFor`, `placeholder` chỉ là ví dụ (không thay nhãn), gợi ý/lỗi nối qua
 *   `aria-describedby`, lỗi thì `aria-invalid`.
 * - `icon` (vd `<MagnifyingGlass />` cho ô tìm) → bọc khung `.ui-input-wrap`: icon 16 cách mép trái 12, cách chữ 8,
 *   màu muted-foreground, `aria-hidden`, không bắt chuột (bấm vào icon là bấm vào ô). `id`/`className`/mọi prop khác
 *   vẫn rơi vào chính `<input>`.
 */
export function Input({ className, icon, ...props }: ComponentProps<'input'> & { icon?: ReactNode }) {
  const o = (
    <input
      data-slot="input"
      // pl = gutter 12 + icon 16 + --input-gap-md 8 (bundle.css `.ui-input-wrap > .ui-input`).
      className={cn(controlOutline, icon && 'pl-[calc(var(--control-gutter-md)+24px)]', className)}
      {...props}
    />
  )
  if (!icon) return o
  return (
    <div data-slot="input-wrap" className="relative flex items-center border-none border-current">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-(--control-gutter-md) flex border-none border-current text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
      >
        {icon}
      </span>
      {o}
    </div>
  )
}
