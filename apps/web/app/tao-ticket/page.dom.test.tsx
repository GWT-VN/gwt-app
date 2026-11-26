// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import TaoTicketPage from './page'

const { createTicket, machinesOfCustomer, push } = vi.hoisted(() => ({
  createTicket: vi.fn(async () => ({ ok: true, code: 'T-001', canhBao: 'Kiểm tra serial' })),
  machinesOfCustomer: vi.fn(async () => []),
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
vi.mock('@/app/ticket/loi-actions', () => ({ danhMucLoi: async () => [], traKhachVaMay: vi.fn(), traSerial: vi.fn() }))
vi.mock('@/app/ticket/nguoi-actions', () => ({ docNguoiTicket: async () => null, ganKyThuat: vi.fn() }))
vi.mock('@/lib/nen-tang/nhan-su', () => ({
  listStaff: async () => [{ id: 'cs-1', ten: 'CS A' }],
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
  await u.type(screen.getByPlaceholderText('Tìm khách theo tên hoặc SĐT…'), 'Khách A')
  await u.click(await screen.findByRole('button', { name: 'Khách A' }))
  expect(machinesOfCustomer).toHaveBeenCalledWith('kh-1')
  fireEvent.change(screen.getByRole('combobox', { name: 'Loại ticket' }), { target: { value: 'Rò nước' } })
  expect(save.disabled).toBe(true)
  await u.type(screen.getByRole('textbox', { name: 'Mô tả sự cố' }), 'Rò tại van')
  await u.click(save)

  expect(createTicket).toHaveBeenCalledWith(expect.objectContaining({
    customer_id: 'kh-1', ticket_type: 'Rò nước', description: 'Rò tại van', cs_phu_trach: 'cs-1', dong_may: [],
  }))
  expect(push).toHaveBeenCalledWith('/ticket/T-001?canhBao=Ki%E1%BB%83m%20tra%20serial')
})
