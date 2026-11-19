# Design System thật cho GWT App — shadcn/ui (Radix) mặc áo UI kit ChatGPT

Ngày: 19/11/2026 · Nhánh: **`rework/v2.0.0`** (worktree `gwt-worktrees/rework-v2.0.0`) · Trạng thái: chờ CEO duyệt

## 1. Ý định — vì sao làm

GWT App v2 sẽ dựng lại toàn bộ giao diện. CEO chốt thứ tự **DS trước, màn sau** (19/11): dựng xong bộ component
dùng chung rồi mới ghép từng màn, để mọi màn giống nhau và không vẽ tay lại.

Bản chuẩn thiết kế đã có — **CEO chốt 19/11: mọi thứ trên artifact bản 25 là đã chốt** (kể cả 5 nhóm mục lục prototype còn ghi "Chờ duyệt"):

- **Artifact DS** "GWT — OpenAI + shadcn" (bản 25, `https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr`):
  `tokens.json` (472 màu 2 theme, chữ, khoảng cách, bo góc, cỡ control, bóng, breakpoint), README từng component,
  `preview.html` từng component, `bundle.css` (CSS gốc của mọi component).
- **Prototype** nhánh `prototype/v2-khung` (`apps/web/app/prototype/…`): hành vi đã thử bằng tương tác thật
  (bàn phím, focus, popover, tab, toast…).

Hai nguồn CEO đính kèm từ đầu: **shadcn/ui** (cấu trúc + hành vi component) và **UI kit ChatGPT** (OpenAI Apps SDK UI
0.2.2: toàn bộ diện mạo). Luật đã chốt: *component shadcn chỉ "mặc áo" ChatGPT, không thay bằng component React của OpenAI.*

## 2. Mục tiêu · không làm · phản mục tiêu

**Mục tiêu**
1. Bộ DS code thật trong `apps/web`, dựng trên **shadcn/ui + Radix**, diện mạo khớp artifact: token chép nguyên văn từ
   `tokens.json`, không gõ tay số đo nào.
2. Đủ các component trong artifact (≈ 50, xem §6), mỗi component có trang xem ở `/ds` với đủ trạng thái (mặc định,
   hover, focus, disabled, lỗi, rỗng, đang tải) cả sáng và tối.
3. **Chứng minh khớp**: script so từng component với `preview.html` của artifact (ảnh cạnh nhau + bảng lệch
   `getComputedStyle`). Lệch = 0 hoặc có lý do ghi lại.
4. **Không merge gì vào `main` (CEO chốt 19/11).** Toàn bộ v2 dựng trên nhánh `rework/v2.0.0`; khi test đạt chuẩn thì
   `main` được fast-forward lên `rework` một lần. `main` cũ từ giờ chỉ nhận tính năng và dữ liệu.

**Không làm (đợt này)**
- Không chuyển màn nào đang chạy sang DS mới. Ghép màn là việc sau, từng màn một.
- Không thêm bộ component khung chat cho Bắp (bong bóng tin nhắn, chữ chạy dần…) — CEO chưa yêu cầu.
- Không tách DS thành gói riêng `packages/ds` (mới có một app; làm khi có app thứ hai).
- Không đổi dark mode của màn cũ.
- Không sửa màu nguồn ChatGPT cho đạt tương phản (xem §5.2).

**Phản mục tiêu — làm xong mà dính một trong các điều này là hỏng**
- Bất kỳ màn cũ nào trên nhánh rework đổi giao diện khi chưa tới lượt chuyển (màu, viền, font).
- Giá trị màu/px gõ tay trong component thay vì token.
- Trộn component React của OpenAI (`@openai/apps-sdk-ui`) vào.
- Component "trông giống" nhưng không có bằng chứng so khớp.
- Trang `/ds` lộ ra production cho nhân viên.

## 3. Ràng buộc (đọc từ `main` 19/11, commit `cdc0ceb`)

