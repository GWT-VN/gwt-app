'use server'

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { laUuid, maTicketHopLe, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import { lamSachLanLoi, lanTiepTheo, type LanLoi } from '@/lib/loi/lanLoi'
import { kiemNgay, ngayVNHomNay } from '@/lib/loi/ngayTicket'

const COT = 'id, ticket_code, lan, mo_ta, xu_ly, tao_boi, created_at'
// Cột `ngay` (ngày khách báo) thêm 17/11 — chưa áp migration thì đọc lại không có nó, trang vẫn chạy.
const COT_NGAY = `${COT}, ngay`
const THIEU_COT = '42703'
const LOI_MA = 'Mã ticket không hợp lệ.'
const LOI_ID = 'Mã lần lỗi không hợp lệ.'

/** Các lần lỗi thứ 2+ của ticket, theo thứ tự lần. */
export async function listLanLoi(code: string): Promise<LanLoi[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!maTicketHopLe(code)) return []
  const db = dataClient()
  const doc = (cot: string) => db.from('ticket_lan_loi').select(cot).eq('ticket_code', code).order('lan')
  let r = await doc(COT_NGAY)
  if (r.error?.code === THIEU_COT) r = await doc(COT)
  if (r.error) throw new Error(thongBaoLoiDb(r.error, 'listLanLoi'))
  return (r.data ?? []) as unknown as LanLoi[]
}

/** Thêm một cặp khách báo ↔ xử lý (lần kế tiếp). Trùng số lần do 2 người bấm cùng lúc → thử lại 1 lần. */
export async function themLanLoi(code: string, input: { mo_ta: string; xu_ly?: string; ngay?: string | null }): Promise<KQ> {
  const user = await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const sach = lamSachLanLoi(input ?? {})
  if (!sach.ok) return sach
  const n = kiemNgay(input?.ngay, ngayVNHomNay())
  if (!n.ok) return n
  const db = dataClient()
  for (let thu = 0; thu < 2; thu++) {
    const { data: ds, error: e0 } = await db.from('ticket_lan_loi').select('lan').eq('ticket_code', code)
    if (e0) return { ok: false, error: thongBaoLoiDb(e0, 'themLanLoi.doc') }
    const lan = lanTiepTheo((ds ?? []) as { lan: number }[])
    const { error } = await db.from('ticket_lan_loi').insert({ ticket_code: code, lan, ...sach.row, ...(n.ngay ? { ngay: n.ngay } : {}), tao_boi: user.email ?? null })
    if (!error) {
      await ghiAudit('them_lan_loi', `ticket:${code}`, { lan })
      revalidatePath(`/ticket/${code}`)
      return { ok: true }
    }
    if (error.code !== '23505') return { ok: false, error: thongBaoLoiDb(error, 'themLanLoi') }
  }
  return { ok: false, error: 'Có người vừa thêm lần lỗi khác, bấm Lưu lại.' }
}

export async function suaLanLoi(id: string, code: string, input: { mo_ta: string; xu_ly?: string; ngay?: string | null }): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: LOI_ID }
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const sach = lamSachLanLoi(input ?? {})
  if (!sach.ok) return sach
  const n = kiemNgay(input?.ngay, ngayVNHomNay())
  if (!n.ok) return n
  // `ngay` chỉ ghi khi form có gửi (undefined = không đổi; '' = bỏ ngày, quay về ngày tạo).
  const row = input?.ngay === undefined ? sach.row : { ...sach.row, ngay: n.ngay }
  const { data, error } = await dataClient().from('ticket_lan_loi').update(row)
    .eq('id', id).eq('ticket_code', code).select('id')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'suaLanLoi') }
  if (!data?.length) return { ok: false, error: 'Không thấy lần lỗi này (có thể đã bị xoá).' }
  revalidatePath(`/ticket/${code}`)
  return { ok: true }
}

export async function xoaLanLoi(id: string, code: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: LOI_ID }
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const { error } = await dataClient().from('ticket_lan_loi').delete().eq('id', id).eq('ticket_code', code)
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'xoaLanLoi') }
  await ghiAudit('xoa_lan_loi', `ticket:${code}`, { id })
  revalidatePath(`/ticket/${code}`)
  return { ok: true }
}
