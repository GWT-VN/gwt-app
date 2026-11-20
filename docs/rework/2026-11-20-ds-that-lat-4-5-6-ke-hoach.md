# DS thật — Lát 4 · 5 · 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng 27 component còn lại của DS (Điều hướng, Data view, Trang chi tiết, Phản hồi, Toàn app, Thông báo). Mỗi cái có khối `/ds#<neo>` (bản hàng biến thể) + khối trần ở `/ds/tron` + cổng so khớp artifact thoát 0. CEO gộp ba lát thành một đợt ("làm hết full các lát luôn đi", 20/11) → một kế hoạch, ba đợt agent.

**Architecture:**
- Giữ khuôn lát 1–3: component kiểu shadcn (cva + `radix-ui`) trong `components/ui/`. Giá trị lấy từ khối `.ui-*` (và `.b-*`/`.pD-*` của prototype) trong `ds/nguon/bundle.css` (bản 40).
- Logic **dữ liệu** (tìm, lọc, sắp, URL, phân trang, chọn dòng) ở lại gói `bang/`. DS bơm class qua `giaoDien` và bơm ô chọn qua khe `OChon` mới trong `CauHinh`. Không viết lại logic.
- Hành vi **giao diện** mà `bang/` không có thành component DS mới, chép hành vi từ prototype:
  - kéo / co dãn cột;
  - menu tiêu đề cột `kieu: 'sap' | 'loc'`;
  - ⚙ hiển thị;
  - Kanban, ListView, InlineEdit, RecordPicker, SavedView.
- Khối `/ds` đăng ký qua file riêng từng task `app/ds/_khung/dk-t<N>.ts` (đã dựng sẵn, `khoi.ts`/`hang.ts` đã nối). Không task nào sửa `khoi.ts`/`hang.ts`.

**Tech Stack:**
- Next 16.2 · React 19.2 · Tailwind 4 · `radix-ui` 1.8.1 · cva · Phosphor · `cmdk` 1.1.1.
- **Mới (đã cài, ghim đúng bản):** `@dnd-kit/core` 6.3.1 · `@dnd-kit/sortable` 10.0.0 · `@dnd-kit/utilities` 3.2.2 · `sonner` 2.0.8.
- vitest 4 + jsdom + Testing Library · Chrome headless (cổng so khớp).

**Spec:** `docs/rework/2026-11-19-ds-that-shadcn-chatgpt-thiet-ke.md`.
- Các mục cần: §5.3 (component + chia đôi Data view + tiêu đề cột), §6, §7 lát 4–6.
- Luật component: `apps/web/ds/NGUON.md`, đọc HẾT trước mọi task.
- README + preview từng component: `apps/web/ds/nguon/components/<C>/` (bản 41, chép 20/11). README là đặc tả chi tiết của task.
- Hành vi prototype đã duyệt: `git show origin/prototype/v2-khung:<đường dẫn README ghi>`. Chỉ đọc tham khảo, không chép class `b-*`/`pD-*` vào markup. Dựng bằng utility + token, đo khớp số.
- Luật filter: `docs/CHUAN-FILTER.md`. Gói bảng: `apps/web/bang/README.md`.

## Quyết định người điều phối (ruling)

- **R8 — Không dùng TanStack Table.** README artifact gợi ý TanStack, nhưng sắp/lọc/phân trang chạy phía server qua URL trong `bang/`. Trạng thái cột còn lại chỉ là thứ tự / độ rộng / ẩn hiện → hook `useCotBang` (Task 7), tuần tự hoá được ra URL.
  - Thêm TanStack khi có màn cần sắp/lọc phía máy khách.
  - Kéo đổi chỗ cột và Kanban dùng dnd-kit bản cổ điển, có `KeyboardSensor` + câu đọc tiếng Việt. `@dnd-kit/react` còn 0.x nên không dùng.
- **R9 — `bang/` không import gì ngoài `react` + `next/navigation`** (README gói). Select DS vào `BoLocChon`/`LocNgay` qua khe `OChon?: ComponentType<PropsOChon>` trong `CauHinh`.
  - DS bơm khe này qua `CauHinhBangDs` (Task 6).
  - Không bơm → vẫn `<select>` cũ, màn cũ không đổi.
- **R10 — Toast:** `<Toaster>` của DS (Task 3) đặt TRONG `DsRoot` bởi layout. `/ds` và `/ds/tron` do Task 3 gắn. z = 56 (thang z NGUON); thêm khoá `zIndex` vào so khớp.
- **R11 — Dữ liệu demo** ghi "demo", không PII.
  - SĐT chỉ hiện `•••` + 4 số cuối (RecordPicker).
  - Tên khách/công ty dùng tên giả trung tính ("Công ty Demo An Phát").

## Global Constraints

