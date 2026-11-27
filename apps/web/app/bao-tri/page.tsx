import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { maintenanceDue, maintenanceCounts, khoaTatCaBaoTri, listTabView, baoTriTheoThang } from '@/app/actions'
import { KhungChon, ThanhDaChon } from '@/bang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ExportBaoTriButton } from '@/components/ExportBaoTriButton'
import { BangBaoTri } from '@/components/BangBaoTri'
import { LichBaoTriThang } from '@/components/LichBaoTriThang'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { khoangXuat } from '@/app/may/truong-may'
import { SAP, VIEW_LICH } from './truong-bao-tri'

// Lịch bảo trì — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Tab "Lịch tháng" (`?view=lich`)
// vẽ lịch tháng thay bảng.
export default async function BaoTriPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { q = '', tt = '', han, cot, chieu, trang: trangRaw, view, thang: thangRaw, ngay } = await searchParams
  // Link cũ `?tt=lich` (trước khuôn F, lịch là một giá trị của `tt`) → tab Lịch tháng.
  if (tt === VIEW_LICH) {
    const p = new URLSearchParams({ view: VIEW_LICH, ...(thangRaw && { thang: thangRaw }), ...(ngay && { ngay }) })
    redirect(`/bao-tri?${p}`)
  }
  // Chặn giá trị rác trong đường dẫn trước khi đem đi so với due_date.
  const ngayOk = /^\d{4}-\d{2}-\d{2}$/.test(ngay ?? '') ? ngay : undefined
  const trang = Math.max(1, Number(trangRaw) || 1)
  const laLich = view === VIEW_LICH
  const thang = /^\d{4}-\d{2}$/.test(thangRaw ?? '') ? thangRaw! : new Date().toISOString().slice(0, 7)
  const [{ rows, tong, soTrang, sapXep }, counts, tabRieng, quyen, lichRows] = await Promise.all([
    laLich
      ? Promise.resolve({ rows: [], tong: 0, trang: 1, soTrang: 1, sapXep: { cot: 'due_date', tang: true, macDinh: true } } as Awaited<ReturnType<typeof maintenanceDue>>)
      : maintenanceDue(tt, q, { trang, cot, chieu, han }),
    maintenanceCounts(),
    listTabView('bao_tri_tab'),
    hoiQuyen({
      hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
      viewChung: ['he_thong.view_chung', 'QUANLY'],
      xuat: ['cs.bao_cao.xuat', 'QUANLY'],
    }),
    laLich ? baoTriTheoThang(thang) : Promise.resolve([]),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((r) => r.visit_id)}
            tong={tong}
            bat={!laLich && quyen.hangLoat}
            thamSo={{ q, tt, han, cot, chieu }}
            layTatCaKhoa={khoaTatCaBaoTri}
          >
            <Suspense>
              <BangBaoTri
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                choChon={!laLich && quyen.hangLoat}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                demTab={{
                  'tat-ca': counts['tat-ca'] ?? 0,
                  sap: counts[SAP] ?? 0,
                  'qua-han': counts['QUÁ HẠN'] ?? 0,
                  'con-han': counts['còn hạn'] ?? 0,
                  xong: counts['đã xong'] ?? 0,
                }}
                lich={laLich ? <LichBaoTriThang thang={thang} rows={lichRows} ngay={ngayOk} /> : undefined}
                canhBao={
                  <Alert color="info" className="mb-3">
                    <AlertDescription>
                      Gói bảo trì POE theo hợp đồng. Bấm <strong>“Đã bảo trì”</strong> sau mỗi lần đi để đúng tiến độ — số lần còn
                      lại tự trừ. Dòng “chưa khớp khách” là lịch từ Asana chưa gắn được vào hồ sơ khách.
                    </AlertDescription>
                  </Alert>
                }
                xuatExcel={quyen.xuat && <ExportBaoTriButton tt={tt} q={q} {...khoangXuat(han)} />}
                thanhDaChon={<ThanhDaChon nhan="lượt bảo trì" />}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
