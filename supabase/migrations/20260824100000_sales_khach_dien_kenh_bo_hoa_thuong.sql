-- Vá tiếp đợt điền kênh 24/08. Bản trước so khớp PHÂN BIỆT HOA/THƯỜNG nên hụt 26 khách.
--
-- Tôi tưởng thiếu dòng trong `dim_channel` và định thêm — phiên CSKH bắt được: `KOL · DINO`
-- và `KOL · HANNAH` ĐÃ CÓ SẴN (id 80, 81), chỉ khác hoa/thường với cách ghi trên đơn
-- (`Dino`, `Hannah`). Thêm dòng mới là đẻ ra HAI đối tác cho MỘT người trong bảng dùng chung —
-- đắt hơn hẳn, và sai.
--
-- Bài học: trước khi thêm dòng vào danh mục dùng chung, kiểm xem có phải PHÉP SO KHỚP của
-- mình sai không. Nắn danh mục theo dữ liệu là hợp thức hoá lỗi gõ thành một thực thể thật.
--
-- Vẫn giữ nguyên hai nguyên tắc của bản trước: khớp ĐỦ HAI CẤP, và chỉ điền khi khớp
-- ĐÚNG MỘT dòng `dim_channel` (đo trước khi chạy: 0 ca khớp nhiều dòng).

with kenh_don as (
  select p.customer_code, l.channel as l1,
         coalesce(nullif(trim(coalesce(l.channel_detail,'')),''),'') as l2
  from customer_purchases p
  join sales_order_lines l on l.order_code = p.order_code
  where coalesce(l.channel,'') <> '' and coalesce(p.customer_code,'') <> ''
),
gom as (
  -- Gom cũng phải bỏ hoa/thường, nếu không `Dino` và `DINO` bị tính thành HAI kênh
  -- rồi khách bị loại vì "mua nhiều kênh" — đúng lỗi vừa mắc, ở chỗ khác.
  select customer_code,
         count(distinct upper(trim(l1))) as so_l1,
         count(distinct upper(trim(l1)) || '|' || upper(trim(l2))) as so_cap,
         min(l1) as l1, min(l2) as l2
  from kenh_don group by 1
),
chac_chan as (
  select g.customer_code, d.id as channel_id
  from gom g
  join dim_channel d
    on upper(trim(d.channel_l1)) = upper(trim(g.l1))
   and upper(trim(coalesce(d.channel_l2,''))) = upper(trim(g.l2))
  where g.so_l1 = 1 and g.so_cap = 1
)
update public.customers c
   set channel_id = k.channel_id
  from chac_chan k
 where c.customer_code = k.customer_code
   and c.channel_id is null;
