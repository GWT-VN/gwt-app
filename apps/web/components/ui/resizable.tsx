// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { DotsSixVertical } from '@phosphor-icons/react/ssr'
import * as ResizablePrimitive from 'react-resizable-panels'
import { cn } from '@/lib/utils'

/**
 * Resizable — khung shadcn trên `react-resizable-panels` 4 (`Group` / `Panel` / `Separator`). Artifact chưa có → token:
 * vạch 1px `--border`; tay nắm (`withHandle`) 12 × 16 nền `--border` bo xs, icon chấm 10 muted; focus phím = outline 2
 * ring cách 1 (không chép `outline-hidden` + ring của shadcn — NGUON: mất vòng focus).
 * - API v4: `orientation` ở `ResizablePanelGroup`; kích thước Panel là SỐ = px, CHUỖI = % (`defaultSize="30%"`).
 * - Bàn phím (thư viện lo): Tab tới vạch (`role="separator"` + `aria-valuenow`), ←/→ (↑/↓ khi dọc) đổi cỡ, Home/End về
 *   min/max, Enter thu/mở panel `collapsible`. Vạch nên có `aria-label` nói rõ hai vùng nó chia.
 */
function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full border-none border-current aria-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px items-center justify-center border-none border-current bg-(--border) [outline:none]',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:border-none',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-(--ring)',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0',
        'aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0',
        'aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-1 flex h-4 w-3 items-center justify-center rounded-(--radius-xs) border-none border-current bg-(--border)">
          <DotsSixVertical aria-hidden="true" className="size-2.5 text-muted-foreground" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
