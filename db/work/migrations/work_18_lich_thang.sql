-- ============================================================================
-- work_18_lich_thang.sql — màn Lịch & sắp tới (/work/lich) — 25/08/2026
--
-- "Cùng dữ liệu, vẽ theo thời gian; ghép chồng lịch kỹ thuật của CSKH để thấy
-- ngày nào kín người."
--
-- ── MÚI GIỜ: chỗ dễ sai nhất của cả màn này ────────────────────────────────
-- DB chạy `TimeZone = UTC` (đo prod 25/08). `due_at` là timestamptz. Nên
-- `due_at::date` cho ra NGÀY THEO UTC, lệch 7 tiếng so với ngày người Việt đang
-- nhìn: một việc hạn 02:00 sáng 13/08 giờ VN sẽ rơi vào ô ngày 12 trên lịch.
--
-- Danh sách ở /work đã gom theo giờ ĐỊA PHƯƠNG của trình duyệt (nhomTheoHan ->
-- dauNgay dùng Date của JS). Nên lịch phải gom theo `Asia/Ho_Chi_Minh` cho khớp,
-- không thì cùng một việc nằm hai ngày khác nhau ở hai màn.
--
-- ── Vá kèm: bộ quét bảo trì đặt hạn lệch NGUYÊN MỘT NGÀY ──────────────────
-- `work_06` đặt hạn việc bảo trì là `rec.due_date::timestamptz + interval '17 hours'`.
-- Ý định rõ ràng là "17h chiều ngày tới hạn". Nhưng DB chạy UTC nên
-- `due_date::timestamptz` = nửa đêm UTC = 07:00 giờ VN, cộng 17 tiếng thành
-- 17:00 UTC = **00:00 giờ VN NGÀY HÔM SAU**. Đo trên prod:
--
--     lượt bảo trì tới hạn 12/08  ->  việc có hạn 00:00 ngày 13/08 giờ VN
--
-- Trước đây không ai thấy vì danh sách chỉ hiện "Hôm nay / Ngày mai". Lịch tháng
-- xếp việc vào đúng ô ngày nên phơi ngay ra. Sửa thành 17:00 giờ VN đúng ngày đó.
-- An toàn để sửa lúc này: cả 3 luật đang TẮT và trên prod đang 0 việc tự sinh.
--
-- ── Lớp phủ lịch kỹ thuật: CHỈ ĐẾM, không lấy chi tiết ────────────────────
-- `public.lich_ky_thuat` là bảng của khu CSKH, và hàm đọc nó bên đó đòi quyền
-- `cs.ky_thuat.xep_lich`. Khu Việc chỉ cần biết "ngày này có mấy chuyến" để thấy
-- ngày nào kín người — không cần tên khách, không cần địa chỉ. Nên hàm này trả
-- ĐÚNG một con số mỗi ngày. Không PII đi qua ranh giới module, và người không có
-- quyền CSKH vẫn dùng được màn lịch.
-- ⚠️ Đo prod 25/08: bảng đó mới có **2 dòng**, nên lớp phủ gần như trống. Không
-- phải hỏng — chưa ai xếp lịch kỹ thuật thôi.
-- ============================================================================

create or replace function public.work_lich_thang(
  p_email text, p_thang text, p_chi_toi boolean default true
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_dau date; v_cuoi date; v_hom_nay date;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if p_thang !~ '^\d{4}-\d{2}$' then
    raise exception 'Tháng phải dạng YYYY-MM: %', p_thang;
  end if;

  v_dau     := (p_thang || '-01')::date;
  v_cuoi    := (v_dau + interval '1 month')::date - 1;
  v_hom_nay := (now() at time zone 'Asia/Ho_Chi_Minh')::date;

  return jsonb_build_object(
    -- Việc CÓ hạn rơi trong tháng, kèm sẵn `ngay` đã quy về giờ VN để giao diện
    -- xếp thẳng vào ô, không phải tự suy lại (suy lại là chỗ đẻ ra lệch ngày).
    'viec', (
      select coalesce(jsonb_agg(to_jsonb(v) order by v.ngay, v.priority, v.id), '[]'::jsonb)
      from (
        select t.id, t.ref, t.title, t.status, t.priority, t.due_at,
               (t.due_at at time zone 'Asia/Ho_Chi_Minh')::date as ngay,
               tm.name as team_name, tm.color as team_color,
               work.assignees_json(t.id) as assignees
        from work.task t
        left join work.team tm on tm.id = t.team_id
        where t.duplicate_of is null
          and t.status <> 'cancelled'
          and t.due_at is not null
          and (t.due_at at time zone 'Asia/Ho_Chi_Minh')::date between v_dau and v_cuoi
          and t.id in (select task_id from work.visible_task_ids(v_me))
          and (not p_chi_toi
               or t.creator_id = v_me
               or exists (select 1 from work.task_assignee a
                           where a.task_id = t.id and a.staff_id = v_me))
      ) v),

    -- Lớp phủ: mỗi ngày mấy chuyến kỹ thuật. Chỉ số đếm, xem ghi chú đầu file.
    'tai_ky_thuat', (
      select coalesce(jsonb_object_agg(ngay::text, so), '{}'::jsonb)
      from (select l.ngay, count(*) as so
            from public.lich_ky_thuat l
            where l.ngay between v_dau and v_cuoi
              and coalesce(l.trang_thai,'') <> 'huy'
            group by l.ngay) k),

    -- Việc chưa có hạn: không xếp vào ô nào được, nhưng giấu đi thì nó biến mất
    -- khỏi tầm mắt. Đếm ra để còn biết mà đi đặt hạn.
    'chua_co_han', (
      select count(*) from work.task t
      where t.duplicate_of is null and t.status not in ('done','cancelled')
        and t.due_at is null
        and t.id in (select task_id from work.visible_task_ids(v_me))
        and (not p_chi_toi
             or t.creator_id = v_me
             or exists (select 1 from work.task_assignee a
                         where a.task_id = t.id and a.staff_id = v_me))),

    'hom_nay', v_hom_nay,
    'thang', p_thang
  );
end $$;

revoke execute on function public.work_lich_thang(text, text, boolean) from public;
grant  execute on function public.work_lich_thang(text, text, boolean) to service_role;

-- ── Vá hạn lệch một ngày của bộ quét bảo trì ──────────────────────────────
-- Chỉ đổi ĐÚNG một biểu thức; phần còn lại giữ nguyên bản work_15 (kể cả công tắc chung).
create or replace function work.sinh_viec_tu_erp()
returns table(luat text, da_tao int)
language plpgsql security definer set search_path = '' as $$
declare r work.auto_rule; n int; v_nguoi uuid; rec record;
begin
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
             -- 17:00 GIỜ VN đúng ngày tới hạn. Bản cũ `due_date::timestamptz + 17h`
             -- ra 00:00 giờ VN NGÀY HÔM SAU, vì DB chạy UTC.
             r, ((rec.due_date + time '17:00') at time zone 'Asia/Ho_Chi_Minh'), v_nguoi) is not null
        then n := n + 1; end if;
      end loop;
    end if;

    update work.auto_rule set last_run_at = now(), last_created = n where key = r.key;
    luat := r.key; da_tao := n; return next;
  end loop;
end $$;

notify pgrst, 'reload schema';
