import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { getOrderForEdit, listCatalogForPicker, listChannels } from '../../../_db'
import { OrderForm } from '../../../OrderForm'

export const metadata = { title: 'Sửa đơn · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function SuaDonPage({ params }: { params: Promise<{ code: string }> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const { code } = await params
  const orderCode = decodeURIComponent(code)
  const [initial, catalog, channels] = await Promise.all([
    getOrderForEdit(orderCode),
    listCatalogForPicker(),
    listChannels(),
  ])
  if (!initial) notFound() // đơn từ Google Sheet không sửa ở app

  return (
    <SalesScreen className="max-w-[1100px] space-y-5">
      <div className="text-sm"><Link href={`/sales/don/${encodeURIComponent(orderCode)}`} className="text-(--color-text-info) hover:underline">← Chi tiết đơn</Link></div>
      <div>
        <PageHeader tieuDe={<> Sửa đơn <span className="font-mono">{orderCode}</span></>} />
        <p className="text-sm text-muted-foreground">Lưu sẽ thay toàn bộ dòng sản phẩm bằng nội dung bên dưới.</p>
      </div>
      <OrderForm catalog={catalog} channels={channels} mode="edit" orderCode={orderCode} initial={initial} />
    </SalesScreen>
  )
}
