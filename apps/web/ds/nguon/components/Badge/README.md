Badge trạng thái theo OpenAI (mặc định `secondary` · `soft` · `sm`): nhãn 20px, chữ 12px semibold trên nền màu trong suốt. Thêm vào ngoài danh sách shadcn của brief vì bảng nghiệp vụ cần thể hiện trạng thái.

**Người dùng cung cấp:** chữ trạng thái (luôn có chữ, không chỉ màu), `data-color` theo nghĩa:

| Nghĩa GWT | `data-color` | Token nền / chữ |
| --- | --- | --- |
| Nháp, trung tính | (secondary) | `color-background-secondary-soft-alpha` / `color-text-secondary-soft` |
| Đang xử lý, đang giao | `info` | `…-info-soft-alpha` / `color-text-info-soft` |
| Hoàn tất, đã thanh toán | `success` | `…-success-soft-alpha` / `color-text-success-soft` |
| Chờ, sắp hết hạn | `warning` | `…-warning-soft-alpha` / `color-text-warning-soft` |
| Lỗi, quá hạn, huỷ | `danger` | `…-danger-soft-alpha` / `color-text-danger-soft` |
| Mới | `discovery` | `…-discovery-soft-alpha` / `color-text-discovery-soft` |

Kích thước: sm 20px / padding 7px / **bo pill (`radius-full`, chốt 18/11/2026 — nguồn OpenAI là 4px)** / 12px (cao theo `--badge-*-sm`); md 22px / 6px / 14px. Biến thể `solid`, `outline` có sẵn; trong bảng dùng `soft`.

⚠️ Theo nguồn, 3 cặp chưa đạt 4.5:1 cho chữ 12px: success (light 4.05), warning (dark 4.39), danger (dark 3.81). Chấm màu + chữ giúp không chỉ dựa vào màu, nhưng độ tương phản chữ vẫn thiếu — xem "Quyết định còn mở".

## Bổ sung 18/11/2026 — chấm màu, mũi tên, nhãn ưu tiên
- **Chấm màu theo nhóm** trong badge `outline`: `<span class="ui-dot" data-color="info|success|warning|danger|discovery">` (không `data-color` = xám). Dùng cho phân loại (loại lỗi: Main `discovery` · Rò rỉ nước `info` · Chất lượng nước `success` · App `warning` · Chưa phân loại xám).
- **Badge bấm được để đổi giá trị** (trạng thái trong bảng): thêm `<svg class="ui-caret">` ▾ 10px cuối badge, cùng màu chữ, mờ 60% → 100% khi nút cha hover/mở.
- **Ưu tiên P1–P4**: P1 `solid` + `danger` · P2 `warning` · P3 mặc định · P4 `outline`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- **Mặc định đổi:** `variant` mặc định nay là `default` = nền `primary` đặc như shadcn — thay dòng đầu "mặc định `secondary` · `soft` · `sm`" ở trên. Nhãn trạng thái nền nhạt phải ghi rõ `variant="soft"` (+ `color`).
- `variant` đủ bộ shadcn: `default` (primary) · `secondary` (gray-100, như Button secondary) · `destructive` (danger-solid) · `outline` · `ghost` · `link` (chữ xanh như Button link); `soft` và `solid` là phần GWT giữ thêm.
- `color` (6 màu, mặc định `secondary`) chỉ có tác dụng với `soft` (nền nhạt + chữ theo màu) và `solid` (chỉ `success`/`danger` có màu riêng); với `default`/`secondary`/`destructive`/`outline`/`ghost`/`link` màu theo biến thể, `color` không đổi gì.
- Mục ưu tiên ở trên: P3 "mặc định" nay là `variant="soft"`; P2 = `variant="soft" color="warning"`.
- Trong React dùng prop `color`, `size`, `variant` (component tự gắn `data-color`/`data-size`/`data-variant`); `data-slot="badge"`, `badge-dot`, `badge-caret`.
- Badge làm link (`asChild` + `<a>`): `default`/`secondary`/`destructive` sẫm nền khi rê, `outline`/`ghost` nền `accent`, `link` gạch chân; focus-visible outline 2px `ring` (destructive: `color-ring-danger`).
- Export giữ tên: `Badge`, `badgeVariants`, `BadgeDot`, `BadgeCaret`.
