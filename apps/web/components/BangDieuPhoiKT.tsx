import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { thGhim } from '@/components/ui/table-styles'
import { cn } from '@/lib/utils'
import type { KyThuat, LichKyThuatRow } from '@/app/actions'

const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MAU_TT: Record<string, string> = {
  hen: 'bg-(--color-background-info-surface) text-(--color-text-info) border-(--color-border-info-surface)',
  xong: 'bg-(--color-background-success-surface) text-(--color-text-success) border-(--color-border-success-surface)',
  huy: 'bg-muted text-muted-foreground border-border line-through',
}

/**
 * Bảng điều phối: mỗi kỹ thuật 1 hàng, 7 cột là các ngày trong tuần, ô là chuyến.
 * Nhìn nhanh tải & khoảng trống để cân việc. Hàng "Chưa gán KT" gom chuyến chưa có người.
 * Thuần hiển thị — điều hướng tuần + link gán do trang cha lo.
 */
export function BangDieuPhoiKT({ kts, rows, days }: { kts: KyThuat[]; rows: LichKyThuatRow[]; days: string[] }) {
  // gom: key = `${ky_thuat_id|'_'}|${ngay}`
  const oMap = new Map<string, LichKyThuatRow[]>()
  for (const r of rows) {
    const k = `${r.ky_thuat_id ?? '_'}|${r.ngay}`
    const a = oMap.get(k) ?? []; a.push(r); oMap.set(k, a)
  }
  const coChuaGan = rows.some((r) => !r.ky_thuat_id)
  const hang: { id: string; ten: string }[] = [
    ...kts.map((k) => ({ id: k.id, ten: k.ten })),
    ...(coChuaGan ? [{ id: '_', ten: 'Chưa gán KT' }] : []),
  ]

  const o = (ktId: string, ngay: string) => oMap.get(`${ktId}|${ngay}`) ?? []

  // Lưới người × ngày (không phải danh sách bản ghi) → không khuôn F; chỉ đồng bộ kiểu ô Table DS
  // (docs/rework/2026-11-27-khuon-f-huong-dan-agent.md mục 5).
  return (
    <TableWrap vien tabIndex={0} role="region" aria-label="Bảng điều phối kỹ thuật">
      <Table aria-label="Điều phối kỹ thuật theo tuần">
        <TableHeader>
          <TableRow>
            <TableHead className={cn(thGhim, 'z-3')}>Kỹ thuật</TableHead>
            {days.map((d, i) => (
              <TableHead key={d} className={i === 6 ? 'text-(--color-text-danger)' : undefined}>
                {THU[i]} <span className="text-muted-foreground">{d.slice(8)}/{d.slice(5, 7)}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hang.map((h) => (
            <TableRow key={h.id}>
              <TableCell ghim className="align-top font-medium">{h.ten}</TableCell>
              {days.map((d) => (
                <TableCell key={d} className="align-top">
                  <div className="flex flex-col gap-1 py-1">
                    {o(h.id, d).map((r) => (
                      <Link key={r.id} href={`/ky-thuat/lich?view=list&tu=${d}&den=${d}`}
                        className={cn('block rounded-sm border px-1.5 py-1 text-xs', MAU_TT[r.trang_thai])}>
                        <span className="font-medium">{r.ten_khach ?? 'khách'}</span>
                        {r.viec.length > 0 && <span className="text-muted-foreground"> · {r.viec.length} việc</span>}
                        {r.tinh && <span className="block truncate text-muted-foreground">{r.tinh}</span>}
                      </Link>
                    ))}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
          {hang.length === 0 && (
            <TableRow>
              <TableCell colSpan={days.length + 1} className="text-center text-muted-foreground">Chưa có kỹ thuật nào hoạt động.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableWrap>
  )
}
