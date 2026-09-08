/**
 * Logic thuần của endpoint /api/wiki-ingest — tách khỏi Route Handler để test bằng rpc giả.
 * Route chỉ làm: đọc env, kiểm bearer, parse JSON, gọi hai hàm này với dataClient().rpc.
 */
import { timingSafeEqual } from 'node:crypto'
import { timPii, type ThanIngest } from './kiem-tra'

export type Rpc = (fn: string, args: Record<string, unknown>) => Promise<unknown>
export type KetQuaIngest = { them: number; bo_qua_trung: number; tu_choi_pii: string[] }

/** So bearer bằng timingSafeEqual; thiếu env → 'thieu_env' để route trả 503 (không 401 gây hiểu nhầm sai secret). */
export function kiemBearer(header: string | null, secret: string | undefined): 'ok' | 'thieu_env' | 'sai' {
  if (!secret) return 'thieu_env'
  const m = /^Bearer\s+(.+)$/i.exec(header ?? '')
  if (!m) return 'sai'
  const a = Buffer.from(m[1].trim()), b = Buffer.from(secret)
  if (a.length !== b.length) return 'sai'
  return timingSafeEqual(a, b) ? 'ok' : 'sai'
}

/**
 * Item còn PII (SĐT/email) → loại, KHÔNG lưu, trả message_id để routine biết. Watermark chỉ dời
 * sau khi lô đã vào (Q2): lỗi ở wiki_ingest_nhan thì ném ra, watermark giữ nguyên, lần sau quét lại.
 */
export async function xuLyIngest(than: ThanIngest, rpc: Rpc): Promise<KetQuaIngest> {
  const sach = than.items.filter((it) => timPii(`${it.cau_hoi}\n${it.tra_loi}`).length === 0)
  const tu_choi_pii = than.items.filter((it) => !sach.includes(it)).map((it) => it.message_id)
  let them = 0, bo_qua_trung = 0
  if (sach.length) {
    const r = (await rpc('wiki_ingest_nhan', { p_kenh_id: than.kenh_id, p_items: sach })) as { them?: number; bo_qua?: number } | null
    them = r?.them ?? 0; bo_qua_trung = r?.bo_qua ?? 0
  }
  if (than.watermark_moi) await rpc('wiki_watermark_set', { p_kenh_id: than.kenh_id, p_message_id: than.watermark_moi })
  await rpc('wiki_ingest_run_ghi', { p_kenh_id: than.kenh_id, p_received: than.items.length, p_inserted: them, p_skipped: bo_qua_trung, p_rejected: tu_choi_pii.length })
  return { them, bo_qua_trung, tu_choi_pii }
}
