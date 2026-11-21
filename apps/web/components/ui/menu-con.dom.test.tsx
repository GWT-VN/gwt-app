// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  MenuTimKiem as ContextMenuTimKiem,
} from './context-menu'
import { DsRoot } from './ds-root'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuTimKiem,
} from './dropdown-menu'

const NGUOI = ['Lan', 'Minh', 'Phương', 'Quân']

function Mau({ onNguoi = () => {}, onHan = () => {} }: { onNguoi?: (v: string) => void; onHan?: () => void }) {
  const [uuTien, setUuTien] = useState('vua')
  const [q, setQ] = useState('')
  const ds = NGUOI.filter((n) => n.toLowerCase().includes(q.toLowerCase()))
  return (
    <DsRoot>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Thao tác ticket">⋯</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger icon={<svg data-testid="icon-uu-tien" />} phim={['P']}>
              Ưu tiên
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={uuTien} onValueChange={setUuTien}>
                <DropdownMenuRadioItem value="cao">Cao</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="vua">Vừa</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="thap">Thấp</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger phim={['A']}>Người làm</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <MenuTimKiem value={q} onValueChange={setQ} placeholder="Tìm người…" />
              <DropdownMenuRadioGroup value="" onValueChange={onNguoi}>
                {ds.map((n) => (
                  <DropdownMenuRadioItem key={n} value={n}>
                    {n}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Nhãn</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem checked="indeterminate">Lỗi</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Bảo hành</DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={onHan}>
            Đặt hạn…
            <DropdownMenuShortcut phim={['⇧', 'D']} />
          </DropdownMenuItem>
          <DropdownMenuItem>
            Phân loại
            <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DsRoot>
  )
}

const muc = (ten: string) => screen.getByRole('menuitem', { name: new RegExp(`^${ten}`) })

async function moBangPhim() {
  const user = userEvent.setup()
  render(<Mau />)
  screen.getByRole('button', { name: 'Thao tác ticket' }).focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement).toBe(muc('Ưu tiên')))
  return user
}

test('SubTrigger: aria-haspopup="menu", icon + Kbd phím + ▸; → mở menu con focus mục đang ✓, ← đóng về mục cha', async () => {
  const user = await moBangPhim()
  const t = muc('Ưu tiên')
  expect(t.getAttribute('aria-haspopup')).toBe('menu')
  expect(within(t).getByTestId('icon-uu-tien')).toBeTruthy()
  expect([...t.querySelectorAll('[data-slot="kbd"]')].map((k) => k.textContent)).toEqual(['P'])
  await user.keyboard('{ArrowRight}')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Vừa'))
  expect(document.activeElement?.getAttribute('aria-checked')).toBe('true')
  expect(t.getAttribute('data-state')).toBe('open')
  await user.keyboard('{ArrowLeft}')
  await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1))
  expect(document.activeElement).toBe(t)
})

test('menu con nằm trong ô portal của DsRoot, cùng class khung menu + không tràn ngang khổ hẹp (R14)', async () => {
  const user = await moBangPhim()
  await user.keyboard('{ArrowRight}')
  const con = await waitFor(() => {
    const m = screen.getAllByRole('menu')
    expect(m).toHaveLength(2)
    return m[1]
  })
  expect(con.closest('[data-ds-portal]')).not.toBeNull()
  expect(con.className).toContain('z-90')
  expect(con.className).toContain('max-w-')
})

test('Esc trong menu con đóng hết, focus về nút mở', async () => {
  const user = await moBangPhim()
  await user.keyboard('{ArrowRight}')
  await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Thao tác ticket' }))
})

test('CheckboxItem checked="indeterminate" → aria-checked="mixed" + dấu – (không phải ✓)', async () => {
  const user = await moBangPhim()
  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')
  const loi = await screen.findByRole('menuitemcheckbox', { name: 'Lỗi' })
  expect(loi.getAttribute('aria-checked')).toBe('mixed')
  expect(loi.querySelector('svg')?.getAttribute('data-chi-bao')).toBe('mot-phan')
  const bh = screen.getByRole('menuitemcheckbox', { name: 'Bảo hành' })
  expect(bh.querySelector('svg')?.getAttribute('data-chi-bao')).toBe('chon')
})

