-- Hợp thức hoá (truy lĩnh) hàm DB của bot ticket — trước nay áp tay bằng SQL Editor, không có trong migration.
-- Nguồn tay: GWT-Agent-Team db/ticket/{bot-tra-ticket, bot-tao-ticket(-v2), bot-dong-bo-cts20(-v2,-v3), bot-ticket-moi}.sql.
-- Nội dung dưới đây chép từ pg_get_functiondef trên live GWT-SalesTracking (bwzmqfbcgouhvhoslmmm) ngày 25/11/2026,
-- md5(prosrc) từng hàm khớp live — live là chuẩn, không phải file tay (file tay có nhiều bản v1/v2/v3).
-- Người gọi: bot ticket (GWT-Agent-Team admin/ticket/*), role DB kho_bot_serial.
--
-- Trên live mọi object đã có sẵn → file này chỉ cần ghi vào ledger, KHÔNG áp lại (áp lại cũng vô hại: if not exists + create or replace y hệt).
-- Cách lùi nếu hỏng: (live) xoá entry ledger 20261125061136 — không đụng hàm; (DB dựng mới) drop 9 hàm ở cuối file
--   + drop index tickets_discord_msg_id_uq + alter table public.tickets drop column discord_msg_id.

-- 1. Cột chống trùng: mỗi tin Discord một ticket (bot-tao-ticket.sql bản 1).
alter table public.tickets add column if not exists discord_msg_id text;
create unique index if not exists tickets_discord_msg_id_uq on public.tickets (discord_msg_id) where discord_msg_id is not null;
comment on column public.tickets.discord_msg_id is 'Tin Discord (#chăm-sóc-khách-hàng) mà bot tạo ticket này — mỗi tin một ticket.';

-- 2. Hàm phụ (tạo trước: hàm language sql bên dưới được kiểm thân lúc tạo).
CREATE OR REPLACE FUNCTION public.bot__so(p text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  -- SĐT về 9 số cuối (bỏ 0 / 84 / dấu cách / chấm): 0888 606 568 = +84888606568 = 888606568
  select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 9)
$function$;

CREATE OR REPLACE FUNCTION public.bot__chuan_ghi_chu(p text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select regexp_replace(
           btrim(regexp_replace(
             regexp_replace(lower(normalize(coalesce(p, ''), NFC)), '^\s*[+•-]?\s*(ngày\s+)?\d{1,2}/\d{1,2}(/\d{2,4})?\s*[:：–-]?\s*', ''),
             '\s+', ' ', 'g')),
           '[\s.,;:!?…]+$', '')
$function$;

-- 3. Tra khách / máy theo SĐT + serial (bot đọc tin #chăm-sóc-khách-hàng).
CREATE OR REPLACE FUNCTION public.bot_tra_ticket(p_sdt text, p_serials text[] DEFAULT '{}'::text[], p_ma text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with so as (select public.bot__so(p_sdt) s),
  khach as (
    select distinct c.id, c.full_name, c.customer_code, c.primary_phone, c.province
      from cs_customers c, so
     where length(so.s) = 9 and (public.bot__so(c.primary_phone) = so.s
        or exists (select 1 from customer_contacts k where k.customer_id = c.id and public.bot__so(k.phone) = so.s))
  ),
  may as (
    select b.serial, b.internal_code, b.customer_id, b.install_date, b.status, c.full_name ten_khach
      from installed_base b left join cs_customers c on c.id = b.customer_id
     where upper(b.serial) = any (select upper(x) from unnest(coalesce(p_serials, '{}')) x)
  ),
  may_khach as (
    select b.serial, b.internal_code, b.install_date, b.status, b.customer_id
      from installed_base b where b.customer_id in (select id from khach)
  )
  select jsonb_build_object(
    'khach', coalesce((select jsonb_agg(to_jsonb(k)) from khach k), '[]'),
    'may', coalesce((select jsonb_agg(to_jsonb(m)) from may m), '[]'),
    -- mọi máy của khách (bot tự lọc theo mã trong tin; khách 1 máy đúng mã mà tin quên serial → gợi ý máy đó)
    'may_cua_khach', coalesce((select jsonb_agg(to_jsonb(m) order by m.install_date desc nulls last) from may_khach m), '[]'),
    'loai', coalesce((select jsonb_agg(t order by t) from (select distinct ticket_type t from tickets where ticket_type is not null) x), '[]'))
$function$;

-- 4. Tạo ticket từ tin Discord (bản 2) + số phiên bản bot kiểm trước khi chạy.
CREATE OR REPLACE FUNCTION public.bot_tao_ticket(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_msg text := nullif(btrim(p->>'discord_msg_id'), ''); v_code text; v_ngay date := coalesce((p->>'ngay_tao')::date, (now() at time zone 'Asia/Ho_Chi_Minh')::date);
  v_prefix text; v_n int; v_serial text; v_khach uuid; v_cs uuid; v_moi boolean := false; v_them int := 0; g text; e jsonb; v_nd date;
begin
  if v_msg is null then raise exception 'bot_tao_ticket: thiếu discord_msg_id'; end if;
  select ticket_code into v_code from tickets where discord_msg_id = v_msg;
  v_serial := nullif(upper(btrim(p->>'serial')), '');
  if v_serial is not null and not exists (select 1 from installed_base where serial = v_serial) then v_serial := null; end if;
  v_khach := nullif(p->>'customer_id', '')::uuid;
  if v_khach is not null and not exists (select 1 from cs_customers where id = v_khach) then v_khach := null; end if;
  if v_code is null then
    perform pg_advisory_xact_lock(hashtext('bot_tao_ticket'));
    v_prefix := 'TK-' || to_char(v_ngay, 'YYMM') || '-';
    select coalesce(max(substring(ticket_code from length(v_prefix) + 1)::int), 0) + 1 into v_n
      from tickets where ticket_code like v_prefix || '%' and substring(ticket_code from length(v_prefix) + 1) ~ '^\d+$';
    v_code := v_prefix || lpad(v_n::text, 3, '0');
    select id into v_cs from staff where lower(email) = lower(coalesce(nullif(p->>'nguoi_nhan_email', ''), 'tk@gwt.vn')) limit 1;
    insert into tickets (ticket_code, serial, source_serial, customer_id, ticket_type, description, state, khan, last_note, cs_phu_trach, created_at, discord_msg_id)
    values (v_code, v_serial, nullif(upper(btrim(p->>'source_serial')), ''), v_khach, nullif(btrim(p->>'ticket_type'), ''), p->>'description', 'Open', false,
            'Bot tạo từ Discord: ' || coalesce(p->>'link', ''), v_cs, (v_ngay::text || ' 09:00:00+07')::timestamptz, v_msg);
    v_moi := true;
  else
    -- Tin sửa: gắn khách / máy nếu trước đó còn trống (CSKH vừa bổ sung trên app rồi sửa tin)
    update tickets set customer_id = coalesce(customer_id, v_khach), serial = coalesce(serial, v_serial), updated_at = now()
     where ticket_code = v_code and (customer_id is null or serial is null);
  end if;
  for e in select x from jsonb_array_elements(coalesce(p->'ghi_chu', '[]'::jsonb)) x loop
    if jsonb_typeof(e) = 'string' then g := e #>> '{}'; v_nd := null;                -- kiểu bản 1: chuỗi, thời điểm = lúc ghi
    else g := e->>'noi_dung'; v_nd := nullif(e->>'ngay', '')::date; end if;
    if btrim(coalesce(g, '')) <> ''
       and not exists (select 1 from ticket_note where ticket_code = v_code
                        and (noi_dung = g or public.bot__chuan_ghi_chu(noi_dung) = public.bot__chuan_ghi_chu(g))) then
      -- có ngày → 09:00 giờ VN ngày đó (+ v_them mili giây: các mục cùng ngày giữ thứ tự trong tin); không ngày → clock_timestamp()
      -- (mỗi ghi chú một thời điểm riêng → app xếp đúng thứ tự; now() giống nhau cả lệnh → đảo lộn, 05/11/2026)
      insert into ticket_note (ticket_code, noi_dung, tac_gia, created_at)
      values (v_code, g, coalesce(nullif(p->>'tac_gia', ''), 'bot Discord'),
              case when v_nd is not null then (v_nd::text || ' 09:00:00+07')::timestamptz + make_interval(secs => v_them / 1000.0) else clock_timestamp() end);
      v_them := v_them + 1;
    end if;
  end loop;
  return jsonb_build_object('ticket_code', v_code, 'moi', v_moi, 'them_ghi_chu', v_them,
    'co_khach', (select customer_id is not null from tickets where ticket_code = v_code), 'co_may', (select serial is not null from tickets where ticket_code = v_code));
end $function$;

CREATE OR REPLACE FUNCTION public.bot_tao_ticket_phien_ban()
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$ select 2 $function$;

-- 5. Đồng bộ Sheet CTS20 ↔ ticket (đọc bản 2, ghi bản 3) + số phiên bản.
CREATE OR REPLACE FUNCTION public.bot_dong_bo_cts20_doc(p_tu timestamp with time zone, p_serials text[] DEFAULT '{}'::text[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with t0 as (
    select t.ticket_code, t.serial, t.source_serial, t.ticket_type, t.state, t.description, t.created_at, t.customer_id, t.discord_msg_id,
           coalesce(t.serial, nullif(upper(btrim(t.source_serial)), '')) may
      from tickets t
  ),
  cts as (
    select t0.* from t0
     where exists (select 1 from installed_base b where b.serial = t0.may and b.internal_code ilike 'CTS20%')
        or exists (select 1 from serial_registry r where r.serial = t0.may and r.internal_code ilike 'CTS20%')
        or coalesce(t0.source_serial, '') ~* 'CTS-?20'
        or coalesce(t0.discord_msg_id, '') like 'sheet-cts20:%'
  ),
  doi as (
    select c.* from cts c
     where c.created_at >= coalesce(p_tu, '-infinity'::timestamptz)
        or exists (select 1 from ticket_note n where n.ticket_code = c.ticket_code and n.created_at >= coalesce(p_tu, '-infinity'::timestamptz))
  ),
  theo as (
    select t0.* from t0 where t0.may = any (select upper(btrim(x)) from unnest(coalesce(p_serials, '{}'::text[])) x)
  )
  select jsonb_build_object(
    'luc', now(), 'phien_ban', 2,
    'doi', coalesce((
      select jsonb_agg(jsonb_build_object(
               'ticket_code', d.ticket_code, 'serial', d.may, 'ticket_type', d.ticket_type, 'state', d.state, 'description', d.description,
               'created_at', d.created_at, 'ten_khach', k.full_name, 'install_date', b.install_date, 'discord_msg_id', d.discord_msg_id,
               'ghi_chu', coalesce((select jsonb_agg(jsonb_build_object('noi_dung', n.noi_dung, 'created_at', n.created_at, 'tac_gia', n.tac_gia) order by n.created_at)
                                      from ticket_note n where n.ticket_code = d.ticket_code), '[]'::jsonb))
             order by d.created_at, d.ticket_code)
        from doi d
        left join installed_base b on b.serial = d.may
        left join cs_customers k on k.id = coalesce(d.customer_id, b.customer_id)), '[]'::jsonb),
    'theo_serial', coalesce((
      select jsonb_agg(jsonb_build_object('ticket_code', s.ticket_code, 'serial', s.may, 'ticket_type', s.ticket_type, 'state', s.state,
                                          'created_at', s.created_at) order by s.created_at)
        from theo s), '[]'::jsonb))
$function$;

CREATE OR REPLACE FUNCTION public.bot_dong_bo_cts20_ghi(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_khoa text := nullif(btrim(p->>'khoa'), '');
  v_ma text := nullif(upper(btrim(p->>'ticket_code')), '');
  v_serial text := nullif(upper(btrim(p->>'serial')), '');
  v_mau text := coalesce(nullif(p->>'mau', ''), 'rò|rỉ|chảy|leak');
  v_tranh text[] := coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'tranh', '[]'::jsonb)) x), '{}');
  v_bao date := nullif(p->>'ngay_tao', '')::date;
  v_ngay date := coalesce(v_bao, (now() at time zone 'Asia/Ho_Chi_Minh')::date);
  v_cho_tao boolean := coalesce((p->>'cho_tao')::boolean, false);
  v_code text; v_lien text; v_moi boolean := false; v_them int := 0; v_prefix text; v_n int; v_cs uuid; v_khach uuid; v_gan text; g text;
  e jsonb; v_nd date;
begin
  if v_khoa is null or v_khoa not like 'sheet-cts20:%' then raise exception 'bot_dong_bo_cts20_ghi: khoá phải bắt đầu sheet-cts20:'; end if;
  if v_serial is null or v_serial !~ '^[A-Z][0-9]{8}[A-Z0-9]{3}[0-9]{8}$' then raise exception 'bot_dong_bo_cts20_ghi: serial sai dạng'; end if;

  if v_ma is not null then
    select ticket_code into v_code from tickets where ticket_code = v_ma;
    if v_code is null then return jsonb_build_object('loi', 'khong_co_ma', 'ticket_code', v_ma, 'phien_ban', 3); end if;
    v_lien := 'ma';
  end if;
  if v_code is null then
    select ticket_code into v_code from tickets where discord_msg_id = v_khoa;
    if v_code is not null then v_lien := 'khoa'; end if;
  end if;
  if v_code is null and v_bao is not null then
    -- cùng serial, ngày tạo (giờ VN) trong ±7 ngày của ngày báo lỗi = cùng ca — mọi loại, mọi trạng thái
    select t.ticket_code into v_code from tickets t
     where (t.serial = v_serial or upper(btrim(t.source_serial)) = v_serial)
       and abs((t.created_at at time zone 'Asia/Ho_Chi_Minh')::date - v_bao) <= 7
       and coalesce(t.description, '') not like '[THỬ%'
       and t.ticket_code <> all (v_tranh)
     order by ((t.created_at at time zone 'Asia/Ho_Chi_Minh')::date = v_bao) desc, (t.state = 'Open') desc, t.created_at desc,
              (coalesce(t.ticket_type, '') ~* v_mau or coalesce(t.description, '') ~* v_mau) desc
     limit 1;
    if v_code is not null then v_lien := 'serial'; end if;
  end if;
  if v_code is null then
    if not v_cho_tao or v_bao is null then return jsonb_build_object('loi', 'khong_tao', 'phien_ban', 3); end if;
    perform pg_advisory_xact_lock(hashtext('bot_tao_ticket'));      -- chung khoá với bot_tao_ticket
    select ticket_code into v_code from tickets where discord_msg_id = v_khoa;
    if v_code is not null then v_lien := 'khoa';
    else
      v_prefix := 'TK-' || to_char(v_ngay, 'YYMM') || '-';
      select coalesce(max(substring(ticket_code from length(v_prefix) + 1)::int), 0) + 1 into v_n
        from tickets where ticket_code like v_prefix || '%' and substring(ticket_code from length(v_prefix) + 1) ~ '^\d+$';
      v_code := v_prefix || lpad(v_n::text, 3, '0');
      select serial, customer_id into v_gan, v_khach from installed_base where serial = v_serial;
      select id into v_cs from staff where lower(email) = 'tk@gwt.vn' limit 1;
      insert into tickets (ticket_code, serial, source_serial, customer_id, ticket_type, description, state, khan, last_note, cs_phu_trach, created_at, discord_msg_id)
      values (v_code, v_gan, v_serial, v_khach, nullif(btrim(p->>'ticket_type'), ''), p->>'description', 'Open', false,
              'Bot tạo từ Sheet CTS20 (261026-CTS20 Updated Issues)', v_cs, (v_ngay::text || ' 09:00:00+07')::timestamptz, v_khoa);
      v_moi := true; v_lien := 'tao';
    end if;
  end if;

  for e in select x from jsonb_array_elements(coalesce(p->'ghi_chu', '[]'::jsonb)) x loop
    if jsonb_typeof(e) = 'string' then g := e #>> '{}'; v_nd := null;                -- kiểu cũ (v2): chuỗi, thời điểm = lúc ghi
    else g := e->>'noi_dung'; v_nd := nullif(e->>'ngay', '')::date; end if;
    if coalesce(public.bot__chuan_ghi_chu(g), '') <> ''
       and not exists (select 1 from ticket_note where ticket_code = v_code and public.bot__chuan_ghi_chu(noi_dung) = public.bot__chuan_ghi_chu(g)) then
      -- có ngày → 09:00 giờ VN ngày đó (+ v_them mili giây để giữ thứ tự các mục cùng ngày); không ngày → lúc ghi
      insert into ticket_note (ticket_code, noi_dung, tac_gia, created_at)
      values (v_code, g, coalesce(nullif(p->>'tac_gia', ''), 'Sheet CTS20'),
              case when v_nd is not null then (v_nd::text || ' 09:00:00+07')::timestamptz + make_interval(secs => v_them / 1000.0) else clock_timestamp() end);
      v_them := v_them + 1;
    end if;
  end loop;
  if v_them > 0 and not v_moi then update tickets set updated_at = now() where ticket_code = v_code; end if;
  return jsonb_build_object('ticket_code', v_code, 'moi', v_moi, 'lien_ket', v_lien, 'them_ghi_chu', v_them, 'phien_ban', 3);
end $function$;

CREATE OR REPLACE FUNCTION public.bot_dong_bo_cts20_phien_ban()
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$ select 3 $function$;

-- 6. Báo ticket mới: dấu vân tay + danh sách ticket gần đây (PR GWT-Agent-Team#56, 25/11/2026).
CREATE OR REPLACE FUNCTION public.bot_ticket_moi(p_dau text DEFAULT NULL::text, p_ngay integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d text;
begin
  select md5(coalesce(string_agg(ticket_code::text, ',' order by ticket_code), '')) into d from tickets;
  if d is not distinct from p_dau then return jsonb_build_object('dau', d); end if;
  return jsonb_build_object('dau', d, 'ds', coalesce((
    select jsonb_agg(to_jsonb(y) order by y.created_at, y.ticket_code) from (
      select v.ticket_code::text, t.created_at, v.ticket_type::text as loai, v.state::text as state,
             v.product_name::text as may, coalesce(t.serial, t.source_serial)::text as serial, v.province::text as tinh,
             v.customer_name::text as khach, v.cs_ten::text as cs, v.ky_thuat_ten::text as kt, t.cs_theo_doi::text as theo_doi,
             coalesce(t.khan, false) as khan, left(v.description, 300)::text as mo_ta, t.discord_msg_id::text as discord_msg_id
      from tickets t join v_tickets v on v.ticket_code = t.ticket_code
      where t.created_at > now() - make_interval(days => greatest(p_ngay, 1))
    ) y), '[]'::jsonb));
end $function$;

-- 7. Quyền = đúng live: chỉ kho_bot_serial (bot) + service_role. Supabase tự cấp anon/authenticated → thu hồi.
do $$
declare f text;
begin
  foreach f in array array[
    'public.bot__so(text)', 'public.bot__chuan_ghi_chu(text)',
    'public.bot_tra_ticket(text, text[], text)',
    'public.bot_tao_ticket(jsonb)', 'public.bot_tao_ticket_phien_ban()',
    'public.bot_dong_bo_cts20_doc(timestamptz, text[])', 'public.bot_dong_bo_cts20_ghi(jsonb)', 'public.bot_dong_bo_cts20_phien_ban()',
    'public.bot_ticket_moi(text, integer)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to kho_bot_serial', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
