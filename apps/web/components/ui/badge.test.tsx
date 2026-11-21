import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Badge, BadgeDot } from './badge'

const theGoc = (h: string) => h.match(/^<[^>]*>/)?.[0] ?? ''
const lop = (h: string) => (theGoc(h).match(/class="([^"]*)"/)?.[1] ?? '').split(' ')

test('Badge soft: <span> soft · secondary · sm, pill 20px, 12px semibold, nền soft-alpha', () => {
  const h = renderToStaticMarkup(<Badge variant="soft">Nháp</Badge>)
  const goc = theGoc(h)
  expect(goc).toMatch(/^<span/)
  expect(goc).toContain('data-slot="badge"')
  expect(goc).toContain('data-variant="soft"')
  expect(goc).toContain('data-color="secondary"')
  expect(goc).toContain('data-size="sm"')
  // bundle.css .ui-badge: height 20 · padding 0 7px · radius-full (không rounded-full = calc(infinity*1px)) · 600 12px/1
  expect(lop(h)).toEqual(
    expect.arrayContaining([
      'h-5',
      'px-[7px]',
      'gap-1',
      'rounded-(--radius-full)',
      'font-semibold',
      'text-[12px]',
      'leading-none',
      'bg-(--color-background-secondary-soft-alpha)',
      'text-(--color-text-secondary-soft)',
    ]),
  )
  expect(h).toContain('>Nháp</span>')
})

test('color="danger" variant="solid": data-* đúng, nền/chữ solid danger, không còn soft', () => {
  const h = renderToStaticMarkup(
    <Badge color="danger" variant="solid">
      Lỗi
    </Badge>,
  )
  const goc = theGoc(h)
  expect(goc).toContain('data-variant="solid"')
  expect(goc).toContain('data-color="danger"')
  const c = lop(h)
  expect(c).toEqual(expect.arrayContaining(['bg-(--color-background-danger-solid)', 'text-(--color-text-danger-solid)']))
  expect(c).not.toContain('bg-(--color-background-danger-soft-alpha)')
  expect(c).not.toContain('text-(--color-text-danger-soft)')
  expect(c).toContain('text-[12px]') // tailwind-merge không nuốt cỡ chữ khi gặp text-(--màu)
  expect(h).toContain('Lỗi')
})

test('6 màu soft: nền <màu>-soft-alpha + chữ <màu>-soft', () => {
  for (const color of ['secondary', 'info', 'success', 'warning', 'danger', 'discovery'] as const)
    expect(lop(renderToStaticMarkup(<Badge variant="soft" color={color}>x</Badge>))).toEqual(
      expect.arrayContaining([`bg-(--color-background-${color}-soft-alpha)`, `text-(--color-text-${color}-soft)`]),
    )
})

test('outline: nền trong suốt + viền inset 1px secondary-outline, chữ secondary-outline', () => {
  const c = lop(renderToStaticMarkup(<Badge variant="outline">Outline</Badge>))
  expect(c).toEqual(
    expect.arrayContaining([
      'bg-transparent',
      '[box-shadow:inset_0_0_0_1px_var(--color-border-secondary-outline)]',
      'text-(--color-text-secondary-outline)',
    ]),
  )
  expect(c).not.toContain('bg-(--color-background-secondary-soft-alpha)')
})

test('size md: cao control-size-3xs (22), padding gutter-2xs (6), 14px', () => {
  const h = renderToStaticMarkup(<Badge variant="soft" size="md">Cỡ md</Badge>)
  expect(theGoc(h)).toContain('data-size="md"')
  const c = lop(h)
  expect(c).toEqual(expect.arrayContaining(['h-(--control-size-3xs)', 'px-(--control-gutter-2xs)', 'text-[14px]', 'leading-none']))
  expect(c).not.toContain('h-5')
  expect(c).not.toContain('px-[7px]')
  expect(c).not.toContain('text-[12px]')
})

test('viền như span artifact: kiểu none + currentColor (không ăn preflight 0 solid --border)', () => {
  expect(lop(renderToStaticMarkup(<Badge variant="soft">x</Badge>))).toEqual(expect.arrayContaining(['border-none', 'border-current']))
})

