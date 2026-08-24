-- ============================================================================
-- work_13_quyen_sua_theo_vai_tro.sql — quyền SỬA đi theo vai trò (2026-08-24)
--
-- ── Lỗi CEO báo 24/08: kéo thẻ kanban sang cột khác, thả ra KHÔNG có gì xảy ra
-- Tài khoản ai@gwt.vn, vai trò `admin`. Không thấy đổi cột, không thấy đổi
-- trạng thái, không thấy báo lỗi.
--
-- Không phải lỗi kéo-thả. Đo trên production 24/08, gọi thẳng RPC:
--   select public.work_keo_tha('ai@gwt.vn', 34, 'doing', 1000)
--   -> P0001  "Không có quyền với việc này"
--
-- Màn kanban cập nhật LẠC QUAN (đổi trên màn trước, gọi server sau). Server từ
-- chối thì nó nạp lại cho khớp -> thẻ nhảy về chỗ cũ nhanh đến mức nhìn như
-- "không có gì xảy ra". Vậy nên CEO không thấy lỗi: lỗi có, nhưng bị chính cái
-- rollback che đi.
--
-- ── Gốc: work.co_the_sua() không biết vai trò là gì ─────────────────────────
-- Bản đang chạy chỉ có HAI cửa: `creator_id = tôi` HOẶC `tôi là người làm`.
-- Không có tí nào về admin hay quản lý. Đo trên production 24/08:
--
--   Người         vai trò                      sửa được / 38 việc
--   AI            admin                              3          ← CEO
--   Admin         cs, sales                          2
--   bellanguyent  sales                              0
--   Hiền          cs_manager, sales_manager         36
--
-- 35/38 việc là việc tự sinh, mà bộ quét đặt creator = assignee = MỘT người
-- (`work.nguoi_nhan_mac_dinh()` -> Hiền). Nên cả hệ thống thành sở hữu riêng
-- của một người, kể cả admin cũng đứng ngoài.
--
-- Không chỉ kéo thả. TÁM RPC gác bằng co_the_sua(): work_keo_tha, work_sua_viec,
-- work_gan_nguoi, work_bo_nguoi, work_gan_erp, work_bo_erp, work_chi_tiet_viec,
-- work_hang_loat. Việc hàng loạt còn tệ hơn — nó BỎ QUA im lặng và chỉ đếm vào
-- `bo_qua`, nên "sửa 0 việc" nhìn như thao tác chạy xong.
--
-- ── Luật mới, theo đúng mô hình CEO chốt 24/08 ──────────────────────────────
-- CEO: "mô hình phân team tạm thời chưa work do 1 cty nhỏ, 1 nhân sự làm nhiều
-- role có cả cs lẫn sales. Có thể phân team là: CS = ai có vai trò cs, cs manager
-- đều thấy. Tương tự cho sales."
--
-- Quyền XEM đã chạy đúng như vậy từ work_05 (đổ team_member từ staff.vai_tro).
-- Quyền SỬA thì chưa — đây là chỗ vá. Bốn cửa, hễ qua một cửa là sửa được:
--   1. người tạo                     (giữ nguyên)
--   2. người làm                     (giữ nguyên)
--   3. admin                         MỚI — sửa được mọi việc
--   4. thành viên team của việc      MỚI — theo vai_tro, không phải nhập tay
--
-- Cửa 4 bám `work.team_member`, tức bám `staff.vai_tro`: ai có vai trò `cs` hay
-- `cs_manager` thì sửa được việc của team CSKH; `sales`/`sales_manager` thì team
-- Sales. Đúng câu CEO nói, và người kiêm hai vai được cả hai — Admin (cs+sales)
-- có mặt ở cả cskh lẫn sales.
--
-- Việc KHÔNG có team (`team_id is null`) thì cửa 4 không mở: chỉ người tạo,
-- người làm và admin. Không để việc riêng của một người thành việc chung chỉ vì
-- nó chưa được gắn team.
--
-- Cố ý KHÔNG dùng `visibility` để xét quyền sửa. `visibility='company'` nghĩa là
-- cả công ty ĐỌC được, không có nghĩa cả công ty SỬA được. Xem và sửa là hai
-- luật khác nhau; trộn vào nhau là mở cửa rộng hơn ý định.
--
-- ── Vá kèm: dong_bo_team_member() chưa bao giờ RÚT quyền ────────────────────
-- Bản work_05 chỉ THÊM, và chỉ xoá người đã nghỉ. Đổi vai trò thì dòng cũ nằm
-- lại vĩnh viễn. Đo trên production 24/08: Hiền mang vai `cs_manager` +
-- `sales_manager` nhưng có mặt trong BỐN team — còn cả `ky_thuat` và `marketing`,
-- di sản từ hồi tài khoản đó còn là `admin`.
--
-- Trước bản này nó chỉ là quyền XEM rộng quá. Sau bản này cửa 4 biến đúng hai
-- dòng rác đó thành quyền SỬA — nên phải rút cùng lượt, không để lần sau.
--
-- Gộp một chỗ: `work.team_member_can_co()` là định nghĩa DUY NHẤT của "ai đáng
-- lẽ thuộc team nào". Cả THÊM lẫn RÚT đều đọc từ đó, nên hai chiều không thể
-- lệch nhau — lỗi cũ chính là vì luật thêm nằm trong CTE mà luật xoá viết tay
-- riêng.
-- ============================================================================

