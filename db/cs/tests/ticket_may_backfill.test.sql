-- Test cs_ticket_may_backfill (migration 20261109122000). DB LOCAL, begin/rollback.
begin;
do $$
declare kq jsonb; n_truoc int; n_sau int;
begin
  alter table tickets disable trigger trg_tickets_tao_dong_may;   -- giả lập ticket CŨ (trước migration)
  insert into tickets (ticket_code, ticket_type, description) values
    ('TK-9911-951', 'Bảo hành', 'Rò rỉ nước ở đầu vòi lạnh'),
    ('TK-9911-952', 'Khác', 'hỏi giá');
  alter table tickets enable trigger trg_tickets_tao_dong_may;
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-RO-VOI-LANH', 'Rò nước đầu vòi lạnh', '{"đầu vòi lạnh"}', 'da_duyet');

  select count(*) into n_truoc from ticket_may;
  kq := cs_ticket_may_backfill(true);
  select count(*) into n_sau from ticket_may;
  if n_sau <> n_truoc then raise exception 'chạy thử mà vẫn ghi'; end if;
  if (kq->>'chay_thu')::boolean is not true then raise exception 'thiếu cờ chay_thu'; end if;
  if (kq->>'so_ticket_chua_co_dong')::int < 2 then raise exception 'đếm sai: %', kq; end if;
  if (kq->'se_tao_theo_loi'->>'T-RO-VOI-LANH')::int < 1 then raise exception 'báo cáo thiếu theo loại: %', kq; end if;
  if not (kq->'mau_chua_phan_loai') ? 'TK-9911-952' then raise exception 'mẫu chưa phân loại thiếu: %', kq; end if;

  kq := cs_ticket_may_backfill(false);
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-951') <> 'T-RO-VOI-LANH' then raise exception 'backfill sai mã'; end if;
  if (select nguon from ticket_may where ticket_code = 'TK-9911-951') <> 'backfill' then raise exception 'nguon sai'; end if;

  -- chạy lại không nhân đôi
  select count(*) into n_truoc from ticket_may;
  perform cs_ticket_may_backfill(false);
  select count(*) into n_sau from ticket_may;
  if n_sau <> n_truoc then raise exception 'không idempotent'; end if;

  -- phân loại lại: thêm alias mới → dòng CHUA_PHAN_LOAI tự lên mã; dòng CS đã chọn tay giữ nguyên
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-HOI-GIA', 'Hỏi giá', '{"hỏi giá"}', 'da_duyet');
  kq := cs_ticket_may_backfill(false);
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-952') <> 'T-HOI-GIA' then raise exception 'không phân loại lại'; end if;

  -- không đụng dòng CS đã sửa / dòng nhập tay
  insert into tickets (ticket_code, ticket_type, description) values ('TK-9911-953', 'Khác', 'hỏi giá lần nữa');
  update ticket_may set loi_code = 'CHUA_PHAN_LOAI', cs_sua = true where ticket_code = 'TK-9911-953';
  insert into ticket_may (ticket_code, thu_tu, nguon, loi_code) values ('TK-9911-953', 2, 'app', 'CHUA_PHAN_LOAI');
  perform cs_ticket_may_backfill(false);
  if (select count(*) from ticket_may where ticket_code = 'TK-9911-953') <> 2 then raise exception 'backfill thêm dòng cho ticket đã có dòng'; end if;
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-953' and nguon = 'app') <> 'CHUA_PHAN_LOAI' then raise exception 'đụng dòng nhập tay'; end if;

  -- M2: insert backfill có on conflict do nothing (chạy song song với trigger không vỡ unique dòng tự động)
  if pg_get_functiondef('cs_ticket_may_backfill(boolean)'::regprocedure) !~* 'on conflict do nothing' then
    raise exception 'insert backfill thiếu on conflict do nothing'; end if;

  -- bot_tao_ticket với serial KHÔNG có trong installed_base → ticket tạo được, dòng máy serial null
  kq := bot_tao_ticket(jsonb_build_object('discord_msg_id', 'test-bf-9911', 'serial', 'KHONGCOTRONGHE999', 'ticket_type', 'Bảo hành',
          'description', 'hỏi giá máy lạ', 'ngay_tao', '2026-11-09', 'tac_gia', 'test', 'ghi_chu', '[]'::jsonb));
  if not exists (select 1 from ticket_may where ticket_code = kq->>'ticket_code' and serial is null and nguon = 'tu_dong') then
    raise exception 'bot_tao_ticket serial lạ: không có dòng máy serial null: %', kq; end if;
end $$;
rollback;
