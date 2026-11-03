import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
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
  const r = await thu(() => kho().theKho(ma, k))
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
    </KhungKho>
  )
}
