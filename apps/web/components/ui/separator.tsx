// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

/**
 * Separator — vạch ngăn 1px màu `--border` (cùng màu `.ui-menu-sep` / viền thẻ của ds/nguon/bundle.css). Ngang: rộng
 * 100%, cao 1; dọc: cao 100%, rộng 1. Mặc định `decorative` (role none — chỉ trang trí, trình đọc màn hình bỏ qua);
 * vạch có NGHĨA ngăn nhóm thì `decorative={false}` → `role="separator"` + `aria-orientation`.
 * Không viền: div ăn preflight `0 solid` của app → tắt về `none` như mọi khối DS.
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 border-none border-current bg-border',
        'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
