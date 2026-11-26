import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import { baoTriChuaMap } from '@/app/actions'
import { BaoTriQuanLy } from '@/components/BaoTriQuanLy'

export default async function MapKhachBaoTriPage() {
  await chanNeuThieuQuyen('cs.bao_tri.tao_plan', 'QUANLY')
  const chuaMap = await baoTriChuaMap()
  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl space-y-4">
        <PageHeader tieuDe="Bảo trì · Map khách" meta={["Gán lịch bảo trì (từ Asana) vào hồ sơ khách kích hoạt máy."]} />
        <BaoTriQuanLy chuaMap={chuaMap} daMap={[]} sapHet={[]} phan="map" />
      </TrangDuLieu>
    </ManV2>
  )
}
