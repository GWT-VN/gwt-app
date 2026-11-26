import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { LuotThang } from '@/app/actions'
import { ngayDayDu, oCuaThang, thangHienTai, thangKe } from '@/lib/lichThang'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function tenThang(thang: string): string {
  const [y, m] = thang.split('-')
  return `Tháng ${Number(m)}/${y}`
}


/**
 * Calendar bảo trì theo THÁNG — nhìn tháng này có bao nhiêu lượt, rơi ngày nào.
 * Server component: lưới tĩnh + điều hướng bằng Link (`?thang=YYYY-MM&ngay=YYYY-MM-DD`).
 * Tuần bắt đầu Thứ 2. Chip: xanh=đã làm · đỏ=quá hạn · hổ phách=chưa làm.
 *
 * CEO báo hai lỗi ở bản trước: ô ngày không bấm được (nhìn thấy số mà không xem
 * được chi tiết) và không có đường về tháng hiện tại. Nay mỗi ô ngày là một Link
 * mở danh sách chuyến của đúng ngày đó ngay bên dưới, và có nút "Tháng này".
 */
export function LichBaoTriThang({
  thang,
  rows,
  ngay,
}: {
  thang: string
  rows: LuotThang[]
  ngay?: string
}) {
  const theoNgay = new Map<number, LuotThang[]>()
  for (const r of rows) {
    if (!r.due_date) continue
    const d = Number(r.due_date.slice(8, 10))
    const a = theoNgay.get(d) ?? []
    a.push(r); theoNgay.set(d, a)
  }

  const o = oCuaThang(thang)
  const luotCuaNgay = ngay ? rows.filter((r) => r.due_date === ngay) : []

  const chip = (r: LuotThang) => {
    const done = !!r.completed_at
    const qua = r.tinh_trang === 'QUÁ HẠN'
    const mau = done ? 'bg-(--color-background-success-surface) text-(--color-text-success)' : qua ? 'bg-(--color-background-danger-surface) text-(--color-text-danger)' : 'bg-(--color-background-warning-surface) text-(--color-text-warning)'
    return (
      <div key={r.visit_id} className={`truncate rounded px-1 py-0.5 text-xs ${mau}`} title={`${r.customer_name ?? '—'} · lần ${r.lan_thu ?? '?'}${done ? ' · đã làm' : ''}`}>
        {r.customer_name ?? r.bo_may ?? '—'}{r.lan_thu ? ` (${r.lan_thu})` : ''}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="icon-sm"><Link href={`/bao-tri?tt=lich&thang=${thangKe(thang, -1)}`} aria-label="Tháng trước">←</Link></Button>
          <h2 className="min-w-24 text-center text-sm font-medium text-foreground">{tenThang(thang)}</h2>
          <Button asChild variant="outline" size="icon-sm"><Link href={`/bao-tri?tt=lich&thang=${thangKe(thang, 1)}`} aria-label="Tháng sau">→</Link></Button>
          <Link
            href={`/bao-tri?tt=lich&thang=${thangHienTai()}`}
            className="rounded-lg border border-border bg-card px-2.5 py-1 text-sm hover:bg-muted"
          >
            Tháng này
          </Link>
        </div>
        <span className="text-sm text-muted-foreground">{rows.length} lượt trong tháng</span>
      </div>

      <div role="region" aria-label="Lịch tháng bảo trì"
        className="@container overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7">
          {THU.map((t) => (
            <div key={t} className={`border-b px-1 py-2 text-center text-xs font-medium ${t === 'CN' ? 'text-(--color-text-danger)' : t === 'T7' ? 'text-(--color-text-info)' : 'text-muted-foreground'}`}>{t}</div>
          ))}
          {o.map((d, i) => {
            if (!d) return <div key={i} className={`min-w-0 min-h-13 @min-[42rem]:min-h-[5.5rem] border-b border-r p-1 ${i % 7 === 6 ? 'bg-muted/40' : ''}`} />
            const luot = theoNgay.get(d) ?? []
            const nd = ngayDayDu(thang, d)
            const dangChon = ngay === nd
            return (
              <Link
                key={i}
                href={`/bao-tri?tt=lich&thang=${thang}&ngay=${nd}`}
                scroll={false}
                aria-current={dangChon ? 'date' : undefined}
                aria-label={`Ngày ${d}, ${luot.length} lượt bảo trì`}
                className={
                  `block min-w-0 min-h-13 @min-[42rem]:min-h-[5.5rem] border-b border-r p-1 align-top hover:bg-muted ` +
                  (dangChon ? 'bg-accent ring-2 ring-inset ring-ring ' : i % 7 === 6 ? 'bg-muted/40 ' : '')
                }
              >
                <div className="flex flex-col items-center gap-1 @min-[42rem]:flex-row @min-[42rem]:justify-between">
                  <span className="text-xs text-muted-foreground">{d}</span>
                  {luot.length > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5">{luot.length}</span>}
                </div>
                <div className="mt-0.5 hidden space-y-0.5 @min-[42rem]:block">
                  {luot.slice(0, 4).map(chip)}
                  {luot.length > 4 && <div className="text-xs text-muted-foreground">+{luot.length - 4} nữa</div>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 align-middle" /> đã làm ·
        <span className="inline-block w-2 h-2 rounded-full bg-red-400 align-middle ml-2" /> quá hạn ·
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 align-middle ml-2" /> chưa làm ·
        <span className="ml-2">bấm một ngày để xem chi tiết</span>
      </p>

      {ngay && (
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <h3 className="px-4 py-3 border-b border-border text-sm font-semibold text-foreground">
            Ngày {hienNgay(ngay)} · {luotCuaNgay.length} lượt
          </h3>
          {luotCuaNgay.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Không có lượt bảo trì nào ngày này.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {luotCuaNgay.map((r) => (
                <li key={r.visit_id} className="px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">{r.customer_name ?? r.bo_may ?? '—'}</span>
                  {r.lan_thu ? <span className="text-muted-foreground"> · lần {r.lan_thu}</span> : null}
                  {r.bo_may && r.customer_name ? <span className="text-muted-foreground"> · {r.bo_may}</span> : null}
                  {r.completed_at
                    ? <span className="ml-2 text-xs text-emerald-700">✓ đã làm</span>
                    : r.tinh_trang === 'QUÁ HẠN'
                      ? <span className="ml-2 text-xs text-red-700">quá hạn</span>
                      : <span className="ml-2 text-xs text-amber-600">chưa làm</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
