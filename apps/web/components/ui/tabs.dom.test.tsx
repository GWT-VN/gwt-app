// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { useState } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DsRoot } from './ds-root'
import { tinhThuGon } from '@/lib/tabs-thu-gon'
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from './tabs'

function Segmented() {
  return (
    <Tabs defaultValue="tat-ca">
      <TabsList aria-label="Lọc theo trạng thái">
        <TabsTrigger value="tat-ca">
          Tất cả <TabsCount>128</TabsCount>
        </TabsTrigger>
        <TabsTrigger value="cho">Chờ xử lý</TabsTrigger>
        <TabsTrigger value="luu" disabled>
          Lưu trữ
        </TabsTrigger>
        <TabsTrigger value="xong">Hoàn tất</TabsTrigger>
      </TabsList>
      <TabsContent value="tat-ca">128 đơn</TabsContent>
      <TabsContent value="cho">12 đơn chờ</TabsContent>
      <TabsContent value="luu">Lưu trữ</TabsContent>
      <TabsContent value="xong">Đơn xong</TabsContent>
    </Tabs>
  )
}

const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const chon = (name: string | RegExp) => tab(name).getAttribute('aria-selected')

test('←/→ chuyển focus và kích hoạt luôn (automatic), panel đổi theo', async () => {
  const u = userEvent.setup()
  render(<Segmented />)
  await u.tab()
  expect(document.activeElement).toBe(tab(/Tất cả/))
  await u.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(tab('Chờ xử lý'))
  expect(chon('Chờ xử lý')).toBe('true')
  expect(screen.getByRole('tabpanel').textContent).toBe('12 đơn chờ')
  await u.keyboard('{ArrowLeft}')
  expect(chon(/Tất cả/)).toBe('true')
})

test('Home/End về tab đầu/cuối; tab disabled bị bỏ qua khi đi bằng mũi tên', async () => {
  const u = userEvent.setup()
  render(<Segmented />)
  await u.tab()
  await u.keyboard('{End}')
  expect(chon('Hoàn tất')).toBe('true')
  await u.keyboard('{Home}')
  expect(chon(/Tất cả/)).toBe('true')
  await u.keyboard('{ArrowRight}{ArrowRight}')
  // Chờ xử lý → (bỏ Lưu trữ đang tắt) → Hoàn tất
  expect(chon('Hoàn tất')).toBe('true')
  expect(tab('Lưu trữ').hasAttribute('disabled')).toBe(true)
})

test('chỉ tab đang chọn có tabIndex 0, các tab còn lại −1', async () => {
  const u = userEvent.setup()
  render(<Segmented />)
  await u.tab()
  await u.keyboard('{ArrowRight}')
  const tabs = screen.getAllByRole('tab')
  expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1, -1])
})

test('pill: số đếm đọc kèm nhãn tab; số danger mang data-color', () => {
  render(
    <Tabs defaultValue="mo">
      <TabsList variant="pill" aria-label="Nhóm ticket">
        <TabsTrigger value="mo">
          Đang mở <TabsCount>19</TabsCount>
        </TabsTrigger>
        <TabsTrigger value="qua-han">
          Quá hạn <TabsCount color="danger">2</TabsCount>
        </TabsTrigger>
      </TabsList>
    </Tabs>,
  )
  expect(tab('Đang mở 19')).toBeTruthy()
  const t = tab('Quá hạn 2')
  expect(t.querySelector('[data-slot="tabs-count"]')?.getAttribute('data-color')).toBe('danger')
  expect(screen.getByRole('tablist').getAttribute('data-variant')).toBe('pill')
})

test('tinhThuGon: vừa hết → không ẩn; hẹp → ẩn phần đuôi; tab đang chọn luôn hiện', () => {
  // 4 tab rộng 100, cách 4; nút Thêm 80
  const r = [100, 100, 100, 100]
  expect(tinhThuGon({ rong: r, cho: 412, gap: 4, rongThem: 80, chon: 0 })).toEqual([])
  expect(tinhThuGon({ rong: r, cho: 300, gap: 4, rongThem: 80, chon: 0 })).toEqual([2, 3])
  // đang chọn tab cuối → tab cuối vẫn hiện, ẩn tab khác thay chỗ
  expect(tinhThuGon({ rong: r, cho: 300, gap: 4, rongThem: 80, chon: 3 })).toEqual([1, 2])
})

