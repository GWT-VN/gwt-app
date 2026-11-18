# GWT App v2.0.0 — mô tả app (đầu vào cho thiết kế UI)

Ngày 18/11/2026 · nhánh `rework/v2.0.0`. File này mô tả **app làm gì, cho ai, gồm những màn nào, chạy theo luồng nào**, đủ để thiết kế giao diện trước khi code. Bản cũ (`main`, production hiện tại) chỉ là tham chiếu nghiệp vụ — v2 dựng mới, không giữ cấu trúc cũ.

**Mốc nguồn:** code `origin/main` **6cfa48a** (gồm PR #20–22 ticket và #24 lỗi 4 nhóm — nhánh `rework/v2.0.0` cắt ở fa3f186 **chưa có** các PR này); đặc tả CSKH CEO chốt 17/11 `docs/cs/van-hanh/dac-ta-luu-y-khach-va-loi.md` (nhánh `docs/cskh-dac-ta-luu-y-loi`, chưa merge); code Kế toán trên các nhánh `feat/ke-toan-*` (chưa merge); repo bot `gwt-discord-bot` `origin/main`; kênh Discord #ai-team đến 17/11; doc "Việc AI team theo yêu cầu chị Trang".

**Cách đọc:** chữ thường = hiện trạng hoặc yêu cầu CEO đã nói; **(đề xuất)** = người viết đề xuất, CEO chưa chốt; câu còn mở gom ở **mục 10**.

## 1. App là gì

Webapp nội bộ của **GWT** — công ty phân phối và lắp đặt **máy lọc nước thương hiệu GE** (dòng POE lọc tổng, POU lọc tại vòi, máy RO…). Một app duy nhất cho mọi phòng ban, chung đăng nhập (Google `@gwt.vn`), chung thanh điều hướng, chung một cơ sở dữ liệu.

Vòng đời nghiệp vụ app phải phủ:

```
Bán (Sales) → Xuất kho (Kho) → Lắp đặt + kích hoạt bảo hành (CSKH/Kỹ thuật)
   → Bảo trì định kỳ, thay lõi (CSKH/Kỹ thuật) → Khách báo lỗi → Ticket → Xử lý (CSKH/Kỹ thuật)
Xuyên suốt: Việc (giao việc, nhắc việc, theo dõi) · Wiki (tài liệu nội bộ)
```

Quy mô: ~20 nhân viên, vài nghìn khách, vài nghìn máy đã lắp. Ngôn ngữ giao diện: **tiếng Việt**.

## 2. Người dùng

| Vai trò | Ai | Dùng màn nào nhiều nhất | Thiết bị |
| --- | --- | --- | --- |
| CEO / quản lý (chị Tuyết Trang) | giao việc, duyệt, xem báo cáo | Bảng team, task gấp, ticket mở lâu, báo cáo lỗi, doanh số | Laptop + điện thoại |
| Trưởng / nhân viên CSKH (Hiệp, Kiều Trang, Hiền, Tuyết Trang) | xử lý ticket, lên lịch bảo trì, theo dõi khách | Danh sách ticket, trang 1 ticket, lịch bảo trì, hồ sơ khách | Laptop |
| Kỹ thuật viên / CTV lắp đặt | đi hiện trường | **Lịch của tôi** (màn rút gọn), cập nhật xong việc | **Điện thoại** |
| Trưởng / nhân viên Sales | tạo đơn, quản lý khách, khuyến mãi, bảng giá | Đơn hàng, khách hàng, CTKM | Laptop |
| Kho | nhập/xuất, kiểm kê | Tồn kho, nhật ký nhập/xuất | Laptop + điện thoại |
| Marketing | tra wiki, dữ liệu video/ads | Wiki | Laptop |
| Admin hệ thống | nhân viên, phân quyền, nhật ký | Nhân viên, ma trận quyền | Laptop |

Một người có thể mang nhiều vai. Vai trò hiện có: `ceo, admin, quan_tri_ht, kt_giam_doc, ky_thuat, ctv_lap_dat, cs_manager, cs, sales_manager, sales, marketing, kho, ke_toan, tai_chinh`. Quyền chi tiết theo **ma trận mã quyền** (vd `cs.ticket.tao_sua`) — UI phải ẩn nút/menu khi không có quyền, không hiện rồi báo lỗi.

## 3. Khung giao diện chung

- **Khung điều hướng (chốt 18/11/2026 theo prototype F — nhánh `prototype/v2-khung`, `/prototype/khung?variant=F` chạy local; số đo lấy theo app ChatGPT):**
  - **Thanh icon** bên trái 52px, nền `muted`: logo GWT · một icon cho mỗi khu (khu đang mở = ô 36px nền `alpha-05`, icon đen `foreground`; icon thường xám `color-text-tertiary`; màu khu chỉ còn ở chấm trước tên khu trên panel; chấm đỏ = khu có việc gấp; rê chuột hiện nhãn đen bên phải) · lưới "Tất cả khu" = **app-launcher** (Nhân sự, Kế toán hiện xám "sắp có") · ⚙️ Quản trị và avatar ở đáy.
  - **Panel menu của khu** 288px, nền `sidebar`, ghép với vùng nội dung thành **một tấm bo góc trên-trái 12px**: đầu panel = tên khu (18px/600) + 🔔 thông báo + 🔍 tìm toàn cục (⌘K) · nút tạo của khu (vd "Tạo ticket") · các trang của khu (mục 30px, đang mở = nền `alpha-05`) · nhóm "Bộ lọc đã lưu" · nhóm "Gần đây" (5 mục + Xem thêm). Nhãn nhóm 14px chữ thường màu nhạt, không in hoa, không đậm.
  - **Agent Bắp = nút dock** tròn 48px góc dưới phải; số đỏ trên nút = gợi ý Bắp chủ động đưa ra. Bấm (hoặc ⌘J) mở khung chat nổi 400px phía trên nút; Bắp biết khu/màn đang mở.
  - **Điện thoại:** thanh trên gọn (☰ · tên khu); thanh icon + panel thành ngăn kéo trượt từ trái; Bắp mở toàn màn.
  - Thay cho thanh trên 2 tầng của bản đề xuất trước 18/11.
- Màu module hiện tại: Việc `#0e8c9a` · CSKH `#b5642a` · Sales `#2f7d8a` · Kho `#5560c9` · Wiki `#8a52b8` · Nhân sự `#b0518f` (chưa có) · Kế toán `#3f8a6a` (chưa có).
- **Hệ thiết kế v2 (chốt hướng 18/11/2026): component shadcn/ui + diện mạo OpenAI Apps SDK UI 0.2.2** — DS "GWT — OpenAI + shadcn" https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr (token, bảng ánh xạ shadcn ↔ OpenAI, 13 component mẫu). Nguồn token gốc + checksum: `docs/design-system/` nhánh `docs/nen-tang-openai-ds`. Chi tiết mục 8.1.
- Font: bản cũ nạp Geist nhưng thân trang hiện ra Arial, khu Work dùng font hệ thống — v2 dùng **một** font: **Inter** (anh Dũng chọn 18/11/2026; tự host qua `next/font`, có bộ dấu tiếng Việt). Mã đơn, serial, SĐT, tiền dùng Inter với `tabular-nums` (số thẳng cột) — **không dùng mono** (prototype 18/11: mono nặng mắt trong bảng).
- **Mẫu danh sách chuẩn** (dùng ở mọi khu): ô tìm kiếm không dấu · chip lọc · sắp xếp theo cột · phân trang · chọn nhiều dòng + thanh thao tác hàng loạt · nút xuất CSV/Excel.
- **Ô tìm toàn cục** mở từ 🔍 đầu panel menu hoặc ⌘K (thay trang `/tim` cũ): gõ SĐT, tên khách, serial, mã đơn, mã ticket → nhảy thẳng tới đối tượng.
- **Luật CEO 22/08:** danh sách chọn quá 10 mục phải **gõ để tìm**, không dùng `<select>` trần.
- Kỹ thuật viên đăng nhập chỉ thấy màn rút gọn (lịch của tôi), tối ưu điện thoại.
- Mockup CEO đã duyệt là "đẹp, dễ nhìn": https://claude.ai/artifact/Che3fXmSbZoeFVb8yA3N56#hom-nay — dùng làm chuẩn **bố cục và mật độ**; màu, chữ lấy theo DS mới. GWT Design System v4 (https://claude.ai/artifact/HPTEQYrb9ELXVVJof993zH) **không còn là chuẩn cho v2**.
- Phản hồi CEO về bản cũ: "design web xấu, khó nhìn", trang ticket "khó theo dõi, khó edit" → v2 ưu tiên: **thông tin chính lên trên, sửa ngay tại chỗ, ít form riêng**.

## 4. Module và màn hình

Ký hiệu: ✅ có ở bản cũ, mang sang (có thể thiết kế lại) · 🆕 mới ở v2 · 🔀 gộp từ nhiều màn cũ.

### 4.1 Việc (Work) — mọi nhân viên

| Màn | Nội dung |
| --- | --- |
| ✅ Việc của tôi | việc được giao, hạn, ưu tiên, việc con, phụ thuộc, người theo dõi |
| ✅ Bảng team | List + Kanban kéo thả; lọc theo người |
| 🆕 3 tab trên Bảng team | **Mọi người** (thêm cột Cập nhật cuối) · **Gấp** (quá hạn + hạn hôm nay + việc gấp) · **Lâu không đụng** — mỗi tab một bộ lọc đặt sẵn, gom việc cũ để xử lý hàng loạt |
| ✅ Việc tự sinh | luật sinh việc định kỳ (chỉ quản lý) |
| 🆕 Nhắc việc theo giờ | lời nhắc gắn vào task, có giờ, người được nhắc, có nhắc cả người giao |
| 🆕 Task AI + màn nghiệm thu | việc giao cho đội AI: nhãn AI + app liên quan, link tin gốc; **màn nghiệm thu**: danh sách yêu cầu của CEO → trạng thái từng yêu cầu → link xem kết quả → CEO **comment thẳng** vào từng mục (sửa tiếp / hiểu sai) — chi tiết 7.14 D4 |
| 🆕 Ý tưởng cho App | việc làm tay hằng ngày của Sales/CSKH được Claude tổng hợp cuối ngày và đề xuất tính năng; tách riêng khỏi "yêu cầu" (7.14 D8) |
| 🆕 Tổng kết tháng | theo người: số việc xong, thời gian hoàn thành TB, số trễ; ô nhận xét kết quả từng việc |
| ⏸ Lịch, Dự án | nhãn "sắp có" ở bản cũ; **ngoài phạm vi v2.0** trừ khi CEO yêu cầu (mục 10) |

### 4.2 CSKH — chăm sóc khách sau bán

| Màn | Nội dung |
| --- | --- |
| 🆕 **Việc hôm nay** (`/hom-nay`, đặc tả 17/11) | màn mở đầu ca của CSKH: ca khẩn · việc tiếp theo quá hạn · lời hứa đến hạn · lịch KT hôm nay · việc *Chờ* tới ngày xem lại · **bàn giao ca** (việc tạo ca tối/cuối tuần, việc đến hạn ca sau); ⚠️ trên việc có lưu ý đỏ. Dùng được cho CSKH chính, người trực thay, CTV ca tối. Mockup CEO duyệt trỏ đúng màn này (`#hom-nay`) |
| ✅ Tổng quan | số liệu chính của khu |
| ✅ Máy đã lắp + chi tiết máy | serial, model, khách, bảo hành (máy + lõi), lịch sử lõi, vòng đời serial, ticket |
| ✅ Kho serial | serial xuất xưởng, nhập lô, duyệt serial chờ (nằm ở CSKH vì CSKH quản; Kho hàng hoá ở 4.4) |
| 🔀 Khách hàng | danh sách + bộ lọc (cần dọn, thiếu SĐT, kênh máy điền/người điền/trống) thay cho 3 màn cũ; **hồ sơ khách 360** (đã mua, máy, bảo trì, ticket, nước); gộp khách trùng |
| 🆕 **Thẻ lưu ý khách** (đặc tả 17/11) | 6 loại (📞 liên lạc · 🏠 vào nhà & công trình · 🔧 điều kiện kỹ thuật · 🤝 cam kết đã hứa — chỉ ghi sau khi CEO duyệt · ⚠️ rủi ro · 🙂 cách phục vụ) × 3 mức (🔴 phải đọc · 🟡 nên biết · ⚪ thông tin), 1 câu ghi **hành vi cụ thể, không phán xét**, ai cần thấy, hết hạn tuỳ chọn, gắn khách hoặc 1 máy. Thêm **lưu ý tự động** (khiếu nại mở, hỏng lại ≤30 ngày, BH 2 lần cùng lỗi, lõi/bảo trì quá hạn, BH sắp hết, chấm ≤3 sao, VIP, mua qua đại lý). Hiện ở: đầu hồ sơ khách (đủ, sửa được) · đầu ticket (🔴🟡) · lúc tạo ticket/tra SĐT (bật lên, bấm "Đã đọc") · phiếu việc KT (🏠🔧🔴) · Việc hôm nay. Thay ô ghi chú tự do cũ |
| ✅ Kênh / đối tác | danh mục kênh 2 cấp + số khách đã gắn (chỉ đọc) |
| ✅ Danh sách ticket | 🆕 cột **Số ngày mở** (hôm nay − ngày tạo; ticket đã đóng thì tính đến ngày đóng), tô màu khi mở quá X ngày; tab nhanh: Tất cả · Thiếu serial · Mở quá lâu · Của tôi (theo **chủ ticket**) |
| ✅ Trang 1 ticket | 🆕 bố cục 2 cột: trên cùng mã · loại · model · tỉnh · lưu ý 🔴🟡 + ô sửa nhanh (Trạng thái · Khẩn · Chủ ticket · Kỹ thuật) + **4 trường bắt buộc** (Chủ · Việc tiếp theo · Người đang phải làm · Hạn) + "Mở N ngày · K lần lỗi"; bên dưới **nhật ký theo lần báo**: mỗi lần khách báo một dòng có ngày (chọn ngày lùi), dưới mỗi lần **nhiều dòng xử lý** có ngày (đã gửi phương án gì, đang chờ gì); cột phải: khách & máy, chi phí/vật tư, lời hứa, nút "Khách hỏi lại", nút tạo phiếu việc KT |
| ✅ Tạo ticket | tạo được khi **chưa có serial**; thêm loại ticket mới ngay ở form; tra SĐT → bật Thẻ lưu ý khách, bấm "Đã đọc" mới đi tiếp |
| 🔀 Lỗi (danh mục + báo cáo) | đã có trên `main` từ 18/11: **4 nhóm** Main · Rò rỉ nước · Chất lượng nước · App + nhóm **"Không phải lỗi"** (bảo trì, thay lõi, hướng dẫn — không tính vào báo cáo lỗi); mỗi mã lỗi là một nhóm con; báo cáo 3 tab **Theo nhóm lỗi** (nhóm → SKU → ticket) · **Theo máy/SKU** (SKU → nhóm → serial) · **Theo tháng**. v2 gộp thêm trang Nhóm lỗi kiểu cũ (gom theo biểu thức) vào đây. Đợt 2–3 đặc tả: cây chẩn đoán từ xa theo mã lỗi, nguyên nhân thật / đã làm gì / hỏng lại, Pareto, xuất báo cáo tháng cho hãng |
| ✅ Bảo hành | đăng ký BH máy lẻ / bộ combo, hàng chờ kích hoạt, đổi máy / thu hồi |
| ✅ Lịch bảo trì | danh sách + lịch tháng; **Gắn gói vào khách** (route cũ `/bao-tri/map` — là màn ghép dữ liệu, **không phải bản đồ**); lên lịch & gói; 🆕 rà lịch thiếu/sai, dễ dùng hơn (CEO: "tính năng nào còn dốt thì sửa") |
| 🆕 Báo cáo sau dịch vụ (đặc tả 17/11, Đợt 2) | app soạn từ phiếu KT đóng (việc đã làm, ảnh trước/sau, chỉ số nước, lõi thay, phí) → CSKH xem, sửa câu chữ → **Gửi Zalo** (chặn gửi khi thiếu ảnh/chỉ số) → đặt kỳ tiếp theo + nút chấm sao |
| ✅ Lịch thay lõi | (đổi tên route `/loi` để khỏi lẫn với "lỗi") |
| ✅ Hồ sơ nước | chỉ số nước theo khách/tỉnh |
| ✅ Kỹ thuật | hồ sơ KTV; **bảng điều phối tuần** theo từng KTV (route cũ `/ky-thuat/lich`); tạo phiếu việc; **Lịch của tôi** (điện thoại) |
| 🆕 Lịch kỹ thuật gắn khách | việc kỹ thuật liên quan khách lên lịch theo khách, tách việc công ty (chờ yêu cầu chi tiết) |
| ✅ Doanh số CSKH | tổng các hạng mục có thu phí trong ticket theo tháng × mã (route cũ `/doanh-so`, chỉ admin) |

**Người trên ticket — 3 vai tách nhau:** *chủ ticket* (chịu trách nhiệm đến khi đóng; tab "Của tôi" lọc theo người này) · *người đang phải làm* việc tiếp theo · *kỹ thuật viên*. Chủ ticket chọn từ **danh sách người CSKH cấu hình được** (hiện 4 người: Hiệp, Kiều Trang, Hiền, Tuyết Trang) — **tách khỏi tài khoản đăng nhập** vì email đang dùng chung (CEO 17/11), có thể gắn Discord ID. Bản cũ đang có 2 cột chồng nhau (`cs_phu_trach` theo tài khoản, `cs_theo_doi` theo tên) — gộp thế nào: mục 10.

### 4.3 Sales

| Màn | Nội dung |
| --- | --- |
| ✅ Đơn hàng | danh sách (tab POE / POU / Khác / Tặng), chi tiết đơn, tạo/sửa đơn; mã tự sinh `YYMMDD-{E\|U\|O}nnn` |
| ✅ Khách hàng | danh sách, hồ sơ, thêm/sửa, cảnh báo trùng SĐT |
| ✅ Khuyến mãi (CTKM) | chương trình, điều kiện, nhân bản |
| ✅ Bảng giá & đại lý | giá theo bậc, gán bậc cho đối tác |
| 🆕 Đơn Hannah Olala | theo dõi **1–2 link Google Sheet** HO mỗi tháng (nhiều link cùng lúc, thêm/gỡ được); app đọc định kỳ, **dòng mới → báo Discord**; đơn từ "Đang đóng gói" trở đi đẩy vào "excel của mình" (đích Sheet hay DB: mục 10), bỏ Yêu cầu huỷ / Chưa xử lý, không ghi trùng — 7.10 |
| 🆕 Đối soát Viettel Post | trạng thái giao từng đơn, báo Discord khi giao xong; khớp tiền COD từng đơn từ bảng kê VTP — 7.11 |
| ⏸ Báo giá · Hợp đồng · Doanh số Sales · Kênh/đối tác Sales | nhãn "sắp có" ở bản cũ, chưa có yêu cầu chi tiết — **ngoài phạm vi v2.0** trừ khi CEO yêu cầu (mục 10) |

### 4.4 Kho

✅ Tồn kho · Nhật ký nhập/xuất · Chờ duyệt mã · Báo cáo tháng · Thẻ kho từng mã · Kiểm kê · Lịch sử sửa. Kho Nguyễn Xiển lấy từ sổ do bot Bắp ghi; kho HCM sẽ lấy từ API Eton. (Serial xuất xưởng quản ở CSKH, 4.2.)

### 4.5 Wiki

✅ 9 khu: Sản phẩm · Marketing video · Kho video · Kiến thức nền · Công việc chung · Sales · CSKH · Vận hành · Tài chính. Marketing có thêm: các trang dữ liệu (phân tích video, phân tích chuyên sâu, ý tưởng video, kho hook/CTA, kết quả ads), các khung lý thuyết (5A, PAAST, SECI, quy trình, luật sửa), kho case, luật QC, phân tích kênh; Sản phẩm có trang tra cứu theo mã. **Wiki chỉ đọc**: nội dung cập nhật qua repo (CEO thả file → Claude đưa lên, `docs/wiki-cap-nhat.md`), **không có trình soạn thảo trong app**. v2: một kiểu trang tài liệu duy nhất cho mọi bài + tìm kiếm.

### 4.6 Quản trị

✅ Nhân viên · Ma trận phân quyền · Hàng chờ duyệt · Nhật ký thao tác · Đồng bộ catalog (kéo danh mục sản phẩm/giá từ Masterdata) · 🆕 Cấu hình thông báo Discord (mục 5).

### 4.7 Module khác

- **Kế toán:** có đặc tả (7.12) và code đã làm tới "lát 5" trên các nhánh `feat/ke-toan-*`, **chưa merge**. Đưa vào v2.0 hay để sau: mục 10.
- **Nhân sự:** chưa có gì trong app; bot Admin đang ghi sổ quỹ, chấm công, hàng tặng vào Google Sheet / Admin Portal (7.14) — là đầu vào khi làm module này. Dành chỗ trong launcher.

## 5. Discord ↔ app (kênh vào chính của v2)

Đội làm việc trên Discord. v2 coi Discord là **một cửa vào app** (qua agent Bắp) và **một cửa ra** (app báo vào kênh). Hôm nay bot đã ghi thẳng ticket, sự kiện serial, sổ kho vào DB và đọc đơn — nhưng chưa có gì vào Work, chưa có bảng nối Discord ID ↔ nhân viên, và app chưa gửi được thông báo nào. Chi tiết hiện trạng và 8 luồng đích (giao việc, báo cáo, nhắc theo giờ, task AI + nghiệm thu, việc của tôi, thông báo ra, tổng kết tháng, ý tưởng cho app): **mục 7.14**.

Hệ quả cho UI: mỗi task/ticket/đơn/dòng kho hiện **nguồn** (app / Sheet / Discord ↗ + link tin / bot); nhật ký ghi rõ "qua Discord" và người ra lệnh; hồ sơ nhân viên có ô Discord ID; một màn **cấu hình thông báo** (loại thông báo × kênh × bật/tắt).

## 6. Nền dữ liệu v2

- **Hiện trạng:** app dùng 2 DB — GWT-SalesTracking (CSKH, Sales, Work, ticket bot) và GWT-Masterdata (sổ kho `wh_*`, catalog gốc, wiki, tồn Shopee); thêm một Supabase riêng của Marketing Kit cho dữ liệu video/hook.
- **Một Supabase duy nhất: GWT-Masterdata** (anh Dũng chốt hướng 18/11/2026, ghi ở doc AI-Team mục "Trước khi build": review code → file mô tả app → **chuyển data về 1 Masterdata** → build phần agent tích hợp; kế hoạch chuyển chưa có). Data đang ở GWT-SalesTracking (CSKH, Sales, Work) chuyển sang Masterdata. Các bot đang ghi vào SalesTracking (ticket, serial, đơn) phải đổi đích cùng lúc.
- **Xung đột cần giải:** luật nền tảng "bảng khách gốc `customers` ở Masterdata chỉ chị Trang thêm mã" đụng với ý v2 "khách gõ tay ở đơn tạo luôn hồ sơ" (7.1) và "một hệ khách" (7.2) — mục 10.
- **Object ngoài migration:** hàm `bot_tao_ticket` mà bot ticket gọi **không có trong file migration nào** (chỉ được nhắc trong chú thích) — là drift, v2 phải hợp thức hoá khi chuyển DB.
- **Mỗi module một schema riêng** (tiếng Anh, snake_case, bảng số nhiều): vd `cs`, `sales`, `work`, kho đã có. Bảng nhiều module dùng chung (`staff`, khách, catalog) ở `public`; hợp đồng đọc chéo module qua schema `api` (chỉ view/RPC).
- Migration viết ở repo **GWT-Masterdata**, đi đủ quy trình DDL (CI `db-reset` xanh trước khi áp live).
- Masterdata gốc `catalog_item`, `customers`, `installed_base`, `customer_contacts` chỉ chị Trang thêm mã.
- Kế hoạch chuyển data là việc riêng, chưa chốt.

## 7. Luồng công việc

Mỗi luồng: **hiện trạng** (lần theo code, có dẫn file) → **v2 cần** (yêu cầu CEO ghi rõ nguồn; phần còn lại là **(đề xuất)**). Ký hiệu vai: **CS** = nhân viên CSKH (gồm người trực thay, CTV ca tối) · **TCS** = trưởng CSKH hoặc admin · **KTV** = kỹ thuật viên/CTV lắp đặt · **SL** = Sales · **TSL** = trưởng Sales · **AD** = admin · **NV** = mọi nhân viên đang hoạt động · **"người có quyền X"** = ai được tick mã quyền X · **Bot** = bot Discord · **Hệ thống** = app tự chạy.

### 7.0 Chuỗi giá trị, chỗ đứt, và chủ của từng bước chuyển

**Hiện trạng:**

```
[Sales chốt đơn] ──✗──> [Kho xuất] ──✗──> [KTV lắp] ──✗──> [CS kích hoạt BH] ──✗──> [Gói bảo trì]
        │                    ↑                                   ↑
        └─(bot ghi Sheet)    └─ bot Bắp ghi sổ từ Discord        └─ hàng chờ BH đọc đơn Sales loại Máy
[Khách báo lỗi / bot ticket] → [Ticket] → [Phiếu việc KTV] → [KTV xong] → ticket tự Done
```

**✗ = bàn giao bằng tay, hệ thống không nối.** Đơn không sinh phiếu xuất kho (sổ kho không có mã đơn); xuất kho không sinh lịch lắp; việc "lắp máy" của KTV xong không kích hoạt bảo hành; dòng DVBT trên đơn không tự sinh gói bảo trì (RPC `activate_and_seed` có nhưng app không gọi). Ô "Kích hoạt BH" trên đơn chỉ là dấu tick.

Thông báo: khu CSKH, Sales, Kho hiện **không gửi gì** ra Discord/email; chỉ có tín hiệu trong app (nhãn "Mới" trong 24h, Khẩn lên đầu, chip đếm). Discord chỉ đi chiều vào (bot tạo ticket, bot ghi sổ kho).

**(đề xuất) v2 nối chuỗi — mỗi bước chuyển trạng thái chỉ có MỘT chủ:**

| Sự kiện (ai làm) | Hệ thống tự làm | Trạng thái đơn sau đó |
| --- | --- | --- |
| SL bấm *Xác nhận* đơn | tạo **phiếu xuất kho chờ** gắn mã đơn | Xác nhận |
| Kho xác nhận xuất (trên app hoặc bot Discord có mã đơn) | trừ tồn, gắn serial đã xuất vào đơn | Đang giao |
| Giao xong (VTP báo, hoặc SL bấm) | đơn có máy cần lắp → tạo **phiếu việc KTV "lắp máy"** | Đã giao chờ lắp (không lắp → Hoàn thành) |
| KTV đóng phiếu "lắp máy" **có nhập serial** | máy đã lắp `active` · **kích hoạt BH** · sinh **gói bảo trì** từ dòng DVBT · đề xuất báo cáo sau lắp đặt | Đã lắp đặt |
| SL/kế toán ghi đủ tiền (hoặc đối soát VTP khớp) | — | thanh toán: Đã thu đủ |

**Luồng ngược phải có (đề xuất):**
- **Đơn huỷ / hoàn hàng** sau khi đã có phiếu xuất → phiếu nhập trả kho; đã có phiếu việc KTV → huỷ phiếu; đã kích hoạt BH → thu hồi máy theo luồng 7.6 (không xoá bảo hành).
- **Đơn HO chuyển "Yêu cầu huỷ"** sau khi đã nhập → không tự xoá; đánh dấu + báo Discord để SL xử lý.
- **Tin Discord bị xoá** sau khi bot đã tạo bản ghi → bản nháp/chưa xác nhận thì huỷ; đã xác nhận thì chỉ ghi chú "tin gốc đã xoá", không tự huỷ.

### 7.1 Bán hàng — tạo, sửa, xoá đơn

**Kích hoạt:** SL bấm "＋ Tạo đơn" ở `/sales`.

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | SL · `/sales/don/moi` | Chọn khách cũ (tìm không dấu) hoặc gõ tên/SĐT khách mới | Khách mới **chỉ lưu vào đơn, không thành hồ sơ khách** |
| 2 | SL | Ngày đơn, kênh 2 cấp, các dòng: mã nội bộ · SL · đơn giá **đã gồm VAT** · VAT (0/8/10%, KCT, KAD; trống = 8%) · tick Quà · ghi chú | Dòng DVBT: SL = số lần bảo trì. Dòng quà = 0 đ |
| 3 | Hệ thống | Gợi ý giá theo bậc đại lý / CTKM (7.3), mời thêm quà của chương trình | Chỉ điền vào dòng chưa gõ tay giá |
| 4 | SL | 31 ô theo dõi kiểu Sheet, ẩn/hiện theo loại đơn: chung (chi tiết kênh, quà, tracking, kích hoạt BH, email, tiền cọc) · POU/Khác (gửi HDSD, xuất HĐ, đã đối soát) · POE (số HĐ, folder, tiền sẽ thu, biên bản, báo cáo lắp, tiến độ lắp, tủ điện, khảo sát, công ty xuất HĐ/MST) | |
| 5 | Hệ thống · Lưu | Kiểm: ≥1 dòng, mọi dòng có mã, có ngày, có khách | Loại đơn suy từ danh mục: có POE → POE, có POU → POU, còn lại Khác. Mã `YYMMDD-{E\|U\|O}nnn` (số lớn nhất +1 trên cả 2 bảng đơn, đụng thì thử lại ≤6 lần). Ghi đầu đơn + dòng; dòng hỏng thì xoá đầu đơn |
| 6 | Bot (ngoài app) | Ghi đơn app lên Google Sheet; từ đó **Sheet là nguồn chuẩn** cho các ô Sheet có | Sửa đơn: bot chỉ đẩy ô đã đổi. Xoá đơn: Sheet không xoá dòng, đặt "Huỷ" |

**Sửa/xoá:** chỉ đơn tạo trên app (đơn từ Sheet báo lỗi rõ). Sửa = cập nhật đầu đơn, xoá hết dòng rồi chèn lại; giá cũ giữ nguyên, không tự đổi theo khuyến mãi hôm nay. Xoá hỏi "không hoàn tác". Ai vào được Sales đều sửa/xoá được mọi đơn.

**Trạng thái** (chọn tay, không có máy trạng thái, mặc định Mới / Chờ cọc):
- Hàng: Mới · Xác nhận · Chuẩn bị hàng · Đang giao · Đã giao chờ lắp · Đã lắp đặt · Hoàn thành (không lắp) · Hoàn hàng · Huỷ
- Thanh toán: Chờ cọc · Đã cọc · Chờ đối soát · Còn nợ · Đã thu đủ · Hình thức: Chuyển khoản / COD / Tiền mặt

**Nguồn đơn:** (a) Sheet → `sales_order_lines` (Apps Script xoá sạch rồi nạp lại mỗi lượt) + ô bổ sung `sales_order_sheet_bo_sung`; (b) đơn app `sales_orders`; (c) đơn tặng chỉ có trong `customer_purchases`, không có tiền. Danh sách `/sales` gộp 3 nguồn lúc đọc, tab POE/POU/Khác/Tặng, lọc ngày/tình trạng/thanh toán/kênh/sản phẩm, tối đa 300 đơn.

**Ngoại lệ:** bán dưới giá đã duyệt chỉ cảnh báo, không chặn; mã chưa có giá niêm yết → tự nhập giá.
**Quyền:** cổng vai `admin/sales/sales_manager`; mã `sales.don.xem/ghi` đã khai nhưng chưa dùng.
**Thông báo:** không có. Nhật ký thao tác có ghi.

**v2 cần (đề xuất — CEO chưa yêu cầu cụ thể cho Sales ngoài HO và VTP):**
- Một bảng đơn duy nhất; Sheet thành bản xuất (theo lộ trình bỏ Apps Script A→D đã có trong `docs/sales/LO-TRINH-BO-APPSCRIPT.md`), một bên cấp mã đơn.
- Khách gõ tay **tạo luôn hồ sơ khách** (qua `ChonKhach` có tra trùng SĐT) — vướng luật Masterdata gốc, mục 10.
- Trạng thái hàng thành **máy trạng thái** theo bảng chủ-sự-kiện ở 7.0; bước chuyển do hệ thống làm thì không cho chọn tay.
- **Màn nhập dòng đơn** chuyên dụng (`BangDongDon`, mục 8): mã · SL · giá đã gồm VAT · VAT · quà · gợi ý giá + 31 ô theo dõi ẩn/hiện theo loại đơn.
- Thanh toán nhiều đợt (cọc, các đợt, COD), phân quyền sửa/xoá, báo Discord đơn chờ cọc lâu — mục 10.

### 7.2 Khách hàng — tạo, trùng, sửa có duyệt, gộp, kênh

Hiện có **hai hệ khách**: Sales (`customers`, mã `KH…` từ Sheet / `KA…` tạo trên app) và CSKH (`cs_customers`), nối qua `customer_code`; mã người hệ mới `KH-YYMM-NNNN` dùng chung cho cùng SĐT.

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1a | SL · `/sales/khach/moi` | Gõ SĐT trước → tra **9 số cuối** trên cả 2 hệ + SĐT phụ; trùng thì cảnh báo + link, khớp bên CSKH thì tự điền ô trống. **Không chặn lưu.** Cần Tên hoặc SĐT | Mã `KA` + 5 số |
| 1b | CS · `/khach/moi` | Tên bắt buộc; SĐT trống → cờ "thiếu SĐT", có gõ thì phải đúng dạng; **trùng 9 số cuối thì chặn** và chỉ sang khách cũ; kèm SĐT phụ, địa chỉ phụ | Tạo thẳng `da_duyet` |
| 2 | SL · sửa | Khách `KA` sửa mọi ô; khách `KH` (từ Sheet) chỉ sửa ô app làm chủ (kênh, sales phụ trách, email, ngày sinh, công ty, người đại diện) — còn lại bị Apps Script ghi đè | |
| 3 | CS · sửa | Sửa khách, xoá SĐT phụ, sửa/xoá lịch thay lõi, xoá/đổi khách/đổi serial máy → **yêu cầu thay đổi**: TCS áp ngay; người khác vào hàng chờ | `yeu_cau_thay_doi: cho_duyet → da_duyet \| tu_choi` |
| 4 | TCS · `/duyet` | Duyệt từng cái hoặc hàng loạt (duyệt = áp thật), từ chối kèm lý do. Khối "yêu cầu xuất file có SĐT/địa chỉ": duyệt xong người xin **tải một lần** | xuất: `cho_duyet → da_duyet → da_tai \| tu_choi` |
| 5 | TCS · `/khach/gop` | Hệ thống ghép cặp nghi trùng theo tên; chặn khi bản bị gộp nhiều dữ liệu hơn bản giữ; gộp chuyển 5 bảng tham chiếu, trộn trường, ẩn mềm bản bị gộp. **Xoá/gộp chỉ admin áp** | khách `da_duyet → da_xoa` (mềm) |
| 6 | CS | Gắn kênh từ danh mục kênh 2 cấp; gắn tay thì đánh dấu "người điền" (khác "máy điền") | |
| 7 | SL | Xoá khách `KA` chỉ khi chưa có đơn và chưa nối CSKH | |

**Hồ sơ khách 360** (Sales): đã mua · máy · bảo hành · gói bảo trì · ticket (khi đã nối CSKH).
**Quyền CSKH:** `cs.khach.xem/sua/xin_xoa/gop/duyet_cho/xin_xuat/duyet_xuat/duyet_xoa`, `cs.yeu_cau.*`.
**Đang vướng:** trùng SĐT chỉ đếm, không ràng buộc DB; khối "Khách mới chờ duyệt" ở `/duyet` thừa (không code nào còn tạo khách chờ duyệt); danh sách "cần dọn" không loại khách đã xoá; Sheet ⇄ app chưa chốt ai thắng.

**v2 cần (đề xuất):**
- **Một hệ khách**, một mã, một form, một luật trùng SĐT (mục 10: chặn hay cảnh báo; và ai được tạo mã khách theo luật Masterdata). Sheet không còn ghi đè khách.
- **Thẻ lưu ý khách** thay ô ghi chú tự do (đặc tả CEO 17/11, xem 4.2): ghi chú cũ chuyển sang thẻ loại 🙂 mức ⚪; sửa = gỡ cái cũ + ghi cái mới (giữ lịch sử); không ghi giấy tờ tuỳ thân, tài khoản ngân hàng, chuyện riêng (Luật BVDLCN 91/2025).
- Giữ cơ chế **sửa nhạy cảm qua duyệt** và **xuất dữ liệu cá nhân qua duyệt, tải một lần** — áp cho mọi khu, không riêng CSKH.
- Gộp trùng giữ nguyên luật an toàn (không gộp bản nhiều dữ liệu vào bản ít).
- Danh sách khách một màn với bộ lọc: cần dọn · thiếu SĐT · kênh máy điền/người điền/trống.
- Quan hệ khách cuối ↔ đại lý (`doi_tac`, thiết kế đã duyệt): không gắn thẳng vào đơn, không tự ghép.

### 7.3 Giá, bậc đại lý, khuyến mãi (CTKM)

| Việc | Hiện trạng |
| --- | --- |
| Giá niêm yết | Bản sao chỉ đọc từ Masterdata (`product_price` kênh `NIEM_YET`); mới phủ ~37/53 mã đang bán |
| Chính sách theo bậc · `/sales/gia/chinh-sach` | Mỗi ô (bậc × mã) đặt theo % hoặc giá, lưu cả hai. Bản cũ chuyển `thay_the` và đóng ngày hiệu lực, không xoá. **Có hiệu lực ngay, không qua duyệt.** Sửa hàng loạt chỉ theo % |
| Gán bậc · `/sales/gia/doi-tac` | NPP (1) · Đại lý (2) · Giới thiệu (3). Mỗi khách một bậc đang hiệu lực; gán mới đóng bậc cũ; có lịch sử |
| Định nghĩa CTKM | Tên, mô tả cho khách, lưu ý nội bộ, từ–đến ngày; kiểu giảm: % có trần · tiền · "giảm còn" · chỉ tặng quà; mức chung + mức theo mã; **kênh bắt buộc**; nhóm khách (tất cả / mới / đã mua / chỉ định); loại trừ theo khách · kênh · bậc · mới/đã mua (**loại trừ thắng mọi luật**); cờ cộng dồn; quà (mã, SL, giá trị quy đổi, điều kiện chữ tự do) |
| Vòng đời CTKM | `nhap → ban_hanh` (chỉ người có quyền duyệt, cần ≥1 kênh) → `ket_thuc` ("kết thúc sớm" = đến hôm nay). **Sửa chương trình đang chạy → về nháp, duyệt lại.** Chỉ xoá bản nháp. "Nhân bản sang tháng" tạo nháp |
| Gợi ý giá trên đơn | Đổi khách/kênh/ngày → tính lại: (1) khách có bậc + mã có chính sách → giá bậc, không ăn khuyến mãi lẻ (vẫn nhận quà); (2) còn lại: niêm yết − chương trình giảm sâu nhất (không cộng dồn) − lần lượt các chương trình cộng dồn; (3) không có niêm yết → để trống |

**Quyền:** `sales.ctkm.xem` · `soan` (sales, sales_manager, admin) · `duyet` (ceo, admin).
**Đang vướng:** "đơn tối thiểu / SL tối thiểu" lưu nhưng không áp; điều kiện quà chỉ là chữ; khách gõ tay không xét được mới/đã mua; CTKM chờ duyệt không báo ai.

**v2 cần (đề xuất):** áp thật điều kiện tối thiểu (hoặc bỏ ô); chính sách giá theo bậc qua duyệt như CTKM (mục 10); báo người duyệt khi có CTKM/chính sách chờ duyệt; màn so sánh giá (niêm yết · bậc · CTKM) theo mã; ma trận giá bậc × mã (`MaTranGia`, mục 8).

### 7.4 Kho — nhập/xuất, duyệt mã, sửa, kiểm kê, báo cáo

Dữ liệu kho nằm ở **DB Masterdata** (`wh_*`), app đọc/ghi qua hàm DB.

| # | Ai · Nơi | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | Anh kỹ thuật · Discord kênh kho Nguyễn Xiển | Nhắn theo mẫu `<ngày> kho xuất/nhập` + `tên : SL lý do` | |
| 2 | Bot Bắp (~20 giây/lượt) | Ghi sổ; tên nhận ra mã → `approved`, không nhận ra → `need_review`. Tin Discord bị sửa → ghi lại, **trừ dòng đã sửa tay trên app** (bị khoá). Ghi thêm sự kiện serial nhập/xuất (không đổi trạng thái máy); serial lạ → chờ duyệt ở `/serial` | Loại: Nhập · Xuất · Điều chỉnh. Kho NX (mặc định) · HCM |
| 3 | Người có quyền sửa · `/kho/cho-duyet` | Chọn mã (bot gợi ý sẵn), tuỳ chọn "nhớ tên này" → lần sau bot tự nhận; hoặc "Bỏ qua" (không phải hàng kho) | `need_review → approved \| rejected`. **Dòng chờ không tính tồn** |
| 4 | · `/kho/nhat-ky` | Sửa ngày/loại/mã/SL/lý do/ghi chú + lý do sửa (chỉ gửi trường đổi; dòng bị khoá khỏi bot). Huỷ: bắt buộc lý do, chuyển `rejected`, không xoá | Kiểm: SL ≠ 0, Nhập/Xuất dương |
| 5 | · `/kho/kiem-ke` | Nhập SL đếm từng mã → mã lệch sinh dòng **Điều chỉnh** đã duyệt, hiệu lực ngay | không âm, không trùng mã |
| 6 | Mọi NV · `/kho`, `/kho/bao-cao`, `/kho/ma/[ma]` | Tồn theo mã (cảnh báo sắp hết / âm), báo cáo tháng (đầu kỳ · nhập · xuất · điều chỉnh · cuối kỳ), thẻ kho có số dư chạy, tóm tắt bằng lời | |
| 7 | — · `/kho/lich-su-sua` | Mọi lần sửa từ app/Sheet/bot đều ghi: ai · nguồn · trước → sau · lý do | Google Sheet "Kho máy GWT" đồng bộ 2 chiều ~20 giây |

**Quyền:** `kho.ton.xem` (mọi NV) · `kho.so.sua` (mặc định admin: sửa, huỷ, duyệt, kiểm kê).
**Đang vướng:** chưa chốt tồn đầu kỳ (app ghi rõ số tồn chưa phải tồn thực tế); không nối đơn Sales; kho HCM sẽ lấy API Eton; cảnh báo sắp hết chỉ hiện trên màn.

**Kho HCM qua Eton** (doc AI-Team mục 4, tab Tiến độ Hiệp): Eton có **14 API chỉ đọc**; báo 2 gói — DAY 2.000.000 đ/ngày (ước 1–3 ngày → 2–6 triệu) và MONTH 15.000.000 đ/tháng. Đang hỏi lại Eton (chị Ngọc nghỉ tới hết 18/11): chỉ lấy client_id/secret thì phí bao nhiêu; có client_id rồi GWT tự gọi API được không hay phải làm cùng team Eton; gói DAY có bắt buộc không. CEO quyết sau khi có giá.

**v2 cần (đề xuất):** phiếu xuất gắn **mã đơn** (từ 7.0) và serial; nhập trả kho khi đơn huỷ/hoàn; chốt tồn đầu kỳ (mục 10); báo Discord khi sắp hết hàng; nguồn HCM từ API Eton (khi CEO duyệt chi phí); giữ nguyên cơ chế khoá dòng sửa tay và nhật ký sửa (hiển thị bằng `TheDuyetDiff` trước → sau).

### 7.5 Serial xuất xưởng

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | TCS · `/serial` | Tạo một serial, hoặc nhập lô dán từ Excel (serial, PO, ngày) với một mã nội bộ chung; bỏ qua trùng kho / trùng hàng chờ / trùng trong lô | `serial_registry` |
| 2 | Người có quyền kho · bot kho | Serial lạ → hàng chờ | `serial_pending: cho_duyet` |
| 3 | TCS | Duyệt (vào kho) · từ chối kèm lý do · xoá | `→ da_duyet \| tu_choi` |
| 4 | — | Sự kiện vòng đời serial (nhập kho, xuất kho, lắp, thu hồi…) sửa/xoá được; trạng thái tính theo sự kiện mới nhất | `serial_su_dung` |

**Trạng thái serial:** `ton_kho → da_lap → bao_tri | thu_hoi_bao_hanh` + trạng thái kho đặt tay (danh mục admin sửa được, phải ghi mô tả hiện trạng).
**Quyền:** `cs.serial.kho` · `cs.serial.duyet` · `cs.may.trang_thai`.
**Đang vướng:** serial gõ nhầm kiểu `V9l/V9I`; serial chưa có mã nội bộ; CS thường không tạo được serial chờ (quyền ở TCS).
**v2 cần (đề xuất):** serial là **một vòng đời liên tục** từ nhập xưởng → kho → đơn → lắp → bảo hành → thu hồi, hiện trên một trang máy; kiểm dạng serial theo từng model; nhập lô bằng dán Excel có xem trước (`NhapCoXemTruoc`); KTV quét/nhập serial trên điện thoại (`OQuetSerial`).

### 7.6 Lắp đặt và kích hoạt bảo hành

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | CS · `/dang-ky-bh` | Chọn serial (phải có trong kho), khách, ngày lắp + độ chắc của ngày, địa chỉ, ghi chú | Máy đã lắp `active`; bảo hành kích hoạt (mốc toàn bộ + mốc lõi theo bảng BH sản phẩm); serial `da_lap`; sự kiện `lap_dat` |
| 2 | CS · `/bh-cho-kich-hoat` | Hàng chờ 2 nguồn: máy đã lắp chưa kích hoạt · **đơn Sales loại Máy mà số máy lắp < số mua**. "Kích hoạt nhanh" (trống ngày = hôm nay). Dòng tự biến mất khi đủ | |
| 3 | CS · `/lap-bo` | Lắp bộ combo (4 mã: WH15A, WH30A, WH15AECO, WH30AECO): chọn serial từng thiết bị con (lõi PP/PAC tự loại) | Mã bộ `<combo><YYYYMM><NNN>` = dòng mẹ; BH kích hoạt **từng con** |
| 4 | TCS · `/may/[serial]` | Lắp từ kho (tuỳ chọn không kích BH — lắp nội bộ) · Thu hồi (máy `thu_hoi`, serial về bảo trì) · **Đổi máy** (máy cũ `thu_hoi_bao_hanh`, máy mới **kế thừa mốc BH cũ**) | `installed_base.status: active ↔ thu_hoi` |

**Ngoại lệ:** serial đã thuộc khách khác → từ chối; mã là lõi/vật tư → từ chối; không thu hồi máy đang là mẹ của bộ; sửa ngày kích hoạt thì đồng bộ ngày lắp.
**Quyền:** `cs.may.kich_hoat_bh` (CS) · `cs.may.lap_thu_doi` (TCS) · `cs.serial.kho` (TCS).
**Đang vướng:** chưa có trạng thái "đã giao, chưa lắp"; máy không tạo được lúc chốt đơn vì serial là khoá bắt buộc; dòng mẹ ảo của bộ combo còn tranh cãi (migration nháp chưa áp).
**v2 cần (đề xuất):** KTV đóng phiếu "lắp máy" **có nhập serial** (7.9) là **cò duy nhất** kích hoạt BH + sinh gói bảo trì từ DVBT của đơn (bảng 7.0); CS vẫn kích hoạt tay được cho ca không qua KTV (lắp nội bộ, nhập dữ liệu cũ); máy có trạng thái `cho_lap` gắn đơn trước khi có serial; mô hình bộ combo có/không dòng mẹ: mục 10.

### 7.7 Ticket lỗi

**Kích hoạt — 4 nguồn ticket hiện nay:** (a) CS tạo tay ở `/tao-ticket`; (b) **bot Discord** tạo thẳng từ tin ở #chăm-sóc-khách-hàng (hàm DB `bot_tao_ticket` — nằm ngoài migration, xem mục 6); (c) đồng bộ 2 chiều với **Sheet lỗi CTS20**; (d) **nhập tay từ Pancake Zalo Care** theo mẫu ticket anh Liêm (Hiệp đã nhập 4 ca, 25 ca chờ Hiền bổ sung khách/serial — tab Tiến độ Hiệp). (đề xuất) v2: mọi nguồn đi qua một cửa tạo ticket, ghi nguồn + link gốc; Pancake/Zalo thành nguồn tự động.

Ba thứ khác nhau (đặc tả 17/11): **ticket** là vấn đề của khách · **phiếu việc** là một chuyến KTV đi · **mã lỗi** là nhóm hiện tượng dùng chung cho nhiều máy.

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | CS · `/tao-ticket` | Bắt buộc: khách (đã có), loại ticket, mô tả. Tuỳ chọn: các dòng máy kèm serial (≤20) — **serial không bắt buộc**, ngày tạo lùi, trạng thái, Khẩn, CS phụ trách, kỹ thuật. Thêm loại ticket mới ngay ở form (≤80 ký tự, trùng thì dùng loại cũ); **chặn loại bảo trì/thay lõi** (tạo ở mục Bảo trì) | Mã `TK-YYMM-NNN` đánh lại theo tháng. Trống người phụ trách = người tạo |
| 2 | Hệ thống | Tự sinh dòng máy số 1 và **tự phân loại mã lỗi** bằng cách khớp từ khoá trong danh mục lỗi đã duyệt; không khớp → "Chưa phân loại" | `ticket_may` |
| 3 | CS · `/ticket/[code]` | Thanh đầu: sửa nhanh Trạng thái · Khẩn · **CS theo dõi** (4 tên cố định) · Kỹ thuật; "Ngày khách báo" (không tương lai, không trước 2020); tóm tắt "Mở N ngày · K lần lỗi · lần cuối" | |
| 4 | CS | **Nhiều lần lỗi**: mỗi lần một cặp *Khách báo ↔ Xử lý* có ngày riêng (chọn ngày lùi) | `ticket_lan_loi` |
| 5 | CS | **Dòng máy**: thêm/sửa/xoá (còn ≥1), mã lỗi (chỉ mã đã duyệt), hướng xử lý `dang_xu_ly / da_xu_ly / khong_loi`; CS sửa thì hệ thống không ghi đè nữa. Điền serial cho ticket chưa có serial → serial ghi ngược lên ticket (máy & BH hiện đúng) | |
| 6 | CS | **Nhật ký trao đổi** (thời điểm lùi được) + đính kèm ảnh/video/PDF ≤10 tệp × 50MB | `ticket_note`, kho tệp `ticket-tep` |
| 7 | TCS | **Chi phí/vật tư**: hạng mục chọn từ catalog, cờ tính phí, ngày thu, số tiền ≥0. "Đổi máy" chỉ ghi log serial cũ/mới | Doanh số CSKH = tổng hạng mục tính phí |
| 8 | NV | **Nhận việc**: chỉ nhận ticket đang trống người | |
| 9 | CS · nút trên ticket | Tạo chuyến KTV loại "ticket" (mở sẵn khách, mô tả); chuyến xong → **ticket tự Done** | |
| 10 | TCS · `/danh-muc-loi` | Danh mục lỗi: tạo/sửa, `cho_duyet → da_duyet → ngung`; nhập xlsx/csv có xem trước; chạy lại phân loại toàn bộ. Từ 18/11 (PR #24): mỗi mã lỗi thuộc 1 trong **4 nhóm** (Main · Rò rỉ nước · Chất lượng nước · App) hoặc **"Không phải lỗi"** (bảo trì, thay lõi, hướng dẫn); 12 nhóm cũ ẩn, không xoá | |
| 11 | NV · `/bao-cao-loi` | 3 tab: Theo nhóm lỗi (nhóm → SKU → ticket) · Theo máy (SKU → nhóm → serial) · Theo tháng (tần suất, có số máy bán) | |
| 12 | TCS · `/nhom-loi` | (Hệ cũ còn chạy song song) gom ticket theo biểu thức trên mô tả/model, mức độ `an_toan · nghiem_trong · thuong · nhe · khong_loi`, cờ **báo hãng**; gán tay | |
| 13 | Người có quyền `cs.bao_cao.xuat` | Xuất ticket theo bộ lọc + cột chọn (ghi nhật ký) | |

**Trạng thái:** `Open ⇄ Done ⇄ Cancel` — mọi chiều, ai có quyền sửa đều đổi được; không có máy trạng thái.
**Quyền:** `cs.ticket.xem` · `xem_tat_ca` (thiếu thì chỉ thấy ticket của mình + chưa gán) · `tao_sua` · `chi_phi` · `cs.nhom_loi.cau_hinh/gan_ticket` · `cs.bao_cao.xuat`.
**Đang vướng:** đổi trạng thái/Khẩn/người và nhật ký **không ghi audit**; hai khái niệm "kỹ thuật" (`tickets.ky_thuat` là nhân viên, lịch hiện trường dùng bảng KTV riêng); CS theo dõi cứng 4 tên; đổi máy trong ticket không chuyển hồ sơ + BH; hai hệ phân loại lỗi song song.

**v2 cần — theo đặc tả CSKH CEO chốt 17/11 (3 đợt):**

*Luật vận hành:* CSKH **không có hạn mức tự quyết về tiền** — mọi khoản miễn phí/tặng/giảm chỉ đề xuất, CEO duyệt (người trực thay, CTV cũng vậy); nhiều người trực nhưng **mỗi ticket một chủ**; ưu tiên theo mức nhóm lỗi: an toàn → **P1** · nghiêm trọng → **P2** · thường → **P3** · nhẹ / không lỗi → **P4** (thời hạn phản hồi từng mức là tài liệu nội bộ, không hiện ra phía khách).

*Đợt 1:*
- **Trạng thái:** `Mới → Đang xử lý → Chờ → Chờ khách xác nhận → Đóng`, kết quả riêng `Huỷ` / `Trùng`. `Chờ` kèm **lý do chờ**: khách · KT · vật tư · hãng · duyệt (`duyệt` = đề xuất tiền đang chờ CEO). Dữ liệu cũ: Open → Đang xử lý, giữ Done/Cancel.
- **4 trường bắt buộc** cho mọi ticket đang mở: Chủ ticket · Việc tiếp theo · Người đang phải làm · Hạn. Không cho lưu thiếu (ticket cũ: mục 10).
- **Lời hứa** với khách (nội dung, hạn, giữ/trễ) → chỉ số *giữ lời*. Nút **"Khách hỏi lại"** → đếm số lần khách phải nhắc.
- **Thẻ lưu ý khách** + màn **Việc hôm nay** có bàn giao ca (4.2).
- Nhật ký theo **lần báo**: mỗi lần khách báo một dòng có ngày; dưới đó **nhiều dòng xử lý** có ngày (yêu cầu CEO 16/11 mục 2–3: mô tả sự cố và ghi chú xử lý đều tách dòng theo ngày).

*Đợt 2:* **báo cáo sau dịch vụ** tự soạn từ phiếu KT, CSKH duyệt rồi gửi Zalo (7.8); **chẩn đoán từ xa**: mỗi mã lỗi có mức ưu tiên, các bước hỏi/hướng dẫn, kết quả mỗi nhánh (xong từ xa / cử KT), vật tư mang theo, video, phiên bản + KT trưởng duyệt; CSKH bấm qua từng bước trong ticket → chỉ số "xử lý xong từ xa"; cử KT thì phiếu việc tự điền vật tư. CSKH chỉ hướng dẫn thao tác đã duyệt; việc dính điện, nước nóng, tháo máy là của KT.

*Đợt 3 — đóng vòng lỗi* (mỗi dòng máy khi đóng): **nguyên nhân thật** (linh kiện hỏng · lắp đặt · nước nguồn · khách dùng sai · vận chuyển · không lỗi) · **đã làm gì** (thay linh kiện · chỉnh/siết · vệ sinh · hướng dẫn · đổi máy) · xử lý từ xa? · hỏng lại ≤30 ngày (tự tính). Mã lỗi trên máy (E4, đèn đỏ) **không phải** nguyên nhân. Báo cáo lỗi thêm Pareto, máy bị ảnh hưởng/model (1 máy báo 5 lần = 1 máy lỗi), hỏng lại, **xuất báo cáo tháng cho hãng**.

*(đề xuất) thêm:*
- Gộp 2 hệ phân loại lỗi về danh mục 4 nhóm (bỏ trang Nhóm lỗi kiểu biểu thức).
- Một khái niệm kỹ thuật viên (nhân viên có vai KTV/CTV) thay cho 2 khái niệm hiện nay.
- Phiếu việc KTV loại "ticket" đóng → ticket sang **Chờ khách xác nhận** (không nhảy thẳng Đóng).
- Đổi máy trong ticket = luồng đổi máy 7.6 (chuyển BH).
- Mọi thay đổi trạng thái/chủ/khẩn ghi nhật ký thao tác.
- Báo Discord: ticket Khẩn mới, ticket mở quá X ngày, ticket bot tạo chưa ai nhận, việc tiếp theo quá hạn.

### 7.8 Bảo trì định kỳ và thay lõi

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | TCS · `/bao-tri/map` | Gắn gói bảo trì chưa có khách (dữ liệu cũ từ Asana) vào khách; gợi ý theo SĐT, tỉnh, ngày lắp; chọn số chính, số còn lại thành SĐT phụ; gỡ gắn được | |
| 2 | TCS · `/bao-tri/len-lich` | Ngày bắt đầu: nhập tay > gói > ngày lắp sớm nhất > hôm nay; chu kỳ mặc định 3 tháng, tổng số lần (WH15A/30A: 4, ECO: 2). Vùng Bắc nghỉ T7+CN, Nam nghỉ CN → trùng ngày nghỉ dời sang ngày làm kế tiếp. Xoá lượt chưa làm rồi sinh lại, giữ lượt đã làm | `maintenance_plan`, các lượt |
| 3 | TCS | Tạo gói mới / tặng nội bộ (**khách phải có ≥1 máy đang hoạt động**); nối thêm lượt | |
| 4 | CS · `/bao-tri` (danh sách + lịch tháng) | Đánh dấu xong hoặc ghi số đo TDS/pH/độ cứng/Clo trước–sau → hệ thống **đề xuất dời các lượt sau**, CS bấm đồng ý mới áp | |
| 5 | CS | Thay lõi: hạn = lần thay gần nhất (hoặc ngày lắp) + chu kỳ của lõi; ghi lần thay (không tương lai). Sửa/xoá lần thay phải qua duyệt | `filter_replacement` |
| 6 | CS · `/nuoc` + tab khách | Hồ sơ nước: các lượt có số đo | |
| 7 | Hệ thống | Gói còn ≤1 lượt → danh sách "sắp hết" để chào gói mới | |
| 8 | CS | Gửi lượt sang kỹ thuật (tạo chuyến KTV loại bảo trì) | |

**Trạng thái lượt** (tính ra, không lưu): còn hạn → sắp đến hạn (≤30 ngày) → **quá hạn** → đã xong; "không rõ hạn".
**Quyền:** `cs.bao_tri.xem/ghi_ket_qua/tao_plan` · `cs.may.thay_loi`; `cs.bao_tri.duyet_plan` là quyền ma (không ai kiểm).
**Đang vướng:** 309/471 lượt không gắn gói; quá hạn thay lõi chưa tin được (log mới ghi); hồ sơ nước chỉ lọc trong trang; loại POU/POE chưa map đúng máy; CEO: "lịch cũ thiếu/sai phải chỉnh hết, tính năng nào còn dốt thì sửa"; đang nhập song song Asana + app.
**v2 cần:**
- **Lịch bảo trì nhập song song Asana + app**, rồi chuyển dần sang theo dõi trên app; lịch cũ thiếu/sai phải chỉnh đúng hết; tính năng nào khó dùng thì sửa (CEO 17/11). Nghiệm thu: đối chiếu Asana và app cùng số lịch, cùng ngày, cùng khách.
- **Báo cáo sau bảo trì làm và gửi tự động** (đặc tả 17/11, Đợt 2): KTV đóng phiếu → app soạn theo mẫu từng loại việc (lắp đặt · bảo trì lọc tổng · thay lõi · sửa chữa): lời chào, đã làm gì, bảng chỉ số nước có giải thích ngắn, ảnh, lần tới khi nào, hotline → CSKH xem, sửa câu chữ → **Gửi Zalo** (chặn khi thiếu ảnh/chỉ số bắt buộc) → lưu vào lượt bảo trì, đặt kỳ tiếp theo, kèm nút chấm sao. Bước đầu có nút "Chép báo cáo" sang Zalo cá nhân trong lúc chờ duyệt mẫu Zalo OA/ZNS. Luôn duyệt hay cho tự gửi: mục 10.
- (đề xuất) Gói bảo trì sinh tự động từ DVBT khi lắp (7.0); lượt bảo trì và lượt thay lõi là một lịch theo khách/máy; nhắc CS lượt quá hạn qua Discord; nhắc khách trước hạn (kênh: mục 10); bỏ Asana sau khi đối chiếu khớp.

### 7.9 Điều phối kỹ thuật hiện trường

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | TCS · `/ky-thuat/nhan-su` | Hồ sơ KTV: tên, SĐT, vùng, tỉnh, email, cờ CTV. AD cấp tài khoản (mật khẩu tạm hiện 1 lần, vai KTV) | `ky_thuat` |
| 2 | TCS · `/ky-thuat` | Tạo chuyến: KTV · ngày · khách · địa chỉ · tỉnh + danh sách việc: `lap_may · bao_tri · ticket · thay_loi · khao_sat · thu_tien · khac` (khác bắt buộc mô tả, thu tiền bắt buộc số tiền). Xem tuần + ngày nghỉ KTV để tham khảo — **không chặn trùng lịch** | `lich_ky_thuat`, `lich_ky_thuat_viec` |
| 3 | KTV · `/ky-thuat/cua-toi` (điện thoại) | Xem chuyến của mình, ghi số đo nước cho lượt bảo trì trong chuyến, bấm **Xong** hoặc **Hẹn lại** | |
| 4 | Hệ thống | Chuyến xong → bảo trì: đặt ngày xong cho lượt · thay lõi: ghi lần thay (chống trùng) · ticket: `Open → Done`; việc nào lỗi thì báo người bấm | |

**Trạng thái chuyến:** `hen → xong | huy`, `xong → hen` (mở lại); KTV chỉ đổi chuyến của mình sang xong/hẹn; huỷ chỉ TCS.
**Quyền:** `cs.ky_thuat.lich_cua_toi` (mọi NV) · `ho_so` · `xep_lich` (TCS) · `tai_khoan` (AD).
**Đang vướng:** việc "lắp máy" xong không kích hoạt BH; "thu tiền" xong không ghi tiền ở đâu; mã lõi đoán từ mô tả.
**v2 cần:**
- **KTV đóng phiếu trên điện thoại** (đặc tả 17/11): việc đã làm (chọn), ảnh trước/sau, chỉ số nước trước/sau, lõi/linh kiện đã thay, muối đã đổ, phí đã thu, ghi chú cho khách, ô **"Có gì cần nhớ cho lần sau?"** → thành lưu ý khách mới. Đây là nguồn của báo cáo sau dịch vụ (7.8).
- KTV đọc lưu ý 🏠🔧🔴 của khách trước khi đi; phiếu việc tự điền vật tư khi cử từ chẩn đoán từ xa (7.7).
- Lịch kỹ thuật gắn khách tách việc công ty (chờ yêu cầu chi tiết của chị Trang).
- **CTV kỹ thuật freelancer**: danh sách kèm chi phí để chuyển khách (nhất là khách VIP) cho CTV — hiện ở Google Sheet, 4 CTV (Hiền giao 16/11). v2: CTV là KTV có cờ freelancer + bảng chi phí; CTV chỉ thấy lưu ý KT của việc được giao (đặc tả 17/11).
- (đề xuất) Đóng phiếu "lắp máy" bắt buộc nhập/quét serial → kích hoạt BH (7.0); "thu tiền" → ghi khoản thu gắn đơn/ticket; cảnh báo trùng lịch KTV trên bảng điều phối tuần; nhắc KTV lịch ngày mai qua Discord. Trạng thái phiếu giữ `hen → xong | huy` (+ Hẹn lại); thêm "đang làm" chỉ khi cần đo thời gian tại nhà khách (mục 10).

### 7.10 Đơn Hannah Olala (mới, chưa có)

Yêu cầu CEO 16/11: mỗi tháng Hannah Olala (HO) gửi **1–2 file** Google Sheet "GE ORDER MIX" vào nhóm Zalo *GE Water x HO FB*. "Mỗi khi có thêm 1 dòng trên file thì báo vào Discord có đơn hàng mới cần xử lý, và nếu đơn lên trạng thái *Đang đóng gói* trở đi thì đẩy vào excel của mình (trừ *Yêu cầu huỷ*, *Chưa xử lý*)." Phải rõ "mỗi khi HO gửi file mới, ai là người update để tool nhận file mới". Tool cho **đổi link** (Dún 16/11).

| # | Ai · Màn | Làm gì |
| --- | --- | --- |
| 1 | Người được giao (mục 10) · màn cấu hình Sales | Thêm link Sheet HO; **nhiều link được theo dõi cùng lúc** (tháng này + tháng trước còn đơn đang chạy); gỡ link khi hết đơn |
| 2 | Hệ thống (định kỳ; chu kỳ: mục 10) | Đọc mọi link đang theo dõi; **dòng mới → báo Discord "Có đơn mới cần xử lý"** kèm thông tin chính |
| 3 | Hệ thống | Dòng có trạng thái từ *Đang đóng gói* trở đi → đẩy vào "excel của mình" (đích: Sheet đơn của GWT hay sổ đơn trong app — mục 10), khoá theo mã đơn HO, không ghi trùng; bỏ *Yêu cầu huỷ*, *Chưa xử lý*. Dòng ở file tháng trước chuyển trạng thái sau khi đã thêm file mới vẫn được xử lý (vì link cũ còn được theo dõi) |
| 4 | Hệ thống | Dòng đã đẩy rồi mà HO chuyển sang *Yêu cầu huỷ* → không tự xoá, đánh dấu + báo Discord (7.0) |

**Cần định nghĩa trước khi code:** cột và giá trị trạng thái của Sheet tháng 11; khách HO (một khách đại lý "Hannah Olala" hay từng khách cuối); mã đơn và kênh gán cho đơn HO. **Nghiệm thu (CEO):** làm xong tag chị xem kết quả + báo cáo tóm tắt **ngay trong #ai-team, đừng lẫn vào báo cáo ngày**; chạy với file tháng 11; chạy 2 lần liên tiếp không sinh dòng trùng.

### 7.11 Đối soát Viettel Post (mới, chưa có)

Yêu cầu CEO 16–17/11: "làm phần đối soát tự động với VTP, **trước hết là đối soát tay để hiểu quy trình** rồi code tiếp"; kết nối VTP: với **đơn hàng** cập nhật trạng thái đã giao đến chưa (báo Discord) và đối soát nhận tiền COD; với **các đơn vận chuyển đồ** báo Discord nếu giao thành công.

| # | Ai | Làm gì |
| --- | --- | --- |
| 1 | Người được giao (Hiệp) | **Đối soát tay trước** 1 file `BangKeChiCOD` (mail VTP chị forward), ghi từng bước, gửi CEO trước khi code |
| 2 | Hệ thống | Kết nối VTP (API hay tài khoản — mục 10); đơn bán: cập nhật trạng thái giao, **báo Discord khi giao đến** |
| 3 | Hệ thống | Khớp tiền COD từng đơn theo bảng kê VTP → cập nhật thanh toán của đơn (7.1: *Chờ đối soát → Đã thu đủ / Còn nợ*) |
| 4 | Hệ thống | **Vận đơn không phải đơn bán** (gửi đồ, linh kiện…): báo Discord khi giao thành công. Nguồn danh sách vận đơn này (lấy hết vận đơn của tài khoản VTP, hay nhập tay mã vận đơn) — mục 10 |
| 5 | (đề xuất) SL/Kế toán · màn "Lệch đối soát" | Đơn có tiền COD lệch bảng kê vào hàng chờ, người xử lý ghi lý do và chốt |

Bước 2–5 chỉ thiết kế chi tiết sau khi bước 1 xong (quy trình tay là nguồn sự thật).

### 7.12 Kế toán hoá đơn – sao kê (có đặc tả; code trên nhánh, chưa merge)

Code đã làm tới "lát 5" (sao kê VCB/TCB, xuất Báo cáo thu chi tháng) trên các nhánh `feat/ke-toan-hoa-don`, `feat/ke-toan-lat-2`, `feat/ke-toan-lat-5`, `feat/ke-toan-nexia-cong-thue` — chưa vào `main`, chưa lần theo luồng chi tiết trong file này. Theo `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md`: kỳ tháng `dang_xu_ly → da_gui` (sửa sau khi gửi vẫn được, gắn nhãn đã sửa); tải file hoá đơn NEXIA (mua vào/bán ra) + file chi tiết; gán mã khoản mục chi phí / mã nội bộ theo 4 tầng luật, người soát sửa, hệ thống học theo đa số, nút "đặt thành luật"; xuất Excel đã xử lý, đẩy Google Sheet/Drive; sao kê VCB/TCB: khớp chắc mới tự nối, còn lại ≤3 gợi ý; tiền thu nối SĐT → khách → đơn → hoá đơn. Quyền tạm: `ke_toan, tai_chinh, ceo, admin`. Ngoài phạm vi: công nợ, tạm ứng, báo cáo nhà đầu tư. **v2:** đưa vào v2.0 hay để sau — mục 10; nếu đưa vào thì nối với đơn (7.1) và đối soát VTP (7.11).

### 7.13 Giao việc và theo dõi việc (Work)

Mọi thao tác ghi đi qua hàm DB schema `work`, email người làm lấy từ phiên đăng nhập.

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | Mọi NV · `/work`, `/work/team` | Tạo việc: tiêu đề · ưu tiên P1–P4 (mặc định P3) · mô tả · hạn (ngày giờ) · team · người + vai (người đầu = **owner**, sau = **doer**; còn reviewer, watcher). Không gán ai → người tạo là owner. Giao được cho bất kỳ ai | `work.task` `todo`, mã `TK-1000…` (**trùng tiền tố với mã ticket**) |
| 2 | Người có quyền sửa | Sửa, gán/bỏ người (việc phải còn ≥1 người), đổi vai | ghi `activity` |
| 3 | Người có quyền sửa | Đổi trạng thái qua ô chọn / nút "Đánh dấu xong" / **kéo thả Kanban** / hàng loạt | |
| 4 | Người có quyền sửa cha | **Việc con** (kế thừa team, phạm vi); xoá cha xoá cả nhánh. **Phụ thuộc**: chặn tự phụ thuộc và vòng lặp; không sang Xong khi việc chặn chưa xong; panel hiện 2 chiều | |
| 5 | Ai xem được việc | **Bình luận + @nhắc tên** → người được nhắc thành watcher (không hạ vai cũ) + một dòng thông báo kênh Discord **không bao giờ được gửi** | `work.notification` (`sent_at` trống mãi) |
| 6 | Người có quyền sửa · thanh hàng loạt | Sửa ≤200 việc một lượt (trạng thái, người, ưu tiên, hạn, team); việc không quyền / còn bị chặn thì đếm bỏ qua. **Xoá cứng 2 bước**: xem trước số mất thật (kể cả việc con, bình luận, nhật ký, việc tự sinh sẽ mọc lại) → xoá phải nộp đúng dấu vân của bước xem trước | không thùng rác |
| 7 | Người có quyền sửa | **Gắn chip** khách / ticket / đơn (gõ ≥2 ký tự, ≤8 gợi ý; đã gắn khách thì chỉ gợi ý ticket/đơn của khách đó). Gắn ticket/đơn tự gắn khách. Lưu tên lúc gắn | liên kết mềm, không khoá ngoại |
| 8 | Hệ thống (15 phút) / quản lý bấm "Chạy ngay" · `/work/tu-sinh` | **Việc tự sinh** theo 3 luật: máy lắp chưa kích hoạt BH → P3, hạn +2 ngày · ticket Open chưa ai nhận quá 4 giờ → P1, hạn +1 ngày · lượt bảo trì trong ±7 ngày → P2, hạn 17h ngày tới hạn (code cộng 17 giờ vào ngày theo múi giờ phiên DB — nếu DB chạy UTC thì hạn rơi 00:00 hôm sau giờ VN, cần kiểm). Quản lý bật/tắt từng luật, sửa tham số, đổi người nhận, xem trước. Không sinh trùng. **Công tắc chung mặc định tắt** | `origin='auto_erp'` |
| 9 | Mọi NV · `/work` | "Việc của tôi" nhóm theo hạn: Quá hạn · Hôm nay · Tuần này · Sắp tới · Không hạn; ô "Xong tuần này" | |

**Trạng thái:** Cần làm · Đang làm · Bị chặn · Chờ duyệt · Xong · (Huỷ, không hiện). Chuyển tự do; ràng buộc duy nhất là phụ thuộc. "Chờ duyệt" không bắt reviewer duyệt; "Bị chặn" là nhãn tay, không liên quan phụ thuộc.
**Quyền xem:** việc toàn công ty · mình tạo · mình được gán · việc team mà mình là thành viên (thành viên suy từ vai: CS→CSKH, Sales→Sales, KTV→Kỹ thuật, Marketing→Marketing, admin mọi team). **Quyền sửa:** người tạo · owner/doer/reviewer (watcher chỉ xem) · admin · thành viên team. `work.viec.xem_tao` và `work.viec.giao` là quyền ma.
**Đang vướng:** không có thông báo nào được gửi; không có nhận/từ chối việc (cột có sẵn, không dùng); một người một vai trên một việc; bỏ người cuối cùng ở thao tác hàng loạt lại **thêm chính họ làm owner** (lỗi); thành viên team xoá được việc của team, xoá không để lại dấu vết; việc tự sinh không tự đóng khi bên ERP xong; xoá việc tự sinh thì mọc lại; việc lặp theo lịch (bảng `recurring`) chưa có luồng; chip ERP chỉ một chiều (ticket đóng không đóng việc); trang tự sinh chặn Trưởng Sales dù DB cho phép.

**v2 cần — CEO yêu cầu (#ai-team, thread Giao việc/Work 17/11):**
- **Cần nhất:** xem task của mọi người thuận tiện · xem các task cần gấp. Cẩn thận nhiều task quá rối màn hình: task lâu không đụng (có thể xong rồi chưa cập nhật) **gom lại một chỗ để xử lý hàng loạt** → doc AI-Team 1.1 (anh Dũng làm, ưu tiên 2): mỗi tab là **một bộ lọc đặt sẵn, dùng lại bảng và thanh hàng loạt đang có** — tab Mọi người (lọc theo người, thêm cột Cập nhật cuối) · Gấp (quá hạn + hạn hôm nay + việc gấp; P1 hay nhãn Gấp: CEO chọn) · Lâu không đụng; nút **"Hỏi người làm"** trên thanh hàng loạt (bot hỏi trên Discord người đang giữ các việc được chọn — làm sau D1). Nghiệm thu: dùng thử, ghi cái đã có/còn thiếu trước khi code; gửi CEO mockup 3 tab trước; với dữ liệu thật mỗi tab ra đúng task.
- Thiết kế thuận luồng hiện tại: **giao việc tag trên Discord, báo cáo cũng trên Discord** (7.14 D1–D3); nhưng nhiều việc thì cần chỗ xem tracking lại.
- **Cuối tháng tổng kết** đã làm được bao nhiêu việc, thời gian hoàn thành, **phần review nhận xét kết quả công việc** để nhìn lại.
- **Task AI** (7.14 D4) và lịch kỹ thuật gắn khách (7.9).

**(đề xuất) thêm, CEO chưa yêu cầu:**
- **Nhận việc**: người được giao bấm nhận (hoặc nhận qua Discord) → `accepted_at`.
- **Chờ duyệt thật**: reviewer duyệt/trả lại mới sang Xong (mục 10).
- Việc lặp theo lịch (định kỳ của công ty).
- Chip ERP 2 chiều: ticket/đơn đóng → đề xuất đóng việc liên quan; việc tự sinh tự đóng khi điều kiện hết.
- Xoá mềm có thùng rác; nhật ký thao tác dùng chung với các khu khác.
- Mã việc khác tiền tố ticket (vd `VIEC-…`).

**Trạng thái mới cần mô hình hoá trong v2:** việc **nháp** do bot tạo chờ xác nhận (D1) — chưa hiện trong danh sách việc; **lời nhắc** có vòng đời riêng `chờ giờ → đã gửi | đã huỷ` gắn vào việc (D3); việc đã nhận / chưa nhận (nếu làm "Nhận việc").

### 7.14 Discord ↔ app

**Hiện trạng** (bot chạy trên Mac mini, nhiều phiên dùng chung token Bắp; người nhận diện bằng Discord ID, **không có bảng nối Discord ID ↔ nhân viên**). Nguồn: repo `gwt-discord-bot` nhánh `origin/main` — `CLAUDE.md`, `RUNBOOK.md`, `kenh/huong-dan.md`, `kenh/nhom-cv.json`, `kenh/ticket.json`, `kenh/kho-nx.json`, `db/ticket/bot-tao-ticket.sql`, `docs/kho-nx-doc-tin.md`; danh sách kênh cho phép ở cấu hình plugin Discord trên Mac mini.

| Bot / phiên | Làm gì | Ghi vào đâu |
| --- | --- | --- |
| Bắp chung (7 kênh, gọi bằng @Bắp / reply / "Bắp…") | Tra cứu wiki/Masterdata, Shopee, CTKM; sửa Shopee **2 bước** (bản xem trước có mã → chính người yêu cầu reply "xác nhận" trong 30 phút); tổng hợp kênh khi được hỏi | không ghi DB app |
| Phiên kênh riêng (≤4) | "Đọc lại kênh, lập tasklist" → 4 nhóm Đang làm / Chưa làm / Vướng / Đã xong, mỗi dòng việc · ai · hạn · link tin | **file trên Mac mini**, không vào DB |
| Phiên nhóm công việc (23 kênh) | Tin riêng 8h ("Cần làm hôm nay", "Mới giao") và 17h ("Đã xong", "Còn vướng") | đang thử, chỉ gửi Hiệp |
| Bot kho Nguyễn Xiển | Ghi sổ kho từ tin của 2 KTV (7.4), thả ✅/⏳/❌ | sổ kho Masterdata + sự kiện serial DB app |
| Bot ticket (#chăm-sóc-khách-hàng, từ 04/11) | **Mỗi tin → một ticket** (chống trùng theo id tin), phụ trách mặc định chị Hiền, thiếu khách/máy vẫn tạo và nhắc bổ sung ⏳; tin sửa → thêm ghi chú | `tickets` DB app |
| Báo đơn mới + doanh số 20:00 | Đọc đơn từ DB app; đẩy đơn app sang Sheet Sales | đọc DB app, ghi Sheet |
| Sheet lỗi CTS20 ↔ ticket | Đồng bộ 2 chiều ~10 phút | ticket + ghi chú DB app |
| Bản tin tự động | Đơn Shopee theo giờ, tồn kho 8h, báo cáo tuần thứ Hai; tồn Shopee ghi sang Masterdata 15 phút/lần | Discord, Masterdata |
| Bot Admin (token riêng) | Sổ quỹ, chấm công, hàng tặng (`docs/quy-cach-so-quy-cham-cong.md`) | Google Sheet + Supabase Admin Portal — đầu vào cho module Nhân sự / Kế toán |
| Trợ lý nội bộ ERP | Màn `/work/agent` ở repo GWT-ERP (không phải app này), hàng đợi schema `assistant`, chỉ đọc | DB ERP |
| Pancake | Chatbot trả lời khách qua Pancake (repo ERP) — chưa lần trong file này | — |

**Đánh giá theo yêu cầu CEO:**

| Yêu cầu | Mức |
| --- | --- |
| Tag giao việc trên Discord → việc trong app | chưa có |
| Reply báo cáo → cập nhật việc | chưa có |
| Nhắc theo giờ cho từng việc | một phần (chỉ tin 8h/17h, đang thử) |
| Task AI có checklist | chưa có |
| Hỏi "việc của tôi" trên Discord | chưa có (có trên app) |
| Tổng kết cuối tháng | chưa có |
| App báo ra Discord (đơn HO, VTP giao xong, ticket quá hạn, @nhắc) | chưa có |

**Luồng v2 (đích):**

| # | Luồng | Các bước | Nghiệm thu |
| --- | --- | --- | --- |
| D1 | **Giao việc** (sơ đồ 1.2 doc AI-Team) | (1) CEO/quản lý tag người nhận kèm nội dung, hạn → (2) bot tách người nhận · nội dung · hạn (nếu có) → (3) **tạo task trong Work**, lưu link tin giao việc gốc (nguồn "Discord ↗") → (4) bot reply xác nhận, **tag người nhận và người giao**. Sai thì sửa task sau (đề xuất: reply "sửa …" trong thread) | Giao thử 3 việc: cả 3 vào Work đúng người, đúng hạn |
| D2 | **Báo cáo** (sơ đồ 1.2) | (5) Người nhận **reply tin giao việc** để báo cáo → (6) rõ là task nào? **có** → (7) cập nhật trạng thái, ghi chú, link báo cáo vào task · **không** → bot hỏi lại **kèm các task đang mở của người đó để chọn** → người báo chọn → (7) | Reply báo cáo → task tự cập nhật đúng; báo cáo không rõ task → bot hỏi lại |
| D3 | **Nhắc theo giờ** | "sáng mai 9h nhắc anh Như (nhắc cả chị) kiểm tra abc với khách" → bot reply 4 ý (giờ · người · có tag người giao · nội dung) để xác nhận → đến giờ tag người đó. Lời nhắc ghi vào việc liên quan, chưa có thì tạo việc | Đặt thử 5 phút sau: đúng giờ, đúng người, có trong việc |
| D4 | **Task AI + nghiệm thu** | CEO giao việc AI trên Discord → bot ghi nhận, **phân loại vào app nào đang code** (không rõ thì hỏi) → việc nhãn AI + tên app + một dòng thêm vào **file checklist yêu cầu trong repo app đó** kèm link tin gốc (CEO: "pull git về là follow được checklist + đưa thêm yêu cầu hoặc chỉnh sửa tiếp") → xong việc, người làm báo cáo theo mẫu: **(1) các yêu cầu từ chị đưa ra · (2) nghiệm thu xem ở đâu** → **màn nghiệm thu**: danh sách yêu cầu → trạng thái từng yêu cầu → link kết quả → CEO **click vào và comment thẳng** chỗ cần sửa / hiểu sai; comment thành việc sửa tiếp. Phần giải thích dài thu gọn/mở rộng được (CEO 04/11) | CEO biết ngay: đã xong hết yêu cầu chưa · việc đang làm thuộc mục nào. Không báo chung chung "đã xong" |
| D5 | **Việc của tôi** (sơ đồ 1.5) | Nhân viên nhắn Bắp "việc của tôi" → Bắp hỏi Work các task chưa xong của người đó (hạn, ưu tiên, cập nhật cuối) → chia 3 nhóm **Cần gấp · Cần làm · Để lâu rồi quên** → trả lời mỗi task 1 dòng: tên, hạn, link Work. CEO 17/11: nhân sự nhờ Bắp sắp xếp lại việc cần làm, việc gấp, việc để lâu rồi quên | Khớp tab của họ trên Bảng team |
| D6 | **Thông báo ra** | CEO yêu cầu: đơn HO mới · VTP giao đến / giao thành công · nhắc việc theo giờ. (đề xuất) thêm: được giao việc · sắp tới hạn / quá hạn · được @nhắc · việc chặn mình đã xong · ticket Khẩn / mở quá X ngày / bot tạo chưa ai nhận · kho sắp hết · CTKM chờ duyệt · nhân viên chờ duyệt · tin 8h/17h | Mỗi loại bật/tắt và chọn kênh ở màn cấu hình (`MaTranThongBao`) |
| D7 | **Tổng kết tháng** | Ngày 1 hằng tháng gửi bảng tổng kết theo người + link màn tổng kết | |
| D8 | **Ý tưởng cho App** | Hiền làm việc Sales/CSKH trong Work của Claude (thay vì trong chat) → **cuối mỗi ngày** Claude tổng hợp các việc phải làm tay hôm đó → phân tích việc nào code thành tính năng được → Hiền đọc lại đề xuất một lượt, ổn thì commit; mỗi commit ghi nhận là *"Công việc hàng ngày của Sales/CSKH – Ý tưởng cho App"* — **ý tưởng, chưa phải yêu cầu** (CEO 17/11). Trong app: một danh sách Ý tưởng tách khỏi checklist yêu cầu; CEO chuyển ý tưởng thành yêu cầu (D4) khi duyệt. Cùng luồng: **Hiệp** (quen thao tác app Sales và CS) ghi lại các thao tác còn rườm rà và tự đề xuất cách làm gọn (doc AI-Team mục 0; CEO 17/11) | Ý tưởng không lẫn vào yêu cầu; CEO đọc được mọi ý tưởng theo ngày |

**Nền phải có cho mọi luồng:** bảng nối **Discord ID ↔ nhân viên** (một nguồn, thay các danh sách ID rải trong bot); mọi lệnh ghi qua **một cửa API của app** có kiểm quyền theo người gửi (không ghi thẳng DB như bot ticket hiện nay) — cửa này phục vụ cả **bot Bắp** lẫn **Claude trên máy nhân viên** (doc AI-Team 2.1: "cài Claude trên máy Hiền, nối với GWT App phần Work" → Claude đọc/ghi task của chính người đó, đề xuất dạng MCP); mẫu xác nhận 2 bước dùng chung (như sửa Shopee); tin sửa → cập nhật, tin xoá → huỷ (như bot kho); mọi bản ghi do bot tạo mang nguồn + link tin.

### 7.15 Đăng nhập và nhân viên mới

| # | Ai · Màn | Làm gì | Dữ liệu |
| --- | --- | --- | --- |
| 1 | Người dùng · `/login` | Google hoặc email + mật khẩu → cùng một luật vào cửa: có hồ sơ mà bị khoá → chặn; email `@gwt.vn` chưa có hồ sơ → **tạo hồ sơ chờ duyệt** (không vai, không hoạt động), đăng xuất, báo "chờ duyệt"; email khác → ngoài danh sách | `staff` |
| 2 | AD · `/nhan-vien` | Bật hoạt động + tick vai trò → người đó đăng nhập lại | ghi audit |
| 3 | AD · `/nhan-vien` | **Mời** nhân sự: hồ sơ hoạt động ngay; email ngoài `@gwt.vn` được tạo tài khoản mật khẩu tạm + **bắt đổi mật khẩu** lần đầu (≥8 ký tự); không mời thẳng vào vai admin | |
| 4 | Hệ thống | Vào được khu CS → về `/`, không → về `/work`. Quên mật khẩu → email đặt lại | |

**Ngoại lệ:** không tự khoá mình, không tự bỏ vai admin, luôn còn ≥1 admin; chỉ xoá hẳn nhân viên khi không còn dữ liệu tham chiếu và không phải admin.
**Đang vướng:** admin không được báo có người chờ duyệt, người chờ không được báo đã duyệt; câu báo lỗi còn ghi "hệ thống CSKH"; không giới hạn domain ở phía Google (rào thật là bảng nhân viên); các hàm quản lý nhân sự gác bằng cổng khu CS → vai "Quản trị hệ thống" thuần có thể bị đá sang `/work` (suy từ code, chưa thử).
**v2 cần:** một cổng duy nhất theo mã quyền (không phân "cổng CS / cổng nền tảng"); báo Discord cho admin khi có người chờ duyệt; báo người dùng khi được duyệt; nối Discord ID ngay ở hồ sơ nhân viên (7.14).

### 7.16 Vai trò, phân quyền, nhật ký

- **14 vai:** CEO · Quản trị toàn quyền · Quản trị hệ thống · Giám đốc kỹ thuật · Nhân viên kỹ thuật · CTV lắp đặt · Trưởng CSKH · Nhân viên CSKH · Trưởng Sales · Nhân viên Sales · Marketing · Kho · Kế toán · Tài chính. Một người nhiều vai; trong một bộ phận trưởng và nhân viên loại trừ nhau.
- **Ma trận mã quyền** (vd `cs.ticket.tao_sua`): mã khai trong code, DB lưu ô nào được tick; màn `/nhan-vien/phan-quyen` tick/bỏ từng ô (không sửa được vai admin), đặt lại mặc định. Mặc định: CEO xem mọi thứ + duyệt CTKM, không ghi; Quản trị hệ thống lo người và cấu hình, **không xem dữ liệu khách**.
- **Hiện trạng chạy song song:** quyền thật vẫn theo luật cũ (admin/quản lý) trừ khi bật cờ môi trường; chỗ ma trận nói khác chỉ ghi vào bảng "lệch". Có nhiều **quyền ma** (khai nhưng không chỗ nào kiểm): `sales.don.xem/ghi`, `work.viec.xem_tao/giao`, `cs.bao_tri.duyet_plan`.
- **Nhật ký thao tác** `/audit` (AD): ai · lúc · hành động · đối tượng · chi tiết · kết quả. Khu Work và nhiều thao tác ticket (đổi trạng thái, Khẩn, người, nhật ký) **không ghi**.
- **Hàng chờ duyệt** `/duyet` (7.2): duyệt không kèm điều kiện "còn đang chờ" → hai người duyệt cùng lúc có thể áp hai lần; người gửi không được báo kết quả.

**v2 cần:** ma trận là **luật duy nhất**; không còn quyền ma (mỗi mã có chỗ kiểm và test); UI ẩn mọi nút thiếu quyền; nhật ký thao tác ghi đủ mọi khu, kể cả thao tác của bot (tên bot + người ra lệnh); hàng chờ duyệt dùng chung mọi khu, duyệt một lần duy nhất, báo người gửi kết quả.

## 8. Spec UI tái sử dụng

Mục tiêu: mọi màn v2 ghép từ **một bộ component chung**. Bản cũ có 3 bộ UI song song (`bang/` + `components/` kiểu Tailwind slate, `components/work/ui.tsx` kiểu biến CSS, `app/kho/_ui.tsx`), 5 kiểu modal, 37 lần `window.confirm`, 9 hàm định dạng tiền, ≥10 hàm định dạng ngày, 7 typeahead tự viết, 12 hằng "hôm nay" dính lỗi múi giờ UTC — v2 không lặp lại.

### 8.1 Nền (token)

**Nguồn duy nhất:** DS "GWT — OpenAI + shadcn" (https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr). Biến semantic của shadcn (`background foreground card popover primary secondary muted accent destructive border input ring sidebar-*`) trỏ vào token semantic OpenAI; trạng thái và hover/active/disabled dùng thẳng token OpenAI (`--color-background-<vai>-…`, `--control-*`). Thay bộ biến khu Work (`--bg --surface --ink --muted --accent`, `-wash`) — bộ đó bỏ.

| Token | Quy định v2 |
| --- | --- |
| Màu | `background` #ffffff · `muted` #f3f3f3 · `foreground` #0d0d0d · `muted-foreground` #5d5d5d · `border` đen 10% · `input` đen 16% · `popover` (lớp nổi). **`primary` = đen**, không phải màu thương hiệu. **`accent` = nền hover/đang chọn** (đen 8%), không phải màu nhấn. Không rải hex trong component. |
| Màu khu | Việc `#0e8c9a` · CSKH `#b5642a` · Sales `#2f7d8a` · Kho `#5560c9` · Wiki `#8a52b8` · Nhân sự `#b0518f` · Kế toán `#3f8a6a` · nền thanh nav `#0c2a2e`. **(đề xuất) Mở rộng GWT** `--khu` (đặt qua `[data-khu="…"]`) và `--nav`: chỉ làm dấu nhận diện khu trên thanh điều hướng/launcher; **không** đổi `primary`, `ring` hay màu trạng thái. |
| Màu trạng thái | Bảng tone dùng chung, mỗi tone = một vai màu OpenAI (cặp nền `…-soft-alpha` + chữ `…-soft`): `trung-tinh` → secondary · `dang-lam` → info · `cho` → warning · `xong` → success · `loi/khan` → danger · `thong-tin` → discovery. Mỗi trạng thái nghiệp vụ map vào một tone (bảng ở 8.4). |
| Chữ | **Inter** (chốt 18/11, thay font hệ thống của DS OpenAI) qua `next/font/google` subset `latin` + `vietnamese`, dự phòng `ui-sans-serif, system-ui`. Số, mã, serial, SĐT, tiền: Inter + `tabular-nums` (không mono). Icon lucide nét 1.5. Thang OpenAI: 12/18 · **14/20 mặc định** · 16/24 · 18/26 · 20/26 · 24/28 (tiêu đề trang). Weight 400 · 500 · 600. |
| Kích thước control | `control-size-md` **32px** mặc định (nút, ô nhập, select, tab, mục nav) · sm 28px · lg 36px · chạm điện thoại ≥ 44px. Padding ngang 12px (pill ×1,33). |
| Bo góc | Nút pill (OpenAI mặc định), nút trong bảng/toolbar dày 6–8px · ô nhập/select 8px · thẻ, khung bảng, menu, Alert 12px · hộp thoại 16px (mở rộng GWT) · chip trạng thái 4px. |
| Viền / bóng | Viền control bằng `box-shadow inset 1px`. Lớp nổi: `shadow` + `shadow-hairline`. Thẻ phẳng. |
| Focus | Outline 2px `ring` (#0169cc), offset 2px, cho mọi phần tử bấm được; ô nhập: viền đậm lên đen 50%. |
| Icon | `lucide-react` (bộ shadcn dùng sẵn), nét 2px; không emoji 🔴 ⚠️ làm icon. |
| Sáng/tối | DS có Light + Dark; v2.0 làm Light, Dark chỉ khi màn được yêu cầu. |

**Tích hợp vào code (từ DS, mục "Tích hợp vào gwt-app"):** một lớp reset (Preflight của Tailwind, **không** import `index.css`/`base.css` của kit OpenAI); hàm `alpha()`/`spacing()` của kit là PostCSS riêng → dùng giá trị đã giải trong `tokens.json` hoặc `color-mix()`; `light-dark()` cần `color-scheme`; `--color-border`/`--color-ring` trùng tên giữa shadcn và OpenAI → gán `--border`/`--ring` bằng giá trị OpenAI, không trỏ ngược `var(--color-border)`.

### 8.2 Hàm dùng chung (không phải UI nhưng mọi UI cần)

| Hàm | Quy định | Tiêu chí |
| --- | --- | --- |
| `homNay()` / `isoNgay(d)` | Ngày theo **giờ Việt Nam**, không dùng `toISOString()` | 23:30 giờ VN vẫn ra đúng ngày VN |
| `ngay(d)` · `ngayGio(d)` | `dd/mm/yyyy` · `dd/mm/yyyy HH:mm` | một nguồn, thay ≥10 bản cũ |
| `tien(n)` | `1.250.000 đ` — một hậu tố duy nhất | thay 9 bản cũ |
| `soGon(n)` | `1,2 tr` · `33 N` (Intl compact) | |
| `sdt(s)` | hiển thị `0912 345 678`; chuẩn hoá khớp 9 số cuối | khớp cột chuẩn hoá trong DB |
| `boDau(s)` | khớp đúng `khong_dau()` của Postgres | thay 9 bản cũ |

### 8.3 Component

Mỗi component: **dùng ở** (màn), **hành vi**, **biến thể**, **trạng thái phải có** (đang tải · rỗng · lỗi · bị khoá), **nghiệm thu**.

**Nền shadcn:** mọi component dưới đây dựng trên component shadcn đã áp diện mạo OpenAI trong DS — Button · Input/Label/Textarea · Select · Combobox · Checkbox · Tabs · DropdownMenu · Dialog/AlertDialog · Sheet · Table · Sidebar · Badge · Alert. Không thay bằng component React của OpenAI. Logic lọc/tìm/phân trang giữ ở `apps/web/bang/`, chỉ đổi lớp áo.

| Component GWT | Nền shadcn trong DS |
| --- | --- |
| `Tabs` | Tabs (kiểu SegmentedControl) |
| `BoLocChon` | Select (≤10 mục) |
| `BoLocGoiY` · `OChonGoiY` · `OChonTimXa` · `ChonKhach` · `ChonSerial` · `TimToanCuc` | Combobox (Popover + Command) |
| `BangDuLieu` · `ChonNhieuDong` | Table (TanStack data table) + Checkbox |
| `ChipTrangThai` · `NhanNguon` | Badge |
| `HopThoai` · `XacNhan` | Dialog · AlertDialog |
| `PanelBen` | Sheet |
| `BannerLoi` | Alert danger |
| `ThongBao` | Sonner — **chưa có trong DS, cần thêm** |
| `ONgay` · `LocNgay` | Calendar / Date Picker — **chưa có trong DS, cần thêm** |
| `KhungApp` | thanh icon + panel menu (mục 3) dựng từ Sidebar + Tooltip + DropdownMenu của DS |
| còn lại | dựng bằng token DS, xong thì đưa vào DS |

#### Khung trang

| Component | Dùng ở | Hành vi + nghiệm thu |
| --- | --- | --- |
| `KhungApp` | mọi trang | Thanh icon 52px (khu, launcher, ⚙️, avatar) + panel menu 288px của khu + nút dock Bắp (mục 3). Mục menu ẩn khi thiếu quyền (không hiện rồi báo lỗi). Kỹ thuật viên thuần chỉ thấy "Lịch của tôi". Điện thoại: ngăn kéo trượt từ trái, Bắp toàn màn. |
| `DauTrang` | mọi trang | Tiêu đề · phụ đề · nút quay lại (lùi lịch sử, không có thì về trang mặc định) · khu nút hành động bên phải. |
| `TheNoiDung` | mọi khối | Thẻ trắng, viền, bo 12px, tiêu đề khối tuỳ chọn. Một kiểu duy nhất thay `p-4`/`p-5` lẫn lộn. |
| `Tabs` | khách 360, kho serial, ads, chi tiết đơn | Tab ghi vào URL `?tab=` (F5/gửi link giữ tab); chỉ tải nội dung tab đang mở. |

#### Danh sách (mẫu chuẩn của mọi khu)

| Component | Hành vi + nghiệm thu |
| --- | --- |
| `ThanhLoc` | Ô tìm không dấu (`q`) + chip lọc + `LocNgay` + chip sắp xếp + dòng "Đang lọc: … · Xoá lọc". Mọi bộ lọc nằm trên URL theo tên chuẩn (`q ngtu ngden trang cot chieu sp kenh tinh tt tp bh loai`). Đổi lọc → về trang 1. Luôn nói "đang thấy X / có Y". |
| `BoLocChon` / `BoLocGoiY` | ≤10 lựa chọn: chip/select; >10: **gõ để tìm**. Cắt bớt thì ghi "Đang hiện 30 / 328". |
| `LocNgay` | 4 preset Hôm nay · Tuần này (bắt đầu Thứ 2) · Tháng này · 30 ngày + khoảng tuỳ chọn. |
| `BangDuLieu` | Cột định nghĩa một lần; người dùng ẩn/hiện/đổi thứ tự cột, lưu **view cá nhân** hoặc **view chung** (quyền quản lý; bản cũ đã có ở 4 bảng CSKH). Sắp xếp theo cột (khoá phụ duy nhất). Phân trang. Dòng bấm được → trang chi tiết. Cột tiền/số căn phải, `tabular-nums`. Điện thoại: thu thành thẻ. |
| `ChonNhieuDong` + `ThanhHangLoat` | Ô chọn từng dòng + "chọn tất cả theo bộ lọc" (gọi lại đúng truy vấn, không giới hạn 1.000 dòng); thanh hàng loạt hiện số đã chọn + thao tác (đổi trường, gán người, đóng, xoá, xuất). Đổi bộ lọc → bỏ chọn. |
| `NutXuat` | Chọn cột → tải CSV/Excel đúng bộ lọc hiện tại; xuất dữ liệu nhạy cảm đi qua duyệt. |
| `TheSo` | Ô số liệu (nhãn · số · ghi chú). Bấm = áp bộ lọc tương ứng (vd "Mở quá 7 ngày: 12" → lọc). |
| `TrangThaiRong` | Rỗng vì chưa có dữ liệu ≠ rỗng vì bộ lọc (có nút "Xoá lọc"). |

#### Hiển thị đối tượng

| Component | Hành vi + nghiệm thu |
| --- | --- |
| `DauDoiTuong` | Đầu trang chi tiết ticket / đơn / khách / máy / việc: mã (`tabular-nums`) · thuộc tính chính · **ô sửa nhanh** (chọn là lưu ngay, có lỗi thì trả về giá trị cũ) · dòng tóm tắt ("Mở 5 ngày · 2 lần lỗi · lần cuối 16/11"). |
| `ChipTrangThai` | Một component cho mọi trạng thái (ticket, đơn, thanh toán, bảo hành, việc, kho, CTKM, ưu tiên, khẩn, mức độ lỗi). Nhận `loai` + `giaTri`, tự tra tone ở bảng 8.4. Thay ≥8 badge cũ. |
| `NhanNguon` | "App" · "Sheet" · "Discord ↗" (link tin gốc) · "Bot". Hiện trên đơn, task, dòng kho, mục nhật ký. |
| `NhatKy` (timeline) | Dòng theo ngày: ai · lúc · nội dung · tệp đính kèm · nguồn. Thêm mục mới ngay trong khối; chọn ngày lùi được (không tương lai); sửa/xoá mục của mình. Dùng cho: các lần lỗi ticket, trao đổi ticket, bình luận việc, lịch sử thay lõi, lịch sử sửa kho, nhật ký thao tác. |
| `KhoiThongTin` | Cặp nhãn–giá trị 2 cột (Khách · SĐT · Tỉnh · Máy · Serial · Bảo hành); giá trị có thể là link. Trống ghi "—", thiếu dữ liệu cần bổ sung thì cảnh báo vàng. |
| `Kanban` | Cột theo trạng thái, kéo thả thẻ, thẻ hiện ưu tiên · hạn · người làm. Chỉ khu Việc. |
| `LichThang` | Lưới 7 cột tuần bắt đầu Thứ 2, mục theo ngày, bấm ngày → danh sách. Dùng cho lịch bảo trì và lịch kỹ thuật (thay 2 bản gần giống nhau). |

#### Nhập liệu

| Component | Hành vi + nghiệm thu |
| --- | --- |
| `OChonGoiY` | Chọn từ danh sách nạp sẵn, gõ để lọc (không dấu), giữ giá trị lạ của dữ liệu cũ. Nền cho `ChonTinh`, `ChonSanPham`, `ChonLoaiTicket`, `ChonNguoi`. |
| `OChonTimXa` | Chọn từ tập lớn trên server: debounce 250ms, tối thiểu 2 ký tự, **bỏ kết quả về trễ**, phím ↑↓ Enter Esc. Nền cho `ChonKhach`, `ChonSerial`, `ChonViec`. |
| `ChonKhach` | Trên `OChonTimXa`; hiện tên · SĐT · tỉnh · địa chỉ; cờ `choTaoMoi` mở hộp tạo khách, tra trùng 9 số cuối SĐT trước khi lưu. Thay 3 bản cũ. |
| `ChonSerial` | Trên `OChonTimXa`; hiện serial · model · khách · bảo hành; cho để trống (ticket chưa có serial); serial lạ → tạo "chờ duyệt". |
| `ChonKenh` | 2 cấp phụ thuộc (cấp 1 → cấp 2), cố ý không gõ tự do. |
| `ONgay` | Ngày theo giờ VN; tuỳ chọn chặn tương lai / chặn trước mốc. |
| `OTien` | Gõ số, hiện phân cách nghìn, lưu số nguyên đồng; không dùng `type="number"`. |
| `OTaiTep` | Kéo thả / chọn tệp, xem trước ảnh, giới hạn dung lượng + loại, tiến trình, xoá. Thay 4 bản cũ. |
| `OSuaTaiCho` | Bấm để sửa một giá trị tại chỗ, Enter/blur lưu, Esc huỷ, lỗi thì trả giá trị cũ + báo. Thay 15 bản state `dangSua` riêng. |
| `KhungForm` | Quản trạng thái gửi (đang lưu, lỗi theo ô, lỗi chung) bằng một cơ chế chung (`useActionState`); nút Lưu khoá khi đang gửi; rời trang khi chưa lưu thì hỏi. |

#### Lớp phủ & phản hồi

| Component | Hành vi + nghiệm thu |
| --- | --- |
| `HopThoai` | Dựa trên `<dialog>` gốc: Esc đóng, khoá cuộn nền, giữ focus trong hộp, trả focus về nút mở. Thay 5 kiểu modal cũ. |
| `XacNhan` | Thay mọi `window.confirm`: tiêu đề · hậu quả · nút nguy hiểm màu đỏ ghi rõ hành động ("Xoá đơn 260819-E004") · nếu không hoàn tác được thì nói rõ. |
| `PanelBen` | Panel trượt phải **chỉ cho đối tượng không có trang riêng** (chi tiết việc trên Bảng team/Kanban); không làm bản xem trước song song cho thứ đã có trang chi tiết (mục 9). Trên điện thoại thành toàn màn. |
| `ThongBao` (toast) | Báo thành công/lỗi ngắn ở góc, tự tắt; lỗi nghiêm trọng thì giữ đến khi đóng. Hiện chưa có toast nào. |
| `BannerLoi` | Lỗi tải dữ liệu của cả khối: câu tiếng Việt + nút thử lại. Một màu đỏ duy nhất (bản cũ lẫn `red` và `rose`). |
| `TuLamMoi` | Làm mới dữ liệu định kỳ (20s) trên màn cần sống (ticket, kho); dừng khi tab ẩn, đang gõ, đang chọn dòng; hiện "cập nhật lúc HH:mm:ss". |

#### Riêng nghiệp vụ (cần cho các luồng ở mục 7)

| Component | Dùng ở | Hành vi + nghiệm thu |
| --- | --- | --- |
| `TheLuuYKhach` | hồ sơ khách, đầu ticket, tạo ticket, phiếu KTV, Việc hôm nay | Thẻ theo loại × mức (4.2); bản đầy đủ (sửa/gỡ, lịch sử) và bản gọn (chỉ 🔴🟡); chế độ **bật lên khi tra SĐT, bấm "Đã đọc" mới đi tiếp**; lưu ý tự động khác màu lưu ý người ghi |
| `ViecHomNay` | `/hom-nay` | Các khối: khẩn · việc tiếp theo quá hạn · lời hứa đến hạn · lịch KT hôm nay · việc Chờ tới ngày xem lại · bàn giao ca; mỗi dòng mở thẳng ticket |
| `BonTruongTicket` | đầu ticket, tạo ticket | 4 ô bắt buộc Chủ · Việc tiếp theo · Người đang phải làm · Hạn + trạng thái + lý do chờ; không cho lưu thiếu khi ticket đang mở |
| `CayChanDoan` | ticket (Đợt 2) | Đi từng bước hỏi/hướng dẫn của mã lỗi, ghi câu trả lời, kết thúc ở "xong từ xa" hoặc "cử KT" (tự điền vật tư vào phiếu) |
| `XemTruocBaoCao` | ticket, lượt bảo trì (Đợt 2) | Bản báo cáo sau dịch vụ soạn sẵn, sửa câu chữ, nút Gửi Zalo / Chép báo cáo; chặn gửi khi thiếu ảnh/chỉ số |
| `BangDongDon` | tạo/sửa đơn | Lưới dòng: mã (gõ để tìm) · SL · giá đã gồm VAT (`OTien`) · VAT · quà · ghi chú; gợi ý giá theo bậc/CTKM chỉ điền dòng chưa gõ tay; mời thêm quà; 31 ô theo dõi ẩn/hiện theo loại đơn; cảnh báo bán dưới giá duyệt |
| `MaTranGia` | bảng giá bậc | Lưới bậc × mã, nhập % hoặc giá, sửa hàng loạt theo %, hiện giá niêm yết để so |
| `BangDieuPhoiTuan` | điều phối KTV | Hàng = KTV, cột = ngày trong tuần, ô = phiếu việc; ngày nghỉ KTV tô xám; cảnh báo trùng lịch; kéo phiếu sang ô khác để đổi người/ngày |
| `NhapCoXemTruoc` | lô serial, danh mục lỗi, Sheet HO | Dán từ Excel hoặc tải xlsx/csv → bảng xem trước, đánh dấu dòng trùng / sai / mới → chỉ ghi khi bấm xác nhận |
| `TheDuyetDiff` | `/duyet`, lịch sử sửa kho, đề xuất dời lượt bảo trì, nhật ký thao tác | Hiện **trước → sau** từng trường, ai đề xuất, lý do; nút Duyệt / Từ chối (bắt lý do); duyệt một lần duy nhất |
| `MaTranThongBao` | cấu hình thông báo | Hàng = loại thông báo, cột = kênh Discord / người nhận, ô bật/tắt |
| `OSoanBinhLuan` | việc, ticket | Ô soạn có **@nhắc tên** (gợi ý nhân viên), đính kèm tệp, Ctrl+Enter gửi |
| `PanelLienKet` | chi tiết việc | Việc con (tạo nhanh), phụ thuộc 2 chiều (chặn vòng lặp), chip khách/ticket/đơn |
| `OSoanNhac` | việc, Discord D3 | Giờ nhắc · người được nhắc · có nhắc người giao · nội dung; hiện danh sách lời nhắc của việc với trạng thái |
| `NghiemThuYeuCau` | Task AI (D4) | Danh sách yêu cầu (đánh số, gom theo app) · trạng thái · link kết quả · luồng comment của CEO trên từng yêu cầu · phần giải thích thu gọn/mở rộng |
| `TongKetThang` | Work | Bảng theo người (số xong, thời gian hoàn thành TB, số trễ) + danh sách việc có ô nhận xét kết quả |
| `BieuDo` | báo cáo lỗi (Pareto, theo tháng), báo cáo kho tháng, tổng kết tháng | Cột, đường, Pareto; một bảng màu theo token; hover xem số; luôn kèm bảng số |
| `TimToanCuc` | thanh điều hướng | Gõ SĐT/tên/serial/mã đơn/mã ticket → gợi ý theo loại → Enter mở |
| Màn xác thực | `/login`, chờ duyệt, đổi mật khẩu bắt buộc, quên mật khẩu | Một khung chung; câu báo lỗi theo từng ca (bị khoá · chờ duyệt · ngoài danh sách) |

#### Riêng điện thoại (kỹ thuật viên)

| Component | Hành vi + nghiệm thu |
| --- | --- |
| `TheViecHienTruong` | Một phiếu việc trong ngày: giờ · khách · địa chỉ (bấm mở bản đồ) · SĐT (bấm gọi) · loại việc · ghi chú · **lưu ý 🏠🔧🔴 của khách**. Nút lớn **Xong** (mở `DongPhieuKTV`) và **Hẹn lại** (chọn ngày mới + lý do). Dùng được bằng một tay. |
| `DongPhieuKTV` | Theo loại việc: việc đã làm (chọn) · **serial (bắt buộc với lắp máy, dùng `OQuetSerial`)** · ảnh trước/sau · chỉ số nước trước/sau (TDS, pH, độ cứng, Clo) · lõi/linh kiện đã thay · muối · phí đã thu · ghi chú cho khách · "Có gì cần nhớ cho lần sau?". Lưu được khi mất sóng rồi gửi lại. |
| `OQuetSerial` | Quét mã vạch/QR bằng camera hoặc gõ tay; kiểm dạng serial theo model; báo ngay nếu serial thuộc khách khác. |

### 8.4 Bảng tone trạng thái

Tone → vai màu DS: `trung-tinh` secondary · `dang-lam` info · `cho` warning · `xong` success · `loi/khan` danger (Khẩn: Badge solid) · `thong-tin` discovery. Hiển thị qua `ChipTrangThai` = Badge `soft` cỡ sm (20px, chữ 12px semibold), luôn có chữ.

| Loại | Giá trị → tone |
| --- | --- |
| Ticket (v2, đặc tả 17/11) | Mới → `thong-tin` · Đang xử lý → `dang-lam` · Chờ, Chờ khách xác nhận → `cho` · Đóng → `xong` · Huỷ, Trùng → `trung-tinh` · Khẩn → `loi/khan` |
| Ưu tiên (ticket + việc) | P1 → `loi/khan` · P2 → `cho` · P3 → `thong-tin` · P4 → `trung-tinh` |
| Mức độ nhóm lỗi | an toàn, nghiêm trọng → `loi/khan` · thường → `cho` · nhẹ → `thong-tin` · không lỗi → `trung-tinh` |
| Lưu ý khách | 🔴 Phải đọc → `loi/khan` · 🟡 Nên biết → `cho` · ⚪ Thông tin → `trung-tinh` |
| Đơn – hàng | Mới, Xác nhận → `trung-tinh` · Chuẩn bị hàng, Đang giao, Đã giao chờ lắp → `dang-lam` · Đã lắp đặt, Hoàn thành → `xong` · Hoàn hàng, Huỷ → `loi/khan` |
| Đơn – thanh toán | Chờ cọc, Chờ đối soát, Còn nợ → `cho` · Đã cọc → `dang-lam` · Đã thu đủ → `xong` |
| Bảo hành (2 tầng máy + lõi) | Còn hạn máy → `xong` · Hết máy, còn lõi → `cho` · Hết cả hai → `loi/khan` · Chưa kích hoạt → `trung-tinh` |
| Lượt bảo trì / thay lõi | Còn hạn → `trung-tinh` · Sắp đến hạn (≤30 ngày) → `cho` · Quá hạn → `loi/khan` · Đã xong → `xong` · Không rõ hạn → `thong-tin` |
| Phiếu việc KTV | Hẹn → `dang-lam` · Xong → `xong` · Huỷ → `trung-tinh` |
| Serial | Tồn kho → `trung-tinh` · Đã lắp → `xong` · Bảo trì → `cho` · Thu hồi bảo hành → `loi/khan` · Chờ duyệt → `cho` · Từ chối → `trung-tinh` |
| Khách | Đã duyệt → `xong` · Thiếu SĐT / thiếu địa chỉ → `cho` · Đã xoá (gộp) → `trung-tinh` |
| Yêu cầu duyệt / xuất | Chờ duyệt → `cho` · Đã duyệt → `xong` · Đã tải → `trung-tinh` · Từ chối → `loi/khan` |
| Việc | Nháp (từ Discord) → `trung-tinh` · Cần làm → `trung-tinh` · Đang làm → `dang-lam` · Bị chặn → `loi/khan` · Chờ duyệt → `cho` · Xong → `xong` |
| Lời nhắc | Chờ giờ → `cho` · Đã gửi → `xong` · Đã huỷ → `trung-tinh` |
| Kho | Đã duyệt → `xong` · Chờ duyệt mã → `cho` · Bỏ qua/huỷ → `trung-tinh` · Sắp hết / tồn âm → `loi/khan` |
| Đối soát (HO, VTP) | Khớp → `xong` · Chưa đối soát → `cho` · Lệch → `loi/khan` |
| CTKM / chính sách giá | Nháp → `trung-tinh` · Ban hành → `xong` · Kết thúc, Thay thế → `trung-tinh` |
| Kỳ kế toán | Đang xử lý → `dang-lam` · Đã gửi → `xong` · Đã sửa sau gửi → `cho` |

### 8.5 Luật dùng component

1. Không viết UI riêng trong khu mình khi đã có component chung; thiếu thì **thêm vào bộ chung** rồi ghi vào file này.
2. Danh sách chọn >10 mục bắt buộc gõ để tìm.
3. Không `window.confirm`, không `toISOString()` cho ngày, không `type="number"` cho tiền.
4. Mọi trạng thái hiển thị qua `ChipTrangThai`; mọi tiền/ngày qua hàm ở 8.2.
5. Mỗi component có đủ 4 trạng thái: đang tải · rỗng · lỗi · bị khoá (thiếu quyền).

## 9. Không mang sang v2

Tóm tắt từ `docs/rework/2026-11-18-review-don-gian-hoa.md`: các màn trùng (3 danh sách khách, 4 màn lỗi, route `/can-don` mồ côi), 2 hệ khách song song (Sales `customers` và CSKH `cs_customers` → **một hệ khách**), 2 hệ phân loại lỗi, drawer xem trước song song trang chi tiết, mọi code chờ migration.

## 10. Còn chờ chốt

Đã có đáp án nên **không hỏi lại**: bộ trạng thái ticket và ô ghi chú khách (đặc tả 17/11 → trạng thái mới + Thẻ lưu ý khách); ticket cũ gắn lỗi cũ (PR #24 đã chuyển 25 mã sang 4 nhóm + "Không phải lỗi").

### 10.1 Phạm vi v2.0 (anh Dũng / CEO)

| # | Câu hỏi | Ở mục | Đề xuất |
| --- | --- | --- | --- |
| 1 | Nối chuỗi Sales → Kho → Lắp → BH → Bảo trì (bảng 7.0) có trong v2.0 không, hay làm từng nấc | 7.0 | có, theo thứ tự: lắp → BH → gói bảo trì trước, kho sau |
| 2 | Kế toán (code lát 1–5 trên nhánh) vào v2.0 hay để sau | 4.7, 7.12 | để sau, giữ chỗ trong launcher |
| 3 | Lịch & Dự án (Work), Báo giá · Hợp đồng · Doanh số Sales | 4.1, 4.3 | ngoài v2.0 |
| 4 | Kế hoạch chuyển data SalesTracking → Masterdata (thứ tự schema, đổi đích bot cùng lúc) | 6 | việc riêng, làm trước khi code v2 |
| 5 | Ai được tạo mã khách trong v2, khi luật Masterdata gốc chỉ cho chị Trang thêm `customers` | 6, 7.1, 7.2 | khách tạo ở schema module, chị Trang duyệt lên bảng gốc |
| 6 | Font chung của app | 3, 8.1 | **đã chốt 18/11: Inter**, số/mã dùng `tabular-nums`, không mono |
| 7 | Màu khu dùng tới đâu: chỉ dấu nhận diện ở thanh điều hướng, hay cả nút chính/focus như bản cũ | 8.1 | chỉ dấu nhận diện; nút chính đen, focus xanh theo DS |
| 8 | Nền thanh điều hướng tầng 1: giữ `#0c2a2e` (mở rộng GWT) hay nền sáng của DS | 3, 8.1 | giữ `#0c2a2e` |
| 9 | `dang-lam` = info (xanh dương) và `thong-tin` = discovery (tím) thay accent khu / chàm | 8.1, 8.4 | đồng ý |
| 10 | Cặp màu nguồn OpenAI chưa đạt WCAG (viền ô nhập 1,42:1, viền Checkbox 1,6:1, chữ Badge success 4,05:1, chữ lỗi nền tối 3,52:1): giữ nguồn hay mở rộng GWT | 8.1 | sửa theo phương án có số đo trong DS |

### 10.2 Đặc tả CSKH 17/11 — câu còn mở trong đặc tả (Q1–Q6)

| # | Câu hỏi | Ảnh hưởng |
| --- | --- | --- |
| Q1 | Sáu loại lưu ý + ba mức đã đủ chưa? Giữ luật tối đa 3 lưu ý đỏ / khách? | Thẻ lưu ý (4.2) |
| Q2 | KT ghi lưu ý là hiện ngay, hay CSKH duyệt trước? | Thẻ lưu ý, phiếu KTV |
| Q3 | Báo cáo sau dịch vụ luôn có người duyệt, hay sau một thời gian cho tự gửi loại "thay lõi"? | 7.8 |
| Q4 | Bắt buộc 4 trường cho ticket cũ ngay, hay điền dần trong chiến dịch gọi lại? | 7.7 |
| Q5 | Mockup 9 màn (riêng tư, có số thật) đã duyệt chưa? | toàn khu CSKH |
| Q6 | Đề xuất miễn phí / tặng / giảm giá có cần nút duyệt riêng cho CEO trong app, hay ghi ở nhật ký ticket là đủ? | 7.7 (lý do chờ "duyệt") |

### 10.3 Câu nghiệp vụ khác

| # | Câu hỏi | Ở mục | Đề xuất |
| --- | --- | --- | --- |
| 1 | Ngưỡng "mở quá lâu" của ticket | 4.2, 7.7 | 7 ngày |
| 2 | Chủ ticket trong v2 gộp `cs_phu_trach` (theo tài khoản) và `cs_theo_doi` (4 tên) thế nào | 4.2 | một trường "chủ ticket" chọn từ danh sách người CSKH tách khỏi tài khoản |
| 3 | Nhật ký ticket: lần báo mới nhất lên trên hay cũ trước | 4.2 | mới nhất lên trên |
| 4 | Việc gấp: dùng P1 hay nhãn Gấp riêng | 4.1, 7.13 | dùng P1 |
| 5 | Việc "Chờ duyệt" có bắt reviewer duyệt thật không | 7.13 | có |
| 6 | Kênh Discord nào nhận giao việc (D1) và từng loại thông báo (D6) | 7.14 | giao việc ở #ai-team + các kênh công việc hiện có; thông báo theo khu |
| 7 | Trùng SĐT khách: chặn hay cảnh báo | 7.2 | chặn, admin bỏ qua có lý do |
| 8 | Chính sách giá theo bậc có qua duyệt như CTKM không | 7.3 | có |
| 9 | Ai được sửa/xoá đơn | 7.1 | người tạo + Trưởng Sales |
| 10 | Thanh toán nhiều đợt: các loại đợt, ai ghi; báo Discord đơn chờ cọc quá N ngày (N = ?) | 7.1 | — |
| 11 | Bộ combo có giữ dòng mẹ không | 7.6 | — |
| 12 | Kênh nhắc khách trước hạn bảo trì (Zalo / SMS / gọi) | 7.8 | Zalo, cùng đường gửi báo cáo sau dịch vụ |
| 13 | Phiếu KTV có cần trạng thái "đang làm" (đo thời gian tại nhà khách) | 7.9 | không ở v2.0 |
| 14 | Ngày chốt tồn đầu kỳ kho | 7.4 | — |
| 15 | Lịch kỹ thuật gắn khách: yêu cầu chi tiết | 7.9 | chờ chị Trang gửi |
| 16 | HO: đích "excel của mình" là Sheet đơn GWT hay sổ đơn trong app | 7.10 | sổ đơn trong app + xuất Sheet |
| 17 | HO: ai cập nhật link khi HO gửi file mới; chu kỳ đọc | 7.10 | Trưởng Sales; 15 phút |
| 18 | HO: khách của đơn HO là một khách đại lý hay từng khách cuối | 7.10 | — |
| 19 | VTP: kết nối bằng API hay tài khoản; nguồn vận đơn không phải đơn bán | 7.11 | sau bước đối soát tay |
| 20 | Kế toán: quyền tạm (`ke_toan, tai_chinh, ceo, admin`) có giữ không | 7.12 | khi làm module |
| 21 | Eton: chọn gói DAY hay MONTH (hoặc chỉ mua client_id/secret) cho kho HCM | 7.4 | chờ Eton trả lời giá |
| 22 | Trang 1 ticket: danh sách trường "hay xem, hay sửa" đặt trên cùng | 4.2 | chốt sau khi hỏi Hiền (doc AI-Team 2.4) |
