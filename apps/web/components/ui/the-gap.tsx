'use client'

import { useState, type ComponentProps, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

/**
 * TheGap — THẺ gập/mở (Card + Collapsible; CEO 27/11 "biến thành thẻ có thể collapse được" — lần lỗi, Khách, Sản phẩm đã
 * mua ở Xem nhanh ticket).
 * - Đầu thẻ MỘT dòng, căn giữa dọc (CEO 27/11): `tieuDe` · `thaoTac` (vd chip trạng thái sửa được) · mũi tên. Nút gập phủ
 *   cả đầu thẻ (lớp `after` dưới chữ), `thaoTac` nằm TRÊN lớp đó → bấm chip là sửa, bấm chỗ khác là gập; không lồng nút.
 * - Kẻ giữa đầu và thân LÙI 16 hai bên (thẳng mép chữ — CEO 27/11 "cutline đến đoạn tôi đánh dấu thôi").
 * - `khit` = thân không đệm (bảng inline — ListView tự mang đệm hàng).
 */
export function TheGap({
  tieuDe,
  thaoTac,
  moSan = true,
  khit,
  children,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'title'> & { tieuDe: ReactNode; thaoTac?: ReactNode; moSan?: boolean; khit?: boolean }) {
  const [mo, setMo] = useState(moSan)
  return (
    <Collapsible open={mo} onOpenChange={setMo} asChild>
      <Card data-slot="the-gap" className={cn('overflow-hidden p-0', className)} {...props}>
        <div className="relative flex min-h-12 items-center gap-2 border-none border-current px-4 py-2 hover:bg-(--alpha-03)">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                'm-0 flex min-w-0 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left [font:inherit] font-semibold text-inherit',
                // Vùng bấm phủ cả đầu thẻ (dưới `thaoTac`); vòng focus vẽ quanh cả đầu thẻ.
                "after:absolute after:inset-0 after:content-['']",
                '[outline:none] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-solid focus-visible:after:outline-(--ring)',
              )}
            >
              {tieuDe}
            </button>
          </CollapsibleTrigger>
          {thaoTac && <span className="relative z-1 flex items-center border-none border-current">{thaoTac}</span>}
          <CaretDown
            aria-hidden="true"
            className={cn('ml-auto size-4 shrink-0 text-muted-foreground transition-transform', mo && 'rotate-180')}
          />
        </div>
        <CollapsibleContent>
          <div className="mx-4 h-px border-none border-current bg-(--border)" />
          <div className={cn('border-none border-current', !khit && 'px-4 pt-3 pb-4')}>{children}</div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
