Thẻ một tệp/ảnh đính kèm — ô media, tên + thông tin phụ, thao tác (bỏ, thử lại), trạng thái tải. Dùng cho tệp đính kèm ticket, Composer, tin nhắn; `AttachmentGroup` xếp nhiều thẻ thành hàng cuộn ngang.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`attachment.tsx` @45bbf9b, MIT; tài liệu `components/radix/attachment.mdx`), thêm ở Đợt 5 chép shadcn (21/11/2026). Token lấy dòng tệp `.ui-file*` của `bundle.css` (FileUpload).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `Attachment`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction`, `AttachmentTrigger`, `AttachmentGroup` |
| Thẻ | `.ui-file` | bo radius-lg, viền inset 1px alpha-08, đệm 8, gap 12, nền `card` |
| `state` | shadcn + DS | `idle` viền gạch alpha-25 (như ô thả `.ui-drop`) · `uploading` / `processing` · `error` viền red-500, ô media nền danger nhạt, phụ `color-text-danger` · `done` (mặc định) |
| Ô media | `.ui-file-thumb` | 32 (sm 28, xs 24), radius-md, nền `muted`, icon 16 `muted-foreground` |
| Tên | `.ui-file-name` | 14/20 (sm/xs 12/18), cắt "…" |
| Phụ | `.ui-file-meta` | 12/18 `color-text-tertiary`, số đều |
| `size` | shadcn | `default` · `sm` · `xs` |
| `orientation` | shadcn | `horizontal` · `vertical` (media trên, nút bỏ góc trên phải) |
| Nút thao tác | Button | `ghost` cỡ `icon-xs` (mặc định shadcn) |
| Rê / focus | `.ui-drop` + luật focus DS | thẻ có Trigger: rê nền alpha-02; Tab tới Trigger → outline 2 `ring` offset 2 quanh cả thẻ |
| Nhóm | shadcn + GWT | cuộn ngang có snap, thanh cuộn ẩn; GWT thêm đệm 4 + lề âm để vòng focus thẻ đầu/cuối không bị cắt |

- **Không chép** (cần utility của gói `shadcn/tailwind.css` mà DS không nạp): chữ `shimmer` khi uploading/processing → đặt `Progress` dưới tên + % trong phụ; mép mờ `scroll-fade-x` của nhóm.
- **a11y:** nút icon có `aria-label` gồm tên tệp ("Bỏ bao-gia.pdf"); `AttachmentTrigger` không có chữ → `aria-label` ("Mở bao-gia.pdf"); lỗi ghi lý do bằng chữ trong phụ, không chỉ đổi màu. Hàng nhóm chỉ để xem (thẻ không có nút) → thêm `tabIndex={0}`, `role="group"`, `aria-label`.
- Ô chọn/thả tệp vẫn là `FileUpload`; Attachment là cách hiện tệp đã chọn/đã đính kèm.

**Code:** `components/ui/attachment.tsx`. Khối `/ds#attachment`.
