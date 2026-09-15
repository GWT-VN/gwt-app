import { describe, it, expect } from 'vitest'
import { taoGoiYMaNoiBo } from './ma-noi-bo'
import type { Luat } from './kieu'
const L: Luat[] = [
  { kind: 'product_name', pattern: 'may loc nuoc ge ctd50', targetCode: 'CTD50NG', condition: null, priority: 0, origin: 'history', active: true },
  { kind: 'product_name', pattern: 'dich vu van chuyen', targetCode: 'DVVC', condition: null, priority: 0, origin: 'override_json', active: true },
]
describe('taoGoiYMaNoiBo — port match_code Python', () => {
  const goiY = taoGoiYMaNoiBo(L)
  it('khớp tên lịch sử (sd) → cao', () => expect(goiY('Máy lọc nước GE CTD50')).toMatchObject({ ma: 'CTD50NG', conf: 'cao' }))
  it('CTS10 theo màu, vòi sen Aromatherapy theo màu, vận chuyển → DVVC', () => {
    expect(goiY('Máy lọc nước GE CTS10 (Trắng)').ma).toBe('CTS10NW')
    expect(goiY('Vòi sen tắm Aromatherapy GE (Hồng)').ma).toBe('GEUS-00X06')
    expect(goiY('Dịch vụ vận chuyển').ma).toBe('DVVC')
  })
  it('rỗng → trong; không khớp → can gan tay', () => { expect(goiY('').conf).toBe('trong'); expect(goiY('abc xyz').conf).toBe('can gan tay') })
})
