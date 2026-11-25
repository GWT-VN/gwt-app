import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { cn } from '@/lib/utils'
import { DsRoot } from './ds-root'

// Thẻ mở của phần tử gốc (div đầu tiên) — data-ds và data-theme phải nằm CÙNG phần tử này,
// vì selector tối là [data-ds="v2"][data-theme="dark"] (ds/tokens.css).
const theGoc = (h: string) => h.match(/^<div[^>]*>/)?.[0] ?? ''

test('DsRoot mặc định: vùng v2 sáng, color-scheme light, ô portal là con cuối', () => {
  const h = renderToStaticMarkup(
    <DsRoot>
      <p>nội dung</p>
    </DsRoot>,
  )
  const goc = theGoc(h)
  expect(goc).toContain('data-ds="v2"')
  expect(goc).toContain('data-theme="light"')
  expect(goc).toMatch(/style="[^"]*color-scheme:light/)
  // CEO 25/11: chỉ ss03 (dấu câu tròn) — bỏ cv11 của bundle.css để chữ a HAI tầng; kế thừa xuống nút (preflight: inherit).
  expect(goc).toContain('[font-feature-settings:&quot;ss03&quot;]')
  expect(goc).not.toContain('cv11')
  // bundle.css (body): font-size 14px · line-height 20px — tách lẻ, KHÔNG shorthand `font:` (sẽ xoá cv11/ss03).
  expect(goc).toMatch(/class="[^"]*text-\[14px\][^"]*"/)
  expect(goc).toMatch(/class="[^"]*leading-\[20px\][^"]*"/)
  expect(h).toMatch(/<p>nội dung<\/p><div data-ds-portal=""><\/div><\/div>$/)
})

test('DsRoot tự mang Inter: class biến --font-inter nằm trên CHÍNH phần tử gốc (không trông vào layout bọc ngoài)', () => {
  // tokens.css: --font-sans = var(--font-inter, …) khai trên [data-ds="v2"] → biến phải có ở cùng phần tử hoặc tổ tiên.
  const goc = theGoc(renderToStaticMarkup(<DsRoot>x</DsRoot>))
  expect(goc).toMatch(/class="[^"]*\bgia-lap--font-inter\b/)
})

test('DsRoot theme="dark": data-theme + color-scheme tối trên cùng phần tử gốc', () => {
  const goc = theGoc(renderToStaticMarkup(<DsRoot theme="dark">x</DsRoot>))
  expect(goc).toContain('data-ds="v2"')
  expect(goc).toContain('data-theme="dark"')
  expect(goc).toMatch(/style="[^"]*color-scheme:dark/)
})

test('DsRoot gộp className qua cn (class sau thắng)', () => {
  const goc = theGoc(renderToStaticMarkup(<DsRoot className="bg-muted">x</DsRoot>))
  expect(goc).toContain('bg-muted')
  expect(goc).not.toContain('bg-background')
  expect(goc).toContain('font-[family-name:var(--font-sans)]')
})

test('cn: tailwind-merge giữ class sau', () => {
  expect(cn('px-2', 'px-4')).toBe('px-4')
})
