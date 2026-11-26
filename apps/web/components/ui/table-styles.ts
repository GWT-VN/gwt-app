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
 * Cột ô chọn nằm NGOÀI mép bảng (CEO 23/11): khung cuộn có ô chọn-tất-cả ở cột đầu → lùi trái đúng bề rộng cột chọn
 * (36 — khớp `<col>` 36 của các bảng) và nở thêm 36, nên cột dữ liệu đầu thẳng mép nội dung trang, ô chọn nằm ở lề. Chỉ từ md (lề trang ≥ 46);
 * dưới md lề 24 không đủ chỗ → cột chọn ở trong bảng như cũ. Khung có viền (`tableWrapVien`) không lùi.
 * (Lớp viết nguyên chuỗi ở từng chỗ — Tailwind chỉ quét chuỗi literal.)
 * NGOẠI LỆ bảng có cột GHIM (`th[data-ghim]`, bản ticket F — CEO 26/11 "align lại" + ô chọn luôn hiện như Twenty): ô
 * chọn nằm TRONG mép nội dung, mép trái ô tick thẳng tiêu đề trang (cặp `:has` → đè được lớp lùi ở trên).
 */

/** `.b-bang-khung`: tự cuộn hai chiều (header sticky dính trong khung), thanh cuộn ẩn — vẫn cuộn bằng chuột/phím. */
export const tableWrap = cn(
  kv,
  'relative w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:-ml-9',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:w-[calc(100%+36px)]',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:has-[>table>thead>tr>th[data-ghim]]:ml-0',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:has-[>table>thead>tr>th[data-ghim]]:w-full',
)
/** `table-container` của shadcn (`Table` đứng ngoài `TableWrap`): cuộn ngang, thanh cuộn ẩn như `TableWrap`. */
export const tableContainer = cn(
  kv,
  'relative w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:-ml-9',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:w-[calc(100%+36px)]',
)
/** `.ui-table-wrap`: viền 1px border, bo radius-xl, nền card (khối trạng thái của preview). */
export const tableWrapVien = cn(
  'border border-solid border-(--border) rounded-(--radius-xl) bg-card',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:ml-0',
  'md:has-[>table>thead>tr>th:first-child>input[type=checkbox]]:w-full',
)

/** `.b-bang`: 100%, viền tách 0, chữ 14 (line-height kế thừa 20 của DsRoot). */
export const table = cn(kv, 'w-full caption-bottom border-separate border-spacing-0 text-[14px]')
/** `.b-bang-c`. */
export const tableFixed = 'table-fixed'

/**
 * Ô tick là con TRỰC TIẾP của `th`/`td` (ô chọn dòng / chọn tất cả: Checkbox DS hoặc `<input type=checkbox>` của bang/ —
 * cả hai cùng `relative top-px inline-grid` như `.ui-checkbox`): bỏ `top` + thành lưới khối → `vertical-align: middle` của ô căn TÂM ô tick đúng tâm dòng. Bản inline nằm trên baseline, cộng
 * `top: 1px` của Checkbox (cần cho nhãn chữ ChoiceLabel) → thấp hơn chữ cùng dòng 2–3px (đo 22/11, artifact `.b-bang`
 * cũng lệch 2–2,6px). Thay cho `translate-y-[2px]` của shadcn. Ô tick trong nhóm flex (NotificationMatrix) chỉ bỏ độ dời top.
 */
export const oTick =
  '[&>[role=checkbox]]:top-0 [&>[role=checkbox]]:grid [&>input[type=checkbox]]:top-0 [&>input[type=checkbox]]:grid'

/** `.b-bang th`: dính đầu, z 2, cao 36, đệm ngang 10, nền background, kẻ dưới alpha-08, chữ 12/18 400 muted, trái. */
export const th = cn(
  'sticky top-0 z-2 h-(--control-size-lg) px-2.5 bg-background',
  // Chỉ cạnh dưới: kiểu none·none·solid (cạnh khác không vẽ, giữ currentColor như nguồn) — không dùng border-solid chung.
  'border-0 border-b [border-style:none_none_solid] border-current border-b-(--alpha-08)',
  // Bảng có cột GHIM (bản ticket F — CEO 26/11 "thử thêm một line ngăn cách ở trên hàng label, dưới phần tab"): kẻ
  // TRÊN hàng tiêu đề cùng màu kẻ dưới. Thử nghiệm — chưa áp cho bảng khác.
  '[table:has(>thead>tr>th[data-ghim])_&]:border-t [table:has(>thead>tr>th[data-ghim])_&]:[border-top-style:solid] [table:has(>thead>tr>th[data-ghim])_&]:border-t-(--alpha-08)',
  'text-left align-middle text-[12px] leading-[18px] font-normal text-muted-foreground whitespace-nowrap',
  // `.b-bang-c th`: đệm ngang 6.
  'in-data-[layout=fixed]:px-1.5',
  oTick,
)
/** `.b-bang td`: cao 44, đệm ngang 10, kẻ dưới alpha-05, không xuống dòng, tối đa 280 (`.b-bang-c`: đệm 6, không trần, cắt). */
/** Hàng nháp của `DongThem` (CEO 25/11 "ra hẳn một hàng trống"): ô nền đang gõ alpha-05 (như nền rê dòng). */
// `!`: ô thân Bảng tự mang nền (alpha-02) đè lớp của dòng. Ô đầu = cột chọn ở lề ngoài bảng → trong suốt như dòng thường.
export const hangNhap = '[&>td:not(:first-child)]:bg-(--alpha-05)! [&>td:first-child]:bg-transparent! [&>td:first-child]:border-b-transparent'

