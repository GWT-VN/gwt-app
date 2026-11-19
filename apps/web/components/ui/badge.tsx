import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Badge — khung shadcn, giá trị chép từ khối `.ui-badge*` / `.ui-dot` trong ds/nguon/bundle.css.
 * - Chép đúng cascade bundle.css: nền + chữ soft theo `color`; `[data-variant="solid"|"outline"]` khai SAU `[data-color]`
 *   cùng specificity → variant (đứng sau color trong cva, thắng qua tailwind-merge) đè màu: solid = xám secondary-solid,
 *   outline = xám secondary-outline với MỌI màu. Ngoại lệ duy nhất: compound solid+success, solid+danger.
 *   Badge outline cần màu → dùng `<BadgeDot color>` (mẫu "outline xám + chấm màu" của artifact).
 * - Viền outline = box-shadow inset 1px như bundle.css (không đổi kích thước hộp). `border-none border-current` = span
 *   artifact không có viền (không ăn preflight `0 solid var(--border)` của app).
 * - Bo pill = --radius-full (9999px), không dùng `rounded-full` (calc(infinity*1px)).
 * - Không reset font-feature-settings (kế thừa cv11/ss03 của DsRoot).
 */
export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-(--radius-full) border-none border-current',
    'font-semibold whitespace-nowrap',
  ],
  {
    variants: {
      size: {
        /* bundle.css .ui-badge: height 20px · padding 0 7px · font 600 12px/1 */
        sm: 'h-5 px-[7px] text-[12px] leading-none',
        /* bundle.css .ui-badge[data-size="md"]: height control-size-3xs (22) · padding 0 gutter-2xs (6) · 14px */
        md: 'h-(--control-size-3xs) px-(--control-gutter-2xs) text-[14px] leading-none',
      },
      color: {
        secondary: 'bg-(--color-background-secondary-soft-alpha) text-(--color-text-secondary-soft)',
        info: 'bg-(--color-background-info-soft-alpha) text-(--color-text-info-soft)',
        success: 'bg-(--color-background-success-soft-alpha) text-(--color-text-success-soft)',
        warning: 'bg-(--color-background-warning-soft-alpha) text-(--color-text-warning-soft)',
        danger: 'bg-(--color-background-danger-soft-alpha) text-(--color-text-danger-soft)',
        discovery: 'bg-(--color-background-discovery-soft-alpha) text-(--color-text-discovery-soft)',
      },
      variant: {
        soft: '',
        solid: 'bg-(--color-background-secondary-solid) text-(--color-text-secondary-solid)',
        outline:
          'bg-transparent [box-shadow:inset_0_0_0_1px_var(--color-border-secondary-outline)] text-(--color-text-secondary-outline)',
      },
    },
    compoundVariants: [
      { variant: 'solid', color: 'success', class: 'bg-(--color-background-success-solid) text-(--color-text-success-solid)' },
      { variant: 'solid', color: 'danger', class: 'bg-(--color-background-danger-solid) text-(--color-text-danger-solid)' },
    ],
    defaultVariants: { variant: 'soft', color: 'secondary', size: 'sm' },
  },
)

export function Badge({
  className,
  variant = 'soft',
  color = 'secondary',
  size = 'sm',
  asChild = false,
  ...props
}: Omit<ComponentProps<'span'>, 'color'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-color={color}
      data-size={size}
      className={cn(badgeVariants({ variant, color, size, className }))}
      {...props}
    />
  )
}

const NEN_CHAM = {
  info: 'bg-(--color-background-info-solid)',
  success: 'bg-(--color-background-success-solid)',
  warning: 'bg-(--color-background-warning-solid)',
  danger: 'bg-(--color-background-danger-solid)',
  discovery: 'bg-(--color-background-discovery-solid)',
} as const

/**
 * Chấm màu trong Badge: 6px tròn. Không `color` → nền currentColor, theo màu chữ badge cha (`.ui-badge .ui-dot`);
 * có `color` → nền `<màu>-solid` (`.ui-dot[data-color]`, dùng trong badge outline xám).
 */
export function BadgeDot({ color, className }: { color?: keyof typeof NEN_CHAM; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="badge-dot"
      data-color={color}
      className={cn('size-1.5 shrink-0 rounded-(--radius-full)', color ? NEN_CHAM[color] : 'bg-current', className)}
    />
  )
}
