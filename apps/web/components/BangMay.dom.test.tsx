// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { Machine } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangMay } from './BangMay'

const { push, replace, sp } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), sp: { v: 'q=an&bh=chua_kich_hoat&trang=2' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(sp.v),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

const may = {
  serial: 'SN-MAU-1', product_name: 'Máy lọc GE GN610', internal_code: 'GN610', customer_id: 'k1', customer_name: 'Khách mẫu',
  primary_phone: null, install_date: '2026-11-01', warranty_activated: false, co_chinh_sach_bh: true, con_han_may: null, con_han_loi: null,
} as unknown as Machine

function mo(rows = [may], choChon = true) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={rows.map((r) => r.serial)} tong={rows.length} bat={choChon} thamSo={{}}>
          <BangMay
            rows={rows} choChon={choChon} quyenTabChung={false}
            tabRieng={[{ id: 't1', ten: 'Chưa kích hoạt', chung: false, loc: 'bh=chua_kich_hoat', suaDuoc: true }]}
            tuyChonSp={[{ giaTri: 'GN610', nhan: 'GN610' }]}
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'install_date', tang: false, macDinh: true }}
            xuatExcel={<button>Xuất Excel</button>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Máy dùng khuôn Ticket F: tìm ở đầu, hàng tab, ⚙, cột Serial ghim, link máy/khách, bảo hành = Badge DS', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Máy đã lắp' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm máy' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab máy' })).toBeTruthy()
  expect(within(toolbar).getByRole('button', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  expect(within(toolbar).getByRole('button', { name: 'Xuất Excel' })).toBeTruthy()
  expect(screen.queryByRole('combobox', { name: 'Chế độ xem' })).toBeNull()
  const table = screen.getByRole('table', { name: 'Máy đã lắp' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Serial/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'SN-MAU-1' }).getAttribute('href')).toBe('/may/SN-MAU-1')
  expect(within(table).getByRole('link', { name: 'Khách mẫu' }).getAttribute('href')).toBe('/khach/k1')
  expect(within(table).getByText('Chưa kích hoạt').closest('[data-color]')?.getAttribute('data-color')).toBe('secondary')
  // Lọc Bảo hành trên URL hiện thành chip ở NHÃN CỘT (khuôn F), không còn hàng chip dưới thanh công cụ.
  expect(within(table).getByRole('columnheader', { name: /Bảo hành: Chưa kích hoạt/ })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
  // Bộ đếm duy nhất = phân trang.
  expect(screen.getByText(/trên 1 máy/)).toBeTruthy()
})

test('bấm tab tự tạo → URL = bộ lọc của tab + ?tab=id, bỏ trang', async () => {
  const user = userEvent.setup()
  mo()
  // Không số đếm trên tab.
  expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Tất cả')
  await user.click(screen.getByRole('tab', { name: /Chưa kích hoạt/ }))
  expect(replace).toHaveBeenLastCalledWith('/?bh=chua_kich_hoat&tab=t1', { scroll: false })
})

test('rỗng khi lọc → EmptyState kiểu lọc, bảng vẫn có tiêu đề', () => {
  mo([], false)
  expect(screen.getByRole('table', { name: 'Máy đã lắp' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Không tìm thấy máy nào' })).toBeTruthy()
  expect(screen.queryByRole('checkbox')).toBeNull()
})

test('sắp theo tiêu đề cột → URL cot/chieu', async () => {
  const user = userEvent.setup()
  mo()
  const table = screen.getByRole('table', { name: 'Máy đã lắp' })
  await user.click(within(within(table).getByRole('columnheader', { name: /^Khách/ })).getByRole('button'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Tên từ Z đến A' }))
  expect(push).toHaveBeenLastCalledWith('/?q=an&bh=chua_kich_hoat&cot=customer_name&chieu=desc', { scroll: false })
})

test('"Xoá bộ lọc" bỏ điều kiện trường, giữ tìm', async () => {
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
  expect(push).toHaveBeenLastCalledWith('/?q=an', { scroll: false })
})

test('chuột phải dòng máy → Mở chi tiết / Sao chép serial / Sao chép đường dẫn', async () => {
  mo()
  fireEvent.contextMenu(screen.getByRole('link', { name: 'SN-MAU-1' }).closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Sao chép serial' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết' }))
  expect(push).toHaveBeenLastCalledWith('/may/SN-MAU-1')
})
test('cột ngày "Ngày lắp" lọc ở nhãn cột: đang lọc → chip; bấm tiêu đề mở pop lọc có chân "Định dạng ngày"', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&lap=hom-nay~'
  try {
    mo()
    const table = screen.getByRole('table', { name: 'Máy đã lắp' })
    const th = within(table).getByRole('columnheader', { name: /Ngày lắp: hôm nay/i })
    await user.click(within(th).getAllByRole('button')[0])
    expect(await screen.findByRole('group', { name: 'Định dạng ngày' })).toBeTruthy()
  } finally {
    sp.v = 'q=an&bh=chua_kich_hoat&trang=2'
  }
})
