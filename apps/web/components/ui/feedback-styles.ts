// File THƯỜNG (không 'use client'): chuỗi class dùng chung cho Skeleton, EmptyState, Banner, StatCard — server component
// và khối /ds gọi được. Giá trị chép từ ds/nguon/bundle.css (bản 40): khối Skeleton, EmptyState, Banner, StatCard.

/** div/span ăn preflight `0 solid` của app; phần tử artifact không viền. */
export const khongVien = 'border-none border-current'

/**
 * README Skeleton: "chỉ hiện khi chờ > 300ms (tránh nháy)". CSS thuần (`@starting-style`): vùng chờ mới gắn vào DOM bắt
 * đầu ở opacity 0, nhảy lên 1 sau 300ms (transition 0s, trễ 300ms) — dữ liệu về trước 300ms thì vùng bị gỡ trước khi
 * kịp hiện. Đặt trên VÙNG bọc, không trên từng khối chờ (animation nhấp nháy của khối chờ đè opacity transition).
 */
export const choTre = 'starting:opacity-0 transition-opacity duration-0 delay-300'

// ---------- Skeleton (.ui-skeleton, .ui-skeleton-row) ----------

/** `.ui-skeleton`: cao 12, bo radius-xs, nền muted, nhấp nháy 1.4s (khung hình `pulse` của Tailwind = `ui-pulse`). */
export const skeleton = [
  khongVien,
  'block h-3 rounded-(--radius-xs) bg-(--muted)',
  'animate-[pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none',
  'data-[shape=circle]:size-(--control-size-3xs) data-[shape=circle]:shrink-0 data-[shape=circle]:rounded-(--radius-full)',
  'data-[shape=pill]:h-5 data-[shape=pill]:w-15 data-[shape=pill]:shrink-0 data-[shape=pill]:rounded-(--radius-full)',
  'data-[shape=title]:h-5',
  // Bậc bề rộng: số % của bundle.css (33/66, không phải 1/3 = 33.33%).
  'data-[w="1/4"]:w-[25%] data-[w="1/3"]:w-[33%] data-[w="1/2"]:w-[50%] data-[w="2/3"]:w-[66%] data-[w="3/4"]:w-[75%]',
].join(' ')

/**
 * `.ui-skeleton-row`: dòng bảng — dòng chờ VÀ dòng thật dùng chung (preview: dòng dữ liệu cũng mang class này) → dữ liệu
 * về không nhảy chỗ. Kẻ dưới 1px alpha-05 viết riêng cạnh dưới (không bật viền solid cả bốn cạnh). Khối chờ dòng chữ
 * (không `data-shape`) giãn hết chỗ còn lại.
 */
export const skeletonRow = [
  khongVien,
  'flex items-center gap-3 min-h-(--control-size-2xl) [border-bottom:1px_solid_var(--alpha-05)]',
  '[&>[data-slot=skeleton]:not([data-shape])]:flex-1',
].join(' ')

/** `.ui-skeleton-stack`: chồng dọc cách 10. */
export const skeletonStack = `${khongVien} flex flex-col gap-2.5`

// ---------- EmptyState (.ui-empty*) ----------

export const empty = `${khongVien} flex flex-col items-center gap-1 px-4 py-10 text-center data-[size=sm]:py-6`
export const emptyIcon = [
  khongVien,
  'mb-2 grid size-10 place-content-center rounded-(--radius-full) bg-(--alpha-05) text-muted-foreground [&>svg]:size-5',
  'data-[color=danger]:bg-(--color-background-danger-soft-alpha) data-[color=danger]:text-(--color-text-danger-soft)',
].join(' ')
/** heading-xs 16/24 600. Thẻ heading thật: preflight đã đưa cỡ/đậm/lề về kế thừa. */
export const emptyTitle = `${khongVien} text-[16px] leading-[24px] font-semibold`
export const emptyDesc = `${khongVien} max-w-[360px] text-muted-foreground`
export const emptyActions = `${khongVien} mt-3 flex flex-wrap justify-center gap-2`

