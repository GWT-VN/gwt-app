/**
 * Phần THUẦN của việc sửa sổ kho (Đợt 3 — 04/11/2026): chuẩn hoá / kiểm dữ liệu trước khi gọi hàm DB, tính "trường nào đổi",
 * dựng chữ "trước → sau" cho trang lịch sử, chuẩn hoá tên hàng giống bot. Không đụng DB → component client import được.
 * Lớp gọi DB thật ở `ghi.ts`.
 */
import { LOAI, nhanTrangThai } from './nhan'

/**
 * Chuẩn hoá tên hàng — chép ĐÚNG `chuanTen` của bot (gwt-discord-bot/shopee/kho-nx-doc.mjs), vốn giống hệt kho v2
 * (normalize.mjs norm). Đây là khoá `wh_alias.raw_norm`: lệch một ký tự là bot không nhận ra tên đã "nhớ".
 * Bot đổi hàm đó thì phải đổi ở đây (test sua.test.ts chốt các ví dụ chạy thật trên file gốc).
 */
export const chuanTen = (s: unknown): string => (s ?? '').toString().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')

export type Loai = (typeof LOAI)[number]
/** Các trường của một dòng sổ được phép sửa — đúng khoá `sua` của hàm wh_sua_dong. */
export type SuaDong = { ngay?: string; loai?: Loai; internal_code?: string; qty?: number; purpose?: string; note?: string }
export const TRUONG_SUA = ['ngay', 'loai', 'internal_code', 'qty', 'purpose', 'note'] as const

const RE_NGAY = /^\d{4}-\d{2}-\d{2}$/
const ngayHopLe = (x: string) => RE_NGAY.test(x) && !Number.isNaN(new Date(`${x}T00:00:00Z`).getTime())
  && new Date(`${x}T00:00:00Z`).toISOString().slice(0, 10) === x

/** Số từ ô nhập: chấp nhận "1,5" kiểu VN. Rỗng / không phải số → null. */
export function docSo(x: unknown): number | null {
  if (typeof x === 'number') return Number.isFinite(x) ? x : null
  const s = String(x ?? '').trim().replace(',', '.')
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Mã dòng sổ hợp lệ (bigint dương). */
export function kiemId(id: unknown): number {
  const n = typeof id === 'string' ? Number(id) : id
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n <= 0) throw new Error('Mã dòng sổ không hợp lệ')
  return n
}

/**
 * Kiểm + chuẩn hoá gói `sua` trước khi gửi DB (DB vẫn kiểm lại — đây chỉ để báo lỗi sớm, dễ hiểu).
 * Bỏ khoá lạ; chuỗi trim; mã viết hoa. Gói rỗng → lỗi "chưa đổi gì".
 */
export function chuanHoaSua(sua: Record<string, unknown>): SuaDong {
  const ra: SuaDong = {}
  if ('ngay' in sua) {
    const v = String(sua.ngay ?? '').trim()
    if (!ngayHopLe(v)) throw new Error(`Ngày không hợp lệ (${v || 'trống'})`)
    ra.ngay = v
  }
  if ('loai' in sua) {
    const v = String(sua.loai ?? '')
    if (!(LOAI as readonly string[]).includes(v)) throw new Error('Loại phải là Nhập / Xuất / Điều chỉnh')
    ra.loai = v as Loai
  }
  if ('internal_code' in sua) {
    const v = String(sua.internal_code ?? '').trim().toUpperCase()
    if (!v) throw new Error('Mã không được để trống (muốn bỏ dòng thì Huỷ)')
    ra.internal_code = v
  }
  if ('qty' in sua) {
    const v = docSo(sua.qty)
    if (v === null || v === 0) throw new Error('Số lượng không hợp lệ')
    ra.qty = v
  }
  if ('purpose' in sua) ra.purpose = String(sua.purpose ?? '').trim()
  if ('note' in sua) ra.note = String(sua.note ?? '').trim()
  if (!Object.keys(ra).length) throw new Error('Chưa đổi gì')
  const loaiSau = ra.loai
  if (ra.qty !== undefined && ra.qty < 0 && loaiSau && loaiSau !== 'Điều chỉnh') throw new Error('Nhập / Xuất phải có số lượng dương')
  return ra
}

export type GiaTriDong = { ngay: string; loai: string; internal_code: string | null; qty: number; purpose: string | null; note: string | null }
export type FormSua = { ngay: string; loai: string; internal_code: string; qty: string; purpose: string; note: string }

