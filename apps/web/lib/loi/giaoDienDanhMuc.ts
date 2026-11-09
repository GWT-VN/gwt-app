/** Logic thuần cho trang Danh mục lỗi (bảng, nhập từ Sheet, phân loại lại) — tách khỏi component để test không cần DOM. */
import type { LoiDanhMuc, TrangThaiLoi } from './kieu'
import { boMauMaMay } from './kiemDauVao'

export const NHAN_TRANG_THAI: Record<TrangThaiLoi, string> = {
  cho_duyet: 'Chờ duyệt', da_duyet: 'Đã duyệt', ngung: 'Ngừng dùng',
}

/** Hiện tối đa `max` cách ghi, phần dư gom thành "+n". */
export function tomTatDanhSach(ds: string[], max = 3): string {
  if (ds.length <= max) return ds.join(', ')
  return `${ds.slice(0, max).join(', ')} +${ds.length - max}`
}

export function catNgan(s: string | null, max = 80): string {
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s
}

/** Textarea một-mục-một-dòng <-> mảng. */
export const dongSangMang = (s: string): string[] => [...new Set(s.split('\n').map((x) => x.trim()).filter(Boolean))]
export const mangSangDong = (ds: string[]): string => ds.join('\n')

export type FormLoi = {
  code: string; nhom: string; ten: string; aliases: string; ma_may: string
  dau_hieu: string; huong_xu_ly: string; nguon: string; trang_thai: TrangThaiLoi; thu_tu: string
}
export const formTuLoi = (d: LoiDanhMuc): FormLoi => ({
  code: d.code, nhom: d.nhom ?? '', ten: d.ten, aliases: mangSangDong(d.aliases), ma_may: mangSangDong(d.ma_may.map(boMauMaMay)),
  dau_hieu: d.dau_hieu ?? '', huong_xu_ly: d.huong_xu_ly ?? '', nguon: d.nguon ?? '', trang_thai: d.trang_thai, thu_tu: String(d.thu_tu),
})
export const loiTuForm = (f: FormLoi): Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc'> => ({
  code: f.code, nhom: f.nhom.trim() || null, ten: f.ten.trim(),
  aliases: dongSangMang(f.aliases), ma_may: dongSangMang(f.ma_may),
  dau_hieu: f.dau_hieu.trim() || null, huong_xu_ly: f.huong_xu_ly.trim() || null, nguon: f.nguon.trim() || null,
  trang_thai: f.trang_thai, thu_tu: Number.isFinite(Number(f.thu_tu)) ? Number(f.thu_tu) : 0,
})

// ───────── Nhập từ Sheet ─────────
type Loi = { dong: number; loi: string }
export type XemTruoc =
  | { ok: true
      danhMuc: { hopLe: { code: string; ten: string; nhom: string | null; trang_thai: TrangThaiLoi }[]; loi: Loi[] }
      ganTicket: { hopLe: unknown[]; loi: Loi[] }
      soDongSeDoi: number
      /** Số mã đã có sẽ đổi trạng thái (thiếu = 0). */
      soDoiTrangThai?: number }
  | { ok: false; error: string }
export type KetQuaNhap = { ok: true; so_loi: number; so_gan: number } | { ok: false; error: string }

export type TomTatXemTruoc = {
  daDuyet: number; choDuyet: number; soGan: number; soDongSeDoi: number; soDoiTrangThai: number
  mau: { code: string; ten: string; nhom: string | null; trang_thai: TrangThaiLoi }[]
  loi: string[]; soLoiKhac: number; coLoi: boolean; soMa: number
}
export const TOI_DA_LOI_HIEN = 50
export function tomTatXemTruoc(r: Extract<XemTruoc, { ok: true }>): TomTatXemTruoc {
  const h = r.danhMuc.hopLe
  const loi = [...r.danhMuc.loi.map((l) => `Sheet "Danh mục lỗi", dòng ${l.dong}: ${l.loi}`),
    ...r.ganTicket.loi.map((l) => `Sheet "Gán ticket", dòng ${l.dong}: ${l.loi}`)]
  return {
    daDuyet: h.filter((x) => x.trang_thai === 'da_duyet').length,
    choDuyet: h.filter((x) => x.trang_thai === 'cho_duyet').length,
    soGan: r.ganTicket.hopLe.length, soDongSeDoi: r.soDongSeDoi, soDoiTrangThai: r.soDoiTrangThai ?? 0,
    mau: h.slice(0, 20), loi: loi.slice(0, TOI_DA_LOI_HIEN), soLoiKhac: Math.max(0, loi.length - TOI_DA_LOI_HIEN),
    coLoi: loi.length > 0, soMa: h.length,
  }
}

