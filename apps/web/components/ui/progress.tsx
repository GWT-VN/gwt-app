// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Progress — thanh tiến độ (Radix Progress: `role="progressbar"`, `aria-valuenow/min/max`, `data-state`
 * loading/complete/indeterminate). Token `.ui-progress` của ds/nguon/bundle.css (thanh tải tệp FileUpload): cao 4, bo
 * tròn, rãnh alpha-08, thanh color-background-primary-solid, chuyển 200ms ease. shadcn cao 8 / rãnh primary 20% → DS
 * theo artifact. Thanh trượt bằng translateX như shadcn (đầu phải vẫn bo nhờ `rounded-[inherit]`).
 * GWT sửa: shadcn nuốt `value` (không chuyền cho Root → thiếu `aria-valuenow`, `data-state` luôn indeterminate) → chuyền lại.
 * Luôn đặt tên: `aria-label` (vd "Đang tải bao-gia.pdf") hoặc `aria-labelledby`; không `value` = chưa biết tiến độ.
 */
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        'relative block h-1 w-full overflow-hidden rounded-(--radius-full) border-none border-current bg-(--alpha-08)',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="block h-full w-full flex-1 rounded-[inherit] border-none border-current bg-(--color-background-primary-solid) transition-transform duration-200 ease-[ease]"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
