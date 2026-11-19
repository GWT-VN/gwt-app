-- cs — NGÀY KHÁCH BÁO cho từng lần lỗi + CS THEO DÕI theo 4 tên (17/11/2026)
--
-- Chị Trang (#ai-team, 16–17/11): mô tả sự cố tách theo ngày, chọn được ngày lùi (backdate);
-- CS theo dõi chọn theo 4 tên, không theo email (tài khoản dùng chung email).
-- Thuần cộng thêm: cột trống → app dùng created_at như trước; cs_phu_trach (FK staff) giữ nguyên.
--
-- ROLLBACK:
--   alter table public.tickets drop column if exists ngay_bao, drop column if exists cs_theo_doi;
--   alter table public.ticket_lan_loi drop column if exists ngay;

alter table public.tickets add column if not exists ngay_bao date;
alter table public.tickets add column if not exists cs_theo_doi text;

alter table public.tickets drop constraint if exists tickets_cs_theo_doi_hop_le;
alter table public.tickets add constraint tickets_cs_theo_doi_hop_le
  check (cs_theo_doi is null or cs_theo_doi in ('Hiệp', 'Kiều Trang', 'Hiền', 'Tuyết Trang'));

alter table public.ticket_lan_loi add column if not exists ngay date;

comment on column public.tickets.ngay_bao is 'Ngày khách báo lỗi lần 1 (chọn được ngày lùi). Trống → dùng created_at.';
comment on column public.tickets.cs_theo_doi is 'CS theo dõi ticket, theo tên người (không theo email dùng chung): Hiệp / Kiều Trang / Hiền / Tuyết Trang.';
comment on column public.ticket_lan_loi.ngay is 'Ngày khách báo lần lỗi này (chọn được ngày lùi). Trống → dùng created_at.';
