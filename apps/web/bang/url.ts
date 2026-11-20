import type { ThamSoLoc } from './kieu'

/**
 * Link bỏ RIÊNG các tham số `bo` (vd một điều kiện lọc — `href` của chip trong ThanhDangLoc), giữ mọi tham số khác
 * (kể cả cột/chiều đang sắp), luôn bỏ `trang` (đổi lọc → về trang 1). Hàm thuần: gọi được ở Server Component.
 *
 *   hrefBoLoc('/ticket', { q, loai, cot, chieu }, 'loai')     // bỏ "Loại"
 *   hrefBoLoc('/ticket', searchParams, 'ngtu', 'ngden')       // bỏ lọc ngày (hai tham số)
 */
export function hrefBoLoc(duongDan: string, thamSo: ThamSoLoc | URLSearchParams, ...bo: string[]): string {
  const p = new URLSearchParams()
  const cap = thamSo instanceof URLSearchParams ? [...thamSo] : Object.entries(thamSo)
  for (const [k, v] of cap) if (v && k !== 'trang' && !bo.includes(k)) p.append(k, v)
  const qs = p.toString()
  return qs ? `${duongDan}?${qs}` : duongDan
}