export const td = cn(
  'h-(--control-size-2xl) px-2.5 max-w-[280px] align-middle whitespace-nowrap',
  'border-0 border-b [border-style:none_none_solid] border-current border-b-(--alpha-05)',
  'in-data-[layout=fixed]:px-1.5 in-data-[layout=fixed]:max-w-none in-data-[layout=fixed]:overflow-hidden',
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

/**
 * `.b-cot-chon`: ô chọn rộng 36, đệm trái 16. Từ md cột nằm ở lề ngoài bảng (xem khung cuộn ở đầu file): đệm trái 10,
 * không kẻ; ô thân không nền hover/chọn — dòng sáng chỉ trong phần bảng.
 */
export const cotChon =
  'w-9 min-w-9 pl-4! md:pl-2.5! md:pr-0 md:border-b-transparent'
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
  'flex w-full min-w-0 items-center gap-1 h-(--control-size-lg) m-0 p-0 rounded-none bg-transparent',
  'font-[inherit] text-inherit whitespace-nowrap cursor-[inherit] [outline:none]',
  'hover:text-foreground aria-expanded:text-foreground data-on:text-foreground data-on:font-medium',
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(--ring)',
  '[&_svg]:size-3 [&_svg]:shrink-0',
  // `.b-th-an`: mũi tên mở menu ẩn, hiện 50% khi rê ô.
  '[&_[data-an]]:opacity-0 in-[th:hover]:[&_[data-an]]:opacity-50 in-[[role=columnheader]:hover]:[&_[data-an]]:opacity-50',
)
/** Cột căn phải: chữ dồn phải trong nút phủ kín ô. */
export const thSortPhai = 'justify-end'
/** `.b-th-loc`: phễu + số giá trị đang lọc, 12/18 color-text-info tabular, icon 11. */
export const thLoc = cn(
  kv,
  'inline-flex items-center gap-px text-[12px] leading-[18px] text-(--color-text-info) tabular-nums [&_svg]:size-[11px]!',
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

/** Ô chọn dòng của bang/ (`OChonTatCa` / `OChonDong` / `OChonO`) theo khung `.b-bang` — bơm qua `CauHinhBangDs giaoDien`. */
export const CHON_BANG: Partial<GiaoDienBang> = {
  chon_oTh: cn(th, cotChon, anChoReDau),
  // Ô thân trong suốt ở lề (md+): nền rê/chọn chỉ trong phần bảng. Ô tiêu đề GIỮ nền — dính đầu, che ô tick khi cuộn.
  chon_oTd: cn(td, cotChon, anChoRe, 'md:bg-transparent!'),
  // Dòng ListView (relative): từ md ô chọn nằm ở LỀ trái ngoài dòng như cột chọn của Bảng (mép phải ô tick cách mép nội
  // dung 10 = lề âm −8 của danh sách + 2) — tên việc thẳng mép, không bị ô tick xô vào (CEO 25/11).
  chon_oO: cn('inline-flex', anChoReO, 'md:absolute md:right-full md:top-1/2 md:mr-2.5 md:-translate-y-1/2 [&>input]:top-0'),
}
/**
 * Như `CHON_BANG` cho bảng có cột GHIM (`oGhim`): cột ô chọn cũng dính trái (không thì ô đang cuộn lộ ra ở 36px lề trái,
 * dưới cột ghim). Ô thân đục: dưới md nền + màu trạng thái dòng; từ md (cột chọn ở lề ngoài bảng) chỉ nền trang, không
 * màu dòng — như `md:bg-transparent` của `CHON_BANG` nhưng che được ô cuộn. Tiêu đề z 30: trên mọi tiêu đề `TieuDeCot`.
 * Ô chọn LUÔN HIỆN (như Twenty — CEO 26/11 "cho hiện sẵn checkbox cũng được"), không ẩn chờ rê như `CHON_BANG`; kẻ
 * ngang chạy suốt tới ô chọn (CEO 26/11 "cho đường line kéo dài tới checkbox luôn") thay vì trong suốt ở lề; nền dòng
 * (rê/chọn, `--nen-dong`) cũng phủ ô chọn (CEO 26/11 "nền xanh phải phủ dưới checkbox luôn").
 */
export const CHON_BANG_GHIM: Partial<GiaoDienBang> = {
  ...CHON_BANG,
  // Ô chọn trong mép nội dung (xem `tableWrap`): kẻ ngang bắt đầu ở mép tiêu đề trang, ô tick THỤT vào 8 như Twenty —
  // CEO 26/11 "checkbox phải thụt vào, không align bằng line" + "cho bằng với chữ trong chip": mép ô tick = mép chữ tab
  // pill đầu (hàng tab lùi ra 4 `dvTabs`, đệm tab 12 → chữ ở +8 so mép nội dung).
  chon_oTh: cn(th, cotChon, 'md:pl-2! md:border-b-(--alpha-08) left-0 z-30'),
  chon_oTd: cn(td, cotChon, 'md:pl-2! md:border-b-(--alpha-05) sticky left-0 z-1', nenDuc),
}

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
