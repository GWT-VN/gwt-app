// @vitest-environment jsdom
// Cột của Bảng học Twenty (docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md): A nút "+" ThemCot · B menu tiêu đề Dời/Ẩn ·
// C ⚙ Cột hiển thị kéo được. Cùng một trạng thái `useCotBang` cho bảng và ⚙.
import { useRef } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(),
}))

import { CaiDatHienThi, type CaiDatRef } from './data-view-toolbar'
import { DsRoot } from './ds-root'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from './table'
import { CHON_BANG_GHIM, oGhim, thGhim } from './table-styles'
import { ThemCot } from './them-cot'
import { KeoCot, TieuDeCot } from './tieu-de-cot'
import { laGhim, useCotBang, type CotBang } from './use-cot-bang'

const COT: CotBang[] = [
  { id: 'ma', ten: 'Mã', rong: 100, kieu: 'thuong', khoa: true },
  { id: 'khach', ten: 'Khách', rong: 120, kieu: 'thuong' },
  { id: 'han', ten: 'Hạn', rong: 100, kieu: 'sap', nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' } },
  { id: 'tt', ten: 'Trạng thái', rong: 100, kieu: 'thuong' },
  { id: 'nguon', ten: 'Nguồn', rong: 100, kieu: 'thuong', anMacDinh: true },
  { id: 'tinh', ten: 'Tỉnh/TP', rong: 100, kieu: 'thuong', anMacDinh: true },
]

function Man({ cot = COT }: { cot?: CotBang[] }) {
  const c = useCotBang(cot)
  const caiDat = useRef<CaiDatRef>(null)
  return (
    <DsRoot>
      <CaiDatHienThi
        ref={caiDat}
        dangXem="bang"
        onDoiXem={() => {}}
        cot={c.thuTu.map((id) => cot.find((x) => x.id === id)!)}
        cotAn={c.an}
        onCotAn={(an) => cot.forEach((x) => c.anHien(x.id, !an.includes(x.id)))}
        onDoiChoCot={c.doiCho}
      />
      <TableWrap>
        <KeoCot cot={c.hien} doiCho={c.doiCho}>
          <Table layout="fixed">
            <TableHeader>
              <TableRow>
                {c.hien.map((x, i) => (
                  <TieuDeCot
                    key={x.id}
                    cot={x}
                    viTri={i}
                    menuCot={c.menuCot(x.id)}
                    sap={x.kieu === 'sap' ? { chieu: null, onDoi: () => {} } : undefined}
                  />
                ))}
                <ThemCot cot={cot} an={c.an} onHien={c.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {c.hien.map((x, i) => (
                  <TableCell key={x.id} cot={x.id} ghim={laGhim(x, i)}>
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

/** Cột đang hiện trên bảng (bỏ ô "+"). */
const tenCot = () =>
  screen
    .getAllByRole('columnheader', { hidden: true })
    .map((th) => th.getAttribute('data-cot'))
    .filter(Boolean)
const doi = () => act(() => new Promise((r) => setTimeout(r, 30)))

describe('A — nút "+" thêm cột', () => {
  test('pop: focus ô "Tìm cột", liệt kê cột ẩn, lọc không dấu; chọn → hiện ở CUỐI, đóng pop, focus về "+"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const nut = screen.getByRole('button', { name: 'Thêm cột' })
    await user.click(nut)
    const pop = await screen.findByRole('dialog', { name: 'Thêm cột' })
    const o = within(pop).getByRole('combobox')
    await waitFor(() => expect(document.activeElement).toBe(o))
    expect(o.getAttribute('placeholder')).toBe('Tìm cột')
    expect(within(pop).getAllByRole('option').map((x) => x.textContent)).toEqual(['Nguồn', 'Tỉnh/TP', 'Tuỳ chỉnh cột…'])
    await user.type(o, 'nguon')
    expect(within(pop).getAllByRole('option').map((x) => x.textContent)).toEqual(['Nguồn', 'Tuỳ chỉnh cột…'])
    // Mục sáng được trình đọc màn hình đọc (aria-activedescendant gắn lại sau khi lọc).
    const sang = o.getAttribute('aria-activedescendant')
    expect(sang && document.getElementById(sang)?.textContent).toBe('Nguồn')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Thêm cột' })).toBeNull())
    expect(tenCot()).toEqual(['ma', 'khach', 'han', 'tt', 'nguon'])
    await waitFor(() => expect(document.activeElement).toBe(nut))
    expect(await screen.findByText('Đã hiện cột Nguồn ở cuối bảng.')).toBeTruthy()
  })

  test('gõ không khớp → câu báo; không còn cột ẩn → "Mọi cột đang hiện" + vẫn có "Tuỳ chỉnh cột…"', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Man />)
    await user.click(screen.getByRole('button', { name: 'Thêm cột' }))
    const pop = await screen.findByRole('dialog', { name: 'Thêm cột' })
    await user.type(within(pop).getByRole('combobox'), 'xyz')
    expect(within(pop).getByText('Không có cột ẩn nào khớp "xyz"')).toBeTruthy()
    unmount()
    render(<Man cot={COT.map((c) => ({ ...c, anMacDinh: false }))} />)
    await user.click(screen.getByRole('button', { name: 'Thêm cột' }))
    const pop2 = await screen.findByRole('dialog', { name: 'Thêm cột' })
    expect(within(pop2).getByText('Mọi cột đang hiện')).toBeTruthy()
    expect(within(pop2).getAllByRole('option').map((x) => x.textContent)).toEqual(['Tuỳ chỉnh cột…'])
  })

  test('"Tuỳ chỉnh cột…" → mở ⚙ thẳng trang Cột hiển thị (focus ← Quay lại), pop "+" đóng', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(screen.getByRole('button', { name: 'Thêm cột' }))
    const pop = await screen.findByRole('dialog', { name: 'Thêm cột' })
    await user.click(within(pop).getByRole('option', { name: 'Tuỳ chỉnh cột…' }))
    const cd = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
    await waitFor(() => expect(document.activeElement).toBe(within(cd).getByRole('button', { name: 'Quay lại' })))
    expect(within(cd).getByRole('group', { name: 'Đang ẩn' })).toBeTruthy()
    expect(screen.queryByRole('dialog', { name: 'Thêm cột' })).toBeNull()
    await doi()
    // Focus không bị kéo về "+" (sẽ làm ⚙ tự đóng).
    expect(screen.getByRole('dialog', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  })
})

describe('B — menu tiêu đề: Dời sang trái / phải, Ẩn cột', () => {
  test('cột sát cột khoá: "Dời sang trái" tắt (vẫn hiện); dời phải → đổi chỗ + câu đọc; focus về tiêu đề', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(screen.getByRole('button', { name: /^Khách/ }))
    const menu = await screen.findByRole('menu', { name: 'Cột khách' })
    expect(within(menu).getByRole('menuitem', { name: 'Dời sang trái' }).getAttribute('aria-disabled')).toBe('true')
    await user.click(within(menu).getByRole('menuitem', { name: 'Dời sang trái' }))
    expect(tenCot()).toEqual(['ma', 'khach', 'han', 'tt'])
    await user.click(screen.getByRole('menuitem', { name: 'Dời sang phải' }))
    await waitFor(() => expect(tenCot()).toEqual(['ma', 'han', 'khach', 'tt']))
    expect(await screen.findByText('Đã dời cột Khách sang phải, sau cột Hạn.')).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Khách/ })))
  })

  test('cột có menu sắp: mục dời nằm sau vạch; cột cuối "Dời sang phải" tắt; cột khoá không có menu', async () => {
    const user = userEvent.setup()
    render(<Man />)
    expect(screen.queryByRole('button', { name: /^Mã/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: /^Hạn/ }))
    const menu = await screen.findByRole('menu', { name: 'Sắp xếp theo hạn' })
    expect(within(menu).getByRole('menuitemradio', { name: 'Gần hạn nhất trước' })).toBeTruthy()
    expect(within(menu).getByRole('separator')).toBeTruthy()
    expect(within(menu).getByRole('menuitem', { name: 'Dời sang trái' }).hasAttribute('aria-disabled')).toBe(false)
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /^Trạng thái/ }))
    const cuoi = await screen.findByRole('menu', { name: 'Cột trạng thái' })
    expect(within(cuoi).getByRole('menuitem', { name: 'Dời sang phải' }).getAttribute('aria-disabled')).toBe('true')
  })

  test('Ẩn cột → cột biến mất (cả trong ⚙ chuyển sang Đang ẩn), câu đọc, focus sang tiêu đề kế bên', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(screen.getByRole('button', { name: /^Hạn/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Ẩn cột' }))
    await waitFor(() => expect(tenCot()).toEqual(['ma', 'khach', 'tt']))
    expect(await screen.findByText('Đã ẩn cột Hạn.')).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Trạng thái/ })))
    // Ẩn cột cuối → focus sang "+".
    await user.click(screen.getByRole('button', { name: /^Trạng thái/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Ẩn cột' }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Thêm cột' })))
    await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
    const cd = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
    await user.click(within(cd).getByRole('button', { name: /Cột hiển thị/ }))
    const an = within(cd).getByRole('group', { name: 'Đang ẩn' })
    expect(within(an).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(
      ['Hiện Hạn', 'Hiện Trạng thái', 'Hiện Nguồn', 'Hiện Tỉnh/TP'],
    )
  })
})

