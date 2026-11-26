// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/ticket',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}))

import { ThanhDangLoc } from './ThanhDangLoc'

test('mặc định vẫn hiện dòng "N <nhan>"', () => {
  render(<ThanhDangLoc dieuKien={[]} hienThi={3} tong={3} nhan="ticket" />)
  expect(screen.getByText('3 ticket')).toBeTruthy()
})

test('anSoDong: không chip / sắp / nút phải → không vẽ thanh (CEO 26/11 "bỏ vì thừa")', () => {
  const { container } = render(<ThanhDangLoc dieuKien={[]} hienThi={3} tong={3} nhan="ticket" anSoDong />)
  expect(container.innerHTML).toBe('')
})

test('anSoDong + đang lọc: giữ chip và "Xoá lọc", bỏ dòng đếm', () => {
  render(<ThanhDangLoc dieuKien={[{ nhan: 'Tỉnh', giaTri: 'Demo' }]} hienThi={2} tong={9} nhan="ticket" anSoDong />)
  expect(screen.getByText('Xoá lọc')).toBeTruthy()
  expect(screen.queryByText(/ticket$/)).toBeNull()
})
