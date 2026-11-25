-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260824085156, name ky_thuat_tinh_backfill).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = d37ffef67f01683f05b0ee4fd43774f7.

update ky_thuat
   set tinh = trim(vung)
 where tinh is null
   and vung is not null
   and lower(trim(vung)) not in ('bac', 'nam', 'bắc', 'nam bộ');
