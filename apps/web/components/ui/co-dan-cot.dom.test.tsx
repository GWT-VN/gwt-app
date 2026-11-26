// @vitest-environment jsdom
// Co dãn cột học Twenty (useResizeTableHeader): MỌI cột rộng cố định, cột trống CUỐI ăn phần dư. Kéo mép phải cột X →
// chỉ X đổi, cột khác giữ nguyên (trước 26/11: cột khoá đầu ăn phần dư nên co bù — mép trái cột đang kéo chạy ngược).
import { fireEvent, render } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(),
}))

import { DsRoot } from './ds-root'
import { Table, TableHeader, TableRow } from './table'
import { ColCotBang, KeoCot, TieuDeCot } from './tieu-de-cot'
import { RONG_O_CHON, useCotBang, type CotBang } from './use-cot-bang'

const COT: CotBang[] = [
  { id: 'khach', ten: 'Khách', rong: 296, kieu: 'thuong', khoa: true },
  { id: 'may', ten: 'Máy', rong: 184, kieu: 'thuong' },
  { id: 'han', ten: 'Hạn', rong: 96, kieu: 'thuong' },
]

function Man() {
  const c = useCotBang(COT)
  return (
    <DsRoot>
      <KeoCot cot={c.hien} doiCho={c.doiCho}>
        <Table layout="fixed" data-tong={c.tongRong} style={{ minWidth: RONG_O_CHON + c.tongRong }}>
          <ColCotBang hien={c.hien} doRong={c.doRong} />
          <TableHeader>
            <TableRow>
              <th />
              {c.hien.map((x, i) => (
                <TieuDeCot key={x.id} cot={x} viTri={i} coDan={{ rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }} />
              ))}
              <th />
            </TableRow>
          </TableHeader>
        </Table>
      </KeoCot>
    </DsRoot>
  )
}

const rong = () => [...document.querySelectorAll('col')].map((c) => (c as HTMLElement).style.width)
const tay = (ten: string) => document.querySelector<HTMLElement>(`[aria-label="Đổi độ rộng cột ${ten}"]`)!

beforeEach(() => {
  // jsdom không có pointer capture.
  HTMLElement.prototype.setPointerCapture = () => {}
})

test('colgroup: ô chọn 36 + MỌI cột (kể cả cột khoá đầu) rộng cố định + một cột cuối không đặt rộng (ăn phần dư); bảng minWidth = tổng', () => {
  render(<Man />)
  expect(rong()).toEqual(['36px', '296px', '184px', '96px', ''])
  expect((document.querySelector('table') as HTMLElement).style.minWidth).toBe(`${36 + 296 + 184 + 96}px`)
})

test('kéo tay co cột Máy +60 → chỉ Máy đổi (244), Khách + Hạn giữ nguyên; cột khoá đầu cũng có tay co', () => {
  render(<Man />)
  expect(tay('Khách')).toBeTruthy()
  const t = tay('Máy')
  fireEvent.pointerDown(t, { clientX: 500, pointerId: 1 })
  fireEvent.pointerMove(t, { clientX: 530, pointerId: 1 })
  fireEvent.pointerMove(t, { clientX: 560, pointerId: 1 })
  fireEvent.pointerUp(t, { clientX: 560, pointerId: 1 })
  expect(rong()).toEqual(['36px', '296px', '244px', '96px', ''])
  expect(document.querySelector('table')!.dataset.tong).toBe(String(296 + 244 + 96))
})
