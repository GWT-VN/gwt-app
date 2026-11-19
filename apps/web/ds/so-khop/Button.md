# So khớp Button — artifact ↔ /ds

Sinh bởi `node ds/so-khop.mjs Button --url http://127.0.0.1:3401` (cwd `apps/web`; mặc định `--url http://localhost:3401`, máy
Windows này Chrome không phân giải `localhost` nên chạy với `127.0.0.1`). Không sửa tay.

- Artifact: `ds/nguon/tokens.css` + `bundle.css` + `components/Button/preview.html` (xem `ds/NGUON.md`) ↔ `/ds`.
- Theme sáng/tối × khổ 1440/390 (CDP `Emulation.setDeviceMetricsOverride`). Px làm tròn 0.5, màu chuẩn hoá rgb().
- Trạng thái: artifact ép class `.is-hover`/`.is-focus` (như preview); DS di chuột thật (`Input.dispatchMouseEvent`) / phím Tab thật.
- Font: trang artifact nạp đúng Inter của /ds và đặt `--font-sans` = `Inter, "Inter Fallback", ui-sans-serif, -apple-system, system-ui, "Segoe UI", "Noto Sans", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` (nguồn khai font hệ thống; bỏ `@import` Google Fonts vô tác dụng).
- Ảnh: `ds/so-khop/anh/Button-{sang,toi}-{1440,390}-{artifact,ds}.png` (gitignore).

**1596/1596 khớp** · 0 lệch có lý do · 0 lệch chưa có lý do

Không có dòng lệch.
