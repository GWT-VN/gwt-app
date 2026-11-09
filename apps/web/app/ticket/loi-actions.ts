'use server'

import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff, layNhanVien } from '@/lib/nen-tang/phien'
import { coQuyen, doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KHONG_DU_QUYEN } from '@/lib/nen-tang/nhan-su-luat'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { boDau } from '@/bang/timkiem'
import { kiemDangSerial } from '@/lib/loi/serial'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import { docDanhMuc, docGanTicket } from '@/lib/loi/danhMucNhap'
import type { DongMay, DongMayInput, KetQuaTraSerial, KhachVaMay, LoiDanhMuc, TrangThaiLoi } from '@/lib/loi/kieu'

type KQ<T = object> = ({ ok: true } & T) | { ok: false; error: string }
type Db = ReturnType<typeof dataClient>

const COT_DONG = 'id, ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, huong_xu_ly, huong_xu_ly_nguon, trang_thai, nguon, created_at, loi_danh_muc(ten)'
type DongDb = Omit<DongMay, 'loi_ten'> & { loi_danh_muc: { ten: string } | null }
const raDong = (r: DongDb): DongMay => {
  const { loi_danh_muc, ...x } = r
  return { ...x, loi_ten: loi_danh_muc?.ten ?? null }
}
const KHONG_DUNG_DUOC = 'Mã lỗi không dùng được'
const NGUON_TU_DONG = ['tu_dong', 'backfill']

/** Quyền cấu hình danh mục (QUANLY). Gọi SAU requireStaff(), TRƯỚC mọi truy cập DB. */
async function quanLyDanhMuc(): Promise<boolean> {
  return coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')
}

function lamMoi(code?: string, danhMuc = false) {
  if (code) revalidatePath(`/ticket/${code}`)
  revalidatePath('/ticket')
  if (danhMuc) revalidatePath('/danh-muc-loi')
}

/** Mã lỗi phải tồn tại và chưa ngừng. */
async function loiDungDuoc(db: Db, code: string): Promise<boolean> {
  const { data } = await db.from('loi_danh_muc').select('trang_thai').eq('code', code).maybeSingle()
  return !!data && (data as { trang_thai: string }).trang_thai !== 'ngung'
}

/** Quy tắc giải serial của dòng máy (xem brief Task 8). */
async function giaiSerial(db: Db, s: string): Promise<KQ<{ serial: string | null; source_serial: string | null; internal_code: string | null }>> {
  const k = kiemDangSerial(s)
  if (!k.chuan) return { ok: true, serial: null, source_serial: null, internal_code: null }
  const { data: ib } = await db.from('installed_base').select('serial, internal_code').eq('serial', k.chuan).maybeSingle()
  if (ib) {
    const r = ib as { serial: string; internal_code: string | null }
    return { ok: true, serial: r.serial, source_serial: null, internal_code: r.internal_code ?? null }
  }
  const { data: reg } = await db.from('serial_registry').select('serial, internal_code').eq('serial', k.chuan).maybeSingle()
  if (!reg && !k.hopLe) return { ok: false, error: k.loi ?? 'Serial không hợp lệ.' }
  return { ok: true, serial: null, source_serial: k.chuan, internal_code: (reg as { internal_code: string | null } | null)?.internal_code ?? null }
}

// ───────────────────────── Danh mục lỗi ─────────────────────────

export async function danhMucLoi(chiDaDuyet = false): Promise<LoiDanhMuc[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  let q = dataClient().from('loi_danh_muc').select('*').order('thu_tu').order('code')
  if (chiDaDuyet) q = q.eq('trang_thai', 'da_duyet')
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as LoiDanhMuc[]
}

export async function luuLoi(input: Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc'>): Promise<KQ> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const code = input.code.trim().toUpperCase()
  if (!code || !input.ten.trim()) return { ok: false, error: 'Thiếu mã hoặc tên lỗi.' }
  if (code === CHUA_PHAN_LOAI) return { ok: false, error: 'CHUA_PHAN_LOAI là mã hệ thống.' }
  const nv = await layNhanVien()
  const duyet = input.trang_thai === 'da_duyet'
  const { error } = await dataClient().from('loi_danh_muc').upsert(
    { ...input, code, duyet_boi: duyet ? nv?.email ?? null : null, duyet_luc: duyet ? new Date().toISOString() : null },
    { onConflict: 'code' },
  )
  if (error) return { ok: false, error: error.message }
  await ghiAudit('luu_loi_danh_muc', `loi:${code}`, { trang_thai: input.trang_thai })
  lamMoi(undefined, true)
  return { ok: true }
}

