shadcn `Drawer` (ngăn kéo vuốt được, `vaul`) cho thao tác ngắn trên điện thoại: chọn nhanh một mục, xác nhận gọn — kéo xuống để đóng.

> **Lên artifact 23/11/2026 — nguồn shadcn new-york-v4** (`registry/new-york-v4/ui/drawer.tsx` @45bbf9b, MIT; bản Radix dùng `vaul` 1.1.2). Giá trị gán theo token Dialog/Sheet của DS. Khi artifact có Drawer thì chép bản artifact đè file này và dựng cổng so khớp.

**Dùng khi** màn điện thoại cần một lựa chọn/hành động ngắn mà không rời trang. Máy bàn hoặc form dài → `Dialog`; bộ lọc nhiều trường → `Sheet`.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Hướng | shadcn `direction` | `bottom` (mặc định), `top`, `left`, `right` |
| Cỡ | shadcn | đáy/đỉnh: rộng hết, trần cao 80vh, cách mép kia 96px · trái/phải: rộng 3/4, trần 384px |
| Nền / bóng | như `Sheet`: `popover`, `shadow-400` + `shadow-hairline` | không viền |
| Bo | như `Dialog`: `radius-2xl` | 16px ở cạnh trong (đáy: hai góc trên) |
| Overlay | `--modal-backdrop-background` | 30% / 50% |
| Header / footer | `dialog-padding` | 20px; footer xếp dọc, nút rộng hết, gap 8px |
| Tiêu đề / mô tả | như `Dialog` | 18px/26px semibold · 14px/20px muted, cách 4px |
| Thanh kéo | shadcn, chỉ hướng đáy | 100 × 8px, `muted`, cách đỉnh 16px, trang trí |
| Lớp | thang z DS | 70 (như Dialog/Sheet) |

- Mở: focus vào phần tử focus được đầu tiên (DS bật `autoFocus` — vaul mặc định tắt); `data-autofocus` để chọn phần tử khác. Đóng: Esc, bấm overlay, vuốt xuống, `DrawerClose`; focus về nút đã mở.
- Header căn giữa ở hướng đáy/đỉnh trên màn hẹp, căn trái từ 768px (như shadcn).
- Giảm chuyển động: tắt trượt/mờ dần của vaul.
- Luôn có `DrawerTitle` (tên hộp cho trình đọc màn hình).
