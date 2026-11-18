import Link from 'next/link'
import { bhChoKichHoat, bhChoKichHoatDem } from '@/app/actions'
import { BHChoKichHoatList } from '@/components/BHChoKichHoatList'
import { dsMayChoSerial } from '@/app/may/chua-serial-actions'
import { docAnToan } from '@/lib/loi/anToan'
import { boDau } from '@/bang/timkiem'

const TAB = [
  { key: '', nhan: 'Tất cả' },
  { key: 'da_lap_chua_kich_hoat', nhan: 'Đã lắp — bấm là xong' },
  { key: 'don_sales_chua_gan_may', nhan: 'Đơn bán — cần điền serial' },
  // 18/11: đã kích hoạt BH khi chưa có serial (mã tạm TAM…) — còn phải bổ sung serial thật.
  { key: 'cho_serial', nhan: 'Đã kích hoạt — chờ bổ sung serial' },
] as const

const vnNgay = (d: string | null) => (d ? d.split('-').reverse().join('/') : '—')

export default async function BHChoKichHoatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; nguon?: string }>
}) {
  const { q = '', nguon = '' } = await searchParams
  const choSerialTab = nguon === 'cho_serial'
  const [rows, dem, { data: choSerial }] = await Promise.all([
    choSerialTab ? Promise.resolve([]) : bhChoKichHoat(q, nguon || undefined),
    bhChoKichHoatDem(),
    docAnToan('dsMayChoSerial', () => dsMayChoSerial(), []),
  ])
  const k = boDau(q).toLowerCase()
  const choSerialLoc = k
    ? choSerial.filter((m) => boDau([m.serial, m.internal_code, m.parent_serial, m.ten_khach].join(' ')).toLowerCase().includes(k))
    : choSerial

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Chờ kích hoạt BH</h1>
        </header>

        <p className="text-sm text-slate-500">
          Máy đã bán hoặc đã lắp mà bảo hành chưa kích hoạt. Kích hoạt xong dòng tự biến mất khỏi bảng.
        </p>

        <form className="flex gap-2">
          {nguon && <input type="hidden" name="nguon" value={nguon} />}
          <input name="q" defaultValue={q}
            placeholder="Gõ tên/SĐT khách, serial, mã máy, mã đơn…"
            className="flex-1 rounded-lg border px-4 py-2.5 text-slate-900 bg-white" />
          <button className="rounded-lg bg-slate-900 text-white px-5 font-medium">Tìm</button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {TAB.map((t) => {
            const sl = t.key === 'da_lap_chua_kich_hoat' ? dem.da_lap
              : t.key === 'don_sales_chua_gan_may' ? dem.don_sales
              : t.key === 'cho_serial' ? choSerial.length
              : dem.da_lap + dem.don_sales
            return (
              <Link key={t.key}
                href={`/bh-cho-kich-hoat?${new URLSearchParams({ ...(q && { q }), ...(t.key && { nguon: t.key }) })}`}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  nguon === t.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'
                }`}>
                {t.nhan} ({sl})
              </Link>
            )
          })}
        </div>

        {choSerialTab ? (
          <>
            <p className="text-sm text-slate-500">
              {choSerialLoc.length} máy đã kích hoạt bảo hành bằng mã tạm — mở máy, bấm &quot;Bổ sung serial&quot;.
            </p>
            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr><th className="px-3 py-2">Mã tạm</th><th className="px-3 py-2">Máy</th><th className="px-3 py-2">Thuộc bộ</th>
                    <th className="px-3 py-2">Khách</th><th className="px-3 py-2">Ngày lắp</th></tr>
                </thead>
                <tbody>
                  {choSerialLoc.map((m) => (
                    <tr key={m.serial} className="border-t">
                      <td className="px-3 py-2 font-mono"><Link className="underline" href={`/may/${encodeURIComponent(m.serial)}`}>{m.serial}</Link></td>
                      <td className="px-3 py-2 font-mono">{m.internal_code ?? '—'}</td>
                      <td className="px-3 py-2 font-mono">{m.parent_serial ?? '—'}</td>
                      <td className="px-3 py-2">{m.customer_id ? <Link className="underline" href={`/khach/${m.customer_id}`}>{m.ten_khach ?? 'Khách'}</Link> : '—'}</td>
                      <td className="px-3 py-2">{vnNgay(m.install_date)}</td>
                    </tr>
                  ))}
                  {!choSerialLoc.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">Không có máy nào chờ bổ sung serial.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              {rows.length} dòng{rows.length === 500 && ' (giới hạn 500 — gõ cụ thể hơn)'}
            </p>
            <BHChoKichHoatList items={rows} />
          </>
        )}
      </div>
    </main>
  )
}
