import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ updateTicket: vi.fn() }))
vi.mock('@/app/ticket/dau-ticket-actions', () => ({ datCsTheoDoi: vi.fn() }))
vi.mock('@/app/ticket/nguoi-actions', () => ({
  ganCsTheoDoi: vi.fn(), ganKyThuat: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { DauTicket } from './DauTicket'

// Mặc định `hienNgay` (CEO 26/11): cùng năm dd/MM, khác năm dd/MM/yy — khoá "bây giờ" ở 26/11/2026 để chữ ngày trong
// test không đổi theo năm chạy.
beforeAll(() => vi.useFakeTimers({ now: new Date('2026-11-26T03:00:00Z'), toFake: ['Date'] }))
afterAll(() => vi.useRealTimers())

const co = {
  code: 'GWT-260024', loai: 'Rò rỉ nước', model: 'CTS20', tinh: 'Đà Nẵng', state: 'Open', khan: false,
  csTheoDoi: null, ktId: null, staff: [{ id: 'k1', ten: 'nhu', email: null, vai_tro: [] }],
  ngayDau: '2026-09-13', soLan: 3, ngayCuoi: '2026-10-14', homNay: '2026-11-17', choSua: true, choCs: true,
}

describe('DauTicket', () => {
  it('mã, loại, model, tỉnh + tóm tắt mở N ngày, K lần, lần cuối', () => {
    const h = renderToStaticMarkup(<DauTicket {...co} />)
    for (const t of ['GWT-260024', 'Rò rỉ nước', 'CTS20', 'Đà Nẵng', 'Mở 65 ngày', '3 lần lỗi', 'lần cuối 14/10']) expect(h).toContain(t)
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

    it('CS theo dõi lấy từ danh sách, CHỈ CHỌN: không còn Thêm / Sửa danh sách trên ticket (19/11)', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} />)
      expect(h).toContain('>Thanh Hiền<')
      for (const t of ['Thêm tên', 'Sửa danh sách', 'Đổi tên', 'Quản lý danh sách']) expect(h).not.toContain(t)
      expect(h).not.toContain('Tuyết Trang')
    })
    it('admin@ / ai@ (quanTri) → có link sang trang quản trị /danh-sach-nguoi', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} quanTri />)
      expect(h).toContain('href="/danh-sach-nguoi"')
      expect(h.match(/Sửa danh sách →/g)?.length).toBe(1)
    })
    it('người đã ẩn nhưng đang gán vẫn hiện, đánh dấu đã ẩn', () => {
      const h = renderToStaticMarkup(<DauTicket {...moi} csTheoDoi="Tuyết Trang" />)
      expect(h).toContain('Tuyết Trang (đã xoá)')
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
