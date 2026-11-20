# DS thật — Lát 7: menu thuộc tính kiểu Linear + chọn hạn có giờ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa vào DS những thứ CEO đã duyệt ở prototype ngày 20/11: menu con + phím tắt + dấu ✓ cho menu, dòng bảng đang trỏ + chọn nhiều bằng Ctrl/⇧ + phím tắt theo dòng, ô chọn hạn có giờ (A4, chỉ lưu khi Xong), và một khối mẫu ghép "Menu thuộc tính" trên `/ds`.

**Architecture:** Khuôn lát 1–6 giữ nguyên (component kiểu shadcn: cva + `radix-ui` trong `components/ui/`, khối `/ds` qua `app/ds/_khung/dk-*.ts`). Khác lát trước: ba thứ mới **không có bản artifact** để so — nguồn là prototype đã duyệt (commit dưới) + token/class DS sẵn có. Cổng so khớp chạy lại cho các component bị sửa (DropdownMenu, ContextMenu, Table, DatePicker) để chắc không vỡ cái cũ.

**Tech Stack:** Next 16.2 · React 19.2 · Tailwind 4 · `radix-ui` 1.8.1 · cva · Phosphor · react-day-picker 10.0.2 · sonner 2.0.8 · vitest 4 + jsdom · Chrome headless (cổng so khớp + script CDP).

**Spec (thay design doc — CEO duyệt bằng prototype, 20/11):**
- Chọn hạn có giờ: `apps/web/app/prototype/chon-gio/` — **A4** (`_chon-gio/bien-the-a4.tsx`, commit `99ec5c7`). Xem `?variant=A4`.
- Menu thuộc tính: `apps/web/app/prototype/menu-thuoc-tinh/` (commit `9896fd8` + `a7ed69d`). Báo cáo "DS thiếu" của prototype là danh sách việc của lát này.
- Luật DS: `apps/web/ds/NGUON.md` (đọc HẾT trước mọi task). Luật lọc: `docs/CHUAN-FILTER.md` (>10 mục → gõ để tìm). Gói bảng: `apps/web/bang/README.md`.

## Quyết định đã chốt (CEO, 20/11)

- Ô chọn hạn = **A4**: đầu pop hai ô gõ [ngày][giờ], lịch bên dưới đồng bộ hai chiều với ô ngày, chân pop **Xoá** (trái) · **Huỷ** + **Xong** (phải).
- **Chỉ lưu khi Xong** (hoặc Enter ở ô ngày/ô giờ). Huỷ / Esc / bấm ra ngoài = bỏ nháp. Xoá có hiệu lực ngay. Ô ngày gõ sai → Xong tắt.
- Ngày đã qua bị tắt trong lịch; ngày của hạn đang có vẫn hiện và chọn lại được.
- Menu thuộc tính học Linear: mục = icon + nhãn + phím tắt + ▸; menu con có ✓ ở giá trị đang có; ba cách mở (chuột phải dòng, nút …, phím khi đang trỏ dòng); chọn nhiều → đầu menu "N ticket", áp cả vùng; mỗi lần đổi có toast "Hoàn tác".

## Quyết định người điều phối (ruling)

