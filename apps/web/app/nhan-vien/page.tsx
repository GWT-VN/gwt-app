import Link from 'next/link'
import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { chanNeuThieuQuyen, coQuyen, hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { listTabView } from '@/app/actions'
import { boDau } from '@/bang'
import { apLoc, docTatCa, type TruongDuLieu } from '@/bang/locTruong'
import { BangNhanVien, type DongNhanVien } from '@/components/BangNhanVien'
import { MoiNhanSu } from '@/components/MoiNhanSu'
import { listAllStaff } from '@/lib/nen-tang/nhan-su'
import { layNhanVien } from '@/lib/nen-tang/phien'
import { laQuyenAdmin } from '@/lib/nen-tang/vai-tro'
import { TRUONG_NV } from './truong-nhan-vien'

/** Lọc trong bộ nhớ: danh sách nhân sự chỉ vài chục người, `listAllStaff` đã trả đủ. */
const DU_LIEU: TruongDuLieu<DongNhanVien>[] = [
  { id: 'tt', kieu: 'chon', lay: (n) => (n.hoat_dong ? 'hoat-dong' : 'khoa') },
  { id: 'vt', kieu: 'chon', lay: (n) => n.vai_tro },
]

export default async function NhanVienPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  // Rào THẬT của trang này. Ẩn mục menu chỉ là cho gọn mắt.
  await chanNeuThieuQuyen('he_thong.nhan_su.xem', 'ADMIN')
  const sp = await searchParams

  // Ẩn/hiện nút theo ĐÚNG quyền của người đang xem, không theo vai trò. Đây là
  // mảnh đầu tiên của việc "dọn giao diện theo ma trận" — cùng một mã quyền gác
  // cả nút lẫn Server Action nên hai bên không thể nói khác nhau.
  const [tatCa, toi, choXoa, choMatKhau, tabRieng, quyen] = await Promise.all([
    listAllStaff(),
    layNhanVien(),
    coQuyen('he_thong.nhan_su.xoa', 'ADMIN'),
    coQuyen('he_thong.nhan_su.mat_khau', 'ADMIN'),
    listTabView('nhan_vien_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  const soAdmin = tatCa.filter((n) => n.hoat_dong && laQuyenAdmin(n.vai_tro)).length
  const q = boDau((sp.q ?? '').trim()).toLowerCase()
  const ds = apLoc(
    tatCa.filter((n) => !q || boDau(`${n.ten} ${n.email ?? ''}`).toLowerCase().includes(q)),
    docTatCa(sp, TRUONG_NV),
    DU_LIEU,
  )

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <Suspense>
            <BangNhanVien
              ds={ds}
              tong={tatCa.length}
              toiId={toi?.id ?? ''}
              choXoa={choXoa}
              choMatKhau={choMatKhau}
              tabRieng={tabRieng}
              quyenTabChung={quyen.viewChung}
              demTab={{
                'tat-ca': tatCa.length,
                'hoat-dong': tatCa.filter((n) => n.hoat_dong).length,
                khoa: tatCa.filter((n) => !n.hoat_dong).length,
                'chua-vai-tro': tatCa.filter((n) => !n.vai_tro.length).length,
              }}
              nutChinh={<Button asChild variant="outline"><Link href="/nhan-vien/phan-quyen">Phân quyền theo vai trò</Link></Button>}
              ghiChu={
                <>
                  <p className="text-sm text-muted-foreground">
                    {tatCa.length} người · {soAdmin} quản trị đang hoạt động. Ai đăng nhập bằng email
                    <code className="mx-1 text-xs">@gwt.vn</code> lần đầu sẽ tự xuất hiện ở đây (đang khoá, chưa
                    gán vai trò — tab <b>Chưa gán vai trò</b>) — bật hoạt động và tích vai trò cho họ. Một người có thể giữ nhiều vai trò.
                  </p>

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
                </>
              }
            />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
