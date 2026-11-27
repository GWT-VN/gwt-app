import { ticketTypes } from '@/app/actions'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { docAnToan, THIEU_DANH_MUC } from '@/lib/loi/anToan'
import { listStaff, currentStaff } from '@/lib/nen-tang/nhan-su'
import { TaoTicketForm } from '@/components/TaoTicketForm'
import { docNguoiTicket } from '@/app/ticket/nguoi-actions'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export default async function TaoTicketPage() {
  const [loaiList, staff, me, { data: dsLoi, loi: thieuDanhMuc }, { data: nguoi, loi: thieuNguoi }] = await Promise.all([
    ticketTypes(), listStaff(), currentStaff(), docAnToan('danhMucLoi', () => danhMucLoi(true, true), []),
    // Kỹ thuật theo hồ sơ thợ (18/11); chưa áp migration → chọn theo tài khoản nhân viên như cũ.
    docAnToan('docNguoiTicket', () => docNguoiTicket(''), null),
  ])
  return (
    <ManV2>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
        <PageHeader tieuDe="Tạo ticket" />
        {thieuDanhMuc && (
          <Alert color="warning"><AlertDescription>{THIEU_DANH_MUC}</AlertDescription></Alert>
        )}
        <Card>
          <TaoTicketForm loaiList={loaiList} staff={staff} meId={me?.id} dsLoi={dsLoi} dsKt={thieuNguoi ? null : nguoi?.kt ?? null} />
        </Card>
      </main>
    </ManV2>
  )
}
