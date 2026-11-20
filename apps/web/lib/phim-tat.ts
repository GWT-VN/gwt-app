/**
 * Phím tắt mở CommandPalette — hàm thuần (không 'use client'): Mac dùng ⌘K, máy khác Ctrl+K.
 * Mac KHÔNG nhận Ctrl+K: trong ô nhập macOS đó là "xoá tới cuối dòng" (prototype TimToanCuc).
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
