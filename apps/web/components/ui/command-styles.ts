import { cn } from '@/lib/utils'
import { menuItem, menuSeparator, menuShortcut } from './menu-styles'

/**
 * Kiểu Command (shadcn `command.tsx`) + CommandPalette. Chỉ là chuỗi class (file THƯỜNG: khối /ds server và mặt tĩnh
 * `tinh` dùng chung với command.tsx).
 *
 * Phần 1 — mặc định của các phần Command: cỡ GỌN theo `.ui-menu*` của ds/nguon/bundle.css (như shadcn: Command gọn, dùng
 * trong pop; CommandDialog phóng to). Combobox dùng gần nguyên (chỉ thêm lề tràn mép pop), CommandPalette phủ bằng
 * `.ui-command-*` ở phần 2 qua `className` (`cn` đè đúng phần trùng).
 *
 * Phần 2 — CommandPalette: chép từ khối "CommandPalette" (`dialog.ui-command`, `.ui-command-*`) của bundle.css bản 40.
 * `border-none border-current` ở div/span: preflight của app gắn `0 solid var(--border)`; nguồn không viền. Mốc ≤640 viết
 * `[@media(max-width:640px)]` y `@media (max-width: 640px)` của bundle.
 */

/** `Command` (shadcn: flex cột, cắt tràn, bo md, nền popover): bo radius-xl như mặt `.ui-menu`, chữ 14/20. */
export const command = [
  'flex h-full w-full flex-col overflow-hidden rounded-(--radius-xl) border-none border-current outline-none',
  'bg-popover text-popover-foreground text-[14px] leading-[20px]',
].join(' ')

/**
 * `CommandInput` — hàng bọc (`.ui-menu-search`): cao 32, padding 0 8, gap 8, chỉ kẻ dưới `border`; focus trong ô → gạch
 * alpha-50. Kính lúp 16 muted (shadcn: opacity 50).
 */
export const commandInputWrapper = [
  'flex shrink-0 items-center gap-2 h-(--control-size-md) px-2',
  'border-none border-current [border-bottom:1px_solid_var(--border)] focus-within:[border-bottom-color:var(--alpha-50)]',
].join(' ')
export const commandInputIcon = 'size-4 shrink-0 text-muted-foreground'
/** Ô gõ: 14/20 400, placeholder tertiary, không viền/nền; tắt → not-allowed + mờ 50 (shadcn). */
export const commandInput = [
  'flex-1 min-w-0 h-full border-none border-current bg-transparent [outline:none]',
  'text-[14px] leading-[20px] font-normal text-foreground placeholder:text-(--color-text-tertiary)',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

/** `CommandList` (`.ui-menu-list`): trần cao 240 (bundle gõ 240px; shadcn 300), cuộn dọc, thanh cuộn alpha-30, đệm gutter. */
export const commandList = [
  'max-h-[240px] scroll-py-1 overflow-x-hidden overflow-y-auto p-(--menu-gutter)',
  '[scrollbar-color:var(--alpha-30)_transparent] border-none border-current outline-none',
].join(' ')

/** `CommandEmpty` (`.ui-menu-empty`): padding 6 8, 12/18 muted (shadcn: py-6 giữa). */
export const commandEmpty = 'px-2 py-1.5 border-none border-current text-[12px] leading-[18px] text-muted-foreground'

/** `CommandGroup`: tên nhóm = `.ui-menu-label` (padding 6 8, 12/18 600 muted). */
export const commandGroup = [
  'overflow-hidden border-none border-current text-foreground',
  '[&_[cmdk-group-heading]]:border-none [&_[cmdk-group-heading]]:border-current',
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px]',
  '[&_[cmdk-group-heading]]:leading-[18px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground',
].join(' ')

/** `CommandSeparator` (`.ui-menu-sep`): cao 1, nền border, tràn mép (shadcn −mx-1). */
export const commandSeparator = menuSeparator

/**
 * `CommandItem` (`.ui-menu-item`): cmdk đánh dấu mục sáng bằng `data-selected` (không phải `data-highlighted` của Radix)
 * → nền alpha-08 (tối alpha-10); tắt (`data-disabled`) → không nhận chuột, chữ disabled (shadcn: mờ 50).
 */
