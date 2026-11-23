// Nguồn (phần khung shadcn cuối file): shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
import { cva } from 'class-variance-authority'

/**
 * Chuỗi class của KhungApp (Sidebar khung F) — giá trị chép từ khối `.pD-*`, `.pF-dock*`, `.ui-sidebar-mark`,
 * `.ui-sidebar-item`, `.p-cham` trong ds/nguon/bundle.css. File thường (không 'use client') theo luật NGUON.
 * - `md` (48rem = 768px) là mốc mặc định Tailwind; nguồn dùng `max-width: 767px` → viết 'max-[767px]:'.
 * - Class viết NGUYÊN VĂN (không ghép chuỗi): Tailwind chỉ quét chữ trong file.
 * - Div ăn preflight `0 solid var(--border)` của app → phần tử không viền đều tắt viền (`border-none border-current`).
 */
/** `.pD`: lưới thanh trái + vùng nội dung, nền muted. ≤767: một cột, nền background. `isolate`: z bên trong không tràn ra trang. */
export const khung = [
  'relative isolate grid h-full min-h-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] border-none border-current bg-muted',
  'max-[767px]:grid-cols-[minmax(0,1fr)] max-[767px]:bg-background',
].join(' ')

/** `.pD-trai` (rail + panel). ≤767 ngăn kéo đóng: ra ngoài mép trái, ẩn hẳn (không Tab tới) — mở thì vẽ lại trong Sheet. */
export const trai = [
  'flex h-full min-h-0 border-none border-current',
  'max-[767px]:absolute max-[767px]:inset-y-0 max-[767px]:left-0 max-[767px]:z-45 max-[767px]:-translate-x-full max-[767px]:invisible max-[767px]:bg-muted',
].join(' ')

/** SheetContent `side="left"` làm ngăn kéo: rộng theo nội dung (rail + panel), hàng ngang, nền muted, `--shadow-400` (`.pD-trai[data-mo="true"]`). */
export const nganKeo = 'w-auto [@media(max-width:640px)]:w-auto flex-row bg-muted [box-shadow:var(--shadow-400)]'

/** `.pD-rail`: 52px, cột, gap 8, padding 8/0/12, z 2. */
export const rail =
  'relative z-2 flex w-13 shrink-0 flex-col items-center gap-2 pt-2 pb-3 border-none border-current'

/** `.ui-sidebar-mark.pD-logo`: 28px, bo md, nền sidebar-primary, chữ 10px 600, cách dưới 4. */
export const logo =
  'mb-1 grid size-7 shrink-0 place-content-center rounded-md border-none border-current bg-(--sidebar-primary) text-[10px] font-semibold text-(--sidebar-primary-foreground)'

/**
 * `.pD-icon`: ô 36, bo lg, icon 18 tertiary; hover alpha-04 + foreground; đang chọn alpha-05 + foreground (aria-* xếp
 * SAU hover trong CSS Tailwind → đang chọn thắng hover như nguồn); focus outline 2 ring offset 0.
 */
export const iconKhu = [
  'relative grid size-9 shrink-0 cursor-pointer place-content-center rounded-lg border-none border-current bg-transparent',
  'text-(--color-text-tertiary) no-underline [&>svg]:size-[18px]',
  'hover:bg-(--alpha-04) hover:text-foreground',
  'aria-[current=true]:bg-(--alpha-05) aria-[current=true]:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--ring)',
].join(' ')

/** `.pD-cham`: 7px danger-solid, góc trên phải lệch 7px, vòng 2px màu muted (số trần đúng nguồn). */
export const chamGap =
  'pointer-events-none absolute top-[7px] right-[7px] size-[7px] rounded-(--radius-full) border-none border-current bg-(--color-background-danger-solid) [box-shadow:0_0_0_2px_var(--muted)]'

/** `.pD-ngan`: vạch 20×1, lề dọc 6, màu border. */
export const ngan = 'my-1.5 h-px w-5 shrink-0 border-none border-current bg-border'

