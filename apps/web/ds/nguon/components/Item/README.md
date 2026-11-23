Một dòng nội dung: ô media (icon/ảnh) · tiêu đề + mô tả · thao tác bên phải — thông báo, việc trong ngày, tệp, dòng cài đặt.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`item.tsx` @45bbf9b, MIT), thêm ở Đợt 5 chép shadcn (21/11/2026). Ô icon lấy token ô xem trước tệp `.ui-file-thumb` của `bundle.css`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter`, `ItemGroup`, `ItemSeparator` |
| `variant` | shadcn | `default` trong suốt · `outline` viền 1px `--border` · `muted` nền `muted` 50% |
| `size` | shadcn | `default` đệm 16, gap 16 · `sm` đệm 12/16, gap 10 |
| Khung | DS | bo radius-md; viền 1px trong suốt sẵn (đổi variant không nhảy cỡ) |
| Chữ | DS | 14/20; tiêu đề medium; mô tả `muted-foreground`, tối đa 2 dòng |
| Ô icon | `.ui-file-thumb` | 32, radius-md, nền `muted`, icon 16 `muted-foreground`, không viền (shadcn có viền) |
| Ô ảnh | shadcn + DS | 40, radius-md, ảnh cover |
| Cả dòng là link | DS | `asChild` + `<a>`: rê nền `accent` (ghost hover); focus outline 2 `ring` offset 2 |

**a11y:** `ItemGroup` gắn vai trò `listitem` cho từng `Item`. Dòng `asChild` có khung `listitem` riêng để giữ vai trò của link hoặc nút con. Một dòng là link dùng nội dung tĩnh bên trong.

**Code:** `components/ui/item.tsx`. Khối `/ds#item`.
