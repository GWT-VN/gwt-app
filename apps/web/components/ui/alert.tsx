// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import { cloneElement, type ComponentProps, type ReactElement } from 'react'
import { Check, Info, Warning, WarningCircle } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'

/**
 * Alert — khung shadcn (`Alert`, `AlertTitle`, `AlertDescription`, `variant` default/destructive), giá trị chép từ khối
 * `.ui-alert*` trong ds/nguon/bundle.css.
 * - `variant` (shadcn): `default` = `color="secondary"`, `destructive` = `color="danger"`. Phần GWT thêm (R19): `color`
 *   đủ 5 màu token (thắng `variant` khi truyền cả hai), `icon`, `AlertActions`, role theo màu.
 * - Grid `16px 1fr auto` (số px của bundle.css): icon cột 1, tiêu đề + mô tả cột 2 (`col-start-2`), hành động cột 3 →
 *   luôn sát mép phải (tương đương `ml-auto`), không cần bọc chữ trong một <div> như preview.
 * - `secondary` = rule gốc `.ui-alert` (nền/viền primary-surface, icon muted-foreground) — bundle.css thắng chữ
 *   "<màu>-surface" của brief; 4 màu còn lại theo `[data-color]`.
 * - Viền = box-shadow inset 1px (không đổi kích thước hộp); `border-none border-current` = div artifact không viền
 *   (không ăn preflight `0 solid var(--border)` của app).
 * - Icon nhắm `[&>svg]` như `.ui-alert > .ui-icon` → icon truyền vào qua `icon` cũng ăn cỡ/màu.
 * - Icon mặc định theo hình preview: Info (i tròn) · Check (dấu tích trần — preview không có vòng tròn, nên không dùng
 *   CheckCircle như chữ brief) · Warning (tam giác) · WarningCircle (! tròn).
 * - Alert luôn có icon (artifact không định nghĩa alert không icon): `icon` là ReactElement (null/false = lỗi kiểu),
 *   tự gắn `aria-hidden` (icon trang trí, nghĩa nằm ở tiêu đề).
 * - role: mặc định `status`; `danger` → `alert`; `role` người gọi truyền luôn thắng.
 */
const MAU = {
  secondary: 'bg-(--color-background-primary-surface) [box-shadow:inset_0_0_0_1px_var(--color-border-primary-surface)] [&>svg]:text-muted-foreground',
  info: 'bg-(--color-background-info-surface) [box-shadow:inset_0_0_0_1px_var(--color-border-info-surface)] [&>svg]:text-(--color-text-info)',
  success: 'bg-(--color-background-success-surface) [box-shadow:inset_0_0_0_1px_var(--color-border-success-surface)] [&>svg]:text-(--color-text-success)',
  warning: 'bg-(--color-background-warning-surface) [box-shadow:inset_0_0_0_1px_var(--color-border-warning-surface)] [&>svg]:text-(--color-text-warning)',
  danger: 'bg-(--color-background-danger-surface) [box-shadow:inset_0_0_0_1px_var(--color-border-danger-surface)] [&>svg]:text-(--color-text-danger)',
} as const

const ICON = { secondary: Info, info: Info, success: Check, warning: Warning, danger: WarningCircle } as const

function Alert({
  className,
  variant = 'default',
  color: mau,
  icon,
  role,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'color'> & {
  variant?: 'default' | 'destructive'
  color?: keyof typeof MAU
  icon?: ReactElement<{ 'aria-hidden'?: boolean | 'true' | 'false' }>
}) {
  const color = mau ?? (variant === 'destructive' ? 'danger' : 'secondary')
  const Icon = ICON[color]
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      data-color={color}
      role={role ?? (color === 'danger' ? 'alert' : 'status')}
      className={cn(
        'grid grid-cols-[16px_1fr_auto] gap-x-3 items-start p-(--alert-gutter) rounded-(--radius-xl)',
        'border-none border-current text-[14px] leading-[20px] text-foreground',
        // .ui-alert > .ui-icon: 16px, margin-top 2px (bundle.css)
        '[&>svg]:size-4 [&>svg]:mt-[2px] [&>svg]:shrink-0',
        MAU[color],
        className,
      )}
      {...props}
    >
      {icon ? cloneElement(icon, { 'aria-hidden': true }) : <Icon size={16} aria-hidden="true" />}
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('col-start-2 font-semibold', className)} {...props} />
}

function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('col-start-2 text-foreground', className)} {...props} />
}

/** `.ui-alert-actions`: flex gap 8, giữa dọc; cột 3 phủ dòng tiêu đề + mô tả → giữa như preview. */
function AlertActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-actions"
      className={cn('col-start-3 row-start-1 row-span-2 self-center flex gap-2', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertActions }
