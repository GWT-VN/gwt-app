// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { laMac, laOGo, laPhimMoLenh, usePhimTat } from './phim-tat'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

/** Bắn keydown thật lên phần tử (nổi tới window như trình duyệt). */
function bam(el: Element, key: string, o: KeyboardEventInit & { isComposing?: boolean } = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...o })
  el.dispatchEvent(e)
  return e
}

function vung(html = '<div tabindex="0" id="dong"></div>') {
  const v = document.createElement('div')
  v.innerHTML = html
  document.body.append(v)
  return v
}

describe('laOGo', () => {
  test('ô gõ chữ → true; checkbox, nút, div → false', () => {
    const v = vung(
      '<input id="a"><input id="cb" type="checkbox"><textarea id="t"></textarea><select id="s"></select><div id="ce" contenteditable="true"><span id="trong"></span></div><button id="b"></button><div id="d"></div>',
    )
    const q = (id: string) => v.querySelector('#' + id)
    expect(laOGo(q('a'))).toBe(true)
    expect(laOGo(q('t'))).toBe(true)
    expect(laOGo(q('s'))).toBe(true)
    expect(laOGo(q('trong'))).toBe(true)
    expect(laOGo(q('cb'))).toBe(false)
    expect(laOGo(q('b'))).toBe(false)
    expect(laOGo(q('d'))).toBe(false)
    expect(laOGo(null)).toBe(false)
  })
})

describe('usePhimTat', () => {
  test("'p' bắn và chặn mặc định", () => {
    const p = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ p }))
    const e = bam(v.querySelector('#dong')!, 'p')
    expect(p).toHaveBeenCalledTimes(1)
    expect(e.defaultPrevented).toBe(true)
  })

  test("'p' gõ trong <input> không bắn", () => {
    const p = vi.fn()
    const v = vung('<input id="o">')
    renderHook(() => usePhimTat({ p }))
    const e = bam(v.querySelector('#o')!, 'p')
    expect(p).not.toHaveBeenCalled()
    expect(e.defaultPrevented).toBe(false)
  })

  test("'p' khi bộ gõ đang ghép chữ (isComposing / phím Process) không bắn", () => {
    const p = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ p }))
    bam(v.querySelector('#dong')!, 'p', { isComposing: true })
    bam(v.querySelector('#dong')!, 'Process')
    expect(p).not.toHaveBeenCalled()
  })

  test("'shift+d' bắn với Shift; 'd' không bắn khi có Shift", () => {
    const d = vi.fn()
    const shiftD = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ d, 'shift+d': shiftD }))
    bam(v.querySelector('#dong')!, 'D', { shiftKey: true })
    expect(shiftD).toHaveBeenCalledTimes(1)
    expect(d).not.toHaveBeenCalled()
  })

  test("Ctrl+P / Alt+P / ⌘P không bắn 'p'", () => {
    const p = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ p }))
    const el = v.querySelector('#dong')!
    bam(el, 'p', { ctrlKey: true })
    bam(el, 'p', { altKey: true })
    bam(el, 'p', { metaKey: true })
    expect(p).not.toHaveBeenCalled()
  })

  test("'mod+k' = Ctrl+K ngoài Mac (⌘K trên Mac)", () => {
    const k = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ 'mod+k': k }))
    bam(v.querySelector('#dong')!, 'k', laMac() ? { metaKey: true } : { ctrlKey: true })
    expect(k).toHaveBeenCalledTimes(1)
  })

  test('có `vung` → chỉ bắn khi focus nằm trong vùng', () => {
    const p = vi.fn()
    const trong = vung()
    const ngoai = vung('<div tabindex="0" id="ngoai"></div>')
    const ref = { current: trong as HTMLElement | null }
    renderHook(() => usePhimTat({ p }, { vung: ref }))
    bam(ngoai.querySelector('#ngoai')!, 'p')
    expect(p).not.toHaveBeenCalled()
    bam(trong.querySelector('#dong')!, 'p')
    expect(p).toHaveBeenCalledTimes(1)
  })

  test('lớp khác đã preventDefault (overlay) → không bắn; `bat: false` → không bắn', () => {
    const p = vi.fn()
    const v = vung()
    const { rerender } = renderHook(({ bat }) => usePhimTat({ p }, { bat }), { initialProps: { bat: true } })
    const el = v.querySelector('#dong')!
    el.addEventListener('keydown', (e) => e.preventDefault(), { once: true })
    bam(el, 'p')
    expect(p).not.toHaveBeenCalled()
    rerender({ bat: false })
    bam(el, 'p')
    expect(p).not.toHaveBeenCalled()
  })

  test('phím mũi tên đặt tên thường: arrowdown', () => {
    const xuong = vi.fn()
    const v = vung()
    renderHook(() => usePhimTat({ arrowdown: xuong }))
    bam(v.querySelector('#dong')!, 'ArrowDown')
    expect(xuong).toHaveBeenCalledTimes(1)
  })
})

describe('laPhimMoLenh (giữ hành vi cũ)', () => {
  test('Ctrl+K ngoài Mac', () => {
    expect(laPhimMoLenh({ key: 'k', ctrlKey: true, metaKey: false, altKey: false, shiftKey: false }, false)).toBe(true)
  })
})
