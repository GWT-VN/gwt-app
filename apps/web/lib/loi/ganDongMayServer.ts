import 'server-only'
import { dataClient } from '@/lib/nen-tang/db'
import { layNhanVien } from '@/lib/nen-tang/phien'
import { kiemDangSerial } from './serial'
import { CHUA_PHAN_LOAI } from './dongMay'
import { chuanMaLoi, GIOI_HAN, laTrangThaiDong, MA_LOI, thongBaoLoiDb } from './kiemDauVao'
import type { DongMayInput } from './kieu'

export type KQ<T = object> = ({ ok: true } & T) | { ok: false; error: string }
type Db = ReturnType<typeof dataClient>
export const KHONG_DUNG_DUOC = 'Mã lỗi không dùng được'

/** Mã lỗi phải tồn tại và chưa ngừng. */
export async function loiDungDuoc(db: Db, code: string): Promise<boolean> {
  if (!MA_LOI.test(code)) return false
  const { data } = await db.from('loi_danh_muc').select('trang_thai').eq('code', code).maybeSingle()
  return !!data && (data as { trang_thai: string }).trang_thai !== 'ngung'
}

/** Quy tắc giải serial của dòng máy: có trong installed_base → serial; ngược lại source_serial. */
export async function giaiSerial(db: Db, s: string): Promise<KQ<{ serial: string | null; source_serial: string | null; internal_code: string | null }>> {
  const k = kiemDangSerial(s)
  if (!k.chuan) return { ok: true, serial: null, source_serial: null, internal_code: null }
  if (k.chuan.length > GIOI_HAN.serialRaw) return { ok: false, error: 'Serial không hợp lệ.' }
  const { data: ib } = await db.from('installed_base').select('serial, internal_code').eq('serial', k.chuan).maybeSingle()
  if (ib) {
    const r = ib as { serial: string; internal_code: string | null }
    return { ok: true, serial: r.serial, source_serial: null, internal_code: r.internal_code ?? null }
  }
  const { data: reg } = await db.from('serial_registry').select('serial, internal_code').eq('serial', k.chuan).maybeSingle()
  if (!reg && !k.hopLe) return { ok: false, error: k.loi ?? 'Serial không hợp lệ.' }
  return { ok: true, serial: null, source_serial: k.chuan, internal_code: (reg as { internal_code: string | null } | null)?.internal_code ?? null }
}

/** Kiểm + chuẩn hoá một dòng nhập (không chạm ghi). */
export async function chuanBiDong(db: Db, d: DongMayInput) {
  const loi = d.loi_code ? chuanMaLoi(d.loi_code) : CHUA_PHAN_LOAI
  if (d.mo_ta != null && (typeof d.mo_ta !== 'string' || d.mo_ta.length > GIOI_HAN.text)) return { ok: false as const, error: 'Mô tả quá dài.' }
  if (d.trang_thai != null && !laTrangThaiDong(d.trang_thai)) return { ok: false as const, error: 'Trạng thái không hợp lệ.' }
  if (d.serial != null && (typeof d.serial !== 'string' || d.serial.length > GIOI_HAN.serialRaw)) return { ok: false as const, error: 'Serial không hợp lệ.' }
  if (!(await loiDungDuoc(db, loi))) return { ok: false as const, error: KHONG_DUNG_DUOC }
  const sr = await giaiSerial(db, d.serial ?? '')
  if (!sr.ok) return sr
  return { ok: true as const, loi, sr, mo_ta: d.mo_ta ?? null, trang_thai: d.trang_thai ?? 'dang_xu_ly' }
}

export async function themDongQuaRpc(db: Db, code: string, c: Extract<Awaited<ReturnType<typeof chuanBiDong>>, { ok: true }>, nguoi: string | null): Promise<KQ<{ id: string }>> {
  const { data, error } = await db.rpc('cs_them_dong_may', {
    p_ticket: code, p_serial: c.sr.serial, p_source_serial: c.sr.source_serial, p_internal_code: c.sr.internal_code,
    p_loi_code: c.loi, p_mo_ta: c.mo_ta, p_trang_thai: c.trang_thai, p_nguoi: nguoi,
  })
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'cs_them_dong_may') }
  const r = data as { ok?: boolean; id?: string; loi?: string } | null
  if (!r?.ok || !r.id) return { ok: false, error: r?.loi === 'khong_thay_ticket' ? 'Không thấy ticket.' : 'Không thêm được dòng máy.' }
  return { ok: true, id: r.id }
}

