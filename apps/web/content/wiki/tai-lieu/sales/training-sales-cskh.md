---
tieuDe: "Training Sales & CSKH"
hang: "C"
thuTu: 1
nguon: "Tài liệu đào tạo nội bộ · đã sửa lỗi USH10 28/08"
---

# Training Sales & CSKH — GWT

Tài liệu đào tạo cho nhân sự Sales và Chăm sóc khách hàng (CSKH) của GWT — đơn vị phân phối máy lọc nước thương hiệu GE tại Việt Nam. Mục đích: người mới đọc là nắm được sản phẩm, kịch bản tư vấn, lệnh Pancake/Botcake và quy trình chốt đơn / chăm sóc sau bán để làm được việc ngay.

> Tổng hợp tự động từ kênh Discord training-sales-và-cskh, dữ liệu tới 11/08/2026. Đã lược bỏ thông tin đăng nhập & dữ liệu cá nhân. Bản nháp — cần người phụ trách rà soát.

---

## Mục lục

1. [Sản phẩm & phân loại](#1-sản-phẩm--phân-loại)
2. [Kiến thức sản phẩm chuyên sâu (Q&A chuẩn)](#2-kiến-thức-sản-phẩm-chuyên-sâu-qa-chuẩn)
3. [Lệnh Pancake/Botcake](#3-lệnh-pancakebotcake)
4. [Quy trình tiếp nhận & tư vấn chat](#4-quy-trình-tiếp-nhận--tư-vấn-chat)
5. [Kịch bản xử lý từ chối / thắc mắc khó](#5-kịch-bản-xử-lý-từ-chối--thắc-mắc-khó)
6. [Quy trình chốt đơn & lên đơn](#6-quy-trình-chốt-đơn--lên-đơn)
7. [Quy trình lắp đặt & giao hàng](#7-quy-trình-lắp-đặt--giao-hàng)
8. [CSKH & sau bán (bảo hành, bảo trì, thay lõi, lỗi máy)](#8-cskh--sau-bán)
9. [Phân loại & đánh dấu khách trên Pancake](#9-phân-loại--đánh-dấu-khách-trên-pancake)
10. [Báo cáo cuối ca & phối hợp nhóm](#10-báo-cáo-cuối-ca--phối-hợp-nhóm)
11. [QA / training cho chatbot AI](#11-qa--training-cho-chatbot-ai)
12. [Quy định & lưu ý chung (nên / không nên)](#12-quy-định--lưu-ý-chung)
13. [Tài nguyên nội bộ (link)](#13-tài-nguyên-nội-bộ)
14. [Cần bổ sung / kiểm chứng](#14-cần-bổ-sung--kiểm-chứng)

---

## 1. Sản phẩm & phân loại

GE có **2 nhóm sản phẩm chính**. Nắm rõ khách hỏi nhóm nào để không gửi nhầm tài liệu.

### A. POU — Máy lọc nước uống (đặt tại điểm dùng)

Tất cả dùng công nghệ lõi **G+ Mineral** (giữ khoáng tự nhiên). Chia làm 2 kiểu: **để bàn** và **âm tủ bếp**.

| Model | Kiểu | Đặc điểm chính | Lõi |
|---|---|---|---|
| **CTD50** | Để bàn, giữ khoáng | Có bản dùng **bình chứa** (không kết nối đường nước) | 1 lõi duy nhất **CFNC** |
| **CTS20** | Để bàn, có tạo **soda/sparkling** | Kết nối đường nước, làm lạnh sâu & nhanh, trộn soda thẳng vào nước. Màu **vàng** | 2 lõi **PCF** và **NF** |
| **CTS10** | Để bàn, tạo soda (bản đơn giản hơn CTS20) | Dùng **bình chứa**, không kết nối đường nước, bơm soda thủ công. Có sẵn 1 bình gas đi kèm | — |
| **USH10** | **Âm tủ bếp (under-sink)**, không sparkling, nước nóng 4 mức | **Sắp có hàng** — kiểm `wh_master` trước khi trả lời khách | Lõi thô **PCFB** + lõi màng **NF** |
| **B04 / GN610 / GN620 / DN810** | **Âm tủ bếp** (under-sink) | DN810 có **2 vòi**: 1 vòi uống đi kèm máy + 1 vòi rửa gắn vào vòi rửa nhà khách; dòng chảy mạnh, hợp rửa hoa quả | GN620 dùng lõi PCF; các mẫu có lõi PCF/NF tùy máy |

**So sánh CTS20 vs CTS10** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1487797983029362920)):
1. CTS20 làm lạnh **sâu hơn và nhanh hơn**.
2. CTS20 **kết nối đường nước**; CTS10 dùng **bình chứa**.
3. CTS20 tạo soda bằng cách **trộn thẳng vào nước**; CTS10 **bơm thủ công**.

Gợi ý chọn: khách **không có nước máy** (chỉ có bình 20L) → **không dùng được CTS20** (cần nước máy + kết nối đường nước) → tư vấn **CTS10** (dùng bình chứa). ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497611271065960509))

### B. POE — Lọc tổng / lọc đầu nguồn (đặt tại đầu vào nhà)

**4 bộ**: `15A`, `15A Eco`, `30A`, `30A Eco`. Công suất từ **1,5 m³/giờ** (thấp nhất) đến **3 m³/giờ** (cao nhất).

Gợi ý chọn theo nhu cầu:
- **Căn hộ 2 người, không bồn tắm** → **15A** hoặc **15A Eco**.
- **Nhà 4–6 người / nhà mặt đất** → **30A** (hoặc **30A Eco** nếu muốn tiết kiệm chi phí).
- **Miền Bắc** (Bắc Giang, các tỉnh phía Bắc): nước độ cứng cao (~**90–150 ppm**) → tối thiểu **30A** mới đủ công suất làm mềm nước. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498294063806414980))

Đặc điểm & lưu ý POE:
- **Bán theo bộ, KHÔNG bán riêng** thiết bị tiền lọc. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1501605086743367882))
- Cần **đổ muối định kỳ 3–4 tuần/lần** → khuyến nghị đặt ở vị trí tiện đổ muối (ban công / logia với căn hộ).
- **Muối**: bao 25kg giá **412.500đ** (chưa gồm ship), khách chịu phí ship. Gợi ý lấy từ 4 bao nhưng **không ép** (nhà không có chỗ để thì lấy 2 bao cũng được).
- Lọc tổng **KHÔNG có khuyến mãi/giảm giá** (brand cao cấp — xem mục 5).
- Nước sau lọc tổng: **dùng nấu ăn được nhưng KHÔNG uống trực tiếp**. An toàn nhất: uống & thổi cơm nấu canh dùng máy lọc uống; lọc tổng dùng rửa rau vo gạo. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498339198430744657))
- **Nước giếng khoan** → thường **không tiềm năng** (cần chuyên gia đánh giá riêng, không tự tư vấn bộ tiêu chuẩn).
- **Dự án lớn** (chung cư 13 tầng, tòa nhà, commercial/industrial): cả 4 bộ đều không đủ công suất → xin SĐT/ngân sách, chuyển **chuyên gia / bộ phận kinh doanh** tư vấn giải pháp. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498147194409062461))

### Thương hiệu GE
- Brand **cao cấp toàn cầu**, quy định giá niêm yết **nghiêm ngặt**.
- **Không giảm giá lọc tổng**, không nâng giá rồi giảm để bán.
- **Không bán sỉ, không phát triển nhà phân phối/đại lý** qua chat → khách hỏi đại lý/CTV/chiết khấu nhà thầu: xin SĐT + thông tin đơn vị, ẩn comment, chuyển **bộ phận kinh doanh** liên hệ lại.

---

## 2. Kiến thức sản phẩm chuyên sâu (Q&A chuẩn)

Các câu trả lời dưới đây do quản lý/kỹ thuật (anh Donald, chị Trang) duyệt — dùng để tư vấn và để training chatbot.

**Q: Công nghệ G+ Mineral là gì? Máy GE có tạo nước kiềm/Hydrogen không?**
A: GE **không** dùng lõi tạo kiềm hay Hydrogen nhân tạo. Hãng dùng công nghệ độc quyền **G+ Mineral**: loại bỏ 100% độc tố nhưng **giữ lại trọn vẹn vi khoáng tự nhiên** (Canxi, Magie, Kali…). Với khách đang cân nhắc máy ion kiềm nhập khẩu: tiền lọc của máy ion kiềm chỉ dừng ở màng UF (0.1 micron), rủi ro khi nước đầu vào có NO2, NO3, Amoni, kim loại nặng → máy G+ Mineral của GE là giải pháp tiền xử lý lý tưởng. ([nguồn đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1486256882820583455)) — dùng tag `/ionkiem`, `/GMineral`.

**Q: Lõi của CTS20 và CTD50 gắn ở đâu?**
A: Cả CTD50 (1 lõi CFNC) và CTS20 (2 lõi PCF, NF) đều có lõi nằm ở **phía trên cùng của máy, ngay dưới nắp đậy**. Khách **tự thay được**, không cần kỹ thuật viên. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486224918499692654))

