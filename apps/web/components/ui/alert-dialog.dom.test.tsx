// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { DsRoot } from './ds-root'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

function Mau({ size, onAction }: { size?: 'default' | 'sm'; onAction?: () => void }) {
  return (
    <DsRoot>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Xoá</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size={size}>
          <AlertDialogHeader>
            <AlertDialogMedia aria-hidden="true">
              <svg />
            </AlertDialogMedia>
            <AlertDialogTitle>Xoá đơn DH-DEMO-0001?</AlertDialogTitle>
            <AlertDialogDescription>Không hoàn tác được.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onAction}>
              Xoá đơn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DsRoot>
  )
}

test('khung shadcn: Cancel = Button outline, Action = Button theo variant; data-slot của primitive; mở focus Huỷ', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(screen.getByRole('button', { name: 'Xoá' }))
  const hop = await screen.findByRole('alertdialog')
  expect(hop.getAttribute('data-size')).toBe('default')
  const huy = screen.getByRole('button', { name: 'Huỷ' })
  const xoa = screen.getByRole('button', { name: 'Xoá đơn' })
  expect(huy.getAttribute('data-slot')).toBe('alert-dialog-cancel')
  expect(huy.getAttribute('data-variant')).toBe('outline')
  expect(xoa.getAttribute('data-slot')).toBe('alert-dialog-action')
  expect(xoa.getAttribute('data-variant')).toBe('destructive')
  await waitFor(() => expect(document.activeElement).toBe(huy))
  expect(hop.querySelector('[data-slot="alert-dialog-media"]')?.parentElement?.getAttribute('data-slot')).toBe(
    'alert-dialog-header',
  )
})

test('Action đóng hộp ngay khi bấm + focus về trigger; Cancel cũng đóng', async () => {
  const user = userEvent.setup()
  const onAction = vi.fn()
  render(<Mau onAction={onAction} />)
  const mo = screen.getByRole('button', { name: 'Xoá' })
  await user.click(mo)
  await user.click(await screen.findByRole('button', { name: 'Xoá đơn' }))
  expect(onAction).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(document.activeElement).toBe(mo)
  await user.click(mo)
  await user.click(await screen.findByRole('button', { name: 'Huỷ' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
})

test('size="sm" (shadcn): data-size sm → trần 320, footer lưới hai cột (biến thể group theo khung)', async () => {
  const user = userEvent.setup()
  render(<Mau size="sm" />)
  await user.click(screen.getByRole('button', { name: 'Xoá' }))
  const hop = await screen.findByRole('alertdialog')
  expect(hop.getAttribute('data-size')).toBe('sm')
  const c = hop.className.split(/\s+/)
  expect(c).toEqual(expect.arrayContaining(['group/alert-dialog-content', 'data-[size=sm]:max-w-[320px]', 'max-w-[450px]']))
  expect(hop.querySelector('[data-slot="alert-dialog-footer"]')!.className).toContain(
    'group-data-[size=sm]/alert-dialog-content:grid-cols-2',
  )
})

test('bấm overlay KHÔNG đóng; Esc đóng', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await user.click(screen.getByRole('button', { name: 'Xoá' }))
  await screen.findByRole('alertdialog')
  await user.click(document.querySelector<HTMLElement>('[data-slot="alert-dialog-overlay"]')!)
  expect(screen.getByRole('alertdialog')).toBeTruthy()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
})