export type DongDaChuan = Extract<Awaited<ReturnType<typeof chuanBiDong>>, { ok: true }>

/** Kiểm TOÀN BỘ dòng (không ghi). Trả lỗi đầu tiên; gọi TRƯỚC khi tạo ticket. */
export async function chuanBiCacDong(dong: DongMayInput[]): Promise<KQ<{ ds: DongDaChuan[] }>> {
  if (!Array.isArray(dong)) return { ok: false, error: 'Dòng máy không hợp lệ.' }
  if (dong.length > GIOI_HAN.soDongMay) return { ok: false, error: `Tối đa ${GIOI_HAN.soDongMay} dòng máy mỗi ticket.` }
  const db = dataClient()
  const ds: DongDaChuan[] = []
  for (const d of dong) {
    if (!d || typeof d !== 'object') return { ok: false, error: 'Dòng máy không hợp lệ.' }
    const c = await chuanBiDong(db, d)
    if (!c.ok) return c
    ds.push(c)
  }
  return { ok: true, ds }
}

/**
 * Cập nhật dòng tự sinh từ dòng đầu: KHÔNG xoá phân loại tự động của trigger.
 * Chỉ ghi loi_code khi CS chọn khác CHUA_PHAN_LOAI, chỉ ghi mo_ta khi có nhập;
 * cs_sua chỉ bật khi CS thật sự đặt loi_code hoặc mo_ta.
 */
export function banCapNhatDongTuDong(c: DongDaChuan, d: DongMayInput): Record<string, unknown> {
  const chonLoi = c.loi !== CHUA_PHAN_LOAI
  const moTa = typeof d.mo_ta === 'string' ? d.mo_ta.trim() : ''
  const u: Record<string, unknown> = {
    serial: c.sr.serial, source_serial: c.sr.source_serial, internal_code: c.sr.internal_code, trang_thai: c.trang_thai,
  }
  if (chonLoi) u.loi_code = c.loi
  if (moTa) u.mo_ta = c.mo_ta
  if (chonLoi || moTa) u.cs_sua = true
  return u
}

/**
 * KHÔNG phải server action — chỉ createTicket (đã qua cổng quyền cs.ticket.tao_sua) được gọi.
 * `daChuan` = kết quả chuanBiCacDong đã chạy trước khi tạo ticket (bỏ trống thì kiểm lại tại đây).
 * Dòng tự sinh (nguon='tu_dong', thu_tu=1) nhận dong[0]; nếu trigger không sinh (0 dòng cập nhật)
 * thì thêm mới. Các dòng còn lại thêm qua RPC (thu_tu = max+1 dưới khoá, không đụng nhau).
 */
export async function ganDongMayChoTicketMoi(code: string, dong: DongMayInput[], daChuan?: DongDaChuan[]): Promise<KQ> {
  if (!code || code.length > GIOI_HAN.maTicket) return { ok: false, error: 'Mã ticket không hợp lệ.' }
  if (!dong.length) return { ok: true }
  let ds = daChuan
  if (!ds) {
    const k = await chuanBiCacDong(dong)
    if (!k.ok) return k
    ds = k.ds
  }
  const db = dataClient()
  const nv = await layNhanVien()
  const nguoi = nv?.email ?? null
  const { data, error } = await db.from('ticket_may').update(banCapNhatDongTuDong(ds[0], dong[0]))
    .eq('ticket_code', code).eq('nguon', 'tu_dong').eq('thu_tu', 1).select('id')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'ganDongMay.update') }
  const rest = (Array.isArray(data) ? data.length : data ? 1 : 0) > 0 ? ds.slice(1) : ds
  for (const c of rest) {
    const r = await themDongQuaRpc(db, code, c, nguoi)
    if (!r.ok) return r
  }
  return { ok: true }
}
