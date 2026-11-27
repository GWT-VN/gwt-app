// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangNhanVien } from './BangNhanVien'

const { push, replace, suaNhanVien, sp } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), suaNhanVien: vi.fn(async () => ({ ok: true })), sp: { v: 'q=an' },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/nhan-vien',
  useSearchParams: () => new URLSearchParams(sp.v),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(),
}))
vi.mock('@/lib/nen-tang/nhan-su', () => ({
  suaNhanVien, capMatKhauMoi: vi.fn(), demThamChieuNhanSu: vi.fn(), doiTenNhanVien: vi.fn(), guiLaiMatKhau: vi.fn(), xoaNhanSu: vi.fn(),
}))

const nv = { id: 'n1', ten: 'An', vai_tro: ['cs'], email: 'an@gwt.vn', hoat_dong: true }

function mo(ds = [nv]) {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <BangNhanVien ds={ds} tong={3} toiId=""
          nutChinh={<a href="/nhan-vien/phan-quyen">Phân quyền theo vai trò</a>} />
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Nhân viên: đầu khuôn F (tìm, tab, Lọc) + ma trận vai trò với cột Người ghim', async () => {
  const user = userEvent.setup()
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Nhân viên' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm nhân viên' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab nhân viên' })).toBeTruthy()
  expect(within(toolbar).getByRole('link', { name: 'Phân quyền theo vai trò' })).toBeTruthy()
  // Khuôn F: không số đếm trên tab; bộ đếm duy nhất = số người khớp lọc ở phân trang.
  expect(screen.getByRole('tab', { name: /Chưa gán vai trò/ }).textContent).toBe('Chưa gán vai trò')
  expect(screen.getByText(/trên 1 nhân viên/)).toBeTruthy()
  // Bấm tab cố định → bộ lọc của tab thay bộ lọc đang có (bỏ q).
  await user.click(screen.getByRole('tab', { name: /Đã khoá/ }))
  expect(replace).toHaveBeenLastCalledWith('/nhan-vien?tt=khoa&view=khoa', { scroll: false })
  const bang = screen.getByRole('table', { name: 'Nhân viên theo bộ phận' })
  expect(within(bang).getByRole('textbox', { name: 'Tên nhân viên an@gwt.vn' }).closest('td')!.hasAttribute('data-ghim')).toBe(true)
  // Tick vẫn lưu ngay như cũ.
  await user.click(within(bang).getByRole('checkbox', { name: /an@gwt\.vn — .*Kho/ }))
  expect(suaNhanVien).toHaveBeenCalledWith('n1', { vai_tro: expect.arrayContaining(['cs', 'kho']) })
})

test('không ai khớp bộ lọc → EmptyState', () => {
  mo([])
  expect(screen.getByRole('heading', { name: 'Không có nhân viên nào khớp' })).toBeTruthy()
})

test('ma trận không có tiêu đề cột lọc → điều kiện hiện chip cạnh "Xoá bộ lọc"; Xoá bỏ điều kiện trường, giữ tìm', async () => {
  const user = userEvent.setup()
  sp.v = 'q=an&tt=khoa'
  try {
    mo()
    expect(screen.queryByRole('region', { name: 'Điều kiện đang áp dụng' })).toBeNull()
    const toolbar = screen.getByRole('heading', { name: 'Nhân viên' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
    expect(within(toolbar).getAllByRole('button', { name: /Trạng thái.*Đã khoá/ }).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
    expect(push).toHaveBeenLastCalledWith('/nhan-vien?q=an', { scroll: false })
  } finally {
    sp.v = 'q=an'
  }
})

test('chuột phải dòng → Sao chép tên / email (không có trang chi tiết)', async () => {
  mo()
  const bang = screen.getByRole('table', { name: 'Nhân viên theo bộ phận' })
  fireEvent.contextMenu(within(bang).getByRole('checkbox', { name: /an@gwt\.vn — .*Kho/ }).closest('tr')!)
  expect(await screen.findByRole('menuitem', { name: 'Sao chép tên' })).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Sao chép email' })).toBeTruthy()
})