// @vitest-environment jsdom
// Bộ lọc theo trường (học hành vi Twenty, docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md mục D): nút "Lọc" → tìm trường →
// điều kiện theo kiểu → giá trị → chip; bấm chip sửa lại, × gỡ, đóng khi rỗng → tự gỡ; "Tôi" ghim đầu trường người.
import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import type { DieuKienLoc } from '@/bang/locTruong'
import { ChipLoc, NutLoc, type TruongLoc } from './bo-loc-truong'
import { DsRoot } from './ds-root'

const TRUONG: TruongLoc[] = [
  {
    id: 'tt',
    ten: 'Trạng thái',
    kieu: 'chon',
    tuyChon: [
      { giaTri: 'Open', nhan: 'Đang mở' },
      { giaTri: 'Done', nhan: 'Đã xong' },
      { giaTri: 'Cancel', nhan: 'Đã huỷ' },
    ],
  },
  { id: 'tinh', ten: 'Tỉnh/TP', kieu: 'chon', tuyChon: ['Hà Nội', 'Đà Nẵng', 'TP.HCM', 'Huế'].map((x) => ({ giaTri: x, nhan: x })) },
  { id: 'cs', ten: 'Phụ trách', kieu: 'nguoi', tuyChon: [{ giaTri: 'Mai', nhan: 'Mai' }] },
  { id: 'han', ten: 'Hạn', kieu: 'ngay' },
  { id: 'khach', ten: 'Khách', kieu: 'chu' },
]

function Man({ dau = [], onDoi = () => {} }: { dau?: DieuKienLoc[]; onDoi?: (id: string, d: DieuKienLoc | null) => void }) {
  const [dk, setDk] = useState(dau)
  const doi = (id: string, d: DieuKienLoc | null) => {
    onDoi(id, d)
    setDk((x) => {
      const i = x.findIndex((y) => y.truong === id)
      if (!d) return x.filter((y) => y.truong !== id)
      return i < 0 ? [...x, d] : x.map((y, j) => (j === i ? d : y))
    })
  }
  return (
    <DsRoot>
      <NutLoc truong={TRUONG} dieuKien={dk} onDoi={doi} />
      <div role="region" aria-label="Chip">
        {dk.map((d) => (
          <ChipLoc key={d.truong} truong={TRUONG.find((t) => t.id === d.truong)!} dieuKien={d} onDoi={doi} />
        ))}
      </div>
    </DsRoot>
  )
}

const chip = () =>
  within(screen.getByRole('region', { name: 'Chip' }))
    .queryAllByRole('button', { name: /^Sửa lọc/ })
    .map((b) => b.textContent)
const moLoc = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Lọc' }))
  return screen.findByRole('dialog', { name: 'Lọc' })
}

