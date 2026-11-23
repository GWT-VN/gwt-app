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

## Đợt 2 — hoàn tất khu Việc (23/11)

- Việc tự sinh dựng lại bằng DS (`components/work/v2/TuSinh.tsx` + `SuaLuat.tsx`); code Work cũ xoá hết.
- Thanh hàng loạt dùng chung `v2/HangLoat.tsx`: Đánh dấu xong · Đổi trạng thái (kèm Huỷ việc) · Gán người · Đổi hạn ·
  Thêm (Đổi ưu tiên · Đổi team · Bỏ người) · Xoá hai nhịp (`xemTruocXoa` → ConfirmDialog → `xoaHangLoat` + `dau_van`).
- Bảng team lọc theo team (URL `team`); Việc của tôi đổi dạng xem Danh sách · Bảng · Kanban (`v2/DangXemViec.tsx`).
- Đổi người chính: bước hạ người cũ lỗi → trả người mới về vai cũ (không để 2 người chính).
- DS: thanh hàng loạt canh giữa vùng nội dung (`--khung-trai-rong` của KhungApp).
- Kanban Việc của tôi kéo thả chỉ đổi trạng thái (`work_viec_cua_toi` không trả `sort_order`; gửi `keoTha(…, 0)` từng
  ghi đè thứ tự Bảng team).

## DB — work_18 (23/11, áp live bwzmq…)

- `supabase/migrations/20261123134930_work_18_ngay_dung_cuoi.sql`: `work_bang_team` trả thêm `touched_at` =
  greatest(task.updated_at, nhật ký có người làm, bình luận). Chỉ thêm trường jsonb — app trên `main` không ảnh hưởng.
- Gate: áp file lên DB local + gọi thử; repo CHƯA có CI `db-reset` nên chưa replay từ 0. Ledger live đã sửa version
  về đúng số hiệu file (MCP ghi giờ áp).
- Màn: Bảng team tab "Lâu không đụng" (chưa xong · ≥ 14 ngày, cũ nhất trước) + cột "Cập nhật" (112, như canvas).
- ⚠️ Có từ trước, chưa sửa (ngoài phạm vi): mọi RPC `work_*` cho `anon`/`authenticated` EXECUTE (advisors WARN) mà
  danh tính lấy từ tham số `p_email` → ai có anon key gọi thẳng PostgREST là đọc/sửa việc dưới tên người khác. App chỉ
  gọi bằng service_role → đề xuất `revoke execute … from anon, authenticated` (migration riêng, chờ duyệt).
- Lệch repo có từ trước: `db/work/migrations/work_13…17` đã áp live nhưng không nằm trong `supabase/migrations/` (README
  db/work nói migration mới phải ở `supabase/`) → `supabase db reset` local không replay chúng.