/** `.pD-avatar` (+ `.p-avatar`): 28px, cách trên 6, line-height 14, không giãn chữ. Màu theo Avatar DS (bản 35). */
export const avatar = 'mt-1.5 size-7 leading-[14px] tracking-normal'

/**
 * `.pD-panel`: 288, cách đỉnh 8, nền background + lớp alpha-02, viền trên/trái alpha-06 · phải alpha-08 · dưới không,
 * bo trên-trái xl, bóng 0 0 8 alpha-05. ≤767: rộng min(288, 100vw − 52 − 24), sát đỉnh, chỉ viền trái, không bo.
 */
export const panel = [
  'flex min-h-0 w-72 shrink-0 flex-col mt-2 bg-background bg-[image:linear-gradient(var(--alpha-02),var(--alpha-02))]',
  'border-solid [border-width:1px_1px_0_1px] [border-color:var(--alpha-06)_var(--alpha-08)_transparent_var(--alpha-06)]',
  'rounded-tl-xl [box-shadow:0_0_8px_var(--alpha-05)]',
  'max-[767px]:w-[min(288px,calc(100vw-52px-24px))] max-[767px]:mt-0 max-[767px]:[border-width:0_0_0_1px] max-[767px]:rounded-none',
].join(' ')

/** `.pD-dau`: cao 52, padding 0 8 0 16, gap 4. Nút trong đầu panel chữ tertiary, rê thì foreground. */
export const dau = [
  'flex h-13 shrink-0 items-center gap-1 pr-2 pl-4 border-none border-current',
  '[&_button]:text-(--color-text-tertiary) [&_button:hover]:text-foreground',
].join(' ')

/** `.pD-tieude`: 18/26 600, letter-spacing 0, gray-600, chấm màu khu cách 8. */
export const tieuDe =
  'm-0 inline-flex min-w-0 items-center gap-2 border-none border-current text-[18px] leading-[26px] font-semibold tracking-normal text-(--gray-600)'

/** `.p-cham`: chấm 8px. Màu khu (dữ liệu) gắn bằng style. */
export const cham = 'size-2 shrink-0 rounded-(--radius-full) border-none border-current'

/** `.pD-cuon`: phần cuộn của panel, padding 0 8 12. Nhóm cách trên 4; nhóm sau nhóm cách 14. */
export const cuon =
  'flex-1 overflow-y-auto px-2 pb-3 border-none border-current [&>[data-nhom]]:mt-1 [&>[data-nhom]+[data-nhom]]:mt-3.5'

/**
 * `.pD-cuon .ui-sidebar-item`: cao 30, padding 0 10, cách dưới 1, bo md, 14/20 400 gray-600, icon theo màu chữ;
 * hover alpha-04 + foreground; đang ở alpha-05 + foreground (giữ weight 400); focus outline 2 sidebar-ring lõm 2.
 */
export const item = [
  'mb-px flex h-7.5 w-full cursor-pointer items-center gap-2 rounded-md border-none border-current bg-transparent px-2.5',
  'text-left text-[14px] leading-5 font-normal text-(--gray-600) no-underline [&>svg]:size-4 [&>svg]:shrink-0',
  'hover:bg-(--alpha-04) hover:text-foreground',
  'aria-[current=page]:bg-(--alpha-05) aria-[current=page]:text-foreground',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring)',
].join(' ')

/** `.pD-cat`: cắt chữ một dòng. */
export const cat = 'min-w-0 truncate'

/** `.pD-so`: 12px 500 tertiary tabular-nums, đẩy sang phải. */
export const so = 'ml-auto border-none border-current text-[12px] font-medium text-(--color-text-tertiary) tabular-nums'

/** `.pD-nhan`: nhãn nhóm cao 30, padding 0 10, 14/20 400 tertiary. */
export const nhan =
  'flex h-7.5 items-center px-2.5 border-none border-current text-[14px] leading-5 font-normal text-(--color-text-tertiary)'

