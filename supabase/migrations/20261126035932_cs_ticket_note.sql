-- cs — GHI CHÚ TỰ DO cho ticket (26/11/2026)
--
-- CSKH ghi lại đầy đủ thông tin ticket, kể cả loại thông tin app CHƯA có trường riêng.
-- Bot sẽ quét cột này tìm phần còn thiếu → code bổ sung trường mới. Văn bản thuần (không HTML/markdown).
-- Khác description (khách báo lần 1), last_note (xử lý lần 1), ticket_notes (nhật ký trao đổi theo dòng).
-- Thuần cộng thêm: cột trống → app hiện ô trống, không đổi gì khác.
--
-- ROLLBACK:
--   alter table public.tickets drop constraint if exists tickets_note_do_dai, drop column if exists note;

alter table public.tickets add column if not exists note text;

alter table public.tickets drop constraint if exists tickets_note_do_dai;
alter table public.tickets add constraint tickets_note_do_dai
  check (note is null or char_length(note) <= 20000);

comment on column public.tickets.note is
  'Ghi chú tự do của CSKH: mọi thông tin ticket chưa có trường riêng trên app. Văn bản thuần, tối đa 20000 ký tự. Bot quét để đề xuất trường mới.';
