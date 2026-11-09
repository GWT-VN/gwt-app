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
import { demDoiTrangThai, docDanhMuc, docGanTicket } from '@/lib/loi/danhMucNhap'
import type { DongCa, MauSo } from '@/lib/loi/tanSuat'
import type { DongMay, DongMayInput, KetQuaTraSerial, KhachVaMay, LoiDanhMuc, TrangThaiLoi } from '@/lib/loi/kieu'

import { chuanBiDong, giaiSerial, KHONG_DUNG_DUOC, loiDungDuoc, themDongQuaRpc, type KQ } from '@/lib/loi/ganDongMayServer'
import {
  chuanMaLoi, GIOI_HAN, laTrangThaiDong, laTrangThaiLoi, laUuid, lamSachLoi, maTicketHopLe, MA_LOI, nDong, thongBaoLoiDb,
} from '@/lib/loi/kiemDauVao'

const COT_DONG = 'id, ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, huong_xu_ly, huong_xu_ly_nguon, trang_thai, nguon, created_at, loi_danh_muc(ten)'
type DongDb = Omit<DongMay, 'loi_ten'> & { loi_danh_muc: { ten: string } | null }
const raDong = (r: DongDb): DongMay => {
  const { loi_danh_muc, ...x } = r
  return { ...x, loi_ten: loi_danh_muc?.ten ?? null }
}
const NGUON_TU_DONG = ['tu_dong', 'backfill']
const LOI_ID = 'Mã dòng máy không hợp lệ.'

/** Quyền cấu hình danh mục (QUANLY). Gọi SAU requireStaff(), TRƯỚC mọi truy cập DB. */
async function quanLyDanhMuc(): Promise<boolean> {
  return coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')
}

function lamMoi(code?: string, danhMuc = false) {
  if (code) revalidatePath(`/ticket/${code}`)
  revalidatePath('/ticket')
  if (danhMuc) revalidatePath('/danh-muc-loi')
}

// ───────────────────────── Danh mục lỗi ─────────────────────────

export async function danhMucLoi(chiDaDuyet = false): Promise<LoiDanhMuc[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  let q = dataClient().from('loi_danh_muc').select('*').order('thu_tu').order('code')
  if (chiDaDuyet) q = q.eq('trang_thai', 'da_duyet')
  const { data, error } = await q
  if (error) throw new Error(thongBaoLoiDb(error, 'danhMucLoi'))
  return (data ?? []) as LoiDanhMuc[]
}

export async function luuLoi(input: Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc'>): Promise<KQ> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const sach = lamSachLoi((input ?? {}) as Record<string, unknown>)
  if (!sach.ok) return sach
  const row = sach.row
  if (row.code === CHUA_PHAN_LOAI) return { ok: false, error: 'CHUA_PHAN_LOAI là mã hệ thống.' }
  const db = dataClient()
  if (row.nhom) {
    const { data } = await db.from('issue_group').select('code').eq('code', row.nhom).maybeSingle()
    if (!data) return { ok: false, error: 'Nhóm lỗi không tồn tại.' }
  }
  const nv = await layNhanVien()
  const duyet = row.trang_thai === 'da_duyet'
  const { error } = await db.from('loi_danh_muc').upsert(
    { ...row, duyet_boi: duyet ? nv?.email ?? null : null, duyet_luc: duyet ? new Date().toISOString() : null },
    { onConflict: 'code' },
  )
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'luuLoi') }
  await ghiAudit('luu_loi_danh_muc', `loi:${row.code}`, { trang_thai: row.trang_thai })
  lamMoi(undefined, true)
  return { ok: true }
}

export async function datTrangThaiLoi(code: string, trang_thai: TrangThaiLoi): Promise<KQ> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const ma = chuanMaLoi(code)
  if (!MA_LOI.test(ma)) return { ok: false, error: 'Mã lỗi sai dạng.' }
  if (!laTrangThaiLoi(trang_thai)) return { ok: false, error: 'Trạng thái không hợp lệ.' }
  if (ma === CHUA_PHAN_LOAI) return { ok: false, error: 'CHUA_PHAN_LOAI là mã hệ thống, không đổi trạng thái.' }
  const nv = await layNhanVien()
  const duyet = trang_thai === 'da_duyet'
  const { data, error } = await dataClient().from('loi_danh_muc').update({
    trang_thai, duyet_boi: duyet ? nv?.email ?? null : null, duyet_luc: duyet ? new Date().toISOString() : null,
  }).eq('code', ma).select('code')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'datTrangThaiLoi') }
  if (!nDong(data)) return { ok: false, error: 'Không thấy mã lỗi.' }
  await ghiAudit('dat_trang_thai_loi', `loi:${ma}`, { trang_thai })
  lamMoi(undefined, true)
  return { ok: true }
}

// ───────────────────────── Nhập từ Sheet ─────────────────────────