- **Nhánh và commit**
  - Nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`, app `apps/web`. **Không merge `main`, không push** (người điều phối push).
  - Chỉ `git add` file của mình; không `-A`, không `stash`. Commit gặp `index.lock` → chờ 2s rồi thử lại.
  - Commit tiếng Việt có dấu, prefix conventional, kết bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Sở hữu file — tuyệt đối:** chỉ sửa file liệt kê trong task của mình.
  - File dùng chung chỉ chủ ghi trong bảng **Chủ file dùng chung** được sửa.
  - Cần đổi file không phải của mình → ghi vào báo cáo, không tự sửa.
- **Token và giá trị**
  - Token chỉ trong `[data-ds="v2"]`.
  - Giá trị lấy từ token / khối CSS nguồn. Px trần chỉ khi nguồn gõ đúng số đó (kèm comment nguồn).
  - Không cỡ chữ lẻ ngoài thang DS. Số / mã `tabular-nums`.
  - Icon Phosphor (`regular`; `fill` cho trạng thái đang chọn khi README nói).
- **Overlay**
  - Portal `container={useDsPortal()}`, z theo thang trong NGUON.md.
  - Đóng → focus về phần tử đã mở (hook có sẵn).
  - Tooltip là mô tả thêm, không lặp `aria-label`.
- **Tên prop:** primitive giữ tên shadcn/Radix; component ghép nghiệp vụ dùng tiếng Việt; màu luôn `color`.
- **Server / client** (NGUON):
  - Hằng / chuỗi class ở `*-styles.ts`; hàm thuần ở `lib/` — KHÔNG trong file `'use client'`.
  - Khối `/ds` không `cloneElement`, không truyền hàm từ server sang client component. Demo cần state thì khối là `'use client'`.
- **Tailwind quét `.ts/.tsx` (cả comment, test) và `.md` trong `apps/web`:** không viết chuỗi trông như class có ngoặc nhọn hay dấu ba chấm. Dev 500 → sửa chuỗi + `touch ds/tokens.css`.
- **Khối `/ds`:** mỗi component một file `app/ds/_khoi/khoi-<neo>.tsx`, export:
  - `Khoi<Ten>()`: khối trần, `section id="<neo>"`, đánh `data-so`, cho cổng so khớp;
  - `Khoi<Ten>Hang()`: bản hàng biến thể, dùng `KhoiHang`/`BienThe` của `_khung/tam.tsx`, một hàng mỗi biến thể / trạng thái, mô tả bằng lời cho người đọc, không thuật ngữ code.

  Đăng ký cả hai vào **file `dk-t<N>.ts` của task mình**. README hiện ở mục "Hướng dẫn dùng" tự động (`_khung/readme.ts`). Kiểm README đã hiện.
- **Cổng so khớp** (cwd `apps/web`): `node ds/so-khop.mjs <C> --url http://127.0.0.1:3401` thoát 0.
  - Config: `ds/so-khop/<tên viết thường, không gạch nối>.json`.
  - Mọi lệch có `lyDo` cụ thể; trạng thái preview không có → `chuaDo`.
  - Overlay đo bằng `buoc` (tương tác thật), không bằng `trangThai`. Cú pháp ở đầu `so-khop.mjs`, mẫu ở `ds/so-khop/*.json`.
- **Test:** hành vi ở `components/ui/<ten>.dom.test.tsx` (`// @vitest-environment jsdom`; không jest-dom; `getByRole(…, { name })`). Mỗi hành vi README / prototype nêu thành một test.
- **Xong một task khi:**
  - test của task + cả bộ `npm run test` + `npx tsc --noEmit` sạch;
  - cổng của mọi component trong task thoát 0;
  - tự chụp khối `/ds#<neo>` sáng + tối, khổ 1440 + 390 (overlay mở bằng tương tác thật), tự nhìn ảnh;
  - báo cáo ghi đường dẫn ảnh.
- **Dev server:** 3401 do người điều phối giữ, **không tắt, không khởi động lại**.
- **Luật mới phát hiện:** không sửa `ds/NGUON.md`; ghi cuối báo cáo.

## Chủ file dùng chung

| File | Chủ | Được làm gì |
|---|---|---|
| `bang/*` (mọi file) | Task 6 | khe `OChon` trong `CauHinh` + `BoLocChon`/`LocNgay` dùng khe; thêm export cần cho FilterBar/Pagination/BulkActionBar. Không đổi hành vi mặc định |
| `app/ds/_khung/khung-ds.tsx`, `app/ds/tron/page.tsx` | Task 3 | gắn `<Toaster>` |
| `components/ui/button-variants.ts`, `button.tsx` | Task 8 | thêm trạng thái "đang bật/đang mở" nền `accent` (README DataViewToolbar), không đổi biến thể cũ |
| `components/ui/badge.tsx` | Task 10 | thêm phần `ui-caret` nếu cần cho ô trạng thái; không đổi biến thể cũ |
| `components/ui/tabs.tsx` | Task 1 | — (task khác chỉ dùng) |
| `components/ui/count.tsx` | Task 1 | — |
| `components/ui/toast.tsx` (+ `toast-styles.ts`) | Task 3 | — |
| `components/ui/empty-state.tsx`, `skeleton.tsx`, `banner.tsx` | Task 2 | — |
| `components/ui/table.tsx` + `table-styles.ts` + `use-cot-bang.ts` + `tieu-de-cot.tsx` | Task 7 | — |
| `components/ui/inline-edit.tsx` | Task 10 | — |
| `menu-styles.ts`, `popover.tsx`, `dropdown-menu.tsx`, `dialog*.ts(x)`, `ds-root.tsx`, `control-styles.ts`, `khoi.ts`, `hang.ts`, `tam.tsx` | **không ai** | cần thêm class → đặt trong `*-styles.ts` của mình |

## Review Focus

