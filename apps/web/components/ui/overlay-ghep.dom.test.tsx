// @vitest-environment jsdom
/**
 * Test GHÉP overlay (review cuối lát 2): mở hộp từ mục menu, mở sẵn (mount open), hộp điều khiển không Trigger, hộp
 * lồng hộp, menu trong Sheet. Chung một gốc: focus phải về nút/dòng CÒN SỐNG đã mở (hook use-nut-mo), không rơi body;
 * `pointer-events` của body được trả lại.
 */
import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { ConfirmDialog } from './confirm-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from './dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { DsRoot } from './ds-root'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from './sheet'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

function XacNhan({ open, onOpenChange }: { open: boolean; onOpenChange(o: boolean): void }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tieuDe="Xoá đơn DH-DEMO-0001?"
      nutXacNhan="Xoá đơn"
      pha
      onXacNhan={() => {}}
    />
  )
}

function MenuRoiXacNhan() {
  const [mo, setMo] = useState(false)
  return (
    <DsRoot>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Thao tác với đơn">
            ⋯
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setMo(true)}>Xoá đơn…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <XacNhan open={mo} onOpenChange={setMo} />
    </DsRoot>
  )
}

test('DropdownMenu → mục "Xoá đơn…" mở ConfirmDialog → Huỷ: focus về nút ⋯ (không body), body hết pointer-events none', async () => {
  const user = userEvent.setup()
  render(<MenuRoiXacNhan />)
  const nut = screen.getByRole('button', { name: 'Thao tác với đơn' })
  await user.click(nut)
  await user.click(await screen.findByRole('menuitem', { name: 'Xoá đơn…' }))
  await screen.findByRole('alertdialog')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Huỷ'))
  await user.click(screen.getByRole('button', { name: 'Huỷ' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(nut))
  expect(document.body.style.pointerEvents).toBe('')
})

test('DropdownMenu → ConfirmDialog bằng PHÍM (Enter mở menu, Enter chọn) → Esc: focus về nút ⋯', async () => {
  const user = userEvent.setup()
  render(<MenuRoiXacNhan />)
  const nut = screen.getByRole('button', { name: 'Thao tác với đơn' })
  nut.focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'))
  await user.keyboard('{Enter}')
  await screen.findByRole('alertdialog')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Huỷ'))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(nut))
  expect(document.body.style.pointerEvents).toBe('')
})

test('ContextMenu (chuột phải dòng) → mục mở ConfirmDialog → Huỷ: focus về DÒNG đã mở menu', async () => {
  function Mau() {
    const [mo, setMo] = useState(false)
    return (
      <DsRoot>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div tabIndex={0} data-testid="dong">
              DH-DEMO-0001
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setMo(true)}>Xoá đơn…</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <XacNhan open={mo} onOpenChange={setMo} />
      </DsRoot>
    )
  }
  const user = userEvent.setup()
  render(<Mau />)
  const dong = screen.getByTestId('dong')
  fireEvent.contextMenu(dong, { clientX: 40, clientY: 60 })
  await user.click(await screen.findByRole('menuitem', { name: 'Xoá đơn…' }))
  await screen.findByRole('alertdialog')
  await user.click(screen.getByRole('button', { name: 'Huỷ' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(dong))
  expect(document.body.style.pointerEvents).toBe('')
})

test('ConfirmDialog MOUNT với open=true (không có cạnh false→true) → đóng: focus về phần tử đang focus lúc mount', async () => {
  function Mau() {
    const [hien, setHien] = useState(false)
    return (
      <DsRoot>
        <Button onClick={() => setHien(true)}>Xoá nhanh</Button>
        {hien && <XacNhan open onOpenChange={(o) => setHien(o)} />}
      </DsRoot>
    )
  }
  const user = userEvent.setup()
  render(<Mau />)
  const nut = screen.getByRole('button', { name: 'Xoá nhanh' })
  await user.click(nut)
  await screen.findByRole('alertdialog')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(nut))
})

test('Dialog điều khiển KHÔNG có DialogTrigger → Esc: focus về nút đã mở (Radix chỉ biết trigger → rơi body)', async () => {
  function Mau() {
    const [mo, setMo] = useState(false)
    return (
      <DsRoot>
        <Button onClick={() => setMo(true)}>Sửa đơn</Button>
        <Dialog open={mo} onOpenChange={setMo}>
          <DialogContent>
            <DialogTitle>Sửa đơn</DialogTitle>
          </DialogContent>
        </Dialog>
      </DsRoot>
    )
  }
  const user = userEvent.setup()
  render(<Mau />)
  const nut = screen.getByRole('button', { name: 'Sửa đơn' })
  await user.click(nut)
  await screen.findByRole('dialog')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(nut))
})

test('Sheet điều khiển KHÔNG có SheetTrigger → ✕: focus về nút đã mở', async () => {
  function Mau() {
    const [mo, setMo] = useState(false)
    return (
      <DsRoot>
        <Button onClick={() => setMo(true)}>Bộ lọc</Button>
        <Sheet open={mo} onOpenChange={setMo}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </DsRoot>
    )
  }
  const user = userEvent.setup()
  render(<Mau />)
  const nut = screen.getByRole('button', { name: 'Bộ lọc' })
  await user.click(nut)
  await user.click(await screen.findByRole('button', { name: 'Đóng' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(nut))
})

test('Dialog → ConfirmDialog lồng: Esc chỉ đóng hộp trên; focus về nút trong hộp dưới; Esc nữa đóng hộp dưới', async () => {
  function Mau() {
    const [mo, setMo] = useState(false)
    const [xn, setXn] = useState(false)
    return (
      <DsRoot>
        <Button onClick={() => setMo(true)}>Sửa đơn</Button>
        <Dialog open={mo} onOpenChange={setMo}>
          <DialogContent>
            <DialogTitle>Sửa đơn</DialogTitle>
            <DialogFooter>
              <Button variant="destructive" onClick={() => setXn(true)}>
                Xoá đơn…
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <XacNhan open={xn} onOpenChange={setXn} />
      </DsRoot>
    )
  }
  const user = userEvent.setup()
  render(<Mau />)
  const moNgoai = screen.getByRole('button', { name: 'Sửa đơn' })
  await user.click(moNgoai)
  const duoi = await screen.findByRole('dialog')
  const nutXoa = screen.getByRole('button', { name: 'Xoá đơn…' })
  await user.click(nutXoa)
  await screen.findByRole('alertdialog')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Huỷ'))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(screen.getByRole('dialog')).toBe(duoi)
  await waitFor(() => expect(document.activeElement).toBe(nutXoa))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(moNgoai))
  expect(document.body.style.pointerEvents).toBe('')
})

test('ContextMenu trong Sheet: chuột phải dòng mở menu; Esc chỉ đóng menu, Sheet còn mở', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chi tiết đơn</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div tabIndex={0} data-testid="dong">
                  Dòng hàng 1
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Sao chép mã</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </DsRoot>,
  )
  const sheet = await screen.findByRole('dialog')
  const dong = screen.getByTestId('dong')
  dong.focus()
  fireEvent.contextMenu(dong, { clientX: 40, clientY: 60 })
  const menu = await screen.findByRole('menu')
  await waitFor(() => expect(document.activeElement).toBe(menu))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  expect(screen.getByRole('dialog')).toBe(sheet)
  await waitFor(() => expect(document.activeElement).toBe(dong))
})
