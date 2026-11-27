// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
// File THƯỜNG (không 'use client'): chuỗi class — server component đọc được.
import type { GiaoDienBang } from '@/bang/giaoDien'
import { cn } from '@/lib/utils'

/**
 * Kiểu Table — chép từ `.b-bang*` / `.b-th-*` / `.b-co` / `.b-keo-bong` / `.ui-th-sort` của ds/nguon/bundle.css (khối
 * "B. Bảng" của prototype, đúng bảng Token trong README Table) + `.ui-table-wrap` cho khung có viền (khối trạng thái).
 * `layout="fixed"` = `.b-bang-c` (sửa tại ô: `table-layout: fixed` + colgroup, đệm ngang 6, ô cắt tràn).
 * Mọi phần tử tắt viền preflight của app (`0 solid var(--border)`) rồi mới khai viền cần có.
 */
const kv = 'border-none border-current'

/*
 * Cột ô chọn nằm TRONG mép bảng, luôn hiện, dính trái (khuôn F — CEO 27/11 áp mọi bảng; trước 23/11 ở lề ngoài + ẩn chờ
 * rê, 26/11 bảng ticket đổi sang như Twenty). Xem `CHON_BANG`.
 */

/** `.b-bang-khung`: tự cuộn hai chiều (header sticky dính trong khung), thanh cuộn ẩn — vẫn cuộn bằng chuột/phím. */
export const tableWrap = cn(kv, 'relative w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')
/** `table-container` của shadcn (`Table` đứng ngoài `TableWrap`): cuộn ngang, thanh cuộn ẩn như `TableWrap`. */
export const tableContainer = cn(kv, 'relative w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')
/** `.ui-table-wrap`: viền 1px border, bo radius-xl, nền card (khối trạng thái của preview). */
export const tableWrapVien = cn('border border-solid border-(--border) rounded-(--radius-xl) bg-card')

/**
 * Bảng LƯỚI (CEO 27/11 "làm thêm một version ở dạng table… thêm border cho trái phải và các cột. Bo góc 24px"): khung viền
 * như `vien` (bo 12 — CEO 27/11 "cho radius về 12", trước 24) + vạch dọc giữa các cột; nhãn/đệm/chip giữ nguyên khuôn F. Bỏ kẻ trên hàng tiêu đề và kẻ dưới
 * dòng cuối (khung đã có viền). Thử trên /ticket?bang=luoi — chờ CEO chốt.
 */
export const tableWrapLuoi = cn(
  tableWrapVien,
  // Vạch cột alpha-05 = kẻ ngang dòng (CEO 27/11 "border cột mờ thêm"; trước 08). Không vạch giữa cột ô chọn và cột
  // đầu (CEO 27/11, học Twenty) — ô chứa ô tick bỏ qua.
  '[&_th:not(:last-child):not(:has(>input[type=checkbox],>[role=checkbox]))]:[border-right:1px_solid_var(--alpha-05)]!',
  '[&_td:not(:last-child):not(:has(>input[type=checkbox],>[role=checkbox]))]:[border-right:1px_solid_var(--alpha-05)]!',
  '[&_th]:[border-top-style:none]! [&_tbody>tr:last-child>td]:[border-bottom-style:none]!',
  // Ô tick cách viền trái = khoảng trên/dưới: (44 − 18) / 2 = 13 (CEO 27/11 "padding đều trên dưới bên trái"; bảng dòng giữ 8).
  'md:[&_:is(th,td):has(>input[type=checkbox],>[role=checkbox])]:pl-[13px]!',
  // Đệm nội dung (CEO 27/11 "giảm còn 1 nửa" rồi "bên trái cột rộng thêm 4px"): chữ ở 14 trái · 10 phải — ô thân 14/10;
  // tiêu đề cũng 14/10 (nút tiêu đề lùi −8 vào đệm, chữ vẫn ở 14).
  '[&_td:not(:has(>input[type=checkbox],>[role=checkbox]))]:pl-3.5! [&_td:not(:has(>input[type=checkbox],>[role=checkbox]))]:pr-2.5!',
  '[&_th:not(:has(>input[type=checkbox],>[role=checkbox]))]:pl-3.5! [&_th:not(:has(>input[type=checkbox],>[role=checkbox]))]:pr-2.5!',
)
/** Phân trang của bảng lưới: thẳng ô tick (viền khung 1 + đệm 13). */
export const phanTrangLuoi = cn(kv, 'mt-3 flex items-center justify-between gap-2 md:pl-[14px] text-[12px] leading-[18px] text-muted-foreground')

