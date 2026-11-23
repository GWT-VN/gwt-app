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

## Đổi khi chép khung shadcn (21–23/11/2026)

- `ConfirmDialog` (mẫu ghép GWT) giữ nguyên prop và hành vi; bên trong nay ghép đúng phần shadcn: `AlertDialogHeader` (`AlertDialogMedia` icon + tiêu đề + mô tả) → `AlertDialogBody` → `AlertDialogFooter`. Nút xác nhận vẫn là `Button` thường (chờ được Promise), không phải `AlertDialogAction`.
- `data-slot` của biểu tượng đổi `confirm-dialog-icon` → `alert-dialog-media`; thêm `alert-dialog-header`.
- **AlertDialog (`alert-dialog.tsx`) đổi API:** `AlertDialogAction` và `AlertDialogCancel` nay tự vẽ `Button` như shadcn — Action mặc định `variant="default"`, Cancel `variant="outline"`, nhận `variant`/`size`. Không bọc `<Button>` bằng `asChild` nữa: viết `<AlertDialogCancel>Huỷ</AlertDialogCancel>`.
- `AlertDialogContent size="sm"` (mới, shadcn): rộng tối đa 320px mọi khổ, footer chia hai cột đều (Huỷ trái, hành động phải). Mặc định `default` như cũ.
- Export mới: `AlertDialogHeader`, `AlertDialogMedia` (tròn 40px nền `alpha-05`, như `ui-dialog-icon`; nền danger là phần GWT), `AlertDialogPortal` (mặc định vào ô của `DsRoot`), `AlertDialogOverlay`. `AlertDialogBody` là phần GWT.
- Không có hiệu ứng zoom/fade của shadcn; header luôn căn trái như artifact. Hình thức hộp giữ nguyên.
