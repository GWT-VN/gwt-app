/**
 * Đọc SỔ KHO (sổ số lượng kho v2 `wh_master`, DB GWT-Masterdata) cho khu Kho (/kho). Bot Bắp đọc kênh Discord kho Nguyễn
 * Xiển và ghi sổ này mỗi 5 phút; Google Sheet theo dõi + Portal "Duyệt kho" cùng đọc một sổ.
 * Lớp ĐỌC: role `kho_app_doc` (GWT-Masterdata supabase/migrations/*_wh_kho_app_doc.sql), giao dịch mặc định read-only.
 * Lớp GHI (sửa / huỷ / duyệt / kiểm kê, Đợt 3 — 04/11/2026) ở `ghi.ts`, dùng CHUNG pool ở đây và phải mở `BEGIN READ WRITE`.
 *
 * `taoKho(q)` thuần (test bằng bộ truy vấn giả); `kho()` nối DB thật bằng KHO_DB_URL (chỉ server).
 */
import type { Pool } from 'pg'

export type TruyVan = (sql: string, ts: unknown[]) => Promise<{ r: unknown }[]>

/** Hàm ĐỌC đã cấp cho kho_app_doc. Gọi hàm ngoài danh sách = lỗi ngay ở đây, không tới DB. */
export const HAM_DOC = new Set(['wh_app_ton', 'wh_app_nhat_ky', 'wh_app_cho_duyet', 'wh_app_bao_cao', 'wh_app_the_kho',
  'wh_app_lich_su_sua', 'wh_app_danh_muc'] as const)
type HamDoc = typeof HAM_DOC extends Set<infer T> ? T : never

export const MOI_TRANG = 100

// ---------------------------------------------------------------- kiểu dữ liệu (Postgres numeric về dạng chuỗi → đổi sang number)
export type DongTon = {
  internal_code: string; ten: string | null; danh_muc: string | null; don_vi: string | null
  tong_nhap: number; tong_xuat: number; dieu_chinh: number; ton: number; ton_toi_thieu: number | null; cap_nhat: string | null
  canh_bao: 'sap_het' | 'am' | null
}
export type DongSo = {
  id: number; ngay: string; loai: string; internal_code: string | null; ten: string | null; raw_name: string; qty: number
  purpose: string | null; note: string | null; keeper: string | null; trang_thai: string; discord_msg_id: string | null; ghi_luc: string
  /** Khác null = dòng đã SỬA TAY (app / Sheet) → bot không ghi đè khi tin Discord gốc bị sửa. */
  sua_tay_luc: string | null; sua_tay_boi: string | null
}
export type DongChoDuyet = {
  id: number; ngay: string; loai: string; raw_name: string; qty: number; purpose: string | null; keeper: string | null
  suggest_code: string | null; suggest_name: string | null; discord_msg_id: string | null; ghi_luc: string
}
export type DongBaoCao = { internal_code: string; ten: string | null; don_vi: string | null; dau_ky: number; nhap: number; xuat: number; dieu_chinh: number; cuoi_ky: number }
export type TheKho = {
  internal_code: string; ten: string | null; don_vi: string | null
  dong: { id: number; ngay: string; loai: string; raw_name: string; qty: number; so_du: number; purpose: string | null; note: string | null; keeper: string | null; discord_msg_id: string | null }[]
}
export type HanhDongSua = 'sua' | 'huy' | 'duyet' | 'bo_qua' | 'kiem_ke'
export type NguonSua = 'sheet' | 'app' | 'portal' | 'bot' | 'discord'
export type DongLichSu = {
  id: number; luc: string; dong_id: string | null; hanh_dong: HanhDongSua | string; nguon: NguonSua | string | null; nguoi: string | null
  ly_do: string | null; truoc: Record<string, unknown> | null; sau: Record<string, unknown> | null
  internal_code: string | null; raw_name: string | null; loai: string | null; ngay: string | null; discord_msg_id: string | null
}
export type LocLichSu = { nguon?: string; hanhDong?: string; tuNgay?: string; trang?: number }
export type MucDanhMuc = { ma: string; ten: string | null }
export type LocNhatKy = { kho?: string; loai?: string; trangThai?: string; ma?: string; tuKhoa?: string; tuNgay?: string; denNgay?: string; trang?: number }

