-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260819113408, name 45_maintenance_plan_source_folder_nullable).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = af18f3995ced1a25213d7c49590dccf4.

alter table maintenance_plan alter column source_folder drop not null;

comment on column maintenance_plan.source_folder is
  'Tên thư mục Drive của đợt import hợp đồng bảo trì cũ. NULL = plan tạo thẳng trên app CSKH.';
