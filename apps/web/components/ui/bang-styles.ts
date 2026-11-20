// File THƯỜNG (không 'use client'): chuỗi class — server component đọc được (vd khối /ds ghép đè một khoá).
import type { GiaoDienBang } from '@/bang/giaoDien'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'
import { controlOutline } from './control-styles'

/**
 * GIAO_DIEN_DS — bộ class DS cho gói `bang/` (bơm qua `CauHinhBangDs`), chép từ ds/nguon/bundle.css:
 * `.ui-filterbar` / `.ui-chip*` (FilterBar), `.ui-table-foot` / `.ui-pagination*` (Pagination), `.ui-bulkbar*`
 * (BulkActionBar), `.ui-th-sort` + `.ui-table th` (tiêu đề cột), `.ui-checkbox` (ô chọn dòng, `<input>` gốc).
 * Bảng "Khoá giaoDien" ở README từng component nguồn là đặc tả. Logic ở `bang/`, không viết lại.
 *
 * - Mọi phần tử tắt viền preflight của app (`0 solid var(--border)`): phần tử preview không viền.
 * - DOM của `bang/` khác preview ở vài chỗ, bù bằng CSS (không đổi DOM màn cũ):
 *   FilterBar: nhóm chip `contents` → chip, số dòng, cụm phải cùng là con flex của hàng; số dòng `order-1`, cụm phải
 *   `order-2` → chip sắp xếp (DOM đứng sau số dòng) hiện TRƯỚC số dòng như preview.
 *   BulkActionBar: nút Bỏ chọn `order-1` (cuối hàng); khu thao tác `contents` + ::before/::after = hai vạch ngăn
 *   (pseudo của phần tử contents vẫn sinh hộp). ≤640: thứ tự y bundle — số + ✕ hàng đầu, thao tác, "Chọn tất cả…".
 */

const kv = 'border-none border-current'

// `.ui-chip`: cao 28 pill, chữ 12/18, nhãn thường + giá trị strong 600. Đệm trái 10 ở khung; phải 10 (không ×) / 4 (có ×).
const chip = cn(
  kv,
  'inline-flex max-w-full items-center gap-1 h-(--control-size-sm) pl-2.5 rounded-(--radius-full) whitespace-nowrap',
  'bg-(--alpha-05) text-foreground text-[12px] leading-[18px] font-normal',
  '[&>span]:overflow-hidden [&>span]:text-ellipsis [&_strong]:font-semibold',
)
// `.ui-chip-x`: ô tròn 20, icon 12 muted; hover alpha-10 + foreground; focus-visible vòng ring sát mép.
const chipX = cn(
  kv,
  'grid size-5 shrink-0 place-content-center ml-0.5 p-0 rounded-(--radius-full) bg-transparent cursor-pointer',
  'text-muted-foreground hover:bg-(--alpha-10) hover:text-foreground [&>svg]:size-3',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-solid focus-visible:outline-(--ring)',
)

// `.ui-table th` (+ `.ui-table .sel` cho ô chọn): cao 36, đệm ngang 12, nền surface-secondary, chữ 12/18 600 muted.
const th = cn(
  'sticky top-0 z-1 h-(--control-size-lg) px-(--control-gutter-md) bg-(--color-surface-secondary) border-b border-(--border)',
  'text-left text-[12px] leading-[18px] font-semibold text-muted-foreground whitespace-nowrap',
)

