-- ============================================================================
-- work_16_viec_con_va_phu_thuoc.sql — GĐ1: việc con · phụ thuộc · KPI (24/08/2026)
--
-- Ba món trong "Work — GĐ1 còn nợ", cùng một migration vì cả ba đụng chung một
-- chỗ: điều kiện được phép đánh dấu XONG.
--
-- ── 0. Vá kèm: work_doi_trang_thai vẫn chạy LUẬT QUYỀN CŨ ──────────────────
-- work_13 (24/08) sửa work.co_the_sua() để admin và thành viên team sửa được
-- việc. Nhưng `work_doi_trang_thai` KHÔNG gọi hàm chung — nó có bản kiểm quyền
-- chép tay riêng, đúng hai cửa cũ (người tạo / người làm). Nên bản vá hôm nay
-- trượt qua nó, và đây là RPC bị bấm nhiều nhất khu Việc: nút "✓ Đánh dấu xong"
-- và ô chọn trạng thái ở danh sách.
-- Quét lại toàn bộ (24/08): chỉ mình nó lệch. `work_tao_viec` và
-- `work_them_binh_luan` cũng kiểm tay nhưng dùng `visible_task_ids` — ĐÚNG thiết
-- kế (ai xem được thì bình luận được, gắn việc con vào cha nào mình thấy cũng được),
-- nên để nguyên.
-- Bài học ghi lại: thêm cửa vào co_the_sua() là chưa đủ, phải quét xem còn hàm
-- nào chép tay luật quyền không.
--
-- ── 1. Việc con: tạo ngay trong panel ──────────────────────────────────────
-- `task.parent_id` có từ work_00 và panel đã ĐỌC được việc con, nhưng chưa tạo
-- được — phải sang màn ngoài tạo việc rời rồi sửa cha, không ai làm thế.
-- Việc con KẾ THỪA team + phạm vi xem của cha: việc con của một việc team CSKH
-- mà lại 'private' thì người trong team mở việc cha ra thấy một dòng không bấm
-- được. Kế thừa cho hai bên luôn khớp.
--
-- ── 2. Phụ thuộc: chặn đánh XONG khi việc chặn nó chưa xong ────────────────
-- `work.task_dependency` dựng từ work_00, chưa ai dùng.
-- Chặn ở TẦNG DB chứ không chỉ ẩn nút, vì có ba đường tới trạng thái 'done':
-- ô chọn ở danh sách, nút trong panel, và kéo thẻ vào cột Xong. Gác ở giao diện
-- là phải nhớ gác đủ ba chỗ; gác ở đây thì đường nào cũng qua một cửa.
--
-- Việc chặn đã 'cancelled' thì KHÔNG tính là còn chặn — việc bị huỷ không thể
-- xong được nữa, coi nó là rào vĩnh viễn thì việc kia kẹt mãi.
--
-- CHỐNG VÒNG: A chặn B, B chặn A thì không cái nào xong được, mà cũng chẳng có
-- thông báo nào nói vì sao. Kiểm đệ quy lúc THÊM, chặn ngay từ đầu.
--
-- Hàng loạt thì KHÔNG ném lỗi cả mớ: bỏ qua đúng mấy việc đang bị chặn rồi đếm
-- riêng vào `bi_chan`. Chọn 20 việc mà 2 cái vướng thì vẫn nên làm 18 cái kia —
-- cùng tinh thần với `bo_qua` của quyền.
--
-- ── 3. Ô KPI "Xong tuần này" ───────────────────────────────────────────────
-- Tách RPC riêng trả về một CON SỐ, không nhét vào work_viec_cua_toi. Hàm đó trả
-- mảng việc CHƯA xong; nhét việc đã xong vào là mọi chỗ đếm/lọc/nhóm phía app
-- phải học cách bỏ qua chúng — sửa một chỗ, hỏng năm chỗ.
-- ============================================================================

-- ── Việc nào đang chặn việc này, và chưa xong ──────────────────────────────
create or replace function work.viec_chan_chua_xong(p_task bigint)
returns table(id bigint, ref text, title text, status text)
language sql stable security definer set search_path = '' as $$
  select b.id, b.ref, b.title, b.status
  from work.task_dependency d
  join work.task b on b.id = d.blocked_by_id
  where d.task_id = p_task
    and b.status not in ('done','cancelled')   -- huỷ = hết chặn, xem ghi chú đầu file
  order by b.id
