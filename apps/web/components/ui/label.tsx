// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Label as LabelPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Label — nhãn chung (Radix Label: bấm nhãn focus ô `htmlFor`, chặn bôi chữ khi bấm đúp). Token từ `.ui-label` của
 * ds/nguon/bundle.css: 14/20, 500, foreground.
 * Lệch shadcn có chủ đích: shadcn gõ `flex items-center gap-2 leading-none`; `.ui-label` là nhãn THƯỜNG (không flex,
 * cao dòng 20) — dấu `*` bắt buộc cách chữ bằng một dấu cách như preview, không bằng gap 8. Giữ của shadcn: `select-none`,
 * mờ 50% khi nhóm `data-disabled=true` hoặc ô `peer` đứng trước bị tắt.
 * Không viền: label ăn preflight `0 solid` của app → tắt về `none` như artifact.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'border-none border-current text-[14px] leading-[20px] font-medium text-foreground select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
