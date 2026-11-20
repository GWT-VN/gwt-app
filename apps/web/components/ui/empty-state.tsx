import type { ComponentProps, ReactNode } from 'react'
import { CloudSlash, LockSimple, MagnifyingGlass, Tray } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { empty, emptyActions, emptyDesc, emptyIcon, emptyTitle } from './feedback-styles'

/**
 * EmptyState — shadcn `Empty` gộp một component (biểu tượng · tiêu đề · mô tả · hành động), giá trị từ `.ui-empty*` của
 * ds/nguon/bundle.css. Bốn lý do trống (README), mỗi lý do một icon mặc định như preview:
 * - `that` chưa có dữ liệu (Tray) — nói thứ gì sẽ hiện ở đây + nút tạo (nếu có quyền);
 * - `loc` không khớp lọc (MagnifyingGlass) — nêu điều kiện đang lọc + "Xoá lọc";
 * - `loi` lỗi tải (CloudSlash, nền danger) — nói không tải được + "Thử lại", không đổ lỗi người dùng;
 * - `quyen` không có quyền (LockSimple) — nói cần quyền gì + hỏi ai.
 * `children` = nút hành động (Button sm), bọc trong nhóm căn giữa cách 8. Tiêu đề là heading thật (`capTieuDe`, mặc định 3 —
 * vùng trống nằm dưới tiêu đề trang/khối).
 */
const ICON = { that: Tray, loc: MagnifyingGlass, loi: CloudSlash, quyen: LockSimple } as const

export function EmptyState({
  icon,
  tieuDe,
  moTa,
  kieu = 'that',
  size = 'default',
  capTieuDe = 3,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'title'> & {
  /** Icon riêng (Phosphor, 20px tự áp) thay icon mặc định của `kieu`. */
  icon?: ReactNode
  tieuDe: ReactNode
  moTa?: ReactNode
  kieu?: keyof typeof ICON
  /** `sm`: đệm 24/16 — trong thẻ, hộp thông báo. */
  size?: 'default' | 'sm'
  capTieuDe?: 2 | 3 | 4 | 5 | 6
}) {
  const Icon = ICON[kieu]
  const H = `h${capTieuDe}` as 'h3'
  return (
    <div data-slot="empty-state" data-size={size} className={cn(empty, className)} {...props}>
      <div data-slot="empty-icon" data-color={kieu === 'loi' ? 'danger' : undefined} aria-hidden="true" className={emptyIcon}>
        {icon ?? <Icon />}
      </div>
      <H data-slot="empty-title" className={emptyTitle}>
        {tieuDe}
      </H>
      {moTa && (
        <p data-slot="empty-desc" className={emptyDesc}>
          {moTa}
        </p>
      )}
      {children && (
        <div data-slot="empty-actions" className={emptyActions}>
          {children}
        </div>
      )}
    </div>
  )
}
