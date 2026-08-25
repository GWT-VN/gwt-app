'use client'

/**
 * Lịch tháng khu Việc — việc xếp vào ô ngày theo HẠN.
 *
 * Lưới tháng dùng `lib/lichThang.ts` (đã có test): phần đệm đầu tuần, tháng
 * nhuận, nhảy năm là số học thuần và là chỗ dễ sai nhất.
 *
 * ── Ngày lấy ở đâu ────────────────────────────────────────────────────────
 * KHÔNG tự suy ngày từ `due_at` ở đây. DB chạy giờ UTC, `due_at` là timestamptz,
 * nên quy về ngày phải làm ở một chỗ DUY NHẤT với đúng một múi giờ — RPC trả sẵn
 * `ngay` đã đổi sang `Asia/Ho_Chi_Minh`. Suy lại ở client là mở đường cho cùng
 * một việc nằm hai ngày khác nhau giữa lịch và danh sách.
 * `hom_nay` cũng lấy từ DB, không đọc đồng hồ máy người dùng.
 */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type LichThang as Du, type ViecLich, type NenTang } from '@/app/work/actions'
import { oCuaThang, ngayDayDu, thangKe } from '@/lib/lichThang'
import { ChiTietViec } from './ChiTietViec'
import { ChongAvatar, MAU_UT_VAR, MAU_TRANG_THAI } from './ui'

const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function tenThang(thang: string): string {
  const [y, m] = thang.split('-')
  return `Tháng ${Number(m)}/${y}`
}

export function LichThang({ du, nenTang, chiToi }: {
  du: Du
  nenTang: NenTang
  chiToi: boolean
}) {
  const router = useRouter()
  const [mo, setMo] = useState<number | null>(null)

  const o = oCuaThang(du.thang)
  const theoNgay = new Map<string, ViecLich[]>()
  for (const v of du.viec) {
    const a = theoNgay.get(v.ngay) ?? []
    a.push(v)
    theoNgay.set(v.ngay, a)
  }

  const qs = (t: string) => `/work/lich?thang=${t}${chiToi ? '' : '&tatca=1'}`

  return (
    <div className="space-y-4">
      {/* ── Thanh điều hướng tháng ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={qs(thangKe(du.thang, -1))} aria-label="Tháng trước"
          className="rounded-lg px-2.5 py-1"
          style={{ border: '1px solid var(--border-strong)', background: 'var(--surface)', fontSize: 13 }}
        >←</Link>
        <h2 className="m-0" style={{ fontSize: 15, fontWeight: 660, minWidth: 128, textAlign: 'center' }}>
          {tenThang(du.thang)}
        </h2>
        <Link href={qs(thangKe(du.thang, 1))} aria-label="Tháng sau"
          className="rounded-lg px-2.5 py-1"
          style={{ border: '1px solid var(--border-strong)', background: 'var(--surface)', fontSize: 13 }}
        >→</Link>
        <Link href={qs(du.hom_nay.slice(0, 7))}
          className="rounded-lg px-2.5 py-1"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 12.5 }}
        >Tháng này</Link>

        <span className="flex-1" />

        {/* Của tôi ↔ tất cả: cùng một lịch, khác phạm vi. */}
        <Link href={`/work/lich?thang=${du.thang}${chiToi ? '&tatca=1' : ''}`}
          className="rounded-lg px-2.5 py-1"
          style={{
            border: `1px solid ${chiToi ? 'var(--border)' : 'var(--accent-ink)'}`,
            background: chiToi ? 'var(--surface-2)' : 'var(--accent-wash, var(--surface-3))',
            color: chiToi ? 'var(--muted)' : 'var(--accent-ink)',
            fontSize: 12.5, fontWeight: 600,
          }}
        >{chiToi ? 'Chỉ việc của tôi' : 'Mọi việc tôi thấy'}</Link>
      </div>

      {/* ── Lưới tháng ── */}
      <div>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {THU.map((t) => (
            <div key={t} className="text-center"
              style={{ fontSize: 11, fontWeight: 650, color: 'var(--faint)', letterSpacing: '.04em' }}
            >{t}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {o.map((d, i) => {
            if (d === null) return <div key={`x${i}`} />
            const nd = ngayDayDu(du.thang, d)
            const viec = theoNgay.get(nd) ?? []
            const kt = du.tai_ky_thuat[nd] ?? 0
            const laHomNay = nd === du.hom_nay

            return (
              <div
                key={nd}
                className="flex flex-col gap-1 p-1.5"
                style={{
                  minHeight: 96,
                  background: laHomNay ? 'var(--surface-3)' : 'var(--surface)',
                  border: `1px solid ${laHomNay ? 'var(--accent-ink)' : 'var(--border)'}`,
                  borderRadius: 9,
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="so" style={{
                    fontSize: 11.5, fontWeight: laHomNay ? 750 : 600,
                    color: laHomNay ? 'var(--accent-ink)' : 'var(--muted)',
                  }}>{d}</span>
                  <span className="flex-1" />
                  {kt > 0 && (
                    // Lớp phủ lịch kỹ thuật: chỉ con số, để thấy ngày nào kín người.
                    <span
                      title={`${kt} chuyến kỹ thuật hôm nay`}
                      className="so"
                      style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 20,
                        background: 'var(--amber-wash)', color: 'var(--amber)',
                      }}
                    >🔧{kt}</span>
                  )}
                </div>

                {viec.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setMo(v.id)}
                    className="w-full text-left truncate"
                    title={`${v.ref} · ${v.title}`}
                    style={{
                      fontSize: 11.5, lineHeight: 1.3, padding: '3px 5px', borderRadius: 6,
                      background: 'var(--surface-2)',
                      borderLeft: `3px solid ${MAU_UT_VAR[v.priority] ?? 'var(--border-strong)'}`,
                      textDecoration: v.status === 'done' ? 'line-through' : 'none',
                      color: v.status === 'done' ? 'var(--faint)' : 'var(--ink)',
                    }}
                  >
                    <span aria-hidden style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: 2, marginRight: 4,
                      background: MAU_TRANG_THAI[v.status] ?? 'var(--faint)',
                    }} />
                    {v.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Chân trang: việc không xếp được vào ô nào ── */}
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
        {du.viec.length === 0
          ? 'Không có việc nào tới hạn trong tháng này.'
          : <>Tháng này có <span className="so">{du.viec.length}</span> việc tới hạn.</>}
        {du.chua_co_han > 0 && (
          <>
            {' · '}
            <Link href="/work" style={{ color: 'var(--accent-ink)' }}>
              <span className="so">{du.chua_co_han}</span> việc chưa đặt hạn
            </Link>{' '}
            nên không hiện trên lịch.
          </>
        )}
      </p>

      {mo !== null && (
        <ChiTietViec
          key={mo}
          taskId={mo}
          nenTang={nenTang}
          onMoViec={setMo}
          onDong={() => setMo(null)}
          onDoi={() => router.refresh()}
        />
      )}
    </div>
  )
}
