# So khớp Timeline — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Timeline --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Timeline/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: noi-giua {"artifact":"::before","ds":"::before"} · noi-cuoi-ngay {"artifact":"::before","ds":"::before"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Timeline-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**524/524 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Bấm "Hiện 3 hoạt động cũ hơn" (mở phần cũ, focus vào mục cũ nhất), mục có tệp đính (chip), mốc màu success: preview không có — test jsdom components/ui/chi-tiet.dom.test.tsx + bản hàng "Mở hết" trên /ds
- Nút "Hiện N": hover/focus của Button ghost sm đo ở so-khop Button
- Viền focus của mục (focus bằng code sau khi mở phần cũ): bundle.css không có kiểu này — DS dùng outline ring như phần tử DS khác
- title của <time>: preview ghi "Hôm qua · 08:30" (tương đối), DS ghi ngày đủ "Thứ Ba, 17/11/2026 · 08:30" theo README "title ngày giờ đủ" — không phải thuộc tính CSS

Không có dòng lệch.
