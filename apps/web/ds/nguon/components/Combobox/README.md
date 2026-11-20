shadcn `Combobox` (Popover + Command) cho mọi danh sách trên 10 mục: gõ mã hoặc tên, khớp không dấu, nói rõ khi cắt bớt.

Luật cứng của GWT (`docs/CHUAN-FILTER.md`, chốt 22/08/2026): danh sách > 10 mục KHÔNG được để select trần. Combobox này là lớp áo cho các component đã có trong `apps/web/bang/` — không viết lại logic:

| Tình huống | Component GWT giữ nguyên | Áo DS |
| --- | --- | --- |
| Ô lọc trang danh sách | `BoLocGoiY` (tham số URL) | trigger Select + popover Combobox |
| Ô nhập trong form | `OChonGoiY` | như trên |
| Tập không nạp trước được (khách, ticket, đơn) | `OChonTimXa` (debounce 250ms, tối thiểu 2 ký tự, bỏ kết quả về muộn) | thêm trạng thái "Gõ thêm" và "Đang tìm…" |

**Hiển thị:**
- Ô tìm ở đầu popover: cao 32px, không viền riêng, gạch dưới 1px `border`, icon kính lúp `muted-foreground`.
- Item: mã (12px `tabular-nums` `muted-foreground`) + tên; mục đang chọn có ✓; mục đầu được highlight để Enter chọn ngay.
- Danh sách cuộn trong popover, cao tối đa 240px.
- Dòng ghi chú cuối, `aria-live="polite"`: "Đang hiện 30 / 328 mục — gõ thêm để thu hẹp" khi cắt bớt.
- Rỗng: "Không có mục nào khớp "…"". Chưa đủ ký tự (tìm xa): "Gõ thêm — cần ít nhất 2 ký tự để tìm". Đang tải: spinner + "Đang tìm…".

**Bàn phím:** ↑/↓ di chuyển, Enter chọn, Esc đóng và trả focus về trigger; ô tìm có `role="combobox"`, `aria-controls`, `aria-activedescendant`.
