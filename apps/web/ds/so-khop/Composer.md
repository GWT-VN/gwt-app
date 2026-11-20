# So khớp Composer — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Composer --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Composer/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (thuong: hover · chip-x-hover: hover/focus); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): focus (cả artifact): tab {"artifact":".ui-stack > .ui-composer:nth-child(1) > textarea","ds":"#composer > div > div:nth-child(1) textarea"}. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Composer-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1088/1088 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 7 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Đang gửi (ô chỉ đọc, nút quay vòng aria-busy), gửi thật / xoá sau khi gửi, Ctrl/⌘+Enter, bộ gõ đang ghép chữ, chọn + bỏ tệp: preview không có — test jsdom components/ui/chi-tiet.dom.test.tsx + bản hàng trên /ds
- Câu lỗi dưới ô lỗi (FieldError trong vùng aria-live): preview không có (README: lỗi gửi giữ nội dung, viền đỏ, nút Gửi lại) — DS thêm, đo ở so-khop Input (câu lỗi .ui-error)
- Màu placeholder (color-text-tertiary): getComputedStyle không đọc được ::placeholder — xem ảnh
- Chữ tooltip của 📎 / Gửi: đo ở so-khop Tooltip; DS ghi mô tả thêm ("Chọn tệp từ máy", "Ctrl + Enter") thay vì lặp tên nút như preview (luật NGUON)
- Nút 📎 / Gửi: hover/focus của Button đo ở so-khop Button
- Khoá `focus`: chỉ đo boxShadow (lọc trong config).
- Khoá `chip-x-hover`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).

Không có dòng lệch.
