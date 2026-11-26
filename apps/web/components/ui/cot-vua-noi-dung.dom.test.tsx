// @vitest-environment jsdom
// Độ rộng cột mặc định = nội dung dài nhất (CEO 26/11 "chiều rộng cột = chiều dài content dài nhất để tránh bị cắt"):
// cột không khai `rong` tự vừa max(tiêu đề, mọi ô đang vẽ) + đệm ô, sàn 56, trần `rongToiDa` (quá trần → cắt + title).
// Kéo tay (cot_rong) thắng; nhấp đúp tay co → về vừa nội dung. Tổng vượt khung → minWidth = tổng (cuộn ngang, không bóp).
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const nav = vi.hoisted(() => ({ qs: '' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ds',
  useSearchParams: () => new URLSearchParams(nav.qs),
}))

import { DsRoot } from './ds-root'
import { Table, TableBody, TableCell, TableHeader, TableRow } from './table'
import { ColCotBang, TieuDeCot } from './tieu-de-cot'
import { docUrlCot, doVuaNoiDung, ghiUrlCot, giuCotKhoa, RONG_O_CHON, useCotBang, type CotBang } from './use-cot-bang'

const COT: CotBang[] = [
  { id: 'khach', ten: 'Khách', kieu: 'thuong', khoa: true, rongToiDa: 200 },
  { id: 'may', ten: 'Máy', kieu: 'thuong' },
  { id: 'han', ten: 'Hạn', rong: 96, kieu: 'thuong' },
]
type Dong = { id: string; khach: number; may: number }

function Man({ dong, url = false }: { dong: Dong[]; url?: boolean }) {
  const c = useCotBang(COT, { url })
  const { refBang } = c
  return (
    <DsRoot>
      <Table ref={refBang} layout="fixed" style={{ minWidth: RONG_O_CHON + c.tongRong }}>
        <ColCotBang hien={c.hien} doRong={c.doRong} choDo={c.choDo} />
        <TableHeader>
          <TableRow>
            <th />
            {c.hien.map((x, i) => (
              <TieuDeCot key={x.id} cot={x} viTri={i} coDan={{ rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }} />
            ))}
            <th />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dong.map((d) => (
            <TableRow key={d.id}>
              <td />
              <TableCell cot="khach">
                <span data-w={d.khach}>Khách {d.id}</span>
              </TableCell>
              <TableCell cot="may">
                <span data-w={d.may}>Máy {d.id}</span>
              </TableCell>
              <TableCell cot="han">—</TableCell>
              <td />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DsRoot>
  )
}

// jsdom không có bố cục: phần tử có `data-w` rộng đúng số đó (bất kể bị ép `width`), không có thì 8px mỗi ký tự.
let soLanDo = 0
let bangHien = true
const ro: (() => void)[] = []
const goc = HTMLElement.prototype.getBoundingClientRect
const gocRects = HTMLElement.prototype.getClientRects
beforeEach(() => {
  bangHien = true
  ro.length = 0
  HTMLElement.prototype.getClientRects = function () {
    return (bangHien ? [{}] : []) as unknown as DOMRectList
  }
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: () => void) {
        ro.push(cb)
      }
      observe() {}
      disconnect() {}
    },
  )
  // Bảng kiểu mặc định của jsdom đặt td/th đệm 1px — về 0 cho số dễ đọc (đệm thật được cộng: test cuối).
  if (!document.getElementById('dem-0'))
    document.head.insertAdjacentHTML('beforeend', '<style id="dem-0">td, th { padding: 0 }</style>')
  nav.qs = ''
  soLanDo = 0
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    soLanDo++
    const w = this.dataset.w ? Number(this.dataset.w) : (this.textContent ?? '').length * 8
    return { x: 0, y: 0, left: 0, top: 0, right: w, bottom: 20, width: w, height: 20, toJSON: () => ({}) } as DOMRect
  }
})
afterEach(() => {
  HTMLElement.prototype.getBoundingClientRect = goc
  HTMLElement.prototype.getClientRects = gocRects
  vi.unstubAllGlobals()
})

const rong = () => [...document.querySelectorAll('col')].map((c) => (c as HTMLElement).style.width)
const tay = (ten: string) => document.querySelector<HTMLElement>(`[aria-label="Đổi độ rộng cột ${ten}"]`)!
const DONG: Dong[] = [
  { id: '1', khach: 150, may: 30 },
  { id: '2', khach: 180, may: 20 },
]

test('cột không khai rong = max(tiêu đề, mọi ô đang vẽ), sàn 56; cột có rong giữ số khai; minWidth = tổng (không bóp)', () => {
  render(<Man dong={DONG} />)
  // khach: ô dài nhất 180 > tiêu đề "Khách" 40, + 8 khoảng cuối · may: ô 30 + 8 → sàn 56 · han: khai 96.
  expect(rong()).toEqual(['36px', '188px', '56px', '96px', ''])
  expect(document.querySelector('table')!.style.minWidth).toBe(`${36 + 188 + 56 + 96}px`)
})

test('tiêu đề dài hơn mọi ô → cột theo tiêu đề', () => {
  render(<Man dong={[{ id: '1', khach: 20, may: 20 }]} />)
  // "Khách" 5 ký tự × 8 = 40 < 56 → sàn; đổi dữ liệu ngắn hơn tiêu đề "Máy" cũng về sàn.
  expect(rong()).toEqual(['36px', '56px', '56px', '96px', ''])
})

test('quá trần rongToiDa → cột = trần, ô bị cắt có title = nội dung; ô vừa không có title', () => {
  render(<Man dong={[{ id: '1', khach: 260, may: 30 }, { id: '2', khach: 120, may: 30 }]} />)
  expect(rong()[1]).toBe('200px')
  const o = document.querySelectorAll<HTMLElement>('td[data-cot="khach"]')
  expect(o[0].title).toBe('Khách 1')
  expect(o[1].hasAttribute('title')).toBe(false)
})