const boTrong = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''))
const so = (x: unknown) => (x === null || x === undefined || x === '' ? null : Number(x))
const soBat = (x: unknown) => so(x) ?? 0

export function taoKho(q: TruyVan) {
  /** arg === undefined → hàm không tham số (wh_app_danh_muc). */
  async function goi<T>(fn: HamDoc, arg?: Record<string, unknown>): Promise<T> {
    if (!HAM_DOC.has(fn)) throw new Error(`Hàm không được phép: ${fn}`)
    try {
      const rows = arg === undefined ? await q(`select public.${fn}() r`, []) : await q(`select public.${fn}($1::jsonb) r`, [JSON.stringify(arg)])
      return rows[0]?.r as T
    } catch (e) {
      // Không lộ chuỗi kết nối / mật khẩu ra giao diện hay log phía client.
      const ma = String((e as Error)?.message ?? e).replace(/postgres(ql)?:\/\/\S+/gi, 'postgres://***').slice(0, 160)
      throw new Error(`Chưa đọc được dữ liệu kho (${ma})`)
    }
  }

  return {
    /** Tồn theo mã (chỉ dòng đã duyệt) + tóm tắt cho thẻ số. */
    async ton(kho = 'NX') {
      const r = await goi<{ kho: string; cho_duyet: number; ghi_gan_nhat: string | null; dong: Record<string, unknown>[] }>('wh_app_ton', { kho })
      const dong: DongTon[] = (r?.dong ?? []).map((d) => ({
        internal_code: String(d.internal_code), ten: (d.ten as string) ?? null, danh_muc: (d.danh_muc as string) ?? null, don_vi: (d.don_vi as string) ?? null,
        tong_nhap: soBat(d.tong_nhap), tong_xuat: soBat(d.tong_xuat), dieu_chinh: soBat(d.dieu_chinh), ton: soBat(d.ton),
        ton_toi_thieu: so(d.ton_toi_thieu), cap_nhat: (d.cap_nhat as string) ?? null, canh_bao: (d.canh_bao as DongTon['canh_bao']) ?? null,
      }))
      return {
        kho: r?.kho ?? kho, ghiGanNhat: r?.ghi_gan_nhat ?? null, dong,
        tom: { soMa: dong.length, sapHet: dong.filter((d) => d.canh_bao === 'sap_het').length, am: dong.filter((d) => d.canh_bao === 'am').length, choDuyet: Number(r?.cho_duyet ?? 0) },
      }
    },
    async nhatKy(loc: LocNhatKy = {}): Promise<{ tong: number; dong: DongSo[] }> {
      const trang = Math.max(1, loc.trang ?? 1)
      const r = await goi<{ tong: number; dong: Record<string, unknown>[] }>('wh_app_nhat_ky', boTrong({
        kho: loc.kho, loai: loc.loai, trang_thai: loc.trangThai, ma: loc.ma, tu_khoa: loc.tuKhoa, tu_ngay: loc.tuNgay, den_ngay: loc.denNgay,
        gioi_han: MOI_TRANG, bo_qua: trang > 1 ? (trang - 1) * MOI_TRANG : undefined,
      }))
      return { tong: Number(r?.tong ?? 0), dong: (r?.dong ?? []).map((d) => ({ ...(d as DongSo), qty: soBat(d.qty),
        sua_tay_luc: (d.sua_tay_luc as string) ?? null, sua_tay_boi: (d.sua_tay_boi as string) ?? null })) }
    },
    /** Lịch sử sửa sổ (app / Sheet / Portal / bot), mới nhất trước. */
    async lichSuSua(loc: LocLichSu = {}): Promise<{ tong: number; dong: DongLichSu[] }> {
      const trang = Math.max(1, loc.trang ?? 1)
      const r = await goi<{ tong: number; dong: Record<string, unknown>[] }>('wh_app_lich_su_sua', boTrong({
        nguon: loc.nguon, hanh_dong: loc.hanhDong, tu_ngay: loc.tuNgay,
        gioi_han: MOI_TRANG, bo_qua: trang > 1 ? (trang - 1) * MOI_TRANG : undefined,
      }))
      return { tong: Number(r?.tong ?? 0), dong: (r?.dong ?? []).map((d) => ({ ...(d as DongLichSu), id: Number(d.id),
        dong_id: d.dong_id == null ? null : String(d.dong_id),
        truoc: (d.truoc as Record<string, unknown>) ?? null, sau: (d.sau as Record<string, unknown>) ?? null })) }
    },
    /** Danh mục mã (catalog_item) cho ô chọn mã khi sửa / duyệt / kiểm kê. */
    async danhMuc(): Promise<MucDanhMuc[]> {
      const r = await goi<Record<string, unknown>[]>('wh_app_danh_muc')
      return (r ?? []).filter((d) => d.ma).map((d) => ({ ma: String(d.ma), ten: (d.ten as string) ?? null }))
    },
    async choDuyet(kho = 'NX'): Promise<DongChoDuyet[]> {
      const r = await goi<Record<string, unknown>[]>('wh_app_cho_duyet', { kho })
      return (r ?? []).map((d) => ({ ...(d as DongChoDuyet), qty: soBat(d.qty) }))
    },
    async baoCao(thang: string, kho = 'NX'): Promise<DongBaoCao[]> {
      const r = await goi<Record<string, unknown>[]>('wh_app_bao_cao', boTrong({ kho, thang }))
      return (r ?? []).map((d) => ({ internal_code: String(d.internal_code), ten: (d.ten as string) ?? null, don_vi: (d.don_vi as string) ?? null,
        dau_ky: soBat(d.dau_ky), nhap: soBat(d.nhap), xuat: soBat(d.xuat), dieu_chinh: soBat(d.dieu_chinh), cuoi_ky: soBat(d.cuoi_ky) }))
    },
    async theKho(ma: string, kho = 'NX'): Promise<TheKho | null> {
      const m = ma.trim()
      if (!m) return null
      const r = await goi<TheKho>('wh_app_the_kho', { kho, ma: m })
      return r ? { ...r, dong: (r.dong ?? []).map((d) => ({ ...d, qty: soBat(d.qty), so_du: soBat(d.so_du) })) } : null
    },
  }
}
export type KhoDoc = ReturnType<typeof taoKho>

