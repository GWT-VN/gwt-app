// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DsRoot } from '@/components/ui/ds-root'
import { Toaster, thongBao } from '@/components/ui/sonner'
import { KhoiMenuThuocTinh } from './khoi-menu-thuoc-tinh'

// Giờ VN cho cả file (mẫu date-time-picker.dom.test.tsx): đặt trước mọi import.
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-20T10:00:00+07:00'))
})
// Sonner giữ danh sách toast toàn cục → đóng hết giữa các test (mẫu toast.dom.test.tsx).
afterEach(async () => {
  vi.useRealTimers()
  thongBao.dong()
  await act(() => new Promise((r) => setTimeout(r, 300)))
})

function dung() {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <KhoiMenuThuocTinh />
      <Toaster />
    </DsRoot>,
  )
  return user
}

const dong = (ma: string) => document.querySelector<HTMLTableRowElement>(`tr[data-ma="${ma}"]`)!
const o = (ma: string, cot: string) => dong(ma).querySelector(`[data-cot="${cot}"]`)!.textContent
const soMenu = () => screen.queryAllByRole('menu').length

/** Focus dòng rồi bấm phím (phím tắt theo dòng nghe ở window, chỉ khi focus nằm trong thân bảng). */
async function phimTrenDong(user: ReturnType<typeof userEvent.setup>, ma: string, phim: string) {
  act(() => dong(ma).focus())
  await user.keyboard(phim)
}

test('P trên dòng đang trỏ mở thẳng menu con Ưu tiên, focus ở mục ✓', async () => {
  const user = dung()
  await phimTrenDong(user, 'TK-1021', 'p')
  await waitFor(() => expect(soMenu()).toBe(2))
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-checked')).toBe('true'))
  expect(document.activeElement?.getAttribute('role')).toBe('menuitemradio')
  expect(document.activeElement?.textContent).toBe('Cao')
  // đầu menu cha = mã dòng (không chọn nhiều)
  expect(screen.getByText('TK-1021', { selector: '[role="menu"] *' })).toBeTruthy()
})

test('P rồi chuột nhích (Radix coi là đang dùng chuột) → menu con vẫn nhận focus ở mục ✓', async () => {
  dung()
  act(() => dong('TK-1023').focus())
  fireEvent.keyDown(dong('TK-1023'), { key: 'p' })
  fireEvent.pointerMove(document, { pointerType: 'mouse' })
  await waitFor(() => expect(soMenu()).toBe(2))
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Khẩn'))
  expect(document.activeElement?.getAttribute('aria-checked')).toBe('true')
})

test('← trong menu con về mục cha; Esc đóng hết, focus về dòng', async () => {
  const user = dung()
  await phimTrenDong(user, 'TK-1022', 'p')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Vừa'))
  await user.keyboard('{ArrowLeft}')
  await waitFor(() => expect(soMenu()).toBe(1))
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /^Ưu tiên/ }))
  await user.keyboard('{ArrowRight}')
  await waitFor(() => expect(soMenu()).toBe(2))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(soMenu()).toBe(0))
  await waitFor(() => expect(document.activeElement).toBe(dong('TK-1022')))
})

test('A mở Người làm, focus ô tìm; gõ "p" trong ô tìm KHÔNG mở menu Ưu tiên', async () => {
  const user = dung()
  await phimTrenDong(user, 'TK-1021', 'a')
  const oTim = await screen.findByRole('textbox', { name: 'Tìm người…' })
  await waitFor(() => expect(document.activeElement).toBe(oTim))
  await user.keyboard('ph')
  await new Promise((r) => setTimeout(r, 30))
  expect((oTim as HTMLInputElement).value).toBe('ph')
  expect(document.activeElement).toBe(oTim)
  expect(screen.queryByRole('menuitemradio', { name: 'Khẩn' })).toBeNull()
  // lọc bỏ dấu: "ph" khớp Phạm, Phan (avatar aria-hidden không vào tên đọc)
  expect(screen.getAllByRole('menuitemradio')).toHaveLength(2)
  expect(screen.getByRole('menuitemradio', { name: 'Phạm Quốc Cường' })).toBeTruthy()
  expect(screen.getByRole('menuitemradio', { name: 'Phan Thảo My' })).toBeTruthy()
})

test('bộ gõ đang ghép chữ (IME) → phím P trên dòng không mở menu', async () => {
  dung()
  act(() => dong('TK-1021').focus())
  fireEvent.keyDown(dong('TK-1021'), { key: 'p', isComposing: true })
  fireEvent.keyDown(dong('TK-1021'), { key: 'Process', keyCode: 229 })
  await new Promise((r) => setTimeout(r, 30))
  expect(soMenu()).toBe(0)
})

