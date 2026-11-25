# So khớp FilterBar — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs FilterBar --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/FilterBar/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): x-hover (cả artifact): tro {"artifact":".ui-filterbar > .ui-chip:nth-child(1) > .ui-chip-x","ds":"#filter-bar [role=\"region\"] > div > span:nth-child(1) > a"} → cho 200 · x-focus (cả artifact): tab {"artifact":".ui-filterbar > .ui-chip:nth-child(1) > .ui-chip-x","ds":"#filter-bar [role=\"region\"] > div > span:nth-child(1) > a"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/FilterBar-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1316/1352 khớp** · 36 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Nút "Lưu bộ lọc" (SavedView — Task 8) cắm ở khe `phai`: chỉ đo bề rộng cụm phải; nút + popover đo ở so khớp SavedView
- Thứ tự hiện: DOM của bang/ đặt số dòng TRƯỚC chip sắp xếp; GIAO_DIEN_DS dùng `order` (CSS) để chip sắp xếp hiện trước như preview — getComputedStyle không đo vị trí, so bằng ảnh
- Nút × của chip là link `<a>` (bang/ dựng URL bỏ điều kiện, điều hướng thật) thay cho `<button>` của preview
- Bỏ đúng một chip, Xoá lọc về đường dẫn trần, số dòng aria-live, vùng có tên: test jsdom components/ui/bang-ds.dom.test.tsx
- README: không có điều kiện thì ẩn cả hàng — ThanhDangLoc của bang/ luôn hiện số dòng; màn tự quyết ẩn; chip sắp xếp ẩn khi mặc định = màn không truyền `sapXep` (ChipSapXep vẫn hiện chip không × nếu được truyền `macDinh`)

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| khung | height | 48px | 52px | sang 1440, toi 1440 | Preview gắn thêm `.b-filterbar { margin: -4px 0 12px }` của prototype (vị trí hàng trong màn ticket, không thuộc component) → khung ngắn hơn 4px. |
| x-hover | fontFamily | Arial | inter, "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-hover | fontSize | 13.5px | 12px | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-hover | lineHeight | normal | 18px | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-hover | fontFeatureSettings | normal | "ss03" | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-focus | fontFamily | Arial | inter, "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-focus | fontSize | 13.5px | 12px | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-focus | lineHeight | normal | 18px | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| x-focus | fontFeatureSettings | normal | "ss03" | sang 1440, sang 390, toi 1440, toi 390 | Nút chỉ có icon, không vẽ chữ: preview là <button> trần (font UA Arial 13.33px, line-height normal, không cv11/ss03); DS là link <a> kế thừa chữ của chip (Inter 12/18). Hộp 20×20 và icon 12px khớp. |
| khung | height | 132px | 136px | sang 390, toi 390 | Preview gắn thêm `.b-filterbar { margin: -4px 0 12px }` của prototype (vị trí hàng trong màn ticket, không thuộc component) → khung ngắn hơn 4px. |
