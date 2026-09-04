-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260820104607, name 54_hang_cho_duyet_nhan_loai_gop).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = e0ac05d3e70fab676e4df43130b53705.

alter table yeu_cau_thay_doi drop constraint if exists yeu_cau_thay_doi_loai_check;

alter table yeu_cau_thay_doi
  add constraint yeu_cau_thay_doi_loai_check
  check (loai in ('sua', 'xoa', 'doi_serial', 'gop'));
