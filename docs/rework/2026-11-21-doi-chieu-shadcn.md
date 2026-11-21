# Đối chiếu DS v2 với shadcn/ui gốc + giấy phép (21/11/2026)

Việc chỉ đọc. Không sửa file nào trong `apps/web/`. Phục vụ quyết định của CEO: *"Xem cái nào cần chép thì chép hết. Xong
rồi mới gán token + màu sắc của chatgpt"*, mở rộng thành *lấy HẾT component shadcn về DS, gán token ChatGPT trước, chỉnh
riêng sau*.

## 0. Mốc nguồn

| | |
|---|---|
| Repo | `shadcn-ui/ui`, nhánh `main` |
| **SHA commit đã lấy** | **`45bbf9ba23c9c0f63d38887947e5fb06f59c7da3`** (20/11/2026 14:43 UTC, "chore(deps-dev): bump the deps group (#12775)") |
| Đường dẫn style đã đối chiếu | `apps/v4/registry/new-york-v4/ui/*.tsx` (61 file) + `new-york-v4/hooks/use-mobile.ts` + `new-york-v4/lib/` |
| Tải thêm để so | `apps/v4/registry/bases/{radix,base}/ui/*.tsx`, `apps/v4/registry/styles/style-*.css`, changelog + mdx tài liệu liên quan |
| Bản tải về (chỉ đọc) | `<scratchpad>/shadcn-goc/` (cấu trúc giữ theo `registry/`, có `_SHA.txt`, `_tree.json`) |
| Lấy lại đúng bản | `https://raw.githubusercontent.com/shadcn-ui/ui/45bbf9ba23c9c0f63d38887947e5fb06f59c7da3/apps/v4/registry/new-york-v4/ui/<ten>.tsx` |
| Cập nhật sau này | `https://api.github.com/repos/shadcn-ui/ui/compare/45bbf9b...main`, lọc đường dẫn `new-york-v4/ui/` |

Danh sách component lấy theo ba nguồn thật, không đoán: cây git ở SHA trên (`git/trees?recursive=1`), registry
`new-york-v4/ui/_registry.ts` (tên + `dependencies`), và trang https://ui.shadcn.com/docs/components (đọc 21/11).

**Vì sao `new-york-v4`, không phải `bases/radix`:** `bases/*` là KHUÔN. Class trong đó là tên trừu tượng (`cn-button-variant-default`…).
Khi chạy `shadcn add`, CLI mới thay chúng bằng class Tailwind thật của style người dùng chọn (`packages/shadcn/src/styles/transform-style-map.ts`,
hàm `transformStyleMap` áp lên lời gọi `cva` và thuộc tính `className`). `new-york-v4` là bản đã ra class thật, chép thẳng được. Export của hai
nguồn trùng nhau, trừ `AlertAction` (có trong `bases/radix/alert`) và `useCarousel` (`bases/radix/carousel` export thêm).

## 1. Radix hay Base UI

**Đã kiểm (changelog trong repo ở SHA trên):**

- Tài liệu có **ba** biến thể primitive: `/docs/components/radix/…`, `/docs/components/base/…` (Base UI), `/docs/components/aria/…`
  (React Aria, thêm 17/07/2026). Nguồn: `apps/v4/content/docs/components/{radix,base,aria}/`.
- **Mặc định hiện là Base UI** từ 02/07/2026: "Starting today, **Base UI is the default component library in shadcn/ui**"
  (`changelog/2026-07-base-ui-default.mdx`). Trang tài liệu mở tab Base UI trước. Vì vậy link CEO gửi có `/base/`.
- Radix vẫn được hỗ trợ đầy đủ: "**Radix is not being deprecated.**" Component mới ra cho cả hai thư viện, trừ khi component
  chỉ có ở Base UI (cùng file).
- Registry: style `new-york-v4` = Radix, import gói gộp `radix-ui` (`changelog/2026-02-radix-ui.mdx`). Khuôn `bases/radix`, `bases/base`,
  `bases/aria` dùng cho 8 style mới (vega, nova, maia, lyra, mira, luma, rhea, sera).
- Khác nhau về API: tên export gần như trùng. Changelog Base UI ghi: "Works the same whether you're using Radix or Base UI."
  Khác ở prop và phần nhỏ:
  - `asChild` đổi thành `render` ("`asChild` is now `render`", changelog 2026-07).
  - Export lệch đo được giữa `bases/radix/ui` và `bases/base/ui`:
    - Drawer: Base có thêm `DrawerSwipeHandle`, dùng `@base-ui/react/drawer`. Radix dùng `vaul`.
    - NavigationMenu: Base có `NavigationMenuPositioner`, Radix có `NavigationMenuViewport`.
    - Popover: chỉ Radix có `PopoverAnchor`.
    - Progress: Base có thêm `ProgressTrack`, `ProgressIndicator`, `ProgressLabel`, `ProgressValue`.
  - `toast.tsx` chỉ có ở Base. Bên Radix trang Toast ghi "The toast component has been deprecated. Use the sonner component".
