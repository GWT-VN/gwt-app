import type { DongTho } from '../doc-file/nexia'
import { khoaDong, khoaTuNhien } from '../chuan-hoa'

/**
 * Gán line_key cho từng dòng của 1 tab (vào/ra) trong 1 lần upload NEXIA.
 *
 * File NEXIA thật có thể liệt kê CÙNG một khoá tự nhiên (ký hiệu + số hoá đơn + tên hàng chuẩn
 * hoá + thành tiền làm tròn) nhiều lần trong CÙNG một hoá đơn — vd hoá đơn nhà hàng liệt kê 1
 * món ăn 4 lần (4 lượt gọi món khác nhau nhưng NEXIA xuất ra 4 dòng giống hệt). Nếu không phân
 * biệt, các dòng này sinh CÙNG line_key → vi phạm unique (period_id, line_key) ngay trong 1 lô
 * insert (đo được trên file T8 thật: 415 dòng chỉ có 387 khoá tự nhiên, 12 nhóm trùng).
 *
 * Đếm số lần xuất hiện của khoá tự nhiên theo thứ tự `rowOrder` (lan = 0, 1, 2…) rồi đưa vào
 * `khoaDong()` để mỗi lần xuất hiện có 1 line_key riêng — vẫn ỔN ĐỊNH khi upload lại đúng file đó
 * (cùng thứ tự dòng → cùng lan → cùng key, engine_dong_nhap coi là "đã có, cập nhật raw").
 */
export function ganKhoaDong(dongs: DongTho[], direction: 'vao' | 'ra'): string[] {
  const dem = new Map<string, number>()
  const theoRowOrder = [...dongs].sort((a, b) => a.rowOrder - b.rowOrder)
  const khoaTheoRowOrder = new Map<number, string>()
  for (const d of theoRowOrder) {
    const t = d.truong
    const kTuNhien = khoaTuNhien(direction, t.kyHieu, t.soHd, t.tenHang, t.thanhTien)
    const lan = dem.get(kTuNhien) ?? 0
    dem.set(kTuNhien, lan + 1)
    khoaTheoRowOrder.set(d.rowOrder, khoaDong(direction, t.kyHieu, t.soHd, t.tenHang, t.thanhTien, lan))
  }
  return dongs.map((d) => khoaTheoRowOrder.get(d.rowOrder)!)
}
