# DS thật — Lát 3 (Form) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng 11 component Form thật: Input/Label/Textarea (Field), InputAffix, Checkbox, Radio, Switch, Select, Combobox, DatePicker, DateRangePicker, FileUpload, FormLayout. Mỗi cái có khối `/ds#<neo>` và cổng so khớp artifact thoát 0.

**Architecture:**
- Giữ khuôn lát 1–2: component kiểu shadcn (cva + `radix-ui`) trong `components/ui/`, giá trị lấy từ khối `.ui-*` tương ứng của `ds/nguon/bundle.css`.
- Viền/hover/focus/lỗi/tắt của ô nhập gom một chỗ (`control-styles.ts`), Input, InputAffix, Select, DatePicker cùng dùng.
- Popover dùng chung (`popover.tsx`) cho Combobox, DatePicker, DateRangePicker.
- Logic dữ liệu của gói `bang/` (khớp không dấu, tìm xa, ngày) **dùng lại**, không viết lại. Chỗ đang nằm trong component `bang/` thì tách ra hàm/hook rồi để cả hai bên gọi.

**Tech Stack:** Next 16.2 · React 19.2 · Tailwind 4 · `radix-ui` 1.8 · cva · Phosphor · `react-day-picker` **10.0.2** (Calendar shadcn) · `cmdk` **1.1.1** (Combobox shadcn) · vitest 4 + jsdom + Testing Library · Chrome headless (cổng so khớp).

**Spec:** `docs/rework/2026-11-19-ds-that-shadcn-chatgpt-thiet-ke.md` (§5.3 component + luật `bang/`, §6 nhóm Form, §7 lát 3). Luật component: `apps/web/ds/NGUON.md`. **Đọc cả hai trước mọi task.** Hành vi tham khảo prototype đã duyệt: `git show origin/prototype/v2-khung:apps/web/app/prototype/form/_form/FormDemo.tsx` (+ `form.css` cùng thư mục).

## Global Constraints

- **Nhánh và commit**
  - Nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`.
  - **Không merge `main`.** Chỉ `git add` file của mình (không `-A`, không `stash`).
  - Nhiều agent chạy song song trong CÙNG worktree: commit gặp `index.lock` thì chờ 2s rồi thử lại.
  - Không `push` (người điều phối push sau mỗi đợt).
- **Token và giá trị**
  - Token DS chỉ trong `[data-ds="v2"]`; không `:root`; không khoá `@theme` trùng thang Tailwind.
  - Giá trị lấy từ token/khối `.ui-*` của `ds/nguon/bundle.css`. Gõ px trần chỉ khi bundle.css gõ đúng số đó, kèm comment nguồn.
- **Hình thức**
  - Màu giữ y nguồn ChatGPT (viền input 1.42:1, viền Checkbox 1.6:1, rãnh Switch ~1.6:1 là chấp nhận có chủ đích).
  - Icon Phosphor `regular`.
  - Font kế thừa `DsRoot`, không reset `font-feature-settings`.
  - Số/mã `tabular-nums`.
- **Popover/overlay**
  - Portal `container={useDsPortal()}`; menu/pop z-90 theo thang z trong NGUON.md.
  - Đóng → focus về trigger.
- **Tên prop** (luật NGUON):
  - Primitive giữ tên shadcn/Radix (`value`, `onValueChange`, `open`, `disabled`…).
  - Component ghép nghiệp vụ dùng tiếng Việt cho phần nghiệp vụ.
  - Màu luôn là `color`.
- **Dữ liệu**
  - Mục chọn dùng kiểu `MucChon = { gt: string; nhan: string; phu?: string }` của `bang/OChonGoiY.tsx`.
  - Ngày lưu chuỗi `YYYY-MM-DD` qua `isoNgay()`; **cấm `toISOString()`**. Hiển thị `dd/MM/yyyy`.
- **Luật CHUAN-FILTER:** danh sách > 10 mục bắt buộc Combobox. Select chỉ ≤ 10 mục, ghi rõ trong JSDoc.
- **Cấm** `npx shadcn add` thẳng; chép tay registry shadcn (new-york) rồi tô lại.
- **Tailwind quét cả `*.test.tsx` và `*.md` trong `apps/web`:** không dán chuỗi class có ngoặc nhọn/chỗ trống vào test hay tài liệu.
- Commit tiếng Việt có dấu, prefix conventional, kết bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Không PII (dữ liệu demo ghi rõ "demo").
- **Xong một task khi:**
  - test của task + cả bộ test + `tsc` sạch;
  - `node ds/so-khop.mjs <C> --url http://127.0.0.1:3401` (cwd `apps/web`) thoát 0, mọi lệch có `lyDo` cụ thể, trạng thái preview không có ghi `chuaDo`;
  - tự chụp khối sáng + tối, khổ 1440 + 390, tự nhìn ảnh.
- **Dev server:** đang chạy ở cổng 3401 (do người điều phối giữ). **Không tắt, không khởi động lại.** Thấy 500 → đọc lỗi CSS, sửa chuỗi gây lỗi, `touch ds/tokens.css`.
- **Luật mới phát hiện:** KHÔNG tự sửa `ds/NGUON.md`; ghi ở cuối báo cáo, người điều phối gom vào.