1. **Bộ gõ tiếng Việt đang ghép chữ** (`isComposing`): Enter / ↑↓ thuộc bộ gõ.
   - Áp ở CommandPalette, RecordPicker, ô sửa chữ InlineEdit, SavedView (Enter lưu), Composer (Enter gửi).
   - → test ở Task 5, 10, 8, 4.
2. **Lựa chọn dòng vượt trang** (BulkActionBar):
   - chọn hết trang → mời chọn toàn bộ;
   - sang trang khác vẫn nói "(gồm cả trang khác)";
   - Esc / "Bỏ chọn" xoá hết;
   - đổi lọc → bỏ chọn.
   - → test ở Task 6 (dùng `KhungChon` thật của `bang/`).
3. **Kéo thả không chuột:** đổi chỗ cột (Table) và chuyển thẻ (Kanban) làm được bằng bàn phím, có câu đọc tiếng Việt. Esc giữa chừng → về chỗ cũ. → test ở Task 7, 13.
4. **Menu / pop trong vùng cuộn ngang của bảng và dưới tiêu đề dính:**
   - menu tiêu đề cột, menu ô InlineEdit, RecordPicker không bị cắt, không bị đè;
   - cuộn trang → menu đóng hoặc bám ô.
   - → đo `elementFromPoint` ở ảnh tự kiểm Task 7, 10, 12.
5. **Khổ 390:**
   - ListView 2 dòng; Kanban cột 82% có snap; Sidebar thành ngăn kéo;
   - BulkActionBar 2–3 dòng, không cuộn ngang giấu nút;
   - CommandPalette sát mép 8px; DetailLayout 1 cột, thuộc tính lên trên.
   - → cổng 390 + ảnh ở các task tương ứng.

---

## Đợt 1 — nền chung (6 task song song)

### Task 1: Tabs (segmented + pill) + Count

**Files:** Create `components/ui/tabs.tsx`, `components/ui/tabs-styles.ts`, `components/ui/count.tsx`, `components/ui/tabs.dom.test.tsx`, `components/ui/count.test.tsx`, `app/ds/_khoi/khoi-tabs.tsx`, `app/ds/_khoi/khoi-count.tsx`, `ds/so-khop/tabs.json`, `ds/so-khop/count.json`. Modify `app/ds/_khung/dk-t1.ts`.

**Interfaces — Produces:**
- `Tabs`, `TabsList` (`variant?: 'segmented' | 'pill'`), `TabsTrigger`, `TabsContent`, `TabsCount` (`color?: 'danger'`). Radix Tabs, `activationMode="automatic"`.
- `TabsList variant="pill"` tràn ngang:
  - cuộn ngang + mặt nạ mờ mép phải 40px khi tràn;
  - prop `thuGon?: boolean` gom tab không vừa vào nút "Thêm ▾" (DropdownMenu DS). Tab đang chọn luôn hiện.
- `Count({ so, className })` + `CountNeo` (bọc `position: relative`):
  - 0 → không render; > 9 → "9+"; `aria-hidden`;
  - viền theo biến `--ui-count-ring`.

**Steps:**
- [ ] **Test:**
  - ←/→ chuyển và kích hoạt;
  - Home/End;
  - chỉ tab chọn `tabIndex=0`;
  - tab `disabled` bị bỏ qua;
  - pill đếm `TabsCount` đọc kèm nhãn;
  - `thuGon` khi hẹp → tab thừa vào menu, chọn từ menu thì tab đó thành đang chọn;
  - Count: 0 / 3 / 12 → ẩn / "3" / "9+".
- [ ] FAIL → viết → PASS.
- [ ] Khối + hàng: segmented (thường, có số, tắt), pill (số danger, tràn có mờ mép, thu gọn "Thêm"), Count trên nút chuông.
  - Cổng `Tabs`, `Count` thoát 0; RovingFocus đo theo luật NGUON lát 3.
- [ ] Commit `feat(ds): Tabs (segmented + pill, thu gọn "Thêm") + Count`.

### Task 2: Skeleton + EmptyState + Banner + StatCard

**Files:** Create `components/ui/skeleton.tsx`, `empty-state.tsx`, `banner.tsx`, `stat-card.tsx`, `feedback-styles.ts`, tests `components/ui/feedback.dom.test.tsx`, khối `khoi-skeleton.tsx`, `khoi-empty-state.tsx`, `khoi-banner.tsx`, `khoi-stat-card.tsx`, configs `skeleton.json`, `emptystate.json`, `banner.json`, `statcard.json`. Modify `dk-t2.ts`.

**Interfaces — Produces:**
- `Skeleton` (`ui-skeleton`, tắt nhấp nháy khi `prefers-reduced-motion`) + `SkeletonDong({ so })` (khung dòng bảng).
- `EmptyState({ icon?, tieuDe, moTa?, children /* nút */, kieu?: 'that' | 'loc' | 'loi' })`.
- `Banner({ color?, children, hanhDong?, onDong? })`: trạng thái cả trang, `role` theo README.
- `StatCard({ nhan, giaTri, donVi?, bienDong?: { so: number; tot: 'tang' | 'giam' }, chan? })` + `StatGrid`:
  - số `tabular-nums`, định dạng vi-VN (dùng `lib/dinh-dang-so.ts` nếu có hàm hợp);
  - biến động có chữ đọc được (không chỉ mũi tên / màu).
