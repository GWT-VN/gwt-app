# Nguồn token DS v2

Artifact **"GWT — OpenAI + shadcn"**, **bản 26** — https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr

File trong `nguon/` chép **nguyên byte** từ artifact bản 26. Không sửa tay.

| File | sha256 |
|---|---|
| `nguon/tokens.json` | `a6dc379bf515623fac52bb8559e10ca5bc0e914fe105de80883383b67a75d221` |
| `nguon/tokens.css` | `45230c507af3efd5507f16e82a2911679fadf68b8ed2e5583e84d14f92bc44b5` |
| `nguon/bundle.css` | `99d035e25e8c14a34a9db0d73ef2a6487c458c14f59f94bacf39bb9359c9e85c` |
| `nguon/components/Button/preview.html` | `177935133068d688891289c9b853d7a5cf847dcf34b5c0f4636a5e7b0486052c` |

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
  "bật cho đồng bộ"). Shorthand `font:` trong `bundle.css` tắt chúng trên nhiều class `.ui-*` là tật đã biết của
  artifact → mỗi config `so-khop/<c>.json` ghi `lyDo` cho dòng `fontFeatureSettings`, không sửa component theo.
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

## Tương phản — chấp nhận có chủ đích

Giữ y màu nguồn ChatGPT; 4 cặp dưới WCAG (danger chữ tối 3.52, viền input 1.42/2.28, viền Checkbox 1.6, chữ Badge
3.81–4.39) là chấp nhận có chủ đích — CEO 19/11. Không "sửa giùm" trong `tokens.css`.

## Cập nhật khi artifact đổi

1. Chép bản mới của 4 file vào `nguon/` (giữ nguyên byte), ghi số bản + sha256 mới vào bảng trên
   (`sha256sum nguon/tokens.json nguon/tokens.css nguon/bundle.css nguon/components/Button/preview.html`).
2. Sửa số bản trong dòng đầu `sinh-token.mjs` (hằng `DAU`), rồi chạy script (cwd `apps/web`):
   `node ds/sinh-token.mjs` → ghi đè `ds/tokens.css`.
3. Chạy so khớp: `npm run test -- ds/sinh-token` (mỗi màu trong `tokens.json` có mặt đúng giá trị; `tokens.css` = đầu ra
   script).
