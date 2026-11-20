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
