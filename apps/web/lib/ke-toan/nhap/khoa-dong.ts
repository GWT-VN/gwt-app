import type { DongTho } from '../doc-file/nexia'
import { khoaDong, khoaTuNhien } from '../chuan-hoa'

/**
 * Đếm số lần xuất hiện (`lan` = 0, 1, 2…) của cùng 1 khoá TỰ NHIÊN theo thứ tự `rowOrder`, rồi
 * đưa `lan` vào hàm băm `khoa()` để mỗi lần xuất hiện có 1 khoá riêng — vẫn ỔN ĐỊNH khi chạy lại
 * trên đúng cùng danh sách (cùng thứ tự → cùng lan → cùng khoá). Dùng chung cho `ganKhoaDong`
 * (hoá đơn NEXIA) và `ganKhoaSaoKe` (dòng sao kê ngân hàng) — cùng 1 vấn đề: nguồn có thể liệt kê
 * nhiều dòng giống hệt nhau theo khoá tự nhiên (không có ID riêng), cần khoá tách bạch để insert.
 */
export function ganKhoaTheoLan<T>(
  items: T[],
  rowOrder: (t: T) => number,
  khoaTuNhienCua: (t: T) => string,
  khoa: (t: T, lan: number) => string,
): string[] {
  const dem = new Map<string, number>()
  const theoRowOrder = [...items].sort((a, b) => rowOrder(a) - rowOrder(b))
  const khoaTheoRowOrder = new Map<number, string>()
  for (const item of theoRowOrder) {
    const kTuNhien = khoaTuNhienCua(item)
    const lan = dem.get(kTuNhien) ?? 0
    dem.set(kTuNhien, lan + 1)
    khoaTheoRowOrder.set(rowOrder(item), khoa(item, lan))
  }
  return items.map((item) => khoaTheoRowOrder.get(rowOrder(item))!)
}

/**
 * Gán line_key cho từng dòng của 1 tab (vào/ra) trong 1 lần upload NEXIA.
 *
 * File NEXIA thật có thể liệt kê CÙNG một khoá tự nhiên (ký hiệu + số hoá đơn + tên hàng chuẩn
 * hoá + thành tiền làm tròn) nhiều lần trong CÙNG một hoá đơn — vd hoá đơn nhà hàng liệt kê 1
 * món ăn 4 lần (4 lượt gọi món khác nhau nhưng NEXIA xuất ra 4 dòng giống hệt). Nếu không phân
 * biệt, các dòng này sinh CÙNG line_key → vi phạm unique (period_id, line_key) ngay trong 1 lô
 * insert (đo được trên file T8 thật: 415 dòng chỉ có 387 khoá tự nhiên, 12 nhóm trùng).
 */
export function ganKhoaDong(dongs: DongTho[], direction: 'vao' | 'ra'): string[] {
  return ganKhoaTheoLan(
    dongs,
    (d) => d.rowOrder,
    (d) => khoaTuNhien(direction, d.truong.kyHieu, d.truong.soHd, d.truong.tenHang, d.truong.thanhTien),
    (d, lan) => khoaDong(direction, d.truong.kyHieu, d.truong.soHd, d.truong.tenHang, d.truong.thanhTien, lan),
  )
}
