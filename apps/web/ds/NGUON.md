# Nguồn token DS v2

Artifact **"GWT — OpenAI + shadcn"**, **bản 26** — https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr

File trong `nguon/` chép **nguyên byte** từ artifact bản 26; riêng `bundle.css` lấy **bản 37** (20/11; bản 36 chỉ đổi index; bản 29 của 19/11 đã thêm `font-feature-settings: inherit` vào 20 rule shorthand `font:`, CEO chốt), 10 `preview.html` của lát 2 lấy **bản 31** (19/11) trừ Tooltip và ContextMenu lấy **bản 33** (20/11). Chép bằng `cp` — không qua Python/Node chế độ chữ vốn đổi LF → CRLF trên Windows; sha256 đo trước và sau khi chép trùng nhau, file LF. Không sửa tay.

Bản 33–34 đồng bộ ngược 5 điểm từ code lát 2 vào artifact: tooltip line-height 16 (cả tooltip sidebar); mục menu disabled ở theme tối không sáng nền khi trỏ; aria-label của preview Tooltip không lặp `data-tip`; icon ContextMenu 16px màu muted; `.b-noi .ui-menu-item` khớp menu-styles.

Bản 35 (CEO chốt 20/11, "theo đề xuất"): chữ `.ui-avatar` `gray-600` → `muted-foreground` (đạt AA cả hai theme trên
`alpha-08`: sáng 5.57:1, tối 5.81:1 — `gray-600` tối chỉ 3.94:1); `.ui-dialog-close` top/right 12 → 19 (tâm ✕ thẳng tâm
dòng tiêu đề: padding 20 + (26 − 28) / 2; dùng chung Dialog + Sheet); `@media (max-width: 640px) { .ui-sheet { width: 100% } }`
(artifact khớp code, bỏ 7 `lyDo` width@390 ở `so-khop/sheet.json`). Không preview.html nào đổi.

Bản 37 (CEO chốt 20/11, "làm luôn"): tiêu đề chừa lề phải cho ✕ (✕ chiếm 19–47px từ mép phải) —
`.ui-dialog:has(> .ui-dialog-close) .ui-dialog-title { padding-right: 36px }` (cần ≥ 47 − 20 + 8 = 35 → 36 = 9 × `--spacing`,
chữ cách ✕ 9px; chỉ hộp có ✕, ConfirmDialog/AlertDialog trọn bề ngang) và `.ui-sheet-header` phải 52 → 56 (52 chỉ còn 5px từ
bản 35). Code: `chuaNutDong` (`dialog-styles.ts`, gắn khi `showClose`) + header Sheet `pr-14`. README Dialog/Sheet thêm 1 dòng;
không preview.html nào đổi.

| File | sha256 |
|---|---|
| `nguon/tokens.json` | `a6dc379bf515623fac52bb8559e10ca5bc0e914fe105de80883383b67a75d221` |
| `nguon/tokens.css` | `45230c507af3efd5507f16e82a2911679fadf68b8ed2e5583e84d14f92bc44b5` |
| `nguon/bundle.css` (bản 37) | `2b9b6e28e1b1b7ff7f685de0c0a276675dadd16e9a9831c3617a089b87361899` |
| `nguon/components/Button/preview.html` | `177935133068d688891289c9b853d7a5cf847dcf34b5c0f4636a5e7b0486052c` |
| `nguon/components/Badge/preview.html` (bản 31) | `f58ca05c625e32fe41b9493f5e906ffdc81d25c51fc742087ada5a72f4ccc06c` |
| `nguon/components/Avatar/preview.html` (bản 31) | `1af306836e66a39a844904f9f90e09555ab94decca55a4b0852e176f4f900259` |
| `nguon/components/Kbd/preview.html` (bản 31) | `9a5fcaee5823786d85afef6f07afffcc9ce8d68989c34995e5abc607f2b14b3f` |
| `nguon/components/Alert/preview.html` (bản 31) | `22cce7f4fdce13943e52729d70092bce3c9cd319c390cda718ef4995897ce4ab` |
| `nguon/components/Tooltip/preview.html` (bản 33) | `46decec67c623e0895c84d3505ed9c93e58686c66ebecdda768a97c8c40f2427` |
| `nguon/components/DropdownMenu/preview.html` (bản 31) | `6afae375e5581ea6e7df670a84fbc9e070d6a23db4103d07f7a6ec6ceab45a45` |
| `nguon/components/ContextMenu/preview.html` (bản 33) | `135fe520b997456b6deb7fab94069c4d2ccbc8b784e1b1d30cbb4b118b46ac3b` |
| `nguon/components/Dialog/preview.html` (bản 31) | `727c5eba30eb50a884300e4337a6b32d1b39b418505e58bb01f6c41bcfe8b2b7` |
| `nguon/components/ConfirmDialog/preview.html` (bản 31) | `4a13f54f975888e58984a84209e7bd65bcae842af2df36ba589025f3972fd7ec` |
| `nguon/components/Sheet/preview.html` (bản 31) | `421eac8dd26abecbc212a6beb5931a73a8403cceb5f290377eaa644d5d90a24f` |

