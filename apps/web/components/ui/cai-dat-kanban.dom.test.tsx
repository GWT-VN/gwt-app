// @vitest-environment jsdom
// ⚙ ở dạng Kanban (học Twenty): "Nhóm theo" bắt buộc (không có "Không nhóm") + trang "Nhóm đang ẩn" để hiện lại nhóm.
import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { CaiDatHienThi } from './data-view-toolbar'
import { DsRoot } from './ds-root'

const NHOM = [
  { giaTri: 'khau', nhan: 'Khâu' },
  { giaTri: 'tt', nhan: 'Trạng thái' },
]

function Man({ dangXem = 'kanban' as const }: { dangXem?: 'kanban' | 'bang' }) {
  const [nhom, setNhom] = useState('khau')
  const [an, setAn] = useState(['moi', 'xong'])
  const ten: Record<string, string> = { moi: 'Mới', xong: 'Xong' }
  return (
    <DsRoot>
      <CaiDatHienThi
        dangXem={dangXem}
        onDoiXem={() => {}}
        nhom={{ tuyChon: NHOM, giaTri: nhom, onDoi: setNhom, kanban: true }}
        nhomAn={{ ds: an.map((x) => ({ giaTri: x, nhan: ten[x] })), onHien: (x) => setAn((a) => a.filter((y) => y !== x)) }}
      />
      <output aria-label="nhóm">{nhom}</output>
    </DsRoot>
  )
}

const mo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Cài đặt hiển thị' }))
  return screen.findByRole('dialog', { name: 'Cài đặt hiển thị' })
}

test('Kanban: "Nhóm theo" có ở trang gốc, KHÔNG có "Không nhóm"; chọn → đổi nhóm, về gốc', async () => {
  const user = userEvent.setup()
  render(<Man />)
  const pop = await mo(user)
  await user.click(within(pop).getByRole('button', { name: /Nhóm theo/ }))
  expect(within(pop).queryByRole('button', { name: 'Không nhóm' })).toBeNull()
  await user.click(within(pop).getByRole('button', { name: 'Trạng thái' }))
  expect(screen.getByRole('status', { name: 'nhóm' }).textContent).toBe('tt')
  await waitFor(() => expect(within(pop).queryByRole('button', { name: 'Quay lại' })).toBeNull())
})

test('nhóm Kanban không hiện ở dạng Bảng', async () => {
  const user = userEvent.setup()
  render(<Man dangXem="bang" />)
  const pop = await mo(user)
  expect(within(pop).queryByRole('button', { name: /Nhóm theo/ })).toBeNull()
  expect(within(pop).queryByRole('button', { name: /Nhóm đang ẩn/ })).toBeNull()
})

test('Nhóm đang ẩn: liệt kê + số; nút mắt "Hiện <nhóm>" bỏ ẩn, focus sang mục còn lại; hết → về gốc', async () => {
  const user = userEvent.setup()
  render(<Man />)
  const pop = await mo(user)
  const muc = within(pop).getByRole('button', { name: /Nhóm đang ẩn/ })
  expect(muc.textContent).toContain('2')
  await user.click(muc)
  await user.click(await within(pop).findByRole('button', { name: 'Hiện Mới' }))
  expect(within(pop).queryByRole('button', { name: 'Hiện Mới' })).toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(within(pop).getByRole('button', { name: 'Hiện Xong' })))
  await user.click(within(pop).getByRole('button', { name: 'Hiện Xong' }))
  // Hết nhóm ẩn → về trang gốc, mục "Nhóm đang ẩn" biến mất, focus không rơi về body.
  await waitFor(() => expect(within(pop).queryByRole('button', { name: 'Quay lại' })).toBeNull())
  expect(within(pop).queryByRole('button', { name: /Nhóm đang ẩn/ })).toBeNull()
  await waitFor(() => expect(pop.contains(document.activeElement)).toBe(true))
})
