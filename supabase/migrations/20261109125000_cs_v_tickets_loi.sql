-- cs — view v_tickets_loi: v_tickets + mảng mã lỗi của các dòng máy (Task 10 fix round 1, 09/11/2026)
-- Mục đích: lọc ticket theo loại lỗi NGAY TRONG DB (loi_codes @> '{MÃ}'), không gửi danh sách mã
-- dài lên URL PostgREST và không bị cắt max-rows. Thuần cộng thêm, SECURITY INVOKER (RLS của người gọi).
--
-- ROLLBACK:
--   drop view if exists public.v_tickets_loi;

create or replace view public.v_tickets_loi with (security_invoker = true) as
select v.*,
       coalesce((select array_agg(distinct m.loi_code order by m.loi_code)
                   from public.ticket_may m where m.ticket_code = v.ticket_code), '{}'::text[]) as loi_codes
  from public.v_tickets v;

revoke all on table public.v_tickets_loi from anon;
grant select on table public.v_tickets_loi to authenticated, service_role;