afterEach(() => vi.restoreAllMocks())

function Pill({ onDoi }: { onDoi?: (v: string) => void }) {
  return (
    <DsRoot>
      <Tabs defaultValue="mo" onValueChange={onDoi}>
        <TabsList variant="pill" thuGon aria-label="Nhóm ticket">
          <TabsTrigger value="mo">Đang mở</TabsTrigger>
          <TabsTrigger value="toi">Của tôi</TabsTrigger>
          <TabsTrigger value="qua-han">Quá hạn</TabsTrigger>
          <TabsTrigger value="tat-ca">Tất cả</TabsTrigger>
        </TabsList>
      </Tabs>
    </DsRoot>
  )
}

test('thuGon khi hẹp: tab thừa vào menu "Thêm"; chọn từ menu → tab đó thành đang chọn và hiện ra', async () => {
  // jsdom không có bố cục: mỗi tab 100, nút Thêm 80, khung còn 300 → hiện 2 tab + Thêm
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tab') return 100
    if (this.dataset.slot === 'tabs-them') return 80
    return 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === 'tabs-khung' ? 300 : 0
  })
  const doi = vi.fn()
  const u = userEvent.setup()
  render(<Pill onDoi={doi} />)
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(2))
  expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Đang mở', 'Của tôi'])
  const them = screen.getByRole('button', { name: 'Thêm' })
  await u.click(them)
  const muc = await screen.findByRole('menuitem', { name: 'Tất cả' })
  await u.click(muc)
  expect(doi).toHaveBeenCalledWith('tat-ca')
  await waitFor(() => expect(chon('Tất cả')).toBe('true'))
  // tab đang chọn luôn hiện: Tất cả hiện, Của tôi nhường chỗ
  expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Đang mở', 'Tất cả'])
  await waitFor(() => expect(document.activeElement).toBe(tab('Tất cả')))
})

test('thuGon + giá trị đổi TRỄ (URL qua router): chọn từ "Thêm" → focus vẫn về đúng tab khi nó hiện ra, không rơi về body', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tab') return 100
    if (this.dataset.slot === 'tabs-them') return 80
    return 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === 'tabs-khung' ? 300 : 0
  })
  function Tre() {
    const [v, setV] = useState('mo')
    return (
      <DsRoot>
        {/* Như router.replace: giá trị mới về sau khi menu đã đóng. */}
        <Tabs value={v} onValueChange={(x) => setTimeout(() => setV(x), 50)}>
          <TabsList variant="pill" thuGon aria-label="Nhóm ticket">
            <TabsTrigger value="mo">Đang mở</TabsTrigger>
            <TabsTrigger value="toi">Của tôi</TabsTrigger>
            <TabsTrigger value="qua-han">Quá hạn</TabsTrigger>
            <TabsTrigger value="tat-ca">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>
      </DsRoot>
    )
  }
  const u = userEvent.setup()
  render(<Tre />)
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(2))
  await u.click(screen.getByRole('button', { name: 'Thêm' }))
  await u.click(await screen.findByRole('menuitem', { name: 'Tất cả' }))
  await waitFor(() => expect(chon('Tất cả')).toBe('true'))
  await waitFor(() => expect(document.activeElement).toBe(tab('Tất cả')))
})

test('thuGon: số đếm của tab đang ẩn đổi → mục trong menu "Thêm" hiện số MỚI', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tab') return 100
    if (this.dataset.slot === 'tabs-them') return 80
    return 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === 'tabs-khung' ? 300 : 0
  })
  const Dem = ({ n }: { n: number }) => (
    <DsRoot>
      <Tabs defaultValue="mo">
        <TabsList variant="pill" thuGon aria-label="Nhóm ticket">
          <TabsTrigger value="mo">Đang mở</TabsTrigger>
          <TabsTrigger value="toi">Của tôi</TabsTrigger>
          <TabsTrigger value="qua-han">
            Quá hạn <TabsCount color="danger">{n}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="tat-ca">Tất cả</TabsTrigger>
        </TabsList>
      </Tabs>
    </DsRoot>
  )
  const u = userEvent.setup()
  const { rerender } = render(<Dem n={2} />)
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(2))
  rerender(<Dem n={5} />)
  await u.click(screen.getByRole('button', { name: 'Thêm' }))
  const muc = await screen.findByRole('menuitem', { name: /^Quá hạn/ })
  expect(muc.textContent).toBe('Quá hạn 5')
})

