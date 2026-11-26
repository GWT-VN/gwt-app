import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { chiTietCtkm, nguonChoForm, quyenCtkm } from '../actions'
import { CtkmForm } from '../CtkmForm'

export const metadata = { title: 'Sửa chương trình · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function SuaCtkmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quyen = await quyenCtkm()
  if (!quyen.soan) redirect('/sales/ctkm?loi=khong_du_quyen')
  const [ct, nguon] = await Promise.all([chiTietCtkm(id), nguonChoForm()])
  if (!ct) notFound()

  return (
    <SalesScreen className="max-w-[900px] space-y-4">
      <div className="text-sm"><Link href="/sales/ctkm" className="text-(--color-text-info) hover:underline">← Chương trình khuyến mãi</Link></div>
      <div>
        <PageHeader tieuDe={ct.ten} />
        <p className="text-sm text-muted-foreground">
          Sửa xong chương trình quay về <b>bản nháp</b> và phải duyệt lại — người soạn không tự đẩy thay đổi lên đơn đang chạy.
        </p>
      </div>
      <CtkmForm kenhDs={nguon.kenh} spDs={nguon.sp} initial={ct} coQuyenDuyet={quyen.duyet} />
    </SalesScreen>
  )
}
