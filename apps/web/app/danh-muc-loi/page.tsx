import { Suspense } from 'react'
import Link from 'next/link'
import { ManV2 } from '@/components/khung/ManV2'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { docAnToan } from '@/lib/loi/anToan'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { listTabView, nhomLoiChon } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KhungChon, boDau } from '@/bang'
import { apLoc, docTatCa } from '@/bang/locTruong'
import { DanhMucLoiBang } from '@/components/loi/DanhMucLoiBang'
import { NhapDanhMuc } from '@/components/loi/NhapDanhMuc'
import { PhanLoaiLai } from '@/components/loi/PhanLoaiLai'
import { NutXuatChuyenGia } from '@/components/loi/NutXuatChuyenGia'
import type { LoiDanhMuc } from '@/lib/loi/kieu'
import { TRUONG_DANH_MUC_LOI } from './truong-danh-muc-loi'

const LAY: Record<string, (d: LoiDanhMuc) => string> = { tt: (d) => d.trang_thai }

// Danh mục lỗi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Danh mục tải trọn rồi lọc trong
// bộ nhớ (vài trăm mã). Công cụ quản trị danh mục (nhập Sheet, xuất cho chuyên gia, chạy thử phân loại) mở khung kết
// quả ngay tại chỗ nên đứng trên bảng, không vào thanh công cụ.
export default async function DanhMucLoiPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const [{ data: tatCa, loi: loiDanhMuc }, quyen, { data: nhom, loi: loiNhom }, tabRieng] = await Promise.all([
    // Trang này GHI danh mục vào ST (luuLoi, nhập Sheet…) → đọc ST kể cả khi CSKH_NGUON=md (đọc = nguồn ghi).
    docAnToan('danhMucLoi', () => danhMucLoi(false, true), []),
    hoiQuyen({ sua: ['cs.nhom_loi.cau_hinh', 'QUANLY'], viewChung: ['he_thong.view_chung', 'QUANLY'] }),
    docAnToan('nhomLoiChon', nhomLoiChon, []),
    listTabView('danh_muc_loi_tab'),
  ])
  const choSua = quyen.sua && !loiNhom
  const taiLai = '/danh-muc-loi?' + new URLSearchParams(Object.entries(sp).filter((x): x is [string, string] => !!x[1]))
  const k = boDau(q).toLowerCase()
  const rows = apLoc(
    tatCa.filter((d) => !k || boDau([d.code, d.ten, ...d.aliases, ...d.ma_may].join(' ')).toLowerCase().includes(k)),
    docTatCa(sp, TRUONG_DANH_MUC_LOI),
    TRUONG_DANH_MUC_LOI.map((x) => ({ id: x.id, kieu: x.kieu, lay: LAY[x.id] })),
  )
  const nutChinh = <Button asChild variant="outline"><Link href="/bao-cao-loi">Báo cáo lỗi</Link></Button>

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          {loiDanhMuc ? (
            <div className="min-w-0 space-y-4">
              <PageHeader tieuDe="Danh mục lỗi" hanhDong={nutChinh} />
              <EmptyState kieu="loi" capTieuDe={2} tieuDe="Chưa tải được danh mục lỗi"
                moTa="Tải lại trang sau ít phút. Nếu tình trạng kéo dài, báo quản trị.">
                <Button asChild size="sm"><a href={taiLai}>Tải lại</a></Button>
              </EmptyState>
            </div>
          ) : (
            <div className="min-w-0 space-y-4">
              {loiNhom && (
                <Alert color="warning">
                  <AlertDescription>
                    Chưa tải được danh sách nhóm lỗi. Bạn vẫn có thể xem danh mục.
                    {' '}<a className="underline underline-offset-2" href={taiLai}>Tải lại</a>
                  </AlertDescription>
                </Alert>
              )}
              {choSua && <div className="flex flex-wrap items-start gap-2"><NhapDanhMuc /><NutXuatChuyenGia /><PhanLoaiLai /></div>}
              <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{ q, tt: sp.tt }}>
                <Suspense>
                  <DanhMucLoiBang
                    rows={rows}
                    choSua={choSua}
                    nhomTuyChon={nhom.map((n) => ({ gt: n.code, nhan: n.ten, phu: n.code }))}
                    tabRieng={tabRieng}
                    quyenTabChung={quyen.viewChung}
                    nutChinh={nutChinh}
                  />
                </Suspense>
              </KhungChon>
            </div>
          )}
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
