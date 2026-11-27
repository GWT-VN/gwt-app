// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { luuBangView, type BangView } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangKhach } from './BangKhach'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/khach-hang',
  useSearchParams: () => new URLSearchParams('q=an&thieu_sdt=1&trang=2'),
}))
vi.mock('@/app/actions', () => ({ luuBangView: vi.fn(), xoaBangView: vi.fn() }))

const khach = {
  id: 'demo', full_name: 'Khách mẫu', ma_kh: 'KH-MAU', customer_code: null,
  primary_phone: null, address: null, province: null, source: null, notes: null, machines: 2,
}

function mo(rows = [khach], choChon = true, views: BangView[] = []) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={rows.map((r) => r.id)} tong={rows.length} bat={choChon} thamSo={{}}>
          <BangKhach
            rows={rows} choChon={choChon} choViewChung={false} views={views}
            tong={rows.length} trang={1} soTrang={1}
            sapXep={{ cot: 'full_name', tang: true, macDinh: true }}
            soThieuSdt={1} soKenhTuDong={0}
            taoKhach={<button>Tạo khách</button>} xuatExcel={<button>Xuất Excel</button>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Khách hàng dùng thanh công cụ, cột ghim và bố cục cố định của DS', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Khách hàng' }).closest('[data-slot="data-view-toolbar"]')!
  expect(within(toolbar as HTMLElement).getByRole('textbox', { name: 'Tìm khách hàng' })).toBeTruthy()
  expect(within(toolbar as HTMLElement).getByRole('button', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Khách hàng' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Khách/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'Khách mẫu' }).getAttribute('href')).toBe('/khach/demo')
})

test('Bảng vẫn hiện tiêu đề và dùng trạng thái rỗng DS khi lọc', () => {
  mo([], false)
  expect(screen.getByRole('table', { name: 'Khách hàng' }).querySelectorAll('col')).toHaveLength(7)
  expect(screen.getByRole('heading', { name: 'Không tìm thấy khách nào' })).toBeTruthy()
  expect(screen.queryByRole('checkbox')).toBeNull()
})

test('chế độ xem cũ giữ vị trí cột SĐT và tiêu đề cột vẫn sắp xếp theo URL', async () => {
  const user = userEvent.setup()
  mo([khach], true, [{ id: 'view', ten: 'Liên hệ', chu: 'ca-nhan', cot: ['full_name', 'primary_phone', 'ma_kh'] }])
  await user.click(screen.getByRole('button', { name: 'Chế độ xem' }))
  await user.keyboard('{Enter}')
  const table = screen.getByRole('table', { name: 'Khách hàng' })
  expect(Array.from(table.querySelectorAll('th[data-cot]'), (th) => th.getAttribute('data-cot')))
    .toEqual(['full_name', 'primary_phone', 'ma_kh'])
  const khachHead = within(table).getByRole('columnheader', { name: /^Khách,/ })
  expect(khachHead.getAttribute('aria-sort')).toBe('ascending')
  await user.click(within(khachHead).getByRole('button'))
  expect(screen.queryByRole('menuitem', { name: 'Bỏ sắp xếp' })).toBeNull()
  await user.keyboard('{Escape}')
  await user.click(within(within(table).getByRole('columnheader', { name: /^Mã KH / })).getByRole('button'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Mã lớn trước' }))
  expect(push).toHaveBeenLastCalledWith('/khach-hang?q=an&thieu_sdt=1&cot=ma_kh&chieu=desc', { scroll: false })
})

test('lưu chế độ xem lỗi giữ lại tên đã nhập', async () => {
  vi.mocked(luuBangView).mockResolvedValueOnce({ ok: false, error: 'Không lưu được tên này.' })
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('button', { name: 'Lưu chế độ xem' }))
  const ten = screen.getByRole('textbox', { name: 'Tên chế độ xem' })
  await user.type(ten, 'Cột hỗ trợ')
  await user.click(screen.getByRole('button', { name: 'Lưu' }))
  expect((await screen.findByRole('alert')).textContent).toBe('Không lưu được tên này.')
  expect((ten as HTMLInputElement).value).toBe('Cột hỗ trợ')
})
