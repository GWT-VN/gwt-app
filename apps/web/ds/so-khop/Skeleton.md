# So khớp Skeleton — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Skeleton --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Skeleton/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Skeleton-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**396/396 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 7 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Khối chờ `.ui-skeleton` và dòng bảng đang tải: preview Skeleton ở trạng thái ĐÃ TẢI (aria-busy=false, chỉ có dòng dữ liệu thật) — dòng chữ 1/2, dòng tiêu đề 1/3, dòng chữ 2/3 đo ở so-khop StatCard (thẻ đang tải, khoá s-7); hình circle, pill, bậc 1/4 và 3/4, chồng dọc `ui-skeleton-stack`, dòng chờ của SkeletonDong (cùng khung `skeletonRow` với dòng thật đo ở đây) chưa đo bằng số — hành vi (aria-hidden, aria-busy, số dòng) kiểm ở components/ui/feedback.dom.test.tsx
- Hiện sau 300ms (`@starting-style` + transition trễ) và nhấp nháy 1.4s / đứng yên khi giảm chuyển động: không đo bằng computed style — xem bằng mắt (bấm Tải lại trên /ds#skeleton)
- Nội dung dòng thật (badge, tên, mô tả, avatar): class `ph-*` của prototype không có trong bundle.css → chỉ đo khung dòng; Badge/Avatar đo ở so-khop Badge, Avatar
- Nút: chỉ đo hộp + màu ở trạng thái nghỉ; hover/focus của Button đo ở so-khop Button
- Khoá `tai-lai`: chỉ đo width, height, borderRadius, backgroundColor, color, boxShadow, fontSize, fontWeight, gap (lọc trong config).
- Khoá `luu`: chỉ đo width, height, borderRadius, backgroundColor, color, boxShadow, fontSize, fontWeight, cursor (lọc trong config).
- Khoá `dang-gui`: chỉ đo width, height, borderRadius, backgroundColor, color, boxShadow, fontSize, fontWeight, cursor (lọc trong config).

Không có dòng lệch.
