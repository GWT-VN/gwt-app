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

/** SheetContent ngăn kéo trái: bám mép trái, rộng theo nội dung, nền muted, `--shadow-400` (`.pD-trai[data-mo="true"]`). */
export const nganKeo =
  'left-0 right-auto w-auto [@media(max-width:640px)]:w-auto flex-row bg-muted [box-shadow:var(--shadow-400)]'

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


/** `.pD-noidung`: phần còn lại, tự cuộn, không thanh cuộn. */
export const noiDung = 'flex-1 overflow-y-auto border-none border-current [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

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
