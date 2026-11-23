// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DsRoot } from './ds-root'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar'

function Mau({ onMoi = () => {}, onXuat = () => {} }: { onMoi?: () => void; onXuat?: () => void }) {
  const [cot, setCot] = useState<boolean | 'indeterminate'>('indeterminate')
  const [co, setCo] = useState('vua')
  return (
    <DsRoot theme="dark">
      <Menubar aria-label="Thanh lệnh">
        <MenubarMenu>
          <MenubarTrigger>Tệp</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel inset>Đơn</MenubarLabel>
            <MenubarGroup>
              <MenubarItem onSelect={onMoi}>
                Đơn mới
                <MenubarShortcut phim={['Ctrl', 'N']} />
              </MenubarItem>
              <MenubarItem disabled onSelect={onXuat}>
                Xuất Excel (không có quyền)
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Gần đây</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>DH-DEMO-0001</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem inset variant="destructive">
              Đóng
              <MenubarShortcut>Ctrl W</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Xem</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={cot} onCheckedChange={setCot} onSelect={(e) => e.preventDefault()}>
              Cột phụ
            </MenubarCheckboxItem>
            <MenubarRadioGroup value={co} onValueChange={setCo}>
              <MenubarRadioItem value="gon">Gọn</MenubarRadioItem>
              <MenubarRadioItem value="vua">Vừa</MenubarRadioItem>
              <MenubarRadioItem value="rong" disabled>
                Rộng (không có quyền)
              </MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DsRoot>
  )
}

const nut = (ten: string) => screen.getByRole('menuitem', { name: ten })

test('thanh role="menubar" + data-slot; bấm nút → menu TRONG ô portal DsRoot (theme tối), khung mang data-trigger-id của nút', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const thanh = screen.getByRole('menubar', { name: 'Thanh lệnh' })
  expect(thanh.getAttribute('data-slot')).toBe('menubar')
  const tep = nut('Tệp')
  expect(tep.getAttribute('data-slot')).toBe('menubar-trigger')
  await user.click(tep)
  const menu = await screen.findByRole('menu')
  expect(menu.getAttribute('data-slot')).toBe('menubar-content')
  expect(menu.closest('[data-ds-portal]')).not.toBeNull()
  expect(menu.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(menu.getAttribute('data-trigger-id')).toBe(tep.getAttribute('data-ds-menu-trigger'))
  expect(tep.getAttribute('aria-expanded')).toBe('true')
})

test('bàn phím: ←/→ giữa các nút (vòng), ↓ mở + focus mục đầu, → trong menu sang menu kế, Esc đóng và trả focus về nút', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  const tep = nut('Tệp')
  const xem = nut('Xem')
  tep.focus()
  await user.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(xem)
  await user.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(tep)
  await user.keyboard('{ArrowDown}')
  await waitFor(() => expect(document.activeElement?.textContent).toContain('Đơn mới'))
  await user.keyboard('{ArrowRight}')
  await waitFor(() => expect(xem.getAttribute('aria-expanded')).toBe('true'))
  expect(tep.getAttribute('aria-expanded')).toBe('false')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(xem)
})

test('mục chặn quyền theo APG: ↓ dừng ở nó, Enter không chạy onSelect, menu không đóng; mục thường chọn được', async () => {
  const onMoi = vi.fn()
  const onXuat = vi.fn()
  const user = userEvent.setup()
  render(<Mau onMoi={onMoi} onXuat={onXuat} />)
  nut('Tệp').focus()
  await user.keyboard('{ArrowDown}')
  await waitFor(() => expect(document.activeElement?.textContent).toContain('Đơn mới'))
  await user.keyboard('{ArrowDown}')
  const xuat = screen.getByRole('menuitem', { name: 'Xuất Excel (không có quyền)' })
  expect(document.activeElement).toBe(xuat)
  expect(xuat.getAttribute('aria-disabled')).toBe('true')
  await user.keyboard('{Enter}')
  expect(onXuat).not.toHaveBeenCalled()
  expect(screen.getByRole('menu')).toBeTruthy()
  await user.click(screen.getByRole('menuitem', { name: /^Đơn mới/ }))
  expect(onMoi).toHaveBeenCalledTimes(1)
})

test('phần GWT + shadcn trong Menubar: Shortcut phim → Kbd, chữ → menubar-shortcut, inset, destructive, Sub, ✓ một phần, Radio chặn quyền', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(nut('Tệp'))
  const moi = await screen.findByRole('menuitem', { name: /^Đơn mới/ })
  expect([...moi.querySelectorAll('[data-slot="menubar-shortcut"] [data-slot="kbd"]')].map((k) => k.textContent)).toEqual(['Ctrl', 'N'])
  const dong = screen.getByRole('menuitem', { name: /^Đóng/ })
  expect(dong.querySelector('[data-slot="menubar-shortcut"]')?.textContent).toBe('Ctrl W')
  expect(dong.getAttribute('data-inset')).toBe('true')
  expect(dong.getAttribute('data-variant')).toBe('destructive')
  expect(screen.getByText('Đơn').getAttribute('data-slot')).toBe('menubar-label')
  const sub = screen.getByRole('menuitem', { name: 'Gần đây' })
  expect(sub.getAttribute('aria-haspopup')).toBe('menu')
  fireEvent.click(sub)
  const con = await screen.findByRole('menuitem', { name: 'DH-DEMO-0001' })
  expect(con.closest('[data-slot="menubar-sub-content"]')?.closest('[data-ds-portal]')).not.toBeNull()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

  await user.click(nut('Xem'))
  const cot = await screen.findByRole('menuitemcheckbox', { name: 'Cột phụ' })
  expect(cot.getAttribute('aria-checked')).toBe('mixed')
  expect(cot.querySelector('svg')?.getAttribute('data-chi-bao')).toBe('mot-phan')
  fireEvent.click(cot)
  await waitFor(() => expect(cot.getAttribute('aria-checked')).toBe('true'))
  const rong = screen.getByRole('menuitemradio', { name: 'Rộng (không có quyền)' })
  expect(rong.getAttribute('aria-disabled')).toBe('true')
  fireEvent.click(rong)
  expect(screen.getByRole('menuitemradio', { name: 'Vừa' }).getAttribute('aria-checked')).toBe('true')
})

test('MenubarPortal → vào ô DsRoot', () => {
  render(
    <DsRoot>
      <Menubar>
        <MenubarMenu value="a">
          <MenubarTrigger>A</MenubarTrigger>
          <MenubarPortal forceMount>
            <div data-testid="trong-portal" />
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    </DsRoot>,
  )
  expect(screen.getByTestId('trong-portal').closest('[data-ds-portal]')).not.toBeNull()
})
