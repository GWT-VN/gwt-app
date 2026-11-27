// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import type { SerialRow, TrangThai } from '@/app/actions'
import { KhungChon } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { DsRoot } from '@/components/ui/ds-root'
import { BangSerial } from './BangSerial'

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/serial',
  useSearchParams: () => new URLSearchParams('q=sn&trang=2'),
}))
vi.mock('@/app/actions', () => ({
  luuTabView: vi.fn(), capNhatTabView: vi.fn(), doiTenTabView: vi.fn(), xoaTabView: vi.fn(), datTrangThaiSerial: vi.fn(),
}))

const tt = (code: string, nhan: string): TrangThai => ({ code, nhan, mau: 'slate', thu_tu: 1, he_thong: false, cho_dat_tay: true, hoat_dong: true })
const row: SerialRow = {
  serial: 'SN1', code: null, model: 'RO-9', internal_code: 'M01', ma_quoc_te: null, ten_noi_bo: 'Máy RO', po: null,
  trang_thai: 'ton_kho', trang_thai_luc: null, trang_thai_ghi_chu: 'Kho Vạn Bảo',
}

function mo() {
  render(
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={['SN1']} tong={1} bat thamSo={{}}>
          <BangSerial
            rows={[row]} tong={1} trang={1} soTrang={1} choChon choDoiTrangThai={false}
            dsTrangThai={[tt('ton_kho', 'Tồn kho'), tt('loi', 'Lỗi')]} tabRieng={[]} quyenTabChung={false}
            nutChinh={<button>Nhập kho</button>}
          />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>,
  )
}

test('Kho serial dùng khuôn Ticket F: tìm ở đầu, hàng tab trạng thái, cột ghim, link sang máy', () => {
  mo()
  const toolbar = screen.getByRole('heading', { name: 'Kho serial' }).closest('[data-slot="data-view-toolbar"]') as HTMLElement
  expect(within(toolbar).getByRole('textbox', { name: 'Tìm serial và mã máy' })).toBeTruthy()
  expect(within(toolbar).getByRole('tablist', { name: 'Tab serial' })).toBeTruthy()
  expect(within(toolbar).getByRole('button', { name: /Lọc/ })).toBeTruthy()
  const table = screen.getByRole('table', { name: 'Kho serial' })
  expect(table.getAttribute('data-layout')).toBe('fixed')
  expect(within(table).getByRole('columnheader', { name: /Serial/ }).hasAttribute('data-ghim')).toBe(true)
  expect(within(table).getByRole('link', { name: 'SN1' }).getAttribute('href')).toBe('/may/SN1')
  // Ghi chú lần đổi trạng thái gần nhất — trước nằm dòng phụ dưới ô Trạng thái, nay là cột.
  expect(within(table).getByText('Kho Vạn Bảo')).toBeTruthy()
})

test('tab trạng thái = bộ lọc tt chọn sẵn (cùng tham số chip cũ)', async () => {
  const user = userEvent.setup()
  mo()
  await user.click(screen.getByRole('tab', { name: /Lỗi/ }))
  expect(replace).toHaveBeenLastCalledWith('/serial?tt=loi&view=loi', { scroll: false })
})
