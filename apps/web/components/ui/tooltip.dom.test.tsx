// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { Tooltip } from './tooltip'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

const ngu = (ms: number) => new Promise((r) => setTimeout(r, ms))

function Mau({ expanded }: { expanded?: boolean }) {
  return (
    <DsRoot theme="dark">
      <Tooltip content="Cài đặt hiển thị">
        <Button variant="ghost" size="icon" aria-label="Cài đặt" aria-expanded={expanded}>
          ⚙
        </Button>
      </Tooltip>
    </DsRoot>
  )
}

test('Tab tới nút → tooltip hiện đúng chữ, nằm TRONG vùng [data-ds="v2"] (portal vào ô của DsRoot)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cài đặt' }))
  const tip = await screen.findByRole('tooltip')
  expect(tip.textContent).toBe('Cài đặt hiển thị')
  expect(tip.closest('[data-ds-portal]')).not.toBeNull()
  expect(tip.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
})

test('rê chuột → hiện sau delay 300ms, không hiện ngay', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.hover(screen.getByRole('button', { name: 'Cài đặt' }))
  await ngu(150)
  expect(screen.queryByRole('tooltip')).toBeNull()
  expect((await screen.findByRole('tooltip')).textContent).toBe('Cài đặt hiển thị')
})

test('Esc đóng tooltip', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  await screen.findByRole('tooltip')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('nút đang aria-expanded="true" (đang mở menu) → hover lẫn focus phím đều không hiện tooltip', async () => {
  const user = userEvent.setup()
  render(<Mau expanded />)
  await user.tab()
  await user.hover(screen.getByRole('button', { name: 'Cài đặt' }))
  await ngu(450)
  expect(screen.queryByRole('tooltip')).toBeNull()
})

test('focus phím rồi trang cuộn (Tab tới nút ngoài khung nhìn → trình duyệt tự cuộn) → tooltip vẫn mở như :focus-visible', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.tab()
  await screen.findByRole('tooltip')
  fireEvent.scroll(document)
  await ngu(50)
  expect(screen.queryByRole('tooltip')).not.toBeNull()
  // Esc vẫn đóng được khi đang focus phím.
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('rê chuột (không focus) rồi cuộn → đóng như Radix mặc định', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.hover(screen.getByRole('button', { name: 'Cài đặt' }))
  await screen.findByRole('tooltip')
  fireEvent.scroll(document)
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('đang mở mà trigger chuyển aria-expanded false → true (menu vừa mở) → tooltip đóng', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<Mau expanded={false} />)
  await user.tab()
  await screen.findByRole('tooltip')
  rerender(<Mau expanded />)
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})

test('ghép thật với DropdownMenuTrigger: focus phím hiện tooltip; mở menu → tooltip ẩn', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <DropdownMenu>
        <Tooltip content="Mở thao tác cho đơn">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Thao tác">
              ⋯
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>,
  )
  await user.tab()
  expect((await screen.findByRole('tooltip')).textContent).toBe('Mở thao tác cho đơn')
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
})
