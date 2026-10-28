# RULE: Yêu cầu chung cho VIDEO CHẠY ADS (mọi sản phẩm)

> RULE BẮT BUỘC cho mọi video làm ra để **chạy quảng cáo**. Áp cùng
> `rules/ad-compliance-vn.md` (luật thắng mọi rule), **`rules/nguon-dan-chung.md`
> (chuẩn nguồn cho mọi số liệu — bắt buộc)** và — nếu là lọc tổng —
> `rules/video-loc-tong.md`.
> Nguồn: yêu cầu GWT 2026-07-21 · bổ sung rule nguồn 2026-07-22.

---

## 1. Cấu trúc bắt buộc

```
[0–3s]     HOOK          — bắt người xem dừng lướt
[3–30s]    KHỐI HIGHLIGHT — nói HẾT lý do mua, dồn lên đầu
[30s → …]  NỘI DUNG CHÍNH — chiều sâu, dành cho người thật sự quan tâm
[cuối]     CTA           — lý do cụ thể để nhắn tin
```

### 1.1. HOOK — 1–3 giây
- Chỉ có **1–3 giây** để người xem quyết định dừng hay lướt. Hook phải nằm trọn
  trong khoảng đó, không có intro, không logo, không "xin chào tôi là…".
- Vào thẳng bằng: con số cụ thể · nghịch lý · hình ảnh lạ · đúng câu khách hay hỏi.

### 1.2. KHỐI HIGHLIGHT — 20–30 giây đầu
Trong 20–30 giây đầu phải nói được **hết các ý highlight chính** về sản phẩm:

| # | Nhóm ý bắt buộc |
|---|---|
| 1 | **USP** — điều làm khách chọn sản phẩm này |
| 2 | **Ưu điểm vượt trội** |
| 3 | **Công nghệ** |
| 4 | **Vật liệu lọc** |
| 5 | **Thiết kế** |
| 6 | **App / vận hành thông minh** |

→ Gộp lại phải trả lời được: **vì sao khách nên chọn mua sản phẩm này.**

**Cách sản xuất:** khối này có thể cắt highlight từ trong nội dung chính đưa lên
đầu — nhưng **nên quay riêng ngay từ đầu**, đỡ mất công cắt và nhịp gọn hơn.
Nhịp: mỗi ý ~4 giây, nói nhanh, cắt nhanh, mỗi ý một cảnh, **không dừng giải thích**.

### 1.3. NỘI DUNG CHÍNH
- Video chuyên gia **được phép dài 5–7 phút**. Khách thật sự quan tâm sẽ xem hết
  vì đây là sản phẩm giá trị cao và họ đang cần hiểu sâu hơn trước khi xuống tiền.
- Không cắt ngắn để "hợp thuật toán" — người xem hết chính là người sắp mua.
- Chiều sâu là lợi thế cạnh tranh: xem `style-notes/chuyen-gia.md`.

