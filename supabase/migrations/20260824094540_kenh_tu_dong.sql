-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260824094540, name kenh_tu_dong).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = a2becc055ea0d8cbc4c06252894e0dc9.

alter table cs_customers
  add column if not exists channel_tu_dong boolean not null default false;

comment on column cs_customers.channel_tu_dong is
  'true = kênh do máy điền từ dữ liệu Sales (mig 54), CEO cần soát lại. Người sửa tay là hạ về false.';

update cs_customers cs
   set channel_id = t.channel_id, channel_tu_dong = true, updated_at = now()
  from (
    select cs2.id, min(sa.channel_id) as channel_id
      from cs_customers cs2
      join customers sa on sa.customer_code = cs2.customer_code
     where cs2.trang_thai <> 'da_xoa' and cs2.channel_id is null and sa.channel_id is not null
     group by cs2.id
    having count(distinct sa.channel_id) = 1
  ) t
 where t.id = cs.id;

update cs_customers cs
   set channel_id = t.channel_id, channel_tu_dong = true, updated_at = now()
  from (
    select cs2.id, min(sa.channel_id) as channel_id
      from cs_customers cs2
      join customers sa
        on sa.phone_no0 = right(regexp_replace(cs2.primary_phone, '\D', '', 'g'), 9)
     where cs2.trang_thai <> 'da_xoa' and cs2.channel_id is null
       and cs2.customer_code is null and cs2.primary_phone is not null
       and sa.channel_id is not null
     group by cs2.id
    having count(distinct sa.channel_id) = 1
  ) t
 where t.id = cs.id;
