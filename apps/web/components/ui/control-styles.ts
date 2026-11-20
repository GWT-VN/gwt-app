/**
 * Viền ô nhập dùng chung (Input, Textarea, InputAffix, Select, DatePicker…) — chép từ khối `.ui-input` / `.ui-textarea` /
 * `.ui-select-trigger` / `.ui-input-affix` của ds/nguon/bundle.css ("Label / Input / Textarea (OpenAI Input.module.css)").
 * Chỉ là chuỗi class: component tự gắn vào phần tử của nó.
 *
 * - Viền = box-shadow inset 1px (không border → không đổi kích thước hộp), viết bằng thuộc tính tuỳ biến box-shadow,
 *   không dùng utility shadow của Tailwind: nó ghép 5 lớp bóng → computed khác artifact (cùng cách Button outline).
 * - Màu đổi theo theme qua biến cục bộ: `--ctl-hover` alpha-25 (tối alpha-30), `--ctl-invalid` red-500 (tối red-600).
 * - Thứ tự ưu tiên (thứ tự biến thể Tailwind 4: hover < focus-visible < enabled/disabled < aria-*): tắt > lỗi > focus
 *   > hover > thường. Lỗi gắn `enabled:` → không tranh với tắt (hai trạng thái loại trừ nhau). Khác bundle.css ở một
 *   ca không có trong preview: theme tối, rê chuột lên ô ĐANG focus — bundle ra alpha-30 (rule tối đặc hiệu cao hơn
 *   :focus), ở đây giữ alpha-50 (focus thắng hover như theme sáng).
 * - `[outline:none]` (shorthand, không phải `outline-none`): reset cả màu outline UA `:focus-visible` như `outline: none`
 *   của bundle.css → computed outline khớp.
 * - Font kế thừa DsRoot (preflight `font: inherit`), không reset font-feature-settings (luật NGUON).
 */
const vienTheoTheme = [
  '[--ctl-hover:var(--alpha-25)] in-data-[theme=dark]:[--ctl-hover:var(--alpha-30)]',
  '[--ctl-invalid:var(--red-500)] in-data-[theme=dark]:[--ctl-invalid:var(--red-600)]',
]

/**
 * Phần tử TỰ mang viền (input, textarea, nút trigger của Select/DatePicker). `.ui-input`: rộng 100%, cao
 * --control-size-md 32, padding 0 --control-gutter-md 12, bo --radius-md 8, chữ 14/20 color-text, nền trong suốt.
 * Hover viền alpha-25 (tối 30) · focus-visible alpha-50, không quầng · aria-invalid red-500 (tối 600) · disabled nền
 * color-background-disabled + viền color-border-disabled + chữ color-text-disabled + not-allowed · placeholder
 * color-text-tertiary.
 */
export const controlOutline = [
  'w-full min-w-0 h-(--control-size-md) px-(--control-gutter-md) rounded-(--radius-md)',
  'border-none border-current bg-transparent [outline:none]',
  'text-[14px] leading-[20px] text-(--color-text) placeholder:text-(--color-text-tertiary)',
  'transition-[box-shadow,background-color,color] duration-150 ease-[ease]',
  ...vienTheoTheme,
  '[box-shadow:inset_0_0_0_1px_var(--input)]',
  'hover:[box-shadow:inset_0_0_0_1px_var(--ctl-hover)]',
  'focus-visible:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
  'enabled:aria-invalid:[box-shadow:inset_0_0_0_1px_var(--ctl-invalid)]',
  'disabled:cursor-not-allowed disabled:bg-(--color-background-disabled) disabled:text-(--color-text-disabled)',
  'disabled:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
].join(' ')

/**
 * KHUNG bọc một ô không viền (InputAffix: ô số + đơn vị). Cùng số đo như `controlOutline` nhưng trạng thái đọc từ con
 * (y `.ui-input-affix`): hover theo hover của khung, focus theo focus-within, lỗi khi có con aria-invalid đang bật,
 * tắt khi có con disabled (nền + viền tắt, not-allowed). Con trỏ chữ (`cursor-text`)
 * như bundle.css. Khoảng cách giữa con (gap) do component tự thêm.
 */
export const controlOutlineWithin = [
  'flex w-full min-w-0 items-center h-(--control-size-md) px-(--control-gutter-md) rounded-(--radius-md)',
  'border-none border-current bg-transparent cursor-text',
  'text-[14px] leading-[20px] text-(--color-text)',
  'transition-[box-shadow,background-color] duration-150 ease-[ease]',
  ...vienTheoTheme,
  '[box-shadow:inset_0_0_0_1px_var(--input)]',
  // Tailwind 4 xếp focus-within TRƯỚC hover → hover gắn not-focus-within để khung đang focus giữ alpha-50 khi rê chuột.
  'hover:not-focus-within:[box-shadow:inset_0_0_0_1px_var(--ctl-hover)]',
  'focus-within:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
  'has-[[aria-invalid=true]:enabled]:[box-shadow:inset_0_0_0_1px_var(--ctl-invalid)]',
  'has-disabled:cursor-not-allowed has-disabled:bg-(--color-background-disabled)',
  'has-disabled:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
].join(' ')
