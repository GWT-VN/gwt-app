# Danh sách ticket F — học HÀNH VI Twenty (đề xuất chờ duyệt, 26/11/2026)

CEO 26/11: bản T (chép y giao diện Twenty) "không ổn" → **giữ hướng F (giao diện DS)**, chỉ học hành vi: kéo thả, lọc,
kanban, ẩn/hiện/thêm cột. Nguồn: [`2026-11-26-twenty-hanh-vi.md`](2026-11-26-twenty-hanh-vi.md) (đọc mã Twenty @63ba48a, có
đường dẫn file từng ý; đã kiểm lại: menu cột, popover "+", Update view / Save as new view, hộp "Remove sorting?", ngưỡng
kéo) + kiểm kê DS (scratchpad, tóm dưới).

## DS đã có nhưng F chưa nối (bước 0 — không cần build mới)

`TieuDeCot` + `KeoCot` (kéo đổi chỗ cột, có phím) · `tayCo` (co dãn, ←→ 8px, nhấp đúp về mặc định, tối thiểu 56) ·
`useCotBang({url:true})` (thứ tự/độ rộng/ẩn vào URL) · ⚙ `CaiDatHienThi` (bố cục, cột hiển thị, sắp, nhóm theo, lưu view,
xuất Excel) · `ThanhDangLoc` + `ChipSapXep` (chip lọc có ×). Hiện chỉ Work v2 dùng. Dạng xem Bảng/DS/Kanban của F đang ở
`useState` → đưa vào URL.

## Twenty làm → DS thiếu → đề xuất cho F

| # | Twenty | DS hiện tại | Đề xuất |
|---|---|---|---|
| A | "+" cuối hàng tiêu đề → popover: ô **Tìm trường**, danh sách trường đang ẩn (icon + tên), vạch, **Customize fields** | không có "+" | Thêm: "+" → ô tìm + cột đang ẩn + "Tuỳ chỉnh cột…" (mở ⚙). "Thêm cột" = bỏ ẩn cột đã khai báo, không tạo trường mới |
| B | Menu tiêu đề cột: Lọc · Sắp · Dời trái · Dời phải · Ẩn; cột đầu khoá (không ẩn/dời, dính trái) | menu chỉ Sắp/Lọc | Thêm Dời trái / Dời phải / Ẩn; cột "Ticket" khoá |
| C | Options → Fields: "Đang hiện" kéo đổi thứ tự + mắt ẩn; "Đang ẩn" | ⚙ chỉ checkbox, không kéo | Danh sách cột trong ⚙ kéo được + nút mắt, chia Đang hiện / Đang ẩn |
| D | Lọc: chọn trường (có tìm) → điều kiện theo kiểu → giá trị; chip gọn (": Không", "≥"), >3 giá trị = "N lựa chọn", relation có mục ghim **"Tôi"**, giá trị trống khi đóng → chip tự gỡ | lọc theo menu cột; không ≠, không rỗng/không rỗng, không "Tôi" | Nút "Lọc" ở thanh: trường → điều kiện (Chọn: là / không là / trống / có; Người: là / không là + "Tôi"; Ngày: hôm nay / khoảng / trước / sau / trống; Chữ: chứa / không chứa) → chip. **Không** làm nhóm AND/OR lồng |
| E | Lọc/sắp áp ngay nhưng TẠM; thanh dưới: Đặt lại · Cập nhật view / Lưu thành view mới. Cột/độ rộng/ẩn lưu view NGAY | `SavedView` chưa có DB, chưa có danh sách view | Giai đoạn 1: URL + nút "Đặt lại" khi khác view mặc định. Lưu view vào DB = việc riêng (bảng `saved_views`) |
| F | Kanban: thẻ = icon + giá trị, **trường rỗng vẫn hiện tên mờ**; đầu cột tag màu + số + menu (Ẩn nhóm, Thêm); "+" đầu cột tạo ở đầu, "Mới" đáy tạo cuối; nhóm ẩn trong Options; cột "Không có giá trị" | thẻ khe cố định; không ẩn cột; không chọn nhóm theo | Thẻ ticket: mã · khách · máy · lỗi gần nhất · BH (icon + giá trị, rỗng hiện mờ); menu đầu cột (Ẩn nhóm, Thêm ticket); nhóm ẩn trong ⚙; nhóm theo: Trạng thái / Khâu / Phụ trách |
| G | Kéo: chuột rê 8px mới thành kéo; cảm ứng giữ 250ms (lệch ≤5px); vạch thả 2px; thẻ kanban cập nhật lạc quan; đang sắp mà kéo xếp tay → hỏi "Bỏ sắp xếp?" | kéo cột có; kanban không kéo trên cảm ứng; không xếp thẻ trong cột | Thêm ngưỡng 8px / 250ms cho kanban (cảm ứng kéo được). Xếp thứ tự thẻ trong cột: **bỏ** (ticket không cần thứ tự tay) |

## Không làm (thừa với app ticket)

Lọc lồng AND/OR · 15 phép tổng hợp · cột tra cứu qua quan hệ · chế độ thẻ thu gọn · kéo xếp dòng/thẻ tay · Calendar.

## Thứ tự dựng (mỗi bước demo được trên F)

0. Nối khối DS sẵn có vào F (kéo cột, co dãn, ⚙ cột, chip lọc, dạng xem vào URL).
1. A + B + C (cột: "+", menu cột, ⚙ kéo được) — thêm vào DS.
2. D (bộ lọc theo trường + "Tôi") — thêm vào DS.
3. F + G (kanban) — thêm vào DS.
4. E (lưu view vào DB) — việc riêng, cần migration.
