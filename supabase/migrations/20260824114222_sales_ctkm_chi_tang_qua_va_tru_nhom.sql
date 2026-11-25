-- Khuyến mãi: chương trình CHỈ TẶNG QUÀ + loại trừ theo NHÓM — CEO giao 24/08/2026.
--
-- ══ 1. Kiểu giảm 'KHONG' — chương trình không giảm giá, chỉ tặng quà ═══════════
--
-- CEO: *"Đang ko cho lưu chương trình chỉ có quà tặng - ko có giảm giá (ko hợp lý cho
-- các case thực tế chỉ tặng quà)"*.
--
-- Trước đây `kieu_giam` chỉ có PCT / TIEN / CON — cả ba đều là một cách GIẢM GIÁ, không
-- có cách nào nói "chương trình này không giảm đồng nào". Người soạn buộc phải gõ một
-- mức giảm giả rồi tự nhớ là đừng dùng. Đó là cách sinh ra dữ liệu sai: chương trình
-- "CTD50 tháng 8" trên prod hiện mang mức 10% mà CEO chỉ định tặng quà.
--
-- Thêm 'KHONG' thay vì cho `muc_chung = null` mang nghĩa ngầm: null đã có nghĩa riêng ở
-- `sales_ctkm_sp.muc` ("dùng mức chung"), và chính chỗ nhập nhằng null/0 đã đẻ ra lỗi
-- dán nhãn khuyến mãi lên giá chưa giảm sáng nay. Một trạng thái thì đặt tên hẳn hoi.
alter table public.sales_ctkm drop constraint if exists sales_ctkm_kieu_giam_check;
alter table public.sales_ctkm
  add constraint sales_ctkm_kieu_giam_check
  check (kieu_giam in ('PCT', 'TIEN', 'CON', 'KHONG'));

comment on column public.sales_ctkm.kieu_giam is
  'PCT = giam % · TIEN = giam so tien · CON = chot thang gia ban ("giam con") · '
  'KHONG = khong giam gia, chuong trinh chi tang qua (CEO chot 24/08/2026).';

-- ══ 2. Loại trừ theo NHÓM khách ════════════════════════════════════════════════
--
-- CEO: *"cho loại trừ cả nhóm khách và từng khách 1 như hiện tại"*.
--
-- `sales_ctkm_khach` (làm sáng nay) gạch tên TỪNG người — đúng nhưng không dùng được
-- khi cần gạch cả một tập: "chương trình này không áp cho kênh Shopee", "không áp cho
-- đại lý", "chỉ dành khách mới nên gạch khách đã mua".
--
-- Ba loại tập, cố ý KHÔNG mở rộng thêm: mỗi loại phải tra được từ dữ liệu app đã có
-- sẵn lúc lên đơn (kênh của đơn, bậc trong `sales_bac_khach`, lịch sử mua trong
-- `customers`). Loại nào phải đi hỏi thêm bảng khác thì thêm sau, đừng đoán trước.
create table if not exists public.sales_ctkm_tru_nhom (
  ctkm_id  uuid not null references public.sales_ctkm(id) on delete cascade,
  -- KENH = gia_tri là channel_id (dim_channel)
  -- BAC  = gia_tri là 'NPP' | 'DAI_LY' | 'GIOI_THIEU' | 'CO_BAC' (mọi đối tác có bậc)
  -- NHOM = gia_tri là 'MOI' | 'DA_MUA'
  loai     text not null check (loai in ('KENH', 'BAC', 'NHOM')),
  gia_tri  text not null,
  primary key (ctkm_id, loai, gia_tri)
);
create index if not exists sales_ctkm_tru_nhom_ct_idx on public.sales_ctkm_tru_nhom(ctkm_id);

comment on table public.sales_ctkm_tru_nhom is
  'Tap khach bi loai tru khoi mot chuong trinh khuyen mai: theo KENH, theo BAC dai ly, '
  'hoac theo NHOM moi/da mua. Gach ca tap; gach tung nguoi thi dung sales_ctkm_khach. '
  'CEO giao 24/08/2026.';