/** `.pD-xemthem`: nút chữ cao 30, padding 0 10, 14px tertiary, bo sm; rê foreground; focus outline 2 ring. */
export const xemThem = [
  'block h-7.5 cursor-pointer rounded-sm border-none border-current bg-transparent px-2.5 text-[14px] text-(--color-text-tertiary)',
  'hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--ring)',
].join(' ')

/**
 * `.pD-main`: vùng nội dung nền background, cách đỉnh 8, kẻ trên alpha-08 + bóng mờ lên trên. ≤767: sát đỉnh, không kẻ,
 * không bóng. Viền một cạnh: tắt viền chung rồi khai riêng cạnh trên (luật NGUON).
 */
export const main = [
  'relative mt-2 flex min-h-0 min-w-0 flex-col overflow-hidden bg-background border-none border-current',
  '[border-top-style:solid] [border-top-width:1px] [border-top-color:var(--alpha-08)] [box-shadow:0_-4px_8px_-4px_var(--alpha-05)]',
  'max-[767px]:mt-0 max-[767px]:[border-top-width:0] max-[767px]:[box-shadow:none]',
].join(' ')

/** `.pD-top`: chỉ ≤767 — cao 52, padding 0 12, gap 8, kẻ dưới border. */
export const top = [
  'hidden shrink-0 items-center gap-2 px-3 h-13 border-none border-current',
  '[border-bottom-style:solid] [border-bottom-width:1px] [border-bottom-color:var(--border)]',
  'max-[767px]:flex',
].join(' ')


/**
 * `.pD-noidung`: phần còn lại, tự cuộn, không thanh cuộn. Thêm `relative` (nguồn không có): khối cuộn làm khối chứa →
 * phần tử absolute / `sr-only` trong nội dung màn cuộn theo vùng cuộn, không tràn ra trang.
 */
export const noiDung = 'relative flex-1 overflow-y-auto border-none border-current [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * `.pF-dock`: tròn 48 góc phải dưới cách 24 (≤767: 16), z 46, nền primary, bóng shadow + hairline, icon 20; hover
 * primary-solid-hover, bấm co 0.96, focus outline 2 ring lệch 3.
 */
export const dock = [
  'absolute right-6 bottom-6 z-46 grid size-12 cursor-pointer place-content-center rounded-(--radius-full) border-none border-current',
  'bg-primary text-primary-foreground [box-shadow:var(--shadow),var(--shadow-hairline)] [&>svg]:size-5',
  '[transition:background-color_150ms_ease,transform_150ms_cubic-bezier(0.19,1,0.22,1)] motion-reduce:[transition:none]',
  'hover:bg-(--color-background-primary-solid-hover) active:scale-[0.96]',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--ring)',
  'max-[767px]:right-4 max-[767px]:bottom-4',
].join(' ')

/** `.pF-dock-so`: số gợi ý 18px, pill danger-solid, chữ 12/18 600, góc trên phải lệch 3, vòng 2px background. */
export const dockSo = [
  'pointer-events-none absolute -top-[3px] -right-[3px] grid h-[18px] min-w-[18px] place-content-center px-[5px] rounded-(--radius-full)',
  'border-none border-current bg-(--color-background-danger-solid) text-(--color-text-danger-solid)',
  'text-[12px] leading-[18px] font-semibold tabular-nums [box-shadow:0_0_0_2px_var(--background)]',
].join(' ')

/**
 * Thẻ Bắp (prototype `.pF-pop`, chưa có trong bundle.css — README "Chưa chốt: nội dung thẻ chat"): nổi trên nút dock,
 * 400 × min(600, cao − 108), bo 2xl, nền popover, bóng như dock. ≤767: phủ kín khung (README "Bắp mở toàn màn").
 */
export const theBap = [
  'absolute right-6 bottom-21 z-46 flex h-[min(600px,calc(100%-108px))] w-100 max-w-[calc(100%-48px)] flex-col overflow-hidden',
  'rounded-2xl border-none border-current bg-popover text-popover-foreground [box-shadow:var(--shadow),var(--shadow-hairline)] outline-none',
  'max-[767px]:inset-0 max-[767px]:z-60 max-[767px]:h-auto max-[767px]:w-auto max-[767px]:max-w-none max-[767px]:rounded-none',
].join(' ')

