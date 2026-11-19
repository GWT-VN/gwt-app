# So khớp Button — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Button --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Button/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 27 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (default: hover/focus · outline: hover/focus · ghost: hover/focus · destructive: hover/focus · link: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"Inter", "Inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Button-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2548/2644 khớp** · 96 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- :active (nhấn giữ) — chưa đo ở biến thể nào
- ghost aria-pressed / aria-expanded / aria-checked (nền accent khi đang bật) — preview không có nút ở trạng thái này
- loading + hover — nút loading của preview KHÔNG disabled nên hover đổi nền; DS loading là disabled nên giữ nền. Đo bên nào cũng không ra kết luận đúng
- link disabled (cả sáng/tối) — preview không có
- asChild (vd <a>) — preview không có; kiểu disabled/aria-disabled cho asChild chưa làm (ghi trong spec, việc lát 2)

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| default | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| default | hover.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| default | focus.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| secondary | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| outline | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| outline | hover.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| outline | focus.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| ghost | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| ghost | hover.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| ghost | focus.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| destructive | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| destructive | hover.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| destructive | focus.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| link | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| link | hover.fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| disabled | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| loading | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| outline-disabled | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| sm | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| md | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| lg | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| icon | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| rounded-sm | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
| icon-sm-rounded | fontFeatureSettings | normal | "cv11", "ss03" | sang 1440, sang 390, toi 1440, toi 390 | CEO chốt 19/11: bật cv11/ss03 đồng bộ cả vùng DS; artifact tắt trên nút chỉ do shorthand `font:` trong bundle.css (vô tình) |
