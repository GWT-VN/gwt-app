// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react'
import { CaretRight, Check, Minus } from '@phosphor-icons/react/ssr'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import {
  MENU_SUB,
  itemDisabled,
  menuCheck,
  menuContent,
  menuInset,
  menuItem,
  menuItemDestructive,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubContent,
  menuSubTrigger,
} from './menu-styles'
import { GiaTriRadio, MenuTimKiem, PhimKbd, TuFocusMenuCon, phimSubContent, phimSubTrigger } from './menu-them'

/**
 * DropdownMenu — khung shadcn new-york-v4 (Radix DropdownMenu): đủ 15 phần, cùng tên, cùng `data-slot`, prop `inset` /
 * `variant`. Đổi bắt buộc: icon lucide → Phosphor; Portal vào ô của DsRoot (`useDsPortal`; chưa có ô thì không render —
 * ra document.body là mất token DS); class shadcn → token `.ui-menu*` (ds/nguon/bundle.css) qua menu-styles.ts; z-90
 * (thang NGUON); không animation (artifact không có).
 *
 * Phần GWT CỘNG THÊM (shadcn không có — giữ nguyên hành vi):
 * - `disabled` trên Item/CheckboxItem/RadioItem theo APG (không phải nghĩa Radix): mục VẪN HIỆN và VẪN FOCUS được (↑/↓, gõ
 *   chữ đầu dừng ở nó) nhưng không kích hoạt — onSelect/onCheckedChange không chạy, menu không đóng. Ghi lý do ngay trong
 *   chữ ("Chuyển kho (không có quyền)"). Xem `itemDisabled` trong menu-styles.ts.
 * - ✓ / – bên PHẢI (y artifact) thay chấm/✓ bên trái của shadcn; CheckboxItem `checked="indeterminate"` → –,
 *   `aria-checked="mixed"`; RadioItem `indicator` thay ✓.
 * - Shortcut `phim` (nhóm Kbd), SubTrigger `icon` / `phim`, MenuTimKiem (ô tìm đầu menu con), SubContent tự portal + tự
 *   focus khi mở (menu-them.tsx). Nguồn: prototype menu thuộc tính CEO duyệt 20/11 (app/prototype/menu-thuoc-tinh).
 * - Nút mở mang `data-ds-menu-trigger`, khung menu mang `data-trigger-id` cùng giá trị → mục menu mở Dialog/ConfirmDialog
 *   thì hộp đóng xong focus về nút (use-nut-mo.ts). Không dựa `aria-labelledby` của Radix: nút `asChild` có `id` riêng
 *   thì Slot cho id đó thắng, còn aria-labelledby vẫn là id Radix tự sinh.
 */
const IdNut = createContext<string | undefined>(undefined)

function DropdownMenu({ ...props }: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const id = useId()
  return (
    <IdNut.Provider value={id}>
      <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
    </IdNut.Provider>
  )
}

