// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, expect, test } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'

function Mau({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <DsRoot theme="dark">
      <Drawer autoFocus={autoFocus}>
        <DrawerTrigger asChild>
          <Button variant="outline">Chọn kho</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Chọn kho xuất</DrawerTitle>
            <DrawerDescription>Áp dụng cho phiếu đang mở.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Kho Hà Nội</Button>
            <DrawerClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DsRoot>
  )
}

// vaul đọc window.matchMedia (vuốt trên Safari/iOS) — jsdom không có.
beforeAll(() => {
  window.matchMedia ??= (q: string) =>
    ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList
})

const mo = () => screen.getByRole('button', { name: 'Chọn kho' })

/**
 * Đóng: jsdom áp CSS vaul chèn (`animation-name: slideToBottom` khi data-state=closed) nhưng không chạy animation, cũng
 * không có AnimationEvent → Presence của Radix chờ `animationend` mãi. Test tắt animation như khi giảm chuyển động
 * (`motion-reduce:animate-none!` của DS — jsdom không khớp media query đó) → Presence gỡ ngay khi đóng.
 */
beforeAll(() => {
  const s = document.createElement('style')
  s.textContent = '[data-vaul-drawer],[data-vaul-overlay]{animation:none!important}'
  document.head.appendChild(s)
})

async function choDong(hop: HTMLElement) {
  await waitFor(() => expect(hop.getAttribute('data-state')).toBe('closed'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

test('mở → role="dialog" trong ô portal vùng DS tối, tên/mô tả trỏ đúng, hướng mặc định bottom, z-70', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(mo())
  const hop = await screen.findByRole('dialog')
  expect(hop.closest('[data-ds-portal]')).not.toBeNull()
  expect(hop.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(hop.getAttribute('data-slot')).toBe('drawer-content')
  expect(hop.getAttribute('data-vaul-drawer-direction')).toBe('bottom')
  expect(document.getElementById(hop.getAttribute('aria-labelledby')!)?.textContent).toBe('Chọn kho xuất')
  expect(document.getElementById(hop.getAttribute('aria-describedby')!)?.textContent).toBe('Áp dụng cho phiếu đang mở.')
  expect(hop.className).toMatch(/(^| )z-70( |$)/)
  const phu = document.querySelector('[data-slot="drawer-overlay"]')!
  expect(phu.closest('[data-ds-portal]')).not.toBeNull()
  expect(phu.className).toMatch(/(^| )z-70( |$)/)
})

test('autoFocus mặc định BẬT (vaul mặc định tắt): mở → focus vào trong ngăn', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(mo())
  const hop = await screen.findByRole('dialog')
  await waitFor(() => expect(hop.contains(document.activeElement)).toBe(true))
})

test('Esc đóng và trả focus về nút mở', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const nut = mo()
  await user.click(nut)
  const hop = await screen.findByRole('dialog')
  await waitFor(() => expect(hop.contains(document.activeElement)).toBe(true))
  await user.keyboard('{Escape}')
  await choDong(hop)
  await waitFor(() => expect(document.activeElement).toBe(nut))
})

test('DrawerClose đóng ngăn', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(mo())
  const hop = await screen.findByRole('dialog')
  await user.click(screen.getByRole('button', { name: 'Huỷ' }))
  await choDong(hop)
})
