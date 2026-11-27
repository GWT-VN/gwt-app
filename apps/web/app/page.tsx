import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { searchMachines, machineModels, khoaTatCaMay, listTabView, demMayTatCa } from './actions'
import { KhungChon, ThanhDaChon } from '@/bang'
import { tenModel } from '@/lib/danhSach'
import { coTheVaoCS, coTheVaoSales, laChiKyThuatVien } from '@/lib/nen-tang/gac-cong'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ExportMayButton } from '@/components/ExportMayButton'
import { BangMay } from '@/components/BangMay'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { khoangXuat } from './may/truong-may'

// Máy đã lắp — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  // Định tuyến cho người KHÔNG thuộc khu CS — không đá ai ra /login.
  //
  // `main` từng phải thêm một bộ hàm song song (quyenNenTang) chỉ để tránh việc
  // hỏi quyền ở đây làm văng người ngoài CS. Nhánh này vá tận gốc: layNhanVien()
  // không còn tự gác cổng nữa, nên ba hàm dưới an toàn cho mọi nhân sự và không
  // cần bộ song song. Giữ lại phần định tuyến của main vì nó đúng hơn bản cũ.
  const [chiKyThuat, vaoCS, vaoSales] = await Promise.all([
    laChiKyThuatVien(), coTheVaoCS(), coTheVaoSales(),
  ])
  // Kỹ thuật hiện trường: không có nghiệp vụ ở trang máy — đưa thẳng về lịch của họ.
  if (chiKyThuat) redirect('/ky-thuat/cua-toi')
  // Ngoài khu CS: Sales thuần -> khu Sales; còn lại (Marketing…) -> khu Việc.
  if (!vaoCS) redirect(vaoSales ? '/sales' : '/work')
  const { q = '', trang: trangRaw, cot, chieu, sp, bh, lap } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  // Mỗi nút hỏi ĐÚNG quyền gác Server Action của nó, không dùng chung một cờ
  // laQuanLy như trước — cờ chung là lý do giao diện lệch khỏi rào thật.
  const [{ rows, tong, soTrang, sapXep }, models, quyen, tabRieng, soTatCa] = await Promise.all([
    searchMachines(q, { trang, cot, chieu, maSanPham: sp, tinhTrangBH: bh, lap }),
    machineModels(),
    hoiQuyen({
      hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
      viewChung: ['he_thong.view_chung', 'QUANLY'],
      xuat: ['cs.bao_cao.xuat', 'QUANLY'],
    }),
    listTabView('may_tab'),
    demMayTatCa(),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((m) => m.serial)}
            tong={tong}
            bat={quyen.hangLoat}
            // KHÔNG có `trang`: lật trang không được coi là đổi bộ lọc, xem ChonDong.tsx
            thamSo={{ q, sp, bh, lap, cot, chieu }}
            layTatCaKhoa={khoaTatCaMay}
          >
            <Suspense>
              <BangMay
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                choChon={quyen.hangLoat}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                demTab={{ 'tat-ca': soTatCa }}
                // Ô chọn hiện MÃ MÁY cho gọn ("GN610"), chip lọc cũng vậy.
                tuyChonSp={models.map((m) => ({ giaTri: m.internal_code, nhan: tenModel(m.product_name, m.internal_code) }))}
                xuatExcel={quyen.xuat && <ExportMayButton q={q} sp={sp} bh={bh} {...khoangXuat(lap)} />}
                thanhDaChon={<ThanhDaChon nhan="máy" />}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
