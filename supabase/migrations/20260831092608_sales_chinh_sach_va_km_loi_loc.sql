-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831092608, name sales_chinh_sach_va_km_loi_loc).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = c3ebce73b5cfafc1d79e7bbb873cd72b.

-- LOI LOC — CEO duyet huong 31/08.
--
-- PHAT HIEN quan trong ve cach doc bang lot loc trong 24 Luxury Home:
-- chiet khau NPP tinh tren GIA BAN SAU KHUYEN MAI, khong phai tren gia niem yet.
-- Kiem chung: GN610 PCF gia sau KM 1.435.000 x (1-30%) = 1.004.500 = dung o "GIA NPP NHAP".
-- CFNC 3.500.000 x (1-38%) = 2.170.000 = dung. Ca bang khop.
-- CEO xac nhan cung cach tinh: "chiet khau dai ly 30% CUA 3tr5".
--
-- Gia niem yet lay tu MASTERDATA (product_price) chu khong lay trong file:
-- file ghi CFNC niem yet 3.500.000 la SO CU, thuc te da len 5.000.000 (CEO xac nhan).

create temp table _loi(
  ma text, km_pct numeric, npp_pct numeric, dai_ly_pct numeric
) on commit drop;
-- ma noi bo | % KM ban le | % CK cho NPP (tren gia sau KM) | % CK dai ly (tren gia sau KM)
insert into _loi values
  ('LX-CFNC-001-G', 30, 38, 30),   -- CTS10 CFNC — CEO chot 31/08: dai ly 30% cua 3tr5
  ('LX-CFNC-002-G', 40, 38, null), -- CTD50 CFNC
  ('LX-PCF-005-G',  25, 30, null), -- CTS20 PCF
  ('LX-NF100-004-G',30, 30, null), -- CTS20 NF
  ('GT-PCF10-G01-G',25, 30, null), -- B04 CPF
  ('GT-NF50-G01G',  25, 30, null), -- B04 NF
  ('GT-PCF10-F02G', 30, 30, null), -- GN610 PCF
  ('GT-NF600-F02G', 30, 30, null), -- GN610 NF
  ('GT-PCF13-F01G', 25, 30, null), -- GN620 PCF
  ('GT-NF600-F01G', 30, 30, null), -- GN620 NF
  ('LX-PCFB-002-G', 25, 30, null), -- DN810 PCFB
  ('LX-PPF-003-G',  25, 30, null), -- DN810 PPF
  ('GT-NF800-F01G', 30, 30, null), -- DN810 NF
  ('LX-PCFB-003-G', 25, 30, null), -- USH10 PCFB
  ('LX-NF700-003-G',30, 30, null), -- USH10 NF
  ('LX-PP-003-G',    0, 30, null), -- UPF10 PP
  ('GASDEN',         0, 30, null), -- binh gas moi
  ('GASDEN-G',       0, 30, null), -- thay gas
  ('MUOIAD',         0, 24.24, null); -- muoi

-- 1) CHINH SACH NPP cho loi — nhap theo GIA tuyet doi
insert into public.sales_chinh_sach_gia
  (bac, internal_code, giam_pct, gia_ban, nhap_theo, hieu_luc_tu, trang_thai, nguoi_dat)
select 'NPP', l.ma,
       round((1 - (p.gia_vat * (1 - l.km_pct/100) * (1 - l.npp_pct/100)) / p.gia_vat) * 1000)/10,
       round(p.gia_vat * (1 - l.km_pct/100) * (1 - l.npp_pct/100)),
       'GIA', date '2026-08-31', 'ban_hanh', 'ceo@gwt.vn'
  from _loi l join product_price p on p.internal_code = l.ma and p.kenh='NIEM_YET';

-- 2) CHINH SACH DAI LY cho loi — CEO: "tuy doi tac moi co", nen CHI nhap ma CEO chi dinh
insert into public.sales_chinh_sach_gia
  (bac, internal_code, giam_pct, gia_ban, nhap_theo, hieu_luc_tu, trang_thai, nguoi_dat, ghi_chu)
select 'DAI_LY', l.ma,
       round((1 - (p.gia_vat * (1 - l.km_pct/100) * (1 - l.dai_ly_pct/100)) / p.gia_vat) * 1000)/10,
       round(p.gia_vat * (1 - l.km_pct/100) * (1 - l.dai_ly_pct/100)),
       'GIA', date '2026-08-31', 'ban_hanh', 'ceo@gwt.vn',
       'Chiet khau loi cho dai ly la TUY DOI TAC (CEO chot 31/08) — dong nay CEO chi dinh rieng'
  from _loi l join product_price p on p.internal_code = l.ma and p.kenh='NIEM_YET'
 where l.dai_ly_pct is not null;

-- 3) KHUYEN MAI LOI cho khach le — chay CO DINH, KHONG co ngay ket thuc
with km as (
  insert into public.sales_ctkm
    (ma, ten, tu_ngay, den_ngay, nhom_khach, kieu_giam, trang_thai, tao_boi, mo_ta_khach, luu_y_noi_bo)
  values ('KM-LOI-CODINH','Khuyến mãi lõi lọc (chạy cố định)', date '2026-01-01', null,
          'TAT_CA','PCT','ban_hanh','ceo@gwt.vn',
          'Giảm giá lõi lọc thay thế cho khách lẻ. Chạy liên tục, không có ngày kết thúc.',
          'Đại lý / NPP KHÔNG hưởng chương trình này — họ đã có giá riêng theo bậc. Bộ tự bắt giá ưu tiên bậc trước khuyến mãi nên tự khớp.')
  returning id
)
insert into public.sales_ctkm_kenh (ctkm_id, channel_id)
select km.id, d.id from km
  cross join dim_channel d
 where upper(d.channel_l1) in ('TRỰC TIẾP','KOL','GIỚI THIỆU','KTS','ECOM');

insert into public.sales_ctkm_sp (ctkm_id, internal_code, muc)
select k.id, l.ma, l.km_pct
  from _loi l cross join public.sales_ctkm k
 where k.ma = 'KM-LOI-CODINH' and l.km_pct > 0;
