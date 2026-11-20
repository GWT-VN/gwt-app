# So khớp Tooltip — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Tooltip --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Tooltip/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): icon-ro: tro #tooltip [data-so="icon"] → cho 400 · icon-phim: tab #tooltip [data-so="icon"] → cho 100 · excel-ro (cả artifact): tro {"artifact":".ui-row > .ui-btn:nth-child(2)","ds":"#tooltip [data-so=\"excel\"]"} → cho 400. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: tro #tooltip [data-so="icon"] → cho 400. Pseudo: icon-ro {"artifact":"::after"} · icon-phim {"artifact":"::after"} · excel-ro {"artifact":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Tooltip-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**372/384 khớp** · 12 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí (cách trigger 6px, căn giữa dưới nút): getComputedStyle không đo top/left — ::after artifact là absolute trong nút, nội dung Radix là fixed trong ô portal; khoảng cách đo bằng getBoundingClientRect trong báo cáo task 5, và nhìn trên ảnh
- side top/left/right và tự lật khi sát mép khung nhìn (Radix Popper) — artifact chỉ có bottom
- Nút trigger (ghost icon đang hover, outline sm): đã đo ở so-khop Button
- Ẩn khi trigger aria-expanded="true" và Esc đóng: test jsdom components/ui/tooltip.dom.test.tsx, không đo ở đây

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| icon-ro | cursor | pointer | auto | sang 1440, sang 390, toi 1440, toi 390 | ::after là pseudo của chính nút → kế thừa cursor:pointer của .ui-btn; nội dung Radix là phần tử riêng trong ô portal (không nằm trong nút) → cursor auto. Chuột không tương tác với tooltip (rule hover thật của artifact còn pointer-events:none). |
| icon-phim | cursor | pointer | auto | sang 1440, sang 390, toi 1440, toi 390 | ::after là pseudo của chính nút → kế thừa cursor:pointer của .ui-btn; nội dung Radix là phần tử riêng trong ô portal (không nằm trong nút) → cursor auto. Chuột không tương tác với tooltip (rule hover thật của artifact còn pointer-events:none). |
| excel-ro | cursor | pointer | auto | sang 1440, sang 390, toi 1440, toi 390 | ::after là pseudo của chính nút → kế thừa cursor:pointer của .ui-btn; nội dung Radix là phần tử riêng trong ô portal (không nằm trong nút) → cursor auto. Chuột không tương tác với tooltip (rule hover thật của artifact còn pointer-events:none). |
