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

## Menu con · phím tắt · một phần

> Thêm ở repo 20/11, lên artifact 23/11 — nguồn là prototype menu thuộc tính CEO duyệt (`app/prototype/menu-thuoc-tinh`). Mỗi họ menu (DropdownMenu, ContextMenu, Menubar) là file riêng theo khung shadcn new-york-v4; phần không phụ thuộc primitive (ô tìm, nhóm Kbd, tự focus menu con) dùng chung ở `menu-them.tsx` nên hành vi giống hệt.

| Phần | Code | Giá trị |
| --- | --- | --- |
| Mục mở menu con | `*SubTrigger icon phim` | icon · nhãn · phím (Kbd) · ▸; giữ nền đang trỏ khi menu con mở |
| Khung menu con | `*SubContent` | như khung menu; mục đầu thẳng hàng mục cha (alignOffset −6 = −gutter), cách 4px; rộng ≥ 200 nhưng kẹp theo chỗ trống (khổ hẹp không tràn ngang) |
| Phím tắt | `*Shortcut phim={['⇧','D']}` | nhóm Kbd căn phải; không truyền `phim` thì giữ chữ 12px như cũ |
| Một phần | `*CheckboxItem checked="indeterminate"` | dấu – thay ✓, `aria-checked="mixed"`; bấm → bật hết |
| Ô tìm | `MenuTimKiem value onValueChange placeholder` | đầu menu con khi quá 10 mục (CHUAN-FILTER); bên gọi tự lọc |

Bàn phím: → mở menu con và focus mục đang ✓ (có ô tìm thì focus ô), ← đóng về mục cha, Esc đóng hết và trả focus về chỗ mở. Menu con có ô tìm: gõ chữ ở mục cha (menu con đang mở) hay ở mục bất kỳ → chữ vào ô, không nhảy theo chữ đầu; ↓ trong ô sang mục đầu, ↑ ở mục đầu về ô; Enter chọn khi chỉ còn 1 mục; IME đang ghép không chốt.

Đang mở: khổ điện thoại kiểu "drill-in" (menu con thay chỗ menu cha) — v1 chỉ bảo đảm không tràn ngang; menu con lật sang trái vẫn hiện ▸.

## Đổi khi chép khung shadcn (21–23/11/2026)

- `dropdown-menu.tsx` chép lại theo shadcn new-york-v4: đủ 15 phần cùng tên, `data-slot="dropdown-menu-*"`; tên export không đổi nên import cũ vẫn chạy.
- Phần mới: `DropdownMenuPortal` (chỉ cần khi ghép tay — Content/SubContent tự portal vào DsRoot), `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` (mục "Menu con" ở trên); `MenuTimKiem` import được từ `dropdown-menu`.
- Prop mới `inset` trên Item, Label, SubTrigger (`data-inset`): chữ thẳng cột chữ của mục có icon — đệm trái 30px (8 + icon 16 + gap 6), không phải 32px của shadcn.
- Giữ phần GWT: `disabled` theo APG (vẫn focus được, không kích hoạt, menu không đóng — khác Radix); ✓ / – nằm bên PHẢI (shadcn để trái); RadioItem `indicator`; `variant="destructive"`.
- Content mặc định `sideOffset` 4, `collisionPadding` 8, z-90, không animation — như trước.
- Nút mở `data-ds-menu-trigger` ↔ khung `data-trigger-id` giữ: mục menu mở Dialog/ConfirmDialog thì đóng xong focus về nút.
- Kiểu dùng chung ở `menu-styles.ts`, hành vi không phụ thuộc primitive (ô tìm, Kbd, tự focus menu con) ở `menu-them.tsx` — chung với ContextMenu và Menubar (README Menubar).
