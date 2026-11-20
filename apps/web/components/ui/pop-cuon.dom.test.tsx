// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import type { MucChon } from '@/bang'
import { Combobox } from './combobox'
import { DatePicker } from './date-picker'
import { DateRangePicker } from './date-range-picker'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { DsRoot } from './ds-root'
import { Popover, PopoverAnchor, PopoverContent } from './popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet'

vi.mock('next/font/google', () => ({
  Inter: (o: { variable: string }) => ({ variable: `gia-lap${o.variable}`, className: 'gia-lap-inter', style: {} }),
}))

const TINH: MucChon[] = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'].map((nhan, i) => ({ gt: String(i + 1).padStart(2, '0'), nhan }))

/**
 * Dialog/Sheet khoá cuộn trang bằng react-remove-scroll: wheel/touch ngoài nội dung hộp bị preventDefault. Pop (Combobox,
 * lịch) portal ra NGOÀI nội dung hộp nhưng vẫn cuộn được vì radix-ui (1.8.1: react-dialog 1.3.1) đăng ký mọi
 * DismissableLayer lồng trong hộp làm "branch" → shard của khoá cuộn (radix-ui/primitives#3423). Popover KHÔNG cần
 * `modal` (modal thêm bẫy focus + aria-hidden phần còn lại + nuốt cú bấm ngoài — đổi hành vi không cần thiết).
 * Đo thật 20/11 trên Chrome headless (CDP mouseWheel + dispatchTouchEvent, trang tạm Dialog/Sheet): danh sách Combobox
 * cuộn 0 → 200 (lăn) / 0 → 157 (vuốt) cả trong Dialog lẫn Sheet, bằng đối chứng ngoài hộp.
 * jsdom không cuộn thật: giả lập phần tử cuộn được (overflow auto, nội dung > khung) rồi xem wheel có bị preventDefault.
 * Ca đối chứng: pop đặt NGOÀI cây React của hộp (không phải layer lồng) → bị chặn — chứng minh test bắt được hỏng hóc.
 */
const POP: { ten: string; ve: ReactNode }[] = [
  { ten: 'Combobox', ve: <Combobox aria-label="Ô" options={TINH} value={null} onValueChange={() => {}} /> },
  { ten: 'DatePicker', ve: <DatePicker aria-label="Ô" value={null} onValueChange={() => {}} /> },
  { ten: 'DateRangePicker', ve: <DateRangePicker aria-label="Ô" value={null} onValueChange={() => {}} /> },
]

const HOP: { ten: string; boc(con: ReactNode): ReactNode }[] = [
  {
    ten: 'Dialog',
    boc: (con) => (
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Hộp</DialogTitle>
          {con}
        </DialogContent>
      </Dialog>
    ),
  },
  {
    ten: 'Sheet',
    boc: (con) => (
      <Sheet defaultOpen>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Ngăn</SheetTitle>
          </SheetHeader>
          {con}
        </SheetContent>
      </Sheet>
    ),
  },
]

/** Phần tử cuộn được giả: overflow auto, nội dung 1000 trong khung 300, đang ở đầu. */
function giaCuon(el: HTMLElement) {
  el.style.overflowY = 'auto'
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 300 })
  Object.defineProperty(el, 'scrollTop', { configurable: true, value: 0, writable: true })
}

describe.each(HOP)('trong $ten', ({ boc }) => {
  test.each(POP)('$ten: con lăn trong pop KHÔNG bị khoá cuộn của hộp chặn', async ({ ve }) => {
    const user = userEvent.setup()
    render(
      <DsRoot>
        <p data-sau-hop>trang</p>
        {boc(ve)}
      </DsRoot>,
    )
    await user.click(await screen.findByRole('button', { name: 'Ô' }))
    const pop = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("[data-radix-popper-content-wrapper] > *")
      if (!el) throw new Error('pop chưa mở')
      return el
    })
    giaCuon(pop)
    const trong = pop.querySelector<HTMLElement>('button, input') ?? pop
    // fireEvent trả false khi sự kiện bị preventDefault. Khoá cuộn của hộp đang chạy: trang sau hộp bị chặn.
    expect(fireEvent.wheel(document.querySelector('[data-sau-hop]')!, { deltaY: 100 })).toBe(false)
    expect(fireEvent.wheel(trong, { deltaY: 100 })).toBe(true)
  })

  test('đối chứng: pop NGOÀI cây React của hộp (không phải layer lồng) → khoá cuộn chặn', async () => {
    render(
      <DsRoot>
        {boc(<p>nội dung</p>)}
        <Popover open>
          <PopoverAnchor />
          <PopoverContent aria-label="Pop ngoài">
            <button type="button">mục</button>
          </PopoverContent>
        </Popover>
      </DsRoot>,
    )
    const pop = await screen.findByRole('dialog', { name: 'Pop ngoài', hidden: true }) // hộp modal aria-hidden phần ngoài
    giaCuon(pop)
    expect(fireEvent.wheel(pop.querySelector('button')!, { deltaY: 100 })).toBe(false)
  })
})
