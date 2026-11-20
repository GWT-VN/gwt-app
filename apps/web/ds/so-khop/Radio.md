# So khớp Radio — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Radio --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Radio/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hover (cả artifact): tro {"artifact":"body > div > .ds-muc:nth-child(1) > fieldset > label:nth-of-type(2) > .ui-radio","ds":"#radio [data-so=\"doc\"] > label:nth-of-type(2) > button"} → cho 200 · focus (cả artifact): bam {"artifact":"body > div > .ds-muc:nth-child(1) > .ds-nhan","ds":"#checkbox [data-so=\"loi\"] > button"} → tab {"artifact":"body > div > .ds-muc:nth-child(1) > fieldset > label:nth-of-type(1) > .ui-radio","ds":"#radio [data-so=\"doc\"] > label:nth-of-type(1) > button"} → cho 200 · tat-hover (cả artifact): tro {"artifact":"body > div > .ds-muc:nth-child(1) > fieldset > label:nth-of-type(3) > .ui-radio","ds":"#radio [data-so=\"doc\"] > label:nth-of-type(3) > button"} → cho 200 · loi-hover (cả artifact): tro {"artifact":"body > div > .ds-muc:nth-child(3) > fieldset > label:nth-of-type(1) > .ui-radio","ds":"#radio [data-so=\"loi-nhom\"] > label:nth-of-type(1) > button"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: cham-chon {"artifact":"::after","ds":"::after"} · cham-chua {"artifact":"::after","ds":"::after"} · cham-tat {"artifact":"::after","ds":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Radio-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**3948/3948 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 8 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Preview không có mục hover/focus ép sẵn: hover (Tiền mặt) và focus đo bằng tương tác THẬT ở CẢ HAI bên. Focus: Radix để mọi item tabIndex −1 tới khi nhóm nhận focus (fieldset là điểm dừng Tab rồi chuyển vào mục đang chọn) → bước tab không nhảy thẳng tới item được; bên DS bấm ô Checkbox cuối của khối #checkbox (khối liền trước trên /ds — đổi thứ tự khối thì sửa bước này) rồi Tab thật (link tiêu đề #radio → fieldset → mục Chuyển khoản); bên artifact bấm nhãn khung rồi Tab (radio gốc tự là điểm dừng)
- Vòng đo qua con `o` với thuộc tính của HỘP; font/màu chữ của vòng không đo (input nguồn mang font UA, vòng DS là button không chữ) — nhãn bọc ngoài đo đủ 32 thuộc tính
- Chấm chọn: kích thước/bo/màu đo bằng pseudo ::after (cham-*); transform scale 0 → 1 trong 120ms và tắt chuyển động khi prefers-reduced-motion không nằm trong bộ thuộc tính đo — cùng chuỗi CSS với nguồn
- Hover lên vòng ĐÃ chọn ở theme tối: bundle.css đổi viền sang gray-600 (rule tối 0,3,0 thắng :checked 0,2,0), DS giữ viền primary-solid như theme sáng — preview không có ca này
- Tab vào nhóm focus mục đang chọn, mũi tên đổi lựa chọn + bỏ qua mục tắt, bấm chữ nhãn chọn, aria-invalid + aria-describedby nhóm: test jsdom components/ui/checkbox-radio.dom.test.tsx
- Khoá `cham-chon`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `cham-chua`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `cham-tat`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).

Không có dòng lệch.
