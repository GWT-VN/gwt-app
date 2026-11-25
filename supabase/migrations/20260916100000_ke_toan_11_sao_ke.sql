-- ke_toan_11_sao_ke — lát 5: bảng bank_lines (một dòng sao kê), luật bank_keyword trong rules, RPC nhập/liệt kê/sửa sao kê.
-- Cách lùi nếu hỏng: drop function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb), public.ke_toan_sao_ke_list(text,bigint), public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text); drop table accounting.bank_lines; delete from accounting.rules where kind='bank_keyword'; alter table accounting.rules drop constraint rules_kind_check, add constraint rules_kind_check check (kind in ('supplier','keyword','product_name'));

create table accounting.bank_lines (
  id            bigserial primary key,
  period_id     bigint not null references accounting.periods(id) on delete cascade,
  source_id     bigint references accounting.sources(id) on delete set null,
  account       text not null check (account in ('VCB21','VCB63','TCB')),
  line_key      text not null,
  row_order     integer not null,
  txn_date      date not null,
  doc_no        text,
  debit         numeric not null default 0,
  credit        numeric not null default 0,
  balance       numeric,
  description   text,
  counter_name  text,                                   -- TCB: tên tài khoản đối ứng
  direction     text not null check (direction in ('thu','chi')),
  raw           jsonb,
  -- khớp (engine): match_kind pending = chưa xét; invoice = nối hoá đơn (match_id = id dòng đầu nhóm HĐ); none = "không có HĐ"
  match_kind    text not null default 'pending' check (match_kind in ('pending','invoice','none')),
  match_id      bigint,
  match_conf    text check (match_conf in ('chac','goi_y','tay')),
  suggestions   jsonb,                                  -- ≤3 gợi ý [{hoaDonId, soHd, kyHieu, ten, tongTt, canCu}]
  -- chốt
  code          text,                                   -- chi: mã KMCP | 'NOI_BO'; thu: 'BAN_HANG'|'NOI_BO'|'LAI_NH'|'HOAN_TIEN'
  code_name     text,
  party_code    text,                                   -- MST | 'KHL' | 'KHSP' | null
  customer_code text,                                   -- public.customers.customer_code khi tìm được qua SĐT
  has_invoice   boolean,
  note          text,
  engine_reason text,
  edited_by     uuid references public.staff(id),
  edited_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (period_id, line_key)
);
create index bank_lines_period_account_idx on accounting.bank_lines(period_id, account, row_order);
alter table accounting.bank_lines enable row level security;
grant select, insert, update, delete on accounting.bank_lines to service_role;
grant usage, select on sequence accounting.bank_lines_id_seq to service_role;

alter table accounting.rules drop constraint rules_kind_check;
alter table accounting.rules add constraint rules_kind_check check (kind in ('supplier','keyword','product_name','bank_keyword'));

-- Luật sao kê (data, sửa qua DB/lát 7). pattern = norm(nội dung) chứa chuỗi. priority nhỏ = xét trước.
insert into accounting.rules (kind, pattern, target_code, condition, priority, origin, active) values
  ('bank_keyword','facebk','cp.qc',null,10,'app',true),
  ('bank_keyword','luong thang','cp.luong',null,10,'app',true),
  ('bank_keyword','freelancer','cp.freelance',null,10,'app',true),
  ('bank_keyword','bhxh','cp.bhxh',null,10,'app',true),
  ('bank_keyword','kpcd','cp.congdoan',null,10,'app',true),
  ('bank_keyword','cong doan','cp.congdoan',null,10,'app',true),
  ('bank_keyword','thu phi','cp.bank',null,10,'app',true),
  ('bank_keyword','phi qltk','cp.bank',null,10,'app',true),
  ('bank_keyword','nau com','cp.phucloi',null,10,'app',true),
  ('bank_keyword','nextgentax','cp.dvkt',null,10,'app',true),
  ('bank_keyword','van hanh kho','cp.thuekho',null,20,'app',true),
  ('bank_keyword','kiem dinh','cp.kiemdinh',null,20,'app',true),
  ('bank_keyword','chuyen phat','DVVC',null,30,'app',true),
  ('bank_keyword','van chuyen','DVVC',null,40,'app',true);

