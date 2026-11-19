'use server'

// Danh sách người trên ticket (18/11/2026): CS theo dõi (cs_theo_doi_ds) + Kỹ thuật theo hồ sơ thợ (ky_thuat).
// Thêm / đổi tên / XOÁ ngay trên ticket; gán vào ticket. Chị Trang 18/11: chỉ cần Thêm + Xoá, không cần "ẩn".
// (18/11: Xoá = DELETE dòng, ticket về "chưa gán". Đã thay ngày 19/11 — xem dưới.)
// Riêng file này, không đụng app/actions.ts (dùng chung mọi khu).

// 19/11/2026 (Hiệp, chiều): "Xoá" KHÔNG xoá dòng nữa mà đặt hoat_dong = false (cách Freshdesk / Jobber "deactivate"):
// người đó biến mất khỏi danh sách + ô chọn, ticket đã xong GIỮ tên; ticket đang mở chuyển sang người khác hoặc "chưa gán".
// Thêm lại đúng tên = khôi phục (themNguoi). DB chặn DELETE người đã gán ticket (migration 20261119100000).
// 19/11/2026 (Hiệp): THÊM / XOÁ người chỉ làm ở trang quản trị /danh-sach-nguoi, chỉ người giữ vai trò "Sửa danh sách người" (
// lib/nen-tang/sua-danh-sach.ts). Bỏ đổi tên. Trên ticket chỉ còn CHỌN người (gán) — quyền cs.ticket.tao_sua như cũ.

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { maTicketHopLe, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { chuanTenNguoi, taiKhoanCuaTho, type NguoiDs } from '@/lib/loi/nguoiTicket'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { KHONG_DU_QUYEN } from '@/lib/nen-tang/nhan-su-luat'

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

/** Thêm / xoá người: chỉ tài khoản trong danh sách được sửa (admin@, ai@). */
async function chanSuaDanhSach(): Promise<KQ | null> {
  await requireStaff()
  return (await coSuaDanhSach()) ? null : { ok: false, error: KHONG_DU_QUYEN }
}

async function docDs(loai: LoaiNguoi): Promise<NguoiDs[]> {
  const q = loai === 'cs'
    ? dataClient().from('cs_theo_doi_ds').select('id, ten, hoat_dong').order('thu_tu').order('ten')
    : dataClient().from('ky_thuat').select('id, ten, hoat_dong, la_ctv').order('ten')
  const { data, error } = await q
  if (error) throw new Error(thongBaoLoiDb(error, `docDs ${loai}`))
  // hoat_dong = false: đã xoá trên app (19/11) — không chọn được, chỉ còn hiện ở ticket cũ đang mang tên họ.
  return (data ?? []) as NguoiDs[]
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
  const khong = await chanSuaDanhSach(); if (khong) return khong as KQ<{ id: string; ten: string }>
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

/**
 * "Xoá" người khỏi danh sách = hoat_dong false (KHÔNG xoá dòng). Ticket đã xong giữ tên. Ticket ĐANG MỞ của người đó
 * chuyển sang `chuyenSang` (id người khác cùng danh sách, đang dùng) hoặc "chưa gán" (null).
 */
export async function xoaNguoi(loai: LoaiNguoi, id: string, chuyenSang: string | null = null): Promise<KQ<{ so_ticket: number }>> {
  const khong = await chanSuaDanhSach(); if (khong) return khong as KQ<{ so_ticket: number }>
  if (!laLoai(loai)) return { ok: false, error: LOI_LOAI }
  const db = dataClient()
  const ds = await docDs(loai)
  const ng = ds.find((x) => x.id === id && x.hoat_dong)
  if (!ng) return { ok: false, error: 'Không thấy người này trong danh sách.' }
  const moi = chuyenSang ? ds.find((x) => x.id === chuyenSang && x.hoat_dong && x.id !== id) : null
  if (chuyenSang && !moi) return { ok: false, error: 'Người nhận ticket không có trong danh sách.' }

  // 1. Ticket đang mở → người mới / chưa gán. Ticket đã xong, đã huỷ: không đụng (giữ lịch sử).
  let patch: Record<string, unknown>
  let q
  if (loai === 'cs') {
    patch = { cs_theo_doi: moi?.ten ?? null }
    q = db.from('tickets').update(patch).eq('cs_theo_doi', ng.ten).eq('state', 'Open').select('ticket_code')
  } else {
    let taiKhoan: string | null = null
    if (moi) {
      const [{ data: tho }, { data: staff }] = await Promise.all([
        db.from('ky_thuat').select('email').eq('id', moi.id).maybeSingle(),
        db.from('staff').select('id, email').eq('hoat_dong', true),
      ])
      taiKhoan = taiKhoanCuaTho((tho as { email: string | null } | null)?.email ?? null, (staff ?? []) as { id: string; email: string | null }[])
    }
    patch = { kt_ho_so: moi?.id ?? null, ky_thuat: taiKhoan }
    q = db.from('tickets').update(patch).eq('kt_ho_so', id).eq('state', 'Open').select('ticket_code')
  }
  const { data: doi, error: e1 } = await q
  if (e1) return { ok: false, error: thongBaoLoiDb(e1, 'xoaNguoi chuyen ticket') }

  // 2. Ngừng dùng người đó.
  const { error } = await db.from(BANG[loai]).update({ hoat_dong: false }).eq('id', id)
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'xoaNguoi') }
  const so_ticket = doi?.length ?? 0
  await ghiAudit('xoa_nguoi_ticket', `${BANG[loai]}:${id}`, { ten: ng.ten, chuyen_sang: moi?.ten ?? null, so_ticket_dang_mo: so_ticket })
  moiTrang(); revalidatePath('/danh-sach-nguoi')
  return { ok: true, so_ticket }
}

