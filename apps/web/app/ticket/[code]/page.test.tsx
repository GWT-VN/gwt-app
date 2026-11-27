import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Ticket } from '@/app/actions'
import TicketPage from './page'

const quyen = vi.hoisted(() => ({ sua: true, lichKT: true, chiPhi: true, xemKhach: true, xemTatCa: true }))
const nguon = vi.hoisted(() => ({ v: 'st' as 'st' | 'md' }))
const goiSt = vi.hoisted(() => ({ listLanLoi: 0 }))

vi.mock('next/navigation', () => ({ useRouter: () => ({}), notFound: () => { throw new Error('Not found') } }))
vi.mock('@/app/actions', () => ({
  getTicket: async () => ticket,
  groupsOfTicket: async () => [],
  listTicketNotes: async () => [{ id: 'nk-1', noi_dung: 'Đã gọi khách lần đầu', created_at: '2026-11-24T08:00:00Z' }],
  ticketsOfSerial: async () => [
    ticket,
    { ...ticket, ticket_code: 'TK-2611-008', created_at: '2026-11-18T02:00:00Z' },
    { ...ticket, ticket_code: 'TK-2611-004', created_at: '2026-11-16T02:00:00Z', cs_phu_trach: 'staff-2' },
  ],
  ticketsOfCustomer: async () => [{ ...ticket, ticket_code: 'TK-2611-006', created_at: '2026-11-17T02:00:00Z' }],
  listTicketItems: async () => [],
  listCatalogItems: async () => [],
  ticketTypes: async () => ['Rò nước'],
}))
vi.mock('@/lib/nen-tang/nhan-su', () => ({ listStaff: async () => [] }))
vi.mock('@/lib/nen-tang/phien', () => ({ layNhanVien: async () => ({ id: 'staff-1' }) }))
vi.mock('@/lib/nen-tang/kiem-quyen', () => ({ hoiQuyen: async () => quyen }))
vi.mock('@/lib/nen-tang/sua-danh-sach-server', () => ({ coSuaDanhSach: async () => false }))
vi.mock('@/lib/cskh/nguon', () => ({ cskhNguon: () => nguon.v }))
vi.mock('@/app/ticket/loi-actions', () => ({
  dongMayCuaTicket: async () => nguon.v === 'md'
    ? [{ id: 'r2', ticket_code: 'TK-2611-042', thu_tu: 2, serial: 'TEST-001', source_serial: null, internal_code: null, loi_code: 'E3', loi_ten: 'Lỗi E3',
        mo_ta: 'Khách báo lại (MD)', huong_xu_ly: null, huong_xu_ly_nguon: null, trang_thai: 'cho_xu_ly', nguon: 'app', created_at: '2026-11-25T02:00:00Z' }]
    : [],
  danhMucLoi: async () => [],
}))
vi.mock('@/app/ticket/lan-loi-md-actions', () => ({
  listLanLoiMd: async () => [
    { id: 'r1', report_no: 1, serial: 'TEST-001', issue_code: 'E3', issue_name: 'Lỗi E3', reported_on: '2026-11-23', customer_said: 'Nước rò', handling: null, status: 'da_xu_ly', created_by: null },
    { id: 'r2', report_no: 2, serial: 'TEST-001', issue_code: 'E3', issue_name: 'Lỗi E3', reported_on: '2026-11-25', customer_said: 'Khách báo lại (MD)', handling: null, status: 'cho_xu_ly', created_by: null },
  ],
  docLanLoi: async () => ({ md: true, ds: [] }), themLanLoiMd: async () => ({ ok: true }), suaLanLoiMd: async () => ({ ok: true }),
}))
vi.mock('@/app/ticket/lan-loi-actions', () => ({ listLanLoi: async () => (goiSt.listLanLoi++, [
  {
    id: 'lan-2', lan: 2, ngay: '2026-11-25', created_at: '2026-11-25T02:00:00Z',
    mo_ta: 'Khách báo lại', xu_ly: 'Đã thay gioăng',
  },
]) }))
vi.mock('@/app/ticket/tep-actions', () => ({ listTepNhatKy: async () => [] }))
vi.mock('@/app/ticket/dau-ticket-actions', () => ({ docThemTicket: async () => ({ ngay_bao: '2026-11-23', cs_theo_doi: null }) }))
vi.mock('@/app/ticket/nguoi-actions', () => ({ docNguoiTicket: async () => null }))

const ticket: Ticket = {
  ticket_code: 'TK-2611-042', state: 'Open', ticket_type: 'Rò nước',
  description: 'Nước rò đáy máy', last_note: null, khan: false,
  created_at: '2026-11-23T02:00:00Z', province: 'Hà Nội',
  serial: 'TEST-001', source_serial: 'TEST-001', product_name: 'Máy mẫu', internal_code: null,
  may_khong_trong_he_thong: false, customer_id: 'khach-mau', customer_name: 'Khách mẫu',
  primary_phone: '0900000000', warranty_activated: null, warranty_full_end: null,
  con_han_may: null, con_han_loi: null, cs_phu_trach: 'staff-1', ky_thuat: null,
  cs_ten: 'Nhân viên mẫu', ky_thuat_ten: null,
}

