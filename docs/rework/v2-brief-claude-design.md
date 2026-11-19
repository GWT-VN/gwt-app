# Brief thiết kế UI — GWT App v2.0.0

> Dán nguyên file này cho Claude Design và **chọn design system "GWT — OpenAI + shadcn"** (https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr — artifact riêng tư, người dùng tài khoản khác cần được Share). Muốn hiểu sâu nghiệp vụ, đính kèm thêm `docs/rework/v2-mo-ta-app.md` (mô tả đầy đủ 16 luồng, ~730 dòng). Nguồn token OpenAI gốc + checksum: `docs/design-system/` trên nhánh `docs/nen-tang-openai-ds`. Brief này tự đủ để bắt đầu thiết kế.

## 0. Việc cần làm

Thiết kế giao diện cho **GWT App v2** — webapp nội bộ dùng hằng ngày của một công ty ~20 người. Làm theo thứ tự:

1. **Hệ thiết kế** — **đã có, không dựng lại**: chọn DS **"GWT — OpenAI + shadcn"** (https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr). Component và cấu trúc tương tác theo **shadcn/ui**, diện mạo (màu, chữ, khoảng cách, chiều cao control, viền, bo, bóng, focus) theo **OpenAI Apps SDK UI 0.2.2**. Việc ở bước này: ghép component nghiệp vụ mục 4.2 từ component nền của DS, chỗ DS còn thiếu thì bổ sung vào DS — mục 4.
2. **Khung app** (thanh điều hướng desktop + khung điện thoại) — mục 5.
3. **Các màn theo thứ tự ưu tiên P1 → P2** — mục 6.
4. **Mẫu tin bot Discord** — mục 7.

Mỗi màn: bản desktop 1440px; màn nào ghi "📱" thì thêm bản điện thoại 390px. Vẽ đủ các trạng thái ghi ở màn đó (đang tải · rỗng · lỗi · thiếu quyền khi có). Toàn bộ chữ trên giao diện bằng **tiếng Việt có dấu**. Dữ liệu mẫu dùng **tên giả** (đừng dùng người thật).

## 1. Công ty và app

**GWT** phân phối và lắp đặt **máy lọc nước thương hiệu GE** tại Việt Nam: lọc tổng đầu nguồn (POE, vd bộ WH15A, WH30A), lọc tại vòi / máy uống nóng lạnh (POU, vd CTS20, CTD50, CTS10), làm mềm nước, lõi lọc thay định kỳ. Bán qua kênh trực tiếp, đại lý, sàn TMĐT, đối tác (vd Hannah Olala).

Vòng đời app phải phủ:

```
Bán (Sales) → Xuất kho (Kho) → Lắp đặt + kích hoạt bảo hành (Kỹ thuật/CSKH)
 → Bảo trì định kỳ, thay lõi → Khách báo lỗi → Ticket → Kỹ thuật xử lý → Báo cáo cho khách
Xuyên suốt: Việc (giao việc, nhắc việc) · Wiki (tài liệu) · Discord (đội giao việc và báo cáo ở đây)
```

Đội làm việc chủ yếu trên **Discord**. Bot tên **Bắp** đọc Discord và ghi vào app (tạo việc, tạo ticket, ghi sổ kho). App cũng gửi thông báo ngược vào Discord. **Mọi thứ do bot tạo phải hiện rõ nguồn "Discord ↗" kèm link tin gốc.**

## 2. Người dùng

| Ai | Làm gì | Màn dùng nhiều nhất | Thiết bị |
| --- | --- | --- | --- |
| **CEO** (chị Trang) | giao việc, duyệt, xem ai đang làm gì, xem lỗi sản phẩm | Bảng team (3 tab), Nghiệm thu, Báo cáo lỗi, Việc hôm nay | Laptop + điện thoại |
| **CSKH** (4 người, có người trực thay, CTV ca tối) | nhận báo lỗi, xử lý ticket, lên lịch bảo trì, gửi báo cáo cho khách | **Việc hôm nay**, ticket, hồ sơ khách, lịch bảo trì | Laptop |
| **Kỹ thuật viên / CTV lắp đặt** | đi nhà khách lắp, bảo trì, sửa | **Lịch của tôi**, đóng phiếu việc | **Điện thoại**, một tay, ngoài trời |
| **Sales** | tạo đơn, quản lý khách, khuyến mãi | Đơn hàng, khách hàng | Laptop |
| **Kho** | nhập/xuất, kiểm kê | Tồn kho, nhật ký | Laptop + điện thoại |
| **Admin** | nhân viên, phân quyền | Nhân viên, ma trận quyền | Laptop |

Một người có thể mang nhiều vai. **Nút/menu nào người dùng không có quyền thì ẩn hẳn**, không hiện rồi báo lỗi.

## 3. Hướng thẩm mỹ

- Phản hồi của CEO về bản cũ: *"design web xấu, khó nhìn"*, trang ticket *"khó theo dõi, khó edit"*. → **Thông tin chính lên trên, sửa ngay tại chỗ (không mở form riêng), ít bấm, ít chữ thừa.**
- CEO lo *"nhiều task quá sẽ loạn, rối màn hình, không biết xem cái gì trước"* → mỗi màn phải trả lời ngay **"việc gì cần làm trước"**: gấp/quá hạn nổi lên trên, phần còn lại thu gọn.
- Chuẩn thẩm mỹ CEO đã khen: mockup "Việc hôm nay" (`https://claude.ai/artifact/Che3fXmSbZoeFVb8yA3N56#hom-nay`) — lấy **bố cục, thứ tự thông tin, mật độ**; màu và chữ lấy từ DS mới, không lấy từ mockup. Hệ thiết kế cũ (`https://claude.ai/artifact/HPTEQYrb9ELXVVJof993zH`) **thay bằng** DS "GWT — OpenAI + shadcn" — không dùng token của bản cũ.
- Phong cách: công cụ làm việc gọn, sáng, mật độ vừa (như Linear / Notion / Height), không kiểu landing page. Nền sáng, chữ đậm rõ, bảng dễ quét. Đúng tinh thần OpenAI Apps SDK UI: trung tính đen–trắng–xám, màu chỉ dùng cho trạng thái và điểm nhận diện khu.
- Phần giải thích dài luôn **thu gọn được** (CEO muốn đọc ngắn, cần thì mở ra).