/** Đầu thẻ Bắp (prototype `.pA-bap-dau`): cao 52, padding 0 12, gap 8, kẻ dưới border. */
export const theBapDau = [
  'flex h-13 shrink-0 items-center gap-2 px-3 border-none border-current',
  '[border-bottom-style:solid] [border-bottom-width:1px] [border-bottom-color:var(--border)]',
].join(' ')

/*
 * ───────── Khung shadcn `Sidebar*` (sidebar.tsx) — giá trị từ khối `.ui-sidebar*` của bundle.css ("shadcn Sidebar ·
 * token GWT"): rộng 256, nền `--sidebar`, viền `--sidebar-border`; header đệm 12; content đệm 4/8; nhãn nhóm cao 32
 * 12/18 600 muted; mục cao 32 đệm 0 8 cách 8 bo md 14/20, rê / đang chọn nền `--sidebar-accent` (đang chọn 500), icon
 * muted (đang chọn foreground), focus outline 2 `--sidebar-ring` lõm 2; footer đệm 8 kẻ trên. Phần artifact không có
 * (thu icon, floating/inset, rail, menu con, action, badge, skeleton) lấy khung shadcn, số theo thang DS.
 * Thang z: khung cố định 45 / rail 46 (như KhungApp — NGUON).
 * ─────────
 */

/** `sidebar-wrapper` (SidebarProvider). */
export const scWrapper =
  'group/sidebar-wrapper flex min-h-svh w-full border-none border-current has-data-[variant=inset]:bg-(--sidebar)'

/** `collapsible="none"`: `.ui-sidebar` tĩnh. */
export const scTinh =
  'flex h-full w-(--sidebar-width) flex-col border-none border-current bg-(--sidebar) text-(--sidebar-foreground)'

/** Điện thoại: SheetContent làm ngăn kéo (rộng 288 = panel KhungApp). */
export const scNgan =
  'w-(--sidebar-width) max-w-none [@media(max-width:640px)]:w-(--sidebar-width) gap-0 bg-(--sidebar) p-0 text-(--sidebar-foreground)'

export const scGoc = 'group peer hidden border-none border-current text-(--sidebar-foreground) md:block'

export const scGap = [
  'relative w-(--sidebar-width) border-none border-current bg-transparent transition-[width] duration-200 ease-linear',
  'group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180',
].join(' ')
export const scGapNoi = 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
export const scGapThuong = 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'

export const scKhung =
  'fixed inset-y-0 z-45 hidden h-svh w-(--sidebar-width) border-none border-current transition-[left,right,width,visibility] duration-200 ease-linear md:flex group-data-[collapsible=offcanvas]:invisible'
export const scKhungTrai = 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
export const scKhungPhai = 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]'
export const scKhungNoi = 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
/** `.ui-sidebar` viền phải 1px `--sidebar-border` (phía phải thì viền trái). Chỉ một cạnh: kiểu none·solid·none·none. */
export const scKhungThuong = [
  'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
  'group-data-[side=left]:[border-style:none_solid_none_none] group-data-[side=left]:border-r group-data-[side=left]:border-r-(--sidebar-border)',
  'group-data-[side=right]:[border-style:none_none_none_solid] group-data-[side=right]:border-l group-data-[side=right]:border-l-(--sidebar-border)',
].join(' ')

/** `sidebar-inner`: `.ui-sidebar` (nền + chữ); floating = bo lg + bóng hairline + 100. */
export const scTrong = [
  'flex h-full w-full flex-col border-none border-current bg-(--sidebar) text-(--sidebar-foreground)',
  'group-data-[variant=floating]:rounded-(--radius-lg) group-data-[variant=floating]:[box-shadow:var(--shadow-hairline),var(--shadow-100)]',
].join(' ')

