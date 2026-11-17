// Loại ticket: dữ liệu mở (lấy từ ticket thật), cho thêm loại mới ở form.
// CEO/Hiệp 17/11: loại ticket = loại LỖI → bỏ việc bảo trì / thay lõi (ống) lọc khỏi danh sách chọn
// (việc đó tạo ở mục Bảo trì). Ticket cũ mang các loại này vẫn giữ nguyên giá trị.
import { boDau } from '@/bang/timkiem'

export const DAI_TOI_DA_LOAI = 80
const khoa = (s: string) => boDau(s).replace(/\s+/g, ' ').trim()
const gon = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Việc bảo trì / thay lõi (ống, cốc) lọc — không phải loại lỗi. */
export function laViecBaoTri(s: string): boolean {
  const k = khoa(s)
  return /\bbao tri\b/.test(k) || /\bthay (loi|ong|coc)( loc)?\b/.test(k)
}

/** Danh sách cho ô chọn loại: bỏ việc bảo trì / thay lõi. */
export function loaiChoChon(ds: readonly string[]): string[] {
  return ds.filter((l) => !laViecBaoTri(l))
}

/** Chuẩn hoá loại người dùng gõ thêm; trùng loại đã có (bỏ dấu, hoa thường) → dùng loại đã có. */
export function chuanLoaiMoi(text: string, ds: readonly string[]):
  { ok: true; loai: string; daCo: boolean } | { ok: false; error: string } {
  const g = gon(text ?? '')
  if (!g) return { ok: false, error: 'Nhập tên loại.' }
  if (g.length > DAI_TOI_DA_LOAI) return { ok: false, error: `Tên loại tối đa ${DAI_TOI_DA_LOAI} ký tự.` }
  if (laViecBaoTri(g)) return { ok: false, error: 'Bảo trì / thay lõi lọc không phải lỗi — tạo ở mục Bảo trì.' }
  const trung = ds.find((l) => khoa(l) === khoa(g))
  return trung ? { ok: true, loai: trung, daCo: true } : { ok: true, loai: g, daCo: false }
}
