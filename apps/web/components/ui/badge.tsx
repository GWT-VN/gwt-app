import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Badge — khung shadcn, giá trị chép từ khối `.ui-badge*` / `.ui-dot` trong ds/nguon/bundle.css.
 * - Nền + chữ soft theo `color` (variant soft là mặc định); solid/outline ở compoundVariants → đứng sau, thắng qua
 *   tailwind-merge. Ma trận đủ 3 × 6 theo token `--color-{background,text,border}-<màu>-<kiểu>`; bundle.css chỉ khai
 *   solid secondary/success/danger và outline secondary — tổ hợp còn lại dùng token cùng khuôn (preview không có, chưa đo).
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
        sm: 'h-5 px-[7px] text-[12px] leading-none',
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
      variant: { soft: '', solid: '', outline: 'bg-transparent' },
    },
    compoundVariants: [
      { variant: 'solid', color: 'secondary', class: 'bg-(--color-background-secondary-solid) text-(--color-text-secondary-solid)' },
      { variant: 'solid', color: 'info', class: 'bg-(--color-background-info-solid) text-(--color-text-info-solid)' },
      { variant: 'solid', color: 'success', class: 'bg-(--color-background-success-solid) text-(--color-text-success-solid)' },
      { variant: 'solid', color: 'warning', class: 'bg-(--color-background-warning-solid) text-(--color-text-warning-solid)' },
      { variant: 'solid', color: 'danger', class: 'bg-(--color-background-danger-solid) text-(--color-text-danger-solid)' },
      { variant: 'solid', color: 'discovery', class: 'bg-(--color-background-discovery-solid) text-(--color-text-discovery-solid)' },
      { variant: 'outline', color: 'secondary', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-secondary-outline)] text-(--color-text-secondary-outline)' },
      { variant: 'outline', color: 'info', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-info-outline)] text-(--color-text-info-outline)' },
      { variant: 'outline', color: 'success', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-success-outline)] text-(--color-text-success-outline)' },
      { variant: 'outline', color: 'warning', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-warning-outline)] text-(--color-text-warning-outline)' },
      { variant: 'outline', color: 'danger', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-danger-outline)] text-(--color-text-danger-outline)' },
      { variant: 'outline', color: 'discovery', class: '[box-shadow:inset_0_0_0_1px_var(--color-border-discovery-outline)] text-(--color-text-discovery-outline)' },
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

/** Chấm màu trong Badge: 6px tròn, nền currentColor → theo màu chữ của badge cha (`.ui-badge .ui-dot`). */
export function BadgeDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" data-slot="badge-dot" className={cn('size-1.5 shrink-0 rounded-(--radius-full) bg-current', className)} />
  )
}
