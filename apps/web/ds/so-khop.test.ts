import { expect, test } from 'vitest'
import {
  docBuoc,
  docThamSo,
  hopGop,
  kiemCauHinh,
  locThuocTinh,
  maThoat,
  moTaBoDo,
  phanLoai,
  timLyDo,
  truocTrongThuTuTab,
} from './so-khop.mjs'

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
  expect(phanLoai({ a: null, d: do_, vung: true })).toBe('thieu')
  expect(phanLoai({ a: do_, d: null, vung: null })).toBe('thieu')
  expect(phanLoai({ a: do_, d: { ...do_ }, vung: true })).toBe('khop')
  expect(phanLoai({ a: do_, d: { ...do_, width: '33px' }, vung: true })).toBe('lech')
})
test('phanLoai: vùng LUÔN xét — phần tử DS ngoài [data-ds="v2"] (hoặc chưa đo vùng) → "ngoai-vung", kể cả khi khớp hết', () => {
  expect(phanLoai({ a: do_, d: { ...do_ }, vung: false })).toBe('ngoai-vung')
  expect(phanLoai({ a: do_, d: { ...do_, width: '1px' }, vung: false })).toBe('ngoai-vung')
  // Không cần (và không tắt được bằng) trongVung: quên đo vùng = ngoài vùng.
  expect(phanLoai({ a: do_, d: { ...do_ }, trongVung: false, vung: false })).toBe('ngoai-vung')
  expect(phanLoai({ a: do_, d: { ...do_ } })).toBe('ngoai-vung')
  expect(phanLoai({ a: do_, d: { ...do_ }, trongVung: true, vung: true })).toBe('khop')
})
test('maThoat: ngoài vùng / thiếu / lệch chưa lý do / lyDo thừa → 1; sạch → 0 (lyDo không miễn được ngoài vùng)', () => {
  const sach = { chuaLyDo: 0, thieu: 0, ngoaiVung: 0, lyDoThua: 0 }
  expect(maThoat(sach)).toBe(0)
  expect(maThoat({ ...sach, ngoaiVung: 1 })).toBe(1)
  expect(maThoat({ ...sach, thieu: 2 })).toBe(1)
  expect(maThoat({ ...sach, chuaLyDo: 1 })).toBe(1)
  expect(maThoat({ ...sach, lyDoThua: 1 })).toBe(1)
})

test('docBuoc: { cho: ms } = chờ (0–10000 ms); { tab: sel } = Tab thật tới phần tử, không blur trước', () => {
  expect(docBuoc([{ bam: '#a' }, { cho: 300 }, { tab: '[role="menuitem"]' }])).toEqual([
    { tim: '#a' },
    chuot({ type: 'mouseMoved' }),
    chuot({ type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1 }),
    chuot({ type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1 }),
    { cho: 300 },
    { tab: '[role="menuitem"]' },
  ])
  expect(docBuoc([{ tab: { artifact: '.x', ds: '#y' } }], 'artifact')).toEqual([{ tab: '.x' }])
  expect(() => docBuoc([{ cho: -1 }])).toThrow(/cho/)
  expect(() => docBuoc([{ cho: 20000 }])).toThrow(/cho/)
  expect(() => docBuoc([{ cho: '300' }])).toThrow(/cho/)
  expect(() => docBuoc([{ tab: '' }])).toThrow(/selector/)
})

test('hopGop: hộp chung của nhiều hộp; bỏ hộp 0×0 (ô portal rỗng); không còn hộp nào → lỗi', () => {
  expect(hopGop([{ x: 10, y: 20, w: 100, h: 50 }])).toEqual({ x: 10, y: 20, w: 100, h: 50 })
  expect(hopGop([{ x: 10, y: 20, w: 100, h: 50 }, { x: 60, y: 5, w: 200, h: 10 }, { x: 0, y: 0, w: 0, h: 0 }]))
    .toEqual({ x: 10, y: 5, w: 250, h: 65 })
  expect(() => hopGop([{ x: 0, y: 0, w: 0, h: 0 }])).toThrow(/rỗng/)
  expect(() => hopGop([])).toThrow(/rỗng/)
})

