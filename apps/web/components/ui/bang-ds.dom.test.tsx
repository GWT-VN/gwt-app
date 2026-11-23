// @vitest-environment jsdom
import { act, render, screen, waitFor, within } from '@testing-library/react'
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
  GIAO_DIEN_MAC_DINH,
  hrefBoLoc,
  KhungChon,
  LocNgay,
  OChonDong,
  OChonTatCa,
  OTimKiem,
  PhanTrang,
  ThanhDaChon,
  ThanhDangLoc,
} from '@/bang'
import { CauHinhBangDs } from './bang-ds'
import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
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

  function Bang({ trang = 0, tham = {} as Record<string, string>, ds = true, tatCaTrang = true }) {
    const bang = (
      <KhungChon khoaTrang={TRANG[trang]} tong={19} bat thamSo={tham} layTatCaKhoa={async () => TAT_CA}>
        <ThanhDaChon nhan="ticket">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Đổi trạng thái
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Đã xong</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button type="button">Xuất Excel</button>
        </ThanhDaChon>
        <table>
          <thead>
            <tr>{tatCaTrang && <OChonTatCa nhan="ticket" />}</tr>
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
  const vungDoc = () => document.querySelector('[aria-live="polite"][aria-atomic="true"]')
  // Esc được xét sau khi sự kiện đi hết listener (setTimeout) → chờ một nhịp rồi mới kiểm.
  const esc = async (el: Element = document.body, o: KeyboardEventInit = {}) => {
    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...o })
    act(() => {
      el.dispatchEvent(ev)
    })
    await act(() => new Promise((r) => setTimeout(r, 10)))
    return ev
  }
  const oTatCa = () => screen.getByRole('checkbox', { name: 'Chọn 15 ticket trên trang này' })

  test('chọn hết trang → mời chọn toàn bộ; bấm → 19 (gồm cả trang khác); sang trang 2 vẫn nói ra', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Bang />)
    expect(thanh()).toBeNull()
    await user.click(oTatCa())
    const t = thanh()!
    expect(t.textContent).toContain('Đã chọn 15 ticket')
    expect(t.textContent).not.toContain('trang khác')
    await user.click(within(t).getByRole('button', { name: 'Chọn tất cả 19 ticket khớp bộ lọc' }))
    await waitFor(() => expect(thanh()!.textContent).toContain('Đã chọn 19 ticket'))
    expect(thanh()!.textContent).toContain('(gồm cả dòng ở trang khác)')
    expect(within(thanh()!).queryByRole('button', { name: /Chọn tất cả/ })).toBeNull()
    rerender(<Bang trang={1} />)
    expect(thanh()!.textContent).toContain('Đã chọn 19 ticket')
    expect(thanh()!.textContent).toContain('(gồm cả dòng ở trang khác)')
  })

  test('vùng đọc aria-live LUÔN có (0 dòng chọn), nằm ngoài thanh; nhận số dòng + lời mời chọn toàn bộ; bỏ chọn thì nói ra', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    const v = vungDoc()!
    expect(v).not.toBeNull()
    expect(v.textContent).toBe('')
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-101' }))
    expect(vungDoc()).toBe(v)
    expect(v.textContent).toBe('Đã chọn 1 ticket.')
    expect(thanh()!.contains(v)).toBe(false)
    expect(thanh()!.querySelector('[aria-live]')).toBeNull()
    await user.click(oTatCa())
    expect(v.textContent).toBe('Đã chọn 15 ticket. Có thể chọn tất cả 19 ticket khớp bộ lọc.')
    await user.click(within(thanh()!).getByRole('button', { name: 'Bỏ chọn' }))
    expect(v.textContent).toBe('Đã bỏ chọn.')
  })

  test('"Bỏ chọn" (nút icon có tên) xoá HẾT, kể cả trang khác; focus về ô "chọn hết trang", không rơi về body', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Bang />)
    await user.click(oTatCa())
    rerender(<Bang trang={1} />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-116' }))
    expect(thanh()!.textContent).toContain('Đã chọn 16 ticket')
    const bo = within(thanh()!).getByRole('button', { name: 'Bỏ chọn' })
    expect(bo.querySelector('svg')).not.toBeNull()
    await user.click(bo)
    expect(thanh()).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Chọn 4 ticket trên trang này' }))
    rerender(<Bang trang={0} />)
    expect((screen.getByRole('checkbox', { name: 'Chọn T-101' }) as HTMLInputElement).checked).toBe(false)
  })

  test('không có ô "chọn hết trang" → focus về khung chọn (không về body)', async () => {
    const user = userEvent.setup()
    const { container } = render(<Bang tatCaTrang={false} />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn T-101' }))
    await user.click(within(thanh()!).getByRole('button', { name: 'Bỏ chọn' }))
    expect(document.activeElement).not.toBe(document.body)
    const khung = document.activeElement as HTMLElement
    expect(khung.contains(container.querySelector('table'))).toBe(true)
    // Vòng focus không bị tắt (WCAG 2.4.7): không outline none trên phần tử; DS vẽ vòng ring khi focus-visible.
    expect(khung.style.outline).toBe('')
    expect(khung.className).toContain('focus-visible:outline-(--ring)')
    // Bộ mặc định: không tắt outline → vòng focus gốc của trình duyệt.
    expect(GIAO_DIEN_MAC_DINH.chon_khung).not.toMatch(/outline-none/)
  })

  test('Esc bỏ hết — trừ khi đang gõ trong ô chữ hoặc đang ghép chữ (bộ gõ); listbox/menu TĨNH trong DOM không chặn', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(oTatCa())
    await esc(screen.getByRole('textbox', { name: 'Ô gõ' }))
    expect(thanh()).not.toBeNull()
    await esc(document.body, { isComposing: true })
    expect(thanh()).not.toBeNull()
    // Listbox thường trực (Combobox, bảng lệnh tĩnh) — trước đây chặn Esc vĩnh viễn.
    const tinh = document.createElement('div')
    tinh.setAttribute('role', 'listbox')
    document.body.append(tinh)
    await esc(oTatCa())
    expect(thanh()).toBeNull()
    expect(document.activeElement).toBe(oTatCa())
    tinh.remove()
  })

  test('listener đăng ký SAU (vd dnd-kit huỷ kéo bằng Esc) preventDefault → Esc là của nó, lựa chọn còn', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(oTatCa())
    const nhan = (e: KeyboardEvent) => e.key === 'Escape' && e.preventDefault()
    document.addEventListener('keydown', nhan)
    await esc(oTatCa())
    document.removeEventListener('keydown', nhan)
    expect(thanh()).not.toBeNull()
    await esc(oTatCa())
    expect(thanh()).toBeNull()
  })

  test('Esc trong thanh → bỏ hết, focus về ô "chọn hết trang"', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(oTatCa())
    const xuat = within(thanh()!).getByRole('button', { name: 'Xuất Excel' })
    xuat.focus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(thanh()).toBeNull())
    expect(document.activeElement).toBe(oTatCa())
  })

  test('menu Radix đang mở trên thanh → Esc chỉ đóng menu, lựa chọn còn nguyên', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(oTatCa())
    await user.click(within(thanh()!).getByRole('button', { name: 'Đổi trạng thái' }))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(thanh()!.textContent).toContain('Đã chọn 15 ticket')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(thanh()).toBeNull())
  })

  test('toolbar APG: một điểm Tab; ←/→ đi giữa các nút (vòng), Home/End về đầu/cuối', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    await user.click(oTatCa())
    const t = thanh()!
    const nut = [...t.querySelectorAll<HTMLElement>('button')]
    await waitFor(() => expect(nut.filter((b) => b.tabIndex === 0).length).toBe(1))
    expect(nut[0].tabIndex).toBe(0)
    nut[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(nut[1])
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(nut[nut.length - 1])
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(nut[0])
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(nut[nut.length - 1])
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(nut[0])
    // Nút vừa focus giữ điểm Tab duy nhất
    await user.keyboard('{End}')
    await waitFor(() => expect(nut[nut.length - 1].tabIndex).toBe(0))
    expect(nut.filter((b) => b.tabIndex === 0).length).toBe(1)
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
    await esc()
    expect(thanh()).not.toBeNull()
    expect(within(thanh()!).getByRole('button', { name: 'Bỏ chọn' }).textContent).toBe('Bỏ chọn')
  })
})

