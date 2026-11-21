shadcn `HoverCard` (thẻ xem nhanh khi rê chuột) cho mã khách, mã đơn, mã máy trong bảng/danh sách: rê vào mã → thẻ tóm tắt, không phải mở trang.

> **Chưa có trong artifact — nguồn shadcn new-york-v4** (`registry/new-york-v4/ui/hover-card.tsx` @45bbf9b, MIT; Radix HoverCard). Giá trị gán theo token mặt nổi của Popover/menu. Khi artifact có HoverCard thì chép bản artifact đè file này và dựng cổng so khớp.

**Dùng khi** cần xem thêm vài dòng về một mã mà không rời chỗ đang làm. Thẻ chỉ chứa thông tin THÊM: Radix không cho Tab vào thẻ và trình đọc màn hình bỏ qua nó. Cần bấm/chọn trong thẻ → `Popover`. Chỉ một câu mô tả → `Tooltip`.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` |
| Cỡ | shadcn | rộng 256px (`w-64`), đệm 16px |
| Nền / bóng / bo | như `Popover`, menu (`.ui-menu`) | `popover`, `shadow` + `shadow-hairline`, `radius-xl` (12px), không viền |
| Chữ | như menu | 14px/20px |
| Vị trí | shadcn | dưới trigger, căn giữa, cách 4px; cách mép khung nhìn 8px |
| Trễ | Radix mặc định | hiện sau 700ms, ẩn sau 300ms |
| Lớp | thang z DS | 90 (lớp pop/menu, mở được trong Dialog/Sheet) |

- Trigger là link/nút tự đứng được: bấm mã = mở trang chi tiết. Không đặt thông tin chỉ có trong thẻ.
- Không animation (artifact không có pop nào có animation).
- Dữ liệu demo không PII: SĐT chỉ `•••` + 4 số cuối.
