import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { chanNeuThieuQuyen, coQuyen } from '@/lib/nen-tang/kiem-quyen'
import { BangNhanVien } from '@/components/BangNhanVien'
import { MoiNhanSu } from '@/components/MoiNhanSu'
import { listAllStaff } from '@/lib/nen-tang/nhan-su'
import { layNhanVien } from '@/lib/nen-tang/phien'
import { laQuyenAdmin } from '@/lib/nen-tang/vai-tro'

export default async function NhanVienPage() {
  // Rào THẬT của trang này. Ẩn mục menu chỉ là cho gọn mắt.
  await chanNeuThieuQuyen('he_thong.nhan_su.xem', 'ADMIN')

  // Ẩn/hiện nút theo ĐÚNG quyền của người đang xem, không theo vai trò. Đây là
  // mảnh đầu tiên của việc "dọn giao diện theo ma trận" — cùng một mã quyền gác
  // cả nút lẫn Server Action nên hai bên không thể nói khác nhau.
  const [ds, toi, choXoa, choMatKhau] = await Promise.all([
    listAllStaff(),
    layNhanVien(),
    coQuyen('he_thong.nhan_su.xoa', 'ADMIN'),
    coQuyen('he_thong.nhan_su.mat_khau', 'ADMIN'),
  ])
  const soAdmin = ds.filter((n) => n.hoat_dong && laQuyenAdmin(n.vai_tro)).length

  return (
    <ManV2>
      <TrangDuLieu className="space-y-4">
        <PageHeader tieuDe="Nhân viên"
          hanhDong={<Button asChild variant="outline"><Link href="/nhan-vien/phan-quyen">Phân quyền theo vai trò</Link></Button>}
        />

        <p className="text-sm text-muted-foreground">
          {ds.length} người · {soAdmin} quản trị đang hoạt động. Ai đăng nhập bằng email
          <code className="mx-1 text-xs">@gwt.vn</code> lần đầu sẽ tự xuất hiện ở đây (đang khoá, chưa
          gán vai trò) — bật hoạt động và tích vai trò cho họ. Một người có thể giữ nhiều vai trò.
        </p>

        <BangNhanVien ds={ds} toiId={toi?.id ?? ''} choXoa={choXoa} choMatKhau={choMatKhau} />

        <MoiNhanSu />

        <Card className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Cách gán vai trò</p>
          <p>· Một người <b>kiêm nhiều bộ phận</b> thoải mái — CSKH + Sales, Trưởng CSKH + Trưởng Sales,
            hay nhân viên mảng này kiêm trưởng mảng kia đều được.</p>
          <p>· Trong <b>cùng một bộ phận</b> thì trưởng và nhân viên loại trừ nhau: tích Trưởng CSKH
            là tự bỏ tích Nhân viên CSKH.</p>
          <p>· <b>Trưởng CSKH</b> thêm quyền <i>duyệt</i> (serial, yêu cầu sửa, export, khách chờ) + nghiệp
            vụ nâng cao (ghi chi phí ticket, lắp/thu hồi/đổi máy, kho serial, nhóm lỗi, xuất báo cáo).</p>
          <p>· <b>Quản trị hệ thống</b>: toàn quyền — quản lý nhân viên, đồng bộ catalog, nhật ký, và
            <b> xoá thông tin khách</b>.</p>
          <p className="text-muted-foreground pt-1">
            CEO, Giám đốc Kỹ thuật, CTV lắp đặt, Marketing, Kho, Kế toán, Tài chính mới được thêm vào
            danh sách và <b>chưa có quyền riêng</b> trong app — sẽ cấp ở bước ma trận phân quyền.
          </p>
        </Card>
      </TrangDuLieu>
    </ManV2>
  )
}
