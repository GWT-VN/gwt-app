# Danh sách ticket F — dựng thật (kế hoạch chờ duyệt, 26/11/2026)

CEO 26/11: "build thật vì ổn rồi" → "build xong kiểm cho y hệt bản prototype rồi đẩy vào Design System. Mặc định chiều
rộng cột = chiều dài content dài nhất để tránh bị cắt thông tin". Nhánh `rework/v2.0.0` (không đụng `main`).

## Dữ liệu thật có gì (đo trong `app/actions.ts`)

| Prototype F dùng | Dữ liệu thật | Hướng |
|---|---|---|
| Tab Của tôi / Chưa giao / Tất cả đang mở | `cs_phu_trach`, `state` | giữ |
| Tab **Quá hạn**, cột Hạn | **không có** hạn (giả định "ngày tạo + 3") — CEO đã bỏ cột | **bỏ tab**. CEO 26/11: "thay quá hạn bằng việc gắn task → để hạn sang bên tab Work" → hành động **Gắn việc** (Xem nhanh + thanh hàng loạt): tạo Việc mới (`taoViec`: tiêu đề điền sẵn mã + khách, hạn, người làm) hoặc gắn Việc có sẵn (`timViec`), rồi `ganErp(id, 'ticket', mã)` vào `work.task_link`. Xem nhanh có khối "Việc đã gắn" (tiêu đề · hạn · trạng thái, link `/work?xem=`). Quá hạn theo dõi ở Work |
| Tab **Chờ vật tư** | `ticket_items` không có trạng thái "chờ" | **bỏ tab** |
| Tab Hẹn hôm nay | lịch KT (`datTrangThaiLichKT`: hen/xong/huy) | giữ, đếm theo lịch KT hôm nay |
| Tab mới **Khẩn** | `khan` (searchTickets `onlyKhan`) | thêm |
| Kanban Khâu (Mới/Chờ hẹn/Đã hẹn/Vật tư/Xong) | suy ra, không có cột | Kanban mặc định **theo Trạng thái** (kéo = `updateTicket state`); theo Phụ trách (kéo = giao lại); Khâu chỉ xem, không kéo |
| Xem nhanh: sửa trạng thái / phụ trách | `updateTicket` | thật |
| Xem nhanh: Lần lỗi / Nhật ký / Vật tư / Ticket khác | `getTicket` + dòng máy, `listTicketNotes`, `listTicketItems`/`addTicketItem`, `ticketsOfSerial`/`ticketsOfCustomer` | thật |
| Hẹn KTV | lịch KT | nút mở luồng hẹn có sẵn ở chi tiết ticket (không dựng luồng mới) |
| Lưu view | `listBangView` (bảng view đã có) | nối vào ⚙ "Lưu view" ở bước sau |

## Bước (mỗi bước demo được, commit riêng)

1. **DB local có dữ liệu thật đã che PII** — `supabase/seed-prod-masked.sh` (local thiếu bảng CSKH: `loi_danh_muc`,
   `ticket_may`…). Không đụng DB cloud.
2. **DS: độ rộng cột mặc định = nội dung dài nhất** (`useCotBang`): đo tiêu đề + ô đang hiện, cột chưa bị kéo tay;
   kéo tay (URL `cot_rong`) thắng; tổng vượt khung thì cuộn ngang (không cắt chữ). Test + ghi NGUON.
3. **`/ticket` mặc định = F với dữ liệu thật**: lọc/sắp/tìm/phân trang đẩy xuống `searchTickets` (không lọc trên trang),
   số đếm tab từ DB; màn cũ giữ ở `?cu=1` tới khi CEO bỏ.
4. **Xem nhanh + Kanban + hàng loạt nối hành động thật** (bảng trên).
5. **Kiểm y hệt prototype**: chụp cạnh nhau 1440/900/390 sáng/tối, đo căn (mép, tâm dọc, độ rộng), console sạch,
   `tsc` + test cả bộ + `build`.
6. **Đẩy DS lên artifact** — mọi mục "Chờ đồng bộ lên artifact" trong `ds/NGUON.md` (tab pill 32/12, tab line icon + "+N",
   cột ghim, ô chọn luôn hiện, tiêu đề viết hoa 44/600, ⚙ kéo qua nhóm, bộ lọc theo trường, kanban, Xem nhanh tab…), cổng
   so khớp xanh. Chỉ khi CEO nói "đẩy lên artifact" (đã nói 26/11).

## Không làm

Merge `main` · migration mới (chỉ đọc/ghi bảng có sẵn qua action có sẵn) · luồng hẹn KTV mới.
