-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831091127, name sales_ctkm_ban_le_dung_gia_va_qua).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 3383d85e1deba6d0006335289950af7c.
-- guard thêm 04/09/2026: insert vào sales_ctkm_kenh chỉ lấy dòng có channel tồn tại (`where exists ... dim_channel`)
-- — cùng lý do FK 23503 như migration 20260831075028 (c.kenh_id là literal 90/81 trong _ct, không tự suy từ
-- dim_channel nên có thể không tồn tại trên local rỗng); no-op trên live. md5(statements) gốc vẫn là
-- 3383d85e1deba6d0006335289950af7c.

delete from public.sales_ctkm;
delete from public.sales_chinh_sach_gia where trang_thai = 'thay_the';

create temp table _ct(ma text, ten text, kenh_id int, sp text, tu date, den date, qua text) on commit drop;
insert into _ct values
 ('KM-GWT-CTD50-Q1','GWT · CTD50 · T1–T3',90,'CTD50NG','2026-01-01','2026-03-31',
  '01 vòi sen tắm GE (1.950.000) · 01 gói test nước 7 khoáng (3.000.000) · 01 hộp trà Tita Art (480.000) · 01 hộp cafe PiN (250.000) · 04 gói điện giải (140.000) · 01 bộ xà phòng & nước mềm GE (175.000) · Freeship Extra'),
 ('KM-GWT-CTD50-T4','GWT · CTD50 · T4',90,'CTD50NG','2026-04-01','2026-04-30','Miễn phí vận chuyển toàn quốc'),
 ('KM-GWT-CTD50-T58','GWT · CTD50 · T5–T8',90,'CTD50NG','2026-05-01','2026-08-31',
  '01 vòi sen tắm khử Clo GE (1.950.000) · 01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển + lắp đặt'),
 ('KM-GWT-CTD50-T9','GWT · CTD50 · T9',90,'CTD50NG','2026-09-01','2026-09-30',
  '01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển (500.000) · gói test 7 khoáng (3.000.000)'),
 ('KM-GWT-CTS20-Q1','GWT · CTS20 · T1–T4',90,'CTS20NG','2026-01-01','2026-04-30',
  '01 bình gas sparkling (1.200.000) · 01 vòi sen tắm GE (1.950.000) · 01 bộ lót cốc da Quyn (6.000.000) · 01 gói test 7 khoáng (3.000.000) · 01 hộp trà sen Tita Art (1.000.000) · 01 hộp cafe PiN (500.000) · 04 gói điện giải (140.000) · 01 bộ xà phòng & nước mềm GE (175.000) · 01 tạp chí Art Republik (400.000) · Freeship Extra'),
 ('KM-GWT-CTS20-T58','GWT · CTS20 · T5–T8',90,'CTS20NG','2026-05-01','2026-08-31',
  '01 máy lọc nước âm tủ bếp GN610 (16.950.000) · miễn phí vận chuyển + lắp đặt'),
 ('KM-GWT-CTS20-T9','GWT · CTS20 · T9',90,'CTS20NG','2026-09-01','2026-09-30',
  '02 bình gas sparkling (2.400.000) · 02 lõi PCF voucher (4.000.000) · 01 lõi NF voucher (5.000.000) · gói test 7 khoáng (3.000.000) · miễn phí vận chuyển (500.000)'),
 ('KM-GWT-CTS10-T68','GWT · CTS10 · T6–T8',90,'CTS10','2026-06-01','2026-08-31',
  '01 lõi CFNC voucher · 01 bình gas sparkling · miễn phí vận chuyển'),
 ('KM-GWT-CTS10-T9','GWT · CTS10 · T9',90,'CTS10','2026-09-01','2026-09-30',
  '01 lõi CFNC voucher (5.000.000) · 01 bình gas sparkling (1.200.000) · miễn phí vận chuyển (500.000)'),
 ('KM-HN-CTD50-Q1','Hannah · CTD50 · T1–T3',81,'CTD50NG','2026-01-01','2026-03-31',
  '01 vòi sen tắm khử Clo GE (1.950.000) · 01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển'),
 ('KM-HN-CTD50-T4','Hannah · CTD50 · T4',81,'CTD50NG','2026-04-01','2026-04-30','Miễn phí vận chuyển toàn quốc'),
 ('KM-HN-CTD50-T58','Hannah · CTD50 · T5–T8',81,'CTD50NG','2026-05-01','2026-08-31',
  '01 vòi sen tắm khử Clo GE (1.950.000) · 01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển + lắp đặt'),
 ('KM-HN-CTD50-T9','Hannah · CTD50 · T9',81,'CTD50NG','2026-09-01','2026-09-30',
  '01 lõi CFNC voucher (5.000.000) · miễn phí vận chuyển (500.000) · gói test 7 khoáng (3.000.000)'),
 ('KM-HN-CTS20-Q1','Hannah · CTS20 · T1–T3',81,'CTS20NG','2026-01-01','2026-03-31',
  '02 bình gas sparkling (2.400.000) · 01 vòi sen tắm khử Clo GE (1.950.000) · 02 lõi PCF voucher (4.000.000) · 01 lõi NF voucher (5.000.000) · gói test 7 khoáng (3.000.000) · miễn phí vận chuyển'),
 ('KM-HN-CTS20-T4','Hannah · CTS20 · T4',81,'CTS20NG','2026-04-01','2026-04-30','Miễn phí vận chuyển toàn quốc'),
 ('KM-HN-CTS20-T58','Hannah · CTS20 · T5–T8',81,'CTS20NG','2026-05-01','2026-08-31',
  '01 máy lọc nước âm tủ bếp GN610 (16.950.000) · miễn phí vận chuyển + lắp đặt'),
 ('KM-HN-CTS20-T9','Hannah · CTS20 · T9',81,'CTS20NG','2026-09-01','2026-09-30',
  '02 bình gas sparkling (2.400.000) · 02 lõi PCF voucher (4.000.000) · 01 lõi NF voucher (5.000.000) · gói test 7 khoáng (3.000.000) · miễn phí vận chuyển (500.000)'),
 ('KM-HN-CTS10-T68','Hannah · CTS10 · T6–T8',81,'CTS10','2026-06-01','2026-08-31',
  '01 lõi CFNC voucher · 01 bình gas sparkling · miễn phí vận chuyển'),
 ('KM-HN-CTS10-T9','Hannah · CTS10 · T9',81,'CTS10','2026-09-01','2026-09-30',
  '01 lõi CFNC voucher (5.000.000) · 01 bình gas sparkling (1.200.000) · miễn phí vận chuyển (500.000)');

