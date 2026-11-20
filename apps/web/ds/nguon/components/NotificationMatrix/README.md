Ma trận cấu hình thông báo ở màn Quản trị: hàng = loại thông báo gom theo khu, cột = kênh nhận. **Mới 19/11/2026** — CEO chốt cột **Trong app** (chuông) cạnh Discord.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Bảng | `Table` + `ui-notif-matrix` | cột kênh căn giữa |
| Nhóm khu | `th scope="rowgroup"` | cao `control-size-md`, nền `muted`, 12/18 600 `muted-foreground`; tên khu dính trái khi cuộn ngang |
| Tên loại | `th scope="row"` | 14/20 400, rộng tối thiểu 180px, xuống dòng được; dòng phụ "Gửi cho: …" `ui-notif-matrix-gui` 12/18 `muted-foreground` |
| Ô | `Checkbox` | căn giữa theo hàng; tên đọc = cột + loại (`aria-labelledby`), "Gửi cho" qua `aria-describedby` |
| Kênh Discord | `Checkbox` + `Select` rộng 120px | Select tắt khi bỏ tick |
| Không áp dụng | `ui-notif-matrix-na` | "—" `color-text-tertiary` + chữ ẩn "Không áp dụng" |
| Hẹp | | cột tên **ghim trái** (sticky, nền đặc, kẻ phải `border`), bảng cuộn ngang trong khung |
| Hover | | một lớp nền cho cả hàng, kể cả ô ghim |

**Hành vi:** bấm là lưu (không nút Lưu), dòng `role="status"` báo "Đã lưu: …". Tắt cột Trong app → loại đó không vào chuông. Tên kênh hiện là minh hoạ (câu hỏi mở: kênh nào nhận loại nào).
**a11y:** `<caption>` ẩn; tiêu đề cột/hàng/nhóm đúng `scope`.
**Code:** shadcn `Table` + `Checkbox` + `Select`.
⚠️ **Bẫy DS đã sửa:** `.ui-table-wrap` có `position: relative` — không thì chữ ẩn (`ui-sr-only`, absolute) trong bảng cuộn ngang thoát khung và kéo giãn cả trang ở 390px.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp#thongbao` và `#cauhinh` (`khung/_proto/ThongBao.tsx`, `khung/_proto/MaTranThongBao.tsx`); CSS ở khối `BỔ SUNG DS THÔNG BÁO` cuối `khung/_proto/ui.css`.
