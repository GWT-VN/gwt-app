import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Alert, AlertActions, AlertDescription, AlertTitle } from './alert'

const theGoc = (h: string) => h.match(/^<[^>]*>/)?.[0] ?? ''
const lop = (h: string) =>
  (theGoc(h).match(/class="([^"]*)"/)?.[1] ?? '').replaceAll('&amp;', '&').replaceAll('&gt;', '>').split(' ')

test('mặc định: <div role="status"> data-color secondary; khung bundle.css .ui-alert', () => {
  const h = renderToStaticMarkup(<Alert>x</Alert>)
  const goc = theGoc(h)
  expect(goc).toMatch(/^<div/)
  expect(goc).toContain('role="status"')
  expect(goc).toContain('data-slot="alert"')
  expect(goc).toContain('data-color="secondary"')
  // grid 16px 1fr auto · column-gap 12 · start · padding alert-gutter · radius-xl · 14/20 · foreground
  expect(lop(h)).toEqual(
    expect.arrayContaining([
      'grid',
      'grid-cols-[16px_1fr_auto]',
      'gap-x-3',
      'items-start',
      'p-(--alert-gutter)',
      'rounded-(--radius-xl)',
      'text-[14px]',
      'leading-[20px]',
      'text-foreground',
      'border-none',
      'border-current',
      // secondary = rule gốc .ui-alert (primary-surface), icon muted-foreground
      'bg-(--color-background-primary-surface)',
      '[box-shadow:inset_0_0_0_1px_var(--color-border-primary-surface)]',
      '[&>svg]:text-muted-foreground',
    ]),
  )
})

test('color="danger" → role="alert"; role truyền vào luôn thắng', () => {
  expect(theGoc(renderToStaticMarkup(<Alert color="danger">x</Alert>))).toContain('role="alert"')
  expect(theGoc(renderToStaticMarkup(<Alert color="danger" role="status">x</Alert>))).toContain('role="status"')
  expect(theGoc(renderToStaticMarkup(<Alert color="info" role="alert">x</Alert>))).toContain('role="alert"')
})

test('4 màu: nền <màu>-surface + inset <màu>-surface, icon color-text-<màu>; không còn primary-surface', () => {
  for (const color of ['info', 'success', 'warning', 'danger'] as const) {
    const c = lop(renderToStaticMarkup(<Alert color={color}>x</Alert>))
    expect(c).toEqual(
      expect.arrayContaining([
        `bg-(--color-background-${color}-surface)`,
        `[box-shadow:inset_0_0_0_1px_var(--color-border-${color}-surface)]`,
        `[&>svg]:text-(--color-text-${color})`,
        'text-[14px]', // tailwind-merge không nuốt cỡ chữ
        'text-foreground',
      ]),
    )
    expect(c).not.toContain('bg-(--color-background-primary-surface)')
    expect(c).not.toContain('[&>svg]:text-muted-foreground')
  }
})

test('icon mặc định theo màu (Phosphor 16px, aria-hidden); icon truyền vào thay thế', () => {
  const icon = (h: string) => h.match(/<svg[^>]*>/)?.[0] ?? ''
  for (const color of ['secondary', 'info', 'success', 'warning', 'danger'] as const) {
    const s = icon(renderToStaticMarkup(<Alert color={color}>x</Alert>))
    expect(s).toContain('width="16"')
    expect(s).toContain('height="16"')
    expect(s).toContain('aria-hidden="true"')
  }
  // mỗi màu một hình khác: secondary/info cùng Info, còn lại khác nhau
  const ve = (color: 'secondary' | 'info' | 'success' | 'warning' | 'danger') =>
    renderToStaticMarkup(<Alert color={color}>x</Alert>).match(/<svg[\s\S]*<\/svg>/)?.[0]
  expect(ve('secondary')).toBe(ve('info'))
  expect(new Set([ve('info'), ve('success'), ve('warning'), ve('danger')]).size).toBe(4)
  const h = renderToStaticMarkup(<Alert icon={<i data-icon="rieng" />}>x</Alert>)
  expect(h).toContain('data-icon="rieng"')
  expect(h).not.toContain('<svg')
  // icon tự truyền vào cũng là trang trí → tự gắn aria-hidden
  expect(h.match(/<i [^>]*>/)?.[0]).toContain('aria-hidden="true"')
  // Alert luôn có icon: null/false không qua được kiểu
  // @ts-expect-error icon phải là ReactElement
  renderToStaticMarkup(<Alert icon={null}>x</Alert>)
  // hộp icon: 16px + lệch xuống 2px (bundle .ui-alert > .ui-icon margin-top: 2px)
  expect(lop(renderToStaticMarkup(<Alert>x</Alert>))).toEqual(
    expect.arrayContaining(['[&>svg]:size-4', '[&>svg]:mt-[2px]', '[&>svg]:shrink-0']),
  )
})

test('AlertTitle 600 · AlertDescription foreground · cùng cột chữ (cột 2)', () => {
  const t = renderToStaticMarkup(<AlertTitle>Đã lưu</AlertTitle>)
  expect(theGoc(t)).toContain('data-slot="alert-title"')
  expect(lop(t)).toEqual(expect.arrayContaining(['font-semibold', 'col-start-2']))
  const d = renderToStaticMarkup(<AlertDescription>Mô tả</AlertDescription>)
  expect(theGoc(d)).toContain('data-slot="alert-description"')
  expect(lop(d)).toEqual(expect.arrayContaining(['text-foreground', 'col-start-2']))
})

test('AlertActions nằm bên phải: cột 3 (auto) của grid, giữa dọc, flex gap 8', () => {
  const h = renderToStaticMarkup(
    <AlertActions>
      <button>Xem</button>
    </AlertActions>,
  )
  expect(theGoc(h)).toContain('data-slot="alert-actions"')
  // tương đương ml-auto: cột cuối `auto` của grid-cols-[16px_1fr_auto] → luôn sát mép phải
  expect(lop(h)).toEqual(
    expect.arrayContaining(['col-start-3', 'row-start-1', 'row-span-2', 'self-center', 'flex', 'gap-2']),
  )
})

test('className gộp qua cn; không reset font-feature-settings', () => {
  const c = lop(renderToStaticMarkup(<Alert className="p-2">x</Alert>))
  expect(c).toContain('p-2')
  expect(c).not.toContain('p-(--alert-gutter)')
  expect(c.some((x) => x.includes('font-feature-settings'))).toBe(false)
})