- "Nút đang chạy" = `Button loading` đã có: chỉ dẫn trong hàng Skeleton, không dựng lại.

**Steps:**
- [ ] **Test:**
  - Skeleton `aria-hidden`, vùng bọc có `aria-busy`;
  - EmptyState đúng heading + nút;
  - Banner đóng được, focus không rơi mất;
  - StatCard đọc "Doanh thu 1.250.000 ₫, tăng 12% so với tháng trước" (đúng chữ README / preview).
- [ ] FAIL → viết → PASS. Cổng 4 component thoát 0.
- [ ] Commit `feat(ds): Skeleton, EmptyState, Banner, StatCard`.

### Task 3: Toast (Sonner)

**Files:** Create `components/ui/toast.tsx` (`'use client'`), `toast-styles.ts`, `toast.dom.test.tsx`, `app/ds/_khoi/khoi-toast.tsx`, `ds/so-khop/toast.json`. Modify `dk-t3.ts`, `app/ds/_khung/khung-ds.tsx`, `app/ds/tron/page.tsx` (gắn `<Toaster/>`).

**Interfaces — Produces:**
- `Toaster` (Sonner `Toaster` gắn vào container DS, `z-index` 56, vị trí đáy giữa cách đáy 72px).
- Hàm `thongBao`:
  - `thongBao.xong(chu, { hoanTac?: () => void })`: 5s, nút "Hoàn tác";
  - `thongBao.loi(chu, { thuLai?: () => void })`: không tự tắt, `role="alert"`, nút đóng;
  - `thongBao.dangChay(chu, { tienDo?: number })` → trả `id`; `thongBao.xong(chu, { id })` đổi tại chỗ.
  - Hằng / hàm thuần đặt ở `toast-styles.ts`; `thongBao` gọi `toast` của sonner nên ở file client.

**Steps:**
- [ ] **Test (jsdom):**
  - xong → `role="status"`, bấm Hoàn tác gọi hàm và toast đóng;
  - lỗi không tự tắt sau 6s (fake timers), có `role="alert"`;
  - đang chạy → progressbar `aria-valuenow`, đổi sang xong cùng id (một toast, không hai);
  - giảm chuyển động → không trượt.
- [ ] FAIL → viết → PASS.
- [ ] Khối: nút bấm ra 3 loại (khối `'use client'`).
  - Cổng `Toast` dùng `buoc` bấm nút rồi đo `[data-sonner-toast]`; khoá `zIndex` = 56 (đo cả khi Dialog mở: toast nằm DƯỚI hộp).
  - Đo z của Sonner thật trước khi ghi đè (NGUON).
- [ ] Commit `feat(ds): Toast (Sonner) — xong/Hoàn tác, lỗi/Thử lại, đang chạy; z 56`.

### Task 4: Breadcrumb + PageHeader + PropertyList + Timeline + Composer

**Files:** Create `components/ui/breadcrumb.tsx`, `page-header.tsx`, `property-list.tsx`, `timeline.tsx`, `composer.tsx`, `detail-styles.ts`, tests `components/ui/chi-tiet.dom.test.tsx`, khối `khoi-breadcrumb.tsx`, `khoi-page-header.tsx`, `khoi-property-list.tsx`, `khoi-timeline.tsx`, `khoi-composer.tsx`, 5 config tương ứng. Modify `dk-t4.ts`.

**Interfaces — Produces** (Task 11 DetailLayout ghép lại):
- shadcn `Breadcrumb*` (nav `aria-label="Đường dẫn"`, mục cuối `aria-current="page"`).
- `PageHeader({ duongDan?, tieuDe, meta?, hanhDong? })`.
- `PropertyList` + `PropertyRow({ nhan, children })` (dl / dt / dd, rỗng → `ui-props-empty` "Chưa có").
- `Timeline` + `TimelineDay` + `TimelineItem({ loai, ai, luc, children, tep? })` + "Xem thêm".
- `Composer({ onGui, dangGui?, tep? })`: textarea tự cao, Ctrl/⌘+Enter gửi (theo README), Enter khi `isComposing` không gửi, trống không gửi.

**Steps:**
- [ ] **Test:**
  - breadcrumb `aria-current`;
  - PropertyList ô rỗng ghi "Chưa có";
  - Composer: phím gửi đúng README, đang ghép chữ không gửi, trống → nút tắt, đang gửi → `aria-busy`;
  - Timeline "Xem thêm" mở thêm mục, focus vào mục mới đầu tiên.
- [ ] FAIL → viết → PASS. Cổng 5 component thoát 0.
- [ ] Commit `feat(ds): Breadcrumb, PageHeader, PropertyList, Timeline, Composer`.

### Task 5: CommandPalette (cmdk)

**Files:** Create `components/ui/command-palette.tsx`, `command-styles.ts`, `command-palette.dom.test.tsx`, `lib/phim-tat.ts` (nhận Mac / không Mac), `app/ds/_khoi/khoi-command-palette.tsx`, `ds/so-khop/commandpalette.json`. Modify `dk-t5.ts`.

**Interfaces — Produces:**
- `CommandPalette({ open, onOpenChange, nhom: { ten, icon?, muc: MucLenh[] }[], onChon, onHoiBap? })` + hook `usePhimMoLenh(setOpen)` (Ctrl K / ⌘K).
  - `MucLenh = { id, ten, phu?, truong: string[] /* các trường để khớp */ }`.
