import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { CustomerForm } from '../../CustomerForm'
import { kenhChonDuoc, nhanVienChonDuoc } from '../../actions'

export const metadata = { title: 'Thêm khách · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function TaoKhachPage() {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')

  const [kenh, nhanVien] = await Promise.all([kenhChonDuoc(), nhanVienChonDuoc()])

  return (
    <SalesScreen className="max-w-[1100px] space-y-5">
      <div className="text-sm"><Link href="/sales/khach" className="text-(--color-text-info) hover:underline">← Khách hàng</Link></div>
      <div>
        <PageHeader tieuDe="Thêm khách mới" />
        <p className="text-sm text-muted-foreground">App cấp mã <span className="font-mono">KA…</span> tự động khi lưu. Khách cũ <span className="font-mono">KH…</span> vẫn sửa ở Google Sheet.</p>
      </div>
      <div className="max-w-2xl"><CustomerForm mode="create" kenh={kenh} nhanVien={nhanVien} /></div>
    </SalesScreen>
  )
}
