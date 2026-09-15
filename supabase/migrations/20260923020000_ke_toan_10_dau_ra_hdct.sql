-- ke_toan_10_dau_ra_hdct — lát 3+4: dong_list kèm loại nguồn đầu; dong_nhap v3 nối đuôi row_order cho nguồn ≠ nexia và không ghi đè raw của dòng NEXIA.
-- Cách lùi nếu hỏng: chạy lại thân ke_toan_dong_nhap của migration 07 và ke_toan_dong_list của migration 02.
-- Kiểm: accounting.sources.kind check constraint (migration 00) đã gồm hdct_vao|hdct_ra|hdtq_vao|hdtq_ra → không cần đổi ở đây.

create or replace function public.ke_toan_dong_list(p_email text, p_period_id bigint, p_direction text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg((to_jsonb(l) || jsonb_build_object('first_source_kind', s.kind)) order by l.row_order), '[]'::jsonb)
  from accounting.invoice_lines l left join accounting.sources s on s.id = l.first_source_id
  where accounting.nv(p_email) is not null and l.period_id = p_period_id and l.direction = p_direction;
$$;

create or replace function public.ke_toan_dong_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0; v_tong int; v_kind text; v_max int;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  v_tong := jsonb_array_length(p_rows);
  select kind into v_kind from accounting.sources where id = p_source_id;
  create temp table tmp_dong on commit drop as
    select * from jsonb_populate_recordset(null::accounting.invoice_lines,
      (select coalesce(jsonb_agg((e - 'period_id' - 'first_source_id' - 'last_source_id')
         || jsonb_build_object('period_id', p_period_id, 'first_source_id', p_source_id, 'last_source_id', p_source_id)), '[]'::jsonb)
       from jsonb_array_elements(p_rows) e));
  delete from tmp_dong a using tmp_dong b where a.line_key = b.line_key and a.row_order > b.row_order;

  if v_kind = 'nexia' then
    with up as (update accounting.invoice_lines l set raw = t.raw, row_order = t.row_order, last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t where l.period_id = p_period_id and l.line_key = t.line_key returning l.id)
    select count(*) into v_upd from up;
  else
    -- Nguồn bổ sung không đụng dòng của kind khác — NEXIA là bản gốc; chỉ HDCT tải lại HDCT mới cập
    -- nhật (R16). Dòng trùng khoá nhưng nguồn cuối đang là kind khác (vd NEXIA) → bỏ qua, rơi vào
    -- kept; dòng mới vẫn xếp sau cùng theo hướng như cũ.
    with up as (update accounting.invoice_lines l set last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t where l.period_id = p_period_id and l.line_key = t.line_key
        and exists (select 1 from accounting.sources o where o.id = l.last_source_id and o.kind = v_kind)
      returning l.id)
    select count(*) into v_upd from up;
    select coalesce(max(l.row_order), 0) into v_max from accounting.invoice_lines l
      where l.period_id = p_period_id and l.direction = (select direction from tmp_dong limit 1);
    update tmp_dong t set row_order = v_max + r.rn
      from (select line_key, row_number() over (order by row_order) rn from tmp_dong
            where not exists (select 1 from accounting.invoice_lines l where l.period_id = p_period_id and l.line_key = tmp_dong.line_key)) r
     where t.line_key = r.line_key;
  end if;

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
    on conflict (period_id, line_key) do nothing returning id)
  select count(*) into v_ins from ins;
  return jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'kept', v_tong - v_ins - v_upd);
end $$;
-- Quyền: chữ ký không đổi → grant cũ còn hiệu lực; vẫn revoke/grant lại cho chắc.
do $$ begin
  execute 'revoke all on function public.ke_toan_dong_list(text,bigint,text) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_dong_list(text,bigint,text) to service_role';
  execute 'revoke all on function public.ke_toan_dong_nhap(text,bigint,bigint,jsonb) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_dong_nhap(text,bigint,bigint,jsonb) to service_role';
end $$;
