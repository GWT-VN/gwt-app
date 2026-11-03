/**
 * Đọc dữ liệu kho serial cho khu Kho (/kho) — từ DB GWT-Masterdata, nơi bot Bắp ghi phiếu kho (cùng nguồn với Google
 * Sheet theo dõi). CHỈ ĐỌC: kết nối bằng role `kho_app_doc` chỉ được EXECUTE các hàm đọc `wh_*`
 * (GWT-Masterdata supabase/migrations/*_wh_kho_app_doc.sql), giao dịch mặc định read-only. Ghi kho vẫn đi qua bot.
 *
 * `taoKho(q)` thuần (test bằng bộ truy vấn giả); `kho()` nối DB thật bằng KHO_DB_URL (chỉ server).
 */
import type { Pool } from 'pg'

export type TruyVan = (sql: string, ts: unknown[]) => Promise<{ r: unknown }[]>

/** Hàm ĐỌC đã cấp cho kho_app_doc. Gọi hàm ngoài danh sách = lỗi ngay ở đây, không tới DB. */
export const HAM_DOC = new Set([
  'wh_tong_hop_sheet', 'wh_ton_serial', 'wh_tra_serial', 'wh_may_can_xu_ly', 'wh_doi_chieu_so', 'wh_dia_diem_ds',
  'wh_kiem_ke_doi_chieu', 'wh_ds_may', 'wh_ds_giao_dich', 'wh_ds_kiem_ke',
] as const)
type HamDoc = typeof HAM_DOC extends Set<infer T> ? T : never

// ---------------------------------------------------------------- kiểu dữ liệu (đúng hình JSON hàm DB trả)
export type May = {
  id: number; serial: string; internal_code: string; ten_model: string | null; tinh_trang: string; trang_thai: string; so_huu: string
  dia_diem: string; dia_diem_ten: string; trong_kho: boolean; dia_diem_chi_tiet: string | null; muc_dich_hien_tai: string | null
  phuong_an: string | null; ghi_chu: string | null; installed_serial: string | null; ma_gd_gan_nhat: string | null
  nguoi_phu_trach: string | null; cap_nhat: string
}
export type DongTon = {
  internal_code: string; ten: string | null; dia_diem: string; dia_diem_ten: string; loai_dia_diem: string
  tinh_trang: string; so_luong: number; serials: string[]
}
export type TonModel = { internal_code: string; ten: string | null; trongKho: number; ngoaiKho: number; chuaSerial: number; tong: number }
export type MayTrongPhieu = {
  serial: string; serial_truoc: string | null; internal_code: string; ten_model: string | null
  tinh_trang_truoc: string | null; tinh_trang_sau: string | null; trang_thai_sau: string | null; tu: string | null; den: string | null
}
export type Phieu = {
  ma: string; loai: string; muc_dich: string | null; ngay: string; ghi_nhan_luc: string; tu: string | null; den: string | null
  den_chi_tiet: string | null; nguoi_giao: string | null; nguoi_nhan: string | null; nguoi_phu_trach: string | null
  de_xuat: string | null; xac_nhan: string | null; nguon: string | null; ghi_chu: string | null; ly_do: string | null; may: MayTrongPhieu[]
}
export type DotKiemKe = {
  ma: string; dia_diem: string; dia_diem_ten: string; trang_thai: string; nguoi_tao: string; ghi_chu: string | null
  tao_luc: string; ap_luc: string | null; so_dong: number; so_khong_serial: number
}
export type BuocHanhTrinh = {
  luc: string; ngay: string; phieu: string; loai: string; muc_dich: string | null; tu: string | null; den: string | null
  tinh_trang_truoc: string | null; tinh_trang_sau: string | null; trang_thai_sau: string | null; so_huu_sau: string | null
  serial_truoc: string | null; serial_sau: string | null; de_xuat: string | null; xac_nhan: string | null
  nguoi_giao: string | null; nguoi_nhan: string | null; nguoi_phu_trach: string | null; nguon: string | null; ghi_chu: string | null; ly_do: string | null
}
export type HoSoSerial =
  | { tim_thay: false; serial: string }
  | { tim_thay: true; may: Record<string, unknown> & { serial: string; internal_code: string; tinh_trang: string; trang_thai: string; so_huu: string; dia_diem_ma?: string }
      ten_model: string | null; dia_diem_ten: string | null; lich_su: BuocHanhTrinh[] }

export type LocMay = { diaDiem?: string; tinhTrang?: string; trangThai?: string; soHuu?: string; model?: string; tuKhoa?: string; trang?: number }
export type LocPhieu = { loai?: string; tuNgay?: string; denNgay?: string; tuKhoa?: string; trang?: number }

export const MOI_TRANG_MAY = 100
export const MOI_TRANG_PHIEU = 50

