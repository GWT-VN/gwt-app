import { cloneElement, type ComponentProps, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { Info, Warning, WarningCircle, X } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { banner, bannerMau, bannerText } from './feedback-styles'

/**
 * Banner — dải trạng thái của CẢ TRANG/APP (mất mạng, dữ liệu thử, bản mới), nằm trên cùng. Tự dựng (shadcn không có),
 * giá trị từ `.ui-banner*` của ds/nguon/bundle.css. Khác `Alert` (nằm trong nội dung, nói về một khối).
 * - `color`: info (mặc định) · warning · danger — nền, kẻ dưới, icon theo surface tương ứng. Icon mặc định Info ·
 *   Warning · WarningCircle tô (như preview); `icon` thay được (vd CloudSlash cho mất kết nối), tự `aria-hidden`.
 * - `role`: mặc định `status`; danger → `alert`; `role` truyền vào thắng (vd mất kết nối màu warning nhưng cần `alert`).
 * - `hanhDong`: tối đa MỘT nút (`Button size="sm"`). `onDong` có → nút ✕ "Ẩn thông báo" cuối dải.
 * - Đóng: TRƯỚC khi gọi `onDong` (bên gọi gỡ banner), focus dời sang phần tử focus được kế tiếp sau dải (không có thì
 *   phần tử ngay trước) — nút ✕ biến mất không thả focus về body.
 * - File thường (không 'use client'): server component đặt được Banner tĩnh; `onDong` là hàm → chỉ client truyền được.
 */
const ICON = {
  info: <Info />,
  warning: <Warning />,
  danger: <WarningCircle weight="fill" />,
} as const

const FOCUS_DUOC =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/** Phần tử focus được kế tiếp SAU `goc` theo thứ tự DOM (ngoài `goc`); không có → phần tử cuối đứng TRƯỚC. */
function focusKeTiep(goc: Element): HTMLElement | null {
  const ds = [...document.querySelectorAll<HTMLElement>(FOCUS_DUOC)].filter((el) => !goc.contains(el))
  const sau = ds.find((el) => goc.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
  return sau ?? ds.filter((el) => goc.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING).at(-1) ?? null
}

export function Banner({
  color = 'info',
  icon,
  hanhDong,
  onDong,
  role,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'color'> & {
  color?: keyof typeof bannerMau
  icon?: ReactElement<{ 'aria-hidden'?: boolean | 'true' | 'false' }>
  hanhDong?: ReactNode
  onDong?: () => void
}) {
  const dong = (e: MouseEvent<HTMLButtonElement>) => {
    const goc = e.currentTarget.closest('[data-slot="banner"]')
    if (goc) focusKeTiep(goc)?.focus()
    onDong?.()
  }
  return (
    <div
      data-slot="banner"
      data-color={color}
      role={role ?? (color === 'danger' ? 'alert' : 'status')}
      className={cn(banner, bannerMau[color], className)}
      {...props}
    >
      {cloneElement(icon ?? ICON[color], { 'aria-hidden': true })}
      <span data-slot="banner-text" className={bannerText}>
        {children}
      </span>
      {hanhDong}
      {onDong && (
        <Button variant="ghost" size="icon-sm" aria-label="Ẩn thông báo" onClick={dong}>
          <X />
        </Button>
      )}
    </div>
  )
}
