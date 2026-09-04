-- ═══════════════════════════════════════════════════════════════════════════
-- ke_toan_00_init — Khu Kế toán, lát 1 (spec docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md §5)
-- Cách lùi nếu hỏng: drop schema accounting cascade; drop table public.expense_category;
--   delete from storage.buckets where id='accounting'; tạo lại sync_catalog/replace_catalog_table
--   theo db/cs/migrations/31_fix_replace_catalog_delete_where.sql (whitelist 6 bảng).
-- Nguyên tắc: RLS bật hết, 0 policy — app chỉ đi qua RPC public.ke_toan_* (security definer).
--   FK cứng CHỈ vào public.staff(id); mọi tham chiếu khác là soft ref (text).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists accounting;
comment on schema accounting is 'GWT Kế toán — hoá đơn NEXIA/HDCT, sao kê, luật phân loại. Không expose; truy cập qua RPC public.ke_toan_*.';

-- ── Kỳ tháng ──────────────────────────────────────────────────────────────
create table accounting.periods (
  id                bigint generated always as identity primary key,
  ky                text not null unique check (ky ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  status            text not null default 'dang_xu_ly' check (status in ('dang_xu_ly','da_gui')),
  sent_at           timestamptz,
  sent_by           uuid references public.staff(id),
  edits_after_sent  integer not null default 0,
  created_by        uuid references public.staff(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── File đã upload vào kỳ ────────────────────────────────────────────────
create table accounting.sources (
  id            bigint generated always as identity primary key,
  period_id     bigint not null references accounting.periods(id) on delete cascade,
  kind          text not null check (kind in ('nexia','hdct_vao','hdct_ra','hdtq_vao','hdtq_ra','bank_vcb21','bank_vcb63','bank_tcb')),
  file_name     text not null,
  storage_path  text not null,
  headers       jsonb not null default '{}'::jsonb,   -- {"vao": ["Mẫu số HD", ...], "ra": [...]} theo VỊ TRÍ, kể cả header trùng/rỗng
  row_count     integer not null default 0,
  uploaded_by   uuid references public.staff(id),
  uploaded_at   timestamptz not null default now()
);
create index sources_period_idx on accounting.sources(period_id);

-- ── Dòng hàng hoá đơn ────────────────────────────────────────────────────
create table accounting.invoice_lines (
  id                bigint generated always as identity primary key,
  period_id         bigint not null references accounting.periods(id) on delete cascade,
  direction         text not null check (direction in ('vao','ra')),
  line_key          text not null,          -- sha1(direction|ky_hieu|so_hd|sd(ten_hang)|round(thanh_tien))
  row_order         integer not null,       -- thứ tự trong file nguồn đầu tiên (để xuất lại đúng thứ tự)
  -- 20 cột nghiệp vụ tách riêng để lọc/tìm
  ky_hieu           text, so_hd text, ngay_lap date, mccqt text,
  ten_ban           text, mst_ban text, ten_mua text, mst_mua text,
  ten_hang          text, dvt text, so_luong numeric, don_gia numeric, thue_suat text,
  thanh_tien        numeric, tien_thue numeric, tong_thanh_toan numeric,
  trang_thai        text, tinh_chat text,
  raw               jsonb not null,         -- mảng ô thô theo VỊ TRÍ header của sources.headers
  first_source_id   bigint references accounting.sources(id),
  last_source_id    bigint references accounting.sources(id),
  missing_in_last_upload boolean not null default false,
  -- kết quả engine (không đổi khi người sửa)
  engine_code       text, engine_conf text, engine_reason text, engine_kind text,
  -- giá trị chốt (engine điền lần đầu; người sửa ghi đè)
  code              text, code_name text, tk_no text, tk_co text, vat_1331 text,
  customer_code     text, product_group text, channel_l1 text, channel_l2 text, dealer_name text,
  note_for_accountant text,
  edited_by         uuid references public.staff(id),
  edited_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (period_id, line_key)
);
create index invoice_lines_period_dir_idx on accounting.invoice_lines(period_id, direction, row_order);

-- ── Luật phân loại ────────────────────────────────────────────────────────
create table accounting.rules (
  id           bigint generated always as identity primary key,
  kind         text not null check (kind in ('supplier','keyword','product_name')),
  pattern      text not null,               -- đã chuẩn hoá: supplier/keyword dùng norm() (đ→d), product_name dùng sd() (giữ đ)
  target_code  text not null,
  condition    text,                        -- "Điều kiện tách mã" / "Ngoại lệ" — có → độ tin cậy giảm
  priority     integer not null default 0,  -- thứ tự duyệt trong cùng kind+origin (giữ thứ tự Python)
  origin       text not null check (origin in ('rule_excel','override_json','history','app')),
  created_by   uuid references public.staff(id),
  created_at   timestamptz not null default now(),
  active       boolean not null default true
);
create index rules_kind_active_idx on accounting.rules(kind, active, origin, priority);

-- ── Lịch sử sửa tay (engine học từ đây ở lát 2) ──────────────────────────
create table accounting.corrections (
  id           bigint generated always as identity primary key,
  line_id      bigint not null references accounting.invoice_lines(id) on delete cascade,
  field        text not null,
  old_value    text, new_value text,
  seller_norm  text, desc_norm text,
  "by"         uuid references public.staff(id),
  at           timestamptz not null default now()
);
create index corrections_seller_idx on accounting.corrections(seller_norm);

-- ── Cấu hình khu ──────────────────────────────────────────────────────────
create table accounting.settings (
  key         text primary key,
  value       text,
  updated_by  uuid references public.staff(id),
  updated_at  timestamptz not null default now()
);

-- ── updated_at (tái dùng public.set_updated_at có sẵn trong baseline) ───
create trigger tg_periods_updated_at before update on accounting.periods
  for each row execute function public.set_updated_at();
create trigger tg_invoice_lines_updated_at before update on accounting.invoice_lines
  for each row execute function public.set_updated_at();

-- ── RLS: bật hết, 0 policy; không grant anon/authenticated ───────────────
do $$
declare t text;
begin
  foreach t in array array['periods','sources','invoice_lines','rules','corrections','settings'] loop
    execute format('alter table accounting.%I enable row level security;', t);
  end loop;
end $$;
grant usage on schema accounting to service_role;
grant all on all tables in schema accounting to service_role;
grant all on all sequences in schema accounting to service_role;
alter default privileges for role postgres in schema accounting grant all on tables to service_role;
alter default privileges for role postgres in schema accounting grant all on sequences to service_role;

-- ── Storage bucket riêng tư cho file gốc upload ──────────────────────────
insert into storage.buckets (id, name, public)
values ('accounting', 'accounting', false)
on conflict (id) do nothing;

-- ── Gương expense_category từ Masterdata (24 mã KMCP) ────────────────────
create table if not exists public.expense_category (
  ma             text primary key,
  ten            text,
  dien_giai      text,
  tk_no_default  text,
  trang_thai     text,
  updated_at     timestamptz
);
alter table public.expense_category enable row level security;   -- 0 policy: chỉ service_role
grant select on public.expense_category to service_role;
comment on table public.expense_category is 'GƯƠNG từ GWT-Masterdata (sync_catalog hằng ngày). Không sửa tay ở đây.';

-- Seed 24 mã để local/CI có dữ liệu (live sẽ được sync_catalog ghi đè bằng nguồn thật)
insert into public.expense_category (ma, ten, tk_no_default, trang_thai) values
  ('DVVC','CP vận chuyển','6417','Đang sử dụng'),
  ('cp.642khac','CP khác','6427','Đang sử dụng'),
  ('cp.bank','Chi Phí ngân hàng','6427','Đang sử dụng'),
  ('cp.bhxh','CP bảo hiểm','6421','Đang sử dụng'),
  ('cp.ccdc','CP công cụ dụng cụ','6423','Đang sử dụng'),
  ('cp.congdoan','CP công đoàn','6421','Đang sử dụng'),
  ('cp.congtac','CP công tác','6427','Đang sử dụng'),
  ('cp.dichuyen','CP di chuyển','6427','Đang sử dụng'),
  ('cp.dvkt','CP dịch vụ kế toán','6427','Đang sử dụng'),
  ('cp.freelance','CP thuê ngoài','6427','Đang sử dụng'),
  ('cp.hoahong','CP hoa hồng','6427','Đang sử dụng'),
  ('cp.kiemdinh','CP kiểm định','6427','Đang sử dụng'),
  ('cp.kol','CP KOL','','Đang sử dụng'),
  ('cp.luong','CP lương','6421','Đang sử dụng'),
  ('cp.phucloi','CP phúc lợi','6427','Đang sử dụng'),
  ('cp.qc','CP quảng cáo','6427','Đang sử dụng'),
  ('cp.quatangbh','CP thưởng','','Đang sử dụng'),
  ('cp.shopeemall','CP shoppee','6417','Đang sử dụng'),
  ('cp.tangbh','CP quà tặng bán hàng','6427','Đang sử dụng'),
  ('cp.thuekho','CP thuê kho','6427','Đang sử dụng'),
  ('cp.tiepkhach','CP tiếp khách','6427','Đang sử dụng'),
  ('cp.ttqt','CP thanh toán quốc tế','6417','Đang sử dụng'),
  ('cp.vanhanhchung','CP vận hành chung','6428','Đang sử dụng'),
  ('cp.vattukho','CP vật tư kho','6427','Đang sử dụng')
on conflict (ma) do nothing;

-- Whitelist thêm expense_category (chép nguyên từ 31_fix_replace_catalog_delete_where.sql + 1 tên)
create or replace function public.replace_catalog_table(p_table text, p_rows jsonb)
 returns integer language plpgsql security definer set search_path to 'public'
as $function$
declare v_n integer;
begin
  if p_table not in ('catalog_item','catalog_category','supplier_code',
                     'product_bundle','product_filter','product_warranty','expense_category') then
    raise exception 'Bang khong duoc phep: %', p_table;
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'p_rows rong — tu choi xoa %', p_table;
  end if;
  execute format('delete from public.%I where true', p_table);
  execute format(
    'insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1)',
    p_table, p_table) using p_rows;
  execute format('select count(*) from public.%I', p_table) into v_n;
  return v_n;
end $function$;

-- sync_catalog: thân hàm chép nguyên từ live (pg_get_functiondef 04/09/2026), chỉ đổi v_tables
create or replace function public.sync_catalog()
 returns jsonb language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare
  v_key     text;
  v_base    text := 'https://qynpywysgltspmgnhhga.supabase.co/rest/v1/';
  v_tables  text[] := array['catalog_item','catalog_category','supplier_code',
                            'product_bundle','product_filter','product_warranty','expense_category'];
  v_t       text;
  v_resp    extensions.http_response;
  v_rows    jsonb;
  v_n       int;
  v_result  jsonb := '{}'::jsonb;
  v_ok      boolean := true;
  v_msg     text := '';
  v_started timestamptz := clock_timestamp();
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'masterdata_anon_key';
  if v_key is null then
    raise exception 'Vault secret masterdata_anon_key chua ton tai';
  end if;

  foreach v_t in array v_tables loop
    begin
      v_resp := extensions.http((
        'GET',
        v_base || v_t || '?limit=100000',
        array[ extensions.http_header('apikey', v_key),
               extensions.http_header('Authorization', 'Bearer ' || v_key) ],
        null, null
      )::extensions.http_request);

      if v_resp.status <> 200 then
        v_ok := false;
        v_msg := v_msg || format('%s: HTTP %s; ', v_t, v_resp.status);
        v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('error', 'http ' || v_resp.status));
        continue;
      end if;

      v_rows := v_resp.content::jsonb;
      if v_rows is null or jsonb_typeof(v_rows) <> 'array' or jsonb_array_length(v_rows) = 0 then
        v_ok := false;
        v_msg := v_msg || format('%s: nguon rong (giu nguyen mirror); ', v_t);
        v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('skipped', 'empty'));
        continue;
      end if;

      v_n := public.replace_catalog_table(v_t, v_rows);
      v_result := v_result || jsonb_build_object(v_t, v_n);
    exception when others then
      v_ok := false;
      v_msg := v_msg || format('%s: %s; ', v_t, sqlerrm);
      v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('error', sqlerrm));
    end;
  end loop;

  insert into public.catalog_sync_log(ok, chi_tiet, thong_bao, ms)
  values (v_ok, v_result, nullif(v_msg, ''),
          extract(milliseconds from clock_timestamp() - v_started)::int);

  return jsonb_build_object('ok', v_ok, 'tables', v_result, 'msg', nullif(v_msg, ''));
end $function$;
