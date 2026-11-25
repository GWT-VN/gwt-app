// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

// URL giả: router.replace ghi vào `url`, useSearchParams đọc ra — đổi `url` rồi rerender = URL đổi từ ngoài.
let url = new URLSearchParams()
const replace = vi.fn((href: string) => {
  url = new URLSearchParams(href.split('?')[1] ?? '')
})
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/work',
  useSearchParams: () => url,
}))

import { OTimKiem } from './OTimKiem'

beforeEach(() => {
  url = new URLSearchParams('q=zzz')
  replace.mockClear()
})
afterEach(() => vi.useRealTimers())

const o = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'Tìm' })

test('URL bỏ `q` từ ngoài (Xoá lọc, nút + Việc mới) → ô xoá theo, KHÔNG ghi ngược q cũ lên URL', async () => {
  vi.useFakeTimers()
  const { rerender } = render(<OTimKiem placeholder="Tìm" />)
  expect(o().value).toBe('zzz')
  url = new URLSearchParams()
  rerender(<OTimKiem placeholder="Tìm" />)
  expect(o().value).toBe('')
  await act(async () => vi.advanceTimersByTime(400))
  expect(replace).not.toHaveBeenCalled()
})

test('URL về chậm với giá trị ô vừa ghi → không đè chữ người dùng gõ thêm', async () => {
  url = new URLSearchParams()
  const user = userEvent.setup()
  const { rerender } = render(<OTimKiem placeholder="Tìm" />)
  await user.type(o(), 'ab')
  await act(async () => new Promise((r) => setTimeout(r, 350)))
  expect(replace).toHaveBeenLastCalledWith('/work?q=ab')
  // Gõ thêm trong lúc URL "ab" mới về tới trang.
  await user.type(o(), 'c')
  rerender(<OTimKiem placeholder="Tìm" />)
  expect(o().value).toBe('abc')
})
