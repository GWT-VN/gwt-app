'use client'

import { useEffect, useRef, useState, type ReactElement, type ReactNode, type Ref } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { useDsPortal } from './ds-root'

/**
 * Tooltip — khung shadcn (Radix Tooltip), giá trị chép từ `.ui-tip.is-tip::after` trong ds/nguon/bundle.css:
 * nền primary-solid, chữ primary-solid, 500 12px/16px một dòng, padding 4 8, bo radius-md, cách trigger 6px.
 * - Tự mang Provider (delay 300ms) → dùng thẳng, không cần bọc Provider ở layout.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô (trước mount / ngoài DsRoot) thì không render nội dung —
 *   ra document.body là mất token DS.
 * - Không mở khi trigger đang `aria-expanded="true"` (nút đang mở menu) — y `:not([aria-expanded="true"])` của
 *   bundle.css; tooltip không được đè lên menu. Đang mở mà trigger chuyển sang `aria-expanded="true"` (menu mở bằng
 *   code / không lấy focus) → đóng ngay (MutationObserver chỉ sống khi tooltip đang mở).
 * - Đang focus phím (`:focus-visible`) thì chỉ Esc hoặc rời focus mới đóng — y `:is(:hover, :focus-visible)` của
 *   bundle.css. CỐ Ý: tooltip focus phím vẫn mở khi trang cuộn, khi chuột rê sang nút khác, và khi bấm Enter/Space
 *   (Radix mặc định đóng cả ba). Lý do cuộn: Tab tới nút ngoài khung nhìn → trình duyệt tự cuộn → tooltip vừa mở đã
 *   tắt (đo thật ở so-khop khổ 390). Hai ca kia: CSS artifact giữ `::after` chừng nào nút còn `:focus-visible`.
 * - Trigger có thể là <button> hoặc <a> (asChild) → ref kiểu HTMLElement.
 * - Không mũi tên, không animation: artifact không định nghĩa.
 */
export function Tooltip({
  content,
  side = 'bottom',
  children,
}: {
  content: ReactNode
  side?: 'bottom' | 'right' | 'top' | 'left'
  children: ReactElement
}) {
  const container = useDsPortal()
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
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root
        open={open}
        onOpenChange={(o) => {
          const t = trigger.current
          if (!o && !esc.current && t === document.activeElement && t?.matches(':focus-visible')) return
          esc.current = false
          setOpen(o && t?.getAttribute('aria-expanded') !== 'true')
        }}
      >
        {/* Radix khai ref là HTMLButtonElement; asChild truyền ref thẳng xuống phần tử con (button hoặc a). */}
        <TooltipPrimitive.Trigger asChild ref={trigger as Ref<HTMLButtonElement>}>
          {children}
        </TooltipPrimitive.Trigger>
        {container && (
          <TooltipPrimitive.Portal container={container}>
            <TooltipPrimitive.Content
              data-slot="tooltip-content"
              side={side}
              sideOffset={6}
              onEscapeKeyDown={() => {
                esc.current = true
              }}
              // z-80 = z-index của .ui-tip::after. text-[12px] leading-[16px] font-medium = font 500 12px/16px.
              // border-none border-current: ::after không viền (div Radix ăn preflight `0 solid var(--border)` của app).
              className="z-80 rounded-md border-none border-current bg-(--color-background-primary-solid) px-2 py-1 text-[12px] leading-[16px] font-medium whitespace-nowrap text-(--color-text-primary-solid)"
            >
              {content}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
