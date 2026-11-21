// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Kbd — giá trị chép từ `.ui-kbd` trong ds/nguon/bundle.css: cao 20 · rộng tối thiểu 20 · padding 0 4 · radius-xs ·
 * nền background · viền inset 1px alpha-12 · `font: 500 12px/1 var(--font-sans)`.
 * - Shorthand `font:` tách thành family/size/weight/line-height riêng. Family ghi tường minh vì preflight cho <kbd>
 *   font mono (`font-sans` của app là Geist); font-feature-settings `inherit` như bundle.css (preflight đặt normal).
 * - `border-none border-current` = kbd artifact không viền (viền thật là box-shadow inset, không đổi kích thước hộp).
 * - `pointer-coarse:hidden`: thiết bị cảm ứng không có bàn phím → ẩn gợi ý phím (brief lát 2; bundle.css không có rule
 *   này). Đổi Ctrl ↔ ⌘ theo nền tảng: để lát 6 (CommandPalette).
 */
function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-grid place-content-center min-w-5 h-5 px-1 rounded-(--radius-xs) border-none border-current',
        'bg-background [box-shadow:inset_0_0_0_1px_var(--alpha-12)] text-muted-foreground',
        'font-[family-name:var(--font-sans)] font-medium text-[12px] leading-none',
        // preflight đặt <kbd> font-feature-settings về normal; bundle.css .ui-kbd ghi `inherit` → lấy lại cv11/ss03 của DsRoot
        '[font-feature-settings:inherit]',
        'pointer-coarse:hidden',
        // shadcn: không bắt chuột/chọn chữ, icon trong phím 12px
        'pointer-events-none select-none [&_svg]:size-3',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Nhóm phím (vd Ctrl + K): bundle.css `.ui-command-foot > span` — inline-flex, giữa, gap 4px. Thẻ `<kbd>` như shadcn →
 * preflight gắn font mono + font-feature-settings normal cho <kbd> → lấy lại font/feature của vùng DS (chữ "+" giữa phím).
 */
function KbdGroup({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn(
        'inline-flex items-center gap-1 border-none border-current font-[family-name:var(--font-sans)] [font-feature-settings:inherit]',
        className,
      )}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
