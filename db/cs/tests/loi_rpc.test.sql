-- Test 3 RPC của Task 8: cs_xoa_dong_may, cs_them_dong_may, cs_nhap_danh_muc_loi. DB LOCAL, begin/rollback.
-- docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f db/cs/tests/loi_rpc.test.sql
begin;
do $$
declare r jsonb; v_tu uuid; v_app uuid; n int; v_cs uuid; m ticket_may%rowtype; d loi_danh_muc%rowtype;
  v_nv uuid := '33333333-3333-4333-8333-333333333333';
begin
  insert into loi_danh_muc (code, ten, trang_thai) values ('T-RPC-A', 'A', 'da_duyet'), ('T-RPC-OLD', 'Old', 'da_duyet');
  insert into tickets (ticket_code, ticket_type, description) values ('TK-RPC-1', 'Khác', 'x'), ('TK-RPC-2', 'Khác', 'y');
  select id into v_tu from ticket_may where ticket_code = 'TK-RPC-1';

  -- them: thu_tu = max+1, nguon app
  r := cs_them_dong_may('TK-RPC-1', null, 'Z12345678ABC12345678', null, 'T-RPC-A', 'mô tả', 'dang_xu_ly', 'a@gwt.vn');
  if not (r->>'ok')::boolean then raise exception 'them lỗi %', r; end if;
  v_app := (r->>'id')::uuid;
  select * into m from ticket_may where id = v_app;
  if m.thu_tu <> 2 or m.nguon <> 'app' or m.loi_code <> 'T-RPC-A' then raise exception 'dòng thêm sai %', row_to_json(m); end if;
  r := cs_them_dong_may('TK-RPC-1', null, null, null, 'CHUA_PHAN_LOAI', null, 'dang_xu_ly', 'a@gwt.vn');
  if (select thu_tu from ticket_may where id = (r->>'id')::uuid) <> 3 then raise exception 'thu_tu không tăng'; end if;
  r := cs_them_dong_may('TK-NOPE', null, null, null, 'T-RPC-A', null, 'dang_xu_ly', 'a');
  if (r->>'ok')::boolean then raise exception 'ticket không tồn tại mà vẫn thêm'; end if;

  -- xoa: còn dòng khác → xoá + audit
  r := cs_xoa_dong_may(v_app, 'a@gwt.vn', v_nv);
  if not (r->>'ok')::boolean then raise exception 'xoá lỗi %', r; end if;
  if not exists (select 1 from audit_log where hanh_dong = 'xoa_dong_may' and doi_tuong = 'ticket:TK-RPC-1' and actor_id = v_nv) then raise exception 'thiếu audit xoá (kèm actor_id)'; end if;
  -- xoá nốt dòng thêm thứ hai, rồi dòng cuối bị chặn — kể cả gọi lần 2
  delete from ticket_may where ticket_code = 'TK-RPC-1' and id <> v_tu;
  r := cs_xoa_dong_may(v_tu, 'a', null);
  if (r->>'ok')::boolean or r->>'loi' <> 'dong_cuoi' then raise exception 'xoá dòng cuối không bị chặn %', r; end if;
  r := cs_xoa_dong_may(v_tu, 'a', null);
  if (r->>'ok')::boolean then raise exception 'lần xoá thứ hai lọt'; end if;
  select count(*) into n from ticket_may where ticket_code = 'TK-RPC-1';
  if n <> 1 then raise exception 'còn % dòng', n; end if;
  r := cs_xoa_dong_may(gen_random_uuid(), 'a', null);
  if (r->>'ok')::boolean or r->>'loi' <> 'khong_thay' then raise exception 'id lạ %', r; end if;

  -- nhap: chỉ đụng tu_dong/backfill chưa cs_sua
  update ticket_may set loi_code = 'T-RPC-OLD' where ticket_code = 'TK-RPC-2';
  insert into ticket_may (ticket_code, thu_tu, nguon, loi_code) values ('TK-RPC-2', 2, 'app', 'T-RPC-OLD') returning id into v_cs;
  r := cs_nhap_danh_muc_loi(
    '[{"code":"T-RPC-NEW","nhom":null,"ten":"Mới","aliases":["a"],"ma_may":[],"dau_hieu":null,"huong_xu_ly":"h","nguon":null,"trang_thai":"da_duyet","thu_tu":10}]'::jsonb,
    '[{"ticket_code":"TK-RPC-2","loi_code":"T-RPC-NEW"},{"ticket_code":"TK-RPC-1","loi_code":"T-RPC-NEW"}]'::jsonb, 'a@gwt.vn', v_nv);
  if (r->>'so_loi')::int <> 1 or (r->>'so_gan')::int <> 2 then raise exception 'đếm sai %', r; end if;
  if (select loi_code from ticket_may where id = v_cs) <> 'T-RPC-OLD' then raise exception 'ghi đè dòng app'; end if;
  if (select loi_code from ticket_may where ticket_code = 'TK-RPC-2' and nguon = 'tu_dong') <> 'T-RPC-NEW' then raise exception 'không gán dòng tự động'; end if;
  if (select duyet_boi from loi_danh_muc where code = 'T-RPC-NEW') <> 'a@gwt.vn' then raise exception 'thiếu duyet_boi'; end if;
  if not exists (select 1 from audit_log where hanh_dong = 'nhap_danh_muc_loi' and actor_id = v_nv and chi_tiet->'doi' @> '[{"tu":"T-RPC-OLD","den":"T-RPC-NEW"}]') then raise exception 'audit thiếu old→new / actor_id'; end if;

  -- I2: nhập lại với Duyệt trống (cho_duyet) KHÔNG hạ cấp mục đã duyệt, giữ người/lúc duyệt
  update loi_danh_muc set duyet_luc = '2026-01-01' where code = 'T-RPC-NEW';
  perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-NEW","ten":"Mới sửa tên","trang_thai":"cho_duyet"}]'::jsonb, '[]'::jsonb, 'b@gwt.vn', null);
  select * into d from loi_danh_muc where code = 'T-RPC-NEW';
  if d.trang_thai <> 'da_duyet' or d.ten <> 'Mới sửa tên' then raise exception 'cho_duyet hạ cấp mục đã duyệt: %', row_to_json(d); end if;
  if d.duyet_boi <> 'a@gwt.vn' or d.duyet_luc <> '2026-01-01'::timestamptz then raise exception 'mất người/lúc duyệt: %', row_to_json(d); end if;
  -- duyệt lại mục đang duyệt: vẫn giữ người/lúc duyệt cũ
  perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-NEW","ten":"Mới sửa tên","trang_thai":"da_duyet"}]'::jsonb, '[]'::jsonb, 'b@gwt.vn', null);
  select * into d from loi_danh_muc where code = 'T-RPC-NEW';
  if d.duyet_boi <> 'a@gwt.vn' or d.duyet_luc <> '2026-01-01'::timestamptz then raise exception 'duyệt lại ghi đè người duyệt: %', row_to_json(d); end if;
  -- ngừng rõ ràng thì đổi, xoá người duyệt; cho_duyet sau đó giữ ngung
  perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-NEW","ten":"Mới sửa tên","trang_thai":"ngung"}]'::jsonb, '[]'::jsonb, 'b@gwt.vn', null);
  perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-NEW","ten":"Mới sửa tên","trang_thai":"cho_duyet"}]'::jsonb, '[]'::jsonb, 'b@gwt.vn', null);
  select * into d from loi_danh_muc where code = 'T-RPC-NEW';
  if d.trang_thai <> 'ngung' or d.duyet_boi is not null then raise exception 'ngung sai: %', row_to_json(d); end if;
  -- duyệt rõ ràng mục chờ: ghi người duyệt mới
  perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-NEW","ten":"Mới sửa tên","trang_thai":"da_duyet"}]'::jsonb, '[]'::jsonb, 'b@gwt.vn', null);
  if (select duyet_boi from loi_danh_muc where code = 'T-RPC-NEW') <> 'b@gwt.vn' then raise exception 'duyệt mới thiếu duyet_boi'; end if;
  -- dòng cs_sua không bị đụng
  update ticket_may set cs_sua = true, loi_code = 'T-RPC-OLD' where ticket_code = 'TK-RPC-2' and nguon = 'tu_dong';
  r := cs_nhap_danh_muc_loi('[]'::jsonb, '[{"ticket_code":"TK-RPC-2","loi_code":"T-RPC-NEW"}]'::jsonb, 'a', null);
  if (r->>'so_gan')::int <> 0 then raise exception 'đụng dòng cs_sua %', r; end if;
  -- mã lỗi lạ → lỗi, toàn bộ rollback
  begin
    perform cs_nhap_danh_muc_loi('[{"code":"T-RPC-ZZ","ten":"Z"}]'::jsonb, '[{"ticket_code":"TK-RPC-1","loi_code":"KHONG-CO"}]'::jsonb, 'a', null);
    raise exception 'mã lỗi lạ lọt';
  exception when foreign_key_violation then null; end;
  if exists (select 1 from loi_danh_muc where code = 'T-RPC-ZZ') then raise exception 'import không nguyên tử'; end if;

  -- quyền: chỉ service_role
  if has_function_privilege('authenticated', 'cs_xoa_dong_may(uuid,text,uuid)', 'execute') or has_function_privilege('anon', 'cs_nhap_danh_muc_loi(jsonb,jsonb,text,uuid)', 'execute')
     or not has_function_privilege('service_role', 'cs_them_dong_may(text,text,text,text,text,text,text,text)', 'execute') then raise exception 'quyền execute sai'; end if;
  -- không còn bản quá tải cũ (thiếu actor_id)
  if to_regprocedure('cs_xoa_dong_may(uuid,text)') is not null or to_regprocedure('cs_nhap_danh_muc_loi(jsonb,jsonb,text)') is not null then
    raise exception 'còn hàm cũ không có p_nguoi_id'; end if;
end $$;
rollback;