/** `.b-bang`: 100%, viền tách 0, chữ 14 (line-height kế thừa 20 của DsRoot). */
export const table = cn(kv, 'w-full caption-bottom border-separate border-spacing-0 text-[14px]')
/** `.b-bang-c`. */
export const tableFixed = 'table-fixed has-[>colgroup[data-cho-do]]:invisible'

/**
 * Ô tick là con TRỰC TIẾP của `th`/`td` (ô chọn dòng / chọn tất cả: Checkbox DS hoặc `<input type=checkbox>` của bang/ —
 * cả hai cùng `relative top-px inline-grid` như `.ui-checkbox`): bỏ `top` + thành lưới khối → `vertical-align: middle` của ô căn TÂM ô tick đúng tâm dòng. Bản inline nằm trên baseline, cộng
 * `top: 1px` của Checkbox (cần cho nhãn chữ ChoiceLabel) → thấp hơn chữ cùng dòng 2–3px (đo 22/11, artifact `.b-bang`
 * cũng lệch 2–2,6px). Thay cho `translate-y-[2px]` của shadcn. Ô tick trong nhóm flex (NotificationMatrix) chỉ bỏ độ dời top.
 */
export const oTick =
  '[&>[role=checkbox]]:top-0 [&>[role=checkbox]]:grid [&>input[type=checkbox]]:top-0 [&>input[type=checkbox]]:grid'

/**
 * `.b-bang th` — KHUÔN F là mặc định MỌI bảng dữ liệu (CEO 27/11 "áp dụng hết… lưu vào DS trước"; trước chỉ bảng có cột
 * ghim): dính đầu z 2, cao 44 = dòng thân, kẻ TRÊN + dưới alpha-08, chữ 12/18 600 VIẾT HOA giãn nhẹ, màu tertiary (như
 * Twenty). Đệm ngang 20 = ô thân (`td`); nút tiêu đề (`thSort`) lùi −8 hai bên vào đệm → vùng rê/kéo/chip lọc rộng hơn mà
 * chữ vẫn ở 20 (ảnh Figma CEO 12 + 8). Ô chọn (ô tick) giữ đệm riêng (`cotChon`/`chon_oTh`). Viết hoa ép xuống cả con
 * (`**:`): nút tiêu đề bị preflight đặt `text-transform: none`.
 */
export const th = cn(
  'sticky top-0 z-2 h-(--control-size-2xl) bg-background',
  'border-0 border-y [border-style:solid_none] border-current border-y-(--alpha-08)',
  'text-left align-middle text-[12px] leading-[18px] font-semibold text-(--color-text-tertiary) whitespace-nowrap',
  'uppercase **:uppercase tracking-wide',
  '[&:not(:has(input[type=checkbox],[role=checkbox]))]:px-5',
  oTick,
)
/** `.b-bang td`: cao 44, đệm ngang 10, kẻ dưới alpha-05, không xuống dòng, tối đa 280 (`.b-bang-c`: đệm 6, không trần, cắt). */
/** Hàng nháp của `DongThem` (CEO 25/11 "ra hẳn một hàng trống"): ô nền đang gõ alpha-05 (như nền rê dòng). */
// `!`: ô thân Bảng tự mang nền (alpha-02) đè lớp của dòng; phủ cả ô chọn (cột chọn nằm trong bảng).
export const hangNhap = '[&>td]:bg-(--alpha-05)!'

