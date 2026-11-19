# DS thật — Lát 2 (Nền còn lại + Overlay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng 10 component thật — Badge, Avatar, Kbd, Alert (nền) và Tooltip, DropdownMenu, ContextMenu, Dialog, AlertDialog/ConfirmDialog, Sheet (overlay) — mỗi cái có khối `/ds#<neo>` và cổng so khớp artifact xanh, overlay chứng minh portal nằm trong vùng DS.

**Architecture:** Giữ khuôn lát 1: component kiểu shadcn (cva + Radix từ gói `radix-ui`) trong `components/ui/`, giá trị lấy từ khối `.ui-*` tương ứng của `ds/nguon/bundle.css`. Overlay render qua Radix Portal với `container = useDsPortal()` (ô portal trong `DsRoot`). Cổng `ds/so-khop.mjs` được mở rộng để **mở overlay bằng tương tác thật** (bấm, chuột phải, rê, phím) trước khi đo, đo được pseudo-element (tooltip của artifact là `::after`), và bắt lỗi nếu phần tử DS nằm ngoài vùng `[data-ds]`. Hành vi (focus, Esc, khoá khi đang chạy) test bằng Testing Library trên jsdom — lát 1 chưa có vì vitest chạy node.

**Tech Stack:** Next 16.2 · React 19.2 · Tailwind 4 · `radix-ui` 1.8.x · cva · `@phosphor-icons/react` · vitest 4 (+ jsdom, @testing-library/react, @testing-library/user-event — thêm ở Task 1) · Chrome headless qua CDP.

**Spec:** `docs/rework/2026-11-19-ds-that-shadcn-chatgpt-thiet-ke.md` (§5.1 vùng DS + bẫy portal, §5.3 component, §5.4 `/ds`, §5.5 so khớp, §7 lát 2). Luật component gom ở `apps/web/ds/NGUON.md` mục "Luật cho component lát 2" — **đọc trước mọi task**.

## Global Constraints

- Nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`. **Không merge `main`.** `git pull --ff-only` trước khi commit (phiên khác có đẩy docs); commit + push sau mỗi task; chỉ `git add` file của mình (không `-A`, không `stash`).
- Token DS chỉ trong `[data-ds="v2"]`; không `:root` trong CSS DS; không khoá `@theme` trùng thang Tailwind.
- Giá trị lấy từ token/khối `.ui-*` của `ds/nguon/bundle.css`; không gõ màu/px trần trong component trừ khi bundle.css gõ đúng số đó (ghi nguồn bằng comment).
- Màu giữ y nguồn ChatGPT. Icon Phosphor `regular` (không lucide). Font/feature: kế thừa từ `DsRoot`, component **không reset** `font-feature-settings`.
- Overlay (Tooltip, DropdownMenu, ContextMenu, Dialog, AlertDialog, Sheet): Portal **bắt buộc** `container={useDsPortal()}`; chưa có container (trước mount) thì không render nội dung portal.
- Không chạy `npx shadcn add` thẳng — chép tay từ registry shadcn (new-york) rồi tô lại theo bundle.css.
- Nguồn artifact: **bản 31** (`https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr`). Bản chép 10 `preview.html` có sẵn ở `C:/Users/Duncr/AppData/Local/Temp/claude/d2fa843791a29a0f/9d5dc202-19a7-43e4-bf9a-2b7a84a1d1c8/scratchpad/lat2/project/components/<C>/` (Task 1 chép vào repo, giữ LF).
- Dev server: cổng `3401`, mở bằng `http://127.0.0.1:3401` trên máy này. Đã có server đang chạy từ worktree này thì dùng chung, **không tắt**; tự bật thì tự tắt đúng PID của mình.
- Commit tiếng Việt có dấu, prefix conventional, kết bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Không PII. Mọi `.env` trỏ Supabase LOCAL, không `env:prod`.
- Mỗi task kết thúc khi: test task + cả bộ test + `tsc` sạch, và `node ds/so-khop.mjs <C> --url http://127.0.0.1:3401` thoát 0 cho component của task (lệch nào cũng phải có `lyDo` cụ thể; `chuaDo` liệt kê thứ preview không có).