## Review Focus

1. **Bộ gõ tiếng Việt đang ghép chữ** (Unikey/Telex, `isComposing`) trong ô tìm Combobox: Enter lúc đang ghép KHÔNG chọn mục; lọc theo chữ đã ghép xong. → test ở Task 7.
2. **Giờ VN 00:00–07:00:** chọn ngày trên lịch lưu đúng ngày bấm; "Hôm nay"/mốc nhanh đúng ngày máy, không lệch 1 ngày. → test giả giờ `2026-11-20T00:30:00+07:00` ở Task 8, 10.
3. **Ô tiền VND:**
   - dán `"1.250.000 ₫"` → giá trị `1250000`;
   - gõ chữ cái bị bỏ;
   - xoá hết → `null` (không phải 0);
   - con trỏ không nhảy về cuối khi tự chèn dấu chấm giữa số.
   → test ở Task 3.
4. **Esc trong pop** (Select, Combobox, DatePicker, DateRangePicker): đóng pop, focus về trigger, KHÔNG đóng luôn Dialog/Sheet bao ngoài. DateRangePicker Esc = Huỷ (giữ giá trị cũ). → test ghép với `Dialog` ở Task 7, 8, 10.
5. **Khổ 390:**
   - FormLayout 1 cột;
   - DatePicker pop rộng `100vw − 16px`, ô ngày vuông;
   - DateRangePicker 1 tháng, đầu bảng xếp dọc;
   - Select/Combobox pop không tràn khung.
   → cổng so khớp 390 + ảnh ở Task 6, 7, 8, 10, 11.

---

### Task 1: Nền lát 3 — nguồn, gói, Popover, khung `/ds`

**Files:**
- Create: `apps/web/ds/nguon/components/{Input,InputAffix,Checkbox,Radio,Switch,Select,Combobox,DatePicker,DateRangePicker,FileUpload,FormLayout}/preview.html`
  - chép bằng `cp` từ `C:/Users/Duncr/AppData/Local/Temp/claude/d2fa843791a29a0f/9d5dc202-19a7-43e4-bf9a-2b7a84a1d1c8/scratchpad/lat3/project/components/<C>/preview.html` (artifact bản 37, `bundle.css` cùng sha `2b9b6e28…1899` đã có);
  - README cùng thư mục chép vào `ds/nguon/components/<C>/README.md`.
- Modify: `apps/web/ds/NGUON.md`
  - bảng sha256 thêm 11 preview;
  - mục `/ds` đổi "mảng `KHOI`" → "mảng `NHOM` (gắn `Khoi` vào mục của nhóm)".
- Modify: `apps/web/package.json` + lockfile: `react-day-picker@10.0.2`, `cmdk@1.1.1` (ghim đúng số).
- Create: `apps/web/components/ui/popover.tsx`, `apps/web/components/ui/popover.dom.test.tsx`
- Create: 11 file khối giữ chỗ `apps/web/app/ds/_khoi/khoi-<neo>.tsx`. Mỗi file chỉ có
  `export const Khoi<Ten>: ComponentType | undefined = undefined`; `page.tsx` import cả 11 và gắn vào nhóm Form. Mục lục
  vẫn hiện "chưa dựng" vì giá trị `undefined`. Task sau **chỉ thay file khối của mình** bằng
  `export function Khoi<Ten>()`, không đụng `page.tsx`. Đợt song song vì thế không giẫm nhau.

**Interfaces — Produces:**
- `Popover`, `PopoverTrigger`, `PopoverAnchor` (Radix);
- `PopoverContent(props: ComponentProps<typeof PopoverPrimitive.Content>)` với hành vi sau:
  - portal vào `useDsPortal()`; chưa có container thì không render;
  - mặc định `align="start"`, `sideOffset={4}`, `collisionPadding={8}`;
  - class nền chỉ `z-90 outline-none`; người gọi tự thêm hình (vd `menuContent`).

- [ ] **Step 1: Test thất bại.** Trong `popover.dom.test.tsx` (jsdom):
  - bấm trigger → content nằm trong `[data-ds="v2"]`, có `data-side`;
  - Esc đóng và focus về trigger.
- [ ] **Step 2–4:**
  - FAIL → viết → PASS;
  - `npm i` đúng 2 gói;
  - `sha256sum` nguồn = bản chép;
  - cả bộ test + tsc sạch;
  - `node ds/so-khop.mjs Button` vẫn thoát 0.
- [ ] **Step 5: Commit** `chore(ds): nền lát 3 — nguồn Form bản 37, react-day-picker + cmdk, Popover dùng chung`

---

### Task 2: Field + Input + Textarea + kiểu ô nhập dùng chung