| Hiện trạng | Hệ quả |
|---|---|
| Next 16.2, React 19.2, Tailwind 4 (`@tailwindcss/postcss`); chưa có shadcn, Radix, cva, Phosphor | Cài mới; shadcn CLI hỗ trợ Tailwind 4 + React 19 |
| `app/globals.css` đặt `--background`/`--foreground` ở `:root`, tự đổi khi máy bật dark (`prefers-color-scheme`); `body` font Arial | **Trùng tên biến shadcn** — token DS đặt ở `:root` sẽ đổi giao diện mọi màn |
| Luật `@layer base` ép mọi viền `slate-200` | Component DS phải ghi màu viền rõ (utility thắng base) |
| Khu Việc đã có tiền lệ bọc token trong `[data-khu="work"]` | Dùng lại cách bọc vùng |
| `components/Badge.tsx` cũ ở gốc `components/` | Không đụng; DS đặt ở `components/ui/` |
| Gói `apps/web/bang/` (logic bảng: lọc, sắp, phân trang, `<CauHinhBang giaoDien>`) | DS Table/Data view **chỉ cấp class** cho `giaoDien`, không viết lại logic (README artifact đã ghi) |
| Icon chốt: **Phosphor** (`regular`, `fill` khi đang chọn trên thanh icon, 16/18px); font chốt: **Inter** | Component shadcn mặc định dùng lucide → đổi sang Phosphor khi chép |
| Mỗi khu một cổng dev; Nền tảng `3401` (đang bị server prototype giữ) | Dùng 3401 khi prototype tắt; xem §8 |

## 4. Các cách đã cân nhắc

| | A. shadcn + token ChatGPT, bọc vùng riêng | B. Cài `@openai/apps-sdk-ui`, shadcn lấp chỗ thiếu | C. Như A nhưng tách `packages/ds` |
|---|---|---|---|
| Khớp luật đã chốt | ✅ | ❌ trái luật "không thay bằng component OpenAI" | ✅ |
| Rủi ro màn đang chạy | không (cách ly biến) | cao (gói mang reset CSS toàn trang) | không |
| Công | vừa | ít lúc đầu, hai hệ component lẫn nhau về sau | thêm cấu hình build cho một app |

**CEO chọn A (19/11).**

## 5. Thiết kế

### 5.1 Vùng DS (cách ly với màn cũ)
- Mọi token DS khai trong selector **`[data-ds="v2"]`**, không ở `:root`. Theme: `[data-ds="v2"][data-theme="dark"]`.
- Component `<DsRoot theme>` (`components/ui/ds-root.tsx`) render `<div data-ds="v2" data-theme>` + đặt font Inter,
  nền, màu chữ, `color-scheme`, và một **ô portal** bên trong.
- **Bẫy portal:** Radix Popover/Dialog/DropdownMenu/Tooltip/Sonner mặc định gắn vào `document.body` → ra ngoài vùng
  → mất token. Cách xử lý: `DsRoot` cấp context chứa phần tử portal nằm TRONG vùng; mọi component bọc Radix Portal
  trong `components/ui/` truyền `container` từ context đó. (Chép component về repo là cách shadcn khuyên, nên sửa được.)
- Màn v2 sau này chỉ cần bọc `<DsRoot>`; màn cũ (vẫn còn trên nhánh rework tới khi được chuyển) không đổi gì.
- Khi mọi màn đã chuyển, có thể nhấc token ra `:root` và bỏ `DsRoot` — một chỗ sửa.
- **Kiểm portal bằng tương tác thật (review lát 1):** component đầu tiên dùng Radix Portal phải có bằng chứng mở
  thật (bấm/phím trên bản đang chạy): nội dung portal có `closest('[data-ds="v2"]')` ≠ null và ăn đúng token ở theme
  tối. `useDsPortal` chưa có test sau mount (vitest chạy node, không jsdom).
- **CSS khu Việc nằm ngoài layer** (`[data-khu="work"] ::before`, `:focus-visible`, `*` reduced-motion) → đè cả base
  lẫn utilities của DS. Lát chuyển màn khu Việc: đưa các luật đó vào `@layer` hoặc bỏ khi màn dùng DS.