describe('C — ⚙ Cột hiển thị: Đang hiện (kéo + mắt) / Đang ẩn', () => {
  // jsdom không có bố cục: dòng trong ⚙ cao 32 xếp theo thứ tự trong nhóm (cảm biến phím của dnd-kit đo hộp dòng).
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const d = this.closest('[data-cot-cd]')
      if (!d?.parentElement) return new DOMRect(0, 0, 0, 0)
      return new DOMRect(0, [...d.parentElement.children].indexOf(d) * 32, 280, 32)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  const moCot = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
    const cd = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
    await user.click(within(cd).getByRole('button', { name: /Cột hiển thị/ }))
    return cd
  }
  const nhan = async (user: ReturnType<typeof userEvent.setup>, phim: string) => {
    await user.keyboard(phim)
    await act(() => new Promise((r) => setTimeout(r, 20))) // cảm biến gắn listener keydown sau setTimeout
  }

  test('cột khoá đứng đầu, không tay kéo, không mắt; thứ tự = thứ tự bảng; mắt ẩn → sang Đang ẩn, focus theo', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const cd = await moCot(user)
    const hien = within(cd).getByRole('group', { name: 'Đang hiện' })
    expect([...hien.querySelectorAll('[data-cot-cd]')].map((d) => d.getAttribute('data-cot-cd'))).toEqual(['ma', 'khach', 'han', 'tt'])
    expect(within(hien).queryByRole('button', { name: 'Đổi chỗ cột Mã' })).toBeNull()
    expect(within(hien).queryByRole('button', { name: 'Ẩn Mã' })).toBeNull()
    expect(within(cd).queryByText('Kéo tiêu đề cột trên bảng để đổi chỗ')).toBeNull()
    await user.click(within(hien).getByRole('button', { name: 'Ẩn Khách' }))
    expect(tenCot()).toEqual(['ma', 'han', 'tt'])
    const hienKhach = within(within(cd).getByRole('group', { name: 'Đang ẩn' })).getByRole('button', { name: 'Hiện Khách' })
    await waitFor(() => expect(document.activeElement).toBe(hienKhach))
    await user.click(hienKhach)
    expect(tenCot()).toEqual(['ma', 'khach', 'han', 'tt'])
    await waitFor(() => expect(document.activeElement).toBe(within(cd).getByRole('button', { name: 'Ẩn Khách' })))
  })

  test('phím: Space nhấc, ↓ dời, Space thả → bảng đổi thứ tự + câu đọc tiếng Việt', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const cd = await moCot(user)
    within(cd).getByRole('button', { name: 'Đổi chỗ cột Khách' }).focus()
    await nhan(user, ' ')
    expect(await screen.findByText(/Đã nhấc cột Khách\. Mũi tên lên xuống/)).toBeTruthy()
    await nhan(user, '{ArrowDown}')
    await nhan(user, ' ')
    await waitFor(() => expect(tenCot()).toEqual(['ma', 'han', 'khach', 'tt']))
    expect(await screen.findByText('Đã thả cột Khách sau cột Hạn.')).toBeTruthy()
    const hien = within(cd).getByRole('group', { name: 'Đang hiện' })
    expect([...hien.querySelectorAll('[data-cot-cd]')].map((d) => d.getAttribute('data-cot-cd'))).toEqual(['ma', 'han', 'khach', 'tt'])
  })

  test('visibilitychange giữa chừng (khung Browser bị che/hiện) KHÔNG huỷ kéo phím — ↑ rồi Space vẫn đổi chỗ', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const cd = await moCot(user)
    within(cd).getByRole('button', { name: 'Đổi chỗ cột Hạn' }).focus()
    await nhan(user, ' ')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
    })
    await nhan(user, '{ArrowUp}')
    expect(screen.queryByText(/Đã huỷ kéo/)).toBeNull()
    await nhan(user, ' ')
    await waitFor(() => expect(tenCot()).toEqual(['ma', 'han', 'khach', 'tt']))
    expect(await screen.findByText('Đã thả cột Hạn trước cột Khách.')).toBeTruthy()
  })

  test('Esc khi đang nhấc: huỷ kéo, giữ thứ tự, KHÔNG đóng ⚙', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const cd = await moCot(user)
    within(cd).getByRole('button', { name: 'Đổi chỗ cột Khách' }).focus()
    await nhan(user, ' ')
    await nhan(user, '{ArrowDown}')
    await nhan(user, '{Escape}')
    expect(await screen.findByText(/Đã huỷ kéo\. Cột Khách về chỗ cũ/)).toBeTruthy()
    expect(tenCot()).toEqual(['ma', 'khach', 'han', 'tt'])
    expect(screen.getByRole('dialog', { name: 'Cài đặt hiển thị' })).toBeTruthy()
  })
})

