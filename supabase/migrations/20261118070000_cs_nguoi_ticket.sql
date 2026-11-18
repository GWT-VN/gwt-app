-- cs — DANH SÁCH NGƯỜI TRÊN TICKET: CS theo dõi thêm/đổi tên/ẩn được + Kỹ thuật theo HỒ SƠ THỢ (18/11/2026)
--
-- Chị Trang (qua anh Dũng, 18/11): CS theo dõi và Kỹ thuật phải thêm / xoá / sửa tên được ngay trên ticket;
-- tên kỹ thuật lấy từ Discord chưa chuẩn. Chốt: xoá = ẨN (ticket cũ giữ tên); kỹ thuật = hồ sơ thợ `ky_thuat`
-- (có cả CTV/freelancer không có tài khoản), không phải tài khoản `staff`.
-- Thuần cộng thêm cho dữ liệu: đo 18/11 cả 114 ticket chưa gán cs_theo_doi / ky_thuat.
--  * cs_theo_doi vẫn là TÊN (text) như 17/11, nhưng bỏ CHECK cứng 4 tên → FK sang danh sách, ON UPDATE CASCADE:
--    đổi tên trong danh sách thì ticket cũ tự mang tên mới.
--  * tickets.ky_thuat (FK staff) GIỮ NGUYÊN — "ticket của tôi" và chặn xoá nhân viên đang dùng. Cột mới kt_ho_so
--    trỏ hồ sơ thợ; app ghi kèm ky_thuat = tài khoản của thợ (khớp email) khi thợ có tài khoản.
--
-- ROLLBACK:
--   alter table public.tickets drop column if exists kt_ho_so;
--   alter table public.tickets drop constraint if exists tickets_cs_theo_doi_fkey;
--   update public.tickets set cs_theo_doi = null
--    where cs_theo_doi is not null and cs_theo_doi not in ('Hiệp', 'Kiều Trang', 'Hiền', 'Tuyết Trang');
--   alter table public.tickets add constraint tickets_cs_theo_doi_hop_le
--     check (cs_theo_doi is null or cs_theo_doi in ('Hiệp', 'Kiều Trang', 'Hiền', 'Tuyết Trang'));
--   drop table if exists public.cs_theo_doi_ds;

create table if not exists public.cs_theo_doi_ds (
  id         uuid primary key default gen_random_uuid(),
  ten        text not null,
  hoat_dong  boolean not null default true,
  thu_tu     integer not null default 100,
  created_at timestamptz not null default now(),
  constraint cs_theo_doi_ds_ten_key unique (ten),
  constraint cs_theo_doi_ds_ten_gon check (ten = btrim(ten) and length(ten) between 1 and 60)
);
comment on table public.cs_theo_doi_ds is 'Danh sách người CS theo dõi ticket (tên người, không theo email dùng chung). hoat_dong = false: đã ẩn, ticket cũ giữ tên.';

insert into public.cs_theo_doi_ds (ten, thu_tu) values
  ('Hiệp', 1), ('Kiều Trang', 2), ('Hiền', 3), ('Tuyết Trang', 4)
on conflict (ten) do nothing;

alter table public.cs_theo_doi_ds enable row level security;
drop policy if exists staff_all on public.cs_theo_doi_ds;
create policy staff_all on public.cs_theo_doi_ds to authenticated using (public.is_staff()) with check (public.is_staff());
revoke all on table public.cs_theo_doi_ds from anon;
grant select, insert, update, delete on table public.cs_theo_doi_ds to authenticated, service_role;

alter table public.tickets drop constraint if exists tickets_cs_theo_doi_hop_le;
alter table public.tickets drop constraint if exists tickets_cs_theo_doi_fkey;
alter table public.tickets add constraint tickets_cs_theo_doi_fkey
  foreign key (cs_theo_doi) references public.cs_theo_doi_ds (ten) on update cascade on delete set null;
comment on column public.tickets.cs_theo_doi is 'CS theo dõi ticket, theo tên trong cs_theo_doi_ds (đổi tên ở danh sách → ticket theo tên mới).';

alter table public.tickets add column if not exists kt_ho_so uuid references public.ky_thuat (id) on delete set null;
create index if not exists tickets_kt_ho_so_idx on public.tickets (kt_ho_so);
comment on column public.tickets.kt_ho_so is 'Kỹ thuật phụ trách theo hồ sơ thợ (ky_thuat, có cả CTV). tickets.ky_thuat = tài khoản staff của thợ đó nếu có.';