describe('OTimKiem — ô tìm', () => {
  test('có tên đọc: mặc định = placeholder (màn cũ không đổi tên), truyền aria-label thì dùng nó; KHÔNG type="search"', () => {
    const cu = render(<OTimKiem placeholder="Gõ tên, SĐT, mã…" />)
    const o = screen.getByRole('textbox', { name: 'Gõ tên, SĐT, mã…' })
    // type="search" làm trình duyệt tự xoá chữ khi Esc → xoá `q` trên URL (đổi hành vi màn cũ).
    expect(o.getAttribute('type')).not.toBe('search')
    cu.unmount()
    render(
      <Ds>
        <OTimKiem placeholder="Gõ mã ticket…" aria-label="Tìm ticket" />
      </Ds>,
    )
    expect(screen.getByRole('textbox', { name: 'Tìm ticket' }).getAttribute('placeholder')).toBe('Gõ mã ticket…')
  })
})

describe('ô chọn dòng của bang/ trong bảng DS thường (GIAO_DIEN_DS)', () => {
  test('th/td ô chọn mang sẵn bộ căn ô tick (top 0, lưới khối) — không cần màn tự vá', () => {
    const { container } = render(
      <Ds>
        <KhungChon khoaTrang={['a']} tong={1} bat thamSo={{}}>
          <table>
            <thead>
              <tr>
                <OChonTatCa />
              </tr>
            </thead>
            <tbody>
              <tr>
                <OChonDong khoa="a" />
              </tr>
            </tbody>
          </table>
        </KhungChon>
      </Ds>,
    )
    for (const o of [container.querySelector('th')!, container.querySelector('td')!]) {
      const cls = o.className.split(' ')
      expect(cls).toContain('[&>input[type=checkbox]]:top-0')
      expect(cls).toContain('[&>input[type=checkbox]]:grid')
    }
  })
})
