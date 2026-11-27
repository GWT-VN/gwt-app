# Ticket F — chọn máy của khách, lỗi theo máy, thêm lỗi mới (thiết kế ngắn)

CEO 27/11: "Máy sẽ đi theo khách hàng… khách có tận 2 máy… cho chọn cả máy khi click vào máy trong 1 row (row đó sẽ là data
các máy của KH đã mua) → giá trị lỗi hiển thị bên cạnh. Nếu có lỗi mới thì ở cột lỗi hoàn toàn có thể nhập thêm." Chốt
phương án **A**: lỗi mới vào **danh mục lỗi chung**, trạng thái chờ duyệt.

## Vì sao

Khách mua 2 máy hay báo lỗi cả hai trong một lần gọi. Hiện bảng chỉ cho chọn MỘT máy (sửa dòng máy đầu), máy thứ hai chỉ
hiện "+1". Lỗi chưa có trong danh mục thì NV không có chỗ ghi → dồn về "Chưa phân loại", thống kê theo lỗi sai.

## Hiện trạng (đã đọc code)

- DB đã hỗ trợ nhiều dòng máy / ticket (`ticket_may` qua RPC `cs_them_dong_may`); action có sẵn: `themDongMay`,
  `suaDongMay`, `xoaDongMay`, `doiMayTicket`, `mayCuaCacKhach` (app/ticket/loi-actions.ts). **Không cần DDL.**
- Dòng máy nhận mọi lỗi chưa `ngung` (`loiDungDuoc`) → lỗi `cho_duyet` gắn được ngay.
- Thêm vào danh mục hiện chỉ QUANLY (`luuLoi`, quyền `cs.nhom_loi.cau_hinh`).

## Thiết kế

1. **Ô Máy = chọn MỘT máy** trong các máy khách đã mua (CEO 27/11 "chỉ tích được 1 thôi chứ nhỉ") — đã có sẵn
   (`OSuaChon` + `doiMayTicket`), giữ nguyên. Khách 2 máy thì CSKH chọn đúng máy đang báo lỗi; máy kia báo lỗi = ticket khác.
2. Lỗi hiển thị ngay cột kế bên, theo máy đã chọn (đã có: lỗi không hợp máy mới → về "Chưa phân loại" + mở pop Lỗi).
3. **Ô Lỗi**: chọn lỗi hợp với máy đã chọn (`mucLoi`, theo `ma_may`) + "Chưa phân loại" →
   `suaDongMay(id, { loi_code })`.
4. **Lỗi mới (A)**: gõ trong ô tìm của pop Lỗi; không khớp mục nào → mục cuối "＋ Thêm lỗi "‹chữ gõ›"" →
   action MỚI `deXuatLoi({ ten, internal_code })`:
   - quyền `cs.ticket.tao_sua` (NV CSKH), `requireStaff` + `doQuyen` trong thân hàm;
   - chống trùng: so tên bỏ dấu với toàn danh mục (cả chờ duyệt) → trùng thì dùng mã có sẵn;
   - tạo mã tự động `DX-<SLUG>` (A–Z, 0–9, `-`, ≤ 40, thêm hậu tố số nếu trùng), `trang_thai = 'cho_duyet'`,
     `ma_may = [internal_code của máy]`, ghi audit `de_xuat_loi`;
   - xong gắn ngay vào dòng máy. Tên lỗi chờ duyệt hiện kèm chữ mờ "chờ duyệt".
   - QUANLY duyệt / gộp / ngừng ở màn Danh mục lỗi (đã có).
5. Ticket demo: chỉ đổi trên màn (như các ô sửa khác).

## Không làm

Không chọn nhiều máy / ticket, không đổi schema, không đổi luồng duyệt danh mục, không cho NV sửa/xoá lỗi trong danh mục.

## Để người làm tự quyết

Kiểu chữ "chờ duyệt", chữ thông báo lỗi, thứ tự máy trong pop (theo ngày lắp).

## Cần kiểm khi làm

Cột `loi_danh_muc.nguon` có ràng buộc giá trị không (đặt `nguon = 'cs_de_xuat'` hay để null); RPC/RLS ghi `loi_danh_muc`
bằng `dataClient` (service role) như `luuLoi`; test quét quyền `actions-guard` cho action mới.
