-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260821120247, name sales_chuan_hoa_kenh_lac).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = c80994143573bac44f353619b66c1564.

-- Chuẩn hoá 3 giá trị kênh không có trong dim_channel — CEO chốt 21/08/2026.
--   GWT (16 dòng) · Hotline (4 dòng)        -> 'Trực tiếp'
--   Khách lẻ (23 dòng / 6 đơn)              -> 'Trực tiếp', RIÊNG 251230-E003 -> 'KOL' · 'DINO'
--
-- Lý do tách riêng 251230-E003 (TRẤN THÀNH TOWN): đơn đó giảm ~75% đồng loạt mọi dòng
-- (WH30A 62.337.500 / niêm yết 249.950.000), không phải mức của khách lẻ. CEO xác nhận
-- đó là đơn qua KOL Dino.
--
-- ⚠️ BẢN VÁ TẠM: `sales_order_lines` bị XOÁ SẠCH rồi nạp lại mỗi lần đồng bộ từ Google
-- Sheet, nên thay đổi này SẼ BỊ GHI ĐÈ ở lần sync kế tiếp. Sửa gốc phải làm trên Sheet:
-- cột "Kênh" của 6 đơn 251211-E001, 251211-E002, 251218-E001, 251222-E001, 251225-E001
-- (-> Trực tiếp) và 251230-E003 (-> KOL / DINO), cùng các đơn mang GWT / Hotline.
update public.sales_order_lines
   set channel = 'KOL', channel_detail = 'DINO'
 where order_code = '251230-E003' and channel = 'Khách lẻ';

update public.sales_order_lines
   set channel = 'Trực tiếp'
 where channel in ('Khách lẻ', 'GWT', 'Hotline');
