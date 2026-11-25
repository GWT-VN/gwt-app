// File THƯỜNG (không 'use client'): hằng + chuỗi class của DataViewToolbar, CaiDatHienThi, SavedView, XemNhanh — server
// component dùng lại được. Giá trị chép từ `.b-dau`, `.b-h1`, `.b-thanh*`, `.b-tim`, `.b-cong-cu`, `.b-bocuc`, `.b-ngan`,
// `.b-caidat`, `.b-cd-*`, `.ui-saveview*`, `.b-chitiet`, `.b-ct-*` của ds/nguon/bundle.css (bản 40). Mọi phần tử
// `border-none border-current`: div/span/header ăn preflight `0 solid var(--border)` của app; nguồn không viền.
import { cn } from '@/lib/utils'
import { menuContent, menuItem } from './menu-styles'

export type DangXem = 'danh-sach' | 'bang' | 'kanban'

/** Ba dạng xem (README: "Danh sách · Bảng · Kanban"). `tip` = mô tả thêm cho tooltip, KHÔNG lặp `ten` (aria-label). */
export const DANG_XEM: readonly { id: DangXem; ten: string; tip: string }[] = [
  { id: 'danh-sach', ten: 'Danh sách', tip: 'Mỗi bản ghi một dòng' },
  { id: 'bang', ten: 'Bảng', tip: 'Nhiều cột, kéo đổi chỗ' },
  { id: 'kanban', ten: 'Kanban', tip: 'Thẻ theo cột trạng thái' },
]

const kv = 'border-none border-current'

/**
 * `.b-trang`: khung trang dữ liệu — container (inline-size), rộng tối đa 1584 căn giữa, đệm trên 36 · hai bên
 * clamp(24, 6vw, 112) · dưới 112 (chừa chỗ thanh hàng loạt / nút Bắp nổi).
 */
export const dvTrang = cn(kv, '@container mx-auto max-w-[1584px] pt-9 px-[clamp(24px,6vw,112px)] pb-28')

/** Gốc thanh: `.b-trang` là khung container (inline-size) — ô tìm ≤ 640 container xuống dòng riêng. */
export const dvGoc = cn(kv, '@container')

/** `.b-dau`: hàng, căn giữa, xuống dòng được, cách 12. */
export const dvDau = cn(kv, 'flex flex-wrap items-center gap-3')

/** `.b-h1`: 24/28 600, margin 0 (nguồn gõ 24px — tiêu đề màn dữ liệu). */
export const dvTieuDe = cn(kv, 'm-0 text-[24px] leading-[28px] font-semibold tracking-normal')

/** `.ui-caption`: 12/18 muted-foreground; số tabular-nums (luật DS). */
export const dvDem = cn(kv, 'text-[12px] leading-[18px] text-muted-foreground tabular-nums')

/**
 * `.b-tim` (240) + `.ui-input-wrap > .ui-icon`: icon 16 cách mép trái gutter 12, muted, không bắt chuột; ô đệm trái
 * gutter + 16 + 8. ≤ 640 container (`@container (max-width: 640px)`) và ≤ 767 khung nhìn (`@media (max-width: 767px)`):
 * rộng 100%, xuống cuối hàng (`order: 3`). Ô là của màn (vd `OTimKiem` của bang/) → đệm/rộng ép qua `[&_input]`.
 */
export const dvTim = cn(
  kv,
  'relative flex w-[240px] items-center',
  '[@container(max-width:640px)]:order-3 [@container(max-width:640px)]:w-full',
  '[@media(max-width:767px)]:order-3 [@media(max-width:767px)]:w-full',
  // Ô của màn có thể bọc thêm khung (OTimKiem: div > input) → con trực tiếp giãn hết chỗ, ô rộng 100% con đó.
  '*:min-w-0 *:flex-1 [&_input]:w-full [&_input]:pl-[calc(var(--control-gutter-md)+24px)]',
)
export const dvTimIcon = cn(
  kv,
  'pointer-events-none absolute left-(--control-gutter-md) z-1 size-4 shrink-0 text-muted-foreground',
)

