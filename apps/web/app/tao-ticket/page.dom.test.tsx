// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import TaoTicketPage from './page'

const { createTicket, machinesOfCustomer, listStaff, docNguoiTicket, push } = vi.hoisted(() => ({
  createTicket: vi.fn(async () => ({ ok: true, code: 'T-001', canhBao: 'Kiểm tra serial' })),
  machinesOfCustomer: vi.fn(async () => []),
  listStaff: vi.fn(async (): Promise<{ id: string; ten: string }[]> => [{ id: 'cs-1', ten: 'CS A' }]),
  docNguoiTicket: vi.fn(async (): Promise<{ kt: { id: string; ten: string; hoat_dong: boolean; la_ctv?: boolean }[] } | null> => null),
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/app/actions', () => ({
  createTicket,
  machinesOfCustomer,
  searchCustomers: async () => [{ id: 'kh-1', full_name: 'Khách A' }],
  ticketTypes: async () => ['Rò nước'],
  taoKhachChoDuyet: vi.fn(),
  timKhachTheoSdt: vi.fn(),
}))
vi.mock('@/app/ticket/loi-actions', () => ({ danhMucLoi: async () => [], traKhachVaMay: async () => [{ id: 'kh-2', full_name: 'Khách B', primary_phone: null, may: [] }], traSerial: vi.fn() }))
vi.mock('@/app/ticket/nguoi-actions', () => ({ docNguoiTicket, ganKyThuat: vi.fn() }))
vi.mock('@/lib/nen-tang/nhan-su', () => ({
  listStaff,
  currentStaff: async () => ({ id: 'cs-1' }),
}))

afterEach(() => vi.unstubAllGlobals())

test('the v2 ticket form keeps required fields and navigates to the ticket after saving', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const u = userEvent.setup()
  const { container } = render(await TaoTicketPage())
  expect(container.querySelector('[data-ds="v2"] form[data-slot="form-layout"]')).not.toBeNull()

  const save = screen.getByRole<HTMLButtonElement>('button', { name: 'Tạo ticket' })
  expect(save.disabled).toBe(true)
  const moTa = screen.getByRole('textbox', { name: 'Mô tả sự cố' })
  const serial = screen.getByRole('textbox', { name: 'Serial máy 1' })
  expect(moTa.compareDocumentPosition(serial) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Tra máy theo khách hàng' })).toBeNull()
  await u.click(screen.getByRole('button', { name: 'Tra khách kèm máy' }))
  expect(screen.getByRole('button', { name: 'Tra máy theo khách hàng' })).toBeTruthy()
  await u.click(screen.getByRole('button', { name: 'Tra khách kèm máy' }))
  await u.type(screen.getByRole('textbox', { name: 'Tìm khách hàng' }), 'Khách A')
  const ketQua = await screen.findByRole('button', { name: 'Khách A' })
  await u.tab()
  expect(document.activeElement).toBe(ketQua)
  await u.keyboard('{Enter}')
  expect(machinesOfCustomer).toHaveBeenCalledWith('kh-1')
  fireEvent.change(screen.getByRole('combobox', { name: 'Loại ticket' }), { target: { value: 'Rò nước' } })
  expect(save.disabled).toBe(true)
  await u.type(screen.getByRole('textbox', { name: 'Mô tả sự cố' }), 'Rò tại van')
  await u.type(screen.getByRole('textbox', { name: 'Mô tả lỗi máy 1' }), '{Enter}')
  expect(createTicket).not.toHaveBeenCalled()
  await u.click(save)

  expect(createTicket).toHaveBeenCalledWith(expect.objectContaining({
    customer_id: 'kh-1', ticket_type: 'Rò nước', description: 'Rò tại van', cs_phu_trach: 'cs-1', dong_may: [],
  }))
  expect(push).toHaveBeenCalledWith('/ticket/T-001?canhBao=Ki%E1%BB%83m%20tra%20serial')
})


test('long assignment lists can be searched, and technicians exclude inactive profiles', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  listStaff.mockResolvedValueOnce(Array.from({ length: 12 }, (_, i) => ({ id: 'cs-' + (i + 1), ten: 'CS ' + (i + 1) })))
  docNguoiTicket.mockResolvedValueOnce({ kt: [
    ...Array.from({ length: 12 }, (_, i) => ({ id: 'kt-' + (i + 1), ten: 'Thợ ' + (i + 1), hoat_dong: true, la_ctv: true })),
    { id: 'kt-nghi', ten: 'Đã nghỉ', hoat_dong: false },
  ] })
  const u = userEvent.setup()
  render(await TaoTicketPage())
  await u.click(screen.getByRole('button', { name: 'Bỏ chọn CS 1' }))
  await u.click(screen.getByRole('button', { name: 'CS phụ trách' }))
  await u.keyboard('cs 12')
  await u.click(await screen.findByRole('option', { name: 'CS 12' }))
  expect(screen.getByRole('button', { name: 'CS phụ trách CS 12' })).toBeTruthy()

  await u.click(screen.getByRole('button', { name: 'Kỹ thuật phụ trách' }))
  expect(screen.queryByRole('option', { name: 'Đã nghỉ' })).toBeNull()
  const list = await screen.findByRole('listbox')
  await u.click(within(list).getByRole('option', { name: 'Thợ 12 (CTV)' }))
  expect(screen.getByRole('button', { name: 'Kỹ thuật phụ trách Thợ 12 (CTV)' })).toBeTruthy()
})

test('tra khách kèm máy thay đúng khách đang hiện và đổi khách chặn lưu với ID cũ', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  const u = userEvent.setup()
  render(await TaoTicketPage())
  await u.type(screen.getByRole('textbox', { name: 'Tìm khách hàng' }), 'Khách A')
  await u.click(await screen.findByRole('button', { name: 'Khách A' }))

  await u.click(screen.getByRole('button', { name: 'Tra khách kèm máy' }))
  await u.click(screen.getByRole('button', { name: 'Tra máy theo khách hàng' }))
  await u.keyboard('Khach B')
  await u.click(await screen.findByRole('option', { name: /Khách B/ }))
  expect(screen.getByText('Khách B — chưa có máy')).toBeTruthy()
  expect(screen.queryByText('Khách A')).toBeNull()
  expect(machinesOfCustomer).toHaveBeenLastCalledWith('kh-2')

  fireEvent.change(screen.getByRole('combobox', { name: 'Loại ticket' }), { target: { value: 'Rò nước' } })
  await u.type(screen.getByRole('textbox', { name: 'Mô tả sự cố' }), 'Rò tại van')
  const save = screen.getByRole<HTMLButtonElement>('button', { name: 'Tạo ticket' })
  expect(save.disabled).toBe(false)
  await u.click(screen.getByRole('button', { name: 'Đổi khách' }))
  expect(save.disabled).toBe(true)
})
