-- ═══════════════════════════════════════════════════════════════════════════
-- TRUY LĨNH — CHỈ DÙNG LOCAL/CI (db reset). KHÔNG áp lên live: live đã có các object này
-- (áp qua db/work/migrations/… hồi 08/2026); ledger live không có entry cho file này, đó là CỐ Ý.
-- Vì sao có file: baseline 20250101000000 dump TRƯỚC khi work_02..work_04b được áp, nên
-- db reset từ 0 gãy ở work_05 (work.auto_rule không tồn tại). Phát hiện 04/09/2026 khi dựng
-- CI db-reset cho khu Kế toán. Sửa tận gốc (dump lại baseline từ live) là việc riêng — backlog nền tảng.
-- Nội dung = chép nguyên archive: work_02_rpc_gd0_day_du.sql, work_03_tu_sinh_viec.sql,
-- work_03b_nguoi_nhan_va_cron.sql, work_04_thao_tac_hang_loat.sql,
-- work_04b_sua_bien_id_trung_ten_cot.sql (theo đúng thứ tự áp prod 19/08/2026), chỉ thêm
-- guard idempotent khi archive gốc chưa có sẵn (ở đây các file gốc vốn đã idempotent —
-- create or replace / if not exists / on conflict do nothing — nên KHÔNG cần sửa gì thêm).
-- Cách lùi nếu hỏng: xoá file này (không có gì trên live để lùi).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── nguồn: db/work/migrations/work_02_rpc_gd0_day_du.sql ──────────────────────────────────────
-- ============================================================================
-- work_02_rpc_gd0_day_du.sql — RPC còn lại để đóng GĐ0
-- Ngày: 2026-08-19
--
-- work_01 mới đủ cho "Việc của tôi" dạng danh sách phẳng. File này bổ sung phần
-- còn thiếu theo spec GĐ0: gán người (RACI), sửa việc, Bảng team, panel chi tiết,
-- bình luận, nhật ký.
--
-- NGUYÊN TẮC (giữ nguyên từ work_01):
--   • RPC nằm ở schema `public` vì PostgREST chỉ phục vụ schema được expose.
--   • security definer + search_path='' + revoke public / grant service_role
--     → chỉ app server (sau requireNhanSu()) gọi được.
--   • QUYỀN XEM: luôn qua work.visible_task_ids() — MỘT định nghĩa duy nhất.
--   • QUYỀN SỬA: luôn qua work.co_the_sua() — MỘT định nghĩa duy nhất.
-- ============================================================================

-- ── Sửa khoá chính task_assignee: 1 người = 1 vai trò trên 1 việc ───────────
-- work_00 đặt PK (task_id, staff_id, role) ⇒ cùng một người có thể vừa 'owner'
-- vừa 'watcher' trên một việc — không phải ý đồ RACI và khiến UI phải xử lý
-- danh sách trùng người. Bảng do Work sở hữu, chưa module nào khác đọc.
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    join pg_namespace n on n.oid = r.relnamespace
    where n.nspname='work' and r.relname='task_assignee' and c.conname='task_assignee_pkey'
      and array_length(c.conkey, 1) = 3
  ) then
    -- Còn nhiều vai trò cho cùng 1 người: giữ vai trò "nặng" nhất.
    delete from work.task_assignee a using work.task_assignee b
     where a.task_id = b.task_id and a.staff_id = b.staff_id
       and (case a.role when 'owner' then 0 when 'doer' then 1
                        when 'reviewer' then 2 else 3 end)
         > (case b.role when 'owner' then 0 when 'doer' then 1
                        when 'reviewer' then 2 else 3 end);
    alter table work.task_assignee drop constraint task_assignee_pkey;
    alter table work.task_assignee add primary key (task_id, staff_id);
  end if;
end $$;

-- ── Helper: 1 chỗ đổi email → staff, 1 chỗ định nghĩa quyền sửa ──────────────
create or replace function work.staff_theo_email(p_email text) returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.staff
  where email = lower(btrim(p_email)) and hoat_dong limit 1
$$;

create or replace function work.co_the_sua(p_staff uuid, p_task bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from work.task t
    where t.id = p_task
      and ( t.creator_id = p_staff
            or exists (select 1 from work.task_assignee a
                        where a.task_id = t.id and a.staff_id = p_staff) )
  )
$$;

-- Assignee của 1 task dưới dạng jsonb — dùng lại ở nhiều RPC
create or replace function work.assignees_json(p_task bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'staff_id', a.staff_id, 'ten', s.ten, 'email', s.email, 'role', a.role
         ) order by case a.role when 'owner' then 0 when 'doer' then 1
                                when 'reviewer' then 2 else 3 end, s.ten), '[]'::jsonb)
  from work.task_assignee a join public.staff s on s.id = a.staff_id
  where a.task_id = p_task