`.gitattributes` trong thư mục này ép LF để sha256 trên khớp ở mọi máy (repo bật `core.autocrlf`).

**Thang Tailwind trong vùng DS:** trong `[data-ds="v2"]` DS khai lại `--radius-*` và `--spacing` → utility mặc định
`rounded-*` / `p-*`… của Tailwind ăn theo thang DS ở đó (vd `rounded-md` = 8px). Cố ý; ngoài vùng DS không đổi gì.

**Đã đo: màn cũ không đổi CSS ngoài vùng DS** (review cuối lát 1, 19/11). Cách đo: `git worktree add` tạm bản `f990707`
(trước lát 1) ra ngoài repo, nội dung quét = mã màn cũ của bản đó; biên dịch `app/globals.css` qua `@tailwindcss/postcss`
(`base` = thư mục đó, `optimize: false`) hai lần — CSS của `f990707` và CSS của lát 1 (`globals.css` + `ds/tokens.css` +
`ds/theme.css` chép đè; file `.css` không bị Tailwind quét nên nội dung giữ nguyên). Trải phẳng thành từng khai báo
(chuỗi @-rule › selector › thuộc tính: giá trị), bỏ selector chứa `data-ds`/`.ds-`, so tập. Kết quả: **mất 0, thêm 3** —
chỉ biến `@theme` ở `:root` (`--font-sans: var(--font-geist-sans)`, `--color-border: var(--border)`,
`--color-ring: var(--ring)`; Tailwind xuất vì `tokens.css` có `var(...)` tới chúng), và **0 khai báo ngoài vùng DS đọc
3 biến này**. Không utility mới nào sinh ra từ mã màn cũ (không màn cũ nào dùng `bg-primary`, `border-input`…). Đo lại
khi đổi `theme.css`/`globals.css`.

## Luật cho component lát 2

Gom từ review lát 1 — đọc trước khi dựng component mới trong `components/ui/`:

- **Font:** Inter đi kèm `DsRoot` (`components/ui/font-inter.ts`, biến `--font-inter` gắn trên chính phần tử gốc) → màn
  nào bọc `<DsRoot>` cũng có Inter; không nạp font ở layout.
- **font-feature-settings:** component **không bao giờ reset** (`cv11`/`ss03` kế thừa từ `DsRoot` — CEO chốt 19/11
  "bật cho đồng bộ"). Artifact bản 29 đã sửa theo: 20 rule dùng shorthand `font:` trong `bundle.css` thêm
  `font-feature-settings: inherit` → so khớp không còn lệch dòng này, không cần `lyDo`.
- **Viền:** Button base là `border-none` (khớp `.ui-btn{border:0}`) → cần viền thì thêm `border-solid`. Component khác
  đọc khối `.ui-*` của nó trong `bundle.css` trước khi chọn.
- **Thang trong vùng DS:** `rounded-*`/`p-*`/`gap-*` theo thang DS (mục trên). Nhưng `--breakpoint-*` khai trong vùng
  **không có tác dụng** — media query biên dịch lúc build từ `@theme` toàn app → `sm:`/`md:`… vẫn là mốc mặc định của
  Tailwind (vd `md` = 48rem), không phải 768px của DS (trùng số, khác `xs`/`sm`). Cần mốc DS thì viết `max-[576px]:`.
- **Không chạy `npx shadcn add` thẳng** (xem spec §5.3): chép tay từ registry, hoặc chạy rồi bỏ mọi thay đổi `globals.css`.
- **Portal:** mọi Radix Portal truyền `container={useDsPortal()}`; component đầu tiên dùng portal phải có bằng chứng mở
  thật trong vùng (spec §5.1).
