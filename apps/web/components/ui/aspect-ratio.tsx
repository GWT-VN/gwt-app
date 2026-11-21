// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'

/**
 * AspectRatio — khung giữ tỉ lệ (Radix AspectRatio: `ratio` = rộng / cao, vd `16 / 9`, `1`). Không có token: con
 * (ảnh/video) tự `size-full object-cover`; bo/nền đặt ở `className` của chính khung (DS: `rounded-(--radius-lg)` +
 * `bg-muted` như ô ảnh `.ui-file-thumb`).
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
