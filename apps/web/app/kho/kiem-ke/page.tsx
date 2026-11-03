import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LoiKho, O, ngayVN, thu } from '../_ui'

export const metadata = { title: 'Kiểm kê · GWT Kho' }
export const dynamic = 'force-dynamic'

const NHAN_DOT: Record<string, string> = { nhap: 'Nháp (chưa áp)', da_ap: 'Đã áp', huy: 'Huỷ' }

export default async function KhoKiemKePage() {
  await chanKho()
  if (!daCauHinhKho()) return <KhungKho tieuDe="Kiểm kê"><LoiKho /></KhungKho>
  const r = await thu(() => kho().dsKiemKe())
  if (!r.ok) return <KhungKho tieuDe="Kiểm kê"><LoiKho loi={r.loi} /></KhungKho>

  return (
    <KhungKho tieuDe="Kiểm kê" moTa="Các đợt đếm máy thực tế. Nạp / áp đợt: nhắn Bắp trong kênh kho (vd “Bắp nạp kiểm kê KK-NX-2026-11”).">
      <Bang dau={['Đợt', 'Kho', 'Trạng thái', 'Máy có serial', 'Máy chưa serial', 'Người tạo', 'Tạo lúc', 'Áp lúc']} trong={!r.v.length}>
        {r.v.map((d) => (
          <tr key={d.ma} className="hover:bg-slate-50">
            <O><Link href={`/kho/kiem-ke/${encodeURIComponent(d.ma)}`} className="font-medium text-indigo-700 hover:underline">{d.ma}</Link></O>
            <O>{d.dia_diem_ten}</O>
            <O>{NHAN_DOT[d.trang_thai] ?? d.trang_thai}</O>
            <O cls="text-center">{d.so_dong}</O>
            <O cls="text-center">{d.so_khong_serial || ''}</O>
            <O>{d.nguoi_tao}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{ngayVN(d.tao_luc)}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{d.ap_luc ? ngayVN(d.ap_luc) : '—'}</O>
          </tr>
        ))}
      </Bang>
    </KhungKho>
  )
}
