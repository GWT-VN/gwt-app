# Ref Mobbin — Shopify (khách, đơn) + helpdesk (ticket) → bài học cho CSKH v2

Đọc 26/11/2026 qua connector Mobbin (chỉ đọc). Ghi bằng lời mình, không chép ảnh (bản quyền Mobbin/app gốc) — mở link
để xem. Đặt cạnh yêu cầu nội bộ: [`2026-11-26-yeu-cau-cskh-tu-kenh-noi-bo.md`](2026-11-26-yeu-cau-cskh-tu-kenh-noi-bo.md) (#1–#11).

## Nguồn đã xem

| App | Flow / màn | Link |
|---|---|---|
| Shopify | Customer detail (4 màn) | https://mobbin.com/flows/83095913-b2b0-4d81-a1e0-314086d87cde |
| Shopify | Customers list + Segments + Companies | https://mobbin.com/flows/11461929-d329-442b-b8cb-cb4a1eaa6439 |
| Shopify | Adding a customer (12 màn) | https://mobbin.com/flows/360ea11c-d58a-4146-8a96-cb112819ef3b |
| Shopify | Order detail (timeline, đính kèm) | https://mobbin.com/flows/f84db86b-d83d-469a-8f6e-322bbe90de28 |
| Shopify | Order detail (trạng thái + hành động) | https://mobbin.com/flows/77cb8bd4-01c7-4d2d-8f25-194c472de57e |
| Zendesk | Ticket detail + lịch sử tương tác | https://mobbin.com/screens/a5855ce7-b82b-4d19-b206-4842759e7d75 |
| Plain | Thread detail + sự kiện hệ thống | https://mobbin.com/screens/bfd38f18-8817-4724-a0e3-8d2abdfde0fa |
| Gorgias | Ticket detail + khách | https://mobbin.com/screens/59065dba-3066-4235-aaa4-84fb44dce09d |
| Intercom | Hội thoại + panel Details | https://mobbin.com/screens/924d2de4-08aa-43da-9068-48041a80ee14 |
| Outseta | Help desk 3 cột | https://mobbin.com/screens/3182a292-3c0a-4634-83f8-5a2cfe5b2933 |

Shopify **không có ticket** — "ticket" học từ helpdesk; Shopify dạy cách làm **trang hồ sơ** (khách, đơn).

## Shopify làm thế nào

**Trang chi tiết (khách / đơn) — một khuôn chung:**
- Đầu trang: icon loại + tên/mã, **badge trạng thái đặt ngay sau mã** (đơn: "Paid", "Unfulfilled"), dòng phụ ngày + nguồn.
  Phải: vài nút hành động + "More actions" + **mũi tên ↑↓ sang bản ghi trước/sau** (khỏi quay lại danh sách).
- Trang khách: **dải 4 số** ngay dưới tiêu đề (đã chi, số đơn, khách từ bao giờ, nhóm RFM).
- Cột chính: thẻ "**Đơn gần nhất**" (mã + badge trạng thái + dòng hàng) kèm "Xem tất cả đơn" / "Tạo đơn" → lịch sử
  nằm ngay trang khách, 1 cú bấm ra danh sách đầy đủ.
- Mỗi thẻ ở cột chính **kết thúc bằng hành động kế tiếp** của chính nó (thẻ giao hàng → "Tạo nhãn giao"; thẻ thanh toán
  → "Thu tiền").
- **Timeline** dưới cùng cột chính: ô ghi chú ở TRÊN ("chỉ nhân viên thấy"), sự kiện **mới nhất trước, nhóm theo ngày**,
  sự kiện hệ thống tự sinh 1 dòng (có chip mã `#1001` bấm được, mũi tên mở chi tiết), ghi chú người viết là thẻ có avatar,
  đính kèm file ngay trong ô ghi chú.
- Cột phải hẹp: các thẻ thuộc tính (Khách / Liên hệ / Địa chỉ / Tags / Notes / Rủi ro), **mỗi thẻ có bút chì sửa riêng**,
  sửa trong dialog nhỏ — không có chế độ "sửa cả trang".

**Danh sách:**
- Tab = **trạng thái** (Tất cả / Chưa giao / Chưa thu / Đang mở / Đã đóng) + nút "+" lưu view riêng.
- Trạng thái hiện thành **badge màu trong cột** (thanh toán, giao hàng là 2 cột badge).
- Dải số tổng trên đầu danh sách; tìm/lọc/sắp/chọn cột gom thành icon cuối hàng tab.
- Danh sách khách tối giản: tên, đăng ký, nơi ở, số đơn, đã chi. Segment = bộ lọc đã lưu.

**Tạo / sửa:** form 2 cột (chính + ghi chú/tags bên phải); **thanh "Chưa lưu — Huỷ / Lưu" nổi trên thanh trên cùng**
thay vì nút cuối form. Rỗng = minh hoạ + 2 nút (Tạo / Nhập).

## Helpdesk làm thế nào (phần Shopify không có)

| Mẫu | App | Ghi chú |
|---|---|---|
| Panel phải đầu tiên là **Trạng thái · Người phụ trách · Ưu tiên** dạng ô chọn | Plain, Outseta, Zendesk (panel trái) | đổi tại chỗ, không mở form |
| **Lịch sử ticket khác của cùng khách** ngay panel phải, mỗi dòng có trạng thái | Zendesk "Interaction history", Gorgias "No other tickets", Intercom "Recent conversations", Plain "Similar threads" | đúng yêu cầu #4 |
| Sự kiện hệ thống 1 dòng mờ ("đổi trạng thái → Done · 3 phút") xen giữa nội dung; **ghi chú nội bộ nền vàng** "khách không thấy" | Plain, Klaviyo, Gorgias | tách rõ người viết vs máy ghi |
| Nút gửi gộp trạng thái: "Gửi & đặt Open ▾" | Zendesk | ghi nhận + chuyển trạng thái 1 lần bấm |
| Trường phân loại ca ở đầu nội dung (lý do liên hệ, sản phẩm, kết quả) | Gorgias | ≈ loại ticket / máy / kết quả xử lý |

## Intercom — vì sao trông gọn (flow "Updating ticket status", "Help desk")

Link: https://mobbin.com/flows/2cf39fd1-7f28-4a30-b52c-a2c01b617c05 · https://mobbin.com/flows/dc3d8590-28fd-4161-9287-9a1ed177cff9

- **Trạng thái là NÚT ở góc phải tiêu đề** (tô màu theo trạng thái: Submitted / In progress / Resolved), bấm → bảng
  chọn nhỏ có ô gõ + phím tắt. Đóng xong có toast "Đã đóng · Hoàn tác". Nổi nhất trang mà không cần badge to.
- Dưới tiêu đề **một dòng meta dạng chip**: loại ticket, mã, "1 báo cáo của khách", "không chia sẻ với khách".
- **Thuộc tính ticket là danh sách nhãn : giá trị** ngay trong thân (Loại, Ngày gửi, Mã đơn…), trường trống hiện
  "+ Thêm" mờ — không có form, không ô viền.
- Panel phải "Details": Phụ trách, Team → Liên kết (ticket liên quan có badge trạng thái) → Dữ liệu khách → **Hội thoại
  gần đây** (mỗi dòng badge Open / In progress). Mỗi nhóm thu gọn được.
- Danh sách: đầu cột chỉ 2 ô chọn "**3 Đang mở ▾**" + "**Mới nhất ▾**"; mỗi dòng: tên, `#mã · loại`, 1 dòng trích, giờ.
- Rất ít đường viền: phân vùng bằng nền xám nhạt và khoảng trắng, chữ nhỏ đều một cỡ.

## Áp vào GWT CSKH v2 (đề xuất, chưa dựng)

| # yêu cầu | Học từ | Đề xuất cho ticket |
|---|---|---|
| #1 trạng thái nổi nhất | Shopify order header, Plain panel | Badge trạng thái **ngay sau mã ticket** ở tiêu đề + ô chọn Trạng thái là dòng đầu panel phải. Khẩn = badge thứ 2 chỉ khi Đang mở. |
| #2 lần lỗi mới trước | Shopify timeline | Lần lỗi xếp mới → cũ như timeline; lần mới nhất mở sẵn, lần cũ thu gọn 1 dòng. |
| #4 ticket cũ cùng máy/khách | Zendesk / Gorgias / Shopify "đơn gần nhất" | Thẻ panel phải "**Máy này · Khách này**": dải số (số ticket, lỗi gần nhất, BH tới) + 3 ticket gần nhất có badge + "Xem tất cả". |
| #5 nội dung trong lần lỗi, không trong nhật ký | Plain (sự kiện vs ghi chú) | Nhật ký chỉ: ghi chú nền vàng + sự kiện hệ thống 1 dòng mờ. Nội dung ca ở thẻ lần lỗi. |
| #6 linh kiện / chi phí | Shopify thẻ kết thúc bằng hành động | Thẻ "Vật tư & chi phí" có hành động cuối thẻ ("Ghi linh kiện tháo từ máy khác"). |
| — đi qua nhiều ticket | Shopify ↑↓ | Mũi tên ticket trước/sau ở tiêu đề (theo bộ lọc danh sách đang mở). |
| — sửa thuộc tính | Shopify bút chì từng thẻ | Mỗi thẻ panel phải sửa riêng (Popover/Dialog DS), bỏ chế độ sửa cả trang. |
| #8 #11 danh sách | Shopify orders | Tab = Đang mở / Đã xong / Đã huỷ / Tất cả (+ view lưu); cột trạng thái là badge; bỏ Phụ trách + Ngày khỏi cột. |
| — tạo ticket | Shopify contextual save bar | Thanh "Chưa lưu · Huỷ / Lưu" thay nút cuối form (kiểm DS có chưa trước khi dùng). |

Khuôn gợi ý cho trang ticket = **khuôn "order detail" của Shopify**: cột chính (lần lỗi → vật tư/chi phí → nhật ký),
cột phải hẹp (Trạng thái/Phụ trách → Máy & khách + lịch sử → Tags/ghi chú). Khác bản "Gọn" hiện tại: thông tin máy/khách
và lịch sử ra panel phải thay vì nằm giữa luồng đọc.

## Còn mở

- Chưa kiểm DS có sẵn: thanh "chưa lưu" nổi, mũi tên trước/sau bản ghi, dải số (KPI strip) — thiếu thì thêm vào DS trước.
- Chưa xem trên Mobbin: Shopify trên điện thoại (khổ 390), các helpdesk ở trạng thái lỗi/đang tải.
