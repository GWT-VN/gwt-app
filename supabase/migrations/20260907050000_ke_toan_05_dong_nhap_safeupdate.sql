-- ke_toan_05_dong_nhap_safeupdate — sửa lỗi đo được trên production 07/09/2026 khi upload file NEXIA
-- T8 thật: "UPDATE requires a WHERE clause". Role `authenticator` (PostgREST — đường RPC của app)
-- trên Supabase nạp `session_preload_libraries = supautils, safeupdate`; extension safeupdate chặn
-- mọi UPDATE/DELETE không có WHERE, kể cả bên trong hàm security definer. Câu
-- `update tmp_dong set period_id = …` (migration 02, giữ nguyên ở 04) không có WHERE → RPC gãy ngay
-- ở lô đầu. CI db-reset không bắt được vì smoke chưa gọi ke_toan_dong_nhap qua PostgREST.
-- Sửa: KHÔNG update nữa — ghi đè 3 cột ngay lúc dựng tmp_dong từ JSON (bỏ khoá cũ, gắn khoá mới),
-- phần còn lại của hàm giữ nguyên migration 04. Migration 04 đã áp live nên bất biến, không sửa file cũ.
-- Cách lùi nếu hỏng: chạy lại định nghĩa ke_toan_dong_nhap trong 20260904040400_ke_toan_04_dong_nhap_chong_trung.sql.

create or replace function public.ke_toan_dong_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0; v_tong int;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  v_tong := jsonb_array_length(p_rows);
  -- period_id / first_source_id / last_source_id luôn lấy từ tham số, không tin client — gắn ngay ở
  -- đây thay vì UPDATE sau (safeupdate chặn UPDATE không WHERE trên đường PostgREST).
  create temp table tmp_dong on commit drop as
    select * from jsonb_populate_recordset(
      null::accounting.invoice_lines,
      (select coalesce(jsonb_agg(
         (e - 'period_id' - 'first_source_id' - 'last_source_id')
         || jsonb_build_object('period_id', p_period_id, 'first_source_id', p_source_id, 'last_source_id', p_source_id)
       ), '[]'::jsonb) from jsonb_array_elements(p_rows) e));

  -- Chống trùng NGAY TRONG lô: giữ dòng row_order nhỏ nhất cho mỗi line_key (như migration 04).
  delete from tmp_dong a using tmp_dong b
    where a.line_key = b.line_key and a.row_order > b.row_order;

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
    on conflict (period_id, line_key) do nothing
    returning id)
  select count(*) into v_ins from ins;

  return jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'kept', v_tong - v_ins - v_upd);
end $$;
