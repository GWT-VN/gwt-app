import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import tokens from '@/ds/nguon/tokens.json'
import {
  BO_GOC,
  BONG,
  CO_CONTROL,
  KHOANG_CACH,
  MOC_MAN_HINH,
  NHOM_CHU,
  NHOM_MAU,
  chiaNhomMau,
  docMau,
  hienMau,
  nenCua,
  giai,
  nhomCua,
  tiLe,
} from './du-lieu'

const css = readFileSync('ds/tokens.css', 'utf8')
const coTrongCss = (bien: string) => css.includes(`  ${bien}:`)

test('mọi màu trong tokens.json có mặt đúng một lần trên trang Màu, giữ thứ tự JSON trong nhóm', () => {
  const tenTrang = NHOM_MAU.flatMap((n) => n.mau.map((m) => m.ten))
  const tenJson = tokens.color.tokens.map((t) => t.name)
  expect(new Set(tenTrang).size).toBe(tenTrang.length)
  expect([...tenTrang].sort()).toEqual([...tenJson].sort())
  for (const n of NHOM_MAU) {
    const viTri = n.mau.map((m) => tenJson.indexOf(m.ten))
    expect(viTri).toEqual([...viTri].sort((a, b) => a - b))
  }
})

test('mọi màu giải ra giá trị cuối (không còn tham chiếu) và có biến trong ds/tokens.css', () => {
  for (const m of NHOM_MAU.flatMap((n) => n.mau)) {
    expect([m.ten, m.sang, m.toi].join(' ')).not.toMatch(/[{}]/)
    expect([m.bien, coTrongCss(m.bien)]).toEqual([m.bien, true])
  }
})

test('giá trị giải khớp bảng ánh xạ của artifact (README mục shadcn → OpenAI)', () => {
  const tim = (ten: string) => NHOM_MAU.flatMap((n) => n.mau).find((m) => m.ten === ten)!
  expect([tim('primary').sang, tim('primary').toi]).toEqual(['#181818', '#f3f3f3'])
  expect(tim('primary').tro).toEqual({ sang: 'color-background-primary-solid', toi: 'color-background-primary-solid' })
  expect([tim('background').sang, tim('background').toi]).toEqual(['#ffffff', '#212121'])
  expect([tim('ring').sang, tim('ring').toi]).toEqual(['#0169cc', '#0285ff'])
  expect([tim('destructive').sang, tim('destructive').toi]).toEqual(['#e02e2a', '#e02e2a'])
})

test('thứ tự nhóm: semantic shadcn → thang OpenAI → cố định → color-* chung → color-* theo vai', () => {
  const id = NHOM_MAU.map((n) => n.id)
  expect(id[0]).toBe('semantic')
  expect(id.indexOf('thang-gray')).toBe(1)
  expect(id.indexOf('vai-chung')).toBeLessThan(id.indexOf('vai-primary'))
  expect(id.indexOf('co-dinh')).toBeLessThan(id.indexOf('vai-chung'))
  expect(id.at(-1)).toMatch(/^vai-/)
})

test('nhomCua: chữ phụ chung không lạc sang vai secondary; color-text-primary thuộc vai primary', () => {
  expect(nhomCua('color-text-secondary')).toBe('vai-chung')
  expect(nhomCua('color-text-secondary-soft')).toBe('vai-secondary')
  expect(nhomCua('color-text-primary')).toBe('vai-primary')
  expect(nhomCua('color-surface')).toBe('vai-chung')
  expect(nhomCua('blue-a50')).toBe('thang-blue')
  expect(nhomCua('sidebar-ring')).toBe('semantic')
  expect(nhomCua('white')).toBe('co-dinh')
})

test('giai: tham chiếu lồng nhau theo theme; tham chiếu hỏng thì ném lỗi', () => {
  const nguon = new Map([
    ['a', { name: 'a', value: { light: '#111111', dark: '#eeeeee' } }],
    ['b', { name: 'b', value: '{a}' }],
  ])
  expect(giai('{b}', 'dark', nguon)).toBe('#eeeeee')
  expect(() => giai('{khong-co}', 'light', nguon)).toThrow(/khong-co/)
  expect(chiaNhomMau([{ name: 'gray-0', value: '#ffffff' }])[0].mau[0].tro).toBeUndefined()
})

