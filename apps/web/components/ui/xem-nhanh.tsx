'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { xnDau, xnKhung, xnMa, xnNoiDungNhuong, xnThan, xnThe } from './data-view-styles'
import { useDsPortal } from './ds-root'

/**
 * Phím thuộc ô gõ / menu / hộp đang mở — không lật bản ghi (prototype: input, textarea, [role=menu]). Ô chọn dòng
 * (checkbox / radio) KHÔNG tính là ô gõ: đang đứng ở ô chọn dòng vẫn Esc đóng thẻ được (cùng ngoại lệ với ThanhDaChon).
 */
const BO_QUA =
  'input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=""], [contenteditable="true"], [role="menu"], [role="listbox"], [role="dialog"]'
/** Nghe ở pha capture nên chạy TRƯỚC widget đang focus: ↑/↓ trong widget tự dùng mũi tên thì nhường cho widget. */
const BO_QUA_MUI =
  '[role="radiogroup"], [role="tablist"], [role="toolbar"], [role="grid"], [role="tree"], [role="slider"], [role="spinbutton"], [role="combobox"], [role="menubar"]'
/**
 * Lớp Radix đang mở trong ô portal của DsRoot (menu, Select, popover, hộp, sheet: `open`; tooltip: `delayed-open` /
 * `instant-open`). Nội dung lớp chỉ được mount khi mở → không đụng phần tử thường trực.
 */
const LOP_MO = '[data-state="open"], [data-state="delayed-open"], [data-state="instant-open"]'

/**
 * XemNhanh — khung "thẻ xem nhanh" bên phải màn dữ liệu (README DataViewToolbar: bật nút xem nhanh → bấm bản ghi mở thẻ
 * bên phải; prototype `XemNhanh`). Bọc nội dung màn (`children`); có `the` → thẻ nổi 440 bám phải khung chứa và nội
 * dung NHƯỜNG chỗ (≥ 768 lề phải 456) — thẻ không che bảng. < 768: thẻ phủ kín khung.
 * - Đầu thẻ: mã · dòng phụ · ‹ › (bản ghi trước / sau) · ✕. Thân = `the.noiDung`; trống → chú "chưa chốt" (nội dung thẻ
 *   từng màn tự dựng từ DS: Alert · PropertyList · Timeline — chưa chốt chung).
 * - Phím khi thẻ mở: ↑/k trước, ↓/j sau, Esc đóng — nghe ở document pha capture và `preventDefault` phím đã dùng (Esc
 *   đóng thẻ không bỏ luôn lựa chọn dòng của ThanhDaChon). Bỏ qua khi đang gõ trong ô / trong menu / hộp, bộ gõ đang ghép
 *   chữ, có Ctrl/⌘/Alt (Ctrl+K…), hoặc phím đã bị xử lý trước (`defaultPrevented`). Esc nhường lớp trên: đang kéo
 *   (`data-dang-keo` trên body — Esc huỷ kéo) hoặc có lớp Radix đang mở (tooltip đang hiện, menu…) — listener này gắn
 *   TRƯỚC listener Esc của lớp (cùng document capture) nên phải tự nhường, không thì lớp kẹt mở.
 * - Không tự giữ state: bên gọi giữ bản ghi đang xem (thường là tham số URL) và truyền `the`.
 */
export function XemNhanh({
  the,
  onDong,
  onTruoc,
  onSau,
  coDinh,
  className,
  children,
}: {
  the: { ma: string; phu?: ReactNode; noiDung?: ReactNode } | null
  onDong: () => void
  /** Không truyền = đang ở bản ghi đầu (nút ‹ tắt). */
  onTruoc?: () => void
  onSau?: () => void
  /**
   * Thẻ bám MÀN HÌNH (`fixed`) thay vì bám khung chứa: cao hết màn và đứng yên khi cuộn. Dùng ở màn app (khung cuộn =
   * vùng nội dung sát mép phải màn) — bám khung thì trang ít dòng làm thẻ cụt giữa màn, trang dài thì thẻ trôi theo cuộn.
   * Bỏ trống ở preview/demo (thẻ phải nằm trong khung demo).
   */
  coDinh?: boolean
  className?: string
  children: ReactNode
}) {
  const ham = useRef({ onDong, onTruoc, onSau })
  useEffect(() => {
    ham.current = { onDong, onTruoc, onSau }
  })
  const mo = the != null
  const portal = useDsPortal()
  useEffect(() => {
    if (!mo) return
    const k = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as Element | null)?.closest?.(BO_QUA)) return
      const h = ham.current
      if (e.key === 'Escape') {
        if (document.body.hasAttribute('data-dang-keo') || portal?.querySelector(LOP_MO)) return
        // preventDefault: Esc này đã dùng để đóng thẻ — ThanhDaChon (escBoChon) bỏ qua phím đã xử lý, lựa chọn dòng còn.
        e.preventDefault()
        h.onDong()
      } else if ((e.target as Element | null)?.closest?.(BO_QUA_MUI)) return
      else if ((e.key === 'ArrowDown' || e.key === 'j') && h.onSau) {
        e.preventDefault()
        h.onSau()
      } else if ((e.key === 'ArrowUp' || e.key === 'k') && h.onTruoc) {
        e.preventDefault()
        h.onTruoc()
      }
    }
    // document pha CAPTURE: chạy trước ThanhDaChon (window, pha nổi) và trước handler của phần tử đang focus.
    document.addEventListener('keydown', k, true)
    return () => document.removeEventListener('keydown', k, true)
  }, [mo, portal])

  return (
    <div data-slot="xem-nhanh-khung" className={cn(xnKhung, className)}>
      <div className={cn('border-none border-current', mo && xnNoiDungNhuong)}>{children}</div>
      {the && (
        <aside data-slot="xem-nhanh" aria-label={`Xem nhanh ${the.ma}`} className={cn(xnThe, coDinh && 'fixed')}>
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
