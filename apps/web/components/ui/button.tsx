import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

/**
 * Button — khung shadcn, giá trị chép từ khối `.ui-btn` trong ds/nguon/bundle.css (artifact bản 26).
 * - Thứ tự khoá variants có chủ ý: size → shape → variant, để class của variant (vd link `h-auto p-0`) đứng sau
 *   class của size và thắng qua tailwind-merge; compoundVariants (shape rounded) đứng sau cùng, khớp thứ tự cascade
 *   bundle.css (`[data-shape="rounded"]` khai sau `[data-variant="link"]`).
 * - Hover/active gắn `not-disabled:` (khớp cả <a> khi asChild) → nút disabled/loading không đổi nền.
 * - Kiểu disabled gắn `not-data-loading:`: nút loading vẫn `disabled` (chặn bấm) nhưng giữ màu biến thể như
 *   preview.html (nút "Đang lưu" không xám).
 * - Viền outline = box-shadow inset 1px (y bundle.css), không dùng border → không đổi kích thước hộp.
 * - Bo pill = --radius-full (9999px) như bundle.css, không dùng `rounded-full` (calc(infinity*1px)) để computed style
 *   khớp số artifact.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-1.5 rounded-(--radius-full) cursor-pointer select-none',
    // border-none border-current = `.ui-btn { border: 0 }` (rộng 0 sẵn từ preflight; kiểu none, màu currentColor thay cho
    // `0 solid` + `border-color: var(--border)` chung của app — đo bằng ds/so-khop.mjs).
    'border-none border-current',
    // [font-feature-settings:normal]: shorthand `font: 500 14px/1 …` của .ui-btn reset cv11/ss03 mà body/DsRoot bật
    // (đo bằng ds/so-khop.mjs: artifact "normal") → chữ trong nút dùng glyph mặc định của Inter.
    'font-medium text-[14px] leading-none whitespace-nowrap [font-feature-settings:normal]',
    'transition-[background-color,box-shadow,color,opacity] duration-150 ease-[ease]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:not-data-loading:cursor-not-allowed disabled:not-data-loading:bg-(--color-background-disabled)',
    'disabled:not-data-loading:text-(--color-text-disabled) disabled:not-data-loading:[box-shadow:none]',
    'data-loading:cursor-progress [&_svg]:size-(--control-icon-size-md)',
  ],
  {
    variants: {
      size: {
        default: 'h-(--control-size-md) px-[calc(var(--control-gutter-md)*1.33)]',
        sm: 'h-(--control-size-sm) px-[calc(var(--control-gutter-sm)*1.33)] gap-1',
        lg: 'h-(--control-size-lg) px-[calc(var(--control-gutter-md)*1.33)]',
        icon: 'size-(--control-size-md) p-0',
        'icon-sm': 'size-(--control-size-sm) p-0',
      },
      shape: { pill: '', rounded: '' },
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'not-disabled:hover:bg-(--color-background-primary-solid-hover)',
          'not-disabled:active:bg-(--color-background-primary-solid-active)',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'not-disabled:hover:bg-(--color-background-secondary-soft-hover)',
          'not-disabled:active:bg-(--color-background-secondary-soft-active)',
        ],
        outline: [
          'bg-transparent text-foreground [box-shadow:inset_0_0_0_1px_var(--input)]',
          'not-disabled:hover:bg-(--color-background-primary-outline-hover) not-disabled:hover:text-accent-foreground',
          'not-disabled:hover:[box-shadow:inset_0_0_0_1px_var(--color-border-primary-outline-hover)]',
          'not-disabled:active:bg-(--color-background-primary-outline-active)',
          'focus-visible:-outline-offset-1',
          'disabled:not-data-loading:bg-transparent',
          'disabled:not-data-loading:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
        ],
        ghost: [
          'bg-transparent text-foreground',
          'not-disabled:hover:bg-accent not-disabled:hover:text-accent-foreground',
          // Đang bật (pressed/expanded/checked) thì nền accent thắng :active — bundle.css khai rule đó sau :active.
          'not-disabled:not-aria-pressed:not-aria-expanded:not-aria-checked:active:bg-(--color-background-primary-ghost-active)',
          'aria-pressed:bg-accent aria-checked:bg-accent aria-expanded:bg-accent',
          'focus-visible:-outline-offset-1 disabled:not-data-loading:bg-transparent',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'not-disabled:hover:bg-(--color-background-danger-solid-hover)',
          'not-disabled:active:bg-(--color-background-danger-solid-hover)',
          'focus-visible:outline-(--color-ring-danger)',
        ],
        link: [
          'bg-transparent text-(--blue-500) in-data-[theme=dark]:text-(--blue-300) h-auto p-0 rounded-(--radius-sm)',
          'not-disabled:hover:underline not-disabled:hover:underline-offset-[0.1em]',
        ],
      },
    },
    compoundVariants: [
      { shape: 'rounded', size: ['default', 'lg'], class: 'rounded-(--radius-md) px-(--control-gutter-md)' },
      { shape: 'rounded', size: 'icon', class: 'rounded-(--radius-md)' },
      { shape: 'rounded', size: ['sm', 'icon-sm'], class: 'rounded-(--radius-sm)' },
      { shape: 'rounded', size: 'sm', class: 'px-(--control-gutter-sm)' },
    ],
    defaultVariants: { variant: 'default', size: 'default', shape: 'pill' },
  },
)

export function Button({
  className,
  variant = 'default',
  size = 'default',
  shape = 'pill',
  asChild = false,
  loading = false,
  disabled,
  type,
  children,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      // Mặc định "button": nút DS nằm trong <form> không submit nhầm. asChild (vd <a>) không mang type.
      type={asChild ? type : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {/* Loading: nội dung ẩn bằng opacity (vẫn chiếm chỗ → nút không co), spinner nằm đè giữa.
          asChild cần đúng 1 con → không chèn spinner, bên gọi tự lo.
          Bật/tắt loading đổi cây con (bọc/không bọc <span>) → children bị remount, state bên trong children mất. */}
      {loading && !asChild ? (
        <>
          <span className="inline-flex items-center gap-[inherit] opacity-0">{children}</span>
          <Spinner className="absolute inset-0 m-auto" />
        </>
      ) : (
        children
      )}
    </Comp>
  )
}