- **Trùng tên biến với CSS cũ (review cuối lát 1):** `app/globals.css` `[data-khu="work"]` khai `--muted` (màu CHỮ),
  `--accent` (teal thương hiệu), `--border`, `--shadow`, và `[data-khu="work"] :focus-visible { outline: … var(--accent);
  border-radius: 4px }` ngoài mọi layer; `app/wiki/wiki.css` `[data-khu="wiki"]` khai `--accent`, `--shadow`… DS khai
  lại đúng các tên đó với nghĩa khác (`--muted` = NỀN, `--accent` = nền hover xám). Biến kế thừa theo tổ tiên gần nhất →
  - **Không lồng component cũ trong `<DsRoot>`** (nó đọc `var(--accent)` → ra nền xám DS) và **không đặt `<DsRoot>`
    trong `[data-khu="work"]` / `[data-khu="wiki"]`** (focus/viền khu Việc đè DS).
  - Lát chuyển màn Việc/Wiki: hoặc đổi tên biến cũ (vd `--work-*`, `--wiki-*`) TRƯỚC khi lồng, hoặc chuyển trọn cả màn
    một lần (bỏ `data-khu` cũ cùng lúc bọc `DsRoot`), không chuyển nửa màn.
  - Consumer đọc `var(--muted|--accent|--border|--shadow)` (grep 19/11, ngoài `components/ui`): `app/globals.css`,
    `app/work/{page,team/page,tu-sinh/page}.tsx`, `components/work/*` (BangTeam, ChiTietViec, DongViec, FormTaoViec,
    GanErp, LuatTuSinh, ThanhHangLoat, TuSinh, ViecCuaToi, XacNhanXoa, ui), `app/wiki/wiki.css`,
    `app/wiki/marketing/{kho-case/[slug],khung/5a,khung/5a/[cat]}/page.tsx`, `components/marketing/AdsResultsView.tsx`,
    và **`bang/OChonTimXa.tsx`** (gói dùng chung — `--border`/`--shadow` inline; khi `bang/` vào DS ở lát 4 phải đổi).
- **Button — việc chuyển lát 2 (review cuối lát 1):**
  - `asChild` + `disabled`/`loading`: `<a>` không có thuộc tính `disabled` → không có kiểu tắt cũng không chặn bấm.
    `bundle.css` có `.ui-btn[aria-disabled="true"]` → khi cần, gắn `aria-disabled` + kiểu `aria-disabled:` + chặn
    `onClick`/`href` (shadcn chưa làm sẵn).
  - `loading` trên nút đang focus: `disabled` làm focus rơi về `body` (mất vị trí bàn phím, screen reader im). Cân nhắc
    loading = `aria-disabled` + `aria-busy` + chặn `onClick` thay cho `disabled`, có test giữ focus.

### 5.2 Token: một nguồn, sinh tự động
- `apps/web/ds/tokens.json` = bản chép nguyên văn từ artifact (ghi phiên bản artifact + sha256 ở `apps/web/ds/NGUON.md`).
- Script `apps/web/ds/sinh-token.mjs` sinh `apps/web/ds/tokens.css` từ `tokens.css` đã biên dịch của artifact (chính bản
  preview artifact dùng, sinh từ `tokens.json`): đổi selector `:root`/`[data-theme]` sang vùng `[data-ds="v2"]`, class
  kiểu chữ thêm tiền tố `ds-` (tránh đè `.text-sm` của Tailwind), `--font-sans` = Inter. Test đối chiếu từng màu trong
  `tokens.json`. File sinh có dòng đầu "không sửa tay".
- `@theme inline` (Tailwind 4) chỉ ánh xạ **màu semantic kiểu shadcn** (`bg-primary`, `text-muted-foreground`,
  `border-input`…) — tên không trùng Tailwind. Bo góc, bóng, cỡ control, màu OpenAI chi tiết dùng cú pháp biến
  `h-(--control-size-md)`, `bg-(--color-background-danger-soft)` như README artifact; **không** khai `--radius-*`,
  `--shadow-*`, `--text-*` trong `@theme` vì sẽ đổi `rounded-md`/`shadow-sm`/`text-sm` mà màn cũ đang dùng.
- Test (vitest): mỗi token trong `tokens.json` có mặt đúng giá trị trong `tokens.css`; chạy lại script không đổi file
  (chống sửa tay).
- Khi artifact đổi: chép `tokens.json` mới → chạy script → chạy so khớp (§5.5). Mỗi lát so với **bản artifact mới nhất
  lúc bắt đầu lát**, ghi số bản vào `NGUON.md`.
- **Tương phản (CEO chốt 19/11): giữ y màu nguồn ChatGPT**, kể cả 4 cặp chưa đạt WCAG (`color-text-danger` nền tối
  3.52:1, viền `input` 1.42/2.28:1, viền Checkbox gray-200 1.6:1, chữ Badge success/warning/danger 3.81–4.39:1). Không
  "sửa giùm"; ghi rõ trong `NGUON.md` là chấp nhận có chủ đích.
