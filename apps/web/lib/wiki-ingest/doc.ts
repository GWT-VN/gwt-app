import 'server-only'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheDuyetWiki } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'

/**
 * Đọc dữ liệu wiki-ingest cho MỌI nhân sự (Server Component): trang Hỏi–đáp theo khu + badge
 * sidebar. Gác requireNhanSu() rồi mới dataClient(); email lấy từ session. Không phải Server
 * Action (không 'use server') — chỉ gọi từ server code.
 */
export type HoiDap = { id: number; question: string; answer: string; answered_by: string | null; answered_at: string | null; jump_link: string; khu: string; reviewed_at: string | null }

async function emailNhanSu(): Promise<string> {
  const u = await requireNhanSu()
  return chuanHoaEmail(u.email)
}

/** Q&A đã duyệt của một khu, mới nhất trước. */
export async function hoiDapCuaKhu(khu: string): Promise<HoiDap[]> {
  const p_email = await emailNhanSu()
  const { data, error } = await dataClient().rpc('wiki_hoi_dap', { p_email, p_khu: khu })
  if (error) throw new Error(error.message)
  return (data as HoiDap[] | null) ?? []
}

/** Số đề xuất chờ duyệt — null khi người đang xem không có quyền duyệt (sidebar không hiện badge). */
export async function demDeXuatPending(): Promise<number | null> {
  const p_email = await emailNhanSu()
  if (!(await coTheDuyetWiki())) return null
  const { data, error } = await dataClient().rpc('wiki_de_xuat_dem', { p_email })
  if (error) return null
  return (data as { pending?: number } | null)?.pending ?? 0
}
