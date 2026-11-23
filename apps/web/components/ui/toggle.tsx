// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { toggleVariants } from './toggle-styles'

/**
 * Toggle — khung shadcn (`Toggle`, `toggleVariants`; Radix Toggle): một nút bật/tắt, `aria-pressed` (vd "Thẻ xem nhanh"
 * của DataViewToolbar). Giá trị ở `toggle-styles.ts`. Nút chỉ icon: `size="icon"` + BẮT BUỘC `aria-label`.
 * `data-variant` / `data-size` là phần GWT thêm (chọn phần tử khi đo).
 */
function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
