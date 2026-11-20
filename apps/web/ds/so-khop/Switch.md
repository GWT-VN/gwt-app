# So khớp Switch — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Switch --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Switch/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (bat: hover/focus · tat: hover/focus · khoa: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: bat-num {"artifact":"::after"} · tat-num {"artifact":"::after"} · khoa-num {"artifact":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Switch-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2076/2080 khớp** · 4 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 10 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Hiệu ứng trượt núm 150ms và tắt trượt khi prefers-reduced-motion: thuộc tính transition không nằm trong bộ đo — khoá bằng class trong components/ui/switch.tsx
- Vị trí núm (cách mép 2, bật dịch 14px): bộ đo không đo toạ độ — nhìn ảnh chụp so khớp
- Bấm chữ đổi công tắc, Space bật/tắt, tên đọc được = nhãn, mô tả qua aria-describedby, tắt không đổi: test jsdom components/ui/switch.dom.test.tsx
- Hàng tắt CÓ mô tả: preview không có (mô tả giữ muted-foreground)
- Khoá `bat`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `bat-num`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `tat`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `tat-num`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `khoa`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `khoa-num`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| khoa | hover.backgroundColor | rgb(48 48 48) | rgb(24 24 24) | sang 1440, sang 390 | Lỗi nguồn: .ui-switch:checked:hover của bundle.css không loại :disabled → công tắc TẮT (khoá) vẫn đổi sang primary-solid-hover khi rê. DS: công tắc tắt không phản hồi chuột (hover chỉ khi enabled), nhất quán ô nhập tắt (input.json) — đề xuất đồng bộ ngược artifact. |
| khoa | hover.backgroundColor | rgb(237 237 237) | rgb(243 243 243) | toi 1440, toi 390 | Lỗi nguồn: .ui-switch:checked:hover của bundle.css không loại :disabled → công tắc TẮT (khoá) vẫn đổi sang primary-solid-hover khi rê. DS: công tắc tắt không phản hồi chuột (hover chỉ khi enabled), nhất quán ô nhập tắt (input.json) — đề xuất đồng bộ ngược artifact. |
