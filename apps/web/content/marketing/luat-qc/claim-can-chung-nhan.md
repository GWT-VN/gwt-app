# ⚠️ Claim cần chứng nhận + nguyên tắc phát ngôn (master-agent đọc TRƯỚC khi duyệt)

> Ràng buộc BẮT BUỘC khi duyệt / đưa vào sản xuất bất kỳ
> kịch bản hay caption nào. Cùng cấp với `rules/ad-compliance-vn.md`: rule QC thắng style.
> Nguồn sự thật số liệu: Supabase project `qynpywysgltspmgnhhga`, đọc qua
> `scripts/sql/marketing_kit_products.sql` (`catalog_item` + `product_warranty` +
> `product_variant` + `v_machine_filter` + `product_bundle`).
> Cập nhật: 2026-07-17.
>
> 📌 File này TÁCH RA từ `drafts/scripts/_WARNINGS.md` (2026-07-17, vấn đề W7-1): phần
> ràng buộc pháp lý bền vững chuyển vào `rules/` để **theo repo tới mọi máy** (thư mục
> `drafts/` bị gitignore nên nội dung này từng chỉ tồn tại local). Trạng thái nháp từng
> file (gen lại file nào, thiếu data gì) vẫn ở `drafts/scripts/_WARNINGS.md`.
>
> 🔑 Mã dùng trong file này là **mã nội bộ** (`CTS10NB`/`CTS10NW`, `CTS20NG`, `CTD50NG`,
> `GTUN-8600HP-G` = USH10 cũ, `WH15A`). KHÔNG dùng mã model cũ.

---

## 0. Nguyên tắc cho master-agent
- **Số liệu phải khớp Supabase**; khi data nội bộ mâu thuẫn → KHÔNG tự chọn, phải
  để người/pháp lý chốt.
- **Sau migrate masterdata (2026-07-17)**: số liệu được phép nêu chỉ còn **bảo hành +
  lõi lọc + chu kỳ thay**. **Giá, mô tả bán, công dụng KHÔNG còn nguồn** ⇒ không nêu,
  không bịa.
- **Claim cần chứng nhận** (diệt khuẩn %, TÜV, QCVN, "độc quyền", "duy nhất") chỉ
  được phát khi có giấy tờ hợp lệ kèm (xem mục 1).

---

## 1. Claim cần CHỨNG NHẬN trước khi phát công khai
> Hiện đã được GIỮ NGOÀI voice-over/overlay để an toàn. Muốn dùng (nhất là các
> điểm bán mạnh) → pháp lý/QA xác nhận giấy tờ còn hiệu lực rồi mới thêm vào.

| Mã nội bộ | Claim | Ghi chú | Trạng thái |
|---|---|---|---|
| CTS10NB / CTS10NW | "All-in-one **duy nhất** tại VN" | Từ tuyệt đối (rule A.3/D) – cần tài liệu | Đã bỏ khỏi VO/overlay |
| CTS10NB / CTS10NW | "UVC diệt **99,999%** vi khuẩn" | Claim diệt khuẩn cần chứng nhận (B.2) | Đã bỏ % (chỉ nói "có đèn UVC") |
| CTS10NB / CTS10NW | "Đạt **QCVN 6-1:2010/BYT**" | Cần giấy hợp quy còn hiệu lực | Nêu ở mức cần xác nhận |
| CTD50NG | "Khử trùng UV **99,999%**" | Như trên | Đã bỏ % khỏi VO |
| GTUN-8600HP-G | "Chứng nhận **TÜV Rheinland** (Đức)" | **Điểm bán mạnh** – dùng được nếu có giấy | Đã giữ ngoài VO, chờ xác nhận |
| GTUN-8600HP-G | "UVC Flow diệt **99,999%**" | Cần chứng nhận | Đã bỏ % khỏi VO |
| GTUN-8600HP-G | "G+ Mineral / thiết kế lõi **độc quyền**" | "Độc quyền" nên có cơ sở (sáng chế) | Hạn chế dùng |
| WH15A | "làm mềm nước / giảm cặn vôi" mức độ cụ thể | Tránh phóng đại; có cơ sở kỹ thuật khi nêu số | Nêu ở mức cơ chế |

---

## 1b. ⛔ CẤM nêu TÊN / MÃ LÕI LỌC trong mọi nội dung marketing
> Người dùng chốt 2026-07-18. Áp cho **mọi** nội dung xuất bản: caption, kịch bản
> voice-over, text overlay, bài web/SEO, telesales, tin nhắn.

