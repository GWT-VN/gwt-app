'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { CaretRight, Check, MagnifyingGlass, Minus } from '@phosphor-icons/react/ssr'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { useDsPortal } from './ds-root'
import { Input } from './input'
import { Kbd, KbdGroup } from './kbd'
import {
  MENU_SUB,
  itemDisabled,
  menuCheck,
  menuContent,
  menuItem,
  menuItemDestructive,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubContent,
  menuSubTrigger,
  menuTimKiem,
} from './menu-styles'

/**
 * DropdownMenu — khung shadcn (Radix DropdownMenu), giá trị từ `.ui-menu*` của ds/nguon/bundle.css qua menu-styles.ts.
 * - Portal vào ô của DsRoot (`useDsPortal`); chưa có ô thì không render nội dung (ra document.body là mất token DS).
 * - `disabled` trên Item/CheckboxItem theo APG (không phải nghĩa Radix): item VẪN HIỆN và VẪN FOCUS được (↑/↓, gõ chữ
 *   đầu dừng ở nó) nhưng không kích hoạt — onSelect/onCheckedChange không chạy, menu không đóng. Ghi lý do ngay trong
 *   chữ ("Chuyển kho (không có quyền)") để trình đọc màn hình đọc kèm. Xem `itemDisabled` trong menu-styles.ts.
 * - Không animation. RadioGroup/RadioItem: menu chọn một của tiêu đề cột Table và ô InlineEdit (README Table/InlineEdit).
 * - Menu con (Sub/SubTrigger/SubContent), ✓ một phần (CheckboxItem `checked="indeterminate"`), phím tắt Kbd
 *   (Shortcut `phim`), ô tìm đầu menu con (MenuTimKiem): thêm ở repo 20/11 — artifact không có; nguồn là prototype
 *   menu thuộc tính CEO duyệt (app/prototype/menu-thuoc-tinh). Phần này dùng chung với ContextMenu qua `taoPhanMenu`.
 */
/** Nút mở mang `data-ds-menu-trigger`, khung menu mang `data-trigger-id` cùng giá trị → mục menu mở Dialog/ConfirmDialog
 * thì hộp đóng xong focus về nút (use-nut-mo.ts). Không dựa `aria-labelledby` của Radix: nút `asChild` có `id` riêng
 * thì Slot cho id đó thắng, còn aria-labelledby vẫn là id Radix tự sinh. */
const IdNut = createContext<string | undefined>(undefined)

export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const id = useId()
  return (
    <IdNut.Provider value={id}>
      <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
    </IdNut.Provider>
  )
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger data-ds-menu-trigger={useContext(IdNut)} data-slot="dropdown-menu-trigger" {...props} />
  )
}

