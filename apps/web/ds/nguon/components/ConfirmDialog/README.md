Hộp hỏi lại trước một việc **không lùi được** (xoá, gộp, đóng hàng loạt). **Mới 18/11/2026**, dựng trên khung `Dialog`.

**Chọn kiểu phản hồi:** lỗi/hỏi trong luồng → `Alert` tại chỗ · trạng thái cả trang/app → `Banner` · xong việc → `Toast` · việc **không lùi được** → `ConfirmDialog` (lùi được thì làm luôn + Toast Hoàn tác, không hỏi trước).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-dialog` | như `Dialog`: rộng ≤450px, padding `dialog-padding` 20px, bo `radius-2xl`; nền mờ đen 30% (tối 50%) |
| Biểu tượng | `ui-dialog-icon` | tròn 40px, nền `alpha-05`; `data-color="danger"` nền `color-background-danger-soft-alpha`, icon `color-text-danger-soft` |
| Tiêu đề | `ui-dialog-title` | là câu hỏi có tên đối tượng: "Xoá phiếu chi PC-1123?" |
| Hệ quả | `ui-dialog-list` | gạch đầu dòng: cái gì mất / chuyển đi đâu; ô lý do theo sau cách 16px |
| Nút | `ui-dialog-footer` | Huỷ `outline` + nút chính ghi **đúng động từ** ("Xoá phiếu chi", không "OK"); xoá dùng `data-variant="destructive"` |
| ≤640px | | rộng hết trừ 16px mỗi bên; nút xếp dọc, nút chính lên trên, rộng hết |
| Chuyển động | | hiện 160ms, tắt khi giảm chuyển động |

**Hành vi:** focus mặc định vào nút **an toàn** ("Quay lại") khi xoá, vào nút chính khi không phá dữ liệu. Đang chạy: nút quay, khoá Esc và nút Huỷ. Lỗi: `Alert` ngay trong hộp, không đóng hộp.
**a11y:** `role="alertdialog"`, `aria-labelledby` tiêu đề, `aria-describedby` mô tả; bẫy focus; đóng xong trả focus về nút đã mở.
**Code:** shadcn `AlertDialog` (Radix) — prototype dùng thẻ `<dialog>` gốc + `showModal()` chỉ để minh hoạ.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/phanhoi` (`apps/web/app/prototype/phanhoi/_ph/PhanHoiDemo.tsx`); CSS ở khối `BỔ SUNG DS PHẢN HỒI` cuối `khung/_proto/ui.css`.
