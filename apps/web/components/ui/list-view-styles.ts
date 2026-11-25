// File THƯỜNG (không 'use client'): chuỗi class — server component đọc được.
import { cn } from '@/lib/utils'

/**
 * Kiểu ListView — chép từ khối "A. danh sách nhẹ" (`.b-ds*`, `.b-ticket`, `.b-nhan-dau`, `.b-mo-ticket`, `.b-nhom-*`) và
 * hai `@container` (≤ 860 / ≤ 480) của ds/nguon/bundle.css (bản 40), đúng bảng Thông số README ListView.
 * Mốc container: Tailwind `@max-[860px]` = `width < 860px` (nguồn `max-width: 860px` = ≤ 860) — lệch đúng 1px ở 860.
 * Mọi phần tử tắt viền preflight của app (`0 solid var(--border)`) rồi mới khai viền cần có.
 */
const kv = 'border-none border-current'

/** Vỏ: container query trên vùng đặt danh sách (README "container query trên vùng trang"). */
export const vo = cn(kv, '@container min-w-0')

/**
 * `.b-ds`: KHÔNG lề âm (CEO 25/11, kiểu Notion) — nền rê/chọn của dòng thẳng mép nội dung trang (tiêu đề, nền tab, ô
 * thêm nhanh); chữ đầu cột / nhãn nhóm / nội dung dòng thụt 16 = thẳng chữ của tab. Trước: −8 → nền thò ra ngoài 8,
 * chữ lệch 8 so với mọi lớp khác.
 */
export const bang = kv

/**
 * `.b-ds-hang` (chung đầu cột + dòng): lưới theo cột (`--lv-cot`; ≤ 860 bỏ rãnh cột `anKhiHep` → `--lv-cot-hep` — nguồn
 * giữ rãnh 40 của Chủ đã ẩn, để trống cuối dòng), khoảng 12, cao ≥ 50, đệm 4/16, bo radius-xl, không outline.
 * Điện thoại: 2 dòng "tren trenPhai" / "duoi duoiPhai", cách dòng 4, đệm dọc 10.
 */
export const hang = cn(
  kv,
  'relative grid grid-cols-(--lv-cot) @max-[860px]:grid-cols-(--lv-cot-hep) items-center gap-3 min-h-[50px] px-4 py-1',
  'rounded-(--radius-xl) [outline:none]',
  "@max-[480px]:grid-cols-[minmax(0,1fr)_auto] @max-[480px]:[grid-template-areas:'tren_trenPhai'_'duoi_duoiPhai']",
  '@max-[480px]:gap-y-1 @max-[480px]:py-2.5',
)

/** `.b-ds-dau`: cao ≥ 36, chữ 12/18 muted; điện thoại ẩn hẳn. */
export const hangDau = cn(hang, 'min-h-(--control-size-lg) text-[12px] leading-[18px] text-muted-foreground @max-[480px]:hidden')

/**
 * Dòng dữ liệu: con trỏ tay; kẻ dưới 1px alpha-05 cách mép 12 (`::after`), ẩn khi chính dòng hoặc dòng KẾ đang rê/focus;
 * rê / focus trong dòng → nền alpha-05 (một lớp); focus phím chính dòng → vòng trong 2px ring; đang xem (`data-xem`) →
 * alpha-06. Nhãn trong dòng cao 22 = avatar (`.b-ds-hang .ui-badge`).
 */
export const hangDong = cn(
  hang,
  'cursor-pointer hover:bg-(--alpha-05) focus-within:bg-(--alpha-05) data-xem:bg-(--alpha-06)!',
  "after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-0 after:h-px after:bg-(--alpha-05)",
  'after:border-none after:border-current after:pointer-events-none',
  'hover:after:opacity-0 focus-within:after:opacity-0',
  '[&:has(+[data-slot=list-view-row]:hover)]:after:opacity-0 [&:has(+[data-slot=list-view-row]:focus-within)]:after:opacity-0',
  'focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]',
  '[&_[data-slot=badge]]:h-(--control-size-3xs)',
)

/**
 * Ô: flex một dòng, khoảng 10 (`.b-ticket`). Ô sửa (InlineEdit) trong ô được co (cắt …); ô sửa KHÔNG đứng đầu ô (vd tên
 * khách sau mã) thì bỏ lề âm −6 + cắt tràn (`.b-ticket > .b-osua-wrap > .b-osua`).
 */
