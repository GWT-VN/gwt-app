# So khớp FormLayout — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs FormLayout --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/FormLayout/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/FormLayout-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2848/2848 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Kiểm khi bấm Lưu / rời ô đã sửa, không đỏ lúc mới mở, lưu lỗi focus ô lỗi đầu (focusLoiDau), đang lưu khoá 2 nút, lỗi máy chủ → Alert danger đầu form giữ dữ liệu: preview tĩnh không có hành vi — test jsdom components/ui/form-layout.dom.test.tsx
- Alert lỗi máy chủ đầu form: preview không có — kiểu Alert danger đo ở so-khop Alert
- Thẻ bọc (.ui-card.ui-card-pad): DS chưa có component Card, khối dựng tạm bằng class để trình bày — đo ở khoá the-1/the-2 cho khớp khung, không phải component
- Ô con trong lưới (Input, Select, DatePicker, OTien, Radio, Checkbox, Textarea, FileDrop, Switch): kiểu riêng đo ở so-khop của từng component; ở đây chỉ đo ô lưới (rộng/cao/vị trí 2 cột ↔ 1 cột) và 3 ô lỗi của form 2
- Danh sách tệp đã chọn trong form: preview trống, không có dòng tệp — dòng tệp đo ở so-khop FileUpload

Không có dòng lệch.
