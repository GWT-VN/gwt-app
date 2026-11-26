import { expect, test } from 'vitest'
import { hienNgay } from './dinh-dang-ngay'

const BAY_GIO = new Date('2026-11-26T03:00:00Z') // 10:00 giờ VN 26/11/26

test('mặc định dd/MM (cùng năm), khác năm → dd/MM/yy; ngày thuần là ngày lịch, không lệch múi giờ', () => {
  const o = { bayGio: BAY_GIO }
  expect(hienNgay('2026-08-14', undefined, o)).toBe('14/08')
  expect(hienNgay('2024-08-14', undefined, o)).toBe('14/08/24')
  expect(hienNgay('2024-08-14', 'ngan')).toBe('14/08/24')
  expect(hienNgay('2024-08-14T02:00:00Z', 'ngan')).toBe('14/08/24')
})

test('00:30 giờ VN không lùi về hôm trước (UTC còn là ngày cũ)', () => {
  expect(hienNgay('2026-11-19T17:30:00Z', 'ngan')).toBe('20/11/26')
  expect(hienNgay('2026-11-19T17:30:00Z', 'gio')).toBe('20/11/26 00:30')
})

test('các kiểu: đủ năm, ngày giờ (ngày thuần → như ngắn), trống → —', () => {
  expect(hienNgay('2024-08-14T02:05:00Z', 'day-du')).toBe('14/08/2024')
  expect(hienNgay('2024-08-14T02:05:00Z', 'gio')).toBe('14/08/24 09:05')
  expect(hienNgay('2024-08-14', 'gio')).toBe('14/08/24')
  expect(hienNgay(null)).toBe('—')
  expect(hienNgay('', 'ngan', { rong: '' })).toBe('')
  expect(hienNgay('khong-phai-ngay')).toBe('—')
})

test('tương đối theo ngày lịch VN (không theo 24 giờ); quá 30 ngày → ngày ngắn', () => {
  const o = { bayGio: BAY_GIO }
  expect(hienNgay('2026-11-26T01:00:00Z', 'tuong-doi', o)).toBe('Hôm nay')
  expect(hienNgay('2026-11-25T16:30:00Z', 'tuong-doi', o)).toBe('Hôm qua') // 23:30 VN 25/11, mới 10,5 giờ trước
  expect(hienNgay('2026-11-27', 'tuong-doi', o)).toBe('Ngày mai')
  expect(hienNgay('2026-11-21', 'tuong-doi', o)).toBe('5 ngày trước')
  expect(hienNgay('2026-11-29', 'tuong-doi', o)).toBe('3 ngày nữa')
  expect(hienNgay('2026-09-01', 'tuong-doi', o)).toBe('01/09/26')
})
