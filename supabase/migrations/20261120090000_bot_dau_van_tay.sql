-- Dấu vân tay cho bot (giảm egress Supabase Free, sự cố 20/11/2026).
-- CHÉP NGUYÊN VĂN từ gwt-discord-bot db/kho-serial/dau-van-tay-app.sql (test PGlite: shopee/kho-dau-van-tay.test.mjs, PR gwt-discord-bot#33).

-- Dấu vân tay cho bot đọc DB app GWT (GWT-SalesTracking) — giảm lưu lượng Supabase (gói Free, egress 5 GB/tháng chung org).
-- Sự cố 20/11/2026: vòng theo-doi tải lại danh sách serial (~230 KB) mỗi 20 giây, báo đơn tải đơn 60 ngày (~22 KB) mỗi phút
-- → org bị khoá 402. Nay bot hỏi dấu (~40 byte) trước; dấu đổi mới tải lại (admin/kho/bo-dem.mjs).
-- Dấu = md5 của ĐÚNG kết quả hàm bot đọc (không phụ thuộc trigger updated_at): thêm / sửa / xoá đều làm dấu đổi.
-- Hàm tính trên server, chỉ trả 32 ký tự. Gọi tối đa ~1 lần/phút mỗi hàm.
-- Bản migration gwt-app (supabase/migrations/*_bot_dau_van_tay.sql) chép NGUYÊN VĂN file này.

-- Danh sách serial + lịch sử bot kho (kho_bot_ds_serial / kho_bot_lich_su(…, 3000) — đúng tham số bot dùng).
create or replace function public.kho_bot_dau_van_tay(p_ca_test boolean default false)
returns text language sql stable security definer set search_path = public as $$
  select md5(coalesce((select string_agg(md5(t::text), '' order by md5(t::text)) from public.kho_bot_ds_serial(p_ca_test) t), '')
             || '|' ||
             coalesce((select string_agg(md5(t::text), '' order by md5(t::text)) from public.kho_bot_lich_su(p_ca_test, 3000) t), ''))
$$;

-- Danh sách đơn cho bot báo đơn (bot_ds_don).
create or replace function public.bot_ds_don_dau(p_tu_ngay date)
returns text language sql stable security definer set search_path = public as $$
  select md5(coalesce((select string_agg(md5(t::text), '' order by md5(t::text)) from public.bot_ds_don(p_tu_ngay) t), ''))
$$;

do $$
declare f text;
begin
  foreach f in array array['public.kho_bot_dau_van_tay(boolean)', 'public.bot_ds_don_dau(date)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);   -- Supabase tự cấp cho anon/authenticated → thu hồi
    execute format('grant execute on function %s to kho_bot_serial', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
