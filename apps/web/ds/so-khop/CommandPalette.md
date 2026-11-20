# So khớp CommandPalette — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs CommandPalette --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/CommandPalette/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): hop-noi: cho 1500 → bam #command-palette [data-so="mo"] → cho 300 · go-noi: cho 1500 → bam #command-palette [data-so="mo"] → cho 300. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: cho 1500 → bam #command-palette [data-so="mo"] → cho 300. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/CommandPalette-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1500/1512 khớp** · 12 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 7 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí hộp nổi (fixed, cách đỉnh 12vh, giữa ngang; ≤640 sát mép 8px): so khớp chỉ đo hộp/màu, không đo top/left — preview vẽ hai hộp tĩnh relative. Đo bằng getBoundingClientRect trên ảnh tự kiểm (báo cáo Task 5)
- Chân + Kbd Esc ẩn ≤640 (display none): bộ đo không có thuộc tính display — kiểm bằng ảnh 390 + getComputedStyle trong báo cáo Task 5
- Nền mờ (đen 30%, tối 50%): preview dùng `<dialog open>` không modal → không có ::backdrop để đo. DS dùng chung `overlay` của dialog-styles.ts (đã đo ở so khớp Dialog)
- Hiện 160ms (`ui-dialog-len`; DS transition + @starting-style), giảm chuyển động → không: đo sau khi hiện xong (cho 300ms)
- Hình icon: preview là path Phosphor kính lúp/Ticket/User/Cpu/Sparkle tô; DS dùng cùng bộ Phosphor — chỉ đo hộp + màu
- Bàn phím (Ctrl K / ⌘K theo nền tảng, ↑/↓ vòng, Enter mở, Esc đóng + focus về nút mở), bộ gõ đang ghép chữ, khớp không dấu + SĐT, cắt 5 dòng/nhóm + 5/7, câu không thấy ngoài listbox, vùng role=status: test jsdom components/ui/command-palette.dom.test.tsx
- Thứ tự nhóm theo dạng chữ gõ (prototype: gõ số → khách/đơn trước, "TK…" → ticket trước): DS giữ thứ tự `nhom` bên gọi truyền vào — bên gọi tự sắp nếu cần

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| hop-noi | width | 608px | 640px | sang 1440, toi 1440 | Cùng công thức min(640px, 100% − 32px) nhưng khác khối chứa: preview vẽ hộp tĩnh relative trong cột `.ds-tinh` rộng 640 → 640 − 32 = 608; hộp nổi DS fixed theo KHUNG NHÌN 1440 → min(640, 1408) = 640 (đúng hộp nổi thật của artifact: `dialog.ui-command` fixed). Hộp tĩnh DS (khoá `hop`) khớp 608. |
| hop-noi | zIndex | auto | 70 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ `<dialog open>` tĩnh (không showModal, không z-index → auto). Hộp thật của artifact là `dialog.ui-command` mở bằng showModal → top layer. DS dùng Radix Portal (không top layer) → z-70 = lớp dialog của thang z ds/NGUON.md (như so khớp Dialog). |
| go-noi | width | 515.5px | 547.5px | sang 1440, toi 1440 | Theo bề rộng hộp (khoá hop-noi: preview tĩnh 608, DS nổi 640) − đệm hàng gõ 16 + 12 − kính lúp 16 − Esc 28.5 − 2 × gap 10 → 515.5 / 547.5. Ô gõ tĩnh DS (khoá hang-go) khớp. |
| hop-noi | width | 342px | 374px | sang 390, toi 390 | ≤640 cùng công thức 100% − 16px, khác khối chứa: preview tĩnh trong cột 358 (390 − padding 16 × 2) → 342; hộp nổi DS fixed theo khung nhìn 390 → 374 (sát mép 8px hai bên — đo getBoundingClientRect: trái 8, phải 8, đỉnh 8). Hộp tĩnh DS (khoá `hop`) khớp 342. |
| go-noi | width | 288px | 320px | sang 390, toi 390 | Theo bề rộng hộp (khoá hop-noi: preview tĩnh 342, DS nổi 374); Esc ẩn ≤640 → 342 − 28 − 16 − 10 = 288 / 374 → 320. Ô gõ tĩnh DS (khoá hang-go) khớp. |
