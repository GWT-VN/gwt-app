-- ke_toan_03 — ke_toan_ky_list: so_canh_bao chỉ đếm chiều 'vao' (HĐ đầu vào cần phân loại).
-- Chiều 'ra' cố ý null code/engine_conf theo thiết kế lát 1 (không chạy engine phân loại cho
-- hàng bán ra) nên bản gốc (20260904040200) đang đếm lẫn cả 'ra' vào làm số cảnh báo bị phồng.
-- Cách lùi nếu hỏng: chạy lại định nghĩa ke_toan_ky_list trong 20260904040200_ke_toan_02_rpc.sql

create or replace function public.ke_toan_ky_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'ky' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', p.id, 'ky', p.ky, 'status', p.status, 'sent_at', p.sent_at, 'cap_nhat', p.updated_at,
      'so_dong_vao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'vao'),
      'so_dong_ra',  (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'ra'),
      'so_canh_bao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id
                        and l.direction = 'vao' and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro')))
    ) x
    from accounting.periods p
    where accounting.nv(p_email) is not null
  ) t;
$$;

revoke all on function public.ke_toan_ky_list(text) from public, anon, authenticated;
grant execute on function public.ke_toan_ky_list(text) to service_role;