## Review Focus

1. Overlay mở ở theme tối: nội dung portal phải nằm trong `[data-ds="v2"]` và ăn token tối (nền `popover` tối, chữ sáng). (Task 1 cổng `trongVung`; Task 5–10 khoá overlay chạy cả `toi`.)
2. Đóng overlay bằng Esc hoặc nút Đóng → focus trả về đúng nút đã mở. (Test RTL ở Task 6, 7, 8, 9, 10.)
3. ConfirmDialog đang chạy: Esc, nút Huỷ, bấm ngoài đều không đóng; bấm xác nhận lần hai không gọi lại `onXacNhan`. (Task 9.)
4. Tooltip trên nút đang mở menu (`aria-expanded="true"`) không được hiện đè lên menu. (Task 5.)
5. Khổ 390: Dialog/ConfirmDialog rộng hết trừ 16px mỗi bên, nút xếp dọc (nút chính trên, rộng hết); Sheet rộng 100%. (Cổng so khớp khổ 390 ở Task 8–10 + test Task 9.)

---

### Task 1: Nền đo lát 2 — nguồn, cổng mở overlay, test DOM, `/ds` tách khối

**Files:**
- Create: `apps/web/ds/nguon/components/{Badge,Avatar,Kbd,Alert,Tooltip,DropdownMenu,ContextMenu,Dialog,ConfirmDialog,Sheet}/preview.html` (chép nguyên byte, LF)
- Modify: `apps/web/ds/NGUON.md` (bảng sha256 thêm 10 file, ghi "bản 31")
- Modify: `apps/web/ds/so-khop.mjs`, `apps/web/ds/so-khop.test.ts`
- Modify: `apps/web/package.json` (devDeps `jsdom`, `@testing-library/react`, `@testing-library/user-event` — bản ổn định mới nhất đã phát hành ≥ 2 tuần)
- Create: `apps/web/vitest.setup-dom.ts` (polyfill cho Radix trên jsdom: `ResizeObserver`, `Element.prototype.hasPointerCapture/releasePointerCapture/scrollIntoView`, `DOMRect`), `apps/web/vitest.config.ts` thêm `setupFiles` chỉ chạy cho file có `// @vitest-environment jsdom`
- Create: `apps/web/components/ui/ds-root.dom.test.tsx`
- Modify: `apps/web/app/ds/page.tsx` → mục lục + import khối; Create: `apps/web/app/ds/_khoi/khoi-button.tsx` (chuyển nguyên khối Button sang, giữ `data-so`)

**Interfaces:**
- Produces (config `ds/so-khop/<c>.json`, mỗi khoá thêm 3 trường tuỳ chọn):
  - `"buoc": [{ "bam": "<sel>" } | { "chuotPhai": "<sel>" } | { "tro": "<sel>" } | { "phim": "Tab"|"Escape"|"ArrowDown"|"Shift+F10" }]` — chạy bằng CDP `Input.*` thật ở phía DS (và cả artifact nếu `artifactThat`) ngay trước khi đo khoá đó; khoá có `buoc` được đo trên trang **nạp lại mới** (không rò trạng thái sang khoá khác). Bước không tìm thấy phần tử → lỗi chạy (thoát 2), không bỏ qua.
  - `"pseudo": { "artifact"?: "::after", "ds"?: "::after" }` — đo `getComputedStyle(el, pseudo)`.
  - `"trongVung": true` — phía DS: phần tử phải có `closest('[data-ds="v2"]')`; không có → dòng "NGOÀI VÙNG DS", không lyDo nào miễn được.
- Produces (`/ds`): mỗi khối là một file `app/ds/_khoi/khoi-<ten>.tsx` export `function Khoi<Ten>()`, bọc `<section id="<neo>" className="scroll-mt-6">` + `<h2>` có link `#<neo>`; `page.tsx` có mục lục link tới mọi `#neo`. Neo: `button`, `badge`, `avatar`, `kbd`, `alert`, `tooltip`, `dropdown-menu`, `context-menu`, `dialog`, `confirm-dialog`, `sheet`.

