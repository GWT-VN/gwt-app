# So khớp NotificationMatrix — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs NotificationMatrix --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/NotificationMatrix/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (loai: hover · o: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/NotificationMatrix-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1844/1844 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Bấm là lưu, câu role="status" "Đã lưu: …" / lưu lỗi trả ô về cũ, Select kênh tắt khi bỏ tick, tên đọc ô = kênh + loại + mô tả "Gửi cho", caption ẩn, scope col/row/rowgroup: test components/ui/notification.dom.test.tsx
- Menu chọn kênh Discord (Select DS mở): preview không vẽ menu mở — đã so ở Select
- Cột tên ghim trái khi cuộn ngang (390): vị trí dính không có trong bộ đo — kiểm bằng ảnh 390 (cuộn ngang khung bảng)
- Bảng dựng thẳng bằng class `.ui-table` chép trong notif-styles.ts: component Table (Task 7) chưa có lúc dựng — đổi sang Table khi nó vào
- Khoá `checkbox`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).

Không có dòng lệch.
