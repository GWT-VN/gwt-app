-- cs — BÙ dòng máy cho ticket cũ + phân loại lại (09/11/2026)
-- Migration CHỈ TẠO HÀM, không chạy. Trên prod anh Dũng chạy:
--   select jsonb_pretty(cs_ticket_may_backfill(true));   -- 1) xem báo cáo, KHÔNG ghi
--   select jsonb_pretty(cs_ticket_may_backfill(false));  -- 2) ghi thật (chạy lại vô hại)
-- Chỉ THÊM dòng ticket_may và đổi loi_code của dòng hệ thống còn CHUA_PHAN_LOAI; không đụng bảng cũ.
--
-- ROLLBACK:
--   drop function if exists public.cs_ticket_may_backfill(boolean);
--   (dữ liệu đã bù: delete from public.ticket_may where nguon = 'backfill';  -- chỉ khi anh Dũng quyết gỡ)

create or replace function public.cs_ticket_may_backfill(p_chay_thu boolean default true) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_bao_cao jsonb;
begin
  with chua as (
    select t.ticket_code, t.serial,
           nullif(upper(btrim(t.source_serial)), '') as source_serial,
           coalesce(ib.internal_code, sr.internal_code) as internal_code,
           cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), coalesce(ib.internal_code, sr.internal_code)) as loi_code
      from tickets t
      left join installed_base ib on ib.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
      left join serial_registry sr on sr.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
     where not exists (select 1 from ticket_may m where m.ticket_code = t.ticket_code)
  ), lai as (
    select m.id, cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), m.internal_code) as loi_moi
      from ticket_may m join tickets t on t.ticket_code = m.ticket_code
     where m.nguon in ('tu_dong', 'backfill') and m.loi_code = 'CHUA_PHAN_LOAI'
  )
  select jsonb_build_object(
    'chay_thu', p_chay_thu,
    'so_ticket_chua_co_dong', (select count(*) from chua),
    'se_tao_theo_loi', coalesce((select jsonb_object_agg(loi_code, n) from (select loi_code, count(*) n from chua group by 1) x), '{}'),
    'se_tao_chua_phan_loai', (select count(*) from chua where loi_code = 'CHUA_PHAN_LOAI'),
    'phan_loai_lai', (select count(*) from lai where loi_moi <> 'CHUA_PHAN_LOAI'),
    'phan_loai_lai_theo_loi', coalesce((select jsonb_object_agg(loi_moi, n) from (select loi_moi, count(*) n from lai where loi_moi <> 'CHUA_PHAN_LOAI' group by 1) y), '{}'),
    'mau_chua_phan_loai', coalesce((select jsonb_agg(ticket_code) from (select ticket_code from chua where loi_code = 'CHUA_PHAN_LOAI' order by ticket_code limit 30) z), '[]')
  ) into v_bao_cao;

  if not p_chay_thu then
    insert into ticket_may (ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, nguon, tao_boi, created_at)
    select t.ticket_code, 1, t.serial, nullif(upper(btrim(t.source_serial)), ''),
           coalesce(ib.internal_code, sr.internal_code),
           cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), coalesce(ib.internal_code, sr.internal_code)),
           t.description, 'backfill', 'cs_ticket_may_backfill', t.created_at
      from tickets t
      left join installed_base ib on ib.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
      left join serial_registry sr on sr.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
     where not exists (select 1 from ticket_may m where m.ticket_code = t.ticket_code);

    update ticket_may m
       set loi_code = l.loi_moi
      from (select m2.id, cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), m2.internal_code) as loi_moi
              from ticket_may m2 join tickets t on t.ticket_code = m2.ticket_code
             where m2.nguon in ('tu_dong', 'backfill') and m2.loi_code = 'CHUA_PHAN_LOAI') l
     where m.id = l.id and l.loi_moi <> 'CHUA_PHAN_LOAI';
  end if;
  return v_bao_cao;
end $$;

revoke all on function public.cs_ticket_may_backfill(boolean) from public, anon, authenticated;
grant execute on function public.cs_ticket_may_backfill(boolean) to service_role;