**CẤM tuyệt đối:**
- Mã lõi đầy đủ: `LX-CFNC-001-G`, `LX-CFNC-002-G`, `LX-NF700-003-G`, `LX-PCFB-003-G`
  và mọi mã cùng dạng.
- Cách gọi tắt/rút gọn: "lõi NF700", "lõi CFNC", "lõi PCFB"...

**VẪN ĐƯỢC dùng bình thường:**
- Nói **"lõi" / "lõi lọc"** chung chung, không kèm tên hay mã.
- **Chu kỳ thay** — giữ nguyên, KHÔNG bị cấm (vd "12 đến 24 tháng", "24 đến 48 tháng").
- **Số lượng lõi** (vd "một lõi", "hai lõi").

**Lý do:** mã lõi là thông tin kỹ thuật nội bộ, không có giá trị với người đọc social,
và làm caption nặng tính catalog.

⚠️ Cấm **ĐƯA TÊN VÀO NỘI DUNG**, KHÔNG cấm đọc dữ liệu. Skill vẫn query trường
`loi_loc` từ Supabase như cũ để lấy chu kỳ thay và số lượng lõi.

---

## 2. Nguyên tắc cách diễn đạt (để master-agent nhất quán khi sửa)
- **Giá:** nay không còn nguồn trong DB ⇒ kịch bản **không nêu giá dưới bất kỳ dạng nào**
  (kể cả mức "tiết kiệm / trọn gói rẻ hơn"), cho tới khi GWT chốt lại nguồn giá.
  **→ Có NGOẠI LỆ, xem mục 2b.**

### 2b. ✅ NGOẠI LỆ — SERIES CHUYÊN GIA được nêu giá
> GWT chốt **2026-07-24**. Ngoại lệ hẹp, có điều kiện — ⛔ **không suy rộng** sang loại
> nội dung khác.

**Vì sao có ngoại lệ:** lệnh cấm ở mục 2 là **rule NGUỒN DỮ LIỆU** ("giá đã bị xoá khỏi
DB, không còn nguồn"), **không phải lệnh cấm pháp lý** — căn cứ khoản 9 Điều 8 Luật QC chỉ
cấm nêu giá **SAI** so với công bố, không cấm nêu giá. Khi có nguồn giá đáng tin và được
GWT xác nhận, lý do cấm không còn.

| | Nội dung do SKILL sinh<br>(caption, social, script ngắn) | SERIES CHUYÊN GIA<br>(viết tay, review nhiều vòng) |
|---|---|---|
| Nguồn giá | ❌ không có (DB đã xoá trường) | ✅ fact-sheet SP + GWT chốt trước khi quay |
| Nêu giá | ⛔ **CẤM** | ✅ **ĐƯỢC** |

**Điều kiện bắt buộc khi series chuyên gia nêu giá:**
1. Con số phải **GWT chốt trước khi quay** — không đọc số "khoảng chừng" từ tài liệu còn
   mâu thuẫn. Chỗ chưa chốt phải gắn ⚠️ chặn quay.
2. Phải **khớp báo giá chính thức** đang áp dụng (khoản 9 Điều 8: sai lệch giá đã công bố
   = vi phạm).
3. Nêu giá theo hướng **tổng chi phí sở hữu** (giá máy + vật tư + công), ⛔ không dùng giá
   làm chiêu thúc ép ("giảm hôm nay", "chỉ còn X suất").

**Vì sao series chuyên gia CẦN nêu giá:** trục niềm tin của series là **minh bạch chi phí
5 năm** — anh Như hứa trên sóng ở tập 14, trả nợ ở tập 17 và tập 23 (trọn một tập là bảng
chi phí). Gỡ giá là gãy lời hứa xuyên 16 tập và làm tập 23 mất lý do tồn tại.

**Áp cho:** `drafts/scripts/POU-KHOI4-*` · `drafts/scripts/POE-chuyengia-*` và các series
chuyên gia viết tay sau này. ⛔ **KHÔNG áp cho** `caption-from-image-v1`, `write_script`,
hay bất kỳ nội dung nào do skill sinh tự động.
- **Mọi mã:** 8 khoáng / lọc kim loại nặng / UV chỉ mô tả **công năng kỹ thuật**,
  KHÔNG định vị y khoa ("tốt cho sức khỏe / phòng/chữa bệnh") và KHÔNG hù doạ bệnh
  tật (rule A.4, A.5, C).
- Không dùng từ tuyệt đối ("số 1/tốt nhất/duy nhất") và không so sánh đối thủ.

---

> Trạng thái nháp từng file, tình trạng thiếu data theo mã, danh sách combo POE chưa gen:
> xem `drafts/scripts/_WARNINGS.md` (local, không vào git).
