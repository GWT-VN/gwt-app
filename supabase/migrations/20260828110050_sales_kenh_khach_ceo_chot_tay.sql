-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260828110050, name sales_kenh_khach_ceo_chot_tay).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 294bbfd3575cbf6ff5c5dde0b5542918.

-- CEO chot tay 28/08/2026 — 11 khach may khong suy duoc.
--
-- KH00076 Anh Canh Hung Yen: chi giu KTS-BETAHOUSE. Hai don 30/01 va 04/04 tren he thong
--   la cua NGUOI KHAC (Pham Hai Yen - dai ly) bi gom nham vi DUNG CHUNG SO DIEN THOAI.
-- KH00145 Minh Dong: dai ly that -> Dai ly · Minh Vuong.
update public.customers set channel_id = 85 where customer_code = 'KH00076';
update public.customers set channel_id = 98 where customer_code = 'KH00145';

-- 9 khach chi co don TANG / don khong ghi kenh — CEO chi dinh tung dong:
update public.customers set channel_id = 90 where customer_code = 'KH00390'; -- Truc tiep
update public.customers set channel_id = 80 where customer_code = 'KH00391'; -- KOL · DINO
update public.customers set channel_id = 81 where customer_code = 'KH00392'; -- KOL · HANNAH
update public.customers set channel_id = 91 where customer_code = 'KH00393'; -- Gioi thieu · Anh Quang
update public.customers set channel_id = 81 where customer_code = 'KH00395'; -- KOL · HANNAH
update public.customers set channel_id = 81 where customer_code = 'KH00396'; -- KOL · HANNAH
update public.customers set channel_id = 92 where customer_code = 'KH00397'; -- Gioi thieu · Ban be
update public.customers set channel_id = 91 where customer_code = 'KH00398'; -- Gioi thieu · Anh Quang
update public.customers set channel_id = 90 where customer_code = 'KH00405'; -- Truc tiep
