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
