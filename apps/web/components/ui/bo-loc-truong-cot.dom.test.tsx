// @vitest-environment jsdom
// Lọc từ tiêu đề cột (CEO 27/11: bấm tiêu đề = mở thẳng pop lọc của ĐÚNG trường đó, cuối pop "Ẩn cột"). TieuDeCot →
// `useMoLoc().mo(trường, nút tiêu đề)`: chưa có điều kiện → pop của NutLoc mở thẳng trang sửa trường đó (đủ phép + "Tôi");
// đã có chip → mở chip đó. Đóng → focus về nút tiêu đề cột.
import { useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import type { DieuKienLoc } from '@/bang/locTruong'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from './bo-loc-truong'
import { DsRoot } from './ds-root'
import { TieuDeCot } from './tieu-de-cot'
import type { CotBang } from './use-cot-bang'

const TRUONG: TruongLoc[] = [
  {
    id: 'tt',
    ten: 'Trạng thái',
    kieu: 'chon',
    tuyChon: [
      { giaTri: 'Open', nhan: 'Đang mở' },
      { giaTri: 'Done', nhan: 'Đã xong' },
    ],
  },
  { id: 'cs', ten: 'Phụ trách', kieu: 'nguoi', tuyChon: [{ giaTri: 'Mai', nhan: 'Mai' }] },
]
const COT: CotBang[] = [
  { id: 'tt', ten: 'Trạng thái', rong: 96, kieu: 'loc' },
  { id: 'cs', ten: 'Phụ trách', rong: 84, kieu: 'loc' },
]

function Man({ dau = [], coX = false }: { dau?: DieuKienLoc[]; coX?: boolean }) {
  const [dk, setDk] = useState(dau)
  const [an, setAn] = useState<string[]>([])
  const { nut: refNutLoc, chip: refChipLoc, mo: moLocTruong } = useMoLoc()
  const doi = (id: string, d: DieuKienLoc | null) =>
    setDk((x) => (!d ? x.filter((y) => y.truong !== id) : x.some((y) => y.truong === id) ? x.map((y) => (y.truong === id ? d : y)) : [...x, d]))
  return (
    <DsRoot>
      <NutLoc ref={refNutLoc} truong={TRUONG} dieuKien={dk} onDoi={doi} />
      <div role="region" aria-label="Chip">
        {dk.map((d) => (
          <ChipLoc key={d.truong} ref={refChipLoc(d.truong)} truong={TRUONG.find((t) => t.id === d.truong)!} dieuKien={d} onDoi={doi} />
        ))}
      </div>
      <table>
        <thead>
          <tr>
            {COT.filter((c) => !an.includes(c.id)).map((c) => (
              <TieuDeCot
                key={c.id}
                cot={c}
                moLoc={{
                  dang: dk.some((d) => d.truong === c.id),
                  onMo: (neo, phu) => moLocTruong(c.id, neo, phu),
                  onXoa: coX ? () => doi(c.id, null) : undefined,
                }}
                menuCot={{ trai: null, phai: null, onDoi: () => {}, onAn: () => setAn((x) => [...x, c.id]) }}
              />
            ))}
          </tr>
        </thead>
      </table>
    </DsRoot>
  )
}

const nutCot = (ten: string) => screen.getByRole('button', { name: new RegExp(`^${ten}`) })
const chip = () =>
  within(screen.getByRole('region', { name: 'Chip' }))
    .queryAllByRole('button', { name: /^Sửa lọc/ })
    .map((b) => b.textContent)

describe('bấm tiêu đề cột → pop lọc của cột (không menu cột)', () => {
  test('chưa có điều kiện: mở thẳng trang sửa của trường đó (đủ phép, "Tôi" cho người); Esc → focus về tiêu đề cột', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(nutCot('Phụ trách'))
    const pop = await screen.findByRole('dialog', { name: 'Lọc' })
    // Không qua danh sách trường: vào thẳng Phụ trách.
    const tim = await within(pop).findByRole('combobox', { name: 'Tìm Phụ trách' })
    await waitFor(() => expect(document.activeElement).toBe(tim))
    expect(within(pop).getAllByRole('option').map((o) => o.textContent)).toEqual(['Tôi', 'Mai'])
    await user.click(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Phụ trách' }))
    expect((await screen.findAllByRole('option', { name: /là/ })).map((o) => o.textContent)).toEqual(['là', 'không là'])
    await user.keyboard('{Escape}')
    await user.click(within(pop).getByRole('option', { name: 'Tôi' }))
    expect(chip()).toEqual(['Phụ trách: Tôi'])
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Lọc' })).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(nutCot('Phụ trách')))
    // Tiêu đề báo cột đang lọc.
    expect(nutCot('Phụ trách').textContent).toContain('đang lọc')
  })

  test('đã có chip của trường: mở CHÍNH chip đó (điều kiện "không là" vẫn sửa được); đóng → focus về tiêu đề cột', async () => {
    const user = userEvent.setup()
    render(<Man dau={[{ truong: 'tt', phep: 'khong-la', giaTri: ['Done'] }]} />)
    await user.click(nutCot('Trạng thái'))
    const pop = await screen.findByRole('dialog', { name: 'Lọc Trạng thái' })
    expect(within(pop).getByRole('combobox', { name: 'Điều kiện lọc Trạng thái' }).textContent).toContain('không là')
    expect(within(pop).getByRole('option', { name: 'Đã xong' }).getAttribute('aria-checked')).toBe('true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.activeElement).toBe(nutCot('Trạng thái')))
    expect(chip()).toEqual(['Trạng thái: Không Đã xong'])
  })

  test('bấm chip lọc ở nhãn cột → mở THẲNG pop lọc của cột (không qua menu cột)', async () => {
    const user = userEvent.setup()
    render(<Man dau={[{ truong: 'tt', phep: 'la', giaTri: ['Open'] }]} />)
    await user.click(nutCot('Trạng thái').querySelector('[data-slot="th-chip-loc"]')!)
    const pop = await screen.findByRole('dialog', { name: 'Lọc Trạng thái' })
    expect(within(pop).getByRole('option', { name: 'Đang mở' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  test('chip có × (CEO 27/11): × bỏ lọc cột ngay, focus về tiêu đề; bấm phần trống của ô vẫn mở pop', async () => {
    const user = userEvent.setup()
    render(<Man coX dau={[{ truong: 'tt', phep: 'la', giaTri: ['Open'] }, { truong: 'cs', phep: 'la', giaTri: ['Mai'] }]} />)
    // Phần trống của ô tiêu đề (không trúng nút) → mở pop của cột.
    await user.click(screen.getByRole('button', { name: /^Phụ trách/ }).closest('th')!)
    expect(await screen.findByRole('dialog', { name: 'Lọc Phụ trách' })).toBeTruthy()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.click(within(screen.getByRole('table')).getByRole('button', { name: 'Bỏ lọc Trạng thái' }))
    expect(chip()).toEqual(['Phụ trách: Mai'])
    expect(within(screen.getByRole('table')).queryByRole('button', { name: 'Bỏ lọc Trạng thái' })).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(nutCot('Trạng thái')))
    expect(nutCot('Trạng thái').textContent).not.toContain('đang lọc')
  })

  test('cuối pop có "Ẩn cột" → đóng pop, ẩn cột', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(nutCot('Phụ trách'))
    expect(screen.queryByRole('menu')).toBeNull()
    const pop = await screen.findByRole('dialog', { name: 'Lọc' })
    await user.click(within(pop).getByRole('button', { name: 'Ẩn cột' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Lọc' })).toBeNull())
    expect(screen.queryByRole('button', { name: /^Phụ trách/ })).toBeNull()
  })

  test('mở từ nút Lọc (thanh công cụ): KHÔNG có "Ẩn cột"', async () => {
    const user = userEvent.setup()
    render(<Man />)
    await user.click(screen.getByRole('button', { name: 'Lọc' }))
    const pop = await screen.findByRole('dialog', { name: 'Lọc' })
    await user.click(within(pop).getByRole('option', { name: /Phụ trách/ }))
    expect(within(pop).queryByRole('button', { name: 'Ẩn cột' })).toBeNull()
  })

  test('mở chip từ tiêu đề, bỏ hết giá trị rồi đóng → chip gỡ, focus vẫn về tiêu đề cột (không nhảy sang nút Lọc)', async () => {
    const user = userEvent.setup()
    render(<Man dau={[{ truong: 'tt', phep: 'la', giaTri: ['Open'] }]} />)
    await user.click(nutCot('Trạng thái'))
    const pop = await screen.findByRole('dialog', { name: 'Lọc Trạng thái' })
    await user.click(within(pop).getByRole('option', { name: 'Đang mở' }))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(chip()).toEqual([]))
    await waitFor(() => expect(document.activeElement).toBe(nutCot('Trạng thái')))
  })
})
