import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Button } from './button'
import { Spinner } from './spinner'

// Thẻ mở của phần tử gốc + danh sách class của nó.
const theGoc = (h: string) => h.match(/^<[^>]*>/)?.[0] ?? ''
const lop = (h: string) => (theGoc(h).match(/class="([^"]*)"/)?.[1] ?? '').split(' ')

test('Button mặc định: <button> pill 32px, data-variant/size/shape mặc định', () => {
  const h = renderToStaticMarkup(<Button>Lưu</Button>)
  const goc = theGoc(h)
  expect(goc).toMatch(/^<button/)
  expect(goc).toContain('data-variant="default"')
  expect(goc).toContain('data-size="default"')
  expect(goc).toContain('data-shape="pill"')
  // bundle.css: border-radius var(--radius-full) (9999px) — không dùng rounded-full của Tailwind (calc(infinity*1px)).
  expect(lop(h)).toEqual(
    expect.arrayContaining(['rounded-(--radius-full)', 'h-(--control-size-md)', 'px-[calc(var(--control-gutter-md)*1.33)]']),
  )
  expect(h).toContain('>Lưu</button>')
})

test('outline: viền inset 1px --input; hover viền + nền theo bundle.css', () => {
  const c = lop(renderToStaticMarkup(<Button variant="outline">x</Button>))
  expect(c).toEqual(
    expect.arrayContaining([
      '[box-shadow:inset_0_0_0_1px_var(--input)]',
      'not-disabled:not-aria-disabled:hover:[box-shadow:inset_0_0_0_1px_var(--color-border-primary-outline-hover)]',
      'focus-visible:-outline-offset-1',
      'disabled:not-data-loading:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
      'disabled:not-data-loading:bg-transparent',
    ]),
  )
  // tailwind-merge bỏ nền/viền disabled chung, giữ nền trong suốt + viền disabled của outline.
  expect(c).not.toContain('disabled:not-data-loading:bg-(--color-background-disabled)')
  expect(c).not.toContain('disabled:not-data-loading:[box-shadow:none]')
  expect(c).not.toContain('focus-visible:outline-offset-2')
})

test('shape="rounded" size="sm": bo --radius-sm, padding gutter-sm (không × 1.33), không pill', () => {
  const h = renderToStaticMarkup(
    <Button shape="rounded" size="sm">
      x
    </Button>,
  )
  const c = lop(h)
  expect(theGoc(h)).toContain('data-shape="rounded"')
  expect(c).toEqual(expect.arrayContaining(['rounded-(--radius-sm)', 'px-(--control-gutter-sm)', 'h-(--control-size-sm)', 'gap-1']))
  expect(c).not.toContain('rounded-(--radius-full)')
  expect(c).not.toContain('px-[calc(var(--control-gutter-sm)*1.33)]')
  expect(c).not.toContain('gap-1.5')
})

test('size icon / icon-sm: vuông, p-0; rounded icon vẫn p-0', () => {
  const icon = lop(renderToStaticMarkup(<Button size="icon" aria-label="Thêm" />))
  expect(icon).toEqual(expect.arrayContaining(['size-(--control-size-md)', 'p-0']))
  expect(icon).not.toContain('h-(--control-size-md)')
  const r = lop(renderToStaticMarkup(<Button size="icon-sm" shape="rounded" aria-label="Thêm" />))
  expect(r).toEqual(expect.arrayContaining(['size-(--control-size-sm)', 'p-0', 'rounded-(--radius-sm)']))
})

test('link: chữ blue-500 (tối blue-300), h-auto p-0, bo radius-sm, gạch chân khi hover', () => {
  const c = lop(renderToStaticMarkup(<Button variant="link">x</Button>))
  expect(c).toEqual(
    expect.arrayContaining([
      'text-(--blue-500)',
      'in-data-[theme=dark]:text-(--blue-300)',
      'h-auto',
      'p-0',
      'rounded-(--radius-sm)',
      'not-disabled:not-aria-disabled:hover:underline',
      'not-disabled:not-aria-disabled:hover:underline-offset-[0.1em]',
    ]),
  )
  expect(c).not.toContain('h-(--control-size-md)')
})

test('ghost: nền accent khi aria-pressed/checked/expanded; destructive: vòng focus đỏ', () => {
  const g = lop(renderToStaticMarkup(<Button variant="ghost">x</Button>))
  expect(g).toEqual(expect.arrayContaining(['aria-pressed:bg-accent', 'aria-checked:bg-accent', 'aria-expanded:bg-accent']))
  const d = lop(renderToStaticMarkup(<Button variant="destructive">x</Button>))
  expect(d).toEqual(expect.arrayContaining(['bg-destructive', 'focus-visible:outline-(--color-ring-danger)']))
  // tailwind-merge phải bỏ vòng focus chung — còn sót thì thứ tự CSS quyết định màu, không chắc đỏ.
  expect(d).not.toContain('focus-visible:outline-ring')
})

