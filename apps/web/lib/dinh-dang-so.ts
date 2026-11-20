/**
 * Số nguyên kiểu vi-VN cho ô tiền (OTien, components/ui/input-affix.tsx).
 * Khác `lib/so.ts` (`docSo` ở đó đọc số THẬP PHÂN cho ô chỉ tiêu nước, trả lỗi khi gõ sai): ở đây kết quả luôn là số
 * nguyên VND không âm. `fmtVnd` của app/sales/_ui.tsx cùng Intl, chưa dời (chờ duyệt).
 */
const VI = new Intl.NumberFormat('vi-VN')

/** 1250000 → "1.250.000". */
export function dinhDangSo(n: number): string {
  return VI.format(n)
}

/**
 * Đọc chuỗi DÁN vào ô tiền (từ Excel, sao kê, tin nhắn) → số nguyên VND; không có chữ số nào → null (ô trống ≠ 0).
 * - Bỏ mọi ký tự ngoài chữ số và dấu `.`/`,` ("1.250.000 ₫" → 1250000). Dấu âm cũng bị bỏ ("-500.000" → 500000).
 * - Cuối chuỗi là `.` hoặc `,` kèm ĐÚNG 1–2 chữ số → phần lẻ, làm tròn về số nguyên ("1.250.000,50" → 1250001,
 *   "1,250,000.00" → 1250000, "12,5" → 13). Đúng 3 chữ số sau dấu → phân cách hàng nghìn ("12.500" → 12500).
 * Chỉ dùng cho chuỗi dán nguyên khối: lúc GÕ, xoá một chữ số của "1.250.000" ra "1.250.00" — đọc theo luật trên là sai,
 * nên OTien đọc phím gõ bằng cách chỉ lấy chữ số.
 */
export function docSo(s: string): number | null {
  const t = s.replace(/[^\d.,]/g, '')
  const m = /^(.*)[.,](\d{1,2})$/.exec(t)
  const nguyen = (m ? m[1] : t).replace(/\D/g, '')
  if (!nguyen && !m) return null
  return Math.round(Number(`${nguyen || '0'}.${m ? m[2] : '0'}`))
}