$$;

-- Câu chữ dùng chung cho mọi chỗ từ chối, để ba đường vào nói giống nhau.
create or replace function work.loi_bi_chan(p_task bigint) returns text
language sql stable security definer set search_path = '' as $$
  select case when count(*) = 0 then null else
    'Chưa đánh dấu xong được — còn chờ ' || count(*) || ' việc: ' ||
    string_agg(ref || ' ' || left(title, 40), ' · ')
  end
  from work.viec_chan_chua_xong(p_task)
$$;

-- ── 0. work_doi_trang_thai: dùng luật quyền CHUNG + gác phụ thuộc ──────────
create or replace function public.work_doi_trang_thai(
  p_email text, p_task_id bigint, p_status text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_loi text;
begin
  if p_status not in ('todo','doing','blocked','review','done','cancelled') then
    raise exception 'Trạng thái không hợp lệ: %', p_status;
  end if;
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  -- Trước bản này là luật hai cửa chép tay; nay đi qua hàm chung như 8 RPC kia.
  if not work.co_the_sua(v_me, p_task_id) then
    raise exception 'Không có quyền với việc này';
  end if;

  if p_status = 'done' then
    v_loi := work.loi_bi_chan(p_task_id);
    if v_loi is not null then raise exception '%', v_loi; end if;
  end if;

  update work.task
     set status = p_status,
         completed_at = case when p_status = 'done' then now() else null end
   where id = p_task_id;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'status_changed', jsonb_build_object('status', p_status));
end $$;