/** Portal vào ô DsRoot (truyền `container` để đè). Content/SubContent đã tự portal — chỉ cần khi ghép tay. */
function DropdownMenuPortal({ container, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  const o = useDsPortal()
  const dich = container ?? o
  if (!dich) return null
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" container={dich} {...props} />
}

function DropdownMenuTrigger({ ...props }: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger data-ds-menu-trigger={useContext(IdNut)} data-slot="dropdown-menu-trigger" {...props} />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  // 8px mỗi mép = trần cao `calc(100vh-16px)` của menuContent: khổ 390 menu không dính mép khung nhìn.
  collisionPadding = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const container = useDsPortal()
  const idNut = useContext(IdNut)
  if (!container) return null
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        data-trigger-id={idNut}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(menuContent, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItem, menuInset, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

/**
 * Mục bật/tắt (vd "Cột hiển thị"): ✓ bên phải khi bật, không chừa chỗ khi tắt — y preview. `checked="indeterminate"`
 * (vd nhãn chỉ một phần các dòng đang chọn có) → dấu – và `aria-checked="mixed"` (Radix); bấm → bật hết (`true`).
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  onSelect,
  onCheckedChange,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItem, className)}
      checked={checked}
      {...props}
      {...itemDisabled(disabled, onSelect)}
      // Radix gọi onCheckedChange bất kể preventDefault → mục chặn quyền bỏ hẳn.
      onCheckedChange={disabled ? undefined : onCheckedChange}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator asChild>
        {checked === 'indeterminate' ? (
          <Minus aria-hidden="true" data-chi-bao="mot-phan" className={menuCheck} />
        ) : (
          <Check aria-hidden="true" data-chi-bao="chon" className={menuCheck} />
        )}
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

/** Nhóm chọn một (vd menu sắp của tiêu đề cột, menu ô InlineEdit, menu con Ưu tiên). */
function DropdownMenuRadioGroup({ value, ...props }: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <GiaTriRadio.Provider value={value}>
      <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" value={value} {...props} />
    </GiaTriRadio.Provider>
  )
}

/**
 * Mục chọn một: ✓ bên phải mục đang chọn, không chừa chỗ khi chưa chọn — như CheckboxItem / `.b-tick` trong `.b-noi`.
 * `indicator` thay ✓ (vd ▸ của mục mở bước 2 — luôn hiện).
 * `disabled` theo APG (luật menu NGUON): vẫn hiện + focus được, không chọn, menu không đóng. Radix RadioItem gọi
 * `onValueChange` của nhóm BẤT KỂ preventDefault → mục chặn quyền vẽ bằng Item thường mang `role="menuitemradio"` +
 * `aria-checked` đọc từ nhóm.
 */
function DropdownMenuRadioItem({
  className,
  children,
  disabled,
  onSelect,
  indicator,
  value,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & { indicator?: ReactNode }) {
  const dangChon = useContext(GiaTriRadio) === value
  if (disabled)
    return (
      <DropdownMenuPrimitive.Item
        data-slot="dropdown-menu-radio-item"
        role="menuitemradio"
        aria-checked={dangChon}
        data-state={dangChon ? 'checked' : 'unchecked'}
        className={cn(menuItem, className)}
        {...props}
        {...itemDisabled(true)}
      >
        {children}
        {indicator ?? (dangChon && <Check aria-hidden="true" className={menuCheck} />)}
      </DropdownMenuPrimitive.Item>
    )
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      value={value}
      className={cn(menuItem, className)}
      onSelect={onSelect}
      {...props}
    >
      {children}
      {indicator ?? (
        <DropdownMenuPrimitive.ItemIndicator asChild>
          <Check aria-hidden="true" className={menuCheck} />
        </DropdownMenuPrimitive.ItemIndicator>
      )}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(menuLabel, menuInset, className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}

/**
 * Phím tắt căn phải. `phim` (vd `['⇧', 'D']`) → nhóm `Kbd` (GWT thêm); không truyền → chữ 12/18 muted như
 * `.ui-menu-shortcut`. Chữ phím nằm trong tên đọc của mục — như bản chữ.
 */
function DropdownMenuShortcut({ className, phim, ...props }: ComponentProps<'span'> & { phim?: string[] }) {
  if (phim) return <PhimKbd phim={phim} className={className} {...props} />
  return <span data-slot="dropdown-menu-shortcut" className={cn(menuShortcut, className)} {...props} />
}

function DropdownMenuSub({ ...props }: ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

/**
 * Mục mở menu con: `icon` · nhãn · `phim` (Kbd) · ▸. Radix lo → mở (focus vào menu con), ← đóng về mục này, rê chuột mở
 * sau 100ms, `aria-haspopup="menu"` + `aria-expanded`. Giữ nền sáng khi menu con mở (`menuSubTrigger`). Menu con có
 * MenuTimKiem đang mở mà focus còn ở đây → gõ chữ đi vào ô tìm.
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  icon,
  phim,
  children,
  onKeyDown,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
  icon?: ReactNode
  phim?: string[]
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuSubTrigger, menuInset, className)}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        phimSubTrigger(e)
      }}
      {...props}
    >
      {icon}
      {children}
      {phim && <PhimKbd phim={phim} />}
      <CaretRight aria-hidden="true" className={phim ? undefined : 'ml-auto'} />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

/**
 * Khung menu con: TỰ portal vào ô DsRoot như Content (shadcn để bên gọi bọc Portal — ở DS không cần), cùng khung
 * `.ui-menu` (z-90), vị trí `MENU_SUB` (mục đầu thẳng hàng mục cha). R14: `collisionPadding` 8 + rộng kẹp theo chỗ trống
 * (menuSubContent) → khổ 390 không tràn ngang. Có MenuTimKiem: gõ chữ ở mục bất kỳ → vào ô; ↑ ở mục đầu → về ô.
 */
function DropdownMenuSubContent({
  className,
  sideOffset = MENU_SUB.sideOffset,
  alignOffset = MENU_SUB.alignOffset,
  collisionPadding = 8,
  onKeyDownCapture,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const container = useDsPortal()
  if (!container) return null
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={cn(menuSubContent, className)}
        onKeyDownCapture={(e) => {
          onKeyDownCapture?.(e)
          phimSubContent(e)
        }}
        {...props}
      >
        {children}
        <TuFocusMenuCon />
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  // GWT thêm (menu-them.tsx) — re-export để màn import một chỗ như trước.
  MenuTimKiem,
}
