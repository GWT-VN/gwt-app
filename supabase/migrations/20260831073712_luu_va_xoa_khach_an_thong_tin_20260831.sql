-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260831073712, name luu_va_xoa_khach_an_thong_tin_20260831).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 641cb9d63e25d8c1c68c62bd575ab9f0.

-- Khách "ẩn thông tin" (tên bị che "****" + không SĐT, chủ yếu đơn Shopee quá hạn xem thông tin
-- người mua). Luật chốt 2026-08-31: đơn như vậy KHÔNG tạo hồ sơ khách (buildKhachHang bỏ qua).
-- Sync customers là UPSERT-không-xoá nên 107 hồ sơ cũ phải dọn tay 1 lần. Lưu bản sao trước khi xoá.
create table if not exists public.customers_an_thongtin_luu_20260831 as
select * from public.customers
where coalesce(phone,'') = '' and name !~ '[0-9A-Za-zÀ-ỹ]';

alter table public.customers_an_thongtin_luu_20260831 enable row level security;

-- customer_purchases là bảng phái sinh full-refresh mỗi lần sync -> chỉ cần gỡ liên kết ở đây,
-- lần sync tới sẽ ghi lại với customer_code = null.
update public.customer_purchases
set customer_code = null
where customer_code in (select customer_code from public.customers_an_thongtin_luu_20260831);

delete from public.customers
where customer_code in (select customer_code from public.customers_an_thongtin_luu_20260831);
