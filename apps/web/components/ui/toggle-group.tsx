'use client'

import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'

type Kieu = Pick<VariantProps<typeof buttonVariants>, 'variant' | 'size'>

/**
 * Toggle / ToggleGroup — khung shadcn (Radix), diện mạo = Button DS (mặc định ghost icon, như nút công cụ
 * `.ui-btn[data-variant="ghost"][data-size="icon"]` của DataViewToolbar). Đang bật → nền `accent` (button-variants: theo
 * `aria-pressed` / `aria-checked` / `data-state=on`).
 * - `Toggle`: một nút bật/tắt, `aria-pressed` (vd "Thẻ xem nhanh").
 * - `ToggleGroup type="single"`: Radix gắn `role="radiogroup"`, mỗi mục `role="radio"` + `aria-checked`; ←/→ chuyển focus
 *   (RovingFocus), Space/Enter chọn. Radix cho bấm lại mục đang chọn để bỏ chọn (giá trị '') → bên gọi bỏ qua '' nếu
 *   nhóm luôn phải có một mục (dạng xem).
 * - Tên đọc: nút chỉ icon BẮT BUỘC `aria-label`.
 */
export function Toggle({
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> & Kieu) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex items-center gap-0.5 border-none border-current', className)}
      {...props}
    />
  )
}

export function ToggleGroupItem({
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> & Kieu) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
