# Nghiên cứu: CSKH — hồ sơ máy, hồ sơ khách, trang chi tiết & danh sách ticket

Ngày: 2026-11-25 · Loại: nghiên cứu chỉ đọc web (không sửa code) · Phục vụ: thiết kế lại khu CSKH (rework v2).

**Cách đọc trích dẫn:** `[n]` → mục Nguồn cuối file. Nguồn có đánh dấu **(trích)** nghĩa là chỉ đọc được đoạn trích của
máy tìm kiếm, không mở được trang (vd developer.salesforce.com trả 403). **(bên thứ 3)** = không phải tài liệu chính chủ.
Câu ghi *"suy luận"* là nhận định của người nghiên cứu, không có nguồn.

---

## 1. Bảng tổng hợp

| Sản phẩm | Hồ sơ MÁY/tài sản ở đâu | Hồ sơ KHÁCH ở đâu | Bố cục trang chi tiết | Bố cục danh sách | Tách nội bộ / khách |
|---|---|---|---|---|---|
| **Zendesk** (Agent Workspace) | Context panel bên phải, mục "IT asset management": tóm tắt tài sản đang gán cho người yêu cầu, mở chi tiết ở tab mới, chỉ đọc với agent [3] (trích). Bản ghi custom object liên kết qua trường lookup hiện ở "Record preview" [1] | Context panel phải, icon User: thẻ hồ sơ (tên, liên hệ, tổ chức, múi giờ, ngôn ngữ, trường tuỳ chỉnh chỉ hiện khi có giá trị), Interactions, trang đã xem [2]. Panel **đóng mặc định**, kéo giãn được [1][2] | 3 vùng: thuộc tính ticket bên trái (macro nằm dưới) [5] · hội thoại giữa, mới nhất ở dưới, ô soạn dưới cùng [4] · context panel phải dạng icon (User, Knowledge, Related tickets, Tasks, Apps…) [1] | View dựng sẵn: Your unsolved, Unassigned, All unsolved, Recently updated… [6] | Một ô soạn, chọn kiểu ở góc trái: phản hồi công khai vs ghi chú nội bộ [4]; nền vàng = nội bộ [7] (bên thứ 3) |
| **Freshdesk** | Không tìm được tài liệu chính chủ về tài sản/thiết bị trong ticket Freshdesk | "Additional info pane": widget liên hệ (tên, email, công ty, SĐT, admin chọn trường) + **Recent timeline** ticket gần đây của khách [8] | Quick list ticket bên cạnh (có đồng hồ SLA) · khung hội thoại giữa (tin khách, phản hồi, ghi chú nội bộ, hoạt động theo thứ tự) · Properties pane (SLA, tag, trạng thái, ưu tiên, nhóm/agent) · Additional info pane (thu gọn được) [8] | Card / Inbox / Table, admin khoá được bố cục mặc định; view mặc định "My Open and Pending", "All unresolved"… [10] | Nút Reply vs Note; Note chọn công khai (khách thấy trên portal, không gửi mail) hoặc riêng tư (chỉ agent) [9] |
| **Freshservice** (ITSM, cùng hãng) | Pane **Assets** trên ticket để gắn tài sản; gắn xong ticket vào danh sách yêu cầu của tài sản [11][12] | Bên phải: requester details; "View more details" mở panel trượt (Recent Tickets, Documents) [11][13] (trích) | Header gốc + tab Details; trả lời & ghi chú cùng luồng thời gian; bên phải trạng thái/ưu tiên/hạn + thuộc tính; tab Activities là nhật ký thay đổi riêng [11] | — | Notes "Public or private" chung luồng với replies [11] |
| **HubSpot** Service Hub (Help desk) | Không có đối tượng tài sản chuẩn trong tài liệu đã đọc; sidebar phải hiện được **association card** của đối tượng liên kết bất kỳ (vd custom object) [14] | Sidebar phải: contact/company/deal liên kết + tab History [16]. Admin thêm tab/thẻ, **hiện theo điều kiện** thuộc tính ticket (vd thẻ Billing chỉ khi Category = billing) [14] | Header ticket cố định (assignee, priority, không tuỳ biến) · hội thoại giữa, nhiều hội thoại = tab trên đầu · sidebar phải tab/thẻ [14][16] | **Table / Split / Board**; view mặc định ở sidebar trái: Unassigned, Assigned to me, My team's open, All open, My mentions… [15] | Ô soạn có icon Note → ghi chú nội bộ khách không thấy [16]; note mới thay "comment" và hiện trên timeline mọi bản ghi liên kết [17] (trích) |
| **Salesforce Service Cloud** (Case) | Case có lookup `AssetId` tới Asset [24] (bên thứ 3); Asset có số serial, ngày lắp, ngày hết dùng, Account, cây cha–con [23] (trích) | Highlights panel ghim đầu trang (Account, Owner…) + Related Lists (contact, account) [18] | Template "Pinned Header": Highlights (Subject, Priority, Status, Case Number, Account, Owner, ngày mở) · trái: Knowledge + Related · giữa: Record Detail · phải: Feed [18] | Console **split view**: danh sách thu gọn bên trái khi mở bản ghi [19] (trích); list view "My Open Cases" + thao tác hàng loạt [20] | Feed/publisher: ghi chú case, log cuộc gọi, gửi email trong cùng feed [19] (trích) |
| **Salesforce Field Service** | Asset Warranty riêng: StartDate/EndDate, % phụ tùng & % công được bảo hành (mỗi loại có ngày hết riêng), ExchangeType (đổi trước / máy mượn / đổi sau) [21] (trích); bảo hành chuẩn sinh từ Product Warranty Term khi lắp máy, gắn được vào work order/case [22] (trích) | Account trên work order (chung Salesforce) | Work order: tab Related có Service Appointments, Products Consumed (vật tư dùng, trừ tồn kho) [25] | — | — |
| **Dynamics 365 Field Service** | Customer Asset gắn **service account** + functional location + cây Parent/Sub Assets [27]; lịch sử dịch vụ dựng từ work order incident gắn asset [28]; Warranty là bản ghi riêng phủ asset/địa điểm/tài khoản, **không tự áp giá** vào work order [30] | Work order: header có service account; thẻ **Contacts** (liên hệ tài khoản + người báo lỗi, gọi/mail nhanh) [29] | Header + tab thẻ: General (Details · **Location** có breadcrumb + bản đồ · Financial · **Booking động theo trạng thái** · Contacts · **Assets cây**) · Products & services · Tasks · Reference · **Timeline** (cuộc gọi, mail, ghi chú, ảnh) [29] | Lưới sửa được tại chỗ (trạng thái, ưu tiên) + **side pane** thao tác nhanh không cần mở chi tiết [29] | Timeline gom ghi chú & hoạt động; không thấy tài liệu về tách nội bộ/khách trên work order |
| **ServiceTitan** (HVAC/ống nước) | Thiết bị gắn **địa điểm phục vụ**, hiện trên mọi job sau tại địa chỉ đó [31]; trường: tên, hãng, model, serial, Asset #, **bảo hành hãng + bảo hành nhà dịch vụ**, memo, ngày lắp (trường quan trọng nhất, tính tuổi máy) [31]; trạng thái Installed/**Replaced** [32] | Hồ sơ location (khách) có mục Equipment + "View all" [31] | Job có mục Equipment; mobile: cảnh báo đủ điều kiện thay máy, quét barcode [31] | — | — |
| **Housecall Pro** | "Property Profile" theo địa chỉ khách: loại, tên, hãng, model, serial, ngày lắp, ghi chú; **không có trường bảo hành** [33] | Trang khách tab Profile → mục theo từng địa chỉ [33] | Job: mục Property Profile (trái trên web, dưới trên mobile); chỉ hiện thiết bị cùng địa chỉ job [33] | Trang Property Profile lọc/sắp theo "Last service date", xuất CSV [33] | — |
| **Jobber** | Không có bản ghi thiết bị gốc; dùng custom field trên Client/Property (mặc định chỉ nội bộ) [34]; cộng đồng gợi ý custom field cho model/serial [35] (bên thứ 3) | Thẻ Property: địa chỉ + custom field [34] | — | — | Custom field nội bộ, bật được cho khách thấy [34] |
| **Zoho Desk** | Module **Products** liên kết với contact/account/ticket; gắn sản phẩm vào ticket chỉ từ trang chi tiết ticket, trường sản phẩm tự điền [37] | Trang contact/account 3 vùng: danh sách khách · thuộc tính + tóm tắt ticket · tab hoạt động (ticket, cuộc gọi, timeline, lịch sử sửa) [36] | Tab dưới thread: Comments, History, Resolution, Tasks, Time Entry, Attachments [39] (cộng đồng) | Không tìm được tài liệu chính chủ về bố cục danh sách | Private comment chỉ agent thấy [38] |
| **Odoo** Helpdesk + Repair | Ticket có Product + **Lot/Serial** (chỉ hiện khi sản phẩm theo dõi serial) [40]; Repair order: "Under Warranty" → không tính tiền phụ tùng; tab Parts Add/Remove/Recycle [41]; quản thời hạn bảo hành theo serial cần module bên thứ 3 [44] | Customer trên ticket, mang sang phiếu sửa [40] | Form + nút hậu mãi trên đầu ticket: **Refund, Coupon, Repair, Return, Plan Intervention** (hiện trường) → smart button đếm bản ghi đã tạo [40]; chatter dưới/bên form [42] | List/Kanban theo stage; SLA tag đỏ khi quá hạn, xanh khi đạt [43] | Chatter: **Send message** (gửi follower/khách) vs **Log note** (chỉ nội bộ) [42] |
| **Intercom** | Custom Object liên kết hiện ở sidebar [46] (trích) | Sidebar phải: User/Company details, "Recent conversations" (3, mở rộng tới 20), "Similar conversations" [45]; mỗi người tự sắp sidebar, admin ép bố cục theo vai [46] (trích) | Danh sách · hội thoại · sidebar chi tiết [45] | Chat ↔ **Table** (phím L), cột sắp/ẩn, lưu theo view; Unassigned [45] | Composer Note vs Reply, phím N/R, @mention [47] (trích) |
| **Front** | — | Plugin Relationships ở sidebar: tab Contact (About, Conversations) & Account (About, Activities, Plans, Notes) [48] | Hội thoại + sidebar plugin [48] | — | Comment nội bộ ở đáy hội thoại, không gửi khách; "Discussion" nội bộ tách riêng [49] (trích) |
| **Linear** (mẫu thuộc tính) | — | — | Thuộc tính ở **sidebar phải** (Status, Priority, Labels, Relations, Estimate, SLA, Due) [50]; activity gom nhóm sự kiện liên tiếp, thu gọn lịch sử cũ [53] (trích) | List ↔ Board (Cmd/Ctrl B); Triage/Inbox là split view [51] (trích); My Issues 4 tab [52] (trích) | — |
| **ServiceMax Asset 360** (hậu mãi trên Salesforce) | **Timeline tài sản**: bảo hành = dải thời gian (start–end), work order/case = sự kiện điểm [54]; bảo hành tự tạo khi lưu Installed Product theo điều khoản sản phẩm/dòng [56] (trích) | — | Kiểm quyền lợi (entitlement) khi tạo case/work order: tương tác (liệt kê bảo hành + hợp đồng để chọn) hoặc tự động theo luật [55] | — | — |
| **Tavant / Mize / Syncron** | Không tìm được tài liệu chính chủ công khai về giao diện; chỉ có trang marketing (đăng ký sản phẩm, xử lý claim) [57] | — | — | — | — |

