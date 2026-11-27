// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { IssueReport } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangNhomLoi } from './BangNhomLoi'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/nhom-loi',
  useSearchParams: () => new URLSearchParams('nguong=3'),
}))
vi.mock('@/app/actions', () => ({ luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn() }))

const nhom = {
  code: 'KHOI', ten: 'Bốc khói', muc_do: 'an_toan', bao_hang: true, mo_ta: 'Máy tự bốc khói', thu_tu: 1, so_ticket: 3,
  dang_mo: 1, da_xong: 2, da_huy: 0, so_khach: 3, so_may: 3, so_model: 1, cac_model: 'RO-9', som_nhat: null, gan_nhat: null,
  trong_90_ngay: 2,
} as IssueReport

test('Nhóm lỗi theo khuôn F: tìm ở đầu, tab báo hãng, dòng an toàn tô đỏ, link sang nhóm', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot><CauHinhBangDs><KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>
      <BangNhomLoi rows={[nhom]} tabRieng={[]} quyenTabChung={false} />
    </KhungChon></CauHinhBangDs></DsRoot>,
  )
  const toolbar = screen.getByRole('heading', { name: 'Nhóm lỗi' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm nhóm lỗi' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab nhóm lỗi' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Nhóm lỗi' })
  expect(within(table).getByRole('link', { name: 'Bốc khói' }).getAttribute('href')).toBe('/nhom-loi/KHOI')
  expect(within(table).getByText('AN TOÀN')).toBeTruthy()
  expect(within(table).getByText('Báo hãng')).toBeTruthy()
  expect(within(table).getByRole('link', { name: 'Bốc khói' }).closest('tr')!.className).toContain('danger')
  await user.click(screen.getByRole('tab', { name: /Chỉ nhóm báo hãng/ }))
  // `nguong` (ngưỡng gợi ý gom) không thuộc bộ lọc tab → giữ nguyên khi đổi tab.
  expect(replace).toHaveBeenLastCalledWith('/nhom-loi?nguong=3&bh=1&view=bao-hang', { scroll: false })
})
