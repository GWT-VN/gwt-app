import { requireStaff } from '@/lib/nen-tang/phien'
import { LapBoForm } from '@/components/LapBoForm'
import { NutQuayLai } from '@/components/NutQuayLai'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export default async function LapBoPage() {
  await requireStaff()
  return (
    <ManV2>
      <TrangDuLieu className="max-w-3xl">
        <div className="min-w-0 space-y-4">
          <NutQuayLai macDinh="/" />
          <PageHeader tieuDe="Lắp bộ (combo)" meta={[<>Chọn bộ WH15A/WH30A → gán serial từng thiết bị từ kho → hệ tự sinh mã bộ
              (vd <span className="tabular-nums">WH30A202608001</span>) và kích hoạt bảo hành từng thiết bị.</>]} />
          <LapBoForm />
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
