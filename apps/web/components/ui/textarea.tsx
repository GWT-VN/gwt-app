import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { controlOutline } from './control-styles'

/**
 * Textarea — khung shadcn, cùng viền/bo/trạng thái với Input (`controlOutline`); riêng `.ui-textarea` của
 * ds/nguon/bundle.css: cao tự do, tối thiểu 80 (min-h-20), padding 6 12 (bundle.css gõ 6px), kéo giãn dọc.
 */
export function Textarea({ className, variant, ...props }: ComponentProps<'textarea'> & { variant?: 'tran' }) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(variant === 'tran' ? tran : cn(controlOutline, 'h-auto min-h-20 py-[6px] resize-y'), className)}
      {...props}
    />
  )
}

/**
 * `variant="tran"` — ô chữ TRẦN để sửa tại chỗ kiểu Notion (tiêu đề thẻ xem nhanh — CEO 27/11 "tiêu đề… làm subtle như
 * Notion"): không viền / nền / đệm / kéo giãn, chữ kế thừa khung (cỡ, đậm, dòng), tự cao theo nội dung (`field-sizing`).
 * Chỉ báo focus = con trỏ nhập (ô chữ luôn hiện chữ — không vẽ vòng); placeholder màu tertiary.
 */
const tran = cn(
  'block w-full min-h-0 m-0 p-0 resize-none border-none border-current bg-transparent [box-shadow:none] [outline:none]',
  'font-[inherit] text-inherit leading-[inherit] [field-sizing:content] overflow-hidden',
  'placeholder:text-(--color-text-tertiary)',
)
