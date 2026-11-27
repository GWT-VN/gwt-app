import { Suspense } from 'react'
import { bhChoKichHoat, bhChoKichHoatDem, listTabView } from '@/app/actions'
import { BHChoKichHoatList, BangBHChoSerial } from '@/components/BHChoKichHoatList'
import { dsMayChoSerial } from '@/app/may/chua-serial-actions'
import { docAnToan } from '@/lib/loi/anToan'
import { boDau } from '@/bang/timkiem'
import { KhungChon } from '@/bang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

const GIOI_HAN = 500

// Máy đã bán hoặc đã lắp mà bảo hành chưa kích hoạt — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
// Kích hoạt xong dòng tự biến mất khỏi bảng.
export default async function BHChoKichHoatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; nguon?: string }>
}) {
  const { q = '', nguon = '' } = await searchParams
  const choSerialTab = nguon === 'cho_serial'
  const [rows, dem, { data: choSerial }, tabRieng, quyen] = await Promise.all([
    choSerialTab ? Promise.resolve([]) : bhChoKichHoat(q, nguon || undefined, GIOI_HAN),
    bhChoKichHoatDem(),
    docAnToan('dsMayChoSerial', () => dsMayChoSerial(), []),
    listTabView('bh_cho_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  const k = boDau(q).toLowerCase()
  const choSerialLoc = k
    ? choSerial.filter((m) => boDau([m.serial, m.internal_code, m.parent_serial, m.ten_khach].join(' ')).toLowerCase().includes(k))
    : choSerial
  const chung = {
    tabRieng,
    quyenTabChung: quyen.viewChung,
    demTab: {
      'tat-ca': dem.da_lap + dem.don_sales,
      'da-lap': dem.da_lap,
      'don-ban': dem.don_sales,
      'cho-serial': choSerial.length,
    },
  }

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{ q, nguon }}>
            <Suspense>
              {/* key: hai bảng khác cột — đổi tab là dựng lại trạng thái cột. */}
              {choSerialTab ? (
                <BangBHChoSerial key="serial" items={choSerialLoc} {...chung} />
              ) : (
                <BHChoKichHoatList key="cho" items={rows} gioiHan={GIOI_HAN} {...chung} />
              )}
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
