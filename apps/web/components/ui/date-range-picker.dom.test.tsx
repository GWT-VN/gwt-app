// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DateRangePicker } from './date-range-picker'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { DsRoot } from './ds-root'

// Giờ VN cho CẢ file (Review Focus #2) — cùng cách date-picker.dom.test.tsx.
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

// 00:30 sáng 20/11 (Thứ 6) giờ VN = 17:30 ngày 19/11 UTC.
const BAY_GIO = new Date('2026-11-20T00:30:00+07:00')
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(BAY_GIO)
})
afterEach(() => vi.useRealTimers())

type K = { tu: string; den: string } | null

function Khoang(props: { dau?: K; onDoi?: (v: K) => void; min?: string; max?: string; required?: boolean }) {
  const [v, setV] = useState<K>(props.dau ?? null)
  return (
    <>
      <label htmlFor="khoang">Khoảng ngày</label>
      <DateRangePicker
        id="khoang"
        value={v}
        min={props.min}
        max={props.max}
        required={props.required}
        onValueChange={(x) => {
          setV(x)
          props.onDoi?.(x)
        }}
      />
    </>
  )
}

// Tên đọc = nhãn + khoảng đang chọn — khớp đầu nhãn.
const trigger = () => screen.getByRole('button', { name: /^Khoảng ngày( |$)/ })
const o = (ten: RegExp) => screen.getByRole('button', { name: ten })
const nut = (ten: string) => screen.getByRole('button', { name: ten }) as HTMLButtonElement
const tieuDe = () => screen.getByRole('dialog', { name: 'Chọn khoảng ngày' }).querySelector('[aria-live]')?.textContent

test('file chạy đúng giờ VN (+07:00), giờ giả 00:30 ngày 20/11', () => {
  expect(new Date().getTimezoneOffset()).toBe(-420)
  expect(new Date().getDate()).toBe(20)
})

test('bấm 01 rồi 18 → "18 ngày"; Áp dụng → {2026-11-01, 2026-11-18}, đóng, focus trigger, trigger hiện khoảng', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Khoang onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  const pop = await screen.findByRole('dialog', { name: 'Chọn khoảng ngày' })
  expect(pop.closest('[data-ds="v2"]')).not.toBeNull()
  // 2 tháng: tháng trái 10, tháng phải 11 (chứa hôm nay)
  expect(screen.getByText('Tháng 10, 2026')).toBeTruthy()
  expect(screen.getByText('Tháng 11, 2026')).toBeTruthy()
  expect(tieuDe()).toBe('Chọn ngày bắt đầu')
  await user.click(o(/^01\/11\/2026/))
  expect(tieuDe()).toBe('Chọn ngày kết thúc')
  expect(nut('Áp dụng').disabled).toBe(true)
  await user.click(o(/^18\/11\/2026/))
  expect(tieuDe()).toBe('18 ngày')
  expect(pop.textContent).toContain('01/11/2026 – 18/11/2026')
  expect(onDoi).not.toHaveBeenCalled()
  await user.click(nut('Áp dụng'))
  expect(onDoi).toHaveBeenLastCalledWith({ tu: '2026-11-01', den: '2026-11-18' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
  expect(trigger().textContent).toContain('01/11/2026 – 18/11/2026')
})

test('dải: đầu/cuối data-range-start/end + chọn; giữa data-range-middle, không tô đặc', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang dau={{ tu: '2026-11-01', den: '2026-11-18' }} />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  const dau = o(/^01\/11\/2026/)
  const giua = o(/^10\/11\/2026/)
  const cuoi = o(/^18\/11\/2026/)
  expect(dau.hasAttribute('data-range-start') && dau.hasAttribute('data-selected')).toBe(true)
  expect(cuoi.hasAttribute('data-range-end') && cuoi.hasAttribute('data-selected')).toBe(true)
  expect(giua.hasAttribute('data-range-middle')).toBe(true)
  expect(giua.hasAttribute('data-selected')).toBe(false)
  expect(o(/^19\/11\/2026/).hasAttribute('data-range-middle')).toBe(false)
})

test('bấm 18 rồi 05 → ngày đầu thành 05 (chưa có ngày cuối)', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  await user.click(o(/^18\/11\/2026/))
  await user.click(o(/^05\/11\/2026/))
  expect(tieuDe()).toBe('Chọn ngày kết thúc')
  expect(screen.getByRole('button', { name: /^Từ ngày/ }).textContent).toContain('05/11/2026')
  expect(screen.getByRole('button', { name: /^Từ ngày/ }).getAttribute('aria-pressed')).toBe('false')
  expect(screen.getByRole('button', { name: /^Đến ngày/ }).getAttribute('aria-pressed')).toBe('true')
  expect(o(/^05\/11\/2026/).hasAttribute('data-selected')).toBe(true)
  expect(o(/^18\/11\/2026/).hasAttribute('data-selected')).toBe(false)
})

test('rê sau ngày đầu → xem trước dải tới ô đang rê (ô rê data-preview, không tô đặc)', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  await user.click(o(/^05\/11\/2026/))
  fireEvent.mouseEnter(o(/^09\/11\/2026/))
  expect(o(/^09\/11\/2026/).hasAttribute('data-preview')).toBe(true)
  expect(o(/^09\/11\/2026/).hasAttribute('data-selected')).toBe(false)
  expect(o(/^07\/11\/2026/).hasAttribute('data-range-middle')).toBe(true)
  expect(o(/^05\/11\/2026/).hasAttribute('data-range-start')).toBe(true)
  // rê TRƯỚC ngày đầu → không xem trước
  fireEvent.mouseEnter(o(/^03\/11\/2026/))
  expect(o(/^03\/11\/2026/).hasAttribute('data-preview')).toBe(false)
  expect(o(/^05\/11\/2026/).hasAttribute('data-range-start')).toBe(false)
})

