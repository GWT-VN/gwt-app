// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { createContext, useContext, type ComponentProps, type CSSProperties } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { toggleVariants } from './toggle-styles'

/**
 * ToggleGroup — khung shadcn (`ToggleGroup`, `ToggleGroupItem`; Radix ToggleGroup). `variant`/`size`/`spacing` đặt ở
 * nhóm, truyền xuống mục qua context (mục tự đặt được khi nhóm không đặt).
 * - `type="single"`: Radix gắn `role="radiogroup"`, mỗi mục `role="radio"` + `aria-checked`; ←/→ chuyển focus
 *   (RovingFocus), Space/Enter chọn. Radix cho bấm lại mục đang chọn để bỏ chọn (giá trị '') → bên gọi bỏ qua '' nếu
 *   nhóm luôn phải có một mục (dạng xem).
 * - `spacing` (shadcn, bội số `--spacing` 4px): `0` (mặc định) = các mục dính liền, chỉ mục đầu/cuối bo; khác 0 = các
 *   mục rời, mỗi mục bo pill như Button DS (thanh công cụ DataViewToolbar dùng `spacing={0.5}` = cách 2).
 * - Mục KHÔNG chép `w-auto min-w-0 px-3` của shadcn: đệm theo `size` của `toggleVariants` (px-3 đè ô vuông `icon`).
 *   Nhóm KHÔNG chép `rounded-md` + bóng `outline` của shadcn: viền outline DS là bóng inset trên từng mục; `.b-bo-cuc`
 *   của artifact không bo (cổng DataViewToolbar đo).
 * - Tên đọc: nút chỉ icon BẮT BUỘC `aria-label`.
 */
const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants> & { spacing?: number }>({
  size: 'default',
  variant: 'default',
  spacing: 0,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  style,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants> & { spacing?: number }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ '--gap': spacing, ...style } as CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] border-none border-current',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext)
  const v = context.variant || variant
  const sz = context.size || size
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={v ?? 'default'}
      data-size={sz ?? 'default'}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: v, size: sz }),
        'shrink-0 focus:z-10 focus-visible:z-10',
        'data-[spacing=0]:rounded-none data-[spacing=0]:first:rounded-l-(--radius-full) data-[spacing=0]:last:rounded-r-(--radius-full)',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