- **R13 — Giờ mặc định là prop**, `gioMacDinh` mặc định `'17:30'` (CEO **chưa chốt** con số — đổi một chỗ). Ô giờ trống hiện `17:30` dạng placeholder mờ để người dùng biết sẽ lấy giờ nào (sửa điểm prototype còn thiếu).
- **R14 — Menu con trên màn hẹp:** v1 chỉ đảm bảo không tràn ngang (`collisionPadding` theo `--menu-gutter`, SubContent `max-w` = viewport trừ lề). Kiểu "drill-in" (menu con thay chỗ menu cha) để mở — ghi NGUON "đang mở", làm khi có màn mobile thật.
- **R15 — Phím tắt theo vùng** sống ở `lib/phim-tat.ts` (đã có `laMac`, `laPhimMoLenh`) — không thêm thư viện. Bỏ qua khi focus ở ô nhập/`contenteditable`, khi có Ctrl/Meta/Alt (trừ khi khai báo), khi đang ghép chữ IME.
- **R16 — Chọn nhiều Ctrl/⇧ + bấm** là logic dữ liệu → ở `bang/ChonDong.tsx` (R9 vẫn áp: `bang/` không import ngoài `react` + `next/navigation`). Bảng DS chỉ thêm kiểu dòng đang trỏ.
- **R17 — Ô giờ thành component DS `TimeInput`** (nâng từ `o-gio.tsx` của prototype): gõ `1430`/`14:30`/`9`, ↑/↓ gợi ý, Enter chốt, không chốt khi IME đang ghép.
- R8–R12 lát 4–6 vẫn áp (không TanStack, `bang/` thuần, Toaster trong DsRoot z56, demo không PII, toast xong không `role=status`).

## Global Constraints

- Nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`, app `apps/web`. **Không merge `main`, không push** (người điều phối push). Chỉ `git add` file của mình; không `-A`, không `stash`. Gặp `index.lock` → chờ 2s thử lại. Commit tiếng Việt có dấu, prefix conventional, kết bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Sở hữu file tuyệt đối:** chỉ sửa file liệt kê trong task. Cần đụng file khác → ghi báo cáo.
- Token chỉ trong `[data-ds="v2"]`; giá trị từ token / class `*-styles.ts` sẵn có; px trần chỉ khi có lý do ghi comment. Số/mã `tabular-nums`. Icon Phosphor.
- Overlay: portal `container={useDsPortal()}`, z theo thang NGUON; đóng → focus về chỗ mở; overlay phải `preventDefault` Esc (bảng nghe Esc ở window).
- Bẫy đã trả giá (NGUON): `outline-none` + `focus-visible:outline-*` mất vòng focus; Tooltip/ContextMenuTrigger `asChild` đè `data-state` → tin `aria-*`; `sr-only`/absolute trong vùng cuộn cần tổ tiên `relative`; Radix Popper 0-size trong jsdom; Chrome bắn focusout khi gỡ phần tử còn jsdom thì không.
- Dev server dùng chung `http://127.0.0.1:3401` (đang chạy) — không bật server khác, không `pkill`/`killall node`, không đăng nhập.
- Kiểm trước khi báo: `npx tsc --noEmit`, `npx vitest run` CẢ BỘ (nêu ca hỏng nếu có), `npx eslint <file của mình>`; khối `/ds` mở được (curl 200, hydrate); bấm thử thật bằng Chrome headless CDP (khuôn script: `C:\Users\Duncr\AppData\Local\Temp\claude\d2fa843791a29a0f\9d5dc202-19a7-43e4-bf9a-2b7a84a1d1c8\scratchpad\menu-tt\cdp.mjs` — chép sang thư mục scratchpad riêng của task).

## Review Focus

1. Nháp của ô chọn hạn bị rò: đổi ngày rồi Esc / bấm ra ngoài / Huỷ mà giá trị vẫn đổi; hoặc mở lại pop thấy nháp cũ thay vì giá trị thật.
2. Phím tắt dòng bắn nhầm khi đang gõ trong ô tìm của menu con, trong ô nhập của trang, hoặc khi IME tiếng Việt đang ghép (`p` trong "phương").
3. Menu con mở bằng bàn phím: → mở, ← đóng về mục cha, focus vào mục đang ✓ (hoặc ô tìm), Esc đóng hết và focus về dòng.
4. Chọn nhiều: mở menu trên dòng ngoài vùng chọn chỉ áp dòng đó; Hoàn tác khôi phục đúng từng giá trị cũ khác nhau.
5. Cổng so khớp DropdownMenu / ContextMenu / Table / DatePicker vẫn thoát 0 sau khi sửa.

Mỗi dòng trên có test ở task sở hữu (ghi ở bước test của task).

## Chủ file dùng chung

