// File THƯỜNG (không 'use client'): chuỗi class của 5 component trang chi tiết — server component gọi được.
/**
 * Kiểu Breadcrumb · PageHeader · PropertyList · Timeline · Composer (+ chip tệp), chép từ khối "BỔ SUNG DS TRANG CHI
 * TIẾT 18/11/2026" (`.ui-breadcrumb`, `.ui-page-header*`, `.ui-props*`, `.ui-timeline*`, `.ui-composer*`) và `.ui-chip*`
 * của ds/nguon/bundle.css. Px trần = số bundle.css gõ đúng như vậy.
 * - `border-none border-current` ở mọi phần: thẻ thường ăn preflight `0 solid var(--border)` của app; artifact không viền.
 *   Pseudo tự vẽ (dấu "/", "·", đường nối) cũng tắt viền (preflight gắn cả `::before`).
 * - Mốc ≤640 viết `[@media(max-width:640px)]:` y `@media (max-width: 640px)` của bundle (`max-[640px]:` là `width < 640`).
 */

const kv = 'border-none border-current'

/* ---------- Breadcrumb ---------- */

/** `.ui-breadcrumb` (ol): hàng, gap 6, 14/20 muted-foreground, bỏ lề + dấu đầu dòng. */
export const breadcrumbList = `${kv} m-0 flex min-w-0 list-none items-center gap-1.5 p-0 text-[14px] leading-[20px] text-muted-foreground`
/**
 * `li`: hàng gap 6, không xuống dòng; từ mục thứ hai có "/" vẽ bằng ::before (trình đọc màn hình không đọc).
 * Chỉ mục CUỐI co lại (cắt …): bundle.css cho mọi li `min-width: 0` → chỗ hẹp các liên kết trước cũng co, chữ đè lên
 * nhau (đo ảnh 390, bản hàng "Chỗ hẹp") — DS giữ nguyên các mục trước (`not-last:shrink-0`).
 */
export const breadcrumbItem = [
  kv,
  'flex min-w-0 items-center gap-1.5 whitespace-nowrap not-last:shrink-0',
  // Chỉ khi mục đứng ngay sau MỤC (li + li của bundle.css); dùng BreadcrumbSeparator (shadcn) thì mục sau dấu không vẽ thêm.
  "[[data-slot=breadcrumb-item]+&]:before:content-['/'] [[data-slot=breadcrumb-item]+&]:before:border-none",
  '[[data-slot=breadcrumb-item]+&]:before:border-current [[data-slot=breadcrumb-item]+&]:before:text-(--color-text-tertiary)',
].join(' ')
/** `a`: màu kế thừa, không gạch chân, bo radius-sm · hover foreground · focus-visible outline 2 ring cách 2. */
export const breadcrumbLink = [
  kv,
  'rounded-sm text-inherit no-underline hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
].join(' ')
/** `BreadcrumbSeparator` (phần tử, shadcn): cùng dấu "/" màu tertiary như ::before; icon con 14px. */
export const breadcrumbSeparator = `${kv} flex items-center text-(--color-text-tertiary) [&>svg]:size-3.5`
/** `BreadcrumbEllipsis` (shadcn): ô 32 (control-size-md), icon 16. */
export const breadcrumbEllipsis = `${kv} flex size-(--control-size-md) items-center justify-center [&>svg]:size-4`
/** Mục cuối (`aria-current="page"`): foreground, tabular-nums (mã bản ghi), cắt … khi hẹp. */
export const breadcrumbPage = `${kv} overflow-hidden text-ellipsis text-foreground tabular-nums`

/* ---------- PageHeader ---------- */

