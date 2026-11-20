shadcn `Select` cho danh sách ≤ 10 mục: trigger như Input (chữ medium) và phần nội dung theo Menu của OpenAI.

**Chỉ dùng khi danh sách ≤ 10 mục.** Trên 10 mục → `Combobox` (luật số 2, `docs/CHUAN-FILTER.md`). Ở trang danh sách, ô lọc dùng `BoLocChon` của `apps/web/bang/` (tham số URL theo bảng chuẩn), chỉ đổi diện mạo.

**Người dùng cung cấp:** nhãn, danh sách `{value, label}`, giá trị, placeholder "Chọn …", trạng thái lỗi.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Trigger | SelectControl outline md | cao 32px, bo 8px, viền `input`, chữ 14px weight 500 (`--select-control-font-weight`), chevron 16px `muted-foreground` |
| Đang mở | | viền alpha-50 như Input focus |
| Placeholder | | `color-text-tertiary`, weight 400 |
| Nội dung | Menu | nền `popover`, padding 6px, bo 12px, `shadow` + `shadow-hairline` |
| Item | Menu item | padding 6px 8px, bo 6px, hover alpha-08 (dark alpha-10), dấu ✓ bên phải |
| Disabled item | | `color-text-disabled` |

Hover/focus/lỗi/disabled của trigger giống hệt `Input`.