// ---------- Banner (.ui-banner*) ----------

/**
 * `.ui-banner`: cao tối thiểu 40, đệm 6/8/6/16, gap 10, 14/20; nền + kẻ dưới (box-shadow inset) theo màu; ≤640 xuống
 * dòng, đệm 8/8/8/12, chữ chiếm hết dòng trừ 64 (nút xuống hàng dưới).
 */
export const banner = [
  khongVien,
  'flex items-center gap-2.5 min-h-(--control-size-xl) py-1.5 pr-2 pl-4 text-[14px] leading-[20px] text-foreground',
  '[&>svg]:size-(--control-icon-size-md) [&>svg]:shrink-0 [&>[data-slot=button]]:shrink-0',
  'max-[640px]:flex-wrap max-[640px]:py-2 max-[640px]:pl-3',
].join(' ')
export const bannerMau = {
  info: 'bg-(--color-background-info-surface) [box-shadow:inset_0_-1px_0_var(--color-border-info-surface)] [&>svg]:text-(--color-text-info)',
  warning:
    'bg-(--color-background-warning-surface) [box-shadow:inset_0_-1px_0_var(--color-border-warning-surface)] [&>svg]:text-(--color-text-warning)',
  danger:
    'bg-(--color-background-danger-surface) [box-shadow:inset_0_-1px_0_var(--color-border-danger-surface)] [&>svg]:text-(--color-text-danger)',
} as const
export const bannerText = `${khongVien} min-w-0 flex-1 max-[640px]:basis-[calc(100%-64px)] [&_b]:font-semibold`

// ---------- StatCard (.ui-stat*, .ui-kpi-*) ----------

export const statGrid = `${khongVien} grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3`
/** `.ui-stat`: viền inset `border` (box-shadow, không đổi hộp), bo radius-xl, nền card. Có liên kết: hover viền alpha-25, focus ring. */
export const stat = [
  khongVien,
  'flex min-w-0 flex-col gap-1 rounded-(--radius-xl) bg-(--card) p-4 text-left text-foreground no-underline',
  '[box-shadow:inset_0_0_0_1px_var(--border)]',
].join(' ')
export const statLink = [
  'group cursor-pointer transition-[box-shadow] duration-150 ease-[ease]',
  'hover:[box-shadow:inset_0_0_0_1px_var(--alpha-25)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
].join(' ')
export const kpiLabel = `${khongVien} text-[12px] leading-[18px] text-muted-foreground`
/** heading-lg 24/28 600, số thẳng cột; đơn vị nằm cùng dòng chân chữ. */
export const kpiValue = `${khongVien} flex items-baseline gap-1 text-[24px] leading-[28px] font-semibold tabular-nums`
export const statUnit = `${khongVien} text-[14px] leading-[20px] font-normal text-muted-foreground`
export const statDelta = [
  khongVien,
  'inline-flex items-center gap-1 text-[12px] leading-[18px] text-muted-foreground [&_svg]:size-3 [&_svg]:shrink-0',
  '[&>b]:inline-flex [&>b]:items-center [&>b]:gap-0.5 [&>b]:font-semibold [&>b]:tabular-nums',
  'data-[nghia=tot]:[&>b]:text-(--color-text-success) data-[nghia=xau]:[&>b]:text-(--color-text-danger)',
].join(' ')
export const statFoot = [
  khongVien,
  'mt-2 inline-flex items-center gap-1 text-[12px] leading-[18px] text-muted-foreground group-hover:text-foreground',
  '[&_svg]:size-3 [&_svg]:transition-transform [&_svg]:duration-150 [&_svg]:ease-[ease] motion-reduce:[&_svg]:transition-none',
  'group-hover:[&_svg]:translate-x-[2px]',
].join(' ')
