// File THƯỜNG (không 'use client'): chuỗi class của DetailLayout · NotificationCenter · NotificationMatrix — server
// component gọi được. Giá trị chép từ ds/nguon/bundle.css (bản 40): `.ui-detail*` (khối BỔ SUNG DS TRANG CHI TIẾT),
// `.ui-notif*` + `.ui-notif-matrix*` (khối BỔ SUNG DS THÔNG BÁO) và `.ui-table*` (bảng của ma trận). Px trần = số
// bundle.css gõ đúng như vậy.
// - `border-none border-current` ở mọi phần: thẻ thường ăn preflight `0 solid var(--border)` của app; artifact không viền.
// - Mốc ≤960 viết `[@media(max-width:960px)]:` y `@media (max-width: 960px)` của bundle (`max-[960px]:` là `width < 960`).

const kv = 'border-none border-current'

/* ---------- DetailLayout ---------- */

/** `.ui-detail`: lưới nội dung `minmax(0,1fr)` + thuộc tính 280, căn đầu, gap 40 · ≤960 một cột gap 24. */
export const detail = [
  kv,
  'grid grid-cols-[minmax(0,1fr)_280px] items-start gap-10',
  '[@media(max-width:960px)]:grid-cols-[minmax(0,1fr)] [@media(max-width:960px)]:gap-6',
].join(' ')
/** `.ui-detail-main`: cột gap 20, min-width 0. */
export const detailMain = `${kv} flex min-w-0 flex-col gap-5`
/**
 * `.ui-detail-aside`: dính top 16 · ≤960 hết dính, lên TRÊN nội dung bằng `order: -1` — chỉ đổi thứ tự HIỂN THỊ, DOM giữ
 * nội dung trước (trình đọc màn hình + thứ tự Tab theo logic bản ghi).
 */
export const detailAside = `${kv} sticky top-4 min-w-0 [@media(max-width:960px)]:static [@media(max-width:960px)]:[order:-1]`
/** `.ui-detail-heading`: heading-xs 16/24 600, không lề. */
export const detailHeading = `${kv} m-0 text-[16px] leading-[24px] font-semibold`

/* ---------- NotificationCenter ---------- */

/**
 * `.ui-menu.ui-notif` — ghép SAU `menuContent` qua cn(): rộng min(400, 100vw − 16), cao ≤ min(560, 100vh − 16), không đệm,
 * không cắt (tooltip nút đầu hộp), cột flex — chỉ danh sách cuộn.
 */
export const notifBox =
  'flex w-[min(400px,calc(100vw-16px))] max-h-[min(560px,calc(100vh-16px))] flex-col overflow-visible p-0'
/** `.ui-notif-khung`: cột flex lấp hộp. */
export const notifKhung = `${kv} flex min-h-0 flex-1 flex-col`
/** `.ui-notif-head`: hàng căn giữa gap 4, đệm 12 8 4 16. */
export const notifHead = `${kv} flex items-center gap-1 pt-3 pr-2 pb-1 pl-4`
/** `.ui-notif-title`: 16/24 600, lấp chỗ. */
export const notifTitle = `${kv} m-0 flex-1 text-[16px] leading-[24px] font-semibold`
/** `.ui-notif-tabs`: hàng tab pill đứng đầu dòng, lề 4 16 — đặt trên lớp bọc (khung cuộn của pill nằm trong). */
export const notifTabs = `${kv} mx-4 my-1 self-start`
/**
 * `.ui-notif-list` (tabpanel) — ghép SAU `tabsContent` qua cn(): lấp chỗ, cuộn dọc, đệm 0 8 8, thanh cuộn mảnh, bo hai góc
 * dưới radius-xl (vòng focus của panel rỗng theo góc hộp).
 */
