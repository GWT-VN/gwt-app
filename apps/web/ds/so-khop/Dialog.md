# So khớp Dialog — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Dialog --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Dialog/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): overlay: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · panel: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · title: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · desc: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · body: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · footer: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · huy: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · xoa: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100 · close: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #dialog [data-so="mo"] → cho 250 → tro [data-ds-portal] [data-slot="dialog-title"] → cho 100. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Dialog-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1152/1164 khớp** · 12 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 9 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí hộp: preview căn giữa khung #stage 328px; DS căn giữa KHUNG NHÌN (fixed, inset 0, margin auto, cao vừa nội dung — y `dialog.ui-dialog`). Chỉ đo hộp/màu, không đo left/top; so vị trí bằng mắt trên ảnh
- Nút rộng hết ≤640 (`> .ui-btn { width: 100% }`): footer column-reverse đã ĐO (flexDirection, khoá footer @390) nhưng nút cột dọc tự giãn hết bề ngang kể cả khi selector `[&>*]:w-full` trượt → width khớp không chứng minh selector; chứng minh bằng test DOM dialog.dom.test.tsx (selector khớp cả hai nút, kể cả Huỷ bọc DialogClose asChild)
- Hiện 160ms cubic-bezier(0.19, 1, 0.22, 1) từ opacity 0, translateY(4px) scale(.98) (`ui-dialog-len`; DS dùng transition + @starting-style), giảm chuyển động → không: đo sau khi đã hiện xong (cho 250ms), không đo khung hình giữa chừng
- Cuộn khi hộp cao hơn khung nhìn (max-height 100dvh − 32, overflow-y auto): nội dung preview ngắn, không đo
- Focus khi mở vào nút an toàn Huỷ, Tab/Shift+Tab vòng trong hộp, Esc / ✕ / bấm overlay đóng + trả focus về trigger, aria-labelledby/aria-describedby, overlay + hộp trong ô portal của vùng DS: test jsdom components/ui/dialog.dom.test.tsx, không đo ở đây
- Đang xoá (Xoá đơn có spinner, Huỷ khoá, 1,2 giây sau đóng) và lỗi server trong hộp (Alert danger, không đóng): preview chỉ có spinner sau khi bấm — không đo; khoá khi đang chạy + lỗi trong hộp thuộc ConfirmDialog (Task 9)
- Ô "Lý do xoá": Input DS — lát 3. Khối demo dùng <label>/<input> gốc mang giá trị `.ui-label`/`.ui-input` — không khoá so khớp (chỉ đo thân `.ui-dialog-body.ui-field`: cột, gap 6)
- Icon ✕: preview vẽ tay bằng nét (path M18 6 6 18M6 6l12 12), DS dùng Phosphor X regular (path tô) — chỉ đo hộp + màu; hình nét so bằng mắt
- Nút Huỷ / Xoá đơn / ✕ ở trạng thái hover/focus/active: đã đo ở so-khop Button

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| overlay | height | 328px | 900px | sang 1440, sang 390, toi 1440, toi 390 | Preview: `.ui-overlay` absolute inset 0 trong khung #stage cao 328px (khung minh hoạ, preview.html dòng 2). DS: phủ kín khung nhìn (fixed inset 0, như `dialog.ui-dialog::backdrop`) → cao 900 = khung nhìn đo. Rộng khớp vì #stage tràn hết bề ngang (margin −16 bù padding body). |
| overlay | zIndex | auto | 70 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ hộp tĩnh trong khung #stage (position relative/absolute, không z-index → auto). Hộp THẬT của artifact là `<dialog class="ui-dialog">.showModal()` (bundle.css khối ConfirmDialog) → top layer, trên mọi lớp trang (cao nhất bundle.css 60). DS dùng Radix Portal (không top layer) → z-70 cho overlay + hộp: trên mọi lớp trang, dưới tooltip (80) và menu (90) — hai thứ mở được bên trong hộp. Ghi ở dialog-styles.ts. |
| panel | zIndex | auto | 70 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ hộp tĩnh trong khung #stage (position relative/absolute, không z-index → auto). Hộp THẬT của artifact là `<dialog class="ui-dialog">.showModal()` (bundle.css khối ConfirmDialog) → top layer, trên mọi lớp trang (cao nhất bundle.css 60). DS dùng Radix Portal (không top layer) → z-70 cho overlay + hộp: trên mọi lớp trang, dưới tooltip (80) và menu (90) — hai thứ mở được bên trong hộp. Ghi ở dialog-styles.ts. |