- **Không lồng chéo với CSS cũ:** không đặt component cũ trong `<DsRoot>`, không đặt `<DsRoot>` trong
  `[data-khu="work"]`/`[data-khu="wiki"]` — trùng tên `--muted`/`--accent`/`--border`/`--shadow` (spec §5.1).
- **So khớp:** mỗi component có `so-khop/<c>.json` + chạy `node ds/so-khop.mjs <C>` thoát 0; trạng thái nào preview
  không có thì ghi vào `chuaDo` (in ra `<C>.md`), không để con số khớp tự nói "khớp hết".
- **Overlay trong so khớp:** khoá có `buoc` (bấm / chuột phải / rê / `tab` / phím / `cho`, CDP thật) mở overlay trên
  trang nạp lại mới trước khi đo; focus trong overlay đo bằng bước `{ "tab": sel }`, KHÔNG bằng `trangThai: focus`
  (config bị từ chối). Vùng DS **luôn kiểm** cho mọi phần tử bên DS (ngoài `[data-ds="v2"]` = lỗi, không lyDo nào miễn;
  `trongVung` cũ vẫn nhận, không tác dụng thêm). `pseudo` khi bên artifact vẽ bằng `::after` (tooltip). Ảnh overlay:
  `anhTuongTac.buoc` mở overlay ngay trước khi chụp + `khung.ds` dạng mảng (`["#<neo> > div", "[data-ds-portal] > *"]`)
  → ảnh DS có overlay đang mở cạnh preview. Cú pháp đầy đủ ở đầu `so-khop.mjs`.
- **Thang z (một chỗ duy nhất — component mới đọc ở đây, không tự chọn số):** bulkbar **55** (`.ui-bulkbar`) · toast
  **56** (`.ui-toast`) · tip thanh bên / sheet đáy điện thoại **60** (`.pD-icon` tip, `.b-caidat`) · dialog + overlay
  (Dialog, AlertDialog/ConfirmDialog, Sheet) **70** (`dialog-styles.ts`; artifact dùng top layer của `<dialog>` —
  trên mọi lớp trang) · tooltip **80** (`.ui-tip::after`) · menu **90** (`.b-noi`, `.b-chuotphai`). Tooltip/menu > dialog
  vì mở được BÊN TRONG hộp. **Toast (lát 5) phải < 70** như artifact (toast nằm dưới hộp đang mở): Sonner tự đặt
  z-index rất cao trên toaster (gói chưa cài — đo lại khi dựng) → ghi đè về 56, thêm khoá `zIndex` vào so khớp Toast.
- **Tooltip trên nút icon:** chữ tooltip là MÔ TẢ thêm, không lặp nguyên `aria-label` của nút — Radix gắn
  `aria-describedby` → trình đọc màn hình đọc hai lần (vd nút "Thao tác" + tooltip "Mở thao tác cho đơn").
- **Menu (DropdownMenu, ContextMenu — dùng `components/ui/menu-styles.ts`):** item `disabled` theo WAI-ARIA APG — vẫn
  hiện, vẫn focus được (↑/↓, gõ chữ đầu dừng ở nó), không kích hoạt; KHÔNG truyền `disabled` cho Radix (Radix loại khỏi
  bàn phím) mà dùng `itemDisabled()`. Lý do chặn ghi ngay trong chữ ("Chuyển kho (không có quyền)"). Nền sáng chỉ theo
  `data-highlighted` (một mục), không theo `:hover`. Menu chọn cột / tuỳ chọn nhiều: giữ menu mở khi tick
  (`onSelect={(e) => e.preventDefault()}` trên CheckboxItem). Khung menu có trần cao `min(420px, 100vh − 16px)` + cuộn
  bên trong (`.b-noi`, trong `menuContent`); ContextMenu chỉ đóng khi cuộn NGOÀI `[role=menu]`.
- **Tên prop:** primitive (khung shadcn/Radix: `Dialog*`, `Sheet*`, `DropdownMenu*`, `Button`…) giữ tên tiếng Anh của
  shadcn/Radix (`open`, `onOpenChange`, `variant`, `size`, `disabled`, `asChild`); component GHÉP nghiệp vụ của DS (vd
  `ConfirmDialog`) dùng tên tiếng Việt cho phần nghiệp vụ (`tieuDe`, `hauQua`, `nutXacNhan`, `onXacNhan`…). Riêng màu
  luôn là **`color`** (`Alert`, `Badge`, `ConfirmDialog` — không `mau`), giá trị theo tên token (`danger`…).
