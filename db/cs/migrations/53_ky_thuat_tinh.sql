-- 53 — tỉnh/TP phụ trách của kỹ thuật.
--
-- CEO 24/08/2026, mục bảng điều phối:
--   "Đã ok phần lọc: có thể thêm kĩ thuật theo tỉnh nào (và lọc đc theo tỉnh)"
--
-- Bảng `ky_thuat` sẵn có cột `vung` nhưng nó chỉ nhận 'bac'/'nam' — dùng để tính
-- lịch bảo trì tránh ngày nghỉ (miền Bắc nghỉ T7+CN, miền Nam chỉ CN), KHÔNG phải
-- để điều phối. Điều phối cần biết tỉnh cụ thể: chuyến ở Hưng Yên thì gán cho ai.
-- Nên thêm cột riêng chứ không nhét tỉnh vào `vung` — nhét vào là hỏng luật lịch.
--
-- Kiểu `text` và KHÔNG ràng buộc danh mục, cùng lý do với `cs_customers.province`:
-- danh mục tỉnh đang trong đợt sáp nhập, tên cũ và tên mới đều phải nhận được.
-- Giao diện dùng chung ô `ChonTinh` (gõ để tìm, 64 tỉnh) nên thực tế vẫn vào khuôn.
--
-- Để TRỐNG là hợp lệ: kỹ thuật chạy nhiều tỉnh hoặc chưa phân vùng thì bỏ trống,
-- ô lọc chỉ hiện những tỉnh THẬT SỰ có người, không đẻ ra 64 chip rỗng.

alter table ky_thuat
  add column if not exists tinh text;

comment on column ky_thuat.tinh is
  'Tỉnh/TP kỹ thuật phụ trách — dùng cho điều phối chuyến. Khác `vung` (bac/nam) vốn chỉ dùng để tính lịch tránh ngày nghỉ.';

-- Back-fill: ô `vung` đang bị dùng nhầm làm ô tỉnh.
-- Đo prod 24/08: kỹ thuật duy nhất đang hoạt động có `vung = 'Hà Nội'` — không phải
-- 'bac'/'nam'. Người nhập hiểu ô đó là "phụ trách vùng nào", đúng nhu cầu, sai ô.
-- CHÉP sang `tinh` chứ không CHUYỂN: giữ nguyên `vung` để không xoá dữ liệu ai đó đang
-- nhìn; ai dọn lại ô Vùng thì dọn sau. Chỉ chép giá trị KHÔNG phải 'bac'/'nam'.
update ky_thuat
   set tinh = trim(vung)
 where tinh is null
   and vung is not null
   and lower(trim(vung)) not in ('bac', 'nam', 'bắc', 'nam bộ');