- Khớp không dấu bằng `boDau`/`chuanHoaTuKhoa` của `bang/`, từng trường so riêng. SĐT bỏ `.`/`-`/khoảng trắng trước khi khớp. Mỗi nhóm tối đa 5 dòng + tổng số khớp. Đoạn khớp bọc `mark` đậm 600.
- Dùng lại cách kiểm soát `value` + gắn lại `aria-activedescendant` của `combobox.tsx` (NGUON: cmdk 1.1.1).

**Steps:**
- [ ] **Test:**
  - Ctrl+K mở (Mac giả lập: ⌘K), chữ chân ghi đúng phím theo nền tảng;
  - "sen vang" khớp "Sen Vàng"; "0909.123" khớp "0909 123 456";
  - nhóm cắt 5 + số tổng đọc qua `role="status"`;
  - không thấy → câu gợi ý + "Hỏi Bắp" ngoài listbox;
  - đang ghép chữ thì Enter / ↑↓ không chọn;
  - Esc đóng, focus về nút mở.
- [ ] FAIL → viết → PASS.
- [ ] Cổng `CommandPalette` (buoc mở bằng nút) 1440 + 390 (sát mép 8px, cao hết màn, chân ẩn) thoát 0.
- [ ] Commit `feat(ds): CommandPalette — Ctrl/⌘K, khớp không dấu, SĐT, nhóm 5 dòng`.

### Task 6: Nối `bang/` vào DS — FilterBar + Pagination + BulkActionBar

**Files:**
- Create `components/ui/bang-styles.ts` (`GIAO_DIEN_DS: GiaoDienBang`, mọi khoá).
- Create `components/ui/bang-ds.tsx` (`'use client'`: `CauHinhBangDs` = `CauHinhBang` + `giaoDien` DS + `OChon` DS) và `components/ui/bang-ds.dom.test.tsx`.
- Create khối `khoi-filter-bar.tsx`, `khoi-pagination.tsx`, `khoi-bulk-action-bar.tsx`, configs `filterbar.json`, `pagination.json`, `bulkactionbar.json`.
- Modify `bang/CauHinh.tsx`, `bang/BoLocChon.tsx`, `bang/LocNgay.tsx`, `bang/README.md`, `bang/index.ts`, `dk-t6.ts`.

**Interfaces:**
- **Consumes:** `Select*` DS (lát 3), `Button` / `Tooltip` DS.
- **Produces:**
  - `CauHinh.OChon?: ComponentType<{ value: string; onValueChange(v: string): void; muc: { giaTri: string; nhan: string }[]; nhanTatCa: string; 'aria-label': string }>`.
  - `CauHinhBangDs({ tenCot?, nghiaSapXep?, children })`.
  - `GIAO_DIEN_DS` khớp bảng "Khoá giaoDien" trong README FilterBar / Pagination / BulkActionBar. Khoá `tieuDe_*` khớp `.ui-th-sort` cho màn cũ dùng `TieuDeCotSapXep`.
- Khối demo chạy `bang/` THẬT (cần `Suspense` + tham số URL), không vẽ tay lại.

**Steps:**
- [ ] **Test:**
  - không bơm `OChon` → `BoLocChon` vẫn render `<select>` (màn cũ không đổi);
  - có `CauHinhBangDs` → `combobox` DS, chọn mục đẩy URL đúng param + xoá `trang`;
  - chip × bỏ đúng một điều kiện;
  - Pagination 1 trang → không render; nút đầu / cuối `disabled` (không ẩn);
  - BulkActionBar theo Review Focus 2;
  - thanh `role="toolbar"`, số `aria-live`; ≤640 không tràn ngang (đo bằng ảnh).
- [ ] FAIL → viết → PASS.
- [ ] `npm run test` toàn bộ: test cũ của `bang/` vẫn xanh.
- [ ] Cổng `FilterBar`, `Pagination`, `BulkActionBar` thoát 0. DOM `bang/` khác preview → so theo số đo phần tử tương ứng (spec §5.3).
- [ ] Commit `feat(ds): nối bang/ vào DS — giaoDien DS, khe OChon, FilterBar, Pagination, BulkActionBar`.

---

## Đợt 2 — Data view, khung, thông báo (5 task song song, sau khi đợt 1 xanh)

### Task 7: Table

**Files:** Create `components/ui/table.tsx`, `table-styles.ts`, `use-cot-bang.ts`, `tieu-de-cot.tsx`, `table.dom.test.tsx`, `app/ds/_khoi/khoi-table.tsx`, `ds/so-khop/table.json`. Modify `dk-t7.ts`.

