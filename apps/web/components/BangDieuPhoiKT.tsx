import Link from 'next/link'
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

  return (
    <div role="region" aria-label="Bảng điều phối kỹ thuật" tabIndex={0} className="overflow-x-auto rounded-xl border border-border bg-card focus-visible:outline-ring">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted">
            <th className="sticky left-0 bg-muted z-10 text-left font-medium text-muted-foreground px-3 py-2 border-b border-r min-w-32">Kỹ thuật</th>
            {days.map((d, i) => {
              const cn = i === 6
              return (
                <th key={d} className={`px-2 py-2 border-b text-center font-medium min-w-28 ${cn ? 'text-(--color-text-danger)' : 'text-muted-foreground'}`}>
                  {THU[i]}<div className="text-[10px] font-normal text-muted-foreground">{d.slice(8)}/{d.slice(5, 7)}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {hang.map((h) => (
            <tr key={h.id} className="align-top">
              <td className="sticky left-0 bg-card z-10 px-3 py-2 border-b border-r font-medium text-foreground">{h.ten}</td>
              {days.map((d) => {
                const list = o(h.id, d)
                return (
                  <td key={d} className="px-1.5 py-1.5 border-b border-l align-top">
                    <div className="space-y-1">
                      {list.map((r) => (
                        <Link key={r.id} href={`/ky-thuat/lich?view=list&tu=${d}&den=${d}`}
                          className={`block rounded border px-1.5 py-1 ${MAU_TT[r.trang_thai] ?? ''}`}>
                          <span className="font-medium">{r.ten_khach ?? 'khách'}</span>
                          {r.viec.length > 0 && <span className="text-[10px] text-muted-foreground"> · {r.viec.length} việc</span>}
                          {r.tinh && <div className="text-[10px] text-muted-foreground truncate">{r.tinh}</div>}
                        </Link>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
          {hang.length === 0 && (
            <tr><td colSpan={days.length + 1} className="px-3 py-6 text-center text-muted-foreground">Chưa có kỹ thuật nào hoạt động.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
