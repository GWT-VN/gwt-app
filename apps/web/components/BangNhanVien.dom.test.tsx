// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangNhanVien } from './BangNhanVien'

const { push, replace, suaNhanVien } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), suaNhanVien: vi.fn(async () => ({ ok: true })),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/nhan-vien',
  useSearchParams: () => new URLSearchParams('q=an'),
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
        <BangNhanVien ds={ds} tong={3} toiId="" demTab={{ 'tat-ca': 3, 'chua-vai-tro': 1 }}
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
  expect(screen.getByRole('tab', { name: /Chưa gán vai trò/ }).textContent).toContain('1')
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
