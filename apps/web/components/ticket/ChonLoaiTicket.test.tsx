import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChonLoaiTicket } from './ChonLoaiTicket'

const DS = ['Khác', 'Rò rỉ nước', 'Yêu cầu bảo trì', 'Yêu cầu thay lõi lọc']

describe('ChonLoaiTicket', () => {
  it('có "+ Thêm loại mới…", không có bảo trì / thay lõi', () => {
    const h = renderToStaticMarkup(<ChonLoaiTicket value="" onChange={() => {}} loaiList={DS} />)
    expect(h).toContain('+ Thêm loại mới…')
    expect(h).toContain('Rò rỉ nước')
    expect(h).not.toContain('Yêu cầu bảo trì')
    expect(h).not.toContain('thay lõi lọc')
  })
  it('ticket cũ đang mang loại bảo trì → vẫn hiện giá trị đó (không mất dữ liệu)', () => {
    const h = renderToStaticMarkup(<ChonLoaiTicket value="Yêu cầu bảo trì" onChange={() => {}} loaiList={DS} />)
    expect(h).toContain('Yêu cầu bảo trì')
  })
})
