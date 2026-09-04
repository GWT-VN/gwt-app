-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260822065424, name ve_tinh_tu_dien_ma_kh_truoc_khi_siet).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = cc55692c5b836d287d874ed2c5f93c50.

-- SUA GAP DO CHINH TOI GAY RA, 22/08/2026.
--
-- Migration truoc siet `ma_kh` NOT NULL tren customer_contacts / customer_addresses, NHUNG code
-- dang chay tren production (nhanh main) van chen KHONG co ma_kh — phan TypeScript biet dien
-- ma_kh moi nam o nhanh chua merge. Ket qua: nut "them SDT phu" / "them dia chi phu" GAY NGAY
-- tren prod. Da tai hien duoc: null value in column "ma_kh" violates not-null constraint.
--
-- Bai hoc: khong duoc siet NOT NULL mot cot ma BAN CODE DANG CHAY tren prod chua biet dien.
-- Schema phai tu lo duoc cho ca ban code cu lan moi, vi hai thu do khong bao gio len cung luc.
--
-- Cach sua: trigger tu dien ma_kh tu customer_id. Bat ke ban code nao goi, dong ve tinh luon
-- co khoa dung. Ban code moi truyen thang ma_kh thi trigger khong dung toi (guard `is null`) —
-- va do la duong duy nhat khach chi co ben Sales di duoc, vi ho khong co customer_id.

create or replace function public.ve_tinh_tu_dien_ma_kh()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if new.ma_kh is null and new.customer_id is not null then
    select k.ma_kh into new.ma_kh from public.cs_customers k where k.id = new.customer_id;
  end if;
  return new;
end $function$;

comment on function public.ve_tinh_tu_dien_ma_kh() is
  'Dien ma_kh tu customer_id khi ban code cu chen ma khong biet ve cot moi. Giu cho schema chay duoc voi ca hai ban code, vi app va DB khong bao gio len cung luc.';

drop trigger if exists trg_ve_tinh_ma_kh on public.customer_contacts;
create trigger trg_ve_tinh_ma_kh
  before insert or update on public.customer_contacts
  for each row execute function public.ve_tinh_tu_dien_ma_kh();

drop trigger if exists trg_ve_tinh_ma_kh on public.customer_addresses;
create trigger trg_ve_tinh_ma_kh
  before insert or update on public.customer_addresses
  for each row execute function public.ve_tinh_tu_dien_ma_kh();
