import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { XacNhanXoa } from './XacNhanXoa'

const nhan = [{ id: 'c3', ten: 'Hiền', hoat_dong: true }]
const f = () => {}

describe('XacNhanXoa', () => {
  it('nói rõ ticket đã xong giữ tên; có ô chuyển ticket đang mở (mặc định chưa gán)', () => {
    const h = renderToStaticMarkup(<XacNhanXoa ten="Hiệp" soTicket={3} nguoiNhan={nhan} busy={false} onXoa={f} onHuy={f} />)
    for (const t of ['Ticket đã xong vẫn giữ tên Hiệp', 'Chuyển 3 ticket đang mở sang', '— Chưa gán —', '>Hiền<', '>Xoá<', '>Huỷ<']) expect(h).toContain(t)
  })
  it('không có ticket đang mở → không hiện ô chuyển', () => {
    const h = renderToStaticMarkup(<XacNhanXoa ten="Hiệp" soTicket={0} nguoiNhan={nhan} busy={false} onXoa={f} onHuy={f} />)
    expect(h).not.toContain('Chuyển')
  })
  it('thợ còn chuyến hẹn / còn tài khoản → nhắc', () => {
    const h = renderToStaticMarkup(<XacNhanXoa ten="Sơn" soTicket={0} soLichHen={2} coTaiKhoan nguoiNhan={[]} busy={false} onXoa={f} onHuy={f} />)
    expect(h).toContain('Còn 2 chuyến hẹn sắp tới')
    expect(h).toContain('thu quyền')
  })
})
