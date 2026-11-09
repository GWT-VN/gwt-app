/** Kiểm đầu vào + thông báo lỗi chung cho server action danh mục lỗi / dòng máy (thuần, không DB). */
import type { LoiDanhMuc, TrangThaiDong, TrangThaiLoi } from './kieu'

export const GIOI_HAN = {
  ten: 200, text: 2000, mucDs: 100, soMucDs: 50, maTicket: 60, maLoi: 40,
  soMaTicket: 200, soDongMay: 20, soHangSheet: 2000, serialRaw: 64, truyVan: 100, byteFile: 5_000_000,
} as const

export const MA_LOI = /^[A-Z0-9][A-Z0-9_-]{1,39}$/
/** Cách ghi ngắn hơn thế này khớp lung tung (vd "E5" nằm trong mọi chuỗi có "e5") → chặn khi lưu/nhập. */
export const ALIAS_TOI_THIEU = 3

/** Mẫu ILIKE cho cs_loi_khop (ma_may): thoát `\` và `_` (ký tự thật); `%` người dùng gõ giữ nguyên; thiếu `%` thì khớp tiền tố. */
export function mauMaMay(m: string): string {
  const t = m.replace(/[\\_]/g, (c) => `\\${c}`)
  return t.includes('%') ? t : `${t}%`
}
/** Ngược của mauMaMay để hiện lên form (lưu lại cho ra đúng mẫu cũ, không thoát hai lần). */
export const boMauMaMay = (p: string): string => p.replace(/\\([\\_])/g, '$1')

/** Cách ghi đầu tiên ngắn hơn ALIAS_TOI_THIEU (sau trim), hoặc null. */
export const aliasQuaNgan = (ds: readonly string[]): string | null =>
  ds.find((a) => a.trim().length < ALIAS_TOI_THIEU) ?? null
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const TRANG_THAI_LOI: readonly TrangThaiLoi[] = ['cho_duyet', 'da_duyet', 'ngung']
export const TRANG_THAI_DONG: readonly TrangThaiDong[] = ['dang_xu_ly', 'da_xu_ly', 'khong_loi']

export const laUuid = (s: unknown): s is string => typeof s === 'string' && UUID_RE.test(s)
export const chuanMaLoi = (s: unknown): string => (typeof s === 'string' ? s.trim().toUpperCase() : '')
export const maTicketHopLe = (s: unknown): s is string =>
  typeof s === 'string' && s.trim().length > 0 && s.length <= GIOI_HAN.maTicket
export const laTrangThaiLoi = (s: unknown): s is TrangThaiLoi => TRANG_THAI_LOI.includes(s as TrangThaiLoi)
export const laTrangThaiDong = (s: unknown): s is TrangThaiDong => TRANG_THAI_DONG.includes(s as TrangThaiDong)

const chuoiOk = (v: unknown, max: number) => v == null || (typeof v === 'string' && v.length <= max)
const dsOk = (v: unknown) =>
  Array.isArray(v) && v.length <= GIOI_HAN.soMucDs && v.every((x) => typeof x === 'string' && x.length <= GIOI_HAN.mucDs)

export type DongLoiSach = Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc'>

/** Whitelist cột + kiểm độ dài. Trường lạ trong input bị bỏ. */
export function lamSachLoi(i: Record<string, unknown>): { ok: true; row: DongLoiSach } | { ok: false; error: string } {
  const code = chuanMaLoi(i.code)
  if (!MA_LOI.test(code)) return { ok: false, error: 'Mã lỗi sai dạng (chữ in/số/-/_, 2–40 ký tự).' }
  if (!laTrangThaiLoi(i.trang_thai)) return { ok: false, error: 'Trạng thái không hợp lệ.' }
  const ten = typeof i.ten === 'string' ? i.ten.trim() : ''
  if (!ten || ten.length > GIOI_HAN.ten) return { ok: false, error: `Tên lỗi bắt buộc, tối đa ${GIOI_HAN.ten} ký tự.` }
  if (!chuoiOk(i.dau_hieu, GIOI_HAN.text) || !chuoiOk(i.huong_xu_ly, GIOI_HAN.text) || !chuoiOk(i.nguon, GIOI_HAN.ten) || !chuoiOk(i.nhom, GIOI_HAN.ten))
    return { ok: false, error: 'Nội dung quá dài.' }
  if (!dsOk(i.aliases ?? []) || !dsOk(i.ma_may ?? []))
    return { ok: false, error: `Danh sách tối đa ${GIOI_HAN.soMucDs} mục, mỗi mục ${GIOI_HAN.mucDs} ký tự.` }
  const aliases = [...new Set(((i.aliases as string[] | undefined) ?? []).map((a) => a.trim()).filter(Boolean))]
  const ngan = aliasQuaNgan(aliases)
  if (ngan != null) return { ok: false, error: `Cách ghi "${ngan}" quá ngắn (tối thiểu ${ALIAS_TOI_THIEU} ký tự).` }
  const maMay = [...new Set(((i.ma_may as string[] | undefined) ?? []).map((m) => m.trim()).filter(Boolean).map(mauMaMay))]
  const tt = Number(i.thu_tu)
  return {
    ok: true,
    row: {
      code, ten, trang_thai: i.trang_thai,
      nhom: (i.nhom as string | null) || null,
      aliases,
      ma_may: maMay,
      dau_hieu: (i.dau_hieu as string | null) || null,
      huong_xu_ly: (i.huong_xu_ly as string | null) || null,
      nguon: (i.nguon as string | null) || null,
      thu_tu: Number.isInteger(tt) && tt >= 0 && tt <= 100000 ? tt : 100,
    },
  }
}

const CHUNG = 'Không thực hiện được, vui lòng thử lại.'
/** Thông báo cho client; chi tiết chỉ log phía server. Chỉ map ca biết (FK / check / unique). */
export function thongBaoLoiDb(e: { code?: string; message?: string } | null | undefined, ngCanh = ''): string {
  console.error(`[loi-actions] ${ngCanh}`, e?.code, e?.message)
  switch (e?.code) {
    case '23503': return 'Dữ liệu tham chiếu không tồn tại (mã lỗi, ticket hoặc serial).'
    case '23514': return 'Dữ liệu không hợp lệ.'
    case '23505': return 'Dữ liệu bị trùng.'
    default: return CHUNG
  }
}

export const nDong = (data: unknown): number => (Array.isArray(data) ? data.length : data ? 1 : 0)