/** `.b-thanh`: hàng tab + công cụ, cách 12, lề trên 22 dưới 16 (nguồn 12 — CEO 23/11 giãn). `.b-tabs-cuon`: giãn, co được. */
export const dvThanh = cn(kv, 'mt-[22px] mb-4 flex items-center gap-3')
export const dvTabs = cn(kv, 'min-w-0 flex-1')

/** `.b-thanh-phai` (cách 8, không co) > `.b-cong-cu` (cách 2). `.b-bocuc`: cách 2. */
export const dvThanhPhai = cn(kv, 'flex shrink-0 items-center gap-2')
export const dvCongCu = cn(kv, 'flex items-center gap-0.5')
export const dvBoCuc = 'gap-0.5'

/** `.b-ngan`: vạch 1 × 18, lề ngang 8, nền gray-100. */
export const dvNgan = cn(kv, 'mx-2 h-[18px] w-px bg-(--gray-100)')

/**
 * `.ui-menu.b-noi.b-caidat`: menu 300 rộng, trần cao min(560px, 70vh) (thay trần 420 của menu thường) + cuộn trong.
 * ≤ 767 khung nhìn (`@media (max-width: 767px)` của nguồn): sheet đáy — bám mép trái/phải/đáy 8 (Popover neo vào dải
 * `PopoverAnchor` cố định ở đáy, rộng theo neo), trần 70vh, z 60 (thang z NGUON: "sheet đáy điện thoại 60").
 */
export const cdKhung = cn(
  menuContent,
  // Trần thêm theo chỗ trống Radix đo (luật NGUON: pop nổi lấy --radix-popover-content-available-height) → khung nhìn thấp
  // không đẩy đáy menu ra ngoài màn (đo thật: trang con 12 cột cao 462 tràn đáy khổ 1440 × 900).
  'w-[300px] max-h-[min(560px,70vh,var(--radix-popover-content-available-height,100vh))]',
  '[@media(max-width:767px)]:z-60 [@media(max-width:767px)]:w-(--radix-popper-anchor-width) [@media(max-width:767px)]:max-h-[70vh]',
)
/** Dải neo sheet đáy: cố định, cách mép 8, cao 0, không bắt chuột. */
export const cdNeoDay = 'pointer-events-none fixed inset-x-2 bottom-2 h-0 border-none border-current'

/** `.b-cd-tieude`: hàng tiêu đề trang gốc (chữ + ✕), đệm 4 4 6 8, 12/18 600. */
export const cdTieuDe = cn(kv, 'flex items-center justify-between pt-1 pr-1 pb-1.5 pl-2 text-[12px] leading-[18px] font-semibold')
/** `.b-cd-dau`: hàng đầu trang con (← + chữ), cách 4, đệm 2 4 6 0, 12/18 600. */
export const cdDau = cn(kv, 'flex items-center gap-1 pt-0.5 pr-1 pb-1.5 pl-0 text-[12px] leading-[18px] font-semibold')

/**
 * Mục trong ⚙ (`.ui-menu-item.b-cd-dong`): Popover không phải menu Radix → không có `data-highlighted`; nền sáng theo
 * `:hover` như `.ui-menu-item:hover` của nguồn (mỗi lúc chỉ một mục dưới chuột; phím dùng vòng focus của menuItem).
 */
export const cdMuc = cn(menuItem, 'hover:bg-(--menu-item-bg)')
/** `.b-cd-gt`: giá trị hiện tại dồn phải, 12/18 tertiary. `.b-cd-mui`: › 12 tertiary. `.b-tick`: ✓ 14 foreground. */
export const cdGiaTri = cn(kv, 'ml-auto text-[12px] leading-[18px] text-(--color-text-tertiary) tabular-nums')
export const cdMui = 'size-3! shrink-0 text-(--color-text-tertiary)!'
export const cdTick = 'ml-auto size-(--control-icon-size-xs)! shrink-0 text-foreground!'

