# So khớp InputAffix — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs InputAffix --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/InputAffix/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (gia-khung: hover · loi-khung: hover · tat-khung: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): gia-khung-focus (cả artifact): tab {"artifact":"#m1","ds":"#ds-ia-gia"} → cho 200 · loi-khung-focus (cả artifact): tab {"artifact":"#m3","ds":"#ds-ia-tien"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/InputAffix-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2560/2560 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Gõ / dán / xoá / chèn giữa số và vị trí con trỏ của OTien: preview tĩnh không có hành vi — test jsdom components/ui/input-group.dom.test.tsx
- Đơn vị đặt trước số (addon inline-start, data-side start): preview không có — test jsdom kiểm order-first
- Ô vừa lỗi vừa tắt: preview không có; DS cho tắt thắng lỗi (như controlOutline)
- Nhãn Chiết khấu: DS ghi "Chiết khấu (%)" theo README (nói đơn vị vì % là aria-hidden), preview ghi "Chiết khấu" — không đo nhãn này
- fontVariantNumeric (tabular-nums theo inputmode): không nằm trong bộ thuộc tính đo; kiểm bằng mắt ở ảnh

Không có dòng lệch.
