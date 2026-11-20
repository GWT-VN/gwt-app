# So khớp DetailLayout — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs DetailLayout --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/DetailLayout/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/DetailLayout-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**816/816 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 5 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Giá trị sửa tại chỗ trong cột thuộc tính (ô trạng thái/ưu tiên/người/việc/hạn của preview là InlineEdit, Task 10): khối DS hiện giá trị TĨNH (Badge, Avatar + tên, chữ, link) — chỉ đo hộp nhóm dl/tiêu đề nhóm, không đo phần tử bên trong dd (đã so ở PropertyList)
- Timeline, Composer bên trong cột chính: đã so riêng ở Timeline/Composer — ở đây chỉ đo hộp ngoài (rộng theo cột)
- Cột thuộc tính dính top 16 khi cuộn trang dài: đo `position`/`top` không có trong bộ đo — kiểm bằng class (test detail-layout.test.tsx) + ảnh
- Thứ tự DOM (nội dung trước, thuộc tính sau) và `order: -1` ở ≤960: test detail-layout.test.tsx; vị trí thật đo ở ảnh 390 (thuộc tính nằm trên)
- Khoá `timeline`: chỉ đo width, height, paddingLeft (lọc trong config).

Không có dòng lệch.
