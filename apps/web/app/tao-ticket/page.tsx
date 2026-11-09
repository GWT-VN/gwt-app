import { ticketTypes } from '@/app/actions'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { docAnToan, THIEU_DANH_MUC } from '@/lib/loi/anToan'
import { listStaff, currentStaff } from '@/lib/nen-tang/nhan-su'
import { TaoTicketForm } from '@/components/TaoTicketForm'

export default async function TaoTicketPage() {
  const [loaiList, staff, me, { data: dsLoi, loi: thieuDanhMuc }] = await Promise.all([
    ticketTypes(), listStaff(), currentStaff(), docAnToan('danhMucLoi', () => danhMucLoi(true), []),
  ])
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Tạo ticket</h1>
        </header>
        {thieuDanhMuc && <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">⚠️ {THIEU_DANH_MUC}</p>}
        <TaoTicketForm loaiList={loaiList} staff={staff} meId={me?.id} dsLoi={dsLoi} />
      </div>
    </main>
  )
}
