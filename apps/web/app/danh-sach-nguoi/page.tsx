import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/nen-tang/phien'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { dsNguoiQuanTri } from '@/app/ticket/nguoi-actions'
import { dsKyThuat, trangThaiTaiKhoanKT } from '@/app/actions'
import { DanhSachCs } from '@/components/ticket/DanhSachCs'
import { RosterKyThuat } from '@/components/RosterKyThuat'

/**
 * Danh sách người (Hiệp 19/11/2026): chỗ DUY NHẤT thêm / xoá CS theo dõi và thêm / sửa / xoá kỹ thuật.
 * Hai tab: ?tab=cs (mặc định) và ?tab=kt (hồ sơ thợ đầy đủ, thay trang /ky-thuat/nhan-su cũ).
 * CHỈ người giữ vai trò "Sửa danh sách người" (bánh răng › Nhân viên, cột DS người › Sửa). Trên ticket mọi người chỉ chọn.
 */
export default async function DanhSachNguoiPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireStaff()
  if (!(await coSuaDanhSach())) redirect('/?loi=khong_du_quyen')
  const tab = (await searchParams).tab === 'kt' ? 'kt' : 'cs'
  const r = await dsNguoiQuanTri()
  if (!r.ok) {
    return <ManV2><TrangDuLieu><PageHeader tieuDe="Danh sách người" /><Alert color="danger"><AlertDescription>{r.error}</AlertDescription></Alert></TrangDuLieu></ManV2>
  }
  // Hồ sơ thợ đòi cs.ky_thuat.ho_so (như trang /ky-thuat/nhan-su cũ) — hỏi trước khi đọc.
  const quyen = await hoiQuyen({ hoSo: ['cs.ky_thuat.ho_so', 'QUANLY'], taiKhoanKT: ['cs.ky_thuat.tai_khoan', 'ADMIN'] })
  const kt = tab === 'kt' && quyen.hoSo ? await Promise.all([dsKyThuat(false), trangThaiTaiKhoanKT()]) : null
  const soTicket = Object.fromEntries(r.kt.map((x) => [x.id, x.so_ticket]))
  const soLichHen = Object.fromEntries(r.kt.map((x) => [x.id, x.so_lich_hen]))

  const the = (ma: 'cs' | 'kt', nhan: string, n: number) => (
    <Button asChild size="sm" variant={tab === ma ? 'default' : 'outline'}>
      <Link href={`/danh-sach-nguoi?tab=${ma}`} aria-current={tab === ma ? 'page' : undefined}>{nhan} ({n})</Link>
    </Button>
  )

  return (
    <ManV2>
      <TrangDuLieu className="max-w-4xl space-y-4">
        <PageHeader tieuDe="Danh sách người" />
        <p className="text-sm text-muted-foreground">
          Danh sách CS theo dõi và kỹ thuật dùng để chọn trên ticket, gán lịch. Chỉ người có vai trò “Sửa danh sách người” (bánh răng › Nhân viên) sửa được.
          Ticket đã xong vẫn giữ tên người đã xoá. Gõ lại đúng tên để khôi phục.
        </p>
        <nav aria-label="Danh sách người" className="flex flex-wrap gap-2">
          {the('cs', 'CS theo dõi', r.cs.filter((x) => x.hoat_dong).length)}
          {the('kt', 'Kỹ thuật', r.kt.filter((x) => x.hoat_dong).length)}
        </nav>
        {tab === 'cs' ? <DanhSachCs ds={r.cs} />
          : kt ? <RosterKyThuat dsKt={kt[0]} trangThai={kt[1]} choTaiKhoanKT={quyen.taiKhoanKT} soTicket={soTicket} soLichHen={soLichHen} />
          : <Alert color="warning"><AlertDescription>Tài khoản này chưa có quyền xem hồ sơ kỹ thuật.</AlertDescription></Alert>}
      </TrangDuLieu>
    </ManV2>
  )
}