- **Bẫy:** `combobox.tsx` của **cả** `new-york-v4` lẫn `bases/radix` đều import `@base-ui/react`. Combobox của shadcn không có bản Radix.

**Đề xuất mặc định: GIỮ Radix (`radix-ui` 1.8.1).**

| | Giữ Radix (đề xuất) | Chuyển Base UI |
|---|---|---|
| Khối lượng | Chép lại theo `new-york-v4`, không đổi thư viện | Viết lại cả DS: ~33 component primitive, mọi `asChild`, mọi chỗ đọc `data-state` |
| Luật hành vi đã đo | Giữ được: Portal `container`, RovingFocus, `onOpenAutoFocus`, DismissableLayer, `use-nut-mo` | Phải đo lại hết, cả cổng so khớp `ds/so-khop/*.json` |
| Hỗ trợ | Đầy đủ, mọi bản cập nhật ship cả hai thư viện | Là mặc định mới, cộng đồng chọn Base nhiều hơn Radix 2 lần |
| Thiệt | Docs mở tab Base trước, phải bấm sang tab Radix. Component chỉ-Base (Toast mới) không lấy được | Rủi ro đổi thư viện giữa chừng. Chính shadcn viết "the worst thing you can do for your production app is switch component libraries" |
| Combobox | Hai lựa chọn: (a) cài thêm `@base-ui/react` 1.9.0 **chỉ** cho Combobox, có hai thư viện primitive song song; (b) giữ Combobox hiện tại (cmdk + Popover, ghép kiểu cũ của shadcn) | Tự nhiên |

## 2. Bảng đối chiếu `components/ui/`

`components/ui/` có 83 file `.ts/.tsx` (không tính test), gồm:

- 61 file component: 33 file có bản tương ứng trong shadcn, 28 file DS tự làm;
- 17 file `*-styles.ts` và `button-variants.ts`;
- 4 hook.

**Cách xếp mức.** CEO cho phép "thêm phần shadcn không có", nên export hay prop GWT **thêm vào** mà không phá API shadcn vẫn tính là `A`.

- `A`: khung giống shadcn, chỉ khác class/token, có thể có thêm phần GWT.
- `B1`: khung gần giống, nhưng **thiếu** export hoặc biến thể mà shadcn có, hoặc đổi tên prop/file. Bổ sung theo shadcn.
- `B2`: lệch cấu trúc. Gộp file, dựng bằng hàm sinh, đổi API, hoặc tự viết lại hành vi mà shadcn có. Chép lại toàn file.
- `C`: shadcn không có, DS tự làm.

**Nơi dùng.** Đếm theo `import` trong `apps/web/{app,components,bang,lib}`, không tính test, đọc bằng Grep. Repo không có
`.codegraph/` nên không dùng codegraph. Kết quả **không màn nghiệp vụ nào dùng DS v2**: nơi dùng chỉ có `/ds`, `/prototype` và
chính `components/ui`. Khi chép lại còn phải sửa: test `*.dom.test.tsx` của component, config so khớp `ds/so-khop/<c>.json` (chọn
phần tử theo `data-slot`), README `ds/nguon/components/*`.

Cột "Dùng" ghi `ds/proto/ui` = số file import ở `app/ds`, ở `app/prototype` và ở `components/ui`.

### 2a. Component có bản shadcn (33)

