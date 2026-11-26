// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import type { LoiDanhMuc } from '@/lib/loi/kieu'
import { DanhMucLoiBang } from './DanhMucLoiBang'

const luuLoi = vi.hoisted(() => vi.fn(async () => ({ ok: true })))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/ticket/loi-actions', () => ({ luuLoi, datTrangThaiLoi: vi.fn() }))

it('selects a searched group from a named popup outside the catalog table', async () => {
  const row: LoiDanhMuc = {
    code: 'X1', nhom: null, ten: 'Lỗi X', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
    trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 1,
  }
  const user = userEvent.setup()
  render(<DsRoot><DanhMucLoiBang rows={[row]} choSua nhomTuyChon={[{ gt: 'RO-RI', nhan: 'Rò rỉ' }]} /></DsRoot>)
  await user.click(screen.getByRole('button', { name: 'Sửa' }))
  await user.click(screen.getByRole('button', { name: 'Nhóm lỗi' }))
  const popup = await screen.findByRole('dialog', { name: 'Nhóm lỗi' })
  expect(popup.closest('table')).toBeNull()
  await user.type(within(popup).getByRole('combobox'), 'ro ri')
  await user.keyboard('{Enter}')
  await user.click(screen.getByRole('button', { name: 'Lưu' }))
  expect(luuLoi).toHaveBeenCalledWith(expect.objectContaining({ nhom: 'RO-RI' }))
})
