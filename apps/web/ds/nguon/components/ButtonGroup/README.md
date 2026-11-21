Cụm nút liền nhau cho các lệnh cùng nhóm (lưu nháp / xem trước / gửi duyệt, thu phóng, chuyển trang).

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`button-group.tsx` @45bbf9b, MIT), thêm ở Đợt 5 chép shadcn (21/11/2026). Nút bên trong là `Button` của DS — token theo Button.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator`, `buttonGroupVariants` |
| Bo | shadcn | góc trong vuông, góc ngoài giữ bo của nút (pill / rounded) |
| Nút outline kề nhau | GWT thêm | chồng 1px để hai viền inset gộp thành một vạch 1px (viền DS là box-shadow, `border-l-0` của shadcn không có tác dụng) |
| Cụm lồng cụm | shadcn | cách 8 |
| `ButtonGroupText` | như Button outline | nền `muted`, viền inset 1px `--input`, bo radius-md, chữ 14/20 medium, đệm ngang 16, icon 16; không bóng |
| `ButtonGroupSeparator` | `--input` | vạch 1px, cao theo cụm — dùng giữa nút đặc (secondary/default) |
| Focus | Button | nút đang focus nổi lên trên (z 10) để outline không bị nút kề che |

**a11y:** `role="group"` — luôn đặt `aria-label` nói cụm làm gì. Nút icon trong cụm có `aria-label` riêng.

**Code:** `components/ui/button-group.tsx`. Khối `/ds#button-group`.
