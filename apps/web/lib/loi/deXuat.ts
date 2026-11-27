/**
 * Lỗi mới do CSKH đề xuất từ ô Lỗi của ticket (CEO 27/11, phương án A — docs/rework/2026-11-27-ticket-nhieu-may-loi-moi.md).
 * HÀM THUẦN (test được): chống trùng theo tên bỏ dấu + sinh mã `DX-<SLUG>` hợp `MA_LOI`.
 */
import { boDau } from '@/bang/timkiem'
import { MA_LOI } from './kiemDauVao'

const chuan = (s: string) => boDau(s).toLowerCase().replace(/\s+/g, ' ').trim()

/** Lỗi (chưa ngừng) cùng tên — không phân biệt dấu / hoa thường / khoảng trắng. */
export function timTrungTen<T extends { ten: string; trang_thai: string }>(ten: string, ds: T[]): T | undefined {
  const k = chuan(ten)
  return ds.find((d) => d.trang_thai !== 'ngung' && chuan(d.ten) === k)
}

/** Mã mới `DX-<SLUG>` (A–Z 0–9 -, ≤ 40), thêm `-2`, `-3`… khi trùng mã có sẵn. */
export function maDeXuat(ten: string, coSan: Iterable<string>): string {
  const co = new Set(coSan)
  const slug = boDau(ten).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 34).replace(/-+$/, '') || 'LOI'
  let ma = `DX-${slug}`
  for (let i = 2; co.has(ma); i++) ma = `DX-${slug.slice(0, 33 - String(i).length)}-${i}`
  if (!MA_LOI.test(ma)) throw new Error(`Mã đề xuất sai dạng: ${ma}`)
  return ma
}