export async function datTrangThaiLoi(code: string, trang_thai: TrangThaiLoi): Promise<KQ> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  if (code === CHUA_PHAN_LOAI) return { ok: false, error: 'CHUA_PHAN_LOAI là mã hệ thống, không đổi trạng thái.' }
  const nv = await layNhanVien()
  const duyet = trang_thai === 'da_duyet'
  const { error } = await dataClient().from('loi_danh_muc').update({
    trang_thai, duyet_boi: duyet ? nv?.email ?? null : null, duyet_luc: duyet ? new Date().toISOString() : null,
  }).eq('code', code)
  if (error) return { ok: false, error: error.message }
  await ghiAudit('dat_trang_thai_loi', `loi:${code}`, { trang_thai })
  lamMoi(undefined, true)
  return { ok: true }
}

// ───────────────────────── Nhập từ Sheet ─────────────────────────

type Phan = { rowsLoi: Record<string, unknown>[]; rowsGan: Record<string, unknown>[] | null }

async function docFile(fd: FormData): Promise<KQ<Phan>> {
  const f = fd.get('file')
  if (!(f instanceof File) || f.size === 0) return { ok: false, error: 'Chưa chọn file .xlsx hoặc .csv.' }
  if (!/\.(xlsx|csv)$/i.test(f.name)) return { ok: false, error: 'Chỉ nhận file .xlsx hoặc .csv.' }
  let wb: XLSX.WorkBook
  try {
    wb = XLSX.read(Buffer.from(await f.arrayBuffer()))
  } catch {
    return { ok: false, error: 'Không đọc được file.' }
  }
  const rows = (ws: XLSX.WorkSheet | undefined) => (ws ? XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' }) : null)
  const ws = wb.Sheets['Danh mục lỗi'] ?? wb.Sheets[wb.SheetNames[0]]
  const rowsLoi = rows(ws)
  if (!rowsLoi) return { ok: false, error: 'File không có sheet nào.' }
  return { ok: true, rowsLoi, rowsGan: rows(wb.Sheets['Gán ticket']) }
}

async function phanTichFile(db: Db, p: Phan) {
  const { data: nhom } = await db.from('issue_group').select('code')
  const nhomHopLe = new Set(((nhom ?? []) as { code: string }[]).map((x) => x.code))
  const danhMuc = docDanhMuc(p.rowsLoi, nhomHopLe)
  const { data: coSan } = await db.from('loi_danh_muc').select('code')
  const maHopLe = new Set<string>(((coSan ?? []) as { code: string }[]).map((x) => x.code))
  for (const l of danhMuc.hopLe) maHopLe.add(l.code)
  const ganTicket = p.rowsGan ? docGanTicket(p.rowsGan, maHopLe) : { hopLe: [], loi: [] }
  return { danhMuc, ganTicket }
}

const gomLoi = (...ds: { dong: number; loi: string }[][]) =>
  ds.flat().slice(0, 10).map((l) => `Dòng ${l.dong}: ${l.loi}`).join('\n')

export async function xemTruocNhapDanhMuc(fd: FormData): Promise<
  | { ok: true; danhMuc: ReturnType<typeof docDanhMuc>; ganTicket: ReturnType<typeof docGanTicket>; soDongSeDoi: number }
  | { ok: false; error: string }
> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const f = await docFile(fd)
  if (!f.ok) return f
  const db = dataClient()
  const { danhMuc, ganTicket } = await phanTichFile(db, f)
  // Dry-run: đếm dòng tự động/backfill CHƯA bị CS sửa sẽ bị ghi đè.
  let soDongSeDoi = 0
  const codes = [...new Set(ganTicket.hopLe.map((g) => g.ticket_code))]
  if (codes.length) {
    const { data } = await db.from('ticket_may').select('id')
      .in('ticket_code', codes).in('nguon', NGUON_TU_DONG).eq('cs_sua', false)
    soDongSeDoi = (data ?? []).length
  }
  return { ok: true, danhMuc, ganTicket, soDongSeDoi }
}

