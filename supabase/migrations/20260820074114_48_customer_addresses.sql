-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260820074114, name 48_customer_addresses).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = b7b40b274712e3e26130e911d901b6a5.

create table if not exists customer_addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references cs_customers(id) on delete cascade,
  dia_chi     text not null,
  loai        text not null default 'khac',
  ghi_chu     text,
  created_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'customer_addresses_loai_check') then
    alter table customer_addresses
      add constraint customer_addresses_loai_check
      check (loai in ('nha', 'cty', 'lap_dat', 'khac'));
  end if;
end $$;

create index if not exists idx_customer_addresses_customer on customer_addresses(customer_id);

comment on table customer_addresses is
  'Địa chỉ THÊM của khách (nhà/công ty/lắp đặt). cs_customers.address vẫn là địa chỉ chính.';
comment on column customer_addresses.loai is 'nha | cty | lap_dat | khac';

revoke all on table customer_addresses from public, anon, authenticated;
grant select, insert, update, delete on table customer_addresses to service_role;