- **Màu khu (CEO chốt 19/11): chỉ là dấu nhận diện** — token `--khu` qua `[data-khu]` cho chấm/tên khu trên thanh điều
  hướng; KHÔNG đổi `primary` (nút chính đen) hay `ring` (focus xanh). `DsRoot` không cần biết khu.

### 5.3 Component
- Đặt ở `apps/web/components/ui/<ten>.tsx` (tên shadcn, kebab-case), chép từ nguồn shadcn rồi **tô lại** theo README
  artifact: thay class màu/cỡ bằng utility từ token, đổi icon lucide → Phosphor, gắn portal container.
- **Không chạy `npx shadcn add` thẳng** (`components.json` có `cssVariables: true` → CLI có thể chèn `:root`/`.dark` và
  khoá `@theme` vào `globals.css`, phá luật vùng DS). Chép tay từ registry, hoặc chạy CLI rồi soát + bỏ mọi thay đổi
  `globals.css` trước khi commit.
- Component artifact không có trong shadcn (PageHeader, PropertyList, Timeline, Composer, DetailLayout, Banner, StatCard,
  Count, NotificationCenter, NotificationMatrix, FilterBar, BulkActionBar, SavedView, KanbanBoard, ListView, InlineEdit,
  RecordPicker…) dựng mới trong cùng thư mục, ghép từ component shadcn bên dưới.
- Hành vi lấy theo **prototype đã duyệt** (mô tả trong README artifact; code prototype chỉ là nguồn tham khảo tới khi nhánh bị xoá) (đã sửa ~40 lỗi a11y/tương tác ở đó — ví dụ: Esc không đóng khi đang bận, tab
  Chưa đọc giữ dòng vừa đọc, Ctrl+K vs ⌘K, bộ gõ tiếng Việt đang ghép chữ). Mỗi hành vi đó thành một test.
- **Data view — chia đôi (CEO chốt 19/11):**
  - Logic **dữ liệu** (tìm, lọc, sắp, URL, phân trang, chọn dòng) ở lại gói `bang/`; DS cấp class/wrapper qua
    `giaoDien`, không viết lại. Trong `bang/` chỉ đổi `<select>` trần (`BoLocChon`, `LocNgay`) sang Select DS.
  - Hành vi **giao diện** mà `bang/` không có (kéo/co dãn cột, Kanban, ListView, InlineEdit, RecordPicker, SavedView,
    ⚙ hiển thị, "chọn tất cả qua các trang", tiêu đề cột dính) thành component DS mới trong `components/ui/`, chép
    hành vi từ prototype.
  - Chỗ markup cố định của `bang/` khác DOM `preview.html`: so khớp theo **số đo** (cao, padding, màu…) của phần tử
    tương ứng, không đòi DOM giống hệt.
- **Tiêu đề cột (CEO nhắc lại 19/11):** cột **nhãn/phân loại** (Loại lỗi, Trạng thái, Chủ, Khách, Nguồn…) chỉ có menu
  **lọc theo tag** — liệt kê đúng các tag/giá trị có (vd Main · Rò rỉ nước · Chất lượng nước · App · Chưa phân loại), tick
  nhiều, "Bỏ lọc cột này". **Không** có "Tăng dần/Giảm dần". Sắp xếp chỉ cho cột có thứ tự/số lượng (ưu tiên, hạn, số
  ngày mở, thứ tự tạo) và nói nghĩa bằng lời ("muộn nhất trước"), không ghi "Tăng dần". Component tiêu đề cột nhận
  `kieu: 'sap' | 'loc'` — test chặn cột nhãn nhận `sap`. Tiêu đề gộp ở dạng Danh sách cũng tách: sắp theo ưu tiên/thứ
  tự tạo, lọc theo ưu tiên/loại lỗi.
- Không dùng `<select>` trần cho danh sách > 10 mục (luật `CHUAN-FILTER.md`): Combobox gõ để tìm.

### 5.4 Trang xem `/ds`
- Route `apps/web/app/ds/` (+ `/ds/<component>`), bọc `<DsRoot>`, nút đổi sáng/tối, mỗi component một khối có `#neo`
  (để giao CEO link thẳng tới khối).
- **Chỉ chạy ở dev**: `notFound()` khi `NODE_ENV === 'production'` (giống `/prototype`) → không lộ cho nhân viên.

### 5.5 So khớp với artifact
- `apps/web/ds/tham-chieu/`: bản chép `tokens.css` + `bundle.css` + `components/*/preview.html` của artifact (cùng
  phiên bản với `tokens.json`).
