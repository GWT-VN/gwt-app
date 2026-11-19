import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const theme = readFileSync('ds/theme.css', 'utf8')
const tokens = readFileSync('ds/tokens.css', 'utf8')
const globals = readFileSync('app/globals.css', 'utf8')

// Bỏ comment để chỉ xét phần CSS thật; tách khối @theme inline khỏi phần @layer base (viền mặc định vùng DS).
const css = theme.replace(/\/\*[\s\S]*?\*\//g, '').trim()
const khoiTheme = css.match(/@theme inline \{[^{}]*\}/)?.[0] ?? ''
const conLai = css.replace(khoiTheme, '').trim()
const khoa = [...khoiTheme.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])

const SEMANTIC = [
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground',
  'muted-foreground', 'muted',
  'input', 'border', 'ring', 'destructive', 'destructive-foreground', 'popover', 'popover-foreground', 'card',
  'card-foreground',
]

test('theme.css chỉ có một khối @theme inline, khoá đúng 17 màu semantic (không khai lại background/foreground)', () => {
  expect(css.match(/@theme/g)).toHaveLength(1)
  expect([...khoa].sort()).toEqual(SEMANTIC.map((t) => `--color-${t}`).sort())
})

test('không khoá nào đè thang mặc định của Tailwind (màn cũ giữ nguyên rounded/shadow/text/màu palette)', () => {
  for (const k of khoa) {
    expect(k).not.toMatch(/^--(radius|shadow|text|spacing|font|breakpoint)/)
    expect(k).not.toMatch(
      /^--color-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/,
    )
  }
})

test('mọi var(--x) trong theme.css có --x: trong ds/tokens.css', () => {
  const bien = [...khoiTheme.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1])
  expect(bien.length).toBe(SEMANTIC.length)
  for (const b of bien) expect([b, tokens.includes(`  ${b}:`)]).toEqual([b, true])
})

test('ngoài @theme chỉ có luật viền mặc định trong vùng DS: `border` trơn lấy --border, không lấy slate-200 của app', () => {
  const vien = conLai.replace(/\s+/g, ' ')
  expect(vien).toBe(
    '@layer base { [data-ds="v2"] *, [data-ds="v2"] ::before, [data-ds="v2"] ::after, [data-ds="v2"] ::backdrop, [data-ds="v2"] ::file-selector-button { border-color: var(--border); } }',
  )
})

test('globals.css nạp CSS DS: tokens vào layer base ngay sau tailwindcss (utility đè được .ds-*), rồi theme', () => {
  const dong = globals.split(/\r?\n/).map((d) => d.trim())
  const i = dong.indexOf('@import "tailwindcss";')
  expect(i).toBeGreaterThanOrEqual(0)
  expect(dong[i + 1]).toMatch(/^@import "\.\.\/ds\/tokens\.css" layer\(base\);/)
  expect(dong[i + 2]).toMatch(/^@import "\.\.\/ds\/theme\.css";/)
})
