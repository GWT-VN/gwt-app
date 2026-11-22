// @vitest-environment jsdom
import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(),
}))

import { CauHinhBangDs } from './bang-ds'
import { KhungChon, OChonDong, ThanhDaChon } from '@/bang'
import { Button } from './button'
import { buttonVariants } from './button-variants'
import { CaiDatHienThi, DataViewToolbar } from './data-view-toolbar'
import type { CotBang } from './use-cot-bang'
import type { DangXem } from './data-view-styles'
import { DsRoot } from './ds-root'
import { SavedView } from './saved-view'
import { Tabs, TabsList, TabsTrigger } from './tabs'
import { thongBao } from './sonner'
import { Toggle, ToggleGroup, ToggleGroupItem } from './toggle-group'
import { TooltipNhanh } from './tooltip'
import { XemNhanh } from './xem-nhanh'

afterEach(() => vi.restoreAllMocks())

const COT: CotBang[] = [
  { id: 'uu', ten: 'Ưu tiên', kieu: 'sap', rong: 88, nghia: { tang: 'Thấp lên cao', giam: 'Cao xuống thấp' } },
  { id: 'loai', ten: 'Loại lỗi', kieu: 'loc', rong: 120 },
  { id: 'ma', ten: 'Mã', khoa: true, kieu: 'sap', rong: 96, nghia: { tang: 'Cũ trước', giam: 'Mới trước' } },
  { id: 'khach', ten: 'Khách', kieu: 'thuong', rong: 200 },
  { id: 'han', ten: 'Hạn', kieu: 'sap', rong: 100, nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' } },
]

/** Màn demo: dạng xem + xem nhanh + cột ẩn giữ ở state cha; tab tự giữ (uncontrolled) — đổi dạng xem không được đụng. */
function Man({ onCotAn = () => {}, onSapXep = () => {} }: { onCotAn?: (a: string[]) => void; onSapXep?: (s: { cot: string; tang: boolean }) => void }) {
  const [xem, setXem] = useState<DangXem>('bang')
  const [nhanh, setNhanh] = useState(false)
  const [an, setAn] = useState<string[]>(['khach'])
  return (
    <DsRoot>
      <DataViewToolbar
        tieuDe="Ticket"
        dem={{ thay: 19, tong: 22 }}
        tabs={
          <Tabs defaultValue="mo">
            <TabsList variant="pill" aria-label="Nhóm ticket">
              <TabsTrigger value="mo">Đang mở</TabsTrigger>
              <TabsTrigger value="qua-han">Quá hạn</TabsTrigger>
            </TabsList>
          </Tabs>
        }
        dangXem={xem}
        onDoiXem={setXem}
        xemNhanh={nhanh}
        onXemNhanh={setNhanh}
        caiDat={
          <CaiDatHienThi
            dangXem={xem}
            onDoiXem={setXem}
            cot={COT}
            cotAn={an}
            onCotAn={(a) => {
              setAn(a)
              onCotAn(a)
            }}
            sapXep={{ cot: 'uu', tang: true }}
            onSapXep={onSapXep}
          />
        }
      />
    </DsRoot>
  )
}

test('đầu trang: tiêu đề + "đang thấy X / Y"; dạng xem là radiogroup 3 radio, Bảng đang chọn', () => {
  render(<Man />)
  expect(screen.getByRole('heading', { name: 'Ticket' })).toBeTruthy()
  expect(screen.getByText('đang thấy 19 / 22')).toBeTruthy()
  const nhom = screen.getByRole('radiogroup', { name: 'Dạng xem' })
  const radio = within(nhom).getAllByRole('radio')
  expect(radio.map((r) => r.getAttribute('aria-label'))).toEqual(['Danh sách', 'Bảng', 'Kanban'])
  expect(within(nhom).getByRole('radio', { name: 'Bảng' }).getAttribute('aria-checked')).toBe('true')
})

test('đổi dạng xem giữ nguyên tab đang chọn; bấm lại dạng đang chọn không bỏ chọn', async () => {
  const user = userEvent.setup()
  render(<Man />)
  await user.click(screen.getByRole('tab', { name: 'Quá hạn' }))
  await user.click(screen.getByRole('radio', { name: 'Kanban' }))
  expect(screen.getByRole('radio', { name: 'Kanban' }).getAttribute('aria-checked')).toBe('true')
  expect(screen.getByRole('tab', { name: 'Quá hạn' }).getAttribute('aria-selected')).toBe('true')
  await user.click(screen.getByRole('radio', { name: 'Kanban' }))
  expect(screen.getByRole('radio', { name: 'Kanban' }).getAttribute('aria-checked')).toBe('true')
})

test('thẻ xem nhanh: Toggle aria-pressed, mặc định tắt, bấm thì bật', async () => {
  const user = userEvent.setup()
  render(<Man />)
  const nut = screen.getByRole('button', { name: 'Thẻ xem nhanh bên phải' })
  expect(nut.getAttribute('aria-pressed')).toBe('false')
  await user.click(nut)
  expect(nut.getAttribute('aria-pressed')).toBe('true')
})

test('nút icon có aria-label + tooltip khi focus phím (chữ tooltip là mô tả, không lặp aria-label)', async () => {
  const user = userEvent.setup()
  render(<Man />)
  const gear = screen.getByRole('button', { name: 'Cài đặt hiển thị' })
  act(() => gear.focus())
  // focus bằng script chưa là :focus-visible trong jsdom → Tab thật từ phần tử trước
  await user.tab({ shift: true })
  await user.tab()
  expect(document.activeElement).toBe(gear)
  const tip = await screen.findByRole('tooltip')
  expect(tip.textContent).not.toBe('')
  expect(tip.textContent).not.toBe('Cài đặt hiển thị')
})

test('⚙ mở trang gốc; trang con có ← và focus vào ←; ← về gốc và focus về đúng mục đã mở', async () => {
  const user = userEvent.setup()
  render(<Man />)
  await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
  const pop = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
  expect(pop.closest('[data-ds="v2"]')).not.toBeNull()
  const mucCot = within(pop).getByRole('button', { name: /Cột hiển thị/ })
  await user.click(mucCot)
  const lui = await within(pop).findByRole('button', { name: 'Quay lại' })
  await waitFor(() => expect(document.activeElement).toBe(lui))
  await user.click(lui)
  const lai = await within(pop).findByRole('button', { name: /Cột hiển thị/ })
  await waitFor(() => expect(document.activeElement).toBe(lai))
})

test('⚙ Cột hiển thị: tick bỏ ẩn/hiện cột, cột khoá (Mã) tắt', async () => {
  const user = userEvent.setup()
  const onCotAn = vi.fn()
  render(<Man onCotAn={onCotAn} />)
  await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
  const pop = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
  await user.click(within(pop).getByRole('button', { name: /Cột hiển thị/ }))
  expect(within(pop).getByRole('checkbox', { name: 'Mã' }).hasAttribute('disabled')).toBe(true)
  expect(within(pop).getByRole('checkbox', { name: 'Khách' }).getAttribute('aria-checked')).toBe('false')
  await user.click(within(pop).getByRole('checkbox', { name: 'Hạn' }))
  expect(onCotAn).toHaveBeenLastCalledWith(['khach', 'han'])
})

test('⚙ Sắp xếp: chỉ cột kieu "sap", mỗi cột hai lựa chọn nói NGHĨA bằng lời (không "tăng dần/giảm dần")', async () => {
  const user = userEvent.setup()
  const onSapXep = vi.fn()
  render(<Man onSapXep={onSapXep} />)
  await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
  const pop = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
  await user.click(within(pop).getByRole('button', { name: /Sắp xếp/ }))
  const nhom = within(pop).getAllByRole('group')
  expect(nhom.map((g) => g.getAttribute('aria-label'))).toEqual(['Ưu tiên', 'Mã', 'Hạn'])
  const uu = within(nhom[0])
  expect(uu.getByRole('button', { name: 'Thấp lên cao' }).getAttribute('aria-pressed')).toBe('true')
  expect(uu.getByRole('button', { name: 'Cao xuống thấp' }).getAttribute('aria-pressed')).toBe('false')
  expect(pop.textContent).not.toMatch(/tăng dần|giảm dần/i)
  await user.click(uu.getByRole('button', { name: 'Cao xuống thấp' }))
  expect(onSapXep).toHaveBeenLastCalledWith({ cot: 'uu', tang: false })
  await user.click(within(nhom[2]).getByRole('button', { name: 'Gần hạn nhất trước' }))
  expect(onSapXep).toHaveBeenLastCalledWith({ cot: 'han', tang: true })
})

test('⚙ Bố cục: chọn dạng → đổi dạng xem, về trang gốc', async () => {
  const user = userEvent.setup()
  render(<Man />)
  await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
  const pop = await screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
  await user.click(within(pop).getByRole('button', { name: /Bố cục/ }))
  await user.click(within(pop).getByRole('button', { name: /Danh sách/ }))
  expect(screen.getByRole('radio', { name: 'Danh sách' }).getAttribute('aria-checked')).toBe('true')
  // về gốc: "Cột hiển thị" chỉ có ở dạng Bảng → không còn
  await waitFor(() => expect(within(pop).queryByRole('button', { name: 'Quay lại' })).toBeNull())
  expect(within(pop).queryByRole('button', { name: /Cột hiển thị/ })).toBeNull()
})

function Luu({ onLuu }: { onLuu: (v: { ten: string; chiaSe: boolean; query: string }) => void }) {
  return (
    <DsRoot>
      <SavedView dieuKien={[{ nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước' }]} query="loai=ro-ri" khu="CSKH" onLuu={onLuu} />
    </DsRoot>
  )
}

test('SavedView: mở → ô tên focus sẵn; Lưu khi trống → lỗi đúng chữ, không lưu', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(<Luu onLuu={onLuu} />)
  await user.click(screen.getByRole('button', { name: 'Lưu bộ lọc' }))
  const pop = await screen.findByRole('dialog', { name: 'Lưu bộ lọc' })
  const o = within(pop).getByRole('textbox', { name: 'Tên bộ lọc' })
  await waitFor(() => expect(document.activeElement).toBe(o))
  expect(o.getAttribute('maxlength')).toBe('40')
  expect(within(pop).getByText('Rò rỉ nước')).toBeTruthy()
  await user.click(within(pop).getByRole('button', { name: 'Lưu' }))
  expect(onLuu).not.toHaveBeenCalled()
  expect(o.getAttribute('aria-invalid')).toBe('true')
  expect(screen.getByRole('textbox', { name: 'Tên bộ lọc', description: 'Đặt tên để tìm lại trong sidebar.' })).toBe(o)
  expect(document.activeElement).toBe(o)
})

test('SavedView: gõ tên + Enter → onLuu({ ten, chiaSe, query }) + toast, popover đóng', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  const xong = vi.spyOn(thongBao, 'xong').mockImplementation(() => 1)
  render(<Luu onLuu={onLuu} />)
  await user.click(screen.getByRole('button', { name: 'Lưu bộ lọc' }))
  const pop = await screen.findByRole('dialog', { name: 'Lưu bộ lọc' })
  await user.click(within(pop).getByRole('checkbox', { name: /Chia sẻ cho cả khu CSKH/ }))
  await user.type(within(pop).getByRole('textbox', { name: 'Tên bộ lọc' }), '  P1 rò rỉ {Enter}')
  expect(onLuu).toHaveBeenCalledWith({ ten: 'P1 rò rỉ', chiaSe: true, query: 'loai=ro-ri' })
  expect(xong).toHaveBeenCalledWith('Đã lưu “P1 rò rỉ” vào Bộ lọc đã lưu')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('SavedView: Enter lúc bộ gõ tiếng Việt đang ghép chữ (isComposing / 229) → không lưu', async () => {
  const user = userEvent.setup()
  const onLuu = vi.fn()
  render(<Luu onLuu={onLuu} />)
  await user.click(screen.getByRole('button', { name: 'Lưu bộ lọc' }))
  const o = within(await screen.findByRole('dialog', { name: 'Lưu bộ lọc' })).getByRole('textbox', { name: 'Tên bộ lọc' })
  await user.type(o, 'Rò')
  // fireEvent trả false khi handler đã preventDefault → trình duyệt không submit ngầm
  expect(fireEvent.keyDown(o, { key: 'Enter', isComposing: true })).toBe(false)
  expect(fireEvent.keyDown(o, { key: 'Enter', keyCode: 229 })).toBe(false)
  expect(onLuu).not.toHaveBeenCalled()
})

test('Button trạng thái bật: ghost nền accent theo aria-pressed / aria-checked / aria-expanded / data-state=on', () => {
  const c = buttonVariants({ variant: 'ghost' }).split(' ')
  expect(c).toEqual(
    expect.arrayContaining(['aria-pressed:bg-accent', 'aria-checked:bg-accent', 'aria-expanded:bg-accent', 'data-[state=on]:bg-accent']),
  )
  // đang bật thì nền accent thắng :active
  expect(c.find((x) => x.endsWith('active:bg-(--color-background-primary-ghost-active)'))).toContain('not-data-[state=on]')
})

test('Toggle / ToggleGroupItem: diện mạo Button ghost icon, trạng thái đọc được', async () => {
  const user = userEvent.setup()
  render(
    <>
      <Toggle aria-label="Ghim">G</Toggle>
      <ToggleGroup type="single" defaultValue="a" aria-label="Chọn">
        <ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B">B</ToggleGroupItem>
      </ToggleGroup>
    </>,
  )
  const t = screen.getByRole('button', { name: 'Ghim' })
  await user.click(t)
  expect(t.getAttribute('aria-pressed')).toBe('true')
  expect(t.getAttribute('data-state')).toBe('on')
  expect(t.className).toContain('data-[state=on]:bg-accent')
  expect(screen.getByRole('radio', { name: 'A' }).getAttribute('aria-checked')).toBe('true')
})

function Nhanh({ onDong = () => {}, onTruoc = () => {}, onSau = () => {}, the = true }) {
  return (
    <DsRoot>
      <XemNhanh the={the ? { ma: 'T-101' } : null} onDong={onDong} onTruoc={onTruoc} onSau={onSau}>
        <input aria-label="Ô gõ" />
      </XemNhanh>
    </DsRoot>
  )
}

test('XemNhanh: thẻ có tên, nội dung trống ghi "chưa chốt"; ↑↓ lướt, Esc đóng; gõ trong ô thì bỏ qua', async () => {
  const user = userEvent.setup()
  const onDong = vi.fn()
  const onTruoc = vi.fn()
  const onSau = vi.fn()
  render(<Nhanh onDong={onDong} onTruoc={onTruoc} onSau={onSau} />)
  const the = screen.getByRole('complementary', { name: 'Xem nhanh T-101' })
  expect(the.textContent).toContain('chưa chốt')
  await user.keyboard('{ArrowDown}')
  expect(onSau).toHaveBeenCalledTimes(1)
  await user.keyboard('{ArrowUp}')
  expect(onTruoc).toHaveBeenCalledTimes(1)
  await user.keyboard('{Escape}')
  expect(onDong).toHaveBeenCalledTimes(1)
  await user.click(screen.getByRole('textbox', { name: 'Ô gõ' }))
  await user.keyboard('{ArrowDown}{Escape}')
  expect(onSau).toHaveBeenCalledTimes(1)
  expect(onDong).toHaveBeenCalledTimes(1)
  await user.click(within(the).getByRole('button', { name: /Đóng xem nhanh/ }))
  expect(onDong).toHaveBeenCalledTimes(2)
})

test('XemNhanh: không có thẻ → không render khung, không nghe phím', async () => {
  const user = userEvent.setup()
  const onSau = vi.fn()
  render(<Nhanh the={false} onSau={onSau} />)
  expect(screen.queryByRole('complementary')).toBeNull()
  await user.keyboard('{ArrowDown}')
  expect(onSau).not.toHaveBeenCalled()
})

function NhanhTrongBang() {
  const [the, setThe] = useState<{ ma: string } | null>({ ma: 'T-1' })
  return (
    <DsRoot>
      <CauHinhBangDs>
        <KhungChon khoaTrang={['T-1', 'T-2']} tong={2} bat thamSo={{}} layTatCaKhoa={async () => ['T-1', 'T-2']}>
          <ThanhDaChon nhan="ticket" />
          <XemNhanh the={the} onDong={() => setThe(null)}>
            <table>
              <tbody>
                <tr>
                  <OChonDong khoa="T-1" />
                </tr>
              </tbody>
            </table>
          </XemNhanh>
        </KhungChon>
      </CauHinhBangDs>
    </DsRoot>
  )
}

test('XemNhanh trong bảng có chọn dòng (escBoChon): Esc chỉ đóng thẻ, lựa chọn còn; Esc lần nữa mới bỏ chọn', async () => {
  const user = userEvent.setup()
  render(<NhanhTrongBang />)
  await user.click(screen.getByRole('checkbox', { name: 'Chọn T-1' }))
  const thanh = () => screen.queryByRole('toolbar', { name: 'Thao tác hàng loạt' })
  expect(thanh()).not.toBeNull()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('complementary')).toBeNull()
  expect(thanh()).not.toBeNull()
  await user.keyboard('{Escape}')
  expect(thanh()).toBeNull()
})

test('XemNhanh nhường Esc cho lớp trên: đang kéo (body data-dang-keo) → không đóng thẻ', async () => {
  const user = userEvent.setup()
  const onDong = vi.fn()
  render(<Nhanh onDong={onDong} />)
  document.body.setAttribute('data-dang-keo', '')
  try {
    await user.keyboard('{Escape}')
    expect(onDong).not.toHaveBeenCalled()
  } finally {
    document.body.removeAttribute('data-dang-keo')
  }
  await user.keyboard('{Escape}')
  expect(onDong).toHaveBeenCalledTimes(1)
})

test('XemNhanh nhường Esc cho lớp trên: tooltip đang hiện → Esc đóng tooltip, thẻ còn; Esc lần nữa mới đóng thẻ', async () => {
  const user = userEvent.setup()
  const onDong = vi.fn()
  render(
    <DsRoot>
      <XemNhanh the={{ ma: 'T-101' }} onDong={onDong}>
        <input aria-label="Ô gõ" />
        <TooltipNhanh content="Mô tả nút">
          <Button variant="ghost">Nút có tooltip</Button>
        </TooltipNhanh>
      </XemNhanh>
    </DsRoot>,
  )
  // Tab thật để nút :focus-visible (tooltip phím chỉ đóng bằng Esc / rời focus).
  act(() => screen.getByRole('textbox', { name: 'Ô gõ' }).focus())
  await user.tab()
  expect(await screen.findByRole('tooltip')).toBeTruthy()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  expect(onDong).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  expect(onDong).toHaveBeenCalledTimes(1)
})