test('Shortcut phim={[⇧, D]} → nhóm 2 <kbd>; không truyền phim thì giữ chữ như cũ', async () => {
  await moBangPhim()
  const han = muc('Đặt hạn…')
  expect([...han.querySelectorAll('[data-slot="kbd"]')].map((k) => k.textContent)).toEqual(['⇧', 'D'])
  expect(han.querySelector('[data-slot="kbd-group"]')).not.toBeNull()
  const pl = muc('Phân loại')
  expect(pl.querySelectorAll('[data-slot="kbd"]')).toHaveLength(0)
  expect(pl.querySelector('[data-slot="dropdown-menu-shortcut"]')?.textContent).toBe('Enter')
})

test('MenuTimKiem: mở menu con → focus ô tìm; gõ lọc; "p" trong ô KHÔNG chạy typeahead; ↓ vào danh sách, ↑ ở mục đầu về ô', async () => {
  const user = await moBangPhim()
  await user.keyboard('{ArrowDown}{ArrowRight}')
  const o = await screen.findByRole('textbox', { name: 'Tìm người…' })
  await waitFor(() => expect(document.activeElement).toBe(o))
  await user.keyboard('p')
  // typeahead của Radix dời focus bằng setTimeout → chờ qua nhịp đó rồi mới kiểm.
  await new Promise((r) => setTimeout(r, 20))
  expect(document.activeElement).toBe(o)
  await user.keyboard('h')
  expect((o as HTMLInputElement).value).toBe('ph')
  expect(document.activeElement).toBe(o)
  expect(screen.getAllByRole('menuitemradio').map((x) => x.textContent)).toEqual(['Phương'])
  await user.clear(o)
  await user.keyboard('{ArrowDown}')
  expect(document.activeElement?.textContent).toBe('Lan')
  await user.keyboard('{ArrowUp}')
  expect(document.activeElement).toBe(o)
})

test('MenuTimKiem: Enter chọn mục khi danh sách còn đúng 1; còn nhiều thì Enter không chọn', async () => {
  const onNguoi = vi.fn()
  const user = userEvent.setup()
  render(<Mau onNguoi={onNguoi} />)
  screen.getByRole('button', { name: 'Thao tác ticket' }).focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(document.activeElement).toBe(muc('Ưu tiên')))
  await user.keyboard('{ArrowDown}{ArrowRight}')
  const o = await screen.findByRole('textbox', { name: 'Tìm người…' })
  await waitFor(() => expect(document.activeElement).toBe(o))
  await user.keyboard('n{Enter}')
  expect(onNguoi).not.toHaveBeenCalled()
  await user.keyboard('h{Enter}')
  expect(onNguoi).toHaveBeenCalledWith('Minh')
})

test('MenuTimKiem: menu con đang mở mà focus ở mục cha → gõ chữ đi vào ô tìm (không typeahead menu cha)', async () => {
  const user = await moBangPhim()
  const t = muc('Người làm')
  fireEvent.click(t)
  const o = await screen.findByRole('textbox', { name: 'Tìm người…' })
  t.focus()
  await user.keyboard('m')
  expect(document.activeElement).toBe(o)
  expect((o as HTMLInputElement).value).toBe('m')
})

function MauCm({ onNhan = () => {} }: { onNhan?: (b: boolean) => void }) {
  const [tt, setTt] = useState('mo')
  return (
    <DsRoot>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div tabIndex={0} data-testid="dong">
            TK-DEMO-039
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Thao tác TK-DEMO-039">
          <ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger phim={['S']}>Trạng thái</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuRadioGroup value={tt} onValueChange={setTt}>
                  <ContextMenuRadioItem value="mo">Mở</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="xong">Xong</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuCheckboxItem checked="indeterminate" onCheckedChange={onNhan}>
              Lỗi
            </ContextMenuCheckboxItem>
            <ContextMenuItem>
              Đặt hạn…
              <ContextMenuShortcut phim={['⇧', 'D']} />
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </DsRoot>
  )
}

