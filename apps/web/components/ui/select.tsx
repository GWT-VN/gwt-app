// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import * as React from 'react'
import { createContext, useContext } from 'react'
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react/ssr'
import { Select as SelectPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { selectTrigger, selectTriggerSize, selectValue } from './control-styles'
import { useDsPortal } from './ds-root'
import { menuContent, menuItem, menuLabel, menuSeparator } from './menu-styles'
import { useMoBangChuot, type MoBangChuot } from './use-mo-bang-chuot'

export { selectTrigger, selectValue }

/**
 * Select — khung shadcn (Radix Select, 10 phần), giá trị từ `.ui-select-trigger` / `.ui-select-value` (trigger) và
 * `.ui-menu*` (nội dung, qua menu-styles.ts) của ds/nguon/bundle.css.
 *
 * **Chỉ dùng cho danh sách ≤ 10 mục** (luật docs/CHUAN-FILTER.md: quá 10 mục phải cho gõ để tìm → `Combobox`). Ô lọc
 * trang danh sách vẫn đi qua `bang/` (tham số URL), chỉ đổi diện mạo.
 *
 * - Trigger y Input (cao 32, viền inset, hover/focus/lỗi/tắt của `controlOutline`) + chữ 500, chevron 16 muted; đang mở
 *   viền alpha-50 như focus. `size` theo shadcn: `default` 32 / `sm` 28 (--control-size-sm, lề 10). Người gọi đặt tên:
 *   `FieldLabel htmlFor` trỏ `id` của SelectTrigger (hoặc `aria-label`), lỗi thì `aria-invalid` + `aria-describedby`.
 * - Nội dung — lệch shadcn có chủ đích: mặc định `position="popper"` + `align="start"` (shadcn `item-aligned`/`center`):
 *   pop luôn nằm dưới trigger như `.ui-menu` của artifact. Portal vào ô của DsRoot (`useDsPortal`; chưa có ô thì không
 *   render), z-90 lớp menu, rộng ≥ trigger (và ≥ 200 như `.ui-menu`), cách trigger 4, chừa mép khung nhìn 8 (khổ 390
 *   không tràn). Đệm nằm ở khung (`--menu-gutter`), không ở Viewport như shadcn. Nút cuộn lên/xuống (shadcn) chỉ hiện
 *   khi danh sách dài hơn chỗ trống.
 * - Esc / bấm ngoài đóng, focus về trigger (Radix); Esc trong Dialog chỉ đóng Select (DismissableLayer lớp trên cùng).
 * - Mục `disabled`: theo Radix Select — hiện mờ, `aria-disabled`, ↑/↓ BỎ QUA, không chọn được. Khác menu lát 2 (APG cho
 *   focus mục chặn): Radix Select không có `onSelect` để chặn mà giữ focus, nên không ép. Ghi lý do ngay trong chữ
 *   ("Sàn TMĐT (chưa mở)").
 * - Mục đang chọn: ✓ PHẢI cuối dòng (`.ui-check` của artifact — shadcn đặt ✓ tuyệt đối bên phải, chừa lề 32), ô ✓
 *   `select-item-indicator` luôn chiếm chỗ 16 nên chọn/bỏ chọn không xô chữ.
 */

/**
 * GWT — mở bằng chuột/chạm → ẩn vòng focus của mục cho tới phím đầu tiên (`use-mo-bang-chuot.ts`). Radix Select luôn
 * focus() mục đang chọn khi mở, và trigger chặn mousedown nên Chrome tính focus đó là :focus-visible → bấm chuột mở cũng
 * hiện vòng xanh chồng lên nền sáng (preview: mục đang chọn chỉ có nền). Mở bằng phím, hoặc ↑/↓ sau khi mở bằng chuột →
 * vòng hiện.
 */
const MoBangChuotCtx = createContext<MoBangChuot>({ chuot: false, onPointerDown() {}, onKeyDown() {} })

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const chuot = useMoBangChuot()
  return (
    <MoBangChuotCtx.Provider value={chuot}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </MoBangChuotCtx.Provider>
  )
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn(selectValue, className)} {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'default' }) {
  const mo = useContext(MoBangChuotCtx)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTrigger, selectTriggerSize, className)}
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

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  sideOffset = 4,
  collisionPadding = 8,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
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
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport data-slot="select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/** Tiêu đề nhóm trong SelectGroup — `.ui-menu-label` (menuLabel): 12/18 600 muted-foreground. */
function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn(menuLabel, className)} {...props} />
}

/** `.ui-menu-item` (menuItem) + ✓ phải (`.ui-check`) khi đang chọn. */
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
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
      <span
        data-slot="select-item-indicator"
        className="ml-auto flex size-4 shrink-0 items-center justify-center border-none border-current text-foreground"
      >
        <SelectPrimitive.ItemIndicator asChild>
          <Check aria-hidden="true" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn(menuSeparator, className)} {...props} />
}

/** Nút cuộn (Radix chỉ render khi còn mục khuất phía trên/dưới): cao 24, chevron 16 muted, không bắt focus. */
const nutCuon = 'flex cursor-default items-center justify-center py-1 border-none border-current text-muted-foreground [&>svg]:size-4'

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn(nutCuon, className)} {...props}>
      <CaretUp aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn(nutCuon, className)} {...props}>
      <CaretDown aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
