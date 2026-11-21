'use client'
// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md

import { useEffect, useState, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { choTre, khongVien, skeleton, skeletonRow } from './feedback-styles'

/**
 * Skeleton — khung shadcn (`Skeleton`), giá trị từ khối Skeleton của ds/nguon/bundle.css (`.ui-skeleton*`).
 * - Luôn `aria-hidden`: khối chờ là hình, không có nghĩa. Vùng sắp được thay mang `aria-busy="true"`; câu "Đang tải…" đọc
 *   qua `VungDoc` (role="status") đứng NGOÀI vùng busy. Preview đặt cả hai trên một thẻ — DS tách (review đợt 1, F9).
 * - Hình (`shape`) + bậc bề rộng (`width`) qua `data-shape`/`data-w` như artifact — không gõ px lẻ.
 * - Nhấp nháy 1.4s; người dùng chọn giảm chuyển động → đứng yên.
 * - Lệch có chủ đích: thẻ `span` (shadcn `div`) — đặt được trong ô chữ, nút; `block` nên hình như div. `shape`/`width`,
 *   `SkeletonDong`, `VungDoc` là phần GWT thêm.
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
 * VungDoc — vùng đọc `role="status"` (ẩn nhìn) cho câu trạng thái "Đang tải…". Gắn vào DOM RỖNG rồi mới điền chữ (effect)
 * → trình đọc màn hình thấy vùng live có sẵn trước khi nội dung đổi, đọc được câu (vùng live sinh ra cùng lúc với chữ
 * thường bị bỏ qua). Không đặt trong vùng `aria-busy="true"` — trình đọc hoãn mọi thay đổi trong vùng busy, mà vùng chờ bị
 * gỡ khi dữ liệu về → câu không bao giờ được đọc. Lý do file này là 'use client'.
 */
export function VungDoc({ chu }: { chu: string }) {
  const [hien, setHien] = useState('')
  // eslint-disable-next-line react-hooks/set-state-in-effect -- cố ý hai nhịp: vùng live gắn RỖNG trước, nhịp sau mới điền chữ (xem trên)
  useEffect(() => setHien(chu), [chu])
  return (
    <span role="status" data-slot="vung-doc" className="sr-only">
      {hien}
    </span>
  )
}

/**
 * SkeletonDong — `so` dòng bảng đang tải, đúng hình dòng ticket của prototype (badge · tên · mô tả · avatar).
 * - Khối dòng chờ mang `aria-busy="true"` (nội dung sắp được thay) và hiện sau 300ms (`choTre`) để tải nhanh không nháy.
 * - Câu `nhan` đọc qua `VungDoc` đứng NGOÀI khối busy (anh em liền trước).
 * - Đặt SkeletonDong đúng chỗ dữ liệu sẽ hiện; đừng bọc nó trong một vùng `aria-busy="true"` khác (vùng đọc bị hoãn).
 * Dòng thật khi dữ liệu về dùng chung khung `skeletonRow` (feedback-styles.ts) → không nhảy chỗ.
 */
export function SkeletonDong({
  so,
  nhan = 'Đang tải danh sách',
  className,
  ...props
}: ComponentProps<'div'> & { so: number; nhan?: string }) {
  return (
    <>
      <VungDoc chu={nhan} />
      <div aria-busy="true" data-slot="skeleton-dong" className={cn(khongVien, choTre, className)} {...props}>
        {Array.from({ length: so }, (_, i) => (
          <div key={i} data-slot="skeleton-row" aria-hidden="true" className={skeletonRow}>
            <Skeleton shape="pill" />
            <Skeleton width="1/3" />
            <Skeleton />
            <Skeleton shape="circle" />
          </div>
        ))}
      </div>
    </>
  )
}