| File | Chủ |
|---|---|
| `components/ui/menu-styles.ts`, `dropdown-menu.tsx`, `context-menu.tsx` | Task 1 |
| `lib/phim-tat.ts`, `bang/ChonDong.tsx`, `components/ui/table.tsx`, `table-styles.ts` | Task 2 |
| `components/ui/calendar.tsx`, `date-picker.tsx` (chỉ đọc, trừ khi cần export thêm — ghi báo cáo) | Task 3 |
| `app/ds/_khung/khoi.ts`, `hang.ts`, `NGUON.md` | Người điều phối |

---

### Task 1: Menu con + ContextMenu đủ bộ + phím tắt + ✓ một phần

**Files:**
- Modify: `components/ui/menu-styles.ts`, `components/ui/dropdown-menu.tsx`, `components/ui/context-menu.tsx`
- Modify: `app/ds/_khoi/khoi-dropdown-menu.tsx`, `app/ds/_khoi/khoi-context-menu.tsx` (thêm ví dụ menu con; giữ nguyên ví dụ cũ để cổng so khớp không lệch)
- Modify: `ds/nguon/components/DropdownMenu/README.md`, `ds/nguon/components/ContextMenu/README.md` (mục "Menu con · phím tắt · một phần", ghi "thêm ở repo 20/11, chưa có trong artifact")
- Test: `components/ui/menu-con.dom.test.tsx`

**Interfaces — Produces:**
- `DropdownMenuSub`, `DropdownMenuSubTrigger({ icon?, phim?, children })`, `DropdownMenuSubContent`; tương tự `ContextMenuSub*`.
- ContextMenu thêm: `ContextMenuGroup`, `ContextMenuCheckboxItem`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuShortcut`.
- `*CheckboxItem` nhận `checked: boolean | 'indeterminate'` → hiện ✓ hoặc dấu – (`aria-checked="mixed"`).
- `*Shortcut` nhận thêm `phim?: string[]` → render `KbdGroup` + `Kbd` (`components/ui/kbd.tsx`) thay chữ; không truyền thì giữ hành vi cũ.
- `MenuTimKiem({ value, onValueChange, placeholder })` — ô gõ ở đầu SubContent: focus khi mở, gõ chữ ở mục cha chuyển vào ô (chặn typeahead Radix), ↓ vào danh sách, Enter chọn mục đầu khi danh sách còn 1.
- Class mới trong `menu-styles.ts`: `menuSubTrigger` (giữ nền như hover khi `data-state=open`), `menuSubContent` (= `menuContent`), hằng `MENU_SUB = { alignOffset: -6 /* = --menu-gutter */, sideOffset: 4 }`.

- [ ] **Step 1: Viết test hỏng** — `menu-con.dom.test.tsx`: (a) SubTrigger có `aria-haspopup="menu"`, mở bằng `ArrowRight`, đóng bằng `ArrowLeft` focus về trigger; (b) `CheckboxItem checked="indeterminate"` có `aria-checked="mixed"` và hiện dấu –; (c) `Shortcut phim={['⇧','D']}` render 2 `kbd`; (d) `MenuTimKiem`: gõ "minh" lọc, phím chữ ở mục cha đi vào ô tìm, phím `p` trong ô tìm KHÔNG kích hoạt typeahead; (e) ContextMenu có đủ Checkbox/Radio/Shortcut như Dropdown.
- [ ] **Step 2:** chạy `npx vitest run components/ui/menu-con.dom.test.tsx` → FAIL.
- [ ] **Step 3: Cài đặt** theo Interfaces. Ghép primitive `radix-ui` (`DropdownMenu.Sub*`, `ContextMenu.Sub*`); portal + z như Content hiện có; R14 (`collisionPadding`, `max-w`).
- [ ] **Step 4:** test file mới PASS; cả bộ `npx vitest run` PASS.
- [ ] **Step 5: Khối /ds** — thêm ví dụ "Menu con" vào hai khối (Ưu tiên với icon cột tín hiệu đủ đậm để phân biệt Cao/Vừa/Thấp — prototype bị mờ; Người làm 12 người demo có `MenuTimKiem`; Nhãn checkbox có một phần). Cổng: `timeout 1500 node ds/so-khop.mjs DropdownMenu --url http://127.0.0.1:3401` và `ContextMenu` → thoát 0 (lỗi chạy ghi đè `.md` → `git diff` trước commit).
- [ ] **Step 6: Commit** `feat(ds): menu con, phím tắt Kbd, ✓ một phần cho DropdownMenu/ContextMenu`.

