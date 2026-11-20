/**
 * Kiểu của KanbanBoard — chép từ khối `.b-kanban`, `.b-k-*`, `.b-the*`, `.b-ma`, `.b-han`, `.b-hoilai` của
 * ds/nguon/bundle.css (bản 40). File thường (không 'use client') → server component dùng được. Px trần chỉ ở chỗ
 * bundle.css gõ đúng số đó. `border-none border-current`: phần tử ăn preflight `0 solid var(--border)` của app; nguồn
 * không viền.
 */

const khongVien = 'border-none border-current'
/** `.b-kanban, .b-k-ds { scrollbar-width: none }` + ::-webkit-scrollbar ẩn. */
const anThanhCuon = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * `.b-kanban`: lưới xếp theo cột, mỗi cột ≥ 240 (bundle.css gõ 240px) chia đều phần dư, cách 12, tự cuộn ngang, đệm đáy
 * 72 (= chỗ toast nổi đáy 72, thẻ cuối không bị toast che). ≤ 767 (`@media (max-width: 767px)`): cột 82%, cuộn có snap.
 * Lấp chiều cao còn lại của khung cha (flex cột) — khung cha đặt chiều cao.
 */
export const bang = [
  khongVien,
  anThanhCuon,
  'grid flex-1 min-h-0 grid-flow-col auto-cols-[minmax(240px,1fr)] gap-3 overflow-x-auto pb-18',
  'max-[767px]:auto-cols-[82%] max-[767px]:snap-x max-[767px]:snap-mandatory',
].join(' ')

/**
 * `.b-k-cot`: cột nền alpha-02, bo radius-xl, chuyển nền/bóng 150ms. `[data-tren]` (thẻ đang kéo ở trên) → nền alpha-05
 * + viền trong 1px alpha-10. ≤ 767: điểm snap đầu cột.
 */
export const cot = [
  khongVien,
  'flex min-h-0 flex-col rounded-(--radius-xl) bg-(--alpha-02) transition-[background-color,box-shadow] duration-150 ease-[ease]',
  'data-tren:bg-(--alpha-05) data-tren:[box-shadow:inset_0_0_0_1px_var(--alpha-10)]',
  'max-[767px]:snap-start',
].join(' ')

/** `.b-k-dau`: tag trạng thái + số thẻ, cách 8, đệm 12 12 8, chữ 12/18. */
export const cotDau = `${khongVien} flex items-center gap-2 px-3 pt-3 pb-2 text-[12px] leading-[18px]`
/** `.b-mo`: số thẻ — tertiary, số thẳng cột. */
export const cotDem = `${khongVien} text-(--color-text-tertiary) tabular-nums`
/** `.b-k-ds`: danh sách thẻ tự cuộn dọc, cách 8, đệm 0 8 12. */
export const cotDs = `${khongVien} ${anThanhCuon} flex flex-col gap-2 px-2 pb-3 overflow-y-auto`
/** `.b-k-rong`: "Kéo thẻ vào đây" — đệm 20 8, viền đứt 1px alpha-10, bo radius-lg, giữa, 12/18 tertiary. */
export const cotRong =
  'px-2 py-5 border border-dashed border-(--alpha-10) rounded-(--radius-lg) text-center text-[12px] leading-[18px] text-(--color-text-tertiary)'

/**
 * `.b-the` (+ DS `Card`: nền, viền, bo): cột cách 6, đệm 10/12, bóng shadow-100 → rê shadow-200, con trỏ grab.
 * `.b-the .ui-badge`: badge trong thẻ cao control-size-3xs (22). `[data-keo]` (thẻ nguồn đang kéo) mờ 40%.
 * Menu chuột phải đang mở (`data-state=open` của ContextMenuTrigger) = `.b-the[data-cp]`: vòng 2px alpha-15 + shadow-100,
 * nền vẫn là nền thẻ (Trigger DS tô alpha-05 cho dòng — thẻ thì không). Focus phím: vòng 2px ring nằm TRONG mép thẻ
 * (offset −2): danh sách cuộn dọc cắt mọi thứ tràn ra ngoài thẻ đầu/cuối.
 * `relative`: chữ `sr-only` trong thẻ (absolute) lấy thẻ làm khối chứa → bị vùng cuộn ngang của bảng cắt. Thiếu nó, khối
 * chứa là phần tử định vị ngoài vùng cuộn → các span 1px của cột ngoài khung nhìn làm CẢ TRANG tràn ngang (390: 887px).
 */
export const the = [
  'relative flex flex-col gap-1.5 px-3 py-2.5 [box-shadow:var(--shadow-100)] cursor-grab',
  'hover:[box-shadow:var(--shadow-200)] data-keo:opacity-40',
  'data-[state=open]:bg-(--card) data-[state=open]:[box-shadow:0_0_0_2px_var(--alpha-15),var(--shadow-100)]',
  '[&_[data-slot=badge]]:h-(--control-size-3xs)',
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring focus-visible:-outline-offset-2',
].join(' ')

/** Bóng kéo (DragOverlay): thẻ nổi shadow-200, con trỏ grabbing. Ghép sau `the`. */
export const theBong = '[box-shadow:var(--shadow-200)] hover:[box-shadow:var(--shadow-200)] cursor-grabbing'

/** `.b-the-dau`: dòng nhãn, cách 6, lề −4 −6 −2 0. `.b-nhan-dau`: nhóm nhãn kéo giãn cao, cách 6; nhãn đầu ≥ 60 giữa. */
export const theDau = `${khongVien} flex items-center gap-1.5 -mt-1 -mr-1.5 -mb-0.5`
export const theNhan = `${khongVien} inline-flex shrink-0 items-stretch gap-1.5 [&>[data-slot=badge]:first-child]:min-w-[60px] [&>[data-slot=badge]:first-child]:justify-center`
/** `.b-the-khach`: tên khách 500. */
export const theKhach = `${khongVien} min-w-0 font-medium`
/** `.b-hoilai`: ↻ + số lần hỏi lại — 12 500 warning, icon 13 (bundle.css gõ 13px). */
export const hoiLai =
  'inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium tabular-nums text-(--color-text-warning) [&>svg]:size-[13px]'
/** `.b-the-viec`: việc tiếp theo 12/18 muted. */
export const theViec = `${khongVien} text-[12px] leading-[18px] text-muted-foreground`
/** `.b-the-chan`: mã · hạn · avatar, cách 8, một dòng. */
export const theChan = `${khongVien} flex items-center gap-2 whitespace-nowrap`
/** `.b-ma`: mã 12/18 tertiary, số thẳng cột. */
export const theMa = `${khongVien} text-[12px] leading-[18px] tabular-nums whitespace-nowrap text-(--color-text-tertiary)`
/** `.b-han`: hạn 12/18 muted; hôm nay foreground 500; trễ danger 500. */
const han = `${khongVien} text-[12px] leading-[18px] tabular-nums whitespace-nowrap`
export const theHan = {
  thuong: `${han} text-muted-foreground`,
  homNay: `${han} text-foreground font-medium`,
  tre: `${han} text-(--color-text-danger) font-medium`,
} as const
