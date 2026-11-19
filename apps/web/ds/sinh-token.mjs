// Sinh ds/tokens.css từ ds/nguon/tokens.css (bản biên dịch của artifact): đưa token vào vùng [data-ds="v2"].
// Chạy: node ds/sinh-token.mjs (cwd apps/web)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const DAU = '/* Sinh từ ds/nguon/tokens.css (artifact bản 26) bằng ds/sinh-token.mjs — KHÔNG sửa tay */\n'

export function sinhToken(cssNguon) {
  return (
    DAU +
    cssNguon
      .replace(/^\/\*.*\*\/\n/, '') // dòng đầu của nguồn ("generated from tokens.json")
      .replace(/ \/\*.*\*\/$/gm, '') // comment cuối dòng
      .replace(/^:root, \[data-theme="light"\] \{$/gm, '[data-ds="v2"] {')
      .replace(/^\[data-theme="dark"\] \{$/gm, '[data-ds="v2"][data-theme="dark"] {')
      .replace(/^:root \{$/gm, '[data-ds="v2"] {')
      .replace(/^\.([a-z0-9-]+) \{$/gm, '[data-ds="v2"] .ds-$1 {')
      .replace(/^( {2}--font-sans: )/m, '$1var(--font-inter), ')
  )
}

// Chạy trực tiếp → ghi đè ds/tokens.css (đường dẫn tính theo vị trí script, không phụ thuộc cwd).
if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? '')) {
  const nguon = readFileSync(new URL('nguon/tokens.css', import.meta.url), 'utf8')
  writeFileSync(new URL('tokens.css', import.meta.url), sinhToken(nguon))
}
