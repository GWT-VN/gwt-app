# So khớp Alert — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Alert --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Alert/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 28 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"Inter", "Inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Alert-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**736/776 khớp** · 40 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 4 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Hình icon: preview vẽ tay (vòng tròn i / dấu tích / tam giác / vòng tròn !), DS dùng Phosphor Info/Check/Warning/WarningCircle — chỉ đo hộp, màu, fill/stroke; hình nét so bằng mắt trên ảnh
- Alert không tiêu đề / không mô tả / nhiều hành động, icon tuỳ chỉnh (prop icon) — preview không có
- Nút trong hành động: chỉ đo trạng thái nghỉ; hover/focus của Button outline sm đã đo ở so-khop Button
- AlertActions phủ 2 dòng (row-span-2): Alert có >2 khối chữ thì nút giữa theo 2 dòng đầu, không theo cả khối — preview không có ca này

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| mac-dinh | icon.fill | none | rgb(93 93 93) | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| mac-dinh | icon.stroke | rgb(93 93 93) | none | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| info | icon.fill | none | rgb(1 105 204) | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| info | icon.stroke | rgb(1 105 204) | none | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| success | icon.fill | none | rgb(0 105 42) | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| success | icon.stroke | rgb(0 105 42) | none | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| warning | icon.fill | none | rgb(146 59 15) | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| warning | icon.stroke | rgb(146 59 15) | none | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| danger | icon.fill | none | rgb(145 30 27) | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| danger | icon.stroke | rgb(145 30 27) | none | sang 1440, sang 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| mac-dinh | icon.fill | none | rgb(175 175 175) | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| mac-dinh | icon.stroke | rgb(175 175 175) | none | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| info | icon.fill | none | rgb(102 181 255) | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| info | icon.stroke | rgb(102 181 255) | none | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| success | icon.fill | none | rgb(4 184 76) | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| success | icon.stroke | rgb(4 184 76) | none | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| warning | icon.fill | none | rgb(226 85 7) | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| warning | icon.stroke | rgb(226 85 7) | none | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| danger | icon.fill | none | rgb(224 46 42) | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
| danger | icon.stroke | rgb(224 46 42) | none | toi 1440, toi 390 | Icon preview là SVG viết tay vẽ bằng NÉT (fill none, stroke currentColor, stroke-width 2); Phosphor regular vẽ bằng path TÔ (fill currentColor, không stroke). Cùng currentColor (icon.color khớp), hộp 16×16 + margin-top 2px khớp. |