export const pageHeader = `${kv} flex flex-col gap-3`
/** Hàng trên: đường dẫn lấp chỗ (con đầu flex 1) + cụm ‹ ›; cao tối thiểu control-size-md. */
export const pageHeaderTop = `${kv} flex min-h-(--control-size-md) items-center gap-2 *:first:min-w-0 *:first:flex-1`
export const pageHeaderNav = `${kv} flex shrink-0 items-center gap-0.5`
/** "3 / 19": ui-caption + đệm 0 6, tabular-nums; ≤640 ẩn (nhường chỗ cho mã bản ghi trên đường dẫn). */
export const pageHeaderViTri = `${kv} px-1.5 text-[12px] leading-[18px] text-muted-foreground tabular-nums [@media(max-width:640px)]:hidden`
/** Tiêu đề + hành động: hàng gap 16; ≤640 xếp dọc gap 12. */
export const pageHeaderMain = `${kv} flex items-start gap-4 [@media(max-width:640px)]:flex-col [@media(max-width:640px)]:gap-3`
export const pageHeaderText = `${kv} min-w-0 flex-1`
/** h1 heading-lg 24/28 600, tối đa 2 dòng rồi …; ≤640 heading-md 20/26. */
export const pageHeaderTitle = [
  kv,
  'm-0 line-clamp-2 text-[24px] leading-[28px] font-semibold [overflow-wrap:anywhere]',
  '[@media(max-width:640px)]:text-[20px] [@media(max-width:640px)]:leading-[26px]',
].join(' ')
/**
 * Meta 12/18 muted-foreground, xuống dòng cách 4. Mỗi mục mang "·" (ô 20px, color-text-tertiary) ở TRƯỚC; cả hàng lùi
 * trái 20 + cắt 20px trái → dấu đầu mỗi dòng (kể cả dòng xuống) bị cắt, không có "·" mồ côi.
 */
export const pageHeaderMeta = [
  kv,
  'mt-1.5 -ml-5 flex flex-wrap items-center gap-y-1 [clip-path:inset(0_0_0_20px)]',
  'text-[12px] leading-[18px] text-muted-foreground',
  "*:before:inline-block *:before:w-5 *:before:border-none *:before:border-current *:before:text-center *:before:text-(--color-text-tertiary) *:before:content-['·']",
].join(' ')
/**
 * Hành động gap 8 (con trực tiếp là nút — trigger menu dùng asChild nên không có lớp bọc). Nút icon (⋯) không co.
 * ≤640: trọn bề ngang, nút chữ chia đều, nút icon giữ vuông.
 */
export const pageHeaderActions = [
  kv,
  'flex shrink-0 items-center gap-2 [&>[data-size^=icon]]:shrink-0',
  '[@media(max-width:640px)]:w-full [@media(max-width:640px)]:[&>:not([data-size^=icon])]:flex-1',
].join(' ')

/* ---------- PropertyList ---------- */

/**
 * `.ui-props` (dl): lưới 2 cột nhãn 112–160 + phần còn lại, gap 6/12 (dòng cách nhau 38 = Notion đo 27/11) · ≤640 nhãn 96–128 ·
 * `data-layout="stack"`: 1 cột, gap 0, nhãn trên giá trị (nhãn hết cao tối thiểu, cách mục trên 10).
 */
export const propsList = [
  kv,
  // items-start (25/11): giá trị nhiều dòng (danh sách người) thì nhãn thẳng DÒNG ĐẦU, không lơ lửng giữa — nhãn và
  // giá trị cùng cao tối thiểu 32 nên dòng một-giá-trị vẫn thẳng tâm như cũ.
  'm-0 grid grid-cols-[minmax(112px,160px)_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5',
  '[@media(max-width:640px)]:not-data-layout:grid-cols-[minmax(96px,128px)_minmax(0,1fr)]',
  'data-[layout=stack]:grid-cols-[minmax(0,1fr)] data-[layout=stack]:gap-0',
  'data-[layout=stack]:[&>dt]:mt-2.5 data-[layout=stack]:[&>dt]:min-h-0 data-[layout=stack]:[&>dt:first-child]:mt-0',
].join(' ')
/** dt: 14/20 muted-foreground, cao tối thiểu 32 (= ô sửa), icon 16 (control-icon-size-sm) — đo Notion 27/11 (CEO: "chữ rất bé"). */
export const propsTerm = [
  kv,
  'flex min-h-(--control-size-md) items-center gap-1.5 text-[14px] leading-[20px] text-muted-foreground',
  '[&_svg]:size-(--control-icon-size-sm) [&_svg]:shrink-0',
].join(' ')
/** dd: 14/20, cao tối thiểu 32 (bằng ô sửa → sửa không nhảy dòng), ngắt từ dài. */
export const propsValue = `${kv} m-0 flex min-h-(--control-size-md) min-w-0 items-center text-[14px] leading-[20px] [overflow-wrap:anywhere]`
export const propsEmpty = `${kv} text-(--color-text-tertiary)`
/** h3 tiêu đề nhóm 12/18 600 foreground, cách nhóm trên 20, dưới 4; đứng đầu thì không cách trên. */
export const propsTitle = `${kv} mt-5 mb-1 text-[12px] leading-[18px] font-semibold text-foreground first:mt-0`

