import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { nguonChoForm, quyenCtkm } from '../actions'
import { CtkmForm } from '../CtkmForm'

export const metadata = { title: 'Tạo chương trình · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function TaoCtkmPage() {
  const quyen = await quyenCtkm()
  if (!quyen.soan) redirect('/sales/ctkm?loi=khong_du_quyen')
  const nguon = await nguonChoForm()

  return (
    <SalesScreen className="max-w-[900px] space-y-4">
      <div className="text-sm"><Link href="/sales/ctkm" className="text-(--color-text-info) hover:underline">← Chương trình khuyến mãi</Link></div>
      <div>
        <PageHeader tieuDe="Tạo chương trình khuyến mãi" />
        <p className="text-sm text-muted-foreground">Lưu xong là <b>bản nháp</b> — chưa áp cho đơn nào cho tới khi được ban hành.</p>
      </div>
      <CtkmForm kenhDs={nguon.kenh} spDs={nguon.sp} coQuyenDuyet={quyen.duyet} />
    </SalesScreen>
  )
}