**Files:**
- Create:
  - `components/ui/control-styles.ts`
  - `components/ui/field.tsx`
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/field-input.test.tsx`
  - `app/ds/_khoi/khoi-input.tsx`
  - `ds/so-khop/input.json`

**Interfaces — Produces `control-styles.ts`** (Task 3, 6, 8, 10 dùng lại):
- `controlOutline`: chuỗi class cho phần tử tự mang viền.
  - Cao `--control-size-md` 32, bo `--control-radius-md` 8, padding `--control-gutter-md` 12, chữ 14/20.
  - `border-0`, nền trong suốt, viền `shadow-[inset_0_0_0_1px_var(--input)]`.
  - Hover viền `alpha-25` (tối `alpha-30`); `focus-visible` viền `alpha-50`, không quầng.
  - `aria-invalid` viền `red-500` (tối `red-600`).
  - `disabled`: nền `color-background-disabled`, chữ `color-text-disabled`.
  - Placeholder `color-text-tertiary`.
- `controlOutlineWithin`: cùng như trên nhưng cho KHUNG bọc. Hover theo `:hover`, focus theo `:focus-within`, lỗi theo `:has([aria-invalid=true])`, tắt theo `:has(:disabled)`.

**Interfaces — Produces `field.tsx`** (tên theo shadcn Field):
- `Field` (`.ui-field`: cột, gap 6);
- `FieldLabel = Label` (Radix Label, 14/20 medium). Prop `required?: boolean` → `*` đỏ `aria-hidden` sau chữ.
- `FieldDescription` (`.ui-help` 12/18 `muted-foreground`);
- `FieldError` (`.ui-error` 12/18 `color-text-danger`, `role` không đặt — gắn qua `aria-describedby` của ô);
- `FieldSet` + `FieldLegend` (`.ui-choices` + legend `.ui-label`; `data-orientation="horizontal"` cách cột 20, dọc gap 8);
- `FieldMeta({ dem: number; toiDa: number; children?: ReactNode })` (`.ui-field-meta`: trái gợi ý, phải "dem/toiDa" `tabular-nums`).

**Interfaces — Produces input/textarea:**
- `Input(props: ComponentProps<'input'> & { icon?: ReactNode })`:
  - có `icon` → bọc `.ui-input-wrap` (icon 16 trái, cách chữ 8, `muted-foreground`, `pointer-events-none`).
- `Textarea(props: ComponentProps<'textarea'>)`: viền như trên, padding 6 12, cao tối thiểu 80.

- [ ] **Step 1: Test thất bại.** File `renderToStaticMarkup` + 1 test jsdom:
  - `FieldLabel required` có `*` `aria-hidden`;
  - `Input aria-invalid` giữ thuộc tính;
  - `Input icon` → icon `aria-hidden` và input vẫn là phần tử nhận `id`;
  - `FieldMeta dem={12} toiDa={500}` hiện "12/500";
  - `Textarea` có class cao tối thiểu.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#input` tái tạo 6 ô của preview: tên KH + gợi ý, tìm kiếm có icon, hover/focus, SĐT lỗi, mã đơn tắt, ghi chú.
  - Hover/focus đo bằng bước `tro` / `tab` thật (preview ép bằng `.is-hover`/`.is-focus`).
  - Cổng `Input` thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Field + Input + Textarea — viền inset, hover/focus/lỗi/tắt dùng chung`

---

### Task 3: InputAffix (ô tiền VND, %, đơn vị)

**Files:**
- Create:
  - `components/ui/input-affix.tsx`
  - `components/ui/input-affix.dom.test.tsx`
  - `lib/dinh-dang-so.ts` + `lib/dinh-dang-so.test.ts`
  - `app/ds/_khoi/khoi-input-affix.tsx`
  - `ds/so-khop/input-affix.json`

**Interfaces — Consumes:** `controlOutlineWithin` (Task 2).

**Interfaces — Produces `input-affix.tsx`:**
- `InputGroup` (khung `.ui-input-affix`);
- `InputGroupInput` (ô không viền; `data-align="end"` căn phải + `tabular-nums`);
- `InputGroupAddon({ align?: 'inline-start'|'inline-end' })` — đơn vị `color-text-tertiary`, cách số 4, `aria-hidden`.

**Interfaces — Produces `OTien`** (component ghép):

```ts
OTien(props: {
  value: number | null;
  onValueChange(v: number | null): void;
  donVi?: string /* '₫' */;
} & Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'>)
```

- `inputMode="numeric"`, chỉ nhận chữ số, tự chèn dấu chấm vi-VN, giữ vị trí con trỏ theo số chữ số đứng trước nó.

**Interfaces — Produces `lib/dinh-dang-so.ts`:**
- `dinhDangSo(n: number): string` — `Intl.NumberFormat('vi-VN')`;
- `docSo(s: string): number | null` — bỏ mọi ký tự không phải số; rỗng → `null`.
- `fmtVnd` ở `app/sales/_ui.tsx` **không** dời ở lát này (đề xuất dời vẫn chờ duyệt).

- [ ] **Step 1: Test thất bại:**
  - `docSo('1.250.000 ₫') === 1250000`;
  - `docSo('') === null`;
  - `docSo('abc') === null`;
  - `dinhDangSo(1250000) === '1.250.000'`.
  - jsdom: gõ `1250000` → ô hiện `1.250.000`, `onValueChange` cuối `1250000`;
  - jsdom: gõ `a` không đổi giá trị; xoá hết → `null`;
  - jsdom: đặt con trỏ sau chữ số thứ 2 của `125.000`, gõ `9` → ô `1.295.000` và con trỏ sau `9`.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#input-affix` tái tạo 4 ô của preview: đơn giá ₫, chiết khấu %, số tiền lỗi, đã thu tắt.
  - Cổng thoát 0.
- [ ] **Step 5: Commit** `feat(ds): InputAffix + OTien — đơn vị sát số, VND tự chấm hàng nghìn, lưu số`

---

### Task 4: Checkbox + Radio

**Files:**
- Create:
  - `components/ui/checkbox.tsx`, `components/ui/radio-group.tsx`
  - `components/ui/checkbox-radio.dom.test.tsx`
  - `app/ds/_khoi/khoi-checkbox.tsx`, `app/ds/_khoi/khoi-radio.tsx`
  - `ds/so-khop/checkbox.json`, `ds/so-khop/radio.json`

**Interfaces — Consumes:** `FieldSet`, `FieldLegend`, `FieldError` (Task 2).

**Interfaces — Produces:**
- `Checkbox` (Radix Checkbox; `checked: boolean | 'indeterminate'`; dấu Phosphor `Check` / `Minus` bold 12).
- `ChoiceLabel` (`.ui-checkbox-label`): nhãn bọc, 14/20, cách ô 8, ô lệch xuống 1px.
- `ChoiceDescription` (`.ui-choice-desc` 12/18).
- `RadioGroup` + `RadioGroupItem` (Radix; chấm 8 phóng to 120ms, tắt khi `prefers-reduced-motion`).
- Giá trị: `.ui-checkbox`, `.ui-radio`, `.ui-choices`.
  - 18px, viền `gray-200` (tối `gray-500`), hover `gray-300` / `gray-600`;
  - chọn nền `gray-900` (Checkbox) / viền + chấm `color-background-primary-solid` (Radio);
  - tắt viền `gray-150`, nền `gray-25`;
  - lỗi viền `red-500`;
  - focus outline 2 `ring` offset 2.

- [ ] **Step 1: Test thất bại (jsdom):**
  - bấm chữ nhãn đổi Checkbox;
  - `checked="indeterminate"` → `aria-checked="mixed"`;
  - RadioGroup: Tab vào nhóm focus mục đang chọn, ↓ đổi lựa chọn;
  - mục `disabled` bị bỏ qua;
  - `aria-invalid` trên item giữ nguyên;
  - FieldSet có `aria-describedby` trỏ `FieldError`.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#checkbox`: 8 trạng thái như preview.
  - Khối `#radio`: dọc có mô tả, ngang, lỗi.
  - Hover/focus bằng bước thật.
  - 2 cổng thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Checkbox + RadioGroup — 18px, một phần, nhóm dọc/ngang, lỗi`

---

### Task 5: Switch

**Files:**
- Create:
  - `components/ui/switch.tsx`, `components/ui/switch.dom.test.tsx`
  - `app/ds/_khoi/khoi-switch.tsx`
  - `ds/so-khop/switch.json`

**Interfaces — Produces:**
- `Switch` (Radix Switch, `role="switch"`):
  - rãnh 32×18 `radius-full`; tắt `alpha-25` (hover `alpha-30`); bật `color-background-primary-solid`;
  - núm 14 cách mép 2, `shadow-hairline`, trượt 14px / 150ms, tắt khi `prefers-reduced-motion`;
  - disabled `opacity-50`.
- `SwitchRow({ nhan: ReactNode; moTa?: ReactNode; children: <Switch/> })` (`.ui-switch-row`):
  - nhãn + mô tả trái, công tắc phải, gap 16, căn đầu dòng;
  - cả hàng là `<label>`; mô tả nối `aria-describedby` của Switch.

- [ ] **Step 1: Test thất bại (jsdom):**
  - bấm chữ của `SwitchRow` đổi trạng thái;
  - Space bật/tắt;
  - `aria-checked` đúng;
  - mô tả được đọc qua `aria-describedby`;
  - disabled không đổi.
- [ ] **Step 2–4:** FAIL → viết → PASS. Khối `#switch`: 3 hàng của preview. Cổng thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Switch + hàng cài đặt`

---

### Task 6: Select (≤ 10 mục)

**Files:**
- Create:
  - `components/ui/select.tsx`, `components/ui/select.dom.test.tsx`
  - `app/ds/_khoi/khoi-select.tsx`
  - `ds/so-khop/select.json`

**Interfaces — Consumes:**
- `controlOutline` (Task 2);
- `menuContent`, `menuItem`, `itemDisabled` (lát 2 `menu-styles.ts`).

**Interfaces — Produces** (cùng tên shadcn, Radix Select):
- `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectSeparator`.
- `selectTrigger`: chuỗi class xuất ra để DatePicker/Combobox dùng lại.
  - Trigger: `controlOutline` + chữ weight 500, chevron Phosphor `CaretDown` 16 `muted-foreground`.
  - Placeholder weight 400 `color-text-tertiary`.
  - `data-state=open` viền `alpha-50`.
- `SelectContent` dạng `position="popper"`, portal `useDsPortal()`, rộng ≥ trigger, `menuContent`.
- `SelectItem` dạng `menuItem`, ✓ phải.
- Mục `disabled` theo APG như menu lát 2. Nếu Radix Select không cho focus mục disabled thì chấp nhận hành vi Radix, ghi `lyDo` + báo cáo.

- [ ] **Step 1: Test thất bại (jsdom):**
  - mở bằng bàn phím (Enter/Space/↓), chọn bằng Enter;
  - `onValueChange` nhận đúng giá trị;
  - Esc đóng, focus về trigger;
  - content trong vùng DS;
  - `aria-invalid` trên trigger;
  - đặt Select trong `Dialog`: Esc lần 1 chỉ đóng Select.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#select` tái tạo 2 cột preview: Kênh bán mở sẵn; trigger placeholder/hover/lỗi/tắt.
  - Cổng: `buoc: [{bam: trigger}]`; khoá trigger, `content`, `item`, `item-chon`, `item-tat`; 1440 + 390, sáng/tối; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Select — trigger như Input, nội dung kiểu Menu, ≤ 10 mục`

---

### Task 7: Combobox (> 10 mục, gõ để tìm, tìm xa)

**Files:**
- Create:
  - `components/ui/combobox.tsx`, `components/ui/combobox.dom.test.tsx`
  - `app/ds/_khoi/khoi-combobox.tsx`
  - `ds/so-khop/combobox.json`
  - `bang/useTimXa.ts`
- Modify:
  - `bang/OChonGoiY.tsx`, `bang/OChonTimXa.tsx` (chỉ đổi sang hàm/hook dùng chung — hành vi giữ nguyên, test cũ xanh);
  - `bang/index.ts`, `bang/timkiem.ts`;

**Interfaces — Consumes:**
- `Popover*` (Task 1), `selectTrigger` (Task 6);
- `menuContent`, `menuItem` (lát 2);
- `cmdk` `Command` với `shouldFilter={false}`.

**Interfaces — Produces trong `bang/`:**
- `locMucChon(tuyChon: MucChon[], q: string, toiDa: number): { ds: MucChon[]; tong: number }` trong `bang/timkiem.ts`:
  - khớp không dấu `gt` / `nhan` / `phu` như `OChonGoiY` hiện tại (tách nguyên logic đó ra);
  - `OChonGoiY` + `BoLocGoiY` gọi hàm này.
- `useTimXa(tim: (q: string) => Promise<MucChon[]>, q: string): { ds: MucChon[]; dangTim: boolean; loi: string | null; thieuKyTu: boolean }`:
  - tách nguyên logic debounce 250ms + `luot` + `TOI_THIEU_KY_TU` khỏi `OChonTimXa`;
  - `OChonTimXa` gọi hook này.

**Interfaces — Produces `Combobox`:**

```ts
Combobox(props: {
  value: string | null;
  onValueChange(v: string | null): void;
  options?: MucChon[];
  tim?: (q: string) => Promise<MucChon[]>;
  placeholder?: string /* 'Chọn…' */;
  searchPlaceholder?: string /* 'Gõ mã hoặc tên…' */;
  max?: number /* 30 */;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-labelledby'?: string;
})
```

- Có `options` → lọc tại chỗ (`locMucChon`); có `tim` → `useTimXa`.
- Trigger `selectTrigger` + icon `CaretUpDown`.
- Pop `menuContent`, rộng ≥ trigger.
- Ô tìm cao 32, gạch dưới 1px `border`, icon kính lúp.
- Danh sách cao tối đa 240 cuộn.
- Item: mã (12 `tabular-nums` `muted-foreground`) + tên, ✓ khi đang chọn; mục đầu sáng sẵn.
- Ghi chú cuối `aria-live="polite"`:
  - "Đang hiện N / M mục — gõ thêm để thu hẹp" khi cắt;
  - không cắt: "M mục".
- Các câu trạng thái rỗng / chưa đủ ký tự / đang tìm / lỗi: đúng câu của README Combobox (lỗi: câu lỗi `tim` ném ra).
- Enter khi `isComposing` không chọn.
- Không cho chọn "bỏ chọn" bằng mục rỗng; bỏ chọn = `onValueChange(null)` qua nút ✕ nhỏ trong trigger khi có giá trị.

- [ ] **Step 1: Test thất bại.**
  - Hàm thuần `locMucChon`:
    - "ha noi" khớp "Hà Nội";
    - "01" khớp mã `01`;
    - `toiDa` cắt và `tong` đúng.
  - Hook `useTimXa` (fake timers):
    - 1 ký tự → `thieuKyTu`, không gọi `tim`;
    - gõ "ngu" rồi "nguyen", trả "ngu" về sau → chỉ thấy kết quả "nguyen".
  - Component (jsdom):
    - ↑/↓ di chuyển, Enter chọn, Esc đóng + focus trigger;
    - `compositionstart` → Enter không gọi `onValueChange`;
    - trong `Dialog`: Esc lần 1 chỉ đóng pop;
    - ghi chú cắt bớt đúng câu.
  - Test cũ của `bang/` vẫn xanh.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#combobox` tái tạo preview:
    - Tỉnh/thành 63 mục demo (mã số thứ tự, ghi "demo");
    - 3 trạng thái tĩnh: rỗng, gõ thêm, đang tìm (dùng `tim` giả treo).
  - Cổng: `buoc` mở; khoá trigger, `search`, `item`, `note`, `empty`; 1440 + 390; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Combobox — gõ để tìm không dấu, tìm xa, báo cắt bớt; bang/ tách locMucChon + useTimXa`

---

### Task 8: Calendar + DatePicker (kiểu Airbnb)

**Files:**
- Create:
  - `components/ui/calendar.tsx`, `components/ui/date-picker.tsx`
  - `components/ui/date-picker.dom.test.tsx`
  - `app/ds/_khoi/khoi-date-picker.tsx`
  - `ds/so-khop/date-picker.json`
- Modify:
  - `bang/ngay.ts` (+ test) thêm `ngayTuIso(iso: string): Date` (giờ máy, `new Date(y, m-1, d)`) và `hienNgay(iso: string): string` (`dd/MM/yyyy`);

**Interfaces — Consumes:** `Popover*` (Task 1), `selectTrigger` (Task 6), `Button` (ghost `icon-sm`, `outline sm`).

**Interfaces — Produces `Calendar`** (react-day-picker 10 `DayPicker`, shadcn Calendar tô lại):
- Thiết lập: `weekStartsOn={1}`, `locale={vi}` (từ `react-day-picker/locale`), `showOutsideDays={false}`.
- Tiêu đề "Tháng 11, 2026" 16/24 600 giữa; ‹ › `Button ghost icon-sm` tròn ở 2 mép.
- Thứ T2…CN 12/18 600 `muted-foreground`.
- Ô ngày `--control-size-2xl` 44 tròn, 14/20 600 `tabular-nums`:
  - hover chỉ viền tròn 1.5 `foreground`, không đổi nền;
  - chọn tròn đặc `color-background-primary-solid`;
  - hôm nay chấm 4 dưới số;
  - bị chặn chữ 400 `color-text-disabled` gạch ngang, không hover;
  - focus outline 2 `ring` tròn.
- Prop `classNames` của Calendar mở cho Task 10 thêm `range_*`.

**Interfaces — Produces `DatePicker`:**

```ts
DatePicker(props: {
  value: string | null;
  onValueChange(v: string | null): void;
  min?: string;
  max?: string;
  placeholder?: string /* 'Chọn ngày' */;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
})
```

- Trigger `selectTrigger` + `CalendarBlank` 16 đầu ô, giá trị `hienNgay`, `aria-haspopup="dialog"`.
- Pop `role="dialog"` có nhãn: padding 20/24, bo `radius-4xl` 24, nền `popover` + `shadow`.
- Chân: trái "Xoá ngày" (`ghost sm` gạch chân, chỉ khi có giá trị), phải "Hôm nay" (`outline sm`); kẻ trên `alpha-08`.
- Chọn ngày → đóng pop + focus trigger.
- ≤ 640px: pop rộng `calc(100vw - 16px)`, ô ngày giãn vuông (`aspect-ratio: 1`).

- [ ] **Step 1: Test thất bại.**
  - Hàm thuần:
    - `ngayTuIso('2026-11-20')` ra ngày 20 giờ máy;
    - `hienNgay('2026-11-20') === '20/11/2026'`.
  - jsdom, giả giờ `2026-11-20T00:30:00+07:00` (đặt `TZ=Asia/Ho_Chi_Minh` cho file test):
    - bấm "Hôm nay" → `onValueChange('2026-11-20')`;
    - bấm ô 18 → `'2026-11-18'`;
    - ngày < `min` có `aria-disabled` và bấm không gọi.
  - jsdom, bàn phím: mở → focus ô đang chọn (hoặc hôm nay); → +1 ngày; PageDown +1 tháng; Enter chọn; Esc đóng + focus trigger.
  - jsdom, trong `Dialog`: Esc chỉ đóng pop.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#date-picker` tái tạo preview (mở sẵn 1 lịch tĩnh để đo + 1 DatePicker tương tác).
  - Cổng: khoá trigger, `pop`, `tieu-de`, `thu`, `ngay`, `ngay-chon`, `ngay-chan`, `chan`; 1440 + 390; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): Calendar + DatePicker kiểu Airbnb — ô tròn 44, chặn gạch ngang, lưu YYYY-MM-DD đúng giờ VN`

---

### Task 9: FileUpload

**Files:**
- Create:
  - `components/ui/file-upload.tsx`, `components/ui/file-upload.dom.test.tsx`
  - `app/ds/_khoi/khoi-file-upload.tsx`
  - `ds/so-khop/file-upload.json`

**Interfaces — Consumes:** `Button`, `Tooltip` (lát 1–2), `FieldDescription` (Task 2).

**Interfaces — Produces `FileDrop`:**

```ts
FileDrop(props: {
  onChonTep(tep: File[]): void;
  accept?: string;
  multiple?: boolean /* true */;
  toiDaMB: number;
  goiY: ReactNode;
  disabled?: boolean;
  id?: string;
})
```

- `<label>` bọc `<input type="file">` ẩn nhìn (sr-only, vẫn Tab được).
- Kéo vào: viền liền `ring` + nền `color-background-info-soft-alpha`, chữ "Thả tệp vào đây".
- Thả/chọn → `onChonTep` với **mọi** tệp. Kiểm loại/dung lượng là việc của `kiemTep`, không lọc ngầm.

**Interfaces — Produces `kiemTep`:**
- `kiemTep(tep: File, { accept?: string; toiDaMB: number }): string | null`:
  - trả câu lỗi nói cách sửa ("Quá 10 MB — nén lại hoặc chọn tệp khác"; sai loại: "Chỉ nhận ảnh, PDF, Excel, Word");
  - hợp lệ → `null`.

**Interfaces — Produces `FileList`:**
- `FileList` (`ul aria-label="Tệp đã chọn"`).
- `FileItem(props: { ten: string; kichThuoc: number; trangThai: 'dang-tai'|'xong'|'loi'; tienDo?: number; loi?: string; anh?: string; onBo(): void; onThuLai?(): void })`:
  - lưới [ô 32 · tên/phụ · nút]; tên cắt `…`;
  - phụ 12/18 `color-text-tertiary` ("2,3 MB · đang tải 60%");
  - `progressbar` cao 4;
  - lỗi viền `red-500` + chữ phụ `color-text-danger`;
  - nút Bỏ `ghost icon-sm` + `Tooltip "Bỏ tệp"`, `aria-label="Bỏ <ten>"`;
  - `onThuLai` → thêm nút "Thử lại".
- `kichThuocDoc(byte: number): string` — "242 KB", "2,3 MB" (vi-VN).

- [ ] **Step 1: Test thất bại.**
  - Hàm thuần:
    - `kiemTep` file 11 MB với `toiDaMB=10` ra đúng câu;
    - `accept="image/*,.pdf"` + `.mov` ra câu loại;
    - `kichThuocDoc(2_411_725) === '2,3 MB'`.
  - jsdom:
    - chọn tệp qua input → `onChonTep` nhận tệp;
    - `disabled` → input `disabled`;
    - `FileItem` nút bỏ có `aria-label` đúng;
    - `trangThai="dang-tai" tienDo={60}` → `aria-valuenow="60"`.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#file-upload` tái tạo preview: vùng thả + 3 dòng xong / đang tải / lỗi + vùng tắt.
  - Cổng: hover vùng thả bằng `tro`; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): FileUpload — vùng thả, kiểm loại/dung lượng trước khi tải, dòng tệp có tiến độ`

---

### Task 10: DateRangePicker

**Files:**
- Create:
  - `components/ui/date-range-picker.tsx`, `components/ui/date-range-picker.dom.test.tsx`
  - `app/ds/_khoi/khoi-date-range-picker.tsx`
  - `ds/so-khop/date-range-picker.json`

**Interfaces — Consumes:**
- `Calendar`, `ngayTuIso`, `hienNgay` (Task 8);
- `PRESETS`, `khoangPreset`, `isoNgay` (`bang/ngay.ts`);
- `Popover*`, `selectTrigger`, `Button`.

**Interfaces — Produces:**

```ts
DateRangePicker(props: {
  value: { tu: string; den: string } | null;
  onValueChange(v: { tu: string; den: string } | null): void;
  min?: string;
  max?: string;
  placeholder?: string /* 'Chọn khoảng ngày' */;
  disabled?: boolean;
  id?: string;
})
```

- Giá trị chỉ đổi khi **Áp dụng**; Huỷ/Esc giữ giá trị cũ.
- **Đầu bảng:**
  - trái `aria-live`: "N ngày" (đủ 2 đầu, tính cả 2 đầu) / "Chọn ngày bắt đầu" / "Chọn ngày kết thúc" 18/26 600 + dòng "dd/MM/yyyy – dd/MM/yyyy";
  - phải 2 ô Từ ngày / Đến ngày: nhãn 10/14 600 in hoa; ô đang chọn viền 2 `foreground`; bấm "Từ" = chọn lại từ đầu, "Đến" = giữ đầu chọn lại cuối.
- **Lịch:**
  - 2 tháng cách 40; trái chỉ ‹, phải chỉ ›;
  - đầu/cuối tròn đặc + nửa dải; giữa dải `alpha-05` vuông;
  - rê xem trước dải khi đã có ngày đầu;
  - bấm trước ngày đầu → làm lại ngày đầu.
- **Mốc nhanh** (`PRESETS`): `Button outline sm`; mốc đang khớp viền 2 `foreground` + nền `alpha-04`. "30 ngày" = 31 ngày tính cả 2 đầu, giữ như `ngay.ts`.
- **Chân:** trái "Xoá ngày"; phải Huỷ (`outline sm`) · Áp dụng (`sm`, tắt khi chưa đủ 2 đầu).
- **≤ 640px:** đầu bảng xếp dọc, ô Từ/Đến rộng hết, **1 tháng** (tháng chứa ngày cuối) đủ ‹ ›. Dùng `matchMedia('(max-width: 640px)')` qua `useSyncExternalStore`.

- [ ] **Step 1: Test thất bại (jsdom, TZ VN, giờ giả `2026-11-20T00:30:00+07:00`):**
  - bấm 01 rồi 18 → đầu bảng "18 ngày", Áp dụng → `{tu:'2026-11-01', den:'2026-11-18'}`;
  - bấm 18 rồi 05 → ngày đầu thành 05;
  - Huỷ / Esc → không gọi `onValueChange`, mở lại thấy giá trị cũ;
  - mốc "Tuần này" → `{tu:'2026-11-16', den:'2026-11-20'}`;
  - Áp dụng `disabled` khi mới có 1 đầu;
  - trong `Dialog`: Esc chỉ đóng pop.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Khối `#date-range-picker` tái tạo preview.
  - Cổng: khoá đầu bảng, ô Từ/Đến, `ngay-dau`, `ngay-giua`, `ngay-cuoi`, mốc, chân; 1440 + 390; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): DateRangePicker — 2 tháng, dải nối, mốc nhanh từ bang/ngay, áp dụng mới đổi giá trị`

---

### Task 11: FormLayout

**Files:**
- Create:
  - `components/ui/form-layout.tsx`, `components/ui/form-layout.dom.test.tsx`
  - `app/ds/_khoi/khoi-form-layout.tsx`
  - `ds/so-khop/form-layout.json`

**Interfaces — Consumes:** mọi component Task 2–10; `Alert` (lát 2); `Button` `loading`.

**Interfaces — Produces:**
- `FormLayout(props: ComponentProps<'form'>)` (`.ui-form`: cột, khối cách 24).
- `FormSection({ tieuDe, moTa?, children })`:
  - `.ui-form-section`; trong khối gap 16;
  - khối sau có kẻ trên `alpha-08`;
  - tiêu đề 16/24 600, mô tả 14/20 `muted-foreground`.
- `FormGrid` (`.ui-form-grid`: 2 cột, gap 16 dọc / 20 ngang; con `data-span="full"`; ≤ 640px 1 cột viết `max-[640px]:`).
- `FormFooter({ trangThai?: ReactNode; children })` (kẻ trên `alpha-08`; nút phải, trạng thái trái `.ui-caption`).
- `FormRequiredNote` ("Trường có dấu * là bắt buộc").
- `focusLoiDau(form: HTMLFormElement): void` — focus phần tử `[aria-invalid="true"]` đầu tiên theo thứ tự DOM.

Khối demo `#form-layout` tái tạo form của preview (dữ liệu demo):
- kiểm khi bấm Lưu / rời ô đã sửa, không đỏ lúc mới mở;
- lưu lỗi → `focusLoiDau`;
- lỗi server giả → `Alert` danger đầu form, giữ dữ liệu;
- đang lưu → Lưu `loading` + khoá cả 2 nút.

