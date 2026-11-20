import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { controlOutline } from './control-styles'

/**
 * Textarea — khung shadcn, cùng viền/bo/trạng thái với Input (`controlOutline`); riêng `.ui-textarea` của
 * ds/nguon/bundle.css: cao tự do, tối thiểu 80 (min-h-20), padding 6 12 (bundle.css gõ 6px), kéo giãn dọc.
 */
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlOutline, 'h-auto min-h-20 py-[6px] resize-y', className)}
      {...props}
    />
  )
}