---

## 2. Mẫu lặp lại (≥ 3 sản phẩm cùng làm)

| # | Mẫu | Sản phẩm |
|---|---|---|
| R1 | **Trang chi tiết 3 vùng**: thuộc tính ticket · hội thoại/dòng thời gian giữa · ngữ cảnh (khách, máy, app) một bên | Zendesk [1][5], Freshdesk [8], HubSpot [14][16], Salesforce [18], Intercom [45] |
| R2 | **Ngữ cảnh khách kèm ticket/hội thoại gần đây của chính khách đó** ngay cạnh ticket | Zendesk Interactions [2], Freshdesk Recent timeline [8], Intercom Recent conversations [45], Front Conversations [48], Freshservice Recent Tickets [13] |
| R3 | **Một ô soạn, hai chế độ** (trả lời khách / ghi chú nội bộ), đổi bằng nút/tab, nội bộ có màu riêng | Zendesk [4][7], Freshdesk [9], HubSpot [16], Intercom [47], Front [49], Odoo [42], Zoho [38] |
| R4 | **Một luồng thời gian trộn** tin khách + ghi chú nội bộ + sự kiện hệ thống | Freshdesk [8], Freshservice [11], Odoo chatter [42], Dynamics Timeline [29], Linear activity [53] |
| R5 | **Máy thuộc về khách/địa điểm, không thuộc ticket**; ticket/job tham chiếu máy, máy tích luỹ lịch sử | Dynamics (service account, functional location) [27][28], ServiceTitan (location) [31], Housecall Pro (địa chỉ) [33], Salesforce (AccountId, Case.AssetId) [23][24], Freshservice [11] |
| R6 | **Bộ trường lõi của máy**: tên/loại · hãng · model · serial · ngày lắp (+ bảo hành) | ServiceTitan [31][32], Housecall Pro [33], Salesforce [23], Dynamics [27], Odoo lot/serial [40] |
| R7 | **Bảo hành là bản ghi riêng có khoảng ngày + phạm vi**, không chỉ một ô ngày | Salesforce Asset Warranty [21][22], Dynamics Warranty [30], ServiceMax [54][56], ServiceTitan (2 loại bảo hành) [31] |
| R8 | **Vật tư/phụ tùng dùng ghi theo phiếu**, có cờ "trong bảo hành" hoặc giá | Salesforce Products Consumed [25], Dynamics Products & services [29], Odoo Repair Parts + Under Warranty [41] |
| R9 | **Danh sách đổi được bố cục** Bảng / Split / Board (hoặc Card) | HubSpot [15], Freshdesk [10], Intercom [45], Linear [51], Salesforce split view [19], Dynamics grid + side pane [29], Odoo list/kanban [43] |
| R10 | **View mặc định**: của tôi · chưa giao · tất cả đang mở | Zendesk [6], HubSpot [15], Freshdesk [10], Intercom (Unassigned) [45], Salesforce (My Open Cases) [20], Linear (My Issues) [52] |
| R11 | **SLA/hạn hiện thẳng trong danh sách và thuộc tính** (đồng hồ, tag màu) | Freshdesk [8], Odoo [43], Linear [50], HubSpot [15] |

## 3. Mẫu khác biệt đáng học

| Mẫu | Sản phẩm | Vì sao hợp máy lọc nước + hiện trường |
|---|---|---|
| **Thẻ Booking động theo trạng thái**: chưa hẹn → gợi ý KTV/giờ; đã hẹn → KTV, giờ, thời gian di chuyển; xong → tóm tắt + in biên bản | Dynamics [29] | Một thẻ thay 3 màn; khớp vòng đời đi hiện trường |
| **Thẻ Location** có breadcrumb vị trí + bản đồ | Dynamics [29] | Địa chỉ lắp máy ≠ địa chỉ khách là chuyện thường (*suy luận*) |
| **Assets dạng cây** trên work order (máy → bộ phận) | Dynamics [27][29] | Máy lọc → lõi lọc/màng RO là cây tự nhiên (*suy luận*) |
| **Tuổi máy tính từ ngày lắp**, cảnh báo đủ điều kiện thay máy trên mobile | ServiceTitan [31] | Gợi ý thay lõi/nâng máy khi KTV đang ở nhà khách |
| **Installed / Replaced** thay vì xoá máy — giữ lịch sử | ServiceTitan [32] | Đổi máy bảo hành vẫn giữ được ticket cũ trên serial cũ |
| **Hai loại bảo hành** (hãng / nhà dịch vụ) | ServiceTitan [31] | Bảo hành hãng vs bảo hành lắp đặt của đại lý (*suy luận*) |
| **Bảo hành chia % phụ tùng / % công, ngày hết riêng; kiểu đổi máy** (đổi trước, máy mượn, đổi sau) | Salesforce [21] | Thực tế bảo hành thường khác nhau giữa linh kiện và công (*suy luận*) |
| **Timeline tài sản**: dải bảo hành + điểm sự kiện (ticket/work order) trên một trục | ServiceMax [54] | Nhìn 1 giây: lỗi xảy ra trong hay ngoài bảo hành |
| **Kiểm quyền lợi khi tạo ticket** (liệt kê bảo hành còn hiệu lực để chọn, hoặc tự động) | ServiceMax [55] | Chặn sai "còn bảo hành/hết bảo hành" ngay lúc nhận ca |
| **Nút hậu mãi trên đầu ticket** (Sửa, Đổi/Trả, Hoàn tiền, Lên lịch hiện trường) + smart button đếm | Odoo [40] | Ticket thành trung tâm điều phối; số đếm cho biết đã tạo gì |
| **"Under warranty" = phụ tùng giá 0** trên phiếu sửa | Odoo [41] | Chi phí ticket tự đúng theo bảo hành |
| **Thẻ/tab hiện theo điều kiện** thuộc tính ticket | HubSpot [14] | Thẻ "Bảo hành" chỉ hiện khi loại ticket = bảo hành |
| **Context panel đóng mặc định, kéo giãn được, nhớ độ rộng** | Zendesk [1][2] | Giữ chỗ cho dòng thời gian ở 900px |
| **Quick list** ticket cạnh trang chi tiết, có SLA | Freshdesk [8] | Chuyển ticket không quay lại danh sách |
| **Lưới sửa tại chỗ + side pane** | Dynamics [29] | Điều phối đổi trạng thái/ưu tiên hàng loạt nhanh |
| **Activity gom nhóm, thu gọn lịch sử cũ** | Linear [53] | Ticket dài nhiều lần lỗi không bị chìm trong sự kiện hệ thống |
| **Thảo luận nội bộ tách hẳn khỏi hội thoại** | Front [49] | Bàn giữa KTV–kho–CSKH không lẫn vào lịch sử với khách |

---

## 4. Áp vào GWT

Ràng buộc đã có: ticket gắn 1 khách + 1 máy; nhiều "lần lỗi"; nhật ký nội bộ; chi phí/vật tư; KTV hiện trường; DS
v2 (Detail page, Data view, panel Xem nhanh). *Chưa rõ, cần hỏi:* CSKH có gửi tin cho khách TỪ app không, hay chỉ ghi
lại cuộc gọi/Zalo — quyết định ô soạn là "gửi" hay "ghi nhận".
**CEO chốt 25/11/2026: CHỈ GHI NHẬN** — app không gửi tin cho khách; ô soạn = ghi chú nội bộ / ghi nhận trao đổi (gọi, Zalo).

### 4a. Trang chi tiết ticket + hồ sơ máy/khách

| # | Hướng | Cảm hứng | Hợp nghiệp vụ thế nào | Đánh đổi |
|---|---|---|---|---|
| D1 | **Đầu trang ghim + dải máy**: mã ticket, trạng thái, ưu tiên, người phụ trách; ngay dưới là 1 dòng máy: model · serial · badge bảo hành ("Còn 143 ngày" / "Hết hạn 02/2026") · ngày lắp | Salesforce Highlights [18], ServiceTitan [31], ServiceMax [55] | Câu hỏi đầu tiên của mọi ca là "máy nào, còn bảo hành không" — trả lời mà không cần mở panel | Đầu trang dày hơn; ở 390px dải máy phải xuống 2 dòng |
| D2 | **Bố cục 3 vùng**: giữa = dòng thời gian; phải = panel ngữ cảnh có tab **Máy · Khách · Ticket khác**; thuộc tính ticket gom vào cột phải phía trên (kiểu Linear) thay vì cột trái riêng | Zendesk [1][2], Freshdesk [8], Linear [50] | Tab Máy: trường lõi + bảo hành + "ticket khác của máy này"; tab Khách: liên hệ + "máy khác của khách" + ticket gần đây | 1440 thoải mái; 900 cần panel thu được (Zendesk đóng mặc định); 2 cột thuộc tính + ngữ cảnh dễ dài |
| D3 | **"Lần lỗi" là khối chính của vùng giữa**: mỗi lần = thẻ (khách báo gì → chẩn đoán → cách xử lý → vật tư → KTV/lịch hẹn), ghi chú nội bộ và sự kiện xen giữa, sự kiện hệ thống gom nhóm | Dynamics incident gắn asset [28], Salesforce Products Consumed [25], Odoo Repair Parts [41], Linear gom activity [53] | Khớp mô hình dữ liệu GWT (nhiều lần lỗi/ticket) hơn mô hình "hội thoại email" của helpdesk | Khác thói quen helpdesk chuẩn; cần quy ước rõ ghi chú gắn vào lần lỗi nào hay gắn ticket |
| D4 | **Thẻ hiện trường động theo trạng thái** (chưa hẹn / đã hẹn: KTV, giờ, SĐT / xong: tóm tắt, vật tư, chi phí, biên bản) + thẻ địa chỉ lắp đặt | Dynamics Booking + Location [29] | Một thẻ thay luồng điều phối rời rạc; KTV và CSKH nhìn cùng một chỗ | Cần dữ liệu lịch hẹn có cấu trúc; nhiều lượt hẹn/ticket phải có danh sách phụ (Dynamics khuyên < 5 booking) |
| D5 | **Trang hồ sơ máy riêng** (mở từ tab Máy): dòng thời gian một trục — dải bảo hành + điểm ticket/lần lỗi + thay lõi/vật tư; trạng thái Đang dùng / Đã thay (trỏ sang máy mới) | ServiceMax timeline [54], ServiceTitan Replaced [32], Dynamics service history [28] | Nhìn ra ngay lỗi lặp lại, lỗi trong/ngoài bảo hành, lịch sử thay lõi | Tốn công dựng timeline; bản rẻ = bảng lịch sử sắp theo ngày (ServiceTitan mobile [32]) |

Ô soạn (đi kèm D2/D3): một ô, 2 tab **Ghi chú nội bộ** (màu riêng, @nhắc người) / **Trao đổi với khách**; mặc định nội
bộ — theo R3 [4][9][16][42]. Thảo luận nội bộ dài nhiều bên → cân nhắc tách như Front [49].

### 4b. Danh sách ticket

| # | Hướng | Cảm hứng | Hợp nghiệp vụ thế nào | Đánh đổi |
|---|---|---|---|---|
| L1 | **Bảng + panel Xem nhanh** (bấm hàng mở panel phải, đổi trạng thái/người phụ trách/hẹn KTV ngay trong panel) — cột: mã, khách, model + serial, loại lỗi, trạng thái, người phụ trách, hạn/SLA, badge bảo hành | Dynamics grid + side pane [29], HubSpot Split [15], Salesforce split view [19] | Hợp CSKH văn phòng xử lý nhiều ca/ngày; tận dụng panel Xem nhanh đã có trong DS v2 | Bảng rộng; ở 390px phải chuyển dạng thẻ |
| L2 | **Board theo khâu** (Mới · Chờ hẹn · Đã hẹn KTV · Chờ vật tư · Xong) — dạng thứ hai của cùng dữ liệu, đổi bằng segment | HubSpot Board [15], Odoo kanban [43], Linear board [51] | Hợp người điều phối KTV nhìn tắc ở khâu nào | Nhiều ticket → cột dài; không thay được bảng khi cần lọc/sắp |
| L3 | **View mặc định**: Của tôi · Chưa giao · Quá hạn/SLA · Chờ vật tư · Đã hẹn hôm nay; SLA hiện dạng tag màu (đỏ quá hạn) ngay trong hàng | Zendesk [6], HubSpot [15], Freshdesk [10], Odoo SLA tag [43] | Bộ view chuẩn ngành + 2 view riêng của hiện trường | View "Đã hẹn hôm nay"/"Chờ vật tư" cần trường có cấu trúc (*suy luận*) |

