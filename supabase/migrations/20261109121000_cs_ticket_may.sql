-- cs — DÒNG MÁY trong ticket: 1 ticket nhiều máy, mỗi máy một mã lỗi (09/11/2026)
--
-- tickets.serial / source_serial GIỮ NGUYÊN (bot Discord + đồng bộ Sheet CTS20 vẫn ghi vào đó).
-- Trigger tự sinh 1 dòng cho MỌI ticket mới — bất kể ai ghi (app, bot_tao_ticket,
-- bot_dong_bo_cts20_ghi) — nên không phải sửa hàm bot nào. Trigger KHÔNG BAO GIỜ làm hỏng
-- lệnh insert/update ticket: lỗi bên trong chỉ thành WARNING.
--
-- ROLLBACK:
--   drop trigger if exists trg_tickets_doi_serial_dong_may on public.tickets;
--   drop trigger if exists trg_tickets_tao_dong_may on public.tickets;
--   drop function if exists public.cs_ticket_may_theo_serial();
--   drop function if exists public.cs_ticket_may_tu_tao();
--   drop table if exists public.ticket_may;

create table if not exists public.ticket_may (
  id                uuid primary key default gen_random_uuid(),
  ticket_code       text not null references public.tickets(ticket_code) on update cascade on delete cascade,
  thu_tu            integer not null default 1,
  serial            text references public.installed_base(serial) on update cascade on delete set null,
  source_serial     text,
  internal_code     text,
  loi_code          text not null default 'CHUA_PHAN_LOAI' references public.loi_danh_muc(code) on update cascade,
  mo_ta             text,
  huong_xu_ly       text,
  huong_xu_ly_nguon text check (huong_xu_ly_nguon in ('danh_muc', 'cs')),
  trang_thai        text not null default 'dang_xu_ly' check (trang_thai in ('dang_xu_ly', 'da_xu_ly', 'khong_loi')),
  nguon             text not null default 'app' check (nguon in ('app', 'tu_dong', 'backfill')),
  tao_boi           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.ticket_may is 'Dòng máy của ticket: mỗi máy báo lỗi một dòng (serial nullable khi máy chưa có trong hệ thống).';
comment on column public.ticket_may.nguon is 'tu_dong = trigger sinh khi tạo ticket · backfill = sinh cho ticket cũ · app = CS thêm tay.';
comment on column public.ticket_may.huong_xu_ly_nguon is 'danh_muc = CS bấm Xác nhận hướng đề xuất · cs = CS tự viết/sửa · null = chưa xác nhận.';

create index if not exists ix_ticket_may_ticket on public.ticket_may (ticket_code, thu_tu);
create index if not exists ix_ticket_may_loi on public.ticket_may (loi_code);
create index if not exists ix_ticket_may_may on public.ticket_may ((coalesce(serial, source_serial)));

drop trigger if exists trg_ticket_may_updated_at on public.ticket_may;
create trigger trg_ticket_may_updated_at before update on public.ticket_may
  for each row execute function public.set_updated_at();

alter table public.ticket_may enable row level security;
drop policy if exists staff_all on public.ticket_may;
create policy staff_all on public.ticket_may to authenticated using (public.is_staff()) with check (public.is_staff());
revoke all on table public.ticket_may from anon;
grant select, insert, update, delete on table public.ticket_may to authenticated, service_role;

create or replace function public.cs_ticket_may_tu_tao() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_src text := nullif(upper(btrim(new.source_serial)), '');
  v_may text := coalesce(new.serial, v_src);
  v_ma  text;
begin
  begin
    select coalesce(
      (select internal_code from installed_base where serial = v_may),
      (select internal_code from serial_registry where serial = v_may)
    ) into v_ma;
    insert into ticket_may (ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, nguon, tao_boi, created_at)
    values (new.ticket_code, 1, new.serial, v_src, v_ma,
            cs_loi_khop(concat_ws(' ', new.ticket_type, new.description), v_ma),
            new.description, 'tu_dong', 'trigger', new.created_at);
  exception when others then
    raise warning 'cs_ticket_may_tu_tao(%): % — ticket vẫn tạo, thiếu dòng máy (chạy cs_ticket_may_backfill để bù)', new.ticket_code, sqlerrm;
  end;
  return new;
end $$;

create or replace function public.cs_ticket_may_theo_serial() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ma text; v_src text := nullif(upper(btrim(new.source_serial)), '');
begin
  if new.serial is not distinct from old.serial and new.source_serial is not distinct from old.source_serial then
    return new;
  end if;
  begin
    select coalesce(
      (select internal_code from installed_base where serial = coalesce(new.serial, v_src)),
      (select internal_code from serial_registry where serial = coalesce(new.serial, v_src))
    ) into v_ma;
    -- Chỉ đụng khi ticket còn ĐÚNG 1 dòng và dòng đó do hệ thống sinh (CS đã tách nhiều máy thì để CS quyết).
    update ticket_may m
       set serial        = new.serial,
           source_serial = coalesce(v_src, m.source_serial),
           internal_code = coalesce(v_ma, m.internal_code),
           loi_code      = case when m.loi_code = 'CHUA_PHAN_LOAI'
                                then cs_loi_khop(concat_ws(' ', new.ticket_type, new.description), coalesce(v_ma, m.internal_code))
                                else m.loi_code end
     where m.ticket_code = new.ticket_code
       and m.nguon in ('tu_dong', 'backfill')
       and (select count(*) from ticket_may x where x.ticket_code = new.ticket_code) = 1;
  exception when others then
    raise warning 'cs_ticket_may_theo_serial(%): %', new.ticket_code, sqlerrm;
  end;
  return new;
end $$;

revoke all on function public.cs_ticket_may_tu_tao() from public, anon, authenticated;
revoke all on function public.cs_ticket_may_theo_serial() from public, anon, authenticated;

drop trigger if exists trg_tickets_tao_dong_may on public.tickets;
create trigger trg_tickets_tao_dong_may after insert on public.tickets
  for each row execute function public.cs_ticket_may_tu_tao();

drop trigger if exists trg_tickets_doi_serial_dong_may on public.tickets;
create trigger trg_tickets_doi_serial_dong_may after update of serial, source_serial on public.tickets
  for each row execute function public.cs_ticket_may_theo_serial();
