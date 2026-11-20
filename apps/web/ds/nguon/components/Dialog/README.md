shadcn `Dialog` / `AlertDialog` theo token dialog của OpenAI: rộng tối đa 450px, padding 20px, overlay đen 30% (dark 50%).

**Dùng khi** cần xác nhận hoặc nhập ngắn mà không rời trang. Form dài, bộ lọc nhiều trường → `Sheet`. Xoá/thao tác không hoàn tác → `AlertDialog` với nút `destructive` và câu nói rõ hậu quả.
**Người dùng cung cấp:** tiêu đề dạng câu hỏi/hành động, mô tả hậu quả, nút chính bên phải, nút Huỷ `outline` bên trái.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Bề rộng | `--dialog-min-width`, `--dialog-max-width` | 250–450px |
| Padding | `--dialog-container-inner-padding` | 20px (`dialog-padding`) |
| Overlay | `--modal-backdrop-background` | rgb(0 0 0 / 30%) · dark 50% |
| Nền / bóng | `--color-surface-elevated`, `--shadow`, `--shadow-hairline` | `popover` |
| Bo | — (OpenAI không định) | `radius-2xl` 16px — **lựa chọn GWT** |
| Tiêu đề | heading-sm | 18px/26px semibold |
| Mô tả | text-sm | 14px `muted-foreground` |
| Footer | | căn phải, gap 8px, cách thân 20px |

- Nút ✕ (ghost icon-sm) cách mép trên/phải 19px: tâm nút thẳng tâm dòng tiêu đề (padding 20 + (26 − 28) / 2). Hộp có ✕ → tiêu đề chừa lề phải 36px (chữ dài xuống dòng, cách ✕ 9px, không chạy dưới ✕); AlertDialog/ConfirmDialog không ✕ → tiêu đề trọn bề ngang.
- Focus vào nút an toàn (Huỷ) khi mở; khoá focus trong dialog; Esc/overlay đóng (AlertDialog: overlay KHÔNG đóng).
- Loading: nút chính hiện spinner, khoá cả hai nút đến khi xong; lỗi server hiện `Alert` danger trong thân, không đóng dialog.
