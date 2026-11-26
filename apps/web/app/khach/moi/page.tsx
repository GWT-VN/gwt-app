import { redirect } from 'next/navigation'
import { coTheVaoCS } from '@/lib/nen-tang/gac-cong'
import { requireStaff } from '@/lib/nen-tang/phien'
import { kenhChon } from '@/app/actions'
import { TaoKhachForm } from '@/components/TaoKhachForm'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Tạo khách · GWT CSKH' }
export const dynamic = 'force-dynamic'

export default async function TaoKhachPage() {
  await requireStaff()
  if (!(await coTheVaoCS())) redirect('/work')
  const kenh = await kenhChon()

  return (
    <ManV2>
      <TrangDuLieu className="max-w-3xl">
        <div className="min-w-0 space-y-4">
          <PageHeader
            tieuDe="Tạo khách mới"
            meta={["Nhập SĐT trước — hệ thống tra xem đã có khách này chưa"]}
          />
          <TaoKhachForm kenh={kenh} />
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
