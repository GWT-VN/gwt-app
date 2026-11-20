Hệ thiết kế cho **GWT App** (webapp nội bộ nhiều khu: CSKH, Sales, Việc…): **component và cấu trúc tương tác lấy từ shadcn/ui, diện mạo lấy từ OpenAI Apps SDK UI 0.2.2**. Màu, chữ, khoảng cách, chiều cao control, viền, bo góc, bóng và focus đều đi qua token có tên nguồn OpenAI; component shadcn chỉ được tô lại, không thay bằng component React của OpenAI.

Nguồn: `openai/apps-sdk-ui` commit `0f00143c` (v0.2.2, MIT), bản lưu ở `GWT-VN/gwt-app` nhánh `docs/nen-tang-openai-ds`, `docs/design-system/` — 4 file CSS đã đối chiếu SHA-256 khớp `SOURCE.json`. Component shadcn theo tài liệu chính thức ui.shadcn.com (Tailwind v4).

## Nguyên tắc dùng

1. **Gọi token theo vai trò shadcn trong component** (`bg-primary`, `border-input`, `ring-ring`…); token OpenAI (`--color-background-*`, `--control-*`) dùng khi shadcn không có vai trò tương ứng (hover/active, disabled, trạng thái màu).
2. **Không đặt số trần.** Chiều cao control = `control-size-*`, padding control = `control-gutter-*`, bo = `radius-*`, bóng = `shadow*`. Số OpenAI không có token (ví dụ gap 6px của Button) ghi nguồn bên cạnh trong `bundle.css`.
3. **Giữ nghiệp vụ.** Đổi diện mạo không đổi nhãn, dữ liệu, trạng thái, hành động hay phân quyền. Logic lọc/tìm/sắp/phân trang giữ ở `apps/web/bang/`; DS chỉ thay lớp áo.
4. **Mọi màn đầy đủ trạng thái** khi liên quan: mặc định, hover, focus-visible, disabled, đang tải, lỗi, rỗng.
5. **Phạm vi sáng/tối và breakpoint chốt theo từng màn.** DS khai báo cả Light và Dark vì nguồn có cả hai; không tự bật Dark cho màn chưa yêu cầu.

## Nội dung và giọng văn

- Tiếng Việt có dấu, câu ngắn, động từ đầu nút: "Lưu thay đổi", "Xuất Excel", "Xoá đơn". Không viết hoa từng chữ; chỉ viết hoa chữ đầu câu và tên riêng.
- Xưng hô trung tính, nói việc cần làm: "Số điện thoại phải có 10 chữ số", không "Lỗi nhập liệu".
- Hộp xác nhận xoá nói rõ hậu quả: "Đơn và lịch sử xử lý sẽ bị xoá vĩnh viễn. Thao tác này không hoàn tác được."
- Danh sách cắt bớt phải nói ra: "Đang hiện 30 / 328 mục — gõ thêm để thu hẹp".
- Dữ liệu minh hoạ luôn mang chữ "Demo" (`DH-DEMO-0128`, "Công ty Demo An Phát"); không dùng tên, số điện thoại, mã khách thật.
- Số tiền định dạng vi-VN có dấu chấm hàng nghìn, đơn vị ở tiêu đề cột ("Thành tiền (₫)"); ngày `dd/mm/yyyy`.
- Không dùng emoji trong giao diện.

## Ánh xạ token shadcn → OpenAI

Mỗi biến shadcn trỏ tới đúng một token semantic OpenAI. Giá trị light/dark là giá trị thật sau khi giải `light-dark()`; giá trị trong suốt ghi kèm màu tương đương trên `background`.

