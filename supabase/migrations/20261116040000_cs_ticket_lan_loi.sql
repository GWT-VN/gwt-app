-- cs — CẶP "khách báo ↔ xử lý" cho các LẦN LỖI SAU của một ticket (16/11/2026)
--
-- Lần 1 GIỮ NGUYÊN ở tickets.description (khách báo) + tickets.last_note (tóm tắt xử lý):
-- danh sách ticket, tìm kiếm, gợi ý nhóm lỗi, bot Discord và đồng bộ Sheet đều đọc 2 cột đó,
-- nên không chuyển dữ liệu. Bảng này chỉ chứa lần 2 trở đi (lan >= 2), thuần cộng thêm.
--
-- ROLLBACK:
--   drop table if exists public.ticket_lan_loi;

create table if not exists public.ticket_lan_loi (
  id          uuid primary key default gen_random_uuid(),
  ticket_code text not null references public.tickets(ticket_code) on update cascade on delete cascade,
  lan         integer not null check (lan >= 2),
  mo_ta       text not null check (length(btrim(mo_ta)) > 0),
  xu_ly       text,
  tao_boi     text,                 -- email nhân viên ghi (từ phiên đăng nhập)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (ticket_code, lan)
);

comment on table public.ticket_lan_loi is 'Lần lỗi thứ 2+ của ticket: mỗi dòng một cặp khách báo (mo_ta) ↔ tóm tắt xử lý (xu_ly). Lần 1 nằm ở tickets.description/last_note.';

drop trigger if exists trg_ticket_lan_loi_updated_at on public.ticket_lan_loi;
create trigger trg_ticket_lan_loi_updated_at before update on public.ticket_lan_loi
  for each row execute function public.set_updated_at();

alter table public.ticket_lan_loi enable row level security;
drop policy if exists staff_all on public.ticket_lan_loi;
create policy staff_all on public.ticket_lan_loi to authenticated using (public.is_staff()) with check (public.is_staff());
revoke all on table public.ticket_lan_loi from anon;
grant select, insert, update, delete on table public.ticket_lan_loi to authenticated, service_role;
