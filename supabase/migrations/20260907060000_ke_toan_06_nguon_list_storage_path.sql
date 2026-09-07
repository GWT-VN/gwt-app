-- ke_toan_06_nguon_list_storage_path — ke_toan_nguon_list trả thêm storage_path để route xuất Excel
-- tải được file NEXIA gốc từ bucket `accounting` và ĐIỀN cột đề xuất vào chính file đó (giữ nguyên
-- Sheet1, độ rộng cột, định dạng số, màu dòng HDCT, bộ lọc — như tool Python openpyxl làm), thay vì
-- dựng workbook mới mất hết định dạng (CEO bắt 07/09/2026 khi so file _DAXULY app với bản Python).
-- Thay đổi CỘNG THÊM một khoá jsonb, không đổi chữ ký → create or replace giữ nguyên ACL (service_role).
-- Cách lùi nếu hỏng: chạy lại định nghĩa ke_toan_nguon_list trong 20260904040200_ke_toan_02_rpc.sql.

create or replace function public.ke_toan_nguon_list(p_email text, p_period_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'kind', s.kind, 'file_name', s.file_name, 'headers', s.headers,
           'row_count', s.row_count, 'uploaded_at', s.uploaded_at, 'storage_path', s.storage_path) order by s.id), '[]'::jsonb)
  from accounting.sources s where accounting.nv(p_email) is not null and s.period_id = p_period_id;
$$;
