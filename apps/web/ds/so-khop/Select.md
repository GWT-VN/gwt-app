# So khớp Select — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Select --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Select/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (placeholder: hover/focus · loi: hover/focus · tat: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): trigger-mo: bam #select [data-so="kenh"] → cho 200 · hover: tro #select [data-so="hover"] → cho 200 · content: bam #select [data-so="kenh"] → cho 200 · item: bam #select [data-so="kenh"] → cho 200 · item-chon: bam #select [data-so="kenh"] → cho 200 · item-tat: bam #select [data-so="kenh"] → cho 200. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #select [data-so="kenh"] → cho 200. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"Inter", "Inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Select-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2330/2348 khớp** · 18 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 6 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí nội dung (cách trigger 4px, căn mép trái, Radix Popper tự lật/dời khi sát mép khung nhìn, chừa mép 8) — preview xếp menu tĩnh trong .ui-stack gap 8; không đo bằng getComputedStyle, so bằng mắt trên ảnh
- Menu mở sẵn như preview: Select modal (mở sẵn khoá cả trang /ds) → mỗi khoá nội dung bấm trigger thật trên trang nạp lại
- Hình icon: preview vẽ tay chevron/✓ bằng nét, DS dùng Phosphor CaretDown/Check (path tô) — chỉ đo hộp + màu; hình so bằng mắt
- Mục disabled theo Radix Select (↑/↓ bỏ qua, không chọn được) — khác menu lát 2 (APG cho focus mục chặn); mở bằng Enter/Space/↓, Enter chọn, Esc đóng + focus về trigger, Esc trong Dialog chỉ đóng Select, ✓ ở mục đang chọn, content trong vùng DS: test jsdom components/ui/select.dom.test.tsx
- Trigger đang mở mà vẫn lỗi: preview không có; DS cho lỗi thắng (y thứ tự rule bundle.css)
- Theme tối, rê chuột lên trigger ĐANG mở: bundle.css ra alpha-30 (rule hover tối đặc hiệu cao hơn), DS giữ alpha-50 — Radix Select mở là chặn chuột ngoài nội dung nên không xảy ra

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| luoi | height | 208px | 206px | sang 1440, toi 1440 | Preview vẽ menu mở TĨNH ngay dưới nút trong cột 1 (.ui-stack: nhãn 20 + 8 + nút 32 + 8 + menu 140 = 208); DS chỉ mở menu khi bấm (Select modal, nổi trong portal) nên cột 1 còn nhãn + nút 60. Lưới cao theo cột cao nhất: artifact 208 (cột 1), DS 206 (cột 2 — khớp cột 2 của artifact). |
| nhan | cursor | auto | default | sang 1440, sang 390, toi 1440, toi 390 | Preview đặt nhãn là <span class="ui-label"> (nút gắn tên qua aria-labelledby); DS dùng FieldLabel = <label htmlFor> (bấm nhãn focus nút, chuẩn shadcn) → con trỏ mặc định của <label> trong UA stylesheet Chrome là default, span là auto. Hình như nhau (mũi tên). |
| content | zIndex | auto | 90 | sang 1440, sang 390, toi 1440, toi 390 | Preview Select vẽ `.ui-menu` tĩnh trong .ui-stack, không có lớp nổi → z-index auto. Menu nổi THẬT của artifact là `.b-noi` (bundle.css dòng 731, position fixed, z-index 90); DS dùng z-90 chung của menuContent (thang z ds/NGUON.md) — như khoá khung của so khớp DropdownMenu. |
| content | flexDirection | row | column | sang 1440, sang 390, toi 1440, toi 390 | Radix Select Content tự gắn style inline display flex + flex-direction column (để Viewport bên trong giãn và cuộn); `.ui-menu` của preview là block → giá trị mặc định row. Một con duy nhất (Viewport) giãn hết bề ngang ở cả hai cách → bố cục mục như nhau (width/height/padding của content và item đều khớp). |
| luoi | height | 430px | 282px | sang 390, toi 390 | Preview vẽ menu mở TĨNH ngay dưới nút trong cột 1 (.ui-stack: nhãn 20 + 8 + nút 32 + 8 + menu 140 = 208); DS chỉ mở menu khi bấm (Select modal, nổi trong portal) nên cột 1 còn nhãn + nút 60. Khổ 390 hai cột xếp chồng: artifact 208 + 16 + 206 = 430, DS 60 + 16 + 206 = 282. |
| tat | hover.boxShadow | rgb(255 255 255 / 0.302) 0px 0px 0px 1px inset | rgb(255 255 255 / 0.059) 0px 0px 0px 1px inset | toi 1440, toi 390 | Lỗi đặc hiệu của nguồn (như khoá tat của so khớp Input): rule hover theme tối của bundle.css (data-theme tối + .ui-select-trigger:hover, đặc hiệu 0,3,0) thắng .ui-select-trigger:disabled (0,2,0) → trigger TẮT vẫn đậm viền alpha-30 khi rê ở theme tối, theme sáng thì không. DS giữ viền tắt color-border-disabled ở cả hai theme (controlOutline) — đề xuất đồng bộ ngược artifact. |
