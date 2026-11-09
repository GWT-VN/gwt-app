import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { LoiDanhMuc } from '@/lib/loi/kieu'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/ticket/loi-actions', () => ({ luuLoi: vi.fn(), datTrangThaiLoi: vi.fn() }))
import { DanhMucLoiBang } from './DanhMucLoiBang'

const mk = (p: Partial<LoiDanhMuc>): LoiDanhMuc => ({
  code: 'X1', nhom: null, ten: 'Lỗi X', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
  trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 1, ...p,
})
const rows = [
  mk({ code: 'A1', ten: 'Rò nước', aliases: ['a', 'b', 'c', 'd'], huong_xu_ly: 'x'.repeat(100), trang_thai: 'da_duyet' }),
  mk({ code: 'CHUA_PHAN_LOAI', ten: 'Chưa phân loại' }),
]

describe('DanhMucLoiBang', () => {
  it('hiện danh sách, cách ghi rút gọn, phương án cắt 80 ký tự', () => {
    const h = renderToStaticMarkup(<DanhMucLoiBang rows={rows} choSua={false} />)
    expect(h).toContain('Rò nước')
    expect(h).toContain('a, b, c +1')
    expect(h).toContain('x'.repeat(80) + '…')
    expect(h).toContain('Đã duyệt')
  })
  it('không có quyền thì ẩn Sửa/Duyệt/Ngừng dùng', () => {
    const h = renderToStaticMarkup(<DanhMucLoiBang rows={rows} choSua={false} />)
    expect(h).not.toMatch(/>Sửa<|>Duyệt<|>Ngừng dùng</)
  })
  it('có quyền thì hiện nút, nhưng dòng CHUA_PHAN_LOAI chỉ đọc', () => {
    const h = renderToStaticMarkup(<DanhMucLoiBang rows={rows} choSua />)
    expect(h.match(/>Sửa</g)).toHaveLength(1)
    expect(h).toContain('(hệ thống)')
    expect(h.match(/>Ngừng dùng</g)).toHaveLength(1)
    expect(h.match(/>Duyệt</g)).toBeNull() // A1 đã duyệt; CHUA_PHAN_LOAI không sửa được
  })
  it('danh sách rỗng báo không khớp', () => {
    expect(renderToStaticMarkup(<DanhMucLoiBang rows={[]} choSua={false} />)).toContain('Không có mã lỗi nào khớp')
  })
})
