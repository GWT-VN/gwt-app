import 'server-only'
import { layNhanVien } from './phien'
import { duocSuaDanhSach } from './sua-danh-sach'

/** Người đang đăng nhập được thêm / xoá người trong danh sách ticket (CS theo dõi, kỹ thuật)? Gọi SAU requireStaff(). */
export async function coSuaDanhSach(): Promise<boolean> {
  const nv = await layNhanVien()
  return duocSuaDanhSach(nv?.vai_tro)
}