**Q: CTS20 yêu cầu gì về áp lực nước / đường nước yếu thì sao?**
A: CTS20 yêu cầu áp lực **0.1–0.4 mPa**. Nếu nguồn nước áp lực **dưới 0.1 mPa** (1 at), khách nên lắp thêm **bơm tăng áp đầu vào** để máy hoạt động ổn định. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1488330707691507722))

**Q: Chế độ "Chờ" (standby) của máy là gì?**
A: Chế độ máy tạm nghỉ, tiêu hao năng lượng thấp nhất mà vẫn sẵn sàng khi dùng lại. **Tự động**, khách không cần chỉnh gì. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497029986471641100))

**Q: Máy có test/chứng nhận giữ khoáng (8 khoáng) không? Có COCQ/COQ không?**
A: Các mẫu dùng chung công nghệ G+ Mineral nên kết quả test giữ khoáng **như nhau** → lấy kết quả test trong **folder chứng chỉ** của một mẫu (ví dụ B04, GN610) gửi khách. Nếu khách muốn test chính máy của mình sau khi mua: hỗ trợ hướng dẫn gửi mẫu nước ra **viện kiểm định**, **chi phí khách chịu**. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497609257657307246))

**Q: Nước máy để bàn (CTD50…) — nước thải đi đâu, thay nước có bất tiện không?**
A: Dùng tag `/countertop` — 2 lưu ý **bắt buộc** báo khách khi chốt đơn máy để bàn: (1) nước thải đi đâu, (2) việc thay nước bất tiện với máy để bàn (không lưu ý trước, khách mua xong thấy không phù hợp sẽ trách). ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1514094091783245884))

