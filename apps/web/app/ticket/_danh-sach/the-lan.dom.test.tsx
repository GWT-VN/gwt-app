// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import type { Ticket } from '@/app/actions'

// Tab Lần lỗi (LanLoiThat → DsTheLan): nguồn MD thì sửa trên thẻ là lưu thật (suaLanLoiMd / themLanLoiMd); nguồn ST giữ
// hành vi cũ (chỉ trên màn, không gọi lưu).
const { docLanLoi, suaLanLoiMd, themLanLoiMd } = vi.hoisted(() => ({
  docLanLoi: vi.fn(),
  suaLanLoiMd: vi.fn(async () => ({ ok: true })),
  themLanLoiMd: vi.fn(async () => ({ ok: true, id: '99999999-9999-4999-8999-999999999999', report_no: 2 })),
}))
vi.mock('@/app/ticket/lan-loi-md-actions', () => ({ docLanLoi, suaLanLoiMd, themLanLoiMd }))
vi.mock('@/app/ticket/lan-loi-actions', () => ({ listLanLoi: vi.fn() }))
vi.mock('@/app/actions', () => ({}))
vi.mock('@/app/work/actions', () => ({}))
vi.mock('./ds-f', () => ({ TT: [] }))
vi.mock('@/components/ui/sonner', () => ({ thongBao: { xong: vi.fn(), loi: vi.fn(), dangChay: vi.fn(), dong: vi.fn() } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/ticket',
  useSearchParams: () => new URLSearchParams(),
}))

import { DsRoot } from '@/components/ui/ds-root'
import { LanLoiThat } from './the-tab'

// Menu Radix mở trong khung DS (portal) như app thật.
const mo = () => render(<DsRoot><LanLoiThat t={t} /></DsRoot>)

const MA = 'TK-DEMO-901'
const ID = '22222222-2222-4222-8222-222222222222'
const t = {
  ticket_code: MA, state: 'Open', created_at: '2026-11-20T02:00:00Z', description: 'Rò nước', last_note: null,
  ky_thuat_ten: null, cs_ten: 'CSKH',
} as unknown as Ticket
const lanMd = {
  id: ID, report_no: 1, serial: null, issue_code: 'CHUA_PHAN_LOAI', issue_name: 'Chưa phân loại', reported_on: '2026-11-20',
  customer_said: 'Rò nước', handling: null, status: 'cho_xu_ly', created_by: null,
}

beforeEach(() => {
  docLanLoi.mockReset()
  suaLanLoiMd.mockClear()
  themLanLoiMd.mockClear()
})

test('MD: đổi chip trạng thái → suaLanLoiMd(id, mã, { status: "da_xu_ly" })', async () => {
  docLanLoi.mockResolvedValue({ md: true, ds: [lanMd] })
  const user = userEvent.setup()
  mo()
  await user.click(await screen.findByRole('button', { name: 'Sửa trạng thái Lần 1' }))
  await user.click(await screen.findByRole('menuitemradio', { name: 'Đã xử lý' }))
  await waitFor(() => expect(suaLanLoiMd).toHaveBeenCalledWith(ID, MA, { status: 'da_xu_ly' }))
})

test('MD: trạng thái đọc từ DB, có "Không lỗi"', async () => {
  docLanLoi.mockResolvedValue({ md: true, ds: [{ ...lanMd, status: 'khong_loi' }] })
  mo()
  expect((await screen.findByRole('button', { name: 'Sửa trạng thái Lần 1' })).textContent).toBe('Không lỗi')
})

test('MD: rời ô Xử lý có thay đổi → lưu { handling }; rời mà không đổi → không gọi', async () => {
  docLanLoi.mockResolvedValue({ md: true, ds: [lanMd] })
  mo()
  const o = await screen.findByRole('textbox', { name: 'Xử lý lần 1' })
  fireEvent.focus(o)
  fireEvent.blur(o)
  expect(suaLanLoiMd).not.toHaveBeenCalled()
  fireEvent.change(o, { target: { value: 'Thay gioăng' } })
  fireEvent.blur(o)
  await waitFor(() => expect(suaLanLoiMd).toHaveBeenCalledWith(ID, MA, { handling: 'Thay gioăng' }))
  expect(suaLanLoiMd).toHaveBeenCalledTimes(1)
})

test('MD: Thêm lần lỗi → gõ Khách báo, rời ô → themLanLoiMd; sửa tiếp dùng id vừa tạo', async () => {
  docLanLoi.mockResolvedValue({ md: true, ds: [lanMd] })
  mo()
  fireEvent.click(await screen.findByRole('button', { name: 'Thêm lần lỗi' }))
  const khach = await screen.findByRole('textbox', { name: 'Khách báo lần 2' })
  fireEvent.change(khach, { target: { value: 'Lại rò' } })
  fireEvent.blur(khach)
  await waitFor(() => expect(themLanLoiMd).toHaveBeenCalledWith(MA, expect.objectContaining({ customer_said: 'Lại rò' })))
  const xuLy = screen.getByRole('textbox', { name: 'Xử lý lần 2' })
  fireEvent.change(xuLy, { target: { value: 'Siết khớp' } })
  fireEvent.blur(xuLy)
  await waitFor(() => expect(suaLanLoiMd).toHaveBeenCalledWith('99999999-9999-4999-8999-999999999999', MA, { handling: 'Siết khớp' }))
  expect(themLanLoiMd).toHaveBeenCalledTimes(1)
})

test('ST (mặc định): đổi trạng thái / rời ô chỉ trên màn — không gọi lưu MD', async () => {
  docLanLoi.mockResolvedValue({ md: false, ds: [] })
  const user = userEvent.setup()
  mo()
  const o = await screen.findByRole('textbox', { name: 'Xử lý lần 1' })
  fireEvent.change(o, { target: { value: 'abc' } })
  fireEvent.blur(o)
  await user.click(screen.getByRole('button', { name: 'Sửa trạng thái Lần 1' }))
  await user.click(await screen.findByRole('menuitemradio', { name: 'Đang xử lý' }))
  expect(suaLanLoiMd).not.toHaveBeenCalled()
  expect(themLanLoiMd).not.toHaveBeenCalled()
})
