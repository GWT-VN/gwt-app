'use server'

/**
 * Server actions màn duyệt đề xuất Q&A (spec wiki-training-ingest §6). Khuôn khu Kế toán:
 * chanDuyetWiki() (nền tảng + vai admin|ceo) → dataClient() → RPC public.wiki_*. Email lấy từ
 * session — KHÔNG nhận email từ client. Hàm nào có `try {` phải gác TRƯỚC try (không nuốt redirect).
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheDuyetWiki } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { KHU_HOP_LE } from '@/lib/wiki-ingest/kiem-tra'

export type TrangThai = 'pending' | 'approved' | 'rejected'
export type DeXuatRow = {
  id: number; channel_id: string; message_id: string; thread_id: string | null
  question: string; answer: string; answered_by: string | null; answered_at: string | null; jump_link: string
  source_ids: string[]; khu_goi_y: string | null; khu: string; confidence: number | null; can_pkb: boolean
  status: TrangThai; pii_checked: boolean; reviewed_by: string | null; reviewed_by_email: string | null
  reviewed_at: string | null; reject_reason: string | null; created_at: string; updated_at: string
}
export type LanQuetRow = { channel_id: string; last_message_id: string; updated_at: string; run: { received: number; inserted: number; skipped: number; rejected: number; at: string } | null }
export type KetQuaHanhDong = { ok: true; hanhDong: string } | { ok: false; error: string }

async function chanDuyetWiki(): Promise<string> {
  const u = await requireNhanSu()
  if (!(await coTheDuyetWiki())) redirect('/wiki?loi=khong_du_quyen')
  return chuanHoaEmail(u.email)
}

async function goi<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await dataClient().rpc(fn, { p_email: await chanDuyetWiki(), ...args })
  if (error) throw new Error(error.message)
  return data as T
}

export async function danhSachDeXuat(status: TrangThai): Promise<DeXuatRow[]> {
  return (await goi<DeXuatRow[]>('wiki_de_xuat_list', { p_status: status })) ?? []
}

export async function lanQuet(): Promise<LanQuetRow[]> {
  return (await goi<LanQuetRow[]>('wiki_lan_quet', {})) ?? []
}

/**
 * Một action cho cả ba nút của một dòng (sửa / duyệt / từ chối) — form gửi `hanh_dong`.
 * Duyệt = lưu sửa trước rồi mới duyệt, để người duyệt không phải bấm Lưu riêng.
 */
export async function hanhDongDeXuat(_prev: unknown, form: FormData): Promise<KetQuaHanhDong> {
  const email = await chanDuyetWiki()
  const id = Number(form.get('id'))
  const hanhDong = String(form.get('hanh_dong') ?? '')
  const khu = String(form.get('khu') ?? '')
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Thiếu id' }
  if (!(KHU_HOP_LE as readonly string[]).includes(khu)) return { ok: false, error: 'Khu không hợp lệ' }
  try {
    if (hanhDong === 'sua' || hanhDong === 'duyet') {
      await goi('wiki_de_xuat_sua', {
        p_id: id, p_question: String(form.get('question') ?? ''), p_answer: String(form.get('answer') ?? ''),
        p_khu: khu, p_pii_checked: form.get('pii_checked') === 'on',
      })
    }
    if (hanhDong === 'duyet') await goi('wiki_de_xuat_duyet', { p_id: id })
    else if (hanhDong === 'tu_choi') await goi('wiki_de_xuat_tu_choi', { p_id: id, p_ly_do: String(form.get('ly_do') ?? '') })
    else if (hanhDong !== 'sua') return { ok: false, error: 'Hành động không hợp lệ' }
    await ghiAudit(`wiki.de_xuat_${hanhDong}`, String(id), { khu, by: email })
    revalidatePath('/wiki/de-xuat'); revalidatePath(`/wiki/${khu}/hoi-dap`); revalidatePath('/wiki', 'layout')
    return { ok: true, hanhDong }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
