-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260822060218, name cs_dia_chi_phu_tinh_va_lien_he_ghi_chu).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 18b971856424c6bf1e79772713199ec0.

alter table public.customer_addresses add column if not exists tinh text;
alter table public.customer_contacts  add column if not exists ghi_chu text;

comment on column public.customer_addresses.tinh is
  'Tỉnh/TP của địa chỉ phụ — ô RIÊNG, không gõ lẫn vào ô địa chỉ (CEO chốt 22/08/2026, giống màn tạo khách).';
comment on column public.customer_contacts.ghi_chu is
  'Ghi chú cho SĐT phụ: giờ gọi được, số của ai… Có ở CẢ màn tạo lẫn màn sửa.';
