# Kế toán — mở kỳ từ thư mục file cổng thuế NEXIA gửi

> **Ngày:** 2026-10-05 · **Nhánh:** `feat/ke-toan-nexia-cong-thue` (cắt từ `feat/ke-toan-lat-5`; nhánh đích merge chọn sau)
> **Spec gốc:** `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` — quyết định #11 giữ nguyên
> ("kỳ mở bằng file NEXIA"); chỉ **định dạng** file NEXIA đổi.

## Vì sao

Từ tháng 9/2026 NEXIA không gửi workbook khuôn 2024 (bìa + tab "HĐ đầu vào"/"HĐ Đầu ra") nữa mà gửi
**một thư mục** file xuất thẳng từ cổng hoá đơn điện tử:

```
Thang 9.2026/
  Mua vào/0110530659 - Mua vào - Chi tiết  - 2026-09-01_2026-09-30.xlsx   ← dữ liệu dòng hàng
  Mua vào/0110530659 - Mua vào - Tổng quan - 2026-09-01_2026-09-30.xlsx   ← mỗi HĐ một dòng (đối chiếu)
  Bán ra/0110530659 - Bán ra - Chi tiết  - …
  Bán ra/0110530659 - Bán ra - Tổng quan - …
  desktop.ini …
```

Đo trên file T8 cũ: 37 cột đầu của tab "HĐ đầu vào"/"HĐ Đầu ra" trùng **tên và thứ tự** với file
"Chi tiết" (chỉ khác 3 header gõ thừa dấu cách) → workbook NEXIA cũ = file Chi tiết dán vào khung.
App hiện chỉ mở kỳ từ workbook hai tab và xuất `_DAXULY` bằng cách điền vào chính file đó.

## Thiết kế (CEO duyệt 05/10 trong phiên)

1. **Upload cả thư mục** ở `/ke-toan` (và màn kỳ để upload lại). Bỏ qua file không phải `.xlsx`.
2. **Nhận diện theo nội dung**, không theo tên file: header dòng 1 có "Số hóa đơn" + "Tên hàng" → Chi tiết;
   tiêu đề "DANH SÁCH HÓA ĐƠN" + header ở dòng 4–10 → Tổng quan. Hướng: MST GWT `0110530659` là người
   mua → vào, người bán → ra.
3. **Chặn trước khi ghi**: thiếu một trong hai file Chi tiết; hai file cùng hướng; ngày lập rơi ngoài kỳ
   đang chọn; có file Tổng quan mà số HĐ / tổng tiền thanh toán lệch file Chi tiết.
4. **Ghép** thành workbook khuôn NEXIA: `Sheet1` (bìa, chép nguyên từ mẫu `accounting/_mau/nexia-bia.xlsx`
   trên Storage — không commit vì có tên người/link nội bộ; thiếu mẫu thì bỏ bìa) · `HĐ đầu vào` (Chi tiết
   mua vào) · `HĐ Đầu ra` (Chi tiết bán ra + cột khuôn kế toán `Mã hàng · Loại · Thành phố · Kênh · Đại lý · Note`).
5. Workbook ghép đi **đúng đường upload NEXIA hiện có** (một source `kind='nexia'`) → engine, sửa tại ô,
   học, xuất `_DAXULY`, sao kê không đổi; **không migration**. Một source cho cả hai hướng còn tránh bẫy
   `ke_toan_nguon_chot` (upload riêng từng hướng sẽ đánh dấu thiếu toàn bộ hướng kia).
6. File gốc lưu thêm ở `accounting/<kỳ>/goc/` (spec #16 — truy được khi cãi số).

## Task (tracer bullet — mỗi task tự kiểm được)

1. `lib/ke-toan/doc-file/cong-thue.ts` + test: `nhanDienFile`, `doiChieuTongQuan`, `kyCuaFile` (workbook tổng hợp trong test, không PII).
2. Cùng module: `ghepNexia` + test — workbook ghép đọc lại được bằng `docNexia`, xuất được bằng `dienExcelHoaDon`, tab ra có cột khuôn được điền.
3. `app/ke-toan/actions.ts`: tách lõi nhập buffer khỏi `nhapNguon`; action `uploadThuMuc` (nhận diện → chặn → ghép → nhập → lưu gốc).
4. UI `FormThuMuc.tsx` (chọn thư mục / nhiều file) ở `/ke-toan` + màn kỳ; hiện kết quả đối chiếu Tổng quan.
5. Đưa mẫu bìa lên Storage (chép `Sheet1` file NEXIA T8, một lần).
6. `tsc` + `test` + `build` sạch; nghiệm thu bằng thư mục `Thang 9.2026` thật: 343 dòng vào / 65 dòng ra,
   tổng 584.005.126 / 892.958.090 khớp Tổng quan; tải `09.2026 - GWT - NEXIA_DAXULY.xlsx` mở được, đủ 3 sheet.
7. README khu Kế toán: quy trình tháng mới + bẫy.
