/**
 * Xuống cấp êm khi phần "danh mục lỗi / dòng máy" chưa sẵn sàng (migration chưa áp, view lỗi…):
 * trang ticket / Tổng quan / xuất CSV vẫn chạy như trước, chỉ thiếu phần mới. Chi tiết lỗi chỉ log server.
 * KHÔNG nuốt redirect/notFound của Next (doQuyen đá về trang chủ bằng cách ném NEXT_REDIRECT).
 */
import { unstable_rethrow } from 'next/navigation'
import { tomTatMayTicket } from './dongMay'
import type { DongMay } from './kieu'

export const THIEU_DANH_MUC = 'Chưa tải được danh mục lỗi — tạm hiển thị không có phân loại lỗi. Báo kỹ thuật nếu kéo dài.'
export const THIEU_DONG_MAY = 'Chưa tải được dòng máy của ticket này — báo kỹ thuật nếu kéo dài.'

export async function docAnToan<T>(ngCanh: string, fn: () => Promise<T>, macDinh: T): Promise<{ data: T; loi: boolean }> {
  try {
    return { data: await fn(), loi: false }
  } catch (e) {
    unstable_rethrow(e)
    console.error(`[loi/anToan] ${ngCanh} lỗi — hiển thị không có phần danh mục lỗi / dòng máy`, e)
    return { data: macDinh, loi: true }
  }
}

type TomTat = ReturnType<typeof tomTatMayTicket>

/** Gắn `dong_may` (cột Máy) cho các dòng ticket; đọc lỗi thì trả nguyên dòng (bảng hiện cột Máy kiểu cũ). */
export async function kemDongMayAnToan<R extends { ticket_code: string }>(
  rows: R[], doc: (codes: string[]) => Promise<Record<string, DongMay[]>>,
): Promise<(R & { dong_may?: TomTat })[]> {
  if (!rows.length) return rows
  const { data, loi } = await docAnToan('dongMayTheoTickets', () => doc(rows.map((r) => r.ticket_code)), null)
  if (loi || !data) return rows
  return rows.map((r) => ({ ...r, dong_may: tomTatMayTicket(data[r.ticket_code] ?? []) }))
}
