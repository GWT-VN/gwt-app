// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { NhomLoiForm } from './NhomLoiForm'
import { DsRoot } from './ui/ds-root'

const { taoNhomLoi, xoaNhomLoi, push } = vi.hoisted(() => ({
  taoNhomLoi: vi.fn().mockResolvedValue({ ok: true, code: 'RO-RI' }),
  xoaNhomLoi: vi.fn().mockResolvedValue({ ok: true }),
  push: vi.fn(),
}))

vi.mock('@/app/actions', () => ({ taoNhomLoi, xoaNhomLoi }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }))

test('gửi nhóm từ gợi ý bằng phím Enter', async () => {
  const user = userEvent.setup()
  render(<DsRoot><NhomLoiForm goiYTen="Rò rỉ" goiYMau="rò rỉ" goiYTickets={['TK1', 'TK2']} /></DsRoot>)
  const code = screen.getByRole('textbox', { name: 'Mã nhóm' })
  await user.type(code, 'RO-RI{Enter}')
  expect(taoNhomLoi).toHaveBeenCalledWith(expect.objectContaining({
    code: 'RO-RI', ten: 'Rò rỉ', mau_mo_ta: 'rò rỉ',
  }))
  expect(push).toHaveBeenCalledWith('/nhom-loi/RO-RI')
})

test('chỉ xoá nhóm sau khi xác nhận hậu quả', async () => {
  const user = userEvent.setup()
  render(<DsRoot><NhomLoiForm nhom={{
    code: 'RO-RI', ten: 'Rò rỉ', mo_ta: null, muc_do: 'thuong', bao_hang: false,
    mau_mo_ta: 'rò rỉ', mau_may: null, thu_tu: 100,
  }} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: 'Xoá nhóm' }))
  const dialog = screen.getByRole('alertdialog', { name: /Rò rỉ/ })
  expect(xoaNhomLoi).not.toHaveBeenCalled()
  expect(dialog.textContent).toContain('Các gán tay của nhóm cũng bị xoá theo.')
  await user.click(within(dialog).getByRole('button', { name: 'Xoá nhóm' }))
  expect(xoaNhomLoi).toHaveBeenCalledWith('RO-RI')
  expect(push).toHaveBeenCalledWith('/nhom-loi')
})