| DS | shadcn (registry) | Mức | Lệch | Việc | Dùng ds/proto/ui | Rủi ro khi chép lại |
|---|---|---|---|---|---|---|
| `card.tsx` | `card` | A | Đủ 7 export, cùng `data-slot` | Chỉ soát token | 2/2/1 | Không |
| `checkbox.tsx` | `checkbox` | A | Thêm `ChoiceLabel`, `useNhanChon`, `oChon`. Thiếu slot `checkbox-indicator` | Thêm slot | 5/1/4 | Không |
| `input.tsx` | `input` | A | Thêm prop `icon` (bọc `input-wrap`) | Giữ | 7/4/5 | Không |
| `kbd.tsx` | `kbd` | A | Đủ `Kbd`, `KbdGroup`. Group dùng `span`, shadcn dùng `kbd` | Đổi thẻ theo shadcn | 3/3/2 | Đo lại so khớp Kbd |
| `radio-group.tsx` | `radio-group` | A | Thiếu slot `radio-group-indicator` | Thêm slot | 2/0/0 | Không |
| `skeleton.tsx` | `skeleton` | A | Thêm `SkeletonDong`, `VungDoc` | Giữ | 2/0/2 | Không |
| `textarea.tsx` | `textarea` | A | Giống | Không | 3/0/0 | Không |
| `alert-dialog.tsx` | `alert-dialog` | B1 | Thiếu `AlertDialogHeader/Media/Overlay/Portal` và prop `size` của Content. Action/Cancel thiếu `variant`/`size`. Thừa `AlertDialogBody` | Chép, giữ Body | 0/0/1 (`confirm-dialog`) | ConfirmDialog đổi theo |
| `alert.tsx` | `alert` | B1 | shadcn dùng `variant` (`default`/`destructive`), DS dùng `color` (info…danger). Thừa `AlertActions` (bases có `AlertAction`) | **Quyết định mở Q2** | 3/0/2 | Đổi prop màu |
| `avatar.tsx` | `avatar` | B1 | Thiếu `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`. Thêm `chuCaiDau` | Bổ sung | 6/2/4 | Không đổi cái cũ |
| `badge.tsx` | `badge` | B1 | shadcn: `variant` default/secondary/destructive/outline/ghost/link. DS: `variant` soft/solid × `color` × `size`, thêm `BadgeDot`, `BadgeCaret` | **Q2** | 11/3/4 | Đổi giá trị `variant` |
| `breadcrumb.tsx` | `breadcrumb` | B1 | Thiếu `BreadcrumbSeparator`, `BreadcrumbEllipsis` | Bổ sung | 3/0/0 | Dấu phân cách đang vẽ bằng CSS → chuyển sang phần tử |
| `button.tsx` + `button-variants.ts` | `button` | B1 | Tách `cva` ra file riêng (luật NGUON: hằng không đặt trong file `'use client'`; nhưng `button.tsx` của shadcn **không** có `'use client'`). Thiếu size `xs`, `icon-xs`, `icon-lg`. Thêm `shape`, loading | Bổ sung size. Cân nhắc gộp lại một file như shadcn, bỏ `'use client'` | 32/9/18 | Nhiều nơi import `button-variants` (toggle-group…) |
| `calendar.tsx` + `calendar-styles.ts` | `calendar` | B1 | `CalendarDayButton` không export. Thừa `calendarDay`. Thiếu prop `buttonVariant`, `captionLayout`. Icon Phosphor | Bổ sung export/prop | 1/7/4 | DatePicker ×3 dùng |
| `dialog.tsx` + `dialog-styles.ts` | `dialog` | B1 | Prop `showClose`, shadcn là `showCloseButton`. Thiếu `DialogHeader`, `DialogOverlay`, `DialogPortal`. Thừa `DialogBody` | Đổi tên prop, bổ sung | 1/0/1 | Đổi tên prop ở mọi chỗ gọi |
| `field.tsx` | `field` | B1 | Thiếu `FieldContent`, `FieldGroup`, `FieldSeparator`, `FieldTitle`. Thêm `FieldMeta`. shadcn cần `label` + `separator` | Bổ sung (sau Label/Separator) | 15/5/3 | Không đổi cái cũ |
| `input-affix.tsx` | `input-group` | B1 | **Tên file khác**. Thiếu `InputGroupButton`, `InputGroupText`, `InputGroupTextarea`. Thêm `OTien` | Đổi tên file thành `input-group.tsx`, bổ sung | 2/1/0 | Đổi đường import |
| `popover.tsx` | `popover` | B1 | Thiếu `PopoverHeader`, `PopoverTitle`, `PopoverDescription` | Bổ sung | 0/5/9 | Không |
| `select.tsx` + `control-styles.ts` | `select` | B1 | Thiếu `SelectLabel`, `SelectScrollUpButton`, `SelectScrollDownButton`, prop `size` của Trigger | Bổ sung | 3/0/3 | Không |
| `sheet.tsx` | `sheet` | B1 | Thiếu `showCloseButton` (✕ nằm trong `SheetHeader`, shadcn đặt trong Content). `side` chỉ left/right, shadcn có cả top/bottom. Thừa `SheetBody` | Bổ sung, cân nhắc chuyển ✕ | 2/0/1 | Luật "mọi Sheet phải có SheetHeader" phải xem lại |
| `spinner.tsx` | `spinner` | B1 | shadcn: `svg` `role="status"` `aria-label`, nhận `...props`. DS: `span aria-hidden`, chỉ nhận `className` | Chép, đổi icon | 0/0/4 | Đổi a11y: Button, Combobox, RecordPicker, Toast đặt Spinner trong nút/toast đã có chữ → `role="status"` sẽ đọc thừa "Loading". Chỗ đó truyền `aria-hidden` |
| `switch.tsx` | `switch` | B1 | Thiếu `size` (sm/default). Thêm `SwitchRow` | Bổ sung | 2/0/0 | Không |
| `table.tsx` + `table-styles.ts` | `table` | B1 | shadcn `Table` tự bọc `div[data-slot=table-container]`, DS tách ra `TableWrap`. Thiếu `TableCaption`. Thêm `variant`, `BangTrangThai`, `KeoCtx`, `useOKeo` | Bổ sung Caption, xem lại container | 3/2/2 | Đổi DOM bọc → so khớp Table, ListView |
| `tabs.tsx` + `tabs-styles.ts` | `tabs` | B1 | shadcn `variant` default/line + `tabsListVariants`. DS `variant` segmented/pill + `thuGon`, thêm `TabsCount` | **Q2** (tên giá trị biến thể) | 2/0/1 | Đổi giá trị `variant` |
| `toast.tsx` + `toast-styles.ts` | `sonner` | B1 | **Tên file khác**. shadcn chỉ export `Toaster` (dùng `next-themes`). DS thêm API `thongBao` + `toast.custom` | Đổi tên thành `sonner.tsx`, giữ `thongBao` | 8/2/3 | Đổi đường import ở 13 file |
| `toggle-group.tsx` | `toggle` + `toggle-group` | B1 | **Gộp hai file**. Thiếu `toggleVariants`. shadcn ToggleGroup truyền `variant`/`size`/`spacing` qua context, DS dùng `buttonVariants` | Tách `toggle.tsx`, chép context | 0/3/1 | Đổi import `Toggle` |
| `combobox.tsx` | `combobox` | B2 | shadcn: 16 export trên `@base-ui/react`. DS: 2 export (`Combobox`, `ComboboxPanel`) trên cmdk + Popover | **Quyết định mở Q3** | 1/0/1 | Viết lại nếu theo shadcn |
| `command-palette.tsx` + `command-styles.ts` | `command` | B2 | Thiếu hẳn `command.tsx` (Command, CommandDialog, CommandInput, List, Empty, Group, Item, Shortcut, Separator). DS ghép thẳng cmdk + Dialog | Chép `command.tsx`, dựng CommandPalette lại trên đó | 1/0/0 | Bên trong đổi, API CommandPalette giữ được |
| `context-menu.tsx` | `context-menu` | B2 | Sub, CheckboxItem, RadioGroup/RadioItem, Shortcut, Group sinh bằng `taoPhanMenu` của dropdown-menu, có ép kiểu `as unknown as typeof DropdownMenuPrimitive`. Thiếu `ContextMenuPortal`, prop `inset`. Thêm `MenuTimKiem` và luật APG cho mục `disabled` | Chép toàn file theo shadcn, giữ `itemDisabled`, `phim`, `MenuTimKiem` | 4/2/2 | Lát 7 + Task 4 (`khoi-menu-thuoc-tinh`) đang dùng |
| `dropdown-menu.tsx` + `menu-styles.ts` | `dropdown-menu` | B2 | Như trên: dựng bằng hàm sinh `taoPhanMenu`. Thiếu `DropdownMenuPortal`, prop `inset` trên Item/Label/SubTrigger/CheckboxItem/RadioItem. Có thừa: `Shortcut` nhận `phim`, `SubTrigger` nhận `icon`/`phim` | Chép toàn file, mỗi `DropdownMenu*` một hàm như shadcn. Bỏ `taoPhanMenu` | 5/2/6 | Như trên. Export tên công khai giữ nguyên, chỉ mất `taoPhanMenu` |
| `empty-state.tsx` + `feedback-styles.ts` | `empty` | B2 | shadcn ghép 6 phần (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`). DS một component props | Chép `empty.tsx`. `EmptyState` thành mẫu ghép GWT trên đó | 2/0/2 | Không, nếu giữ `EmptyState` |
| `sidebar.tsx` + `sidebar-styles.ts` | `sidebar` (+ `hooks/use-mobile`) | B2 | shadcn có 24 export + `useSidebar`. DS chỉ `KhungApp`, `Khu`, `MucMenu` (khung app riêng: rail, dock, bấp) | Chép `sidebar.tsx`, dựng `KhungApp` lại trên đó | 1/0/0 | Lớn: hành vi bàn phím, tip, ngăn kéo điện thoại |
| `tooltip.tsx` | `tooltip` | B2 | shadcn có 4 export (`Tooltip` = Root, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`). DS chỉ một `Tooltip` nhận prop `content`, kèm luật riêng (không mở khi `aria-expanded`, giữ khi focus phím) | Chép 4 export. Hàm tiện GWT đổi tên → **Q1** | 3/0/6 | **Trùng tên `Tooltip`** → đổi mọi chỗ gọi: `bang-ds`, `composer`, `data-view-toolbar`, `file-upload`, `page-header`, `sidebar` + 3 file ở `app/ds` |