**Q: CTS10/CTS20 có cần mua thêm gas tạo soda không?**
A: Trong máy có sẵn **1 bình gas** đi kèm. Dùng bình CO2 food-grade tinh khiết 99.9%. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1514516514139803658))

**Q: Xả nước khi mới thay lõi?**
A: Thay lõi xong: **reset** + **xả lõi như lúc mới mua** (xả 2–3 lần). Phải hướng dẫn khách đủ các bước theo manual. Có thể lấy bình 2L đổ đi cho nhanh. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1501075379996201060))

**Q: Đèn báo trên máy — khi nào thay lõi?**
A: Chỉ khi **đèn "filter" báo đỏ** mới là cần thay lõi. Có đèn khác (ví dụ đèn unlock lấy nước nóng) không phải đèn thay lõi → phải **xem ảnh khách gửi** để phân biệt, đừng hỏi ngược khách. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497877552255995924))

**Q: Máy để bàn dùng nước giếng khoan lắp thế nào?** → Giếng khoan là ca đặc thù, không tiềm năng đại trà; cần kiểm tra riêng, đừng tự khẳng định. (Xem mục kiểm chứng.)

---

## 3. Lệnh Pancake/Botcake

Gõ tag để chèn tin nhắn mẫu (text + ảnh) gửi khách. **Lưu ý chọn đúng "nội dung"**: nhiều tag có nhiều tin (text / có ảnh + quà) — chọn nhầm sẽ gửi cả tin không mong muốn.

### Lọc tổng (POE)
| Lệnh | Dùng khi nào |
|---|---|
| `/sosanhwh` · `/sosanhwh2` | Bảng so sánh 4 bộ lọc tổng (`sosanhwh2` là bản mới, bản cũ vẫn giữ) |
| `/3thietbi` | Thông tin 3 thiết bị trong bộ lọc tổng |
| `/whproductinfo` | Thông tin sản phẩm lọc tổng |
| `/chatluongnuoc` | Chất lượng nước (dùng khi khách hỏi về nước lọc tổng) |
| `/hinhlapdat` | Hình ảnh lắp đặt |
| `/loctongplaylist` | Playlist video lọc tổng |
| `/nuocgieng` | Trường hợp nước giếng |
| `/baotri` | Thông tin bảo trì |
| `/sanxuat` | Thông tin sản xuất |
| `/quytrinh` | Quy trình |
| `/competitor` | So sánh đối thủ |
| `/xinsdt` | Xin số điện thoại (chỉ dùng cho khách lọc tổng, **không** gửi cho khách hỏi lọc uống) |
| `/others` | Câu hỏi khác |

### Lọc nước uống (POU)
| Lệnh | Dùng khi nào |
|---|---|
| `/ssPOU` | So sánh máy lọc uống. Hiện tách 2 tin: khách quan tâm **để bàn** → chỉ gửi tin để bàn; quan tâm **chung chung** → gửi cả 2 tin |
| `/CTD50` `/CTS20` `/CTS10` `/GN610` `/GN620` `/DN810` | Thông tin từng model |
| `/CTD50KM` | CTD50 kèm khuyến mãi (nếu chỉ muốn gửi text: **chọn nội dung 1**, tránh gửi cả tin 2 có ảnh + quà) |
| `/ctd50hdsd` | Hướng dẫn sử dụng CTD50 bản bình chứa (mục 57) — **bắt buộc gửi 100%** khi khách chốt/nhận máy CTD50 |
| `/GMineral` | Công nghệ G+ Mineral |
| `/quatangPOU` | Trả lời "không lấy quà CTD50/CTS20 có được trừ tiền không" |
| `/countertop` | 2 lưu ý máy để bàn (nước thải + thay nước bất tiện) |
| `/ionkiem` | Khi khách hỏi máy ion kiềm — chọn tin phù hợp |

### CSKH / chốt đơn (chung)
| Lệnh | Dùng khi nào |
|---|---|
| `/datcoc` | Xác nhận đơn hàng — chỉnh số tiền, đặt cọc, số còn phải thanh toán |
| `/thanhtoan` | Gửi số tài khoản + hướng dẫn nội dung chuyển khoản |
| `/lapdat` | Thông tin lắp đặt |
| `/kichhoatbh` | Mẫu kích hoạt bảo hành |
| `/baohanh` | Thông tin bảo hành (thời gian, khu vực lắp đặt) |
| `/Playlist` | Playlist video giới thiệu |

