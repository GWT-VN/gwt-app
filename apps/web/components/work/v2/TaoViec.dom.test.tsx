// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const m = vi.hoisted(() => ({ refresh: vi.fn(), taoViec: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: m.refresh }) }))
vi.mock('@/app/work/actions', () => ({ taoViec: m.taoViec }))

import type { NenTang } from '@/app/work/actions'
import { Button } from '@/components/ui/button'
import { DsRoot } from '@/components/ui/ds-root'
import { thongBao } from '@/components/ui/sonner'
import { TaoViec } from './TaoViec'

const NEN: NenTang = {
  me: { id: 'u0', ten: 'Demo Tôi', email: 'demo.toi@example.test', vai_tro: [] },
  teams: [{ id: 7, key: 'demo', name: 'Team Demo', color: null }],
  nhan_su: [
    { id: 'u1', ten: 'Demo An', email: 'demo.an@example.test' },
    { id: 'u2', ten: 'Demo Bình', email: 'demo.binh@example.test' },
  ],
  projects: [],
}

function Mau({ onXong }: { onXong?: (kq: { id: number; ref: string }) => void }) {
  return (
    <DsRoot>
      <TaoViec nenTang={NEN} trigger={<Button>Mở tạo việc</Button>} onXong={onXong} />
    </DsRoot>
  )
}

beforeEach(() => {
  m.refresh.mockReset()
  m.taoViec.mockReset()
})
afterEach(() => thongBao.dong())

const mo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Mở tạo việc' }))
  return screen.findByRole('dialog', { name: 'Tạo việc' })
}

test('mở → focus ô tiêu đề; Enter không tiêu đề → báo lỗi nối aria-describedby, không gọi server', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await mo(user)
  const o = screen.getByRole('textbox', { name: 'Tiêu đề' })
  await waitFor(() => expect(document.activeElement).toBe(o))
  await user.keyboard('{Enter}')
  expect(o.getAttribute('aria-invalid')).toBe('true')
  expect(document.getElementById(o.getAttribute('aria-describedby')!)?.textContent).toBe('Nhập tiêu đề việc để tạo.')
  expect(m.taoViec).not.toHaveBeenCalled()
})

test('Enter ở tiêu đề → tạo; không chọn ai → assignees rỗng; xong thì đóng hộp, refresh, onXong', async () => {
  m.taoViec.mockResolvedValue({ ok: true, duLieu: { id: 5, ref: 'VIEC-5' } })
  const onXong = vi.fn()
  const user = userEvent.setup()
  render(<Mau onXong={onXong} />)
  await mo(user)
  await user.type(screen.getByRole('textbox', { name: 'Tiêu đề' }), '  Gọi khách Demo  {Enter}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(m.taoViec).toHaveBeenCalledWith({
    title: 'Gọi khách Demo',
    description: null,
    priority: 3,
    due: null,
    team_id: null,
    assignees: [],
  })
  expect(onXong).toHaveBeenCalledWith({ id: 5, ref: 'VIEC-5' })
  expect(m.refresh).toHaveBeenCalled()
})

test('thêm người: người đầu = Chính, người sau = Làm cùng; đổi vai qua menu', async () => {
  m.taoViec.mockResolvedValue({ ok: true, duLieu: { id: 6, ref: 'VIEC-6' } })
  const user = userEvent.setup()
  render(<Mau />)
  await mo(user)
  await user.type(screen.getByRole('textbox', { name: 'Tiêu đề' }), 'Việc Demo')
  for (const ten of ['Demo An', 'Demo Bình']) {
    await user.click(screen.getByRole('button', { name: 'Thêm người' }))
    await user.click(await screen.findByRole('option', { name: new RegExp(ten) }))
  }
  await user.click(screen.getByRole('button', { name: 'Vai của Demo Bình: Làm cùng — đổi vai' }))
  await user.click(await screen.findByRole('menuitemradio', { name: 'Duyệt' }))
  await user.click(screen.getByRole('button', { name: 'Tạo việc' }))
  await waitFor(() => expect(m.taoViec).toHaveBeenCalled())
  expect(m.taoViec.mock.calls[0][0].assignees).toEqual([
    { staff_id: 'u1', role: 'owner' },
    { staff_id: 'u2', role: 'reviewer' },
  ])
})

test('server lỗi → Alert trong hộp, giữ chữ đã gõ', async () => {
  m.taoViec.mockResolvedValue({ ok: false, loi: 'Mất kết nối' })
  const user = userEvent.setup()
  render(<Mau />)
  await mo(user)
  await user.type(screen.getByRole('textbox', { name: 'Tiêu đề' }), 'Việc Demo{Enter}')
  expect((await screen.findByRole('alert')).textContent).toContain('Mất kết nối')
  expect((screen.getByRole('textbox', { name: 'Tiêu đề' }) as HTMLInputElement).value).toBe('Việc Demo')
  expect(screen.getByRole('dialog', { name: 'Tạo việc' })).toBeTruthy()
})

test('Esc khi đã gõ → hỏi bỏ; "Soạn tiếp" giữ hộp, "Bỏ việc" đóng. Esc khi trống → đóng ngay', async () => {
  const user = userEvent.setup()
  render(<Mau />)
  await mo(user)
  await user.type(screen.getByRole('textbox', { name: 'Tiêu đề' }), 'Nháp Demo')
  await user.keyboard('{Escape}')
  await screen.findByRole('alertdialog', { name: 'Bỏ việc đang soạn?' })
  await user.click(screen.getByRole('button', { name: 'Soạn tiếp' }))
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  expect((screen.getByRole('textbox', { name: 'Tiêu đề' }) as HTMLInputElement).value).toBe('Nháp Demo')

  await user.keyboard('{Escape}')
  await user.click(await screen.findByRole('button', { name: 'Bỏ việc' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

  await mo(user)
  expect((screen.getByRole('textbox', { name: 'Tiêu đề' }) as HTMLInputElement).value).toBe('')
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(screen.queryByRole('alertdialog')).toBeNull()
})
