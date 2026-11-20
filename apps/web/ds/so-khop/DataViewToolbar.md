# So khớp DataViewToolbar — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs DataViewToolbar --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/DataViewToolbar/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Đo 32 thuộc tính/phần tử: width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, gap, borderRadius, borderTopWidth, borderTopStyle, borderTopColor, borderBottomWidth, borderBottomStyle, borderBottomColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color, backgroundColor, boxShadow, opacity, cursor, outlineColor, outlineStyle, outlineWidth, outlineOffset, zIndex, flexDirection.
- **Giới hạn:** px làm tròn 0.5 → lệch < 0.25px không thấy được. Màu chuẩn hoá về sRGB số thực (kênh 2 số lẻ, alpha 3 số lẻ).
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` như preview, trừ khoá có `artifactThat` thì artifact cũng tương tác thật (không khoá nào); DS di chuột thật (`Input.dispatchMouseEvent`, kiểm `:hover`) / phím Tab thật (kiểm `:focus-visible`).
- Mở bằng tương tác thật (`buoc`, CDP `Input.*`, mỗi khoá trên trang nạp lại mới): tip: cho 1500 → tro #data-view-toolbar [data-so="muc-congcu"] button[aria-label="Cài đặt hiển thị"] → cho 700 · caiDat: cho 1500 → bam #data-view-toolbar [data-so="muc-congcu"] button[aria-label="Cài đặt hiển thị"] → cho 400 · trangCon: cho 1500 → bam #data-view-toolbar [data-so="muc-congcu"] button[aria-label="Cài đặt hiển thị"] → cho 400 → bam [data-ds-portal] [data-slot="cai-dat-hien-thi"] [data-trang="cot"] → cho 300. Vùng `[data-ds="v2"]`: luôn kiểm cho mọi phần tử DS. Ảnh mở bằng `anhTuongTac.buoc`: cho 1500 → bam #data-view-toolbar [data-so="muc-congcu"] button[aria-label="Cài đặt hiển thị"] → cho 400. Pseudo: tip {"artifact":"::after"}.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = token `--font-sans` của gốc `[data-ds]` trên /ds = `"inter", "inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/DataViewToolbar-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**2752/2780 khớp** · 28 lệch có lý do · 0 lệch chưa có lý do · 0 thiếu phần tử · 0 ngoài vùng DS · 0 lyDo thừa · 14 mục CHƯA ĐO

**Chưa đo** (khớp ở trên KHÔNG nói gì về các mục này — `chuaDo` trong config):

- Hai menu tĩnh của preview (trang gốc + trang con "Cột hiển thị") hiện cùng lúc; DS là Popover mở bằng bấm ⚙ thật (mỗi khoá một lần mở) → ảnh DS chỉ có trang gốc đang mở
- Ô tìm là `OTimKiem` của bang/ (giao diện DS qua CauHinhBangDs): không có type search, không có aria-label riêng (tên đọc lấy từ placeholder) — bang/ thuộc Task 6
- Chữ tooltip DS khác preview (preview lặp aria-label "Cài đặt hiển thị"; luật NGUON: tooltip là mô tả thêm) → bề rộng tooltip không so
- Vị trí menu ⚙ (neo mép phải nút, cách 4) và sheet đáy ≤ 767 (cách mép 8, trần 70vh, z 60): Radix Popper đặt toạ độ, getComputedStyle không đo vị trí — xem ảnh 390 + báo cáo Task 8
- Mục trong ⚙ khi rê / focus phím, mục chọn một (Bố cục, Nhóm theo, Sắp xếp) và các trang con Lọc / Sắp xếp / Nhóm theo / Bố cục: preview không vẽ — hành vi ở test jsdom components/ui/data-view.dom.test.tsx
- Trang con có ← + focus về mục đã mở, Sắp xếp chỉ cột kieu "sap", đổi dạng xem giữ tab, xem nhanh aria-pressed mặc định tắt: test jsdom components/ui/data-view.dom.test.tsx
- Khung xem nhanh (XemNhanh, `.b-chitiet`): preview DataViewToolbar không vẽ — chỉ ở /ds (hàng "Thẻ xem nhanh") và ảnh tự kiểm
- Nút icon ghost (thường / rê / đang bật): đã đo ở so-khop Button; ở đây đo nút ở trạng thái tĩnh
- Khoá `timIcon`: chỉ đo width, height, color (lọc trong config).
- Khoá `cai`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `xemThuong`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `xemChon`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `xemNhanh`: bỏ thuộc tính chữ (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeatureSettings, textDecorationLine, color) và màu viền/outline khi kiểu none — phần tử không vẽ chữ (lọc trong config).
- Khoá `tip`: chỉ đo height, paddingTop, paddingRight, paddingBottom, paddingLeft, borderRadius, fontFamily, fontSize, fontWeight, lineHeight, color, backgroundColor, zIndex (lọc trong config).

| khoá | thuộc tính | artifact | ds | ở | lý do |
|---|---|---|---|---|---|
| dem | width | 99px | 102.5px | sang 1440, sang 390, toi 1440, toi 390 | Luật DS (kế hoạch lát 4–6, Global Constraints): số đếm tabular-nums — chữ số "19 / 22" đều bề ngang nên rộng hơn 3.5px; `.ui-caption` của preview để chữ số tỷ lệ. |
| timO | paddingRight | 12px | 36px | sang 1440, sang 390, toi 1440, toi 390 | Ô tìm thật là `OTimKiem` của bang/ (GIAO_DIEN_DS `oTimKiem_input`): chừa 36px bên phải cho nút × "Xoá từ khoá" hiện khi có chữ — preview là ô trần không có nút xoá. |
| trangCon | height | 462px | 422px | sang 1440, toi 1440 | Preview vẽ menu tĩnh (`.ds-tinh .b-caidat { max-height: none }`) → cao đủ 12 cột (462). DS là pop nổi thật: trần thêm theo chỗ trống dưới nút (`--radix-popover-content-available-height`, luật NGUON) — khung nhìn 900, nút ở giữa trang → còn 422, cuộn bên trong. Không trần thì đáy menu tràn khỏi màn (đo ảnh tự kiểm). |
| caiDat | width | 206.5px | 374px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| caiDat | tieuDe.width | 194.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| caiDat | muc.width | 194.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| caiDat | ngan.width | 206.5px | 374px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| trangCon | width | 236.5px | 374px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| trangCon | dau.width | 224.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| trangCon | nhan.width | 224.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| trangCon | muc.width | 224.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
| trangCon | mucKhoa.width | 224.5px | 362px | sang 390, toi 390 | Preview vẽ menu TĨNH trong `.ds-hang` (`.ds-tinh .b-noi { position: static }`) → ô flex co theo nội dung. Menu thật ≤ 767 của nguồn là sheet đáy `.b-caidat.b-noi-phai { position: fixed; left: 8px; right: 8px }` = 390 − 16 = 374 — DS đúng số đó (Popover neo vào dải đáy cách mép 8). |
