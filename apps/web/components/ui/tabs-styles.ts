// File THƯỜNG (không 'use client'): chuỗi class của Tabs — server component / component khác dùng lại được.
// Giá trị chép từ khối `.ui-tabs-*` trong ds/nguon/bundle.css (bản 40). Mỗi biến thể một chuỗi trọn vẹn, KHÔNG trông
// vào tailwind-merge để đè (tránh lệch thứ tự biến thể Tailwind 4 so với cascade nguồn — luật NGUON lát 3).

/** `.ui-tabs-list` (segmented): rãnh pill xám cao 32, đệm 2, cách 2; tối nền gray-0. */
export const tabsListSegmented = [
  'inline-flex items-center gap-0.5 h-(--control-size-md) p-0.5 rounded-(--radius-full) border-none border-current',
  'bg-(--gray-100) in-data-[theme=dark]:bg-(--gray-0)',
].join(' ')

/** `.ui-tabs-list[data-variant="pill"]`: không rãnh, cao theo tab, cách 4 (bo pill giữ từ `.ui-tabs-list`). */
export const tabsListPill =
  'inline-flex items-center gap-1 h-auto p-0 rounded-(--radius-full) bg-transparent border-none border-current'

/**
 * Khung bọc hàng pill (`.b-tabs-cuon` của prototype): cuộn ngang, ẩn thanh cuộn, mờ mép phải 40px khi còn phần tràn
 * bên phải (`data-tran`). Đệm 2 + lề âm 2 mỗi phía: chừa chỗ cho vòng focus 2px của tab — vùng cuộn cắt mọi thứ tràn
 * ra ngoài hộp; tổng bố cục không đổi.
 */
export const tabsKhung = [
  'flex items-center gap-1 min-w-0 w-[calc(100%+--spacing(1))] -m-0.5 p-0.5 border-none border-current',
  'overflow-x-auto [scrollbar-width:none]',
  'data-tran:[mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)]',
].join(' ')

/** Phần chung `.ui-tabs-trigger`: 14px/1, muted; hover / đang chọn chữ foreground; focus phím outline 2 ring sát; tắt. */
const triggerChung = [
  'inline-flex items-center gap-1.5 border-none border-current rounded-(--radius-full) bg-transparent cursor-pointer',
  'text-[14px] leading-none text-muted-foreground',
  'transition-[background-color,color] duration-150 ease-[ease]',
  'hover:text-foreground data-[state=active]:text-foreground aria-expanded:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring',
  'disabled:text-(--color-text-disabled) disabled:cursor-not-allowed',
].join(' ')

/** Tab segmented: 600, đệm ngang gutter-md × 1.33 (16), đang chọn = thumb gray-0 (tối gray-300) + bóng nhẹ. */
export const tabsTriggerSegmented = [
  triggerChung,
  'h-full px-[calc(var(--control-gutter-md)*1.33)] font-semibold',
  'data-[state=active]:bg-(--gray-0) in-data-[theme=dark]:data-[state=active]:bg-(--gray-300)',
  'data-[state=active]:[box-shadow:0_1px_4px_-1px_rgba(0,0,0,0.2)]',
].join(' ')

/**
 * Tab pill: cao control-size-lg (36), đệm 0 16, 500, không xuống dòng, không co; đang chọn nền alpha-05, không bóng,
 * cả hai theme (rule pill nguồn 0,4,0 thắng rule thumb tối 0,3,0). Dùng chung cho nút "Thêm" của hàng thu gọn.
 */
export const tabsTriggerPill = [
  triggerChung,
  'h-(--control-size-lg) px-4 font-medium whitespace-nowrap shrink-0',
  'data-[state=active]:bg-(--alpha-05) aria-expanded:bg-(--alpha-05)',
].join(' ')

/**
 * `.ui-tabs-count`: segmented 500 muted (chữ số tỷ lệ như nguồn — nguồn chỉ bật tabular-nums cho pill); pill 12px 400
 * tertiary tabular-nums. `data-color="danger"`: text-danger 500.
 */
export const tabsCount = {
  segmented: 'border-none border-current font-medium',
  pill: 'border-none border-current text-[12px] tabular-nums',
  thuong: { segmented: 'text-muted-foreground', pill: 'font-normal text-(--color-text-tertiary)' },
  danger: 'font-medium text-(--color-text-danger)',
} as const

/** `.ui-tabs-panel`: đệm trên 12; focus phím outline 2 ring cách 2, bo radius-sm. */
export const tabsContent = [
  'pt-3 border-none border-current',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:rounded-(--radius-sm)',
].join(' ')