// ── line + icon + thuGon (Xem nhanh, học Twenty "Home · Timeline · +4 More ▾") ──────────────────────────────────────
function doRong(khung: () => number) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tab') return 100
    if (this.dataset.slot === 'tabs-them') return 80
    return 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === 'tabs-khung' ? khung() : 0
  })
}

function Line({ onDoi }: { onDoi?: (v: string) => void }) {
  return (
    <DsRoot>
      <Tabs defaultValue="tong" onValueChange={onDoi}>
        <TabsList variant="line" thuGon aria-label="Xem nhanh">
          <TabsTrigger value="tong">
            <svg data-testid="icon-tong" aria-hidden="true" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="lan">Lần lỗi</TabsTrigger>
          <TabsTrigger value="nk">Nhật ký</TabsTrigger>
          <TabsTrigger value="vt">Vật tư</TabsTrigger>
          <TabsTrigger value="khac">Ticket khác</TabsTrigger>
        </TabsList>
        <TabsContent value="tong">Panel tổng quan</TabsContent>
        <TabsContent value="khac">Panel ticket khác</TabsContent>
      </Tabs>
    </DsRoot>
  )
}

test('line: icon trước chữ không vào tên tab; tab mang vẻ line', () => {
  render(<Line />)
  const t = tab('Tổng quan')
  expect(t.firstElementChild?.getAttribute('data-testid')).toBe('icon-tong')
  expect(screen.getByRole('tablist').getAttribute('data-variant')).toBe('line')
})

test('line thuGon hẹp: gom đuôi vào "+N Thêm" (N = số tab ẩn), nút đứng ngoài tablist; rộng ra thì nhả hết', async () => {
  let w = 300
  doRong(() => w)
  const cb: (() => void)[] = []
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(f: () => void) {
        cb.push(f)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  render(<Line />)
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(2))
  const them = screen.getByRole('button', { name: '+3 Thêm' })
  expect(screen.getByRole('tablist').contains(them)).toBe(false)
  w = 600
  act(() => cb.forEach((f) => f()))
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(5))
  expect(them.hidden).toBe(true)
  vi.unstubAllGlobals()
})

test('line thuGon: chọn tab ẩn từ menu → tab đó được chọn, hiện ra, nhận focus; panel đổi theo', async () => {
  doRong(() => 300)
  const doi = vi.fn()
  const u = userEvent.setup()
  render(<Line onDoi={doi} />)
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBe(2))
  await u.click(screen.getByRole('button', { name: '+3 Thêm' }))
  await u.click(await screen.findByRole('menuitem', { name: 'Ticket khác' }))
  expect(doi).toHaveBeenCalledWith('khac')
  await waitFor(() => expect(document.activeElement).toBe(tab('Ticket khác')))
  expect(chon('Ticket khác')).toBe('true')
  expect(screen.getByRole('tabpanel').textContent).toBe('Panel ticket khác')
})

test('line thuGon (đủ chỗ): ←/→/Home/End chuyển + kích hoạt như tab thường', async () => {
  doRong(() => 900)
  const u = userEvent.setup()
  render(<Line />)
  await u.tab()
  expect(document.activeElement).toBe(tab('Tổng quan'))
  await u.keyboard('{ArrowRight}')
  expect(chon('Lần lỗi')).toBe('true')
  await u.keyboard('{End}')
  expect(chon('Ticket khác')).toBe('true')
  await u.keyboard('{Home}')
  expect(chon('Tổng quan')).toBe('true')
  await u.keyboard('{ArrowLeft}')
  expect(chon('Ticket khác')).toBe('true')
})
