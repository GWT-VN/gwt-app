// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import type { LoiDanhMuc } from '@/lib/loi/kieu'
import { DanhMucLoiBang } from './DanhMucLoiBang'

const luuLoi = vi.hoisted(() => vi.fn(async () => ({ ok: true })))
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace }),
  usePathname: () => '/danh-muc-loi',
  useSearchParams: () => new URLSearchParams('q=x'),
}))
vi.mock('@/app/ticket/loi-actions', () => ({ luuLoi, datTrangThaiLoi: vi.fn() }))
vi.mock('@/app/actions', () => ({ luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn() }))

const bao = (ui: ReactNode) => (
  <DsRoot><CauHinhBangDs><KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>{ui}</KhungChon></CauHinhBangDs></DsRoot>
)

it('Danh mục lỗi theo khuôn F: tìm ở đầu, tab trạng thái có số, bấm tab đổi `tt` trên URL', async () => {
  const user = userEvent.setup()
  render(bao(<DanhMucLoiBang rows={[]} choSua={false} demTab={{ 'tat-ca': 5, cho_duyet: 2, da_duyet: 3, ngung: 0 }} />))
  const toolbar = screen.getByRole('heading', { name: 'Danh mục lỗi' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm mã lỗi' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab mã lỗi' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: /Chờ duyệt/ }).textContent).toContain('2')
  await user.click(screen.getByRole('tab', { name: /Chờ duyệt/ }))
  expect(replace).toHaveBeenLastCalledWith('/danh-muc-loi?tt=cho_duyet&view=cho_duyet', { scroll: false })
})

it('selects a searched group from a named popup outside the catalog table', async () => {
  const row: LoiDanhMuc = {
    code: 'X1', nhom: null, ten: 'Lỗi X', aliases: [], ma_may: [], dau_hieu: null, huong_xu_ly: null, nguon: null,
    trang_thai: 'cho_duyet', duyet_boi: null, duyet_luc: null, thu_tu: 1,
  }
  const user = userEvent.setup()
  render(bao(<DanhMucLoiBang rows={[row]} choSua nhomTuyChon={[{ gt: 'RO-RI', nhan: 'Rò rỉ' }]} />))
  await user.click(screen.getByRole('button', { name: 'Sửa' }))
  await user.click(screen.getByRole('button', { name: 'Nhóm lỗi' }))
  const popup = await screen.findByRole('dialog', { name: 'Nhóm lỗi' })
  expect(popup.closest('table')).toBeNull()
  await user.type(within(popup).getByRole('combobox'), 'ro ri')
  await user.keyboard('{Enter}')
  await user.click(screen.getByRole('button', { name: 'Lưu' }))
  expect(luuLoi).toHaveBeenCalledWith(expect.objectContaining({ nhom: 'RO-RI' }))
})
