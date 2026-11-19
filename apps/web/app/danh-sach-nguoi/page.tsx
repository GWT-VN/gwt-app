import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/nen-tang/phien'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { dsNguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { DauTrang } from '@/components/DauTrang'
import { QuanLyDanhSachNguoi } from '@/components/ticket/QuanLyDanhSachNguoi'

/**
 * Danh sách người trên ticket (Hiệp 19/11/2026): thêm / xoá CS theo dõi và kỹ thuật — CHỈ admin@ + ai@ trong giai đoạn
 * hoàn thiện (lib/nen-tang/sua-danh-sach.ts). Trên ticket chỉ còn chọn người.
 */
export default async function DanhSachNguoiPage() {
  await requireStaff()
  if (!(await coSuaDanhSach())) redirect('/?loi=khong_du_quyen')
  const r = await dsNguoiQuanTri()
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Danh sách người trên ticket"
          phuDe="Thêm / xoá CS theo dõi và kỹ thuật. Chỉ admin@ và ai@ sửa được; trên ticket mọi người chỉ chọn." />
        {r.ok ? <QuanLyDanhSachNguoi cs={r.cs} kt={r.kt} /> : <p className="text-sm text-red-600">{r.error}</p>}
      </div>
    </main>
  )
}
