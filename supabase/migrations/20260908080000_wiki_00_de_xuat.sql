-- ═══════════════════════════════════════════════════════════════════════════
-- wiki_00_de_xuat — Wiki Training Ingest lát 1 (spec docs/specs/2026-09-08-wiki-training-ingest-design.md §4)
-- Q&A lọc từ 3 kênh Discord training → bảng đề xuất → người duyệt (admin|ceo) trong /wiki → trang
-- Hỏi–đáp động theo khu. Routine cloud chỉ nói chuyện với app qua endpoint (không cầm key DB).
-- Cách lùi nếu hỏng: drop schema wiki cascade; drop function các hàm public.wiki_*.
-- Nguyên tắc: RLS bật hết, 0 policy — app chỉ đi qua RPC public.wiki_* (security definer).
--   Mọi UPDATE có WHERE (PostgREST role authenticator nạp safeupdate — bẫy 9 khu Kế toán).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists wiki;
comment on schema wiki is 'GWT Wiki — đề xuất Q&A từ Discord training, watermark quét, lịch sử run. Không expose; truy cập qua RPC public.wiki_*.';

-- ── Đề xuất Q&A ───────────────────────────────────────────────────────────
create table wiki.proposals (
  id            bigint generated always as identity primary key,
  channel_id    text not null,
  message_id    text not null,                       -- id tin TRẢ LỜI — khoá chống trùng
  thread_id     text,
  question      text not null,
  answer        text not null,
  answered_by   text,                                -- tên hiển thị Discord (nhân viên/CTV) — nội bộ
  answered_at   timestamptz,
  jump_link     text not null,
  source_ids    jsonb not null default '[]'::jsonb,  -- mọi message id gộp thành Q&A này
  khu_goi_y     text,                                -- routine đoán
  khu           text not null check (khu in ('cong-viec-chung','sales','cskh','van-hanh','tai-chinh','kien-thuc-nen','san-pham')),
  confidence    numeric(3,2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  can_pkb       boolean not null default false,      -- Q&A về sản phẩm: không publish, chờ PM đưa vào PKB
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  pii_checked   boolean not null default false,
  reviewed_by   uuid references public.staff(id),
  reviewed_at   timestamptz,
  reject_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (channel_id, message_id),
  check (khu <> 'san-pham' or can_pkb)               -- sản phẩm luôn là can_pkb
);
create index proposals_status_khu_idx on wiki.proposals(status, khu, created_at desc);

-- ── Watermark quét theo kênh ──────────────────────────────────────────────
create table wiki.watermarks (
  channel_id      text primary key,
  last_message_id text not null,
  updated_at      timestamptz not null default now()
);

-- ── Lịch sử run của routine (để màn duyệt hiện "lần quét cuối") ───────────
create table wiki.ingest_runs (
  id          bigint generated always as identity primary key,
  channel_id  text not null,
  received    integer not null default 0,
  inserted    integer not null default 0,
  skipped     integer not null default 0,
  rejected    integer not null default 0,
  at          timestamptz not null default now()
);
create index ingest_runs_channel_idx on wiki.ingest_runs(channel_id, at desc);

-- ── RLS + ACL: chỉ service_role ───────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['proposals','watermarks','ingest_runs'] loop
    execute format('alter table wiki.%I enable row level security;', t);
  end loop;
end $$;
grant usage on schema wiki to service_role;
grant all on all tables in schema wiki to service_role;
grant all on all sequences in schema wiki to service_role;
alter default privileges for role postgres in schema wiki grant all on tables to service_role;
alter default privileges for role postgres in schema wiki grant all on sequences to service_role;

-- ── Gác: mọi nhân sự hoạt động (đọc) / admin|ceo (duyệt) ─────────────────
create or replace function wiki.nv(p_email text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid;
begin
  select s.id into v_id from public.staff s where s.email = lower(btrim(p_email)) and s.hoat_dong limit 1;
  if v_id is null then raise exception 'Không phải nhân sự đang hoạt động' using errcode = '42501'; end if;
  return v_id;
end $$;

create or replace function wiki.nv_duyet(p_email text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid; v_roles text[];
begin
  select s.id, s.vai_tro into v_id, v_roles
    from public.staff s where s.email = lower(btrim(p_email)) and s.hoat_dong limit 1;
  if v_id is null or not (v_roles && array['admin','ceo']) then
    raise exception 'Không có quyền duyệt đề xuất wiki' using errcode = '42501';
  end if;
  return v_id;
end $$;

-- ── RPC cho endpoint (service_role, không p_email — route tự gác bằng bearer) ──
create or replace function public.wiki_ingest_nhan(p_kenh_id text, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_tong int; v_them int;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'p_items phải là mảng'; end if;
  v_tong := jsonb_array_length(p_items);
  with ins as (
    insert into wiki.proposals (channel_id, message_id, thread_id, question, answer, answered_by, answered_at, jump_link,
                                source_ids, khu_goi_y, khu, confidence, can_pkb)
    select p_kenh_id,
           e->>'message_id', nullif(e->>'thread_id',''),
           e->>'cau_hoi', e->>'tra_loi', nullif(e->>'nguoi_tra_loi',''), nullif(e->>'tra_loi_luc','')::timestamptz,
           e->>'jump_link',
           coalesce(e->'nguon_ids', '[]'::jsonb),
           nullif(e->>'khu_goi_y',''),
           case when coalesce(e->>'khu_goi_y','') in ('cong-viec-chung','sales','cskh','van-hanh','tai-chinh','kien-thuc-nen','san-pham')
                then e->>'khu_goi_y' else 'cong-viec-chung' end,
           nullif(e->>'do_tin_cay','')::numeric,
           coalesce(e->>'khu_goi_y','') = 'san-pham'
    from jsonb_array_elements(p_items) e
    on conflict (channel_id, message_id) do nothing
    returning id)
  select count(*) into v_them from ins;
  return jsonb_build_object('them', v_them, 'bo_qua', v_tong - v_them);
end $$;

create or replace function public.wiki_watermark_get() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(w.channel_id, w.last_message_id), '{}'::jsonb) from wiki.watermarks w;
$$;

create or replace function public.wiki_watermark_set(p_kenh_id text, p_message_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  insert into wiki.watermarks (channel_id, last_message_id) values (p_kenh_id, p_message_id)
  on conflict (channel_id) do update set last_message_id = excluded.last_message_id, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.wiki_ingest_run_ghi(p_kenh_id text, p_received int, p_inserted int, p_skipped int, p_rejected int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_id bigint;
begin
  insert into wiki.ingest_runs (channel_id, received, inserted, skipped, rejected)
  values (p_kenh_id, coalesce(p_received,0), coalesce(p_inserted,0), coalesce(p_skipped,0), coalesce(p_rejected,0))
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end $$;

-- ── RPC cho màn duyệt (admin|ceo) ─────────────────────────────────────────
create or replace function public.wiki_de_xuat_list(p_email text, p_status text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('reviewed_by_email', s.email) order by p.created_at desc, p.id desc), '[]'::jsonb)
  from wiki.proposals p left join public.staff s on s.id = p.reviewed_by
  where wiki.nv_duyet(p_email) is not null and p.status = coalesce(p_status, 'pending');
$$;

create or replace function public.wiki_de_xuat_sua(p_email text, p_id bigint, p_question text, p_answer text, p_khu text, p_pii_checked boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := wiki.nv_duyet(p_email); v_n int;
begin
  if coalesce(btrim(p_question),'') = '' or coalesce(btrim(p_answer),'') = '' then raise exception 'Câu hỏi và trả lời không được trống'; end if;
  update wiki.proposals p
     set question = btrim(p_question), answer = btrim(p_answer), khu = p_khu,
         can_pkb = (p_khu = 'san-pham') or p.can_pkb and p_khu = 'san-pham',
         pii_checked = coalesce(p_pii_checked, p.pii_checked), updated_at = now()
   where p.id = p_id and p.status in ('pending','approved');
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'Đề xuất không tồn tại hoặc đã từ chối'; end if;
  return jsonb_build_object('ok', true, 'by', v_nv);
end $$;

create or replace function public.wiki_de_xuat_duyet(p_email text, p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := wiki.nv_duyet(p_email); v_row wiki.proposals;
begin
  select * into v_row from wiki.proposals where id = p_id;
  if v_row.id is null then raise exception 'Đề xuất không tồn tại'; end if;
  if v_row.status <> 'pending' then raise exception 'Chỉ duyệt được đề xuất đang chờ'; end if;
  if v_row.can_pkb then raise exception 'Q&A về sản phẩm không publish ở đây — đưa vào PKB (docs/wiki-cap-nhat.md §2)'; end if;
  if not v_row.pii_checked then raise exception 'Chưa tick "đã rà PII"'; end if;
  update wiki.proposals set status = 'approved', reviewed_by = v_nv, reviewed_at = now(), reject_reason = null, updated_at = now()
   where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.wiki_de_xuat_tu_choi(p_email text, p_id bigint, p_ly_do text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := wiki.nv_duyet(p_email); v_n int;
begin
  update wiki.proposals set status = 'rejected', reviewed_by = v_nv, reviewed_at = now(), reject_reason = nullif(btrim(p_ly_do),''), updated_at = now()
   where id = p_id and status in ('pending','approved');
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'Đề xuất không tồn tại hoặc đã từ chối'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.wiki_lan_quet(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('channel_id', w.channel_id, 'last_message_id', w.last_message_id, 'updated_at', w.updated_at,
           'run', (select to_jsonb(r) from wiki.ingest_runs r where r.channel_id = w.channel_id order by r.at desc limit 1)) order by w.channel_id), '[]'::jsonb)
  from wiki.watermarks w where wiki.nv_duyet(p_email) is not null;
$$;

-- ── RPC cho mọi nhân sự ───────────────────────────────────────────────────
create or replace function public.wiki_de_xuat_dem(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('pending', (select count(*) from wiki.proposals where status = 'pending'))
  where wiki.nv(p_email) is not null;
$$;

create or replace function public.wiki_hoi_dap(p_email text, p_khu text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'question', p.question, 'answer', p.answer, 'answered_by', p.answered_by,
           'answered_at', p.answered_at, 'jump_link', p.jump_link, 'khu', p.khu, 'reviewed_at', p.reviewed_at)
           order by coalesce(p.answered_at, p.created_at) desc, p.id desc), '[]'::jsonb)
  from wiki.proposals p
  where wiki.nv(p_email) is not null and p.status = 'approved' and p.khu = p_khu and not p.can_pkb;
$$;

-- ── Khoá cửa: chỉ service_role gọi được ───────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array['wiki_ingest_nhan(text,jsonb)','wiki_watermark_get()','wiki_watermark_set(text,text)',
      'wiki_ingest_run_ghi(text,int,int,int,int)','wiki_de_xuat_list(text,text)',
      'wiki_de_xuat_sua(text,bigint,text,text,text,boolean)','wiki_de_xuat_duyet(text,bigint)',
      'wiki_de_xuat_tu_choi(text,bigint,text)','wiki_lan_quet(text)','wiki_de_xuat_dem(text)','wiki_hoi_dap(text,text)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated;', f);
    execute format('grant execute on function public.%s to service_role;', f);
  end loop;
  revoke all on function wiki.nv(text) from public, anon, authenticated;
  revoke all on function wiki.nv_duyet(text) from public, anon, authenticated;
  grant execute on function wiki.nv(text) to service_role;
  grant execute on function wiki.nv_duyet(text) to service_role;
end $$;
