/**
 * Kiểu menu dùng chung (DropdownMenu, ContextMenu…) — chép từ khối `.ui-menu*` của ds/nguon/bundle.css
 * ("Popover / Menu (OpenAI Menu.module.css)"). Chỉ là chuỗi class: component tự gắn vào primitive Radix của nó.
 * `border-none border-current` ở mọi phần: div/span Radix ăn preflight `0 solid var(--border)` của app; artifact là
 * `border: 0` / không viền (cùng cách Tooltip).
 */

/** `.ui-menu`: min 200, padding --menu-gutter (6), bo --radius-xl (12), nền popover, shadow + hairline, chữ 14/20. */
export const menuContent = [
  'z-50 min-w-[200px] p-(--menu-gutter) rounded-(--radius-xl) border-none border-current outline-none',
  'bg-popover text-popover-foreground [box-shadow:var(--shadow),var(--shadow-hairline)] text-[14px] leading-[20px]',
].join(' ')

/**
 * `.ui-menu-item`: flex, gap 6 (--menu-item-gap), padding 6 8, bo 6 (= --menu-radius − --menu-gutter, bundle.css gõ
 * 6px), con trỏ pointer. Mục đang sáng = `data-highlighted` của Radix (chuột rê hoặc phím ↑/↓ — Radix chỉ cho MỘT mục
 * sáng) → nền alpha-08, tối alpha-10 (--menu-item-background-color). KHÔNG tô theo `:hover`: chuột nằm trên X rồi ↓
 * sang Y thì X vẫn :hover → hai mục sáng cùng lúc. Focus phím: viền 2px ring lùi vào −2 (trừ khi đang bị trỏ).
 * Chặn quyền (`aria-disabled`, xem `itemDisabled`): vẫn hiện, focus được, chữ color-text-disabled, not-allowed, nền
 * trong suốt kể cả khi đang sáng (y `.ui-menu-item[aria-disabled="true"]` khai sau `[data-highlighted]`). Icon 16 màu
 * muted-foreground (icon có class `text-*` riêng — vd ✓ của checkbox — giữ màu của nó, như `.ui-menu-item .ui-check`).
 */
export const menuItem = [
  'relative flex w-full items-center gap-1.5 px-2 py-1.5 rounded-[6px] border-none border-current',
  // [outline:none] (shorthand, không phải outline-none): reset cả width/màu của rule UA :focus-visible khi Radix focus item.
  'cursor-pointer select-none [outline:none] text-left',
  '[--menu-item-bg:var(--alpha-08)] in-data-[theme=dark]:[--menu-item-bg:var(--alpha-10)]',
  'data-highlighted:bg-(--menu-item-bg) aria-disabled:data-highlighted:bg-transparent',
  // Vòng focus: y `.ui-menu-item:focus-visible`, NHƯNG bỏ khi item đang bị trỏ — Radix gọi focus() lúc rê chuột, và
  // Chrome tính focus() đó là :focus-visible khi chưa có cú click nào đổi focus (trigger chặn mousedown) → rê chuột hiện
  // vòng (đo thật ở so-khop). Bàn phím + chuột nằm trên item khác vẫn thấy vòng.
  '[&:focus-visible:not(:hover)]:outline-2 [&:focus-visible:not(:hover)]:outline-solid',
  '[&:focus-visible:not(:hover)]:-outline-offset-2 [&:focus-visible:not(:hover)]:outline-ring',
  'aria-disabled:cursor-not-allowed aria-disabled:text-(--color-text-disabled)',
  '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg:not([class*=text-])]:text-muted-foreground',
].join(' ')

/** `.ui-menu-item[data-variant="destructive"]`: chữ color-text-danger, icon theo màu chữ. Ghép SAU menuItem qua cn(). */
export const menuItemDestructive = 'text-(--color-text-danger) [&>svg:not([class*=text-])]:text-current'

/** `.ui-menu-label`: padding 6 8, 12/18, 600, muted-foreground. */
export const menuLabel =
  'px-2 py-1.5 border-none border-current text-[12px] leading-[18px] font-semibold text-muted-foreground'

/** `.ui-menu-sep`: cao 1, nền border, tràn mép menu (margin 6 −6). */
export const menuSeparator = 'h-px my-1.5 -mx-(--menu-gutter) border-none border-current bg-border'

/** `.ui-menu-shortcut`: căn phải, 12/18, muted-foreground. */
export const menuShortcut = 'ml-auto border-none border-current text-[12px] leading-[18px] text-muted-foreground'

/** `.ui-menu-item .ui-check`: ✓ căn phải, 16, màu foreground. Gắn lên chính <svg> (con trực tiếp của item). */
export const menuCheck = 'ml-auto size-4 shrink-0 text-foreground'

/**
 * Item disabled theo WAI-ARIA APG (menu pattern): VẪN focus được — ↑/↓ và gõ chữ đầu dừng ở nó, có vòng focus — nhưng
 * không kích hoạt; người dùng thấy (và trình đọc màn hình đọc) thao tác kèm lý do bị chặn. Vì thế KHÔNG truyền
 * `disabled` cho Radix (Radix loại item khỏi bàn phím): tự gắn `aria-disabled` + `data-disabled`, và `onSelect`
 * preventDefault (menu không đóng, onSelect của bên gọi không chạy). Checkbox: bên gọi còn phải bỏ onCheckedChange —
 * Radix gọi nó bất kể preventDefault.
 */
export function itemDisabled(disabled: boolean | undefined, onSelect?: (e: Event) => void) {
  return disabled
    ? { 'aria-disabled': true as const, 'data-disabled': '', onSelect: (e: Event) => e.preventDefault() }
    : { onSelect }
}
