import { TableRow } from '@/components/ui/table'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
import { chanKho, coTheSuaKho } from '../_gac'
import { DuyetDong, KhuSuaKho } from '../_sua'
import { Bang, KhungKho, LINK_SHEET_KHO, LinkTin, LoiKho, O, khoTu, ngayVN, sl, thu } from '../_ui'

export const metadata = { title: 'Chờ duyệt mã · GWT Kho' }
export const dynamic = 'force-dynamic'

export default async function KhoChoDuyetPage({ searchParams }: { searchParams: Promise<{ kho?: string }> }) {
  await chanKho()
  const k = khoTu((await searchParams).kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho /></KhungKho>
  const sua = await coTheSuaKho()
  const [r, dm] = await Promise.all([thu(() => kho().choDuyet(k)), sua ? thu(() => kho().danhMuc()) : null])
  if (!r.ok) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const ds = r.v

  return (
    <KhungKho tieuDe="Chờ duyệt mã" kho={k} moTa={`${ds.length} dòng có tên hàng bot chưa biết mã — CHƯA tính vào tồn`}>
      <div className="rounded-xl border border-border bg-(--color-background-warning-surface) p-3 text-sm text-(--color-text-warning-surface)">
        {sua
          ? <>Duyệt <b>ngay tại đây</b>: chọn mã (đã điền sẵn mã bot gợi ý nếu có) rồi bấm <b>Duyệt</b>; không phải hàng kho thì <b>Bỏ qua</b>.
            Giữ tick <b>“Nhớ tên này”</b> để lần sau bot tự nhận tên đó.{' '}</>
          : <>Người có quyền <b>Sửa sổ kho</b> duyệt được ngay trên trang này.{' '}</>}
        Hoặc duyệt trên Google Sheet, tab <b>“Chờ duyệt”</b>: chọn mã ở ô vàng <b>“Mã duyệt”</b> (hoặc gõ <b>BỎ QUA</b>).
        Trong ~20 giây bot ghi sổ, nhớ tên đó và đổi biểu tượng tin Discord ⏳ → ✅.{' '}
        <a href={LINK_SHEET_KHO} target="_blank" rel="noreferrer" className="font-medium underline">Mở Sheet ↗</a>
      </div>
      {dm && !dm.ok && <p className="rounded-lg bg-(--color-background-warning-surface) px-3 py-2 text-xs text-(--color-text-warning-surface)">Chưa tải được danh mục mã ({dm.loi}) — ô chọn mã sẽ trống.</p>}
      <KhuSuaKho danhMuc={dm?.ok ? dm.v : []}>
      <Bang dau={['Ngày', 'Loại', 'Tên ghi trong tin', 'SL', 'Lý do / cho ai', 'Bot gợi ý mã', 'Người nhắn', 'Bot ghi lúc', '', ...(sua ? ['Duyệt'] : [])]} trong={!ds.length} phai={[3]}>
        {ds.map((d) => (
          <TableRow key={d.id}>
            <O cls="whitespace-nowrap">{ngayVN(d.ngay)}</O>
            <O cls={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</O>
            <O cls="font-medium">{d.raw_name}</O>
            <O cls="text-right font-semibold">{sl(d.qty)}</O>
            <O cls="max-w-[220px] text-muted-foreground">{d.purpose ?? ''}</O>
            <O>{d.suggest_code ? <><span className="font-mono text-[13px]">{d.suggest_code}</span><div className="text-xs text-muted-foreground">{d.suggest_name ?? ''}</div></> : <span className="text-muted-foreground">—</span>}</O>
            <O cls="whitespace-nowrap">{d.keeper ?? ''}</O>
            <O cls="whitespace-nowrap text-xs text-muted-foreground">{ngayVN(d.ghi_luc)}</O>
            <O><LinkTin id={d.discord_msg_id} /></O>
            {sua && <O><DuyetDong id={d.id} rawName={d.raw_name} goiY={d.suggest_code} /></O>}
          </TableRow>
        ))}
      </Bang>
      </KhuSuaKho>
    </KhungKho>
  )
}