type Phan = { rowsLoi: Record<string, unknown>[]; rowsGan: Record<string, unknown>[] | null }

async function docFile(fd: FormData): Promise<KQ<Phan>> {
  const f = fd.get('file')
  if (!(f instanceof File) || f.size === 0) return { ok: false, error: 'Chưa chọn file .xlsx hoặc .csv.' }
  if (!/\.(xlsx|csv)$/i.test(f.name)) return { ok: false, error: 'Chỉ nhận file .xlsx hoặc .csv.' }
  if (f.size > GIOI_HAN.byteFile) return { ok: false, error: 'File quá lớn (tối đa 5 MB).' }
  let wb: XLSX.WorkBook
  try {
    wb = XLSX.read(Buffer.from(await f.arrayBuffer()), { type: 'buffer', codepage: 65001 })
  } catch {
    return { ok: false, error: 'Không đọc được file.' }
  }
  const rows = (ws: XLSX.WorkSheet | undefined) => (ws ? XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' }) : null)
  const rowsLoi = rows(wb.Sheets['Danh mục lỗi'] ?? wb.Sheets[wb.SheetNames[0]])
  if (!rowsLoi) return { ok: false, error: 'File không có sheet nào.' }
  const rowsGan = rows(wb.Sheets['Gán ticket'])
  if (rowsLoi.length > GIOI_HAN.soHangSheet || (rowsGan?.length ?? 0) > GIOI_HAN.soHangSheet)
    return { ok: false, error: `Mỗi sheet tối đa ${GIOI_HAN.soHangSheet} dòng.` }
  return { ok: true, rowsLoi, rowsGan }
}

async function phanTichFile(db: ReturnType<typeof dataClient>, p: Phan) {
  const { data: nhom } = await db.from('issue_group').select('code')
  const nhomHopLe = new Set(((nhom ?? []) as { code: string }[]).map((x) => x.code))
  const danhMuc = docDanhMuc(p.rowsLoi, nhomHopLe)
  const { data: coSan } = await db.from('loi_danh_muc').select('code, trang_thai')
  const trangThaiCoSan = new Map(((coSan ?? []) as { code: string; trang_thai: TrangThaiLoi }[]).map((x) => [x.code, x.trang_thai]))
  const maHopLe = new Set<string>(trangThaiCoSan.keys())
  for (const l of danhMuc.hopLe) maHopLe.add(l.code)
  const ganTicket = p.rowsGan ? docGanTicket(p.rowsGan, maHopLe) : { hopLe: [], loi: [] }
  return { danhMuc, ganTicket, soDoiTrangThai: demDoiTrangThai(danhMuc.hopLe, trangThaiCoSan) }
}

const gomLoi = (...ds: { dong: number; loi: string }[][]) =>
  ds.flat().slice(0, 10).map((l) => `Dòng ${l.dong}: ${l.loi}`).join('\n')

export async function xemTruocNhapDanhMuc(fd: FormData): Promise<
  | { ok: true; danhMuc: ReturnType<typeof docDanhMuc>; ganTicket: ReturnType<typeof docGanTicket>; soDongSeDoi: number; soDoiTrangThai: number }
  | { ok: false; error: string }
> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const f = await docFile(fd)
  if (!f.ok) return f
  const db = dataClient()
  const { danhMuc, ganTicket, soDoiTrangThai } = await phanTichFile(db, f)
  // Dry-run: đếm dòng tự động/backfill CHƯA bị CS sửa sẽ bị ghi đè.
  let soDongSeDoi = 0
  const codes = [...new Set(ganTicket.hopLe.map((g) => g.ticket_code))]
  for (let i = 0; i < codes.length; i += 200) {
    const { count } = await db.from('ticket_may').select('id', { count: 'exact', head: true })
      .in('ticket_code', codes.slice(i, i + 200)).in('nguon', NGUON_TU_DONG).eq('cs_sua', false)
    soDongSeDoi += count ?? 0
  }
  return { ok: true, danhMuc, ganTicket, soDongSeDoi, soDoiTrangThai }
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
  // Một giao dịch: upsert danh mục + gán lỗi cho dòng tu_dong/backfill chưa cs_sua + audit old→new.
  const { data, error } = await db.rpc('cs_nhap_danh_muc_loi', {
    p_loi: danhMuc.hopLe, p_gan: ganTicket.hopLe, p_nguoi: nv?.email ?? null, p_nguoi_id: nv?.id ?? null,
  })
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'cs_nhap_danh_muc_loi') }
  const r = (data ?? {}) as { so_loi?: number; so_gan?: number }
  lamMoi(undefined, true)
  return { ok: true, so_loi: r.so_loi ?? 0, so_gan: r.so_gan ?? 0 }
}

