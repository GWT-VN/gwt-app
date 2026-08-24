-- ============================================================================
-- work_14_xoa_hang_loat.sql — xoá nhiều việc, có xác nhận (2026-08-24)
--
-- CEO yêu cầu 24/08: "Edit task hàng loạt cho phép xoá nữa, cần xác nhận lại
-- việc xoá trước khi thực hiện." Và: "hiện tôi đã sinh các task mới làm sao cho
-- tôi xoá hàng loạt."
--
-- work_04 cố ý KHÔNG cho xoá hàng loạt, chỉ cho chuyển 'cancelled', vì xoá thật
-- một mớ việc kèm bình luận và nhật ký là thao tác không có đường lùi. CEO chốt
-- là cần xoá thật. Nên bản này mở cửa đó, nhưng dựng ba lớp chắn quanh nó.
--
-- ── Lớp 1: XEM TRƯỚC đếm đúng thứ sẽ mất, không đếm ước lượng ───────────────
-- Con số quan trọng nhất KHÔNG phải số việc đã chọn, mà là số việc THỰC SỰ mất.
-- `work.task.parent_id` là FK ON DELETE CASCADE: xoá việc cha là việc con chết
-- theo, im lặng, không đếm vào đâu. Chọn 3 việc mà mất 20 là chuyện có thể xảy
-- ra. Nên xem trước phải đệ quy xuống hết nhánh con rồi mới đếm.
-- Bình luận / nhật ký / chip / người làm cũng cascade — đếm luôn để câu xác nhận
-- nói được "mất kèm 12 bình luận", chứ không chỉ "xoá 3 việc?".
--
-- ── Lớp 2: DẤU VÂN — chống danh sách đổi giữa lúc xem trước và lúc bấm ──────
-- Xem trước và xoá là HAI lượt gọi. Giữa hai lượt đó, cron 15 phút có thể sinh
-- thêm việc, người khác có thể thêm việc con vào một việc đang được chọn. Nếu
-- xoá cứ tin danh sách id thì con số CEO vừa đọc không còn là con số sẽ xảy ra.
-- Nên xem trước trả về md5 của (tập id được phép + tập id cascade), và lệnh xoá
-- đòi đúng dấu vân đó. Lệch là từ chối, bắt xem lại — thà làm lại còn hơn xoá
-- nhiều hơn đã hứa.
--
-- ── Lớp 3: cảnh báo VIỆC TỰ SINH sẽ mọc lại ────────────────────────────────
-- Đây là cái bẫy đã dính ngày 20/08: dọn sạch việc tự sinh trên production, cron
-- 15 phút sinh lại y như cũ, vì luật lọc trùng là `not exists (… origin_ref …)`
-- — xoá bản ghi đi là hết dấu, lần quét sau thấy "chưa có" nên tạo lại.
-- Xoá việc tự sinh mà KHÔNG tắt luật là công cốc. Nên xem trước đếm riêng số
-- việc tự sinh và liệt kê luật nào đang BẬT, để câu xác nhận nói thẳng ra.
--
-- QUYỀN: vẫn là work.co_the_sua() cho TỪNG việc — cùng một lằn ranh với sửa,
-- không dựng lằn ranh thứ hai. Việc không có quyền bị bỏ qua và đếm vào bo_qua.
-- Việc CON thì đi theo cha: đã được xoá cha thì con chết theo, không xét riêng
-- (Postgres cascade không hỏi ai cả) — nên xem trước phải nói rõ số đó.
--
-- Trần 200 việc/lượt, bằng work_hang_loat.
-- ============================================================================

-- ── Tập việc sẽ mất thật: gốc được phép xoá + toàn bộ nhánh con ─────────────
-- Tách riêng vì cả xem trước lẫn lệnh xoá đều cần ĐÚNG một luật này.
create or replace function work.tap_xoa(p_me uuid, p_ids bigint[])
returns table(id bigint, la_goc boolean)
language sql stable security definer set search_path = '' as $$
  with recursive duoc_phep as (
    select t.id from work.task t
    where t.id = any(p_ids) and work.co_the_sua(p_me, t.id)
  ),
  ca_nhanh as (
    select d.id from duoc_phep d
    union                                    -- union, không union all: chặn vòng lặp
    select c.id from work.task c join ca_nhanh n on c.parent_id = n.id
  )
  select n.id, (d.id is not null) as la_goc
  from ca_nhanh n left join duoc_phep d on d.id = n.id
$$;

