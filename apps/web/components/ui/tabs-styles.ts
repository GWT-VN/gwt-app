// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
// File THƯỜNG (không 'use client'): chuỗi class của Tabs — server component / component khác dùng lại được.
// Giá trị chép từ khối `.ui-tabs-*` trong ds/nguon/bundle.css (bản 40). Mỗi biến thể một chuỗi trọn vẹn, KHÔNG trông
// vào tailwind-merge để đè (tránh lệch thứ tự biến thể Tailwind 4 so với cascade nguồn — luật NGUON lát 3).
import { cva } from 'class-variance-authority'

/**
 * Gốc `Tabs` (shadcn: `group/tabs flex gap-2`, ngang thì cột). Bỏ `gap-2`: khoảng tab ↔ panel là đệm trên 12 của
 * `.ui-tabs-panel` (`tabsContent`) như artifact. Dọc: hàng, cách 12.
 */
export const tabsRoot =
  'group/tabs flex border-none border-current data-[orientation=horizontal]:flex-col data-[orientation=vertical]:gap-3'

/** `.ui-tabs-list` (segmented): rãnh pill xám cao 32, đệm 2, cách 2; tối nền gray-0. */
export const tabsListSegmented = [
  'inline-flex items-center gap-0.5 h-(--control-size-md) p-0.5 rounded-(--radius-full) border-none border-current',
  'bg-(--gray-100) in-data-[theme=dark]:bg-(--gray-0)',
].join(' ')

/**
 * `variant="line"` (shadcn, artifact chưa có): không rãnh, cách 4, cao như segmented; tab đang chọn kẻ 2px foreground
 * dưới chân (vạch `::after` của `tabsTriggerLine`). Đệm chỉ dọc (2): mép tab đầu = mép khung chứa (Xem nhanh 26/11 — mép
 * tab đầu thẳng mép nội dung panel).
 */
export const tabsListLine =
  'inline-flex items-center gap-1 h-(--control-size-md) py-0.5 px-0 rounded-none bg-transparent border-none border-current'

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

/**
 * Khung hàng `line` + `thuGon`: như `tabsKhung` (đệm 2 + lề âm 2 chừa vòng focus) nhưng KHÔNG cuộn — thu gọn đã lo phần
 * tràn; `overflow-x: clip` không ép trục dọc thành cuộn nên vạch chọn (thò 5px dưới chân tab) không bị cắt.
 */
export const tabsKhungLine =
  'flex items-center gap-1 min-w-0 w-[calc(100%+--spacing(1))] -m-0.5 p-0.5 border-none border-current overflow-x-clip'

/**
 * `tabsListVariants` — tên + giá trị shadcn (`default` / `line`) cộng phần GWT (`segmented` = `default`, `pill`). Phần
 * chung shadcn giữ lại: `group/tabs-list`, `w-fit` (gốc là flex cột → không giãn), dọc thì cột + cao theo nội dung.
 */