export const notifList = [
  kv,
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-0 px-2 pb-2 [scrollbar-width:thin]',
  'rounded-t-none rounded-b-(--radius-xl) focus-visible:rounded-t-none focus-visible:rounded-b-(--radius-xl)',
].join(' ')
/** `.ui-notif-list .ui-menu-label` — ghép SAU `menuLabel`: không lề, đệm 12 8 4. */
export const notifNhom = 'm-0 pt-3 pb-1'
/** `.ui-notif-list .ui-empty`: đệm 32 16 — ghép SAU EmptyState. */
export const notifRong = 'px-4 py-8'
export const notifUl = `${kv} m-0 flex list-none flex-col gap-0.5 p-0`
/** `.ui-notif-item`: bo radius-lg, rê → nền accent (MỘT lớp — nút đánh dấu không chồng nền). */
export const notifItem = `${kv} relative rounded-(--radius-lg) hover:bg-accent`
/** `.ui-notif-main`: nút cả dòng, hàng gap 12, đệm 8 40 8 8 (chừa nút đánh dấu), chữ kế thừa · focus phím outline 2 ring lùi −2. */
export const notifMain = [
  kv,
  'flex w-full cursor-pointer gap-3 rounded-[inherit] bg-transparent pt-2 pr-10 pb-2 pl-2 text-left text-inherit [font:inherit]',
  '[outline:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
].join(' ')
/** `.ui-notif-icon`: tròn 32 nền alpha-04 icon 16 muted · `gap` danger-soft · `nhac` info-soft. */
export const notifIcon = [
  kv,
  'grid size-8 flex-none place-items-center rounded-(--radius-full) bg-(--alpha-04) text-muted-foreground [&_svg]:size-4',
  'data-[loai=gap]:bg-(--color-background-danger-soft) data-[loai=gap]:text-(--color-text-danger-soft)',
  'data-[loai=nhac]:bg-(--color-background-info-soft) data-[loai=nhac]:text-(--color-text-info-soft)',
].join(' ')
export const notifBody = `${kv} flex min-w-0 flex-col gap-0.5`
/** `.ui-notif-text`: muted, tối đa 2 dòng; tên `b` 500; dòng chưa đọc → foreground. */
export const notifText = `${kv} line-clamp-2 text-muted-foreground in-data-unread:text-foreground [&_b]:font-medium`
/**
 * `.ui-notif-quote`: kẻ trái 2px `border`, đệm trái 8, muted, 2 dòng. Một khai báo `border-style` cho bốn cạnh (chỉ trái
 * solid): utility kiểu solid làm cả cạnh trên solid (luật NGUON).
 */
export const notifQuote =
  'border-current border-l-2 border-l-(--border) [border-style:none_none_none_solid] pl-2 text-muted-foreground line-clamp-2'
/** `.ui-notif-meta`: 12/18 muted. */
export const notifMeta = `${kv} text-[12px] leading-[18px] text-muted-foreground`
/**
 * `.ui-notif-mark` — ghép vào Button ghost icon-sm: góc trên phải (8, 4), chữ muted; rê/nhấn KHÔNG nền (dòng đã có nền),
 * chỉ chữ foreground. Thiết bị có chuột: dòng đã đọc ẩn nút tới khi rê/focus trong dòng (một luật — không tranh thứ tự).
 */
export const notifMark = [
  'absolute top-2 right-1 text-muted-foreground',
  'not-disabled:not-aria-disabled:hover:bg-transparent not-disabled:not-aria-disabled:hover:text-foreground',
  'not-disabled:not-aria-disabled:not-aria-pressed:not-aria-expanded:not-aria-checked:active:bg-transparent active:text-foreground',
  '[@media(hover:hover)]:[li:not([data-unread]):not(:hover):not(:focus-within)>&]:opacity-0',
].join(' ')
/** `.ui-notif-mark .ui-dot` info: chấm 8 tròn. */
export const notifDot = `${kv} block size-2 rounded-(--radius-full) bg-(--color-background-info-solid)`

/* ---------- NotificationMatrix (bảng `.ui-table` + `.ui-notif-matrix`) ---------- */

/** `.ui-table-wrap`: relative (chữ ẩn trong bảng cuộn ngang không kéo giãn trang 390), cuộn ngang, viền 1 border, bo xl, nền card. */
export const maTranKhung =
  'relative w-full overflow-x-auto rounded-(--radius-xl) border border-solid border-(--border) bg-card'
/** `.ui-table`: rộng hết, viền tách 0, 14/20. */
export const maTranBang = `${kv} w-full border-separate border-spacing-0 text-[14px] leading-[20px]`
/**
 * Kẻ dưới 1px `border`, ba cạnh kia KHÔNG viền (kiểu none, màu currentColor như nguồn) — một khai báo `border-style`
 * cho cả bốn cạnh: utility kiểu solid sẽ làm cạnh trên cũng solid (luật NGUON).
 */
