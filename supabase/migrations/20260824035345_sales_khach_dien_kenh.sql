-- Điền `customers.channel_id` — đo 24/08: **424/424 khách đang TRỐNG**.
--
-- Hệ quả của chỗ trống này: bộ tự bắt giá khi lên đơn lấy khuyến mãi THEO KÊNH của khách.
-- Kênh trống thì khách lẻ không bao giờ ăn được chương trình nào. Tính năng có mà không chạy.
--
-- Nguồn suy: kênh trên CÁC ĐƠN của khách (`sales_order_lines.channel` + `channel_detail`).
--
-- ⚠️ Khớp ĐỦ HAI CẤP, không khớp mỗi cấp 1. Đo: `dim_channel` có 26 dòng nhưng chỉ 6 kênh
-- cấp 1, và 5/6 cấp 1 mang NHIỀU cấp 2. Khớp mỗi cấp 1 là vớ đại một trong tối đa 12 dòng
-- con — rồi khách ăn nhầm khuyến mãi của kênh khác mà không ai thấy.
--
-- CHỈ điền khách mà mọi đơn cùng MỘT kênh và cặp (cấp 1, cấp 2) khớp ĐÚNG MỘT dòng
-- `dim_channel`. Khách nhiều kênh, hoặc kênh chưa có trong `dim_channel`, để NGUYÊN TRỐNG —
-- CEO chốt 22/08: *"cái này có thể điền nhầm"*, CEO tự chỉnh tay.

with kenh_don as (
  select p.customer_code,
         l.channel as l1,
         coalesce(nullif(trim(coalesce(l.channel_detail,'')),''), '') as l2
  from customer_purchases p
  join sales_order_lines l on l.order_code = p.order_code
  where coalesce(l.channel,'') <> '' and coalesce(p.customer_code,'') <> ''
),
gom as (
  select customer_code,
         count(distinct l1) as so_l1,
         count(distinct l1 || '|' || l2) as so_cap,
         min(l1) as l1, min(l2) as l2
  from kenh_don group by 1
),
chac_chan as (
  select g.customer_code, d.id as channel_id
  from gom g
  join dim_channel d
    on d.channel_l1 = g.l1 and coalesce(d.channel_l2,'') = g.l2
  where g.so_l1 = 1 and g.so_cap = 1
)
update public.customers c
   set channel_id = k.channel_id
  from chac_chan k
 where c.customer_code = k.customer_code
   and c.channel_id is null;
