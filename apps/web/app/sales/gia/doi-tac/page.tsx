import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { danhSachDoiTac, lichSuBac } from '../actions'
import { quyenCtkm } from '../../ctkm/actions'
import { GanBac } from './GanBac'

export const metadata = { title: 'Đối tác đại lý · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function DoiTacPage() {
  const [ds, lichSu, quyen] = await Promise.all([danhSachDoiTac(), lichSuBac(), quyenCtkm()])
  return (
    <SalesScreen className="max-w-[1000px] space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/sales/gia" className="text-(--color-text-info) hover:underline">← Bảng giá niêm yết</Link>
        <Link href="/sales/gia/chinh-sach" className="text-(--color-text-info) hover:underline">Chính sách giá đại lý →</Link>
      </div>
      <div>
        <PageHeader tieuDe="Đối tác đại lý" />
        <p className="text-sm text-muted-foreground">
          Chỉ đối tác có bậc mới nằm ở đây. Khách không gán bậc mặc định là <b>khách lẻ</b>,
          hưởng khuyến mãi theo <b>kênh của đơn</b>.
        </p>
      </div>
      <GanBac ds={ds} lichSu={lichSu} coQuyenSoan={quyen.soan} />
    </SalesScreen>
  )
}
