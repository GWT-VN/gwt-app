-- cs — HUỶ BỘ / MÁY ĐÃ LẮP (nhập nhầm) + SỬA NGÀY BẢO HÀNH CẢ BỘ (18/11/2026)
--
-- 18/11: nhập nhầm bộ combo cho khách phải xoá bằng SQL tay. Cho CS tự sửa trên app, có giới hạn:
--  * huy_lap_may(serial, so_gio): xoá máy lẻ HOẶC cả bộ (mẹ + mọi thiết bị), BẤT CỨ LÚC NÀO (anh Dũng 18/11;
--    so_gio = null → không giới hạn thời gian, truyền số giờ nếu sau này muốn khoá lại), miễn chưa có ticket /
--    dòng máy ticket / kế hoạch bảo trì gắn vào. Thiết bị trong bộ không huỷ lẻ (huỷ cả bộ).
--    Bảo hành + lịch thay lõi xoá theo (FK on delete cascade). Serial thật trả về kho (serial_registry da_lap → ton_kho)
--    + ghi lịch sử 'huy_lap'. Trả số máy đã xoá + danh sách serial.
--  * sua_ngay_bh_bo(bo, ngay): đổi ngày lắp của bộ + mọi thiết bị, tính lại bảo hành từng thiết bị đã kích hoạt.
-- App ghi audit (người, lý do) trước khi gọi.
--
-- ROLLBACK:
--   drop function if exists public.huy_lap_may(text, integer);
--   drop function if exists public.sua_ngay_bh_bo(text, date);

create or replace function public.huy_lap_may(p_serial text, p_so_gio integer default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_may public.installed_base;
  v_ds text[];
  v_tra_kho text[];
begin
  select * into v_may from public.installed_base where serial = p_serial for update;
  if not found then raise exception 'Không thấy máy %', p_serial; end if;
  if v_may.parent_serial is not null then
    raise exception 'Thiết bị này thuộc bộ % — huỷ cả bộ ở trang bộ', v_may.parent_serial;
  end if;

  -- Máy lẻ = chính nó; bộ = mẹ + mọi thiết bị con.
  select array_agg(serial) into v_ds from public.installed_base where serial = p_serial or parent_serial = p_serial;

  if p_so_gio is not null and exists (select 1 from public.installed_base where serial = any(v_ds)
             and created_at < now() - make_interval(hours => greatest(p_so_gio, 1))) then
    raise exception 'Chỉ huỷ được máy / bộ lắp trong % giờ gần đây', p_so_gio;
  end if;
  if exists (select 1 from public.tickets where serial = any(v_ds))
     or exists (select 1 from public.ticket_may where serial = any(v_ds))
     or exists (select 1 from public.maintenance_plan where serial = any(v_ds)) then
    raise exception 'Máy / bộ đã có ticket hoặc lịch bảo trì — không huỷ được';
  end if;

  select array_agg(serial) into v_tra_kho from public.installed_base
   where serial = any(v_ds) and not cho_serial and exists (select 1 from public.serial_registry sr where sr.serial = installed_base.serial);

  delete from public.installed_base where parent_serial = p_serial;
  delete from public.installed_base where serial = p_serial;

  if v_tra_kho is not null then
    update public.serial_registry set trang_thai = 'ton_kho' where serial = any(v_tra_kho) and trang_thai = 'da_lap';
    insert into public.serial_su_dung (serial, su_kien, tu_trang_thai, den_trang_thai, customer_id, ghi_chu)
    select s, 'huy_lap', 'da_lap', 'ton_kho', v_may.customer_id, 'Huỷ lắp (nhập nhầm) — ' || p_serial from unnest(v_tra_kho) s;
  end if;

  return jsonb_build_object('so_may', coalesce(array_length(v_ds, 1), 0), 'serials', to_jsonb(v_ds),
                            'tra_kho', to_jsonb(coalesce(v_tra_kho, '{}'::text[])), 'customer_id', v_may.customer_id);
end
$$;
revoke all on function public.huy_lap_may(text, integer) from public, anon, authenticated;
grant execute on function public.huy_lap_may(text, integer) to service_role;

create or replace function public.sua_ngay_bh_bo(p_bo text, p_ngay date)
returns integer language plpgsql security definer set search_path = public as $$
declare v_n integer := 0; v_s text;
begin
  if p_ngay is null then raise exception 'Thiếu ngày bắt đầu bảo hành'; end if;
  if p_ngay > current_date then raise exception 'Ngày bắt đầu bảo hành không được ở tương lai'; end if;
  if not exists (select 1 from public.installed_base where parent_serial = p_bo) then
    raise exception '% không phải bộ combo (không có thiết bị con)', p_bo;
  end if;
  update public.installed_base set install_date = p_ngay where serial = p_bo or parent_serial = p_bo;
  for v_s in select ib.serial from public.installed_base ib join public.warranty w on w.serial = ib.serial
              where ib.parent_serial = p_bo and w.activated loop
    perform public.activate_warranty(v_s, p_ngay);
    v_n := v_n + 1;
  end loop;
  return v_n;
end
$$;
revoke all on function public.sua_ngay_bh_bo(text, date) from public, anon, authenticated;
grant execute on function public.sua_ngay_bh_bo(text, date) to service_role;

-- Sửa dữ liệu một lần: máy ĐANG Ở KHÁCH mà kho vẫn ghi "tồn kho" (lắp bộ combo trước 18/11 không cập nhật kho;
-- đo 18/11: 9 máy, 7 do lắp bộ trên app). Từ PR này app tự cập nhật khi lắp bộ.
-- Lùi: không cần (chỉ đồng bộ trạng thái kho theo installed_base; trạng thái cũ sai).
update public.serial_registry sr set trang_thai = 'da_lap'
  from public.installed_base ib
 where ib.serial = sr.serial and ib.customer_id is not null and ib.status = 'active' and sr.trang_thai = 'ton_kho';
