Khung giữ đúng tỉ lệ rộng / cao cho ảnh, video, bản đồ — bề ngang đổi thì chiều cao đổi theo.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`aspect-ratio.tsx` @45bbf9b, MIT) trên Radix AspectRatio, thêm ở Đợt 5 chép shadcn (21/11/2026).

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| `ratio` | Radix | rộng / cao, vd `16 / 9`, `1` |
| Khung | không có token | bo + nền đặt ở `className` của khung; DS mẫu: radius-lg, nền `muted` (như ô xem trước `.ui-file-thumb`) |
| Con | — | ảnh/video phủ kín khung, `object-cover` |

Ảnh thật dùng `next/image` với `fill` bên trong khung. Ảnh có nghĩa thì có `alt`; ảnh trang trí `alt=""`.

**Code:** `components/ui/aspect-ratio.tsx`. Khối `/ds#aspect-ratio`.
