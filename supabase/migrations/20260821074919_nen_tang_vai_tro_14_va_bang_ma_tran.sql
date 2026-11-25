-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260821074919, name nen_tang_vai_tro_14_va_bang_ma_tran).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = df0198fee4cd4c6084a3bd77369d3c37.

-- Gộp phần DDL của 3 migration nền tảng đầu:
--   20260820000000_cs_vai_tro_toan_cong_ty  (nới chk_vai_tro lên 13)
--   20260820010000_cs_ma_tran_quyen         (tạo bảng quyen_vai_tro)
--   20260820020000_cs_vai_tro_quan_tri_ht   (nới lên 14, thêm quan_tri_ht)
-- Phần SEED của hai file đầu CỐ TÌNH bỏ: chính chúng bị file 20260820050000 xoá
-- sạch rồi ghi lại. Trạng thái cuối vẫn y hệt và sẽ được đối chiếu với MAC_DINH
-- trong code sau khi áp xong.

alter table public.staff drop constraint if exists chk_vai_tro;
alter table public.staff add constraint chk_vai_tro
  check (vai_tro <@ '{
    ceo, admin, quan_tri_ht,
    kt_giam_doc, ky_thuat, ctv_lap_dat,
    cs_manager, cs,
    sales_manager, sales,
    marketing, kho, ke_toan, tai_chinh
  }'::text[]);

create table if not exists public.quyen_vai_tro (
  vai_tro  text not null,
  ma_quyen text not null,
  primary key (vai_tro, ma_quyen)
);

comment on table public.quyen_vai_tro is
  'Ma trận phân quyền vai trò x quyền. Danh sách mã quyền nằm ở apps/web/lib/nen-tang/quyen.ts, KHÔNG tự thêm mã ở đây.';

alter table public.quyen_vai_tro enable row level security;
