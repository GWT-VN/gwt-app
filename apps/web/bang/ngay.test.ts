import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { hienNgay, isoNgay, khoangPreset, ngayTuIso } from './ngay'

// Thứ Tư 2026-08-19, 00:30 giờ máy — giờ sớm chính là chỗ toISOString() hay sai.
const thuTu = new Date(2026, 7, 19, 0, 30)

describe('isoNgay', () => {
  it('lấy ngày theo giờ máy, KHÔNG lệch sang hôm trước như toISOString', () => {
    expect(isoNgay(thuTu)).toBe('2026-08-19')
    // Chứng minh cái bẫy có thật: cùng thời điểm đó, UTC đã là ngày hôm trước — CHỈ đúng khi máy ở múi giờ dương
    // (VN +7). Máy CI chạy UTC thì không có bẫy để chứng minh, bỏ qua vế này (isoNgay ở trên vẫn được kiểm).
    if (thuTu.getTimezoneOffset() < 0) expect(thuTu.toISOString().slice(0, 10)).toBe('2026-08-18')
  })
  it('đệm 0 cho tháng/ngày một chữ số', () => {
    expect(isoNgay(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('khoangPreset', () => {
  it('hôm nay = đúng một ngày', () => {
    expect(khoangPreset('homnay', thuTu)).toEqual({ tu: '2026-08-19', den: '2026-08-19' })
  })
  it('tuần này bắt đầu THỨ 2', () => {
    expect(khoangPreset('tuannay', thuTu)).toEqual({ tu: '2026-08-17', den: '2026-08-19' })
  })
  it('chủ nhật vẫn thuộc tuần bắt đầu thứ 2 trước đó', () => {
    const chuNhat = new Date(2026, 7, 23, 12, 0)
    expect(khoangPreset('tuannay', chuNhat)).toEqual({ tu: '2026-08-17', den: '2026-08-23' })
  })
  it('thứ 2 thì tuần này bắt đầu từ chính nó', () => {
    const thuHai = new Date(2026, 7, 17, 9, 0)
    expect(khoangPreset('tuannay', thuHai)).toEqual({ tu: '2026-08-17', den: '2026-08-17' })
  })
  it('tháng này bắt đầu ngày 1', () => {
    expect(khoangPreset('thangnay', thuTu)).toEqual({ tu: '2026-08-01', den: '2026-08-19' })
  })
  it('30 ngày tính lùi, qua được mốc đầu tháng', () => {
    expect(khoangPreset('ngay30', thuTu)).toEqual({ tu: '2026-07-20', den: '2026-08-19' })
  })
  it('lùi qua mốc đầu NĂM vẫn đúng', () => {
    expect(khoangPreset('ngay30', new Date(2026, 0, 10, 8, 0))).toEqual({ tu: '2025-12-11', den: '2026-01-10' })
  })
})

describe('ngayTuIso', () => {
  it("'YYYY-MM-DD' → 00:00 ngày đó theo giờ MÁY (không phải UTC như new Date('2026-11-20'))", () => {
    const d = ngayTuIso('2026-11-20')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 20, 0])
    expect(isoNgay(d)).toBe('2026-11-20')
  })
})

// Mặc định toàn app (CEO 26/11): cùng năm dd/MM, khác năm dd/MM/yy — khoá "bây giờ" để test không đổi theo năm thật.
beforeEach(() => vi.useFakeTimers({ now: new Date('2026-11-26T03:00:00Z'), toFake: ['Date'] }))
afterEach(() => vi.useRealTimers())

describe('hienNgay', () => {
  it('cùng năm dd/MM, khác năm dd/MM/yy', () => {
    expect(hienNgay('2026-11-20')).toBe('20/11')
    expect(hienNgay('2026-01-05')).toBe('05/01')
    expect(hienNgay('2025-12-31')).toBe('31/12/25')
  })
})

describe('đầu vào dài hơn YYYY-MM-DD (timestamp cột DB)', () => {
  it('chỉ lấy 10 ký tự đầu, không đổi múi giờ — không ra "20T00:00/11"', () => {
    expect(hienNgay('2026-11-20T00:00')).toBe('20/11')
    expect(hienNgay('2026-11-20T23:30:00Z')).toBe('20/11')
    expect(hienNgay('2026-11-20 08:15:00+07')).toBe('20/11')
    const d = ngayTuIso('2026-11-20T00:00')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 20, 0])
  })
})