### 2b. DS tự làm, shadcn không có (`C`, 28 component + 4 hook)

| DS | Ghi chú / ghép từ shadcn nào sau khi chép |
|---|---|
| `confirm-dialog.tsx` | Ghép trên AlertDialog |
| `date-picker.tsx`, `date-range-picker.tsx`, `date-time-picker.tsx`, `time-input.tsx` | Trang tài liệu Date Picker của shadcn chỉ là **mẫu ghép** Popover + Calendar, không có file registry. DS làm đúng cách đó |
| `bang-ds.tsx`, `tieu-de-cot.tsx`, `list-view.tsx`, `data-view-toolbar.tsx`, `saved-view.tsx`, `xem-nhanh.tsx`, `kanban-board.tsx` | Data Table của shadcn là mẫu ghép trên TanStack Table, không có file. DS theo R8 (không TanStack) → giữ |
| `form-layout.tsx` | shadcn `form.tsx` (react-hook-form) → **Q4** |
| `banner.tsx`, `stat-card.tsx`, `count.tsx` | Ghép trên Alert / Card / Badge |
| `page-header.tsx`, `detail-layout.tsx`, `property-list.tsx`, `timeline.tsx` | Có thể ghép trên Item / Resizable / Separator |
| `composer.tsx`, `file-upload.tsx` | Có thể ghép trên InputGroup + Textarea, Attachment, Progress |
| `notification-center.tsx`, `notification-matrix.tsx`, `inline-edit.tsx`, `record-picker.tsx` | Ghép trên Item, Table, Popover, Command |
| `ds-root.tsx`, `font-inter.ts` | Hạ tầng vùng DS + portal + font |
| `use-cot-bang.ts`, `use-mo-bang-chuot.ts`, `use-nut-mo.ts`, `use-trigger-chon.ts` | Hook GWT. shadcn chỉ có `use-mobile` (Sidebar cần) |

