-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831070921, name sales_tu_dien_kenh_khach_dinh_ky).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 8ff73b7fac2585a3c55fb8fa8449bd9a
-- (md5 tính trên NỘI DUNG GỐC, tức statement `select cron.schedule(...)` KHÔNG bọc guard).
-- Guard thêm 04/09: local/CI không cài extension pg_cron (xem 19990101000000_extensions.sql),
-- nên statement cron.schedule gốc bọc trong `do $guard$ if exists(pg_extension pg_cron)…` —
-- cùng khuôn đã dùng ở work_03b (fix round 1). Không đổi logic hàm sales_dien_kenh_khach().

-- VÁ TẬN GỐC: kenh cua khach bi XOA SACH moi lan Apps Script danh so lai ma khach.
--
-- Da xay ra BA lan trong ngay 24-28/08: khach duoc chen duoi MA MOI, ma channel_id la cot
-- cua APP (khong nam trong payload cua Apps Script) nen dong moi sinh ra trong tron.
-- Khong co loi nao bao ra — chi la bo tu-bat-gia im lang ngung ap khuyen mai.
--
-- Chay tay moi lan sync la se quen. Dat thanh ham + cron 15 phut, tu lanh.
-- Luat: kenh cua khach = kenh cua DON DAU TIEN (CEO chot 28/08/2026).

create or replace function public.sales_dien_kenh_khach()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_so integer;
begin
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
  ),
  chot as (
    select a.customer_code, d.id
    from dau a
    join dim_channel d
      on upper(trim(d.channel_l1)) = upper(trim(a.l1))
     and upper(trim(coalesce(d.channel_l2,''))) = upper(trim(a.l2))
  )
  update customers c set channel_id = k.id
    from chot k
   where c.customer_code = k.customer_code and c.channel_id is null;
  get diagnostics v_so = row_count;
  return v_so;
end $$;

comment on function public.sales_dien_kenh_khach() is
  'Dien lai customers.channel_id sau moi lan Apps Script danh so lai ma khach. Khop DU HAI CAP voi dim_channel, bo phan biet hoa/thuong. Chi dien o dang TRONG — khong bao gio de len lua chon tay cua CEO.';

do $guard$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('sales-dien-kenh-khach', '*/15 * * * *',
                          $$select public.sales_dien_kenh_khach()$$);
  end if;
end $guard$;
