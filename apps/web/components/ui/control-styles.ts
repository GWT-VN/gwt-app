import { cn } from '@/lib/utils'

/**
 * Viền ô nhập dùng chung (Input, Textarea, InputGroup, Select, NativeSelect, InputOTP, DatePicker…) — chép từ khối `.ui-input` / `.ui-textarea` /
 * `.ui-select-trigger` / `.ui-input-affix` của ds/nguon/bundle.css ("Label / Input / Textarea (OpenAI Input.module.css)").
 * Chỉ là chuỗi class: component tự gắn vào phần tử của nó.
 *
 * - Viền = box-shadow inset 1px (không border → không đổi kích thước hộp), viết bằng thuộc tính tuỳ biến box-shadow,
 *   không dùng utility shadow của Tailwind: nó ghép 5 lớp bóng → computed khác artifact (cùng cách Button outline).
 * - Màu đổi theo theme qua biến cục bộ: `--ctl-hover` alpha-25 (tối alpha-30), `--ctl-invalid` red-500 (tối red-600).
 * - Thứ tự ưu tiên (thứ tự biến thể Tailwind 4: hover < focus-visible < enabled/disabled < aria-*): tắt > lỗi > focus
 *   > hover > thường. Lỗi gắn `enabled:` → không tranh với tắt (hai trạng thái loại trừ nhau). Cùng thứ tự ở cả hai
 *   theme — artifact bản 38 đã sửa theo (trước đó rule hover tối của bundle.css thắng tắt/focus).
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
 * color-text-tertiary. Chữ ghim 400 (bundle gõ `font: 400 14px/20px`) — Select trigger tự đè 500 ở chỗ của nó.
 * `enabled:`/`disabled:` chỉ ăn trên phần tử form (input/textarea/button/select): trigger của Select/Combobox/DatePicker
 * phải là `<button>`, không dùng div role=combobox (div không bao giờ :disabled → tắt không hiện).
 */
export const controlOutline = [
  'w-full min-w-0 h-(--control-size-md) px-(--control-gutter-md) rounded-(--radius-md)',
  'border-none border-current bg-transparent [outline:none]',
  'text-[14px] leading-[20px] font-normal text-(--color-text) placeholder:text-(--color-text-tertiary)',
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
 * Lỗi/tắt chỉ xét ô `input`/`textarea` là CON TRỰC TIẾP (như bundle: has con trực tiếp `.ui-input`) — nút phụ bị tắt
 * lồng trong khung (vd nút xoá) không làm cả khung thành "tắt". `:is(input,textarea)` giữ đặc hiệu bằng thẻ đơn như
 * trước khi thêm `InputGroupTextarea` (shadcn) → thứ tự trạng thái không đổi.
 */
export const controlOutlineWithin = [
  'flex w-full min-w-0 items-center h-(--control-size-md) px-(--control-gutter-md) rounded-(--radius-md)',
  'border-none border-current bg-transparent cursor-text',
  'text-[14px] leading-[20px] text-(--color-text)',
  'transition-[box-shadow,background-color] duration-150 ease-[ease]',
  ...vienTheoTheme,
  '[box-shadow:inset_0_0_0_1px_var(--input)]',
  // Hover chỉ áp cho khung ở trạng thái THƯỜNG — loại hẳn focus, lỗi, tắt bằng not-* thay vì trông vào thứ tự/đặc hiệu:
  // Tailwind 4 xếp focus-within TRƯỚC hover, và mỗi lớp :not() cộng đặc hiệu nên hover sẽ thắng has tắt (0,3,0 > 0,2,0).
  // Đo ở so khớp InputAffix 20/11 (lần đo đầu của biến này): bản cũ chỉ có not-focus-within → khung TẮT vẫn đậm viền khi rê.
  'hover:not-focus-within:not-has-[>:is(input,textarea):disabled]:not-has-[>:is(input,textarea)[aria-invalid=true]]:[box-shadow:inset_0_0_0_1px_var(--ctl-hover)]',
  'focus-within:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
  'has-[>:is(input,textarea)[aria-invalid=true]:enabled]:[box-shadow:inset_0_0_0_1px_var(--ctl-invalid)]',
  'has-[>:is(input,textarea):disabled]:cursor-not-allowed has-[>:is(input,textarea):disabled]:bg-(--color-background-disabled)',
  'has-[>:is(input,textarea):disabled]:[box-shadow:inset_0_0_0_1px_var(--color-border-disabled)]',
].join(' ')

/**
 * `.ui-select-trigger` — chuỗi class xuất ra để Combobox / DatePicker / DateRangePicker dùng lại trên nút của chúng.
 * Nút dùng lại tự gắn: `data-placeholder` khi chưa có giá trị, span chữ mang `data-slot="select-value"` + `selectValue`,
 * `aria-expanded` khi mở (viền alpha-50), icon là `<svg>` con trực tiếp (16, muted-foreground).
 * Thứ tự (biến thể Tailwind 4 xếp aria-* trước data-*): đang mở KHÔNG đè lỗi (`not-aria-invalid`) — y bundle.css, nơi
 * `[aria-invalid]` khai sau `[aria-expanded]` cùng đặc hiệu; tắt thì không mở được.
 * GỘP SẴN qua `cn` một lần ở cấp module: `controlOutline` mang `font-normal` (ô nhập 400), trigger cần `font-medium` —
 * nối chuỗi thô thì cả hai cùng có mặt và CSS biên dịch cho 400 thắng (cùng đặc hiệu, normal xếp sau medium). Nút dùng lại
 * gắn thô `className={selectTrigger}` vẫn ra 500 (lỗi đã bắt thật ở Combobox, DatePicker).
 */
export const selectTrigger = cn(
  controlOutline,
  'inline-flex items-center justify-between gap-2 font-medium cursor-pointer text-left',
  'aria-expanded:not-aria-invalid:[box-shadow:inset_0_0_0_1px_var(--alpha-50)]',
  '[&[data-placeholder]_[data-slot=select-value]]:font-normal',
  '[&[data-placeholder]_[data-slot=select-value]]:text-(--color-text-tertiary)',
  '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
)

/**
 * `size` của shadcn (SelectTrigger, NativeSelect): `data-size="sm"` → cao --control-size-sm 28, lề --control-gutter-sm 10
 * (artifact chỉ có cỡ md; sm lấy nấc kế dưới của thang control). `default` = số của `controlOutline`.
 */
export const selectTriggerSize = 'data-[size=sm]:h-(--control-size-sm) data-[size=sm]:px-(--control-gutter-sm)'

/** `.ui-select-value`: một dòng, cắt bằng dấu ba chấm. */
export const selectValue = 'min-w-0 truncate border-none border-current'
