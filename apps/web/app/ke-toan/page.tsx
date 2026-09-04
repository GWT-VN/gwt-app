import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { danhSachKy } from './actions'
import { FormTaoKy } from './FormTaoKy'

export const metadata = { title: 'Kế toán · Kỳ hoá đơn' }
export const dynamic = 'force-dynamic'

export default async function KeToanPage() {
  await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  const ds = await danhSachKy()
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1100px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-xl font-semibold">Kế toán · Hoá đơn theo kỳ</h1>
            <p className="text-sm text-slate-500">Upload file NEXIA, app gán mã KMCP, tải lại Excel gửi kế toán.</p></div>
          <FormTaoKy />
        </header>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">Kỳ</th><th className="p-2">Trạng thái</th><th className="p-2 text-right">Dòng vào</th>
              <th className="p-2 text-right">Dòng ra</th><th className="p-2 text-right">Cảnh báo</th><th className="p-2">Cập nhật</th></tr></thead>
            <tbody>
              {ds.length === 0 ? <tr><td colSpan={6} className="p-4 text-center text-slate-500">Chưa có kỳ nào — tạo kỳ rồi upload file NEXIA.</td></tr> : null}
              {ds.map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="p-2"><Link className="font-medium text-[#3f8a6a] underline" href={`/ke-toan/hoa-don/${k.ky}`}>{k.ky}</Link></td>
                  <td className="p-2">{k.status === 'da_gui' ? 'Đã gửi kế toán' : 'Đang xử lý'}</td>
                  <td className="p-2 text-right">{k.so_dong_vao}</td><td className="p-2 text-right">{k.so_dong_ra}</td>
                  <td className="p-2 text-right">{k.so_canh_bao > 0 ? <span className="rounded bg-amber-100 px-2 text-amber-800">{k.so_canh_bao}</span> : 0}</td>
                  <td className="p-2 text-slate-500">{new Date(k.cap_nhat).toLocaleString('vi-VN')}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