-- ── work_keo_tha: thả vào cột Xong cũng phải qua cùng một cửa ──────────────
create or replace function public.work_keo_tha(
  p_email text, p_task_id bigint, p_status text, p_sort_order double precision
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_cu text; v_loi text;
begin
  if p_status not in ('todo','doing','blocked','review','done','cancelled') then
    raise exception 'Trạng thái không hợp lệ: %', p_status;
  end if;
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not work.co_the_sua(v_me, p_task_id) then
    raise exception 'Không có quyền với việc này';
  end if;

  select status into v_cu from work.task where id = p_task_id;

  if p_status = 'done' and v_cu <> 'done' then
    v_loi := work.loi_bi_chan(p_task_id);
    if v_loi is not null then raise exception '%', v_loi; end if;
  end if;

  update work.task
     set status = p_status,
         sort_order = p_sort_order,
         completed_at = case when p_status = 'done' then now() else null end
   where id = p_task_id;

  -- Đổi chỗ trong CÙNG một cột là sắp xếp cá nhân, không ghi nhật ký (ghi thì ngập).
  if v_cu is distinct from p_status then
    insert into work.activity(task_id, actor_id, verb, payload)
    values (p_task_id, v_me, 'status_changed',
            jsonb_build_object('status', p_status, 'keo_tha', true));
  end if;
end $$;

-- ── 1. Tạo việc con ───────────────────────────────────────────────────────
create or replace function public.work_tao_viec_con(
  p_email text, p_parent_id bigint, p_title text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_id bigint; v_ref text; v_team bigint; v_vis text;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if coalesce(btrim(p_title),'') = '' then raise exception 'Tiêu đề trống'; end if;
  -- Sửa được việc cha thì mới thêm việc con vào nó.
  if not work.co_the_sua(v_me, p_parent_id) then
    raise exception 'Không có quyền thêm việc con vào việc này';
  end if;

  -- Kế thừa team + phạm vi xem của cha, xem ghi chú đầu file.
  select team_id, visibility into v_team, v_vis from work.task where id = p_parent_id;

  insert into work.task(title, priority, team_id, parent_id, visibility, creator_id, origin)
  values (btrim(p_title), 3, v_team, p_parent_id, coalesce(v_vis,'team'), v_me, 'manual')
  returning id, ref into v_id, v_ref;

  insert into work.task_assignee(task_id, staff_id, role, assigned_by)
  values (v_id, v_me, 'owner', v_me);

  insert into work.activity(task_id, actor_id, verb, payload)
  values (v_id, v_me, 'created', jsonb_build_object('title', btrim(p_title), 'cha', p_parent_id));
  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_parent_id, v_me, 'subtask_added', jsonb_build_object('id', v_id, 'title', btrim(p_title)));

  return jsonb_build_object('id', v_id, 'ref', v_ref);
end $$;

-- ── 2. Thêm / bỏ phụ thuộc ────────────────────────────────────────────────
create or replace function public.work_them_phu_thuoc(
  p_email text, p_task_id bigint, p_blocked_by_id bigint
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_ref text; v_title text;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if p_task_id = p_blocked_by_id then
    raise exception 'Một việc không thể tự chặn chính nó';
  end if;
  if not work.co_the_sua(v_me, p_task_id) then
    raise exception 'Không có quyền sửa việc này';
  end if;
  -- Việc chặn thì chỉ cần XEM được — nó là việc của người khác, mình không sửa nó.
  if not exists (select 1 from work.visible_task_ids(v_me) where task_id = p_blocked_by_id) then
    raise exception 'Không thấy việc dùng làm việc chặn';
  end if;

  -- Chống vòng: nếu việc-chặn đã (gián tiếp) bị chính việc này chặn thì thêm nữa
  -- là hai bên khoá nhau, không ai xong được và không có gì nói vì sao.
  if exists (
    with recursive xuoi(id) as (
      select p_task_id
      union
      select d.task_id from work.task_dependency d join xuoi x on d.blocked_by_id = x.id
    )
    select 1 from xuoi where id = p_blocked_by_id
  ) then
    raise exception 'Thêm cái này là hai việc khoá vòng nhau — không việc nào xong được';
  end if;

  insert into work.task_dependency(task_id, blocked_by_id, type)
  values (p_task_id, p_blocked_by_id, 'blocks')
  on conflict do nothing;

  select ref, title into v_ref, v_title from work.task where id = p_blocked_by_id;
  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'dependency_added',
          jsonb_build_object('id', p_blocked_by_id, 'ref', v_ref, 'title', v_title));
end $$;

create or replace function public.work_bo_phu_thuoc(
  p_email text, p_task_id bigint, p_blocked_by_id bigint
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_ref text;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not work.co_the_sua(v_me, p_task_id) then
    raise exception 'Không có quyền sửa việc này';
  end if;

  delete from work.task_dependency
  where task_id = p_task_id and blocked_by_id = p_blocked_by_id;

  select ref into v_ref from work.task where id = p_blocked_by_id;
  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'dependency_removed',
          jsonb_build_object('id', p_blocked_by_id, 'ref', v_ref));
end $$;

-- ── 3. Ô KPI "Xong tuần này" ──────────────────────────────────────────────
create or replace function public.work_xong_tuan_nay(p_email text)
returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from work.task t, (select work.staff_theo_email(p_email) as id) me
  where t.duplicate_of is null
    and t.status = 'done'
    and t.completed_at >= now() - interval '7 days'
    and ( t.creator_id = me.id
          or exists (select 1 from work.task_assignee a
                      where a.task_id = t.id and a.staff_id = me.id) )
$$;

revoke execute on function public.work_tao_viec_con(text,bigint,text) from public;
revoke execute on function public.work_them_phu_thuoc(text,bigint,bigint) from public;
revoke execute on function public.work_bo_phu_thuoc(text,bigint,bigint) from public;
revoke execute on function public.work_xong_tuan_nay(text) from public;
grant  execute on function public.work_tao_viec_con(text,bigint,text) to service_role;
grant  execute on function public.work_them_phu_thuoc(text,bigint,bigint) to service_role;
grant  execute on function public.work_bo_phu_thuoc(text,bigint,bigint) to service_role;
grant  execute on function public.work_xong_tuan_nay(text) to service_role;

notify pgrst, 'reload schema';

-- ── Panel đọc được phụ thuộc: việc CHẶN nó, và việc nó ĐANG CHẶN ───────────
-- Trả cả hai chiều. Chỉ trả chiều "bị chặn" thì gỡ một việc ra khỏi kế hoạch là
-- không biết mình đang làm kẹt ai — mà đó mới là thứ cần biết trước khi hoãn.
create or replace function public.work_chi_tiet_viec(p_email text, p_task_id bigint)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_out jsonb;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not exists (select 1 from work.visible_task_ids(v_me) where task_id = p_task_id) then
    raise exception 'Không có quyền xem việc này';
  end if;

  select jsonb_build_object(
    'task', (select to_jsonb(x) from (
        select t.id, t.ref, t.title, t.description, t.status, t.priority, t.visibility,
               t.start_at, t.due_at, t.completed_at, t.team_id, t.parent_id, t.origin,
               tm.name as team_name, tm.color as team_color,
               s.ten as creator_ten, t.created_at,
               pt.ref as parent_ref, pt.title as parent_title
        from work.task t
        left join work.team tm on tm.id = t.team_id
        left join public.staff s on s.id = t.creator_id
        left join work.task pt on pt.id = t.parent_id
        where t.id = p_task_id) x),
    'assignees', work.assignees_json(p_task_id),
    'co_the_sua', work.co_the_sua(v_me, p_task_id),
    'links', work.link_json(p_task_id),
    'comments', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', c.id, 'body', c.body, 'ten', s.ten, 'created_at', c.created_at,
                   'nhac_ten', (select coalesce(jsonb_agg(s2.ten), '[]'::jsonb)
                                from public.staff s2 where s2.id = any(c.mentions)))
                   order by c.created_at), '[]'::jsonb)
                 from work.comment c left join public.staff s on s.id = c.author_id
                 where c.task_id = p_task_id),
    'activity', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', a.id, 'verb', a.verb, 'payload', a.payload,
                   'ten', s.ten, 'created_at', a.created_at)
                   order by a.created_at desc), '[]'::jsonb)
                 from work.activity a left join public.staff s on s.id = a.actor_id
                 where a.task_id = p_task_id),
    'subtasks', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', c.id, 'ref', c.ref, 'title', c.title, 'status', c.status)
                   order by c.id), '[]'::jsonb)
                 from work.task c where c.parent_id = p_task_id and c.status <> 'cancelled'),
    -- Việc đang CHẶN việc này (phải xong trước)
    'chan_boi', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', b.id, 'ref', b.ref, 'title', b.title, 'status', b.status)
                   order by b.id), '[]'::jsonb)
                 from work.task_dependency d join work.task b on b.id = d.blocked_by_id
                 where d.task_id = p_task_id),
    -- Việc mà việc này đang CHẶN (mình chậm là họ kẹt)
    'dang_chan', (select coalesce(jsonb_agg(jsonb_build_object(
                    'id', b.id, 'ref', b.ref, 'title', b.title, 'status', b.status)
                    order by b.id), '[]'::jsonb)
                  from work.task_dependency d join work.task b on b.id = d.task_id
                  where d.blocked_by_id = p_task_id)
  ) into v_out;
  return v_out;
