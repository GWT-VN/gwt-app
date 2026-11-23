Ô nhập có **chữ cố định trong ô** (₫, %, kg, cái) — ô tiền VND là trường hợp chính. **Mới 18/11/2026**, là **input group**: khung `ui-input-affix` mang viền và bọc cả số + đơn vị; viền/hover/focus/lỗi/tắt chép đúng của `Input`, chuyển từ ô lên khung (`:focus-within`, `:has`). **Cập nhật theo prototype hiện tại:** đơn vị đứng **sát số**, cách 4px cho mọi đơn vị (bản trước đặt đơn vị cố định ở mép phải).

**Dùng khi** nhập số có đơn vị. Tiền VND: luôn số nguyên, dấu chấm hàng nghìn (vi-VN), căn phải để các ô xếp dọc thẳng hàng chữ số.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-input-affix` | cao `control-size-md` 32px, padding 0 `control-gutter-md`, bo `radius-md`, viền inset `input`; hover `alpha-25` (tối `alpha-30`); focus-within `alpha-50`; lỗi `red-500` (tối `red-600`); tắt nền `color-background-disabled` |
| Ô số | `ui-input` bên trong | không viền, không nền, lấp chỗ |
| Đơn vị | `ui-affix` · `color-text-tertiary` | 14/20, cách số 4px, `pointer-events: none`; `data-side="start"` để đặt trước số |
| Số | | `data-align="end"` căn phải; `inputmode="numeric"` (tiền) / `decimal` (%) → `tabular-nums` |
| Gợi ý | `ui-help` | có thể ghi lại số đã định dạng ("= 2.500.000 ₫") |

**Hành vi ô tiền:** gõ chỉ nhận chữ số, tự chèn dấu chấm; lưu **giá trị số** (không lưu chuỗi có dấu chấm); trống = `null`, khác 0. **Phần lẻ chỉ hiểu khi DÁN** (chốt 20/11/2026): dán "1.250.000,00" → 1250000, "12,5" → 13 (1–2 chữ số sau dấu cuối = phần lẻ, làm tròn); khi gõ chỉ lấy chữ số — xoá chữ số cuối của "1.250.000" không bị đọc thành 1250. Ô tiền **không âm**: dán "-500.000" → 500000; cần số âm (điều chỉnh, hoàn tiền) thì dùng ô khác. Không dùng `type="number"` (bàn phím mất dấu chấm, con lăn chuột đổi số).

**Dùng lại:** định dạng hiển thị = `fmtVnd()` (`apps/web/app/sales/_ui.tsx`, `Intl.NumberFormat('vi-VN')`). ⚠️ Đề xuất dời `fmtVnd`/`fmtDate` sang file dùng chung (vd `lib/dinh-dang.ts`) vì mọi khu cần — chờ duyệt, chưa dời.

**Bàn phím & a11y:** `label for`; đơn vị là chữ trang trí (`aria-hidden`), nhãn nên nói đơn vị nếu không hiển nhiên ("Chiết khấu (%)"). Lỗi qua `aria-invalid` + `aria-describedby`.

**Code:** shadcn `InputGroup` (`InputGroupInput` + `InputGroupAddon align="inline-end"`); số thập phân/âm thì `react-number-format` nếu cần số thập phân/âm — **chưa cài**, chỉ thêm khi thật cần.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- File đổi `input-affix.tsx` → `input-group.tsx` (R22): import `@/components/ui/input-group`. Khối /ds và cổng so khớp giữ tên **InputAffix**.
- `InputGroupAddon` mặc định đổi `align="inline-end"` → `"inline-start"` (theo shadcn): đơn vị đứng sau số phải ghi rõ `align="inline-end"`. Đặt trước số = `align="inline-start"` (bảng trên ghi `data-side="start"` theo class artifact).
- `InputGroupAddon` nay là `div role="group"` và KHÔNG tự `aria-hidden`: đơn vị trang trí tự thêm `aria-hidden="true"`; addon chứa nút thì không ẩn. Thay chữ "`pointer-events: none`" ở bảng trên: addon nhận chuột, bấm vào addon (ngoài nút) đưa con trỏ vào ô.
- `InputGroup` mang `role="group"`; bấm lề khung → focus ô (input hoặc textarea).
- Mới: `InputGroupButton` (Button `ghost`, `type="button"`, `size` `xs` 24 mặc định · `sm` 28 · `icon-xs` · `icon-sm`), `InputGroupText` (chữ kèm 14/20 tertiary), `InputGroupTextarea` (cao tối thiểu 80, đệm dọc 6, khung cao tự do); `align="block-start" | "block-end"` → addon trên/dưới ô, khung thành cột.
- Addon có icon đầu cách chữ 8; nút sát mép khung 4.
- Viền khung (`controlOutlineWithin`) xét cả `textarea` con trực tiếp cho hover/lỗi/tắt.
- Giữ: `InputGroupInput` (`data-align="end"`, `tabular-nums` theo `inputMode`), `OTien` (hành vi ô tiền không đổi). Lệch shadcn: khung cao 32 lề 12, addon không đệm riêng, chữ 400 tertiary.
