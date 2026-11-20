import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { Count, CountNeo } from './count'

test('Count: 0 → không render; 3 → "3"; 12 → "9+"; luôn aria-hidden', () => {
  expect(renderToStaticMarkup(<Count so={0} />)).toBe('')
  const ba = renderToStaticMarkup(<Count so={3} />)
  expect(ba).toMatch(/^<span[^>]*aria-hidden="true"[^>]*>3<\/span>$/)
  expect(renderToStaticMarkup(<Count so={12} />)).toMatch(/>9\+<\/span>$/)
})

test('Count: viền tách icon theo biến --ui-count-ring (mặc định màu nền), góc trên phải lệch −2px', () => {
  const h = renderToStaticMarkup(<Count so={3} />)
  expect(h).toContain('var(--ui-count-ring,var(--background))')
  expect(h).toContain('-top-0.5')
  expect(h).toContain('-right-0.5')
})

test('CountNeo: bọc position relative, inline-flex', () => {
  const h = renderToStaticMarkup(<CountNeo>x</CountNeo>)
  expect(h).toMatch(/^<span[^>]*class="[^"]*relative[^"]*inline-flex/)
})
