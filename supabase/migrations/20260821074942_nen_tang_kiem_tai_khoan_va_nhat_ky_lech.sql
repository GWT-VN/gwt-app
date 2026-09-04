-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260821074942, name nen_tang_kiem_tai_khoan_va_nhat_ky_lech).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 76b08af387fa856dd3311bd00ed93116.

-- 20260820030000_cs_kiem_tai_khoan + 20260820040000_cs_nhat_ky_lech_quyen

-- Hỏi "người này đã có tài khoản đăng nhập chưa?". Bảng staff và auth.users là
-- HAI thứ khác nhau; không có hàm này thì nút "gửi lại mật khẩu" nói dối, vì
-- resetPasswordForEmail cố ý báo thành công cả khi email không tồn tại.
create or replace function public.nen_tang_co_tai_khoan(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.nen_tang_co_tai_khoan(text) from public;
revoke all on function public.nen_tang_co_tai_khoan(text) from anon, authenticated;

comment on function public.nen_tang_co_tai_khoan(text) is
  'Người này đã có tài khoản đăng nhập chưa. Dùng cho nút gửi lại mật khẩu ở /nhan-vien.';

-- Nhật ký LỆCH quyền — cơ chế dò sai khi ma trận chạy song song với luật cũ.
create table if not exists public.nhat_ky_lech_quyen (
  id        bigserial primary key,
  staff_id  uuid references public.staff(id) on delete cascade,
  email     text,
  ma_quyen  text not null,
  luat_cu   boolean not null,
  ma_tran   boolean not null,
  so_lan    integer not null default 1,
  lan_dau   timestamptz not null default now(),
  lan_cuoi  timestamptz not null default now(),
  unique (staff_id, ma_quyen, luat_cu, ma_tran)
);

alter table public.nhat_ky_lech_quyen enable row level security;

comment on table public.nhat_ky_lech_quyen is
  'Ma trận quyền nói khác luật cũ ở đâu. Gộp theo (người, quyền, cũ, mới).';

-- Ghi một lượt lệch, gộp vào dòng sẵn có nếu đã gặp. Phải là RPC chứ không phải
-- upsert từ app: cần TĂNG so_lan, mà PostgREST upsert chỉ ghi đè được.
create or replace function public.nen_tang_ghi_lech_quyen(
  p_staff_id uuid,
  p_email    text,
  p_ma_quyen text,
  p_luat_cu  boolean,
  p_ma_tran  boolean
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.nhat_ky_lech_quyen (staff_id, email, ma_quyen, luat_cu, ma_tran)
  values (p_staff_id, p_email, p_ma_quyen, p_luat_cu, p_ma_tran)
  on conflict (staff_id, ma_quyen, luat_cu, ma_tran) do update
    set so_lan = public.nhat_ky_lech_quyen.so_lan + 1,
        lan_cuoi = now(),
        email = excluded.email;
$$;

revoke all on function public.nen_tang_ghi_lech_quyen(uuid, text, text, boolean, boolean) from public;
revoke all on function public.nen_tang_ghi_lech_quyen(uuid, text, text, boolean, boolean) from anon, authenticated;
