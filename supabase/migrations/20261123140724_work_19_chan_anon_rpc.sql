-- work_19 — Chặn anon/authenticated gọi RPC `public.work_*` (chỉ service_role).
-- Cách lùi nếu hỏng: grant execute on function <từng hàm public.work_*> to anon, authenticated (vòng DO như dưới, đổi
-- revoke → grant) — chỉ cần nếu có nơi gọi RPC bằng anon key / JWT người dùng (điểm danh 23/11: không có).
--
-- Vì sao: mọi RPC khu Việc là SECURITY DEFINER và lấy danh tính từ THAM SỐ `p_email` (app server gọi bằng service_role
-- sau khi đã xác thực). Để anon/authenticated EXECUTE (mặc định của Supabase cho hàm trong `public`) thì ai cầm anon key
-- — key công khai, nằm trong bundle trình duyệt — gọi thẳng /rest/v1/rpc/work_* với email bất kỳ là đọc/sửa/xoá việc dưới
-- tên người đó. Advisors báo WARN anon/authenticated_security_definer_function_executable.
--
-- Điểm danh nơi gọi trước khi chặn (23/11): gwt-app (`dataClient()` = service_role) + tools/scripts/smoke_local.py
-- (service_role); các repo khác trong workspace không gọi; log API 3 ngày không có lượt gọi work_* nào. Hàm nội bộ
-- schema `work` không lộ qua PostgREST (schema chưa expose) → không đụng.
--
-- Hàm `public.work_*` MỚI sau này nhận lại grant mặc định của Supabase → file tạo hàm phải tự revoke (test tĩnh
-- lib/work-guard.test.ts canh). `create or replace` hàm cũ giữ nguyên ACL đã thu.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'work\_%'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
