'use server'

// Danh sách người trên ticket (18/11/2026): CS theo dõi (cs_theo_doi_ds) + Kỹ thuật theo hồ sơ thợ (ky_thuat).
// Thêm / đổi tên / XOÁ ngay trên ticket; gán vào ticket. Chị Trang 18/11: chỉ cần Thêm + Xoá, không cần "ẩn".
// Xoá → ticket đang gán người đó về "chưa gán" (FK on delete set null). Thợ đã có lịch kỹ thuật thì không xoá ở đây
// (xoá sẽ mất ngày nghỉ + bỏ trống lịch cũ) — làm ở trang Kỹ thuật.
// Riêng file này, không đụng app/actions.ts (dùng chung mọi khu).

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { maTicketHopLe, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { chuanTenNguoi, taiKhoanCuaTho, type NguoiDs } from '@/lib/loi/nguoiTicket'

export type LoaiNguoi = 'cs' | 'kt'
export type NguoiTicket = { cs: NguoiDs[]; kt: NguoiDs[]; kt_ho_so: string | null }

const BANG: Record<LoaiNguoi, string> = { cs: 'cs_theo_doi_ds', kt: 'ky_thuat' }
const LOI_MA = 'Mã ticket không hợp lệ.'
const LOI_LOAI = 'Danh sách không hợp lệ.'
const laLoai = (x: unknown): x is LoaiNguoi => x === 'cs' || x === 'kt'

async function chan() {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
}

async function docDs(loai: LoaiNguoi): Promise<NguoiDs[]> {
  const q = loai === 'cs'
    ? dataClient().from('cs_theo_doi_ds').select('id, ten, hoat_dong').order('thu_tu').order('ten')
    : dataClient().from('ky_thuat').select('id, ten, hoat_dong, la_ctv').order('ten')
  const { data, error } = await q
  if (error) throw new Error(thongBaoLoiDb(error, `docDs ${loai}`))
  const ds = (data ?? []) as NguoiDs[]
  // CS: không còn khái niệm ẩn → ai có trong danh sách là chọn được (kể cả người lỡ ẩn trước 18/11 chiều).
  // Kỹ thuật: hoat_dong do trang Kỹ thuật quản lý (thợ nghỉ hẳn) → giữ nguyên.
  return loai === 'cs' ? ds.map((x) => ({ ...x, hoat_dong: true })) : ds
}

function moiTrang(code?: string) {
  if (code) revalidatePath(`/ticket/${code}`)
  revalidatePath('/ticket'); revalidatePath('/ky-thuat')
}

/** Hai danh sách + kỹ thuật (hồ sơ) đang gán. Chưa áp migration 18/11 → ném lỗi (trang bọc docAnToan, chạy như cũ). */
export async function docNguoiTicket(code: string): Promise<NguoiTicket> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  const [cs, kt] = await Promise.all([docDs('cs'), docDs('kt')])
  let kt_ho_so: string | null = null
  if (maTicketHopLe(code)) {
    const { data, error } = await dataClient().from('tickets').select('kt_ho_so').eq('ticket_code', code).maybeSingle()
    if (error) throw new Error(thongBaoLoiDb(error, 'docNguoiTicket'))
    kt_ho_so = (data as { kt_ho_so: string | null } | null)?.kt_ho_so ?? null
  }
  return { cs, kt, kt_ho_so }
}

/** Danh sách kỹ thuật cho form Tạo ticket. Chưa áp migration vẫn đọc được (bảng ky_thuat có sẵn). */
export async function dsKyThuatChoTicket(): Promise<NguoiDs[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  return docDs('kt')
}

/** Thêm người. Gõ trùng người đã có (bỏ dấu, hoa thường) → dùng lại người đó (thợ đang "nghỉ" thì bật lại). */
export async function themNguoi(loai: LoaiNguoi, ten: string, laCtv = false): Promise<KQ<{ id: string; ten: string }>> {
  await chan()
  if (!laLoai(loai)) return { ok: false, error: LOI_LOAI }
  const ds = await docDs(loai)
  const c = chuanTenNguoi(ten, ds)
  if (!c.ok) return c
  if (c.trung) {
    if (!c.trung.hoat_dong) {
      const { error } = await dataClient().from(BANG[loai]).update({ hoat_dong: true }).eq('id', c.trung.id)
      if (error) return { ok: false, error: thongBaoLoiDb(error, 'themNguoi hien lai') }
      await ghiAudit('hien_lai_nguoi_ticket', `${BANG[loai]}:${c.trung.id}`, { ten: c.trung.ten })
      moiTrang()
    }
    return { ok: true, id: c.trung.id, ten: c.trung.ten }
  }
  const dong: Record<string, unknown> = loai === 'cs'
    ? { ten: c.ten, thu_tu: ds.length + 1 }
    : { ten: c.ten, la_ctv: !!laCtv, hoat_dong: true }
  const { data, error } = await dataClient().from(BANG[loai]).insert(dong).select('id').single()
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'themNguoi') }
  const id = (data as { id: string }).id
  await ghiAudit('them_nguoi_ticket', `${BANG[loai]}:${id}`, dong)
  moiTrang()
  return { ok: true, id, ten: c.ten }
}