export const o = cn(
  kv,
  'flex min-w-0 items-center gap-2.5 [&>[data-slot=inline-edit]]:min-w-0',
  // Ô sửa một mình trong ô (việc, trạng thái, chủ) lấp ô; ô đứng đầu được rộng tới hết ô + 12 (lề âm −6 hai bên) —
  // `.b-viec-o .b-osua-chu { max-width: 100% }` (bỏ trần 280 của ô chữ trong Bảng).
  '[&>[data-slot=inline-edit]:only-child]:flex-1 [&>[data-slot=inline-edit]:first-child>button]:max-w-[calc(100%+12px)]',
  '[&>[data-slot=inline-edit]:not(:first-child)>button]:mx-0 [&>[data-slot=inline-edit]:not(:first-child)>button]:min-w-0',
  '[&>[data-slot=inline-edit]:not(:first-child)>button]:max-w-full [&>[data-slot=inline-edit]:not(:first-child)>button]:overflow-hidden',
)
/** `.b-phai`: căn phải, ô ôm nội dung dồn về cuối rãnh. */
export const oPhai = 'justify-self-end justify-end text-right'
/** ≤ 860 ẩn (cột `anKhiHep`, không có chỗ trên điện thoại). */
export const anHep = '@max-[860px]:hidden'
/** ≤ 860 ẩn nhưng điện thoại hiện lại (cột `anKhiHep` có `dienThoai`, vd Việc tiếp theo). */
export const anHepTruDienThoai = '@min-[480px]:@max-[860px]:hidden'
/** Điện thoại ẩn (cột không có `dienThoai`). */
export const anDienThoai = '@max-[480px]:hidden'
/**
 * Vị trí ô trên điện thoại (`.b-ds-hang > .b-ticket { grid-area: ten }`…). Dòng dưới trái (`.b-viec-o`) chữ 12/18 muted;
 * hai ô phải dồn về cuối.
 */
export const VUNG_DIEN_THOAI = {
  tren: '@max-[480px]:[grid-area:tren]',
  trenPhai: '@max-[480px]:[grid-area:trenPhai] @max-[480px]:justify-self-end',
  duoi: '@max-[480px]:[grid-area:duoi] @max-[480px]:text-[12px] @max-[480px]:leading-[18px] @max-[480px]:text-muted-foreground',
  duoiPhai: '@max-[480px]:[grid-area:duoiPhai] @max-[480px]:justify-self-end',
} as const

/** Ô đầu cột chữ trần (`span[role=columnheader]`). */
export const dau = cn(kv, 'flex min-w-0 items-center whitespace-nowrap')

/**
 * Ô đầu cột có menu trong lưới (ghép SAU `table-styles.th` qua cn): bỏ dính / cao 36 / đệm 10 / nền / kẻ dưới của ô
 * Bảng (`.b-ds-dau` không có); nút `.ui-th-sort` của Danh sách ôm chữ (không phủ kín ô), cao 28, bo radius-xs, con trỏ
 * tay, vòng focus ra ngoài +2 (không nằm trong khung cuộn như Bảng). `z-auto!` thắng z nội tuyến của `TieuDeCot` (thứ tự
 * chồng tay co dãn của Bảng — Danh sách không co dãn).
 */
export const dauMenu = cn(
  'static z-auto! h-auto px-0 bg-transparent border-b-0 [border-style:none] border-b-current flex min-w-0 items-center',
  '[&>button]:w-auto [&>button]:h-(--control-size-sm) [&>button]:rounded-(--radius-xs) [&>button]:cursor-pointer',
  '[&>button]:focus-visible:outline-offset-2',
)

/**
 * `.b-nhan-dau` trong ô Ticket: khung nhãn đầu rộng cố định 190 (bundle.css gõ 190 — tên khách thẳng cột; README ghi
 * 162/30 — bundle.css thắng) cách 6, nhãn cao bằng nhau; nhãn đầu (ưu tiên) rộng tối thiểu 60 canh giữa; nhãn cuối (loại
 * lỗi) ôm chữ, dài quá thì cắt …. ≤ 860: khung ôm chữ, chỉ giữ nhãn đầu.
 */
/** `.b-ticket > .b-nhan-dau[data-gon]`: danh sách chỉ một nhãn đầu → khung ôm chữ thay vì chừa 190 (CEO chốt 23/11). */
export const nhanDauGon = 'w-auto'

export const nhanDau = cn(
  kv,
  'inline-flex shrink-0 items-stretch gap-1.5 w-[190px] @max-[860px]:w-auto @max-[860px]:[&>:not(:first-child)]:hidden',
  '[&>:first-child_[data-slot=badge]]:min-w-[60px] [&>:first-child_[data-slot=badge]]:justify-center',
  '[&>:last-child]:min-w-0 [&>:last-child]:flex-[0_1_auto]',
  '[&>:last-child:not(:first-child)_[data-slot=badge]]:max-w-full [&>:last-child:not(:first-child)_[data-slot=badge]]:overflow-hidden',
)

/**
 * `.b-mo-ticket` + `.b-ma`: nút mở bản ghi bằng mã — cao 30, tràn lề −6, đệm 6, bo radius-md, rê nền alpha-05; mã 12/18
 * số thẳng cột màu tertiary. ≤ 860 ẩn (bấm dòng vẫn mở).
 */
export const nutMoMa = cn(
  kv,
  'inline-flex shrink-0 items-center gap-2.5 min-w-0 max-w-full h-[30px] -mx-1.5 px-1.5 rounded-(--radius-md)',
  'bg-transparent text-inherit [font:inherit] text-left cursor-pointer hover:bg-(--alpha-05)',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-(--ring) focus-visible:outline-offset-0',
  '@max-[860px]:hidden',
)

/** `.b-nhom-dau.b-nhom-ds`: tiêu đề nhóm — đệm 18 16 6; nhãn + số lượng cách 8, số màu tertiary thẳng cột. */
export const nhomDau = cn(kv, 'px-4 pt-4.5 pb-1.5')
export const nhomO = cn(kv, 'flex items-center gap-2')
export const nhomSo = cn(kv, 'tabular-nums text-(--color-text-tertiary)')