| shadcn | OpenAI semantic | Biểu thức nguồn | Light | Dark |
| --- | --- | --- | --- | --- |
| `--background` | `--color-surface` | `light-dark(var(--gray-0), var(--gray-200))` | #ffffff | #212121 |
| `--foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--card` | `--color-surface` | `light-dark(var(--gray-0), var(--gray-200))` | #ffffff | #212121 |
| `--card-foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--popover` | `--color-surface-elevated` | `light-dark(var(--gray-0), var(--gray-300))` | #ffffff | #303030 |
| `--popover-foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--primary` | `--color-background-primary-solid` | `light-dark(var(--gray-900), var(--gray-950))` | #181818 | #f3f3f3 |
| `--primary-foreground` | `--color-text-primary-solid` | `var(--color-text-inverse)` | #ffffff | #0d0d0d |
| `--secondary` | `--color-background-secondary-soft` | `light-dark(var(--gray-100), var(--gray-300))` | #ededed | #303030 |
| `--secondary-foreground` | `--color-text-secondary-soft` | `var(--color-text)` | #0d0d0d | #ffffff |
| `--muted` | `--color-surface-tertiary` | `light-dark(var(--gray-75), var(--gray-50))` | #f3f3f3 | #131313 |
| `--muted-foreground` | `--color-text-secondary` | `light-dark(var(--gray-500), var(--gray-700))` | #5d5d5d | #afafaf |
| `--accent` | `--color-background-primary-ghost-hover` | `light-dark(var(--alpha-08), var(--alpha-12))` | rgba(13, 13, 13, 0.08) ≈ #ececec | rgba(255, 255, 255, 0.12) ≈ #3c3c3c |
| `--accent-foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--destructive` | `--color-background-danger-solid` | `var(--red-500)` | #e02e2a | #e02e2a |
| `--destructive-foreground` | `--color-text-danger-solid` | `var(--white)` | #ffffff | #ffffff |
| `--border` | `--color-border` | `light-dark(var(--alpha-10), var(--alpha-12))` | rgba(13, 13, 13, 0.1) ≈ #e7e7e7 | rgba(255, 255, 255, 0.12) ≈ #3c3c3c |
| `--input` | `--color-border-primary-outline` | `light-dark(var(--alpha-16), var(--alpha-25))` | rgba(13, 13, 13, 0.16) ≈ #d8d8d8 | rgba(255, 255, 255, 0.25) ≈ #595959 |
| `--ring` | `--color-ring` | `light-dark(var(--blue-500), var(--blue-400))` | #0169cc | #0285ff |
| `--sidebar` | `--color-surface-secondary` | `light-dark(var(--gray-50), var(--gray-100))` | #f9f9f9 | #181818 |
| `--sidebar-foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--sidebar-primary` | `--color-background-primary-solid` | `light-dark(var(--gray-900), var(--gray-950))` | #181818 | #f3f3f3 |
| `--sidebar-primary-foreground` | `--color-text-primary-solid` | `var(--color-text-inverse)` | #ffffff | #0d0d0d |
| `--sidebar-accent` | `--color-background-primary-soft-alpha` | `light-dark(var(--alpha-08), var(--alpha-12))` | rgba(13, 13, 13, 0.08) ≈ #ececec | rgba(255, 255, 255, 0.12) ≈ #3c3c3c |
| `--sidebar-accent-foreground` | `--color-text` | `var(--gray-1000)` | #0d0d0d | #ffffff |
| `--sidebar-border` | `--color-border` | `light-dark(var(--alpha-10), var(--alpha-12))` | rgba(13, 13, 13, 0.1) ≈ #e7e7e7 | rgba(255, 255, 255, 0.12) ≈ #3c3c3c |
| `--sidebar-ring` | `--color-ring` | `light-dark(var(--blue-500), var(--blue-400))` | #0169cc | #0285ff |

