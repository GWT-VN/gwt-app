import { expect, it } from 'vitest'
import { khoangNgay, motGiaTri } from './truong-kho'

const LOAI = ['Nhập', 'Xuất', 'Điều chỉnh']

it('quy điều kiện chọn về MỘT giá trị cho RPC sổ kho', () => {
  expect(motGiaTri(undefined, LOAI)).toEqual({})
  expect(motGiaTri({ truong: 'loai', phep: 'la', giaTri: ['Xuất'] }, LOAI)).toEqual({ gt: 'Xuất' })
  expect(motGiaTri({ truong: 'loai', phep: 'la', giaTri: ['Xuất', 'Nhập'] }, LOAI)).toBe('nhieu')
  expect(motGiaTri({ truong: 'loai', phep: 'la', giaTri: LOAI }, LOAI)).toEqual({})
  expect(motGiaTri({ truong: 'loai', phep: 'khong-la', giaTri: ['Xuất', 'Nhập'] }, LOAI)).toEqual({ gt: 'Điều chỉnh' })
  expect(motGiaTri({ truong: 'loai', phep: 'khong-la', giaTri: ['Xuất'] }, LOAI)).toBe('nhieu')
  expect(motGiaTri({ truong: 'loai', phep: 'la', giaTri: ['lạ'] }, LOAI)).toBe('rong')
  expect(motGiaTri({ truong: 'loai', phep: 'trong', giaTri: [] }, LOAI)).toBe('rong')
  expect(motGiaTri({ truong: 'loai', phep: 'co', giaTri: [] }, LOAI)).toEqual({})
})

it('điều kiện ngày → tu_ngay / den_ngay (tính cả hai đầu)', () => {
  expect(khoangNgay(undefined)).toEqual({})
  expect(khoangNgay({ truong: 'ngay', phep: 'hom-nay', giaTri: [] }, '2026-11-27')).toEqual({ tu: '2026-11-27', den: '2026-11-27' })
  expect(khoangNgay({ truong: 'ngay', phep: 'khoang', giaTri: ['2026-11-01', '2026-11-20'] })).toEqual({ tu: '2026-11-01', den: '2026-11-20' })
  expect(khoangNgay({ truong: 'ngay', phep: 'sau', giaTri: ['2026-11-01'] })).toEqual({ tu: '2026-11-01' })
  // "trước ngày" KHÔNG gồm ngày đó → den = hôm trước (qua đầu tháng).
  expect(khoangNgay({ truong: 'ngay', phep: 'truoc', giaTri: ['2026-12-01'] })).toEqual({ den: '2026-11-30' })
  expect(khoangNgay({ truong: 'ngay', phep: 'trong', giaTri: [] })).toBe('rong')
})
