# USH10 — PRODUCT KNOWLEDGE DATABASE

**Máy lọc nước nóng công nghệ lọc nano GE USH10** · máy âm tủ bếp (undersink)

| | |
|---|---|
| **Phiên bản** | `v1.2` |
| **Ngày phát hành** | 19/08/2026 · **cập nhật 28/08/2026** |
| **Chủ sở hữu** | GWT — Công ty TNHH Công nghệ Nước General |
| **Mã nội bộ** | `GTUN-8600HP-G` · Model NSX: `GTUN-8600HP` |
| **Nguồn ưu tiên số 1** | HDSD chính hãng bản quốc tế **Ver.26.08.14** |
| **Số tài liệu nguồn đã hợp nhất** | 16 |
| **Trạng thái** | Dùng được ngay cho tư vấn, đào tạo, CSKH. Phần marketing phải đọc **Phần 2** trước |

---

## ⚡ ĐỌC GÌ TRƯỚC — THEO VAI TRÒ

| Bạn là | Đọc theo thứ tự này |
|---|---|
| **Sale mới** | Phần 9 (lộ trình đào tạo) → Phần 1 → Phần 2 → Phần 6 |
| **Sale đang trực** | Phần 6 (Hỏi–Đáp) + bảng cấm nói đầu Phần 6 |
| **CSKH tổng đài** | Phần 5 (Lỗi & xử lý) → Phần 3 → bảng dán A4 cuối Phần 9 |
| **Kỹ thuật lắp đặt** | Phần 4 (Safety) → Phần 5 → Phần 1 mục D |
| **Marketing / copywriter** | **Phần 2 (bắt buộc)** → Phần 7 → Phần 1 |
| **Vận hành chatbot / AI** | Phần 1 → Phần 2 (đặc biệt mục 2.3 và bộ từ khoá chặn) → Phần 6 |
| **Quản lý sản phẩm** | Phần 8 (ma trận đối chiếu nguồn + sổ mâu thuẫn mở) |

## 🚦 BA NGUYÊN TẮC GỐC — ÁP DỤNG CHO MỌI NGƯỜI, MỌI KÊNH

1. **Không bịa.** Mọi câu nói về sản phẩm phải truy được về một mã `F-xxx` trong **Phần 1**. Không có mã → không được nói.
2. **Không suy diễn.** Không ghép 2 dữ kiện để tạo dữ kiện thứ 3. Không quy đổi, không ngoại suy.
3. **Không nói y khoa.** Không nói về sức khoẻ, dinh dưỡng, bệnh tật, mẹ bầu, trẻ sơ sinh — kể cả gián tiếp, kể cả khi khách hỏi thẳng. Xem **Phần 2 · mục 2.3**.

> **Câu thoát chuẩn khi không có dữ kiện:**
> *"Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em kiểm tra rồi báo lại anh/chị."*

## 🔍 CÁCH TRA NHANH THEO MÃ

| Mã | Là gì | Nằm ở |
|---|---|---|
| `F-A01` … `F-M11` | Dữ kiện sản phẩm | **Phần 1** |
| `SF-01` … `SF-47` | Yêu cầu an toàn | **Phần 4** |
| `O-01` … `O-19` | Mâu thuẫn chưa đóng, cần GWT chốt *(O-03, O-04 đã đóng 28/08)* | **Phần 8** |
| `S1` … `S12`, `DM`, `BR`, `MD` | Mã tài liệu nguồn | **Phần 0 · mục 0.3** |
| `E1`…`E9`, `C1`, `C2`, `SA`, `EL`, `SC` | Mã hiển thị trên vòi | **Phần 5 · mục 5.1** |
| `Q1` … `Q40` | Câu hỏi khách | **Phần 6** |

---

# 📑 MỤC LỤC