### Task 2: Bảng — dòng đang trỏ, chọn nhiều Ctrl/⇧, phím tắt theo dòng

**Files:**
- Modify: `lib/phim-tat.ts` (+ test `lib/phim-tat.test.ts` nếu chưa có thì tạo)
- Modify: `bang/ChonDong.tsx` (+ test cùng thư mục), `bang/README.md` (mục chọn nhiều)
- Modify: `components/ui/table.tsx`, `components/ui/table-styles.ts`
- Modify: `app/ds/_khoi/khoi-table.tsx` (thêm ví dụ "Dòng đang trỏ + phím tắt")
- Test: `components/ui/table-con-tro.dom.test.tsx`

**Interfaces — Produces:**
- `usePhimTat(ban: Record<string, (e: KeyboardEvent) => void>, opts?: { vung?: RefObject<HTMLElement | null>; bat?: boolean })` — khoá dạng `'p'`, `'shift+d'`, `'mod+k'`; chỉ bắn khi focus nằm trong `vung` (không có `vung` → cả trang); bỏ qua ô nhập/contenteditable/IME (`isComposing`), và có modifier không khai báo.
- `laOGo(el: Element | null): boolean` (export để chỗ khác dùng lại).
- `ChonDong`: hàm thuần `chonTheoBam(dangChon: string[], neo: string | null, ma: string, thuTu: string[], phim: { mod: boolean; shift: boolean }): { chon: string[]; neo: string }` — Ctrl/⌘ bật-tắt 1 dòng, ⇧ chọn dải từ `neo`, bấm thường không đổi vùng chọn (chỉ dời con trỏ). Component dùng hàm này; hành vi cũ (checkbox) giữ nguyên.
- `TableRow` thêm prop `conTro?: boolean` → `data-con-tro` + kiểu nền `alpha-04` (đúng prototype) + vòng focus `focus-visible`; nhận `data-state` truyền lại khi bị `ContextMenuTrigger asChild` đè (ghi chú NGUON bẫy).

- [ ] **Step 1: Test hỏng** — `phim-tat.test.ts`: `'p'` bắn; `'p'` trong `<input>` không bắn; `'p'` khi `isComposing` không bắn; `'shift+d'` bắn với Shift, `'d'` không bắn khi có Shift; Ctrl+P không bắn `'p'`. `ChonDong` test cho `chonTheoBam` (mod bật/tắt, shift dải xuôi/ngược, bấm thường giữ vùng). `table-con-tro.dom.test.tsx`: `conTro` → `data-con-tro`.
- [ ] **Step 2:** chạy các test → FAIL.
- [ ] **Step 3: Cài đặt** theo Interfaces (R15, R16; `bang/` không import ngoài `react` + `next/navigation`).
- [ ] **Step 4:** test PASS; cả bộ PASS.
- [ ] **Step 5: Khối /ds** ví dụ bảng 5 dòng demo: ↑/↓ dời con trỏ, Ctrl/⇧+bấm chọn, `P` đổi ưu tiên dòng đang trỏ (đổi chữ trong ô, không cần menu). Cổng `Table` thoát 0.
- [ ] **Step 6: Commit** `feat(ds): bảng có dòng đang trỏ, chọn nhiều Ctrl/⇧, phím tắt theo dòng`.

### Task 3: DateTimePicker (A4) + TimeInput

