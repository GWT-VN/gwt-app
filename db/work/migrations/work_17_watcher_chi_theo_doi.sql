-- ============================================================================
-- work_17_watcher_chi_theo_doi.sql — "Theo dõi" là XEM, không phải SỬA (24/08/2026)
--
-- CEO báo 24/08: *"admin vẫn đánh dấu được task test của AI (admin chỉ là theo
-- dõi) là xong => fail"*.
--
-- Đúng. `work.co_the_sua()` cửa 2 viết là "người làm, BẤT KỂ vai owner/doer/
-- reviewer/watcher". Gộp `watcher` vào đó là sai từ tên gọi: vai đó tên là
-- **Theo dõi**, nghĩa của nó là đứng xem cho biết, không phải được đụng vào.
--
-- ── Vì sao chuyện này nguy hơn nó trông ────────────────────────────────────
-- `watcher` KHÔNG chỉ do người ta tự chọn. work_12 (nhắc người bằng @tên) kéo
-- người được nhắc vào việc với đúng vai `watcher`, để việc hiện trong "Việc của
-- tôi" của họ. Nên trước bản vá này:
--
--     nhắc @Hiền trong một bình luận  ⇒  Hiền có quyền SỬA việc đó
--
-- Nhắc tên là hành vi xã giao, không ai coi đó là cấp quyền. Đây là leo thang
-- quyền thật, chỉ là chưa ai bấm trúng.
--
-- ── Luật sau bản vá ───────────────────────────────────────────────────────
--   owner · doer      — người làm việc đó                     → SỬA
--   reviewer          — phải bật/tắt được 'Chờ duyệt' ↔ 'Xong' → SỬA
--   watcher           — theo dõi                               → CHỈ XEM
--
-- Ba cửa còn lại giữ nguyên: người tạo · admin · thành viên team của việc
-- (CEO chốt 24/08 giữ cửa team: công ty 5 người, ai cũng đỡ được việc của nhau).
--
-- Watcher vẫn XEM được đầy đủ và vẫn BÌNH LUẬN được — hai đường đó đi qua
-- `work.visible_task_ids()`, không đụng hàm này.
-- ============================================================================

create or replace function work.co_the_sua(p_staff uuid, p_task bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from work.task t
    where t.id = p_task
      and (
        -- 1. người tạo
        t.creator_id = p_staff
        -- 2. người làm THẬT SỰ. 'watcher' bị loại: vai đó tên là "Theo dõi",
        --    và @nhắc-tên tự gán vai này nên gộp vào đây là nhắc ai cũng thành
        --    cấp quyền cho người đó.
        or exists (select 1 from work.task_assignee a
                   where a.task_id = t.id and a.staff_id = p_staff
                     and a.role in ('owner','doer','reviewer'))
        -- 3. admin
        or exists (select 1 from public.staff s
                   where s.id = p_staff and s.hoat_dong
                     and s.vai_tro && array['admin']::text[])
        -- 4. thành viên team của việc (CEO chốt giữ, 24/08)
        or (t.team_id is not null and exists (
              select 1 from work.team_member m
              where m.staff_id = p_staff and m.team_id = t.team_id))
      )
  )
$$;

comment on function work.co_the_sua(uuid, bigint) is
  'Quyền SỬA: người tạo · người làm (owner/doer/reviewer — KHÔNG tính watcher) · '
  'admin · thành viên team của việc. Watcher chỉ xem và bình luận.';

-- ── Ô KPI "Xong tuần này" phải BẤM ĐƯỢC như ba ô kia ──────────────────────
-- CEO 24/08: *"Xong tuần này nhìn thấy nhưng ko click vào đc"*. Trước đó nó trả
-- về một CON SỐ nên bấm vào chẳng có gì để hiện. Nay trả về đúng danh sách việc,
-- app tự đếm — bấm vào là lọc xuống mấy việc đó, đồng nhất với 3 ô còn lại.
drop function if exists public.work_xong_tuan_nay(text);

create or replace function public.work_xong_tuan_nay(p_email text)
returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (select work.staff_theo_email(p_email) as id)
  select coalesce(jsonb_agg(to_jsonb(v) order by v.completed_at desc), '[]'::jsonb)
  from (
    select t.id, t.ref, t.title, t.description, t.status, t.priority,
           t.start_at, t.due_at, t.completed_at, t.team_id,
           tm.name as team_name, tm.color as team_color,
           (select a.role from work.task_assignee a, me
             where a.task_id = t.id and a.staff_id = me.id limit 1) as my_role,
           (select count(*) from work.task c
             where c.parent_id = t.id and c.status <> 'cancelled') as sub_n,
           work.assignees_json(t.id) as assignees,
           work.link_json(t.id) as links
    from work.task t
    join me on true
    left join work.team tm on tm.id = t.team_id
    where t.duplicate_of is null
      and t.status = 'done'
      and t.completed_at >= now() - interval '7 days'
      and ( t.creator_id = me.id
            or exists (select 1 from work.task_assignee a
                        where a.task_id = t.id and a.staff_id = me.id) )
  ) v
$$;

-- ── Tìm việc để gắn phụ thuộc ─────────────────────────────────────────────
-- work_16 làm được RPC thêm/bỏ phụ thuộc và panel HIỆN được, nhưng quên mất ô
-- để CHỌN việc chặn — nên tính năng chỉ dùng được bằng SQL. Đây là cái ô đó.
--
-- Chỉ tìm trong việc người này XEM được, và bỏ chính nó ra. Bỏ luôn việc đã
-- xong/huỷ: lấy một việc đã xong làm "việc chặn" thì nó không chặn được gì.
create or replace function public.work_tim_viec(
  p_email text, p_q text, p_tru_id bigint default null
) returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (select work.staff_theo_email(p_email) as id),
  q as (select '%' || public.khong_dau(btrim(coalesce(p_q,''))) || '%' as k)
  select coalesce(jsonb_agg(to_jsonb(v) order by v.id desc), '[]'::jsonb)
  from (
    select t.id, t.ref, t.title, t.status, tm.name as team_name
    from work.task t, me, q
    left join work.team tm on tm.id = t.team_id
    where t.id in (select task_id from work.visible_task_ids(me.id))
      and (p_tru_id is null or t.id <> p_tru_id)
      and t.status not in ('done','cancelled')
      and length(btrim(coalesce(p_q,''))) >= 2
      and (public.khong_dau(t.title) ilike q.k or t.ref ilike q.k)
    order by t.id desc
    limit 12
  ) v
$$;

revoke execute on function public.work_tim_viec(text, text, bigint) from public;
grant  execute on function public.work_tim_viec(text, text, bigint) to service_role;
revoke execute on function public.work_xong_tuan_nay(text) from public;
grant  execute on function public.work_xong_tuan_nay(text) to service_role;

notify pgrst, 'reload schema';
