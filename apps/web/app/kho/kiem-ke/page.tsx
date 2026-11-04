import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { chanKho, coTheSuaKho } from '../_gac'
import { KhungKho, LoiKho, khoTu, ngayVN, thu } from '../_ui'
import { BangKiemKe } from './_bang'

export const metadata = { title: 'Kiểm kê · GWT Kho' }
export const dynamic = 'force-dynamic'

export default async function KhoKiemKePage({ searchParams }: { searchParams: Promise<{ kho?: string }> }) {
  await chanKho()
  const k = khoTu((await searchParams).kho)
  if (!(await coTheSuaKho())) {
    return (
      <KhungKho tieuDe="Kiểm kê" kho={k}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Kiểm kê ghi thẳng vào sổ kho nên cần quyền <b>Sửa sổ kho</b>. Bạn vẫn xem được tồn ở trang Tồn kho.
        </div>
      </KhungKho>
    )
  }
  if (!daCauHinhKho()) return <KhungKho tieuDe="Kiểm kê" kho={k}><LoiKho /></KhungKho>
  const [r, dm] = await Promise.all([thu(() => kho().ton(k)), thu(() => kho().danhMuc())])
  if (!r.ok) return <KhungKho tieuDe="Kiểm kê" kho={k}><LoiKho loi={r.loi} /></KhungKho>

  return (
    <KhungKho tieuDe="Kiểm kê" kho={k} moTa={`Tồn sổ tính từ dòng đã duyệt · bot ghi gần nhất ${ngayVN(r.v.ghiGanNhat)}`}>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Điền <b>SL đếm thực tế</b> cho những mã đã đếm (ô bỏ trống = không kiểm), rồi bấm <b>Ghi kiểm kê</b>.
        Kiểm kê <b>có hiệu lực ngay</b>: mã nào lệch sẽ được ghi một dòng <b>“Điều chỉnh”</b> (ngày hôm nay) bằng đúng phần chênh,
        và ghi vào Lịch sử sửa. Tồn sổ dùng để tính chênh là tồn LÚC GHI (có thể khác bảng dưới nếu bot vừa ghi thêm).
      </div>
      {!dm.ok && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Chưa tải được danh mục mã ({dm.loi}) — chỉ kiểm được các mã có trong bảng.</p>}
      <BangKiemKe kho={k} dong={r.v.dong.map((d) => ({ ma: d.internal_code, ten: d.ten, don_vi: d.don_vi, ton: d.ton }))} danhMuc={dm.ok ? dm.v : []} />
    </KhungKho>
  )
}