test('BadgeDot: span aria-hidden 6px tròn, nền currentColor (màu theo badge cha); chữ badge vẫn trong DOM', () => {
  const h = renderToStaticMarkup(
    <Badge variant="soft" color="info">
      <BadgeDot />
      Đang giao
    </Badge>,
  )
  expect(h).toContain('Đang giao')
  const dot = h.match(/<span aria-hidden="true"[^>]*>/)?.[0] ?? ''
  expect(dot).toContain('data-slot="badge-dot"')
  expect(lop(dot)).toEqual(expect.arrayContaining(['size-1.5', 'rounded-(--radius-full)', 'bg-current', 'shrink-0']))
})

test('asChild: ra phần tử con mang class badge; className gộp qua cn', () => {
  const a = renderToStaticMarkup(
    <Badge variant="soft" asChild>
      <a href="/x">Mở</a>
    </Badge>,
  )
  expect(a).toMatch(/^<a /)
  expect(lop(a)).toContain('rounded-(--radius-full)')
  const c = lop(renderToStaticMarkup(<Badge variant="soft" className="h-6">x</Badge>))
  expect(c).toContain('h-6')
  expect(c).not.toContain('h-5')
})

test('không reset font-feature-settings (kế thừa cv11/ss03 của DsRoot)', () => {
  expect(lop(renderToStaticMarkup(<Badge variant="soft">x</Badge>)).some((c) => c.includes('font-feature-settings'))).toBe(false)
})

test('cascade bundle.css: solid/outline đứng sau [data-color] → solid màu không định nghĩa = xám, outline mọi màu = xám', () => {
  // bundle.css chỉ có solid+success / solid+danger; còn lại [data-variant] (cùng specificity, khai sau) thắng [data-color].
  const o = lop(renderToStaticMarkup(<Badge variant="outline" color="info">x</Badge>))
  expect(o).toEqual(
    expect.arrayContaining([
      'bg-transparent',
      '[box-shadow:inset_0_0_0_1px_var(--color-border-secondary-outline)]',
      'text-(--color-text-secondary-outline)',
    ]),
  )
  expect(o.some((c) => c.includes('info'))).toBe(false)
  const s = lop(renderToStaticMarkup(<Badge variant="solid" color="warning">x</Badge>))
  expect(s).toEqual(expect.arrayContaining(['bg-(--color-background-secondary-solid)', 'text-(--color-text-secondary-solid)']))
  expect(s.some((c) => c.includes('warning'))).toBe(false)
  const ok = lop(renderToStaticMarkup(<Badge variant="solid" color="success">x</Badge>))
  expect(ok).toEqual(expect.arrayContaining(['bg-(--color-background-success-solid)', 'text-(--color-text-success-solid)']))
  expect(ok).not.toContain('bg-(--color-background-secondary-solid)')
})

test('BadgeDot color: nền <màu>-solid (.ui-dot[data-color]); không màu = currentColor', () => {
  const h = renderToStaticMarkup(<BadgeDot color="danger" />)
  expect(theGoc(h)).toContain('data-color="danger"')
  const c = lop(h)
  expect(c).toContain('bg-(--color-background-danger-solid)')
  expect(c).not.toContain('bg-current')
  expect(theGoc(renderToStaticMarkup(<BadgeDot />))).not.toContain('data-color')
})

test('shadcn: mặc định variant="default" (nền primary đặc); đủ 6 giá trị variant của shadcn, asChild', () => {
  const goc = theGoc(renderToStaticMarkup(<Badge>Mới</Badge>))
  expect(goc).toContain('data-variant="default"')
  expect(lop(renderToStaticMarkup(<Badge>Mới</Badge>))).toEqual(expect.arrayContaining(['bg-primary', 'text-primary-foreground']))
  const nen = {
    secondary: 'bg-secondary',
    destructive: 'bg-(--color-background-danger-solid)',
    outline: 'bg-transparent',
    ghost: 'bg-transparent',
    link: 'bg-transparent',
  } as const
  for (const [variant, lopNen] of Object.entries(nen) as [keyof typeof nen, string][]) {
    const c = lop(renderToStaticMarkup(<Badge variant={variant}>x</Badge>))
    expect(c).toContain(lopNen)
    expect(c).not.toContain('bg-(--color-background-secondary-soft-alpha)')
  }
  expect(
    renderToStaticMarkup(
      <Badge variant="link" asChild>
        <a href="#x">Link</a>
      </Badge>,
    ),
  ).toMatch(/^<a[^>]*data-slot="badge"/)
})
