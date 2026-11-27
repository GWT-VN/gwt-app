// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { useEffect, useRef, useState, type ComponentProps, type ReactElement, type ReactNode, type Ref } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { TooltipProvider } from './tooltip-provider'

/**
 * Tooltip — khung shadcn new-york-v4 (Radix Tooltip): đủ 4 phần (`TooltipProvider`, `Tooltip` = Root, `TooltipTrigger`,
 * `TooltipContent`), cùng `data-slot`. DsRoot đã bọc `TooltipProvider` cho các Tooltip ghép tay.
 * Màn thường dùng hàm tiện `TooltipNhanh` (dưới) để có các hành vi bổ sung của DS.
 *
 * Đổi bắt buộc / gán token (giá trị chép từ `.ui-tip.is-tip::after` trong ds/nguon/bundle.css):
 * - Nền primary-solid, chữ primary-solid, 500 12px/16px một dòng, padding 4 8, bo radius-md, cách trigger 6px
 *   (`sideOffset` 6, shadcn 0), hiện bên dưới (`side` bottom — artifact chỉ có bottom; shadcn để Radix mặc định top).
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô (trước mount / ngoài DsRoot) thì không render nội dung —
 *   ra document.body là mất token DS. z-80 (thang NGUON).
 * - `TooltipProvider` trễ 300ms (shadcn 0) — nhịp hiện tooltip của DS.
 * - CỐ Ý không chép: mũi tên (`TooltipPrimitive.Arrow`) và animation — artifact không định nghĩa.
 */
function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        // z-80 = z-index của .ui-tip::after. text-[12px] leading-[16px] font-medium = font 500 12px/16px.
        // border-none border-current: ::after không viền (div Radix ăn preflight `0 solid var(--border)` của app).
        className={cn(
          'z-80 w-fit rounded-md border-none border-current bg-(--color-background-primary-solid) px-2 py-1 text-[12px] leading-[16px] font-medium whitespace-nowrap text-(--color-text-primary-solid)',
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

/**
 * TooltipNhanh — hàm tiện GWT (trước đợt chép shadcn tên là `Tooltip`): `<TooltipNhanh content="…"><Button/></TooltipNhanh>`,
 * ghép trên 4 phần ở trên.
 * - Tự mang Provider (trễ 300ms) → dùng thẳng, không cần bọc Provider ở layout.
 * - Không mở khi trigger đang `aria-expanded="true"` (nút đang mở menu) — y `:not([aria-expanded="true"])` của
 *   bundle.css; tooltip không được đè lên menu. Đang mở mà trigger chuyển sang `aria-expanded="true"` (menu mở bằng
 *   code / không lấy focus) → đóng ngay (MutationObserver chỉ sống khi tooltip đang mở).
 * - Đang focus phím (`:focus-visible`) thì chỉ Esc hoặc rời focus mới đóng — y `:is(:hover, :focus-visible)` của
 *   bundle.css. CỐ Ý: tooltip focus phím vẫn mở khi trang cuộn, khi chuột rê sang nút khác, và khi bấm Enter/Space
 *   (Radix mặc định đóng cả ba). Lý do cuộn: Tab tới nút ngoài khung nhìn → trình duyệt tự cuộn → tooltip vừa mở đã
 *   tắt (đo thật ở so-khop khổ 390). Hai ca kia: CSS artifact giữ `::after` chừng nào nút còn `:focus-visible`.
 * - Trigger có thể là <button> hoặc <a> (asChild) → ref kiểu HTMLElement.
 * - `phim` (học Notion 27/11): phím tắt sau tên, cùng dòng, mờ 60% — "Đóng  Esc". Chỉ để NHÌN (aria-hidden); tên đọc của
 *   nút tự ghi phím nếu cần.
 */
function TooltipNhanh({
  content,
  phim,
  side = 'bottom',
  sideOffset = 6,
  children,
}: {
  content: ReactNode
  /** Phím tắt hiện mờ sau tên, vd "Esc", "Ctrl+↵", "↑". */
  phim?: string
  side?: 'bottom' | 'right' | 'top' | 'left'
  /** Khoảng cách tới trigger (px). Mặc định 6 = `.ui-tip`; tip thanh bên Sidebar 8 (`.pD-icon` tip). */
  sideOffset?: number
  children: ReactElement
}) {
  const trigger = useRef<HTMLElement>(null)
  const esc = useRef(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const t = trigger.current
    if (!open || !t) return
    const mo = new MutationObserver(() => {
      if (t.getAttribute('aria-expanded') === 'true') setOpen(false)
    })
    mo.observe(t, { attributes: true, attributeFilter: ['aria-expanded'] })
    return () => mo.disconnect()
  }, [open])
  return (
    <TooltipProvider>
      <Tooltip
        open={open}
        onOpenChange={(o) => {
          const t = trigger.current
          if (!o && !esc.current && t === document.activeElement && t?.matches(':focus-visible')) return
          esc.current = false
          setOpen(o && t?.getAttribute('aria-expanded') !== 'true')
        }}
      >
        {/* Radix khai ref là HTMLButtonElement; asChild truyền ref thẳng xuống phần tử con (button hoặc a). */}
        <TooltipTrigger asChild ref={trigger as Ref<HTMLButtonElement>}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          onEscapeKeyDown={() => {
            esc.current = true
          }}
        >
          {content}
          {phim && (
            <span aria-hidden="true" className="ml-2 border-none border-current opacity-60">
              {phim}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipNhanh }
