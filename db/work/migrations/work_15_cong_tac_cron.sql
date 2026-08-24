-- ============================================================================
-- work_15_cong_tac_cron.sql — công tắc chung cho bộ quét tự sinh (2026-08-24)
--
-- CEO 24/08: "Cron 15ph/lần cho bật tắt được không (hiện tại lúc test không cần
-- bật, sau khi live tôi mới quyết bật khi data đã gọn)."
--
-- ── Vì sao cần thêm, dù đã có nút bật/tắt TỪNG LUẬT ────────────────────────
-- Tắt cả 3 luật thì cron vẫn chạy 15 phút một lần, vẫn gọi sinh_viec_tu_erp(),
-- vẫn quét bảng rồi mới phát hiện không có luật nào bật. Vô hại nhưng mờ đục:
-- nhìn vào không ai biết "hệ thống tự sinh" đang sống hay chết, và bật lại một
-- luật là nó chạy NGAY trong 15 phút kế — đúng lúc data chưa gọn.
--
-- Công tắc chung cho phép CEO chỉnh luật thoải mái mà KHÔNG có gì tự chạy, rồi
-- bật một phát khi đã sẵn sàng. Hai tầng, cố ý:
--   · công tắc chung TẮT  -> không có gì tự chạy, bất kể luật bật hay tắt
--   · công tắc chung BẬT  -> mỗi luật lại theo cờ `active` của riêng nó
--
-- ── Vì sao KHÔNG dùng cron.alter_job / cron.unschedule ─────────────────────
-- Sửa lịch pg_cron cần quyền trên schema `cron`, mà RPC của app chạy bằng
-- service_role. Cho app quyền sửa lịch chạy nền là mở cửa rộng hơn nhiều so với
-- thứ đang cần. Và job biến mất khỏi `cron.job` thì lần sau muốn bật lại phải
-- nhớ đúng câu lệnh — mất luôn dấu vết.
-- Nên lịch cron GIỮ NGUYÊN chạy 15 phút; chính hàm quét tự soi công tắc rồi về
-- sớm. Rẻ (một lượt đọc 1 dòng), và trạng thái nằm trong bảng của khu Việc.
-- ============================================================================

create table if not exists work.cai_dat (
  khoa   text primary key,
  bat    boolean not null default false,
  sua_luc timestamptz not null default now(),
  sua_boi uuid
);

comment on table work.cai_dat is 'Công tắc cấp khu Việc. Hiện có: tu_sinh_bat (bộ quét tự sinh).';

insert into work.cai_dat(khoa, bat) values ('tu_sinh_bat', false)
on conflict (khoa) do nothing;

-- ── Bộ quét: soi công tắc chung TRƯỚC khi làm bất cứ việc gì ───────────────
-- Chỉ thêm ĐÚNG một cửa ở đầu hàm, phần thân giữ nguyên bản work_06.
create or replace function work.sinh_viec_tu_erp()
returns table(luat text, da_tao int)
language plpgsql security definer set search_path = '' as $$
declare r work.auto_rule; n int; v_nguoi uuid; rec record;
begin
  -- Công tắc chung. Tắt thì về ngay, không quét gì, không đụng last_run_at.
  -- Đồng bộ team_member vẫn chạy: đó là chuyện phân quyền, không phải sinh việc,
  -- và tắt nó đi thì đổi vai trò nhân sự sẽ không có hiệu lực — bẫy khác.
  perform work.dong_bo_team_member();
  if not exists (select 1 from work.cai_dat where khoa = 'tu_sinh_bat' and bat) then
    return;
  end if;

  for r in select * from work.auto_rule where active order by key loop
    n := 0;
    v_nguoi := coalesce(r.nguoi_nhan, work.nguoi_nhan_mac_dinh());

    if r.key = 'bh_cho_kich_hoat' then
      for rec in
        select ib.serial, coalesce(c.full_name, ib.install_address, '—') as khach
        from public.installed_base ib
        left join public.warranty w on w.serial = ib.serial
        left join public.cs_customers c on c.id = ib.customer_id
        where ib.status = 'active' and (w.serial is null or not w.activated)
          and (r.cua_so_ngay is null or ib.install_date is null
               or ib.install_date >= current_date - r.cua_so_ngay)
          and not exists (select 1 from work.task t
                          where t.origin = 'auto_erp' and t.origin_ref = 'serial:'||ib.serial)
        order by ib.install_date desc nulls last
        limit r.max_moi_lan
      loop
        if work.tao_viec_auto('serial:'||rec.serial,
             'Kích hoạt bảo hành — ' || rec.serial,
             'Máy đã lắp cho ' || rec.khach || ' nhưng bảo hành chưa kích hoạt. Vào /dang-ky-bh để kích hoạt.',
             r, now() + make_interval(days => r.han_ngay), v_nguoi) is not null
        then n := n + 1; end if;
      end loop;

    elsif r.key = 'ticket_khong_nguoi' then
      for rec in
        select t.ticket_code, coalesce(nullif(btrim(t.description),''), t.ticket_type, 'không có mô tả') as mo_ta
        from public.tickets t
        where t.state = 'Open' and t.cs_phu_trach is null
          and t.created_at < now() - make_interval(hours => coalesce(r.nguong_gio, 4))
          and not exists (select 1 from work.task w
                          where w.origin = 'auto_erp' and w.origin_ref = 'ticket:'||t.ticket_code)
        order by t.created_at
        limit r.max_moi_lan
      loop
        if work.tao_viec_auto('ticket:'||rec.ticket_code,
             'Phân người cho ticket ' || rec.ticket_code,
             'Ticket mở quá ' || coalesce(r.nguong_gio,4) || ' giờ chưa ai nhận: ' || left(rec.mo_ta, 200),
             r, now() + make_interval(days => r.han_ngay), v_nguoi) is not null
        then n := n + 1; end if;
      end loop;

    elsif r.key = 'bao_tri_toi_han' then
      for rec in
        select mv.id, mv.lan_thu, mv.due_date,
               coalesce(p.ten_kd, p.source_customer_name, mv.ten_task, '—') as khach
        from public.maintenance_visit mv
        left join public.maintenance_plan p on p.id = mv.plan_id
        where mv.completed_at is null
          and mv.due_date between current_date - coalesce(r.cua_so_ngay, 7)
                              and current_date + coalesce(r.cua_so_ngay, 7)
          and not exists (select 1 from work.task w
                          where w.origin = 'auto_erp' and w.origin_ref = 'visit:'||mv.id::text)
        order by mv.due_date
        limit r.max_moi_lan
      loop
        if work.tao_viec_auto('visit:'||rec.id::text,
             'Gọi khách đặt lịch bảo trì lượt ' || coalesce(rec.lan_thu::text,'?') || ' — ' || rec.khach,
             'Lượt bảo trì tới hạn ' || to_char(rec.due_date,'DD/MM/YYYY') || '. Gọi khách chốt ngày rồi gán kỹ thuật.',
             r, (rec.due_date::timestamptz + interval '17 hours'), v_nguoi) is not null
        then n := n + 1; end if;
      end loop;
    end if;

    update work.auto_rule set last_run_at = now(), last_created = n where key = r.key;
    luat := r.key; da_tao := n; return next;
  end loop;
