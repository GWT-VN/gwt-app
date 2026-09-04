'use server'

/**
 * Server actions khu Kế toán — gọi RPC public.ke_toan_* bọc schema `accounting` (không expose),
 * đúng khuôn khu Việc (xem app/work/actions.ts). Mọi action: chanKeToan() (nền tảng + vai trò
 * kế toán) → dataClient(). Email lấy từ session đã xác minh — KHÔNG nhận email từ client.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { docNexia, type DongTho } from '@/lib/ke-toan/doc-file/nexia'
import { khoaDong } from '@/lib/ke-toan/chuan-hoa'
import { taoEngineDauVao } from '@/lib/ke-toan/engine/dau-vao'
import type { Luat, MucCatalog, MucKmcp, KetQuaDauVao } from '@/lib/ke-toan/engine/kieu'

export type KyRow = { id: number; ky: string; status: 'dang_xu_ly' | 'da_gui'; sent_at: string | null; cap_nhat: string; so_dong_vao: number; so_dong_ra: number; so_canh_bao: number }
export type DongRow = {
  id: number; row_order: number; line_key: string; ky_hieu: string | null; so_hd: string | null; ngay_lap: string | null
  ten_ban: string | null; ten_hang: string | null; thanh_tien: number | null; tien_thue: number | null
  raw: (string | number | null)[]; engine_code: string | null; engine_conf: string | null; engine_reason: string | null; engine_kind: string | null
  code: string | null; code_name: string | null; tk_no: string | null; tk_co: string | null; vat_1331: string | null
  note_for_accountant: string | null; first_source_id: number | null
}

const TOI_DA_BYTE = 8 * 1024 * 1024
const LO = 200

/** Gác khu Kế toán: nền tảng (mọi nhân sự) + vai trò trong VAI_TRO_VAO_KE_TOAN. Trả email đã chuẩn hoá. */
async function chanKeToan(): Promise<string> {
  const u = await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  return chuanHoaEmail(u.email)
}

/** Gọi RPC + ném lỗi kèm thông điệp gốc (tiếng Việt từ Postgres). */
async function goi<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await dataClient().rpc(fn, { p_email: await chanKeToan(), ...args })
  if (error) throw new Error(error.message)
  return data as T
}

export async function danhSachKy(): Promise<KyRow[]> {
  return (await goi<KyRow[]>('ke_toan_ky_list', {})) ?? []
}

export async function taoKy(ky: string): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    const r = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky.trim() })
    revalidatePath('/ke-toan')
    return { ok: true, id: r.id }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

async function duLieuEngine(): Promise<{ luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[] }> {
  await chanKeToan()
  const db = dataClient()
  const [luat, cat, km] = await Promise.all([
    goi<{ id: number; kind: Luat['kind']; pattern: string; target_code: string; condition: string | null; priority: number; origin: Luat['origin']; active: boolean }[]>('ke_toan_luat_list', {}),
    db.from('catalog_item').select('"Mã nội bộ", "Tên ngắn gọn (đề xuất)", "Tính chất"'),
    db.from('expense_category').select('ma, ten, tk_no_default'),
  ])
  if (cat.error) throw new Error(cat.error.message)
  if (km.error) throw new Error(km.error.message)
  return {
    luat: (luat ?? []).map((l) => ({ id: l.id, kind: l.kind, pattern: l.pattern, targetCode: l.target_code, condition: l.condition, priority: l.priority, origin: l.origin, active: l.active })),
    catalog: (cat.data as Record<string, string | null>[]).map((c) => ({ ma: c['Mã nội bộ'] ?? '', ten: c['Tên ngắn gọn (đề xuất)'] ?? '', tinhChat: c['Tính chất'] ?? '' })).filter((c) => c.ma && c.ten),
    kmcp: (km.data as { ma: string; ten: string | null; tk_no_default: string | null }[]).map((k) => ({ ma: k.ma, ten: k.ten ?? '', tkNoDefault: k.tk_no_default ?? '' })),
  }
}

