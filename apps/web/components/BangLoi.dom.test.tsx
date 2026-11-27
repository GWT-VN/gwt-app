// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { CoreDue } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangLoi } from './BangLoi'

const { push, replace, sp } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), sp: { v: new URLSearchParams({ q: 'an', tt: 'QUÁ HẠN', trang: '2' }).toString() },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/loi',
  useSearchParams: () => new URLSearchParams(sp.v),
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
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'han_som', tang: true, macDinh: true }}
            canhBao={<p>Đây KHÔNG phải danh sách gọi bán.</p>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Lịch thay lõi dùng khuôn Ticket F: tìm ở đầu, tab tình trạng không số, cột Khách ghim, Badge hạn DS, nút Ghi log', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Lịch thay lõi' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm lịch thay lõi' })).toBeTruthy()
  const tabs = within(toolbar).getByRole('tablist', { name: 'Tab dòng lõi' })
  // Khuôn F: không số đếm trên tab — bộ đếm duy nhất ở phân trang.
  expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Tất cả', 'Sắp đến hạn', 'Quá hạn', 'Còn hạn'])
  expect(screen.getByText(/trên 1 dòng lõi/)).toBeTruthy()
  expect(screen.getByText('Đây KHÔNG phải danh sách gọi bán.')).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Lịch thay lõi' })
  expect(within(table).getByRole('columnheader', { name: /Khách/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'SN-1' }).getAttribute('href')).toBe('/may/SN-1')
  expect(within(table).getByText('Quá 26 ngày').closest('[data-color]')?.getAttribute('data-color')).toBe('danger')
  // Lọc Tình trạng (tt trên URL) hiện thành chip ở NHÃN CỘT với nhãn dễ đọc; không còn hàng chip dưới thanh công cụ.
  expect(within(table).getByRole('columnheader', { name: /Tình trạng: Quá hạn/ })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
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

test('"Xoá bộ lọc" bỏ điều kiện trường, giữ tìm', async () => {
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
  expect(push).toHaveBeenLastCalledWith('/loi?q=an', { scroll: false })
})

test('chuột phải dòng lõi → Mở chi tiết máy / Sao chép serial / Sao chép đường dẫn', async () => {
  mo()
  fireEvent.contextMenu(screen.getByRole('link', { name: 'SN-1' }).closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Sao chép serial' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết máy' }))
  expect(push).toHaveBeenLastCalledWith('/may/SN-1')
})
test('cột ngày "Đến hạn" lọc ở nhãn cột: đang lọc → chip; bấm tiêu đề mở pop lọc có chân "Định dạng ngày"', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&han=hom-nay~'
  try {
    mo()
    const table = screen.getByRole('table', { name: 'Lịch thay lõi' })
    const th = within(table).getByRole('columnheader', { name: /Đến hạn: hôm nay/i })
    await user.click(within(th).getAllByRole('button')[0])
    expect(await screen.findByRole('group', { name: 'Định dạng ngày' })).toBeTruthy()
  } finally {
    sp.v = new URLSearchParams({ q: 'an', tt: 'QUÁ HẠN', trang: '2' }).toString()
  }
})
