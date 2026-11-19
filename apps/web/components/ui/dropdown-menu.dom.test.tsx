// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

function Mau({ onXem = () => {}, onChuyen = () => {} }: { onXem?: () => void; onChuyen?: () => void }) {
  const [ma, setMa] = useState(true)
  return (
    <DsRoot theme="dark">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Thao tác với đơn">
            ⋯
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Đơn DH-DEMO-0001</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onXem}>
            Xem chi tiết<DropdownMenuShortcut>Enter</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Sửa</DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onChuyen}>
            Chuyển kho (không có quyền)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Xoá đơn</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={ma} onCheckedChange={setMa}>
            Mã đơn
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Thao tác với đơn' })

test('bấm trigger → role="menu" nằm TRONG vùng [data-ds="v2"] (portal vào ô của DsRoot), theme tối', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const nut = trigger()
  await user.click(nut)
  const menu = await screen.findByRole('menu')
  expect(menu.closest('[data-ds-portal]')).not.toBeNull()
  expect(menu.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  // Menu modal ẩn phần còn lại khỏi cây a11y → giữ tham chiếu nút từ trước khi mở.
  expect(nut.getAttribute('aria-expanded')).toBe('true')
})

test('mở bằng phím → focus item đầu; ↓ sang item kế (bỏ qua nhãn)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  trigger().focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement?.textContent).toContain('Xem chi tiết'))
  await user.keyboard('{ArrowDown}')
  expect(document.activeElement?.textContent).toBe('Sửa')
})

test('Esc đóng menu và trả focus về trigger', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  await screen.findByRole('menu')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(trigger())
})

test('item chặn quyền: vẫn hiện, aria-disabled, bấm không gọi onSelect; item thường thì gọi', async () => {
  const user = userEvent.setup()
  const onXem = vi.fn()
  const onChuyen = vi.fn()
  render(<Mau onXem={onXem} onChuyen={onChuyen} />)
  await user.click(trigger())
  const chuyen = await screen.findByRole('menuitem', { name: 'Chuyển kho (không có quyền)' })
  expect(chuyen.getAttribute('aria-disabled')).toBe('true')
  await user.click(chuyen)
  expect(onChuyen).not.toHaveBeenCalled()
  expect(screen.queryByRole('menu')).not.toBeNull()
  await user.click(screen.getByRole('menuitem', { name: /Xem chi tiết/ }))
  expect(onXem).toHaveBeenCalledOnce()
})

test('item xoá mang data-variant="destructive"', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  expect((await screen.findByRole('menuitem', { name: 'Xoá đơn' })).getAttribute('data-variant')).toBe('destructive')
})

test('checkbox item đổi aria-checked; ✓ chỉ có khi đang bật', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const ma = await screen.findByRole('menuitemcheckbox', { name: 'Mã đơn' })
  expect(ma.getAttribute('aria-checked')).toBe('true')
  expect(ma.querySelector('svg')).not.toBeNull()
  await user.click(ma)
  await user.click(trigger())
  const ma2 = await screen.findByRole('menuitemcheckbox', { name: 'Mã đơn' })
  expect(ma2.getAttribute('aria-checked')).toBe('false')
  expect(ma2.querySelector('svg')).toBeNull()
})
