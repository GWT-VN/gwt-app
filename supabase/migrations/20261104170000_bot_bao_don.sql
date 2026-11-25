-- Hợp thức hoá (truy lĩnh) hàm DB của bot báo đơn — ledger live đã có entry 20261104170000_bot_bao_don
-- nhưng statements = null (stub), repo chưa từng có file → db reset gãy ở 20261120090000_bot_dau_van_tay
-- ("function public.bot_ds_don(date) does not exist").
-- Nội dung chép từ pg_get_functiondef trên live GWT-SalesTracking (bwzmqfbcgouhvhoslmmm) ngày 25/11/2026;
-- md5(prosrc) live: bot_ds_don 36087a9069ae4a03d93d83bb243863bf, bot_ds_don_app b8a54c892badca49b0e04b68882810b3.
-- Quyền = proacl live: chỉ postgres, service_role, kho_bot_serial (role tạo ở 20261104110000_kho_bot_serial).
-- Người gọi: bot báo đơn (gwt-discord-bot), role DB kho_bot_serial.
--
-- Trên live mọi object đã có → KHÔNG áp lại (áp lại vô hại: create or replace y hệt).
-- Cách lùi nếu hỏng: (DB dựng mới) drop function public.bot_ds_don(date), public.bot_ds_don_app().

CREATE OR REPLACE FUNCTION public.bot_ds_don(p_tu_ngay date)
 RETURNS TABLE(order_code text, nguon text, source_tab text, order_date date, channel text, channel_detail text, customer_name text, province text, so_dong integer, tong_vat numeric, san_pham text, nguoi_tao text, tao_luc timestamp with time zone, tinh_trang_hang text, thanh_toan text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with dau as (
    select distinct on (l.order_code) l.* from sales_order_lines l
     where l.order_code is not null and l.order_date >= p_tu_ngay
     order by l.order_code, l.id
  ), gom as (
    select l.order_code, count(*)::int so_dong, sum(coalesce(l.amount_vat, 0)) tong_vat, max(l.synced_at) synced_at,
           string_agg(coalesce(nullif(l.product_name, ''), nullif(l.internal_code, ''), l.product_code, '?') || ' ×' || trim(to_char(coalesce(l.quantity, 0), 'FM999999990.##')), ', ' order by l.id) san_pham
      from sales_order_lines l join dau d on d.order_code = l.order_code
     group by l.order_code
  )
  select d.order_code, 'sheet', d.source_tab, d.order_date, d.channel, d.channel_detail, d.customer_name, d.province,
         g.so_dong, g.tong_vat, g.san_pham, null::text, g.synced_at, d.fulfillment_status, d.payment_status
    from dau d join gom g on g.order_code = d.order_code
  union all
  select o.order_code, 'app', o.source_tab, o.order_date, c.channel_l1, coalesce(nullif(o.channel_detail, ''), c.channel_l2), o.customer_name, o.province,
         count(i.id)::int, coalesce(o.total_vat, sum(coalesce(i.amount_vat, 0))),
         string_agg(coalesce(nullif(i.product_name, ''), i.internal_code, '?') || ' ×' || trim(to_char(coalesce(i.quantity, 0), 'FM999999990.##')), ', ' order by i.line_no),
         o.created_by, o.created_at, o.status, o.payment_status
    from sales_orders o left join sales_order_items i on i.order_id = o.order_id left join dim_channel c on c.id = o.channel_id
   where o.order_code is not null and (o.order_date >= p_tu_ngay or o.created_at >= p_tu_ngay)
   group by o.order_id, c.id
$function$;

CREATE OR REPLACE FUNCTION public.bot_ds_don_app()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- to_jsonb(o): MỌI cột của đơn (app thêm ô mới → bot tự thấy, không phải sửa hàm). Thêm: tên kênh + sản phẩm.
  select coalesce(jsonb_agg((to_jsonb(o) - 'order_id') || jsonb_build_object(
      'kenh', c.channel_l1, 'kenh_chi_tiet', coalesce(nullif(o.channel_detail, ''), c.channel_l2),
      'items', coalesce((select jsonb_agg(jsonb_build_object('line_no', i.line_no, 'internal_code', i.internal_code, 'product_name', i.product_name,
                  'quantity', i.quantity, 'unit_price_vat', i.unit_price_vat, 'vat_pct', i.vat_pct, 'vat_loai', i.vat_loai, 'is_gift', i.is_gift, 'note', i.note)
                  order by i.line_no) from sales_order_items i where i.order_id = o.order_id), '[]'))
    order by o.created_at), '[]')
  from sales_orders o left join dim_channel c on c.id = o.channel_id
  where o.order_code is not null
$function$;

do $$
declare f text;
begin
  foreach f in array array['public.bot_ds_don(date)', 'public.bot_ds_don_app()'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to kho_bot_serial', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