// `.ui-checkbox` trên `<input type=checkbox>` gốc của bang/ (OChonTatCa / OChonDong): 18px, lệch xuống 1, dấu vẽ bằng
// ::after. Hover chỉ khi chưa chọn (bundle: :checked khai sau :hover); tắt + chọn viền/nền gray-300 (tối gray-200).
const oTick = cn(
  'relative top-px m-0 inline-grid size-[18px] shrink-0 place-content-center p-0 appearance-none cursor-pointer',
  'border border-solid rounded-(--radius-xs) bg-transparent [outline:none]',
  '[transition:border-color_150ms_ease,background-color_150ms_ease]',
  '[--oc-vien:var(--gray-200)] in-data-[theme=dark]:[--oc-vien:var(--gray-500)]',
  '[--oc-tro:var(--gray-300)] in-data-[theme=dark]:[--oc-tro:var(--gray-600)]',
  'border-(--oc-vien) enabled:not-checked:not-indeterminate:hover:border-(--oc-tro)',
  'checked:border-(--gray-900) checked:bg-(--gray-900) indeterminate:border-(--gray-900) indeterminate:bg-(--gray-900)',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-(--ring)',
  'disabled:cursor-not-allowed disabled:border-(--gray-150) disabled:bg-(--gray-25)',
  'in-data-[theme=dark]:disabled:border-(--gray-300) in-data-[theme=dark]:disabled:bg-(--gray-200)',
  '[--oc-tat-chon:var(--gray-300)] in-data-[theme=dark]:[--oc-tat-chon:var(--gray-200)]',
  'disabled:checked:border-(--oc-tat-chon) disabled:checked:bg-(--oc-tat-chon)',
  "after:content-[''] after:h-1.5 after:w-2.5 after:border-solid after:border-(--gray-0) after:opacity-0",
  'after:[border-width:0_0_2px_2px] after:[transform:translateY(-1px)_rotate(-45deg)]',
  'checked:after:opacity-100 indeterminate:after:opacity-100 indeterminate:after:h-0 indeterminate:after:w-2',
  'indeterminate:after:[border-width:0_0_2px_0] indeterminate:after:[transform:none]',
)

// Vạch ngăn `.ui-bulkbar-sep` (1×20, currentColor 20%, lề ngang 6) — vẽ bằng pseudo của khu thao tác. Viết thẳng từng
// class (Tailwind chỉ sinh CSS cho chuỗi có nguyên văn trong mã, không ghép được).
const vachTruoc = "before:content-[''] before:block before:h-5 before:w-px before:mx-1.5 before:shrink-0 before:border-none before:border-current before:bg-current before:opacity-20"
const vachSau = "after:content-[''] after:block after:h-5 after:w-px after:mx-1.5 after:shrink-0 after:border-none after:border-current after:bg-current after:opacity-20"

// Nút ghost trên thanh tối: chữ theo thanh, hover / đang mở menu primary-solid-hover, nhấn primary-solid-active.
const ghostTrenThanh = [
  'text-inherit',
  'not-disabled:not-aria-disabled:hover:bg-(--color-background-primary-solid-hover)',
  'not-disabled:not-aria-disabled:hover:text-inherit',
  'not-disabled:not-aria-disabled:not-aria-pressed:not-aria-expanded:not-aria-checked:active:bg-(--color-background-primary-solid-active)',
]

