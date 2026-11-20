import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { choTre, khongVien, skeleton, skeletonRow } from './feedback-styles'

/**
 * Skeleton — khung shadcn (`Skeleton`), giá trị từ khối Skeleton của ds/nguon/bundle.css (`.ui-skeleton*`).
 * - Luôn `aria-hidden`: khối chờ là hình, không có nghĩa — chữ "Đang tải…" nằm ở VÙNG bọc (`role="status"` +
 *   `aria-busy="true"`), như thẻ StatCard đang tải của preview.
 * - Hình (`shape`) + bậc bề rộng (`width`) qua `data-shape`/`data-w` như artifact — không gõ px lẻ.
 * - Nhấp nháy 1.4s; người dùng chọn giảm chuyển động → đứng yên.
 * - Nút đang chạy: KHÔNG dựng ở đây — dùng `<Button loading>` (giữ bề rộng, chữ ẩn, vòng xoay giữa, chặn bấm lần 2).
 */
export function Skeleton({
  shape,
  width,
  className,
  ...props
}: ComponentProps<'span'> & {
  /** Mặc định dòng chữ cao 12. `circle` = avatar 22 · `pill` = badge 60×20 · `title` = dòng tiêu đề cao 20. */
  shape?: 'circle' | 'pill' | 'title'
  width?: '1/4' | '1/3' | '1/2' | '2/3' | '3/4'
}) {
  return (
    <span
      data-slot="skeleton"
      data-shape={shape}
      data-w={width}
      aria-hidden="true"
      className={cn(skeleton, className)}
      {...props}
    />
  )
}

/**
 * SkeletonDong — `so` dòng bảng đang tải, đúng hình dòng ticket của prototype (badge · tên · mô tả · avatar). Vùng bọc
 * `role="status"` `aria-busy="true"` có chữ đọc được (`nhan`); hiện sau 300ms (`choTre`) để tải nhanh không nháy.
 * Dòng thật khi dữ liệu về dùng chung khung `skeletonRow` (feedback-styles.ts) → không nhảy chỗ.
 */
export function SkeletonDong({
  so,
  nhan = 'Đang tải danh sách',
  className,
  ...props
}: ComponentProps<'div'> & { so: number; nhan?: string }) {
  return (
    <div role="status" aria-busy="true" data-slot="skeleton-dong" className={cn(khongVien, choTre, className)} {...props}>
      <span className="sr-only">{nhan}</span>
      {Array.from({ length: so }, (_, i) => (
        <div key={i} data-slot="skeleton-row" aria-hidden="true" className={skeletonRow}>
          <Skeleton shape="pill" />
          <Skeleton width="1/3" />
          <Skeleton />
          <Skeleton shape="circle" />
        </div>
      ))}
    </div>
  )
}
