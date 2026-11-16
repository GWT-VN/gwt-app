// File đính kèm cho Nhật ký trao đổi ticket (bảng ticket_note_tep + Storage bucket ticket-tep).
// Thuần hàm, dùng chung client + server.

export const KHO_TEP = 'ticket-tep'
export const GIOI_HAN_TEP = 50 * 1024 * 1024
export const SO_TEP_TOI_DA = 10
export const NHAN_LOAI = 'image/*,video/*,application/pdf'

export type TepVao = { ten: string; loai: string; kich_thuoc: number }
export type TepNhatKy = {
  id: string
  note_id: string
  ten: string
  loai: string
  kich_thuoc: number
  url: string | null   // signed URL, hết hạn sau 1 giờ
}

const loaiHopLe = (loai: string) => /^image\//.test(loai) || /^video\//.test(loai) || loai === 'application/pdf'

export function kiemTep(t: TepVao): { ok: true } | { ok: false; error: string } {
  if (typeof t?.ten !== 'string' || !t.ten.trim()) return { ok: false, error: 'File thiếu tên.' }
  if (typeof t.loai !== 'string' || !loaiHopLe(t.loai)) return { ok: false, error: `"${t.ten}": chỉ nhận ảnh, video hoặc PDF.` }
  if (!Number.isFinite(t.kich_thuoc) || t.kich_thuoc <= 0) return { ok: false, error: `"${t.ten}": file rỗng.` }
  if (t.kich_thuoc > GIOI_HAN_TEP) return { ok: false, error: `"${t.ten}": quá 50 MB.` }
  return { ok: true }
}

const sach = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9._-]+/g, '-').replace(/\.{2,}/g, '.').replace(/-+/g, '-').replace(/^[-.]+|-+$/g, '')

/** `<mã ticket>/<id>-<tên đã làm sạch>`; tên tối đa 80 ký tự, giữ đuôi file. */
export function duongDanTep(code: string, id: string, ten: string): string {
  const m = ten.lastIndexOf('.')
  const duoi = m > 0 ? sach(ten.slice(m + 1)).slice(0, 10) : ''
  const than = sach(m > 0 ? ten.slice(0, m) : ten).replace(/-+$/, '').slice(0, 80) || 'tep'
  return `${sach(code) || 'ticket'}/${sach(id)}-${than}${duoi ? `.${duoi}` : ''}`
}

/** Đường dẫn nằm đúng thư mục của ticket (chặn gắn file ticket khác / leo thư mục). */
export function thuocTicket(duongDan: string, code: string): boolean {
  return !duongDan.includes('..') && duongDan.startsWith(`${sach(code)}/`) && duongDan.split('/').length === 2
}

export function kieuTep(loai: string): 'anh' | 'video' | 'pdf' {
  return loai.startsWith('image/') ? 'anh' : loai.startsWith('video/') ? 'video' : 'pdf'
}

export function docKichThuoc(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`
  return `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
