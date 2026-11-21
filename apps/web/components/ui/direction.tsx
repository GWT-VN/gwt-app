// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { Direction } from 'radix-ui'

/**
 * DirectionProvider — đặt hướng chữ (ltr/rtl) cho mọi primitive Radix bên trong. App GWT chỉ tiếng Việt (ltr) → chép cho
 * đủ bộ shadcn, chưa màn nào cần; không có khối /ds.
 */
function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>['dir']
}) {
  return <Direction.DirectionProvider dir={direction ?? dir}>{children}</Direction.DirectionProvider>
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