export const td = cn(
  'h-(--control-size-2xl) max-w-[280px] align-middle whitespace-nowrap',
  // Đệm ngang 20 (khuôn F — thẳng chữ tiêu đề, xem `th`). Trừ cột ô chọn.
  '[&:not(:has(input[type=checkbox],[role=checkbox]))]:px-5',
  'border-0 border-b [border-style:none_none_solid] border-current border-b-(--alpha-05)',
  'in-data-[layout=fixed]:max-w-none in-data-[layout=fixed]:overflow-hidden',
  // `.b-bang-c tbody .ui-badge`: badge trong ô cao 22 (= avatar) → mọi phần tử trong dòng thẳng hàng.
  'in-data-[layout=fixed]:[&_[data-slot=badge]]:h-(--control-size-3xs)',
  oTick,
)
/**
 * `.b-bang tbody tr:hover td` alpha-02 · `tr[data-chon] td` info-soft-alpha (dự phòng alpha-05).
 * Dòng đang trỏ (`data-con-tro`, chưa có trong artifact — prototype menu thuộc tính duyệt 20/11): nền alpha-04, thắng hover
 * (một lớp nền), thua "đã chọn". Focus phím: vòng 2px ring lùi vào −2 (khung cuộn cắt vòng ngoài). Không reset outline
 * bằng utility tắt-outline của Tailwind (NGUON: mất vòng focus) — dùng thuộc tính outline:none thô + kiểu solid khi focus.
 */
export const tr = cn(
  'not-data-[state=selected]:hover:[&>td]:bg-(--alpha-02)',
  'data-[state=selected]:[&>td]:bg-(--color-background-info-soft-alpha,var(--alpha-05))',
  'not-data-[state=selected]:data-con-tro:[&>td]:bg-(--alpha-04)',
  // Cùng màu trạng thái dưới dạng biến `--nen-dong` cho ô GHIM (`oGhim`): ô dính phải đục, nên vẽ màu này đè lên nền.
  'not-data-[state=selected]:hover:[--nen-dong:var(--alpha-02)]',
  'data-[state=selected]:[--nen-dong:var(--color-background-info-soft-alpha,var(--alpha-05))]',
  'not-data-[state=selected]:data-con-tro:[--nen-dong:var(--alpha-04)]',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(--ring)',
)
export const tfootTd = 'bg-muted font-semibold border-t border-solid border-(--border) border-b-0'
/** `TableCaption`: shadcn `mt-4 text-sm text-muted-foreground` → 14/20 muted (artifact chưa có). */
export const caption = cn(kv, 'mt-4 text-[14px] leading-5 text-muted-foreground')
/** `.b-phai`. */
export const phai = 'text-right'
/** `.b-ma`: mã 12/18 tabular, color-text-tertiary (font-sans, không mono). */
export const ma = cn(kv, 'text-[12px] leading-[18px] tabular-nums text-(--color-text-tertiary) whitespace-nowrap')

/** `.b-cot-chon`: ô chọn rộng 36, đệm trái 16 (từ md 8 — xem `CHON_BANG`). */
export const cotChon = 'w-9 min-w-9 pl-4! md:pl-2! md:pr-0'
/** `.b-cot-dem`: cột đệm cuối ăn chỗ thừa (khung hẹp thì về 0) — cột thật giữ đúng độ rộng đã kéo. */
export const cotDem = 'p-0!'

/**
 * Ô tiêu đề kéo được (`.b-th-keo` + `.b-th-keo .ui-th-sort` + `:has([aria-expanded=true])`): MỘT lớp hover — cả ô sáng
 * alpha-04 trên nền background, chữ foreground; nút menu phủ kín ô, không nền riêng. Con trỏ grab (đang kéo: grabbing).
 * Đang kéo (`data-keo`): nền alpha-05, nội dung mờ 40%. Vạch thả (`data-tren`): 2px ring trong ô, trái/phải.
 */
export const thKeo = cn(
  'cursor-grab active:cursor-grabbing [transition:background-color_120ms_ease]',
  'hover:[background:linear-gradient(var(--alpha-04),var(--alpha-04)),var(--background)] hover:text-foreground',
  'has-[[aria-expanded=true]]:[background:linear-gradient(var(--alpha-04),var(--alpha-04)),var(--background)]',
  'has-[[aria-expanded=true]]:text-foreground',
)
/** Ô (th + td) của cột đang kéo + vạch thả — áp chung cho thead và tbody (vạch chạy suốt chiều cao bảng). */
export const oKeo = cn(
  'data-keo:[background:linear-gradient(var(--alpha-05),var(--alpha-05)),var(--background)] data-keo:[&>*]:opacity-40',
  'data-[tren=trai]:[box-shadow:inset_2px_0_0_var(--ring)] data-[tren=phai]:[box-shadow:inset_-2px_0_0_var(--ring)]',
)

