---
loai: tham-khao
trang-thai: cho-duyet
ngay: 2026-11-17
---

# Danh sách lỗi sản phẩm theo model — tài liệu tham khảo cho người code

**Dùng để làm gì:** người code phần **nhóm lỗi / phân loại lỗi** (`/danh-muc-loi`, `/nhom-loi`, `/bao-cao-loi`) đọc để biết thực tế máy hay hỏng gì.
**Chưa phải danh mục chính thức.** Lỗi chỉ được hiện cho CSKH, dùng để tự phân loại và gợi ý xử lý khi CEO duyệt.

## Luật hiển thị

- Bảng `loi_danh_muc` đã có cột `trang_thai`: `cho_duyet` · `da_duyet` · `ngung`. **Chỉ dòng `da_duyet` được dùng** để tự phân loại / gợi ý (đúng như comment trên bảng).
- Lỗi mới lấy từ file này vào app thì luôn nhập ở `cho_duyet`. CEO duyệt nhóm nào thì nhóm đó mới chuyển `da_duyet`.
- Cột **Mã trong app** dưới đây: mã đã có (kèm trạng thái hiện tại, đọc 17/11/2026), hoặc **mã đề xuất** (in nghiêng) nếu chưa có.
- **Không có số liệu trong file này** (tỷ lệ lỗi, số máy, số ca) — repo này công khai. Số liệu và nguồn gốc từng dòng nằm ở Drive công ty (file kiểm kê Drive 07 + 10, mục C2).
- Mã lỗi màn hình (E1 / E3 / E4 / E5) **chưa có bảng tra chính thức theo model**; ý nghĩa dưới đây suy ra từ ca thực tế. Cần lấy bảng mã lỗi từ hướng dẫn của hãng.

## Máy lọc nước uống (POU)

| Model | Lỗi / dấu hiệu | Nguyên nhân ghi nhận | Xử lý đã làm | Mã trong app |
|---|---|---|---|---|
| CTS20 | Chảy, rò nước đáy máy ("đổ mồ hôi lạnh") | Ngưng tụ ở bầu / bơm lạnh | Tắt lạnh, lau khô; sơn gel, bọc xốp; đổi máy nếu không hết | `CTS20-RO-DAY` (đã duyệt) |
| CTS20 | Ống mao làm lạnh mài mòn → rò gas, mất lạnh | Bên trong máy chật, ống cọ vào linh kiện | Không sửa tại chỗ, **đổi máy** | *`CTS20-RO-GAS-LANH`* · gần `BAN-KHONG-LANH` |
| CTS20 | Ồn lớn | Thiết kế | Đã báo hãng | *`CTS20-ON`* · gần `MAY-KEU-TO` |
| CTS20 | **E3**: kẹt phao nước sạch | Xóc khi vận chuyển | Chỉnh phao | *`CTS20-E3-PHAO`* · gần `BAN-LOI-E1-E3-E7` |
| CTS20 | E3 / không ra nước: lõi lọc lỏng, lệch khớp | Khoá lõi yếu, xóc khi vận chuyển | Lắp lại lõi | *`CTS20-E3-LOI-LONG`* · gần `KHONG-RA-NUOC` |
| CTS20 | Báo hết gas ảo (vừa nhận bình, hôm sau báo hết; đèn gas đỏ / nhấp nháy) | Hiệu chỉnh cảm biến áp CO₂ | Vặn núm gas lên 40–43 | *`CTS20-GAS-AO`* |
| CTS20 | Không có nút xả đáy → máy lỗi không xả được, nước tràn khi chở đi | Thiết kế | Xả thủ công trước khi chở | *`CTS20-KHONG-XA-DAY`* |
| CTS20 | Vướng mối nối khi lắp bình gas; va đập linh kiện | Kết cấu | Báo hãng | *`CTS20-LAP-BINH-GAS`* |
| CTS20 | Rò nước đầu vòi lạnh | — | — | `CTS20-RO-VOI-LANH` (đã duyệt) |
| CTD50 | **E4**: lọc 2–3 giờ hoặc cả đêm mới đầy bình 2L | Cặn canxi tắc van 1 chiều (nước cứng, vệ sinh bình kém) | Thay van 1 chiều + oring (đem máy về) | `CTD50-LOC-CHAM` (đã duyệt) |
| CTD50 | Không nhận bình 2L, máy tự đẩy bình ra | Mắc gài kim loại biến dạng; oring mòn | Thay oring + van. Nắn mắc gài làm bình bị chặt — tránh | `CTD50-E4` (đã duyệt) |
| CTD50 | E3 + E1, đun nóng liên tục | Hỏng mainboard | Thay main | `BAN-LOI-E1-E3-E7` (đã duyệt) |
| CTD50 | Nước chảy chậm, tia bắn tung toé | Nghi vật cản ở vòi | Đang theo dõi | `CTD50-TIA-NUOC` (đã duyệt) |
| CTD50 | Dùng bình chứa sai cách | Hướng dẫn chưa rõ | Hướng dẫn lại | `DV-HUONG-DAN-TRA-CUU` (không phải lỗi) |
| USH10 + SPK45 | Ồn, lắp âm tủ còn to hơn | Thiết kế, cộng hưởng | Chờ hãng | *`USH10-SPK45-ON`* · gần `MAY-KEU-TO` |
| SPK45 | Nước có ga chỉ được tối đa khoảng 700 ml; lấy cạn phải khôi phục thủ công (tắt CO₂ → bấm SODA 2 lần → chờ) | Logic phần mềm | Hướng dẫn khách cách khôi phục; chờ hãng | *`SPK45-GA-GIOI-HAN`* |
| SPK45 | Quá nhiệt, báo lỗi khi lắp tủ kín mùa hè | Tản nhiệt bằng quạt | Mở thoáng tủ; chờ hãng | *`SPK45-QUA-NHIET`* |
| SPK45 | Khay nước ngưng ẩn sau máy dễ tràn | Thiết kế thoát nước | Hướng dẫn đổ khay; chờ hãng | *`SPK45-KHAY-TRAN`* |
| CTS10 | Chảy nước | — | Đổi bảo hành | `CTS10-RO-RI` (đã duyệt) |
| CTS10 | Hết gas sau 1–2 tháng | — | Thay bình | *`CTS10-HET-GAS`* |
| CTS10 | Máy có mùi; bình nước hở dễ tái nhiễm; lạnh không sâu; cảm biến dễ đơ | Thiết kế; nước thải dùng chung đường với nước vào | Đề xuất hãng cải tiến | `MUI-LA` (đã duyệt) |
| CTS10 | Khách đo TDS thấp / trung bình, tưởng nước bẩn | **Không phải lỗi** (công nghệ NF giữ khoáng) | Giải thích + công văn | *`KHONG-LOI-TDS`* (nhóm không phải lỗi) |
| B04 | **E1**, đèn báo lõi PCF nhấp nháy dù vừa thay | Nước cứng: cặn ở bình chứa, phao, cảm biến | Thay bơm, vệ sinh bình; khuyên đổi nguồn nước | *`B04-E1-CAN`* · gần `BAN-LOI-E1-E3-E7` |
| B04 | Mùi lạ ("mùi thuốc tây"), rò rỉ | — | Đổi bảo hành, thu về kho | `MUI-LA` · `RO-RI-NUOC` |
| GN620 | Rò rỉ nước | — | Thu hồi | `RO-RI-NUOC` (đã duyệt) |
| 5200EN | Tất cả đèn nhấp nháy | Cảnh báo rò rỉ | Kiểm tra rò | *`5200EN-DEN-NHAY`* |
| GTUN-8600HP | **E5** lỗi làm nóng, nước nóng bắn ra thân vòi | — | Thu hồi | `GTUN-8600-E5` (chờ duyệt) |
| GCUN-02VNT01 (thương mại) | Kêu to | Dây chạm vỏ; áp lực đầu vào yếu, nghi tắc lõi | Cố định dây, thêm lọc thô | `MAY-KEU-TO` (đã duyệt) |