> Mẹo học lệnh: tự gửi thử từng tin nhắn mẫu vào **Zalo cá nhân** để xem giao diện khách nhận được. ([nguồn liệt kê tag](https://discord.com/channels/1484009253831315456/1484057657043189860/1513417878878290002))

---

## 4. Quy trình tiếp nhận & tư vấn chat

**Thứ tự gửi khi khách hỏi giá** (khách click quảng cáo thường không nhớ hết tính năng máy):
1. Gửi **giá** trước.
2. Gửi **thông tin máy** (dù botcake đã trả lời vẫn phải gửi lại thông tin + giá chi tiết, không chỉ gửi thông tin lõi).
3. Gửi thêm **playlist** nếu khách có nhu cầu tìm hiểu.

**Nguyên tắc đọc & trả lời:**
- **Đọc kỹ, kéo lại tin nhắn từ đầu** trước khi rep (khách khó tính sẽ khó chịu nếu bạn hỏi lại thứ họ đã cung cấp — nghĩ là "nhiều người trả lời, không nắm thông tin").
- **Xem ảnh khách gửi** rồi mới trả lời — đừng hỏi ngược lại khách thứ đã có trong ảnh.
- **Khách hỏi 3 câu → trả lời đủ 3 câu**, không chỉ trả lời 1 câu.
- Click vào link/tin để xem khách đang quan tâm **sản phẩm nào** — đừng thấy câu giống nhau là copy tin có sẵn (rất hay nhầm **lọc tổng ↔ lọc nước uống**).
- **Không biết thì hỏi nhóm** (tag chị/Giang/anh Như), **KHÔNG bịa** câu trả lời. "Thà không rep còn hơn rep linh tinh." Bận thì có thể rep chậm, nhưng không rep ẩu/sai.
- Câu khó nên hỏi **ngay** (kể cả tối) để ca sau có người rep — đừng để đến sáng hôm sau/học xong mới hỏi (khách chờ lâu; Shopee rep muộn bị phạt).
- **Xin SĐT 1–2 lần thôi**, không hỏi 3 câu liên tục (khách thấy spam, khó chịu).
- Câu đã được duyệt thì **lưu lên Pancake** để lần sau dùng lại.

**Khách khó chịu / khó tính** → chuyển sang **gọi điện**, không nhắn tin nữa. Trình tự: **(1) xin lỗi → (2) giải thích (nếu có lý do phù hợp) → (3) đưa giải pháp**. Khi mình sai (ví dụ miss lịch bảo trì): phải có **phương án xoa dịu**, không chỉ giải thích suông.

**Khách để lại SĐT / khách tiềm năng**: đổi style chat — câu trả lời bằng chữ **ngắn gọn 1–2 dòng**, gửi ảnh riêng; câu giá & thông tin ban đầu cứ gửi bình thường. Chăm kỹ, trả lời cẩn thận.

**Khách gọi nhỡ hotline / messenger**: gọi lại ngay như tổng đài, hỏi khách cần hỗ trợ gì, ghi nhận thông tin. Mẫu câu khi khách ngại để SĐT: *"Dạ chị ơi, em có gọi lại cho chị mà chị chưa tiện nghe máy, chị cần hỗ trợ gì chị cứ nhắn em ạ. Nếu chị cần hỗ trợ gấp thì chị để lại số điện thoại để bên em hỗ trợ nhanh nhất ạ."* ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486303373203341362))

---

## 5. Kịch bản xử lý từ chối / thắc mắc khó

### Khách xin giảm giá / "không lấy quà có được trừ tiền không" (POU — CTD50/CTS20)
Tag `/quatangPOU`. Ý chính: GE là thương hiệu cao cấp toàn cầu, quy định giá niêm yết nghiêm ngặt để bảo vệ giá trị thương hiệu → đại diện hãng tại VN **không can thiệp giảm giá máy**. Quà tặng là do **đơn vị bán hàng/hãng tại VN tự cân đối ngân sách** tặng thêm, **không ảnh hưởng giá hãng**. Nếu khách không nhận quà, **giá máy vẫn giữ nguyên**. Trình bày như "sự chăm sóc thêm". ([mẫu câu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1486186321423892560))

### Khách so sánh giá / xin chiết khấu lọc tổng (POE — nhà thầu, "hãng khác giảm nhiều")
Tách 3 câu, wording lại tự nhiên ([mẫu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1534783626367995914)):
1. Thừa nhận đúng là các hãng khác có giảm giá nhiều để chốt khách.
2. Triết lý kinh doanh GE khác: hệ thống lọc tổng **bán đúng giá hãng, không giảm giá và cũng không nâng giá rồi giảm** (giữ giá trị thương hiệu + chất lượng dịch vụ/bảo hành/bảo trì lâu dài).
3. Thay vào đó hỗ trợ khách bằng **chi phí lắp đặt, vận chuyển, giảm giá máy lọc nước uống mua kèm**.

### Khách hỏi máy ion kiềm / Hydrogen
Dùng script G+ Mineral (mục 2, tag `/ionkiem` `/GMineral`).

### Khách hỏi bán sỉ / đại lý / CTV / chính sách chiết khấu
Bên mình **không bán sỉ, không phát triển nhà phân phối** qua kênh chat. Ẩn comment (nếu là comment), inbox xin **SĐT + thông tin đơn vị**, chuyển **bộ phận kinh doanh** liên hệ lại. Đánh dấu không tiềm năng nếu chỉ hỏi lơ mơ.

### Ngôn từ nên tránh
- **Không dùng "khuyến khích"** (mình không ở địa vị khuyến khích khách) → dùng **"khuyến nghị"** / **"tư vấn"**.
- Với khách nhắn kiểu ít quan tâm/ít khả năng mua: vẫn **nhắn lịch sự**, gửi giá + thông tin, không phán xét.

---

## 6. Quy trình chốt đơn & lên đơn

Khi khách chốt mua máy ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1484404527569436813)):
1. **Xác nhận đơn**: `/datcoc` — chỉnh số tiền đơn hàng, tiền đặt cọc, số còn phải thanh toán cho đúng.
2. **Gửi số tài khoản**: `/thanhtoan`.
3. Khách cọc xong đẩy **bill giao dịch** vào nhóm **thu-tiền-khách-hàng**, note: `Tên khách – Địa chỉ – Tên sản phẩm – Giá bán – tình trạng cọc/thanh toán`.
4. Đẩy đơn lên **file Google Sheet đơn hàng** (sheet "Đơn hàng lọc nước uống").
5. Ghi vào **bảng tổng hợp đơn chốt** kèm **nguồn** khách đến (FB ADS_DINO / ADS_GWT / Hannah / Shopee / hotline…).

