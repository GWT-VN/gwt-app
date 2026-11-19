import { describe, expect, it } from 'vitest'
import { kiemTaoTicket, serialBoSungChoTicket } from './ticketKhongSerial'

describe('kiemTaoTicket', () => {
  const du = { customer_id: 'k1', ticket_type: 'Rò rỉ nước', description: 'Chảy nước đáy' }
  it('có khách, không serial → được tạo', () => {
    expect(kiemTaoTicket(du)).toBeNull()
  })
  it('vẫn bắt buộc khách, loại, mô tả', () => {
    expect(kiemTaoTicket({ ...du, customer_id: ' ' })).toBe('Bắt buộc chọn khách.')
    expect(kiemTaoTicket({ ...du, ticket_type: '' })).toBe('Chọn loại ticket.')
    expect(kiemTaoTicket({ ...du, description: '  ' })).toBe('Nhập mô tả sự cố.')
  })
  it('chặn trạng thái lạ', () => {
    expect(kiemTaoTicket({ ...du, state: 'X' })).toBe('Trạng thái không hợp lệ.')
  })
})

describe('serialBoSungChoTicket', () => {
  it('ticket chưa có serial + dòng vừa điền serial → ghi lên ticket', () => {
    expect(serialBoSungChoTicket({ serial: null, source_serial: null }, { serial: 'F0001', source_serial: 'F0001' }))
      .toEqual({ serial: 'F0001', source_serial: 'F0001' })
    // serial chưa lắp (không có trong installed_base) → chỉ source_serial
    expect(serialBoSungChoTicket({ serial: null, source_serial: '' }, { serial: null, source_serial: 'F0002' }))
      .toEqual({ serial: null, source_serial: 'F0002' })
  })
  it('ticket đã có serial → giữ nguyên', () => {
    expect(serialBoSungChoTicket({ serial: null, source_serial: 'CU' }, { serial: 'F0001', source_serial: 'F0001' })).toBeNull()
  })
  it('dòng xoá serial (rỗng) → không đụng ticket', () => {
    expect(serialBoSungChoTicket({ serial: null, source_serial: null }, { serial: null, source_serial: null })).toBeNull()
  })
})