**Đề xuất mặc định:** D1 + D2 + D3 cho chi tiết (D4 khi có dữ liệu lịch hẹn, D5 làm bản bảng trước); L1 + L3 cho danh
sách, L2 thêm sau như một chế độ xem.

---

## 5. Chỗ không tìm được / giới hạn

- Freshdesk: không thấy tài liệu chính chủ về tài sản/thiết bị trong ticket (chỉ Freshservice có).
- Salesforce: trang developer.salesforce.com trả 403 → trường Asset/Asset Warranty/Warranty Term chỉ lấy từ đoạn trích
  tìm kiếm; `Case.AssetId` chỉ có nguồn bên thứ 3 (ServiceMax, CData). Bố cục Asset record page không tìm được.
- Zoho Desk: không tìm được tài liệu chính chủ mô tả bố cục web trang chi tiết ticket và danh sách; tab ticket lấy từ
  bài cộng đồng.
- Intercom: không xác nhận được màu ghi chú nội bộ.
- Housecall Pro: tài liệu không có trường bảo hành. Jobber: không có bản ghi thiết bị gốc.
- Tavant / Mize / Syncron: không có tài liệu giao diện công khai. Thay bằng ServiceMax Asset 360 (tài liệu công khai).
- Không xem ảnh chụp màn hình trực tiếp; mô tả bố cục lấy từ văn bản tài liệu.