export const GIAO_DIEN_DS: GiaoDienBang = {
  // Ô tìm (`.ui-input` + nút xoá dạng chip-x bên phải)
  oTimKiem_khung: cn(kv, 'relative'),
  // type="search": tắt vẻ ô tìm gốc (Safari) + nút × gốc (đã có nút xoá riêng)
  oTimKiem_input: cn(controlOutline, 'pr-9 appearance-none [&::-webkit-search-cancel-button]:appearance-none'),
  oTimKiem_nutXoa: cn(chipX, 'absolute right-1.5 top-1/2 ml-0 -translate-y-1/2'),

  // FilterBar — `.ui-filterbar`: flex wrap, gap 6/8, cao tối thiểu 28
  dangLoc_khung: cn(kv, 'flex flex-wrap items-center gap-x-2 gap-y-1.5 min-h-(--control-size-sm)'),
  dangLoc_nhomChip: 'contents',
  dangLoc_chip: chip,
  dangLoc_chipCoNutGo: 'pr-1',
  dangLoc_chipTron: 'pr-2.5',
  dangLoc_nutGoChip: chipX,
  // `.ui-filterbar-count` 12/18 muted tabular
  dangLoc_soDong: cn(kv, 'order-1 text-[12px] leading-[18px] text-muted-foreground tabular-nums'),
  dangLoc_nutXoaLoc: cn(buttonVariants({ variant: 'ghost', size: 'sm' })),
  // `.ui-filterbar-end`: dồn phải, gap 4
  dangLoc_cuoi: cn(kv, 'order-2 ml-auto inline-flex items-center gap-1'),

  sapXep_chip: chip,
  sapXep_chipCoNutGo: 'pr-1',
  sapXep_chipTron: 'pr-2.5',
  // `.ui-chip > .ui-icon`: icon control-icon-size-xs, muted
  sapXep_muiTen: cn(kv, 'inline-flex shrink-0 text-muted-foreground [&>svg]:size-(--control-icon-size-xs)'),
  sapXep_ghiChu: 'text-muted-foreground',
  sapXep_nutGo: chipX,

  // Tiêu đề cột — `.ui-table th` + `.ui-th-sort`
  tieuDe_o: th,
  tieuDe_oDangSap: 'text-foreground',
  tieuDe_link: cn(
    kv,
    'inline-flex items-center gap-1 h-(--control-size-sm) whitespace-nowrap rounded-(--radius-xs)',
    'hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
  ),
  tieuDe_linkDangSap: 'text-foreground font-medium',
  tieuDe_muiTenDangSap: 'inline-flex [&>svg]:size-3',
  tieuDe_muiTenThuong: 'inline-flex opacity-50',

  // Pagination — `.ui-table-foot` (cách bảng 12, chữ 12/18 muted) + `.ui-pagination` (gap 4) + `.ui-pagination-page`
  phanTrang_khung: cn(kv, 'mt-3 flex items-center justify-between gap-2 text-[12px] leading-[18px] text-muted-foreground'),
  phanTrang_khoang: cn(kv, 'tabular-nums'),
  phanTrang_cum: cn(kv, 'ml-auto inline-flex items-center gap-1 tabular-nums'),
  phanTrang_nut: cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' })),
  phanTrang_nutTat: cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' })),
  phanTrang_chuSo: cn(kv, 'min-w-22 text-center text-foreground'),

  // `<select>` dự phòng khi không có OChon (CauHinhBangDs luôn bơm OChon → thường không dùng tới)
  boLoc_khung: cn(kv, 'relative inline-flex max-w-full'),
  boLoc_select: cn(controlOutline, 'w-48 max-w-full truncate appearance-none pr-8 font-medium'),
  boLoc_muiTen: 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground',

  // Chọn dòng + BulkActionBar
  chon_khung: cn(kv, 'flex flex-col gap-4'),
  chon_oTh: cn(th, 'w-10 pr-0'),
  chon_oTd: cn(kv, 'h-(--control-size-xl) w-10 pl-(--control-gutter-md) pr-0 border-b border-solid border-(--border)'),
  chon_checkbox: oTick,
  // `.ui-bulkbar`: nổi giữa đáy (cách 24), z 55 (thang z NGUON), pill đệm 4/4/4/16, nền + chữ primary-solid, shadow-400,
  // hiện trượt lên 8px trong 180ms (starting-style thay keyframes — không đụng CSS dùng chung). ≤640: sát hai mép 16,
  // xuống dòng, bo 2xl, đệm 8/6/6/16, chỉ mờ dần.
  chon_thanh: cn(
    kv,
    // Dấu (không phải Tailwind): Toast đọc bằng `:has()` trên gốc vùng DS để đẩy lên trên thanh (toast-styles.ts).
    'ds-thanh-hang-loat',
    'fixed bottom-6 left-1/2 z-55 -translate-x-1/2 flex items-center gap-0.5 max-w-[calc(100vw-32px)]',
    'py-1 pr-1 pl-4 rounded-(--radius-full) [box-shadow:var(--shadow-400)]',
    'bg-(--color-background-primary-solid) text-(--color-text-primary-solid) text-[14px] leading-[20px] font-normal',
    'transition-[opacity,translate] duration-180 ease-[cubic-bezier(0.19,1,0.22,1)] motion-reduce:transition-none',
    'starting:translate-y-2 starting:opacity-0',
    // Button DS (ghost) do màn cắm vào khu thao tác: màu theo thanh (`.ui-bulkbar .ui-btn[data-variant=ghost]`). Chọn theo
    // data-variant, không theo data-slot: Trigger của DropdownMenu (asChild) đè data-slot của Button.
    '[&_[data-variant=ghost]]:text-inherit!',
    '[&_[data-variant=ghost]:hover]:bg-(--color-background-primary-solid-hover)!',
    '[&_[data-variant=ghost][aria-expanded=true]]:bg-(--color-background-primary-solid-hover)!',
    '[&_[data-variant=ghost]:active]:bg-(--color-background-primary-solid-active)!',
    'max-[640px]:left-4 max-[640px]:right-4 max-[640px]:translate-x-0 max-[640px]:starting:translate-y-0',
    'max-[640px]:flex-wrap max-[640px]:gap-y-0.5 max-[640px]:pt-2 max-[640px]:pr-1.5 max-[640px]:pb-1.5 max-[640px]:pl-4',
    'max-[640px]:rounded-(--radius-2xl)',
  ),
  // `.ui-bulkbar-count`: lề phải 8, số 600 tabular; ≤640 chiếm cả hàng trừ chỗ nút ✕ và ĐƯỢC xuống dòng (bundle giữ
  // nowrap: câu "(gồm cả dòng ở trang khác)" của bang/ dài hơn preview → ở 390 đẩy ✕ xuống hàng dưới, đo ảnh 20/11).
  chon_thanhSo: cn(
    kv,
    'mr-2 whitespace-nowrap tabular-nums [&_strong]:font-semibold',
    'max-[640px]:flex-[1_0_calc(100%-40px)] max-[640px]:min-w-0 max-[640px]:whitespace-normal',
  ),
  chon_vungDoc: 'sr-only',
  chon_thanhPhuChu: cn(kv, 'opacity-70'),
  chon_thanhCanhBao: cn(kv, 'text-(--yellow-300) text-[12px] leading-[18px] max-[640px]:order-2'),
  // `Button link sm` cùng màu chữ thanh, gạch chân chấm; ≤640 xuống hàng cuối, trọn bề ngang, đệm dưới 4
  chon_nutChonToanBo: cn(
    buttonVariants({ variant: 'link', size: 'sm' }),
    'text-inherit in-data-[theme=dark]:text-inherit underline decoration-dotted underline-offset-[0.2em]',
    'disabled:not-data-loading:bg-transparent disabled:not-data-loading:text-inherit disabled:opacity-50',
    'max-[640px]:order-3 max-[640px]:w-full max-[640px]:justify-start max-[640px]:px-0 max-[640px]:pt-0 max-[640px]:pb-1',
  ),
  // `.ui-bulkbar-close`: ghost icon-sm mờ 70% → 100% khi rê; cuối hàng (≤640: cạnh số)
  chon_nutBoChon: cn(
    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
    ...ghostTrenThanh,
    'opacity-70 not-disabled:not-aria-disabled:hover:opacity-100 order-1 max-[640px]:order-0',
  ),
  chon_loi: cn(kv, 'text-(--red-300) text-[12px] leading-[18px] max-[640px]:order-2'),
  chon_khuHanhDong: cn('contents', vachTruoc, vachSau, 'max-[640px]:before:hidden max-[640px]:after:hidden max-[640px]:*:order-2'),
  chon_chuaCoHanhDong: cn(kv, 'ml-auto px-2 text-[12px] leading-[18px] opacity-70 max-[640px]:order-2'),
}