export async function phanLoaiLai(chayThu: boolean): Promise<{ ok: true; baoCao: Record<string, unknown> } | { ok: false; error: string }> {
  await requireStaff()
  if (!(await quanLyDanhMuc())) return { ok: false, error: KHONG_DU_QUYEN }
  const thu = chayThu !== false // mặc định an toàn: chạy thử
  // cs_ticket_may_backfill chỉ service_role gọi được — dataClient() chính là client đó.
  const { data, error } = await dataClient().rpc('cs_ticket_may_backfill', { p_chay_thu: thu })
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'cs_ticket_may_backfill') }
  if (!thu) {
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
  if (!Array.isArray(codes) || codes.length > GIOI_HAN.soMaTicket) throw new Error('Quá nhiều ticket trong một lần tra.')
  const ds = codes.filter(maTicketHopLe)
  if (!ds.length) return {}
  const { data, error } = await dataClient().from('ticket_may').select(COT_DONG)
    .in('ticket_code', ds).order('ticket_code').order('thu_tu')
  if (error) throw new Error(thongBaoLoiDb(error, 'dongMayTheoTickets'))
  const ra: Record<string, DongMay[]> = {}
  for (const r of (data ?? []) as unknown as DongDb[]) (ra[r.ticket_code] ??= []).push(raDong(r))
  return ra
}

export async function ticketCodesTheoLoi(loiCode: string): Promise<string[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  const ma = chuanMaLoi(loiCode)
  if (!MA_LOI.test(ma)) return []
  const { data, error } = await dataClient().from('ticket_may').select('ticket_code').eq('loi_code', ma)
  if (error) throw new Error(thongBaoLoiDb(error, 'ticketCodesTheoLoi'))
  return [...new Set(((data ?? []) as { ticket_code: string }[]).map((r) => r.ticket_code))]
}

export async function themDongMay(code: string, input: DongMayInput): Promise<KQ<{ id: string }>> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: 'Mã ticket không hợp lệ.' }
  const d = input ?? {}
  if (d.loi_code != null && !MA_LOI.test(chuanMaLoi(d.loi_code))) return { ok: false, error: KHONG_DUNG_DUOC }
  if (d.mo_ta != null && (typeof d.mo_ta !== 'string' || d.mo_ta.length > GIOI_HAN.text)) return { ok: false, error: 'Mô tả quá dài.' }
  if (d.trang_thai != null && !laTrangThaiDong(d.trang_thai)) return { ok: false, error: 'Trạng thái không hợp lệ.' }
  const db = dataClient()
  const c = await chuanBiDong(db, d)
  if (!c.ok) return c
  const nv = await layNhanVien()
  const r = await themDongQuaRpc(db, code, c, nv?.email ?? null)
  if (r.ok) lamMoi(code)
  return r
}

export async function suaDongMay(id: string, patch: DongMayInput & { huong_xu_ly?: string }): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: LOI_ID }
  const p = patch ?? {}
  if (p.mo_ta != null && (typeof p.mo_ta !== 'string' || p.mo_ta.length > GIOI_HAN.text)) return { ok: false, error: 'Mô tả quá dài.' }
  if (p.huong_xu_ly != null && (typeof p.huong_xu_ly !== 'string' || p.huong_xu_ly.length > GIOI_HAN.text)) return { ok: false, error: 'Hướng xử lý quá dài.' }
  if (p.trang_thai !== undefined && !laTrangThaiDong(p.trang_thai)) return { ok: false, error: 'Trạng thái không hợp lệ.' }
  if (p.serial != null && (typeof p.serial !== 'string' || p.serial.length > GIOI_HAN.serialRaw)) return { ok: false, error: 'Serial không hợp lệ.' }
  if (p.loi_code !== undefined && !MA_LOI.test(chuanMaLoi(p.loi_code))) return { ok: false, error: KHONG_DUNG_DUOC }
  const db = dataClient()
  const { data: d } = await db.from('ticket_may').select('id, ticket_code').eq('id', id).maybeSingle()
  if (!d) return { ok: false, error: 'Không thấy dòng máy.' }
  const code = (d as { ticket_code: string }).ticket_code
  // cs_sua = true: CS đã sửa → trigger/Sheet không ghi đè nữa. nguon giữ nguyên.
  const up: Record<string, unknown> = { cs_sua: true }
  if (p.loi_code !== undefined) {
    const ma = chuanMaLoi(p.loi_code)
    if (!(await loiDungDuoc(db, ma))) return { ok: false, error: KHONG_DUNG_DUOC }
    up.loi_code = ma
  }
  if (p.serial !== undefined) {
    const sr = await giaiSerial(db, p.serial ?? '')
    if (!sr.ok) return sr
    Object.assign(up, { serial: sr.serial, source_serial: sr.source_serial, internal_code: sr.internal_code })
  }
  if (p.mo_ta !== undefined) up.mo_ta = p.mo_ta
  if (p.trang_thai !== undefined) up.trang_thai = p.trang_thai
  if (p.huong_xu_ly !== undefined) {
    up.huong_xu_ly = p.huong_xu_ly.trim() || null
    up.huong_xu_ly_nguon = p.huong_xu_ly.trim() ? 'cs' : null
  }
  const { data: kq, error } = await db.from('ticket_may').update(up).eq('id', id).select('id')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'suaDongMay') }
  if (!nDong(kq)) return { ok: false, error: 'Không thấy dòng máy.' }
  lamMoi(code)
  return { ok: true }
}