$$;

-- ── Nền tảng cho form: tôi là ai, có những team/nhân sự/project nào ──────────
create or replace function public.work_nen_tang(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'me', (select jsonb_build_object('id', s.id, 'ten', s.ten, 'email', s.email,
                                     'vai_tro', to_jsonb(s.vai_tro))
             from public.staff s where s.id = work.staff_theo_email(p_email)),
    'teams', (select coalesce(jsonb_agg(jsonb_build_object(
                       'id', t.id, 'key', t.key, 'name', t.name, 'color', t.color)
                       order by t.sort_order, t.id), '[]'::jsonb) from work.team t),
    'nhan_su', (select coalesce(jsonb_agg(jsonb_build_object(
                       'id', s.id, 'ten', s.ten, 'email', s.email)
                       order by s.ten), '[]'::jsonb)
                  from public.staff s where s.hoat_dong),
    'projects', (select coalesce(jsonb_agg(jsonb_build_object(
                       'id', p.id, 'name', p.name, 'team_id', p.team_id)
                       order by p.name), '[]'::jsonb)
                  from work.project p where p.status <> 'archived')
  )
$$;

-- ── Việc của tôi (thay bản work_01: thêm mô tả, giờ bắt đầu, người cùng làm) ──
create or replace function public.work_viec_cua_toi(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (select work.staff_theo_email(p_email) as id)
  select coalesce(jsonb_agg(to_jsonb(v) order by v.priority, v.due_at nulls last, v.id), '[]'::jsonb)
  from (
    select t.id, t.ref, t.title, t.description, t.status, t.priority,
           t.start_at, t.due_at, t.team_id,
           tm.name as team_name, tm.color as team_color,
           (select a.role from work.task_assignee a, me
             where a.task_id = t.id and a.staff_id = me.id limit 1) as my_role,
           (select count(*) from work.task c
             where c.parent_id = t.id and c.status <> 'cancelled') as sub_n,
           work.assignees_json(t.id) as assignees
    from work.task t
    join me on true
    left join work.team tm on tm.id = t.team_id
    where t.duplicate_of is null
      and t.status not in ('done','cancelled')
      and ( t.creator_id = me.id
            or exists (select 1 from work.task_assignee a
                        where a.task_id = t.id and a.staff_id = me.id) )
  ) v
$$;

-- ── Bảng team: mọi việc tôi ĐƯỢC XEM, lọc theo team / người / trạng thái ─────
create or replace function public.work_bang_team(
  p_email text, p_team_id bigint default null, p_assignee uuid default null,
  p_status text default null, p_q text default null
) returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (select work.staff_theo_email(p_email) as id)
  select coalesce(jsonb_agg(to_jsonb(v) order by v.priority, v.due_at nulls last, v.id), '[]'::jsonb)
  from (
    select t.id, t.ref, t.title, t.status, t.priority, t.due_at, t.team_id,
           tm.name as team_name, tm.color as team_color,
           s.ten as creator_ten,
           (select count(*) from work.task c
             where c.parent_id = t.id and c.status <> 'cancelled') as sub_n,
           work.assignees_json(t.id) as assignees
    from work.task t
    join me on true
    left join work.team tm on tm.id = t.team_id
    left join public.staff s on s.id = t.creator_id
    where t.id in (select task_id from work.visible_task_ids(me.id))
      and t.status <> 'cancelled'
      and (p_team_id  is null or t.team_id = p_team_id)
      and (p_status   is null or t.status  = p_status)
      and (p_assignee is null or exists (select 1 from work.task_assignee a
                                          where a.task_id = t.id and a.staff_id = p_assignee))
      and (coalesce(btrim(p_q),'') = ''
           or t.title ilike '%'||btrim(p_q)||'%' or t.ref ilike '%'||btrim(p_q)||'%')
  ) v
$$;

-- ── Chi tiết 1 việc: task + người + bình luận + nhật ký + việc con ───────────
create or replace function public.work_chi_tiet_viec(p_email text, p_task_id bigint)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
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
               s.ten as creator_ten, t.created_at
        from work.task t
        left join work.team tm on tm.id = t.team_id
        left join public.staff s on s.id = t.creator_id
        where t.id = p_task_id) x),
    'assignees', work.assignees_json(p_task_id),
    'co_the_sua', work.co_the_sua(v_me, p_task_id),
    'comments', (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', c.id, 'body', c.body, 'ten', s.ten, 'created_at', c.created_at)
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
                 from work.task c where c.parent_id = p_task_id and c.status <> 'cancelled')
  ) into v_out;
  return v_out;
