'use client'

import { useCallback, useRef, useState } from 'react'

/** Vùng chứa hẹp hơn mức này (điện thoại) → bảng danh sách đổi sang ListView 1–2 dòng (khuôn Ticket F). */
export const RONG_BANG_TOI_THIEU = 640

/**
 * Bề rộng thật của khung chứa (ResizeObserver); null trước lần đo đầu. Ref dạng callback: khung chỉ mount khi đang ở
 * dạng Bảng (đổi từ Danh sách/Kanban sang thì vẫn bắt được).
 */
export function useRongKhung() {
  const [w, setW] = useState<number | null>(null)
  const ro = useRef<ResizeObserver | null>(null)
  const ref = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect()
    if (!el) return
    ro.current = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)))
    ro.current.observe(el)
  }, [])
  return [ref, w] as const
}