export const tabsListVariants = cva(
  'group/tabs-list w-fit group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
  {
    variants: {
      variant: {
        default: tabsListSegmented,
        line: tabsListLine,
        segmented: tabsListSegmented,
        pill: tabsListPill,
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

/** Phần chung `.ui-tabs-trigger`: 14px/1, muted; hover / đang chọn chữ foreground; focus phím outline 2 ring sát; tắt. */
const triggerChung = [
  'inline-flex items-center gap-1.5 border-none border-current bg-transparent cursor-pointer',
  'text-[14px] leading-none text-muted-foreground',
  // Icon trước chữ (Phosphor, học Twenty 26/11): cỡ token icon md như Button/Toggle cùng cỡ control; icon tự đặt `size-*`
  // (caret của "Thêm") giữ cỡ của nó.
  '[&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-(--control-icon-size-md)',
  'transition-[background-color,color] duration-150 ease-[ease]',
  'hover:text-foreground data-[state=active]:text-foreground aria-expanded:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring',
  'disabled:text-(--color-text-disabled) disabled:cursor-not-allowed',
  // shadcn: Tabs dọc thì tab giãn hết ngang, chữ dồn trái.
  'group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start',
].join(' ')

/** Tab segmented: 600, đệm ngang gutter-md × 1.33 (16), đang chọn = thumb gray-0 (tối gray-300) + bóng nhẹ. */
export const tabsTriggerSegmented = [
  triggerChung,
  'h-full px-[calc(var(--control-gutter-md)*1.33)] font-semibold rounded-(--radius-full)',
  'data-[state=active]:bg-(--gray-0) in-data-[theme=dark]:data-[state=active]:bg-(--gray-300)',
  'data-[state=active]:[box-shadow:0_1px_4px_-1px_rgba(0,0,0,0.2)]',
].join(' ')

/**
 * Tab `line` (shadcn): như segmented nhưng không thumb/bóng; đang chọn = vạch 2px foreground dưới chân (cách 5 như
 * shadcn `bottom-[-5px]`), hiện mờ dần. Dọc: vạch bên phải. Đệm ngang 12 như pill (CEO 26/11 siết tab; trước 16 như
 * segmented); không xuống dòng, không co (thu gọn đo bề rộng thật).
 */
export const tabsTriggerLine = [
  triggerChung,
  // Bo radius-sm (không full): vòng focus ôm chữ như ô chữ nhật — vòng viên thuốc quanh tab gạch chân trông lạc (CEO 26/11).
  'relative h-full px-3 font-semibold whitespace-nowrap shrink-0 rounded-(--radius-sm)',
  "after:content-[''] after:absolute after:border-none after:border-current after:bg-foreground after:opacity-0",
  'after:transition-opacity data-[state=active]:after:opacity-100',
  'group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-[5px] group-data-[orientation=horizontal]/tabs:after:h-0.5',
  'group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5',
].join(' ')

/** Nút "+N Thêm ▾" của hàng `line` thu gọn: như tab line (cao 28 = tab trong rãnh 32), không vạch (không phải tab). */
export const tabsThemLine = [triggerChung, 'h-7 px-3 font-semibold whitespace-nowrap shrink-0 rounded-(--radius-sm)'].join(' ')

/**
 * Tab pill: cao control-size-md (32), đệm 0 12, 500, không xuống dòng, không co; đang chọn nền alpha-05, không bóng,
 * cả hai theme (rule pill nguồn 0,4,0 thắng rule thumb tối 0,3,0). Dùng chung cho nút "Thêm" của hàng thu gọn.
 * Siết 26/11 (CEO "siết padding các tab này"): trước là 36 / đệm 16 như nguồn artifact → khi đẩy lên artifact sửa
 * `.ui-tabs-pill .ui-tabs-trigger` theo (height 32, padding 0 12).
 */
export const tabsTriggerPill = [
  triggerChung,
  'h-(--control-size-md) px-3 font-medium whitespace-nowrap shrink-0 rounded-(--radius-full)',
  'data-[state=active]:bg-(--alpha-05) aria-expanded:bg-(--alpha-05)',
].join(' ')

/**
 * `.ui-tabs-count`: segmented 500 muted (chữ số tỷ lệ như nguồn — nguồn chỉ bật tabular-nums cho pill); pill 12px 400
 * tertiary tabular-nums. `data-color="danger"`: text-danger 500.
 */
export const tabsCount = {
  segmented: 'border-none border-current font-medium',
  line: 'border-none border-current font-medium',
  pill: 'border-none border-current text-[12px] tabular-nums',
  thuong: { segmented: 'text-muted-foreground', line: 'text-muted-foreground', pill: 'font-normal text-(--color-text-tertiary)' },
  danger: 'font-medium text-(--color-text-danger)',
} as const

/**
 * `.ui-tabs-panel`: đệm trên 12; focus phím outline 2 ring cách 2, bo radius-sm. shadcn `flex-1` giữ; KHÔNG chép
 * `outline-none` của shadcn (Tailwind 4: mất vòng focus — luật NGUON).
 */
export const tabsContent = [
  'flex-1 pt-3 border-none border-current group-data-[orientation=vertical]/tabs:pt-0',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:rounded-(--radius-sm)',
].join(' ')