export async function nhapDanhMuc(fd: FormData): Promise<KQ<{ so_loi: number; so_gan: number }>> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const f = await docFile(fd)
  if (!f.ok) return f
  const db = dataClient()
  const { danhMuc, ganTicket } = await phanTichFile(db, f)
  if (danhMuc.loi.length || ganTicket.loi.length) return { ok: false, error: gomLoi(danhMuc.loi, ganTicket.loi) }
  const nv = await layNhanVien()
  const bay = new Date().toISOString()
  if (danhMuc.hopLe.length) {
    const { error } = await db.from('loi_danh_muc').upsert(
      danhMuc.hopLe.map((l) => ({
        ...l,
        duyet_boi: l.trang_thai === 'da_duyet' ? nv?.email ?? null : null,
        duyet_luc: l.trang_thai === 'da_duyet' ? bay : null,
      })),
      { onConflict: 'code' },
    )
    if (error) return { ok: false, error: error.message }
  }
  // Chỉ ghi đè dòng tự sinh CHƯA bị CS sửa — không bao giờ dòng CS thêm (app) hay đã sửa (cs_sua).
  for (const g of ganTicket.hopLe) {
    const { error } = await db.from('ticket_may').update({ loi_code: g.loi_code })
      .eq('ticket_code', g.ticket_code).in('nguon', NGUON_TU_DONG).eq('cs_sua', false)
    if (error) return { ok: false, error: error.message }
  }
  await ghiAudit('nhap_danh_muc_loi', 'loi_danh_muc', { so_loi: danhMuc.hopLe.length, so_gan: ganTicket.hopLe.length })
  lamMoi(undefined, true)
  return { ok: true, so_loi: danhMuc.hopLe.length, so_gan: ganTicket.hopLe.length }
}

export async function phanLoaiLai(chayThu: boolean): Promise<{ ok: true; baoCao: Record<string, unknown> } | { ok: false; error: string }> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  // cs_ticket_may_backfill chỉ service_role gọi được — dataClient() chính là client đó.
  const { data, error } = await dataClient().rpc('cs_ticket_may_backfill', { p_chay_thu: chayThu })
  if (error) return { ok: false, error: error.message }
  if (!chayThu) {
    await ghiAudit('phan_loai_lai_ticket_may', 'ticket_may', { ket_qua: data })
    lamMoi(undefined, true)
  }
  return { ok: true, baoCao: (data ?? {}) as Record<string, unknown> }
}

// ───────────────────────── Dòng máy ─────────────────────────

export async function dongMayCuaTicket(code: string): Promise<DongMay[]> {
  return (await dongMayTheoTickets([code]))[code] ?? []
}

export async function dongMayTheoTickets(codes: string[]): Promise<Record<string, DongMay[]>> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!codes.length) return {}
  const { data, error } = await dataClient().from('ticket_may').select(COT_DONG)
    .in('ticket_code', codes).order('ticket_code').order('thu_tu')
  if (error) throw new Error(error.message)
  const ra: Record<string, DongMay[]> = {}
  for (const r of (data ?? []) as unknown as DongDb[]) (ra[r.ticket_code] ??= []).push(raDong(r))
  return ra
}

export async function ticketCodesTheoLoi(loiCode: string): Promise<string[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  const { data, error } = await dataClient().from('ticket_may').select('ticket_code').eq('loi_code', loiCode)
  if (error) throw new Error(error.message)
  return [...new Set(((data ?? []) as { ticket_code: string }[]).map((r) => r.ticket_code))]
}

export async function themDongMay(code: string, input: DongMayInput): Promise<KQ<{ id: string }>> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const db = dataClient()
  const loi = input.loi_code || CHUA_PHAN_LOAI
  if (!(await loiDungDuoc(db, loi))) return { ok: false, error: KHONG_DUNG_DUOC }
  const sr = await giaiSerial(db, input.serial ?? '')
  if (!sr.ok) return sr
  const { data: cuoi } = await db.from('ticket_may').select('thu_tu').eq('ticket_code', code).order('thu_tu', { ascending: false }).limit(1)
  const thuTu = (((cuoi ?? []) as { thu_tu: number }[])[0]?.thu_tu ?? 0) + 1
  const nv = await layNhanVien()
  const { data, error } = await db.from('ticket_may').insert({
    ticket_code: code, thu_tu: thuTu, serial: sr.serial, source_serial: sr.source_serial, internal_code: sr.internal_code,
    loi_code: loi, mo_ta: input.mo_ta ?? null, trang_thai: input.trang_thai ?? 'dang_xu_ly', nguon: 'app', tao_boi: nv?.email ?? null,
  }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Không thêm được dòng máy.' }
  lamMoi(code)
  return { ok: true, id: (data as { id: string }).id }
}

