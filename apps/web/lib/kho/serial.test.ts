import { describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/nen-tang/db', () => ({ dataClient: () => { throw new Error('không dùng DB trong test') } }))
import { ghepSerial, nhanSuKien } from './serial'

describe('lib/kho/serial — serial theo mã cho thẻ kho', () => {
  const tt = new Map([['ton_kho', 'Tồn kho'], ['da_lap', 'Đã lắp (khách)']])

  it('mỗi serial một dòng, sắp theo serial, nhãn trạng thái, sự kiện MỚI NHẤT (kể cả của bot kho)', () => {
    const r = ghepSerial(
      [{ serial: 'F2', trang_thai: 'da_lap' }, { serial: 'F1', trang_thai: 'ton_kho' }],
      [{ serial: 'F1', su_kien: 'tinh_trang', luc: '2026-11-04T02:00:00Z', ghi_chu: 'thiếu bình gas' },
       { serial: 'F1', su_kien: 'kho_nhap', luc: '2026-11-01T02:00:00Z', ghi_chu: 'cũ' }],
      [], tt)
    expect(r.map((x) => x.serial)).toEqual(['F1', 'F2'])
    expect(r[0]).toMatchObject({ trang_thai_nhan: 'Tồn kho', su_kien_cuoi: 'tinh_trang', ghi_chu_cuoi: 'thiếu bình gas' })
    expect(r[1]).toMatchObject({ trang_thai_nhan: 'Đã lắp (khách)', su_kien_cuoi: null })
  })

  it('serial chờ duyệt (bot gặp, chưa có trong danh sách) đứng cuối; trùng serial đã có thì bỏ', () => {
    const r = ghepSerial([{ serial: 'F1', trang_thai: 'ton_kho' }], [],
      [{ serial: 'NEW1', created_at: '2026-11-04T03:00:00Z', ghi_chu: 'TQ gửi test' }, { serial: 'F1', created_at: 'x', ghi_chu: null }], tt)
    expect(r.map((x) => [x.serial, x.cho_duyet, x.trang_thai_nhan])).toEqual([['F1', false, 'Tồn kho'], ['NEW1', true, 'Chờ duyệt']])
  })

  it('nhãn sự kiện tiếng Việt, mã lạ giữ nguyên', () => {
    expect(nhanSuKien('kho_xuat')).toBe('Xuất kho'); expect(nhanSuKien('abc')).toBe('abc'); expect(nhanSuKien(null)).toBe('')
  })
})
