-- ═══════════════════════════════════════════════════════════════════════════
-- TRUY LĨNH — CHỈ DÙNG LOCAL/CI (db reset). KHÔNG áp lên live: live đã có các object này
-- (áp qua db/work/migrations/… hồi 08/2026); ledger live không có entry cho file này, đó là CỐ Ý.
-- Vì sao có file: work_13..work_17 (archive khu Việc, áp prod 24/08/2026) chưa từng được
-- chép sang supabase/migrations/ — chỉ work_05..work_12 có mặt ở đó. db reset từ 0 nên thiếu
-- các bản vá quyền/xoá hàng loạt/công tắc cron/việc con/watcher. Phát hiện 04/09/2026 khi dựng
-- CI db-reset cho khu Kế toán. Sửa tận gốc (dump lại baseline từ live) là việc riêng — backlog nền tảng.
-- Nội dung = chép nguyên archive: work_13_quyen_sua_theo_vai_tro.sql, work_14_xoa_hang_loat.sql,
-- work_15_cong_tac_cron.sql, work_16_viec_con_va_phu_thuoc.sql, work_17_watcher_chi_theo_doi.sql
-- (theo đúng thứ tự áp prod 24/08/2026 — 13..17 build trên và override hàm của 05..12 nên phải
-- replay SAU work_12), chỉ thêm guard idempotent khi archive gốc chưa có sẵn (các file gốc vốn
-- đã idempotent — create or replace / if not exists / on conflict do nothing — nên KHÔNG cần
-- sửa gì thêm).
-- Cách lùi nếu hỏng: xoá file này (không có gì trên live để lùi).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── nguồn: db/work/migrations/work_13_quyen_sua_theo_vai_tro.sql ──────────────────────────────────────
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


-- ── nguồn: db/work/migrations/work_14_xoa_hang_loat.sql ──────────────────────────────────────
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


-- ── nguồn: db/work/migrations/work_15_cong_tac_cron.sql ──────────────────────────────────────
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

-- RLS bật, KHÔNG policy nào — đúng khuôn 15 bảng work.* còn lại (đo prod 24/08).
-- Nghĩa là chặn sạch qua PostgREST. App vẫn đọc/ghi bình thường vì chỉ đi qua hàm
-- `security definer`, mà hàm loại đó chạy dưới quyền chủ bảng nên RLS không chặn.
-- Bản thân schema `work` cũng đã không cấp USAGE cho anon/authenticated — đây là
-- lớp thứ hai, cố ý thừa: một ngày nào đó ai lỡ expose schema thì vẫn còn cái này.
alter table work.cai_dat enable row level security;

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


-- ── nguồn: db/work/migrations/work_16_viec_con_va_phu_thuoc.sql ──────────────────────────────────────
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


-- ── nguồn: db/work/migrations/work_17_watcher_chi_theo_doi.sql ──────────────────────────────────────
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
    -- `work.task t` phải đứng LIỀN TRƯỚC left join, rồi mới cross join hai CTE.
    -- Viết `from work.task t, me, q left join …` thì left join chỉ gắn vào `q`,
    -- và `t` không còn nhìn thấy được trong mệnh đề ON (42P01).
    select t.id, t.ref, t.title, t.status, tm.name as team_name
    from work.task t
    left join work.team tm on tm.id = t.team_id
    cross join me
    cross join q
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


