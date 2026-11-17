'use server'

// Hai cột mới của tickets (17/11): ngày khách báo lần 1 + CS theo dõi (4 tên).
// Đọc/ghi riêng ở đây — không đụng app/actions.ts / v_tickets (dùng chung nhiều khu).

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { maTicketHopLe, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { kiemCsTheoDoi, kiemNgay, ngayVNHomNay, type CsTheoDoi } from '@/lib/loi/ngayTicket'

export type ThemTicket = { ngay_bao: string | null; cs_theo_doi: CsTheoDoi | null }
const LOI_MA = 'Mã ticket không hợp lệ.'

/** Ngày khách báo lần 1 + CS theo dõi. Chưa áp migration → ném lỗi (trang bọc docAnToan, hiện như cũ). */
export async function docThemTicket(code: string): Promise<ThemTicket> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!maTicketHopLe(code)) return { ngay_bao: null, cs_theo_doi: null }
  const { data, error } = await dataClient().from('tickets').select('ngay_bao, cs_theo_doi').eq('ticket_code', code).maybeSingle()
  if (error) throw new Error(thongBaoLoiDb(error, 'docThemTicket'))
  return (data as ThemTicket | null) ?? { ngay_bao: null, cs_theo_doi: null }
}

async function ghi(code: string, patch: Record<string, unknown>, viec: string): Promise<KQ> {
  const { data, error } = await dataClient().from('tickets').update(patch).eq('ticket_code', code).select('ticket_code')
  if (error) return { ok: false, error: thongBaoLoiDb(error, viec) }
  if (!data?.length) return { ok: false, error: 'Không thấy ticket.' }
  await ghiAudit(viec, `ticket:${code}`, patch)
  revalidatePath(`/ticket/${code}`); revalidatePath('/ticket')
  return { ok: true }
}

/** Ngày khách báo lần 1 ('' = bỏ, quay về ngày tạo ticket). */
export async function datNgayBao(code: string, ngay: string | null): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const n = kiemNgay(ngay, ngayVNHomNay())
  if (!n.ok) return n
  return ghi(code, { ngay_bao: n.ngay }, 'dat_ngay_bao')
}

/** CS theo dõi theo tên ('' = bỏ gán). */
export async function datCsTheoDoi(code: string, ten: string | null): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const c = kiemCsTheoDoi(ten)
  if (!c.ok) return c
  return ghi(code, { cs_theo_doi: c.ten }, 'dat_cs_theo_doi')
}