describe('nút Lọc → trường → điều kiện → giá trị → chip', () => {
  test('bàn phím: focus ô "Tìm trường", lọc không dấu, Enter vào trường, Enter tick giá trị (áp ngay), Esc đóng + focus về nút', async () => {
    const user = userEvent.setup()
    const onDoi = vi.fn()
    render(<Man onDoi={onDoi} />)
    const nut = screen.getByRole('button', { name: 'Lọc' })
    nut.focus()
    await user.keyboard('{Enter}')
    const pop = await screen.findByRole('dialog', { name: 'Lọc' })
    const tim = within(pop).getByRole('combobox', { name: 'Tìm trường' })
    await waitFor(() => expect(document.activeElement).toBe(tim))
    expect(within(pop).getAllByRole('option').map((x) => x.textContent)).toEqual(['Trạng thái', 'Tỉnh/TP', 'Phụ trách', 'Hạn', 'Khách'])
    await user.keyboard('tinh')
    expect(within(pop).getAllByRole('option').map((x) => x.textContent)).toEqual(['Tỉnh/TP'])
    await user.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{ArrowDown}{Enter}')
    // ↓ một lần = mục thứ 2 (Tỉnh/TP).
    const giaTri = await within(pop).findByRole('combobox', { name: 'Tìm Tỉnh/TP' })
    await waitFor(() => expect(document.activeElement).toBe(giaTri))
    expect(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Tỉnh/TP' }).textContent).toContain('là')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onDoi).toHaveBeenLastCalledWith('tinh', { truong: 'tinh', phep: 'la', giaTri: ['Đà Nẵng'] })
    expect(chip()).toEqual(['Tỉnh/TP: Đà Nẵng'])
    expect(within(pop).getByRole('option', { name: 'Đà Nẵng' }).getAttribute('aria-checked')).toBe('true')
    // Pop vẫn mở (tick nhiều), Enter tick tiếp.
    await user.keyboard('{ArrowDown}{Enter}')
    expect(chip()).toEqual(['Tỉnh/TP: Đà Nẵng, TP.HCM'])
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Lọc' })).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(nut))
  })

  test('Tab đi qua ← Quay lại · Điều kiện · ô tìm giá trị; ← về danh sách trường', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Trạng thái' }))
    const tim = await within(pop).findByRole('combobox', { name: 'Tìm Trạng thái' })
    await waitFor(() => expect(document.activeElement).toBe(tim))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Trạng thái' }))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(within(pop).getByRole('button', { name: 'Quay lại' }))
    await user.keyboard('{Enter}')
    await waitFor(() => expect(document.activeElement).toBe(within(pop).getByRole('combobox', { name: 'Tìm trường' })))
  })

  test('chọn trường rồi đóng khi chưa có giá trị → không có chip', async () => {
    const user = userEvent.setup()
    const onDoi = vi.fn()
    render(<Man onDoi={onDoi} />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Hạn' }))
    await within(pop).findByRole('combobox', { name: 'Điều kiện lọc Hạn' })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Lọc' })).toBeNull())
    expect(chip()).toEqual([])
    expect(onDoi.mock.calls.every(([, d]) => d === null)).toBe(true)
  })

  test('trường người: "Tôi" ghim đầu danh sách → chip "Phụ trách: Tôi"; "không là"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Phụ trách' }))
    const ds = await within(pop).findByRole('listbox', { name: 'Giá trị Phụ trách' })
    expect(within(ds).getAllByRole('option').map((x) => x.textContent)).toEqual(['Tôi', 'Mai'])
    await user.keyboard('{Enter}')
    expect(chip()).toEqual(['Phụ trách: Tôi'])
    await user.click(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Phụ trách' }))
    expect(screen.getAllByRole('option').map((x) => x.textContent)).toEqual(expect.arrayContaining(['là', 'không là']))
    await user.click(screen.getByRole('option', { name: 'không là' }))
    expect(chip()).toEqual(['Phụ trách: Không Tôi'])
  })

  test('chọn: "trống" không cần giá trị → chip ngay, danh sách giá trị ẩn; > 3 giá trị → "N lựa chọn"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Tỉnh/TP' }))
    for (const t of ['Hà Nội', 'Đà Nẵng', 'TP.HCM', 'Huế']) await user.click(await within(pop).findByRole('option', { name: t }))
    expect(chip()).toEqual(['Tỉnh/TP: 4 lựa chọn'])
    await user.click(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Tỉnh/TP' }))
    await user.click(screen.getByRole('option', { name: 'trống' }))
    expect(chip()).toEqual(['Tỉnh/TP: Trống'])
    expect(within(pop).queryByRole('listbox', { name: 'Giá trị Tỉnh/TP' })).toBeNull()
  })

  test('ngày: "hôm nay" → "Hạn: Hôm nay"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Hạn' }))
    await user.click(await within(pop).findByRole('combobox', { name: 'Điều kiện lọc Hạn' }))
    expect(screen.getAllByRole('option').map((x) => x.textContent)).toEqual(['hôm nay', 'trong khoảng', 'trước ngày', 'từ ngày', 'trống'])
    await user.click(screen.getByRole('option', { name: 'hôm nay' }))
    expect(chip()).toEqual(['Hạn: Hôm nay'])
  })

  test('ngày: "trước ngày" + chọn ngày bằng DatePicker → "Hạn < dd/MM" (hôm nay luôn cùng năm)', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Hạn' }))
    await user.click(await within(pop).findByRole('combobox', { name: 'Điều kiện lọc Hạn' }))
    await user.click(screen.getByRole('option', { name: 'trước ngày' }))
    await user.click(within(pop).getByRole('button', { name: /^Ngày/ }))
    const lich = await screen.findByRole('dialog', { name: 'Chọn ngày' })
    await user.click(within(lich).getByRole('button', { name: 'Hôm nay' }))
    const d = new Date()
    const hn = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    expect(chip()).toEqual([`Hạn < ${hn}`])
    // Pop Lọc vẫn mở sau khi pop lịch đóng.
    expect(screen.getByRole('dialog', { name: 'Lọc' })).toBeTruthy()
  })

  test('chữ: gõ là áp, Enter đóng; "không chứa"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: 'Khách' }))
    const o = await within(pop).findByRole('textbox', { name: 'Giá trị lọc Khách' })
    await waitFor(() => expect(document.activeElement).toBe(o))
    await user.keyboard('an')
    expect(chip()).toEqual(['Khách: an'])
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Lọc' })).toBeNull())
    expect(chip()).toEqual(['Khách: an'])
  })

  test('trường đã có điều kiện → mở lại đúng điều kiện đó (không tạo trùng)', async () => {
    const user = userEvent.setup()
    render(<Man dau={[{ truong: 'tt', phep: 'la', giaTri: ['Open'] }]} />)
    const pop = await moLoc(user)
    await user.click(within(pop).getByRole('option', { name: /Trạng thái/ }))
    expect((await within(pop).findByRole('option', { name: 'Đang mở' })).getAttribute('aria-checked')).toBe('true')
    await user.click(within(pop).getByRole('option', { name: 'Đã xong' }))
    expect(chip()).toEqual(['Trạng thái: Đang mở, Đã xong'])
  })
})