end $$;

-- ── Hàng loạt: bỏ qua việc đang bị chặn thay vì ném lỗi cả mớ ──────────────
-- Chọn 20 việc mà 2 cái vướng thì vẫn nên làm 18 cái kia — cùng tinh thần với
-- `bo_qua` của quyền. Đếm riêng vào `bi_chan` để thông báo nói đúng chuyện gì đã xảy ra.
create or replace function public.work_hang_loat(
  p_email      text,
  p_ids        bigint[],
  p_status     text     default null,
  p_gan_ai     uuid     default null,
  p_gan_vai    text     default 'doer',
  p_bo_ai      uuid     default null,
  p_priority   smallint default null,
  p_due        timestamptz default null,
  p_xoa_due    boolean  default false,
  p_team_id    bigint   default null,
  p_xoa_team   boolean  default false
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid; v_ids bigint[]; v_n int; v_bo_qua int; v_ten text; v_id bigint;
  v_ids_status bigint[]; v_bi_chan int := 0;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'Chưa chọn việc nào';
  end if;
  if array_length(p_ids, 1) > 200 then
    raise exception 'Một lượt tối đa 200 việc';
  end if;
  if p_status is not null and p_status not in
     ('todo','doing','blocked','review','done','cancelled') then
    raise exception 'Trạng thái không hợp lệ: %', p_status;
  end if;
  if p_gan_ai is not null and p_gan_vai not in ('owner','doer','reviewer','watcher') then
    raise exception 'Vai trò không hợp lệ: %', p_gan_vai;
  end if;

  select coalesce(array_agg(t.id), '{}') into v_ids
  from work.task t
  where t.id = any(p_ids) and work.co_the_sua(v_me, t.id);

  v_n := coalesce(array_length(v_ids, 1), 0);
  v_bo_qua := array_length(p_ids, 1) - v_n;
  if v_n = 0 then
    return jsonb_build_object('da_sua', 0, 'bo_qua', v_bo_qua, 'bi_chan', 0);
  end if;

  if p_status is not null then
    v_ids_status := v_ids;
    if p_status = 'done' then
      -- Lọc riêng cho nhánh trạng thái; mấy nhánh kia (ưu tiên, hạn, người…)
      -- không liên quan tới phụ thuộc nên vẫn áp cho đủ v_ids.
      select coalesce(array_agg(x), '{}') into v_ids_status
      from unnest(v_ids) x
      where not exists (select 1 from work.viec_chan_chua_xong(x));
      v_bi_chan := v_n - coalesce(array_length(v_ids_status, 1), 0);
    end if;

    if coalesce(array_length(v_ids_status, 1), 0) > 0 then
      update work.task t set
        status = p_status,
        completed_at = case when p_status = 'done' then now() else null end
      where t.id = any(v_ids_status);
      insert into work.activity(task_id, actor_id, verb, payload)
      select unnest(v_ids_status), v_me, 'status_changed',
             jsonb_build_object('status', p_status, 'hang_loat', true);
    end if;
  end if;

  if p_priority is not null or p_due is not null or p_xoa_due
     or p_team_id is not null or p_xoa_team then
    update work.task t set
      priority = case when p_priority is null then t.priority
                      else greatest(1, least(4, p_priority)) end,
      due_at   = case when p_xoa_due then null
                      when p_due is null then t.due_at else p_due end,
      team_id  = case when p_xoa_team then null
                      when p_team_id is null then t.team_id else p_team_id end
    where t.id = any(v_ids);
    insert into work.activity(task_id, actor_id, verb, payload)
    select unnest(v_ids), v_me, 'updated', jsonb_strip_nulls(jsonb_build_object(
      'priority', p_priority, 'due_at', p_due, 'team_id', p_team_id, 'hang_loat', true));
  end if;

  if p_gan_ai is not null then
    select s.ten into v_ten from public.staff s where s.id = p_gan_ai and s.hoat_dong;
    if v_ten is null then raise exception 'Người được gán không hoạt động'; end if;
    insert into work.task_assignee(task_id, staff_id, role, assigned_by)
    select unnest(v_ids), p_gan_ai, p_gan_vai, v_me
    on conflict (task_id, staff_id) do update
      set role = excluded.role, assigned_by = v_me;
    insert into work.activity(task_id, actor_id, verb, payload)
    select unnest(v_ids), v_me, 'assigned',
           jsonb_build_object('staff_id', p_gan_ai, 'ten', v_ten,
                              'role', p_gan_vai, 'hang_loat', true);
  end if;

  if p_bo_ai is not null then
    foreach v_id in array v_ids loop
      delete from work.task_assignee a where a.task_id = v_id and a.staff_id = p_bo_ai;
      if not exists (select 1 from work.task_assignee a where a.task_id = v_id) then
        insert into work.task_assignee(task_id, staff_id, role, assigned_by)
        values (v_id, p_bo_ai, 'owner', v_me);
      else
        insert into work.activity(task_id, actor_id, verb, payload)
        values (v_id, v_me, 'unassigned',
                jsonb_build_object('staff_id', p_bo_ai, 'hang_loat', true));
      end if;
    end loop;
  end if;

  return jsonb_build_object(
    'da_sua', case when p_status is not null and p_status = 'done'
                   then coalesce(array_length(v_ids_status, 1), 0) else v_n end,
    'bo_qua', v_bo_qua,
    'bi_chan', v_bi_chan);
end $$;

notify pgrst, 'reload schema';