/**
 * `.ui-menu.ui-saveview`: 320 (tối đa 100vw − 16), đệm 16, cột cách 12. Khung menu (nền, bóng, bo) từ menuContent.
 * `.ui-saveview-title` 16/24 600 · `.ui-saveview-sum` chip xuống dòng cách 4 · `.ui-saveview-foot` dồn phải cách 8.
 */
export const svKhung = cn(menuContent, 'flex w-[320px] max-w-[calc(100vw-16px)] flex-col gap-3 p-4')
export const svTieuDe = cn(kv, 'm-0 text-[16px] leading-[24px] font-semibold')
export const svTomTat = cn(kv, 'flex flex-wrap gap-1')
export const svChan = cn(kv, 'flex justify-end gap-2')
/** `.ui-chip` (không ×): cao sm 28, đệm 0 10, pill, nền alpha-05, 12/18; giá trị đậm 600. */
export const svChip = cn(
  kv,
  'inline-flex h-(--control-size-sm) max-w-full items-center gap-1 rounded-(--radius-full) bg-(--alpha-05) px-2.5',
  'text-[12px] leading-[18px] whitespace-nowrap text-foreground [&_strong]:font-semibold',
)

/**
 * `.b-chitiet`: thẻ nổi bên phải khung chứa (top/right/bottom 8), 440 (tối đa 100vw − 16), bo 3xl, nền background,
 * bóng hairline + 300, z 44 (nguồn — dưới bulkbar 55), trượt vào 200ms cubic-bezier(0.19, 1, 0.22, 1) từ opacity 0 +
 * dịch phải 16 (`b-truot`; transition + @starting-style, tắt khi giảm chuyển động). < 768: phủ kín khung, không bo, không
 * bóng, z 50. Nội dung chính nhường chỗ (≥ 768: lề phải 456 = 440 + 8 + 8) — thẻ không che bảng.
 */
export const xnKhung = cn(kv, 'relative')
export const xnNoiDungNhuong = 'md:mr-[456px]'
export const xnThe = cn(
  kv,
  'absolute top-2 right-2 bottom-2 z-44 flex w-[min(440px,calc(100vw-16px))] flex-col overflow-hidden',
  'rounded-(--radius-3xl) bg-background [box-shadow:var(--shadow-hairline),var(--shadow-300)]',
  'transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] starting:translate-x-4 starting:opacity-0',
  'motion-reduce:transition-none',
  'max-md:inset-0 max-md:z-50 max-md:w-auto max-md:rounded-none max-md:[box-shadow:none]',
)
/**
 * `coDinh` (thẻ bám màn hình ở màn app): cách mép màn 16 trên · phải · dưới (CEO 25/11: 8 rồi 12 vẫn sát viền) → rộng tối đa
 * 100vw − 32, nội dung nhường 472 = 440 + 16 + 16 (CEO 25/11 lần 2: 12 vẫn kịch → 16). Bản trong khung chứa (artifact) giữ 8.
 */
export const xnTheCoDinh = 'fixed md:top-4 md:right-4 md:bottom-4 md:w-[min(440px,calc(100vw-32px))]'
export const xnNoiDungNhuongCoDinh = 'md:mr-[472px]'
/** `.b-ct-dau`: cao 52, đệm 0 10 0 24, cách 4, không xuống dòng, gạch dưới 1px alpha-05. */
export const xnDau = cn(
  'flex h-[52px] min-w-0 shrink-0 items-center gap-1 pr-2.5 pl-6 whitespace-nowrap',
  'border-none border-current [border-bottom:1px_solid_var(--alpha-05)]',
)
/** `.b-ma`: 12/18 tertiary tabular-nums. */
export const xnMa = cn(kv, 'text-[12px] leading-[18px] text-(--color-text-tertiary) tabular-nums whitespace-nowrap')
/** `.b-ct-cuon`: giãn + cuộn dọc, đệm 20 24 120, ẩn thanh cuộn. */
export const xnThan = cn(kv, 'flex-1 overflow-y-auto px-6 pt-5 pb-[120px] [scrollbar-width:none]')
