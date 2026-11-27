// @vitest-environment jsdom
// Bốn danh sách khu Sales theo khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md): tìm trong thanh công cụ,
// hàng tab (tab cố định = bộ lọc chọn sẵn), bảng ghim cột đầu, link sang chi tiết. Khuôn F bản chốt 27/11: không số trên tab,
// lọc ở nhãn cột + nút "Xoá bộ lọc", bộ đếm duy nhất ở PhanTrang, chuột phải dòng → menu mở / sao chép.
import type { ReactNode } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangDon } from './BangDon'
import { BangCtkm } from './ctkm/BangCtkm'
import { BangGia } from './gia/BangGia'
import { BangKhachSales } from './khach/BangKhachSales'
import { TRUONG_DON } from './truong-sales'

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), path: '/sales', query: '' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, refresh: vi.fn() }),
  usePathname: () => nav.path,
  useSearchParams: () => new URLSearchParams(nav.query),
}))
vi.mock('@/app/actions', () => ({ luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn() }))
vi.mock('./ctkm/actions', () => ({ banHanh: vi.fn(), ketThucSom: vi.fn(), nhanBan: vi.fn(), xoaNhap: vi.fn() }))

beforeEach(() => {
  nav.push.mockReset()
  nav.replace.mockReset()
})

const chung = { tong: 1, trang: 1, soTrang: 1, tabRieng: [], quyenTabChung: false }
const khung = (children: ReactNode) =>
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={[]} tong={0} bat={false} thamSo={{}}>{children}</KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
const toolbar = (tieuDe: string) => screen.getByRole('heading', { name: tieuDe }).closest('[data-slot="data-view-toolbar"]') as HTMLElement

const don = {
  order_code: 'ORD-1', order_date: '2026-11-20', source_tab: 'DON_POE', customer_name: 'Khách A', province: 'Hà Nội',
  fulfillment_status: 'Đã giao', payment_status: 'Đã thu', line_count: 1, total_vat: 1200000, is_app: true,
}

test('Đơn hàng: tìm + tab + Lọc trong thanh công cụ, bảng ghim Mã đơn, link sang chi tiết', () => {
  nav.path = '/sales'
  nav.query = 'q=an&trang=2'
  khung(
    <BangDon
      {...chung}
      rows={[don]}
      sapXep={{ cot: 'ngay', tang: false, macDinh: true }}
      truong={TRUONG_DON.map((x) => ({ ...x, tuyChon: [] }))}
    />,
  )
  const tb = toolbar('Đơn hàng')
  expect(within(tb).getByRole('textbox', { name: 'Tìm đơn hàng' })).toBeTruthy()
  expect(within(tb).getByRole('tablist', { name: 'Tab đơn' })).toBeTruthy()
  expect(within(tb).getByRole('button', { name: /Lọc/ })).toBeTruthy()
  expect(within(tb).getByRole('link', { name: 'Tạo đơn' }).getAttribute('href')).toBe('/sales/don/moi')
  const table = screen.getByRole('table', { name: 'Đơn hàng' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Mã đơn/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: /ORD-1/ }).getAttribute('href')).toBe('/sales/don/ORD-1')
  // Nhãn "App" vẫn còn (đơn tạo trên app sửa/xoá được).
  expect(within(table).getByText('App')).toBeTruthy()
  // Bộ đếm duy nhất = PhanTrang dưới bảng.
  expect(screen.getByText(/trên 1 đơn/)).toBeTruthy()
})

test('Đơn hàng: đang lọc → chip ở nhãn cột (không còn hàng chip), "Xoá bộ lọc" bỏ điều kiện trường, giữ từ khoá', async () => {
  nav.path = '/sales'
  nav.query = 'q=an&tt=%C4%90%C3%A3+giao'
  const user = userEvent.setup()
  khung(
    <BangDon
      {...chung}
      rows={[don]}
      sapXep={{ cot: 'ngay', tang: false, macDinh: true }}
      truong={TRUONG_DON.map((x) => ({ ...x, tuyChon: x.id === 'tt' ? [{ giaTri: 'Đã giao', nhan: 'Đã giao' }] : [] }))}
    />,
  )
  expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
  const table = screen.getByRole('table', { name: 'Đơn hàng' })
  expect(within(table).getByRole('columnheader', { name: /Tình trạng: Đã giao/ })).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
  expect(nav.push).toHaveBeenLastCalledWith('/sales?q=an', { scroll: false })
})

