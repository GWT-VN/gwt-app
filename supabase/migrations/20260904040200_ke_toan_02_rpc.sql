-- ke_toan_02_rpc — cửa duy nhất vào schema accounting (không expose). Khuôn: db/work/migrations/work_01_rpc_gd0.sql
-- Cách lùi nếu hỏng: drop function các hàm public.ke_toan_* và accounting.nv.

create or replace function accounting.nv(p_email text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid; v_roles text[];
begin
  select s.id, s.vai_tro into v_id, v_roles
    from public.staff s where s.email = lower(btrim(p_email)) and s.hoat_dong limit 1;
  if v_id is null or not (v_roles && array['admin','ke_toan','tai_chinh','ceo']) then
    raise exception 'Không có quyền khu Kế toán' using errcode = '42501';
  end if;
  return v_id;
end $$;

create or replace function public.ke_toan_ky_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'ky' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', p.id, 'ky', p.ky, 'status', p.status, 'sent_at', p.sent_at, 'cap_nhat', p.updated_at,
      'so_dong_vao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'vao'),
      'so_dong_ra',  (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'ra'),
      'so_canh_bao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro')))
    ) x
    from accounting.periods p
    where accounting.nv(p_email) is not null
  ) t;
$$;

create or replace function public.ke_toan_ky_tao(p_email text, p_ky text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  if p_ky !~ '^\d{4}-(0[1-9]|1[0-2])$' then raise exception 'Kỳ phải dạng YYYY-MM'; end if;
  insert into accounting.periods (ky, created_by) values (p_ky, v_nv)
    on conflict (ky) do update set updated_at = accounting.periods.updated_at
    returning id into v_id;
  return jsonb_build_object('id', v_id, 'ky', p_ky);
end $$;

create or replace function public.ke_toan_nguon_them(p_email text, p_period_id bigint, p_kind text, p_file_name text,
                                                    p_storage_path text, p_headers jsonb, p_row_count int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  insert into accounting.sources (period_id, kind, file_name, storage_path, headers, row_count, uploaded_by)
  values (p_period_id, p_kind, p_file_name, p_storage_path, coalesce(p_headers, '{}'::jsonb), coalesce(p_row_count, 0), v_nv)
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function public.ke_toan_nguon_list(p_email text, p_period_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'kind', s.kind, 'file_name', s.file_name, 'headers', s.headers,
           'row_count', s.row_count, 'uploaded_at', s.uploaded_at) order by s.id), '[]'::jsonb)
  from accounting.sources s where accounting.nv(p_email) is not null and s.period_id = p_period_id;
$$;

create or replace function public.ke_toan_dong_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0; v_tong int;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  v_tong := jsonb_array_length(p_rows);
  create temp table tmp_dong on commit drop as
    select * from jsonb_populate_recordset(null::accounting.invoice_lines, p_rows);
  update tmp_dong set period_id = p_period_id, first_source_id = p_source_id, last_source_id = p_source_id;

  with up as (
    update accounting.invoice_lines l
       set raw = t.raw, last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t
     where l.period_id = p_period_id and l.line_key = t.line_key
     returning l.id)
  select count(*) into v_upd from up;

  with ins as (
    insert into accounting.invoice_lines (period_id, direction, line_key, row_order, ky_hieu, so_hd, ngay_lap, mccqt,
      ten_ban, mst_ban, ten_mua, mst_mua, ten_hang, dvt, so_luong, don_gia, thue_suat, thanh_tien, tien_thue, tong_thanh_toan,
      trang_thai, tinh_chat, raw, first_source_id, last_source_id,
      engine_code, engine_conf, engine_reason, engine_kind, code, code_name, tk_no, tk_co, vat_1331,
      customer_code, product_group, channel_l1, channel_l2, dealer_name)
    select p_period_id, direction, line_key, row_order, ky_hieu, so_hd, ngay_lap, mccqt,
      ten_ban, mst_ban, ten_mua, mst_mua, ten_hang, dvt, so_luong, don_gia, thue_suat, thanh_tien, tien_thue, tong_thanh_toan,
      trang_thai, tinh_chat, raw, p_source_id, p_source_id,
      engine_code, engine_conf, engine_reason, engine_kind, code, code_name, tk_no, tk_co, vat_1331,
      customer_code, product_group, channel_l1, channel_l2, dealer_name
    from tmp_dong t
    where not exists (select 1 from accounting.invoice_lines l where l.period_id = p_period_id and l.line_key = t.line_key)
    returning id)
  select count(*) into v_ins from ins;

  return jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'kept', v_tong - v_ins - v_upd);
end $$;

create or replace function public.ke_toan_dong_list(p_email text, p_period_id bigint, p_direction text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(l) order by l.row_order), '[]'::jsonb)
  from accounting.invoice_lines l
  where accounting.nv(p_email) is not null and l.period_id = p_period_id and l.direction = p_direction;
$$;

create or replace function public.ke_toan_luat_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'kind', r.kind, 'pattern', r.pattern, 'target_code', r.target_code,
           'condition', r.condition, 'priority', r.priority, 'origin', r.origin, 'active', r.active) order by r.kind, r.origin, r.priority), '[]'::jsonb)
  from accounting.rules r where accounting.nv(p_email) is not null and r.active;
$$;

-- Khoá cửa: chỉ service_role (app server sau chanKeToan) gọi được
do $$
declare f text;
begin
  foreach f in array array['ke_toan_ky_list(text)','ke_toan_ky_tao(text,text)',
      'ke_toan_nguon_them(text,bigint,text,text,text,jsonb,int)','ke_toan_nguon_list(text,bigint)',
      'ke_toan_dong_nhap(text,bigint,bigint,jsonb)',
      'ke_toan_dong_list(text,bigint,text)','ke_toan_luat_list(text)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated;', f);
    execute format('grant execute on function public.%s to service_role;', f);
  end loop;
  revoke all on function accounting.nv(text) from public, anon, authenticated;
  grant execute on function accounting.nv(text) to service_role;
end $$;
