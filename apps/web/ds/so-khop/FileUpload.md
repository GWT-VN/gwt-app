# So khớp FileUpload — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs FileUpload --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/FileUpload/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (drop: hover · tat: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): drop-focus (cả artifact): tab {"artifact":"#u1","ds":"#ds-tep"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/FileUpload-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1916/1916 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 6 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Đang kéo tệp vào (data-over: viền liền ring, nền info-soft-alpha, chữ "Thả tệp vào đây"): preview không có trạng thái này, so-khop không giả lập kéo thả — test jsdom components/ui/file-upload.dom.test.tsx + kéo thử tay trên /ds
- Chọn tệp qua hộp chọn, thả không lọc ngầm, kiemTep (loại trước dung lượng), kichThuocDoc, nút Thử lại: test jsdom components/ui/file-upload.dom.test.tsx
- Vùng thả lỗi (aria-invalid → data-invalid, viền red-500 như khối aria-invalid của .ui-drop trong bundle.css): preview không có trạng thái này nên không có khoá — đo tay getComputedStyle trên /ds (báo cáo fix I2); nối nhãn/mô tả/required: test jsdom
- Ô xem trước có ảnh thật (img cover): preview không có — khối demo không tạo URL xem trước
- Nút Bỏ: hover/focus của Button ghost icon-sm đo ở so-khop Button; chữ tooltip "Bỏ tệp" đo ở so-khop Tooltip
- Input file ẩn nhìn (1×1, opacity 0): chỉ đo rộng/cao/opacity/cursor (con "input" của drop/tat) — font, viền, màu chữ của nó không lộ ra mắt (UA mặc định bên artifact ≠ preflight app bên DS)

Không có dòng lệch.
