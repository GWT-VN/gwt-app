-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260820044216, name 47_ngay_lap_khong_ro).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 422b18cd1011cc46b9851d67c1886771.

alter table installed_base
  add column if not exists ngay_lap_do_chac text not null default 'chinh_xac',
  add column if not exists ghi_chu text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'installed_base_ngay_lap_do_chac_check'
  ) then
    alter table installed_base
      add constraint installed_base_ngay_lap_do_chac_check
      check (ngay_lap_do_chac in ('chinh_xac', 'uoc_luong', 'khong_ro'));
  end if;
end $$;

comment on column installed_base.ngay_lap_do_chac is
  'Ngày lắp đáng tin tới đâu: chinh_xac | uoc_luong | khong_ro. Hạn bảo hành vẫn tính từ install_date, cột này chỉ để cảnh báo người đọc.';
comment on column installed_base.ghi_chu is
  'Ghi chú tự do về máy — chủ yếu cho ca không rõ ngày lắp.';

create or replace view v_installed_base as
 SELECT ib.serial,
    ib.internal_code,
    COALESCE(ci."Tên ngắn gọn (đề xuất)", ib.model_freetext) AS product_name,
    ci."Danh mục cấp 1" AS category_l1,
    ci."Danh mục cấp 2" AS category_l2,
    ib.source_product_code,
    ib.customer_id,
    c.full_name AS customer_name,
    c.primary_phone,
    c.needs_phone,
    ib.parent_serial,
    ib.install_date,
    ib.install_address,
    ib.status,
    COALESCE(
        CASE
            WHEN w.id IS NOT NULL THEN w.activated
            ELSE wp.activated
        END, false) AS warranty_activated,
        CASE
            WHEN w.id IS NOT NULL THEN w.start_date
            ELSE wp.start_date
        END AS warranty_start,
        CASE
            WHEN w.id IS NOT NULL THEN w.full_end
            ELSE wp.full_end
        END AS warranty_full_end,
        CASE
            WHEN w.id IS NOT NULL THEN w.core_end
            ELSE wp.core_end
        END AS warranty_core_end,
        CASE
            WHEN
            CASE
                WHEN w.id IS NOT NULL THEN w.full_end
                ELSE wp.full_end
            END IS NULL THEN NULL::boolean
            ELSE
            CASE
                WHEN w.id IS NOT NULL THEN w.full_end
                ELSE wp.full_end
            END >= CURRENT_DATE
        END AS con_han_may,
        CASE
            WHEN
            CASE
                WHEN w.id IS NOT NULL THEN w.core_end
                ELSE wp.core_end
            END IS NULL THEN NULL::boolean
            ELSE
            CASE
                WHEN w.id IS NOT NULL THEN w.core_end
                ELSE wp.core_end
            END >= CURRENT_DATE
        END AS con_han_loi,
    pw.internal_code IS NOT NULL AS co_chinh_sach_bh,
    w.id IS NULL AND wp.id IS NOT NULL AS bh_theo_me,
    c.ten_kd,
    c.dia_chi_kd,
    ib.ngay_lap_do_chac,
    ib.ghi_chu
   FROM installed_base ib
     LEFT JOIN catalog_item ci ON ci."Mã nội bộ" = ib.internal_code
     LEFT JOIN cs_customers c ON c.id = ib.customer_id
     LEFT JOIN warranty w ON w.serial = ib.serial
     LEFT JOIN warranty wp ON wp.serial = ib.parent_serial
     LEFT JOIN product_warranty pw ON pw.internal_code = ib.internal_code;