/** `SidebarRail`: vùng bấm 16 vắt mép, vạch 2px `--sidebar-border` khi rê. */
export const scRail = [
  'visible absolute inset-y-0 z-46 hidden w-4 -translate-x-1/2 border-none border-current bg-transparent p-0 transition-all ease-linear sm:flex',
  'group-data-[side=left]:-right-4 group-data-[side=right]:left-0',
  "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:border-none after:content-[''] hover:after:bg-(--sidebar-border)",
  'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
  '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
  'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-(--sidebar)',
  '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
].join(' ')

/** `SidebarInset` (`<main>`): nền background; `inset` = cách 8, bo xl, bóng hairline + 100. */
export const scInset = [
  'relative flex w-full flex-1 flex-col border-none border-current bg-background',
  'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-(--radius-xl)',
  'md:peer-data-[variant=inset]:[box-shadow:var(--shadow-hairline),var(--shadow-100)] md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
].join(' ')

/** `.ui-sidebar-header`: đệm 12, cách 8 (khung shadcn xếp cột). Thu icon (rộng 48): đệm 8 như shadcn → ô 32 nằm giữa. */
export const scHeader = 'flex flex-col gap-2 p-3 border-none border-current group-data-[collapsible=icon]:p-2'
/** `.ui-sidebar-footer`: đệm 8, kẻ trên `--sidebar-border`. */
export const scFooter = [
  'flex flex-col gap-2 p-2 border-none border-current',
  '[border-top-style:solid] [border-top-width:1px] [border-top-color:var(--sidebar-border)]',
].join(' ')

/** `.ui-sidebar-content`: phần cuộn, đệm 4/8; nhóm cách nhau 12 (`.ui-sidebar-group + .ui-sidebar-group`). */
export const scContent = [
  'flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-2 py-1 border-none border-current',
  'group-data-[collapsible=icon]:overflow-hidden',
].join(' ')
export const scGroup = 'relative flex w-full min-w-0 flex-col border-none border-current'

/** `.ui-sidebar-label`: cao 32, đệm 0 8, 12/18 600 muted. Thu icon: trượt lên + mờ hẳn (shadcn). */
export const scGroupLabel = [
  'flex h-(--control-size-md) shrink-0 items-center rounded-(--radius-md) px-2 border-none border-current',
  'text-[12px] leading-[18px] font-semibold text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0',
  'transition-[margin,opacity] duration-200 ease-linear',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring)',
  'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
].join(' ')

/** Nút nhỏ 20 góc phải nhãn nhóm / mục (shadcn), rê nền `--sidebar-accent`; điện thoại nới vùng bấm 8 mỗi phía. */
const nutNho = [
  'absolute flex aspect-square w-5 cursor-pointer items-center justify-center rounded-(--radius-md) p-0 border-none border-current bg-transparent',
  'text-(--sidebar-foreground) hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground)',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring) [&>svg]:size-4 [&>svg]:shrink-0',
  "after:absolute after:-inset-2 after:border-none after:content-[''] md:after:hidden",
].join(' ')
/** Nhãn nhóm cao 32 → nút 20 cách trên 6, phải 4. */
export const scGroupAction = [nutNho, 'top-1.5 right-1 transition-transform group-data-[collapsible=icon]:hidden'].join(' ')

export const scGroupContent = 'w-full border-none border-current text-[14px]'
/** `ul` mục: cách 1 (như `.pD-cuon .ui-sidebar-item` cách dưới 1). */
export const scMenu = 'm-0 flex w-full min-w-0 list-none flex-col gap-px p-0 border-none border-current'
export const scMenuItem = 'group/menu-item relative border-none border-current'

/**
 * `sidebarMenuButtonVariants` — `.ui-sidebar-item`. `variant` default/outline, `size` default (32) / sm (28, 12/18) /
 * lg (48) như shadcn. Đang chọn: `data-active=true` (shadcn) hoặc `aria-current=page` (link màn đang mở, artifact).
 */
