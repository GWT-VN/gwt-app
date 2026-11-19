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
  // bundle.css (body): font-feature-settings "cv11", "ss03" — a một tầng, kế thừa xuống nút (preflight: inherit).
  expect(goc).toContain('[font-feature-settings:&quot;cv11&quot;,&quot;ss03&quot;]')
  expect(h).toMatch(/<p>nội dung<\/p><div data-ds-portal=""><\/div><\/div>$/)
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