describe('chip', () => {
  test('bấm chip → sửa; bỏ hết giá trị: chip còn tới khi đóng, đóng → tự gỡ', async () => {
    const user = userEvent.setup()
    const onDoi = vi.fn()
    render(<Man dau={[{ truong: 'tt', phep: 'la', giaTri: ['Open'] }]} onDoi={onDoi} />)
    await user.click(screen.getByRole('button', { name: 'Sửa lọc Trạng thái: Đang mở' }))
    const pop = await screen.findByRole('dialog', { name: 'Lọc Trạng thái' })
    expect(within(pop).queryByRole('button', { name: 'Quay lại' })).toBeNull()
    await user.click(within(pop).getByRole('option', { name: 'Đang mở' }))
    expect(chip()).toEqual(['Trạng thái: Đang mở'])
    await user.keyboard('{Escape}')
    await waitFor(() => expect(chip()).toEqual([]))
    expect(onDoi).toHaveBeenLastCalledWith('tt', null)
    // Chip mất → focus không rơi về body: hết chip thì về nút Lọc.
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Lọc' })))
  })

  test('× gỡ điều kiện, focus sang chip kế bên', async () => {
    const user = userEvent.setup()
    render(
      <Man
        dau={[
          { truong: 'tt', phep: 'la', giaTri: ['Open'] },
          { truong: 'khach', phep: 'chua', giaTri: ['an'] },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Bỏ lọc Trạng thái' }))
    expect(chip()).toEqual(['Khách: an'])
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sửa lọc Khách: an' }))
    await user.click(screen.getByRole('button', { name: 'Bỏ lọc Khách' }))
    expect(chip()).toEqual([])
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Lọc' }))
  })
})
