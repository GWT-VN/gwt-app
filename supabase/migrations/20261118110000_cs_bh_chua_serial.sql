-- cs — KÍCH HOẠT BẢO HÀNH KHI CHƯA CÓ SERIAL, BỔ SUNG SERIAL SAU (18/11/2026)
--
-- Chị Trang (qua anh Dũng, 18/11): Bảo hành › lắp máy lẻ / lắp bộ combo phải bấm kích hoạt được khi CHƯA có serial,
-- đánh dấu để bổ sung sau, ưu tiên kích hoạt được.
-- installed_base dùng serial làm khoá chính, mọi bảng trỏ vào nó (warranty, tickets, ticket_may, maintenance_plan,
-- filter_replacement, parent_serial) đều ON UPDATE CASCADE → cấp MÃ TẠM làm serial (như mã bộ combo WH30A202608001),
-- cờ cho_serial = true; bổ sung = đổi serial tạm → serial thật, mọi thứ đã gắn tự đi theo.
--  * Mã tạm: 'TAM' + YYYYMM (tháng lắp) + 3 số, vd TAM202611001. Khoá advisory chống hai lượt cấp trùng số.
--  * kich_hoat_bh_chua_serial: tạo máy (cho_serial) + kích hoạt BH trong MỘT giao dịch, trả mã tạm.
--  * lap_bo_combo: thiết bị nào serial trống → cấp mã tạm cho thiết bị đó (cần internal_code), vẫn kích hoạt cả bộ.
--  * bo_sung_serial: serial thật phải có trong kho (serial_registry), chưa lắp ở đâu, đúng loại máy → đổi serial.
-- Đo 18/11: chưa có serial nào bắt đầu bằng 'TAM'.
--
-- ROLLBACK (chỉ khi chưa có máy chờ serial; có rồi thì bổ sung serial hết trước):
--   drop function if exists public.bo_sung_serial(text, text);
--   drop function if exists public.kich_hoat_bh_chua_serial(uuid, text, text, date, text, text, text);
--   drop function if exists public.cs_ma_serial_tam(date);
--   -- lap_bo_combo: chạy lại định nghĩa cũ trong 20250101000000_baseline.sql (bản bắt buộc đủ serial)
--   drop index if exists public.installed_base_cho_serial_idx;
--   alter table public.installed_base drop column if exists cho_serial;

alter table public.installed_base add column if not exists cho_serial boolean not null default false;
comment on column public.installed_base.cho_serial is 'true = kích hoạt BH khi chưa có serial, serial đang là MÃ TẠM (TAM…) — chờ bổ sung serial thật (bo_sung_serial).';
create index if not exists installed_base_cho_serial_idx on public.installed_base (install_date) where cho_serial;

-- Mã tạm kế tiếp cho tháng của p_ngay. Gọi trong giao dịch của hàm cha (khoá advisory giữ tới hết giao dịch).
create or replace function public.cs_ma_serial_tam(p_ngay date)
returns text language plpgsql set search_path = public as $$
declare v_prefix text; v_max int;
begin
  perform pg_advisory_xact_lock(hashtext('cs_ma_serial_tam'));
  v_prefix := 'TAM' || to_char(coalesce(p_ngay, current_date), 'YYYYMM');
  select coalesce(max((substring(serial from length(v_prefix) + 1))::int), 0) into v_max
    from public.installed_base
   where serial like v_prefix || '%' and substring(serial from length(v_prefix) + 1) ~ '^[0-9]+$';
  return v_prefix || lpad((v_max + 1)::text, 3, '0');
end
$$;
revoke all on function public.cs_ma_serial_tam(date) from public, anon, authenticated;
grant execute on function public.cs_ma_serial_tam(date) to service_role;

-- Lắp 1 máy lẻ + kích hoạt BH khi chưa có serial. Trả mã tạm.
create or replace function public.kich_hoat_bh_chua_serial(
  p_customer uuid, p_internal_code text, p_model text, p_install_date date,
  p_install_address text, p_ngay_lap_do_chac text, p_ghi_chu text)
returns text language plpgsql security definer set search_path = public as $$
declare v_tam text;
begin
  if p_customer is null then raise exception 'Thiếu khách hàng'; end if;
  if p_install_date is null then raise exception 'Thiếu ngày bắt đầu bảo hành'; end if;
  if nullif(trim(p_internal_code), '') is null and nullif(trim(p_model), '') is null then
    raise exception 'Chưa có serial thì phải chọn máy (mã nội bộ) để tính hạn bảo hành';
  end if;
  v_tam := public.cs_ma_serial_tam(p_install_date);
  insert into public.installed_base
    (serial, internal_code, model_freetext, customer_id, install_date, install_address, ngay_lap_do_chac, ghi_chu,
     channel_source, status, cho_serial)
  values
    (v_tam, nullif(trim(p_internal_code), ''), nullif(trim(p_model), ''), p_customer, p_install_date,
     nullif(trim(p_install_address), ''), coalesce(nullif(p_ngay_lap_do_chac, ''), 'chinh_xac'), nullif(trim(p_ghi_chu), ''),
     'CSKH đăng ký (chờ serial)', 'active', true);
  perform public.activate_warranty(v_tam, p_install_date);
  return v_tam;
end
$$;
revoke all on function public.kich_hoat_bh_chua_serial(uuid, text, text, date, text, text, text) from public, anon, authenticated;
grant execute on function public.kich_hoat_bh_chua_serial(uuid, text, text, date, text, text, text) to service_role;

