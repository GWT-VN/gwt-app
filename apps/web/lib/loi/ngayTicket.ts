// Ngày khách báo của từng lần lỗi + CS theo dõi (4 tên) — hàm thuần, dùng chung client/server.
// Ngày lưu dạng 'YYYY-MM-DD' (cột date); trống → dùng created_at như trước.

export const CS_THEO_DOI = ['Hiệp', 'Kiều Trang', 'Hiền', 'Tuyết Trang'] as const
export type CsTheoDoi = (typeof CS_THEO_DOI)[number]

const NGAY_SOM_NHAT = '2020-01-01'
const DINH_DANG = /^\d{4}-\d{2}-\d{2}$/

/** 'YYYY-MM-DD' theo giờ Việt Nam của một thời điểm. */
export function ngayVNHomNay(now: Date = new Date()): string {
  return new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10)
}

/** Ngày khách báo: '' / không có → null; chặn sai định dạng, ngày không có thật, tương lai, trước 2020. */
export function kiemNgay(x: unknown, homNay: string): { ok: true; ngay: string | null } | { ok: false; error: string } {
  if (x === undefined || x === null || x === '') return { ok: true, ngay: null }
  if (typeof x !== 'string' || !DINH_DANG.test(x)) return { ok: false, error: 'Ngày không hợp lệ.' }
  const d = new Date(`${x}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== x) return { ok: false, error: 'Ngày không có thật.' }
  if (x > homNay) return { ok: false, error: 'Ngày khách báo không được ở tương lai.' }
  if (x < NGAY_SOM_NHAT) return { ok: false, error: 'Ngày quá xa (trước 2020).' }
  return { ok: true, ngay: x }
}

/** Tên CS theo dõi: '' → null (bỏ gán); chỉ nhận đúng 4 tên. */
export function kiemCsTheoDoi(x: unknown): { ok: true; ten: CsTheoDoi | null } | { ok: false; error: string } {
  if (x === undefined || x === null || x === '') return { ok: true, ten: null }
  if (typeof x === 'string' && (CS_THEO_DOI as readonly string[]).includes(x)) return { ok: true, ten: x as CsTheoDoi }
  return { ok: false, error: 'CS theo dõi chỉ chọn Hiệp, Kiều Trang, Hiền hoặc Tuyết Trang.' }
}

/** Khớp check tickets_note_do_dai trong migration 20261126035932_cs_ticket_note. */
export const GHI_CHU_TOI_DA = 20000

/** Ghi chú tự do: văn bản thuần, CRLF → LF, cắt khoảng trắng hai đầu; rỗng → null. */
export function kiemGhiChu(x: unknown): { ok: true; note: string | null } | { ok: false; error: string } {
  if (x === undefined || x === null) return { ok: true, note: null }
  if (typeof x !== 'string') return { ok: false, error: 'Ghi chú phải là văn bản.' }
  const s = x.replace(/\r\n?/g, '\n').trim()
  if (s.length > GHI_CHU_TOI_DA) return { ok: false, error: `Ghi chú tối đa ${GHI_CHU_TOI_DA} ký tự.` }
  return { ok: true, note: s || null }
}

/** Ngày hiển thị của một lần: ngày khách báo nếu có, không thì ngày tạo (giờ VN). */
export function ngayCuaLan(ngay: string | null | undefined, createdAt: string | null | undefined): string | null {
  if (ngay) return ngay
  if (!createdAt) return null
  return ngayVNHomNay(new Date(createdAt))
}

/** Số ngày từ `tu` đến `den` (cùng dạng 'YYYY-MM-DD'). */
export function soNgayMo(tu: string, den: string): number {
  return Math.round((Date.parse(`${den}T00:00:00Z`) - Date.parse(`${tu}T00:00:00Z`)) / 86_400_000)
}

/** 'YYYY-MM-DD' → 'dd/mm/yyyy'. */
export function ngayVNHienThi(ngay: string | null): string {
  if (!ngay) return ''
  const [y, m, d] = ngay.split('-')
  return `${d}/${m}/${y}`
}
