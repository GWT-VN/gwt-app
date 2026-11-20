// File THƯỜNG (không 'use client'): khối /ds server render và màn server dùng được các chuỗi class này.
import { cn } from '@/lib/utils'
import { menuContent } from './menu-styles'

/**
 * `.ui-menu.ui-cal-pop` (+ `.b-noi.ui-cal-pop`): mặt Menu (nền popover, shadow + hairline, z-90) nhưng rộng theo lịch,
 * padding 20/24, bo --radius-4xl 24; trần cao 100vh − 16 (lịch cao hơn menu thường, không cắt chân). Khổ ≤ 640: rộng
 * 100vw − 16, padding 16. Xuất ra cho DateRangePicker và khối /ds dùng lại.
 */
export const calendarPop = cn(
  menuContent,
  'min-w-0 w-max px-[24px] py-[20px] rounded-(--radius-4xl) max-h-[calc(100vh-16px)]',
  'max-[640px]:w-[calc(100vw-16px)] max-[640px]:max-w-[calc(100vw-16px)] max-[640px]:p-[16px]',
)

/** `.ui-cal-foot`: kẻ trên alpha-08, cách lịch 12 (preview gõ margin-top 12), đệm trên 16; trái "Xoá ngày", phải nút chính. */
export const calendarFoot =
  'mt-[12px] flex items-center justify-between gap-3 pt-[16px] border-none border-current [box-shadow:inset_0_1px_0_var(--alpha-08)] max-[640px]:flex-wrap'

/** `.ui-cal-foot .ui-btn[data-variant=ghost]`: gạch chân, cách chữ 0.15em. */
export const calendarFootClear = 'underline underline-offset-[0.15em]'