**Nội dung chuyển khoản** hướng dẫn khách (đừng viết tắt "ND"):
`[Họ tên khách hàng] [dấu cách] [Số điện thoại] [dấu cách] [Mã sản phẩm hoặc Số hợp đồng]`

**Đặt cọc**: POU nội thành thường **cọc 1.000.000đ**, kỹ thuật lắp xong khách thanh toán nốt. Kênh Hannah có mục cọc 1tr riêng.

**Máy backup**: khi gửi máy backup cho khách phải **nói rõ đây là máy dùng backup**, không để khách hiểu nhầm là máy mới.

---

## 7. Quy trình lắp đặt & giao hàng

**Trình tự chuẩn (HN/HCM)**: đặt cọc → xác nhận đơn → lên đơn → chuyển hàng → lắp đặt → thanh toán (hoặc thanh toán trước → lắp đặt). Xin **hình ảnh vị trí lắp đặt** trước (bồn rửa: đủ đường nước cấp, nước thải, ổ điện chưa). Nếu kỹ thuật đến mà chưa lắp được (vị trí chưa hoàn thiện) → **phát sinh phí 500k**.

**Khách tỉnh (ngoài HN/HCM)**: khi lên đơn **điền số còn phải thanh toán = COD** — vì kỹ thuật tỉnh là freelancer, không tin tưởng lắp xong thu tiền được.

**Khi khách báo nhận máy** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486625307158122598)):
1. Xin khách **1 số khung giờ trống T2–T6 (giờ hành chính)** để check lịch kỹ thuật.
2. Xác nhận được lịch → hẹn chính xác **ngày/giờ** báo khách.
3. Luôn dặn: *"Khi nào anh/chị nhận được hàng nhờ nhắn lại để em sắp xếp lịch kỹ thuật"* (app tracking của đơn vị vận chuyển có thể cập nhật sai/chậm).

**Hình thức xuất hàng** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1485862486585643190)):
- Lấy tại kho (nội bộ về kho phụ / đối tác-đại lý đến lấy / đơn nội thành HN đặt ship).
- Dịch vụ vận chuyển **Viettel Post** cho đơn đi tỉnh.
- **Đóng gói** (màng co + màng xốp) khi chuyển đi xa/đi tỉnh để thùng máy không bị át; lấy máy tại kho thì tùy trường hợp.

**Shopee**:
- Giao **theo điều phối của Shopee**, bên mình không can thiệp/không tự giao trong ngày được.
- Mua qua Shopee → **phụ phí lắp đặt 500k**.
- **Lên đơn trước 11h sáng** để kho đóng hàng kịp (Shopee đến lấy 1 lần/ngày ~ trưa). Trễ chuyến → chờ ngày làm việc sau, giao muộn bị **phạt**.
- Phải là người **trả lời tin cuối cùng** mọi hội thoại Shopee (kể cả tin quảng cáo/spam), nếu không bị đánh giá phản hồi muộn và phạt.

**Lọc tổng — chuẩn bị đường ống trước khi lắp** (gửi khách biên bản xác nhận, [mẫu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1527178636212572172)): nước máy đạt QCVN 01-1:2024/BYT; áp lực bơm cấp 0,15–0,4 MPa; điện 220V/50Hz; mặt bằng tối thiểu ~400×1400×1500 mm; đường điện dây 2,5mm; đường thoát nước thải cùng mặt bằng; bơm ly tâm Q=2 m³/h tại H=37m; phao báo cạn/đầy; van bypass. Khách gửi **sơ đồ nguyên lý & mặt bằng cấp thoát nước** + ảnh thực tế qua nhóm Zalo. (Xem thêm Loom quy trình khảo sát lắp đặt POE ở mục 13.)

---

## 8. CSKH & sau bán

### Thay lõi
- Chỉ thay khi **đèn "filter" báo đỏ**. Sau khi nháy đỏ máy **còn dùng được 15–20 ngày** → báo khách yên tâm dùng đến khi nhận lõi.
- Quy trình khi khách cần lõi: xác nhận sắp đến hạn thay → báo còn dùng 15–20 ngày → **báo giá lõi, xin địa chỉ gửi lõi** → khách OK thì báo nhóm xử lý (xuất kho, lên đơn, thu trước hoặc COD). Lõi gửi qua Viettel Post. (File giá lõi ở mục 13.)
- Thay lõi xong: **reset + xả lõi 2–3 lần** như lúc mới mua.

### Bảo hành
- Kích hoạt bảo hành: tag `/kichhoatbh`; cần **SĐT + địa chỉ** khách; CSKH kích hoạt (thường xử lý ngày làm việc).
- Link quản lý bảo hành/ticket: `https://cs-admin.gwt.vn` (đăng nhập tài khoản nội bộ do quản lý cấp).

### Bảo trì
- **4 lần bảo trì miễn phí trong năm đầu** (áp dụng cả POE và POU tương ứng).
- Trả lời lịch bảo trì tiếp theo bằng **tháng / tuần dự kiến**, **không hẹn ngày chính xác** (tùy lịch khách + lịch kỹ thuật).
- Nếu công ty **miss lịch bảo trì** của khách: không nói "nếu chị muốn bảo trì luôn"; nói *"để em báo CSKH check thời gian bảo trì và sắp xếp kỹ thuật, có thông tin em báo lại chị"* + xoa dịu vì lỗi ở mình.

