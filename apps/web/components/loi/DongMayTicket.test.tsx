import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { DongMay, LoiDanhMuc } from '@/lib/loi/kieu'

vi.mock('@/app/ticket/loi-actions', () => ({
  traSerial: vi.fn(), traKhachVaMay: vi.fn(), themDongMay: vi.fn(), suaDongMay: vi.fn(), xoaDongMay: vi.fn(), xacNhanHuongXuLy: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { DongMayTicket } from './DongMayTicket'

const loi = (code: string, huong: string | null, tt: LoiDanhMuc['trang_thai'] = 'da_duyet'): LoiDanhMuc => ({
  code, nhom: null, ten: `Lỗi ${code}`, aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: huong, nguon: null,
  trang_thai: tt, duyet_boi: null, duyet_luc: null, thu_tu: 1,
})
const dong = (p: Partial<DongMay> = {}): DongMay => ({
  id: '11111111-1111-4111-8111-111111111111', ticket_code: 'TK-2611-001', thu_tu: 1,
  serial: 'A12345678ABC12345678', source_serial: null, internal_code: 'M1', loi_code: 'L1', loi_ten: 'Lỗi L1',
  mo_ta: null, huong_xu_ly: null, huong_xu_ly_nguon: null, trang_thai: 'dang_xu_ly', nguon: 'app', created_at: '2026-11-09', ...p,
})
const ds = [loi('L1', 'Thay van nước'), loi('CHUA_PHAN_LOAI', 'Không nên hiện')]

describe('DongMayTicket', () => {
  it('hiện gợi ý + Xác nhận khi dòng chưa có hướng xử lý', () => {
    const h = renderToStaticMarkup(<DongMayTicket code="TK-2611-001" dong={[dong()]} dsLoi={ds} choSua />)
    expect(h).toContain('Hướng xử lý đề xuất (theo danh mục lỗi)')
    expect(h).toContain('Thay van nước')
    expect(h).toContain('Xác nhận')
    expect(h).toContain('/may/A12345678ABC12345678')
    expect(h).toContain('Đang xử lý')
  })
  it('đã có hướng xử lý: không còn khối gợi ý, hiện nhãn nguồn + Sửa', () => {
    const h = renderToStaticMarkup(<DongMayTicket code="c" dong={[dong({ huong_xu_ly: 'Thay van nước', huong_xu_ly_nguon: 'danh_muc' })]} dsLoi={ds} choSua />)
    expect(h).not.toContain('Hướng xử lý đề xuất')
    expect(h).toContain('theo danh mục')
    expect(h).toContain('Sửa')
  })
  it('CHUA_PHAN_LOAI không có gợi ý', () => {
    const h = renderToStaticMarkup(<DongMayTicket code="c" dong={[dong({ loi_code: 'CHUA_PHAN_LOAI' })]} dsLoi={ds} choSua />)
    expect(h).not.toContain('Hướng xử lý đề xuất')
  })
  it('không có quyền sửa: không có nút nào sửa/thêm/bỏ/xác nhận', () => {
    const h = renderToStaticMarkup(<DongMayTicket code="c" dong={[dong(), dong({ id: '22222222-2222-4222-8222-222222222222' })]} dsLoi={ds} choSua={false} />)
    for (const t of ['Thêm máy', 'Bỏ dòng', 'Xác nhận', '>Sửa<']) expect(h).not.toContain(t)
    expect(h).toContain('Thay van nước')   // vẫn xem được gợi ý
  })
  it('1 dòng: nút Bỏ dòng bị khoá kèm tooltip; 2 dòng: bật', () => {
    const m = renderToStaticMarkup(<DongMayTicket code="c" dong={[dong()]} dsLoi={ds} choSua />)
    expect(m).toMatch(/<button[^>]*disabled=""[^>]*>Bỏ dòng<\/button>/)
    expect(m).toContain('Ticket phải còn ít nhất một dòng máy.')
    const n = renderToStaticMarkup(<DongMayTicket code="c" dong={[dong(), dong({ id: '22222222-2222-4222-8222-222222222222' })]} dsLoi={ds} choSua />)
    expect(n.match(/Bỏ dòng/g)).toHaveLength(2)
    expect(n).not.toMatch(/<button[^>]*disabled=""[^>]*>Bỏ dòng<\/button>/)
  })
  it('có nút Thêm máy khi được sửa', () => {
    expect(renderToStaticMarkup(<DongMayTicket code="c" dong={[dong()]} dsLoi={ds} choSua />)).toContain('Thêm máy')
  })
})
