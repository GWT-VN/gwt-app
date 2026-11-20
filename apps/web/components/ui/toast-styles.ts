// File THƯỜNG (không 'use client'): hằng + chuỗi class của Toast — giá trị chép từ khối `.ui-toast`, `.ui-toast-x`,
// `.ui-toast .ui-progress`, `.ui-toast > .ui-spinner` trong ds/nguon/bundle.css (bản 40).
import { cn } from '@/lib/utils'

/** Thang z NGUON.md: toast 56 — dưới dialog/overlay 70 (toast nằm dưới hộp đang mở). Sonner gốc đặt 999999999. */
export const Z_TOAST = 56
/** `.ui-toast { bottom: 72px }` — trên thanh thao tác hàng loạt. */
export const CACH_DAY = 72
/** Dấu của BulkActionBar (`chon_thanh` trong bang-styles.ts) — thanh đang hiện thì toast đẩy lên. */
export const THANH_HANG_LOAT = 'ds-thanh-hang-loat'
/**
 * Lớp của toaster Sonner (`<ol>`): thanh thao tác hàng loạt đang hiện trong vùng DS → đáy 124, ≤767 lên 236 (nguồn
 * `.b-hangloat ~ .ui-toast`, mốc `@media (max-width: 767px)` của bundle.css; thanh điện thoại cao tới ~96px, 2–3 dòng).
 * Chỉ CSS (`:has` trên gốc `[data-ds=v2]`), không JS. Sonner đặt `--offset-bottom` / `--mobile-offset-bottom` (≤600) inline
 * → cần `!`. Viết nguyên văn để Tailwind quét được.
 */
export const toasterLop = [
  'in-[[data-ds=v2]:has(.ds-thanh-hang-loat)]:[--offset-bottom:124px]!',
  'in-[[data-ds=v2]:has(.ds-thanh-hang-loat)]:[--mobile-offset-bottom:236px]!',
  'max-[767px]:in-[[data-ds=v2]:has(.ds-thanh-hang-loat)]:[--offset-bottom:236px]!',
].join(' ')
/** Thành công tự tắt sau 5 giây (README Toast). */
export const THOI_GIAN_XONG = 5000

/**
 * `<li data-sonner-toast>` của Sonner (lớp vị trí + chồng toast). Trải hết bề ngang toaster (bề ngang − 32 = cách mép 16),
 * trong suốt + không nhận chuột (chỉ viên thuốc nhận) → không chặn bấm trang dưới dải đó.
 * Chuyển động: Sonner trượt từ 100% trong 400ms → DS ghi đè `--y` lúc chưa gắn thành 8px và 180ms
 * cubic-bezier(0.19, 1, 0.22, 1) như `ui-toast-len`. Giảm chuyển động: Sonner tự `transition:none!important`; DS tắt thêm.
 * Focus vào li (Sonner cho tabIndex 0): bỏ bóng vuông của Sonner, vòng focus vẽ trên viên thuốc (`toastVien`).
 */
export const toastLi = [
  'pointer-events-none inset-x-0',
  'focus-visible:shadow-none!',
  'duration-180! ease-[cubic-bezier(0.19,1,0.22,1)]! data-[mounted=false]:[--y:translateY(8px)]!',
  'motion-reduce:transition-none!',
].join(' ')

/** Viên thuốc `.ui-toast` (đảo màu: nền primary-solid). Căn giữa margin-inline auto + max-content như nguồn. */
export const toastVien = [
  'pointer-events-auto mx-auto flex w-max max-w-full items-center gap-2.5 py-2 pr-2 pl-3.5',
  // border-none border-current = nguồn không có viền (preflight gắn `0 solid` + màu viền chung của app).
  'border-none border-current rounded-(--radius-full) bg-(--color-background-primary-solid) text-(--color-text-primary-solid)',
  // Toaster của Sonner đặt font hệ thống → lấy lại font DS; 14/20 như `.ui-toast`.
  'font-[family-name:var(--font-sans)] text-[14px] leading-[20px] [box-shadow:var(--shadow)]',
  '[&_svg]:size-(--control-icon-size-xs) [&_svg]:shrink-0',
  'in-focus-visible:outline-2 in-focus-visible:outline-offset-2 in-focus-visible:outline-ring',
].join(' ')

/** Icon ✓: green-400, tối green-600 (4.2:1 trên nền sáng của toast tối). */
export const toastIconXong = 'text-(--green-400) in-data-[theme=dark]:text-(--green-600)'
/** Icon lỗi: red-400, tối red-600 (5.6:1). */
export const toastIconLoi = 'text-(--red-400) in-data-[theme=dark]:text-(--red-600)'

/** `.ui-toast button` (Hoàn tác / Thử lại): cao 26, pill, nền primary-solid-hover, 500 12px/1. `border-none border-current` = `border: 0`. */
export const toastNut = [
  'h-(--control-size-xs) shrink-0 cursor-pointer px-2.5 border-none border-current rounded-(--radius-full)',
  'bg-(--color-background-primary-solid-hover) text-(--color-text-primary-solid) text-[12px] leading-none font-medium',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
].join(' ')

/** `.ui-toast-x`: ô vuông 26, icon màu chữ (không mang màu trạng thái). */
export const toastDong = cn(toastNut, 'grid place-content-center w-(--control-size-xs) p-0')

/** `.ui-toast .ui-progress`: rộng 72, cao 4, nền màu chữ 20% (hợp cả hai theme vì toast đảo màu). */
export const toastTienDo =
  'block h-1 w-18 shrink-0 overflow-hidden rounded-(--radius-full) bg-[color-mix(in_srgb,currentColor_20%,transparent)]'
/** Phần chạy: màu chữ, rộng `--p`, đổi rộng 200ms. */
export const toastTienDoChay = 'block h-full w-(--p) rounded-[inherit] bg-current transition-[width] duration-200 ease-[ease]'

/** `.ui-toast > .ui-spinner`: 14px, không co. */
export const toastSpinner = 'size-3.5 shrink-0'
