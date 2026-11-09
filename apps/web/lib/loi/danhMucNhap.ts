import type { LoiDanhMuc, TrangThaiLoi } from './kieu'
import { boDau } from '../../bang/timkiem'
import { aliasQuaNgan, ALIAS_TOI_THIEU, mauMaMay } from './kiemDauVao'

export const COT_DANH_MUC = ['Mã', 'Nhóm', 'Tên chuẩn', 'Các cách ghi', 'Mã máy áp dụng', 'Dấu hiệu',
  'Phương án xử lý chuẩn', 'Nguồn', 'Ví dụ ticket', 'Duyệt', 'Ghi chú chị Hiền'] as const
export const COT_GAN_TICKET = ['Mã ticket', 'Mã lỗi', 'Duyệt'] as const

export type DongNhapLoi = Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc' | 'thu_tu'> & { thu_tu: number }
type Loi = { dong: number; loi: string }

const MA = /^[A-Z0-9][A-Z0-9_-]{1,39}$/
const o = (r: Record<string, unknown>, k: string) => String(r[k] ?? '').trim()
const tachDs = (s: string) => [...new Set(s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean))]


function trangThai(s: string): TrangThaiLoi {
  const k = boDau(s).toLowerCase().trim()
  if (['x', 'co', 'ok', 'duyet', 'da duyet', 'true', '1'].includes(k)) return 'da_duyet'
  if (['ngung', 'bo'].includes(k)) return 'ngung'
  return 'cho_duyet'
}

export function docDanhMuc(rows: Record<string, unknown>[], nhomHopLe: Set<string>): { hopLe: DongNhapLoi[]; loi: Loi[] } {
  const hopLe: DongNhapLoi[] = []
  const loi: Loi[] = []
  const daCo = new Set<string>()
  rows.forEach((r, i) => {
    const dong = i + 2
    const code = o(r, 'Mã').toUpperCase()
    const ten = o(r, 'Tên chuẩn')
    const nhom = o(r, 'Nhóm') || null
    if (!ten) return void loi.push({ dong, loi: 'Thiếu "Tên chuẩn".' })
    if (!MA.test(code)) return void loi.push({ dong, loi: `Mã "${code}" sai dạng (chữ in/số/-/_; 2–40 ký tự).` })
    if (code === 'CHUA_PHAN_LOAI') return void loi.push({ dong, loi: 'CHUA_PHAN_LOAI là mã hệ thống, không nhập từ Sheet.' })
    if (nhom && !nhomHopLe.has(nhom)) return void loi.push({ dong, loi: `Nhóm "${nhom}" không có trong Nhóm lỗi.` })
    if (daCo.has(code)) return void loi.push({ dong, loi: `Trùng mã ${code}.` })
    const aliases = tachDs(o(r, 'Các cách ghi'))
    const ngan = aliasQuaNgan(aliases)
    if (ngan != null) return void loi.push({ dong, loi: `Cách ghi "${ngan}" quá ngắn (tối thiểu ${ALIAS_TOI_THIEU} ký tự).` })
    daCo.add(code)
    hopLe.push({
      code, nhom, ten,
      aliases,
      ma_may: [...new Set(tachDs(o(r, 'Mã máy áp dụng')).map(mauMaMay))],
      dau_hieu: o(r, 'Dấu hiệu') || null,
      huong_xu_ly: o(r, 'Phương án xử lý chuẩn') || null,
      nguon: o(r, 'Nguồn') || null,
      trang_thai: trangThai(o(r, 'Duyệt')),
      thu_tu: (hopLe.length + 1) * 10,
    })
  })
  return { hopLe, loi }
}

export function docGanTicket(rows: Record<string, unknown>[], maHopLe: Set<string>) {
  const hopLe: { ticket_code: string; loi_code: string }[] = []
  const loi: Loi[] = []
  rows.forEach((r, i) => {
    const dong = i + 2
    if (trangThai(o(r, 'Duyệt')) !== 'da_duyet') return
    const ticket_code = o(r, 'Mã ticket')
    const loi_code = o(r, 'Mã lỗi').toUpperCase()
    if (!ticket_code) return void loi.push({ dong, loi: 'Thiếu mã ticket.' })
    if (!maHopLe.has(loi_code)) return void loi.push({ dong, loi: `Mã lỗi "${o(r, 'Mã lỗi')}" không có trong danh mục.` })
    hopLe.push({ ticket_code, loi_code })
  })
  return { hopLe, loi }
}

/**
 * Trạng thái sau khi nhập (khớp cs_nhap_danh_muc_loi): Duyệt trống (cho_duyet) KHÔNG đổi mục đã có;
 * chỉ da_duyet / ngung ghi rõ mới đổi. Mã mới thì lấy đúng giá trị nhập.
 */
export function trangThaiSauNhap(cu: TrangThaiLoi | undefined, moi: TrangThaiLoi): TrangThaiLoi {
  return cu && moi === 'cho_duyet' ? cu : moi
}

/** Số mã ĐÃ CÓ sẽ đổi trạng thái khi nhập (cho màn xem trước). */
export function demDoiTrangThai(hopLe: readonly { code: string; trang_thai: TrangThaiLoi }[], coSan: ReadonlyMap<string, TrangThaiLoi>): number {
  return hopLe.filter((l) => {
    const cu = coSan.get(l.code)
    return cu !== undefined && trangThaiSauNhap(cu, l.trang_thai) !== cu
  }).length
}
