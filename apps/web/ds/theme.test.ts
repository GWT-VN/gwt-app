import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const theme = readFileSync('ds/theme.css', 'utf8')
const tokens = readFileSync('ds/tokens.css', 'utf8')
const globals = readFileSync('app/globals.css', 'utf8')

// Bỏ comment để chỉ xét phần CSS thật.
const css = theme.replace(/\/\*[\s\S]*?\*\//g, '').trim()
const khoa = [...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])

const SEMANTIC = [
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'muted-foreground', 'muted',
  'input', 'border', 'ring', 'destructive', 'destructive-foreground', 'popover', 'popover-foreground', 'card',
  'card-foreground',
]

test('theme.css chỉ có một khối @theme inline, khoá đúng 16 màu semantic (không khai lại background/foreground)', () => {
  expect(css).toMatch(/^@theme inline \{[^{}]*\}$/)
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
  const bien = [...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1])
  expect(bien.length).toBe(SEMANTIC.length)
  for (const b of bien) expect([b, tokens.includes(`  ${b}:`)]).toEqual([b, true])
})

test('globals.css nạp CSS DS', () => {
  expect(globals).toContain('@import "../ds/tokens.css";')
  expect(globals).toContain('@import "../ds/theme.css";')
})
