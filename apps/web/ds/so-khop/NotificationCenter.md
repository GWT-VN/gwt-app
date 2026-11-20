# So khớp NotificationCenter — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs NotificationCenter --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/NotificationCenter/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (dong-ro: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hop: bam #notification-center button[aria-haspopup="dialog"] → cho 400 · dong-ro (cả artifact): bam {"artifact":".ds-muc:nth-child(1) .ui-notif-title","ds":"#notification-center button[aria-haspopup=\"dialog\"]"} → cho 400 · nut-focus (cả artifact): bam {"artifact":".ds-muc:nth-child(1) .ui-notif-title","ds":"#notification-center button[aria-haspopup=\"dialog\"]"} → cho 400 → tab {"artifact":".ds-muc:nth-child(1) .ui-notif .ui-notif-list > div:nth-child(1) li:nth-child(1) .ui-notif-main","ds":"[data-ds-portal] [data-slot=\"notif\"] [data-slot=\"notif-list\"] > div:nth-child(1) li:nth-child(1) [data-slot=\"notif-main\"]"} → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #notification-center button[aria-haspopup="dialog"] → cho 400. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/NotificationCenter-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2212/2212 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 8 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí hộp (Popover cách chuông 4, căn mép, chừa mép khung nhìn 8) — preview vẽ hộp TĨNH trong trang; so bằng mắt trên ảnh
- Bàn phím + a11y (mở → focus tab đang chọn; Esc/Tab ra ngoài → đóng, focus về chuông/phần tử kế sau; ←/→ Home/End; giữ dòng vừa đọc ở tab Chưa đọc; Đọc hết chỉ loại đang hiện; thông báo mới role=status; nhóm ngày giờ VN lúc 00:30): test components/ui/notification.dom.test.tsx
- Tooltip "Cấu hình" (ui-tip) của nút ⚙ không dựng: tên nút "Cấu hình thông báo" đã đủ — tooltip lặp chữ thì trình đọc đọc hai lần (luật NGUON). Nút chuông cũng vậy (đo ở Count)
- Hình icon Phosphor: chỉ đo hộp + màu
- Hộp rỗng (EmptyState "Đã đọc hết"/"Chưa có thông báo"): preview không có — xem hàng "Không có thông báo" trên /ds (ảnh)
- Mục 2 của preview (tab Chưa đọc sau "Đọc hết": nút tắt, dòng vừa đọc ở yên chỗ): bấm tab trong hộp ở khổ 390 làm hộp lật trên/dưới chuông theo mỗi lần cuộn của cổng (hộp 560 cao hơn chỗ trống) → không đo được ổn định; hành vi kiểm ở test jsdom, nút tắt ghost đã so ở Button
- Khoá `hop`: chỉ đo width, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderBottomWidth, fontSize, fontWeight, lineHeight, color, backgroundColor, boxShadow, opacity (lọc trong config).
- Khoá `nut-focus`: chỉ đo outlineColor, outlineStyle, outlineWidth, outlineOffset, backgroundColor (lọc trong config).

Không có dòng lệch.