### Lỗi máy
- **Mọi báo lỗi**: xin **video hiện trạng + ảnh màn hình hiển thị**, gửi vào **nhóm kỹ thuật / bảo hành POE hoặc POU**, tag anh Như / Bình / Linh. (Gửi mỗi ảnh, kỹ thuật không biết máy đang gặp gì.)
- **Trong khi chờ kỹ thuật KHÔNG để khách đợi im lặng** — nhắn *"đã chuyển thông tin tới bộ phận kỹ thuật để hỗ trợ"*.
- Lỗi thường gặp: **C5** thường do khách **ấn nhầm reset lõi** (không phải lỗi thật) — vẫn báo nhóm bảo hành POU xác nhận. E4 → chuyển kỹ thuật.
- Máy CTS20 kêu to nhưng không báo đỏ / vòi báo đỏ → nhờ khách quay video **thân máy** để xem lõi nào cần thay.

### Muối hết (lọc tổng)
Ship muối cho khách: hỏi số bao, báo giá 412.500đ/bao 25kg (chưa gồm ship), không ép số lượng; báo nhóm kho lên đơn + nhóm sales POE.

### Hướng dẫn sử dụng
- **100%** khách mua **CTD50 bản bình chứa** phải được gửi HDSD tag `/ctd50hdsd` (mục 57) khi chốt/nhận hàng; gửi xong **đánh dấu/note** trên Pancake để không sót.
- Video HDSD & thay lõi: kênh YouTube `@MaylocnuocGE` và Drive folder Video (mục 13).

---

## 9. Phân loại & đánh dấu khách trên Pancake

Cập nhật ở **cột bên phải** (Hotness / Trạng thái / Phân loại / Nguồn / Ghi chú):

| Tình huống khách | Cách đánh dấu |
|---|---|
| **Chưa có dữ liệu đánh giá** | **KHÔNG** tự đánh "tiềm năng" — để quản lý check khách đã gọi chưa |
| **Không tiềm năng** (báo đắt/nhiều tiền quá, nước giếng khoan, nick clone, avatar bác lớn tuổi nông thôn, đối thủ dò hỏi) | Hotness = **Cold – Không quan tâm**; Trạng thái = **Không quan tâm** (đỏ) |
| **Đã mua POU** | Hotness = **Đã mua POU**; Trạng thái = **Quan tâm POU**; Phân loại = **Đã mua POU**; Nguồn = kênh mua (vd Shopee) |
| Ghi chú thông tin khách để lại | Vào **Sửa thông tin → dòng Ghi chú → Lưu** (để quản lý nắm nhanh) |

**Nguồn ads** (điền cột nguồn): `ADS_DINO` (video anh Dino), `ADS_GWT` (video anh Như + 1 bạn nữ). Ad id: copy ở phần dưới ads hiển thị trong Pancake. Khách xem 2–3 video thì note cả mấy nguồn. (Sheet hướng dẫn xem nguồn ads ở mục 13.)

**Khi khách để lại SĐT**: báo **ngay** vào nhóm phù hợp — **lọc tổng → nhóm POE**, **lọc nước uống → nhóm POU** — kèm **tên FB/Zalo + SĐT** (để CSKH search lại tin nhắn cũ). Không nhắn vào nhóm trao đổi nhanh (dễ trôi tin). Đơn/quà thiếu hoặc lên đơn → nhóm xử lý đơn POE/POU.

**Kết bạn Zalo**: **đổi lời chào** (không để lời nhắn auto), tin đầu tự giới thiệu ("Em chào anh…, em liên hệ từ máy lọc nước GE, em xin phép gửi anh thông tin…"), rồi **tạo contact trên CRM**.

**Ẩn comment**: khách comment kém chất lượng / hỏi đại lý → **ẩn comment**, chuyển inbox.

---

## 10. Báo cáo cuối ca & phối hợp nhóm

**Báo cáo cuối ca** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1485486379332010004)):
1. Số tin nhắn trong ca (xem Pancake).
2. Số khách để lại SĐT — đánh giá tiềm năng/không.
3. Số khách chat (không SĐT) nhưng tiềm năng (có hỏi & quan tâm sản phẩm, không chỉ hỏi giá).
4. Lưu ý gì / bị sai gì.
5. Số cuộc gọi hotline — ai tiềm năng, ai gọi nhầm.

**Đầu ca sáng**: check lại cả những tin đã bị **mark read** của ca trước (có thể là **bot** trả lời) để không sót khách.

**Kiểm tra sót tin**: dùng bộ lọc "đã đọc chưa trả lời" trên Pancake. Sót khách nhiều lần → trừ vào thưởng đơn hàng.

**Phối hợp nhóm** (tham khảo): nhóm **sales POU / sales POE** (tư vấn), nhóm **xử lý đơn POU/POE** (lên đơn, đơn/quà thiếu), nhóm **bảo hành/bảo trì POU/POE**, nhóm **kỹ thuật**, nhóm **thu-tiền-khách-hàng**, nhóm **duyệt chi phí**. Câu khó về kỹ thuật/giải pháp → tag anh Như / Bình / Linh (POE) hoặc anh Donald.

---

## 11. QA / training cho chatbot AI

