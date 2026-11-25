-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260824120746, name noi_lai_ma_khach_sau_danh_so_lai_20260824).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 9591d81685be2316216cabf2bb268611.

-- Noi lai ma khach sau khi nut "Dung lai DM_KHACH" danh so lai toan bo (KH00001-KH00398).
-- CEO chot 24/08/2026: CHI NOI LAI, CHUA XOA 428 dong ma cu (giu lam luoi an toan).
--
-- Bang remap duoi day vua la NHAT KY vua la duong LUI: muon tra lai thi update nguoc
-- tu chinh no. Dat ten theo dung quy uoc cua bang cu cs_customer_code_remap_20260812.
--
-- Luu y: cs_customers.id la UUID (khong phai bigint) — de kieu text cho bang remap
-- dung duoc cho ca bang khac neu sau nay can.

create table if not exists public.cs_customer_code_remap_20260824 (
  ho_so_id    text,
  bang        text not null,
  ma_cu       text not null,
  ma_moi      text not null,
  sdt9        text,
  tao_luc     timestamptz not null default now()
);

-- Chot mapping MOT LAN vao bang, roi update TU bang do. Neu tinh mapping ngay trong
-- cau update thi moi cau tinh lai mot lan va co the ra khac nhau giua cac buoc.
insert into public.cs_customer_code_remap_20260824 (ho_so_id, bang, ma_cu, ma_moi, sdt9)
select c.id::text, 'cs_customers', c.customer_code, m.customer_code, m.sdt9
from public.cs_customers c
join (
  select customer_code, right(regexp_replace(coalesce(phone,''),'\D','','g'),9) as sdt9
  from public.customers
  where customer_code ~ '^KH00[0-3][0-9][0-9]$' and coalesce(phone,'') <> ''
) m on m.sdt9 = right(regexp_replace(coalesce(c.primary_phone,''),'\D','','g'),9)
where c.customer_code is not null
  and c.customer_code !~ '^KH00[0-3][0-9][0-9]$'
  and not exists (select 1 from public.cs_customer_code_remap_20260824 r
                  where r.bang = 'cs_customers' and r.ho_so_id = c.id::text);

update public.cs_customers c
set customer_code = r.ma_moi
from public.cs_customer_code_remap_20260824 r
where r.bang = 'cs_customers' and r.ho_so_id = c.id::text and c.customer_code = r.ma_cu;

-- Don tao tren app: it dong, noi theo cung mapping SDT.
insert into public.cs_customer_code_remap_20260824 (ho_so_id, bang, ma_cu, ma_moi, sdt9)
select o.order_id::text, 'sales_orders', o.customer_code, m.customer_code, m.sdt9
from public.sales_orders o
join public.customers cu on cu.customer_code = o.customer_code
join (
  select customer_code, right(regexp_replace(coalesce(phone,''),'\D','','g'),9) as sdt9
  from public.customers
  where customer_code ~ '^KH00[0-3][0-9][0-9]$' and coalesce(phone,'') <> ''
) m on m.sdt9 = right(regexp_replace(coalesce(cu.phone,''),'\D','','g'),9)
where o.customer_code is not null and o.customer_code !~ '^KH00[0-3][0-9][0-9]$';

update public.sales_orders o
set customer_code = r.ma_moi
from public.cs_customer_code_remap_20260824 r
where r.bang = 'sales_orders' and r.ho_so_id = o.order_id::text and o.customer_code = r.ma_cu;

update public.sales_ctkm_khach k
set customer_code = m.customer_code
from public.customers cu,
     (select customer_code, right(regexp_replace(coalesce(phone,''),'\D','','g'),9) as sdt9
      from public.customers
      where customer_code ~ '^KH00[0-3][0-9][0-9]$' and coalesce(phone,'') <> '') m
where cu.customer_code = k.customer_code
  and k.customer_code !~ '^KH00[0-3][0-9][0-9]$'
  and m.sdt9 = right(regexp_replace(coalesce(cu.phone,''),'\D','','g'),9);

comment on table public.cs_customer_code_remap_20260824 is
  'Nhat ky + duong lui cho dot noi lai ma khach 24/08/2026, sau khi nut "Dung lai DM_KHACH" danh so lai toan bo tu KH00001. Muon tra lai: update nguoc tu bang nay. 428 dong ma cu trong customers CHUA XOA (CEO chot giu lam luoi an toan).';
