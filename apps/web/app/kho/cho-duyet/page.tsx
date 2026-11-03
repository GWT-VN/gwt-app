import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LINK_SHEET_KHO, LinkTin, LoiKho, O, khoTu, ngayVN, sl, thu } from '../_ui'

export const metadata = { title: 'Chờ duyệt mã · GWT Kho' }
export const dynamic = 'force-dynamic'

export default async function KhoChoDuyetPage({ searchParams }: { searchParams: Promise<{ kho?: string }> }) {
  await chanKho()
  const k = khoTu((await searchParams).kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho /></KhungKho>
  const r = await thu(() => kho().choDuyet(k))
  if (!r.ok) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const ds = r.v

  return (
    <KhungKho tieuDe="Chờ duyệt mã" kho={k} moTa={`${ds.length} dòng có tên hàng bot chưa biết mã — CHƯA tính vào tồn`}>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Duyệt trên Google Sheet, tab <b>“Chờ duyệt”</b>: chọn mã ở ô vàng <b>“Mã duyệt”</b> (hoặc gõ <b>BỎ QUA</b> nếu không phải hàng kho).
        Trong ~5 phút bot ghi sổ, nhớ tên đó (lần sau tự nhận) và đổi biểu tượng tin Discord ⏳ → ✅.{' '}
        <a href={LINK_SHEET_KHO} target="_blank" rel="noreferrer" className="font-medium underline">Mở Sheet ↗</a>
      </div>
      <Bang dau={['Ngày', 'Loại', 'Tên ghi trong tin', 'SL', 'Lý do / cho ai', 'Bot gợi ý mã', 'Người nhắn', 'Bot ghi lúc', '']} trong={!ds.length} phai={[3]}>
        {ds.map((d) => (
          <tr key={d.id} className="hover:bg-slate-50">
            <O cls="whitespace-nowrap">{ngayVN(d.ngay)}</O>
            <O cls={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</O>
            <O cls="font-medium">{d.raw_name}</O>
            <O cls="text-right font-semibold">{sl(d.qty)}</O>
            <O cls="max-w-[220px] text-slate-600">{d.purpose ?? ''}</O>
            <O>{d.suggest_code ? <><span className="font-mono text-[13px]">{d.suggest_code}</span><div className="text-xs text-slate-500">{d.suggest_name ?? ''}</div></> : <span className="text-slate-400">—</span>}</O>
            <O cls="whitespace-nowrap">{d.keeper ?? ''}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{ngayVN(d.ghi_luc)}</O>
            <O><LinkTin id={d.discord_msg_id} /></O>
          </tr>
        ))}
      </Bang>
    </KhungKho>
  )
}