Công ty xây **AI Agent / chatbot** trả lời khách; sales góp dữ liệu Q&A.

**Format lưu Q&A** (để hệ thống chỉ lưu đúng cặp):
- Mỗi câu hỏi bắt đầu bằng `Q:` và câu trả lời bằng `A:` (reply đúng câu Q tương ứng).
- **Câu hỏi**: paste **nguyên văn khách hỏi**, kể cả sai chính tả.
- **Câu trả lời**: dùng bản đã **chỉnh sửa hoàn thiện chính tả**, đã được anh/chị duyệt (thường qua ChatGPT viết lại cho mượt).
- Câu **ít ai hỏi / ngoài phạm vi sản phẩm** (vd vòi sen, khảo sát của lọc tổng gửi nhầm cho lọc uống) → **không** cho AI học.

**Task training AI Agent mỗi ca** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1489552442591809587)):
1. Với câu khó cần hỏi anh/chị để trả lời khách: **hỏi agent trước khi dạy** (xem nó trả lời sao) → đưa câu đã được ChatGPT viết lại vào mục **Huấn luyện** → **hỏi lại agent sau khi dạy** → gửi ảnh **trước & sau** vào nhóm CRM-info.
2. **Chat với agent 3 session/ca** dựa trên kịch bản thật của khách (Zalo thường nhiều tình huống hơn Facebook) → mở đầu tự xưng tên (Ánh/Mai…) để quản lý biết → gửi ảnh báo cáo 3 session khi kết ca.

Dữ liệu Q&A lưu ở **QA Master Dataset** (Google Sheet) và Drive folder (mục 13).

---

## 12. Quy định & lưu ý chung

**Nên:**
- Chủ động kiểm tra tin nhắn tất cả nền tảng (Pancake gộp được nhiều page; nếu Pancake lỗi → mở trực tiếp Messenger / Business Suite / web bán hàng Shopee / Zalo OA trên Chrome để chat).
- Bật **thông báo (notification)** để không sót khách.
- Có khách để lại SĐT → **gọi cho khách + update contact** cho quản lý (trừ khi khách rất tiềm năng thì để quản lý gọi).
- Câu trả lời đã duyệt → lưu lên Pancake để tái sử dụng.
- Ghi **kế hoạch làm việc cá nhân** (template ở mục 13), note các task được giao vào nhóm cá nhân để quản lý pin.

**Không nên:**
- **Không bịa** câu trả lời; không rep ẩu/linh tinh; không thấy câu giống là copy tin có sẵn.
- **Không nhầm lọc tổng ↔ lọc nước uống** — check kỹ khách quan tâm gì.
- Không hỏi xin SĐT 3 câu liên tục.
- Không dùng từ "khuyến khích".
- Không viết tắt (ví dụ "ND" cho nội dung).
- Không để lời chào Zalo auto khi kết bạn.
- Không gửi link Shopee trong tin tư vấn (để khách mua thẳng qua Pancake) — theo chỉ đạo từng thời điểm.
- Không ép khách lấy nhiều muối / không hẹn ngày bảo trì chính xác.
- Khi gửi nhầm tin → **xin lỗi khách**, gửi lại đúng thông tin.
- Kiểm tra kỹ **ảnh trước khi gửi** (đúng model, đúng chương trình; lọc tổng không có ảnh khuyến mãi).

**Ràng buộc kỹ thuật khi tư vấn:**
- Máy để bàn dùng nước máy; CTS20 cần áp lực ≥ 0.1 mPa.
- Lọc tổng cho nước máy đô thị; nước giếng khoan cần đánh giá riêng.
- Showroom: **Liễu Giai là office, không phải showroom**; máy CTD50 có ở đại lý Việt Hưng (báo trước để đại lý sắp xếp); Bạch Mai không có máy.

---

## 13. Tài nguyên nội bộ

> Đây là link tài nguyên làm việc (Google Docs/Sheets, Loom, Drive, YouTube). Tài khoản đăng nhập dùng **tài khoản nội bộ do quản lý cấp** — không lưu mật khẩu ở đây.

**Google Sheet:**
- Đơn hàng lọc nước uống: `https://docs.google.com/spreadsheets/d/14eRHq0X6BPptECVVIafAYJ5VuzMSN8z6wQ6a04126aA/edit`
- File giá lõi: `https://docs.google.com/spreadsheets/d/1R7hV86EW4nUaAQb6Eerz4C_QNKXgEeY6_Ev9h7Tn8M0/edit`
- Bảng tổng hợp đơn chốt + video ads: `https://docs.google.com/spreadsheets/d/1VcTO2m96lXV13YwAst2BHNw0RotCgFqQduMlkeANEQU/edit`
- QA Master Dataset (Q&A cho chatbot; có quy tắc quick replies): `https://docs.google.com/spreadsheets/d/14q5DK4Eg4wC_iIfbV9KObx2RF1qqVjuHXFAwhLR3hes/edit`
- Chương trình khuyến mãi định kỳ: `https://docs.google.com/spreadsheets/d/16WIcVvkxZO26kqN7sjoPa7GQCkhkSiHVU136ctP54Rg/edit`
- Hướng dẫn xem nguồn ads / xử lý đơn hàng Pancake: `https://docs.google.com/spreadsheets/d/1QkOzGyJ7DiohX-_4YxXw4ruVtPl03_Agjpqy208lCa4/edit`
- Template kế hoạch làm việc cá nhân: `https://docs.google.com/spreadsheets/d/1cLjW6u01wWqJdazPRPvt3IsaTphEwU_uXUQugyX_vHg/edit`

