# Học hành vi Notion: Xem nhanh, thuộc tính, bảng (đo 27/11/2026)

Đo trên Notion web (app.notion.com, theme tối, khung 1424×805) bằng Chrome debug qua CDP: `getComputedStyle`,
`getBoundingClientRect`, di chuột/bấm thật, chụp ảnh. Chỉ học **hành vi**, không chép giao diện (luật B: "học app tham
chiếu = học hành vi"). Cột "Đề xuất": **Học** = nên làm · **Có** = mình đã có · **Bỏ** = không hợp app nghiệp vụ.

## 1. Khung xem nhanh

| Notion làm gì | Mình đang làm gì | Đề xuất |
|---|---|---|
| Có 3 kiểu mở: side peek, center peek, full page. Nút "Switch peek mode" để đổi | Chỉ thẻ nổi bên phải + ⤢ mở trang | Bỏ: một kiểu là đủ |
| Side peek cao hết màn, rộng 50% (712/1424), viền trái, **không phủ nền**. Bảng bên trái vẫn bấm được, bấm dòng khác thì đổi bản ghi trong peek | Thẻ nổi 440, cách mép 16 (luật CEO), không phủ nền, bảng vẫn bấm được | Có (giữ luật cách mép 16) |
| Dòng đang mở có viền xanh 1px quanh dòng; chip OPEN đổi thành CLOSE | Dòng đang xem có nền nhạt | Học: thêm viền/nhãn rõ hơn cho dòng đang mở (cân nhắc, chưa làm) |
| Center peek: hộp 975 rộng, bo 12, viền 1px + bóng nhẹ, nền phủ `rgba(15,15,15,.8)` | Không có | Bỏ |

## 2. Đầu thẻ

| Notion | Mình | Đề xuất |
|---|---|---|
| Trái: » đóng · ⤢ mở trang · (khi hover) đổi kiểu peek · ↑ ↓. Phải: Share · link · ★ · ⋯. Nút 24–28, bo 6, nền trong | » ⤢ \| ↑ ↓ bên trái, mã việc theo sau | Có |
| **↑ ↓ và nút đổi kiểu chỉ hiện khi rê chuột vào đầu thẻ** | Luôn hiện | Cân nhắc. Đang hiện luôn cũng dễ thấy hơn cho nhân viên mới |
| Tooltip 2 dòng: tên + phím tắt nhạt ("Close · Escape", "Open in full page · Ctrl+↵", "Previous page · Alt+K", "Next page · Alt+J") | Có Esc, ↑/↓, j/k (`xem-nhanh.tsx:121`). Tooltip chưa ghi phím | **Học**: tooltip ghi phím tắt; thêm Ctrl+Enter = mở trang |
| ⋯ mở menu: ô **tìm thao tác** trên cùng, mục cao 28 có phím tắt bên phải, chia nhóm bằng vạch. **Chân menu: "Last edited · người · giờ · số từ"** | Không có ⋯ (đã bỏ 27/11 vì thừa) | **Học** chân "sửa lần cuối" (xem §6) |

## 3. Tiêu đề

| Notion | Mình (sau 27/11) | Đề xuất |
|---|---|---|
| Side peek 32/38,4 đậm 700. Trang đầy đủ hoặc center peek 40/48 | 32/38 600 (`--text-heading-xl`) | Có. 600 theo token DS |
| Sửa thẳng tại chỗ, con trỏ ngay trên chữ, không viền | `Textarea variant="tran"` | Có |
| Rê vào vùng trên tiêu đề hiện "Add icon · Add cover · Customize layout" | Không | Bỏ |

## 4. Hàng thuộc tính (bài học chính về cỡ chữ)

| Đo | Notion | Mình trước 27/11 | Mình sau 27/11 |
|---|---|---|---|
| Chữ nhãn | 14/20, màu nhạt `#ADA9A3` (tối) | 12/18 | **14/20** |
| Icon nhãn | 16, cùng màu nhãn, cách chữ 6 | 14 | **16** |
| Cột nhãn | 160 (đệm 0 6) | 96–128 | **112–160** |
| Ô nhãn / ô giá trị | cao 34, khoảng giữa các dòng 4 → **bước 38** | 32 + 2 = 34 | 32 + 6 = **38** |
| Chữ giá trị | 14/21 | 14/20 | 14/20 |
| Ô trống | "Empty" nhạt hơn nhãn một bậc (`#7D7A75`) | "Chưa có" hoặc tên trường, màu tertiary | Có |

Hành vi:

| Notion | Mình | Đề xuất |
|---|---|---|
| Rê vào **nhãn**: nền nhạt (trắng 5,5%), bo 6, đổi màu trong 0,02s; **icon thành tay kéo ⋮⋮** (kéo đổi thứ tự) | Nhãn đứng yên | Bỏ kéo (thứ tự trường do app định). Chưa học nền hover cho nhãn |
| Bấm **nhãn**: menu Rename · Edit property · Property visibility · Duplicate · Delete · Customize layout | Không | Bỏ (người dùng không sửa cấu trúc) |
| Rê vào **giá trị**: nền nhạt bo 4, con trỏ tay | Ô sửa có hover riêng theo component | Có |
| Bấm giá trị **chọn một**: popup **đè lên đúng ô**: mép trái = mép ô, rộng = cả cột giá trị (539), bo 10. Dòng đầu là ô tìm "Search for an option…" nằm ngay chỗ giá trị. Dưới có tiêu đề "Select an option or create one" và các chip màu cao 28 | Popover thả XUỐNG DƯỚI nút, rộng theo nội dung | **Học**: popup đè ô, rộng bằng cột, ô tìm ở trên (khớp luật "quá 10 mục phải gõ tìm") |
| **Trạng thái**: chia nhóm To-do / In progress / Complete, có tiêu đề nhóm và vạch ngăn. Giá trị đang chọn nằm trong ô tìm như một chip | Danh sách phẳng | **Học**: nhóm trạng thái (Chờ / Đang làm / Xong) |
| **Ngày**: ô gõ ngày ở trên cùng (đã bôi đen sẵn để gõ đè), tháng + "Today" + ‹ ›, lịch, công tắc End date / Include time, Date format, Remind, Clear | DateTimePicker luôn có giờ, nút Bỏ hạn | **Học**: ô gõ ngày + nút Hôm nay; giờ bật bằng công tắc thay vì luôn hiện |
| Menu/popup: bo 10, mục cao 27–28, bo 6 | Theo DS | Có |
| "+ Add a property" cuối danh sách | Không | Bỏ |

## 5. Bảng database

| Notion | Mình (khuôn F) | Đề xuất |
|---|---|---|
| Đầu cột cao 36, chữ 14 nhạt kèm **icon kiểu trường** (Aa, lịch, trạng thái…) | Đầu cột 12–13 in hoa, không icon | Cân nhắc: icon kiểu trường giúp đọc nhanh |
| Ô đệm 7,5/8, **căn trên** (dòng nhiều dòng chữ vẫn thẳng đỉnh). Cột tên đậm 500 | Căn giữa dọc, một dòng | Có (bảng mình một dòng) |
| Rê dòng: **ngoài mép trái bảng** hiện `+` (thêm dòng dưới), `⋮⋮` (kéo / menu dòng), ô tick | Ô tick luôn hiện trong bảng (khuôn F), menu dòng = chuột phải | Có, khác cách |
| Rê dòng: chip **"OPEN"** (12/500, nền, bo 4) trong ô tên. Bấm thì mở side peek, chip đổi thành "CLOSE" | Bấm cả dòng là mở xem nhanh | Có (bấm dòng nhanh hơn) |
| Thanh công cụ chỉ icon (lọc, sắp, tự động, AI, tìm, mở rộng, cài đặt) + nút New xanh có ▾ | Thanh công cụ DataView | Có |

## 6. Trả lời: nhóm "Hệ thống" ở Tổng quan

Notion **không** đặt người tạo, ngày tạo, quyền trong thân trang. Thông tin "sửa lần cuối · ai · lúc nào" nằm ở **chân menu ⋯**.
Quyền xem thuộc nút Share.

Đề xuất: bỏ nhóm Hệ thống khỏi Tổng quan, bỏ hẳn "Quyền của bạn" (người xem đang thấy thì đã có quyền). Dời "Tạo bởi · ngày
tạo" thành một dòng nhạt cuối tab Hoạt động, nơi đã có lịch sử thao tác. Chờ CEO chốt.

## Chưa đo được

- Hover nền của ô giá trị: CDP đọc ra trong suốt, có thể Notion vẽ nền bằng lớp phủ riêng. Chưa kiểm bằng cách khác.
- Theme sáng; khổ hẹp (Notion side peek ở màn nhỏ).
- Kéo đổi độ rộng side peek; phím tắt Alt+J/K (lần thử bị lệch do bấm trúng "New template").