-- Lắp bộ combo: như bản cũ, thêm: thiết bị serial trống → mã tạm (cần internal_code), cho_serial = true.
create or replace function public.lap_bo_combo(p_combo text, p_customer uuid, p_install_date date, p_install_address text, p_serials jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_prefix text; v_max int; v_ma_bo text;
  v_item jsonb; v_serial text; v_ic text; v_owner uuid;
  v_n int := 0;
begin
  if p_combo is null or p_combo not in ('WH15A', 'WH30A', 'WH15AECO', 'WH30AECO') then
    raise exception 'Combo không hợp lệ: %', p_combo;
  end if;
  if p_customer is null then raise exception 'Thiếu khách hàng'; end if;
  if p_install_date is null then raise exception 'Thiếu ngày bắt đầu bảo hành'; end if;
  if jsonb_typeof(p_serials) <> 'array' or jsonb_array_length(p_serials) = 0 then
    raise exception 'Thiếu danh sách thiết bị';
  end if;

  for v_item in select * from jsonb_array_elements(p_serials) loop
    v_serial := nullif(trim(v_item->>'serial'), '');
    if v_serial is null then
      if nullif(trim(v_item->>'internal_code'), '') is null then
        raise exception 'Thiết bị chưa có serial thì phải có mã nội bộ';
      end if;
    else
      if not exists (select 1 from public.serial_registry where serial = v_serial) then
        raise exception 'Serial % không có trong kho', v_serial;
      end if;
      select customer_id into v_owner from public.installed_base where serial = v_serial;
      if v_owner is not null then
        raise exception 'Serial % đã lắp cho khách khác — không lắp lại', v_serial;
      end if;
    end if;
    v_n := v_n + 1;
  end loop;

  v_prefix := p_combo || to_char(p_install_date, 'YYYYMM');
  select coalesce(max((substring(serial from length(v_prefix) + 1))::int), 0)
    into v_max
  from public.installed_base
  where serial like v_prefix || '%'
    and substring(serial from length(v_prefix) + 1) ~ '^[0-9]+$';
  v_ma_bo := v_prefix || lpad((v_max + 1)::text, 3, '0');

  insert into public.installed_base
    (serial, internal_code, customer_id, install_date, install_address, channel_source, status)
  values
    (v_ma_bo, p_combo, p_customer, p_install_date, nullif(trim(p_install_address), ''), 'CSKH lắp bộ', 'active');

  for v_item in select * from jsonb_array_elements(p_serials) loop
    v_serial := nullif(trim(v_item->>'serial'), '');
    v_ic := nullif(trim(v_item->>'internal_code'), '');
    if v_serial is null then
      v_serial := public.cs_ma_serial_tam(p_install_date);
      insert into public.installed_base
        (serial, internal_code, parent_serial, customer_id, install_date, install_address, channel_source, status, cho_serial)
      values
        (v_serial, v_ic, v_ma_bo, p_customer, p_install_date, nullif(trim(p_install_address), ''), 'CSKH lắp bộ (chờ serial)', 'active', true);
    else
      insert into public.installed_base
        (serial, internal_code, model_freetext, parent_serial, customer_id, install_date, install_address, channel_source, status)
      select v_serial, coalesce(v_ic, sr.internal_code), sr.model, v_ma_bo,
             p_customer, p_install_date, nullif(trim(p_install_address), ''), 'CSKH lắp bộ', 'active'
      from public.serial_registry sr where sr.serial = v_serial
      on conflict (serial) do update set
        internal_code   = coalesce(excluded.internal_code, public.installed_base.internal_code),
        parent_serial   = excluded.parent_serial,
        customer_id     = excluded.customer_id,
        install_date    = excluded.install_date,
        install_address = excluded.install_address,
        channel_source  = excluded.channel_source,
        status          = 'active';
    end if;
    perform public.activate_warranty(v_serial, p_install_date);
  end loop;

  return v_ma_bo;
end;
$$;
revoke all on function public.lap_bo_combo(text, uuid, date, text, jsonb) from public, anon, authenticated;
grant execute on function public.lap_bo_combo(text, uuid, date, text, jsonb) to service_role;

-- Bổ sung serial thật cho máy đang chờ. Đổi khoá chính → bảo hành, ticket, kế hoạch bảo trì… tự theo (ON UPDATE CASCADE).
create or replace function public.bo_sung_serial(p_tam text, p_serial text)
returns void language plpgsql security definer set search_path = public as $$
declare v_may public.installed_base; v_sr record; v_serial text := nullif(trim(p_serial), '');
begin
  select * into v_may from public.installed_base where serial = p_tam for update;
  if not found then raise exception 'Không thấy máy %', p_tam; end if;
  if not v_may.cho_serial then raise exception 'Máy % không ở trạng thái chờ bổ sung serial', p_tam; end if;
  if v_serial is null then raise exception 'Nhập serial thật'; end if;
  select internal_code, model into v_sr from public.serial_registry where serial = v_serial;
  if not found then raise exception 'Serial % không có trong kho — nhập kho trước', v_serial; end if;
  if exists (select 1 from public.installed_base where serial = v_serial) then
    raise exception 'Serial % đã gắn cho một máy khác', v_serial;
  end if;
  if v_sr.internal_code is not null and v_may.internal_code is not null and v_sr.internal_code <> v_may.internal_code then
    raise exception 'Serial % là máy %, còn máy đang chờ là % — kiểm tra lại', v_serial, v_sr.internal_code, v_may.internal_code;
  end if;
  update public.installed_base
     set serial = v_serial, cho_serial = false,
         internal_code = coalesce(internal_code, v_sr.internal_code),
         model_freetext = coalesce(model_freetext, v_sr.model)
   where serial = p_tam;
end
$$;
revoke all on function public.bo_sung_serial(text, text) from public, anon, authenticated;
grant execute on function public.bo_sung_serial(text, text) to service_role;
