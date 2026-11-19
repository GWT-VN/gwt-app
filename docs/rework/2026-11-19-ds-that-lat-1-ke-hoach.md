# DS thật — Lát 1 (ống dẫn đầu–cuối với Button) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng trọn dây chuyền DS thật một lần với Button: token artifact → CSS trong vùng `[data-ds="v2"]` → component shadcn → trang `/ds#button` → script so khớp chứng minh khớp artifact.

**Architecture:** Token chép từ artifact (bản đã biên dịch `tokens.css`), script đổi selector sang vùng `[data-ds="v2"]`. Tailwind 4 chỉ ánh xạ thêm tên màu semantic kiểu shadcn; kích thước/bo góc dùng cú pháp biến `h-(--control-size-md)` như README artifact — không đè thang mặc định của Tailwind mà màn cũ đang dùng. Component chép kiểu shadcn (cva) vào `components/ui/`.

**Tech Stack:** Next 16.2 · React 19.2 · Tailwind 4 · shadcn/ui (Radix) · class-variance-authority · `@phosphor-icons/react` · vitest (node) · Chrome headless qua CDP (Node 24 có `WebSocket` sẵn).

**Spec:** `docs/rework/2026-11-19-ds-that-shadcn-chatgpt-thiet-ke.md`

## Global Constraints

- Làm trên nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`. **Không merge `main`.** Commit + push nhánh rework sau mỗi task.
- Token DS chỉ khai trong `[data-ds="v2"]` (và `[data-ds="v2"][data-theme="dark"]`); **không có selector `:root`** trong CSS DS.
- Không định nghĩa trong `@theme` bất kỳ khoá nào trùng thang mặc định Tailwind (`--radius-*`, `--shadow-*`, `--text-*`, `--spacing*`, `--font-*`, `--breakpoint-*`, `--color-<tên bảng màu Tailwind>-*`).
- Giá trị lấy từ token; không gõ màu/px trần trong component (ngoại lệ có ghi nguồn trong README artifact: Button sm `px-[13px]` = 10 × 1.33).
- Màu giữ y nguồn ChatGPT (kể cả 4 cặp dưới WCAG — chấp nhận có chủ đích, ghi ở `NGUON.md`).
- Icon: Phosphor (`@phosphor-icons/react`), không lucide.
- Font trong vùng DS: Inter qua `next/font/google`, `subsets: ['latin', 'vietnamese']`.
- Cổng dev: `3401`. `/ds` chỉ chạy khi `NODE_ENV !== 'production'`.
- Commit tiếng Việt có dấu, prefix conventional, kết bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Không commit PII.
- Chuẩn bị worktree (một lần, trước Task 1): `npm --prefix apps/web install`; chép `.env.local.dev` từ checkout gốc `gwt-app/apps/web/` sang `apps/web/` rồi `npm --prefix apps/web run env:local` (trỏ Supabase LOCAL — **tuyệt đối không** `env:prod`). Không commit file env.
- Bản artifact nguồn: **bản 26** (`https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr`). File nguồn đã tải sẵn ở scratchpad của phiên điều phối; người điều phối chép vào `apps/web/ds/nguon/` ở Task 1 bước 1.

## Review Focus

1. Máy bật dark mode hệ điều hành: `globals.css` đổi `--background` ở `:root` → bên trong vùng DS theme sáng vẫn phải nền trắng. (Task 1, test `vùng sáng tự khai --background`.)
2. Màn cũ sau khi `globals.css` import CSS DS: không lớp/utility mặc định nào đổi giá trị. (Task 2, test chặn khoá `@theme` trùng mặc định.)
3. Nút đang tải bị bấm lần hai → không gọi `onClick` lần nữa. (Task 4, test `loading thì disabled + aria-busy`.)
4. Nút `asChild` bọc `<a>` (điều hướng) vẫn mang đủ class, không lồng `<button>` trong `<a>`. (Task 4, test `asChild`.)
5. `/ds` ở production: không vào được, không lộ ra khỏi cổng đăng nhập. (Task 5, test `laDuongCongKhai`.)

---

### Task 1: Ống token — artifact → `apps/web/ds/tokens.css`

**Files:**
- Create: `apps/web/ds/nguon/tokens.json`, `apps/web/ds/nguon/tokens.css`, `apps/web/ds/nguon/bundle.css`, `apps/web/ds/nguon/components/Button/preview.html` (chép nguyên văn từ artifact bản 26)
- Create: `apps/web/ds/NGUON.md`
- Create: `apps/web/ds/sinh-token.mjs`
- Create (sinh ra): `apps/web/ds/tokens.css`
- Test: `apps/web/ds/sinh-token.test.ts`

**Interfaces:**
- Produces: `export function sinhToken(cssNguon: string): string` (trong `sinh-token.mjs`); file `apps/web/ds/tokens.css`; chạy CLI `node apps/web/ds/sinh-token.mjs` ghi đè `tokens.css`.

- [ ] **Step 1:** Chép 4 file nguồn vào `apps/web/ds/nguon/` (giữ nguyên byte). Viết `NGUON.md`: bản artifact 26, URL, sha256 từng file (`sha256sum`), câu "Giữ y màu nguồn ChatGPT; 4 cặp dưới WCAG (danger chữ tối 3.52, viền input 1.42/2.28, viền Checkbox 1.6, chữ Badge 3.81–4.39) là chấp nhận có chủ đích — CEO 19/11", và cách cập nhật (chép bản mới → chạy script → chạy so khớp).

- [ ] **Step 2: Viết test thất bại** `apps/web/ds/sinh-token.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { sinhToken } from './sinh-token.mjs'
const nguon = readFileSync('ds/nguon/tokens.css', 'utf8')
const ra = sinhToken(nguon)
const json = JSON.parse(readFileSync('ds/nguon/tokens.json', 'utf8'))

