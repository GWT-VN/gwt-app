Vạch ngăn 1px giữa hai phần nội dung, ngang hoặc dọc.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`separator.tsx` @45bbf9b, MIT), thêm ở Đợt 0 chép shadcn (21/11/2026). Màu lấy token `--border` (cùng màu `.ui-menu-sep` và viền thẻ của `bundle.css`).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Ngang | `--border` | cao 1, rộng 100% |
| Dọc | `--border` | rộng 1, cao 100% (theo hàng flex chứa nó) |

**a11y:** mặc định `decorative` — chỉ trang trí, trình đọc màn hình bỏ qua. Vạch thật sự ngăn NHÓM (vd giữa hai nhóm lệnh) thì `decorative={false}` → `role="separator"` + `aria-orientation`.

**Dùng ở:** Field (`FieldSeparator`), sau này ButtonGroup / Item / Sidebar của shadcn. Vạch trong menu vẫn dùng `DropdownMenuSeparator` (có lề riêng của menu).

**Code:** `components/ui/separator.tsx`. Khối `/ds#separator`.
