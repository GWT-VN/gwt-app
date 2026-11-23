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

## Đổi khi chép khung shadcn (21–23/11/2026)

- `select.tsx` đủ 10 phần shadcn: thêm `SelectLabel` (tên nhóm trong `SelectGroup`, 12/18 600 muted), `SelectScrollUpButton` / `SelectScrollDownButton` (SelectContent tự gắn, chỉ hiện khi danh sách dài hơn chỗ trống). Tên export cũ không đổi.
- `SelectTrigger size` mới: `default` 32 · `sm` 28 (lề 10) → `data-size`.
- ✓ mục đang chọn nằm trong ô `data-slot="select-item-indicator"` rộng 16 luôn chiếm chỗ bên phải → chọn/bỏ chọn không xô chữ.
- Lệch shadcn giữ: `SelectContent` mặc định `position="popper"` + `align="start"` (shadcn `item-aligned`) → pop luôn dưới trigger; đệm ở khung (`--menu-gutter`), không ở Viewport.
- Giữ: mục `disabled` theo Radix (mờ, ↑/↓ bỏ qua); mở bằng chuột thì ẩn vòng focus mục tới phím đầu tiên.
- `NativeSelect` mới (README NativeSelect): `<select>` gốc cùng diện mạo trigger, cùng `size`.
