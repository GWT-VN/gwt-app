import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import { catalogSyncLast } from '@/app/actions'
import { NutDongBoCatalog } from '@/components/NutDongBoCatalog'

export default async function DongBoCatalogPage() {
  await chanNeuThieuQuyen('he_thong.catalog', 'ADMIN')
  const logs = await catalogSyncLast()

  return (
    <ManV2>
      <TrangDuLieu className="space-y-4">
        <PageHeader tieuDe="Đồng bộ catalog" />

        <Alert color="info"><AlertDescription>
          6 bảng gương catalog (mã nội bộ, lõi lọc, chính sách bảo hành…) được kéo từ
          <strong> GWT-Masterdata</strong>. Chạy tự động hàng ngày; bấm nút để cập nhật ngay khi Masterdata vừa đổi.
        </AlertDescription></Alert>

        <Card>
          <NutDongBoCatalog logs={logs} />
        </Card>
      </TrangDuLieu>
    </ManV2>
  )
}
