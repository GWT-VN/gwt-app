import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { sinhToken } from './sinh-token.mjs'

const nguon = readFileSync('ds/nguon/tokens.css', 'utf8')
const ra: string = sinhToken(nguon)
const json = JSON.parse(readFileSync('ds/nguon/tokens.json', 'utf8'))

// Nội dung khối `selector {…}` đầu tiên (selector đứng riêng một dòng).
function khoi(css: string, selector: string): string {
  const dau = css.indexOf(`\n${selector} {\n`)
  if (dau < 0) throw new Error(`không thấy khối ${selector}`)
  return css.slice(dau, css.indexOf('\n}', dau + 1))
}

function giaTri(css: string, ten: string): string | null {
  const m = css.match(new RegExp(`^  --${ten}: ([^;]*);$`, 'm'))
  return m ? m[1] : null
}

// "{ten}" → var(--ten); hex/rgba giữ nguyên.
const doi = (v: string) => (v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v)

test('không còn selector :root, mọi khối nằm trong vùng DS', () => {
  expect(ra).not.toMatch(/(^|[\s,]):root\b/m)
  expect(ra).toContain('[data-ds="v2"] {')
  expect(ra).toContain('[data-ds="v2"][data-theme="dark"] {')
})

test('mọi màu theme sáng/tối trong tokens.json có mặt đúng giá trị', () => {
  const sang = khoi(ra, '[data-ds="v2"]')
  const toi = khoi(ra, '[data-ds="v2"][data-theme="dark"]')
  expect(json.color.tokens.length).toBeGreaterThan(400)
  for (const t of json.color.tokens as { name: string; value: string | { light: string; dark: string } }[]) {
    if (typeof t.value === 'object') {
      expect([t.name, giaTri(sang, t.name)]).toEqual([t.name, doi(t.value.light)])
      expect([t.name, giaTri(toi, t.name)]).toEqual([t.name, doi(t.value.dark)])
    } else {
      expect([t.name, giaTri(sang, t.name)]).toEqual([t.name, doi(t.value)])
      // Hex cố định không khai lại ở khối tối (kế thừa từ khối sáng cùng phần tử); alias thì khai lại.
      expect([t.name, giaTri(toi, t.name)]).toEqual([t.name, t.value.startsWith('{') ? doi(t.value) : null])
    }
  }
})

test('vùng sáng tự khai --background (không ăn theo :root của globals.css khi máy bật dark)', () => {
  expect(khoi(ra, '[data-ds="v2"]')).toMatch(/--background:/)
})

test('class kiểu chữ đổi tiền tố ds- (không đè .text-sm của Tailwind)', () => {
  expect(ra).toMatch(/\[data-ds="v2"\] \.ds-text-sm \{/)
  expect(ra).not.toMatch(/^\.text-sm \{/m)
})

test('--font-sans trong vùng DS là Inter', () => {
  expect(ra).toMatch(/--font-sans: var\(--font-inter\),/)
})

test('file tokens.css đã commit đúng bằng đầu ra của script (không sửa tay)', () => {
  expect(readFileSync('ds/tokens.css', 'utf8')).toBe(ra)
})