Vì sao chọn như vậy:
- **`primary` = đen/gần trắng, không phải màu thương hiệu.** OpenAI không có màu thương hiệu cho nút chính; nút chính là `color-background-primary-solid`. GWT chưa đưa màu thương hiệu vào DS này (xem Quyết định còn mở).
- **`secondary` lấy biến thể *soft*** (`gray-100`), vì shadcn secondary là nút nền xám nhạt. `color-background-secondary-solid` (gray-500) của OpenAI là nút đặc màu xám, không phải vai trò này.
- **`accent` là nền hover/đang chọn** (`color-background-primary-ghost-hover`, alpha 8%/12%) — đúng vai trò shadcn dùng trong Menu, Select, Combobox, Sidebar. Không dùng `accent` làm màu nhấn thương hiệu.
- **`card` = `background`**, card tách bằng viền `border`; lớp nổi (`popover`) mới dùng `color-surface-elevated` — ở Dark lớp nổi sáng hơn nền (#303030 trên #212121), đúng cách OpenAI tạo độ sâu.
- **`input` = `color-border-primary-outline`** — chính là `--input-outline-border-color` của Input OpenAI; `border` = `color-border` cho viền khối.
- **`destructive-foreground` là mở rộng GWT**: shadcn v4 đã bỏ, viết cứng `text-white`; giữ token để chữ trên nền đỏ cũng đi qua token.
- **Trạng thái success/warning/danger/info không cần token mới**: dùng thẳng cặp OpenAI `color-background-<màu>-soft-alpha` + `color-text-<màu>-soft` (Badge) và `…-surface` (Alert).
- **Chart chưa ánh xạ**: OpenAI không có token biểu đồ và chưa màn nào cần; thêm khi chốt màn có biểu đồ.

## Màu

- Nền trang `background`; vùng lùi (TabsList, dòng tổng, skeleton) `muted`; điều hướng trái `sidebar`; lớp nổi `popover`.
- Chữ chính `foreground`; chữ phụ, nhãn cột, meta `muted-foreground`. `color-text-tertiary` chỉ cho placeholder — dưới 4.5:1 ở Light.
- Viền khối, kẻ bảng `border`; viền ô nhập và nút outline `input`; focus `ring`.
- Màu trạng thái luôn đi theo cặp nền/chữ cùng tên vai trò (`…-success-soft-alpha` với `color-text-success-soft`), luôn kèm chữ, không chỉ màu.
- Thang `gray-*` tự đảo theo theme (gray-100 Light = #ededed, Dark = #181818); thang màu `green/red/…-*` giống nhau ở hai theme. Component không gọi thẳng primitive trừ chỗ nguồn OpenAI làm vậy (Checkbox, Tabs).

## Chữ

- Font: `font-sans` = **Inter** (chốt 18/11/2026, mở rộng GWT thay system stack của OpenAI), dự phòng `ui-sans-serif, system-ui`. App nạp **Inter chính chủ** (rsms v4.1, OFL — `InterVariable.woff2`) tự host qua `next/font/local` (chốt 20/11/2026): bản Google Fonts cắt mất `cv11`/`ss03` trong GSUB (đo bằng fontTools) nên `font-feature-settings` của DS không hiện; trang DS này vẫn nạp Google Fonts để xem nhanh — số đo lấy từ bản app. Mã đơn, serial, SKU, SĐT, tiền: Inter + `font-variant-numeric: tabular-nums` (số thẳng cột) — **không dùng mono** (nặng mắt trong bảng). `font-mono` chỉ cho khối code/log.
- Icon **Phosphor** (`@phosphor-icons/react` 2.1.7, MIT; chốt 18/11): bản `regular` cho mọi chỗ, bản `fill` cho mục đang chọn trên thanh icon (như ChatGPT); 16px trong ô nhập/menu/mục panel, 18px trên thanh icon và trong nút.
- Cỡ chủ đạo của app nội bộ là `text-sm` 14/20 (control, bảng, menu). `text-xs` 12/18 cho meta, nhãn cột, chú thích. `text-md` 16/24 cho đoạn văn.
- Tiêu đề trang `heading-lg` 24/28; tiêu đề khối/Dialog `heading-md` 20/26 hoặc `heading-sm` 18/26; tiêu đề nhỏ `heading-xs` 16/24. Heading 3xl–5xl không dùng trong app nội bộ.
- Weight chỉ 400/500/600 (700 có nhưng không dùng). Tracking mọi cỡ = 0em theo nguồn.
- Số liệu trong bảng và KPI: `font-variant-numeric: tabular-nums`, căn phải.

## Khoảng cách, kích thước control

- Thang Tailwind gốc 4px (`spacing`). Khoảng thường dùng: 4, 6, 8, 12, 16, 20.
- Control mặc định **md = 32px** (`control-size-md`), padding ngang `control-gutter-md` 12px. sm 28px cho toolbar dày, lg 36px khi cần nổi bật. Vùng chạm mobile tối thiểu `control-size-2xl` 44px.
- Icon trong control `control-icon-size-md` 18px (Button), 16px trong Input/Menu/Sidebar.
- Pill (`radius-full`) nhân padding ngang ×1.33 (`--control-gutter-pill-scaling`).

## Viền, bo góc, bóng

- Viền control vẽ bằng `box-shadow: inset 0 0 0 1px` (không làm đổi kích thước) — đúng cách OpenAI làm Input/Button outline/Alert.
- Bo: control md `radius-md` 8px, sm `radius-sm` 6px; Menu/Popover/Alert/Card/khung bảng `radius-xl` 12px; Dialog `radius-2xl` 16px (lựa chọn GWT); Button và Tabs mặc định pill; Checkbox/Badge `radius-xs` 4px.
- Lớp nổi: `shadow` + `shadow-hairline` (hairline thay border, 0.5px trên màn ≥1.5dppx). Sheet: `shadow-400` + hairline. Card phẳng, không bóng.

## Focus và trạng thái

- Focus-visible: outline 2px `ring` (blue-500 Light / blue-400 Dark), offset 2px; nút outline/ghost offset −1px; item trong menu/sidebar outline phía trong. Ring đạt ≥ 3:1 ở cả hai theme (5.39 / 4.45).
- Input không có quầng: focus làm đậm viền lên alpha-50 (OpenAI).
- Hover = đổi nền một bậc (`…-hover`), active = thêm một bậc (`…-active`). Disabled = `color-background-disabled` + `color-text-disabled` + `color-border-disabled`, con trỏ `not-allowed`.
- Đang tải: Button giữ bề rộng, ẩn nội dung, spinner 16px; bảng dùng skeleton; danh sách tìm xa hiện "Đang tìm…".
- Lỗi: viền `red-500` (Dark `red-600`) + dòng chữ `color-text-danger` 12px ngay dưới, gắn `aria-describedby`.

## Chuyển động

Từ `variables-semantic.css` (không có family token cho motion): thời lượng cơ bản 150ms `ease` cho màu/viền/bóng; vào `cubic-bezier(0.19, 1, 0.22, 1)`, ra `cubic-bezier(0.8, 0, 0.4, 1)`. Tôn trọng `prefers-reduced-motion`: spinner chậm lại, skeleton đứng yên.

## Icon và logo

- Chưa có logo GWT trong nguồn → khối Sidebar đang ghi chữ "GWT" thuần; cần file logo thật trước khi dùng.
- Preview dùng icon nét 2px, 24×24, vẽ tay cho minh hoạ (chevron, kính lúp, ✓, ✕). Bộ icon chính thức đã chốt 18/11: Phosphor (thay `lucide-react` mặc định của shadcn) vì có cả bản nét và bản đặc cho mọi icon.

## Độ tương phản đã đo

Đo WCAG 2 trên nền ghi trong cột (màu trong suốt đã chồng lên `background` của theme).

| Cặp | Light | Dark | Ngưỡng | Kết quả |
| --- | --- | --- | --- | --- |
| `foreground` trên `background` | 19.44 | 16.10 | 4.5:1 | Đạt |
| `muted-foreground` trên `background` | 6.58 | 7.34 | 4.5:1 | Đạt |
| `muted-foreground` trên `muted` | 5.93 | 8.47 | 4.5:1 | Đạt |
| `foreground` trên `popover` | 19.44 | 13.20 | 4.5:1 | Đạt |
| `primary-foreground` trên `primary` | 17.76 | 17.52 | 4.5:1 | Đạt |
| `secondary-foreground` trên `secondary` | 16.60 | 13.20 | 4.5:1 | Đạt |
| `accent-foreground` trên `accent` | 16.40 | 11.09 | 4.5:1 | Đạt |
| `destructive-foreground` trên `destructive` | 4.57 | 4.57 | 4.5:1 | Đạt |
| `color-text-danger` trên `background` | 8.73 | 3.52 | 4.5:1 | CHƯA ĐẠT |
| `color-text-tertiary` trên `background` | 3.23 | 4.98 | 4.5:1 | CHƯA ĐẠT |
| `color-text-success-soft` trên `color-background-success-soft-alpha` | 4.05 | 4.86 | 4.5:1 | CHƯA ĐẠT |
| `color-text-warning-soft` trên `color-background-warning-soft-alpha` | 6.20 | 4.39 | 4.5:1 | CHƯA ĐẠT |
| `color-text-danger-soft` trên `color-background-danger-soft-alpha` | 5.03 | 3.81 | 4.5:1 | CHƯA ĐẠT |
| `color-text-info-soft` trên `color-background-info-soft-alpha` | 6.95 | 4.85 | 4.5:1 | Đạt |
| `color-text-secondary-soft` trên `color-background-secondary-soft-alpha` | 16.40 | 11.09 | 4.5:1 | Đạt |
| `color-text-discovery-soft` trên `color-background-discovery-soft-alpha` | 5.97 | 5.86 | 4.5:1 | Đạt |
| `input` trên `background` | 1.42 | 2.28 | 3:1 | CHƯA ĐẠT |
| `ring` trên `background` | 5.39 | 4.45 | 3:1 | Đạt |
| `color-border` trên `background` | 1.24 | 1.45 | 3:1 | CHƯA ĐẠT |
| `sidebar-foreground` trên `sidebar` | 18.46 | 17.76 | 4.5:1 | Đạt |

Các cặp chưa đạt là **giá trị nguồn OpenAI giữ nguyên**, chưa tự chỉnh màu — đề xuất ở mục dưới.

## Phần mở rộng riêng của GWT

| Mở rộng | Lý do |
| --- | --- |
| Token `destructive-foreground` | shadcn v4 bỏ token, viết cứng `text-white` |
| Token `dialog-padding`, `menu-gutter`, `alert-gutter` (spacing) | Đưa giá trị `spacing(n)` trong `variables-components.css` thành token độ dài dùng được |
| Font `font-sans` = Inter | Chốt 18/11: một font cho mọi máy (system stack ra Segoe UI trên Windows, SF Pro trên Mac — lệch nhau) |
| Style `code-sm` (mono 14/20) | OpenAI chỉ khai báo `--font-mono`, không có style; GWT chỉ dùng cho code/log |
| Bo Dialog `radius-2xl` 16px | OpenAI có token dialog nhưng không định bo |
| Component Table / Data table | OpenAI không có bảng; dựng từ token sẵn có |
| Sidebar | OpenAI không có; token sidebar ánh xạ surface OpenAI |
| Trạng thái lỗi của Checkbox | OpenAI Checkbox không có `invalid` |
| Combobox gắn `BoLocGoiY` / `OChonGoiY` / `OChonTimXa` | Luật > 10 mục của `CHUAN-FILTER.md` |
| Nhóm Trang chi tiết: Breadcrumb · PageHeader · PropertyList · Timeline · Composer · DetailLayout (18/11) | Khuôn chung mọi trang một bản ghi (ticket, khách, máy, phiếu chi) |
| Nhóm Phản hồi: ConfirmDialog · EmptyState · Skeleton · Banner · Toast lỗi/đang chạy (18/11) | Luật chọn kiểu phản hồi: Alert tại chỗ · Banner cả trang · Toast xong việc · ConfirmDialog chỉ cho việc không lùi được |
| Nhóm Toàn app: Kbd · CommandPalette (⌘K) · StatCard (18/11) | Tìm toàn cục một ô cho mọi đối tượng; màu số liệu theo nghĩa tốt/xấu |
| Nhóm Thông báo: Count · NotificationCenter · NotificationMatrix (19/11) | Thông báo trong app cạnh Discord; cột Trong app trong ma trận cấu hình |

## Tích hợp vào gwt-app (rework/v2.0.0)

**Nền component (CEO chốt 19/11/2026): shadcn/ui trên Radix.** Giao diện và hành vi lấy đúng theo artifact này + prototype đã duyệt; Radix lo bàn phím, focus, menu nổi, đọc màn hình. Mỗi component dựng xong phải so với `preview.html` ở đây: ảnh (sáng/tối, 1440/390, đủ trạng thái tạo bằng tương tác thật) + số đo `getComputedStyle` → bảng lệch bằng 0 hoặc ghi lý do. Token chép nguyên văn từ `tokens.json`, không gõ lại số.

Hiện trạng đã đọc: `apps/web/app/globals.css` dùng `@import "tailwindcss"`, viền mặc định ép `slate-200`, `body` dùng Arial (Geist được nạp ở `layout.tsx` nhưng bị đè), khu Việc có bảng màu teal riêng trong `[data-khu="work"]`; CSKH/Sales dùng `slate-*` của Tailwind.

1. **Một lớp reset**: giữ Preflight của Tailwind. KHÔNG import `index.css`/`base.css`/`globals.css` của kit OpenAI (kèm reset riêng). Chỉ chép biến từ `variables-primitive.css`, `variables-semantic.css` (và phần cần của `variables-components.css`).
2. **Hàm riêng của kit**: CSS gốc dùng `alpha()` và `spacing()` — hàm PostCSS của kit, trình duyệt không hiểu. Khi chép, đổi sang giá trị đã giải trong `tokens.json` này hoặc `color-mix(in srgb, <màu> <x>%, transparent)`.
3. **`light-dark()`** chỉ chạy khi có `color-scheme`; đặt `color-scheme: light` mặc định và `dark` khi bật Dark cho màn được duyệt.
4. **Trùng tên với shadcn**: cả hai hệ đều sinh `--color-border` và `--color-ring` trong Tailwind. Trong `@theme inline` giữ `--color-border: var(--border)`, `--color-ring: var(--ring)` và gán `--border`, `--ring` bằng GIÁ TRỊ OpenAI (`light-dark(var(--alpha-10), var(--alpha-12))`, `light-dark(var(--blue-500), var(--blue-400))`) — không viết `--border: var(--color-border)` (tạo vòng tham chiếu).
5. Bỏ luật ép viền `slate-200` toàn app khi khu đã chuyển; khu chưa chuyển giữ nguyên — đổi theo từng khu như cách khu Việc đang bọc `[data-khu]`.

## Quyết định còn mở

| # | Việc | Đề xuất mặc định |
| --- | --- | --- |
| 1 | Màn hình đầu tiên áp DS | Chờ chốt — DS này dừng ở token + component mẫu |
| 2 | `color-text-danger` ở Dark (red-500 trên #212121 = 3.52) | **Đã chốt 19/11: giữ nguồn ChatGPT** (red-500), chấp nhận 3.52 có chủ đích |
| 3 | Viền `input` (1.42 Light / 2.28 Dark) và Checkbox gray-200 (1.6) dưới 3:1 | **Đã chốt 19/11: giữ nguồn ChatGPT**, chấp nhận có chủ đích |
| 4 | Chữ Badge chưa đạt: success Light 4.05, warning Dark 4.39, danger Dark 3.81 | **Đã chốt 19/11: giữ nguồn ChatGPT**, chấp nhận có chủ đích |
| 5 | Màu thương hiệu GWT (teal của khu Việc) có vào DS không | **Đã chốt 19/11: màu khu chỉ là dấu nhận diện** (`--khu` qua `[data-khu]`, chấm/tên khu trên thanh điều hướng); không đổi `primary` (nút chính đen) hay `ring` (focus xanh) |
| 6 | Font: system stack OpenAI vs Geist đang nạp vs Arial đang hiển thị | **Đã chốt 18/11: Inter**, số/mã `tabular-nums` |
| 7 | Bộ icon: lucide (shadcn) hay icon kit OpenAI | **Đã chốt 18/11: Phosphor** — `regular` thường, `fill` khi đang chọn trên thanh icon, 16/18px |
| 8 | Button pill mặc định (OpenAI) vs rounded 8px | Pill cho nút đứng riêng; `rounded` cho nút trong ô bảng/toolbar dày |
| 9 | Có làm Dark mode cho màn đầu tiên | Chốt theo màn |
| 10 | Nền component code thật | **Đã chốt 19/11: shadcn/ui (Radix)** |
| 11 | Kênh Discord nhận từng loại thông báo (`NotificationMatrix`) | Chưa chốt — tên kênh trong preview là minh hoạ |
| 12 | Mức chốt của các nhóm component | **Đã chốt 19/11: mọi thứ trên artifact bản 25** (gồm Form, Xem dữ liệu, Trang chi tiết, Phản hồi, Toàn app, Thông báo) |
| 13 | Data view: logic gói `bang/` không có (kéo/co dãn cột, Kanban, ListView, InlineEdit, SavedView, chọn tất cả qua các trang) | **Đã chốt 19/11: chia đôi** — logic dữ liệu ở `bang/`, hành vi giao diện thành component DS mới |