// ---------------------------------------------------------------- nối DB thật (chỉ server)
let pool: Pool | null = null

/** Có cấu hình KHO_DB_URL chưa — trang hiện lời nhắc thay vì lỗi trắng khi thiếu. */
export const daCauHinhKho = () => !!process.env.KHO_DB_URL?.trim()

/** Pool DUY NHẤT tới DB kho (role kho_app_doc) — lớp đọc ở đây và lớp ghi ở ghi.ts dùng chung, không mở thêm kết nối. */
export async function layPoolKho(): Promise<Pool> {
  if (!pool) {
    const url = process.env.KHO_DB_URL?.trim()
    if (!url) throw new Error('Thiếu KHO_DB_URL')
    const { Pool: P } = await import('pg')
    // Supabase pooler (cổng 6543, chế độ transaction) hợp serverless; mỗi instance giữ tối đa 2 kết nối.
    // KHO_DB_CA (PEM chứng chỉ gốc Supabase, tải ở Database Settings › SSL) có thì XÁC MINH máy chủ; chưa có thì vẫn
    // mã hoá đường truyền nhưng không xác minh — đặt KHO_DB_CA trên Vercel để chặn giả mạo máy chủ.
    const ca = process.env.KHO_DB_CA?.replace(/\\n/g, '\n').trim()
    pool = new P({ connectionString: url.replace(/[?&]sslmode=[^&]*/g, ''), max: 2, idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000, statement_timeout: 15_000, ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false } })
  }
  return pool
}

export function kho(): KhoDoc {
  return taoKho(async (sql, ts) => (await (await layPoolKho()).query(sql, ts)).rows as { r: unknown }[])
}
