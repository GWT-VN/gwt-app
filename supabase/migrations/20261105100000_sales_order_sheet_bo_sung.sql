-- Ô BỔ SUNG của đơn trên Google Sheet Sales (giao 05/11/2026): SĐT, địa chỉ, tiền cọc, mã vận đơn, quà tặng, ô POE…
-- syncToSupabase (Code.gs) chỉ đẩy cột của TONG_HOP vào sales_order_lines; Apps Script DongBoBoSung.gs (gwt-discord-bot
-- admin/sales/apps-script/) đọc thẳng các tab DON_* và GHI ĐÈ toàn bộ bảng này mỗi lượt tự đồng bộ (dòng đầu mỗi mã đơn).
-- data: khoá trùng tên cột sales_orders (phone, address, tien_coc, so_hd…) để app ghép thẳng. Chỉ service_role đọc/ghi
-- (Apps Script dùng SALES_SUPABASE_SERVICE_KEY; app đọc qua dataClient service role).

create table if not exists public.sales_order_sheet_bo_sung (
  order_code text primary key,
  source_tab text,
  data jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);
comment on table public.sales_order_sheet_bo_sung is 'Ô bổ sung của đơn trên Google Sheet Sales (SĐT, địa chỉ, cọc, ô POE…) — Apps Script DongBoBoSung.gs ghi đè mỗi lượt đồng bộ.';

alter table public.sales_order_sheet_bo_sung enable row level security;   -- không có policy → anon/authenticated không đọc được
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then execute format('revoke all on public.sales_order_sheet_bo_sung from %I', r); end if;
  end loop;
end $$;