/**
 * `.ui-th-sort` trong ô kéo được: flex 1, cao 36, không đệm/bo/nền, chữ kế thừa ô, khoảng 4, icon 12. Đang sắp/lọc
 * (`data-on`) + đang mở: chữ foreground, sắp/lọc thêm 500. Focus: vòng 2px ring LÙI VÀO −2 (nguồn +2 — nút cao bằng ô,
 * vòng ngoài bị khung cuộn cắt mép trên; NGUON: vùng overflow cắt vòng focus con).
 */
export const thSort = cn(
  kv,
  // w-full: <button> không tự giãn như div — `.b-loc-o` (flex, rộng 100%) + `flex: 1` của nguồn = phủ kín ô.
  // Lùi −8 hai bên vào đệm 20 của ô (đệm trong 8 bù lại → chữ vẫn ở 20): vùng rê/kéo rộng hơn, chừa chỗ chip lọc (CEO 27/11
  // ảnh Figma 12 + 8). w-[100%+16]: <button> không tự giãn như div.
  'flex w-[calc(100%+--spacing(4))] min-w-0 items-center gap-1 h-(--control-size-lg) -mx-2 my-0 px-2 py-0 rounded-none bg-transparent',
  'font-[inherit] text-inherit whitespace-nowrap cursor-[inherit] [outline:none]',
  // Đang sắp/lọc: chữ foreground, GIỮ 600 của khuôn F (không hạ 500 — lệch kiểu với cột khác).
  'hover:text-foreground aria-expanded:text-foreground data-on:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(--ring)',
  '[&_svg]:size-3 [&_svg]:shrink-0',
  // `.b-th-an`: mũi tên mở menu ẩn, hiện 50% khi rê ô.
  '[&_[data-an]]:opacity-0 in-[th:hover]:[&_[data-an]]:opacity-50 in-[[role=columnheader]:hover]:[&_[data-an]]:opacity-50',
)
/** Cột căn phải: chữ dồn phải trong nút phủ kín ô. */
export const thSortPhai = 'justify-end'
/**
 * Nhãn cột ĐANG LỌC = chip (CEO 27/11): nền info-surface, chữ text-info, icon lọc DS (Phosphor regular, cỡ 12 của tiêu đề);
 * đệm 8 TOẢ RA NGOÀI (-ml-2) lấp đúng phần đệm 8 của nút tiêu đề `thSort` → chữ nhãn vẫn thẳng chữ ô (CEO 27/11 ảnh Figma
 * 12 + 8: "tạo thêm padding chứ ko phải đẩy lùi vào trong").
 */
export const thChipLoc = cn(
  kv,
  // Đệm 7 + viền 1 = 8: chữ chip vẫn thẳng chữ ô.
  'inline-flex min-w-0 items-center gap-1.5 h-6 -ml-2 px-[7px] rounded-(--radius-full) font-semibold',
  'bg-(--color-background-info-surface) text-(--color-text-info) tabular-nums',
  // Bấm được (mở pop lọc) → con trỏ tay; rê = VIỀN xanh đậm lên (CEO 27/11 "hover vào chip thì stroke đậm lên").
  'cursor-pointer border border-solid border-(--color-border-info-surface) hover:border-(--color-border-info-outline)',
)
/** Chip có nút × (bỏ lọc nhanh, CEO 27/11): phải lùi còn 2 cho ô × tròn 20 nằm gọn trong chip. */
export const thChipLocX = 'pr-0.5 gap-0.5'
/** Phần chữ của chip có × = nút mở pop lọc (nút × là anh em — không lồng nút trong nút). */
export const thChipMo = cn(
  kv,
  'inline-flex min-w-0 items-center gap-1.5 h-full m-0 p-0 border-0 bg-transparent rounded-(--radius-full)',
  'font-[inherit] text-inherit cursor-pointer [outline:none] [&_svg]:size-3 [&_svg]:shrink-0',
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
)
/** `.b-th-loc`: icon lọc DS + số giá trị đang lọc, 12/18 color-text-info tabular, icon 12 (Phosphor regular). */
export const thLoc = cn(
  kv,
  'inline-flex items-center gap-px text-[12px] leading-[18px] text-(--color-text-info) tabular-nums [&_svg]:size-3!',
)

