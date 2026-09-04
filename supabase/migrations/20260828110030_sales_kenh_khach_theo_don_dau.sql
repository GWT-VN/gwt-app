-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260828110030, name sales_kenh_khach_theo_don_dau).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 857efcbc9ef502ba1ed04f5d5c498c43.

-- CEO chot 28/08/2026: kenh cua khach lay theo kenh cua DON DAU TIEN
-- (khong phai don moi nhat nhu Sales de xuat). Kenh cua tung DON giu nguyen.
--
-- Phan 1: 12 khach mua qua nhieu kenh -> lay kenh cua don dau tien.
with kd as (
  select p.customer_code, l.channel l1,
         coalesce(nullif(trim(coalesce(l.channel_detail,'')),''),'') l2,
         l.order_date, l.order_code
  from customer_purchases p
  join sales_order_lines l on l.order_code = p.order_code
  where coalesce(l.channel,'') <> '' and coalesce(p.customer_code,'') <> ''
),
dau as (
  select distinct on (customer_code) customer_code, l1, l2
  from kd order by customer_code, order_date asc nulls last, order_code asc
)
update public.customers c
   set channel_id = d.id
  from dau a
  join dim_channel d
    on upper(trim(d.channel_l1)) = upper(trim(a.l1))
   and upper(trim(coalesce(d.channel_l2,''))) = upper(trim(a.l2))
 where c.customer_code = a.customer_code
   and c.channel_id is null
   -- Hai ca CEO chot rieng, xu ly o phan 2:
   and c.customer_code not in ('KH00076','KH00145');