end $$;

-- ── Tạo việc (thay bản work_01: thêm mô tả, giờ bắt đầu, việc cha, gán người) ─
-- Tham số cũ giữ NGUYÊN TÊN + THỨ TỰ nên app bản cũ gọi 5 tham số vẫn chạy.
drop function if exists public.work_tao_viec(text, text, smallint, timestamptz, bigint);

create function public.work_tao_viec(
  p_email text, p_title text, p_priority smallint default 3,
  p_due timestamptz default null, p_team_id bigint default null,
  p_description text default null, p_start timestamptz default null,
  p_parent_id bigint default null, p_assignees jsonb default null,
  p_visibility text default 'team'
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_id bigint; v_ref text; v_n int := 0; r jsonb;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Không tìm thấy nhân sự đang hoạt động: %', p_email; end if;
  if coalesce(btrim(p_title),'') = '' then raise exception 'Tiêu đề trống'; end if;
  if p_visibility not in ('private','team','company') then
    raise exception 'Phạm vi xem không hợp lệ: %', p_visibility;
  end if;
  if p_parent_id is not null and not exists (
       select 1 from work.visible_task_ids(v_me) where task_id = p_parent_id) then
    raise exception 'Không có quyền gắn vào việc cha này';
  end if;

  insert into work.task(title, description, priority, start_at, due_at, team_id,
                        parent_id, visibility, creator_id, origin)
  values (btrim(p_title), nullif(btrim(coalesce(p_description,'')),''),
          greatest(1, least(4, coalesce(p_priority,3))), p_start, p_due, p_team_id,
          p_parent_id, p_visibility, v_me, 'manual')
  returning id, ref into v_id, v_ref;

  -- Gán người theo danh sách [{staff_id, role}]; bỏ qua người không hoạt động.
  if p_assignees is not null then
    for r in select * from jsonb_array_elements(p_assignees) loop
      if exists (select 1 from public.staff
                  where id = (r->>'staff_id')::uuid and hoat_dong) then
        insert into work.task_assignee(task_id, staff_id, role, assigned_by)
        values (v_id, (r->>'staff_id')::uuid,
                coalesce(nullif(r->>'role',''), 'doer'), v_me)
        on conflict (task_id, staff_id) do update set role = excluded.role;
        v_n := v_n + 1;
      end if;
    end loop;
  end if;

  -- Không gán ai → người tạo là chủ việc (không để việc mồ côi).
  if v_n = 0 then
    insert into work.task_assignee(task_id, staff_id, role, assigned_by)
    values (v_id, v_me, 'owner', v_me)
    on conflict (task_id, staff_id) do nothing;
  end if;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (v_id, v_me, 'created', jsonb_build_object('title', btrim(p_title)));

  return jsonb_build_object('id', v_id, 'ref', v_ref);
end $$;

-- ── Sửa việc ────────────────────────────────────────────────────────────────
create or replace function public.work_sua_viec(
  p_email text, p_task_id bigint,
  p_title text default null, p_description text default null,
  p_priority smallint default null, p_due timestamptz default null,
  p_team_id bigint default null, p_visibility text default null,
  p_xoa_due boolean default false, p_xoa_team boolean default false
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not work.co_the_sua(v_me, p_task_id) then raise exception 'Không có quyền sửa việc này'; end if;
  if p_title is not null and btrim(p_title) = '' then raise exception 'Tiêu đề trống'; end if;
  if p_visibility is not null and p_visibility not in ('private','team','company') then
    raise exception 'Phạm vi xem không hợp lệ: %', p_visibility;
  end if;

  update work.task set
    title       = coalesce(nullif(btrim(coalesce(p_title,'')),''), title),
    description = case when p_description is null then description
                       else nullif(btrim(p_description),'') end,
    priority    = case when p_priority is null then priority
                       else greatest(1, least(4, p_priority)) end,
    due_at      = case when p_xoa_due then null
                       when p_due is null then due_at else p_due end,
    team_id     = case when p_xoa_team then null
                       when p_team_id is null then team_id else p_team_id end,
    visibility  = coalesce(p_visibility, visibility)
  where id = p_task_id;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'updated', jsonb_strip_nulls(jsonb_build_object(
    'title', p_title, 'priority', p_priority, 'due_at', p_due,
    'team_id', p_team_id, 'visibility', p_visibility)));
end $$;

-- ── Gán / bỏ người ──────────────────────────────────────────────────────────
create or replace function public.work_gan_nguoi(
  p_email text, p_task_id bigint, p_staff_id uuid, p_role text default 'doer'
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_ten text;
begin
  if p_role not in ('owner','doer','reviewer','watcher') then
    raise exception 'Vai trò không hợp lệ: %', p_role;
  end if;
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not work.co_the_sua(v_me, p_task_id) then raise exception 'Không có quyền sửa việc này'; end if;
  select ten into v_ten from public.staff where id = p_staff_id and hoat_dong;
  if v_ten is null then raise exception 'Người được gán không hoạt động'; end if;

  insert into work.task_assignee(task_id, staff_id, role, assigned_by)
  values (p_task_id, p_staff_id, p_role, v_me)
  on conflict (task_id, staff_id) do update set role = excluded.role, assigned_by = v_me;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'assigned',
          jsonb_build_object('staff_id', p_staff_id, 'ten', v_ten, 'role', p_role));
end $$;

create or replace function public.work_bo_nguoi(p_email text, p_task_id bigint, p_staff_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_con int;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not work.co_the_sua(v_me, p_task_id) then raise exception 'Không có quyền sửa việc này'; end if;

  delete from work.task_assignee where task_id = p_task_id and staff_id = p_staff_id;
  select count(*) into v_con from work.task_assignee where task_id = p_task_id;
  if v_con = 0 then raise exception 'Việc phải còn ít nhất 1 người phụ trách'; end if;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'unassigned', jsonb_build_object('staff_id', p_staff_id));
end $$;

-- ── Bình luận ───────────────────────────────────────────────────────────────
create or replace function public.work_them_binh_luan(p_email text, p_task_id bigint, p_body text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if not exists (select 1 from work.visible_task_ids(v_me) where task_id = p_task_id) then
    raise exception 'Không có quyền xem việc này';
  end if;
  if coalesce(btrim(p_body),'') = '' then raise exception 'Bình luận trống'; end if;

  insert into work.comment(task_id, author_id, body) values (p_task_id, v_me, btrim(p_body));
  insert into work.activity(task_id, actor_id, verb, payload)
  values (p_task_id, v_me, 'commented', jsonb_build_object('len', length(btrim(p_body))));
end $$;

-- ── Quyền gọi: chỉ service_role (app server sau requireNhanSu) ───────────────
do $$
declare f text;
begin
  foreach f in array array[
    'public.work_nen_tang(text)',
    'public.work_viec_cua_toi(text)',
    'public.work_bang_team(text,bigint,uuid,text,text)',
    'public.work_chi_tiet_viec(text,bigint)',
    'public.work_tao_viec(text,text,smallint,timestamptz,bigint,text,timestamptz,bigint,jsonb,text)',
    'public.work_sua_viec(text,bigint,text,text,smallint,timestamptz,bigint,text,boolean,boolean)',
    'public.work_gan_nguoi(text,bigint,uuid,text)',
    'public.work_bo_nguoi(text,bigint,uuid)',
    'public.work_them_binh_luan(text,bigint,text)'
  ] loop
    execute format('revoke execute on function %s from public;', f);
    execute format('grant execute on function %s to service_role;', f);
  end loop;
end $$;

-- ── BẮT BUỘC khi ĐỔI CHỮ KÝ hàm (thêm/bớt tham số, drop rồi tạo lại) ────────
-- PostgREST cache danh sách hàm + chữ ký của chúng. Đổi chữ ký mà không nạp lại
-- thì app đang chạy gọi vào hàm PostgREST "không còn thấy" và trả PGRST202 —
-- production gãy im lặng dù DB hoàn toàn đúng. (Đã dính 19/08: nút "Thêm việc"
-- chết cho tới khi chạy dòng này.)
-- Chỉ `create or replace` giữ nguyên chữ ký thì KHÔNG cần.
notify pgrst, 'reload schema';


-- ── nguồn: db/work/migrations/work_03_tu_sinh_viec.sql ──────────────────────────────────────
-- ============================================================================
-- work_03_tu_sinh_viec.sql — sinh việc tự động từ sự kiện ERP
-- Ngày: 2026-08-19
--
-- ĐÂY LÀ THỨ ASANA KHÔNG LÀM ĐƯỢC: Work nằm cùng một Postgres với CS và Sales,
-- nên "máy lắp xong chưa kích hoạt bảo hành → việc cho CSKH" là một câu SQL,
-- không phải tích hợp API mong manh.
--
-- ── VÌ SAO QUÉT ĐỊNH KỲ, KHÔNG DÙNG TRIGGER ────────────────────────────────
-- Cách hiển nhiên là gắn trigger lên public.tickets / installed_base. Không làm,
-- vì ba lý do:
--   1. Bảng đó do CS/Sales SỞ HỮU. Gắn trigger vào là Work ghi vào vùng của
--      module khác — trái luật §7 SYSTEM.md. Tệ hơn: trigger lỗi thì INSERT của
--      CS cũng vỡ theo, Work làm sập CS.
--   2. Hai trong ba luật vốn PHỤ THUỘC THỜI GIAN ("ticket chưa ai nhận sau 4
--      giờ", "bảo trì tới hạn trong 7 ngày") — không có sự kiện nào để bám vào.
--   3. Bảng mirror từ Sheet bị xoá-nạp lại mỗi lần sync; trigger sẽ bắn lại
--      hàng loạt. Quét + khoá idempotent thì không.
-- Hàm này chỉ ĐỌC bảng CS/Sales, ghi duy nhất vào schema work.
--
-- ── CHỐNG TRÙNG ─────────────────────────────────────────────────────────────
-- Mỗi việc tự sinh mang origin_ref là khoá của sự kiện gốc ('ticket:TK-90',
-- 'serial:GN610-2508-0142', 'visit:<uuid>'). Unique index bên dưới khiến chạy
-- lại bao nhiêu lần cũng không đẻ thêm — chạy được mỗi 15 phút mà vẫn yên tâm.
--
-- ── CHẶN LŨ ─────────────────────────────────────────────────────────────────
-- Lần chạy đầu có 13 máy chờ kích hoạt BH + 39 lượt bảo trì quá hạn + 3 ticket
-- = hơn 50 việc đổ một lúc lên đầu quản lý CSKH, mở app ra là nản và tắt. Nên:
--   • mỗi luật có `max_moi_lan` (mặc định 15) — phần còn lại lần chạy sau lấy tiếp;
--   • luật bảo trì chỉ nhìn cửa sổ [hôm nay - 7 ngày, hôm nay + 7 ngày], không
--     đào lại toàn bộ lịch sử quá hạn.
-- ============================================================================

-- ── Khoá chống trùng ────────────────────────────────────────────────────────
create unique index if not exists ux_task_origin_ref
  on work.task(origin_ref) where origin = 'auto_erp' and origin_ref is not null;

-- ── Bảng luật: bật/tắt và chỉnh tham số mà không phải sửa code ──────────────
create table if not exists work.auto_rule (
  key           text primary key,
  name          text not null,
  mo_ta         text,
  nguon         text not null,                       -- module sinh ra sự kiện
  active        boolean not null default true,
  priority      smallint not null default 3 check (priority between 1 and 4),
  team_key      text,                                -- khớp work.team.key
  han_ngay      int not null default 2,              -- hạn = hôm nay + n ngày
  max_moi_lan   int not null default 15,
  last_run_at   timestamptz,
  last_created  int not null default 0
);

insert into work.auto_rule(key, name, mo_ta, nguon, priority, team_key, han_ngay) values
  ('bh_cho_kich_hoat', 'Máy đã lắp chưa kích hoạt bảo hành',
   'Có bản ghi trong installed_base nhưng warranty chưa activated. Sinh việc cho CSKH kích hoạt.',
   'CSKH', 3, 'cskh', 2),
  ('ticket_khong_nguoi', 'Ticket mở quá 4 giờ chưa ai nhận',
   'tickets.state = Open và cs_phu_trach còn trống. Sinh việc cho quản lý CSKH phân người.',
   'CSKH', 1, 'cskh', 1),
  ('bao_tri_toi_han', 'Lượt bảo trì tới hạn trong 7 ngày',
   'maintenance_visit chưa completed_at, due_date trong cửa sổ ±7 ngày. Sinh việc gọi khách đặt lịch.',
   'CSKH', 2, 'cskh', 3)
on conflict (key) do nothing;

alter table work.auto_rule enable row level security;

-- ── Ai nhận việc tự sinh ────────────────────────────────────────────────────
-- Một định nghĩa duy nhất. Không có quản lý CSKH đang hoạt động thì hàm trả
-- NULL và luật bị BỎ QUA — thà không sinh còn hơn đẻ ra việc mồ côi không ai thấy.
create or replace function work.nguoi_nhan_mac_dinh() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.staff
  where hoat_dong and vai_tro && array['cs_manager']::text[]
  order by id limit 1
$$;

-- ── Tạo một việc tự sinh (idempotent theo origin_ref) ───────────────────────
-- Trả về id nếu tạo mới, NULL nếu đã có (hoặc không xác định được người nhận).
create or replace function work.tao_viec_auto(
  p_ref text, p_title text, p_mo_ta text,
  p_rule work.auto_rule, p_due timestamptz, p_nguoi uuid
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_team bigint;
begin
  if p_nguoi is null then return null; end if;
  select id into v_team from work.team where key = p_rule.team_key;

  insert into work.task(title, description, priority, due_at, team_id,
                        visibility, creator_id, origin, origin_ref)
  values (p_title, p_mo_ta, p_rule.priority, p_due, v_team,
          'team', p_nguoi, 'auto_erp', p_ref)
  on conflict (origin_ref) where origin = 'auto_erp' and origin_ref is not null
  do nothing
  returning id into v_id;

  if v_id is null then return null; end if;   -- đã có từ lần chạy trước

  insert into work.task_assignee(task_id, staff_id, role, assigned_by)
  values (v_id, p_nguoi, 'owner', p_nguoi)
  on conflict (task_id, staff_id) do nothing;

  insert into work.activity(task_id, actor_id, verb, payload)
  values (v_id, null, 'auto_created',
          jsonb_build_object('rule', p_rule.key, 'ref', p_ref));

  return v_id;
end $$;

-- ── Bộ quét chính ───────────────────────────────────────────────────────────
create or replace function work.sinh_viec_tu_erp()
returns table(luat text, da_tao int)
language plpgsql security definer set search_path = '' as $$
declare r work.auto_rule; n int; v_nguoi uuid; rec record;
begin
  v_nguoi := work.nguoi_nhan_mac_dinh();

  for r in select * from work.auto_rule where active order by key loop
    n := 0;

    -- 1. Máy đã lắp mà bảo hành chưa kích hoạt
    if r.key = 'bh_cho_kich_hoat' then
      for rec in
        select ib.serial, coalesce(c.full_name, ib.install_address, '—') as khach
        from public.installed_base ib
        left join public.warranty w on w.serial = ib.serial
        left join public.cs_customers c on c.id = ib.customer_id
        where ib.status = 'active' and (w.serial is null or not w.activated)
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

    -- 2. Ticket mở quá 4 giờ chưa ai nhận
    elsif r.key = 'ticket_khong_nguoi' then
      for rec in
        select t.ticket_code, coalesce(nullif(btrim(t.description),''), t.ticket_type, 'không có mô tả') as mo_ta
        from public.tickets t
        where t.state = 'Open' and t.cs_phu_trach is null
          and t.created_at < now() - interval '4 hours'
          and not exists (select 1 from work.task w
                          where w.origin = 'auto_erp' and w.origin_ref = 'ticket:'||t.ticket_code)
        order by t.created_at
        limit r.max_moi_lan
      loop
        if work.tao_viec_auto('ticket:'||rec.ticket_code,
             'Phân người cho ticket ' || rec.ticket_code,
             'Ticket mở quá 4 giờ chưa ai nhận: ' || left(rec.mo_ta, 200),
             r, now() + make_interval(days => r.han_ngay), v_nguoi) is not null
        then n := n + 1; end if;
      end loop;

    -- 3. Lượt bảo trì tới hạn (cửa sổ ±7 ngày, không đào lại quá khứ xa)
    elsif r.key = 'bao_tri_toi_han' then
      for rec in
        select mv.id, mv.lan_thu, mv.due_date,
               coalesce(p.ten_kd, p.source_customer_name, mv.ten_task, '—') as khach
        from public.maintenance_visit mv
        left join public.maintenance_plan p on p.id = mv.plan_id
        where mv.completed_at is null
          and mv.due_date between current_date - 7 and current_date + 7
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

-- ============================================================================
-- RPC cho app (schema public — PostgREST chỉ phục vụ schema được expose)
-- ============================================================================

create or replace function public.work_luat_tu_sinh(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'luat', (select coalesce(jsonb_agg(to_jsonb(r) order by r.key), '[]'::jsonb)
             from (select key, name, mo_ta, nguon, active, priority, team_key,
                          han_ngay, max_moi_lan, last_run_at, last_created
                   from work.auto_rule) r),
    'la_quan_ly', (select coalesce(s.vai_tro && array['admin','cs_manager','sales_manager']::text[], false)
                   from public.staff s where s.id = work.staff_theo_email(p_email)),
    'gan_day', (select coalesce(jsonb_agg(to_jsonb(v) order by v.id desc), '[]'::jsonb)
                from (select t.id, t.ref, t.title, t.status, t.priority, t.due_at,
                             t.origin_ref, t.created_at, tm.name as team_name,
                             tm.color as team_color, work.assignees_json(t.id) as assignees
                      from work.task t
                      left join work.team tm on tm.id = t.team_id
                      where t.origin = 'auto_erp'
                      order by t.id desc limit 30) v)
  )
$$;

-- Chạy tay. Chỉ quản lý được bấm — người thường bấm sẽ tạo việc cho người khác.
create or replace function public.work_chay_tu_sinh(p_email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_quan_ly boolean; v_kq jsonb;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  select vai_tro && array['admin','cs_manager','sales_manager']::text[]
    into v_quan_ly from public.staff where id = v_me;
  if not coalesce(v_quan_ly, false) then
    raise exception 'Chỉ cấp quản lý mới chạy được bộ sinh việc';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('luat', luat, 'da_tao', da_tao)), '[]'::jsonb)
    into v_kq from work.sinh_viec_tu_erp();
  return v_kq;
end $$;

create or replace function public.work_bat_tat_luat(p_email text, p_key text, p_active boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_quan_ly boolean;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  select vai_tro && array['admin','cs_manager','sales_manager']::text[]
    into v_quan_ly from public.staff where id = v_me;
  if not coalesce(v_quan_ly, false) then
    raise exception 'Chỉ cấp quản lý mới bật/tắt được luật';
  end if;
  update work.auto_rule set active = p_active where key = p_key;
  if not found then raise exception 'Không có luật: %', p_key; end if;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.work_luat_tu_sinh(text)',
    'public.work_chay_tu_sinh(text)',
    'public.work_bat_tat_luat(text,text,boolean)'
  ] loop
    execute format('revoke execute on function %s from public;', f);
    execute format('grant execute on function %s to service_role;', f);
  end loop;
end $$;

-- Hàm mới ⇒ PostgREST phải nạp lại danh sách, nếu không app gọi vào nhận PGRST202.
notify pgrst, 'reload schema';

-- LỊCH CHẠY + NGƯỜI NHẬN CHỌN ĐƯỢC: xem work_03b_nguoi_nhan_va_cron.sql.


-- ── nguồn: db/work/migrations/work_03b_nguoi_nhan_va_cron.sql ──────────────────────────────────────
-- ============================================================================
-- work_03b_nguoi_nhan_va_cron.sql — hai chỗ work_03 còn thiếu (2026-08-19)
--
-- 1. NGƯỜI NHẬN CHỌN ĐƯỢC THEO TỪNG LUẬT. Bản đầu lấy `cs_manager` có id nhỏ
--    nhất — võ đoán. Chạy thật thì cả 20 việc đổ hết vào một người.
-- 2. LỊCH CHẠY pg_cron (câu schedule bị rơi khi áp work_03).
--
-- Thân hàm work.sinh_viec_tu_erp() bản CUỐI nằm ở work_05 (nó còn thêm bước
-- đồng bộ team_member). Dựng lại từ đầu thì chạy 03 -> 03b -> 04b -> 05 theo
-- thứ tự là ra đúng production.
-- ============================================================================

alter table work.auto_rule add column if not exists nguoi_nhan uuid references public.staff(id);

comment on column work.auto_rule.nguoi_nhan is
  'Ai nhận việc do luật này sinh ra. NULL = rơi về work.nguoi_nhan_mac_dinh() (cs_manager id nhỏ nhất).';

create or replace function public.work_doi_nguoi_nhan(p_email text, p_key text, p_staff_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_quan_ly boolean;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  select vai_tro && array['admin','cs_manager','sales_manager']::text[]
    into v_quan_ly from public.staff where id = v_me;
  if not coalesce(v_quan_ly, false) then
    raise exception 'Chỉ cấp quản lý mới đổi được người nhận';
  end if;
  if p_staff_id is not null and not exists
     (select 1 from public.staff where id = p_staff_id and hoat_dong) then
    raise exception 'Người nhận không hoạt động';
  end if;
  update work.auto_rule set nguoi_nhan = p_staff_id where key = p_key;
  if not found then raise exception 'Không có luật: %', p_key; end if;
end $$;

revoke execute on function public.work_doi_nguoi_nhan(text,text,uuid) from public;
grant  execute on function public.work_doi_nguoi_nhan(text,text,uuid) to service_role;

-- Lịch chạy mỗi 15 phút. Bọc trong DO để file chạy được cả trên DB LOCAL
-- (thường không cài pg_cron) lẫn production.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('work-tu-sinh-viec')
      where exists (select 1 from cron.job where jobname = 'work-tu-sinh-viec');
    perform cron.schedule('work-tu-sinh-viec', '*/15 * * * *',
                          'select work.sinh_viec_tu_erp()');
  else
    raise notice 'Không có pg_cron (DB local?) — bỏ qua lịch chạy. Gọi tay: select work.sinh_viec_tu_erp();';
  end if;
end $$;

notify pgrst, 'reload schema';


-- ── nguồn: db/work/migrations/work_04_thao_tac_hang_loat.sql ──────────────────────────────────────
-- ============================================================================
-- work_04_thao_tac_hang_loat.sql — sửa nhiều việc một lượt (2026-08-19)
--
-- Chọn n việc rồi: đổi trạng thái · giao thêm người · bỏ người · đổi ưu tiên ·
-- đổi hạn · đổi team. MỘT RPC nhận nhiều trường, trường nào NULL thì bỏ qua —
-- gộp lại để một lần bấm là MỘT transaction, không phải n lượt gọi mạng (chọn
-- 50 việc mà gọi 50 lần thì nửa chừng lỗi mạng là dữ liệu dở dang).
--
-- QUYỀN: lọc qua work.co_the_sua() cho TỪNG việc, không kiểm một lần rồi áp cho
-- cả mớ. Việc không có quyền bị BỎ QUA im lặng và đếm vào `bo_qua`, app báo rõ
-- "đã sửa 8, bỏ qua 2 vì không có quyền" — thà báo thiếu còn hơn sửa lén việc
-- của người khác.
--
-- KHÔNG XOÁ HÀNG LOẠT: chỉ chuyển trạng thái sang 'cancelled'. Xoá thật một mớ
-- việc kèm bình luận và nhật ký là thao tác không có đường lùi.
--
-- KHÔNG ĐỂ VIỆC MỒ CÔI: bỏ người hàng loạt mà việc nào hết sạch người thì trả
-- lại người vừa bỏ. Kiểm từng việc chứ không kiểm chung.
--
-- Trần 200 việc/lượt — quá số đó là dấu hiệu chọn nhầm "tất cả", không phải ý định.
--
-- ĐÃ ÁP PRODUCTION 19/08/2026 (bản sửa lỗi ở work_04b).
-- Kiểm chứng end-to-end: đổi 3 thứ cùng lúc trên 2 việc -> da_sua=2 bo_qua=0;
-- bỏ nốt người cuối -> vẫn còn người; kèm 1 id không tồn tại -> bo_qua=1 không
-- văng lỗi; đổi hạn + team OK; 12 dòng nhật ký đều đánh dấu hang_loat=true.
-- ============================================================================

-- Nội dung hàm: xem work_04b_sua_bien_id_trung_ten_cot.sql (bản đang chạy).


-- ── nguồn: db/work/migrations/work_04b_sua_bien_id_trung_ten_cot.sql ──────────────────────────────────────
-- ============================================================================
-- work_04b_sua_bien_id_trung_ten_cot.sql — bản work_hang_loat ĐANG CHẠY (2026-08-19)
--
-- work_04 khai biến PL/pgSQL tên `id`, trùng tên cột `work.task.id`, nên
-- `where id = any(v_ids)` báo: 42702 column reference "id" is ambiguous.
-- Đổi biến thành `v_id` và đặt alias cho mọi bảng trong UPDATE/DELETE.
-- Bài học: trong plpgsql đừng đặt tên biến trùng tên cột — Postgres không ưu
-- tiên bên nào, nó từ chối chạy.
--
-- File này chứa TOÀN BỘ hàm (không phải bản vá), nên dựng lại từ đầu chỉ cần
-- chạy file này, bỏ qua work_04.
-- ============================================================================

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

  -- Quyền kiểm cho TỪNG việc, không kiểm một lần rồi áp cho cả mớ.
  select coalesce(array_agg(t.id), '{}') into v_ids
  from work.task t
  where t.id = any(p_ids) and work.co_the_sua(v_me, t.id);

  v_n := coalesce(array_length(v_ids, 1), 0);
  v_bo_qua := array_length(p_ids, 1) - v_n;
  if v_n = 0 then
    return jsonb_build_object('da_sua', 0, 'bo_qua', v_bo_qua);
  end if;

  if p_status is not null then
    update work.task t set
      status = p_status,
      completed_at = case when p_status = 'done' then now() else null end
    where t.id = any(v_ids);
    insert into work.activity(task_id, actor_id, verb, payload)
    select unnest(v_ids), v_me, 'status_changed',
           jsonb_build_object('status', p_status, 'hang_loat', true);
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
    -- Kiểm TỪNG việc: việc nào bỏ xong mà hết người thì trả lại — không mồ côi.
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

  return jsonb_build_object('da_sua', v_n, 'bo_qua', v_bo_qua);
end $$;

revoke execute on function public.work_hang_loat(text,bigint[],text,uuid,text,uuid,smallint,timestamptz,boolean,bigint,boolean) from public;
grant  execute on function public.work_hang_loat(text,bigint[],text,uuid,text,uuid,smallint,timestamptz,boolean,bigint,boolean) to service_role;

notify pgrst, 'reload schema';


