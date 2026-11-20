// File THƯỜNG (không 'use client'): server component gọi được `buttonVariants()` (vd `<Link className={buttonVariants()}>`).
import { cva } from 'class-variance-authority'

/**
 * Button — khung shadcn, giá trị chép từ khối `.ui-btn` trong ds/nguon/bundle.css (artifact bản 26).
 * - Thứ tự khoá variants có chủ ý: size → shape → variant, để class của variant (vd link `h-auto p-0`) đứng sau
 *   class của size và thắng qua tailwind-merge; compoundVariants (shape rounded) đứng sau cùng, khớp thứ tự cascade
 *   bundle.css (`[data-shape="rounded"]` khai sau `[data-variant="link"]`).
 * - Hover/active gắn `not-disabled:not-aria-disabled:` (khớp cả <a> khi asChild) → nút disabled/loading không đổi nền.
 * - Loading (spec §5.1) = `aria-disabled="true"` + `aria-busy="true"`, KHÔNG `disabled`: nút giữ focus suốt lúc chờ
 *   (disabled làm trình duyệt thả focus ra body), bấm/Enter/Space lần nữa bị chặn (`preventDefault` ở onClick → nút
 *   submit không gửi lại form, kể cả Enter trong ô của form; `<a>` asChild không điều hướng). Giữ màu biến thể như
 *   preview.html (nút "Đang lưu" không xám): kiểu disabled gắn `not-data-loading:`.
 * - Viền outline = box-shadow inset 1px (y bundle.css), không dùng border → không đổi kích thước hộp.
 * - Bo pill = --radius-full (9999px) như bundle.css, không dùng `rounded-full` (calc(infinity*1px)) để computed style
 *   khớp số artifact.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-1.5 rounded-(--radius-full) cursor-pointer select-none',
    // border-none border-current = `.ui-btn { border: 0 }` (rộng 0 sẵn từ preflight; kiểu none, màu currentColor thay cho
    // `0 solid` + `border-color: var(--border)` chung của app — đo bằng ds/so-khop.mjs).
    // Muốn có viền thì thêm `border-solid` (base là border-none để khớp artifact `.ui-btn{border:0}`).
    'border-none border-current',
    // Không reset font-feature-settings: nút kế thừa cv11/ss03 của DsRoot (CEO chốt 19/11 "bật cho đồng bộ"); artifact
    // tắt chúng trên nút chỉ do shorthand `font:` của .ui-btn — lyDo ghi trong ds/so-khop/button.json.
    'font-medium text-[14px] leading-none whitespace-nowrap',
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
          'not-disabled:not-aria-disabled:hover:bg-(--color-background-primary-solid-hover)',
          'not-disabled:not-aria-disabled:active:bg-(--color-background-primary-solid-active)',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'not-disabled:not-aria-disabled:hover:bg-(--color-background-secondary-soft-hover)',
          'not-disabled:not-aria-disabled:active:bg-(--color-background-secondary-soft-active)',
        ],
        outline: [
          'bg-transparent text-foreground [box-shadow:inset_0_0_0_1px_var(--input)]',
          'not-disabled:not-aria-disabled:hover:bg-(--color-background-primary-outline-hover) not-disabled:not-aria-disabled:hover:text-accent-foreground',
          'not-disabled:not-aria-disabled:hover:[box-shadow:inset_0_0_0_1px_var(--color-border-primary-outline-hover)]',
          'not-disabled:not-aria-disabled:active:bg-(--color-background-primary-outline-active)',
          'focus-visible:-outline-offset-1',
          'disabled:not-data-loading:bg-transparent',
          'disabled:not-data-loading:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
        ],
        ghost: [
          'bg-transparent text-foreground',
          'not-disabled:not-aria-disabled:hover:bg-accent not-disabled:not-aria-disabled:hover:text-accent-foreground',
          // Đang bật (pressed/expanded/checked) thì nền accent thắng :active — bundle.css khai rule đó sau :active.
          'not-disabled:not-aria-disabled:not-aria-pressed:not-aria-expanded:not-aria-checked:active:bg-(--color-background-primary-ghost-active)',
          'aria-pressed:bg-accent aria-checked:bg-accent aria-expanded:bg-accent',
          'focus-visible:-outline-offset-1 disabled:not-data-loading:bg-transparent',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'not-disabled:not-aria-disabled:hover:bg-(--color-background-danger-solid-hover)',
          'not-disabled:not-aria-disabled:active:bg-(--color-background-danger-solid-hover)',
          'focus-visible:outline-(--color-ring-danger)',
        ],
        link: [
          'bg-transparent text-(--blue-500) in-data-[theme=dark]:text-(--blue-300) h-auto p-0 rounded-(--radius-sm)',
          'not-disabled:not-aria-disabled:hover:underline not-disabled:not-aria-disabled:hover:underline-offset-[0.1em]',
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