### 1.4. CTA
- Phải có **lý do cụ thể và ít cam kết** để khách nhắn tin (không "inbox để được
  tư vấn"). Tốt nhất: khách gửi vài thông tin đơn giản → nhận lại thứ có giá trị
  ngay (con số, đánh giá tình trạng, gợi ý phương án).
- CTA phải nối liền mạch nội dung vừa nói, không phải đoạn quảng cáo dán vào cuối.

## 2. Định dạng

- **Facebook Ads → dọc 9:16.** Không dùng TVC ngang (GWT đã xác nhận không ổn).
- Caption Facebook: 2 dòng đầu = hook thứ hai, phải chứa con số hoặc nghịch lý.

## 3. Tuyến nội dung mới phải KHÁC video cũ

Trước khi viết, **đọc bảng `video_ads`** (Supabase `GWT-Masterdata`) để biết các
tuyến đã làm. Tuyến mới bắt buộc có **điểm khác biệt và góc nhìn mới** — không lặp
lại trục kể của video cũ (vd: nếu video cũ toàn đi "tour thiết bị" thì tuyến mới
phải đổi trục).

## 4. Làm thành SERIES

- Mỗi tuyến là **một series quay liên tục nhiều tập**, không phải một tập lẻ.
- Mỗi tập độc lập (xem lẻ vẫn hiểu) nhưng có móc nối sang tập sau.
- Thiết kế để **quay gộp nhiều tập trong một buổi** (đổi áo giữa buổi).

## 4b. ⭐ MỌI SỐ LIỆU PHẢI CÓ NGUỒN CHUẨN — `rules/nguon-dan-chung.md`

Không con số nào được lên hình nếu chưa qua **quy trình 4 bước** của rule nguồn:
**liệt kê → gắn hạng A/B/C/D → xử lý → lưu hồ sơ**.

Ba điều dễ sai nhất, nhắc lại ở đây:
1. ⛔ **Nội dung do AI sinh ra là hạng C** — kể cả khi nó nằm trong tài liệu nội bộ của
   công ty. Đã có ca thật: bảng độ cứng theo tỉnh trong `[MKT] Content Research.md` sai
   **5–7 lần** so với công bố của công ty cấp nước.
2. ⛔ **Podcast/KOL là hạng C.** Nghiên cứu mà podcast **dẫn tên** mới là hạng A — phải
   đi tìm đúng nghiên cứu đó.
3. ⛔ **Không đặt cạnh nhau hai con số đo hai đại lượng khác nhau** (độ cứng theo CaCO₃
   vs magie nguyên tố vs °dH).

**Mỗi con số trên hình phải có thẻ nguồn** (tên cơ quan + năm, chữ nhỏ, hiện cùng lúc
với con số). Số đo của GWT phải kèm: *"đo tại nhà khách, tại một thời điểm"*.

## 5. ⚠️ KHÔNG dùng VIEW để đánh giá hiệu quả hay để rút rule

**View KHÔNG phải thước đo.** Lý do:
- Lượng view của video ads phụ thuộc **ngân sách bơm quảng cáo**, không phản ánh
  chất lượng nội dung.
- Một video có thể có **nhiều link**; link lưu trong bảng dữ liệu chưa chắc là link
  đang được đẩy ads → con số view gắn với link đó không nói lên điều gì.

→ Khi phân tích video cũ hoặc rút bài học: **chỉ dùng nhãn hiệu quả do GWT xác
nhận** (ra tiền / không hiệu quả / feedback thực tế), **tuyệt đối không dùng
view/lượt xem** làm bằng chứng.

**KPI thật:** số điện thoại · inbox · khách nhắc lại nội dung video khi tư vấn ·
đơn chốt.

## 6. ⛔ KHÔNG dùng ngôn từ bạo lực, tục, nhạy cảm

Áp cho **mọi lớp chữ và tiếng**: lời thoại, VO, text overlay, phụ đề, hook, caption,
tiêu đề, hashtag. Nguồn: yêu cầu GWT 2026-10-28.

**Vì sao:** Meta và TikTok tự quét chữ + tiếng trong video; dính từ bạo lực/nhạy cảm
là bị từ chối duyệt ads, bóp phân phối hoặc khoá tài khoản quảng cáo. Luật QC cũng cấm
quảng cáo trái thuần phong mỹ tục (Đ8 Luật 16/2012; số khoản chưa đối chiếu notebook).
Danh sách dưới là tổng hợp theo nhóm chính sách của nền tảng, **không phải danh sách
chính thức** (Meta/TikTok không công bố bộ từ khoá) → gặp từ lạ cùng nghĩa thì cũng tránh.

> 📋 Danh sách đầy đủ + từ thay + script rà tự động: `rules/tu-nhay-cam-nen-tang.md`
> (`python3 scripts/ra-tu-nhay-cam.py <file.md>`). Hai file phải khớp; lệch thì bản chặt hơn thắng.

### 6.1. Nhóm từ CẤM (kể cả nói ví von, đùa, viết lái)

| Nhóm | Ví dụ |
|---|---|
| Giết chóc, chết | giết, sát hại, thảm sát, tàn sát, chém, đâm, bắn, xử tử, treo cổ, chặt đầu, xác chết, tử vong, chết người, chết chóc, mạng người |
| Tình dục, xâm hại | hiếp, hiếp dâm, cưỡng hiếp, dâm, sàm sỡ, quấy rối, ấu dâm, khiêu dâm, sex, nude |
| Đánh đập, hành hạ | đánh đập, hành hạ, tra tấn, bạo hành, đấm, đá, cắt cổ, đổ máu, máu me, tàn bạo |
| Tự hại | tự tử, tự sát, nhảy lầu, cắt tay, muốn chết |
| Vũ khí, khủng bố | súng, dao găm, bom, mìn, nổ tung, khủng bố, đánh bom, ám sát |
| Tội phạm, chất cấm | ma tuý, thuốc phiện, cần sa, buôn lậu, trộm, cướp, lừa đảo (khi buộc tội người khác) |
| Thù ghét, kỳ thị | chửi vùng miền, dân tộc, tôn giáo, giới tính, ngoại hình, khuyết tật; từ miệt thị người |
| Tục tĩu | mọi từ chửi thề, viết tắt chửi (vd "vl", "vcl", "dm"), bíp nửa chừng mà vẫn đọc ra |

### 6.2. Nhóm TRÁNH: dễ dính trong video lọc nước

Không phạm luật nhưng hay bị nền tảng gắn cờ hoặc tạo cảm giác hù doạ. Thay bằng từ trung tính:

| Đừng nói | Nói thay |
|---|---|
| giết / tiêu diệt / diệt sạch vi khuẩn | loại bỏ, giữ lại, xử lý vi khuẩn |
| sát thủ thầm lặng, kẻ giết người trong nước | chất cần quan tâm trong nước |
| nước độc, đầu độc, chất độc chết người | nước có chất vượt ngưỡng (nêu chất + ngưỡng có nguồn) |
| gây ung thư, chết sớm, huỷ hoại cơ thể | không nói (dính cả rule thuốc/sức khoẻ ở `ad-compliance-vn.md`) |
| tấn công, tàn phá đường ống / thiết bị | làm đóng cặn, làm giảm tuổi thọ thiết bị |
| cuộc chiến với cặn, đánh bại clo | xử lý cặn, giảm clo dư |
| thảm hoạ, kinh hoàng, rùng mình, ám ảnh | (bỏ; dùng con số đo được thay cảm xúc) |

**Kể chuyện thảm hoạ nước** (tuyến `POE-tuyen-cauchuyen-nuoc-v1.md`): nêu sự kiện bằng
số liệu có nguồn, **không mô tả chi tiết cái chết, thương tích, hình ảnh nạn nhân**;
dùng "ảnh hưởng tới X người" thay vì "giết X người".

### 6.3. Kiểm trước khi xuất

- Rà toàn bộ transcript/phụ đề + caption theo 2 bảng trên trước khi đưa duyệt.
- Chuyên gia nói tự nhiên lỡ dùng từ cấm → **cắt hoặc thay phụ đề + tắt tiếng đoạn đó**,
  không để nguyên chỉ vì là lời nói thật.
