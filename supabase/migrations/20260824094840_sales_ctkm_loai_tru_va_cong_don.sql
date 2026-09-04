-- Khuyến mãi: LOẠI TRỪ tập khách + CHO ÁP ĐỒNG THỜI 2 chương trình — CEO giao 24/08/2026.
--
-- Hai lỗ hổng của bản 21/08 mà việc này bịt:
--
-- 1. Cột `sales_ctkm.nhom_khach` (TAT_CA / MOI / DA_MUA / CHI_DINH) được LƯU nhưng
--    KHÔNG AI ĐỌC — `boiCanhGia()` chỉ lọc theo ngày + kênh + trạng thái. Nghĩa là
--    chọn "Chỉ khách mới" trong form vẫn áp cho mọi khách. Và `CHI_DINH` còn tệ hơn:
--    chưa có bảng nào chứa danh sách, chọn xong là chương trình áp cho TẤT CẢ.
--
-- 2. Không có đường nào nói "khách này KHÔNG được hưởng" — thứ CEO cần cho các ca
--    khách đã có giá thoả thuận riêng, khách đang khiếu nại, khách nội bộ.
--
-- Thêm một bảng `sales_ctkm_khach` phục vụ CẢ HAI chiều (`loai` = GOM / TRU) thay vì
-- hai bảng: cùng khoá, cùng đường ghi, và tra một lượt là biết cả hai. Quan trọng hơn:
-- một khách KHÔNG THỂ vừa nằm danh sách gồm vừa nằm danh sách trừ (khoá chính chặn),
-- nên không đẻ ra ca "gồm hay trừ cái nào thắng" để phải đoán.

-- ══ 1. Danh sách khách GỒM / TRỪ ════════════════════════════════════════════════
create table if not exists public.sales_ctkm_khach (
  ctkm_id       uuid not null references public.sales_ctkm(id) on delete cascade,
  customer_code text not null,
  -- GOM = chỉ những khách này được hưởng (đi cùng nhom_khach = 'CHI_DINH')
  -- TRU = những khách này KHÔNG được hưởng, dù nhóm khách có bao họ
  loai          text not null check (loai in ('GOM', 'TRU')),
  ghi_chu       text,
  primary key (ctkm_id, customer_code)
);
create index if not exists sales_ctkm_khach_loai_idx
  on public.sales_ctkm_khach(ctkm_id, loai);

comment on table public.sales_ctkm_khach is
  'Khach duoc chi dinh (GOM) hoac bi loai tru (TRU) khoi mot chuong trinh khuyen mai. '
  'Khoa chinh (ctkm_id, customer_code) nen mot khach chi nam duoc mot ben. CEO giao 24/08/2026.';

-- ══ 2. Cho phép cộng dồn ════════════════════════════════════════════════════════
-- Mặc định FALSE = giữ nguyên nết cũ: nhiều chương trình cùng khớp thì chỉ chương trình
-- GIẢM SÂU NHẤT áp, không cộng dồn. Bật cờ này là chương trình được áp CHỒNG lên trên
-- chương trình đã chọn — đúng ca CEO nêu: CTD50 vừa giảm 15% vừa được tặng quà, trong đó
-- phần quà là một chương trình riêng.
--
-- Vì sao là cờ trên TỪNG chương trình chứ không phải bật cộng dồn cho cả hệ thống:
-- cộng dồn mặc định là hai chương trình 15% + 20% ra 32% mà không ai cố ý duyệt con số
-- đó. Người tạo chương trình phải chủ động nói "cái này được chồng".
alter table public.sales_ctkm
  add column if not exists cong_don boolean not null default false;

comment on column public.sales_ctkm.cong_don is
  'true = duoc ap CHONG len chuong trinh khac (vd chuong trinh chi tang qua). '
  'false (mac dinh) = chi mot chuong trinh giam sau nhat duoc ap. CEO chot 24/08/2026.';

-- ══ 3. Cờ đánh dấu dòng quà sinh từ chương trình ════════════════════════════════
-- Dòng quà vẫn là dòng hàng bình thường (is_gift = true, tính 0 đ), thêm cột này chỉ để
-- biết quà nào do chương trình sinh ra — cần cho việc tính chi phí chương trình sau này,
-- và để nhân viên phân biệt với quà họ tự thêm tay.
alter table public.sales_order_items
  add column if not exists ctkm_id uuid references public.sales_ctkm(id) on delete set null;

comment on column public.sales_order_items.ctkm_id is
  'Dong qua nay do chuong trinh khuyen mai nao sinh ra. NULL = nhan vien tu them.';
