Dòng mốc nhỏ chen giữa luồng tin: mốc ngày, sự kiện hệ thống, trạng thái.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`marker.tsx` @45bbf9b, MIT), thêm ở Đợt 8 chép shadcn (21/11/2026).

| Biến thể | Hình | Token |
| --- | --- | --- |
| `default` | icon 16 + chữ | chữ 14/20 `muted-foreground`, khe 8 |
| `separator` | chữ giữa hai vạch | vạch cao 1 màu `border` (alpha-10 · tối alpha-12) |
| `border` | gạch dưới | viền dưới 1 `border`, đệm dưới 8 |

- `MarkerIcon` (aria-hidden) + `MarkerContent`. Link trong mốc gạch chân, rê → `foreground`.
- `asChild` để mốc là thẻ khác (vd `li` trong danh sách tin).
- Mốc chỉ là chữ phụ — không đặt hành động chính ở đây.

**Code:** `components/ui/marker.tsx`. Khối `/ds#marker`.
