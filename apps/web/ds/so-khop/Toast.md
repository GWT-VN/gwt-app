# So khớp Toast — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Toast --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Toast/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): lop: bam #toast [data-so="xong"] → cho 500 · xong: bam #toast [data-so="xong"] → cho 500 · loi: bam #toast [data-so="loi"] → cho 500 · chay: bam #toast [data-so="chay"] → cho 300. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #toast [data-so="loi"] → cho 500. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Toast-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**562/588 khớp** · 26 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 9 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí: preview vẽ 3 toast TĨNH (`position:static; margin:0`) xếp dọc; DS hiện toast thật — fixed đáy giữa, cách đáy 72 ở cả 1440 và 390, cách mép 16. Không đo left/top ở đây; đo bằng script tự kiểm (getBoundingClientRect: đáy viên thuốc = cao khung − 72, tâm = tâm khung) và ảnh
- Lớp z khi Dialog đang mở: toast (56) nằm DƯỚI overlay/hộp (70) — đo bằng elementFromPoint tại tâm toast trong script tự kiểm, không đo được bằng một khoá
- Chuyển động: nguồn `ui-toast-len` 180ms translateY(8px); DS dùng transition của Sonner ghi đè còn 180ms cubic-bezier(0.19, 1, 0.22, 1) + `--y` 8px; giảm chuyển động → Sonner `transition:none!important` + DS `motion-reduce`. Đo sau khi hiện xong (cho 500ms), không đo khung hình giữa chừng; giảm chuyển động kiểm bằng script (CDP emulate prefers-reduced-motion) + test jsdom
- Tự tắt 5 giây (thành công), lỗi không tự tắt, Hoàn tác/Thử lại đóng toast, đổi đang chạy → xong cùng id, đọc màn hình (R12: xong/đang chạy KHÔNG role riêng — đọc qua `section aria-live=polite` của Sonner; lỗi `role=alert`), progressbar aria-valuenow, focus phím dừng hẹn giờ + trả focus khi gỡ: test jsdom components/ui/toast.dom.test.tsx
- Nhiều toast chồng nhau (Sonner: tối đa 3, rê chuột thì xoè): preview không có — không đo
- Hover/focus nút Hoàn tác/Thử lại/✕: nguồn không khai trạng thái (không hover, focus mặc định trình duyệt); DS thêm vòng focus `ring` — không đo
- Thanh thao tác hàng loạt đang hiện (nguồn `.b-hangloat ~ .ui-toast` đẩy toast lên 124 / ≤767 lên 236): DS dùng `:has(.ds-thanh-hang-loat)` trên gốc vùng DS (toast-styles.ts `toasterLop`). Preview Toast không có thanh — đo bằng script Chrome trên /ds#bulk-action-bar (getBoundingClientRect: đáy toast 124 @1440 / 236 @390, không chồng thanh; bỏ chọn → 72)
- Bề ngang phần chạy của thanh tiến độ (`--p`): khối DS chạy 20 → 100% theo thời gian, chỉ đo cao/màu/bo của phần chạy
- Khoá `lop`: chỉ đo zIndex (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| xong | zIndex | 56 | auto | sang 1440, sang 390, toi 1440, toi 390 | Nguồn: một phần tử `.ui-toast` vừa là viên thuốc vừa là lớp fixed z 56. DS: lớp fixed là toaster của Sonner (`[data-sonner-toaster]`, khoá `lop` = 56), viên thuốc nằm trong nên z auto. |
| loi | zIndex | 56 | auto | sang 1440, sang 390, toi 1440, toi 390 | Nguồn: một phần tử `.ui-toast` vừa là viên thuốc vừa là lớp fixed z 56. DS: lớp fixed là toaster của Sonner (`[data-sonner-toaster]`, khoá `lop` = 56), viên thuốc nằm trong nên z auto. |
| chay | zIndex | 56 | auto | sang 1440, sang 390, toi 1440, toi 390 | Nguồn: một phần tử `.ui-toast` vừa là viên thuốc vừa là lớp fixed z 56. DS: lớp fixed là toaster của Sonner (`[data-sonner-toaster]`, khoá `lop` = 56), viên thuốc nằm trong nên z auto. |
| loi | width | 326px | 351px | sang 390, toi 390 | Preview vẽ toast TĨNH trong cột 326px (padding trang 16 + khung ds-tinh) nên chữ xuống dòng sớm; toast thật của nguồn là fixed `max-width: calc(100% − 32px)` = 358 ở 390. DS là toast thật: rộng theo nội dung tới 358. |
| loi | height | 56px | 42px | sang 390, toi 390 | Cùng lý do bề ngang: preview 326px làm chữ xuống 2 dòng (56); DS rộng 351 ≤ 358 nên một dòng (42) — đúng như toast fixed thật của nguồn ở 390. |
| loi | icon.width | 12.5px | 14px | sang 390, toi 390 | Preview co icon còn 12.5 vì chữ xuống dòng trong cột 326 và `.ui-toast svg` không có flex-shrink 0 (icon méo); DS giữ 14 (`shrink-0`) — icon không bao giờ bị bóp. |
| loi | nut.width | 56px | 59.5px | sang 390, toi 390 | Preview bóp nút Thử lại còn 56 trong cột 326 (nút không flex-shrink 0, chữ nút bị cắt sát); DS giữ đủ 59.5 (`shrink-0`). |
| loi | dong.width | 23.5px | 26px | sang 390, toi 390 | Preview bóp nút ✕ còn 23.5 trong cột 326 (không còn vuông 26); DS giữ 26 vuông như `.ui-toast-x` (`shrink-0`). |
| chay | width | 326px | 358px | sang 390, toi 390 | Preview vẽ toast TĨNH trong cột 326px (padding trang 16 + khung ds-tinh) nên chữ xuống dòng sớm; toast thật của nguồn là fixed `max-width: calc(100% − 32px)` = 358 ở 390. DS là toast thật: rộng theo nội dung tới 358. |
| chay | tienDo.width | 58.5px | 72px | sang 390, toi 390 | Preview bóp thanh tiến độ còn 58.5 trong cột 326 (`.ui-progress` không flex-shrink 0); DS giữ 72 như nguồn khai (`shrink-0`), chữ xuống dòng thay vào đó. |