test('7 trang còn lại: mọi token có biến trong ds/tokens.css, đủ số như tokens.json', () => {
  const cap: [unknown[], unknown[]][] = [
    [KHOANG_CACH, tokens.spacing.tokens],
    [BO_GOC, tokens.radius.tokens],
    [BONG, tokens.shadow.tokens],
    [CO_CONTROL, tokens.controlSize.tokens],
    [MOC_MAN_HINH, tokens.breakpoint.tokens],
  ]
  for (const [trang, json] of cap) expect(trang.length).toBe(json.length)
  for (const t of [KHOANG_CACH, BO_GOC, BONG, CO_CONTROL, MOC_MAN_HINH].flat()) expect([t.bien, coTrongCss(t.bien)]).toEqual([t.bien, true])
  const kieu = NHOM_CHU.flatMap((n) => n.kieu)
  expect(kieu.length).toBe(tokens.type.groups.flatMap((g) => g.styles).length)
  for (const k of kieu) {
    expect([k.bien, coTrongCss(k.bien)]).toEqual([k.bien, true])
    expect(css).toContain(`.${k.lop} {`)
  }
})

test('bóng có giá trị riêng sáng/tối; tiLe ra phần trăm so với mốc lớn nhất', () => {
  const bong = BONG.find((b) => b.ten === 'shadow')!
  expect(bong.sang).not.toBe(bong.toi)
  const r = tiLe(MOC_MAN_HINH)
  expect(Math.max(...r.map((x) => x.phanTram))).toBe(100)
  expect(r.every((x) => x.phanTram > 0)).toBe(true)
})

test('mọi giá trị màu đọc được (#rrggbb hoặc rgba); hienMau ra hex hoa + % alpha', () => {
  for (const m of NHOM_MAU.flatMap((n) => n.mau)) for (const v of [m.sang, m.toi]) expect(() => docMau(v)).not.toThrow()
  expect(hienMau('rgba(13, 13, 13, 0.1)')).toEqual({ hex: '#0D0D0D', phanTram: 10 })
  expect(hienMau('#ffffff')).toEqual({ hex: '#FFFFFF' })
})

test('tương phản khớp số đo trong README artifact (mục "Độ tương phản đã đo")', () => {
  const tim = (ten: string) => NHOM_MAU.flatMap((n) => n.mau).find((m) => m.ten === ten)!.tuongPhan!
  const lam = (x: { sang: number; toi: number }) => [x.sang, x.toi].map((v) => Math.round(v * 100) / 100)
  expect(tim('foreground').nen).toBe('background')
  expect(lam(tim('foreground'))).toEqual([19.44, 16.1])
  expect(lam(tim('primary-foreground'))).toEqual([17.76, 17.52])
  expect(lam(tim('muted-foreground'))).toEqual([5.93, 8.47])
  expect(tim('color-text-danger').nen).toBe('background')
  expect(lam(tim('color-text-danger'))[1]).toBe(3.52)
  expect(tim('color-text-danger-soft').nen).toBe('color-background-danger-soft-alpha')
  expect(lam(tim('color-text-danger-soft'))).toEqual([5.03, 3.81])
  expect(lam(tim('color-text-success-soft'))).toEqual([4.05, 4.86])
})

test('nenCua: cặp nền theo tên; token không phải chữ → undefined', () => {
  const co = (t: string) => t === 'color-background-danger-soft' || t === 'color-background-info-soft' || t === 'color-background-info-soft-alpha'
  expect(nenCua('foreground', co)).toBe('background')
  expect(nenCua('sidebar-primary-foreground', co)).toBe('sidebar-primary')
  expect(nenCua('color-text-danger-soft', co)).toBe('color-background-danger-soft')
  expect(nenCua('color-text-info-soft', co)).toBe('color-background-info-soft-alpha')
  expect(nenCua('color-text-danger-outline', co)).toBe('background')
  expect(nenCua('color-text', co)).toBe('background')
  expect(nenCua('primary', co)).toBeUndefined()
  expect(nenCua('gray-500', co)).toBeUndefined()
})
