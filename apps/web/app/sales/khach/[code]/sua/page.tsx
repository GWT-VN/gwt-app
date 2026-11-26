import { SalesScreen } from '@/app/sales/_ui'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { getCustomerForEdit, isAppCustomer } from '../../../_db'
import { CustomerForm } from '../../../CustomerForm'
import { kenhChonDuoc, nhanVienChonDuoc } from '../../../actions'

export const metadata = { title: 'Sửa khách · GWT Sales' }
export const dynamic = 'force-dynamic'

export default async function SuaKhachPage({ params }: { params: Promise<{ code: string }> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const { code } = await params
  const customerCode = decodeURIComponent(code)
  // CEO chốt 22/08: khách từ Sheet CŨNG phải mở được màn sửa. Không đá về nữa —
  // form tự khoá những ô Sheet dựng lại từ đơn, các ô của app thì sửa được thật.
  const tuSheet = !isAppCustomer(customerCode)
  const [initial, kenh, nhanVien] = await Promise.all([getCustomerForEdit(customerCode), kenhChonDuoc(), nhanVienChonDuoc()])
  if (!initial) notFound()

  return (
    <SalesScreen className="max-w-[1100px] space-y-5">
      <div className="text-sm"><Link href={`/sales/khach/${encodeURIComponent(customerCode)}`} className="text-(--color-text-info) hover:underline">← Hồ sơ khách</Link></div>
      <div>
        <PageHeader tieuDe={<> Sửa khách <span className="font-mono">{customerCode}</span></>} />
      </div>
      <div className="max-w-2xl"><CustomerForm mode="edit" customerCode={customerCode} initial={initial} kenh={kenh} nhanVien={nhanVien} khoaSheet={tuSheet} /></div>
    </SalesScreen>
  )
}
