// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const nav = vi.hoisted(() => ({ qs: '' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(nav.qs),
}))

import { KhungChon, OChonDong, ThanhDaChon, useDaChon } from '@/bang'
import { CauHinhBangDs } from './bang-ds'
import { DsRoot } from './ds-root'
import { BangTrangThai, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from './table'
import { KeoCot, TieuDeCot, type MucLoc } from './tieu-de-cot'
import { docUrlCot, ghiUrlCot, useCotBang, type CotBang } from './use-cot-bang'

const COT: CotBang[] = [
  { id: 'uu', ten: 'Ưu tiên', rong: 76, kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Ít gấp trước' } },
  { id: 'nhom', ten: 'Loại lỗi', rong: 148, kieu: 'loc' },
  { id: 'ma', ten: 'Mã', rong: 60, kieu: 'thuong' },
  { id: 'nguon', ten: 'Nguồn', rong: 100, kieu: 'thuong', anMacDinh: true },
]
const LOAI: MucLoc[] = [
  { giaTri: 'ro-ri', nhan: 'Rò rỉ nước', color: 'info' },
  { giaTri: 'main', nhan: 'Main', color: 'discovery' },
  { giaTri: '', nhan: 'Chưa phân loại' },
]

function Bang({ onLoc, chon = false }: { onLoc?: (gt: string[]) => void; chon?: boolean }) {
  const c = useCotBang(COT)
  const [chieu, setChieu] = useState<'tang' | 'giam' | null>(null)
  const [loc, setLoc] = useState<string[]>([])
  return (
    <DsRoot>
      <TableWrap>
        <KeoCot cot={c.hien} doiCho={c.doiCho}>
          <Table layout="fixed">
            <TableHeader>
              <TableRow>
                {c.hien.map((cot, i) => (
                  <TieuDeCot
                    key={cot.id}
                    cot={cot}
                    viTri={i}
                    coDan={{ rong: c.doRong[cot.id], onDoi: (px) => c.coDan(cot.id, px) }}
                    sap={cot.kieu === 'sap' ? { chieu, onDoi: setChieu } : undefined}
                    loc={
                      cot.kieu === 'loc'
                        ? { tuyChon: LOAI, daChon: loc, onDoi: (gt) => (setLoc(gt), onLoc?.(gt)) }
                        : undefined
                    }
                  />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow chon={chon}>
                {c.hien.map((cot) => (
                  <TableCell key={cot.id} cot={cot.id}>
                    x
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </KeoCot>
      </TableWrap>
    </DsRoot>
  )
}

/** Bảng trong KhungChon + ThanhDaChon (CauHinhBangDs bật Esc bỏ chọn) — như màn danh sách thật. */
function SoChon() {
  return <p data-testid="so-chon">{useDaChon().soDong}</p>
}
function BangChon() {
  const c = useCotBang(COT)
  return (
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={['1']} tong={1} bat thamSo={{}}>
          <TableWrap>
            <KeoCot cot={c.hien} doiCho={c.doiCho}>
              <Table layout="fixed">
                <TableHeader>
                  <TableRow>
                    {c.hien.map((cot, i) => (
                      <TieuDeCot key={cot.id} cot={cot} viTri={i} />
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <OChonDong khoa="1" moTa="dòng 1" />
                  </TableRow>
                </TableBody>
              </Table>
            </KeoCot>
          </TableWrap>
          <ThanhDaChon nhan="dòng" />
          <SoChon />
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>
  )
}

const tenCot = () => screen.getAllByRole('columnheader').map((th) => th.getAttribute('data-cot'))

beforeEach(() => {
  nav.qs = ''
})

describe('tiêu đề cột — kieu sap | loc', () => {
  test('cột kieu loc khai sắp → lỗi kiểu + ném lỗi lúc chạy', () => {
    // @ts-expect-error cột nhãn không được có nghĩa sắp — sắp nhãn theo chữ cái là vô nghĩa
    const sai: CotBang = { id: 'tt', ten: 'Trạng thái', rong: 124, kieu: 'loc', nghia: { tang: 'A', giam: 'B' } }
    const loi = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <DsRoot>
          <table>
            <thead>
              <tr>
                <TieuDeCot cot={sai} />
              </tr>
            </thead>
          </table>
        </DsRoot>,
      ),
    ).toThrow(/không sắp được/)
    // Truyền trạng thái sắp cho cột lọc: lỗi kiểu (props theo `cot.kieu`) + ném lỗi lúc chạy nếu lách kiểu.
    const cotLoc = { id: 'nhom', ten: 'Loại lỗi', rong: 148, kieu: 'loc' } as const satisfies CotBang
    expect(() =>
      render(
        <DsRoot>
          <table>
            <thead>
              <tr>
                <TieuDeCot
                  cot={cotLoc}
                  // @ts-expect-error cột lọc không nhận `sap`
                  sap={{ chieu: 'tang', onDoi: () => {} }}
                />
              </tr>
            </thead>
          </table>
        </DsRoot>,
      ),
    ).toThrow(/không sắp được/)
    loi.mockRestore()
  })

  test('menu lọc: vẽ tag (cả "Chưa phân loại"), tick nhiều giữ menu mở, KHÔNG có mục sắp; "Bỏ lọc cột này"', async () => {
    const user = userEvent.setup()
    const onLoc = vi.fn()
    render(<Bang onLoc={onLoc} />)
    await user.click(screen.getByRole('button', { name: /^Loại lỗi/ }))
    const menu = await screen.findByRole('menu', { name: 'Lọc theo loại lỗi' })
    expect(within(menu).queryAllByRole('menuitemradio')).toHaveLength(0)
    expect(within(menu).queryByText(/Tăng dần|Giảm dần|Sắp xếp/)).toBeNull()
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Chưa phân loại' })).toBeTruthy()
    await user.click(within(menu).getByRole('menuitemcheckbox', { name: 'Rò rỉ nước' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Main' }))
    expect(screen.getByRole('menu', { name: 'Lọc theo loại lỗi' })).toBeTruthy()
    expect(onLoc).toHaveBeenLastCalledWith(['ro-ri', 'main'])
    expect(screen.getByRole('menuitemcheckbox', { name: 'Main' }).getAttribute('aria-checked')).toBe('true')
    // Nút tiêu đề nói đang lọc bao nhiêu giá trị.
    // (menu modal đang mở → phần còn lại của trang aria-hidden)
    expect(screen.getByRole('button', { name: /^Loại lỗi/, hidden: true }).textContent).toContain('đang lọc 2')
    await user.click(screen.getByRole('menuitem', { name: 'Bỏ lọc cột này' }))
    expect(onLoc).toHaveBeenLastCalledWith([])
  })

  test('menu sắp nói nghĩa bằng lời; aria-sort đúng chiều; cột lọc/thường không có aria-sort', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    const th = () => screen.getByRole('columnheader', { name: /Ưu tiên/ })
    expect(th().getAttribute('aria-sort')).toBe('none')
    expect(screen.getByRole('columnheader', { name: /Loại lỗi/ }).hasAttribute('aria-sort')).toBe(false)
    await user.click(screen.getByRole('button', { name: /^Ưu tiên/ }))
    const menu = await screen.findByRole('menu', { name: 'Sắp xếp theo ưu tiên' })
    expect(within(menu).queryByText(/Tăng dần|Giảm dần/)).toBeNull()
    await user.click(within(menu).getByRole('menuitemradio', { name: 'Ít gấp trước' }))
    expect(th().getAttribute('aria-sort')).toBe('descending')
    expect(screen.getByRole('button', { name: /^Ưu tiên/ }).textContent).toContain('ít gấp trước')
    await user.click(screen.getByRole('button', { name: /^Ưu tiên/ }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Gấp trước' }))
    expect(th().getAttribute('aria-sort')).toBe('ascending')
    await user.click(screen.getByRole('button', { name: /^Ưu tiên/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Bỏ sắp xếp' }))
    expect(th().getAttribute('aria-sort')).toBe('none')
  })
})

describe('co dãn cột', () => {
  test('←/→ đổi 8px, không dưới 56; nhấp đúp về mặc định', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    const tay = screen.getByRole('separator', { name: 'Đổi độ rộng cột Mã' })
    expect(tay.getAttribute('aria-orientation')).toBe('vertical')
    expect(tay.getAttribute('aria-valuenow')).toBe('60')
    tay.focus()
    await user.keyboard('{ArrowRight}')
    expect(tay.getAttribute('aria-valuenow')).toBe('68')
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}')
    expect(tay.getAttribute('aria-valuenow')).toBe('56')
    // Thứ tự cột không đổi: phím trên tay co dãn không nhấc cột.
    expect(tenCot()).toEqual(['uu', 'nhom', 'ma'])
    fireEvent.doubleClick(tay)
    expect(tay.getAttribute('aria-valuenow')).toBe('60')
  })
})

describe('đổi chỗ cột bằng bàn phím (dnd-kit KeyboardSensor)', () => {
  // jsdom không có bố cục → mỗi ô tiêu đề rộng 100, xếp theo thứ tự trong hàng. Lớp bóng kéo (DragOverlay) phủ đúng ô
  // nguồn lúc nhấc như trình duyệt thật (jsdom không đo lại nó) → trả hộp của ô đang kéo.
  beforeEach(() => {
    const hop = (th: Element) => new DOMRect([...th.parentElement!.children].indexOf(th) * 100, 0, 100, 36)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const th = this.closest('th') ?? (this.closest('[data-slot="keo-bong"]') && document.querySelector('th[data-keo]'))
      return th?.parentElement ? hop(th) : new DOMRect(0, 0, 0, 0)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  const nhan = async (user: ReturnType<typeof userEvent.setup>, phim: string) => {
    await user.keyboard(phim)
    await act(() => new Promise((r) => setTimeout(r, 20))) // sensor gắn listener keydown sau setTimeout
  }

  test('Space nhấc, ← dời, Space thả → đổi chỗ + câu đọc tiếng Việt', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    screen.getByRole('button', { name: /^Mã/ }).focus()
    await nhan(user, ' ')
    expect(await screen.findByText(/Đã nhấc cột Mã/)).toBeTruthy()
    await nhan(user, '{ArrowLeft}')
    await nhan(user, ' ')
    await waitFor(() => expect(tenCot()).toEqual(['uu', 'ma', 'nhom']))
    expect(await screen.findByText(/Đã thả cột Mã trước cột Loại lỗi/)).toBeTruthy()
    // Space trên cột có menu không mở menu (Space thuộc kéo; Enter mở menu).
    expect(screen.queryByRole('menu')).toBeNull()
  })

  test('visibilitychange giữa chừng (khung bị che/hiện) KHÔNG huỷ kéo: ← rồi Space vẫn đổi chỗ', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    screen.getByRole('button', { name: /^Mã/ }).focus()
    await nhan(user, ' ')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    })
    await nhan(user, '{ArrowLeft}')
    expect(screen.queryByText(/Đã huỷ kéo/)).toBeNull()
    await nhan(user, ' ')
    await waitFor(() => expect(tenCot()).toEqual(['uu', 'ma', 'nhom']))
  })

  test('Esc giữa chừng → về chỗ cũ', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    screen.getByRole('button', { name: /^Mã/ }).focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowLeft}')
    await nhan(user, '{Escape}')
    expect(tenCot()).toEqual(['uu', 'nhom', 'ma'])
    expect(await screen.findByText(/về chỗ cũ/)).toBeTruthy()
  })

  test('Esc khi đang nhấc cột: cột về chỗ cũ, KHÔNG bỏ chọn dòng (Esc thuộc cảm biến kéo, không tới thanh hàng loạt)', async () => {
    const user = userEvent.setup()
    render(<BangChon />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn dòng 1' }))
    expect(screen.getByTestId('so-chon').textContent).toBe('1')
    screen.getByRole('button', { name: /^Mã/ }).focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowLeft}')
    await nhan(user, '{Escape}')
    expect(tenCot()).toEqual(['uu', 'nhom', 'ma'])
    expect(screen.getByTestId('so-chon').textContent).toBe('1')
    expect((screen.getByRole('checkbox', { name: 'Chọn dòng 1' }) as HTMLInputElement).checked).toBe(true)
  })

  test('kéo bằng CHUỘT + Esc: huỷ kéo, KHÔNG bỏ chọn dòng; body mang data-dang-keo chỉ khi đang kéo', async () => {
    const user = userEvent.setup()
    render(<BangChon />)
    await user.click(screen.getByRole('checkbox', { name: 'Chọn dòng 1' }))
    expect(screen.getByTestId('so-chon').textContent).toBe('1')
    // Cảm biến chuột của dnd-kit huỷ kéo khi Esc nhưng KHÔNG preventDefault — phím trôi tới thanh hàng loạt. Nắm ở
    // phần đệm của ô (không focus được) → focus không nằm trên nút tiêu đề, Esc đi thẳng từ body.
    const ma = screen.getByRole('button', { name: /^Mã/ }).closest('th')!
    await user.pointer([
      { keys: '[MouseLeft>]', target: ma, coords: { clientX: 250, clientY: 10 } },
      { coords: { clientX: 150, clientY: 10 } },
    ])
    expect(await screen.findByText(/Đã nhấc cột Mã/)).toBeTruthy()
    expect(document.body.hasAttribute('data-dang-keo')).toBe(true)
    await user.keyboard('{Escape}')
    expect(await screen.findByText(/Đã huỷ kéo/)).toBeTruthy()
    expect(tenCot()).toEqual(['uu', 'nhom', 'ma'])
    expect(screen.getByTestId('so-chon').textContent).toBe('1')
    expect(document.body.hasAttribute('data-dang-keo')).toBe(false)
    await user.pointer({ keys: '[/MouseLeft]' })
  })

  test('Enter trên tiêu đề có menu vẫn mở menu', async () => {
    const user = userEvent.setup()
    render(<Bang />)
    screen.getByRole('button', { name: /^Loại lỗi/ }).focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('menu', { name: 'Lọc theo loại lỗi' })).toBeTruthy()
  })
})

describe('4 trạng thái + dòng chọn', () => {
  const COT_TAI = [{ ten: 'Đang tải' }, { ten: 'Thành tiền', so: true }]

  test('đang tải: câu đọc ở vùng status NGOÀI vùng aria-busy; khung busy có header thật + dòng skeleton', async () => {
    const { container } = render(<BangTrangThai trangThai="tai" cot={COT_TAI} />)
    const doc = screen.getByRole('status')
    // Vùng live gắn rỗng rồi mới điền chữ (effect) — và không nằm trong vùng busy (trình đọc hoãn đọc vùng busy).
    await waitFor(() => expect(doc.textContent).toBe('Đang tải danh sách'))
    expect(doc.closest('[aria-busy="true"]')).toBeNull()
    expect(doc.hasAttribute('aria-busy')).toBe(false)
    const busy = container.querySelector('[aria-busy="true"]')!
    expect(busy).toBeTruthy()
    expect(busy.contains(doc)).toBe(false)
    expect(screen.getAllByRole('columnheader').map((x) => x.textContent)).toEqual(['Đang tải', 'Thành tiền'])
    expect(busy.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(6)
  })

  test('rỗng do lọc: gợi ý + "Xoá bộ lọc"', async () => {
    const onXoaLoc = vi.fn()
    render(<BangTrangThai trangThai="rongLoc" moTa='Thử bỏ bớt điều kiện "Kênh: Đại lý".' onXoaLoc={onXoaLoc} />)
    expect(screen.getByRole('heading', { name: 'Không có dòng nào khớp bộ lọc' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }))
    expect(onXoaLoc).toHaveBeenCalled()
  })

  test('rỗng thật: nói cách tạo bản ghi đầu + hành động', () => {
    render(
      <BangTrangThai trangThai="rongThat" tieuDe="Chưa có ticket nào" moTa="Ticket mới tạo sẽ hiện ở đây." hanhDong={<button>Tạo ticket</button>} />,
    )
    expect(screen.getByRole('heading', { name: 'Chưa có ticket nào' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Tạo ticket' })).toBeTruthy()
  })

  test('lỗi: Alert danger + "Thử lại", GIỮ dữ liệu cũ và nói có thể đã cũ', async () => {
    const onThuLai = vi.fn()
    render(
      <BangTrangThai trangThai="loi" onThuLai={onThuLai}>
        <p>dữ liệu cũ</p>
      </BangTrangThai>,
    )
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('có thể đã cũ')
    expect(screen.getByText('dữ liệu cũ')).toBeTruthy()
    await userEvent.click(within(alert).getByRole('button', { name: 'Thử lại' }))
    expect(onThuLai).toHaveBeenCalled()
  })

  test('không trạng thái → hiện bảng (children)', () => {
    render(<BangTrangThai><p>bảng</p></BangTrangThai>)
    expect(screen.getByText('bảng')).toBeTruthy()
  })

  test('dòng chọn: data-state selected + nền info-soft', () => {
    render(<Bang chon />)
    const tr = screen.getAllByRole('row')[1]
    expect(tr.getAttribute('data-state')).toBe('selected')
    expect(tr.className).toContain('--color-background-info-soft-alpha')
  })
})

describe('useCotBang — URL', () => {
  test('ghi chỉ phần khác mặc định, đọc lại y hệt; id lạ bị bỏ, kẹp tối thiểu', () => {
    const s = { thuTu: ['ma', 'uu', 'nhom', 'nguon'], doRong: { uu: 76, nhom: 200, ma: 60, nguon: 100 }, an: [] }
    const sp = ghiUrlCot(new URLSearchParams('q=may'), s, COT)
    expect(sp.get('q')).toBe('may')
    expect(sp.get('cot_rong')).toBe('nhom:200')
    expect(docUrlCot(sp, COT)).toEqual(s)
    const md = docUrlCot(new URLSearchParams(''), COT)
    expect(ghiUrlCot(new URLSearchParams(''), md, COT).toString()).toBe('')
    expect(md.an).toEqual(['nguon'])
    const la = docUrlCot(new URLSearchParams('cot_thu_tu=xx,ma&cot_rong=ma:10'), COT)
    expect(la.thuTu).toEqual(['ma', 'uu', 'nhom', 'nguon'])
    expect(la.doRong.ma).toBe(56)
  })

  test('url: true → mở trang đọc trạng thái cột từ URL', () => {
    nav.qs = 'cot_an=&cot_thu_tu=nguon'
    render(<Url />)
    expect(screen.getByTestId('hien').textContent).toBe('nguon,uu,nhom,ma')
  })
})

function Url() {
  const c = useCotBang(COT, { url: true })
  return <p data-testid="hien">{c.hien.map((x) => x.id).join(',')}</p>
}

describe('vẻ bảng thường (.ui-table)', () => {
  test('variant="thuong": đầu cột nền surface-secondary 600 đệm 12, ô 40 kẻ --border, rê primary-outline-hover; mặc định giữ .b-bang', () => {
    const { container } = render(
      <>
        <Table variant="thuong" data-testid="thuong">
          <TableHeader>
            <TableRow>
              <TableHead>A</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table data-testid="du-lieu">
          <TableHeader>
            <TableRow>
              <TableHead>A</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>,
    )
    const [t, d] = ['thuong', 'du-lieu'].map((x) => container.querySelector(`[data-testid="${x}"]`)!)
    expect(t.getAttribute('data-variant')).toBe('thuong')
    const th = t.querySelector('th')!.className
    expect(th).toContain('bg-(--color-surface-secondary)')
    expect(th).toContain('font-semibold')
    expect(th).toContain('px-(--control-gutter-md)')
    expect(th).not.toContain('bg-background')
    const td = t.querySelector('td')!.className
    expect(td).toContain('h-(--control-size-xl)')
    expect(td).toContain('border-b-(--border)')
    expect(t.querySelector('tbody tr')!.className).toContain('--color-background-primary-outline-hover')
    // Mặc định: vẻ dữ liệu như cũ.
    expect(d.getAttribute('data-variant')).toBe('du-lieu')
    expect(d.querySelector('th')!.className).toContain('bg-background')
    expect(d.querySelector('td')!.className).toContain('h-(--control-size-2xl)')
  })
})
