-- ke_toan_09_sua_tay_hoc — lát 2: sửa tay trên ô ghi corrections, engine học từ corrections, Đặt thành luật, Đã gửi kế toán.
-- Cách lùi nếu hỏng: drop function các ke_toan_dong_sua/luat_them/thong_ke_hoc/ky_gui/lich_su_nap; delete from accounting.corrections where origin='history';
--   alter table accounting.corrections drop column origin, alter column line_id set not null.

-- Lịch sử cũ (720 dòng chi phí T1–T6 từ SQLite tool Python) không gắn dòng hoá đơn nào → line_id nullable + cột origin.
alter table accounting.corrections alter column line_id drop not null;
alter table accounting.corrections add column if not exists origin text not null default 'app' check (origin in ('app','history'));
create index if not exists corrections_hoc_idx on accounting.corrections(field, seller_norm) where new_value is not null;

-- Sửa một dòng: ghi giá trị chốt + corrections cho từng trường đổi; kỳ đã gửi thì đếm edits_after_sent (spec §2 #13).
create or replace function public.ke_toan_dong_sua(p_email text, p_line_id bigint, p_code text, p_code_name text, p_tk_no text, p_tk_co text,
  p_note text, p_seller_norm text, p_desc_norm text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_cu accounting.invoice_lines; v_n int := 0; v_sau int := 0;
begin
  select * into v_cu from accounting.invoice_lines where id = p_line_id;
  if not found then raise exception 'Không có dòng %', p_line_id; end if;
  if p_code is distinct from v_cu.code then
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, "by", origin)
      values (p_line_id, 'code', v_cu.code, p_code, p_seller_norm, p_desc_norm, v_nv, 'app');
    v_n := v_n + 1;
  end if;
  if p_note is distinct from v_cu.note_for_accountant then
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, "by", origin)
      values (p_line_id, 'note_for_accountant', v_cu.note_for_accountant, p_note, p_seller_norm, p_desc_norm, v_nv, 'app');
    v_n := v_n + 1;
  end if;
  update accounting.invoice_lines
     set code = p_code, code_name = p_code_name, tk_no = p_tk_no, tk_co = p_tk_co, note_for_accountant = p_note,
         edited_by = v_nv, edited_at = now()
   where id = p_line_id;
  if v_n > 0 then
    update accounting.periods set edits_after_sent = edits_after_sent + 1
     where id = v_cu.period_id and status = 'da_gui'
     returning edits_after_sent into v_sau;
  end if;
  return jsonb_build_object('so_sua', v_n, 'edits_after_sent', coalesce(v_sau, 0));
end $$;

-- Đặt thành luật: luật origin 'app', ưu tiên sau luật app hiện có; trùng (kind, pattern, target, condition) đang active → trả luật cũ.
create or replace function public.ke_toan_luat_them(p_email text, p_kind text, p_pattern text, p_target_code text, p_condition text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  if p_kind not in ('supplier','keyword') then raise exception 'kind phải là supplier hoặc keyword'; end if;
  if length(btrim(p_pattern)) < 3 then raise exception 'pattern quá ngắn (≥ 3 ký tự)'; end if;
  if p_target_code is null or p_target_code = '' then raise exception 'thiếu mã đích'; end if;
  select id into v_id from accounting.rules
   where origin = 'app' and active and kind = p_kind and pattern = btrim(p_pattern) and target_code = p_target_code
     and condition is not distinct from nullif(p_condition, '');
  if v_id is not null then return jsonb_build_object('id', v_id, 'moi', false); end if;
  insert into accounting.rules (kind, pattern, target_code, condition, priority, origin, created_by)
  values (p_kind, btrim(p_pattern), p_target_code, nullif(p_condition, ''),
          (select coalesce(max(priority), -1) + 1 from accounting.rules where origin = 'app'), 'app', v_nv)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'moi', true);
end $$;

