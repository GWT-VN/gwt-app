Nút bật/tắt một tuỳ chọn (Toggle) và nhóm nút chọn một / chọn nhiều (ToggleGroup) — dạng xem, thẻ xem nhanh, định dạng chữ.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`toggle.tsx` + `toggle-group.tsx` @45bbf9b, MIT) trên Radix Toggle /
ToggleGroup, tách khỏi `toggle-group.tsx` cũ ở Đợt 6 chép shadcn (21/11/2026). Giá trị lấy từ `.ui-btn` (Toggle = nút công cụ
của DataViewToolbar), ở `components/ui/toggle-styles.ts`.

| Phần | Nguồn | Ghi chú |
| --- | --- | --- |
| `Toggle` | Radix Toggle | `pressed` / `defaultPressed` / `onPressedChange`; `aria-pressed` + `data-state` on/off |
| `toggleVariants` | cva | `variant` default (như Button ghost) / outline (viền inset `--input`); `size` sm 28 · default 32 · lg 36 (`min-w` = cao); GWT thêm `icon` / `icon-sm` (ô vuông) |
| `ToggleGroup` | Radix ToggleGroup | `type` single (radiogroup, `aria-checked`) / multiple; `variant`/`size`/`spacing` đặt ở nhóm, mục nhận qua context |
| `ToggleGroupItem` | Radix | nền `accent` khi bật |

- `spacing` = bội số 4px. `0` (mặc định shadcn): các nút dính liền, chỉ đầu/cuối bo. Thanh công cụ DS dùng `spacing={0.5}`
  (cách 2, mỗi nút bo pill).
- Nút chỉ icon → `size="icon"` + BẮT BUỘC `aria-label`. Bọc TooltipNhanh thì `data-state` bị Trigger đè → trạng thái tin
  `aria-pressed` / `aria-checked`.
- `type="single"` cho bấm lại mục đang chọn để bỏ chọn (giá trị rỗng) → nhóm luôn phải có một mục thì bỏ qua giá trị rỗng.

**Code:** `components/ui/toggle.tsx`, `components/ui/toggle-group.tsx`, `components/ui/toggle-styles.ts`. Khối `/ds#toggle`.