- [ ] **Step 1: Test thất bại**
  - `so-khop.test.ts`: `docBuoc([{bam:'#a'},{phim:'Escape'}])` trả mảng lệnh CDP đúng thứ tự (export hàm thuần dựng lệnh, tách khỏi phần chạy Chrome); config có `trongVung` mà phần tử ngoài vùng → `phanLoai(...)` trả `"ngoai-vung"` và không bị `timLyDo` miễn.
  - `ds-root.dom.test.tsx` (`// @vitest-environment jsdom`): render `<DsRoot><Probe/></DsRoot>` với `Probe` đọc `useDsPortal()` → sau `await` mount, giá trị là phần tử `[data-ds-portal]` và `closest('[data-ds="v2"]')` khác null (đóng nợ lát 1: useDsPortal sau mount).
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Cài devDeps, viết setup/polyfill, mở rộng so-khop, tách `/ds`. **Step 4:** PASS; cả bộ test + tsc sạch; `node ds/so-khop.mjs Button --url http://127.0.0.1:3401` vẫn **2644/2644** thoát 0 (tách khối không được làm lệch).
- [ ] **Step 5: Commit** `feat(ds): nền đo lát 2 — nguồn bản 31, so khớp mở overlay bằng tương tác thật, test DOM, /ds tách khối`

---

### Task 2: Badge (+ chấm màu)

**Files:** Create `apps/web/components/ui/badge.tsx`, `apps/web/components/ui/badge.test.tsx`, `apps/web/app/ds/_khoi/khoi-badge.tsx`, `apps/web/ds/so-khop/badge.json` → `Badge.md`

**Interfaces:**
- Produces: `badgeVariants` (cva) · `Badge(props: React.ComponentProps<'span'> & { variant?: 'soft'|'solid'|'outline'; color?: 'secondary'|'info'|'success'|'warning'|'danger'|'discovery'; size?: 'sm'|'md'; asChild?: boolean })` — mặc định `soft` · `secondary` · `sm`; render `data-variant`/`data-color`/`data-size`. `BadgeDot(props: { className?: string })` — `<span aria-hidden>` chấm theo màu của badge cha (CSS kế thừa `currentColor` như `.ui-dot` trong bundle).
- Giá trị: khối `.ui-badge*`, `.ui-dot` của bundle.css — sm cao 20 / padding 7 / bo `--radius-full` (chốt 18/11) / 12px semibold; md 22 / 6 / 14px; màu soft = `color-background-<màu>-soft-alpha` + `color-text-<màu>-soft`.

- [ ] **Step 1: Test thất bại** (`renderToStaticMarkup`): mặc định ra `data-variant="soft" data-color="secondary" data-size="sm"`; `color="danger" variant="solid"` ra đúng data-*; chữ luôn nằm trong DOM; `BadgeDot` có `aria-hidden`.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#badge` tái tạo 2 hàng của preview với `data-so` (khoá: `nhap`, `info`, `success`, `warning`, `danger`, `discovery`, `solid`, `solid-success`, `solid-danger`, `outline`, `md-info`; `con` cho chấm `info`); cổng `Badge` thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Badge — soft/solid/outline, 6 màu, sm/md, chấm màu`

---

### Task 3: Avatar + Kbd

**Files:** Create `components/ui/avatar.tsx`, `components/ui/kbd.tsx`, `components/ui/avatar-kbd.test.tsx`, `app/ds/_khoi/khoi-avatar.tsx`, `app/ds/_khoi/khoi-kbd.tsx`, `ds/so-khop/avatar.json`, `ds/so-khop/kbd.json`

