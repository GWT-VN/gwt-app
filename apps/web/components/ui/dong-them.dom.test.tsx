// @vitest-environment jsdom
import { createRef } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DongThem, type DongThemRef } from './dong-them'

const o = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'Việc mới' })

test('bấm "+ Việc mới" → ô focus; Enter tạo (bỏ khoảng trắng), xong thì xoá ô và GIỮ mở, focus còn đó', async () => {
  const onTao = vi.fn().mockResolvedValue(true)
  const user = userEvent.setup()
  render(<DongThem nhan="Việc mới" onTao={onTao} />)
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  expect(document.activeElement).toBe(o())
  await user.type(o(), '  Gọi khách Demo  {Enter}')
  expect(onTao).toHaveBeenCalledWith('Gọi khách Demo')
  await waitFor(() => expect(o().value).toBe(''))
  expect(document.activeElement).toBe(o())
  // Enter khi ô trống: không gọi.
  await user.type(o(), '{Enter}')
  expect(onTao).toHaveBeenCalledTimes(1)
})

test('tạo hỏng (false hoặc ném) → giữ chữ để sửa', async () => {
  const onTao = vi.fn().mockResolvedValueOnce(false).mockRejectedValueOnce(new Error('mất mạng'))
  const user = userEvent.setup()
  render(<DongThem nhan="Việc mới" onTao={onTao} />)
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  await user.type(o(), 'Việc Demo{Enter}')
  await waitFor(() => expect(onTao).toHaveBeenCalledTimes(1))
  expect(o().value).toBe('Việc Demo')
  await user.type(o(), '{Enter}')
  await waitFor(() => expect(onTao).toHaveBeenCalledTimes(2))
  expect(o().value).toBe('Việc Demo')
})

test('đang gửi: Enter lặp không gọi lần hai', async () => {
  let xong!: (v: boolean) => void
  const onTao = vi.fn(() => new Promise<boolean>((r) => (xong = r)))
  const user = userEvent.setup()
  render(<DongThem nhan="Việc mới" onTao={onTao} />)
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  await user.type(o(), 'A{Enter}{Enter}')
  expect(onTao).toHaveBeenCalledTimes(1)
  await act(async () => xong(true))
  await waitFor(() => expect(o().value).toBe(''))
})

test('Esc đóng (bỏ chữ); rời ô khi trống cũng đóng, rời ô khi đã gõ thì giữ', async () => {
  const user = userEvent.setup()
  render(
    <>
      <DongThem nhan="Việc mới" onTao={vi.fn()} />
      <button type="button">ngoài</button>
    </>,
  )
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  await user.type(o(), 'nháp{Escape}')
  expect(screen.queryByRole('textbox')).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  await user.type(o(), 'nháp')
  await user.click(screen.getByRole('button', { name: 'ngoài' }))
  expect(o().value).toBe('nháp')
  await user.clear(o())
  await user.click(screen.getByRole('button', { name: 'ngoài' }))
  expect(screen.queryByRole('textbox')).toBeNull()
})

test('ref.mo() mở dòng (nút chính thanh công cụ)', async () => {
  const ref = createRef<DongThemRef>()
  render(<DongThem ref={ref} nhan="Việc mới" onTao={vi.fn()} />)
  act(() => ref.current!.mo())
  expect(document.activeElement).toBe(o())
})

test('ref.mo() khi dòng đã mở sẵn (còn chữ nháp, đã rời ô) → focus lại ô', async () => {
  const ref = createRef<DongThemRef>()
  const user = userEvent.setup()
  render(
    <>
      <DongThem ref={ref} nhan="Việc mới" onTao={vi.fn()} />
      <button type="button">ngoài</button>
    </>,
  )
  await user.click(screen.getByRole('button', { name: 'Việc mới' }))
  await user.type(o(), 'nháp')
  await user.click(screen.getByRole('button', { name: 'ngoài' }))
  act(() => ref.current!.mo())
  expect(document.activeElement).toBe(o())
  expect(o().value).toBe('nháp')
})

test('nhanDoc: tên đọc riêng cho nút + ô (nhiều dòng thêm trên một màn)', async () => {
  const user = userEvent.setup()
  render(<DongThem nhan="Việc mới" nhanDoc="Việc mới — Đang làm" onTao={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: 'Việc mới — Đang làm' }))
  expect(screen.getByRole('textbox', { name: 'Việc mới — Đang làm' })).toBeTruthy()
})
