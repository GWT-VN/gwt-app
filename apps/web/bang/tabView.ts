/**
 * Hàm thuần cho hàng tab của bảng danh sách (tab cố định = bộ lọc chọn sẵn; tab tự tạo = bộ lọc + cột đã lưu).
 * Không React, không DB — server action (kiểm query hợp lệ) và client (so "tab đã đổi chưa") cùng dùng.
 */

/** Tham số cột (thứ tự / độ rộng / ẩn / định dạng ngày) — tab tự tạo lưu cả phần này. */
export const KHOA_COT = ['cot_thu_tu', 'cot_rong', 'cot_an', 'cot_ngay']

/** Chuẩn hoá query của các khoá cho trước (bỏ rỗng, sắp theo khoá) — so "tab đã đổi chưa" và lưu tab. */
export function locCua(sp: URLSearchParams, khoa: string[]): string {
  const p = new URLSearchParams()
  for (const k of [...khoa].sort()) {
    const v = sp.get(k)
    if (v) p.set(k, v)
  }
  return p.toString()
}

/** URL khi bấm tab: giữ tham số không thuộc `bo` (dạng xem, variant…), thay bằng `loc` của tab; `view` = tab cố định. */
export function queryTab(sp: URLSearchParams, loc: string, view: string | null, bo: string[]): string {
  const p = new URLSearchParams(sp.toString())
  for (const k of [...bo, 'view', 'tab', 'xem', 'xem_tab', 'trang']) p.delete(k)
  for (const [k, v] of new URLSearchParams(loc)) p.set(k, v)
  if (view) p.set('view', view)
  return p.toString()
}