/* ---------- Timeline ---------- */

export const timelineList = `${kv} m-0 list-none p-0`
/** Nhãn ngày 12/18 600 muted-foreground, thụt 36 (thẳng chữ nội dung), lề 4 trên 12 dưới. */
export const timelineDay = `${kv} mt-1 mb-3 pl-9 text-[12px] leading-[18px] font-semibold text-muted-foreground`
/**
 * Mục: lưới mốc 24 + nội dung, cách cột 12, đệm dưới 16. Đường nối 1px alpha-08 từ dưới mốc (top 28) tới đáy − 4,
 * ngắt ở mục cuối danh sách và mục cuối ngày (ngay trước nhãn ngày). Focus chỉ bằng code (tabIndex −1, sau "Xem thêm").
 */
export const timelineItem = [
  kv,
  'relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 pb-4',
  "before:absolute before:top-7 before:bottom-1 before:left-3 before:w-px before:border-none before:border-current before:bg-(--alpha-08) before:content-['']",
  'last:before:hidden has-[+[data-slot=timeline-day]]:before:hidden',
  // bundle.css không có kiểu focus cho mục; thay outline mặc định của trình duyệt bằng outline ring như phần tử DS khác.
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
].join(' ')
/** Mốc tròn 24, nền background + viền inset alpha-10, icon 14 muted. Màu: nền soft-alpha, bỏ viền. */
export const timelineMark = [
  kv,
  'grid size-6 place-content-center rounded-(--radius-full) bg-background text-muted-foreground',
  '[box-shadow:inset_0_0_0_1px_var(--alpha-10)] [&_svg]:size-3.5',
  'data-[color=danger]:bg-(--color-background-danger-soft-alpha) data-[color=danger]:text-(--color-text-danger-soft) data-[color=danger]:[box-shadow:none]',
  'data-[color=success]:bg-(--color-background-success-soft-alpha) data-[color=success]:text-(--color-text-success-soft) data-[color=success]:[box-shadow:none]',
].join(' ')
/** Mốc là Avatar: cỡ mốc 24, giữ nền alpha-08 của Avatar, không viền. */
export const timelineMarkAvatar = 'size-6 bg-(--alpha-08) [box-shadow:none]'
/** Dòng đầu 14/20 muted, tên `b` 500 foreground, giờ 12/18 color-text-tertiary tabular-nums; cao tối thiểu 24, đệm trên 2. */
export const timelineHead = [
  kv,
  'flex min-h-6 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pt-0.5 text-[14px] leading-[20px] text-muted-foreground',
  '[&_b]:font-medium [&_b]:text-foreground',
  '[&_time]:text-[12px] [&_time]:leading-[18px] [&_time]:text-(--color-text-tertiary) [&_time]:tabular-nums',
].join(' ')
/** Bình luận: cột 2, cách trên 6, đệm 10/12, bo radius-xl, viền inset alpha-08, giữ xuống dòng. */
export const timelineBody = [
  kv,
  'col-start-2 mt-1.5 rounded-(--radius-xl) bg-background px-3 py-2.5 text-[14px] leading-[20px]',
  '[box-shadow:inset_0_0_0_1px_var(--alpha-08)] [overflow-wrap:anywhere] whitespace-pre-line',
].join(' ')
export const timelineFiles = `${kv} col-start-2 mt-1.5 flex flex-wrap gap-1.5`
/** Hàng "Hiện N hoạt động cũ hơn": chữ nút thẳng mép nhãn ngày (36 − đệm nút sm). */
export const timelineMore = `${kv} -mt-1 mb-3 ml-[calc(36px-var(--control-gutter-sm))] list-none`