test('dữ liệu đổi → đo lại (MutationObserver), cột nở theo nội dung mới', async () => {
  const { rerender } = render(<Man dong={DONG} />)
  rerender(<Man dong={[...DONG, { id: '3', khach: 190, may: 90 }]} />)
  await waitFor(() => expect(rong()).toEqual(['36px', '198px', '98px', '96px', '']))
})

test('kéo tay thắng (cả khi dữ liệu đổi), không đo lại lúc đang kéo; nhấp đúp → về vừa nội dung', async () => {
  const { rerender } = render(<Man dong={DONG} />)
  const t = tay('Khách')
  fireEvent.pointerDown(t, { clientX: 500, pointerId: 1 })
  soLanDo = 0
  fireEvent.pointerMove(t, { clientX: 520, pointerId: 1 })
  fireEvent.pointerMove(t, { clientX: 530, pointerId: 1 })
  fireEvent.pointerUp(t, { clientX: 530, pointerId: 1 })
  await act(() => new Promise((r) => requestAnimationFrame(r)))
  expect(soLanDo).toBe(0)
  expect(rong()[1]).toBe('218px') // 188 + kéo 30
  rerender(<Man dong={[...DONG, { id: '3', khach: 185, may: 20 }]} />)
  await act(() => new Promise((r) => requestAnimationFrame(r)))
  expect(rong()[1]).toBe('218px') // 188 + kéo 30
  fireEvent.doubleClick(t)
  // Về vừa nội dung hiện tại (185 + 8, dưới trần 200), không phải một số cố định cũ.
  await waitFor(() => expect(rong()[1]).toBe('193px'))
})

test('bảng đang ẩn (display:none) → không đo (không kẹp về sàn); hiện ra (ResizeObserver) → đo', async () => {
  bangHien = false
  render(<Man dong={DONG} />)
  expect(rong()[1]).toBe('120px') // RONG_CHO_DO, chưa đo
  // Chưa đo → bảng ẩn (giữ chỗ) để không lộ 120px rồi nhảy (CEO 26/11 "cột giật lúc mở").
  expect(document.querySelector('colgroup')!.hasAttribute('data-cho-do')).toBe(true)
  expect(document.querySelector('table')!.className).toContain('has-[>colgroup[data-cho-do]]:invisible')
  bangHien = true
  act(() => ro.forEach((cb) => cb()))
  await waitFor(() => expect(rong()[1]).toBe('188px'))
  expect(document.querySelector('colgroup')!.hasAttribute('data-cho-do')).toBe(false)
})

test('cộng đệm trái/phải của ô; nội dung nhiều con nằm ngang = từ mép trái nhất tới mép phải nhất', () => {
  render(<Man dong={DONG} />)
  const o = document.querySelector<HTMLElement>('td[data-cot="khach"]')!
  o.style.padding = '0 6px'
  const a = document.createElement('span')
  a.dataset.w = '300'
  o.appendChild(a)
  const goc2 = HTMLElement.prototype.getBoundingClientRect
  // Con thứ hai đứng sau con đầu (trái 180) → phạm vi 0…480.
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const r = goc2.call(this)
    return this === a ? ({ ...r, left: 180, right: 480 } as DOMRect) : r
  }
  const ra = doVuaNoiDung(document.querySelector('table')!, [{ ...COT[0], rongToiDa: undefined }])
  expect(ra.khach).toBe(480 + 12 + 8) // + đệm ô 6×2 + khoảng cuối 8
})

test('URL: cot_rong ghi CHỈ cột kéo tay; mở lại giữ đúng số đã kéo', () => {
  const md = docUrlCot(new URLSearchParams(''), COT)
  expect(md.keoTay).toEqual({})
  expect(ghiUrlCot(new URLSearchParams(''), md, COT).toString()).toBe('')
  const sp = ghiUrlCot(new URLSearchParams(''), { ...md, keoTay: { khach: 250 } }, COT)
  expect(sp.get('cot_rong')).toBe('khach:250')
  nav.qs = sp.toString()
  render(<Man dong={DONG} url />)
  expect(rong()[1]).toBe('250px')
})

test('cột khoá đứng yên đầu bảng: URL cũ / kéo thả đẩy cột khác lên trước nó → trả về vị trí khai báo (CEO 26/11 "align giữ nguyên")', () => {
  expect(giuCotKhoa(['may', 'khach', 'han'], COT)).toEqual(['khach', 'may', 'han'])
  expect(giuCotKhoa(['han', 'may', 'khach'], COT)).toEqual(['khach', 'han', 'may'])
  expect(docUrlCot(new URLSearchParams('cot_thu_tu=may,khach,han'), COT).thuTu).toEqual(['khach', 'may', 'han'])
  nav.qs = 'cot_thu_tu=han,may,khach'
  render(<Man dong={DONG} url />)
  expect(document.querySelector('thead th[data-cot]')?.getAttribute('data-cot')).toBe('khach')
})

test('link cũ thiếu cột mới (URL lưu trước khi cột ra đời) → cột mới đứng đúng vị trí mặc định, không dồn cuối', () => {
  // COT mặc định: khach, may, han. URL cũ chỉ biết khach, han (đã đổi chỗ han lên trước may chưa tồn tại).
  expect(docUrlCot(new URLSearchParams('cot_thu_tu=han,khach'), COT).thuTu).toEqual(['khach', 'may', 'han'])
  expect(docUrlCot(new URLSearchParams('cot_thu_tu=khach,han'), COT).thuTu).toEqual(['khach', 'may', 'han'])
})
