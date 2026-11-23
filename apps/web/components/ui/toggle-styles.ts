// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
// File THƯỜNG (không 'use client'): `toggleVariants` — server component / component khác dùng lại được (luật NGUON).
import { cva } from 'class-variance-authority'

/**
 * `toggleVariants` — tên + giá trị shadcn (`variant` default/outline, `size` default/sm/lg), giá trị lấy từ `.ui-btn`
 * của bundle.css (Toggle = nút công cụ của DataViewToolbar: `.ui-btn[data-variant="ghost"]`):
 * - `default` = Button ghost (shadcn: nền trong, rê muted) — rê/bật nền `accent`; `outline` = Button outline (viền
 *   inset 1px `--input`, không đổi kích thước hộp).
 * - Size theo thang control (default 32 · sm 28 · lg 36), `min-w` bằng cao như shadcn, đệm ngang như Button cùng size.
 *   Phần GWT thêm: `icon` / `icon-sm` (ô vuông, đệm 0 — nút chỉ icon của thanh công cụ).
 * - Đang bật: `data-state=on` (Toggle/ToggleGroup multiple) và `aria-checked` (ToggleGroup single: radio) → nền accent.
 *   Bọc trong TooltipNhanh thì Trigger asChild đè `data-state` → `aria-pressed`/`aria-checked` mới chắc (NGUON).
 * - Focus = outline 2 ring như Button (không chép `outline-none` + ring của shadcn: Tailwind 4 mất vòng focus).
 */
export const toggleVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-1.5 rounded-(--radius-full) cursor-pointer select-none',
    'border-none border-current font-medium text-[14px] leading-none whitespace-nowrap text-foreground',
    'transition-[background-color,box-shadow,color] duration-150 ease-[ease]',
    'focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:text-(--color-text-disabled)',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-(--control-icon-size-md)',
    'aria-pressed:bg-accent aria-checked:bg-accent data-[state=on]:bg-accent',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-transparent',
          'not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground',
          'not-disabled:not-aria-pressed:not-aria-checked:not-data-[state=on]:active:bg-(--color-background-primary-ghost-active)',
        ],
        outline: [
          'bg-transparent [box-shadow:inset_0_0_0_1px_var(--input)]',
          'not-disabled:hover:bg-(--color-background-primary-outline-hover) not-disabled:hover:text-accent-foreground',
          'not-disabled:hover:[box-shadow:inset_0_0_0_1px_var(--color-border-primary-outline-hover)]',
          'disabled:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
        ],
      },
      size: {
        default: 'h-(--control-size-md) min-w-(--control-size-md) px-[calc(var(--control-gutter-md)*1.33)]',
        sm: 'h-(--control-size-sm) min-w-(--control-size-sm) px-[calc(var(--control-gutter-sm)*1.33)] gap-1',
        lg: 'h-(--control-size-lg) min-w-(--control-size-lg) px-[calc(var(--control-gutter-md)*1.33)]',
        icon: 'size-(--control-size-md) p-0',
        'icon-sm': 'size-(--control-size-sm) p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
