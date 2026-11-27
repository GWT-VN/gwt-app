import { Suspense } from 'react'
import { coreForecast, coreCounts, khoaTatCaLoi, listTabView } from '@/app/actions'
import { KhungChon, ThanhDaChon } from '@/bang'
import { docTatCa } from '@/bang/locTruong'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ExportLoiButton } from '@/components/ExportLoiButton'
import { BangLoi } from '@/components/BangLoi'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { khoangXuat } from '@/app/may/truong-may'
import { SAP, TRUONG_LOI } from './truong-loi'

// Lịch thay lõi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
export default async function LoiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { q = '', tt = '', han, trang: trangRaw, cot, chieu } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows, tong, soTrang, sapXep }, counts, quyen, tabRieng] = await Promise.all([
    coreForecast(tt, q, { trang, cot, chieu, han }),
    coreCounts(),
    hoiQuyen({
      hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
      viewChung: ['he_thong.view_chung', 'QUANLY'],
      xuat: ['cs.bao_cao.xuat', 'QUANLY'],
    }),
    listTabView('loi_tab'),
  ])
  // Đang xem lõi quá hạn (tab "Quá hạn" hoặc Lọc ▸ Tình trạng là Quá hạn) → nhắc đây là danh sách XÁC MINH.
  const dkTt = docTatCa({ tt }, TRUONG_LOI)[0]
  const xemQuaHan = dkTt?.phep === 'la' && dkTt.giaTri.includes('QUÁ HẠN')

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((r) => `${r.serial}-${r.filter_code}`)}
            tong={tong}
            bat={quyen.hangLoat}
            thamSo={{ q, tt, han, cot, chieu }}
            layTatCaKhoa={khoaTatCaLoi}
          >
            <Suspense>
              <BangLoi
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                choChon={quyen.hangLoat}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                demTab={{
                  'tat-ca': counts['tat-ca'] ?? 0,
                  sap: counts[SAP] ?? 0,
                  'qua-han': counts['QUÁ HẠN'] ?? 0,
                  'con-han': counts['còn hạn'] ?? 0,
                }}
                canhBao={
                  xemQuaHan && (
                    <Alert color="warning" className="mb-3">
                      <AlertDescription>
                        <strong>Đây KHÔNG phải danh sách gọi bán.</strong> Nhật ký thay lõi mới bắt đầu ghi, nên máy cũ nào
                        chưa từng log đều hiện quá hạn — dù thực tế đã được thay rồi. Hãy dùng làm
                        <strong> danh sách cần xác minh</strong>: gọi hỏi khách đã thay chưa, rồi bấm “Đã thay” kèm đúng ngày.
                        Ghi dần thì con số này tự đúng lên.
                      </AlertDescription>
                    </Alert>
                  )
                }
                xuatExcel={quyen.xuat && <ExportLoiButton tt={tt} q={q} {...khoangXuat(han)} />}
                thanhDaChon={<ThanhDaChon nhan="dòng lõi" />}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
