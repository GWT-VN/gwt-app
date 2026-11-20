import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { propsEmpty, propsList, propsTerm, propsTitle, propsValue } from './detail-styles'

/**
 * PropertyList — nhãn ↔ giá trị của một bản ghi, giá trị từ `.ui-props*` của ds/nguon/bundle.css (README PropertyList).
 * - `<dl>` thật; `PropertyRow` = một cặp `<dt>`/`<dd>` (con trực tiếp của dl — lưới 2 cột cần thế).
 * - `tieuDe` → `<h3>` tiêu đề nhóm đứng trước dl (nhiều nhóm = nhiều PropertyList liền nhau).
 * - `layout="stack"`: 1 cột, nhãn trên giá trị — cột hẹp / thẻ xem nhanh.
 * - Giá trị rỗng (null / undefined / false / chuỗi trống) → "Chưa có" màu nhạt, không để ô trắng. Số 0 là giá trị.
 * - Giá trị sửa tại chỗ: đặt `InlineEdit`/`Select`/`Combobox` của DS làm con của `PropertyRow` (ô sửa tự mang tên
 *   "Sửa <nhãn>").
 */
export function PropertyList({
  tieuDe,
  layout,
  className,
  children,
  ...props
}: ComponentProps<'dl'> & { tieuDe?: ReactNode; layout?: 'stack' }) {
  const dl = (
    <dl data-slot="props" data-layout={layout} className={cn(propsList, className)} {...props}>
      {children}
    </dl>
  )
  if (!tieuDe) return dl
  return (
    <>
      <h3 data-slot="props-title" className={propsTitle}>
        {tieuDe}
      </h3>
      {dl}
    </>
  )
}

export function PropertyRow({ nhan, children }: { nhan: ReactNode; children?: ReactNode }) {
  const rong = children === null || children === undefined || children === false || children === ''
  return (
    <>
      <dt className={propsTerm}>{nhan}</dt>
      <dd className={propsValue}>
        {rong ? (
          <span data-slot="props-empty" className={propsEmpty}>
            Chưa có
          </span>
        ) : (
          children
        )}
      </dd>
    </>
  )
}
