# So khớp Pagination — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Pagination --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Pagination/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): nut-hover (cả artifact): tro {"artifact":".ds-muc:nth-child(1) .ui-pagination > button:last-child","ds":"#pagination [data-so=\"dau\"] > nav > span:nth-child(2) > a"} → cho 200 · nut-focus (cả artifact): tab {"artifact":".ds-muc:nth-child(1) .ui-pagination > button:last-child","ds":"#pagination [data-so=\"dau\"] > nav > span:nth-child(2) > a"} → cho 200 · goi-y (cả artifact): tro {"artifact":".ds-muc:nth-child(1) .ui-pagination > button:last-child","ds":"#pagination [data-so=\"dau\"] > nav > span:nth-child(2) > a"} → cho 500. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: goi-y {"artifact":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Pagination-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1644/1688 khớp** · 44 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Nút còn dùng được là link `<a>` (PhanTrang của bang/ dựng URL giữ mọi tham số, chỉ đổi `trang`) thay cho `<button>` của preview; nút tắt là `<button disabled>` như preview
- Lề trên 12 của `.ui-table-foot` (margin không nằm trong bộ đo) — DS có `mt-3`, so bằng ảnh
- Chữ tooltip: preview lặp tên nút ("Trang sau"); DS ghi trang đích ("Tới trang 2") — luật NGUON: tooltip là mô tả THÊM, không lặp aria-label (Radix gắn aria-describedby → đọc hai lần)
- 1 trang → không render, nút tắt `disabled` (không ẩn), giữ tham số URL khác, khoảng "16–19 trên 19", aria-current: test jsdom components/ui/bang-ds.dom.test.tsx

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| khung | height | 156px | 140px | sang 1440, sang 390, toi 1440, toi 390 | Hai chân bảng, mỗi cái preview cao thêm 8 do `.b-chantrang { padding-bottom: 8px }` của prototype (không thuộc component) → 2 × 8 = 16. |
| chan | height | 36px | 28px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. Cao 28 + 8 = 36. |
| chan | paddingRight | 2px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
| chan | paddingBottom | 8px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
| chan | paddingLeft | 2px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
| goi-y | width | 73px | 77px | sang 1440, sang 390, toi 1440, toi 390 | Chữ khác: preview "Trang sau" (lặp tên nút), DS "Tới trang 2" (mô tả THÊM — luật tooltip NGUON). Đệm, chữ, màu, bo khớp. |
| goi-y | cursor | pointer | auto | sang 1440, sang 390, toi 1440, toi 390 | ::after là pseudo của chính nút → kế thừa cursor:pointer của .ui-btn; nội dung Radix là phần tử riêng trong ô portal → auto (như so khớp Tooltip). |
| chan-cuoi | height | 36px | 28px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. Cao 28 + 8 = 36. |
| chan-cuoi | paddingRight | 2px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
| chan-cuoi | paddingBottom | 8px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
| chan-cuoi | paddingLeft | 2px | 0px | sang 1440, sang 390, toi 1440, toi 390 | Preview gắn thêm `.b-chantrang { padding: 0 2px 8px }` của prototype (chân bảng trong màn ticket, không thuộc component) — `.ui-table-foot` gốc không đệm. |
