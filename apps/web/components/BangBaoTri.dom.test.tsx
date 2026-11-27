// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { expect, test, vi } from 'vitest'
import type { MaintenanceDue } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangBaoTri } from './BangBaoTri'

const { push, replace, sp } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), sp: { v: 'q=an' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/bao-tri',
  useSearchParams: () => new URLSearchParams(sp.v),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

const luot = {
  visit_id: 'v1', lan_thu: 2, tong_lan: 4, due_date: '2026-12-01', completed_at: null, loai_goi: 'POE 2 năm', bo_may: 'WH15A ECO',
  section: 'Công trình A', customer_name: null, primary_phone: null, chua_khop_khach: true, tinh_trang: 'còn hạn', do_nuoc: null,
} as MaintenanceDue

function mo({ rows = [luot], lich }: { rows?: MaintenanceDue[]; lich?: ReactNode } = {}) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={rows.map((r) => r.visit_id)} tong={rows.length} bat thamSo={{}}>
          <BangBaoTri
            rows={rows} choChon tabRieng={[]} quyenTabChung={false}
            demTab={{ 'tat-ca': 9, sap: 3, 'qua-han': 2, 'con-han': 4, xong: 7 }}
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'due_date', tang: true, macDinh: true }}
            lich={lich}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Lịch bảo trì dùng khuôn Ticket F: tìm ở đầu, đủ tab cũ (Tất cả đầu, có Lịch tháng), cột Khách ghim, chưa khớp khách', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Lịch bảo trì' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm lượt bảo trì' })).toBeTruthy()
  const tabs = within(toolbar).getByRole('tablist', { name: 'Tab lượt bảo trì' })
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual([
    'Tất cả 9', 'Sắp đến hạn 3', 'Quá hạn 2', 'Còn hạn 4', 'Đã xong 7', 'Lịch tháng ',
  ])
  const table = screen.getByRole('table', { name: 'Lịch bảo trì' })
  expect(within(table).getByRole('columnheader', { name: /Khách/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByText('Chưa khớp khách')).toBeTruthy()
  expect(within(table).getByText('Công trình A')).toBeTruthy()
})

test('bấm tab "Lịch tháng" → ?view=lich, bỏ bộ lọc', async () => {
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('tab', { name: /Lịch tháng/ }))
  expect(replace).toHaveBeenLastCalledWith('/bao-tri?view=lich', { scroll: false })
})

test('tab Lịch tháng: vẽ lịch thay bảng, không ô tìm / nút Lọc', () => {
  sp.v = 'view=lich'
  mo({ lich: <div role="region" aria-label="Lịch tháng bảo trì" /> })
  expect(screen.getByRole('region', { name: 'Lịch tháng bảo trì' })).toBeTruthy()
  expect(screen.queryByRole('table')).toBeNull()
  expect(screen.queryByRole('textbox', { name: 'Tìm lượt bảo trì' })).toBeNull()
  expect(screen.getByRole('tab', { name: /Lịch tháng/ }).getAttribute('aria-selected')).toBe('true')
  sp.v = 'q=an'
})
