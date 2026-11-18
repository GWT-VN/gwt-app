-- cs — PHƯƠNG ÁN XỬ LÝ PHẢI ĐƯỢC CHUYÊN GIA DUYỆT mới hiện trên ticket (18/11/2026)
--
-- Chị Trang (qua anh Dũng, 18/11): "Hướng xử lý đề xuất" trên ticket phải qua chuyên gia duyệt rồi mới cho vào app.
-- Trước đây khối đề xuất chỉ cần MÃ LỖI đã duyệt (trang_thai = da_duyet) — tức duyệt định nghĩa lỗi, không phải
-- duyệt cách xử lý. Thêm duyệt RIÊNG cho phương án:
--  * huong_duyet = true  → app hiện phương án trên ticket. Mặc định false → mọi phương án hiện có ẨN cho tới khi duyệt.
--  * Trigger: đổi nội dung huong_xu_ly mà KHÔNG kèm lần duyệt mới (huong_duyet_luc giữ nguyên) → tự về chưa duyệt.
--    Áp cho mọi đường ghi: form danh mục, "Nhập từ Sheet" (RPC), SQL tay.
--  * App ghi một lần duyệt = set huong_duyet + huong_duyet_boi + huong_duyet_luc = now() cùng lúc.
-- Đo 18/11: 1/24 mã có phương án (CTS20-RO-DAY), 0 dòng ticket đã bấm Xác nhận → không mất gì đã dùng.
--
-- ROLLBACK:
--   drop trigger if exists loi_danh_muc_huong_doi_bo_duyet on public.loi_danh_muc;
--   drop function if exists public.cs_loi_huong_doi_thi_bo_duyet();
--   alter table public.loi_danh_muc drop constraint if exists loi_danh_muc_huong_duyet_co_noi_dung;
--   alter table public.loi_danh_muc drop column if exists huong_duyet, drop column if exists huong_duyet_boi,
--     drop column if exists huong_duyet_luc, drop column if exists huong_y_kien;

alter table public.loi_danh_muc
  add column if not exists huong_duyet     boolean not null default false,
  add column if not exists huong_duyet_boi text,
  add column if not exists huong_duyet_luc timestamptz,
  add column if not exists huong_y_kien    text;

alter table public.loi_danh_muc drop constraint if exists loi_danh_muc_huong_duyet_co_noi_dung;
alter table public.loi_danh_muc add constraint loi_danh_muc_huong_duyet_co_noi_dung
  check (not huong_duyet or nullif(btrim(huong_xu_ly), '') is not null);

comment on column public.loi_danh_muc.huong_duyet is 'Phương án xử lý đã được chuyên gia duyệt → hiện "Hướng xử lý đề xuất" trên ticket. Đổi nội dung phương án → trigger tự về false.';
comment on column public.loi_danh_muc.huong_duyet_boi is 'Email người ghi lần duyệt / bỏ duyệt phương án (nhập file chuyên gia).';
comment on column public.loi_danh_muc.huong_duyet_luc is 'Lúc ghi lần duyệt / bỏ duyệt phương án gần nhất.';
comment on column public.loi_danh_muc.huong_y_kien is 'Ý kiến chuyên gia về phương án (từ file duyệt).';

create or replace function public.cs_loi_huong_doi_thi_bo_duyet()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.huong_xu_ly is distinct from old.huong_xu_ly
     and new.huong_duyet_luc is not distinct from old.huong_duyet_luc then
    new.huong_duyet := false;
    new.huong_duyet_boi := null;
    new.huong_duyet_luc := null;
  end if;
  return new;
end
$$;
revoke all on function public.cs_loi_huong_doi_thi_bo_duyet() from public, anon, authenticated;

drop trigger if exists loi_danh_muc_huong_doi_bo_duyet on public.loi_danh_muc;
create trigger loi_danh_muc_huong_doi_bo_duyet
  before update on public.loi_danh_muc
  for each row execute function public.cs_loi_huong_doi_thi_bo_duyet();
