import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { n } from '@/lib/kho/nhan'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LinkMay, LoiKho, Nhan, O, thu } from '../_ui'

export const metadata = { title: 'Máy cần xử lý · GWT Kho' }
export const dynamic = 'force-dynamic'

export default async function KhoCanXuLyPage() {
  await chanKho()
  if (!daCauHinhKho()) return <KhungKho tieuDe="Máy cần xử lý"><LoiKho /></KhungKho>
  const r = await thu(() => kho().canXuLy())
  if (!r.ok) return <KhungKho tieuDe="Máy cần xử lý"><LoiKho loi={r.loi} /></KhungKho>
  const ds = r.v

  return (
    <KhungKho tieuDe="Máy cần xử lý" moTa={`${ds.length} máy cũ / hỏng / chờ kiểm tra / đang bảo hành, bảo trì, sửa / có phương án`}>
      <Bang dau={['Serial', 'Model', 'Tình trạng', 'Trạng thái', 'Phương án', 'Nơi để', 'Mục đích hiện tại', 'Phụ trách', 'Cập nhật']} trong={!ds.length}>
        {ds.map((m) => (
          <tr key={m.id} className="hover:bg-slate-50">
            <O><LinkMay serial={m.serial} /></O>
            <O><div className="font-medium">{m.internal_code}</div><div className="text-xs text-slate-500">{m.ten_model ?? ''}</div></O>
            <O><Nhan ma={m.tinh_trang} /></O>
            <O><Nhan ma={m.trang_thai} /></O>
            <O>{n(m.phuong_an) || '—'}</O>
            <O>{m.dia_diem_ten}</O>
            <O>{n(m.muc_dich_hien_tai) || '—'}</O>
            <O>{m.nguoi_phu_trach ?? ''}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{m.cap_nhat}</O>
          </tr>
        ))}
      </Bang>
    </KhungKho>
  )
}
