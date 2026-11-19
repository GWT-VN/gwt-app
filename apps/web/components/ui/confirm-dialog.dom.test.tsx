// @vitest-environment jsdom
import { useState, type ComponentProps } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './button'
import { ConfirmDialog } from './confirm-dialog'
import { footer } from './dialog-styles'
import { DsRoot } from './ds-root'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

type Them = Partial<ComponentProps<typeof ConfirmDialog>>

/** Nút mở ngoài hộp + ConfirmDialog điều khiển (open do người gọi giữ), như màn thật dùng. */
function Mau({ onOpenChange, ...them }: Them) {
  const [mo, setMo] = useState(false)
  return (
    <DsRoot theme="dark">
      <Button onClick={() => setMo(true)}>Mở xác nhận</Button>
      <ConfirmDialog
        open={mo}
        onOpenChange={(o) => {
          onOpenChange?.(o)
          setMo(o)
        }}
        tieuDe="Xoá phiếu chi PC-DEMO-0001?"
        moTa="Không hoàn tác được. Sẽ xảy ra:"
        nutXacNhan="Xoá phiếu"
        onXacNhan={() => {}}
        {...them}
      />
    </DsRoot>
  )
}

const moNut = () => screen.getByRole('button', { name: 'Mở xác nhận' })
async function mo(them: Them = {}) {
  const user = userEvent.setup()
  const r = render(<Mau {...them} />)
  await user.click(moNut())
  const hop = await screen.findByRole('alertdialog')
  return { user, hop, ...r }
}

test('role="alertdialog" trong ô portal vùng DS tối, labelledby tiêu đề, describedby mô tả', async () => {
  const { hop } = await mo()
  expect(hop.closest('[data-ds-portal]')).not.toBeNull()
  expect(hop.closest('[data-ds="v2"]')?.getAttribute('data-theme')).toBe('dark')
  expect(document.getElementById(hop.getAttribute('aria-labelledby')!)?.textContent).toBe('Xoá phiếu chi PC-DEMO-0001?')
  expect(document.getElementById(hop.getAttribute('aria-describedby')!)?.textContent).toBe('Không hoàn tác được. Sẽ xảy ra:')
})

test('không pha → focus nút xác nhận khi mở, nút default', async () => {
  await mo()
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Xoá phiếu'))
  expect(screen.getByRole('button', { name: 'Xoá phiếu' }).getAttribute('data-variant')).toBe('default')
})

test('pha → focus nút Huỷ (nút an toàn), nút xác nhận destructive', async () => {
  await mo({ pha: true, nutHuy: 'Quay lại' })
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Quay lại'))
  expect(screen.getByRole('button', { name: 'Xoá phiếu' }).getAttribute('data-variant')).toBe('destructive')
})

test('phần tử con có data-autofocus nhận focus khi mở (ô gõ mã để mở khoá), thắng mặc định', async () => {
  await mo({ pha: true, children: <input aria-label="Mã khách" data-autofocus /> })
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Mã khách' })))
})

test('bấm overlay không đóng (AlertDialog)', async () => {
  const onOpenChange = vi.fn()
  const { user } = await mo({ onOpenChange })
  await user.click(document.querySelector<HTMLElement>('[data-slot="alert-dialog-overlay"]')!)
  expect(onOpenChange).not.toHaveBeenCalledWith(false)
  expect(screen.getByRole('alertdialog')).toBeTruthy()
})

