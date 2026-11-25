-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260822064931, name ma_kh_lam_khoa_ve_tinh).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 001522f55c006f73497fed8a7045648e.

alter table public.customer_contacts  add column if not exists ma_kh text;
alter table public.customer_addresses add column if not exists ma_kh text;

update public.customer_contacts c
   set ma_kh = k.ma_kh
  from public.cs_customers k
 where k.id = c.customer_id and c.ma_kh is null;

update public.customer_addresses a
   set ma_kh = k.ma_kh
  from public.cs_customers k
 where k.id = a.customer_id and a.ma_kh is null;

do $$
declare n_c int; n_a int;
begin
  select count(*) into n_c from public.customer_contacts  where ma_kh is null;
  select count(*) into n_a from public.customer_addresses where ma_kh is null;
  if n_c > 0 or n_a > 0 then
    raise exception 'Con % lien he va % dia chi chua co ma_kh — dung, dung siet NOT NULL khi chua du.', n_c, n_a;
  end if;
end $$;

alter table public.customer_contacts  alter column ma_kh set not null;
alter table public.customer_addresses alter column ma_kh set not null;

alter table public.customer_contacts  alter column customer_id drop not null;
alter table public.customer_addresses alter column customer_id drop not null;

create index if not exists ix_customer_contacts_ma_kh  on public.customer_contacts  (ma_kh);
create index if not exists ix_customer_addresses_ma_kh on public.customer_addresses (ma_kh);

comment on column public.customer_contacts.ma_kh is
  'KHOA CHINH THUC. Khong dat FK duoc vi customers.ma_kh khong unique (5 nguoi trung ho so, co y) — dong ve tinh hien tren ca hai ho so trung, dung vi cung mot nguoi.';
comment on column public.customer_contacts.customer_id is
  'DI SAN — chi co voi ho so CS. Doc bang ma_kh. Bo cot nay o chang B.';
comment on column public.customer_addresses.ma_kh is
  'KHOA CHINH THUC. Xem chu thich o customer_contacts.ma_kh.';
comment on column public.customer_addresses.customer_id is
  'DI SAN — chi co voi ho so CS. Doc bang ma_kh. Bo cot nay o chang B.';

create or replace function public.tu_cap_ma_kh()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_phone text;
  v_p9    text;
  v_ma    text;
begin
  if new.ma_kh is not null then
    return new;
  end if;

  v_phone := coalesce(to_jsonb(new) ->> 'primary_phone', to_jsonb(new) ->> 'phone', '');
  v_p9    := right(regexp_replace(v_phone, '\D', '', 'g'), 9);

  if length(v_p9) = 9 then
    if TG_TABLE_NAME = 'cs_customers' then
      select c.ma_kh into v_ma from public.customers c
       where c.ma_kh is not null
         and right(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), 9) = v_p9
       limit 1;
      if v_ma is not null and exists (select 1 from public.cs_customers k where k.ma_kh = v_ma) then
        v_ma := null;
      end if;
    else
      select k.ma_kh into v_ma from public.cs_customers k
       where k.ma_kh is not null
         and k.trang_thai <> 'da_xoa'
         and right(regexp_replace(coalesce(k.primary_phone, ''), '\D', '', 'g'), 9) = v_p9
       limit 1;
    end if;
  end if;

  new.ma_kh := coalesce(v_ma, cap_ma_kh(current_date));
  return new;
end $function$;

comment on function public.tu_cap_ma_kh() is
  'Cap ma_kh khi chen khach. TRA SDT sang bang ben kia truoc — cung mot nguoi o hai bang phai cung mot ma, neu khong du lieu ve tinh (SDT phu, dia chi phu) tach lam doi.';
