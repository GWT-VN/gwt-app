-- work_18 — Bảng team trả thêm `touched_at` (lần ĐỤNG cuối của việc) cho tab "Lâu không đụng" + cột "Cập nhật" (v2).
-- Cách lùi nếu hỏng: áp lại định nghĩa work_bang_team trong 20260822070325_work_11_keo_tha_kanban.sql (chỉ khác cột
-- touched_at; hàm trả jsonb nên bản cũ của app bỏ qua trường thừa, không cần lùi app).
--
-- touched_at = mốc mới nhất của: task.updated_at (mọi lần sửa dòng việc — trigger touch_updated_at) · nhật ký CÓ người
-- làm (actor_id not null — bỏ việc cron/hệ thống tự ghi như due_soon, không phải người đụng) · bình luận.
-- Chỉ THÊM một cột; ORDER BY, lọc, quyền giữ nguyên như work_11.
create or replace function public.work_bang_team(
  p_email text, p_team_id bigint default null, p_assignee uuid default null,
  p_status text default null, p_q text default null)
returns jsonb
language sql stable security definer set search_path = '' as $$
  with me as (select work.staff_theo_email(p_email) as id)
  select coalesce(jsonb_agg(to_jsonb(v) order by v.priority, v.due_at nulls last, v.id), '[]'::jsonb)
  from (
    select t.id, t.ref, t.title, t.status, t.priority, t.due_at, t.team_id,
           t.sort_order,
           greatest(
             t.updated_at,
             (select max(a.created_at) from work.activity a where a.task_id = t.id and a.actor_id is not null),
             (select max(c.created_at) from work.comment c where c.task_id = t.id)
           ) as touched_at,
           tm.name as team_name, tm.color as team_color,
           s.ten as creator_ten,
           (select count(*) from work.task c
             where c.parent_id = t.id and c.status <> 'cancelled') as sub_n,
           work.assignees_json(t.id) as assignees,
           work.link_json(t.id) as links
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

notify pgrst, 'reload schema';
