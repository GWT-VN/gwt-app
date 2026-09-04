-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260824084831, name ky_thuat_tinh).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 638673b579d294be7dccea3305b42cc7.

alter table ky_thuat
  add column if not exists tinh text;

comment on column ky_thuat.tinh is
  'Tỉnh/TP kỹ thuật phụ trách — dùng cho điều phối chuyến. Khác `vung` (bac/nam) vốn chỉ dùng để tính lịch tránh ngày nghỉ.';
