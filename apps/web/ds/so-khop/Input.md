# So khớp Input — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Input --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Input/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (ten: hover/focus · tim: hover/focus · loi: hover/focus · tat: hover · ghi-chu: hover/focus); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hover: tro #input [data-so="hover"] → cho 200 · focus: tab #input [data-so="focus"] → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: ten-placeholder {"artifact":"::placeholder","ds":"::placeholder"} · ghi-chu-placeholder {"artifact":"::placeholder","ds":"::placeholder"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Input-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**3338/3340 khớp** · 2 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 6 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Theme tối, rê chuột lên ô ĐANG focus: bundle.css ra viền alpha-30 (rule tối đặc hiệu cao hơn :focus), DS giữ alpha-50 (focus thắng hover như theme sáng) — có chủ đích, ghi ở control-styles.ts
- Ô vừa lỗi vừa tắt: preview không có; DS cho tắt thắng lỗi
- Nút ✕ xoá chữ của ô type=search và tay kéo giãn Textarea: kiểu mặc định trình duyệt, hai bên như nhau, không đo
- FieldSet / FieldLegend / FieldMeta: preview Input không có — đo ở so khớp Radio, Checkbox và FormLayout
- controlOutlineWithin (khung bọc ô không viền): không dùng trong khối Input — đo ở so khớp InputAffix
- Bấm nhãn focus ô, tên đọc được bỏ dấu *, gợi ý nối aria-describedby: test jsdom components/ui/field-input.test.tsx

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| tat | hover.boxShadow | rgb(255 255 255 / 0.302) 0px 0px 0px 1px inset | rgb(255 255 255 / 0.059) 0px 0px 0px 1px inset | toi 1440, toi 390 | Lỗi đặc hiệu của nguồn: rule hover theme tối của bundle.css (data-theme tối + .ui-input:hover, đặc hiệu 0,3,0) thắng .ui-input:disabled (0,2,0) → ô TẮT vẫn đậm viền alpha-30 khi rê ở theme tối, theme sáng thì không. DS giữ viền tắt color-border-disabled ở cả hai theme (ô tắt không phản hồi chuột), nhất quán theme sáng — đề xuất đồng bộ ngược artifact. |
