import { describe, it, expect } from 'vitest'
import { rutGonNoiDung, timSdt, laNoiBo, laLaiNganHang, tuKhoa } from './noi-dung'
import { khoaSaoKe } from '../chuan-hoa'
import { ganKhoaSaoKe } from '../nhap/khoa-sao-ke'

describe('rút gọn nội dung sao kê', () => {
  it('VCB21 UHHT lấy phần sau DG: tới dấu chấm, gộp khoảng trắng', () =>
    expect(rutGonNoiDung('UHHT..268076..1234567.      .466238...5919.7654321.DG:FACEBK *73DRRVZD42       DUBLI.5,270,776.00VND', 'VCB21')).toBe('FACEBK *73DRRVZD42 DUBLI'))
  it('VCB63 IBBIZ bỏ tiền tố mã lệnh + số chứng từ', () => {
    expect(rutGonNoiDung('IBBIZ6076649616.017669.GWT thanh toan vat tu Xuan Lanh 0508 0608', 'VCB63')).toBe('GWT thanh toan vat tu Xuan Lanh 0508 0608')
    expect(rutGonNoiDung('IBBIZ.6076650534.6219BFTVGLLB472I.GWT thanh toan Gia Bao', 'VCB63')).toBe('GWT thanh toan Gia Bao')
    expect(rutGonNoiDung('MBBIZ1234567.GWT chuyen tien noi bo tu VCB63 sang VCB21', 'VCB21')).toBe('GWT chuyen tien noi bo tu VCB63 sang VCB21')
  })
  it('SHGD lấy sau Remark:; TCB/INTEREST giữ nguyên', () => {
    expect(rutGonNoiDung('SHGD:1234567.DD:260811.BO:CT TNHH X.Remark:GWT chuyen tien noi bo tu TCB sang VCB63', 'VCB63')).toBe('GWT chuyen tien noi bo tu TCB sang VCB63')
    expect(rutGonNoiDung('INTEREST PAYMENT', 'VCB21')).toBe('INTEREST PAYMENT')
    expect(rutGonNoiDung('  LE NAM HAI  0912 788 899 may CTD50 ', 'TCB')).toBe('LE NAM HAI 0912 788 899 may CTD50')
  })
})
describe('tín hiệu', () => {
  it('timSdt bắt 10 số liền / tách 3-3-4 / chấm; không bắt số HĐ', () => {
    expect(timSdt('LE NAM HAI 0912788899 may CTD50')).toBe('0912788899')
    expect(timSdt('Thu Huong 091278 8899 may')).toBe('0912788899')
    expect(timSdt('x 0912.788.899 y')).toBe('0912788899')
    expect(timSdt('Thanh toan GWT 50% HD 001 0726 GWT R2C')).toBeNull()
    expect(timSdt('IBBIZ6076649616.017669.GWT')).toBeNull()
  })
  it('nội bộ / lãi', () => {
    expect(laNoiBo('GWT chuyen tien noi bo tu VCB63 sang VCB21')).toBe(true); expect(laNoiBo('GWT thanh toan luong')).toBe(false)
    expect(laLaiNganHang('INTEREST PAYMENT')).toBe(true); expect(laLaiNganHang('Tra lai so du tren tai khoan - thang 08/2026')).toBe(true); expect(laLaiNganHang('thanh toan')).toBe(false)
  })
  it('tuKhoa bỏ cụm chung (cong ty tnhh, thuong mai, xay dung…), giữ phần riêng biệt', () =>
    expect([...tuKhoa('CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ XÂY DỰNG XUÂN LÀNH 01')].sort()).toEqual(['lanh', 'xuan']))
  it('tuKhoa không nuốt tên riêng trùng chữ với cụm chung (Dũng ≠ "xây dựng")', () =>
    expect(tuKhoa('Nguyễn Văn Dũng').has('dung')).toBe(true))
})
describe('khoá dòng sao kê', () => {
  it('ổn định và đổi theo từng trường', () => {
    const a = khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0)
    expect(a).toBe(khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0))
    expect(a).not.toBe(khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0, 1))
    expect(a).not.toBe(khoaSaoKe('VCB63', '2026-08-03', '5254-05356', 5270776, 0))
  })
  it('ganKhoaSaoKe: 2 dòng giống hệt (TCB không số CT) → khoá khác nhau nhờ lan', () => {
    const d = { rowOrder: 1, ngay: '2026-08-10', soCt: '', no: 0, co: 1000000, soDu: null, noiDung: 'x', tenDoiUng: null, raw: [] }
    const k = ganKhoaSaoKe([d, { ...d, rowOrder: 2 }], 'TCB')
    expect(k[0]).not.toBe(k[1]); expect(ganKhoaSaoKe([d], 'TCB')[0]).toBe(k[0])
  })
})
