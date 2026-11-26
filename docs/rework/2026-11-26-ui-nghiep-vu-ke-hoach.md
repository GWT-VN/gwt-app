# Kế hoạch triển khai UI v2 cho các màn nghiệp vụ còn lại

> **Superpowers** · Triển khai theo từng nhóm bằng `executing-plans`. Dùng Ponytail khi chọn component và khi review diff. Các bước dùng ô đánh dấu để theo dõi.
>
> **Mốc đối chiếu** · 26/11/2026 · `rework/v2.0.0` · `c743dec`.

**Mục tiêu** · Đưa 89 màn nghiệp vụ còn lại trên nhánh lên Design System GWT hiện có. Hoàn tất theo từng luồng, sử dụng dữ liệu và hành động của từng màn.

**Cách ghép** · Giữ khung F đã duyệt. Bọc từng màn trong `ManV2` tại điểm chuyển giao diện, như Work và Ticket F. Dùng component trong `apps/web/components/ui/`, các mẫu ở `/ds` và các quyết định ghi tại `apps/web/ds/NGUON.md`. Tiếp tục gọi các server action hiện có và giữ các đường dẫn, tham số URL, quyền truy cập và quy tắc nghiệp vụ tại mốc đối chiếu.

**Stack** · Next.js App Router, React, TypeScript, Tailwind, GWT DS v2 (shadcn/Radix), Vitest.

## Tiến độ triển khai

Mã giao diện của các đợt 1–7 đã được chuyển trên `rework/v2.0.0`. Bốn màn đã dùng v2 tiếp tục là mốc hồi quy. Hai lượt review của Matt Pocock đối chiếu yêu cầu và chuẩn repo, tập trung vào thao tác hiện có, quyền, khả năng tìm trong danh sách dài và chế độ tối.

- Đã đối chiếu 89/89 file trang nghiệp vụ với các vỏ UI v2. Bốn màn đã chuyển từ trước được kiểm hồi quy.
- Chrome headless kiểm bố cục mặc định của chi tiết ticket và báo cáo doanh số ở 1440, 900 và 390 px, cả hai theme. Cả 12 trường hợp dùng dữ liệu giả đều vừa chiều ngang trang.
- Kiểm đăng nhập, ghi dữ liệu và luồng theo vai trên trình duyệt cần Supabase local. Các test luồng trong repo dùng dữ liệu giả.

## 1. Phạm vi và mốc hoàn thành

| Phân loại | Số file trang | Cách xử lý |
| --- | ---: | --- |
| Màn nghiệp vụ còn lại, liệt kê tại mục 3 | 89 | Chuyển sang v2 theo nhóm. Các route tham số kiểm bằng bản ghi mẫu. |
| `/work`, `/work/team`, `/work/tu-sinh`, `/ticket` | 4 | Dùng làm mẫu và kiểm hồi quy khi thay đổi phần dùng chung. |
| `/ds`, `/ds/[trang]`, `/ds/tron`, `/prototype/chon-gio`, `/prototype/menu-thuoc-tinh` | 5 | Dùng làm nơi tham chiếu và kiểm component. |
| `/login`, `/auth/doi-mat-khau` | 2 | Kiểm luồng đăng nhập và đổi mật khẩu như điều kiện vào app. |
| `/ky-thuat/nhan-su` | 1 | Kiểm chuyển đến `/danh-sach-nguoi?tab=kt`; giao diện đích thuộc đợt 6. |
| **Tổng file `page.tsx` tại mốc đối chiếu** | **101** | |

- Tất cả tài liệu triển khai, thay đổi và commit thuộc `rework/v2.0.0`. Giữ công việc trên worktree của nhánh. Bản kế hoạch này dừng ở phạm vi UI.
- `/ticket/[code]` vào UI cũ theo URL mặc định. Mẫu chi tiết DS ở `app/ticket/[code]/_prototype/` chỉ mở trong dev với `?variant=...`. Ưu tiên đưa bố cục đã duyệt vào đường dẫn thật, với đầy đủ hành động.
- Màn có chỉnh lẻ về ngày, bảng hoặc nhãn tiếp tục dùng các chỉnh sửa đó trong UI mới. Chỉ tính đã chuyển xong khi lối vào mặc định dùng UI v2.
- Giữ màn đang tồn tại kể cả khi mở qua link trực tiếp, ví dụ `/can-don`. Các đề xuất gộp màn, đổi URL, bổ sung nghiệp vụ, đồng bộ artifact ngoài repo và đưa thay đổi từ `main` sang v2 là quyết định riêng.
- Tách phần chênh lệch từ `main` khỏi tiêu chí của đợt UI. Hai trang ticket nằm trong vùng xung đột đã xác minh. Tính năng ghi chú tự do của PR #39 là một mục cần đối chiếu khi có yêu cầu đưa nghiệp vụ đó vào rework.

## 2. Chọn component theo Ponytail

1. Tìm màn v2 có cùng tác vụ. Với danh sách có thao tác, đọc `app/ticket/_danh-sach/ds-f.tsx` và `components/work/v2/`. Với chi tiết ticket, đọc bố cục đã duyệt trong `app/ticket/[code]/_prototype/`.
2. So component và prop hiện có trong `components/ui/`, `/ds` và `ds/NGUON.md`. Chọn API công khai đang có. Ghép bố cục ngay ở màn khi chỉ phục vụ một nghiệp vụ.
3. Nếu thật sự vướng, ghi vào mô tả thay đổi tên màn, hành vi cần hỗ trợ và API DS đã thử. Ưu tiên ghép component hiện có hoặc chỉnh tại chỗ. Chỉ đề xuất mở rộng DS khi nêu được nơi dùng cụ thể và xác minh ảnh hưởng lên các caller, có test cho hành vi mới và mẫu tại `/ds` nếu API công khai thay đổi.
4. Review diff theo thứ tự dùng lại, ghép tại chỗ, bỏ phần trình bày cũ hết caller. Mỗi abstraction mới phải giải quyết một nhu cầu đã xuất hiện. Dùng dependency hiện có.

| Kiểu màn | Component hiện có để thử trước | Mức dùng |
| --- | --- | --- |
| Danh sách nghiệp vụ có tìm/lọc | `TrangDuLieu`, `DataViewToolbar`, `CauHinhBangDs`, `Table`, `NutLoc`, `ChipLoc` | Giữ tham số và bộ lọc của màn. Chỉ đưa chọn dòng, hàng loạt, đổi dạng xem, sửa ô và Xem nhanh vào nơi có luồng tương ứng. |
| Báo cáo và bảng tĩnh | `PageHeader`, `Card`, `Table`, `EmptyState` | Dùng bảng tĩnh khi nghiệp vụ chỉ cần đọc. |
| Hồ sơ hoặc chi tiết | `DetailLayout`, `PageHeader`, `PropertyList`, `Tabs`, `Badge`, `Collapsible` | Ưu tiên thông tin và nút đang dùng ở mỗi vai. `XemNhanh` chỉ dùng cho luồng xem nhanh đã tồn tại. |
| Tạo, sửa, duyệt | `FormLayout`, `Input`, `Select`, `Combobox`, `DatePicker`, `Dialog`, `ConfirmDialog` | Giữ field, điều kiện, trạng thái chờ gửi, lỗi, đường quay lại và yêu cầu xác nhận. |
| Wiki và KTV | Wiki dùng `WikiShell` và trình render tài liệu đang có. KTV dùng `ListView`, `Card`, `Badge` và `Button` nơi phù hợp. | Giữ mục lục, anchor, tìm kiếm Wiki. Giữ lịch, bản đồ và thao tác hiện trường của KTV. |

Mọi đường dẫn mã trong mục 2–3 tính từ `apps/web/`. Mỗi nhóm gồm các luồng có thể nghiệm thu riêng. Chia commit theo luồng có thể mở và kiểm được.

## 3. Đợt triển khai và danh sách màn

### Đợt 1 · Ticket và danh mục lỗi (7)

**Điểm sửa** · `app/ticket/[code]/page.tsx`, `app/ticket/[code]/_prototype/`, `app/tao-ticket/page.tsx`, các trang lỗi và component ở `components/ticket/`.

- [ ] Chuyển `/ticket/[code]` từ mẫu đã duyệt sang đường dẫn mặc định. So hành động hiện có cho lần lỗi, nhật ký, tệp, vật tư/chi phí, hẹn KTV, người phụ trách và cập nhật trạng thái. Kiểm mở từ Ticket F và quay về danh sách.
- [ ] Chuyển `/tao-ticket` bằng FormLayout, giữ chọn khách/máy, trường bắt buộc và điều hướng sau lưu.
- [ ] Chuyển `/danh-muc-loi`, `/bao-cao-loi`, `/nhom-loi`, `/nhom-loi/[code]`, `/nhom-loi/moi`. Kiểm danh mục → báo cáo/chi tiết và thao tác tạo nhóm ở vai hiện có quyền.

### Đợt 2 · Hồ sơ CSKH, máy, bảo hành và báo cáo (19)

**Điểm sửa** · `app/page.tsx`, `app/may/[serial]/page.tsx`, các route `app/khach*/` và các trang CSKH bên dưới. Dùng PageHeader + Table cho bảng, DetailLayout + PropertyList cho hồ sơ, FormLayout cho chỉnh sửa có sẵn.

- [ ] Máy và bảo hành · `/`, `/may/[serial]`, `/serial`, `/lap-bo`, `/dang-ky-bh`, `/bh-cho-kich-hoat`, `/loi`. Kiểm tra serial → hồ sơ máy → thao tác lắp, bảo hành và thay lõi ở từng điểm vào đang dùng.
- [ ] Khách và kênh · `/khach-hang`, `/khach`, `/khach/[id]`, `/khach/gop`, `/khach/kenh`, `/khach/moi`, `/kenh`, `/nuoc`, `/can-don`. Kiểm tra tìm khách, mở hồ sơ, link sang máy/ticket, tạo khách và xác nhận gộp đúng đối tượng.
- [ ] Tìm kiếm và báo cáo CSKH · `/tim`, `/tong-quan`, `/doanh-so`. Kiểm kết quả tìm mở đúng màn, kỳ báo cáo và tổng phí cho cùng dữ liệu trước và sau đổi UI.

### Đợt 3 · Kỹ thuật và bảo trì (6)

**Điểm sửa** · `app/ky-thuat/`, `app/bao-tri/`. Dùng các component DS cho danh sách, tiêu đề và thao tác bao quanh lịch/bản đồ. Giữ renderer lịch/bản đồ hiện tại.

- [ ] Điều phối và hiện trường · `/ky-thuat`, `/ky-thuat/lich`, `/ky-thuat/cua-toi`. Kiểm phân vai điều phối và KTV, thao tác hẹn/xong/huỷ tại nơi đang có, chạy thực tế tại 390 px.
- [ ] Bảo trì · `/bao-tri`, `/bao-tri/len-lich`, `/bao-tri/map`. Kiểm cùng lượt bảo trì ở danh sách, lịch và bản đồ. Kiểm thao tác lên lịch và phản hồi khi lưu lỗi.

### Đợt 4 · Sales (14)

**Điểm sửa** · `app/sales/_ui.tsx`, `app/sales/OrderForm.tsx`, `app/sales/CustomerForm.tsx`, `app/sales/ctkm/CtkmForm.tsx` và page tương ứng. Thay lớp trình bày cùng các control trong form hiện có.

