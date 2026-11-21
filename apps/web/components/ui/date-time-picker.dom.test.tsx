// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DateTimePicker } from './date-time-picker'
import { DsRoot } from './ds-root'

// Giờ VN cho cả file (mẫu date-picker.dom.test.tsx): đặt trước mọi import.
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
afterEach(() => vi.useRealTimers())

function Han({ dau = null, onDoi }: { dau?: string | null; onDoi?: (v: string | null) => void }) {
  const [v, setV] = useState<string | null>(dau)
  return (
    <>
      <label htmlFor="han">Hạn</label>
      <DateTimePicker
        id="han"
        value={v}
        onValueChange={(x) => {
          setV(x)
          onDoi?.(x)
        }}
      />
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: /^Hạn( |$)/ })
const pop = () => screen.findByRole('dialog', { name: 'Chọn ngày giờ' })
const oNgay = () => screen.getByRole('textbox', { name: 'Ngày' }) as HTMLInputElement
const oGio = () => screen.getByRole('combobox', { name: 'Giờ' }) as HTMLInputElement
const ngay = (re: RegExp) => screen.getByRole('button', { name: re }) as HTMLButtonElement
const nut = (ten: string) => screen.getByRole('button', { name: ten }) as HTMLButtonElement

function dung(dau?: string | null) {
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Han dau={dau} onDoi={onDoi} />
    </DsRoot>,
  )
  return onDoi
}

test('chọn ngày ở lịch CHƯA lưu; Xong → lưu với giờ mặc định 17:30, đóng pop', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  await user.click(ngay(/^25\/11\/2026/))
  expect(onDoi).not.toHaveBeenCalled()
  expect(oNgay().value).toBe('25/11/2026')
  await user.click(nut('Xong'))
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-25T17:30:00+07:00')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(trigger().textContent).toContain('25/11/2026 · 17:30')
})

test('chọn ngày rồi Esc → không lưu; mở lại thấy giá trị thật, không thấy nháp', async () => {
  const user = userEvent.setup()
  const onDoi = dung('2026-11-22T09:00:00+07:00')
  await user.click(trigger())
  await pop()
  await user.click(ngay(/^25\/11\/2026/))
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onDoi).not.toHaveBeenCalled()
  await user.click(trigger())
  await pop()
  expect(oNgay().value).toBe('22/11/2026')
  expect(oGio().value).toBe('09:00')
})