/**
 * `.b-co`: tay co dãn — vùng bấm 16 vắt qua mép phải ô (phải −8), cao suốt ô, z 3, con trỏ col-resize. Vạch 2px ring
 * (cách trên/dưới 6, bo 1) hiện khi rê / đang kéo / focus phím.
 */
export const tayCo = cn(
  kv,
  'absolute top-0 -right-2 bottom-0 z-3 w-4 cursor-col-resize touch-none [outline:none]',
  "after:content-[''] after:absolute after:top-1.5 after:bottom-1.5 after:left-[7px] after:w-0.5 after:rounded-[1px]",
  'after:border-none after:border-current after:bg-transparent after:[transition:background-color_120ms_ease]',
  'hover:after:bg-(--ring) active:after:bg-(--ring) focus-visible:after:bg-(--ring)',
)

/** `.b-keo-bong`: thẻ nhỏ tên cột đi theo chuột — cao 28, đệm 10, bo radius-md, nền background, hairline + shadow-300. */
export const keoBong = cn(
  kv,
  'inline-flex items-center h-(--control-size-sm) px-2.5 rounded-(--radius-md) bg-background text-foreground',
  '[box-shadow:var(--shadow-hairline),var(--shadow-300)] text-[12px] leading-[18px] font-medium whitespace-nowrap cursor-grabbing',
)

/*
 * Ô chọn dòng ẨN CHỜ RÊ (CEO chốt 23/11): cột ô chọn giữ nguyên chỗ (không xô nội dung), ô mờ hẳn (opacity 0, vẫn
 * bấm/Tab được); hiện khi rê hoặc focus trong dòng, ô đang tick / nửa tick, đã có dòng được chọn (`data-co-chon` của
 * KhungChon — thấy được mình đang chọn gì), và trên máy cảm ứng (không có rê). Ô "chọn tất cả" ở đầu bảng hiện khi rê
 * cả bảng. Ô chọn CHỈ để chọn dòng — không dùng ô tick làm "xong việc".
 */
export const anChoRe =
  '*:opacity-0 [&>:checked]:opacity-100 [&>:focus-visible]:opacity-100 [tr:hover_&]:*:opacity-100 [tr:focus-within_&]:*:opacity-100 [[data-co-chon]_&]:*:opacity-100 [@media(hover:none)]:*:opacity-100'
export const anChoReDau =
  '*:opacity-0 [&>:checked]:opacity-100 [&>:indeterminate]:opacity-100 [&>:focus-visible]:opacity-100 [table:hover_&]:*:opacity-100 [[data-co-chon]_&]:*:opacity-100 [@media(hover:none)]:*:opacity-100'
export const anChoReO =
  '*:opacity-0 [&>:checked]:opacity-100 [&>:focus-visible]:opacity-100 [[data-slot=list-view-row]:hover_&]:*:opacity-100 [[data-slot=list-view-row]:focus-within_&]:*:opacity-100 [[data-co-chon]_&]:*:opacity-100 [@media(hover:none)]:*:opacity-100'

/**
 * Cột GHIM (học Twenty 26/11): cột nhãn `khoa` đứng ĐẦU bảng dính trái khi bảng cuộn ngang (`laGhim` của use-cot-bang;
 * `TieuDeCot` tự gắn, ô thân truyền `TableCell ghim`). Lệch trái 36 khi bảng có cột ô chọn (cột đó cũng dính — dùng
 * `CHON_BANG_GHIM`), không thì 0. Nền ĐỤC: `--background` + màu trạng thái dòng (`--nen-dong` của `tr`) vẽ đè — MỘT lớp,
 * không lộ ô đang cuộn bên dưới. Tiêu đề: z do `TieuDeCot` đặt (cột đầu cao nhất), ô thân z 1.
 * Mép phải: KHÔNG kẻ vạch dọc — CEO 26/11 "bỏ mấy cái line lẫn từ Twenty, giữ UI như cũ" (bảng DS chỉ kẻ ngang).
 */
