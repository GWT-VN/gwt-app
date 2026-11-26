import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { listCatalogForPicker, listChannels } from '../../_db'
import { OrderForm } from '../../OrderForm'

export const metadata = { title: 'Tạo đơn · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function TaoDonPage() {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const [catalog, channels] = await Promise.all([listCatalogForPicker(), listChannels()])

  return (
    <SalesScreen className="max-w-[1100px] space-y-5">
      <div className="text-sm"><Link href="/sales" className="text-(--color-text-info) hover:underline">← Đơn hàng</Link></div>
      <div>
        <PageHeader tieuDe="Tạo đơn mới" />
        <p className="text-sm text-muted-foreground">Mã đơn sinh tự động khi lưu — <span className="font-mono">YYMMDD-{'{E/U/O}'}nnn</span></p>
      </div>
      <OrderForm catalog={catalog} channels={channels} mode="create" />
    </SalesScreen>
  )
}