test('bấm ra ngoài → bỏ nháp', async () => {
  const user = userEvent.setup()
  const onDoi = vi.fn()
  render(
    <DsRoot>
      <Han onDoi={onDoi} />
      <button type="button">ngoài</button>
    </DsRoot>,
  )
  await user.click(trigger())
  await pop()
  await user.click(ngay(/^25\/11\/2026/))
  await user.click(screen.getByRole('button', { name: 'ngoài' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onDoi).not.toHaveBeenCalled()
})

test('Huỷ → không lưu, đóng pop', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  await user.click(ngay(/^25\/11\/2026/))
  await user.click(nut('Huỷ'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(onDoi).not.toHaveBeenCalled()
})

test('gõ 31/02 → ô ngày lỗi, Xong tắt; Enter không lưu', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  await user.click(oNgay())
  await user.keyboard('31/02{Enter}')
  expect(oNgay().getAttribute('aria-invalid')).toBe('true')
  expect(nut('Xong').disabled).toBe(true)
  expect(onDoi).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeTruthy()
})

test('gõ 26/11, Tab, 1430, Enter → lưu 2026-11-26T14:30:00+07:00, đóng pop', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  // Mở pop là đang ở ô ngày.
  await waitFor(() => expect(document.activeElement).toBe(oNgay()))
  await user.keyboard('26/11{Tab}1430{Enter}')
  expect(onDoi).toHaveBeenCalledTimes(1)
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-26T14:30:00+07:00')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

test('gõ ngày đồng bộ lịch: 05/12 → lịch sang tháng 12, ô 05/12 đang chọn', async () => {
  const user = userEvent.setup()
  dung()
  await user.click(trigger())
  await pop()
  await user.click(oNgay())
  await user.keyboard('05/12')
  expect(screen.getByText('Tháng 12, 2026')).toBeTruthy()
  expect(ngay(/^05\/12\/2026, đã chọn/)).toBeTruthy()
})

test('Enter ở ô ngày = Xong', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  await user.click(oNgay())
  await user.keyboard('27/11/2026{Enter}')
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-27T17:30:00+07:00')
})

test('chỉ đổi giờ, ô ngày trống → lấy hôm nay', async () => {
  const user = userEvent.setup()
  const onDoi = dung()
  await user.click(trigger())
  await pop()
  await user.click(oGio())
  await user.keyboard('1600{Enter}')
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-20T16:00:00+07:00')
})

test('Xoá có hiệu lực ngay → null; chưa có giá trị thì không có nút Xoá', async () => {
  const user = userEvent.setup()
  const onDoi = dung('2026-11-22T09:00:00+07:00')
  await user.click(trigger())
  await pop()
  await user.click(nut('Xoá'))
  expect(onDoi).toHaveBeenLastCalledWith(null)
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await user.click(trigger())
  await pop()
  expect(screen.queryByRole('button', { name: 'Xoá' })).toBeNull()
})

test('ngày đã qua bị tắt; ngày của hạn đang có (đã qua) vẫn chọn được', async () => {
  const user = userEvent.setup()
  const onDoi = dung('2026-11-18T09:00:00+07:00')
  await user.click(trigger())
  await pop()
  const qua = ngay(/^19\/11\/2026/)
  expect(qua.disabled || qua.getAttribute('aria-disabled') === 'true').toBe(true)
  expect(ngay(/^18\/11\/2026/).disabled).toBe(false)
  await user.click(ngay(/^25\/11\/2026/))
  await user.click(ngay(/^18\/11\/2026/))
  await user.click(nut('Xong'))
  expect(onDoi).toHaveBeenLastCalledWith('2026-11-18T09:00:00+07:00')
})

test('gõ ngày đã qua → lỗi (trừ ngày của hạn đang có)', async () => {
  const user = userEvent.setup()
  dung()
  await user.click(trigger())
  await pop()
  await user.click(oNgay())
  await user.keyboard('19/11/2026')
  expect(nut('Xong').disabled).toBe(true)
})

test('ô giờ trống hiện giờ mặc định làm placeholder (R13), đổi được qua prop', async () => {
  const user = userEvent.setup()
  render(
    <DsRoot>
      <DateTimePicker aria-label="Hạn" value={null} onValueChange={() => {}} gioMacDinh="08:00" />
    </DsRoot>,
  )
  await user.click(screen.getByRole('button', { name: 'Hạn' }))
  await pop()
  expect(oGio().placeholder).toBe('08:00')
})

test('open điều khiển từ ngoài → pop mở không cần bấm trigger; đóng báo onOpenChange(false)', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <DsRoot>
      <DateTimePicker aria-label="Hạn" value="2026-11-22T09:00:00+07:00" onValueChange={() => {}} open onOpenChange={onOpenChange} />
    </DsRoot>,
  )
  await pop()
  expect(oNgay().value).toBe('22/11/2026')
  await user.click(nut('Huỷ'))
  expect(onOpenChange).toHaveBeenLastCalledWith(false)
})

test('giá trị UTC từ DB (…Z) hiện theo giờ VN', () => {
  render(
    <DsRoot>
      <DateTimePicker aria-label="Hạn" value="2026-11-25T07:30:00Z" onValueChange={() => {}} />
    </DsRoot>,
  )
  expect(screen.getByRole('button', { name: /^Hạn/ }).textContent).toContain('25/11/2026 · 14:30')
})

test('gon: ô trong bảng hiện "dd/mm HH:mm", trống hiện placeholder', () => {
  render(
    <DsRoot>
      <DateTimePicker gon aria-label="Hạn A" value="2026-11-25T14:30:00+07:00" onValueChange={() => {}} />
      <DateTimePicker gon aria-label="Hạn B" value={null} onValueChange={() => {}} placeholder="Đặt hạn" />
    </DsRoot>,
  )
  expect(screen.getByRole('button', { name: /^Hạn A/ }).textContent).toBe('25/11 14:30')
  expect(screen.getByRole('button', { name: 'Hạn B' }).textContent).toBe('Đặt hạn')
})
