import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import { NutQuayLai } from '@/components/NutQuayLai'
import { NhomLoiForm } from '@/components/NhomLoiForm'
import { ManV2 } from '@/components/khung/ManV2'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export default async function TaoNhomLoiPage({
  searchParams,
}: {
  searchParams: Promise<{ goi_y?: string; ten?: string; tickets?: string }>
}) {
  await chanNeuThieuQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')
  const { goi_y, ten, tickets } = await searchParams
  const dsTicket = tickets ? tickets.split(',').filter(Boolean) : []

  return (
    <ManV2>
      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5 sm:px-6">
        <PageHeader duongDan={<NutQuayLai macDinh="/nhom-loi" />} tieuDe="Tạo nhóm lỗi" />
        <Card>
          <NhomLoiForm goiYMau={goi_y} goiYTen={ten} goiYTickets={dsTicket} />
        </Card>
      </main>
    </ManV2>
  )
}