**Interfaces:**
- Produces: `Avatar({ size?: 'default'|'sm', className, children })` (Radix `Avatar.Root`), `AvatarImage`, `AvatarFallback`; `chuCaiDau(ten: string): string` — 1–2 chữ cái đầu, bỏ tiền tố "anh"/"chị"/"em" (không phân biệt hoa thường), viết hoa. `Kbd(props: React.ComponentProps<'kbd'>)`, `KbdGroup`.
- Giá trị: `.ui-avatar` (22px, sm 20px, nền `alpha-08`, chữ `gray-600` 10px 600 / sm 9px, bo full); `.ui-kbd` (cao 20, rộng tối thiểu 20, padding 0 4, bo `radius-xs`, nền `background`, viền inset `alpha-12`, 12px 500 `muted-foreground`). Kbd ẩn trên thiết bị cảm ứng: `pointer-coarse:hidden`.
- Để lát 6 (CommandPalette): đổi `Ctrl` ↔ `⌘` theo nền tảng — **không làm ở lát này**.

- [ ] **Step 1: Test thất bại:** `chuCaiDau('chị Nguyễn Thu Hiền') === 'NH'`… chốt luật: chữ cái đầu của từ đầu + từ cuối sau khi bỏ tiền tố; `chuCaiDau('Hiền') === 'H'`; `chuCaiDau('  ') === ''`. Avatar fallback render chữ; `size="sm"` ra `data-size="sm"`; `Kbd` render `<kbd>` có class ẩn khi cảm ứng.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#avatar` (khoá `md`, `md-2`, `sm`) và `#kbd` (khoá `ctrl`, `k`, nút chứa `nut`) tái tạo preview; cổng `Avatar`, `Kbd` thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Avatar (chữ cái đầu) + Kbd`

---

### Task 4: Alert

**Files:** Create `components/ui/alert.tsx`, `components/ui/alert.test.tsx`, `app/ds/_khoi/khoi-alert.tsx`, `ds/so-khop/alert.json`

**Interfaces:**
- Produces: `Alert(props: React.ComponentProps<'div'> & { color?: 'secondary'|'info'|'success'|'warning'|'danger'; icon?: React.ReactNode })` — mặc định `role="status"`, `color="danger"` mặc định `role="alert"` (truyền `role` thì giữ của người gọi); `AlertTitle`, `AlertDescription`, `AlertActions`. Icon mặc định theo màu bằng Phosphor (`Info`, `CheckCircle`, `Warning`, `WarningCircle`) cỡ 16.
- Giá trị: `.ui-alert*` — bo 12 / padding 16 / gap 12, 14px/20px, tiêu đề 600, nền `color-background-<màu>-surface` + inset 1px `color-border-<màu>-surface`, icon `color-text-<màu>`, chữ thân `foreground`.

- [ ] **Step 1: Test thất bại:** mặc định `role="status"`; `color="danger"` → `role="alert"`; `role="status"` truyền vào giữ nguyên dù danger; có icon mặc định; `AlertActions` render bên phải (class `ml-auto` hoặc tương đương ghi trong code).
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#alert` 5 alert như preview (khoá `mac-dinh`, `info`, `success`, `warning`, `danger`; `con`: tiêu đề, mô tả, icon, hành động của `warning`); cổng `Alert` thoát 0 (icon SVG viết tay của preview ↔ Phosphor: hộp icon phải khớp 16px, nét khác ghi `lyDo`).
- [ ] **Step 5: Commit** `feat(ds): Alert — 5 màu, role theo mức độ, hành động bên phải`

---

### Task 5: Tooltip (overlay đầu tiên — kiểm portal thật)

**Files:** Create `components/ui/tooltip.tsx`, `components/ui/tooltip.dom.test.tsx`, `app/ds/_khoi/khoi-tooltip.tsx`, `ds/so-khop/tooltip.json`

**Interfaces:**
- Consumes: `useDsPortal` (DsRoot), `Button`.
- Produces: `Tooltip({ content: React.ReactNode; side?: 'bottom'|'right'|'top'|'left'; children: React.ReactElement })` — tự mang `Tooltip.Provider` (`delayDuration` 300), trigger `asChild`; nội dung portal vào `useDsPortal()`; **không mở** khi phần tử trigger đang `aria-expanded="true"`; mở khi hover và khi focus bằng phím.
- Giá trị: `.ui-tip … ::after` — nền `color-background-primary-solid`, chữ `color-text-primary-solid`, 12px/16px 500 một dòng, padding 4 8, bo `radius-md`, cách trigger 6px (`sideOffset={6}`).

