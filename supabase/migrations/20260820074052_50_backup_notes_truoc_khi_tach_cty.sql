-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260820074052, name 50_backup_notes_truoc_khi_tach_cty).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 4373f7df3d2eb7a56cf463679c5e357f.

-- Ảnh chụp `notes` TRƯỚC khi migration 50 gỡ tên công ty + MST ra cột riêng.
-- Đây là dữ liệu khách thật; giữ bản sao để lùi lại được nếu regex bóc sai.
create table if not exists _backup_50_notes as
select id, notes, now() as chup_luc
from cs_customers
where notes like '%nguồn DM_KHACH_CTY%';

revoke all on table _backup_50_notes from public, anon, authenticated;
grant select on table _backup_50_notes to service_role;

comment on table _backup_50_notes is
  'Bản sao cột notes trước migration 50 (tách thông tin công ty). Xoá được sau khi CEO xác nhận dữ liệu đúng.';
