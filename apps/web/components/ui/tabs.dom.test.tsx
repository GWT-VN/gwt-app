// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
