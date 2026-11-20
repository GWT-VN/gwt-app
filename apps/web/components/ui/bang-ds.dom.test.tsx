// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// next/navigation giả: URL hiện hành đổi được giữa các test, router.push ghi lại đích.
const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), path: '/ds', qs: '' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => nav.path,
  useSearchParams: () => new URLSearchParams(nav.qs),
}))

import {
  BoLocChon,
  CauHinhBang,
  hrefBoLoc,
  KhungChon,
  LocNgay,
  OChonDong,
  OChonTatCa,
  PhanTrang,
  ThanhDaChon,
  ThanhDangLoc,
} from '@/bang'
import { CauHinhBangDs } from './bang-ds'
import { DsRoot } from './ds-root'

const LOAI = [
  { giaTri: 'ro-ri', nhan: 'Rò rỉ nước' },
  { giaTri: 'bao-loi', nhan: 'Báo lỗi E1' },
]

const Ds = ({ children }: { children: ReactNode }) => (
  <DsRoot>
    <CauHinhBangDs>{children}</CauHinhBangDs>
  </DsRoot>
)

beforeEach(() => {
  nav.push.mockReset()
  nav.qs = ''
})

describe('khe OChon — BoLocChon / LocNgay', () => {
  test('không bơm OChon → BoLocChon vẫn là <select> cũ (màn cũ không đổi)', () => {
    const { container, unmount } = render(<BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />)
    expect(container.querySelector('select')).not.toBeNull()
    unmount()
    // Bọc CauHinhBang của dự án (như app/layout.tsx) cũng không đổi.
    const b = render(
      <CauHinhBang tenCot={{ han: 'Hạn' }}>
        <BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />
      </CauHinhBang>,
    )
    expect(b.container.querySelector('select')).not.toBeNull()
    expect(b.container.querySelector('button')).toBeNull()
  })

  test('CauHinhBangDs → combobox DS (nút, không select); chọn mục đẩy URL đúng param, xoá `trang`, giữ tham số khác', async () => {
    nav.qs = 'q=may&trang=3'
    const user = userEvent.setup()
    const { container } = render(
      <Ds>
        <BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />
      </Ds>,
    )
    expect(container.querySelector('select')).toBeNull()
    const nut = screen.getByRole('combobox', { name: 'Loại lỗi' })
    expect(nut.tagName).toBe('BUTTON')
    expect(nut.textContent).toContain('Loại lỗi: Tất cả')
    await user.click(nut)
    await user.click(await screen.findByRole('option', { name: 'Rò rỉ nước' }))
    expect(nav.push).toHaveBeenLastCalledWith('/ds?q=may&loai=ro-ri')
  })

  test('CauHinhBangDs: chọn lại "Tất cả" → bỏ hẳn param (không để loai rỗng trên URL)', async () => {
    nav.qs = 'loai=ro-ri&trang=2'
    const user = userEvent.setup()
    render(
      <Ds>
        <BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />
      </Ds>,
    )
    const nut = screen.getByRole('combobox', { name: 'Loại lỗi' })
    expect(nut.textContent).toContain('Rò rỉ nước')
    await user.click(nut)
    await user.click(await screen.findByRole('option', { name: 'Loại lỗi: Tất cả' }))
    expect(nav.push).toHaveBeenLastCalledWith('/ds')
  })

  test('LocNgay: không bơm → <select> chế độ; DS → combobox chế độ, đổi sang "Trong khoảng" hiện 2 ô ngày', async () => {
    const cu = render(<LocNgay nhan="Ngày tạo" />)
    expect(cu.container.querySelector('select')).not.toBeNull()
    cu.unmount()
    const user = userEvent.setup()
    const { container } = render(
      <Ds>
        <LocNgay nhan="Ngày tạo" />
      </Ds>,
    )
    expect(container.querySelector('select')).toBeNull()
    await user.click(screen.getByRole('combobox', { name: 'Ngày tạo: cách lọc' }))
    await user.click(await screen.findByRole('option', { name: 'Ngày tạo · Trong khoảng' }))
    expect(container.querySelectorAll('input[type="date"]').length).toBe(2)
  })
})

