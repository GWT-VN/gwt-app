import { Suspense } from 'react'
import Link from 'next/link'
import { ManV2 } from '@/components/khung/ManV2'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { docAnToan } from '@/lib/loi/anToan'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { nhomLoiChon } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { OTimKiem, BoLocChon, ThanhDangLoc, boDau } from '@/bang'
import { DanhMucLoiBang } from '@/components/loi/DanhMucLoiBang'
import { NhapDanhMuc } from '@/components/loi/NhapDanhMuc'
import { PhanLoaiLai } from '@/components/loi/PhanLoaiLai'
import { NutXuatChuyenGia } from '@/components/loi/NutXuatChuyenGia'

const TT = [
  { giaTri: 'cho_duyet', nhan: 'Chờ duyệt' },
  { giaTri: 'da_duyet', nhan: 'Đã duyệt' },
  { giaTri: 'ngung', nhan: 'Ngừng dùng' },
]

export default async function DanhMucLoiPage({ searchParams }: { searchParams: Promise<{ q?: string; tt?: string }> }) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const tt = typeof sp.tt === 'string' ? sp.tt : ''
  const [{ data: tatCa, loi: loiDanhMuc }, quyen, { data: nhom, loi: loiNhom }] = await Promise.all([
    docAnToan('danhMucLoi', danhMucLoi, []),
    hoiQuyen({ sua: ['cs.nhom_loi.cau_hinh', 'QUANLY'] }),
    docAnToan('nhomLoiChon', nhomLoiChon, []),
  ])
  const choSua = quyen.sua && !loiNhom
  const taiLai = '/danh-muc-loi?' + new URLSearchParams({ ...(q && { q }), ...(tt && { tt }) })
  const k = boDau(q).toLowerCase()
  const rows = tatCa.filter((d) => (!tt || d.trang_thai === tt) &&
    (!k || boDau([d.code, d.ten, ...d.aliases, ...d.ma_may].join(' ')).toLowerCase().includes(k)))
  const dieuKien = [
    ...(q ? [{ nhan: 'Từ khoá', giaTri: q }] : []),
    ...(tt ? [{ nhan: 'Trạng thái', giaTri: TT.find((t) => t.giaTri === tt)?.nhan ?? tt }] : []),
  ]
  return (
    <ManV2>
      <CauHinhBangDs>
        <TrangDuLieu className="space-y-4">
          <PageHeader
            tieuDe="Danh mục lỗi"
            meta={loiDanhMuc ? undefined : [`${tatCa.length} mã lỗi`, `${tatCa.filter((d) => d.trang_thai === 'cho_duyet').length} chờ duyệt`]}
            hanhDong={<Button asChild variant="outline"><Link href="/bao-cao-loi">Báo cáo lỗi</Link></Button>}
          />
          {loiDanhMuc ? (
            <EmptyState kieu="loi" capTieuDe={2} tieuDe="Chưa tải được danh mục lỗi"
              moTa="Tải lại trang sau ít phút. Nếu tình trạng kéo dài, báo quản trị.">
              <Button asChild size="sm"><a href={taiLai}>Tải lại</a></Button>
            </EmptyState>
          ) : (
            <>
              {loiNhom && (
                <Alert color="warning">
                  <AlertDescription>
                    Chưa tải được danh sách nhóm lỗi. Bạn vẫn có thể xem danh mục.
                    {' '}<a className="underline underline-offset-2" href={taiLai}>Tải lại</a>
                  </AlertDescription>
                </Alert>
              )}
              {choSua && <div className="flex flex-wrap items-start gap-2"><NhapDanhMuc /><NutXuatChuyenGia /><PhanLoaiLai /></div>}
              <div className="flex flex-wrap items-center gap-2">
                <Suspense><OTimKiem placeholder="Gõ mã, tên lỗi, cách ghi, mã máy…" /></Suspense>
                <Suspense><BoLocChon param="tt" nhan="Trạng thái" tuyChon={TT} /></Suspense>
              </div>
              <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={tatCa.length} nhan="mã lỗi" />
              <DanhMucLoiBang rows={rows} choSua={choSua}
                nhomTuyChon={nhom.map((n) => ({ gt: n.code, nhan: n.ten, phu: n.code }))} />
            </>
          )}
        </TrangDuLieu>
      </CauHinhBangDs>
    </ManV2>
  )
}
