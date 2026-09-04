// ⚠️ FILE SINH TỰ ĐỘNG — KHÔNG SỬA TAY.
// Sinh bởi: tools/scripts/sync-wiki-sanpham.mjs  ·  chạy: npm --prefix apps/web run sync:wiki
// Sửa nội dung ở: apps/web/content/wiki/san-pham/<mã>/pkb.md
//                 apps/web/content/wiki/tai-lieu/<khu>/<bài>.md

import type { KhuTaiLieu, SanPham } from "../kieu";

export const SAN_PHAM: SanPham[] = [
  {
    "ma": "ush10",
    "ten": "Máy lọc nước GE USH10",
    "tenDayDu": "Máy lọc nước nóng công nghệ lọc nano GE USH10",
    "loai": "POU",
    "kieuLap": "Âm tủ bếp (undersink)",
    "maNoiBo": "GTUN-8600HP-G",
    "maNSX": "GTUN-8600HP",
    "phienBanPKB": "v1.2",
    "capNhat": "2026-08-28",
    "trangThai": "dang-ban",
    "tomTat": "Máy lọc nước nóng âm tủ bếp, lọc nano 4 lớp, 4 mức nhiệt (thường · 45 · 85 · 95 °C). PKB đã hợp nhất 16 tài liệu nguồn.",
    "anh": null,
    "bia": "# USH10 — PRODUCT KNOWLEDGE DATABASE\n\n**Máy lọc nước nóng công nghệ lọc nano GE USH10** · máy âm tủ bếp (undersink)\n\n| | |\n|---|---|\n| **Phiên bản** | `v1.2` |\n| **Ngày phát hành** | 19/08/2026 · **cập nhật 28/08/2026** |\n| **Chủ sở hữu** | GWT — Công ty TNHH Công nghệ Nước General |\n| **Mã nội bộ** | `GTUN-8600HP-G` · Model NSX: `GTUN-8600HP` |\n| **Nguồn ưu tiên số 1** | HDSD chính hãng bản quốc tế **Ver.26.08.14** |\n| **Số tài liệu nguồn đã hợp nhất** | 16 |\n| **Trạng thái** | Dùng được ngay cho tư vấn, đào tạo, CSKH. Phần marketing phải đọc **Phần 2** trước |\n\n---\n\n## ⚡ ĐỌC GÌ TRƯỚC — THEO VAI TRÒ\n\n| Bạn là | Đọc theo thứ tự này |\n|---|---|\n| **Sale mới** | Phần 9 (lộ trình đào tạo) → Phần 1 → Phần 2 → Phần 6 |\n| **Sale đang trực** | Phần 6 (Hỏi–Đáp) + bảng cấm nói đầu Phần 6 |\n| **CSKH tổng đài** | Phần 5 (Lỗi & xử lý) → Phần 3 → bảng dán A4 cuối Phần 9 |\n| **Kỹ thuật lắp đặt** | Phần 4 (Safety) → Phần 5 → Phần 1 mục D |\n| **Marketing / copywriter** | **Phần 2 (bắt buộc)** → Phần 7 → Phần 1 |\n| **Vận hành chatbot / AI** | Phần 1 → Phần 2 (đặc biệt mục 2.3 và bộ từ khoá chặn) → Phần 6 |\n| **Quản lý sản phẩm** | Phần 8 (ma trận đối chiếu nguồn + sổ mâu thuẫn mở) |\n\n## 🚦 BA NGUYÊN TẮC GỐC — ÁP DỤNG CHO MỌI NGƯỜI, MỌI KÊNH\n\n1. **Không bịa.** Mọi câu nói về sản phẩm phải truy được về một mã `F-xxx` trong **Phần 1**. Không có mã → không được nói.\n2. **Không suy diễn.** Không ghép 2 dữ kiện để tạo dữ kiện thứ 3. Không quy đổi, không ngoại suy.\n3. **Không nói y khoa.** Không nói về sức khoẻ, dinh dưỡng, bệnh tật, mẹ bầu, trẻ sơ sinh — kể cả gián tiếp, kể cả khi khách hỏi thẳng. Xem **Phần 2 · mục 2.3**.\n\n> **Câu thoát chuẩn khi không có dữ kiện:**\n> *\"Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em kiểm tra rồi báo lại anh/chị.\"*\n\n## 🔍 CÁCH TRA NHANH THEO MÃ\n\n| Mã | Là gì | Nằm ở |\n|---|---|---|\n| `F-A01` … `F-M11` | Dữ kiện sản phẩm | **Phần 1** |\n| `SF-01` … `SF-47` | Yêu cầu an toàn | **Phần 4** |\n| `O-01` … `O-19` | Mâu thuẫn chưa đóng, cần GWT chốt *(O-03, O-04 đã đóng 28/08)* | **Phần 8** |\n| `S1` … `S12`, `DM`, `BR`, `MD` | Mã tài liệu nguồn | **Phần 0 · mục 0.3** |\n| `E1`…`E9`, `C1`, `C2`, `SA`, `EL`, `SC` | Mã hiển thị trên vòi | **Phần 5 · mục 5.1** |\n| `Q1` … `Q40` | Câu hỏi khách | **Phần 6** |\n\n---\n\n# 📑 MỤC LỤC\n\n**[PHẦN 0 — CHỈ DẪN SỬ DỤNG, NGUỒN DỮ LIỆU & QUY TẮC](#phan-0-chi-dan-su-dung-nguon-du-lieu-quy-tac)**\n\n- [0.1. Database này dùng để làm gì](#0-1-database-nay-dung-de-lam-gi)\n- [0.2. Mười phần của tài liệu](#0-2-muoi-phan-cua-tai-lieu)\n- [0.3. Nguồn dữ liệu — mã nguồn và thứ tự ưu tiên](#0-3-nguon-du-lieu-ma-nguon-va-thu-tu-uu-tien)\n- [0.4. Hạng tin cậy & quyền công bố](#0-4-hang-tin-cay-quyen-cong-bo)\n- [0.5. Quy trình cập nhật](#0-5-quy-trinh-cap-nhat)\n- [0.6. Những gì bản v1.0 phát hiện mới so với hồ sơ 19/08/2026](#0-6-nhung-gi-ban-v1-0-phat-hien-moi-so-voi-ho-so-19-08-2026)\n- [0.7. Nhật ký thay đổi](#0-7-nhat-ky-thay-doi)\n- [0.8. Cảnh báo bảo mật kèm theo](#0-8-canh-bao-bao-mat-kem-theo)\n\n**[PHẦN 1 — BẢNG SỰ THẬT NGUYÊN TỬ (FACT TABLE)](#phan-1-bang-su-that-nguyen-tu-fact-table)**\n\n- [A. ĐỊNH DANH SẢN PHẨM](#a-dinh-danh-san-pham)\n- [B. THÔNG SỐ KỸ THUẬT](#b-thong-so-ky-thuat)\n- [C. CẤU HÌNH LỌC](#c-cau-hinh-loc)\n- [D. SƠ ĐỒ HỆ THỐNG](#d-so-do-he-thong)\n- [E. TÍNH NĂNG VẬN HÀNH](#e-tinh-nang-van-hanh)\n- [F. KẾT NỐI & ỨNG DỤNG](#f-ket-noi-ung-dung)\n- [G. BẢO HÀNH](#g-bao-hanh)\n- [H. GIÁ & CHI PHÍ](#h-gia-chi-phi)\n- [I. CHỨNG NHẬN](#i-chung-nhan)\n- [J. DANH MỤC ĐÓNG GÓI](#j-danh-muc-dong-goi)\n- [K. DỮ LIỆU KINH DOANH (🔵 TOÀN BỘ NỘI BỘ)](#k-du-lieu-kinh-doanh-toan-bo-noi-bo)\n- [L. SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ, KHÔNG PHẢI CÔNG BỐ CỦA HÃNG)](#l-suy-luan-so-hoc-hang-e-noi-bo-khong-phai-cong-bo-cua-hang)\n- [M. DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ (🔴 HẠNG X)](#m-du-kien-da-xac-dinh-sai-phai-go-hang-x)\n\n**[PHẦN 2 — QUY TẮC CLAIM — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI](#phan-2-quy-tac-claim-cam-noi-than-trong-duoc-noi)**\n\n- [0. BA NGUYÊN TẮC GỐC](#0-ba-nguyen-tac-goc)\n- [1. 🔴 DANH SÁCH ĐỎ — CẤM TUYỆT ĐỐI](#1-danh-sach-do-cam-tuyet-doi)\n- [2. 🟡 DANH SÁCH VÀNG — NÓI ĐƯỢC NHƯNG PHẢI ĐÚNG CÂU CHỮ](#2-danh-sach-vang-noi-duoc-nhung-phai-dung-cau-chu)\n- [3. 🚨 QUY TẮC MẸ & BÉ / Y KHOA — NGHIÊM NGẶT NHẤT](#3-quy-tac-me-be-y-khoa-nghiem-ngat-nhat)\n- [4. 🟢 DANH SÁCH XANH — ĐƯỢC NÓI THOẢI MÁI](#4-danh-sach-xanh-duoc-noi-thoai-mai)\n- [5. QUY TẮC RIÊNG THEO KÊNH](#5-quy-tac-rieng-theo-kenh)\n- [6. CHECKLIST TRƯỚC KHI XUẤT BẢN](#6-checklist-truoc-khi-xuat-ban)\n\n**[PHẦN 3 — HƯỚNG DẪN KHÁCH HÀNG — SỬ DỤNG · VỆ SINH · THAY LÕI](#phan-3-huong-dan-khach-hang-su-dung-ve-sinh-thay-loi)**\n\n- [1. NGÀY ĐẦU TIÊN — SAU KHI LẮP XONG](#1-ngay-dau-tien-sau-khi-lap-xong)\n- [2. DÙNG HẰNG NGÀY](#2-dung-hang-ngay)\n- [3. 4 THÓI QUEN NÊN CÓ](#3-4-thoi-quen-nen-co)\n- [4. VỆ SINH & BẢO DƯỠNG](#4-ve-sinh-bao-duong)\n- [5. THAY LÕI LỌC](#5-thay-loi-loc)\n- [6. KẾT NỐI ỨNG DỤNG G+ LIFE](#6-ket-noi-ung-dung-g-life)\n- [7. ĐI VẮNG DÀI NGÀY](#7-di-vang-dai-ngay)\n- [8. NHỮNG GÌ KHÁCH THƯỜNG HIỂU NHẦM](#8-nhung-gi-khach-thuong-hieu-nham)\n- [9. SỐ CẦN NHỚ CHO KHÁCH](#9-so-can-nho-cho-khach)\n\n**[PHẦN 4 — SAFETY DATABASE](#phan-4-safety-database)**\n\n- [1. PHÂN LOẠI MỨC RỦI RO](#1-phan-loai-muc-rui-ro)\n- [2. 🔴 N1 — CẢNH BÁO AN TOÀN ĐIỆN & CHÁY NỔ](#2-n1-canh-bao-an-toan-dien-chay-no)\n- [3. 🔴 N1 — CẢNH BÁO NƯỚC & NGẬP](#3-n1-canh-bao-nuoc-ngap)\n- [4. 🟠 N2 — ĐIỀU KIỆN VẬN HÀNH BẮT BUỘC](#4-n2-dieu-kien-van-hanh-bat-buoc)\n- [5. 🔴 RỦI RO BỎNG — NƯỚC 95 °C](#5-rui-ro-bong-nuoc-95-c)\n- [6. 🟠 QUY TRÌNH KHẨN CẤP](#6-quy-trinh-khan-cap)\n- [7. 🟡 N3 — LƯU Ý DÙNG HẰNG NGÀY](#7-n3-luu-y-dung-hang-ngay)\n- [8. AN TOÀN TRONG LẮP ĐẶT (dành cho kỹ thuật)](#8-an-toan-trong-lap-dat-danh-cho-ky-thuat)\n- [9. BẢNG TRA NHANH — \"KHI NÀO PHẢI DỪNG MÁY NGAY\"](#9-bang-tra-nhanh-khi-nao-phai-dung-may-ngay)\n- [10. NỘI DUNG BÀN GIAO KHÁCH (checklist kỹ thuật ký nhận)](#10-noi-dung-ban-giao-khach-checklist-ky-thuat-ky-nhan)\n\n**[PHẦN 5 — LỖI THƯỜNG GẶP & CÁCH XỬ LÝ](#phan-5-loi-thuong-gap-cach-xu-ly)**\n\n- [1. BẢNG MÃ HIỂN THỊ TRÊN VÒI](#1-bang-ma-hien-thi-tren-voi)\n- [2. BẢNG SỰ CỐ — HIỆN TƯỢNG → NGUYÊN NHÂN → XỬ LÝ](#2-bang-su-co-hien-tuong-nguyen-nhan-xu-ly)\n- [3. SỰ CỐ HIỆN TRƯỜNG (không có trong HDSD)](#3-su-co-hien-truong-khong-co-trong-hdsd)\n- [4. KỊCH BẢN CSKH — HỎI TRƯỚC KHI CỬ KỸ THUẬT](#4-kich-ban-cskh-hoi-truoc-khi-cu-ky-thuat)\n- [5. QUY TẮC LEO THANG](#5-quy-tac-leo-thang)\n- [6. NHỮNG GÌ CSKH KHÔNG ĐƯỢC HƯỚNG DẪN KHÁCH TỰ LÀM](#6-nhung-gi-cskh-khong-duoc-huong-dan-khach-tu-lam)\n- [7. MẪU GHI TICKET](#7-mau-ghi-ticket)\n\n**[PHẦN 6 — BỘ HỎI–ĐÁP ĐÃ KIỂM CHỨNG](#phan-6-bo-hoi-dap-da-kiem-chung)**\n\n- [BẢNG CẤM NÓI — RÚT GỌN, ĐỌC TRƯỚC MỖI CA TRỰC](#bang-cam-noi-rut-gon-doc-truoc-moi-ca-truc)\n- [NHÓM 1 — TỔNG QUAN](#nhom-1-tong-quan)\n- [NHÓM 2 — NƯỚC NÓNG](#nhom-2-nuoc-nong)\n- [NHÓM 3 — TIỆT TRÙNG & AN TOÀN NƯỚC](#nhom-3-tiet-trung-an-toan-nuoc)\n- [NHÓM 4 — VÒI THÔNG MINH](#nhom-4-voi-thong-minh)\n- [NHÓM 5 — LÕI LỌC & CHI PHÍ](#nhom-5-loi-loc-chi-phi)\n- [NHÓM 6 — LẮP ĐẶT & VẬN HÀNH](#nhom-6-lap-dat-van-hanh)\n- [NHÓM 7 — APP & KẾT NỐI](#nhom-7-app-ket-noi)\n- [NHÓM 8 — BẢO HÀNH & HẬU MÃI](#nhom-8-bao-hanh-hau-mai)\n- [NHÓM 9 — CÂU HỎI KHÓ (XỬ LÝ PHẢN ĐỐI)](#nhom-9-cau-hoi-kho-xu-ly-phan-doi)\n- [NHÓM 10 — TRA NHANH CHO CSKH](#nhom-10-tra-nhanh-cho-cskh)\n- [Mã hiển thị trên vòi](#ma-hien-thi-tren-voi)\n- [Sự cố — hỏi khách trước khi cử kỹ thuật](#su-co-hoi-khach-truoc-khi-cu-ky-thuat)\n- [Thông số tra nhanh](#thong-so-tra-nhanh)\n- [Phụ lục — 7 việc file này đang chờ GWT chốt](#phu-luc-nhung-viec-file-nay-dang-cho-gwt-chot)\n\n**[PHẦN 7 — NGUYÊN LIỆU MARKETING ĐÃ DUYỆT NGUỒN](#phan-7-nguyen-lieu-marketing-da-duyet-nguon)**\n\n- [1. NGUYÊN TẮC BIÊN TẬP CHO USH10](#1-nguyen-tac-bien-tap-cho-ush10)\n- [2. SÁU GÓC KỂ CHUYỆN CÓ SẴN DỮ LIỆU](#2-sau-goc-ke-chuyen-co-san-du-lieu)\n- [3. KHỐI NỘI DUNG ĐÃ DUYỆT — DÙNG NGUYÊN VĂN ĐƯỢC](#3-khoi-noi-dung-da-duyet-dung-nguyen-van-duoc)\n- [4. KHUNG LANDING PAGE](#4-khung-landing-page)\n- [5. KHUNG VIDEO (5 beat, ~3 phút)](#5-khung-video-5-beat-3-phut)\n- [6. BRIEF CHO KOL / REVIEWER](#6-brief-cho-kol-reviewer)\n- [7. TỪ ĐIỂN THAY THẾ NHANH](#7-tu-dien-thay-the-nhanh)\n- [8. TÌNH TRẠNG TÀI SẢN MARKETING (🔵 nội bộ)](#8-tinh-trang-tai-san-marketing-noi-bo)\n\n**[PHẦN 8 — MA TRẬN ĐỐI CHIẾU NGUỒN & SỔ MÂU THUẪN](#phan-8-ma-tran-doi-chieu-nguon-so-mau-thuan)**\n\n- [BẢNG CỘT NGUỒN](#bang-cot-nguon)\n- [BẢNG 1 — THÔNG SỐ KỸ THUẬT](#bang-1-thong-so-ky-thuat)\n- [BẢNG 2 — LÕI LỌC & CHU KỲ THAY](#bang-2-loi-loc-chu-ky-thay)\n- [BẢNG 3 — TÍNH NĂNG & GIAO DIỆN VÒI](#bang-3-tinh-nang-giao-dien-voi)\n- [BẢNG 4 — MÃ LỖI (kể cả mâu thuẫn NỘI BỘ trong cùng 1 tài liệu)](#bang-4-ma-loi-ke-ca-mau-thuan-noi-bo-trong-cung-1-tai-lieu)\n- [BẢNG 5 — CHỨNG NHẬN & PHÁP LÝ](#bang-5-chung-nhan-phap-ly)\n- [BẢNG 6 — THƯƠNG MẠI & TÀI LIỆU NỘI BỘ](#bang-6-thuong-mai-tai-lieu-noi-bo)\n- [BẢNG 7 — SỔ MÂU THUẪN MỞ (việc cần GWT chốt)](#bang-7-so-mau-thuan-mo-viec-can-gwt-chot)\n- [Bảng ưu tiên xử lý](#bang-uu-tien-xu-ly)\n\n**[PHẦN 9 — ĐÀO TẠO & KIỂM TRA](#phan-9-dao-tao-kiem-tra)**\n\n- [1. LỘ TRÌNH ĐÀO TẠO](#1-lo-trinh-dao-tao)\n- [2. MƯỜI ĐIỀU PHẢI THUỘC LÒNG](#2-muoi-dieu-phai-thuoc-long)\n- [3. MƯỜI CÂU CẤM — HỌC THUỘC ĐỂ KHÔNG BUỘT MIỆNG](#3-muoi-cau-cam-hoc-thuoc-de-khong-buot-mieng)\n- [4. BÀI KIỂM TRA 25 CÂU](#4-bai-kiem-tra-25-cau)\n- [5. ĐÁP ÁN](#5-dap-an)\n- [6. TÌNH HUỐNG NHẬP VAI](#6-tinh-huong-nhap-vai)\n- [7. SAI LẦM THƯỜNG GẶP CỦA NGƯỜI MỚI](#7-sai-lam-thuong-gap-cua-nguoi-moi)\n- [8. BẢNG DÁN TẠI BÀN CSKH (in A4)](#8-bang-dan-tai-ban-cskh-in-a4)\n\n### Chỉ mục 40 câu hỏi khách hàng (Phần 6)\n\n- [Q1. USH10 là máy gì? Đặt ở đâu?](#q1-ush10-la-may-gi-dat-o-dau)\n- [Q2. Máy chiếm bao nhiêu chỗ trong tủ bếp?](#q2-may-chiem-bao-nhieu-cho-trong-tu-bep)\n- [Q3. Máy này lọc bằng công nghệ gì? Có phải RO không?](#q3-may-nay-loc-bang-cong-nghe-gi-co-phai-ro-khong)\n- [Q4. Máy có mấy lõi lọc? Lọc qua mấy bước?](#q4-may-co-may-loi-loc-loc-qua-may-buoc)\n- [Q5. Máy dùng được cho quán cà phê / văn phòng không?](#q5-may-dung-duoc-cho-quan-ca-phe-van-phong-khong)\n- [Q6. Máy có mấy mức nhiệt?](#q6-may-co-may-muc-nhiet)\n- [Q7. Chọn nhiệt độ thế nào? Trẻ con bấm nhầm có sao không?](#q7-chon-nhiet-do-the-nao-tre-con-bam-nham-co-sao-khong)\n- [Q8. Chỉnh nhiệt độ được không hay cố định?](#q8-chinh-nhiet-do-duoc-khong-hay-co-dinh)\n- [Q9. Đun được bao nhiêu nước một giờ? Chờ có lâu không?](#q9-dun-duoc-bao-nhieu-nuoc-mot-gio-cho-co-lau-khong)\n- [Q10. Máy có giữ nóng liên tục không? Tốn điện không?](#q10-may-co-giu-nong-lien-tuc-khong-ton-dien-khong)\n- [Q11. Máy có tiệt trùng không? Đặt ở đâu?](#q11-may-co-tiet-trung-khong-dat-o-dau)\n- [Q12. Nước để lâu trong máy có bị tù không?](#q12-nuoc-de-lau-trong-may-co-bi-tu-khong)\n- [Q13. Nước lọc rồi uống trực tiếp được không?](#q13-nuoc-loc-roi-uong-truc-tiep-duoc-khong)\n- [Q14. Vòi có gì đặc biệt?](#q14-voi-co-gi-dac-biet)\n- [Q15. Làm sao biết khi nào phải thay lõi?](#q15-lam-sao-biet-khi-nao-phai-thay-loi)\n- [Q16. Bao lâu thay lõi một lần? Hết bao nhiêu tiền?](#q16-bao-lau-thay-loi-mot-lan-het-bao-nhieu-tien)\n- [Q17. Khách mở HDSD ra và hỏi: \"Sao sách ghi 24–36 tháng mà anh nói 48 tháng?\"](#q17-khach-mo-hdsd-ra-va-hoi-sao-sach-ghi-24-36-thang-ma-anh-noi-48-thang)\n- [Q18. Thay lõi có phải gọi thợ không?](#q18-thay-loi-co-phai-goi-tho-khong)\n- [Q19. Ngoài lõi ra còn phải thay gì nữa không?](#q19-ngoai-loi-ra-con-phai-thay-gi-nua-khong)\n- [Q20. Chi phí dùng máy trong 5 năm khoảng bao nhiêu?](#q20-chi-phi-dung-may-trong-5-nam-khoang-bao-nhieu)\n- [Q21. Lắp đặt mất bao lâu? Cần đục đẽo gì không?](#q21-lap-dat-mat-bao-lau-can-duc-deo-gi-khong)\n- [Q22. Nhà tôi áp lực nước yếu, có dùng được không?](#q22-nha-toi-ap-luc-nuoc-yeu-co-dung-duoc-khong)\n- [Q23. Máy có kén nguồn nước không? Nước giếng khoan được không?](#q23-may-co-ken-nguon-nuoc-khong-nuoc-gieng-khoan-duoc-khong)\n- [Q24. Máy có tốn điện không? Đi vắng có phải rút điện không?](#q24-may-co-ton-dien-khong-di-vang-co-phai-rut-dien-khong)\n- [Q25. Máy có phải nối đất không?](#q25-may-co-phai-noi-dat-khong)\n- [Q26. Máy kết nối điện thoại được không? Làm gì trên app?](#q26-may-ket-noi-dien-thoai-duoc-khong-lam-gi-tren-app)\n- [Q27. Bảo hành bao lâu?](#q27-bao-hanh-bao-lau)\n- [Q28. \"Máy có chứng nhận gì không? Cho tôi xem giấy tờ.\"](#q28-may-co-chung-nhan-gi-khong-cho-toi-xem-giay-to)\n- [Q29. Máy hỏng thì bao lâu có người tới? Có sẵn lõi không?](#q29-may-hong-thi-bao-lau-co-nguoi-toi-co-san-loi-khong)\n- [Q30. Máy dùng được bao lâu thì phải thay?](#q30-may-dung-duoc-bao-lau-thi-phai-thay)\n- [Q31. \"Máy này đắt quá, sao 45 triệu?\"](#q31-may-nay-dat-qua-sao-45-trieu)\n- [Q32. \"Nano có lọc sạch bằng RO không?\"](#q32-nano-co-loc-sach-bang-ro-khong)\n- [Q33. \"So với Karofi / Kangaroo / AO Smith thì sao?\"](#q33-so-voi-karofi-kangaroo-ao-smith-thi-sao)\n- [Q34. \"Tôi quên thay lõi thì sao? Có hại không?\"](#q34-toi-quen-thay-loi-thi-sao-co-hai-khong)\n- [Q35. \"Sao chỉ có 2 lõi? Máy khác 7–9 lõi cơ mà.\"](#q35-sao-chi-co-2-loi-may-khac-7-9-loi-co-ma)\n- [Q36. \"Máy Trung Quốc gắn mác GE à?\"](#q36-may-trung-quoc-gan-mac-ge-a)\n- [Q37. \"Nhà tôi có bé, nước này pha sữa được không?\"](#q37-nha-toi-co-be-nuoc-nay-pha-sua-duoc-khong)\n- [Q38. \"Máy này có làm nước kiềm / ion kiềm không?\"](#q38-may-nay-co-lam-nuoc-kiem-ion-kiem-khong)\n- [Q39. \"Máy có đo TDS không? Sao số TDS lệch với máy đo cầm tay của tôi?\"](#q39-may-co-do-tds-khong-sao-so-tds-lech-voi-may-do-cam-tay-cua-toi)\n- [Q40. \"Nhà tôi ở tầng cao / vùng núi, nước 95 độ có ra đúng 95 không?\"](#q40-nha-toi-o-tang-cao-vung-nui-nuoc-95-do-co-ra-dung-95-khong)\n\n---",
    "phan": [
      {
        "so": 0,
        "slug": "chi-dan",
        "ten": "Chỉ dẫn, nguồn dữ liệu & quy tắc",
        "nhom": "quan-ly",
        "coNoiDung": true,
        "noiDung": "# PHẦN 0 — CHỈ DẪN SỬ DỤNG, NGUỒN DỮ LIỆU & QUY TẮC\n\n\n## 0.1. Database này dùng để làm gì\n\n| # | Mục đích | Đọc phần nào |\n|---|---|---|\n| 1 | Dữ liệu gốc cho **AI/nhân viên tư vấn** trả lời khách | **Phần 1** (Fact Table) → **Phần 2** (Quy tắc claim) → **Phần 6** (Hỏi–Đáp) |\n| 2 | Dữ liệu **đào tạo sales / CSKH** | **Phần 9** (Đào tạo) + Phần 1, 5, 6 |\n| 3 | Nguồn viết **marketing, quảng cáo, landing page, video, social** | **Phần 7** (Nguyên liệu marketing) — bắt buộc đọc **Phần 2** trước |\n| 4 | **Hướng dẫn khách** sử dụng, vệ sinh, thay lõi, xử lý tình huống | **Phần 3** (HDSD) + **Phần 4** (Safety) + **Phần 5** (Sự cố) |\n| 5 | **Chặn AI/nhân viên suy diễn** hoặc nói sai | **Phần 2** (Quy tắc claim) + **Phần 8** (Mâu thuẫn mở) |\n\n\n## 0.2. Mười phần của tài liệu\n\n| Phần | Nội dung | Ai dùng |\n|---|---|---|\n| **0** | Bạn đang đọc. Quy tắc nguồn, hạng tin cậy, quy trình cập nhật | Tất cả |\n| **1** | **Bảng sự thật nguyên tử (Fact Table)** — mỗi dòng 1 dữ kiện, có mã `F-xxx`, nguồn, hạng tin cậy, quyền công bố | Tất cả · **AI đọc phần này trước** |\n| **2** | **Quy tắc claim** — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI + câu thay thế an toàn + quy tắc mẹ & bé và y khoa | Marketing, Sales, AI |\n| **3** | **Hướng dẫn khách hàng** — dùng, vệ sinh, thay lõi, đi vắng, hiểu nhầm thường gặp | CSKH, khách hàng |\n| **4** | **Safety Database** — cảnh báo an toàn, quy trình khẩn cấp, điều kiện lắp đặt bắt buộc | Kỹ thuật, CSKH, Sales |\n| **5** | **Lỗi & xử lý** — mã lỗi, sự cố hiện trường, kịch bản hỏi khách, quy tắc leo thang | CSKH, Kỹ thuật |\n| **6** | **40 câu hỏi–đáp** đã kiểm chứng, có bản ngắn và bản đầy đủ | Sales, CSKH, Chatbot |\n| **7** | **Nguyên liệu marketing** — khối nội dung đã duyệt nguồn, góc kể chuyện, khung landing page/video | Marketing |\n| **8** | **MA TRẬN ĐỐI CHIẾU NGUỒN** (cột = nguồn, dòng = dữ kiện bị đá nhau) + sổ mâu thuẫn mở `O-01`…`O-19` | Quản lý sản phẩm, Marketing, AI |\n| **9** | **Đào tạo & kiểm tra** — lộ trình, bài kiểm tra 25 câu + đáp án, tình huống nhập vai | Đào tạo |\n\n> 📌 **Cách đọc tham chiếu chéo:** trong toàn bộ tài liệu, ký hiệu **Phần 1**, **Phần 2**… là số hiệu phần ở bảng trên. Mã `F-xxx` truy về **Phần 1**. Mã `SF-xx` truy về **Phần 4**. Mã `O-xx` truy về **Phần 8**.\n\n\n## 0.3. Nguồn dữ liệu — mã nguồn và thứ tự ưu tiên\n\nMọi dữ kiện trong **Phần 1** đều **bắt buộc** có mã nguồn. Không có mã nguồn = không được đưa vào database.\n\n| Mã | Tài liệu | Loại | Hạng |\n|---|---|---|---|\n| **S1** | `USH10 Manual.pdf` — HDSD chính hãng bản quốc tế, **Ver.26.08.14**, EN, 28 trang. NSX ghi trên bìa: *General Water Technology (HongKong) Co., Ltd.* + bản dịch `USH10 Manual - VI.md` | HDSD chính hãng | **A — cao nhất** |\n| **S2** | HDSD bản Trung Quốc (`Manual-USH10-220V-Chinese Version`) — không có trong thư mục hiện tại, trích qua hồ sơ nội bộ | HDSD chính hãng (thị trường TQ) | **A−** (gián tiếp) |\n| **S3** | `极煦系列净热一体机产品介绍.pptx` — tài liệu giới thiệu dòng sản phẩm của NSX | Tài liệu bán hàng NSX | **B** |\n| **S4** | `Product Introdution USH10 + SPK25 (2).pdf` — giới thiệu giải pháp 极沁Max (USH10 + máy nước có ga SPK25) | Tài liệu bán hàng NSX | **B** |\n| **S5** | `Thông tin chi tiết TUV.pdf` — bản mô tả nội dung chứng nhận TÜV Rheinland (**không phải bản scan chứng chỉ**) | Tóm tắt chứng nhận | **B** |\n| **S6** | `H. Thông số kỹ thuật điều khiển điện … V1.8 · 15/05/2022` — quy cách bo mạch/logic điều khiển **cho cả họ máy** | Kỹ thuật nội bộ NSX | **C** ⛔ đóng dấu *\"内部资料，不可外泄\" (nội bộ, không phổ biến)* |\n| **S7** | `G. Những lưu ý khi lắp đặt máy All-in-one heater · 23-3` — thông báo kỹ thuật hậu mãi của NSX | Thông báo kỹ thuật | **C** |\n| **S8** | `GE UTS Hot Water Purifier (All-in-One) - Installation.pptx` — giáo trình lắp đặt | Đào tạo kỹ thuật | **C** (OCR kém, dùng hạn chế) |\n| **S9** | `USH10-HO-SO-SAN-PHAM-2026-08-19.md` + `USH10-TONG-HOP-2026-08-18.md` — hồ sơ nội bộ GWT | Nội bộ GWT | **A** cho dữ liệu kinh doanh (giá, kho, bán hàng) · **D** cho thông số kỹ thuật |\n| **S10** | `USH10-TINH-NANG-HOI-DAP-KHACH-HANG.md` — bộ Q&A nội bộ 19/08/2026 | Nội bộ GWT | **D** |\n| **S11** | `NEW -GE 厨下净热一体售后维修培训课件-下篇.pptx` | Đào tạo sửa chữa | ❌ **Không dùng được** — OCR hỏng hoàn toàn |\n| **S12** | `USH10 Spec Sheet.pdf` | Spec sheet | ❌ **Không dùng được** — file chỉ có ảnh, không có chữ |\n| **S13** 🆕 | **Sơ đồ cấu tạo & sơ đồ 4 lớp lọc của NSX** (hình cắt máy + sơ đồ `第1层…第4层`, tiếng Trung) — bổ sung 20/08/2026 | Sơ đồ kỹ thuật NSX | **B** — ⚠️ sơ đồ này **không có mô-đun UVC**, thêm một dấu hiệu đây là tài liệu thị trường Trung Quốc (`O-01`) |\n\n**Thêm 2 nguồn viết tắt dùng trong ma trận đối chiếu ở Phần 8:**\n\n| Mã | Nguồn |\n|---|---|\n| **DM** | **Danh mục hàng hoá GWT — Product Filter** (PDF, 31/07/2026) — nguồn ưu tiên số 2 theo GWT |\n| **BR / MD** | Brochure VN · Master Data GWT & nội dung chatbot |\n\n### Thứ tự ưu tiên khi 2 nguồn đá nhau\n\n```\nS1 (HDSD quốc tế Ver.26.08.14)\n   >  DM — Danh mục hàng hoá GWT (Product Filter, bản 31/07/2026)\n   >  S2 (HDSD bản TQ)\n   >  S3/S4 (tài liệu NSX)\n   >  S6/S7 (kỹ thuật nội bộ)\n   >  S9/S10 (master data, brochure VN, chatbot)\n```\n\n> ⚠️ **Ngoại lệ đang chờ chốt:** GWT **chưa xác nhận** máy bán tại VN đi kèm bản HDSD nào (quốc tế Ver.26.08.14 hay bản TQ). Xem **Phần 8**, mục `O-01`. Toàn bộ database này đang giả định **bản quốc tế Ver.26.08.14** là bản đi kèm máy bán tại VN.\n\n\n## 0.4. Hạng tin cậy & quyền công bố\n\nMỗi dữ kiện có 2 nhãn: **Hạng tin cậy** và **Quyền công bố**.\n\n| Hạng | Nghĩa | Ví dụ |\n|---|---|---|\n| **A** | Ghi trong HDSD chính hãng đi kèm máy | Kích thước 467×179×477 mm |\n| **B** | Ghi trong tài liệu chính hãng khác (deck NSX, mô tả chứng nhận) | IPX4, vòi xoay 120° |\n| **C** | Tài liệu kỹ thuật nội bộ hoặc cấp họ máy — **có thể khác bản đang bán** | Ngưỡng đếm lõi 360/1.440 ngày |\n| **D** | Tài liệu VN chưa truy được nguồn gốc (brochure, master data, chatbot) | Hộp đun inox 316 |\n| **E** | **Suy luận số học của người soạn database** — không phải công bố của hãng | 6.630 L ÷ 6 L/ngày ≈ 1.105 ngày (`F-L05`) |\n| **X** | Đã xác định là **SAI**, phải gỡ khỏi mọi tài liệu | Mức nhiệt 75 °C |\n\n| Quyền công bố | Ý nghĩa |\n|---|---|\n| 🟢 **CÔNG BỐ** | Được nói với khách, được lên hình, lên landing page, lên video |\n| 🟡 **NÓI ĐƯỢC — CÓ ĐIỀU KIỆN** | Nói được nhưng phải theo cách diễn đạt quy định ở **Phần 2** |\n| 🔵 **NỘI BỘ** | Nhân viên biết để tư vấn, **không đưa lên tài liệu xuất bản**, không đọc số cho khách |\n| 🔴 **CẤM** | Không được nói dưới bất kỳ hình thức nào |\n\n### Quy tắc mặc định cho AI và nhân viên\n\n1. **Chỉ hạng A và B được lên nội dung xuất bản.** C, D, E là kiến thức nội bộ.\n2. Nếu một câu hỏi **không có dữ kiện trong Phần 1** → trả lời: *\"Thông tin này em chưa có xác nhận chính thức, em kiểm tra và báo lại anh/chị.\"* **Tuyệt đối không suy đoán.**\n3. **Không được ghép 2 dữ kiện để tạo ra dữ kiện thứ 3** (ví dụ: lấy công suất đun chia cho dung tích để suy ra thời gian). Mọi phép tính suy ra phải nằm ở hạng E và là nội bộ.\n4. **Không suy diễn y khoa, dinh dưỡng, hay công dụng sức khoẻ** dưới bất kỳ hình thức nào. Xem **Phần 2**, mục 2.3.\n5. Khi khách hỏi bằng chứng/giấy tờ → theo kịch bản **Phần 6 · Q28**, không hứa gửi file chưa có trong tay.\n\n\n## 0.5. Quy trình cập nhật\n\n| Bước | Việc | Ai |\n|---|---|---|\n| 1 | Có dữ kiện mới (tài liệu, xác nhận từ GWT, kết quả đo thực tế) | Bất kỳ ai phát hiện |\n| 2 | Ghi vào **Phần 8** nếu nó **đá** dữ kiện cũ, kèm nguồn | Người phát hiện |\n| 3 | Người phụ trách sản phẩm quyết định giữ dữ kiện nào | PM sản phẩm |\n| 4 | Sửa **Phần 1** — **giữ mã `F-xxx` cũ, đổi giá trị + ghi ngày đổi** | PM sản phẩm |\n| 5 | Rà lan toả: Phần 2 → 3 → 5 → 6 → 7 → 9 | PM sản phẩm |\n| 6 | Tăng số phiên bản, ghi vào Nhật ký thay đổi (mục 0.7) | PM sản phẩm |\n\n> **Nguyên tắc bất di bất dịch:** thà **thiếu thông tin** còn hơn **thông tin sai**. Một câu sai đã được nhân bản qua 5 tài liệu (trường hợp mức nhiệt 75 °C) tốn nhiều công sửa hơn là để trống ngay từ đầu.\n\n\n## 0.6. Những gì bản v1.0 phát hiện mới so với hồ sơ 19/08/2026\n\n| # | Phát hiện | Ảnh hưởng |\n|---|---|---|\n| **N1** | **Tìm được nguồn cho 5 claim marketing trước đây \"không truy được nguồn\"**: `IPX4`, `bo mạch phủ keo 100%`, `vòi xoay 120° (±60°)`, `2,8 giây`, `\"Mỗi ngày tươi mới\"` | Gỡ chặn 5 claim — xem Phần 1 mục 1.5 |\n| **N2** | **\"2,8 giây\" bị hiểu sai.** Nguồn NSX ghi *\"2,8 giây một cốc 100 ml nước nóng\"* — đây là **tốc độ rót** (2,1 L/phút), **KHÔNG phải thời gian chờ nước nóng** | ⛔ Sửa cách diễn đạt ở mọi kịch bản |\n| **N3** | **Tỷ lệ thu hồi nước: NSX ghi 69%** cho GTUN-8600HP, trong khi master data VN ghi 77% / chatbot 76,8% | ⛔ Cấm công bố mọi con số thu hồi cho tới khi GWT chốt |\n| **N4** | **Số hiệu TÜV lệch:** `Thông tin chi tiết TUV.pdf` ghi **1111297087**, hồ sơ nội bộ ghi **1111279087** (đảo 2 chữ số). Tài liệu TÜV còn có **Số chứng chỉ Q 50613617 001** và **Số báo cáo CN24W0C5 001** | ✅ **ĐÃ ĐÓNG 28/08/2026** — xem `N14`, `N15` |\n| **N5** | **TÜV có ghi đích danh model `GE-GTUN-8600HP`** (cùng với `GE-GEUT-50B04`) → chứng nhận **đúng là của USH10**, không phải máy khác | 🟢 Nâng hạng bằng chứng TÜV từ \"chỉ là claim\" lên B |\n| **N6** | **Tìm được ngưỡng đếm lõi thật trong quy cách điều khiển V1.8**: lõi thô `360 ngày / 10.200 L nước vào / 6.630 L nước tinh khiết`; lõi màng (bản 700G) `1.440 ngày / 8.600 L nước tinh khiết` | Giải thích được vì sao nhãn máy ghi 8.600 L — ✅ đã chốt, xem `N16` và `F-C17` |\n| **N7** | **Chế độ tiết kiệm điện là 3 giờ, không phải 2 giờ.** Cả deck NSX lẫn quy cách V1.8 đều ghi *\"3 giờ không thao tác → tự vào chế độ tiết kiệm\"* | ⛔ Sửa mọi tài liệu ghi \"2 giờ\" |\n| **N8** | **\"Mỗi ngày tươi mới\" là có thật** — nút 每日鲜活 trong deck NSX = nút xả bình nóng (\"Refresh\") trong HDSD quốc tế. Cùng một nút | 🟢 Gỡ chặn claim này |\n| **N9** | **Khoá trẻ em tự khoá lại sau 5 giây** không thao tác (V1.8) — chi tiết bán hàng mạnh chưa ai dùng | Bổ sung vào Phần 6 · Q7 |\n| **N10** | **Có mã trạng thái `EL`** (mực nước thấp trong bình đun) chưa có trong bảng mã lỗi nào của GWT | Bổ sung Phần 5 |\n| **N11** | **Nguyên nhân thật của lỗi \"máy tự vào chế độ xả C1\"**: nước đọng trên mặt vòi tạo mạch cảm ứng giữa 2 phím → kích hoạt xả rửa. Giải pháp: lau khô mặt vòi | Bổ sung Phần 5 — đây là lỗi hiện trường phổ biến nhất |\n| **N12** | **Nhiệt độ môi trường mâu thuẫn:** HDSD 4–40 °C vs deck NSX 4–30 °C | Dùng HDSD (4–40 °C), ghi nhận mâu thuẫn |\n| **N13** | **USH10 ghép được với máy nước có ga SPK25** (`GTUS-00S03`) thành giải pháp \"极沁Max\" — có mã đặt hàng riêng | Cơ hội bán thêm, chưa khai thác |\n\n### Bổ sung 28/08/2026 (v1.2)\n\n| # | Phát hiện | Ảnh hưởng |\n|---|---|---|\n| **N14** | **Số hiệu TÜV đúng là `1111279087`.** Tra Certipedia (S15): ID `1111279087` → **General Water Technology (Shanghai) Co., Ltd.** — đúng nhà sản xuất. ID `1111297087` trong `Thông tin chi tiết TUV.pdf` → **HP Inc., máy tính xách tay TPN-W166, test mark \"Low Blue Light\"** — hoàn toàn không liên quan, đây là **lỗi chép số** trong tài liệu nội bộ | ✅ Đóng `O-04`. ⛔ **Gỡ số `1111297087` khỏi mọi tài liệu** |\n| **N15** | 🔴 **Nhưng trang Certipedia của ID `1111279087` hiện ghi: _\"Currently no valid certificates are attached to this Certipedia ID\"_** — khách tra số sẽ thấy đúng tên nhà sản xuất nhưng **không thấy chứng chỉ nào** | 🔴 **RỦI RO MỚI, NẶNG HƠN O-04 cũ.** Xem `O-18` |\n| **N16** | **8.600 L và 12.240 L không mâu thuẫn** — GWT xác nhận (S14): **12.240 L = nước đầu vào**, **8.600 L = nước tinh khiết đầu ra** của lõi màng. Tỷ lệ 8.600 / 12.240 = **70,3 %** | ✅ Đóng `O-03`. Xác nhận `F-L01`, `F-L03` đúng |\n\n\n## 0.7. Nhật ký thay đổi\n\n| Phiên bản | Ngày | Nội dung | Người soạn |\n|---|---|---|---|\n| `v1.0` | 19/08/2026 | Phát hành lần đầu. Hợp nhất 14 tài liệu nguồn (HDSD quốc tế Ver.26.08.14, HDSD bản TQ qua hồ sơ, 2 deck NSX, tài liệu TÜV, quy cách điều khiển V1.8, thông báo kỹ thuật 23-3, hồ sơ nội bộ GWT 18–19/08). 13 phát hiện mới (N1–N13) | — |\n| `v1.1` | 20/08/2026 | **Bổ sung nguồn `S13`** — sơ đồ cấu tạo & sơ đồ 4 lớp lọc của NSX. **Sửa `F-C03`, `F-C05`; thêm `F-C28`–`F-C31`.** Nội dung sửa: **thứ tự 4 lớp lọc** — thanh carbon nằm **SAU** màng nano, không phải trước (v1.0 ghi sai); phát hiện **nước đi qua lõi dưới 2 lần**. Ghi nhận sơ đồ NSX **không có mô-đun UVC** → thêm bằng chứng cho `O-01` | — |\n| `v1.2` | **28/08/2026** | **Đóng 2 mâu thuẫn, mở 2 mã mới.** ① `O-03` **ĐÓNG** — GWT xác nhận **12.240 L = nước đầu vào, 8.600 L = nước tinh khiết đầu ra** của lõi màng, không mâu thuẫn (70,3 %). Sửa `F-B06`, `F-C17`; gỡ luật *\"cấm đặt 3 con số cạnh nhau\"*, thay bằng luật hẹp hơn *\"không trộn số lõi màng với số lõi thô\"*. ② `O-04` **ĐÓNG** — tra Certipedia: `1111279087` = **General Water Technology (Shanghai)** (đúng), `1111297087` = **HP Inc.** (lỗi chép số). Sửa `F-I01`. ③ **Mở `O-18`** — chứng chỉ TÜV **không hiện trên Certipedia**, rủi ro cao hơn O-04 cũ; thêm `F-I16`. ④ **Mở `O-19`** — tỷ lệ thu hồi nước, tách khỏi `O-03` cũ. ⑤ **Mục L: GWT rà và xác nhận toàn bộ 7 suy luận đều đúng**; `F-L01`, `F-L03` tốt nghiệp lên Phần 1. ⑥ Thêm nguồn `S14` (xác nhận GWT), `S15` (Certipedia). Phát hiện mới `N14`–`N16` | — |\n\n\n## 0.8. Cảnh báo bảo mật kèm theo\n\nTài liệu `H. Thông số kỹ thuật điều khiển điện … V1.8` (**S6**) đóng dấu **\"内部资料，不可外泄\"** — *tài liệu nội bộ, không được phát tán*. Mọi dữ kiện gắn nguồn **S6** trong database này đều để **🔵 NỘI BỘ**. Không trích dẫn, không chụp màn hình, không gửi cho khách hoặc đối tác.\n\n---"
      },
      {
        "so": 1,
        "slug": "bang-su-that",
        "ten": "Bảng sự thật nguyên tử",
        "nhom": "xuong-song",
        "coNoiDung": true,
        "noiDung": "# PHẦN 1 — BẢNG SỰ THẬT NGUYÊN TỬ (FACT TABLE)\n\n> **PKB v1.2 · 28/08/2026** · Đọc kèm **Phần 0**\n> **Đây là nguồn chân lý duy nhất.** Mọi câu trả lời khách, mọi dòng marketing, mọi slide đào tạo phải truy được về một mã `F-xxx` trong file này.\n>\n> **Cột \"Công bố\":** 🟢 được nói với khách · 🟡 nói được nhưng phải theo cách diễn đạt ở **Phần 2** · 🔵 nội bộ, không đưa lên tài liệu xuất bản · 🔴 cấm\n> **Cột \"Hạng\":** A = HDSD chính hãng · B = tài liệu chính hãng khác · C = kỹ thuật nội bộ (có thể khác bản đang bán) · D = tài liệu VN chưa truy nguồn · E = suy luận số học · X = đã xác định sai\n\n---\n\n\n## A. ĐỊNH DANH SẢN PHẨM\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-A01` | Tên thương mại VN | **Máy lọc nước GE USH10** | S9 | A | 🟢 |\n| `F-A02` | Tên trên HDSD | **Máy lọc nước nóng công nghệ lọc nano GE** (GE Nanofiltration Heating Purifier) | S1 | A | 🟢 |\n| `F-A03` | Model | **USH10** | S1 | A | 🟢 |\n| `F-A04` | Mã nội bộ GWT | `GTUN-8600HP-G` | S9 | A | 🔵 |\n| `F-A05` | Model nội địa / mã NSX | `GTUN-8600HP` | S4, S9 | A | 🔵 |\n| `F-A06` | Loại máy | **Âm tủ bếp (undersink)** — thân máy giấu dưới chậu rửa, chỉ vòi lộ trên mặt bàn | S1, S4 | A | 🟢 |\n| `F-A07` | Nhà sản xuất (HDSD quốc tế) | General Water Technology (HongKong) Co., Ltd. | S1 | A | 🟡 *(xem O-01)* |\n| `F-A08` | Nhà sản xuất (HDSD bản TQ) | 溢泰（南京）环保科技 — Yitai Nanjing, uỷ quyền bởi 通用净水科技（上海） | S2 | A− | 🔵 |\n| `F-A09` | Nhãn hiệu | *\"GE is a trademark of General Electric Company and is manufactured under license\"* — GE là nhãn hiệu của General Electric, sản xuất theo giấy phép | S2 | A− | 🟡 |\n| `F-A10` | Phiên bản HDSD | **Ver.26.08.14** | S1 | A | 🔵 |\n| `F-A11` | Mã lạ trong hệ thống | `GTUN-8600VNHP` — 2 máy đã lắp 2024, ghi chú DB *\"máy Test, có lắp lẻ thực tế\"* | S9 | A | 🔵 |\n| `F-A12` | Ghép combo | Ghép được với máy nước có ga **SPK25** (`GTUS-00S03`) thành giải pháp **极沁Max**. Mã đặt hàng `V00000068` / `V00000069` (⚠️ mapping bình ga 0,6L/4L chưa rõ — O-14) | S4 | B | 🔵 |\n\n---\n\n\n## B. THÔNG SỐ KỸ THUẬT\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-B01` | Kích thước (D×R×C) | **467 × 179 × 477 mm** | S1 | A | 🟢 |\n| `F-B02` | Chiều rộng — con số bán hàng | **17,9 cm** — lọt gầm chậu chung cư đã bị xi phông chiếm chỗ | S1 | A | 🟢 |\n| `F-B03` | Trọng lượng | ~**14 kg** (3 nguồn ghi 14 / 14,18 / 14,36 kg — O-12) | S4, BR, MD | B/D | 🟡 nói \"khoảng 14 kg\" |\n| `F-B04` | Lưu lượng nước tinh khiết (nước thường) | **1,8 L/phút** | S1 | A | 🟢 |\n| `F-B05` | Lưu lượng nước nóng | **2,1 L/phút** | S3 | B | 🟢 |\n| `F-B06` | Tổng công suất lọc định mức của máy | **8.600 L** *(nước tinh khiết đầu ra — cùng ngưỡng với lõi màng, xem `F-C17`)* | S1, S14 | A | 🟡 *(⛔ không đặt cạnh 6.630 L của lõi thô — khác cấp bộ phận)* |\n| `F-B07` | Công suất làm nóng | **20 L/giờ** | S1 | A | 🟢 |\n| `F-B08` | Áp lực nước vào | **0,1 – 0,4 MPa** (≈ 1–4 bar) | S1 | A | 🟢 |\n| `F-B09` | Áp lực làm việc | **0,4 – 0,9 MPa** | S1 | A | 🔵 |\n| `F-B10` | Điện áp | **220V ~ 50Hz** | S1 | A | 🟢 |\n| `F-B11` | Công suất định mức | **2.100 W** | S1 | A | 🟢 |\n| `F-B12` | Mâm nhiệt | **2.000 W** | S1 | A | 🔵 |\n| `F-B13` | Cấp bảo vệ chống điện giật | **Class I (Cấp I)** — bắt buộc ổ cắm có nối đất | S1 | A | 🟢 |\n| `F-B14` | Nguồn nước áp dụng | **Chỉ nước máy đô thị** | S1 | A | 🟢 |\n| `F-B15` | Nhiệt độ nước vào | **5 – 38 °C** | S1 | A | 🟢 |\n| `F-B16` | Nhiệt độ môi trường | **4 – 40 °C** | S1 | A | 🟢 |\n| `F-B17` | Tuổi thọ máy & linh kiện | **khoảng 5 – 10 năm** trong điều kiện vận hành và bảo dưỡng đúng | S1 | A | 🟡 phải kèm cụm điều kiện |\n| `F-B18` | Lỗ khoan lắp vòi | **Ø30 mm**, cần mặt phẳng bán kính **3,8 cm** quanh lỗ | S1 | A | 🟢 |\n| `F-B19` | Yêu cầu khoang tủ (khảo sát) | cao ≥ 550 mm, sâu ≥ 530 mm | BR | D | 🔵 dùng để khảo sát, không lên hình |\n| `F-B20` | Khoảng hở quanh máy | ≥ 10 cm *(đọc từ hình deck NSX)* | S4 | B | 🔵 |\n| `F-B21` | Thùng carton | 545 × 365 × 570 mm · CBM 0,1134 | MD | D | 🔵 |\n| `F-B22` | Tỷ lệ thu hồi nước | ⚠️ **69%** (NSX) vs 77% (master) vs 76,8% (chatbot) vs ≥65% (V1.8) | S3/S6/MD | mâu thuẫn | 🔴 **CẤM công bố mọi con số** — **O-19** *(việc riêng, không liên quan O-03 đã đóng)* |\n| `F-B23` | Hiệu suất nước | **Mức 1 (cao nhất)** theo `GB 34914-2021` | S2 | A− | 🟡 phải ghi rõ *\"tiêu chuẩn Trung Quốc\"* |\n| `F-B24` | Tiêu chuẩn sản xuất (bản TQ) | `GB4706.1-2005` · `GB4706.19-2008` · `Q31/0112000854C015-2021-01` | S2 | A− | 🔵 |\n| `F-B25` | Giấy phép vệ sinh (TQ) | `(苏)卫水字(2021)第3200-0139号` | S2 | A− | 🔵 |\n| `F-B26` | Chất lượng nước ra (bản TQ) | đạt `CJ94-2005` | S2 | A− | 🔵 ⛔ không trích khi chưa có phiếu thử VN |\n| `F-B27` | Thải bỏ | Ký hiệu **WEEE** — không thải cùng rác sinh hoạt trong EU | S1 | A | 🔵 |\n\n---\n\n\n## C. CẤU HÌNH LỌC\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-C01` | Số lõi / số bước | **2 lõi — 4 bước lọc** | S1, S9 | A | 🟢 |\n| `F-C02` | Kiểu máy | **Tankless** — không có bình chứa nước lọc kiểu RO truyền thống | S1 | A | 🟢 |\n| `F-C03` | Lõi 1 (lõi **dưới**) — cấu tạo | Lõi composite tích hợp **Polypropylene + Sợi carbon + Carbon Block** (`一体式聚丙烯炭纤维炭棒复合滤芯`). **Chứa lớp 1, lớp 2 VÀ lớp 4** — xem `F-C28` | S1, S13 | A | 🟡 ⛔ **không đọc mã lõi** — gọi là *\"lõi thô tổng hợp\"* |\n| `F-C04` | Lõi 1 — chức năng | Loại bỏ **cặn lắng, rỉ sét, hạt lơ lửng**; hấp phụ **clo dư và mùi khó chịu** | S1 | A | 🟢 |\n| `F-C05` | Lõi 2 (lõi **trên**) — cấu tạo | Lõi composite tích hợp **màng lọc nano** (`一体式纳滤复合滤芯`). **Chứa lớp 3** | S1, S13 | A | 🟡 gọi là *\"lõi màng lọc nano\"* |\n| `F-C06` | Lõi 2 — chức năng | Giảm **kim loại nặng** (chì, asen, cadimi), **vi khuẩn** (E. coli), **chất hữu cơ** (tricloromethane, carbon tetraclorua) — đồng thời **giữ lại khoáng chất có lợi** | S1 | A | 🟢 |\n| `F-C07` | Kích thước lỗ lọc màng nano | **0,001 µm** | S9 | D | 🟡 |\n| `F-C08` | Công nghệ màng | **G+荷电纳滤 — màng lọc nano tích điện**, bảng so sánh với UF (thế hệ 1.0) và RO (thế hệ 2.0) | S3 | B | 🟢 |\n| `F-C09` | So sánh công nghệ (NSX) | Nano tích điện chặn được **cả kim loại nặng và cặn vôi như RO**, nhưng **giữ khoáng có lợi** (RO loại bỏ) | S3 | B | 🟡 không so sánh với thương hiệu cụ thể |\n| `F-C10` | 8 khoáng giữ lại | Canxi · Magie · Natri · Kali · Kẽm · Selen · Stronti · Axit metasilicic (H₂SiO₃) | S9 | D | 🟡 **CHỈ liệt kê tên — ⛔ CẤM nói công dụng** |\n| `F-C11` | Patent màng NF | **US 7138058** — tra được trên Google Patents | S9 | A | 🟢 |\n| `F-C12` | Chu kỳ thay lõi thô (HDSD) | **6 ~ 12 tháng** | S1 | A | 🟡 xem `F-C14` |\n| `F-C13` | Chu kỳ thay lõi màng (HDSD) | **24 ~ 36 tháng** | S1 | A | 🟡 xem `F-C15` |\n| `F-C14` | Chu kỳ thay lõi thô (GWT chốt) | **12 tháng** | S9, DM | A | 🟡 nói *\"chu kỳ khuyến nghị\"*, ⛔ không nói *\"cam kết\"* |\n| `F-C15` | Chu kỳ thay lõi màng (GWT chốt) | **48 tháng** | S9, DM | A | 🟡 nói *\"chu kỳ khuyến nghị\"*, ⛔ không nói *\"bền 4 năm\"* như cam kết |\n| `F-C16` | Ngưỡng đếm lõi thô | **360 ngày** / **10.200 L nước vào** / **6.630 L nước tinh khiết** | S6, DM | C | 🔵 |\n| `F-C17` | Ngưỡng đếm lõi màng | **1.440 ngày** · **12.240 L nước ĐẦU VÀO** · **8.600 L nước tinh khiết ĐẦU RA** — ✅ GWT xác nhận 28/08/2026: hai con số là **hai đại lượng khác nhau**, không mâu thuẫn (70,3 %) | S6, DM, **S14** | C | 🟡 *(một thông điệp — một con số; ⛔ không ghép với 6.630 L của lõi thô)* |\n| `F-C18` | Nguyên tắc đếm lõi | **Điều kiện nào tới trước thì tính điều kiện đó** (thời gian **hoặc** số lít) | S6 | C | 🟡 nói được ý *\"đếm cả ngày lẫn lít\"*, ⛔ không đọc số |\n| `F-C19` | Cách máy tính số lít | Tính theo **thời gian bơm chạy** × lưu lượng quy đổi (NF700G = 1,8 L/phút); lưu bộ nhớ mỗi 30 phút và sau mỗi lần tạo nước | S6 | C | 🔵 |\n| `F-C20` | Cảnh báo tuổi thọ lõi (HDSD) | *\"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ lõi… có thể ngắn hơn các chu kỳ ước tính nêu trên… **Dữ liệu trên chỉ mang tính tham khảo**.\"* | S1 | A | 🟢 **Đây là câu an toàn nhất để trích khi khách hỏi về tuổi thọ lõi** |\n| `F-C21` | Chỉ dùng cho gia đình | HDSD ghi rõ: **không lắp ở nơi công cộng có mức tiêu thụ nước cao**; tuổi thọ lõi tính theo mức dùng hộ gia đình bình thường | S1 | A | 🟢 **Bắt buộc nói khi khách là quán/văn phòng** |\n| `F-C22` | Dấu hiệu phải thay lõi | ① Chất lượng nước suy giảm, mùi vị kém · ② Lưu lượng giảm đáng kể (không do nước lạnh) · ③ Lõi tắc nghiêm trọng, không lấy được nước | S1 | A | 🟢 |\n| `F-C23` | Cách phân biệt lõi nào hỏng | **Mùi vị kém** → dấu hiệu của lõi carbon sau · **Không lấy được nước** → dấu hiệu lõi bị tắc | S1 | A | 🟢 |\n| `F-C24` | Lõi đã dùng | **Không thể rửa hay tái chế**. Thải như chất thải rắn sinh hoạt, giao người có chuyên môn xử lý | S1 | A | 🟢 |\n| `F-C25` | Lõi không chính hãng | *\"Nếu máy hư hỏng do sử dụng lõi lọc không phải chính hãng GE, **dịch vụ bảo hành sẽ không được cung cấp**\"* | S1 | A | 🟢 |\n| `F-C26` | Ống PE & đầu nối | Là chi tiết lão hoá — khuyến nghị thay mỗi **24 tháng**, **tính phí theo giá thị trường** | S1 | A | 🟢 **Phải nói trước khi bán để tránh khiếu nại** |\n| `F-C27` | Thiết kế rút lõi | **Rút ngang** — thay lõi không phải kéo máy ra khỏi tủ | S3 | B | 🟢 |\n| `F-C28` 🆕 | **Thứ tự 4 lớp lọc** *(cập nhật 20/08/2026)* | **Lớp 1 `PP`** → **Lớp 2 `Sợi carbon` (炭纤维)** → **Lớp 3 `Màng lọc nano` (进口纳滤膜)** → **Lớp 4 `Thanh carbon` (炭棒)**. ⚠️ Lớp khử mùi nằm **SAU** màng lọc, là lớp cuối cùng trước khi ra vòi | S13 | B | 🟢 |\n| `F-C29` 🆕 | **Kiến trúc 2 lõi — nước đi qua lõi dưới 2 lần** | Lõi dưới chứa lớp 1, 2, 4 · Lõi trên chứa lớp 3. Nước: vào lõi dưới (PP + sợi carbon) → lên lõi trên (màng nano) → **quay lại lõi dưới** (thanh carbon) → ra vòi. Cho phép đặt lớp khử mùi ở cuối đường nước **mà không cần vỏ lõi thứ ba** | S13 | B | 🟢 |\n| `F-C30` 🆕 | Chức năng từng lớp *(theo sơ đồ NSX)* | **L1:** bùn cát, rỉ sét, chất lơ lửng · **L2:** chất hữu cơ, clo dư · **L3:** kim loại nặng, vi khuẩn, **vi rút** ⚠️, clo dư còn lại, màu lạ — **cho khoáng qua** · **L4:** khử **mùi** lần cuối | S13 | B | 🟡 ⚠️ \"vi rút\" chỉ có ở nguồn NSX, HDSD (hạng A) chỉ ghi vi khuẩn |\n| `F-C31` 🆕 | Hai đầu ra | `健康矿物质热水` — nước khoáng nóng · `常温健康矿物质水` — nước khoáng nhiệt độ phòng. **Cùng một nguồn nước đã lọc**, chỉ khác nhiệt độ | S13 | B | 🟢 |\n\n---\n\n\n## D. SƠ ĐỒ HỆ THỐNG\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-D01` | Đường nước chính | Nước máy đô thị → van bi 3 ngã → van cấp nước vào → **bơm tăng áp** → lõi composite (tiền lọc) → **lõi màng nano** → TDS nước tinh khiết → tách 2 nhánh | S1 | A | 🟢 |\n| `F-D02` | Nhánh nước thường | van nước nhiệt độ phòng → **mô-đun tiệt trùng nội tuyến** → vòi | S1 | A | 🟢 |\n| `F-D03` | Nhánh nước nóng | van cấp nước bình nóng → **bình đun** → bơm ly tâm → vòi (kèm ống thông hơi) | S1 | A | 🟢 |\n| `F-D04` | Nhánh xả | van xả / van điện từ xả / van một chiều → **nước cô đặc** → thoát sàn | S1 | A | 🟢 |\n| `F-D05` | **Vị trí mô-đun tiệt trùng** | Lắp **nối tiếp trên đường ống nước tinh khiết** chạy từ thân máy lên vòi. Đầu vào nối cổng nước tinh khiết của máy, đầu ra nối đoạn ống **gần vòi nhất** | S1 | A | 🟢 **USP mạnh nhất — xem **Phần 7**** |\n| `F-D06` | Bộ chuyển nguồn | Chuyển 220V AC → **24V/36V DC** (điện áp vận hành an toàn) | S1 | A | 🟢 |\n| `F-D07` | Bơm tăng áp | Tạo áp và môi trường vận hành ổn định cho màng lọc | S1 | A | 🟢 |\n| `F-D08` | Van điện từ cấp nước vào | Đóng/mở nguồn nước thô | S1 | A | 🔵 |\n| `F-D09` | Van điện từ nước thải | Điều khiển xả rửa bề mặt màng + lưu lượng hệ thống | S1 | A | 🔵 |\n| `F-D10` | Bo mạch điều khiển | Hiển thị trạng thái + điều khiển toàn hệ thống, DC 24V | S1 | A | 🔵 |\n| `F-D11` | Cảm biến trên bo | TDS nước tinh khiết · cảm biến mực nước · NTC1 (bình đun) · NTC2 (hơi nước) · cảm biến rò rỉ · rơ-le nhiệt bảo vệ chống đun cạn | S1 | A | 🔵 |\n| `F-D12` | Số mức cảm biến mực nước | **4 mức**: thấp · trung · cao · tràn | S6 | C | 🔵 |\n| `F-D13` | Sai số cảm biến nhiệt | ±3 °C so với nhiệt độ cài | S6 | C | 🔵 |\n| `F-D14` | Sai số hiển thị TDS | 0–10: ±2 · 10–50: ±5 · 50–100: ±10 · 100–200: ±20 · 200–300: ±30 · 300–500: ±50 | S6 | C | 🔵 **Dùng khi khách thắc mắc TDS đo lệch** |\n\n---\n\n\n## E. TÍNH NĂNG VẬN HÀNH\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-E01` | 4 chế độ nước | **Nhiệt độ phòng · 45 °C (WARM) · 85 °C (EX WARM) · 95 °C (HOT)** | S1 | A | 🟢 |\n| `F-E02` | ⛔ Mức 75 °C | **KHÔNG TỒN TẠI** — máy không có mức này | S1, S2, S3, S6, BR | **X** | 🔴 **CẤM** |\n| `F-E03` | Cách đổi nhiệt độ cài sẵn | Giữ đồng thời **LOCK + nút cần đặt trong 3 giây**. Khi chọn 1 mức, 2 nút còn lại tạm vô hiệu hoá | S1 | A | 🟢 |\n| `F-E04` | Cách lấy nước nóng | **2 bước**: chạm **LOCK** → chạm nút nhiệt độ | S1 | A | 🟢 |\n| `F-E05` | Cách lấy nước thường | Chạm 1 nút, **không cần mở khoá** | S1 | A | 🟢 |\n| `F-E06` | Khoá trẻ em — đèn báo | Đèn **tắt** = đã mở khoá · **sáng trắng** = đang khoá | S1 | A | 🟢 |\n| `F-E07` | Khoá trẻ em — tự khoá lại | Tự khoá lại sau **5 giây** không thao tác, hoặc sau khi lấy nước xong | S6 | C | 🟡 nói được ý *\"tự khoá lại ngay sau khi dùng\"* |\n| `F-E08` | Phạm vi khoá trẻ em | Khoá **chỉ chặn nước nóng**; các nút khác vẫn dùng bình thường | S6 | C | 🟡 |\n| `F-E09` | Điều khiển tự động | Đóng vòi → máy tự dừng. Bề mặt màng **tự làm sạch và xả rửa theo lịch** | S1 | A | 🟢 |\n| `F-E10` | Chu kỳ xả rửa tự động | Bật nguồn: xả 30 giây · **mỗi 24 giờ**: xả 30 giây · sau **>4 giờ** không tạo nước: xả không áp 15 giây | S6 | C | 🔵 |\n| `F-E11` | Chức năng không đọng nước | Khi lâu không dùng, nước tinh khiết tồn trong lõi **tự động quay về lọc lại** | S1 | A | 🟢 |\n| `F-E12` | Nhắc thay lõi — 2 cấp | Đèn **nháy đỏ** = sắp hết hạn (chuẩn bị lõi) → **đỏ liên tục** = phải thay | S1 | A | 🟢 |\n| `F-E13` | Ngưỡng đèn nhắc lõi | Xanh/trắng: tuổi thọ < 95% · Nháy đỏ: 95% ≤ tuổi thọ < 100% · Đỏ liên tục: ≥ 100% | S6 | C | 🔵 |\n| `F-E14` | Nhắc thay lõi — 3 kênh | ① đèn trên vòi · ② đèn trên thân máy · ③ **thông báo trên điện thoại** | S3 | B | 🟢 |\n| `F-E15` | Mô-đun tiệt trùng — nút UV | Nút **\"UV\"** trên vòi. **Sáng trắng** = còn hạn · **nháy trắng** = sắp hết tuổi thọ | S1 | A | 🟢 |\n| `F-E16` | Reset mô-đun tiệt trùng | Mở khoá trẻ em → giữ đồng thời **\"WARM\" + \"UV\" 3 giây** → hiện `SA` + 1 tiếng bíp | S1 | A | 🟢 |\n| `F-E17` | Xả bình nước nóng (\"Mỗi ngày tươi mới\") | Chạm **LOCK** → chạm nút xả. Xả sạch nước tồn trong bình đun bằng 1 chạm | S1, S3 | A | 🟢 |\n| `F-E18` | Thay lõi tự làm được | Xoay-và-khoá 2 bước: **thuận chiều kim đồng hồ** để lắp, **ngược chiều** để tháo. Reset bằng **giữ nút lõi 3 giây** | S1 | A | 🟢 |\n| `F-E19` | Xả rửa sau thay lõi | Máy hiện **`C2`** → chạm nút nước thường → xả rửa **8 phút** | S1 | A | 🟢 |\n| `F-E20` | Xả rửa lần đầu sau lắp | Máy hiện **`C1`** → chạm nút lấy nước → xả rửa **~16 phút** | S1 | A | 🟢 |\n| `F-E21` | Chế độ tiết kiệm điện (ECO) | **3 giờ** không thao tác → máy tự vào chế độ **không giữ ấm**. Bấm nút để bật/tắt thủ công | S3, S6 | B/C | 🟡 ⚠️ marketing VN đang ghi \"2 giờ\" — O-05 |\n| `F-E22` | Chế độ giữ ấm (không ECO) | Giữ nước ở nhiệt độ cài; khi nguội **quá 5 °C** so với mức cài thì tự đun lại | S6 | C | 🔵 |\n| `F-E23` | Học điểm sôi theo vùng | Máy **tự học điểm sôi địa phương**. Nếu nhiệt độ cài cao hơn điểm sôi tại chỗ, máy tự hạ về **điểm sôi − 2 °C** | S6 | C | 🔵 **Giải thích được vì sao 95 °C ở vùng cao hiển thị thấp hơn** |\n| `F-E24` | Hiển thị nhiệt độ | Màn hình vòi hiện **nhiệt độ nước nóng theo thời gian thực**. **Nháy** = đang gia nhiệt · **tắt** = không gia nhiệt | S1 | A | 🟢 |\n| `F-E25` | Đèn trên thân máy | Status: xanh = đang lọc / nháy chậm = đang xả rửa · NF & PCFB: xanh = bình thường, nháy đỏ = sắp hết, đỏ = phải thay · WiFi: xanh = đã kết nối, nháy chậm = chưa kết nối | S1 | A | 🟢 |\n| `F-E26` | Vòi xoay | **120° (±60°)**, thân vòi tròn cho phép xoay nhiều góc | S4 | B | 🟢 |\n| `F-E27` | Chuẩn chống nước vòi | **IPX4** | S3 | B | 🟢 |\n| `F-E28` | Bo mạch vòi | **Phủ keo 100%** (灌胶), chống nước | S3 | B | 🟢 |\n| `F-E29` | Công nghệ mặt hiển thị | **IMD (in-mould decoration)** — hiển thị rõ hơn, chống mài mòn tốt hơn | S3 | B | 🟢 |\n| `F-E30` | Tốc độ rót | **100 ml nước nóng ≈ 2,8 giây** · **100 ml nước thường ≈ 3,3 giây** | S3 | B | 🟡 ⛔ **KHÔNG được diễn đạt thành \"nước nóng ra sau 2,8 giây\"** — O-06 |\n| `F-E31` | Màu vòi | **Đen** (`USH10-FAUCET-DEN`) và **Bạc** (`USH10-FAUCET-BAC`) | S9 | A | 🟢 |\n| `F-E32` | Khôi phục cài đặt gốc | Giữ **ECO + nước thường 10 giây** → hiện `SC` + 1 tiếng bíp | S6 | C | 🔴 **CẤM hướng dẫn khách tự làm** — chỉ kỹ thuật viên |\n| `F-E33` | Cảm biến nhiệt Seiko | ❌ **KHÔNG CÓ NGUỒN** trong bất kỳ tài liệu nào | — | — | 🔴 **CẤM** — O-11 |\n| `F-E34` | Hộp đun 1,8 L inox 316 chân không 2 lớp | ❌ **KHÔNG CÓ NGUỒN** — HDSD chỉ ghi \"Hot Tank\", không mô tả vật liệu hay dung tích | — | — | 🔴 **CẤM** — O-11 |\n\n---\n\n\n## F. KẾT NỐI & ỨNG DỤNG\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-F01` | Công nghệ kết nối | IoT **Wifi-Combo** (Bluetooth ghép nối + Wi-Fi nhà) | S1 | A | 🟢 |\n| `F-F02` | Tên ứng dụng | **G+ Life APP** | S1 | A | 🟢 |\n| `F-F03` | Quy trình ghép nối (7 bước) | ① bật Bluetooth + kết nối Wi-Fi nhà → ② quét QR trên máy tải app → ③ đăng ký bằng SĐT + mã xác minh → ④ bấm \"Add Device\" → ⑤ **giữ nút trên máy 3 giây** vào chế độ ghép nối → ⑥ nhập mật khẩu Wi-Fi → ⑦ bấm \"Getting Started\" | S1 | A | 🟢 |\n| `F-F04` | Đèn Wi-Fi trên máy | Sáng liên tục = đã kết nối · Nháy nhanh (2 lần/giây) = đang ghép nối · Nháy chậm (1 lần/2 giây) = chưa kết nối / ghép nối thất bại | S1, S6 | A/C | 🟢 |\n| `F-F05` | Ghép nối lại | Giữ nút Wi-Fi **3 giây** để huỷ liên kết và ghép nối lại | S6 | C | 🟡 |\n| `F-F06` | Sau khi ghép nối thất bại | Nháy chậm **3 phút** rồi tắt | S6 | C | 🔵 |\n| `F-F07` | Chức năng theo dõi từ xa | Giám sát tuổi thọ lõi theo **%** (ví dụ hiển thị 99% / 90% từng cấp lõi), giám sát chất lượng nước, điều khiển từ xa | S3 | B | 🟢 |\n| `F-F08` | Hẹn giờ đun | Nhận lệnh hẹn giờ từ app; máy bắt đầu đun **trước giờ hẹn 5 phút** nếu nước đang nguội hơn mức cài | S6 | C | 🟡 nói được tính năng, ⛔ không đọc chi tiết \"5 phút\" |\n| `F-F09` | Cảnh báo rò rỉ qua app | Có | S9 | D | 🟡 |\n\n---\n\n\n## G. BẢO HÀNH\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-G01` | Bảo hành toàn máy | **12 tháng**, tính từ ngày hoá đơn / ngày lắp đặt / chứng từ hợp pháp | S1 | A | 🟢 |\n| `F-G02` | Bảo hành bơm + bo mạch | **5 năm** — chính sách riêng GWT | S9 | D | 🟡 ⚠️ **không có trong HDSD hãng** — O-10. ⛔ Không hứa miệng, chuyển phòng KD nếu khách đòi văn bản |\n| `F-G03` | ⛔ Bộ phận KHÔNG bảo hành | ① **Vật liệu lọc** · ② **Đèn diệt khuẩn tia cực tím** · ③ Chi tiết hao mòn (vòng đệm kín) · ④ Vỏ trang trí & lớp phủ bề mặt · ⑤ **Bộ chuyển nguồn (adapter)** | S1 | A | 🟢 **BẮT BUỘC nói trước khi bán** |\n| `F-G04` | ⛔ Nguyên nhân KHÔNG bảo hành | ① Lắp/dùng/bảo quản sai HDSD · ② Tự tháo dỡ hoặc sửa đổi · ③ **Dùng phụ kiện hoặc lõi không chính hãng** · ④ Ngoại lực & áp suất vượt giới hạn · ⑤ Bất khả kháng (chiến tranh, thiên tai) · ⑥ Hư hỏng khác do người dùng | S1 | A | 🟢 |\n| `F-G05` | Hồ sơ cần giữ | **Phiếu bảo hành + hoá đơn gốc** | S1 | A | 🟢 |\n| `F-G06` | Giới hạn trách nhiệm | Công ty không đưa ra bảo đảm nào khác và không chịu trách nhiệm về thiệt hại phát sinh do thiết bị bị lỗi | S1 | A | 🔵 |\n| `F-G07` | Áp dụng chung | Cùng chính sách cho `GTUN-8600VNHP` và `GCUN-02VNT01` | S9 | A | 🔵 |\n\n---\n\n\n## H. GIÁ & CHI PHÍ\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-H01` | Giá niêm yết máy | **44.950.000 đ** (kênh `NIEM_YET`, hiệu lực 29/07/2026) | S9 | A | 🟡 ⚠️ **chưa chốt đã gồm VAT chưa** — O-07 |\n| `F-H02` | Giá lõi thô | **2.750.000 đ** | S9 | A | 🟡 |\n| `F-H03` | Giá lõi màng | **7.500.000 đ** | S9 | A | 🟡 |\n| `F-H04` | Giá lõi thô đã bán thực tế | 6 bộ, trung bình **2.050.000 đ** (05–08/2026, chỉ HN + HCM) | S9 | A | 🔵 |\n| `F-H05` | Chi phí 5 năm (ước tính) | ~**58 – 63 triệu** cho hộ 4 người (~6 L/ngày) ≈ **32 – 35 nghìn/ngày** | E | **E** | 🟡 **phải nói rõ là \"ước tính\"**, ⛔ không đưa như bảng giá |\n| `F-H06` | Giá thực tế đã bán | **60 – 85% giá niêm yết** trên 12/12 đơn. **Chưa từng bán ở giá niêm yết** | S9 | A | 🔵 ⛔ **Sale không tự ra giá** — O-08 |\n\n---\n\n\n## I. CHỨNG NHẬN\n\n| Mã | Dữ kiện | Giá trị | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|---|\n| `F-I01` | TÜV Rheinland — số hiệu (ID Certipedia) | ✅ **`1111279087`** — tra Certipedia ra **General Water Technology (Shanghai) Co., Ltd.** · ❌ `1111297087` trong `Thông tin chi tiết TUV.pdf` là **lỗi chép số** — ID đó thuộc **HP Inc. (laptop)** | S9, **S15** | **A** | 🔵 **Số đã đúng, nhưng vẫn ⛔ KHÔNG đọc cho khách** — trang tra cứu đang trống, xem `F-I16` và `O-18` |\n| `F-I02` | TÜV — số chứng chỉ | `Q 50613617 001` | S5 | B | 🟡 |\n| `F-I03` | TÜV — số báo cáo | `CN24W0C5 001` | S5 | B | 🟡 |\n| `F-I04` | TÜV — model được chứng nhận | **`GE-GEUT-50B04` và `GE-GTUN-8600HP`** → **bao gồm đúng USH10** | S5 | B | 🟢 |\n| `F-I05` | TÜV — phạm vi | **57 thử nghiệm**; chứng nhận **\"Hygienic Property\" (đặc tính vệ sinh)** | S5 | B | 🟢 |\n| `F-I06` | TÜV — nội dung vật liệu | Vật liệu panel, ống nước, bể chứa, thân bơm đạt **19 chỉ tiêu hoà tan kim loại nặng theo EN 14350** (tiêu chuẩn EU cho **dụng cụ uống của trẻ em**) + vật liệu cấp thực phẩm EU + **12 yêu cầu LFGB (Đức)** | S5 | B | 🟡 **Diễn đạt theo đúng **Phần 2** — ⛔ không suy ra claim sức khoẻ** |\n| `F-I07` | TÜV — nội dung vi sinh | Theo `DIN EN 16889`: kiểm **E. coli, Staphylococcus aureus, Pseudomonas aeruginosa** bên trong máy **sau thời gian dùng dài** — kết quả vẫn giữ sạch | S5 | B | 🟢 **Đây là điểm mạnh chưa ai khai thác: kiểm máy CŨ, không phải máy mới** |\n| `F-I08` | TÜV — không phát hiện | Không bisphenol A (BPA), không chất làm dẻo, không melamine, không formaldehyde, không kim loại nặng | S5 | B | 🟡 phải kèm dấu `*` như tài liệu gốc |\n| `F-I09` | File PDF chứng chỉ TÜV | 🔴 **CHƯA CÓ** — S5 là bản mô tả, không phải bản scan. 10/10 file chứng nhận trong thư mục Drive đều **0 byte** | — | — | 🔵 |\n| `F-I10` | SGS — diệt khuẩn 99,999% | Số báo cáo `ASH18-029858-01`, **chưa có file**; phiếu SGS trong kho là của máy **50B04** | S9 | — | 🔴 **CẤM TUYỆT ĐỐI** |\n| `F-I11` | LFGB (Đức) | Có trong mô tả TÜV (12 yêu cầu kiểm), **chưa có chứng chỉ riêng** | S5 | B | 🟡 chỉ nói trong ngữ cảnh TÜV |\n| `F-I12` | VIETCERT | Kiểm định nóng lạnh (CTS10 + USH10) — 🔴 file 0 byte | S9 | — | 🔴 |\n| `F-I13` | QCVN 6-1:2010/BYT | 🔴 **Phiếu thử rỗng ở mọi máy POU** | S9 | — | 🔴 **Không trích chuẩn khi chưa có phiếu** |\n| `F-I14` | Phiếu khoáng | ~40 phiếu của 20+ tỉnh **Trung Quốc** — **không có phiếu Việt Nam** cho máy POU | S9 | — | 🔵 |\n| `F-I15` | Mineral Map | 16 điểm đo thật tại VN — ⚠️ **là kết quả của hệ LỌC TỔNG (POE), KHÔNG phải USH10** | S9 | A | 🔴 **CẤM dùng làm bằng chứng cho USH10** |\n| `F-I16` | **Trạng thái tra cứu công khai của TÜV** *(mới 28/08/2026)* | 🔴 Trang Certipedia của ID `1111279087` ghi *\"Currently no valid certificates are attached to this Certipedia ID\"*. **Tên nhà sản xuất hiện đúng, chứng chỉ KHÔNG hiện** | S15 | A | 🔴 **CẤM đưa số hoặc đường link cho khách tự tra** cho tới khi GWT làm việc lại với TÜV — `O-18` |\n\n---\n\n\n## J. DANH MỤC ĐÓNG GÓI\n\n| Mã | Dữ kiện | Nguồn | Hạng | Công bố |\n|---|---|---|---|---|\n| `F-J01` | Thân máy chính × 1 · Lõi lọc × 2 · Hộp phụ kiện × 1 | S1 | A | 🟢 |\n| `F-J02` | Trong hộp phụ kiện: HDSD × 1 · **Vòi thông minh × 1** · Van bi cấp nước 3 ngã × 1 · Co nối 1/4\" × 2 · Co nối 3/8\" × 1 · Kẹp giữ ống 3/8\" × 1 · Kẹp giữ ống 1/4\" × 6 · Ống PE 3/8\" trắng × 1 · Ống PE 1/4\" trắng × 1 · Đầu nối 5/16\" × 1 · **Mô-đun tiệt trùng nội tuyến × 1** | S1 | A | 🟢 |\n\n---\n\n\n## K. DỮ LIỆU KINH DOANH (🔵 TOÀN BỘ NỘI BỘ)\n\n| Mã | Dữ kiện | Giá trị | Nguồn |\n|---|---|---|---|\n| `F-K01` | Tổng máy đã bán | **12 máy** · doanh thu 272.227.500 đ · 11/12/2024 → 07/08/2026 (~0,6 máy/tháng) | S9 |\n| `F-K02` | Nền lắp đặt | **11 máy** / 476 máy toàn hệ thống (2,3%) | S9 |\n| `F-K03` | Ticket sự cố USH10 | **0** trên tổng 91 ticket toàn hệ thống | S9 |\n| `F-K04` | Máy đã hết bảo hành toàn máy | **8 / 11** | S9 |\n| `F-K05` | Lõi thô đã bán thay | **6 bộ** | S9 |\n| `F-K06` | Lõi màng đã bán thay | **0 bộ** | S9 |\n| `F-K07` | Tồn kho máy | **4 máy** (kho Nguyễn Xiển, 24/06/2026) | S9 |\n| `F-K08` | Tồn kho lõi USH10 | 🔴 **0** | S9 |\n| `F-K09` | Thị phần POU | 2025: **35% — #1 dòng POU** → 2026: **1,3% — hạng 9/9** | S9 |\n| `F-K10` | Kênh bán hiệu quả | **KOL Dino 4/12 máy (33%)** và giữ giá cao nhất (85/80/70%). Cộng \"Giới thiệu\"/\"KTS\" → **8/12 máy từ quan hệ + KOL** | S9 |\n| `F-K11` | Địa bàn đã bán | Chỉ **HCM (7) · Hà Nội (4) · Bắc Ninh (1)** | S9 |\n| `F-K12` | Case F&B thật | **PIN Cafe** (33 Hàng Hòm) · **The Ghé Coffee** (Q1) — đã đo nước đầu ra | S9 |\n\n---\n\n\n## L. SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ, KHÔNG PHẢI CÔNG BỐ CỦA HÃNG)\n\n> ✅ **GWT đã rà toàn bộ mục L ngày 28/08/2026 và xác nhận: mọi suy luận số học ở đây đều đúng** (S14).\n>\n> Xác nhận này đổi **độ tin cậy**, không đổi **quyền công bố**. Các mục dưới đây vẫn là **phép tính của người soạn PKB**, không phải số liệu hãng công bố — nên vẫn **không đọc cho khách** dưới dạng con số. Điều đổi là: chúng đã đủ chắc để **đóng mâu thuẫn** và để **kết luận** rút ra từ chúng được nâng lên Phần 1.\n>\n> **Hai kết luận đã tốt nghiệp khỏi mục L** (nay là dữ kiện chính thức, xem cột \"Đã dùng ở đâu\"): `F-L01` và `F-L03` → đóng `O-03`, viết lại `F-B06` và `F-C17`.\n\n| Mã | Suy luận | Cơ sở | GWT rà 28/08 | Đã dùng ở đâu |\n|---|---|---|---|---|\n| `F-L01` | **8.600 L trên nhãn máy chính là ngưỡng lít của lõi màng.** Quy cách V1.8 ghi lõi NF bản 700G = 1.440 ngày / **8.600 L nước tinh khiết** — trùng khít con số *\"Tổng công suất lọc nước định mức = 8.600 L\"* trên HDSD | S1 + S6 | ✅ **Đúng** | 🎓 Đã nâng lên `F-B06` · đóng `O-03` |\n| `F-L02` | **Tỷ lệ 6.630 / 10.200 = đúng 65%** — khớp ghi chú *\"回收率 ≥65%\"* trong quy cách. Vậy 6.630 L là **nước tinh khiết**, 10.200 L là **nước vào** cho lõi thô | S6 | ✅ **Đúng** | Nội bộ — giải thích cặp số của lõi thô |\n| `F-L03` | **12.240 L trong Danh mục hàng hoá là \"nước ĐẦU VÀO\" của lõi màng, không phải nước tinh khiết** (8.600 / 12.240 = 70,3%). Vậy 8.600 và 12.240 **không mâu thuẫn** — là 2 đại lượng khác nhau | S6 + DM | ✅ **Đúng — GWT xác nhận nguyên văn: _\"12.240 L là mức nước đầu vào, 8.600 L là mức nước đầu ra (uống được)\"_** (S14) | 🎓 Đã nâng lên `F-C17` · **đóng `O-03`** |\n| `F-L04` | **Hai ngưỡng của lõi màng được hiệu chỉnh quanh mức dùng ~6 L/ngày:** 8.600 L ÷ 6 L/ngày ≈ 1.433 ngày ≈ đúng ngưỡng 1.440 ngày | S6 | ✅ **Đúng** | Nội bộ — dùng khi khách hỏi *\"sao lại 4 năm\"* |\n| `F-L05` | **Lõi thô luôn bị chặn bởi thời gian, không phải số lít.** 6.630 L ÷ 6 L/ngày ≈ 1.105 ngày, trong khi ngưỡng thời gian chỉ 360 ngày → hộ gia đình bình thường **luôn** chạm mốc 360 ngày trước | S6 | ✅ **Đúng** | Nội bộ — cơ sở kế hoạch nhập lõi |\n| `F-L06` | **2,1 L/phút và \"2,8 giây/100 ml\" là cùng một con số.** 100 ml ÷ 2,1 L/phút = 2,86 giây. Tương tự 1,8 L/phút → 3,33 giây/100 ml. Hai số liệu nhất quán → độ tin cậy của nguồn S3 cao | S3 | ✅ **Đúng** | Nội bộ — cơ sở sửa cách diễn đạt `F-M09` |\n| `F-L07` | **\"20 L/giờ\" và \"2,1 L/phút\" không mâu thuẫn.** 2,1 L/phút là **tốc độ rót** từ bình đun (đợt ngắn); 20 L/giờ là **năng suất đun bền vững** (0,33 L/phút). Rót nhanh nhưng không rót liên tục vô hạn được | S1 + S3 | ✅ **Đúng** | Nội bộ — trả lời khách hỏi *\"rót liên tục được không\"* |\n\n> 🎓 = suy luận đã được xác nhận và **chuyển thành dữ kiện chính thức** ở Phần 1. Khi trích, hãy trích mã Phần 1 (`F-B06`, `F-C17`), không trích mã `F-Lxx`.\n\n---\n\n\n## M. DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ (🔴 HẠNG X)\n\n| Mã | Dữ kiện sai | Đang xuất hiện ở đâu | Giá trị đúng |\n|---|---|---|---|\n| `F-M01` | **Mức nhiệt 75 °C** | Master Data, catalogue, chatbot, kịch bản video, `[NOTE GWT].pdf` | Nước thường · 45 · 85 · 95 (`F-E01`) |\n| `F-M02` | **Áp lực nước vào \"0–0,4 MPa\"** | Brochure VN, Master Data | **0,1–0,4 MPa** (`F-B08`) |\n| `F-M03` | **Công suất \"2.000–2.400 W\"** | Chatbot | **2.100 W** (`F-B11`) |\n| `F-M04` | **Điện áp \"220–240V\"** | Brochure, Master Data | **220V ~ 50Hz** (`F-B10`) |\n| `F-M05` | **\"USH10 là máy để bàn\"** | `gwt/sales-cskh.md` | **Âm tủ bếp** (`F-A06`) |\n| `F-M06` | **\"Diệt khuẩn 99,999%\"** | Chatbot (8 chunk) | ⛔ Không có bằng chứng — không thay thế bằng số nào |\n| `F-M07` | **\"Tỷ lệ thu hồi nước cao nhất hiện nay\"** | Chatbot | ⛔ Bỏ hẳn — cấm superlative |\n| `F-M08` | **Công dụng y tế từng khoáng** | Chatbot | ⛔ Bỏ hẳn (**Phần 2** mục 3) |\n| `F-M09` | **\"Nước nóng ra sau 2,8 giây\"** | Marketing VN | **\"~2,8 giây cho 100 ml nước nóng\"** (`F-E30`) |\n| `F-M10` | **\"Chế độ tiết kiệm điện giữ ấm 2 giờ\"** | Marketing VN | **3 giờ** (`F-E21`) |\n| `F-M11` | **\"USH10 thường hết hàng\"** | `gwt/sales-cskh.md` | Kiểm tra `wh_master` trước khi trả lời (`F-K07`) |\n\n---"
      },
      {
        "so": 2,
        "slug": "quy-tac-claim",
        "ten": "Quy tắc claim",
        "nhom": "truyen-thong",
        "coNoiDung": true,
        "noiDung": "# PHẦN 2 — QUY TẮC CLAIM — CẤM NÓI / THẬN TRỌNG / ĐƯỢC NÓI\n\n> **PKB v1.2 · 28/08/2026** · Áp dụng cho **mọi kênh**: AI/chatbot, sale nói miệng, inbox, livestream, video, landing page, ấn phẩm in, caption social.\n> **Đây là file phải đọc trước khi viết bất kỳ dòng nội dung nào.**\n\n---\n\n\n## 0. BA NGUYÊN TẮC GỐC\n\n| # | Nguyên tắc | Áp dụng thế nào |\n|---|---|---|\n| **1** | **Không bịa.** Mọi câu nói về sản phẩm phải truy được về một mã `F-xxx` trong **Phần 1** | Không có mã → không được nói |\n| **2** | **Không suy diễn.** Không ghép 2 dữ kiện để tạo dữ kiện thứ 3. Không quy đổi, không ngoại suy, không \"chắc là\" | Ví dụ cấm: lấy 20 L/giờ chia ra để nói \"1 phút được 333 ml\" |\n| **3** | **Không nói y khoa.** Không nói về sức khoẻ, dinh dưỡng, bệnh tật, mẹ bầu, trẻ sơ sinh, người bệnh — kể cả gián tiếp, kể cả khi khách hỏi thẳng | Xem mục 3 bên dưới |\n\n> **Câu thoát chuẩn khi không có dữ kiện:**\n> *\"Thông tin này em chưa có xác nhận chính thức từ hãng nên em không dám nói bừa. Em kiểm tra rồi báo lại anh/chị.\"*\n\n---\n\n\n## 1. 🔴 DANH SÁCH ĐỎ — CẤM TUYỆT ĐỐI\n\n| ⛔ Cấm nói | Vì sao | ✅ Nói thay bằng |\n|---|---|---|\n| **\"Diệt khuẩn 99,999%\"** (hoặc bất kỳ % diệt khuẩn nào) | Phiếu SGS `ASH18-029858-01` **chưa có trong hồ sơ**; phiếu SGS đang lưu là của máy khác (50B04) | *\"Máy có mô-đun tiệt trùng lắp ngay trên đường nước đi ra vòi\"* |\n| **\"Mức nhiệt 75 độ\"** | Máy **không có** mức này (`F-E02`) | *\"Nước nhiệt độ phòng, 45, 85 và 95 độ\"* |\n| **Tên/mã lõi lọc** (`PCFB`, `NF700`, `LX-…`, `40229463`) | Rule nội bộ GWT chốt 18/07/2026 — mọi kênh xuất bản | *\"Lõi thô tổng hợp\"* / *\"lõi màng lọc nano\"* |\n| **Công dụng y tế của khoáng chất** (\"magie tốt cho tim mạch\", \"selen chống oxy hoá\", \"kẽm tăng đề kháng\"…) | Nói công dụng như thuốc — vi phạm pháp luật quảng cáo | *\"Giữ lại khoáng chất tự nhiên có trong nước\"* — **dừng ở đó** |\n| **Mọi so sánh tuyệt đối**: \"tốt nhất\", \"cao nhất\", \"duy nhất\", \"số 1\", \"hơn hẳn\", \"đầu tiên tại Việt Nam\" | Luật quảng cáo VN cấm so sánh tuyệt đối thiếu căn cứ | Nêu **con số cụ thể**, để khách tự so |\n| **Mọi con số tỷ lệ thu hồi nước** (69% / 76,8% / 77% / 78%) | 4 nguồn ghi 4 số khác nhau (`F-B22`, **O-19**) | ⛔ Không nói con số nào. Nếu khách hỏi: *\"Con số cụ thể em cần xác nhận lại với hãng\"* |\n| **\"Áp lực 0 MPa cũng chạy\"** | HDSD yêu cầu tối thiểu **0,1 MPa** (`F-B08`) | *\"Máy cần áp lực nước vào từ 0,1 đến 0,4 MPa\"* |\n| **\"USH10 là máy để bàn\"** | Sai loại máy (`F-A06`) | *\"Máy âm tủ bếp, chỉ vòi lộ trên mặt bàn\"* |\n| **\"Cảm biến nhiệt Seiko\"** | Không có nguồn nào (`F-E33`) | Bỏ hẳn. Nói *\"cảm biến nhiệt kép, sai số ±3 độ\"* nếu cần |\n| **\"Hộp đun 1,8 L inox 316 chân không 2 lớp\"** | Không có nguồn nào (`F-E34`) | Bỏ hẳn |\n| **\"Nước nóng ra sau 2,8 giây\"** | Diễn đạt sai. Nguồn NSX là **tốc độ rót**, không phải thời gian chờ (`F-E30`) | *\"Rót 100 ml nước nóng khoảng 2,8 giây\"* |\n| **Trộn số của LÕI MÀNG với số của LÕI THÔ trong cùng một khung hình** — 8.600 / 12.240 (lõi màng) đặt cạnh 6.630 / 10.200 (lõi thô) | Khác cấp bộ phận, khách sẽ thấy mâu thuẫn. *(8.600 và 12.240 thì **không** mâu thuẫn — vào/ra của cùng lõi màng, `F-C17`)* | Chọn **1 con số cho 1 thông điệp**. Nếu buộc phải nêu cặp, nói đủ *\"vào … ra …\"* của **cùng một lõi** |\n| **Đọc số hiệu TÜV cho khách tự tra** — kể cả số đúng `1111279087` | Số đã chốt đúng (`F-I01`), **nhưng trang Certipedia của ID này đang không hiện chứng chỉ nào** (`F-I16`). Khách tra ra trang trống → mất niềm tin **nặng hơn** là không đưa số | *\"Máy có chứng nhận TÜV Rheinland của Đức. Số hiệu chính xác em xin phép gửi anh/chị bằng văn bản.\"* — ⛔ tuyệt đối **không** nhắn số qua chat, không gửi link Certipedia |\n| **Trích tiêu chuẩn nước** (`QCVN 6-1:2010/BYT`, `CJ94-2005`) | Phiếu thử **rỗng** (`F-I13`) | Xử lý theo kịch bản **Phần 6** **Q25** |\n| **Dùng Mineral Map làm bằng chứng cho USH10** | Đó là kết quả đo của **hệ lọc tổng (POE)**, không phải USH10 (`F-I15`) | Chỉ dùng khi nói về hệ lọc tổng |\n| **Hướng dẫn khách khôi phục cài đặt gốc** (`SC`) | Xoá toàn bộ dữ liệu đếm lõi (`F-E32`) | Chỉ kỹ thuật viên làm |\n| **Nói xấu, nêu tên đối thủ để so sánh bất lợi** | Rủi ro pháp lý + phản tác dụng | Nêu 3 điểm khác biệt cấu trúc của máy mình, để khách tự đối chiếu (**Phần 6** Q26) |\n\n---\n\n\n## 2. 🟡 DANH SÁCH VÀNG — NÓI ĐƯỢC NHƯNG PHẢI ĐÚNG CÂU CHỮ\n\n| Nội dung | ⛔ Cách nói SAI | ✅ Cách nói ĐÚNG |\n|---|---|---|\n| **Mô-đun tiệt trùng** | \"Đèn UV diệt 99,999% vi khuẩn\" | *\"Máy có mô-đun tiệt trùng lắp nối tiếp ngay trên đường ống nước tinh khiết chạy lên vòi — theo đúng hướng dẫn lắp đặt của hãng.\"* |\n| **Chu kỳ lõi** | \"Lõi bền 4 năm\", \"cam kết 48 tháng\" | *\"Chu kỳ khuyến nghị 12 tháng và 48 tháng. Máy đếm cả theo ngày lẫn theo lượng nước đã lọc và tự báo khi tới hạn.\"* + trích `F-C20` |\n| **Tuổi thọ máy** | \"Máy dùng 10 năm\" | *\"Hướng dẫn sử dụng ghi tuổi thọ khoảng 5 đến 10 năm trong điều kiện vận hành và bảo dưỡng đúng.\"* |\n| **TÜV** | \"Chứng nhận an toàn cho mẹ và bé\" | *\"TÜV Rheinland đã thực hiện 57 thử nghiệm. Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo tiêu chuẩn EN 14350 của EU và 12 yêu cầu vật liệu tiếp xúc thực phẩm LFGB của Đức.\"* — **dừng ở mô tả, không suy ra kết luận** |\n| **Giữ khoáng** | \"Uống nước có khoáng tốt cho sức khoẻ\" | *\"Màng lọc nano giữ lại khoáng chất tự nhiên có sẵn trong nước, khác với RO là loại bỏ gần hết.\"* |\n| **Nano vs RO** | \"Nano tốt hơn RO\" | *\"Hai công nghệ nhắm hai mục tiêu khác nhau\"* + nêu điểm khác biệt (**Phần 6** Q24) |\n| **Hiệu suất nước mức 1** | \"Đạt hiệu suất nước cao nhất\" | *\"Đạt mức 1 theo tiêu chuẩn hiệu suất nước GB 34914-2021 của Trung Quốc.\"* — phải nêu rõ là tiêu chuẩn TQ |\n| **Chi phí 5 năm** | \"Chi phí sử dụng là 32 nghìn/ngày\" | *\"Ước tính sơ bộ cho hộ 4 người, khoảng 32–35 nghìn một ngày tính cả tiền máy lẫn tiền lõi.\"* — **phải có chữ \"ước tính\"** |\n| **Bảo hành 5 năm bơm + bo** | Hứa chắc miệng | *\"Theo chính sách của bên em, bơm và bo mạch điều khiển được bảo hành 5 năm.\"* — nếu khách đòi văn bản thì **chuyển phòng kinh doanh**, không tự cam kết |\n| **Giá** | Tự hạ giá / tự báo mức chiết khấu | Giá niêm yết là 44.950.000 đ. **Mọi mức khác phải xin duyệt** (O-08) |\n| **Có sẵn lõi thay không** | \"Có sẵn, bên em thay ngay\" | *\"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay.\"* (kho hiện **0 lõi** — `F-K08`) |\n| **Nhà sản xuất** | Nói chắc một tên | Hai bản HDSD ghi 2 NSX khác nhau (O-01). Nếu khách hỏi: *\"GE là nhãn hiệu của General Electric, sản phẩm được sản xuất theo giấy phép.\"* (`F-A09`) |\n\n---\n\n\n## 3. 🚨 QUY TẮC MẸ & BÉ / Y KHOA — NGHIÊM NGẶT NHẤT\n\n### 3.1 Vì sao phải nghiêm\n\nNút **45 °C** trên vòi được hãng đặt tên gốc là **\"泡奶键\" — phím pha sữa**. Đây là **nhãn chức năng của nhà sản xuất**, không phải khuyến nghị y tế. Rất dễ trượt từ *\"nút này để pha sữa\"* sang *\"nước này tốt cho bé\"* — và đó là ranh giới bị cấm.\n\n### 3.2 Ranh giới\n\n| ✅ ĐƯỢC NÓI (mô tả chức năng) | 🔴 CẤM NÓI (kết luận y tế/dinh dưỡng) |\n|---|---|\n| *\"Nút WARM cài sẵn 45 độ, hãng đặt cho tình huống pha sữa.\"* | *\"45 độ là nhiệt độ chuẩn để pha sữa cho bé.\"* |\n| *\"Máy có khoá trẻ em, phải chạm LOCK trước mới ra được nước nóng.\"* | *\"Máy an toàn tuyệt đối cho trẻ nhỏ.\"* |\n| *\"Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo EN 14350 — tiêu chuẩn EU áp dụng cho dụng cụ uống của trẻ em.\"* | *\"Đạt chuẩn an toàn cho mẹ và bé.\"* / *\"Được chứng nhận dùng được cho trẻ sơ sinh.\"* |\n| *\"Màng lọc nano giữ lại khoáng chất tự nhiên có trong nước.\"* | *\"Nước có khoáng tốt cho sự phát triển của bé.\"* |\n| *\"Lõi màng giảm kim loại nặng như chì, asen, cadimi.\"* | *\"Bảo vệ bé khỏi nhiễm độc chì.\"* |\n| *\"TÜV kiểm E. coli, S. aureus, P. aeruginosa bên trong máy sau thời gian dùng dài, kết quả vẫn sạch.\"* | *\"Nước sạch khuẩn, mẹ bầu uống yên tâm.\"* |\n\n### 3.3 Ba câu hỏi khách hay hỏi và câu trả lời bắt buộc\n\n| Khách hỏi | ✅ Trả lời chuẩn |\n|---|---|\n| *\"Nước này pha sữa cho bé được không?\"* | *\"Trên vòi có nút 45 độ, hãng thiết kế cho tình huống pha sữa và mình chọn được nhiệt độ chính xác. Còn việc pha sữa cho bé thế nào cho đúng thì anh/chị theo hướng dẫn của hãng sữa và bác sĩ ạ — cái đó em không tư vấn được.\"* |\n| *\"Nước này bà bầu / người bệnh uống được không?\"* | *\"Máy lọc nước máy đô thị thành nước uống trực tiếp. Còn chế độ uống cho người đang mang thai hay đang điều trị thì em không có chuyên môn để tư vấn, anh/chị hỏi bác sĩ sẽ chuẩn hơn ạ.\"* |\n| *\"Khoáng trong nước có tác dụng gì?\"* | *\"Cái này em không tư vấn được vì liên quan sức khoẻ. Em chỉ khẳng định được là máy **giữ lại** khoáng tự nhiên chứ không loại bỏ như RO.\"* |\n\n### 3.4 Từ khoá tự động chặn (dùng cho chatbot/AI)\n\nNếu câu trả lời sắp sinh ra chứa bất kỳ cụm nào dưới đây → **chặn, thay bằng câu thoát ở mục 3.3**:\n\n```\ntốt cho sức khoẻ · tốt cho bé · tốt cho mẹ bầu · an toàn cho trẻ sơ sinh\nphòng bệnh · chữa · điều trị · hỗ trợ điều trị · tăng đề kháng · tăng miễn dịch\nbổ sung khoáng cho cơ thể · chống oxy hoá · điều hoà huyết áp · tốt cho xương\ngiảm nguy cơ · ngăn ngừa ung thư · thải độc · thanh lọc cơ thể · cân bằng pH cơ thể\nnước kiềm tốt hơn · uống vào khỏi bệnh · bác sĩ khuyên dùng\n```\n\n---\n\n\n## 4. 🟢 DANH SÁCH XANH — ĐƯỢC NÓI THOẢI MÁI\n\nĐây là các dữ kiện hạng A/B, đã kiểm chứng, **không cần chứng nhận nào để bảo vệ**:\n\n| Nội dung | Mã | Vì sao an toàn |\n|---|---|---|\n| **Vị trí mô-đun tiệt trùng** — lắp nối tiếp trên đường nước tinh khiết đi lên vòi | `F-D05` | Ghi rõ trong bước lắp đặt của HDSD chính hãng |\n| **Máy rộng 17,9 cm**, kích thước 467×179×477 mm | `F-B01`, `F-B02` | Số đo trên HDSD |\n| **Âm tủ hoàn toàn**, mặt bàn chỉ có vòi | `F-A06` | HDSD |\n| **2 lõi — 4 bước lọc** | `F-C01` | HDSD |\n| **Không có bình chứa nước lọc** (tankless) | `F-C02` | HDSD |\n| **4 chế độ: thường / 45 / 85 / 95 °C** | `F-E01` | HDSD |\n| **Khoá trẻ em 2 bước** để lấy nước nóng | `F-E04`, `F-E06` | HDSD |\n| **Máy tự xả rửa màng theo lịch** | `F-E09` | HDSD |\n| **Chức năng không đọng nước** — nước tồn tự quay về lọc lại | `F-E11` | HDSD |\n| **Nhắc thay lõi 2 cấp** (nháy đỏ → đỏ liên tục), báo ở **3 nơi** | `F-E12`, `F-E14` | HDSD + deck NSX |\n| **Máy đếm lõi theo cả ngày lẫn lượng nước đã lọc** | `F-C18` | Quy cách + Danh mục |\n| **Thay lõi tự làm được**, rút ngang, không cần kéo máy ra | `F-E18`, `F-C27` | HDSD + deck NSX |\n| **Vòi xoay 120°**, chuẩn **IPX4**, bo mạch phủ keo 100% | `F-E26`–`F-E28` | Deck NSX |\n| **App G+ Life** — theo dõi tuổi thọ lõi, cảnh báo rò rỉ | `F-F02`, `F-F07` | HDSD + deck NSX |\n| **Patent màng nano US 7138058** — khách tra được trên Google Patents | `F-C11` | Công khai |\n| **TÜV kiểm máy đã dùng lâu, không phải máy mới** | `F-I07` | Tài liệu TÜV |\n| **Bảo hành 12 tháng toàn máy** + danh sách loại trừ | `F-G01`, `F-G03` | HDSD |\n| **Chỉ dùng nước máy đô thị**, 5–38 °C | `F-B14`, `F-B15` | HDSD |\n| **Chỉ dùng cho gia đình**, không lắp nơi tiêu thụ nước cao | `F-C21` | HDSD |\n| **0 ticket sự cố trên 11 máy trong ~2 năm** | `F-K03` | Dữ liệu nội bộ GWT |\n\n---\n\n\n## 5. QUY TẮC RIÊNG THEO KÊNH\n\n| Kênh | Được dùng hạng | Ràng buộc thêm |\n|---|---|---|\n| **Video / TVC / landing page** | A, B | Mọi con số lên hình phải có mã `F-xxx`. ⛔ Không đọc 3 con số lít cạnh nhau. ⛔ Không superlative dù chỉ trong lời thoại phụ |\n| **Caption social** | A, B | Rút gọn được nhưng **không được rút gọn mất điều kiện** (ví dụ bỏ chữ \"khuyến nghị\" khỏi chu kỳ lõi) |\n| **Chatbot / AI** | A, B | Bắt buộc chạy bộ lọc từ khoá mục 3.4. Khi không chắc → câu thoát mục 0 |\n| **Sale nói miệng / inbox** | A, B, và **được biết** C/D để tư vấn | ⛔ Không đọc số hạng C/D cho khách. ⛔ Không tự ra giá |\n| **Báo giá bằng văn bản** | A | ⛔ **Chưa chốt VAT** (O-07) → mọi báo giá văn bản phải qua phòng kinh doanh |\n| **Tài liệu đào tạo nội bộ** | A, B, C, D, E | Phải ghi rõ hạng của từng dữ kiện |\n\n---\n\n\n## 6. CHECKLIST TRƯỚC KHI XUẤT BẢN\n\nTrước khi bấm đăng / bấm quay / gửi khách, chạy 8 câu hỏi:\n\n- [ ] **1.** Mỗi con số trong nội dung có mã `F-xxx` không?\n- [ ] **2.** Có con số nào hạng C, D, E bị lọt lên nội dung xuất bản không?\n- [ ] **3.** Có từ nào trong Danh sách đỏ (mục 1) không?\n- [ ] **4.** Có từ nào trong danh sách chặn y khoa (mục 3.4) không?\n- [ ] **5.** Có so sánh tuyệt đối nào không (\"nhất\", \"duy nhất\", \"hơn hẳn\")?\n- [ ] **6.** Có nêu tên/mã lõi lọc không?\n- [ ] **7.** Chu kỳ lõi có kèm chữ **\"khuyến nghị\"** không?\n- [ ] **8.** Nếu có nhắc chứng nhận — file bằng chứng đã có trong tay chưa? Nếu chưa, đã dùng đúng kịch bản **Phần 6** Q25 chưa?\n\n> Nếu bất kỳ ô nào không tick được → **không xuất bản**, chuyển về **Phần 8** ghi nhận.\n\n---"
      },
      {
        "so": 3,
        "slug": "huong-dan-khach",
        "ten": "Hướng dẫn khách hàng",
        "nhom": "ky-thuat",
        "coNoiDung": true,
        "noiDung": "# PHẦN 3 — HƯỚNG DẪN KHÁCH HÀNG — SỬ DỤNG · VỆ SINH · THAY LÕI\n\n> **PKB v1.2 · 28/08/2026** · Nguồn: **HDSD chính hãng Ver.26.08.14** (S1) + thông báo kỹ thuật NSX (S7)\n> **Dùng cho:** phát cho khách khi bàn giao · CSKH đọc qua điện thoại · nội dung mục \"Hướng dẫn sử dụng\" trên website\n> ⚠️ File này **không thay thế HDSD chính hãng đi kèm máy**. Đây là bản rút gọn cho tình huống thực tế.\n\n---\n\n\n## 1. NGÀY ĐẦU TIÊN — SAU KHI LẮP XONG\n\n| Bước | Việc | Chi tiết |\n|---|---|---|\n| 1 | Máy hiện **`C1`** | Đây là **chế độ xả rửa lần đầu** — bình thường |\n| 2 | Chạm nút **lấy nước** để bắt đầu xả | Máy tự xả rửa toàn hệ thống |\n| 3 | Chờ **khoảng 16 phút** | Xong thì màn hình trở lại bình thường |\n| 4 | Có **bột than đen hoặc bọt khí** trong nước | **Bình thường** — bột từ lõi carbon mới. Tiếp tục xả cho đến khi **nước trong** |\n| 5 | Kiểm tra không rò rỉ | Nhìn quanh thân máy và các mối nối trong tủ |\n\n> ⚠️ Nếu mất điện giữa chừng, máy sẽ **đếm lại 16 phút từ đầu** khi có điện lại.\n\n---\n\n\n## 2. DÙNG HẰNG NGÀY\n\n### 2.1 Lấy nước nhiệt độ phòng\n\n```\nChạm nút nước thường  →  ra nước ngay  (không cần mở khoá)\n```\n\n### 2.2 Lấy nước nóng — luôn là **2 bước**\n\n```\nBước 1: chạm nút  LOCK   (mở khoá trẻ em)\nBước 2: chạm nút nhiệt độ muốn lấy\n```\n\n| Nút | Nhiệt độ | Hãng thiết kế cho |\n|---|---|---|\n| **WARM** | **45 °C** | Pha sữa |\n| **EX WARM** | **85 °C** | Pha trà |\n| **HOT** | **95 °C** | Pha cà phê, mì, nước sôi |\n\n> **Khoá trẻ em tự bật lại** sau vài giây không thao tác. Nghĩa là mỗi lần lấy nước nóng đều phải mở khoá lại — đây là thiết kế cố ý.\n> Đèn LOCK: **tắt** = đang mở khoá · **sáng trắng** = đang khoá.\n\n### 2.3 Đổi nhiệt độ cài sẵn của một nút\n\n```\nGiữ đồng thời  LOCK + nút cần đổi  trong 3 giây\n```\nKhi đã chọn một mức, hai nút nhiệt còn lại **tạm bị vô hiệu hoá** — để tránh bấm nhầm.\n\n### 2.4 Đọc màn hình trên vòi\n\n| Hiển thị | Nghĩa |\n|---|---|\n| Con số | Nhiệt độ nước nóng **hiện tại** trong bình đun |\n| **Nháy** | Đang gia nhiệt |\n| **Tắt** | Không gia nhiệt |\n| Đèn lõi **trắng** | Lõi còn trong hạn |\n| Đèn lõi **nháy đỏ** | Sắp tới hạn — **đặt lõi trước** |\n| Đèn lõi **đỏ liên tục** | Hết hạn — **thay ngay** |\n| Đèn UV **trắng** | Mô-đun tiệt trùng còn hạn |\n| Đèn UV **nháy trắng** | Mô-đun tiệt trùng sắp hết hạn |\n\n### 2.5 Đọc đèn trên thân máy (trong tủ)\n\n| Đèn | Trạng thái | Nghĩa |\n|---|---|---|\n| **Status** | Xanh liên tục | Đang lọc nước |\n| **Status** | Nháy xanh chậm | Đang xả rửa |\n| **NF / PCFB** | Xanh liên tục | Lõi bình thường |\n| **NF / PCFB** | Nháy đỏ | Lõi sắp hết hạn |\n| **NF / PCFB** | Đỏ liên tục | Lõi đã hết hạn |\n| **WiFi** | Xanh liên tục | Đã kết nối mạng |\n| **WiFi** | Nháy xanh chậm | Chưa kết nối / kết nối thất bại |\n\n---\n\n\n## 3. 4 THÓI QUEN NÊN CÓ\n\n| # | Thói quen | Vì sao | Nguồn |\n|---|---|---|---|\n| **1** | **Mỗi sáng, xả bỏ lượng nước tồn qua đêm** trước lần dùng đầu tiên | HDSD khuyến nghị. Nói thẳng với khách chứ đừng giấu — máy đã có chức năng không đọng nước nhưng hãng vẫn khuyên làm việc này | S1 |\n| **2** | **Lau khô mặt vòi khi có nước bắn lên** | Giọt nước lớn đọng trên mặt vòi có thể **kích hoạt nhầm chế độ xả rửa `C1`** | S7 |\n| **3** | **Bấm nút xả bình đun (\"Mỗi ngày tươi mới\") theo thói quen** | Xả sạch nước tồn trong bình đun bằng 1 chạm: chạm `LOCK` → chạm nút xả | S1, S3 |\n| **4** | **Khoá van bi cấp nước khi không dùng máy dài ngày** | HDSD yêu cầu | S1 |\n\n---\n\n\n## 4. VỆ SINH & BẢO DƯỠNG\n\n### 4.1 Máy tự làm những gì\n\n| Máy tự làm | Chi tiết |\n|---|---|\n| **Xả rửa bề mặt màng theo lịch** | Tự động, khách không phải làm gì |\n| **Chức năng không đọng nước** | Khi lâu không dùng, nước tinh khiết tồn trong lõi **tự quay về lọc lại** |\n| **Đếm tuổi thọ lõi** | Đếm **cả theo ngày lẫn theo lượng nước đã lọc**, cái nào tới trước tính cái đó |\n\n### 4.2 Khách làm những gì\n\n| Việc | Cách làm | Tần suất |\n|---|---|---|\n| **Lau vỏ ngoài & mặt vòi** | Khăn mềm ẩm, lau xong lau khô. ⛔ **Không dùng hoá chất tẩy, dung môi, chất ăn mòn** | Khi cần |\n| **Xả nước tồn buổi sáng** | Mở vòi xả một lúc | Hằng ngày |\n| **Xả bình đun** | Chạm `LOCK` → chạm nút xả | Theo thói quen |\n| **Thay lõi khi đèn báo** | Xem mục 5 | Theo đèn báo |\n| **Gọi kỹ thuật thay ống PE + đầu nối** | Là chi tiết lão hoá, **có tính phí theo giá thị trường** | **Mỗi 24 tháng** |\n\n### 4.3 ⛔ Tuyệt đối không làm\n\n| Không được | Vì sao |\n|---|---|\n| Đổ nước tẩy, giấm, hoá chất vào máy để \"vệ sinh\" | Chất ăn mòn làm hỏng bộ phận tiếp xúc nước → **chất độc hại vào đường nước** |\n| Rửa lại lõi cũ để dùng tiếp | Lõi đã dùng **không thể rửa hay tái chế** |\n| Tự tháo thân máy, tháo vòi, tháo ống | **Mất bảo hành** + rủi ro ngập |\n| Dùng lõi không chính hãng | **Mất bảo hành**, ảnh hưởng chất lượng nước |\n| Đặt vật nặng lên máy hoặc che kín máy | Cản trở tản nhiệt → quá nhiệt |\n\n---\n\n\n## 5. THAY LÕI LỌC\n\n### 5.1 Khi nào phải thay\n\n**Máy báo:** đèn lõi **nháy đỏ** (sắp hết — chuẩn bị lõi) → **đỏ liên tục** (phải thay ngay).\n\n**Hoặc khi có một trong ba dấu hiệu (theo HDSD):**\n1. Chất lượng nước suy giảm, **mùi vị kém đi**\n2. **Lưu lượng giảm đáng kể**, và không phải do nước lạnh\n3. **Lõi tắc nghiêm trọng**, không lấy được nước bình thường\n\n**Phân biệt lõi nào:**\n- **Mùi vị kém** → dấu hiệu của **lõi carbon (lõi thô)**\n- **Không lấy được nước** → dấu hiệu **lõi bị tắc**\n\n### 5.2 Chu kỳ khuyến nghị\n\n| Lõi | Chu kỳ khuyến nghị (GWT) | Giá tham khảo |\n|---|---|---|\n| **Lõi thô tổng hợp** | ~**12 tháng** | 2.750.000 đ |\n| **Lõi màng lọc nano** | ~**48 tháng** | 7.500.000 đ |\n\n> ⚠️ **Đây là chu kỳ khuyến nghị, không phải hạn cứng.**\n> HDSD chính hãng ghi nguyên văn: *\"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ sử dụng của lõi lọc… có thể ngắn hơn các chu kỳ ước tính nêu trên… **Dữ liệu trên chỉ mang tính tham khảo**.\"*\n> Nhà dùng nhiều nước, hoặc nước đầu vào nhiều cặn/độ cứng cao → lõi hết sớm hơn. Vì thế **máy đếm cả ngày lẫn lít và tự báo**, khách không phải tự nhớ.\n>\n> 🔵 *Nội bộ:* HDSD chính hãng khuyến nghị **6–12 tháng** (lõi thô) và **24–36 tháng** (lõi màng) — ngắn hơn con số GWT chốt. Xem **Phần 8** **O-02**. ⛔ Không đọc mâu thuẫn này cho khách; nếu khách tự đọc HDSD và hỏi → trả lời theo **Phần 6** **Q13**.\n\n### 5.3 Quy trình thay — 6 bước, khoảng 5 phút\n\n```\n1.  Khoá van bi cấp nước 3 ngã  +  RÚT ĐIỆN\n2.  Mở nắp trước của máy\n3.  Xoay lõi cũ NGƯỢC chiều kim đồng hồ để tháo ra\n4.  Lắp lõi mới: xoay THUẬN chiều kim đồng hồ cho tới khi 2 ký hiệu thẳng hàng\n5.  RESET: giữ nút lõi tương ứng 3 giây\n       → nghe 1 tiếng bíp + biểu tượng lõi về trạng thái ổn định = xong\n6.  XẢ RỬA: máy hiện \"C2\" → chạm nút nước nhiệt độ phòng\n       → xả rửa 8 phút → màn hình về bình thường\n```\n\n> ✅ **Khách tự thay được.** Lõi thiết kế **rút ngang**, không phải kéo máy ra khỏi tủ.\n> ⚠️ **Quên bước 5 (reset)** là lỗi phổ biến nhất — máy sẽ vẫn báo đỏ dù đã thay lõi mới.\n> ⚠️ Lõi cũ: thải như **chất thải rắn sinh hoạt**, không rửa lại để dùng.\n\n### 5.4 Reset mô-đun tiệt trùng (khi đèn UV nháy trắng)\n\n```\n1.  Mở khoá trẻ em (chạm LOCK)\n2.  Giữ đồng thời nút \"WARM\" + nút \"UV\" trong 3 giây\n3.  Màn hình hiện \"SA\" + 1 tiếng bíp = đã reset xong\n```\n\n---\n\n\n## 6. KẾT NỐI ỨNG DỤNG G+ LIFE\n\n```\n1.  Bật Bluetooth trên điện thoại + đảm bảo điện thoại đang kết nối Wi-Fi nhà\n2.  Quét mã QR trên máy để tải app G+ Life\n3.  Đăng ký bằng số điện thoại + mã xác minh, đăng nhập, điền hồ sơ\n4.  Bấm \"Add Device\"\n5.  Giữ nút trên máy 3 giây để vào chế độ ghép nối\n6.  Nhập mật khẩu Wi-Fi nhà, chờ ghép nối\n7.  Bấm \"Getting Started\" — xong\n```\n\n**Trên app xem được:** tuổi thọ lõi còn lại theo %, trạng thái máy, chất lượng nước, cảnh báo rò rỉ, hẹn giờ đun, xả rửa từ xa.\n\n**Nếu ghép nối thất bại:** đèn WiFi nháy chậm rồi tắt. Giữ nút Wi-Fi **3 giây** để huỷ liên kết cũ và ghép lại từ đầu.\n\n---\n\n\n## 7. ĐI VẮNG DÀI NGÀY\n\n```\nTRƯỚC KHI ĐI:\n  - Khoá van bi cấp nước\n  - Rút điện\n\nKHI VỀ:\n  - Mở van, cắm điện\n  - MỞ VÒI XẢ NƯỚC MỘT LÚC trước khi uống\n  - Chú ý chất lượng nước; nếu thấy bất thường → gọi hậu mãi\n```\n\n---\n\n\n## 8. NHỮNG GÌ KHÁCH THƯỜNG HIỂU NHẦM\n\n| Khách nghĩ | Thực tế |\n|---|---|\n| *\"Máy có bình chứa nước lọc\"* | **Không.** Máy tankless — lọc và đun trực tiếp theo dòng chảy. Chỉ có **bình đun** cho nước nóng |\n| *\"Bột đen trong nước là máy hỏng\"* | Là **bột than từ lõi carbon mới**. Bình thường, xả tới khi nước trong |\n| *\"`C1` là mã lỗi\"* | `C1` là **chế độ xả rửa**, hoàn toàn bình thường |\n| *\"`EL` là mã lỗi\"* | `EL` = máy đang **tự bơm bù nước vào bình đun**. Bình thường |\n| *\"Thay lõi xong là dùng được ngay\"* | Phải **reset (giữ nút 3 giây)** rồi **xả rửa 8 phút** (`C2`) |\n| *\"Lõi lọc được bảo hành\"* | **Không.** Lõi là **vật tư tiêu hao**. Mô-đun tiệt trùng và adapter cũng **không được bảo hành** |\n| *\"Đèn báo đỏ mới cần quan tâm\"* | **Nháy đỏ** đã là lúc cần đặt lõi. Đợi đỏ liên tục mới đặt thì bị gián đoạn |\n| *\"Máy dùng nước giếng khoan được\"* | **Chỉ nước máy đô thị.** Nước giếng cần hệ tiền xử lý phía trước, nếu không lõi tắc rất nhanh |\n| *\"Lắp cho quán cà phê / văn phòng cũng như nhà\"* | HDSD ghi rõ **chỉ dùng gia đình**, không lắp nơi tiêu thụ nước cao. Lắp sai có thể ảnh hưởng bảo hành |\n| *\"Nước 95 độ là nước sôi 100 độ\"* | Là **95 °C**. Máy còn tự học điểm sôi theo vùng — ở nơi cao so với mực nước biển, nhiệt độ tối đa sẽ thấp hơn |\n\n---\n\n\n## 9. SỐ CẦN NHỚ CHO KHÁCH\n\n| Việc | Thao tác |\n|---|---|\n| Lấy nước nóng | `LOCK` → nút nhiệt độ |\n| Đổi nhiệt độ cài sẵn | Giữ `LOCK` + nút đó **3 giây** |\n| Xả bình đun | `LOCK` → nút xả |\n| Reset sau thay lõi | Giữ nút lõi **3 giây** |\n| Reset mô-đun tiệt trùng | Giữ `WARM` + `UV` **3 giây** → hiện `SA` |\n| Vào chế độ ghép nối Wi-Fi | Giữ nút Wi-Fi **3 giây** |\n| Chờ xả rửa lần đầu (`C1`) | **16 phút** |\n| Chờ xả rửa sau thay lõi (`C2`) | **8 phút** |\n| 🔴 Có sự cố | **Rút điện + khoá van bi 3 ngã** rồi gọi hotline |\n\n---"
      },
      {
        "so": 4,
        "slug": "an-toan",
        "ten": "Safety database",
        "nhom": "ky-thuat",
        "coNoiDung": true,
        "noiDung": "# PHẦN 4 — SAFETY DATABASE\n\n> **PKB v1.2 · 28/08/2026** · Nguồn chính: **S1 — HDSD chính hãng Ver.26.08.14**, mục *Các lưu ý an toàn* + *Vận hành, chăm sóc và bảo dưỡng*\n> **Dùng cho:** kỹ thuật lắp đặt · CSKH · sale (phần điều kiện lắp đặt) · biên soạn tài liệu bàn giao khách\n> **Nguyên tắc:** file này **chỉ chép lại yêu cầu của hãng**, không thêm khuyến nghị tự nghĩ. Mọi dòng đều truy được về HDSD.\n\n---\n\n\n## 1. PHÂN LOẠI MỨC RỦI RO\n\n| Mức | Ký hiệu | Nghĩa | Hành động |\n|---|---|---|---|\n| **N1 — CẢNH BÁO** | 🔴 | Có thể gây **thương tích nghiêm trọng hoặc thiệt hại tài sản** (điện giật, cháy, bỏng, ngập nước) | Dừng ngay, không tự xử lý, gọi kỹ thuật |\n| **N2 — THẬN TRỌNG** | 🟠 | Có thể **làm hỏng máy hoặc ảnh hưởng chất lượng nước** | Khắc phục trước khi dùng tiếp |\n| **N3 — LƯU Ý** | 🟡 | Ảnh hưởng **tuổi thọ, hiệu suất, trải nghiệm** | Nhắc khách trong buổi bàn giao |\n\n---\n\n\n## 2. 🔴 N1 — CẢNH BÁO AN TOÀN ĐIỆN & CHÁY NỔ\n\n| ID | Yêu cầu của hãng | Hậu quả nếu vi phạm | Nguồn |\n|---|---|---|---|\n| `SF-01` | **Phải cắm vào ổ cắm có nối đất đúng cách**, theo tiêu chuẩn quốc gia hiện hành. Máy thuộc **Cấp bảo vệ Class I** | Điện giật · đoản mạch · hoả hoạn | S1 |\n| `SF-02` | **Ổ cắm phải chịu được dòng lớn hơn dòng định mức của máy.** Không dùng nguồn vượt quá yêu cầu định mức (máy 2.100 W) | Quá nhiệt · hoả hoạn | S1 |\n| `SF-03` | **Không chạm phích cắm bằng tay ướt** | Điện giật | S1 |\n| `SF-04` | **Ngắt nguồn điện trước khi lắp đặt** | Điện giật | S1 |\n| `SF-05` | **Không làm hỏng dây nguồn hoặc ổ cắm.** Nếu dây nguồn hỏng, **chỉ NSX / bộ phận dịch vụ của NSX / người có chuyên môn được thay** | Điện giật · đoản mạch · hoả hoạn | S1 |\n| `SF-06` | **Không đặt vật nặng lên máy, không che phủ máy** | Cản trở tản nhiệt → quá nhiệt · hoả hoạn | S1 |\n| `SF-07` | **Để máy tránh xa ngọn lửa trần** | Biến dạng · nóng chảy · rò rỉ · nguy cơ cháy | S1 |\n| `SF-08` | **Không lắp ở nơi nhiệt độ cao hoặc độ ẩm cao** | Hỏng sản phẩm · điện giật · đoản mạch · hoả hoạn | S1 |\n| `SF-09` | **Không để chất ăn mòn tiếp xúc với máy** | Hỏng bộ phận tiếp xúc nước → **chất độc hại xâm nhập đường nước, nước bị nhiễm bẩn** | S1 |\n\n---\n\n\n## 3. 🔴 N1 — CẢNH BÁO NƯỚC & NGẬP\n\n| ID | Yêu cầu của hãng | Hậu quả nếu vi phạm | Nguồn |\n|---|---|---|---|\n| `SF-10` | **Đường xả nước cô đặc không được tắc nghẽn.** Không vận hành máy nếu hệ thống thoát nước bị tắc | Nước cô đặc **chảy ngược vào máy → nhiễm bẩn các bộ phận bên trong**; hoặc nước thải tràn ra gây thiệt hại | S1 |\n| `SF-11` | **Khi máy trục trặc: rút phích cắm + khoá nguồn cấp nước NGAY.** Không tiếp tục vận hành thiết bị bị lỗi | Lan rộng sự cố | S1 |\n| `SF-12` | **Khi lắp ống nước: cắm ống vào hết cỡ trong đầu nối nhanh TRƯỚC, rồi mới lắp kẹp giữ ống. KHÔNG được bỏ qua kẹp** | Bung ống → ngập tủ bếp | S1 |\n| `SF-13` | **Ngắt điện + khoá van ngay** khi: đường ống/bộ phận rò rỉ · bộ phận không hoạt động bình thường · **bất kỳ bộ phận điện nào rò điện** · bất kỳ tình trạng bất thường nào khác | Điện giật · ngập nước | S1 |\n| `SF-14` | **Giữ máy ở tư thế thẳng đứng.** Không đặt hoặc vận hành lộn ngược | Hỏng máy · rò rỉ | S1 |\n| `SF-15` | **Khoá van bi cấp nước khi không sử dụng thiết bị** | Giảm rủi ro rò rỉ khi vắng nhà | S1 |\n\n---\n\n\n## 4. 🟠 N2 — ĐIỀU KIỆN VẬN HÀNH BẮT BUỘC\n\n| ID | Điều kiện | Giá trị | Nếu vi phạm | Nguồn |\n|---|---|---|---|---|\n| `SF-16` | **Nguồn nước** | **Chỉ nước máy đô thị** | Nước giếng khoan / nước bể lâu ngày / nước nhiều sắt phèn → **lõi tắc rất nhanh**, cần hệ tiền xử lý phía trước | S1 |\n| `SF-17` | **Nhiệt độ nước vào** | **5 – 38 °C**, không vượt quá 38 °C | Ảnh hưởng màng lọc | S1 |\n| `SF-18` | **Nhiệt độ môi trường** | **4 – 40 °C**. ⛔ **Không vận hành dưới 4 °C** | Đóng băng · hỏng máy | S1 |\n| `SF-19` | **Áp lực nước vào** | **0,1 – 0,4 MPa**. Ngoài phạm vi này **phải liên hệ nhà cung cấp dịch vụ** | Dưới 0,1 MPa: máy không tạo nước · Trên 0,4 MPa: **ngoại lực/áp suất vượt giới hạn = MẤT BẢO HÀNH** (`F-G04`) | S1 |\n| `SF-20` | **Vị trí lắp** | ⛔ **Không lắp ngoài trời** · ⛔ **Không lắp dưới ánh nắng trực tiếp** | Nắng trực tiếp **đẩy nhanh lão hoá bộ phận bên ngoài, rút ngắn tuổi thọ** | S1 |\n| `SF-21` | **Đường ống** | Không bẻ gập ống trong lắp đặt và vận hành | Hạn chế lưu lượng · không ra nước nóng | S1 |\n| `SF-22` | **Xả rửa** | **Bắt buộc xả rửa trước lần dùng đầu tiên** và **sau thời gian không sử dụng** | Chất lượng nước | S1 |\n| `SF-23` | **Đối tượng sử dụng** | ⛔ **Chỉ dùng trong gia đình.** Không lắp ở nơi công cộng có mức tiêu thụ nước cao | Tuổi thọ lõi tính theo mức dùng hộ gia đình — nơi tiêu thụ cao sẽ hết lõi rất nhanh và **có thể ảnh hưởng bảo hành** (lắp sai HDSD) | S1 |\n| `SF-24` | **Lõi lọc** | Chỉ dùng lõi được **General Water Technology (HongKong) Co., Ltd. phê duyệt** | *\"Việc sử dụng linh kiện không được uỷ quyền có thể làm hỏng thiết bị và **sẽ làm mất hiệu lực bảo hành**\"* | S1 |\n\n---\n\n\n## 5. 🔴 RỦI RO BỎNG — NƯỚC 95 °C\n\n> Máy cấp nước tới **95 °C**. Đây là rủi ro an toàn duy nhất mà **khách gặp hằng ngày**, phải nói rõ trong buổi bàn giao.\n\n| ID | Cơ chế bảo vệ của máy | Chi tiết | Nguồn |\n|---|---|---|---|\n| `SF-25` | **Khoá trẻ em luôn bật** | Phải chạm **LOCK** trước rồi mới chạm nút nhiệt độ. Trẻ chạm bừa 1 nút **không ra nước nóng** | S1 |\n| `SF-26` | **Tự khoá lại** | Khoá tự bật lại sau **5 giây** không thao tác, hoặc sau khi lấy nước xong | S6 |\n| `SF-27` | **Khoá chỉ chặn nước nóng** | Nước nhiệt độ phòng vẫn lấy được 1 chạm — trẻ vẫn uống được nước mà không chạm được nước sôi | S6 |\n| `SF-28` | **Chỉ 1 mức nhiệt hoạt động tại một thời điểm** | Khi chọn 1 mức, 2 nút nhiệt còn lại **bị vô hiệu hoá** → giảm bấm nhầm | S1 |\n| `SF-29` | **Rơ-le nhiệt bảo vệ chống đun cạn** | Có trên sơ đồ điện — ngắt mâm nhiệt khi bình đun cạn nước | S1 |\n\n**Nội dung bắt buộc nói khi bàn giao nhà có trẻ nhỏ:**\n> *\"Máy ra nước tới 95 độ. Để lấy nước nóng phải chạm nút khoá trước rồi mới chạm nút nhiệt độ — hai bước. Khoá tự bật lại sau vài giây nên bé chạm một nút sẽ không ra nước nóng. Nhưng anh/chị vẫn nên dặn bé không nghịch vòi, vì không có cơ chế nào thay được người lớn trông.\"*\n\n⛔ **Không được nói:** *\"máy an toàn tuyệt đối với trẻ em\"* (xem **Phần 2** mục 3).\n\n---\n\n\n## 6. 🟠 QUY TRÌNH KHẨN CẤP\n\n### 6.1 Phát hiện rò rỉ nước / máy báo `E7`\n\n```\n1. NGẮT ĐIỆN (rút phích cắm)\n2. KHOÁ VAN BI CẤP NƯỚC 3 NGÃ (hoặc van nước tổng của nhà)\n3. Lau khô khu vực, kiểm tra mức độ ngập\n4. GỌI KỸ THUẬT — không tự tháo lắp\n5. KHÔNG cắm điện lại cho tới khi kỹ thuật kiểm tra\n```\n\n### 6.2 Máy báo `E3` (bảo vệ chống tràn)\n\n```\n1. Chạm nút \"Refresh\" (nút xả bình nước nóng) để xả bình đun\n2. Khởi động lại máy\n3. Nếu tái diễn 2 lần liên tiếp → GỌI KỸ THUẬT\n```\n> Theo quy cách S6: nếu phát hiện tràn **2 lần liên tiếp**, máy yêu cầu **cấp lại nguồn** mới khôi phục.\n\n### 6.3 Nghi ngờ rò điện\n\n```\n1. KHÔNG chạm vào máy hay vòi\n2. Ngắt aptomat của khu vực bếp (không rút phích bằng tay ướt)\n3. Khoá van cấp nước\n4. GỌI KỸ THUẬT ngay\n```\n\n### 6.4 Nước có mùi/vị lạ bất thường\n\n```\n1. Ngừng uống\n2. Kiểm tra đèn báo lõi (nháy đỏ / đỏ liên tục?)\n3. Xả bỏ nước một lúc rồi thử lại\n4. Nếu vẫn lạ → ngừng dùng, gọi kỹ thuật, KHÔNG tự pha hoá chất vệ sinh vào máy\n```\n\n### 6.5 Đi vắng dài ngày\n\n```\nTRƯỚC KHI ĐI:  khoá van bi cấp nước + rút điện\nKHI VỀ:        mở van, cắm điện, MỞ VÒI XẢ NƯỚC MỘT LÚC trước khi uống\n               chú ý chất lượng nước; nếu có lo ngại → gọi hậu mãi\n```\n\n---\n\n\n## 7. 🟡 N3 — LƯU Ý DÙNG HẰNG NGÀY\n\n| ID | Lưu ý | Nguồn |\n|---|---|---|\n| `SF-30` | **Mỗi sáng nên mở vòi xả bỏ lượng nước tồn trong máy qua đêm trước lần dùng đầu tiên** | S1 |\n| `SF-31` | **Giữ mặt vòi luôn khô ráo.** Nước đọng trên mặt vòi có thể tạo mạch cảm ứng giữa 2 phím và **kích hoạt nhầm chế độ xả rửa (`C1`)** | S7 |\n| `SF-32` | **Lõi đã dùng không thể rửa hay tái chế.** Thải như chất thải rắn sinh hoạt, giao người có chuyên môn xử lý | S1 |\n| `SF-33` | **Thay lõi định kỳ.** Lõi và vòng đệm kín là **vật tư dùng một lần**, phải thay kịp thời sau khi hết tuổi thọ | S1 |\n| `SF-34` | **Ống PE và đầu nối là chi tiết lão hoá** — khuyến nghị thay mỗi **24 tháng**, **tính phí theo giá thị trường** | S1 |\n| `SF-35` | **Bột than đen và bọt khí trong nước lúc mới lắp là BÌNH THƯỜNG.** Tiếp tục xả cho đến khi nước trong | S1 |\n| `SF-36` | **Không tự tháo dỡ hoặc sửa đổi máy** — mất bảo hành và có rủi ro an toàn. Khi có bộ phận hỏng, gọi hotline để nhân viên hậu mãi thay | S1 |\n\n---\n\n\n## 8. AN TOÀN TRONG LẮP ĐẶT (dành cho kỹ thuật)\n\n| ID | Yêu cầu | Nguồn |\n|---|---|---|\n| `SF-37` | **Phải do thợ lắp đặt chuyên nghiệp thực hiện** | S1 |\n| `SF-38` | **Không đấu nguồn nước hoặc nguồn điện trước khi hoàn tất lắp đặt** | S1 |\n| `SF-39` | **Kiểm tra đủ phụ kiện trước khi lắp** (đối chiếu danh mục đóng gói `F-J02`) | S1 |\n| `SF-40` | Dụng cụ bắt buộc: mỏ lết · máy khoan điện · **mũi khoan Ø30 mm** · tua vít 4 cạnh + dẹt · dao cắt ống · cờ lê 14~16 mm · cờ lê 19~21 mm · kìm mỏ nhọn | S1 |\n| `SF-41` | Vòi lắp **thẳng hàng theo phương đứng với thân máy**; cần **mặt phẳng bán kính 3,8 cm** quanh lỗ | S1 |\n| `SF-42` | **Sau khi đấu xong: kiểm tra lại toàn bộ một lần nữa** trước khi cấp nước/điện | S1 |\n| `SF-43` | **Chạy thử bắt buộc:** mở van + cắm điện + mở vòi xả toàn hệ thống → đóng vòi → **kiểm tra bơm tăng áp có dừng không** + **kiểm tra mọi mối nối có rò không** | S1 |\n| `SF-44` | Sau lắp máy hiện **`C1`** → chạm nút lấy nước → **xả rửa ~16 phút** trước khi dùng | S1 |\n| `SF-45` | Đường nước cô đặc phải dẫn ra **ống thoát nước hoặc phễu thoát sàn**, ghi rõ trên sơ đồ: *\"không được để tắc\"* | S1 |\n| `SF-46` | **Ống thông hơi phải đi thẳng lên/xuống, không được võng xuống rồi lên lại.** Nước ngưng đọng ở điểm thấp gây bí khí → **vòi tự chảy nước không cần bấm** | S7 |\n| `SF-47` | Ống thông hơi **quá dài** hoặc **bị xoắn trong ống đỡ tròn của vòi** cũng gây bí khí. Cắt về độ dài phù hợp; kiểm tra thông thoáng bằng cách **thổi hơi qua ống** | S7 |\n\n---\n\n\n## 9. BẢNG TRA NHANH — \"KHI NÀO PHẢI DỪNG MÁY NGAY\"\n\n| Hiện tượng | Dừng ngay? | Việc phải làm |\n|---|---|---|\n| Rò rỉ nước ở bất kỳ đâu / báo `E7` | 🔴 **CÓ** | Ngắt điện + khoá van + gọi kỹ thuật |\n| Nghi rò điện, tê tay khi chạm vòi | 🔴 **CÓ** | Ngắt aptomat + gọi kỹ thuật |\n| Dây nguồn/phích cắm hỏng, sờn | 🔴 **CÓ** | Ngắt điện + gọi kỹ thuật (⛔ không tự thay dây) |\n| Đường thoát nước cô đặc bị tắc | 🔴 **CÓ** | Không vận hành cho tới khi thông |\n| Máy phát ra mùi khét, nóng bất thường | 🔴 **CÓ** | Ngắt điện + gọi kỹ thuật |\n| Nước ra có mùi/vị lạ bất thường | 🟠 Ngừng uống | Kiểm tra đèn lõi → gọi kỹ thuật |\n| Báo `E5` (gia nhiệt bất thường) | 🟠 | Tắt/bật lại 1 lần; còn lỗi → gọi kỹ thuật |\n| Báo `E8` / `E9` (đầu dò, cảm biến) | 🟠 | Gọi kỹ thuật |\n| Báo `E1`, `E2` | 🟡 | Tắt nguồn, kiểm tra cáp vòi, bật lại |\n| Báo `E3` | 🟡 | Xả bình nóng → khởi động lại |\n| Báo `E4` | 🟡 | **Kiểm tra van cấp nước đã mở chưa** |\n| Báo `C1`, `C2`, `SA`, `EL` | 🟢 **Không** | Trạng thái bình thường — xem **Phần 5** |\n\n---\n\n\n## 10. NỘI DUNG BÀN GIAO KHÁCH (checklist kỹ thuật ký nhận)\n\n- [ ] Hướng dẫn **2 bước lấy nước nóng** (LOCK → nút nhiệt) và **rủi ro bỏng 95 °C**\n- [ ] Chỉ vị trí **van bi 3 ngã** và cách khoá khi có sự cố / đi vắng\n- [ ] Chỉ vị trí **phích cắm** và cách ngắt điện an toàn\n- [ ] Giải thích **đèn báo lõi 2 cấp** (nháy đỏ → đỏ liên tục) trên vòi và trên thân máy\n- [ ] Nói rõ **lõi lọc, mô-đun tiệt trùng, adapter KHÔNG được bảo hành** (`F-G03`)\n- [ ] Nói rõ **ống PE và đầu nối thay mỗi 24 tháng, có tính phí** (`SF-34`)\n- [ ] Dặn **lau khô mặt vòi** (`SF-31`) và **xả nước tồn mỗi sáng** (`SF-30`)\n- [ ] Dặn **chỉ dùng nước máy đô thị** (`SF-16`)\n- [ ] Hướng dẫn quy trình **đi vắng dài ngày** (mục 6.5)\n- [ ] Giao **phiếu bảo hành + hoá đơn gốc**, dặn giữ (`F-G05`)\n- [ ] Ghép nối **app G+ Life** nếu khách muốn\n- [ ] Ghi số **hotline hậu mãi** vào nơi khách thấy được\n\n---"
      },
      {
        "so": 5,
        "slug": "loi-xu-ly",
        "ten": "Lỗi thường gặp & cách xử lý",
        "nhom": "ky-thuat",
        "coNoiDung": true,
        "noiDung": "# PHẦN 5 — LỖI THƯỜNG GẶP & CÁCH XỬ LÝ\n\n> **PKB v1.2 · 28/08/2026** · Nguồn chuẩn để tra mã lỗi: **S1 — HDSD chính hãng Ver.26.08.14**\n> **Dùng cho:** CSKH tổng đài · kỹ thuật hiện trường · chatbot\n> ⚠️ **Quy tắc:** khi tài liệu kỹ thuật nội bộ (S6) và HDSD (S1) ghi khác nhau về ý nghĩa mã lỗi → **luôn dùng S1**. Xem bảng đối chiếu ở **Phần 8 · Bảng 4**.\n\n---\n\n\n## 1. BẢNG MÃ HIỂN THỊ TRÊN VÒI\n\n### 1.1 Mã trạng thái BÌNH THƯỜNG (🟢 không phải lỗi — trấn an khách ngay)\n\n| Mã | Nghĩa | Nói với khách | Kỹ thuật cần biết | Nguồn |\n|---|---|---|---|---|\n| `C1` | Chế độ xả rửa lần đầu | *\"Đây là bước xả rửa sau lắp đặt, hoàn toàn bình thường. Anh/chị chạm nút lấy nước rồi chờ khoảng 16 phút.\"* | Cưỡng bức xả 16 phút: 8 phút nước thường + tối đa 8 phút xả bình đun. Mất điện giữa chừng → **đếm lại từ đầu** | S1, S6 |\n| `C2` | Xả rửa sau khi reset lõi | *\"Máy đang xả rửa lõi mới, chờ 8 phút là xong.\"* | Chạm nút **nước nhiệt độ phòng** để bắt đầu. Mỗi lõi: xả 30 giây + ra nước 5 phút | S1, S6 |\n| `SA` | Đã reset mô-đun tiệt trùng thành công | *\"Máy đã ghi nhận, bình thường ạ.\"* | Hiện 1 lần kèm 1 tiếng bíp sau khi giữ `WARM` + `UV` 3 giây | S1 |\n| `EL` | **Mực nước trong bình đun xuống mức thấp** — máy đang tự bơm bù | *\"Máy đang tự châm nước vào bình đun, chút nữa hết ạ.\"* | Nháy 1Hz, **không kêu bíp**. Trong lúc này máy **tạm dừng ra nước nóng và tạm dừng gia nhiệt** cho tới khi đủ nước. ⚠️ **Không có trong HDSD** — chỉ có ở S6/S7 | S6, S7 |\n\n> 🔴 **Sai lầm phổ biến của CSKH:** coi `C1` và `EL` là lỗi rồi cử kỹ thuật đi. **Cả hai đều là trạng thái bình thường.**\n\n### 1.2 Mã LỖI (🔴)\n\n| Mã | Nghĩa (S1) | Khách tự làm được | Khi nào cử kỹ thuật | Nguồn |\n|---|---|---|---|---|\n| `E1` | Lỗi truyền thông vòi thông minh | Tắt nguồn → kiểm tra cáp vòi có lỏng không → khởi động lại | Còn lỗi sau 1 lần khởi động lại | S1 |\n| `E2` | Bất thường truyền thông bo mạch hiển thị | Tắt nguồn → khởi động lại | Còn lỗi sau 1 lần | S1 |\n| `E3` | Kích hoạt bảo vệ chống tràn | Chạm nút **\"Refresh\"** (xả bình nước nóng) → khởi động lại | **Tái diễn 2 lần liên tiếp** (S6: máy yêu cầu cấp lại nguồn mới khôi phục) | S1, S6 |\n| `E4` | Sản xuất nước bất thường | **Kiểm tra van cấp nước đã mở chưa** (van bi 3 ngã + van nước lạnh) | Van đã mở hết mà vẫn `E4` | S1 |\n| `E5` | Gia nhiệt bất thường | Tắt nguồn → bật lại | **Còn lỗi sau 1 lần** → cử kỹ thuật | S1 |\n| `E7` | **Rò rỉ nước** | 🔴 **Tắt điện + khoá van NGAY**, kiểm tra ống có hỏng không | **Luôn luôn cử kỹ thuật** | S1 |\n| `E8` | Bất thường đầu dò bình đun | ❌ | **Luôn cử kỹ thuật** | S1 |\n| `E9` | Bất thường cảm biến NTC | ❌ | **Luôn cử kỹ thuật** | S1 |\n\n> 🔵 **Nội bộ — cơ chế phía sau (S6, tham khảo, không đọc cho khách):**\n> `E4` còn được kích hoạt khi bơm tăng áp chạy liên tục **2 giờ** (bảo vệ quá thời gian) hoặc khi máy phát hiện mực nước vượt mức thấp nhưng **quá 5 phút chưa đạt mức cao**.\n> `E5` kích hoạt khi bơm nước nóng không chạy quá **10 phút**. Gia nhiệt quá **3 phút mà nhiệt độ không đổi** cũng dừng đun.\n> `E8` = NTC gia nhiệt hở mạch hoặc ngắn mạch. `E9` = NTC hơi nước hở mạch hoặc ngắn mạch. Cả hai đều **tắt toàn bộ chức năng**.\n\n### 1.3 Mã ⛔ KHÔNG hướng dẫn khách\n\n| Mã | Nghĩa | Vì sao chặn |\n|---|---|---|\n| `SC` | Xác nhận **khôi phục cài đặt gốc** (giữ `ECO` + `nước thường` 10 giây) | **Xoá toàn bộ dữ liệu đếm tuổi thọ lõi.** Chỉ kỹ thuật viên thực hiện, và phải ghi lại số ngày/số lít đã dùng trước khi reset |\n| `F1` `F2` `F3` | Mã dự phòng, chưa gán chức năng | Không có ý nghĩa vận hành |\n\n---\n\n\n## 2. BẢNG SỰ CỐ — HIỆN TƯỢNG → NGUYÊN NHÂN → XỬ LÝ\n\n*(Nguồn: HDSD Ver.26.08.14, mục 5 — Khắc phục sự cố)*\n\n| # | Khách báo | Nguyên nhân có thể | Xử lý | Ai làm |\n|---|---|---|---|---|\n| 1 | **Máy không khởi động** | Chưa cắm điện / chưa bật công tắc | Kiểm tra phích cắm và công tắc nguồn | Khách |\n| 2 | **Máy không khởi động** | Lỗi bộ chuyển nguồn (adapter) | Liên hệ hậu mãi | Kỹ thuật |\n| 3 | **Máy đã dừng nhưng nước thải vẫn chảy** | Lỗi van điện từ cấp nước vào | Liên hệ hậu mãi | Kỹ thuật |\n| 4 | **Rò rỉ nước** | Lõi hoặc ống nước chưa đấu nối đúng | Kiểm tra lõi đã lắp đúng chưa, mối nối ống đã chắc chưa | Kỹ thuật |\n| 5 | **Rò rỉ nước** | Đường ống hoặc bộ phận bị hư hỏng | 🔴 Ngắt điện + khoá van bi 3 ngã ngay → liên hệ hậu mãi | Khách + Kỹ thuật |\n| 6 | **Chất lượng nước kém** | Lỗi lõi lọc | Thay lõi hoặc liên hệ hậu mãi | Khách/Kỹ thuật |\n| 7 | **Chất lượng nước kém** | Chất lượng nước cấp kém | Kiểm tra nước máy đầu vào, **cân nhắc lắp hệ tiền xử lý** | Kỹ thuật khảo sát |\n| 8 | **Không ra nước nhiệt độ phòng** | Van nước lạnh hoặc van bi 3 ngã chưa mở | Mở van tương ứng | Khách |\n| 9 | **Không ra nước nhiệt độ phòng** | Ống nước bị gập | Kiểm tra ống cấp, ống nước cô đặc, ống nước tinh khiết | Kỹ thuật |\n| 10 | **Lưu lượng nước thường thấp** | Van bi 3 ngã chưa mở **hết** | Mở hoàn toàn van cấp nước | Khách |\n| 11 | **Lưu lượng nước thường thấp** | Lõi lọc bị tắc | Thay lõi hoặc liên hệ hậu mãi | Khách/Kỹ thuật |\n| 12 | **Không ra nước nóng hoặc yếu** | Bơm ly tâm bị hút khí | **Lặp lại thao tác lấy nước nóng vài lần** | Khách |\n| 13 | **Không ra nước nóng hoặc yếu** | Vòi thông minh trục trặc | Liên hệ hậu mãi | Kỹ thuật |\n| 14 | **Không ra nước nóng hoặc yếu** | Ống nước nóng hoặc ống thông hơi bị gập | Kiểm tra hai ống này | Kỹ thuật |\n\n---\n\n\n## 3. SỰ CỐ HIỆN TRƯỜNG (không có trong HDSD)\n\n> **Nguồn:** S7 — Thông báo kỹ thuật hậu mãi của NSX (`Những lưu ý khi lắp đặt máy All-in-one heater · 23-3`), soạn sau khi số lượng máy lắp đặt tăng và có nhiều phản hồi từ hiện trường.\n> 🔵 **Hạng C** — dùng để chẩn đoán, không đưa lên tài liệu xuất bản.\n\n### 3.1 Máy tự vào chế độ xả rửa `C1` liên tục\n\n| Mục | Nội dung |\n|---|---|\n| **Hiện tượng** | Máy đang dùng bình thường thì màn hình hiện `C1` và tự vào chế độ xả rửa |\n| **Nguyên nhân thật** | **Giọt nước lớn đọng trên mặt vòi** tạo mạch cảm ứng nối giữa **phím nước thường** và **phím tiết kiệm điện** → kích hoạt trạng thái xuất xưởng → máy vào chế độ xả rửa khởi động |\n| **Xử lý ngay** | Chạm nút **nước nhiệt độ phòng**, xả rửa theo quy trình máy mới **16 phút** là dùng lại bình thường |\n| **Phòng ngừa** | **Giữ mặt vòi luôn khô. Có nước đọng thì lau ngay.** Đây là câu bắt buộc nói khi bàn giao |\n\n> 🟢 **Đây là sự cố hiện trường số 1 của dòng máy này.** CSKH nghe khách báo \"máy tự chạy xả nước\" → hỏi ngay *\"mặt vòi có đọng nước không anh/chị?\"* trước khi cử kỹ thuật.\n\n### 3.2 Vòi tự chảy nước liên tục dù không bấm nút\n\n| Mục | Nội dung |\n|---|---|\n| **Hiện tượng** | Không thao tác gì mà vòi vẫn chảy nước liên tục |\n| **Nguyên nhân thật** | **Ống thông hơi bị bí áp** — bình đun không xả được hơi |\n| **Kiểm tra** | ① Ống thông hơi có **quá dài** → bị gập hoặc xoắn? ② Ống có **võng xuống rồi lên lại** → nước ngưng đọng ở điểm thấp gây bí khí? ③ Ống có bị **xoắn bên trong ống đỡ tròn của vòi**? |\n| **Xử lý** | Cắt ống về độ dài phù hợp, đi **thẳng lên – thẳng xuống**, tuyệt đối **không võng xuống giữa chừng**. Kiểm tra thông thoáng bằng cách **thổi hơi qua ống** |\n\n### 3.3 Lỗ thông hơi trên vòi nhỏ nước liên tục\n\n| Mục | Nội dung |\n|---|---|\n| **Hiện tượng** | Ngoài miệng vòi, trên vòi còn có **lỗ thông hơi** để bình đun xả hơi nóng. Lỗ này nhỏ nước liên tục |\n| **Nguyên nhân A** | **Kiểm soát mực nước cao trong bình đun bị lỗi** → nước nóng tràn ra theo lỗ thông hơi |\n| **Xử lý A** | Bấm nút **\"Mỗi ngày tươi mới\" / Refresh** để xả cạn bình đun cho tới khi màn hình hiện **`EL`**, máy sẽ tự bơm bù về mức bình thường |\n| **Nguyên nhân B** | **Ống mềm bên trong vòi bị tuột** |\n| **Dấu hiệu nhận biết B** | Ngoài lỗ thông hơi, **phần dưới thân vòi cũng có nước chảy ra** |\n| **Xử lý B** | Cử kỹ thuật — tháo vòi, lắp lại ống mềm |\n\n---\n\n\n## 4. KỊCH BẢN CSKH — HỎI TRƯỚC KHI CỬ KỸ THUẬT\n\n> Mục tiêu: lọc được các ca khách tự xử lý được, tránh cử kỹ thuật đi vô ích. **Ghi lại câu trả lời của khách vào ticket.**\n\n| Khách báo | Hỏi theo thứ tự | Nếu là… thì… |\n|---|---|---|\n| **\"Máy không chạy\"** | 1. Phích cắm đã cắm chưa? · 2. Công tắc/aptomat có bật không? · 3. Đèn trên thân máy có sáng gì không? | Đèn không sáng gì → nghi adapter → **cử kỹ thuật** |\n| **\"Không ra nước thường\"** | 1. Van bi 3 ngã dưới bồn rửa đã mở chưa? · 2. Van nước lạnh có mở không? · 3. Màn hình vòi hiện mã gì? | Hiện `E4` → hỏi lại van · Van đã mở mà vẫn không ra → **cử kỹ thuật** (nghi ống gập) |\n| **\"Nước chảy yếu\"** | 1. Van đã mở **HẾT** chưa? · 2. Đèn lõi đang màu gì? · 3. Yếu từ bao giờ — đột ngột hay giảm dần? | Đèn đỏ → **bán lõi** · Giảm dần + đèn xanh → nghi tắc lõi sớm do nước đầu vào → **khảo sát** |\n| **\"Không ra nước nóng\"** | 1. Đã chạm **LOCK** trước chưa? · 2. Màn hình có nháy (đang đun) không? · 3. Thử lấy lại **3–4 lần** liên tiếp xem sao? · 4. Có hiện `EL` không? | Thử lại thì ra → **bơm hút khí, bình thường** · Hiện `EL` → **đang bơm bù, chờ** · Vẫn không ra → **cử kỹ thuật** |\n| **\"Máy tự chạy / tự xả nước\"** | 1. Màn hình có hiện `C1` không? · 2. **Mặt vòi có đọng nước không?** | Có `C1` + mặt vòi ướt → **hướng dẫn lau khô + xả 16 phút, KHÔNG cử kỹ thuật** (mục 3.1) |\n| **\"Vòi tự chảy không bấm\"** | 1. Nước chảy ra từ **miệng vòi** hay **lỗ thông hơi**? | Lỗ thông hơi → mục 3.3 · Miệng vòi → mục 3.2, **cử kỹ thuật kiểm tra ống thông hơi** |\n| **\"Máy dừng nhưng vẫn chảy nước thải\"** | — | **Cử kỹ thuật ngay** (van điện từ) |\n| **\"Rò rỉ nước\"** | 1. 🔴 **Hướng dẫn tắt điện + khoá van NGAY** trước khi hỏi tiếp · 2. Rò ở đâu — thân máy, mối nối, hay vòi? · 3. Có hiện `E7` không? | **Luôn cử kỹ thuật** |\n| **\"Nước có vị lạ / mùi lạ\"** | 1. Đèn lõi màu gì? · 2. Máy lắp bao lâu rồi? · 3. Có phải mới lắp không (bột than)? | Mới lắp + có bột đen → **bình thường, xả tiếp** · Đèn đỏ → **thay lõi** · Đèn xanh + máy cũ → **cử kỹ thuật** |\n| **\"Nước có bột đen / bọt khí\"** | 1. Máy mới lắp phải không? | Mới lắp → **BÌNH THƯỜNG**, xả tới khi nước trong (`SF-35`) |\n\n---\n\n\n## 5. QUY TẮC LEO THANG\n\n| Mức | Điều kiện | Thời hạn phản hồi | Ai xử lý |\n|---|---|---|---|\n| **P1 — Khẩn** | Rò rỉ nước (`E7`) · nghi rò điện · ngập tủ bếp · mùi khét | Gọi lại trong **1 giờ**, có mặt trong **24 giờ** | Kỹ thuật trưởng |\n| **P2 — Cao** | Máy không ra nước hoàn toàn · `E5`/`E8`/`E9` · máy dừng nhưng vẫn chảy nước thải | Gọi lại trong **4 giờ**, có mặt trong **48 giờ** | Kỹ thuật |\n| **P3 — Trung bình** | Lưu lượng yếu · nước có vị lạ · `E1`/`E2`/`E3` tái diễn · đèn lõi đỏ cần thay | Gọi lại trong **1 ngày làm việc** | CSKH → Kỹ thuật |\n| **P4 — Thấp** | Hỏi cách dùng · ghép app · `C1`/`C2`/`SA`/`EL` · lau vòi | Xử lý ngay trên điện thoại | CSKH |\n\n> 🔴 **Ràng buộc tồn kho:** kho hiện **0 lõi USH10** (`F-K08`) và **chưa từng bán bộ lõi màng nào** (`F-K06`).\n> ⛔ **Không hứa \"bên em có sẵn, thay ngay\".**\n> ✅ Câu chuẩn: *\"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay.\"*\n> Lý do: **hứa rồi không có hàng** là nguyên nhân số 1 khiến khách Việt mất niềm tin vào hãng lọc nước. Thà hẹn chậm mà đúng.\n\n---\n\n\n## 6. NHỮNG GÌ CSKH KHÔNG ĐƯỢC HƯỚNG DẪN KHÁCH TỰ LÀM\n\n| ⛔ Không hướng dẫn | Vì sao |\n|---|---|\n| Khôi phục cài đặt gốc (`SC`) | Xoá dữ liệu đếm lõi |\n| Tháo vòi, tháo ống thông hơi | Rủi ro ngập + mất bảo hành (tự tháo dỡ) |\n| Tự thay dây nguồn / adapter | HDSD quy định chỉ NSX hoặc người có chuyên môn |\n| Tự tháo thân máy, mở nắp ngoài nắp trước | Mất bảo hành (`F-G04`) |\n| Đổ hoá chất/nước tẩy vào máy để \"vệ sinh\" | Chất ăn mòn → nhiễm bẩn đường nước (`SF-09`) |\n| Rửa lại lõi cũ để dùng tiếp | HDSD ghi rõ lõi đã dùng **không thể rửa hay tái chế** (`F-C24`) |\n| Dùng lõi ngoài / lõi không chính hãng | **Mất bảo hành** (`F-C25`) |\n| Lắp máy ở quán/văn phòng đông người | HDSD ghi rõ chỉ dùng gia đình (`SF-23`) |\n\n---\n\n\n## 7. MẪU GHI TICKET\n\n```\nMã máy:            [GTUN-8600HP-G / GTUN-8600VNHP]\nNgày lắp:          \nCòn bảo hành:      [Còn / Hết — 8/11 máy đã hết BH toàn máy]\nMã trên màn hình:  [C1/C2/SA/EL/E1..E9/không có]\nĐèn lõi:           [xanh / nháy đỏ / đỏ liên tục]\nĐèn Status:        [xanh liên tục / nháy chậm / tắt]\nĐèn WiFi:          [xanh / nháy chậm]\nMặt vòi có ướt:    [có / không]        ← bắt buộc hỏi nếu báo C1\nVan bi 3 ngã:      [mở hết / mở một phần / chưa mở]\nĐã thử tắt-bật:    [có / chưa]\nPhân loại:         [P1 / P2 / P3 / P4]\nCần lõi:           [không / lõi thô / lõi màng]  ← nếu cần thì KIỂM TRA TỒN KHO TRƯỚC KHI HẸN\n```\n\n---"
      },
      {
        "so": 6,
        "slug": "hoi-dap",
        "ten": "Bộ hỏi–đáp đã kiểm chứng",
        "nhom": "san-pham",
        "coNoiDung": true,
        "noiDung": "# PHẦN 6 — BỘ HỎI–ĐÁP ĐÃ KIỂM CHỨNG\n\n> **PKB v1.2 · 28/08/2026** · Dùng cho: **Sale · CSKH · Chatbot · Livestream · Inbox**\n> **Cách dùng:** mỗi câu có **① Ngắn** (chat/điện thoại) và **② Đầy đủ** (gặp trực tiếp/livestream).\n> Ô 🔒 là **lưu ý nội bộ — không đọc cho khách**. Mã `F-xxx` truy về **Phần 1**.\n> ⚠️ **Đọc **Phần 2** trước khi dùng file này.**\n\n---\n\n\n## BẢNG CẤM NÓI — RÚT GỌN, ĐỌC TRƯỚC MỖI CA TRỰC\n\n| ⛔ Không được nói | ✅ Nói thay bằng |\n|---|---|\n| \"Diệt khuẩn 99,999%\" | \"Có mô-đun tiệt trùng đặt ngay trên đường nước ra vòi\" |\n| \"Cao nhất / duy nhất / tốt nhất / số 1\" | Nêu con số cụ thể, để khách tự so |\n| Tên mã lõi (PCFB, NF700, LX-…) | \"Lõi thô\" / \"lõi màng lọc nano\" |\n| Công dụng khoáng với sức khoẻ | \"Giữ lại khoáng tự nhiên có trong nước\" — dừng ở đó |\n| \"Mức nhiệt 75 độ\" | \"Nước thường, 45, 85, 95 độ\" |\n| \"Lõi bền 4 năm\" (như cam kết) | \"Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo\" |\n| \"Áp lực 0 MPa cũng chạy\" | \"Cần áp lực 0,1–0,4 MPa\" |\n| \"Máy để bàn\" | \"Máy âm tủ bếp\" |\n| Con số tỷ lệ thu hồi nước (69/77/76,8%) | ⛔ Không nói con số nào |\n| Số hiệu TÜV (kể cả số đúng) | \"Em xin gửi anh/chị bằng văn bản\" — ⛔ không đưa link tự tra (`F-I16`) |\n| \"Nước nóng ra sau 2,8 giây\" | \"Rót 100 ml nước nóng khoảng 2,8 giây\" |\n| Trộn số lõi màng (8.600/12.240) với số lõi thô (6.630/10.200) | Chọn 1 con số cho 1 thông điệp |\n\n---\n\n\n## NHÓM 1 — TỔNG QUAN\n\n\n### Q1. USH10 là máy gì? Đặt ở đâu?\n\n**① Ngắn:** Máy lọc nước nóng công nghệ lọc nano, **lắp âm trong tủ bếp**, chỉ có vòi cảm ứng lộ trên mặt bàn. Lấy được cả nước nhiệt độ phòng và nước nóng 3 mức, không cần đun lại. `F-A02` `F-A06`\n\n**② Đầy đủ:** USH10 là máy lọc nước **âm tủ bếp** dùng màng lọc nano. Toàn bộ thân máy giấu dưới bồn rửa, trên mặt bàn chỉ có một vòi cảm ứng thông minh. Máy lọc và đun **trực tiếp theo dòng chảy — không có bình chứa nước lọc**, nên không có chuyện nước tồn lâu trong bình. Bấm là ra nước, chọn được nhiệt độ phòng hoặc 45 / 85 / 95 độ. `F-C02` `F-E01`\n\n---\n\n\n### Q2. Máy chiếm bao nhiêu chỗ trong tủ bếp?\n\n**① Ngắn:** Máy rộng **17,9 cm**. Kích thước đầy đủ **467 × 179 × 477 mm**. `F-B01`\n\n**② Đầy đủ:** Máy rộng đúng **179 mm** — con số quan trọng với tủ bếp chung cư, vì gầm chậu rửa thường đã bị ống xi phông và giỏ rác chiếm chỗ. Sâu 467 mm, cao 477 mm. Anh/chị đo khoang trống dưới chậu, lọt được chiều rộng 18 cm là lắp được. `F-B02`\n\n> 🔒 Brochure còn ghi yêu cầu tủ **cao ≥550 mm, sâu ≥530 mm** (`F-B19`) và deck NSX gợi ý chừa hở **≥10 cm** (`F-B20`) — cả hai **không có trong HDSD**, dùng để hỏi số đo trước khi chốt, **không lên hình**. HDSD chỉ quy định lỗ khoan vòi **Ø30 mm** + mặt phẳng bán kính **3,8 cm** (`F-B18`).\n\n---\n\n\n### Q3. Máy này lọc bằng công nghệ gì? Có phải RO không?\n\n**① Ngắn:** **Không phải RO.** Máy dùng **màng lọc nano**, lỗ lọc 0,001 µm — lọc sạch nhưng **vẫn giữ lại khoáng tự nhiên** trong nước. `F-C05` `F-C07`\n\n**② Đầy đủ:** Máy RO lọc theo kiểu chặn hết, nước ra gần như tinh khiết hoàn toàn nên mất luôn khoáng. USH10 dùng **màng lọc nano tích điện**: vẫn chặn kim loại nặng như chì, asen, cadimi, chặn vi khuẩn, chặn chất hữu cơ — nhưng **cho khoáng tự nhiên đi qua**. Nước uống vào vẫn có vị, không bị \"nhạt\" như nước RO. `F-C06` `F-C08`\n\n> 🔒 8 khoáng giữ lại: Canxi · Magie · Natri · Kali · Kẽm · Selen · Stronti · Axit metasilicic (`F-C10`). **Chỉ liệt kê tên, tuyệt đối không nói công dụng.** Khách hỏi công dụng → *\"Cái này em không tư vấn được vì liên quan sức khoẻ, anh/chị hỏi bác sĩ sẽ chuẩn hơn. Em chỉ khẳng định máy giữ lại chứ không loại bỏ.\"*\n\n---\n\n\n### Q4. Máy có mấy lõi lọc? Lọc qua mấy bước?\n\n**① Ngắn:** **2 lõi — 4 bước lọc.** `F-C01`\n\n**② Đầy đủ:**\n- **Lõi 1 (lõi thô tổng hợp):** lọc cặn lắng, rỉ sét, hạt lơ lửng; hấp phụ clo dư và mùi khó chịu. Đồng thời **bảo vệ lõi màng phía sau**. `F-C04`\n- **Lõi 2 (lõi màng lọc nano):** chặn kim loại nặng (chì, asen, cadimi), vi khuẩn (E. coli), chất hữu cơ (tricloromethane, carbon tetraclorua) — và **giữ lại khoáng**. `F-C06`\n\nChỉ 2 lõi nên thay nhanh, ít tốn công — khác các máy 7–9 lõi phải nhớ nhiều mốc.\n\n> 🔒 ⛔ Không đọc mã lõi. Khách hỏi \"lõi tên gì để tôi mua ngoài\" → *\"Lõi này là lõi chuyên dụng của máy, bên em cung cấp trực tiếp. Hướng dẫn sử dụng ghi rõ dùng lõi không chính hãng thì máy mất bảo hành.\"* (`F-C25`)\n\n---\n\n\n### Q5. Máy dùng được cho quán cà phê / văn phòng không?\n\n**① Ngắn:** HDSD ghi máy **chỉ dành cho gia đình**. Nếu anh/chị dùng cho quán, bên em cần khảo sát và tư vấn giải pháp phù hợp hơn.\n\n**② Đầy đủ:** Hướng dẫn sử dụng của hãng ghi rõ: *\"Sản phẩm này chỉ dành cho sử dụng trong gia đình và không nên lắp đặt ở những nơi có mức tiêu thụ nước cao.\"* Tuổi thọ lõi được tính theo mức dùng của một hộ gia đình. Lắp ở nơi tiêu thụ cao thì lõi hết rất nhanh và có thể ảnh hưởng bảo hành. `F-C21` `SF-23`\n\n> 🔒 **Đây là câu phải nói thật, không lách.** Thực tế GWT đã có case F&B (PIN Cafe 33 Hàng Hòm, The Ghé Coffee Q1 — `F-K12`) nhưng đó là **quyết định thương mại riêng**, không phải khuyến nghị của hãng. Nếu khách F&B vẫn muốn mua → chuyển phòng kinh doanh để có thoả thuận riêng về chu kỳ lõi, **đừng tự hứa**.\n\n---\n\n\n## NHÓM 2 — NƯỚC NÓNG\n\n\n### Q6. Máy có mấy mức nhiệt?\n\n**① Ngắn:** **4 chế độ:** nước nhiệt độ phòng · **45 °C** · **85 °C** · **95 °C**. `F-E01`\n\n**② Đầy đủ:**\n\n| Nút | Nhiệt độ | Hãng thiết kế cho |\n|---|---|---|\n| Nước thường | nhiệt độ phòng | uống trực tiếp, nấu ăn, rửa rau quả |\n| **WARM** | **45 °C** | pha sữa |\n| **EX WARM** | **85 °C** | pha trà |\n| **HOT** | **95 °C** | pha cà phê, mì, nước sôi |\n\nMàn hình trên vòi hiện **nhiệt độ nước nóng theo thời gian thực**. `F-E24`\n\n> 🔒 ⛔ **KHÔNG có mức 75 °C** (`F-E02`). Nhiều tài liệu cũ ghi sai \"45/75/85/95\" — đang sửa. Nếu lỡ nói thì đính chính ngay. Beat \"75 độ pha trà xanh\" trong kịch bản cũ → chuyển sang **85 °C**.\n\n---\n\n\n### Q7. Chọn nhiệt độ thế nào? Trẻ con bấm nhầm có sao không?\n\n**① Ngắn:** Có **khoá trẻ em**. Muốn ra nước nóng phải chạm **LOCK** trước rồi mới chạm nút nhiệt độ — trẻ bấm một nút thì không ra nước nóng. `F-E04`\n\n**② Đầy đủ:** Quy trình lấy nước nóng luôn là **2 bước**: chạm LOCK mở khoá → chạm nút nhiệt độ. **Khoá tự bật lại sau vài giây** không thao tác, nên mỗi lần lấy nước nóng đều phải mở khoá lại — đây là thiết kế cố ý. Riêng **nước nhiệt độ phòng** chạm 1 nút là ra ngay, không cần mở khoá, nên bé vẫn tự uống nước được. `F-E05` `F-E07` `F-E08`\n\n> 🔒 ⛔ **Không nói \"an toàn tuyệt đối cho trẻ em\"** (**Phần 2** mục 3). Cách nói đúng: mô tả cơ chế, rồi thêm *\"nhưng vẫn nên dặn bé không nghịch vòi\"*.\n\n---\n\n\n### Q8. Chỉnh nhiệt độ được không hay cố định?\n\n**① Ngắn:** Mỗi nút được cài sẵn một mức. Muốn đổi thì giữ **LOCK + nút đó 3 giây**. `F-E03`\n\n**② Đầy đủ:** Máy đặt sẵn 45 / 85 / 95 độ cho ba nút. Muốn đổi thì giữ đồng thời LOCK + nút cần đặt trong 3 giây. Khi chọn một mức, hai nút còn lại tạm bị vô hiệu hoá — để tránh bấm nhầm.\n\n---\n\n\n### Q9. Đun được bao nhiêu nước một giờ? Chờ có lâu không?\n\n**① Ngắn:** **20 lít/giờ**. Rót nước nóng ở tốc độ **2,1 L/phút**. Máy đun trực tiếp theo dòng chảy, không phải chờ đun cả bình. `F-B07` `F-B05`\n\n**② Đầy đủ:** Công suất làm nóng **20 L/giờ**, mâm nhiệt 2.000 W. Tốc độ rót nước nóng là **2,1 L/phút** — khoảng **2,8 giây cho một cốc 100 ml**. Máy **không có bình chứa nước lọc**; nước được đun trong bình đun riêng, nên không phải đợi \"sôi cả ấm\" như bình thuỷ điện. `F-E30`\n\n> 🔒 **QUAN TRỌNG — O-06.** *\"2,8 giây\"* là **tốc độ rót**, KHÔNG phải thời gian chờ nước nóng. ⛔ **Không nói \"nước nóng ra sau 2,8 giây\"** — đó là diễn đạt sai đang lan trong tài liệu marketing VN.\n> 🔒 20 L/giờ và 2,1 L/phút không mâu thuẫn: 2,1 L/phút là tốc độ rót đợt ngắn từ bình đun, 20 L/giờ là năng suất đun bền vững (`F-L07`).\n\n---\n\n\n### Q10. Máy có giữ nóng liên tục không? Tốn điện không?\n\n**① Ngắn:** Máy có **chế độ tiết kiệm điện** — sau một khoảng không thao tác thì tự ngừng giữ ấm. `F-E21`\n\n**② Đầy đủ:** Ở chế độ giữ ấm, máy giữ nước ở nhiệt độ đã cài và tự đun lại khi nguội. Nếu không ai dùng trong một khoảng thời gian, máy **tự chuyển sang chế độ tiết kiệm điện — không giữ ấm nữa**. Bấm nút là bật/tắt được thủ công. Khi cần nước nóng, máy đun lại từ đầu.\n\n> 🔒 ⚠️ **O-05 — số giờ đang mâu thuẫn.** Deck NSX và quy cách kỹ thuật đều ghi **3 giờ**; marketing VN ghi 2 giờ; HDSD quốc tế **không nhắc chế độ này**. ⛔ **Tạm không đọc số giờ cho khách** cho tới khi GWT chốt. Nói *\"sau một khoảng thời gian không dùng\"* là đủ.\n\n---\n\n\n## NHÓM 3 — TIỆT TRÙNG & AN TOÀN NƯỚC\n\n\n### Q11. Máy có tiệt trùng không? Đặt ở đâu?\n\n**① Ngắn:** Có. Máy có **mô-đun tiệt trùng** lắp **nối tiếp ngay trên đường nước đi ra vòi** — xử lý ở đoạn cuối cùng, sát miệng vòi nhất. `F-D05`\n\n**② Đầy đủ:** Đây là chi tiết đáng chú ý về mặt kỹ thuật. Nhiều máy đặt đèn diệt khuẩn ở **bình chứa** — nước xử lý xong vẫn nằm trong bình rồi chảy qua một đoạn ống dài trước khi tới vòi. USH10 đặt mô-đun tiệt trùng **trên chính đoạn ống nước tinh khiết chạy từ thân máy lên vòi**, theo đúng hướng dẫn lắp đặt của hãng: cắt ống nước tinh khiết, đầu vào nối cổng nước tinh khiết của máy, đầu ra nối đoạn ống **gần vòi nhất**.\n\nLý do quan trọng: **tia UV không có tác dụng tồn lưu** — nó chỉ xử lý nước đang đi qua, không \"để dành\" được. Nên đặt càng gần điểm uống thì càng đúng nguyên lý.\n\nTrên vòi có **nút UV** kèm đèn báo: **sáng trắng** = còn hạn · **nháy trắng** = sắp hết hạn. `F-E15`\n\n> 🔒 **QUAN TRỌNG:**\n> - ✅ **ĐƯỢC nói** máy có mô-đun tiệt trùng và nói vị trí — HDSD chính hãng Ver.26.08.14 ghi ở **5 chỗ độc lập** (danh mục đóng gói, sơ đồ điện, sơ đồ xử lý nước, bước lắp đặt số 4, nút vòi + reset `SA`) và điều khoản bảo hành còn loại trừ *\"đèn diệt khuẩn tia cực tím\"*.\n> - ⛔ **CẤM tuyệt đối con số \"99,999%\"** — phiếu SGS `ASH18-029858-01` chưa có; phiếu SGS đang lưu là của máy khác (50B04). `F-I10`\n> - ⚠️ **O-01 chưa đóng:** GWT chưa xác nhận máy bán tại VN đi kèm bản HDSD nào. Bản Trung Quốc **không có** mô-đun này. Nếu khách mở HDSD ra mà không thấy → xử lý: *\"Em kiểm tra lại cấu hình đúng của lô máy này và báo lại anh/chị.\"*\n> - Góc kể chuyện *\"đặt ở đâu quan trọng hơn có hay không\"* là **an toàn nhất** vì dựa trên nguyên lý phổ thông + HDSD, **không cần chứng nhận nào**.\n\n---\n\n\n### Q12. Nước để lâu trong máy có bị tù không?\n\n**① Ngắn:** Không. Máy có **chức năng không đọng nước** — lâu không dùng thì nước tồn trong lõi **tự quay về lọc lại**. `F-E11`\n\n**② Đầy đủ:** Máy tự xử lý ba việc:\n1. **Chức năng không đọng nước:** khi một thời gian không ai lấy nước, phần nước tinh khiết còn tồn trong lõi **tự động quay ngược về để lọc lại**.\n2. **Tự xả rửa màng theo lịch:** máy định kỳ tự làm sạch bề mặt màng, anh/chị không phải vệ sinh gì. `F-E09`\n3. **Nút xả bình đun** — 1 chạm là xả sạch nước tồn trong bình nước nóng. `F-E17`\n\nNgoài ra máy **không có bình chứa nước lọc**, nên không tồn tại \"bình nước để qua đêm\".\n\n> 🔒 HDSD vẫn khuyến nghị **mỗi sáng xả bỏ nước tồn qua đêm trước lần dùng đầu tiên** (`SF-30`). **Nên nói thật với khách như một mẹo dùng, đừng giấu** — nó tăng độ tin cậy chứ không làm yếu sản phẩm.\n\n---\n\n\n### Q13. Nước lọc rồi uống trực tiếp được không?\n\n**① Ngắn:** Được. Máy thiết kế để uống trực tiếp tại vòi.\n\n**② Đầy đủ:** Nước sau lọc uống trực tiếp được. Anh/chị chọn nút nước thường để uống mát, hoặc 95 độ nếu muốn nước sôi pha trà/cà phê.\n\n> 🔒 ⛔ **Không trích chuẩn nào cụ thể** (QCVN 6-1:2010, CJ94-2005…) khi chưa có phiếu thử trong tay (`F-I13`). Khách hỏi tiếp về tiêu chuẩn → xử lý như **Q28**.\n\n---\n\n\n## NHÓM 4 — VÒI THÔNG MINH\n\n\n### Q14. Vòi có gì đặc biệt?\n\n**① Ngắn:** Vòi cảm ứng toàn phím, **màn hình hiện nhiệt độ thời gian thực**, **khoá trẻ em**, **đèn nhắc thay lõi**, nút xả bình nước nóng, **xoay 120°**, chuẩn **IPX4**. `F-E26` `F-E27`\n\n**② Đầy đủ:** Vòi là bảng điều khiển chính của máy:\n- **Màn hình** hiện nhiệt độ nước nóng hiện tại; nháy = đang gia nhiệt, tắt = không gia nhiệt\n- **4 nút chọn chế độ nước** (thường / 45 / 85 / 95)\n- **Nút LOCK** — khoá trẻ em\n- **Nút UV** — trạng thái mô-đun tiệt trùng\n- **Đèn báo lõi lọc** — trắng = còn hạn · nháy đỏ = sắp hết · đỏ liên tục = phải thay\n- **Nút xả bình nước nóng** — chạm LOCK rồi chạm nút này\n- **Xoay 120°** (±60°), thân vòi tròn nên xoay nhiều góc\n- **Chuẩn chống nước IPX4**, **bo mạch phủ keo 100%**\n- Mặt hiển thị công nghệ **IMD** — hiển thị rõ, chống mài mòn\n- Có **2 màu: đen và bạc** `F-E28` `F-E29` `F-E31`\n\n---\n\n\n### Q15. Làm sao biết khi nào phải thay lõi?\n\n**① Ngắn:** Máy tự báo bằng đèn. **Nháy đỏ** = sắp tới hạn, chuẩn bị lõi. **Đỏ liên tục** = phải thay ngay. `F-E12`\n\n**② Đầy đủ:** Có **3 chỗ báo**: trên vòi, trên thân máy, và **thông báo trên điện thoại qua app**. `F-E14`\n\n| Đèn | Ý nghĩa |\n|---|---|\n| Trắng / xanh liên tục | Lõi còn trong hạn — không cần làm gì |\n| **Nháy đỏ** | Sắp hết hạn → **đặt lõi trước để không bị gián đoạn** |\n| **Đỏ liên tục** | Hết hạn → thay ngay |\n\nMáy **đếm theo cả số ngày lẫn lượng nước đã lọc**, cái nào tới trước tính cái đó — chứ không chỉ đếm ngày. Nhà dùng nhiều thì lõi báo sớm hơn, dùng ít thì lâu hơn. `F-C18`\n\n> 🔒 Beat mạnh: *\"lõi đo bằng LÍT chứ không chỉ đo bằng THÁNG\"* — đi ngược lợi ích người bán nên rất đáng tin. ⛔ Nhưng **không trộn số của lõi màng (8.600/12.240) với số của lõi thô (6.630/10.200)** trong cùng một câu — khác cấp bộ phận. Chọn **một con số cho một thông điệp** (`F-C17`).\n\n---\n\n\n## NHÓM 5 — LÕI LỌC & CHI PHÍ\n\n\n### Q16. Bao lâu thay lõi một lần? Hết bao nhiêu tiền?\n\n**① Ngắn:** Lõi thô khoảng **12 tháng** (~2.750.000 đ), lõi màng khoảng **48 tháng** (~7.500.000 đ). Máy tự báo khi tới hạn. `F-C14` `F-C15` `F-H02` `F-H03`\n\n**② Đầy đủ:**\n\n| Lõi | Chu kỳ khuyến nghị | Giá tham khảo |\n|---|---|---|\n| Lõi thô tổng hợp | ~**12 tháng** | 2.750.000 đ |\n| Lõi màng lọc nano | ~**48 tháng** | 7.500.000 đ |\n\nĐây là **chu kỳ khuyến nghị, không phải hạn cứng**. Chất lượng nước từng khu vực ảnh hưởng rất nhiều — nước cứng hoặc nhiều cặn thì lõi hết sớm hơn. Vì thế máy đếm theo cả ngày lẫn lít và tự báo.\n\n> 🔒 **CẢNH BÁO O-02 (chưa đóng):**\n> - **12 / 48 tháng** là con số **GWT chốt**, khớp ngưỡng đếm trong Danh mục hàng hoá (360 ngày / 1.440 ngày).\n> - **HDSD chính hãng ghi 6–12 tháng và 24–36 tháng** — ngắn hơn.\n> - ⛔ **Không nói \"cam kết 4 năm\"**, **không nói \"bảo đảm dùng được 48 tháng\"**. Luôn dùng chữ *\"chu kỳ khuyến nghị\"* + *\"máy tự đếm và báo\"*.\n> - Câu an toàn nhất để trích, nguyên văn HDSD: *\"Chất lượng nước có ảnh hưởng đáng kể… Dữ liệu trên chỉ mang tính tham khảo.\"* (`F-C20`)\n\n---\n\n\n### Q17. Khách mở HDSD ra và hỏi: \"Sao sách ghi 24–36 tháng mà anh nói 48 tháng?\"\n\n> 🔒 **Câu khó nhất về lõi. Đọc kỹ.**\n\n**Hướng trả lời — nói thật, không lách:**\n\n> *\"Hai con số đó nói hai chuyện khác nhau ạ. Hướng dẫn sử dụng đưa ra **khoảng khuyến nghị** dựa trên chất lượng nước trung bình, và bản thân hãng ghi rõ 'dữ liệu chỉ mang tính tham khảo'. Còn con số bên em công bố là **ngưỡng máy đếm** — máy đếm cả theo ngày lẫn theo lượng nước đã lọc, cái nào tới trước thì báo đèn.*\n> *Thực tế thì cứ theo đèn: nháy đỏ là chuẩn bị lõi, đỏ liên tục là thay. Nếu nước nhà anh/chị nhiều cặn hoặc dùng nhiều, đèn sẽ báo sớm hơn mốc đó. Em không dám hứa con số cứng vì chính hãng cũng không hứa.\"*\n\n⛔ **Không được nói:** *\"HDSD ghi sai\"* · *\"sách của Trung Quốc khác\"* · *\"cứ dùng 4 năm thoải mái\"*.\n\n> 🔒 **Rủi ro thật cần biết:** máy chỉ bật đèn đỏ ở **1.440 ngày (48 tháng)**, trong khi hãng khuyến nghị thay ở **24–36 tháng**. Khách chỉ tin đèn sẽ thay **muộn hơn khuyến nghị của hãng**. Đây là mâu thuẫn chưa đóng (O-02) — nếu khách hỏi sâu, **chuyển kỹ thuật**, đừng tự giải thích thêm.\n\n---\n\n\n### Q18. Thay lõi có phải gọi thợ không?\n\n**① Ngắn:** **Tự thay được.** Mở nắp trước, xoay lõi ra, lắp lõi mới, rồi **giữ nút lõi 3 giây** để reset. `F-E18`\n\n**② Đầy đủ:** Quy trình 6 bước, khoảng 5 phút:\n1. Khoá van cấp nước và **rút điện**\n2. Mở nắp trước\n3. **Xoay lõi cũ ngược chiều kim đồng hồ** để tháo\n4. Lắp lõi mới, **xoay thuận chiều kim đồng hồ** đến khi hai ký hiệu khớp\n5. **Giữ nút lõi tương ứng 3 giây** — nghe 1 tiếng bíp, đèn về trạng thái ổn định là xong\n6. Máy hiện **`C2`** → chạm nút nước thường → xả rửa **8 phút** → dùng bình thường `F-E19`\n\nLõi thiết kế **rút ngang** nên không phải kéo máy ra khỏi tủ. `F-C27`\nNếu anh/chị ngại thao tác thì gọi kỹ thuật bên em làm giúp.\n\n> 🔒 Lỗi phổ biến nhất: **quên bước 5 (reset)** → máy vẫn báo đỏ dù đã thay lõi mới.\n\n---\n\n\n### Q19. Ngoài lõi ra còn phải thay gì nữa không?\n\n**① Ngắn:** Có — **ống PE và đầu nối**, hãng khuyến nghị thay **mỗi 24 tháng**, và khoản này **có tính phí**. `F-C26`\n\n**② Đầy đủ:** HDSD ghi các chi tiết bằng nhựa là bộ phận chịu lão hoá, khuyến nghị thay định kỳ mỗi 24 tháng, tính phí theo giá thị trường. Em nói trước để anh/chị tính vào chi phí sử dụng chứ không để tới lúc đó mới báo.\n\n> 🔒 **Bắt buộc nói trước khi bán.** Đây là khoản chi phí bị giấu ở hầu hết các hãng và là nguồn khiếu nại phổ biến.\n\n---\n\n\n### Q20. Chi phí dùng máy trong 5 năm khoảng bao nhiêu?\n\n**① Ngắn:** **Ước tính** khoảng **58–63 triệu** cho 5 năm (gồm cả tiền máy), tương đương **~32–35 nghìn/ngày**. `F-H05`\n\n**② Đầy đủ:** Với gia đình 4 người dùng khoảng 6 lít nước uống/ngày:\n- Tiền máy: 44.950.000 đ\n- Lõi thô: thay 2–4 lần trong 5 năm ≈ 5,5–11 triệu\n- Lõi màng: thay 1 lần ≈ 7,5 triệu\n- **Tổng ≈ 58–63 triệu / 5 năm ≈ 32–35 nghìn/ngày**\n\nSo sánh: một bình nước đóng chai 20 lít khoảng 60–80 nghìn, gia đình 4 người dùng 2–3 bình/tháng, chưa kể nước nóng vẫn phải đun riêng.\n\n> 🔒 Đây là **phép tính nội bộ hạng E**, GWT chưa chốt. **Phải nói rõ chữ \"ước tính\"**, ⛔ không đưa như bảng giá. ⚠️ Chưa chốt 44,95tr đã gồm VAT hay chưa, 8% hay 10% (O-07) — **hỏi phòng kinh doanh trước khi báo giá bằng văn bản**. Ước tính này **chưa gồm** tiền thay ống PE + đầu nối ở mốc 24 tháng.\n\n---\n\n\n## NHÓM 6 — LẮP ĐẶT & VẬN HÀNH\n\n\n### Q21. Lắp đặt mất bao lâu? Cần đục đẽo gì không?\n\n**① Ngắn:** Kỹ thuật bên em lắp. Chỉ cần **khoan 1 lỗ Ø30 mm** trên mặt bàn cho vòi — hoặc tận dụng lỗ vòi có sẵn. `F-B18`\n\n**② Đầy đủ:** Toàn bộ do kỹ thuật viên chuyên nghiệp thực hiện:\n- Lắp **van bi 3 ngã** vào đường nước lạnh sẵn có\n- **Khoan 1 lỗ Ø30 mm** trên mặt bàn/chậu rửa cho vòi (cần mặt phẳng bán kính ~3,8 cm quanh lỗ). Chậu đã có sẵn lỗ vòi phù hợp thì dùng luôn\n- Đặt thân máy trong tủ, đấu ống nước và cắm điện\n- Đấu **đường xả nước cô đặc** ra ống thoát/phễu thoát sàn\n\nSau khi lắp, máy hiện **`C1`** và **tự xả rửa ~16 phút** trước khi dùng được. `F-E20`\n\n---\n\n\n### Q22. Nhà tôi áp lực nước yếu, có dùng được không?\n\n**① Ngắn:** Máy cần áp lực nước vào **từ 0,1 đến 0,4 MPa** (khoảng 1–4 bar). Ngoài khoảng này cần khảo sát thêm. `F-B08`\n\n**② Đầy đủ:** HDSD quy định áp lực nước vào **0,1–0,4 MPa**, và ghi rõ nếu ngoài phạm vi này thì phải liên hệ nhà cung cấp dịch vụ. Nếu nhà anh/chị dùng nước bể ngầm bơm lên, hoặc ở tầng cao mà nước chảy yếu, nên để kỹ thuật bên em **khảo sát trước khi lắp** — có thể cần bơm tăng áp phụ trợ.\nBên trong máy đã có **bơm tăng áp** riêng, nhưng đó là bơm tạo áp cho màng lọc, **không thay thế được áp lực đầu vào**. `F-D07`\n\n> 🔒 ⛔ Brochure cũ ghi *\"0–0,4 MPa\"* là **SAI** (mất ngưỡng dưới — `F-M02`). Tư vấn sai chỗ này dễ dẫn tới máy lắp xong không chạy.\n> 🔒 ⚠️ Áp lực **vượt 0,4 MPa** thì rơi vào điều khoản *\"ngoại lực và áp suất vượt giới hạn\"* → **mất bảo hành** (`F-G04`). Nhà áp cao cũng phải khảo sát.\n\n---\n\n\n### Q23. Máy có kén nguồn nước không? Nước giếng khoan được không?\n\n**① Ngắn:** **Chỉ nước máy đô thị.** Nhiệt độ nước vào 5–38 °C. `F-B14` `F-B15`\n\n**② Đầy đủ:** HDSD ghi rõ nguồn nước áp dụng là **nước máy đô thị**. Nước giếng khoan, nước bể chứa lâu ngày hoặc nước có sắt/phèn cao thì **cần lắp hệ tiền xử lý phía trước**, nếu không lõi sẽ tắc rất nhanh. Nếu nhà anh/chị dùng giếng khoan, bên em nên khảo sát và tư vấn hệ lọc tổng trước, rồi mới lắp USH10 ở khâu uống.\n\n---\n\n\n### Q24. Máy có tốn điện không? Đi vắng có phải rút điện không?\n\n**① Ngắn:** Công suất định mức **2.100 W**, nhưng chỉ ăn điện lúc đun. Đi vắng dài ngày thì **nên khoá nước và rút điện**. `F-B11`\n\n**② Đầy đủ:** Máy dùng điện 220V/50Hz, công suất định mức 2.100 W — con số này là lúc mâm nhiệt hoạt động, không phải chạy liên tục cả ngày. Máy chỉ đun khi lấy nước nóng, và có chế độ tiết kiệm điện tự ngừng giữ ấm khi lâu không dùng.\nKhi đi vắng dài ngày: **khoá van cấp nước và rút điện**. Lúc về, mở lại và **xả nước một lúc trước khi uống**. `SF-15`\n\n---\n\n\n### Q25. Máy có phải nối đất không?\n\n**① Ngắn:** Có. Máy thuộc **Cấp bảo vệ Class I**, **bắt buộc cắm vào ổ cắm có nối đất đúng cách**. `F-B13` `SF-01`\n\n**② Đầy đủ:** HDSD ghi rõ đây là yêu cầu an toàn bắt buộc — không nối đất có thể dẫn đến điện giật, đoản mạch hoặc hoả hoạn. Ổ cắm cũng phải chịu được dòng lớn hơn dòng định mức của máy. Kỹ thuật bên em sẽ kiểm tra ổ cắm khi khảo sát.\n\n---\n\n\n## NHÓM 7 — APP & KẾT NỐI\n\n\n### Q26. Máy kết nối điện thoại được không? Làm gì trên app?\n\n**① Ngắn:** Có. Kết nối Wi-Fi, dùng app **G+ Life** — xem trạng thái máy, tuổi thọ lõi theo %, cảnh báo rò rỉ. `F-F02` `F-F07`\n\n**② Đầy đủ:** Máy dùng công nghệ IoT Wifi-Combo, ghép nối với app **G+ Life**. Trên app xem được:\n- Trạng thái máy và **tuổi thọ từng lõi theo phần trăm**\n- **Cảnh báo rò rỉ nước**\n- Giám sát chất lượng nước\n- Hẹn giờ đun, xả rửa từ xa\n\n**Ghép nối 7 bước, ~3 phút:** bật Bluetooth + kết nối Wi-Fi nhà → quét mã QR trên máy tải app → đăng ký tài khoản → bấm \"Add Device\" → **giữ nút trên máy 3 giây** → nhập mật khẩu Wi-Fi → xong. `F-F03`\n\n**Đèn WiFi trên thân máy:** xanh liên tục = đã kết nối · nháy chậm = chưa kết nối. `F-F04`\n\n---\n\n\n## NHÓM 8 — BẢO HÀNH & HẬU MÃI\n\n\n### Q27. Bảo hành bao lâu?\n\n**① Ngắn:** **12 tháng toàn máy**, riêng **bơm và bo mạch điều khiển 5 năm** theo chính sách bên em. `F-G01` `F-G02`\n\n**② Đầy đủ:**\n\n| Hạng mục | Thời gian |\n|---|---|\n| Toàn máy | **12 tháng** (từ ngày hoá đơn / ngày lắp đặt) |\n| Bơm + bo mạch điều khiển | **5 năm** (chính sách GWT) |\n\n**Không thuộc phạm vi bảo hành:** lõi lọc và vật liệu lọc · **mô-đun/đèn tiệt trùng** · gioăng và chi tiết hao mòn · vỏ trang trí và lớp phủ · **bộ chuyển nguồn (adapter)**. `F-G03`\n\nAnh/chị **giữ lại phiếu bảo hành và hoá đơn gốc** — đây là giấy tờ cần có khi yêu cầu bảo hành. `F-G05`\n\n> 🔒 **QUAN TRỌNG:**\n> - ⚠️ Cam kết **5 năm bơm + bo mạch** là **chính sách riêng của GWT, KHÔNG có trong HDSD hãng** (O-10) → đang xin văn bản nội bộ. Khách đòi bằng chứng → **đừng hứa miệng**, chuyển phòng kinh doanh.\n> - ⚠️ **Phải nói rõ lõi lọc là vật tư tiêu hao, không bảo hành.** Nói mập mờ chỗ này là nguồn khiếu nại phổ biến nhất.\n> - HDSD còn loại trừ: lắp/dùng sai hướng dẫn · tự tháo sửa · **dùng lõi không chính hãng** · **áp suất vượt giới hạn** · thiên tai. (`F-G04`)\n\n---\n\n\n### Q28. \"Máy có chứng nhận gì không? Cho tôi xem giấy tờ.\"\n\n> 🔒 **CÂU NGUY HIỂM NHẤT. Đọc kỹ trước khi trả lời.**\n> - Hồ sơ có **số hiệu nhưng thiếu file PDF**: TÜV Rheinland, VIETCERT, QCVN 6-1:2010/BYT (`F-I09` `F-I12` `F-I13`).\n> - ✅ **Số hiệu TÜV đã chốt: `1111279087`** (`F-I01`). Số `1111297087` trong tài liệu nội bộ là **lỗi chép** — ID đó là của **HP Inc.**, không liên quan.\n> - 🔴 **Nhưng vẫn ⛔ KHÔNG đọc số cho khách, và ⛔ KHÔNG gửi link Certipedia.** Trang tra cứu của ID đúng hiện ghi *\"Currently no valid certificates are attached to this Certipedia ID\"* (`F-I16`, `O-18`). Khách tra ra trang trống thì hỏng nặng hơn là không đưa số.\n> - ⛔ **Không hứa \"em gửi file ngay\"** nếu chưa có trong tay.\n> - Thứ **chắc chắn tra được ngay:** patent màng lọc **US 7138058** trên Google Patents (`F-C11`).\n\n**Hướng trả lời:**\n> *\"Máy có chứng nhận TÜV Rheinland của Đức — bên kiểm định độc lập, họ thực hiện 57 thử nghiệm trên sản phẩm này, kiểm cả vật liệu tiếp xúc nước theo tiêu chuẩn EU và tiêu chuẩn LFGB của Đức. Điểm em thấy đáng chú ý là họ kiểm cả máy đã dùng lâu ngày chứ không chỉ máy mới.*\n> *Công nghệ màng lọc cũng có bằng sáng chế US 7138058 — cái này anh/chị tra ngay được trên Google Patents.*\n> *Còn bộ hồ sơ đầy đủ dạng file, em xin phép chuyển yêu cầu về phòng kỹ thuật để gửi anh/chị bản chính thức — em không muốn gửi tài liệu chưa được duyệt.\"*\n\n> 🔒 Nội dung TÜV **được phép nói** (`F-I05`–`F-I08`): 57 thử nghiệm · chứng nhận \"đặc tính vệ sinh\" · vật liệu đạt 19 chỉ tiêu hoà tan kim loại nặng theo EN 14350 + 12 yêu cầu LFGB · kiểm E. coli, S. aureus, P. aeruginosa theo DIN EN 16889 **trên máy đã dùng lâu** · không phát hiện BPA, chất làm dẻo, melamine, formaldehyde, kim loại nặng.\n> ⛔ **Không được suy ra** *\"an toàn cho mẹ và bé\"* — dù tài liệu marketing cũ có dùng cụm này (**Phần 2** mục 3).\n\n---\n\n\n### Q29. Máy hỏng thì bao lâu có người tới? Có sẵn lõi không?\n\n**① Ngắn:** Bên em có kỹ thuật hỗ trợ. Anh/chị gọi hotline, bên em sắp lịch.\n\n> 🔒 **ĐIỂM YẾU — TRẢ LỜI CẨN THẬN:**\n> - **Kho hiện tồn 0 lõi USH10** (`F-K08`) và **chưa từng bán bộ lõi màng nào** (`F-K06`). ⛔ **KHÔNG hứa \"có sẵn hàng, thay ngay\"**.\n> - Câu an toàn: *\"Lõi này là hàng nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay.\"*\n> - Hứa rồi không có hàng là **pain point số 1** khiến khách VN mất niềm tin với hãng lọc nước. **Thà hẹn chậm mà đúng.**\n> - ✅ **Điểm mạnh có thể nói:** *\"11 máy đã lắp, chưa ghi nhận ca sự cố nào trong khoảng 2 năm.\"* (`F-K03`)\n\n---\n\n\n### Q30. Máy dùng được bao lâu thì phải thay?\n\n**① Ngắn:** HDSD ghi tuổi thọ sản phẩm và linh kiện khoảng **5–10 năm** trong điều kiện vận hành và bảo dưỡng đúng. `F-B17`\n\n**② Đầy đủ:** Con số này là của hãng, kèm điều kiện *\"vận hành và bảo dưỡng đúng cách\"*. Trong đó lõi lọc và các bộ phận tiêu hao như vòng đệm kín là vật tư dùng một lần, phải thay kịp thời. Ống PE và đầu nối khuyến nghị thay mỗi 24 tháng.\n\n> 🔒 ⛔ Không nói gọn thành *\"máy dùng 10 năm\"* — phải kèm cụm điều kiện.\n\n---\n\n\n## NHÓM 9 — CÂU HỎI KHÓ (XỬ LÝ PHẢN ĐỐI)\n\n\n### Q31. \"Máy này đắt quá, sao 45 triệu?\"\n\n**Hướng trả lời:** Không né giá — chuyển sang **chi phí theo ngày** và **gộp chức năng**.\n\n> *\"Em hiểu con số nghe lớn. Nhưng máy này gộp ba thứ: máy lọc nước, ấm đun siêu tốc, và bình thuỷ giữ nhiệt — mà không chiếm chỗ nào trên mặt bàn. Tính ra 5 năm, cả tiền máy lẫn tiền lõi, khoảng 32–35 nghìn một ngày. Anh/chị so với tiền nước bình đóng chai hàng tháng cộng tiền điện đun nước lại thì khoảng cách không xa như con số ban đầu.\"*\n\n> 🔒 Thực tế máy đang bán ở mức **60–85% giá niêm yết** (`F-H06`), **chưa từng bán ở giá niêm yết**. Nhưng **chưa có bảng chiết khấu chính thức** (O-08) → ⛔ **sale không tự ra giá**, phải xin duyệt. **Đừng vội hạ giá trong câu đầu tiên**; xử lý bằng giá trị trước.\n\n---\n\n\n### Q32. \"Nano có lọc sạch bằng RO không?\"\n\n**Hướng trả lời:** Không so hơn–kém, mà so **mục tiêu khác nhau**.\n\n> *\"Hai công nghệ nhắm hai mục tiêu khác nhau chứ không phải cái nào hơn. RO chặn gần như mọi thứ nên nước ra rất tinh khiết — nhưng cũng mất luôn khoáng, và thải nhiều nước hơn. Màng nano chặn được kim loại nặng, vi khuẩn, chất hữu cơ — nhưng cho khoáng tự nhiên đi qua. Nếu anh/chị muốn nước sạch mà vẫn còn vị nước tự nhiên thì nano là hướng đó.\"*\n\n---\n\n\n### Q33. \"So với Karofi / Kangaroo / AO Smith thì sao?\"\n\n**Hướng trả lời:** Không nói xấu đối thủ. Nêu **3 điểm khác biệt cấu trúc**, để khách tự so.\n\n> *\"Em không tiện so sánh trực tiếp với hãng khác. Em nói ba điểm về máy bên em, anh/chị đối chiếu là rõ nhất:*\n> 1. *Máy dùng **màng lọc nano giữ khoáng**, không phải RO — nước ra không bị nhạt.*\n> 2. *Máy **âm tủ hoàn toàn**, mặt bàn chỉ có vòi — rộng 17,9 cm, lọt được gầm chậu chung cư.*\n> 3. *Mô-đun tiệt trùng đặt **trên đường nước ra sát vòi**, không phải trong bình chứa — vì tia UV không có tác dụng tồn lưu.\"*\n\n> 🔒 ⛔ Tuyệt đối không dùng \"tốt hơn\", \"hơn hẳn\", \"duy nhất trên thị trường\".\n\n---\n\n\n### Q34. \"Tôi quên thay lõi thì sao? Có hại không?\"\n\n**Hướng trả lời:** Trả lời thẳng — đây là câu tạo niềm tin.\n\n> *\"Có ảnh hưởng thật, nên máy mới có đèn báo hai cấp: nháy đỏ là để anh/chị kịp đặt lõi, đỏ liên tục là phải thay. Máy còn đếm theo cả lượng nước đã lọc chứ không chỉ đếm ngày, nên nhà dùng nhiều sẽ được báo sớm hơn. Hướng dẫn sử dụng cũng ghi rõ: dùng lõi hết hạn làm giảm hiệu suất lọc và ảnh hưởng chất lượng nước.\"*\n\n> 🔒 Hiện `filter_replacement` **0 dòng** — chưa có nhật ký thay lõi thật. ⛔ Nếu hứa *\"bên em chủ động gọi nhắc\"* thì **phải có quy trình thật**, nếu không sẽ thành lời hứa suông.\n\n---\n\n\n### Q35. \"Sao chỉ có 2 lõi? Máy khác 7–9 lõi cơ mà.\"\n\n**Hướng trả lời:** Đổi khung từ \"số lượng\" sang \"chức năng\".\n\n> *\"Số lõi không nói lên mức lọc, mà cấu trúc lõi mới nói. Lõi thứ nhất bên em là lõi tổng hợp — đã gộp sẵn màng PP, sợi carbon và than hoạt tính trong một thân, tức là ba lớp lọc trong một lõi. Lõi thứ hai là màng lọc nano. Cộng lại là bốn bước lọc trong hai lõi.*\n> *Cái lợi thực tế là anh/chị chỉ phải nhớ hai mốc thay lõi thay vì bảy, và mỗi lần thay ít tốn tiền lẫn tốn công hơn.\"*\n\n---\n\n\n### Q36. \"Máy Trung Quốc gắn mác GE à?\"\n\n**Hướng trả lời:** Nói thẳng, không vòng vo.\n\n> *\"GE là nhãn hiệu của General Electric, sản phẩm được sản xuất theo giấy phép — cái này ghi ngay trên nhãn máy chứ không giấu. Điều em thấy đáng nói hơn là sản phẩm đã qua kiểm định của TÜV Rheinland — đây là tổ chức kiểm định độc lập của Đức, không liên quan tới nhà sản xuất.\"* `F-A09`\n\n> 🔒 ⚠️ Hai bản HDSD ghi 2 nhà sản xuất khác nhau (O-01). ⛔ **Không nói chắc một cái tên cụ thể** cho tới khi GWT xác nhận.\n\n---\n\n\n### Q37. \"Nhà tôi có bé, nước này pha sữa được không?\"\n\n> 🔒 **CÂU PHẢI TRẢ LỜI ĐÚNG TỪNG CHỮ. Xem **Phần 2** mục 3.**\n\n> *\"Trên vòi có nút 45 độ, hãng thiết kế cho tình huống pha sữa và mình chọn được nhiệt độ chính xác thay vì đun rồi chờ nguội. Còn việc pha sữa cho bé thế nào cho đúng thì anh/chị theo hướng dẫn của hãng sữa và bác sĩ ạ — cái đó em không tư vấn được.*\n> *Về mặt an toàn khi dùng, máy có khoá trẻ em: phải chạm nút khoá trước rồi mới chạm nút nhiệt độ, nên bé chạm bừa một nút sẽ không ra nước nóng.\"*\n\n⛔ **Cấm nói:** \"45 độ là nhiệt độ chuẩn pha sữa\" · \"nước này tốt cho bé\" · \"an toàn cho trẻ sơ sinh\" · \"đạt chuẩn mẹ và bé\".\n\n---\n\n\n### Q38. \"Máy này có làm nước kiềm / ion kiềm không?\"\n\n**① Ngắn:** Không. USH10 là máy lọc nano có nước nóng, **không phải máy điện giải ion kiềm**.\n\n**② Đầy đủ:** Hai loại máy khác nhau hoàn toàn về mục tiêu. Máy điện giải tạo nước kiềm bằng điện phân. USH10 lọc bằng màng nano và giữ lại khoáng tự nhiên vốn có trong nước, không tạo thêm gì cả.\n\n> 🔒 ⛔ Không bình luận về công dụng của nước kiềm dưới bất kỳ hình thức nào (**Phần 2** mục 3.4).\n\n---\n\n\n### Q39. \"Máy có đo TDS không? Sao số TDS lệch với máy đo cầm tay của tôi?\"\n\n**① Ngắn:** Máy có cảm biến TDS nội bộ. Máy đo cầm tay và cảm biến máy có sai số khác nhau nên lệch vài đơn vị là bình thường.\n\n**② Đầy đủ:** Máy có cảm biến TDS trên đường nước tinh khiết để theo dõi chất lượng lọc. Số hiển thị có dải sai số cho phép, và máy đo cầm tay ngoài thị trường cũng có sai số riêng. Nếu chênh lệch nhiều bất thường, anh/chị báo bên em cử kỹ thuật kiểm tra.\n\n> 🔒 Sai số TDS theo quy cách (`F-D14`, không đọc số cho khách): 0–10 → ±2 · 10–50 → ±5 · 50–100 → ±10 · 100–200 → ±20 · 200–300 → ±30.\n> 🔒 ⛔ **Không dùng chỉ số TDS thấp làm bằng chứng \"nước sạch\"** — TDS đo tổng chất rắn hoà tan, bao gồm cả khoáng có lợi. Máy nano **cố ý giữ khoáng** nên TDS sẽ **cao hơn** máy RO. Nếu khách so TDS với máy RO, giải thích chỗ này.\n\n---\n\n\n### Q40. \"Nhà tôi ở tầng cao / vùng núi, nước 95 độ có ra đúng 95 không?\"\n\n**① Ngắn:** Máy **tự học điểm sôi tại khu vực lắp đặt** và điều chỉnh theo. Ở nơi cao so với mực nước biển, nhiệt độ tối đa sẽ thấp hơn — đó là quy luật vật lý, không phải lỗi máy. `F-E23`\n\n**② Đầy đủ:** Nước sôi ở nhiệt độ thấp hơn khi lên cao — ở đâu cũng vậy, không riêng máy này. Máy có cơ chế tự nhận biết điểm sôi tại nơi lắp đặt và tự điều chỉnh mức nhiệt tối đa cho phù hợp, để không đun quá mức gây lãng phí điện.\n\n---\n\n\n## NHÓM 10 — TRA NHANH CHO CSKH\n\n\n## Mã hiển thị trên vòi\n\n| Mã | Nghĩa | Hướng dẫn khách |\n|---|---|---|\n| `C1` | Xả rửa lần đầu | 🟢 **Bình thường** — chạm nút lấy nước, chờ ~16 phút |\n| `C2` | Xả rửa sau thay lõi | 🟢 **Bình thường** — chờ 8 phút |\n| `SA` | Đã reset mô-đun tiệt trùng | 🟢 Bình thường |\n| `EL` | Đang bơm bù nước vào bình đun | 🟢 **Bình thường** — chờ một lát |\n| `E1` | Vòi mất tín hiệu | Tắt nguồn, kiểm tra cáp vòi, bật lại |\n| `E2` | Lỗi bo mạch hiển thị | Tắt nguồn, bật lại |\n| `E3` | Bảo vệ chống tràn | Chạm \"Refresh\" xả bình nóng, khởi động lại |\n| `E4` | Bất thường tạo nước | **Kiểm tra van cấp nước đã mở chưa** |\n| `E5` | Lỗi gia nhiệt | Tắt/bật lại → còn lỗi thì báo kỹ thuật |\n| `E7` | **Rò rỉ nước** | 🔴 **Tắt điện + khoá nước NGAY**, báo kỹ thuật |\n| `E8` | Lỗi đầu dò bình đun | Báo kỹ thuật |\n| `E9` | Lỗi cảm biến nhiệt | Báo kỹ thuật |\n\n\n## Sự cố — hỏi khách trước khi cử kỹ thuật\n\n| Khách báo | Hỏi kiểm tra trước |\n|---|---|\n| Máy không chạy | Phích cắm đã cắm? Aptomat đã bật? Đèn thân máy có sáng gì? |\n| Không ra nước thường | Van bi 3 ngã đã mở? Ống có gập? Màn hình hiện mã gì? |\n| Nước chảy yếu | Van đã mở **hết**? Đèn lõi màu gì? Yếu đột ngột hay giảm dần? |\n| Không ra nước nóng | Đã chạm LOCK chưa? Thử lấy lại 3–4 lần (bơm có thể hút khí). Có hiện `EL` không? |\n| **Máy tự chạy / tự xả nước** | **Có hiện `C1` không? MẶT VÒI CÓ ĐỌNG NƯỚC KHÔNG?** → lau khô + xả 16 phút, **không cần cử kỹ thuật** |\n| Vòi tự chảy không bấm | Chảy từ **miệng vòi** hay **lỗ thông hơi**? → nghi ống thông hơi bí áp |\n| Máy dừng nhưng vẫn chảy nước thải | → Báo kỹ thuật (van điện từ) |\n| Rò rỉ nước | 🔴 **Tắt điện + khoá van ngay** → báo kỹ thuật |\n| Nước có vị lạ | Đèn lõi màu gì? Máy lắp bao lâu rồi? |\n| Nước có bột đen / bọt khí lúc mới lắp | 🟢 **Bình thường** — bột than từ lõi mới, xả tới khi nước trong |\n\n\n## Thông số tra nhanh\n\n| Chỉ tiêu | Giá trị |\n|---|---|\n| Loại máy | **Âm tủ bếp (undersink)**, lọc nano, có nước nóng |\n| Kích thước | **467 × 179 × 477 mm** (D×R×C) |\n| Trọng lượng | ~14 kg |\n| Lưu lượng nước thường | **1,8 L/phút** |\n| Lưu lượng nước nóng | **2,1 L/phút** |\n| Công suất làm nóng | **20 L/giờ** |\n| Chế độ nước | Nhiệt độ phòng · **45 ℃** · **85 ℃** · **95 ℃** |\n| Điện | **220V ~ 50Hz**, **2.100 W**, Cấp bảo vệ **Class I** (phải nối đất) |\n| Áp lực nước vào | **0,1 – 0,4 MPa** |\n| Nhiệt độ nước vào | **5 – 38 ℃** |\n| Nhiệt độ môi trường | **4 – 40 ℃** |\n| Nguồn nước | **Chỉ nước máy đô thị** |\n| Đối tượng dùng | **Chỉ hộ gia đình** |\n| Số lõi | **2 lõi — 4 bước lọc** |\n| Chu kỳ lõi (khuyến nghị) | Lõi thô ~12 tháng · Lõi màng ~48 tháng |\n| Ống PE & đầu nối | Thay mỗi **24 tháng**, có tính phí |\n| Lỗ khoan vòi | **Ø30 mm** |\n| Màu vòi | Đen / Bạc |\n| Tuổi thọ máy | **5–10 năm** (điều kiện vận hành/bảo dưỡng đúng) |\n| Bảo hành | 12 tháng toàn máy · 5 năm bơm + bo mạch (chính sách GWT) |\n| Không bảo hành | Lõi · mô-đun tiệt trùng · gioăng · vỏ & lớp phủ · adapter |\n| Giá niêm yết | **44.950.000 đ** ⚠️ *(chưa chốt đã gồm VAT chưa — xác nhận trước khi báo giá)* |\n\n---\n\n\n## Phụ lục — những việc file này đang chờ GWT chốt\n\n| # | Nội dung | Ảnh hưởng câu nào |\n|---|---|---|\n| 1 | Máy bán tại VN đi kèm bản HDSD nào (O-01) | **Q11** — có được nói tiệt trùng không |\n| 2 | Chu kỳ lõi 12/48 hay 6–12/24–36 tháng (O-02) | **Q16, Q17** |\n| 3 | Giá 44,95tr đã gồm VAT chưa? + bảng chiết khấu (O-07, O-08) | **Q20, Q31**, bảng tra nhanh |\n| 4 | ~~Số hiệu TÜV đúng là số nào (O-04)~~ ✅ **ĐÃ CHỐT 28/08: `1111279087`** — thay bằng việc mới: **hồ sơ TÜV không hiện trên Certipedia** (O-18) | **Q28** |\n| 5 | File PDF: TÜV · QCVN 6-1:2010 · SGS · VIETCERT | **Q13, Q28** |\n| 6 | Văn bản chính sách bảo hành 5 năm bơm + bo (O-10) | **Q27** |\n| 7 | Chế độ tiết kiệm điện 2 giờ hay 3 giờ (O-05) | **Q10** |\n\n---"
      },
      {
        "so": 7,
        "slug": "nguyen-lieu-mkt",
        "ten": "Nguyên liệu marketing đã duyệt nguồn",
        "nhom": "truyen-thong",
        "coNoiDung": true,
        "noiDung": "# PHẦN 7 — NGUYÊN LIỆU MARKETING ĐÃ DUYỆT NGUỒN\n\n> **PKB v1.2 · 28/08/2026** · Dùng cho: kịch bản video · landing page · caption social · quảng cáo · brief cho KOL\n> ⚠️ **Bắt buộc đọc **Phần 2** trước.** File này chỉ chứa nguyên liệu **đã qua cổng claim** — nhưng người viết vẫn phải chạy checklist mục 6 của **Phần 2** trước khi xuất bản.\n\n---\n\n\n## 1. NGUYÊN TẮC BIÊN TẬP CHO USH10\n\n| # | Nguyên tắc | Vì sao |\n|---|---|---|\n| **1** | **Kể cấu trúc, đừng kể con số tuyệt đối.** Nói *\"mô-đun tiệt trùng đặt ở đâu\"* mạnh hơn nói *\"diệt bao nhiêu phần trăm\"* | Con số cần chứng nhận (đang thiếu). Cấu trúc chỉ cần HDSD (đang có) |\n| **2** | **Một thông điệp — một con số.** Không dồn nhiều số vào một khung hình | Số của **lõi màng** (8.600/12.240) đặt cạnh số của **lõi thô** (6.630/10.200) sẽ bị khách bắt lỗi — khác cấp bộ phận |\n| **3** | **Nói cả nhược điểm nhỏ.** Ví dụ: *\"hãng vẫn khuyên xả nước tồn mỗi sáng\"* | Khách VN đã biết nghi ngờ quảng cáo lọc nước. Tự nêu điểm yếu nhỏ làm tăng độ tin của phần còn lại |\n| **4** | **Không superlative, kể cả trong thoại phụ và caption** | Luật quảng cáo VN + rủi ro bị đối thủ báo cáo |\n| **5** | **Không chạm y khoa dù chỉ một chữ** | Xem **Phần 2** mục 3 |\n| **6** | **Mỗi con số lên hình phải có mã `F-xxx`** ghi trong file kịch bản | Truy vết được khi bị hỏi |\n\n---\n\n\n## 2. SÁU GÓC KỂ CHUYỆN CÓ SẴN DỮ LIỆU\n\nXếp theo **độ an toàn pháp lý** (cao xuống thấp):\n\n| # | Góc | Nguyên liệu sẵn có | Cần chứng nhận? |\n|---|---|---|---|\n| **G1** | **\"UV đặt ở đâu quan trọng hơn có UV không\"** | HDSD chính hãng mô tả mô-đun lắp **nối tiếp trên đường nước tinh khiết → vòi**, đầu ra nối đoạn ống **gần vòi nhất** (`F-D05`). Cơ chế UV-C không có tác dụng tồn lưu là kiến thức phổ thông | ❌ **Không** — mạnh nhất hiện nay |\n| **G2** | **\"Rộng 17 phân\"** | **179 mm** (`F-B02`) — con số bán hàng thật cho chung cư, nơi gầm chậu đã bị xi phông chiếm chỗ | ❌ Không |\n| **G3** | **\"Lõi đo bằng LÍT, không chỉ đo bằng THÁNG\"** | Máy đếm **cả ngày lẫn lượng nước đã lọc**, cái nào tới trước tính cái đó (`F-C18`). Đi ngược lợi ích người bán nên rất đáng tin | ✅ **Được, kể cả con số lít** (O-03 đóng 28/08) — một thông điệp một con số, ⛔ không trộn số lõi màng với lõi thô |\n| **G4** | **\"Máy tự lo phần bảo dưỡng\"** | Tự xả rửa màng theo lịch (`F-E09`) + chức năng không đọng nước (`F-E11`) + nhắc thay lõi ở **3 nơi** (`F-E14`) | ❌ Không |\n| **G5** | **\"Kiểm cả máy đã dùng lâu, không chỉ máy mới\"** | TÜV kiểm E. coli, S. aureus, P. aeruginosa **bên trong máy sau thời gian dùng dài** theo DIN EN 16889 (`F-I07`) — góc này **chưa ai khai thác** | ⚠️ Nói được nội dung, ⛔ **không đọc số hiệu, không gửi link Certipedia** — `O-18` |\n| **G6** | **\"Nước cho quán cà phê specialty\"** | Case thật PIN Cafe (33 Hàng Hòm), The Ghé Coffee (Q1) — đã đo nước đầu ra (`F-K12`). Ba mức nhiệt 45/85/95 khớp pha chế | 🔴 **CẨN TRỌNG** — HDSD ghi máy **chỉ dành cho gia đình** (`F-C21`). ⛔ Không làm nội dung mời quán mua nếu chưa có thoả thuận riêng từ GWT |\n\n> 🔴 **Lưu ý về G6:** đây là ngách có dữ liệu tốt nhưng **mâu thuẫn với chính HDSD**. Trước khi làm nội dung F&B, GWT phải quyết định: (a) ra chính sách riêng cho F&B với chu kỳ lõi rút ngắn, hay (b) không làm ngách này. **Không được làm nội dung trước rồi xử lý sau.**\n\n---\n\n\n## 3. KHỐI NỘI DUNG ĐÃ DUYỆT — DÙNG NGUYÊN VĂN ĐƯỢC\n\n### 3.1 Khối \"âm tủ\"\n\n> Máy nằm gọn dưới bồn rửa. Mặt bàn chỉ còn một chiếc vòi.\n> **467 × 179 × 477 mm** — rộng **17,9 cm**, lọt được gầm chậu chung cư nơi ống xi phông và giỏ rác đã chiếm chỗ.\n> Lắp chỉ cần **một lỗ khoan Ø30 mm** cho vòi — hoặc dùng luôn lỗ vòi có sẵn trên chậu.\n\n`F-B01` `F-B02` `F-B18`\n\n### 3.2 Khối \"vị trí mô-đun tiệt trùng\" — **khối mạnh nhất**\n\n> Tia UV không có tác dụng tồn lưu. Nó chỉ xử lý dòng nước đang đi qua — không \"để dành\" được cho đoạn ống phía sau.\n> Nên câu hỏi đúng không phải *máy có tiệt trùng không*, mà là *đặt ở đâu*.\n> Trên USH10, hướng dẫn lắp đặt của hãng ghi rõ: cắt ống nước tinh khiết dẫn lên vòi, lắp mô-đun tiệt trùng **nối tiếp vào đó**, đầu ra nối **đoạn ống gần vòi nhất**.\n> Nghĩa là nước được xử lý ở **đoạn cuối cùng trước khi ra khỏi vòi**.\n\n`F-D05` — ⛔ **Không thêm bất kỳ con số phần trăm nào vào khối này.**\n\n### 3.3 Khối \"giữ khoáng\"\n\n> Máy RO chặn gần như mọi thứ — nước ra rất tinh khiết, nhưng khoáng tự nhiên cũng đi luôn.\n> USH10 dùng màng lọc nano: vẫn chặn kim loại nặng như chì, asen, cadimi, chặn vi khuẩn, chặn chất hữu cơ — nhưng **cho khoáng tự nhiên đi qua**.\n> Nước uống vào vẫn còn vị nước.\n\n`F-C06` `F-C08` — ⛔ **Dừng ở đây. Không nói khoáng có tác dụng gì.**\n\n### 3.4 Khối \"máy tự lo bảo dưỡng\"\n\n> Đóng vòi là máy tự dừng.\n> Bề mặt màng lọc **tự làm sạch và xả rửa theo lịch** — không ai phải mở tủ ra làm gì.\n> Lâu không dùng, phần nước tinh khiết còn tồn trong lõi **tự quay ngược về để lọc lại**.\n> Khi lõi sắp hết hạn, máy báo ở **ba nơi**: đèn trên vòi, đèn trên thân máy, và thông báo trên điện thoại.\n\n`F-E09` `F-E11` `F-E14`\n\n### 3.5 Khối \"đếm bằng lít\"\n\n> Lõi lọc không hết hạn theo tờ lịch. Nó hết theo lượng nước đã đi qua.\n> Máy đếm **cả số ngày lẫn lượng nước đã lọc** — cái nào tới trước thì báo cái đó.\n> Nhà dùng nhiều, đèn báo sớm. Nhà dùng ít, đèn báo muộn hơn.\n> Hướng dẫn sử dụng của hãng cũng ghi thẳng: *\"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ lõi lọc… Dữ liệu trên chỉ mang tính tham khảo.\"*\n\n`F-C18` `F-C20` — ✅ **Đọc được con số lít** (O-03 đã đóng 28/08). Luật: **một thông điệp — một con số**; nếu nêu cặp thì nói đủ *\"vào 12.240 L → ra 8.600 L\"* của **cùng lõi màng** (`F-C17`). ⛔ Không trộn với 6.630/10.200 của lõi thô.\n\n### 3.6 Khối \"khoá trẻ em\"\n\n> Nước ra tới **95 độ**. Nên mỗi lần lấy nước nóng đều là hai bước: chạm khoá, rồi mới chạm nhiệt độ.\n> Khoá **tự bật lại** sau vài giây — không phải nhớ khoá lại.\n> Riêng nước nhiệt độ phòng thì một chạm là ra, để bé vẫn tự lấy nước uống được.\n\n`F-E04` `F-E07` `F-E08` — ⛔ **Không kết luận \"an toàn tuyệt đối cho trẻ\".**\n\n### 3.7 Khối \"3 mức nhiệt cho 3 việc\"\n\n> **45 độ** — hãng đặt cho tình huống pha sữa.\n> **85 độ** — pha trà.\n> **95 độ** — cà phê, mì, nước sôi.\n> Không phải đun rồi ngồi chờ nguội. Không phải ước lượng bằng tay.\n\n`F-E01` — ⛔ **Không nói \"nhiệt độ chuẩn để pha sữa cho bé\"** (đó là claim y khoa).\n\n### 3.8 Khối \"TÜV kiểm máy cũ\"\n\n> Phòng thí nghiệm TÜV Rheinland của Đức mô phỏng các kịch bản dùng nước hằng ngày và thử nghiệm **trên sản phẩm sau thời gian sử dụng dài**, không chỉ trên máy mới.\n> Họ kiểm vật liệu tiếp xúc nước — panel, ống nước, bể chứa, thân bơm — theo **19 chỉ tiêu hoà tan kim loại nặng của tiêu chuẩn EU** và **12 yêu cầu vật liệu tiếp xúc thực phẩm LFGB của Đức**.\n> Và kiểm vi sinh bên trong máy theo tiêu chuẩn **DIN EN 16889**.\n\n`F-I05` `F-I06` `F-I07` — ⛔ **Không đọc số hiệu, không gửi link tra cứu** (`O-18`). ⛔ **Không suy ra \"an toàn cho mẹ và bé\"**.\n\n---\n\n\n## 4. KHUNG LANDING PAGE\n\n| Khối | Nội dung | Mã |\n|---|---|---|\n| **Hero** | Ảnh mặt bàn bếp sạch, chỉ có vòi. Headline: *\"Máy nằm trong tủ. Trên bàn chỉ còn một chiếc vòi.\"* | `F-A06` |\n| **Vấn đề** | Bình đun + bình lọc + bình đóng chai đang chiếm bao nhiêu chỗ trên mặt bàn của bạn | — |\n| **Khối 1 — Kích thước** | Khối 3.1 + hình đo gầm chậu có xi phông | `F-B01` `F-B02` |\n| **Khối 2 — 4 chế độ nước** | Khối 3.7 + hình vòi với 4 nút | `F-E01` |\n| **Khối 3 — Vị trí tiệt trùng** | Khối 3.2 + **sơ đồ đường nước vẽ lại từ HDSD** (nhấn vị trí mô-đun sát vòi) | `F-D05` |\n| **Khối 4 — Giữ khoáng** | Khối 3.3 + bảng so sánh nano / RO / UF theo deck NSX | `F-C08` `F-C09` |\n| **Khối 5 — Tự bảo dưỡng** | Khối 3.4 | `F-E09` `F-E11` |\n| **Khối 6 — Đếm bằng lít** | Khối 3.5 | `F-C18` |\n| **Khối 7 — An toàn trẻ em** | Khối 3.6 | `F-E04` |\n| **Khối 8 — Kiểm định** | Khối 3.8 + patent **US 7138058** (link Google Patents cho khách tự tra) | `F-I07` `F-C11` |\n| **Thông số** | Bảng tra nhanh (**Phần 6** Phần 10) — ⛔ bỏ dòng giá nếu chưa chốt VAT | — |\n| **Điều kiện lắp** | Nước máy đô thị · áp lực 0,1–0,4 MPa · lỗ Ø30 mm · **chỉ dùng gia đình** | `F-B14` `F-B08` `F-C21` |\n| **Bảo hành** | 12 tháng toàn máy + danh sách loại trừ (**ghi rõ lõi không bảo hành**) | `F-G01` `F-G03` |\n| **CTA** | Đăng ký khảo sát gầm tủ miễn phí | — |\n\n> 🔴 **Điều kiện lắp và danh sách loại trừ bảo hành PHẢI có trên landing page.** Giấu hai khối này là nguồn khiếu nại lớn nhất và làm hỏng cả phần còn lại.\n\n---\n\n\n## 5. KHUNG VIDEO (5 beat, ~3 phút)\n\n| Beat | Nội dung | Hình | Mã |\n|---|---|---|---|\n| **1. Mở** | Mặt bàn bếp lộn xộn: bình đun, bình lọc, bình 20 lít. Rồi cắt sang mặt bàn chỉ có một chiếc vòi | Đối lập trước/sau | `F-A06` |\n| **2. Kích thước** | Mở tủ, đo gầm chậu có xi phông. Đặt thước: **17,9 cm** | Cận thước đo | `F-B02` |\n| **3. Bốn nút** | Chạm LOCK → chạm 45 → rót thẳng vào bình sữa. Chạm 85 → rót vào ấm trà. Chạm 95 → rót vào phin | Quay thời gian thực, **không tua nhanh** | `F-E01` `F-E04` |\n| **4. Vị trí tiệt trùng** | Đồ hoạ đường nước từ máy lên vòi, highlight mô-đun **sát vòi**. Thoại: khối 3.2 | Đồ hoạ vẽ lại từ sơ đồ HDSD | `F-D05` |\n| **5. Đóng** | Đèn lõi trên vòi chuyển từ trắng sang nháy đỏ. Thoại: khối 3.5 | Cận đèn vòi | `F-C18` |\n\n**5 short cắt ra:**\n1. *\"17 phân\"* — chỉ beat 2\n2. *\"Hai bước mới ra nước 95 độ\"* — beat 3, góc an toàn trẻ em\n3. *\"Đèn UV đặt ở đâu\"* — beat 4\n4. *\"Lõi hết hạn theo lít chứ không theo lịch\"* — beat 5\n5. *\"Sáng nào cũng xả nước tồn\"* — mẹo dùng, khối tăng độ tin (`SF-30`)\n\n> ⛔ **Beat \"75 độ pha trà xanh\" trong kịch bản cũ phải bị xoá.** Máy không có mức 75 °C (`F-E02`). Chuyển sang **85 °C**.\n\n---\n\n\n## 6. BRIEF CHO KOL / REVIEWER\n\n**Được nói:**\n- Kích thước, âm tủ, 4 chế độ nước, khoá trẻ em 2 bước\n- Vị trí mô-đun tiệt trùng (khối 3.2)\n- Giữ khoáng, không phải RO (khối 3.3, dừng đúng chỗ)\n- Máy tự xả rửa, chức năng không đọng nước\n- Đèn nhắc lõi 2 cấp, báo ở 3 nơi\n- Tự thay lõi được, rút ngang\n- App G+ Life\n- Vòi xoay 120°, IPX4\n\n**Không được nói (gửi kèm brief, in đậm):**\n- ⛔ Bất kỳ % diệt khuẩn nào\n- ⛔ \"Tốt nhất / duy nhất / số 1 / hơn hẳn\"\n- ⛔ Tên mã lõi\n- ⛔ Bất kỳ công dụng sức khoẻ nào của nước hay khoáng\n- ⛔ \"Tốt cho bé / mẹ bầu / an toàn cho trẻ sơ sinh\"\n- ⛔ Mức nhiệt 75 độ\n- ⛔ \"Nước nóng ra sau 2,8 giây\"\n- ⛔ Con số tỷ lệ thu hồi nước\n- ⛔ Số hiệu chứng nhận\n- ⛔ So sánh trực tiếp với thương hiệu khác\n\n> **Ràng buộc hợp đồng đề xuất:** kịch bản KOL phải được GWT duyệt trước khi quay, và bản dựng phải được duyệt trước khi đăng. Lý do: một câu sai của KOL lan nhanh hơn mọi tài liệu đính chính.\n\n---\n\n\n## 7. TỪ ĐIỂN THAY THẾ NHANH\n\n| Đừng viết | Viết là |\n|---|---|\n| \"Diệt khuẩn 99,999%\" | \"Mô-đun tiệt trùng đặt trên đường nước ra vòi\" |\n| \"Công nghệ độc quyền\" | \"Công nghệ màng lọc nano có bằng sáng chế US 7138058\" |\n| \"Tỷ lệ thu hồi cao nhất\" | *(bỏ hẳn)* |\n| \"Lõi bền 4 năm\" | \"Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo\" |\n| \"Nước tinh khiết 100%\" | \"Nước lọc uống trực tiếp tại vòi\" |\n| \"Bổ sung khoáng cho cơ thể\" | \"Giữ lại khoáng tự nhiên có trong nước\" |\n| \"Nhiệt độ chuẩn pha sữa\" | \"Nút 45 độ, hãng đặt cho tình huống pha sữa\" |\n| \"An toàn cho mẹ và bé\" | \"Vật liệu tiếp xúc nước đạt 19 chỉ tiêu hoà tan kim loại nặng theo tiêu chuẩn EU\" |\n| \"Nước nóng ra sau 2,8 giây\" | \"Rót 100 ml nước nóng khoảng 2,8 giây\" |\n| \"Máy để bàn\" | \"Máy âm tủ bếp\" |\n| \"Lọc sạch mọi tạp chất\" | \"Giảm kim loại nặng, vi khuẩn và chất hữu cơ\" |\n| \"Bảo hành trọn đời lõi\" | \"Lõi lọc là vật tư tiêu hao, không thuộc phạm vi bảo hành\" |\n\n---\n\n\n## 8. TÌNH TRẠNG TÀI SẢN MARKETING (🔵 nội bộ)\n\n| Tài sản | Trạng thái | Việc cần làm |\n|---|---|---|\n| `video_ads` USH10 | **2 video, cả 2 hỏng link, 0 view** (1 link nhầm sang CTD50, 1 link là thư mục Drive) | Sửa link — so sánh: Lọc tổng có 14 video |\n| Kịch bản chuyên gia | `POU-USH10-chuyengia-v1.md`, `-v2-bang-phan-canh.md` — **chờ duyệt** | ⛔ Phải sửa beat 75 °C trước khi duyệt |\n| Tập series | **TẬP 20** trong `POU-KHOI4-tap17-23-v1.md` | Rà theo **Phần 2** trước khi quay |\n| Caption ảnh | `bytone_ALLSTYLES_ush10-blackfaucet_facebook.md` (43 style) | Rà theo mục 7 |\n| Chatbot | 1 doc, 8 chunk — 🔴 **đang vi phạm rule claim** (O-16) | **Gỡ ngay**: \"99,999%\", \"cao nhất\", \"độc quyền\", công dụng y tế từng khoáng |\n| Fact-sheet | `POU-may-loc-uong-factsheet-v1.md` | Đối chiếu lại với **Phần 1** |\n\n> 🔴 **Nghịch lý cần giải quyết:** KOL và giới thiệu mang về **8/12 máy đã bán** (`F-K10`), nhưng tài sản marketing USH10 gần như trống. Đầu tư đang lệch khỏi kênh đã chứng minh hiệu quả.\n\n---"
      },
      {
        "so": 8,
        "slug": "doi-chieu-nguon",
        "ten": "Ma trận nguồn & sổ mâu thuẫn",
        "nhom": "quan-ly",
        "coNoiDung": true,
        "noiDung": "# PHẦN 8 — MA TRẬN ĐỐI CHIẾU NGUỒN & SỔ MÂU THUẪN\n\n> **PKB v1.2 · 28/08/2026** · Đọc kèm **Phần 0**\n> **Cách đọc:** cột = nguồn tài liệu · dòng = dữ kiện bị đá nhau · ô = giá trị nguồn đó ghi.\n> `—` = nguồn đó **không đề cập**. ✅ = giá trị được chốt dùng. ⚠️ = lệch. ⛔ = đã xác định sai.\n\n---\n\n\n## BẢNG CỘT NGUỒN\n\n| Mã cột | Nguồn đầy đủ | Hạng |\n|---|---|---|\n| **S1** | HDSD chính hãng **bản quốc tế Ver.26.08.14** (`USH10 Manual.pdf` + bản dịch VI) | **A** |\n| **S2** | HDSD chính hãng **bản Trung Quốc** (trích qua hồ sơ nội bộ 18/08) | A− |\n| **S3** | Deck giới thiệu dòng sản phẩm NSX (`极煦系列净热一体机产品介绍.pptx`) | B |\n| **S4** | Deck giải pháp 极沁Max (`Product Introdution USH10 + SPK25`) | B |\n| **S5** | Tài liệu mô tả chứng nhận TÜV (`Thông tin chi tiết TUV.pdf`) | B |\n| **S6** | Quy cách điều khiển điện **V1.8 · 15/05/2022** (nội bộ NSX, cấp họ máy) | C ⛔ không phổ biến |\n| **S7** | Thông báo kỹ thuật hậu mãi NSX (`G. Những lưu ý khi lắp đặt … 23-3`) | C |\n| **DM** | **Danh mục hàng hoá GWT — Product Filter** (PDF, 31/07/2026) | Ưu tiên #2 theo GWT |\n| **BR** | Brochure VN | D |\n| **MD** | Master Data GWT / nội dung chatbot | D |\n| **S14** | **Xác nhận trực tiếp từ GWT (chủ sở hữu sản phẩm) — 28/08/2026.** Chốt cách đọc ngưỡng lõi màng và số hiệu TÜV | **A** *(quyết định của chủ sở hữu)* |\n| **S15** | **Certipedia — cơ sở dữ liệu chứng chỉ công khai của TÜV Rheinland**, tra ngày 28/08/2026: `certipedia.com/quality_marks/{ID}` | **A** *(nguồn gốc, tra lại được bất cứ lúc nào)* |\n\n---\n\n\n## BẢNG 1 — THÔNG SỐ KỸ THUẬT\n\n| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S4 · Deck 极沁Max | BR · Brochure VN | MD · Master/Chatbot | ✅ CHỐT |\n|---|---|---|---|---|---|---|---|\n| **Công suất định mức** | **2.100 W** | 2.100 W | — | 2.100 W | 2.100 W | ⚠️ 2.000–2.400 W | ✅ **2.100 W** (mâm nhiệt 2.000 W) |\n| **Điện áp** | **220V~ 50Hz** | 220V/50Hz | — | 220V~ 50Hz | ⚠️ 220–240V | ⚠️ 220–240V | ✅ **220V ~ 50Hz** |\n| **Áp lực nước vào** | **0,1–0,4 MPa** *(ghi 2 lần: bảng TSKT + mục Lưu ý an toàn)* | 0,1–0,4 MPa | — | 0,1–0,4 MPa | ⛔ **0–0,4 MPa** | ⛔ 0–0,4 MPa | ✅ **0,1–0,4 MPa** |\n| **Nhiệt độ môi trường** | **4–40°C** | 4–40°C | — | ⚠️ **4–30°C** | 4–40°C | 4–40°C | ✅ **4–40°C** *(S4 có thể là spec của tổ hợp có máy nước ga)* |\n| **Trọng lượng tịnh** | — | — | — | **14,36 kg** (gộp 17,22 kg) | 14 kg | 14,18 kg (gộp 17,04 kg) | 🟠 **MỞ** — 3 con số khác nhau |\n| **Tỷ lệ thu hồi nước** | — | — | **69%** *(GTUN-8600HP/700G)* · 73,5% *(8500HP/500G)* | — | — | ⚠️ **77%** (master) · 76,8% (chatbot) | 🔴 **MỞ — CẤM CÔNG BỐ** |\n| **Lưu lượng nước thường** | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | 1,8 L/phút | ✅ **1,8 L/phút** — 6/6 nguồn khớp |\n| **Lưu lượng nước nóng** | — | — | **2,1 L/phút** | — | 2,1 L/phút | 2,1 L/phút | ✅ **2,1 L/phút** |\n| **Kích thước** | 467×179×477 mm | 467×179×477 | — | 467×179×477 | 467×179×477 | 467×179×477 | ✅ **467×179×477 mm** |\n| **Yêu cầu tủ / khoảng hở** | Lỗ vòi **Ø30 mm** + mặt phẳng bán kính **3,8 cm** | — | — | Ø30 mm; **hở ≥10 cm** *(đọc từ hình)* | **cao ≥550 mm, sâu ≥530 mm** | — | 🟡 Dùng S1 làm chuẩn; BR/S4 là **khuyến nghị khảo sát** |\n\n> 🔴 **Điểm nguy hiểm nhất bảng này: Áp lực nước vào.** Brochure và Master Data đang ghi mất ngưỡng dưới (`0–0,4` thay vì `0,1–0,4`). Sale đọc theo brochure sẽ tư vấn \"nhà áp yếu vẫn chạy\" → máy lắp xong không hoạt động → khiếu nại.\n\n---\n\n\n## BẢNG 2 — LÕI LỌC & CHU KỲ THAY\n\n| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S6 · Quy cách V1.8 | DM · Danh mục hàng hoá | VN công bố (BR/MD) | ✅ CHỐT |\n|---|---|---|---|---|---|---|---|\n| **Chu kỳ lõi thô (PCFB)** | **6~12 tháng** | 6–12 tháng | — | ngưỡng đếm **360 ngày** | **360 ngày / 6.630 L** | 12–24 tháng | 🟠 GWT chốt **12 tháng** — xem O-02 |\n| **Chu kỳ lõi màng (NF)** | **24~36 tháng** | 24–36 tháng | **\"4 năm\"** *(核心NF滤芯，4年长效设计)* | ngưỡng đếm **1.440 ngày** | **1.440 ngày / 12.240 L** *(nước vào)* | 24–48 tháng | 🟠 GWT chốt **48 tháng** — xem O-02 *(số ngày vẫn mở; số LÍT đã đóng)* |\n| **Ngưỡng LÍT lõi thô** | — | — | — | **10.200 L nước vào / 6.630 L nước tinh khiết** | **6.630 L** | — | ✅ 6.630 L (nước tinh khiết) |\n| **Ngưỡng LÍT lõi màng** | — | — | — | **8.600 L nước tinh khiết** (bản 700G) | **12.240 L** | — | ✅ **ĐÓNG 28/08** — 12.240 L = **nước vào**, 8.600 L = **nước ra**. Không mâu thuẫn (S14) |\n| **\"8.600 L\" trên nhãn máy là gì** | *Rated Total Purified Water Capacity* = **8.600 L** (chỉ tiêu của **MÁY**) | 8.600 L | — | **8.600 L = ngưỡng lít của lõi NF** | — | \"công suất lọc 8.600 L\" | ✅ **ĐÓNG 28/08** — cùng một con số: **nước tinh khiết đầu ra** của lõi màng (S14) |\n| **Số lõi / số bước** | 2 lõi | 2 lõi | 2 lõi | 2 cấp (PCFB + NF) | 2 dòng lõi | 2 lõi – 4 bước | ✅ **2 lõi — 4 bước lọc** |\n| **Tuổi thọ máy** | **5~10 năm** | — | — | — | — | — | ✅ **5–10 năm** (điều kiện vận hành/bảo dưỡng đúng) |\n| **Ống PE & đầu nối** | thay mỗi **24 tháng** (tính phí) | — | — | — | — | — | ✅ **24 tháng** |\n\n### Ghi chú đối chiếu — vì sao \"6~12 tháng\" và \"360 ngày\" KHÔNG hẳn mâu thuẫn\n\nHai nguồn đang nói **hai đại lượng khác nhau**:\n\n| | Đại lượng | Con số | Nguồn |\n|---|---|---|---|\n| Hãng **khuyến nghị thay** | dựa trên chất lượng nước trung bình, thiên về an toàn | 6~12 th (thô) · 24~36 th (màng) | S1, S2 |\n| Máy **đếm và báo đèn** | ngưỡng cứng lập trình trên bo mạch | 360 ngày (thô) · 1.440 ngày (màng) | S6, DM |\n\n> ⚠️ **Hệ quả thực tế phải cảnh báo:** với lõi màng, máy chỉ bật đèn đỏ ở **1.440 ngày (48 tháng)**, trong khi HDSD khuyến nghị thay ở **24–36 tháng**. Khách chỉ tin đèn sẽ thay **muộn hơn khuyến nghị của hãng 12–24 tháng**. Đây là rủi ro chất lượng nước + rủi ro khiếu nại, **không phải chuyện chữ nghĩa**. → O-02.\n\n---\n\n\n## BẢNG 3 — TÍNH NĂNG & GIAO DIỆN VÒI\n\n| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S3 · Deck NSX | S6 · Quy cách V1.8 | S7 · Thông báo KT | MD · Marketing VN | ✅ CHỐT |\n|---|---|---|---|---|---|---|---|\n| **Các mức nhiệt** | nước thường · **45 · 85 · 95°C** | 45/85/95 + thường | 4 mức: 45 (pha sữa) · 85 (pha trà) · 95 (nước nóng) · thường | 45 · 85 · 95 · thường *(thường hiển thị 25°C)* | — | ⛔ **45 · 75 · 85 · 95** | ✅ **thường · 45 · 85 · 95** — ⛔ **KHÔNG có 75°C** |\n| **Nút UV trên vòi** | ✅ **CÓ** — nút \"UV\", đèn trắng/nháy trắng, reset `WARM`+`UV` 3 giây → hiện `SA` | ❌ không có | ❌ không có | ❌ **không có** (vị trí đó là nút **ECO**) | ❌ nhắc **节能键 (ECO)** | \"UVC theo dòng chảy\" | 🟢 Theo **S1** — nhưng xem O-01 |\n| **Nút ECO / tiết kiệm điện** | ❌ **không nhắc** | — | ✅ có, **3 giờ** không thao tác → tự vào ECO | ✅ có, **3 giờ** không thao tác → tự vào ECO; ECO = không giữ ấm | ✅ có (节能键) | ⚠️ \"giữ ấm mặc định **2 giờ**\" | 🟠 **MỞ** — 3 nguồn ghi **3 giờ**, marketing VN ghi 2 giờ → xem O-05 |\n| **Mô-đun tiệt trùng nội tuyến** | ✅ **CÓ** — 5 vị trí độc lập: danh mục đóng gói · sơ đồ điện · sơ đồ xử lý nước · bước lắp đặt (4) · nút vòi + reset `SA`. Bảo hành loại trừ *\"đèn diệt khuẩn tia cực tím\"* | ❌ không xuất hiện | ❌ | ❌ | ❌ | \"UVC Flow, đặt ở dòng nước đi ra\" | 🟢 **CÓ** theo S1 — ⛔ vẫn cấm số \"99,999%\" |\n| **\"Mỗi ngày tươi mới\"** | Nút **xả bình nước nóng** (`Refresh`) | — | ✅ **每日鲜活** — 1 chạm xả sạch nước trong bình đun | ✅ nút 排水 (xả bình) | ✅ nhắc phím 每日鲜活 | \"Mỗi ngày tươi mới\" | ✅ **CÙNG MỘT NÚT** — claim hợp lệ |\n| **Khoá trẻ em** | Chạm LOCK trước rồi chạm nút nhiệt | — | ✅ (pha sữa/pha trà/nước nóng phải mở khoá) | ✅ + **tự khoá lại sau 5 giây** không thao tác; khoá chỉ chặn nước nóng | — | có khoá trẻ em | ✅ **CÓ** + chi tiết 5 giây (🔵 nội bộ) |\n| **Vòi xoay 120°** | — | — | — | ✅ **120° (±60°)** | — | xoay 120° | ✅ **CÓ NGUỒN** (S4) |\n| **Chuẩn IPX4 + bo mạch phủ keo** | — | — | ✅ **IPX4**; **bo mạch phủ keo 100%** | — | — | IPX4, phủ keo | ✅ **CÓ NGUỒN** (S3) |\n| **\"2,8 giây\"** | — | — | ✅ **2,8 giây / cốc 100 ml nước nóng** (từ lưu lượng 2,1 L/phút) | — | — | ⚠️ \"nước nóng ra sau 2,8 giây\" | 🟡 **Có nguồn nhưng đang bị diễn đạt sai** — xem O-06 |\n| **Cảm biến nhiệt Seiko** | — | — | — | NTC1 (bình đun) + NTC2 (hơi nước) — **không ghi hãng** | — | \"cảm biến Seiko\" | 🔴 **KHÔNG CÓ NGUỒN** — cấm dùng |\n| **Hộp đun 1,8 L inox 316 chân không 2 lớp** | \"Hot Tank\" — không mô tả vật liệu/dung tích | — | — | 热胆 — không ghi vật liệu | — | \"1,8 L inox 316 chân không 2 lớp\" | 🔴 **KHÔNG CÓ NGUỒN** — cấm dùng |\n| **Mực nước bình đun** | Cảm biến mực nước | — | — | **4 mức**: thấp · trung · cao · tràn | — | \"4 cấp phát hiện mực nước\" | ✅ **4 mức** — khớp (🔵 chi tiết nội bộ) |\n| **Xả rửa tự động** | Tự làm sạch & xả rửa màng theo lịch | — | — | Bật nguồn xả 30 giây · **mỗi 24 giờ xả 30 giây** · chờ >4 giờ không tạo nước → xả 15 giây | — | \"tự động xả rửa định kỳ\" | ✅ **CÓ** — chi tiết chu kỳ 🔵 nội bộ |\n| **Học điểm sôi theo vùng** | — | — | — | ✅ máy **tự học điểm sôi địa phương**; nếu cài > điểm sôi thì lấy điểm sôi − 2°C | — | — | 🔵 **NỘI BỘ** — giải thích được vì sao 95°C ở vùng cao có thể thấp hơn |\n\n---\n\n\n## BẢNG 4 — MÃ LỖI (kể cả mâu thuẫn NỘI BỘ trong cùng 1 tài liệu)\n\n| Mã | S1 · HDSD quốc tế | S6 ch.6 · bảng tự kiểm | S6 · các chương logic | S7 · hiện trường | ✅ CHỐT (dùng cho CSKH) |\n|---|---|---|---|---|---|\n| `E1` | Lỗi truyền thông vòi thông minh | 水龙头板通讯异常 | — | — | ✅ Khớp |\n| `E2` | Bất thường truyền thông bo mạch hiển thị | 显示板通讯异常 | ⚠️ ch.3.4.5 ghi *\"gia nhiệt quá 3 phút không đổi nhiệt → E2\"* | — | ✅ Theo **S1** — E2 = lỗi bo hiển thị |\n| `E3` | Kích hoạt bảo vệ chống tràn | 溢水 (tràn nước) | ⚠️ ch.3.3.3 ghi *\"tràn nước → nháy **E9**\"* | — | ✅ Theo **S1** — E3 = tràn |\n| `E4` | Sản xuất nước bất thường | 异常制水 — quá 5 phút chưa đạt mực nước cao | ch.3.7: bơm chạy liên tục 2 giờ → bảo vệ, báo E4 | — | ✅ Khớp |\n| `E5` | Gia nhiệt bất thường | 加热异常 | ⚠️ ch.3.10 ghi *\"rò rỉ → báo **E5**\"* | — | ✅ Theo **S1** — E5 = gia nhiệt |\n| `E6` | ❌ không có | 超时保护 (dự phòng) | — | — | 🔵 Dự phòng, chưa dùng |\n| `E7` | **Rò rỉ nước** | 漏水 (rò rỉ) | ⚠️ (mâu thuẫn với ch.3.10 ở trên) | — | ✅ Theo **S1** — E7 = rò rỉ |\n| `E8` | Bất thường đầu dò hộp đun | 加热NTC异常 | — | — | ✅ Khớp |\n| `E9` | Bất thường cảm biến NTC | 蒸汽NTC异常 | ⚠️ (bị dùng cho \"tràn nước\" ở ch.3.3.3) | — | ✅ Theo **S1** — E9 = NTC |\n| `C1` | Chế độ xả rửa lần đầu — **~16 phút** | — | Bật nguồn lần đầu: cưỡng bức 16 phút | ✅ Xử lý khi bị kích hoạt nhầm: bấm nút nước thường, xả 16 phút | ✅ Khớp |\n| `C2` | Xả rửa sau reset lõi — **8 phút** | — | Xả lõi 30 giây + ra nước 5 phút mỗi lõi | — | ✅ Theo **S1** — 8 phút |\n| `SA` | Xác nhận đã reset mô-đun tiệt trùng | ❌ không có | ❌ | ❌ | ✅ Chỉ có ở **S1** |\n| `EL` | ❌ **không có** | — | ✅ **Mực nước bình đun xuống mức thấp** → tự bơm bù, nháy 1Hz, không kêu bíp | ✅ nhắc `EL` khi xả bình đun | 🔵 **NỘI BỘ** — CSKH cần biết: `EL` **không phải lỗi** |\n| `SC` | ❌ không có | — | ✅ Xác nhận **khôi phục cài đặt gốc** (giữ ECO + nước thường 10 giây) | — | 🔵 **NỘI BỘ — CẤM hướng dẫn khách tự làm** |\n| `F1/F2/F3` | ❌ | Dự phòng, chưa gán | — | — | 🔵 Dự phòng |\n\n> 🟠 **Kết luận Phần 4:** tài liệu S6 (V1.8 · 2022) **tự mâu thuẫn với chính nó** ở 3 chỗ (E2, E5, E9 bị dùng 2 nghĩa). Đây là bản đặc tả đang soạn dở của **cả họ máy**, không phải bản chốt cho USH10. → **CSKH chỉ dùng cột S1.** S6 chỉ dùng để hiểu cơ chế, không dùng để tra mã.\n\n---\n\n\n## BẢNG 5 — CHỨNG NHẬN & PHÁP LÝ\n\n| Dữ kiện | S1 · HDSD quốc tế | S2 · HDSD TQ | S5 · Tài liệu TÜV | S9 · Hồ sơ nội bộ GWT | ✅ CHỐT |\n|---|---|---|---|---|---|\n| **Số hiệu TÜV** | — | — | ❌ **`1111297087`** — Certipedia trả về **HP Inc. (laptop)** → lỗi chép số | ✅ **`1111279087`** — Certipedia trả về **General Water Technology (Shanghai) Co., Ltd.** | ✅ **ĐÓNG 28/08 — hồ sơ nội bộ ĐÚNG** (S15). O-04 đóng, mở tiếp O-18 |\n| **Số chứng chỉ TÜV** | — | — | **`Q 50613617 001`** | ❌ không ghi | ✅ Chỉ có ở S5 |\n| **Số báo cáo TÜV** | — | — | **`CN24W0C5 001`** | ❌ không ghi | ✅ Chỉ có ở S5 |\n| **Model được TÜV chứng nhận** | — | — | **`GE-GEUT-50B04` và `GE-GTUN-8600HP`** | \"USH10\" | 🟢 **Xác nhận TÜV bao gồm đúng USH10** |\n| **Nội dung TÜV** | — | — | **57 thử nghiệm**; vật liệu tiếp xúc nước đạt **19 chỉ tiêu hoà tan kim loại nặng EN 14350**; **12 yêu cầu LFGB (Đức)**; kiểm vi sinh theo **DIN EN 16889** (E. coli, S. aureus, P. aeruginosa) | \"57 tiêu chí, an toàn mẹ & bé, 19 tiêu chuẩn EU 2020\" | 🟡 Dùng **nguyên văn S5**, ⛔ bỏ cụm *\"an toàn mẹ & bé\"* — xem **Phần 2** |\n| **File PDF chứng chỉ TÜV** | — | — | ❌ **chưa có** (S5 là bản mô tả, không phải bản scan) | 🔴 file 0 byte | 🔴 **MỞ — nặng thêm:** Certipedia cũng **không hiện chứng chỉ nào** cho ID đúng → O-18 |\n| **SGS diệt khuẩn 99,999%** | — | — | ❌ | Số `ASH18-029858-01`, **chưa có file**; phiếu SGS trong kho là của máy **50B04** | 🔴 **CẤM CÔNG BỐ** |\n| **Tiêu chuẩn sản xuất** | ❌ (chỉ có WEEE/EU) | `GB4706.1-2005`, `GB4706.19-2008`, `Q31/0112000854C015-2021-01` | — | — | 🔵 Nội bộ — chuẩn thị trường TQ |\n| **Giấy phép vệ sinh** | — | `(苏)卫水字(2021)第3200-0139号` | — | — | 🔵 Nội bộ — giấy phép TQ |\n| **Chất lượng nước ra** | — | đạt `CJ94-2005` (chuẩn TQ) | — | claim VN: `QCVN 6-1:2010/BYT` | 🔴 **Phiếu thử VN rỗng** — xem **Phần 2** |\n| **Hiệu suất nước** | — | **Mức 1 (cao nhất)** theo `GB 34914-2021` | — | — | 🟡 Nói được nhưng **phải ghi rõ là tiêu chuẩn Trung Quốc** |\n| **Nhà sản xuất** | **General Water Technology (HongKong) Co., Ltd.** | 溢泰（南京）环保科技 (Yitai Nanjing), uỷ quyền bởi 通用净水科技（上海） | — | — | 🟠 **MỞ** — 2 bản HDSD ghi 2 NSX → O-01 |\n| **Thải bỏ** | Ký hiệu **WEEE (EU)** | — | — | — | ✅ Chỉ ở S1 |\n\n---\n\n\n## BẢNG 6 — THƯƠNG MẠI & TÀI LIỆU NỘI BỘ\n\n| Dữ kiện | `product_price` | `catalog_item` | `gwt/sales-cskh.md` | `wh_master` (kho) | ✅ CHỐT |\n|---|---|---|---|---|---|\n| **Giá niêm yết** | **44.950.000 đ**, kênh `NIEM_YET`, hiệu lực 29/07/2026 | 44.950.000 đ | — | — | ✅ 44.950.000 đ |\n| **VAT** | ⚠️ `vat_pct = 10` + ghi chú *\"CHUA XAC MINH da gom VAT hay chua\"* | ⚠️ **VAT 8%** | — | — | 🔴 **MỞ — ẢNH HƯỞNG BÁO GIÁ** → O-07 |\n| **Phân loại máy** | — | Machines › POU › **Undersink** | ⛔ **\"máy để bàn\"** | — | ✅ **ÂM TỦ BẾP** — `sales-cskh.md` **SAI** |\n| **Tình trạng hàng** | — | Đang KD | ⚠️ \"thường hết hàng\" | **tồn 4 máy** (24/06/2026, kho Nguyễn Xiển) | 🟠 Kiểm tra tồn thực tế trước khi trả lời khách |\n| **Tồn lõi USH10** | — | — | — | 🔴 **0 lõi** | 🔴 ⛔ **Không hứa \"có sẵn, thay ngay\"** |\n\n---\n\n\n## BẢNG 7 — SỔ MÂU THUẪN MỞ (việc cần GWT chốt)\n\n| Mã | Vấn đề | Mức | Ảnh hưởng | Cần ai chốt | Chốt xong thì sửa file nào |\n|---|---|---|---|---|---|\n| **O-01** | **Máy bán tại VN đi kèm bản HDSD nào?** Bản quốc tế Ver.26.08.14 (có UV, NSX HongKong) hay bản TQ (không UV, NSX Yitai Nanjing)? | 🔴 **CHẶN** | Quyết định **có được nói tính năng tiệt trùng UV hay không** — đây là USP mạnh nhất. Cũng quyết định bố cục nút vòi (UV hay ECO) mà CSKH hướng dẫn khách | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 3**, **Phần 6**, **Phần 7** |\n| **O-02** | **Chu kỳ lõi:** HDSD 6–12 / 24–36 tháng vs GWT chốt 12 / 48 tháng | 🔴 **CAO** | Máy chỉ báo đèn ở 48 tháng trong khi hãng khuyến nghị thay ở 24–36 tháng → khách thay muộn 12–24 tháng. Rủi ro chất lượng nước + khiếu nại + kế hoạch nhập lõi | GWT (cần văn bản giải thích cơ sở) | **Phần 1**, **Phần 3**, **Phần 6** |\n| ~~**O-03**~~ | ✅ **ĐÃ ĐÓNG 28/08/2026.** GWT xác nhận: **12.240 L = nước ĐẦU VÀO**, **8.600 L = nước tinh khiết ĐẦU RA** của lõi màng — hai đại lượng khác nhau, **không mâu thuẫn** (70,3 %). 8.600 L trên nhãn máy = cùng con số đó | ✅ Đóng | Đã sửa `F-B06`, `F-C17`, `F-L01`, `F-L03`, danh sách đỏ **Phần 2**, nguyên tắc 2 **Phần 7**. Luật còn lại: ⛔ không trộn số **lõi màng** với số **lõi thô** | — | ✅ xong |\n| ~~**O-04**~~ | ✅ **ĐÃ ĐÓNG 28/08/2026.** Tra Certipedia: `1111279087` → **General Water Technology (Shanghai) Co., Ltd.** (đúng NSX) · `1111297087` → **HP Inc., laptop TPN-W166** (lỗi chép số). **Hồ sơ nội bộ GWT đúng** | ✅ Đóng | Đã sửa `F-I01`, **Phần 2**, **Phần 6 · Q28**. ⛔ Gỡ `1111297087` khỏi mọi tài liệu | — | ✅ xong |\n| **O-18** | 🔴 **Hồ sơ TÜV không hiện trên Certipedia.** Trang của ID đúng `1111279087` ghi *\"Currently no valid certificates are attached to this Certipedia ID\"* — tên NSX hiện đúng nhưng **không có chứng chỉ nào đính kèm**. Đồng thời **chưa có bản scan** chứng chỉ (`F-I09`) | 🔴 **CAO** | **Nặng hơn O-04 cũ.** Trước đây rủi ro là đọc *nhầm* số; giờ rủi ro là đọc *đúng* số mà khách tra vẫn ra **trang trống** — đúng tại điểm chốt đơn. Hiện ⛔ cấm đưa cả số lẫn link | GWT làm việc lại với TÜV Rheinland / NSX: (1) xin **bản scan PDF** chứng chỉ `Q 50613617 001`; (2) hỏi vì sao chứng chỉ **không hiển thị công khai** — hết hạn, chưa publish, hay thuộc loại không đăng | **Phần 1** (`F-I01` `F-I16`), **Phần 2**, **Phần 6 · Q28** |\n| **O-05** | **Chế độ tiết kiệm điện: 3 giờ hay 2 giờ?** S3 + S6 ghi 3 giờ; marketing VN ghi 2 giờ. HDSD quốc tế **không nhắc chế độ này** | 🟡 Thấp | Sai chi tiết nhỏ nhưng dễ bị khách bắt lỗi khi dùng thực tế | GWT | **Phần 1**, **Phần 6** |\n| **O-06** | **\"2,8 giây\" nghĩa là gì?** Nguồn NSX: *\"2,8 giây một cốc 100 ml nước nóng\"* = **tốc độ rót**. Marketing VN đang nói *\"nước nóng ra sau 2,8 giây\"* = **thời gian chờ** | 🟠 **TB** | Hai nghĩa hoàn toàn khác nhau. Nói sai = quảng cáo sai tính năng | Marketing sửa ngay, không cần chờ GWT | **Phần 1**, **Phần 6**, **Phần 7** |\n| **O-07** | **Giá 44,95tr đã gồm VAT chưa? 8% hay 10%?** | 🔴 **CAO** | Ảnh hưởng trực tiếp mọi báo giá bằng văn bản | Phòng Kinh doanh | **Phần 1**, **Phần 6** |\n| **O-08** | **Không có bảng chiết khấu chính thức** dù 12/12 đơn đã bán ở mức 60–85% giá niêm yết, các mốc đều chẵn | 🔴 **CAO** | Sale không có căn cứ ra giá; giá thực ~30–34tr đụng thẳng CTS20 (32,1tr) | Ban Giám đốc | **Phần 6**, **Phần 7** |\n| **O-09** | **Chưa có phiếu xét nghiệm nước đầu ra của chính máy USH10 tại VN** | 🟠 **TB** | Mọi claim chất lượng nước hiện không có bằng chứng nội địa. Mineral Map là kết quả của **hệ lọc tổng (POE)**, ⛔ không dùng cho USH10 | GWT Kỹ thuật | **Phần 2**, **Phần 6** |\n| **O-10** | **Bảo hành 5 năm bơm + bo mạch không có trong HDSD hãng** (cả 2 bản) — là chính sách riêng GWT | 🟠 **TB** | Sale đang hứa miệng, không có văn bản dẫn chứng | Phòng Kinh doanh | **Phần 1**, **Phần 6** |\n| **O-11** | **3 claim marketing chưa truy được nguồn:** cảm biến nhiệt **Seiko** · hộp đun **1,8 L inox 316 chân không 2 lớp** | 🟠 **TB** | Đang bị chặn dùng. Nếu có nguồn thì đây là 2 điểm bán mạnh cho phân khúc cao cấp | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 7** |\n| **O-12** | **Trọng lượng: 14 kg / 14,18 kg / 14,36 kg** | 🟡 Thấp | Ảnh hưởng vận chuyển, không ảnh hưởng bán hàng | GWT Kho vận | **Phần 1** |\n| **O-13** | **Nhiệt độ môi trường: 4–40°C (HDSD) hay 4–30°C (deck 极沁Max)** | 🟡 Thấp | Có thể deck ghi spec của tổ hợp có máy nước ga. Cần xác nhận nếu bán combo | GWT | **Phần 1** |\n| **O-14** | **Mã đặt hàng combo 极沁Max bị đảo trong tài liệu:** `V00000068` / `V00000069` gắn với bình ga 0,6 L hay 4 L? | 🟡 Thấp | Chỉ ảnh hưởng khi bán combo với SPK25 | GWT Cung ứng | **Phần 1** |\n| **O-15** | **`gwt/sales-cskh.md` ghi USH10 là \"máy để bàn\"** | 🔴 **CHẶN** | **Tài liệu đào tạo sale đang sai loại máy.** Sale mới học sai từ ngày đầu | Đào tạo | `sales-cskh.md` (ngoài PKB) |\n| **O-16** | **Chatbot Supabase đang vi phạm chính rule của GWT** — 8 chunk chứa \"99,999%\", \"cao nhất\", \"công nghệ độc quyền\", và **công dụng y tế từng khoáng** | 🔴 **CHẶN** | Chatbot đang nói với khách **đúng những câu mà kịch bản video bị cấm nói** | IT + Marketing | `chatbot_chunks` (ngoài PKB) |\n| **O-19** | **Tỷ lệ thu hồi nước ghi 4 số khác nhau:** 69% (NSX, cho GTUN-8600HP) · 77% (master data VN) · 76,8% (chatbot) · ≥65% (quy cách V1.8). *Tách ra thành mã riêng ngày 28/08 — trước đây bị gộp nhầm vào `O-03`, mà `O-03` nay đã đóng* | 🟠 **TB** | Đang ⛔ cấm công bố mọi con số thu hồi (`F-B22`). Là một trong những câu khách hỏi nhiều nhất về máy lọc | GWT + NSX | **Phần 1**, **Phần 2**, **Phần 6** |\n| **O-17** | **Mã lạ `GTUN-8600VNHP`** — 2 máy đã lắp (2024), có dòng bảo hành. Ghi chú DB: *\"máy Test, có lắp lẻ thực tế\"* | 🟡 Thấp | Ảnh hưởng tra cứu bảo hành | GWT | **Phần 1** |\n\n---\n\n\n## Bảng ưu tiên xử lý\n\n| Thứ tự | Mã | Lý do đứng vị trí này |\n|---|---|---|\n| 1 | **O-15** | Sai loại máy trong tài liệu đào tạo — hỏng từ gốc, sửa mất 1 phút |\n| 2 | **O-16** | Chatbot đang nói câu vi phạm với khách **ngay lúc này** |\n| 3 | **O-01** | Mở khoá hoặc đóng vĩnh viễn USP mạnh nhất (UV) |\n| 4 | **O-07** + **O-08** | Không chốt thì không báo giá đúng được |\n| 5 | **O-18** | Số chứng nhận đã đúng, nhưng khách tra Certipedia ra **trang trống** — hỏng ngay tại điểm chốt đơn |\n| 6 | **O-02** | Ảnh hưởng chất lượng nước của khách đang dùng + kế hoạch nhập lõi |\n| 7 | **O-06** | Marketing tự sửa được, không cần chờ ai |\n| 8 | Còn lại | Theo mức đã ghi |\n\n---"
      },
      {
        "so": 9,
        "slug": "dao-tao",
        "ten": "Đào tạo & kiểm tra",
        "nhom": "san-pham",
        "coNoiDung": true,
        "noiDung": "# PHẦN 9 — ĐÀO TẠO & KIỂM TRA\n\n> **PKB v1.2 · 28/08/2026** · Dùng cho: đào tạo sale mới · tái đào tạo CSKH · onboarding kỹ thuật\n> **Điều kiện đạt:** ≥ 22/25 câu trắc nghiệm **và** không sai câu nào thuộc nhóm 🔴 (câu 1, 5, 9, 14, 18, 22, 25)\n\n---\n\n\n## 1. LỘ TRÌNH ĐÀO TẠO\n\n| Buổi | Thời lượng | Nội dung | File đọc trước | Sản phẩm đầu ra |\n|---|---|---|---|---|\n| **B1 — Sản phẩm** | 90 phút | Máy là gì, đặt ở đâu, 2 lõi 4 bước, 4 chế độ nước, vòi thông minh, app | **Phần 1** mục A–F | Vẽ lại sơ đồ đường nước từ trí nhớ |\n| **B2 — Cấm & Được** | 90 phút | Danh sách đỏ, quy tắc mẹ & bé, cách nói thay thế | **Phần 2** **toàn bộ** | Sửa 10 câu sai thành câu đúng |\n| **B3 — Hỏi–Đáp** | 120 phút | 40 câu Q&A, nhập vai | **Phần 6** | Nhập vai 5 tình huống, đạt |\n| **B4 — An toàn & Sự cố** | 90 phút | Safety database, mã lỗi, kịch bản CSKH | **Phần 4**, **Phần 5** | Xử lý đúng 8 ca giả định |\n| **B5 — Thực hành máy thật** | 60 phút | Bấm thử toàn bộ nút, thay lõi, reset, ghép app | Máy demo | Thay lõi + reset đúng trong 10 phút |\n| **B6 — Kiểm tra** | 45 phút | 25 câu trắc nghiệm + 2 tình huống viết | — | Đạt ≥ 22/25 |\n\n> ⚠️ **B5 là bắt buộc.** Nhiều lỗi tư vấn trong quá khứ (mức nhiệt 75 °C, \"máy để bàn\") xuất phát từ việc nhân viên **chưa từng chạm máy thật**.\n\n---\n\n\n## 2. MƯỜI ĐIỀU PHẢI THUỘC LÒNG\n\n| # | Điều | Mã |\n|---|---|---|\n| 1 | USH10 là **máy âm tủ bếp**, không phải máy để bàn | `F-A06` |\n| 2 | **4 chế độ:** thường · 45 · 85 · 95 °C. **Không có 75 °C** | `F-E01` `F-E02` |\n| 3 | **2 lõi — 4 bước lọc.** ⛔ Không đọc mã lõi | `F-C01` |\n| 4 | Áp lực nước vào **0,1–0,4 MPa** — có ngưỡng dưới | `F-B08` |\n| 5 | **Chỉ nước máy đô thị. Chỉ dùng cho gia đình** | `F-B14` `F-C21` |\n| 6 | **Lõi lọc, mô-đun tiệt trùng, adapter KHÔNG được bảo hành** | `F-G03` |\n| 7 | Lấy nước nóng luôn là **2 bước**: LOCK → nút nhiệt | `F-E04` |\n| 8 | `C1` `C2` `SA` `EL` là **trạng thái bình thường**, không phải lỗi | **Phần 5** mục 1.1 |\n| 9 | `E7` = rò rỉ → **tắt điện + khoá van NGAY** | `SF-13` |\n| 10 | Kho hiện **0 lõi USH10** → ⛔ không hứa \"có sẵn, thay ngay\" | `F-K08` |\n\n---\n\n\n## 3. MƯỜI CÂU CẤM — HỌC THUỘC ĐỂ KHÔNG BUỘT MIỆNG\n\n```\n⛔ \"Diệt khuẩn 99,999%\"\n⛔ \"Tốt nhất / duy nhất / cao nhất thị trường\"\n⛔ \"Lõi bền 4 năm\" (nói như cam kết)\n⛔ \"45 độ là nhiệt độ chuẩn pha sữa cho bé\"\n⛔ \"An toàn tuyệt đối cho trẻ em\"\n⛔ \"Nước này tốt cho sức khoẻ / tốt cho bé / tốt cho mẹ bầu\"\n⛔ \"Magie tốt cho tim mạch\" (và mọi công dụng khoáng)\n⛔ \"Áp lực 0 MPa cũng chạy\"\n⛔ \"Nước nóng ra sau 2,8 giây\"\n⛔ \"Bên em có sẵn lõi, thay ngay cho anh/chị\"\n```\n\n---\n\n\n## 4. BÀI KIỂM TRA 25 CÂU\n\n> 🔴 = câu chốt, **sai là trượt dù tổng điểm đạt**\n\n### Phần A — Sản phẩm (10 câu)\n\n**🔴 1.** USH10 thuộc loại máy nào?\nA. Máy để bàn · B. **Máy âm tủ bếp (undersink)** · C. Máy đứng · D. Máy treo tường\n\n**2.** Kích thước máy là bao nhiêu?\nA. 467 × 179 × 477 mm · B. 477 × 179 × 467 mm · C. 467 × 279 × 477 mm · D. 400 × 180 × 500 mm\n\n**3.** Máy có mấy chế độ nước và là những mức nào?\nA. 3 mức: 45/75/95 · B. **4 mức: thường/45/85/95** · C. 4 mức: thường/45/75/95 · D. 5 mức\n\n**4.** Máy có mấy lõi, mấy bước lọc?\nA. 2 lõi – 4 bước · B. 4 lõi – 4 bước · C. 3 lõi – 5 bước · D. 7 lõi – 7 bước\n\n**🔴 5.** Áp lực nước vào cho phép là bao nhiêu?\nA. 0 – 0,4 MPa · B. **0,1 – 0,4 MPa** · C. 0,1 – 0,9 MPa · D. Không giới hạn\n\n**6.** Nguồn nước áp dụng?\nA. Nước máy đô thị và nước giếng khoan · B. **Chỉ nước máy đô thị** · C. Mọi nguồn nước · D. Nước máy và nước mưa\n\n**7.** Công suất định mức và điện áp?\nA. 2.000–2.400 W / 220–240V · B. **2.100 W / 220V ~ 50Hz** · C. 2.100 W / 220–240V · D. 2.000 W / 220V\n\n**8.** Công suất làm nóng?\nA. 2,1 L/phút · B. 1,8 L/phút · C. **20 L/giờ** · D. 8.600 L\n\n**🔴 9.** Máy được thiết kế cho đối tượng nào?\nA. Gia đình và văn phòng · B. **Chỉ hộ gia đình** · C. Gia đình, quán cà phê · D. Mọi đối tượng\n\n**10.** Lấy nước nóng thao tác thế nào?\nA. Chạm 1 nút nhiệt độ · B. **Chạm LOCK rồi chạm nút nhiệt độ** · C. Giữ nút 3 giây · D. Xoay vòi\n\n### Phần B — Vận hành & Sự cố (7 câu)\n\n**11.** Màn hình hiện `C1` nghĩa là gì?\nA. Lỗi cảm biến · B. **Chế độ xả rửa lần đầu, chờ ~16 phút** · C. Lỗi bo mạch · D. Cần thay lõi\n\n**12.** Khách báo \"máy tự chạy xả nước, màn hiện C1\". Hỏi gì trước?\nA. Máy lắp bao lâu rồi · B. **Mặt vòi có đọng nước không** · C. Đèn lõi màu gì · D. Cử kỹ thuật ngay\n\n**13.** `EL` là gì?\nA. Lỗi rò rỉ · B. Lỗi gia nhiệt · C. **Máy đang tự bơm bù nước vào bình đun — bình thường** · D. Hết lõi\n\n**🔴 14.** Máy báo `E7`. Việc đầu tiên phải làm?\nA. Tắt/bật lại máy · B. **Tắt điện + khoá van bi cấp nước ngay** · C. Chạm nút Refresh · D. Xả rửa\n\n**15.** Sau khi thay lõi mới, bước nào hay bị quên nhất?\nA. Xoay lõi đúng chiều · B. Khoá van trước khi thay · C. **Giữ nút lõi 3 giây để reset** · D. Mở nắp trước\n\n**16.** Sau reset lõi, máy hiện `C2` và cần xả rửa bao lâu?\nA. 16 phút · B. **8 phút** · C. 30 giây · D. Không cần xả\n\n**17.** Khách báo \"mới lắp mà nước có bột đen\". Trả lời?\nA. Máy lỗi, cử kỹ thuật · B. **Bình thường — bột than từ lõi mới, xả tới khi nước trong** · C. Lõi giả · D. Thay lõi\n\n### Phần C — Claim & Quy tắc (8 câu)\n\n**🔴 18.** Khách hỏi \"khoáng trong nước có tác dụng gì?\". Trả lời đúng?\nA. Liệt kê công dụng từng khoáng\nB. \"Magie tốt cho tim mạch, kẽm tăng đề kháng\"\nC. **\"Cái này em không tư vấn được vì liên quan sức khoẻ. Em chỉ khẳng định máy giữ lại khoáng chứ không loại bỏ.\"**\nD. \"Nước có khoáng tốt cho sức khoẻ hơn nước RO\"\n\n**19.** Được nói gì về mô-đun tiệt trùng?\nA. \"Diệt 99,999% vi khuẩn\" · B. **\"Có mô-đun tiệt trùng lắp nối tiếp trên đường nước ra vòi\"** · C. \"Diệt sạch mọi vi khuẩn\" · D. Không được nói gì\n\n**20.** Về chu kỳ lõi, cách nói nào đúng?\nA. \"Lõi bền 4 năm\" · B. \"Cam kết dùng được 48 tháng\" · C. **\"Chu kỳ khuyến nghị 48 tháng, máy tự đếm và báo khi tới hạn\"** · D. \"Không cần thay lõi\"\n\n**21.** Khách hỏi \"nước này pha sữa cho bé được không?\". Câu nào ĐÚNG?\nA. \"Được, 45 độ là nhiệt độ chuẩn pha sữa\"\nB. **\"Trên vòi có nút 45 độ hãng thiết kế cho tình huống pha sữa. Còn cách pha sữa cho bé thì anh/chị theo hướng dẫn hãng sữa và bác sĩ, em không tư vấn được.\"**\nC. \"Được, máy đạt chuẩn an toàn mẹ và bé\"\nD. \"Nước giữ khoáng nên tốt cho bé\"\n\n**🔴 22.** Khách hỏi xin file chứng nhận TÜV. Làm gì?\nA. Đọc số hiệu cho khách tra\nB. Hứa gửi file trong hôm nay\nC. **Nói nội dung chứng nhận, không đọc số hiệu, chuyển yêu cầu về phòng kỹ thuật để gửi bản chính thức**\nD. Nói máy không có chứng nhận\n\n**23.** Bộ phận nào KHÔNG được bảo hành?\nA. Bơm · B. Bo mạch điều khiển · C. **Lõi lọc, mô-đun tiệt trùng, gioăng, vỏ trang trí, adapter** · D. Vòi\n\n**24.** Khách hỏi \"bên em có sẵn lõi thay ngay không?\". Trả lời?\nA. \"Có sẵn, mai em qua thay\"\nB. **\"Lõi này nhập theo máy nên em cần kiểm tra tồn kho rồi báo lại anh/chị lịch cụ thể trong hôm nay.\"**\nC. \"Không có hàng\"\nD. \"Anh/chị mua ngoài cũng được\"\n\n**🔴 25.** Khách muốn lắp cho quán cà phê. Trả lời?\nA. \"Được, máy lắp đâu cũng được\"\nB. **\"HDSD ghi máy chỉ dành cho gia đình, không lắp nơi tiêu thụ nước cao. Em chuyển phòng kinh doanh để tư vấn giải pháp phù hợp.\"**\nC. \"Được, chỉ cần thay lõi thường xuyên hơn\"\nD. \"Không bán cho quán\"\n\n---\n\n\n## 5. ĐÁP ÁN\n\n| Câu | Đ.án | Câu | Đ.án | Câu | Đ.án | Câu | Đ.án | Câu | Đ.án |\n|---|---|---|---|---|---|---|---|---|---|\n| 1 | **B** 🔴 | 6 | **B** | 11 | **B** | 16 | **B** | 21 | **B** |\n| 2 | **A** | 7 | **B** | 12 | **B** | 17 | **B** | 22 | **C** 🔴 |\n| 3 | **B** | 8 | **C** | 13 | **C** | 18 | **C** 🔴 | 23 | **C** |\n| 4 | **A** | 9 | **B** 🔴 | 14 | **B** 🔴 | 19 | **B** | 24 | **B** |\n| 5 | **B** 🔴 | 10 | **B** | 15 | **C** | 20 | **C** | 25 | **B** 🔴 |\n\n---\n\n\n## 6. TÌNH HUỐNG NHẬP VAI\n\n### T1 — Khách kỹ tính đòi giấy tờ\n> *\"Anh làm ngành xây dựng, anh biết mấy cái chứng nhận này. Em cho anh xem bản scan chứng chỉ TÜV, không phải cái ảnh quảng cáo.\"*\n\n**Chấm điểm:** ✅ không hứa gửi file chưa có · ✅ không đọc số hiệu · ✅ nói được nội dung chứng nhận (57 thử nghiệm, EN 14350, LFGB, DIN EN 16889, **kiểm cả máy đã dùng lâu**) · ✅ đưa patent US 7138058 làm thứ khách tra được ngay · ✅ chuyển yêu cầu về phòng kỹ thuật.\n\n### T2 — Khách đọc HDSD và bắt lỗi chu kỳ lõi\n> *\"Sách hãng ghi 24 đến 36 tháng. Sao website em ghi 48 tháng? Em nói dối à?\"*\n\n**Chấm điểm:** ✅ không nói \"sách ghi sai\" · ✅ phân biệt được **khuyến nghị của hãng** và **ngưỡng máy đếm** · ✅ trích được câu *\"dữ liệu chỉ mang tính tham khảo\"* · ✅ hướng khách về đèn báo · ✅ không hứa con số cứng · ✅ biết chuyển kỹ thuật nếu khách hỏi sâu hơn.\n\n### T3 — Mẹ bỉm hỏi về bé\n> *\"Nhà chị có bé 6 tháng. Máy này pha sữa cho bé an toàn không em? Nước có khoáng thì có tốt cho bé không?\"*\n\n**Chấm điểm:** ✅ mô tả nút 45 độ như **chức năng**, không như khuyến nghị y tế · ✅ **từ chối tư vấn y khoa**, hướng về bác sĩ/hãng sữa · ✅ nói được cơ chế khoá trẻ em · ✅ **không nói \"an toàn tuyệt đối\"** · 🔴 **Trượt ngay** nếu buột miệng bất kỳ câu nào ở mục 3.\n\n### T4 — Khách báo sự cố qua điện thoại\n> *\"Máy nhà anh tự nhiên chạy ầm ầm, màn hình hiện chữ C1, nước chảy suốt. Cử người xuống ngay.\"*\n\n**Chấm điểm:** ✅ nhận ra `C1` **không phải lỗi** · ✅ hỏi ngay *\"mặt vòi có đọng nước không\"* · ✅ hướng dẫn lau khô + chạm nút nước thường xả 16 phút · ✅ **không cử kỹ thuật vô ích** · ✅ ghi ticket P4.\n\n### T5 — Khách ép giá\n> *\"Anh xem chỗ khác bán 32 triệu. Em bớt được bao nhiêu thì nói luôn.\"*\n\n**Chấm điểm:** ✅ **không tự ra giá** · ✅ không hạ giá ngay câu đầu · ✅ xử lý bằng giá trị (gộp 3 thiết bị, chi phí theo ngày) · ✅ nói rõ phải xin duyệt · ✅ không nói xấu nơi bán khác.\n\n---\n\n\n## 7. SAI LẦM THƯỜNG GẶP CỦA NGƯỜI MỚI\n\n| Sai lầm | Vì sao xảy ra | Cách chặn |\n|---|---|---|\n| Nói \"mức 75 độ\" | Đọc tài liệu cũ chưa sửa | **B5 — bấm thử máy thật** |\n| Nói \"máy để bàn\" | `gwt/sales-cskh.md` ghi sai (O-15) | Sửa tài liệu gốc + B1 |\n| Nói \"99,999%\" | Chatbot và tài liệu cũ còn câu này (O-16) | B2 + gỡ chatbot |\n| Buột miệng công dụng khoáng | Phản xạ tự nhiên khi khách hỏi | Học thuộc câu thoát mục 3 **Phần 2** |\n| Hứa \"có sẵn lõi\" | Muốn chốt nhanh | Nhắc kho **0 lõi** ở mọi buổi họp sáng |\n| Đọc số chứng nhận cho khách | Tưởng là điểm mạnh | Số đúng rồi nhưng **trang tra cứu trống** (O-18) → **vẫn cấm đọc số, cấm gửi link** |\n| Coi `C1`/`EL` là lỗi | Chưa đọc **Phần 5** | B4 + bảng tra dán tại bàn CSKH |\n| Quên nói lõi không bảo hành | Sợ mất đơn | **Bắt buộc có trong checklist bàn giao** (**Phần 4** mục 10) |\n| Tự ra giá | Không có bảng chiết khấu (O-08) | Quy định: mọi mức ngoài niêm yết phải có duyệt bằng văn bản |\n\n---\n\n\n## 8. BẢNG DÁN TẠI BÀN CSKH (in A4)\n\n```\n┌─────────────────────────────────────────────────────────┐\n│  USH10 — TRA NHANH                                      │\n├─────────────────────────────────────────────────────────┤\n│  🟢 BÌNH THƯỜNG, KHÔNG PHẢI LỖI                         │\n│     C1  xả rửa lần đầu — chờ 16 phút                    │\n│     C2  xả rửa sau thay lõi — chờ 8 phút                │\n│     SA  đã reset mô-đun tiệt trùng                      │\n│     EL  đang bơm bù nước bình đun                       │\n│     Bột đen lúc mới lắp — xả tới khi nước trong         │\n├─────────────────────────────────────────────────────────┤\n│  🔴 TẮT ĐIỆN + KHOÁ VAN NGAY                            │\n│     E7 rò rỉ · nghi rò điện · mùi khét · ngập tủ        │\n├─────────────────────────────────────────────────────────┤\n│  ❓ HỎI TRƯỚC KHI CỬ KỸ THUẬT                           │\n│     Máy tự xả C1  →  MẶT VÒI CÓ ĐỌNG NƯỚC KHÔNG?        │\n│     Không ra nước →  VAN BI 3 NGÃ ĐÃ MỞ HẾT CHƯA?       │\n│     Không nước nóng → ĐÃ CHẠM LOCK CHƯA? THỬ LẠI 3 LẦN  │\n├─────────────────────────────────────────────────────────┤\n│  ⛔ KHÔNG BAO GIỜ NÓI                                    │\n│     99,999%  ·  tốt nhất/duy nhất  ·  mã lõi            │\n│     công dụng khoáng  ·  75 độ  ·  \"có sẵn lõi ngay\"    │\n│     \"tốt cho bé/mẹ bầu\"  ·  số hiệu chứng nhận          │\n├─────────────────────────────────────────────────────────┤\n│  📌 NHỚ                                                  │\n│     Lõi + mô-đun tiệt trùng + adapter: KHÔNG bảo hành   │\n│     Áp lực nước vào: 0,1 – 0,4 MPa                      │\n│     Chỉ nước máy đô thị · Chỉ hộ gia đình               │\n│     Kho hiện 0 lõi → KIỂM TRA TỒN TRƯỚC KHI HẸN         │\n└─────────────────────────────────────────────────────────┘\n```\n\n---\n\n\n\n---\n\n*Hết. USH10 Product Knowledge Database v1.0 — 19/08/2026.*"
      }
    ],
    "facts": [
      {
        "ma": "F-A01",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Tên thương mại VN",
        "giaTri": "**Máy lọc nước GE USH10**",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-A02",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Tên trên HDSD",
        "giaTri": "**Máy lọc nước nóng công nghệ lọc nano GE** (GE Nanofiltration Heating Purifier)",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-A03",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Model",
        "giaTri": "**USH10**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-A04",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Mã nội bộ GWT",
        "giaTri": "`GTUN-8600HP-G`",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-A05",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Model nội địa / mã NSX",
        "giaTri": "`GTUN-8600HP`",
        "nguon": "S4, S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-A06",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Loại máy",
        "giaTri": "**Âm tủ bếp (undersink)** — thân máy giấu dưới chậu rửa, chỉ vòi lộ trên mặt bàn",
        "nguon": "S1, S4",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-A07",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Nhà sản xuất (HDSD quốc tế)",
        "giaTri": "General Water Technology (HongKong) Co., Ltd.",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-A08",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Nhà sản xuất (HDSD bản TQ)",
        "giaTri": "溢泰（南京）环保科技 — Yitai Nanjing, uỷ quyền bởi 通用净水科技（上海）",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🔵"
      },
      {
        "ma": "F-A09",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Nhãn hiệu",
        "giaTri": "*\"GE is a trademark of General Electric Company and is manufactured under license\"* — GE là nhãn hiệu của General Electric, sản xuất theo giấy phép",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🟡"
      },
      {
        "ma": "F-A10",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Phiên bản HDSD",
        "giaTri": "**Ver.26.08.14**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-A11",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Mã lạ trong hệ thống",
        "giaTri": "`GTUN-8600VNHP` — 2 máy đã lắp 2024, ghi chú DB *\"máy Test, có lắp lẻ thực tế\"*",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-A12",
        "nhom": "A",
        "tenNhom": "ĐỊNH DANH SẢN PHẨM",
        "duKien": "Ghép combo",
        "giaTri": "Ghép được với máy nước có ga **SPK25** (`GTUS-00S03`) thành giải pháp **极沁Max**. Mã đặt hàng `V00000068` / `V00000069` (⚠️ mapping bình ga 0,6L/4L chưa rõ — O-14)",
        "nguon": "S4",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🔵"
      },
      {
        "ma": "F-B01",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Kích thước (D×R×C)",
        "giaTri": "**467 × 179 × 477 mm**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B02",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Chiều rộng — con số bán hàng",
        "giaTri": "**17,9 cm** — lọt gầm chậu chung cư đã bị xi phông chiếm chỗ",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B03",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Trọng lượng",
        "giaTri": "~**14 kg** (3 nguồn ghi 14 / 14,18 / 14,36 kg — O-12)",
        "nguon": "S4, BR, MD",
        "hang": "B",
        "hangGoc": "B/D",
        "congBo": "🟡"
      },
      {
        "ma": "F-B04",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Lưu lượng nước tinh khiết (nước thường)",
        "giaTri": "**1,8 L/phút**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B05",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Lưu lượng nước nóng",
        "giaTri": "**2,1 L/phút**",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-B06",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Tổng công suất lọc định mức của máy",
        "giaTri": "**8.600 L** *(nước tinh khiết đầu ra — cùng ngưỡng với lõi màng, xem `F-C17`)*",
        "nguon": "S1, S14",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-B07",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Công suất làm nóng",
        "giaTri": "**20 L/giờ**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B08",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Áp lực nước vào",
        "giaTri": "**0,1 – 0,4 MPa** (≈ 1–4 bar)",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B09",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Áp lực làm việc",
        "giaTri": "**0,4 – 0,9 MPa**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-B10",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Điện áp",
        "giaTri": "**220V ~ 50Hz**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B11",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Công suất định mức",
        "giaTri": "**2.100 W**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B12",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Mâm nhiệt",
        "giaTri": "**2.000 W**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-B13",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Cấp bảo vệ chống điện giật",
        "giaTri": "**Class I (Cấp I)** — bắt buộc ổ cắm có nối đất",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B14",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Nguồn nước áp dụng",
        "giaTri": "**Chỉ nước máy đô thị**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B15",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Nhiệt độ nước vào",
        "giaTri": "**5 – 38 °C**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B16",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Nhiệt độ môi trường",
        "giaTri": "**4 – 40 °C**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B17",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Tuổi thọ máy & linh kiện",
        "giaTri": "**khoảng 5 – 10 năm** trong điều kiện vận hành và bảo dưỡng đúng",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-B18",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Lỗ khoan lắp vòi",
        "giaTri": "**Ø30 mm**, cần mặt phẳng bán kính **3,8 cm** quanh lỗ",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-B19",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Yêu cầu khoang tủ (khảo sát)",
        "giaTri": "cao ≥ 550 mm, sâu ≥ 530 mm",
        "nguon": "BR",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🔵"
      },
      {
        "ma": "F-B20",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Khoảng hở quanh máy",
        "giaTri": "≥ 10 cm *(đọc từ hình deck NSX)*",
        "nguon": "S4",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🔵"
      },
      {
        "ma": "F-B21",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Thùng carton",
        "giaTri": "545 × 365 × 570 mm · CBM 0,1134",
        "nguon": "MD",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🔵"
      },
      {
        "ma": "F-B22",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Tỷ lệ thu hồi nước",
        "giaTri": "⚠️ **69%** (NSX) vs 77% (master) vs 76,8% (chatbot) vs ≥65% (V1.8)",
        "nguon": "S3/S6/MD",
        "hang": "",
        "hangGoc": "mâu thuẫn",
        "congBo": "🔴"
      },
      {
        "ma": "F-B23",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Hiệu suất nước",
        "giaTri": "**Mức 1 (cao nhất)** theo `GB 34914-2021`",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🟡"
      },
      {
        "ma": "F-B24",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Tiêu chuẩn sản xuất (bản TQ)",
        "giaTri": "`GB4706.1-2005` · `GB4706.19-2008` · `Q31/0112000854C015-2021-01`",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🔵"
      },
      {
        "ma": "F-B25",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Giấy phép vệ sinh (TQ)",
        "giaTri": "`(苏)卫水字(2021)第3200-0139号`",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🔵"
      },
      {
        "ma": "F-B26",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Chất lượng nước ra (bản TQ)",
        "giaTri": "đạt `CJ94-2005`",
        "nguon": "S2",
        "hang": "A",
        "hangGoc": "A−",
        "congBo": "🔵"
      },
      {
        "ma": "F-B27",
        "nhom": "B",
        "tenNhom": "THÔNG SỐ KỸ THUẬT",
        "duKien": "Thải bỏ",
        "giaTri": "Ký hiệu **WEEE** — không thải cùng rác sinh hoạt trong EU",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-C01",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Số lõi / số bước",
        "giaTri": "**2 lõi — 4 bước lọc**",
        "nguon": "S1, S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C02",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Kiểu máy",
        "giaTri": "**Tankless** — không có bình chứa nước lọc kiểu RO truyền thống",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C03",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi 1 (lõi **dưới**) — cấu tạo",
        "giaTri": "Lõi composite tích hợp **Polypropylene + Sợi carbon + Carbon Block** (`一体式聚丙烯炭纤维炭棒复合滤芯`). **Chứa lớp 1, lớp 2 VÀ lớp 4** — xem `F-C28`",
        "nguon": "S1, S13",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C04",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi 1 — chức năng",
        "giaTri": "Loại bỏ **cặn lắng, rỉ sét, hạt lơ lửng**; hấp phụ **clo dư và mùi khó chịu**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C05",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi 2 (lõi **trên**) — cấu tạo",
        "giaTri": "Lõi composite tích hợp **màng lọc nano** (`一体式纳滤复合滤芯`). **Chứa lớp 3**",
        "nguon": "S1, S13",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C06",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi 2 — chức năng",
        "giaTri": "Giảm **kim loại nặng** (chì, asen, cadimi), **vi khuẩn** (E. coli), **chất hữu cơ** (tricloromethane, carbon tetraclorua) — đồng thời **giữ lại khoáng chất có lợi**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C07",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Kích thước lỗ lọc màng nano",
        "giaTri": "**0,001 µm**",
        "nguon": "S9",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🟡"
      },
      {
        "ma": "F-C08",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Công nghệ màng",
        "giaTri": "**G+荷电纳滤 — màng lọc nano tích điện**, bảng so sánh với UF (thế hệ 1.0) và RO (thế hệ 2.0)",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-C09",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "So sánh công nghệ (NSX)",
        "giaTri": "Nano tích điện chặn được **cả kim loại nặng và cặn vôi như RO**, nhưng **giữ khoáng có lợi** (RO loại bỏ)",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-C10",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "8 khoáng giữ lại",
        "giaTri": "Canxi · Magie · Natri · Kali · Kẽm · Selen · Stronti · Axit metasilicic (H₂SiO₃)",
        "nguon": "S9",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🟡"
      },
      {
        "ma": "F-C11",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Patent màng NF",
        "giaTri": "**US 7138058** — tra được trên Google Patents",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C12",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Chu kỳ thay lõi thô (HDSD)",
        "giaTri": "**6 ~ 12 tháng**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C13",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Chu kỳ thay lõi màng (HDSD)",
        "giaTri": "**24 ~ 36 tháng**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C14",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Chu kỳ thay lõi thô (GWT chốt)",
        "giaTri": "**12 tháng**",
        "nguon": "S9, DM",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C15",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Chu kỳ thay lõi màng (GWT chốt)",
        "giaTri": "**48 tháng**",
        "nguon": "S9, DM",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-C16",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Ngưỡng đếm lõi thô",
        "giaTri": "**360 ngày** / **10.200 L nước vào** / **6.630 L nước tinh khiết**",
        "nguon": "S6, DM",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-C17",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Ngưỡng đếm lõi màng",
        "giaTri": "**1.440 ngày** · **12.240 L nước ĐẦU VÀO** · **8.600 L nước tinh khiết ĐẦU RA** — ✅ GWT xác nhận 28/08/2026: hai con số là **hai đại lượng khác nhau**, không mâu thuẫn (70,3 %)",
        "nguon": "S6, DM, **S14**",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-C18",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Nguyên tắc đếm lõi",
        "giaTri": "**Điều kiện nào tới trước thì tính điều kiện đó** (thời gian **hoặc** số lít)",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-C19",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Cách máy tính số lít",
        "giaTri": "Tính theo **thời gian bơm chạy** × lưu lượng quy đổi (NF700G = 1,8 L/phút); lưu bộ nhớ mỗi 30 phút và sau mỗi lần tạo nước",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-C20",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Cảnh báo tuổi thọ lõi (HDSD)",
        "giaTri": "*\"Chất lượng nước có ảnh hưởng đáng kể đến tuổi thọ lõi… có thể ngắn hơn các chu kỳ ước tính nêu trên… **Dữ liệu trên chỉ mang tính tham khảo**.\"*",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C21",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Chỉ dùng cho gia đình",
        "giaTri": "HDSD ghi rõ: **không lắp ở nơi công cộng có mức tiêu thụ nước cao**; tuổi thọ lõi tính theo mức dùng hộ gia đình bình thường",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C22",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Dấu hiệu phải thay lõi",
        "giaTri": "① Chất lượng nước suy giảm, mùi vị kém · ② Lưu lượng giảm đáng kể (không do nước lạnh) · ③ Lõi tắc nghiêm trọng, không lấy được nước",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C23",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Cách phân biệt lõi nào hỏng",
        "giaTri": "**Mùi vị kém** → dấu hiệu của lõi carbon sau · **Không lấy được nước** → dấu hiệu lõi bị tắc",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C24",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi đã dùng",
        "giaTri": "**Không thể rửa hay tái chế**. Thải như chất thải rắn sinh hoạt, giao người có chuyên môn xử lý",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C25",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Lõi không chính hãng",
        "giaTri": "*\"Nếu máy hư hỏng do sử dụng lõi lọc không phải chính hãng GE, **dịch vụ bảo hành sẽ không được cung cấp**\"*",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C26",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Ống PE & đầu nối",
        "giaTri": "Là chi tiết lão hoá — khuyến nghị thay mỗi **24 tháng**, **tính phí theo giá thị trường**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-C27",
        "nhom": "C",
        "tenNhom": "CẤU HÌNH LỌC",
        "duKien": "Thiết kế rút lõi",
        "giaTri": "**Rút ngang** — thay lõi không phải kéo máy ra khỏi tủ",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-D01",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Đường nước chính",
        "giaTri": "Nước máy đô thị → van bi 3 ngã → van cấp nước vào → **bơm tăng áp** → lõi composite (tiền lọc) → **lõi màng nano** → TDS nước tinh khiết → tách 2 nhánh",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D02",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Nhánh nước thường",
        "giaTri": "van nước nhiệt độ phòng → **mô-đun tiệt trùng nội tuyến** → vòi",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D03",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Nhánh nước nóng",
        "giaTri": "van cấp nước bình nóng → **bình đun** → bơm ly tâm → vòi (kèm ống thông hơi)",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D04",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Nhánh xả",
        "giaTri": "van xả / van điện từ xả / van một chiều → **nước cô đặc** → thoát sàn",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D05",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "**Vị trí mô-đun tiệt trùng**",
        "giaTri": "Lắp **nối tiếp trên đường ống nước tinh khiết** chạy từ thân máy lên vòi. Đầu vào nối cổng nước tinh khiết của máy, đầu ra nối đoạn ống **gần vòi nhất**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D06",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Bộ chuyển nguồn",
        "giaTri": "Chuyển 220V AC → **24V/36V DC** (điện áp vận hành an toàn)",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D07",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Bơm tăng áp",
        "giaTri": "Tạo áp và môi trường vận hành ổn định cho màng lọc",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-D08",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Van điện từ cấp nước vào",
        "giaTri": "Đóng/mở nguồn nước thô",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-D09",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Van điện từ nước thải",
        "giaTri": "Điều khiển xả rửa bề mặt màng + lưu lượng hệ thống",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-D10",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Bo mạch điều khiển",
        "giaTri": "Hiển thị trạng thái + điều khiển toàn hệ thống, DC 24V",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-D11",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Cảm biến trên bo",
        "giaTri": "TDS nước tinh khiết · cảm biến mực nước · NTC1 (bình đun) · NTC2 (hơi nước) · cảm biến rò rỉ · rơ-le nhiệt bảo vệ chống đun cạn",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-D12",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Số mức cảm biến mực nước",
        "giaTri": "**4 mức**: thấp · trung · cao · tràn",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-D13",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Sai số cảm biến nhiệt",
        "giaTri": "±3 °C so với nhiệt độ cài",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-D14",
        "nhom": "D",
        "tenNhom": "SƠ ĐỒ HỆ THỐNG",
        "duKien": "Sai số hiển thị TDS",
        "giaTri": "0–10: ±2 · 10–50: ±5 · 50–100: ±10 · 100–200: ±20 · 200–300: ±30 · 300–500: ±50",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-E01",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "4 chế độ nước",
        "giaTri": "**Nhiệt độ phòng · 45 °C (WARM) · 85 °C (EX WARM) · 95 °C (HOT)**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E02",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "⛔ Mức 75 °C",
        "giaTri": "**KHÔNG TỒN TẠI** — máy không có mức này",
        "nguon": "S1, S2, S3, S6, BR",
        "hang": "X",
        "hangGoc": "**X**",
        "congBo": "🔴"
      },
      {
        "ma": "F-E03",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Cách đổi nhiệt độ cài sẵn",
        "giaTri": "Giữ đồng thời **LOCK + nút cần đặt trong 3 giây**. Khi chọn 1 mức, 2 nút còn lại tạm vô hiệu hoá",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E04",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Cách lấy nước nóng",
        "giaTri": "**2 bước**: chạm **LOCK** → chạm nút nhiệt độ",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E05",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Cách lấy nước thường",
        "giaTri": "Chạm 1 nút, **không cần mở khoá**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E06",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Khoá trẻ em — đèn báo",
        "giaTri": "Đèn **tắt** = đã mở khoá · **sáng trắng** = đang khoá",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E07",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Khoá trẻ em — tự khoá lại",
        "giaTri": "Tự khoá lại sau **5 giây** không thao tác, hoặc sau khi lấy nước xong",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-E08",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Phạm vi khoá trẻ em",
        "giaTri": "Khoá **chỉ chặn nước nóng**; các nút khác vẫn dùng bình thường",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-E09",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Điều khiển tự động",
        "giaTri": "Đóng vòi → máy tự dừng. Bề mặt màng **tự làm sạch và xả rửa theo lịch**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E10",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Chu kỳ xả rửa tự động",
        "giaTri": "Bật nguồn: xả 30 giây · **mỗi 24 giờ**: xả 30 giây · sau **>4 giờ** không tạo nước: xả không áp 15 giây",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-E11",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Chức năng không đọng nước",
        "giaTri": "Khi lâu không dùng, nước tinh khiết tồn trong lõi **tự động quay về lọc lại**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E12",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Nhắc thay lõi — 2 cấp",
        "giaTri": "Đèn **nháy đỏ** = sắp hết hạn (chuẩn bị lõi) → **đỏ liên tục** = phải thay",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E13",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Ngưỡng đèn nhắc lõi",
        "giaTri": "Xanh/trắng: tuổi thọ < 95% · Nháy đỏ: 95% ≤ tuổi thọ < 100% · Đỏ liên tục: ≥ 100%",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-E14",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Nhắc thay lõi — 3 kênh",
        "giaTri": "① đèn trên vòi · ② đèn trên thân máy · ③ **thông báo trên điện thoại**",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-E15",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Mô-đun tiệt trùng — nút UV",
        "giaTri": "Nút **\"UV\"** trên vòi. **Sáng trắng** = còn hạn · **nháy trắng** = sắp hết tuổi thọ",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E16",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Reset mô-đun tiệt trùng",
        "giaTri": "Mở khoá trẻ em → giữ đồng thời **\"WARM\" + \"UV\" 3 giây** → hiện `SA` + 1 tiếng bíp",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E17",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Xả bình nước nóng (\"Mỗi ngày tươi mới\")",
        "giaTri": "Chạm **LOCK** → chạm nút xả. Xả sạch nước tồn trong bình đun bằng 1 chạm",
        "nguon": "S1, S3",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E18",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Thay lõi tự làm được",
        "giaTri": "Xoay-và-khoá 2 bước: **thuận chiều kim đồng hồ** để lắp, **ngược chiều** để tháo. Reset bằng **giữ nút lõi 3 giây**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E19",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Xả rửa sau thay lõi",
        "giaTri": "Máy hiện **`C2`** → chạm nút nước thường → xả rửa **8 phút**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E20",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Xả rửa lần đầu sau lắp",
        "giaTri": "Máy hiện **`C1`** → chạm nút lấy nước → xả rửa **~16 phút**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E21",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Chế độ tiết kiệm điện (ECO)",
        "giaTri": "**3 giờ** không thao tác → máy tự vào chế độ **không giữ ấm**. Bấm nút để bật/tắt thủ công",
        "nguon": "S3, S6",
        "hang": "B",
        "hangGoc": "B/C",
        "congBo": "🟡"
      },
      {
        "ma": "F-E22",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Chế độ giữ ấm (không ECO)",
        "giaTri": "Giữ nước ở nhiệt độ cài; khi nguội **quá 5 °C** so với mức cài thì tự đun lại",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-E23",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Học điểm sôi theo vùng",
        "giaTri": "Máy **tự học điểm sôi địa phương**. Nếu nhiệt độ cài cao hơn điểm sôi tại chỗ, máy tự hạ về **điểm sôi − 2 °C**",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-E24",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Hiển thị nhiệt độ",
        "giaTri": "Màn hình vòi hiện **nhiệt độ nước nóng theo thời gian thực**. **Nháy** = đang gia nhiệt · **tắt** = không gia nhiệt",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E25",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Đèn trên thân máy",
        "giaTri": "Status: xanh = đang lọc / nháy chậm = đang xả rửa · NF & PCFB: xanh = bình thường, nháy đỏ = sắp hết, đỏ = phải thay · WiFi: xanh = đã kết nối, nháy chậm = chưa kết nối",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E26",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Vòi xoay",
        "giaTri": "**120° (±60°)**, thân vòi tròn cho phép xoay nhiều góc",
        "nguon": "S4",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-E27",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Chuẩn chống nước vòi",
        "giaTri": "**IPX4**",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-E28",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Bo mạch vòi",
        "giaTri": "**Phủ keo 100%** (灌胶), chống nước",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-E29",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Công nghệ mặt hiển thị",
        "giaTri": "**IMD (in-mould decoration)** — hiển thị rõ hơn, chống mài mòn tốt hơn",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-E30",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Tốc độ rót",
        "giaTri": "**100 ml nước nóng ≈ 2,8 giây** · **100 ml nước thường ≈ 3,3 giây**",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-E31",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Màu vòi",
        "giaTri": "**Đen** (`USH10-FAUCET-DEN`) và **Bạc** (`USH10-FAUCET-BAC`)",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-E32",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Khôi phục cài đặt gốc",
        "giaTri": "Giữ **ECO + nước thường 10 giây** → hiện `SC` + 1 tiếng bíp",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔴"
      },
      {
        "ma": "F-E33",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Cảm biến nhiệt Seiko",
        "giaTri": "❌ **KHÔNG CÓ NGUỒN** trong bất kỳ tài liệu nào",
        "nguon": "—",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔴"
      },
      {
        "ma": "F-E34",
        "nhom": "E",
        "tenNhom": "TÍNH NĂNG VẬN HÀNH",
        "duKien": "Hộp đun 1,8 L inox 316 chân không 2 lớp",
        "giaTri": "❌ **KHÔNG CÓ NGUỒN** — HDSD chỉ ghi \"Hot Tank\", không mô tả vật liệu hay dung tích",
        "nguon": "—",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔴"
      },
      {
        "ma": "F-F01",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Công nghệ kết nối",
        "giaTri": "IoT **Wifi-Combo** (Bluetooth ghép nối + Wi-Fi nhà)",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-F02",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Tên ứng dụng",
        "giaTri": "**G+ Life APP**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-F03",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Quy trình ghép nối (7 bước)",
        "giaTri": "① bật Bluetooth + kết nối Wi-Fi nhà → ② quét QR trên máy tải app → ③ đăng ký bằng SĐT + mã xác minh → ④ bấm \"Add Device\" → ⑤ **giữ nút trên máy 3 giây** vào chế độ ghép nối → ⑥ nhập mật khẩu Wi-Fi → ⑦ bấm \"Getting Started\"",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-F04",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Đèn Wi-Fi trên máy",
        "giaTri": "Sáng liên tục = đã kết nối · Nháy nhanh (2 lần/giây) = đang ghép nối · Nháy chậm (1 lần/2 giây) = chưa kết nối / ghép nối thất bại",
        "nguon": "S1, S6",
        "hang": "A",
        "hangGoc": "A/C",
        "congBo": "🟢"
      },
      {
        "ma": "F-F05",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Ghép nối lại",
        "giaTri": "Giữ nút Wi-Fi **3 giây** để huỷ liên kết và ghép nối lại",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-F06",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Sau khi ghép nối thất bại",
        "giaTri": "Nháy chậm **3 phút** rồi tắt",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🔵"
      },
      {
        "ma": "F-F07",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Chức năng theo dõi từ xa",
        "giaTri": "Giám sát tuổi thọ lõi theo **%** (ví dụ hiển thị 99% / 90% từng cấp lõi), giám sát chất lượng nước, điều khiển từ xa",
        "nguon": "S3",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-F08",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Hẹn giờ đun",
        "giaTri": "Nhận lệnh hẹn giờ từ app; máy bắt đầu đun **trước giờ hẹn 5 phút** nếu nước đang nguội hơn mức cài",
        "nguon": "S6",
        "hang": "C",
        "hangGoc": "C",
        "congBo": "🟡"
      },
      {
        "ma": "F-F09",
        "nhom": "F",
        "tenNhom": "KẾT NỐI & ỨNG DỤNG",
        "duKien": "Cảnh báo rò rỉ qua app",
        "giaTri": "Có",
        "nguon": "S9",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🟡"
      },
      {
        "ma": "F-G01",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "Bảo hành toàn máy",
        "giaTri": "**12 tháng**, tính từ ngày hoá đơn / ngày lắp đặt / chứng từ hợp pháp",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-G02",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "Bảo hành bơm + bo mạch",
        "giaTri": "**5 năm** — chính sách riêng GWT",
        "nguon": "S9",
        "hang": "D",
        "hangGoc": "D",
        "congBo": "🟡"
      },
      {
        "ma": "F-G03",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "⛔ Bộ phận KHÔNG bảo hành",
        "giaTri": "① **Vật liệu lọc** · ② **Đèn diệt khuẩn tia cực tím** · ③ Chi tiết hao mòn (vòng đệm kín) · ④ Vỏ trang trí & lớp phủ bề mặt · ⑤ **Bộ chuyển nguồn (adapter)**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-G04",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "⛔ Nguyên nhân KHÔNG bảo hành",
        "giaTri": "① Lắp/dùng/bảo quản sai HDSD · ② Tự tháo dỡ hoặc sửa đổi · ③ **Dùng phụ kiện hoặc lõi không chính hãng** · ④ Ngoại lực & áp suất vượt giới hạn · ⑤ Bất khả kháng (chiến tranh, thiên tai) · ⑥ Hư hỏng khác do người dùng",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-G05",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "Hồ sơ cần giữ",
        "giaTri": "**Phiếu bảo hành + hoá đơn gốc**",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-G06",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "Giới hạn trách nhiệm",
        "giaTri": "Công ty không đưa ra bảo đảm nào khác và không chịu trách nhiệm về thiệt hại phát sinh do thiết bị bị lỗi",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-G07",
        "nhom": "G",
        "tenNhom": "BẢO HÀNH",
        "duKien": "Áp dụng chung",
        "giaTri": "Cùng chính sách cho `GTUN-8600VNHP` và `GCUN-02VNT01`",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-H01",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Giá niêm yết máy",
        "giaTri": "**44.950.000 đ** (kênh `NIEM_YET`, hiệu lực 29/07/2026)",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-H02",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Giá lõi thô",
        "giaTri": "**2.750.000 đ**",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-H03",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Giá lõi màng",
        "giaTri": "**7.500.000 đ**",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟡"
      },
      {
        "ma": "F-H04",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Giá lõi thô đã bán thực tế",
        "giaTri": "6 bộ, trung bình **2.050.000 đ** (05–08/2026, chỉ HN + HCM)",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-H05",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Chi phí 5 năm (ước tính)",
        "giaTri": "~**58 – 63 triệu** cho hộ 4 người (~6 L/ngày) ≈ **32 – 35 nghìn/ngày**",
        "nguon": "E",
        "hang": "E",
        "hangGoc": "**E**",
        "congBo": "🟡"
      },
      {
        "ma": "F-H06",
        "nhom": "H",
        "tenNhom": "GIÁ & CHI PHÍ",
        "duKien": "Giá thực tế đã bán",
        "giaTri": "**60 – 85% giá niêm yết** trên 12/12 đơn. **Chưa từng bán ở giá niêm yết**",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔵"
      },
      {
        "ma": "F-I01",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV Rheinland — số hiệu (ID Certipedia)",
        "giaTri": "✅ **`1111279087`** — tra Certipedia ra **General Water Technology (Shanghai) Co., Ltd.** · ❌ `1111297087` trong `Thông tin chi tiết TUV.pdf` là **lỗi chép số** — ID đó thuộc **HP Inc. (laptop)**",
        "nguon": "S9, **S15**",
        "hang": "A",
        "hangGoc": "**A**",
        "congBo": "🔵"
      },
      {
        "ma": "F-I02",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — số chứng chỉ",
        "giaTri": "`Q 50613617 001`",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-I03",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — số báo cáo",
        "giaTri": "`CN24W0C5 001`",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-I04",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — model được chứng nhận",
        "giaTri": "**`GE-GEUT-50B04` và `GE-GTUN-8600HP`** → **bao gồm đúng USH10**",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-I05",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — phạm vi",
        "giaTri": "**57 thử nghiệm**; chứng nhận **\"Hygienic Property\" (đặc tính vệ sinh)**",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-I06",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — nội dung vật liệu",
        "giaTri": "Vật liệu panel, ống nước, bể chứa, thân bơm đạt **19 chỉ tiêu hoà tan kim loại nặng theo EN 14350** (tiêu chuẩn EU cho **dụng cụ uống của trẻ em**) + vật liệu cấp thực phẩm EU + **12 yêu cầu LFGB (Đức)**",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-I07",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — nội dung vi sinh",
        "giaTri": "Theo `DIN EN 16889`: kiểm **E. coli, Staphylococcus aureus, Pseudomonas aeruginosa** bên trong máy **sau thời gian dùng dài** — kết quả vẫn giữ sạch",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟢"
      },
      {
        "ma": "F-I08",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "TÜV — không phát hiện",
        "giaTri": "Không bisphenol A (BPA), không chất làm dẻo, không melamine, không formaldehyde, không kim loại nặng",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-I09",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "File PDF chứng chỉ TÜV",
        "giaTri": "🔴 **CHƯA CÓ** — S5 là bản mô tả, không phải bản scan. 10/10 file chứng nhận trong thư mục Drive đều **0 byte**",
        "nguon": "—",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔵"
      },
      {
        "ma": "F-I10",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "SGS — diệt khuẩn 99,999%",
        "giaTri": "Số báo cáo `ASH18-029858-01`, **chưa có file**; phiếu SGS trong kho là của máy **50B04**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔴"
      },
      {
        "ma": "F-I11",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "LFGB (Đức)",
        "giaTri": "Có trong mô tả TÜV (12 yêu cầu kiểm), **chưa có chứng chỉ riêng**",
        "nguon": "S5",
        "hang": "B",
        "hangGoc": "B",
        "congBo": "🟡"
      },
      {
        "ma": "F-I12",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "VIETCERT",
        "giaTri": "Kiểm định nóng lạnh (CTS10 + USH10) — 🔴 file 0 byte",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔴"
      },
      {
        "ma": "F-I13",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "QCVN 6-1:2010/BYT",
        "giaTri": "🔴 **Phiếu thử rỗng ở mọi máy POU**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔴"
      },
      {
        "ma": "F-I14",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "Phiếu khoáng",
        "giaTri": "~40 phiếu của 20+ tỉnh **Trung Quốc** — **không có phiếu Việt Nam** cho máy POU",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "—",
        "congBo": "🔵"
      },
      {
        "ma": "F-I15",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "Mineral Map",
        "giaTri": "16 điểm đo thật tại VN — ⚠️ **là kết quả của hệ LỌC TỔNG (POE), KHÔNG phải USH10**",
        "nguon": "S9",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔴"
      },
      {
        "ma": "F-I16",
        "nhom": "I",
        "tenNhom": "CHỨNG NHẬN",
        "duKien": "**Trạng thái tra cứu công khai của TÜV** *(mới 28/08/2026)*",
        "giaTri": "🔴 Trang Certipedia của ID `1111279087` ghi *\"Currently no valid certificates are attached to this Certipedia ID\"*. **Tên nhà sản xuất hiện đúng, chứng chỉ KHÔNG hiện**",
        "nguon": "S15",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🔴"
      },
      {
        "ma": "F-J01",
        "nhom": "J",
        "tenNhom": "DANH MỤC ĐÓNG GÓI",
        "duKien": "Thân máy chính × 1 · Lõi lọc × 2 · Hộp phụ kiện × 1",
        "giaTri": "",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-J02",
        "nhom": "J",
        "tenNhom": "DANH MỤC ĐÓNG GÓI",
        "duKien": "Trong hộp phụ kiện: HDSD × 1 · **Vòi thông minh × 1** · Van bi cấp nước 3 ngã × 1 · Co nối 1/4\" × 2 · Co nối 3/8\" × 1 · Kẹp giữ ống 3/8\" × 1 · Kẹp giữ ống 1/4\" × 6 · Ống PE 3/8\" trắng × 1 · Ống PE 1/4\" trắng × 1 · Đầu nối 5/16\" × 1 · **Mô-đun tiệt trùng nội tuyến × 1**",
        "giaTri": "",
        "nguon": "S1",
        "hang": "A",
        "hangGoc": "A",
        "congBo": "🟢"
      },
      {
        "ma": "F-K01",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Tổng máy đã bán",
        "giaTri": "**12 máy** · doanh thu 272.227.500 đ · 11/12/2024 → 07/08/2026 (~0,6 máy/tháng)",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K02",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Nền lắp đặt",
        "giaTri": "**11 máy** / 476 máy toàn hệ thống (2,3%)",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K03",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Ticket sự cố USH10",
        "giaTri": "**0** trên tổng 91 ticket toàn hệ thống",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K04",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Máy đã hết bảo hành toàn máy",
        "giaTri": "**8 / 11**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K05",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Lõi thô đã bán thay",
        "giaTri": "**6 bộ**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K06",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Lõi màng đã bán thay",
        "giaTri": "**0 bộ**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K07",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Tồn kho máy",
        "giaTri": "**4 máy** (kho Nguyễn Xiển, 24/06/2026)",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K08",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Tồn kho lõi USH10",
        "giaTri": "🔴 **0**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K09",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Thị phần POU",
        "giaTri": "2025: **35% — #1 dòng POU** → 2026: **1,3% — hạng 9/9**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K10",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Kênh bán hiệu quả",
        "giaTri": "**KOL Dino 4/12 máy (33%)** và giữ giá cao nhất (85/80/70%). Cộng \"Giới thiệu\"/\"KTS\" → **8/12 máy từ quan hệ + KOL**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K11",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Địa bàn đã bán",
        "giaTri": "Chỉ **HCM (7) · Hà Nội (4) · Bắc Ninh (1)**",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-K12",
        "nhom": "K",
        "tenNhom": "DỮ LIỆU KINH DOANH",
        "duKien": "Case F&B thật",
        "giaTri": "**PIN Cafe** (33 Hàng Hòm) · **The Ghé Coffee** (Q1) — đã đo nước đầu ra",
        "nguon": "S9",
        "hang": "",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L01",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**8.600 L trên nhãn máy chính là ngưỡng lít của lõi màng.** Quy cách V1.8 ghi lõi NF bản 700G = 1.440 ngày / **8.600 L nước tinh khiết** — trùng khít con số *\"Tổng công suất lọc nước định mức = 8.600 L\"* trên HDSD",
        "giaTri": "",
        "nguon": "S1 + S6",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L02",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**Tỷ lệ 6.630 / 10.200 = đúng 65%** — khớp ghi chú *\"回收率 ≥65%\"* trong quy cách. Vậy 6.630 L là **nước tinh khiết**, 10.200 L là **nước vào** cho lõi thô",
        "giaTri": "",
        "nguon": "S6",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L03",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**12.240 L trong Danh mục hàng hoá là \"nước ĐẦU VÀO\" của lõi màng, không phải nước tinh khiết** (8.600 / 12.240 = 70,3%). Vậy 8.600 và 12.240 **không mâu thuẫn** — là 2 đại lượng khác nhau",
        "giaTri": "",
        "nguon": "S6 + DM",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L04",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**Hai ngưỡng của lõi màng được hiệu chỉnh quanh mức dùng ~6 L/ngày:** 8.600 L ÷ 6 L/ngày ≈ 1.433 ngày ≈ đúng ngưỡng 1.440 ngày",
        "giaTri": "",
        "nguon": "S6",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L05",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**Lõi thô luôn bị chặn bởi thời gian, không phải số lít.** 6.630 L ÷ 6 L/ngày ≈ 1.105 ngày, trong khi ngưỡng thời gian chỉ 360 ngày → hộ gia đình bình thường **luôn** chạm mốc 360 ngày trước",
        "giaTri": "",
        "nguon": "S6",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L06",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**2,1 L/phút và \"2,8 giây/100 ml\" là cùng một con số.** 100 ml ÷ 2,1 L/phút = 2,86 giây. Tương tự 1,8 L/phút → 3,33 giây/100 ml. Hai số liệu nhất quán → độ tin cậy của nguồn S3 cao",
        "giaTri": "",
        "nguon": "S3",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-L07",
        "nhom": "L",
        "tenNhom": "SUY LUẬN SỐ HỌC",
        "duKien": "**\"20 L/giờ\" và \"2,1 L/phút\" không mâu thuẫn.** 2,1 L/phút là **tốc độ rót** từ bình đun (đợt ngắn); 20 L/giờ là **năng suất đun bền vững** (0,33 L/phút). Rót nhanh nhưng không rót liên tục vô hạn được",
        "giaTri": "",
        "nguon": "S1 + S3",
        "hang": "E",
        "hangGoc": "",
        "congBo": "🔵"
      },
      {
        "ma": "F-M01",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**Mức nhiệt 75 °C**",
        "giaTri": "Nước thường · 45 · 85 · 95 (`F-E01`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M02",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**Áp lực nước vào \"0–0,4 MPa\"**",
        "giaTri": "**0,1–0,4 MPa** (`F-B08`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M03",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**Công suất \"2.000–2.400 W\"**",
        "giaTri": "**2.100 W** (`F-B11`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M04",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**Điện áp \"220–240V\"**",
        "giaTri": "**220V ~ 50Hz** (`F-B10`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M05",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"USH10 là máy để bàn\"**",
        "giaTri": "**Âm tủ bếp** (`F-A06`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M06",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"Diệt khuẩn 99,999%\"**",
        "giaTri": "⛔ Không có bằng chứng — không thay thế bằng số nào",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M07",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"Tỷ lệ thu hồi nước cao nhất hiện nay\"**",
        "giaTri": "⛔ Bỏ hẳn — cấm superlative",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M08",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**Công dụng y tế từng khoáng**",
        "giaTri": "⛔ Bỏ hẳn (**Phần 2** mục 3)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M09",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"Nước nóng ra sau 2,8 giây\"**",
        "giaTri": "**\"~2,8 giây cho 100 ml nước nóng\"** (`F-E30`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M10",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"Chế độ tiết kiệm điện giữ ấm 2 giờ\"**",
        "giaTri": "**3 giờ** (`F-E21`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      },
      {
        "ma": "F-M11",
        "nhom": "M",
        "tenNhom": "DỮ KIỆN ĐÃ XÁC ĐỊNH SAI — PHẢI GỠ",
        "duKien": "**\"USH10 thường hết hàng\"**",
        "giaTri": "Kiểm tra `wh_master` trước khi trả lời (`F-K07`)",
        "nguon": "",
        "hang": "X",
        "hangGoc": "",
        "congBo": "🔴"
      }
    ]
  }
];

export const TAI_LIEU: KhuTaiLieu[] = [
  {
    "khu": "cong-viec-chung",
    "bai": [
      {
        "slug": "van-hoa-lam-viec",
        "tieuDe": "Văn hoá & nguyên tắc làm việc",
        "hang": "A",
        "nhom": "",
        "nguon": "Quy định công ty · gom từ 4 nguồn nội bộ",
        "thuTu": 1,
        "noiDung": "# Văn hoá & nguyên tắc làm việc tại GWT\n\n> **Tinh gọn · Chuyên nghiệp · Có trách nhiệm**\n>\n> 📌 **Đây là chỗ duy nhất của mọi nguyên tắc làm việc chung.** Trước đây nội dung này nằm\n> rải ở 4 tài liệu khác nhau (xem `nguon` ở đầu file) nên mỗi người đọc một bản.\n> Về sau có nguyên tắc mới thì **thêm vào đây**, đừng mở file mới.\n\n## Bảy nguyên tắc — đọc thuộc\n\n| | Nguyên tắc |\n|---|---|\n| ⏰ | **Đúng giờ là mặc định** |\n| 🧹 | **Gọn gàng từ chỗ ngồi đến file** |\n| ✅ | **Đã nói là làm** |\n| 📏 | **Chỉn chu — trọn vẹn** |\n| 📵 | **Không nhắn riêng công việc** |\n| 📢 | **Luôn cập nhật, không để ai phải hỏi** |\n| 🎯 | **Deadline & KPI không phải để trang trí** |\n\n---\n\n## ⏰ 1. Đúng giờ là mặc định\n\n- Luôn đúng giờ làm việc, họp, call, gặp đối tác hay đồng đội.\n- **\"Đúng giờ\" nghĩa là có mặt trước 5–15 phút** để chuẩn bị — không đến sát giờ mới xoay.\n\n**Chấm công & giờ giấc**\n- Đi làm **chấm công đầy đủ** — công ty tính lương theo chấm công. Làm ở nhà cũng\n  **check-in/check-out như bình thường**.\n- Chủ động báo giờ giấc / kế hoạch đi học **sớm nhất, rõ ràng, rành mạch**; có thay đổi thì\n  sát ngày báo lại. Xin nghỉ cũng báo sớm (trừ khẩn cấp).\n- Làm ở nhà thì **luôn vào sẵn voice channel cá nhân** để quản lý mở kênh khi cần — đừng để\n  gọi mới vào.\n\n---\n\n## 🧹 2. Gọn gàng từ chỗ ngồi đến file\n\n- Bàn làm việc sạch, văn phòng thơm, ngăn nắp — là tôn trọng bản thân và team.\n- File, folder, tài liệu chung phải sắp xếp rõ ràng, **đúng cấu trúc**. Chưa có hướng dẫn thì\n  chủ động sắp xếp hợp lý, không đợi nhắc.\n- Dùng mail AI / mail công ty phải **để file vào đúng folder**, không để loạn folder.\n  → Cây folder chuẩn: [Danh mục folder Drive](/wiki/cong-viec-chung/danh-muc-folder-drive)\n\n**Quy chuẩn làm file**\n- **Excel — cột STT:** dùng `=ROW()` trừ số để về 1 rồi kéo xuống (ô A2 cần số 1 →\n  `=ROW(B2)-1`). Thêm/xoá/kéo hàng không phải sửa tay STT.\n- **Excel — định dạng:** font **Calibri**, căn **giữa ô (Middle)** — không nhầm với Center.\n\n---\n\n## ✅ 3. Đã nói là làm\n\n- Cam kết deadline, KPI, lịch làm việc — là giữ lời.\n- Ưu tiên **làm cho xong, dứt điểm**, tránh kéo dài.\n- Nhận task nào thì **có trách nhiệm đến cùng**: chủ động update, báo cáo, hỏi ý kiến,\n  đề xuất cải thiện.\n- Mỗi người phụ trách **chính một mảng** để tập trung; làm trọn vẹn và thật tốt một mảng\n  rồi mới chuyển mảng khác.\n\n---\n\n## 📏 4. Chỉn chu — trọn vẹn\n\n- Tự quản lý bản thân, tuân thủ quy trình team và công ty.\n- Làm việc gì cũng phải hiểu rõ: **logic, quy chuẩn, nguyên tắc**.\n- Giao việc phải trọn vẹn, chỉn chu, **không lỗi cơ bản** (chính tả, trình bày, giao tiếp).\n- **Không viết tắt** trong tài liệu và tin nhắn công việc (ví dụ đừng viết \"ND\" thay cho\n  \"nội dung\").\n\n---\n\n## 📵 5. Không nhắn riêng công việc\n\n> **Một trong những thói quen làm việc của công ty là LUÔN NHẮN TIN TRONG NHÓM.**\n\n**Nguyên tắc gốc:** việc chung → nói chỗ chung. Cần thì tạo group mới.\n⛔ **Tuyệt đối không nhắn riêng về việc chung** — ngoại lệ duy nhất là **OTP và mật khẩu**.\n\n### 5.1. Việc nội bộ trong công ty\n\nNhắn trên **Discord** và các nhóm liên quan. Không nhắn riêng.\n\n- **Giao việc:** nhắn vào nhóm có từng người để quản lý theo dõi được.\n- **Nội dung training chung:** nhắn ở **kênh chung**.\n- Giao việc cho người khác thì **hỏi quản lý trước** và **báo lại** sau.\n\n### 5.2. Với đối tác / freelancer\n\n1. **Tạo nhóm** — add chị và mọi người liên quan vào. Không làm việc qua tin nhắn riêng.\n2. **Nếu bên kia cứ nhắn riêng** → nói khéo mời họ nhắn vào nhóm, để bên mình mọi người\n   cùng nắm. Ví dụ: *\"Dạ anh/chị nhắn giúp em vào nhóm chung với ạ, để cả team bên em cùng\n   theo dõi và hỗ trợ nhanh hơn.\"*\n\n### 5.3. Ngoại lệ — khi nào chấp nhận nhắn riêng\n\nĐối tác là **sếp lớn, quan chức, người nổi tiếng** — người cần giữ quan hệ khéo léo. Họ nhắn\nriêng thì **cứ tiếp**, nhưng **phải báo lại để chị biết**.\n\n> 🔑 Cốt lõi: không phải cấm nhắn riêng để cứng nhắc, mà để **không ai giữ thông tin một\n> mình**. Người nghỉ, người bận, người chuyển việc — thông tin nằm trong nhóm thì công việc\n> vẫn chạy; nằm trong tin nhắn riêng thì mất.\n\n### 5.4. Cách gửi tài liệu vào kênh cho người khác đọc\n\nTheo đúng 4 bước, đừng thả mỗi cái file vào:\n\n1. Tag `@everyone` (viết cách ra).\n2. Viết **một ví dụ minh hoạ ngay trong tin** (ảnh cũng được).\n3. Rồi mới gửi file đính kèm.\n4. **Bổ sung vào wiki.**\n\n---\n\n## 📢 6. Luôn cập nhật, không để ai phải hỏi\n\n- Việc liên quan đến **cấp trên, đối tác, khách hàng** → phải làm rõ **trước khi làm**.\n- Đang làm mà có vấn đề hoặc kéo dài → **báo tiến độ sớm**, không đợi xong mới nói.\n- Xong việc → **báo cáo rõ ràng** (nội dung + hình ảnh rõ nét nếu có).\n- **Cuối ngày:** trước khi về phải cập nhật miệng và cho quản lý xem sơ qua các file công\n  việc trong ngày để được hướng dẫn / điều chỉnh. Không về trước khi cập nhật xong — trừ khi\n  quản lý không có ở văn phòng và không gọi được.\n\n---\n\n## 🎯 7. Deadline & KPI không phải để trang trí\n\n- Đã đặt deadline/KPI thì **bám sát** — không trễ.\n- Cần lùi thì **báo trước đủ sớm** và có lý do hợp lý — không để \"nước đến chân mới nhảy\".\n\n---\n\n## Nguyên tắc riêng theo vai\n\nBảy nguyên tắc trên áp dụng cho **mọi người**. Ngoài ra từng vai có quy định riêng, nằm ở\ntài liệu của vai đó:\n\n| Vai | Xem ở |\n|---|---|\n| Sales · CSKH | Training Sales & CSKH § 12 — quy định trả lời khách, kiểm tin nhắn đa nền tảng, xử lý SĐT khách |\n| CTV trực Fanpage | Training CTV Fanpage § 3 — tone, thái độ, quy định phản hồi |\n| Nhân sự mới | Training Nhân sự mới — công cụ bắt buộc dùng, quy trình backoffice |\n\n---"
      },
      {
        "slug": "danh-muc-folder-drive",
        "tieuDe": "Danh mục folder Drive",
        "hang": "A",
        "nhom": "",
        "nguon": "Google Sheet nội bộ",
        "thuTu": 2,
        "noiDung": "# Danh mục folder Google Drive\n\n13 folder gốc trên Drive công ty. Đây là bản chép lại từ Sheet — **Sheet vẫn là bản gốc**,\nsửa thì sửa bên đó rồi chép lại.\n\n| # | Tên folder | Chứa gì |\n|---|---|---|\n| 00 | [GWT - FOLDER GỬI ĐỐI TÁC](https://drive.google.com/drive/folders/1XMcaIdvl7zY2vKJe8RNgn2oKt1pX1qGf) | Tài liệu sản phẩm gửi đối tác, đại lý |\n| 01 | [GWT SALES - BÁN HÀNG](https://drive.google.com/drive/folders/10x0xeonnIJghLpqOy3WrFRXLfS3mXsJx) | Tài liệu bán hàng: hợp đồng, báo giá, thông tin khách hàng |\n| 02 | [GWT PRODUCT - THÔNG TIN SẢN PHẨM](https://drive.google.com/drive/folders/1IEMqZxQfSqfaW8qFKCIs25unIlSGIp0e) | Tài liệu về sản phẩm: Manual, Catalog, Hướng dẫn sử dụng, Kiểm định, Thông số |\n| 03 | [GWT PURCHASE - NHẬP HÀNG](https://drive.google.com/drive/folders/1BDMESI8cWBFmg2WSq8DVcrcSQkNWhsQO) | Tài liệu nhập khẩu hàng từ công ty mẹ |\n| 04 | [GWT FINANCE - TÀI CHÍNH](https://drive.google.com/drive/folders/1Zr8f_PwvqWfmQIkFv-vt7naKdcrNgqLQ) | Tài liệu tài chính, kế toán |\n| 05 | [GWT HR - NHÂN SỰ](https://drive.google.com/drive/folders/12BeRrEGy4R0NChQutlpXbeBFxnsY502) | Tài liệu nhân sự, tuyển dụng |\n| 06 | [GWT MARKETING](https://drive.google.com/drive/folders/1UIjyqZ9vZizD2Z3HInA9wjuxJELQnmBm) | Tài liệu marketing: Facebook, Video, Hình ảnh, Kế hoạch |\n| 07 | [GWT SERVICE OPERATION - VẬN HÀNH BÁN HÀNG DỊCH VỤ](https://drive.google.com/drive/folders/1IDoQUsdZiZM40vcr_EWKc5CuX2nwG0jQ) | Tài liệu các hoạt động liên quan bán hàng: Chăm sóc khách hàng, Đơn hàng |\n| 08 | [GWT OFFICE - VẬN HÀNH BACK OFFICE](https://drive.google.com/drive/folders/12WU_yw2X6B9N70iF8-1PQ5VXGcMKEXO4) | Tài liệu vận hành back office: Tài sản công ty, thông tin |\n| 09 | [GWT STRATEGY - PLAN](https://drive.google.com/drive/folders/1jlXpYu4QgKJ7lsx-cvoRyTB2IN2P6jCO) | Tài liệu kế hoạch |\n| 10 | [GWT TECHNICAL - VẤN ĐỀ KỸ THUẬT](https://drive.google.com/drive/folders/1Kii1LmU6v2nuwrGW1daLA1nCkOThT-co) | Tài liệu kĩ thuật: Các phân tích, nghiên cứu, vấn đề về sản phẩm |\n| 11 | [GWT PURCHASE - MUA HÀNG TRONG NƯỚC](https://drive.google.com/drive/folders/1AEzE4DV5EU3J4FRaDtUucCZQSf8QWdqE) | Tài liệu mua hàng: báo giá, hợp đồng, hoá đơn, hình ảnh |\n| 12 | [GWT AI](https://drive.google.com/drive/folders/1jEd2l03DIwAMtcbckmJ4w6ZxMob7jwfi) | Tài liệu AI |\n\n> ⚠️ **Link Drive để nguyên trong file này là cố ý** — đây là tài liệu nội bộ nằm trong\n> `data/` (gitignore chặn). Nếu đưa lên wiki thì cân nhắc: link folder Drive lộ ra ngoài là\n> lộ cả cây thư mục công ty."
      },
      {
        "slug": "cong-cu-lam-viec",
        "tieuDe": "Công cụ làm việc",
        "hang": "A",
        "nhom": "",
        "nguon": "Quy định công ty · cập nhật 31/08/2026",
        "thuTu": 3,
        "noiDung": "# Công cụ làm việc\n\nBa công cụ chính. Dùng đúng công cụ cho đúng việc thì thông tin không thất lạc, không phân\ntán, và ai cũng theo dõi được.\n\n| Công cụ | Dùng để | Nguyên tắc một câu |\n|---|---|---|\n| 💬 **Discord** | Toàn bộ trao đổi, giao việc, báo cáo | Việc chung → nhắn **trong nhóm**, không nhắn riêng |\n| 📁 **Google Drive** | Lưu trữ và làm việc trên tài liệu | Làm **online**, đúng folder, đúng tên |\n| 📚 **Wiki nội bộ** | Tra quy trình, sản phẩm, luật phát ngôn | Tra ở đây trước khi hỏi người khác |\n\n> ⚠️ **Asana đã ngừng dùng.** Không tạo task, không cập nhật, không dẫn link Asana nữa.\n> Việc giao và theo dõi chuyển hết về **Discord**.\n\n---\n\n## 1. Discord — nơi mọi việc diễn ra\n\nChat công ty đã chuyển hẳn sang Discord. Nguyên tắc gốc nằm ở\n[Văn hoá & nguyên tắc làm việc](/wiki/cong-viec-chung/van-hoa-lam-viec) — mục *\"📵 Không\nnhắn riêng công việc\"*. Tóm tắt:\n\n- **Việc nội bộ** → nhắn trong Discord, đúng kênh / nhóm liên quan.\n- **Việc với đối tác, freelancer** → **tạo nhóm**, add quản lý và mọi người liên quan.\n- ⛔ **Không nhắn riêng về việc chung.** Ngoại lệ duy nhất: **OTP và mật khẩu**.\n\n### Báo cáo & xin ý kiến cấp trên\n\n| Việc | Làm thế nào |\n|---|---|\n| Báo cáo, xin ý kiến, update tiến độ | Nhắn **vào nhóm** và **tag rõ** người cần duyệt |\n| Đã cập nhật file trên Drive | **Vẫn phải nhắn báo** — Drive không bắn thông báo, cấp trên không biết có thay đổi |\n| Nhắn 1 ngày chưa ai phản hồi | **Nhắc lại** — đừng im rồi coi như đã báo |\n| Làm ở nhà | **Vào sẵn voice channel cá nhân** để quản lý mở kênh khi cần |\n\n⛔ **Không** thả tin vào nhóm đông người mà **không tag ai** — tin trôi, coi như chưa báo.\n⛔ **Không** chỉ gửi email rồi coi là đã thông báo.\n\n### Gửi tài liệu vào kênh cho người khác đọc\n\nTheo đúng 4 bước, đừng thả mỗi cái file vào:\n\n1. Tag `@everyone` (viết cách ra).\n2. Viết **một ví dụ minh hoạ ngay trong tin** — ảnh cũng được.\n3. Rồi mới gửi file đính kèm.\n4. **Bổ sung vào wiki.**\n\n---\n\n## 2. Google Drive — lưu trữ và làm việc\n\n### 2.1. Nguyên tắc chung\n\n- Mọi tài liệu làm việc đều làm **online trên Drive** — ⛔ tuyệt đối không dùng file offline.\n- File phải nằm **đúng folder chung của bộ phận**. Thiếu folder thì báo quản lý tạo, đừng\n  tự để chỗ khác.\n- Chỉ **file nháp cá nhân** (không gửi cho ai) mới được để ngoài folder chung.\n- Trước khi gửi link cho người khác: kiểm tra file **đã đúng chỗ** và **đã mở quyền** cho\n  người liên quan.\n\n→ Cây folder chuẩn của công ty: [Danh mục folder Drive](/wiki/cong-viec-chung/danh-muc-folder-drive)\n\n### 2.2. Đặt tên — quy ước bắt buộc\n\n| Loại | Cú pháp | Ví dụ |\n|---|---|---|\n| Folder / file thường | `TT. TÊN FILE` | `01. Sản phẩm lọc nước GN610` |\n| Có nhiều phiên bản | `TÊN FILE_YYYYMMDD` | `Báo giá_WH30A_20250612` |\n| Folder khách hàng | `Tên khách_Khu vực_SKU` | `NguyenVanA_Vinhomes HN_WH30A` |\n\n- `TT` = số thứ tự trong folder, **2 chữ số**. Riêng **folder khách hàng dùng 3 chữ số**\n  (`001`).\n- `TÊN FILE` phải nói đúng nội dung / sản phẩm / khách hàng để tìm được bằng ô tìm kiếm.\n- Khu vực: ghi `HN` / `HCM`, tỉnh khác thì ghi tên thành phố.\n\n### 2.3. File cũ & tránh trùng lặp\n\n- File không dùng nữa nhưng vẫn cần giữ → chuyển vào folder con **`Archived`** cùng thư mục.\n- ⛔ **Không tạo bản sao.** Cần file hiện ở nhiều nơi thì dùng **Add Shortcut**.\n\n### 2.4. Dung lượng\n\nDrive công ty giới hạn **30 GB/người × số tài khoản** (7 người → 210 GB). Nên:\n\n- ⛔ Không tải lên file nháp, file tải từ **DingTalk của GWT China** — thứ đó xin lại được.\n- ✅ File làm việc quan trọng tại Việt Nam **phải nằm trên Drive domain `@gwt.vn`**.\n- 🎬 **Video marketing nặng**: backup ít nhất **2 nơi** — ổ cứng nội bộ + một nền tảng\n  online khác. Tạm thời **không tải hết lên Drive** để khỏi vượt dung lượng.\n\n---\n\n## 3. Wiki nội bộ\n\nChỗ anh/chị đang đọc. Tra ở đây **trước khi hỏi người khác** — quy trình, kiến thức sản\nphẩm, và **luật được nói gì với khách**.\n\nĐặc biệt: mọi con số nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**\n(khu *Sản phẩm*). Không có mã thì không được nói."
      }
    ]
  },
  {
    "khu": "cskh",
    "bai": [
      {
        "slug": "training-ctv-fanpage",
        "tieuDe": "Training CTV trực Fanpage",
        "hang": "C",
        "nhom": "",
        "nguon": "Tài liệu đào tạo nội bộ",
        "thuTu": 1,
        "noiDung": "# Training CTV trực Fanpage — GWT\n\nTài liệu hướng dẫn cộng tác viên (CTV) mới trực và trả lời tin nhắn Fanpage / kênh chat cho khách của GWT (thương hiệu máy lọc nước GE): cách trả lời từng loại câu hỏi, kiến thức sản phẩm cần dùng, tone giọng, và khi nào chuyển cấp trên. Đối tượng: CTV mới, chưa quen sản phẩm và quy trình.\n\n> Tổng hợp tự động từ kênh Discord minh-ánh-ctv-fanpage, dữ liệu tới 11/08/2026. Đã lược bỏ thông tin đăng nhập & dữ liệu cá nhân. Bản nháp — cần người phụ trách rà soát.\n\n## Mục lục\n\n1. [Quy trình trực fanpage & Botcake/Pancake](#1-quy-trinh-truc-fanpage-botcake-pancake)\n2. [Kênh, công cụ & lệnh tắt](#2-kenh-cong-cu-lenh-tat)\n3. [Tone, thái độ & quy định phản hồi](#3-tone-thai-do-quy-dinh-phan-hoi)\n4. [Khi nào tự trả lời — khi nào hỏi / chuyển cấp trên](#4-khi-nao-tu-tra-loi-khi-nao-hoi-chuyen-cap-tren)\n5. [Lấy thông tin khách & chuyển sales / kỹ thuật](#5-lay-thong-tin-khach-chuyen-sales-ky-thuat)\n6. [Kiến thức sản phẩm — máy lọc nước uống (POU)](#6-kien-thuc-san-pham-may-loc-nuoc-uong-pou)\n7. [Kiến thức sản phẩm — hệ lọc tổng (POE)](#7-kien-thuc-san-pham-he-loc-tong-poe)\n8. [Lõi lọc, muối, bình gas, bảo hành](#8-loi-loc-muoi-binh-gas-bao-hanh)\n9. [Chính sách giá, quà, chiết khấu, lắp đặt, showroom](#9-chinh-sach-gia-qua-chiet-khau-lap-dat-showroom)\n10. [Ngân hàng câu hỏi → trả lời mẫu](#10-ngan-hang-cau-hoi-tra-loi-mau)\n11. [Bài học từ các lần được sửa (nên / không nên)](#11-bai-hoc-tu-cac-lan-duoc-sua-nen-khong-nen)\n12. [Kịch bản hotline CSKH](#12-kich-ban-hotline-cskh)\n13. [Link tài nguyên nội bộ](#13-link-tai-nguyen-noi-bo)\n\n---\n\n## 1. Quy trình trực fanpage & Botcake/Pancake\n\nCác bước cơ bản của một ca trực:\n\n1. **Check-in vào ca**: nhắn vào nhóm khi bắt đầu ca.\n2. **Rà tin nhắn ca trước**: đầu ca phải xem lại toàn bộ tin nhắn của ca trước, kể cả tin **chưa được rep**. Ca trước sót mà ca này không rep thì mình cũng bị liên quan. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1485109508887019652)\n3. **Trả lời khách** trên Pancake, check đủ mọi kênh: Facebook, Zalo, Shopee, Instagram, TikTok.\n4. **Cuối ca**: check lại tin nhắn sót, báo cáo công việc trong ca.\n\n**Botcake / AI đã trả lời rồi vẫn phải gửi lại tin của mình.** Tin của AI/Botcake thường không cung cấp đủ thông tin như tin mình soạn. AI hiện tại chỉ viết lại câu cho hay, còn kiến thức thì chưa chuẩn — không được tin tưởng hoàn toàn. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1485112411513028689)\n\n**Nếu Pancake gửi không được thì vào thẳng Fanpage rep trực tiếp ở phần tin nhắn.** Nhìn ảnh avatar ở góc dưới bên trái màn hình để biết tin nhắn đang ở fanpage nào. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1486911310817136811)\n\n**Tốc độ**: không để khách chờ quá lâu (nhiều lần bị nhắc vì khách chờ hơn 1 tiếng chưa được rep). Ca ít tin cũng phải chủ động kiểm tra thường xuyên, tránh sót khách. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1505778091786502215)\n\nNếu lên công ty theo tuần: chủ động nhắn lịch vào nhóm từ cuối tuần / đầu tuần trước, kể cả tuần không lên cũng phải báo.\n\n---\n\n## 2. Kênh, công cụ & lệnh tắt\n\n**Các kênh chat khách** gom về Pancake: Facebook (Fanpage lọc nước uống, Fanpage Hệ thống lọc tổng), Zalo (OA, Business, Care), Shopee, Instagram, TikTok.\n\n**Zalo & hotline chính thức của công ty** (dùng để tư vấn / CSKH khách):\n- Tổng đài hotline: **1900 3363** (số gọi ra hiển thị cho khách là số cố định đầu **024x**, KHÔNG phải 1900).\n- Zalo **GE Water Business** — dùng để tư vấn thông tin sản phẩm.\n- Zalo **GE Water Care** — dùng để chăm sóc khách trong quá trình sử dụng.\n- Hotline có **số 0** (chăm sóc khách hàng) và **số 1** (sales). Khách gọi nhầm số 0 mà cần mua/tư vấn → chuyển line sang số 1.\n\n**Lệnh tắt (snippet) trong Pancake** — gõ `/` để chèn câu mẫu:\n\n| Lệnh | Dùng khi | Lưu ý |\n| --- | --- | --- |\n| `/whpromo` | (khuyến mãi lọc tổng) | **KHÔNG dùng** — hiện không có promo lọc tổng. Phải bấm mũi tên chọn đúng bộ, nếu không nó gửi cả 4 tin. Chỉ lưu lại để sau này có chương trình. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1493987027429883976) |\n| `/sanxuat` | khách hỏi về sản xuất | [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1492767430400020632) |\n| `/livestream` | gửi thông báo livestream/megalive cho khách tiềm năng | |\n\nTài khoản dùng cho công việc (Pancake, ChatGPT CSKH, các phần mềm) đều **dùng tài khoản nội bộ do quản lý cấp** — không tự tạo, không dùng tài khoản cá nhân.\n\n**Shopee — lưu ý riêng:** không được gửi số điện thoại / link nền tảng khác qua chat Shopee, Shopee sẽ chặn không cho gửi (không khóa tài khoản, chỉ chặn tin). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1494691351676190812)\n\n---\n\n## 3. Tone, thái độ & quy định phản hồi\n\n- **Xưng hô**: mình xưng **\"em\"**, gọi khách **\"anh/chị\"**. (AI hay xưng \"chị – mình\" là SAI, phải sửa.) [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1508037186665185420)\n- **Cú pháp lịch sự**: luôn có \"Dạ / Vâng … ạ\". Ví dụ: *\"Vâng em nhận thông tin ạ\"*, *\"Vâng mẫu máy nào cũng … ạ\"*. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484563181518065725)\n- **Không trả lời cụt lủn.** Câu trả lời phải đủ ý, có \"dạ/ạ\", và phải hiểu tâm trạng khách (nhất là khi khách đang bực). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1530892147539185715)\n- **Ghi tên khách đúng**: sửa \"anh/chị\" thành đúng \"anh\" hoặc \"chị\", và ghi **tên** khách (chỉ tên, không ghi cả họ).\n- **Câu trả lời tự soạn nhanh không dùng ngay** — nên đưa qua AI (ChatGPT CSKH) viết lại cho ngắn gọn, súc tích rồi mới gửi khách. Câu kỹ thuật đúng nhưng dài dòng thì khách sẽ không đọc. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1488541197617201205)\n- **Công thức trả lời khi khách đã tìm hiểu trước**: \"Dạ đúng rồi ạ\" → bổ sung 1–2 ý quan trọng → dẫn về nhu cầu của khách.\n- **Tin nhắn nhạy cảm (tiền nong, phí ship, phí lắp)**: tuyệt đối không trả lời ẩu. Trả lời sai đến lúc khách nhận hàng, đơn vị vận chuyển thu tiền, khách không chịu trả → phát sinh tranh cãi. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1512740931353444504)\n- **Khi bị sửa tin đã gửi sai**: nhắn khách **thu hồi** tin sai rồi gửi lại tin đúng.\n\n---\n\n## 4. Khi nào tự trả lời — khi nào hỏi / chuyển cấp trên\n\n**Tự trả lời** những câu thường gặp đã có sẵn kiến thức (chức năng máy, giá niêm yết, công nghệ, cách dùng, lõi lọc, muối…). Xem [mục 10 — Ngân hàng câu hỏi](#10-ngân-hàng-câu-hỏi--trả-lời-mẫu).\n\n**Hỏi nhóm / gọi điện hỏi trước khi trả lời** khi:\n- Không biết câu trả lời hoặc chưa chắc chắn. Tuyệt đối **không tự đoán**. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1491329164404588554)\n- Câu tiền nong, chính sách, tồn kho, đơn hàng cụ thể.\n- Với câu khéo léo/nhạy cảm: soạn nháp, gửi lên nhóm cho quản lý xem trước rồi mới nhắn khách.\n\n**Chuyển cấp trên / bộ phận khác**:\n\n| Tình huống | Chuyển cho |\n| --- | --- |\n| Máy lỗi cần kỹ thuật xử lý | Tiếp nhận thông tin + gửi **nhóm kỹ thuật / bảo hành**; nhắn khách \"em đã nhận thông tin, gửi bộ phận kỹ thuật, ngày mai sẽ phản hồi/hỗ trợ\" |\n| Khách tiềm năng máy lọc uống | Note SĐT vào **nhóm sales POU** |\n| Khách tiềm năng lọc tổng | Note vào **nhóm sales POE** / chuyển **Giang** |\n| Chính sách đại lý | Chuyển **Giang** (sales) |\n| Hóa đơn, thanh toán, xuất kho | **Hiền** |\n| Khách khó tính, dọa hoàn hàng | Xin SĐT khách, chuyển quản lý |\n\n**Bài học lặp lại quan trọng (đã bị nhắc 3 lần):** khi khách báo máy lỗi mà mình không xử lý được ngay, PHẢI (1) nhắn khách là đã tiếp nhận và chuyển kỹ thuật, mai phản hồi; và (2) báo/gửi ngay cho nhóm kỹ thuật. Bỏ qua bước này khiến khách chờ, mất thiện cảm, thậm chí mất đơn / mất hồ sơ thanh toán. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1491329164404588554)\n\n**Khách không tiềm năng** (nhìn avatar/profile FB không tiềm năng, khách nước phèn/giếng, hỏi khó/linh tinh, giống đối thủ dò thông tin) → có thể bỏ qua hoặc hỏi lại quản lý, nhất là ngày ít người. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1490281723030933524)\n\n---\n\n## 5. Lấy thông tin khách & chuyển sales / kỹ thuật\n\n- **Khách tiềm năng nhắn nhiều → chủ động theo sát và chốt**, không chỉ để lại SĐT rồi thôi. Nhắn contact khách vào nhóm sales để quản lý theo dõi. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1525430915805876285)\n- **Xin SĐT** để chuyển sales gọi lại. Add Zalo (Business để tư vấn, Care để CSKH) và **tạo contact** khách trên CRM.\n- **Zalo nhắn kém hiệu quả** — khách thường không check tin người lạ. Ưu tiên gọi điện hoặc nhắn tin thường (SMS bằng số máy) để \"được việc\". Nếu khách không nghe/không rep → note SĐT vào nhóm sales cho sales gọi lại. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1499364506814382164)\n- **Không cho khách số kỹ thuật để tự gọi.** Nếu khách cần hỗ trợ, xin thông tin để **bên mình chủ động gọi khách**; chỉ cho số kỹ thuật khi khách hỏi thẳng và được quản lý đồng ý. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1510534934442410004)\n- **Số gọi ra hotline** hiển thị cho khách là số **024x**, không phải 1900. Nhắn khách biết đây là số của Máy lọc nước GE để khách nghe/gọi lại. **Đừng gọi bằng số Zalo 033 (Water Care) cho khách mới** — khách sẽ không nhận ra và không nghe máy. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1526218283035000972)\n- **Thông tin cần xin để lắp đặt**: ảnh/video vị trí dự định lắp (để kỹ thuật kiểm tra đủ nguồn cấp, nguồn thải, ổ điện), địa chỉ, SĐT, vài khung giờ trống giờ hành chính T2–T6. Thời gian lắp dự kiến ~2 tiếng; hẹn khung sau 9h đến 16h (lắp 16h thì 18h mới xong). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1502591923125354626)\n\n---\n\n## 6. Kiến thức sản phẩm — máy lọc nước uống (POU)\n\n**Công nghệ chung** của các máy lọc nước uống GE là **G+ Mineral** (áp dụng cho tất cả các dòng để bàn/âm tủ). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1489839413021376562)\n\nĐặc điểm công nghệ để trả lời khách:\n- **Giữ khoáng tự nhiên** (không bù khoáng). Nước sau lọc **không ngọt/lợ** như nước khoáng đóng chai, cũng **không trơ/vô vị** như nước tinh khiết — vị ngọt rất nhẹ do giữ khoáng hàm lượng thấp. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1522820357453517000)\n- **ppm/TDS sau lọc tùy chất lượng nước đầu vào theo khu vực**: Hà Nội & miền Bắc khoáng cao → khoảng **30–90 ppm**; TP.HCM khoáng thấp → **20–50 ppm**. TDS/chỉ số này xem trong báo cáo lắp đặt. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1487680687082569909)\n- **Tỉ lệ nước lọc/nước thải**: máy dùng màng có đo lường; với GE giữ lại **~78%** (thải ~23% — thấp nhất thị trường). RO thường thải 40–50%. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1492311358916657317)\n- **Nước thải dùng làm gì**: tưới cây, rửa chân tay — **không dùng rửa thực phẩm**. Nếu khách muốn tận dụng cần lắp thêm bình/thùng chứa. Mọi công nghệ lọc uống trực tiếp đều có nước thải (để cuốn trôi chất bẩn). Nếu bên nào nói \"công nghệ không nước thải\" thì công nghệ đó (UF) chỉ hợp nước sạch như Nhật, còn nước máy Việt Nam nhiều rủi ro không xử lý hết. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1502140333113344170)\n- Máy nào cũng giữ khoáng nên **đều pha trà được**, chất lượng nước 3 mẫu tương đương. **Không máy nào \"tạo kiềm\"** (máy CÓ tính kiềm nhưng không phải máy tạo kiềm). Với khách \"ngu ngơ\" hỏi kiềm mà avatar không tiềm năng thì không cần trả lời sâu. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484516098727739553)\n- Chỉ dùng cho **nước máy** — CTD50/CTS20 **không lọc được nước phèn / nước giếng**. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1485136130549616650)\n- Điện **220V** (VN dùng 220V). Xem bảng thông số kỹ thuật.\n\n**Các dòng máy để bàn / âm tủ:**\n\n| Dòng | Loại | Đặc điểm để tư vấn |\n| --- | --- | --- |\n| **CTD50** | Để bàn, cơ bản | Đủ dùng cho gia đình, gọn, dễ dùng, chủ yếu nước uống + nước nóng cơ bản. Bình chứa bằng **nhựa không chứa BPA**. Dùng được theo 2 cách: dùng bình phía sau **hoặc** kết nối đường nước trực tiếp. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484192903906463906) |\n| **CTS20** | Để bàn, cao cấp | Tích hợp **nóng – lạnh – lọc – nước có ga** trong 1 máy. Có bình gas (ship riêng). Không có \"vòi cấp\" riêng — vòi đi kèm máy; có thể nối thêm 1 vòi uống tại bồn rửa bếp (khách mua vòi ngoài). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1490244187428360363) |\n| **CTS10** | Để bàn | Có bán, 2 màu trắng/đen. |\n| **GN610 / GN620 / DN810** | Âm tủ bếp | \"Máy lọc gắn/âm tủ bếp\". DN810 khỏe nhất. DN810 có 1 vòi nước uống đi kèm + 1 đầu chờ nối vòi rửa của nhà để dùng nấu ăn. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1523242225507635250) |\n| **B04** | Đời cũ | **Không còn bán / hết hàng.** Hướng khách sang **CTD50** (mẫu gần giống nhất nhưng đời sau, cao cấp hơn). Lõi B04 (CPF, NF) vẫn bán. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1500510807853891645) |\n\n**Mã lỗi thường gặp (POU):** máy báo lỗi/đèn đỏ đơn giản → hướng khách **rút điện cắm lại, lau xung quanh thân máy**, và **quay video** gửi về nhóm bảo hành để xác định lỗi. CTS20 lỗi **E3**, CTD50 lỗi **E4**, CTS10 lỗi **E7** — các lỗi cần kỹ thuật thì tiếp nhận + chuyển nhóm bảo hành. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1488498108064337951)\n\n---\n\n## 7. Kiến thức sản phẩm — hệ lọc tổng (POE)\n\n**Các bộ**: 15A / 30A (bản **tiêu chuẩn – standard**) và 15A ECO / 30A ECO (bản **tối ưu chi phí – ECO**).\n\n| Loại | Chức năng |\n| --- | --- |\n| **Standard (15A, 30A)** | Lọc nước sạch **toàn diện**: xử lý cặn canxi/magie + clo dư, mùi màu lạ, chất hữu cơ, hóa chất có hại, kim loại nặng, ức chế vi sinh. |\n| **ECO (15A ECO, 30A ECO)** | Tối ưu chi phí, **chỉ tập trung làm mềm nước cứng** (cặn canxi/magie). |\n\n**Tư vấn công suất theo nhà:** [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484803904398037012)\n- **Nhà mặt đất**: HN từ 4 người trở lên, HCM từ 5–6 người trở lên → tư vấn **30A / 30A ECO** (gửi cả 2 bộ). Ít người hơn → 15A (vừa đủ dùng) hoặc 30A (công suất dư) tùy khách.\n- **Chung cư**: HN từ 3 WC trở lên, HCM từ 3–4 WC trở lên → **2 bộ 30A**. Ít WC hơn → thường 15A / 15A ECO (2 bộ).\n- Quy tắc theo WC: 2 WC → dùng được **15A**; từ **3 WC trở lên** → tối thiểu **30A** (cả bản thường lẫn ECO). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484504406904017127)\n\n**Cách chốt 2 phương án cho khách (mẫu chị Trang duyệt, ví dụ khu Tây Hồ ~240–260 ppm):** [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1523697457895047280)\n> Vâng vậy thì nhà mình có 2 bộ giải pháp phù hợp nhất ạ:\n> - **Bộ 30A ECO** (~150 triệu): tập trung xử lý cặn canxi/magie rất cao ở khu vực này.\n> - **Bộ 30A** (~250 triệu): ngoài xử lý cặn canxi như 30A ECO, còn xử lý clo dư, mùi/màu lạ, chất hữu cơ, hóa chất có hại, kim loại nặng và ức chế vi sinh.\n\n**Nước thải lọc tổng**: không có nước thải cùng thời điểm lọc. Sau khi lọc một thời gian (ví dụ 7–10 ngày) máy chạy chu trình **sục xả rửa lõi**, đẩy ra một lượng nước thải; lượng này khác nhau tùy chất lượng nước đầu vào và không đáng kể. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1492311358916657317)\n\n**Chiết khấu lọc tổng**: **KHÔNG chiết khấu** (sản phẩm cao cấp). Không gửi `/whpromo`. Xem cách trả lời \"sản phẩm cao cấp\" ở [mục 9](#9-chính-sách-giá-quà-chiết-khấu-lắp-đặt-showroom).\n\n**Xem máy lọc tổng trực tiếp** (HCM): đại lý **CWS – Clean Water Solutions** có bộ 30A trưng bày (nhìn giống 15A nhưng cao gấp đôi). Có thể dẫn khách qua xem. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1518094512302457062)\n\n---\n\n## 8. Lõi lọc, muối, bình gas, bảo hành\n\n**Lõi lọc:**\n- Khách **tự thay được** (thiết kế thông minh, tiện). Nếu cần vẫn có thợ đến nhà thay: phí **200.000đ – 300.000đ**. Máy có thông báo thay lõi trên màn hình + video hướng dẫn thay tại nhà. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1486353871390511104)\n- Từ lúc máy **báo (đỏ)** đến lúc bắt buộc phải thay còn dùng được **20–30 ngày** → trấn an khách không cần gấp. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1525434974227009606)\n- Mua lõi: trên Shopee hoặc nhắn hãng. Bên mình là đại diện hãng nên **lõi luôn có sẵn**. Giá lõi báo **chưa gồm phí vận chuyển và phí thay lõi**.\n- Giá tham khảo: **lõi CTS10 ~3.500.000đ**. Lõi ở đại lý cùng giá như khách lẻ (chỉ một số đại lý được hãng chỉ định mới được bán lõi).\n- Lõi CPF B04 **đã đổi nhà cung cấp mới**: vỏ trắng hơn một chút, màu in chỉnh sang xám nhạt hơn; **thông số kỹ thuật giữ nguyên**, đã kiểm nghiệm nội bộ. Dùng để giải thích khi khách thắc mắc \"lõi mới nhìn khác lõi cũ\". [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1529059712988090510)\n\n**Muối (cho hệ làm mềm lọc tổng):**\n- Giá **16.500đ/kg**, **VAT 0%**. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484160968681586812)\n- Máy mới lắp đi kèm **4 bao = 100kg**. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1488542143286087851)\n- Khi hết muối (máy kêu): đổ muối vào thùng chứa của máy. Hướng dẫn lượng phù hợp, **không để rơi vãi** vì muối dễ ăn mòn mọi thứ xung quanh. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1502899345714843718)\n\n**Bình gas (CTS20 / máy có ga):**\n- Bình gas **ship riêng** (đơn vị vận chuyển không nhận gửi kèm máy). Dặn bọc kỹ, dán biển giữ thẳng đứng khi vận chuyển. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1512681822163832945)\n- Nếu khách có voucher: được tặng thêm **1 bình gas mới (~1tr2)**. Dặn khách **đừng vứt bình cũ** — sau này hết chỉ cần **nạp gas** sẽ rẻ hơn. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1522895094947250386)\n\n**Kích hoạt bảo hành (điện tử):**\n- **100% khách đã mua đều phải kích hoạt bảo hành** — hoặc hướng dẫn khách tự làm, hoặc kích hoạt hộ khách. Không chỉ trả lời mỗi câu khách hỏi rồi thôi. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1502571061571485766)\n- Cần: **mã serial** trên máy + **SĐT đăng ký**. Tra cứu bảo hành theo SĐT; nếu chưa hiện thì xin serial để kích hoạt.\n- Trung tâm bảo hành khu vực HCM: **Gò Vấp**. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1512660916267778098)\n\n---\n\n## 9. Chính sách giá, quà, chiết khấu, lắp đặt, showroom\n\n**Giá & quà (sản phẩm cao cấp GE):**\n- GE là hãng cao cấp → thường **không giảm giá sản phẩm**, chỉ được phép giảm **tối đa 15%** trên giá niêm yết. Vì không được bán thấp hơn giá quy định nên bên mình **thiết kế thêm quà tặng** để ưu đãi khách. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1484803053738655834)\n- **Quà không trừ thẳng vào giá** (giá là giá hãng quy định) — nhưng trả lời đầy đủ, đừng cụt.\n- **Mua 2–3 máy / đại lý: không giảm thêm.** Câu mẫu: xem [mục 10](#10-ngân-hàng-câu-hỏi--trả-lời-mẫu).\n- Đơn giá trị nhỏ (muối, lõi lẻ…): bên mình không hỗ trợ báo giá riêng; khách đặt mua bên mình xuất HĐ VAT.\n\n**Giá tham khảo (đã ưu đãi) — cần kiểm chứng theo bảng giá hiện hành:**\n- CTS20: niêm yết 39.950.000đ, ưu đãi 15% còn **33.957.500đ**.\n- CTD50: ưu đãi **16.957.500đ**.\n- CTS20 (giá đại lý tham khảo): ~20 triệu (báo khách kiểm tra lại đầu tuần). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1535505063005392896)\n\n**Lắp đặt & kiểm tra vị trí:**\n- **Mua trực tiếp qua hãng/fanpage**: miễn phí vận chuyển + lắp đặt.\n- **Mua qua Shopee**: phát sinh **phí lắp đặt 500.000đ**, khách chịu ship.\n- **Phí kiểm tra vị trí** (kỹ thuật qua xem có lắp được không): **200.000đ**. Nhưng thường **không cần** — khách chỉ cần chụp ảnh / quay video mô tả kỹ chỗ muốn lắp, bên mình kiểm tra **miễn phí**. Khảo sát tận nhà (VD lọc tổng) mới phát sinh phí ~500k. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1502564920468832316)\n\n**Showroom / khu vực:**\n- **Hà Nội**: showroom **32 Việt Hưng** và **218 Bạch Mai**. 32 Việt Hưng có trưng bày lọc tổng + mẫu CTD50, CTS20. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1530882452913000599)\n- **Đà Nẵng**: không có showroom/cửa hàng; có đại lý nhưng không cod sẵn mẫu. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1510211032935694457)\n\n**Hóa đơn Shopee:** đơn Shopee khi giao thành công **đã tự xuất hóa đơn ngay tại thời điểm đó**, nên **không xuất lại hóa đơn công ty** được nữa; cũng không xuất được đúng số tiền cuối cùng (sau khi trừ voucher Shopee). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1527933400600674385)\n\n---\n\n## 10. Ngân hàng câu hỏi → trả lời mẫu\n\n| Khách hỏi | Trả lời mẫu / hướng xử lý |\n| --- | --- |\n| Máy có tạo kiềm không? | Không máy nào tạo kiềm. Máy giữ khoáng tự nhiên nên nước có tính kiềm nhẹ. (Nếu khách không tiềm năng, hỏi kiềm \"cho có\" thì không cần trả lời sâu.) |\n| Máy pha trà được không? | Được ạ — máy nào cũng giữ khoáng tự nhiên nên chất lượng nước tương đương và hợp pha trà. |\n| CTD50 làm bằng chất liệu gì / bình chứa? | Bình chứa bằng nhựa **không chứa BPA** ạ. |\n| Công nghệ lọc của CTD50 / các máy uống? | Công nghệ **G+ Mineral** ạ (chung cho các máy lọc nước uống GE). |\n| Sau lọc còn bao nhiêu ppm? | Tùy khoáng nước đầu vào theo khu vực: miền Bắc ~30–90, HCM ~20–50. Máy giữ khoáng tự nhiên chứ không bù khoáng ạ. |\n| Nước có vị gì không? | Vị tùy cảm nhận, cơ bản không ngọt/lợ như nước khoáng chai, cũng không trơ như nước tinh khiết — ngọt rất nhẹ do giữ khoáng hàm lượng thấp ạ. |\n| Lọc được bao nhiêu %? / nước thải? | Máy lọc uống dùng màng có tỉ lệ giữ lại ~78% (GE thải ~23%, thấp nhất thị trường). Nước thải dùng tưới cây/rửa tay, không rửa thực phẩm. |\n| CTD50 lọc được nước phèn/giếng không? | Không ạ, máy chỉ dùng cho **nước máy**. |\n| Máy dùng điện bao nhiêu V? | 220V ạ (VN dùng 220V) — thông tin có trong bảng thông số kỹ thuật. |\n| CTS20 có gì đặc biệt? | Dạ đúng rồi ạ, CTS20 là dòng cao cấp, tích hợp **nóng – lạnh – lọc – nước có ga** trong 1 máy, vẫn giữ khoáng tự nhiên nên dễ chịu hơn RO. Dạ để tư vấn đúng, mình cần máy dùng cơ bản hay muốn tiện nghi hơn ạ? |\n| CTD50 có đủ dùng không? | Dạ hoàn toàn đủ cho gia đình ạ, nhất là nếu mình chủ yếu dùng nước uống và nước nóng cơ bản thì dòng này rất ổn định, dễ dùng. |\n| Còn bán B04 không / lõi B04 khác lõi cũ? | B04 hết hàng/không còn bán — hướng sang CTD50 (đời sau, cao cấp hơn). Lõi mới đổi NCC: vỏ trắng hơn, in xám nhạt hơn, **thông số giữ nguyên**. |\n| Mua 2–3 máy có ưu đãi thêm? | Dạ với số lượng này mình đã đang được mức giá tốt nhất bên em rồi ạ; hiện bên em chưa hỗ trợ thêm chiết khấu ngoài chính sách này ạ. |\n| Quà có trừ thẳng vào giá không? | Dạ giá này là giá hãng quy định nên quà không được trừ thẳng, phần quà là bên em thiết kế thêm để ưu đãi mình ạ. |\n| Xin JD tuyển dụng (kỹ thuật lắp máy / AI specialist) | Search tên công ty đầy đủ + \"TopCV\" ra link JD, gửi khách + báo gửi CV về công ty. |\n| Quảng cáo / chào dịch vụ (SEO, headhunt, ấn phẩm…) | Báo bên mình không có nhu cầu/ngân sách, không cần liên hệ. |\n| Tự lắp trực tiếp đường nước được không? | Gợi ý quay video vị trí để kỹ thuật check. Có thể tự lắp nếu khách rành, nhưng khuyến khích để kỹ thuật lắp; báo phí lắp/kiểm tra rõ ràng. |\n| Lõi có dễ mua ở VN không? | Bên mình bán luôn vì là đại diện hãng, lõi luôn có sẵn ạ. |\n| Xuất hóa đơn VAT cho đơn Shopee? | Đơn Shopee giao thành công đã tự xuất hóa đơn tại thời điểm đó nên không xuất lại HĐ công ty được ạ. |\n\n---\n\n## 11. Bài học từ các lần được sửa (nên / không nên)\n\n**Bài học 1 — Tiếp nhận khách khi máy lỗi / chưa xử lý được ngay (đã bị nhắc 3 lần):**\n- ❌ Không xử lý được mà im lặng, không báo ai.\n- ✅ Nhắn khách: \"em đã tiếp nhận thông tin, gửi bộ phận kỹ thuật, mai sẽ phản hồi/hỗ trợ\" + báo ngay nhóm kỹ thuật.\n- Vì sao: khách chờ lâu, mất thiện cảm, có thể mất đơn / thiếu hồ sơ thu tiền. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1491329164404588554)\n\n**Bài học 2 — Câu tự soạn phải nhờ AI viết lại:**\n- ❌ Trả lời quá ngắn/cụt (\"Quà không được trừ thẳng ạ\") hoặc quá dài dòng kỹ thuật.\n- ✅ Đưa qua ChatGPT CSKH viết lại ngắn gọn, súc tích, đủ ý rồi mới gửi.\n- Vì sao: câu cụt khách hiểu lầm; câu dài khách không đọc. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1488541197617201205)\n\n**Bài học 3 — Xưng hô:**\n- ❌ AI/tin mẫu xưng \"chị – mình\".\n- ✅ Xưng \"em\", gọi \"anh/chị\". [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1508037186665185420)\n\n**Bài học 4 — Tin nhắn tiền nong:**\n- ❌ Trả lời ẩu về phí ship / phí lắp / COD.\n- ✅ Kiểm tra kỹ trước khi trả lời; nếu chưa chắc, hỏi quản lý.\n- Vì sao: sai đến lúc thu tiền khách không trả → tranh cãi. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1512740931353444504)\n\n**Bài học 5 — Botcake/AI trả lời rồi vẫn phải bổ sung:**\n- ❌ Thấy Botcake đã rep là bỏ qua.\n- ✅ Gửi lại tin của mình cho đủ thông tin, vì AI chưa cung cấp đủ. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1485112411513028689)\n\n**Bài học 6 — Số gọi ra & Zalo:**\n- ❌ Gọi khách mới bằng số Zalo 033; nhắn Zalo cho khách chưa quen rồi thắc mắc sao khách không nghe.\n- ✅ Gọi/nhắn bằng số hotline (khách thấy số 024x của GE); Zalo kém hiệu quả với khách lạ. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1526218283035000972)\n\n**Bài học 7 — Không tự cho số kỹ thuật để khách tự gọi:**\n- ✅ Xin thông tin để bên mình chủ động gọi khách; chỉ đưa số khi khách hỏi thẳng và được duyệt. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1510534871917789237)\n\n**Bài học 8 — Rà kỹ, cẩn thận từ việc nhỏ:**\n- ✅ Đầu ca check hết tin ca trước (kể cả tin chưa rep), rèn tính cẩn thận từ việc nhỏ; sót khách nhiều dù ít tin là bị nhắc. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1505778091786502215)\n\n---\n\n## 12. Kịch bản hotline CSKH\n\nKịch bản do CTV soạn, quản lý duyệt (bản đầy đủ ở [Google Docs](https://docs.google.com/document/d/1HWa-8z5LauSUlmRvmq8iGlmWDeMvZxiqVPAkuBsjPJ8/edit)). Tóm tắt:\n\n**Mở đầu chung:**\n> Dạ, tổng đài chăm sóc khách hàng máy lọc nước GE xin nghe ạ. Em có thể hỗ trợ/tư vấn cho anh/chị như thế nào ạ?\n\n**Tình huống 1 — Khách hỏi lọc tổng:** khảo sát nhanh 3 câu: (1) khu vực, nhà mặt đất hay chung cư; (2) bao nhiêu người dùng, bao nhiêu WC; (3) ngân sách dự kiến. → Tư vấn công suất theo [mục 7](#7-kiến-thức-sản-phẩm--hệ-lọc-tổng-poe). [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1496068520050556938)\n\n**Tình huống 2 — Tư vấn CTD50 / CTS20:** dùng công thức \"Dạ đúng rồi ạ\" → bổ sung 1–2 ý → dẫn về nhu cầu. Báo giá kèm ưu đãi, nhấn hỗ trợ lắp đặt tận nơi. Hỏi khó → chuyển sang Zalo để gửi thông tin/hình ảnh. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1496098910140235776)\n\n**Tình huống — Khách hỏi chính sách đại lý:** xin tên + tên công ty/cửa hàng; hỏi 3 ý (khu vực triển khai; đang kinh doanh gì / mới tìm hiểu ngành lọc nước; bán qua showroom/online/cả hai). Chốt: ghi nhận thông tin, xin Zalo, chuyển bộ phận phụ trách đại lý. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1496099019250995370)\n\n**Tình huống 3 — Khách báo máy lỗi:** xin lỗi trải nghiệm chưa tốt → ghi nhận **Model máy / Tình trạng lỗi / Thời điểm bắt đầu lỗi**. Lỗi đơn giản (báo đỏ) → hướng dẫn rút điện, lau thân máy. Cần kỹ thuật → xin SĐT + địa chỉ, hẹn kỹ thuật liên hệ sớm nhất. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1496099452300300328)\n\n**Chốt cuộc gọi / chuyển Zalo:** xin phép kết bạn Zalo để gửi thông tin chi tiết; tư vấn qua **GE Water Business**, chăm sóc qua **GE Water Care**.\n\n**Khách gọi nhỡ lên hotline — nhắn lại (mẫu):**\n> Dạ em chào anh/chị ạ. Em vừa liên hệ với mình qua hotline Tổng đài máy lọc nước GE (1900 3363) nhưng có thể mình bận nên chưa nghe máy ạ. Khi tiện, anh/chị vui lòng gọi lại tổng đài 1900 3363 hoặc phản hồi tin nhắn này để được hỗ trợ ngay ạ. [nguồn](https://discord.com/channels/1484009253831315456/1484057534569381928/1499349419642851350)\n\n---\n\n## 13. Link tài nguyên nội bộ\n\nCác link phục vụ CTV trực fanpage / CSKH (đăng nhập bằng **tài khoản nội bộ do quản lý cấp**):\n\n- **Kịch bản Hotline CSKH**: https://docs.google.com/document/d/1HWa-8z5LauSUlmRvmq8iGlmWDeMvZxiqVPAkuBsjPJ8/edit\n- **ChatGPT \"W Chăm sóc khách hàng\"** (viết lại câu trả lời cho hay/ngắn): https://chatgpt.com/g/g-p-69af9d70b7908191a2a5b0fc84d8463b-w-cham-soc-khach-hang\n- **Agent training GWT** (chat thử với AI nội bộ): https://gwt.vnagent.ai/chat/training\n- **CRM Pancake (Contact)**: https://crm.pancake.vn/shop/1021215776/table/Contact\n- **JD kỹ thuật lắp máy (gửi khách xin việc)**: https://www.topcv.vn/viec-lam/ky-thuat-lap-dat-may-loc-nuoc/1732235.html\n- Nội dung công việc trong ca (chat + lên đơn + ticket): xem [tin ghim](https://discord.com/channels/1484009253831315456/1484057534569381928/1512346774352957521).\n\n*(Ngoài ra kênh còn nhiều link cho nghiệp vụ khác — ĐNTT, kho VTP/Eton, MISA, Eshop, lịch bảo trì Asana… — không thuộc phạm vi trực fanpage, hỏi quản lý khi được giao.)*\n\n---"
      }
    ]
  },
  {
    "khu": "kien-thuc-nen",
    "bai": [
      {
        "slug": "chat-luong-nguon-nuoc",
        "tieuDe": "Chất lượng nguồn nước",
        "hang": "D",
        "nhom": "Kiến thức nước",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 1,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Chất lượng nguồn nước\n\nChất lượng nước máy tại Việt Nam\n\nCác yếu tố nguy hiểm trong nước\n\nClo dư - Quan trọng\n\nKim loại nặng\n\nVi khuẩn Virus\n\nNitrit, nitrat với amoni\n\n## Chất lượng nước máy tại Việt Nam\n\nNước máy tại Việt Nam về cơ bản là nước sạch, đạt tiêu chuẩn QCVN 01-1:2018/BYT – là quy chuẩn kỹ thuật quốc gia về chất lượng nước dùng cho ăn uống và sinh hoạt. Tuy nhiên\n\n⚠️ Một số vấn đề thường gặp\n\n- Clo dư: Clo được dùng để khử trùng, nhưng dư clo gây mùi nồng, khô da, hại tóc.\n\n- Rỉ sét, cặn bẩn: Do đường ống cũ, hoặc bồn chứa chưa được vệ sinh định kỳ.\n\n- Vi khuẩn tái nhiễm: Trong bồn chứa gia đình, đặc biệt vào mùa nóng.\n\n- Nước cứng: Hàm lượng canxi, magie cao – gây bám cặn, làm khô da, xơ tóc.\n\n- Mùi lạ, vị lạ: Do tảo, chất hữu cơ, hoặc khử trùng không đều.\n\n👉 Lưu ý: Ở đô thị lớn như Hà Nội, TP.HCM, Đà Nẵng, chất lượng nước đầu ra từ nhà máy khá tốt, nhưng nguy cơ nhiễm bẩn từ hệ thống ống dẫn cũ và bể chứa gia đình vẫn rất đáng ngại.\n\n2. Các nhà máy nước tại Việt Nam xử lý như thế nào?\n\n🔹 Nguồn nước thô chính:\n\n- Sông (sông Hồng, sông Sài Gòn, sông Đồng Nai, sông Đà…)\n\n- Nước ngầm (giếng khoan sâu)\n\n- Một số nơi sử dụng nước hồ chứa hoặc nước mưa.\n\n🔹 Công nghệ xử lý phổ biến:\n\n- Lắng – lọc thô: Loại bỏ cặn lớn, phù sa.\n\n- Keo tụ – tạo bông: Dùng phèn nhôm, PAC giúp kết tủa các chất lơ lửng.\n\n- Lọc nhanh/trung bình: Qua bể lọc cát, sỏi.\n\n- Khử trùng bằng Clo: Diệt khuẩn, virus. Có thể dùng chlorine, javel hoặc ClO2.\n\n- Kiểm tra chất lượng: Tùy nhà máy: kiểm định các chỉ số như độ đục, clo dư, vi sinh…\n\n✅ Một số nhà máy hiện đại (ví dụ: Nhà máy nước sông Đuống, Nhà máy nước Kênh Đông) đã ứng dụng công nghệ ozone, lọc áp suất, khử trùng UV, màng siêu lọc UF…\n\n3. Vì sao vẫn cần lọc nước đầu nguồn tại nhà?\n\nNgay cả khi nước máy đầu vào đạt chuẩn, nguy cơ tái nhiễm vẫn rất cao:\n\n- Đường ống lâu năm dễ rỉ sét, đóng cặn.\n\n- Clo dư gây kích ứng da.\n\n- Vi sinh vật trong bể chứa không vệ sinh.\n\n- Nước cứng ảnh hưởng thiết bị & da tóc.\n\n👉 Do đó, tại các gia đình, biệt thự, spa… nhu cầu lắp hệ lọc tổng đầu nguồn đang tăng mạnh để:\n\n- Bảo vệ thiết bị, nâng tuổi thọ vòi sen, máy giặt…\n\n- Bảo vệ da tóc, đặc biệt người nhạy cảm.\n\n- An tâm hơn cho trẻ nhỏ và người lớn tuổi.\n\nSo sánh chất lượng nguồn nước các quốc gia\n\n## Các yếu tố nguy hiểm trong nước\n\n- Clo dư: Khô da, xơ tóc, THMs gây ung thư\n\n- Chì, kim loại nặng: Rối loạn thần kinh, chậm phát triển ở trẻ\n\n- Vi khuẩn, virus: Tiêu chảy, viêm da, nhiễm trùng\n\n- Canxi, Magie (nước cứng): Mẩn ngứa, bám cặn thiết bị, xơ vải\n\n- Asen: Ung thư, tổn thương da và cơ quan nội tạng\n\n- Chất hữu cơ độc hại: Đột biến, rối loạn nội tiết, ung thư\n\n### Clo dư - Quan trọng\n\n- Clo (Cl₂) là chất khử trùng phổ biến được thêm vào nước máy nhằm diệt vi khuẩn, virus, ký sinh trùng.\n\n- Việt Nam và nhiều nước trên thế giới đều sử dụng clo trong xử lý nước cấp sinh hoạt\n\nVAI TRÒ TÍCH CỰC CỦA CLO\n\n- Diệt hầu hết các loại vi sinh vật gây bệnh.\n\n- Ngăn chặn sự phát triển của vi khuẩn trong đường ống dẫn.\n\n- Dễ sử dụng, chi phí thấp, hiệu quả cao.\n\nVẤN ĐỀ NẰM Ở “CLO DƯ”\n\nMỨC ĐỘ AN TOÀN\n\n- Việt Nam: Quy chuẩn cho phép hàm lượng clo dư trong nước máy là tối đa 1 mg/L (QCVN 01-1:2018/BYT).\n\n- WHO: khuyến nghị < 5 mg/L nhưng lý tưởng là 0.2 – 0.5 mg/L để diệt khuẩn mà vẫn an toàn.\n\n- Giới hạn cho phép theo EU Drinking Water Directive (Chỉ thị 2020/2184/EU): EU không quy định một mức giới hạn bắt buộc cụ thể cho clo dư, mà giao quyền tùy chỉnh cho từng quốc gia, miễn sao nước đầu ra đảm bảo an toàn, không gây rủi ro cho sức khỏe. Tuy nhiên, mức clo dư phổ biến tại vòi trong các quốc gia EU thường ở mức rất thấp, chỉ khoảng 0.1–0.4 mg/L\n\nVí dụ:\n\n- Đức, Hà Lan, Thụy Điển: Gần như không dùng clo, hoặc dùng liều cực thấp vì họ có hệ thống cấp nước khép kín, hiện đại, không bị tái nhiễm.\n\n- Pháp, Ý, Tây Ban Nha: Có sử dụng clo nhưng kiểm soát rất chặt, lượng clo dư thấp (< 0.3 mg/L).\n\nTuy nhiên, tại nhiều khu vực ở Việt Nam, đo thực tế tại vòi thường cho kết quả clo dư cao hơn mức lý tưởng, đặc biệt vào mùa nóng hoặc sau sự cố cấp nước.\n\nVí dụ:\n\n- Báo Tuổi Trẻ đề cập rằng, để đảm bảo clo từ đầu đến cuối mạng lưới ≥ 0,3 mg/L, Sawaco (TP.HCM) phải châm thêm clo lên 0,9–1,1 mg/L tại nhà máy, khiến nhiều hộ dân gần nguồn có mức clo dư quá dày  .\n\n- Nguồn tin Maxdream (2024) dẫn số liệu từ Sở Xây dựng TP.HCM: 35 % mẫu nước kiểm tra năm 2022 có clo dư vượt > 0,5 mg/L (cao gấp 1.5 lần so với năm 2020)  .\n\n- Viện KH & CN Việt Nam (2021): có đến 42 % mẫu nước tại Hà Nội vượt trên mức cho phép, tăng 10 % so với năm 2016  .\n\n- Báo Nhân Dân (2009) phản ánh nhiều phường tại Hà Nội có mùi clo nồng, đặc biệt sau khi đổi sang dòng nước Sông Đà  .\n\n- Báo VnExpress trích lời Giám đốc Công ty nước sạch Sông Đà: sau sự cố dầu tràn, nhà máy tăng clo lên mức cao (0,3–1,0 mg/L) dẫn đến nước có mùi lạ  .\n\n- Báo Tuổi Trẻ từng ghi nhận tại chung cư Phúc Lộc Thọ (TP.HCM), dù nhà máy châm clo cao (~0,9–1,1 mg/L), đến vòi hộ dân chỉ còn 0,06 mg/L – thấp hơn tiêu chuẩn tối thiểu. Điều này cho thấy hệ thống đường ống, lòng bể chứa gây tụt clo, dẫn đến có thể tồn tại vi khuẩn gây bệnh.\n\nCÁCH GIẢM CLO DƯ TRONG GIA ĐÌNH\n\n1. Dùng máy lọc than hoạt tính: Loại bỏ hiệu quả clo, mùi vị khó chịu.\n\n1. Trữ nước vào bồn, mở nắp vài giờ\" Cho clo bay hơi tự nhiên – hiệu quả thấp, không triệt để.\n\n1. Đun sôi: Làm bay hơi clo nhưng không loại bỏ hoàn toàn THMs.\n\nChâu Âu đang dùng gì để khử trùng nước nếu không dùng clo?\n\nChâu Âu rất chú trọng đến “taste & trust” – nước phải không mùi, không vị clo, và đảm bảo sạch đến tận vòi.\n\nCLO DIỆT KHUẨN TRONG NƯỚC NHƯ THẾ NÀO?\n\n✅ Khi clo được cho vào nước:\n\nClo phản ứng với nước để tạo thành axit hypochlorous (HOCl) – chất khử trùng mạnh nhất trong nước:\n\nCl₂ + H₂O → HOCl + HCl\n\nTùy vào độ pH của nước, HOCl có thể chuyển thành ion hypoclorit (OCl⁻), nhưng HOCl mạnh hơn gấp 80–100 lần trong diệt khuẩn.\n\nHOCl ⇌ H⁺ + OCl⁻\n\nCơ chế diệt khuẩn của HOCl (Axit Hypochlorous)\n\nHOCl hoạt động bằng cách:\n\n- Xuyên qua màng tế bào vi khuẩn, phá vỡ cấu trúc.\n\n- Oxy hóa protein, enzyme làm vi khuẩn mất khả năng hoạt động và chết.\n\nSo sánh:\n\n- HOCl: Diệt khuẩn hiệu quả, nhanh, hoạt động tốt ở pH 6–7.\n\n- OCl⁻ (ion hypoclorit): Cũng có tác dụng, nhưng yếu hơn HOCl 80–100 lần.\n\nVẤN ĐỀ XẢY RA KHI CLO DƯ GẶP CHẤT HỮU CƠ\n\nNếu nước chứa lá cây mục, cặn hữu cơ, thuốc trừ sâu…, HOCl sẽ phản ứng tạo thành chất phụ gia độc hại như THMs (trihalomethanes):\n\nHOCl + Chất hữu cơ → THMs + Các sản phẩm phụ khác\n\nTHMs phổ biến gồm:\n\n- Chloroform (CHCl₃)\n\n- Bromodichloromethane (CHBrCl₂)\n\n🔴 Các chất này đã được WHO và EPA xếp vào nhóm có nguy cơ gây ung thư nếu tích lũy lâu dài.\n\nTác hại chi tiết của clo dư trong nước máy\n\nA. Với sức khỏe con người\n\n- Kích ứng da, khô da, viêm da: Clo dư làm mất lớp dầu tự nhiên trên da, gây ngứa, bong tróc, kích ứng — đặc biệt với da nhạy cảm, trẻ nhỏ, người bị chàm/eczema.\n\n- Xơ tóc, rụng tóc: Clo phá vỡ liên kết keratin trong tóc, làm tóc khô, gãy rụng.\n\n- Kích thích hệ hô hấp: Clo bay hơi khi tắm nước nóng tạo ra khí clo – hít vào có thể gây ho, khó thở, đặc biệt ở người bị hen suyễn.\n\n- Hình thành hợp chất THMs (Trihalomethanes)\" Khi clo phản ứng với chất hữu cơ → tạo ra THMs như chloroform – chất này có thể gây ung thư nếu tích lũy lâu dài.\n\n- Tác động đến mắt\" Có thể gây đỏ mắt, cay mắt nếu tiếp xúc trong thời gian dài (tương tự khi bơi trong hồ có nhiều clo).\n\nB. Với môi trường sống và thiết bị\n\n- Làm ăn mòn đường ống kim loại, vòi nước, máy nóng lạnh.\n\n- Gây mùi khó chịu trong nước, đặc biệt khi nấu ăn hoặc pha đồ uống.\n\n- Gây chết vi sinh vật có lợi nếu dùng nước máy để tưới cây, nuôi cá.\n\nKim loại nặng\n\n1. Các kim loại nặng thường gặp trong nước máy\n\n2. Nguyên nhân gây ô nhiễm kim loại nặng trong nước máy\n\n- Đường ống cũ bị rỉ sét (thép, hàn chì): Chì, sắt, mangan có thể rò rỉ ra nước máy khi đường ống xuống cấp.\n\n- Nước ngầm nhiễm tự nhiên (Asen, sắt): Nhiều vùng đồng bằng (sông Hồng, Cửu Long) có hàm lượng asen tự nhiên rất cao trong tầng ngậm nước.\n\n- Chất keo tụ không được xử lý hết: Một số nhà máy dùng phèn nhôm (Alum) làm trong nước, nếu không rửa lọc kỹ có thể gây dư nhôm.\n\n- Ô nhiễm công nghiệp & nông nghiệp: Nước sông bị xả thải từ nhà máy, thuốc trừ sâu (chứa Cd, Pb) → xâm nhập vào hệ thống nước cấp.\n\n- Bồn chứa hoặc thiết bị rỉ sét: Bồn inox rỉ sét, thiết bị nước không đạt chuẩn cũng có thể gây nhiễm kim loại.\n\n3. Tác hại của kim loại nặng đối với cơ thể\n\n- Chì (Pb): Gây rối loạn thần kinh, giảm trí nhớ, khả năng học tập ở trẻ, gây thiếu máu, ảnh hưởng hệ sinh sản.\n\n- Thủy ngân (Hg): Gây tổn thương não, thận, mất kiểm soát vận động, ảnh hưởng thai nhi.\n\n- Cadimi (Cd): Gây loãng xương, suy thận, ung thư phổi, tích lũy qua ăn uống lâu dài.\n\n- Asen (As): Là chất gây ung thư loại 1 (da, phổi, bàng quang), thay đổi sắc tố da, rụng tóc, tiêu chảy kéo dài.\n\n- Sắt (Fe): Không quá độc nhưng gây vị kim loại, ố vàng thiết bị, khó chịu khi sử dụng.\n\n- Mangan (Mn): Dễ tích tụ trong não, ảnh hưởng hành vi, mất trí nhớ nếu tiếp xúc lâu dài.\n\n- Nhôm (Al): Nghi ngờ liên quan đến Alzheimer, dễ tích tụ trong cơ thể nếu không bài tiết tốt.\n\n4. Khu vực nguy cơ tại Việt Nam\n\n- Đồng bằng sông Hồng (HN, Hưng Yên, Hà Nam, Thái Bình…): Nước ngầm nhiễm Asen cao, nhiều nơi > 0.05 mg/L\n\n- TP.HCM – Nhà cũ, ống thép lâu năm: Nguy cơ chì từ ống hàn cũ, sắt/mangan từ đường ống nội bộ\n\n- Đồng bằng sông Cửu Long: Tương tự miền Bắc: nhiễm Asen, sắt, mangan trong nước ngầm\n\n- Khu công nghiệp cũ: Nguy cơ nhiễm Cd, Pb, Hg do rò rỉ hóa chất, thuốc trừ sâu\n\nVi khuẩn Virus\n\nDưới đây là tổng hợp đầy đủ và dễ hiểu về các loại vi khuẩn – vi sinh vật có hại trong nước máy hoặc nước sinh hoạt, bao gồm nguồn gốc, tác hại với sức khỏe, và cách loại bỏ hiệu quả.\n\n2. Vì sao nước máy vẫn có thể nhiễm vi sinh vật?\n\n- Tái nhiễm trong bồn chứa, đường ống: Bồn nước không vệ sinh định kỳ, đường ống rò rỉ → tạo điều kiện vi sinh phát triển.\n\n- Châm clo không đủ hoặc clo bị mất dần: Đặc biệt ở các điểm xa nhà máy nước → vi khuẩn sống sót và tái sinh.\n\n- Nguồn nước thô quá ô nhiễm: Nếu nhà máy xử lý không triệt để, đặc biệt vào mùa mưa, nước lũ…\n\n- Vi khuẩn kháng clo: Một số như Cryptosporidium có vỏ bào tử dày → không bị diệt bằng clo thông thường.\n\n- Áp lực nước yếu, nước trào ngược: Khi mất nước đột ngột, vi khuẩn từ môi trường có thể xâm nhập vào đường ống.\n\n3. Cách loại bỏ vi khuẩn, vi sinh vật trong nước hiệu quả\n\n### Nitrit, nitrat với amoni\n\nNhóm chất vô cơ độc hại rất quan trọng và thường bị bỏ qua trong nước sinh hoạt: Nitrit (NO₂⁻), Nitrat (NO₃⁻) và Amoni (NH₄⁺). Đây là các hợp chất chứa nitơ, không mùi, không vị rõ ràng nên rất khó phát hiện bằng cảm quan, nhưng ảnh hưởng nghiêm trọng đến sức khỏe, đặc biệt là trẻ em\n\n1. Nguồn gốc của Nitrit, Nitrat và Amoni trong nước\n\n- Amoni (NH₄⁺): Phân hủy rác hữu cơ, phân động vật, nước thải sinh hoạt chưa xử lý. Thường có trong nước ngầm, nước sông ô nhiễm.\n\n- Nitrit (NO₂⁻): Sản phẩm trung gian trong quá trình chuyển hóa Amoni → Nitrat; sinh ra khi môi trường thiếu oxy, xử lý nước không hoàn chỉnh.\n\n- Nitrat (NO₃⁻): Tích tụ từ phân bón hóa học, thuốc trừ sâu, chất thải nông nghiệp. Rất bền vững và khó loại bỏ.\n\n2. Tác hại đối với sức khỏe con người\n\n- Amoni: Bản thân chưa quá độc, nhưng khi phản ứng với clo trong nước máy tạo ra chloramine – gây mùi tanh, kích ứng da, có thể sinh ra nitrit.\n\n- Nitrit (NO₂⁻): Gây Methemoglobinemia (hội chứng xanh tím ở trẻ sơ sinh) – làm giảm khả năng vận chuyển oxy trong máu.\n\n- Nitrat (NO₃⁻): Trong cơ thể, có thể chuyển hóa ngược lại thành Nitrit, lâu dài gây ung thư dạ dày, đường ruột, ảnh hưởng chức năng gan, thận.\n\n3. Giá trị giới hạn cho phép theo QCVN 01-1:2018/BYT\n\n- Amoni (NH₄⁺): ≤ 0.3 mg/L\n\n- Nitrit (NO₂⁻): ≤ 0.05 mg/L\n\n- Nitrat (NO₃⁻): ≤ 50 mg/L\n\n4. Tại sao vẫn tồn tại trong nước máy?\n\n- Nhà máy xử lý không triệt để do công nghệ hạn chế hoặc nguồn nước thô quá ô nhiễm.\n\n- Clo phản ứng với amoni sinh ra chloramine, không khử trùng tốt, gây mùi tanh và kích ứng.\n\n- Một số hệ thống cấp nước không giám sát chặt nitrit/nitrat, vì chúng không gây mùi nên dễ bị bỏ qua.\n\nHà Nội\n\nA. Nước ngầm nhiễm nặng (giếng khoan, tầng trên 25–40 m)\n\nTheo khảo sát của Liên đoàn Địa chất thủy văn miền Bắc:\n\nAmoni vượt tiêu chuẩn 20–30 lần; ví dụ ở:\n\n- Pháp Vân: 31,6 mg/L\n\n- Tương Mai: 13,5 mg/L\n\n- Các vùng khác như Tây Mỗ, Trung Hòa, Trung Văn… cũng có mức cao tương tự  .\n\nB. Nhà máy nước sử dụng nguồn ngầm bị ảnh hưởng\n\n- Các nhà máy Pháp Vân, Hạ Đình, Tương Mai có amoni từ 8–8,5 mg/L, vượt rất cao so với giới hạn cho phép 1,5 mg/L  .\n\n- Amoni và các chất nitơ còn có thể chuyển hóa thành nitrit và nitrat, gây rò rỉ chất độc trong đường ống cấp nước  .\n\nTP.HCM\n\nTheo khảo sát của Trung tâm Y tế dự phòng, nhiều quận nội và ngoại thành như Tân Bình, Tân Phú, Bình Tân, Bình Chánh, Hóc Môn, Nhà Bè có giếng khoan:\n\n- Nước bị nhiễm amoni, nitrit, nitrat chung cư tập trung ở các quận này  .\n\n- Mặc dù chưa có số liệu cụ thể nồng độ, nhưng các mẫu cho thấy ô nhiễm rất nặng, vượt xa tiêu chuẩn cho phép\n\nBáo cáo lạm dụng\n\nChi tiết trang\n\nĐã cập nhật trang\n\nBáo cáo lạm dụng"
      },
      {
        "slug": "clo-du",
        "tieuDe": "Clo dư",
        "hang": "D",
        "nhom": "Kiến thức nước",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 2,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Clo dư\n\n# Tài liệu nền đào tạo – Clo dư trong nước sinh hoạt\n\nChatGPT Deep Research ngày 5/7/2025\n\n## 1. Vì sao nước máy có clo dư\n\nCác nhà máy cấp nước sử dụng chlorine (clo) làm chất khử trùng chính để tiêu diệt vi khuẩn, vi sinh vật gây bệnh trong nước. Clo được ưa chuộng do hiệu quả cao và đặc biệt là khả năng để lại một lượng “clo dư” sau xử lý nhằm ngăn tái nhiễm khuẩn trên đường nước phân phối đến hộ gia đì *(nguồn: nhqcvn.com.vnfptshop.com.vn)*. Nói cách khác, clo dư đóng vai trò như lớp bảo vệ duy trì chất lượng nước trên toàn hệ thống đường ống. Nếu hàm lượng clo quá thấp (<0,3 mg/L), nước sau xử lý dễ bị tái nhiễm vi sinh và có thể gây bệnh truyền qua đường nước (như đau bụng, tiêu chảy) cho người uống phả *(nguồn: iqcvn.com.vn)*. Nhờ clo dư, nước máy đến tay người dùng thường vẫn đảm bảo an toàn vi sinh. Tuy nhiên, chính lượng clo còn lại này đôi khi gây mùi khó chịu và tiềm ẩn một số ảnh hưởng sức khỏe nếu quá cao.\n\n### Phân biệt các loại “clo” trong nước:\n\n- Clo dư tự do (Free chlorine): Là loại clo có khả năng khử trùng còn lại trong nước – loại được giám sát chặt chẽ.\n\n- Clo kết hợp (Combined chlorine): Phản ứng với chất hữu cơ – thường gây mùi clo nồng nhưng không còn hiệu quả khử trùng.\n\n- Tổng clo (Total chlorine) = Clo dư tự do + Clo kết hợp. 👉 Trong xét nghiệm nước, người ta thường đo clo dư tự do để đánh giá chất lượng khử trùng và mức độ an toàn.\n\n2. Clo dư – hàm lượng an toàn và so sánh quốc tế\n\nĐể cân bằng giữa hiệu quả khử trùng và an toàn cho người dùng, clo dư trong nước sinh hoạt được khuyến nghị và quy định ở mức giới hạn an toàn. Tại Việt Nam, Bộ Y tế quy định hàm lượng clo dư tự do trong khoảng 0,2 – 1,0 mg/L là đạt tiêu chuẩn cho nước sinh hoạ *(nguồn: tthuvienphapluat.vn)*. Trước đây tiêu chuẩn cũ khuyến cáo khoảng 0,3 – 0,5 mg/L là ngưỡng đảm bảo vừa đủ diệt khuẩn vừa không tạo mùi khó chị *(nguồn: unhandan.vn)*. Hiện nay mức tối đa cho phép đã nâng lên 1,0 mg/L, tương đương tiêu chuẩn nhiều nước, nhằm linh hoạt hơn trong vận hành khử trùng.\n\nỞ quy mô quốc tế, các tổ chức và quốc gia cũng có hướng dẫn tương đồng về clo dư trong nước uống:\n\n- Tổ chức Y tế Thế giới (WHO): Khuyến nghị duy trì clo dư khoảng 0,2 – 0,5 mg/L trong nước uống để đảm bảo hiệu quả khử trù *(nguồn: ngboquinstrument.com)*. WHO đồng thời đặt ra giá trị hướng dẫn sức khỏe là 5 mg/L clo trong nước – mức này được xem là chấp nhận được cho sử dụng trọn đời mà không gây hại sức khỏ *(nguồn: edwi.gov.uk)*. (Nồng độ 5 mg/L rất cao so với thực tế, thể hiện biên an toàn rộng của clo đối với người dùng nước).\n\n- Hoa Kỳ (EPA/CDC): Cơ quan Bảo vệ Môi trường Hoa Kỳ (EPA) quy định mức clo dư tối đa cho phép (MRDL) là 4,0 mg/L đối với nước uố *(nguồn: ngboquinstrument.comcdc.gov)*. Thực tế, đa số hệ thống cấp nước tại Mỹ duy trì clo dư khoảng 0,2 – 2,0 mg/L, thấp hơn nhiều ngưỡng tối đa nà *(nguồn: yboquinstrument.com)*. Trung tâm Kiểm soát Dịch bệnh (CDC) cũng khẳng định nồng độ clo tới 4 mg/L được xem là an toàn trong nước uố *(nguồn: ngcdc.gov)*.\n\n- Anh/Châu Âu: Liên minh Châu Âu không đặt ra giới hạn cụ thể cho clo dư trong Chỉ thị nước uống, nhưng thông lệ các công ty cấp nước thường giữ clo dư ≈0,5 mg/L hoặc thấp hơn tại vòi để đảm bảo an toàn và tránh mùi vị khó chị *(nguồn: udwi.gov.uk)*. Chẳng hạn ở Anh, hầu hết các hãng nước duy trì clo dư ≤0,5 mg/L và thường không quá 1 mg/L tại bất kỳ điểm nà *(nguồn: odwi.gov.ukdwi.gov.uk)*. Mức này nằm dưới ngưỡng 5 mg/L của WHO và được coi là không ảnh hưởng sức khỏe người dùng. Hà Lan là trường hợp tiêu biểu không dùng clo trong xử lý nước (không khử trùng sơ cấp bằng clo và không duy trì clo dư trong mạng lưới)d *(nguồn: wes.copernicus.org)*. Thay vào đó, Hà Lan áp dụng công nghệ khác như lọc nhiều lớp, khử trùng bằng ozone, tia UV, quản lý hệ thống ống sạch kín… để nước vẫn an toàn mà không cần clo dư d *(nguồn: wes.copernicus.orgdwes.copernicus.org)*. Tuy nhiên, mô hình này đòi hỏi chi phí cao và hệ thống phân phối cực kỳ tốt, nên đa số các quốc gia khác vẫn dùng clo hoặc các chất chứa clo (như chloramine) để đảm bảo an toàn nước uố *(nguồn: ngcdc.govcdc.gov)*\n\n- Việt Nam: Theo QCVN 01-1:2018/BYT (Bộ Y tế), clo dư tự do trong nước sinh hoạt phải nằm trong khoảng 0,2 – 1,0 mg/Lt *(nguồn: huvienphapluat.vn)*. Mức khuyến nghị vận hành là khoảng 0,3 – 0,5 mg/L để nước đủ an toàn vi sinh nhưng không có mùi clo rõ. Hàm lượng cao hơn 0,5 mg/L có thể gây mùi nồng và vị khó chịu, trong khi dưới 0,2 mg/L có nguy cơ nước không được khử trùng đầy đủ.\n\nDưới đây là bảng tóm tắt so sánh một số quy định/quy chuẩn về clo dư:\n\nTiêu chuẩn/Quy định\n\nHàm lượng clo dư trong nước uống\n\nViệt Nam (Bộ Y tế) 0,2 – 1,0 mg/L (tiêu chuẩn cho phép hiện hành)\n\nWHO (khuyến nghị) 0,2 – 0,5 mg/L (duy trì hiệu quả khử trùng); 5 mg/L (giá trị sức khỏe tối đa)\n\nHoa Kỳ (EPA) Tối đa 4,0 mg/L (MRDL – mức clo dư khử trùng tối đa cho phép)\n\nAnh/Châu Âu (thông lệ) ≈0,1 – 0,5 mg/L (thường duy trì trong mạng lưới); <1 mg/L (mục tiêu tối đa thông thường)\n\nChú thích: Mặc dù các ngưỡng trên 1 mg/L được xem là vẫn an toàn về mặt độc tính, nhưng nồng độ clo dư cao sẽ gây mùi, vị khó chịu và có thể hình thành phụ phẩm khử trùng gây hại (xem mục 4). Do đó các nhà máy nước thường cố gắng giữ clo ở mức vừa đủ thấp để không ảnh hưởng đến cảm quan và sức khỏe người dù *(nguồn: ngdwi.gov.uk)*.\n\nCác quốc gia tiên tiến không dùng clo thường xuyên đã triển khai các công nghệ hiện đại hơn để xử lý và duy trì chất lượng nước\n\n1. Ozone (O₃) – Oxy hóa cực mạnh\n\n- Diệt vi sinh vật mạnh hơn clo\n\n- Không để lại dư lượng độc hại\n\n- Tuy nhiên: không duy trì được khử trùng trên đường ống ⇒ chỉ dùng tại nhà máy.\n\n2. Tia UV (tia cực tím)\n\n- Phá hủy DNA vi khuẩn, virus\n\n- An toàn tuyệt đối, không tạo sản phẩm phụ\n\n- Nhưng: không có tác dụng kéo dài sau khi rời nhà máy.\n\n3. Lọc màng siêu lọc / màng RO\n\n- Loại bỏ toàn bộ vi khuẩn, virus, ký sinh trùng\n\n- Dùng phổ biến tại Hà Lan, Đức, Singapore\n\n4. Kiểm soát sinh học – duy trì mạng lưới sạch\n\n- Giữ đường ống sạch bằng vi sinh có lợi\n\n- Chống tái nhiễm mà không cần hóa chất\n\n- Cần quản lý kỹ thuật và giám sát cực kỳ tinh vi\n\n🔎 Vì sao Việt Nam vẫn dùng clo?\n\n- Chi phí rẻ, hiệu quả cao trong môi trường nhiệt đới ẩm.\n\n- Mạng lưới cấp nước đô thị lớn, đường ống dài – dễ tái nhiễm vi sinh, nên cần clo dư để bảo vệ.\n\n- Các công nghệ thay thế (ozone, UV...) cần đầu tư rất lớn, không khả thi với quy mô toàn quốc.\n\n3. Hàm lượng clo dư thực tế tại các thành phố lớn ở Việt Nam\n\nTrong thực tế vận hành cấp nước đô thị, hàm lượng clo dư tại vòi có thể dao động và đôi khi vượt ngưỡng tối ưu. Một số khảo sát và số liệu gần đây cho thấy tình hình clo dư ở các thành phố lớn của Việt Nam:\n\n- Tỷ lệ nước máy không đạt chuẩn clo dư: Kết quả kiểm tra của Cục Quản lý Môi trường y tế (Bộ Y tế) cho thấy khoảng 30% mẫu nước máy tại các thành phố không đạt tiêu chuẩn về clo dư (quá thấp hoặc quá cao so với ngưỡng cho phép)m *(nguồn: axdream.vn)*. Điều này đồng nghĩa hàng triệu người dân có thể đang dùng nước chưa đảm bảo về lượng clo dư.\n\n- TP. Hồ Chí Minh: Theo báo cáo của Sở Xây dựng TP.HCM năm 2022, có tới 35% mẫu nước tại TP.HCM có clo dư vượt 0,5 mg/L, cao hơn 1,5 lần so với tỷ lệ mẫu vượt ngưỡng năm 2020m *(nguồn: axdream.vn)*. Điều này cho thấy xu hướng clo dư cao đang gia tăng tại TP.HCM.\n\n- Hà Nội: Nghiên cứu của Viện Khoa học & Công nghệ VN (2021) ghi nhận 42% mẫu nước ở Hà Nội có clo dư vượt mức cho phép, tăng 10% so với 5 năm trước đó *(nguồn: maxdream.vn)*. Hàm lượng clo dư ở Hà Nội nhìn chung cũng nằm trong khoảng cho phép (0,2 – 1,0 mg/L), nhưng tỷ lệ mẫu vượt 0,5 mg/L đang tăng lên, gây lo ngại về mùi clo trong nước sinh hoạt.\n\n- Các đô thị khác: Dù chưa có số liệu chi tiết, tình trạng tương tự có thể xảy ra ở các thành phố lớn khác (Đà Nẵng, Cần Thơ…). Một khảo sát của Hội Bảo vệ Người tiêu dùng năm 2022 cho thấy gần 60% người dân tại các đô thị phàn nàn nước máy có mùi clo nồng hơn mong muố *(nguồn: nmaxdream.vn)*. Điều này phản ánh cảm nhận thực tế của người dùng về clo dư cao ở nhiều nơi.\n\nNhìn chung, đa số nước máy ở Việt Nam vẫn duy trì clo dư trong ngưỡng an toàn, nhưng biến động địa phương (về liều lượng clo châm, chiều dài đường ống, chất lượng nước thô…) có thể dẫn đến chỗ quá thấp, chỗ quá cao. Tthực tế đo lường cho thấy mức clo có thể dao động tùy vị trí trong mạng lưới. Chẳng hạn, khảo sát của Cục Quản lý Môi trường Y tế tại TP.HCM (2015) phát hiện nước ở đầu nguồn mạng lưới có clo dư cao hơn chuẩn, trong khi nước ở cuối nguồn hoặc tầng cao chung cư lại có clo dư quá thấ *(nguồn: ptuoitre.vntuoitre.vn)*. Cụ thể, mẫu nước tại bể chứa ngầm một chung cư ở Thủ Đức đo được 0,73 mg/L clo (vượt giới hạn 0,5 mg/L), một hộ dân gần đó là 0,64 mg/Lt *(nguồn: uoitre.vn)*. Trái lại, nước lấy tại tầng 14 của cùng chung cư chỉ còn 0,06 mg/L clo (thấp hơn mức tối thiểu 0,2–0,3 mg/L)t *(nguồn: uoitre.vn)*. Hiện tượng “đầu thừa, cuối thiếu” này khá phổ biến: gần nhà máy clo cao, xa nhà máy clo cạn kiệt do clo hao hụt dần trên đường ố *(nguồn: ngtuoitre.vn)*. Để đảm bảo cuối mạng lưới vẫn còn ~0,3 mg/L, tổng công ty cấp nước như Sawaco (TP.HCM) thường bơm liều clo cao khoảng 0,9 – 1,1 mg/L tại nhà má *(nguồn: ytuoitre.vn)*. Hậu quả là khu vực gần nguồn có thể tạm thời vượt chuẩn 0,5 mg/L (gây mùi clo mạnh), còn cuối mạng vừa đủ mức an toà *(nguồn: ntuoitre.vntuoitre.vn)*.\n\n4. Tác hại chi tiết của clo dư tới sức khỏe\n\nỞ nồng độ cho phép thông thường (~0,3 – 0,5 mg/L), clo dư trong nước máy không gây hại cấp tính cho sức khỏe và lợi ích khử trùng của nó vượt trội nguy cơ. Tuy nhiên, clo dư cao (đặc biệt khi >0,5 mg/L) hoặc tiếp xúc lâu dài với clo và các phụ phẩm khử trùng có thể dẫn đến một số tác hại sức khỏe đáng chú ý. Dưới đây là 6 nhóm tác hại chính của clo dư đối với cơ thể, kèm giải thích khoa học:\n\nTác hại đối với da\n\nClo có tính oxy hóa và tẩy rửa mạnh, do đó nước máy chứa nhiều clo dư có thể gây kích ứng và tổn thương da. Khi hàm lượng clo vượt mức an toàn (>0,5 mg/L), da tiếp xúc trực tiếp dễ bị khô ráp, bong tróc và nứt nẻ *(nguồn: fptshop.com.vn)*. Những người da nhạy cảm hoặc mỏng yếu có thể thấy hiện tượng đỏ rát, ngứa ngáy chỉ sau vài lần tắm nước nhiễm clo dư.\n\nVề lâu dài, tiếp xúc thường xuyên với clo dư làm mất lớp dầu tự nhiên bảo vệ da, khiến da bị bào mòn, mỏng và yếu đ *(nguồn: imaxdream.vn)*. Da trở nên nhạy cảm hơn với ánh nắng (dễ bắt nắng) và với mỹ phẩm, dễ nổi mẩn đỏ, ngứa và nhanh lão hóa (xuất hiện đốm nâu, nếp nhăn sớm)f *(nguồn: ptshop.com.vn)*. Báo cáo cũng ghi nhận clo dư có thể làm da giảm khả năng tự bảo vệ, tăng nguy cơ viêm da và nhiễm trùng. Đặc biệt ở trẻ nhỏ có làn da mỏng, tác hại này càng rõ.\n\nTác hại đối với tóc\n\nTóc cũng chịu ảnh hưởng tiêu cực khi dùng nước có clo dư cao trong thời gian dài. Clo làm mất độ ẩm và dầu tự nhiên trên sợi tóc, khiến tóc trở nên khô xơ, chẻ ngọn và dễ gãy rụ *(nguồn: ngfptshop.com.vnmaxdream.vn)*. Lớp biểu bì bảo vệ tóc bị clo bào mòn, làm tóc mất độ bóng mượt và chắc khỏe. Nhiều trường hợp sử dụng nước máy nồng độ clo dư cao một thời gian gặp hiện tượng rụng tóc nhiều, sinh gàu bất thườ *(nguồn: ngmaxdream.vn)*.\n\nĐối với tóc nhuộm, clo dư cũng là “khắc tinh” khi có thể làm phai màu tóc nhuộm nhanh chóng, tóc mất độ sáng màu ban đầ *(nguồn: ufptshop.com.vn)*. Nhìn chung, clo dư tương tự như nước ở bể bơi có clo – đều gây hại cho mái tóc nếu không được xử lý.\n\n🔬 Clo là chất oxy hóa mạnh (oxidizing agent):\n\n- Khi tiếp xúc với protein keratin trong da và tóc, clo phá vỡ lớp lipid tự nhiên – hàng rào giữ ẩm và bảo vệ.\n\n- Clo phản ứng với các acid amin trên bề mặt da, làm mất cân bằng pH và gây kích ứng, bong tróc.\n\n🚿 Tác động khi tắm bằng nước chứa clo dư:\n\n- Tóc bị xơ, gãy rụng: do mất độ ẩm và tổn thương lớp biểu bì (cuticle).\n\n- Da bị khô, ngứa, nổi mẩn: do mất lớp dầu tự nhiên và kích ứng nhẹ.\n\n- Đặc biệt ảnh hưởng đến trẻ nhỏ, người có da nhạy cảm hoặc bệnh lý da liễu (viêm da, chàm...).\n\n⏩ Cảm giác “căng da” sau khi tắm là dấu hiệu clo đang can thiệp vào hàng rào bảo vệ sinh học của da.\n\nTác hại đối với mắt\n\nMắt và màng kết mạc là vùng nhạy cảm, có thể bị tổn thương do clo dư trong nước. Khi rửa mặt, tắm gội bằng nước nhiều clo, clo có thể tiếp xúc trực tiếp với bề mặt nhãn cầu và gây kích ứng. Triệu chứng thường gặp là đỏ mắt, rát, chảy nước mắt và nhìn mờ tạm thời.\n\nTiếp xúc kéo dài hoặc nồng độ clo cao có thể gây viêm kết mạc, tổn thương giác mạc. Clo phản ứng với protein và màng lipid trên bề mặt mắt, làm mất cân bằng môi trường tự nhiên của phim nước mắt, dẫn đến khô mắt và giảm thị lự *(nguồn: cmaxdream.vnqcvn.com.vn)*. Đặc biệt, trẻ sơ sinh và trẻ nhỏ tắm nước clo cao có nguy cơ cao bị đau rát mắt và tổn thương mắt do mắt trẻ rất nhạy cả *(nguồn: mqcvn.com.vn)*. Do đó, nếu nước máy có mùi clo mạnh, cần thận trọng khi để dính vào mắt; có thể dùng kính bảo hộ khi tắm cho trẻ nhỏ để tránh kích ứng mắt.\n\nẢnh hưởng đến hệ hô hấp\n\nClo ở dạng khí (bay hơi từ nước nóng khi tắm, hoặc từ nước clo cao để trong không gian kín) có thể tác động xấu đến đường hô hấp khi hít phải. Hít thở phải hơi nước chứa clo hoặc khí clo có thể gây các triệu chứng như ho, khó thở, tức ngực, cay mũi mắ *(nguồn: thoabinhtv.vnqcvn.com.vn)*. Những người có tiền sử hen suyễn đặc biệt nhạy cảm: clo có thể kích phát cơn hen hoặc làm bệnh hô hấp mạn tính nặng hơn.\n\nTrong trường hợp cực đoan (ví dụ sự cố châm quá liều clo vào nước hay trộn lẫn hóa chất), ngộ độc clo cấp tính có thể xảy ra với biểu hiện phù phổi, tổn thương niêm mạc phổi nghiêm trọ *(nguồn: ngqcvn.com.vn)*. Mặc dù tình huống này hiếm, việc hít mùi clo nồng trong thời gian dài (như tắm nước nhiều clo trong phòng tắm kín) vẫn được khuyến cáo nên tránh, vì có thể gây viêm đường hô hấp và giảm chức năng phổi về lâu dà *(nguồn: ihoabinhtv.vn)*. Triệu chứng có thể chỉ là kích ứng (ho, rát mũi) nhưng cũng có thể dẫn đến tổn thương tế bào phổi nếu phơi nhiễm kéo dài. Do đó, khi nước máy có mùi clo mạnh, nên mở thông thoáng phòng tắm và hạn chế hít trực tiếp hơi nước đó.\n\nẢnh hưởng đến hệ tiêu hóa và cơ quan nội tạng\n\nUống nước máy có clo dư trong giới hạn cho phép thường không gây vấn đề cấp tính. Tuy nhiên, tiêu thụ lâu dài nước chứa clo có thể ảnh hưởng nhẹ đến hệ tiêu hóa. Clo dư trong nước uống vào có thể diệt một phần vi khuẩn có lợi trong đường ruột, gây mất cân bằng hệ vi sinh đường ruột. Một số người nhạy cảm có thể bị đau bụng, tiêu chảy khi uống nước clo cao liên tụ *(nguồn: cmaxdream.vn)* – mặc dù các triệu chứng này thường do nguyên nhân khác kết hợp (ví dụ nước chưa lọc hết tạp chất hữu cơ tạo vị khó chịu, gây kích ứng dạ dày).\n\nVề cơ quan nội tạng, một số nghiên cứu chỉ ra mối liên hệ giữa việc hấp thu clo (và sản phẩm phụ) với chức năng gan. Dư lượng clo vào cơ thể lâu ngày có thể tạo thành các hợp chất ảnh hưởng đến gan, dẫn tới rối loạn chức năng gan ở một số trường hợ *(nguồn: phoabinhtv.vn)*. Ngoài ra, clo dư cao còn được cho là có thể suy yếu hệ miễn dịch khi sử dụng lâu dà *(nguồn: ihoabinhtv.vn)*. Cơ chế có thể do các hóa chất phụ phẩm tích tụ làm giảm hiệu suất của hệ miễn dịch, khiến cơ thể dễ nhiễm bệnh hơn. Mặc dù các ảnh hưởng này thường không biểu hiện ngay, về dài hạn chúng là lời cảnh báo rằng sử dụng nước uống có clo dư nên ở mức vừa phải, kiểm soát được.\n\n### Nguy cơ ung thư và tác hại lâu dài khác\n\nMối quan tâm lớn nhất về sức khỏe của clo dư trong nước sinh hoạt là các tác hại lâu dài do phụ phẩm khử trùng sinh ra. Clo phản ứng với chất hữu cơ tự nhiên trong nước tạo ra nhiều hợp chất phụ, trong đó đáng chú ý nhất là chloroform và nhóm trihalomethanes (THMs). Theo tạp chí Occupational and Environmental Medicine, chloroform và THMs được xếp vào nhóm B chất gây ung thư ở ngườ *(nguồn: ihoabinhtv.vn)*. Tiếp xúc lâu dài (qua đường uống, hít, hấp thụ qua da) với các chất này làm tăng nguy cơ ung thư bàng quang, trực tràng và có thể cả ung thư đại trực tràng theo một số nghiên cứu dịch tễ.\n\nKhông những vậy, phụ phẩm clo dư còn có thể tác động lên hệ sinh sản và phát triển: ví dụ, phụ nữ mang thai dùng nước nhiều clo dư có nguy cơ sảy thai hoặc sinh con dị tật bẩm sinh cao hơn bình thườ *(nguồn: nghoabinhtv.vnfptshop.com.vn)*. Các nghiên cứu cũng ghi nhận khả năng tăng các vấn đề tim mạch và suy giảm thần kinh liên quan việc sử dụng nước chứa clo dư lâu dà *(nguồn: ihoabinhtv.vnfptshop.com.vn)*. Chẳng hạn, một số người cao tuổi dùng nước nhiễm THM nặng có tỷ lệ cao hơn bị bệnh tim hoặc giảm trí nhớ, tuy mối quan hệ nhân quả còn đang nghiên cứu thêm.\n\nTóm lại, clo dư và đặc biệt các hóa chất phụ phẩm (như chloramine, chloroform, THMs) là “con dao hai lưỡi”: về ngắn hạn clo bảo vệ chúng ta khỏi bệnh truyền nhiễm, nhưng về dài hạn nếu dư thừa có thể góp phần vào nhiều nguy cơ sức khỏe nghiêm trọng (ung thư, bệnh mạn tính). Do đó, nhiều tổ chức khuyến cáo kiểm soát chặt chẽ clo dư ở mức vừa đủ thấp, đồng thời nghiên cứu áp dụng các công nghệ khử trùng khác (ozone, UV, chloramine…) để giảm thiểu rủi ro từ clo.\n\n## Tại sao clo dễ phản ứng với chất hữu cơ và gây ung thư?\n\n### 🌿 Chất hữu cơ là gì?\n\nTrong nước máy, chất hữu cơ (organic matter) có thể đến từ:\n\n- Xác tảo, vụn lá, rễ cây trong nước mặt.\n\n- Cặn bẩn phân hủy từ sinh vật sống.\n\n- Dư lượng phân bón, thuốc trừ sâu.\n\n⚠️ Phản ứng tạo ra chất gây ung thư:\n\nClo + Chất hữu cơ ⟶ Trihalomethanes (THMs) và Haloacetic acids (HAAs)\n\n🔬 Ví dụ phản ứng cụ thể:\n\n- Cl₂ + CH₃COOH (acid acetic trong rác hữu cơ) ⟶ CHCl₃ (chloroform) + sản phẩm phụ.\n\n- Chloroform là một chất có khả năng gây ung thư (carcinogen) theo WHO và EPA.\n\n📚 Tác hại đã được chứng minh:\n\n- Gây ung thư bàng quang, gan, thận khi uống lâu dài.\n\n- Tổn thương DNA, ảnh hưởng hệ thần kinh trung ương.\n\n- Phụ nữ mang thai tiếp xúc THMs cao có nguy cơ sảy thai hoặc thai nhi dị tật.\n\nTại sao clo dư làm biến đổi – mất chất trong thức ăn?\n\nClo là chất oxy hóa – nên phá huỷ hoặc làm giảm hiệu lực của các hợp chất dinh dưỡng nhạy cảm, đặc biệt là:\n\n🥦 Vitamin C (ascorbic acid):\n\n- Clo phản ứng và oxy hóa vitamin C, làm mất hoạt tính. C₆H₈O₆ + Cl₂ ⟶ C₆H₆O₆ (acid dehydroascorbic) + 2HCl\n\n- → Rau củ mất độ tươi, giảm giá trị dinh dưỡng.\n\n🧬 Enzyme thực vật:\n\n- Bị clo làm biến tính (denature), khiến rau không còn hoạt động sinh học.\n\n- → Rau “chết men” nhanh, dễ úa màu, giảm mùi vị tự nhiên.\n\n🍚 Protein & Amino acids:\n\n- Khi dùng nước có clo để nấu ăn, các acid amin trong thực phẩm bị clo phá vỡ cấu trúc, làm thay đổi mùi vị (nhất là với trứng, súp, nước luộc).\n\n## 5. Biện pháp bảo vệ bản thân và gia đình khỏi clo dư\n\nMặc dù clo dư trong nước máy là cần thiết cho an toàn vệ sinh, người dân hoàn toàn có thể áp dụng các biện pháp để giảm thiểu lượng clo dư trước khi sử dụng, bảo vệ sức khỏe gia đình. Dưới đây là một số cách đơn giản và hiệu quả:\n\n- Đun sôi nước và để nguội: Đun sôi nước giúp clo bay hơi theo hơi nước. Thông thường khoảng 15–20 phút sôi sẽ loại bỏ phần lớn clo dư *(nguồn: maxdream.vn)*. Sau đó nên để nước nguội tự nhiên (không đậy nắp ngay) để clo thoát hết. Lưu ý phương pháp này chỉ hiệu quả với clo tự do, không loại bỏ được một số cloramin (hợp chất clo–amoniac) nếu có *(nguồn: maxdream.vn)*. Nước đã đun sôi nên dùng trong ngày, tránh để lâu ngoài không khí.\n\n- Đổ nước ra chậu/bình và để ngoài không khí: Ở nhiệt độ phòng, clo trong nước sẽ từ từ thoát ra khí. Có thể xả nước máy vào một thau lớn hoặc bình chứa miệng rộng, không đậy nắp và để vài giờ cho clo bay bớ *(nguồn: tmaxdream.vn)*. Cách này đơn giản nhưng khá mất thời gian; sau ~24 giờ có thể vẫn còn một phần clo trong nướ *(nguồn: cmaxdream.vn)*. Nên đặt bình nước ở nơi sạch sẽ, tránh bụi bẩn trong quá trình để thoáng khí.\n\n- Sử dụng bộ lọc than hoạt tính: Than hoạt tính hấp phụ clo tự do rất hiệu quả. Lắp bộ lọc than hoạt tính ở đầu nguồn nước hoặc dùng bình lọc than sẽ giúp loại bỏ phần lớn clo dư cũng như mùi khó chị *(nguồn: umaxdream.vn)*. Đây là phương pháp phổ biến trong các máy lọc nước gia đình. Cần thay lõi lọc định kỳ để đảm bảo hiệu quả.\n\n- Dùng thiết bị/vật liệu khử clo chuyên dụng: Hiện có các vòi sen chứa Vitamin C hoặc gói vitamin C khử clo cho nước tắm. Vitamin C (acid ascorbic) phản ứng và trung hòa clo dư rất nhanh, an toàn cho da tó *(nguồn: cfptshop.com.vn)*. Lắp đầu lọc vòi sen vitamin C giúp giảm clo trong nước tắm, bảo vệ da và tóc khỏi khô ráp. Ngoài ra có thể dùng viên vitamin C thả vào chậu nước trước khi tắm cho trẻ nhỏ để loại clo (liều ~1000 mg cho 100 lít nước). Phương pháp hóa học khác như dùng natri thiosulfate hoặc bisulfite để khử clo có thể áp dụng trong bể bơi, nhưng không khuyến cáo cho nước uống do phức tạp và có thể tạo dư chất khá *(nguồn: cfptshop.com.vn)*.\n\n- Lắp đặt hệ thống lọc nước RO hoặc lọc tổng: Công nghệ thẩm thấu ngược (RO) với màng lọc siêu mịn có thể loại bỏ đến 99% tạp chất, vi khuẩn và hóa chất, bao gồm clo dư và các hợp chất hữu cơ trong nướ *(nguồn: cfptshop.com.vn)*. Máy lọc RO gia đình đảm bảo nước đầu ra gần như không còn clo, an toàn để uống trực tiếp. Với nhu cầu toàn diện hơn, có thể lắp hệ thống lọc tổng đầu nguồn cho cả nhà, kết hợp nhiều giai đoạn lọc (than hoạt tính, trao đổi ion, màng lọc…) giúp nước sinh hoạt không chỉ loại clo dư mà còn giảm kim loại nặng, hóa chất độc, vi sinh vật, bảo vệ sức khỏe cả trong ăn uống lẫn tắm giặ *(nguồn: tmaxdream.vnmaxdream.vn)*. Tuy chi phí đầu tư cao, đây là giải pháp lâu dài cho khu vực nước máy có clo dư cao hoặc nguồn nước nhiều tạp chất.\n\n- Các biện pháp khác: Nếu nhận thấy nước máy có mùi clo đậm bất thường, người dân nên liên hệ đơn vị cấp nước để được kiểm tra, xả súc đường ống nếu cần. Khi sử dụng nước máy hàng ngày, có thể thực hiện vài mẹo nhỏ như: mở vòi nước chảy một lúc buổi sáng để đẩy nước tồn đọng (giúp giảm mùi clo), trữ nước vào bình sành sứ vì vật liệu này giúp clo khuếch tán nhanh hơn kim loại kín, hoặc làm lạnh nước trong tủ lạnh (nhiệt độ thấp giảm mùi clo vị gắt). Luôn nhớ dùng nước sạch mới lấy để nấu ăn, pha sữa, và tránh dùng nước nóng từ bình nóng lạnh (vì thường là nước đã lưu trong bồn chứa có thể còn nhiều clo/chloramine).\n\nKết luận: Clo dư trong nước sinh hoạt là con dao hai lưỡi – cần thiết để diệt khuẩn nhưng cũng tiềm ẩn tác hại nếu quá mức. Hiểu biết đúng về clo dư giúp chúng ta an tâm sử dụng nước máy và chủ động áp dụng các biện pháp giảm thiểu rủi ro (như đun sôi, lọc nước) để bảo vệ sức khỏe bản thân và gia đình. Nên thường xuyên theo dõi thông báo từ cơ quan cấp nước về chất lượng nước (đặc biệt là chỉ số clo dư) và sử dụng các giải pháp lọc phù hợp nếu cần thiết. Với sự cẩn trọng và kiến thức, chúng ta hoàn toàn có thể hưởng lợi từ ưu điểm của clo trong nước máy mà vẫn phòng tránh được các tác động không mong muốn của nó.\n\nTài liệu tham khảo\n\n[1] World Health Organization (2017). Guidelines for drinking-water quality, 4th ed. (Thông tin về giá trị hướng dẫn 5 mg/L clo dư và khuyến nghị clo dư 0,2–0,5 mg/L).\n\n[2] U.S. Environmental Protection Agency (EPA) (2020). National Primary Drinking Water Regulations. (Quy định mức clo dư tối đa 4,0 mg/L trong nước uống tại Hoa Kỳ).\n\n[3] Bộ Y tế Việt Nam (2018). Quy chuẩn QCVN 01-1:2018/BYT – Chất lượng nước sạch sử dụng cho mục đích sinh hoạt. (Quy định clo dư tự do 0,2 – 1,0 mg/L).\n\n[4] Hòa Bình TV (2019). “Nước sạch bốc mùi: Lượng Clo tồn dư nguy hiểm cho sức khỏe ra sao?”. (Bài báo dẫn nghiên cứu về tác hại clo dư: hen suyễn, rối loạn chức năng gan, suy giảm miễn dịch; phụ phẩm clo gây ung thư nhóm B, dị tật thai nhi…).h *(nguồn: oabinhtv.vnhoabinhtv.vn)*\n\n[5] FPT Shop (2023). “Tác hại của clo dư trong nước máy và cách xử lý”. (Bài viết phổ biến kiến thức về clo dư, tác hại lên da, tóc, sức khỏe lâu dài và khuyến nghị cách khử clo dư).f *(nguồn: ptshop.com.vnfptshop.com.vn)*\n\n[6] Maxdream (2025). “Clo dư trong nước: Tác hại & cách xử lý”. (Bài viết cung cấp số liệu thực tế về tỷ lệ mẫu nước vượt clo dư tại Hà Nội, TP.HCM; tác hại của clo dư và giải pháp lọc nước).m *(nguồn: axdream.vnmaxdream.vn)*"
      },
      {
        "slug": "nuoc-cung",
        "tieuDe": "Nước cứng",
        "hang": "D",
        "nhom": "Kiến thức nước",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 3,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Nước cứng\n\nNước cứng là gì\n\n1. Nước cứng là gì?\n\nĐộ cứng của nước quốc tế\n\nNước cứng và làn da\n\nNước cứng và tóc\n\nNước cứng và thiết bị vệ sinh\n\nNước cứng và vải vóc\n\nLàm mềm nước với hạt nhựa\n\nHạt nhựa Resin Dupont Taptec của GE\n\nTái sinh hạt nhựa\n\nCác giai đoạn tái sinh hạt nhựa trong hệ thống làm mềm nước GE\n\nLợi ích nổi bật của công nghệ tái sinh ngược dòng GE\n\n# Nước cứng là gì\n\n## 1. Nước cứng là gì?\n\nNước cứng là nước chứa nhiều ion khoáng hoà tan, chủ yếu là:\n\n- Canxi (Ca²⁺)\n\n- Magie (Mg²⁺)\n\nKhi nồng độ của các ion này vượt quá một mức nhất định, nước sẽ được gọi là nước cứng.\n\n2. Vì sao nước lại cứng? – Hiện tượng hóa học\n\nKhi nước mưa hoặc nước ngầm thấm qua các lớp đá, đặc biệt là đá vôi (CaCO₃), đá dolomit (CaMg(CO₃)₂)…, nó sẽ hoà tan một phần các khoáng chất này.\n\nPhản ứng hoá học:\n\nKhi nước có chứa CO₂ hòa tan (như trong mưa), nó sẽ tạo thành axit cacbonic (H₂CO₃), phản ứng với đá vôi như sau:\n\nCaCO₃ (rắn) + H₂CO₃ → Ca²⁺ + 2HCO₃⁻\n\nTương tự với đá chứa magie:\n\nMgCO₃ + H₂CO₃ → Mg²⁺ + 2HCO₃⁻\n\n=> Kết quả: Nước trở nên giàu ion Ca²⁺ và Mg²⁺ → tạo thành nước cứng tạm thời hoặc vĩnh viễn, tuỳ vào dạng ion tồn tại trong nước.\n\n3. Vì sao nước ở Việt Nam thường cứng?\n\nViệt Nam có đặc điểm địa chất như sau:\n\n- Miền Bắc và miền Trung có nhiều khu vực đá vôi (ví dụ: Ninh Bình, Quảng Bình, Hà Nam…).\n\n- Nước ngầm hoặc nước máy lấy từ sông suối, giếng khoan ở những khu vực này thường đã tiếp xúc với tầng đá vôi lâu dài.\n\n→ Ion Canxi/Magie bị hoà tan nhiều trong nước, khiến nước bị cứng tự nhiên.\n\n4. Tác hại khi ion Ca²⁺ và Mg²⁺ quá nhiều\n\n- Khi đun nóng, các ion này kết hợp với ion bicarbonate tạo thành kết tủa Canxi Carbonat (CaCO₃) và Magie Carbonat (MgCO₃):\n\nCa²⁺ + 2HCO₃⁻ → CaCO₃ ↓ + CO₂ ↑ + H₂O\n\nKết tủa này:\n\n- Bám lên thanh nhiệt, vòi sen, ấm đun nước, gây giảm hiệu suất và dễ hỏng thiết bị.\n\n- Tạo mảng bám trắng, khó vệ sinh.\n\n- Trên da và tóc: kết hợp với xà phòng, tạo màng khó rửa trôi → da khô, tóc xơ, mỹ phẩm không thẩm thấu.\n\n# Độ cứng của nước quốc tế\n\nBên cạnh là bảng so sánh độ cứng của nước tại một số quốc gia quen thuộc với người Việt Nam, chia theo nhóm nước cứng và nước mềm, kèm theo độ cứng tính bằng mg/L (milligram/Liter CaCO₃ tương đương):\n\nỞ Việt Nam:\n\n- Hà Nội và các tỉnh thành phía Bắc: 90 - 200 thậm chí có thể vượt hơn\n\n- Hồ Chí Minh: 50 -70\n\n## Nước cứng và làn da\n\n💧 Phản ứng giữa nước cứng và da – Vì sao da bị khô, bí tắc?\n\nKhi bạn rửa mặt, tắm hoặc rửa tay bằng nước cứng (nước chứa nhiều ion Canxi Ca²⁺ và Magie Mg²⁺), các phản ứng hoá học sau xảy ra:\n\n1. Tạo lớp màng khó rửa trôi\n\n- Các ion Canxi và Magie phản ứng với xà phòng (hoặc sữa rửa mặt có gốc xà phòng) tạo thành muối không tan (ví dụ: canxi stearat).\n\nCa²⁺ + gốc xà phòng (RCOO⁻) → Ca(RCOO)₂ ↓ (kết tủa)\n\nMg²⁺ + RCOO⁻ → Mg(RCOO)₂ ↓\n\n- Màng kết tủa này:\n\n- Không tan trong nước → không thể rửa sạch bằng nước thường.\n\n- Dính chặt lên da và lỗ chân lông.\n\n- Trải mỏng nhưng liên tục, như một lớp màng khoáng trắng đục.\n\n2. Bít tắc lỗ chân lông\n\nCặn khoáng từ nước cứng (chủ yếu là CaCO₃ kết tủa) tích tụ từng ngày → làm dày sừng, bít lỗ chân lông, ngăn không cho tuyến mồ hôi và bã nhờn thoát ra.\n\n- Tạo môi trường yếm khí, ẩm ướt → vi khuẩn dễ phát triển → nổi mụn, viêm nang lông.\n\n- Mặt khác, mỹ phẩm (serum, dưỡng chất) không thể xuyên qua lớp khoáng này → giảm khả năng thẩm thấu, gây lãng phí dưỡng chất.\n\n- Da dễ nổi mụn.\n\n- Da trở nên xỉn màu, sần sùi, thiếu sức sống.\n\n3. Mỹ phẩm không thẩm thấu\n\nLớp màng khoáng trên da hoạt động như một lớp chắn, khiến:\n\n- Serum, kem dưỡng không thấm sâu vào da.\n\n- Hiệu quả dưỡng da giảm đáng kể.\n\nTóm lại qua ảnh minh hoạ:\n\n- Các ion Ca²⁺, Mg²⁺ trong nước tiếp xúc với da → tạo cặn CaCO₃ và muối không tan.\n\n- Lớp cặn này tích tụ thành mảng trắng → bít tắc lỗ chân lông, gây khô da, kích ứng, và giảm hiệu quả chăm sóc da.\n\n## Nước cứng và tóc\n\nPHẢN ỨNG GIỮA NƯỚC CỨNG VÀ TÓC – TÓC KHÔ, YẾU, DỄ RỤNG\n\n1. Thành phần gây hại trong nước cứng\n\n- Nước cứng chứa hàm lượng cao ion Canxi (Ca²⁺) và Magie (Mg²⁺).\n\n- Khi gội đầu, các ion này phản ứng với dầu gội, xà phòng hoặc dầu tự nhiên của tóc, tạo thành muối không tan và kết tủa CaCO₃.\n\n2. Cặn khoáng bám quanh thân tóc\n\nTrên bề mặt sợi tóc, đặc biệt vùng gần chân tóc và nang tóc, lớp cặn trắng này:\n\n- Bám dính như một màng vôi mỏng.\n\n- Làm tóc bị nặng hơn, không còn độ bồng.\n\n- Gây ra ma sát cao hơn, làm tóc dễ gãy rụng.\n\n3. Hậu quả trên sức khỏe tóc\n\n- Tóc khô xơ: Mất độ ẩm, sợi tóc cứng và rối\n\n- Tóc yếu: Gãy giữa sợi, đứt sợi khi chải hoặc buộc\n\n- Dễ rụng tóc: Gốc tóc bị bít bởi cặn, chân tóc yếu đi\n\n- Tóc mất độ bóng: Do lớp khoáng chất phủ mờ bề mặt sợi tóc\n\n## Nước cứng và thiết bị vệ sinh\n\n1. Phản ứng hóa học của nước cứng khi gặp nhiệt hoặc xà phòng\n\nCơ chế hình thành cặn\n\n- Nước cứng chứa ion Canxi (Ca²⁺) và Magie (Mg²⁺) hoà tan.\n\n- Khi gặp nhiệt độ cao hoặc xà phòng, các ion này sẽ xảy ra phản ứng tạo kết tủa không tan: Phản ứng hóa học:\n\nCa²⁺ + 2HCO₃⁻ → CaCO₃ ↓ + CO₂ ↑ + H₂O\n\nMg²⁺ + 2HCO₃⁻ → MgCO₃ ↓ + CO₂ ↑ + H₂O\n\nCaCO₃ và MgCO₃ kết tủa này chính là cặn vôi màu trắng đục mà bạn thấy bám chặt vào:\n\n- Vòi nước, sen tắm\n\n- Khe gạch, lavabo\n\n- Ống dẫn nước, van xả\n\n- Thanh đốt trong máy nước nóng\n\n2. Tác hại của cặn nước cứng trên thiết bị vệ sinh\n\n- Tạo mảng bám trắng cứng đầu: Làm mất thẩm mỹ, khó lau rửa, phải dùng chất tẩy mạnh\n\n- Bít tắc đầu vòi, lỗ thoát nước: Giảm lưu lượng nước, nước phun yếu, vòi nhanh hỏng\n\n- Ăn mòn và oxi hóa kim loại: Cặn giữ ẩm lâu ngày → gây gỉ sét, hỏng lớp mạ crom, vàng ố\n\n- Giảm hiệu suất máy nước nóng: Thanh nhiệt bị bọc kín → tốn điện, đun nước lâu, dễ cháy nổ\n\n- Giảm tuổi thọ thiết bị: Tăng chi phí bảo trì, thay thế thường xuyên\n\nVí dụ thực tế dễ thấy\n\n- Sen tắm mới mua 6 tháng đã bị mảng trắng ở đầu vòi, tắc tia nước.\n\n- Nắp xả bồn cầu đóng không kín vì cặn vôi bám vào gioăng.\n\n- Lavabo bị mốc cạnh, gạch ố tường không còn sáng.\n\n- Máy nước nóng có tiếng kêu lạ, đun lâu, tiêu thụ điện cao hơn.\n\nNước cứng và vải vóc\n\n1. Phản ứng giữa nước cứng và vải vóc\n\n🧪 Về mặt hoá học:\n\n- Trong nước cứng có ion Ca²⁺ và Mg²⁺.\n\n- Khi bạn giặt đồ, các ion này kết hợp với xà phòng tạo ra muối không tan:\n\nCa²⁺ + Xà phòng (RCOO⁻) → Ca(RCOO)₂ ↓ (cặn xà phòng)\n\nCặn này không tan trong nước, bám dính lên bề mặt vải theo thời gian:\n\n- Làm vải trở nên khô cứng.\n\n- Tạo cảm giác thô ráp khi mặc, nhất là đồ cotton, khăn, đồ lót.\n\n- Giảm khả năng thấm hút và thoáng khí của vải.\n\n2. Hậu quả thực tế sau thời gian dài giặt bằng nước cứng\n\n- Vải khô, cứng: Do khoáng chất bám dính làm xơ sợi vải\n\n- Phai màu nhanh: Các cặn khoáng làm giảm độ bám màu, nhất là vải màu đậm\n\n- Giảm độ bền sợi vải: Sợi dễ mục, đứt do ma sát tăng, đặc biệt khi phơi nắng\n\n- Tăng lượng bột giặt cần dùng: Vì xà phòng phản ứng với ion Ca²⁺ → giảm hiệu quả giặt sạch\n\n3. Mẹo dân gian khắc phục hiện tượng này\n\n✅ Ngâm vải với dung dịch có tính axit nhẹ\n\nGiấm trắng hoặc nước cốt chanh thường được dùng để:\n\n- Trung hòa các ion Ca²⁺/Mg²⁺ còn bám lại trên vải.\n\n- Làm mềm sợi vải tự nhiên mà không cần chất làm mềm hóa học.\n\n- Khử mùi hôi do khoáng chất gây ra.\n\nVì sao sợi vải mang điện tích âm?\n\nTính chất vật liệu:\n\n- Các loại sợi như cotton, polyester, wool dễ nhận electron khi bị cọ xát hoặc khi tương tác với ion trong nước → tạo điện tích âm (−).\n\n- Quá trình này gọi là hiện tượng tĩnh điện (triboelectric effect).\n\nKhi gặp nước cứng:\n\n- Ion Ca²⁺ và Mg²⁺ trong nước cứng mang điện tích dương (+).\n\n- Chúng có xu hướng bám vào sợi vải để trung hòa điện tích, từ đó hình thành lớp cặn khoáng bám trên bề mặt vải.\n\nTrong môi trường khô:\n\n- Khi sợi vải mang điện tích âm, các sợi sẽ đẩy nhau ra, tạo hiện tượng vải xù lông, dựng sợi – gây cảm giác thô ráp, không mềm mại.\n\n- Đó là lý do vì sao sau khi giặt và phơi khô bằng nước cứng, quần áo trông xơ xác và kém mềm mại\n\nTóm lại:\n\n- Có – sợi vải có xu hướng mang điện tích âm, nhất là sau giặt sấy.\n\nĐiều này là nguyên nhân khiến:\n\n- Ion dương từ nước cứng bám lên vải.\n\n- Vải bị xù, khô, mất độ mềm.\n\n- Vải dính vào người do tĩnh điện.\n\nLàm mềm nước với hạt nhựa\n\n1. Vì sao nước cần làm mềm?\n\n- Nước cứng chứa nhiều ion Ca²⁺ và Mg²⁺.\n\n- Những ion này gây kết tủa, tạo cặn vôi, và ảnh hưởng đến thiết bị, da, tóc, vải vóc…\n\n- Làm mềm nước = loại bỏ Ca²⁺ và Mg²⁺.\n\n2. Cơ chế trao đổi ion với hạt nhựa cation\n\nHạt nhựa cation là gì?\n\n- Là những hạt polymer nhỏ, mang điện tích âm (-) trên bề mặt.\n\n- Được “nạp sẵn” các ion Natri Na⁺ (hoặc Kali K⁺) – là ion không gây cứng nước.\n\nQuá trình trao đổi ion diễn ra như sau:\n\n👉 Khi nước chảy qua lớp hạt nhựa cation:\n\nCa²⁺ (trong nước) + 2Na⁺ (trên hạt nhựa) → Ca²⁺ (bám lên hạt) + 2Na⁺ (ra nước)\n\nMg²⁺ + 2Na⁺ → Mg²⁺ (bị giữ lại) + 2Na⁺ (giải phóng ra nước)\n\n➡️ Kết quả:\n\n- Ion Ca²⁺ và Mg²⁺ bị giữ lại trên hạt nhựa.\n\n- Ion Na⁺ được “nhả ra” thay thế, giữ cho nước trung tính và không còn cứng.\n\n3. Quá trình tái sinh hạt nhựa\n\n- Sau một thời gian, hạt nhựa “no” ion Ca²⁺/Mg²⁺, mất hiệu quả trao đổi.\n\n- Phải tái sinh bằng dung dịch muối NaCl (nồng độ cao):\n\nNa⁺ (từ muối) thay thế Ca²⁺/Mg²⁺ → đẩy chúng ra khỏi hạt\n\n- Hạt nhựa lại được “nạp đầy” Na⁺ → sẵn sàng cho chu kỳ tiếp theo.\n\n## Hạt nhựa Resin Dupont Taptec của GE\n\nHạt nhựa DuPont™ TapTec™ đạt chứng nhận NSF/ANSI 61 từ tổ chức NSF International (Hoa Kỳ) là một chứng chỉ chất lượng rất uy tín và đáng tin cậy trong ngành nước sạch – đặc biệt khi dùng cho hệ thống lọc nước uống và sinh hoạt gia đình.\n\nNSF/ANSI 61 là gì?\n\n- Là tiêu chuẩn của Mỹ đánh giá an toàn sinh học của vật liệu tiếp xúc với nước uống.\n\n- Được cấp bởi NSF (National Sanitation Foundation) – tổ chức độc lập, phi lợi nhuận và có uy tín toàn cầu.\n\nĐảm bảo vật liệu:\n\n- Không giải phóng kim loại nặng, hóa chất độc hại vào nước.\n\n- Không gây mùi, màu, vị lạ cho nước.\n\n- Được kiểm nghiệm nghiêm ngặt về độ an toàn khi sử dụng lâu dài.\n\nTại sao sau 5-7 năm lại phải thay hạt nhựa\n\n1. Hạt nhựa bị “no” ion Canxi/Magie theo thời gian\n\n- Khi hoạt động, hạt nhựa cation giữ lại ion Ca²⁺, Mg²⁺ và nhả ion Na⁺ ra nước.\n\n- Dù có tái sinh bằng muối NaCl, nhưng quá trình tái sinh không bao giờ đạt 100% – luôn có một phần ion gây cứng bám chặt và không bị đẩy ra.\n\nQua nhiều chu kỳ, hạt nhựa sẽ:\n\n- Mất dần khả năng trao đổi ion.\n\n- Hấp thụ kém → hiệu quả làm mềm giảm.\n\n2. Bề mặt hạt bị lão hoá và mài mòn cơ học\n\nHạt nhựa là polymer chịu tác động của:\n\n- Áp lực dòng nước, nhiệt độ cao (nếu lắp trước máy nước nóng).\n\n- Hóa chất trong nước (sắt, clo, mangan…).\n\nSau 5–7 năm:\n\n- Hạt có thể bị vỡ, mòn, biến chất → không còn hiệu quả.\n\n- Một số hạt bị rửa trôi ra ngoài, giảm thể tích lớp lọc\n\n3. Dấu hiệu nhận biết cần thay hạt nhựa\n\n- Nước sau lọc vẫn còn cứng: TDS hoặc độ cứng không giảm như ban đầu\n\n- Xà phòng ít bọt, vải thô ráp lại: Dấu hiệu Ca²⁺/Mg²⁺ chưa được loại bỏ\n\n- Hết tác dụng chỉ sau vài ngày tái sinh: Hạt đã quá yếu, không giữ ion nữa\n\nTái sinh hạt nhựa\n\nCác giai đoạn tái sinh hạt nhựa trong hệ thống làm mềm nước GE\n\n1. Sản xuất nước (Water Production)\n\n- Nước máy chảy từ trên xuống dưới qua lớp hạt nhựa cation.\n\n- Các ion gây cứng (Ca²⁺, Mg²⁺) được giữ lại, Na⁺ được nhả ra → tạo ra nước mềm.\n\n- Đây là trạng thái hoạt động bình thường của hệ thống.\n\n2. Đẩy nước mềm vào bình muối (Fill Brine Tank)\n\n- Hệ thống đẩy nước mềm vào bình chứa muối để chuẩn bị dung dịch muối NaCl cho tái sinh.\n\n- Đảm bảo muối tan đều trước khi hút vào tái sinh hạt nhựa.\n\n3. Hút nước muối – rửa chậm (Brine Draw / Slow Rinse)\n\n- Dung dịch muối NaCl được hút từ bình muối → đi ngược dòng từ dưới lên qua lớp hạt nhựa.\n\n- Các ion Na⁺ từ muối sẽ thay thế ion Ca²⁺ và Mg²⁺ đã bị giữ lại trước đó.\n\n- Đây là quá trình trao đổi ngược dòng hiệu quả cao, giúp tái sinh toàn bộ hạt mà không bị nén chặt.\n\n4. Rửa ngược (Backwash)\n\n- Nước chảy từ dưới lên với áp lực nhẹ → làm giãn nở và làm sạch lớp hạt nhựa.\n\n- Loại bỏ cặn bẩn, ion còn sót lại, bụi mịn tích tụ.\n\n- Giúp hạt không bị đóng bánh và kéo dài tuổi thọ.\n\n5. Rửa nhanh (Fast Rinse)\n\n- Nước sạch chảy từ trên xuống với lưu lượng cao để rửa trôi muối dư thừa còn trong hệ thống.\n\n- Đảm bảo nước sau lọc không có vị mặn.\n\nLợi ích nổi bật của công nghệ tái sinh ngược dòng GE\n\n- Tái sinh từ dưới lên: Tránh nén hạt → tái sinh toàn phần, hiệu quả\n\n- Ít tiêu hao muối hơn: Tiết kiệm 30–50% muối tái sinh\n\n- Giảm tiêu thụ nước:  Tối ưu lưu lượng rửa, giảm chi phí vận hành\n\n- Hạn chế rò rỉ muối ra nước dùng: Đảm bảo vị nước sạch, không mặn sau tái sinh\n\n- Tăng tuổi thọ vật liệu lọc: Giữ hạt nhựa bền, tránh vón cục, hao mòn"
      },
      {
        "slug": "vi-nhua",
        "tieuDe": "Vi nhựa",
        "hang": "D",
        "nhom": "Kiến thức nước",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 4,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Vi nhựa\n\nVi nhựa trong nước uống: Thực trạng, tác hại và giải pháp\n\nChatGPT Deep Research ngày 5/7/2025\n\n1. Nước đóng chai và vấn đề vi nhựa đối với sức khỏe\n\nNhiều nghiên cứu đã phát hiện nước uống đóng chai chứa lượng hạt vi nhựa rất lớn, tiềm ẩn rủi ro cho sức khỏe người dùng. Một khảo sát toàn cầu năm 2018 do Orb Media thực hiện cho thấy 93% mẫu nước đóng chai của các thương hiệu lớn bị nhiễm vi nhựa, với mức trung bình khoảng 325 hạt vi nhựa trong mỗi 1 lít nước . Các hạt này có kích thước <5 mm (nhỏ hơn hạt vừng) và thường được làm từ chính vật liệu chai lọ và nắp nhựa. Thật vậy, nghiên cứu phát hiện các polymer phổ biến trong nước đóng chai bao gồm 2 PET (nhựa làm chai), PP (nhựa làm nắp) và PS (có thể từ quy trình sản xuất) . Ngược lại, nước máy cũng nhiễm vi nhựa nhưng mức độ thấp hơn nhiều – một nghiên cứu năm 2017 phát hiện 81% mẫu nước 3 máy trên thế giới có vi nhựa nhưng chỉ khoảng 4,3 hạt/lít trung bình .\n\nViệc chứa nước trong chai nhựa PET có thể góp phần giải phóng vi nhựa vào nước do ma sát và lão hóa vật liệu. Một nghiên cứu mới công bố 2024 thậm chí sử dụng kỹ thuật quang học tiên tiến đã đếm được trung bình 240.000 mảnh nhựa siêu nhỏ trong mỗi lít nước đóng chai, trong đó 90% là nanoplastic (<1 µm) 4  khó quan sát . Con số này cao gấp 10–100 lần so với các ước tính trước đây, cho thấy nước đóng chai có 4 thể là nguồn phơi nhiễm vi nhựa lớn hơn chúng ta tưởng . Dù chưa có kết luận chắc chắn về tác hại sức khỏe của lượng vi nhựa này, giới khoa học ngày càng lo ngại về ảnh hưởng lâu dài khi các hạt nhựa siêu 5 6 nhỏ có thể tích tụ trong cơ thể .\n\n2. Ống nước PPR, PVC, PE của các hãng tại Việt Nam và nguy cơ vi nhựa\n\nCác hệ thống ống dẫn nước bằng nhựa – bao gồm ống PPR (polypropylene random), PVC (polyvinyl chloride), PE/HDPE (polyethylene) – đang được sử dụng phổ biến bởi nhiều thương hiệu ở Việt Nam như Tiền Phong, Bình Minh, Vesbo (Đức), Dekko, Dismy, EuroPipe, v.v. Mặc dù thuận tiện và bền nhẹ, các đường ống nhựa này có nguy cơ phát sinh vi nhựa trong nước theo thời gian. Nghiên cứu cho thấy vật liệu nhựa trong ống có thể nứt, tróc “khá nhanh” khi lão hóa, đặc biệt do tương tác với nước và hóa chất khử 7 trùng (như clo) trong nguồn nước . Bề mặt trong của ống nhựa dần bị bong tróc, giải phóng từng 8 mảnh vi nhựa vào dòng nước . Khi nước đã qua xử lý tại nhà máy chảy qua mạng lưới ống dẫn đến vòi sử dụng, nồng độ vi nhựa được đo thấy tăng lên rõ rệt nếu đường ống làm bằng nhựa (so sánh mẫu tại 9 nhà máy và tại vòi) . Điều này gợi ý bản thân hệ thống ống nhựa là một nguồn ô nhiễm vi nhựa vào nước sinh hoạt.\n\nGiữa các loại nhựa, ống PVC có xu hướng thải vi nhựa nhiều hơn so với một số polymer khác. Một nghiên cứu năm 2024 tại ĐH Tongji (Trung Quốc) so sánh 4 vật liệu ống cho thấy ống PVC giải phóng vi nhựa 10 nhiều đáng kể so với ống PPR, HDPE và thép không gỉ, trong đó ống PE (HDPE) thải vi nhựa ít nhất . Nguyên nhân có thể do cấu trúc PVC kém bền hơn dưới tác động cơ học và hóa học, dễ bị nứt vỡ tạo mảnh vụn nhựa. Ngược lại, ống PPR và HDPE dẻo dai hơn nên ít bong tróc hơn, còn ống kim loại (đồng, thép không gỉ) hoàn toàn không tạo vi nhựa (dù chúng có thể gặp vấn đề khác như gỉ kim loại). Thật vậy, nội soi vi mô thành ống PVC đã quan sát thấy những vết rỗ, lỗ thủng li ti và các mảnh nhựa rách trên bề mặt 11 trong, bất kể tuổi thọ ống mới hay cũ . Các mảnh vụn này sẽ trôi theo dòng nước đến tận vòi, đi vào cốc nước của người dùng. Do đó, dù ống nhựa đạt tiêu chuẩn của các hãng uy tín (kể cả Vesbo của Đức với chất lượng cao), thì về bản chất vật liệu polymer vẫn tiềm ẩn nguy cơ vi nhựa khi sử dụng lâu dài. Chất lượng sản xuất và phụ gia ổn định của các thương hiệu lớn có thể giúp ống bền hơn, song không loại bỏ hoàn toàn hiện tượng lão hóa nhựa. Các yếu tố như nhiệt độ cao, áp lực nước, và sự phát triển của vi sinh vật (biofilm) trong ống đều có thể đẩy nhanh quá trình xuống cấp của nhựa, làm tăng lượng vi 12\n\nnhựa bong ra theo thời gian .\n\n3. Máy lọc nước giá rẻ và nguy cơ nhiễm vi nhựa\n\nKhông chỉ vật liệu chứa nước, các thiết bị lọc nước kém chất lượng cũng có thể trở thành nguồn phát tán vi nhựa vào nước uống. Những máy lọc nước giá rẻ, không rõ tiêu chuẩn thường dùng vỏ nhựa và lõi lọc chất lượng thấp. Lõi lọc sản xuất kém có thể tự rò rỉ các mảnh vi nhựa vào nước trong quá trình sử 13 dụng . Đặc biệt, các máy lọc nước tự lắp ráp từ linh kiện trôi nổi, không đồng bộ có nguy cơ cao bị hở, 13 mòn khiến vi nhựa từ vỏ, lõi nhựa kém chất lượng xâm nhập vào nước lọc . Thay vì cải thiện chất lượng nước, những thiết bị này vô tình bổ sung thêm các hạt vi nhựa cực nhỏ mà mắt thường không thấy được.\n\nNgược lại, các hệ thống lọc nước được chứng nhận và sản xuất theo tiêu chuẩn cao (ví dụ công nghệ châu Âu) thường sử dụng vật liệu an toàn hơn như vỏ bằng thép không gỉ hoặc nhựa nguyên sinh chịu bền, cùng màng lọc tiên tiến (công nghệ nano, siêu lọc UF, thẩm thấu ngược RO). Những máy lọc chất lượng có thể loại bỏ đáng kể vi nhựa khỏi nước uống – thậm chí màng lọc RO còn chặn được cả hạt cỡ micron và 14 nano nhựa . Vì vậy, việc đầu tư máy lọc nước uy tín không chỉ giúp loại bỏ tạp chất và vi khuẩn mà còn giảm thiểu lượng vi nhựa trong nước mà chúng ta tiêu thụ hàng ngày. Lưu ý thêm rằng bảo trì, thay lõi định kỳ cũng rất quan trọng: lõi lọc quá hạn hoặc xuống cấp có thể trở thành nguồn ô nhiễm ngược, giải phóng sợi nhựa hoặc mảnh nhựa từ chính lõi. Do đó, để đảm bảo an toàn, người dùng nên tránh các thiết bị lọc nước giá rẻ, không rõ nguồn gốc và tuân thủ hướng dẫn thay lõi của nhà sản xuất nhằm hạn chế nguy cơ vi nhựa.\n\n4. Nước đóng chai tái sử dụng dưới nắng nóng – nguy cơ phát sinh vi nhựa\n\nTại Việt Nam, thời tiết nắng nóng thường xuyên và thói quen tái sử dụng chai, bình nhựa nhiều lần có thể làm tăng mạnh lượng vi nhựa trong nước uống. Nhiệt độ cao và ánh nắng mặt trời là “kẻ thù” của nhựa, khiến nhựa nhanh lão hóa và giòn gãy hơn. Các chai nước (ví dụ bình 20 lít hoặc chai PET nhỏ) nếu để lâu ngoài trời nắng sẽ bị tia UV và nhiệt làm suy yếu cấu trúc, dẫn đến nhiều hạt vi nhựa tách ra, hòa vào 15 nước . Nghiên cứu cho thấy cùng một loại chai, mẫu phơi dưới nắng có tới ~326 hạt vi nhựa/L, cao 16 gần gấp đôi so với ~181 hạt/L ở mẫu giữ trong mát . Như vậy, việc các đại lý hoặc người dùng tồn trữ và vận chuyển nước đóng chai dưới trời nắng nóng có thể vô tình “ngâm” nước uống trong môi trường khiến chai nhựa tróc ra nhiều vi nhựa hơn.\n\nBên cạnh nhiệt độ, thói quen tái sử dụng nhiều lần chai nhựa dùng một lần cũng làm tăng rủi ro. Một chai PET khi uống xong nếu được đổ đầy lại và dùng đi dùng lại nhiều lần sẽ chịu ma sát cơ học (đóng mở nắp, bóp chai) và áp lực lặp đi lặp lại, khiến bề mặt trong chai mòn dần và giải phóng vi nhựa 217 18 nhiều hơn mỗi lần tái sử dụng . Các thử nghiệm cho thấy sau khoảng 7–10 lần tái sử dụng, số 19 20\n\nlượng vi nhựa trong nước tăng vọt do chai bắt đầu xuống cấp trầm trọng . Đó là lý do chuyên gia khuyến cáo không nên tái sử dụng chai nước nhựa dùng một lần, vì mỗi lần tái sử dụng sẽ tăng tốc quá 18\n\ntrình mài mòn bên trong chai và thôi nhiễm vi nhựa vào nước . Ngoài ra, các tác động vật lý khác như rung lắc khi vận chuyển, nước đóng chai bơm chiết ở áp lực cao cũng đã được chứng minh là góp 21 phần tạo ra vi nhựa trong sản phẩm cuối . Do đó, để giảm thiểu vi nhựa, nước đóng chai nên được bảo quản nơi râm mát, thoáng mát, tránh ánh nắng trực tiếp và không nên lắc mạnh. Hạn chế tối đa việc để các bình nước trên xe máy, xe tải dưới trời nắng hoặc cạnh nguồn nhiệt. Khi uống hết, không nên đổ nước mới vào chai nhựa cũ quá nhiều lần; thay vào đó, hãy dùng chai mới hoặc chuyển sang bình chứa làm bằng chất liệu bền vững hơn.\n\n5. Các nghiên cứu tiêu biểu về vi nhựa trong nước và cơ thể người\n\nNgày càng có nhiều bằng chứng khoa học khẳng định sự hiện diện rộng rãi của vi nhựa trong môi trường và chuỗi thực phẩm – nước uống chỉ là một ví dụ điển hình. Dưới đây là một số nghiên cứu tiêu biểu chứng minh mức độ ô nhiễm vi nhựa và gióng lên hồi chuông cảnh báo về vấn đề này:\n\n•  Nghiên cứu Orb Media (2017 & 2018): Đây là những khảo sát quy mô lớn đầu tiên về vi nhựa trong nước. Kết quả cho thấy đa số mẫu nước máy trên thế giới đều có vi nhựa (81% mẫu, trung bình ~4\n\n1 hạt/L) và đặc biệt là nước đóng chai còn ô nhiễm nặng hơn (93% mẫu, trung bình ~325 hạt/L) 3 . Nghiên cứu cũng xác định nguồn gốc vi nhựa trong nước đóng chai chủ yếu từ vật liệu bao bì 2  (nhựa PET của chai, PP của nắp) và quy trình đóng gói . Phát hiện này chứng minh gần như tất cả chúng ta đều đang nuốt phải vi nhựa khi uống nước hàng ngày.\n\n•  Phân tích của Schymanski et al. (2018): Công bố trên tạp chí Nature năm 2018, nghiên cứu này sử dụng phương pháp μ-Raman để phát hiện hạt nhựa rất nhỏ trong nước khoáng đóng chai. Kết quả 2\n\nxác nhận phổ biến nhất là các hạt PET, PP và PS – trùng khớp với vật liệu chai và nắp nhựa . Điều này khẳng định thêm rằng chính chai nhựa là nguồn phát sinh vi nhựa vào nước uống.\n\n•  Nghiên cứu của Leslie et al. (2022): Lần đầu tiên, vi nhựa đã được phát hiện trong máu người. Nghiên cứu đăng trên tạp chí Environment International cho thấy những mảnh nhựa cỡ micro và 22\n\nnano có thể xâm nhập vào hệ tuần hoàn, lưu thông khắp cơ thể . Đây là minh chứng trực tiếp rằng con người không chỉ tiêu thụ vi nhựa qua đường tiêu hóa mà các hạt nhỏ còn vượt qua hàng rào sinh học để đi vào máu, làm dấy lên lo ngại về tác động toàn thân.\n\n•  Nghiên cứu NIH/PNAS (2024): Sử dụng kỹ thuật quang học tiên tiến (SRS microscopy), các nhà khoa 23 học đã “soi” được cả những hạt nanoplastic <1 µm trong nước đóng chai . Kết quả cho thấy một chai nước chứa đến hàng trăm ngàn mảnh nhựa và nhiều loại polymer khác nhau, từ nylon (polyamide) cho đến PET, PVC, PMMA, polystyrene... . Điều đáng nói là 90% số mảnh là kích 24 thước nano, trước đây “vô hình” với các phương pháp cũ. Nghiên cứu này chứng minh rằng ô nhiễm vi nhựa nghiêm trọng hơn nhiều so với ước tính trước đây, đồng thời mở ra phương 24 25 pháp mới để tiếp tục giám sát vi nhựa trong nước máy, không khí và mô sinh học .\n\n•  Nghiên cứu về ống nhựa và vi nhựa (2023): Như đề cập ở mục 2, một nhóm khoa học Ba Lan (Świetlik và Magnucka, 2023) đã thu thập mẫu ống nước đã qua sử dụng và tìm thấy các vết nứt vi mô, vảy bong tróc bên trong thành ống PVC và PE, kèm theo vô số hạt nhựa vi mô và nano bám 26 27 trên bề mặt . Thử nghiệm nước chảy qua những ống này cũng cho thấy lượng vi nhựa tăng 39 lên đáng kể so với nước đầu vào . Phát hiện này lần đầu trực tiếp chứng minh ống nhựa dẫn nước đóng góp vi nhựa vào nước uống của người dân.\n\nNgoài ra, còn rất nhiều nghiên cứu khác về vi nhựa trong môi trường và sinh vật: vi nhựa được tìm thấy ở hầu khắp các đại dương, sông hồ; trong muối biển, hải sản, thậm chí trong rau củ và không khí chúng ta hít 28 29 thở . Các khảo sát ước tính trung bình một người có thể hấp thụ hàng chục nghìn hạt vi nhựa mỗi năm qua ăn uống và hít thở. Chẳng hạn, mỗi ngày con người có thể nuốt tới ~883 hạt vi nhựa (chủ 8 yếu qua nước uống) theo một phân tích tổng hợp gần đây . Tất cả các bằng chứng này đều khẳng định sự phổ biến của vi nhựa trong đời sống và đặt ra câu hỏi cấp bách về ảnh hưởng của chúng đối với sức khỏe cộng đồng.\n\n6. Tác động của vi nhựa đối với sức khỏe con người\n\nVi nhựa và nano nhựa khi vào cơ thể có thể gây ra nhiều tác hại tiềm tàng ở cấp độ tế bào và cơ quan. Dưới đây là những ảnh hưởng chính đã được các nghiên cứu ghi nhận:\n\nHình: 5 tác hại chính của vi nhựa đối với sức khỏe con người (Nguồn: Tổng hợp từ các nghiên cứu).\n\nGây viêm và stress oxy hóa: Các hạt vi nhựa có thể kích thích sản sinh các gốc oxy hóa tự do\n\n•  (ROS), dẫn đến stress oxy hóa làm hư hại ADN, protein và lipid của tế bào . Môi trường viêm 30 nhiễm do vi nhựa gây ra có thể dẫn đến tổn thương mô và là nền tảng cho nhiều bệnh mạn tính.\n\n•  Rối loạn hệ miễn dịch và hô hấp: Khi hít phải vi nhựa, các hạt nhỏ có thể đi sâu vào phổi, gây 31\n\nviêm phổi và suy giảm chức năng hô hấp . Cơ thể nhận diện vi nhựa như vật lạ, kích hoạt phản ứng miễn dịch quá mức, lâu dài có thể làm suy yếu hệ miễn dịch. Một số nghiên cứu trên động vật cũng cho thấy vi nhựa gây rối loạn đáp ứng miễn dịch và ảnh hưởng thần kinh do tác động lên 30\n\nhàng rào máu não .\n\n•  Nguy cơ gây ung thư: Vi nhựa có thể mang theo các chất phụ gia độc hại từ quá trình sản xuất nhựa, tiêu biểu là phthalates và bisphenol A (BPA) – các hóa chất được biết đến như chất gây rối 32 33\n\nloạn nội tiết và tiềm ẩn nguy cơ gây ung thư . Thí nghiệm trên chuột cho thấy hạt vi nhựa tích tụ trong gan, làm tăng stress oxy hóa và tổn thương tế bào, có thể dẫn đến hình thành khối u 32 . Mặc dù chưa có nghiên cứu dài hạn trên người, việc tiếp xúc mãn tính với vi nhựa và các hóa chất gắn liền với chúng (như chất tạo màu, chất chống cháy, kim loại nặng trong nhựa) được cho là 34 35 yếu tố nguy cơ cho các bệnh ung thư và rối loạn chuyển hóa .\n\n•  Ảnh hưởng đến hệ sinh sản: Nhiều hóa chất trong vi nhựa thuộc nhóm độc chất nội tiết (EDCs) – chúng can thiệp vào hoạt động hormone. Phthalates từ vi nhựa có thể làm mất cân bằng hormone sinh sản, giảm chất lượng tinh trùng và trứng, ảnh hưởng đến khả năng sinh sản . Phụ nữ 36 mang thai phơi nhiễm vi nhựa có nguy cơ cao các hạt xuyên qua nhau thai (vi nhựa đã được tìm thấy trong nhau thai người) và ảnh hưởng xấu đến sự phát triển của thai nhi. Các nghiên cứu cũng ghi nhận vi nhựa gây giảm tỷ lệ sinh sản ở động vật thí nghiệm, cảnh báo nguy cơ với con người trong dài hạn.\n\n•  Tích tụ và tổn thương đa cơ quan: Do kích thước siêu nhỏ, vi nhựa có thể xuyên qua màng ruột 37 để vào máu và hệ bạch huyết . Một khi đã vào tuần hoàn, chúng có thể di chuyển đến các cơ 4\n\nquan như gan, thận, tim… Các hạt vi nhựa được phát hiện trong mô gan, lách, phổi và thậm chí 38 não động vật thí nghiệm . Sự hiện diện lâu dài của chúng trong mô có thể gây viêm mạn tính và tổn thương tế bào tại chỗ. Ví dụ, vi nhựa trong phổi có thể chỉ gây kích ứng cơ học nhưng cũng đủ 31 dẫn đến viêm và xơ hóa mô phổi . Tương tự, vi nhựa trong mạch máu có thể thúc đẩy hình thành mảng xơ vữa hoặc cục máu đông (dù điều này còn đang nghiên cứu). Tóm lại, tích lũy vi nhựa trong cơ thể là mối nguy tiềm ẩn cho nhiều hệ cơ quan, từ tim mạch, hô hấp đến nội tiết, thần kinh.\n\nĐiều đáng lưu ý là các ảnh hưởng trên vẫn đang tiếp tục được nghiên cứu làm rõ. Cho đến nay, chưa có nghiên cứu dịch tễ nào trên người khẳng định trực tiếp vi nhựa gây bệnh cụ thể, nhưng bằng chứng gián tiếp và trên động vật ngày càng nhiều. Các hạt vi nhựa có thể không độc về mặt hóa học, nhưng chúng là chất kích thích cơ học và là vector mang chất độc: bề mặt vi nhựa hấp phụ các chất ô nhiễm hữu cơ, vi khuẩn, kim loại nặng… khi vào cơ thể sẽ giải phóng những thứ đó ra xung quanh mô. Thật vậy, các nhà khoa học đã đề xuất nhiều giả thuyết về nguy cơ vi nhựa, bao gồm tổn thương vật lý mô, phản 39 40  ứng viêm, độc tính hóa học từ phụ gia, và rối loạn nội tiết . Một báo cáo của WHO năm 2019 chỉ ra rằng đa phần vi nhựa >150 μm có thể được bài tiết qua phân, nhưng các hạt nhỏ <1.5 μm mới là đáng 41 lo vì có thể hấp thu vào máu và phân bố trong cơ thể . Tóm lại, dù còn cần nghiên cứu thêm, giới khoa học khuyến cáo không nên chủ quan – vi nhựa rõ ràng là một nguy cơ sức khỏe tiềm ẩn và việc giảm 42 tiếp xúc là hoàn toàn cần thiết .\n\n7. Giải pháp giảm thiểu vi nhựa trong nước uống\n\nMặc dù vi nhựa hiện diện khắp nơi, chúng ta hoàn toàn có thể thực hiện những biện pháp thông minh để giảm thiểu đáng kể lượng vi nhựa xâm nhập cơ thể từ nước uống. Dưới đây là những khuyến nghị dựa trên bằng chứng khoa học và lời khuyên chuyên gia:\n\n•  Hạn chế dùng nước đóng chai, ưu tiên nước máy + lọc: Nếu nguồn nước máy an toàn về vi sinh, hãy sử dụng nước máy thay cho nước đóng chai. Việc chuyển từ uống nước chai sang nước máy 43 có thể giảm lượng vi nhựa hấp thụ từ ~90.000 xuống còn ~4.000 hạt mỗi năm . Nước máy thường chứa ít vi nhựa hơn do đã qua xử lý, và quan trọng là tránh được nguồn vi nhựa từ bao bì nhựa. Bạn có thể lắp hệ thống lọc tại vòi hoặc bình lọc than hoạt tính để cải thiện mùi vị và loại bỏ thêm tạp chất nếu cần. Đối với nước uống hàng ngày, dùng bình đựng nước cá nhân bằng thủy 44\n\ntinh hoặc thép không gỉ thay cho chai nhựa dùng một lần . Thói quen này vừa bảo vệ môi trường vừa giảm đáng kể nguy cơ nuốt vi nhựa từ chai lọ.\n\n•  Sử dụng máy lọc nước chất lượng cao: Đầu tư máy lọc nước có chứng nhận (ví dụ tiêu chuẩn 44 NSF/ANSI 401 về khả năng lọc vi nhựa) là biện pháp hiệu quả để loại bỏ vi nhựa khỏi nước uống . Các công nghệ lọc như RO (thẩm thấu ngược), nano filtration hoặc ultrafiltration (UF) có lỗ lọc rất nhỏ (từ 0.001–0.0001 micron) đủ sức lọc được cả vi nhựa và nano nhựa. Đảm bảo mua máy lọc từ nhà sản xuất uy tín, có vỏ và lõi làm bằng vật liệu an toàn (tránh máy quá rẻ vỏ nhựa kém như đã nêu ở mục 3). Đồng thời, thay lõi lọc đúng hạn theo khuyến cáo để ngăn ngừa lõi cũ phân hủy tạo vi nhựa. Một hệ thống lọc tốt không chỉ loại vi nhựa mà còn giữ lại các khoáng chất có lợi (tùy loại máy), giúp bạn yên tâm hơn với chất lượng nước uống.\n\n•  Tránh để nước nhựa tiếp xúc nhiệt và dùng quá lâu: Như đã phân tích ở mục 4, nhiệt độ và thời gian là hai tác nhân chính gây thôi nhiễm vi nhựa. Vì vậy, không lưu trữ nước uống trong chai/lọ nhựa dưới nắng hoặc nơi nóng (ví dụ cốp xe hơi đóng kín ngoài trời). Luôn để bình nước ở nơi mát 515 mẻ, tránh ánh nắng trực tiếp . Tuyệt đối không dùng lại chai nhựa mỏng dùng một lần cho 18\n\nmục đích chứa nước uống lâu dài . Nếu cần tái sử dụng, hãy chỉ dùng trong thời gian rất ngắn rồi thay chai mới. Đối với bình nước 20L có thể tái sử dụng, hãy kiểm tra hạn sử dụng của bình do nhà sản xuất quy định, vệ sinh bình định kỳ và loại bỏ nếu thấy bình có dấu hiệu nứt, trầy xước nhiều.\n\n•  Lựa chọn vật liệu đường ống và đồ dùng an toàn: Trong gia đình, nếu có điều kiện, xem xét sử dụng các vật liệu ống dẫn nước ít hoặc không phát thải vi nhựa. Ví dụ, ống PPR hoặc HDPE 10\n\nthường bền và trơ hơn so với PVC về khả năng bong tróc vi nhựa . Ở những vị trí nhạy cảm (như đoạn ống cuối cấp nước uống trực tiếp, ấm đun nước nóng), có thể cân nhắc dùng ống thép không gỉ hoặc đồng để hoàn toàn tránh vi nhựa. Tương tự, chọn dụng cụ chứa nước bằng thủy tinh, inox, sứ thay vì nhựa. Cốc uống nước, bình giữ nhiệt, ấm đun siêu tốc… nên là loại không làm từ nhựa để hạn chế tối đa nhựa tiếp xúc với nước uống, đặc biệt dưới nhiệt độ cao. Khi đựng nước nóng, tuyệt đối không dùng chai nhựa thông thường vì nhiệt độ sẽ khiến nhựa giải phóng hàng loạt hóa chất và vi nhựa vào nước.\n\n•  Nâng cao nhận thức và thực hành “xanh”: Cuối cùng, giải pháp lâu dài là giảm phụ thuộc vào đồ nhựa dùng một lần và nâng cao ý thức cộng đồng. Hãy từ chối khi không cần thiết: ví dụ mang bình cá nhân khi mua nước để tránh dùng chai nhựa mới, hạn chế uống nước đóng chai nhựa trừ tình huống bất khả kháng. Thực hiện tốt thông điệp “3R”: Refuse (từ chối đồ nhựa không cần thiết), Reduce (giảm thiểu sử dụng nhựa), Recycle (tái chế đúng cách). Càng ít nhựa trong sinh hoạt, chúng ta càng giảm được nguồn vi nhựa tiềm ẩn. Các chuyên gia nhấn mạnh việc thay đổi thói quen tiêu dùng sẽ tạo sức ép để nhà sản xuất cải tiến, sử dụng vật liệu an toàn hơn thay cho nhựa truyền 45 46 thống . Về phía doanh nghiệp và quản lý, cần thúc đẩy các chính sách hạn chế nhựa dùng một lần, giám sát chặt chẽ chất lượng nước uống đóng chai và tiêu chuẩn vật liệu ống dẫn nước.\n\nTóm lại: Vi nhựa trong nước uống là vấn đề mới nổi nhưng không thể xem nhẹ. Bằng việc hiểu rõ nguồn gốc và nguy cơ của vi nhựa, chúng ta có thể chủ động áp dụng các biện pháp thông minh – từ thay đổi thói quen sử dụng nước đến cải thiện hệ thống lọc và chứa nước – nhằm bảo vệ sức khỏe cho bản thân và cộng đồng. Giảm thiểu vi nhựa cũng chính là góp phần bảo vệ môi trường sống, hướng tới một tương lai an toàn và bền vững hơn.\n\nTài liệu tham khảo: Nghiên cứu và số liệu trong bài được tổng hợp từ các nguồn uy tín như báo cáo khoa học, tạp chí Nature/PNAS, khuyến cáo của WHO và các tổ chức môi trường… (xem trích dẫn inline). Các trích 1 3 dẫn tiêu biểu: Orb Media (2017, 2018) về vi nhựa trong nước , NIH (2024) về vi nhựa nano trong chai 4 7 9 nước , Safe Piping Matters (2023) về vi nhựa từ ống nhựa , DowntoEarth (2023) về tác hại tái sử 17 18 dụng chai nhựa , cùng nhiều nghiên cứu trên Science Direct, Nature, Environment International… Các nguồn này cho thấy bức tranh toàn diện về thực trạng vi nhựa và nhấn mạnh sự cần thiết của hành động\n\ngiảm thiểu vi nhựa ngay từ hôm nay. 1 10\n\n1 2 3 13 14 22 28 29 30 31 32 36 38\n\nMáy lọc nước giá rẻ và nguy cơ nhiễm vi nhựa vào cơ thể https://w *(nguồn: ww.geyser.com.vn)*/tin-tuc/may-loc-nuoc-gia-re-va-nguy-co-nhiem-doc-hat-vi-nhua/\n\n4 23 24 25 Plastic particles in bottled water | National Institutes of Health (NIH) https://w *(nguồn: ww.nih.gov)*/news-events/nih-research-matters/plastic-particles-bottled-water 6\n\n5 6 15 17 18 21 33 34 35 37 39 40 41 42 plastic water bottles Microplastics time-bomb: Why we should not reuse https://w *(nguồn: ww.downtoearth.org.in)*/pollution/microplastics-time-bomb-why-we-should-not-reuse-plastic-water-bottles-88668\n\n7 8 9 11 12 26 27  Plastic Pipes, Microplastics & Impacts on Human Health – Safe Piping Matters\n\nhttps://s *(nguồn: afepipingmatters.org)*/2023/12/01/plastic-pipes-microplastics-impacts-on-human-health/\n\n10 Microplastic release by PVC Piping https://w *(nguồn: ww.linkedin.com)*/pulse/microplastic-release-pvc-piping-cameron-craig-dtkwc\n\n16 19 20 Diagram The effect of reusing plastic water bottles on the concentration of... | Download Scientific https://w *(nguồn: ww.researchgate.net)*/figure/The-effect-of-reusing-plastic-water-bottles-on-the-concentration-of-microplastics when_fig1_364655255\n\n43 44 45 46 How to reduce microplastic exposure and protect your health » Yale Climate Connections https://y *(nguồn: aleclimateconnections.org)*/2025/05/how-to-reduce-microplastic-exposure-and-protect-your-health/ 7"
      },
      {
        "slug": "cong-nghe-loc-dau-nguon",
        "tieuDe": "Công nghệ lọc đầu nguồn",
        "hang": "D",
        "nhom": "Công nghệ lọc",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 5,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Công nghệ lọc nước đầu nguồn\n\n1. Công nghệ lọc nước đầu nguồn tại Việt Nam\n\nTại Việt Nam, các công nghệ lọc nước đầu nguồn được sử dụng khá đa dạng, tùy thuộc vào nguồn nước đầu vào (nước máy, nước giếng, nước sông, suối…) và mục đích sử dụng (sinh hoạt, ăn uống, sản xuất). Dưới đây là tổng hợp các công nghệ lọc nước đầu nguồn phổ biến tại Việt Nam, phân theo từng nhóm:\n\n### 🔹 1. Lọc cơ học (cơ bản, thô sơ)\n\n- Bộ lọc cặn thô (PP, lưới Inox, lưới Nylon): loại bỏ rác, bùn đất, cặn lớn > 5 micron.\n\n- Ứng dụng: Lọc sơ bộ trước khi đưa nước vào bồn chứa hoặc vào hệ thống lọc tinh.\n\n🔹 2. Lọc bằng than hoạt tính (Activated Carbon)\n\n- Cơ chế: Hấp phụ clo dư, mùi, màu, chất hữu cơ độc hại, thuốc trừ sâu, kim loại nặng nhẹ.\n\n- Nguồn than: Than gáo dừa, than đá, than củi hoặc than hoạt tính cao cấp như Sri Lanka Black Carbon.\n\n- Ứng dụng: Lọc mùi clo trong nước máy; cải thiện mùi vị nước giếng.\n\n🔹 3. Lọc bằng vật liệu xúc tác / khử kim loại\n\n- KDF55 (USA): Loại bỏ kim loại nặng (chì, thủy ngân), diệt khuẩn bằng phản ứng oxy hóa khử.\n\n- Birm / Greensand / Manganese: Loại bỏ sắt, mangan, asen, hydro sunfua trong nước giếng khoan.\n\n- Ứng dụng: Nước giếng có màu vàng, có mùi tanh, đóng cặn\n\n🔹 4. Làm mềm nước (Softener)\n\n- Cơ chế: Trao đổi ion (resin) để loại bỏ canxi, magie – nguyên nhân gây nước cứng.\n\n- Vật liệu: Nhựa trao đổi ion cation mạnh (DuPont TapTec, Purolite…).\n\n- Tái sinh: Dùng muối tinh NaCl để hoàn nguyên.\n\n- Ứng dụng: Nhà có thiết bị vệ sinh cao cấp, spa, villa, khách sạn.\n\n🔹 5. Lọc bằng màng lọc tiên tiến\n\n- Màng UF (Ultrafiltration): loại bỏ vi khuẩn, vi rút, chất rắn hòa tan lớn.\n\n- Màng RO (Reverse Osmosis): thẩm thấu ngược, cho nước tinh khiết gần như tuyệt đối.\n\n- Màng Nano: lọc kim loại nặng, giữ khoáng chất tự nhiên.\n\n⚠️ RO ít dùng trong lọc đầu nguồn vì gây lãng phí nước, thường dùng cho nước uống.\n\n🔹 6. Khử trùng nước\n\n- UV diệt khuẩn: sử dụng đèn cực tím để tiêu diệt vi sinh vật (vi khuẩn, vi rút).\n\n- Ozone: có tác dụng khử mùi, diệt khuẩn, oxy hóa mạnh.\n\n- Clo hóa: phổ biến trong hệ thống cấp nước đô thị nhưng thường cần lọc lại.\n\n🔹 7. Giải pháp lọc tổng tích hợp (GE, A.O. Smith, Kangaroo…)\n\n- Cấu hình phổ biến: Tiền lọc Inox – Lọc than hoạt tính + KDF – Làm mềm – Diệt khuẩn UV.\n\nBáo cáo lạm dụng"
      },
      {
        "slug": "nuoc-mem-muoi-na-cao",
        "tieuDe": "Nước mềm — muối Na+ cao",
        "hang": "D",
        "nhom": "Công nghệ lọc",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 6,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Nước mềm - Muối Na+ cao\n\nTrả lời cho thắc mắc của khách hàng hoặc các hãng khác tư vấn khách là hệ lọc tổng sử dụng muối để hoàn nguyên hạt nhựa sẽ giải phóng 1 lượng Na+ (muối) vào trong nước khiến hàm lượng Na+ cao và gây ảnh hưởng sức khoẻ (những người có bệnh tim mạch)\n\n1. Cơ chế làm mềm nước – trao đổi ion:\n\n- Hạt nhựa trao đổi ion thay thế mỗi ion Ca²⁺ hoặc Mg²⁺ bằng 2 ion Na⁺\n\n- Với 1 mg/L CaCO₃ loại bỏ → sinh ra ~0,46 mg/L Na⁺\n\n- HCM - đầu vào 70 mg/L => sau lọc <17 mg/L => loại 53 mg/L => Na⁺ tăng: 53 x 0,46 = 24.4 mg/L\n\n- HN: đầu vào 120 mg/L => sau lọc <17 mg/L => loại 103 mg/L => Na⁺ tăng: 103 x 0,46 = 47.4 mg/L\n\nVới kết quả này nếu sử dụng nước mềm uống trực tiếp (không lắp thêm máy lọc nước uống tại vòi):\n\n- Hoàn toàn an toàn cho sức khỏe (WHO và QCVN cho phép đến 200 mg/L Na⁺).\n\n- Nếu uống 2 lít/ngày → nạp vào 50–100 mg Na⁺ từ nước, chỉ bằng 1 lát bánh mì.\n\nNhưng trên thực tế, GE khuyến nghị tất cả khách hàng đều lắp lọc nước uống tại vòi sử dụng công nghệ lọc màng, hàm lượng khoáng bao gồm Na+ tự nhiên được giữ lại rất thấp, dưới đây là bảng so sánh:\n\n- HCM: sau khi lọc tổng và lọc nước uống GE, hàm lượng Na+ trong nước còn lại là 0,3 - 4,2 mg/L\n\n- HN: sau khi lọc tổng và lọc nước uống GE, hàm lượng Na+ trong nước còn lại là 0,7 - 1,6 mg/L\n\nNhư vậy nếu so với tiêu chuẩn WHO (quốc tế) và QCVN (Việt Nam) cho phép tối đa 200mg/L và nước khoáng đóng chai Evian 6-10 mg/L"
      },
      {
        "slug": "chan-dung-khach-hang-ge",
        "tieuDe": "Chân dung khách hàng GE",
        "hang": "D",
        "nhom": "Khách hàng",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 7,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Chân dung khách hàng GE\n\n# Demographics:\n\n- 48% nam, 52% nữ\n\n- 59% 8x, 31% 9x\n\n- 54% Hà Nội, 28% HCM, 15% tỉnh khác (Hạ Long 4%, các thành phố khác 2%: Hải Phòng, Bắc Ninh, Đà Nẵng, Thanh Hoá, Hà Tĩnh, Pleiku)\n\n- 52% chung cư, 46% nhà đất (28% villa, 11% nhà đất, 7% toà nhà)\n\n- 81% xây mới, 17% đã vào ở\n\n- 35% chủ doanh nghiệp, 11% con nhà giàu, 9% quản lý cấp cao MNCs, 7% xây dựng (KTS), 6% influencer, 6% MMO, 4% Kinh doanh, 2% quan chức\n\nChi tiết\n\nhttps://d *(nguồn: ocs.google.com)*/spreadsheets/d/14eRHq0X6BPptECVVIafAYJ5VuzMSN8z6wQ6a04126aA/edit?gid=828658212#gid=828658212\n\n<aside> 💡\n\n- Giới tính & độ tuổi: Văn phong cần linh hoạt theo từng phân khúc, đảm bảo gần gũi, dễ hiểu, hiện đại và phù hợp với lối sống của khách hàng.\n\n- Khách hàng ở chung cư: Hiểu rõ nhu cầu và những khó chịu có thể gặp phải, ví dụ tiếng ồn khi máy xả rửa ban đêm, hay việc tòa nhà đã có hệ thống lọc/nước nóng riêng. Nội dung nên đưa giải pháp thiết thực, nhấn mạnh sự tiện lợi và nhỏ gọn phù hợp không gian chung cư.\n\n- Khu chung cư cao cấp tại các thành phố lớn: Tận dụng bối cảnh thực tế khi quay content, nhắc đến chất lượng nước khu vực này để tạo tính thuyết phục. Ads target cụ thể theo vị trí địa lý quanh các khu đô thị này.\n\n- Nhóm khách xây nhà mới: Tập trung vào mối quan tâm “lắp lọc nước ở đâu, vào giai đoạn nào”, kết hợp cùng nhu cầu tìm hiểu các thiết bị nội thất/gia dụng. Nội dung nên gợi mở bằng câu dẫn như: “Bạn đang xây nhà…”, “Bạn đang cải tạo tổ ấm…” để tạo sự kết nối.\n\n- Nhóm chủ doanh nghiệp: Vì bận rộn nên cần giải pháp máy vận hành tự động, ít phải quan tâm, để họ yên tâm chăm sóc gia đình.\n\n- Nhóm khách hàng giàu có: Ưa chuộng công nghệ mới, sản phẩm cao cấp và tối tân. Content nên khai thác yếu tố lifestyle, thể hiện phong cách sống sang trọng.\n\n- Nhóm KTS, thầu xây dựng, điện nước: Do liên quan trực tiếp đến giai đoạn xây dựng và lắp đặt, họ cũng là đối tượng quan trọng cần thấy nhiều nội dung/quảng cáo, nhằm tạo ảnh hưởng đến quyết định mua của khách hàng cuối. </aside>\n\nĐặc điểm vật chất:\n\n- Oto sang, có tài xế riêng\n\n- Nhà ở khu chung cư, đô thị cao cấp (Ciputra, Ecopark, Vin, Thảo Điền)\n\n- Nhà có quản gia riêng, giúp việc hoặc trợ lý\n\n- Nhà đang xây mới: nên sẽ làm việc với các đơn vị thiết kế/thi công, các đơn vị nội thất/gia dụng cao cấp\n\n- Thường không chỉ xây 1 nhà mà đây có thể là căn thứ 2, thứ 3 nên đã có kinh nghiệm từ những lần xây sửa nhà trước\n\n<aside> 💡\n\nKhi tư vấn và làm truyền thông sẽ tập trung các vấn đề:\n\n- Bảo hành bảo trì chăm sóc khách hành </aside>\n\nMối quan tâm sức khoẻ\n\nTrích từ các chia sẻ và tương tác với khách hàng thực tế\n\n- Thường là người vợ/người mẹ là đối tượng quan tâm đến sức khoẻ cả gia đình: các câu chuyện được chia sẻ như “Chị mang thai và dị ứng da nên cần nguồn nước sạch”, “Chị chuyển về Hà Nội nên thấy tóc rụng và da sạm, đầu tư để cho cả con gái đang tuổi dậy thì”, “Bác sĩ có chia sẻ là trẻ con bây giờ thiếu khoáng nên răng không chắc như ngày xưa, màu răng trong thiếu canxi”, “Bé nhà chị du học Nhật về da bị break-out thường xuyên mà không hiểu lý do”.\n\n- Với khách hàng nam họ cũng sẽ quan tâm đến vấn đề “rụng tóc” (các cặn canxi và magie bám sẽ làm sợi tóc nặng dễ rụng hơn”, “cặn bám đầy vách kính vệ sinh”, ngoài ra có thể đưa thêm câu chuyện giảm tuổi thọ thiết bị trong nhà, tiêu hao nhiều năng lượng hơn\n\n- Với khách hàng trẻ tuổi (cặp đôi vợ chồng): sẽ quan tâm chất lượng sức khoẻ của cả vợ lẫn chồng, rất văn minh và muốn nghe nhiều tư vấn về chất lượng nước (khách sẽ kỹ tính nên tư vấn càng chính xác khách càng nghe, khách có khả năng tự tìm hiểu trên mạng), thiết kế đẹp gọn thẩm mỹ (sẽ muốn đi xem trực tiếp máy), yếu tố thương hiệu, yếu tố vận hành tự động, ngoài ra nên chia sẻ trao đổi thêm với khách cả về các vấn đề khác như (chất lượng không khí/lọc không khí, chất lượng các vấn đề khác trong xây nhà)\n\n<aside> 💡\n\nThay vì đi theo lối mòn chỉ xoáy vào các thông số kỹ thuật hay tính năng khô khan, GE lựa chọn một cách tiếp cận khác biệt và giàu cảm xúc hơn:\n\n1. Hệ thống lọc tổng: Được định vị như “Beauty – Step Zero”, bước khởi đầu quan trọng để làm sạch và nuôi dưỡng làn da, mái tóc một cách dịu nhẹ ngay từ nguồn nước sinh hoạt. (Dĩ nhiên, toàn bộ tính năng kỹ thuật tiên tiến của lọc tổng GE vẫn được đảm bảo đầy đủ.)\n\n1. Máy lọc nước uống: Được định vị như “Health – Everyday Minerals”, mang đến nguồn khoáng tự nhiên tinh khiết và ổn định mỗi ngày, giúp cả gia đình duy trì sức khỏe bền vững từ bên trong.\n\n</aside>\n\nPainpoint của khách hàng\n\nTrích từ các chia sẻ và tương tác với khách hàng thực tế\n\n- Phần lọc nước quan trọng là khâu chăm sóc sau bán hàng: bảo hành và bảo trì như thế nào, khi có sự cố thì bao lâu sẽ xuất hiện để xử lý vì nước là sử dụng hàng ngày trực tiếp cho cả gia đình.\n\n- Khách ở tỉnh xa thường sẽ quan tâm có đại lý kĩ thuật ở địa phương không\n\n- Có nhiều đơn vị sau lắp máy không có bảo trì định kì mà chỉ thu tiền đến đổ muối 150k/lần và không cần kiểm tra vệ sinh gì máy (A.O.Smith)\n\n- Có đơn vị máy sau lắp nhưng nước vẫn vàng, lắp thêm cột than nhưng vẫn không xử lý được (mới lắp được 1 năm) và khách phải liên hệ với các hãng khác xem có phương án không (TGL)\n\n- Có đơn vị máy lắp 2 năm đầu ok, từ năm thứ 3 thì cặn canxi lại bám đầy trên vách kính (do không lắp lõi than nên có thể clo dư trong nước làm hỏng hạt nhựa, kĩ thuật kém) (Karofi)\n\n- Có khách hàng bị chết hết vườn cây do lắp lọc tươi và nước sục xả rửa đẩy thẳng vào đường nước dùng ban ngày lúc tưới cây (nước nhiễm mặn) (Drop)\n\n- Khách quan trọng xử lý sau bán hàng nhanh, kịp thời, giữ được cam kết sản phẩm\n\n- Mỗi lần kĩ thuật đến thay lõi cho khách hàng chỉ báo 1 đơn giá chi phí cao mà không giải thích hoặc báo trước với khách hàng (A.O.Smith). Thiếu thông tin đầy đủ, minh bạch tới khách hàng\n\n<aside> 💡\n\nCần tập trung vào khâu chăm sóc khách hàng:\n\n- Học hỏi từ mỗi lần tương tác với khách hàng để làm tốt hơn\n\n- Học cách chăm sóc khách hàng và làm dịch vụ của người Nhật\n\n- Truyền thông các hoạt động chăm sóc sau bán hàng (thực tế) như một lợi thế cạnh tranh G+ Care </aside>\n\nHành trình xây nhà\n\n1. Giai đoạn chuẩn bị\n\n- Khảo sát – xin phép xây dựng – thiết kế bản vẽ Chủ nhà làm việc với KTS, đơn vị thi công để chốt bản vẽ. 👉 Lọc nước: Đây là lúc nên tính luôn vị trí đặt hệ thống lọc tổng (trước khi cấp nước vào nhà, sơ đồ cấp, bơm) và chừa sẵn đường ống cho máy lọc nước uống (thường ở bếp hoặc khu vực tiện lợi). Nếu tính từ đầu, sẽ tránh phải đục phá/ thay đổi sau này.\n\n2. Thi công phần thô\n\n- Đào móng, dựng khung, xây tường, đi ống nước – điện ngầm 👉 Lọc nước: Chỉ cần chừa sẵn vị trí ống đầu nguồn (nơi đặt lọc tổng) và đường cấp riêng cho khu bếp (máy lọc uống). Chưa lắp thiết bị lúc này. Tuy nhiên cần phối hợp với bên thi công để đảm bảo đường cấp theo đúng yêu cầu\n\n3. Thi công hoàn thiện\n\n- Ốp lát, sơn, lắp thiết bị điện – nước, nội thất cố định 👉 Lọc tổng: Thường lắp sau khi xong phần đường ống, ngay trước khi chủ nhà bắt đầu dọn vào ở. 👉 Lọc uống: Lắp khi bếp đã hoàn thiện tủ/kệ, để đấu nối gọn gàng và thẩm mỹ.\n\n4. Nghiệm thu – hoàn thiện nội thất – dọn vào ở\n\n- Kiểm tra hệ thống nước, điện, thiết bị gia dụng, nội thất di động 👉 Đây là lúc kỹ thuật GE hoặc đơn vị lắp đặt tiến hành chạy thử lọc tổng và lọc uống, hướng dẫn sử dụng, kết nối IoT (nếu có), và bàn giao cho gia chủ.\n\n<aside> 💡\n\nMỗi chủ đầu tư sẽ liên hệ với đơn vị lọc nước ở từng giai đoạn khác nhau (dành cho sales)\n\n- Trước khi hoàn thiện bản vẽ: khó chốt (khách chỉ tham khảo trước) hoặc có ưng nhưng quá lâu liên hệ lại cũng sẽ không còn nhu cầu. Thường cũng không qua khảo sát nên ko gặp được chủ nhà ⇒ Tuy nhiên nên khuyến nghị chủ nhà chốt sớm từ giai đoạn này để đưa vào bản vẽ thiết kế tránh sau phát sinh thêm (đưa ra ví dụ: nhà c Linh Thảo Điền không tách được đường nước riêng tưới vườn không đi qua hệ lọc, một vài nhà ở HCM Q7 áp lực tốt không cần téc chứa phía trên, nước thuỷ cục vào nhà chia thẳng đến các điểm sử dụng như chung cư, hoặc các nhà chung cư cần phải thi công thêm trần hoặc với Vin còn phần xử lý nước nóng) và GE sẽ tư vấn trọn gói (cả bơm, téc nước, đường ống, thiết kế)\n\n- Đang thi công thô làm đường ống điện nước: vẫn sớm nhưng giai đoạn này có thể qua khảo sát và làm việc với đơn vị MEP (điện nước) rồi và có thể tận dụng đây là giai đoạn phù hợp làm đường chờ để qua gặp khách và chốt sản phẩm đơn hàng\n\n- Đã xong phần thô đang thi công nội thất: lúc này vào sẽ hơi muộn có thể cần phát sinh thêm chi phí thi công điện nước cấp cho chủ nhà (nhất là với chung cư) tuy nhiên nếu chờ nữa còn muộn hơn) nên có thể chốt hợp đồng luôn\n\n- Đã gần hoàn thiện nội thất dọn vào ở hoặc đã vào ở: Vẫn lắp được tuy nhiên có thể phát sinh điều chỉnh đường ống và nếu đã ở lâu có thể tư vấn thêm chủ nhà việc vệ sinh trọn gói toàn bộ đường ống nước cũ trong nhà </aside>\n\n<aside> 💡\n\nVì lý do này nên sales có thể mở rộng các kênh:\n\n- Các kiến trúc sư, các đơn vị thi công thiết kế: chỉ lựa chọn các bên tập trung tư gia và phân khúc trung-cao cấp (ưu tiên các phân khúc mà quảng cáo không thể/khó tiếp cận như 6x-7x và quan chức)\n\n- Thông tin thị trường từ các đơn vị liên quan trong quá trình xây nhà: Điện nước, Đèn, Chiếu sáng, Nhà thông minh, Cảnh quan, Âm thanh,….\n\n- Cách sales thị trường: lấy thông tin khách hàng trực tiếp khi đi qua các khu đô thị cao cấp có các công trình đang thi công (sẽ tiết kiệm công sức đi rải rác, và vì lọc nước có chăm sóc 3 tháng/lần nên dễ quay lại) </aside>\n\nBáo cáo lạm dụng\n\nChi tiết trang\n\nĐã cập nhật trang\n\nBáo cáo lạm dụng"
      },
      {
        "slug": "cac-lo-ngai-cua-khach-hang",
        "tieuDe": "Các lo ngại của khách hàng",
        "hang": "D",
        "nhom": "Khách hàng",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 8,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Các lo ngại của khách hàng\n\nDưới đây là thông tin tổng hợp từ các lần giao tiếp trực tiếp với khách hàng\n\n- Nước thiếu khoáng => Chị Quỳnh Anh (Thảo Điền HCM) có lo lắng vì các bác sĩ có khuyến nghị rằng hiện tại trẻ em rất thiếu khoáng nên khiến răng yếu (thiếu canxi) so với ngày xưa, 1 trong những lý do đó là nước lọc ra đã là nước tinh khiết\n\n- Da nhạy cảm => Chị Alice Ngân cơ địa da nhạy cảm nên lo ngại clo dư, chất bẩn trong nước sẽ ảnh hưởng đến da  nên khi chuyển về Heritage Westlake chị có tìm 1 đơn vị để xử lý lọc tổng cho căn của mình\n\n- Vi nhựa => 1 khách hàng CTS10 rất quan ngại về vấn đề vi nhựa trong nước do nhiều khuyến cáo sức khoẻ gần đây, 1 chị khách hàng lọc tổng khác cũng lo lắng không biết nước sau máy lọc nước còn vi nhựa không (lõi lọc, các bình chứa vẫn là nhựa)\n\n- Da của con cái => Chị Bùi Trang khi chuyển từ Hạ Long về Hà Nội khu vực Hà Đông thấy nước  bẩn hơn lo cho con gái da sẽ bị ảnh hưởng"
      },
      {
        "slug": "insight-khach-hang",
        "tieuDe": "Insight khách hàng",
        "hang": "D",
        "nhom": "Khách hàng",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 9,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Insight khách hàng\n\nCác thông tin sau lấy từ ChapGPT deep reserach (24/06/2025)\n\n## 2. Xu hướng tiêu dùng nổi bật ở nhóm khách hàng cao cấp (HN & TP.HCM)\n\nSức khỏe và an toàn là ưu tiên hàng đầu: Nhóm khách hàng sống tại các khu đô thị cao cấp, chung cư hạng sang và biệt thự hiện nay đặc biệt quan tâm đến chất lượng nước sinh hoạt. Họ ý thức rõ rằng nước máy thành phố “sạch nhưng chưa thật sự an toàn” do có thể tái nhiễm bẩn trên đường ống (kim loại nặng từ ống cũ, clo dư, vi sinh xâm nhập) hoặc sự cố nguồn cấp . Những sự kiện ô nhiễm nghiêm trọng (như vụ dầu thải vào nước Sông Đà năm 2019 ảnh hưởng 18% dân Hà Nội) đã làm giới trung lưu và thượng lưu lo ngại, từ đó đẩy mạnh nhu cầu lắp hệ thống lọc nước tại nhà để bảo vệ sức khỏe gia đình . Việc sử dụng máy lọc nước dần trở thành tiêu chuẩn tất yếu trong các hộ gia đình hiện đại nhằm đảm bảo nguồn nước an toàn cho mọi sinh hoạt hàng ngày . Thực tế ghi nhận nhiều người cao tuổi, trước đây không dùng máy lọc, nay cũng chủ động sắm thiết bị này sau khi được con cháu tư vấn, coi đó như một thiết bị gia dụng không thể thiếu để sống khỏe .\n\nXu hướng “nước khỏe” và công nghệ cao: Người tiêu dùng cao cấp không chỉ muốn “nước sạch” mà còn hướng tới “nước khỏe” với các lợi ích tăng cường. Xu hướng nổi bật vài năm gần đây là sử dụng máy lọc nước ion kiềm, hydrogen – được quảng bá giúp cân bằng axit, tốt cho sức khỏe. Nhiều khách hàng sẵn sàng nâng cấp từ máy lọc cơ bản lên máy tạo nước hydrogen/kiềm dù giá thành cao, vì tin vào các lợi ích cho cơ thể . Ví dụ, các dòng máy ion kiềm tươi giá 50-100 triệu đồng đã trở nên phổ biến và bán rất chạy trong giới thượng lưu . Họ xem sản phẩm này như một biểu tượng cho lối sống lành mạnh, đẳng cấp, thậm chí làm quà tặng tân gia giá trị cao . Bên cạnh đó, nhóm khách hàng đô thị giàu có cũng ưa chuộng những công nghệ lọc nước hiện đại và thuận tiện: máy lọc tích hợp nóng lạnh, tạo nước có gas (soda) phục vụ phong cách sống thời thượng; các tính năng thông minh như cảnh báo thay lõi tự động, kết nối IoT điều khiển từ xa; thiết kế nhỏ gọn âm tủ hoặc để bàn sang trọng. Họ đề cao sự tiện nghi và thẩm mỹ: máy lọc nước phải vừa đảm bảo nước ngon và tốt, vừa là một phần nội thất hài hòa trong căn nhà hiện đại. Không ít người sẵn sàng chi tiền cho những model đoạt giải thiết kế quốc tế (iF, Red Dot), xem đó là khoản đầu tư nâng cao chất lượng sống.\n\nBao phủ mọi nhu cầu nước sinh hoạt – “từ uống đến tắm”: Khác với nhóm khách hàng bình dân chỉ quan tâm nước uống, giới khách hàng cao cấp có xu hướng xử lý nước toàn diện cho cả ngôi nhà. Họ chú trọng cải thiện trải nghiệm sinh hoạt: nước sau lọc phải không còn mùi clo, nấu ăn ngon hơn, pha trà cafe đúng vị hơn . Đặc biệt, nhu cầu về nước mềm cho tắm giặt đang tăng lên rõ rệt. Nhiều cư dân chung cư hạng sang phàn nàn nước máy cứng làm khô da, rụng tóc, ố vàng thiết bị vệ sinh – do đó họ tìm đến hệ thống làm mềm nước trung tâm để biến nước máy thành nước “chuẩn spa” ngay tại nhà . Nước mềm, không clo giúp da dẻ mịn màng, tóc suôn mượt, trẻ nhỏ tắm không bị mẩn ngứa, người lớn thư giãn như ở resort. Quần áo giặt bằng nước đã qua làm mềm cũng sạch và mềm hơn, ít đóng cặn xà phòng , bảo vệ các trang phục cao cấp. Có thể nói, xu hướng tận hưởng “nước sạch chuẩn spa” đang hình thành trong giới thượng lưu đô thị: họ muốn mọi giọt nước sử dụng trong gia đình – từ nước uống, nước nấu ăn đến nước tắm rửa – đều phải tinh khiết, an toàn và mang lại trải nghiệm dễ chịu nhất.\n\nƯu tiên thương hiệu và trải nghiệm cao cấp: Người mua phân khúc này có tâm lý “chi tiền cho thương hiệu xứng tầm”. Họ chuộng các nhãn hiệu ngoại nổi tiếng (Mỹ, Nhật, châu Âu) do tin tưởng vào chất lượng và đẳng cấp thương hiệu. Chẳng hạn, nhiều chủ biệt thự sẵn sàng lắp hệ thống lọc tổng Pentair (Mỹ) đắt tiền bởi uy tín toàn cầu về độ bền và hiệu quả lọc . Tương tự, máy lọc nước GE, 3M, A. O. Smith thường được lựa chọn trong các căn hộ cao cấp dù giá cao hơn, vì “tiền nào của nấy”. Bên cạnh đó, nhóm khách hàng này đề cao dịch vụ trọn gói và hậu mãi: họ mong muốn được tư vấn kỹ càng, lắp đặt chuyên nghiệp, bảo hành nhanh chóng tận nơi. Nắm bắt xu hướng đó, các hãng như A. O. Smith, GE… đều cung cấp dịch vụ bảo trì định kỳ, thay lõi tại nhà và chăm sóc khách hàng cao cấp (tổng đài riêng, ứng dụng theo dõi chất lượng nước) để giữ chân nhóm khách VIP. Ngoài ra, xu hướng “xanh” cũng ảnh hưởng đến quyết định mua của một bộ phận khách hàng cao cấp: họ thích giải pháp lọc nước giảm rác thải nhựa, coi việc dùng máy lọc thay bình nước đóng chai vừa tiện lợi vừa góp phần bảo vệ môi trường . Có thể thấy, người tiêu dùng ở biệt thự, chung cư hạng sang hiện nay có yêu cầu rất cao và toàn diện: nước phải thật sự an toàn cho sức khỏe, đem lại trải nghiệm sống tốt hơn, thương hiệu sản phẩm phải uy tín, và dịch vụ đi kèm phải tương xứng với số tiền họ bỏ ra.\n\n## 3. Hành vi mua sắm và hành trình ra quyết định\n\nThời điểm và động cơ ra quyết định: Đối với khách hàng cao cấp, nhu cầu lắp đặt hệ thống lọc nước đầu nguồn thường xuất hiện ở hai thời điểm chính: (1) Khi xây mới hoặc cải tạo nhà – chủ nhà có xu hướng tích hợp luôn hệ thống lọc tổng trong giai đoạn hoàn thiện, nhằm đồng bộ hạ tầng và tránh đục phá sau này; (2) Khi chuyển vào ở và trải nghiệm nguồn nước thực tế – nhiều người ban đầu chưa lắp lọc tổng nhưng sau vài tháng sử dụng nhận thấy nước có vấn đề (cặn bẩn đóng ở thiết bị vệ sinh, đóng cặn đáy ấm, mùi clo khó chịu, da khô tóc rụng…) sẽ quyết định đầu tư hệ thống lọc. Động lực mạnh mẽ nhất vẫn là bảo vệ sức khỏe gia đình, đặc biệt nếu nhà có trẻ nhỏ hoặc người già. Bên cạnh đó, những lý do thực dụng như bảo vệ thiết bị gia dụng đắt tiền (máy giặt, máy rửa bát, bình nóng lạnh không bị đóng cặn), tiện nghi sinh hoạt (không phải mua nước bình, không phải đun nước sôi) và nâng tầm giá trị ngôi nhà (tiện ích cao cấp tăng giá trị bất động sản) cũng thúc đẩy quyết định mua. Một số gia chủ còn coi việc trang bị hệ thống nước sạch như một tiêu chuẩn bắt buộc của nhà cao cấp, tương tự hệ thống điều hòa trung tâm hay máy nhà thông minh.\n\nNgười ảnh hưởng đến quyết định: Hành trình mua sắm sản phẩm này thường kéo dài và mang tính tham khảo tư vấn cao. Đầu tiên, kiến trúc sư và kỹ sư M&E (điện nước) đóng vai trò quan trọng ở giai đoạn thiết kế. Trong các dự án biệt thự, kiến trúc sư/nhà thầu thường tư vấn gia chủ lắp hệ thống lọc tổng ngay từ đầu nếu nguồn nước khu vực kém, hoặc khi gia chủ đặt yêu cầu cao về tiện nghi sinh hoạt. Họ sẽ khảo sát và xác định nguồn nước nhiễm những chất gì, nhu cầu khách hàng ra sao để đề xuất giải pháp phù hợp . Vì vậy, các nhà cung cấp thiết bị lọc cao cấp thường kết nối chặt với giới tư vấn thiết kế để đưa sản phẩm vào danh mục từ sớm. Thứ hai, chủ nhà/bạn bè người thân là người ảnh hưởng trực tiếp. Quyết định mua thường do chủ hộ gia đình (người nắm tài chính chính) đưa ra, nhưng họ bị ảnh hưởng bởi những người quen đã sử dụng. Ví dụ, một cư dân căn hộ hạng sang có thể tham khảo kinh nghiệm của hàng xóm: “Anh/chị dùng máy gì? Có hiệu quả không?” trước khi tự lắp cho nhà mình. Các hội nhóm cư dân, diễn đàn về nhà đẹp, Facebook cộng đồng cũng là nơi trao đổi tư vấn – qua đó người tiêu dùng bị tác động bởi review, lời khuyên từ cộng đồng sử dụng. Thứ ba, nhân viên bán hàng và kỹ thuật viên tư vấn ảnh hưởng lớn đến quyết định chọn thương hiệu/model cụ thể. Phân khúc cao cấp thường mua qua tư vấn viên hãng hoặc đại lý chuyên nghiệp (hơn là tự mua online), do vậy kiến thức và gợi ý từ người bán rất quan trọng. Nghiên cứu cho thấy người tiêu dùng nhiều khi lúng túng vì quá nhiều lựa chọn và thiếu hiểu biết chuyên sâu, nên họ dựa vào tư vấn của người bán hoặc người quen giới thiệu . Một đại diện bán hàng thuyết phục, cung cấp giấy kiểm định chất lượng rõ ràng sẽ tạo niềm tin lớn cho khách (như nhân viên điện máy chia sẻ họ phải trình giấy kiểm định và giải thích cặn kẽ thì khách mới an tâm mua ).\n\nYếu tố quyết định lựa chọn thương hiệu: Trong hành trình ra quyết định, khách hàng cao cấp cân nhắc nhiều tiêu chí trước khi “xuống tiền”. Quan trọng nhất thường là uy tín thương hiệu – họ ưu tiên các thương hiệu đã nổi tiếng hoặc đạt giải thưởng vì tin vào chất lượng. Khảo sát cho thấy “thương hiệu” là lý do hàng đầu khi chọn máy lọc nước, vượt trên các yếu tố khác . Kế đến là tính năng và công nghệ lọc: khách hàng am hiểu sẽ so sánh công nghệ (RO hay Nano hay UF, có giữ khoáng hay không, có diệt khuẩn UV không…). Họ sẵn sàng chi trả cao nếu sản phẩm có công nghệ vượt trội và nhiều tiện ích an toàn (ví dụ chọn A. O. Smith vì màng RO SideStream tiết kiệm nước, chọn GE vì công nghệ Nano giữ khoáng + UV diệt khuẩn hiện đại nhất). Yếu tố thứ ba là dịch vụ hậu mãi: phân khúc cao cấp thường ưu tiên hãng nào có bảo hành dài, chăm sóc tại nhà chu đáo, vì họ không muốn phiền phức sau mua. Chẳng hạn, RainSoft cam kết bảo hành trọn đời cho hệ thống lọc tổng – đây là điểm cộng lớn tạo khác biệt với đối thủ. Giá cả tuy không phải mối bận tâm lớn với nhóm khách hàng này, nhưng họ vẫn so sánh tương quan giá – giá trị: sản phẩm đắt phải mang lại giá trị rõ ràng (nước uống ngon hơn thấy rõ, da dẻ cải thiện thấy rõ…). Các chương trình khuyến mãi, trả góp cũng hỗ trợ quyết định ở một mức độ nào đó (ví dụ Điện Máy Xanh phối hợp với hãng cao cấp đưa ra ưu đãi trả góp 0%, giảm 50% phí thay lõi… thu hút thêm khách hàng dư dả nhưng thích lợi ích tài chính ). Tóm lại, quyết định mua ở phân khúc cao cấp là quá trình đồng thuận giữa nhu cầu sức khỏe – sự tư vấn chuyên môn – và niềm tin vào thương hiệu/dịch vụ. Các hãng muốn chinh phục nhóm khách này cần chú trọng cả kênh ảnh hưởng (kiến trúc sư, cộng đồng, KOL sức khỏe) lẫn xây dựng thương hiệu uy tín và dịch vụ xứng tầm, vì một khách hàng cao cấp thường ra quyết định sau khi đã “nghe – nhìn – tin” từ nhiều phía.\n\n## 4. Khoảng trống trong truyền thông (đặc biệt trên mạng xã hội)\n\nMặc dù các thương hiệu máy lọc nước đã quảng bá khá nhiều lợi ích về sức khỏe, vẫn tồn tại những thông điệp và cảm xúc chưa được khai thác triệt để trong truyền thông, nhất là trên mạng xã hội:\n\n- Câu chuyện trải nghiệm & phong cách sống: Hiện tại, phần lớn nội dung truyền thông tập trung vào tính năng kỹ thuật (loại bỏ chất A, B, C) và lời hứa sức khỏe (“nước tinh khiết 99,99%, tốt cho sức khỏe”). Điều này thiếu đi yếu tố cảm xúc, trải nghiệm mà khách hàng cao cấp tìm kiếm. Khoảng trống ở đây là xây dựng câu chuyện xoay quanh trải nghiệm tận hưởng cuộc sống với nước sạch. Ví dụ: chưa nhiều thương hiệu khai thác hình ảnh gia đình thư giãn dưới làn nước tắm mềm dịu như spa tại nhà, hay bà nội trợ tự tin nấu những bữa ăn ngon hơn nhờ nước tinh khiết. Thực tế, lợi ích như đồ uống và món ăn thơm ngon hơn khi dùng nước lọc chất lượng , hay quần áo giặt bằng nước mềm sẽ bền đẹp, trắng sáng hơn , đều rất đáng kể nhưng hiếm khi được nhấn mạnh trên các bài viết Facebook, video YouTube hiện nay. Cảm xúc hạnh phúc, tiện nghi khi có nguồn nước hoàn hảo (ví dụ: thoải mái uống nước trực tiếp tại vòi trong căn bếp sang trọng, không phải lo dự trữ nước bình) vẫn chưa được mô tả sống động để chạm đến mong muốn thầm kín của khách hàng.\n\n- Đánh vào nỗi lo thầm kín chưa được chạm tới: Truyền thông hiện tại chủ yếu nói về nỗi lo “nước bẩn gây bệnh tật” một cách chung chung. Tuy nhiên, khách hàng cao cấp còn những nỗi lo tinh tế hơn mà họ có thể chưa tự nhận ra hoặc chưa được thương hiệu gợi lên. Chẳng hạn: lo lắng về sắc đẹp – nước nhiều clo làm khô da, xơ tóc, lão hóa sớm; lo cho con cái – trẻ nhỏ tắm nước máy có thể hấp thu hóa chất ảnh hưởng lâu dài; lo cho tài sản – thiết bị vệ sinh cao cấp bị ố vàng, hỏng hóc vì cặn nước cứng. Những nỗi lo này hoàn toàn có cơ sở (ví dụ clo dư có thể gây rụng tóc, viêm da ), nhưng chưa thấy nhiều chiến dịch truyền thông mạnh mẽ đánh vào. Khoảng trống là các nội dung giúp khách hàng nhận diện rõ những “đau điểm” trong cuộc sống thường ngày do nước kém chất lượng, từ đó thương hiệu đề xuất giải pháp và tạo sự đồng cảm sâu sắc. Một số hãng như A. O. Smith có bài blog về nước cứng gây khô da tóc , nhưng việc truyền thông rộng rãi dưới dạng câu chuyện (VD: “Chị A khổ sở vì tóc rụng… cho đến khi lắp máy lọc tổng XYZ”) vẫn chưa nhiều.\n\n- Thông điệp về phong cách sống xanh và đẳng cấp: Nhiều khách hàng cao cấp có xu hướng thích các sản phẩm gắn với trách nhiệm xã hội và môi trường, nhưng rất ít nội dung nhấn mạnh rằng dùng máy lọc nước giúp giảm rác thải nhựa, giảm khí thải carbon do hạn chế nước đóng chai . Một khoảng trống truyền thông là kết nối việc sử dụng máy lọc nước với lối sống xanh, bền vững – biến nó thành hành động tử tế với môi trường, từ đó khách hàng cảm thấy tự hào và có động lực sử dụng. Song song, khía cạnh “nâng tầm đẳng cấp sống” với thiết bị lọc nước xịn cũng chưa được khai thác mạnh. Chẳng hạn, máy lọc nước cao cấp có thể được truyền thông như một phần của chuẩn mực sống thượng lưu, tương tự như sắm một chiếc xe sang hay điện thoại xịn. Nội dung dạng “người thành đạt chọn máy lọc nước X để tận hưởng nước tinh khiết mỗi ngày” sẽ đánh vào tâm lý hướng thượng, thích khẳng định đẳng cấp của một bộ phận khách hàng.\n\n- Thiếu kênh thông tin trung lập, tin cậy: Trên mạng xã hội, người tiêu dùng đang thiếu thông tin trung thực, dễ hiểu về các giải pháp lọc nước . Nhiều nội dung quảng cáo mang tính phóng đại hoặc quá kỹ thuật, khiến khách hàng “hoa mắt” và chỉ biết chọn theo thương hiệu lớn hoặc giá cả . Đây là lỗ hổng trong truyền thông: thiếu vắng những kênh giáo dục khách hàng một cách khách quan, so sánh ưu nhược điểm các công nghệ, hướng dẫn lựa chọn phù hợp từng nhu cầu. Một số group Facebook hoặc KOL chuyên gia có đề cập nhưng phạm vi còn hẹp. Do đó, chiến lược truyền thông có thể bổ sung nội dung giáo dục và tư vấn dạng infographic, video ngắn giải đáp thắc mắc thường gặp (ví dụ: nên dùng RO hay Nano, vì sao nước máy cần lọc tổng…). Việc này không những lấp khoảng trống thông tin mà còn xây dựng niềm tin thương hiệu – vì khi thương hiệu đứng ra cung cấp kiến thức hữu ích, họ sẽ được nhìn nhận là đáng tin cậy hơn so với chỉ chăm chăm bán hàng.\n\nTóm lại, trên các nền tảng mạng xã hội hiện nay, thông điệp về máy lọc nước cao cấp vẫn thiên về tính năng kỹ thuật và lợi ích sức khỏe chung, chưa khai thác đủ các khía cạnh cảm xúc và lối sống gắn liền với sản phẩm. Những khoảng trống như đã nêu là cơ hội để thương hiệu tạo ra nội dung khác biệt: chạm đến ước muốn tận hưởng cuộc sống tốt hơn, giải tỏa những nỗi lo thầm kín, và gắn sản phẩm với giá trị cao hơn (bảo vệ môi trường, khẳng định đẳng cấp). Việc lấp đầy những khoảng trống này sẽ giúp thông điệp truyền thông trở nên độc đáo và thuyết phục hơn, đồng thời xây dựng hình ảnh thương hiệu gần gũi, hiểu người dùng hơn."
      },
      {
        "slug": "thi-truong",
        "tieuDe": "Thị trường & đối thủ",
        "hang": "D",
        "nhom": "Thị trường",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 10,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Thị trường\n\nNội dung bên dưới lấy từ deep research của ChatGPT (Có tính tham khảo)\n\n## 1. Quy mô thị trường và các nhà cung cấp chính\n\nTăng trưởng thị trường: Thị trường máy lọc nước Việt Nam đang bùng nổ với tốc độ tăng trưởng cao. Dự báo cho thấy giai đoạn 2022-2029 thị trường sẽ tăng trưởng kép ~9,5%/năm và đạt giá trị khoảng 254 triệu USD vào năm 2029 . Mức độ phổ cập máy lọc nước còn rất thấp (chỉ 2,6% hộ gia đình có máy lọc nước vào năm 2023 ), cho thấy dư địa tăng trưởng lớn. Nửa đầu 2024, doanh số máy lọc nước tăng mạnh (+81% so với 2023 tại hệ thống Điện Máy Xanh) . Kênh bán lẻ điện máy đang mở rộng nhanh, riêng Điện Máy Xanh đặt mục tiêu chiếm 60% thị phần máy lọc nước cả nước với sản lượng 600.000 máy năm 2024 . Trên kênh thương mại điện tử, tổng doanh thu máy lọc nước năm 2023-2024 đạt ~68,2 tỷ VND với hơn 11.600 đơn hàng (tăng 22% YoY) . Thị trường có tính tập trung tương đối: Top 10 thương hiệu chiếm ~62% doanh thu ngành hàng , chủ yếu rơi vào các tên tuổi lớn.\n\nThị phần các thương hiệu lớn: Thị trường máy lọc nước Việt Nam hiện có sự thống trị của các thương hiệu nội địa ở phân khúc phổ thông và mở rộng của các thương hiệu ngoại ở phân khúc cao cấp. Karofi – một thương hiệu Việt – dẫn đầu với khoảng 32% thị phần (theo báo cáo TechSci 2021) . Kangaroo cũng là thương hiệu nội địa top đầu; riêng tại hệ thống Điện Máy Xanh, việc tung dòng máy Hydrogen mới đã giúp Kangaroo tăng gấp đôi thị phần trong 5 tháng đầu 2024 và giữ vững vị trí số 1 về doanh số bán lẻ . Sunhouse (Việt Nam) sau 7 năm tham gia đã vươn lên nhóm 3 thương hiệu bán chạy nhất với khoảng 20% thị phần . Ngoài ra còn nhiều hãng nội khác như Mutosi, Korihome, Apechome… tuy thị phần nhỏ nhưng góp phần làm phong phú phân khúc trung cấp.\n\nỞ phân khúc cao cấp và lọc tổng đầu nguồn, các thương hiệu ngoại chiếm ưu thế, tập trung vào nhóm khách hàng thu nhập cao. A. O. Smith (Mỹ, vào VN từ 2015) đã xây dựng được uy tín ở phân khúc cao cấp nhờ công nghệ RO SideStream độc quyền và dịch vụ hậu mãi tốt, hai năm liền đạt giải “Thương hiệu máy lọc nước xuất sắc” . Coway (Hàn Quốc) cũng thâm nhập phân khúc đô thị cao cấp (theo mô hình cho thuê máy lọc). Mitsubishi Cleansui, Panasonic (Nhật) cung cấp các thiết bị lọc nước sinh hoạt cao cấp cho một bộ phận người dùng yêu thích hàng Nhật. Các tập đoàn nước ngoài chuyên về giải pháp nước cũng đã có mặt: chẳng hạn 3M (Mỹ) với hệ thống lọc tổng Aqua-Pure; Pentair (Mỹ) cung cấp thiết bị lọc tổng và làm mềm cao cấp cho biệt thự; RainSoft (Mỹ) có đại diện RainSoft Vietnam chuyên lắp đặt hệ thống lọc nước toàn nhà cao cấp; BWT (Áo/Đức) và Viessmann (Đức) đưa công nghệ lọc và làm mềm nước vào thị trường thông qua đối tác phân phối . Đặc biệt, GE (General Electric, Mỹ) – thương hiệu lâu đời trong ngành nước – đã trở lại thị trường dân dụng Việt Nam thông qua đối tác GWT, tập trung vào phân khúc máy lọc cao cấp (chi tiết ở phần 5).\n\nNhà cung cấp và kênh phân phối: Ở phân khúc phổ thông, các hãng nội địa (Karofi, Kangaroo, Sunhouse, Korihome…) tận dụng lợi thế mạng lưới phân phối rộng (Điện Máy Xanh, MediaMart, Pico, Nguyễn Kim… và hàng ngàn đại lý) cùng giá cạnh tranh để chiếm lĩnh thị phần. Kênh siêu thị điện máy đóng vai trò chủ lực, chiếm tới một nửa doanh số toàn thị trường . Trong khi đó, phân khúc cao cấp chủ yếu phân phối qua đại lý ủy quyền chuyên biệt và kênh dự án. Ví dụ, A. O. Smith triển khai mô hình “tổng thầu phân phối” qua Công ty Phú Tiến, xây dựng hệ thống đại lý dịch vụ riêng. Các hệ thống chuyên về thiết bị nước (Thế Giới Điện Giải, Enterbuy, Doctor Nước…) và các công ty tích hợp M&E đóng vai trò quan trọng trong việc tư vấn, lắp đặt hệ thống lọc tổng biệt thự. Bên cạnh đó, các tập đoàn nội địa cũng tham gia sản xuất/nhập khẩu thiết bị lọc đầu nguồn: Tập đoàn Tân Á Đại Thành năm 2020 đã tiên phong ra mắt bộ lọc tổng Beluga hợp tác công nghệ Hàn Quốc, nhằm “phủ sóng” phân khúc lọc nước sinh hoạt cho nhà ở cao cấp . Sự tham gia của Tân Á và một số thương hiệu Việt khác (Famy, Sơn Hà, Máy Lọc Nước BK, v.v.) cho thấy nỗ lực nội địa hóa nguồn cung, cạnh tranh với thiết bị nhập khẩu. Tuy nhiên, các linh kiện cốt lõi (màng lọc RO/NF, van tự động, bơm, vật liệu lọc…) đa phần vẫn nhập từ Mỹ, EU, Hàn Quốc, Nhật – nơi có công nghệ tiên tiến.\n\nTóm lại, thị trường lọc nước đầu nguồn cao cấp tại Việt Nam đang trong giai đoạn tăng trưởng nhanh, quy mô mở rộng và cạnh tranh đa dạng. Nhóm thương hiệu nội địa chiếm ưu thế ở phân khúc đại chúng nhờ mạng lưới rộng, trong khi phân khúc cao cấp chứng kiến sự hiện diện mạnh mẽ của các thương hiệu quốc tế và công ty chuyên giải pháp nước. Những nhà cung cấp chính bao gồm cả doanh nghiệp Việt Nam (Karofi, Kangaroo, Tân Á…) và đối tác nhập khẩu/phân phối thiết bị ngoại (Phú Tiến – A.O. Smith, GWT – GE, RainSoft VN, các đại lý Pentair, 3M…). Thị trường được dự báo tiếp tục “trăm hoa đua nở” với hàng chục thương hiệu tham gia , nhưng thị phần sẽ dồn vào nhóm dẫn đầu có tiềm lực về công nghệ, thương hiệu và kênh phân phối."
      },
      {
        "slug": "kinh-nghiem-quay-dung",
        "tieuDe": "Kinh nghiệm quay dựng",
        "hang": "D",
        "nhom": "Marketing",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 11,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Kinh nghiệm quay dựng\n\nKinh nghiệm đi quay\n\nBối cảnh:\n\nDiễn viên\n\nMua đồ\n\nChecklist đi quay\n\nKhác\n\nQuản lý chi phí\n\nHoàn ứng\n\nMáy\n\nKinh nghiệm dựng video\n\n## Kinh nghiệm đi quay\n\n### Bối cảnh:\n\n- Background\n\nCác đồ vật đằng sau khung hình\n\nNên có thêm cây xanh để tránh trống khung hình\n\n- Ánh sáng\n\nĐánh sáng tự nhiên (nắng giả)\n\n### Diễn viên\n\n### Mua đồ\n\n### Checklist đi quay\n\n### Khác\n\n### Quản lý chi phí\n\n### Hoàn ứng\n\n### Máy\n\nKinh nghiệm dựng video"
      },
      {
        "slug": "thu-vien-deep-research",
        "tieuDe": "Thư viện deep research",
        "hang": "D",
        "nhom": "Tham khảo",
        "nguon": "Google Sites · Cẩm nang kiến thức (ChatGPT Deep Research)",
        "thuTu": 12,
        "noiDung": "> ### ⚠️ Hạng D — tài liệu nền, KHÔNG phải nguồn để trích cho khách\n>\n> Nội dung này do **AI tổng hợp (ChatGPT Deep Research)**, chưa đối chiếu về nguồn gốc.\n> Đọc để **hiểu bối cảnh và nói chuyện có chiều sâu** với khách — ⛔ **không đọc con số\n> trong đây cho khách**, không đưa vào bài viết, không dùng làm căn cứ tư vấn.\n>\n> Số liệu nói với khách phải truy được về một mã `F-xxx` trong **PKB của máy**.\n\n# Thư viện deep research\n\n1. Vi nhựa trong nước: https://c *(nguồn: hatgpt.com)*/share/686a386b-e3bc-8001-bdf7-49db97cd20ef\n\n1. Khoáng trong nước uống: https://c *(nguồn: hatgpt.com)*/share/686a387f-92ec-8001-8aae-bcaf4e6338a0\n\n1. Clo dư trong nước: https://c *(nguồn: hatgpt.com)*/share/686a3891-db04-8001-9534-b147bca49b96\n\n1. So sánh thị trường: https://c *(nguồn: hatgpt.com)*/share/686a38af-2c80-8001-9a8b-80f10080a8c8"
      }
    ]
  },
  {
    "khu": "sales",
    "bai": [
      {
        "slug": "training-sales-cskh",
        "tieuDe": "Training Sales & CSKH",
        "hang": "C",
        "nhom": "",
        "nguon": "Tài liệu đào tạo nội bộ · đã sửa lỗi USH10 28/08",
        "thuTu": 1,
        "noiDung": "# Training Sales & CSKH — GWT\n\nTài liệu đào tạo cho nhân sự Sales và Chăm sóc khách hàng (CSKH) của GWT — đơn vị phân phối máy lọc nước thương hiệu GE tại Việt Nam. Mục đích: người mới đọc là nắm được sản phẩm, kịch bản tư vấn, lệnh Pancake/Botcake và quy trình chốt đơn / chăm sóc sau bán để làm được việc ngay.\n\n> Tổng hợp tự động từ kênh Discord training-sales-và-cskh, dữ liệu tới 11/08/2026. Đã lược bỏ thông tin đăng nhập & dữ liệu cá nhân. Bản nháp — cần người phụ trách rà soát.\n\n---\n\n## Mục lục\n\n1. [Sản phẩm & phân loại](#1-san-pham-phan-loai)\n2. [Kiến thức sản phẩm chuyên sâu (Q&A chuẩn)](#2-kien-thuc-san-pham-chuyen-sau-q-a-chuan)\n3. [Lệnh Pancake/Botcake](#3-lenh-pancake-botcake)\n4. [Quy trình tiếp nhận & tư vấn chat](#4-quy-trinh-tiep-nhan-tu-van-chat)\n5. [Kịch bản xử lý từ chối / thắc mắc khó](#5-kich-ban-xu-ly-tu-choi-thac-mac-kho)\n6. [Quy trình chốt đơn & lên đơn](#6-quy-trinh-chot-don-len-don)\n7. [Quy trình lắp đặt & giao hàng](#7-quy-trinh-lap-dat-giao-hang)\n8. [CSKH & sau bán](#8-cskh-sau-ban)\n9. [Phân loại & đánh dấu khách trên Pancake](#9-phan-loai-danh-dau-khach-tren-pancake)\n10. [Báo cáo cuối ca & phối hợp nhóm](#10-bao-cao-cuoi-ca-phoi-hop-nhom)\n11. [Quy định & lưu ý chung](#11-quy-dinh-luu-y-chung)\n12. [Tài nguyên nội bộ](#12-tai-nguyen-noi-bo)\n\n---\n\n## 1. Sản phẩm & phân loại\n\nGE có **2 nhóm sản phẩm chính**. Nắm rõ khách hỏi nhóm nào để không gửi nhầm tài liệu.\n\n### A. POU — Máy lọc nước uống (đặt tại điểm dùng)\n\nTất cả dùng công nghệ lõi **G+ Mineral** (giữ khoáng tự nhiên). Chia làm 2 kiểu: **để bàn** và **âm tủ bếp**.\n\n| Model | Kiểu | Đặc điểm chính | Lõi |\n|---|---|---|---|\n| **CTD50** | Để bàn, giữ khoáng | Có bản dùng **bình chứa** (không kết nối đường nước) | **1 lõi** — CFNC |\n| **CTS10** | Để bàn, tạo soda (bản đơn giản hơn CTS20) | Dùng **bình chứa**, không kết nối đường nước, bơm soda thủ công. Có sẵn 1 bình gas đi kèm | **1 lõi duy nhất** — CFNC |\n| **CTS20** | Để bàn, có tạo **soda/sparkling** | Kết nối đường nước, làm lạnh sâu & nhanh, trộn soda thẳng vào nước. Màu **vàng** | **2 lõi** — PCF + NF |\n| **B04** | **Để bàn** | | **2 lõi** — PCF + NF |\n| **GN610** | **Âm tủ bếp** (under-sink) | | **2 lõi** — PCF + NF |\n| **GN620** | **Âm tủ bếp** (under-sink) | | **2 lõi** — PCF + NF |\n| **DN810** | **Âm tủ bếp** (under-sink) | Có **2 vòi**: 1 vòi uống đi kèm máy + 1 vòi rửa gắn vào vòi rửa nhà khách; dòng chảy mạnh, hợp rửa hoa quả | **3 lõi** — PPF + PCFB + NF |\n| **USH10** | **Âm tủ bếp (under-sink)**, không sparkling, nước nóng 4 mức | **Sắp có hàng** — kiểm `wh_master` trước khi trả lời khách | **2 lõi** — PCFB + NF |\n\n> 🔒 **Cột \"Lõi\" lấy từ masterdata thay lõi của công ty**, không phải trí nhớ. Máy nào cũng\n> phải tra lại masterdata trước khi trả lời khách.\n>\n> ⛔ **Không đọc MÃ lõi cho khách** (`LX-CFNC-001-G`, `GT-PCF13-F01G`…) — rule nội bộ GWT\n> chốt 18/07/2026. Với khách chỉ nói **\"lõi thô\"** và **\"lõi màng lọc nano\"**.\n\n**So sánh CTS20 vs CTS10** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1487797983029362920)):\n1. CTS20 làm lạnh **sâu hơn và nhanh hơn**.\n2. CTS20 **kết nối đường nước**; CTS10 dùng **bình chứa**.\n3. CTS20 tạo soda bằng cách **trộn thẳng vào nước**; CTS10 **bơm thủ công**.\n\nGợi ý chọn: khách **không có nước máy** (chỉ có bình 20L) → **không dùng được CTS20** (cần nước máy + kết nối đường nước) → tư vấn **CTS10** (dùng bình chứa). ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497611271065960509))\n\n### B. POE — Lọc tổng / lọc đầu nguồn (đặt tại đầu vào nhà)\n\n**4 bộ**: `15A`, `15A Eco`, `30A`, `30A Eco`. Công suất từ **1,5 m³/giờ** (thấp nhất) đến **3 m³/giờ** (cao nhất).\n\nGợi ý chọn theo nhu cầu:\n- **Căn hộ 2 người, không bồn tắm** → **15A** hoặc **15A Eco**.\n- **Nhà 4–6 người / nhà mặt đất** → **30A** (hoặc **30A Eco** nếu muốn tiết kiệm chi phí).\n- **Miền Bắc** (Bắc Giang, các tỉnh phía Bắc): nước độ cứng cao (~**90–150 ppm**) → tối thiểu **30A** mới đủ công suất làm mềm nước. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498294063806414980))\n\nĐặc điểm & lưu ý POE:\n- **Bán theo bộ, KHÔNG bán riêng** thiết bị tiền lọc. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1501605086743367882))\n- Cần **đổ muối định kỳ 3–4 tuần/lần** → khuyến nghị đặt ở vị trí tiện đổ muối (ban công / logia với căn hộ).\n- **Muối**: bao 25kg giá **412.500đ** (chưa gồm ship), khách chịu phí ship. Gợi ý lấy từ 4 bao nhưng **không ép** (nhà không có chỗ để thì lấy 2 bao cũng được).\n- Lọc tổng **KHÔNG có khuyến mãi/giảm giá** (brand cao cấp — xem mục 5).\n- Nước sau lọc tổng: **dùng nấu ăn được nhưng KHÔNG uống trực tiếp**. An toàn nhất: uống & thổi cơm nấu canh dùng máy lọc uống; lọc tổng dùng rửa rau vo gạo. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498339198430744657))\n- **Nước giếng khoan** → thường **không tiềm năng** (cần chuyên gia đánh giá riêng, không tự tư vấn bộ tiêu chuẩn).\n- **Dự án lớn** (chung cư 13 tầng, tòa nhà, commercial/industrial): cả 4 bộ đều không đủ công suất → xin SĐT/ngân sách, chuyển **chuyên gia / bộ phận kinh doanh** tư vấn giải pháp. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1498147194409062461))\n\n### Thương hiệu GE\n- Brand **cao cấp toàn cầu**, quy định giá niêm yết **nghiêm ngặt**.\n- **Không giảm giá lọc tổng**, không nâng giá rồi giảm để bán.\n- **Không bán sỉ, không phát triển nhà phân phối/đại lý** qua chat → khách hỏi đại lý/CTV/chiết khấu nhà thầu: xin SĐT + thông tin đơn vị, ẩn comment, chuyển **bộ phận kinh doanh** liên hệ lại.\n\n---\n\n## 2. Kiến thức sản phẩm chuyên sâu (Q&A chuẩn)\n\nCác câu trả lời dưới đây do quản lý/kỹ thuật (anh Donald, chị Trang) duyệt — dùng để tư vấn và để training chatbot.\n\n**Q: Công nghệ G+ Mineral là gì? Máy GE có tạo nước kiềm/Hydrogen không?**\nA: GE **không** dùng lõi tạo kiềm hay Hydrogen nhân tạo. Hãng dùng công nghệ độc quyền **G+ Mineral**: loại bỏ 100% độc tố nhưng **giữ lại trọn vẹn vi khoáng tự nhiên** (Canxi, Magie, Kali…). Với khách đang cân nhắc máy ion kiềm nhập khẩu: tiền lọc của máy ion kiềm chỉ dừng ở màng UF (0.1 micron), rủi ro khi nước đầu vào có NO2, NO3, Amoni, kim loại nặng → máy G+ Mineral của GE là giải pháp tiền xử lý lý tưởng. ([nguồn đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1486256882820583455)) — dùng tag `/ionkiem`, `/GMineral`.\n\n**Q: Lõi của CTS20 và CTD50 gắn ở đâu?**\nA: Cả CTD50 (1 lõi CFNC) và CTS20 (2 lõi PCF, NF) đều có lõi nằm ở **phía trên cùng của máy, ngay dưới nắp đậy**. Khách **tự thay được**, không cần kỹ thuật viên. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486224918499692654))\n\n**Q: CTS20 yêu cầu gì về áp lực nước / đường nước yếu thì sao?**\nA: CTS20 yêu cầu áp lực **0.1–0.4 mPa**. Nếu nguồn nước áp lực **dưới 0.1 mPa** (1 at), khách nên lắp thêm **bơm tăng áp đầu vào** để máy hoạt động ổn định. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1488330707691507722))\n\n**Q: Chế độ \"Chờ\" (standby) của máy là gì?**\nA: Chế độ máy tạm nghỉ, tiêu hao năng lượng thấp nhất mà vẫn sẵn sàng khi dùng lại. **Tự động**, khách không cần chỉnh gì. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497029986471641100))\n\n**Q: Máy có test/chứng nhận giữ khoáng (8 khoáng) không? Có COCQ/COQ không?**\nA: Các mẫu dùng chung công nghệ G+ Mineral nên kết quả test giữ khoáng **như nhau** → lấy kết quả test trong **folder chứng chỉ** của một mẫu (ví dụ B04, GN610) gửi khách. Nếu khách muốn test chính máy của mình sau khi mua: hỗ trợ hướng dẫn gửi mẫu nước ra **viện kiểm định**, **chi phí khách chịu**. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497609257657307246))\n\n**Q: Nước máy để bàn (CTD50…) — nước thải đi đâu, thay nước có bất tiện không?**\nA: Dùng tag `/countertop` — 2 lưu ý **bắt buộc** báo khách khi chốt đơn máy để bàn: (1) nước thải đi đâu, (2) việc thay nước bất tiện với máy để bàn (không lưu ý trước, khách mua xong thấy không phù hợp sẽ trách). ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1514094091783245884))\n\n**Q: CTS10/CTS20 có cần mua thêm gas tạo soda không?**\nA: Trong máy có sẵn **1 bình gas** đi kèm. Dùng bình CO2 food-grade tinh khiết 99.9%. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1514516514139803658))\n\n**Q: Xả nước khi mới thay lõi?**\nA: Thay lõi xong: **reset** + **xả lõi như lúc mới mua** (xả 2–3 lần). Phải hướng dẫn khách đủ các bước theo manual. Có thể lấy bình 2L đổ đi cho nhanh. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1501075379996201060))\n\n**Q: Đèn báo trên máy — khi nào thay lõi?**\nA: Chỉ khi **đèn \"filter\" báo đỏ** mới là cần thay lõi. Có đèn khác (ví dụ đèn unlock lấy nước nóng) không phải đèn thay lõi → phải **xem ảnh khách gửi** để phân biệt, đừng hỏi ngược khách. ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1497877552255995924))\n\n**Q: Máy để bàn dùng nước giếng khoan lắp thế nào?** → Giếng khoan là ca đặc thù, không tiềm năng đại trà; cần kiểm tra riêng, đừng tự khẳng định. (Xem mục kiểm chứng.)\n\n---\n\n## 3. Lệnh Pancake/Botcake\n\nGõ tag để chèn tin nhắn mẫu (text + ảnh) gửi khách. **Lưu ý chọn đúng \"nội dung\"**: nhiều tag có nhiều tin (text / có ảnh + quà) — chọn nhầm sẽ gửi cả tin không mong muốn.\n\n### Lọc tổng (POE)\n| Lệnh | Dùng khi nào |\n|---|---|\n| `/sosanhwh` · `/sosanhwh2` | Bảng so sánh 4 bộ lọc tổng (`sosanhwh2` là bản mới, bản cũ vẫn giữ) |\n| `/3thietbi` | Thông tin 3 thiết bị trong bộ lọc tổng |\n| `/whproductinfo` | Thông tin sản phẩm lọc tổng |\n| `/chatluongnuoc` | Chất lượng nước (dùng khi khách hỏi về nước lọc tổng) |\n| `/hinhlapdat` | Hình ảnh lắp đặt |\n| `/loctongplaylist` | Playlist video lọc tổng |\n| `/nuocgieng` | Trường hợp nước giếng |\n| `/baotri` | Thông tin bảo trì |\n| `/sanxuat` | Thông tin sản xuất |\n| `/quytrinh` | Quy trình |\n| `/competitor` | So sánh đối thủ |\n| `/xinsdt` | Xin số điện thoại (chỉ dùng cho khách lọc tổng, **không** gửi cho khách hỏi lọc uống) |\n| `/others` | Câu hỏi khác |\n\n### Lọc nước uống (POU)\n| Lệnh | Dùng khi nào |\n|---|---|\n| `/ssPOU` | So sánh máy lọc uống. Hiện tách 2 tin: khách quan tâm **để bàn** → chỉ gửi tin để bàn; quan tâm **chung chung** → gửi cả 2 tin |\n| `/CTD50` `/CTS20` `/CTS10` `/GN610` `/GN620` `/DN810` | Thông tin từng model |\n| `/CTD50KM` | CTD50 kèm khuyến mãi (nếu chỉ muốn gửi text: **chọn nội dung 1**, tránh gửi cả tin 2 có ảnh + quà) |\n| `/ctd50hdsd` | Hướng dẫn sử dụng CTD50 bản bình chứa (mục 57) — **bắt buộc gửi 100%** khi khách chốt/nhận máy CTD50 |\n| `/GMineral` | Công nghệ G+ Mineral |\n| `/quatangPOU` | Trả lời \"không lấy quà CTD50/CTS20 có được trừ tiền không\" |\n| `/countertop` | 2 lưu ý máy để bàn (nước thải + thay nước bất tiện) |\n| `/ionkiem` | Khi khách hỏi máy ion kiềm — chọn tin phù hợp |\n\n### CSKH / chốt đơn (chung)\n| Lệnh | Dùng khi nào |\n|---|---|\n| `/datcoc` | Xác nhận đơn hàng — chỉnh số tiền, đặt cọc, số còn phải thanh toán |\n| `/thanhtoan` | Gửi số tài khoản + hướng dẫn nội dung chuyển khoản |\n| `/lapdat` | Thông tin lắp đặt |\n| `/kichhoatbh` | Mẫu kích hoạt bảo hành |\n| `/baohanh` | Thông tin bảo hành (thời gian, khu vực lắp đặt) |\n| `/Playlist` | Playlist video giới thiệu |\n\n> Mẹo học lệnh: tự gửi thử từng tin nhắn mẫu vào **Zalo cá nhân** để xem giao diện khách nhận được. ([nguồn liệt kê tag](https://discord.com/channels/1484009253831315456/1484057657043189860/1513417878878290002))\n\n---\n\n## 4. Quy trình tiếp nhận & tư vấn chat\n\n**Thứ tự gửi khi khách hỏi giá** (khách click quảng cáo thường không nhớ hết tính năng máy):\n1. Gửi **giá** trước.\n2. Gửi **thông tin máy** (dù botcake đã trả lời vẫn phải gửi lại thông tin + giá chi tiết, không chỉ gửi thông tin lõi).\n3. Gửi thêm **playlist** nếu khách có nhu cầu tìm hiểu.\n\n**Nguyên tắc đọc & trả lời:**\n- **Đọc kỹ, kéo lại tin nhắn từ đầu** trước khi rep (khách khó tính sẽ khó chịu nếu bạn hỏi lại thứ họ đã cung cấp — nghĩ là \"nhiều người trả lời, không nắm thông tin\").\n- **Xem ảnh khách gửi** rồi mới trả lời — đừng hỏi ngược lại khách thứ đã có trong ảnh.\n- **Khách hỏi 3 câu → trả lời đủ 3 câu**, không chỉ trả lời 1 câu.\n- Click vào link/tin để xem khách đang quan tâm **sản phẩm nào** — đừng thấy câu giống nhau là copy tin có sẵn (rất hay nhầm **lọc tổng ↔ lọc nước uống**).\n- **Không biết thì hỏi nhóm** (tag chị/Giang/anh Như), **KHÔNG bịa** câu trả lời. \"Thà không rep còn hơn rep linh tinh.\" Bận thì có thể rep chậm, nhưng không rep ẩu/sai.\n- Câu khó nên hỏi **ngay** (kể cả tối) để ca sau có người rep — đừng để đến sáng hôm sau/học xong mới hỏi (khách chờ lâu; Shopee rep muộn bị phạt).\n- **Xin SĐT 1–2 lần thôi**, không hỏi 3 câu liên tục (khách thấy spam, khó chịu).\n- Câu đã được duyệt thì **lưu lên Pancake** để lần sau dùng lại.\n\n**Khách khó chịu / khó tính** → chuyển sang **gọi điện**, không nhắn tin nữa. Trình tự: **(1) xin lỗi → (2) giải thích (nếu có lý do phù hợp) → (3) đưa giải pháp**. Khi mình sai (ví dụ miss lịch bảo trì): phải có **phương án xoa dịu**, không chỉ giải thích suông.\n\n**Khách để lại SĐT / khách tiềm năng**: đổi style chat — câu trả lời bằng chữ **ngắn gọn 1–2 dòng**, gửi ảnh riêng; câu giá & thông tin ban đầu cứ gửi bình thường. Chăm kỹ, trả lời cẩn thận.\n\n**Khách gọi nhỡ hotline / messenger**: gọi lại ngay như tổng đài, hỏi khách cần hỗ trợ gì, ghi nhận thông tin. Mẫu câu khi khách ngại để SĐT: *\"Dạ chị ơi, em có gọi lại cho chị mà chị chưa tiện nghe máy, chị cần hỗ trợ gì chị cứ nhắn em ạ. Nếu chị cần hỗ trợ gấp thì chị để lại số điện thoại để bên em hỗ trợ nhanh nhất ạ.\"* ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486303373203341362))\n\n---\n\n## 5. Kịch bản xử lý từ chối / thắc mắc khó\n\n### Khách xin giảm giá / \"không lấy quà có được trừ tiền không\" (POU — CTD50/CTS20)\nTag `/quatangPOU`. Ý chính: GE là thương hiệu cao cấp toàn cầu, quy định giá niêm yết nghiêm ngặt để bảo vệ giá trị thương hiệu → đại diện hãng tại VN **không can thiệp giảm giá máy**. Quà tặng là do **đơn vị bán hàng/hãng tại VN tự cân đối ngân sách** tặng thêm, **không ảnh hưởng giá hãng**. Nếu khách không nhận quà, **giá máy vẫn giữ nguyên**. Trình bày như \"sự chăm sóc thêm\". ([mẫu câu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1486186321423892560))\n\n### Khách so sánh giá / xin chiết khấu lọc tổng (POE — nhà thầu, \"hãng khác giảm nhiều\")\nTách 3 câu, wording lại tự nhiên ([mẫu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1534783626367995914)):\n1. Thừa nhận đúng là các hãng khác có giảm giá nhiều để chốt khách.\n2. Triết lý kinh doanh GE khác: hệ thống lọc tổng **bán đúng giá hãng, không giảm giá và cũng không nâng giá rồi giảm** (giữ giá trị thương hiệu + chất lượng dịch vụ/bảo hành/bảo trì lâu dài).\n3. Thay vào đó hỗ trợ khách bằng **chi phí lắp đặt, vận chuyển, giảm giá máy lọc nước uống mua kèm**.\n\n### Khách hỏi máy ion kiềm / Hydrogen\nDùng script G+ Mineral (mục 2, tag `/ionkiem` `/GMineral`).\n\n### Khách hỏi bán sỉ / đại lý / CTV / chính sách chiết khấu\nBên mình **không bán sỉ, không phát triển nhà phân phối** qua kênh chat. Ẩn comment (nếu là comment), inbox xin **SĐT + thông tin đơn vị**, chuyển **bộ phận kinh doanh** liên hệ lại. Đánh dấu không tiềm năng nếu chỉ hỏi lơ mơ.\n\n### Ngôn từ nên tránh\n- **Không dùng \"khuyến khích\"** (mình không ở địa vị khuyến khích khách) → dùng **\"khuyến nghị\"** / **\"tư vấn\"**.\n- Với khách nhắn kiểu ít quan tâm/ít khả năng mua: vẫn **nhắn lịch sự**, gửi giá + thông tin, không phán xét.\n\n---\n\n## 6. Quy trình chốt đơn & lên đơn\n\nKhi khách chốt mua máy ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1484404527569436813)):\n1. **Xác nhận đơn**: `/datcoc` — chỉnh số tiền đơn hàng, tiền đặt cọc, số còn phải thanh toán cho đúng.\n2. **Gửi số tài khoản**: `/thanhtoan`.\n3. Khách cọc xong đẩy **bill giao dịch** vào nhóm **thu-tiền-khách-hàng**, note: `Tên khách – Địa chỉ – Tên sản phẩm – Giá bán – tình trạng cọc/thanh toán`.\n4. Đẩy đơn lên **file Google Sheet đơn hàng** (sheet \"Đơn hàng lọc nước uống\").\n5. Ghi vào **bảng tổng hợp đơn chốt** kèm **nguồn** khách đến (FB ADS_DINO / ADS_GWT / Hannah / Shopee / hotline…).\n\n**Nội dung chuyển khoản** hướng dẫn khách (đừng viết tắt \"ND\"):\n`[Họ tên khách hàng] [dấu cách] [Số điện thoại] [dấu cách] [Mã sản phẩm hoặc Số hợp đồng]`\n\n**Đặt cọc**: POU nội thành thường **cọc 1.000.000đ**, kỹ thuật lắp xong khách thanh toán nốt. Kênh Hannah có mục cọc 1tr riêng.\n\n**Máy backup**: khi gửi máy backup cho khách phải **nói rõ đây là máy dùng backup**, không để khách hiểu nhầm là máy mới.\n\n---\n\n## 7. Quy trình lắp đặt & giao hàng\n\n**Trình tự chuẩn (HN/HCM)**: đặt cọc → xác nhận đơn → lên đơn → chuyển hàng → lắp đặt → thanh toán (hoặc thanh toán trước → lắp đặt). Xin **hình ảnh vị trí lắp đặt** trước (bồn rửa: đủ đường nước cấp, nước thải, ổ điện chưa). Nếu kỹ thuật đến mà chưa lắp được (vị trí chưa hoàn thiện) → **phát sinh phí 500k**.\n\n**Khách tỉnh (ngoài HN/HCM)**: khi lên đơn **điền số còn phải thanh toán = COD** — vì kỹ thuật tỉnh là freelancer, không tin tưởng lắp xong thu tiền được.\n\n**Khi khách báo nhận máy** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1486625307158122598)):\n1. Xin khách **1 số khung giờ trống T2–T6 (giờ hành chính)** để check lịch kỹ thuật.\n2. Xác nhận được lịch → hẹn chính xác **ngày/giờ** báo khách.\n3. Luôn dặn: *\"Khi nào anh/chị nhận được hàng nhờ nhắn lại để em sắp xếp lịch kỹ thuật\"* (app tracking của đơn vị vận chuyển có thể cập nhật sai/chậm).\n\n**Hình thức xuất hàng** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1485862486585643190)):\n- Lấy tại kho (nội bộ về kho phụ / đối tác-đại lý đến lấy / đơn nội thành HN đặt ship).\n- Dịch vụ vận chuyển **Viettel Post** cho đơn đi tỉnh.\n- **Đóng gói** (màng co + màng xốp) khi chuyển đi xa/đi tỉnh để thùng máy không bị át; lấy máy tại kho thì tùy trường hợp.\n\n**Shopee**:\n- Giao **theo điều phối của Shopee**, bên mình không can thiệp/không tự giao trong ngày được.\n- Mua qua Shopee → **phụ phí lắp đặt 500k**.\n- **Lên đơn trước 11h sáng** để kho đóng hàng kịp (Shopee đến lấy 1 lần/ngày ~ trưa). Trễ chuyến → chờ ngày làm việc sau, giao muộn bị **phạt**.\n- Phải là người **trả lời tin cuối cùng** mọi hội thoại Shopee (kể cả tin quảng cáo/spam), nếu không bị đánh giá phản hồi muộn và phạt.\n\n**Lọc tổng — chuẩn bị đường ống trước khi lắp** (gửi khách biên bản xác nhận, [mẫu đầy đủ](https://discord.com/channels/1484009253831315456/1484057657043189860/1527178636212572172)): nước máy đạt QCVN 01-1:2024/BYT; áp lực bơm cấp 0,15–0,4 MPa; điện 220V/50Hz; mặt bằng tối thiểu ~400×1400×1500 mm; đường điện dây 2,5mm; đường thoát nước thải cùng mặt bằng; bơm ly tâm Q=2 m³/h tại H=37m; phao báo cạn/đầy; van bypass. Khách gửi **sơ đồ nguyên lý & mặt bằng cấp thoát nước** + ảnh thực tế qua nhóm Zalo. (Xem thêm Loom quy trình khảo sát lắp đặt POE ở mục 13.)\n\n---\n\n## 8. CSKH & sau bán\n\n### Thay lõi\n- Chỉ thay khi **đèn \"filter\" báo đỏ**. Sau khi nháy đỏ máy **còn dùng được 15–20 ngày** → báo khách yên tâm dùng đến khi nhận lõi.\n- Quy trình khi khách cần lõi: xác nhận sắp đến hạn thay → báo còn dùng 15–20 ngày → **báo giá lõi, xin địa chỉ gửi lõi** → khách OK thì báo nhóm xử lý (xuất kho, lên đơn, thu trước hoặc COD). Lõi gửi qua Viettel Post. (File giá lõi ở mục 13.)\n- Thay lõi xong: **reset + xả lõi 2–3 lần** như lúc mới mua.\n\n### Bảo hành\n- Kích hoạt bảo hành: tag `/kichhoatbh`; cần **SĐT + địa chỉ** khách; CSKH kích hoạt (thường xử lý ngày làm việc).\n- Link quản lý bảo hành/ticket: `https://cs-admin.gwt.vn` (đăng nhập tài khoản nội bộ do quản lý cấp).\n\n### Bảo trì\n- **4 lần bảo trì miễn phí trong năm đầu** (áp dụng cả POE và POU tương ứng).\n- Trả lời lịch bảo trì tiếp theo bằng **tháng / tuần dự kiến**, **không hẹn ngày chính xác** (tùy lịch khách + lịch kỹ thuật).\n- Nếu công ty **miss lịch bảo trì** của khách: không nói \"nếu chị muốn bảo trì luôn\"; nói *\"để em báo CSKH check thời gian bảo trì và sắp xếp kỹ thuật, có thông tin em báo lại chị\"* + xoa dịu vì lỗi ở mình.\n\n### Lỗi máy\n- **Mọi báo lỗi**: xin **video hiện trạng + ảnh màn hình hiển thị**, gửi vào **nhóm kỹ thuật / bảo hành POE hoặc POU**, tag anh Như / Bình / Linh. (Gửi mỗi ảnh, kỹ thuật không biết máy đang gặp gì.)\n- **Trong khi chờ kỹ thuật KHÔNG để khách đợi im lặng** — nhắn *\"đã chuyển thông tin tới bộ phận kỹ thuật để hỗ trợ\"*.\n- Lỗi thường gặp: **C5** thường do khách **ấn nhầm reset lõi** (không phải lỗi thật) — vẫn báo nhóm bảo hành POU xác nhận. E4 → chuyển kỹ thuật.\n- Máy CTS20 kêu to nhưng không báo đỏ / vòi báo đỏ → nhờ khách quay video **thân máy** để xem lõi nào cần thay.\n\n### Muối hết (lọc tổng)\nShip muối cho khách: hỏi số bao, báo giá 412.500đ/bao 25kg (chưa gồm ship), không ép số lượng; báo nhóm kho lên đơn + nhóm sales POE.\n\n### Hướng dẫn sử dụng\n- **100%** khách mua **CTD50 bản bình chứa** phải được gửi HDSD tag `/ctd50hdsd` (mục 57) khi chốt/nhận hàng; gửi xong **đánh dấu/note** trên Pancake để không sót.\n- Video HDSD & thay lõi: kênh YouTube `@MaylocnuocGE` và Drive folder Video (mục 13).\n\n---\n\n## 9. Phân loại & đánh dấu khách trên Pancake\n\nCập nhật ở **cột bên phải** (Hotness / Trạng thái / Phân loại / Nguồn / Ghi chú):\n\n| Tình huống khách | Cách đánh dấu |\n|---|---|\n| **Chưa có dữ liệu đánh giá** | **KHÔNG** tự đánh \"tiềm năng\" — để quản lý check khách đã gọi chưa |\n| **Không tiềm năng** (báo đắt/nhiều tiền quá, nước giếng khoan, nick clone, avatar bác lớn tuổi nông thôn, đối thủ dò hỏi) | Hotness = **Cold – Không quan tâm**; Trạng thái = **Không quan tâm** (đỏ) |\n| **Đã mua POU** | Hotness = **Đã mua POU**; Trạng thái = **Quan tâm POU**; Phân loại = **Đã mua POU**; Nguồn = kênh mua (vd Shopee) |\n| Ghi chú thông tin khách để lại | Vào **Sửa thông tin → dòng Ghi chú → Lưu** (để quản lý nắm nhanh) |\n\n**Nguồn ads** (điền cột nguồn): `ADS_DINO` (video anh Dino), `ADS_GWT` (video anh Như + 1 bạn nữ). Ad id: copy ở phần dưới ads hiển thị trong Pancake. Khách xem 2–3 video thì note cả mấy nguồn. (Sheet hướng dẫn xem nguồn ads ở mục 13.)\n\n**Khi khách để lại SĐT**: báo **ngay** vào nhóm phù hợp — **lọc tổng → nhóm POE**, **lọc nước uống → nhóm POU** — kèm **tên FB/Zalo + SĐT** (để CSKH search lại tin nhắn cũ). Không nhắn vào nhóm trao đổi nhanh (dễ trôi tin). Đơn/quà thiếu hoặc lên đơn → nhóm xử lý đơn POE/POU.\n\n**Kết bạn Zalo**: **đổi lời chào** (không để lời nhắn auto), tin đầu tự giới thiệu (\"Em chào anh…, em liên hệ từ máy lọc nước GE, em xin phép gửi anh thông tin…\"), rồi **tạo contact trên CRM**.\n\n**Ẩn comment**: khách comment kém chất lượng / hỏi đại lý → **ẩn comment**, chuyển inbox.\n\n---\n\n## 10. Báo cáo cuối ca & phối hợp nhóm\n\n**Báo cáo cuối ca** ([nguồn](https://discord.com/channels/1484009253831315456/1484057657043189860/1485486379332010004)):\n1. Số tin nhắn trong ca (xem Pancake).\n2. Số khách để lại SĐT — đánh giá tiềm năng/không.\n3. Số khách chat (không SĐT) nhưng tiềm năng (có hỏi & quan tâm sản phẩm, không chỉ hỏi giá).\n4. Lưu ý gì / bị sai gì.\n5. Số cuộc gọi hotline — ai tiềm năng, ai gọi nhầm.\n\n**Đầu ca sáng**: check lại cả những tin đã bị **mark read** của ca trước (có thể là **bot** trả lời) để không sót khách.\n\n**Kiểm tra sót tin**: dùng bộ lọc \"đã đọc chưa trả lời\" trên Pancake. Sót khách nhiều lần → trừ vào thưởng đơn hàng.\n\n**Phối hợp nhóm** (tham khảo): nhóm **sales POU / sales POE** (tư vấn), nhóm **xử lý đơn POU/POE** (lên đơn, đơn/quà thiếu), nhóm **bảo hành/bảo trì POU/POE**, nhóm **kỹ thuật**, nhóm **thu-tiền-khách-hàng**, nhóm **duyệt chi phí**. Câu khó về kỹ thuật/giải pháp → tag anh Như / Bình / Linh (POE) hoặc anh Donald.\n\n---\n\n## 11. Quy định & lưu ý chung\n\n**Nên:**\n- Chủ động kiểm tra tin nhắn tất cả nền tảng (Pancake gộp được nhiều page; nếu Pancake lỗi → mở trực tiếp Messenger / Business Suite / web bán hàng Shopee / Zalo OA trên Chrome để chat).\n- Bật **thông báo (notification)** để không sót khách.\n- Có khách để lại SĐT → **gọi cho khách + update contact** cho quản lý (trừ khi khách rất tiềm năng thì để quản lý gọi).\n- Câu trả lời đã duyệt → lưu lên Pancake để tái sử dụng.\n- Ghi **kế hoạch làm việc cá nhân** (template ở mục 13), note các task được giao vào nhóm cá nhân để quản lý pin.\n\n**Không nên:**\n- **Không bịa** câu trả lời; không rep ẩu/linh tinh; không thấy câu giống là copy tin có sẵn.\n- **Không nhầm lọc tổng ↔ lọc nước uống** — check kỹ khách quan tâm gì.\n- Không hỏi xin SĐT 3 câu liên tục.\n- Không dùng từ \"khuyến khích\".\n- Không viết tắt (ví dụ \"ND\" cho nội dung).\n- Không để lời chào Zalo auto khi kết bạn.\n- Không gửi link Shopee trong tin tư vấn (để khách mua thẳng qua Pancake) — theo chỉ đạo từng thời điểm.\n- Không ép khách lấy nhiều muối / không hẹn ngày bảo trì chính xác.\n- Khi gửi nhầm tin → **xin lỗi khách**, gửi lại đúng thông tin.\n- Kiểm tra kỹ **ảnh trước khi gửi** (đúng model, đúng chương trình; lọc tổng không có ảnh khuyến mãi).\n\n**Ràng buộc kỹ thuật khi tư vấn:**\n- Máy để bàn dùng nước máy; CTS20 cần áp lực ≥ 0.1 mPa.\n- Lọc tổng cho nước máy đô thị; nước giếng khoan cần đánh giá riêng.\n- Showroom: **Liễu Giai là office, không phải showroom**; máy CTD50 có ở đại lý Việt Hưng (báo trước để đại lý sắp xếp); Bạch Mai không có máy.\n\n---\n\n## 12. Tài nguyên nội bộ\n\n> Đây là link tài nguyên làm việc (Google Docs/Sheets, Loom, Drive, YouTube). Tài khoản đăng nhập dùng **tài khoản nội bộ do quản lý cấp** — không lưu mật khẩu ở đây.\n\n**Google Sheet:**\n- Đơn hàng lọc nước uống: `https://docs.google.com/spreadsheets/d/14eRHq0X6BPptECVVIafAYJ5VuzMSN8z6wQ6a04126aA/edit`\n- File giá lõi: `https://docs.google.com/spreadsheets/d/1R7hV86EW4nUaAQb6Eerz4C_QNKXgEeY6_Ev9h7Tn8M0/edit`\n- Bảng tổng hợp đơn chốt + video ads: `https://docs.google.com/spreadsheets/d/1VcTO2m96lXV13YwAst2BHNw0RotCgFqQduMlkeANEQU/edit`\n- QA Master Dataset (Q&A cho chatbot; có quy tắc quick replies): `https://docs.google.com/spreadsheets/d/14q5DK4Eg4wC_iIfbV9KObx2RF1qqVjuHXFAwhLR3hes/edit`\n- Chương trình khuyến mãi định kỳ: `https://docs.google.com/spreadsheets/d/16WIcVvkxZO26kqN7sjoPa7GQCkhkSiHVU136ctP54Rg/edit`\n- Hướng dẫn xem nguồn ads / xử lý đơn hàng Pancake: `https://docs.google.com/spreadsheets/d/1QkOzGyJ7DiohX-_4YxXw4ruVtPl03_Agjpqy208lCa4/edit`\n- Template kế hoạch làm việc cá nhân: `https://docs.google.com/spreadsheets/d/1cLjW6u01wWqJdazPRPvt3IsaTphEwU_uXUQugyX_vHg/edit`\n\n**Google Doc:**\n- Kịch bản nghe hotline: `https://docs.google.com/document/d/1HWa-8z5LauSUlmRvmq8iGlmWDeMvZxiqVPAkuBsjPJ8/edit`\n- Hướng dẫn xin duyệt chi phí: `https://docs.google.com/document/d/1K2C1m7M2LSxSeIWkMtFTZ3BzECxKc9CFi8Ftdp9Hegc/edit`\n\n**Loom (video hướng dẫn):**\n- Hướng dẫn trả lời Pancake: `https://www.loom.com/share/4571db0de61c4a5c9e3a9c057c64326f`\n- Quy trình tư vấn/khảo sát/lắp đặt POE — Phần 1: `https://www.loom.com/share/02f5b4e56dad42e4a52a7897fed76033` · Phần 2: `https://www.loom.com/share/5a98134c75484afbb34caa47573f4ded`\n- Hướng dẫn nghe hotline: `https://www.loom.com/share/97f31558fe9a476088dea37e0d43e18e`\n- Theo dõi đơn hàng lọc tổng: `https://www.loom.com/share/95f306de381047ca8f5f61473e8519e1`\n- Biên bản xác nhận: `https://www.loom.com/share/c1e30a208dae4da285a38800be6b2314`\n- Note chi phí kiểm định nước (hạch toán Misa): `https://www.loom.com/share/bf26a741e23f40e18933bbfda502702f`\n\n**Drive / YouTube:**\n- Folder QA training AI Agent: `https://drive.google.com/drive/folders/1WPDDwSTiSCnzCmE3mnG15RmMJ-WZH2eh`\n- Folder video các máy: `https://drive.google.com/drive/folders/1YbsG82kz4Mm_w1f-RmdSxgN798sLrcdV`\n- Folder plan cá nhân: `https://drive.google.com/drive/folders/1MJF4omZEUOR3iHlKQuoM5iDY6iNRfaDk`\n- YouTube HDSD (CTD50, CTS20, CTS10): `https://www.youtube.com/@MaylocnuocGE`\n\n**Hệ thống:** Link bảo hành/kích hoạt/ticket CSKH: `https://cs-admin.gwt.vn`\n\n**Hotline / Zalo gửi khách** *(số của công ty, được phép gửi khách):*\n- Hotline chung: **1900 3363**\n- Hotline bán hàng GE Water Business: **099 333 8989**\n- Hotline CSKH GE Water Care: **0339 946 388**\n\n---"
      },
      {
        "slug": "quy-trinh-ban-hang-loc-tong",
        "tieuDe": "Quy trình bán hàng lọc tổng",
        "hang": "C",
        "nhom": "",
        "nguon": "Google Sites · Cẩm nang công việc",
        "thuTu": 2,
        "noiDung": "# Quy trình bán hàng lọc tổng\n\nThêm Tiêu đề và tiêu đề sẽ xuất hiện trong phần mục lục.\n\nNguồn khách hàng:\n\n1. Kênh online (Facebook, Zalo OA): khi có tin nhắn gửi đến cần chat ngay với khách hàng => Mục tiêu là xin sđt khách hàng\n\n1. Hotline 19003363: khi có cuộc gọi đến cần nghe ngay (nếu để nhỡ thì cần gọi lại sớm)\n\n1. Đại lý, đối tác, bạn bè: có thông tin thì liên hệ với khách hàng\n\nTrừ kênh online khi khách hàng để lại sđt là hệ thống Pancake sẽ tự động tạo 1 liên hệ trên CRM Pancake thì:\n\n- Khách hotline và khách đại lý => sau khi có được SĐT của khách hàng và đã gọi điện cho khách tư vấn thì cần tạo 1 contact trên CRM (bắt buộc, 100%, sớm nhất có thể)\n\nCập nhật các trường thông tin đầy đủ trong đó:\n\n- Tên: Tên khách hàng + Thành phố (nếu ko phải HN/HCM)/Khu đô thị (HN/HCM) hoặc thêm tiền tố KTS/Đại lý nếu thuộc 2 đối tượng này\n\n- Thời điểm tạo: sửa cho đúng ngày\n\n- Priority: Nửa sao (ưu tiên hàng đầu, có khả năng cao chốt được hợp đồng trong tháng, đã gặp khảo sát), 1 sao (liên hệ mới, có tiềm năng sẽ chi được, khách hỏi nhiều), 2-3 sao (khách chưa có tiềm năng lắm nhưng vẫn giữ để follow), 4 sao (đại lý, kiến trúc sư), 5 sao (khách đã mua của mình rồi, khách đã mua bên khác rồi, khách bảo ko có nhu cầu nữa, khách bảo ko có tiền mua)\n\n- Ghi chú: note lại các thông tin về yêu cầu khách hàng\n\n- Pancake Tag: SĐT (khách để lại đt), HN/HCM/Tỉnh khác, Đại lý/KTS, Chưa gọi được, Tiềm năng (gọi điện xong hoặc đang chat thấy khách quan tâm hỏi nhiều thì dùng tag này),  Không tiềm năng (khách bảo giá cao, ko rep), Ký HĐ (cố gắng chốt sớm để KH đặt cọc), Chờ lắp đặt (đã ký xong hđ và cọc nhưng chưa lắp), Bảo trì (lắp xong rồi), POU (khách đã mua máy lọc nước uống), POE (khách đã mua lọc tổng) => Quan trọng dùng để phân loại về sau\n\n- Nguồn\n\nThứ tự ưu tiên: Lấy SĐT khách hàng => Gọi điện trao đổi tư vấn => Add Zalo gửi thêm thông tin => Hẹn gặp mặt khảo sát => Khảo sát => Chốt ký HĐ (đặt cọc 10%) => Chuẩn bị lắp đăt => Lắp đặt => Bảo hành/bảo trì\n\nFolder ảnh và thông tin tư vấn khách hàng: https://d *(nguồn: rive.google.com)*/drive/folders/14lwoPWW7cvfAAhU_HEFvXFv6dFSk0qJV\n\nBáo giá: Template báo giá (sử dụng bản này để duplicate lên để sửa):\n\n1. 30A (Full option) - chỉ được gửi nếu khách có điều kiện ngân sách và đã trao đổi gặp mặt dễ chốt: https://w *(nguồn: ww.canva.com)*/design/DAGsWuvrRFM/SjuXOD6YV0wFEK-USwvzLw/edit?utm_content=DAGsWuvrRFM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton\n\n2. 30A (Standard): gửi online, bản cơ bản : https://w *(nguồn: ww.canva.com)*/design/DAGswWTAYA4/Fe9nL_QZcqhddT0Ygs3MGQ/edit?utm_content=DAGswWTAYA4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton\n\n3. 15A (Full): https://w *(nguồn: ww.canva.com)*/design/DAGsXO-PZ34/hXjg6OXhOktDR7u856B8mg/edit?utm_content=DAGsXO-PZ34&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton\n\n4. 15A (Standard): https://w *(nguồn: ww.canva.com)*/design/DAGswR1o2Uo/LlgSRbYJ9RJIE6G9QLITrQ/edit?utm_content=DAGswR1o2Uo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton\n\n5. 15AECO (Standard): https://w *(nguồn: ww.canva.com)*/design/DAGswXGXq_k/ZhZuNCoisqr89csEJKUzCA/edit?utm_content=DAGswXGXq_k&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
      },
      {
        "slug": "tu-van-pancake",
        "tieuDe": "Tư vấn trên Pancake",
        "hang": "C",
        "nhom": "",
        "nguon": "Google Sites · Cẩm nang công việc",
        "thuTu": 3,
        "noiDung": "# Tư vấn Pancake\n\nChat tư vấn Pancake\n\n1. Kiểm tra Botcake đã trả lời chưa, nếu đã trả lời thì đã đủ chưa\n\n- Nếu chưa trả lời thì cần làm như bên dưới\n\n- Nếu đã trả lời mà chưa đủ: cần trả lời bổ sung thêm\n\n- Nếu trả lời đủ rồi thì thôi\n\nTin nhắn Botcake trả lời sẽ có định dạng [Botcake] Nội dung tin nhắn hoặc Photo\n\n1. Tin nhắn đầy đủ cho khách hàng\n\nVới máy lọc nước uống\n\n- Thông tin sản phẩm: CTD50, CTS20\n\n- Giá: CTD50KM, CTS20KM\n\n- Có thể gưi thêm các thông tin khác nếu khách tiềm năng: Playlist, Hình lắp đặt\n\nVới lọc tổng: POE\n\n- Gửi bảng so sánh 4 mẫu sản phẩm giá 120 - 250tr để cung cấp thông tin sơ bộ và lọc khách tiềm năng: /sosanhwh\n\n- Hỏi luôn thông tin về nhà khách để tư vấn bộ sản phẩm: /xinsdt\n\nBáo cáo lạm dụng\n\nChi tiết trang"
      }
    ]
  },
  {
    "khu": "tai-chinh",
    "bai": [
      {
        "slug": "hoan-ung",
        "tieuDe": "Quy trình hoàn ứng",
        "hang": "C",
        "nhom": "",
        "nguon": "Google Sites · Cẩm nang công việc",
        "thuTu": 1,
        "noiDung": "# Quy trình hoàn ứng\n\n## Chi phí có hóa đơn\n\n1.1. Trên 5 triệu:\n\n- 100% phải thanh toán trực tiếp từ công ty\n\n- Quy định thuế: Hóa đơn VAT, bằng chứng chuyển tiền ngân hàng\n\n- Quy định chứng từ nội bộ: Báo giá, Hóa đơn VAT/hóa đơn VAT nháp (nếu có), ĐNTT, mail duyệt từ chị Trang\n\n- Thời gian thanh toán: thứ 3, thứ 5 hàng tuần\n\n- Người làm: Admin\n\nNote: Viết mail ĐNTT nên nêu rõ: khoản này thanh toán cho ai, mục đích gì, tổng số tiền.\n\n1.2. Dưới 5 triệu\n\n- Đối với khoản không gấp: thanh toán như khoản trên 5 triệu\n\n- Đối với khoản gấp: Thanh toán trước bằng tài khoản tiền mặt/tài khoản cá nhân, sau đó làm hoàn ứng với công ty\n\n- Quy trình hoàn ứng: Làm tương tự quy trình làm ĐNTT nội bộ, cần có đầy đủ chứng từ nội bộ, sau đó báo với nhân sự làm hoàn ứng\n\n- Thời gian làm hoàn ứng 2 lần:\n\nNgày 10 (làm hoàn ứng các đơn từ 26 tháng trước tới ngày 9 tháng này)\n\nNgày 25 (làm hoàn ứng các đơn từ 10 tháng này tới 25 tháng này)\n\n- Người làm hoàn ứng: Admin\n\n1.3. Xử lý thêm trường hợp lấy hóa đơn cho công ty\n\n- Nhân sự trả vào quỹ tiền mặt cho công ty chi phí đã trả cho nhà cung cấp/công ty đã hoàn ứng vào tài khoản cá nhân.\n\n- Người phụ trách kế toán lưu giữ các khoản tiền này ở trong file: tổng tiền mặt  là bao nhiêu, trong tháng lấy bao nhiêu hóa đơn cho công ty (không phải chi phí), những khoản không có hóa đơn. Kế toán có trách nhiệm kiểm kê tiền mặt hàng tuần. https://d *(nguồn: ocs.google.com)*/spreadsheets/d/1l7ceGggdp95eh0NKS5_F23_rGCakwWyaBEkpEDMrqtw/edit?gid=0#gid=0\n\n- Ví dụ: Trong tháng này, lấy hóa đơn cho công ty 10 triệu, chi phí không có hóa đơn 4 triệu => 6 triệu là không phải chi phí thực nhưng là chi phí trên sổ sách kế toán (Sẽ dùng chi phí thực để đưa vào báo cáo quản trị).\n\n## Chi phí không có hóa đơn\n\n- Sử dụng quỹ tiền mặt của công ty\n\n- Quy trình: Nhắn tin nhóm \"Duyệt chi phí mua hàng\", chị Trang oke, sau đó admin sẽ tổng hợp vào chi phí không có hóa đơn và hoàn ứng 1 lần vào ngày 30 hàng tháng. Amin ngày 30 sẽ ra ngân hàng, trả các khoản nhân sự đã ứng trước trong tháng.\n\n- Thời gian cut-off: Từ 26 tháng trước tới 25 tháng sau (ví dụ: 26/6 tới 25/7).\n\n- Chứng từ cần có: Ảnh thực tế mua hàng hóa mua, ảnh bill NCC gửi/tin nhắn báo giá/file báo giá, ảnh chuyển khoản cho NCC, ảnh tin nhắn chị Trang duyệt trong nhóm.\n\nBáo cáo lạm dụng\n\nChi tiết trang\n\nĐã cập nhật trang\n\nBáo cáo lạm dụng"
      }
    ]
  },
  {
    "khu": "van-hanh",
    "bai": [
      {
        "slug": "cong-viec-office",
        "tieuDe": "Công việc Office",
        "hang": "C",
        "nhom": "",
        "nguon": "Google Sites · Cẩm nang công việc",
        "thuTu": 1,
        "noiDung": "# Phân chia công việc tổ trợ lý - admin\n\nTrang wiki này là nơi tổng hợp và phân chia rõ ràng các đầu việc của Tổ Trợ lý – Admin, nhằm giúp từng thành viên trong tổ nắm rõ phạm vi phụ trách, đồng thời hỗ trợ các phòng ban khác dễ dàng phối hợp và liên hệ đúng người – đúng việc.\n\nTài liệu này đóng vai trò như một bản đồ công việc, giúp tổ chức vận hành hiệu quả, tránh chồng chéo, bỏ sót và đảm bảo mọi đầu mối hành chính – hỗ trợ nội bộ đều được theo dõi minh bạch và cập nhật kịp thời.\n\n📌 Ghi chú: Nội dung sẽ được cập nhật định kỳ theo sự thay đổi nhân sự hoặc phân công mới từ phòng Hành chính – Vận hành."
      }
    ]
  }
];
