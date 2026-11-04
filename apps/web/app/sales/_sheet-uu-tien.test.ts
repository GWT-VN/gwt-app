import { describe, expect, it } from 'vitest'
import { boDauApp, dauTheoSheet, dongTheoSheet, laMaSp } from './_sheet-uu-tien'

describe('đơn app đã lên Sheet: lấy theo Sheet', () => {
  it('bỏ dấu bot trong Ghi chú, giữ phần người gõ', () => {
    expect(boDauApp('[App] nhập bởi a@gwt.vn')).toBeNull()
    expect(boDauApp('giao trước 9h · [App] nhập bởi a@gwt.vn')).toBe('giao trước 9h')
    expect(boDauApp('[App] Đã xoá trên app 04/11/2026 → Huỷ · khách đổi ý · [App] nhập bởi a@gwt.vn')).toBe('khách đổi ý')
    expect(boDauApp(null)).toBeNull()
  })

  it('phần đầu đơn: tình trạng / thanh toán / khách theo dòng Sheet', () => {
    const d = dauTheoSheet({ order_date: '2026-09-18', customer_name: 'Khách Thử', fulfillment_status: 'Hoàn thành (Không lắp)', payment_status: 'Đã thu đủ', note: '[App] nhập bởi x' })
    expect(d).toMatchObject({ status: 'Hoàn thành (Không lắp)', payment_status: 'Đã thu đủ', customer_name: 'Khách Thử', note: null })
  })

  it('sản phẩm theo Sheet, giữ cờ quà theo mã + dòng quà ghi bằng chữ của app', () => {
    const app = [
      { internal_code: 'CTD50NG', is_gift: false, n: 'app' },
      { internal_code: 'GEUS-00X06', is_gift: true, n: 'app' },
      { internal_code: '01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển', is_gift: true, n: 'app' },
    ]
    const sheet = [{ internal_code: 'CTD50NG' }, { internal_code: 'GEUS-00X06' }, { internal_code: 'DVLD' }]
    const r = dongTheoSheet(sheet, app, (s, laQua) => ({ internal_code: s.internal_code as string, is_gift: laQua, n: 'sheet' }))
    expect(r.map((x) => [x.internal_code, x.is_gift, x.n])).toEqual([
      ['CTD50NG', false, 'sheet'], ['GEUS-00X06', true, 'sheet'], ['DVLD', false, 'sheet'],
      ['01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển', true, 'app'],
    ])
    expect(laMaSp('GPUN-4000XEN-G')).toBe(true)
  })
})
