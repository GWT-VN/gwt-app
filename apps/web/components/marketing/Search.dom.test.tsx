// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import Search from './Search'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

test('thông báo tìm kiếm rỗng mà không báo đang mở danh sách', async () => {
  const user = userEvent.setup()
  render(<Search index={[{ href: '/wiki', title: 'Wiki GWT', kind: 'Trang' }]} />)
  const input = screen.getByRole('combobox')
  await user.type(input, 'không có')
  expect(screen.getByRole('status').textContent).toContain('Không thấy gì khớp')
  expect(input.getAttribute('aria-expanded')).toBe('false')
})
