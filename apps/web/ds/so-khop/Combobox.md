# So khớp Combobox — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Combobox --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Combobox/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): trigger: bam #ds-combobox-tinh → cho 300 · content: bam #ds-combobox-tinh → cho 300 · search (cả artifact): bam {"artifact":"#cbq","ds":"#ds-combobox-tinh"} → cho 300 · list: bam #ds-combobox-tinh → cho 300 · item: bam #ds-combobox-tinh → cho 300 · item-2: bam #ds-combobox-tinh → cho 300 · note: bam #ds-combobox-tinh → cho 300. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #ds-combobox-tinh → cho 300. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Combobox-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1604/1612 khớp** · 8 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí pop (cách trigger 4px, căn mép trái, Radix Popper tự lật/dời khi sát mép, chừa mép 8) — preview xếp menu tĩnh trong .ui-stack; so bằng mắt trên ảnh
- Hình icon: preview vẽ tay chevron/kính lúp/✓ bằng nét, DS dùng Phosphor CaretUpDown/MagnifyingGlass/Check (path tô) — chỉ đo hộp + màu
- Nút ✕ "Bỏ chọn" trong trigger: preview không có (plan Task 7 yêu cầu) — không có cặp để đo
- Gõ tắt chữ đầu ("dn" → Đà Nẵng) của script preview: DS lọc bằng locMucChon của bang/ (tách nguyên logic OChonGoiY, không có gõ tắt) — để quyết định riêng
- Bàn phím (↑/↓, Enter, Esc + focus về trigger, Esc trong Dialog chỉ đóng pop), bộ gõ đang ghép chữ, ghi chú cắt bớt, tìm xa (gõ thêm / đang tìm / lỗi / bỏ kết quả về muộn), nút ✕: test jsdom components/ui/combobox.dom.test.tsx + bang/useTimXa.dom.test.ts + bang/timkiem.test.ts

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| luoi | height | 382px | 266px | sang 1440, toi 1440 | Preview vẽ pop mở TĨNH ngay dưới nút trong cột 1 (.ui-stack: nhãn 20 + 8 + nút 32 + 8 + menu 314 = 382; menu = padding 6 + ô tìm 32 + list 240 (8 mục × 32, trần 240) + ghi chú 30 + 6); DS chỉ mở pop khi bấm (nổi trong portal) nên cột 1 còn nhãn + nút 60. Lưới cao theo cột cao nhất: artifact 382 (cột 1), DS 266 (cột 2 — khớp cột 2 của artifact: nhãn 20 + 8 + 3 × 74 + 2 × 8). |
| content | zIndex | auto | 90 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ `.ui-menu` tĩnh trong .ui-stack, không có lớp nổi → z-index auto. Pop nổi THẬT của artifact là `.b-noi` (bundle.css, position fixed, z-index 90); DS dùng z-90 chung của menuContent (thang z ds/NGUON.md) — như khoá content của so khớp Select. |
| luoi | height | 664px | 342px | sang 390, toi 390 | Preview vẽ pop mở TĨNH ngay dưới nút trong cột 1 (382, xem dòng 1440); DS chỉ mở pop khi bấm nên cột 1 còn 60. Khổ 390 hai cột xếp chồng: artifact 382 + 16 + 266 = 664, DS 60 + 16 + 266 = 342. |
