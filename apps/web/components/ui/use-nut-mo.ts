'use client'

import { useState } from 'react'

/**
 * Phần tử sẽ nhận lại focus khi overlay đóng = phần tử đang focus lúc overlay MỞ. Mở từ một mục menu (DropdownMenu,
 * ContextMenu): mục đó bị gỡ khỏi DOM ngay khi menu đóng → đổi sang nút/dòng đã mở menu — DropdownMenu: `id` trong
 * `aria-labelledby` của khung menu (Radix gắn = id trigger); ContextMenu: `data-trigger-id` (DS gắn, context-menu.tsx).
 */
function timNutMo(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const a = document.activeElement
  if (!(a instanceof HTMLElement) || a === document.body) return null
  const menu = a.closest('[role="menu"]')
  if (!menu) return a
  const id = menu.getAttribute('data-trigger-id') ?? menu.getAttribute('aria-labelledby')
  return (id && document.getElementById(id)) || a
}

/**
 * Focus mở/đóng dùng chung cho DialogContent, SheetContent, AlertDialogContent (→ ConfirmDialog). Gọi trong component
 * CHỈ mount khi overlay mở (con trực tiếp của Portal Radix — Portal bọc mỗi con trong Presence theo `open`) → khởi tạo
 * lười của useState chạy đúng lúc mở, kể cả mount sẵn `open` (không cần cạnh false→true), TRƯỚC khi focus kịp dời (Radix
 * dời focus trong effect, `autoFocus` của React lúc commit).
 * - Mở: phần tử con mang `data-autofocus` nhận focus (nếu có) — qua `onOpenAutoFocus` chính thức của Radix.
 * - Đóng: focus về phần tử đã mở nếu nó CÒN trong DOM. Không còn (hoặc không có) → không preventDefault, để Radix tự lo
 *   (Dialog/AlertDialog: về Trigger nếu có; không thì trình duyệt thả về body) — không bao giờ focus một node chết.
 * Handler của bên gọi chạy TRƯỚC; bên gọi preventDefault thì hook không làm gì.
 */
export function useNutMo({
  onOpenAutoFocus,
  onCloseAutoFocus,
}: {
  onOpenAutoFocus?: (e: Event) => void
  onCloseAutoFocus?: (e: Event) => void
}) {
  const [nut] = useState(timNutMo)
  return {
    onOpenAutoFocus(e: Event) {
      onOpenAutoFocus?.(e)
      if (e.defaultPrevented || !(e.target instanceof Element)) return
      const dich = e.target.querySelector<HTMLElement>('[data-autofocus]')
      if (dich) {
        e.preventDefault()
        dich.focus({ preventScroll: true })
      }
    },
    onCloseAutoFocus(e: Event) {
      onCloseAutoFocus?.(e)
      if (e.defaultPrevented || !nut?.isConnected) return
      e.preventDefault()
      nut.focus({ preventScroll: true })
    },
  }
}