export async function xoaDongMay(id: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: LOI_ID }
  const nv = await layNhanVien()
  // RPC khoá hàng ticket, đếm dòng, xoá và ghi audit trong một giao dịch.
  const { data, error } = await dataClient().rpc('cs_xoa_dong_may', { p_id: id, p_nguoi: nv?.email ?? null, p_nguoi_id: nv?.id ?? null })
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'cs_xoa_dong_may') }
  const r = data as { ok?: boolean; loi?: string; ticket_code?: string } | null
  if (!r?.ok) return { ok: false, error: r?.loi === 'dong_cuoi' ? 'Ticket phải còn ít nhất một dòng máy.' : 'Không thấy dòng máy.' }
  lamMoi(r.ticket_code)
  return { ok: true }
}

export async function xacNhanHuongXuLy(id: string, noiDung: string, tuDanhMuc: boolean): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: LOI_ID }
  const nd = typeof noiDung === 'string' ? noiDung.trim() : ''
  if (!nd) return { ok: false, error: 'Hướng xử lý không được trống.' }
  if (nd.length > GIOI_HAN.text) return { ok: false, error: 'Hướng xử lý quá dài.' }
  const { data, error } = await dataClient().from('ticket_may')
    .update({ huong_xu_ly: nd, huong_xu_ly_nguon: tuDanhMuc ? 'danh_muc' : 'cs', cs_sua: true })
    .eq('id', id).select('ticket_code')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'xacNhanHuongXuLy') }
  if (!nDong(data)) return { ok: false, error: 'Không thấy dòng máy.' }
  const r = Array.isArray(data) ? data[0] : data
  lamMoi((r as { ticket_code: string }).ticket_code)
  return { ok: true } // KHÔNG đụng tickets.state
}

// ───────────────────────── Tra cứu ─────────────────────────

export async function traSerial(raw: string): Promise<KetQuaTraSerial> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const k = kiemDangSerial(typeof raw === 'string' ? raw : '')
  if (k.chuan.length > GIOI_HAN.serialRaw) return { loai: 'sai_dang', serial: k.chuan.slice(0, GIOI_HAN.serialRaw), loi: 'Serial quá dài.' }
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
  if (typeof q !== 'string' || q.length > GIOI_HAN.truyVan) return []
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

// ───────────────────────── Báo cáo tần suất ─────────────────────────

const TRANG = 1000
const TOI_DA_TRANG = 500 // 500k hàng/view; vượt thì báo lỗi chứ không cắt âm thầm

/** Đọc HẾT một view bằng .range() (PostgREST max-rows mặc định 1000), khoá sắp xếp ổn định. */
async function docHetView(db: ReturnType<typeof dataClient>, ten: string, khoa: string[]): Promise<Record<string, unknown>[]> {
  const ra: Record<string, unknown>[] = []
  for (let i = 0; i < TOI_DA_TRANG; i++) {
    let q = db.from(ten).select('*')
    for (const k of khoa) q = q.order(k)
    const { data, error } = await q.range(i * TRANG, i * TRANG + TRANG - 1)
    if (error) throw new Error(thongBaoLoiDb(error, `duLieuTanSuat:${ten}`))
    const ds = (data ?? []) as Record<string, unknown>[]
    ra.push(...ds)
    if (ds.length < TRANG) return ra
  }
  throw new Error('Dữ liệu báo cáo quá lớn, không đọc hết được.')
}

export async function duLieuTanSuat(): Promise<{ ca: DongCa[]; ban: MauSo[]; nhap: MauSo[] }> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  const db = dataClient()
  const [ca, ban, nhap] = await Promise.all([
    docHetView(db, 'v_loi_ca', ['id']),
    docHetView(db, 'v_loi_so_ban', ['internal_code', 'thang']),
    docHetView(db, 'v_loi_so_nhap', ['internal_code', 'thang']),
  ])
  return {
    ca: ca as unknown as DongCa[],
    ban: ban.map((r) => ({ internal_code: String(r.internal_code), thang: String(r.thang), so: Number(r.so_ban) || 0 })),
    nhap: nhap.map((r) => ({ internal_code: String(r.internal_code), thang: String(r.thang), so: Number(r.so_nhap) || 0 })),
  }
}
