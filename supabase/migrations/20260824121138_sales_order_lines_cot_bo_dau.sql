-- Ô tìm của khu Sales gõ KHÔNG DẤU không ra — CEO báo 24/08/2026.
--
-- Vòng trước tôi sửa 5 ô tìm của khu CSKH nhưng **sót đúng hai ô của chính khu Sales**,
-- và đó lại là hai ô CEO dùng nhiều nhất:
--   · `/sales/khach`  — lọc bằng `name.ilike.%…%`
--   · `/sales`        — lọc bằng `customer_name.ilike.%…%` + `product_name.ilike.%…%`
--
-- Cả bốn cột trên đều là cột CÓ DẤU. `ilike` không bỏ dấu hộ, nên gõ `phuong` không bao
-- giờ khớp `Phượng`. Bảng `customers` đã có sẵn `ten_kd`/`dia_chi_kd` (cột sinh) nên bên
-- đó chỉ cần đổi code; `sales_order_lines` thì CHƯA có cột bỏ dấu nào — thêm ở đây.
--
-- Cột SINH (generated stored) chứ không phải cột thường: `sales_order_lines` bị **xoá sạch
-- rồi nạp lại** mỗi lần sync từ Google Sheet. Cột thường thì lần nạp sau là trống trơn và
-- không ai báo lỗi; cột sinh là SCHEMA nên sống sót qua mọi đợt nạp và tự tính lại từng dòng.
--
-- ⚠️ `khong_dau()` là hàm DÙNG CHUNG với CSKH (xem SYSTEM.md §8, dòng 21/08). Ở đây chỉ
-- GỌI nó, không sửa nó.

alter table public.sales_order_lines
  add column if not exists customer_name_kd text
    generated always as (public.khong_dau(coalesce(customer_name, ''))) stored;

alter table public.sales_order_lines
  add column if not exists product_name_kd text
    generated always as (public.khong_dau(coalesce(product_name, ''))) stored;

create index if not exists sales_order_lines_customer_name_kd_idx
  on public.sales_order_lines using gin (customer_name_kd gin_trgm_ops);
create index if not exists sales_order_lines_product_name_kd_idx
  on public.sales_order_lines using gin (product_name_kd gin_trgm_ops);

comment on column public.sales_order_lines.customer_name_kd is
  'Ban bo dau cua customer_name, sinh san. De o tim go khong dau van ra. '
  'Cot SINH vi bang nay bi xoa sach nap lai moi lan sync — cot thuong se trong tron sau do.';
comment on column public.sales_order_lines.product_name_kd is
  'Ban bo dau cua product_name, sinh san.';
