import { Suspense } from 'react'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { DauTrang } from '@/components/DauTrang'
import { OTimKiem, BoLocChon, ThanhDangLoc, boDau } from '@/bang'
import { DanhMucLoiBang } from '@/components/loi/DanhMucLoiBang'
import { NhapDanhMuc } from '@/components/loi/NhapDanhMuc'
import { PhanLoaiLai } from '@/components/loi/PhanLoaiLai'

const TT = [
  { giaTri: 'cho_duyet', nhan: 'Chờ duyệt' },
  { giaTri: 'da_duyet', nhan: 'Đã duyệt' },
  { giaTri: 'ngung', nhan: 'Ngừng dùng' },
]

export default async function DanhMucLoiPage({ searchParams }: { searchParams: Promise<{ q?: string; tt?: string }> }) {
  const { q = '', tt = '' } = await searchParams
  const [tatCa, quyen] = await Promise.all([danhMucLoi(), hoiQuyen({ sua: ['cs.nhom_loi.cau_hinh', 'QUANLY'] })])
  const k = boDau(q).toLowerCase()
  const rows = tatCa.filter((d) => (!tt || d.trang_thai === tt) &&
    (!k || boDau([d.code, d.ten, ...d.aliases, ...d.ma_may].join(' ')).toLowerCase().includes(k)))
  const dieuKien = [
    ...(q ? [{ nhan: 'Từ khoá', giaTri: q }] : []),
    ...(tt ? [{ nhan: 'Trạng thái', giaTri: TT.find((t) => t.giaTri === tt)?.nhan ?? tt }] : []),
  ]
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Danh mục lỗi" phuDe={`${tatCa.length} mã lỗi · ${tatCa.filter((d) => d.trang_thai === 'cho_duyet').length} chờ duyệt`} />
        {quyen.sua && <div className="flex gap-2 flex-wrap items-start"><NhapDanhMuc /><PhanLoaiLai /></div>}
        <Suspense><OTimKiem placeholder="Gõ mã, tên lỗi, cách ghi, mã máy…" /></Suspense>
        <Suspense><BoLocChon param="tt" nhan="Trạng thái" tuyChon={TT} /></Suspense>
        <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={tatCa.length} nhan="mã lỗi" />
        <DanhMucLoiBang rows={rows} choSua={quyen.sua} />
      </div>
    </main>
  )
}