test('chọn 3 dòng (⇧ + bấm) → đầu menu "3 ticket", đổi Ưu tiên áp cả 3; Hoàn tác khôi phục 3 giá trị khác nhau', async () => {
  const user = dung()
  expect([o('TK-1021', 'uu-tien'), o('TK-1022', 'uu-tien'), o('TK-1023', 'uu-tien')]).toEqual(['Cao', 'Vừa', 'Khẩn'])
  await user.click(dong('TK-1021'))
  await user.keyboard('{Shift>}')
  await user.click(dong('TK-1023'))
  await user.keyboard('{/Shift}')
  expect(dong('TK-1022').getAttribute('data-state')).toBe('selected')
  await user.keyboard('p')
  await waitFor(() => expect(soMenu()).toBe(2))
  expect(screen.getByText('3 ticket', { selector: '[role="menu"] *' })).toBeTruthy()
  // ba giá trị khác nhau → không mục nào ✓
  expect(screen.getAllByRole('menuitemradio').filter((x) => x.getAttribute('aria-checked') === 'true')).toHaveLength(0)
  // … nên focus vào mục đầu của menu con (↑/↓ đi tiếp được ngay)
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Không'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Thấp' }))
  await waitFor(() => expect(soMenu()).toBe(0))
  expect([o('TK-1021', 'uu-tien'), o('TK-1022', 'uu-tien'), o('TK-1023', 'uu-tien')]).toEqual(['Thấp', 'Thấp', 'Thấp'])
  await screen.findByText('Đã đổi ưu tiên 3 ticket → Thấp', { exact: false })
  await user.click(screen.getByRole('button', { name: 'Hoàn tác' }))
  expect([o('TK-1021', 'uu-tien'), o('TK-1022', 'uu-tien'), o('TK-1023', 'uu-tien')]).toEqual(['Cao', 'Vừa', 'Khẩn'])
})

test('menu chuột phải trên dòng NGOÀI vùng chọn chỉ áp dòng đó', async () => {
  const user = dung()
  await user.click(dong('TK-1021'))
  await user.keyboard('{Control>}')
  await user.click(dong('TK-1022'))
  await user.keyboard('{/Control}')
  expect(dong('TK-1022').getAttribute('data-state')).toBe('selected')
  fireEvent.contextMenu(dong('TK-1025'))
  await waitFor(() => expect(soMenu()).toBe(1))
  expect(screen.getByText('TK-1025', { selector: '[role="menu"] *' })).toBeTruthy()
  await waitFor(() => expect(screen.getByRole('menu').contains(document.activeElement)).toBe(true))
  // phím trong menu đang mở: P nhảy vào menu con Ưu tiên
  await user.keyboard('p')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Thấp'))
  await user.click(screen.getByRole('menuitemradio', { name: 'Khẩn' }))
  await waitFor(() => expect(soMenu()).toBe(0))
  expect([o('TK-1021', 'uu-tien'), o('TK-1022', 'uu-tien'), o('TK-1025', 'uu-tien')]).toEqual(['Cao', 'Vừa', 'Khẩn'])
})

