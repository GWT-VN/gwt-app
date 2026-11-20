import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp, Minus } from '@phosphor-icons/react/ssr'
import { dinhDangSo } from '@/lib/dinh-dang-so'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'
import { choTre, kpiLabel, kpiValue, stat, statDelta, statFoot, statGrid, statLink, statUnit } from './feedback-styles'

/**
 * StatCard — thẻ số liệu chính của một khu (màn Tổng quan); shadcn `Card` + class `.ui-stat*`/`.ui-kpi-*` của
 * ds/nguon/bundle.css.
 * - Số định dạng vi-VN (`dinhDangSo`: 1250000 → "1.250.000"), `tabular-nums`; đơn vị chữ nhỏ cùng chân chữ.
 * - Biến động: màu theo NGHĨA, không theo chiều mũi tên — `tot: 'giam'` (vd "Quá hạn") thì giảm là tốt (xanh), tăng là
 *   xấu (đỏ); không khai `tot` hoặc không đổi → xám. Mũi tên + chữ thấy được `aria-hidden`; trình đọc màn hình đọc một
 *   câu đủ: "Tăng 3 so với hôm qua, cần chú ý" / "Giảm 1 so với hôm qua, tốt" / "Không đổi so với tuần trước".
 * - `giaTri = null` → "—" + `trong` (lý do, vd "tính năng Đợt 2") — không hiện 0.
 * - `href` → cả thẻ là liên kết (next/link): hover viền đậm, mũi tên chân dịch 2px, focus ring.
 * - `dangTai` → thẻ `role="status"` `aria-busy="true"` "Đang tải: <nhãn>" + khung chờ cùng hình, hiện sau 300ms.
 */
type BienDong = {
  /** Có dấu: dương = tăng, âm = giảm, 0 = không đổi. */
  so: number
  /** Đơn vị của mức đổi ("%", "phút"…). */
  donVi?: string
  /** "so với hôm qua", "so với tháng trước"… */
  soVoi: string
  /** Chiều nào là TỐT. Không khai → không tô màu nghĩa. */
  tot?: 'tang' | 'giam'
}

/** "12" + "%" → "12%"; "8" + "phút" → "8 phút". */
const kemDonVi = (so: string, donVi?: string) => (!donVi ? so : donVi === '%' ? `${so}%` : `${so} ${donVi}`)

function nghia({ so, tot }: BienDong): 'tot' | 'xau' | undefined {
  if (!tot || so === 0) return undefined
  return (so > 0) === (tot === 'tang') ? 'tot' : 'xau'
}

function Delta({ bd }: { bd: BienDong }) {
  const n = nghia(bd)
  const muc = kemDonVi(dinhDangSo(Math.abs(bd.so)), bd.donVi)
  const cau =
    bd.so === 0
      ? `Không đổi ${bd.soVoi}`
      : `${bd.so > 0 ? 'Tăng' : 'Giảm'} ${muc} ${bd.soVoi}${n === 'tot' ? ', tốt' : n === 'xau' ? ', cần chú ý' : ''}`
  const Mui = bd.so > 0 ? ArrowUp : bd.so < 0 ? ArrowDown : Minus
  return (
    <span data-slot="stat-delta" data-nghia={n} className={statDelta}>
      <b aria-hidden="true">
        <Mui />
        {bd.so !== 0 && muc}
      </b>
      <span aria-hidden="true">{bd.so === 0 ? `không đổi ${bd.soVoi}` : bd.soVoi}</span>
      <span className="sr-only">{cau}</span>
    </span>
  )
}

export function StatCard({
  nhan,
  giaTri,
  donVi,
  bienDong,
  trong,
  chan,
  href,
  dangTai = false,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  nhan: string
  giaTri: number | null
  donVi?: string
  bienDong?: BienDong
  /** Lý do chưa có số (khi `giaTri = null`). */
  trong?: ReactNode
  /** Chữ chân thẻ có liên kết, vd "Xem 12 ticket". */
  chan?: string
  href?: string
  dangTai?: boolean
}) {
  if (dangTai)
    return (
      <div data-slot="stat-card" role="status" aria-busy="true" className={cn(stat, choTre, className)} {...props}>
        <span className="sr-only">Đang tải: {nhan}</span>
        <Skeleton width="1/2" />
        <Skeleton shape="title" width="1/3" />
        <Skeleton width="2/3" />
      </div>
    )
  const ruot = (
    <>
      <span data-slot="stat-label" className={kpiLabel}>
        {nhan}
      </span>
      {/* Khoảng trắng giữa số và đơn vị: flex bỏ qua khi vẽ (gap 4 lo), trình đọc màn hình đọc "42 phút" không dính. */}
      <span data-slot="stat-value" className={kpiValue}>
        {giaTri === null ? '—' : dinhDangSo(giaTri)}
        {giaTri !== null && donVi && (
          <>
            {' '}
            <span className={statUnit}>{donVi}</span>
          </>
        )}
      </span>
      {giaTri === null && trong ? (
        <span data-slot="stat-delta" className={statDelta}>
          {trong}
        </span>
      ) : (
        bienDong && <Delta bd={bienDong} />
      )}
      {chan && (
        <span data-slot="stat-foot" className={statFoot}>
          {chan}
          <ArrowRight aria-hidden="true" />
        </span>
      )}
    </>
  )
  return href ? (
    // Thuộc tính div (data-*, aria-*, id) dùng được cho thẻ <a> của Link.
    <Link data-slot="stat-card" href={href} className={cn(stat, statLink, className)} {...(props as Omit<ComponentProps<'a'>, 'href'>)}>
      {ruot}
    </Link>
  ) : (
    <div data-slot="stat-card" className={cn(stat, className)} {...props}>
      {ruot}
    </div>
  )
}

/** `.ui-stat-grid`: lưới tự đổ cột, ô tối thiểu 200, cách 12. */
export function StatGrid({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="stat-grid" className={cn(statGrid, className)} {...props} />
}
