// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DatePicker } from './date-picker'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { DsRoot } from './ds-root'

// Giờ VN cho CẢ file (Review Focus #2): đặt trước mọi import (vi.hoisted) — Node đổi múi giờ ngay khi gán
// process.env.TZ. Test đầu tiên chứng minh đang chạy +07:00, kể cả khi máy/CI chạy UTC (`TZ=UTC npx vitest run …`).
const tzCu = vi.hoisted(() => {
  const cu = process.env.TZ
  process.env.TZ = 'Asia/Ho_Chi_Minh'
  return cu
})
afterAll(() => {
  if (tzCu === undefined) delete process.env.TZ
  else process.env.TZ = tzCu
})

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

// 00:30 sáng 20/11 giờ VN = 17:30 ngày 19/11 UTC — giờ sớm là chỗ toISOString() ra hôm trước.
const BAY_GIO = new Date('2026-11-20T00:30:00+07:00')
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(BAY_GIO)
})
afterEach(() => vi.useRealTimers())

function NgayGiao(props: { dau?: string | null; min?: string; onDoi?: (v: string | null) => void; invalid?: boolean }) {
  const [v, setV] = useState<string | null>(props.dau ?? null)
  return (
    <>
      <label htmlFor="ngay-giao">Ngày giao</label>
      <DatePicker
        id="ngay-giao"
        value={v}
        min={props.min}
        aria-invalid={props.invalid}
        onValueChange={(x) => {
          setV(x)
          props.onDoi?.(x)
        }}
      />
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Ngày giao' })
const o = (ten: RegExp) => screen.getByRole('button', { name: ten })

test('file chạy đúng giờ VN (+07:00) và giờ giả 00:30 ngày 20/11', () => {
  expect(new Date().getTimezoneOffset()).toBe(-420)
  expect(new Date().getDate()).toBe(20)
  expect(new Date().getHours()).toBe(0)
})

test('"Hôm nay" lúc 00:30 giờ VN → 2026-11-20 (không lệch về 19 như toISOString), đóng pop, focus về trigger', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  await user.click(await screen.findByRole('button', { name: 'Hôm nay' }))
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-20')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
  expect(trigger().textContent).toContain('20/11/2026')
})

test('bấm ô 18 → "2026-11-18"; pop là dialog có nhãn trong vùng DS, lịch tháng 11 tuần bắt đầu T2', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  const pop = await screen.findByRole('dialog', { name: 'Chọn ngày' })
  expect(pop.closest('[data-ds="v2"]')).not.toBeNull()
  expect(screen.getByText('Tháng 11, 2026')).toBeTruthy()
  expect(screen.getAllByRole('columnheader', { hidden: true }).map((th) => th.textContent)).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'])
  // không hiện ngày tháng khác (1/11/2026 là CN → 6 ô trống đầu tuần)
  expect(screen.queryByRole('button', { name: /^31\/10\/2026/ })).toBeNull()
  expect(o(/^20\/11\/2026, hôm nay/)).toBeTruthy()
  await user.click(o(/^18\/11\/2026/))
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-18')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
})

test('ngày trước min bị chặn (disabled), bấm không gọi; ngày từ min chọn được', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao min="2026-11-10" onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  const chan = o(/^05\/11\/2026/) as HTMLButtonElement
  expect(chan.disabled || chan.getAttribute('aria-disabled') === 'true').toBe(true)
  await user.click(chan)
  expect(onDoi).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeTruthy()
  expect((o(/^10\/11\/2026/) as HTMLButtonElement).disabled).toBe(false)
})

test('bàn phím: mở → focus ô đang chọn; → +1 ngày; PageDown +1 tháng; Enter chọn, đóng, focus trigger', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao dau="2026-11-18" onDoi={onDoi} />
    </DsRoot>,
  )
  trigger().focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('dialog')
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^18\/11\/2026/))
  await user.keyboard('{ArrowRight}')
  expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^19\/11\/2026/)
  await user.keyboard('{PageDown}')
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^19\/12\/2026/))
  expect(screen.getByText('Tháng 12, 2026')).toBeTruthy()
  await user.keyboard('{Enter}')
  expect(onDoi).toHaveBeenLastCalledWith('2026-12-19')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
})

test('chưa có giá trị: mở bằng phím → focus hôm nay; Esc đóng, focus trigger, không đổi giá trị', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao onDoi={onDoi} />
    </DsRoot>,
  )
  trigger().focus()
  await user.keyboard('{Enter}')
  await screen.findByRole('dialog')
  await waitFor(() => expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^20\/11\/2026, hôm nay/))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(trigger())
  expect(onDoi).not.toHaveBeenCalled()
})

test('trigger: aria-haspopup dialog, chưa chọn → data-placeholder + "Chọn ngày"; có giá trị → dd/MM/yyyy; aria-invalid giữ', () => {
  render(
    <DsRoot>
      <NgayGiao invalid />
      <label htmlFor="ngay-2">Ngày 2</label>
      <DatePicker id="ngay-2" value="2026-01-05" onValueChange={() => {}} />
    </DsRoot>,
  )
  const t = trigger()
  expect(t.getAttribute('aria-haspopup')).toBe('dialog')
  expect(t.hasAttribute('data-placeholder')).toBe(true)
  expect(t.textContent).toContain('Chọn ngày')
  expect(t.getAttribute('aria-invalid')).toBe('true')
  const t2 = screen.getByRole('button', { name: 'Ngày 2' })
  expect(t2.hasAttribute('data-placeholder')).toBe(false)
  expect(t2.textContent).toContain('05/01/2026')
})

test('"Xoá ngày" chỉ hiện khi có giá trị → onValueChange(null)', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <NgayGiao dau="2026-11-18" onDoi={onDoi} />
    </DsRoot>,
  )
  await user.click(trigger())
  await user.click(await screen.findByRole('button', { name: 'Xoá ngày' }))
  expect(onDoi).toHaveBeenLastCalledWith(null)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await user.click(trigger())
  await screen.findByRole('dialog')
  expect(screen.queryByRole('button', { name: 'Xoá ngày' })).toBeNull()
})

test('mở bằng chuột → tắt vòng focus trong pop tới phím đầu tiên; mở bằng phím → có vòng', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <NgayGiao dau="2026-11-18" />
    </DsRoot>,
  )
  const tatVong = () => screen.getByRole('dialog').hasAttribute('data-mo-chuot')
  await user.click(trigger())
  await screen.findByRole('dialog')
  expect(tatVong()).toBe(true)
  await user.keyboard('{ArrowRight}')
  expect(tatVong()).toBe(false)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await user.keyboard('{Enter}')
  await screen.findByRole('dialog')
  expect(tatVong()).toBe(false)
})

test('DatePicker trong Dialog: Esc lần 1 chỉ đóng lịch (Dialog còn), focus về trigger; lần 2 mới đóng Dialog', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Hẹn giao</DialogTitle>
          <NgayGiao />
        </DialogContent>
      </Dialog>
    </DsRoot>,
  )
  const nut = await screen.findByRole('button', { name: 'Ngày giao' })
  await user.click(nut)
  await screen.findByRole('dialog', { name: 'Chọn ngày' })
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Chọn ngày' })).toBeNull())
  expect(screen.getByRole('dialog', { name: 'Hẹn giao' })).toBeTruthy()
  expect(document.activeElement).toBe(nut)
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})