const boTrong = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''))

export function taoKho(q: TruyVan) {
  async function goi<T>(fn: HamDoc, arg?: string | Record<string, unknown>): Promise<T> {
    if (!HAM_DOC.has(fn)) throw new Error(`Hàm không được phép: ${fn}`)
    const kieu = typeof arg === 'string' ? 'text' : 'jsonb'
    const sql = arg === undefined ? `select public.${fn}() r` : `select public.${fn}($1::${kieu}) r`
    try {
      const rows = await q(sql, arg === undefined ? [] : [kieu === 'text' ? arg : JSON.stringify(arg)])
      return rows[0]?.r as T
    } catch (e) {
      // Không lộ chuỗi kết nối / mật khẩu ra giao diện hay log phía client.
      const ma = String((e as Error)?.message ?? e).replace(/postgres(ql)?:\/\/\S+/gi, 'postgres://***').slice(0, 160)
      throw new Error(`Chưa đọc được dữ liệu kho (${ma})`)
    }
  }

  return {
    /** Tồn theo model × nơi để × tình trạng (giống tab "Tồn kho") + gộp theo model. */
    async tonKho(): Promise<{ dong: DongTon[]; theoModel: TonModel[] }> {
      const th = await goi<{ ton: DongTon[] }>('wh_tong_hop_sheet')
      const dong = th?.ton ?? []
      const gom = new Map<string, TonModel>()
      for (const d of dong) {
        const m = gom.get(d.internal_code) ?? { internal_code: d.internal_code, ten: d.ten, trongKho: 0, ngoaiKho: 0, chuaSerial: 0, tong: 0 }
        const sl = Number(d.so_luong) || 0
        if (d.loai_dia_diem === 'kho') m.trongKho += sl; else m.ngoaiKho += sl
        if (d.tinh_trang === 'chua_dinh_danh') m.chuaSerial += sl
        m.tong += sl
        gom.set(d.internal_code, m)
      }
      return { dong, theoModel: [...gom.values()].sort((a, b) => a.internal_code.localeCompare(b.internal_code)) }
    },
    async dsMay(loc: LocMay = {}): Promise<{ tong: number; dong: May[] }> {
      const trang = Math.max(1, loc.trang ?? 1)
      return goi('wh_ds_may', boTrong({
        dia_diem: loc.diaDiem, tinh_trang: loc.tinhTrang, trang_thai: loc.trangThai, so_huu: loc.soHuu, internal_code: loc.model,
        tu_khoa: loc.tuKhoa, gioi_han: MOI_TRANG_MAY, bo_qua: trang > 1 ? (trang - 1) * MOI_TRANG_MAY : undefined,
      }))
    },
    async dsPhieu(loc: LocPhieu = {}): Promise<{ tong: number; dong: Phieu[] }> {
      const trang = Math.max(1, loc.trang ?? 1)
      return goi('wh_ds_giao_dich', boTrong({
        loai: loc.loai, tu_ngay: loc.tuNgay, den_ngay: loc.denNgay, tu_khoa: loc.tuKhoa,
        gioi_han: MOI_TRANG_PHIEU, bo_qua: trang > 1 ? (trang - 1) * MOI_TRANG_PHIEU : undefined,
      }))
    },
    async canXuLy(): Promise<May[]> {
      const th = await goi<{ can_xu_ly: (May | null)[] }>('wh_tong_hop_sheet')
      return (th?.can_xu_ly ?? []).filter((m): m is May => !!m)
    },
    async dsKiemKe(): Promise<DotKiemKe[]> {
      return (await goi<DotKiemKe[]>('wh_ds_kiem_ke')) ?? []
    },
    async doiChieuKiemKe(ma: string): Promise<unknown> {
      return goi('wh_kiem_ke_doi_chieu', ma)
    },
    async traSerial(serial: string): Promise<HoSoSerial> {
      const s = serial.trim()
      if (!s) return { tim_thay: false, serial: '' }
      return goi('wh_tra_serial', s)
    },
    async diaDiem(): Promise<{ ma: string; ten: string; loai: string }[]> {
      return (await goi<{ ma: string; ten: string; loai: string }[]>('wh_dia_diem_ds')) ?? []
    },
  }
}
export type KhoDoc = ReturnType<typeof taoKho>

// ---------------------------------------------------------------- nối DB thật (chỉ server)
let pool: Pool | null = null

/** Có cấu hình KHO_DB_URL chưa — trang hiện lời nhắc thay vì lỗi trắng khi thiếu. */
export const daCauHinhKho = () => !!process.env.KHO_DB_URL?.trim()

export function kho(): KhoDoc {
  return taoKho(async (sql, ts) => {
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
    return (await pool.query(sql, ts)).rows as { r: unknown }[]
  })
}