create or replace function public.ke_toan_sao_ke_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  create temp table tmp_bl on commit drop as
    select * from jsonb_populate_recordset(null::accounting.bank_lines,
      (select coalesce(jsonb_agg((e - 'id' - 'period_id' - 'source_id' - 'edited_by' - 'edited_at' - 'created_at' - 'updated_at')
         || jsonb_build_object('period_id', p_period_id, 'source_id', p_source_id)), '[]'::jsonb)
       from jsonb_array_elements(p_rows) e));
  delete from tmp_bl a using tmp_bl b where a.line_key = b.line_key and a.row_order > b.row_order;

  with up as (
    update accounting.bank_lines l
       set raw = t.raw, row_order = t.row_order, balance = t.balance, description = t.description, counter_name = t.counter_name,
           source_id = p_source_id, updated_at = now(),
           -- kết quả engine chỉ đè khi chưa ai chốt tay
           match_kind = case when l.edited_at is null then t.match_kind else l.match_kind end,
           match_id = case when l.edited_at is null then t.match_id else l.match_id end,
           match_conf = case when l.edited_at is null then t.match_conf else l.match_conf end,
           suggestions = case when l.edited_at is null then t.suggestions else l.suggestions end,
           code = case when l.edited_at is null then t.code else l.code end,
           code_name = case when l.edited_at is null then t.code_name else l.code_name end,
           party_code = case when l.edited_at is null then t.party_code else l.party_code end,
           customer_code = case when l.edited_at is null then t.customer_code else l.customer_code end,
           has_invoice = case when l.edited_at is null then t.has_invoice else l.has_invoice end,
           engine_reason = t.engine_reason
      from tmp_bl t where l.period_id = p_period_id and l.line_key = t.line_key
     returning l.id)
  select count(*) into v_upd from up;

  with ins as (
    insert into accounting.bank_lines (period_id, source_id, account, line_key, row_order, txn_date, doc_no, debit, credit, balance,
      description, counter_name, direction, raw, match_kind, match_id, match_conf, suggestions, code, code_name, party_code,
      customer_code, has_invoice, note, engine_reason)
    select p_period_id, p_source_id, account, line_key, row_order, txn_date, doc_no, debit, credit, balance,
      description, counter_name, direction, raw, coalesce(match_kind, 'pending'), match_id, match_conf, suggestions, code, code_name, party_code,
      customer_code, has_invoice, note, engine_reason
    from tmp_bl t
    where not exists (select 1 from accounting.bank_lines l where l.period_id = p_period_id and l.line_key = t.line_key)
    on conflict (period_id, line_key) do nothing returning id)
  select count(*) into v_ins from ins;
  return jsonb_build_object('inserted', v_ins, 'updated', v_upd);
end $$;

create or replace function public.ke_toan_sao_ke_list(p_email text, p_period_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(l) order by l.account, l.row_order), '[]'::jsonb)
  from accounting.bank_lines l
  where accounting.nv(p_email) is not null and l.period_id = p_period_id;
$$;

create or replace function public.ke_toan_sao_ke_sua(p_email text, p_line_id bigint, p_match_kind text, p_match_id bigint, p_code text, p_code_name text,
  p_party_code text, p_customer_code text, p_has_invoice boolean, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid; v_n int;
begin
  v_nv := accounting.nv(p_email);
  if p_match_kind not in ('pending','invoice','none') then raise exception 'match_kind không hợp lệ'; end if;
  update accounting.bank_lines set match_kind = p_match_kind, match_id = p_match_id, match_conf = 'tay', code = p_code, code_name = p_code_name,
    party_code = p_party_code, customer_code = p_customer_code, has_invoice = p_has_invoice, note = p_note,
    edited_by = v_nv, edited_at = now(), updated_at = now()
  where id = p_line_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'Không thấy dòng sao kê %', p_line_id; end if;
  return jsonb_build_object('ok', true);
end $$;

do $$ begin
  execute 'revoke all on function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb) to service_role';
  execute 'revoke all on function public.ke_toan_sao_ke_list(text,bigint) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_list(text,bigint) to service_role';
  execute 'revoke all on function public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text) to service_role';
end $$;