test('ghost đang bật (pressed/expanded/checked/data-state=on): nền accent thắng :active như bundle.css', () => {
  const g = lop(renderToStaticMarkup(<Button variant="ghost">x</Button>))
  const active = g.filter((c) => c.includes('active:'))
  expect(active).toEqual([
    'not-disabled:not-aria-disabled:not-aria-pressed:not-aria-expanded:not-aria-checked:not-data-[state=on]:active:bg-(--color-background-primary-ghost-active)',
  ])
})

test('type mặc định "button" (không submit nhầm form); type của bên gọi thắng; asChild không gắn type', () => {
  expect(theGoc(renderToStaticMarkup(<Button>x</Button>))).toContain('type="button"')
  const submit = theGoc(renderToStaticMarkup(<Button type="submit">x</Button>))
  expect(submit).toContain('type="submit"')
  expect(submit).not.toContain('type="button"')
  const a = renderToStaticMarkup(
    <Button asChild>
      <a href="/x">Mở</a>
    </Button>,
  )
  expect(theGoc(a)).not.toContain('type=')
})

test('loading: aria-disabled (không disabled) + aria-busy + data-loading, có Spinner, chữ vẫn trong DOM (giữ bề rộng)', () => {
  const h = renderToStaticMarkup(<Button loading>Đang lưu</Button>)
  const goc = theGoc(h)
  expect(goc).not.toMatch(/ disabled=""/)
  expect(goc).toContain('aria-disabled="true"')
  expect(goc).toContain('aria-busy="true"')
  expect(goc).toContain('data-loading=""')
  expect(h).toContain('Đang lưu')
  expect(h).toContain('data-slot="spinner"')
  expect(h).toMatch(/<span class="[^"]*opacity-0[^"]*">Đang lưu<\/span>/)
})

test('không loading: không disabled, không aria-busy, không spinner', () => {
  const h = renderToStaticMarkup(<Button>x</Button>)
  expect(h).not.toContain('disabled=""')
  expect(h).not.toContain('aria-busy')
  expect(h).not.toContain('data-slot="spinner"')
})

test('asChild với <a href>: ra <a> mang class nút, không có <button', () => {
  const h = renderToStaticMarkup(
    <Button asChild variant="outline">
      <a href="/x">Mở</a>
    </Button>,
  )
  expect(h).toMatch(/^<a /)
  expect(h).toContain('href="/x"')
  expect(lop(h)).toContain('[box-shadow:inset_0_0_0_1px_var(--input)]')
  expect(h).not.toContain('<button')
})

test('className gộp qua cn (class sau thắng)', () => {
  const c = lop(renderToStaticMarkup(<Button className="h-10">x</Button>))
  expect(c).toContain('h-10')
  expect(c).not.toContain('h-(--control-size-md)')
})

test('Spinner: span aria-hidden 16px, viền 2px currentColor hở phải, quay 0.8s (giảm chuyển động 2.4s)', () => {
  const h = renderToStaticMarkup(<Spinner className="absolute" />)
  expect(h).toMatch(/^<span aria-hidden="true"/)
  expect(lop(h)).toEqual(
    expect.arrayContaining([
      'size-4',
      'rounded-(--radius-full)',
      'border-2',
      'border-current',
      'border-r-transparent',
      'animate-[spin_0.8s_linear_infinite]',
      'motion-reduce:[animation-duration:2.4s]',
      'absolute',
    ]),
  )
})

test('không reset font-feature-settings: nút kế thừa cv11/ss03 của DsRoot (CEO chốt 19/11 "bật cho đồng bộ")', () => {
  // Artifact tắt cv11/ss03 trên nút chỉ do shorthand `font:` của .ui-btn (vô tình) → ghi lyDo trong ds/so-khop/button.json.
  for (const variant of ['default', 'outline', 'ghost', 'destructive', 'link'] as const)
    expect(lop(renderToStaticMarkup(<Button variant={variant}>x</Button>)).some((c) => c.includes('font-feature-settings'))).toBe(
      false,
    )
})

test('viền như `.ui-btn { border: 0 }`: kiểu none + màu currentColor (không ăn preflight `0 solid` + màu --border chung)', () => {
  // ds/so-khop.mjs (đo borderTop*) lần chạy 2: artifact none/currentColor, DS solid/var(--border) ở cả 15 khoá.
  for (const variant of ['default', 'outline', 'link'] as const)
    expect(lop(renderToStaticMarkup(<Button variant={variant}>x</Button>))).toEqual(
      expect.arrayContaining(['border-none', 'border-current']),
    )
})
