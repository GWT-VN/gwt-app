Vùng cuộn có thanh cuộn tự vẽ, giống nhau trên Windows/macOS (danh sách dài trong khung cố định, hàng thẻ cuộn ngang).

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`scroll-area.tsx` @45bbf9b, MIT) trên Radix ScrollArea, thêm ở Đợt 5 chép shadcn (21/11/2026).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `ScrollArea`, `ScrollBar` |
| Thanh | shadcn | dày 10, đệm 1px, viền trong suốt 1px phía nội dung → con chạy rộng 7 |
| Con chạy | alpha-30 | bo tròn; cùng màu `scrollbar-color` của danh sách Combobox (shadcn dùng `--border`) |
| Focus phím | luật focus DS | outline 2 `ring` lùi vào trong 2px (vùng cuộn cắt outline bên ngoài) |

- Cuộn vẫn là cuộn gốc trình duyệt (bánh xe, chạm, phím) — Radix chỉ vẽ thanh.
- Đặt chiều cao/rộng ở `className` của `ScrollArea`. Cuộn ngang: thêm `ScrollBar orientation="horizontal"` bên trong.
- Danh sách trong pop/menu đã có trần cao + cuộn riêng — không bọc thêm ScrollArea.

**Code:** `components/ui/scroll-area.tsx`. Khối `/ds#scroll-area`.
