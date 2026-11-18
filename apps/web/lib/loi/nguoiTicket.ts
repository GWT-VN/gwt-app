// Danh sách người trên ticket (CS theo dõi · Kỹ thuật) — hàm thuần, dùng chung client/server.
// Chốt 18/11/2026: thêm / đổi tên / ẩn ngay trên ticket; "xoá" = ẩn (ticket cũ vẫn hiện đúng tên).
import { boDau } from '@/bang/timkiem'

export const DAI_TOI_DA_TEN = 60

export type NguoiDs = { id: string; ten: string; hoat_dong: boolean; la_ctv?: boolean }
export type NguoiChon = NguoiDs & { an: boolean }

const gon = (s: string) => s.replace(/\s+/g, ' ').trim()
const khoa = (s: string) => gon(boDau(s))

/**
 * Chuẩn hoá tên người dùng gõ. Trùng một người đã có (bỏ dấu, hoa thường; kể cả người đã ẩn) → trả người đó
 * để nơi gọi dùng lại / hiện lại thay vì tạo bản trùng. `boQuaId`: người đang được đổi tên.
 */
export function chuanTenNguoi(text: string, ds: readonly NguoiDs[], boQuaId?: string):
  { ok: true; ten: string; trung: NguoiDs | null } | { ok: false; error: string } {
  if (/[\u0000-\u001f\u007f]/.test(text ?? '')) return { ok: false, error: 'Tên không được xuống dòng hay chứa ký tự lạ.' }
  const ten = gon(text ?? '')
  if (!ten) return { ok: false, error: 'Nhập tên.' }
  if (ten.length > DAI_TOI_DA_TEN) return { ok: false, error: `Tên tối đa ${DAI_TOI_DA_TEN} ký tự.` }
  const trung = ds.find((x) => x.id !== boQuaId && khoa(x.ten) === khoa(ten)) ?? null
  return { ok: true, ten: trung ? trung.ten : ten, trung }
}

/** Danh sách cho ô chọn: người đang dùng (giữ thứ tự) + người đang gán dù đã ẩn (đánh dấu `an`). */
export function dsChoChon(ds: readonly NguoiDs[], dangGan: string | null): NguoiChon[] {
  const ra: NguoiChon[] = ds.filter((x) => x.hoat_dong).map((x) => ({ ...x, an: false }))
  const cu = dangGan ? ds.find((x) => x.id === dangGan && !x.hoat_dong) : undefined
  if (cu) ra.push({ ...cu, an: true })
  return ra
}

/** Tài khoản staff của thợ (khớp email) — để "ticket của tôi" của thợ có tài khoản vẫn chạy. CTV không có → null. */
export function taiKhoanCuaTho(email: string | null | undefined, staff: readonly { id: string; email: string | null }[]): string | null {
  const e = email?.trim().toLowerCase()
  if (!e) return null
  return staff.find((s) => s.email?.trim().toLowerCase() === e)?.id ?? null
}