async function moTicket() {
  return renderToStaticMarkup(await TicketPage({
    params: Promise.resolve({ code: ticket.ticket_code }),
    searchParams: Promise.resolve({}),
  }))
}

describe('Chi tiết ticket ở đường dẫn mặc định', () => {
  it('dùng giao diện mới, hiện lần báo mới nhất và giữ đường dẫn hẹn kỹ thuật', async () => {
    const html = await moTicket()
    expect(html).toContain('TK-2611-042 · Rò nước')
    expect(html).toContain('Khách báo lại')
    expect(html).toContain('Đã thay gioăng')
    expect(html).toContain('/ticket/TK-2611-008')
    expect(html).toContain('/ticket/TK-2611-006')
    expect(html).toContain('Đã gọi khách lần đầu')
    // Các lần lỗi xếp theo thời gian, mở sẵn hết: Lần 1 trước, lần mới nằm dưới.
    expect(html.indexOf('Lần 1')).toBeLessThan(html.indexOf('Lần 2'))
    expect(html).toContain('/ky-thuat?kh=khach-mau&amp;loai=ticket&amp;ref=TK-2611-042')
  })

  it('mở sẵn khối Chi phí và khối khách/máy — thấy nút Nhận việc ngay khi ticket chưa ai nhận', async () => {
    ticket.cs_phu_trach = null
    quyen.chiPhi = false
    try {
      const html = await moTicket()
      expect(html).toContain('Nhận việc')
      expect(html).toContain('Chưa có mục nào.')
      expect(html).toContain('0900000000')
    } finally {
      ticket.cs_phu_trach = 'staff-1'
      quyen.chiPhi = true
    }
  })

  it('máy không có trong hệ thống: giải thích Odoo ghi máy là tồn kho', async () => {
    ticket.may_khong_trong_he_thong = true
    try {
      expect(await moTicket()).toContain('Odoo đang ghi máy là tồn kho dù nó có ticket')
    } finally {
      ticket.may_khong_trong_he_thong = false
    }
  })

  it('chỉ hiện ticket liên quan trong phạm vi phân công của người xem', async () => {
    quyen.xemTatCa = false
    try {
      const html = await moTicket()
      expect(html).toContain('/ticket/TK-2611-008')
      expect(html).not.toContain('/ticket/TK-2611-004')
    } finally {
      quyen.xemTatCa = true
    }
  })

  it('ẩn thao tác sửa và hẹn với người không có quyền', async () => {
    Object.assign(quyen, { sua: false, lichKT: false, chiPhi: false, xemKhach: false })
    try {
      const html = await moTicket()
      expect(html).toContain('TK-2611-042 · Rò nước')
      expect(html).not.toContain('Sửa loại / lần 1')
      expect(html).not.toContain('Thêm lần lỗi mới')
      expect(html).not.toContain('/ky-thuat?')
      expect(html).not.toContain('/ticket/TK-2611-006')
    } finally {
      Object.assign(quyen, { sua: true, lichKT: true, chiPhi: true, xemKhach: true })
    }
  })
})

describe('Chi tiết ticket khi CSKH_NGUON=md', () => {
  it('lần lỗi đọc MD (thẻ như Xem nhanh), không đọc ticket_lan_loi ST; máy & lỗi chỉ xem, một dòng mỗi máy', async () => {
    nguon.v = 'md'
    goiSt.listLanLoi = 0
    try {
      const html = await moTicket()
      expect(html).toContain('data-nguon="md"')
      expect(html).toContain('Các lần lỗi · 2')
      expect(goiSt.listLanLoi).toBe(0)
      // TicketEditor (ghi lần 1 / loại / lần 2+ vào ST) không có ở md.
      expect(html).not.toContain('Sửa loại / lần 1')
      expect(html).not.toContain('Đã thay gioăng')
      // Máy & lỗi: chỉ xem + ghi chú, không nút ghi ticket_may ST; trạng thái "Chờ xử lý" không bị đổi thành "Đang xử lý".
      expect(html).toContain('chỉ xem')
      expect(html).toContain('Chờ xử lý')
      expect(html).not.toContain('Sửa dòng')
      expect(html).not.toContain('＋ Thêm máy')
    } finally {
      nguon.v = 'st'
    }
  })

  it('st: vẫn TicketEditor + nút sửa dòng máy như cũ', async () => {
    const html = await moTicket()
    expect(html).not.toContain('data-nguon="md"')
    expect(html).toContain('Sửa loại / lần 1')
    expect(html).toContain('＋ Thêm máy')
  })
})
