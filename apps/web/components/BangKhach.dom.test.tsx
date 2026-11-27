// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { TabView } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangKhach } from './BangKhach'

const { push, replace, sp } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), sp: { v: 'q=an&thieu_sdt=1&trang=2' } }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/khach-hang',
  useSearchParams: () => new URLSearchParams(sp.v),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))

const khach: Parameters<typeof BangKhach>[0]['rows'][number] = {
  id: 'demo', full_name: 'Khách mẫu', ma_kh: 'KH-MAU', customer_code: null,
  primary_phone: null, address: null, province: null, source: null, notes: null, machines: 2,
}

function mo(rows = [khach], choChon = true, tabRieng: TabView[] = []) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={rows.map((r) => r.id)} tong={rows.length} bat={choChon} thamSo={{}}>
          <BangKhach
            rows={rows} choChon={choChon} tabRieng={tabRieng} quyenTabChung={false}
            tuyChonLoc={{ tinh: ['Hà Nội'], nguon: [] }}
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'full_name', tang: true, macDinh: true }}
            taoKhach={<button>Tạo khách</button>} xuatExcel={<button>Xuất Excel</button>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Khách hàng dùng khuôn Ticket F: tìm ở đầu, hàng tab, ⚙, cột ghim, bố cục cố định', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Khách hàng' }).closest('[data-slot="data-view-toolbar"]')!
  expect(within(toolbar as HTMLElement).getByRole('textbox', { name: 'Tìm khách hàng' })).toBeTruthy()
  expect(within(toolbar as HTMLElement).getByRole('button', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  expect(within(toolbar as HTMLElement).getByRole('tablist', { name: 'Tab khách' })).toBeTruthy()
  expect(within(toolbar as HTMLElement).getByRole('button', { name: 'Thêm tab' })).toBeTruthy()
  // Không còn ô "Chế độ xem" / nút "Lưu chế độ xem" riêng của màn.
  expect(screen.queryByRole('button', { name: 'Lưu chế độ xem' })).toBeNull()
  const table = screen.getByRole('table', { name: 'Khách hàng' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Khách/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'Khách mẫu' }).getAttribute('href')).toBe('/khach/demo')
})

test('tab cố định = bộ lọc chọn sẵn; không số đếm trên tab, bộ đếm duy nhất ở phân trang', async () => {
  const user = userEvent.setup()
  mo()
  expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Tất cả')
  expect(screen.getByRole('tab', { name: 'Cần xin SĐT' }).textContent).not.toMatch(/\d/)
  expect(screen.getByText(/trên 1 khách/)).toBeTruthy()
  // Không còn hàng chip "Điều kiện đang áp dụng" dưới thanh công cụ.
  expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
  await user.click(screen.getByRole('tab', { name: /Kênh cần soát/ }))
  // Bấm tab thay bộ lọc cũ (thieu_sdt, q) bằng bộ lọc của tab, bỏ trang.
  expect(replace).toHaveBeenLastCalledWith('/khach-hang?kenh_tu_dong=1&view=kenh', { scroll: false })
})

test('Bảng vẫn hiện tiêu đề và dùng trạng thái rỗng DS khi lọc', () => {
  mo([], false)
  expect(screen.getByRole('table', { name: 'Khách hàng' }).querySelectorAll('col')).toHaveLength(7)
  expect(screen.getByRole('heading', { name: 'Không tìm thấy khách nào' })).toBeTruthy()
  expect(screen.queryByRole('checkbox')).toBeNull()
})

test('tiêu đề cột sắp xếp theo URL, sắp mặc định không có "Bỏ sắp xếp"', async () => {
  const user = userEvent.setup()
  mo()
  const table = screen.getByRole('table', { name: 'Khách hàng' })
  const khachHead = within(table).getByRole('columnheader', { name: /^Khách/ })
  expect(khachHead.getAttribute('aria-sort')).toBe('ascending')
  // Sắp MẶC ĐỊNH: không mũi tên / không "đang sắp" ở nhãn (CEO 27/11) — aria-sort vẫn nói thật.
  expect(khachHead.textContent).not.toMatch(/đang sắp/)
  expect(khachHead.querySelector('svg[class*="arrow" i], [data-on]')).toBeNull()
  await user.click(within(khachHead).getByRole('button'))
  expect(screen.queryByRole('menuitem', { name: 'Bỏ sắp xếp' })).toBeNull()
  await user.keyboard('{Escape}')
  await user.click(within(within(table).getByRole('columnheader', { name: /^Mã KH / })).getByRole('button'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Mã lớn trước' }))
  expect(push).toHaveBeenLastCalledWith('/khach-hang?q=an&thieu_sdt=1&cot=ma_kh&chieu=desc', { scroll: false })
})

test('lọc ở nhãn cột: đang lọc Tỉnh/TP → tiêu đề thành chip; "Xoá bộ lọc" bỏ điều kiện trường, giữ tìm', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&tinh=H%C3%A0+N%E1%BB%99i'
  try {
    mo([{ ...khach, province: 'Hà Nội' }])
    const table = screen.getByRole('table', { name: 'Khách hàng' })
    expect(within(table).getByRole('columnheader', { name: /Tỉnh\/TP: Hà Nội/ })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
    expect(push).toHaveBeenLastCalledWith('/khach-hang?q=an', { scroll: false })
  } finally {
    sp.v = 'q=an&thieu_sdt=1&trang=2'
  }
})

test('chuột phải dòng khách → menu Mở chi tiết / Sao chép mã / Sao chép đường dẫn', async () => {
  mo()
  const dong = screen.getByRole('link', { name: 'Khách mẫu' }).closest('tr')!
  fireEvent.contextMenu(dong)
  expect(await screen.findByRole('menuitem', { name: 'Mở chi tiết' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép mã khách' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết' }))
  expect(push).toHaveBeenLastCalledWith('/khach/demo')
})
