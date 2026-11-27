import { expect, test } from 'vitest'
import { dongLoiCuaTicket, thongKeLoiTheoMay, type DongLoiMay } from './thong-ke-loi'

test('đếm theo máy × mã lỗi, bỏ ticket huỷ, gom máy null thành "Chưa rõ máy"', () => {
  const r = thongKeLoiTheoMay([
    { ticket_code: 'T1', state: 'Open', serial: 'S1', internal_code: 'CTS20', product_name: 'CTS20', loi_code: 'E3', loi_ten: 'Báo lỗi E3', ngay: '2026-11-01' },
    { ticket_code: 'T2', state: 'Done', serial: 'S1', internal_code: 'CTS20', product_name: 'CTS20', loi_code: 'E3', loi_ten: 'Báo lỗi E3', ngay: '2026-11-20' },
    { ticket_code: 'T3', state: 'Cancel', serial: 'S1', internal_code: 'CTS20', product_name: 'CTS20', loi_code: 'E1', loi_ten: 'E1', ngay: '2026-11-21' },
    { ticket_code: 'T4', state: 'Open', serial: null, internal_code: null, product_name: null, loi_code: 'CHUA_PHAN_LOAI', loi_ten: null, ngay: '2026-11-22' },
  ])
  expect(r.find((m) => m.may === 'S1')!.loi).toEqual([{ code: 'E3', ten: 'Báo lỗi E3', so_lan: 2, gan_nhat: '2026-11-20', tickets: ['T2', 'T1'] }])
  expect(r.find((m) => m.may === null)!.loi[0]).toMatchObject({ code: 'CHUA_PHAN_LOAI', ten: 'Chưa phân loại', so_lan: 1 })
})

test('máy nhiều lần lỗi lên trước, máy null luôn cuối; một ticket hai dòng cùng lỗi tính một lần', () => {
  const d = (ticket_code: string, serial: string | null, loi_code: string, ngay = '2026-11-01'): DongLoiMay => ({
    ticket_code, state: 'Open', serial, internal_code: null, product_name: null, loi_code, loi_ten: null, ngay,
  })
  const r = thongKeLoiTheoMay([d('T1', null, 'E1'), d('T1', null, 'E2'), d('T2', 'A', 'E1'), d('T3', 'B', 'E1'), d('T4', 'B', 'E2'), d('T4', 'B', 'E2')])
  expect(r.map((m) => m.may)).toEqual(['B', 'A', null])
  expect(r[0].loi.map((l) => [l.code, l.so_lan])).toEqual([['E1', 1], ['E2', 1]])
  expect(r[0].ten).toBeNull()
})

test('dongLoiCuaTicket: lấy trạng thái + ngày của ticket, tên máy tra theo serial', () => {
  const r = dongLoiCuaTicket(
    { ticket_code: 'T9', state: 'Done', created_at: '2026-11-05T02:00:00Z' },
    [{ serial: 'S1', internal_code: 'GN610', loi_code: 'E3', loi_ten: 'Báo lỗi E3' }, { serial: null, internal_code: null, loi_code: 'CHUA_PHAN_LOAI', loi_ten: null }],
    (s) => (s === 'S1' ? 'Máy GN610' : null),
  )
  expect(r).toEqual([
    { ticket_code: 'T9', state: 'Done', serial: 'S1', internal_code: 'GN610', product_name: 'Máy GN610', loi_code: 'E3', loi_ten: 'Báo lỗi E3', ngay: '2026-11-05' },
    { ticket_code: 'T9', state: 'Done', serial: null, internal_code: null, product_name: null, loi_code: 'CHUA_PHAN_LOAI', loi_ten: null, ngay: '2026-11-05' },
  ])
})
