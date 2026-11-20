Alert của OpenAI (variant `soft`) cho thông báo trong trang: lỗi tải, cảnh báo nghiệp vụ, xác nhận đã lưu. Thêm ngoài danh sách shadcn của brief vì brief yêu cầu thể hiện trạng thái lỗi/tải.

**Người dùng cung cấp:** tiêu đề ngắn, mô tả nói điều gì xảy ra + việc cần làm, `data-color`, hành động tuỳ chọn bên phải. Lỗi chặn thao tác dùng `role="alert"`; thông tin dùng `role="status"`.

| Phần | Nguồn Alert.module.css | Giá trị |
| --- | --- | --- |
| Bo / padding / gap | `--alert-border-radius`, `--alert-gutter`, `--alert-gap` | 12px / 16px / 12px |
| Chữ | `--alert-font-size`, `--alert-title-font-weight` | 14px/20px, tiêu đề 600 |
| Nền + viền | `color-background-<màu>-surface` + inset 1px `color-border-<màu>-surface` | |
| Icon | `color-text-<màu>` | 16px |

Chữ thân dùng `foreground` (không tô màu) để luôn đủ tương phản trên nền surface; màu chỉ ở icon và nền.