File styles đi theo component của nó:

- `bang-styles`, `data-view-styles`, `detail-styles`, `inline-edit-styles`, `kanban-styles`, `list-view-styles`, `notif-styles`: thuộc
  nhóm C, không đổi.
- `control-styles`, `dialog-styles`, `menu-styles`, `table-styles`, `tabs-styles`, `toast-styles`, `sidebar-styles`, `command-styles`,
  `calendar-styles`, `feedback-styles`, `button-variants`: đổi cùng đợt với component dùng chúng (mục 4).

### 2c. Danh mục đầy đủ shadcn ↔ DS (theo trang thật)

Trang https://ui.shadcn.com/docs/components (tab mặc định Base) liệt kê 66 mục. Tab Radix (`components/radix/meta.json`) có 68
mục: thêm `form` và `sonner`, còn `toast` chỉ là trang báo deprecated. Phiên bản npm đọc từ `registry.npmjs.org/<goi>/latest` ngày
21/11. **Chỉ ghi, chưa cài.**

| Mục | File registry (new-york-v4) | DS có chưa | Gói npm mới cần (bản mới nhất) | Đề xuất |
|---|---|---|---|---|
| Accordion | `accordion` | Chưa | — (`radix-ui` có sẵn) | Có: trang chi tiết, wiki, cài đặt |
| Alert | `alert` | Có (B1) | — | — |
| Alert Dialog | `alert-dialog` | Có (B1) | — | — |
| Aspect Ratio | `aspect-ratio` | Chưa | — | Có (rẻ): ảnh sản phẩm |
| Attachment | `attachment` | Chưa (FileUpload tự vẽ) | — | Có: tệp đính kèm ticket/Composer |
| Avatar | `avatar` | Có (B1) | — | — |
| Badge | `badge` | Có (B1) | — | — |
| Breadcrumb | `breadcrumb` | Có (B1) | — | — |
| Bubble | `bubble` | Chưa | — | Để đợt chat/AI |
| Button | `button` | Có (B1) | — | — |
| Button Group | `button-group` | Chưa | — (cần `separator`) | Có |
| Calendar | `calendar` | Có (B1) | registry ghi thêm `date-fns` (4.4.0) nhưng file không import → không cần | — |
| Card | `card` | Có (A) | — | — |
| Carousel | `carousel` | Chưa | `embla-carousel-react` 8.6.0 | Chép theo lệnh "lấy hết", dùng ít |
| Chart | `chart` | Chưa | `recharts` (registry ghim 3.8.0; mới nhất 3.11.0) | Có: dashboard Kế toán/Sales |
| Checkbox | `checkbox` | Có (A) | — | — |
| Code Block | *(chỉ ở `bases/*`, không có trong new-york-v4)* | Chưa | highlighter riêng | Không: phải tự dịch class `cn-*` |
| Collapsible | `collapsible` | Chưa | — | Có |
| Combobox | `combobox` | Có (B2, khác lõi) | `@base-ui/react` 1.9.0 | Q3 |
| Command | `command` | Chưa (CommandPalette tự ghép) | — (`cmdk` 1.1.1 có sẵn) | Có: nền cho CommandPalette/RecordPicker |
| Context Menu | `context-menu` | Có (B2) | — | — |
| Data Table | *(mẫu ghép, không file)* | Có dạng C | `@tanstack/react-table` | Không (R8) |
| Date Picker | *(mẫu ghép, không file)* | Có (C) | — | — |
| Dialog | `dialog` | Có (B1) | — | — |
| Direction | `direction` | Chưa | — | Không cần (app không RTL). Chép được nếu muốn đủ bộ |
| Drawer | `drawer` | Chưa | `vaul` 1.1.2 (bản Radix). Bản Base UI dùng `@base-ui/react/drawer` | Có: sheet đáy trên điện thoại |
| Dropdown Menu | `dropdown-menu` | Có (B2) | — | — |
| Empty | `empty` | Có dạng `EmptyState` (B2) | — | — |
| Field | `field` | Có (B1) | — | — |
| Form *(chỉ tab Radix)* | `form` | Chưa (DS có FormLayout) | `react-hook-form` 7.92.0, `@hookform/resolvers` 7.0.8, `zod` 4.6.7 | Q4 |
| Hover Card | `hover-card` | Chưa | — | Có: xem nhanh khách/mã |
| Input | `input` | Có (A) | — | — |
| Input Group | `input-group` | Có ở `input-affix.tsx` (B1) | — | — |
| Input OTP | `input-otp` | Chưa | `input-otp` 1.5.0 | Thấp (đăng nhập Google). Chép theo "lấy hết" |
| Item | `item` | Chưa | — | Có: thông báo, danh sách |
| Kbd | `kbd` | Có (A) | — | — |
| Label | `label` | Chưa có file riêng (FieldLabel tự gọi Radix Label) | — | Có: Field / Form của shadcn phụ thuộc |
| Marker | `marker` | Chưa | — | Chưa đọc kỹ công dụng. Để đợt chat/AI |
| Menubar | `menubar` | Chưa | — | Thấp. Dùng chung `menu-styles` |
| Message | `message` | Chưa | — | Đợt chat/AI |
| Message Scroller | `message-scroller` | Chưa | `@shadcn/react` 0.3.1 (đòi react ≥ 19) | Đợt chat/AI |
| Native Select | `native-select` | Chưa | — | Có, nhưng chỉ cho danh sách ≤ 10 mục (`docs/CHUAN-FILTER.md`) |
| Navigation Menu | `navigation-menu` | Chưa | — | Thấp (app dùng Sidebar) |
| Pagination | `pagination` | Chưa ở `components/ui` (artifact có preview; `bang/PhanTrang.tsx` là bản cũ) | — | Có |
| Popover | `popover` | Có (B1) | — | — |
| Progress | `progress` | Chưa (FileUpload/Toast tự vẽ thanh) | — | Có |
| Questionnaire | *(chỉ ở `bases/*`)* | Chưa | — | Không |
| Radio Group | `radio-group` | Có (A) | — | — |
| Resizable | `resizable` | Chưa | `react-resizable-panels` 4.24.1 (registry `^4`) | Có: DetailLayout, bảng + xem nhanh |
| Scroll Area | `scroll-area` | Chưa | — | Có |
| Select | `select` | Có (B1) | — | — |
| Separator | `separator` | Chưa | — | Có: Field / ButtonGroup / Item / Sidebar phụ thuộc |
| Sheet | `sheet` | Có (B1) | — | — |
| Sidebar | `sidebar` | Có dạng KhungApp (B2) | — (cần `use-mobile`) | — |
| Skeleton | `skeleton` | Có (A) | — | — |
| Slider | `slider` | Chưa | — | Chép theo "lấy hết" |
| Sonner *(tab Radix)* | `sonner` | Có ở `toast.tsx` (B1) | `next-themes` 0.4.6 nếu chép nguyên. DS tự đặt theme → không cần | — |
| Spinner | `spinner` | Có (B1) | — | — |
| Switch | `switch` | Có (B1) | — | — |
| Table | `table` | Có (B1) | — | — |
| Tabs | `tabs` | Có (B1) | — | — |
| Textarea | `textarea` | Có (A) | — | — |
| Toast *(chỉ Base UI)* | *(không có ở new-york-v4)* | Không áp dụng | — | Radix dùng Sonner |
| Toggle | `toggle` | Có, gộp trong `toggle-group.tsx` (B1) | — | — |
| Toggle Group | `toggle-group` | Có (B1) | — | — |
| Tooltip | `tooltip` | Có (B2) | — | — |
| Trace | *(chỉ ở `bases/*`)* | Chưa | — | Không |
| Typography | *(chỉ trang tài liệu, không file)* | — | — | Không: DS có thang chữ riêng |

