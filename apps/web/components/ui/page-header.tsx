import type { ReactNode } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/ssr'
import { Button } from './button'
import {
  pageHeader,
  pageHeaderActions,
  pageHeaderMain,
  pageHeaderMeta,
  pageHeaderNav,
  pageHeaderText,
  pageHeaderTitle,
  pageHeaderTop,
  pageHeaderViTri,
} from './detail-styles'
import { Tooltip } from './tooltip'

/** Chuyển bản ghi ‹ › theo thứ tự danh sách vừa mở (giữ lọc/sắp xếp) — màn giữ danh sách, PageHeader chỉ vẽ. */
export type ChuyenBanGhi = {
  /** Loại bản ghi viết hoa đầu, vào tên nút: "Ticket" → "Ticket trước" / "Ticket sau". */
  loai: string
  /** Vị trí 1-based trong danh sách. Đầu (1) / cuối (= tong) → nút tương ứng tắt. */
  viTri: number
  tong: number
  onTruoc(): void
  onSau(): void
}

/**
 * PageHeader — đầu trang một bản ghi, giá trị từ `.ui-page-header*` của ds/nguon/bundle.css (README PageHeader).
 * - Hàng trên (chỉ khi có `duongDan` hoặc `chuyen`): `Breadcrumb` lấp chỗ + "3 / 19" + ‹ › (`Button ghost icon-sm`).
 *   "3 / 19" đọc thành "Ticket thứ 3 trong 19" (chữ ẩn nhìn — aria-label trên span trơn không được đọc ổn định).
 *   Tooltip của ‹ › là mô tả thêm, không lặp tên nút (luật NGUON).
 * - `tieuDe` là `<h1>`, tối đa 2 dòng rồi …. `meta`: mỗi mục một span, ngăn bằng "·" (không "·" mồ côi đầu dòng).
 * - `hanhDong`: tối đa 2 nút chữ + ⋯ (`DropdownMenu`), con TRỰC TIẾP là nút (trigger asChild) để ≤640 chia đôi bề ngang.
 * - Server component được (không state); `chuyen` mang hàm nên chỉ truyền từ client component.
 */
export function PageHeader({
  duongDan,
  tieuDe,
  meta,
  hanhDong,
  chuyen,
}: {
  duongDan?: ReactNode
  tieuDe: ReactNode
  meta?: ReactNode[]
  hanhDong?: ReactNode
  chuyen?: ChuyenBanGhi
}) {
  return (
    <header data-slot="page-header" className={pageHeader}>
      {(duongDan || chuyen) && (
        <div data-slot="page-header-top" className={pageHeaderTop}>
          {duongDan ?? <span />}
          {chuyen && (
            <div data-slot="page-header-nav" className={pageHeaderNav}>
              <span className={pageHeaderViTri}>
                <span aria-hidden="true">
                  {chuyen.viTri} / {chuyen.tong}
                </span>
                <span className="sr-only">
                  {chuyen.loai} thứ {chuyen.viTri} trong {chuyen.tong}
                </span>
              </span>
              <Tooltip content={`Mở ${chuyen.loai.toLocaleLowerCase('vi')} trước trong danh sách`}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${chuyen.loai} trước`}
                  disabled={chuyen.viTri <= 1}
                  onClick={chuyen.onTruoc}
                >
                  <CaretLeft aria-hidden="true" />
                </Button>
              </Tooltip>
              <Tooltip content={`Mở ${chuyen.loai.toLocaleLowerCase('vi')} sau trong danh sách`}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${chuyen.loai} sau`}
                  disabled={chuyen.viTri >= chuyen.tong}
                  onClick={chuyen.onSau}
                >
                  <CaretRight aria-hidden="true" />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      )}
      <div data-slot="page-header-main" className={pageHeaderMain}>
        <div className={pageHeaderText}>
          <h1 data-slot="page-header-title" className={pageHeaderTitle}>
            {tieuDe}
          </h1>
          {meta && meta.length > 0 && (
            <div data-slot="page-header-meta" className={pageHeaderMeta}>
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </div>
        {hanhDong && (
          <div data-slot="page-header-actions" className={pageHeaderActions}>
            {hanhDong}
          </div>
        )}
      </div>
    </header>
  )
}