const ghimTrai = 'sticky left-0 [table:has(>thead>tr>th:first-child>input[type=checkbox])_&]:left-9'
const nenDuc = 'bg-background! bg-[image:linear-gradient(var(--nen-dong,transparent),var(--nen-dong,transparent))]!'
export const thGhim = ghimTrai
export const oGhim = cn(ghimTrai, 'z-1', nenDuc)

/**
 * Ô chọn dòng của bang/ (`OChonTatCa` / `OChonDong` / `OChonO`) theo khung `.b-bang` — bơm qua `CauHinhBangDs giaoDien`.
 * Khuôn F (mọi bảng, CEO 27/11): cột ô chọn TRONG mép nội dung, LUÔN HIỆN (như Twenty — CEO 26/11), dính trái (bảng cuộn
 * ngang không lộ ô đang cuộn ở 36px trái); ô tick thụt 8 = mép chữ tab pill đầu (CEO 26/11 "checkbox phải thụt vào");
 * kẻ ngang + nền dòng (`--nen-dong`) phủ cả ô chọn (CEO 26/11). Tiêu đề z 30: trên mọi tiêu đề `TieuDeCot`.
 */
export const CHON_BANG: Partial<GiaoDienBang> = {
  chon_oTh: cn(th, cotChon, 'left-0 z-30'),
  chon_oTd: cn(td, cotChon, 'sticky left-0 z-1', nenDuc),
  // Dòng ListView: ô chọn NẰM TRONG dòng, đầu ô đầu, luôn hiện như cột ô chọn của Bảng khuôn F (CEO 27/11 "đẩy checkbox
  // vào bên trong luôn" — thay luật 25/11 ô tick ra lề ngoài dòng). Nền rê / chọn của dòng phủ cả ô tick.
  chon_oO: cn('inline-flex shrink-0', '[&>input]:top-0'),
  // Phân trang thẳng ô tick (đệm trái 8 từ md) — CEO 27/11 "1–4 trên 4 ticket cho align dọc với checkbox".
  phanTrang_khung: cn(kv, 'mt-3 flex items-center justify-between gap-2 md:pl-2 text-[12px] leading-[18px] text-muted-foreground'),
}
/** @deprecated Cùng `CHON_BANG` (27/11 khuôn F gộp hai bản) — giữ tên cho chỗ gọi cũ. */
export const CHON_BANG_GHIM = CHON_BANG

/*
 * Vẻ bảng THƯỜNG — `.ui-table*` của bundle.css (bảng thường của artifact: NotificationMatrix, bảng số liệu…), chọn bằng
 * `<Table variant="thuong">`. Khác vẻ dữ liệu (`.b-bang`): đầu cột nền surface-secondary 600 đệm 12 z 1, ô cao 40 đệm 12,
 * kẻ dưới `--border`, hàng cuối hết kẻ, rê primary-outline-hover, chọn accent. Chữ bảng 14/20.
 */
export const tableThuong = cn(kv, 'w-full caption-bottom border-separate border-spacing-0 text-[14px] leading-[20px]')
export const thThuong = cn(
  'sticky top-0 z-1 h-(--control-size-lg) px-(--control-gutter-md) bg-(--color-surface-secondary)',
  'border-0 border-b [border-style:none_none_solid] border-current border-b-(--border)',
  'text-left text-[12px] leading-[18px] font-semibold text-muted-foreground whitespace-nowrap',
  oTick,
)
export const tdThuong = cn(
  'h-(--control-size-xl) px-(--control-gutter-md) whitespace-nowrap',
  'border-0 border-b [border-style:none_none_solid] border-current border-b-(--border)',
  // `.ui-table tbody tr:last-child td { border-bottom: 0 }`
  '[tbody>tr:last-child>&]:border-b-0',
  oTick,
)
export const trThuong = cn(
  'not-data-[state=selected]:hover:[&>td]:bg-(--color-background-primary-outline-hover)',
  'data-[state=selected]:[&>td]:bg-accent',
)
