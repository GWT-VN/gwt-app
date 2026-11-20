// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { MucChon } from './OChonGoiY'
import { useTimXa } from './useTimXa'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const muc = (nhan: string): MucChon => ({ gt: nhan, nhan })

test('1 ký tự → thieuKyTu, không gọi tim (kể cả sau 250ms)', async () => {
  const tim = vi.fn(async () => [muc('x')])
  const { result } = renderHook(() => useTimXa(tim, 'n'))
  await act(async () => { await vi.advanceTimersByTimeAsync(500) })
  expect(result.current).toEqual({ ds: [], dangTim: false, loi: null, thieuKyTu: true })
  expect(tim).not.toHaveBeenCalled()
})

test('đủ ký tự: dangTim ngay, chờ 250ms im phím mới gọi tim (đã trim), về thì có ds', async () => {
  const tim = vi.fn(async (q: string) => [muc(q + '-1')])
  const { result } = renderHook(() => useTimXa(tim, ' ngu '))
  expect(result.current.dangTim).toBe(true)
  expect(result.current.thieuKyTu).toBe(false)
  await act(async () => { await vi.advanceTimersByTimeAsync(249) })
  expect(tim).not.toHaveBeenCalled()
  await act(async () => { await vi.advanceTimersByTimeAsync(1) })
  expect(tim).toHaveBeenCalledWith('ngu')
  expect(result.current).toEqual({ ds: [muc('ngu-1')], dangTim: false, loi: null, thieuKyTu: false })
})

test('gõ "ngu" rồi "nguyen", kết quả "ngu" về SAU → chỉ thấy kết quả "nguyen"', async () => {
  const cho: Record<string, (v: MucChon[]) => void> = {}
  const tim = vi.fn((q: string) => new Promise<MucChon[]>((xong) => { cho[q] = xong }))
  const { result, rerender } = renderHook(({ q }) => useTimXa(tim, q), { initialProps: { q: 'ngu' } })
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  rerender({ q: 'nguyen' })
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  expect(tim.mock.calls.map((c) => c[0])).toEqual(['ngu', 'nguyen'])
  await act(async () => { cho.nguyen([muc('Nguyễn Văn A')]) })
  await act(async () => { cho.ngu([muc('Ngũ Hành Sơn')]) })
  expect(result.current.ds).toEqual([muc('Nguyễn Văn A')])
  expect(result.current.dangTim).toBe(false)
})

test('tim ném lỗi → loi = câu lỗi, ds rỗng', async () => {
  const tim = vi.fn(async () => { throw new Error('Mất kết nối') })
  const { result } = renderHook(() => useTimXa(tim, 'nguyen'))
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  expect(result.current).toEqual({ ds: [], dangTim: false, loi: 'Mất kết nối', thieuKyTu: false })
})

test('xoá xuống dưới 2 ký tự trong lúc câu trả lời đang bay → câu trả lời về muộn bị bỏ (ds rỗng, không lỗi)', async () => {
  let xong: (v: MucChon[]) => void = () => {}
  let hong: (e: Error) => void = () => {}
  const tim = vi.fn(() => new Promise<MucChon[]>((ok, ko) => { xong = ok; hong = ko }))
  const { result, rerender } = renderHook(({ q }) => useTimXa(tim, q), { initialProps: { q: 'ngu' } })
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  expect(tim).toHaveBeenCalledTimes(1)
  rerender({ q: 'n' })
  await act(async () => { xong([muc('Ngũ Hành Sơn')]) })
  expect(result.current).toEqual({ ds: [], dangTim: false, loi: null, thieuKyTu: true })
  // Lỗi về muộn cũng bỏ.
  rerender({ q: 'ngu' })
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  rerender({ q: '' })
  await act(async () => { hong(new Error('Mất kết nối')) })
  expect(result.current).toEqual({ ds: [], dangTim: false, loi: null, thieuKyTu: true })
})
