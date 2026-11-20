Khung form dùng chung — **mới 18/11/2026**. Ghép `Field` (Label/Help/Error của `Input`), `Select`, `DatePicker`, `InputAffix`, `Radio`, `Checkbox`, `Textarea`, `FileUpload`, `Switch`. Màn đặc thù (tạo ticket, phiếu chi…) chỉ việc sắp field theo spec nghiệp vụ.

| Phần | Class | Giá trị |
| --- | --- | --- |
| Form | `ui-form` | cột, khối cách nhau 24px |
| Khối | `ui-form-section` + `ui-form-title` (`heading-xs` 16/24 600) + `ui-form-desc` (14/20 `muted-foreground`) | trong khối gap 16px; khối sau có kẻ trên `alpha-08` |
| Lưới | `ui-form-grid` | 2 cột, gap 16 dọc / 20 ngang; `data-span="full"` cho ô dài (ghi chú, đính kèm); **≤ 640px → 1 cột** |
| Field | `ui-field` | nhãn → ô → gợi ý/lỗi, gap 6px |
| Đếm ký tự | `ui-field-meta` | gợi ý trái, "0/500" phải `tabular-nums` |
| Chân | `ui-form-footer` | kẻ trên `alpha-08`, nút phải: Huỷ (`outline`) · Lưu (chính); trạng thái trái (`ui-caption`) |

**Luật form (chuẩn ngành):**
- Bắt buộc đánh `*` (đỏ, `aria-hidden`) + `required`/`aria-required`; ghi "Trường có dấu * là bắt buộc" ở đầu.
- Kiểm khi **bấm Lưu** (và khi rời ô đã sửa), không đỏ ngay lúc mới mở. Lỗi viết cách sửa ("Chọn ngày hẹn từ hôm nay trở đi"), không viết "Không hợp lệ".
- Lưu lỗi → focus ô lỗi đầu tiên; lỗi server → `Alert` danger trên đầu form, giữ nguyên dữ liệu đã nhập.
- Form dài, sửa bản ghi → `Sheet` phải; ngắn (≤ 3 trường) → `Dialog`; tạo bản ghi chính → trang riêng.
- Đang lưu: nút Lưu hiện `Spinner`, khoá cả 2 nút.

**Code:** `react-hook-form` + `zod` (chuẩn shadcn `Form`) — **chưa cài**; thêm khi code form thật đầu tiên.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