**Files:**
- Create: `components/ui/time-input.tsx`, `components/ui/date-time-picker.tsx`
- Create: `app/ds/_khoi/khoi-date-time-picker.tsx`, `ds/nguon/components/DateTimePicker/README.md` (khuôn README như `DatePicker/README.md`; ghi "chưa có trong artifact — nguồn là prototype A4 duyệt 20/11")
- Test: `components/ui/date-time-picker.dom.test.tsx`, `components/ui/time-input.dom.test.tsx`
- Đăng ký khối: `app/ds/_khung/dk-l7-3.ts` (đã dựng sẵn rỗng)

**Interfaces — Consumes:** `Calendar`, `calendarPop`, `calendarFoot`, `calendarFootClear` (`date-picker.tsx`/`calendar-styles.ts`), `Popover`, `Input`, `Button`, `useMoBangChuot`, `inline-edit-styles` (`oSua`, `oSuaMui`), `bang/ngay` (`isoNgay`, `ngayTuIso`, `hienNgay`).
**Interfaces — Produces:**
- `TimeInput({ value: string | null, onValueChange(gio: string): void, goiY?: string[], placeholder?: string, ...input props })` — 24h `HH:mm`.
- `DateTimePicker({ value: string | null /* ISO có múi, vd 2026-11-25T14:30:00+07:00 */, onValueChange(v: string | null): void, gioMacDinh?: string /* '17:30' — R13 */, mui?: string /* '+07:00' */, tuNgay?: string /* yyyy-mm-dd, mặc định hôm nay; trước đó bị tắt trừ ngày của value */, gon?: boolean /* trigger kiểu ô sửa tại chỗ trong bảng */, open?: boolean, onOpenChange?(o: boolean): void, id?, 'aria-label'? })`.
- Hành vi đúng như "Quyết định đã chốt" + R13 (placeholder giờ = `gioMacDinh`). Ô ngày nhận `dd/mm`, `dd/mm/yyyy`. Chỉ chọn giờ, ô ngày trống → ngày của value, chưa có thì hôm nay. Enter ở ô ngày hay ô giờ = Xong; IME đang ghép không chốt.
- `open`/`onOpenChange` điều khiển từ ngoài được (để menu "Đặt hạn…" mở tại ô Hạn — thiếu ở prototype).

- [ ] **Step 1: Test hỏng** — `date-time-picker.dom.test.tsx` (Review Focus 1): chọn ngày → `onValueChange` CHƯA gọi; Xong → gọi đúng ISO `…T17:30:00+07:00`; chọn ngày rồi Esc → không gọi, mở lại thấy giá trị thật; Huỷ → không gọi; gõ `31/02` → Xong `disabled`; gõ `26/11`, Tab, `1430`, Enter → `2026-11-26T14:30:00+07:00` (hôm nay giả lập bằng `vi.setSystemTime('2026-11-20T10:00:00+07:00')`); Xoá → gọi `null`; ngày 19/11 tắt, nhưng value 18/11 thì 18/11 vẫn chọn được; `open` điều khiển từ ngoài mở pop. `time-input.dom.test.tsx`: `1430`→`14:30`, `9`→`09:00`, `14:45` giữ phút lẻ, Enter khi `isComposing` không chốt.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3: Cài đặt.** Nâng logic từ `app/prototype/chon-gio/_chon-gio/bien-the-a4.tsx`, `o-gio.tsx`, `gio.ts`, `vo-han.tsx` (chép logic, KHÔNG import từ prototype). Dựng bằng component DS, không px/hex trần.
- [ ] **Step 4:** test PASS; cả bộ PASS.
- [ ] **Step 5: Khối /ds** `KhoiDateTimePicker`: form (ô Hạn xử lý), ô gọn trong bảng, trạng thái có giá trị / trống / ngày đã qua; ghi rõ "giờ mặc định 17:30 — CEO chưa chốt". Đăng ký vào `dk-l7-3.ts` (`KHOI_L7_3 = { DateTimePicker: KhoiDateTimePicker }`). Đo `getComputedStyle` chiều cao trigger = DatePicker, pop padding = `calendarPop`. Cổng `DatePicker` vẫn thoát 0.
- [ ] **Step 6: Commit** `feat(ds): DateTimePicker (ô ngày + giờ, chỉ lưu khi Xong) và TimeInput`.

