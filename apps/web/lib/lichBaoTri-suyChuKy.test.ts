/**
 * Suy chu kỳ cho lượt bảo trì MỒ CÔI (không gắn plan).
 *
 * Vì sao có file này: 309/471 lượt trên prod (24/08/2026) không có `plan_id`, nên
 * `tinhDoiLichSau()` bản cũ trả về rỗng và màn hình báo "các lượt sau đã đúng ngày,
 * không cần dời" — CEO bắt được đúng ca này ở hồ sơ Mr.Nứa.
 */
import { describe, expect, it } from 'vitest'
import { sinhLichBaoTri, suyChuKyTuMoc } from './lichBaoTri'

describe('suyChuKyTuMoc', () => {
  it('ca CEO nêu — Mr.Nứa: chuỗi thật có vài lượt trễ vẫn ra chu kỳ 3 tháng', () => {
    expect(suyChuKyTuMoc([
      '2025-04-21', '2025-07-14', '2025-10-14', '2026-01-16',
      '2026-05-29', '2026-08-29', '2026-11-29', '2027-03-29',
    ])).toBe(3)
  })

  it('chuỗi đều: 1 · 2 · 6 tháng', () => {
    expect(suyChuKyTuMoc(['2026-01-10', '2026-02-10', '2026-03-10'])).toBe(1)
    expect(suyChuKyTuMoc(['2026-01-10', '2026-03-10', '2026-05-10'])).toBe(2)
    expect(suyChuKyTuMoc(['2026-01-10', '2026-07-10', '2027-01-10'])).toBe(6)
  })

  it('một lượt trễ RẤT xa không kéo được kết quả — khác hẳn lấy trung bình', () => {
    // Trung bình của chuỗi này là 5,25 tháng; số hay gặp vẫn là 3.
    expect(suyChuKyTuMoc(['2026-01-10', '2026-04-10', '2026-07-10', '2026-10-10', '2028-01-10'])).toBe(3)
  })

  it('hoà phiếu thì lấy chu kỳ NGẮN hơn — hẹn sớm rồi dời ra dễ hơn hẹn muộn', () => {
    expect(suyChuKyTuMoc(['2026-01-10', '2026-04-10', '2026-08-10'])).toBe(3)
  })

  it('không đủ dữ liệu -> null, để chỗ gọi tự chọn mặc định', () => {
    expect(suyChuKyTuMoc([])).toBeNull()
    expect(suyChuKyTuMoc(['2026-01-10'])).toBeNull()
    expect(suyChuKyTuMoc([null, undefined, 'rác', '2026-13-99'])).toBeNull()
    expect(suyChuKyTuMoc(['2026-01-10', '2026-01-10'])).toBeNull()   // trùng ngày -> 0 tháng, bỏ
  })

  it('bỏ qua ngày rác lẫn trong chuỗi, vẫn suy được từ phần còn lại', () => {
    expect(suyChuKyTuMoc(['2026-01-10', null, '2026-04-10', 'hôm qua', '2026-07-10'])).toBe(3)
  })
})

describe('ghép với sinhLichBaoTri — đúng phép mà doiLichTheoSection() dùng', () => {
  /** Đúng biểu thức trong `doiLichTheoSection()`: lượt mồ côi, vùng mặc định 'bac'. */
  const mocMoi = (moiMoc: string[], ngayThuc: string, soLuotConLai: number) =>
    sinhLichBaoTri(ngayThuc, suyChuKyTuMoc(moiMoc) ?? 3, soLuotConLai + 1, 'bac').slice(1)

  it('ca Mr.Nứa: lượt 6 làm 14/08/2026 -> lượt 7 và 8 tính lại từ ngày đó', () => {
    const dues = [
      '2025-04-21', '2025-07-14', '2025-10-14', '2026-01-16',
      '2026-05-29', '2026-08-29', '2026-11-29', '2027-03-29',
    ]
    const moc = mocMoi(dues, '2026-08-14', 2)
    // 14/08 + 3 tháng = 14/11/2026, nhưng đó là THỨ BẢY — miền Bắc nghỉ T7+CN nên
    // dời tới thứ Hai 16/11. Đây là luật tránh cuối tuần CEO đã duyệt, không phải lệch.
    expect(moc).toEqual(['2026-11-16', '2027-02-15'])
    // Cái chính: KHÔNG còn bám ngày 29 của chuỗi cũ.
    for (const m of moc) expect(m.slice(8, 10)).not.toBe('29')
  })

  it('không suy được chu kỳ thì rơi về 3 tháng (mặc định hợp đồng WH15A/WH30A)', () => {
    expect(mocMoi(['2026-08-29'], '2026-08-14', 1)).toEqual(['2026-11-16'])
  })
})
