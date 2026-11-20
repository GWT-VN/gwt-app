# So khớp InlineEdit — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs InlineEdit --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/InlineEdit/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (o-khach: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): menu-tt: cho 1500 → bam #inline-edit [data-so="o-tt"] button → cho 800 · menu-tt-muc: cho 1500 → bam #inline-edit [data-so="o-tt"] button → cho 800 · menu-tt-tick: cho 1500 → bam #inline-edit [data-so="o-tt"] button → cho 800 · menu-loi: cho 1500 → bam #inline-edit [data-so="o-loi"] button → cho 800 · menu-loi-muc: cho 1500 → bam #inline-edit [data-so="o-loi"] button → cho 800. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: cho 1500 → bam #inline-edit [data-so="o-tt"] button → cho 300. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/InlineEdit-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2828/2840 khớp** · 12 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 6 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Hai menu tĩnh của preview (trạng thái, loại lỗi) đo trên menu MỞ THẬT từ ô (bấm CDP) — vị trí menu (bám ô, lật khi thiếu chỗ, chừa mép 8) so bằng ảnh + elementFromPoint trong báo cáo Task 10, không đo top/left
- Hàng Hover của preview gắn sẵn .is-hover; DS đo hover bằng chuột CDP thật trên hàng Thường (khoá có trangThai hover). Hàng Hover bên DS chỉ giữ bố cục lưới
- Vòng focus phím của ô (2px ring): preview không có trạng thái focus — chưa đo, test jsdom + ảnh
- Bước 2 "Chờ vì…" (lý do chờ), ô hạn (lịch), ô người có tìm, toast Hoàn tác / lỗi trả giá trị cũ, chặn nổi bọt lên dòng, bộ gõ đang ghép chữ: preview không có — test jsdom components/ui/inline-edit.dom.test.tsx
- Hình icon: preview là path Phosphor CaretDown/Check/WarningCircle/ArrowCounterClockwise; DS dùng cùng bộ Phosphor — chỉ đo hộp + màu
- Khoá `menu-tt-tick`: chỉ đo width, height, color (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| menu-tt | width | 348.5px | 200px | sang 1440, sang 390, toi 1440, toi 390 | Preview: menu tĩnh nằm trong `.ds-muc` (con của hàng flex `.ds-hang`) nên giãn theo nhãn mục dài phía trên ("Menu trạng thái (mục đầu đang hover, mục đang chọn có ✓)") = 348.5px. Menu thật ôm nội dung, tối thiểu 200 (`.ui-menu` min-width) — mục dài nhất "Chờ KH xác nhận" chưa tới 200. |
| menu-tt-muc | width | 336.5px | 188px | sang 1440, sang 390, toi 1440, toi 390 | Mục giãn theo bề ngang menu: preview 348.5 − 2 × 6 = 336.5 (menu giãn theo nhãn mục, xem khoá menu-tt); menu thật 200 − 12 = 188. |
| menu-tt-muc | hover.width | 336.5px | 188px | sang 1440, sang 390, toi 1440, toi 390 | Như dòng width (menu preview giãn theo nhãn mục). |
