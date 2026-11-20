# So khớp Tabs — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Tabs --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Tabs/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hover: tro #tabs [data-so="seg-thuong"] → cho 200 · focus: bam #tabs [data-so="seg-chon"] → phim ArrowDown → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Tabs-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1440/1440 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 6 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Hover và focus: preview chỉ có 2 nút mẫu ép class (is-hover, is-focus, cao 24 inline, chưa chọn). Bên artifact đo 2 nút mẫu đó; bên DS đo tab THẬT bằng tương tác thật (rê tab Chờ xử lý; focus = bấm link tiêu đề #tabs rồi Tab thật — Radix RovingFocus để tab tabIndex −1 tới khi rãnh tablist nhận focus, rãnh chuyển focus vào tab đang chọn). Chỉ so thuộc tính của trạng thái (màu chữ/nền/cursor, outline), không so kích thước
- ←/→ chuyển + kích hoạt, Home/End, bỏ qua tab tắt, chỉ tab chọn tabIndex 0, số đếm đọc kèm nhãn, thu gọn vào nút Thêm: test jsdom components/ui/tabs.dom.test.tsx
- Pill tràn (cuộn ngang, mờ mép phải 40px) và thu gọn Thêm: preview không có ca này — chỉ có ở /ds (hàng Pill tràn, Pill thu gọn), kiểm bằng ảnh
- Focus phím của panel (outline 2 ring cách 2, bo radius-sm) và hover tab pill: preview không có ca riêng; cùng chuỗi class với nguồn
- Khoá `hover`: chỉ đo color, backgroundColor, boxShadow, cursor (lọc trong config).
- Khoá `focus`: chỉ đo outlineColor, outlineStyle, outlineWidth, outlineOffset (lọc trong config).

Không có dòng lệch.
