Ô nhập có **chữ cố định trong ô** (₫, %, kg, cái) — ô tiền VND là trường hợp chính. **Mới 18/11/2026**, là **input group**: khung `ui-input-affix` mang viền và bọc cả số + đơn vị; viền/hover/focus/lỗi/tắt chép đúng của `Input`, chuyển từ ô lên khung (`:focus-within`, `:has`). **Cập nhật theo prototype hiện tại:** đơn vị đứng **sát số**, cách 4px cho mọi đơn vị (bản trước đặt đơn vị cố định ở mép phải).

**Dùng khi** nhập số có đơn vị. Tiền VND: luôn số nguyên, dấu chấm hàng nghìn (vi-VN), căn phải để các ô xếp dọc thẳng hàng chữ số.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-input-affix` | cao `control-size-md` 32px, padding 0 `control-gutter-md`, bo `radius-md`, viền inset `input`; hover `alpha-25` (tối `alpha-30`); focus-within `alpha-50`; lỗi `red-500` (tối `red-600`); tắt nền `color-background-disabled` |
| Ô số | `ui-input` bên trong | không viền, không nền, lấp chỗ |
| Đơn vị | `ui-affix` · `color-text-tertiary` | 14/20, cách số 4px, `pointer-events: none`; `data-side="start"` để đặt trước số |
| Số | | `data-align="end"` căn phải; `inputmode="numeric"` (tiền) / `decimal` (%) → `tabular-nums` |
| Gợi ý | `ui-help` | có thể ghi lại số đã định dạng ("= 2.500.000 ₫") |

**Hành vi ô tiền:** gõ chỉ nhận chữ số, tự chèn dấu chấm; lưu **giá trị số** (không lưu chuỗi có dấu chấm); trống = `null`, khác 0. Không dùng `type="number"` (bàn phím mất dấu chấm, con lăn chuột đổi số).

**Dùng lại:** định dạng hiển thị = `fmtVnd()` (`apps/web/app/sales/_ui.tsx`, `Intl.NumberFormat('vi-VN')`). ⚠️ Đề xuất dời `fmtVnd`/`fmtDate` sang file dùng chung (vd `lib/dinh-dang.ts`) vì mọi khu cần — chờ duyệt, chưa dời.

**Bàn phím & a11y:** `label for`; đơn vị là chữ trang trí (`aria-hidden`), nhãn nên nói đơn vị nếu không hiển nhiên ("Chiết khấu (%)"). Lỗi qua `aria-invalid` + `aria-describedby`.

**Code:** shadcn `InputGroup` (`InputGroupInput` + `InputGroupAddon align="inline-end"`); số thập phân/âm thì `react-number-format` nếu cần số thập phân/âm — **chưa cài**, chỉ thêm khi thật cần.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