export async function suaDongMay(id: string, patch: DongMayInput & { huong_xu_ly?: string }): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const db = dataClient()
  const { data: d } = await db.from('ticket_may').select('id, ticket_code').eq('id', id).maybeSingle()
  if (!d) return { ok: false, error: 'Không thấy dòng máy.' }
  const code = (d as { ticket_code: string }).ticket_code
  // cs_sua = true: CS đã sửa → trigger/Sheet không ghi đè nữa. nguon giữ nguyên.
  const up: Record<string, unknown> = { cs_sua: true }
  if (patch.loi_code !== undefined) {
    if (!(await loiDungDuoc(db, patch.loi_code))) return { ok: false, error: KHONG_DUNG_DUOC }
    up.loi_code = patch.loi_code
  }
  if (patch.serial !== undefined) {
    const sr = await giaiSerial(db, patch.serial)
    if (!sr.ok) return sr
    Object.assign(up, { serial: sr.serial, source_serial: sr.source_serial, internal_code: sr.internal_code })
  }
  if (patch.mo_ta !== undefined) up.mo_ta = patch.mo_ta
  if (patch.trang_thai !== undefined) up.trang_thai = patch.trang_thai
  if (patch.huong_xu_ly !== undefined) {
    up.huong_xu_ly = patch.huong_xu_ly.trim() || null
    up.huong_xu_ly_nguon = patch.huong_xu_ly.trim() ? 'cs' : null
  }
  const { error } = await db.from('ticket_may').update(up).eq('id', id)
  if (error) return { ok: false, error: error.message }
  lamMoi(code)
  return { ok: true }
}

export async function xoaDongMay(id: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const db = dataClient()
  const { data: d, error: e0 } = await db.from('ticket_may').select('*').eq('id', id).maybeSingle()
  if (e0) return { ok: false, error: e0.message }
  if (!d) return { ok: false, error: 'Không thấy dòng máy.' }
  const code = (d as { ticket_code: string }).ticket_code
  const { count } = await db.from('ticket_may').select('id', { count: 'exact', head: true }).eq('ticket_code', code)
  if ((count ?? 0) <= 1) return { ok: false, error: 'Ticket phải còn ít nhất một dòng máy.' }
  const { error } = await db.from('ticket_may').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await ghiAudit('xoa_dong_may', `ticket:${code}`, { dong: d })
  lamMoi(code)
  return { ok: true }
}

export async function xacNhanHuongXuLy(id: string, noiDung: string, tuDanhMuc: boolean): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const nd = noiDung.trim()
  if (!nd) return { ok: false, error: 'Hướng xử lý không được trống.' }
  const { data, error } = await dataClient().from('ticket_may')
    .update({ huong_xu_ly: nd, huong_xu_ly_nguon: tuDanhMuc ? 'danh_muc' : 'cs' })
    .eq('id', id).select('ticket_code').maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (data) lamMoi((data as { ticket_code: string }).ticket_code)
  return { ok: true } // KHÔNG đụng tickets.state
}

/** Dùng bởi createTicket: dòng tự sinh (thu_tu=1) nhận dong[0]; còn lại thêm mới nguon='app'. */
export async function ganDongMayChoTicketMoi(code: string, dong: DongMayInput[]): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!dong.length) return { ok: true }
  const db = dataClient()
  const nv = await layNhanVien()
  const hang: Record<string, unknown>[] = []
  for (const d of dong) {
    const loi = d.loi_code || CHUA_PHAN_LOAI
    if (!(await loiDungDuoc(db, loi))) return { ok: false, error: KHONG_DUNG_DUOC }
    const sr = await giaiSerial(db, d.serial ?? '')
    if (!sr.ok) return sr
    hang.push({ serial: sr.serial, source_serial: sr.source_serial, internal_code: sr.internal_code, loi_code: loi, mo_ta: d.mo_ta ?? null, trang_thai: d.trang_thai ?? 'dang_xu_ly' })
  }
  const { error: e1 } = await db.from('ticket_may').update({ ...hang[0], cs_sua: true })
    .eq('ticket_code', code).eq('nguon', 'tu_dong').eq('thu_tu', 1)
  if (e1) return { ok: false, error: e1.message }
  if (hang.length > 1) {
    const { error: e2 } = await db.from('ticket_may').insert(
      hang.slice(1).map((h, i) => ({ ...h, ticket_code: code, thu_tu: i + 2, nguon: 'app', tao_boi: nv?.email ?? null })),
    )
    if (e2) return { ok: false, error: e2.message }
  }
  lamMoi(code)
  return { ok: true }
}

