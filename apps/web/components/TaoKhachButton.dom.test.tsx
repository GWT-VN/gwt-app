// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { TaoKhachButton } from './TaoKhachButton'
import { DsRoot } from './ui/ds-root'

vi.mock('@/app/actions', () => ({ taoKhachChoDuyet: vi.fn(), traKhachChung: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const mo = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<DsRoot><TaoKhachButton kenh={[]} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: 'Tạo khách' }))
  return screen.getByRole('dialog', { name: 'Tạo khách mới' })
}

test('form trống: Esc đóng hộp ngay, không hỏi', async () => {
  const user = userEvent.setup()
  await mo(user)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.queryByRole('alertdialog')).toBeNull()
})

test('đã gõ: Esc hỏi "Bỏ thông tin đang nhập?" — Nhập tiếp giữ chữ, Bỏ thông tin mới đóng', async () => {
  const user = userEvent.setup()
  const hop = await mo(user)
  await user.type(within(hop).getByRole('textbox', { name: /Tên khách/ }), 'Chị Lan')
  await user.keyboard('{Escape}')
  const hoi = screen.getByRole('alertdialog', { name: 'Bỏ thông tin đang nhập?' })
  await user.click(within(hoi).getByRole('button', { name: 'Nhập tiếp' }))
  expect(screen.getByRole('textbox', { name: /Tên khách/ })).toHaveProperty('value', 'Chị Lan')

  await user.keyboard('{Escape}')
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Bỏ thông tin' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})
