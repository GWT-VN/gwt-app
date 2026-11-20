# So khớp Banner — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Banner --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Banner/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Banner-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**732/732 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Tooltip "Ẩn" trên nút ✕ của preview: DS bỏ — chữ tooltip lặp nhãn "Ẩn thông báo" (luật NGUON: tooltip là mô tả thêm, không lặp aria-label); hành vi đóng + giữ focus kiểm ở components/ui/feedback.dom.test.tsx
- Hình icon: preview là SVG Phosphor nhúng (CloudSlash, Flask, Info, WarningCircle tô); DS dùng đúng bốn icon đó — chỉ đo hộp + màu, nét so bằng mắt
- Nút: chỉ đo hộp + màu ở trạng thái nghỉ; hover/focus của Button đo ở so-khop Button
- Mốc ≤640: đo ở khổ 390 (xuống dòng, đệm 8/8/8/12); đúng khổ 640 chưa đo — DS dùng biến thể Tailwind max-[640px] (width < 640) còn nguồn là max-width 640 (≤ 640): khác nhau đúng ở khổ 640

Không có dòng lệch.
