// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

function Mau() {
  return (
    <DsRoot theme="dark">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bộ lọc</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Bộ lọc nâng cao</SheetTitle>
            <SheetDescription>Áp dụng cho danh sách đơn.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <label>
              <input type="checkbox" /> Chờ xử lý
            </label>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="ghost">Xoá lọc</Button>
            </SheetClose>
            <Button>Áp dụng</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DsRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Bộ lọc' })

test('mở → role="dialog" trong vùng DS tối, tên/mô tả trỏ đúng, overlay cũng trong ô portal', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  expect(hop.closest('[data-ds-portal]')).not.toBeNull()
  expect(hop.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(document.getElementById(hop.getAttribute('aria-labelledby')!)?.textContent).toBe('Bộ lọc nâng cao')
  expect(document.getElementById(hop.getAttribute('aria-describedby')!)?.textContent).toBe('Áp dụng cho danh sách đơn.')
  expect(document.querySelector('[data-slot="sheet-overlay"]')?.closest('[data-ds-portal]')).not.toBeNull()
})

test('Esc đóng và trả focus về trigger', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const nut = trigger()
  await user.click(nut)
  await screen.findByRole('dialog')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(nut)
})

test('nút ✕ (aria-label "Đóng") đóng và trả focus về trigger', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const nut = trigger()
  await user.click(nut)
  await user.click(await screen.findByRole('button', { name: 'Đóng' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(nut)
})

test('bấm overlay đóng và trả focus về trigger', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const nut = trigger()
  await user.click(nut)
  await screen.findByRole('dialog')
  await user.click(document.querySelector<HTMLElement>('[data-slot="sheet-overlay"]')!)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(nut)
})

test('nút ✕ đứng ngay sau header trong DOM (như preview) → Tab đầu tiên vào ✕, rồi thân, rồi footer; không rời sheet', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  const dong = screen.getByRole('button', { name: 'Đóng' })
  const thuTu = [...hop.querySelectorAll('[data-slot]')].map((e) => e.getAttribute('data-slot'))
  expect(thuTu.indexOf('sheet-header')).toBeLessThan(thuTu.indexOf('sheet-body'))
  expect(hop.querySelector('[data-slot="sheet-header"]')!.nextElementSibling).toBe(dong)
  for (let i = 0; i < 8; i++) {
    await user.tab()
    expect(hop.contains(document.activeElement)).toBe(true)
  }
})

test('khung: panel cột flex; thân giãn + cuộn (flex-1 overflow-y-auto); header/footer không cuộn, không co', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  expect(hop.className).toMatch(/(^| )flex( |$)/)
  expect(hop.className).toContain('flex-col')
  const than = hop.querySelector('[data-slot="sheet-body"]')!
  expect(than.className).toContain('overflow-y-auto')
  expect(than.className).toContain('flex-1')
  for (const slot of ['sheet-header', 'sheet-footer']) {
    const el = hop.querySelector(`[data-slot="${slot}"]`)!
    expect(el.className).not.toContain('overflow')
    expect(el.className).toContain('shrink-0')
  }
})

test('khổ ≤640 (y mốc @media max-width 640 của Dialog) panel rộng 100%; ≥ thì min(384px, 100%); z-70 như thang z', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  expect(hop.className).toContain('w-[min(384px,100%)]')
  expect(hop.className).toContain('[@media(max-width:640px)]:w-full')
  expect(hop.className).toContain('z-70')
})

test('SheetClose trong footer đóng sheet', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  await user.click(await screen.findByRole('button', { name: 'Xoá lọc' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})
