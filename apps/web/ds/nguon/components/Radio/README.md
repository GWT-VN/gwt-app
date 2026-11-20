Radio tròn cùng họ với `Checkbox` (18px, viền `gray-200`, chọn = chấm 8px `color-background-primary-solid`). Nhóm bằng `<fieldset class="ui-choices">` + `<legend class="ui-label">` — **mới 18/11/2026, dựng trên Checkbox**.

**Dùng khi** chọn đúng 1 trong 2–5 lựa chọn và người dùng cần thấy hết các lựa chọn cùng lúc. Trên 5 lựa chọn → `Select`; trên 10 → `Combobox` (luật `docs/CHUAN-FILTER.md`). Bật/tắt một thứ → `Switch`, không dùng 2 radio "Có/Không".

| Phần | Token | Giá trị |
| --- | --- | --- |
| Vòng | `gray-200` (dark `gray-500`) | 18px, viền 1px, `radius-full`; hover `gray-300` (dark `gray-600`) |
| Đã chọn | `color-background-primary-solid` | viền + chấm 8px, chấm phóng to 120ms |
| Nhãn | `ui-checkbox-label` | 14/20, cách vòng 8px; mô tả `ui-choice-desc` 12/18 `muted-foreground` |
| Nhóm | `ui-choices` | dọc gap 8px; `data-orientation="horizontal"` cách cột 20px |
| Tắt | `gray-150` / nền `gray-25` | nhãn `color-text-disabled` |
| Lỗi | `red-500` | viền đỏ + `ui-error` dưới nhóm |
| Focus | `ring` | outline 2px, offset 2px (chỉ khi dùng phím) |

**Bàn phím & a11y:** `input type="radio"` thật cùng `name` → Tab vào nhóm, mũi tên đổi lựa chọn (trình duyệt lo). Nhãn bọc cả input; dòng mô tả (`ui-choice-desc`) nối vào ô bằng `aria-describedby` (tên ô chỉ là nhãn). Nhóm có `legend`; lỗi gắn `aria-describedby` lên fieldset.

**Code:** shadcn `RadioGroup` (Radix) — đổi `RadioGroupItem` sang class/biến ở bảng trên; hoặc giữ `<input type="radio">` thuần nếu form không cần Radix.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