- **Focus trong overlay (Dialog, Sheet, AlertDialog/ConfirmDialog):**
  - *Focus ban đầu:* Dialog → nút AN TOÀN (Huỷ) mang `data-autofocus` (qua `onOpenAutoFocus` của Radix; `autoFocus` của
    React làm Radix bỏ qua `onOpenAutoFocus` → không dùng). Sheet → mặc định nút ✕ (phần tử focus được đầu tiên); màn
    cần ô lọc đầu nhận focus thì `data-autofocus` lên ô đó (hoặc `onOpenAutoFocus`). ConfirmDialog → `pha` thì nút Huỷ,
    không `pha` thì nút xác nhận; con mang `data-autofocus` (ô gõ mã) thắng cả hai.
  - *Trả focus khi đóng:* hook chung `components/ui/use-nut-mo.ts` (DialogContent/SheetContent/AlertDialogContent đã gắn
    sẵn — màn KHÔNG tự viết `onCloseAutoFocus`): về phần tử đã MỞ overlay, kể cả hộp điều khiển bằng `open` không có
    Trigger, hộp mount sẵn mở, hộp mở từ mục menu (về nút ⋯ / dòng đã mở menu — mục menu đã bị gỡ khỏi DOM). Phần tử đó
    đã mất → để Radix lo (Trigger nếu có), không bao giờ focus node chết.
  - *Sheet bộ lọc + form:* `<form id>` bọc THÂN (`SheetBody`), nút Áp dụng trong `SheetFooter` dùng thuộc tính
    `form="<id>"` — không bọc cả panel bằng form (header/footer là con trực tiếp của panel flex cột). Nút ✕ nằm cuối
    `SheetHeader` → mọi Sheet phải có `SheetHeader`.
- **Test hành vi (focus, Esc, bàn phím):** file `*.dom.test.tsx` mở đầu `// @vitest-environment jsdom` + Testing
  Library / user-event; polyfill Radix ở `vitest.setup-dom.ts` (chỉ chạy khi có `window`). Test còn lại vẫn môi trường node.
- **`/ds`:** mỗi component một file `app/ds/_khoi/khoi-<neo>.tsx` (`export function Khoi<Ten>()`, `<section id="<neo>"
  className="scroll-mt-6">` + `<h2>` link `#<neo>`), rồi gắn `Khoi` vào mục tương ứng trong mảng `KHOI` của
  `app/ds/page.tsx` (mục lục tự thành link; chưa gắn = chữ mờ "chưa dựng").

- **Tailwind quét cả file test và file .md trong apps/web:** chuỗi trông như class (vd variant tuỳ biến có ngoặc nhọn bên trong) trong `*.test.tsx` hay `ds/*.md` cũng được sinh CSS — chuỗi hỏng làm dev server 500 (gặp 20/11). Trong test/tài liệu viết mô tả bằng lời, đừng dán class có ngoặc nhọn/chỗ trống; lỡ dính thì sửa chuỗi rồi `touch ds/tokens.css` để Tailwind quét lại.

## Tương phản — chấp nhận có chủ đích

Giữ y màu nguồn ChatGPT; 4 cặp dưới WCAG (danger chữ tối 3.52, viền input 1.42/2.28, viền Checkbox 1.6, chữ Badge
3.81–4.39) là chấp nhận có chủ đích — CEO 19/11. Không "sửa giùm" trong `tokens.css`.

## Cập nhật khi artifact đổi

1. Chép bản mới vào `nguon/` bằng `cp` (giữ nguyên byte — đừng ghi qua Python/Node chế độ chữ: trên Windows LF thành
   CRLF), ghi số bản + sha256 mới vào bảng trên (`sha256sum nguon/tokens.json nguon/tokens.css nguon/bundle.css
   nguon/components/*/preview.html`; đo cả ở nguồn trước khi chép, hai bên phải trùng).
2. Sửa số bản trong dòng đầu `sinh-token.mjs` (hằng `DAU`), rồi chạy script (cwd `apps/web`):
   `node ds/sinh-token.mjs` → ghi đè `ds/tokens.css`.
3. Chạy so khớp: `npm run test -- ds/sinh-token` (mỗi màu trong `tokens.json` có mặt đúng giá trị; `tokens.css` = đầu ra
   script).
