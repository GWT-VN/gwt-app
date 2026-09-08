-- ke_toan_07_upload_lai — hai lỗ hổng khi upload LẠI file NEXIA đã sửa (review 08/09/2026, issue 4):
-- (1) nhánh UPDATE của ke_toan_dong_nhap không cập nhật row_order → dòng cũ giữ thứ tự của file cũ,
--     ánh xạ row_order ↔ dòng Excel khi xuất lệch → kiểm Số HĐ ném lỗi, 409 vĩnh viễn. Nay
--     set row_order = t.row_order (thứ tự theo file MỚI NHẤT — cũng là file route xuất mở ra).
-- (2) dòng có trong DB nhưng KHÔNG còn trong file mới chưa bao giờ được đánh dấu (việc treo p) →
--     thêm ke_toan_nguon_chot(p_email, p_source_id): gọi sau khi nạp hết lô, đánh
--     missing_in_last_upload = true cho dòng cùng kỳ mà last_source_id ≠ source này — chỉ xét dòng
--     mà nguồn cuối cùng kind với source (NEXIA không đè dòng HDCT của lát 4 và ngược lại).
--     UPDATE có WHERE → qua safeupdate. Dòng xuất hiện lại ở lần upload sau: nhánh UPDATE của
--     dong_nhap đã set missing_in_last_upload = false.
-- Cách lùi nếu hỏng: ke_toan_dong_nhap → chạy lại định nghĩa trong 20260907050000_ke_toan_05_dong_nhap_safeupdate.sql;
--   drop function public.ke_toan_nguon_chot(text,bigint).

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

  -- Dòng đã có: cập nhật raw + THỨ TỰ theo file mới (07) + nguồn cuối, bỏ cờ thiếu.
  with up as (
    update accounting.invoice_lines l
       set raw = t.raw, row_order = t.row_order, last_source_id = p_source_id, missing_in_last_upload = false
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

-- Chốt một lần upload: dòng nào của kỳ không được lần upload này chạm tới (last_source_id ≠ source) và
-- nguồn cuối của nó cùng loại với source → đánh dấu "không còn trong file mới nhất". Trả số dòng đánh dấu.
create or replace function public.ke_toan_nguon_chot(p_email text, p_source_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform accounting.nv(p_email);
  update accounting.invoice_lines l
     set missing_in_last_upload = true
    from accounting.sources s
   where s.id = p_source_id
     and l.period_id = s.period_id
     and l.last_source_id is distinct from s.id
     and l.missing_in_last_upload = false
     and exists (select 1 from accounting.sources o where o.id = l.last_source_id and o.kind = s.kind);
  get diagnostics v_n = row_count;
  return jsonb_build_object('missing', v_n);
end $$;

-- Khoá cửa: chỉ service_role (app server sau chanKeToan) gọi được — khuôn 20260904040200
do $$
begin
  revoke all on function public.ke_toan_nguon_chot(text,bigint) from public, anon, authenticated;
  grant execute on function public.ke_toan_nguon_chot(text,bigint) to service_role;
end $$;
