// @vitest-environment jsdom
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

function Mau({ onMo = () => {}, onDong = () => {}, onClickDong = () => {} }) {
  return (
    <DsRoot theme="dark">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div tabIndex={0} data-testid="dong">
            TK-DEMO-039 <input aria-label="Đổi hạn" /> <textarea aria-label="Ghi chú" />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Thao tác TK-DEMO-039">
          <ContextMenuLabel>TK-DEMO-039</ContextMenuLabel>
          <ContextMenuItem onSelect={onMo}>Mở ticket</ContextMenuItem>
          <ContextMenuItem>Sao chép mã</ContextMenuItem>
          <ContextMenuItem asChild disabled>
            <a href="#xem-nhanh">Xem nhanh (không có quyền)</a>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled onSelect={onDong} onClick={onClickDong}>
            Đóng ticket (không có quyền)
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DsRoot>
  )
}

const dong = () => screen.getByTestId('dong')

test('chuột phải vào dòng → role="menu" TRONG vùng [data-ds="v2"], dòng data-state="open", focus ở khung menu (không ở item)', async () => {
  render(<Mau />)
  fireEvent.contextMenu(dong(), { clientX: 40, clientY: 60 })
  const menu = await screen.findByRole('menu')
  expect(menu.closest('[data-ds-portal]')).not.toBeNull()
  expect(menu.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(dong().getAttribute('data-state')).toBe('open')
  expect(menu.className).toContain('w-[220px]')
  await waitFor(() => expect(document.activeElement).toBe(menu))
})

test('chuột phải trong <input>/<textarea> của dòng → không mở menu, KHÔNG chặn menu trình duyệt', () => {
  render(<Mau />)
  for (const o of [screen.getByLabelText('Đổi hạn'), screen.getByLabelText('Ghi chú')]) {
    const ev = createEvent.contextMenu(o)
    fireEvent(o, ev)
    expect(ev.defaultPrevented).toBe(false)
  }
  expect(screen.queryByRole('menu')).toBeNull()
  expect(dong().getAttribute('data-state')).toBe('closed')
})

test('Esc đóng menu và trả focus về dòng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  dong().focus()
  fireEvent.contextMenu(dong())
  await screen.findByRole('menu')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(dong())
  expect(dong().getAttribute('data-state')).toBe('closed')
})

test.each([
  ['Shift+F10', '{Shift>}{F10}{/Shift}'],
  ['phím Menu', '{ContextMenu}'],
])('%s trên dòng đang focus → mở menu, focus mục đầu', async (_, phim) => {
  const user = userEvent.setup()
  render(<Mau />)
  dong().focus()
  await user.keyboard(phim)
  await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Mở ticket'))
  expect(dong().getAttribute('data-state')).toBe('open')
})

test('Shift+F10 trong <input> của dòng → không mở menu DS, không chặn phím', () => {
  render(<Mau />)
  const o = screen.getByLabelText('Đổi hạn')
  o.focus()
  const ev = createEvent.keyDown(o, { key: 'F10', shiftKey: true })
  fireEvent(o, ev)
  expect(ev.defaultPrevented).toBe(false)
  expect(screen.queryByRole('menu')).toBeNull()
})

test('cuộn trang khi menu mở → menu đóng', async () => {
  render(<Mau />)
  fireEvent.contextMenu(dong())
  await screen.findByRole('menu')
  fireEvent.scroll(window)
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
})

test('bấm ra ngoài → menu đóng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  fireEvent.contextMenu(dong())
  await screen.findByRole('menu')
  await user.click(document.body)
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
})

test('item thường: bấm gọi onSelect và đóng menu', async () => {
  const user = userEvent.setup()
  const onMo = vi.fn()
  render(<Mau onMo={onMo} />)
  fireEvent.contextMenu(dong())
  await user.click(await screen.findByRole('menuitem', { name: 'Mở ticket' }))
  expect(onMo).toHaveBeenCalledOnce()
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
})

