# So khớp Checkbox — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Checkbox --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Checkbox/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hover: tro #checkbox [data-so="hover"] > button → cho 200 · focus: tab #checkbox [data-so="focus"] > button → cho 200 · tat-hover (cả artifact): tro {"artifact":"body > div > .ui-checkbox-label:nth-child(6) > .ui-checkbox","ds":"#checkbox [data-so=\"tat\"] > button"} → cho 200 · loi-hover (cả artifact): tro {"artifact":"body > div > .ui-stack .ui-checkbox","ds":"#checkbox [data-so=\"loi\"] > button"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: chon-dau {"artifact":"::after"} · mot-phan-dau {"artifact":"::after"} · tat-chon-dau {"artifact":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Checkbox-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2796/2796 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 8 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Dấu ✓ / – nguồn vẽ bằng ::after, DS vẽ trên Indicator `checkbox-indicator` (khung shadcn) với cùng số — đo qua khoá chon-dau / mot-phan-dau / tat-chon-dau (pseudo); riêng transform (xoay −45°, nhích −1px) không nằm trong bộ thuộc tính đo — cùng chuỗi CSS với nguồn, so bằng mắt qua ảnh
- Ô đo qua con `o` với thuộc tính của HỘP (kích thước, top, viền, nền, outline, chuyển động); font/màu chữ của ô không đo — input nguồn mang font UA (Arial 13.5) còn ô DS là button không chữ, nhãn bọc ngoài mới mang chữ (đo đủ 32 thuộc tính)
- Hover lên ô ĐÃ chọn / một phần ở theme tối: bundle.css đổi viền sang gray-600 (rule tối 0,3,0 thắng :checked 0,2,0), DS giữ viền gray-900 như theme sáng — preview không có ca này
- Ô vừa lỗi vừa tắt, lỗi + đã chọn: preview không có; DS cho tắt thắng lỗi, lỗi thắng viền chọn (như nguồn theme sáng)
- Bấm chữ nhãn đổi ô, một phần → aria-checked mixed, aria-invalid giữ nguyên: test jsdom components/ui/checkbox-radio.dom.test.tsx
- Khoá `chon-dau`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `mot-phan-dau`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `tat-chon-dau`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).

Không có dòng lệch.
