Danh sách lệnh có ô gõ để lọc, đi bằng ↑/↓ và Enter — nền cho CommandPalette, Combobox và ô tìm trong pop.

**Chưa có trong artifact riêng** — nguồn shadcn new-york-v4 (`command.tsx` @45bbf9b, MIT) trên cmdk 1.1.1, thêm ở Đợt 7 chép shadcn (21/11/2026). Token mượn `.ui-menu*` (cỡ gọn) và `.ui-command-*` (CommandDialog, CommandPalette) của `bundle.css`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Gốc `Command` | `.ui-menu` | nền popover, bo radius-xl, chữ 14/20 |
| Hàng gõ `CommandInput` | `.ui-menu-search` | cao 32, đệm 0 8, gap 8, kẻ dưới `border` (focus: alpha-50), kính lúp 16 muted |
| Danh sách `CommandList` | `.ui-menu-list` | trần cao 240 (shadcn 300), cuộn, đệm 6 |
| Tên nhóm | `.ui-menu-label` | đệm 6 8, 12/18 600 muted |
| Mục `CommandItem` | `.ui-menu-item` | đệm 6 8, gap 6, bo 6; mục sáng (`data-selected`) nền alpha-08 (tối alpha-10); tắt: chữ disabled, không nhận chuột |
| `CommandShortcut` / `CommandSeparator` / `CommandEmpty` | `.ui-menu-shortcut` / `-sep` / `-empty` | 12/18 muted · cao 1 nền border · đệm 6 8 12/18 muted |
| `CommandDialog` | `.ui-command-*` | hộp Dialog đệm 0; hàng gõ 52, chữ 16/24; mục cao tối thiểu 40, gap 10 |

Đo `getComputedStyle` trên /ds/tron (21/11, sáng + tối, 1440 + 390): hàng gõ 32 · mục 32 (6 + 20 + 6) · CommandDialog hàng gõ 52 chữ 16 · mục 40 · hộp 450 (1440) / 358 (390).

- **GWT thêm:** `CommandInput` nhận `wrapperClassName` (hàng bọc) và `children` (đuôi hàng, vd Kbd Esc). CommandDialog đặt tiêu đề sr-only TRONG hộp (shadcn đặt ngoài → chữ sr-only thường trực trên trang).
- **Bẫy cmdk 1.1.1:** lúc mount cuộn mục sáng vào khung nhìn → Command đặt sẵn giữa trang dài kéo cả trang. Đặt `defaultValue` không trùng mục nào (khối /ds) hoặc vẽ tĩnh (`tinh` của CommandPanel/ComboboxPanel). Lọc ngoài (`shouldFilter={false}`) phải tự giữ `value` + gắn lại `aria-activedescendant` (xem `combobox.tsx`).
- Bộ lọc mặc định của cmdk không bỏ dấu tiếng Việt → thêm `keywords` không dấu, hoặc lọc bằng `bang/timkiem` như CommandPalette.
- Ô tìm toàn cục của app là **CommandPalette**, chọn một giá trị trong form là **Combobox** — không dựng lại từ Command.

**Code:** `components/ui/command.tsx` (+ `command-styles.ts`). Khối `/ds#command`.
