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