/* ---------- Chip (tệp đính) ---------- */

/** `.ui-chip`: cao control-size-sm 28, đệm 0 10 (có × thì phải 4), bo tròn, nền alpha-05, 400 12/18, không xuống dòng. */
export const chip = [
  kv,
  'inline-flex h-(--control-size-sm) max-w-full items-center gap-1 rounded-(--radius-full) bg-(--alpha-05) px-2.5',
  'text-[12px] leading-[18px] font-normal whitespace-nowrap text-foreground no-underline has-[>[data-slot=chip-x]]:pr-1',
  '[&>span]:overflow-hidden [&>span]:text-ellipsis',
  '[&>svg]:size-(--control-icon-size-xs) [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
].join(' ')
/** `.ui-chip-x`: tròn 20, cách chữ 2, icon 12 muted · hover nền alpha-10 chữ foreground · focus-visible outline 2 ring. */
export const chipX = [
  kv,
  'ml-0.5 grid size-5 shrink-0 cursor-pointer place-content-center rounded-(--radius-full) bg-transparent p-0',
  'text-muted-foreground [outline:none] hover:bg-(--alpha-10) hover:text-foreground [&_svg]:size-3',
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring',
].join(' ')

/* ---------- Composer ---------- */

/**
 * Khung `.ui-composer`: cột, bo radius-xl, nền background, viền inset `input`. Thứ tự ưu tiên y cascade bundle.css
 * (tắt > lỗi > focus-within > hover > thường) — biến thể Tailwind 4 xếp focus-within TRƯỚC hover nên hover chặn bằng
 * `not-focus-within:not-data-invalid:` (luật NGUON). Lỗi/tắt đặt bằng `data-invalid`/`data-disabled` (aria-* trên div vô nghĩa với
 * trình đọc — ô chữ mang aria-invalid/disabled thật).
 */
export const composer = [
  kv,
  'flex flex-col rounded-(--radius-xl) bg-background transition-[box-shadow] duration-150 ease-[ease]',
  '[box-shadow:inset_0_0_0_1px_var(--input)]',
  'not-focus-within:not-data-invalid:hover:[box-shadow:inset_0_0_0_1px_var(--alpha-25)]',
  'focus-within:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
  'data-invalid:[box-shadow:inset_0_0_0_1px_var(--red-500)]',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
].join(' ')
/** Ô chữ 400 14/20, cao 44–240 theo nội dung (field-sizing), đệm 10 12 4, không viền/nền/outline, không kéo giãn. */
export const composerInput = [
  kv,
  'block min-h-[44px] max-h-[240px] w-full resize-none bg-transparent pt-[10px] px-[12px] pb-[4px] [field-sizing:content]',
  'text-[14px] leading-[20px] font-normal text-foreground [outline:none] placeholder:text-(--color-text-tertiary)',
].join(' ')
export const composerFiles = `${kv} flex flex-wrap gap-1.5 px-2.5 pt-1.5`
/** Thanh dưới: 📎 · gợi ý phím (ẩn ≤640) · nút Gửi tròn sát phải; đệm 6, gap 4. */
export const composerBar = `${kv} flex items-center gap-1 p-1.5`
export const composerHint = `${kv} ml-auto pr-1 text-[12px] leading-[18px] text-muted-foreground [@media(max-width:640px)]:hidden`
export const composerSend = '[@media(max-width:640px)]:ml-auto'

/* Thẻ xem nhanh một bản ghi (`.b-ct-*` của bundle.css — nội dung thẻ `XemNhanh`). */
/** `.b-ct-khoi`: khối cách trên 20. */
export const xemKhoi = `${kv} mt-5`
/** `.b-ct-ten`: tiêu đề bản ghi 20/26 600, xuống dòng đủ (không cắt). */
export const xemTen = `${kv} m-0 text-[20px] leading-[26px] font-semibold tracking-normal [overflow-wrap:anywhere]`
/** `.b-ct-phu`: dòng phụ 12/18 muted (bên gọi tự thêm lề trên 4 khi đứng ngay dưới tiêu đề). */
export const xemPhu = `${kv} text-[12px] leading-[18px] text-muted-foreground`