test('không còn selector :root, mọi khối nằm trong vùng DS', () => {
  expect(ra).not.toMatch(/(^|[\s,]):root\b/m)
  expect(ra).toContain('[data-ds="v2"] {')
  expect(ra).toContain('[data-ds="v2"][data-theme="dark"] {')
})
test('mọi màu theme sáng/tối trong tokens.json có mặt đúng giá trị', () => {
  // value: chuỗi hex, {light, dark}, hoặc alias "{ten}" → var(--ten)
  for (const t of json.color.tokens) { /* kiểm `--${t.name}: <giá trị>` trong khối sáng và khối tối */ }
})
test('vùng sáng tự khai --background (không ăn theo :root của globals.css khi máy bật dark)', () => {
  expect(khoi(ra, '[data-ds="v2"]')).toMatch(/--background:/)
})
test('class kiểu chữ đổi tiền tố ds- (không đè .text-sm của Tailwind)', () => {
  expect(ra).toMatch(/\[data-ds="v2"\] \.ds-text-sm \{/)
  expect(ra).not.toMatch(/^\.text-sm \{/m)
})
test('--font-sans trong vùng DS là Inter', () => {
  expect(ra).toMatch(/--font-sans: var\(--font-inter\),/)
})
test('file tokens.css đã commit đúng bằng đầu ra của script (không sửa tay)', () => {
  expect(readFileSync('ds/tokens.css', 'utf8')).toBe(ra)
})
```
(`khoi(css, selector)` = helper nhỏ trong file test, trả nội dung khối `selector {…}` đầu tiên.)

- [ ] **Step 3:** Chạy `npm --prefix apps/web run test -- ds/sinh-token` → FAIL (chưa có module).

- [ ] **Step 4: Viết `sinhToken`** trong `apps/web/ds/sinh-token.mjs`: đổi `:root, [data-theme="light"]` → `[data-ds="v2"]`, `[data-theme="dark"]` → `[data-ds="v2"][data-theme="dark"]`, `:root` → `[data-ds="v2"]`; class kiểu chữ `.x {` → `[data-ds="v2"] .ds-x {`; thay dòng `--font-sans: …;` bằng `--font-sans: var(--font-inter), <stack cũ>;`; bỏ comment `/* … */` cuối dòng để file gọn; dòng 1 `/* Sinh từ ds/nguon/tokens.css (artifact bản 26) bằng ds/sinh-token.mjs — KHÔNG sửa tay */`. Khi chạy trực tiếp (`import.meta.url` = argv[1]) thì đọc `ds/nguon/tokens.css` và ghi `ds/tokens.css`.

- [ ] **Step 5:** `node ds/sinh-token.mjs` (cwd `apps/web`) rồi chạy test → PASS cả 6.

- [ ] **Step 6: Commit** `feat(ds): ống token — artifact bản 26 → ds/tokens.css trong vùng [data-ds="v2"]`

---

### Task 2: Ánh xạ Tailwind + nạp CSS DS vào app

**Files:**
- Create: `apps/web/ds/theme.css`
- Modify: `apps/web/app/globals.css` (thêm 2 dòng `@import` ngay sau `@import "tailwindcss";`)
- Test: `apps/web/ds/theme.test.ts`

**Interfaces:**
- Consumes: `ds/tokens.css` (Task 1).
- Produces: utility màu semantic dùng được trong vùng DS: `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-accent`, `text-muted-foreground`, `bg-muted`, `border-input`, `border-border`, `outline-ring`, `bg-destructive`, `text-destructive-foreground`, `bg-popover`, `text-popover-foreground`, `bg-card`, `text-card-foreground`.

- [ ] **Step 1: Test thất bại** `apps/web/ds/theme.test.ts`:
  - `theme.css` chỉ chứa khối `@theme inline { … }` với khoá dạng `--color-<tên>` trong danh sách semantic ở Interfaces (đúng 16 tên trên; `background`/`foreground` KHÔNG khai lại vì `globals.css` đã có).
  - Không khoá nào khớp `/^--(radius|shadow|text|spacing|font|breakpoint)/` hay `/^--color-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/`.
  - Mọi `var(--x)` trong `theme.css` có `--x:` trong `ds/tokens.css`.
  - `app/globals.css` có `@import "../ds/tokens.css";` và `@import "../ds/theme.css";`.
- [ ] **Step 2:** Chạy → FAIL.
- [ ] **Step 3:** Viết `ds/theme.css` (`--color-primary: var(--primary);` …) và 2 dòng import.
- [ ] **Step 4:** Test PASS; `npx tsc --noEmit -p .` và `npm run build` (cwd `apps/web`) sạch.
- [ ] **Step 5: Commit** `feat(ds): ánh xạ màu semantic shadcn vào Tailwind, nạp CSS DS (không đè thang mặc định)`

---

### Task 3: Nền shadcn + `DsRoot` (vùng DS + ô portal)

**Files:**
- Modify: `apps/web/package.json` (cài `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@phosphor-icons/react` — bản ổn định mới nhất đã phát hành ≥ 2 tuần)
- Create: `apps/web/components.json` (shadcn: style `new-york`, `rsc: true`, `tsx: true`, tailwind `css: "app/globals.css"`, `cssVariables: true`, aliases `components: "@/components"`, `ui: "@/components/ui"`, `utils: "@/lib/utils"`)
- Create: `apps/web/lib/utils.ts`
- Create: `apps/web/components/ui/ds-root.tsx`
- Test: `apps/web/components/ui/ds-root.test.tsx`

**Interfaces:**
- Produces:
  - `export function cn(...v: ClassValue[]): string` (`lib/utils.ts`, clsx + tailwind-merge)
  - `export function DsRoot(props: { theme?: 'light' | 'dark'; className?: string; children: React.ReactNode }): JSX.Element` — client component; render `<div data-ds="v2" data-theme={theme ?? 'light'} className={cn('bg-background text-foreground font-[family-name:var(--font-sans)] antialiased', className)} style={{ colorScheme: theme ?? 'light' }}>{children}<div data-ds-portal="" /></div>`
  - `export function useDsPortal(): HTMLElement | null` — trả phần tử `[data-ds-portal]` của `DsRoot` gần nhất (qua context, gán bằng ref + state sau khi mount). Component có Radix Portal ở lát sau truyền giá trị này vào `container`.

- [ ] **Step 1: Test thất bại** (`renderToStaticMarkup` từ `react-dom/server`, không cần jsdom):
  - `DsRoot` mặc định ra `data-ds="v2"` + `data-theme="light"` + `style` có `color-scheme:light` + có một `div[data-ds-portal]` là con cuối.
  - `theme="dark"` ra `data-theme="dark"`, `color-scheme:dark`.
  - `cn('px-2', 'px-4')` === `'px-4'`.
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Cài gói, viết file. **Step 4:** Test PASS, tsc sạch.
- [ ] **Step 5: Commit** `feat(ds): nền shadcn (Radix, cva, Phosphor) + DsRoot — vùng DS và ô portal`

---

### Task 4: Button (+ Spinner)

**Files:**
- Create: `apps/web/components/ui/spinner.tsx`, `apps/web/components/ui/button.tsx`
- Test: `apps/web/components/ui/button.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 3).
- Produces:
  - `export function Spinner(props: { className?: string }): JSX.Element` — `<span aria-hidden className="…">`, kích thước/nét/tốc độ theo `.ui-spinner` trong `ds/nguon/bundle.css`.
  - `export const buttonVariants` (cva) và `export function Button(props: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean }): JSX.Element`
  - variant: `default | secondary | outline | ghost | destructive | link`; size: `default | sm | lg | icon | icon-sm`; shape: `pill` (mặc định) | `rounded`.

Giá trị (nguồn: `ds/nguon/bundle.css` khối Button + README artifact Button) — base: `relative inline-flex items-center justify-center gap-1.5 rounded-full font-medium text-[14px] leading-none whitespace-nowrap select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-(--color-background-disabled) disabled:text-(--color-text-disabled) [&_svg]:size-(--control-icon-size-md)`; size default `h-(--control-size-md) px-[calc(var(--control-gutter-md)*1.33)]`; sm `h-(--control-size-sm) px-[calc(var(--control-gutter-sm)*1.33)] gap-1`; lg `h-(--control-size-lg) px-[calc(var(--control-gutter-md)*1.33)]`; icon `size-(--control-size-md) p-0`; icon-sm `size-(--control-size-sm) p-0`; shape rounded: bo `--radius-md` (md/lg/icon) / `--radius-sm` (sm/icon-sm), padding `--control-gutter-*` (không × 1.33); outline/ghost `focus-visible:-outline-offset-1`; destructive `focus-visible:outline-(--color-ring-danger)`; link: chữ `--blue-500` (tối `--blue-300`), `h-auto p-0 rounded-(--radius-sm)`, hover gạch chân offset 0.1em; ghost `aria-pressed/aria-checked/aria-expanded="true"` → nền `accent`; outline disabled giữ nền trong suốt + viền `--color-border-disabled`. Màu hover/active từng variant đúng bảng README artifact.

- [ ] **Step 1: Test thất bại** (`renderToStaticMarkup`):
  - `Button` mặc định là `<button` có `data-variant="default"` `data-size="default"`, class chứa `rounded-full` và `h-(--control-size-md)`.
  - `variant="outline"` có `shadow-[inset_0_0_0_1px_var(--input)]` (hoặc lớp tương đương ghi trong code); `shape="rounded" size="sm"` có `rounded-(--radius-sm)` và không `rounded-full`.
  - `loading` → `disabled`, `aria-busy="true"`, `data-loading`, có `Spinner`; nội dung chữ vẫn trong DOM (giữ bề rộng).
  - `asChild` với `<a href="/x">` → ra `<a` mang class nút, không có `<button`.
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Viết `spinner.tsx`, `button.tsx` (chép khung shadcn Button, thay class theo bảng trên; `Slot` từ `radix-ui`). **Step 4:** PASS, tsc sạch.
- [ ] **Step 5: Commit** `feat(ds): Button + Spinner theo artifact (pill 32px, 6 biến thể, 5 cỡ, loading)`

---

### Task 5: Trang `/ds` (chỉ dev) với khối `#button`

**Files:**
- Create: `apps/web/app/ds/layout.tsx`, `apps/web/app/ds/page.tsx`
- Create: `apps/web/lib/nen-tang/duong-cong-khai.ts`
- Modify: `apps/web/proxy.ts` (thay mảng `DUONG_CONG_KHAI` bằng hàm mới)
- Test: `apps/web/lib/nen-tang/duong-cong-khai.test.ts`

**Interfaces:**
- Consumes: `DsRoot`, `Button`.
- Produces: `export function laDuongCongKhai(path: string, env: string | undefined): boolean` — `/login`, `/auth` luôn công khai; `/ds` công khai chỉ khi `env !== 'production'`. Trang `http://localhost:3401/ds` (`?theme=dark` cho tối), khối `<section id="button">` tái tạo đúng 3 hàng của `ds/nguon/components/Button/preview.html`, mỗi nút có `data-so="<khoá>"` (khoá: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`, `disabled`, `loading`, `outline-disabled`, `sm`, `md`, `lg`, `icon`, `rounded-sm`, `icon-sm-rounded`). Hàng trạng thái "Hover/Focus" không ép bằng class — script tạo bằng tương tác thật.

- [ ] **Step 1: Test thất bại**: `laDuongCongKhai('/login', 'production')` true; `('/ds', 'development')` true; `('/ds', 'production')` false; `('/ticket', 'development')` false.
- [ ] **Step 2:** FAIL. **Step 3:** Viết hàm, sửa `proxy.ts`, `layout.tsx` (`if (process.env.NODE_ENV === 'production') notFound()`, nạp Inter `variable: '--font-inter'`, subsets latin + vietnamese), `page.tsx` (đọc `searchParams.theme`, bọc `DsRoot`, nút đổi sáng/tối là liên kết `?theme=`). **Step 4:** PASS; tsc + build sạch.
- [ ] **Step 5:** `npx next dev -p 3401` (cwd `apps/web`, chạy nền), mở `http://localhost:3401/ds#button` thấy đủ 3 hàng ở sáng và tối; tắt đúng tiến trình mình bật.
- [ ] **Step 6: Commit** `feat(ds): trang /ds (chỉ dev) — khối Button, đổi sáng/tối`

---

### Task 6: Script so khớp với artifact

**Files:**
- Create: `apps/web/ds/so-khop.mjs`, `apps/web/ds/so-khop/button.json`
- Create (sinh ra, commit): `apps/web/ds/so-khop/Button.md`
- Modify: `.gitignore` (thêm `apps/web/ds/so-khop/anh/`)

**Interfaces:**
- Consumes: `/ds#button` (Task 5), `ds/nguon/*` (Task 1).
- Produces: CLI `node ds/so-khop.mjs <Component> [--url http://localhost:3401]` → `ds/so-khop/<Component>.md` + ảnh `ds/so-khop/anh/<Component>-{sang,toi}-{1440,390}-{artifact,ds}.png`; thoát mã 1 nếu có dòng lệch chưa có lý do.
- `button.json`: mảng `{ "khoa": string, "artifact": "<selector trong preview.html>", "ds": "[data-so=\"<khoa>\"]", "lyDo"?: { "<thuộc tính>": "<vì sao lệch>" } }`, 15 khoá như Task 5 (vd `default` ↔ `.ui-row:nth-of-type(1) .ui-btn:nth-child(1)`).

- [ ] **Step 1:** Viết `so-khop.mjs`: dựng file HTML tạm từ `ds/nguon/tokens.css` + `ds/nguon/bundle.css` + preview (bỏ dòng `@dsCard`), `<html data-theme>`; mở Chrome headless (`C:/Program Files/Google/Chrome/Application/chrome.exe --headless=new --remote-debugging-port`), với mỗi theme × khổ: đo trên cả hai trang các thuộc tính `width height paddingLeft paddingRight gap borderRadius fontSize fontWeight lineHeight color backgroundColor boxShadow outline*` (làm tròn 0.5px; màu chuẩn hoá về `rgb()`); thêm trạng thái hover (di chuột thật qua `Input.dispatchMouseEvent`) và focus-visible (phím Tab thật) cho `default`, `outline`, `ghost`, `destructive`; chụp ảnh; ghi bảng `| khoá | thuộc tính | artifact | ds | lý do |` chỉ các dòng lệch + dòng tổng "N/N khớp".
- [ ] **Step 2:** Chạy với dev server 3401 → đọc `Button.md`. Lệch do code → sửa `button.tsx` (quay lại test Task 4); lệch chính đáng → ghi `lyDo` trong `button.json`. Lặp tới khi thoát mã 0.
- [ ] **Step 3:** Xem bằng mắt 8 cặp ảnh (sáng/tối × 1440/390 × hai bên).
- [ ] **Step 4: Commit** `feat(ds): script so khớp artifact — Button khớp N/N (sáng/tối, 1440/390, hover/focus thật)`

---

## Kết lát 1 (người điều phối)

`npm run test` + `npx tsc --noEmit -p .` + `npm run build` sạch · reviewer độc lập cả lát · chụp `/ds#button` sáng/tối 1440/390 · mời CEO xem `http://localhost:3401/ds#button` · push `rework/v2.0.0`.
