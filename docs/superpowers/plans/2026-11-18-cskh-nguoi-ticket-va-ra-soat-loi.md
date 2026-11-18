# Ticket: danh sách người (CS theo dõi · Kỹ thuật) + rà soát nhóm lỗi hằng tháng

Giao 18/11/2026 (chị Trang qua anh Dũng, xem ảnh trang ticket GWT-260053). Chốt cùng người giao:

| Câu hỏi | Chốt |
|---|---|
| "Nhóm lỗi 1 tháng quét lại 1 lần" | **Rà soát có người duyệt**: ngày 1 hằng tháng app đọc lại ticket, đề xuất gắn lại mã lỗi / nhóm con mới; người quản lý bấm duyệt mới đổi; tóm tắt lên Discord |
| Danh sách Kỹ thuật lấy từ đâu | **Hồ sơ thợ** (bảng `ky_thuat`, có cả CTV/freelancer), không phải tài khoản nhân viên |
| Xoá một tên đã gán ticket | **Ẩn** khỏi danh sách chọn; ticket cũ vẫn hiện đúng tên |

## Hiện trạng (đo 18/11 trên DB GWT-SalesTracking `bwzmqfbcgouhvhoslmmm`)

- `tickets.cs_theo_doi` text + CHECK cứng 4 tên (`tickets_cs_theo_doi_hop_le`); code cũng cứng (`CS_THEO_DOI`).
- Ô Kỹ thuật trên ticket liệt kê **mọi** `staff` (FK `tickets.ky_thuat → staff`). Bảng hồ sơ thợ `ky_thuat` chỉ có 1 người.
- 114/114 ticket chưa gán CS lẫn kỹ thuật → đổi cấu trúc không đụng dữ liệu cũ.
- `tickets.ky_thuat` (staff) **đang được dùng** cho "ticket của tôi" (`actions.ts` ~2522) và chặn xoá nhân viên
  (`nhan-su-luat.ts`) → **không đổi cột này**; thêm cột mới và đồng bộ sang nó khi thợ có tài khoản (khớp email).
- 114/114 ticket có mã lỗi; nhóm qua `loi_danh_muc.nhom` (Main 44 · Rò rỉ 33 · Không phải lỗi 16 · CLN 11 · App 4).

## Phần A — danh sách người (nhánh `feat/cskh-nguoi-ticket`)

DB (migration `20261118090000_cs_nguoi_ticket.sql`, thuần cộng thêm, có ROLLBACK):
- Bảng `cs_theo_doi_ds(id, ten unique, hoat_dong, thu_tu)`, nạp sẵn 4 tên cũ.
- Bỏ CHECK 4 tên; `tickets.cs_theo_doi` → FK tới `cs_theo_doi_ds(ten)` **ON UPDATE CASCADE** (đổi tên → ticket cũ theo tên mới).
- `tickets.kt_ho_so uuid → ky_thuat(id) ON DELETE SET NULL` (kỹ thuật theo hồ sơ thợ).

Code:
1. `lib/loi/nguoiTicket.ts` (hàm thuần, TDD): chuẩn hoá tên + chống trùng (bỏ dấu, hoa thường); danh sách cho ô chọn
   (đang dùng + người đang gán dù đã ẩn); tìm tài khoản staff của thợ theo email.
2. `app/ticket/nguoi-actions.ts` (server): đọc 2 danh sách; thêm / đổi tên / ẩn / hiện lại; gán CS, gán kỹ thuật
   (ghi `kt_ho_so` + đồng bộ `ky_thuat` staff nếu có tài khoản). Quyền `cs.ticket.tao_sua`; mọi thay đổi ghi audit.
   Không sửa `app/actions.ts` (file dùng chung mọi khu).
3. `components/ticket/ChonNguoi.tsx`: ô chọn + "+ Thêm tên…" + "Sửa danh sách" (đổi tên / ẩn / hiện lại).
   Dùng cho cả CS theo dõi và Kỹ thuật (kỹ thuật hiện nhãn CTV).
4. `DauTicket` dùng `ChonNguoi`; form Tạo ticket chọn kỹ thuật từ hồ sơ thợ, tạo xong gán qua action mới.
5. DB chưa áp migration → trang chạy như cũ (bọc `docAnToan` như các cột 17/11).

Nghiệm thu: thêm tên mới → chọn được ngay trên ticket; đổi tên → ticket cũ hiện tên mới; ẩn → không còn trong
danh sách, ticket đang gán vẫn hiện tên; kỹ thuật chọn được thợ CTV không có tài khoản; thợ có tài khoản thấy ticket
trong "ticket của tôi".

## Phần B — rà soát nhóm lỗi hằng tháng (nhánh riêng, sau khi A gộp)

- Bảng `loi_ra_soat(id, thang, ticket_code, loi_cu, loi_de_xuat, ly_do, trang_thai cho/duyet/bo_qua, nguoi_duyet)`.
- Ngày 1 hằng tháng: đọc ticket của tháng trước (mô tả + các lần lỗi), so với mã lỗi đang gắn bằng bộ khớp từ khoá
  của danh mục (`cs_loi_khop`); lệch → dòng đề xuất. Mô tả lặp nhiều mà không khớp mã nào → đề xuất nhóm con mới.
- Trang "Rà soát lỗi tháng" trong Ticket & lỗi: duyệt / bỏ qua từng dòng hoặc hàng loạt; duyệt = đổi `ticket_may.loi_code`.
- Tin tóm tắt Discord (#ai-team): số ticket tháng, số đề xuất, link trang duyệt.
- Chốt 18/11: chạy trên **Mac mini, bot Bắp** (launchd, cạnh các lịch có sẵn); tin tóm tắt vào **#ai-team**.

Đo thử `cs_loi_khop` trên 114 ticket (18/11, mô tả ticket + mô tả dòng máy + các lần lỗi):

| Kết quả | Số ticket | Rà soát nên làm gì |
|---|---|---|
| Khớp mã đang gắn | 76 | Không báo |
| Bộ từ khoá không đoán được | 35 | Đề xuất **bổ sung từ khoá** (alias) cho mã đang gắn — danh mục còn thiếu chữ người dùng hay gõ |
| Lệch mã | 9 | Chỉ báo khi **lệch nhóm cha** (Main / Rò rỉ / CLN / App / Không phải lỗi); lệch nhóm con cùng nhóm là nhiễu |

→ Duyệt một đề xuất "bổ sung từ khoá" = thêm alias vào `loi_danh_muc` (lần sau tự khớp); duyệt "lệch nhóm" = đổi
`ticket_may.loi_code`. Cụm từ lặp ≥ 3 ticket trong tháng mà không khớp mã nào → đề xuất nhóm con mới.
