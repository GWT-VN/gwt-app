-- Test ticket_may + trigger (migration 20261109121000). DB LOCAL, begin/rollback.
-- Mô phỏng ĐÚNG câu insert của bot_tao_ticket / bot_dong_bo_cts20_ghi (cột như bot ghi).
begin;
do $$
declare v_kh uuid; n int; r ticket_may%rowtype;
begin
  insert into loi_danh_muc (code, ten, aliases, ma_may, trang_thai)
  values ('T-RO-NUOC-DAY', 'Rò nước đáy', '{"rò nước đáy"}', '{"TCTS20%"}', 'da_duyet');
  insert into cs_customers (full_name) values ('Khách Bịa Test') returning id into v_kh;
  insert into installed_base (serial, internal_code, customer_id) values ('Z12345678ABC12345678', 'TCTS20NG', v_kh);

  -- 1) insert kiểu bot: serial chưa gắn (null), source_serial có
  insert into tickets (ticket_code, serial, source_serial, customer_id, ticket_type, description, state, khan, last_note, created_at)
  values ('TK-9911-901', null, 'Z12345678ABC12345678', v_kh, 'Bảo hành', 'Khách báo rò nước đáy', 'Open', false, 'Bot tạo', now());
  select count(*) into n from ticket_may where ticket_code = 'TK-9911-901';
  if n <> 1 then raise exception 'insert ticket phải sinh đúng 1 dòng máy, có %', n; end if;
  select * into r from ticket_may where ticket_code = 'TK-9911-901';
  if r.nguon <> 'tu_dong' or r.serial is not null or r.source_serial <> 'Z12345678ABC12345678' then raise exception 'dòng tự tạo sai: %', row_to_json(r); end if;
  if r.internal_code is distinct from 'TCTS20NG' then raise exception 'không suy được internal_code từ source_serial'; end if;
  if r.loi_code <> 'T-RO-NUOC-DAY' then raise exception 'không tự phân loại, được %', r.loi_code; end if;

  -- 2) bot gắn serial sau (update coalesce(serial, …)) → dòng tự động nhận serial
  update tickets set serial = 'Z12345678ABC12345678', updated_at = now() where ticket_code = 'TK-9911-901';
  select * into r from ticket_may where ticket_code = 'TK-9911-901';
  if r.serial is distinct from 'Z12345678ABC12345678' then raise exception 'update serial không đồng bộ sang dòng máy'; end if;

  -- 3) ticket không serial, mô tả lạ → CHUA_PHAN_LOAI, vẫn tạo được ticket
  insert into tickets (ticket_code, ticket_type, description) values ('TK-9911-902', 'Khác', 'hỏi giá lõi');
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-902') <> 'CHUA_PHAN_LOAI' then raise exception 'không về CHUA_PHAN_LOAI'; end if;

  -- 4) dòng do CS thêm (nguon=app) KHÔNG bị trigger update đụng tới
  insert into ticket_may (ticket_code, thu_tu, source_serial, nguon) values ('TK-9911-902', 2, 'X00000000AAA00000000', 'app');
  update tickets set source_serial = 'Y00000000AAA00000000' where ticket_code = 'TK-9911-902';
  if (select source_serial from ticket_may where ticket_code = 'TK-9911-902' and thu_tu = 2) <> 'X00000000AAA00000000' then
    raise exception 'trigger sửa dòng CS tự thêm';
  end if;

  -- 5) xoá ticket → cascade dòng máy (chỉ để chắc FK đúng; app không xoá ticket)
  delete from tickets where ticket_code = 'TK-9911-902';
  if exists (select 1 from ticket_may where ticket_code = 'TK-9911-902') then raise exception 'không cascade'; end if;
  -- 6) CS đã sửa dòng (cs_sua=true) → đổi serial trên ticket KHÔNG ghi đè
  update ticket_may set cs_sua = true, internal_code = 'TAY' where ticket_code = 'TK-9911-901';
  update tickets set source_serial = 'W00000000AAA00000000' where ticket_code = 'TK-9911-901';
  select * into r from ticket_may where ticket_code = 'TK-9911-901';
  if r.source_serial <> 'Z12345678ABC12345678' or r.internal_code <> 'TAY' then raise exception 'trigger ghi đè dòng cs_sua: %', row_to_json(r); end if;

  -- 7) mỗi ticket tối đa 1 dòng tự động
  begin
    insert into ticket_may (ticket_code, thu_tu, nguon) values ('TK-9911-901', 9, 'tu_dong');
    raise exception 'cho phép dòng tự động thứ hai';
  exception when unique_violation then null;
  end;

  -- 8) trigger lỗi nội bộ → ticket vẫn tạo, chỉ WARNING, không có dòng máy
  alter table ticket_may add constraint tmp_fail check (false) not valid;
  insert into tickets (ticket_code, ticket_type) values ('TK-9911-903', 'Khác');
  if not exists (select 1 from tickets where ticket_code = 'TK-9911-903') then raise exception 'ticket mất khi trigger lỗi'; end if;
  if exists (select 1 from ticket_may where ticket_code = 'TK-9911-903') then raise exception 'lẽ ra không có dòng máy'; end if;
end $$;
rollback;
