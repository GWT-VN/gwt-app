/**
 * Nhãn + tiện ích hiển thị cho khu Kho (sổ số lượng kho v2). Thuần, không đụng DB → component client import được.
 */
const TRANG_THAI: Record<string, string> = { approved: 'đã vào sổ', need_review: 'chờ duyệt mã', rejected: 'bỏ qua', none: '' }
export const nhanTrangThai = (x: string | null | undefined) => (x ? TRANG_THAI[x] ?? x : '')

export function mauTrangThai(x: string | null | undefined): string {
  if (x === 'need_review') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (x === 'rejected') return 'bg-slate-100 text-slate-500'
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
}

const CANH_BAO: Record<string, string> = { sap_het: 'Sắp hết', am: 'Âm — kiểm lại' }
export const nhanCanhBao = (x: string | null | undefined) => (x ? CANH_BAO[x] ?? x : '')

export function mauLoai(loai: string): string {
  if (loai === 'Nhập') return 'text-emerald-700'
  if (loai === 'Xuất') return 'text-red-700'
  return 'text-indigo-700'
}

/** Kênh Discord kho Nguyễn Xiển — bot Bắp đọc tin ở đây. */
export const KENH_KHO_NX = '1484056527173062737'
const GUILD = '1484009253831315456'
export function linkTinDiscord(id: string | null | undefined, kenh = KENH_KHO_NX): string | null {
  return id && /^\d{15,22}$/.test(id) ? `https://discord.com/channels/${GUILD}/${kenh}/${id}` : null
}

export const LOAI = ['Nhập', 'Xuất', 'Điều chỉnh'] as const
export const KHO = [{ ma: 'NX', ten: 'Kho Nguyễn Xiển' }, { ma: 'HCM', ten: 'Kho HCM' }] as const
export const tenKho = (ma: string) => KHO.find((k) => k.ma === ma)?.ten ?? ma
