-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260821101314, name sales_guong_gia_niem_yet).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = bbd6963b0ea1fefb06766615798492e2.

-- Bảng GƯƠNG giá niêm yết, chép từ GWT-Masterdata (qynpywysgltspmgnhhga).product_price.
-- Khu Sales chỉ ĐỌC bảng này; nguồn chân lý vẫn ở Masterdata.
--
-- ⚠️ ĐỔI ĐƠN VỊ khi chép: Masterdata lưu vat_pct dạng PHẦN TRĂM (8), bảng này lưu
-- PHÂN SỐ (0.08) cho khớp `sales_order_lines`/`sales_order_items` và hàm chuanVat().
-- Trộn hai đơn vị trong một app chính là thứ đẻ ra lỗi hiện "800%" hôm 21/08.
--
-- ⚠️ `gia_vat` ĐÃ GỒM VAT — ghi rõ trong cột source bên Masterdata:
-- "chủ file duyệt 2026-08-21: ĐÃ GỒM VAT (riêng bình gas không áp dụng VAT, bán nội bộ)".
create table if not exists public.product_price (
  internal_code text        not null,
  kenh          text        not null,
  gia_vat       bigint      not null,
  vat_pct       numeric,
  hieu_luc_tu   date        not null,
  hieu_luc_den  date,
  nguon         text        not null default 'GWT-Masterdata.product_price',
  synced_at     timestamptz not null default now(),
  primary key (internal_code, kenh, hieu_luc_tu)
);

comment on table  public.product_price is 'GƯƠNG giá niêm yết từ GWT-Masterdata. Chỉ đọc. gia_vat ĐÃ GỒM VAT. vat_pct là PHÂN SỐ (khác nguồn: nguồn lưu phần trăm).';
comment on column public.product_price.gia_vat is 'Giá niêm yết ĐÃ GỒM VAT (đồng).';
comment on column public.product_price.vat_pct is 'PHÂN SỐ (0.08 = 8%) — đã quy đổi từ phần trăm của Masterdata.';

insert into public.product_price (internal_code, kenh, gia_vat, vat_pct, hieu_luc_tu, hieu_luc_den)
select v.ma, v.kenh, v.gia, (v.vat::numeric / 100), v.tu::date, v.den::date
from (values
('CTD50NG','NIEM_YET',19950000,8,'2026-07-29',null),('CTS10NB','NIEM_YET',30950000,8,'2026-07-29',null),
('CTS10NW','NIEM_YET',30950000,8,'2026-07-29',null),('CTS20NG','NIEM_YET',39950000,8,'2026-07-29',null),
('GASDEN','NIEM_YET',1200000,0,'2026-07-29',null),('GASDEN-G','NIEM_YET',600000,0,'2026-07-29',null),
('GEUS-00X05','NIEM_YET',1950000,8,'2026-07-29',null),('GEUS-00X06','NIEM_YET',1950000,8,'2026-07-29',null),
('GEUS-00X06-S','NIEM_YET',1950000,8,'2026-07-29',null),('GEUT-50B04-G','NIEM_YET',16950000,8,'2026-07-29',null),
('GPUN-4000XEN-G','NIEM_YET',16950000,8,'2026-07-29',null),('GT-NF50-G01G','NIEM_YET',2100000,8,'2026-07-29',null),
('GT-NF600-F01G','NIEM_YET',6650000,8,'2026-07-29',null),('GT-NF600-F02G','NIEM_YET',5950000,8,'2026-07-29',null),
('GT-NF800-F01G','NIEM_YET',8350000,8,'2026-07-29',null),('GT-PCF10-F02G','NIEM_YET',2050000,8,'2026-07-29',null),
('GT-PCF10-G01-G','NIEM_YET',1050000,8,'2026-07-29',null),('GT-PCF13-F01G','NIEM_YET',2050000,8,'2026-07-29',null),
('GTEC-15A01-G','NIEM_YET',90000000,8,'2026-07-29',null),('GTEC-15A01-LOI','NIEM_YET',14000000,8,'2026-07-29',null),
('GTEC-30A01-G','NIEM_YET',130000000,8,'2026-07-29',null),('GTEC-30A01-LOI','NIEM_YET',28000000,8,'2026-07-29',null),
('GTEF-15A01-G','NIEM_YET',80000000,8,'2026-07-29',null),('GTEF-15A01-LOI','NIEM_YET',10000000,8,'2026-07-29',null),
('GTEF-30A01-G','NIEM_YET',110000000,8,'2026-07-29',null),('GTEF-30A01-LOI','NIEM_YET',28000000,8,'2026-07-29',null),
('GTEP-00X00','NIEM_YET',4000000,8,'2026-07-29',null),('GTEP-50A01-G','NIEM_YET',20000000,8,'2026-07-29',null),
('GTEP-50A01-LOI','NIEM_YET',500000,8,'2026-07-29',null),('GTUN-5800EN-G','NIEM_YET',22950000,8,'2026-07-29',null),
('GTUN-8500XDS-G','NIEM_YET',32950000,8,'2026-07-29',null),('GTUN-8600HP-G','NIEM_YET',44950000,8,'2026-07-29',null),
('LX-CFNC-001-G','NIEM_YET',5000000,8,'2026-07-29',null),('LX-CFNC-002-G','NIEM_YET',5000000,8,'2026-07-29',null),
('LX-NF100-004-G','NIEM_YET',5000000,8,'2026-07-29',null),('LX-NF700-003-G','NIEM_YET',7500000,8,'2026-07-29',null),
('LX-PAC-001-G','NIEM_YET',1300000,8,'2026-07-29',null),('LX-PCF-005-G','NIEM_YET',2000000,8,'2026-07-29',null),
('LX-PCFB-002-G','NIEM_YET',2650000,8,'2026-07-29',null),('LX-PCFB-003-G','NIEM_YET',2750000,8,'2026-07-29',null),
('LX-PP-003-G','NIEM_YET',500000,8,'2026-07-29',null),('LX-PPF-003-G','NIEM_YET',2750000,8,'2026-07-29',null),
('MUOIAD','NIEM_YET',16500,0,'2026-07-29',null),('PKONG','NIEM_YET',2000000,8,'2026-08-21',null),
('TUBAOCHE','NIEM_YET',12500000,8,'2026-08-21',null),('VOISEN-LOILOC','NIEM_YET',595000,8,'2026-07-29',null),
('VOISEN-LOITHOM','NIEM_YET',595000,8,'2026-07-29',null),('WH15A','NIEM_YET',179950000,8,'2026-07-29',null),
('WH15AECO','NIEM_YET',119950000,8,'2026-07-29',null),('WH30A','NIEM_YET',249950000,8,'2026-07-29',null),
('WH30AECO','NIEM_YET',149950000,8,'2026-07-29',null)
) as v(ma, kenh, gia, vat, tu, den)
on conflict (internal_code, kenh, hieu_luc_tu) do update
   set gia_vat = excluded.gia_vat, vat_pct = excluded.vat_pct,
       hieu_luc_den = excluded.hieu_luc_den, synced_at = now();