- Script `apps/web/ds/so-khop.mjs` (Chrome headless qua CDP, như script kiểm của prototype): với mỗi component, dựng
  preview artifact và khối tương ứng ở `/ds`, chụp ảnh cạnh nhau (sáng/tối, 1440 và 390), đo `getComputedStyle`
  (cao, padding, gap, bo, cỡ/độ đậm chữ, màu nền/chữ/viền) theo cặp phần tử đánh dấu `data-so="<khoá>"` ở hai bên,
  xuất bảng lệch `apps/web/ds/so-khop/<component>.md` + ảnh vào thư mục bị gitignore.
- Cổng "xong một component": bảng lệch = 0, hoặc mỗi dòng lệch có lý do (vd Radix thêm thuộc tính a11y).

## 6. Danh mục component (theo artifact bản 25)

| Nhóm | Component |
|---|---|
| Nền | Button, Badge, Avatar, Tooltip, Kbd, Alert |
| Form | Input/Label/Textarea, InputAffix (InputGroup), Checkbox, Radio, Switch, Select, Combobox, DatePicker, DateRangePicker, FileUpload, FormLayout |
| Overlay | Dialog, ConfirmDialog (AlertDialog), Sheet, DropdownMenu, ContextMenu |
| Điều hướng | Tabs (segmented + pill), Sidebar (khung F) |
| Data / Data view | Table, DataViewToolbar, FilterBar, Pagination, BulkActionBar, SavedView, ListView, KanbanBoard, InlineEdit, RecordPicker |
| Trang chi tiết | Breadcrumb, PageHeader, PropertyList, Timeline, Composer, DetailLayout |
| Phản hồi | EmptyState, Skeleton (+ nút đang chạy), Banner, Toast (Sonner) |
| Toàn app | CommandPalette (cmdk), StatCard |
| Thông báo | Count, NotificationCenter, NotificationMatrix |

## 7. Cắt lát (tracer bullet — mỗi lát tự demo được, merge được)

1. **Ống dẫn đầu–cuối với Button**: cài shadcn/Radix/Phosphor · `tokens.json` → `tokens.css` + test · `DsRoot` + portal
   · Button · `/ds#button` · script so khớp chạy cho Button. Lát này chứng minh cả dây chuyền.
2. Nền còn lại + Overlay (vì mọi nhóm sau dựa vào portal/focus).
3. Form.
4. Điều hướng + Data/Data view (nối `bang/`).
5. Trang chi tiết + Phản hồi.
6. Toàn app + Thông báo.

Mỗi lát: test + tsc + build sạch → so khớp → ảnh → reviewer độc lập → CEO xem ở `localhost` → commit + push
`rework/v2.0.0` (không merge `main`). Mỗi việc trong lát giao subagent **opus 5.5**, reviewer độc lập soát sau từng việc.

## 8. Môi trường làm việc
- Worktree `gwt-worktrees/rework-v2.0.0`, nhánh `rework/v2.0.0`.
- Cổng dev 3401 (Nền tảng; server prototype đã tắt 19/11).
- **Đồng bộ `main` → rework (CEO chốt 19/11):** đầu mỗi lát kéo `main` vào `rework/v2.0.0` để giữ được fast-forward
  về sau. Nhưng **không nhận 100%**: gộp xong thì soát các commit mới của `main` —
  - dữ liệu/migration/logic nghiệp vụ sạch → giữ;
  - giao diện → sẽ dựng lại bằng DS khi tới màn đó, không chỉnh UI cũ;
  - code chưa sạch (trùng lặp, đường tắt, sai luật repo) → sửa lại ngay trên rework, ghi vào `docs/rework/` mục
    "Soát main" (commit nào, sửa gì, vì sao).
  Fast-forward chỉ cần rework chứa lịch sử của `main`, không cần code giống `main`.
- Prototype đã chốt hết và lưu bản chuẩn trong artifact (bản 26) → nhánh `prototype/v2-khung` không cần giữ làm nguồn
  (CEO 19/11: "xong thì chỉ cần lưu 1 bản trong artifact").
- Không đụng DB.

## 9. Để lại cho người dựng
- Ánh xạ chi tiết từng biến thể shadcn ↔ class artifact (đọc README + `bundle.css` từng component).
- Tên khoá `data-so` cho từng phần tử so khớp.
- Thứ tự component trong mỗi lát.
