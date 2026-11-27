'use server'

// Lần lỗi ở GWT-Masterdata (`customer_care.issue_reports`) — bật khi CSKH_NGUON=md (lib/cskh/nguon.ts). Ở MD mọi lần
// (kể cả lần 1) là một dòng; ST giữ đường cũ (lan-loi-actions.ts: lần 1 ở tickets, lần 2+ ở ticket_lan_loi).
import { mdClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { cskhNguon } from '@/lib/cskh/nguon'
import { listLanLoi } from '@/app/ticket/lan-loi-actions'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { laUuid, maTicketHopLe, MA_LOI, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { GIOI_HAN_LAN_LOI, type LanLoi as LanLoiSt } from '@/lib/loi/lanLoi'
import { kiemNgay, ngayVNHomNay } from '@/lib/loi/ngayTicket'

export type TrangThaiLanMd = 'cho_xu_ly' | 'dang_xu_ly' | 'da_xu_ly' | 'khong_loi'
export type LanLoi = {
  id: string
  report_no: number
  serial: string | null
  issue_code: string
  issue_name: string
  reported_on: string | null
  customer_said: string | null
  handling: string | null
  status: TrangThaiLanMd
  created_by: string | null
}
type SuaLan = Partial<Pick<LanLoi, 'customer_said' | 'handling' | 'status' | 'issue_code' | 'serial'>>

const TRANG_THAI: readonly TrangThaiLanMd[] = ['cho_xu_ly', 'dang_xu_ly', 'da_xu_ly', 'khong_loi']
const COT = 'id, report_no, serial, issue_code, reported_on, customer_said, handling, status, created_by, issue_codes(name)'
const LOI_MA = 'Mã ticket không hợp lệ.'
const db = () => mdClient().schema('customer_care')

/** Ô chữ: trim, '' → null; quá dài / sai kiểu → lỗi. */
function chu(x: unknown): { ok: true; v: string | null } | { ok: false; error: string } {
  if (x == null) return { ok: true, v: null }
  if (typeof x !== 'string') return { ok: false, error: 'Dữ liệu không hợp lệ.' }
  const v = x.trim()
  if (v.length > GIOI_HAN_LAN_LOI) return { ok: false, error: `Mỗi ô tối đa ${GIOI_HAN_LAN_LOI} ký tự.` }
  return { ok: true, v: v || null }
}

/** Mọi lần lỗi của ticket ở MD, theo report_no. */
export async function listLanLoiMd(code: string): Promise<LanLoi[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!maTicketHopLe(code)) return []
  const { data, error } = await db().from('issue_reports').select(COT).eq('ticket_code', code).order('report_no')
  if (error) throw new Error(thongBaoLoiDb(error, 'listLanLoiMd'))
  return ((data ?? []) as unknown as (Omit<LanLoi, 'issue_name'> & { issue_codes: { name: string } | null })[]).map(
    ({ issue_codes, ...r }) => ({ ...r, issue_name: issue_codes?.name ?? r.issue_code }),
  )
}

/** Thêm lần kế tiếp (max report_no + 1). Máy bỏ trống = máy của lần gần nhất. Trùng số do 2 người bấm cùng lúc → thử lại 1 lần. */
export async function themLanLoiMd(
  code: string,
  input: { customer_said: string; serial?: string | null; reported_on?: string | null },
): Promise<KQ<{ id: string; report_no: number }>> {
  const user = await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const khach = chu(input?.customer_said)
  if (!khach.ok) return khach
  const may = chu(input?.serial)
  if (!may.ok) return may
  const homNay = ngayVNHomNay()
  const n = kiemNgay(input?.reported_on, homNay)
  if (!n.ok) return n
  for (let thu = 0; thu < 2; thu++) {
    const { data: ds, error: e0 } = await db().from('issue_reports').select('report_no, serial').eq('ticket_code', code)
    if (e0) return { ok: false, error: thongBaoLoiDb(e0, 'themLanLoiMd.doc') }
    const cu = ((ds ?? []) as { report_no: number; serial: string | null }[]).reduce<{ report_no: number; serial: string | null } | null>(
      (m, x) => (!m || x.report_no > m.report_no ? x : m),
      null,
    )
    const report_no = (cu?.report_no ?? 0) + 1
    // Gửi đủ khoá mặc định (issue_code, status) — không trông vào default cột (bẫy PostgREST: thiếu khoá → NULL khi chèn lô).
    const { data, error } = await db()
      .from('issue_reports')
      .insert({
        ticket_code: code,
        report_no,
        serial: input?.serial === undefined ? (cu?.serial ?? null) : may.v,
        issue_code: 'CHUA_PHAN_LOAI',
        status: 'cho_xu_ly',
        reported_on: n.ngay ?? homNay,
        customer_said: khach.v,
        created_by: user.email ?? null,
      })
      .select('id, report_no')
      .single()
    if (!error) {
      await ghiAudit('them_lan_loi', `ticket:${code}`, { lan: report_no, nguon: 'md' })
      const r = data as { id: string; report_no: number }
      return { ok: true, id: r.id, report_no: r.report_no }
    }
    if (error.code !== '23505') return { ok: false, error: thongBaoLoiDb(error, 'themLanLoiMd') }
  }
  return { ok: false, error: 'Có người vừa thêm lần lỗi khác, bấm Lưu lại.' }
}

/** Sửa một lần: chỉ các trường trong `patch` (undefined = không đổi). */
export async function suaLanLoiMd(id: string, code: string, patch: SuaLan): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: 'Mã lần lỗi không hợp lệ.' }
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const p = patch ?? {}
  const row: Record<string, string | null> = {}
  for (const k of ['customer_said', 'handling', 'serial'] as const) {
    if (p[k] === undefined) continue
    const c = chu(p[k])
    if (!c.ok) return c
    row[k] = c.v
  }
  if (p.status !== undefined) {
    if (!TRANG_THAI.includes(p.status)) return { ok: false, error: 'Trạng thái không hợp lệ.' }
    row.status = p.status
  }
  if (p.issue_code !== undefined) {
    if (typeof p.issue_code !== 'string' || !MA_LOI.test(p.issue_code)) return { ok: false, error: 'Mã lỗi không hợp lệ.' }
    row.issue_code = p.issue_code
  }
  if (!Object.keys(row).length) return { ok: false, error: 'Không có gì để lưu.' }
  const { data, error } = await db().from('issue_reports').update(row).eq('id', id).eq('ticket_code', code).select('id')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'suaLanLoiMd') }
  if (!data?.length) return { ok: false, error: 'Không thấy lần lỗi này (có thể đã bị xoá).' }
  return { ok: true }
}

/** Tab Lần lỗi: đọc theo nguồn đang bật — client không đọc được env nên hỏi server. */
export async function docLanLoi(code: string): Promise<{ md: true; ds: LanLoi[] } | { md: false; ds: LanLoiSt[] }> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  return cskhNguon() === 'md' ? { md: true, ds: await listLanLoiMd(code) } : { md: false, ds: await listLanLoi(code) }
}
