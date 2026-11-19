import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/ticket/nguoi-actions', () => ({ themNguoi: vi.fn(), xoaNguoi: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { DanhSachCs } from './DanhSachCs'

const cs = [{ id: 'c1', ten: 'Hiền', hoat_dong: true, so_ticket: 12 }, { id: 'c2', ten: 'Kiều Trang', hoat_dong: true, so_ticket: 0 }]

describe('DanhSachCs (tab CS theo dõi)', () => {
  const h = renderToStaticMarkup(<DanhSachCs ds={cs} />)
  it('tên + số ticket đang mở + nút Xoá mỗi người + ô Thêm', () => {
    for (const t of ['Hiền', 'Kiều Trang', '12 ticket đang mở', '0 ticket đang mở', '+ Thêm']) expect(h).toContain(t)
    expect(h.match(/>Xoá</g)?.length).toBe(2)
  })
  it('không có Đổi tên, không có ô CTV (CTV chỉ ở tab Kỹ thuật)', () => {
    expect(h).not.toContain('Đổi tên')
    expect(h).not.toContain('CTV')
  })
})
