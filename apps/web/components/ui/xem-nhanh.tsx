'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { xnDau, xnKhung, xnMa, xnNoiDungNhuong, xnThan, xnThe } from './data-view-styles'

/** Phím thuộc ô gõ / menu / hộp đang mở — không lật bản ghi (prototype: input, textarea, [role=menu]). */
const BO_QUA = 'input, textarea, select, [contenteditable="true"], [role="menu"], [role="listbox"], [role="dialog"]'

/**
 * XemNhanh — khung "thẻ xem nhanh" bên phải màn dữ liệu (README DataViewToolbar: bật nút xem nhanh → bấm bản ghi mở thẻ
 * bên phải; prototype `XemNhanh`). Bọc nội dung màn (`children`); có `the` → thẻ nổi 440 bám phải khung chứa và nội
 * dung NHƯỜNG chỗ (≥ 768 lề phải 456) — thẻ không che bảng. < 768: thẻ phủ kín khung.
 * - Đầu thẻ: mã · dòng phụ · ‹ › (bản ghi trước / sau) · ✕. Thân = `the.noiDung`; trống → chú "chưa chốt" (nội dung thẻ
 *   từng màn tự dựng từ DS: Alert · PropertyList · Timeline — chưa chốt chung).
 * - Phím khi thẻ mở: ↑/k trước, ↓/j sau, Esc đóng. Bỏ qua khi đang gõ trong ô / trong menu / hộp, có Ctrl/⌘/Alt (Ctrl+K…),
 *   hoặc phím đã bị xử lý (`defaultPrevented` — ←→ của Tabs/ToggleGroup, Esc đóng popover của Radix).
 * - Không tự giữ state: bên gọi giữ bản ghi đang xem (thường là tham số URL) và truyền `the`.
 */
export function XemNhanh({
  the,
  onDong,
  onTruoc,
  onSau,
  className,
  children,
}: {
  the: { ma: string; phu?: ReactNode; noiDung?: ReactNode } | null
  onDong: () => void
  /** Không truyền = đang ở bản ghi đầu (nút ‹ tắt). */
  onTruoc?: () => void
  onSau?: () => void
  className?: string
  children: ReactNode
}) {
  const ham = useRef({ onDong, onTruoc, onSau })
  useEffect(() => {
    ham.current = { onDong, onTruoc, onSau }
  })
  const mo = the != null
  useEffect(() => {
    if (!mo) return
    const k = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as Element | null)?.closest?.(BO_QUA)) return
      const h = ham.current
      if (e.key === 'Escape') h.onDong()
      else if ((e.key === 'ArrowDown' || e.key === 'j') && h.onSau) {
        e.preventDefault()
        h.onSau()
      } else if ((e.key === 'ArrowUp' || e.key === 'k') && h.onTruoc) {
        e.preventDefault()
        h.onTruoc()
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [mo])

  return (
    <div data-slot="xem-nhanh-khung" className={cn(xnKhung, className)}>
      <div className={cn('border-none border-current', mo && xnNoiDungNhuong)}>{children}</div>
      {the && (
        <aside data-slot="xem-nhanh" aria-label={`Xem nhanh ${the.ma}`} className={xnThe}>
          <div className={xnDau}>
            <span className={xnMa}>{the.ma}</span>
            {the.phu && <span className={cn(xnMa, 'min-w-0 truncate')}>· {the.phu}</span>}
            <span aria-hidden="true" className="flex-1 border-none border-current" />
            <Button variant="ghost" size="icon-sm" aria-label="Bản ghi trước (↑)" disabled={!onTruoc} onClick={onTruoc}>
              <CaretLeft aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Bản ghi sau (↓)" disabled={!onSau} onClick={onSau}>
              <CaretRight aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Đóng xem nhanh (Esc)" onClick={onDong}>
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className={xnThan}>
            {the.noiDung ?? (
              <p className="m-0 border-none border-current text-[12px] leading-[18px] text-muted-foreground">
                Nội dung thẻ xem nhanh chưa chốt — màn tự dựng từ DS (Alert · PropertyList · Timeline).
              </p>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