test('Huỷ đóng; đóng xong focus về nút đã mở', async () => {
  const { user } = await mo()
  await user.click(screen.getByRole('button', { name: 'Huỷ' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(document.activeElement).toBe(moNut())
})

test('Esc đóng (khi không chạy) và trả focus về nút đã mở — cả khi focus đang ở ô data-autofocus', async () => {
  const { user } = await mo({ children: <input aria-label="Lý do" data-autofocus /> })
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toBe('Lý do'))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(document.activeElement).toBe(moNut())
})

test('dangChay: Esc / Huỷ không gọi onOpenChange(false); nút xác nhận loading, Huỷ disabled; focus vẫn trong hộp', async () => {
  const onOpenChange = vi.fn()
  const onXacNhan = vi.fn()
  const { user, hop } = await mo({ onOpenChange, onXacNhan, dangChay: true })
  const xn = screen.getByRole('button', { name: 'Xoá phiếu' })
  const huy = screen.getByRole('button', { name: 'Huỷ' })
  expect(xn.getAttribute('aria-busy')).toBe('true')
  expect((huy as HTMLButtonElement).disabled).toBe(true)
  await user.keyboard('{Escape}')
  await user.click(huy)
  await user.click(xn)
  expect(onOpenChange).not.toHaveBeenCalledWith(false)
  expect(onXacNhan).not.toHaveBeenCalled()
  expect(screen.getByRole('alertdialog')).toBe(hop)
  // Nút đang focus bị khoá → focus không rơi ra body / không đứng trên phần tử disabled.
  expect(hop.contains(document.activeElement)).toBe(true)
  expect(document.activeElement?.matches(':disabled')).toBe(false)
})

/** Promise điều khiển được từ test. */
function hua() {
  let ok!: () => void, loi!: (e: unknown) => void
  const p = new Promise<void>((a, b) => ((ok = a), (loi = b)))
  return { p, ok, loi }
}

test('Ruling 1 + 14: onXacNhan trả Promise → bấm 2 lần nhanh chỉ 1 lần, khoá tới khi xong; Esc không đóng; focus không rơi', async () => {
  const h = hua()
  const onXacNhan = vi.fn(() => h.p)
  const onOpenChange = vi.fn()
  const { user, hop } = await mo({ onXacNhan, onOpenChange })
  const xn = screen.getByRole('button', { name: 'Xoá phiếu' })
  await user.click(xn)
  // Kiểm NGAY sau lần bấm đầu (lần bấm thứ hai vào nút disabled tự kéo focus lên khung → che mất lỗi).
  expect(hop.contains(document.activeElement)).toBe(true)
  expect(document.activeElement?.matches(':disabled')).toBe(false)
  expect(xn.getAttribute('aria-busy')).toBe('true')
  await user.click(xn)
  expect(onXacNhan).toHaveBeenCalledTimes(1)
  await user.keyboard('{Escape}')
  expect(onOpenChange).not.toHaveBeenCalledWith(false)
  expect((screen.getByRole('button', { name: 'Huỷ' }) as HTMLButtonElement).disabled).toBe(true)
  await act(async () => h.ok())
})

test('Promise resolve → tự đóng (onOpenChange(false)) và focus về nút đã mở', async () => {
  const onOpenChange = vi.fn()
  const { user } = await mo({ onXacNhan: () => Promise.resolve(), onOpenChange })
  await user.click(screen.getByRole('button', { name: 'Xoá phiếu' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(onOpenChange).toHaveBeenCalledWith(false)
  await waitFor(() => expect(document.activeElement).toBe(moNut()))
})

test('Promise reject (2 lần, cùng lỗi) → mỗi lần mở khoá, hộp không đóng, Alert lỗi mặc định, focus về nút xác nhận', async () => {
  const onXacNhan = vi.fn(() => Promise.reject(new Error('mạng')))
  const onOpenChange = vi.fn()
  const { user, hop } = await mo({ onXacNhan, onOpenChange })
  const xn = screen.getByRole('button', { name: 'Xoá phiếu' })
  for (const lan of [1, 2]) {
    await user.click(xn)
    const alert = await screen.findByRole('alert')
    expect(hop.contains(alert)).toBe(true)
    expect(alert.getAttribute('data-color')).toBe('danger')
    expect(alert.textContent).toBe('Không thực hiện được — thử lại.')
    await waitFor(() => expect(xn.getAttribute('aria-busy')).toBeNull())
    // Mở khoá trong khi focus đang ở khung → trả focus về nút xác nhận (Minor 4).
    expect(document.activeElement).toBe(xn)
    expect(onXacNhan).toHaveBeenCalledTimes(lan)
  }
  expect(onOpenChange).not.toHaveBeenCalledWith(false)
})

test('loi (prop) chỉ để hiện: thắng chữ mặc định khi reject', async () => {
  const { user } = await mo({ onXacNhan: () => Promise.reject(), loi: 'Không xoá được — máy chủ không phản hồi.' })
  expect((await screen.findByRole('alert')).textContent).toBe('Không xoá được — máy chủ không phản hồi.')
  await user.click(screen.getByRole('button', { name: 'Xoá phiếu' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Xoá phiếu' }).getAttribute('aria-busy')).toBeNull())
  expect(screen.getAllByRole('alert')).toHaveLength(1)
})

test('onXacNhan đồng bộ, không làm gì → không kẹt khoá: Huỷ vẫn bấm được và đóng', async () => {
  const onOpenChange = vi.fn()
  const onXacNhan = vi.fn()
  const { user } = await mo({ onXacNhan, onOpenChange })
  await user.click(screen.getByRole('button', { name: 'Xoá phiếu' }))
  expect(onXacNhan).toHaveBeenCalledTimes(1)
  const huy = screen.getByRole('button', { name: 'Huỷ' }) as HTMLButtonElement
  expect(huy.disabled).toBe(false)
  await user.click(huy)
  expect(onOpenChange).toHaveBeenCalledWith(false)
})

test('đang chờ Promise → ô con (lý do) bị khoá qua fieldset, xong thì mở lại (Minor 3)', async () => {
  const h = hua()
  const { user } = await mo({ onXacNhan: () => h.p, children: <textarea aria-label="Lý do" /> })
  const o = screen.getByRole('textbox', { name: 'Lý do' }) as HTMLTextAreaElement
  expect(o.matches(':disabled')).toBe(false)
  await user.click(screen.getByRole('button', { name: 'Xoá phiếu' }))
  expect(o.matches(':disabled')).toBe(true)
  await act(async () => h.loi(new Error('x')))
  await waitFor(() => expect(o.matches(':disabled')).toBe(false))
})

test('autoFocus (React) trên ô con cũng trả focus về nút mở khi đóng (Minor 2)', async () => {
  const { user } = await mo({ children: <input aria-label="Mã" autoFocus /> })
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toBe('Mã'))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect(document.activeElement).toBe(moNut())
})

test('không moTa → aria-describedby trỏ vào danh sách hậu quả (Minor 5)', async () => {
  const { hop } = await mo({ moTa: undefined, hauQua: ['Mất phiếu.', 'Quỹ tăng lại.'] })
  const id = hop.getAttribute('aria-describedby')
  expect(id).toBeTruthy()
  expect(document.getElementById(id!)?.getAttribute('data-slot')).toBe('confirm-dialog-list')
})

test('khoaXacNhan → nút xác nhận disabled (chưa gõ mã), Huỷ vẫn bấm được', async () => {
  const onXacNhan = vi.fn()
  const { user } = await mo({ khoaXacNhan: true, onXacNhan })
  const xn = screen.getByRole('button', { name: 'Xoá phiếu' }) as HTMLButtonElement
  expect(xn.disabled).toBe(true)
  await user.click(xn)
  expect(onXacNhan).not.toHaveBeenCalled()
  expect((screen.getByRole('button', { name: 'Huỷ' }) as HTMLButtonElement).disabled).toBe(false)
})

test('hauQua → ul.ui-dialog-list (mục li), icon tròn aria-hidden data-color danger', async () => {
  const { hop } = await mo({
    hauQua: ['Phiếu biến mất khỏi báo cáo.', 'Số dư quỹ tăng lại.'],
    icon: <svg data-testid="icon" />,
    mau: 'danger',
  })
  const ul = hop.querySelector('[data-slot="confirm-dialog-list"]')!
  expect(ul.tagName).toBe('UL')
  expect([...ul.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
    'Phiếu biến mất khỏi báo cáo.',
    'Số dư quỹ tăng lại.',
  ])
  const icon = hop.querySelector('[data-slot="confirm-dialog-icon"]')!
  expect(icon.getAttribute('aria-hidden')).toBe('true')
  expect(icon.getAttribute('data-color')).toBe('danger')
})

test('footer ≤640: selector "nút rộng hết" của dialog-styles khớp CẢ HAI nút (kể cả Huỷ bọc AlertDialogCancel asChild)', async () => {
  const { hop } = await mo()
  const sel = footer.match(/\[&>(.+?)\]:w-full/)?.[1]
  expect(sel, 'footer phải có biến thể [&>…]:w-full').toBeTruthy()
  const f = hop.querySelector('[data-slot="alert-dialog-footer"]')!
  expect(f.querySelectorAll(`:scope > ${sel!.replaceAll('_', ' ')}`)).toHaveLength(2)
})