export const commandItem = cn(
  menuItem,
  'data-[selected=true]:bg-(--menu-item-bg)',
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:text-(--color-text-disabled)',
)

/** `CommandShortcut` (`.ui-menu-shortcut`): căn phải, 12/18 muted. */
export const commandShortcut = menuShortcut

/**
 * `CommandDialog` (shadcn: DialogContent `overflow-hidden p-0` + Command phóng to): khung hộp dialog-styles, thân theo
 * `.ui-command-*` — hàng gõ cao 52 đệm 16/12 gap 10, chữ 16/24, mục cao tối thiểu 40 gap 10, danh sách đệm 6.
 */
export const commandDialogContent = 'overflow-hidden p-0'
export const commandDialog = [
  '**:data-[slot=command-input-wrapper]:h-auto **:data-[slot=command-input-wrapper]:gap-2.5',
  '**:data-[slot=command-input-wrapper]:pl-4 **:data-[slot=command-input-wrapper]:pr-3',
  '**:data-[slot=command-input]:h-[52px] **:data-[slot=command-input]:text-[16px] **:data-[slot=command-input]:leading-[24px]',
  '**:data-[slot=command-list]:max-h-[min(400px,60dvh)] **:data-[slot=command-list]:p-1.5',
  '**:data-[slot=command-item]:min-h-(--control-size-xl) **:data-[slot=command-item]:gap-2.5',
].join(' ')

/* ——— Phần 2: CommandPalette ——— */

/**
 * `dialog.ui-command` (phần không phụ thuộc vị trí — dùng chung hộp nổi và mặt tĩnh của /ds): cột flex, padding 0, bo
 * radius-2xl, cắt tràn, rộng min(640, 100% − 32), cao ≤ min(520, 76dvh) (≤640: rộng 100% − 16, cao ≤ 100dvh − 16),
 * nền popover, bóng shadow + hairline. Đoạn khớp `mark`: đậm 600, không tô (bundle `.ui-command mark`).
 */
export const hop = [
  'flex flex-col overflow-hidden p-0 border-none border-current outline-none',
  'w-[min(640px,calc(100%-32px))] max-w-none max-h-[min(520px,76dvh)]',
  '[@media(max-width:640px)]:w-[calc(100%-16px)] [@media(max-width:640px)]:max-h-[calc(100dvh-16px)]',
  'rounded-(--radius-2xl) bg-popover text-popover-foreground [box-shadow:var(--shadow),var(--shadow-hairline)]',
  '[&_mark]:bg-transparent [&_mark]:text-inherit [&_mark]:font-semibold',
].join(' ')

/**
 * Hộp nổi: fixed, cách đỉnh 12vh, giữa ngang (≤640: sát mép 8). z-70 = lớp dialog (thang z ds/NGUON.md; artifact dùng
 * top layer của `<dialog>`).
 * Hiện: `ui-dialog-len` 160ms cubic-bezier(0.19, 1, 0.22, 1) từ opacity 0, translateY(4px) scale(0.98) — transition +
 * @starting-style như dialog-styles.ts; tắt khi giảm chuyển động.
 */
export const hopNoi = [
  hop,
  // Hộp dựng trên DialogContent (dialog.tsx): bỏ `h-fit` / `min-w-[250px]` của khung dialog chung.
  'h-auto min-w-0',
  'fixed inset-x-0 top-[12vh] bottom-auto z-70 mx-auto my-0 [@media(max-width:640px)]:top-2',
  'transition-[opacity,translate,scale] duration-160 ease-[cubic-bezier(0.19,1,0.22,1)]',
  'starting:opacity-0 starting:translate-y-1 starting:scale-[0.98] motion-reduce:transition-none',
].join(' ')

/** Gốc cmdk trong hộp: cột flex co theo hộp → danh sách cuộn bên trong, ô gõ + chân đứng yên. */
export const goc = 'flex flex-1 min-h-0 flex-col border-none border-current outline-none'

/**
 * `.ui-command-input`: flex giữa, gap 10, padding 0 12 0 16, chỉ kẻ dưới `border`. Icon 16 muted. Phủ mặc định gọn của
 * `CommandInput` (cao 32, gạch alpha-50 khi focus — nguồn không đổi gạch).
 */
