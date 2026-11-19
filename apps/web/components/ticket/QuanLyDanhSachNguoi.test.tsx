import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/ticket/nguoi-actions', () => ({ themNguoi: vi.fn(), xoaNguoi: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { QuanLyDanhSachNguoi } from './QuanLyDanhSachNguoi'

const cs = [{ id: 'c1', ten: 'Hiền', hoat_dong: true, so_ticket: 12 }, { id: 'c2', ten: 'Kiều Trang', hoat_dong: true, so_ticket: 0 }]
const kt = [{ id: 't1', ten: 'Trần Văn Sơn', hoat_dong: true, la_ctv: true, so_ticket: 2 }]

describe('QuanLyDanhSachNguoi', () => {
  const h = renderToStaticMarkup(<QuanLyDanhSachNguoi cs={cs} kt={kt} />)
  it('hai danh sách + số ticket đang mở + nút Xoá và ô Thêm', () => {
    for (const t of ['CS theo dõi (2)', 'Kỹ thuật (1)', 'Hiền', '12 ticket đang mở', 'Trần Văn Sơn (CTV)', '+ Thêm', 'CTV']) expect(h).toContain(t)
    expect(h.match(/>Xoá</g)?.length).toBe(3)
  })
  it('không có Đổi tên (19/11: chỉ thêm + xoá)', () => {
    expect(h).not.toContain('Đổi tên')
  })
  it('kỹ thuật trỏ sang Danh sách kỹ thuật cho hồ sơ đầy đủ', () => {
    expect(h).toContain('href="/ky-thuat/nhan-su"')
  })
})
