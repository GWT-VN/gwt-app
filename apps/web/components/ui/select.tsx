'use client'

import { createContext, useContext, type ComponentProps } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react/ssr'
import { Select as SelectPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { selectTrigger, selectValue } from './control-styles'
import { useDsPortal } from './ds-root'
import { menuCheck, menuContent, menuItem, menuSeparator } from './menu-styles'
import { useMoBangChuot, type MoBangChuot } from './use-mo-bang-chuot'

export { selectTrigger, selectValue }

/**
 * Select — khung shadcn (Radix Select), giá trị từ `.ui-select-trigger` / `.ui-select-value` (trigger) và `.ui-menu*`
 * (nội dung, qua menu-styles.ts) của ds/nguon/bundle.css.
 *
 * **Chỉ dùng cho danh sách ≤ 10 mục** (luật docs/CHUAN-FILTER.md: quá 10 mục phải cho gõ để tìm → `Combobox`). Ô lọc
 * trang danh sách vẫn đi qua `bang/` (tham số URL), chỉ đổi diện mạo.
 *
 * - Trigger y Input (cao 32, viền inset, hover/focus/lỗi/tắt của `controlOutline`) + chữ 500, chevron 16 muted; đang mở
 *   viền alpha-50 như focus. Người gọi đặt tên: `FieldLabel htmlFor` trỏ `id` của SelectTrigger (hoặc `aria-label`),
 *   lỗi thì `aria-invalid` + `aria-describedby` câu lỗi.
 * - Nội dung `position="popper"`: portal vào ô của DsRoot (`useDsPortal`; chưa có ô thì không render), z-90 lớp menu, rộng
 *   ≥ trigger (và ≥ 200 như `.ui-menu`), cách trigger 4, chừa mép khung nhìn 8 (khổ 390 không tràn).
 * - Esc / bấm ngoài đóng, focus về trigger (Radix); Esc trong Dialog chỉ đóng Select (DismissableLayer lớp trên cùng).
 * - Mục `disabled`: theo Radix Select — hiện mờ, `aria-disabled`, ↑/↓ BỎ QUA, không chọn được. Khác menu lát 2 (APG cho
 *   focus mục chặn): Radix Select không có `onSelect` để chặn mà giữ focus, nên không ép. Ghi lý do ngay trong chữ
 *   ("Sàn TMĐT (chưa mở)").
 */

/**
 * Mở bằng chuột/chạm → ẩn vòng focus của mục cho tới phím đầu tiên (`use-mo-bang-chuot.ts`). Radix Select luôn focus()
 * mục đang chọn khi mở, và trigger chặn mousedown nên Chrome tính focus đó là :focus-visible → bấm chuột mở cũng hiện
 * vòng xanh chồng lên nền sáng (preview: mục đang chọn chỉ có nền). Mở bằng phím, hoặc ↑/↓ sau khi mở bằng chuột → vòng hiện.
 */
const MoBangChuotCtx = createContext<MoBangChuot>({ chuot: false, onPointerDown() {}, onKeyDown() {} })

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  const chuot = useMoBangChuot()
  return (
    <MoBangChuotCtx.Provider value={chuot}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </MoBangChuotCtx.Provider>
  )
}

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

export function SelectValue({ className, ...props }: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn(selectValue, className)} {...props} />
}

export function SelectTrigger({
  className,
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  const mo = useContext(MoBangChuotCtx)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTrigger, className)}
      onPointerDown={(e) => {
        mo.onPointerDown()
        onPointerDown?.(e)
      }}
      onKeyDown={(e) => {
        mo.onKeyDown()
        onKeyDown?.(e)
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  onKeyDown,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  const container = useDsPortal()
  const mo = useContext(MoBangChuotCtx)
  if (!container) return null
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        onKeyDown={(e) => {
          mo.onKeyDown()
          onKeyDown?.(e)
        }}
        // Rộng ≥ trigger và ≥ 200 (min-width của `.ui-menu`); trần cao theo chỗ trống Radix tính (còn bị chặn bởi trần
        // `min(420px, 100vh − 16px)` của menuContent).
        className={cn(
          menuContent,
          'min-w-[max(200px,var(--radix-select-trigger-width))] max-h-(--radix-select-content-available-height)',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport data-slot="select-viewport">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/** `.ui-menu-item` (menuItem) + ✓ phải (`.ui-check`) khi đang chọn. */
export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  const { chuot } = useContext(MoBangChuotCtx)
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      // Mở bằng chuột: reset outline y `outline: none` (shorthand) + offset 0 — computed khớp mục không focus của preview; important
      // vì vòng focus-visible của menuItem đặc hiệu cao hơn (thêm :not(:hover)).
      className={cn(menuItem, chuot && '[outline:none]! outline-offset-0!', className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator asChild>
        <Check aria-hidden="true" className={menuCheck} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn(menuSeparator, className)} {...props} />
}
