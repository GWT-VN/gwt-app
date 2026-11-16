-- cs — FILE ĐÍNH KÈM cho Nhật ký trao đổi của ticket (16/11/2026)
--
-- Kho Storage RIÊNG TƯ `ticket-tep`: ảnh / video / PDF, tối đa 50 MB mỗi file.
-- Trình duyệt tải thẳng lên kho bằng signed upload URL do server cấp (sau requireStaff),
-- xem bằng signed URL hết hạn sau 1 giờ — không có policy nào trên storage.objects cho
-- anon/authenticated, nên ngoài app không ai đọc/ghi được.
-- Bảng ticket_note_tep: mỗi dòng một file gắn vào một dòng nhật ký (xoá nhật ký → xoá dòng file;
-- object trong kho do app xoá khi xoá nhật ký / bỏ file).
--
-- ROLLBACK:
--   drop table if exists public.ticket_note_tep;
--   delete from storage.buckets where id = 'ticket-tep';   -- chỉ khi kho đã rỗng

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-tep', 'ticket-tep', false, 52428800, array['image/*', 'video/*', 'application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.ticket_note_tep (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references public.ticket_note(id) on delete cascade,
  ticket_code text not null references public.tickets(ticket_code) on update cascade on delete cascade,
  duong_dan   text not null unique,          -- đường dẫn object trong kho ticket-tep
  ten         text not null,                 -- tên file gốc
  loai        text not null,                 -- MIME
  kich_thuoc  bigint not null check (kich_thuoc > 0 and kich_thuoc <= 52428800),
  tao_boi     text,
  created_at  timestamptz not null default now()
);

comment on table public.ticket_note_tep is 'File đính kèm (ảnh/video/PDF) của một dòng Nhật ký trao đổi ticket; nội dung nằm ở Storage bucket ticket-tep.';

create index if not exists ix_ticket_note_tep_note on public.ticket_note_tep (note_id);
create index if not exists ix_ticket_note_tep_ticket on public.ticket_note_tep (ticket_code);

alter table public.ticket_note_tep enable row level security;
drop policy if exists staff_all on public.ticket_note_tep;
create policy staff_all on public.ticket_note_tep to authenticated using (public.is_staff()) with check (public.is_staff());
revoke all on table public.ticket_note_tep from anon;
grant select, insert, update, delete on table public.ticket_note_tep to authenticated, service_role;
