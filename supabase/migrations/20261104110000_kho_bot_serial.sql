-- Bot kho ghi lịch sử máy theo serial (Đợt 2 kho NX, duyệt 04/11/2026).
-- CHÉP NGUYÊN VĂN từ gwt-discord-bot db/kho-serial/app-serial-bot.sql (test PGlite: shopee/kho-app-serial.test.mjs).

-- Bot kho (Bắp, kênh Discord kho Nguyễn Xiển) ghi LỊCH SỬ MÁY theo serial vào DB app GWT (GWT-SalesTracking).
-- Nguồn: gwt-discord-bot db/kho-serial/app-serial-bot.sql (test PGlite: shopee/kho-app-serial.test.mjs) → bản migration
-- của gwt-app (supabase/migrations/*_kho_bot_serial.sql) chép NGUYÊN VĂN file này.
--
-- Quyết định (người dùng duyệt 04/11/2026):
--  * Danh sách serial chuẩn = serial_registry (2.394 serial). KHÔNG tạo bảng serial thứ hai, KHÔNG thêm cột vị trí/tình trạng
--    vào serial_registry (CEO 21/09). Tình trạng máy (xước, thiếu bình gas, làm máy backup…) = SỰ KIỆN trong serial_su_dung.
--  * Bot CHỈ ghi lịch sử (su_kien kho_nhap / kho_xuat / tinh_trang, tu/den_trang_thai = null) — KHÔNG đổi trạng thái máy;
--    trạng thái vẫn do CSKH đặt trên app. Serial lạ → serial_pending (cho_duyet), duyệt ở /serial như cũ.
--  * Role kho_bot_serial: chỉ EXECUTE các hàm dưới (không đọc/ghi thẳng bảng). Bật login + mật khẩu làm RIÊNG, không để trong repo.
--  * Ghi từ kênh Kho test → nhãn test_batch; kho_bot_don_test() xoá sạch, app không hiện sự kiện test.

alter table public.serial_su_dung add column if not exists discord_msg_id text;
alter table public.serial_su_dung add column if not exists test_batch text;
alter table public.serial_pending add column if not exists discord_msg_id text;
alter table public.serial_pending add column if not exists test_batch text;
comment on column public.serial_su_dung.discord_msg_id is 'Tin Discord kênh kho mà bot đọc ra sự kiện này (null = ghi trên app).';
comment on column public.serial_su_dung.test_batch is 'Nhãn dữ liệu thử của bot kho (kênh Kho test). Khác null = không hiện trên app, dọn bằng kho_bot_don_test().';
create index if not exists serial_su_dung_discord_idx on public.serial_su_dung (discord_msg_id) where discord_msg_id is not null;
create index if not exists serial_pending_discord_idx on public.serial_pending (discord_msg_id) where discord_msg_id is not null;

-- Danh sách serial chuẩn + sự kiện gần nhất (không tính sự kiện test trừ khi p_ca_test) — bot dùng để khớp serial và dựng tab Sheet.
create or replace function public.kho_bot_ds_serial(p_ca_test boolean default false)
returns table (serial text, internal_code text, ten text, trang_thai text, trang_thai_nhan text, cho_duyet boolean,
               su_kien_cuoi text, luc_cuoi timestamptz, ghi_chu_cuoi text)
language sql stable security definer set search_path = public as $$
  select r.serial, r.internal_code, r.ten_noi_bo, r.trang_thai, t.nhan, false, e.su_kien, e.luc, e.ghi_chu
    from serial_registry r
    left join serial_trang_thai t on t.code = r.trang_thai
    left join lateral (select su_kien, luc, ghi_chu from serial_su_dung s
                        where s.serial = r.serial and (p_ca_test or s.test_batch is null)
                        order by luc desc limit 1) e on true
  union all
  select p.serial, p.internal_code, p.ten_noi_bo, 'cho_duyet', 'Chờ duyệt (chưa có trong danh sách)', true, null, p.created_at, p.ghi_chu
    from serial_pending p
   where p.trang_thai = 'cho_duyet' and (p_ca_test or p.test_batch is null)
     and not exists (select 1 from serial_registry r where r.serial = p.serial)
$$;

-- Lịch sử bot đã ghi (mới nhất trước) — tab "Lịch sử máy" trên Sheet.
create or replace function public.kho_bot_lich_su(p_ca_test boolean default false, p_gioi_han int default 2000)
returns table (luc timestamptz, serial text, internal_code text, su_kien text, ghi_chu text, boi text, discord_msg_id text, test_batch text)
language sql stable security definer set search_path = public as $$
  select s.luc, s.serial, coalesce(r.internal_code, p.internal_code), s.su_kien, s.ghi_chu, s.boi, s.discord_msg_id, s.test_batch
    from serial_su_dung s
    left join serial_registry r on r.serial = s.serial
    left join lateral (select internal_code from serial_pending x where x.serial = s.serial order by created_at desc limit 1) p on true
   where s.discord_msg_id is not null and (p_ca_test or s.test_batch is null)
   order by s.luc desc
   limit greatest(1, least(p_gioi_han, 10000))
$$;

-- Ghi (thay) toàn bộ sự kiện serial của MỘT tin Discord. Gọi lại khi tin bị sửa → xoá cái cũ của tin đó, ghi lại.
-- p = { discord_msg_id, test_batch?, nguoi, luc,
--       su_kien:   [{serial, su_kien: kho_nhap|kho_xuat|tinh_trang, ghi_chu}],
--       cho_duyet: [{serial, internal_code?, ghi_chu}] }       -- serial chưa có trong danh sách → hàng chờ duyệt
-- Trả { su_kien: n, cho_duyet: n }.
create or replace function public.kho_bot_ghi(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_msg  text := nullif(trim(p->>'discord_msg_id'), '');
  v_test text := nullif(trim(p->>'test_batch'), '');
  v_boi  text := 'bot-kho:' || coalesce(nullif(trim(p->>'nguoi'), ''), '?');
  v_luc  timestamptz := coalesce((p->>'luc')::timestamptz, now());
  e jsonb; v_sk int := 0; v_cd int := 0; v_serial text;
begin
  if v_msg is null then raise exception 'kho_bot_ghi: thiếu discord_msg_id'; end if;
  delete from serial_su_dung where discord_msg_id = v_msg;
  delete from serial_pending where discord_msg_id = v_msg and trang_thai = 'cho_duyet';

  for e in select * from jsonb_array_elements(coalesce(p->'cho_duyet', '[]')) loop
    v_serial := upper(trim(e->>'serial'));
    if v_serial = '' or exists (select 1 from serial_registry where serial = v_serial)
       or exists (select 1 from serial_pending where serial = v_serial and trang_thai = 'cho_duyet') then continue; end if;
    insert into serial_pending (serial, code, internal_code, ghi_chu, nguoi_tao, trang_thai, discord_msg_id, test_batch)
    values (v_serial, nullif(e->>'internal_code', ''), nullif(e->>'internal_code', ''), e->>'ghi_chu', v_boi, 'cho_duyet', v_msg, v_test);
    v_cd := v_cd + 1;
  end loop;

  for e in select * from jsonb_array_elements(coalesce(p->'su_kien', '[]')) loop
    v_serial := upper(trim(e->>'serial'));
    if (e->>'su_kien') not in ('kho_nhap', 'kho_xuat', 'tinh_trang') then
      raise exception 'kho_bot_ghi: su_kien "%" không hợp lệ', e->>'su_kien';
    end if;
    if not exists (select 1 from serial_registry where serial = v_serial)
       and not exists (select 1 from serial_pending where serial = v_serial and trang_thai = 'cho_duyet') then
      raise exception 'kho_bot_ghi: serial % không có trong danh sách / hàng chờ', v_serial;
    end if;
    insert into serial_su_dung (serial, su_kien, ghi_chu, boi, luc, discord_msg_id, test_batch)
    values (v_serial, e->>'su_kien', e->>'ghi_chu', v_boi, v_luc, v_msg, v_test);
    v_sk := v_sk + 1;
  end loop;
  return jsonb_build_object('su_kien', v_sk, 'cho_duyet', v_cd);
end $$;

-- Tin bị xoá trên Discord → huỷ sự kiện + serial chờ duyệt (chưa ai duyệt) của tin đó.
create or replace function public.kho_bot_xoa_tin(p_discord_msg_id text)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m int;
begin
  delete from serial_su_dung where discord_msg_id = p_discord_msg_id; get diagnostics n = row_count;
  delete from serial_pending where discord_msg_id = p_discord_msg_id and trang_thai = 'cho_duyet'; get diagnostics m = row_count;
  return n + m;
end $$;

-- Dọn dữ liệu kênh Kho test (trước khi chuyển sang kênh thật).
create or replace function public.kho_bot_don_test(p_nhan text)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m int;
begin
  if coalesce(trim(p_nhan), '') = '' then raise exception 'kho_bot_don_test: thiếu nhãn'; end if;
  delete from serial_su_dung where test_batch = p_nhan; get diagnostics n = row_count;
  delete from serial_pending where test_batch = p_nhan and trang_thai = 'cho_duyet'; get diagnostics m = row_count;
  return n + m;
end $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'kho_bot_serial') then create role kho_bot_serial nologin noinherit; end if;
end $$;
grant usage on schema public to kho_bot_serial;
do $$
declare f text;
begin
  foreach f in array array['public.kho_bot_ds_serial(boolean)', 'public.kho_bot_lich_su(boolean, integer)', 'public.kho_bot_ghi(jsonb)',
                           'public.kho_bot_xoa_tin(text)', 'public.kho_bot_don_test(text)'] loop
    -- Supabase tự cấp EXECUTE hàm mới cho anon/authenticated (default privileges) → thu hồi tường minh.
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to kho_bot_serial', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