end $$;

-- ── RPC: đọc + gạt công tắc ────────────────────────────────────────────────
create or replace function public.work_bat_tat_tu_sinh(p_email text, p_bat boolean)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not (select coalesce(s.vai_tro && array['admin','cs_manager','sales_manager']::text[], false)
          from public.staff s where s.id = v_me) then
    raise exception 'Chỉ quản lý mới bật/tắt bộ quét tự sinh';
  end if;

  insert into work.cai_dat(khoa, bat, sua_luc, sua_boi)
  values ('tu_sinh_bat', p_bat, now(), v_me)
  on conflict (khoa) do update set bat = excluded.bat, sua_luc = now(), sua_boi = v_me;

  return jsonb_build_object('bat', p_bat);
end $$;

revoke execute on function public.work_bat_tat_tu_sinh(text, boolean) from public;
grant  execute on function public.work_bat_tat_tu_sinh(text, boolean) to service_role;

-- ── work_luat_tu_sinh: trả thêm trạng thái công tắc để màn hiện đúng ───────
create or replace function public.work_luat_tu_sinh(p_email text)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'luat', (select coalesce(jsonb_agg(to_jsonb(r) order by r.key), '[]'::jsonb)
             from (select a.key, a.name, a.mo_ta, a.nguon, a.active, a.priority, a.team_key,
                          a.han_ngay, a.max_moi_lan, a.last_run_at, a.last_created,
                          a.nguoi_nhan, s.ten as nguoi_nhan_ten
                   from work.auto_rule a
                   left join public.staff s on s.id = coalesce(a.nguoi_nhan, work.nguoi_nhan_mac_dinh())) r),
    'cong_tac_bat', (select coalesce(bat, false) from work.cai_dat where khoa = 'tu_sinh_bat'),
    'la_quan_ly', (select coalesce(s.vai_tro && array['admin','cs_manager','sales_manager']::text[], false)
                   from public.staff s where s.id = work.staff_theo_email(p_email)),
    'nhan_su', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'ten', ten) order by ten), '[]'::jsonb)
                from public.staff where hoat_dong),
    'gan_day', (select coalesce(jsonb_agg(to_jsonb(v) order by v.id desc), '[]'::jsonb)
                from (select t.id, t.ref, t.title, t.status, t.priority, t.due_at,
                             t.origin_ref, t.created_at, tm.name as team_name,
                             tm.color as team_color, work.assignees_json(t.id) as assignees
                      from work.task t
                      left join work.team tm on tm.id = t.team_id
                      where t.origin = 'auto_erp'
                        and t.id in (select task_id
                                     from work.visible_task_ids(work.staff_theo_email(p_email)))
                      order by t.id desc limit 30) v),
    'tong_auto', (select count(*) from work.task where origin = 'auto_erp')
  )
$$;

notify pgrst, 'reload schema';