export const hangGo = [
  'flex shrink-0 items-center gap-2.5 pl-4 pr-3 h-auto focus-within:[border-bottom-color:var(--border)]',
  'border-none border-current [border-bottom:1px_solid_var(--border)]',
  '[&>svg]:size-(--control-icon-size-sm) [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
].join(' ')

/**
 * `.ui-command-input input`: cao 52 (bundle gõ 52px), chữ 16/24 400 (Safari iOS không tự phóng to), placeholder tertiary.
 * Padding 1 2 = mặc định trình duyệt của input mà bundle không đặt lại (preflight app đặt 0) — giữ cho khớp số.
 */
export const oGo = [
  'flex-1 min-w-0 h-[52px] px-0.5 py-px border-none border-current bg-transparent text-foreground [outline:none]',
  'text-[16px] leading-[24px] font-normal placeholder:text-(--color-text-tertiary)',
].join(' ')

/** `.ui-command-esc`: Kbd "Esc" cuối ô gõ, ẩn ≤640 (điện thoại không có bàn phím cứng). */
export const phimEsc = '[@media(max-width:640px)]:hidden'

/** `.ui-command-list`: co giãn, cuộn dọc, overscroll contain, padding 6. Tên nhóm = `.ui-menu-label` (flex, gap 6). */
export const danhSach = [
  // Phủ mặc định của CommandList: không trần 240 (co theo hộp), thanh cuộn mặc định trình duyệt.
  'flex-1 min-h-0 max-h-none overflow-y-auto overscroll-contain p-1.5 border-none border-current outline-none [scrollbar-color:auto]',
  '[&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-1.5',
  '[&_[cmdk-group-heading]]:border-none [&_[cmdk-group-heading]]:border-current',
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px]',
  '[&_[cmdk-group-heading]]:leading-[18px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground',
].join(' ')

/** `.ui-command-dem`: số khớp cạnh tên nhóm, 400, tertiary. */
export const dem = 'font-normal text-(--color-text-tertiary)'

/**
 * `.ui-command-item`: flex giữa, gap 10, cao tối thiểu control-size-xl 40, padding 6 8, bo radius-sm, 14/20, con trỏ tay.
 * Đang chọn (cmdk `data-selected`, cùng lúc `aria-selected`): nền alpha-08 (tối alpha-10). Icon đầu 16 muted.
 */
export const dong = [
  'flex items-center gap-2.5 min-h-(--control-size-xl) px-2 py-1.5 rounded-(--radius-sm) border-none border-current',
  'text-[14px] leading-[20px] cursor-pointer',
  'data-[selected=true]:bg-(--alpha-08) in-data-[theme=dark]:data-[selected=true]:bg-(--alpha-10)',
  '[&>svg]:size-(--control-icon-size-sm) [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
].join(' ')

/** `.ui-command-text` / `-ten` / `-phu`: cột co, cắt `…`; tên số thẳng cột; phụ 12/18 muted. */
export const chu = 'flex flex-1 min-w-0 flex-col border-none border-current'
export const ten = 'truncate tabular-nums border-none border-current'
export const phu = 'truncate text-[12px] leading-[18px] text-muted-foreground border-none border-current'

/** `.ui-menu-empty.ui-command-rong`: câu "không thấy" ngoài listbox — padding 16 16 4, 12/18 muted. */
export const rong = 'px-4 pt-4 pb-1 text-[12px] leading-[18px] text-muted-foreground border-none border-current'

/**
 * `.ui-command-foot`: flex giữa, gap 16, padding 8 16, kẻ trên `border`, 12/18 muted; mỗi cụm inline-flex gap 4; cụm cuối
 * đẩy phải. Ẩn ≤640.
 */
export const chan = [
  'flex shrink-0 items-center gap-4 px-4 py-2 border-none border-current [border-top:1px_solid_var(--border)]',
  'text-[12px] leading-[18px] text-muted-foreground [@media(max-width:640px)]:hidden',
  '[&>span]:inline-flex [&>span]:items-center [&>span]:gap-1 [&>span:last-child]:ml-auto',
].join(' ')