## 6. Nguồn (truy cập 2026-11-25)

1. Zendesk — Using the context panel. https://support.zendesk.com/hc/en-us/articles/4408836526362-Using-the-context-panel
2. Zendesk — Viewing customer context for user history and device information. https://support.zendesk.com/hc/en-us/articles/4408829170458
3. Zendesk — Using and managing IT assets in ticket workflows. https://support.zendesk.com/hc/en-us/articles/9817279885466 **(trích)**
4. Zendesk — Composing messages in the Zendesk Agent Workspace. https://support.zendesk.com/hc/en-us/articles/4408831849882 **(trích)**
5. Zendesk — Quick reference: Before and after activating the Agent Workspace. https://support.zendesk.com/hc/en-us/articles/4882193306394 **(trích)**
6. Zendesk — Accessing your views of tickets. https://support.zendesk.com/hc/en-us/articles/4408829483930 **(trích)**
7. GitLab Handbook — Zendesk Agent Workspace. https://handbook.gitlab.com/handbook/support/readiness/operations/docs/zendesk/agent_workspace **(bên thứ 3, trích)**
8. Freshdesk — Understand the Ticket Details View (sửa 27/10/2026). https://support.freshdesk.com/en/support/solutions/articles/37588
9. Freshdesk — Replying / adding notes (article 231527). https://support.freshdesk.com/support/solutions/articles/231527 **(trích)**
10. Freshdesk — Understand ticket views. https://support.freshdesk.com/en/support/solutions/articles/37559-understand-ticket-views **(trích)**
11. Freshservice — Viewing and accessing information about tickets. https://support.freshservice.com/support/solutions/articles/154815-viewing-and-accessing-information-about-tickets
12. Freshservice — How do I associate assets to users/tickets. https://support.freshservice.com/support/solutions/articles/50000000512
13. Freshservice — Enhanced requester details view for agents. https://support.freshservice.com/support/solutions/articles/50000011556 **(trích)**
14. HubSpot — Customize the right sidebar of help desk. https://knowledge.hubspot.com/help-desk/customize-the-right-sidebar-of-help-desk
15. HubSpot — Organize teams and views in help desk. https://knowledge.hubspot.com/help-desk/organize-teams-and-views-in-help-desk
16. HubSpot — Create and respond to tickets in help desk. https://knowledge.hubspot.com/help-desk/create-respond-to-tickets-in-help-desk
17. HubSpot — Create, edit, and manage notes in help desk. https://knowledge.hubspot.com/help-desk/create-edit-and-manage-notes-in-help-desk **(trích)**
18. Trailhead — Customize Your Lightning Service Console Pages. https://trailhead.salesforce.com/content/learn/projects/set-up-the-service-console/customize-your-lightning-service-console-pages
19. Trailhead — Learn About Service Console Productivity Tools. https://trailhead.salesforce.com/content/learn/modules/service-cloud-agent-productivity/learn-about-service-console-productivity-tools **(trích)**
20. Trailhead — Use All the Service Console Productivity Tools Together. https://trailhead.salesforce.com/content/learn/modules/service-cloud-agent-productivity/use-all-the-tools-together **(trích)**
21. Salesforce Field Reference — AssetWarranty. https://developer.salesforce.com/docs/atlas.en-us.264.0.sfFieldRef.meta/sfFieldRef/salesforce_field_reference_AssetWarranty.htm **(trích; trang trả 403)**
22. Salesforce — Field Service Warranty Management Data Model. https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_warranty.htm **(trích; trang trả 403)**
23. Salesforce — Asset object reference. https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_asset.htm **(trích; trang trả 403)**
24. PTC ServiceMax Asset 360 — Case object (trường AssetId). https://support.ptc.com/help/servicemax_asset360/en/articles/asset-360/case-object.html **(bên thứ 3 với Salesforce, trích)**
25. Trailhead — Track Field Service. https://trailhead.salesforce.com/content/learn/modules/field_service_center/field_service_center_track **(trích)**
26. Salesforce — Field Service asset management (trang sản phẩm). https://www.salesforce.com/service/field-service-management/asset-management/ **(trích, marketing)**
27. Microsoft Learn — Manage customer assets in Dynamics 365 Field Service (12/11/2026). https://learn.microsoft.com/en-us/dynamics365/field-service/assets
28. Microsoft Learn — Build a service history for assets (20/07/2026). https://learn.microsoft.com/en-us/dynamics365/field-service/service-history
29. Microsoft Learn — Work order experience (10/11/2026). https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-experience
30. Microsoft Learn — Create warranties and define coverage (21/01/2026). https://learn.microsoft.com/en-us/dynamics365/field-service/warranties
31. ServiceTitan — Track & Manage Installed Equipment. https://help.servicetitan.com/docs/track-manage-installed-equipment
32. ServiceTitan — Manage equipment in ServiceTitan Mobile. https://help.servicetitan.com/residential-s-r/docs/manage-equipment-in-servicetitan-mobile
33. Housecall Pro — Property Profile. https://help.housecallpro.com/en/articles/3703307-property-profile
34. Jobber — Custom fields. https://help.getjobber.com/en/articles/custom-fields/ **(trích)**
35. Jobber Community — Equipment/asset history log. https://community.getjobber.com/discussions/insights-reporting/equipmentasset-history-log/2494/replies/15659 **(cộng đồng, trích)**
36. Zoho Desk — Contact and Accounts detail page. https://help.zoho.com/portal/en/kb/desk/contacts-and-accounts/articles/customer-module-the-contacts-and-accounts-detail-page **(trích)**
37. Zoho Desk — Adding and Associating Products with Tickets. https://help.zoho.com/portal/en/kb/desk/organization-settings/articles/adding-and-associating-products-with-ticket **(trích)**
38. Zoho Desk — Collaboration Over Comments. https://help.zoho.com/portal/kb/articles/collaboration-over-comments **(trích)**
39. Zoho Community — Managing threads within a Zoho Support request. https://help.zoho.com/portal/en/community/topic/managing-threads-within-a-zoho-support-request?page=22 **(cộng đồng, trích)**
40. Odoo 18 — Helpdesk: After-Sales services. https://www.odoo.com/documentation/18.0/applications/services/helpdesk/advanced/after_sales.html
41. Odoo 18 — Repairs: Repair orders. https://www.odoo.com/documentation/18.0/applications/inventory_and_mrp/repairs/repair_orders.html
42. Odoo 18 — Discuss: Chatter. https://www.odoo.com/documentation/18.0/applications/productivity/discuss/chatter.html **(trích)**
43. Odoo 18 — Helpdesk: Service level agreements (SLA). https://www.odoo.com/documentation/18.0/applications/services/helpdesk/overview/sla.html **(trích)**
44. Odoo Apps — FAL Serial Number Guarantee Management. https://apps.odoo.com/apps/modules/18.0/fal_sn_guarantee_management **(bên thứ 3, trích)**
45. Intercom — The help desk explained. https://www.intercom.com/help/en/articles/6258745-the-help-desk-explained
46. Intercom — Customize help desk to suit you. https://www.intercom.com/help/en/articles/7911926-customize-help-desk-to-suit-you-and-how-you-work-best **(trích)**
47. Intercom — Loop teammates into conversations. https://www.intercom.com/help/en/articles/6525765-loop-teammates-into-conversations **(trích)**
48. Front — How to see contact details and communication history. https://help.front.com/en/articles/2226
49. Front — How to start an internal discussion / comments. https://help.front.com/en/articles/2098 **(trích)**
50. Linear — Issue properties. https://linear.app/docs/issue-property
51. Linear — Display options. https://linear.app/docs/display-options **(trích)**
52. Linear — My issues. https://linear.app/docs/my-issues **(trích)**
53. Linear Changelog — Collapsed issue history (03/04/2025). https://linear.app/changelog/2025-04-03-collapsed-issue-history **(trích)**
54. PTC ServiceMax Asset 360 — Selecting Objects for the Timeline Configuration. https://support.ptc.com/help/servicemax_asset360/en/articles/asset-360/selecting-objects-for-the-timeline-configuration.html
55. PTC ServiceMax Asset 360 — Entitlement management. https://support.ptc.com/help/servicemax_asset360/en/articles/asset-360/entitlement-management.html
56. PTC ServiceMax Core — Creating Warranty on Installed Product Automatically. https://support.ptc.com/help/servicemaxcore/en/articles/core/creating-warranty-on-installed-product-automatically.html **(trích)**
57. Tavant — Warranty (trang sản phẩm). https://www.tavant.com/warranty/ **(trích, marketing)**