Khi chép, mọi file shadcn phải đổi ba thứ: `import { cn } from "cn"` → `@/lib/utils` (shadcn chuyển sang gói `cn` từ 03/09/2026,
`changelog/2026-09-cn.mdx`; giữ `@/lib/utils` thì không phải thêm phụ thuộc); icon `lucide-react` → Phosphor (spec §2 đã chốt);
Portal truyền `container={useDsPortal()}` (luật NGUON).

## 3. Giấy phép

| Gói | Giấy phép | Chủ bản quyền (nguyên văn) | Nguồn | Mức |
|---|---|---|---|---|
| shadcn/ui | MIT | "Copyright (c) 2023 shadcn" | https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md (sha256 trùng với bản ở SHA trên) | **Đã kiểm**: đọc hết file |
| `@openai/apps-sdk-ui` 0.2.2 | MIT | "Copyright 2025 OpenAI" | https://raw.githubusercontent.com/openai/apps-sdk-ui/main/LICENSE · https://registry.npmjs.org/@openai/apps-sdk-ui/0.2.2 (`"license":"MIT"`) · `package/LICENSE` trong tarball 0.2.2 | **Đã kiểm**: LICENSE tarball trùng LICENSE repo |
| `radix-ui` 1.8.1 | MIT | "Copyright (c) 2022 WorkOS" | https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE · https://registry.npmjs.org/radix-ui/latest | **Đã kiểm** LICENSE repo + trường registry. LICENSE trong tarball chưa mở |
| `cmdk`, `sonner`, `react-day-picker`, `vaul`, `tailwind-merge`, `input-otp`, `embla-carousel-react`, `recharts`, `react-resizable-panels`, `@base-ui/react`, `react-hook-form`, `zod`, `next-themes`, `@shadcn/react` | MIT | — | trường `license` ở `registry.npmjs.org/<goi>/latest` | **Đã kiểm** trường registry. File LICENSE chưa mở |
| `class-variance-authority` | Apache-2.0 | — | như trên | Đã kiểm trường registry |
| `lucide-react` | ISC | — | như trên | Đã kiểm trường registry. DS không dùng (Phosphor) |