insert into public.sales_ctkm
  (ma, ten, tu_ngay, den_ngay, nhom_khach, kieu_giam, muc_chung, trang_thai, tao_boi, mo_ta_khach, luu_y_noi_bo)
select ma, ten, tu, den, 'TAT_CA', 'PCT', 15,
       case when den < current_date then 'ket_thuc' else 'ban_hanh' end, 'ceo@gwt.vn', qua,
       'Giảm 15% trên giá niêm yết. Con số "tổng chiết khấu" trong Tracking FB là số marketing (tính trên giá niêm yết CỘNG giá trị quà) — KHÔNG dùng làm mức giảm.'
from _ct;

insert into public.sales_ctkm_kenh (ctkm_id, channel_id)
select k.id, c.kenh_id from _ct c join public.sales_ctkm k on k.ma = c.ma
 where exists (select 1 from public.dim_channel d where d.id = c.kenh_id);

insert into public.sales_ctkm_sp (ctkm_id, internal_code, muc)
select k.id, x.ma_sp, 15
from _ct c
join public.sales_ctkm k on k.ma = c.ma
cross join lateral unnest(
  case when c.sp = 'CTS10' then array['CTS10NB','CTS10NW'] else array[c.sp] end
) as x(ma_sp);

insert into public.sales_ctkm_qua (ctkm_id, internal_code_qua, so_luong, dieu_kien)
select k.id, c.qua, 1, 'Trọn gói quà của chương trình'
from _ct c join public.sales_ctkm k on k.ma = c.ma;
