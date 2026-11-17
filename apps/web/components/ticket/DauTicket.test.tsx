import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/actions', () => ({ updateTicket: vi.fn() }))
vi.mock('@/app/ticket/dau-ticket-actions', () => ({ datCsTheoDoi: vi.fn() }))
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
})
