-- 20261106171000_video_ban_theo_ma.sql — GWT-App (Supabase bwzmq): số bán THEO MÃ NỘI BỘ THEO NGÀY cho Video Hub (GWT-Marketing-kit GĐ4, cột "Bán 30 ngày").
-- Chỉ TỔNG HỢP (mã, ngày, số lượng, số đơn) — KHÔNG trả khách / SĐT / địa chỉ / giá. Đọc bằng role video_sales_reader (CHỈ execute hàm này).
-- Nguồn: sales_order_lines (mirror Sheet Sales) + sales_orders/sales_order_items (đơn tạo trên app, bỏ đơn đã có trong lines cùng order_code).
-- Loại: tab DON_TANG, dòng quà / bảo trì, dòng 0 đồng, đơn huỷ / hoàn / trả hàng, mã mang cờ "⚠" (chưa chuẩn / nhập nhằng). Khoảng ≤ 400 ngày.
-- Loại huỷ/hoàn theo GIÁ TRỊ CHÍNH XÁC (như v_report_base): 'Huỷ', 'Hủy', 'Hoàn hàng' (FULFILL_OPTS của app; sales_orders.status dùng cùng danh mục), so sánh sau btrim + NFC.
--   KHÔNG dùng regex: 'Hoàn thành (Không lắp)' là đơn hoàn tất, phải được tính.
-- Role video_sales_reader là NOLOGIN — bật LOGIN + mật khẩu làm tay NGOÀI repo lúc áp (như video_index_writer). Không cấp cho service_role (không cần).
-- Trước khi áp — kiểm trên bwzmq (chỉ đọc):
--   1. select fulfillment_status, count(*) from public.sales_order_lines group by 1;  select status, count(*) from public.sales_orders group by 1;  (có biến thể NFD / chữ hoa-thường / khoảng trắng của Huỷ, Hoàn hàng không?)
--   2. đơn trùng order_code giữa sales_orders và lines: so khớp chính xác vs btrim/upper (select count(*) ... on l.order_code = o.order_code  vs  on upper(btrim(l.order_code)) = upper(btrim(o.order_code))).
--   3. tỉ lệ mã mang cờ '⚠': select count(*) filter (where internal_code like '%⚠%'), count(*) from public.sales_order_lines where order_date >= current_date - 60;
--   4. số dòng quantity > 0 mà amount_vat is null (bị loại vì điều kiện amount_vat > 0); số dòng quantity <= 0.
--   5. select distinct source_tab from public.sales_order_lines; (ngoài DON_POE/POU/OTHERS/TANG có gì?)
-- Áp CHỈ khi anh Dũng cho (bwzmq là production Sales + CSKH). Cách lùi: drop function public.video_ban_theo_ma(date, date); drop role video_sales_reader;
create or replace function public.video_ban_theo_ma(p_tu date, p_den date)
returns table (internal_code text, ngay date, so_luong numeric, so_don integer)
language sql stable security definer set search_path = '' as $$
  with dong as (
    select l.internal_code, l.order_date as ngay, l.quantity as sl, l.order_code
    from public.sales_order_lines l
    where l.order_date between p_tu and p_den
      and nullif(btrim(l.internal_code), '') is not null and l.internal_code not like '%⚠%' and coalesce(l.quantity, 0) > 0
      and coalesce(l.source_tab, '') <> 'DON_TANG' and coalesce(l.amount_vat, 0) > 0
      and normalize(btrim(coalesce(l.fulfillment_status, '')), nfc) <> all (array[normalize('Huỷ', nfc), normalize('Hủy', nfc), normalize('Hoàn hàng', nfc)])
    union all
    select i.internal_code, o.order_date, i.quantity, o.order_code
    from public.sales_orders o join public.sales_order_items i on i.order_id = o.order_id
    where o.order_date between p_tu and p_den
      and nullif(btrim(i.internal_code), '') is not null and i.internal_code not like '%⚠%' and coalesce(i.quantity, 0) > 0
      and o.source_tab <> 'DON_TANG' and not coalesce(i.is_gift, false) and not coalesce(i.is_maintenance, false) and coalesce(i.amount_vat, 0) > 0
      and normalize(btrim(coalesce(o.status, '')), nfc) <> all (array[normalize('Huỷ', nfc), normalize('Hủy', nfc), normalize('Hoàn hàng', nfc)])
      and not exists (select 1 from public.sales_order_lines l2 where l2.order_code = o.order_code)
  )
  select btrim(d.internal_code), d.ngay, sum(d.sl), count(distinct d.order_code)::int
  from dong d
  where p_tu <= p_den and p_den - p_tu <= 400
  group by 1, 2
$$;
comment on function public.video_ban_theo_ma(date, date) is 'Video Hub (marketing-kit GĐ4): số bán theo mã nội bộ × ngày, chỉ tổng hợp. Gọi bằng role video_sales_reader.';
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'video_sales_reader') then create role video_sales_reader nologin noinherit; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_auth_members where roleid = 'video_sales_reader'::regrole and member = 'postgres'::regrole and admin_option) then
    execute 'grant video_sales_reader to postgres with admin option';
  end if;
end $$;
alter role video_sales_reader set statement_timeout = '30s';
grant usage on schema public to video_sales_reader;
revoke all on function public.video_ban_theo_ma(date, date) from public, anon, authenticated;
grant execute on function public.video_ban_theo_ma(date, date) to video_sales_reader;
