import { useEffect, type RefObject } from 'react'

/**
 * Phím tắt mở CommandPalette — hàm thuần (không 'use client'): Mac dùng ⌘K, máy khác Ctrl+K.
 * Mac KHÔNG nhận Ctrl+K: trong ô nhập macOS đó là "xoá tới cuối dòng" (prototype TimToanCuc).
 * Cuối file: `laOGo` + hook `usePhimTat` (phím tắt theo vùng, R15) — file import `useEffect` nên chỉ client component
 * import được (mọi chỗ dùng hiện tại đều 'use client').
 */

type NavigatorNenTang = { platform?: string; userAgentData?: { platform?: string } }

/** Nền tảng Apple (macOS, iPadOS, iOS)? Đọc `userAgentData.platform` (Chromium) rồi `navigator.platform`. */
export function laMac(nav: NavigatorNenTang | undefined = typeof navigator === 'undefined' ? undefined : navigator): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(nav?.userAgentData?.platform || nav?.platform || '')
}

/** Chữ trên phím theo nền tảng (mỗi phần tử một `Kbd`). */
export function phimMoLenh(mac: boolean): string[] {
  return mac ? ['⌘', 'K'] : ['Ctrl', 'K']
}

/** Sự kiện phím có phải phím mở lệnh? Bộ gõ đang ghép chữ, kèm Alt/Shift, hay sai phím bổ trợ của nền tảng → không. */
export function laPhimMoLenh(
  e: { key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; isComposing?: boolean },
  mac: boolean,
): boolean {
  if (e.isComposing || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return false
  return mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey
}

/** Ô đang gõ chữ (input chữ, textarea, select, contenteditable)? Checkbox/radio không tính — phím tắt vẫn chạy trên đó. */
export function laOGo(el: Element | null): boolean {
  return !!el?.closest?.(
    'input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=""], [contenteditable="true"]',
  )
}

/** Khoá phím chuẩn: bổ trợ theo thứ tự cố định `mod+alt+shift+<phím>`, chữ thường (vd `'shift+d'`, `'mod+k'`, `'arrowdown'`). */
function chuanKhoa(k: string): string {
  const phan = k.toLowerCase().split('+')
  const phim = phan.pop()!
  return [...['mod', 'ctrl', 'meta', 'alt', 'shift'].filter((m) => phan.includes(m)), phim].join('+')
}

function khoaSuKien(e: KeyboardEvent, mac: boolean): string {
  // mod = ⌘ trên Mac, Ctrl máy khác; phím bổ trợ còn lại giữ tên riêng → không khớp khoá nào không khai nó.
  const mod = mac ? e.metaKey : e.ctrlKey
  const thua = mac ? e.ctrlKey && 'ctrl' : e.metaKey && 'meta'
  return [mod && 'mod', thua, e.altKey && 'alt', e.shiftKey && 'shift', e.key.toLowerCase()].filter(Boolean).join('+')
}

/**
 * Phím tắt theo vùng (R15). `ban`: khoá → hàm, vd `{ p: …, 'shift+d': …, arrowdown: … }`. Nghe ở `window` pha nổi (như
 * Esc của `bang/ChonDong`) → lớp đã xử lý phím (`preventDefault`: menu, hộp Radix…) thắng. Chỉ bắn khi focus nằm trong
 * `vung` (không có `vung` → cả trang); bỏ qua ô đang gõ chữ, bộ gõ đang ghép chữ (IME: `isComposing`, phím `Process`), và
 * phím bổ trợ không khai trong khoá. Bắn thì `preventDefault`. Phải gọi từ client component.
 */
export function usePhimTat(
  ban: Record<string, (e: KeyboardEvent) => void>,
  opts: { vung?: RefObject<HTMLElement | null>; bat?: boolean } = {},
) {
  const { vung, bat = true } = opts
  useEffect(() => {
    if (!bat) return
    const mac = laMac()
    const theoKhoa = new Map(Object.entries(ban).map(([k, f]) => [chuanKhoa(k), f]))
    const nghe = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.key === 'Process' || e.keyCode === 229) return
      const t = e.target instanceof Element ? e.target : null
      if (laOGo(t)) return
      if (vung && !(t && vung.current?.contains(t))) return
      const f = theoKhoa.get(khoaSuKien(e, mac))
      if (!f) return
      e.preventDefault()
      f(e)
    }
    window.addEventListener('keydown', nghe)
    return () => window.removeEventListener('keydown', nghe)
  }, [ban, vung, bat])
}