**Không** cài `react-hook-form`/`zod` ở lát này (README: thêm khi form nghiệp vụ thật đầu tiên).

- [ ] **Step 1: Test thất bại (jsdom):**
  - mở form không có `aria-invalid` nào;
  - bấm Lưu khi thiếu trường bắt buộc → ô lỗi đầu tiên nhận focus và có `aria-describedby` trỏ câu lỗi;
  - sửa ô rồi rời → lỗi ô đó cập nhật;
  - đang lưu → 2 nút `disabled`/`aria-disabled`.
- [ ] **Step 2–4:** FAIL → viết → PASS.
  - Cổng `FormLayout` 1440 + 390: 2 cột → 1 cột; thoát 0.
- [ ] **Step 5: Commit** `feat(ds): FormLayout — khối, lưới 2 cột (≤640 một cột), chân form, focus lỗi đầu`

---

## Thứ tự chạy (người điều phối)

| Đợt | Task | Song song |
|---|---|---|
| 1 | 1 → 2 (một implementer, tuần tự) | — |
| 2 | 3 · 4 · 5 · 6 · 9 | 5 implementer song song |
| 3 | 7 · 8 | 2 song song |
| 4 | 10 | — |
| 5 | 11 | — |

- **Review:** mỗi đợt một reviewer độc lập opus soát mọi task của đợt theo plan + spec. Finding Critical/Important → gửi lại implementer của task đó sửa → re-review phạm vi.
- **Push:** sau mỗi đợt xanh, người điều phối push.

## Kết lát 3 (người điều phối)

- Cả bộ test + `tsc` + `build` sạch.
- `node ds/so-khop.mjs <C>` thoát 0 cho 22 component (11 cũ + 11 mới).
- Reviewer độc lập cả nhánh lát 3.
- Bộ chụp tự kiểm thêm khối Form (sáng/tối 1440/390, mở pop bằng tương tác thật), tự nhìn ảnh.
- Gom luật mới vào `NGUON.md`.
- Artifact: nếu code đúng hơn artifact thì đồng bộ ngược (đọc mới, LF, `design-system.json` cuối).
- Mời CEO xem `http://100.93.1.35:3401/ds#<neo>`.
- Push + cập nhật memory.
