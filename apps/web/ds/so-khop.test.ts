import { expect, test } from 'vitest'
import { docBuoc, docThamSo, maThoat, phanLoai, timLyDo } from './so-khop.mjs'

test('docThamSo: không --url thì dùng mặc định localhost:3401', () => {
  expect(docThamSo(['Button'])).toEqual({ comp: 'Button', url: 'http://localhost:3401' })
})
test('docThamSo: --url trước hay sau tên component đều được, bỏ / cuối', () => {
  expect(docThamSo(['Button', '--url', 'http://127.0.0.1:3401/'])).toEqual({ comp: 'Button', url: 'http://127.0.0.1:3401' })
  expect(docThamSo(['--url', 'http://127.0.0.1:3401', 'Button'])).toEqual({ comp: 'Button', url: 'http://127.0.0.1:3401' })
})
test('docThamSo: thiếu component / --url rỗng / cờ lạ / thừa tham số → lỗi', () => {
  expect(() => docThamSo([])).toThrow(/thiếu tên component/)
  expect(() => docThamSo(['--url', 'http://x'])).toThrow(/thiếu tên component/)
  expect(() => docThamSo(['Button', '--url'])).toThrow(/--url thiếu giá trị/)
  expect(() => docThamSo(['Button', '--x'])).toThrow(/cờ lạ/)
  expect(() => docThamSo(['Button', 'Badge'])).toThrow(/thừa tham số/)
})
test('timLyDo: khoá trần áp mọi theme/khổ; khoá @phạm vi chỉ áp đúng chỗ', () => {
  const ly = { 'color': 'a', 'hover.backgroundColor@toi': 'b', 'opacity@toi 390': 'c' }
  expect(timLyDo(ly, 'color', 'sang 1440')).toBe('color')
  expect(timLyDo(ly, 'hover.backgroundColor', 'toi 1440')).toBe('hover.backgroundColor@toi')
  expect(timLyDo(ly, 'hover.backgroundColor', 'sang 1440')).toBeUndefined()
  expect(timLyDo(ly, 'opacity', 'toi 390')).toBe('opacity@toi 390')
  expect(timLyDo(ly, 'opacity', 'toi 1440')).toBeUndefined()
  expect(timLyDo(undefined, 'color', 'sang 1440')).toBeUndefined()
})

const chuot = (params: object) => ({ method: 'Input.dispatchMouseEvent', params })
const phim = (params: object) => [
  { method: 'Input.dispatchKeyEvent', params: { type: 'keyDown', ...params } },
  { method: 'Input.dispatchKeyEvent', params: { type: 'keyUp', ...params } },
]
test('docBuoc: bấm rồi Esc → định vị phần tử, rê, nhấn/nhả trái, rồi phím Escape — đúng thứ tự', () => {
  expect(docBuoc([{ bam: '#a' }, { phim: 'Escape' }])).toEqual([
    { tim: '#a' },
    chuot({ type: 'mouseMoved' }),
    chuot({ type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1 }),
    chuot({ type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1 }),
    ...phim({ key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }),
  ])
})
test('docBuoc: chuột phải = nút right (trình duyệt tự bắn contextmenu); rê = chỉ mouseMoved', () => {
  expect(docBuoc([{ chuotPhai: '.dong' }, { tro: '.muc' }])).toEqual([
    { tim: '.dong' },
    chuot({ type: 'mouseMoved' }),
    chuot({ type: 'mousePressed', button: 'right', buttons: 2, clickCount: 1 }),
    chuot({ type: 'mouseReleased', button: 'right', buttons: 0, clickCount: 1 }),
    { tim: '.muc' },
    chuot({ type: 'mouseMoved' }),
  ])
})
test('docBuoc: phím Tab / ArrowDown / Shift+F10 (F10 + modifiers 8)', () => {
  expect(docBuoc([{ phim: 'Tab' }, { phim: 'ArrowDown' }, { phim: 'Shift+F10' }])).toEqual([
    ...phim({ key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }),
    ...phim({ key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 }),
    ...phim({ key: 'F10', code: 'F10', windowsVirtualKeyCode: 121, modifiers: 8 }),
  ])
})
test('docBuoc: selector { artifact, ds } chọn theo bên (khoá artifactThat); thiếu bên đang chạy → lỗi', () => {
  const b = [{ tro: { artifact: '.ui-tip', ds: '[data-so="icon"]' } }]
  expect(docBuoc(b, 'artifact')[0]).toEqual({ tim: '.ui-tip' })
  expect(docBuoc(b, 'ds')[0]).toEqual({ tim: '[data-so="icon"]' })
  expect(docBuoc(b)[0]).toEqual({ tim: '[data-so="icon"]' })
  expect(() => docBuoc([{ bam: { ds: '#a' } }], 'artifact')).toThrow(/thiếu selector \(bên artifact\)/)
})
test('docBuoc: bước lạ / phím lạ / selector rỗng / không phải mảng → lỗi (không bỏ qua)', () => {
  expect(() => docBuoc([{ nhay: '#a' }])).toThrow(/bước lạ/)
  expect(() => docBuoc([{ phim: 'Enter' }])).toThrow(/phím lạ/)
  expect(() => docBuoc([{ bam: '' }])).toThrow(/selector/)
  expect(() => docBuoc([{ bam: '#a', tro: '#b' }])).toThrow(/bước lạ/)
  expect(() => docBuoc({ bam: '#a' })).toThrow(/mảng/)
  expect(docBuoc(undefined)).toEqual([])
})

const do_ = { width: '32px', color: 'rgb(0 0 0)' }
test('phanLoai: thiếu bên nào → "thieu"; khớp hết → "khop"; khác một thuộc tính → "lech"', () => {
  expect(phanLoai({ a: null, d: do_ })).toBe('thieu')
  expect(phanLoai({ a: do_, d: null, trongVung: true, vung: null })).toBe('thieu')
  expect(phanLoai({ a: do_, d: { ...do_ } })).toBe('khop')
  expect(phanLoai({ a: do_, d: { ...do_, width: '33px' } })).toBe('lech')
})
test('phanLoai: trongVung mà phần tử DS ngoài [data-ds="v2"] → "ngoai-vung", kể cả khi số đo khớp hết', () => {
  expect(phanLoai({ a: do_, d: { ...do_ }, trongVung: true, vung: false })).toBe('ngoai-vung')
  expect(phanLoai({ a: do_, d: { ...do_, width: '1px' }, trongVung: true, vung: false })).toBe('ngoai-vung')
  expect(phanLoai({ a: do_, d: { ...do_ }, trongVung: true, vung: true })).toBe('khop')
  // Không bật trongVung thì không xét vùng.
  expect(phanLoai({ a: do_, d: { ...do_ }, vung: false })).toBe('khop')
})
test('maThoat: ngoài vùng / thiếu / lệch chưa lý do / lyDo thừa → 1; sạch → 0 (lyDo không miễn được ngoài vùng)', () => {
  const sach = { chuaLyDo: 0, thieu: 0, ngoaiVung: 0, lyDoThua: 0 }
  expect(maThoat(sach)).toBe(0)
  expect(maThoat({ ...sach, ngoaiVung: 1 })).toBe(1)
  expect(maThoat({ ...sach, thieu: 2 })).toBe(1)
  expect(maThoat({ ...sach, chuaLyDo: 1 })).toBe(1)
  expect(maThoat({ ...sach, lyDoThua: 1 })).toBe(1)
})