test('APG: item disabled vẫn hiện + focus được; bấm/Enter không gọi onSelect lẫn onClick, menu vẫn mở', async () => {
  const user = userEvent.setup()
  const onDong = vi.fn()
  const onClickDong = vi.fn()
  render(<Mau onDong={onDong} onClickDong={onClickDong} />)
  dong().focus()
  await user.keyboard('{Shift>}{F10}{/Shift}')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Mở ticket'))
  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
  const d = screen.getByRole('menuitem', { name: 'Đóng ticket (không có quyền)' })
  expect(document.activeElement).toBe(d)
  expect(d.getAttribute('aria-disabled')).toBe('true')
  await user.keyboard('{Enter}')
  await user.click(d)
  expect(onDong).not.toHaveBeenCalled()
  expect(onClickDong).not.toHaveBeenCalled()
  expect(screen.queryByRole('menu')).not.toBeNull()
})

test('APG: item disabled asChild <a href> → bấm và Enter không điều hướng (click bị preventDefault)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  fireEvent.contextMenu(dong())
  const a = await screen.findByRole('menuitem', { name: 'Xem nhanh (không có quyền)' })
  const ev = createEvent.click(a)
  fireEvent(a, ev)
  expect(ev.defaultPrevented).toBe(true)
  const bat: boolean[] = []
  a.addEventListener('click', (e) => queueMicrotask(() => bat.push(e.defaultPrevented)))
  a.focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(bat.length).toBeGreaterThan(0))
  expect(bat.every(Boolean)).toBe(true)
  expect(location.hash).toBe('')
})

test('phím Menu: contextmenu gốc trình duyệt bắn lúc nhả phím (vào item vừa focus) bị chặn; sau keyup thì không chặn nữa', async () => {
  render(<Mau />)
  dong().focus()
  fireEvent.keyDown(dong(), { key: 'ContextMenu' })
  await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Mở ticket'))
  const item = document.activeElement as HTMLElement
  fireEvent.keyUp(item, { key: 'ContextMenu' })
  const goc = createEvent.contextMenu(item)
  fireEvent(item, goc)
  expect(goc.defaultPrevented).toBe(true)
  await new Promise((r) => setTimeout(r, 10))
  const sau = createEvent.contextMenu(item)
  fireEvent(item, sau)
  expect(sau.defaultPrevented).toBe(false)
})

test('menu nổi trên mọi lớp: z-90 như .b-chuotphai / .b-noi của nguồn', async () => {
  render(<Mau />)
  fireEvent.contextMenu(dong())
  expect((await screen.findByRole('menu')).className).toContain('z-90')
})

const cho = (ms: number) => new Promise((r) => setTimeout(r, ms))

test('nhấn giữ (cảm ứng) trên dòng → mở menu; nhấn giữ trong <input>/<textarea> → KHÔNG mở', async () => {
  render(<Mau />)
  for (const o of [screen.getByLabelText('Đổi hạn'), screen.getByLabelText('Ghi chú')]) {
    fireEvent.pointerDown(o, { pointerType: 'touch' })
    await cho(800)
    expect(screen.queryByRole('menu')).toBeNull()
    fireEvent.pointerUp(o, { pointerType: 'touch' })
  }
  fireEvent.pointerDown(dong(), { pointerType: 'touch' })
  await cho(800)
  expect(screen.queryByRole('menu')).not.toBeNull()
})

test('phím Menu: rời cửa sổ (blur) trước khi nhả phím → gỡ listener chặn contextmenu', async () => {
  render(<Mau />)
  dong().focus()
  fireEvent.keyDown(dong(), { key: 'ContextMenu' })
  await screen.findByRole('menu')
  fireEvent.blur(window)
  await cho(10)
  const ev = createEvent.contextMenu(document.body)
  fireEvent(document.body, ev)
  expect(ev.defaultPrevented).toBe(false)
})

test('trigger disabled: Shift+F10 / phím Menu không preventDefault, không mở menu', () => {
  render(
    <DsRoot>
      <ContextMenu>
        <ContextMenuTrigger asChild disabled>
          <div tabIndex={0} data-testid="tat">
            TK-DEMO-040
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Mở ticket</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DsRoot>,
  )
  const t = screen.getByTestId('tat')
  t.focus()
  for (const init of [{ key: 'F10', shiftKey: true }, { key: 'ContextMenu' }]) {
    const ev = createEvent.keyDown(t, init)
    fireEvent(t, ev)
    expect(ev.defaultPrevented).toBe(false)
  }
  expect(screen.queryByRole('menu')).toBeNull()
})
