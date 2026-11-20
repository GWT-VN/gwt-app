# So khớp SavedView — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs SavedView --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/SavedView/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): khung: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400 · tieuDe: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400 · tomTat: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400 · truong: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400 · chiaSe: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400 · chan: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: cho 1500 → bam #saved-view button[aria-haspopup="dialog"] → cho 400. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/SavedView-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**836/840 khớp** · 4 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Preview vẽ popover tĩnh, không có nút "Lưu bộ lọc"; DS mở bằng bấm nút đó trên FilterBar thật (khe `phai` của ThanhDangLoc) — nút là Button ghost sm (đo ở so-khop Button / FilterBar)
- Vị trí (neo mép phải nút, cách 4): Radix Popper đặt toạ độ, getComputedStyle không đo — xem ảnh
- Câu lỗi tên trống ("Đặt tên để tìm lại trong sidebar.") + ô aria-invalid: preview không vẽ trạng thái lỗi — FieldError đã đo ở so-khop Input; hành vi ở test jsdom components/ui/data-view.dom.test.tsx
- Focus sẵn ô tên, Enter lưu (không khi đang ghép chữ), lưu → onLuu + toast, Huỷ/Esc đóng: test jsdom components/ui/data-view.dom.test.tsx

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| khung | zIndex | auto | 90 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ `.ui-menu.ui-saveview` tĩnh, không lớp nổi → auto. Popover thật của prototype là `.b-noi` (z-index 90, thang z NGUON "menu 90"); DS dùng z-90 của menuContent/Popover như DropdownMenu. |