function dongSql(direction: 'vao' | 'ra', d: DongTho, engine?: KetQuaDauVao) {
  const t = d.truong
  return {
    direction, line_key: khoaDong(direction, t.kyHieu, t.soHd, t.tenHang, t.thanhTien), row_order: d.rowOrder,
    ky_hieu: t.kyHieu || null, so_hd: t.soHd || null, ngay_lap: t.ngayLap, mccqt: t.mccqt || null,
    ten_ban: t.tenBan || null, mst_ban: t.mstBan || null, ten_mua: t.tenMua || null, mst_mua: t.mstMua || null,
    ten_hang: t.tenHang || null, dvt: t.dvt || null, so_luong: t.soLuong, don_gia: t.donGia, thue_suat: t.thueSuat || null,
    thanh_tien: t.thanhTien, tien_thue: t.tienThue, tong_thanh_toan: t.tongThanhToan, trang_thai: t.trangThai || null, tinh_chat: t.tinhChat || null,
    raw: d.raw,
    engine_code: engine?.code ?? null, engine_conf: engine?.conf ?? null, engine_reason: engine?.reason ?? null, engine_kind: engine?.kind ?? null,
    code: engine?.code || null, code_name: engine?.codeName || null, tk_no: engine?.tkNo || null, tk_co: engine?.tkCo || null, vat_1331: engine?.vat1331 || null,
  }
}

export async function uploadNexia(_prev: unknown, form: FormData): Promise<{ ok: true; inserted: number; updated: number; kept: number; canhBao: number } | { ok: false; error: string }> {
  const email = await chanKeToan()
  const ky = String(form.get('ky') ?? '').trim()
  const file = form.get('file')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ky)) return { ok: false, error: 'Kỳ không hợp lệ.' }
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) return { ok: false, error: 'Chọn file .xlsx (file NEXIA kế toán gửi).' }
  if (file.size > TOI_DA_BYTE) return { ok: false, error: 'File quá 8 MB.' }
  try {
    const buf = new Uint8Array(await file.arrayBuffer())
    const f = docNexia(buf)
    if (!f.vao) return { ok: false, error: 'File không có tab "HĐ đầu vào".' }

    const { id: periodId } = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky })
    const db = dataClient()
    const path = `${ky}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`
    const up = await db.storage.from('accounting').upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (up.error) return { ok: false, error: 'Không lưu được file gốc: ' + up.error.message }

    const { id: sourceId } = await goi<{ id: number }>('ke_toan_nguon_them', {
      p_period_id: periodId, p_kind: 'nexia', p_file_name: file.name, p_storage_path: path,
      p_headers: { vao: f.vao.headers, ra: f.ra?.headers ?? [] }, p_row_count: f.vao.dong.length + (f.ra?.dong.length ?? 0),
    })

    const dl = await duLieuEngine()
    const eng = taoEngineDauVao(dl)
    const rows = [
      ...f.vao.dong.map((d) => dongSql('vao', d, eng.phanLoai(d.truong.tenBan, d.truong.tenHang, d.truong.tienThue))),
      ...(f.ra?.dong ?? []).map((d) => dongSql('ra', d)),
    ]
    let inserted = 0, updated = 0, kept = 0
    for (let i = 0; i < rows.length; i += LO) {
      const r = await goi<{ inserted: number; updated: number; kept: number }>('ke_toan_dong_nhap', { p_period_id: periodId, p_source_id: sourceId, p_rows: rows.slice(i, i + LO) })
      inserted += r.inserted; updated += r.updated; kept += r.kept
    }
    const canhBao = rows.filter((r) => r.direction === 'vao' && (!r.code || r.engine_conf === 'can review' || r.engine_conf === 'khong ro')).length
    await ghiAudit('ke_toan.upload_nexia', ky, { file: file.name, inserted, updated, kept, canhBao, by: email })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/hoa-don/${ky}`)
    return { ok: true, inserted, updated, kept, canhBao }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

async function headersNguonDau(periodId: number, direction: 'vao' | 'ra'): Promise<string[]> {
  const r = await goi<{ headers: Record<string, string[]> }[]>('ke_toan_nguon_list', { p_period_id: periodId })
  const nexia = (r ?? []).find((s) => s.headers && s.headers[direction]?.length)
  return nexia?.headers[direction] ?? []
}

export async function dongCuaKy(ky: string, direction: 'vao' | 'ra'): Promise<{ period: KyRow | null; dong: DongRow[]; headers: string[] }> {
  const ds = await danhSachKy()
  const period = ds.find((k) => k.ky === ky) ?? null
  if (!period) return { period: null, dong: [], headers: [] }
  const [dong, headers] = await Promise.all([
    goi<DongRow[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: direction }),
    headersNguonDau(period.id, direction),
  ])
  return { period, dong: dong ?? [], headers }
}
