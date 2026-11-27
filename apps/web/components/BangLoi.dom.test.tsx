// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { CoreDue } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangLoi } from './BangLoi'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/loi',
  useSearchParams: () => new URLSearchParams({ q: 'an', tt: 'QUÁ HẠN', trang: '2' }),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

const loi = {
  serial: 'SN-1', filter_code: 'L1', filter_name: 'Lõi PP', chu_ky_raw: '6 tháng', product_name: 'Máy mẫu', customer_id: 'k1',
  customer_name: 'Khách mẫu', primary_phone: '0900000000', moc_tinh: '2026-05-01', lan_thay_gan_nhat: null,
  han_som: '2026-11-01', con_bao_nhieu_ngay: -26, tinh_trang: 'QUÁ HẠN',
} as unknown as CoreDue

function mo(rows = [loi], choChon = true) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={rows.map((r) => `${r.serial}-${r.filter_code}`)} tong={rows.length} bat={choChon} thamSo={{}}>
          <BangLoi
            rows={rows} choChon={choChon} tabRieng={[]} quyenTabChung={false}
            demTab={{ 'tat-ca': 9, sap: 3, 'qua-han': 5, 'con-han': 1 }}
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'han_som', tang: true, macDinh: true }}
            canhBao={<p>Đây KHÔNG phải danh sách gọi bán.</p>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Lịch thay lõi dùng khuôn Ticket F: tìm ở đầu, tab tình trạng có số, cột Khách ghim, Badge hạn DS, nút Ghi log', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Lịch thay lõi' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm lịch thay lõi' })).toBeTruthy()
  const tabs = within(toolbar).getByRole('tablist', { name: 'Tab dòng lõi' })
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Tất cả 9', 'Sắp đến hạn 3', 'Quá hạn 5', 'Còn hạn 1'])
  expect(screen.getByText('Đây KHÔNG phải danh sách gọi bán.')).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Lịch thay lõi' })
  expect(within(table).getByRole('columnheader', { name: /Khách/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'SN-1' }).getAttribute('href')).toBe('/may/SN-1')
  expect(within(table).getByText('Quá 26 ngày').closest('[data-color]')?.getAttribute('data-color')).toBe('danger')
  // Lọc Tình trạng (tt trên URL) hiện thành chip với nhãn dễ đọc.
  expect(screen.getAllByRole('button', { name: /Tình trạng.*Quá hạn/ }).length).toBeGreaterThan(0)
})

test('bấm tab cố định → thay bộ lọc cũ (q, tt) bằng bộ lọc của tab, bỏ trang', async () => {
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('tab', { name: /Còn hạn/ }))
  expect(replace).toHaveBeenLastCalledWith(`/loi?${new URLSearchParams({ tt: 'còn hạn', view: 'con-han' })}`, { scroll: false })
})

test('rỗng khi lọc → EmptyState kiểu lọc', () => {
  mo([], false)
  expect(screen.getByRole('heading', { name: 'Không có lõi nào khớp' })).toBeTruthy()
})