**Interfaces:**
- **Consumes:** DropdownMenu, Badge, Checkbox, Skeleton / EmptyState (Task 2), Alert, `KhungChon`/`OChonDong` (`bang/`), Pagination (Task 6).
- **Produces:**
  - shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter` + `TableWrap` (cuộn ngang trong khung, header dính, thanh cuộn ẩn).
  - `useCotBang(cot: CotBang[], { url?: boolean })` → `{ thuTu, doRong, an, doiCho, coDan, datLai, anHien }`.
    - `CotBang = { id, ten, rong, toiThieu?: number /* mặc định 56 */, kieu: 'sap' | 'loc' | 'thuong', khoa?: boolean }`.
    - `url: true` → tuần tự hoá ra tham số (đọc / ghi `useSearchParams`).
  - `TieuDeCot({ cot, … })`:
    - `kieu: 'loc'` → menu lọc theo tag (tick nhiều + "Bỏ lọc cột này", vẽ `Badge`, kể cả "Chưa phân loại"), KHÔNG có mục sắp;
    - `kieu: 'sap'` → mục sắp nói nghĩa bằng lời;
    - kéo đổi chỗ (dnd-kit sortable ngang, bàn phím) + tay co dãn `role="separator"` (←/→ 8px, nhấp đúp về mặc định);
    - một lớp hover.
  - `BangTrangThai({ trangThai: 'tai' | 'rongLoc' | 'rongThat' | 'loi', … })`.
- `ListView` (Task 12) dùng lại `TieuDeCot` + `useCotBang`.

**Steps:**
- [ ] **Test:**
  - **cột `kieu: 'loc'` khai sắp → test chặn** (lỗi kiểu ở `tsc` + runtime ném lỗi dev);
  - menu lọc tick nhiều giữ menu mở;
  - `aria-sort` đúng nghĩa;
  - co dãn bằng phím, tối thiểu 56, nhấp đúp về mặc định;
  - đổi chỗ bằng phím (Space nhấc, →, Space thả) + câu đọc, Esc huỷ;
  - 4 trạng thái (đang tải `aria-busy`, rỗng lọc có "Xoá bộ lọc", rỗng thật, lỗi giữ dữ liệu cũ + "Thử lại");
  - dòng chọn nền info-soft.
- [ ] FAIL → viết → PASS.
- [ ] Khối (`'use client'`, 30 dòng ticket demo): 8 cột mặc định theo README, vừa 944px; menu cột thật; 390 cuộn ngang trong khung, trang không tràn.
- [ ] Cổng `Table` thoát 0 + ảnh menu cột đang mở (đo `elementFromPoint` không bị header dính đè).
- [ ] Commit `feat(ds): Table — tiêu đề cột lọc/sắp, kéo đổi chỗ + co dãn bằng phím, 4 trạng thái`.

### Task 8: DataViewToolbar + SavedView (+ khung xem nhanh)

**Files:** Create `components/ui/data-view-toolbar.tsx`, `saved-view.tsx`, `xem-nhanh.tsx`, `toggle-group.tsx` (shadcn ToggleGroup + Toggle), `data-view-styles.ts`, `data-view.dom.test.tsx`, khối `khoi-data-view-toolbar.tsx`, `khoi-saved-view.tsx`, configs `dataviewtoolbar.json`, `savedview.json`. Modify `button-variants.ts`/`button.tsx` (trạng thái bật), `dk-t8.ts`.

**Interfaces:**
- **Consumes:** Tabs pill (T1), Input, Popover, Checkbox, Tooltip, Toast (T3), `OTimKiem` (`bang/`, qua `CauHinhBangDs`).
- **Produces:**
  - `DataViewToolbar({ tieuDe, dem: { thay, tong }, timKiem, nutChinh, tabs, dangXem, onDoiXem, xemNhanh, onXemNhanh, caiDat })`.
    - Dạng xem = `ToggleGroup type="single"`, `role="radiogroup"`.
    - Xem nhanh = `Toggle` `aria-pressed`, mặc định tắt.
  - ⚙ `CaiDatHienThi`: Popover có trang con với nút ← (Bố cục · Cột hiển thị · Lọc · Sắp xếp · Nhóm theo · Sao chép link view · Lưu view · Xuất Excel). Mục "Sắp xếp" chỉ liệt kê cột `kieu: 'sap'`. ≤640 thành Sheet đáy.
  - `SavedView` popover:
    - tên bắt buộc ≤ 40, focus sẵn, lỗi `ui-error` đúng chữ;
    - chia sẻ;
    - Enter lưu (không khi đang ghép chữ);
    - lưu → `thongBao.xong`.
    - Prop `onLuu({ ten, chiaSe, query })`; không đụng DB (bảng `saved_views` để sau).
  - `XemNhanh` khung thẻ nổi 440px nhường chỗ (không che), ↑↓ lướt, Esc đóng. Nội dung để trống có chú "chưa chốt".

**Steps:**
- [ ] **Test:**
  - đổi dạng xem giữ tab / lọc;
  - ⚙ trang con có ← và focus về mục đã mở;
  - SavedView trống → lỗi, đủ → `onLuu` + toast;
  - nút icon có `aria-label` + tooltip khi focus;
  - Button trạng thái bật (`aria-pressed=true` / `data-state=on` / `aria-expanded=true`) nền `accent`.
- [ ] FAIL → viết → PASS.
- [ ] Cổng `DataViewToolbar`, `SavedView` thoát 0, cổng `Button` vẫn 0.
- [ ] Commit `feat(ds): DataViewToolbar, SavedView, khung xem nhanh; Button trạng thái bật`.

### Task 9: Sidebar (khung F)

**Files:** Create `components/ui/sidebar.tsx`, `sidebar-styles.ts`, `sidebar.dom.test.tsx`, `app/ds/_khoi/khoi-sidebar.tsx`, `ds/so-khop/sidebar.json`. Modify `dk-t9.ts`.

**Interfaces:**
- **Consumes:** Tooltip (side right), DropdownMenu, Sheet (trái, mobile), Count (T1), Avatar.
- **Produces:** `KhungApp({ khu: Khu[], khuDangChon, onChonKhu, menu: MucMenu[], boLocDaLuu?, ganDay?, bap?: ReactNode, children })`.
  - `Khu = { id, ten, icon, mau, gap?: boolean, sapCo?: boolean }`.
  - `MucMenu = { id, ten, href, dem?: number, dangO?: boolean }`.
- Thông số đúng bảng README: rail 52 · panel 288 · item 30 · tooltip phải icon hiện cả khi focus phím. ≤768 ngăn kéo trái + thanh trên 52.
- **KHÔNG thay `components/TopNav*.tsx`** (file dùng chung, báo trước theo luật repo).

**Steps:**
- [ ] **Test:**
  - icon khu `aria-current`, đổi khu → panel đổi menu;
  - "Tất cả khu" `aria-expanded`, khu `sapCo` không bấm được và ghi "sắp có";
  - item đang ở `aria-current="page"`;
  - tooltip hiện khi Tab tới;
  - mobile nút mở menu → Sheet, Esc đóng về nút.
- [ ] FAIL → viết → PASS.
- [ ] Cổng `Sidebar` 1440 + 390 thoát 0.
- [ ] Commit `feat(ds): Sidebar khung F — thanh khu, panel menu, ngăn kéo điện thoại`.

### Task 10: InlineEdit + RecordPicker

**Files:** Create `components/ui/inline-edit.tsx`, `record-picker.tsx`, `inline-edit-styles.ts`, `inline-edit.dom.test.tsx`, `record-picker.dom.test.tsx`, khối `khoi-inline-edit.tsx`, `khoi-record-picker.tsx`, configs `inlineedit.json`, `recordpicker.json`. Modify `badge.tsx` (nếu cần caret), `dk-t10.ts`.

**Interfaces:**
- **Consumes:** DropdownMenu (RadioGroup), Combobox, DatePicker / Calendar, Input, Badge, Toast (T3), Popover, cmdk.
- **Produces:**
  - `OSuaNhan`, `OSuaTrangThai` (Badge soft + caret trong; "Chờ" hỏi lý do chờ: khách · KT · vật tư · hãng · duyệt), `OSuaChu` (Enter lưu, Esc huỷ, blur lưu, `isComposing`), `OSuaHan` (giữ giờ cũ), `OSuaNguoi` (Combobox; ô < 112px chỉ avatar).
  - Mỗi ô:
    - `aria-label="Sửa <trường> <mã>"`;
    - chặn nổi bọt lên dòng;
    - lưu lạc quan + `thongBao.xong` có Hoàn tác; lỗi → trả giá trị cũ + `thongBao.loi`.
  - `RecordPicker({ muc: BanGhi[] | tìm xa, onChon, onTaoMoi })`:
    - 3 dòng / mục, SĐT `•••` + 4 số cuối;
    - khớp không dấu mọi trường;
    - đếm "N khách khớp · Enter chọn dòng đầu";
    - chân "+ Tạo khách mới "…"";
    - listbox / option `aria-selected`.

**Steps:**
- [ ] **Test:**
  - mỗi kiểu ô một test lưu + một test huỷ;
  - Hoàn tác trả giá trị;
  - lỗi trả giá trị cũ;
  - menu Esc trả focus về ô;
  - RecordPicker khớp "an phat" / mã / 4 số cuối, Enter chọn dòng đầu, ghép chữ không chọn, không bao giờ render SĐT đủ.
- [ ] FAIL → viết → PASS. Cổng 2 component thoát 0.
- [ ] Commit `feat(ds): InlineEdit (nhãn, trạng thái, chữ, hạn, người) + RecordPicker`.

### Task 11: DetailLayout + NotificationCenter + NotificationMatrix

**Files:** Create `components/ui/detail-layout.tsx`, `notification-center.tsx`, `notification-matrix.tsx`, `notif-styles.ts`, `notification.dom.test.tsx`, `detail-layout.test.tsx`, khối `khoi-detail-layout.tsx`, `khoi-notification-center.tsx`, `khoi-notification-matrix.tsx`, configs `detaillayout.json`, `notificationcenter.json`, `notificationmatrix.json`. Modify `dk-t11.ts`.

**Interfaces:**
- **Consumes:** T4 (PageHeader, PropertyList, Timeline, Composer), Tabs pill + Count (T1), EmptyState (T2), Popover, Switch / Checkbox / Select.
- **Produces:**
  - `DetailLayout({ chinh, ben })`: lưới `1fr 280px` gap 40; ≤960 một cột, thuộc tính lên trên, hết sticky.
  - `NotificationCenter({ thongBao, onDoc, onDocHet, onCauHinh })`:
    - Popover `modal={false}`;
    - mở → focus tab đang chọn;
    - Tab ra ngoài / Esc → đóng, focus về chuông;
    - tab Chưa đọc giữ dòng vừa đọc tới khi đổi tab;
    - nhóm Hôm nay / Hôm qua / Cũ hơn theo giờ VN.
  - `NotificationMatrix({ loai, kenh, giaTri, onDoi, onLuu })`: bảng loại × kênh, caption sr-only, ô không áp dụng ghi rõ.

**Steps:**
- [ ] **Test:**
  - NotificationCenter theo đủ mục a11y README;
  - "Đọc hết" chỉ đánh loại đang hiện;
  - thông báo mới → `role="status"`;
  - nhóm ngày đúng lúc 00:30 giờ VN (`process.env.TZ` trong `vi.hoisted`);
  - Matrix: mỗi switch có tên "loại · kênh", lưu gọi `onLuu` với thay đổi;
  - DetailLayout thứ tự DOM đúng (thuộc tính trước nội dung chỉ ở ≤960 bằng CSS order, đọc màn hình đúng thứ tự logic).
- [ ] FAIL → viết → PASS. Cổng 3 component thoát 0.
- [ ] Commit `feat(ds): DetailLayout, NotificationCenter, NotificationMatrix`.

---

## Đợt 3 — dạng xem (2 task song song, sau khi đợt 2 xanh)

### Task 12: ListView

**Files:** Create `components/ui/list-view.tsx`, `list-view-styles.ts`, `list-view.dom.test.tsx`, `app/ds/_khoi/khoi-list-view.tsx`, `ds/so-khop/listview.json`. Modify `dk-t12.ts`.

**Interfaces:**
- **Consumes:** `TieuDeCot` + `useCotBang` (T7), InlineEdit (T10), Badge, ContextMenu, Avatar.
- **Produces:** `ListView({ cot, dong, nhom?, onMo, menuDong })`:
  - lưới CSS (`role="table"` / `row` / `columnheader`);
  - dòng `tabIndex=0`, Enter mở, Shift+F10 / phím Menu mở ContextMenu;
  - bấm ô → InlineEdit, bấm chỗ trống / mã → `onMo`;
  - container query ≤860 / ≤480 theo README;
  - tiêu đề gộp "Ticket · ưu tiên gấp trước" với menu sắp (ưu tiên / thứ tự tạo) + lọc (ưu tiên, loại lỗi).

**Steps:**
- [ ] **Test:**
  - Enter mở, bấm ô không mở;
  - Shift+F10 mở menu;
  - tiêu đề gộp không có mục sắp theo loại lỗi;
  - nhóm theo có tiêu đề nhãn + số.
- [ ] FAIL → viết → PASS.
- [ ] Cổng `ListView` 1440 + 390 (2 dòng) thoát 0.
- [ ] Commit `feat(ds): ListView — một dòng/bản ghi, sửa tại ô, nhóm, 2 dòng trên điện thoại`.

### Task 13: KanbanBoard

**Files:** Create `components/ui/kanban-board.tsx`, `kanban-styles.ts`, `kanban-board.dom.test.tsx`, `app/ds/_khoi/khoi-kanban-board.tsx`, `ds/so-khop/kanbanboard.json`. Modify `dk-t13.ts`.

**Interfaces:**
- **Consumes:** Card, Badge, Avatar, ContextMenu, Toast (T3), EmptyState (T2), Dialog / Select (lý do chờ), dnd-kit.
- **Produces:** `KanbanBoard({ cot: { id, nhan, color }[], the, onChuyen(id, cotMoi, lyDo?), onMo, menuThe })`:
  - kéo đa cột (dnd-kit core + sortable, `KeyboardSensor`, câu đọc tiếng Việt);
  - menu "Chuyển sang…" trong ContextMenu cho người không kéo;
  - vào cột "Chờ" hỏi lý do (Huỷ = về chỗ cũ);
  - chuyển xong → toast Hoàn tác;
  - cột rỗng "Kéo thẻ vào đây";
  - 390: cột 82%, cuộn ngang có snap.

**Steps:**
- [ ] **Test:**
  - chuyển bằng phím (Space nhấc, → sang cột, Space thả) gọi `onChuyen`;
  - Esc giữa chừng về chỗ cũ;
  - "Chuyển sang…" chạy được;
  - cột Chờ hỏi lý do, Huỷ không gọi `onChuyen`;
  - Hoàn tác trả về cột cũ.
- [ ] FAIL → viết → PASS. Cổng `KanbanBoard` thoát 0.
- [ ] Commit `feat(ds): KanbanBoard — kéo đa cột có bàn phím, lý do chờ, Hoàn tác`.

---

## Thứ tự chạy (người điều phối)

| Đợt | Task | Song song |
|---|---|---|
| 1 | 1 · 2 · 3 · 4 · 5 · 6 | 6 |
| 2 | 7 · 8 · 9 · 10 · 11 | 5 |
| 3 | 12 · 13 | 2 |

- **Review:**
  - mỗi đợt một reviewer độc lập opus soát mọi task của đợt theo plan + spec + README;
  - Critical / Important → implementer của task đó sửa → re-review phạm vi.
- **Push** sau mỗi đợt xanh.

## Kết (người điều phối)

- Cả bộ test + `tsc` + `build` sạch.
- Cổng so khớp thoát 0 cho cả 50 component.
- Reviewer độc lập cả ba lát.
- Ảnh tự kiểm từng khối mới (sáng / tối, 1440 / 390, overlay mở thật), tự nhìn.
- Gom luật mới vào `NGUON.md` + bảng sha nguồn bản 41.
- Artifact: code đúng hơn → đồng bộ ngược (đọc mới, LF, `design-system.json` cuối).
- Mời CEO xem `http://100.93.1.35:3401/ds#<neo>`.
- Push + memory.