/** Đổi tên. CS: ticket đang gán tự theo tên mới (FK ON UPDATE CASCADE). */
export async function doiTenNguoi(loai: LoaiNguoi, id: string, ten: string): Promise<KQ> {
  await chan()
  if (!laLoai(loai)) return { ok: false, error: LOI_LOAI }
  const ds = await docDs(loai)
  const cu = ds.find((x) => x.id === id)
  if (!cu) return { ok: false, error: 'Không thấy người này.' }
  const c = chuanTenNguoi(ten, ds, id)
  if (!c.ok) return c
  if (c.trung) return { ok: false, error: `Đã có "${c.trung.ten}" trong danh sách.` }
  if (c.ten === cu.ten) return { ok: true }
  const { error } = await dataClient().from(BANG[loai]).update({ ten: c.ten }).eq('id', id)
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'doiTenNguoi') }
  await ghiAudit('doi_ten_nguoi_ticket', `${BANG[loai]}:${id}`, { truoc: cu.ten, sau: c.ten })
  moiTrang()
  return { ok: true }
}

/** Xoá người khỏi danh sách. Ticket đang gán → "chưa gán". Thợ đã có lịch kỹ thuật → không xoá ở đây. */
export async function xoaNguoi(loai: LoaiNguoi, id: string): Promise<KQ> {
  await chan()
  if (!laLoai(loai)) return { ok: false, error: LOI_LOAI }
  const db = dataClient()
  const ng = (await docDs(loai)).find((x) => x.id === id)
  if (!ng) return { ok: false, error: 'Không thấy người này.' }
  if (loai === 'kt') {
    const { data: lich, error } = await db.from('lich_ky_thuat').select('id').eq('ky_thuat_id', id).limit(1)
    if (error) return { ok: false, error: thongBaoLoiDb(error, 'xoaNguoi lich') }
    if (lich?.length) {
      return { ok: false, error: `"${ng.ten}" đã có lịch kỹ thuật — không xoá ở đây để giữ lịch sử. Vào CSKH › Kỹ thuật để xử lý.` }
    }
  }
  const { error } = await db.from(BANG[loai]).delete().eq('id', id)
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'xoaNguoi') }
  await ghiAudit('xoa_nguoi_ticket', `${BANG[loai]}:${id}`, { ten: ng.ten })
  moiTrang()
  return { ok: true }
}

async function ghiTicket(code: string, patch: Record<string, unknown>, viec: string): Promise<KQ> {
  const { data, error } = await dataClient().from('tickets').update(patch).eq('ticket_code', code).select('ticket_code')
  if (error) return { ok: false, error: thongBaoLoiDb(error, viec) }
  if (!data?.length) return { ok: false, error: 'Không thấy ticket.' }
  await ghiAudit(viec, `ticket:${code}`, patch)
  moiTrang(code)
  return { ok: true }
}

/** Gán CS theo dõi theo id trong danh sách (null = bỏ gán). Chỉ chọn người đang dùng, trừ người đang gán sẵn. */
export async function ganCsTheoDoi(code: string, id: string | null): Promise<KQ> {
  await chan()
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  if (!id) return ghiTicket(code, { cs_theo_doi: null }, 'dat_cs_theo_doi')
  const { data: t } = await dataClient().from('tickets').select('cs_theo_doi').eq('ticket_code', code).maybeSingle()
  const ng = (await docDs('cs')).find((x) => x.id === id)
  if (!ng) return { ok: false, error: 'Không thấy người này trong danh sách CS.' }
  if (!ng.hoat_dong && (t as { cs_theo_doi: string | null } | null)?.cs_theo_doi !== ng.ten) {
    return { ok: false, error: `"${ng.ten}" không còn trong danh sách.` }
  }
  return ghiTicket(code, { cs_theo_doi: ng.ten }, 'dat_cs_theo_doi')
}

/**
 * Gán kỹ thuật theo hồ sơ thợ (null = bỏ gán). Ghi kèm tickets.ky_thuat = tài khoản staff của thợ (khớp email)
 * để thợ có tài khoản vẫn thấy ticket ở "của tôi"; CTV không tài khoản → ky_thuat = null.
 */
export async function ganKyThuat(code: string, id: string | null): Promise<KQ> {
  await chan()
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  if (!id) return ghiTicket(code, { kt_ho_so: null, ky_thuat: null }, 'dat_ky_thuat')
  const db = dataClient()
  const [{ data: tho, error: e1 }, { data: t }, { data: staff }] = await Promise.all([
    db.from('ky_thuat').select('id, ten, email, hoat_dong').eq('id', id).maybeSingle(),
    db.from('tickets').select('kt_ho_so').eq('ticket_code', code).maybeSingle(),
    db.from('staff').select('id, email').eq('hoat_dong', true),
  ])
  if (e1) return { ok: false, error: thongBaoLoiDb(e1, 'ganKyThuat') }
  const h = tho as { id: string; ten: string; email: string | null; hoat_dong: boolean } | null
  if (!h) return { ok: false, error: 'Không thấy thợ này.' }
  if (!h.hoat_dong && (t as { kt_ho_so: string | null } | null)?.kt_ho_so !== h.id) {
    return { ok: false, error: `"${h.ten}" đang ở trạng thái nghỉ (trang Kỹ thuật) — bật lại trước khi gán.` }
  }
  const taiKhoan = taiKhoanCuaTho(h.email, (staff ?? []) as { id: string; email: string | null }[])
  return ghiTicket(code, { kt_ho_so: h.id, ky_thuat: taiKhoan }, 'dat_ky_thuat')
}
