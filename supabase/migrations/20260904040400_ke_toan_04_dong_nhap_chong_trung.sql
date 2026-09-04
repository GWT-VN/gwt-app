-- ke_toan_04_dong_nhap_chong_trung — vá lỗ hổng phát hiện từ review toàn nhánh: file NEXIA thật có
-- thể liệt kê CÙNG một khoá tự nhiên (ký hiệu + số hoá đơn + tên hàng chuẩn hoá + thành tiền làm
-- tròn) nhiều lần trong CÙNG một hoá đơn (vd hoá đơn nhà hàng liệt kê 1 món ăn 4 lần) → nhiều dòng
-- cùng line_key trong CÙNG một lô insert → vi phạm unique (period_id, line_key) ngay ở lô đầu tiên.
-- Chống trùng ở CẢ HAI lớp: app đã gán `lan` (thứ tự xuất hiện) vào line_key (xem
-- lib/ke-toan/nhap/khoa-dong.ts) nhưng RPC vẫn tự dedupe/on conflict — không phụ thuộc riêng vào
-- việc client đã tính đúng, chịu được cả trường hợp tái nhập/gọi lại. Thêm luôn hàm dọn rác
-- accounting.sources khi vòng nhập giữa chừng bị lỗi (uploadNexia không có transaction xuyên
-- Storage + nhiều lần gọi RPC nên phải dọn tay).
-- Production hiện có 0 dòng accounting.invoice_lines nên đổi định nghĩa khoá (migration trước,
-- lib/ke-toan/chuan-hoa.ts) là miễn phí — không cần backfill.
-- Cách lùi nếu hỏng: ke_toan_dong_nhap → chạy lại định nghĩa trong 20260904040200_ke_toan_02_rpc.sql;
--   ke_toan_nguon_xoa → drop function public.ke_toan_nguon_xoa(text,bigint).

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

  -- Chống trùng NGAY TRONG lô: giữ dòng row_order nhỏ nhất cho mỗi line_key, các dòng còn lại của
  -- cùng nhóm trùng coi như "kept" (không insert/update riêng — dữ liệu 2 dòng giống hệt nhau).
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

-- Dọn rác accounting.sources khi vòng ke_toan_dong_nhap giữa chừng bị lỗi (uploadNexia đã upload
-- Storage + tạo source trước khi lặp lô insert; lỗi giữa chừng cần xoá tay, không có transaction
-- xuyên request). Chỉ xoá source KHÔNG có dòng nào còn trỏ tới (first/last_source_id) — tránh xoá
-- nhầm source đã có dữ liệu dùng thật (vd lỗi xảy ra ở lô thứ 2 trong khi lô 1 đã insert xong).
create or replace function public.ke_toan_nguon_xoa(p_email text, p_source_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform accounting.nv(p_email);
  delete from accounting.sources s
   where s.id = p_source_id
     and not exists (
       select 1 from accounting.invoice_lines l
       where l.first_source_id = s.id or l.last_source_id = s.id
     );
  get diagnostics v_n = row_count;
  return jsonb_build_object('deleted', v_n);
end $$;

-- Khoá cửa: chỉ service_role (app server sau chanKeToan) gọi được — khuôn 20260904040200
do $$
begin
  revoke all on function public.ke_toan_nguon_xoa(text,bigint) from public, anon, authenticated;
  grant execute on function public.ke_toan_nguon_xoa(text,bigint) to service_role;
end $$;