- [ ] Đơn · `/sales`, `/sales/don/[code]`, `/sales/don/moi`, `/sales/don/[code]/sua`. Kiểm đi từ danh sách đến tạo/sửa/chi tiết. Đối chiếu dòng đơn, VAT, giá gợi ý, tổng tiền và trạng thái như trước với cùng bộ dữ liệu mẫu.
- [ ] Khách · `/sales/khach`, `/sales/khach/[code]`, `/sales/khach/moi`, `/sales/khach/[code]/sua`. Kiểm tra tra trùng, trường bắt buộc, quyền chỉnh sửa và quay về hồ sơ sau lưu.
- [ ] Giá và khuyến mãi · `/sales/gia`, `/sales/gia/chinh-sach`, `/sales/gia/doi-tac`, `/sales/ctkm`, `/sales/ctkm/moi`, `/sales/ctkm/[id]`. Kiểm giá/bậc áp đúng mã, cùng kết quả tổng hợp và các bước duyệt đã có.

### Đợt 5 · Kho (7)

**Điểm sửa** · `app/kho/_ui.tsx` và các trang trong `app/kho/`. Chuyển bảng/lọc ở cùng cấu trúc URL. Dùng ConfirmDialog cho thao tác chốt đã có xác nhận.

- [ ] Tra cứu · `/kho`, `/kho/ma/[ma]`, `/kho/nhat-ky`, `/kho/bao-cao`. Kiểm mã từ danh sách tới chi tiết, lọc theo kho, số đầu kỳ/cuối kỳ và link nguồn chứng từ.
- [ ] Xử lý · `/kho/cho-duyet`, `/kho/kiem-ke`, `/kho/lich-su-sua`. Kiểm quyền, duyệt mã, hủy xác nhận, nhập số đếm và xuất hiện bản ghi lịch sử/điều chỉnh theo luồng hiện có.

### Đợt 6 · Quản trị và dữ liệu nền (6)

**Điểm sửa** · Các page tương ứng bên dưới và các component mà page đang gọi. Dùng Table cho danh sách, Badge cho trạng thái, ConfirmDialog cho quyết định cần xác nhận.

- [ ] Duyệt và nhật ký · `/duyet`, `/audit`, `/dong-bo-catalog`. Kiểm duyệt/từ chối với lý do, bản ghi trước–sau và trạng thái lần đồng bộ.
- [ ] Nhân sự và phân quyền · `/nhan-vien`, `/nhan-vien/phan-quyen`, `/danh-sach-nguoi`. Kiểm bằng tài khoản có quyền và thiếu quyền, lưu quyền rồi tải lại. Mở alias `/ky-thuat/nhan-su` và xác nhận tab KTV.

### Đợt 7 · Wiki và Marketing (30)

**Điểm sửa** · `app/wiki/layout.tsx`, `app/wiki/wiki.css`, `components/wiki/WikiShell.tsx` và các template/page sau. Áp DS một lần qua vỏ Wiki, sau đó chuyển các kiểu trang còn khác. Giữ selector cũ tới khi các caller của nó đã được kiểm.

- [ ] Trang chủ, khu và sản phẩm (8) · `/wiki`, `/wiki/[khu]`, `/wiki/[khu]/[slug]`, `/wiki/san-pham`, `/wiki/san-pham/[ma]`, `/wiki/san-pham/[ma]/nhom/[nhom]`, `/wiki/san-pham/[ma]/phan/[slug]`, `/wiki/san-pham/[ma]/tra-cuu`. Kiểm tìm kiếm, mục lục, anchor và đường dẫn chéo.
- [ ] Tài liệu và case Marketing (14) · `/wiki/marketing`, `/wiki/marketing/[slug]`, `/wiki/marketing/kho-case`, `/wiki/marketing/kho-case/[slug]`, `/wiki/marketing/khung/5a`, `/wiki/marketing/khung/5a/[cat]`, `/wiki/marketing/khung/luat-sua`, `/wiki/marketing/khung/paast`, `/wiki/marketing/khung/quy-trinh`, `/wiki/marketing/khung/quy-trinh/[slug]`, `/wiki/marketing/khung/seci`, `/wiki/marketing/luat`, `/wiki/marketing/luat/[slug]`, `/wiki/marketing/phan-tich-kenh/bs-phuc`. Kiểm bài dài, bảng trong bài và liên kết bộ sưu tập → chi tiết.
- [ ] Dữ liệu Marketing (8) · Các route dưới `/wiki/marketing/du-lieu`: `/ads-results`, `/kho-hook`, `/phan-tich-sau`, `/phan-tich-sau/[id]`, `/phan-tich-video`, `/phan-tich-video/[id]`, `/video-ideas`, `/video-ideas/[id]`. Kiểm lọc, bảng và chi tiết. Kiểm cả khi nguồn dữ liệu trả rỗng hoặc lỗi.

