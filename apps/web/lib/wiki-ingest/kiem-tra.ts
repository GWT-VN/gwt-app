/**
 * Kiểm tra thân POST /api/wiki-ingest + quét PII — hàm thuần, không phụ thuộc Next/Supabase.
 * Không thêm dependency (zod) theo Global Constraints của plan; validate tay nhưng chặt:
 * routine là bên ngoài, mọi thứ nó gửi chỉ là "gợi ý" trừ nội dung Q&A.
 */

export const KHU_HOP_LE = ['cong-viec-chung', 'sales', 'cskh', 'van-hanh', 'tai-chinh', 'kien-thuc-nen', 'san-pham'] as const
export type Khu = (typeof KHU_HOP_LE)[number]

export type ItemIngest = {
  message_id: string
  thread_id: string | null
  cau_hoi: string
  tra_loi: string
  nguoi_tra_loi: string | null
  tra_loi_luc: string | null
  jump_link: string
  nguon_ids: string[]
  khu_goi_y: Khu | null
  do_tin_cay: number | null
}
export type ThanIngest = { kenh_id: string; watermark_moi: string | null; items: ItemIngest[] }

export const TOI_DA_ITEM = 200
const TOI_DA_CHU = 8000
const SNOWFLAKE = /^\d{15,22}$/          // id Discord (snowflake)
const DISCORD_LINK = /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/

const chuoi = (v: unknown): string | null => (typeof v === 'string' ? v.trim() : null)
const chuoiTuyChon = (v: unknown): string | null => (v == null ? null : chuoi(v))

function kiemTraItem(x: unknown, i: number): { ok: true; item: ItemIngest } | { ok: false; loi: string } {
  if (!x || typeof x !== 'object') return { ok: false, loi: `items[${i}] không phải object` }
  const o = x as Record<string, unknown>
  const message_id = chuoi(o.message_id)
  if (!message_id || !SNOWFLAKE.test(message_id)) return { ok: false, loi: `items[${i}].message_id sai dạng` }
  const cau_hoi = chuoi(o.cau_hoi), tra_loi = chuoi(o.tra_loi)
  if (!cau_hoi) return { ok: false, loi: `items[${i}].cau_hoi trống` }
  if (!tra_loi) return { ok: false, loi: `items[${i}].tra_loi trống` }
  if (cau_hoi.length > TOI_DA_CHU || tra_loi.length > TOI_DA_CHU) return { ok: false, loi: `items[${i}] quá ${TOI_DA_CHU} ký tự` }
  const jump_link = chuoi(o.jump_link)
  if (!jump_link || !DISCORD_LINK.test(jump_link)) return { ok: false, loi: `items[${i}].jump_link phải là link tin Discord` }
  const thread_id = chuoiTuyChon(o.thread_id)
  if (thread_id && !SNOWFLAKE.test(thread_id)) return { ok: false, loi: `items[${i}].thread_id sai dạng` }
  const nguon_ids = Array.isArray(o.nguon_ids) ? o.nguon_ids.filter((v): v is string => typeof v === 'string' && SNOWFLAKE.test(v)) : []
  const khuTho = chuoiTuyChon(o.khu_goi_y)
  const khu_goi_y = khuTho && (KHU_HOP_LE as readonly string[]).includes(khuTho) ? (khuTho as Khu) : null
  const tc = o.do_tin_cay
  const do_tin_cay = typeof tc === 'number' && Number.isFinite(tc) && tc >= 0 && tc <= 1 ? Math.round(tc * 100) / 100 : null
  const luc = chuoiTuyChon(o.tra_loi_luc)
  const tra_loi_luc = luc && !Number.isNaN(Date.parse(luc)) ? luc : null
  return { ok: true, item: { message_id, thread_id: thread_id || null, cau_hoi, tra_loi, nguoi_tra_loi: chuoiTuyChon(o.nguoi_tra_loi) || null, tra_loi_luc, jump_link, nguon_ids, khu_goi_y, do_tin_cay } }
}

export function kiemTraThan(x: unknown): { ok: true; than: ThanIngest } | { ok: false; loi: string } {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return { ok: false, loi: 'Thân phải là object JSON' }
  const o = x as Record<string, unknown>
  const kenh_id = chuoi(o.kenh_id)
  if (!kenh_id || !SNOWFLAKE.test(kenh_id)) return { ok: false, loi: 'kenh_id phải là id kênh Discord' }
  const wm = chuoiTuyChon(o.watermark_moi)
  if (wm && !SNOWFLAKE.test(wm)) return { ok: false, loi: 'watermark_moi sai dạng' }
  if (!Array.isArray(o.items)) return { ok: false, loi: 'items phải là mảng' }
  if (o.items.length > TOI_DA_ITEM) return { ok: false, loi: `Tối đa ${TOI_DA_ITEM} item một lô` }
  const items: ItemIngest[] = []
  for (let i = 0; i < o.items.length; i++) {
    const kq = kiemTraItem(o.items[i], i)
    if (!kq.ok) return kq
    items.push(kq.item)
  }
  return { ok: true, than: { kenh_id, watermark_moi: wm || null, items } }
}

/**
 * Quét PII còn sót sau khi routine đã che: SĐT VN (10 số bắt đầu 03/05/07/08/09, cho phép
 * dấu cách/chấm ở giữa), dạng +84/84, email. Cùng mẫu với tools/scripts/scan_pii_secrets.py
 * (chỉ có SĐT) + thêm email. Dải giả 0900000xxx của script quét được bỏ qua giống nhau.
 * Tên riêng KHÔNG bắt được bằng máy — giao người duyệt tick "đã rà PII".
 */
const MAU_SDT = /(?<![\d.])(?:\+?84|0)[35789](?:[ .]?\d){8}(?![\d.])/g
const MAU_EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g
const DAI_GIA = /^0900000\d{3}$/

export function timPii(s: string): string[] {
  const ra: string[] = []
  for (const m of s.matchAll(MAU_SDT)) {
    const so = m[0]
    if (DAI_GIA.test(so.replace(/[ .]/g, ''))) continue
    ra.push(so)
  }
  for (const m of s.matchAll(MAU_EMAIL)) ra.push(m[0])
  return ra
}