- [ ] **Step 1: Test thất bại (jsdom + user-event):** `tab` tới nút → tooltip có `role="tooltip"` với đúng chữ, và `closest('[data-ds="v2"]')` khác null; trigger có `aria-expanded="true"` → hover/focus không hiện tooltip; Esc đóng tooltip.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#tooltip` (nút icon ghost + nút outline sm như preview); cổng `Tooltip`: khoá `icon` với `buoc: [{tro: …}]`, `pseudo.artifact: "::after"`, `trongVung: true`, chạy cả sáng/tối, thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Tooltip — portal trong vùng DS, hover + focus phím, ẩn khi nút đang mở menu`

---

### Task 6: DropdownMenu (+ kiểu menu dùng chung)

**Files:** Create `components/ui/menu-styles.ts`, `components/ui/dropdown-menu.tsx`, `components/ui/dropdown-menu.dom.test.tsx`, `app/ds/_khoi/khoi-dropdown-menu.tsx`, `ds/so-khop/dropdown-menu.json`

**Interfaces:**
- Produces `menu-styles.ts`: chuỗi class `menuContent`, `menuItem`, `menuItemDestructive`, `menuLabel`, `menuSeparator`, `menuShortcut`, `menuCheck` (Task 7 dùng lại, không chép).
- Produces `dropdown-menu.tsx`: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent` (portal `useDsPortal()`, `sideOffset` 4), `DropdownMenuItem({ variant?: 'default'|'destructive' })`, `DropdownMenuCheckboxItem` (✓ bên phải), `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`.
- Giá trị: `.ui-menu*` — khung padding 6 / bo 12 / nền `popover` / `shadow` + `shadow-hairline`; item 6×8, gap 6, 14/20, bo 6; trỏ `alpha-08` (tối `alpha-10`); nhãn 12px 600 `muted-foreground`; vạch 1px `border` tràn mép (margin −6); phím tắt 12px `muted-foreground` căn phải; xoá `color-text-danger`; item chặn quyền `aria-disabled` + `color-text-disabled`, vẫn hiện (không ẩn).

- [ ] **Step 1: Test thất bại (jsdom):** bấm trigger → `role="menu"` trong vùng DS; ↓ di chuyển; Esc đóng và focus về trigger; item `disabled` không gọi `onSelect`; checkbox item đổi `aria-checked`.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#dropdown-menu` hai trigger như preview (⋯ "Thao tác với đơn DH-DEMO-0001" và "Cột hiển thị"); cổng: mỗi khoá `buoc: [{bam: trigger}]`, `trongVung: true`; khoá `khung`, `nhan`, `item`, `item-hover` (`buoc` thêm `{tro: item}`; artifact ép `.is-hover`), `shortcut`, `disabled`, `vach`, `xoa`, `check-on`, `check-off`; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): DropdownMenu — kiểu menu OpenAI, portal trong vùng DS, item chặn quyền vẫn hiện`

---

### Task 7: ContextMenu

**Files:** Create `components/ui/context-menu.tsx`, `components/ui/context-menu.dom.test.tsx`, `app/ds/_khoi/khoi-context-menu.tsx`, `ds/so-khop/context-menu.json`

**Interfaces:**
- Consumes: `menu-styles.ts` (Task 6) — không định nghĩa lại class menu.
- Produces: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent` (portal `useDsPortal()`, rộng 220px), `ContextMenuItem({ variant })`, `ContextMenuLabel`, `ContextMenuSeparator`. Trigger khi đang mở: `data-[state=open]:bg-(--alpha-05)` (dòng/thẻ tô sáng).
- Hành vi: chuột phải → menu tại con trỏ; Shift+F10 / phím Menu trên trigger đang focus → mở + focus mục đầu (Radix có sẵn); chuột phải trong `input`/`textarea` bên trong trigger → **không** chặn menu trình duyệt (không mở ContextMenu).

