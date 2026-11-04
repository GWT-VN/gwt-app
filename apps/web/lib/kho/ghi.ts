/**
 * GHI sổ kho từ app (Đợt 3 — 04/11/2026): sửa / huỷ dòng, duyệt / bỏ qua dòng chờ, kiểm kê. Chỉ gọi đúng 5 hàm DB
 * `wh_*` (GWT-Masterdata migration 20261104140000_wh_sua_hai_chieu) — hàm tự ghi lịch sử (wh_nhat_ky_sua) với nguồn 'app'
 * + email người sửa, Sheet tự dựng lại từ DB trong ~5 phút.
 *
 * Role `kho_app_doc` có `default_transaction_read_only = on` → MỖI lệnh ghi chạy trong giao dịch mở rõ `BEGIN READ WRITE` …
 * `COMMIT` (lỗi → `ROLLBACK`) trên MỘT kết nối lấy từ pool. Quyền ('kho.so.sua') KHÔNG kiểm ở đây — Server Action kiểm trước.
 *
 * `taoKhoGhi(layKetNoi, {nguoi})` thuần (test bằng kết nối giả); `khoGhi(nguoi)` dùng pool chung của lớp đọc (doc.ts).
 */
import { layPoolKho, type TruyVan } from './doc'
import { chuanHoaKiemKe, chuanHoaSua, kiemId, type MucKiemKe } from './sua'

/** Hàm GHI app được gọi. Gọi hàm ngoài danh sách = lỗi ngay ở đây, không tới DB. */
export const HAM_GHI = new Set(['wh_sua_dong', 'wh_huy_dong', 'wh_duyet_dong', 'wh_bo_qua_dong', 'wh_kiem_ke'] as const)
type HamGhi = typeof HAM_GHI extends Set<infer T> ? T : never

/** Mọi lần ghi từ app đều mang nguồn này (DB kiểm: sheet | app | portal | bot). */
export const NGUON_APP = 'app'

/** Một kết nối riêng cho một giao dịch: `q` chạy lệnh tuần tự, `tra` trả kết nối về pool (có lỗi → huỷ kết nối). */
export type KetNoi = { q: TruyVan; tra: (loi?: Error) => void }
export type LayKetNoi = () => Promise<KetNoi>

export type KetQuaKiemKe = { internal_code: string; ton_truoc: number; so_dem: number; chenh: number; id: number | null }

const an = (x: unknown) => String((x as Error)?.message ?? x).replace(/postgres(ql)?:\/\/\S+/gi, 'postgres://***').slice(0, 160)

/**
 * Lỗi DB → câu cho người dùng. `raise exception` của hàm (mã P0001) là lỗi NGHIỆP VỤ viết sẵn tiếng Việt → hiện nguyên văn.
 * Còn lại (mạng, quyền…) → câu chung, che chuỗi kết nối.
 */
export function doiLoiGhi(e: unknown): Error {
  const ma = (e as { code?: string })?.code
  if (ma === 'P0001') return new Error(String((e as Error).message))
  if (ma === '42883') return new Error('DB kho chưa có hàm ghi (chưa áp migration Đợt 3 — wh_sua_hai_chieu)')
  if (ma === '42501') return new Error('Kết nối kho chưa được cấp quyền ghi (EXECUTE hàm wh_* cho kho_app_doc)')
  return new Error(`Chưa ghi được sổ kho (${an(e)})`)
}