### Task 4: Khối mẫu ghép "Menu thuộc tính" (đợt 2 — sau Task 1–3)

**Files:**
- Create: `app/ds/_khoi/khoi-menu-thuoc-tinh.tsx` (+ file dữ liệu demo cùng thư mục nếu cần, tên `khoi-menu-thuoc-tinh-du-lieu.ts`)
- Create: `ds/nguon/components/MenuThuocTinh/README.md` — đây là **mẫu ghép** (pattern), không phải component mới: ghi cách ghép, phím tắt chuẩn (`S` trạng thái · `A` người làm · `P` ưu tiên · `L` nhãn · `⇧D` hạn), luật chọn nhiều, toast Hoàn tác.
- Đăng ký: `app/ds/_khung/dk-l7-4.ts`
- Test: `app/ds/_khoi/khoi-menu-thuoc-tinh.dom.test.tsx`

**Interfaces — Consumes:** mọi thứ Task 1–3 Produces + `Table`, `Checkbox`, `thongBao` (toast).

- [ ] **Step 1: Test hỏng** (Review Focus 2–4): `P` trên dòng đang trỏ mở thẳng menu con Ưu tiên, focus ở mục ✓; `p` gõ trong ô tìm Người làm không mở menu Ưu tiên; ← trong menu con về mục cha; Esc đóng hết, focus về dòng; chọn 3 dòng → đầu menu "3 ticket", đổi Ưu tiên áp cả 3, Hoàn tác khôi phục 3 giá trị khác nhau; menu mở trên dòng ngoài vùng chọn chỉ áp dòng đó; "Đặt hạn…" mở DateTimePicker neo ô Hạn của dòng, Xong lưu, Huỷ không lưu.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3: Cài đặt** bằng component DS (port từ `app/prototype/menu-thuoc-tinh/_menu/`, bỏ mọi chỗ tự ghép primitive — nay DS đã có).
- [ ] **Step 4:** test PASS; cả bộ PASS; bấm thử bằng Chrome headless CDP sáng + tối, 1440 + 390 (390: menu con không tràn ngang — R14); console 0 lỗi; lưu ảnh ở scratchpad riêng.
- [ ] **Step 5: Commit** `feat(ds): khối mẫu ghép Menu thuộc tính (menu con, phím tắt, chọn nhiều, hoàn tác)`.

### Task 5 (người điều phối): nối, kiểm, ghi luật

- [ ] Trước đợt 1: tạo `dk-l7-3.ts`, `dk-l7-4.ts` rỗng, nối vào `khoi.ts`/`hang.ts`: `DateTimePicker` vào nhóm Form sau `DatePicker`; nhóm mới `{ ten: 'Mẫu ghép', lat: 7, khoi: ['MenuThuocTinh'] }`. Commit.
- [ ] Sau đợt 1 + 2: review cả nhánh (reviewer độc lập, opus) theo Review Focus; sửa finding Important.
- [ ] Cổng so khớp cả 50 component (thoát 0) + `tsc` + cả bộ test + `npm run build`.
- [ ] Ảnh thật sáng/tối 1440/900/390 cho DateTimePicker, menu con, khối Menu thuộc tính; trạng thái hover/focus/disabled/lỗi bằng tương tác thật.
- [ ] NGUON: R13–R17, bẫy mới, "đang mở" (drill-in mobile, giờ mặc định 17:30 chờ chốt, đồng bộ artifact cho 2 component mới).
- [ ] Gửi CEO link neo `/ds#date-time-picker`, `/ds#dropdown-menu`, `/ds#menu-thuoc-tinh` + "bấm gì để thấy". Push khi CEO nói.
