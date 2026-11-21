// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { useRef, type ComponentProps, type RefObject } from 'react'
import { X } from '@phosphor-icons/react/ssr'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useDsPortal } from './ds-root'
import { closeBtn, desc, overlay, title } from './dialog-styles'
import { useNutMo } from './use-nut-mo'

/**
 * Sheet — bảng cạnh (bộ lọc, chi tiết bản ghi). Khung shadcn new-york-v4 (Radix Dialog): 8 export (SheetPortal,
 * SheetOverlay nội bộ — shadcn cũng không export), `data-slot`, prop
 * `side` (top/right/bottom/left) + `showCloseButton` như shadcn; giá trị từ `.ui-overlay` / `.ui-sheet*` của
 * ds/nguon/bundle.css. Overlay, tiêu đề, mô tả, vị trí nút ✕ dùng chung dialog-styles.ts.
 * Phần GWT cộng thêm (shadcn không có):
 * - `SheetBody` (`.ui-sheet-body`: giãn + cuộn), `data-side` trên khung.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render gì. z-70 theo thang z (ds/NGUON.md).
 * - Focus khi mở: phần tử mang `data-autofocus` (use-nut-mo.ts); không có thì nút ✕ (như preview: ✕ là phần tử
 *   focus được đầu tiên). Shadcn để ✕ CUỐI panel → vòng Tab ✕ → thân → footer → ✕ giữ nguyên như preview (header → ✕ →
 *   thân). Không ✕ (`showCloseButton={false}`) → Radix focus phần tử focus được đầu tiên.
 * - Focus khi đóng: về phần tử đã mở sheet (use-nut-mo.ts — cả khi điều khiển bằng `open` không có SheetTrigger).
 * - Không có chuyển động trượt của shadcn: bundle.css không định nghĩa animation cho `.ui-sheet` (Dialog có
 *   `ui-dialog-len`, Sheet không) — muốn trượt = quyết định mới, thêm vào artifact trước.
 * Radix lo: bẫy Tab, Esc / bấm overlay đóng, khoá cuộn nền, aria-labelledby/describedby.
 * - LUÔN có `SheetTitle` (thường trong `SheetHeader`). Header luôn chừa lề phải 56 cho ✕ như `.ui-sheet-header`.
 *   Ngoại lệ không SheetHeader: ngăn kéo menu của Sidebar (`KhungApp`) — đầu panel menu đã có nút "Đóng menu"
 *   (SheetClose, `data-autofocus`) + `SheetTitle` sr-only → truyền `showCloseButton={false}` (không thêm nút đóng thứ hai).
 * - Bộ lọc dạng form: `<form id>` bọc THÂN (SheetBody), nút Áp dụng trong footer dùng thuộc tính `form="<id>"` — không
 *   bọc cả panel bằng form (header/footer là con trực tiếp của panel flex cột).
 * - Bộ lọc trong sheet vẫn ghi tham số URL (docs/CHUAN-FILTER.md) — sheet chỉ là chỗ đặt ô lọc.
 */
function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

/** shadcn: Portal trần. DS: mặc định vào ô portal của DsRoot; chưa có ô → không render. */
function SheetPortal({ container, ...props }: ComponentProps<typeof SheetPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <SheetPrimitive.Portal data-slot="sheet-portal" container={dich} {...props} />
}

function SheetOverlay({ className, ...props }: ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn(overlay, className)} {...props} />
}

/**
 * `.ui-sheet`: cột flex, nền popover, `--shadow-400` + hairline, z-70 (thang z dialog/overlay, ds/NGUON.md).
 * Cạnh PHẢI (mặc định, artifact): bám mép phải từ trên xuống dưới, rộng min(384px, 100%) (shadcn `sm:max-w-sm`); ≤640
 * rộng 100% (README artifact "mobile 100%"; cùng mốc `@media (max-width: 640px)` của Dialog). TRÁI: đối xứng (ngăn kéo
 * menu điện thoại — Sidebar ≤767). TRÊN/DƯỚI (shadcn có, artifact chưa vẽ): rộng hết, cao theo nội dung, trần cao khung
 * nhìn (thân cuộn). Artifact không viền/bo/chuyển động → các cạnh khác cũng không (bóng đổ đều quanh).
 */
const SIDE = {
  right: 'inset-y-0 right-0 w-[min(384px,100%)] [@media(max-width:640px)]:w-full',
  left: 'inset-y-0 left-0 w-[min(384px,100%)] [@media(max-width:640px)]:w-full',
  top: 'inset-x-0 top-0 h-auto max-h-dvh',
  bottom: 'inset-x-0 bottom-0 h-auto max-h-dvh',
} as const
const panel = [
  'fixed z-70 flex flex-col',
  'border-none border-current outline-none',
  'bg-popover text-popover-foreground [box-shadow:var(--shadow-400),var(--shadow-hairline)]',
].join(' ')

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof SIDE
  showCloseButton?: boolean
}) {
  const dong = useRef<HTMLButtonElement>(null)
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPanel
        data-slot="sheet-content"
        data-side={side}
        className={cn(panel, SIDE[side], className)}
        nutDong={dong}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close asChild>
            <Button ref={dong} variant="ghost" size="icon-sm" aria-label="Đóng" className={closeBtn}>
              <X aria-hidden="true" />
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPanel>
    </SheetPortal>
  )
}

/**
 * Con trực tiếp của Portal → chỉ mount khi mở (xem useNutMo). Không export. Mở: `data-autofocus` (useNutMo) → không có
 * thì nút ✕ → không ✕ thì để Radix (phần tử focus được đầu tiên).
 */
function SheetPanel({
  nutDong,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { nutDong: RefObject<HTMLButtonElement | null> }) {
  const nutMo = useNutMo(props)
  return (
    <SheetPrimitive.Content
      {...props}
      {...nutMo}
      onOpenAutoFocus={(e) => {
        nutMo.onOpenAutoFocus(e)
        const x = nutDong.current
        if (e.defaultPrevented || !x) return
        e.preventDefault()
        x.focus({ preventScroll: true })
      }}
    />
  )
}

/**
 * `.ui-sheet-header`: padding 20 (phải 56 = `pr-14` chừa nút ✕ — ✕ chiếm 19–47 từ mép phải → chữ cách ✕ 9px như tiêu đề
 * Dialog; bản 37, CEO chốt 20/11), viền DƯỚI 1px `--border`. Viền trên/trái/phải giữ `0 none currentColor` như artifact
 * (div ăn preflight `0 solid var(--border)` của app) → longhand viền dưới. Header KHÔNG `relative` — ✕ `absolute` neo
 * theo panel `fixed`. shadcn `flex flex-col gap-1.5 p-4`: khoảng tiêu đề ↔ mô tả do `desc` (mt-1) lo như artifact.
 */
function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'shrink-0 p-(--dialog-padding) pr-14 border-none border-current',
        '[border-bottom-style:solid] [border-bottom-width:1px] [border-bottom-color:var(--border)]',
        className,
      )}
      {...props}
    />
  )
}

/** `.ui-sheet-footer`: căn phải, gap 8, padding 12 20, viền TRÊN 1px `--border` (các cạnh khác 0 none như artifact). */
function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
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

function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn(title, className)} {...props} />
}

function SheetDescription({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn(desc, className)} {...props} />
}

/** Phần GWT: `.ui-sheet-body` — giãn hết phần còn lại + cuộn dọc, padding 20, cột gap 16. */
function SheetBody({ className, ...props }: ComponentProps<'div'>) {
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

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
