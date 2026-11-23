import type { ReactNode } from 'react'
import { layNguoiDung } from '@/lib/nen-tang/phien'
import { coTheVaoCS, coTheVaoSales, laChiKyThuatVien } from '@/lib/nen-tang/gac-cong'
import { quyenChoMan } from '@/lib/nen-tang/kiem-quyen'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { lapKhu, QUYEN_MENU } from '@/lib/khung/ban-do-menu'
import { KhungGwt } from './KhungGwt'

/**
 * Vỏ server của khung điều hướng: tính quyền phía server (mỗi mục hỏi ĐÚNG mã quyền gác trang nó dẫn tới — QUYEN_MENU),
 * dựng bản đồ khu/menu thuần rồi đưa xuống client. Chưa đăng nhập → trả nội dung trần (layout gốc bọc cả /login).
 */
export async function Khung({ children }: { children: ReactNode }) {
  const user = await layNguoiDung()
  if (!user) return children
  const [chiKyThuat, vaoCS, vaoSales, quyen, suaDs] = await Promise.all([
    laChiKyThuatVien(),
    coTheVaoCS(),
    coTheVaoSales(),
    quyenChoMan(QUYEN_MENU),
    coSuaDanhSach(),
  ])
  const khu = lapKhu({ co: (ma) => quyen[ma] === true, chiKyThuat, vaoCS, vaoSales, suaDs })
  const md = user.user_metadata as { full_name?: string; name?: string } | undefined
  const email = user.email ?? null
  const ten = md?.full_name || md?.name || email?.split('@')[0] || 'Tài khoản'
  return (
    <KhungGwt khu={khu} ten={ten} email={email}>
      {children}
    </KhungGwt>
  )
}
