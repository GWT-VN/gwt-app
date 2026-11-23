# Khung điều hướng + màn Work v2 — quyết định (23/11/2026)

Nguồn thiết kế: canvas Claude Design (khung F + màn Work, bản 23 — CEO duyệt 23/11). Dựng bằng DS "GWT — OpenAI + shadcn"
(artifact bản 52). Nhánh `rework/v2.0.0`, không đụng `main`.

## Khung điều hướng (xong, CEO duyệt trên app thật)

- `components/khung/Khung.tsx` (server: quyền `QUYEN_MENU`) → `KhungGwt.tsx` (client: `KhungApp` DS trong `DsRoot`, theme
  theo máy). Thay `TopNav` cũ ở layout gốc cho mọi trang sau đăng nhập.
- `lib/khung/ban-do-menu.ts`: khu + menu theo quyền — đủ mọi trang đang chạy của menu cũ, gom nhóm theo canvas (mục nhóm mở
  menu con), nhóm rỗng thì bỏ, không hiện mục "sắp có". Quản trị = khu đặt đáy thanh. Bỏ nút chuông (không có chức năng).
- **Bẫy:** vùng DS `[data-ds="v2"]` khai đè biến thang Tailwind (`--spacing` 4px, `--radius-*`, `--shadow`,
  `--background/--foreground`) + Inter 14/20 → màn cũ nằm trong `[data-man-cu]` (globals.css trả lại giá trị cũ). Màn đã
  dựng lại bằng DS bọc `ManV2` (mở vùng DS riêng bên trong).

## Màn Work

| Quyết định | Lý do |
|---|---|
| Mã việc giữ `TK-` (DB), không đổi sang `VIEC-` của canvas | Đổi mã = đổi dữ liệu thật; canvas ghi là đề xuất |
| Ưu tiên hiện chữ Gấp · Cao · Thường · Thấp (`title` P1–P4) | Theo DS + canvas |
| Vai hiện Chính · Làm cùng · Duyệt · Theo dõi (DB owner/doer/reviewer/watcher) | Theo canvas |
| Tab Việc của tôi: Đang mở = có vai; Tôi giao = mình tạo mà không có vai; Quá hạn ⊂ Đang mở; Đã xong = 7 ngày qua | `work_viec_cua_toi` trả cả việc mình tạo (`my_role` null) |
| Ô tick đầu dòng = đánh dấu xong (toast Hoàn tác) | Theo canvas |
| Bỏ "Nhắc 15:00", nút "Hỏi người làm" | Chưa có chức năng phía sau |
| Tab "Lâu không đụng" + cột "Cập nhật" (Bảng team) chờ DB | `work_bang_team` chưa trả `updated_at` — cần sửa RPC (đi workflow DDL) |

## Lát

1. Việc của tôi (xong): DataViewToolbar + ô tìm bo tròn + tab + Thêm việc nhanh + ListView nhóm theo hạn, sửa tại chỗ.
2. Xem nhanh (panel chi tiết) · 3. Bảng team (Bảng/Kanban/hàng loạt surface) · 4. Tạo việc (hộp thoại).

DS bổ sung trong đợt: `TrangDuLieu` (`.b-trang`), `O_TIM_PILL`, KhungApp (mục nhóm, khu đáy, menu tài khoản).
