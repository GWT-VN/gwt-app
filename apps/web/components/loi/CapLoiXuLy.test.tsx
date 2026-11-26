import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { LanLoi } from '@/lib/loi/lanLoi'

vi.mock('@/app/ticket/lan-loi-actions', () => ({ themLanLoi: vi.fn(), suaLanLoi: vi.fn(), xoaLanLoi: vi.fn() }))
vi.mock('@/app/actions', () => ({ updateTicket: vi.fn() }))
vi.mock('@/app/ticket/dau-ticket-actions', () => ({ datNgayBao: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { FormCap, NoiDungLanLoi, LanLoiTiepTheo } from './CapLoiXuLy'
import { TicketEditor } from '@/components/TicketEditor'

// Mặc định `hienNgay` (CEO 26/11): cùng năm dd/MM, khác năm dd/MM/yy — khoá "bây giờ" ở 26/11/2026 để chữ ngày trong
// test không đổi theo năm chạy.
beforeAll(() => vi.useFakeTimers({ now: new Date('2026-11-26T03:00:00Z'), toFake: ['Date'] }))
afterAll(() => vi.useRealTimers())

const lan = (p: Partial<LanLoi> = {}): LanLoi => ({
  id: '11111111-1111-4111-8111-111111111111', ticket_code: 'TK-2611-003', lan: 2,
  mo_ta: 'Lại báo E4 sau khi hãng trả máy', xu_ly: 'Thay bo mạch', tao_boi: null, created_at: '2026-11-16T03:00:00Z', ...p,
})

describe('Nội dung lần lỗi', () => {
  it('hiện khách báo và xử lý cạnh nhau', () => {
    const h = renderToStaticMarkup(<NoiDungLanLoi moTa="Rò nước đáy" xuLy="Thay gioăng" />)
    expect(h).toContain('Khách báo')
    expect(h).toContain('Rò nước đáy')
    expect(h).toContain('Thay gioăng')
    expect(h).toContain('sm:grid-cols-2')
  })
  it('link/chữ dài tự xuống dòng, không tràn khung', () => {
    const h = renderToStaticMarkup(<NoiDungLanLoi moTa="a" xuLy="https://drive.google.com/file/d/rat-dai/view?usp=sharing" />)
    expect(h).toContain('[overflow-wrap:anywhere]')
  })
  it('chưa có xử lý → "chưa có"', () => {
    expect(renderToStaticMarkup(<NoiDungLanLoi moTa="E4" xuLy={null} />)).toContain('chưa có')
  })
})

describe('FormCap', () => {
  it('có ô chọn ngày khách báo, chặn ngày tương lai bằng max', () => {
    const h = renderToStaticMarkup(<FormCap dau="Lần 3" ngay0="2026-10-14" homNay="2026-11-17" onLuu={async () => ({ ok: true })} onHuy={() => {}} />)
    expect(h).toContain('Ngày khách báo')
    expect(h).toContain('type="date"')
    expect(h).toContain('value="2026-10-14"')
    expect(h).toContain('max="2026-11-17"')
  })
})

describe('LanLoiTiepTheo', () => {
  it('lần có ngày khách báo → hiện ngày đó, không hiện ngày nhập liệu', () => {
    const h = renderToStaticMarkup(<LanLoiTiepTheo code="c" ds={[lan({ ngay: '2026-10-14', created_at: '2026-11-17T08:00:00Z' })]} choSua={false} lanKe={3} />)
    expect(h).toContain('14/10')
    expect(h).not.toContain('17/11')
  })
  it('có quyền: hiện từng lần + Sửa/Xoá + nút thêm lần mới', () => {
    const h = renderToStaticMarkup(<LanLoiTiepTheo code="TK-2611-003" ds={[lan(), lan({ id: '22222222-2222-4222-8222-222222222222', lan: 3, xu_ly: null })]} choSua lanKe={4} />)
    expect(h).toContain('Lần 2')
    expect(h).toContain('Lần 3')
    expect(h).not.toContain('Thay bo mạch')
    expect(h).toContain('>Sửa<')
    expect(h).toContain('>Xoá<')
    expect(h).toContain('+ Thêm lần lỗi mới')
  })
  it('không có quyền: chỉ xem', () => {
    const h = renderToStaticMarkup(<LanLoiTiepTheo code="c" ds={[lan()]} choSua={false} lanKe={3} />)
    expect(h).toContain('Lại báo E4')
    for (const t of ['>Sửa<', '>Xoá<', 'Thêm lần lỗi mới']) expect(h).not.toContain(t)
  })
})

describe('TicketEditor (chế độ xem)', () => {
  it('mở lần 1 khi chưa có lần khác', () => {
    const h = renderToStaticMarkup(
      <TicketEditor code="TK-2611-003" lastNote="Đã gửi hãng" ticketType="Khác"
        description="Lỗi E4" ngayBao={null} ngayTao="2026-11-15T17:00:00Z" choSua />,
    )
    expect(h).toContain('Lần 1')
    expect(h.indexOf('Lỗi E4')).toBeLessThan(h.indexOf('Đã gửi hãng'))
    expect(h).not.toContain('Tóm tắt xử lý (hiện tại)')
    expect(h).toContain('16/11')
  })
  it('có ngày khách báo lần 1 → dùng ngày đó; không còn ô trạng thái/CS (đã lên thanh đầu)', () => {
    const h = renderToStaticMarkup(
      <TicketEditor code="c" lastNote={null} ticketType="Rò rỉ nước" description="Chảy nước" ngayBao="2026-09-13" ngayTao="2026-11-17T02:00:00Z" choSua />,
    )
    expect(h).toContain('13/09')
    expect(h).not.toContain('CS phụ trách')
    expect(h).not.toContain('Trạng thái')
  })
})
