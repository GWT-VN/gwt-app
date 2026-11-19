# So khớp Sheet — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Sheet --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Sheet/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 29 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): overlay: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · panel: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · header: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · title: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · desc: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · close: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · body: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · truong: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · footer: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · xoa-loc: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100 · ap-dung: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: bam #sheet [data-so="mo"] → cho 300 → tro [data-ds-portal] [data-slot="sheet-title"] → cho 100. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"Inter", "Inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Sheet-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1254/1288 khớp** · 34 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 9 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Vị trí: preview vẽ sheet tĩnh bám mép phải khung 408px; DS bám mép phải KHUNG NHÌN (fixed, top/right/bottom 0). Không đo left/top; so vị trí bằng mắt trên ảnh
- Viền DƯỚI header (1px --border): bộ đo chỉ có borderTop* → đo tay bằng getComputedStyle (borderBottom 1px solid, trên 0 none) — ghi trong task-10-report; viền TRÊN footer đã đo ở khoá footer
- Cuộn thân khi nội dung dài hơn khung (flex 1, overflow-y auto) trong khi header/footer đứng yên: nội dung preview ngắn, không đo; khung cột + lớp cuộn chứng minh bằng test jsdom components/ui/sheet.dom.test.tsx
- Chuyển động: bundle.css KHÔNG định nghĩa animation cho `.ui-sheet` (Dialog có `ui-dialog-len`, Sheet không) → DS không trượt vào. Muốn trượt = quyết định mới (thêm vào artifact trước)
- Esc / ✕ / bấm overlay đóng + trả focus về trigger, Tab không rời sheet, ✕ đứng ngay sau header trong DOM như preview, role dialog + aria-labelledby/describedby, overlay + panel trong ô portal vùng DS: test jsdom components/ui/sheet.dom.test.tsx, không đo ở đây
- Chỉ cạnh PHẢI: artifact chỉ định nghĩa `.ui-sheet` phải; trái/trên/dưới chưa dựng
- Ô "Kênh bán" (select), hai ô ngày, ba checkbox: Select/Input/Checkbox DS — lát 3. Khối demo dùng control GỐC mang giá trị `.ui-select-trigger`/`.ui-input`/`.ui-checkbox` — không khoá so khớp (chỉ đo khung `.ui-field` đầu: cột, gap 6). Preview dùng `<button class="ui-select-trigger">`, demo dùng `<select>` gốc
- Icon ✕: preview vẽ tay bằng nét, DS dùng Phosphor X regular — chỉ đo hộp + màu; hình nét so bằng mắt
- Nút Xoá lọc / Áp dụng / ✕ ở trạng thái hover/focus/active: đã đo ở so khớp Button

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| overlay | height | 408px | 900px | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ sheet TĨNH trong khung minh hoạ cao 408px (preview.html dòng 2: `position:relative;height:408px`, `.ui-overlay`/`.ui-sheet` absolute bám khung đó). DS bám KHUNG NHÌN (fixed, top 0 → bottom 0) → cao 900 = khung nhìn đo. README artifact: sheet cao hết màn. |
| overlay | zIndex | auto | 70 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ sheet tĩnh (position absolute, không z-index → auto). Sheet thật là hộp modal như Dialog (artifact: top layer của `<dialog>`, trên mọi lớp trang). DS dùng Radix Portal → z-70 cho overlay + panel theo thang z một chỗ ở ds/NGUON.md (dialog/overlay 70: trên mọi lớp trang, dưới tooltip 80 / menu 90). |
| panel | height | 408px | 900px | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ sheet TĨNH trong khung minh hoạ cao 408px (preview.html dòng 2: `position:relative;height:408px`, `.ui-overlay`/`.ui-sheet` absolute bám khung đó). DS bám KHUNG NHÌN (fixed, top 0 → bottom 0) → cao 900 = khung nhìn đo. README artifact: sheet cao hết màn. |
| panel | zIndex | auto | 70 | sang 1440, sang 390, toi 1440, toi 390 | Preview vẽ sheet tĩnh (position absolute, không z-index → auto). Sheet thật là hộp modal như Dialog (artifact: top layer của `<dialog>`, trên mọi lớp trang). DS dùng Radix Portal → z-70 cho overlay + panel theo thang z một chỗ ở ds/NGUON.md (dialog/overlay 70: trên mọi lớp trang, dưới tooltip 80 / menu 90). |
| body | height | 260px | 752px | sang 1440, sang 390, toi 1440, toi 390 | Hệ quả của `panel` height: thân `flex: 1` lấp phần còn lại giữa header và footer — preview 408 − header − footer = 260, DS 900 − header − footer = 752. Header/footer cao khớp (đo ở khoá header/footer). |
| panel | width | 384px | 390px | sang 390, toi 390 | ≤640 DS rộng 100% (README artifact "mobile 100%", Review Focus #5 kế hoạch lát 2; mốc `@media (max-width: 640px)` như Dialog). bundle `.ui-sheet` chỉ có `width: min(384px, 100%)` → ở khung 390 preview ra 384 (hở 6px overlay bên trái). Lệch có chủ đích: lấy README/kế hoạch, không lấy số 384 ở khổ 390. |
| header | width | 384px | 390px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
| title | width | 312px | 318px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
| desc | width | 312px | 318px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
| body | width | 384px | 390px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
| truong | width | 344px | 350px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
| footer | width | 384px | 390px | sang 390, toi 390 | Hệ quả của `panel` width@390 (DS 390, preview 384): cùng padding/công thức, ruột rộng hơn đúng 6px. |