export const nhanDoiTrangThai = (t: TomTatXemTruoc): string =>
  t.soDoiTrangThai > 0 ? `${t.soDoiTrangThai} mã sẽ đổi trạng thái` : ''

export const nhanNutNhap = (t: TomTatXemTruoc) =>
  `Nhập ${t.soMa} mã + gán ${t.soGan} ticket · ghi đè ${t.soDongSeDoi} dòng máy`

/** Chỉ cho nhập khi đã xem trước, không còn lỗi, và còn ít nhất một mã. */
export const duocNhap = (t: TomTatXemTruoc | null): boolean => !!t && !t.coLoi && t.soMa > 0

export async function chayXemTruoc(
  fd: FormData, xem: (fd: FormData) => Promise<XemTruoc>,
): Promise<{ tomTat: TomTatXemTruoc } | { loi: string }> {
  const r = await xem(fd)
  return r.ok ? { tomTat: tomTatXemTruoc(r) } : { loi: r.error }
}

export async function chayNhap(
  fd: FormData, tomTat: TomTatXemTruoc | null, nhap: (fd: FormData) => Promise<KetQuaNhap>,
): Promise<{ thongBao: string } | { loi: string }> {
  if (!duocNhap(tomTat)) return { loi: 'Chưa xem trước hoặc file còn lỗi — chưa thể nhập.' }
  const r = await nhap(fd)
  return r.ok ? { thongBao: `Đã nhập ${r.so_loi} mã lỗi, gán ${r.so_gan} ticket.` } : { loi: r.error }
}

// ───────── Phân loại lại ─────────
export type PhanLoaiLaiFn = (chayThu: boolean) => Promise<{ ok: true; baoCao: Record<string, unknown> } | { ok: false; error: string }>
export const XAC_NHAN_PHAN_LOAI_LAI =
  "Ghi thật: bù dòng máy cho ticket cũ và phân loại lại dòng hệ thống còn 'Chưa phân loại'. Không đụng dòng CS đã chọn tay."

/** Báo cáo chạy thử -> các dòng hiển thị (chỉ số đã biết lên trước, mã lỗi sau). */
export function dongBaoCao(b: Record<string, unknown>): { nhan: string; gia: string }[] {
  const nhanBiet: [string, string][] = [
    ['so_ticket_chua_co_dong', 'Ticket chưa có dòng máy'],
    ['phan_loai_lai', 'Dòng sẽ phân loại lại'],
    ['se_tao_chua_phan_loai', 'Dòng mới sẽ để "Chưa phân loại"'],
  ]
  const ra = nhanBiet.filter(([k]) => b[k] !== undefined).map(([k, n]) => ({ nhan: n, gia: String(b[k]) }))
  for (const [k, v] of Object.entries(b)) {
    if (nhanBiet.some(([x]) => x === k)) continue
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [m, n] of Object.entries(v as Record<string, unknown>)) ra.push({ nhan: `${k}: ${m}`, gia: String(n) })
    } else if (typeof v !== 'object') ra.push({ nhan: k, gia: String(v) })
  }
  return ra
}

export async function chayThuPhanLoai(chay: PhanLoaiLaiFn) {
  const r = await chay(true)
  return r.ok ? { baoCao: dongBaoCao(r.baoCao) } : { loi: r.error }
}

/** Chỉ áp dụng khi đã chạy thử và người dùng xác nhận. */
export async function apDungPhanLoai(daChayThu: boolean, xacNhan: (msg: string) => boolean, chay: PhanLoaiLaiFn) {
  if (!daChayThu) return { loi: 'Hãy chạy thử trước khi áp dụng.' }
  if (!xacNhan(XAC_NHAN_PHAN_LOAI_LAI)) return { huy: true as const }
  const r = await chay(false)
  return r.ok ? { thongBao: 'Đã áp dụng phân loại lại.' } : { loi: r.error }
}