test('Huỷ / Esc → không gọi onValueChange, mở lại thấy giá trị cũ', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Khoang dau={{ tu: '2026-11-01', den: '2026-11-18' }} onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  await user.click(o(/^05\/11\/2026/))
  await user.click(nut('Huỷ'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
  await user.click(trigger())
  await screen.findByRole('dialog')
  expect(tieuDe()).toBe('18 ngày')
  await user.click(o(/^07\/11\/2026/))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
  await user.click(trigger())
  await screen.findByRole('dialog')
  expect(tieuDe()).toBe('18 ngày')
  expect(onDoi).not.toHaveBeenCalled()
  expect(trigger().textContent).toContain('01/11/2026 – 18/11/2026')
})

test('mốc "Tuần này" (hôm nay T6 20/11) → {2026-11-16, 2026-11-20}, mốc được đánh dấu', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Khoang onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  const tuan = nut('Tuần này')
  expect(tuan.getAttribute('aria-pressed')).toBe('false')
  await user.click(tuan)
  expect(tuan.getAttribute('aria-pressed')).toBe('true')
  expect(nut('Hôm nay').getAttribute('aria-pressed')).toBe('false')
  expect(tieuDe()).toBe('5 ngày')
  await user.click(nut('Áp dụng'))
  expect(onDoi).toHaveBeenLastCalledWith({ tu: '2026-11-16', den: '2026-11-20' })
})

test('ô Từ ngày = chọn lại từ đầu; ô Đến ngày = giữ ngày đầu, chọn lại ngày cuối; Xoá ngày + Áp dụng → null', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Khoang dau={{ tu: '2026-11-01', den: '2026-11-18' }} onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  const den = screen.getByRole('button', { name: /^Đến ngày/ })
  await user.click(den)
  expect(tieuDe()).toBe('Chọn ngày kết thúc')
  expect(den.getAttribute('aria-pressed')).toBe('true')
  expect(nut('Áp dụng').disabled).toBe(true)
  await user.click(screen.getByRole('button', { name: /^Từ ngày/ }))
  expect(tieuDe()).toBe('Chọn ngày bắt đầu')
  await user.click(o(/^02\/11\/2026/))
  await user.click(o(/^03\/11\/2026/))
  expect(tieuDe()).toBe('2 ngày')
  await user.click(nut('Xoá ngày'))
  expect(tieuDe()).toBe('Chọn ngày bắt đầu')
  await user.click(nut('Áp dụng'))
  expect(onDoi).toHaveBeenLastCalledWith(null)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(trigger().textContent).toContain('Chọn khoảng ngày')
})

test('chưa có giá trị: Áp dụng tắt; mở bằng phím → focus hôm nay', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang />
    </DsRoot>,
  )
  expect(trigger().getAttribute('aria-haspopup')).toBe('dialog')
  expect(trigger().hasAttribute('data-placeholder')).toBe(true)
  trigger().focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('dialog')
  expect(nut('Áp dụng').disabled).toBe(true)
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^20\/11\/2026, hôm nay/))
})

test('trong Dialog: Esc lần 1 chỉ đóng bảng (Dialog còn), focus về trigger; lần 2 mới đóng Dialog', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Lọc đơn</DialogTitle>
          <Khoang />
        </DialogContent>
      </Dialog>
    </DsRoot>,
  )
  const t = await screen.findByRole('button', { name: 'Khoảng ngày' }) // chưa chọn → chỉ nhãn
  await user.click(t)
  await screen.findByRole('dialog', { name: 'Chọn khoảng ngày' })
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chọn khoảng ngày' })).toBeNull())
  expect(screen.getByRole('dialog', { name: 'Lọc đơn' })).toBeTruthy()
  expect(document.activeElement).toBe(t)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('nhãn ô ngày đọc vai trong khoảng: ngày bắt đầu / trong khoảng đã chọn / ngày kết thúc', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang dau={{ tu: '2026-11-01', den: '2026-11-18' }} />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  expect(o(/^01\/11\/2026/).getAttribute('aria-label')).toBe('01/11/2026, ngày bắt đầu')
  expect(o(/^10\/11\/2026/).getAttribute('aria-label')).toBe('10/11/2026, trong khoảng đã chọn')
  expect(o(/^18\/11\/2026/).getAttribute('aria-label')).toBe('18/11/2026, ngày kết thúc')
  expect(o(/^20\/11\/2026/).getAttribute('aria-label')).toBe('20/11/2026, hôm nay')
})

test('min/max: tháng mở kẹp trong khoảng (không lùi qua tháng của min), ngày ngoài khoảng chặn, mốc ngoài khoảng tắt', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Khoang min="2026-11-10" max="2027-02-10" />
    </DsRoot>,
  )
  await user.click(trigger())
  await screen.findByRole('dialog')
  // hôm nay 20/11 → tháng phải 11, tháng trái 10 — nhưng min 10/11 → lịch bắt đầu từ tháng 11
  expect(screen.queryByText('Tháng 10, 2026')).toBeNull()
  expect(screen.getByText('Tháng 11, 2026')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Tháng trước' }).getAttribute('aria-disabled')).toBe('true')
  const chan = o(/^09\/11\/2026/) as HTMLButtonElement
  expect(chan.disabled || chan.getAttribute('aria-disabled') === 'true').toBe(true)
  expect(nut('Tháng này').disabled).toBe(true)
  expect(nut('Tuần này').disabled).toBe(false)
})

test('required → aria-required trên trigger', () => {
  render(
    <DsRoot>
      <Khoang required />
    </DsRoot>,
  )
  expect(trigger().getAttribute('aria-required')).toBe('true')
})
