import type { DongSaoKe, TaiKhoan } from '../sao-ke/kieu'
import { khoaSaoKe } from '../chuan-hoa'
import { ganKhoaTheoLan } from './khoa-dong'

/** Gán line_key cho từng dòng sao kê ngân hàng — cùng khuôn ganKhoaDong(), khoá tự nhiên = tk|ngay|soCt|no|co
 * (một số ngân hàng như TCB có thể không có số chứng từ riêng cho từng dòng → cần `lan` để tách dòng trùng). */
export function ganKhoaSaoKe(dong: DongSaoKe[], taiKhoan: TaiKhoan): string[] {
  return ganKhoaTheoLan(
    dong,
    (d) => d.rowOrder,
    (d) => [taiKhoan, d.ngay, d.soCt, String(d.no), String(d.co)].join('|'),
    (d, lan) => khoaSaoKe(taiKhoan, d.ngay, d.soCt, d.no, d.co, lan),
  )
}
