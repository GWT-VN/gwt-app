# So khớp PageHeader — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs PageHeader --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/PageHeader/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): không khoá nào. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: meta-dau {"artifact":"::before","ds":"::before"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/PageHeader-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**444/448 khớp** · 4 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 3 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Nút ‹ › đang bật (giữa danh sách), bấm chuyển bản ghi, tooltip mô tả: preview chỉ có "1 / 1" hai nút tắt — test jsdom components/ui/chi-tiet.dom.test.tsx + bản hàng "Đầy đủ" trên /ds
- Menu "Đổi trạng thái" / ⋯ đang mở: đo ở so-khop DropdownMenu; hover/focus của Button đo ở so-khop Button
- Chữ ẩn nhìn "Ticket thứ 1 trong 1" (thay aria-label trên span trơn của preview): không có hộp — test jsdom

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| header | goi.width | 163px | 155px | sang 390, toi 390 | README: ≤640 "2 nút chữ chia đôi bề rộng". DS: hai nút là con trực tiếp (trigger menu asChild) → flex 1 chia đúng 155/155 (tổng 310 = preview). Preview ra 163/147 (tổng cũng 310) — preview bọc nút menu trong span inline-flex, nút trong span rộng 100%; chưa truy chính xác vì sao preview không chia đều (đang đoán do lớp span bọc), DS theo README |
| header | doi.width | 147px | 155px | sang 390, toi 390 | Cùng lý do goi.width@390: DS chia đều 155/155 đúng README; preview 163/147 |
