-- cs — view cho báo cáo tần suất lỗi (09/11/2026). Chỉ đọc, không cột PII.
-- security_invoker = true: RLS của bảng gốc áp dụng theo người gọi.
-- ROLLBACK:
--   drop view if exists public.v_loi_so_nhap;
--   drop view if exists public.v_loi_so_ban;
--   drop view if exists public.v_loi_ca;

create or replace view public.v_loi_ca with (security_invoker = true) as
select m.id, m.ticket_code, m.loi_code, d.ten as loi_ten, d.nhom, g.ten as nhom_ten,
       coalesce(m.internal_code, '(chưa rõ)') as internal_code,
       coalesce(m.serial, m.source_serial) as may,
       (t.created_at at time zone 'Asia/Ho_Chi_Minh')::date as ngay_bao,
       to_char(t.created_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM') as thang,
       ib.install_date, t.state, m.trang_thai
  from public.ticket_may m
  join public.tickets t on t.ticket_code = m.ticket_code
  join public.loi_danh_muc d on d.code = m.loi_code
  left join public.issue_group g on g.code = d.nhom
  left join public.installed_base ib on ib.serial = m.serial;

-- Máy BÁN theo mã nội bộ × tháng đặt (bỏ dòng huỷ/hoàn; mã combo không tách).
create or replace view public.v_loi_so_ban with (security_invoker = true) as
select internal_code, to_char(order_date, 'YYYY-MM') as thang, sum(coalesce(quantity, 0))::numeric as so_ban
  from public.sales_order_lines
 where internal_code is not null and order_date is not null
   and btrim(normalize(coalesce(fulfillment_status, ''), NFC)) <> all (array['Huỷ', 'Hủy', 'Hoàn hàng'])
 group by 1, 2;

-- Máy NHẬP (serial nạp theo PO) theo mã × tháng nạp.
create or replace view public.v_loi_so_nhap with (security_invoker = true) as
select internal_code, to_char(coalesce(imported_at, created_at) at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM') as thang, count(*)::int as so_nhap
  from public.serial_registry
 where internal_code is not null
 group by 1, 2;

revoke all on public.v_loi_ca, public.v_loi_so_ban, public.v_loi_so_nhap from anon;
grant select on public.v_loi_ca, public.v_loi_so_ban, public.v_loi_so_nhap to authenticated, service_role;
