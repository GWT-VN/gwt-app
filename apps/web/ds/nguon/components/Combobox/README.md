shadcn `Combobox` (Popover + Command) cho mọi danh sách trên 10 mục: gõ mã hoặc tên, khớp không dấu, nói rõ khi cắt bớt.

**Luật khớp (chốt 20/11/2026):** chuỗi con không dấu trên mã + tên — đúng một luật của `bang/` (`locMucChon`) cho cả app. **Không** khớp chữ cái đầu ("dn" không ra Đà Nẵng): gõ "da n" hoặc "nang".

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

**Bàn phím:** trigger là nút thường, tên đọc = **nhãn + giá trị đang chọn** (qua `aria-labelledby`). ↑/↓ di chuyển, Enter chọn, Esc đóng và trả focus về trigger; ô tìm có `role="combobox"`, `aria-controls`, `aria-activedescendant`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- API và hình giữ nguyên (`Combobox`, `ComboboxPanel`, prop như cũ).
- Ruột dựng lại trên `Command` của DS (`command.tsx`, cmdk 1.1.1 — README Command) thay cmdk trần. `data-slot` đổi: gốc `command`, hàng tìm `command-input-wrapper` (trước `combobox-search`), ô `command-input`, danh sách `command-list`, mục `command-item`.
- R21: không dùng Combobox của shadcn new-york-v4 (dựng trên `@base-ui/react`, chưa cài) → chưa có chọn nhiều dạng chip; hỏi lại khi màn nghiệp vụ cần.
- Pop thêm `w-auto` (bỏ `w-72` mà `PopoverContent` nay mặc định).
- Vòng xoay "Đang tìm…" mang `aria-hidden` (chữ đi kèm đã đọc).
- Bẫy cmdk (kéo cửa sổ lúc mount, `aria-activedescendant` khi lọc ngoài) ghi ở đầu `command.tsx`.