test('Đơn hàng: chuột phải dòng → Mở chi tiết / Sao chép mã / Sao chép đường dẫn', async () => {
  nav.path = '/sales'
  nav.query = ''
  khung(<BangDon {...chung} rows={[don]} sapXep={{ cot: 'ngay', tang: false, macDinh: true }} truong={[]} />)
  fireEvent.contextMenu(screen.getByRole('link', { name: /ORD-1/ }).closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Mở chi tiết' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép mã đơn' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép đường dẫn' })).toBeTruthy()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Mở chi tiết' }))
  expect(nav.push).toHaveBeenLastCalledWith('/sales/don/ORD-1')
})

test('Đơn hàng: bấm tab POU thay bộ lọc bằng nhom=DON_POU (không còn ?tab=DON_… đụng tab tự tạo)', async () => {
  nav.path = '/sales'
  nav.query = 'q=an&tt=Mới&trang=2'
  const user = userEvent.setup()
  khung(<BangDon {...chung} rows={[don]} sapXep={{ cot: 'ngay', tang: false, macDinh: true }} truong={[]} />)
  await user.click(screen.getByRole('tab', { name: /POU/ }))
  expect(nav.replace).toHaveBeenLastCalledWith('/sales?nhom=DON_POU&view=pou', { scroll: false })
})

test('Đơn hàng: không có đơn khi đang lọc → trạng thái rỗng kiểu lọc', () => {
  nav.path = '/sales'
  nav.query = 'q=khong-co'
  khung(<BangDon {...chung} tong={0} rows={[]} sapXep={{ cot: 'ngay', tang: false, macDinh: true }} truong={[]} />)
  expect(screen.getByRole('heading', { name: 'Không có đơn nào khớp' })).toBeTruthy()
})

test('Khách Sales: tab "Trùng SĐT" (không số — khuôn F), bấm → lọc trùng + xếp theo SĐT', async () => {
  nav.path = '/sales/khach'
  nav.query = ''
  const user = userEvent.setup()
  khung(
    <BangKhachSales
      {...chung}
      rows={[{ customer_code: 'KH001', name: 'Khách B', phone: '0900000000', province: 'Huế', total_orders: 2, last_order_date: '2026-11-01' }]}
      sapXep={{ cot: 'mua', tang: false, macDinh: true }}
      truong={[]}
      taoKhach={<button>Tạo khách</button>}
    />,
  )
  const tb = toolbar('Khách hàng')
  expect(within(tb).getByRole('textbox', { name: 'Tìm khách hàng' })).toBeTruthy()
  expect(within(tb).getByRole('tablist', { name: 'Tab khách' })).toBeTruthy()
  expect(screen.getByRole('tab', { name: 'Tất cả', selected: true })).toBeTruthy()
  // Khuôn F 27/11: không số đếm trên tab.
  expect(screen.getByRole('tab', { name: /Trùng SĐT/ }).textContent).not.toMatch(/\d/)
  expect(within(screen.getByRole('table', { name: 'Khách hàng' })).getByRole('link', { name: 'Khách B' }).getAttribute('href')).toBe('/sales/khach/KH001')
  await user.click(screen.getByRole('tab', { name: /Trùng SĐT/ }))
  expect(nav.replace).toHaveBeenLastCalledWith('/sales/khach?trung_sdt=1&cot=phone&chieu=asc&view=trung-sdt', { scroll: false })
})

