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
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
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
      <div className="rounded-xl border border-border bg-(--color-background-warning-surface) p-3 text-sm text-(--color-text-warning-surface)">
        Chỉ nhập <b>SL đếm</b> cho các mã đã kiểm, rồi chọn <b>Ghi kiểm kê</b>.
        Nếu có chênh lệch, Kho ghi một dòng điều chỉnh theo tồn sổ tại thời điểm ghi.
      </div>
      {!dm.ok && <p className="rounded-lg bg-(--color-background-warning-surface) px-3 py-2 text-xs text-(--color-text-warning-surface)">Chưa tải được danh mục mã ({dm.loi}) — chỉ kiểm được các mã có trong bảng.</p>}
      <BangKiemKe kho={k} dong={r.v.dong.map((d) => ({ ma: d.internal_code, ten: d.ten, don_vi: d.don_vi, ton: d.ton }))} danhMuc={dm.ok ? dm.v : []} />
    </KhungKho>
  )
}
