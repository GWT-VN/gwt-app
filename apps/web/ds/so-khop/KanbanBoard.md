# So khớp KanbanBoard — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs KanbanBoard --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/KanbanBoard/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (the: hover); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): the-focus (cả artifact): cho 1500 → tab {"artifact":".b-k-cot:nth-child(1) .b-the:nth-child(1)","ds":"#kanban-board [data-the-id=\"TK-2611-045\"]"}. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: không. Pseudo: không khoá nào.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/KanbanBoard-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**3044/3064 khớp** · 20 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 7 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Kéo THẬT (chuột nhích 4px; bàn phím Space nhấc · ←→ sang cột · Space/Enter thả · Esc/Tab huỷ; câu đọc tiếng Việt; thẻ nguồn mờ 40%, cột đích nền alpha-05 + viền trong alpha-10, bóng kéo shadow-200 z 90): preview tĩnh không có trạng thái kéo — hành vi đo bằng test jsdom components/ui/kanban-board.dom.test.tsx, giao diện bằng ảnh tự kiểm /ds#kanban-board (kéo chuột thật + phím thật trên Chrome)
- Hộp hỏi lý do khi thả vào Chờ (Dialog + Select, focus Huỷ, thiếu lý do báo lỗi): preview không có — test jsdom + ảnh; giao diện hộp/ô đo ở so-khop Dialog, Select
- Menu chuột phải "Chuyển sang…" (ContextMenu): preview không có — test jsdom + ảnh; giao diện menu đo ở so-khop ContextMenu. Thẻ đang mở menu (vòng alpha-15 = `.b-the[data-cp]`) so bằng ảnh
- Toast Hoàn tác / lỗi Thử lại: test jsdom (gọi thongBao đúng câu); giao diện đo ở so-khop Toast
- Rỗng do lọc cả màn (EmptyState): preview không có — ảnh /ds#kanban-board; đo ở so-khop EmptyState
- Số thẻ đầu cột: preview gõ số giả (4, 6, 7, 2, 0) khác số thẻ đang hiện; DS đếm thật — chỉ so kiểu chữ (một chữ số, tabular-nums cùng bề ngang)
- Khoá `trang`: chỉ đo width, height, paddingTop, paddingRight, paddingBottom, paddingLeft (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| the-khach | khach.width | 187.5px | 230px | sang 1440, toi 1440 | Tên khách demo dài hơn preview (R11: "Khách sạn Demo Sen Vàng" thay "Khách sạn Sen Vàng"). Preview `.b-khach` inline-flex không trần rộng → tên dài tràn khỏi thẻ, cờ ↻ bị danh sách cuộn cắt (thấy ở ảnh tự kiểm); DS thêm trần 100% bề ngang thẻ → tên cắt …, cờ lưu ý/hỏi lại luôn thấy. Đề xuất đồng bộ ngược `max-width: 100%` cho `.b-khach` trong thẻ. |
| the-focus | outlineColor | rgb(16 16 16) | rgb(1 105 204) | sang 1440, sang 390 | Preview không khai vòng focus cho thẻ (`.b-the` không có :focus-visible) → vòng mặc định trình duyệt (auto 1px). DS: vòng 2px `ring` như mọi phần tử focus được, nằm TRONG mép thẻ (offset −2) vì danh sách cuộn dọc `.b-k-ds` cắt phần tràn ra ngoài thẻ đầu/cuối. |
| the-focus | outlineStyle | auto | solid | sang 1440, sang 390, toi 1440, toi 390 | Preview không khai vòng focus cho thẻ (`.b-the` không có :focus-visible) → vòng mặc định trình duyệt (auto 1px). DS: vòng 2px `ring` như mọi phần tử focus được, nằm TRONG mép thẻ (offset −2) vì danh sách cuộn dọc `.b-k-ds` cắt phần tràn ra ngoài thẻ đầu/cuối. |
| the-focus | outlineWidth | 1px | 2px | sang 1440, sang 390, toi 1440, toi 390 | Preview không khai vòng focus cho thẻ (`.b-the` không có :focus-visible) → vòng mặc định trình duyệt (auto 1px). DS: vòng 2px `ring` như mọi phần tử focus được, nằm TRONG mép thẻ (offset −2) vì danh sách cuộn dọc `.b-k-ds` cắt phần tràn ra ngoài thẻ đầu/cuối. |
| the-focus | outlineOffset | 0px | -2px | sang 1440, sang 390, toi 1440, toi 390 | Preview không khai vòng focus cho thẻ (`.b-the` không có :focus-visible) → vòng mặc định trình duyệt (auto 1px). DS: vòng 2px `ring` như mọi phần tử focus được, nằm TRONG mép thẻ (offset −2) vì danh sách cuộn dọc `.b-k-ds` cắt phần tràn ra ngoài thẻ đầu/cuối. |
| the-khach | khach.width | 187.5px | 230.5px | sang 390, toi 390 | Tên khách demo dài hơn preview (R11: "Khách sạn Demo Sen Vàng" thay "Khách sạn Sen Vàng"). Preview `.b-khach` inline-flex không trần rộng → tên dài tràn khỏi thẻ, cờ ↻ bị danh sách cuộn cắt (thấy ở ảnh tự kiểm); DS thêm trần 100% bề ngang thẻ → tên cắt …, cờ lưu ý/hỏi lại luôn thấy. Đề xuất đồng bộ ngược `max-width: 100%` cho `.b-khach` trong thẻ. |
| the-focus | outlineColor | rgb(16 16 16) | rgb(2 133 255) | toi 1440, toi 390 | Preview không khai vòng focus cho thẻ (`.b-the` không có :focus-visible) → vòng mặc định trình duyệt (auto 1px). DS: vòng 2px `ring` như mọi phần tử focus được, nằm TRONG mép thẻ (offset −2) vì danh sách cuộn dọc `.b-k-ds` cắt phần tràn ra ngoài thẻ đầu/cuối. |