**[PHẦN 0 — CHỈ DẪN SỬ DỤNG, NGUỒN DỮ LIỆU & QUY TẮC](#p0)**

- [0.1. Database này dùng để làm gì](#p0-1)
- [0.2. Mười phần của tài liệu](#p0-2)
- [0.3. Nguồn dữ liệu — mã nguồn và thứ tự ưu tiên](#p0-3)
- [0.4. Hạng tin cậy & quyền công bố](#p0-4)
- [0.5. Quy trình cập nhật](#p0-5)
- [0.6. Những gì bản v1.0 phát hiện mới so với hồ sơ 19/08/2026](#p0-6)
- [0.7. Nhật ký thay đổi](#p0-7)
- [0.8. Cảnh báo bảo mật kèm theo](#p0-8)

**[PHẦN 1 — BẢNG SỰ THẬT NGUYÊN TỬ (FACT TABLE)](#p1)**

- [A. ĐỊNH DANH SẢN PHẨM](#p1-1)
- [B. THÔNG SỐ KỸ THUẬT](#p1-2)
- [C. CẤU HÌNH LỌC](#p1-3)
- [D. SƠ ĐỒ HỆ THỐNG](#p1-4)
- [E. TÍNH NĂNG VẬN HÀNH](#p1-5)
- [F. KẾT NỐI & ỨNG DỤNG](#p1-6)
- [G. BẢO HÀNH](#p1-7)
- [H. GIÁ & CHI PHÍ](#p1-8)
- [I. CHỨNG NHẬN](#p1-9)
- [J. DANH MỤC ĐÓNG GÓI](#p1-10)
- [K. DỮ LIỆU KINH DOANH (🔵 TOÀN BỘ NỘI BỘ)](#p1-11)
- [L. SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ, KHÔNG PHẢI CÔNG BỐ CỦA HÃNG)](#p1-12)
- [M. DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ (🔴 HẠNG X)](#p1-13)

**[PHẦN 2 — QUY TẮC CLAIM — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI](#p2)**

- [0. BA NGUYÊN TẮC GỐC](#p2-1)
- [1. 🔴 DANH SÁCH ĐỎ — CẤM TUYỆT ĐỐI](#p2-2)
- [2. 🟡 DANH SÁCH VÀNG — NÓI ĐƯỢC NHƯNG PHẢI ĐÚNG CÂU CHỮ](#p2-3)
- [3. 🚨 QUY TẮC MẸ & BÉ / Y KHOA — NGHIÊM NGẶT NHẤT](#p2-4)
- [4. 🟢 DANH SÁCH XANH — ĐƯỢC NÓI THOẢI MÁI](#p2-5)
- [5. QUY TẮC RIÊNG THEO KÊNH](#p2-6)
- [6. CHECKLIST TRƯỚC KHI XUẤT BẢN](#p2-7)

**[PHẦN 3 — HƯỚNG DẪN KHÁCH HÀNG — SỬ DỤNG · VỆ SINH · THAY LÕI](#p3)**

- [1. NGÀY ĐẦU TIÊN — SAU KHI LẮP XONG](#p3-1)
- [2. DÙNG HẰNG NGÀY](#p3-2)
- [3. 4 THÓI QUEN NÊN CÓ](#p3-3)
- [4. VỆ SINH & BẢO DƯỠNG](#p3-4)
- [5. THAY LÕI LỌC](#p3-5)
- [6. KẾT NỐI ỨNG DỤNG G+ LIFE](#p3-6)
- [7. ĐI VẮNG DÀI NGÀY](#p3-7)
- [8. NHỮNG GÌ KHÁCH THƯỜNG HIỂU NHẦM](#p3-8)
- [9. SỐ CẦN NHỚ CHO KHÁCH](#p3-9)

**[PHẦN 4 — SAFETY DATABASE](#p4)**

- [1. PHÂN LOẠI MỨC RỦI RO](#p4-1)
- [2. 🔴 N1 — CẢNH BÁO AN TOÀN ĐIỆN & CHÁY NỔ](#p4-2)
- [3. 🔴 N1 — CẢNH BÁO NƯỚC & NGẬP](#p4-3)
- [4. 🟠 N2 — ĐIỀU KIỆN VẬN HÀNH BẮT BUỘC](#p4-4)
- [5. 🔴 RỦI RO BỎNG — NƯỚC 95 °C](#p4-5)
- [6. 🟠 QUY TRÌNH KHẨN CẤP](#p4-6)
- [7. 🟡 N3 — LƯU Ý DÙNG HẰNG NGÀY](#p4-7)
- [8. AN TOÀN TRONG LẮP ĐẶT (dành cho kỹ thuật)](#p4-8)
- [9. BẢNG TRA NHANH — "KHI NÀO PHẢI DỪNG MÁY NGAY"](#p4-9)
- [10. NỘI DUNG BÀN GIAO KHÁCH (checklist kỹ thuật ký nhận)](#p4-10)

**[PHẦN 5 — LỖI THƯỜNG GẶP & CÁCH XỬ LÝ](#p5)**

- [1. BẢNG MÃ HIỂN THỊ TRÊN VÒI](#p5-1)
- [2. BẢNG SỰ CỐ — HIỆN TƯỢNG → NGUYÊN NHÂN → XỬ LÝ](#p5-2)
- [3. SỰ CỐ HIỆN TRƯỜNG (không có trong HDSD)](#p5-3)
- [4. KỊCH BẢN CSKH — HỎI TRƯỚC KHI CỬ KỸ THUẬT](#p5-4)
- [5. QUY TẮC LEO THANG](#p5-5)
- [6. NHỮNG GÌ CSKH KHÔNG ĐƯỢC HƯỚNG DẪN KHÁCH TỰ LÀM](#p5-6)
- [7. MẪU GHI TICKET](#p5-7)

**[PHẦN 6 — BỘ HỎI–ĐÁP ĐÃ KIỂM CHỨNG](#p6)**

- [BẢNG CẤM NÓI — RÚT GỌN, ĐỌC TRƯỚC MỖI CA TRỰC](#p6-1)
- [NHÓM 1 — TỔNG QUAN](#p6-2)
- [NHÓM 2 — NƯỚC NÓNG](#p6-3)
- [NHÓM 3 — TIỆT TRÙNG & AN TOÀN NƯỚC](#p6-4)
- [NHÓM 4 — VÒI THÔNG MINH](#p6-5)
- [NHÓM 5 — LÕI LỌC & CHI PHÍ](#p6-6)
- [NHÓM 6 — LẮP ĐẶT & VẬN HÀNH](#p6-7)
- [NHÓM 7 — APP & KẾT NỐI](#p6-8)
- [NHÓM 8 — BẢO HÀNH & HẬU MÃI](#p6-9)
- [NHÓM 9 — CÂU HỎI KHÓ (XỬ LÝ PHẢN ĐỐI)](#p6-10)
- [NHÓM 10 — TRA NHANH CHO CSKH](#p6-11)
- [Mã hiển thị trên vòi](#p6-12)
- [Sự cố — hỏi khách trước khi cử kỹ thuật](#p6-13)
- [Thông số tra nhanh](#p6-14)
- [Phụ lục — 7 việc file này đang chờ GWT chốt](#p6-15)

**[PHẦN 7 — NGUYÊN LIỆU MARKETING ĐÃ DUYỆT NGUỒN](#p7)**

- [1. NGUYÊN TẮC BIÊN TẬP CHO USH10](#p7-1)
- [2. SÁU GÓC KỂ CHUYỆN CÓ SẴN DỮ LIỆU](#p7-2)
- [3. KHỐI NỘI DUNG ĐÃ DUYỆT — DÙNG NGUYÊN VĂN ĐƯỢC](#p7-3)
- [4. KHUNG LANDING PAGE](#p7-4)
- [5. KHUNG VIDEO (5 beat, ~3 phút)](#p7-5)
- [6. BRIEF CHO KOL / REVIEWER](#p7-6)
- [7. TỪ ĐIỂN THAY THẾ NHANH](#p7-7)
- [8. TÌNH TRẠNG TÀI SẢN MARKETING (🔵 nội bộ)](#p7-8)

**[PHẦN 8 — MA TRẬN ĐỐI CHIẾU NGUỒN & SỔ MÂU THUẪN](#p8)**

- [BẢNG CỘT NGUỒN](#p8-1)
- [BẢNG 1 — THÔNG SỐ KỸ THUẬT](#p8-2)
- [BẢNG 2 — LÕI LỌC & CHU KỲ THAY](#p8-3)
- [BẢNG 3 — TÍNH NĂNG & GIAO DIỆN VÒI](#p8-4)
- [BẢNG 4 — MÃ LỖI (kể cả mâu thuẫn NỘI BỘ trong cùng 1 tài liệu)](#p8-5)
- [BẢNG 5 — CHỨNG NHẬN & PHÁP LÝ](#p8-6)
- [BẢNG 6 — THƯƠNG MẠI & TÀI LIỆU NỘI BỘ](#p8-7)
- [BẢNG 7 — SỔ MÂU THUẪN MỞ (việc cần GWT chốt)](#p8-8)
- [Bảng ưu tiên xử lý](#p8-9)

**[PHẦN 9 — ĐÀO TẠO & KIỂM TRA](#p9)**

- [1. LỘ TRÌNH ĐÀO TẠO](#p9-1)
- [2. MƯỜI ĐIỀU PHẢI THUỘC LÒNG](#p9-2)
- [3. MƯỜI CÂU CẤM — HỌC THUỘC ĐỂ KHÔNG BUỘT MIỆNG](#p9-3)
- [4. BÀI KIỂM TRA 25 CÂU](#p9-4)
- [5. ĐÁP ÁN](#p9-5)
- [6. TÌNH HUỐNG NHẬP VAI](#p9-6)
- [7. SAI LẦM THƯỜNG GẶP CỦA NGƯỜI MỚI](#p9-7)
- [8. BẢNG DÁN TẠI BÀN CSKH (in A4)](#p9-8)

### Chỉ mục 40 câu hỏi khách hàng (Phần 6)

- [Q1. USH10 là máy gì? Đặt ở đâu?](#q1)
- [Q2. Máy chiếm bao nhiêu chỗ trong tủ bếp?](#q2)
- [Q3. Máy này lọc bằng công nghệ gì? Có phải RO không?](#q3)
- [Q4. Máy có mấy lõi lọc? Lọc qua mấy bước?](#q4)
- [Q5. Máy dùng được cho quán cà phê / văn phòng không?](#q5)
- [Q6. Máy có mấy mức nhiệt?](#q6)
- [Q7. Chọn nhiệt độ thế nào? Trẻ con bấm nhầm có sao không?](#q7)
- [Q8. Chỉnh nhiệt độ được không hay cố định?](#q8)
- [Q9. Đun được bao nhiêu nước một giờ? Chờ có lâu không?](#q9)
- [Q10. Máy có giữ nóng liên tục không? Tốn điện không?](#q10)
- [Q11. Máy có tiệt trùng không? Đặt ở đâu?](#q11)
- [Q12. Nước để lâu trong máy có bị tù không?](#q12)
- [Q13. Nước lọc rồi uống trực tiếp được không?](#q13)
- [Q14. Vòi có gì đặc biệt?](#q14)
- [Q15. Làm sao biết khi nào phải thay lõi?](#q15)
- [Q16. Bao lâu thay lõi một lần? Hết bao nhiêu tiền?](#q16)
- [Q17. Khách mở HDSD ra và hỏi: "Sao sách ghi 24–36 tháng mà anh nói 48 tháng?"](#q17)
- [Q18. Thay lõi có phải gọi thợ không?](#q18)
- [Q19. Ngoài lõi ra còn phải thay gì nữa không?](#q19)
- [Q20. Chi phí dùng máy trong 5 năm khoảng bao nhiêu?](#q20)
- [Q21. Lắp đặt mất bao lâu? Cần đục đẽo gì không?](#q21)
- [Q22. Nhà tôi áp lực nước yếu, có dùng được không?](#q22)
- [Q23. Máy có kén nguồn nước không? Nước giếng khoan được không?](#q23)
- [Q24. Máy có tốn điện không? Đi vắng có phải rút điện không?](#q24)
- [Q25. Máy có phải nối đất không?](#q25)
- [Q26. Máy kết nối điện thoại được không? Làm gì trên app?](#q26)
- [Q27. Bảo hành bao lâu?](#q27)
- [Q28. "Máy có chứng nhận gì không? Cho tôi xem giấy tờ."](#q28)
- [Q29. Máy hỏng thì bao lâu có người tới? Có sẵn lõi không?](#q29)
- [Q30. Máy dùng được bao lâu thì phải thay?](#q30)
- [Q31. "Máy này đắt quá, sao 45 triệu?"](#q31)
- [Q32. "Nano có lọc sạch bằng RO không?"](#q32)
- [Q33. "So với Karofi / Kangaroo / AO Smith thì sao?"](#q33)
- [Q34. "Tôi quên thay lõi thì sao? Có hại không?"](#q34)
- [Q35. "Sao chỉ có 2 lõi? Máy khác 7–9 lõi cơ mà."](#q35)
- [Q36. "Máy Trung Quốc gắn mác GE à?"](#q36)
- [Q37. "Nhà tôi có bé, nước này pha sữa được không?"](#q37)
- [Q38. "Máy này có làm nước kiềm / ion kiềm không?"](#q38)
- [Q39. "Máy có đo TDS không? Sao số TDS lệch với máy đo cầm tay của tôi?"](#q39)
- [Q40. "Nhà tôi ở tầng cao / vùng núi, nước 95 độ có ra đúng 95 không?"](#q40)

---

<a id="p0"></a>

# PHẦN 0 — CHỈ DẪN SỬ DỤNG, NGUỒN DỮ LIỆU & QUY TẮC


<a id="p0-1"></a>
## 0.1. Database này dùng để làm gì

| # | Mục đích | Đọc phần nào |
|---|---|---|
| 1 | Dữ liệu gốc cho **AI/nhân viên tư vấn** trả lời khách | **Phần 1** (Fact Table) → **Phần 2** (Quy tắc claim) → **Phần 6** (Hỏi–Đáp) |
| 2 | Dữ liệu **đào tạo sales / CSKH** | **Phần 9** (Đào tạo) + Phần 1, 5, 6 |
| 3 | Nguồn viết **marketing, quảng cáo, landing page, video, social** | **Phần 7** (Nguyên liệu marketing) — bắt buộc đọc **Phần 2** trước |
| 4 | **Hướng dẫn khách** sử dụng, vệ sinh, thay lõi, xử lý tình huống | **Phần 3** (HDSD) + **Phần 4** (Safety) + **Phần 5** (Sự cố) |
| 5 | **Chặn AI/nhân viên suy diễn** hoặc nói sai | **Phần 2** (Quy tắc claim) + **Phần 8** (Mâu thuẫn mở) |


<a id="p0-2"></a>
## 0.2. Mười phần của tài liệu

| Phần | Nội dung | Ai dùng |
|---|---|---|
| **0** | Bạn đang đọc. Quy tắc nguồn, hạng tin cậy, quy trình cập nhật | Tất cả |
| **1** | **Bảng sự thật nguyên tử (Fact Table)** — mỗi dòng 1 dữ kiện, có mã `F-xxx`, nguồn, hạng tin cậy, quyền công bố | Tất cả · **AI đọc phần này trước** |
| **2** | **Quy tắc claim** — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI + câu thay thế an toàn + quy tắc mẹ & bé và y khoa | Marketing, Sales, AI |
| **3** | **Hướng dẫn khách hàng** — dùng, vệ sinh, thay lõi, đi vắng, hiểu nhầm thường gặp | CSKH, khách hàng |
| **4** | **Safety Database** — cảnh báo an toàn, quy trình khẩn cấp, điều kiện lắp đặt bắt buộc | Kỹ thuật, CSKH, Sales |
| **5** | **Lỗi & xử lý** — mã lỗi, sự cố hiện trường, kịch bản hỏi khách, quy tắc leo thang | CSKH, Kỹ thuật |
| **6** | **40 câu hỏi–đáp** đã kiểm chứng, có bản ngắn và bản đầy đủ | Sales, CSKH, Chatbot |
| **7** | **Nguyên liệu marketing** — khối nội dung đã duyệt nguồn, góc kể chuyện, khung landing page/video | Marketing |
| **8** | **MA TRẬN ĐỐI CHIẾU NGUỒN** (cột = nguồn, dòng = dữ kiện bị đá nhau) + sổ mâu thuẫn mở `O-01`…`O-19` | Quản lý sản phẩm, Marketing, AI |
| **9** | **Đào tạo & kiểm tra** — lộ trình, bài kiểm tra 25 câu + đáp án, tình huống nhập vai | Đào tạo |

> 📌 **Cách đọc tham chiếu chéo:** trong toàn bộ tài liệu, ký hiệu **Phần 1**, **Phần 2**… là số hiệu phần ở bảng trên. Mã `F-xxx` truy về **Phần 1**. Mã `SF-xx` truy về **Phần 4**. Mã `O-xx` truy về **Phần 8**.


<a id="p0-3"></a>
## 0.3. Nguồn dữ liệu — mã nguồn và thứ tự ưu tiên

Mọi dữ kiện trong **Phần 1** đều **bắt buộc** có mã nguồn. Không có mã nguồn = không được đưa vào database.

| Mã | Tài liệu | Loại | Hạng |
|---|---|---|---|
| **S1** | `USH10 Manual.pdf` — HDSD chính hãng bản quốc tế, **Ver.26.08.14**, EN, 28 trang. NSX ghi trên bìa: *General Water Technology (HongKong) Co., Ltd.* + bản dịch `USH10 Manual - VI.md` | HDSD chính hãng | **A — cao nhất** |
| **S2** | HDSD bản Trung Quốc (`Manual-USH10-220V-Chinese Version`) — không có trong thư mục hiện tại, trích qua hồ sơ nội bộ | HDSD chính hãng (thị trường TQ) | **A−** (gián tiếp) |
| **S3** | `极煦系列净热一体机产品介绍.pptx` — tài liệu giới thiệu dòng sản phẩm của NSX | Tài liệu bán hàng NSX | **B** |
| **S4** | `Product Introdution USH10 + SPK25 (2).pdf` — giới thiệu giải pháp 极沁Max (USH10 + máy nước có ga SPK25) | Tài liệu bán hàng NSX | **B** |
| **S5** | `Thông tin chi tiết TUV.pdf` — bản mô tả nội dung chứng nhận TÜV Rheinland (**không phải bản scan chứng chỉ**) | Tóm tắt chứng nhận | **B** |
| **S6** | `H. Thông số kỹ thuật điều khiển điện … V1.8 · 15/05/2022` — quy cách bo mạch/logic điều khiển **cho cả họ máy** | Kỹ thuật nội bộ NSX | **C** ⛔ đóng dấu *"内部资料，不可外泄" (nội bộ, không phổ biến)* |
| **S7** | `G. Những lưu ý khi lắp đặt máy All-in-one heater · 23-3` — thông báo kỹ thuật hậu mãi của NSX | Thông báo kỹ thuật | **C** |
| **S8** | `GE UTS Hot Water Purifier (All-in-One) - Installation.pptx` — giáo trình lắp đặt | Đào tạo kỹ thuật | **C** (OCR kém, dùng hạn chế) |
| **S9** | `USH10-HO-SO-SAN-PHAM-2026-08-19.md` + `USH10-TONG-HOP-2026-08-18.md` — hồ sơ nội bộ GWT | Nội bộ GWT | **A** cho dữ liệu kinh doanh (giá, kho, bán hàng) · **D** cho thông số kỹ thuật |
| **S10** | `USH10-TINH-NANG-HOI-DAP-KHACH-HANG.md` — bộ Q&A nội bộ 19/08/2026 | Nội bộ GWT | **D** |
| **S11** | `NEW -GE 厨下净热一体售后维修培训课件-下篇.pptx` | Đào tạo sửa chữa | ❌ **Không dùng được** — OCR hỏng hoàn toàn |
| **S12** | `USH10 Spec Sheet.pdf` | Spec sheet | ❌ **Không dùng được** — file chỉ có ảnh, không có chữ |
| **S13** 🆕 | **Sơ đồ cấu tạo & sơ đồ 4 lớp lọc của NSX** (hình cắt máy + sơ đồ `第1层…第4层`, tiếng Trung) — bổ sung 20/08/2026 | Sơ đồ kỹ thuật NSX | **B** — ⚠️ sơ đồ này **không có mô-đun UVC**, thêm một dấu hiệu đây là tài liệu thị trường Trung Quốc (`O-01`) |

**Thêm 2 nguồn viết tắt dùng trong ma trận đối chiếu ở Phần 8:**

| Mã | Nguồn |
|---|---|
| **DM** | **Danh mục hàng hoá GWT — Product Filter** (PDF, 31/07/2026) — nguồn ưu tiên số 2 theo GWT |
| **BR / MD** | Brochure VN · Master Data GWT & nội dung chatbot |

### Thứ tự ưu tiên khi 2 nguồn đá nhau

```
S1 (HDSD quốc tế Ver.26.08.14)
   >  DM — Danh mục hàng hoá GWT (Product Filter, bản 31/07/2026)
   >  S2 (HDSD bản TQ)
   >  S3/S4 (tài liệu NSX)
   >  S6/S7 (kỹ thuật nội bộ)
   >  S9/S10 (master data, brochure VN, chatbot)
```

> ⚠️ **Ngoại lệ đang chờ chốt:** GWT **chưa xác nhận** máy bán tại VN đi kèm bản HDSD nào (quốc tế Ver.26.08.14 hay bản TQ). Xem **Phần 8**, mục `O-01`. Toàn bộ database này đang giả định **bản quốc tế Ver.26.08.14** là bản đi kèm máy bán tại VN.


<a id="p0-4"></a>
## 0.4. Hạng tin cậy & quyền công bố

Mỗi dữ kiện có 2 nhãn: **Hạng tin cậy** và **Quyền công bố**.

| Hạng | Nghĩa | Ví dụ |
|---|---|---|
| **A** | Ghi trong HDSD chính hãng đi kèm máy | Kích thước 467×179×477 mm |
| **B** | Ghi trong tài liệu chính hãng khác (deck NSX, mô tả chứng nhận) | IPX4, vòi xoay 120° |
| **C** | Tài liệu kỹ thuật nội bộ hoặc cấp họ máy — **có thể khác bản đang bán** | Ngưỡng đếm lõi 360/1.440 ngày |
| **D** | Tài liệu VN chưa truy được nguồn gốc (brochure, master data, chatbot) | Hộp đun inox 316 |
| **E** | **Suy luận số học của người soạn database** — không phải công bố của hãng | 6.630 L ÷ 6 L/ngày ≈ 1.105 ngày (`F-L05`) |
| **X** | Đã xác định là **SAI**, phải gỡ khỏi mọi tài liệu | Mức nhiệt 75 °C |

| Quyền công bố | Ý nghĩa |
|---|---|
| 🟢 **CÔNG BỐ** | Được nói với khách, được lên hình, lên landing page, lên video |
| 🟡 **NÓI ĐƯỢC — CÓ ĐIỀU KIỆN** | Nói được nhưng phải theo cách diễn đạt quy định ở **Phần 2** |
| 🔵 **NỘI BỘ** | Nhân viên biết để tư vấn, **không đưa lên tài liệu xuất bản**, không đọc số cho khách |
| 🔴 **CẤM** | Không được nói dưới bất kỳ hình thức nào |

### Quy tắc mặc định cho AI và nhân viên

1. **Chỉ hạng A và B được lên nội dung xuất bản.** C, D, E là kiến thức nội bộ.
2. Nếu một câu hỏi **không có dữ kiện trong Phần 1** → trả lời: *"Thông tin này em chưa có xác nhận chính thức, em kiểm tra và báo lại anh/chị."* **Tuyệt đối không suy đoán.**
3. **Không được ghép 2 dữ kiện để tạo ra dữ kiện thứ 3** (ví dụ: lấy công suất đun chia cho dung tích để suy ra thời gian). Mọi phép tính suy ra phải nằm ở hạng E và là nội bộ.
4. **Không suy diễn y khoa, dinh dưỡng, hay công dụng sức khoẻ** dưới bất kỳ hình thức nào. Xem **Phần 2**, mục 2.3.
5. Khi khách hỏi bằng chứng/giấy tờ → theo kịch bản **Phần 6 · Q28**, không hứa gửi file chưa có trong tay.


<a id="p0-5"></a>
## 0.5. Quy trình cập nhật

| Bước | Việc | Ai |
|---|---|---|
| 1 | Có dữ kiện mới (tài liệu, xác nhận từ GWT, kết quả đo thực tế) | Bất kỳ ai phát hiện |
| 2 | Ghi vào **Phần 8** nếu nó **đá** dữ kiện cũ, kèm nguồn | Người phát hiện |
| 3 | Người phụ trách sản phẩm quyết định giữ dữ kiện nào | PM sản phẩm |
| 4 | Sửa **Phần 1** — **giữ mã `F-xxx` cũ, đổi giá trị + ghi ngày đổi** | PM sản phẩm |
| 5 | Rà lan toả: Phần 2 → 3 → 5 → 6 → 7 → 9 | PM sản phẩm |
| 6 | Tăng số phiên bản, ghi vào Nhật ký thay đổi (mục 0.7) | PM sản phẩm |

> **Nguyên tắc bất di bất dịch:** thà **thiếu thông tin** còn hơn **thông tin sai**. Một câu sai đã được nhân bản qua 5 tài liệu (trường hợp mức nhiệt 75 °C) tốn nhiều công sửa hơn là để trống ngay từ đầu.


<a id="p0-6"></a>
## 0.6. Những gì bản v1.0 phát hiện mới so với hồ sơ 19/08/2026

| # | Phát hiện | Ảnh hưởng |
|---|---|---|
| **N1** | **Tìm được nguồn cho 5 claim marketing trước đây "không truy được nguồn"**: `IPX4`, `bo mạch phủ keo 100%`, `vòi xoay 120° (±60°)`, `2,8 giây`, `"Mỗi ngày tươi mới"` | Gỡ chặn 5 claim — xem Phần 1 mục 1.5 |
| **N2** | **"2,8 giây" bị hiểu sai.** Nguồn NSX ghi *"2,8 giây một cốc 100 ml nước nóng"* — đây là **tốc độ rót** (2,1 L/phút), **KHÔNG phải thời gian chờ nước nóng** | ⛔ Sửa cách diễn đạt ở mọi kịch bản |
| **N3** | **Tỷ lệ thu hồi nước: NSX ghi 69%** cho GTUN-8600HP, trong khi master data VN ghi 77% / chatbot 76,8% | ⛔ Cấm công bố mọi con số thu hồi cho tới khi GWT chốt |
| **N4** | **Số hiệu TÜV lệch:** `Thông tin chi tiết TUV.pdf` ghi **1111297087**, hồ sơ nội bộ ghi **1111279087** (đảo 2 chữ số). Tài liệu TÜV còn có **Số chứng chỉ Q 50613617 001** và **Số báo cáo CN24W0C5 001** | ✅ **ĐÃ ĐÓNG 28/08/2026** — xem `N14`, `N15` |
| **N5** | **TÜV có ghi đích danh model `GE-GTUN-8600HP`** (cùng với `GE-GEUT-50B04`) → chứng nhận **đúng là của USH10**, không phải máy khác | 🟢 Nâng hạng bằng chứng TÜV từ "chỉ là claim" lên B |
| **N6** | **Tìm được ngưỡng đếm lõi thật trong quy cách điều khiển V1.8**: lõi thô `360 ngày / 10.200 L nước vào / 6.630 L nước tinh khiết`; lõi màng (bản 700G) `1.440 ngày / 8.600 L nước tinh khiết` | Giải thích được vì sao nhãn máy ghi 8.600 L — ✅ đã chốt, xem `N16` và `F-C17` |
| **N7** | **Chế độ tiết kiệm điện là 3 giờ, không phải 2 giờ.** Cả deck NSX lẫn quy cách V1.8 đều ghi *"3 giờ không thao tác → tự vào chế độ tiết kiệm"* | ⛔ Sửa mọi tài liệu ghi "2 giờ" |
| **N8** | **"Mỗi ngày tươi mới" là có thật** — nút 每日鲜活 trong deck NSX = nút xả bình nóng ("Refresh") trong HDSD quốc tế. Cùng một nút | 🟢 Gỡ chặn claim này |
| **N9** | **Khoá trẻ em tự khoá lại sau 5 giây** không thao tác (V1.8) — chi tiết bán hàng mạnh chưa ai dùng | Bổ sung vào Phần 6 · Q7 |
| **N10** | **Có mã trạng thái `EL`** (mực nước thấp trong bình đun) chưa có trong bảng mã lỗi nào của GWT | Bổ sung Phần 5 |
| **N11** | **Nguyên nhân thật của lỗi "máy tự vào chế độ xả C1"**: nước đọng trên mặt vòi tạo mạch cảm ứng giữa 2 phím → kích hoạt xả rửa. Giải pháp: lau khô mặt vòi | Bổ sung Phần 5 — đây là lỗi hiện trường phổ biến nhất |
| **N12** | **Nhiệt độ môi trường mâu thuẫn:** HDSD 4–40 °C vs deck NSX 4–30 °C | Dùng HDSD (4–40 °C), ghi nhận mâu thuẫn |
| **N13** | **USH10 ghép được với máy nước có ga SPK25** (`GTUS-00S03`) thành giải pháp "极沁Max" — có mã đặt hàng riêng | Cơ hội bán thêm, chưa khai thác |

### Bổ sung 28/08/2026 (v1.2)

| # | Phát hiện | Ảnh hưởng |
|---|---|---|
| **N14** | **Số hiệu TÜV đúng là `1111279087`.** Tra Certipedia (S15): ID `1111279087` → **General Water Technology (Shanghai) Co., Ltd.** — đúng nhà sản xuất. ID `1111297087` trong `Thông tin chi tiết TUV.pdf` → **HP Inc., máy tính xách tay TPN-W166, test mark "Low Blue Light"** — hoàn toàn không liên quan, đây là **lỗi chép số** trong tài liệu nội bộ | ✅ Đóng `O-04`. ⛔ **Gỡ số `1111297087` khỏi mọi tài liệu** |
| **N15** | 🔴 **Nhưng trang Certipedia của ID `1111279087` hiện ghi: _"Currently no valid certificates are attached to this Certipedia ID"_** — khách tra số sẽ thấy đúng tên nhà sản xuất nhưng **không thấy chứng chỉ nào** | 🔴 **RỦI RO MỚI, NẶNG HƠN O-04 cũ.** Xem `O-18` |
| **N16** | **8.600 L và 12.240 L không mâu thuẫn** — GWT xác nhận (S14): **12.240 L = nước đầu vào**, **8.600 L = nước tinh khiết đầu ra** của lõi màng. Tỷ lệ 8.600 / 12.240 = **70,3 %** | ✅ Đóng `O-03`. Xác nhận `F-L01`, `F-L03` đúng |


<a id="p0-7"></a>
## 0.7. Nhật ký thay đổi

| Phiên bản | Ngày | Nội dung | Người soạn |
|---|---|---|---|
| `v1.0` | 19/08/2026 | Phát hành lần đầu. Hợp nhất 14 tài liệu nguồn (HDSD quốc tế Ver.26.08.14, HDSD bản TQ qua hồ sơ, 2 deck NSX, tài liệu TÜV, quy cách điều khiển V1.8, thông báo kỹ thuật 23-3, hồ sơ nội bộ GWT 18–19/08). 13 phát hiện mới (N1–N13) | — |
| `v1.1` | 20/08/2026 | **Bổ sung nguồn `S13`** — sơ đồ cấu tạo & sơ đồ 4 lớp lọc của NSX. **Sửa `F-C03`, `F-C05`; thêm `F-C28`–`F-C31`.** Nội dung sửa: **thứ tự 4 lớp lọc** — thanh carbon nằm **SAU** màng nano, không phải trước (v1.0 ghi sai); phát hiện **nước đi qua lõi dưới 2 lần**. Ghi nhận sơ đồ NSX **không có mô-đun UVC** → thêm bằng chứng cho `O-01` | — |
| `v1.2` | **28/08/2026** | **Đóng 2 mâu thuẫn, mở 2 mã mới.** ① `O-03` **ĐÓNG** — GWT xác nhận **12.240 L = nước đầu vào, 8.600 L = nước tinh khiết đầu ra** của lõi màng, không mâu thuẫn (70,3 %). Sửa `F-B06`, `F-C17`; gỡ luật *"cấm đặt 3 con số cạnh nhau"*, thay bằng luật hẹp hơn *"không trộn số lõi màng với số lõi thô"*. ② `O-04` **ĐÓNG** — tra Certipedia: `1111279087` = **General Water Technology (Shanghai)** (đúng), `1111297087` = **HP Inc.** (lỗi chép số). Sửa `F-I01`. ③ **Mở `O-18`** — chứng chỉ TÜV **không hiện trên Certipedia**, rủi ro cao hơn O-04 cũ; thêm `F-I16`. ④ **Mở `O-19`** — tỷ lệ thu hồi nước, tách khỏi `O-03` cũ. ⑤ **Mục L: GWT rà và xác nhận toàn bộ 7 suy luận đều đúng**; `F-L01`, `F-L03` tốt nghiệp lên Phần 1. ⑥ Thêm nguồn `S14` (xác nhận GWT), `S15` (Certipedia). Phát hiện mới `N14`–`N16` | — |


<a id="p0-8"></a>
## 0.8. Cảnh báo bảo mật kèm theo

Tài liệu `H. Thông số kỹ thuật điều khiển điện … V1.8` (**S6**) đóng dấu **"内部资料，不可外泄"** — *tài liệu nội bộ, không được phát tán*. Mọi dữ kiện gắn nguồn **S6** trong database này đều để **🔵 NỘI BỘ**. Không trích dẫn, không chụp màn hình, không gửi cho khách hoặc đối tác.

---

<a id="p1"></a>

# PHẦN 1 — BẢNG SỰ THẬT NGUYÊN TỬ (FACT TABLE)

> **PKB v1.2 · 28/08/2026** · Đọc kèm **Phần 0**
> **Đây là nguồn chân lý duy nhất.** Mọi câu trả lời khách, mọi dòng marketing, mọi slide đào tạo phải truy được về một mã `F-xxx` trong file này.
>
> **Cột "Công bố":** 🟢 được nói với khách · 🟡 nói được nhưng phải theo cách diễn đạt ở **Phần 2** · 🔵 nội bộ, không đưa lên tài liệu xuất bản · 🔴 cấm
> **Cột "Hạng":** A = HDSD chính hãng · B = tài liệu chính hãng khác · C = kỹ thuật nội bộ (có thể khác bản đang bán) · D = tài liệu VN chưa truy nguồn · E = suy luận số học · X = đã xác định sai

---


<a id="p1-1"></a>
## A. ĐỊNH DANH SẢN PHẨM

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-A01` | Tên thương mại VN | **Máy lọc nước GE USH10** | S9 | A | 🟢 |
| `F-A02` | Tên trên HDSD | **Máy lọc nước nóng công nghệ lọc nano GE** (GE Nanofiltration Heating Purifier) | S1 | A | 🟢 |
| `F-A03` | Model | **USH10** | S1 | A | 🟢 |
| `F-A04` | Mã nội bộ GWT | `GTUN-8600HP-G` | S9 | A | 🔵 |
| `F-A05` | Model nội địa / mã NSX | `GTUN-8600HP` | S4, S9 | A | 🔵 |
| `F-A06` | Loại máy | **Âm tủ bếp (undersink)** — thân máy giấu dưới chậu rửa, chỉ vòi lộ trên mặt bàn | S1, S4 | A | 🟢 |
| `F-A07` | Nhà sản xuất (HDSD quốc tế) | General Water Technology (HongKong) Co., Ltd. | S1 | A | 🟡 *(xem O-01)* |
| `F-A08` | Nhà sản xuất (HDSD bản TQ) | 溢泰（南京）环保科技 — Yitai Nanjing, uỷ quyền bởi 通用净水科技（上海） | S2 | A− | 🔵 |
| `F-A09` | Nhãn hiệu | *"GE is a trademark of General Electric Company and is manufactured under license"* — GE là nhãn hiệu của General Electric, sản xuất theo giấy phép | S2 | A− | 🟡 |
| `F-A10` | Phiên bản HDSD | **Ver.26.08.14** | S1 | A | 🔵 |
| `F-A11` | Mã lạ trong hệ thống | `GTUN-8600VNHP` — 2 máy đã lắp 2024, ghi chú DB *"máy Test, có lắp lẻ thực tế"* | S9 | A | 🔵 |
| `F-A12` | Ghép combo | Ghép được với máy nước có ga **SPK25** (`GTUS-00S03`) thành giải pháp **极沁Max**. Mã đặt hàng `V00000068` / `V00000069` (⚠️ mapping bình ga 0,6L/4L chưa rõ — O-14) | S4 | B | 🔵 |

---


<a id="p1-2"></a>
## B. THÔNG SỐ KỸ THUẬT

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-B01` | Kích thước (D×R×C) | **467 × 179 × 477 mm** | S1 | A | 🟢 |
| `F-B02` | Chiều rộng — con số bán hàng | **17,9 cm** — lọt gầm chậu chung cư đã bị xi phông chiếm chỗ | S1 | A | 🟢 |
| `F-B03` | Trọng lượng | ~**14 kg** (3 nguồn ghi 14 / 14,18 / 14,36 kg — O-12) | S4, BR, MD | B/D | 🟡 nói "khoảng 14 kg" |
| `F-B04` | Lưu lượng nước tinh khiết (nước thường) | **1,8 L/phút** | S1 | A | 🟢 |
| `F-B05` | Lưu lượng nước nóng | **2,1 L/phút** | S3 | B | 🟢 |
| `F-B06` | Tổng công suất lọc định mức của máy | **8.600 L** *(nước tinh khiết đầu ra — cùng ngưỡng với lõi màng, xem `F-C17`)* | S1, S14 | A | 🟡 *(⛔ không đặt cạnh 6.630 L của lõi thô — khác cấp bộ phận)* |
| `F-B07` | Công suất làm nóng | **20 L/giờ** | S1 | A | 🟢 |
| `F-B08` | Áp lực nước vào | **0,1 – 0,4 MPa** (≈ 1–4 bar) | S1 | A | 🟢 |
| `F-B09` | Áp lực làm việc | **0,4 – 0,9 MPa** | S1 | A | 🔵 |
| `F-B10` | Điện áp | **220V ~ 50Hz** | S1 | A | 🟢 |
| `F-B11` | Công suất định mức | **2.100 W** | S1 | A | 🟢 |
| `F-B12` | Mâm nhiệt | **2.000 W** | S1 | A | 🔵 |
| `F-B13` | Cấp bảo vệ chống điện giật | **Class I (Cấp I)** — bắt buộc ổ cắm có nối đất | S1 | A | 🟢 |
| `F-B14` | Nguồn nước áp dụng | **Chỉ nước máy đô thị** | S1 | A | 🟢 |
| `F-B15` | Nhiệt độ nước vào | **5 – 38 °C** | S1 | A | 🟢 |
| `F-B16` | Nhiệt độ môi trường | **4 – 40 °C** | S1 | A | 🟢 |
| `F-B17` | Tuổi thọ máy & linh kiện | **khoảng 5 – 10 năm** trong điều kiện vận hành và bảo dưỡng đúng | S1 | A | 🟡 phải kèm cụm điều kiện |
| `F-B18` | Lỗ khoan lắp vòi | **Ø30 mm**, cần mặt phẳng bán kính **3,8 cm** quanh lỗ | S1 | A | 🟢 |
| `F-B19` | Yêu cầu khoang tủ (khảo sát) | cao ≥ 550 mm, sâu ≥ 530 mm | BR | D | 🔵 dùng để khảo sát, không lên hình |
| `F-B20` | Khoảng hở quanh máy | ≥ 10 cm *(đọc từ hình deck NSX)* | S4 | B | 🔵 |
| `F-B21` | Thùng carton | 545 × 365 × 570 mm · CBM 0,1134 | MD | D | 🔵 |
| `F-B22` | Tỷ lệ thu hồi nước | ⚠️ **69%** (NSX) vs 77% (master) vs 76,8% (chatbot) vs ≥65% (V1.8) | S3/S6/MD | mâu thuẫn | 🔴 **CẤM công bố mọi con số** — **O-19** *(việc riêng, không liên quan O-03 đã đóng)* |
| `F-B23` | Hiệu suất nước | **Mức 1 (cao nhất)** theo `GB 34914-2021` | S2 | A− | 🟡 phải ghi rõ *"tiêu chuẩn Trung Quốc"* |
| `F-B24` | Tiêu chuẩn sản xuất (bản TQ) | `GB4706.1-2005` · `GB4706.19-2008` · `Q31/0112000854C015-2021-01` | S2 | A− | 🔵 |
| `F-B25` | Giấy phép vệ sinh (TQ) | `(苏)卫水字(2021)第3200-0139号` | S2 | A− | 🔵 |
| `F-B26` | Chất lượng nước ra (bản TQ) | đạt `CJ94-2005` | S2 | A− | 🔵 ⛔ không trích khi chưa có phiếu thử VN |
| `F-B27` | Thải bỏ | Ký hiệu **WEEE** — không thải cùng rác sinh hoạt trong EU | S1 | A | 🔵 |

---


<a id="p1-3"></a>
## C. CẤU HÌNH LỌC

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-C01` | Số lõi / số bước | **2 lõi — 4 bước lọc** | S1, S9 | A | 🟢 |
| `F-C02` | Kiểu máy | **Tankless** — không có bình chứa nước lọc kiểu RO truyền thống | S1 | A | 🟢 |
| `F-C03` | Lõi 1 (lõi **dưới**) — cấu tạo | Lõi composite tích hợp **Polypropylene + Sợi carbon + Carbon Block** (`一体式聚丙烯炭纤维炭棒复合滤芯`). **Chứa lớp 1, lớp 2 VÀ lớp 4** — xem `F-C28` | S1, S13 | A | 🟡 ⛔ **không đọc mã lõi** — gọi là *"lõi thô tổng hợp"* |
| `F-C04` | Lõi 1 — chức năng | Loại bỏ **cặn lắng, rỉ sét, hạt lơ lửng**; hấp phụ **clo dư và mùi khó chịu** | S1 | A | 🟢 |
| `F-C05` | Lõi 2 (lõi **trên**) — cấu tạo | Lõi composite tích hợp **màng lọc nano** (`一体式纳滤复合滤芯`). **Chứa lớp 3** | S1, S13 | A | 🟡 gọi là *"lõi màng lọc nano"* |
| `F-C06` | Lõi 2 — chức năng | Giảm **kim loại nặng** (chì, asen, cadimi), **vi khuẩn** (E. coli), **chất hữu cơ** (tricloromethane, carbon tetraclorua) — đồng thời **giữ lại khoáng chất có lợi** | S1 | A | 🟢 |
| `F-C07` | Kích thước lỗ lọc màng nano | **0,001 µm** | S9 | D | 🟡 |
| `F-C08` | Công nghệ màng | **G+荷电纳滤 — màng lọc nano tích điện**, bảng so sánh với UF (thế hệ 1.0) và RO (thế hệ 2.0) | S3 | B | 🟢 |
| `F-C09` | So sánh công nghệ (NSX) | Nano tích điện chặn được **cả kim loại nặng và cặn vôi như RO**, nhưng **giữ khoáng có lợi** (RO loại bỏ) | S3 | B | 🟡 không so sánh với thương hiệu cụ thể |
| `F-C10` | 8 khoáng giữ lại | Canxi · Magie · Natri · Kali · Kẽm · Selen · Stronti · Axit metasilicic (H₂SiO₃) | S9 | D | 🟡 **CHỈ liệt kê tên — ⛔ CẤM nói công dụng** |
| `F-C11` | Patent màng NF | **US 7138058** — tra được trên Google Patents | S9 | A | 🟢 |
| `F-C12` | Chu kỳ thay lõi thô (HDSD) | **6 ~ 12 tháng** | S1 | A | 🟡 xem `F-C14` |
| `F-C13` | Chu kỳ thay lõi màng (HDSD) | **24 ~ 36 tháng** | S1 | A | 🟡 xem `F-C15` |
| `F-C14` | Chu kỳ thay lõi thô (GWT chốt) | **12 tháng** | S9, DM | A | 🟡 nói *"chu kỳ khuyến nghị"*, ⛔ không nói *"cam kết"* |
| `F-C15` | Chu kỳ thay lõi màng (GWT chốt) | **48 tháng** | S9, DM | A | 🟡 nói *"chu kỳ khuyến nghị"*, ⛔ không nói *"bền 4 năm"* như cam kết |
| `F-C16` | Ngưỡng đếm lõi thô | **360 ngày** / **10.200 L nước vào** / **6.630 L nước tinh khiết** | S6, DM | C | 🔵 |
| `F-C17` | Ngưỡng đếm lõi màng | **1.440 ngày** · **12.240 L nước ĐẦU VÀO** · **8.600 L nước tinh khiết ĐẦU RA** — ✅ GWT xác nhận 28/08/2026: hai con số là **hai đại lượng khác nhau**, không mâu thuẫn (70,3 %) | S6, DM, **S14** | C | 🟡 *(một thông điệp — một con số; ⛔ không ghép với 6.630 L của lõi thô)* |
| `F-C18` | Nguyên tắc đếm lõi | **Điều kiện nào tới trước thì tính điều kiện đó** (thời gian **hoặc** số lít) | S6 | C | 🟡 nói được ý *"đếm cả ngày lẫn lít"*, ⛔ không đọc số |
| `F-C19` | Cách máy tính số lít | Tính theo **thời gian bơm chạy** × lưu lượng quy đổi (NF700G = 1,8 L/phút); lưu bộ nhớ mỗi 30 phút và sau mỗi lần tạo nước | S6 | C | 🔵 |
| `F-C20` | Cảnh báo tuổi thọ lõi (HDSD) | *"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ lõi… có thể ngắn hơn các chu kỳ ước tính nêu trên… **Dữ liệu trên chỉ mang tính tham khảo**."* | S1 | A | 🟢 **Đây là câu an toàn nhất để trích khi khách hỏi về tuổi thọ lõi** |
| `F-C21` | Chỉ dùng cho gia đình | HDSD ghi rõ: **không lắp ở nơi công cộng có mức tiêu thụ nước cao**; tuổi thọ lõi tính theo mức dùng hộ gia đình bình thường | S1 | A | 🟢 **Bắt buộc nói khi khách là quán/văn phòng** |
| `F-C22` | Dấu hiệu phải thay lõi | ① Chất lượng nước suy giảm, mùi vị kém · ② Lưu lượng giảm đáng kể (không do nước lạnh) · ③ Lõi tắc nghiêm trọng, không lấy được nước | S1 | A | 🟢 |
| `F-C23` | Cách phân biệt lõi nào hỏng | **Mùi vị kém** → dấu hiệu của lõi carbon sau · **Không lấy được nước** → dấu hiệu lõi bị tắc | S1 | A | 🟢 |
| `F-C24` | Lõi đã dùng | **Không thể rửa hay tái chế**. Thải như chất thải rắn sinh hoạt, giao người có chuyên môn xử lý | S1 | A | 🟢 |
| `F-C25` | Lõi không chính hãng | *"Nếu máy hư hỏng do sử dụng lõi lọc không phải chính hãng GE, **dịch vụ bảo hành sẽ không được cung cấp**"* | S1 | A | 🟢 |
| `F-C26` | Ống PE & đầu nối | Là chi tiết lão hoá — khuyến nghị thay mỗi **24 tháng**, **tính phí theo giá thị trường** | S1 | A | 🟢 **Phải nói trước khi bán để tránh khiếu nại** |
| `F-C27` | Thiết kế rút lõi | **Rút ngang** — thay lõi không phải kéo máy ra khỏi tủ | S3 | B | 🟢 |
| `F-C28` 🆕 | **Thứ tự 4 lớp lọc** *(cập nhật 20/08/2026)* | **Lớp 1 `PP`** → **Lớp 2 `Sợi carbon` (炭纤维)** → **Lớp 3 `Màng lọc nano` (进口纳滤膜)** → **Lớp 4 `Thanh carbon` (炭棒)**. ⚠️ Lớp khử mùi nằm **SAU** màng lọc, là lớp cuối cùng trước khi ra vòi | S13 | B | 🟢 |
| `F-C29` 🆕 | **Kiến trúc 2 lõi — nước đi qua lõi dưới 2 lần** | Lõi dưới chứa lớp 1, 2, 4 · Lõi trên chứa lớp 3. Nước: vào lõi dưới (PP + sợi carbon) → lên lõi trên (màng nano) → **quay lại lõi dưới** (thanh carbon) → ra vòi. Cho phép đặt lớp khử mùi ở cuối đường nước **mà không cần vỏ lõi thứ ba** | S13 | B | 🟢 |
| `F-C30` 🆕 | Chức năng từng lớp *(theo sơ đồ NSX)* | **L1:** bùn cát, rỉ sét, chất lơ lửng · **L2:** chất hữu cơ, clo dư · **L3:** kim loại nặng, vi khuẩn, **vi rút** ⚠️, clo dư còn lại, màu lạ — **cho khoáng qua** · **L4:** khử **mùi** lần cuối | S13 | B | 🟡 ⚠️ "vi rút" chỉ có ở nguồn NSX, HDSD (hạng A) chỉ ghi vi khuẩn |
| `F-C31` 🆕 | Hai đầu ra | `健康矿物质热水` — nước khoáng nóng · `常温健康矿物质水` — nước khoáng nhiệt độ phòng. **Cùng một nguồn nước đã lọc**, chỉ khác nhiệt độ | S13 | B | 🟢 |

---


<a id="p1-4"></a>
## D. SƠ ĐỒ HỆ THỐNG

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-D01` | Đường nước chính | Nước máy đô thị → van bi 3 ngã → van cấp nước vào → **bơm tăng áp** → lõi composite (tiền lọc) → **lõi màng nano** → TDS nước tinh khiết → tách 2 nhánh | S1 | A | 🟢 |
| `F-D02` | Nhánh nước thường | van nước nhiệt độ phòng → **mô-đun tiệt trùng nội tuyến** → vòi | S1 | A | 🟢 |
| `F-D03` | Nhánh nước nóng | van cấp nước bình nóng → **bình đun** → bơm ly tâm → vòi (kèm ống thông hơi) | S1 | A | 🟢 |
| `F-D04` | Nhánh xả | van xả / van điện từ xả / van một chiều → **nước cô đặc** → thoát sàn | S1 | A | 🟢 |
| `F-D05` | **Vị trí mô-đun tiệt trùng** | Lắp **nối tiếp trên đường ống nước tinh khiết** chạy từ thân máy lên vòi. Đầu vào nối cổng nước tinh khiết của máy, đầu ra nối đoạn ống **gần vòi nhất** | S1 | A | 🟢 **USP mạnh nhất — xem **Phần 7**** |
| `F-D06` | Bộ chuyển nguồn | Chuyển 220V AC → **24V/36V DC** (điện áp vận hành an toàn) | S1 | A | 🟢 |
| `F-D07` | Bơm tăng áp | Tạo áp và môi trường vận hành ổn định cho màng lọc | S1 | A | 🟢 |
| `F-D08` | Van điện từ cấp nước vào | Đóng/mở nguồn nước thô | S1 | A | 🔵 |
| `F-D09` | Van điện từ nước thải | Điều khiển xả rửa bề mặt màng + lưu lượng hệ thống | S1 | A | 🔵 |
| `F-D10` | Bo mạch điều khiển | Hiển thị trạng thái + điều khiển toàn hệ thống, DC 24V | S1 | A | 🔵 |
| `F-D11` | Cảm biến trên bo | TDS nước tinh khiết · cảm biến mực nước · NTC1 (bình đun) · NTC2 (hơi nước) · cảm biến rò rỉ · rơ-le nhiệt bảo vệ chống đun cạn | S1 | A | 🔵 |
| `F-D12` | Số mức cảm biến mực nước | **4 mức**: thấp · trung · cao · tràn | S6 | C | 🔵 |
| `F-D13` | Sai số cảm biến nhiệt | ±3 °C so với nhiệt độ cài | S6 | C | 🔵 |
| `F-D14` | Sai số hiển thị TDS | 0–10: ±2 · 10–50: ±5 · 50–100: ±10 · 100–200: ±20 · 200–300: ±30 · 300–500: ±50 | S6 | C | 🔵 **Dùng khi khách thắc mắc TDS đo lệch** |

---


<a id="p1-5"></a>
## E. TÍNH NĂNG VẬN HÀNH

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-E01` | 4 chế độ nước | **Nhiệt độ phòng · 45 °C (WARM) · 85 °C (EX WARM) · 95 °C (HOT)** | S1 | A | 🟢 |
| `F-E02` | ⛔ Mức 75 °C | **KHÔNG TỒN TẠI** — máy không có mức này | S1, S2, S3, S6, BR | **X** | 🔴 **CẤM** |
| `F-E03` | Cách đổi nhiệt độ cài sẵn | Giữ đồng thời **LOCK + nút cần đặt trong 3 giây**. Khi chọn 1 mức, 2 nút còn lại tạm vô hiệu hoá | S1 | A | 🟢 |
| `F-E04` | Cách lấy nước nóng | **2 bước**: chạm **LOCK** → chạm nút nhiệt độ | S1 | A | 🟢 |
| `F-E05` | Cách lấy nước thường | Chạm 1 nút, **không cần mở khoá** | S1 | A | 🟢 |
| `F-E06` | Khoá trẻ em — đèn báo | Đèn **tắt** = đã mở khoá · **sáng trắng** = đang khoá | S1 | A | 🟢 |
| `F-E07` | Khoá trẻ em — tự khoá lại | Tự khoá lại sau **5 giây** không thao tác, hoặc sau khi lấy nước xong | S6 | C | 🟡 nói được ý *"tự khoá lại ngay sau khi dùng"* |
| `F-E08` | Phạm vi khoá trẻ em | Khoá **chỉ chặn nước nóng**; các nút khác vẫn dùng bình thường | S6 | C | 🟡 |
| `F-E09` | Điều khiển tự động | Đóng vòi → máy tự dừng. Bề mặt màng **tự làm sạch và xả rửa theo lịch** | S1 | A | 🟢 |
| `F-E10` | Chu kỳ xả rửa tự động | Bật nguồn: xả 30 giây · **mỗi 24 giờ**: xả 30 giây · sau **>4 giờ** không tạo nước: xả không áp 15 giây | S6 | C | 🔵 |
| `F-E11` | Chức năng không đọng nước | Khi lâu không dùng, nước tinh khiết tồn trong lõi **tự động quay về lọc lại** | S1 | A | 🟢 |
| `F-E12` | Nhắc thay lõi — 2 cấp | Đèn **nháy đỏ** = sắp hết hạn (chuẩn bị lõi) → **đỏ liên tục** = phải thay | S1 | A | 🟢 |
| `F-E13` | Ngưỡng đèn nhắc lõi | Xanh/trắng: tuổi thọ < 95% · Nháy đỏ: 95% ≤ tuổi thọ < 100% · Đỏ liên tục: ≥ 100% | S6 | C | 🔵 |
| `F-E14` | Nhắc thay lõi — 3 kênh | ① đèn trên vòi · ② đèn trên thân máy · ③ **thông báo trên điện thoại** | S3 | B | 🟢 |
| `F-E15` | Mô-đun tiệt trùng — nút UV | Nút **"UV"** trên vòi. **Sáng trắng** = còn hạn · **nháy trắng** = sắp hết tuổi thọ | S1 | A | 🟢 |
| `F-E16` | Reset mô-đun tiệt trùng | Mở khoá trẻ em → giữ đồng thời **"WARM" + "UV" 3 giây** → hiện `SA` + 1 tiếng bíp | S1 | A | 🟢 |
| `F-E17` | Xả bình nước nóng ("Mỗi ngày tươi mới") | Chạm **LOCK** → chạm nút xả. Xả sạch nước tồn trong bình đun bằng 1 chạm | S1, S3 | A | 🟢 |
| `F-E18` | Thay lõi tự làm được | Xoay-và-khoá 2 bước: **thuận chiều kim đồng hồ** để lắp, **ngược chiều** để tháo. Reset bằng **giữ nút lõi 3 giây** | S1 | A | 🟢 |
| `F-E19` | Xả rửa sau thay lõi | Máy hiện **`C2`** → chạm nút nước thường → xả rửa **8 phút** | S1 | A | 🟢 |
| `F-E20` | Xả rửa lần đầu sau lắp | Máy hiện **`C1`** → chạm nút lấy nước → xả rửa **~16 phút** | S1 | A | 🟢 |
| `F-E21` | Chế độ tiết kiệm điện (ECO) | **3 giờ** không thao tác → máy tự vào chế độ **không giữ ấm**. Bấm nút để bật/tắt thủ công | S3, S6 | B/C | 🟡 ⚠️ marketing VN đang ghi "2 giờ" — O-05 |
| `F-E22` | Chế độ giữ ấm (không ECO) | Giữ nước ở nhiệt độ cài; khi nguội **quá 5 °C** so với mức cài thì tự đun lại | S6 | C | 🔵 |
| `F-E23` | Học điểm sôi theo vùng | Máy **tự học điểm sôi địa phương**. Nếu nhiệt độ cài cao hơn điểm sôi tại chỗ, máy tự hạ về **điểm sôi − 2 °C** | S6 | C | 🔵 **Giải thích được vì sao 95 °C ở vùng cao hiển thị thấp hơn** |
| `F-E24` | Hiển thị nhiệt độ | Màn hình vòi hiện **nhiệt độ nước nóng theo thời gian thực**. **Nháy** = đang gia nhiệt · **tắt** = không gia nhiệt | S1 | A | 🟢 |
| `F-E25` | Đèn trên thân máy | Status: xanh = đang lọc / nháy chậm = đang xả rửa · NF & PCFB: xanh = bình thường, nháy đỏ = sắp hết, đỏ = phải thay · WiFi: xanh = đã kết nối, nháy chậm = chưa kết nối | S1 | A | 🟢 |
| `F-E26` | Vòi xoay | **120° (±60°)**, thân vòi tròn cho phép xoay nhiều góc | S4 | B | 🟢 |
| `F-E27` | Chuẩn chống nước vòi | **IPX4** | S3 | B | 🟢 |
| `F-E28` | Bo mạch vòi | **Phủ keo 100%** (灌胶), chống nước | S3 | B | 🟢 |
| `F-E29` | Công nghệ mặt hiển thị | **IMD (in-mould decoration)** — hiển thị rõ hơn, chống mài mòn tốt hơn | S3 | B | 🟢 |
| `F-E30` | Tốc độ rót | **100 ml nước nóng ≈ 2,8 giây** · **100 ml nước thường ≈ 3,3 giây** | S3 | B | 🟡 ⛔ **KHÔNG được diễn đạt thành "nước nóng ra sau 2,8 giây"** — O-06 |
| `F-E31` | Màu vòi | **Đen** (`USH10-FAUCET-DEN`) và **Bạc** (`USH10-FAUCET-BAC`) | S9 | A | 🟢 |
| `F-E32` | Khôi phục cài đặt gốc | Giữ **ECO + nước thường 10 giây** → hiện `SC` + 1 tiếng bíp | S6 | C | 🔴 **CẤM hướng dẫn khách tự làm** — chỉ kỹ thuật viên |
| `F-E33` | Cảm biến nhiệt Seiko | ❌ **KHÔNG CÓ NGUỒN** trong bất kỳ tài liệu nào | — | — | 🔴 **CẤM** — O-11 |
| `F-E34` | Hộp đun 1,8 L inox 316 chân không 2 lớp | ❌ **KHÔNG CÓ NGUỒN** — HDSD chỉ ghi "Hot Tank", không mô tả vật liệu hay dung tích | — | — | 🔴 **CẤM** — O-11 |

---


<a id="p1-6"></a>
## F. KẾT NỐI & ỨNG DỤNG

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-F01` | Công nghệ kết nối | IoT **Wifi-Combo** (Bluetooth ghép nối + Wi-Fi nhà) | S1 | A | 🟢 |
| `F-F02` | Tên ứng dụng | **G+ Life APP** | S1 | A | 🟢 |
| `F-F03` | Quy trình ghép nối (7 bước) | ① bật Bluetooth + kết nối Wi-Fi nhà → ② quét QR trên máy tải app → ③ đăng ký bằng SĐT + mã xác minh → ④ bấm "Add Device" → ⑤ **giữ nút trên máy 3 giây** vào chế độ ghép nối → ⑥ nhập mật khẩu Wi-Fi → ⑦ bấm "Getting Started" | S1 | A | 🟢 |
| `F-F04` | Đèn Wi-Fi trên máy | Sáng liên tục = đã kết nối · Nháy nhanh (2 lần/giây) = đang ghép nối · Nháy chậm (1 lần/2 giây) = chưa kết nối / ghép nối thất bại | S1, S6 | A/C | 🟢 |
| `F-F05` | Ghép nối lại | Giữ nút Wi-Fi **3 giây** để huỷ liên kết và ghép nối lại | S6 | C | 🟡 |
| `F-F06` | Sau khi ghép nối thất bại | Nháy chậm **3 phút** rồi tắt | S6 | C | 🔵 |
| `F-F07` | Chức năng theo dõi từ xa | Giám sát tuổi thọ lõi theo **%** (ví dụ hiển thị 99% / 90% từng cấp lõi), giám sát chất lượng nước, điều khiển từ xa | S3 | B | 🟢 |
| `F-F08` | Hẹn giờ đun | Nhận lệnh hẹn giờ từ app; máy bắt đầu đun **trước giờ hẹn 5 phút** nếu nước đang nguội hơn mức cài | S6 | C | 🟡 nói được tính năng, ⛔ không đọc chi tiết "5 phút" |
| `F-F09` | Cảnh báo rò rỉ qua app | Có | S9 | D | 🟡 |

---


<a id="p1-7"></a>
## G. BẢO HÀNH

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-G01` | Bảo hành toàn máy | **12 tháng**, tính từ ngày hoá đơn / ngày lắp đặt / chứng từ hợp pháp | S1 | A | 🟢 |
| `F-G02` | Bảo hành bơm + bo mạch | **5 năm** — chính sách riêng GWT | S9 | D | 🟡 ⚠️ **không có trong HDSD hãng** — O-10. ⛔ Không hứa miệng, chuyển phòng KD nếu khách đòi văn bản |
| `F-G03` | ⛔ Bộ phận KHÔNG bảo hành | ① **Vật liệu lọc** · ② **Đèn diệt khuẩn tia cực tím** · ③ Chi tiết hao mòn (vòng đệm kín) · ④ Vỏ trang trí & lớp phủ bề mặt · ⑤ **Bộ chuyển nguồn (adapter)** | S1 | A | 🟢 **BẮT BUỘC nói trước khi bán** |
| `F-G04` | ⛔ Nguyên nhân KHÔNG bảo hành | ① Lắp/dùng/bảo quản sai HDSD · ② Tự tháo dỡ hoặc sửa đổi · ③ **Dùng phụ kiện hoặc lõi không chính hãng** · ④ Ngoại lực & áp suất vượt giới hạn · ⑤ Bất khả kháng (chiến tranh, thiên tai) · ⑥ Hư hỏng khác do người dùng | S1 | A | 🟢 |
| `F-G05` | Hồ sơ cần giữ | **Phiếu bảo hành + hoá đơn gốc** | S1 | A | 🟢 |
| `F-G06` | Giới hạn trách nhiệm | Công ty không đưa ra bảo đảm nào khác và không chịu trách nhiệm về thiệt hại phát sinh do thiết bị bị lỗi | S1 | A | 🔵 |
| `F-G07` | Áp dụng chung | Cùng chính sách cho `GTUN-8600VNHP` và `GCUN-02VNT01` | S9 | A | 🔵 |

---


<a id="p1-8"></a>
## H. GIÁ & CHI PHÍ

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-H01` | Giá niêm yết máy | **44.950.000 đ** (kênh `NIEM_YET`, hiệu lực 29/07/2026) | S9 | A | 🟡 ⚠️ **chưa chốt đã gồm VAT chưa** — O-07 |
| `F-H02` | Giá lõi thô | **2.750.000 đ** | S9 | A | 🟡 |
| `F-H03` | Giá lõi màng | **7.500.000 đ** | S9 | A | 🟡 |
| `F-H04` | Giá lõi thô đã bán thực tế | 6 bộ, trung bình **2.050.000 đ** (05–08/2026, chỉ HN + HCM) | S9 | A | 🔵 |
| `F-H05` | Chi phí 5 năm (ước tính) | ~**58 – 63 triệu** cho hộ 4 người (~6 L/ngày) ≈ **32 – 35 nghìn/ngày** | E | **E** | 🟡 **phải nói rõ là "ước tính"**, ⛔ không đưa như bảng giá |
| `F-H06` | Giá thực tế đã bán | **60 – 85% giá niêm yết** trên 12/12 đơn. **Chưa từng bán ở giá niêm yết** | S9 | A | 🔵 ⛔ **Sale không tự ra giá** — O-08 |

---


<a id="p1-9"></a>
## I. CHỨNG NHẬN

| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |
|---|---|---|---|---|---|
| `F-I01` | TÜV Rheinland — số hiệu (ID Certipedia) | ✅ **`1111279087`** — tra Certipedia ra **General Water Technology (Shanghai) Co., Ltd.**<br>❌ `1111297087` trong `Thông tin chi tiết TUV.pdf` là **lỗi chép số** — ID đó thuộc **HP Inc. (laptop)** | S9, **S15** | **A** | 🔵 **Số đã đúng, nhưng vẫn ⛔ KHÔNG đọc cho khách** — trang tra cứu đang trống, xem `F-I16` và `O-18` |
| `F-I02` | TÜV — số chứng chỉ | `Q 50613617 001` | S5 | B | 🟡 |
| `F-I03` | TÜV — số báo cáo | `CN24W0C5 001` | S5 | B | 🟡 |
| `F-I04` | TÜV — model được chứng nhận | **`GE-GEUT-50B04` và `GE-GTUN-8600HP`** → **bao gồm đúng USH10** | S5 | B | 🟢 |
| `F-I05` | TÜV — phạm vi | **57 thử nghiệm**; chứng nhận **"Hygienic Property" (đặc tính vệ sinh)** | S5 | B | 🟢 |
| `F-I06` | TÜV — nội dung vật liệu | Vật liệu panel, ống nước, bể chứa, thân bơm đạt **19 chỉ tiêu hoà tan kim loại nặng theo EN 14350** (tiêu chuẩn EU cho **dụng cụ uống của trẻ em**) + vật liệu cấp thực phẩm EU + **12 yêu cầu LFGB (Đức)** | S5 | B | 🟡 **Diễn đạt theo đúng **Phần 2** — ⛔ không suy ra claim sức khoẻ** |
| `F-I07` | TÜV — nội dung vi sinh | Theo `DIN EN 16889`: kiểm **E. coli, Staphylococcus aureus, Pseudomonas aeruginosa** bên trong máy **sau thời gian dùng dài** — kết quả vẫn giữ sạch | S5 | B | 🟢 **Đây là điểm mạnh chưa ai khai thác: kiểm máy CŨ, không phải máy mới** |
| `F-I08` | TÜV — không phát hiện | Không bisphenol A (BPA), không chất làm dẻo, không melamine, không formaldehyde, không kim loại nặng | S5 | B | 🟡 phải kèm dấu `*` như tài liệu gốc |
| `F-I09` | File PDF chứng chỉ TÜV | 🔴 **CHƯA CÓ** — S5 là bản mô tả, không phải bản scan. 10/10 file chứng nhận trong thư mục Drive đều **0 byte** | — | — | 🔵 |
| `F-I10` | SGS — diệt khuẩn 99,999% | Số báo cáo `ASH18-029858-01`, **chưa có file**; phiếu SGS trong kho là của máy **50B04** | S9 | — | 🔴 **CẤM TUYỆT ĐỐI** |
| `F-I11` | LFGB (Đức) | Có trong mô tả TÜV (12 yêu cầu kiểm), **chưa có chứng chỉ riêng** | S5 | B | 🟡 chỉ nói trong ngữ cảnh TÜV |
| `F-I12` | VIETCERT | Kiểm định nóng lạnh (CTS10 + USH10) — 🔴 file 0 byte | S9 | — | 🔴 |
| `F-I13` | QCVN 6-1:2010/BYT | 🔴 **Phiếu thử rỗng ở mọi máy POU** | S9 | — | 🔴 **Không trích chuẩn khi chưa có phiếu** |
| `F-I14` | Phiếu khoáng | ~40 phiếu của 20+ tỉnh **Trung Quốc** — **không có phiếu Việt Nam** cho máy POU | S9 | — | 🔵 |
| `F-I15` | Mineral Map | 16 điểm đo thật tại VN — ⚠️ **là kết quả của hệ LỌC TỔNG (POE), KHÔNG phải USH10** | S9 | A | 🔴 **CẤM dùng làm bằng chứng cho USH10** |
| `F-I16` | **Trạng thái tra cứu công khai của TÜV** *(mới 28/08/2026)* | 🔴 Trang Certipedia của ID `1111279087` ghi *"Currently no valid certificates are attached to this Certipedia ID"*. **Tên nhà sản xuất hiện đúng, chứng chỉ KHÔNG hiện** | S15 | A | 🔴 **CẤM đưa số hoặc đường link cho khách tự tra** cho tới khi GWT làm việc lại với TÜV — `O-18` |

---


<a id="p1-10"></a>
## J. DANH MỤC ĐÓNG GÓI

| Mã | Dữ kiện | Nguồn | Hạng | Công bố |
|---|---|---|---|---|
| `F-J01` | Thân máy chính × 1 · Lõi lọc × 2 · Hộp phụ kiện × 1 | S1 | A | 🟢 |
| `F-J02` | Trong hộp phụ kiện: HDSD × 1 · **Vòi thông minh × 1** · Van bi cấp nước 3 ngã × 1 · Co nối 1/4" × 2 · Co nối 3/8" × 1 · Kẹp giữ ống 3/8" × 1 · Kẹp giữ ống 1/4" × 6 · Ống PE 3/8" trắng × 1 · Ống PE 1/4" trắng × 1 · Đầu nối 5/16" × 1 · **Mô-đun tiệt trùng nội tuyến × 1** | S1 | A | 🟢 |

---


<a id="p1-11"></a>
## K. DỮ LIỆU KINH DOANH (🔵 TOÀN BỘ NỘI BỘ)

| Mã | Dữ kiện | Giá trị | Nguồn |
|---|---|---|---|
| `F-K01` | Tổng máy đã bán | **12 máy** · doanh thu 272.227.500 đ · 11/12/2024 → 07/08/2026 (~0,6 máy/tháng) | S9 |
| `F-K02` | Nền lắp đặt | **11 máy** / 476 máy toàn hệ thống (2,3%) | S9 |
| `F-K03` | Ticket sự cố USH10 | **0** trên tổng 91 ticket toàn hệ thống | S9 |
| `F-K04` | Máy đã hết bảo hành toàn máy | **8 / 11** | S9 |
| `F-K05` | Lõi thô đã bán thay | **6 bộ** | S9 |
| `F-K06` | Lõi màng đã bán thay | **0 bộ** | S9 |
| `F-K07` | Tồn kho máy | **4 máy** (kho Nguyễn Xiển, 24/06/2026) | S9 |
| `F-K08` | Tồn kho lõi USH10 | 🔴 **0** | S9 |
| `F-K09` | Thị phần POU | 2025: **35% — #1 dòng POU** → 2026: **1,3% — hạng 9/9** | S9 |
| `F-K10` | Kênh bán hiệu quả | **KOL Dino 4/12 máy (33%)** và giữ giá cao nhất (85/80/70%). Cộng "Giới thiệu"/"KTS" → **8/12 máy từ quan hệ + KOL** | S9 |
| `F-K11` | Địa bàn đã bán | Chỉ **HCM (7) · Hà Nội (4) · Bắc Ninh (1)** | S9 |
| `F-K12` | Case F&B thật | **PIN Cafe** (33 Hàng Hòm) · **The Ghé Coffee** (Q1) — đã đo nước đầu ra | S9 |

---


<a id="p1-12"></a>
## L. SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ, KHÔNG PHẢI CÔNG BỐ CỦA HÃNG)

> ✅ **GWT đã rà toàn bộ mục L ngày 28/08/2026 và xác nhận: mọi suy luận số học ở đây đều đúng** (S14).
>
> Xác nhận này đổi **độ tin cậy**, không đổi **quyền công bố**. Các mục dưới đây vẫn là **phép tính của người soạn PKB**, không phải số liệu hãng công bố — nên vẫn **không đọc cho khách** dưới dạng con số. Điều đổi là: chúng đã đủ chắc để **đóng mâu thuẫn** và để **kết luận** rút ra từ chúng được nâng lên Phần 1.
>
> **Hai kết luận đã tốt nghiệp khỏi mục L** (nay là dữ kiện chính thức, xem cột "Đã dùng ở đâu"): `F-L01` và `F-L03` → đóng `O-03`, viết lại `F-B06` và `F-C17`.

| Mã | Suy luận | Cơ sở | GWT rà 28/08 | Đã dùng ở đâu |
|---|---|---|---|---|
| `F-L01` | **8.600 L trên nhãn máy chính là ngưỡng lít của lõi màng.** Quy cách V1.8 ghi lõi NF bản 700G = 1.440 ngày / **8.600 L nước tinh khiết** — trùng khít con số *"Tổng công suất lọc nước định mức = 8.600 L"* trên HDSD | S1 + S6 | ✅ **Đúng** | 🎓 Đã nâng lên `F-B06` · đóng `O-03` |
| `F-L02` | **Tỷ lệ 6.630 / 10.200 = đúng 65%** — khớp ghi chú *"回收率 ≥65%"* trong quy cách. Vậy 6.630 L là **nước tinh khiết**, 10.200 L là **nước vào** cho lõi thô | S6 | ✅ **Đúng** | Nội bộ — giải thích cặp số của lõi thô |
| `F-L03` | **12.240 L trong Danh mục hàng hoá là "nước ĐẦU VÀO" của lõi màng, không phải nước tinh khiết** (8.600 / 12.240 = 70,3%). Vậy 8.600 và 12.240 **không mâu thuẫn** — là 2 đại lượng khác nhau | S6 + DM | ✅ **Đúng — GWT xác nhận nguyên văn: _"12.240 L là mức nước đầu vào, 8.600 L là mức nước đầu ra (uống được)"_** (S14) | 🎓 Đã nâng lên `F-C17` · **đóng `O-03`** |
| `F-L04` | **Hai ngưỡng của lõi màng được hiệu chỉnh quanh mức dùng ~6 L/ngày:** 8.600 L ÷ 6 L/ngày ≈ 1.433 ngày ≈ đúng ngưỡng 1.440 ngày | S6 | ✅ **Đúng** | Nội bộ — dùng khi khách hỏi *"sao lại 4 năm"* |
| `F-L05` | **Lõi thô luôn bị chặn bởi thời gian, không phải số lít.** 6.630 L ÷ 6 L/ngày ≈ 1.105 ngày, trong khi ngưỡng thời gian chỉ 360 ngày → hộ gia đình bình thường **luôn** chạm mốc 360 ngày trước | S6 | ✅ **Đúng** | Nội bộ — cơ sở kế hoạch nhập lõi |
| `F-L06` | **2,1 L/phút và "2,8 giây/100 ml" là cùng một con số.** 100 ml ÷ 2,1 L/phút = 2,86 giây. Tương tự 1,8 L/phút → 3,33 giây/100 ml. Hai số liệu nhất quán → độ tin cậy của nguồn S3 cao | S3 | ✅ **Đúng** | Nội bộ — cơ sở sửa cách diễn đạt `F-M09` |
| `F-L07` | **"20 L/giờ" và "2,1 L/phút" không mâu thuẫn.** 2,1 L/phút là **tốc độ rót** từ bình đun (đợt ngắn); 20 L/giờ là **năng suất đun bền vững** (0,33 L/phút). Rót nhanh nhưng không rót liên tục vô hạn được | S1 + S3 | ✅ **Đúng** | Nội bộ — trả lời khách hỏi *"rót liên tục được không"* |

> 🎓 = suy luận đã được xác nhận và **chuyển thành dữ kiện chính thức** ở Phần 1. Khi trích, hãy trích mã Phần 1 (`F-B06`, `F-C17`), không trích mã `F-Lxx`.

---


<a id="p1-13"></a>
## M. DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ (🔴 HẠNG X)

| Mã | Dữ kiện sai | Đang xuất hiện ở đâu | Giá trị đúng |
|---|---|---|---|
| `F-M01` | **Mức nhiệt 75 °C** | Master Data, catalogue, chatbot, kịch bản video, `[NOTE GWT].pdf` | Nước thường · 45 · 85 · 95 (`F-E01`) |
| `F-M02` | **Áp lực nước vào "0–0,4 MPa"** | Brochure VN, Master Data | **0,1–0,4 MPa** (`F-B08`) |
| `F-M03` | **Công suất "2.000–2.400 W"** | Chatbot | **2.100 W** (`F-B11`) |
| `F-M04` | **Điện áp "220–240V"** | Brochure, Master Data | **220V ~ 50Hz** (`F-B10`) |
| `F-M05` | **"USH10 là máy để bàn"** | `gwt/sales-cskh.md` | **Âm tủ bếp** (`F-A06`) |
| `F-M06` | **"Diệt khuẩn 99,999%"** | Chatbot (8 chunk) | ⛔ Không có bằng chứng — không thay thế bằng số nào |
| `F-M07` | **"Tỷ lệ thu hồi nước cao nhất hiện nay"** | Chatbot | ⛔ Bỏ hẳn — cấm superlative |
| `F-M08` | **Công dụng y tế từng khoáng** | Chatbot | ⛔ Bỏ hẳn (**Phần 2** mục 3) |
| `F-M09` | **"Nước nóng ra sau 2,8 giây"** | Marketing VN | **"~2,8 giây cho 100 ml nước nóng"** (`F-E30`) |
| `F-M10` | **"Chế độ tiết kiệm điện giữ ấm 2 giờ"** | Marketing VN | **3 giờ** (`F-E21`) |
| `F-M11` | **"USH10 thường hết hàng"** | `gwt/sales-cskh.md` | Kiểm tra `wh_master` trước khi trả lời (`F-K07`) |

---

<a id="p2"></a>

# PHẦN 2 — QUY TẮC CLAIM — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI

> **PKB v1.2 · 28/08/2026** · Áp dụng cho **mọi kênh**: AI/chatbot, sale nói miệng, inbox, livestream, video, landing page, ấn phẩm in, caption social.
> **Đây là file phải đọc trước khi viết bất kỳ dòng nội dung nào.**

---


<a id="p2-1"></a>
## 0. BA NGUYÊN TẮC GỐC

| # | Nguyên tắc | Áp dụng thế nào |
|---|---|---|
| **1** | **Không bịa.** Mọi câu nói về sản phẩm phải truy được về một mã `F-xxx` trong **Phần 1** | Không có mã → không được nói |
| **2** | **Không suy diễn.** Không ghép 2 dữ kiện để tạo dữ kiện thứ 3. Không quy đổi, không ngoại suy, không "chắc là" | Ví dụ cấm: lấy 20 L/giờ chia ra để nói "1 phút được 333 ml" |
| **3** | **Không nói y khoa.** Không nói về sức khoẻ, dinh dưỡng, bệnh tật, mẹ bầu, trẻ sơ sinh, người bệnh — kể cả gián tiếp, kể cả khi khách hỏi thẳng | Xem mục 3 bên dưới |

> **Câu thoát chuẩn khi không có dữ kiện:**
> *"Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em kiểm tra rồi báo lại anh/chị."*

---


<a id="p2-2"></a>
## 1. 🔴 DANH SÁCH ĐỎ — CẤM TUYỆT ĐỐI

| ⛔ Cấm nói | Vì sao | ✅ Nói thay bằng |
|---|---|---|
| **"Diệt khuẩn 99,999%"** (hoặc bất kỳ % diệt khuẩn nào) | Phiếu SGS `ASH18-029858-01` **chưa có trong hồ sơ**; phiếu SGS đang lưu là của máy khác (50B04) | *"Máy có mô-đun tiệt trùng lắp ngay trên đường nước đi ra vòi"* |
| **"Mức nhiệt 75 độ"** | Máy **không có** mức này (`F-E02`) | *"Nước nhiệt độ phòng, 45, 85 và 95 độ"* |
| **Tên/mã lõi lọc** (`PCFB`, `NF700`, `LX-…`, `40229463`) | Rule nội bộ GWT chốt 18/07/2026 — mọi kênh xuất bản | *"Lõi thô tổng hợp"* / *"lõi màng lọc nano"* |
| **Công dụng y tế của khoáng chất** ("magie tốt cho tim mạch", "selen chống oxy hoá", "kẽm tăng đề kháng"…) | Nói công dụng như thuốc — vi phạm pháp luật quảng cáo | *"Giữ lại khoáng chất tự nhiên có trong nước"* — **dừng ở đó** |
| **Mọi so sánh tuyệt đối**: "tốt nhất", "cao nhất", "duy nhất", "số 1", "hơn hẳn", "đầu tiên tại Việt Nam" | Luật quảng cáo VN cấm so sánh tuyệt đối thiếu căn cứ | Nêu **con số cụ thể**, để khách tự so |
| **Mọi con số tỷ lệ thu hồi nước** (69% / 76,8% / 77% / 78%) | 4 nguồn ghi 4 số khác nhau (`F-B22`, **O-19**) | ⛔ Không nói con số nào. Nếu khách hỏi: *"Con số cụ thể em cần xác nhận lại với hãng"* |
| **"Áp lực 0 MPa cũng chạy"** | HDSD yêu cầu tối thiểu **0,1 MPa** (`F-B08`) | *"Máy cần áp lực nước vào từ 0,1 đến 0,4 MPa"* |
| **"USH10 là máy để bàn"** | Sai loại máy (`F-A06`) | *"Máy âm tủ bếp, chỉ vòi lộ trên mặt bàn"* |
| **"Cảm biến nhiệt Seiko"** | Không có nguồn nào (`F-E33`) | Bỏ hẳn. Nói *"cảm biến nhiệt kép, sai số ±3 độ"* nếu cần |
| **"Hộp đun 1,8 L inox 316 chân không 2 lớp"** | Không có nguồn nào (`F-E34`) | Bỏ hẳn |
| **"Nước nóng ra sau 2,8 giây"** | Diễn đạt sai. Nguồn NSX là **tốc độ rót**, không phải thời gian chờ (`F-E30`) | *"Rót 100 ml nước nóng khoảng 2,8 giây"* |
| **Trộn số của LÕI MÀNG với số của LÕI THÔ trong cùng một khung hình** — 8.600 / 12.240 (lõi màng) đặt cạnh 6.630 / 10.200 (lõi thô) | Khác cấp bộ phận, khách sẽ thấy mâu thuẫn. *(8.600 và 12.240 thì **không** mâu thuẫn — vào/ra của cùng lõi màng, `F-C17`)* | Chọn **1 con số cho 1 thông điệp**. Nếu buộc phải nêu cặp, nói đủ *"vào … ra …"* của **cùng một lõi** |
| **Đọc số hiệu TÜV cho khách tự tra** — kể cả số đúng `1111279087` | Số đã chốt đúng (`F-I01`), **nhưng trang Certipedia của ID này đang không hiện chứng chỉ nào** (`F-I16`). Khách tra ra trang trống → mất niềm tin **nặng hơn** là không đưa số | *"Máy có chứng nhận TÜV Rheinland của Đức. Số hiệu chính xác em xin phép gửi anh/chị bằng văn bản."* — ⛔ tuyệt đối **không** nhắn số qua chat, không gửi link Certipedia |
| **Trích tiêu chuẩn nước** (`QCVN 6-1:2010/BYT`, `CJ94-2005`) | Phiếu thử **rỗng** (`F-I13`) | Xử lý theo kịch bản **Phần 6** **Q25** |
| **Dùng Mineral Map làm bằng chứng cho USH10** | Đó là kết quả đo của **hệ lọc tổng (POE)**, không phải USH10 (`F-I15`) | Chỉ dùng khi nói về hệ lọc tổng |
| **Hướng dẫn khách khôi phục cài đặt gốc** (`SC`) | Xoá toàn bộ dữ liệu đếm lõi (`F-E32`) | Chỉ kỹ thuật viên làm |
| **Nói xấu, nêu tên đối thủ để so sánh bất lợi** | Rủi ro pháp lý + phản tác dụng | Nêu 3 điểm khác biệt cấu trúc của máy mình, để khách tự đối chiếu (**Phần 6** Q26) |

---


<a id="p2-3"></a>
## 2. 🟡 DANH SÁCH VÀNG — NÓI ĐƯỢC NHƯNG PHẢI ĐÚNG CÂU CHỮ

| Nội dung | ⛔ Cách nói SAI | ✅ Cách nói ĐÚNG |
|---|---|---|
| **Mô-đun tiệt trùng** | "Đèn UV diệt 99,999% vi khuẩn" | *"Máy có mô-đun tiệt trùng lắp nối tiếp ngay trên đường ống nước tinh khiết chạy lên vòi — theo đúng hướng dẫn lắp đặt của hãng."* |
| **Chu kỳ lõi** | "Lõi bền 4 năm", "cam kết 48 tháng" | *"Chu kỳ khuyến nghị 12 tháng và 48 tháng. Máy đếm cả theo ngày lẫn theo lượng nước đã lọc và tự báo khi tới hạn."* + trích `F-C20` |
| **Tuổi thọ máy** | "Máy dùng 10 năm" | *"Hướng dẫn sử dụng ghi tuổi thọ khoảng 5 đến 10 năm trong điều kiện vận hành và bảo dưỡng đúng."* |
| **TÜV** | "Chứng nhận an toàn cho mẹ và bé" | *"TÜV Rheinland đã thực hiện 57 thử nghiệm. Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo tiêu chuẩn EN 14350 của EU và 12 yêu cầu vật liệu tiếp xúc thực phẩm LFGB của Đức."* — **dừng ở mô tả, không suy ra kết luận** |
| **Giữ khoáng** | "Uống nước có khoáng tốt cho sức khoẻ" | *"Màng lọc nano giữ lại khoáng chất tự nhiên có sẵn trong nước, khác với RO là loại bỏ gần hết."* |
| **Nano vs RO** | "Nano tốt hơn RO" | *"Hai công nghệ nhắm hai mục tiêu khác nhau"* + nêu điểm khác biệt (**Phần 6** Q24) |
| **Hiệu suất nước mức 1** | "Đạt hiệu suất nước cao nhất" | *"Đạt mức 1 theo tiêu chuẩn hiệu suất nước GB 34914-2021 của Trung Quốc."* — phải nêu rõ là tiêu chuẩn TQ |
| **Chi phí 5 năm** | "Chi phí sử dụng là 32 nghìn/ngày" | *"Ước tính sơ bộ cho hộ 4 người, khoảng 32–35 nghìn một ngày tính cả tiền máy lẫn tiền lõi."* — **phải có chữ "ước tính"** |
| **Bảo hành 5 năm bơm + bo** | Hứa chắc miệng | *"Theo chính sách của bên em, bơm và bo mạch điều khiển được bảo hành 5 năm."* — nếu khách đòi văn bản thì **chuyển phòng kinh doanh**, không tự cam kết |
| **Giá** | Tự hạ giá / tự báo mức chiết khấu | Giá niêm yết là 44.950.000 đ. **Mọi mức khác phải xin duyệt** (O-08) |
| **Có sẵn lõi thay không** | "Có sẵn, bên em thay ngay" | *"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay."* (kho hiện **0 lõi** — `F-K08`) |
| **Nhà sản xuất** | Nói chắc một tên | Hai bản HDSD ghi 2 NSX khác nhau (O-01). Nếu khách hỏi: *"GE là nhãn hiệu của General Electric, sản phẩm được sản xuất theo giấy phép."* (`F-A09`) |

---


<a id="p2-4"></a>
## 3. 🚨 QUY TẮC MẸ & BÉ / Y KHOA — NGHIÊM NGẶT NHẤT

### 3.1 Vì sao phải nghiêm

Nút **45 °C** trên vòi được hãng đặt tên gốc là **"泡奶键" — phím pha sữa**. Đây là **nhãn chức năng của nhà sản xuất**, không phải khuyến nghị y tế. Rất dễ trượt từ *"nút này để pha sữa"* sang *"nước này tốt cho bé"* — và đó là ranh giới bị cấm.

### 3.2 Ranh giới

| ✅ ĐƯỢC NÓI (mô tả chức năng) | 🔴 CẤM NÓI (kết luận y tế/dinh dưỡng) |
|---|---|
| *"Nút WARM cài sẵn 45 độ, hãng đặt cho tình huống pha sữa."* | *"45 độ là nhiệt độ chuẩn để pha sữa cho bé."* |
| *"Máy có khoá trẻ em, phải chạm LOCK trước mới ra được nước nóng."* | *"Máy an toàn tuyệt đối cho trẻ nhỏ."* |
| *"Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo EN 14350 — tiêu chuẩn EU áp dụng cho dụng cụ uống của trẻ em."* | *"Đạt chuẩn an toàn cho mẹ và bé."* / *"Được chứng nhận dùng được cho trẻ sơ sinh."* |
| *"Màng lọc nano giữ lại khoáng chất tự nhiên có trong nước."* | *"Nước có khoáng tốt cho sự phát triển của bé."* |
| *"Lõi màng giảm kim loại nặng như chì, asen, cadimi."* | *"Bảo vệ bé khỏi nhiễm độc chì."* |
| *"TÜV kiểm E. coli, S. aureus, P. aeruginosa bên trong máy sau thời gian dùng dài, kết quả vẫn sạch."* | *"Nước sạch khuẩn, mẹ bầu uống yên tâm."* |

### 3.3 Ba câu hỏi khách hay hỏi và câu trả lời bắt buộc

| Khách hỏi | ✅ Trả lời chuẩn |
|---|---|
| *"Nước này pha sữa cho bé được không?"* | *"Trên vòi có nút 45 độ, hãng thiết kế cho tình huống pha sữa và mình chọn được nhiệt độ chính xác. Còn việc pha sữa cho bé thế nào cho đúng thì anh/chị theo hướng dẫn của hãng sữa và bác sĩ ạ — cái đó em không tư vấn được."* |
| *"Nước này bà bầu / người bệnh uống được không?"* | *"Máy lọc nước máy đô thị thành nước uống trực tiếp. Còn chế độ uống cho người đang mang thai hay đang điều trị thì em không có chuyên môn để tư vấn, anh/chị hỏi bác sĩ sẽ chuẩn hơn ạ."* |
| *"Khoáng trong nước có tác dụng gì?"* | *"Cái này em không tư vấn được vì liên quan sức khoẻ. Em chỉ khẳng định được là máy **giữ lại** khoáng tự nhiên chứ không loại bỏ như RO."* |

### 3.4 Từ khoá tự động chặn (dùng cho chatbot/AI)

Nếu câu trả lời sắp sinh ra chứa bất kỳ cụm nào dưới đây → **chặn, thay bằng câu thoát ở mục 3.3**:

```
tốt cho sức khoẻ · tốt cho bé · tốt cho mẹ bầu · an toàn cho trẻ sơ sinh
phòng bệnh · chữa · điều trị · hỗ trợ điều trị · tăng đề kháng · tăng miễn dịch
bổ sung khoáng cho cơ thể · chống oxy hoá · điều hoà huyết áp · tốt cho xương
giảm nguy cơ · ngăn ngừa ung thư · thải độc · thanh lọc cơ thể · cân bằng pH cơ thể
nước kiềm tốt hơn · uống vào khỏi bệnh · bác sĩ khuyên dùng
```

---


<a id="p2-5"></a>
## 4. 🟢 DANH SÁCH XANH — ĐƯỢC NÓI THOẢI MÁI

Đây là các dữ kiện hạng A/B, đã kiểm chứng, **không cần chứng nhận nào để bảo vệ**:

| Nội dung | Mã | Vì sao an toàn |
|---|---|---|
| **Vị trí mô-đun tiệt trùng** — lắp nối tiếp trên đường nước tinh khiết đi lên vòi | `F-D05` | Ghi rõ trong bước lắp đặt của HDSD chính hãng |
| **Máy rộng 17,9 cm**, kích thước 467×179×477 mm | `F-B01`, `F-B02` | Số đo trên HDSD |
| **Âm tủ hoàn toàn**, mặt bàn chỉ có vòi | `F-A06` | HDSD |
| **2 lõi — 4 bước lọc** | `F-C01` | HDSD |
| **Không có bình chứa nước lọc** (tankless) | `F-C02` | HDSD |
| **4 chế độ: thường / 45 / 85 / 95 °C** | `F-E01` | HDSD |
| **Khoá trẻ em 2 bước** để lấy nước nóng | `F-E04`, `F-E06` | HDSD |
| **Máy tự xả rửa màng theo lịch** | `F-E09` | HDSD |
| **Chức năng không đọng nước** — nước tồn tự quay về lọc lại | `F-E11` | HDSD |
| **Nhắc thay lõi 2 cấp** (nháy đỏ → đỏ liên tục), báo ở **3 nơi** | `F-E12`, `F-E14` | HDSD + deck NSX |
| **Máy đếm lõi theo cả ngày lẫn lượng nước đã lọc** | `F-C18` | Quy cách + Danh mục |
| **Thay lõi tự làm được**, rút ngang, không cần kéo máy ra | `F-E18`, `F-C27` | HDSD + deck NSX |
| **Vòi xoay 120°**, chuẩn **IPX4**, bo mạch phủ keo 100% | `F-E26`–`F-E28` | Deck NSX |
| **App G+ Life** — theo dõi tuổi thọ lõi, cảnh báo rò rỉ | `F-F02`, `F-F07` | HDSD + deck NSX |
| **Patent màng nano US 7138058** — khách tra được trên Google Patents | `F-C11` | Công khai |
| **TÜV kiểm máy đã dùng lâu, không phải máy mới** | `F-I07` | Tài liệu TÜV |
| **Bảo hành 12 tháng toàn máy** + danh sách loại trừ | `F-G01`, `F-G03` | HDSD |
| **Chỉ dùng nước máy đô thị**, 5–38 °C | `F-B14`, `F-B15` | HDSD |
| **Chỉ dùng cho gia đình**, không lắp nơi tiêu thụ nước cao | `F-C21` | HDSD |
| **0 ticket sự cố trên 11 máy trong ~2 năm** | `F-K03` | Dữ liệu nội bộ GWT |

---


<a id="p2-6"></a>
## 5. QUY TẮC RIÊNG THEO KÊNH

| Kênh | Được dùng hạng | Ràng buộc thêm |
|---|---|---|
| **Video / TVC / landing page** | A, B | Mọi con số lên hình phải có mã `F-xxx`. ⛔ Không đọc 3 con số lít cạnh nhau. ⛔ Không superlative dù chỉ trong lời thoại phụ |
| **Caption social** | A, B | Rút gọn được nhưng **không được rút gọn mất điều kiện** (ví dụ bỏ chữ "khuyến nghị" khỏi chu kỳ lõi) |
| **Chatbot / AI** | A, B | Bắt buộc chạy bộ lọc từ khoá mục 3.4. Khi không chắc → câu thoát mục 0 |
| **Sale nói miệng / inbox** | A, B, và **được biết** C/D để tư vấn | ⛔ Không đọc số hạng C/D cho khách. ⛔ Không tự ra giá |
| **Báo giá bằng văn bản** | A | ⛔ **Chưa chốt VAT** (O-07) → mọi báo giá văn bản phải qua phòng kinh doanh |
| **Tài liệu đào tạo nội bộ** | A, B, C, D, E | Phải ghi rõ hạng của từng dữ kiện |

---


<a id="p2-7"></a>
## 6. CHECKLIST TRƯỚC KHI XUẤT BẢN

Trước khi bấm đăng / bấm quay / gửi khách, chạy 8 câu hỏi:

- [ ] **1.** Mỗi con số trong nội dung có mã `F-xxx` không?
- [ ] **2.** Có con số nào hạng C, D, E bị lọt lên nội dung xuất bản không?
- [ ] **3.** Có từ nào trong Danh sách đỏ (mục 1) không?
- [ ] **4.** Có từ nào trong danh sách chặn y khoa (mục 3.4) không?
- [ ] **5.** Có so sánh tuyệt đối nào không ("nhất", "duy nhất", "hơn hẳn")?
- [ ] **6.** Có nêu tên/mã lõi lọc không?
- [ ] **7.** Chu kỳ lõi có kèm chữ **"khuyến nghị"** không?
- [ ] **8.** Nếu có nhắc chứng nhận — file bằng chứng đã có trong tay chưa? Nếu chưa, đã dùng đúng kịch bản **Phần 6** Q25 chưa?

> Nếu bất kỳ ô nào không tick được → **không xuất bản**, chuyển về **Phần 8** ghi nhận.

---

<a id="p3"></a>

# PHẦN 3 — HƯỚNG DẪN KHÁCH HÀNG — SỬ DỤNG · VỆ SINH · THAY LÕI

> **PKB v1.2 · 28/08/2026** · Nguồn: **HDSD chính hãng Ver.26.08.14** (S1) + thông báo kỹ thuật NSX (S7)
> **Dùng cho:** phát cho khách khi bàn giao · CSKH đọc qua điện thoại · nội dung mục "Hướng dẫn sử dụng" trên website
> ⚠️ File này **không thay thế HDSD chính hãng đi kèm máy**. Đây là bản rút gọn cho tình huống thực tế.

---


<a id="p3-1"></a>
## 1. NGÀY ĐẦU TIÊN — SAU KHI LẮP XONG

| Bước | Việc | Chi tiết |
|---|---|---|
| 1 | Máy hiện **`C1`** | Đây là **chế độ xả rửa lần đầu** — bình thường |
| 2 | Chạm nút **lấy nước** để bắt đầu xả | Máy tự xả rửa toàn hệ thống |
| 3 | Chờ **khoảng 16 phút** | Xong thì màn hình trở lại bình thường |
| 4 | Có **bột than đen hoặc bọt khí** trong nước | **Bình thường** — bột từ lõi carbon mới. Tiếp tục xả cho đến khi **nước trong** |
| 5 | Kiểm tra không rò rỉ | Nhìn quanh thân máy và các mối nối trong tủ |

> ⚠️ Nếu mất điện giữa chừng, máy sẽ **đếm lại 16 phút từ đầu** khi có điện lại.

---


<a id="p3-2"></a>
## 2. DÙNG HẰNG NGÀY

### 2.1 Lấy nước nhiệt độ phòng

```
Chạm nút nước thường  →  ra nước ngay  (không cần mở khoá)
```

### 2.2 Lấy nước nóng — luôn là **2 bước**

```
Bước 1: chạm nút  LOCK   (mở khoá trẻ em)
Bước 2: chạm nút nhiệt độ muốn lấy
```

| Nút | Nhiệt độ | Hãng thiết kế cho |
|---|---|---|
| **WARM** | **45 °C** | Pha sữa |
| **EX WARM** | **85 °C** | Pha trà |
| **HOT** | **95 °C** | Pha cà phê, mì, nước sôi |

> **Khoá trẻ em tự bật lại** sau vài giây không thao tác. Nghĩa là mỗi lần lấy nước nóng đều phải mở khoá lại — đây là thiết kế cố ý.
> Đèn LOCK: **tắt** = đang mở khoá · **sáng trắng** = đang khoá.

### 2.3 Đổi nhiệt độ cài sẵn của một nút

```
Giữ đồng thời  LOCK + nút cần đổi  trong 3 giây
```
Khi đã chọn một mức, hai nút nhiệt còn lại **tạm bị vô hiệu hoá** — để tránh bấm nhầm.

### 2.4 Đọc màn hình trên vòi

| Hiển thị | Nghĩa |
|---|---|
| Con số | Nhiệt độ nước nóng **hiện tại** trong bình đun |
| **Nháy** | Đang gia nhiệt |
| **Tắt** | Không gia nhiệt |
| Đèn lõi **trắng** | Lõi còn trong hạn |
| Đèn lõi **nháy đỏ** | Sắp tới hạn — **đặt lõi trước** |
| Đèn lõi **đỏ liên tục** | Hết hạn — **thay ngay** |
| Đèn UV **trắng** | Mô-đun tiệt trùng còn hạn |
| Đèn UV **nháy trắng** | Mô-đun tiệt trùng sắp hết hạn |

### 2.5 Đọc đèn trên thân máy (trong tủ)

| Đèn | Trạng thái | Nghĩa |
|---|---|---|
| **Status** | Xanh liên tục | Đang lọc nước |
| **Status** | Nháy xanh chậm | Đang xả rửa |
| **NF / PCFB** | Xanh liên tục | Lõi bình thường |
| **NF / PCFB** | Nháy đỏ | Lõi sắp hết hạn |
| **NF / PCFB** | Đỏ liên tục | Lõi đã hết hạn |
| **WiFi** | Xanh liên tục | Đã kết nối mạng |
| **WiFi** | Nháy xanh chậm | Chưa kết nối / kết nối thất bại |

---


<a id="p3-3"></a>
## 3. 4 THÓI QUEN NÊN CÓ

| # | Thói quen | Vì sao | Nguồn |
|---|---|---|---|
| **1** | **Mỗi sáng, xả bỏ lượng nước tồn qua đêm** trước lần dùng đầu tiên | HDSD khuyến nghị. Nói thẳng với khách chứ đừng giấu — máy đã có chức năng không đọng nước nhưng hãng vẫn khuyên làm việc này | S1 |
| **2** | **Lau khô mặt vòi khi có nước bắn lên** | Giọt nước lớn đọng trên mặt vòi có thể **kích hoạt nhầm chế độ xả rửa `C1`** | S7 |
| **3** | **Bấm nút xả bình đun ("Mỗi ngày tươi mới") theo thói quen** | Xả sạch nước tồn trong bình đun bằng 1 chạm: chạm `LOCK` → chạm nút xả | S1, S3 |
| **4** | **Khoá van bi cấp nước khi không dùng máy dài ngày** | HDSD yêu cầu | S1 |

---


<a id="p3-4"></a>
## 4. VỆ SINH & BẢO DƯỠNG

### 4.1 Máy tự làm những gì

| Máy tự làm | Chi tiết |
|---|---|
| **Xả rửa bề mặt màng theo lịch** | Tự động, khách không phải làm gì |
| **Chức năng không đọng nước** | Khi lâu không dùng, nước tinh khiết tồn trong lõi **tự quay về lọc lại** |
| **Đếm tuổi thọ lõi** | Đếm **cả theo ngày lẫn theo lượng nước đã lọc**, cái nào tới trước tính cái đó |

### 4.2 Khách làm những gì

| Việc | Cách làm | Tần suất |
|---|---|---|
| **Lau vỏ ngoài & mặt vòi** | Khăn mềm ẩm, lau xong lau khô. ⛔ **Không dùng hoá chất tẩy, dung môi, chất ăn mòn** | Khi cần |
| **Xả nước tồn buổi sáng** | Mở vòi xả một lúc | Hằng ngày |
| **Xả bình đun** | Chạm `LOCK` → chạm nút xả | Theo thói quen |
| **Thay lõi khi đèn báo** | Xem mục 5 | Theo đèn báo |
| **Gọi kỹ thuật thay ống PE + đầu nối** | Là chi tiết lão hoá, **có tính phí theo giá thị trường** | **Mỗi 24 tháng** |

### 4.3 ⛔ Tuyệt đối không làm

| Không được | Vì sao |
|---|---|
| Đổ nước tẩy, giấm, hoá chất vào máy để "vệ sinh" | Chất ăn mòn làm hỏng bộ phận tiếp xúc nước → **chất độc hại vào đường nước** |
| Rửa lại lõi cũ để dùng tiếp | Lõi đã dùng **không thể rửa hay tái chế** |
| Tự tháo thân máy, tháo vòi, tháo ống | **Mất bảo hành** + rủi ro ngập |
| Dùng lõi không chính hãng | **Mất bảo hành**, ảnh hưởng chất lượng nước |
| Đặt vật nặng lên máy hoặc che kín máy | Cản trở tản nhiệt → quá nhiệt |

---


<a id="p3-5"></a>
## 5. THAY LÕI LỌC

### 5.1 Khi nào phải thay

**Máy báo:** đèn lõi **nháy đỏ** (sắp hết — chuẩn bị lõi) → **đỏ liên tục** (phải thay ngay).

**Hoặc khi có một trong ba dấu hiệu (theo HDSD):**
1. Chất lượng nước suy giảm, **mùi vị kém đi**
2. **Lưu lượng giảm đáng kể**, và không phải do nước lạnh
3. **Lõi tắc nghiêm trọng**, không lấy được nước bình thường

**Phân biệt lõi nào:**
- **Mùi vị kém** → dấu hiệu của **lõi carbon (lõi thô)**
- **Không lấy được nước** → dấu hiệu **lõi bị tắc**

### 5.2 Chu kỳ khuyến nghị

| Lõi | Chu kỳ khuyến nghị (GWT) | Giá tham khảo |
|---|---|---|
| **Lõi thô tổng hợp** | ~**12 tháng** | 2.750.000 đ |
| **Lõi màng lọc nano** | ~**48 tháng** | 7.500.000 đ |

> ⚠️ **Đây là chu kỳ khuyến nghị, không phải hạn cứng.**
> HDSD chính hãng ghi nguyên văn: *"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ sử dụng của lõi lọc… có thể ngắn hơn các chu kỳ ước tính nêu trên… **Dữ liệu trên chỉ mang tính tham khảo**."*
> Nhà dùng nhiều nước, hoặc nước đầu vào nhiều cặn/độ cứng cao → lõi hết sớm hơn. Vì thế **máy đếm cả ngày lẫn lít và tự báo**, khách không phải tự nhớ.
>
> 🔵 *Nội bộ:* HDSD chính hãng khuyến nghị **6–12 tháng** (lõi thô) và **24–36 tháng** (lõi màng) — ngắn hơn con số GWT chốt. Xem **Phần 8** **O-02**. ⛔ Không đọc mâu thuẫn này cho khách; nếu khách tự đọc HDSD và hỏi → trả lời theo **Phần 6** **Q13**.

### 5.3 Quy trình thay — 6 bước, khoảng 5 phút

```
1.  Khoá van bi cấp nước 3 ngã  +  RÚT ĐIỆN
2.  Mở nắp trước của máy
3.  Xoay lõi cũ NGƯỢC chiều kim đồng hồ để tháo ra
4.  Lắp lõi mới: xoay THUẬN chiều kim đồng hồ cho tới khi 2 ký hiệu thẳng hàng
5.  RESET: giữ nút lõi tương ứng 3 giây
       → nghe 1 tiếng bíp + biểu tượng lõi về trạng thái ổn định = xong
6.  XẢ RỬA: máy hiện "C2" → chạm nút nước nhiệt độ phòng
       → xả rửa 8 phút → màn hình về bình thường
```

> ✅ **Khách tự thay được.** Lõi thiết kế **rút ngang**, không phải kéo máy ra khỏi tủ.
> ⚠️ **Quên bước 5 (reset)** là lỗi phổ biến nhất — máy sẽ vẫn báo đỏ dù đã thay lõi mới.
> ⚠️ Lõi cũ: thải như **chất thải rắn sinh hoạt**, không rửa lại để dùng.

### 5.4 Reset mô-đun tiệt trùng (khi đèn UV nháy trắng)

```
1.  Mở khoá trẻ em (chạm LOCK)
2.  Giữ đồng thời nút "WARM" + nút "UV" trong 3 giây
3.  Màn hình hiện "SA" + 1 tiếng bíp = đã reset xong
```

---


<a id="p3-6"></a>
## 6. KẾT NỐI ỨNG DỤNG G+ LIFE

```
1.  Bật Bluetooth trên điện thoại + đảm bảo điện thoại đang kết nối Wi-Fi nhà
2.  Quét mã QR trên máy để tải app G+ Life
3.  Đăng ký bằng số điện thoại + mã xác minh, đăng nhập, điền hồ sơ
4.  Bấm "Add Device"
5.  Giữ nút trên máy 3 giây để vào chế độ ghép nối
6.  Nhập mật khẩu Wi-Fi nhà, chờ ghép nối
7.  Bấm "Getting Started" — xong
```

**Trên app xem được:** tuổi thọ lõi còn lại theo %, trạng thái máy, chất lượng nước, cảnh báo rò rỉ, hẹn giờ đun, xả rửa từ xa.

**Nếu ghép nối thất bại:** đèn WiFi nháy chậm rồi tắt. Giữ nút Wi-Fi **3 giây** để huỷ liên kết cũ và ghép lại từ đầu.

---


<a id="p3-7"></a>
## 7. ĐI VẮNG DÀI NGÀY

```
TRƯỚC KHI ĐI:
  - Khoá van bi cấp nước
  - Rút điện

KHI VỀ:
  - Mở van, cắm điện
  - MỞ VÒI XẢ NƯỚC MỘT LÚC trước khi uống
  - Chú ý chất lượng nước; nếu thấy bất thường → gọi hậu mãi
```

---


<a id="p3-8"></a>
## 8. NHỮNG GÌ KHÁCH THƯỜNG HIỂU NHẦM

| Khách nghĩ | Thực tế |
|---|---|
| *"Máy có bình chứa nước lọc"* | **Không.** Máy tankless — lọc và đun trực tiếp theo dòng chảy. Chỉ có **bình đun** cho nước nóng |
| *"Bột đen trong nước là máy hỏng"* | Là **bột than từ lõi carbon mới**. Bình thường, xả tới khi nước trong |
| *"`C1` là mã lỗi"* | `C1` là **chế độ xả rửa**, hoàn toàn bình thường |
| *"`EL` là mã lỗi"* | `EL` = máy đang **tự bơm bù nước vào bình đun**. Bình thường |
| *"Thay lõi xong là dùng được ngay"* | Phải **reset (giữ nút 3 giây)** rồi **xả rửa 8 phút** (`C2`) |
| *"Lõi lọc được bảo hành"* | **Không.** Lõi là **vật tư tiêu hao**. Mô-đun tiệt trùng và adapter cũng **không được bảo hành** |
| *"Đèn báo đỏ mới cần quan tâm"* | **Nháy đỏ** đã là lúc cần đặt lõi. Đợi đỏ liên tục mới đặt thì bị gián đoạn |
| *"Máy dùng nước giếng khoan được"* | **Chỉ nước máy đô thị.** Nước giếng cần hệ tiền xử lý phía trước, nếu không lõi tắc rất nhanh |
| *"Lắp cho quán cà phê / văn phòng cũng như nhà"* | HDSD ghi rõ **chỉ dùng gia đình**, không lắp nơi tiêu thụ nước cao. Lắp sai có thể ảnh hưởng bảo hành |
| *"Nước 95 độ là nước sôi 100 độ"* | Là **95 °C**. Máy còn tự học điểm sôi theo vùng — ở nơi cao so với mực nước biển, nhiệt độ tối đa sẽ thấp hơn |

---


<a id="p3-9"></a>
## 9. SỐ CẦN NHỚ CHO KHÁCH

| Việc | Thao tác |
|---|---|
| Lấy nước nóng | `LOCK` → nút nhiệt độ |
| Đổi nhiệt độ cài sẵn | Giữ `LOCK` + nút đó **3 giây** |
| Xả bình đun | `LOCK` → nút xả |
| Reset sau thay lõi | Giữ nút lõi **3 giây** |
| Reset mô-đun tiệt trùng | Giữ `WARM` + `UV` **3 giây** → hiện `SA` |
| Vào chế độ ghép nối Wi-Fi | Giữ nút Wi-Fi **3 giây** |
| Chờ xả rửa lần đầu (`C1`) | **16 phút** |
| Chờ xả rửa sau thay lõi (`C2`) | **8 phút** |
| 🔴 Có sự cố | **Rút điện + khoá van bi 3 ngã** rồi gọi hotline |

---

<a id="p4"></a>

# PHẦN 4 — SAFETY DATABASE

> **PKB v1.2 · 28/08/2026** · Nguồn chính: **S1 — HDSD chính hãng Ver.26.08.14**, mục *Các lưu ý an toàn* + *Vận hành, chăm sóc và bảo dưỡng*
> **Dùng cho:** kỹ thuật lắp đặt · CSKH · sale (phần điều kiện lắp đặt) · biên soạn tài liệu bàn giao khách
> **Nguyên tắc:** file này **chỉ chép lại yêu cầu của hãng**, không thêm khuyến nghị tự nghĩ. Mọi dòng đều truy được về HDSD.

---


<a id="p4-1"></a>
## 1. PHÂN LOẠI MỨC RỦI RO

| Mức | Ký hiệu | Nghĩa | Hành động |
|---|---|---|---|
| **N1 — CẢNH BÁO** | 🔴 | Có thể gây **thương tích nghiêm trọng hoặc thiệt hại tài sản** (điện giật, cháy, bỏng, ngập nước) | Dừng ngay, không tự xử lý, gọi kỹ thuật |
| **N2 — THẬN TRỌNG** | 🟠 | Có thể **làm hỏng máy hoặc ảnh hưởng chất lượng nước** | Khắc phục trước khi dùng tiếp |
| **N3 — LƯU Ý** | 🟡 | Ảnh hưởng **tuổi thọ, hiệu suất, trải nghiệm** | Nhắc khách trong buổi bàn giao |

---


<a id="p4-2"></a>
## 2. 🔴 N1 — CẢNH BÁO AN TOÀN ĐIỆN & CHÁY NỔ

| ID | Yêu cầu của hãng | Hậu quả nếu vi phạm | Nguồn |
|---|---|---|---|
| `SF-01` | **Phải cắm vào ổ cắm có nối đất đúng cách**, theo tiêu chuẩn quốc gia hiện hành. Máy thuộc **Cấp bảo vệ Class I** | Điện giật · đoản mạch · hoả hoạn | S1 |
| `SF-02` | **Ổ cắm phải chịu được dòng lớn hơn dòng định mức của máy.** Không dùng nguồn vượt quá yêu cầu định mức (máy 2.100 W) | Quá nhiệt · hoả hoạn | S1 |
| `SF-03` | **Không chạm phích cắm bằng tay ướt** | Điện giật | S1 |
| `SF-04` | **Ngắt nguồn điện trước khi lắp đặt** | Điện giật | S1 |
| `SF-05` | **Không làm hỏng dây nguồn hoặc ổ cắm.** Nếu dây nguồn hỏng, **chỉ NSX / bộ phận dịch vụ của NSX / người có chuyên môn được thay** | Điện giật · đoản mạch · hoả hoạn | S1 |
| `SF-06` | **Không đặt vật nặng lên máy, không che phủ máy** | Cản trở tản nhiệt → quá nhiệt · hoả hoạn | S1 |
| `SF-07` | **Để máy tránh xa ngọn lửa trần** | Biến dạng · nóng chảy · rò rỉ · nguy cơ cháy | S1 |
| `SF-08` | **Không lắp ở nơi nhiệt độ cao hoặc độ ẩm cao** | Hỏng sản phẩm · điện giật · đoản mạch · hoả hoạn | S1 |
| `SF-09` | **Không để chất ăn mòn tiếp xúc với máy** | Hỏng bộ phận tiếp xúc nước → **chất độc hại xâm nhập đường nước, nước bị nhiễm bẩn** | S1 |

---


<a id="p4-3"></a>
## 3. 🔴 N1 — CẢNH BÁO NƯỚC & NGẬP

| ID | Yêu cầu của hãng | Hậu quả nếu vi phạm | Nguồn |
|---|---|---|---|
| `SF-10` | **Đường xả nước cô đặc không được tắc nghẽn.** Không vận hành máy nếu hệ thống thoát nước bị tắc | Nước cô đặc **chảy ngược vào máy → nhiễm bẩn các bộ phận bên trong**; hoặc nước thải tràn ra gây thiệt hại | S1 |
| `SF-11` | **Khi máy trục trặc: rút phích cắm + khoá nguồn cấp nước NGAY.** Không tiếp tục vận hành thiết bị bị lỗi | Lan rộng sự cố | S1 |
| `SF-12` | **Khi lắp ống nước: cắm ống vào hết cỡ trong đầu nối nhanh TRƯỚC, rồi mới lắp kẹp giữ ống. KHÔNG được bỏ qua kẹp** | Bung ống → ngập tủ bếp | S1 |
| `SF-13` | **Ngắt điện + khoá van ngay** khi: đường ống/bộ phận rò rỉ · bộ phận không hoạt động bình thường · **bất kỳ bộ phận điện nào rò điện** · bất kỳ tình trạng bất thường nào khác | Điện giật · ngập nước | S1 |
| `SF-14` | **Giữ máy ở tư thế thẳng đứng.** Không đặt hoặc vận hành lộn ngược | Hỏng máy · rò rỉ | S1 |
| `SF-15` | **Khoá van bi cấp nước khi không sử dụng thiết bị** | Giảm rủi ro rò rỉ khi vắng nhà | S1 |

---


<a id="p4-4"></a>
## 4. 🟠 N2 — ĐIỀU KIỆN VẬN HÀNH BẮT BUỘC

| ID | Điều kiện | Giá trị | Nếu vi phạm | Nguồn |
|---|---|---|---|---|
| `SF-16` | **Nguồn nước** | **Chỉ nước máy đô thị** | Nước giếng khoan / nước bể lâu ngày / nước nhiều sắt phèn → **lõi tắc rất nhanh**, cần hệ tiền xử lý phía trước | S1 |
| `SF-17` | **Nhiệt độ nước vào** | **5 – 38 °C**, không vượt quá 38 °C | Ảnh hưởng màng lọc | S1 |
| `SF-18` | **Nhiệt độ môi trường** | **4 – 40 °C**. ⛔ **Không vận hành dưới 4 °C** | Đóng băng · hỏng máy | S1 |
| `SF-19` | **Áp lực nước vào** | **0,1 – 0,4 MPa**. Ngoài phạm vi này **phải liên hệ nhà cung cấp dịch vụ** | Dưới 0,1 MPa: máy không tạo nước · Trên 0,4 MPa: **ngoại lực/áp suất vượt giới hạn = MẤT BẢO HÀNH** (`F-G04`) | S1 |
| `SF-20` | **Vị trí lắp** | ⛔ **Không lắp ngoài trời** · ⛔ **Không lắp dưới ánh nắng trực tiếp** | Nắng trực tiếp **đẩy nhanh lão hoá bộ phận bên ngoài, rút ngắn tuổi thọ** | S1 |
| `SF-21` | **Đường ống** | Không bẻ gập ống trong lắp đặt và vận hành | Hạn chế lưu lượng · không ra nước nóng | S1 |
| `SF-22` | **Xả rửa** | **Bắt buộc xả rửa trước lần dùng đầu tiên** và **sau thời gian không sử dụng** | Chất lượng nước | S1 |
| `SF-23` | **Đối tượng sử dụng** | ⛔ **Chỉ dùng trong gia đình.** Không lắp ở nơi công cộng có mức tiêu thụ nước cao | Tuổi thọ lõi tính theo mức dùng hộ gia đình — nơi tiêu thụ cao sẽ hết lõi rất nhanh và **có thể ảnh hưởng bảo hành** (lắp sai HDSD) | S1 |
| `SF-24` | **Lõi lọc** | Chỉ dùng lõi được **General Water Technology (HongKong) Co., Ltd. phê duyệt** | *"Việc sử dụng linh kiện không được uỷ quyền có thể làm hỏng thiết bị và **sẽ làm mất hiệu lực bảo hành**"* | S1 |

---


<a id="p4-5"></a>
## 5. 🔴 RỦI RO BỎNG — NƯỚC 95 °C

> Máy cấp nước tới **95 °C**. Đây là rủi ro an toàn duy nhất mà **khách gặp hằng ngày**, phải nói rõ trong buổi bàn giao.

| ID | Cơ chế bảo vệ của máy | Chi tiết | Nguồn |
|---|---|---|---|
| `SF-25` | **Khoá trẻ em luôn bật** | Phải chạm **LOCK** trước rồi mới chạm nút nhiệt độ. Trẻ chạm bừa 1 nút **không ra nước nóng** | S1 |
| `SF-26` | **Tự khoá lại** | Khoá tự bật lại sau **5 giây** không thao tác, hoặc sau khi lấy nước xong | S6 |
| `SF-27` | **Khoá chỉ chặn nước nóng** | Nước nhiệt độ phòng vẫn lấy được 1 chạm — trẻ vẫn uống được nước mà không chạm được nước sôi | S6 |
| `SF-28` | **Chỉ 1 mức nhiệt hoạt động tại một thời điểm** | Khi chọn 1 mức, 2 nút nhiệt còn lại **bị vô hiệu hoá** → giảm bấm nhầm | S1 |
| `SF-29` | **Rơ-le nhiệt bảo vệ chống đun cạn** | Có trên sơ đồ điện — ngắt mâm nhiệt khi bình đun cạn nước | S1 |

**Nội dung bắt buộc nói khi bàn giao nhà có trẻ nhỏ:**
> *"Máy ra nước tới 95 độ. Để lấy nước nóng phải chạm nút khoá trước rồi mới chạm nút nhiệt độ — hai bước. Khoá tự bật lại sau vài giây nên bé chạm một nút sẽ không ra nước nóng. Nhưng anh/chị vẫn nên dặn bé không nghịch vòi, vì không có cơ chế nào thay được người lớn trông."*

⛔ **Không được nói:** *"máy an toàn tuyệt đối với trẻ em"* (xem **Phần 2** mục 3).

---


<a id="p4-6"></a>
## 6. 🟠 QUY TRÌNH KHẨN CẤP

### 6.1 Phát hiện rò rỉ nước / máy báo `E7`

```
1. NGẮT ĐIỆN (rút phích cắm)
2. KHOÁ VAN BI CẤP NƯỚC 3 NGÃ (hoặc van nước tổng của nhà)
3. Lau khô khu vực, kiểm tra mức độ ngập
4. GỌI KỸ THUẬT — không tự tháo lắp
5. KHÔNG cắm điện lại cho tới khi kỹ thuật kiểm tra
```

### 6.2 Máy báo `E3` (bảo vệ chống tràn)

```
1. Chạm nút "Refresh" (nút xả bình nước nóng) để xả bình đun
2. Khởi động lại máy
3. Nếu tái diễn 2 lần liên tiếp → GỌI KỸ THUẬT
```
> Theo quy cách S6: nếu phát hiện tràn **2 lần liên tiếp**, máy yêu cầu **cấp lại nguồn** mới khôi phục.

### 6.3 Nghi ngờ rò điện

```
1. KHÔNG chạm vào máy hay vòi
2. Ngắt aptomat của khu vực bếp (không rút phích bằng tay ướt)
3. Khoá van cấp nước
4. GỌI KỸ THUẬT ngay
```

### 6.4 Nước có mùi/vị lạ bất thường

```
1. Ngừng uống
2. Kiểm tra đèn báo lõi (nháy đỏ / đỏ liên tục?)
3. Xả bỏ nước một lúc rồi thử lại
4. Nếu vẫn lạ → ngừng dùng, gọi kỹ thuật, KHÔNG tự pha hoá chất vệ sinh vào máy
```

### 6.5 Đi vắng dài ngày

```
TRƯỚC KHI ĐI:  khoá van bi cấp nước + rút điện
KHI VỀ:        mở van, cắm điện, MỞ VÒI XẢ NƯỚC MỘT LÚC trước khi uống
               chú ý chất lượng nước; nếu có lo ngại → gọi hậu mãi
```

---


<a id="p4-7"></a>
## 7. 🟡 N3 — LƯU Ý DÙNG HẰNG NGÀY

| ID | Lưu ý | Nguồn |
|---|---|---|
| `SF-30` | **Mỗi sáng nên mở vòi xả bỏ lượng nước tồn trong máy qua đêm trước lần dùng đầu tiên** | S1 |
| `SF-31` | **Giữ mặt vòi luôn khô ráo.** Nước đọng trên mặt vòi có thể tạo mạch cảm ứng giữa 2 phím và **kích hoạt nhầm chế độ xả rửa (`C1`)** | S7 |
| `SF-32` | **Lõi đã dùng không thể rửa hay tái chế.** Thải như chất thải rắn sinh hoạt, giao người có chuyên môn xử lý | S1 |
| `SF-33` | **Thay lõi định kỳ.** Lõi và vòng đệm kín là **vật tư dùng một lần**, phải thay kịp thời sau khi hết tuổi thọ | S1 |
| `SF-34` | **Ống PE và đầu nối là chi tiết lão hoá** — khuyến nghị thay mỗi **24 tháng**, **tính phí theo giá thị trường** | S1 |
| `SF-35` | **Bột than đen và bọt khí trong nước lúc mới lắp là BÌNH THƯỜNG.** Tiếp tục xả cho đến khi nước trong | S1 |
| `SF-36` | **Không tự tháo dỡ hoặc sửa đổi máy** — mất bảo hành và có rủi ro an toàn. Khi có bộ phận hỏng, gọi hotline để nhân viên hậu mãi thay | S1 |

---


<a id="p4-8"></a>
## 8. AN TOÀN TRONG LẮP ĐẶT (dành cho kỹ thuật)

| ID | Yêu cầu | Nguồn |
|---|---|---|
| `SF-37` | **Phải do thợ lắp đặt chuyên nghiệp thực hiện** | S1 |
| `SF-38` | **Không đấu nguồn nước hoặc nguồn điện trước khi hoàn tất lắp đặt** | S1 |
| `SF-39` | **Kiểm tra đủ phụ kiện trước khi lắp** (đối chiếu danh mục đóng gói `F-J02`) | S1 |
| `SF-40` | Dụng cụ bắt buộc: mỏ lết · máy khoan điện · **mũi khoan Ø30 mm** · tua vít 4 cạnh + dẹt · dao cắt ống · cờ lê 14~16 mm · cờ lê 19~21 mm · kìm mỏ nhọn | S1 |
| `SF-41` | Vòi lắp **thẳng hàng theo phương đứng với thân máy**; cần **mặt phẳng bán kính 3,8 cm** quanh lỗ | S1 |
| `SF-42` | **Sau khi đấu xong: kiểm tra lại toàn bộ một lần nữa** trước khi cấp nước/điện | S1 |
| `SF-43` | **Chạy thử bắt buộc:** mở van + cắm điện + mở vòi xả toàn hệ thống → đóng vòi → **kiểm tra bơm tăng áp có dừng không** + **kiểm tra mọi mối nối có rò không** | S1 |
| `SF-44` | Sau lắp máy hiện **`C1`** → chạm nút lấy nước → **xả rửa ~16 phút** trước khi dùng | S1 |
| `SF-45` | Đường nước cô đặc phải dẫn ra **ống thoát nước hoặc phễu thoát sàn**, ghi rõ trên sơ đồ: *"không được để tắc"* | S1 |
| `SF-46` | **Ống thông hơi phải đi thẳng lên/xuống, không được võng xuống rồi lên lại.** Nước ngưng đọng ở điểm thấp gây bí khí → **vòi tự chảy nước không cần bấm** | S7 |
| `SF-47` | Ống thông hơi **quá dài** hoặc **bị xoắn trong ống đỡ tròn của vòi** cũng gây bí khí. Cắt về độ dài phù hợp; kiểm tra thông thoáng bằng cách **thổi hơi qua ống** | S7 |

---


<a id="p4-9"></a>
## 9. BẢNG TRA NHANH — "KHI NÀO PHẢI DỪNG MÁY NGAY"

| Hiện tượng | Dừng ngay? | Việc phải làm |
|---|---|---|
| Rò rỉ nước ở bất kỳ đâu / báo `E7` | 🔴 **CÓ** | Ngắt điện + khoá van + gọi kỹ thuật |
| Nghi rò điện, tê tay khi chạm vòi | 🔴 **CÓ** | Ngắt aptomat + gọi kỹ thuật |
| Dây nguồn/phích cắm hỏng, sờn | 🔴 **CÓ** | Ngắt điện + gọi kỹ thuật (⛔ không tự thay dây) |
| Đường thoát nước cô đặc bị tắc | 🔴 **CÓ** | Không vận hành cho tới khi thông |
| Máy phát ra mùi khét, nóng bất thường | 🔴 **CÓ** | Ngắt điện + gọi kỹ thuật |
| Nước ra có mùi/vị lạ bất thường | 🟠 Ngừng uống | Kiểm tra đèn lõi → gọi kỹ thuật |
| Báo `E5` (gia nhiệt bất thường) | 🟠 | Tắt/bật lại 1 lần; còn lỗi → gọi kỹ thuật |
| Báo `E8` / `E9` (đầu dò, cảm biến) | 🟠 | Gọi kỹ thuật |
| Báo `E1`, `E2` | 🟡 | Tắt nguồn, kiểm tra cáp vòi, bật lại |
| Báo `E3` | 🟡 | Xả bình nóng → khởi động lại |
| Báo `E4` | 🟡 | **Kiểm tra van cấp nước đã mở chưa** |
| Báo `C1`, `C2`, `SA`, `EL` | 🟢 **Không** | Trạng thái bình thường — xem **Phần 5** |

---


<a id="p4-10"></a>
## 10. NỘI DUNG BÀN GIAO KHÁCH (checklist kỹ thuật ký nhận)

- [ ] Hướng dẫn **2 bước lấy nước nóng** (LOCK → nút nhiệt) và **rủi ro bỏng 95 °C**
- [ ] Chỉ vị trí **van bi 3 ngã** và cách khoá khi có sự cố / đi vắng
- [ ] Chỉ vị trí **phích cắm** và cách ngắt điện an toàn
- [ ] Giải thích **đèn báo lõi 2 cấp** (nháy đỏ → đỏ liên tục) trên vòi và trên thân máy
- [ ] Nói rõ **lõi lọc, mô-đun tiệt trùng, adapter KHÔNG được bảo hành** (`F-G03`)
- [ ] Nói rõ **ống PE và đầu nối thay mỗi 24 tháng, có tính phí** (`SF-34`)
- [ ] Dặn **lau khô mặt vòi** (`SF-31`) và **xả nước tồn mỗi sáng** (`SF-30`)
- [ ] Dặn **chỉ dùng nước máy đô thị** (`SF-16`)
- [ ] Hướng dẫn quy trình **đi vắng dài ngày** (mục 6.5)
- [ ] Giao **phiếu bảo hành + hoá đơn gốc**, dặn giữ (`F-G05`)
- [ ] Ghép nối **app G+ Life** nếu khách muốn
- [ ] Ghi số **hotline hậu mãi** vào nơi khách thấy được

---

<a id="p5"></a>

# PHẦN 5 — LỖI THƯỜNG GẶP & CÁCH XỬ LÝ

> **PKB v1.2 · 28/08/2026** · Nguồn chuẩn để tra mã lỗi: **S1 — HDSD chính hãng Ver.26.08.14**
> **Dùng cho:** CSKH tổng đài · kỹ thuật hiện trường · chatbot
> ⚠️ **Quy tắc:** khi tài liệu kỹ thuật nội bộ (S6) và HDSD (S1) ghi khác nhau về ý nghĩa mã lỗi → **luôn dùng S1**. Xem bảng đối chiếu ở **Phần 8 · Bảng 4**.

---


<a id="p5-1"></a>
## 1. BẢNG MÃ HIỂN THỊ TRÊN VÒI

### 1.1 Mã trạng thái BÌNH THƯỜNG (🟢 không phải lỗi — trấn an khách ngay)

| Mã | Nghĩa | Nói với khách | Kỹ thuật cần biết | Nguồn |
|---|---|---|---|---|
| `C1` | Chế độ xả rửa lần đầu | *"Đây là bước xả rửa sau lắp đặt, hoàn toàn bình thường. Anh/chị chạm nút lấy nước rồi chờ khoảng 16 phút."* | Cưỡng bức xả 16 phút: 8 phút nước thường + tối đa 8 phút xả bình đun. Mất điện giữa chừng → **đếm lại từ đầu** | S1, S6 |
| `C2` | Xả rửa sau khi reset lõi | *"Máy đang xả rửa lõi mới, chờ 8 phút là xong."* | Chạm nút **nước nhiệt độ phòng** để bắt đầu. Mỗi lõi: xả 30 giây + ra nước 5 phút | S1, S6 |
| `SA` | Đã reset mô-đun tiệt trùng thành công | *"Máy đã ghi nhận, bình thường ạ."* | Hiện 1 lần kèm 1 tiếng bíp sau khi giữ `WARM` + `UV` 3 giây | S1 |
| `EL` | **Mực nước trong bình đun xuống mức thấp** — máy đang tự bơm bù | *"Máy đang tự châm nước vào bình đun, chút nữa hết ạ."* | Nháy 1Hz, **không kêu bíp**. Trong lúc này máy **tạm dừng ra nước nóng và tạm dừng gia nhiệt** cho tới khi đủ nước. ⚠️ **Không có trong HDSD** — chỉ có ở S6/S7 | S6, S7 |

> 🔴 **Sai lầm phổ biến của CSKH:** coi `C1` và `EL` là lỗi rồi cử kỹ thuật đi. **Cả hai đều là trạng thái bình thường.**

### 1.2 Mã LỖI (🔴)

| Mã | Nghĩa (S1) | Khách tự làm được | Khi nào cử kỹ thuật | Nguồn |
|---|---|---|---|---|
| `E1` | Lỗi truyền thông vòi thông minh | Tắt nguồn → kiểm tra cáp vòi có lỏng không → khởi động lại | Còn lỗi sau 1 lần khởi động lại | S1 |
| `E2` | Bất thường truyền thông bo mạch hiển thị | Tắt nguồn → khởi động lại | Còn lỗi sau 1 lần | S1 |
| `E3` | Kích hoạt bảo vệ chống tràn | Chạm nút **"Refresh"** (xả bình nước nóng) → khởi động lại | **Tái diễn 2 lần liên tiếp** (S6: máy yêu cầu cấp lại nguồn mới khôi phục) | S1, S6 |
| `E4` | Sản xuất nước bất thường | **Kiểm tra van cấp nước đã mở chưa** (van bi 3 ngã + van nước lạnh) | Van đã mở hết mà vẫn `E4` | S1 |
| `E5` | Gia nhiệt bất thường | Tắt nguồn → bật lại | **Còn lỗi sau 1 lần** → cử kỹ thuật | S1 |
| `E7` | **Rò rỉ nước** | 🔴 **Tắt điện + khoá van NGAY**, kiểm tra ống có hỏng không | **Luôn luôn cử kỹ thuật** | S1 |
| `E8` | Bất thường đầu dò bình đun | ❌ | **Luôn cử kỹ thuật** | S1 |
| `E9` | Bất thường cảm biến NTC | ❌ | **Luôn cử kỹ thuật** | S1 |

> 🔵 **Nội bộ — cơ chế phía sau (S6, tham khảo, không đọc cho khách):**
> `E4` còn được kích hoạt khi bơm tăng áp chạy liên tục **2 giờ** (bảo vệ quá thời gian) hoặc khi máy phát hiện mực nước vượt mức thấp nhưng **quá 5 phút chưa đạt mức cao**.
> `E5` kích hoạt khi bơm nước nóng không chạy quá **10 phút**. Gia nhiệt quá **3 phút mà nhiệt độ không đổi** cũng dừng đun.
> `E8` = NTC gia nhiệt hở mạch hoặc ngắn mạch. `E9` = NTC hơi nước hở mạch hoặc ngắn mạch. Cả hai đều **tắt toàn bộ chức năng**.

### 1.3 Mã ⛔ KHÔNG hướng dẫn khách

| Mã | Nghĩa | Vì sao chặn |
|---|---|---|
| `SC` | Xác nhận **khôi phục cài đặt gốc** (giữ `ECO` + `nước thường` 10 giây) | **Xoá toàn bộ dữ liệu đếm tuổi thọ lõi.** Chỉ kỹ thuật viên thực hiện, và phải ghi lại số ngày/số lít đã dùng trước khi reset |
| `F1` `F2` `F3` | Mã dự phòng, chưa gán chức năng | Không có ý nghĩa vận hành |

---


<a id="p5-2"></a>
## 2. BẢNG SỰ CỐ — HIỆN TƯỢNG → NGUYÊN NHÂN → XỬ LÝ

*(Nguồn: HDSD Ver.26.08.14, mục 5 — Khắc phục sự cố)*

| # | Khách báo | Nguyên nhân có thể | Xử lý | Ai làm |
|---|---|---|---|---|
| 1 | **Máy không khởi động** | Chưa cắm điện / chưa bật công tắc | Kiểm tra phích cắm và công tắc nguồn | Khách |
| 2 | **Máy không khởi động** | Lỗi bộ chuyển nguồn (adapter) | Liên hệ hậu mãi | Kỹ thuật |
| 3 | **Máy đã dừng nhưng nước thải vẫn chảy** | Lỗi van điện từ cấp nước vào | Liên hệ hậu mãi | Kỹ thuật |
| 4 | **Rò rỉ nước** | Lõi hoặc ống nước chưa đấu nối đúng | Kiểm tra lõi đã lắp đúng chưa, mối nối ống đã chắc chưa | Kỹ thuật |
| 5 | **Rò rỉ nước** | Đường ống hoặc bộ phận bị hư hỏng | 🔴 Ngắt điện + khoá van bi 3 ngã ngay → liên hệ hậu mãi | Khách + Kỹ thuật |
| 6 | **Chất lượng nước kém** | Lỗi lõi lọc | Thay lõi hoặc liên hệ hậu mãi | Khách/Kỹ thuật |
| 7 | **Chất lượng nước kém** | Chất lượng nước cấp kém | Kiểm tra nước máy đầu vào, **cân nhắc lắp hệ tiền xử lý** | Kỹ thuật khảo sát |
| 8 | **Không ra nước nhiệt độ phòng** | Van nước lạnh hoặc van bi 3 ngã chưa mở | Mở van tương ứng | Khách |
| 9 | **Không ra nước nhiệt độ phòng** | Ống nước bị gập | Kiểm tra ống cấp, ống nước cô đặc, ống nước tinh khiết | Kỹ thuật |
| 10 | **Lưu lượng nước thường thấp** | Van bi 3 ngã chưa mở **hết** | Mở hoàn toàn van cấp nước | Khách |
| 11 | **Lưu lượng nước thường thấp** | Lõi lọc bị tắc | Thay lõi hoặc liên hệ hậu mãi | Khách/Kỹ thuật |
| 12 | **Không ra nước nóng hoặc yếu** | Bơm ly tâm bị hút khí | **Lặp lại thao tác lấy nước nóng vài lần** | Khách |
| 13 | **Không ra nước nóng hoặc yếu** | Vòi thông minh trục trặc | Liên hệ hậu mãi | Kỹ thuật |
| 14 | **Không ra nước nóng hoặc yếu** | Ống nước nóng hoặc ống thông hơi bị gập | Kiểm tra hai ống này | Kỹ thuật |

---


<a id="p5-3"></a>
## 3. SỰ CỐ HIỆN TRƯỜNG (không có trong HDSD)

> **Nguồn:** S7 — Thông báo kỹ thuật hậu mãi của NSX (`Những lưu ý khi lắp đặt máy All-in-one heater · 23-3`), soạn sau khi số lượng máy lắp đặt tăng và có nhiều phản hồi từ hiện trường.
> 🔵 **Hạng C** — dùng để chẩn đoán, không đưa lên tài liệu xuất bản.

### 3.1 Máy tự vào chế độ xả rửa `C1` liên tục

| Mục | Nội dung |
|---|---|
| **Hiện tượng** | Máy đang dùng bình thường thì màn hình hiện `C1` và tự vào chế độ xả rửa |
| **Nguyên nhân thật** | **Giọt nước lớn đọng trên mặt vòi** tạo mạch cảm ứng nối giữa **phím nước thường** và **phím tiết kiệm điện** → kích hoạt trạng thái xuất xưởng → máy vào chế độ xả rửa khởi động |
| **Xử lý ngay** | Chạm nút **nước nhiệt độ phòng**, xả rửa theo quy trình máy mới **16 phút** là dùng lại bình thường |
| **Phòng ngừa** | **Giữ mặt vòi luôn khô. Có nước đọng thì lau ngay.** Đây là câu bắt buộc nói khi bàn giao |

> 🟢 **Đây là sự cố hiện trường số 1 của dòng máy này.** CSKH nghe khách báo "máy tự chạy xả nước" → hỏi ngay *"mặt vòi có đọng nước không anh/chị?"* trước khi cử kỹ thuật.

### 3.2 Vòi tự chảy nước liên tục dù không bấm nút

| Mục | Nội dung |
|---|---|
| **Hiện tượng** | Không thao tác gì mà vòi vẫn chảy nước liên tục |
| **Nguyên nhân thật** | **Ống thông hơi bị bí áp** — bình đun không xả được hơi |
| **Kiểm tra** | ① Ống thông hơi có **quá dài** → bị gập hoặc xoắn? ② Ống có **võng xuống rồi lên lại** → nước ngưng đọng ở điểm thấp gây bí khí? ③ Ống có bị **xoắn bên trong ống đỡ tròn của vòi**? |
| **Xử lý** | Cắt ống về độ dài phù hợp, đi **thẳng lên – thẳng xuống**, tuyệt đối **không võng xuống giữa chừng**. Kiểm tra thông thoáng bằng cách **thổi hơi qua ống** |

### 3.3 Lỗ thông hơi trên vòi nhỏ nước liên tục

| Mục | Nội dung |
|---|---|
| **Hiện tượng** | Ngoài miệng vòi, trên vòi còn có **lỗ thông hơi** để bình đun xả hơi nóng. Lỗ này nhỏ nước liên tục |
| **Nguyên nhân A** | **Kiểm soát mực nước cao trong bình đun bị lỗi** → nước nóng tràn ra theo lỗ thông hơi |
| **Xử lý A** | Bấm nút **"Mỗi ngày tươi mới" / Refresh** để xả cạn bình đun cho tới khi màn hình hiện **`EL`**, máy sẽ tự bơm bù về mức bình thường |
| **Nguyên nhân B** | **Ống mềm bên trong vòi bị tuột** |
| **Dấu hiệu nhận biết B** | Ngoài lỗ thông hơi, **phần dưới thân vòi cũng có nước chảy ra** |
| **Xử lý B** | Cử kỹ thuật — tháo vòi, lắp lại ống mềm |

---


<a id="p5-4"></a>
## 4. KỊCH BẢN CSKH — HỎI TRƯỚC KHI CỬ KỸ THUẬT

> Mục tiêu: lọc được các ca khách tự xử lý được, tránh cử kỹ thuật đi vô ích. **Ghi lại câu trả lời của khách vào ticket.**

| Khách báo | Hỏi theo thứ tự | Nếu là… thì… |
|---|---|---|
| **"Máy không chạy"** | 1. Phích cắm đã cắm chưa?<br>2. Công tắc/aptomat có bật không?<br>3. Đèn trên thân máy có sáng gì không? | Đèn không sáng gì → nghi adapter → **cử kỹ thuật** |
| **"Không ra nước thường"** | 1. Van bi 3 ngã dưới bồn rửa đã mở chưa?<br>2. Van nước lạnh có mở không?<br>3. Màn hình vòi hiện mã gì? | Hiện `E4` → hỏi lại van<br>Van đã mở mà vẫn không ra → **cử kỹ thuật** (nghi ống gập) |
| **"Nước chảy yếu"** | 1. Van đã mở **HẾT** chưa?<br>2. Đèn lõi đang màu gì?<br>3. Yếu từ bao giờ — đột ngột hay giảm dần? | Đèn đỏ → **bán lõi**<br>Giảm dần + đèn xanh → nghi tắc lõi sớm do nước đầu vào → **khảo sát** |
| **"Không ra nước nóng"** | 1. Đã chạm **LOCK** trước chưa?<br>2. Màn hình có nháy (đang đun) không?<br>3. Thử lấy lại **3–4 lần** liên tiếp xem sao?<br>4. Có hiện `EL` không? | Thử lại thì ra → **bơm hút khí, bình thường**<br>Hiện `EL` → **đang bơm bù, chờ**<br>Vẫn không ra → **cử kỹ thuật** |
| **"Máy tự chạy / tự xả nước"** | 1. Màn hình có hiện `C1` không?<br>2. **Mặt vòi có đọng nước không?** | Có `C1` + mặt vòi ướt → **hướng dẫn lau khô + xả 16 phút, KHÔNG cử kỹ thuật** (mục 3.1) |
| **"Vòi tự chảy không bấm"** | 1. Nước chảy ra từ **miệng vòi** hay **lỗ thông hơi**? | Lỗ thông hơi → mục 3.3<br>Miệng vòi → mục 3.2, **cử kỹ thuật kiểm tra ống thông hơi** |
| **"Máy dừng nhưng vẫn chảy nước thải"** | — | **Cử kỹ thuật ngay** (van điện từ) |
| **"Rò rỉ nước"** | 1. 🔴 **Hướng dẫn tắt điện + khoá van NGAY** trước khi hỏi tiếp<br>2. Rò ở đâu — thân máy, mối nối, hay vòi?<br>3. Có hiện `E7` không? | **Luôn cử kỹ thuật** |
| **"Nước có vị lạ / mùi lạ"** | 1. Đèn lõi màu gì?<br>2. Máy lắp bao lâu rồi?<br>3. Có phải mới lắp không (bột than)? | Mới lắp + có bột đen → **bình thường, xả tiếp**<br>Đèn đỏ → **thay lõi**<br>Đèn xanh + máy cũ → **cử kỹ thuật** |
| **"Nước có bột đen / bọt khí"** | 1. Máy mới lắp phải không? | Mới lắp → **BÌNH THƯỜNG**, xả tới khi nước trong (`SF-35`) |

---


<a id="p5-5"></a>
## 5. QUY TẮC LEO THANG

| Mức | Điều kiện | Thời hạn phản hồi | Ai xử lý |
|---|---|---|---|
| **P1 — Khẩn** | Rò rỉ nước (`E7`) · nghi rò điện · ngập tủ bếp · mùi khét | Gọi lại trong **1 giờ**, có mặt trong **24 giờ** | Kỹ thuật trưởng |
| **P2 — Cao** | Máy không ra nước hoàn toàn · `E5`/`E8`/`E9` · máy dừng nhưng vẫn chảy nước thải | Gọi lại trong **4 giờ**, có mặt trong **48 giờ** | Kỹ thuật |
| **P3 — Trung bình** | Lưu lượng yếu · nước có vị lạ · `E1`/`E2`/`E3` tái diễn · đèn lõi đỏ cần thay | Gọi lại trong **1 ngày làm việc** | CSKH → Kỹ thuật |
| **P4 — Thấp** | Hỏi cách dùng · ghép app · `C1`/`C2`/`SA`/`EL` · lau vòi | Xử lý ngay trên điện thoại | CSKH |

> 🔴 **Ràng buộc tồn kho:** kho hiện **0 lõi USH10** (`F-K08`) và **chưa từng bán bộ lõi màng nào** (`F-K06`).
> ⛔ **Không hứa "bên em có sẵn, thay ngay".**
> ✅ Câu chuẩn: *"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay."*
> Lý do: **hứa rồi không có hàng** là nguyên nhân số 1 khiến khách Việt mất niềm tin vào hãng lọc nước. Thà hẹn chậm mà đúng.

---


<a id="p5-6"></a>
## 6. NHỮNG GÌ CSKH KHÔNG ĐƯỢC HƯỚNG DẪN KHÁCH TỰ LÀM

| ⛔ Không hướng dẫn | Vì sao |
|---|---|
| Khôi phục cài đặt gốc (`SC`) | Xoá dữ liệu đếm lõi |
| Tháo vòi, tháo ống thông hơi | Rủi ro ngập + mất bảo hành (tự tháo dỡ) |
| Tự thay dây nguồn / adapter | HDSD quy định chỉ NSX hoặc người có chuyên môn |
| Tự tháo thân máy, mở nắp ngoài nắp trước | Mất bảo hành (`F-G04`) |
| Đổ hoá chất/nước tẩy vào máy để "vệ sinh" | Chất ăn mòn → nhiễm bẩn đường nước (`SF-09`) |
| Rửa lại lõi cũ để dùng tiếp | HDSD ghi rõ lõi đã dùng **không thể rửa hay tái chế** (`F-C24`) |
| Dùng lõi ngoài / lõi không chính hãng | **Mất bảo hành** (`F-C25`) |
| Lắp máy ở quán/văn phòng đông người | HDSD ghi rõ chỉ dùng gia đình (`SF-23`) |

---


<a id="p5-7"></a>
## 7. MẪU GHI TICKET

```
Mã máy:            [GTUN-8600HP-G / GTUN-8600VNHP]
Ngày lắp:          
Còn bảo hành:      [Còn / Hết — 8/11 máy đã hết BH toàn máy]
Mã trên màn hình:  [C1/C2/SA/EL/E1..E9/không có]
Đèn lõi:           [xanh / nháy đỏ / đỏ liên tục]
Đèn Status:        [xanh liên tục / nháy chậm / tắt]
Đèn WiFi:          [xanh / nháy chậm]
Mặt vòi có ướt:    [có / không]        ← bắt buộc hỏi nếu báo C1
Van bi 3 ngã:      [mở hết / mở một phần / chưa mở]
Đã thử tắt-bật:    [có / chưa]
Phân loại:         [P1 / P2 / P3 / P4]
Cần lõi:           [không / lõi thô / lõi màng]  ← nếu cần thì KIỂM TRA TỒN KHO TRƯỚC KHI HẸN
```

---

<a id="p6"></a>

# PHẦN 6 — BỘ HỎI–ĐÁP ĐÃ KIỂM CHỨNG

> **PKB v1.2 · 28/08/2026** · Dùng cho: **Sale · CSKH · Chatbot · Livestream · Inbox**
> **Cách dùng:** mỗi câu có **① Ngắn** (chat/điện thoại) và **② Đầy đủ** (gặp trực tiếp/livestream).
> Ô 🔒 là **lưu ý nội bộ — không đọc cho khách**. Mã `F-xxx` truy về **Phần 1**.
> ⚠️ **Đọc **Phần 2** trước khi dùng file này.**

---


<a id="p6-1"></a>
## BẢNG CẤM NÓI — RÚT GỌN, ĐỌC TRƯỚC MỖI CA TRỰC

| ⛔ Không được nói | ✅ Nói thay bằng |
|---|---|
| "Diệt khuẩn 99,999%" | "Có mô-đun tiệt trùng đặt ngay trên đường nước ra vòi" |
| "Cao nhất / duy nhất / tốt nhất / số 1" | Nêu con số cụ thể, để khách tự so |
| Tên mã lõi (PCFB, NF700, LX-…) | "Lõi thô" / "lõi màng lọc nano" |
| Công dụng khoáng với sức khoẻ | "Giữ lại khoáng tự nhiên có trong nước" — dừng ở đó |
| "Mức nhiệt 75 độ" | "Nước thường, 45, 85, 95 độ" |
| "Lõi bền 4 năm" (như cam kết) | "Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo" |
| "Áp lực 0 MPa cũng chạy" | "Cần áp lực 0,1–0,4 MPa" |
| "Máy để bàn" | "Máy âm tủ bếp" |
| Con số tỷ lệ thu hồi nước (69/77/76,8%) | ⛔ Không nói con số nào |
| Số hiệu TÜV (kể cả số đúng) | "Em xin gửi anh/chị bằng văn bản" — ⛔ không đưa link tự tra (`F-I16`) |
| "Nước nóng ra sau 2,8 giây" | "Rót 100 ml nước nóng khoảng 2,8 giây" |
| Trộn số lõi màng (8.600/12.240) với số lõi thô (6.630/10.200) | Chọn 1 con số cho 1 thông điệp |

---


<a id="p6-2"></a>
## NHÓM 1 — TỔNG QUAN


<a id="q1"></a>
### Q1. USH10 là máy gì? Đặt ở đâu?

**① Ngắn:** Máy lọc nước nóng công nghệ lọc nano, **lắp âm trong tủ bếp**, chỉ có vòi cảm ứng lộ trên mặt bàn. Lấy được cả nước nhiệt độ phòng và nước nóng 3 mức, không cần đun lại. `F-A02` `F-A06`

**② Đầy đủ:** USH10 là máy lọc nước **âm tủ bếp** dùng màng lọc nano. Toàn bộ thân máy giấu dưới bồn rửa, trên mặt bàn chỉ có một vòi cảm ứng thông minh. Máy lọc và đun **trực tiếp theo dòng chảy — không có bình chứa nước lọc**, nên không có chuyện nước tồn lâu trong bình. Bấm là ra nước, chọn được nhiệt độ phòng hoặc 45 / 85 / 95 độ. `F-C02` `F-E01`

---


<a id="q2"></a>
### Q2. Máy chiếm bao nhiêu chỗ trong tủ bếp?

**① Ngắn:** Máy rộng **17,9 cm**. Kích thước đầy đủ **467 × 179 × 477 mm**. `F-B01`

**② Đầy đủ:** Máy rộng đúng **179 mm** — con số quan trọng với tủ bếp chung cư, vì gầm chậu rửa thường đã bị ống xi phông và giỏ rác chiếm chỗ. Sâu 467 mm, cao 477 mm. Anh/chị đo khoang trống dưới chậu, lọt được chiều rộng 18 cm là lắp được. `F-B02`

> 🔒 Brochure còn ghi yêu cầu tủ **cao ≥550 mm, sâu ≥530 mm** (`F-B19`) và deck NSX gợi ý chừa hở **≥10 cm** (`F-B20`) — cả hai **không có trong HDSD**, dùng để hỏi số đo trước khi chốt, **không lên hình**. HDSD chỉ quy định lỗ khoan vòi **Ø30 mm** + mặt phẳng bán kính **3,8 cm** (`F-B18`).

---


<a id="q3"></a>
### Q3. Máy này lọc bằng công nghệ gì? Có phải RO không?

**① Ngắn:** **Không phải RO.** Máy dùng **màng lọc nano**, lỗ lọc 0,001 µm — lọc sạch nhưng **vẫn giữ lại khoáng tự nhiên** trong nước. `F-C05` `F-C07`

**② Đầy đủ:** Máy RO lọc theo kiểu chặn hết, nước ra gần như tinh khiết hoàn toàn nên mất luôn khoáng. USH10 dùng **màng lọc nano tích điện**: vẫn chặn kim loại nặng như chì, asen, cadimi, chặn vi khuẩn, chặn chất hữu cơ — nhưng **cho khoáng tự nhiên đi qua**. Nước uống vào vẫn có vị, không bị "nhạt" như nước RO. `F-C06` `F-C08`

> 🔒 8 khoáng giữ lại: Canxi · Magie · Natri · Kali · Kẽm · Selen · Stronti · Axit metasilicic (`F-C10`). **Chỉ liệt kê tên, tuyệt đối không nói công dụng.** Khách hỏi công dụng → *"Cái này em không tư vấn được vì liên quan sức khoẻ, anh/chị hỏi bác sĩ sẽ chuẩn hơn. Em chỉ khẳng định máy giữ lại chứ không loại bỏ."*

---


<a id="q4"></a>
### Q4. Máy có mấy lõi lọc? Lọc qua mấy bước?

**① Ngắn:** **2 lõi — 4 bước lọc.** `F-C01`

**② Đầy đủ:**
- **Lõi 1 (lõi thô tổng hợp):** lọc cặn lắng, rỉ sét, hạt lơ lửng; hấp phụ clo dư và mùi khó chịu. Đồng thời **bảo vệ lõi màng phía sau**. `F-C04`
- **Lõi 2 (lõi màng lọc nano):** chặn kim loại nặng (chì, asen, cadimi), vi khuẩn (E. coli), chất hữu cơ (tricloromethane, carbon tetraclorua) — và **giữ lại khoáng**. `F-C06`

Chỉ 2 lõi nên thay nhanh, ít tốn công — khác các máy 7–9 lõi phải nhớ nhiều mốc.

> 🔒 ⛔ Không đọc mã lõi. Khách hỏi "lõi tên gì để tôi mua ngoài" → *"Lõi này là lõi chuyên dụng của máy, bên em cung cấp trực tiếp. Hướng dẫn sử dụng ghi rõ dùng lõi không chính hãng thì máy mất bảo hành."* (`F-C25`)

---


<a id="q5"></a>
### Q5. Máy dùng được cho quán cà phê / văn phòng không?

**① Ngắn:** HDSD ghi máy **chỉ dành cho gia đình**. Nếu anh/chị dùng cho quán, bên em cần khảo sát và tư vấn giải pháp phù hợp hơn.

**② Đầy đủ:** Hướng dẫn sử dụng của hãng ghi rõ: *"Sản phẩm này chỉ dành cho sử dụng trong gia đình và không nên lắp đặt ở những nơi có mức tiêu thụ nước cao."* Tuổi thọ lõi được tính theo mức dùng của một hộ gia đình. Lắp ở nơi tiêu thụ cao thì lõi hết rất nhanh và có thể ảnh hưởng bảo hành. `F-C21` `SF-23`

> 🔒 **Đây là câu phải nói thật, không lách.** Thực tế GWT đã có case F&B (PIN Cafe 33 Hàng Hòm, The Ghé Coffee Q1 — `F-K12`) nhưng đó là **quyết định thương mại riêng**, không phải khuyến nghị của hãng. Nếu khách F&B vẫn muốn mua → chuyển phòng kinh doanh để có thoả thuận riêng về chu kỳ lõi, **đừng tự hứa**.

---


<a id="p6-3"></a>
## NHÓM 2 — NƯỚC NÓNG


<a id="q6"></a>
### Q6. Máy có mấy mức nhiệt?

**① Ngắn:** **4 chế độ:** nước nhiệt độ phòng · **45 °C** · **85 °C** · **95 °C**. `F-E01`

**② Đầy đủ:**

| Nút | Nhiệt độ | Hãng thiết kế cho |
|---|---|---|
| Nước thường | nhiệt độ phòng | uống trực tiếp, nấu ăn, rửa rau quả |
| **WARM** | **45 °C** | pha sữa |
| **EX WARM** | **85 °C** | pha trà |
| **HOT** | **95 °C** | pha cà phê, mì, nước sôi |

Màn hình trên vòi hiện **nhiệt độ nước nóng theo thời gian thực**. `F-E24`

> 🔒 ⛔ **KHÔNG có mức 75 °C** (`F-E02`). Nhiều tài liệu cũ ghi sai "45/75/85/95" — đang sửa. Nếu lỡ nói thì đính chính ngay. Beat "75 độ pha trà xanh" trong kịch bản cũ → chuyển sang **85 °C**.

---


<a id="q7"></a>
### Q7. Chọn nhiệt độ thế nào? Trẻ con bấm nhầm có sao không?

**① Ngắn:** Có **khoá trẻ em**. Muốn ra nước nóng phải chạm **LOCK** trước rồi mới chạm nút nhiệt độ — trẻ bấm một nút thì không ra nước nóng. `F-E04`

**② Đầy đủ:** Quy trình lấy nước nóng luôn là **2 bước**: chạm LOCK mở khoá → chạm nút nhiệt độ. **Khoá tự bật lại sau vài giây** không thao tác, nên mỗi lần lấy nước nóng đều phải mở khoá lại — đây là thiết kế cố ý. Riêng **nước nhiệt độ phòng** chạm 1 nút là ra ngay, không cần mở khoá, nên bé vẫn tự uống nước được. `F-E05` `F-E07` `F-E08`

> 🔒 ⛔ **Không nói "an toàn tuyệt đối cho trẻ em"** (**Phần 2** mục 3). Cách nói đúng: mô tả cơ chế, rồi thêm *"nhưng vẫn nên dặn bé không nghịch vòi"*.

---


<a id="q8"></a>
### Q8. Chỉnh nhiệt độ được không hay cố định?

**① Ngắn:** Mỗi nút được cài sẵn một mức. Muốn đổi thì giữ **LOCK + nút đó 3 giây**. `F-E03`

**② Đầy đủ:** Máy đặt sẵn 45 / 85 / 95 độ cho ba nút. Muốn đổi thì giữ đồng thời LOCK + nút cần đặt trong 3 giây. Khi chọn một mức, hai nút còn lại tạm bị vô hiệu hoá — để tránh bấm nhầm.

---


<a id="q9"></a>
### Q9. Đun được bao nhiêu nước một giờ? Chờ có lâu không?

**① Ngắn:** **20 lít/giờ**. Rót nước nóng ở tốc độ **2,1 L/phút**. Máy đun trực tiếp theo dòng chảy, không phải chờ đun cả bình. `F-B07` `F-B05`

**② Đầy đủ:** Công suất làm nóng **20 L/giờ**, mâm nhiệt 2.000 W. Tốc độ rót nước nóng là **2,1 L/phút** — khoảng **2,8 giây cho một cốc 100 ml**. Máy **không có bình chứa nước lọc**; nước được đun trong bình đun riêng, nên không phải đợi "sôi cả ấm" như bình thuỷ điện. `F-E30`

> 🔒 **QUAN TRỌNG — O-06.** *"2,8 giây"* là **tốc độ rót**, KHÔNG phải thời gian chờ nước nóng. ⛔ **Không nói "nước nóng ra sau 2,8 giây"** — đó là diễn đạt sai đang lan trong tài liệu marketing VN.
> 🔒 20 L/giờ và 2,1 L/phút không mâu thuẫn: 2,1 L/phút là tốc độ rót đợt ngắn từ bình đun, 20 L/giờ là năng suất đun bền vững (`F-L07`).

---


<a id="q10"></a>
### Q10. Máy có giữ nóng liên tục không? Tốn điện không?

**① Ngắn:** Máy có **chế độ tiết kiệm điện** — sau một khoảng không thao tác thì tự ngừng giữ ấm. `F-E21`

**② Đầy đủ:** Ở chế độ giữ ấm, máy giữ nước ở nhiệt độ đã cài và tự đun lại khi nguội. Nếu không ai dùng trong một khoảng thời gian, máy **tự chuyển sang chế độ tiết kiệm điện — không giữ ấm nữa**. Bấm nút là bật/tắt được thủ công. Khi cần nước nóng, máy đun lại từ đầu.

> 🔒 ⚠️ **O-05 — số giờ đang mâu thuẫn.** Deck NSX và quy cách kỹ thuật đều ghi **3 giờ**; marketing VN ghi 2 giờ; HDSD quốc tế **không nhắc chế độ này**. ⛔ **Tạm không đọc số giờ cho khách** cho tới khi GWT chốt. Nói *"sau một khoảng thời gian không dùng"* là đủ.

---


<a id="p6-4"></a>
## NHÓM 3 — TIỆT TRÙNG & AN TOÀN NƯỚC


<a id="q11"></a>
### Q11. Máy có tiệt trùng không? Đặt ở đâu?

**① Ngắn:** Có. Máy có **mô-đun tiệt trùng** lắp **nối tiếp ngay trên đường nước đi ra vòi** — xử lý ở đoạn cuối cùng, sát miệng vòi nhất. `F-D05`

**② Đầy đủ:** Đây là chi tiết đáng chú ý về mặt kỹ thuật. Nhiều máy đặt đèn diệt khuẩn ở **bình chứa** — nước xử lý xong vẫn nằm trong bình rồi chảy qua một đoạn ống dài trước khi tới vòi. USH10 đặt mô-đun tiệt trùng **trên chính đoạn ống nước tinh khiết chạy từ thân máy lên vòi**, theo đúng hướng dẫn lắp đặt của hãng: cắt ống nước tinh khiết, đầu vào nối cổng nước tinh khiết của máy, đầu ra nối đoạn ống **gần vòi nhất**.

Lý do quan trọng: **tia UV không có tác dụng tồn lưu** — nó chỉ xử lý nước đang đi qua, không "để dành" được. Nên đặt càng gần điểm uống thì càng đúng nguyên lý.

Trên vòi có **nút UV** kèm đèn báo: **sáng trắng** = còn hạn · **nháy trắng** = sắp hết hạn. `F-E15`

> 🔒 **QUAN TRỌNG:**
> - ✅ **ĐƯỢC nói** máy có mô-đun tiệt trùng và nói vị trí — HDSD chính hãng Ver.26.08.14 ghi ở **5 chỗ độc lập** (danh mục đóng gói, sơ đồ điện, sơ đồ xử lý nước, bước lắp đặt số 4, nút vòi + reset `SA`) và điều khoản bảo hành còn loại trừ *"đèn diệt khuẩn tia cực tím"*.
> - ⛔ **CẤM tuyệt đối con số "99,999%"** — phiếu SGS `ASH18-029858-01` chưa có; phiếu SGS đang lưu là của máy khác (50B04). `F-I10`
> - ⚠️ **O-01 chưa đóng:** GWT chưa xác nhận máy bán tại VN đi kèm bản HDSD nào. Bản Trung Quốc **không có** mô-đun này. Nếu khách mở HDSD ra mà không thấy → xử lý: *"Em kiểm tra lại cấu hình đúng của lô máy này và báo lại anh/chị."*
> - Góc kể chuyện *"đặt ở đâu quan trọng hơn có hay không"* là **an toàn nhất** vì dựa trên nguyên lý phổ thông + HDSD, **không cần chứng nhận nào**.

---


<a id="q12"></a>
### Q12. Nước để lâu trong máy có bị tù không?

**① Ngắn:** Không. Máy có **chức năng không đọng nước** — lâu không dùng thì nước tồn trong lõi **tự quay về lọc lại**. `F-E11`

**② Đầy đủ:** Máy tự xử lý ba việc:
1. **Chức năng không đọng nước:** khi một thời gian không ai lấy nước, phần nước tinh khiết còn tồn trong lõi **tự động quay ngược về để lọc lại**.
2. **Tự xả rửa màng theo lịch:** máy định kỳ tự làm sạch bề mặt màng, anh/chị không phải vệ sinh gì. `F-E09`
3. **Nút xả bình đun** — 1 chạm là xả sạch nước tồn trong bình nước nóng. `F-E17`

Ngoài ra máy **không có bình chứa nước lọc**, nên không tồn tại "bình nước để qua đêm".

> 🔒 HDSD vẫn khuyến nghị **mỗi sáng xả bỏ nước tồn qua đêm trước lần dùng đầu tiên** (`SF-30`). **Nên nói thật với khách như một mẹo dùng, đừng giấu** — nó tăng độ tin cậy chứ không làm yếu sản phẩm.

---


<a id="q13"></a>
### Q13. Nước lọc rồi uống trực tiếp được không?

**① Ngắn:** Được. Máy thiết kế để uống trực tiếp tại vòi.

**② Đầy đủ:** Nước sau lọc uống trực tiếp được. Anh/chị chọn nút nước thường để uống mát, hoặc 95 độ nếu muốn nước sôi pha trà/cà phê.

> 🔒 ⛔ **Không trích chuẩn nào cụ thể** (QCVN 6-1:2010, CJ94-2005…) khi chưa có phiếu thử trong tay (`F-I13`). Khách hỏi tiếp về tiêu chuẩn → xử lý như **Q28**.

---


<a id="p6-5"></a>
## NHÓM 4 — VÒI THÔNG MINH


<a id="q14"></a>
### Q14. Vòi có gì đặc biệt?

**① Ngắn:** Vòi cảm ứng toàn phím, **màn hình hiện nhiệt độ thời gian thực**, **khoá trẻ em**, **đèn nhắc thay lõi**, nút xả bình nước nóng, **xoay 120°**, chuẩn **IPX4**. `F-E26` `F-E27`

**② Đầy đủ:** Vòi là bảng điều khiển chính của máy:
- **Màn hình** hiện nhiệt độ nước nóng hiện tại; nháy = đang gia nhiệt, tắt = không gia nhiệt
- **4 nút chọn chế độ nước** (thường / 45 / 85 / 95)
- **Nút LOCK** — khoá trẻ em
- **Nút UV** — trạng thái mô-đun tiệt trùng
- **Đèn báo lõi lọc** — trắng = còn hạn · nháy đỏ = sắp hết · đỏ liên tục = phải thay
- **Nút xả bình nước nóng** — chạm LOCK rồi chạm nút này
- **Xoay 120°** (±60°), thân vòi tròn nên xoay nhiều góc
- **Chuẩn chống nước IPX4**, **bo mạch phủ keo 100%**
- Mặt hiển thị công nghệ **IMD** — hiển thị rõ, chống mài mòn
- Có **2 màu: đen và bạc** `F-E28` `F-E29` `F-E31`

---


<a id="q15"></a>
### Q15. Làm sao biết khi nào phải thay lõi?

**① Ngắn:** Máy tự báo bằng đèn. **Nháy đỏ** = sắp tới hạn, chuẩn bị lõi. **Đỏ liên tục** = phải thay ngay. `F-E12`

**② Đầy đủ:** Có **3 chỗ báo**: trên vòi, trên thân máy, và **thông báo trên điện thoại qua app**. `F-E14`

| Đèn | Ý nghĩa |
|---|---|
| Trắng / xanh liên tục | Lõi còn trong hạn — không cần làm gì |
| **Nháy đỏ** | Sắp hết hạn → **đặt lõi trước để không bị gián đoạn** |
| **Đỏ liên tục** | Hết hạn → thay ngay |

Máy **đếm theo cả số ngày lẫn lượng nước đã lọc**, cái nào tới trước tính cái đó — chứ không chỉ đếm ngày. Nhà dùng nhiều thì lõi báo sớm hơn, dùng ít thì lâu hơn. `F-C18`

> 🔒 Beat mạnh: *"lõi đo bằng LÍT chứ không chỉ đo bằng THÁNG"* — đi ngược lợi ích người bán nên rất đáng tin. ⛔ Nhưng **không trộn số của lõi màng (8.600/12.240) với số của lõi thô (6.630/10.200)** trong cùng một câu — khác cấp bộ phận. Chọn **một con số cho một thông điệp** (`F-C17`).

---


<a id="p6-6"></a>
## NHÓM 5 — LÕI LỌC & CHI PHÍ


<a id="q16"></a>
### Q16. Bao lâu thay lõi một lần? Hết bao nhiêu tiền?

**① Ngắn:** Lõi thô khoảng **12 tháng** (~2.750.000 đ), lõi màng khoảng **48 tháng** (~7.500.000 đ). Máy tự báo khi tới hạn. `F-C14` `F-C15` `F-H02` `F-H03`

**② Đầy đủ:**

| Lõi | Chu kỳ khuyến nghị | Giá tham khảo |
|---|---|---|
| Lõi thô tổng hợp | ~**12 tháng** | 2.750.000 đ |
| Lõi màng lọc nano | ~**48 tháng** | 7.500.000 đ |

Đây là **chu kỳ khuyến nghị, không phải hạn cứng**. Chất lượng nước từng khu vực ảnh hưởng rất nhiều — nước cứng hoặc nhiều cặn thì lõi hết sớm hơn. Vì thế máy đếm theo cả ngày lẫn lít và tự báo.

> 🔒 **CẢNH BÁO O-02 (chưa đóng):**
> - **12 / 48 tháng** là con số **GWT chốt**, khớp ngưỡng đếm trong Danh mục hàng hoá (360 ngày / 1.440 ngày).
> - **HDSD chính hãng ghi 6–12 tháng và 24–36 tháng** — ngắn hơn.
> - ⛔ **Không nói "cam kết 4 năm"**, **không nói "bảo đảm dùng được 48 tháng"**. Luôn dùng chữ *"chu kỳ khuyến nghị"* + *"máy tự đếm và báo"*.
> - Câu an toàn nhất để trích, nguyên văn HDSD: *"Chất lượng nước có ảnh hưởng đáng kể… Dữ liệu trên chỉ mang tính tham khảo."* (`F-C20`)

---


<a id="q17"></a>
### Q17. Khách mở HDSD ra và hỏi: "Sao sách ghi 24–36 tháng mà anh nói 48 tháng?"

> 🔒 **Câu khó nhất về lõi. Đọc kỹ.**

**Hướng trả lời — nói thật, không lách:**

> *"Hai con số đó nói hai chuyện khác nhau ạ. Hướng dẫn sử dụng đưa ra **khoảng khuyến nghị** dựa trên chất lượng nước trung bình, và bản thân hãng ghi rõ 'dữ liệu chỉ mang tính tham khảo'. Còn con số bên em công bố là **ngưỡng máy đếm** — máy đếm cả theo ngày lẫn theo lượng nước đã lọc, cái nào tới trước thì báo đèn.*
> *Thực tế thì cứ theo đèn: nháy đỏ là chuẩn bị lõi, đỏ liên tục là thay. Nếu nước nhà anh/chị nhiều cặn hoặc dùng nhiều, đèn sẽ báo sớm hơn mốc đó. Em không dám hứa con số cứng vì chính hãng cũng không hứa."*

⛔ **Không được nói:** *"HDSD ghi sai"* · *"sách của Trung Quốc khác"* · *"cứ dùng 4 năm thoải mái"*.

> 🔒 **Rủi ro thật cần biết:** máy chỉ bật đèn đỏ ở **1.440 ngày (48 tháng)**, trong khi hãng khuyến nghị thay ở **24–36 tháng**. Khách chỉ tin đèn sẽ thay **muộn hơn khuyến nghị của hãng**. Đây là mâu thuẫn chưa đóng (O-02) — nếu khách hỏi sâu, **chuyển kỹ thuật**, đừng tự giải thích thêm.

---


<a id="q18"></a>
### Q18. Thay lõi có phải gọi thợ không?

**① Ngắn:** **Tự thay được.** Mở nắp trước, xoay lõi ra, lắp lõi mới, rồi **giữ nút lõi 3 giây** để reset. `F-E18`

**② Đầy đủ:** Quy trình 6 bước, khoảng 5 phút:
1. Khoá van cấp nước và **rút điện**
2. Mở nắp trước
3. **Xoay lõi cũ ngược chiều kim đồng hồ** để tháo
4. Lắp lõi mới, **xoay thuận chiều kim đồng hồ** đến khi hai ký hiệu khớp
5. **Giữ nút lõi tương ứng 3 giây** — nghe 1 tiếng bíp, đèn về trạng thái ổn định là xong
6. Máy hiện **`C2`** → chạm nút nước thường → xả rửa **8 phút** → dùng bình thường `F-E19`

Lõi thiết kế **rút ngang** nên không phải kéo máy ra khỏi tủ. `F-C27`
Nếu anh/chị ngại thao tác thì gọi kỹ thuật bên em làm giúp.

> 🔒 Lỗi phổ biến nhất: **quên bước 5 (reset)** → máy vẫn báo đỏ dù đã thay lõi mới.

---


<a id="q19"></a>
### Q19. Ngoài lõi ra còn phải thay gì nữa không?

**① Ngắn:** Có — **ống PE và đầu nối**, hãng khuyến nghị thay **mỗi 24 tháng**, và khoản này **có tính phí**. `F-C26`

**② Đầy đủ:** HDSD ghi các chi tiết bằng nhựa là bộ phận chịu lão hoá, khuyến nghị thay định kỳ mỗi 24 tháng, tính phí theo giá thị trường. Em nói trước để anh/chị tính vào chi phí sử dụng chứ không để tới lúc đó mới báo.

> 🔒 **Bắt buộc nói trước khi bán.** Đây là khoản chi phí bị giấu ở hầu hết các hãng và là nguồn khiếu nại phổ biến.

---


<a id="q20"></a>
### Q20. Chi phí dùng máy trong 5 năm khoảng bao nhiêu?

**① Ngắn:** **Ước tính** khoảng **58–63 triệu** cho 5 năm (gồm cả tiền máy), tương đương **~32–35 nghìn/ngày**. `F-H05`

**② Đầy đủ:** Với gia đình 4 người dùng khoảng 6 lít nước uống/ngày:
- Tiền máy: 44.950.000 đ
- Lõi thô: thay 2–4 lần trong 5 năm ≈ 5,5–11 triệu
- Lõi màng: thay 1 lần ≈ 7,5 triệu
- **Tổng ≈ 58–63 triệu / 5 năm ≈ 32–35 nghìn/ngày**

So sánh: một bình nước đóng chai 20 lít khoảng 60–80 nghìn, gia đình 4 người dùng 2–3 bình/tháng, chưa kể nước nóng vẫn phải đun riêng.

> 🔒 Đây là **phép tính nội bộ hạng E**, GWT chưa chốt. **Phải nói rõ chữ "ước tính"**, ⛔ không đưa như bảng giá. ⚠️ Chưa chốt 44,95tr đã gồm VAT hay chưa, 8% hay 10% (O-07) — **hỏi phòng kinh doanh trước khi báo giá bằng văn bản**. Ước tính này **chưa gồm** tiền thay ống PE + đầu nối ở mốc 24 tháng.

---


<a id="p6-7"></a>
## NHÓM 6 — LẮP ĐẶT & VẬN HÀNH


<a id="q21"></a>
### Q21. Lắp đặt mất bao lâu? Cần đục đẽo gì không?

**① Ngắn:** Kỹ thuật bên em lắp. Chỉ cần **khoan 1 lỗ Ø30 mm** trên mặt bàn cho vòi — hoặc tận dụng lỗ vòi có sẵn. `F-B18`

**② Đầy đủ:** Toàn bộ do kỹ thuật viên chuyên nghiệp thực hiện:
- Lắp **van bi 3 ngã** vào đường nước lạnh sẵn có
- **Khoan 1 lỗ Ø30 mm** trên mặt bàn/chậu rửa cho vòi (cần mặt phẳng bán kính ~3,8 cm quanh lỗ). Chậu đã có sẵn lỗ vòi phù hợp thì dùng luôn
- Đặt thân máy trong tủ, đấu ống nước và cắm điện
- Đấu **đường xả nước cô đặc** ra ống thoát/phễu thoát sàn

Sau khi lắp, máy hiện **`C1`** và **tự xả rửa ~16 phút** trước khi dùng được. `F-E20`

---


<a id="q22"></a>
### Q22. Nhà tôi áp lực nước yếu, có dùng được không?

**① Ngắn:** Máy cần áp lực nước vào **từ 0,1 đến 0,4 MPa** (khoảng 1–4 bar). Ngoài khoảng này cần khảo sát thêm. `F-B08`

**② Đầy đủ:** HDSD quy định áp lực nước vào **0,1–0,4 MPa**, và ghi rõ nếu ngoài phạm vi này thì phải liên hệ nhà cung cấp dịch vụ. Nếu nhà anh/chị dùng nước bể ngầm bơm lên, hoặc ở tầng cao mà nước chảy yếu, nên để kỹ thuật bên em **khảo sát trước khi lắp** — có thể cần bơm tăng áp phụ trợ.
Bên trong máy đã có **bơm tăng áp** riêng, nhưng đó là bơm tạo áp cho màng lọc, **không thay thế được áp lực đầu vào**. `F-D07`

> 🔒 ⛔ Brochure cũ ghi *"0–0,4 MPa"* là **SAI** (mất ngưỡng dưới — `F-M02`). Tư vấn sai chỗ này dễ dẫn tới máy lắp xong không chạy.
> 🔒 ⚠️ Áp lực **vượt 0,4 MPa** thì rơi vào điều khoản *"ngoại lực và áp suất vượt giới hạn"* → **mất bảo hành** (`F-G04`). Nhà áp cao cũng phải khảo sát.

---


<a id="q23"></a>
### Q23. Máy có kén nguồn nước không? Nước giếng khoan được không?

**① Ngắn:** **Chỉ nước máy đô thị.** Nhiệt độ nước vào 5–38 °C. `F-B14` `F-B15`

**② Đầy đủ:** HDSD ghi rõ nguồn nước áp dụng là **nước máy đô thị**. Nước giếng khoan, nước bể chứa lâu ngày hoặc nước có sắt/phèn cao thì **cần lắp hệ tiền xử lý phía trước**, nếu không lõi sẽ tắc rất nhanh. Nếu nhà anh/chị dùng giếng khoan, bên em nên khảo sát và tư vấn hệ lọc tổng trước, rồi mới lắp USH10 ở khâu uống.

---


<a id="q24"></a>
### Q24. Máy có tốn điện không? Đi vắng có phải rút điện không?

**① Ngắn:** Công suất định mức **2.100 W**, nhưng chỉ ăn điện lúc đun. Đi vắng dài ngày thì **nên khoá nước và rút điện**. `F-B11`

**② Đầy đủ:** Máy dùng điện 220V/50Hz, công suất định mức 2.100 W — con số này là lúc mâm nhiệt hoạt động, không phải chạy liên tục cả ngày. Máy chỉ đun khi lấy nước nóng, và có chế độ tiết kiệm điện tự ngừng giữ ấm khi lâu không dùng.
Khi đi vắng dài ngày: **khoá van cấp nước và rút điện**. Lúc về, mở lại và **xả nước một lúc trước khi uống**. `SF-15`

---


<a id="q25"></a>
### Q25. Máy có phải nối đất không?

**① Ngắn:** Có. Máy thuộc **Cấp bảo vệ Class I**, **bắt buộc cắm vào ổ cắm có nối đất đúng cách**. `F-B13` `SF-01`

**② Đầy đủ:** HDSD ghi rõ đây là yêu cầu an toàn bắt buộc — không nối đất có thể dẫn đến điện giật, đoản mạch hoặc hoả hoạn. Ổ cắm cũng phải chịu được dòng lớn hơn dòng định mức của máy. Kỹ thuật bên em sẽ kiểm tra ổ cắm khi khảo sát.

---


<a id="p6-8"></a>
## NHÓM 7 — APP & KẾT NỐI


<a id="q26"></a>
### Q26. Máy kết nối điện thoại được không? Làm gì trên app?

**① Ngắn:** Có. Kết nối Wi-Fi, dùng app **G+ Life** — xem trạng thái máy, tuổi thọ lõi theo %, cảnh báo rò rỉ. `F-F02` `F-F07`

**② Đầy đủ:** Máy dùng công nghệ IoT Wifi-Combo, ghép nối với app **G+ Life**. Trên app xem được:
- Trạng thái máy và **tuổi thọ từng lõi theo phần trăm**
- **Cảnh báo rò rỉ nước**
- Giám sát chất lượng nước
- Hẹn giờ đun, xả rửa từ xa

**Ghép nối 7 bước, ~3 phút:** bật Bluetooth + kết nối Wi-Fi nhà → quét mã QR trên máy tải app → đăng ký tài khoản → bấm "Add Device" → **giữ nút trên máy 3 giây** → nhập mật khẩu Wi-Fi → xong. `F-F03`

**Đèn WiFi trên thân máy:** xanh liên tục = đã kết nối · nháy chậm = chưa kết nối. `F-F04`

---


<a id="p6-9"></a>
## NHÓM 8 — BẢO HÀNH & HẬU MÃI


<a id="q27"></a>
### Q27. Bảo hành bao lâu?

**① Ngắn:** **12 tháng toàn máy**, riêng **bơm và bo mạch điều khiển 5 năm** theo chính sách bên em. `F-G01` `F-G02`

**② Đầy đủ:**

| Hạng mục | Thời gian |
|---|---|
| Toàn máy | **12 tháng** (từ ngày hoá đơn / ngày lắp đặt) |
| Bơm + bo mạch điều khiển | **5 năm** (chính sách GWT) |

**Không thuộc phạm vi bảo hành:** lõi lọc và vật liệu lọc · **mô-đun/đèn tiệt trùng** · gioăng và chi tiết hao mòn · vỏ trang trí và lớp phủ · **bộ chuyển nguồn (adapter)**. `F-G03`

Anh/chị **giữ lại phiếu bảo hành và hoá đơn gốc** — đây là giấy tờ cần có khi yêu cầu bảo hành. `F-G05`

> 🔒 **QUAN TRỌNG:**
> - ⚠️ Cam kết **5 năm bơm + bo mạch** là **chính sách riêng của GWT, KHÔNG có trong HDSD hãng** (O-10) → đang xin văn bản nội bộ. Khách đòi bằng chứng → **đừng hứa miệng**, chuyển phòng kinh doanh.
> - ⚠️ **Phải nói rõ lõi lọc là vật tư tiêu hao, không bảo hành.** Nói mập mờ chỗ này là nguồn khiếu nại phổ biến nhất.
> - HDSD còn loại trừ: lắp/dùng sai hướng dẫn · tự tháo sửa · **dùng lõi không chính hãng** · **áp suất vượt giới hạn** · thiên tai. (`F-G04`)

---


<a id="q28"></a>
### Q28. "Máy có chứng nhận gì không? Cho tôi xem giấy tờ."

> 🔒 **CÂU NGUY HIỂM NHẤT. Đọc kỹ trước khi trả lời.**
> - Hồ sơ có **số hiệu nhưng thiếu file PDF**: TÜV Rheinland, VIETCERT, QCVN 6-1:2010/BYT (`F-I09` `F-I12` `F-I13`).
> - ✅ **Số hiệu TÜV đã chốt: `1111279087`** (`F-I01`). Số `1111297087` trong tài liệu nội bộ là **lỗi chép** — ID đó là của **HP Inc.**, không liên quan.
> - 🔴 **Nhưng vẫn ⛔ KHÔNG đọc số cho khách, và ⛔ KHÔNG gửi link Certipedia.** Trang tra cứu của ID đúng hiện ghi *"Currently no valid certificates are attached to this Certipedia ID"* (`F-I16`, `O-18`). Khách tra ra trang trống thì hỏng nặng hơn là không đưa số.
> - ⛔ **Không hứa "em gửi file ngay"** nếu chưa có trong tay.
> - Thứ **chắc chắn tra được ngay:** patent màng lọc **US 7138058** trên Google Patents (`F-C11`).

**Hướng trả lời:**
> *"Máy có chứng nhận TÜV Rheinland của Đức — bên kiểm định độc lập, họ thực hiện 57 thử nghiệm trên sản phẩm này, kiểm cả vật liệu tiếp xúc nước theo tiêu chuẩn EU và tiêu chuẩn LFGB của Đức. Điểm em thấy đáng chú ý là họ kiểm cả máy đã dùng lâu ngày chứ không chỉ máy mới.*
> *Công nghệ màng lọc cũng có bằng sáng chế US 7138058 — cái này anh/chị tra ngay được trên Google Patents.*
> *Còn bộ hồ sơ đầy đủ dạng file, em xin phép chuyển yêu cầu về phòng kỹ thuật để gửi anh/chị bản chính thức — em không muốn gửi tài liệu chưa được duyệt."*

> 🔒 Nội dung TÜV **được phép nói** (`F-I05`–`F-I08`): 57 thử nghiệm · chứng nhận "đặc tính vệ sinh" · vật liệu đạt 19 chỉ tiêu hoà tan kim loại nặng theo EN 14350 + 12 yêu cầu LFGB · kiểm E. coli, S. aureus, P. aeruginosa theo DIN EN 16889 **trên máy đã dùng lâu** · không phát hiện BPA, chất làm dẻo, melamine, formaldehyde, kim loại nặng.
> ⛔ **Không được suy ra** *"an toàn cho mẹ và bé"* — dù tài liệu marketing cũ có dùng cụm này (**Phần 2** mục 3).

---


<a id="q29"></a>
### Q29. Máy hỏng thì bao lâu có người tới? Có sẵn lõi không?

**① Ngắn:** Bên em có kỹ thuật hỗ trợ. Anh/chị gọi hotline, bên em sắp lịch.

> 🔒 **ĐIỂM YẾU — TRẢ LỜI CẨN THẬN:**
> - **Kho hiện tồn 0 lõi USH10** (`F-K08`) và **chưa từng bán bộ lõi màng nào** (`F-K06`). ⛔ **KHÔNG hứa "có sẵn hàng, thay ngay"**.
> - Câu an toàn: *"Lõi này là hàng nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay."*
> - Hứa rồi không có hàng là **pain point số 1** khiến khách VN mất niềm tin với hãng lọc nước. **Thà hẹn chậm mà đúng.**
> - ✅ **Điểm mạnh có thể nói:** *"11 máy đã lắp, chưa ghi nhận ca sự cố nào trong khoảng 2 năm."* (`F-K03`)

---


<a id="q30"></a>
### Q30. Máy dùng được bao lâu thì phải thay?

**① Ngắn:** HDSD ghi tuổi thọ sản phẩm và linh kiện khoảng **5–10 năm** trong điều kiện vận hành và bảo dưỡng đúng. `F-B17`

**② Đầy đủ:** Con số này là của hãng, kèm điều kiện *"vận hành và bảo dưỡng đúng cách"*. Trong đó lõi lọc và các bộ phận tiêu hao như vòng đệm kín là vật tư dùng một lần, phải thay kịp thời. Ống PE và đầu nối khuyến nghị thay mỗi 24 tháng.

> 🔒 ⛔ Không nói gọn thành *"máy dùng 10 năm"* — phải kèm cụm điều kiện.

---


<a id="p6-10"></a>
## NHÓM 9 — CÂU HỎI KHÓ (XỬ LÝ PHẢN ĐỐI)


<a id="q31"></a>
### Q31. "Máy này đắt quá, sao 45 triệu?"

**Hướng trả lời:** Không né giá — chuyển sang **chi phí theo ngày** và **gộp chức năng**.

> *"Em hiểu con số nghe lớn. Nhưng máy này gộp ba thứ: máy lọc nước, ấm đun siêu tốc, và bình thuỷ giữ nhiệt — mà không chiếm chỗ nào trên mặt bàn. Tính ra 5 năm, cả tiền máy lẫn tiền lõi, khoảng 32–35 nghìn một ngày. Anh/chị so với tiền nước bình đóng chai hàng tháng cộng tiền điện đun nước lại thì khoảng cách không xa như con số ban đầu."*

> 🔒 Thực tế máy đang bán ở mức **60–85% giá niêm yết** (`F-H06`), **chưa từng bán ở giá niêm yết**. Nhưng **chưa có bảng chiết khấu chính thức** (O-08) → ⛔ **sale không tự ra giá**, phải xin duyệt. **Đừng vội hạ giá trong câu đầu tiên**; xử lý bằng giá trị trước.

---


<a id="q32"></a>
### Q32. "Nano có lọc sạch bằng RO không?"

**Hướng trả lời:** Không so hơn–kém, mà so **mục tiêu khác nhau**.

> *"Hai công nghệ nhắm hai mục tiêu khác nhau chứ không phải cái nào hơn. RO chặn gần như mọi thứ nên nước ra rất tinh khiết — nhưng cũng mất luôn khoáng, và thải nhiều nước hơn. Màng nano chặn được kim loại nặng, vi khuẩn, chất hữu cơ — nhưng cho khoáng tự nhiên đi qua. Nếu anh/chị muốn nước sạch mà vẫn còn vị nước tự nhiên thì nano là hướng đó."*

---


<a id="q33"></a>
### Q33. "So với Karofi / Kangaroo / AO Smith thì sao?"

**Hướng trả lời:** Không nói xấu đối thủ. Nêu **3 điểm khác biệt cấu trúc**, để khách tự so.

> *"Em không tiện so sánh trực tiếp với hãng khác. Em nói ba điểm về máy bên em, anh/chị đối chiếu là rõ nhất:*
> 1. *Máy dùng **màng lọc nano giữ khoáng**, không phải RO — nước ra không bị nhạt.*
> 2. *Máy **âm tủ hoàn toàn**, mặt bàn chỉ có vòi — rộng 17,9 cm, lọt được gầm chậu chung cư.*
> 3. *Mô-đun tiệt trùng đặt **trên đường nước ra sát vòi**, không phải trong bình chứa — vì tia UV không có tác dụng tồn lưu."*

> 🔒 ⛔ Tuyệt đối không dùng "tốt hơn", "hơn hẳn", "duy nhất trên thị trường".

---


<a id="q34"></a>
### Q34. "Tôi quên thay lõi thì sao? Có hại không?"

**Hướng trả lời:** Trả lời thẳng — đây là câu tạo niềm tin.

> *"Có ảnh hưởng thật, nên máy mới có đèn báo hai cấp: nháy đỏ là để anh/chị kịp đặt lõi, đỏ liên tục là phải thay. Máy còn đếm theo cả lượng nước đã lọc chứ không chỉ đếm ngày, nên nhà dùng nhiều sẽ được báo sớm hơn. Hướng dẫn sử dụng cũng ghi rõ: dùng lõi hết hạn làm giảm hiệu suất lọc và ảnh hưởng chất lượng nước."*

> 🔒 Hiện `filter_replacement` **0 dòng** — chưa có nhật ký thay lõi thật. ⛔ Nếu hứa *"bên em chủ động gọi nhắc"* thì **phải có quy trình thật**, nếu không sẽ thành lời hứa suông.

---


<a id="q35"></a>
### Q35. "Sao chỉ có 2 lõi? Máy khác 7–9 lõi cơ mà."

**Hướng trả lời:** Đổi khung từ "số lượng" sang "chức năng".

> *"Số lõi không nói lên mức lọc, mà cấu trúc lõi mới nói. Lõi thứ nhất bên em là lõi tổng hợp — đã gộp sẵn màng PP, sợi carbon và than hoạt tính trong một thân, tức là ba lớp lọc trong một lõi. Lõi thứ hai là màng lọc nano. Cộng lại là bốn bước lọc trong hai lõi.*
> *Cái lợi thực tế là anh/chị chỉ phải nhớ hai mốc thay lõi thay vì bảy, và mỗi lần thay ít tốn tiền lẫn tốn công hơn."*

---


<a id="q36"></a>
### Q36. "Máy Trung Quốc gắn mác GE à?"

**Hướng trả lời:** Nói thẳng, không vòng vo.

> *"GE là nhãn hiệu của General Electric, sản phẩm được sản xuất theo giấy phép — cái này ghi ngay trên nhãn máy chứ không giấu. Điều em thấy đáng nói hơn là sản phẩm đã qua kiểm định của TÜV Rheinland — đây là tổ chức kiểm định độc lập của Đức, không liên quan tới nhà sản xuất."* `F-A09`

> 🔒 ⚠️ Hai bản HDSD ghi 2 nhà sản xuất khác nhau (O-01). ⛔ **Không nói chắc một cái tên cụ thể** cho tới khi GWT xác nhận.

---


<a id="q37"></a>
### Q37. "Nhà tôi có bé, nước này pha sữa được không?"

> 🔒 **CÂU PHẢI TRẢ LỜI ĐÚNG TỪNG CHỮ. Xem **Phần 2** mục 3.**

> *"Trên vòi có nút 45 độ, hãng thiết kế cho tình huống pha sữa và mình chọn được nhiệt độ chính xác thay vì đun rồi chờ nguội. Còn việc pha sữa cho bé thế nào cho đúng thì anh/chị theo hướng dẫn của hãng sữa và bác sĩ ạ — cái đó em không tư vấn được.*
> *Về mặt an toàn khi dùng, máy có khoá trẻ em: phải chạm nút khoá trước rồi mới chạm nút nhiệt độ, nên bé chạm bừa một nút sẽ không ra nước nóng."*

⛔ **Cấm nói:** "45 độ là nhiệt độ chuẩn pha sữa" · "nước này tốt cho bé" · "an toàn cho trẻ sơ sinh" · "đạt chuẩn mẹ và bé".

---


<a id="q38"></a>
### Q38. "Máy này có làm nước kiềm / ion kiềm không?"

**① Ngắn:** Không. USH10 là máy lọc nano có nước nóng, **không phải máy điện giải ion kiềm**.

**② Đầy đủ:** Hai loại máy khác nhau hoàn toàn về mục tiêu. Máy điện giải tạo nước kiềm bằng điện phân. USH10 lọc bằng màng nano và giữ lại khoáng tự nhiên vốn có trong nước, không tạo thêm gì cả.

> 🔒 ⛔ Không bình luận về công dụng của nước kiềm dưới bất kỳ hình thức nào (**Phần 2** mục 3.4).

---


<a id="q39"></a>
### Q39. "Máy có đo TDS không? Sao số TDS lệch với máy đo cầm tay của tôi?"

**① Ngắn:** Máy có cảm biến TDS nội bộ. Máy đo cầm tay và cảm biến máy có sai số khác nhau nên lệch vài đơn vị là bình thường.

**② Đầy đủ:** Máy có cảm biến TDS trên đường nước tinh khiết để theo dõi chất lượng lọc. Số hiển thị có dải sai số cho phép, và máy đo cầm tay ngoài thị trường cũng có sai số riêng. Nếu chênh lệch nhiều bất thường, anh/chị báo bên em cử kỹ thuật kiểm tra.

> 🔒 Sai số TDS theo quy cách (`F-D14`, không đọc số cho khách): 0–10 → ±2 · 10–50 → ±5 · 50–100 → ±10 · 100–200 → ±20 · 200–300 → ±30.
> 🔒 ⛔ **Không dùng chỉ số TDS thấp làm bằng chứng "nước sạch"** — TDS đo tổng chất rắn hoà tan, bao gồm cả khoáng có lợi. Máy nano **cố ý giữ khoáng** nên TDS sẽ **cao hơn** máy RO. Nếu khách so TDS với máy RO, giải thích chỗ này.

---


<a id="q40"></a>
### Q40. "Nhà tôi ở tầng cao / vùng núi, nước 95 độ có ra đúng 95 không?"

**① Ngắn:** Máy **tự học điểm sôi tại khu vực lắp đặt** và điều chỉnh theo. Ở nơi cao so với mực nước biển, nhiệt độ tối đa sẽ thấp hơn — đó là quy luật vật lý, không phải lỗi máy. `F-E23`

**② Đầy đủ:** Nước sôi ở nhiệt độ thấp hơn khi lên cao — ở đâu cũng vậy, không riêng máy này. Máy có cơ chế tự nhận biết điểm sôi tại nơi lắp đặt và tự điều chỉnh mức nhiệt tối đa cho phù hợp, để không đun quá mức gây lãng phí điện.

---


<a id="p6-11"></a>
## NHÓM 10 — TRA NHANH CHO CSKH


<a id="p6-12"></a>
## Mã hiển thị trên vòi

| Mã | Nghĩa | Hướng dẫn khách |
|---|---|---|
| `C1` | Xả rửa lần đầu | 🟢 **Bình thường** — chạm nút lấy nước, chờ ~16 phút |
| `C2` | Xả rửa sau thay lõi | 🟢 **Bình thường** — chờ 8 phút |
| `SA` | Đã reset mô-đun tiệt trùng | 🟢 Bình thường |
| `EL` | Đang bơm bù nước vào bình đun | 🟢 **Bình thường** — chờ một lát |
| `E1` | Vòi mất tín hiệu | Tắt nguồn, kiểm tra cáp vòi, bật lại |
| `E2` | Lỗi bo mạch hiển thị | Tắt nguồn, bật lại |
| `E3` | Bảo vệ chống tràn | Chạm "Refresh" xả bình nóng, khởi động lại |
| `E4` | Bất thường tạo nước | **Kiểm tra van cấp nước đã mở chưa** |
| `E5` | Lỗi gia nhiệt | Tắt/bật lại → còn lỗi thì báo kỹ thuật |
| `E7` | **Rò rỉ nước** | 🔴 **Tắt điện + khoá nước NGAY**, báo kỹ thuật |
| `E8` | Lỗi đầu dò bình đun | Báo kỹ thuật |
| `E9` | Lỗi cảm biến nhiệt | Báo kỹ thuật |


<a id="p6-13"></a>
## Sự cố — hỏi khách trước khi cử kỹ thuật

| Khách báo | Hỏi kiểm tra trước |
|---|---|
| Máy không chạy | Phích cắm đã cắm? Aptomat đã bật? Đèn thân máy có sáng gì? |
| Không ra nước thường | Van bi 3 ngã đã mở? Ống có gập? Màn hình hiện mã gì? |
| Nước chảy yếu | Van đã mở **hết**? Đèn lõi màu gì? Yếu đột ngột hay giảm dần? |
| Không ra nước nóng | Đã chạm LOCK chưa? Thử lấy lại 3–4 lần (bơm có thể hút khí). Có hiện `EL` không? |
| **Máy tự chạy / tự xả nước** | **Có hiện `C1` không? MẶT VÒI CÓ ĐỌNG NƯỚC KHÔNG?** → lau khô + xả 16 phút, **không cần cử kỹ thuật** |
| Vòi tự chảy không bấm | Chảy từ **miệng vòi** hay **lỗ thông hơi**? → nghi ống thông hơi bí áp |
| Máy dừng nhưng vẫn chảy nước thải | → Báo kỹ thuật (van điện từ) |
| Rò rỉ nước | 🔴 **Tắt điện + khoá van ngay** → báo kỹ thuật |
| Nước có vị lạ | Đèn lõi màu gì? Máy lắp bao lâu rồi? |
| Nước có bột đen / bọt khí lúc mới lắp | 🟢 **Bình thường** — bột than từ lõi mới, xả tới khi nước trong |


<a id="p6-14"></a>
## Thông số tra nhanh

| Chỉ tiêu | Giá trị |
|---|---|
| Loại máy | **Âm tủ bếp (undersink)**, lọc nano, có nước nóng |
| Kích thước | **467 × 179 × 477 mm** (D×R×C) |
| Trọng lượng | ~14 kg |
| Lưu lượng nước thường | **1,8 L/phút** |
| Lưu lượng nước nóng | **2,1 L/phút** |
| Công suất làm nóng | **20 L/giờ** |
| Chế độ nước | Nhiệt độ phòng · **45 ℃** · **85 ℃** · **95 ℃** |
| Điện | **220V ~ 50Hz**, **2.100 W**, Cấp bảo vệ **Class I** (phải nối đất) |
| Áp lực nước vào | **0,1 – 0,4 MPa** |
| Nhiệt độ nước vào | **5 – 38 ℃** |
| Nhiệt độ môi trường | **4 – 40 ℃** |
| Nguồn nước | **Chỉ nước máy đô thị** |
| Đối tượng dùng | **Chỉ hộ gia đình** |
| Số lõi | **2 lõi — 4 bước lọc** |
| Chu kỳ lõi (khuyến nghị) | Lõi thô ~12 tháng · Lõi màng ~48 tháng |
| Ống PE & đầu nối | Thay mỗi **24 tháng**, có tính phí |
| Lỗ khoan vòi | **Ø30 mm** |
| Màu vòi | Đen / Bạc |
| Tuổi thọ máy | **5–10 năm** (điều kiện vận hành/bảo dưỡng đúng) |
| Bảo hành | 12 tháng toàn máy · 5 năm bơm + bo mạch (chính sách GWT) |
| Không bảo hành | Lõi · mô-đun tiệt trùng · gioăng · vỏ & lớp phủ · adapter |
| Giá niêm yết | **44.950.000 đ** ⚠️ *(chưa chốt đã gồm VAT chưa — xác nhận trước khi báo giá)* |

---


<a id="p6-15"></a>
## Phụ lục — những việc file này đang chờ GWT chốt

| # | Nội dung | Ảnh hưởng câu nào |
|---|---|---|
| 1 | Máy bán tại VN đi kèm bản HDSD nào (O-01) | **Q11** — có được nói tiệt trùng không |
| 2 | Chu kỳ lõi 12/48 hay 6–12/24–36 tháng (O-02) | **Q16, Q17** |
| 3 | Giá 44,95tr đã gồm VAT chưa? + bảng chiết khấu (O-07, O-08) | **Q20, Q31**, bảng tra nhanh |
| 4 | ~~Số hiệu TÜV đúng là số nào (O-04)~~ ✅ **ĐÃ CHỐT 28/08: `1111279087`** — thay bằng việc mới: **hồ sơ TÜV không hiện trên Certipedia** (O-18) | **Q28** |
| 5 | File PDF: TÜV · QCVN 6-1:2010 · SGS · VIETCERT | **Q13, Q28** |
| 6 | Văn bản chính sách bảo hành 5 năm bơm + bo (O-10) | **Q27** |
| 7 | Chế độ tiết kiệm điện 2 giờ hay 3 giờ (O-05) | **Q10** |

---

<a id="p7"></a>

# PHẦN 7 — NGUYÊN LIỆU MARKETING ĐÃ DUYỆT NGUỒN

> **PKB v1.2 · 28/08/2026** · Dùng cho: kịch bản video · landing page · caption social · quảng cáo · brief cho KOL
> ⚠️ **Bắt buộc đọc **Phần 2** trước.** File này chỉ chứa nguyên liệu **đã qua cổng claim** — nhưng người viết vẫn phải chạy checklist mục 6 của **Phần 2** trước khi xuất bản.

---


<a id="p7-1"></a>
## 1. NGUYÊN TẮC BIÊN TẬP CHO USH10

| # | Nguyên tắc | Vì sao |
|---|---|---|
| **1** | **Kể cấu trúc, đừng kể con số tuyệt đối.** Nói *"mô-đun tiệt trùng đặt ở đâu"* mạnh hơn nói *"diệt bao nhiêu phần trăm"* | Con số cần chứng nhận (đang thiếu). Cấu trúc chỉ cần HDSD (đang có) |
| **2** | **Một thông điệp — một con số.** Không dồn nhiều số vào một khung hình | Số của **lõi màng** (8.600/12.240) đặt cạnh số của **lõi thô** (6.630/10.200) sẽ bị khách bắt lỗi — khác cấp bộ phận |
| **3** | **Nói cả nhược điểm nhỏ.** Ví dụ: *"hãng vẫn khuyên xả nước tồn mỗi sáng"* | Khách VN đã biết nghi ngờ quảng cáo lọc nước. Tự nêu điểm yếu nhỏ làm tăng độ tin của phần còn lại |
| **4** | **Không superlative, kể cả trong thoại phụ và caption** | Luật quảng cáo VN + rủi ro bị đối thủ báo cáo |
| **5** | **Không chạm y khoa dù chỉ một chữ** | Xem **Phần 2** mục 3 |
| **6** | **Mỗi con số lên hình phải có mã `F-xxx`** ghi trong file kịch bản | Truy vết được khi bị hỏi |

---


<a id="p7-2"></a>
## 2. SÁU GÓC KỂ CHUYỆN CÓ SẴN DỮ LIỆU

Xếp theo **độ an toàn pháp lý** (cao xuống thấp):

| # | Góc | Nguyên liệu sẵn có | Cần chứng nhận? |
|---|---|---|---|
| **G1** | **"UV đặt ở đâu quan trọng hơn có UV không"** | HDSD chính hãng mô tả mô-đun lắp **nối tiếp trên đường nước tinh khiết → vòi**, đầu ra nối đoạn ống **gần vòi nhất** (`F-D05`). Cơ chế UV-C không có tác dụng tồn lưu là kiến thức phổ thông | ❌ **Không** — mạnh nhất hiện nay |
| **G2** | **"Rộng 17 phân"** | **179 mm** (`F-B02`) — con số bán hàng thật cho chung cư, nơi gầm chậu đã bị xi phông chiếm chỗ | ❌ Không |
| **G3** | **"Lõi đo bằng LÍT, không chỉ đo bằng THÁNG"** | Máy đếm **cả ngày lẫn lượng nước đã lọc**, cái nào tới trước tính cái đó (`F-C18`). Đi ngược lợi ích người bán nên rất đáng tin | ✅ **Được, kể cả con số lít** (O-03 đóng 28/08) — một thông điệp một con số, ⛔ không trộn số lõi màng với lõi thô |
| **G4** | **"Máy tự lo phần bảo dưỡng"** | Tự xả rửa màng theo lịch (`F-E09`) + chức năng không đọng nước (`F-E11`) + nhắc thay lõi ở **3 nơi** (`F-E14`) | ❌ Không |
| **G5** | **"Kiểm cả máy đã dùng lâu, không chỉ máy mới"** | TÜV kiểm E. coli, S. aureus, P. aeruginosa **bên trong máy sau thời gian dùng dài** theo DIN EN 16889 (`F-I07`) — góc này **chưa ai khai thác** | ⚠️ Nói được nội dung, ⛔ **không đọc số hiệu, không gửi link Certipedia** — `O-18` |
| **G6** | **"Nước cho quán cà phê specialty"** | Case thật PIN Cafe (33 Hàng Hòm), The Ghé Coffee (Q1) — đã đo nước đầu ra (`F-K12`). Ba mức nhiệt 45/85/95 khớp pha chế | 🔴 **CẨN TRỌNG** — HDSD ghi máy **chỉ dành cho gia đình** (`F-C21`). ⛔ Không làm nội dung mời quán mua nếu chưa có thoả thuận riêng từ GWT |

> 🔴 **Lưu ý về G6:** đây là ngách có dữ liệu tốt nhưng **mâu thuẫn với chính HDSD**. Trước khi làm nội dung F&B, GWT phải quyết định: (a) ra chính sách riêng cho F&B với chu kỳ lõi rút ngắn, hay (b) không làm ngách này. **Không được làm nội dung trước rồi xử lý sau.**

---


<a id="p7-3"></a>
## 3. KHỐI NỘI DUNG ĐÃ DUYỆT — DÙNG NGUYÊN VĂN ĐƯỢC

### 3.1 Khối "âm tủ"

> Máy nằm gọn dưới bồn rửa. Mặt bàn chỉ còn một chiếc vòi.
> **467 × 179 × 477 mm** — rộng **17,9 cm**, lọt được gầm chậu chung cư nơi ống xi phông và giỏ rác đã chiếm chỗ.
> Lắp chỉ cần **một lỗ khoan Ø30 mm** cho vòi — hoặc dùng luôn lỗ vòi có sẵn trên chậu.

`F-B01` `F-B02` `F-B18`

### 3.2 Khối "vị trí mô-đun tiệt trùng" — **khối mạnh nhất**

> Tia UV không có tác dụng tồn lưu. Nó chỉ xử lý dòng nước đang đi qua — không "để dành" được cho đoạn ống phía sau.
> Nên câu hỏi đúng không phải *máy có tiệt trùng không*, mà là *đặt ở đâu*.
> Trên USH10, hướng dẫn lắp đặt của hãng ghi rõ: cắt ống nước tinh khiết dẫn lên vòi, lắp mô-đun tiệt trùng **nối tiếp vào đó**, đầu ra nối **đoạn ống gần vòi nhất**.
> Nghĩa là nước được xử lý ở **đoạn cuối cùng trước khi ra khỏi vòi**.

`F-D05` — ⛔ **Không thêm bất kỳ con số phần trăm nào vào khối này.**

### 3.3 Khối "giữ khoáng"

> Máy RO chặn gần như mọi thứ — nước ra rất tinh khiết, nhưng khoáng tự nhiên cũng đi luôn.
> USH10 dùng màng lọc nano: vẫn chặn kim loại nặng như chì, asen, cadimi, chặn vi khuẩn, chặn chất hữu cơ — nhưng **cho khoáng tự nhiên đi qua**.
> Nước uống vào vẫn còn vị nước.

`F-C06` `F-C08` — ⛔ **Dừng ở đây. Không nói khoáng có tác dụng gì.**

### 3.4 Khối "máy tự lo bảo dưỡng"

> Đóng vòi là máy tự dừng.
> Bề mặt màng lọc **tự làm sạch và xả rửa theo lịch** — không ai phải mở tủ ra làm gì.
> Lâu không dùng, phần nước tinh khiết còn tồn trong lõi **tự quay ngược về để lọc lại**.
> Khi lõi sắp hết hạn, máy báo ở **ba nơi**: đèn trên vòi, đèn trên thân máy, và thông báo trên điện thoại.

`F-E09` `F-E11` `F-E14`

### 3.5 Khối "đếm bằng lít"

> Lõi lọc không hết hạn theo tờ lịch. Nó hết theo lượng nước đã đi qua.
> Máy đếm **cả số ngày lẫn lượng nước đã lọc** — cái nào tới trước thì báo cái đó.
> Nhà dùng nhiều, đèn báo sớm. Nhà dùng ít, đèn báo muộn hơn.
> Hướng dẫn sử dụng của hãng cũng ghi thẳng: *"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ lõi lọc… Dữ liệu trên chỉ mang tính tham khảo."*

`F-C18` `F-C20` — ✅ **Đọc được con số lít** (O-03 đã đóng 28/08). Luật: **một thông điệp — một con số**; nếu nêu cặp thì nói đủ *"vào 12.240 L → ra 8.600 L"* của **cùng lõi màng** (`F-C17`). ⛔ Không trộn với 6.630/10.200 của lõi thô.

### 3.6 Khối "khoá trẻ em"

> Nước ra tới **95 độ**. Nên mỗi lần lấy nước nóng đều là hai bước: chạm khoá, rồi mới chạm nhiệt độ.
> Khoá **tự bật lại** sau vài giây — không phải nhớ khoá lại.
> Riêng nước nhiệt độ phòng thì một chạm là ra, để bé vẫn tự lấy nước uống được.

`F-E04` `F-E07` `F-E08` — ⛔ **Không kết luận "an toàn tuyệt đối cho trẻ".**

### 3.7 Khối "3 mức nhiệt cho 3 việc"

> **45 độ** — hãng đặt cho tình huống pha sữa.
> **85 độ** — pha trà.
> **95 độ** — cà phê, mì, nước sôi.
> Không phải đun rồi ngồi chờ nguội. Không phải ước lượng bằng tay.

`F-E01` — ⛔ **Không nói "nhiệt độ chuẩn để pha sữa cho bé"** (đó là claim y khoa).

### 3.8 Khối "TÜV kiểm máy cũ"

> Phòng thí nghiệm TÜV Rheinland của Đức mô phỏng các kịch bản dùng nước hằng ngày và thử nghiệm **trên sản phẩm sau thời gian sử dụng dài**, không chỉ trên máy mới.
> Họ kiểm vật liệu tiếp xúc nước — panel, ống nước, bể chứa, thân bơm — theo **19 chỉ tiêu hoà tan kim loại nặng của tiêu chuẩn EU** và **12 yêu cầu vật liệu tiếp xúc thực phẩm LFGB của Đức**.
> Và kiểm vi sinh bên trong máy theo tiêu chuẩn **DIN EN 16889**.

`F-I05` `F-I06` `F-I07` — ⛔ **Không đọc số hiệu, không gửi link tra cứu** (`O-18`). ⛔ **Không suy ra "an toàn cho mẹ và bé"**.

---


<a id="p7-4"></a>
## 4. KHUNG LANDING PAGE

| Khối | Nội dung | Mã |
|---|---|---|
| **Hero** | Ảnh mặt bàn bếp sạch, chỉ có vòi. Headline: *"Máy nằm trong tủ. Trên bàn chỉ còn một chiếc vòi."* | `F-A06` |
| **Vấn đề** | Bình đun + bình lọc + bình đóng chai đang chiếm bao nhiêu chỗ trên mặt bàn của bạn | — |
| **Khối 1 — Kích thước** | Khối 3.1 + hình đo gầm chậu có xi phông | `F-B01` `F-B02` |
| **Khối 2 — 4 chế độ nước** | Khối 3.7 + hình vòi với 4 nút | `F-E01` |
| **Khối 3 — Vị trí tiệt trùng** | Khối 3.2 + **sơ đồ đường nước vẽ lại từ HDSD** (nhấn vị trí mô-đun sát vòi) | `F-D05` |
| **Khối 4 — Giữ khoáng** | Khối 3.3 + bảng so sánh nano / RO / UF theo deck NSX | `F-C08` `F-C09` |
| **Khối 5 — Tự bảo dưỡng** | Khối 3.4 | `F-E09` `F-E11` |
| **Khối 6 — Đếm bằng lít** | Khối 3.5 | `F-C18` |
| **Khối 7 — An toàn trẻ em** | Khối 3.6 | `F-E04` |
| **Khối 8 — Kiểm định** | Khối 3.8 + patent **US 7138058** (link Google Patents cho khách tự tra) | `F-I07` `F-C11` |
| **Thông số** | Bảng tra nhanh (**Phần 6** Phần 10) — ⛔ bỏ dòng giá nếu chưa chốt VAT | — |
| **Điều kiện lắp** | Nước máy đô thị · áp lực 0,1–0,4 MPa · lỗ Ø30 mm · **chỉ dùng gia đình** | `F-B14` `F-B08` `F-C21` |
| **Bảo hành** | 12 tháng toàn máy + danh sách loại trừ (**ghi rõ lõi không bảo hành**) | `F-G01` `F-G03` |
| **CTA** | Đăng ký khảo sát gầm tủ miễn phí | — |

> 🔴 **Điều kiện lắp và danh sách loại trừ bảo hành PHẢI có trên landing page.** Giấu hai khối này là nguồn khiếu nại lớn nhất và làm hỏng cả phần còn lại.

---


<a id="p7-5"></a>
## 5. KHUNG VIDEO (5 beat, ~3 phút)

| Beat | Nội dung | Hình | Mã |
|---|---|---|---|
| **1. Mở** | Mặt bàn bếp lộn xộn: bình đun, bình lọc, bình 20 lít. Rồi cắt sang mặt bàn chỉ có một chiếc vòi | Đối lập trước/sau | `F-A06` |
| **2. Kích thước** | Mở tủ, đo gầm chậu có xi phông. Đặt thước: **17,9 cm** | Cận thước đo | `F-B02` |
| **3. Bốn nút** | Chạm LOCK → chạm 45 → rót thẳng vào bình sữa. Chạm 85 → rót vào ấm trà. Chạm 95 → rót vào phin | Quay thời gian thực, **không tua nhanh** | `F-E01` `F-E04` |
| **4. Vị trí tiệt trùng** | Đồ hoạ đường nước từ máy lên vòi, highlight mô-đun **sát vòi**. Thoại: khối 3.2 | Đồ hoạ vẽ lại từ sơ đồ HDSD | `F-D05` |
| **5. Đóng** | Đèn lõi trên vòi chuyển từ trắng sang nháy đỏ. Thoại: khối 3.5 | Cận đèn vòi | `F-C18` |

**5 short cắt ra:**
1. *"17 phân"* — chỉ beat 2
2. *"Hai bước mới ra nước 95 độ"* — beat 3, góc an toàn trẻ em
3. *"Đèn UV đặt ở đâu"* — beat 4
4. *"Lõi hết hạn theo lít chứ không theo lịch"* — beat 5
5. *"Sáng nào cũng xả nước tồn"* — mẹo dùng, khối tăng độ tin (`SF-30`)

> ⛔ **Beat "75 độ pha trà xanh" trong kịch bản cũ phải bị xoá.** Máy không có mức 75 °C (`F-E02`). Chuyển sang **85 °C**.

---


<a id="p7-6"></a>
## 6. BRIEF CHO KOL / REVIEWER

**Được nói:**
- Kích thước, âm tủ, 4 chế độ nước, khoá trẻ em 2 bước
- Vị trí mô-đun tiệt trùng (khối 3.2)
- Giữ khoáng, không phải RO (khối 3.3, dừng đúng chỗ)
- Máy tự xả rửa, chức năng không đọng nước
- Đèn nhắc lõi 2 cấp, báo ở 3 nơi
- Tự thay lõi được, rút ngang
- App G+ Life
- Vòi xoay 120°, IPX4

**Không được nói (gửi kèm brief, in đậm):**
- ⛔ Bất kỳ % diệt khuẩn nào
- ⛔ "Tốt nhất / duy nhất / số 1 / hơn hẳn"
- ⛔ Tên mã lõi
- ⛔ Bất kỳ công dụng sức khoẻ nào của nước hay khoáng
- ⛔ "Tốt cho bé / mẹ bầu / an toàn cho trẻ sơ sinh"
- ⛔ Mức nhiệt 75 độ
- ⛔ "Nước nóng ra sau 2,8 giây"
- ⛔ Con số tỷ lệ thu hồi nước
- ⛔ Số hiệu chứng nhận
- ⛔ So sánh trực tiếp với thương hiệu khác

> **Ràng buộc hợp đồng đề xuất:** kịch bản KOL phải được GWT duyệt trước khi quay, và bản dựng phải được duyệt trước khi đăng. Lý do: một câu sai của KOL lan nhanh hơn mọi tài liệu đính chính.

---


<a id="p7-7"></a>
## 7. TỪ ĐIỂN THAY THẾ NHANH

| Đừng viết | Viết là |
|---|---|
| "Diệt khuẩn 99,999%" | "Mô-đun tiệt trùng đặt trên đường nước ra vòi" |
| "Công nghệ độc quyền" | "Công nghệ màng lọc nano có bằng sáng chế US 7138058" |
| "Tỷ lệ thu hồi cao nhất" | *(bỏ hẳn)* |
| "Lõi bền 4 năm" | "Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo" |
| "Nước tinh khiết 100%" | "Nước lọc uống trực tiếp tại vòi" |
| "Bổ sung khoáng cho cơ thể" | "Giữ lại khoáng tự nhiên có trong nước" |
| "Nhiệt độ chuẩn pha sữa" | "Nút 45 độ, hãng đặt cho tình huống pha sữa" |
| "An toàn cho mẹ và bé" | "Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo tiêu chuẩn EU" |
| "Nước nóng ra sau 2,8 giây" | "Rót 100 ml nước nóng khoảng 2,8 giây" |
| "Máy để bàn" | "Máy âm tủ bếp" |
| "Lọc sạch mọi tạp chất" | "Giảm kim loại nặng, vi khuẩn và chất hữu cơ" |
| "Bảo hành trọn đời lõi" | "Lõi lọc là vật tư tiêu hao, không thuộc phạm vi bảo hành" |

---


<a id="p7-8"></a>
## 8. TÌNH TRẠNG TÀI SẢN MARKETING (🔵 nội bộ)

| Tài sản | Trạng thái | Việc cần làm |
|---|---|---|
| `video_ads` USH10 | **2 video, cả 2 hỏng link, 0 view** (1 link nhầm sang CTD50, 1 link là thư mục Drive) | Sửa link — so sánh: Lọc tổng có 14 video |
| Kịch bản chuyên gia | `POU-USH10-chuyengia-v1.md`, `-v2-bang-phan-canh.md` — **chờ duyệt** | ⛔ Phải sửa beat 75 °C trước khi duyệt |
| Tập series | **TẬP 20** trong `POU-KHOI4-tap17-23-v1.md` | Rà theo **Phần 2** trước khi quay |
| Caption ảnh | `bytone_ALLSTYLES_ush10-blackfaucet_facebook.md` (43 style) | Rà theo mục 7 |
| Chatbot | 1 doc, 8 chunk — 🔴 **đang vi phạm rule claim** (O-16) | **Gỡ ngay**: "99,999%", "cao nhất", "độc quyền", công dụng y tế từng khoáng |
| Fact-sheet | `POU-may-loc-uong-factsheet-v1.md` | Đối chiếu lại với **Phần 1** |

> 🔴 **Nghịch lý cần giải quyết:** KOL và giới thiệu mang về **8/12 máy đã bán** (`F-K10`), nhưng tài sản marketing USH10 gần như trống. Đầu tư đang lệch khỏi kênh đã chứng minh hiệu quả.

---

<a id="p8"></a>

# PHẦN 8 — MA TRẬN ĐỐI CHIẾU NGUỒN & SỔ MÂU THUẪN

> **PKB v1.2 · 28/08/2026** · Đọc kèm **Phần 0**
> **Cách đọc:** cột = nguồn tài liệu · dòng = dữ kiện bị đá nhau · ô = giá trị nguồn đó ghi.
> `—` = nguồn đó **không đề cập**. ✅ = giá trị được chốt dùng. ⚠️ = lệch. ⛔ = đã xác định sai.

---


<a id="p8-1"></a>
## BẢNG CỘT NGUỒN

| Mã cột | Nguồn đầy đủ | Hạng |
|---|---|---|
| **S1** | HDSD chính hãng **bản quốc tế Ver.26.08.14** (`USH10 Manual.pdf` + bản dịch VI) | **A** |
| **S2** | HDSD chính hãng **bản Trung Quốc** (trích qua hồ sơ nội bộ 18/08) | A− |
| **S3** | Deck giới thiệu dòng sản phẩm NSX (`极煦系列净热一体机产品介绍.pptx`) | B |
| **S4** | Deck giải pháp 极沁Max (`Product Introdution USH10 + SPK25`) | B |
| **S5** | Tài liệu mô tả chứng nhận TÜV (`Thông tin chi tiết TUV.pdf`) | B |
| **S6** | Quy cách điều khiển điện **V1.8 · 15/05/2022** (nội bộ NSX, cấp họ máy) | C ⛔ không phổ biến |
| **S7** | Thông báo kỹ thuật hậu mãi NSX (`G. Những lưu ý khi lắp đặt … 23-3`) | C |
| **DM** | **Danh mục hàng hoá GWT — Product Filter** (PDF, 31/07/2026) | Ưu tiên #2 theo GWT |
| **BR** | Brochure VN | D |
| **MD** | Master Data GWT / nội dung chatbot | D |
| **S14** | **Xác nhận trực tiếp từ GWT (chủ sở hữu sản phẩm) — 28/08/2026.** Chốt cách đọc ngưỡng lõi màng và số hiệu TÜV | **A** *(quyết định của chủ sở hữu)* |
| **S15** | **Certipedia — cơ sở dữ liệu chứng chỉ công khai của TÜV Rheinland**, tra ngày 28/08/2026: `certipedia.com/quality_marks/{ID}` | **A** *(nguồn gốc, tra lại được bất cứ lúc nào)* |

---


<a id="p8-2"></a>
## BẢNG 1 — THÔNG SỐ KỸ THUẬT

| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S4 · Deck 极沁Max | BR · Brochure VN | MD · Master/Chatbot | ✅ CHỐT |
|---|---|---|---|---|---|---|---|
| **Công suất định mức** | **2.100 W** | 2.100 W | — | 2.100 W | 2.100 W | ⚠️ 2.000–2.400 W | ✅ **2.100 W** (mâm nhiệt 2.000 W) |
| **Điện áp** | **220V~ 50Hz** | 220V/50Hz | — | 220V~ 50Hz | ⚠️ 220–240V | ⚠️ 220–240V | ✅ **220V ~ 50Hz** |
| **Áp lực nước vào** | **0,1–0,4 MPa** *(ghi 2 lần: bảng TSKT + mục Lưu ý an toàn)* | 0,1–0,4 MPa | — | 0,1–0,4 MPa | ⛔ **0–0,4 MPa** | ⛔ 0–0,4 MPa | ✅ **0,1–0,4 MPa** |
| **Nhiệt độ môi trường** | **4–40°C** | 4–40°C | — | ⚠️ **4–30°C** | 4–40°C | 4–40°C | ✅ **4–40°C** *(S4 có thể là spec của tổ hợp có máy nước ga)* |
| **Trọng lượng tịnh** | — | — | — | **14,36 kg** (gộp 17,22 kg) | 14 kg | 14,18 kg (gộp 17,04 kg) | 🟠 **MỞ** — 3 con số khác nhau |
| **Tỷ lệ thu hồi nước** | — | — | **69%** *(GTUN-8600HP/700G)*<br>73,5% *(8500HP/500G)* | — | — | ⚠️ **77%** (master)<br>76,8% (chatbot) | 🔴 **MỞ — CẤM CÔNG BỐ** |
| **Lưu lượng nước thường** | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | ✅ **1,8 L/phút** — 6/6 nguồn khớp |
| **Lưu lượng nước nóng** | — | — | **2,1 L/phút** | — | 2,1 L/phút | 2,1 L/phút | ✅ **2,1 L/phút** |
| **Kích thước** | 467×179×477 mm | 467×179×477 | — | 467×179×477 | 467×179×477 | 467×179×477 | ✅ **467×179×477 mm** |
| **Yêu cầu tủ / khoảng hở** | Lỗ vòi **Ø30 mm** + mặt phẳng bán kính **3,8 cm** | — | — | Ø30 mm; **hở ≥10 cm** *(đọc từ hình)* | **cao ≥550 mm, sâu ≥530 mm** | — | 🟡 Dùng S1 làm chuẩn; BR/S4 là **khuyến nghị khảo sát** |

> 🔴 **Điểm nguy hiểm nhất bảng này: Áp lực nước vào.** Brochure và Master Data đang ghi mất ngưỡng dưới (`0–0,4` thay vì `0,1–0,4`). Sale đọc theo brochure sẽ tư vấn "nhà áp yếu vẫn chạy" → máy lắp xong không hoạt động → khiếu nại.

---


<a id="p8-3"></a>
## BẢNG 2 — LÕI LỌC & CHU KỲ THAY

| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S6 · Quy cách V1.8 | DM · Danh mục hàng hoá | VN công bố (BR/MD) | ✅ CHỐT |
|---|---|---|---|---|---|---|---|
| **Chu kỳ lõi thô (PCFB)** | **6~12 tháng** | 6–12 tháng | — | ngưỡng đếm **360 ngày** | **360 ngày / 6.630 L** | 12–24 tháng | 🟠 GWT chốt **12 tháng** — xem O-02 |
| **Chu kỳ lõi màng (NF)** | **24~36 tháng** | 24–36 tháng | **"4 năm"** *(核心NF滤芯，4年长效设计)* | ngưỡng đếm **1.440 ngày** | **1.440 ngày / 12.240 L** *(nước vào)* | 24–48 tháng | 🟠 GWT chốt **48 tháng** — xem O-02 *(số ngày vẫn mở; số LÍT đã đóng)* |
| **Ngưỡng LÍT lõi thô** | — | — | — | **10.200 L nước vào / 6.630 L nước tinh khiết** | **6.630 L** | — | ✅ 6.630 L (nước tinh khiết) |
| **Ngưỡng LÍT lõi màng** | — | — | — | **8.600 L nước tinh khiết** (bản 700G) | **12.240 L** | — | ✅ **ĐÓNG 28/08** — 12.240 L = **nước vào**, 8.600 L = **nước ra**. Không mâu thuẫn (S14) |
| **"8.600 L" trên nhãn máy là gì** | *Rated Total Purified Water Capacity* = **8.600 L** (chỉ tiêu của **MÁY**) | 8.600 L | — | **8.600 L = ngưỡng lít của lõi NF** | — | "công suất lọc 8.600 L" | ✅ **ĐÓNG 28/08** — cùng một con số: **nước tinh khiết đầu ra** của lõi màng (S14) |
| **Số lõi / số bước** | 2 lõi | 2 lõi | 2 lõi | 2 cấp (PCFB + NF) | 2 dòng lõi | 2 lõi – 4 bước | ✅ **2 lõi — 4 bước lọc** |
| **Tuổi thọ máy** | **5~10 năm** | — | — | — | — | — | ✅ **5–10 năm** (điều kiện vận hành/bảo dưỡng đúng) |
| **Ống PE & đầu nối** | thay mỗi **24 tháng** (tính phí) | — | — | — | — | — | ✅ **24 tháng** |

### Ghi chú đối chiếu — vì sao "6~12 tháng" và "360 ngày" KHÔNG hẳn mâu thuẫn

Hai nguồn đang nói **hai đại lượng khác nhau**:

| | Đại lượng | Con số | Nguồn |
|---|---|---|---|
| Hãng **khuyến nghị thay** | dựa trên chất lượng nước trung bình, thiên về an toàn | 6~12 th (thô) · 24~36 th (màng) | S1, S2 |
| Máy **đếm và báo đèn** | ngưỡng cứng lập trình trên bo mạch | 360 ngày (thô) · 1.440 ngày (màng) | S6, DM |

> ⚠️ **Hệ quả thực tế phải cảnh báo:** với lõi màng, máy chỉ bật đèn đỏ ở **1.440 ngày (48 tháng)**, trong khi HDSD khuyến nghị thay ở **24–36 tháng**. Khách chỉ tin đèn sẽ thay **muộn hơn khuyến nghị của hãng 12–24 tháng**. Đây là rủi ro chất lượng nước + rủi ro khiếu nại, **không phải chuyện chữ nghĩa**. → O-02.

---


<a id="p8-4"></a>
## BẢNG 3 — TÍNH NĂNG & GIAO DIỆN VÒI

| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S6 · Quy cách V1.8 | S7 · Thông báo KT | MD · Marketing VN | ✅ CHỐT |
|---|---|---|---|---|---|---|---|
| **Các mức nhiệt** | nước thường · **45 · 85 · 95°C** | 45/85/95 + thường | 4 mức: 45 (pha sữa) · 85 (pha trà) · 95 (nước nóng) · thường | 45 · 85 · 95 · thường *(thường hiển thị 25°C)* | — | ⛔ **45 · 75 · 85 · 95** | ✅ **thường · 45 · 85 · 95** — ⛔ **KHÔNG có 75°C** |
| **Nút UV trên vòi** | ✅ **CÓ** — nút "UV", đèn trắng/nháy trắng, reset `WARM`+`UV` 3 giây → hiện `SA` | ❌ không có | ❌ không có | ❌ **không có** (vị trí đó là nút **ECO**) | ❌ nhắc **节能键 (ECO)** | "UVC theo dòng chảy" | 🟢 Theo **S1** — nhưng xem O-01 |
| **Nút ECO / tiết kiệm điện** | ❌ **không nhắc** | — | ✅ có, **3 giờ** không thao tác → tự vào ECO | ✅ có, **3 giờ** không thao tác → tự vào ECO; ECO = không giữ ấm | ✅ có (节能键) | ⚠️ "giữ ấm mặc định **2 giờ**" | 🟠 **MỞ** — 3 nguồn ghi **3 giờ**, marketing VN ghi 2 giờ → xem O-05 |
| **Mô-đun tiệt trùng nội tuyến** | ✅ **CÓ** — 5 vị trí độc lập: danh mục đóng gói · sơ đồ điện · sơ đồ xử lý nước · bước lắp đặt (4) · nút vòi + reset `SA`. Bảo hành loại trừ *"đèn diệt khuẩn tia cực tím"* | ❌ không xuất hiện | ❌ | ❌ | ❌ | "UVC Flow, đặt ở dòng nước đi ra" | 🟢 **CÓ** theo S1 — ⛔ vẫn cấm số "99,999%" |
| **"Mỗi ngày tươi mới"** | Nút **xả bình nước nóng** (`Refresh`) | — | ✅ **每日鲜活** — 1 chạm xả sạch nước trong bình đun | ✅ nút 排水 (xả bình) | ✅ nhắc phím 每日鲜活 | "Mỗi ngày tươi mới" | ✅ **CÙNG MỘT NÚT** — claim hợp lệ |
| **Khoá trẻ em** | Chạm LOCK trước rồi chạm nút nhiệt | — | ✅ (pha sữa/pha trà/nước nóng phải mở khoá) | ✅ + **tự khoá lại sau 5 giây** không thao tác; khoá chỉ chặn nước nóng | — | có khoá trẻ em | ✅ **CÓ** + chi tiết 5 giây (🔵 nội bộ) |
| **Vòi xoay 120°** | — | — | — | ✅ **120° (±60°)** | — | xoay 120° | ✅ **CÓ NGUỒN** (S4) |
| **Chuẩn IPX4 + bo mạch phủ keo** | — | — | ✅ **IPX4**; **bo mạch phủ keo 100%** | — | — | IPX4, phủ keo | ✅ **CÓ NGUỒN** (S3) |
| **"2,8 giây"** | — | — | ✅ **2,8 giây / cốc 100 ml nước nóng** (từ lưu lượng 2,1 L/phút) | — | — | ⚠️ "nước nóng ra sau 2,8 giây" | 🟡 **Có nguồn nhưng đang bị diễn đạt sai** — xem O-06 |
| **Cảm biến nhiệt Seiko** | — | — | — | NTC1 (bình đun) + NTC2 (hơi nước) — **không ghi hãng** | — | "cảm biến Seiko" | 🔴 **KHÔNG CÓ NGUỒN** — cấm dùng |
| **Hộp đun 1,8 L inox 316 chân không 2 lớp** | "Hot Tank" — không mô tả vật liệu/dung tích | — | — | 热胆 — không ghi vật liệu | — | "1,8 L inox 316 chân không 2 lớp" | 🔴 **KHÔNG CÓ NGUỒN** — cấm dùng |
| **Mực nước bình đun** | Cảm biến mực nước | — | — | **4 mức**: thấp · trung · cao · tràn | — | "4 cấp phát hiện mực nước" | ✅ **4 mức** — khớp (🔵 chi tiết nội bộ) |
| **Xả rửa tự động** | Tự làm sạch & xả rửa màng theo lịch | — | — | Bật nguồn xả 30 giây · **mỗi 24 giờ xả 30 giây** · chờ >4 giờ không tạo nước → xả 15 giây | — | "tự động xả rửa định kỳ" | ✅ **CÓ** — chi tiết chu kỳ 🔵 nội bộ |
| **Học điểm sôi theo vùng** | — | — | — | ✅ máy **tự học điểm sôi địa phương**; nếu cài > điểm sôi thì lấy điểm sôi − 2°C | — | — | 🔵 **NỘI BỘ** — giải thích được vì sao 95°C ở vùng cao có thể thấp hơn |

---


<a id="p8-5"></a>
## BẢNG 4 — MÃ LỖI (kể cả mâu thuẫn NỘI BỘ trong cùng 1 tài liệu)

| Mã | S1 · HDSD quốc tế | S6 ch.6 · bảng tự kiểm | S6 · các chương logic | S7 · hiện trường | ✅ CHỐT (dùng cho CSKH) |
|---|---|---|---|---|---|
| `E1` | Lỗi truyền thông vòi thông minh | 水龙头板通讯异常 | — | — | ✅ Khớp |
| `E2` | Bất thường truyền thông bo mạch hiển thị | 显示板通讯异常 | ⚠️ ch.3.4.5 ghi *"gia nhiệt quá 3 phút không đổi nhiệt → E2"* | — | ✅ Theo **S1** — E2 = lỗi bo hiển thị |
| `E3` | Kích hoạt bảo vệ chống tràn | 溢水 (tràn nước) | ⚠️ ch.3.3.3 ghi *"tràn nước → nháy **E9**"* | — | ✅ Theo **S1** — E3 = tràn |
| `E4` | Sản xuất nước bất thường | 异常制水 — quá 5 phút chưa đạt mực nước cao | ch.3.7: bơm chạy liên tục 2 giờ → bảo vệ, báo E4 | — | ✅ Khớp |
| `E5` | Gia nhiệt bất thường | 加热异常 | ⚠️ ch.3.10 ghi *"rò rỉ → báo **E5**"* | — | ✅ Theo **S1** — E5 = gia nhiệt |
| `E6` | ❌ không có | 超时保护 (dự phòng) | — | — | 🔵 Dự phòng, chưa dùng |
| `E7` | **Rò rỉ nước** | 漏水 (rò rỉ) | ⚠️ (mâu thuẫn với ch.3.10 ở trên) | — | ✅ Theo **S1** — E7 = rò rỉ |
| `E8` | Bất thường đầu dò hộp đun | 加热NTC异常 | — | — | ✅ Khớp |
| `E9` | Bất thường cảm biến NTC | 蒸汽NTC异常 | ⚠️ (bị dùng cho "tràn nước" ở ch.3.3.3) | — | ✅ Theo **S1** — E9 = NTC |
| `C1` | Chế độ xả rửa lần đầu — **~16 phút** | — | Bật nguồn lần đầu: cưỡng bức 16 phút | ✅ Xử lý khi bị kích hoạt nhầm: bấm nút nước thường, xả 16 phút | ✅ Khớp |
| `C2` | Xả rửa sau reset lõi — **8 phút** | — | Xả lõi 30 giây + ra nước 5 phút mỗi lõi | — | ✅ Theo **S1** — 8 phút |
| `SA` | Xác nhận đã reset mô-đun tiệt trùng | ❌ không có | ❌ | ❌ | ✅ Chỉ có ở **S1** |
| `EL` | ❌ **không có** | — | ✅ **Mực nước bình đun xuống mức thấp** → tự bơm bù, nháy 1Hz, không kêu bíp | ✅ nhắc `EL` khi xả bình đun | 🔵 **NỘI BỘ** — CSKH cần biết: `EL` **không phải lỗi** |
| `SC` | ❌ không có | — | ✅ Xác nhận **khôi phục cài đặt gốc** (giữ ECO + nước thường 10 giây) | — | 🔵 **NỘI BỘ — CẤM hướng dẫn khách tự làm** |
| `F1/F2/F3` | ❌ | Dự phòng, chưa gán | — | — | 🔵 Dự phòng |

> 🟠 **Kết luận Phần 4:** tài liệu S6 (V1.8 · 2022) **tự mâu thuẫn với chính nó** ở 3 chỗ (E2, E5, E9 bị dùng 2 nghĩa). Đây là bản đặc tả đang soạn dở của **cả họ máy**, không phải bản chốt cho USH10. → **CSKH chỉ dùng cột S1.** S6 chỉ dùng để hiểu cơ chế, không dùng để tra mã.

---


<a id="p8-6"></a>
## BẢNG 5 — CHỨNG NHẬN & PHÁP LÝ

| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S5 · Tài liệu TÜV | S9 · Hồ sơ nội bộ GWT | ✅ CHỐT |
|---|---|---|---|---|---|
| **Số hiệu TÜV** | — | — | ❌ **`1111297087`** — Certipedia trả về **HP Inc. (laptop)** → lỗi chép số | ✅ **`1111279087`** — Certipedia trả về **General Water Technology (Shanghai) Co., Ltd.** | ✅ **ĐÓNG 28/08 — hồ sơ nội bộ ĐÚNG** (S15). O-04 đóng, mở tiếp O-18 |
| **Số chứng chỉ TÜV** | — | — | **`Q 50613617 001`** | ❌ không ghi | ✅ Chỉ có ở S5 |
| **Số báo cáo TÜV** | — | — | **`CN24W0C5 001`** | ❌ không ghi | ✅ Chỉ có ở S5 |
| **Model được TÜV chứng nhận** | — | — | **`GE-GEUT-50B04` và `GE-GTUN-8600HP`** | "USH10" | 🟢 **Xác nhận TÜV bao gồm đúng USH10** |
| **Nội dung TÜV** | — | — | **57 thử nghiệm**; vật liệu tiếp xúc nước đạt **19 chỉ tiêu hoà tan kim loại nặng EN 14350**; **12 yêu cầu LFGB (Đức)**; kiểm vi sinh theo **DIN EN 16889** (E. coli, S. aureus, P. aeruginosa) | "57 tiêu chí, an toàn mẹ & bé, 19 tiêu chuẩn EU 2020" | 🟡 Dùng **nguyên văn S5**, ⛔ bỏ cụm *"an toàn mẹ & bé"* — xem **Phần 2** |
| **File PDF chứng chỉ TÜV** | — | — | ❌ **chưa có** (S5 là bản mô tả, không phải bản scan) | 🔴 file 0 byte | 🔴 **MỞ — nặng thêm:** Certipedia cũng **không hiện chứng chỉ nào** cho ID đúng → O-18 |
| **SGS diệt khuẩn 99,999%** | — | — | ❌ | Số `ASH18-029858-01`, **chưa có file**; phiếu SGS trong kho là của máy **50B04** | 🔴 **CẤM CÔNG BỐ** |
| **Tiêu chuẩn sản xuất** | ❌ (chỉ có WEEE/EU) | `GB4706.1-2005`, `GB4706.19-2008`, `Q31/0112000854C015-2021-01` | — | — | 🔵 Nội bộ — chuẩn thị trường TQ |
| **Giấy phép vệ sinh** | — | `(苏)卫水字(2021)第3200-0139号` | — | — | 🔵 Nội bộ — giấy phép TQ |
| **Chất lượng nước ra** | — | đạt `CJ94-2005` (chuẩn TQ) | — | claim VN: `QCVN 6-1:2010/BYT` | 🔴 **Phiếu thử VN rỗng** — xem **Phần 2** |
| **Hiệu suất nước** | — | **Mức 1 (cao nhất)** theo `GB 34914-2021` | — | — | 🟡 Nói được nhưng **phải ghi rõ là tiêu chuẩn Trung Quốc** |
| **Nhà sản xuất** | **General Water Technology (HongKong) Co., Ltd.** | 溢泰（南京）环保科技 (Yitai Nanjing), uỷ quyền bởi 通用净水科技（上海） | — | — | 🟠 **MỞ** — 2 bản HDSD ghi 2 NSX → O-01 |
| **Thải bỏ** | Ký hiệu **WEEE (EU)** | — | — | — | ✅ Chỉ ở S1 |

---


<a id="p8-7"></a>
## BẢNG 6 — THƯƠNG MẠI & TÀI LIỆU NỘI BỘ

| Dữ kiện | `product_price` | `catalog_item` | `gwt/sales-cskh.md` | `wh_master` (kho) | ✅ CHỐT |
|---|---|---|---|---|---|
| **Giá niêm yết** | **44.950.000 đ**, kênh `NIEM_YET`, hiệu lực 29/07/2026 | 44.950.000 đ | — | — | ✅ 44.950.000 đ |
| **VAT** | ⚠️ `vat_pct = 10` + ghi chú *"CHUA XAC MINH da gom VAT hay chua"* | ⚠️ **VAT 8%** | — | — | 🔴 **MỞ — ẢNH HƯỞNG BÁO GIÁ** → O-07 |
| **Phân loại máy** | — | Machines › POU › **Undersink** | ⛔ **"máy để bàn"** | — | ✅ **ÂM TỦ BẾP** — `sales-cskh.md` **SAI** |
| **Tình trạng hàng** | — | Đang KD | ⚠️ "thường hết hàng" | **tồn 4 máy** (24/06/2026, kho Nguyễn Xiển) | 🟠 Kiểm tra tồn thực tế trước khi trả lời khách |
| **Tồn lõi USH10** | — | — | — | 🔴 **0 lõi** | 🔴 ⛔ **Không hứa "có sẵn, thay ngay"** |

---


<a id="p8-8"></a>
## BẢNG 7 — SỔ MÂU THUẪN MỞ (việc cần GWT chốt)

| Mã | Vấn đề | Mức | Ảnh hưởng | Cần ai chốt | Chốt xong thì sửa file nào |
|---|---|---|---|---|---|
| **O-01** | **Máy bán tại VN đi kèm bản HDSD nào?** Bản quốc tế Ver.26.08.14 (có UV, NSX HongKong) hay bản TQ (không UV, NSX Yitai Nanjing)? | 🔴 **CHẶN** | Quyết định **có được nói tính năng tiệt trùng UV hay không** — đây là USP mạnh nhất. Cũng quyết định bố cục nút vòi (UV hay ECO) mà CSKH hướng dẫn khách | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 3**, **Phần 6**, **Phần 7** |
| **O-02** | **Chu kỳ lõi:** HDSD 6–12 / 24–36 tháng vs GWT chốt 12 / 48 tháng | 🔴 **CAO** | Máy chỉ báo đèn ở 48 tháng trong khi hãng khuyến nghị thay ở 24–36 tháng → khách thay muộn 12–24 tháng. Rủi ro chất lượng nước + khiếu nại + kế hoạch nhập lõi | GWT (cần văn bản giải thích cơ sở) | **Phần 1**, **Phần 3**, **Phần 6** |
| ~~**O-03**~~ | ✅ **ĐÃ ĐÓNG 28/08/2026.** GWT xác nhận: **12.240 L = nước ĐẦU VÀO**, **8.600 L = nước tinh khiết ĐẦU RA** của lõi màng — hai đại lượng khác nhau, **không mâu thuẫn** (70,3 %). 8.600 L trên nhãn máy = cùng con số đó | ✅ Đóng | Đã sửa `F-B06`, `F-C17`, `F-L01`, `F-L03`, danh sách đỏ **Phần 2**, nguyên tắc 2 **Phần 7**. Luật còn lại: ⛔ không trộn số **lõi màng** với số **lõi thô** | — | ✅ xong |
| ~~**O-04**~~ | ✅ **ĐÃ ĐÓNG 28/08/2026.** Tra Certipedia: `1111279087` → **General Water Technology (Shanghai) Co., Ltd.** (đúng NSX) · `1111297087` → **HP Inc., laptop TPN-W166** (lỗi chép số). **Hồ sơ nội bộ GWT đúng** | ✅ Đóng | Đã sửa `F-I01`, **Phần 2**, **Phần 6 · Q28**. ⛔ Gỡ `1111297087` khỏi mọi tài liệu | — | ✅ xong |
| **O-18** | 🔴 **Hồ sơ TÜV không hiện trên Certipedia.** Trang của ID đúng `1111279087` ghi *"Currently no valid certificates are attached to this Certipedia ID"* — tên NSX hiện đúng nhưng **không có chứng chỉ nào đính kèm**. Đồng thời **chưa có bản scan** chứng chỉ (`F-I09`) | 🔴 **CAO** | **Nặng hơn O-04 cũ.** Trước đây rủi ro là đọc *nhầm* số; giờ rủi ro là đọc *đúng* số mà khách tra vẫn ra **trang trống** — đúng tại điểm chốt đơn. Hiện ⛔ cấm đưa cả số lẫn link | GWT làm việc lại với TÜV Rheinland / NSX: (1) xin **bản scan PDF** chứng chỉ `Q 50613617 001`; (2) hỏi vì sao chứng chỉ **không hiển thị công khai** — hết hạn, chưa publish, hay thuộc loại không đăng | **Phần 1** (`F-I01` `F-I16`), **Phần 2**, **Phần 6 · Q28** |
| **O-05** | **Chế độ tiết kiệm điện: 3 giờ hay 2 giờ?** S3 + S6 ghi 3 giờ; marketing VN ghi 2 giờ. HDSD quốc tế **không nhắc chế độ này** | 🟡 Thấp | Sai chi tiết nhỏ nhưng dễ bị khách bắt lỗi khi dùng thực tế | GWT | **Phần 1**, **Phần 6** |
| **O-06** | **"2,8 giây" nghĩa là gì?** Nguồn NSX: *"2,8 giây một cốc 100 ml nước nóng"* = **tốc độ rót**. Marketing VN đang nói *"nước nóng ra sau 2,8 giây"* = **thời gian chờ** | 🟠 **TB** | Hai nghĩa hoàn toàn khác nhau. Nói sai = quảng cáo sai tính năng | Marketing sửa ngay, không cần chờ GWT | **Phần 1**, **Phần 6**, **Phần 7** |
| **O-07** | **Giá 44,95tr đã gồm VAT chưa? 8% hay 10%?** | 🔴 **CAO** | Ảnh hưởng trực tiếp mọi báo giá bằng văn bản | Phòng Kinh doanh | **Phần 1**, **Phần 6** |
| **O-08** | **Không có bảng chiết khấu chính thức** dù 12/12 đơn đã bán ở mức 60–85% giá niêm yết, các mốc đều chẵn | 🔴 **CAO** | Sale không có căn cứ ra giá; giá thực ~30–34tr đụng thẳng CTS20 (32,1tr) | Ban Giám đốc | **Phần 6**, **Phần 7** |
| **O-09** | **Chưa có phiếu xét nghiệm nước đầu ra của chính máy USH10 tại VN** | 🟠 **TB** | Mọi claim chất lượng nước hiện không có bằng chứng nội địa. Mineral Map là kết quả của **hệ lọc tổng (POE)**, ⛔ không dùng cho USH10 | GWT Kỹ thuật | **Phần 2**, **Phần 6** |
| **O-10** | **Bảo hành 5 năm bơm + bo mạch không có trong HDSD hãng** (cả 2 bản) — là chính sách riêng GWT | 🟠 **TB** | Sale đang hứa miệng, không có văn bản dẫn chứng | Phòng Kinh doanh | **Phần 1**, **Phần 6** |
| **O-11** | **3 claim marketing chưa truy được nguồn:** cảm biến nhiệt **Seiko** · hộp đun **1,8 L inox 316 chân không 2 lớp** | 🟠 **TB** | Đang bị chặn dùng. Nếu có nguồn thì đây là 2 điểm bán mạnh cho phân khúc cao cấp | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 7** |
| **O-12** | **Trọng lượng: 14 kg / 14,18 kg / 14,36 kg** | 🟡 Thấp | Ảnh hưởng vận chuyển, không ảnh hưởng bán hàng | GWT Kho vận | **Phần 1** |
| **O-13** | **Nhiệt độ môi trường: 4–40°C (HDSD) hay 4–30°C (deck 极沁Max)** | 🟡 Thấp | Có thể deck ghi spec của tổ hợp có máy nước ga. Cần xác nhận nếu bán combo | GWT | **Phần 1** |
| **O-14** | **Mã đặt hàng combo 极沁Max bị đảo trong tài liệu:** `V00000068` / `V00000069` gắn với bình ga 0,6 L hay 4 L? | 🟡 Thấp | Chỉ ảnh hưởng khi bán combo với SPK25 | GWT Cung ứng | **Phần 1** |
| **O-15** | **`gwt/sales-cskh.md` ghi USH10 là "máy để bàn"** | 🔴 **CHẶN** | **Tài liệu đào tạo sale đang sai loại máy.** Sale mới học sai từ ngày đầu | Đào tạo | `sales-cskh.md` (ngoài PKB) |
| **O-16** | **Chatbot Supabase đang vi phạm chính rule của GWT** — 8 chunk chứa "99,999%", "cao nhất", "công nghệ độc quyền", và **công dụng y tế từng khoáng** | 🔴 **CHẶN** | Chatbot đang nói với khách **đúng những câu mà kịch bản video bị cấm nói** | IT + Marketing | `chatbot_chunks` (ngoài PKB) |
| **O-19** | **Tỷ lệ thu hồi nước ghi 4 số khác nhau:** 69% (NSX, cho GTUN-8600HP) · 77% (master data VN) · 76,8% (chatbot) · ≥65% (quy cách V1.8). *Tách ra thành mã riêng ngày 28/08 — trước đây bị gộp nhầm vào `O-03`, mà `O-03` nay đã đóng* | 🟠 **TB** | Đang ⛔ cấm công bố mọi con số thu hồi (`F-B22`). Là một trong những câu khách hỏi nhiều nhất về máy lọc | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 6** |
| **O-17** | **Mã lạ `GTUN-8600VNHP`** — 2 máy đã lắp (2024), có dòng bảo hành. Ghi chú DB: *"máy Test, có lắp lẻ thực tế"* | 🟡 Thấp | Ảnh hưởng tra cứu bảo hành | GWT | **Phần 1** |

---


<a id="p8-9"></a>
## Bảng ưu tiên xử lý

| Thứ tự | Mã | Lý do đứng vị trí này |
|---|---|---|
| 1 | **O-15** | Sai loại máy trong tài liệu đào tạo — hỏng từ gốc, sửa mất 1 phút |
| 2 | **O-16** | Chatbot đang nói câu vi phạm với khách **ngay lúc này** |
| 3 | **O-01** | Mở khoá hoặc đóng vĩnh viễn USP mạnh nhất (UV) |
| 4 | **O-07** + **O-08** | Không chốt thì không báo giá đúng được |
| 5 | **O-18** | Số chứng nhận đã đúng, nhưng khách tra Certipedia ra **trang trống** — hỏng ngay tại điểm chốt đơn |
| 6 | **O-02** | Ảnh hưởng chất lượng nước của khách đang dùng + kế hoạch nhập lõi |
| 7 | **O-06** | Marketing tự sửa được, không cần chờ ai |
| 8 | Còn lại | Theo mức đã ghi |

---

<a id="p9"></a>

# PHẦN 9 — ĐÀO TẠO & KIỂM TRA

> **PKB v1.2 · 28/08/2026** · Dùng cho: đào tạo sale mới · tái đào tạo CSKH · onboarding kỹ thuật
> **Điều kiện đạt:** ≥ 22/25 câu trắc nghiệm **và** không sai câu nào thuộc nhóm 🔴 (câu 1, 5, 9, 14, 18, 22, 25)

---


<a id="p9-1"></a>
## 1. LỘ TRÌNH ĐÀO TẠO

| Buổi | Thời lượng | Nội dung | File đọc trước | Sản phẩm đầu ra |
|---|---|---|---|---|
| **B1 — Sản phẩm** | 90 phút | Máy là gì, đặt ở đâu, 2 lõi 4 bước, 4 chế độ nước, vòi thông minh, app | **Phần 1** mục A–F | Vẽ lại sơ đồ đường nước từ trí nhớ |
| **B2 — Cấm & Được** | 90 phút | Danh sách đỏ, quy tắc mẹ & bé, cách nói thay thế | **Phần 2** **toàn bộ** | Sửa 10 câu sai thành câu đúng |
| **B3 — Hỏi–Đáp** | 120 phút | 40 câu Q&A, nhập vai | **Phần 6** | Nhập vai 5 tình huống, đạt |
| **B4 — An toàn & Sự cố** | 90 phút | Safety database, mã lỗi, kịch bản CSKH | **Phần 4**, **Phần 5** | Xử lý đúng 8 ca giả định |
| **B5 — Thực hành máy thật** | 60 phút | Bấm thử toàn bộ nút, thay lõi, reset, ghép app | Máy demo | Thay lõi + reset đúng trong 10 phút |
| **B6 — Kiểm tra** | 45 phút | 25 câu trắc nghiệm + 2 tình huống viết | — | Đạt ≥ 22/25 |

> ⚠️ **B5 là bắt buộc.** Nhiều lỗi tư vấn trong quá khứ (mức nhiệt 75 °C, "máy để bàn") xuất phát từ việc nhân viên **chưa từng chạm máy thật**.

---


<a id="p9-2"></a>
## 2. MƯỜI ĐIỀU PHẢI THUỘC LÒNG

| # | Điều | Mã |
|---|---|---|
| 1 | USH10 là **máy âm tủ bếp**, không phải máy để bàn | `F-A06` |
| 2 | **4 chế độ:** thường · 45 · 85 · 95 °C. **Không có 75 °C** | `F-E01` `F-E02` |
| 3 | **2 lõi — 4 bước lọc.** ⛔ Không đọc mã lõi | `F-C01` |
| 4 | Áp lực nước vào **0,1–0,4 MPa** — có ngưỡng dưới | `F-B08` |
| 5 | **Chỉ nước máy đô thị. Chỉ dùng cho gia đình** | `F-B14` `F-C21` |
| 6 | **Lõi lọc, mô-đun tiệt trùng, adapter KHÔNG được bảo hành** | `F-G03` |
| 7 | Lấy nước nóng luôn là **2 bước**: LOCK → nút nhiệt | `F-E04` |
| 8 | `C1` `C2` `SA` `EL` là **trạng thái bình thường**, không phải lỗi | **Phần 5** mục 1.1 |
| 9 | `E7` = rò rỉ → **tắt điện + khoá van NGAY** | `SF-13` |
| 10 | Kho hiện **0 lõi USH10** → ⛔ không hứa "có sẵn, thay ngay" | `F-K08` |

---


<a id="p9-3"></a>
## 3. MƯỜI CÂU CẤM — HỌC THUỘC ĐỂ KHÔNG BUỘT MIỆNG

```
⛔ "Diệt khuẩn 99,999%"
⛔ "Tốt nhất / duy nhất / cao nhất thị trường"
⛔ "Lõi bền 4 năm" (nói như cam kết)
⛔ "45 độ là nhiệt độ chuẩn pha sữa cho bé"
⛔ "An toàn tuyệt đối cho trẻ em"
⛔ "Nước này tốt cho sức khoẻ / tốt cho bé / tốt cho mẹ bầu"
⛔ "Magie tốt cho tim mạch" (và mọi công dụng khoáng)
⛔ "Áp lực 0 MPa cũng chạy"
⛔ "Nước nóng ra sau 2,8 giây"
⛔ "Bên em có sẵn lõi, thay ngay cho anh/chị"
```

---


<a id="p9-4"></a>
## 4. BÀI KIỂM TRA 25 CÂU

> 🔴 = câu chốt, **sai là trượt dù tổng điểm đạt**

### Phần A — Sản phẩm (10 câu)

**🔴 1.** USH10 thuộc loại máy nào?
A. Máy để bàn · B. **Máy âm tủ bếp (undersink)** · C. Máy đứng · D. Máy treo tường

**2.** Kích thước máy là bao nhiêu?
A. 467 × 179 × 477 mm · B. 477 × 179 × 467 mm · C. 467 × 279 × 477 mm · D. 400 × 180 × 500 mm

**3.** Máy có mấy chế độ nước và là những mức nào?
A. 3 mức: 45/75/95 · B. **4 mức: thường/45/85/95** · C. 4 mức: thường/45/75/95 · D. 5 mức

**4.** Máy có mấy lõi, mấy bước lọc?
A. 2 lõi – 4 bước · B. 4 lõi – 4 bước · C. 3 lõi – 5 bước · D. 7 lõi – 7 bước

**🔴 5.** Áp lực nước vào cho phép là bao nhiêu?
A. 0 – 0,4 MPa · B. **0,1 – 0,4 MPa** · C. 0,1 – 0,9 MPa · D. Không giới hạn

**6.** Nguồn nước áp dụng?
A. Nước máy đô thị và nước giếng khoan · B. **Chỉ nước máy đô thị** · C. Mọi nguồn nước · D. Nước máy và nước mưa

**7.** Công suất định mức và điện áp?
A. 2.000–2.400 W / 220–240V · B. **2.100 W / 220V ~ 50Hz** · C. 2.100 W / 220–240V · D. 2.000 W / 220V

**8.** Công suất làm nóng?
A. 2,1 L/phút · B. 1,8 L/phút · C. **20 L/giờ** · D. 8.600 L

**🔴 9.** Máy được thiết kế cho đối tượng nào?
A. Gia đình và văn phòng · B. **Chỉ hộ gia đình** · C. Gia đình, quán cà phê · D. Mọi đối tượng

**10.** Lấy nước nóng thao tác thế nào?
A. Chạm 1 nút nhiệt độ · B. **Chạm LOCK rồi chạm nút nhiệt độ** · C. Giữ nút 3 giây · D. Xoay vòi

### Phần B — Vận hành & Sự cố (7 câu)

**11.** Màn hình hiện `C1` nghĩa là gì?
A. Lỗi cảm biến · B. **Chế độ xả rửa lần đầu, chờ ~16 phút** · C. Lỗi bo mạch · D. Cần thay lõi

**12.** Khách báo "máy tự chạy xả nước, màn hiện C1". Hỏi gì trước?
A. Máy lắp bao lâu rồi · B. **Mặt vòi có đọng nước không** · C. Đèn lõi màu gì · D. Cử kỹ thuật ngay

**13.** `EL` là gì?
A. Lỗi rò rỉ · B. Lỗi gia nhiệt · C. **Máy đang tự bơm bù nước vào bình đun — bình thường** · D. Hết lõi

**🔴 14.** Máy báo `E7`. Việc đầu tiên phải làm?
A. Tắt/bật lại máy · B. **Tắt điện + khoá van bi cấp nước ngay** · C. Chạm nút Refresh · D. Xả rửa

**15.** Sau khi thay lõi mới, bước nào hay bị quên nhất?
A. Xoay lõi đúng chiều · B. Khoá van trước khi thay · C. **Giữ nút lõi 3 giây để reset** · D. Mở nắp trước

**16.** Sau reset lõi, máy hiện `C2` và cần xả rửa bao lâu?
A. 16 phút · B. **8 phút** · C. 30 giây · D. Không cần xả

**17.** Khách báo "mới lắp mà nước có bột đen". Trả lời?
A. Máy lỗi, cử kỹ thuật · B. **Bình thường — bột than từ lõi mới, xả tới khi nước trong** · C. Lõi giả · D. Thay lõi

### Phần C — Claim & Quy tắc (8 câu)

**🔴 18.** Khách hỏi "khoáng trong nước có tác dụng gì?". Trả lời đúng?
A. Liệt kê công dụng từng khoáng
B. "Magie tốt cho tim mạch, kẽm tăng đề kháng"
C. **"Cái này em không tư vấn được vì liên quan sức khoẻ. Em chỉ khẳng định máy giữ lại khoáng chứ không loại bỏ."**
D. "Nước có khoáng tốt cho sức khoẻ hơn nước RO"

**19.** Được nói gì về mô-đun tiệt trùng?
A. "Diệt 99,999% vi khuẩn" · B. **"Có mô-đun tiệt trùng lắp nối tiếp trên đường nước ra vòi"** · C. "Diệt sạch mọi vi khuẩn" · D. Không được nói gì

**20.** Về chu kỳ lõi, cách nói nào đúng?
A. "Lõi bền 4 năm" · B. "Cam kết dùng được 48 tháng" · C. **"Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo khi tới hạn"** · D. "Không cần thay lõi"

**21.** Khách hỏi "nước này pha sữa cho bé được không?". Câu nào ĐÚNG?
A. "Được, 45 độ là nhiệt độ chuẩn pha sữa"
B. **"Trên vòi có nút 45 độ hãng thiết kế cho tình huống pha sữa. Còn cách pha sữa cho bé thì anh/chị theo hướng dẫn hãng sữa và bác sĩ, em không tư vấn được."**
C. "Được, máy đạt chuẩn an toàn mẹ và bé"
D. "Nước giữ khoáng nên tốt cho bé"

**🔴 22.** Khách hỏi xin file chứng nhận TÜV. Làm gì?
A. Đọc số hiệu cho khách tra
B. Hứa gửi file trong hôm nay
C. **Nói nội dung chứng nhận, không đọc số hiệu, chuyển yêu cầu về phòng kỹ thuật để gửi bản chính thức**
D. Nói máy không có chứng nhận

**23.** Bộ phận nào KHÔNG được bảo hành?
A. Bơm · B. Bo mạch điều khiển · C. **Lõi lọc, mô-đun tiệt trùng, gioăng, vỏ trang trí, adapter** · D. Vòi

**24.** Khách hỏi "bên em có sẵn lõi thay ngay không?". Trả lời?
A. "Có sẵn, mai em qua thay"
B. **"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay."**
C. "Không có hàng"
D. "Anh/chị mua ngoài cũng được"

**🔴 25.** Khách muốn lắp cho quán cà phê. Trả lời?
A. "Được, máy lắp đâu cũng được"
B. **"HDSD ghi máy chỉ dành cho gia đình, không lắp nơi tiêu thụ nước cao. Em chuyển phòng kinh doanh để tư vấn giải pháp phù hợp."**
C. "Được, chỉ cần thay lõi thường xuyên hơn"
D. "Không bán cho quán"

---


<a id="p9-5"></a>
## 5. ĐÁP ÁN

| Câu | Đ.án | Câu | Đ.án | Câu | Đ.án | Câu | Đ.án | Câu | Đ.án |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **B** 🔴 | 6 | **B** | 11 | **B** | 16 | **B** | 21 | **B** |
| 2 | **A** | 7 | **B** | 12 | **B** | 17 | **B** | 22 | **C** 🔴 |
| 3 | **B** | 8 | **C** | 13 | **C** | 18 | **C** 🔴 | 23 | **C** |
| 4 | **A** | 9 | **B** 🔴 | 14 | **B** 🔴 | 19 | **B** | 24 | **B** |
| 5 | **B** 🔴 | 10 | **B** | 15 | **C** | 20 | **C** | 25 | **B** 🔴 |

---


<a id="p9-6"></a>
## 6. TÌNH HUỐNG NHẬP VAI

### T1 — Khách kỹ tính đòi giấy tờ
> *"Anh làm ngành xây dựng, anh biết mấy cái chứng nhận này. Em cho anh xem bản scan chứng chỉ TÜV, không phải cái ảnh quảng cáo."*

**Chấm điểm:** ✅ không hứa gửi file chưa có · ✅ không đọc số hiệu · ✅ nói được nội dung chứng nhận (57 thử nghiệm, EN 14350, LFGB, DIN EN 16889, **kiểm cả máy đã dùng lâu**) · ✅ đưa patent US 7138058 làm thứ khách tra được ngay · ✅ chuyển yêu cầu về phòng kỹ thuật.

### T2 — Khách đọc HDSD và bắt lỗi chu kỳ lõi
> *"Sách hãng ghi 24 đến 36 tháng. Sao website em ghi 48 tháng? Em nói dối à?"*

**Chấm điểm:** ✅ không nói "sách ghi sai" · ✅ phân biệt được **khuyến nghị của hãng** và **ngưỡng máy đếm** · ✅ trích được câu *"dữ liệu chỉ mang tính tham khảo"* · ✅ hướng khách về đèn báo · ✅ không hứa con số cứng · ✅ biết chuyển kỹ thuật nếu khách hỏi sâu hơn.

### T3 — Mẹ bỉm hỏi về bé
> *"Nhà chị có bé 6 tháng. Máy này pha sữa cho bé an toàn không em? Nước có khoáng thì có tốt cho bé không?"*

**Chấm điểm:** ✅ mô tả nút 45 độ như **chức năng**, không như khuyến nghị y tế · ✅ **từ chối tư vấn y khoa**, hướng về bác sĩ/hãng sữa · ✅ nói được cơ chế khoá trẻ em · ✅ **không nói "an toàn tuyệt đối"** · 🔴 **Trượt ngay** nếu buột miệng bất kỳ câu nào ở mục 3.

### T4 — Khách báo sự cố qua điện thoại
> *"Máy nhà anh tự nhiên chạy ầm ầm, màn hình hiện chữ C1, nước chảy suốt. Cử người xuống ngay."*

**Chấm điểm:** ✅ nhận ra `C1` **không phải lỗi** · ✅ hỏi ngay *"mặt vòi có đọng nước không"* · ✅ hướng dẫn lau khô + chạm nút nước thường xả 16 phút · ✅ **không cử kỹ thuật vô ích** · ✅ ghi ticket P4.

### T5 — Khách ép giá
> *"Anh xem chỗ khác bán 32 triệu. Em bớt được bao nhiêu thì nói luôn."*

**Chấm điểm:** ✅ **không tự ra giá** · ✅ không hạ giá ngay câu đầu · ✅ xử lý bằng giá trị (gộp 3 thiết bị, chi phí theo ngày) · ✅ nói rõ phải xin duyệt · ✅ không nói xấu nơi bán khác.

---


<a id="p9-7"></a>
## 7. SAI LẦM THƯỜNG GẶP CỦA NGƯỜI MỚI

| Sai lầm | Vì sao xảy ra | Cách chặn |
|---|---|---|
| Nói "mức 75 độ" | Đọc tài liệu cũ chưa sửa | **B5 — bấm thử máy thật** |
| Nói "máy để bàn" | `gwt/sales-cskh.md` ghi sai (O-15) | Sửa tài liệu gốc + B1 |
| Nói "99,999%" | Chatbot và tài liệu cũ còn câu này (O-16) | B2 + gỡ chatbot |
| Buột miệng công dụng khoáng | Phản xạ tự nhiên khi khách hỏi | Học thuộc câu thoát mục 3 **Phần 2** |
| Hứa "có sẵn lõi" | Muốn chốt nhanh | Nhắc kho **0 lõi** ở mọi buổi họp sáng |
| Đọc số chứng nhận cho khách | Tưởng là điểm mạnh | Số đúng rồi nhưng **trang tra cứu trống** (O-18) → **vẫn cấm đọc số, cấm gửi link** |
| Coi `C1`/`EL` là lỗi | Chưa đọc **Phần 5** | B4 + bảng tra dán tại bàn CSKH |
| Quên nói lõi không bảo hành | Sợ mất đơn | **Bắt buộc có trong checklist bàn giao** (**Phần 4** mục 10) |
| Tự ra giá | Không có bảng chiết khấu (O-08) | Quy định: mọi mức ngoài niêm yết phải có duyệt bằng văn bản |

---


<a id="p9-8"></a>
## 8. BẢNG DÁN TẠI BÀN CSKH (in A4)

```
┌─────────────────────────────────────────────────────────┐
│  USH10 — TRA NHANH                                      │
├─────────────────────────────────────────────────────────┤
│  🟢 BÌNH THƯỜNG, KHÔNG PHẢI LỖI                         │
│     C1  xả rửa lần đầu — chờ 16 phút                    │
│     C2  xả rửa sau thay lõi — chờ 8 phút                │
│     SA  đã reset mô-đun tiệt trùng                      │
│     EL  đang bơm bù nước bình đun                       │
│     Bột đen lúc mới lắp — xả tới khi nước trong         │
├─────────────────────────────────────────────────────────┤
│  🔴 TẮT ĐIỆN + KHOÁ VAN NGAY                            │
│     E7 rò rỉ · nghi rò điện · mùi khét · ngập tủ        │
├─────────────────────────────────────────────────────────┤
│  ❓ HỎI TRƯỚC KHI CỬ KỸ THUẬT                           │
│     Máy tự xả C1  →  MẶT VÒI CÓ ĐỌNG NƯỚC KHÔNG?        │
│     Không ra nước →  VAN BI 3 NGÃ ĐÃ MỞ HẾT CHƯA?       │
│     Không nước nóng → ĐÃ CHẠM LOCK CHƯA? THỬ LẠI 3 LẦN  │
├─────────────────────────────────────────────────────────┤
│  ⛔ KHÔNG BAO GIỜ NÓI                                    │
│     99,999%  ·  tốt nhất/duy nhất  ·  mã lõi            │
│     công dụng khoáng  ·  75 độ  ·  "có sẵn lõi ngay"    │
│     "tốt cho bé/mẹ bầu"  ·  số hiệu chứng nhận          │
├─────────────────────────────────────────────────────────┤
│  📌 NHỚ                                                  │
│     Lõi + mô-đun tiệt trùng + adapter: KHÔNG bảo hành   │
│     Áp lực nước vào: 0,1 – 0,4 MPa                      │
│     Chỉ nước máy đô thị · Chỉ hộ gia đình               │
│     Kho hiện 0 lõi → KIỂM TRA TỒN TRƯỚC KHI HẸN         │
└─────────────────────────────────────────────────────────┘
```

---


<a id="end"></a>

---

*Hết. USH10 Product Knowledge Database v1.0 — 19/08/2026.*
