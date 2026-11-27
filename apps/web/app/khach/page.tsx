import { Suspense } from 'react'
import { listToFix, khoaTatCaKhach, listTabView } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KhungChon, ThanhDaChon } from '@/bang'
import { BangKhachDon } from '@/components/BangKhachDon'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

// Khách cần dọn dữ liệu — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Trang danh sách cấp
// một (có trong menu), không phải trang con của "Máy đã lắp" → không có nút lui.
export default async function ToFixPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; trang?: string; cot?: string; chieu?: string }>
}) {
  const { q = '', trang: trangRaw, cot, chieu } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows, tong, soTrang, sapXep }, quyen, tabRieng] = await Promise.all([
    listToFix(q, { trang, cot, chieu }),
    hoiQuyen({ hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'], viewChung: ['he_thong.view_chung', 'QUANLY'] }),
    listTabView('khach_don_tab'),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((c) => c.id)}
            tong={tong}
            bat={quyen.hangLoat}
            thamSo={{ q, cot, chieu }}
            layTatCaKhoa={khoaTatCaKhach}
          >
            <Suspense>
              <BangKhachDon
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                choChon={quyen.hangLoat}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                thanhDaChon={<ThanhDaChon nhan="khách" />}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
