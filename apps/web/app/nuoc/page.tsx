import { Suspense } from 'react'
import { KhungChon } from '@/bang'
import { docTatCa } from '@/bang/locTruong'
import { hoSoNuoc, listTabView } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { BangNuoc } from '@/components/BangNuoc'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { TRUONG_NUOC } from './truong-nuoc'

/**
 * Hồ sơ chất lượng nước — TOÀN BỘ khách (CEO yêu cầu 31/08/2026).
 *
 * *"Hồ sơ cả nước tất cả các khách hàng, xem theo tỉnh thành, địa chỉ, thời gian được."*
 *
 * Dữ liệu đo nước có từ lâu trong `maintenance_visit` nhưng **chưa màn nào đọc ra**, nên
 * ghi xong coi như mất. Trang này là chỗ đọc ra; lịch sử theo TỪNG khách nằm ở hồ sơ khách.
 * Khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): Lọc ▸ Tỉnh/TP · Ngày đo.
 */
export default async function NuocPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tinh?: string; ngay?: string; ngtu?: string; ngden?: string; trang?: string }>
}) {
  const sp = await searchParams
  const { q = '', tinh, ngay, ngtu, ngden, trang: trangRaw } = sp
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows, tong, soTrang }, tabRieng, quyen] = await Promise.all([
    hoSoNuoc(q, { tinh, ngay, tu: ngtu, den: ngden, trang }),
    listTabView('nuoc_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  // Tỉnh lấy từ CHÍNH dữ liệu đang xem (+ tỉnh đang chọn để chip còn tên) — không liệt kê tỉnh chưa có lượt đo nào.
  const dangChon = docTatCa(sp, TRUONG_NUOC).find((d) => d.truong === 'tinh')?.giaTri ?? []
  const dsTinh = [...new Set([...rows.map((r) => r.tinh), ...dangChon].filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'vi'))

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{ q, tinh, ngay }}>
            <Suspense>
              <BangNuoc
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                dsTinh={dsTinh}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                locTrongTrang={!!(q || tinh)}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