test('Bảng giá: tìm trong thanh công cụ, link chính sách / đối tác, sắp theo tiêu đề cột', async () => {
  nav.path = '/sales/gia'
  nav.query = 'q=loc'
  const user = userEvent.setup()
  khung(
    <BangGia
      {...chung}
      rows={[{ ma: 'MSP', ten: 'Máy lọc', gia_vat: 5000000, vat_pct: 0.1, vat_loai: null }]}
      sapXep={{ cot: 'gia', tang: false, macDinh: true }}
      lienKet={<a href="/sales/gia/chinh-sach">Chính sách giá đại lý</a>}
    />,
  )
  const tb = toolbar('Bảng giá niêm yết')
  expect(within(tb).getByRole('textbox', { name: 'Tìm sản phẩm' })).toBeTruthy()
  expect(within(tb).getByRole('tablist', { name: 'Tab sản phẩm' })).toBeTruthy()
  expect(within(tb).getByRole('link', { name: 'Chính sách giá đại lý' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Bảng giá niêm yết' })
  expect(within(table).getByRole('row', { name: /MSP.*Máy lọc.*10%/ })).toBeTruthy()
  await user.click(within(within(table).getByRole('columnheader', { name: /^Tên sản phẩm/ })).getByRole('button'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Tên từ A đến Z' }))
  expect(nav.push).toHaveBeenLastCalledWith('/sales/gia?q=loc&cot=ten&chieu=asc', { scroll: false })
  // Không trang chi tiết → menu chuột phải chỉ có Sao chép mã.
  fireEvent.contextMenu(within(table).getByRole('row', { name: /MSP/ }))
  expect(await screen.findByRole('menuitem', { name: 'Sao chép mã sản phẩm' })).toBeTruthy()
  expect(screen.queryByRole('menuitem', { name: 'Mở chi tiết' })).toBeNull()
})

test('CTKM: lưới thẻ thành bảng; tab "Đang chạy" = tt=ban_hanh; thao tác dòng ở menu "…"', async () => {
  nav.path = '/sales/ctkm'
  nav.query = ''
  const user = userEvent.setup()
  khung(
    <BangCtkm
      {...chung}
      rows={[{
        id: 'c1', ma: 'KM12', ten: 'Khuyến mãi tháng 12', tu_ngay: '2026-12-01', den_ngay: null, kieu_giam: 'PCT', muc_chung: 10,
        giam_toi_da: null, nhom_khach: 'tat_ca', trang_thai: 'nhap', so_kenh: 0, so_sp: 0, so_qua: 0, kenh_nhan: [],
      }]}
      sapXep={{ cot: 'ngay', tang: false, macDinh: true }}
      truong={[]}
      quyen={{ soan: true, duyet: false }}
    />,
  )
  const tb = toolbar('Chương trình khuyến mãi')
  expect(within(tb).getByRole('textbox', { name: 'Tìm chương trình' })).toBeTruthy()
  expect(within(tb).getByRole('link', { name: 'Tạo chương trình' }).getAttribute('href')).toBe('/sales/ctkm/moi')
  const table = screen.getByRole('table', { name: 'Chương trình khuyến mãi' })
  expect(within(table).getByRole('link', { name: 'Khuyến mãi tháng 12' }).getAttribute('href')).toBe('/sales/ctkm/c1')
  expect(within(table).getByText('chờ duyệt')).toBeTruthy()
  expect(within(table).getByText(/chưa chọn kênh/)).toBeTruthy()
  await user.click(within(table).getByRole('button', { name: 'Thao tác chương trình Khuyến mãi tháng 12' }))
  expect(screen.getByRole('menuitem', { name: 'Nhân bản sang tháng sau' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Xoá nháp' })).toBeTruthy()
  // Không có quyền duyệt → không có Ban hành.
  expect(screen.queryByRole('menuitem', { name: 'Ban hành' })).toBeNull()
  await user.keyboard('{Escape}')
  await user.click(screen.getByRole('tab', { name: /Đang chạy/ }))
  expect(nav.replace).toHaveBeenLastCalledWith('/sales/ctkm?tt=ban_hanh&view=dang-chay', { scroll: false })
})
