/**
 * Số nguyên kiểu vi-VN cho ô tiền (OTien, components/ui/input-affix.tsx).
 * Khác `lib/so.ts` (`docSo` ở đó đọc số THẬP PHÂN cho ô chỉ tiêu nước, trả lỗi khi gõ sai): ở đây ô chỉ nhận chữ số,
 * mọi ký tự khác bị bỏ (dán "1.250.000 ₫" vẫn ra 1250000). `fmtVnd` của app/sales/_ui.tsx cùng Intl, chưa dời (chờ duyệt).
 */
const VI = new Intl.NumberFormat('vi-VN')

/** 1250000 → "1.250.000". */
export function dinhDangSo(n: number): string {
  return VI.format(n)
}

/** Bỏ mọi ký tự không phải chữ số; không còn chữ số nào → null (ô trống ≠ 0). */
export function docSo(s: string): number | null {
  const so = s.replace(/\D/g, '')
  return so ? Number(so) : null
}
