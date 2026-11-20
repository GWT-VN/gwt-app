Tải tệp/ảnh lên — **mới 18/11/2026**. Vùng thả là `<label>` bọc `<input type="file">` thật; danh sách tệp mỗi dòng một tệp.

**Dùng khi** đính kèm biên bản, ảnh hiện trường, chứng từ. Chỉ 1 ảnh đại diện → vẫn dùng, giới hạn `multiple=false`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Vùng thả | `alpha-25` nét đứt | padding 20/16, `radius-lg`; icon `UploadSimple` 20px `muted-foreground`; tiêu đề 14/20 500 "Kéo thả tệp hoặc <u>chọn từ máy</u>"; dòng gợi ý `ui-help` nêu loại + dung lượng tối đa |
| Hover | `alpha-02` nền, viền `alpha-35` | |
| Đang kéo vào | `ring` viền liền + nền `color-background-info-soft-alpha` | tiêu đề đổi "Thả tệp vào đây" |
| Focus (phím) | `ring` | outline 2px quanh cả vùng |
| Tắt | viền `alpha-15`, chữ `color-text-disabled` | |
| Dòng tệp | `alpha-08` viền | lưới [ô 32 · tên · nút bỏ], padding 8, `radius-lg`, gap 12 |
| Ô xem trước | `muted` | 32×32 `radius-md`; ảnh → thumbnail `object-fit: cover`; khác → icon `FileText` |
| Tên / phụ | | tên 14/20 cắt `…`; phụ 12/18 `color-text-tertiary` "2,3 MB · đang tải 60%" |
| Tiến độ | `alpha-08` rãnh, `color-background-primary-solid` thanh | cao 4px, `radius-full`, `role="progressbar"` |
| Lỗi | viền `red-500`, chữ phụ `color-text-danger` | nói cách sửa: "Quá 10 MB — nén lại hoặc chọn tệp khác" |
| Bỏ tệp | `Button ghost icon-sm` + `Tooltip` | `aria-label="Bỏ <tên tệp>"` |

**Hành vi:** kiểm loại + dung lượng **trước khi tải** (báo lỗi ngay trên dòng, không tải); tải song song, mỗi dòng tự có tiến độ; lỗi mạng → dòng lỗi + nút "Thử lại". Ảnh lớn nên nén ở trình duyệt trước khi tải (xem `components/AnhViec.tsx` đang nhận ảnh/video).

**Bàn phím & a11y:** Tab vào input file (ẩn nhìn, không ẩn khỏi phím) → Enter/Space mở hộp chọn; vùng thả hiện outline. Danh sách là `<ul aria-label="Tệp đã chọn">`.

**Code:** không cần thư viện — drag events gốc + `<input type="file" multiple accept>`; tải lên Supabase Storage. Chỉ thêm `react-dropzone` nếu cần dán ảnh từ clipboard/thư mục.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
