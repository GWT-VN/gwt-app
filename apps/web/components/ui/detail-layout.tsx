import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { detail, detailAside, detailAsideDuoi, detailHeading, detailMain } from './notif-styles'

/**
 * DetailLayout — bố cục trang một bản ghi (README DetailLayout, tham chiếu Linear issue), giá trị `.ui-detail*` của
 * ds/nguon/bundle.css. Trên cùng luôn là `PageHeader` (bên gọi đặt, ngoài khung này).
 * - `chinh`: cột nội dung (mô tả, `Timeline`, `Composer`) — cột flex gap 20.
 * - `ben`: cột thuộc tính 280 (`PropertyList`), `<aside aria-label={nhanBen}>`, dính top 16.
 * - ≤960: một cột, thuộc tính lên TRÊN nội dung, hết dính. Chỉ đổi thứ tự hiển thị bằng CSS `order` — DOM giữ nội dung
 *   trước, nên trình đọc màn hình và phím Tab đi theo thứ tự logic.
 * - `benKhiHep="duoi"`: ≤960 thuộc tính ở DƯỚI nội dung (thứ tự DOM, không `order`) — dùng khi nội dung chính phải thấy
 *   trước trên điện thoại (trang ticket: lần lỗi mới nhất). Mặc định `"tren"` như Linear.
 * - Không 'use client': server component dùng thẳng.
 */
export function DetailLayout({
  chinh,
  ben,
  nhanBen = 'Thuộc tính',
  benKhiHep = 'tren',
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  chinh: ReactNode
  ben: ReactNode
  nhanBen?: string
  /** ≤960: cột thuộc tính lên trên (mặc định) hay xuống dưới nội dung. */
  benKhiHep?: 'tren' | 'duoi'
}) {
  return (
    <div
      data-slot="detail-layout"
      data-ben-hep={benKhiHep === 'duoi' ? 'duoi' : undefined}
      className={cn(detail, className)}
      {...props}
    >
      <div data-slot="detail-main" className={detailMain}>
        {chinh}
      </div>
      <aside data-slot="detail-aside" aria-label={nhanBen} className={benKhiHep === 'duoi' ? detailAsideDuoi : detailAside}>
        {ben}
      </aside>
    </div>
  )
}

/** `.ui-detail-heading`: tiêu đề khối trong cột chính (heading-xs 16/24 600), mặc định h2. */
export function DetailHeading({
  cap = 2,
  className,
  ...props
}: ComponentProps<'h2'> & { cap?: 2 | 3 | 4 }) {
  const H = `h${cap}` as 'h2'
  return <H data-slot="detail-heading" className={cn(detailHeading, className)} {...props} />
}
