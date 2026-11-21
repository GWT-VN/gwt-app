Thanh tiến độ cho việc đang chạy có biết phần trăm (tải tệp, nhập dữ liệu, đồng bộ).

**Chưa có trong artifact riêng** — nguồn shadcn new-york-v4 (`progress.tsx` @45bbf9b, MIT) trên Radix Progress, thêm ở Đợt 5 chép shadcn (21/11/2026). Token lấy `.ui-progress` của `bundle.css` (thanh tải tệp của FileUpload).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Rãnh | `.ui-progress` | cao 4, bo tròn, nền alpha-08 (shadcn cao 8, nền primary 20%) |
| Thanh | `.ui-progress > span` | `color-background-primary-solid`, chuyển 200ms ease (trượt bằng translateX như shadcn) |
| Trạng thái | Radix | `data-state` loading / complete; `role="progressbar"` + `aria-valuenow` |

- **GWT sửa:** shadcn không chuyền `value` cho Radix Root (thiếu `aria-valuenow`, `data-state` luôn indeterminate) → DS chuyền lại.
- **Bắt buộc** đặt tên: `aria-label` ("Đang tải bao-gia.pdf") hoặc `aria-labelledby`. Luôn hiện số % bằng chữ cạnh thanh.
- Không rõ tiến độ → dùng `Spinner`, không để thanh rỗng.
- Toast có thanh riêng 72px màu chữ (`toast-styles.ts`), không dùng component này.

**Code:** `components/ui/progress.tsx`. Khối `/ds#progress`.