test('"Đặt hạn…" mở DateTimePicker neo ô Hạn của dòng: chỉ chọn ngày → Xong lưu CHỈ ngày; ⇧D mở lại, Huỷ không lưu', async () => {
  const user = dung()
  expect(o('TK-1024', 'han')).toBe('Đặt hạn')
  expect(o('TK-1028', 'han')).toBe('26/11') // hạn chỉ ngày (CEO 22/11): không giờ
  await user.click(screen.getByRole('button', { name: 'Thao tác TK-1024' }))
  await user.click(await screen.findByRole('menuitem', { name: /^Đặt hạn…/ }))
  await screen.findByRole('dialog', { name: 'Chọn ngày giờ' })
  expect(screen.getByRole('button', { name: /^Hạn TK-1024/ }).getAttribute('aria-expanded')).toBe('true')
  const oNgay = screen.getByRole('textbox', { name: 'Ngày' })
  await waitFor(() => expect(document.activeElement).toBe(oNgay))
  await user.clear(oNgay)
  await user.type(oNgay, '25/11')
  await user.click(screen.getByRole('button', { name: 'Xong' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(o('TK-1024', 'han')).toBe('25/11')
  await screen.findByText('Đã đặt hạn TK-1024 → 25/11', { exact: false })

  await phimTrenDong(user, 'TK-1024', '{Shift>}D{/Shift}')
  await screen.findByRole('dialog', { name: 'Chọn ngày giờ' })
  const oNgay2 = screen.getByRole('textbox', { name: 'Ngày' })
  await user.clear(oNgay2)
  await user.type(oNgay2, '26/11')
  await user.click(screen.getByRole('button', { name: 'Huỷ' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(o('TK-1024', 'han')).toBe('25/11')
})

const nhanDong = (ma: string) => [...dong(ma).querySelectorAll('[data-slot="badge"]')].map((b) => b.textContent)

test('hai thao tác nhãn liên tiếp: Hoàn tác toast 1 chỉ gỡ nhãn của toast 1, nhãn toast 2 còn nguyên', async () => {
  const user = dung()
  expect(nhanDong('TK-1024')).toEqual(['Lắp đặt'])
  await phimTrenDong(user, 'TK-1024', 'l')
  await waitFor(() => expect(soMenu()).toBe(2))
  await user.click(screen.getByRole('menuitemcheckbox', { name: 'Khách VIP' }))
  await user.click(screen.getByRole('menuitemcheckbox', { name: 'Bảo hành' }))
  expect(nhanDong('TK-1024')).toEqual(['Lắp đặt', 'Khách VIP', 'Bảo hành'])
  await user.keyboard('{Escape}')
  await waitFor(() => expect(soMenu()).toBe(0))
  const toast1 = (await screen.findByText('Đã thêm nhãn Khách VIP cho TK-1024', { exact: false })).closest<HTMLElement>('[data-slot="toast"]')!
  await user.click(toast1.querySelector<HTMLButtonElement>('button')!)
  expect(nhanDong('TK-1024')).toEqual(['Lắp đặt', 'Bảo hành'])
})

test('Hoàn tác gỡ nhãn trên nhiều dòng: chỉ trả nhãn về các dòng ĐÃ có nó, đúng vị trí cũ', async () => {
  const user = dung()
  // TK-1023 có Lỗi máy (đứng đầu), TK-1024 không có → gỡ Lỗi máy cho cả hai rồi Hoàn tác.
  await user.keyboard('{Control>}')
  await user.click(dong('TK-1023'))
  await user.click(dong('TK-1024'))
  await user.keyboard('{/Control}')
  await user.keyboard('l')
  await waitFor(() => expect(soMenu()).toBe(2))
  const loi = screen.getByRole('menuitemcheckbox', { name: 'Lỗi máy' })
  expect(loi.getAttribute('aria-checked')).toBe('mixed')
  await user.click(loi) // một phần → thêm cho cả hai
  expect(nhanDong('TK-1024')).toEqual(['Lắp đặt', 'Lỗi máy'])
  await user.click(loi) // đủ cả hai → gỡ cả hai
  expect(nhanDong('TK-1023')).toEqual(['Bảo hành'])
  await user.keyboard('{Escape}')
  await waitFor(() => expect(soMenu()).toBe(0))
  const toast = (await screen.findByText('Đã gỡ nhãn Lỗi máy', { exact: false })).closest<HTMLElement>('[data-slot="toast"]')!
  await user.click(toast.querySelector<HTMLButtonElement>('button')!)
  expect(nhanDong('TK-1023')).toEqual(['Lỗi máy', 'Bảo hành'])
  expect(nhanDong('TK-1024')).toEqual(['Lắp đặt', 'Lỗi máy'])
})

test('menu con Người làm: focus ở mục trong menu con, gõ "an" → cả hai chữ vào ô tìm; ⇧D cũng là chữ, KHÔNG mở ô chọn hạn', async () => {
  const user = dung()
  await phimTrenDong(user, 'TK-1021', 'a')
  const oTim = await screen.findByRole('textbox', { name: 'Tìm người…' })
  await waitFor(() => expect(document.activeElement).toBe(oTim))
  await user.keyboard('{ArrowDown}')
  expect(document.activeElement?.getAttribute('role')).toBe('menuitemradio')
  await user.keyboard('an')
  expect((oTim as HTMLInputElement).value).toBe('an')
  await user.keyboard('{ArrowDown}{Shift>}D{/Shift}')
  await new Promise((r) => setTimeout(r, 30))
  expect((oTim as HTMLInputElement).value).toBe('anD')
  expect(screen.queryByRole('dialog', { name: 'Chọn ngày giờ' })).toBeNull()
  expect(soMenu()).toBe(2)
})
