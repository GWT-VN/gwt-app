import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
import { nhanSuKien, serialTheoMa } from '@/lib/kho/serial'
import { chanKho } from '../../_gac'
import { Bang, KhungKho, LinkTin, LoiKho, O, TheSo, khoTu, ngayVN, sl, thu } from '../../_ui'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ ma: string }> }) {
  return { title: `Thẻ kho ${decodeURIComponent((await params).ma)} · GWT Kho` }
}

export default async function KhoTheKhoPage({ params, searchParams }: { params: Promise<{ ma: string }>; searchParams: Promise<{ kho?: string }> }) {
  await chanKho()
  const ma = decodeURIComponent((await params).ma)
  const k = khoTu((await searchParams).kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe={`Thẻ kho ${ma}`} kho={k}><LoiKho /></KhungKho>
  const [r, rs] = await Promise.all([thu(() => kho().theKho(ma, k)), thu(() => serialTheoMa(ma))])
  if (!r.ok) return <KhungKho tieuDe={`Thẻ kho ${ma}`} kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const t = r.v
  const dong = t?.dong ?? []
  const quayLai = <Link href={`/kho${k !== 'NX' ? `?kho=${k}` : ''}`} className="text-indigo-700 hover:underline">← Tồn kho</Link>

  return (
    <KhungKho tieuDe={`Thẻ kho ${ma}`} kho={k} moTa={<>{quayLai} · {t?.ten ?? 'mã không có trong danh mục'}</>}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TheSo nhan="Tồn hiện tại" so={sl(dong.at(-1)?.so_du ?? 0)} phu={t?.don_vi ?? undefined} />
        <TheSo nhan="Tổng nhập" so={sl(dong.filter((d) => d.loai === 'Nhập').reduce((s, d) => s + d.qty, 0))} />
        <TheSo nhan="Tổng xuất" so={sl(dong.filter((d) => d.loai === 'Xuất').reduce((s, d) => s + d.qty, 0))} />
        <TheSo nhan="Số dòng sổ" so={dong.length} />
      </div>
      <Bang dau={['Ngày', 'Loại', 'Tên ghi trong tin', 'SL', 'Số dư', 'Lý do / cho ai', 'Ghi chú', 'Người nhắn', '']} trong={!dong.length} phai={[3, 4]}>
        {[...dong].reverse().map((d) => (
          <tr key={d.id} className="hover:bg-slate-50">
            <O cls="whitespace-nowrap">{ngayVN(d.ngay)}</O>
            <O cls={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</O>
            <O>{d.raw_name}</O>
            <O cls={`text-right font-semibold ${mauLoai(d.loai)}`}>{d.loai === 'Xuất' ? '−' : d.loai === 'Nhập' ? '+' : ''}{sl(d.qty)}</O>
            <O cls={`text-right font-semibold ${d.so_du < 0 ? 'text-red-700' : ''}`}>{sl(d.so_du)}</O>
            <O cls="max-w-[220px] text-slate-600">{d.purpose ?? ''}</O>
            <O cls="max-w-[220px] text-xs text-slate-500">{d.note ?? ''}</O>
            <O cls="whitespace-nowrap">{d.keeper ?? ''}</O>
            <O><LinkTin id={d.discord_msg_id} /></O>
          </tr>
        ))}
      </Bang>
      {rs.ok ? rs.v.length > 0 && <SerialCuaMa ds={rs.v} />
        : <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Chưa đọc được danh sách serial: {rs.loi}</p>}
    </KhungKho>
  )
}

/** Serial của mã này: danh sách chuẩn của app (serial_registry) + sự kiện gần nhất (gồm cả bot kho ghi từ Discord). Bấm serial → trang máy. */
function SerialCuaMa({ ds }: { ds: Awaited<ReturnType<typeof serialTheoMa>> }) {
  const dem = new Map<string, number>()
  for (const d of ds) dem.set(d.trang_thai_nhan, (dem.get(d.trang_thai_nhan) ?? 0) + 1)
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Serial · {ds.length} máy</h2>
        <p className="text-xs text-slate-500">{[...dem].map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
      </div>
      <p className="text-xs text-slate-500">
        Trạng thái do CSKH đặt trên app (“Tồn kho” = chưa lắp cho khách). Bot kho chỉ ghi lịch sử nhập / xuất / tình trạng từ tin Discord.
      </p>
      <Bang dau={['Serial', 'Trạng thái', 'Sự kiện gần nhất', 'Ngày', 'Ghi chú']} trong={!ds.length}>
        {ds.map((d) => (
          <tr key={d.serial} className="hover:bg-slate-50">
            <O cls="whitespace-nowrap">
              {d.cho_duyet ? <span className="font-mono text-[13px]">{d.serial}</span>
                : <Link href={`/may/${encodeURIComponent(d.serial)}`} className="font-mono text-[13px] text-indigo-700 hover:underline">{d.serial}</Link>}
            </O>
            <O cls="whitespace-nowrap">{d.cho_duyet
              ? <Link href="/serial?tab=cho" className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">Chờ duyệt</Link>
              : d.trang_thai_nhan}</O>
            <O cls="whitespace-nowrap">{nhanSuKien(d.su_kien_cuoi)}</O>
            <O cls="whitespace-nowrap">{d.luc_cuoi ? ngayVN(d.luc_cuoi) : ''}</O>
            <O cls="max-w-[420px] text-xs text-slate-600">{d.ghi_chu_cuoi ?? ''}</O>
          </tr>
        ))}
      </Bang>
    </section>
  )
}