// ───────────────────────── Tra cứu ─────────────────────────

export async function traSerial(raw: string): Promise<KetQuaTraSerial> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const k = kiemDangSerial(raw)
  const db = dataClient()
  const { data: m } = await db.from('v_installed_base')
    .select('serial, internal_code, product_name, customer_id, customer_name, install_date, warranty_activated')
    .eq('serial', k.chuan).maybeSingle()
  if (m) return { loai: 'da_lap', ...(m as Omit<Extract<KetQuaTraSerial, { loai: 'da_lap' }>, 'loai'>) }
  const { data: s } = await db.from('v_serial_kho').select('serial, ma_noi_bo, ten_noi_bo, trang_thai').eq('serial', k.chuan).maybeSingle()
  if (s) {
    const r = s as { serial: string; ma_noi_bo: string | null; ten_noi_bo: string | null; trang_thai: string | null }
    return { loai: 'chua_kich_hoat', serial: r.serial, internal_code: r.ma_noi_bo, product_name: r.ten_noi_bo, trang_thai: r.trang_thai }
  }
  if (!k.hopLe) return { loai: 'sai_dang', serial: k.chuan, loi: k.loi ?? 'Chưa nhập serial.' }
  return { loai: 'khong_co', serial: k.chuan }
}

export async function traKhachVaMay(q: string): Promise<KhachVaMay[]> {
  await requireStaff()
  await doQuyen('cs.khach.xem')
  const term = q.trim()
  if (term.length < 2) return []
  const db = dataClient()
  const cot = 'id, full_name, primary_phone'
  const so = term.replace(/\D/g, '')
  let khach: { id: string; full_name: string; primary_phone: string | null }[] = []
  if (/^[\d\s.+-]+$/.test(term) && so.length >= 6) {
    const cuoi9 = so.slice(-9)
    const [{ data: a }, { data: lh }] = await Promise.all([
      db.from('cs_customers').select(cot).neq('trang_thai', 'da_xoa').ilike('primary_phone', `%${cuoi9}`).limit(8),
      db.from('customer_contacts').select('customer_id').ilike('phone', `%${cuoi9}`).limit(20),
    ])
    khach = (a ?? []) as typeof khach
    const them = [...new Set(((lh ?? []) as { customer_id: string }[]).map((r) => r.customer_id))].filter((id) => !khach.some((k) => k.id === id))
    if (them.length && khach.length < 8) {
      const { data: b } = await db.from('cs_customers').select(cot).neq('trang_thai', 'da_xoa').in('id', them).limit(8 - khach.length)
      khach = khach.concat((b ?? []) as typeof khach)
    }
  } else {
    const safe = boDau(term).toLowerCase().replace(/[%_]/g, (c) => '\\' + c)
    const { data } = await db.from('cs_customers').select(cot).neq('trang_thai', 'da_xoa').ilike('ten_kd', `%${safe}%`).order('full_name').limit(8)
    khach = (data ?? []) as typeof khach
  }
  khach = khach.slice(0, 8)
  if (!khach.length) return []
  const { data: may } = await db.from('v_installed_base')
    .select('customer_id, serial, internal_code, product_name, install_date, warranty_activated')
    .in('customer_id', khach.map((k) => k.id))
  const theoKhach = new Map<string, KhachVaMay['may']>()
  for (const r of (may ?? []) as { customer_id: string; serial: string; internal_code: string | null; product_name: string | null; install_date: string | null; warranty_activated: boolean }[]) {
    const { customer_id, ...x } = r
    theoKhach.set(customer_id, [...(theoKhach.get(customer_id) ?? []), x])
  }
  return khach.map((k) => ({ ...k, may: theoKhach.get(k.id) ?? [] }))
}
