-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260822004529, name ma_khach_moi_kh_yymm).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 258189044d277a111e5cf48de1e41acd.

alter table public.cs_customers add column if not exists ma_kh text;
alter table public.customers    add column if not exists ma_kh text;

comment on column public.cs_customers.ma_kh is
  'Mã khách KH-YYMM-NNNN (hệ mã mới, CEO chốt 21/08/2026). Chỉ để đọc/gọi tên; KHOÁ NỐI hai khu là SĐT. Khác customer_code (mã cũ Apps Script, dùng nối customer_purchases).';
comment on column public.customers.ma_kh is
  'Mã khách KH-YYMM-NNNN (hệ mã mới, CEO chốt 21/08/2026). Cùng một người ở hai bảng thì mang CÙNG mã này (khớp theo 9 số cuối SĐT).';

create or replace function public.cap_ma_kh(p_ngay date default current_date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := 'KH-' || to_char(p_ngay, 'YYMM') || '-';
  v_stt    int;
begin
  perform pg_advisory_xact_lock(hashtext('cap_ma_kh'));
  select coalesce(max(nullif(regexp_replace(ma_kh, '^.*-', ''), '')::int), 0) + 1
    into v_stt
    from (
      select ma_kh from cs_customers where ma_kh like v_prefix || '%'
      union all
      select ma_kh from customers    where ma_kh like v_prefix || '%'
    ) t;
  return v_prefix || lpad(v_stt::text, 4, '0');
end $$;

comment on function public.cap_ma_kh(date) is
  'Cấp mã khách mới KH-YYMM-NNNN. Cả CSKH lẫn Sales gọi chung hàm này — một nguồn phát số duy nhất thì hai khu tạo khách cùng lúc cũng không đụng mã.';

do $$
declare
  r record;
  v_ma text;
begin
  for r in
    with nguoi as (
      select
        nullif(right(regexp_replace(coalesce(primary_phone,''), '\D', '', 'g'), 9), '') as cuoi9,
        'cs'::text as ben, id::text as khoa,
        coalesce(created_at::date, current_date) as ngay_vao
      from cs_customers where ma_kh is null
      union all
      select
        nullif(right(regexp_replace(coalesce(phone,''), '\D', '', 'g'), 9), ''),
        'sales', customer_code,
        coalesce(first_order_date::date, synced_at::date, current_date)
      from customers where ma_kh is null
    ),
    nhom as (
      select coalesce(cuoi9, ben || ':' || khoa) as nhom_khoa,
             min(ngay_vao) as ngay_vao
        from nguoi group by 1
    )
    select nhom_khoa, ngay_vao from nhom order by ngay_vao, nhom_khoa
  loop
    v_ma := cap_ma_kh(r.ngay_vao);

    update cs_customers set ma_kh = v_ma
     where ma_kh is null
       and coalesce(
             nullif(right(regexp_replace(coalesce(primary_phone,''), '\D','','g'), 9), ''),
             'cs:' || id::text
           ) = r.nhom_khoa;

    update customers set ma_kh = v_ma
     where ma_kh is null
       and coalesce(
             nullif(right(regexp_replace(coalesce(phone,''), '\D','','g'), 9), ''),
             'sales:' || customer_code
           ) = r.nhom_khoa;
  end loop;
end $$;

create unique index if not exists uq_cs_customers_ma_kh on public.cs_customers (ma_kh) where ma_kh is not null;
create        index if not exists ix_customers_ma_kh    on public.customers    (ma_kh) where ma_kh is not null;

create or replace function public.tu_cap_ma_kh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.ma_kh is null then
    new.ma_kh := cap_ma_kh(current_date);
  end if;
  return new;
end $$;

comment on function public.tu_cap_ma_kh() is
  'Trigger BEFORE INSERT: khách mới chưa có ma_kh thì tự cấp. Bịt lỗ khách vào qua sync Google Sheet (Apps Script không biết cột này) hoặc qua import tay.';

drop trigger if exists trg_tu_cap_ma_kh on public.cs_customers;
create trigger trg_tu_cap_ma_kh before insert on public.cs_customers
  for each row execute function public.tu_cap_ma_kh();

drop trigger if exists trg_tu_cap_ma_kh on public.customers;
create trigger trg_tu_cap_ma_kh before insert on public.customers
  for each row execute function public.tu_cap_ma_kh();
