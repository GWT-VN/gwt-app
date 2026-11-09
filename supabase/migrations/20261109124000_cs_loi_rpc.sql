-- cs — RPC nguyên tử cho dòng máy + nhập danh mục lỗi (Task 8 fix round 1, 09/11/2026)
-- (Đặt 124000 vì 123000 đã dùng cho cs_loi_tan_suat.)
-- Chỉ service_role gọi; app gọi SAU khi qua cổng quyền. Mỗi hàm là 1 transaction.
--   cs_xoa_dong_may   : xoá dòng chỉ khi ticket còn dòng khác (khoá hàng ticket) + audit
--   cs_them_dong_may  : thu_tu = max+1 dưới khoá hàng ticket
--   cs_nhap_danh_muc_loi : upsert danh mục + gán lỗi cho dòng tu_dong/backfill chưa cs_sua + audit old→new
--
-- ROLLBACK:
--   drop function if exists public.cs_xoa_dong_may(uuid, text);
--   drop function if exists public.cs_them_dong_may(text, text, text, text, text, text, text, text);
--   drop function if exists public.cs_nhap_danh_muc_loi(jsonb, jsonb, text);

create or replace function public.cs_xoa_dong_may(p_id uuid, p_nguoi text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_code text; v_dong jsonb; n int;
begin
  select ticket_code into v_code from ticket_may where id = p_id;
  if v_code is null then return jsonb_build_object('ok', false, 'loi', 'khong_thay'); end if;
  perform 1 from tickets where ticket_code = v_code for update;   -- tuần tự hoá các lần xoá cùng ticket
  select to_jsonb(m) into v_dong from ticket_may m where m.id = p_id;
  if v_dong is null then return jsonb_build_object('ok', false, 'loi', 'khong_thay'); end if;
  select count(*) into n from ticket_may where ticket_code = v_code;
  if n <= 1 then return jsonb_build_object('ok', false, 'loi', 'dong_cuoi'); end if;
  delete from ticket_may where id = p_id;
  insert into audit_log (actor, hanh_dong, doi_tuong, chi_tiet)
  values (p_nguoi, 'xoa_dong_may', 'ticket:' || v_code, jsonb_build_object('dong', v_dong));
  return jsonb_build_object('ok', true, 'ticket_code', v_code);
end $$;

create or replace function public.cs_them_dong_may(
  p_ticket text, p_serial text, p_source_serial text, p_internal_code text,
  p_loi_code text, p_mo_ta text, p_trang_thai text, p_nguoi text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_tt int; v_id uuid;
begin
  perform 1 from tickets where ticket_code = p_ticket for update;
  if not found then return jsonb_build_object('ok', false, 'loi', 'khong_thay_ticket'); end if;
  select coalesce(max(thu_tu), 0) + 1 into v_tt from ticket_may where ticket_code = p_ticket;
  insert into ticket_may (ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, trang_thai, nguon, tao_boi)
  values (p_ticket, v_tt, p_serial, p_source_serial, p_internal_code, coalesce(p_loi_code, 'CHUA_PHAN_LOAI'),
          p_mo_ta, coalesce(p_trang_thai, 'dang_xu_ly'), 'app', p_nguoi)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'thu_tu', v_tt);
end $$;

create or replace function public.cs_nhap_danh_muc_loi(p_loi jsonb, p_gan jsonb, p_nguoi text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_so_loi int := 0; v_doi jsonb; v_so_gan int := 0;
begin
  with up as (
    insert into loi_danh_muc (code, nhom, ten, aliases, ma_may, dau_hieu, huong_xu_ly, nguon, trang_thai, thu_tu, duyet_boi, duyet_luc)
    select x.code, x.nhom, x.ten, coalesce(x.aliases, '{}'), coalesce(x.ma_may, '{}'), x.dau_hieu, x.huong_xu_ly, x.nguon,
           coalesce(x.trang_thai, 'cho_duyet'), coalesce(x.thu_tu, 100),
           case when x.trang_thai = 'da_duyet' then p_nguoi end,
           case when x.trang_thai = 'da_duyet' then now() end
      from jsonb_to_recordset(p_loi) as x(code text, nhom text, ten text, aliases text[], ma_may text[], dau_hieu text,
                                          huong_xu_ly text, nguon text, trang_thai text, thu_tu int)
    on conflict (code) do update set nhom = excluded.nhom, ten = excluded.ten, aliases = excluded.aliases,
      ma_may = excluded.ma_may, dau_hieu = excluded.dau_hieu, huong_xu_ly = excluded.huong_xu_ly, nguon = excluded.nguon,
      trang_thai = excluded.trang_thai, thu_tu = excluded.thu_tu, duyet_boi = excluded.duyet_boi, duyet_luc = excluded.duyet_luc
    returning 1)
  select count(*) into v_so_loi from up;

  with gan as (
    select distinct on (ticket_code) ticket_code, loi_code
      from jsonb_to_recordset(p_gan) as g(ticket_code text, loi_code text)
     order by ticket_code
  ), doi as (
    select m.id, m.loi_code as tu, g.loi_code as den
      from ticket_may m join gan g on g.ticket_code = m.ticket_code
     where m.nguon in ('tu_dong', 'backfill') and not m.cs_sua and m.loi_code is distinct from g.loi_code
  ), upd as (
    update ticket_may m set loi_code = doi.den from doi where m.id = doi.id returning m.id
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', doi.id, 'tu', doi.tu, 'den', doi.den)), '[]'::jsonb), count(*)
    into v_doi, v_so_gan from doi join upd on upd.id = doi.id;

  insert into audit_log (actor, hanh_dong, doi_tuong, chi_tiet)
  values (p_nguoi, 'nhap_danh_muc_loi', 'loi_danh_muc',
          jsonb_build_object('so_loi', v_so_loi, 'so_gan', v_so_gan, 'doi', v_doi));
  return jsonb_build_object('so_loi', v_so_loi, 'so_gan', v_so_gan);
end $$;

revoke all on function public.cs_xoa_dong_may(uuid, text) from public, anon, authenticated;
revoke all on function public.cs_them_dong_may(text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.cs_nhap_danh_muc_loi(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.cs_xoa_dong_may(uuid, text) to service_role;
grant execute on function public.cs_them_dong_may(text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.cs_nhap_danh_muc_loi(jsonb, jsonb, text) to service_role;
