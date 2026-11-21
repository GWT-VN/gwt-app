// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'

/**
 * Badge — khung shadcn (`Badge`, `badgeVariants`, `variant` default/secondary/destructive/outline/ghost/link, `asChild`),
 * giá trị từ khối `.ui-badge*` / `.ui-dot` trong ds/nguon/bundle.css.
 * - Phần GWT thêm (R19): `variant` `soft`/`solid`, `color` (6 màu token), `size` sm/md, `BadgeDot`, `BadgeCaret`. Màu
 *   theo `color` chỉ có nghĩa với `soft` (nền nhạt + chữ theo màu) và `solid` (chỉ success/danger có màu riêng).
 * - Mặc định `variant="default"` như shadcn (nền primary đặc). Nhãn trạng thái nền nhạt của artifact → `variant="soft"`.
 * - Giá trị biến thể shadcn gán token ChatGPT: default = primary; secondary = secondary (gray-100, như Button secondary);
 *   destructive = danger-solid; outline = viền xám secondary-outline (đúng `.ui-badge[data-variant="outline"]`); ghost =
 *   trong suốt, hover accent khi là `<a>`; link = chữ xanh như Button link. Artifact chỉ có soft/solid/outline — 4 giá trị
 *   còn lại chưa có trong artifact.
 * - Chép đúng cascade bundle.css: nền + chữ soft theo `color`; `[data-variant="solid"|"outline"]` khai SAU `[data-color]`
 *   cùng specificity → variant (đứng sau color trong cva, thắng qua tailwind-merge) đè màu: solid = xám secondary-solid,
 *   outline = xám secondary-outline với MỌI màu. Ngoại lệ duy nhất: compound solid+success, solid+danger.
 *   Badge outline cần màu → dùng `<BadgeDot color>` (mẫu "outline xám + chấm màu" của artifact).
 * - Viền outline = box-shadow inset 1px như bundle.css (không đổi kích thước hộp). `border-none border-current` = span
 *   artifact không có viền (không ăn preflight `0 solid var(--border)` của app).
 * - Bo pill = --radius-full (9999px), không dùng `rounded-full` (calc(infinity*1px)).
 * - Không reset font-feature-settings (kế thừa cv11/ss03 của DsRoot).
 * - Bỏ `w-fit shrink-0 justify-center overflow-hidden` của shadcn: `.ui-badge` không có → badge trong hàng flex co/giãn
 *   như artifact.
 */
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-(--radius-full) border-none border-current',
    'font-semibold whitespace-nowrap transition-[color,box-shadow]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none',
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
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-(--color-background-primary-solid-hover)',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-(--color-background-secondary-soft-hover)',
        destructive:
          'bg-(--color-background-danger-solid) text-(--color-text-danger-solid) [a&]:hover:bg-(--color-background-danger-solid-hover) focus-visible:outline-(--color-ring-danger)',
        outline:
          'bg-transparent [box-shadow:inset_0_0_0_1px_var(--color-border-secondary-outline)] text-(--color-text-secondary-outline) [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: 'bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'bg-transparent text-(--blue-500) in-data-[theme=dark]:text-(--blue-300) underline-offset-4 [a&]:hover:underline',
        soft: '',
        solid: 'bg-(--color-background-secondary-solid) text-(--color-text-secondary-solid)',
      },
    },
    compoundVariants: [
      { variant: 'solid', color: 'success', class: 'bg-(--color-background-success-solid) text-(--color-text-success-solid)' },
      { variant: 'solid', color: 'danger', class: 'bg-(--color-background-danger-solid) text-(--color-text-danger-solid)' },
    ],
    defaultVariants: { variant: 'default', color: 'secondary', size: 'sm' },
  },
)

function Badge({
  className,
  variant = 'default',
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
function BadgeDot({ color, className }: { color?: keyof typeof NEN_CHAM; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="badge-dot"
      data-color={color}
      className={cn('size-1.5 shrink-0 rounded-(--radius-full)', color ? NEN_CHAM[color] : 'bg-current', className)}
    />
  )
}

/**
 * Mũi tên ▾ trong Badge bấm được để đổi giá trị (ô trạng thái InlineEdit) — `.ui-badge .ui-caret` (bundle.css bản 40):
 * 10px, lề phải −2, cùng màu chữ badge, mờ 60% → 100% khi nút/role=button bọc ngoài đang rê hoặc đang mở
 * (`aria-expanded="true"`). Icon Phosphor CaretDown nét `bold` như preview InlineEdit. Đặt làm con CUỐI của `<Badge>`.
 * Không phải 'use client' (icon bản ssr) → dùng được ở server component.
 */
function BadgeCaret({ className }: { className?: string }) {
  return (
    <CaretDown
      weight="bold"
      aria-hidden="true"
      data-slot="badge-caret"
      className={cn(
        'size-2.5 -mr-0.5 shrink-0 opacity-60',
        'in-[:is(button,[role=button]):is(:hover,[aria-expanded=true])]:opacity-100',
        className,
      )}
    />
  )
}

export { Badge, badgeVariants, BadgeDot, BadgeCaret }
