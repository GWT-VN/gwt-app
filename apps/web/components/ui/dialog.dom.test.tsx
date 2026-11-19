// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { footer, panel } from './dialog-styles'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

function Mau() {
  return (
    <DsRoot theme="dark">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Mở Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Xoá đơn DH-DEMO-0001?</DialogTitle>
          <DialogDescription>Thao tác này không hoàn tác được.</DialogDescription>
          <DialogBody>
            <label htmlFor="ly-do">Lý do xoá</label>
            <input id="ly-do" />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              {/* Nút an toàn nhận focus khi mở (README artifact): autoFocus — Radix FocusScope giữ phần tử đã có focus. */}
              <Button variant="outline" autoFocus>
                Huỷ
              </Button>
            </DialogClose>
            <Button variant="destructive">Xoá đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DsRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Mở Dialog' })

test('mở → role="dialog" trong vùng DS tối, aria-labelledby/aria-describedby trỏ đúng tiêu đề/mô tả', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  expect(hop.closest('[data-ds-portal]')).not.toBeNull()
  expect(hop.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(document.getElementById(hop.getAttribute('aria-labelledby')!)?.textContent).toBe('Xoá đơn DH-DEMO-0001?')
  expect(document.getElementById(hop.getAttribute('aria-describedby')!)?.textContent).toBe(
    'Thao tác này không hoàn tác được.',
  )
  // Overlay cũng trong ô portal của DS (không ra document.body).
  expect(document.querySelector('[data-slot="dialog-overlay"]')?.closest('[data-ds-portal]')).not.toBeNull()
})

test('mở → focus nút an toàn (Huỷ), không phải ô nhập đầu tiên', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  await screen.findByRole('dialog')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Huỷ'))
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

test('bấm overlay đóng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  await screen.findByRole('dialog')
  await user.click(document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('Tab / Shift+Tab không rời dialog (vòng trong hộp)', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(trigger())
  const hop = await screen.findByRole('dialog')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Huỷ'))
  for (let i = 0; i < 6; i++) {
    await user.tab()
    expect(hop.contains(document.activeElement)).toBe(true)
  }
  for (let i = 0; i < 6; i++) {
    await user.tab({ shift: true })
    expect(hop.contains(document.activeElement)).toBe(true)
  }
})

test('showClose={false} → không có nút ✕', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Dialog defaultOpen>
        <DialogContent showClose={false}>
          <DialogTitle>Tiêu đề</DialogTitle>
          <DialogDescription>Mô tả</DialogDescription>
        </DialogContent>
      </Dialog>
    </DsRoot>,
  )
  await screen.findByRole('dialog')
  expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull()
  await user.keyboard('{Escape}')
})

test('kiểu dùng chung: ≤640px (y @media max-width 640 của bundle) panel rộng 100%−32, footer xếp dọc đảo + nút rộng hết', () => {
  expect(panel).toContain('[@media(max-width:640px)]:w-[calc(100%-32px)]')
  expect(panel).toContain('max-w-[450px]')
  expect(footer).toContain('[@media(max-width:640px)]:flex-col-reverse')
  expect(footer).toContain('[@media(max-width:640px)]:[&>[data-slot=button]]:w-full')
})
