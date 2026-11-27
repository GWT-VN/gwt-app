// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
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
  // Khuôn F: không số đếm trên tab — bộ đếm duy nhất ở phân trang.
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual([
    'Tất cả', 'Sắp đến hạn', 'Quá hạn', 'Còn hạn', 'Đã xong', 'Lịch tháng',
  ])
  expect(screen.getByText(/trên 1 lượt/)).toBeTruthy()
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

test('lọc ở nhãn cột: Tình trạng trên URL → tiêu đề thành chip; "Xoá bộ lọc" bỏ điều kiện trường, giữ tìm', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&tt=QU%C3%81+H%E1%BA%A0N'
  try {
    mo()
    const table = screen.getByRole('table', { name: 'Lịch bảo trì' })
    expect(within(table).getByRole('columnheader', { name: /Tình trạng: Quá hạn/ })).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
    expect(push).toHaveBeenLastCalledWith('/bao-tri?q=an', { scroll: false })
  } finally {
    sp.v = 'q=an'
  }
})

test('chuột phải dòng → menu sao chép (lượt không có trang chi tiết)', async () => {
  mo()
  fireEvent.contextMenu(screen.getByText('Công trình A').closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Sao chép mã lượt' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép tên khách' })).toBeTruthy()
  expect(screen.queryByRole('menuitem', { name: 'Mở chi tiết' })).toBeNull()
})
test('cột ngày "Đến hạn" lọc ở nhãn cột: đang lọc → chip; bấm tiêu đề mở pop lọc có chân "Định dạng ngày"', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&han=hom-nay~'
  try {
    mo()
    const table = screen.getByRole('table', { name: 'Lịch bảo trì' })
    const th = within(table).getByRole('columnheader', { name: /Đến hạn: hôm nay/i })
    await user.click(within(th).getAllByRole('button')[0])
    expect(await screen.findByRole('group', { name: 'Định dạng ngày' })).toBeTruthy()
  } finally {
    sp.v = 'q=an'
  }
})
