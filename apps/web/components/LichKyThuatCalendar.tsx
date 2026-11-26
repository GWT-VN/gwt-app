import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { LichKyThuatRow } from '@/app/actions'

const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function thangKe(thang: string, buoc: number): string {
  const [y, m] = thang.split('-').map(Number)
  const idx = y * 12 + (m - 1) + buoc
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`
}
function tenThang(thang: string): string {
  const [y, m] = thang.split('-')
  return `Tháng ${Number(m)}/${y}`
}

/**
 * Calendar lịch KỸ THUẬT theo tháng — nhìn tháng này có bao nhiêu chuyến, ngày nào.
 * Server component. Tuần bắt đầu Thứ 2. Chip: xanh=xong · xám gạch=huỷ · sky=đã hẹn.
 *
 * 🔴 **CEO báo 24/08: "bảng calendar ko tick vào task đc".** Đúng — chip ở đây trước là
 * `<div>` trơn, không bấm được, mà nút đổi trạng thái (Xong / Huỷ / Xoá) chỉ có ở view
 * **Danh sách**. Nhìn thấy chuyến mà không làm gì được với nó.
 *
 * Cách vá: KHÔNG bê nút bấm vào đây (calendar là server component, nhét nút vào là phải
 * đổi cả sang client và đẻ bản thứ hai của mớ nút đó — đúng thứ dễ lệch nhau về sau).
 * Thay vào đó **mỗi chip là một link về đúng NGÀY ấy ở view Danh sách**, giữ nguyên bộ
 * lọc kỹ thuật + loại việc đang chọn. Bấm chip → thấy đúng chuyến đó kèm đủ nút.
 */
export function LichKyThuatCalendar(
  { thang, rows, kt, loai, tinh }: { thang: string; rows: LichKyThuatRow[]; kt?: string; loai?: string; tinh?: string }
) {
  const [y, m] = thang.split('-').map(Number)
  const soNgay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const thu1 = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7

  const theoNgay = new Map<number, LichKyThuatRow[]>()
  for (const r of rows) {
    const d = Number(r.ngay.slice(8, 10))
    const a = theoNgay.get(d) ?? []; a.push(r); theoNgay.set(d, a)
  }
  const o: (number | null)[] = []
  for (let i = 0; i < thu1; i++) o.push(null)
  for (let d = 1; d <= soNgay; d++) o.push(d)
  while (o.length % 7 !== 0) o.push(null)

  const loc = { ...(kt ? { kt } : {}), ...(loai ? { loai } : {}), ...(tinh ? { tinh } : {}) }
  const qs = (t: string) => new URLSearchParams({ view: 'calendar', thang: t, ...loc })
  /** Về view Danh sách, thu hẹp đúng MỘT ngày — chỗ duy nhất có nút đổi trạng thái. */
  const linkNgay = (d: number) => {
    const ngay = `${thang}-${String(d).padStart(2, '0')}`
    return `/ky-thuat/lich?${new URLSearchParams({
      view: 'list', tu: ngay, den: ngay, ...loc,
    })}`
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon-sm"><Link href={`/ky-thuat/lich?${qs(thangKe(thang, -1))}`} aria-label="Tháng trước">←</Link></Button>
          <h2 className="min-w-24 text-center text-sm font-medium text-foreground">{tenThang(thang)}</h2>
          <Button asChild variant="outline" size="icon-sm"><Link href={`/ky-thuat/lich?${qs(thangKe(thang, 1))}`} aria-label="Tháng sau">→</Link></Button>
        </div>
        <span className="text-sm text-muted-foreground">{rows.length} chuyến trong tháng</span>
      </div>

      <div role="region" aria-label="Lịch tháng kỹ thuật"
        className="@container overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7">
          {THU.map((t) => (
            <div key={t} className={`border-b px-1 py-2 text-center text-xs font-medium ${t === 'CN' ? 'text-(--color-text-danger)' : t === 'T7' ? 'text-(--color-text-info)' : 'text-muted-foreground'}`}>{t}</div>
          ))}
          {o.map((d, i) => {
            const list = d ? theoNgay.get(d) ?? [] : []
            return (
              <div key={i} className={`min-w-0 min-h-13 @min-[42rem]:min-h-[5.5rem] border-b border-r p-1 align-top ${i % 7 === 6 ? 'bg-muted/40' : ''}`}>
                {d && (
                  <>
                    <div className="flex flex-col items-center gap-1 @min-[42rem]:flex-row @min-[42rem]:justify-between">
                      <span className="text-xs text-muted-foreground">{d}</span>
                      {list.length > 0 && (
                        <Link href={linkNgay(d)} prefetch={false}
                          aria-label={`${list.length} chuyến ngày ${d}`} className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 hover:opacity-80">{list.length}</Link>
                      )}
                    </div>
                    <div className="mt-0.5 hidden space-y-0.5 @min-[42rem]:block">
                      {list.slice(0, 4).map((r) => (
                        <Link key={r.id} href={linkNgay(d)} prefetch={false}
                          className={`block truncate rounded px-1 py-0.5 text-xs hover:ring-1 hover:ring-ring ${r.trang_thai === 'xong' ? 'bg-(--color-background-success-surface) text-(--color-text-success)' : r.trang_thai === 'huy' ? 'bg-muted text-muted-foreground line-through' : 'bg-(--color-background-info-surface) text-(--color-text-info)'}`}
                          title={`${r.ten_ky_thuat ?? ''} · ${r.ten_khach ?? r.dia_chi ?? ''} — bấm để mở ngày này ở Danh sách`}>
                          {r.ten_ky_thuat ?? 'KT'}{r.ten_khach ? ` · ${r.ten_khach}` : ''}
                        </Link>
                      ))}
                      {list.length > 4 && (
                        <Link href={linkNgay(d)} prefetch={false} className="block text-xs text-muted-foreground underline">+{list.length - 4} nữa</Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
