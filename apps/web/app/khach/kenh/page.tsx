import { Suspense } from 'react'
import { KhungChon } from '@/bang'
import { soatKenhKhach, kenhChon, listTabView, type NhomKenh } from '@/app/actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { BangSoatKenh } from '@/components/BangSoatKenh'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

/**
 * Soát KÊNH của khách CSKH — CEO yêu cầu 31/08/2026.
 *
 * Nguyên văn: *"Gửi lại tôi danh sách để tôi kiểm tra chứ mở từng người 113 người bao giờ mới
 * xong. Chia ra gồm 113 máy điền, 74 người điền và 240 trống thành 3 tab cho tôi xem."*
 *
 * Ba tab đúng ba mức tin cậy khác nhau, nên phải tách chứ không gộp một bảng có cột "nguồn":
 *  · **máy điền** — hệ suy ra, CẦN NGƯỜI DUYỆT. Đây là nhóm đáng soát nhất.
 *  · **người điền** — đã có người xác nhận, chỉ xem lại khi nghi ngờ.
 *  · **còn trống** — chưa ai điền, cần điền.
 * Khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): ba nhóm là tab cố định (app/khach/kenh/truong-kenh.ts).
 */
const MO_TA: Record<NhomKenh, string> = {
  may: 'Hệ tự suy từ đơn/khách — cần anh duyệt',
  nguoi: 'Đã có người xác nhận',
  trong: 'Chưa có kênh',
}

export default async function SoatKenhPage({
  searchParams,
}: {
  searchParams: Promise<{ nhom?: string; q?: string; trang?: string }>
}) {
  const { nhom: nhomRaw, q = '', trang: trangRaw } = await searchParams
  const nhom: NhomKenh = nhomRaw === 'nguoi' || nhomRaw === 'trong' ? nhomRaw : 'may'
  const trang = Math.max(1, Number(trangRaw) || 1)
  // `dem` (3 lượt count head của soatKenhKhach) không còn hiện — tab không số đếm (khuôn F 27/11).
  const [{ rows, tong, soTrang }, kenh, tabRieng, quyen] = await Promise.all([
    soatKenhKhach(nhom, q, trang),
    kenhChon(),
    listTabView('kenh_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{ q, nhom }}>
            <Suspense>
              <BangSoatKenh
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                kenh={kenh}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                moTaNhom={MO_TA[nhom]}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
