'use client'

import { Children, type ComponentProps } from 'react'
import { X } from '@phosphor-icons/react/ssr'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { closeBtn, desc, overlay, title } from './dialog-styles'

/**
 * Sheet — bảng cạnh phải (bộ lọc, chi tiết bản ghi). Khung shadcn (Radix Dialog), giá trị từ `.ui-overlay` /
 * `.ui-sheet*` của ds/nguon/bundle.css. Overlay, tiêu đề, mô tả, vị trí nút ✕ dùng chung dialog-styles.ts.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render gì.
 * - Radix lo: bẫy Tab, Esc / bấm overlay đóng, trả focus về trigger, khoá cuộn nền, aria-labelledby/describedby.
 * - LUÔN có `SheetTitle`. Lát này chỉ cạnh PHẢI (artifact chỉ định nghĩa `.ui-sheet` phải).
 * - Nút ✕ đứng ngay sau `SheetHeader` trong DOM như preview (header → ✕ → thân → footer) → Tab đầu tiên vào ✕.
 *   SheetContent tự chèn ✕ sau phần tử con ĐẦU TIÊN (quy ước: con đầu là SheetHeader).
 * - Không có chuyển động: bundle.css không định nghĩa animation cho `.ui-sheet` (Dialog có `ui-dialog-len`, Sheet không).
 * - Bộ lọc trong sheet vẫn ghi tham số URL (docs/CHUAN-FILTER.md) — sheet chỉ là chỗ đặt ô lọc.
 */
export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

export function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

export function SheetClose(props: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

/**
 * `.ui-sheet`: bám mép phải từ trên xuống dưới, cột flex, rộng min(384px, 100%) (shadcn `sm:max-w-sm`), nền popover,
 * `--shadow-400` + hairline. ≤640: rộng 100% (README artifact "mobile 100%"; cùng mốc `@media (max-width: 640px)` của
 * Dialog). z-70 = thang z dialog/overlay (ds/NGUON.md).
 */
const panel = [
  'fixed inset-y-0 right-0 z-70 flex flex-col',
  'w-[min(384px,100%)] [@media(max-width:640px)]:w-full',
  'border-none border-current outline-none',
  'bg-popover text-popover-foreground [box-shadow:var(--shadow-400),var(--shadow-hairline)]',
].join(' ')

export function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { side?: 'right' }) {
  const container = useDsPortal()
  if (!container) return null
  const [dau, ...con] = Children.toArray(children)
  return (
    <SheetPrimitive.Portal container={container}>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className={overlay} />
      <SheetPrimitive.Content data-slot="sheet-content" data-side={side} className={cn(panel, className)} {...props}>
        {dau}
        <SheetPrimitive.Close asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Đóng" className={closeBtn}>
            <X aria-hidden="true" />
          </Button>
        </SheetPrimitive.Close>
        {con}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

/**
 * `.ui-sheet-header`: padding 20 (phải 52 chừa nút ✕), viền DƯỚI 1px `--border`. Viền trên/trái/phải giữ `0 none
 * currentColor` như artifact (div ăn preflight `0 solid var(--border)` của app) → longhand viền dưới.
 */
export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'shrink-0 p-(--dialog-padding) pr-[52px] border-none border-current',
        '[border-bottom-style:solid] [border-bottom-width:1px] [border-bottom-color:var(--border)]',
        className,
      )}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn(title, className)} {...props} />
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn(desc, className)} {...props} />
}

/** `.ui-sheet-body`: giãn hết phần còn lại + cuộn dọc, padding 20, cột gap 16. */
export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        'flex flex-1 flex-col gap-4 overflow-y-auto p-(--dialog-padding) border-none border-current',
        className,
      )}
      {...props}
    />
  )
}

/** `.ui-sheet-footer`: căn phải, gap 8, padding 12 20, viền TRÊN 1px `--border` (các cạnh khác 0 none như artifact). */
export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'flex shrink-0 justify-end gap-2 px-(--dialog-padding) py-3 border-none border-current',
        '[border-top-style:solid] [border-top-width:1px] [border-top-color:var(--border)]',
        className,
      )}
      {...props}
    />
  )
}