**Google Doc:**
- Kịch bản nghe hotline: `https://docs.google.com/document/d/1HWa-8z5LauSUlmRvmq8iGlmWDeMvZxiqVPAkuBsjPJ8/edit`
- Hướng dẫn xin duyệt chi phí: `https://docs.google.com/document/d/1K2C1m7M2LSxSeIWkMtFTZ3BzECxKc9CFi8Ftdp9Hegc/edit`

**Loom (video hướng dẫn):**
- Hướng dẫn trả lời Pancake: `https://www.loom.com/share/4571db0de61c4a5c9e3a9c057c64326f`
- Quy trình tư vấn/khảo sát/lắp đặt POE — Phần 1: `https://www.loom.com/share/02f5b4e56dad42e4a52a7897fed76033` · Phần 2: `https://www.loom.com/share/5a98134c75484afbb34caa47573f4ded`
- Hướng dẫn nghe hotline: `https://www.loom.com/share/97f31558fe9a476088dea37e0d43e18e`
- Theo dõi đơn hàng lọc tổng: `https://www.loom.com/share/95f306de381047ca8f5f61473e8519e1`
- Biên bản xác nhận: `https://www.loom.com/share/c1e30a208dae4da285a38800be6b2314`
- Note chi phí kiểm định nước (hạch toán Misa): `https://www.loom.com/share/bf26a741e23f40e18933bbfda502702f`

**Drive / YouTube:**
- Folder QA training AI Agent: `https://drive.google.com/drive/folders/1WPDDwSTiSCnzCmE3mnG15RmMJ-WZH2eh`
- Folder video các máy: `https://drive.google.com/drive/folders/1YbsG82kz4Mm_w1f-RmdSxgN798sLrcdV`
- Folder plan cá nhân: `https://drive.google.com/drive/folders/1MJF4omZEUOR3iHlKQuoM5iDY6iNRfaDk`
- YouTube HDSD (CTD50, CTS20, CTS10): `https://www.youtube.com/@MaylocnuocGE`

**Hệ thống:** Link bảo hành/kích hoạt/ticket CSKH: `https://cs-admin.gwt.vn`

**Hotline / Zalo gửi khách** *(số của công ty, được phép gửi khách):*
- Hotline chung: **1900 3363**
- Hotline bán hàng GE Water Business: **099 333 8989**
- Hotline CSKH GE Water Care: **0339 946 388**

---

## 14. Cần bổ sung / kiểm chứng

Các điểm transcript mập mờ / mâu thuẫn / thiếu — người phụ trách rà lại trước khi ban hành:

1. **Giá & chương trình khuyến mãi thay đổi liên tục theo tháng** — trong transcript có nhiều mốc: quà tặng 6tr, "5/4 back về giảm 15% còn CTD50 16.957.500đ / CTS20 33.957.500đ" (có chỗ ghi CTD50 là 16.975.500đ — lệch số, cần xác nhận), CTS10 giảm 10% tặng 1 bình gas 1.200.000đ, vòi sen giảm 25% từ 1.950.000đ, USH10 cọc 50% giảm 20%… **Cần chốt bảng giá + CTKM hiện hành** (nguồn chuẩn là các sheet CTKM/kênh Hannah/Shopee theo tháng) thay vì con số rời rạc ở đây.
2. ~~**USH10 & sản phẩm âm tủ bếp mới**~~ ✅ **ĐÃ CHỐT 28/08/2026:** USH10 **là máy âm tủ bếp** (không phải để bàn — bảng mục 1 trước đây ghi sai), và **sắp có hàng**. Trước khi báo tồn kho cho khách vẫn phải kiểm `wh_master`. Dòng âm tủ bếp có sparkling là **sản phẩm khác**, chưa ra mắt — đừng gộp với USH10.
3. **Thông số kỹ thuật lõi/model** chưa đầy đủ: CTS20 "mấy lá cực", GN610/GN620/DN810 khác nhau ra sao, danh mục lõi cho từng máy (PCF/NF/CFNC…) — nên có bảng lõi chuẩn từ kỹ thuật.
4. **Máy để bàn dùng nước giếng khoan**: một số câu hỏi (CTD50 lắp từ bồn nước bơm giếng khoan) chưa thấy câu trả lời chốt trong transcript.
5. **Chi tiết gói/giá bảo trì, gói bảo trì POE dài hạn**, phí lắp đặt tỉnh: rải rác, chưa có bảng thống nhất.
6. **Tên nhóm chat & phân vai** (POU/POE, kỹ thuật, thu tiền, duyệt chi phí) suy từ ngữ cảnh — cần xác nhận tên nhóm chính thức và người phụ trách từng mảng.
7. **Số hotline / Zalo**: đã giữ 3 số hotline công ty (dùng để gửi khách). Cần xác nhận đây là số chính thức hiện dùng, và số CSKH 0339 946 388 có trùng với số đăng nhập nội bộ nào không (nếu có, tách bạch để tránh nhầm).
8. **Danh sách tag Pancake** tổng hợp từ nhiều tin — có thể đã thêm/đổi tag mới hơn (`/sosanhwh2`, `/ssPOU` tách 2 tin…). Nên đối chiếu trực tiếp trên Pancake để có danh sách tag đầy đủ, cập nhật.