const keDuoi = 'border-current border-b border-b-(--border) [border-style:none_none_solid]'
/** Hàng cuối của mỗi tbody hết kẻ dưới (`.ui-table tbody tr:last-child td/th`) — thead không áp. */
const hetKeCuoi = '[tbody>tr:last-child>&]:border-b-0'
/** Phần chung `.ui-table th`: đệm 0 gutter-md, kẻ dưới, căn trái. */
const thChung = `${keDuoi} px-(--control-gutter-md) text-left`
/**
 * `thead th`: dính trên (z 1), cao control-size-lg, nền surface-secondary, 12/18 600 muted, không xuống dòng; cột kênh căn
 * giữa; cột đầu ghim trái (z 2) + kẻ phải inset.
 */
export const maTranThCot = [
  thChung,
  'sticky top-0 z-1 h-(--control-size-lg) bg-(--color-surface-secondary) whitespace-nowrap',
  'text-[12px] leading-[18px] font-semibold text-muted-foreground',
  'not-first:text-center first:left-0 first:z-2 first:[box-shadow:inset_-1px_0_0_var(--border)]',
].join(' ')
/**
 * `tbody th[scope=row]`: ghim trái (z 1) nền card + kẻ phải inset; cao theo nội dung, rộng ≥ 180, đệm 8 gutter-md, 14/20 400
 * foreground, xuống dòng được. Rê hàng → nền hover ĐẶC (lớp hover phủ trên card — chữ cuộn bên dưới không lộ).
 */
export const maTranThHang = [
  thChung,
  hetKeCuoi,
  'sticky left-0 z-1 min-w-[180px] bg-card py-2 [box-shadow:inset_-1px_0_0_var(--border)]',
  'text-[14px] leading-[20px] font-normal text-foreground whitespace-normal',
  '[tr:hover>&]:[background:linear-gradient(var(--color-background-primary-outline-hover),var(--color-background-primary-outline-hover)),var(--card)]',
].join(' ')
/** `.ui-notif-matrix-gui`: dòng phụ "Gửi cho: …" block 12/18 muted. */
export const maTranGui = `${kv} block text-[12px] leading-[18px] text-muted-foreground`
/** `tbody th[scope=rowgroup]`: cao control-size-md, nền muted, 12/18 600 muted, không dính. */
export const maTranThKhu = [
  thChung,
  // z 1 kế thừa từ `.ui-table th` (vô tác dụng khi static — giữ cho computed khớp nguồn)
  'static z-1 h-(--control-size-md) bg-muted whitespace-nowrap text-[12px] leading-[18px] font-semibold text-muted-foreground',
].join(' ')
/** `.ui-notif-matrix-khu th > span`: tên khu dính trái gutter-md khi cuộn ngang. */
export const maTranTenKhu = `${kv} sticky left-(--control-gutter-md)`
/** `.ui-table td` + `.ui-notif-matrix td`: cao control-size-xl, đệm 0 gutter-md, kẻ dưới, căn giữa; rê hàng → nền hover. */
export const maTranO = [
  keDuoi,
  hetKeCuoi,
  'h-(--control-size-xl) px-(--control-gutter-md) text-center whitespace-nowrap',
  '[tr:hover>&]:bg-(--color-background-primary-outline-hover)',
].join(' ')
/** `.ui-notif-matrix-o`: flex căn giữa gap 8 (ô hàng 2 dòng canh giữa dọc, không lệch baseline). */
export const maTranOChon = `${kv} flex items-center justify-center gap-2`
/** `.ui-notif-matrix-na`: "—" color-text-tertiary. */
export const maTranNa = `${kv} text-(--color-text-tertiary)`
/** `.ui-notif-matrix-select .ui-select-trigger`: rộng 120. */
export const maTranChon = 'w-[120px]'
/** `.ui-caption` + `.ui-notif-matrix-luu`: 12/18 muted, cách bảng 12. */
export const maTranLuu = `${kv} mt-3 mb-0 text-[12px] leading-[18px] text-muted-foreground`
