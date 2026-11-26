# Yêu cầu CSKH gom từ kênh Discord nội bộ (04–26/11/2026)

Nguồn: kênh nhóm trợ lý trên Discord GWT (180 tin + 2 thread "Sửa Ticket App", "Công việc nhờ kiểm tra"), đọc 26/11/2026
bằng bot (chỉ đọc). Chỉ ghi vai trò, không ghi tên người / khách. Link tin: `https://discord.com/channels/1484009253831315456/<kênh>/<tin>`
(kênh chính `1567427656117657611`, thread `1575055230519746621`). Bản tin gốc + ảnh giữ ngoài repo (có SĐT khách, mật khẩu).

## Trang chi tiết ticket — người dùng cần thấy gì trước

| # | Yêu cầu | Ai · ngày · tin |
|---|---|---|
| 1 | **Trạng thái là thứ hiển thị rõ nhất**, tag màu riêng, nổi bật ở CẢ trang chi tiết lẫn danh sách | Quản lý · 25/11 · `1575034870713946174` |
| 2 | **Lần lỗi MỚI NHẤT lên trước**, cũ xuống dưới — vào trang đang thấy lỗi cũ chứ không thấy lỗi mới | CSKH · 23/11 · `1574364762874187918` |
| 3 | Ghi **ngày khách báo lỗi**, không phải ngày nhập ticket | CSKH · 25/11 · `1575014851888021574` |
| 4 | Nhìn được **ticket cũ của cùng máy / cùng khách** (tra theo serial, họ tên, SĐT); khi tạo ticket chọn serial/khách → hiện xem trước hoặc link tới khách/máy để biết đã lỗi gì trước đó | CSKH · 25/11 · `1575014693180014602`; Quản lý · 25/11 · `1575034870713946174` |
| 5 | Nội dung ca phải nằm **trong ticket (lần lỗi)**, không để ở nhật ký trao đổi | CSKH · 23/11 · `1574364460599087195` |
| 6 | Mục **linh kiện tháo từ máy khác**: serial máy bị tháo, tên vật tư. Phải thiết kế đủ luồng: vật tư lấy từ kho/máy nào; tính phí VN hay TQ (TQ → gom để đòi, theo dõi đòi được hay tự chịu; VN → tổng chi phí mỗi tháng) | CSKH · 25/11 · `1575015661980090479`; Quản lý · 25/11 · `1575034870713946174` |
| 7 | "Khẩn" chỉ là cờ của ca **đang mở** (không phải trạng thái thứ tư); trạng thái chỉ Đang mở / Đã xong / Đã huỷ | Dũng (ảnh chú thích) · 25/11 · thread `1575065830197039134` |

## Danh sách ticket

| # | Yêu cầu | Ai · ngày · tin |
|---|---|---|
| 8 | Trạng thái (đã xong / đang xử lý / đang mở) hiện ngay ở ngoài danh sách | CSKH · 25/11 · `1575013576446312480` |
| 9 | Ticket mới nhất lên đầu | CSKH · 25/11 · `1575014851888021574` |
| 10 | Cột "Phụ trách" và "Ngày" đưa vào trong ticket cho gọn; ngày gộp vào cột "lỗi gần nhất" (đang trùng ngày) | CSKH qua trợ lý · 25/11 · thread `1575059366531563521`; Dũng · thread `1575066240274141196` |
| 11 | Tab chỉ chia theo trạng thái; "Việc của tôi" không cùng loại; không đánh số tiêu đề cột | Dũng (ảnh chú thích) · thread `1575065830197039134` |

## Yêu cầu chung

- App gọn, giao diện dễ dùng, mượt; lỗi chỗ nào sửa chỗ đó, **không để lỗi đụng vào dữ liệu**. Phần CS làm hoàn thiện cao
  (Quản lý · 19/11 `1572840456184668262`, 25/11 `1575034923700719698`).
- Quản lý người dùng / vai trò về **một trang chung**, không để dưới ticket hay lỗi (Quản lý · 19/11 `1572841175898132542`).
- Quét định kỳ: lỗi ticket gom nhóm + phân loại lại; data rác / ticket mãi chưa đóng; khách mua lọc tổng chưa có lịch bảo
  trì hoặc không có lịch sắp tới (Quản lý · 19/11 `1572841175898132542`).
- Bảo trì: một tên khách, bên trong là các lượt bảo trì (không trải "lượt 1, 2, 3" ra ngoài); nhập thông số xong tải ảnh /
  chèn báo cáo để gửi khách (CSKH · 19/11 `1572915167313006632`).
- Ca trực nhập ticket: ngày 9h–18h; sáng hôm sau rà từ 23h tối trước; cuối tuần rà từ 18h chủ nhật (CSKH · 25/11
  `1575010524536770662`) — quy trình, ảnh hưởng view "mới vào từ ca trước".
- Việc xong phải báo lại người duyệt (tag), không để lơ lửng (Quản lý · 16/11, 25/11) — gợi ý cho ticket: rõ "đang chờ ai".

## Đã có sẵn (không phải yêu cầu mới)

- Bot báo mỗi ticket mới lên kênh CSKH, tag quản lý + giám đốc kỹ thuật (từ 25/11).
- Danh sách CS theo dõi / kỹ thuật sửa ở một trang, chỉ người có vai trò sửa (19/11).
