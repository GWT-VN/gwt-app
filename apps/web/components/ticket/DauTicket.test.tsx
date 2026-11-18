import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ updateTicket: vi.fn() }))
vi.mock('@/app/ticket/dau-ticket-actions', () => ({ datCsTheoDoi: vi.fn() }))
vi.mock('@/app/ticket/nguoi-actions', () => ({
  ganCsTheoDoi: vi.fn(), ganKyThuat: vi.fn(), themNguoi: vi.fn(), doiTenNguoi: vi.fn(), xoaNguoi: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { DauTicket } from './DauTicket'

const co = {
  code: 'GWT-260024', loai: 'Rò rỉ nước', model: 'CTS20', tinh: 'Đà Nẵng', state: 'Open', khan: false,
  csTheoDoi: null, ktId: null, staff: [{ id: 'k1', ten: 'nhu', email: null, vai_tro: [] }],
  ngayDau: '2026-09-13', soLan: 3, ngayCuoi: '2026-10-14', homNay: '2026-11-17', choSua: true, choCs: true,
}

describe('DauTicket', () => {
  it('mã, loại, model, tỉnh + tóm tắt mở N ngày, K lần, lần cuối', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} />)
    for (const t of ['GWT-260024', 'Rò rỉ nước', 'CTS20', 'Đà Nẵng', 'Mở 65 ngày', '3 lần lỗi', 'lần cuối 14/10/2026']) expect(h).toContain(t)
  })
  it('4 ô sửa nhanh; CS theo dõi đúng 4 tên', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} />)
    for (const t of ['Trạng thái', 'Khẩn', 'CS theo dõi', 'Kỹ thuật', '>Hiệp<', '>Kiều Trang<', '>Hiền<', '>Tuyết Trang<', '>nhu<']) expect(h).toContain(t)
  })
  it('đã xong → không đếm ngày mở', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} state="Done" />)
    expect(h).not.toContain('Mở 65 ngày')
    expect(h).toContain('Đã xong')
  })
  it('không quyền sửa → chỉ xem, không có ô chọn', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} choSua={false} choCs={false} csTheoDoi="Hiền" />)
    expect(h).not.toContain('<select')
    expect(h).toContain('Hiền')
  })
  it('chưa áp cột CS theo dõi → ẩn ô CS theo dõi', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} choCs={false} coCotMoi={false} />)
    expect(h).not.toContain('CS theo dõi')
  })

  describe('danh sách người từ DB (18/11)', () => {
    const dsCs = [
      { id: 'c1', ten: 'Hiệp', hoat_dong: true }, { id: 'c2', ten: 'Thanh Hiền', hoat_dong: true },
      { id: 'c3', ten: 'Tuyết Trang', hoat_dong: false },
    ]
    const dsKt = [
      { id: 't1', ten: 'Đỗ Ngọc Bình', hoat_dong: true, la_ctv: false },
      { id: 't2', ten: 'Trần Văn Sơn', hoat_dong: true, la_ctv: true },
      { id: 't3', ten: 'Thợ cũ', hoat_dong: false, la_ctv: true },
    ]
    const moi = { ...co, dsCs, dsKt, ktHoSo: null }

    it('CS theo dõi lấy từ danh sách: có tên mới, không có người đã ẩn, có Thêm / Sửa danh sách', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} />)
      for (const t of ['>Thanh Hiền<', '+ Thêm tên…', '✎ Sửa danh sách…']) expect(h).toContain(t)
      expect(h).not.toContain('Tuyết Trang')
    })
    it('người đã ẩn nhưng đang gán vẫn hiện, đánh dấu đã ẩn', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} csTheoDoi="Tuyết Trang" />)
      expect(h).toContain('Tuyết Trang (nghỉ)')
    })
    it('Kỹ thuật lấy từ hồ sơ thợ (có CTV), không còn liệt kê tài khoản nhân viên', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} />)
      expect(h).toContain('Trần Văn Sơn (CTV)')
      expect(h).toContain('>Đỗ Ngọc Bình<')
      expect(h).not.toContain('>nhu<')
      expect(h).not.toContain('Thợ cũ')
    })
    it('chỉ xem: hiện tên thợ theo hồ sơ', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} choSua={false} choCs={false} ktHoSo="t2" />)
      expect(h).not.toContain('<select')
      expect(h).toContain('Trần Văn Sơn')
    })
  })
})
