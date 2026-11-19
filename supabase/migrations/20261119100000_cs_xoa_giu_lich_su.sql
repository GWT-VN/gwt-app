-- Xoá người khỏi danh sách CS theo dõi / kỹ thuật mà GIỮ lịch sử ticket (Hiệp 19/11/2026).
--
-- Trước: xoá = DELETE dòng → FK "on delete set null" gỡ tên khỏi MỌI ticket, kể cả ticket đã xong (mất "ai xử lý").
-- Sau:  app "Xoá" = hoat_dong = false (biến mất khỏi danh sách + ô chọn; ticket cũ giữ tên; thêm lại đúng tên = khôi phục).
--       FK đổi sang "on delete restrict": lỡ có chỗ nào DELETE thẳng người đã gán ticket thì DB chặn, không âm thầm gỡ tên.
--
-- Dữ liệu: cs_theo_doi_ds.hoat_dong = false từ trước 18/11 chiều (app đang coi như vẫn dùng) → bật lại để danh sách
-- hiện y như bây giờ. Không xoá / không đổi ticket nào.
--
-- Hoàn tác:
--   alter table public.tickets drop constraint if exists tickets_cs_theo_doi_fkey;
--   alter table public.tickets add constraint tickets_cs_theo_doi_fkey foreign key (cs_theo_doi)
--     references public.cs_theo_doi_ds (ten) on update cascade on delete set null;
--   alter table public.tickets drop constraint if exists tickets_kt_ho_so_fkey;
--   alter table public.tickets add constraint tickets_kt_ho_so_fkey foreign key (kt_ho_so)
--     references public.ky_thuat (id) on delete set null;

update public.cs_theo_doi_ds set hoat_dong = true where hoat_dong = false;

alter table public.tickets drop constraint if exists tickets_cs_theo_doi_fkey;
alter table public.tickets add constraint tickets_cs_theo_doi_fkey foreign key (cs_theo_doi)
  references public.cs_theo_doi_ds (ten) on update cascade on delete restrict;

alter table public.tickets drop constraint if exists tickets_kt_ho_so_fkey;
alter table public.tickets add constraint tickets_kt_ho_so_fkey foreign key (kt_ho_so)
  references public.ky_thuat (id) on delete restrict;

comment on table public.cs_theo_doi_ds is
  'Danh sách người CS theo dõi ticket. hoat_dong = false: đã xoá trên app (không chọn được nữa), ticket cũ giữ tên.';
comment on column public.tickets.kt_ho_so is
  'Thợ (ky_thuat.id) phụ trách ticket. Xoá thợ trên app = ky_thuat.hoat_dong false, ticket cũ giữ thợ.';