- [ ] **Step 1: Test thất bại (jsdom):** `contextmenu` trên dòng → `role="menu"` trong vùng DS và dòng có `data-state="open"`; `contextmenu` trên `<input>` trong dòng → không có menu, `defaultPrevented === false`; Esc đóng, focus về dòng.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#context-menu`: một dòng mẫu (`tabIndex=0`, nhãn "TK-DEMO-039") với menu: nhãn mã · Mở ticket · Xem nhanh bên phải · Sao chép mã · vạch · Đóng ticket; cổng: `buoc: [{chuotPhai: dòng}]`, `trongVung`, khoá `khung`, `nhan`, `item`, `vach`, `dong-dang-mo` (nền dòng); thoát 0.
- [ ] **Step 5: Commit** `feat(ds): ContextMenu — chuột phải/Shift+F10, dòng tô sáng, ô nhập giữ menu trình duyệt`

---

### Task 8: Dialog (+ kiểu dialog dùng chung)

**Files:** Create `components/ui/dialog-styles.ts`, `components/ui/dialog.tsx`, `components/ui/dialog.dom.test.tsx`, `app/ds/_khoi/khoi-dialog.tsx`, `ds/so-khop/dialog.json`

**Interfaces:**
- Produces `dialog-styles.ts`: `overlay`, `panel` (rộng 250–450, ≤640px rộng `calc(100% - 32px)`), `title`, `desc`, `body`, `footer` (≥640 căn phải gap 8; <640 xếp dọc đảo thứ tự — nút chính trên, rộng hết), `closeBtn` — Task 9, 10 dùng lại.
- Produces `dialog.tsx`: `Dialog`, `DialogTrigger`, `DialogContent({ showClose?: boolean = true })` (portal `useDsPortal()`, overlay, nút ✕ `Button` ghost `icon-sm` `aria-label="Đóng"`), `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose`.
- Giá trị: `.ui-overlay`, `.ui-dialog*` — overlay đen 30% (tối 50%); nền `popover`, `shadow` + `shadow-hairline`, bo `radius-2xl` 16, padding 20; tiêu đề 18/26 600; mô tả 14 `muted-foreground`; footer cách thân 20, gap 8; hiện 160ms, tắt khi giảm chuyển động.

- [ ] **Step 1: Test thất bại (jsdom):** mở qua trigger → `role="dialog"` có `aria-labelledby`/`aria-describedby` trỏ đúng tiêu đề/mô tả, nằm trong vùng DS; Esc đóng và focus về trigger; bấm overlay đóng; Tab không rời dialog.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#dialog` tái tạo preview ("Xoá đơn DH-DEMO-0001?", ô "Lý do xoá", Huỷ outline + Xoá đơn destructive); cổng: `buoc: [{bam: trigger}]`, `trongVung`; khoá `overlay`, `panel`, `title`, `desc`, `footer`, `close`; sáng/tối × 1440/390 thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Dialog — overlay 30/50%, bo 16, padding 20, ≤640 rộng hết + nút xếp dọc`

---

### Task 9: AlertDialog + ConfirmDialog

**Files:** Create `components/ui/alert-dialog.tsx`, `components/ui/confirm-dialog.tsx`, `components/ui/confirm-dialog.dom.test.tsx`, `app/ds/_khoi/khoi-confirm-dialog.tsx`, `ds/so-khop/confirm-dialog.json`

