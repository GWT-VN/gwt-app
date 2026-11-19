import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Avatar, AvatarFallback, chuCaiDau } from './avatar'
import { Kbd, KbdGroup } from './kbd'

const theGoc = (h: string) => h.match(/^<[^>]*>/)?.[0] ?? ''
const lop = (h: string) => (theGoc(h).match(/class="([^"]*)"/)?.[1] ?? '').split(' ')

test('chuCaiDau: chữ đầu của từ đầu + từ cuối, bỏ tiền tố anh/chị/em, viết hoa, giữ dấu', () => {
  expect(chuCaiDau('chị Nguyễn Thu Hiền')).toBe('NH')
  expect(chuCaiDau('Anh Trần Văn Tùng')).toBe('TT')
  expect(chuCaiDau('EM kim')).toBe('K')
  expect(chuCaiDau('Hiền')).toBe('H')
  expect(chuCaiDau('đức anh')).toBe('ĐA')
  expect(chuCaiDau('  Lê   Ánh  ')).toBe('LÁ')
  expect(chuCaiDau('  ')).toBe('')
  expect(chuCaiDau('chị')).toBe('C') // chỉ có tiền tố → giữ lại, không ra rỗng
})

test('Avatar mặc định: <span> 22px pill, nền alpha-08, chữ gray-600 10px 600, fallback render chữ', () => {
  const h = renderToStaticMarkup(
    <Avatar>
      <AvatarFallback>H</AvatarFallback>
    </Avatar>,
  )
  const goc = theGoc(h)
  expect(goc).toMatch(/^<span/)
  expect(goc).toContain('data-slot="avatar"')
  expect(goc).toContain('data-size="default"')
  // bundle.css .ui-avatar: control-size-3xs · radius-full · alpha-08 · gray-600 · 600 10px · letter-spacing 0.02em
  expect(lop(h)).toEqual(
    expect.arrayContaining([
      'inline-grid',
      'place-content-center',
      'shrink-0',
      'size-(--control-size-3xs)',
      'rounded-(--radius-full)',
      'bg-(--alpha-08)',
      'text-(--gray-600)',
      'text-[10px]',
      'font-semibold',
      'tracking-[0.02em]',
      'leading-[20px]', // artifact kế thừa line-height 20px của body bundle.css; vùng DS không có → ghi tường minh
      'border-none',
      'border-current',
    ]),
  )
  expect(h).toContain('>H</span>')
})

test('Avatar size="sm": data-size="sm", 20px, line-height 14px, cỡ chữ vẫn 10px', () => {
  const h = renderToStaticMarkup(
    <Avatar size="sm">
      <AvatarFallback>TT</AvatarFallback>
    </Avatar>,
  )
  expect(theGoc(h)).toContain('data-size="sm"')
  const c = lop(h)
  expect(c).toEqual(expect.arrayContaining(['size-5', 'leading-[14px]', 'text-[10px]', 'text-(--gray-600)']))
  expect(c).not.toContain('size-(--control-size-3xs)')
  expect(c).not.toContain('leading-[20px]')
  expect(h).toContain('TT')
})

test('Kbd: <kbd> 20px, padding 0 4, radius-xs, viền inset alpha-12, 12px 500 muted, ẩn trên cảm ứng', () => {
  const h = renderToStaticMarkup(<Kbd>Ctrl</Kbd>)
  const goc = theGoc(h)
  expect(goc).toMatch(/^<kbd/)
  expect(goc).toContain('data-slot="kbd"')
  expect(lop(h)).toEqual(
    expect.arrayContaining([
      'inline-grid',
      'place-content-center',
      'min-w-5',
      'h-5',
      'px-1',
      'rounded-(--radius-xs)',
      'bg-background',
      '[box-shadow:inset_0_0_0_1px_var(--alpha-12)]',
      'text-muted-foreground',
      'font-[family-name:var(--font-sans)]',
      'font-medium',
      'text-[12px]',
      'leading-none',
      '[font-feature-settings:inherit]', // preflight đặt <kbd> về normal; bundle.css .ui-kbd ghi inherit
      'border-none',
      'border-current',
      'pointer-coarse:hidden',
    ]),
  )
  expect(h).toContain('>Ctrl</kbd>')
})

test('KbdGroup: <span> inline-flex gap 4px (như .ui-command-foot > span)', () => {
  const h = renderToStaticMarkup(
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>,
  )
  expect(theGoc(h)).toMatch(/^<span[^>]*data-slot="kbd-group"/)
  expect(lop(h)).toEqual(expect.arrayContaining(['inline-flex', 'items-center', 'gap-1']))
  expect(h.match(/<kbd/g)).toHaveLength(2)
})