## Lọc tổng đầu nguồn (POE) — lọc trung tâm GTEF, làm mềm GTEC (15A01, 30A01, 30A02)

| Bộ phận | Lỗi / dấu hiệu | Nguyên nhân ghi nhận | Xử lý đã làm | Mã trong app |
|---|---|---|---|---|
| Main màn hình | Đơ cảm ứng, mất wifi, màn trắng, sọc trắng hoặc đốm đen | Phần cứng main (chờ hãng phân tích) | Thay main dự phòng | `POE-MAIN-MAN-HINH` (đã duyệt) |
| Màn hình | Không lên | Giắc lỏng bên trong | Cắm lại | *`POE-MAN-KHONG-LEN`* |
| Cảm biến lưu lượng | Không chạy | Phần cứng | Chờ linh kiện | *`POE-FLOW-METER`* |
| Cảm biến rò | Báo rò rỉ liên tục | Cảm biến rơi vào khoang muối | Chỉnh lại cảm biến | *`POE-BAO-RO-AO`* |
| Hệ thống | Tiền lọc / lọc trung tâm không tự sục rửa khi lắp với tủ điện hoặc nhà mặt đất | Không nối tín hiệu tủ điện | Đề xuất thêm cảm biến | *`POE-KHONG-SUC-RUA`* |
| Hệ thống | Tank lẫn muối; bơm cấp chạy liên tục, **có thể cháy bơm** | Van điện từ đóng không kín, kẹt | Kiểm tra, thay van | *`POE-TANK-LAN-MUOI`* — đề xuất mức `an_toan` |
| Hệ thống | Nước thải chảy ra đầu ra khi sục rửa | Van ACE | Đề xuất cải tiến | *`POE-NUOC-THAI-RA`* |
| Làm mềm | Độ cứng sau lọc không đạt, cặn trắng; khách phản ánh tê tay sau bảo trì | Thiếu muối, cài đặt tái sinh sai | Tái sinh cưỡng bức, châm muối; nặng thì thay bộ | *`POE-DO-CUNG`* · gần `NUOC-CAN-BUI-TRANG` |

## Khi đưa vào app

1. Mã đề xuất (in nghiêng) nhập vào `loi_danh_muc` với `trang_thai = 'cho_duyet'`, `ma_may` theo model, `dau_hieu` = cột "Lỗi / dấu hiệu", `huong_xu_ly` = cột "Xử lý đã làm".
2. Dòng nào "gần" một mã chung đã duyệt: ticket cũ vẫn để ở mã chung; mã riêng chỉ dùng cho ticket mới sau khi duyệt.
3. CEO duyệt theo **nhóm** (vd cả nhóm CTS20) → chuyển `da_duyet`. Chưa duyệt thì CSKH không thấy, bộ tự phân loại không dùng.