**Interfaces:**
- Consumes: `dialog-styles.ts` (Task 8), `Button` (loading), `Alert` (Task 4).
- Produces `alert-dialog.tsx`: primitives shadcn `AlertDialog*` (overlay **không** đóng khi bấm; portal `useDsPortal()`).
- Produces `confirm-dialog.tsx`: `ConfirmDialog(props: { open: boolean; onOpenChange(open: boolean): void; tieuDe: string; moTa?: React.ReactNode; hauQua?: React.ReactNode[]; icon?: React.ReactNode; mau?: 'danger'; nutXacNhan: string; nutHuy?: string /* 'Huỷ' */; pha?: boolean /* phá dữ liệu → nút destructive + focus mặc định vào nút Huỷ */; dangChay?: boolean; loi?: React.ReactNode; khoaXacNhan?: boolean; onXacNhan(): void; children?: React.ReactNode /* ô lý do… */ })`.
- Hành vi: `pha` → focus mặc định nút Huỷ, ngược lại nút xác nhận; `dangChay` → nút xác nhận `loading`, Esc / Huỷ / overlay không đóng, `onXacNhan` không gọi lần hai; `loi` → `Alert color="danger"` trong thân, hộp không đóng; `hauQua` → `ul.ui-dialog-list`, ô lý do sau cách 16px; icon tròn 40px nền `alpha-05` (`mau="danger"` nền `color-background-danger-soft-alpha`, icon `color-text-danger-soft`).

- [ ] **Step 1: Test thất bại (jsdom):** `pha` → `document.activeElement` là nút Huỷ khi mở; `dangChay` → Esc không gọi `onOpenChange(false)`, bấm xác nhận 2 lần chỉ 1 lần `onXacNhan` (lần đầu trước khi bật `dangChay` do test điều khiển), Huỷ `disabled`; `loi` hiện `role="alert"` trong hộp; `khoaXacNhan` → nút xác nhận `disabled`; đóng xong focus về nút mở.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#confirm-dialog` có 3 nút mở 3 mẫu như preview (Đóng ticket · Xoá phiếu chi có hậu quả + lý do · Gộp khách gõ mã để mở khoá); cổng: mỗi mẫu `buoc: [{bam: nút mở}]`, `trongVung`; khoá `panel`, `icon`, `title`, `list`, `footer`, nút; 390 kiểm nút xếp dọc; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): AlertDialog + ConfirmDialog — focus nút an toàn, khoá khi đang chạy, lỗi ngay trong hộp`

---

### Task 10: Sheet

**Files:** Create `components/ui/sheet.tsx`, `components/ui/sheet.dom.test.tsx`, `app/ds/_khoi/khoi-sheet.tsx`, `ds/so-khop/sheet.json`

**Interfaces:**
- Consumes: `dialog-styles.ts` (`overlay`, `closeBtn`, `title`, `desc`).
- Produces: `Sheet`, `SheetTrigger`, `SheetContent({ side?: 'right' /* chỉ phải ở lát này */ })`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetBody` (cuộn), `SheetFooter`, `SheetClose`.
- Giá trị: `.ui-sheet*` — rộng 384px (`sm:max-w-sm`), <640 rộng 100%; nền `popover`, `shadow-400` + `shadow-hairline`; header/thân padding 20; header + footer ngăn 1px `border`; tiêu đề 18/26 600; footer padding 12 20, căn phải, gap 8.

- [ ] **Step 1: Test thất bại (jsdom):** mở → `role="dialog"` trong vùng DS; Esc / ✕ / overlay đóng, focus về trigger; thân cuộn được (`overflow-y-auto`) còn header/footer đứng yên.
- [ ] **Step 2–4:** FAIL → viết → PASS; khối `#sheet` tái tạo "Bộ lọc nâng cao" (dùng `<select>`/`<input type=date>`/checkbox gốc chỉ trong khối demo — Form thật là lát 3, ghi `chuaDo`); cổng: `buoc: [{bam: trigger}]`, `trongVung`; khoá `overlay`, `panel`, `header`, `title`, `desc`, `footer`, `close`; 390 rộng 100%; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Sheet — cạnh phải 384px, header/footer cố định, thân cuộn`

---

## Kết lát 2 (người điều phối)

Cả bộ test + `tsc` + `build` sạch · `node ds/so-khop.mjs <C>` thoát 0 cho cả 11 component (gồm Button) · reviewer độc lập cả lát · tự chụp `/ds` sáng/tối 1440/390 và mở thử từng overlay bằng tay (bấm/phím) · mời CEO xem qua IP Tailscale (`http://<IP Network của next dev>:3401/ds#<neo>`) · push `rework/v2.0.0` · cập nhật memory.
