import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/nen-tang/phien'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { dsNguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { dsKyThuat, trangThaiTaiKhoanKT } from '@/app/actions'
import { DauTrang } from '@/components/DauTrang'
import { DanhSachCs } from '@/components/ticket/DanhSachCs'
import { RosterKyThuat } from '@/components/RosterKyThuat'

/**
 * Danh sách người (Hiệp 19/11/2026): chỗ DUY NHẤT thêm / xoá CS theo dõi và thêm / sửa / xoá kỹ thuật.
 * Hai tab: ?tab=cs (mặc định) và ?tab=kt (hồ sơ thợ đầy đủ, thay trang /ky-thuat/nhan-su cũ).
 * CHỈ admin@ + ai@ trong giai đoạn hoàn thiện (lib/nen-tang/sua-danh-sach.ts). Trên ticket mọi người chỉ chọn.
 */
export default async function DanhSachNguoiPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireStaff()
  if (!(await coSuaDanhSach())) redirect('/?loi=khong_du_quyen')
  const tab = (await searchParams).tab === 'kt' ? 'kt' : 'cs'
  const r = await dsNguoiQuanTri()
  if (!r.ok) {
    return <main className="min-h-screen bg-slate-50 p-6"><p className="text-sm text-red-600">{r.error}</p></main>
  }
  // Hồ sơ thợ đòi cs.ky_thuat.ho_so (như trang /ky-thuat/nhan-su cũ) — hỏi trước khi đọc.
  const quyen = await hoiQuyen({ hoSo: ['cs.ky_thuat.ho_so', 'QUANLY'], taiKhoanKT: ['cs.ky_thuat.tai_khoan', 'ADMIN'] })
  const kt = tab === 'kt' && quyen.hoSo ? await Promise.all([dsKyThuat(false), trangThaiTaiKhoanKT()]) : null
  const soTicket = Object.fromEntries(r.kt.map((x) => [x.id, x.so_ticket]))
  const soLichHen = Object.fromEntries(r.kt.map((x) => [x.id, x.so_lich_hen]))

  const the = (ma: 'cs' | 'kt', nhan: string, n: number) => (
    <Link href={`/danh-sach-nguoi?tab=${ma}`} aria-current={tab === ma ? 'page' : undefined}
      className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === ma ? 'border-slate-900 text-slate-900 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
      {nhan} ({n})
    </Link>
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Danh sách người"
          phuDe="CS theo dõi và kỹ thuật để chọn trên ticket, gán lịch. Chỉ admin@ và ai@ sửa được. Xoá một người thì ticket đã xong vẫn giữ tên; gõ lại đúng tên để khôi phục." />
        <nav className="flex gap-1 border-b">
          {the('cs', 'CS theo dõi', r.cs.filter((x) => x.hoat_dong).length)}
          {the('kt', 'Kỹ thuật', r.kt.filter((x) => x.hoat_dong).length)}
        </nav>
        {tab === 'cs' ? <DanhSachCs ds={r.cs} />
          : kt ? <RosterKyThuat dsKt={kt[0]} trangThai={kt[1]} choTaiKhoanKT={quyen.taiKhoanKT} soTicket={soTicket} soLichHen={soLichHen} />
          : <p className="text-sm text-slate-500">Tài khoản này chưa có quyền xem hồ sơ kỹ thuật.</p>}
      </div>
    </main>
  )
}