export type NguoiQuanTri = NguoiDs & { so_ticket: number; so_lich_hen: number }

/** Trang quản trị: hai danh sách + số ticket ĐANG MỞ gán mỗi người (để biết trước khi xoá). Chỉ người giữ vai trò "Sửa danh sách người". */
export async function dsNguoiQuanTri(): Promise<KQ<{ cs: NguoiQuanTri[]; kt: NguoiQuanTri[] }>> {
  const khong = await chanSuaDanhSach(); if (khong) return khong as KQ<{ cs: NguoiQuanTri[]; kt: NguoiQuanTri[] }>
  const homNay = new Date().toISOString().slice(0, 10)
  const [cs, kt, { data: tk, error }, { data: lich, error: e2 }] = await Promise.all([
    docDs('cs'), docDs('kt'),
    dataClient().from('tickets').select('cs_theo_doi, kt_ho_so').eq('state', 'Open').limit(20000),
    dataClient().from('lich_ky_thuat').select('ky_thuat_id').eq('trang_thai', 'hen').gte('ngay', homNay).limit(20000),
  ])
  if (error || e2) return { ok: false, error: thongBaoLoiDb((error ?? e2)!, 'dsNguoiQuanTri') }
  const demLich = new Map<string, number>()
  for (const l of (lich ?? []) as { ky_thuat_id: string | null }[]) {
    if (l.ky_thuat_id) demLich.set(l.ky_thuat_id, (demLich.get(l.ky_thuat_id) ?? 0) + 1)
  }
  const demCs = new Map<string, number>(), demKt = new Map<string, number>()
  for (const t of (tk ?? []) as { cs_theo_doi: string | null; kt_ho_so: string | null }[]) {
    if (t.cs_theo_doi) demCs.set(t.cs_theo_doi, (demCs.get(t.cs_theo_doi) ?? 0) + 1)
    if (t.kt_ho_so) demKt.set(t.kt_ho_so, (demKt.get(t.kt_ho_so) ?? 0) + 1)
  }
  return {
    ok: true,
    cs: cs.map((x) => ({ ...x, so_ticket: demCs.get(x.ten) ?? 0, so_lich_hen: 0 })),
    kt: kt.map((x) => ({ ...x, so_ticket: demKt.get(x.id) ?? 0, so_lich_hen: demLich.get(x.id) ?? 0 })),
  }
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
