'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import type { KQ } from '@/lib/loi/ganDongMayServer'
import { laUuid, maTicketHopLe, thongBaoLoiDb } from '@/lib/loi/kiemDauVao'
import {
  KHO_TEP, SO_TEP_TOI_DA, duongDanTep, kiemTep, thuocTicket, type TepNhatKy, type TepVao,
} from '@/lib/loi/tepNhatKy'

const LOI_MA = 'Mã ticket không hợp lệ.'
const HAN_XEM = 3600

export type LinkTaiLen = { duong_dan: string; token: string }
export type TepDaTai = TepVao & { duong_dan: string }

/** Cấp signed upload URL cho từng file (trình duyệt tải thẳng lên kho, không qua server app). */
export async function capLinkTaiLen(code: string, teps: TepVao[]): Promise<KQ<{ links: LinkTaiLen[] }>> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  if (!Array.isArray(teps) || !teps.length) return { ok: false, error: 'Chưa chọn file.' }
  if (teps.length > SO_TEP_TOI_DA) return { ok: false, error: `Tối đa ${SO_TEP_TOI_DA} file mỗi lần.` }
  for (const t of teps) { const k = kiemTep(t); if (!k.ok) return k }
  const kho = dataClient().storage.from(KHO_TEP)
  const links: LinkTaiLen[] = []
  for (const t of teps) {
    const duong_dan = duongDanTep(code, randomUUID(), t.ten)
    const { data, error } = await kho.createSignedUploadUrl(duong_dan)
    if (error || !data) { console.error('[tep-actions] capLinkTaiLen', error?.message); return { ok: false, error: 'Không tạo được chỗ tải file. Thử lại.' } }
    links.push({ duong_dan, token: data.token })
  }
  return { ok: true, links }
}

/**
 * Thêm một dòng nhật ký kèm file đã tải xong. Nội dung có thể trống nếu có file.
 * Kiểm lại từng file: đúng thư mục ticket + đã thật sự nằm trong kho.
 */
export async function themNhatKyKemTep(code: string, noiDung: string, khi: string | undefined, teps: TepDaTai[]): Promise<KQ> {
  const user = await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const text = (noiDung ?? '').trim()
  const ds = Array.isArray(teps) ? teps : []
  if (!text && !ds.length) return { ok: false, error: 'Nhập nội dung hoặc đính kèm file.' }
  if (ds.length > SO_TEP_TOI_DA) return { ok: false, error: `Tối đa ${SO_TEP_TOI_DA} file mỗi lần.` }
  const db = dataClient()
  const kho = db.storage.from(KHO_TEP)
  for (const t of ds) {
    const k = kiemTep(t); if (!k.ok) return k
    if (typeof t.duong_dan !== 'string' || !thuocTicket(t.duong_dan, code)) return { ok: false, error: 'File không thuộc ticket này.' }
    const { data: co } = await kho.exists(t.duong_dan)
    if (!co) return { ok: false, error: `"${t.ten}" chưa tải lên xong. Thử lại.` }
  }
  const row: Record<string, unknown> = { ticket_code: code, noi_dung: text || '(đính kèm file)', tac_gia: user.email ?? null }
  if (khi && khi.trim()) row.created_at = new Date(khi).toISOString()
  const { data: note, error } = await db.from('ticket_note').insert(row).select('id').single()
  if (error || !note) return { ok: false, error: thongBaoLoiDb(error, 'themNhatKyKemTep.note') }
  if (ds.length) {
    const { error: e2 } = await db.from('ticket_note_tep').insert(ds.map((t) => ({
      note_id: (note as { id: string }).id, ticket_code: code, duong_dan: t.duong_dan,
      ten: t.ten.trim().slice(0, 200), loai: t.loai, kich_thuoc: t.kich_thuoc, tao_boi: user.email ?? null,
    })))
    if (e2) {
      await db.from('ticket_note').delete().eq('id', (note as { id: string }).id)
      return { ok: false, error: thongBaoLoiDb(e2, 'themNhatKyKemTep.tep') }
    }
    await ghiAudit('them_tep_nhat_ky', `ticket:${code}`, { so_tep: ds.length })
  }
  revalidatePath(`/ticket/${code}`)
  return { ok: true }
}

/** File của mọi dòng nhật ký trong ticket, kèm signed URL xem trong 1 giờ. */
export async function listTepNhatKy(code: string): Promise<TepNhatKy[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!maTicketHopLe(code)) return []
  const db = dataClient()
  const { data, error } = await db.from('ticket_note_tep')
    .select('id, note_id, duong_dan, ten, loai, kich_thuoc').eq('ticket_code', code).order('created_at')
  if (error) throw new Error(thongBaoLoiDb(error, 'listTepNhatKy'))
  const rows = (data ?? []) as (Omit<TepNhatKy, 'url'> & { duong_dan: string })[]
  if (!rows.length) return []
  const { data: urls } = await db.storage.from(KHO_TEP).createSignedUrls(rows.map((r) => r.duong_dan), HAN_XEM)
  const theoDuong = new Map((urls ?? []).map((u) => [u.path, u.signedUrl]))
  return rows.map(({ duong_dan, ...r }) => ({ ...r, url: theoDuong.get(duong_dan) ?? null }))
}

/** Bỏ 1 file khỏi nhật ký (xoá cả object trong kho). */
export async function xoaTepNhatKy(id: string, code: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(id)) return { ok: false, error: 'Mã file không hợp lệ.' }
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const db = dataClient()
  const { data, error } = await db.from('ticket_note_tep').delete().eq('id', id).eq('ticket_code', code).select('duong_dan')
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'xoaTepNhatKy') }
  const paths = ((data ?? []) as { duong_dan: string }[]).map((r) => r.duong_dan)
  if (paths.length) await db.storage.from(KHO_TEP).remove(paths)
  await ghiAudit('xoa_tep_nhat_ky', `ticket:${code}`, { id })
  revalidatePath(`/ticket/${code}`)
  return { ok: true }
}

/** Gọi TRƯỚC khi xoá một dòng nhật ký: dọn object trong kho (dòng DB tự xoá theo cascade). */
export async function donTepCuaNote(noteId: string, code: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  if (!laUuid(noteId)) return { ok: false, error: 'Mã ghi chú không hợp lệ.' }
  if (!maTicketHopLe(code)) return { ok: false, error: LOI_MA }
  const db = dataClient()
  const { data, error } = await db.from('ticket_note_tep').select('duong_dan').eq('note_id', noteId).eq('ticket_code', code)
  if (error) return { ok: false, error: thongBaoLoiDb(error, 'donTepCuaNote') }
  const paths = ((data ?? []) as { duong_dan: string }[]).map((r) => r.duong_dan)
  if (paths.length) await db.storage.from(KHO_TEP).remove(paths)
  return { ok: true }
}
