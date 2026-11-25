-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831075028, name sales_nhap_ctkm_ban_le_t1_t9).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 9fa9fcb60fff185d927bf5bc2990b291.
-- guard thêm 04/09/2026: insert vào sales_ctkm_kenh chỉ lấy dòng có channel tồn tại (`where exists ... dim_channel`)
-- — trên live dim_channel có sẵn (mirror từ Masterdata qua sync_catalog(), không chạy được local) nên đây là no-op;
-- trên local/CI dim_channel rỗng, thiếu guard này insert văng lỗi FK 23503. md5(statements) gốc vẫn là
-- 9fa9fcb60fff185d927bf5bc2990b291 (guard không tính vào md5 đã ghi ở dòng trên).

-- KHUYEN MAI BAN LE T1-T9/2026 — CEO duyet 28/08.
-- Nguon: 2026_CTKM DINH KI GWT.xlsx, tab "Tracking FB", cot GWT va Hannah Olala.
-- CEO chot 28/08: chi can GWT + Hannah. Shopee set thang tren san (app chi keo don ve).
-- Dai ly hien chua co CTKM.
--
-- Mot chuong trinh = mot (kenh, thang). Muc giam de o TUNG MA HANG (sales_ctkm_sp)
-- vi cung mot thang moi may mot muc khac nhau.
-- T1-T4 khong co "Tong chiet khau" trong nguon => chi TANG QUA, kieu_giam='KHONG'.

-- Ket thuc cac ban THU NGHIEM 24/08
update public.sales_ctkm set trang_thai='ket_thuc'
 where trang_thai in ('ban_hanh','nhap') and tu_ngay < date '2026-08-28';

with ct(ma, ten, kenh_id, thang, tu, den, kieu, sp_muc) as (values
  -- GWT (Truc tiep, channel 90)
  ('KM-GWT-T5','GWT tháng 5/2026',90, 5, date '2026-05-01', date '2026-05-31','PCT','CTD50NG=37,CTS20NG=40'),
  ('KM-GWT-T6','GWT tháng 6/2026',90, 6, date '2026-06-01', date '2026-06-30','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T7','GWT tháng 7/2026',90, 7, date '2026-07-01', date '2026-07-31','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T8','GWT tháng 8/2026',90, 8, date '2026-08-01', date '2026-08-31','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T9','GWT tháng 9/2026',90, 9, date '2026-09-01', date '2026-09-30','PCT','CTD50NG=40.4,CTS20NG=38.1,CTS10NB=30,CTS10NW=30'),
  -- Hannah Olala (KOL · HANNAH, channel 81)
  ('KM-HN-T1','Hannah tháng 1/2026',81, 1, date '2026-01-01', date '2026-01-31','KHONG',''),
  ('KM-HN-T2','Hannah tháng 2/2026',81, 2, date '2026-02-01', date '2026-02-28','KHONG',''),
  ('KM-HN-T3','Hannah tháng 3/2026',81, 3, date '2026-03-01', date '2026-03-31','KHONG',''),
  ('KM-HN-T5','Hannah tháng 5/2026',81, 5, date '2026-05-01', date '2026-05-31','PCT','CTD50NG=37,CTS20NG=40'),
  ('KM-HN-T6','Hannah tháng 6/2026',81, 6, date '2026-06-01', date '2026-06-30','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T7','Hannah tháng 7/2026',81, 7, date '2026-07-01', date '2026-07-31','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T8','Hannah tháng 8/2026',81, 8, date '2026-08-01', date '2026-08-31','PCT','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T9','Hannah tháng 9/2026',81, 9, date '2026-09-01', date '2026-09-30','PCT','CTD50NG=40.4,CTS20NG=38.1,CTS10NB=30,CTS10NW=30')
),
them as (
  insert into public.sales_ctkm
    (ma, ten, tu_ngay, den_ngay, nhom_khach, kieu_giam, trang_thai, tao_boi, mo_ta_khach)
  select ma, ten, tu, den, 'TAT_CA', kieu, 'ban_hanh', 'ceo@gwt.vn',
         case when kieu='KHONG' then 'Chương trình tặng quà, không giảm giá niêm yết'
              else 'Giảm giá theo từng mã máy — xem chi tiết sản phẩm' end
  from ct returning id, ma
)
insert into public.sales_ctkm_kenh (ctkm_id, channel_id)
select t.id, c.kenh_id from them t join ct c on c.ma = t.ma
 where exists (select 1 from public.dim_channel d where d.id = c.kenh_id);

-- Muc giam tung ma hang
with ct(ma, sp_muc) as (values
  ('KM-GWT-T5','CTD50NG=37,CTS20NG=40'),
  ('KM-GWT-T6','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T7','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T8','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-GWT-T9','CTD50NG=40.4,CTS20NG=38.1,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T5','CTD50NG=37,CTS20NG=40'),
  ('KM-HN-T6','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T7','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T8','CTD50NG=37,CTS20NG=40,CTS10NB=30,CTS10NW=30'),
  ('KM-HN-T9','CTD50NG=40.4,CTS20NG=38.1,CTS10NB=30,CTS10NW=30')
)
insert into public.sales_ctkm_sp (ctkm_id, internal_code, muc)
select k.id, split_part(x, '=', 1), split_part(x, '=', 2)::numeric
  from ct
  join public.sales_ctkm k on k.ma = ct.ma
  cross join lateral unnest(string_to_array(ct.sp_muc, ',')) as x
 where ct.sp_muc <> '';
