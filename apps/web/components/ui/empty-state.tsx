import type { ComponentProps, ReactNode } from 'react'
import { CloudSlash, LockSimple, MagnifyingGlass, Tray } from '@phosphor-icons/react/ssr'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

/**
 * EmptyState — mẫu ghép GWT trên khung shadcn `Empty` (empty.tsx): Empty › EmptyHeader › EmptyMedia icon · EmptyTitle ·
 * EmptyDescription, rồi EmptyContent (hành động). Tên giữ theo artifact (R22). Bốn lý do trống (README), mỗi lý do một
 * icon mặc định như preview:
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
    <Empty data-size={size} className={className} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon" data-color={kieu === 'loi' ? 'danger' : undefined} aria-hidden="true">
          {icon ?? <Icon />}
        </EmptyMedia>
        <EmptyTitle asChild>
          <H>{tieuDe}</H>
        </EmptyTitle>
        {moTa && <EmptyDescription>{moTa}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}