export function DropdownMenuContent({
  className,
  sideOffset = 4,
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
        // 8px mỗi mép = trần cao `calc(100vh-16px)` của menuContent: khổ 390 menu không dính mép khung nhìn.
        collisionPadding={collisionPadding}
        className={cn(menuContent, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  disabled,
  onSelect,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(menuItem, variant === 'destructive' && menuItemDestructive, className)}
      {...props}
      {...itemDisabled(disabled, onSelect)}
    />
  )
}

/** Chọn ô tìm của MỘT khung menu (menu con khác nằm ở portal riêng, không lồng DOM). */
const O_TIM = '[data-slot="menu-tim-kiem"] input'

/**
 * Gõ chữ khi focus ở mục cha (menu con đang mở) hoặc ở một mục của menu con có ô tìm → chữ vào ô tìm, không chạy typeahead
 * của Radix. Đổi focus TRONG keydown: trình duyệt chèn ký tự vào phần tử đang focus lúc đó (ô tìm). Space giữ nghĩa chọn
 * mục; IME đang ghép (key "Process", isComposing) và tổ hợp Ctrl/⌘/Alt không chuyển.
 */
function vaoOTim(e: KeyboardEvent<HTMLElement>, khung: Element | null | undefined) {
  if (e.key.length !== 1 || e.key === ' ' || e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return
  const o = khung?.querySelector<HTMLInputElement>(O_TIM)
  if (!o || o === e.target) return
  e.stopPropagation()
  o.focus()
}

/**
 * Focus khi menu con vừa mở (rAF: sau khi Radix đã tự focus — mở bằng phím thì Radix đưa focus vào mục đầu): ô tìm nếu
 * có; không có ô tìm mà mở bằng phím (focus đang trong menu con) → mục đang ✓, không có thì giữ mục đầu. Mở bằng chuột
 * (focus còn ở mục cha) mà không có ô tìm → không giành focus.
 */
function TuFocusMenuCon() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const m = ref.current?.closest<HTMLElement>('[role="menu"]')
      if (!m) return
      const o = m.querySelector<HTMLElement>(O_TIM)
      if (o) o.focus({ preventScroll: true })
      else if (m.contains(document.activeElement))
        m.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return <span ref={ref} hidden />
}

/**
 * Phần giống hệt nhau giữa DropdownMenu và ContextMenu (cùng primitive Menu của Radix, khác context): CheckboxItem,
 * RadioGroup/RadioItem, Shortcut, Group, Sub/SubTrigger/SubContent. ContextMenu truyền primitive của nó (ép kiểu — API
 * Radix trùng) + tiền tố `data-slot` riêng.
 */
export function taoPhanMenu(N: typeof DropdownMenuPrimitive, slot: 'dropdown-menu' | 'context-menu') {
  function Group(props: ComponentProps<typeof N.Group>) {
    return <N.Group data-slot={`${slot}-group`} {...props} />
  }

  /**
   * Mục bật/tắt (vd "Cột hiển thị"): ✓ bên phải khi bật, không chừa chỗ khi tắt — y preview. `checked="indeterminate"`
   * (vd nhãn chỉ một phần các dòng đang chọn có) → dấu – và `aria-checked="mixed"` (Radix); bấm → bật hết (`true`).
   */
  function CheckboxItem({
    className,
    children,
    checked,
    disabled,
    onSelect,
    onCheckedChange,
    ...props
  }: ComponentProps<typeof N.CheckboxItem>) {
    return (
      <N.CheckboxItem
        data-slot={`${slot}-checkbox-item`}
        className={cn(menuItem, className)}
        checked={checked}
        {...props}
        {...itemDisabled(disabled, onSelect)}
        onCheckedChange={disabled ? undefined : onCheckedChange}
      >
        {children}
        <N.ItemIndicator asChild>
          {checked === 'indeterminate' ? (
            <Minus aria-hidden="true" data-chi-bao="mot-phan" className={menuCheck} />
          ) : (
            <Check aria-hidden="true" data-chi-bao="chon" className={menuCheck} />
          )}
        </N.ItemIndicator>
      </N.CheckboxItem>
    )
  }

  /** Giá trị đang chọn của RadioGroup — mục chặn quyền (không phải RadioItem của Radix) tự đọc `aria-checked`. */
  const GiaTriRadio = createContext<string | undefined>(undefined)

  /** Nhóm chọn một (vd menu sắp của tiêu đề cột, menu ô InlineEdit, menu con Ưu tiên). */
  function RadioGroup({ value, ...props }: ComponentProps<typeof N.RadioGroup>) {
    return (
      <GiaTriRadio.Provider value={value}>
        <N.RadioGroup data-slot={`${slot}-radio-group`} value={value} {...props} />
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
  function RadioItem({
    className,
    children,
    disabled,
    onSelect,
    indicator,
    value,
    ...props
  }: ComponentProps<typeof N.RadioItem> & { indicator?: ReactNode }) {
    const dangChon = useContext(GiaTriRadio) === value
    if (disabled)
      return (
        <N.Item
          data-slot={`${slot}-radio-item`}
          role="menuitemradio"
          aria-checked={dangChon}
          data-state={dangChon ? 'checked' : 'unchecked'}
          className={cn(menuItem, className)}
          {...props}
          {...itemDisabled(true)}
        >
          {children}
          {indicator ?? (dangChon && <Check aria-hidden="true" className={menuCheck} />)}
        </N.Item>
      )
    return (
      <N.RadioItem
        data-slot={`${slot}-radio-item`}
        value={value}
        className={cn(menuItem, className)}
        onSelect={onSelect}
        {...props}
      >
        {children}
        {indicator ?? (
          <N.ItemIndicator asChild>
            <Check aria-hidden="true" className={menuCheck} />
          </N.ItemIndicator>
        )}
      </N.RadioItem>
    )
  }

  /**
   * Phím tắt căn phải. `phim` (vd `['⇧', 'D']`) → nhóm `Kbd` (thêm 20/11, menu thuộc tính); không truyền → chữ 12/18 muted
   * như `.ui-menu-shortcut` (hành vi cũ). Chữ phím nằm trong tên đọc của mục — như bản chữ.
   */
  function Shortcut({ className, phim, children, ...props }: ComponentProps<'span'> & { phim?: string[] }) {
    if (phim)
      return (
        <KbdGroup className={cn('ml-auto', className)} {...props}>
          {phim.map((k, i) => (
            <Kbd key={i}>{k}</Kbd>
          ))}
        </KbdGroup>
      )
    return (
      <span data-slot={`${slot}-shortcut`} className={cn(menuShortcut, className)} {...props}>
        {children}
      </span>
    )
  }

  function Sub(props: ComponentProps<typeof N.Sub>) {
    return <N.Sub {...props} />
  }

  /**
   * Mục mở menu con: `icon` · nhãn · `phim` (Kbd) · ▸. Radix lo → mở (focus vào menu con), ← đóng về mục này, rê chuột mở
   * sau 100ms, `aria-haspopup="menu"` + `aria-expanded`. Giữ nền sáng khi menu con mở (`menuSubTrigger`). Menu con có
   * MenuTimKiem đang mở mà focus còn ở đây → gõ chữ đi vào ô tìm.
   */
  function SubTrigger({
    className,
    icon,
    phim,
    children,
    onKeyDown,
    ...props
  }: ComponentProps<typeof N.SubTrigger> & { icon?: ReactNode; phim?: string[] }) {
    return (
      <N.SubTrigger
        data-slot={`${slot}-sub-trigger`}
        className={cn(menuSubTrigger, className)}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          // aria-controls chỉ có khi menu con đang mở (Radix) → id khung menu con.
          const id = e.currentTarget.getAttribute('aria-controls')
          if (id) vaoOTim(e, e.currentTarget.ownerDocument.getElementById(id))
        }}
        {...props}
      >
        {icon}
        {children}
        {phim && (
          <KbdGroup className="ml-auto">
            {phim.map((k, i) => (
              <Kbd key={i}>{k}</Kbd>
            ))}
          </KbdGroup>
        )}
        <CaretRight aria-hidden="true" className={phim ? undefined : 'ml-auto'} />
      </N.SubTrigger>
    )
  }

  /**
   * Khung menu con: portal vào ô DsRoot như Content, cùng khung `.ui-menu` (z-90), vị trí `MENU_SUB` (mục đầu thẳng hàng
   * mục cha). R14: `collisionPadding` 8 + rộng kẹp theo chỗ trống (menuSubContent) → khổ 390 không tràn ngang. Có
   * MenuTimKiem: gõ chữ ở mục bất kỳ → vào ô; ↑ ở mục đầu → về ô. Focus khi mở: `TuFocusMenuCon`.
   */
  function SubContent({
    className,
    sideOffset = MENU_SUB.sideOffset,
    alignOffset = MENU_SUB.alignOffset,
    collisionPadding = 8,
    onKeyDownCapture,
    children,
    ...props
  }: ComponentProps<typeof N.SubContent>) {
    const container = useDsPortal()
    if (!container) return null
    return (
      <N.Portal container={container}>
        <N.SubContent
          data-slot={`${slot}-sub-content`}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          className={cn(menuSubContent, className)}
          // Pha capture ở khung: chặn trước khi phím tới mục (Enter/Space) và tới typeahead (onKeyDown của khung).
          onKeyDownCapture={(e) => {
            onKeyDownCapture?.(e)
            const m = e.currentTarget
            const o = m.querySelector<HTMLInputElement>(O_TIM)
            if (o && e.key === 'ArrowUp' && e.target === m.querySelector('[role^="menuitem"]')) {
              e.preventDefault()
              e.stopPropagation()
              o.focus()
              return
            }
            vaoOTim(e, m)
          }}
          {...props}
        >
          {children}
          <TuFocusMenuCon />
        </N.SubContent>
      </N.Portal>
    )
  }

  return { Group, CheckboxItem, RadioGroup, RadioItem, Shortcut, Sub, SubTrigger, SubContent }
}

export const {
  Group: DropdownMenuGroup,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
} = taoPhanMenu(DropdownMenuPrimitive, 'dropdown-menu')

/**
 * Ô gõ để tìm ở đầu menu con (CHUAN-FILTER: >10 mục phải gõ được — vd Người làm). Bên gọi tự lọc danh sách theo `value`.
 * Menu con mở → focus vào ô (`TuFocusMenuCon`). Phím trong ô là để gõ: chặn typeahead và ←/→ của Radix; ↓ sang mục đầu;
 * Enter chọn mục khi danh sách còn ĐÚNG 1 (nhiều mục thì Enter không đoán); Esc/Tab để Radix xử lý (Esc đóng hết menu).
 * IME đang ghép (Telex/VNI) → không xử lý Enter/↓. Tên đọc mặc định = placeholder.
 */
export function MenuTimKiem({
  value,
  onValueChange,
  placeholder,
  onKeyDown,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange'> & { value: string; onValueChange(v: string): void }) {
  return (
    <div data-slot="menu-tim-kiem" className={menuTimKiem}>
      <Input
        icon={<MagnifyingGlass />}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        {...props}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === 'Tab' || e.key === 'Escape') return
          e.stopPropagation()
          if (e.nativeEvent.isComposing) return
          const muc = e.currentTarget.closest('[role="menu"]')?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            muc[0]?.focus()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (muc.length === 1) muc[0].click()
          }
        }}
      />
    </div>
  )
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn(menuLabel, className)} {...props} />
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  )
}
