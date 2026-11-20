# So khớp RecordPicker — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs RecordPicker --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/RecordPicker/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/RecordPicker-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1024/1028 khớp** · 4 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 7 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Tên khách: DS dùng tên giả có chữ "Demo" (R11), preview dùng tên khác → bề ngang dòng tên khác chữ; khoá con `ten` chỉ đo cỡ/đậm/màu/cao, không đo rộng
- Dòng đếm: preview ghi "22 khách" nhưng vẽ 4 dòng; DS vẽ đúng 4 khách nên ghi "4 khách" — chỉ khác chữ, hộp cùng cỡ
- Mục đang SÁNG (cmdk, ↑/↓) nền alpha-08 và mục đang CHỌN nền alpha-04 + ✓: preview không vẽ — đo bằng ảnh /ds#record-picker (hàng "Mới mở" có khách đang chọn) + test jsdom
- Không khớp ("Không thấy khách …"), tìm xa (gõ thêm / đang tìm / lỗi), Enter chọn dòng đầu, bộ gõ đang ghép chữ, SĐT chỉ 4 số cuối: test jsdom components/ui/record-picker.dom.test.tsx
- Pop nổi thật (mở từ ô khách, portal, z 90, rộng 400 / tối đa 100vw − 32): đo bằng ảnh + elementFromPoint trong báo cáo Task 10; preview vẽ bảng tĩnh
- Hình icon: preview là path Phosphor kính lúp / WarningCircle / Plus; DS cùng bộ Phosphor — chỉ đo hộp + màu
- Khoá `luuy`: chỉ đo width, height, color (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| khung | zIndex | 90 | auto | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ `.b-noi` tĩnh (`.ds-tinh .b-noi { position: static !important }`) nhưng vẫn mang z-index 90 của lớp menu nổi. Mặt tĩnh DS bỏ z (`z-auto`, như mặt tĩnh Combobox) vì không nổi; pop THẬT mở từ ô khách dùng z-90 chung của menuContent (thang z ds/NGUON.md). |