**Điều kiện khi chép:**

- **shadcn (đã kiểm):** điều kiện duy nhất của MIT là notice "shall be included in all copies or substantial portions of the Software"
  (LICENSE.md). Trang https://ui.shadcn.com/docs không có điều khoản ghi công nào khác. Trang viết "This is not a component library.
  It is how you build your component library.", tức khuyến khích chép về rồi sửa.
- **OpenAI Apps SDK UI (đã kiểm văn bản giấy phép):** MIT chuẩn, không giới hạn chỉ dùng cho ChatGPT Apps. Câu "for building
  high-quality ChatGPT apps" trong README chỉ là mô tả, không phải điều khoản. Repo và tarball không có NOTICE hay TRADEMARK.
  → Lấy giá trị token và CSS (gốc của `ds/nguon/bundle.css`, dòng 2 ghi "diện mạo OpenAI Apps SDK UI 0.2.2") cho app nội bộ là hợp
  lệ, **với điều kiện giữ notice "Copyright 2025 OpenAI" + toàn văn MIT**.
- **Đang đoán:** giá trị token (số, mã màu) có tính là "substantial portion" hay không thì chưa rõ. Cứ giữ notice cho chắc.
- **Đang đoán:** MIT không cấp quyền thương hiệu. Kit có icon logo OpenAI/Sora/GPT (`OpenaiLogoBold`…) → không dùng các icon đó.
  DS hiện dùng Phosphor nên không vướng.
- Font: kit không đóng gói font. Riêng `katex.min.css` của kit gọi font từ `cdn.openai.com`, không dùng file đó.
- **Repo hiện CHƯA có notice** cho shadcn và OpenAI. Grep `Copyright|MIT License|LICENSE` trong `apps/web` chỉ ra notice của Inter.
  **Đề xuất** (chưa làm, vì việc này chỉ được tạo 1 file): thêm `apps/web/components/ui/THIRD-PARTY-NOTICES.md` ghi toàn văn MIT
  của shadcn (2023 shadcn), OpenAI (2025 OpenAI) và Radix (2022 WorkOS). Làm trong đợt 0.

## 4. Kế hoạch đợt chép

Mỗi đợt có danh sách file riêng, đợt sau không sửa lại file của đợt trước. "Song song" = hai agent ở hai worktree không đụng
nhau. Mỗi đợt làm theo thứ tự:

1. Chép nguyên văn từ SHA `45bbf9b`.
2. Đổi `cn`, icon, Portal.
3. Gán token ChatGPT. Lấy giá trị class từ `bundle.css` / `*-styles.ts` hiện có.
4. Ghép lại phần GWT: `itemDisabled` APG, `use-nut-mo`, `phim`, `MenuTimKiem`…
5. Chạy test, `npm run lint`, `tsc`, so khớp.

