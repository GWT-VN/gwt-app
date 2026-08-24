-- 54 — điền KÊNH cho khách CSKH từ dữ liệu Sales, có ĐÁNH DẤU để CEO soát lại.
--
-- CEO 24/08/2026: *"OK nhưng highlight đc kênh nào là anh tự điền cần tôi check lại"*.
-- Nên không chỉ điền — phải để lại dấu vết phân biệt "máy điền" với "người điền".
--
-- Luật CEO chốt cùng ngày: đơn cũ từ Sheet thì gán kênh của đơn cho khách; khách có
-- nhiều kênh thì lấy kênh của ĐƠN ĐẦU. Phiên Sales đã tính sẵn theo đúng luật đó và
-- đổ vào `customers.channel_id` (357/428). Ở đây **chép lại kết quả của họ** chứ không
-- tự tính lần hai từ `sales_order_lines` — hai khu mà mỗi bên tự suy một kiểu thì sớm
-- muộn lệch nhau, đúng thứ đang phải đi dọn ở chuyện mã khách.
--
-- Đo prod 24/08 trước khi chạy: 427 khách CS, 74 đã có kênh, 353 trống. Trong 353 đó
-- chỉ **113** có đối chiếu bên Sales kèm kênh (109 khớp mã khách + 4 khớp SĐT).
-- 240 khách còn lại KHÔNG có gì để suy — để trống, không đoán bừa.

alter table cs_customers
  add column if not exists channel_tu_dong boolean not null default false;

comment on column cs_customers.channel_tu_dong is
  'true = kênh do máy điền từ dữ liệu Sales (mig 54), CEO cần soát lại. Người sửa tay là hạ về false.';

-- Đường 1 — khớp MÃ KHÁCH Sales (chắc chắn nhất).
-- Gom về một dòng/khách rồi mới update: `customers` đang có hồ sơ trùng, mà UPDATE ... FROM
-- gặp nhiều dòng khớp thì Postgres lấy ĐẠI một dòng, không báo gì. `having count(distinct)=1`
-- bỏ qua ca nhập nhằng thay vì im lặng chọn bừa.
update cs_customers cs
   set channel_id = t.channel_id, channel_tu_dong = true, updated_at = now()
  from (
    select cs2.id, min(sa.channel_id) as channel_id
      from cs_customers cs2
      join customers sa on sa.customer_code = cs2.customer_code
     where cs2.trang_thai <> 'da_xoa' and cs2.channel_id is null and sa.channel_id is not null
     group by cs2.id
    having count(distinct sa.channel_id) = 1
  ) t
 where t.id = cs.id;

-- Đường 2 — khách CS chưa có mã Sales: khớp 9 SỐ CUỐI của SĐT.
update cs_customers cs
   set channel_id = t.channel_id, channel_tu_dong = true, updated_at = now()
  from (
    select cs2.id, min(sa.channel_id) as channel_id
      from cs_customers cs2
      join customers sa
        on sa.phone_no0 = right(regexp_replace(cs2.primary_phone, '\D', '', 'g'), 9)
     where cs2.trang_thai <> 'da_xoa' and cs2.channel_id is null
       and cs2.customer_code is null and cs2.primary_phone is not null
       and sa.channel_id is not null
     group by cs2.id
    having count(distinct sa.channel_id) = 1
  ) t
 where t.id = cs.id;
