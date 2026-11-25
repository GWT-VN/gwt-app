-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831074946, name sales_nhap_chinh_sach_gia_3_cap).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 84dd6809a16fa5c35ae75a9418e0d8d3.

update public.sales_chinh_sach_gia
   set trang_thai='thay_the', hieu_luc_den=date '2026-08-28'
 where trang_thai='ban_hanh';

with ny(ma_tm, internal_code, gia) as (values
  ('GN610','GPUN-4000XEN-G',16950000::bigint),
  ('GN620','GTUN-5800EN-G', 22950000),
  ('DN810','GTUN-8500XDS-G',32950000),
  ('USH10','GTUN-8600HP-G', 44950000),
  ('CTS10','CTS10NB',       30950000),
  ('CTS10','CTS10NW',       30950000),
  ('CTD50','CTD50NG',       19950000),
  ('CTS20','CTS20NG',       39950000),
  ('WH15A-ECO','WH15AECO',  119950000),
  ('WH30A-ECO','WH30AECO',  149950000),
  ('WH15A','WH15A',         179950000),
  ('WH30A','WH30A',         249950000)
),
npp(ma_tm, gia_npp) as (values
  ('GN610',8475000::bigint),('GN620',16065000),('DN810',23065000),('USH10',31465000),
  ('CTS10',15475000),('CTD50',9975000),('CTS20',19975000),
  ('WH15A-ECO',75000000),('WH15A',112000000),('WH30A',158000000)
),
pct(ma_tm, dai_ly, gioi_thieu) as (values
  ('GN610',50,35),('GN620',30,25),('DN810',30,25),('USH10',30,25),('CTS10',30,25),
  ('CTD50',30,25),('CTS20',30,25),
  ('WH15A-ECO',20,10),('WH30A-ECO',20,10),('WH15A',20,10),('WH30A',20,10)
)
insert into public.sales_chinh_sach_gia
  (bac, internal_code, giam_pct, gia_ban, nhap_theo, hieu_luc_tu, trang_thai, nguoi_dat)
select 'NPP', n.internal_code,
       round((1 - p.gia_npp::numeric / n.gia) * 1000) / 10,
       p.gia_npp, 'GIA', date '2026-08-28', 'ban_hanh', 'ceo@gwt.vn'
  from ny n join npp p on p.ma_tm = n.ma_tm
union all
select 'DAI_LY', n.internal_code, c.dai_ly,
       round(n.gia * (1 - c.dai_ly / 100.0)), 'PCT', date '2026-08-28', 'ban_hanh', 'ceo@gwt.vn'
  from ny n join pct c on c.ma_tm = n.ma_tm
union all
select 'GIOI_THIEU', n.internal_code, c.gioi_thieu,
       round(n.gia * (1 - c.gioi_thieu / 100.0)), 'PCT', date '2026-08-28', 'ban_hanh', 'ceo@gwt.vn'
  from ny n join pct c on c.ma_tm = n.ma_tm;