describe('FilterBar — ThanhDangLoc + ChipSapXep với giaoDien DS', () => {
  test('hrefBoLoc bỏ ĐÚNG một điều kiện (và `trang`), giữ điều kiện khác + sắp xếp', () => {
    expect(hrefBoLoc('/ds', { q: 'may', loai: 'ro-ri', cot: 'han', chieu: 'desc', trang: '2' }, 'loai')).toBe(
      '/ds?q=may&cot=han&chieu=desc',
    )
    expect(hrefBoLoc('/ds', { ngtu: '2026-11-01', ngden: '2026-11-20', q: undefined }, 'ngtu', 'ngden')).toBe('/ds')
    expect(hrefBoLoc('/ds', new URLSearchParams('q=a&loai=b'), 'q')).toBe('/ds?loai=b')
  })

  test('chip × bỏ đúng một điều kiện; số dòng aria-live; vùng có tên; icon DS thay chữ ×', () => {
    nav.qs = 'q=may&loai=ro-ri&cot=han&chieu=desc'
    const tham = { q: 'may', loai: 'ro-ri', cot: 'han', chieu: 'desc' }
    render(
      <Ds>
        <ThanhDangLoc
          dieuKien={[
            { nhan: 'Tìm', giaTri: 'may', href: hrefBoLoc('/ds', tham, 'q') },
            { nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước', href: hrefBoLoc('/ds', tham, 'loai') },
          ]}
          hienThi={15}
          tong={19}
          nhan="ticket"
          sapXep={{ cot: 'han', tang: false, macDinh: false }}
        />
      </Ds>,
    )
    const vung = screen.getByRole('region', { name: 'Điều kiện đang áp dụng' })
    const bo = within(vung).getByRole('link', { name: 'Bỏ lọc Loại lỗi' })
    expect(bo.getAttribute('href')).toBe('/ds?q=may&cot=han&chieu=desc')
    expect(within(vung).getByRole('link', { name: 'Bỏ lọc Tìm' }).getAttribute('href')).toBe('/ds?loai=ro-ri&cot=han&chieu=desc')
    expect(bo.querySelector('svg')).not.toBeNull()
    expect(bo.textContent).toBe('')
    const dem = within(vung).getByText('Hiện 15 trên 19 ticket')
    expect(dem.getAttribute('aria-live')).toBe('polite')
    // Chip sắp xếp: × bỏ cột/chiều, giữ lọc
    expect(within(vung).getByRole('link', { name: 'Bỏ sắp xếp, về thứ tự mặc định' }).getAttribute('href')).toBe('/ds?q=may&loai=ro-ri')
    expect(within(vung).getByRole('link', { name: 'Xoá lọc' }).getAttribute('href')).toBe('/ds')
  })

  test('khe `phai`: nút thêm (vd Lưu bộ lọc) nằm cạnh Xoá lọc', () => {
    render(
      <Ds>
        <ThanhDangLoc dieuKien={[{ nhan: 'Tìm', giaTri: 'x' }]} hienThi={1} tong={1} phai={<button type="button">Lưu bộ lọc</button>} />
      </Ds>,
    )
    const luu = screen.getByRole('button', { name: 'Lưu bộ lọc' })
    expect(luu.parentElement).toBe(screen.getByRole('link', { name: 'Xoá lọc' }).parentElement)
  })
})

describe('Pagination — PhanTrang', () => {
  test('1 trang → không render gì (cả hai chế độ)', () => {
    expect(render(<PhanTrang trang={1} soTrang={1} />).container.innerHTML).toBe('')
    expect(
      render(
        <Ds>
          <PhanTrang trang={1} soTrang={1} tong={9} moiTrang={15} nhan="ticket" />
        </Ds>,
      ).container.querySelector('nav'),
    ).toBeNull()
  })

  test('DS trang 1/2: nav "Phân trang", "Trang trước" disabled (không ẩn), "Trang sau" giữ tham số khác, khoảng dòng', () => {
    nav.qs = 'q=may'
    render(
      <Ds>
        <PhanTrang trang={1} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
      </Ds>,
    )
    const n = screen.getByRole('navigation', { name: 'Phân trang' })
    const truoc = within(n).getByRole('button', { name: 'Trang trước' })
    expect(truoc.hasAttribute('disabled')).toBe(true)
    expect(within(n).getByRole('link', { name: 'Trang sau' }).getAttribute('href')).toBe('/ds?q=may&trang=2')
    expect(n.textContent).toContain('1–15 trên 19 ticket')
    expect(within(n).getByText('Trang 1 / 2').getAttribute('aria-current')).toBe('page')
  })

  test('DS trang 2/2: "Trang sau" disabled, "Trang trước" về trang 1 (bỏ hẳn `trang`), khoảng 16–19', () => {
    nav.qs = 'q=may&trang=2'
    render(
      <Ds>
        <PhanTrang trang={2} soTrang={2} tong={19} moiTrang={15} nhan="ticket" />
      </Ds>,
    )
    const n = screen.getByRole('navigation', { name: 'Phân trang' })
    expect(within(n).getByRole('button', { name: 'Trang sau' }).hasAttribute('disabled')).toBe(true)
    expect(within(n).getByRole('link', { name: 'Trang trước' }).getAttribute('href')).toBe('/ds?q=may')
    expect(n.textContent).toContain('16–19 trên 19 ticket')
  })

  test('không bơm DS: vẫn chữ "← Trước" / "Sau →", không có dòng khoảng', () => {
    const { container } = render(<PhanTrang trang={1} soTrang={3} />)
    expect(container.textContent).toContain('← Trước')
    expect(container.textContent).toContain('Trang 1 / 3')
    expect(container.textContent).not.toContain('trên')
  })
})

describe('BulkActionBar — KhungChon + ThanhDaChon (Review Focus 2)', () => {
  const TAT_CA = Array.from({ length: 19 }, (_, i) => `T-${101 + i}`)
  const TRANG = [TAT_CA.slice(0, 15), TAT_CA.slice(15)]

  function Bang({ trang = 0, tham = {} as Record<string, string>, ds = true }) {
    const bang = (
      <KhungChon khoaTrang={TRANG[trang]} tong={19} bat thamSo={tham} layTatCaKhoa={async () => TAT_CA}>
        <ThanhDaChon nhan="ticket">
          <button type="button">Xuất Excel</button>
        </ThanhDaChon>
        <table>
          <thead>
            <tr>
              <OChonTatCa nhan="ticket" />
            </tr>
          </thead>
          <tbody>
            {TRANG[trang].map((k) => (
              <tr key={k}>
                <OChonDong khoa={k} />
              </tr>
            ))}
          </tbody>
        </table>
        <input aria-label="Ô gõ" />
      </KhungChon>
    )
    return ds ? <Ds>{bang}</Ds> : bang
  }
  const thanh = () => screen.queryByRole('toolbar', { name: 'Thao tác hàng loạt' })
  const esc = (el: Element = document.body, o: KeyboardEventInit = {}) => fireEvent.keyDown(el, { key: 'Escape', ...o })

  test('chọn hết trang → mời chọn toàn bộ; bấm → 19 (gồm cả trang khác); sang trang 2 vẫn nói ra; số aria-live', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Bang />)
    expect(thanh()).toBeNull()
    await user.click(screen.getByRole('checkbox', { name: 'Chọn 15 ticket trên trang này' }))
    const t = thanh()!
    expect(t.textContent).toContain('Đã chọn 15 ticket')
    expect(t.textContent).not.toContain('trang khác')
    expect(t.querySelector('[aria-live="polite"]')?.textContent).toContain('Đã chọn 15 ticket')
    await user.click(within(t).getByRole('button', { name: 'Chọn tất cả 19 ticket khớp bộ lọc' }))
    await waitFor(() => expect(thanh()!.textContent).toContain('Đã chọn 19 ticket'))
    expect(thanh()!.textContent).toContain('(gồm cả dòng ở trang khác)')
    expect(within(thanh()!).queryByRole('button', { name: /Chọn tất cả/ })).toBeNull()
    rerender(<Bang trang={1} />)
    expect(thanh()!.textContent).toContain('Đã chọn 19 ticket')
    expect(thanh()!.textContent).toContain('(gồm cả dòng ở trang khác)')
  })

  test('"Bỏ chọn" (nút icon có tên) xoá HẾT, kể cả dòng ở trang khác', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Bang />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn 15 ticket trên trang này' }))
    rerender(<Bang trang={1} />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-116' }))
    expect(thanh()!.textContent).toContain('Đã chọn 16 ticket')
    const bo = within(thanh()!).getByRole('button', { name: 'Bỏ chọn' })
    expect(bo.querySelector('svg')).not.toBeNull()
    await user.click(bo)
    expect(thanh()).toBeNull()
    rerender(<Bang trang={0} />)
    expect(screen.getByRole('checkbox', { name: 'Chọn T-101' }).getAttribute('checked')).toBeNull()
    expect((screen.getByRole('checkbox', { name: 'Chọn T-101' }) as HTMLInputElement).checked).toBe(false)
  })

  test('Esc xoá hết lựa chọn — trừ khi đang gõ trong ô chữ, đang ghép chữ (bộ gõ), hoặc có menu/hộp đang mở', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn 15 ticket trên trang này' }))
    esc(screen.getByRole('textbox', { name: 'Ô gõ' }))
    expect(thanh()).not.toBeNull()
    esc(document.body, { isComposing: true })
    expect(thanh()).not.toBeNull()
    const menu = document.createElement('div')
    menu.setAttribute('role', 'menu')
    document.body.append(menu)
    esc()
    expect(thanh()).not.toBeNull()
    menu.remove()
    esc()
    expect(thanh()).toBeNull()
  })

  test('đổi bộ lọc → bỏ chọn', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Bang tham={{ q: 'a' }} />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-101' }))
    expect(thanh()).not.toBeNull()
    rerender(<Bang tham={{ q: 'ab' }} />)
    expect(thanh()).toBeNull()
  })

  test('không bơm DS: Esc không đụng lựa chọn (màn cũ không đổi), nút "Bỏ chọn" vẫn là chữ', async () => {
    const user = userEvent.setup()
    render(<Bang ds={false} />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-101' }))
    esc()
    expect(thanh()).not.toBeNull()
    expect(within(thanh()!).getByRole('button', { name: 'Bỏ chọn' }).textContent).toBe('Bỏ chọn')
  })
})