-- ── 1. XEM TRƯỚC ────────────────────────────────────────────────────────────
create or replace function public.work_xem_truoc_xoa(p_email text, p_ids bigint[])
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid; v_goc int; v_tong int; v_con int; v_bo_qua int;
  v_bl int; v_nk int; v_chip int; v_nl int; v_tu_sinh int;
  v_luat text[]; v_dau_van text; v_ids bigint[];
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'Chưa chọn việc nào';
  end if;
  if array_length(p_ids, 1) > 200 then
    raise exception 'Một lượt tối đa 200 việc';
  end if;

  select array_agg(id order by id), count(*), count(*) filter (where la_goc)
    into v_ids, v_tong, v_goc
  from work.tap_xoa(v_me, p_ids);

  v_tong    := coalesce(v_tong, 0);
  v_goc     := coalesce(v_goc, 0);
  v_con     := v_tong - v_goc;
  v_bo_qua  := array_length(p_ids, 1) - v_goc;

  if v_tong = 0 then
    return jsonb_build_object(
      'se_xoa', 0, 'viec_con', 0, 'bo_qua', v_bo_qua,
      'binh_luan', 0, 'nhat_ky', 0, 'chip', 0, 'nguoi_lam', 0,
      'tu_sinh', 0, 'luat_dang_bat', '[]'::jsonb, 'dau_van', null);
  end if;

  select count(*) into v_bl   from work.comment       where task_id = any(v_ids);
  select count(*) into v_nk   from work.activity      where task_id = any(v_ids);
  select count(*) into v_chip from work.task_link     where task_id = any(v_ids);
  select count(*) into v_nl   from work.task_assignee where task_id = any(v_ids);

  -- Việc tự sinh: xoá xong cron sẽ dựng lại nếu luật còn bật.
  select count(*) into v_tu_sinh from work.task
  where id = any(v_ids) and origin = 'auto_erp';

  if v_tu_sinh > 0 then
    select coalesce(array_agg(distinct r.name order by r.name), '{}')
      into v_luat
    from work.auto_rule r
    where r.active
      and exists (
        select 1 from work.task t
        where t.id = any(v_ids) and t.origin = 'auto_erp'
          and split_part(t.origin_ref, ':', 1) = case r.key
                when 'bh_cho_kich_hoat'   then 'serial'
                when 'ticket_khong_nguoi' then 'ticket'
                when 'bao_tri_toi_han'    then 'visit'
              end);
  else
    v_luat := '{}';
  end if;

  v_dau_van := md5(array_to_string(v_ids, ','));

  return jsonb_build_object(
    'se_xoa',        v_tong,
    'viec_con',      v_con,
    'bo_qua',        v_bo_qua,
    'binh_luan',     v_bl,
    'nhat_ky',       v_nk,
    'chip',          v_chip,
    'nguoi_lam',     v_nl,
    'tu_sinh',       v_tu_sinh,
    'luat_dang_bat', to_jsonb(coalesce(v_luat, '{}')),
    'dau_van',       v_dau_van);
end $$;

-- ── 2. XOÁ THẬT — đòi đúng dấu vân của lượt xem trước ───────────────────────
create or replace function public.work_xoa_hang_loat(
  p_email text, p_ids bigint[], p_dau_van text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_me uuid; v_ids bigint[]; v_tong int; v_goc int; v_bo_qua int; v_dau_van text;
begin
  v_me := work.staff_theo_email(p_email);
  if v_me is null then raise exception 'Nhân sự không hợp lệ'; end if;
  if p_dau_van is null or p_dau_van = '' then
    raise exception 'Thiếu bước xác nhận — hãy xem trước rồi xác nhận lại';
  end if;
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'Chưa chọn việc nào';
  end if;
  if array_length(p_ids, 1) > 200 then
    raise exception 'Một lượt tối đa 200 việc';
  end if;

  select array_agg(id order by id), count(*), count(*) filter (where la_goc)
    into v_ids, v_tong, v_goc
  from work.tap_xoa(v_me, p_ids);

  if coalesce(v_tong, 0) = 0 then
    return jsonb_build_object('da_xoa', 0, 'bo_qua', array_length(p_ids, 1));
  end if;

  v_dau_van := md5(array_to_string(v_ids, ','));
  if v_dau_van <> p_dau_van then
    raise exception
      'Danh sách việc đã thay đổi từ lúc xem trước (có thể việc tự sinh vừa chạy, '
      'hoặc ai đó vừa thêm việc con). Hãy xem lại rồi xác nhận lần nữa.';
  end if;

  v_bo_qua := array_length(p_ids, 1) - v_goc;

  -- Xoá GỐC thôi; nhánh con đi theo bằng FK cascade. Xoá cả tập cũng đúng, nhưng
  -- xoá gốc thì đúng một lệnh và không phụ thuộc thứ tự.
  delete from work.task t where t.id = any(p_ids) and work.co_the_sua(v_me, t.id);

  return jsonb_build_object('da_xoa', v_tong, 'bo_qua', v_bo_qua);
end $$;

revoke execute on function public.work_xem_truoc_xoa(text, bigint[]) from public;
revoke execute on function public.work_xoa_hang_loat(text, bigint[], text) from public;
grant  execute on function public.work_xem_truoc_xoa(text, bigint[]) to service_role;
grant  execute on function public.work_xoa_hang_loat(text, bigint[], text) to service_role;

notify pgrst, 'reload schema';