## 4. Chu trình dùng cho từng luồng

- [ ] Mở theo URL mặc định bằng dữ liệu local đã che PII hoặc dữ liệu giả. Ghi vai người dùng, thao tác chính, bộ lọc/URL và kết quả cần đối chiếu. Với route tham số, chọn một bản ghi mẫu và một ID không tồn tại nếu route xử lý trường hợp đó.
- [ ] Chọn component theo mục 2. Chỉ sửa page, component trình bày liên quan và test hành vi có nguy cơ hồi quy. Nếu đổi hành vi UI như focus, form hoặc lọc, thêm một test nhỏ theo mẫu `*.dom.test.tsx`, chạy để xác nhận lỗi trước khi sửa.
- [ ] Kiểm trên trình duyệt luồng vừa chuyển ở 1440, 900 và 390 px, cả sáng/tối. Kiểm các trạng thái đang tải, rỗng, lỗi và thiếu quyền mà tuyến thực sự có. Thử Tab, Enter, Escape và focus quay về nút mở khi đóng dialog/menu. Bảng rộng cuộn trong khung bảng, form hiện rõ lỗi và nút lưu.
- [ ] Chạy kiểm tra của đợt tại `apps/web/`. Dùng môi trường build được cấu hình cho v2.

```powershell
npx.cmd tsc --noEmit --incremental false
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Kỳ vọng các lệnh thoát 0 và lint không thêm lỗi/cảnh báo vào đường dẫn vừa sửa. Mốc tham chiếu ngày 26/11 có 2.001 test pass và 4 cảnh báo lint. Khi component DS có cấu hình so khớp, chạy thêm `node ds/so-khop.mjs <TênComponent>` với bản dev local. Đối chiếu với các ngoại lệ đã ghi trong `ds/NGUON.md`.

- [ ] Ghi nhận route đã qua kiểm tra và gắn bằng chứng xem được. Commit phần thay đổi của luồng trên `rework/v2.0.0`. Khi thay phần dùng chung, chạy lại luồng Ticket F, Work, đăng nhập và đổi mật khẩu.

## 5. Nghiệm thu toàn đợt

- [ ] Đối chiếu danh sách `app/**/page.tsx` tại HEAD với bảng phạm vi. Mỗi màn còn lại có một kết quả kiểm trên URL mặc định. Kiểm alias KTV và các link thẳng từ màn khác.
- [ ] Chạy lại bốn lệnh kiểm tra và các hành trình giữa khu: Ticket F → hồ sơ ticket → việc đã gắn; KTV → lịch/bảo trì; Sales → đơn/khách và liên kết Kho/lắp/BH ở nơi app đã có; Wiki → tìm kiếm → tài liệu.
- [ ] Review các thay đổi ở `components/ui/` theo Ponytail. Mỗi phần dùng chung mới ghi được caller, lý do API hiện có chưa đủ và bằng chứng kiểm. Đối chiếu ảnh và quyền trước khi đánh dấu đợt hoàn tất.

## Tài liệu đối chiếu

- [Nguồn Design System](../../apps/web/ds/NGUON.md)
- [Khung và Work v2 đã duyệt](2026-11-23-khung-va-work-v2.md)
- [Kế hoạch chi tiết danh sách Ticket F](2026-11-26-ticket-f-dung-that.md)
- [Brief UI v2](v2-brief-claude-design.md)
- [Mô tả nghiệp vụ GWT App v2](v2-mo-ta-app.md)
