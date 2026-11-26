import { describe, expect, it } from 'vitest'
import type { Ticket } from '@/app/actions'
import { bhCua, locCua, loiHopVoiMay, ngayGioNgan, ngayNgan, maMayDong, maMayNgan, queryTab, soDongThem } from './truong-f'

// Tên lấy đúng dạng product_name trên prod (đo 26/11, v_installed_base).
describe('maMayNgan', () => {
  it.each([
    ['Máy lọc nước GE GN610', 'GPUN-4000XEN-G', 'GN610'],
    ['Máy lọc nước GE CTS10 (màu trắng)', 'CTS10NW', 'CTS10'],
    ['Máy lọc nước GE CTS20', 'CTS20NG', 'CTS20'],
    ['Thiết bị tiền lọc GE GTEP-50A01-G', 'GTEP-50A01-G', 'GTEP-50A01-G'],
    ['Máy lạ không theo mẫu', 'X1', 'X1'],
    [null, null, '—'],
  ])('%s → %s', (product_name, internal_code, mong) => {
    expect(maMayNgan({ product_name, internal_code })).toBe(mong)
  })
})

describe('tab = bộ lọc chọn sẵn', () => {
  it('locCua: chỉ khoá lọc, sắp theo khoá, bỏ rỗng', () => {
    expect(locCua(new URLSearchParams('view=khan&tt=Open&khan=co&q=&cot_rong=a&xem=X'))).toBe('khan=co&tt=Open')
  })
  it('queryTab: thay bộ lọc bằng loc của tab, giữ dạng xem/cột, bỏ trang/xem', () => {
    expect(queryTab(new URLSearchParams('tt=Done&q=an&bo_cuc=kanban&cot_an=tinh&trang=2&xem=T1'), 'tt=Open&khan=co', 'khan')).toBe(
      'bo_cuc=kanban&cot_an=tinh&tt=Open&khan=co&view=khan',
    )
    expect(queryTab(new URLSearchParams('tt=Done'), '', null)).toBe('')
  })
})

describe('Máy ↔ Loại lỗi cùng dòng máy đầu, Bảo hành', () => {
  const t = (x: Partial<Ticket>) => ({ product_name: 'Máy lọc nước GE GN610', internal_code: 'GPUN-4000XEN-G', serial: 'S1', ...x }) as Ticket
  const dong = (internal_code: string | null, serial: string | null = null) => ({ nhan: '', serial, chuaPhanLoai: false, loi_code: 'E3', loi_ten: 'Báo lỗi E3', internal_code })
  it('maMayDong: dòng cùng máy ticket → mã ngắn từ tên; dòng máy khác → internal_code của dòng; chưa có dòng → máy ticket', () => {
    expect(maMayDong(t({ dong_may: [dong('GPUN-4000XEN-G')] }))).toBe('GN610')
    expect(maMayDong(t({ dong_may: [dong('X9', 'S1')] }))).toBe('GN610')
    expect(maMayDong(t({ dong_may: [dong('CTS20NG', 'S2')] }))).toBe('CTS20NG')
    expect(maMayDong(t({ dong_may: [] }))).toBe('GN610')
    expect(soDongThem(t({ dong_may: [dong('A'), dong('B'), dong('C')] }))).toBe(2)
  })
  it('bhCua', () => {
    expect(bhCua({ serial: null, warranty_activated: true, con_han_may: true })).toBe('khong')
    expect(bhCua({ serial: 'S', warranty_activated: false, con_han_may: null })).toBe('chua')
    expect(bhCua({ serial: 'S', warranty_activated: true, con_han_may: true })).toBe('con')
    expect(bhCua({ serial: 'S', warranty_activated: true, con_han_may: null })).toBe('het')
  })
})

describe('loiHopVoiMay — pop Loại lỗi theo máy cùng hàng (ILIKE như DB)', () => {
  it('rỗng = mọi máy; mẫu % / _ / \_; hoa thường; Chưa phân loại luôn được', () => {
    expect(loiHopVoiMay({ code: 'E3' }, 'GN610')).toBe(true)
    expect(loiHopVoiMay({ code: 'E3', ma_may: [] }, null)).toBe(true)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['CTS20%'] }, 'cts20ng')).toBe(true)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['CTS20%'] }, 'GPUN-4000XEN-G')).toBe(false)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['GTUN-8600HP-G%'] }, 'GTUN-8600HP-G')).toBe(true)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['AB\\_C%'] }, 'ABXC1')).toBe(false)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['AB\\_C%'] }, 'AB_C1')).toBe(true)
    expect(loiHopVoiMay({ code: 'E3', ma_may: ['CTS20%'] }, null)).toBe(false)
    expect(loiHopVoiMay({ code: 'CHUA_PHAN_LOAI', ma_may: ['CTS20%'] }, 'GN610')).toBe(true)
  })
})

describe('ngày dd/MM/yy (giờ VN) — CEO 26/11 "ngày tháng format 14/08/24"', () => {
  it('ngày + giờ, 00:30 VN không lệch ngày, năm khác, ngày thuần, trống', () => {
    expect(ngayNgan('2024-08-14T03:00:00Z')).toBe('14/08/24')
    expect(ngayNgan('2026-11-25T17:30:00Z')).toBe('26/11/26') // 00:30 ngày 26 giờ VN
    expect(ngayGioNgan('2026-11-25T17:30:00Z')).toBe('26/11/26 00:30')
    expect(ngayNgan('2025-01-02T10:00:00+07:00')).toBe('02/01/25')
    expect(ngayNgan('2027-03-09')).toBe('09/03/27')
    expect(ngayNgan(null)).toBe('—')
    expect(ngayGioNgan(undefined)).toBe(null)
  })
})