export function taoKhoGhi(layKetNoi: LayKetNoi, { nguoi }: { nguoi: string }) {
  const ai = (nguoi ?? '').trim()

  async function chay<T>(fn: HamGhi, p: Record<string, unknown>): Promise<T> {
    if (!HAM_GHI.has(fn)) throw new Error(`Hàm không được phép: ${fn}`)
    if (!ai) throw new Error('Thiếu người sửa (chưa đăng nhập?)')
    let kn: KetNoi
    try { kn = await layKetNoi() } catch (e) { throw doiLoiGhi(e) }
    let hong: Error | undefined
    try {
      await kn.q('begin read write', [])
      const rows = await kn.q(`select public.${fn}($1::jsonb) r`, [JSON.stringify({ ...p, nguon: NGUON_APP, nguoi: ai })])
      await kn.q('commit', [])
      return rows[0]?.r as T
    } catch (e) {
      try { await kn.q('rollback', []) } catch (e2) { hong = e2 as Error } // rollback cũng hỏng → kết nối hỏng, bỏ khỏi pool
      throw doiLoiGhi(e)
    } finally {
      kn.tra(hong)
    }
  }

  return {
    /** Sửa một dòng sổ — chỉ gửi trường đổi. Gán mã cho dòng chờ duyệt = duyệt luôn. Dòng bị khoá khỏi bot ghi đè. */
    async suaDong(id: unknown, sua: Record<string, unknown>, lyDo?: string): Promise<{ doi: number; id: number }> {
      const r = await chay<{ doi: number; id: number }>('wh_sua_dong', { id: kiemId(id), sua: chuanHoaSua(sua), ly_do: (lyDo ?? '').trim() || undefined })
      return { doi: Number(r?.doi ?? 0), id: Number(r?.id) }
    },
    /** Huỷ một dòng (ghi sai / trùng) — không xoá, chỉ đánh dấu. Bắt buộc lý do. */
    async huyDong(id: unknown, lyDo: string): Promise<{ id: number }> {
      const ly = (lyDo ?? '').trim()
      if (!ly) throw new Error('Huỷ dòng cần ghi lý do')
      const r = await chay<{ id: number }>('wh_huy_dong', { id: kiemId(id), ly_do: ly })
      return { id: Number(r?.id) }
    },
    /** Duyệt dòng chờ: gán mã. `rawNorm` có → bot nhớ tên đó cho lần sau (wh_alias). */
    async duyetDong(id: unknown, ma: string, rawNorm?: string): Promise<{ id: number; ma: string }> {
      const m = (ma ?? '').trim().toUpperCase()
      if (!m) throw new Error('Chưa chọn mã')
      const r = await chay<{ id: number; ma: string }>('wh_duyet_dong', { id: kiemId(id), ma: m, raw_norm: (rawNorm ?? '').trim() || undefined })
      return { id: Number(r?.id), ma: String(r?.ma ?? m) }
    },
    /** Bỏ qua dòng chờ (không phải hàng kho). */
    async boQuaDong(id: unknown, lyDo?: string): Promise<{ id: number }> {
      const r = await chay<{ id: number }>('wh_bo_qua_dong', { id: kiemId(id), ly_do: (lyDo ?? '').trim() || undefined })
      return { id: Number(r?.id) }
    },
    /** Kiểm kê: số đếm thực tế → DB ghi dòng "Điều chỉnh" cho phần chênh, có hiệu lực ngay. */
    async kiemKe(items: { internal_code: string; so_dem: unknown }[], kho = 'NX'): Promise<KetQuaKiemKe[]> {
      const ds: MucKiemKe[] = chuanHoaKiemKe(items)
      const r = await chay<Record<string, unknown>[]>('wh_kiem_ke', { kho, items: ds })
      return (r ?? []).map((d) => ({ internal_code: String(d.internal_code), ton_truoc: Number(d.ton_truoc ?? 0), so_dem: Number(d.so_dem ?? 0),
        chenh: Number(d.chenh ?? 0), id: d.id == null ? null : Number(d.id) }))
    },
  }
}
export type KhoGhi = ReturnType<typeof taoKhoGhi>

// ---------------------------------------------------------------- nối DB thật (chỉ server) — dùng CHUNG pool với lớp đọc
export function khoGhi(nguoi: string): KhoGhi {
  return taoKhoGhi(async () => {
    const c = await (await layPoolKho()).connect()
    return { q: async (sql, ts) => (await c.query(sql, ts)).rows as { r: unknown }[], tra: (loi) => c.release(loi) }
  }, { nguoi })
}
