-- cs — DANH MỤC LỖI chuẩn + hàm khớp "các cách ghi" (09/11/2026)
--
-- Vì sao: ticket_type là chữ tự do (bot + người gõ mỗi người một kiểu) → không đếm được
-- "CTS20 rò nước đáy bao nhiêu ca". Danh mục này là bộ mã chuẩn; nhóm lớn (an toàn / nghiêm
-- trọng…) vẫn là issue_group (13 nhóm sẵn có) — loi_danh_muc.nhom trỏ vào đó, không đẻ bộ
-- nhóm thứ hai. Bổ sung thuần: không đụng bảng/view cũ.
--
-- ROLLBACK:
--   drop function if exists public.cs_loi_khop(text, text);
--   drop table if exists public.loi_danh_muc;

create table if not exists public.loi_danh_muc (
  code        text primary key check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  nhom        text references public.issue_group(code) on update cascade on delete set null,
  ten         text not null check (btrim(ten) <> ''),
  aliases     text[] not null default '{}',
  ma_may      text[] not null default '{}',
  dau_hieu    text,
  huong_xu_ly text,
  nguon       text,
  trang_thai  text not null default 'cho_duyet' check (trang_thai in ('cho_duyet', 'da_duyet', 'ngung')),
  duyet_boi   text,
  duyet_luc   timestamptz,
  thu_tu      integer not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.loi_danh_muc is 'Danh mục lỗi chuẩn CSKH. Chỉ dòng trang_thai=da_duyet được dùng để tự phân loại / gợi ý xử lý.';
comment on column public.loi_danh_muc.aliases is 'Các cách ghi (khớp chứa nghĩa đen, không dấu, không phân biệt hoa thường). App chặn cách ghi dưới 3 ký tự.';
comment on column public.loi_danh_muc.ma_may is 'Mẫu ILIKE trên internal_code (vd CTS20%). Rỗng = mọi model.';
comment on column public.loi_danh_muc.huong_xu_ly is 'Phương án xử lý chuẩn — app chỉ GỢI Ý, CS bấm Xác nhận/sửa; không tự đổi trạng thái ticket.';

drop trigger if exists trg_loi_danh_muc_updated_at on public.loi_danh_muc;
create trigger trg_loi_danh_muc_updated_at before update on public.loi_danh_muc
  for each row execute function public.set_updated_at();

insert into public.loi_danh_muc (code, ten, trang_thai, thu_tu, nguon)
values ('CHUA_PHAN_LOAI', 'Chưa phân loại', 'da_duyet', 9999, 'hệ thống')
on conflict (code) do nothing;

alter table public.loi_danh_muc enable row level security;
drop policy if exists staff_all on public.loi_danh_muc;
create policy staff_all on public.loi_danh_muc to authenticated using (public.is_staff()) with check (public.is_staff());
revoke all on table public.loi_danh_muc from anon;
grant select, insert, update, delete on table public.loi_danh_muc to authenticated, service_role;

-- Văn bản → mã lỗi. Ưu tiên: mục riêng model > alias dài hơn > thu_tu > code.
create or replace function public.cs_loi_khop(p_van_ban text, p_internal_code text)
returns text language sql stable set search_path = public as $$
  select coalesce((
    select d.code
      from loi_danh_muc d
      cross join lateral unnest(d.aliases || d.ten) as a(alias)
     where d.trang_thai = 'da_duyet'
       and d.code <> 'CHUA_PHAN_LOAI'
       and btrim(a.alias) <> ''
       -- strpos (khớp chứa NGHĨA ĐEN): % và _ trong alias không thành ký tự đại diện như LIKE.
       and strpos(khong_dau(coalesce(p_van_ban, '')), khong_dau(btrim(a.alias))) > 0
       and (cardinality(d.ma_may) = 0 or coalesce(p_internal_code, '') ilike any (d.ma_may))
     order by (cardinality(d.ma_may) > 0) desc, length(a.alias) desc, d.thu_tu, d.code
     limit 1
  ), 'CHUA_PHAN_LOAI')
$$;

revoke all on function public.cs_loi_khop(text, text) from public, anon, authenticated;
grant execute on function public.cs_loi_khop(text, text) to service_role;