describe('cột ghim — cột khoá đứng đầu dính trái khi cuộn ngang', () => {
  test('tiêu đề + ô thân của cột khoá đầu mang data-ghim + lớp dính/nền đục; cột khác và cột khoá không đứng đầu thì không', () => {
    const { unmount } = render(<Man />)
    const th = document.querySelector('thead th[data-cot="ma"]')!
    const td = document.querySelector('tbody td[data-cot="ma"]')!
    expect(th.hasAttribute('data-ghim')).toBe(true)
    expect(td.hasAttribute('data-ghim')).toBe(true)
    for (const lop of thGhim.split(' ')) expect(th.classList.contains(lop)).toBe(true)
    for (const lop of oGhim.split(' ')) expect(td.classList.contains(lop)).toBe(true)
    // Lệch 36 chỉ khi bảng có cột ô chọn; nền = --background + màu trạng thái dòng (một lớp, đục).
    expect(oGhim).toContain('_&]:left-9')
    expect(oGhim).toContain('bg-background!')
    expect(oGhim).toContain('var(--nen-dong')
    // Vạch mép phải luôn có, cùng token ở tiêu đề và ô thân.
    for (const l of [thGhim, oGhim]) expect(l).toContain('border-r-(--alpha-08)')
    expect(document.querySelectorAll('[data-ghim]')).toHaveLength(2)
    unmount()
    // Cột khoá bị cột khác vượt lên trước (kéo thả) → không còn là cột đầu, không ghim.
    expect(laGhim(COT[0], 1)).toBe(false)
    expect(laGhim(COT[1], 0)).toBe(false)
  })

  test('CHON_BANG_GHIM: cột ô chọn cũng dính trái, tiêu đề z trên mọi tiêu đề cột, ô thân đục (từ md bỏ màu dòng)', () => {
    expect(CHON_BANG_GHIM.chon_oTh).toContain('left-0')
    expect(CHON_BANG_GHIM.chon_oTh).toContain('z-30')
    expect(CHON_BANG_GHIM.chon_oTd).toContain('sticky')
    expect(CHON_BANG_GHIM.chon_oTd).toContain('bg-background!')
    expect(CHON_BANG_GHIM.chon_oTd).toContain('md:bg-none!')
    expect(CHON_BANG_GHIM.chon_oTd).not.toContain('md:bg-transparent')
  })
})
