import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import { baoTriDaMap, baoTriSapHet, boiCanhKhach } from '@/app/actions'
import { BaoTriQuanLy } from '@/components/BaoTriQuanLy'

export default async function LenLichBaoTriPage({
  searchParams,
}: {
  searchParams: Promise<{ kh?: string }>
}) {
  await chanNeuThieuQuyen('cs.bao_tri.tao_plan', 'QUANLY')
  const { kh } = await searchParams
  const [daMap, sapHet] = await Promise.all([baoTriDaMap(), baoTriSapHet()])
  const moTaoKhach = kh ? { id: kh, ctx: await boiCanhKhach(kh) } : undefined
  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl space-y-4">
        <PageHeader tieuDe="Bảo trì · Lên lịch &amp; tạo gói" meta={["Lên lịch tự động (né cuối tuần theo vùng) · tạo gói mới cho khách · nhắc chào gói sắp hết."]} />
        <BaoTriQuanLy chuaMap={[]} daMap={daMap} sapHet={sapHet} phan="lenlich" moTaoKhach={moTaoKhach} />
      </TrangDuLieu>
    </ManV2>
  )
}
