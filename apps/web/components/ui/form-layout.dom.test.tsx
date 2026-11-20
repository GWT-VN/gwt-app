// @vitest-environment jsdom
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { FormMau } from '@/app/ds/_khoi/khoi-form-layout'
import { DsRoot } from './ds-root'
import { focusLoiDau } from './form-layout'

afterEach(() => vi.useRealTimers())

const nut = (f: HTMLElement, ten: string) => within(f).getByRole('button', { name: ten }) as HTMLButtonElement
const oTen = (f: HTMLElement) => within(f).getByLabelText(/Tiêu đề/) as HTMLInputElement

test('focusLoiDau: focus ô aria-invalid="true" đầu tiên theo thứ tự DOM, bỏ qua aria-invalid="false"', () => {
  const { container } = render(
    <form>
      <input aria-label="a" aria-invalid="false" />
      <input aria-label="b" />
      <button type="button" aria-invalid="true">
        c
      </button>
      <input aria-label="d" aria-invalid="true" />
    </form>,
  )
  focusLoiDau(container.querySelector('form')!)
  expect(document.activeElement?.textContent).toBe('c')
})

test('mới mở: không ô nào đỏ', () => {
  const { container } = render(<FormMau p="t" />)
  expect(container.querySelectorAll('[aria-invalid="true"]').length).toBe(0)
  expect(container.textContent).toContain('Chưa lưu')
})

test('bấm Lưu khi thiếu trường bắt buộc: ô lỗi đầu nhận focus, aria-describedby trỏ câu lỗi', async () => {
  const u = userEvent.setup()
  const { container } = render(<FormMau p="t" />)
  const f = container.querySelector('form')!
  await u.click(nut(f, 'Lưu'))
  const ten = oTen(f)
  expect(document.activeElement).toBe(ten)
  expect(ten.getAttribute('aria-invalid')).toBe('true')
  const ids = (ten.getAttribute('aria-describedby') ?? '').split(' ')
  expect(ids.map((id) => document.getElementById(id)?.textContent)).toContain('Nhập tiêu đề để người khác biết việc gì.')
  // Loại + Ngày hẹn cũng đỏ, có câu lỗi viết cách sửa
  expect(container.querySelectorAll('[aria-invalid="true"]').length).toBe(3)
  expect(container.textContent).toContain('Chọn ngày hẹn từ hôm nay trở đi.')
  expect(container.textContent).toContain('Còn trường bắt buộc chưa điền.')
})

test('rời ô đã sửa thì kiểm; rời ô chưa sửa thì không', async () => {
  const u = userEvent.setup()
  const { container } = render(<FormMau p="t" />)
  const ten = oTen(container)
  await u.click(ten)
  await u.tab()
  expect(ten.getAttribute('aria-invalid')).toBeNull()
  await u.click(ten)
  await u.type(ten, 'x')
  await u.clear(ten)
  await u.tab()
  expect(ten.getAttribute('aria-invalid')).toBe('true')
  await u.click(ten)
  await u.type(ten, 'Bảo dưỡng')
  await u.tab()
  expect(ten.getAttribute('aria-invalid')).toBeNull()
})

test('đang lưu: Lưu loading + khoá cả 2 nút; lỗi máy chủ → Alert danger đầu form, giữ dữ liệu; lưu lại được', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const u = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const { container } = render(<FormMau p="t" dau={{ loai: 'bao-duong', ngay: '2099-01-15' }} />)
  const f = container.querySelector('form')!
  await u.type(oTen(f), 'Bảo dưỡng định kỳ')
  await u.click(nut(f, 'Lưu'))
  expect(container.querySelectorAll('[aria-invalid="true"]').length).toBe(0)
  expect(nut(f, 'Lưu').getAttribute('aria-disabled')).toBe('true')
  expect(document.activeElement).toBe(nut(f, 'Lưu'))
  expect(nut(f, 'Lưu').getAttribute('aria-busy')).toBe('true')
  expect(nut(f, 'Huỷ').disabled).toBe(true)

  await act(async () => {
    vi.advanceTimersByTime(2000)
  })
  const alert = within(f).getByRole('alert')
  expect(f.firstElementChild).toBe(alert)
  expect(oTen(f).value).toBe('Bảo dưỡng định kỳ')
  expect(nut(f, 'Lưu').getAttribute('aria-disabled')).toBeNull()
  expect(nut(f, 'Huỷ').disabled).toBe(false)

  await u.click(nut(f, 'Lưu'))
  await act(async () => {
    vi.advanceTimersByTime(2000)
  })
  expect(within(f).queryByRole('alert')).toBeNull()
  expect(f.textContent).toContain('Đã lưu')
})

test('Ngày hẹn (DatePicker): xoá ngày (đã sửa) rồi rời ô → lỗi hiện như ô nhập; còn đứng ở ô thì chưa', async () => {
  const u = userEvent.setup()
  render(
    <DsRoot>
      <FormMau p="t" dau={{ loai: 'bao-duong', ngay: '2099-01-15' }} />
    </DsRoot>,
  )
  const ngay = screen.getByRole('button', { name: 'Ngày hẹn 15/01/2099' })
  await u.click(ngay)
  await u.click(await screen.findByRole('button', { name: 'Xoá ngày' }))
  await waitFor(() => expect(document.activeElement).toBe(ngay))
  expect(ngay.getAttribute('aria-invalid')).toBeNull()
  await u.tab()
  expect(ngay.getAttribute('aria-invalid')).toBe('true')
})

/** Tên theo aria-labelledby (accname bước 2B: thắng `<label for>` lẫn label bọc ngoài) = nối chữ các id theo thứ tự. */
const tenTheoLabelledby = (el: Element) =>
  (el.getAttribute('aria-labelledby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((i) => document.getElementById(i)?.textContent)
    .join(' ')

test('Đính kèm: tên input tệp = nhãn "Đính kèm" + tiêu đề vùng; danh sách tệp (live region) có sẵn khi còn rỗng', () => {
  const { container } = render(<FormMau p="t" />)
  const input = container.querySelector('input[type="file"]')!
  expect(tenTheoLabelledby(input)).toBe('Đính kèm Kéo thả tệp hoặc chọn từ máy')
  const ds = within(container).getByRole('list', { name: 'Tệp đã chọn' })
  expect(ds.children.length).toBe(0)
  expect(ds.getAttribute('aria-live')).toBe('polite')
})