/** Từ form sửa → chỉ những trường THẬT SỰ khác dòng gốc (để lịch sử không ghi trường không đổi). */
export function thayDoiSua(goc: GiaTriDong, moi: FormSua): Record<string, unknown> {
  const ra: Record<string, unknown> = {}
  if (moi.ngay.trim() !== goc.ngay) ra.ngay = moi.ngay.trim()
  if (moi.loai !== goc.loai) ra.loai = moi.loai
  if (moi.internal_code.trim().toUpperCase() !== (goc.internal_code ?? '').toUpperCase()) ra.internal_code = moi.internal_code
  if (docSo(moi.qty) !== goc.qty) ra.qty = moi.qty
  if (moi.purpose.trim() !== (goc.purpose ?? '').trim()) ra.purpose = moi.purpose
  if (moi.note.trim() !== (goc.note ?? '').trim()) ra.note = moi.note
  return ra
}

export type MucKiemKe = { internal_code: string; so_dem: number }
/** Ô "SL đếm" → danh sách gửi DB: bỏ ô trống, số phải ≥ 0, mã không trùng. */
export function chuanHoaKiemKe(ds: { internal_code: string; so_dem: unknown }[]): MucKiemKe[] {
  const ra: MucKiemKe[] = []
  const da = new Set<string>()
  for (const d of ds) {
    const ma = String(d.internal_code ?? '').trim().toUpperCase()
    if (!ma || String(d.so_dem ?? '').trim() === '') continue
    const n = docSo(d.so_dem)
    if (n === null || n < 0) throw new Error(`Số đếm của ${ma} không hợp lệ`)
    if (da.has(ma)) throw new Error(`Mã ${ma} bị nhập hai lần`)
    da.add(ma)
    ra.push({ internal_code: ma, so_dem: n })
  }
  if (!ra.length) throw new Error('Chưa điền ô "SL đếm" nào')
  return ra
}

// ---------------------------------------------------------------- hiển thị lịch sử sửa
const HANH_DONG: Record<string, string> = { sua: 'Sửa', huy: 'Huỷ', duyet: 'Duyệt mã', bo_qua: 'Bỏ qua', kiem_ke: 'Kiểm kê' }
export const nhanHanhDong = (x: string | null | undefined) => (x ? HANH_DONG[x] ?? x : '')
export const HANH_DONG_SUA = Object.entries(HANH_DONG).map(([giaTri, nhan]) => ({ giaTri, nhan }))

const NGUON: Record<string, string> = { app: 'App', sheet: 'Google Sheet', portal: 'Portal', bot: 'Bot', discord: 'Discord' }
export const nhanNguon = (x: string | null | undefined) => (x ? NGUON[x] ?? x : '—')
export const NGUON_SUA = (['app', 'sheet', 'portal', 'bot'] as const).map((giaTri) => ({ giaTri, nhan: NGUON[giaTri] }))

const TEN_TRUONG: Record<string, string> = {
  ngay: 'Ngày', loai: 'Loại', internal_code: 'Mã', qty: 'SL', purpose: 'Lý do / cho ai', note: 'Ghi chú',
  trang_thai: 'Trạng thái', ton: 'Tồn sổ', so_dem: 'Đếm', chenh: 'Chênh', nho_ten: 'Nhớ tên',
}
const THU_TU = Object.keys(TEN_TRUONG)

function giaTri(k: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return '(trống)'
  if (k === 'trang_thai') return nhanTrangThai(String(v)) || String(v)
  if (k === 'ngay' && typeof v === 'string') { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v); if (m) return `${m[3]}/${m[2]}/${m[1]}` }
  if (typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v))) {
    const n = Number(v)
    return (k === 'chenh' && n > 0 ? '+' : '') + new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n)
  }
  return typeof v === 'object' ? JSON.stringify(v) : String(v)
}

/**
 * truoc/sau (jsonb các trường đổi) → các dòng chữ dễ đọc: "SL: 3 → 5", "Mã: (trống) → ABC".
 * Trường chỉ có ở một phía (vd kiểm kê: tồn ở trước, đếm/chênh ở sau) hiện một vế. Mã giống nhau hai phía thì không nhắc.
 */
export function moTaDoi(truoc: Record<string, unknown> | null | undefined, sau: Record<string, unknown> | null | undefined): string[] {
  const t = truoc ?? {}, s = sau ?? {}
  const khoa = [...new Set([...Object.keys(t), ...Object.keys(s)])]
    .sort((a, b) => (THU_TU.indexOf(a) + 1 || 99) - (THU_TU.indexOf(b) + 1 || 99))
  const ra: string[] = []
  for (const k of khoa) {
    const ten = TEN_TRUONG[k] ?? k
    const coT = k in t, coS = k in s
    if (k === 'nho_ten') { if (s[k]) ra.push(`Nhớ tên “${s[k]}” cho lần sau`); continue }
    if (coT && coS) {
      if (giaTri(k, t[k]) === giaTri(k, s[k])) { if (k !== 'internal_code') ra.push(`${ten}: ${giaTri(k, s[k])}`); continue }
      ra.push(`${ten}: ${giaTri(k, t[k])} → ${giaTri(k, s[k])}`)
    } else ra.push(`${ten}: ${giaTri(k, coS ? s[k] : t[k])}`)
  }
  return ra
}
