/**
 * Kiểu dialog dùng chung (Dialog, AlertDialog/ConfirmDialog, Sheet) — chép từ khối "Dialog / Sheet" (`.ui-overlay`,
 * `.ui-dialog*`) và "ConfirmDialog: <dialog class="ui-dialog">" của ds/nguon/bundle.css. Chỉ là chuỗi class.
 * `border-none border-current` ở mọi phần: div/h2/p ăn preflight `0 solid var(--border)` của app; artifact không viền.
 *
 * z-70: artifact mở hộp bằng `<dialog>.showModal()` → top layer, trên MỌI lớp trang (cao nhất trong bundle.css là 60:
 * `.pD-icon` tip, `.b-caidat` sheet đáy). DS không dùng top layer (Radix Portal) → chọn 70: trên mọi lớp trang, DƯỚI
 * tooltip (80) và menu (90) — hai thứ đó mở được BÊN TRONG hộp nên phải nổi trên nó.
 * Mốc ≤640: `[@media(max-width:640px)]` y `@media (max-width: 640px)` của bundle (`max-[640px]:` của Tailwind là
 * `width < 640px`, lệch đúng 640).
 */

/** `.ui-overlay` / `dialog.ui-dialog::backdrop`: phủ kín, đen 30% (tối 50% — --modal-backdrop-background). */
export const overlay =
  'fixed inset-0 z-70 border-none border-current bg-[rgb(0_0_0/0.3)] in-data-[theme=dark]:bg-[rgb(0_0_0/0.5)]'

/**
 * `.ui-dialog` + `dialog.ui-dialog`: giữa khung nhìn (fixed, inset 0, margin auto, cao vừa nội dung, tối đa 100dvh − 32
 * rồi cuộn), rộng 100% trong 250–450, padding --dialog-padding (20), bo --radius-2xl (16 — GWT chọn), nền popover,
 * shadow + hairline. ≤640: rộng 100% − 32 (lề 16 mỗi bên), bỏ trần 450.
 * Hiện: `ui-dialog-len` 160ms cubic-bezier(0.19, 1, 0.22, 1) từ opacity 0, translateY(4px) scale(0.98) — viết bằng
 * transition + @starting-style (`starting:`) thay keyframes, cùng đường cong/thời lượng; tắt khi giảm chuyển động.
 */
export const panel = [
  'fixed inset-0 z-70 m-auto h-fit max-h-[calc(100dvh-32px)] overflow-y-auto',
  'w-full min-w-[250px] max-w-[450px]',
  '[@media(max-width:640px)]:w-[calc(100%-32px)] [@media(max-width:640px)]:max-w-none',
  'p-(--dialog-padding) rounded-(--radius-2xl) border-none border-current outline-none',
  'bg-popover text-popover-foreground [box-shadow:var(--shadow),var(--shadow-hairline)]',
  'transition-[opacity,translate,scale] duration-160 ease-[cubic-bezier(0.19,1,0.22,1)]',
  'starting:opacity-0 starting:translate-y-1 starting:scale-[0.98] motion-reduce:transition-none',
].join(' ')

/** `.ui-dialog-title`: 18/26 600 (heading-sm), margin 0. Thuộc tính lẻ, không shorthand `font:` (giữ cv11/ss03). */
export const title = 'm-0 border-none border-current text-[18px] leading-[26px] font-semibold'

/** `.ui-dialog-desc`: cách tiêu đề 4, 14/20, muted-foreground. */
export const desc = 'mt-1 mb-0 border-none border-current text-[14px] leading-[20px] text-muted-foreground'

/** `.ui-dialog-body`: cách phần trên 16. */
export const body = 'mt-4 border-none border-current'

/**
 * `.ui-dialog-footer`: cách thân 20, căn phải, gap 8. ≤640: xếp dọc đảo thứ tự (nút chính — đặt cuối trong DOM — lên
 * trên) và mỗi nút rộng hết (`> .ui-btn { width: 100% }`), dễ bấm bằng ngón cái.
 */
export const footer = [
  'mt-5 flex justify-end gap-2 border-none border-current',
  '[@media(max-width:640px)]:flex-col-reverse [@media(max-width:640px)]:[&>[data-slot=button]]:w-full',
].join(' ')

/** `.ui-dialog-close`: nút ✕ góc trên phải cách 12 (gắn lên `Button` ghost icon-sm; `absolute` đè `relative` của nút). */
export const closeBtn = 'absolute top-3 right-3'
