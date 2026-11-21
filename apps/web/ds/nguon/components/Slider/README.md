Thanh kéo chọn **một số hoặc một khoảng số** khi con số gần đúng là đủ (lọc khoảng giá, ngưỡng cảnh báo).

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`slider.tsx` @45bbf9b, MIT) trên Radix Slider, thêm ở Đợt 4 chép shadcn (21/11/2026). Token mượn Switch (`.ui-switch` của `bundle.css`).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Rãnh | `.ui-switch` tắt | cao 6, bo tròn, nền alpha-25 |
| Phần đã chọn | `.ui-switch` bật | `color-background-primary-solid` |
| Núm | núm Switch | 16, nền `background` (tối `foreground`), viền 1px primary-solid, bóng shadow-hairline + 0 1px 2px alpha-15 |
| Focus phím | luật focus DS | outline 2 `ring`, offset 2 (shadcn quầng 4 — DS không dùng quầng) |
| Tắt | shadcn | mờ 50%, con trỏ cấm |

**Bàn phím (Radix):** ←/→ ↑/↓ một bước, PageUp/PageDown mười bước, Home/End về đầu/cuối.

**Bắt buộc:** truyền `nhan` (GWT thêm) — chuỗi cho một núm, mảng theo thứ tự núm cho khoảng ("Giá từ", "Giá đến"); Radix không tự đặt tên cho núm. Luôn hiện giá trị đang chọn bằng chữ cạnh thanh. Cần số chính xác → ô nhập số, không dùng Slider.

**Code:** `components/ui/slider.tsx`. Khối `/ds#slider`.