test('ContextMenu đủ bộ: Group, Sub (→ mở, ✓ ở giá trị), CheckboxItem một phần, RadioItem, Shortcut Kbd', async () => {
  const onNhan = vi.fn()
  const user = userEvent.setup()
  render(<MauCm onNhan={onNhan} />)
  const dong = screen.getByTestId('dong')
  dong.focus()
  await user.keyboard('{Shift>}{F10}{/Shift}')
  const t = await screen.findByRole('menuitem', { name: /^Trạng thái/ })
  await waitFor(() => expect(document.activeElement).toBe(t))
  expect(t.getAttribute('aria-haspopup')).toBe('menu')
  expect(t.closest('[role="group"]')).not.toBeNull()
  await user.keyboard('{ArrowRight}')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Mở'))
  expect(document.activeElement?.getAttribute('role')).toBe('menuitemradio')
  await user.keyboard('{ArrowDown}{Enter}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  fireEvent.contextMenu(dong)
  await user.keyboard('{ArrowDown}')
  const loi = await screen.findByRole('menuitemcheckbox', { name: 'Lỗi' })
  expect(loi.getAttribute('aria-checked')).toBe('mixed')
  expect(loi.querySelector('svg')?.getAttribute('data-chi-bao')).toBe('mot-phan')
  expect([...screen.getByRole('menuitem', { name: /^Đặt hạn/ }).querySelectorAll('[data-slot="kbd"]')].map((k) => k.textContent)).toEqual(['⇧', 'D'])
  fireEvent.click(loi)
  expect(onNhan).toHaveBeenCalledWith(true)
})

/** Từ Đợt 1 chép shadcn mỗi họ là file riêng (bỏ taoPhanMenu) → phần GWT thêm của ContextMenu thử riêng, không dựa bản Dropdown. */
function MauCmTim({ onNguoi = () => {} }: { onNguoi?: (v: string) => void }) {
  const [q, setQ] = useState('')
  const ds = NGUOI.filter((n) => n.toLowerCase().includes(q.toLowerCase()))
  return (
    <DsRoot>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div tabIndex={0} data-testid="dong-tim">
            TK-DEMO-040
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Thao tác TK-DEMO-040">
          <ContextMenuSub>
            <ContextMenuSubTrigger phim={['A']}>Người làm</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuTimKiem value={q} onValueChange={setQ} placeholder="Tìm người…" />
              <ContextMenuRadioGroup value="Lan" onValueChange={onNguoi}>
                {ds.map((n) => (
                  <ContextMenuRadioItem key={n} value={n} disabled={n === 'Quân'}>
                    {n === 'Quân' ? 'Quân (không có quyền)' : n}
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </DsRoot>
  )
}

test('ContextMenu: MenuTimKiem trong menu con (focus ô, lọc, Enter khi còn 1) + RadioItem chặn quyền theo APG', async () => {
  const onNguoi = vi.fn()
  const user = userEvent.setup()
  render(<MauCmTim onNguoi={onNguoi} />)
  screen.getByTestId('dong-tim').focus()
  await user.keyboard('{Shift>}{F10}{/Shift}')
  const t = await screen.findByRole('menuitem', { name: /^Người làm/ })
  await waitFor(() => expect(document.activeElement).toBe(t))
  await user.keyboard('{ArrowRight}')
  const o = await screen.findByRole('textbox', { name: 'Tìm người…' })
  await waitFor(() => expect(document.activeElement).toBe(o))
  const quan = screen.getByRole('menuitemradio', { name: 'Quân (không có quyền)' })
  expect(quan.getAttribute('aria-disabled')).toBe('true')
  expect(screen.getByRole('menuitemradio', { name: 'Lan' }).getAttribute('aria-checked')).toBe('true')
  await user.keyboard('qu{Enter}')
  // Còn đúng 1 mục nhưng là mục chặn quyền → không chọn, menu vẫn mở.
  expect(onNguoi).not.toHaveBeenCalled()
  expect(screen.getByRole('textbox', { name: 'Tìm người…' })).toBeTruthy()
  await user.clear(o)
  await user.keyboard('mi{Enter}')
  expect(onNguoi).toHaveBeenCalledWith('Minh')
})
