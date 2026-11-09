import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { LoiDanhMuc } from '@/lib/loi/kieu'

vi.mock('@/app/ticket/loi-actions', () => ({ traSerial: vi.fn(), traKhachVaMay: vi.fn() }))
import { DongMayNhap } from './DongMayNhap'
import { SerialTraCuu } from './SerialTraCuu'

const ds: LoiDanhMuc[] = [{
  code: 'CHUA_PHAN_LOAI', nhom: null, ten: 'Chưa phân loại', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
  trang_thai: 'da_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 1,
}]

describe('DongMayNhap', () => {
  it('1 dòng: có Thêm máy, không có Bỏ dòng', () => {
    const h = renderToStaticMarkup(<DongMayNhap dong={[{}]} onChange={() => {}} dsLoi={ds} />)
    expect(h).toContain('Thêm máy')
    expect(h).not.toContain('Bỏ dòng')
    expect(h).toContain('Chưa phân loại')
  })
  it('2 dòng: hiện Bỏ dòng cho mỗi dòng', () => {
    const h = renderToStaticMarkup(<DongMayNhap dong={[{}, {}]} onChange={() => {}} dsLoi={ds} />)
    expect(h.match(/Bỏ dòng/g)).toHaveLength(2)
  })
  it('20 dòng: khoá Thêm máy', () => {
    const h = renderToStaticMarkup(<DongMayNhap dong={Array.from({ length: 20 }, () => ({}))} onChange={() => {}} dsLoi={ds} />)
    expect(h).toMatch(/disabled=""[^>]*>[^<]*Thêm máy|Thêm máy[^<]*<[^>]*disabled/)
  })
})
describe('SerialTraCuu', () => {
  it('gợi ý định dạng đỏ ngay khi gõ thiếu ký tự', () => {
    const h = renderToStaticMarkup(<SerialTraCuu value="Z1234" onChange={() => {}} />)
    expect(h).toContain('đủ 20 ký tự (đang có 5)')
  })
  it('serial đúng khuôn không hiện lỗi định dạng', () => {
    const h = renderToStaticMarkup(<SerialTraCuu value="A12345678ABC12345678" onChange={() => {}} />)
    expect(h).not.toContain('đủ 20 ký tự')
  })
})