const cfgMau = (o = {}) => ({ khung: { artifact: '.a', ds: '#b > div' }, khoa: [{ khoa: 'k', artifact: '.a', ds: '#b' }], ...o })
test('kiemCauHinh: khung chuỗi hoặc mảng chuỗi không rỗng; sai → lỗi', () => {
  expect(() => kiemCauHinh(cfgMau())).not.toThrow()
  expect(() => kiemCauHinh(cfgMau({ khung: { artifact: '.a', ds: ['#dialog > div', '[data-ds-portal] > *'] } }))).not.toThrow()
  expect(() => kiemCauHinh(cfgMau({ khung: { artifact: '.a', ds: [] } }))).toThrow(/khung\.ds/)
  expect(() => kiemCauHinh(cfgMau({ khung: { artifact: '.a', ds: ['#x', ''] } }))).toThrow(/khung\.ds/)
  expect(() => kiemCauHinh(cfgMau({ khung: { ds: '#x' } }))).toThrow(/khung\.artifact/)
})
test('kiemCauHinh: buoc + trangThai focus cùng khoá → lỗi (tabToi blur + Tab từ đầu trang đóng overlay vừa mở)', () => {
  const k = { khoa: 'menu', artifact: '.m', ds: '#m', buoc: [{ bam: '#t' }] }
  expect(() => kiemCauHinh(cfgMau({ khoa: [{ ...k, trangThai: ['focus'] }] }))).toThrow(/menu[\s\S]*buoc[\s\S]*focus[\s\S]*\{ ?"tab"/)
  expect(() => kiemCauHinh(cfgMau({ khoa: [{ ...k, trangThai: ['hover'] }] }))).not.toThrow()
  expect(() => kiemCauHinh(cfgMau({ khoa: [{ ...k, buoc: [{ phim: 'Enter' }] }] }))).toThrow(/phím lạ/)
  // artifactThat: bước phải có selector cho bên artifact
  expect(() => kiemCauHinh(cfgMau({ khoa: [{ ...k, artifactThat: true, buoc: [{ bam: { ds: '#t' } }] }] }))).toThrow(/bên artifact/)
})
test('kiemCauHinh: anhTuongTac.buoc kiểm như buoc (bên artifact chỉ khi anhTuongTac.artifactThat)', () => {
  expect(() => kiemCauHinh(cfgMau({ anhTuongTac: { buoc: [{ bam: '#t' }] } }))).not.toThrow()
  expect(() => kiemCauHinh(cfgMau({ anhTuongTac: { buoc: [{ nhay: '#t' }] } }))).toThrow(/bước lạ/)
  expect(() => kiemCauHinh(cfgMau({ anhTuongTac: { artifactThat: true, buoc: [{ bam: { ds: '#t' } }] } }))).toThrow(/bên artifact/)
})

test('truocTrongThuTuTab: phần tử đứng ngay trước đích theo thứ tự Tab (tabIndex 0 theo DOM); đích đầu tiên → -1', () => {
  const ds = [{ tabIndex: 0 }, { tabIndex: 0 }, { tabIndex: 0 }]
  expect(truocTrongThuTuTab(ds, 2)).toBe(1)
  expect(truocTrongThuTuTab(ds, 1)).toBe(0)
  expect(truocTrongThuTuTab(ds, 0)).toBe(-1)
})
test('truocTrongThuTuTab: tabIndex dương đi trước (tăng dần, cùng số giữ thứ tự DOM), rồi mới tới tabIndex 0', () => {
  // thứ tự Tab: 3 (ti 1) → 1 (ti 2) → 4 (ti 2) → 0 → 2
  const ds = [{ tabIndex: 0 }, { tabIndex: 2 }, { tabIndex: 0 }, { tabIndex: 1 }, { tabIndex: 2 }]
  expect(truocTrongThuTuTab(ds, 3)).toBe(-1)
  expect(truocTrongThuTuTab(ds, 1)).toBe(3)
  expect(truocTrongThuTuTab(ds, 4)).toBe(1)
  expect(truocTrongThuTuTab(ds, 0)).toBe(4)
  expect(truocTrongThuTuTab(ds, 2)).toBe(0)
})
test('truocTrongThuTuTab: đích ngoài danh sách → lỗi (không đoán)', () => {
  expect(() => truocTrongThuTuTab([{ tabIndex: 0 }], 5)).toThrow(/đích/)
})

const doDu = {
  width: '18px', fontFamily: 'Inter', fontSize: '14px', fontWeight: '400', lineHeight: '20px', letterSpacing: 'normal',
  fontFeatureSettings: 'normal', textDecorationLine: 'none', color: 'rgb(13 13 13)', backgroundColor: 'rgb(255 255 255)',
  borderTopStyle: 'none', borderTopColor: 'rgb(13 13 13)', borderBottomStyle: 'solid', borderBottomColor: 'rgb(1 2 3)',
  outlineStyle: 'none', outlineColor: 'rgb(13 13 13)',
}
test('locThuocTinh: không khai gì → giữ nguyên', () => {
  expect(locThuocTinh(doDu, {})).toEqual(doDu)
})
test('locThuocTinh boChu: bỏ thuộc tính chữ + color; màu viền/outline kiểu none → "không vẽ", kiểu khác giữ nguyên', () => {
  const r = locThuocTinh(doDu, { boChu: true })!
  for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFeatureSettings', 'textDecorationLine', 'color'])
    expect(r).not.toHaveProperty(p)
  expect(r.width).toBe('18px')
  expect(r.backgroundColor).toBe('rgb(255 255 255)')
  expect(r.borderTopColor).toBe('không vẽ')
  expect(r.borderBottomColor).toBe('rgb(1 2 3)')
  expect(r.outlineColor).toBe('không vẽ')
  expect(locThuocTinh({ ...doDu, outlineStyle: 'solid' }, { boChu: true })!.outlineColor).toBe('rgb(13 13 13)')
})
test('locThuocTinh props: chỉ giữ đúng danh sách khai; null (thiếu phần tử) giữ null', () => {
  expect(locThuocTinh(doDu, { props: ['width', 'color'] })).toEqual({ width: '18px', color: 'rgb(13 13 13)' })
  expect(locThuocTinh(null, { boChu: true })).toBeNull()
})
test('kiemCauHinh: props phải là mảng con của bộ thuộc tính đo; boChu phải là boolean', () => {
  const cfg = (k: object) => ({ khung: { artifact: '.a', ds: '#b' }, khoa: [{ khoa: 'x', artifact: '.a', ds: '#b', ...k }] })
  expect(() => kiemCauHinh(cfg({ props: ['width', 'color'] }))).not.toThrow()
  expect(() => kiemCauHinh(cfg({ boChu: true }))).not.toThrow()
  expect(() => kiemCauHinh(cfg({ props: [] }))).toThrow(/props/)
  expect(() => kiemCauHinh(cfg({ props: ['khongCo'] }))).toThrow(/props/)
  expect(() => kiemCauHinh(cfg({ boChu: 'co' }))).toThrow(/boChu/)
})
test('moTaBoDo: mỗi khoá boChu / props thành một dòng "chưa đo" nêu rõ bỏ gì', () => {
  const d = moTaBoDo({ khoa: [{ khoa: 'bat', boChu: true }, { khoa: 'nen' }, { khoa: 'cham', props: ['width', 'height'] }] })
  expect(d).toHaveLength(2)
  expect(d[0]).toMatch(/bat/)
  expect(d[0]).toMatch(/fontFamily/)
  expect(d[1]).toMatch(/cham/)
  expect(d[1]).toMatch(/width, height/)
})