| Đợt | Nội dung | File | Phụ thuộc | Song song? |
|---|---|---|---|---|
| 0 | Nền + chốt câu hỏi | mới: `label.tsx`, `separator.tsx`, `THIRD-PARTY-NOTICES.md`. Chốt Q1–Q4 | — | — |
| **1** | **Menu (lát 7 đang dùng, ưu tiên)** | `dropdown-menu.tsx`, `context-menu.tsx`, `menu-styles.ts`, mới `menubar.tsx`. Test `dropdown-menu`/`context-menu`/`menu-con`/`menu-mep`. Khối `/ds` menu | Chờ Task 4 (`khoi-menu-thuoc-tinh*`, `dk-l7-4.ts`) xong và commit | Với đợt 2, 4 |
| 2 | Overlay | `dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx`, `dialog-styles.ts`, `confirm-dialog.tsx`, mới `drawer.tsx` (`vaul`) | Đợt 0 | Với 1, 4 |
| 3 | Pop nổi | `popover.tsx`, `tooltip.tsx`, mới `hover-card.tsx`. Sửa chỗ gọi Tooltip (theo Q1): `bang-ds.tsx`, `composer.tsx`, `data-view-toolbar.tsx`, `file-upload.tsx`, `page-header.tsx`, `app/ds/_khung/nut-chep.tsx`, `app/ds/_khoi/khoi-tooltip.tsx`, `khoi-page-header.tsx` | Q1 | Không chạy cùng đợt 6: `sidebar.tsx` cũng gọi Tooltip, sửa chỗ gọi đó ở đợt 6 |
| 4 | Ô nhập | `select.tsx`, `control-styles.ts`, `switch.tsx`, `field.tsx`, `input-affix.tsx` → `input-group.tsx`, `checkbox.tsx`, `radio-group.tsx`, mới `native-select.tsx`, `input-otp.tsx`, `slider.tsx` | Đợt 0 (`label`, `separator`) | Với 1, 2 |
| 5 | Hiển thị | `button.tsx` + `button-variants.ts`, `badge.tsx`, `alert.tsx`, `avatar.tsx`, `breadcrumb.tsx`, `spinner.tsx`, `kbd.tsx`, `card.tsx`, `skeleton.tsx`, `empty-state.tsx` + `feedback-styles.ts`, mới `empty.tsx`, `button-group.tsx`, `item.tsx`, `progress.tsx`, `pagination.tsx`, `aspect-ratio.tsx`, `accordion.tsx`, `collapsible.tsx`, `scroll-area.tsx`, `attachment.tsx` | Q2. Sau đợt 1–4, vì Button nằm trong gần mọi file | Không |
| 6 | Điều hướng + bảng | `tabs.tsx` + `tabs-styles.ts`, `toggle-group.tsx` → tách thêm `toggle.tsx`, `table.tsx` + `table-styles.ts`, `sidebar.tsx` + `sidebar-styles.ts`, mới `hooks/use-mobile.ts`, `navigation-menu.tsx`, `resizable.tsx` | Đợt 3, 5 | Không |
| 7 | Lệnh + chọn + lịch + thông báo | mới `command.tsx`. `command-palette.tsx` + `command-styles.ts` dựng lại trên nó, `combobox.tsx` (Q3), `calendar.tsx` + `calendar-styles.ts`, `toast.tsx` → `sonner.tsx` + `toast-styles.ts` | Đợt 2, 3 | Không |
| 8 | Biểu đồ + chat/AI (tuỳ) | mới `chart.tsx` (`recharts`), `carousel.tsx` (`embla-carousel-react`), `message.tsx`, `message-scroller.tsx` (`@shadcn/react`), `bubble.tsx`, `marker.tsx`, `direction.tsx` | Đợt 5 | Có |

Sau đợt 7, rà nhóm C (mục 2b) để ghép lại trên các primitive mới. Đây là việc riêng, không nằm trong đợt chép.

## 5. Quyết định mở (cần CEO chốt trước đợt liên quan)

- **Q1 Tooltip:** shadcn dùng tên `Tooltip` cho Root. Hàm tiện hiện tại (`<Tooltip content=…>`) phải đổi tên để giữ luật riêng
  (đóng khi `aria-expanded`, giữ khi focus phím). **Đề xuất:** export đủ 4 phần của shadcn, hàm tiện GWT đổi thành `TooltipNhanh`.
- **Q2 Tên biến thể màu:** NGUON chốt "màu luôn là `color`" (Alert, Badge, ConfirmDialog). shadcn dùng `variant`
  (`default`/`destructive`/`secondary`/`outline`…); Tabs dùng `default`/`line`. **Đề xuất:** giữ `variant` với đúng các giá trị
  của shadcn, coi `color` (và `soft`/`solid`, `segmented`/`pill`) là phần GWT thêm. Luật NGUON sửa theo.
- **Q3 Combobox:** (a) cài `@base-ui/react` 1.9.0, chép Combobox shadcn (hai thư viện primitive); (b) giữ bản cmdk + Popover, ghi là
  "C có chủ đích". **Đề xuất (b) tới khi màn nghiệp vụ cần chip chọn nhiều.** (a) là đường shadcn, nhưng thêm một thư viện.
- **Q4 Form:** shadcn `form.tsx` cần `react-hook-form` + `zod` + `@hookform/resolvers`. DS có FormLayout + server action.
  **Đề xuất:** chưa chép. Trang Form tab Base cũng không còn liệt kê mục này.
- **Radix hay Base UI:** đề xuất giữ Radix (mục 1).

## 6. Chưa kiểm

- Chưa diff từng dòng class/hành vi của 33 component. Bảng mức dựa trên export, `data-slot`, prop chính, import (script trích +
  đọc tay các file chính). Chi tiết class đo ở bước chép của từng đợt.
- Chưa đọc mdx tài liệu từng component (cách dùng, a11y) ngoài Drawer, Toast, Sonner, Date Picker, Data Table, Table, Typography.
- Marker, Bubble, Attachment, Questionnaire, Trace: mới biết tên + export, chưa đọc công dụng.
- File LICENSE trong tarball của `radix-ui` và các gói phụ thuộc: mới đọc trường `license` trên registry.
- Giấy phép gói `cn` (shadcn-ui/cn): chưa kiểm. DS không cần gói này nếu giữ `@/lib/utils`.
- Chính sách thương hiệu OpenAI: chưa đọc.
- Bản trang tài liệu hiển thị ngày 21/11 so với nội dung repo ở SHA trên: danh sách khớp ở 66 mục tab Base. Tab Radix lấy từ `meta.json`
  trong repo, chưa mở trang thật.