-- ── 1. Ai đáng lẽ thuộc team nào — MỘT định nghĩa, hai chiều cùng đọc ───────
create or replace function work.team_member_can_co()
returns table(team_id bigint, staff_id uuid)
language sql stable security definer set search_path = '' as $$
  with map(vai, team_key) as (values
    ('cs','cskh'), ('cs_manager','cskh'),
    ('sales','sales'), ('sales_manager','sales'),
    ('ky_thuat','ky_thuat'), ('marketing','marketing')
  )
  select t.id, s.id
  from public.staff s
  join map m on s.vai_tro && array[m.vai]::text[]
  join work.team t on t.key = m.team_key
  where s.hoat_dong
  union
  -- admin có mặt ở mọi team
  select t.id, s.id
  from public.staff s cross join work.team t
  where s.hoat_dong and s.vai_tro && array['admin']::text[]
$$;

comment on function work.team_member_can_co() is
  'Nguồn sự thật: ai thuộc team nào, suy từ staff.vai_tro. dong_bo_team_member() '
  'dùng để THÊM và để RÚT, nên hai chiều không lệch nhau.';

-- ── 2. Đồng bộ hai chiều: thêm người mới VÀ rút người hết lý do ─────────────
create or replace function work.dong_bo_team_member() returns int
language plpgsql security definer set search_path = '' as $$
declare v_them int; v_bo int;
begin
  with them as (
    insert into work.team_member(team_id, staff_id)
    select c.team_id, c.staff_id from work.team_member_can_co() c
    on conflict (team_id, staff_id) do nothing
    returning 1
  )
  select count(*) into v_them from them;

  -- RÚT: nghỉ việc, hoặc đổi vai trò nên không còn thuộc team đó nữa.
  -- Đây là hoà giải TOÀN BỘ bảng, không phải chỉ xoá người đã nghỉ như bản cũ.
  with bo as (
    delete from work.team_member tm
    where not exists (
      select 1 from work.team_member_can_co() c
      where c.team_id = tm.team_id and c.staff_id = tm.staff_id
    )
    returning 1
  )
  select count(*) into v_bo from bo;

  if v_bo > 0 then
    raise notice 'dong_bo_team_member: them %, rut % dong', v_them, v_bo;
  end if;
  return v_them;   -- giữ nguyên nghĩa cũ (số dòng THÊM) để không phá chỗ gọi
end $$;

-- Chạy ngay: dọn dòng rác đang có trên production.
select work.dong_bo_team_member();

-- ── 3. Quyền sửa: bốn cửa ───────────────────────────────────────────────────
create or replace function work.co_the_sua(p_staff uuid, p_task bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from work.task t
    where t.id = p_task
      and (
        -- 1. người tạo
        t.creator_id = p_staff
        -- 2. người làm (bất kể vai owner/doer/reviewer/watcher)
        or exists (select 1 from work.task_assignee a
                   where a.task_id = t.id and a.staff_id = p_staff)
        -- 3. admin — sửa được mọi việc, kể cả việc không có team
        or exists (select 1 from public.staff s
                   where s.id = p_staff and s.hoat_dong
                     and s.vai_tro && array['admin']::text[])
        -- 4. thành viên team của việc, suy từ staff.vai_tro
        --    Việc không có team thì cửa này ĐÓNG (team_id is null -> false).
        or (t.team_id is not null and exists (
              select 1 from work.team_member m
              where m.staff_id = p_staff and m.team_id = t.team_id))
      )
  )
$$;

comment on function work.co_the_sua(uuid, bigint) is
  'Quyền SỬA một việc: người tạo · người làm · admin · thành viên team của việc. '
  'Cố ý không xét visibility — xem được không có nghĩa sửa được.';

notify pgrst, 'reload schema';
