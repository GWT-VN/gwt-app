Nhãn chung cho ô nhập, ô chọn, công tắc — bấm nhãn đưa focus vào ô.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`label.tsx` @45bbf9b, MIT), thêm ở Đợt 0 chép shadcn (21/11/2026). Token lấy từ `.ui-label` của `bundle.css`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Chữ | `.ui-label` | 14/20, 500, `foreground` |
| Tắt | shadcn | mờ 50% khi ô `peer` đứng trước bị tắt, hoặc nhóm cha mang `data-disabled=true`; con trỏ cấm |
| Bôi chữ | shadcn | không bôi được (bấm đúp nhãn không chọn chữ) |

**Lệch shadcn có chủ đích:** shadcn gõ nhãn dạng flex cách 8, cao dòng bằng cỡ chữ; `.ui-label` là nhãn thường cao dòng 20 — dấu `*` bắt buộc cách chữ một dấu cách như preview.

**Cách dùng:** trong form dùng `FieldLabel` (ghép trên Label, thêm `required` → `*` đỏ `aria-hidden`). Label trần cho chỗ ngoài khung Field: nhãn cạnh Checkbox/Switch (ô mang class `peer`, nhãn `htmlFor` trỏ ô). Ô bắt buộc phải tự mang `required`/`aria-required` — dấu `*` chỉ là hình.

**Code:** `components/ui/label.tsx`. Khối `/ds#label`.