export const sidebarMenuButtonVariants = cva(
  [
    'peer/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-(--radius-md) px-2 border-none border-current',
    'bg-transparent text-left text-inherit font-normal no-underline transition-[width,height,padding]',
    'hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground) active:bg-(--sidebar-accent) active:text-(--sidebar-accent-foreground)',
    'data-[active=true]:bg-(--sidebar-accent) data-[active=true]:font-medium data-[active=true]:text-(--sidebar-accent-foreground)',
    'aria-[current=page]:bg-(--sidebar-accent) aria-[current=page]:font-medium',
    'data-[state=open]:hover:bg-(--sidebar-accent) data-[state=open]:hover:text-(--sidebar-accent-foreground)',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring)',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
    'data-[active=true]:[&>svg]:text-foreground aria-[current=page]:[&>svg]:text-foreground',
  ],
  {
    variants: {
      variant: {
        default: '',
        outline: ['bg-background [box-shadow:0_0_0_1px_var(--sidebar-border)]', 'hover:[box-shadow:0_0_0_1px_var(--sidebar-accent)]'],
      },
      size: {
        default: 'h-(--control-size-md) text-[14px] leading-5',
        sm: 'h-(--control-size-sm) text-[12px] leading-[18px]',
        lg: 'h-12 text-[14px] leading-5 group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

/** `SidebarMenuAction`: nút 20 góc phải mục (cách trên theo size mục). */
export const scMenuAction = [
  nutNho,
  'right-1 transition-transform peer-hover/menu-button:text-(--sidebar-accent-foreground)',
  'peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3.5',
  'group-data-[collapsible=icon]:hidden',
].join(' ')
/** `showOnHover`: ẩn tới khi rê/focus mục (máy tính), điện thoại luôn hiện. */
export const scMenuActionHien = [
  'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
  'peer-data-[active=true]/menu-button:text-(--sidebar-accent-foreground)',
].join(' ')

/** `SidebarMenuBadge`: số góc phải mục — như `.pD-so` (12px 500 tertiary tabular-nums). */
export const scMenuBadge = [
  'pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-(--radius-md) px-1 border-none border-current select-none',
  'text-[12px] font-medium text-(--color-text-tertiary) tabular-nums',
  'peer-hover/menu-button:text-(--sidebar-accent-foreground) peer-data-[active=true]/menu-button:text-(--sidebar-accent-foreground)',
  'peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3.5',
  'group-data-[collapsible=icon]:hidden',
].join(' ')

export const scMenuSkeleton = 'flex h-(--control-size-md) items-center gap-2 rounded-(--radius-md) px-2 border-none border-current'

/** `SidebarMenuSub`: danh sách con thụt 14, vạch trái `--sidebar-border`, đệm 2/10. */
export const scMenuSub = [
  'mx-3.5 my-0 flex min-w-0 translate-x-px list-none flex-col gap-px px-2.5 py-0.5',
  '[border-style:none_none_none_solid] border-l border-l-(--sidebar-border) group-data-[collapsible=icon]:hidden',
].join(' ')
export const scMenuSubItem = 'group/menu-sub-item relative border-none border-current'
export const scMenuSubButton = [
  'flex h-(--control-size-sm) min-w-0 -translate-x-px cursor-pointer items-center gap-2 overflow-hidden rounded-(--radius-md) px-2 border-none border-current',
  'text-(--sidebar-foreground) no-underline hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground)',
  'active:bg-(--sidebar-accent) active:text-(--sidebar-accent-foreground)',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--sidebar-ring)',
  'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-(--sidebar-accent-foreground)',
  'data-[active=true]:bg-(--sidebar-accent) data-[active=true]:text-(--sidebar-accent-foreground)',
  'aria-[current=page]:bg-(--sidebar-accent) aria-[current=page]:text-(--sidebar-accent-foreground)',
  'data-[size=sm]:text-[12px] data-[size=sm]:leading-[18px] data-[size=md]:text-[14px] data-[size=md]:leading-5',
  'group-data-[collapsible=icon]:hidden',
].join(' ')
