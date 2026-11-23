Thanh **Menubar** — nhóm lệnh của một màn (Tệp · Sửa · Xem) thành các nút trên một thanh, mỗi nút mở một menu.

**Lên artifact 23/11/2026** — nguồn shadcn/ui `new-york-v4` @45bbf9b (MIT, Radix Menubar), thêm ở repo Đợt 1 chép shadcn (21/11/2026). Khung đúng shadcn (16 phần, cùng tên, `data-slot`, prop `inset` / `variant`); thanh + nút gán token theo class shadcn; khung menu và mục **dùng chung** `.ui-menu*` với DropdownMenu/ContextMenu (`components/ui/menu-styles.ts`) nên mục trông y hệt.

**Dùng khi** một màn có nhiều nhóm lệnh ngang hàng (soạn thảo, màn cấu hình lớn). Thao tác của MỘT bản ghi → nút ⋯ (`DropdownMenu`) hoặc chuột phải (`ContextMenu`), không phải Menubar. Hành động chính không giấu trong menu.
**Người dùng cung cấp:** `aria-label` cho thanh, nhãn nút ngắn (một từ), mục bị chặn vì phân quyền → `disabled` kèm lý do trong nhãn, không ẩn đi.

| Phần | shadcn | Token DS | Giá trị |
| --- | --- | --- | --- |
| Thanh | `h-9 gap-1 p-1 rounded-md border bg-background shadow-xs` | `--control-size-lg`, `--radius-md`, `--border`, `background`, `--shadow-100` | cao 36, đệm 4, gap 4, bo 8, viền 1, bóng bậc 100 |
| Nút | `px-2 py-1 rounded-sm text-sm font-medium`, sáng khi focus / mở | `--menu-item-background-color` | đệm 4 8, bo 6, 14/20 medium; nền alpha-08 (tối alpha-10) khi rê / focus / mở; vòng focus phím 2px `ring` lùi −2 |
| Khung menu | `align start, alignOffset -4, sideOffset 8` | `.ui-menu` (như DropdownMenu) | thẳng mép trái thanh, cách mép dưới thanh 4; z-90; trần cao `min(420px, 100vh − 16px)` + cuộn trong |
| Mục, nhãn, phân cách, phím tắt, ✓ | | `.ui-menu-item` … (như DropdownMenu) | xem README DropdownMenu |
| `inset` | `pl-8` | đệm 8 + icon 16 + gap 6 | thụt 30 — chữ thẳng cột chữ của mục có icon |

**Phần GWT cộng thêm** (giống hệt DropdownMenu): mục `disabled` theo APG (vẫn hiện, vẫn focus được, không kích hoạt) · ✓ / – bên phải, `CheckboxItem checked="indeterminate"` · `Shortcut phim` (nhóm Kbd) · `SubTrigger icon phim` · `MenuTimKiem` · mục mở Dialog thì hộp đóng xong focus về nút trên thanh (`use-nut-mo.ts`).

**Bàn phím (Radix):** Tab vào thanh (một điểm dừng), ←/→ giữa các nút (vòng lại), ↓ / Enter / Space mở menu và focus mục đầu, ←/→ khi menu mở → sang menu kế bên, Esc đóng và trả focus về nút. Đang mở một menu thì rê sang nút khác mở luôn menu đó.

**Màn hẹp:** thanh không tự cuộn/gập — quá 4–5 nút ở khổ 390 thì gom bớt hoặc dùng DropdownMenu.

**Code:** `components/ui/menubar.tsx` (phần GWT dùng chung ở `menu-them.tsx`). Khối `/ds#menubar` — `app/ds/_khoi/khoi-menubar.tsx`. Không có cổng so khớp (artifact chưa có).
