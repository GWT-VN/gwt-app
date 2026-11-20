// File THƯỜNG (không 'use client'): khối /ds server render và màn server dùng được các chuỗi class này.
import { cn } from '@/lib/utils'
import { menuContent } from './menu-styles'

/**
 * `.ui-menu.ui-cal-pop` (+ `.b-noi.ui-cal-pop`): mặt Menu (nền popover, shadow + hairline, z-90) nhưng rộng theo lịch,
 * padding 20/24, bo --radius-4xl 24. Trần cao = chỗ trống Radix tính giữa trigger và mép khung nhìn (đã trừ 8 mỗi mép)
 * + cuộn trong pop (overflow-y của menuContent): khổ 390 nút giữa màn, lịch cao hơn nửa màn → cuộn bên trong, không tràn
 * khỏi màn cắt mất chân (đo 20/11: trước sửa pop tràn tới 904 / 1108 trên màn 844). Ngoài Popover (khối /ds vẽ tĩnh)
 * không có biến → rơi về 100vh − 16 của `.ui-cal-pop`. Khổ ≤ 640: rộng 100vw − 16, padding 16.
 */
export const calendarPop = cn(
  menuContent,
  'min-w-0 w-max px-[24px] py-[20px] rounded-(--radius-4xl)',
  'max-h-[var(--radix-popover-content-available-height,calc(100vh-16px))]',
  'max-[640px]:w-[calc(100vw-16px)] max-[640px]:max-w-[calc(100vw-16px)] max-[640px]:p-[16px]',
)

/** `.ui-cal-foot`: kẻ trên alpha-08, cách lịch 12 (preview gõ margin-top 12), đệm trên 16; trái "Xoá ngày", phải nút chính. */
export const calendarFoot =
  'mt-[12px] flex items-center justify-between gap-3 pt-[16px] border-none border-current [box-shadow:inset_0_1px_0_var(--alpha-08)] max-[640px]:flex-wrap'

/** `.ui-cal-foot .ui-btn[data-variant=ghost]`: gạch chân, cách chữ 0.15em. */
export const calendarFootClear = 'underline underline-offset-[0.15em]'
