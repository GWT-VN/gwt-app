Ô tìm toàn cục mở bằng `Ctrl K` (Mac `⌘K`) hoặc nút 🔍 trên khung: một ô cho mọi loại đối tượng. **Mới 18/11/2026** — tham chiếu Linear/ChatGPT.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Hộp | `ui-command` | rộng ≤640px, cách đỉnh 12vh, cao ≤520px, bo `radius-2xl`, nền `popover`, bóng `shadow` + `shadow-hairline`; nền mờ đen 30% (tối 50%) |
| Ô gõ | `ui-command-input` | cao 52px, chữ **16px** (Safari iOS không tự phóng to), kẻ dưới `border` |
| Nhóm | `ui-menu-label` + `ui-command-dem` | tên loại + icon 12px + số kết quả `color-text-tertiary` |
| Dòng | `ui-command-item` | cao tối thiểu `control-size-xl` 40px, bo `radius-sm`; đang chọn nền `alpha-08` (tối `alpha-10`) |
| Chữ | `ui-command-ten` / `ui-command-phu` | 14/20 `tabular-nums` / 12/18 `muted-foreground`, cắt `…` |
| Đoạn khớp | `mark` | **đậm 600**, không tô vàng |
| Chân | `ui-command-foot` | `Kbd` ↑↓ chọn · Enter mở · Esc đóng; ẩn ≤640px |
| ≤640px | | sát mép 8px, cao hết màn |

**Hành vi:** khớp **không dấu** ("sen vang" = "Sen Vàng"), SĐT gõ kiểu `0909.123`/`0909-123` vẫn khớp, từng trường so riêng. Mỗi nhóm tối đa 5 dòng, tổng số khớp hiện cạnh tên nhóm. Không thấy → câu gợi ý + dòng "Hỏi Bắp". Bộ gõ tiếng Việt đang ghép chữ thì Enter/↑↓ thuộc bộ gõ.
**a11y:** mẫu APG combobox + listbox: ô gõ `role="combobox"` `aria-activedescendant`; số kết quả đọc qua vùng `role="status"`; câu "không thấy" nằm ngoài listbox.
**Code:** shadcn `CommandDialog` (`cmdk`) — tắt lọc sẵn của cmdk (`shouldFilter={false}`), dùng hàm khớp không dấu của dự án; giao diện theo bảng trên.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp` (`apps/web/app/prototype/toanapp/_ta/ToanAppDemo.tsx`, `khung/_proto/TimToanCuc.tsx`); CSS ở khối `BỔ SUNG DS TOÀN APP` cuối `khung/_proto/ui.css`.
