-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260820074129, name 50_thong_tin_cong_ty).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 6dc681ccecbba37d28c2ca2bacd000df.

alter table cs_customers
  add column if not exists ten_cty    text,
  add column if not exists mst        text,
  add column if not exists dia_chi_cty text,
  add column if not exists sdt_cty    text,
  add column if not exists email_cty  text;

comment on column cs_customers.ten_cty     is 'Tên công ty trên hoá đơn/hợp đồng.';
comment on column cs_customers.mst         is 'Mã số thuế — chuỗi, KHÔNG phải số: có mã 13 ký tự dạng 0123456789-001.';
comment on column cs_customers.dia_chi_cty is 'Địa chỉ đăng ký thuế của công ty (khác địa chỉ nhà ở cột address).';
comment on column cs_customers.sdt_cty     is 'SĐT công ty.';
comment on column cs_customers.email_cty   is 'Email công ty — nhận hoá đơn điện tử.';

create index if not exists idx_cs_customers_mst on cs_customers(mst) where mst is not null;

update cs_customers set
  ten_cty = nullif(btrim(substring(notes from 'Công ty:\s*([^·]+)')), ''),
  mst     = nullif(btrim(substring(notes from 'MST:\s*([0-9][0-9-]*)')), '')
where notes like '%nguồn DM_KHACH_CTY%'
  and ten_cty is null;

update cs_customers set
  notes = nullif(
            trim(both e' ·\n' from
              regexp_replace(
                notes,
                'Công ty:[^·]*(·\s*MST:[^·]*)?(·\s*nguồn DM_KHACH_CTY)?',
                '', 'g')), '')
where notes like '%nguồn DM_KHACH_CTY%'
  and ten_cty is not null;