## 4. Hệ thiết kế

### 4.1 Token — dùng nguyên DS "GWT — OpenAI + shadcn"

Mọi giá trị lấy từ `tokens.json` của DS (tên token nguồn OpenAI + giá trị thật). Không đặt hex/px lẻ trong màn. Bảng dưới là tóm tắt để vẽ; chi tiết và lý do ánh xạ ở brand book của DS.

| Nhóm | Quy định |
| --- | --- |
| Nền / chữ | Nền trang `background` (#ffffff) · khối `card` = nền trang, tách bằng viền `border` · lớp nổi (menu, hộp thoại, panel) `popover` · vùng lùi `muted` (#f3f3f3) · chữ chính `foreground` (#0d0d0d) · chữ phụ `muted-foreground` (#5d5d5d) · placeholder `color-text-tertiary` |
| Nút chính | `primary` = **đen** (#181818), chữ trắng — OpenAI không dùng màu thương hiệu cho nút chính. Nút phụ `secondary` (xám nhạt), `outline`, `ghost`; nút xoá `destructive` (#e02e2a) |
| Hover / đang chọn | `accent` = nền trong suốt 8% (không phải màu nhấn) — item menu, dòng đang chọn, mục điều hướng |
| Màu khu | Việc `#0e8c9a` · CSKH `#b5642a` · Sales `#2f7d8a` · Kho `#5560c9` · Wiki `#8a52b8` · Nhân sự `#b0518f` · Kế toán `#3f8a6a` — **(đề xuất) mở rộng GWT `--khu`**, chỉ làm dấu nhận diện khu (vạch/chấm ở thanh điều hướng, biểu tượng khu trong launcher). **Không** dùng cho nút, focus, trạng thái |
| Màu trạng thái | Cặp nền/chữ của OpenAI theo vai: `success` · `warning` · `danger` · `info` · `discovery` · `secondary` (nền `color-background-<vai>-soft-alpha` + chữ `color-text-<vai>-soft`) |
| Tone trạng thái | 6 tone giữ tên cũ, map sang vai OpenAI — bảng 4.3 |
| Chữ | **Inter** (chốt 18/11) — tự host, có dấu tiếng Việt; dự phòng `ui-sans-serif, system-ui`. Số, mã, serial, SĐT, tiền: Inter + `tabular-nums`, **không mono**. Thang: 12 (meta, nhãn cột) · **14 mặc định** (control, bảng, menu) · 16 (đoạn văn, tiêu đề nhỏ) · 18/20 (tiêu đề khối, hộp thoại) · 24 (tiêu đề trang). Weight 400/500/600 |
| Kích thước control | Mặc định **32px** (`control-size-md`): nút, ô nhập, select, tab, mục điều hướng; 28px cho toolbar dày; 36px nút nổi bật; điện thoại tối thiểu 44px |
| Bo góc | Nút **pill** (mặc định OpenAI); nút trong ô bảng/toolbar dày bo 6–8px · ô nhập, select 8px · thẻ, khung bảng, menu, Alert 12px · hộp thoại 16px · chip trạng thái **4px** (Badge OpenAI, không bo tròn) |
| Viền / bóng | Viền 1px `border`; ô nhập viền `input`. Lớp nổi: `shadow` + `shadow-hairline`. Thẻ phẳng, không bóng |
| Focus | Viền ngoài 2px `ring` (xanh #0169cc), cách 2px, trên mọi thứ bấm được; ô nhập focus = viền đậm lên (alpha 50%) |
| Icon | Icon **Phosphor** (`@phosphor-icons/react` 2.1.7, MIT; chốt 18/11): bản `regular` cho mọi chỗ, bản `fill` cho mục đang chọn trên thanh icon (như ChatGPT); 16px trong ô nhập/menu/mục panel, 18px trên thanh icon và trong nút; **không dùng emoji làm icon** (riêng Thẻ lưu ý khách được dùng emoji loại như mục 6.1.6) |
| Định dạng | ngày `18/11/2026`, giờ `14:30`, tiền `1.250.000 đ`, SĐT `0912 345 678`, tuần bắt đầu Thứ 2 |
| Sáng / tối | DS có cả hai theme; **v2.0 vẽ nền sáng**. Bản tối chỉ khi màn được yêu cầu riêng |

### 4.2 Component cần vẽ (mỗi cái đủ 4 trạng thái: đang tải · rỗng · lỗi · bị khoá)

**Ghép từ component nền của DS trước, chỉ vẽ mới phần nghiệp vụ.** DS đã có (shadcn mặc diện mạo OpenAI, đủ trạng thái): Button · Input/Label/Textarea · Select · Combobox · Checkbox · Tabs · DropdownMenu · Dialog/AlertDialog · Sheet · Table (data table) · Sidebar · Badge · Alert.

| Component GWT | Dựng trên (DS) | Còn phải thêm vào DS |
| --- | --- | --- |
| `Tabs` | Tabs (kiểu SegmentedControl OpenAI) | — |
| `BoLocChon` | Select (≤10 mục) | — |
| `BoLocGoiY`, `OChonGoiY`, `OChonTimXa`, `ChonKhach`, `ChonSerial`, `TimToanCuc` | Combobox | ô tìm toàn cục ở thanh điều hướng |
| `BangDuLieu`, `ChonNhieuDong` | Table + Checkbox | ẩn/hiện/đổi thứ tự cột, lưu view, bản thẻ trên điện thoại |
| `ThanhHangLoat` | Button + Badge | thanh nổi khi chọn dòng |
| `ChipTrangThai`, `NhanNguon` | Badge | — |
| `HopThoai`, `XacNhan` | Dialog, AlertDialog | — |
| `PanelBen` | Sheet | — |
| `BannerLoi` | Alert (danger) + nút Thử lại | — |
| `TrangThaiRong` | trạng thái rỗng của Table | — |
| `ThongBao` (toast) | — | **thêm** (shadcn Sonner) |
| `ONgay`, `LocNgay` | — | **thêm** (shadcn Calendar/Date Picker; OpenAI có DatePicker để lấy diện mạo) |
| `KhungApp` | Sidebar, Tooltip, DropdownMenu, Button | thanh icon + panel menu + nút dock Bắp (mục 5) |
| Còn lại (`Kanban`, `LichThang`, `BangDieuPhoiTuan`, `BieuDo`, `NhatKy`, `OTaiTep`…) | token DS | vẽ mới bằng token, rồi đưa vào DS |

**Khung:** `KhungApp` (thanh icon, panel menu khu, launcher, ô tìm toàn cục ⌘K, tài khoản, nút dock Bắp) · `DauTrang` (tiêu đề, phụ đề, nút quay lại, khu nút hành động) · `TheNoiDung` (thẻ khối) · `Tabs` (ghi vào URL).

**Danh sách** (mẫu chuẩn mọi khu): `ThanhLoc` (ô tìm không dấu + chip lọc + lọc ngày + sắp xếp + dòng "Đang lọc: … · Xoá lọc", luôn ghi "đang thấy X / có Y") · `BoLocGoiY` (>10 lựa chọn thì **gõ để tìm**, không dùng select trần) · `LocNgay` (Hôm nay · Tuần này · Tháng này · 30 ngày · Tuỳ chọn) · `BangDuLieu` (ẩn/hiện/đổi thứ tự cột, lưu view cá nhân/chung, sắp xếp, phân trang, cột số căn phải; trên điện thoại thu thành thẻ) · `ChonNhieuDong` + `ThanhHangLoat` (thanh nổi khi chọn: "Đã chọn 12 · Đổi trạng thái · Gán người · Hỏi người làm · Xuất · Xoá") · `NutXuat` · `TheSo` (ô số liệu bấm được = áp bộ lọc) · `TrangThaiRong` (phân biệt "chưa có dữ liệu" với "bộ lọc không ra gì").

**Đối tượng:** `DauDoiTuong` (đầu trang chi tiết: mã (`tabular-nums`) · thuộc tính chính · ô sửa nhanh chọn là lưu · dòng tóm tắt) · `ChipTrangThai` (một component cho mọi trạng thái) · `NhanNguon` (App · Sheet · Discord ↗ · Bot) · `NhatKy` (dòng theo ngày: ai · lúc · nội dung · tệp · nguồn; thêm ngay trong khối; ngày lùi được) · `KhoiThongTin` (cặp nhãn–giá trị) · `Kanban` · `LichThang` · `BangDieuPhoiTuan` (hàng = kỹ thuật viên, cột = ngày) · `BieuDo` (cột, đường, Pareto, luôn kèm bảng số).

**Nhập liệu:** `OChonGoiY` (danh sách nạp sẵn, gõ lọc) · `OChonTimXa` (tìm trên server) · `ChonKhach` (tên · SĐT · tỉnh · địa chỉ; tạo mới có tra trùng SĐT) · `ChonSerial` (serial · model · khách · bảo hành; cho để trống) · `ChonKenh` (2 cấp) · `ONgay` · `OTien` (phân cách nghìn) · `OTaiTep` (kéo thả, xem trước ảnh, ≤50MB) · `OSuaTaiCho` (bấm sửa, Enter lưu, Esc huỷ) · `OSoanBinhLuan` (@nhắc tên, đính kèm) · `NhapCoXemTruoc` (dán Excel → bảng xem trước đánh dấu trùng/sai/mới → xác nhận) · `KhungForm`.

**Lớp phủ:** `HopThoai` · `XacNhan` (thay hộp confirm trình duyệt: ghi rõ hành động và hậu quả, nút đỏ ghi đúng việc, vd "Xoá đơn 261118-E004") · `PanelBen` (chỉ cho chi tiết việc) · `ThongBao` (toast) · `BannerLoi` (lỗi tải + Thử lại) · `TuLamMoi` ("cập nhật lúc 14:30:05").

**Nghiệp vụ:** `TheLuuYKhach` · `BonTruongTicket` · `ViecHomNay` · `CayChanDoan` · `XemTruocBaoCao` · `BangDongDon` · `MaTranGia` · `TheDuyetDiff` (trước → sau) · `MaTranThongBao` · `PanelLienKet` · `OSoanNhac` · `NghiemThuYeuCau` · `TongKetThang` · `TimToanCuc` · màn xác thực.

**Điện thoại (KTV):** `TheViecHienTruong` · `DongPhieuKTV` · `OQuetSerial` (camera quét mã vạch/QR hoặc gõ tay).

### 4.3 Bảng tone trạng thái

Tone → vai màu trong DS (Badge `soft`, luôn kèm chữ, không chỉ màu):

| Tone | Vai DS | Ghi chú |
| --- | --- | --- |
| `trung-tinh` | `secondary` (xám) | |
| `dang-lam` | `info` (xanh dương) | (đề xuất) bản cũ dùng màu khu; đổi sang `info` để một trạng thái chỉ có một màu ở mọi khu |
| `cho` | `warning` (cam) | |
| `xong` | `success` (xanh lá) | |
| `loi/khan` | `danger` (đỏ) | Khẩn: Badge `solid` (nền đỏ đặc, chữ trắng) |
| `thong-tin` | `discovery` (tím) | (đề xuất) thay chàm; OpenAI không có chàm |

| Loại | Giá trị → tone |
| --- | --- |
| Ticket | Mới `thong-tin` · Đang xử lý `dang-lam` · Chờ, Chờ khách xác nhận `cho` · Đóng `xong` · Huỷ, Trùng `trung-tinh` · **Khẩn** `loi/khan` (đặc, chữ trắng) |
| Ưu tiên | P1 `loi/khan` · P2 `cho` · P3 `thong-tin` · P4 `trung-tinh` |
| Lưu ý khách | 🔴 Phải đọc `loi/khan` · 🟡 Nên biết `cho` · ⚪ Thông tin `trung-tinh` |
| Việc | Cần làm `trung-tinh` · Đang làm `dang-lam` · Bị chặn `loi/khan` · Chờ duyệt `cho` · Xong `xong` |
| Đơn – hàng | Mới, Xác nhận `trung-tinh` · Chuẩn bị hàng, Đang giao, Đã giao chờ lắp `dang-lam` · Đã lắp đặt, Hoàn thành `xong` · Hoàn hàng, Huỷ `loi/khan` |
| Đơn – thanh toán | Chờ cọc, Chờ đối soát, Còn nợ `cho` · Đã cọc `dang-lam` · Đã thu đủ `xong` |
| Bảo hành | Còn hạn `xong` · Hết máy, còn lõi `cho` · Hết cả hai `loi/khan` · Chưa kích hoạt `trung-tinh` |
| Lượt bảo trì / thay lõi | Còn hạn `trung-tinh` · Sắp đến hạn (≤30 ngày) `cho` · Quá hạn `loi/khan` · Đã xong `xong` |
| Phiếu việc KTV | Hẹn `dang-lam` · Xong `xong` · Huỷ `trung-tinh` |
| Kho | Đã duyệt `xong` · Chờ duyệt mã `cho` · Bỏ qua `trung-tinh` · Sắp hết / tồn âm `loi/khan` |
| Yêu cầu duyệt | Chờ duyệt `cho` · Đã duyệt `xong` · Từ chối `loi/khan` |
| Đối soát | Khớp `xong` · Chưa đối soát `cho` · Lệch `loi/khan` |

## 5. Khung app

**Đã chốt 18/11 — thanh icon + panel menu, Bắp dock góc phải** (prototype F, nhánh `prototype/v2-khung`). Đoạn "thanh 2 tầng" dưới đây là phương án cũ, giữ để đối chiếu; khi vẽ theo khung mới:
- Thanh icon trái 52px nền `muted`: logo · icon khu (đang mở = ô 36px nền `alpha-05`, icon đen; icon thường xám tertiary; màu khu chỉ ở chấm trước tên khu; chấm đỏ = việc gấp, rê chuột hiện nhãn) · lưới "Tất cả khu" · ⚙️ · avatar ở đáy.
- Panel menu 288px nền `sidebar`, cùng vùng nội dung thành một tấm bo góc trên-trái 12px: tên khu 18px/600 + 🔔 + 🔍 (⌘K) · nút tạo · trang của khu (mục 30px) · Bộ lọc đã lưu · Gần đây. Nhãn nhóm 14px thường màu nhạt.
- Bảng nhẹ: dòng 50px, kẻ dòng `alpha-05` thụt 12px, rê = nền `alpha-05` bo 12px; tab viên thuốc 36px; ô tìm 240×32; nút công cụ tròn 32px.
- Bắp: nút tròn 48px góc dưới phải, số đỏ = gợi ý chủ động; bấm/⌘J mở khung chat nổi 400px. Khung chat = cùng một Bắp với Discord (trả lời giống nhau ở hai nơi), thay trợ lý nội bộ cũ bên ERP.
- Điện thoại: ☰ mở ngăn kéo (thanh icon + panel), Bắp toàn màn.

**(Cũ) Desktop — thanh điều hướng 2 tầng:**
- Tầng 1 (52px, nền `#0c2a2e` — **(đề xuất) mở rộng GWT `--nav`**, DS không có màu nền tối cho thanh điều hướng; phương án khác: nền `sidebar` sáng của DS, chờ chốt mục 10): logo GWT · các khu (Việc · CSKH · Sales · Kho · Wiki), khu đang mở đánh dấu bằng màu khu (`--khu`) · **ô tìm toàn cục** (gõ SĐT, tên khách, serial, mã đơn `261118-E004`, mã ticket `TK-2611-042` → gợi ý theo loại → Enter mở) · nút launcher (lưới các khu, khu chưa có — Nhân sự, Kế toán — hiện xám "sắp có") · ⚙️ Quản trị · avatar (đổi mật khẩu, đăng xuất).
- Tầng 2 (46px, nền `background`, mục 32px kiểu ghost — hover/đang mở dùng `accent`): các trang của khu đang mở; trang nhiều thì gom nhóm thả xuống. Ví dụ CSKH: **Việc hôm nay** · Ticket & lỗi ▾ · Khách hàng ▾ · Bảo hành ▾ · Bảo trì ▾ · Kỹ thuật ▾.

**Điện thoại:** thanh trên gọn (logo · tìm · avatar), tầng 2 cuộn ngang. **Kỹ thuật viên thuần** đăng nhập chỉ thấy một màn: Lịch của tôi (6.3.1), có thanh dưới: Hôm nay · Tuần · Tài khoản.

## 6. Danh sách màn

Ký hiệu: **P1** = vẽ trước · **P2** = vẽ sau · 📱 = cần bản điện thoại.

### 6.1 CSKH (P1 — đặc tả CEO đã chốt 17/11/2026)

#### 6.1.1 Việc hôm nay — màn mở đầu ca của CSKH · P1 📱

**Câu hỏi màn trả lời:** "Bắt đầu ca, tôi phải làm gì trước?" Dùng được cho CSKH chính, người trực thay, CTV ca tối.

Khối theo thứ tự:
1. **Ca khẩn** — ticket Khẩn đang mở.
2. **Việc tiếp theo quá hạn** — ticket có "việc tiếp theo" mà hạn đã qua.
3. **Lời hứa đến hạn** — điều đã hứa với khách hôm nay (vd "Gọi lại báo giá linh kiện trước 16h").
4. **Lịch kỹ thuật hôm nay** — các phiếu việc KTV trong ngày (giờ · khách · KTV · loại việc).
5. **Việc "Chờ" tới ngày xem lại** — ticket đang chờ khách/vật tư/hãng đến ngày hẹn xem lại.
6. **Bàn giao ca** — việc tạo trong ca tối/cuối tuần chưa ai nhận; việc đến hạn ở ca sau.

Mỗi dòng: mã ticket · khách · việc cần làm · hạn · chủ ticket; ⚠️ nếu khách có lưu ý đỏ. Bấm dòng → mở ticket. Trên đầu: số đếm từng khối. Rỗng: "Không còn gì gấp — tốt lắm."

#### 6.1.2 Danh sách ticket · P1

- `ThanhLoc`: tìm (mã, khách, SĐT, serial, mô tả) · trạng thái · ưu tiên · loại · nhóm lỗi · chủ ticket · kỹ thuật · tỉnh · ngày tạo.
- **Tab nhanh**: Tất cả · Của tôi (theo chủ ticket) · Thiếu serial · Mở quá lâu · Chờ.
- Cột: Mã · Khách (+ tỉnh) · Máy · Loại · Trạng thái · Ưu tiên · **Số ngày mở** (đã đóng thì tính tới ngày đóng; quá 7 ngày tô màu) · Chủ ticket · Việc tiếp theo + hạn (quá hạn tô đỏ) · Nguồn (App / Discord ↗ / Sheet CTS20 / Pancake).
- Nhãn "Mới" cho ticket có hoạt động trong 24h; Khẩn luôn lên đầu.
- Chọn nhiều → thanh hàng loạt: đổi trạng thái, đổi chủ, xuất.

#### 6.1.3 Trang một ticket · P1 📱

Bố cục 2 cột (điện thoại xếp dọc theo thứ tự đầu → trái → phải).

**Đầu trang (`DauDoiTuong`):**
- `TK-2611-042` · Loại "Rò nước đáy" · Máy CTS20 · Hà Nội · nhãn nguồn.
- Lưu ý 🔴🟡 của khách (gọn, bấm mở thẻ đầy đủ).
- **Ô sửa nhanh** (chọn là lưu): Trạng thái (+ "lý do chờ" khi chọn Chờ: khách · KT · vật tư · hãng · duyệt) · Ưu tiên · Khẩn · Chủ ticket (danh sách người CSKH: Hiệp, Kiều Trang, Hiền, Tuyết Trang) · Kỹ thuật.
- **4 trường bắt buộc khi ticket còn mở** (nổi bật, thiếu thì viền đỏ, không cho lưu): **Chủ ticket · Việc tiếp theo · Người đang phải làm · Hạn**.
- Dòng tóm tắt: "Mở 5 ngày · 2 lần báo · lần cuối 16/11 · khách hỏi lại 1 lần".

**Cột trái:**
- **Nhật ký theo lần báo:** mỗi lần khách báo là một khối có ngày (chọn được ngày đã qua) + mô tả khách báo; **dưới mỗi lần có nhiều dòng xử lý**, mỗi dòng có ngày (vd "17/11 – Đã gửi video hướng dẫn tắt chế độ lạnh", "18/11 – Đang chờ khách gửi ảnh đáy máy"). Nút "+ Lần báo mới", "+ Cập nhật xử lý".
- **Máy & lỗi:** mỗi máy một dòng: serial (hoặc dòng vàng "Chưa có serial — thợ kiểm tra xong bấm Sửa để điền") · model · mã lỗi · hướng xử lý (đang xử lý / đã xử lý / không lỗi) · bảo hành.
- **Trao đổi:** nhật ký trao đổi có đính kèm ảnh/video/PDF.
- (Đợt 2) **Chẩn đoán từ xa** (`CayChanDoan`): đi từng bước hỏi của mã lỗi → kết thúc "Xong từ xa" hoặc "Cử KT".

**Cột phải:**
- Khách (tên, SĐT bấm gọi, tỉnh, link hồ sơ) · Máy & bảo hành.
- **Lời hứa** với khách: nội dung · hạn · giữ/trễ.
- Nút **"Khách hỏi lại"** (đếm số lần khách phải nhắc).
- Chi phí & vật tư (hạng mục, có thu phí, số tiền). Ghi chú nhỏ: *CSKH chỉ đề xuất miễn phí/giảm giá — CEO duyệt*.
- Nút chính: **"Tạo phiếu việc kỹ thuật"**.
- (Đợt 3) khi đóng mỗi máy: **nguyên nhân thật** (linh kiện hỏng · lắp đặt · nước nguồn · khách dùng sai · vận chuyển · không lỗi) + **đã làm gì** (thay linh kiện · chỉnh/siết · vệ sinh · hướng dẫn · đổi máy).

#### 6.1.4 Tạo ticket · P1

Bước 1: gõ SĐT hoặc tên → `ChonKhach` → **bật Thẻ lưu ý khách (🔴🟡), phải bấm "Đã đọc" mới đi tiếp**. Bước 2: máy (chọn từ máy của khách, hoặc **để trống serial** — bổ sung sau). Bước 3: loại ticket (gõ để tìm, cuối danh sách "+ Thêm loại mới…"; bảo trì/thay lõi không có ở đây) · mô tả khách báo · ngày khách báo · Khẩn. Bước 4: 4 trường bắt buộc (Chủ · Việc tiếp theo · Người làm · Hạn). Một màn, không nhiều trang.

#### 6.1.5 Hồ sơ khách 360 · P1 📱

Đầu: tên · mã khách · SĐT (+ SĐT phụ) · tỉnh/địa chỉ · kênh · nhãn VIP/đại lý · **Thẻ lưu ý khách đầy đủ**.
Tabs: **Tổng quan** (máy đang dùng + bảo hành, ticket đang mở, lượt bảo trì sắp tới, lõi sắp/quá hạn) · Đơn đã mua · Máy · Ticket · Bảo trì & lõi · Hồ sơ nước (chỉ số TDS, pH, độ cứng, Clo theo thời gian — biểu đồ) · Lịch sử thay đổi.

#### 6.1.6 Thẻ lưu ý khách (component, vẽ riêng) · P1 📱

Một lưu ý = **loại** + **mức** + **1 câu** + ai cần thấy + hết hạn (tuỳ chọn) + ghi bởi · ngày · nguồn.
- Loại: 📞 Liên lạc · 🏠 Vào nhà & công trình · 🔧 Điều kiện kỹ thuật · 🤝 Cam kết đã hứa (chỉ sau khi CEO duyệt) · ⚠️ Rủi ro / theo dõi · 🙂 Cách phục vụ khách thích.
- Mức: 🔴 Phải đọc · 🟡 Nên biết · ⚪ Thông tin.
- Câu ghi **hành vi cụ thể, không phán xét**: ✅ "Khách muốn xác nhận chi phí bằng tin nhắn trước khi làm" · ❌ "Khách khó tính". Ô nhập có gợi ý này.
- **Lưu ý tự động** (máy sinh, khác màu nền, không sửa được): đang có khiếu nại · máy hỏng lại trong 30 ngày · bảo hành 2 lần cùng lỗi · lõi quá hạn N ngày · bảo hành hết sau ≤30 ngày · lần trước chấm ≤3 sao · VIP · mua qua đại lý.
- Sửa = gỡ cái cũ + ghi cái mới (xem được lịch sử). Tối đa 3 lưu ý đỏ.
- 4 dạng hiển thị: đầy đủ (hồ sơ khách) · gọn 🔴🟡 (đầu ticket) · **hộp bật "Đã đọc"** (tạo ticket) · bản KTV chỉ 🏠🔧🔴 (phiếu việc).

#### 6.1.7 Báo cáo lỗi · P1

Tab **Theo nhóm lỗi**: 4 nhóm Main · Rò rỉ nước · Chất lượng nước · App (số ticket mỗi nhóm) → bấm nhóm → các máy (SKU) gặp lỗi đó + số ticket → bấm máy → danh sách ticket. Nhóm "Không phải lỗi" (bảo trì, thay lõi, hướng dẫn) tách riêng, không tính vào báo cáo.
Tab **Theo máy (SKU)**: mỗi model: máy đang chạy · máy từng lỗi · % → bấm model → nhóm lỗi đã có ticket → bấm nhóm → serial đang lỗi.
Tab **Theo tháng**: tần suất theo nhóm × model × tháng (biểu đồ + bảng). (Đợt 3) thêm **Pareto**, máy bị ảnh hưởng/model (1 máy báo 5 lần = 1 máy), hỏng lại, nút **"Xuất báo cáo tháng cho hãng"**.

#### 6.1.8 Danh mục lỗi · P2

Bảng mã lỗi: mã · tên · nhóm (4 nhóm + Không phải lỗi) · model áp dụng · cách ghi khác (từ khoá tự nhận) · hướng xử lý · trạng thái (chờ duyệt / đã duyệt / ngừng). Nhập Excel có xem trước. (Đợt 2) mỗi mã có **cây chẩn đoán**: các bước hỏi · kết quả mỗi nhánh · vật tư mang theo · video · phiên bản · KT trưởng duyệt.

#### 6.1.9 Báo cáo sau dịch vụ · P2 📱

Màn xem trước báo cáo app tự soạn sau khi KTV đóng phiếu: lời chào · đã làm gì · **bảng chỉ số nước trước/sau có giải thích ngắn** · ảnh trước/sau · lõi đã thay · lần tới khi nào · hotline. CSKH sửa câu chữ → **Gửi Zalo** hoặc **Chép báo cáo**. Chặn gửi khi thiếu ảnh/chỉ số (báo rõ thiếu gì). Kèm nút chấm sao cho khách. 4 mẫu: lắp đặt · bảo trì lọc tổng · thay lõi · sửa chữa.

#### 6.1.10 Lịch bảo trì · P2

Danh sách + **lịch tháng** (tuần bắt đầu Thứ 2): mỗi lượt = khách · máy · lần thứ mấy/tổng · trạng thái (còn hạn / sắp đến hạn / quá hạn / đã xong). Bấm lượt → ghi xong + số đo nước → hệ thống **đề xuất dời các lượt sau** (hiện trước → sau, bấm đồng ý mới áp). Màn **Gắn gói vào khách** (ghép dữ liệu cũ — không phải bản đồ). Màn **Lên lịch & gói** (ngày bắt đầu, chu kỳ, số lần; tự né T7/CN theo vùng).

#### 6.1.11 Điều phối kỹ thuật · P2

`BangDieuPhoiTuan`: hàng = KTV (có CTV freelancer), cột = Thứ 2 → CN, ô = phiếu việc (giờ · khách · loại việc). Ngày nghỉ tô xám, **trùng lịch cảnh báo**, kéo phiếu sang ô khác để đổi người/ngày. Tạo phiếu: KTV · ngày giờ · khách · địa chỉ · các việc (lắp máy · bảo trì · ticket · thay lõi · khảo sát · thu tiền · khác).

### 6.2 Việc (P1)

#### 6.2.1 Việc của tôi · P1 📱

Nhóm theo hạn: **Quá hạn · Hôm nay · Tuần này · Sắp tới · Không hạn**. Mỗi việc: tiêu đề · ưu tiên · hạn · trạng thái · chip liên kết (khách / ticket / đơn) · nguồn (App / Discord ↗). Ô "Xong tuần này: 12". Tạo việc nhanh ở đầu.

#### 6.2.2 Bảng team — 3 tab CEO yêu cầu · P1

**Câu hỏi màn trả lời (CEO):** "Mọi người đang làm gì, cái gì gấp, cái gì để lâu rồi quên?"
- Tab **Mọi người**: lọc theo người; cột Cập nhật cuối.
- Tab **Gấp**: quá hạn + hạn hôm nay + việc gấp (P1).
- Tab **Lâu không đụng**: việc lâu không cập nhật (có thể đã xong mà chưa báo) — gom lại để **xử lý hàng loạt**.
- Mỗi tab có chế độ **Danh sách** và **Kanban** (Cần làm · Đang làm · Bị chặn · Chờ duyệt · Xong, kéo thả).
- Thanh hàng loạt: đổi trạng thái · gán người · ưu tiên · hạn · **"Hỏi người làm"** (bot nhắn hỏi trên Discord người đang giữ các việc được chọn) · xoá (xác nhận 2 bước, nói rõ mất bao nhiêu việc con, bình luận).

#### 6.2.3 Chi tiết việc (panel bên phải) · P1

Tiêu đề · mô tả · trạng thái · ưu tiên · hạn · người + vai (người chịu trách nhiệm · người làm · người duyệt · người theo dõi) · nguồn (Discord ↗ + link tin gốc) · **việc con** · **phụ thuộc** (chặn / bị chặn) · chip khách/ticket/đơn · **lời nhắc** (giờ · người · có nhắc người giao · trạng thái chờ giờ / đã gửi) · bình luận có **@nhắc tên** · lịch sử.

#### 6.2.4 Nghiệm thu Task AI · P1

**CEO:** báo cáo phải có "(1) các yêu cầu từ chị đưa ra, (2) nghiệm thu xem ở đâu — để chị click vào xem và comment thẳng chỗ nào cần sửa hoặc hiểu sai"; *đừng báo "đã xong" mà chị không biết đã xong hết yêu cầu chưa, việc đang làm thuộc mục nào.*
- Gom theo app (CSKH App · Sales App · Work…), mỗi yêu cầu đánh số (vd "2.2.1 Tạo ticket khi chưa có serial").
- Mỗi yêu cầu: trạng thái (chưa làm / đang làm / chờ nghiệm thu / đạt / cần sửa) · người làm · link tin gốc Discord · **link xem kết quả** · ảnh minh hoạ · **luồng comment của CEO** ngay trên yêu cầu.
- Thanh tiến độ mỗi app: "8/14 yêu cầu đạt".
- Phần giải thích dài thu gọn/mở rộng.
- Tab phụ **Ý tưởng cho App**: ý tưởng Claude đề xuất từ việc làm tay hằng ngày của Sales/CSKH (theo ngày, người duyệt) — tách khỏi yêu cầu; nút "Chuyển thành yêu cầu".

#### 6.2.5 Tổng kết tháng · P2

Bảng theo người: số việc xong · thời gian hoàn thành trung bình (từ lúc giao) · số việc trễ · biểu đồ nhỏ. Dưới: danh sách việc đã xong trong tháng, mỗi việc có **ô nhận xét kết quả** của CEO. Chọn tháng; nút "Gửi lên Discord".

#### 6.2.6 Việc tự sinh · P2

Danh sách luật (máy lắp chưa kích hoạt bảo hành · ticket chưa ai nhận quá 4 giờ · lượt bảo trì tới hạn): bật/tắt · tham số · người nhận · **Xem trước** (sẽ sinh bao nhiêu việc) · Chạy ngay.

### 6.3 Kỹ thuật viên — điện thoại (P1)

#### 6.3.1 Lịch của tôi · P1 📱

Danh sách phiếu việc hôm nay theo giờ (`TheViecHienTruong`): giờ · khách · **địa chỉ (bấm mở bản đồ)** · **SĐT (bấm gọi)** · loại việc · ghi chú · lưu ý 🏠🔧🔴 của khách. Nút lớn **Xong** và **Hẹn lại** (chọn ngày mới + lý do). Chuyển ngày: Hôm qua · Hôm nay · Ngày mai. Chữ to, nút to, dùng một tay ngoài trời.

#### 6.3.2 Đóng phiếu việc · P1 📱

Theo loại việc:
- Việc đã làm (chọn nhiều).
- **Serial** — bắt buộc với lắp máy: **quét camera** hoặc gõ tay; báo ngay nếu serial thuộc khách khác.
- Ảnh trước / ảnh sau.
- Chỉ số nước trước / sau: TDS, pH, độ cứng, Clo (bàn phím số).
- Lõi / linh kiện đã thay · muối đã đổ · phí đã thu.
- Ghi chú cho khách.
- **"Có gì cần nhớ cho lần sau?"** → thành lưu ý khách mới.
- Nút **Hoàn tất**. Mất sóng vẫn lưu tạm, có mạng thì gửi.

### 6.4 Sales (P2)

#### 6.4.1 Danh sách đơn · P2

Tab POE · POU · Khác · Tặng. Cột: mã `261118-E004` · ngày · khách · kênh · sản phẩm · tổng tiền · tình trạng hàng · thanh toán · nguồn (App / Sheet). Lọc ngày, tình trạng, thanh toán, kênh, sản phẩm.

#### 6.4.2 Tạo / sửa đơn · P2

Khách (`ChonKhach`, tra trùng SĐT, tạo mới ngay) · ngày · kênh 2 cấp · **bảng dòng đơn** (`BangDongDon`: mã sản phẩm gõ để tìm · SL · đơn giá **đã gồm VAT** · VAT 0/8/10%/KCT/KAD · tick Quà · ghi chú; **giá gợi ý** theo bậc đại lý / khuyến mãi tự điền dòng chưa gõ tay, có chip giải thích "Giá đại lý cấp 2" / "CTKM tháng 11 −10%"; mời thêm quà của chương trình; cảnh báo vàng khi bán dưới giá duyệt) · dòng DVBT: SL = số lần bảo trì · tổng trước VAT / VAT / sau VAT · **các ô theo dõi** ẩn/hiện theo loại đơn (POE nhiều ô lắp đặt; POU/Khác ô đối soát) gom thành nhóm thu gọn.

#### 6.4.3 Chi tiết đơn · P2

Đầu: mã · khách · trạng thái hàng + thanh toán (sửa nhanh) · **thanh tiến trình chuỗi**: Xác nhận → Xuất kho → Đang giao → Chờ lắp → Đã lắp → Bảo hành đã kích hoạt → Gói bảo trì (bước nào hệ thống tự làm thì ghi "tự động"). Dòng sản phẩm · tiền · thanh toán · phiếu xuất · phiếu việc lắp · máy đã lắp.

#### 6.4.4 Đơn Hannah Olala · P2

Cấu hình: danh sách **link Google Sheet đang theo dõi** (1–2 file/tháng, thêm/gỡ) · lần đọc cuối · số đơn mới. Danh sách đơn HO đã nhận: mã đơn HO · trạng thái bên HO · đã đẩy sang sổ GWT chưa · cảnh báo "HO đã huỷ sau khi nhập".

#### 6.4.5 Khách hàng, Khuyến mãi, Bảng giá · P2

Danh sách khách (lọc: cần dọn · thiếu SĐT · kênh · trùng SĐT). Khuyến mãi: danh sách (Nháp · Ban hành · Kết thúc) + form (kiểu giảm · mức · kênh bắt buộc · nhóm khách · loại trừ · cộng dồn · quà) + duyệt. Bảng giá: **ma trận bậc × mã** (NPP · Đại lý · Giới thiệu), nhập % hoặc giá, hiện giá niêm yết để so.

### 6.5 Kho (P2)

Tồn kho theo mã (tồn · tối thiểu · cảnh báo sắp hết/âm · số dòng chờ duyệt; chọn kho Nguyễn Xiển / HCM) · Nhật ký nhập/xuất (nguồn Discord ↗ với biểu tượng ✅/⏳/❌ như bot thả; dòng sửa tay có khoá) · **Chờ duyệt mã** (tên hàng bot không nhận ra → chọn mã gợi ý, tick "nhớ tên này", hoặc Bỏ qua) · Kiểm kê (nhập số đếm → tự sinh dòng điều chỉnh) · Báo cáo tháng (đầu kỳ · nhập · xuất · điều chỉnh · cuối kỳ) · Lịch sử sửa (`TheDuyetDiff`).

### 6.6 Quản trị và hệ thống (P2)

- **Hàng chờ duyệt**: thẻ `TheDuyetDiff` (trước → sau, ai đề xuất, lý do) · Duyệt / Từ chối (bắt lý do) · duyệt hàng loạt · yêu cầu xuất dữ liệu cá nhân (duyệt xong tải một lần).
- **Nhân viên**: danh sách (vai, hoạt động, **Discord ID**) · người chờ duyệt (đăng nhập lần đầu) · mời nhân viên.
- **Ma trận phân quyền**: hàng = mã quyền gom theo khu, cột = 14 vai, ô tick.
- **Cấu hình thông báo Discord** (`MaTranThongBao`): hàng = loại thông báo (được giao việc · sắp tới hạn · quá hạn · được @nhắc · đơn HO mới · VTP giao xong · ticket Khẩn · ticket mở quá lâu · kho sắp hết · chờ duyệt…), cột = kênh / người nhận, ô bật/tắt.
- **Nhật ký thao tác**: ai · lúc · hành động · đối tượng · nguồn (app / bot + người ra lệnh) · chi tiết trước → sau.
- **Đăng nhập**: Google `@gwt.vn` hoặc email + mật khẩu · màn "Đang chờ duyệt" · đổi mật khẩu bắt buộc lần đầu · quên mật khẩu.

### 6.7 Wiki (P2)

Trang chủ 9 khu (Sản phẩm · Marketing video · Kho video · Kiến thức nền · Công việc chung · Sales · CSKH · Vận hành · Tài chính) · một kiểu **trang tài liệu** dùng cho mọi bài (mục lục bên, đọc dễ, phần dài thu gọn được) · tìm kiếm. **Chỉ đọc** — không có trình soạn thảo.

## 7. Mẫu tin bot Discord (vẽ dạng tin nhắn Discord)

1. **Giao việc** — chị Trang: "@Hiệp kiểm tra lại lịch bảo trì tháng 12 của khách Q.Ba Đình, hạn thứ 6". Bot reply: ✅ *Đã tạo việc* · tiêu đề · người nhận @Hiệp · hạn 21/11 · link Work · tag @chị Trang.
2. **Báo cáo không rõ việc** — Hiệp: "xong rồi chị". Bot: *Bạn báo cáo việc nào?* + 3 nút việc đang mở của Hiệp.
3. **Nhắc việc** — chị: "sáng mai 9h nhắc anh Như (nhắc cả chị) kiểm tra thông tin hợp đồng với khách". Bot xác nhận 4 ý: ⏰ 9:00 19/11 · 👤 @Như · 🔔 có tag chị · 📝 nội dung. Đúng giờ: "@Như @chị Trang — nhắc: kiểm tra thông tin hợp đồng với khách · link việc".
4. **Việc của tôi** — nhân viên hỏi Bắp → 3 nhóm **Cần gấp · Cần làm · Để lâu rồi quên**, mỗi việc 1 dòng: tên · hạn · link.
5. **Thông báo app**: "📦 Đơn Hannah Olala mới cần xử lý: HO-1123 · CTS20 × 1 · Hà Nội" · "🚚 VTP đã giao đơn 261118-E004" · "🔴 Ticket TK-2611-042 Khẩn chưa ai nhận".

## 8. Dữ liệu mẫu (giả)

- Khách: Nguyễn Văn An (0912 345 678, Hà Nội) · Trần Thị Bình (0987 654 321, TP.HCM) · Công ty TNHH Minh Phát (Đà Nẵng).
- Máy: CTS20 (máy nóng lạnh), CTD50, CTS10, bộ lọc tổng WH15A, WH30A; serial dạng `V9L2304A1123`.
- Ticket: `TK-2611-042` "Rò nước đáy máy CTS20" · `TK-2611-043` "Màn hình báo E4" · `TK-2611-044` "App không kết nối wifi".
- Đơn: `261118-E004` (POE, bộ WH15A + 4 lần bảo trì) · `261118-U012` (POU, CTS20).
- Nhân viên: Hiệp, Kiều Trang, Hiền, Tuyết Trang (CSKH) · anh Như, anh Tuấn (KTV, tên ví dụ) · Dũng.

## 9. Không vẽ

- Màn đã có nhãn "sắp có" nhưng chưa có yêu cầu: Báo giá, Hợp đồng, Doanh số Sales, Lịch & Dự án (khu Việc), module Kế toán và Nhân sự.
- Bản xem trước dạng drawer song song cho thứ đã có trang chi tiết.
- Trình soạn thảo wiki.

## 10. Câu chưa chốt (vẽ theo phương án đề xuất, ghi chú lại để CEO chọn)

- Ngưỡng "mở quá lâu" của ticket: đề xuất **7 ngày**.
- Việc "gấp" = ưu tiên P1 (không thêm nhãn riêng).
- Nhật ký ticket: lần báo mới nhất lên trên.
- Trang ticket: danh sách trường đặt trên cùng sẽ chốt sau khi hỏi Hiền — vẽ theo mục 6.1.3.
- Tối đa 3 lưu ý đỏ / khách; lưu ý KTV ghi thì hiện ngay (chưa có bước duyệt).
- Mockup 9 màn CSKH riêng của CEO (có số thật) — nếu CEO đưa thì ưu tiên theo đó.
- **Theo DS mới (đề xuất, chờ chốt):** nền thanh điều hướng tầng 1 giữ `#0c2a2e` hay chuyển nền sáng · màu khu chỉ làm dấu nhận diện (không tô nút/focus) · `dang-lam` = `info`, `thong-tin` = `discovery` · ~~font hệ thống thay Geist~~ → **Inter (chốt 18/11)** · nút pill.
- **Độ tương phản chưa đạt ngay trong nguồn OpenAI** (vẽ theo nguồn, ghi chú lại): viền ô nhập 1,42:1 và viền Checkbox 1,6:1 (dưới 3:1); chữ Badge success 4,05:1; chữ lỗi ở nền tối 3,52:1. DS đã có phương án sửa kèm số đo ở mục "Quyết định còn mở".

## 11. Đầu ra mong muốn

1. **Bổ sung vào DS "GWT — OpenAI + shadcn"** (không tạo DS mới): bảng tone trạng thái 4.3, các component mục 4.2 cột "Còn phải thêm" và component nghiệp vụ, đủ trạng thái.
2. **Khung app** desktop + điện thoại.
3. Màn **P1** đầy đủ trạng thái, rồi màn **P2**.
4. Mẫu tin bot Discord.
5. Mỗi màn kèm 2–3 dòng ghi chú: màn trả lời câu hỏi gì, ai dùng, thao tác chính.
