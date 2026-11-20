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
import { menuItem } from './menu-styles'

function Mau({ onXem = () => {}, onChuyen = () => {} }: { onXem?: () => void; onChuyen?: () => void }) {
  const [ma, setMa] = useState(true)
  const [bh, setBh] = useState(false)
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
          <DropdownMenuCheckboxItem disabled checked={bh} onCheckedChange={setBh}>
            Bảo hành (không có quyền)
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

test('chuột nằm trên X rồi ↓ sang Y → chỉ Y sáng (nền chỉ đi theo data-highlighted, không theo :hover)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const xem = await screen.findByRole('menuitem', { name: /Xem chi tiết/ })
  await user.hover(xem)
  await waitFor(() => expect(xem.hasAttribute('data-highlighted')).toBe(true))
  await user.keyboard('{ArrowDown}')
  const sua = screen.getByRole('menuitem', { name: 'Sửa' })
  expect(sua.hasAttribute('data-highlighted')).toBe(true)
  expect(document.querySelectorAll('[data-highlighted]')).toHaveLength(1)
  // Không có đường tô nền nào theo :hover — nếu có, X (chuột vẫn nằm trên) sáng cùng lúc với Y.
  expect(menuItem.split(' ').filter((c) => /hover:bg/.test(c))).toEqual([])
})

test('APG: item disabled vẫn focus được — ↓ dừng ở nó, Enter không gọi onSelect, menu vẫn mở, tên đọc kèm lý do', async () => {
  const user = userEvent.setup()
  const onChuyen = vi.fn()
  render(<Mau onChuyen={onChuyen} />)
  trigger().focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement?.textContent).toContain('Xem chi tiết'))
  await user.keyboard('{ArrowDown}{ArrowDown}')
  const chuyen = screen.getByRole('menuitem', { name: 'Chuyển kho (không có quyền)' })
  expect(document.activeElement).toBe(chuyen)
  expect(chuyen.getAttribute('aria-disabled')).toBe('true')
  expect(chuyen.hasAttribute('data-disabled')).toBe(true)
  expect(chuyen.hasAttribute('data-highlighted')).toBe(true)
  await user.keyboard('{Enter}')
  expect(onChuyen).not.toHaveBeenCalled()
  expect(screen.queryByRole('menu')).not.toBeNull()
})

test('APG: gõ chữ đầu (typeahead) dừng ở item disabled', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  trigger().focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement?.textContent).toContain('Xem chi tiết'))
  await user.keyboard('c')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Chuyển kho (không có quyền)'))
})

test('checkbox item disabled: focus được, bấm/Enter không đổi aria-checked, menu vẫn mở', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const bh = await screen.findByRole('menuitemcheckbox', { name: 'Bảo hành (không có quyền)' })
  expect(bh.getAttribute('aria-disabled')).toBe('true')
  await user.click(bh)
  expect(bh.getAttribute('aria-checked')).toBe('false')
  bh.focus()
  await user.keyboard('{Enter}')
  expect(bh.getAttribute('aria-checked')).toBe('false')
  expect(screen.queryByRole('menu')).not.toBeNull()
})

test('item disabled: onClick của bên gọi không chạy; asChild <a href> bấm/Enter không điều hướng (preventDefault)', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(
    <DsRoot>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Mở">⋯</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onClick={onClick}>
            Chuyển kho (không có quyền)
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled>
            <a href="#chi-tiet">Xem chi tiết (không có quyền)</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>,
  )
  await user.click(screen.getByRole('button', { name: 'Mở' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Chuyển kho (không có quyền)' }))
  expect(onClick).not.toHaveBeenCalled()
  const a = screen.getByRole('menuitem', { name: 'Xem chi tiết (không có quyền)' })
  const bat: boolean[] = []
  a.addEventListener('click', (e) => queueMicrotask(() => bat.push(e.defaultPrevented)))
  await user.click(a)
  a.focus()
  await user.keyboard('{Enter}')
  expect(bat.length).toBeGreaterThanOrEqual(2)
  expect(bat.every(Boolean)).toBe(true)
  expect(location.hash).toBe('')
  expect(screen.queryByRole('menu')).not.toBeNull()
})

test('menu dài ở khung nhìn thấp: khung menu có trần cao min(420px, 100vh−16) + cuộn dọc (.b-noi bundle.css)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(screen.getByRole('button', { name: 'Thao tác với đơn' }))
  const menu = await screen.findByRole('menu')
  expect(menu.className).toContain('max-h-[min(420px,calc(100vh-16px))]')
  expect(menu.className).toContain('overflow-y-auto')
})