-- Thống kê học — ngưỡng chép từ tool Python (engine.py): NCC ≥70% (tối thiểu 1 lần), tiền tố 5 từ diễn giải ≥80% (tối thiểu 2 lần).
create or replace function public.ke_toan_thong_ke_hoc(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with c as (
    select seller_norm, desc_norm, new_value as code from accounting.corrections
    where accounting.nv(p_email) is not null and field = 'code' and coalesce(new_value, '') <> ''
  ),
  ncc as (
    select seller_norm, code, count(*) as n, sum(count(*)) over (partition by seller_norm) as tong
    from c where length(coalesce(seller_norm, '')) >= 6 group by 1, 2
  ),
  ncc_ok as (select distinct on (seller_norm) seller_norm, code from ncc where n::numeric / tong >= 0.7 order by seller_norm, n desc),
  pre as (
    select array_to_string((string_to_array(desc_norm, ' '))[1:5], ' ') as p5, code, count(*) as n,
           sum(count(*)) over (partition by array_to_string((string_to_array(desc_norm, ' '))[1:5], ' ')) as tong
    from c where coalesce(desc_norm, '') <> '' group by 1, 2
  ),
  pre_ok as (select distinct on (p5) p5, code from pre where tong >= 2 and n::numeric / tong >= 0.8 order by p5, n desc)
  select jsonb_build_object(
    'ncc',    coalesce((select jsonb_object_agg(seller_norm, code) from ncc_ok), '{}'::jsonb),
    'prefix', coalesce((select jsonb_object_agg(p5, code) from pre_ok), '{}'::jsonb));
$$;

-- Đã gửi kế toán: đổi trạng thái kỳ; vẫn sửa được sau đó (đếm ở dong_sua).
create or replace function public.ke_toan_ky_gui(p_email text, p_period_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_at timestamptz; v_cb int;
begin
  update accounting.periods set status = 'da_gui', sent_at = now(), sent_by = v_nv
   where id = p_period_id returning sent_at into v_at;
  if v_at is null then raise exception 'Không có kỳ %', p_period_id; end if;
  select count(*) into v_cb from accounting.invoice_lines l
   where l.period_id = p_period_id and l.direction = 'vao' and not l.missing_in_last_upload
     and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro'));
  return jsonb_build_object('status', 'da_gui', 'sent_at', v_at, 'so_canh_bao', v_cb);
end $$;

-- Nạp lịch sử cũ một lần (script tools/scripts/ke_toan_nap_lich_su.py): không gắn dòng, origin 'history'.
create or replace function public.ke_toan_lich_su_nap(p_email text, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform accounting.nv(p_email);
  with ins as (
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, origin)
    select null, 'code', null, r->>'code', r->>'seller_norm', r->>'desc_norm', 'history'
    from jsonb_array_elements(p_rows) r
    where coalesce(r->>'code', '') <> ''
    returning id)
  select count(*) into v_n from ins;
  return jsonb_build_object('inserted', v_n);
end $$;

-- Ruling R1 (task-1-brief, controller): ky_list thêm edits_after_sent cho KyRow (Task 4 cần trường này) — thân hàm
-- chép nguyên từ 20260904040300_ke_toan_03_ky_list_canh_bao_vao.sql, chỉ thêm 1 khoá vào jsonb_build_object.
create or replace function public.ke_toan_ky_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'ky' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', p.id, 'ky', p.ky, 'status', p.status, 'sent_at', p.sent_at, 'cap_nhat', p.updated_at,
      'so_dong_vao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'vao'),
      'so_dong_ra',  (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'ra'),
      'so_canh_bao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id
                        and l.direction = 'vao' and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro'))),
      'edits_after_sent', p.edits_after_sent
    ) x
    from accounting.periods p
    where accounting.nv(p_email) is not null
  ) t;
$$;

do $$
declare f text;
begin
  foreach f in array array['ke_toan_dong_sua(text,bigint,text,text,text,text,text,text,text)',
      'ke_toan_luat_them(text,text,text,text,text)', 'ke_toan_thong_ke_hoc(text)',
      'ke_toan_ky_gui(text,bigint)', 'ke_toan_lich_su_nap(text,jsonb)', 'ke_toan_ky_list(text)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated;', f);
    execute format('grant execute on function public.%s to service_role;', f);
  end loop;
end $$;
