shadcn `DropdownMenu` theo Menu của OpenAI: khung nổi bo 12px, padding 6px, item 6×8px, bóng `shadow` + `shadow-hairline`.

**Dùng khi** gom thao tác phụ của một bản ghi (nút ⋯ cuối dòng bảng) hoặc tuỳ chọn hiển thị (ẩn/hiện cột). Hành động chính không giấu trong menu.
**Người dùng cung cấp:** nút mở có `aria-label` nêu rõ đối tượng ("Thao tác với đơn DH-…"), danh sách item, item bị chặn vì phân quyền → `aria-disabled` kèm lý do trong nhãn, không ẩn đi.

| Phần | Nguồn Menu.module.css / variables-components.css | Giá trị |
| --- | --- | --- |
| Khung | `--menu-gutter`, `--menu-radius`, `--color-surface-elevated`, `--shadow`, `--shadow-hairline` | padding 6px, bo 12px, nền `popover` |
| Item | `--menu-item-padding`, `--menu-item-gap`, `--menu-font-size` | 6px 8px, gap 6px, 14px/20px, bo 6px |
| Hover/đang trỏ | `--menu-item-background-color` | alpha-08 / dark alpha-10 |
| Nhãn nhóm | | 12px semibold `muted-foreground` |
| Phân cách | `--menu-separator-background-color` | 1px `border`, tràn sát mép khung |
| Phím tắt | | 12px `muted-foreground`, căn phải |
| Item xoá | danger | chữ `color-text-danger` |
| Checkbox item | `--menu-checkbox-indicator-size` | dấu ✓ bên phải |

Bàn phím: ↑/↓, Enter/Space, Esc trả focus về nút mở; gõ chữ cái nhảy tới item (Radix có sẵn).
