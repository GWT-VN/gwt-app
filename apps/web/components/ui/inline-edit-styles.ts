/**
 * Kiểu + hằng của InlineEdit / RecordPicker — chép từ khối `.b-osua*`, `.b-noi-kh`, `.b-kh-*`, `.b-nguoi`, `.b-khach`,
 * `.b-luuy` của ds/nguon/bundle.css (bản 40). File thường (không 'use client') → server component dùng được.
 * Px trần chỉ ở chỗ bundle.css gõ đúng số đó. `border-none border-current`: span/div/button ăn preflight `0 solid
 * var(--border)` của app; nguồn không viền.
 */

/** Lý do chờ khi ô trạng thái chọn "Chờ" (README InlineEdit / prototype `LY_DO_CHO`). */
export const LY_DO_CHO = ['khách', 'KT', 'vật tư', 'hãng', 'duyệt'] as const

/** `.b-loc-o.b-osua-wrap`: neo của ô, co theo ô cha. */
export const oSuaWrap = 'relative inline-flex max-w-full border-none border-current'

/**
 * `.b-osua` — ô chữ / người / hạn / khách: nút trơn tràn lề −6 (chữ thẳng mép cột), đệm 2 22 2 6, cao tối thiểu 30,
 * bo radius-md; rê hoặc đang mở → nền alpha-05 (MỘT lớp, không nền lồng nền). Mũi tên ▾ 12px ở phải hiện khi rê / mở /
 * focus phím (`oSuaMui`). Focus phím: vòng 2px ring (nguồn không khai — để vòng mặc định trình duyệt là lệch DS).
 */
export const oSua = [
  // Trần rộng = 100% + 12: lề âm −6 hai bên làm hộp viền rộng hơn hộp lề 12px; bundle.css để max-width 100% → trong
  // khung co theo nội dung (neo inline-flex) ô bị cắt … 12px dù còn chỗ (đo 20/11: "Kiều Trang" còn "Kiều Tr…").
  'group/osua relative inline-flex items-center gap-1.5 max-w-[calc(100%+12px)] min-h-[30px] -mx-1.5 py-0.5 pl-1.5 pr-[22px]',
  'border-none border-current rounded-(--radius-md) bg-transparent text-inherit [font:inherit] text-left cursor-pointer',
  'hover:bg-(--alpha-05) aria-expanded:bg-(--alpha-05)',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
].join(' ')

/**
 * `.b-osua[data-an-mui]` — ô nhãn / avatar: không đệm, không nền ô, không mũi tên ngoài (bo tròn để vòng focus ôm nhãn).
 * Rê / mở → viền 2px alpha-08 trên CHÍNH nhãn; nhãn viền (Badge outline) → viền trong 1px alpha-25 + nền alpha-04
 * (bundle.css gõ alpha-25; README ghi alpha-20 — bundle.css thắng). Chuyển 120ms như nguồn. Nhãn nằm trong một span
 * `display: contents` (mang id cho aria-describedby) → trong DOM là CHÁU của nút (biến thể hai sao), trong bố cục là con.
 */
export const oSuaNhan = [
  'group/osua relative inline-flex items-center gap-1.5 max-w-full m-0 p-0 min-h-0',
  'border-none border-current rounded-(--radius-full) bg-transparent text-inherit [font:inherit] text-left cursor-pointer',
  '*:*:shrink-0 *:*:transition-[box-shadow,background-color] *:*:duration-[120ms] *:*:ease-[ease]',
  'hover:*:*:[box-shadow:0_0_0_2px_var(--alpha-08)] aria-expanded:*:*:[box-shadow:0_0_0_2px_var(--alpha-08)]',
  'hover:[&>*>[data-variant=outline]]:[box-shadow:inset_0_0_0_1px_var(--alpha-25)] hover:[&>*>[data-variant=outline]]:bg-(--alpha-04)',
  'aria-expanded:[&>*>[data-variant=outline]]:[box-shadow:inset_0_0_0_1px_var(--alpha-25)] aria-expanded:[&>*>[data-variant=outline]]:bg-(--alpha-04)',
  '[outline:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
].join(' ')

/** `.b-osua-mui`: ▾ / bút 12px, tuyệt đối phải 6, màu tertiary, ẩn tới khi rê / mở / focus phím. */
export const oSuaMui = [
  'absolute right-1.5 size-3 shrink-0 text-(--color-text-tertiary) opacity-0',
  'group-hover/osua:opacity-100 group-aria-expanded/osua:opacity-100 group-focus-visible/osua:opacity-100',
].join(' ')

