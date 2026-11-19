/**
 * Setup cho test DOM (file mở đầu `// @vitest-environment jsdom`). Chạy cho MỌI file test nhưng chỉ làm việc khi có
 * `window` → ~1100 test môi trường node không đổi gì.
 * Polyfill: jsdom thiếu mấy API Radix gọi khi mở overlay (ResizeObserver cho Popper/Tooltip; pointer capture + scrollIntoView
 * cho Select/Menu; DOMRect cho floating-ui). Polyfill tối thiểu đủ cho Radix chạy — không giả lập bố cục (jsdom không có).
 */
import { afterEach } from 'vitest'

if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  // vitest không bật globals → RTL không tự dọn giữa các test.
  afterEach(cleanup)

  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const p = Element.prototype
  p.hasPointerCapture ??= () => false
  p.setPointerCapture ??= () => {}
  p.releasePointerCapture ??= () => {}
  p.scrollIntoView ??= () => {}
  globalThis.DOMRect ??= class DOMRect {
    constructor(
      public x = 0,
      public y = 0,
      public width = 0,
      public height = 0,
    ) {}
    get top() { return this.y }
    get left() { return this.x }
    get right() { return this.x + this.width }
    get bottom() { return this.y + this.height }
    toJSON() { return { x: this.x, y: this.y, width: this.width, height: this.height } }
    static fromRect(r: DOMRectInit = {}) { return new DOMRect(r.x, r.y, r.width, r.height) }
  } as unknown as typeof DOMRect
}
