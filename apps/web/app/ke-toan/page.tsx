import Link from 'next/link'
import { danhSachKy } from './actions'
import { FormUpload } from './hoa-don/[ky]/FormUpload'

export const metadata = { title: 'Kế toán · Kỳ hoá đơn' }
export const dynamic = 'force-dynamic'

/** Tháng TRƯỚC theo giờ VN (file NEXIA tháng N về đầu tháng N+1, spec §4). Múi giờ cố định để server (UTC) không lệch trình duyệt. */
function thangTruoc(): string {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit' }).format(new Date()).split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 2, 1))
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function KeToanPage() {
  const ds = await danhSachKy() // gác quyền nằm trong action (chanKeToan → redirect), không lặp ở page
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1100px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-xl font-semibold">Kế toán · Hoá đơn theo kỳ</h1>
            <p className="text-sm text-slate-500">Chọn tháng + file NEXIA: app tạo kỳ, gán mã KMCP, rồi tải lại Excel gửi kế toán.</p></div>
        </header>
        <FormUpload macDinh={thangTruoc()} />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">Kỳ</th><th className="p-2">Trạng thái</th><th className="p-2 text-right">Dòng vào</th>
              <th className="p-2 text-right">Dòng ra</th><th className="p-2 text-right">Cảnh báo</th><th className="p-2">Cập nhật</th></tr></thead>
            <tbody>
              {ds.length === 0 ? <tr><td colSpan={6} className="p-4 text-center text-slate-500">Chưa có kỳ nào — chọn tháng và file NEXIA ở trên.</td></tr> : null}
              {ds.map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="p-2"><Link className="font-medium text-[#3f8a6a] underline" href={`/ke-toan/hoa-don/${k.ky}`}>{k.ky}</Link></td>
                  <td className="p-2">{k.status === 'da_gui' ? `Đã gửi${k.edits_after_sent ? ` · ${k.edits_after_sent} sửa` : ''}` : 'Đang xử lý'}</td>
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