/** `.b-osua-chu`: ô chữ trọn bề ngang ô, tối đa 280 (bundle.css gõ 280px). */
export const oSuaChu = 'w-full max-w-[280px]'

/** `.b-osua-input`: ô nhập tại chỗ cao 30, rộng tối thiểu 240 (bundle.css gõ hai số này). Ghép sau Input qua cn(). */
export const oSuaInput = 'h-[30px] min-w-[240px]'

/** `.b-cat`: cắt … một dòng. */
export const cat = 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'

/** `.b-nguoi`: avatar + tên cách 8, một dòng. */
export const nguoi = 'inline-flex min-w-0 items-center gap-2 whitespace-nowrap'

/**
 * Nút "+ Thêm …" của danh sách giá trị (PropertyList, form): Button ghost xs, chữ tertiary — rê / mở mới sáng; lề âm =
 * đúng đệm trái size xs → icon thẳng cột giá trị (nền rê tràn trái, kiểu Linear). CEO 23/11, dùng chung từ 25/11.
 */
export const nutThem = '-ml-[calc(var(--control-gutter-xs)*1.33)] text-(--color-text-tertiary) aria-expanded:text-accent-foreground'

/** `.b-khach`: tên + cờ lưu ý cách 6. `.b-luuy`: cờ đỏ 15px (bundle.css gõ 15px). */
export const khach = 'inline-flex min-w-0 items-center gap-1.5'
export const luuY = 'inline-flex shrink-0 items-center text-(--color-text-danger) [&>svg]:size-[15px]'

/** `.b-chip-phu`: phần "· lý do" trong chip trạng thái — chữ 400, mờ 80%. */
export const chipPhu = 'font-normal opacity-80'

/**
 * Khung pop RecordPicker (`.ui-menu.b-noi.b-noi-kh`): rộng 400 (tối đa 100vw − 32), không trần cao / không cuộn ở khung
 * (danh sách bên trong tự cuộn — chân "Tạo mới" luôn thấy), đệm đáy 6. Ghép SAU menuContent qua cn().
 */
export const recordPickerKhung = 'w-[400px] max-w-[calc(100vw-32px)] max-h-none overflow-visible pb-1.5'

/** `.b-kh-dem` (+ `.ui-menu-label`): dòng đếm — 12/18 muted, 500, đệm trên 2. */
export const recordPickerDem = 'px-2 pt-0.5 pb-1.5 border-none border-current text-[12px] leading-[18px] font-medium text-muted-foreground'

/** `.b-kh-ds`: danh sách cao tối đa 340 (bundle.css gõ 340px), cuộn, tràn mép menu rồi đệm lại (vòng focus không bị cắt). */
export const recordPickerDs =
  'max-h-[340px] overflow-y-auto -mx-(--menu-gutter) px-(--menu-gutter) border-none border-current outline-none'

/**
 * `.b-kh-muc` (+ `.ui-menu-item`): mục 3 dòng — cột, giãn ngang, cách dòng 1, đệm dọc 7. Mục đang chọn nền alpha-04
 * (`.b-kh-muc[aria-selected]` — ở DS là `data-checked`, vì cmdk dùng `aria-selected` cho mục đang sáng). Ghép sau menuItem.
 */
export const recordPickerMuc = 'flex-col items-stretch gap-px h-auto py-[7px] data-checked:bg-(--alpha-04)'

/** `.b-kh-dong1`: tên + cờ + ghi chú phải. */
export const recordPickerDong1 = 'flex min-w-0 items-center gap-1.5'
/** `.b-kh-ten`: 500. */
export const recordPickerTen = 'font-medium'
/** `.b-kh-luuy`: cờ đỏ 14 (control-icon-size-xs). */
export const recordPickerLuuY = 'size-(--control-icon-size-xs) shrink-0 text-(--color-text-danger)'
/** `.b-kh-mo`: ghi chú phải — 12, tertiary, số thẳng cột. */
export const recordPickerPhai = 'ml-auto shrink-0 text-[12px] text-(--color-text-tertiary) tabular-nums'
/** `.b-kh-dong1 .b-tick`: ✓ 14 sát ghi chú (lề trái 0). */
export const recordPickerTick = 'size-(--control-icon-size-xs) shrink-0 text-foreground'
/** `.b-kh-dong2`: dòng 2–3 — 12/18 muted. */
export const recordPickerDong2 = 'text-[12px] leading-[18px] text-muted-foreground'
/** `.b-kh-rong`: không khớp — đệm 16 8, 12/18 tertiary. */
export const recordPickerRong = 'px-2 py-4 text-[12px] leading-[18px] text-(--color-text-tertiary)'
