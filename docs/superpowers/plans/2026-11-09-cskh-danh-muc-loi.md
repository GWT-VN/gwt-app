# CSKH — Danh mục lỗi · Dòng máy trong ticket · Tra serial/khách · Hướng xử lý đề xuất · Báo cáo tần suất — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give CSKH a standard error catalogue (`loi_danh_muc`), per-machine error lines on tickets (`ticket_may`), serial/customer lookup while creating/editing tickets, catalogue-driven suggested handling, and a frequency report — shipped as migration FILES + app code on branch `feat/cskh-danh-muc-loi`, applied to production only by anh Dũng.

**Architecture:** Two new tables (`loi_danh_muc`, child `ticket_may` of `tickets`) plus SQL functions: `cs_loi_khop` (alias → error code), triggers that auto-create/sync one line whenever ANY writer (app, `bot_tao_ticket`, `bot_dong_bo_cts20_ghi`) inserts/updates a ticket, and `cs_ticket_may_backfill(p_chay_thu)` that reports first and writes only on request. Read-only report views feed a pure TypeScript aggregator. New server actions live in their own file `apps/web/app/ticket/loi-actions.ts`; only small, marked edits touch the shared `app/actions.ts`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, Tailwind 4, Supabase Postgres (service_role via `dataClient()`), vitest 4, plain-SQL tests in `db/cs/tests/` (`begin … rollback` + `raise exception`), `xlsx` 0.18 for reading the reviewed Sheet export.

**Spec:** Approved proposal relayed 2026-11-09 by Hồ Tùng Hiệp (Automation): "implement everything per the proposal" — 5 features below. No separate spec file; the summary in "Spec (approved proposal)" below is the spec of record and travels with this plan.

## Spec (approved proposal)

1. **Error catalogue** `loi_danh_muc` (code, nhóm, tên chuẩn, aliases/các cách ghi, mã máy áp dụng, dấu hiệu, phương án xử lý chuẩn, nguồn, trạng thái duyệt) + one-off "Claude gom nhóm lỗi": read all tickets/notes (app Excel export or a read-only SQL the user runs), cluster into ~10–25 standard groups, write Google Sheet "Danh mục lỗi" for chị Hiền to review, import approved rows. Clustering is done by Claude in-session — no external LLM API in the app.
2. **Per-machine lines** `ticket_may` (ticket_code, serial nullable, internal_code, loi_code → loi_danh_muc, mo_ta, huong_xu_ly, trang_thai, created_at…). Backfill one line per existing ticket from `tickets.serial`/`ticket_type` (aliases; unmapped → "Chưa phân loại"). List page "Máy" column shows e.g. `CTS20 · Rò nước đáy`; the "Loại lỗi" filter filters by line; detail page adds/edits/removes lines.
3. **Serial / customer lookup**: typing a serial shows model + customer + install date (installed_base) and validates format (1 letter + 8 digits + 3 alnum + 8 digits = 20 chars); typing a customer name/phone lists their machines + serials; machine not installed/activated → "chưa kích hoạt" + link to the install page.
4. **Suggested handling**: when a line's `loi_code` has an approved standard handling, show "Hướng xử lý đề xuất (theo danh mục lỗi)" prefilled; CS clicks Xác nhận or edits; never auto-changes ticket state.
5. **Frequency report**: cases by group × model × month; rate vs units sold (Sales DB) / imported (Kho); run-time before failure; repeat reports.

Real examples to keep in mind (tests and seed wording use them): CTS20 bottom water leak (12 cases, Sheet "261026-CTS20 Updated Issues"); "Rò rỉ nước ở đầu vòi lạnh" (CTS20); "Báo lỗi E5 – gia nhiệt" (GTUN-8600HP-G); E4 with a known fix from chị Hiền.

## Global Constraints

- **Production is untouched by this plan.** No `apply_migration` / `execute_sql` against Supabase project `bwzmqfbcgouhvhoslmmm`, no `env:prod`. Migrations are tested on the LOCAL Supabase (`supabase migration up`) only. Production apply = anh Dũng, from the PR runbook (Task 15).
- **Additive only.** Migrations create new tables/functions/views/triggers; they never `DELETE`, `TRUNCATE`, `DROP` or rewrite rows of pre-existing tables (`tickets`, `ticket_note`, `installed_base`, `issue_group`, …). No column of a pre-existing table is altered or dropped. `v_tickets`, `v_ticket_issue`, `v_issue_report` are NOT redefined.
- **Rollback header.** Every new migration file starts with a comment block `-- ROLLBACK:` listing the exact `drop …` statements (reverse order) that undo it.
- **Migration location/naming** (db/MIGRATIONS-CONVENTION.md): new files only in `supabase/migrations/`, named `2026110912xxxx_cs_<viec>.sql`. Nothing new in `db/cs/migrations/`.
- **RLS / grants like existing CS tables:** `enable row level security`; policy `staff_all` `to authenticated using (public.is_staff()) with check (public.is_staff())`; `revoke all … from anon`; `grant select, insert, update, delete … to authenticated, service_role`. New functions: `revoke all … from public, anon, authenticated; grant execute … to service_role`. Views: `with (security_invoker = true)`, `revoke all from anon`, `grant select to authenticated, service_role`.
- **Bot compatibility:** `bot_tao_ticket` and `bot_dong_bo_cts20_ghi` (repo `~/Bots/gwt-discord-bot/db/ticket/`) keep working unmodified. They insert straight into `tickets`; the new triggers must never make those inserts fail (trigger bodies wrap their work in `begin … exception when others then raise warning … end`). One ticket may carry one legacy serial (`tickets.serial` / `source_serial` stay the source the bots write).
- **App access pattern:** every server action calls `await requireStaff()` then a permission check before `dataClient()`. Keys (all already exist in `lib/nen-tang/quyen.ts`, no new keys): view = `cs.ticket.xem`; edit lines = `cs.ticket.tao_sua`; edit/approve/import catalogue + reclassify = `coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')`.
- **No PII in git, Sheets or test fixtures.** Raw ticket exports go to `data/cskh-loi/` (gitignored). The "Danh mục lỗi" Sheet holds catalogue rows + ticket codes only — no customer name/phone/address. Test fixtures use invented serials/customers.
- **UI kit:** filters/search/selects follow `docs/CHUAN-FILTER.md` — >10 options ⇒ `BoLocGoiY` (URL filter) or `OChonGoiY` (form); remote search ⇒ `OChonTimXa`; lists use `@/bang` (`OTimKiem`, `ThanhDangLoc`, `PhanTrang`) and `BangTuyChinh`. Page header `DauTrang`. Primary button style `rounded-[9px] bg-[#b5642a] text-white`.
- **Shared files** (`app/actions.ts`, `components/TopNav*.tsx`, `app/globals.css`, `lib/supabase.ts`): run `bash tools/wt.sh ds` before editing; edits there are kept minimal and listed explicitly in the task.
- **Before editing an existing symbol** run `codegraph explore "<symbol>"` from the worktree root to list callers (repo has `.codegraph/`).
- **Ticket state is never changed** by line/suggestion code (feature 4).
- **Time zone** for "tháng"/"ngày báo": `Asia/Ho_Chi_Minh`.
- **Serial format:** `^[A-Z][0-9]{8}[A-Z0-9]{3}[0-9]{8}$` (20 chars) — identical to `bot_dong_bo_cts20_ghi`.
- **Commits:** one commit per task, explicit `git add <paths>` (never `-A`), git author `ai@gwt.vn`, message ends `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push the branch at the end of each working session (`git push -u origin feat/cskh-danh-muc-loi`).
- **Gates before calling it done:** `npx --prefix apps/web tsc --noEmit`, `npm --prefix apps/web run test`, `npm --prefix apps/web run build` all clean; every `db/cs/tests/*loi*`/`*ticket_may*` SQL test exits 0 on local.

## File Structure

| Path | Responsibility |
|---|---|
| `supabase/migrations/20261109120000_cs_loi_danh_muc.sql` | table `loi_danh_muc`, seed row `CHUA_PHAN_LOAI`, fn `cs_loi_khop` |
| `supabase/migrations/20261109121000_cs_ticket_may.sql` | table `ticket_may`, triggers on `tickets` |
| `supabase/migrations/20261109122000_cs_ticket_may_backfill.sql` | fn `cs_ticket_may_backfill(p_chay_thu)` (definition only — not executed by the migration) |
| `supabase/migrations/20261109123000_cs_loi_tan_suat.sql` | views `v_loi_ca`, `v_loi_so_ban`, `v_loi_so_nhap` |
| `db/cs/tests/loi_danh_muc.test.sql`, `ticket_may.test.sql`, `ticket_may_backfill.test.sql`, `loi_tan_suat.test.sql` | SQL tests (begin/rollback) |
| `apps/web/lib/loi/kieu.ts` | shared types |
| `apps/web/lib/loi/serial.ts` (+test) | serial normalisation / format check |
| `apps/web/lib/loi/dongMay.ts` (+test) | line label, suggested-handling decision |
| `apps/web/lib/loi/danhMucNhap.ts` (+test) | map reviewed Sheet rows → catalogue upserts / ticket assignments |
| `apps/web/lib/loi/tanSuat.ts` (+test) | frequency aggregation |
| `apps/web/app/ticket/loi-actions.ts` | all new server actions |
| `apps/web/lib/actions-guard.test.ts` | extend guard to the new actions file |
| `apps/web/app/danh-muc-loi/page.tsx` + `apps/web/components/loi/DanhMucLoiBang.tsx`, `NhapDanhMuc.tsx`, `PhanLoaiLai.tsx` | catalogue page |
| `apps/web/components/loi/SerialTraCuu.tsx`, `KhachMayTraCuu.tsx`, `DongMayNhap.tsx` | lookup + line inputs (create form) |
| `apps/web/components/loi/DongMayTicket.tsx` | line editor on detail page incl. suggestion |
| `apps/web/app/bao-cao-loi/page.tsx` + `apps/web/components/loi/BangTanSuat.tsx` | report |
| Modified: `apps/web/app/actions.ts` (Ticket type, `searchTickets`, `khoaTatCaTicket`, `createTicket`), `apps/web/app/ticket/page.tsx`, `apps/web/components/BangTicket.tsx`, `apps/web/components/TaoTicketForm.tsx`, `apps/web/app/ticket/[code]/page.tsx`, `apps/web/components/TopNavClient.tsx` | integration |

---

### Task 1: Migration — `loi_danh_muc` + `cs_loi_khop`

**Files:**
- Create: `supabase/migrations/20261109120000_cs_loi_danh_muc.sql`
- Test: `db/cs/tests/loi_danh_muc.test.sql`

**Interfaces:**
- Consumes: `public.issue_group(code)`, `public.khong_dau(text)`, `public.set_updated_at()`, `public.is_staff()` (all in baseline).
- Produces: table `public.loi_danh_muc(code text pk, nhom text → issue_group.code, ten text, aliases text[], ma_may text[], dau_hieu text, huong_xu_ly text, nguon text, trang_thai text in ('cho_duyet','da_duyet','ngung'), duyet_boi text, duyet_luc timestamptz, thu_tu int, created_at, updated_at)`; row `code='CHUA_PHAN_LOAI'`; function `public.cs_loi_khop(p_van_ban text, p_internal_code text) returns text` (never null; falls back to `'CHUA_PHAN_LOAI'`). `ma_may` holds ILIKE patterns (e.g. `{'CTS20%'}`); empty array = applies to every model.

- [ ] **Step 0: Prepare worktree + local DB**

```bash
cd ~/gwt-worktrees/feat-cskh-danh-muc-loi
bash tools/wt.sh ds
npm --prefix apps/web install
supabase start            # local only; stop it when done with DB tasks
npm --prefix apps/web run env:local
```

- [ ] **Step 1: Write the failing SQL test** — `db/cs/tests/loi_danh_muc.test.sql`

```sql
-- Test loi_danh_muc + cs_loi_khop (migration 20261109120000) — DB LOCAL, begin/rollback.
-- Chạy: docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/loi_danh_muc.test.sql
begin;
do $$
begin
  if not exists (select 1 from loi_danh_muc where code = 'CHUA_PHAN_LOAI' and trang_thai = 'da_duyet') then
    raise exception 'thiếu dòng CHUA_PHAN_LOAI';
  end if;

  insert into loi_danh_muc (code, ten, aliases, ma_may, trang_thai, huong_xu_ly) values
    ('T-RO-NUOC-DAY', 'Rò nước đáy', '{"rò nước đáy","chảy nước dưới đáy","ri nuoc day"}', '{"TCTS20%"}', 'da_duyet', 'Kiểm tra gioăng van xả đáy'),
    ('T-RO-NUOC', 'Rò nước (chung)', '{"rò nước","rò rỉ"}', '{}', 'da_duyet', null),
    ('T-E5', 'Lỗi E5 – gia nhiệt', '{"E5"}', '{"TGTUN%"}', 'da_duyet', null),
    ('T-NHAP', 'Chưa duyệt', '{"tiếng ồn"}', '{}', 'cho_duyet', null);

  -- khớp không dấu, ưu tiên mục riêng cho model + alias dài nhất
  if cs_loi_khop('Khách báo RÒ NƯỚC ĐÁY máy', 'TCTS20NG') <> 'T-RO-NUOC-DAY' then raise exception 'không khớp mục riêng model'; end if;
  if cs_loi_khop('khach bao ri nuoc day', 'TCTS20NG') <> 'T-RO-NUOC-DAY' then raise exception 'không khớp alias không dấu'; end if;
  -- model khác → rơi về mục chung
  if cs_loi_khop('rò nước đáy', 'TXYZ') <> 'T-RO-NUOC' then raise exception 'mục riêng model lọt sang model khác'; end if;
  -- không biết model → chỉ mục chung
  if cs_loi_khop('báo lỗi E5', null) <> 'CHUA_PHAN_LOAI' then raise exception 'E5 không có model vẫn khớp'; end if;
  if cs_loi_khop('báo lỗi E5', 'TGTUN-8600HP-G') <> 'T-E5' then raise exception 'E5 không khớp'; end if;
  -- mục chưa duyệt không được dùng
  if cs_loi_khop('máy có tiếng ồn', null) <> 'CHUA_PHAN_LOAI' then raise exception 'mục cho_duyet bị dùng'; end if;
  -- null an toàn
  if cs_loi_khop(null, null) <> 'CHUA_PHAN_LOAI' then raise exception 'null không ra CHUA_PHAN_LOAI'; end if;

  -- ràng buộc mã
  begin
    insert into loi_danh_muc (code, ten) values ('sai mã', 'x');
    raise exception 'mã sai dạng vẫn vào được';
  exception when check_violation then null;
  end;
end $$;
rollback;
```

- [ ] **Step 2: Run it — expect FAIL** (`relation "loi_danh_muc" does not exist`)

```bash
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/loi_danh_muc.test.sql
```

- [ ] **Step 3: Write the migration** — `supabase/migrations/20261109120000_cs_loi_danh_muc.sql`

```sql
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
comment on column public.loi_danh_muc.aliases is 'Các cách ghi (khớp chứa, không dấu, không phân biệt hoa thường).';
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
       and khong_dau(coalesce(p_van_ban, '')) like '%' || khong_dau(btrim(a.alias)) || '%'
       and (cardinality(d.ma_may) = 0 or coalesce(p_internal_code, '') ilike any (d.ma_may))
     order by (cardinality(d.ma_may) > 0) desc, length(a.alias) desc, d.thu_tu, d.code
     limit 1
  ), 'CHUA_PHAN_LOAI')
$$;

revoke all on function public.cs_loi_khop(text, text) from public, anon, authenticated;
grant execute on function public.cs_loi_khop(text, text) to service_role;
```

- [ ] **Step 4: Apply locally and run the test — expect exit 0**

```bash
supabase migration up
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/loi_danh_muc.test.sql && echo OK
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261109120000_cs_loi_danh_muc.sql db/cs/tests/loi_danh_muc.test.sql
git commit -m "feat(cskh): bảng danh mục lỗi + hàm khớp các cách ghi

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Migration — `ticket_may` + triggers that keep bots working

**Files:**
- Create: `supabase/migrations/20261109121000_cs_ticket_may.sql`
- Test: `db/cs/tests/ticket_may.test.sql`

**Interfaces:**
- Consumes: `loi_danh_muc`, `cs_loi_khop` (Task 1); `tickets`, `installed_base`, `serial_registry`.
- Produces: table `public.ticket_may(id uuid pk, ticket_code text → tickets on delete cascade, thu_tu int, serial text → installed_base null, source_serial text, internal_code text, loi_code text not null default 'CHUA_PHAN_LOAI' → loi_danh_muc, mo_ta text, huong_xu_ly text, huong_xu_ly_nguon text in ('danh_muc','cs') null, trang_thai text in ('dang_xu_ly','da_xu_ly','khong_loi') default 'dang_xu_ly', nguon text in ('app','tu_dong','backfill') default 'app', tao_boi text, created_at, updated_at)`. Behaviour: every INSERT into `tickets` creates exactly one line `nguon='tu_dong'`; an UPDATE of `tickets.serial`/`source_serial` fills serial/internal_code on the single auto line (and re-runs `cs_loi_khop` if still `CHUA_PHAN_LOAI`).

- [ ] **Step 1: Write the failing SQL test** — `db/cs/tests/ticket_may.test.sql`

```sql
-- Test ticket_may + trigger (migration 20261109121000). DB LOCAL, begin/rollback.
-- Mô phỏng ĐÚNG câu insert của bot_tao_ticket / bot_dong_bo_cts20_ghi (cột như bot ghi).
begin;
do $$
declare v_kh uuid; n int; r ticket_may%rowtype;
begin
  insert into loi_danh_muc (code, ten, aliases, ma_may, trang_thai)
  values ('T-RO-NUOC-DAY', 'Rò nước đáy', '{"rò nước đáy"}', '{"TCTS20%"}', 'da_duyet');
  insert into cs_customers (full_name) values ('Khách Bịa Test') returning id into v_kh;
  insert into installed_base (serial, internal_code, customer_id) values ('Z12345678ABC12345678', 'TCTS20NG', v_kh);

  -- 1) insert kiểu bot: serial chưa gắn (null), source_serial có
  insert into tickets (ticket_code, serial, source_serial, customer_id, ticket_type, description, state, khan, last_note, created_at)
  values ('TK-9911-901', null, 'Z12345678ABC12345678', v_kh, 'Bảo hành', 'Khách báo rò nước đáy', 'Open', false, 'Bot tạo', now());
  select count(*) into n from ticket_may where ticket_code = 'TK-9911-901';
  if n <> 1 then raise exception 'insert ticket phải sinh đúng 1 dòng máy, có %', n; end if;
  select * into r from ticket_may where ticket_code = 'TK-9911-901';
  if r.nguon <> 'tu_dong' or r.serial is not null or r.source_serial <> 'Z12345678ABC12345678' then raise exception 'dòng tự tạo sai: %', row_to_json(r); end if;
  if r.internal_code is distinct from 'TCTS20NG' then raise exception 'không suy được internal_code từ source_serial'; end if;
  if r.loi_code <> 'T-RO-NUOC-DAY' then raise exception 'không tự phân loại, được %', r.loi_code; end if;

  -- 2) bot gắn serial sau (update coalesce(serial, …)) → dòng tự động nhận serial
  update tickets set serial = 'Z12345678ABC12345678', updated_at = now() where ticket_code = 'TK-9911-901';
  select * into r from ticket_may where ticket_code = 'TK-9911-901';
  if r.serial is distinct from 'Z12345678ABC12345678' then raise exception 'update serial không đồng bộ sang dòng máy'; end if;

  -- 3) ticket không serial, mô tả lạ → CHUA_PHAN_LOAI, vẫn tạo được ticket
  insert into tickets (ticket_code, ticket_type, description) values ('TK-9911-902', 'Khác', 'hỏi giá lõi');
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-902') <> 'CHUA_PHAN_LOAI' then raise exception 'không về CHUA_PHAN_LOAI'; end if;

  -- 4) dòng do CS thêm (nguon=app) KHÔNG bị trigger update đụng tới
  insert into ticket_may (ticket_code, thu_tu, source_serial, nguon) values ('TK-9911-902', 2, 'X00000000AAA00000000', 'app');
  update tickets set source_serial = 'Y00000000AAA00000000' where ticket_code = 'TK-9911-902';
  if (select source_serial from ticket_may where ticket_code = 'TK-9911-902' and thu_tu = 2) <> 'X00000000AAA00000000' then
    raise exception 'trigger sửa dòng CS tự thêm';
  end if;

  -- 5) xoá ticket → cascade dòng máy (chỉ để chắc FK đúng; app không xoá ticket)
  delete from tickets where ticket_code = 'TK-9911-902';
  if exists (select 1 from ticket_may where ticket_code = 'TK-9911-902') then raise exception 'không cascade'; end if;
end $$;
rollback;
```

- [ ] **Step 2: Run — expect FAIL** (`relation "ticket_may" does not exist`)

```bash
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/ticket_may.test.sql
```

- [ ] **Step 3: Write the migration** — `supabase/migrations/20261109121000_cs_ticket_may.sql`

```sql
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
```

- [ ] **Step 4: Apply + run test — expect exit 0**

```bash
supabase migration up
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/ticket_may.test.sql && echo OK
```

- [ ] **Step 5: Bot compatibility check on LOCAL (real bot functions, not a copy)**

Load the bot's SQL into the local DB and call it inside a rolled-back transaction:

```bash
B=~/Bots/gwt-discord-bot/db/ticket
for f in bot-tao-ticket.sql bot-dong-bo-cts20-v3.sql; do
  docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$B/$f"
done
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 <<'SQL'
begin;
select bot_tao_ticket('{"discord_msg_id":"test-9911","link":"x","ticket_type":"Bảo hành","description":"rò nước đáy","ngay_tao":"2026-11-09","tac_gia":"test","ghi_chu":["a"]}'::jsonb) as kq \gset
select count(*) as so_dong from ticket_may where ticket_code = (:'kq'::jsonb ->> 'ticket_code');
rollback;
SQL
```

Expected: `bot_tao_ticket` returns a ticket code, `so_dong = 1`, no error. If `bot-dong-bo-cts20-v3.sql` depends on v2, load `bot-dong-bo-cts20-v2.sql` first. Do NOT copy bot SQL into this repo.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261109121000_cs_ticket_may.sql db/cs/tests/ticket_may.test.sql
git commit -m "feat(cskh): bảng dòng máy ticket_may + trigger tự sinh dòng cho mọi ticket (kể cả bot)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Migration — backfill function with dry-run report

**Files:**
- Create: `supabase/migrations/20261109122000_cs_ticket_may_backfill.sql`
- Test: `db/cs/tests/ticket_may_backfill.test.sql`

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces: `public.cs_ticket_may_backfill(p_chay_thu boolean default true) returns jsonb` with keys `chay_thu bool`, `so_ticket_chua_co_dong int`, `se_tao_theo_loi {loi_code: n}`, `se_tao_chua_phan_loai int`, `phan_loai_lai int` (auto/backfill lines currently `CHUA_PHAN_LOAI` that now match), `phan_loai_lai_theo_loi {loi_code: n}`, `mau_chua_phan_loai text[]` (≤ 30 ticket codes). `p_chay_thu = true` writes nothing. `false` inserts one `nguon='backfill'` line for each ticket without lines and reclassifies the matching `CHUA_PHAN_LOAI` auto lines. Idempotent. The migration DEFINES the function only and does not run it.

- [ ] **Step 1: Write the failing test** — `db/cs/tests/ticket_may_backfill.test.sql`

```sql
-- Test cs_ticket_may_backfill (migration 20261109122000). DB LOCAL, begin/rollback.
begin;
do $$
declare kq jsonb; n_truoc int; n_sau int;
begin
  alter table tickets disable trigger trg_tickets_tao_dong_may;   -- giả lập ticket CŨ (trước migration)
  insert into tickets (ticket_code, ticket_type, description) values
    ('TK-9911-951', 'Bảo hành', 'Rò rỉ nước ở đầu vòi lạnh'),
    ('TK-9911-952', 'Khác', 'hỏi giá');
  alter table tickets enable trigger trg_tickets_tao_dong_may;
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-RO-VOI-LANH', 'Rò nước đầu vòi lạnh', '{"đầu vòi lạnh"}', 'da_duyet');

  select count(*) into n_truoc from ticket_may;
  kq := cs_ticket_may_backfill(true);
  select count(*) into n_sau from ticket_may;
  if n_sau <> n_truoc then raise exception 'chạy thử mà vẫn ghi'; end if;
  if (kq->>'chay_thu')::boolean is not true then raise exception 'thiếu cờ chay_thu'; end if;
  if (kq->>'so_ticket_chua_co_dong')::int < 2 then raise exception 'đếm sai: %', kq; end if;
  if (kq->'se_tao_theo_loi'->>'T-RO-VOI-LANH')::int < 1 then raise exception 'báo cáo thiếu theo loại: %', kq; end if;
  if not (kq->'mau_chua_phan_loai') ? 'TK-9911-952' then raise exception 'mẫu chưa phân loại thiếu: %', kq; end if;

  kq := cs_ticket_may_backfill(false);
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-951') <> 'T-RO-VOI-LANH' then raise exception 'backfill sai mã'; end if;
  if (select nguon from ticket_may where ticket_code = 'TK-9911-951') <> 'backfill' then raise exception 'nguon sai'; end if;

  -- chạy lại không nhân đôi
  select count(*) into n_truoc from ticket_may;
  perform cs_ticket_may_backfill(false);
  select count(*) into n_sau from ticket_may;
  if n_sau <> n_truoc then raise exception 'không idempotent'; end if;

  -- phân loại lại: thêm alias mới → dòng CHUA_PHAN_LOAI tự lên mã; dòng CS đã chọn tay giữ nguyên
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-HOI-GIA', 'Hỏi giá', '{"hỏi giá"}', 'da_duyet');
  kq := cs_ticket_may_backfill(false);
  if (select loi_code from ticket_may where ticket_code = 'TK-9911-952') <> 'T-HOI-GIA' then raise exception 'không phân loại lại'; end if;
end $$;
rollback;
```

- [ ] **Step 2: Run — expect FAIL** (`function cs_ticket_may_backfill(boolean) does not exist`)

- [ ] **Step 3: Write the migration**

```sql
-- cs — BÙ dòng máy cho ticket cũ + phân loại lại (09/11/2026)
-- Migration CHỈ TẠO HÀM, không chạy. Trên prod anh Dũng chạy:
--   select jsonb_pretty(cs_ticket_may_backfill(true));   -- 1) xem báo cáo, KHÔNG ghi
--   select jsonb_pretty(cs_ticket_may_backfill(false));  -- 2) ghi thật (chạy lại vô hại)
-- Chỉ THÊM dòng ticket_may và đổi loi_code của dòng hệ thống còn CHUA_PHAN_LOAI; không đụng bảng cũ.
--
-- ROLLBACK:
--   drop function if exists public.cs_ticket_may_backfill(boolean);
--   (dữ liệu đã bù: delete from public.ticket_may where nguon = 'backfill';  -- chỉ khi anh Dũng quyết gỡ)

create or replace function public.cs_ticket_may_backfill(p_chay_thu boolean default true) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_bao_cao jsonb;
begin
  with chua as (
    select t.ticket_code, t.serial,
           nullif(upper(btrim(t.source_serial)), '') as source_serial,
           coalesce(ib.internal_code, sr.internal_code) as internal_code,
           cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), coalesce(ib.internal_code, sr.internal_code)) as loi_code
      from tickets t
      left join installed_base ib on ib.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
      left join serial_registry sr on sr.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
     where not exists (select 1 from ticket_may m where m.ticket_code = t.ticket_code)
  ), lai as (
    select m.id, cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), m.internal_code) as loi_moi
      from ticket_may m join tickets t on t.ticket_code = m.ticket_code
     where m.nguon in ('tu_dong', 'backfill') and m.loi_code = 'CHUA_PHAN_LOAI'
  )
  select jsonb_build_object(
    'chay_thu', p_chay_thu,
    'so_ticket_chua_co_dong', (select count(*) from chua),
    'se_tao_theo_loi', coalesce((select jsonb_object_agg(loi_code, n) from (select loi_code, count(*) n from chua group by 1) x), '{}'),
    'se_tao_chua_phan_loai', (select count(*) from chua where loi_code = 'CHUA_PHAN_LOAI'),
    'phan_loai_lai', (select count(*) from lai where loi_moi <> 'CHUA_PHAN_LOAI'),
    'phan_loai_lai_theo_loi', coalesce((select jsonb_object_agg(loi_moi, n) from (select loi_moi, count(*) n from lai where loi_moi <> 'CHUA_PHAN_LOAI' group by 1) y), '{}'),
    'mau_chua_phan_loai', coalesce((select jsonb_agg(ticket_code) from (select ticket_code from chua where loi_code = 'CHUA_PHAN_LOAI' order by ticket_code limit 30) z), '[]')
  ) into v_bao_cao;

  if not p_chay_thu then
    insert into ticket_may (ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, nguon, tao_boi, created_at)
    select t.ticket_code, 1, t.serial, nullif(upper(btrim(t.source_serial)), ''),
           coalesce(ib.internal_code, sr.internal_code),
           cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), coalesce(ib.internal_code, sr.internal_code)),
           t.description, 'backfill', 'cs_ticket_may_backfill', t.created_at
      from tickets t
      left join installed_base ib on ib.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
      left join serial_registry sr on sr.serial = coalesce(t.serial, nullif(upper(btrim(t.source_serial)), ''))
     where not exists (select 1 from ticket_may m where m.ticket_code = t.ticket_code);

    update ticket_may m
       set loi_code = l.loi_moi
      from (select m2.id, cs_loi_khop(concat_ws(' ', t.ticket_type, t.description), m2.internal_code) as loi_moi
              from ticket_may m2 join tickets t on t.ticket_code = m2.ticket_code
             where m2.nguon in ('tu_dong', 'backfill') and m2.loi_code = 'CHUA_PHAN_LOAI') l
     where m.id = l.id and l.loi_moi <> 'CHUA_PHAN_LOAI';
  end if;
  return v_bao_cao;
end $$;

revoke all on function public.cs_ticket_may_backfill(boolean) from public, anon, authenticated;
grant execute on function public.cs_ticket_may_backfill(boolean) to service_role;
```

- [ ] **Step 4: Apply + test — expect exit 0.** Then run the dry run on the local masked data and save the output for the PR:

```bash
supabase migration up
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/ticket_may_backfill.test.sql && echo OK
mkdir -p data/cskh-loi
docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -At -c "select jsonb_pretty(cs_ticket_may_backfill(true))" > data/cskh-loi/backfill-dry-run-local.json
cat data/cskh-loi/backfill-dry-run-local.json
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261109122000_cs_ticket_may_backfill.sql db/cs/tests/ticket_may_backfill.test.sql
git commit -m "feat(cskh): hàm bù dòng máy cho ticket cũ, có chế độ chạy thử báo cáo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Migration — report views

**Files:**
- Create: `supabase/migrations/20261109123000_cs_loi_tan_suat.sql`
- Test: `db/cs/tests/loi_tan_suat.test.sql`

**Interfaces:**
- Consumes: Tasks 1–2; `sales_order_lines(internal_code, order_date, quantity, fulfillment_status)`; `serial_registry(internal_code, imported_at, created_at)`; `issue_group`.
- Produces (no PII columns):
  - `v_loi_ca(id uuid, ticket_code, loi_code, loi_ten, nhom, nhom_ten, internal_code text not null — '(chưa rõ)' when unknown, may text, ngay_bao date, thang text 'YYYY-MM', install_date date, state text, trang_thai text)`
  - `v_loi_so_ban(internal_code, thang, so_ban numeric)`
  - `v_loi_so_nhap(internal_code, thang, so_nhap int)`

- [ ] **Step 1: Failing test** — `db/cs/tests/loi_tan_suat.test.sql`

```sql
begin;
do $$
declare r record;
begin
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-RO-VOI-LANH', 'Rò nước đầu vòi lạnh', '{"đầu vòi lạnh"}', 'da_duyet');
  insert into tickets (ticket_code, ticket_type, description, created_at)
  values ('TK-9911-971', 'Bảo hành', 'rò nước đầu vòi lạnh', '2026-10-31 18:00:00+00');  -- = 01/11 giờ VN
  select * into r from v_loi_ca where ticket_code = 'TK-9911-971';
  if r.thang <> '2026-11' then raise exception 'tháng phải theo giờ VN, được %', r.thang; end if;
  if r.loi_ten <> 'Rò nước đầu vòi lạnh' or r.internal_code <> '(chưa rõ)' then raise exception 'cột sai: %', row_to_json(r); end if;

  insert into sales_order_lines (id, source_tab, order_code, order_date, internal_code, quantity, fulfillment_status)
  values (-99101, 't', 'T1', '2026-10-05', 'TCTS20NG', 3, 'Đã giao'),
         (-99102, 't', 'T2', '2026-10-06', 'TCTS20NG', 5, 'Đã huỷ');
  if (select so_ban from v_loi_so_ban where internal_code = 'TCTS20NG' and thang = '2026-10') <> 3 then
    raise exception 'so_ban phải bỏ đơn huỷ';
  end if;
end $$;
rollback;
```

- [ ] **Step 2: Run — expect FAIL** (`relation "v_loi_ca" does not exist`). If `sales_order_lines.id` has no default and the negative ids clash, adjust only the literal ids.

- [ ] **Step 3: Write the migration**

```sql
-- cs — view cho báo cáo tần suất lỗi (09/11/2026). Chỉ đọc, không cột PII.
-- ROLLBACK:
--   drop view if exists public.v_loi_so_nhap;
--   drop view if exists public.v_loi_so_ban;
--   drop view if exists public.v_loi_ca;

create or replace view public.v_loi_ca with (security_invoker = true) as
select m.id, m.ticket_code, m.loi_code, d.ten as loi_ten, d.nhom, g.ten as nhom_ten,
       coalesce(m.internal_code, '(chưa rõ)') as internal_code,
       coalesce(m.serial, m.source_serial) as may,
       (t.created_at at time zone 'Asia/Ho_Chi_Minh')::date as ngay_bao,
       to_char(t.created_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM') as thang,
       ib.install_date, t.state, m.trang_thai
  from public.ticket_may m
  join public.tickets t on t.ticket_code = m.ticket_code
  join public.loi_danh_muc d on d.code = m.loi_code
  left join public.issue_group g on g.code = d.nhom
  left join public.installed_base ib on ib.serial = m.serial;

-- Máy BÁN theo mã nội bộ × tháng đặt (bỏ dòng huỷ/hoàn).
create or replace view public.v_loi_so_ban with (security_invoker = true) as
select internal_code, to_char(order_date, 'YYYY-MM') as thang, sum(coalesce(quantity, 0))::numeric as so_ban
  from public.sales_order_lines
 where internal_code is not null and order_date is not null
   and coalesce(fulfillment_status, '') !~* '(huỷ|hủy|cancel|hoàn)'
 group by 1, 2;

-- Máy NHẬP (serial nạp theo PO) theo mã × tháng nạp.
create or replace view public.v_loi_so_nhap with (security_invoker = true) as
select internal_code, to_char(coalesce(imported_at, created_at) at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM') as thang, count(*)::int as so_nhap
  from public.serial_registry
 where internal_code is not null
 group by 1, 2;

revoke all on public.v_loi_ca, public.v_loi_so_ban, public.v_loi_so_nhap from anon;
grant select on public.v_loi_ca, public.v_loi_so_ban, public.v_loi_so_nhap to authenticated, service_role;
```

- [ ] **Step 4: Apply + test — expect exit 0**
- [ ] **Step 5: Commit** (`git add` the two files; message `feat(cskh): view báo cáo tần suất lỗi` + Co-Authored-By line)

---

### Task 5: Pure libs — types, serial format, line label, suggestion rule

**Files:**
- Create: `apps/web/lib/loi/kieu.ts`, `apps/web/lib/loi/serial.ts`, `apps/web/lib/loi/dongMay.ts`
- Test: `apps/web/lib/loi/serial.test.ts`, `apps/web/lib/loi/dongMay.test.ts`

**Interfaces:**
- Produces:
  - `kieu.ts`: `TrangThaiLoi = 'cho_duyet'|'da_duyet'|'ngung'`; `LoiDanhMuc`; `TrangThaiDong = 'dang_xu_ly'|'da_xu_ly'|'khong_loi'`; `DongMay`; `DongMayInput`; `KetQuaTraSerial`; `MayCuaKhach`; `KhachVaMay` (definitions below).
  - `serial.ts`: `MAU_SERIAL: RegExp`; `chuanHoaSerial(s: string): string`; `kiemDangSerial(s: string): { chuan: string; hopLe: boolean; loi: string | null }`.
  - `dongMay.ts`: `CHUA_PHAN_LOAI = 'CHUA_PHAN_LOAI'`; `nhanDongMay(d: { internal_code: string | null; loi_code: string; loi_ten: string | null }): string`; `goiYHuongXuLy(dong: Pick<DongMay,'huong_xu_ly_nguon'>, loi: Pick<LoiDanhMuc,'trang_thai'|'huong_xu_ly'> | null): string | null`.

- [ ] **Step 1: Write `kieu.ts`** (types only, no test)

```ts
/** Kiểu dùng chung cho Danh mục lỗi / dòng máy / tra cứu (client + server). */
export type TrangThaiLoi = 'cho_duyet' | 'da_duyet' | 'ngung'
export type LoiDanhMuc = {
  code: string; nhom: string | null; ten: string; aliases: string[]; ma_may: string[]
  dau_hieu: string | null; huong_xu_ly: string | null; nguon: string | null
  trang_thai: TrangThaiLoi; duyet_boi: string | null; duyet_luc: string | null; thu_tu: number
}
export type TrangThaiDong = 'dang_xu_ly' | 'da_xu_ly' | 'khong_loi'
export type DongMay = {
  id: string; ticket_code: string; thu_tu: number
  serial: string | null; source_serial: string | null; internal_code: string | null
  loi_code: string; loi_ten: string | null
  mo_ta: string | null; huong_xu_ly: string | null; huong_xu_ly_nguon: 'danh_muc' | 'cs' | null
  trang_thai: TrangThaiDong; nguon: 'app' | 'tu_dong' | 'backfill'; created_at: string
}
/** Dữ liệu CS nhập cho một dòng (tạo ticket hoặc thêm dòng). serial = serial gõ (đã chuẩn hoá). */
export type DongMayInput = { serial?: string; loi_code?: string; mo_ta?: string; trang_thai?: TrangThaiDong }
export type KetQuaTraSerial =
  | { loai: 'sai_dang'; serial: string; loi: string }
  | { loai: 'da_lap'; serial: string; internal_code: string | null; product_name: string | null
      customer_id: string | null; customer_name: string | null; install_date: string | null; warranty_activated: boolean }
  | { loai: 'chua_kich_hoat'; serial: string; internal_code: string | null; product_name: string | null; trang_thai: string | null }
  | { loai: 'khong_co'; serial: string }
export type MayCuaKhach = { serial: string; internal_code: string | null; product_name: string | null; install_date: string | null; warranty_activated: boolean }
export type KhachVaMay = { id: string; full_name: string; primary_phone: string | null; may: MayCuaKhach[] }
```

- [ ] **Step 2: Failing tests** — `serial.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { chuanHoaSerial, kiemDangSerial } from './serial'

describe('lib/loi/serial', () => {
  it('chuẩn hoá: viết hoa, bỏ khoảng trắng', () => {
    expect(chuanHoaSerial(' z12345678 abc12345678 ')).toBe('Z12345678ABC12345678')
  })
  it('đúng dạng 1 chữ + 8 số + 3 chữ/số + 8 số', () => {
    expect(kiemDangSerial('Z12345678AB912345678')).toEqual({ chuan: 'Z12345678AB912345678', hopLe: true, loi: null })
  })
  it('thiếu ký tự → nói rõ đang có bao nhiêu', () => {
    const r = kiemDangSerial('Z1234567')
    expect(r.hopLe).toBe(false)
    expect(r.loi).toBe('Serial phải đủ 20 ký tự (đang có 8).')
  })
  it('đủ 20 nhưng sai khuôn', () => {
    expect(kiemDangSerial('112345678ABC12345678').loi).toBe('Sai dạng: 1 chữ + 8 số + 3 chữ/số + 8 số.')
  })
  it('rỗng → không hợp lệ, không có câu lỗi (chưa gõ)', () => {
    expect(kiemDangSerial('  ')).toEqual({ chuan: '', hopLe: false, loi: null })
  })
})
```

`dongMay.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { nhanDongMay, goiYHuongXuLy, CHUA_PHAN_LOAI } from './dongMay'

describe('lib/loi/dongMay', () => {
  it('nhãn "MÃ MÁY · Tên lỗi"', () => {
    expect(nhanDongMay({ internal_code: 'CTS20NG', loi_code: 'CTS20-RO-NUOC-DAY', loi_ten: 'Rò nước đáy' })).toBe('CTS20NG · Rò nước đáy')
  })
  it('chưa rõ máy / chưa phân loại', () => {
    expect(nhanDongMay({ internal_code: null, loi_code: CHUA_PHAN_LOAI, loi_ten: 'Chưa phân loại' })).toBe('Chưa rõ máy · Chưa phân loại')
  })
  it('gợi ý khi mục đã duyệt có hướng xử lý và dòng chưa xác nhận', () => {
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'da_duyet', huong_xu_ly: 'Thay gioăng' })).toBe('Thay gioăng')
  })
  it('không gợi ý: mục chưa duyệt, rỗng, hoặc CS đã xác nhận/sửa', () => {
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'cho_duyet', huong_xu_ly: 'x' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, { trang_thai: 'da_duyet', huong_xu_ly: '  ' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: 'cs' }, { trang_thai: 'da_duyet', huong_xu_ly: 'x' })).toBeNull()
    expect(goiYHuongXuLy({ huong_xu_ly_nguon: null }, null)).toBeNull()
  })
})
```

- [ ] **Step 3: Run — expect FAIL** (`npm --prefix apps/web run test -- lib/loi` → cannot find module)

- [ ] **Step 4: Implement**

`serial.ts`
```ts
/** Khuôn serial GWT — trùng khuôn bot_dong_bo_cts20_ghi (20 ký tự). */
export const MAU_SERIAL = /^[A-Z][0-9]{8}[A-Z0-9]{3}[0-9]{8}$/

export function chuanHoaSerial(s: string): string {
  return (s ?? '').toUpperCase().replace(/\s+/g, '')
}

export function kiemDangSerial(s: string): { chuan: string; hopLe: boolean; loi: string | null } {
  const chuan = chuanHoaSerial(s)
  if (!chuan) return { chuan, hopLe: false, loi: null }
  if (chuan.length !== 20) return { chuan, hopLe: false, loi: `Serial phải đủ 20 ký tự (đang có ${chuan.length}).` }
  if (!MAU_SERIAL.test(chuan)) return { chuan, hopLe: false, loi: 'Sai dạng: 1 chữ + 8 số + 3 chữ/số + 8 số.' }
  return { chuan, hopLe: true, loi: null }
}
```

`dongMay.ts`
```ts
import type { DongMay, LoiDanhMuc } from './kieu'

export const CHUA_PHAN_LOAI = 'CHUA_PHAN_LOAI'

export function nhanDongMay(d: { internal_code: string | null; loi_code: string; loi_ten: string | null }): string {
  const may = d.internal_code?.trim() || 'Chưa rõ máy'
  const loi = d.loi_ten?.trim() || (d.loi_code === CHUA_PHAN_LOAI ? 'Chưa phân loại' : d.loi_code)
  return `${may} · ${loi}`
}

/** Nội dung "Hướng xử lý đề xuất (theo danh mục lỗi)" — null = không hiện khối gợi ý. Không bao giờ đổi trạng thái ticket. */
export function goiYHuongXuLy(
  dong: Pick<DongMay, 'huong_xu_ly_nguon'>,
  loi: Pick<LoiDanhMuc, 'trang_thai' | 'huong_xu_ly'> | null,
): string | null {
  if (!loi || loi.trang_thai !== 'da_duyet') return null
  const nd = loi.huong_xu_ly?.trim()
  if (!nd) return null
  if (dong.huong_xu_ly_nguon) return null
  return nd
}
```

- [ ] **Step 5: Run — expect PASS**: `npm --prefix apps/web run test -- lib/loi`
- [ ] **Step 6: Commit** (`git add apps/web/lib/loi/kieu.ts apps/web/lib/loi/serial.ts apps/web/lib/loi/serial.test.ts apps/web/lib/loi/dongMay.ts apps/web/lib/loi/dongMay.test.ts`)

---

### Task 6: Pure lib — map reviewed Sheet rows to catalogue upserts / assignments

**Files:**
- Create: `apps/web/lib/loi/danhMucNhap.ts`
- Test: `apps/web/lib/loi/danhMucNhap.test.ts`

**Interfaces:**
- Consumes: `LoiDanhMuc` (Task 5).
- Produces:
  - `COT_DANH_MUC` — header contract of the Sheet tab "Danh mục lỗi": `Mã | Nhóm | Tên chuẩn | Các cách ghi | Mã máy áp dụng | Dấu hiệu | Phương án xử lý chuẩn | Nguồn | Ví dụ ticket | Duyệt | Ghi chú chị Hiền`.
  - `COT_GAN_TICKET` — tab "Gán ticket": `Mã ticket | Mã lỗi | Duyệt`.
  - `docDanhMuc(rows: Record<string, unknown>[], nhomHopLe: Set<string>): { hopLe: DongNhapLoi[]; loi: { dong: number; loi: string }[] }` where `DongNhapLoi = Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc' | 'thu_tu'> & { thu_tu: number }`.
  - `docGanTicket(rows: Record<string, unknown>[], maHopLe: Set<string>): { hopLe: { ticket_code: string; loi_code: string }[]; loi: { dong: number; loi: string }[] }`.
  - Lists in a cell are split on `;` or newline, trimmed, de-duplicated. "Duyệt" truthy = `x`, `có`, `co`, `ok`, `duyệt`, `đã duyệt`, `true`, `1` (case/diacritics-insensitive) → `da_duyet`; empty → `cho_duyet`; `ngừng`/`bỏ` → `ngung`. `dong` numbers are Sheet row numbers (header = row 1).

- [ ] **Step 1: Failing test**

```ts
import { describe, expect, it } from 'vitest'
import { docDanhMuc, docGanTicket } from './danhMucNhap'

const NHOM = new Set(['ro_nuoc', 'loi_dien'])

describe('lib/loi/danhMucNhap — đọc Sheet "Danh mục lỗi" đã duyệt', () => {
  it('đọc đủ cột, tách danh sách, hiểu cột Duyệt', () => {
    const r = docDanhMuc([{
      'Mã': 'cts20-ro-nuoc-day', 'Nhóm': 'ro_nuoc', 'Tên chuẩn': 'Rò nước đáy',
      'Các cách ghi': 'rò nước đáy; chảy nước dưới đáy\nrò nước đáy', 'Mã máy áp dụng': 'CTS20%',
      'Dấu hiệu': 'Nước đọng dưới đáy', 'Phương án xử lý chuẩn': 'Thay gioăng van xả', 'Nguồn': 'Sheet 261026', 'Duyệt': 'X',
    }], NHOM)
    expect(r.loi).toEqual([])
    expect(r.hopLe[0]).toMatchObject({
      code: 'CTS20-RO-NUOC-DAY', nhom: 'ro_nuoc', ten: 'Rò nước đáy',
      aliases: ['rò nước đáy', 'chảy nước dưới đáy'], ma_may: ['CTS20%'], trang_thai: 'da_duyet', thu_tu: 10,
    })
  })
  it('báo lỗi theo số dòng Sheet: thiếu tên, mã sai, nhóm lạ, trùng mã', () => {
    const r = docDanhMuc([
      { 'Mã': 'A1', 'Tên chuẩn': '' },
      { 'Mã': 'sai mã!', 'Tên chuẩn': 'x' },
      { 'Mã': 'B1', 'Tên chuẩn': 'x', 'Nhóm': 'khong_co' },
      { 'Mã': 'C1', 'Tên chuẩn': 'x' }, { 'Mã': 'C1', 'Tên chuẩn': 'y' },
    ], NHOM)
    expect(r.loi.map((l) => l.dong)).toEqual([2, 3, 4, 6])
    expect(r.hopLe.map((d) => d.code)).toEqual(['C1'])
  })
  it('Mã máy áp dụng không có % thì thêm % cuối (khớp tiền tố)', () => {
    expect(docDanhMuc([{ 'Mã': 'E5', 'Tên chuẩn': 'Lỗi E5', 'Mã máy áp dụng': 'GTUN-8600HP-G' }], NHOM).hopLe[0].ma_may).toEqual(['GTUN-8600HP-G%'])
  })
  it('không cho ghi đè mã hệ thống CHUA_PHAN_LOAI', () => {
    expect(docDanhMuc([{ 'Mã': 'CHUA_PHAN_LOAI', 'Tên chuẩn': 'x' }], NHOM).loi[0].loi).toMatch(/hệ thống/)
  })
})

describe('docGanTicket', () => {
  it('chỉ lấy dòng đã duyệt, mã lỗi phải có trong danh mục', () => {
    const r = docGanTicket([
      { 'Mã ticket': 'TK-2610-001', 'Mã lỗi': 'cts20-ro-nuoc-day', 'Duyệt': 'có' },
      { 'Mã ticket': 'TK-2610-002', 'Mã lỗi': 'KHONG-CO', 'Duyệt': 'x' },
      { 'Mã ticket': 'TK-2610-003', 'Mã lỗi': 'CTS20-RO-NUOC-DAY', 'Duyệt': '' },
    ], new Set(['CTS20-RO-NUOC-DAY']))
    expect(r.hopLe).toEqual([{ ticket_code: 'TK-2610-001', loi_code: 'CTS20-RO-NUOC-DAY' }])
    expect(r.loi).toEqual([{ dong: 3, loi: 'Mã lỗi "KHONG-CO" không có trong danh mục.' }])
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement** — `danhMucNhap.ts`

```ts
import type { LoiDanhMuc, TrangThaiLoi } from './kieu'
import { boDau } from '@/bang/timkiem'

export const COT_DANH_MUC = ['Mã', 'Nhóm', 'Tên chuẩn', 'Các cách ghi', 'Mã máy áp dụng', 'Dấu hiệu',
  'Phương án xử lý chuẩn', 'Nguồn', 'Ví dụ ticket', 'Duyệt', 'Ghi chú chị Hiền'] as const
export const COT_GAN_TICKET = ['Mã ticket', 'Mã lỗi', 'Duyệt'] as const

export type DongNhapLoi = Omit<LoiDanhMuc, 'duyet_boi' | 'duyet_luc' | 'thu_tu'> & { thu_tu: number }
type Loi = { dong: number; loi: string }

const MA = /^[A-Z0-9][A-Z0-9_-]{1,39}$/
const o = (r: Record<string, unknown>, k: string) => String(r[k] ?? '').trim()
const tachDs = (s: string) => [...new Set(s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean))]

function trangThai(s: string): TrangThaiLoi {
  const k = boDau(s).toLowerCase().trim()
  if (['x', 'co', 'ok', 'duyet', 'da duyet', 'true', '1'].includes(k)) return 'da_duyet'
  if (['ngung', 'bo'].includes(k)) return 'ngung'
  return 'cho_duyet'
}

export function docDanhMuc(rows: Record<string, unknown>[], nhomHopLe: Set<string>): { hopLe: DongNhapLoi[]; loi: Loi[] } {
  const hopLe: DongNhapLoi[] = []
  const loi: Loi[] = []
  const daCo = new Set<string>()
  rows.forEach((r, i) => {
    const dong = i + 2
    const code = o(r, 'Mã').toUpperCase()
    const ten = o(r, 'Tên chuẩn')
    const nhom = o(r, 'Nhóm') || null
    if (!ten) return void loi.push({ dong, loi: 'Thiếu "Tên chuẩn".' })
    if (!MA.test(code)) return void loi.push({ dong, loi: `Mã "${code}" sai dạng (chữ in/số/-/_; 2–40 ký tự).` })
    if (code === 'CHUA_PHAN_LOAI') return void loi.push({ dong, loi: 'CHUA_PHAN_LOAI là mã hệ thống, không nhập từ Sheet.' })
    if (nhom && !nhomHopLe.has(nhom)) return void loi.push({ dong, loi: `Nhóm "${nhom}" không có trong Nhóm lỗi.` })
    if (daCo.has(code)) return void loi.push({ dong, loi: `Trùng mã ${code}.` })
    daCo.add(code)
    hopLe.push({
      code, nhom, ten,
      aliases: tachDs(o(r, 'Các cách ghi')),
      ma_may: tachDs(o(r, 'Mã máy áp dụng')).map((m) => (m.includes('%') ? m : `${m}%`)),
      dau_hieu: o(r, 'Dấu hiệu') || null,
      huong_xu_ly: o(r, 'Phương án xử lý chuẩn') || null,
      nguon: o(r, 'Nguồn') || null,
      trang_thai: trangThai(o(r, 'Duyệt')),
      thu_tu: (hopLe.length + 1) * 10,
    })
  })
  return { hopLe, loi }
}

export function docGanTicket(rows: Record<string, unknown>[], maHopLe: Set<string>) {
  const hopLe: { ticket_code: string; loi_code: string }[] = []
  const loi: Loi[] = []
  rows.forEach((r, i) => {
    const dong = i + 2
    if (trangThai(o(r, 'Duyệt')) !== 'da_duyet') return
    const ticket_code = o(r, 'Mã ticket')
    const loi_code = o(r, 'Mã lỗi').toUpperCase()
    if (!ticket_code) return void loi.push({ dong, loi: 'Thiếu mã ticket.' })
    if (!maHopLe.has(loi_code)) return void loi.push({ dong, loi: `Mã lỗi "${o(r, 'Mã lỗi')}" không có trong danh mục.` })
    hopLe.push({ ticket_code, loi_code })
  })
  return { hopLe, loi }
}
```

Note: `@/bang/timkiem` exports `boDau` (already imported that way by `app/actions.ts`).

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** (both files; `feat(cskh): đọc Sheet danh mục lỗi đã duyệt`)

---

### Task 7: Pure lib — frequency aggregation

**Files:**
- Create: `apps/web/lib/loi/tanSuat.ts`
- Test: `apps/web/lib/loi/tanSuat.test.ts`

**Interfaces:**
- Consumes: row shapes of `v_loi_ca`, `v_loi_so_ban`, `v_loi_so_nhap` (Task 4).
- Produces:
```ts
export type DongCa = { ticket_code: string; loi_code: string; loi_ten: string; nhom: string | null; nhom_ten: string | null
  internal_code: string; may: string | null; ngay_bao: string; thang: string; install_date: string | null }
export type MauSo = { internal_code: string; thang: string; so: number }
export type DongTanSuat = { nhom_ten: string; loi_code: string; loi_ten: string; internal_code: string
  theo_thang: Record<string, number>; so_ca: number
  ban_luy_ke: number | null; nhap_luy_ke: number | null
  ty_le_ban: number | null; ty_le_nhap: number | null   // % số ca / máy lũy kế đến hết `den`
  trung_vi_ngay_chay: number | null; so_may_lap_lai: number }
export function trungVi(xs: number[]): number | null
export function tinhTanSuat(ca: DongCa[], ban: MauSo[], nhap: MauSo[], loc: { tu?: string; den?: string }): DongTanSuat[]
```
Rules: filter `ca` by `tu ≤ thang ≤ den` ('YYYY-MM'); group by `loi_code × internal_code`; denominators = sum of `so` for that `internal_code` with `thang ≤ den` (all-time if no `den`), null when 0/absent; `ty_le` = round(so_ca / mẫu × 100, 2 decimals); run-time = days from `install_date` to `ngay_bao` (ignore null/negative); `so_may_lap_lai` = number of distinct non-null `may` with ≥ 2 distinct `ticket_code` in the group; sort `so_ca` desc, then `loi_ten`, `internal_code`; `nhom_ten` fallback `'(chưa gắn nhóm)'`.

- [ ] **Step 1: Failing test**

```ts
import { describe, expect, it } from 'vitest'
import { tinhTanSuat, trungVi, type DongCa } from './tanSuat'

const ca = (p: Partial<DongCa>): DongCa => ({ ticket_code: 'T', loi_code: 'L1', loi_ten: 'Rò nước đáy', nhom: 'ro_nuoc', nhom_ten: 'Rò nước',
  internal_code: 'CTS20NG', may: null, ngay_bao: '2026-10-10', thang: '2026-10', install_date: null, ...p })

describe('lib/loi/tanSuat', () => {
  it('trung vị', () => {
    expect(trungVi([])).toBeNull(); expect(trungVi([5, 1, 3])).toBe(3); expect(trungVi([1, 2, 3, 10])).toBe(2.5)
  })
  it('gom theo lỗi × model, đếm theo tháng, tỷ lệ theo bán lũy kế, ngày chạy, lặp lại', () => {
    const r = tinhTanSuat([
      ca({ ticket_code: 'A', may: 'S1', install_date: '2026-09-10', ngay_bao: '2026-10-10' }),
      ca({ ticket_code: 'B', may: 'S1', thang: '2026-11', ngay_bao: '2026-11-01', install_date: '2026-09-10' }),
      ca({ ticket_code: 'C', may: 'S2' }),
      ca({ ticket_code: 'D', loi_code: 'L2', loi_ten: 'E5', internal_code: 'GTUN', nhom: null, nhom_ten: null }),
    ], [{ internal_code: 'CTS20NG', thang: '2026-08', so: 100 }, { internal_code: 'CTS20NG', thang: '2026-12', so: 999 }],
       [], { tu: '2026-10', den: '2026-11' })
    expect(r[0]).toMatchObject({ loi_code: 'L1', internal_code: 'CTS20NG', so_ca: 3, theo_thang: { '2026-10': 2, '2026-11': 1 },
      ban_luy_ke: 100, ty_le_ban: 3, nhap_luy_ke: null, ty_le_nhap: null, trung_vi_ngay_chay: 41, so_may_lap_lai: 1 })
    expect(r[1]).toMatchObject({ loi_code: 'L2', nhom_ten: '(chưa gắn nhóm)', so_ca: 1, ty_le_ban: null })
  })
  it('lọc tháng ngoài khoảng', () => {
    expect(tinhTanSuat([ca({ thang: '2026-01' })], [], [], { tu: '2026-10' })).toEqual([])
  })
})
```

(Run-time check: 2026-09-10 → 2026-10-10 = 30 days, → 2026-11-01 = 52 days; the third row has no install_date → median of [30, 52] = 41.)

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```ts
export type DongCa = { ticket_code: string; loi_code: string; loi_ten: string; nhom: string | null; nhom_ten: string | null
  internal_code: string; may: string | null; ngay_bao: string; thang: string; install_date: string | null }
export type MauSo = { internal_code: string; thang: string; so: number }
export type DongTanSuat = { nhom_ten: string; loi_code: string; loi_ten: string; internal_code: string
  theo_thang: Record<string, number>; so_ca: number; ban_luy_ke: number | null; nhap_luy_ke: number | null
  ty_le_ban: number | null; ty_le_nhap: number | null; trung_vi_ngay_chay: number | null; so_may_lap_lai: number }

export function trungVi(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const g = Math.floor(s.length / 2)
  return s.length % 2 ? s[g] : (s[g - 1] + s[g]) / 2
}

const NGAY = 86_400_000
const soNgay = (tu: string, den: string) => Math.round((Date.parse(den) - Date.parse(tu)) / NGAY)
const tyLe = (a: number, b: number | null) => (b ? Math.round((a / b) * 10000) / 100 : null)

function luyKe(ds: MauSo[], ma: string, den?: string): number | null {
  const t = ds.filter((m) => m.internal_code === ma && (!den || m.thang <= den)).reduce((s, m) => s + Number(m.so || 0), 0)
  return t > 0 ? t : null
}

export function tinhTanSuat(ca: DongCa[], ban: MauSo[], nhap: MauSo[], loc: { tu?: string; den?: string }): DongTanSuat[] {
  const nhomLai = new Map<string, DongCa[]>()
  for (const c of ca) {
    if (loc.tu && c.thang < loc.tu) continue
    if (loc.den && c.thang > loc.den) continue
    const k = `${c.loi_code}\u0000${c.internal_code}`
    const ds = nhomLai.get(k) ?? []
    ds.push(c); nhomLai.set(k, ds)
  }
  const ra: DongTanSuat[] = []
  for (const ds of nhomLai.values()) {
    const d0 = ds[0]
    const theo_thang: Record<string, number> = {}
    for (const c of ds) theo_thang[c.thang] = (theo_thang[c.thang] ?? 0) + 1
    const ngayChay = ds.filter((c) => c.install_date).map((c) => soNgay(c.install_date!, c.ngay_bao)).filter((n) => n >= 0)
    const theoMay = new Map<string, Set<string>>()
    for (const c of ds) if (c.may) theoMay.set(c.may, (theoMay.get(c.may) ?? new Set()).add(c.ticket_code))
    const ban_luy_ke = luyKe(ban, d0.internal_code, loc.den)
    const nhap_luy_ke = luyKe(nhap, d0.internal_code, loc.den)
    ra.push({
      nhom_ten: d0.nhom_ten ?? '(chưa gắn nhóm)', loi_code: d0.loi_code, loi_ten: d0.loi_ten, internal_code: d0.internal_code,
      theo_thang, so_ca: ds.length, ban_luy_ke, nhap_luy_ke,
      ty_le_ban: tyLe(ds.length, ban_luy_ke), ty_le_nhap: tyLe(ds.length, nhap_luy_ke),
      trung_vi_ngay_chay: trungVi(ngayChay),
      so_may_lap_lai: [...theoMay.values()].filter((s) => s.size >= 2).length,
    })
  }
  return ra.sort((a, b) => b.so_ca - a.so_ca || a.loi_ten.localeCompare(b.loi_ten, 'vi') || a.internal_code.localeCompare(b.internal_code))
}
```

- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** (`feat(cskh): tính tần suất lỗi theo nhóm × model × tháng`)

---

### Task 8: Server actions — `app/ticket/loi-actions.ts` + guard test

**Files:**
- Create: `apps/web/app/ticket/loi-actions.ts`
- Modify: `apps/web/lib/actions-guard.test.ts` (scan the new file too)

**Interfaces:**
- Consumes: Tasks 1–7; `requireStaff`, `layNhanVien` (`@/lib/nen-tang/phien`), `doQuyen`, `coQuyen` (`@/lib/nen-tang/kiem-quyen`), `dataClient` (`@/lib/nen-tang/db`), `ghiAudit` (`@/lib/nen-tang/nhat-ky`), `KHONG_DU_QUYEN` (`@/lib/nen-tang/nhan-su-luat`), `boDau` (`@/bang/timkiem`), `XLSX` (`xlsx`).
- Produces (all `export async function`, `'use server'`; results `{ ok: true, … } | { ok: false; error: string }` for writes):
  - `danhMucLoi(chiDaDuyet?: boolean): Promise<LoiDanhMuc[]>` — view `cs.ticket.xem`.
  - `luuLoi(input: Omit<LoiDanhMuc, 'duyet_boi'|'duyet_luc'>): KQ` — upsert one entry (QUANLY `cs.nhom_loi.cau_hinh`); `trang_thai='da_duyet'` sets `duyet_boi`=current email, `duyet_luc`=now.
  - `datTrangThaiLoi(code: string, trang_thai: TrangThaiLoi): KQ` — same gate; refuses `CHUA_PHAN_LOAI`.
  - `xemTruocNhapDanhMuc(fd: FormData): Promise<{ ok: true; danhMuc: ReturnType<typeof docDanhMuc>; ganTicket: ReturnType<typeof docGanTicket> } | {ok:false;error}>` — reads uploaded `.xlsx`/`.csv` (`fd.get('file')`), tabs "Danh mục lỗi" and "Gán ticket" (if present); no writes.
  - `nhapDanhMuc(fd: FormData): KQ<{ so_loi: number; so_gan: number }>` — re-parses, upserts catalogue (`on conflict (code)`), then for each approved assignment updates the ticket's lines `where ticket_code = ? and nguon in ('tu_dong','backfill')` (never lines CS added); audit `nhap_danh_muc_loi`.
  - `phanLoaiLai(chayThu: boolean): Promise<{ ok: true; baoCao: Record<string, unknown> } | {ok:false;error}>` — `rpc('cs_ticket_may_backfill', { p_chay_thu: chayThu })`; QUANLY gate; audit when `!chayThu`.
  - `dongMayCuaTicket(code: string): Promise<DongMay[]>` and `dongMayTheoTickets(codes: string[]): Promise<Record<string, DongMay[]>>` — select `ticket_may` + `loi_danh_muc(ten)`, ordered by `thu_tu`.
  - `ticketCodesTheoLoi(loiCode: string): Promise<string[]>`.
  - `themDongMay(code: string, input: DongMayInput): KQ<{ id: string }>`; `suaDongMay(id: string, patch: DongMayInput & { huong_xu_ly?: string }): KQ`; `xoaDongMay(id: string): KQ` (refuses when it is the ticket's last line; audit with row snapshot); `xacNhanHuongXuLy(id: string, noiDung: string, tuDanhMuc: boolean): KQ` (sets `huong_xu_ly`, `huong_xu_ly_nguon = tuDanhMuc ? 'danh_muc' : 'cs'`; never touches `tickets.state`).
  - `ganDongMayChoTicketMoi(code: string, dong: DongMayInput[]): KQ` — used by `createTicket`: updates the trigger's auto line (`nguon='tu_dong'`, `thu_tu=1`) with `dong[0]`, inserts the rest with `nguon='app'`, `thu_tu` 2…n.
  - `traSerial(raw: string): Promise<KetQuaTraSerial>` — `kiemDangSerial`; if format invalid AND serial not found in `v_installed_base`/`v_serial_kho` → `sai_dang`; `v_installed_base` row → `da_lap`; else `v_serial_kho` row → `chua_kich_hoat`; else `khong_co`. Gate `cs.may.xem`.
  - `traKhachVaMay(q: string): Promise<KhachVaMay[]>` — ≥ 2 chars; digits-only input (≥ 6 digits) matches last-9 of `cs_customers.primary_phone` and `customer_contacts.phone`; otherwise `ten_kd ilike %boDau(q)%`; skip `trang_thai='da_xoa'`; ≤ 8 customers; machines from `v_installed_base` by `customer_id`. Gate `cs.khach.xem`.
- Line serial resolution rule (shared helper `giaiSerial(db, s)` inside the file): normalised serial; if present in `installed_base` → `serial` = it, `internal_code` from there; else `serial = null`, `source_serial` = it, `internal_code` from `serial_registry` if found. A line serial with invalid format that exists nowhere → `{ ok:false, error: kiemDangSerial(s).loi }`.
- `loi_code` on insert/update must exist with `trang_thai <> 'ngung'` (else error "Mã lỗi không dùng được").

- [ ] **Step 1: Extend the guard test (failing first)** — in `apps/web/lib/actions-guard.test.ts` add a second `describe` that runs the same scan on `../app/ticket/loi-actions.ts` and expects `soHamGate > 10`. Run `npm --prefix apps/web run test -- lib/actions-guard` → FAIL (file not found).

```ts
const srcLoi = readFileSync(fileURLToPath(new URL('../app/ticket/loi-actions.ts', import.meta.url)), 'utf8')
describe('app/ticket/loi-actions.ts — mọi hàm chạm DB đều gác requireStaff()', () => {
  const doan = srcLoi.split(/(?=async function )/)
  const viPham = doan.flatMap((p) => {
    const m = p.match(/\basync function (\w+)/)
    return m && p.includes('dataClient(') && !/\b(requireStaff|layNhanVien)\b/.test(p) ? [m[1]] : []
  })
  it('không hàm nào thiếu requireStaff()', () => expect(viPham).toEqual([]))
  it('quét được thân file', () => {
    expect(doan.filter((p) => p.includes('dataClient(') && /\brequireStaff\b/.test(p)).length).toBeGreaterThan(10)
  })
})
```

- [ ] **Step 2: Write `loi-actions.ts`.** Skeleton + representative bodies (every function follows the same gate → query → `revalidatePath` pattern):

```ts
'use server'

import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff, layNhanVien } from '@/lib/nen-tang/phien'
import { coQuyen, doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KHONG_DU_QUYEN } from '@/lib/nen-tang/nhan-su-luat'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { boDau } from '@/bang/timkiem'
import { kiemDangSerial } from '@/lib/loi/serial'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import { docDanhMuc, docGanTicket } from '@/lib/loi/danhMucNhap'
import type { DongMay, DongMayInput, KetQuaTraSerial, KhachVaMay, LoiDanhMuc, TrangThaiLoi } from '@/lib/loi/kieu'

type KQ<T = object> = ({ ok: true } & T) | { ok: false; error: string }
const COT_DONG = 'id, ticket_code, thu_tu, serial, source_serial, internal_code, loi_code, mo_ta, huong_xu_ly, huong_xu_ly_nguon, trang_thai, nguon, created_at, loi_danh_muc(ten)'
type DongDb = Omit<DongMay, 'loi_ten'> & { loi_danh_muc: { ten: string } | null }
const raDong = (r: DongDb): DongMay => { const { loi_danh_muc, ...x } = r; return { ...x, loi_ten: loi_danh_muc?.ten ?? null } }

async function quanLyDanhMuc(): Promise<boolean> {
  return coQuyen('cs.nhom_loi.cau_hinh', 'QUANLY')
}

export async function danhMucLoi(chiDaDuyet = false): Promise<LoiDanhMuc[]> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  let q = dataClient().from('loi_danh_muc').select('*').order('thu_tu').order('code')
  if (chiDaDuyet) q = q.eq('trang_thai', 'da_duyet')
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as LoiDanhMuc[]
}

export async function dongMayTheoTickets(codes: string[]): Promise<Record<string, DongMay[]>> {
  await requireStaff()
  await doQuyen('cs.ticket.xem')
  if (!codes.length) return {}
  const { data, error } = await dataClient().from('ticket_may').select(COT_DONG)
    .in('ticket_code', codes).order('ticket_code').order('thu_tu')
  if (error) throw new Error(error.message)
  const ra: Record<string, DongMay[]> = {}
  for (const r of (data ?? []) as unknown as DongDb[]) (ra[r.ticket_code] ??= []).push(raDong(r))
  return ra
}

export async function xoaDongMay(id: string): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const db = dataClient()
  const { data: d, error: e0 } = await db.from('ticket_may').select('*').eq('id', id).maybeSingle()
  if (e0) return { ok: false, error: e0.message }
  if (!d) return { ok: false, error: 'Không thấy dòng máy.' }
  const { count } = await db.from('ticket_may').select('id', { count: 'exact', head: true }).eq('ticket_code', d.ticket_code)
  if ((count ?? 0) <= 1) return { ok: false, error: 'Ticket phải còn ít nhất một dòng máy.' }
  const { error } = await db.from('ticket_may').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await ghiAudit('xoa_dong_may', `ticket:${d.ticket_code}`, { dong: d })
  revalidatePath(`/ticket/${d.ticket_code}`); revalidatePath('/ticket')
  return { ok: true }
}

export async function xacNhanHuongXuLy(id: string, noiDung: string, tuDanhMuc: boolean): Promise<KQ> {
  await requireStaff()
  await doQuyen('cs.ticket.tao_sua')
  const nd = noiDung.trim()
  if (!nd) return { ok: false, error: 'Hướng xử lý không được trống.' }
  const { data, error } = await dataClient().from('ticket_may')
    .update({ huong_xu_ly: nd, huong_xu_ly_nguon: tuDanhMuc ? 'danh_muc' : 'cs' })
    .eq('id', id).select('ticket_code').maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (data) revalidatePath(`/ticket/${data.ticket_code}`)
  return { ok: true }   // KHÔNG đụng tickets.state
}

export async function traSerial(raw: string): Promise<KetQuaTraSerial> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const k = kiemDangSerial(raw)
  const db = dataClient()
  const { data: m } = await db.from('v_installed_base')
    .select('serial, internal_code, product_name, customer_id, customer_name, install_date, warranty_activated')
    .eq('serial', k.chuan).maybeSingle()
  if (m) return { loai: 'da_lap', ...(m as Omit<Extract<KetQuaTraSerial, { loai: 'da_lap' }>, 'loai'>) }
  const { data: s } = await db.from('v_serial_kho').select('serial, ma_noi_bo, ten_noi_bo, trang_thai').eq('serial', k.chuan).maybeSingle()
  if (s) return { loai: 'chua_kich_hoat', serial: s.serial, internal_code: s.ma_noi_bo, product_name: s.ten_noi_bo, trang_thai: s.trang_thai }
  if (!k.hopLe) return { loai: 'sai_dang', serial: k.chuan, loi: k.loi ?? 'Chưa nhập serial.' }
  return { loai: 'khong_co', serial: k.chuan }
}
```

Implement the remaining functions listed under **Interfaces** with the same structure. Specifics the implementer must not improvise:
- `xemTruocNhapDanhMuc` / `nhapDanhMuc`: `const wb = XLSX.read(Buffer.from(await (fd.get('file') as File).arrayBuffer()))`; tab lookup by exact name `'Danh mục lỗi'` / `'Gán ticket'`, falling back to the first sheet for the catalogue when the file is a CSV; rows via `XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })`. `nhomHopLe` = all `issue_group.code`. For `docGanTicket`, `maHopLe` = codes in the DB **plus** codes being imported in the same file. Refuse to write when either parser returns any `loi` (return the first 10 errors joined by `\n`).
- `phanLoaiLai`: `const { data, error } = await dataClient().rpc('cs_ticket_may_backfill', { p_chay_thu: chayThu })`.
- `ticketCodesTheoLoi`: `select('ticket_code').eq('loi_code', loiCode)`, de-duplicated.
- `traKhachVaMay`: phone path uses `customer_contacts.select('customer_id').ilike('phone', '%' + cuoi9)` and `cs_customers.ilike('primary_phone', '%' + cuoi9)`; name path uses `cs_customers.ilike('ten_kd', '%' + boDau(q).toLowerCase() + '%')` (escape `%`/`_` like `searchCustomers` does).
- Every write revalidates `/ticket/${code}` and `/ticket`; catalogue writes revalidate `/danh-muc-loi`.

- [ ] **Step 3: Run guard test + typecheck — expect PASS**

```bash
npm --prefix apps/web run test -- lib/actions-guard
npx --prefix apps/web tsc --noEmit
```

- [ ] **Step 4: Manual smoke on local** (dev server not needed): write a throw-away vitest is NOT required; instead verify in Tasks 9–12 through the UI.

- [ ] **Step 5: Commit** (`git add apps/web/app/ticket/loi-actions.ts apps/web/lib/actions-guard.test.ts`; `feat(cskh): server action danh mục lỗi, dòng máy, tra serial/khách`)

---

### Task 9: UI — catalogue page `/danh-muc-loi`

**Files:**
- Create: `apps/web/app/danh-muc-loi/page.tsx`, `apps/web/components/loi/DanhMucLoiBang.tsx`, `apps/web/components/loi/NhapDanhMuc.tsx`, `apps/web/components/loi/PhanLoaiLai.tsx`
- Modify: `apps/web/components/TopNavClient.tsx` (shared — `wt.sh ds` first): in the `'Ticket & lỗi'` group add `{ nhan: 'Danh mục lỗi', href: '/danh-muc-loi' }` and `{ nhan: 'Báo cáo lỗi', href: '/bao-cao-loi' }` after `Nhóm lỗi`; add `['/danh-muc-loi', '/danh-muc-loi'], ['/bao-cao-loi', '/bao-cao-loi']` beside `['/nhom-loi/', '/nhom-loi']` only if that array maps sub-routes (read it first).

**Interfaces:**
- Consumes: `danhMucLoi`, `luuLoi`, `datTrangThaiLoi`, `xemTruocNhapDanhMuc`, `nhapDanhMuc`, `phanLoaiLai` (Task 8); `hoiQuyen`; `DauTrang`; `OTimKiem`, `ThanhDangLoc`, `BoLocChon` from `@/bang`.
- Produces: route `/danh-muc-loi?q=&tt=` (tt ∈ `cho_duyet|da_duyet|ngung`).

- [ ] **Step 1: Page** — server component:

```tsx
import { Suspense } from 'react'
import { danhMucLoi } from '@/app/ticket/loi-actions'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { DauTrang } from '@/components/DauTrang'
import { OTimKiem, BoLocChon, ThanhDangLoc, boDau } from '@/bang'
import { DanhMucLoiBang } from '@/components/loi/DanhMucLoiBang'
import { NhapDanhMuc } from '@/components/loi/NhapDanhMuc'
import { PhanLoaiLai } from '@/components/loi/PhanLoaiLai'

const TT = [{ giaTri: 'cho_duyet', nhan: 'Chờ duyệt' }, { giaTri: 'da_duyet', nhan: 'Đã duyệt' }, { giaTri: 'ngung', nhan: 'Ngừng dùng' }]

export default async function DanhMucLoiPage({ searchParams }: { searchParams: Promise<{ q?: string; tt?: string }> }) {
  const { q = '', tt = '' } = await searchParams
  const [tatCa, quyen] = await Promise.all([danhMucLoi(), hoiQuyen({ sua: ['cs.nhom_loi.cau_hinh', 'QUANLY'] })])
  const k = boDau(q).toLowerCase()
  const rows = tatCa.filter((d) => (!tt || d.trang_thai === tt) &&
    (!k || boDau([d.code, d.ten, ...d.aliases, ...d.ma_may].join(' ')).toLowerCase().includes(k)))
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Danh mục lỗi" phuDe={`${tatCa.length} mã lỗi · ${tatCa.filter((d) => d.trang_thai === 'cho_duyet').length} chờ duyệt`} />
        {quyen.sua && <div className="flex gap-2 flex-wrap"><NhapDanhMuc /><PhanLoaiLai /></div>}
        <Suspense><OTimKiem placeholder="Gõ mã, tên lỗi, cách ghi, mã máy…" /></Suspense>
        <Suspense><BoLocChon param="tt" nhan="Trạng thái" tuyChon={TT} /></Suspense>
        <ThanhDangLoc dieuKien={[]} hienThi={rows.length} tong={tatCa.length} nhan="mã lỗi" />
        <DanhMucLoiBang rows={rows} choSua={quyen.sua} />
      </div>
    </main>
  )
}
```

(Check `ThanhDangLoc`'s required props in `apps/web/bang/ThanhDangLoc.tsx` and pass `sapXep` if required.)

- [ ] **Step 2: `DanhMucLoiBang`** (client): table columns Mã · Tên chuẩn · Nhóm · Mã máy · Các cách ghi (comma list, max 3 + "+n") · Phương án xử lý (truncate 80) · Trạng thái badge (amber chờ duyệt / emerald đã duyệt / slate ngừng). When `choSua`: row "Sửa" opens an inline form (all fields; lists edited as one-per-line textarea) → `luuLoi`; buttons "Duyệt" / "Ngừng dùng" → `datTrangThaiLoi`; `CHUA_PHAN_LOAI` row is read-only. Show server `error` text in red under the row.

- [ ] **Step 3: `NhapDanhMuc`** (client): `<input type="file" accept=".xlsx,.csv">` → `xemTruocNhapDanhMuc(fd)` → preview: counts (đã duyệt / chờ duyệt / gán ticket), table of first 20 entries, list of errors with Sheet row numbers. Button "Nhập N mã + gán M ticket" disabled while errors exist → `nhapDanhMuc(fd)` → success line, `router.refresh()`.

- [ ] **Step 4: `PhanLoaiLai`** (client): button "Chạy thử phân loại lại" → `phanLoaiLai(true)` → shows `so_ticket_chua_co_dong`, `phan_loai_lai`, `se_tao_chua_phan_loai`, per-code counts; then button "Áp dụng" → `phanLoaiLai(false)` with `confirm()` text "Ghi thật: bù dòng máy cho ticket cũ và phân loại lại dòng hệ thống còn 'Chưa phân loại'. Không đụng dòng CS đã chọn tay."

- [ ] **Step 5: Verify locally** — `npx --prefix apps/web tsc --noEmit`; start `cd apps/web && npx next dev -p 3101` (background; stop it after with `lsof -ti :3101 | xargs kill`); log in `dev.admin@gwt.vn` / `gwtlocal123`; open `http://localhost:3101/danh-muc-loi`; import a hand-made test `.xlsx` with 2 rows (one with an error) → error shown with row number; fix → import works; "Chạy thử" shows a report and writes nothing (`select count(*) from ticket_may` unchanged on local).

- [ ] **Step 6: Commit** (all files above incl. `TopNavClient.tsx`; `feat(cskh): trang Danh mục lỗi — duyệt, nhập từ Sheet, phân loại lại`)

---

### Task 10: UI — ticket list: "Máy" column from lines + "Loại lỗi" filter by line

**Files:**
- Modify: `apps/web/app/actions.ts` (shared — `wt.sh ds`; `codegraph explore "searchTickets khoaTatCaTicket Ticket"` first): `Ticket` type (+ optional `dong_may`), `searchTickets` (+ `loiCode` option + attach lines), `khoaTatCaTicket` (pass `t.loi`).
- Modify: `apps/web/app/ticket/page.tsx`, `apps/web/components/BangTicket.tsx`
- Test: `apps/web/lib/loi/dongMay.test.ts` (add `tomTatMayTicket` case)

**Interfaces:**
- Consumes: `dongMayTheoTickets`, `ticketCodesTheoLoi`, `danhMucLoi` (Task 8); `nhanDongMay` (Task 5).
- Produces: `Ticket.dong_may?: { nhan: string; serial: string | null }[]`; `searchTickets(..., tuyChon: … & { loiCode?: string })`; URL param `loi` on `/ticket`; pure `tomTatMayTicket(dong: DongMay[]): { nhan: string; serial: string | null }[]` in `lib/loi/dongMay.ts`.

- [ ] **Step 1: Failing test** — add to `dongMay.test.ts`:

```ts
import { tomTatMayTicket } from './dongMay'
it('tóm tắt dòng máy cho bảng ticket, giữ thứ tự, serial ưu tiên serial đã gắn', () => {
  expect(tomTatMayTicket([
    { internal_code: 'CTS20NG', loi_code: 'A', loi_ten: 'Rò nước đáy', serial: null, source_serial: 'Z1' },
    { internal_code: null, loi_code: 'CHUA_PHAN_LOAI', loi_ten: 'Chưa phân loại', serial: 'Z2', source_serial: 'Z2' },
  ] as never)).toEqual([{ nhan: 'CTS20NG · Rò nước đáy', serial: 'Z1' }, { nhan: 'Chưa rõ máy · Chưa phân loại', serial: 'Z2' }])
})
```

- [ ] **Step 2: Run — FAIL; implement in `dongMay.ts`:**

```ts
export function tomTatMayTicket(dong: Pick<DongMay, 'internal_code' | 'loi_code' | 'loi_ten' | 'serial' | 'source_serial'>[]) {
  return dong.map((d) => ({ nhan: nhanDongMay(d), serial: d.serial ?? d.source_serial ?? null }))
}
```
Run — PASS.

- [ ] **Step 3: `actions.ts` edits (exact):**
  1. In `Ticket` type add after `moi?: boolean`:
     ```ts
     /** Chỉ có ở kết quả searchTickets: các dòng máy "MÃ · lỗi" (ticket_may). */
     dong_may?: { nhan: string; serial: string | null }[]
     ```
  2. Add imports at top: `import { dongMayTheoTickets, ticketCodesTheoLoi } from '@/app/ticket/loi-actions'` and `import { tomTatMayTicket } from '@/lib/loi/dongMay'`.
  3. `searchTickets` signature: `tuyChon: TuyChonDanhSach & { loaiTicket?: string; loiCode?: string; ngtu?: string; ngden?: string } = {}`. Before `const dungTruyVan = …` add:
     ```ts
     const maTheoLoi = tuyChon.loiCode ? await ticketCodesTheoLoi(tuyChon.loiCode) : null
     ```
     Inside `dungTruyVan` after the `loaiTicket` line:
     ```ts
     if (maTheoLoi) truyVan = truyVan.in('ticket_code', maTheoLoi.length ? maTheoLoi : ['__khong_co__'])
     ```
     Before `return { rows, … }`:
     ```ts
     const dongMay = await dongMayTheoTickets(rows.map((r) => r.ticket_code))
     rows = rows.map((r) => ({ ...r, dong_may: tomTatMayTicket(dongMay[r.ticket_code] ?? []) }))
     ```
  4. `khoaTatCaTicket`: pass `loiCode: t.loi || undefined` in the options object it hands to `searchTickets` (read the function; add `loi?: string` to `ThamSoLoc` in `apps/web/bang/kieu.ts` only if `ThamSoLoc` is a closed type).

- [ ] **Step 4: `app/ticket/page.tsx`:** read `loi` from `searchParams`; fetch `danhMucLoi(true)` in the `Promise.all`; pass `loiCode: loi || undefined` to `searchTickets`; rename the existing `BoLocChon` label to `"Loại ticket"` (param `loai` unchanged); add `<BoLocGoiY param="loi" nhan="Loại lỗi" tuyChon={dsLoi.map((d) => ({ giaTri: d.code, nhan: d.ten }))} />` (import `BoLocGoiY` from `@/bang`); extend `hrefBoDieuKien` with `'loi'`; `ThanhDangLoc` chip `{ nhan: 'Loại lỗi', giaTri: tenLoi, href: hrefBoDieuKien('loi') }`; add `loi` to `KhungChon thamSo` and to the `boLoc` JSON signature.

- [ ] **Step 5: `BangTicket.tsx`** — replace the `may` column render:

```tsx
{ key: 'may', nhan: 'Máy', render: (t) => (
  t.dong_may?.length
    ? <div className="space-y-0.5">{t.dong_may.map((d, i) => (
        <div key={i} className="text-xs whitespace-nowrap">
          {d.serial
            ? <Link href={`/may/${encodeURIComponent(d.serial)}`} prefetch={false} className="text-slate-900 underline">{d.nhan}</Link>
            : <span className="text-slate-700">{d.nhan}</span>}
        </div>))}</div>
    : t.serial
      ? <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-slate-900 underline">{t.product_name}</Link>
      : t.source_serial ? <MayThieuBadge t={t} /> : <span className="text-slate-400">—</span>
) },
```

- [ ] **Step 6: Verify** — `tsc`, full `test`, then on local dev: `/ticket` shows lines (after running "Áp dụng" phân loại lại on local so old tickets have lines); `?loi=CHUA_PHAN_LOAI` filters; chip removes the filter; "chọn tất cả" respects the filter.

- [ ] **Step 7: Commit** (explicit paths: `apps/web/app/actions.ts apps/web/app/ticket/page.tsx apps/web/components/BangTicket.tsx apps/web/lib/loi/dongMay.ts apps/web/lib/loi/dongMay.test.ts` [+ `apps/web/bang/kieu.ts` if changed]; `feat(cskh): cột Máy theo dòng máy + lọc Loại lỗi theo dòng`)

---

### Task 11: UI — serial / customer lookup + multi-machine lines in "Tạo ticket"

**Files:**
- Create: `apps/web/components/loi/SerialTraCuu.tsx`, `apps/web/components/loi/KhachMayTraCuu.tsx`, `apps/web/components/loi/DongMayNhap.tsx`
- Modify: `apps/web/components/TaoTicketForm.tsx`, `apps/web/app/tao-ticket/page.tsx` (pass `dsLoi`), `apps/web/app/actions.ts` (`createTicket`: accept `dong_may?: DongMayInput[]`, call `ganDongMayChoTicketMoi`)

**Interfaces:**
- Consumes: `traSerial`, `traKhachVaMay`, `ganDongMayChoTicketMoi`, `danhMucLoi` (Task 8); `kiemDangSerial` (Task 5); `OChonGoiY`, `OChonTimXa`, `type MucChon` from `@/bang`.
- Produces:
  - `<SerialTraCuu value onChange onKetQua?: (k: KetQuaTraSerial) => void />` — input (mono) with debounce 300 ms; live format hint from `kiemDangSerial` (red text) before calling the server; result card: `da_lap` → "**{product_name}** ({internal_code}) · Khách: {customer_name} · Lắp {install_date dd/mm/yyyy}" + "BH: đã kích hoạt / chưa kích hoạt"; `chua_kich_hoat` → amber "Máy **chưa kích hoạt** ({trang_thai})" + `<Link href="/dang-ky-bh">Kích hoạt / lắp máy →</Link>`; `khong_co` → slate "Serial chưa có trong hệ thống — vẫn lưu được, CS bổ sung sau"; `sai_dang` → red `loi`.
  - `<KhachMayTraCuu onChonMay: (m: { customer_id: string; serial: string }) => void />` — `OChonTimXa` with `tim = async (q) => (await traKhachVaMay(q)).flatMap(k => k.may.map(m => ({ gt: `${k.id}|${m.serial}`, nhan: `${k.full_name} — ${m.product_name ?? m.internal_code} · ${m.serial}`, phu: `${k.primary_phone ?? ''}${m.warranty_activated ? '' : ' · chưa kích hoạt'}` })))` plus a row per customer without machines (`gt: `${k.id}|`` , nhan: `${k.full_name} — chưa có máy`).
  - `<DongMayNhap dong: DongMayInput[] onChange dsLoi: LoiDanhMuc[] />` — one block per line: `SerialTraCuu` + `OChonGoiY` for loi (`tuyChon = dsLoi.map(d => ({ gt: d.code, nhan: d.ten, phu: d.ma_may.join(', ') }))`, default `CHUA_PHAN_LOAI`) + `mo_ta` input; "＋ Thêm máy" / "Bỏ dòng" (min 1 line).

- [ ] **Step 1: `createTicket` change** in `actions.ts` (exact): add `dong_may?: DongMayInput[]` to the input type (import type from `@/lib/loi/kieu`); relax the serial rule to `if (!input.serial?.trim() && !input.dong_may?.some((d) => d.serial?.trim())) return { ok: false, error: 'Bắt buộc có ít nhất một serial máy báo lỗi.' }`; when `input.serial` is empty use the first line's serial for `serial`/`source_serial`; after the successful insert:

```ts
if (input.dong_may?.length) {
  const g = await ganDongMayChoTicketMoi(code, input.dong_may)
  if (!g.ok) return { ok: true as const, code, canhBao: `Đã tạo ticket nhưng chưa lưu đủ dòng máy: ${g.error}` }
}
```
(`ganDongMayChoTicketMoi` import from `@/app/ticket/loi-actions`.) `tickets.serial` must only be set when the serial exists in `installed_base` (FK) — reuse the existing behaviour: the form only fills `serial` from a `da_lap` lookup; otherwise send it as `source_serial` only (add `source_serial?: string` to the input and use `source_serial: input.source_serial || input.serial || null`).

- [ ] **Step 2: `TaoTicketForm`** — keep step 1 (KhachPicker) but add above it `KhachMayTraCuu` ("Tra nhanh theo tên/SĐT khách") which, on pick, calls the existing `chonKhach(id)` and pre-fills line 1's serial. Replace the step-2 `<select>` with `DongMayNhap` (machines of the chosen customer offered as quick-fill chips under line 1: click → set that line's serial). Remove the hard "Khách chưa có máy → không tạo được" block; replace with the amber note + `/dang-ky-bh` link but still allow saving with an unregistered serial. Submit sends `dong_may`, `serial` (only when line 1 lookup is `da_lap`), `source_serial` (line 1 serial). Disable submit until khách + loại + mô tả + ≥ 1 line with a serial whose `kiemDangSerial().hopLe` or lookup ≠ `sai_dang`. `tao-ticket/page.tsx` fetches `danhMucLoi(true)` and passes `dsLoi`.

- [ ] **Step 3: Verify on local dev** — `/tao-ticket`: type `Z1234` → red "đủ 20 ký tự (đang có 5)"; paste a real local serial from `installed_base` → model + customer + date card; a `serial_registry` serial not installed → "chưa kích hoạt" + link; customer phone search lists machines; create a ticket with 2 machine lines → detail page (Task 12) / list shows 2 lines; `select * from ticket_may where ticket_code = '<mã>'` on local → 2 rows (1 `tu_dong` updated, 1 `app`).

- [ ] **Step 4: Commit** (explicit paths; `feat(cskh): tra serial/khách khi tạo ticket + nhiều dòng máy`)

---

### Task 12: UI — line editor + suggested handling on ticket detail

**Files:**
- Create: `apps/web/components/loi/DongMayTicket.tsx`
- Modify: `apps/web/app/ticket/[code]/page.tsx`

**Interfaces:**
- Consumes: `dongMayCuaTicket`, `danhMucLoi`, `themDongMay`, `suaDongMay`, `xoaDongMay`, `xacNhanHuongXuLy` (Task 8); `goiYHuongXuLy`, `nhanDongMay` (Task 5); `SerialTraCuu`, `DongMayNhap` building blocks (Task 11).
- Produces: `<DongMayTicket code dong={DongMay[]} dsLoi={LoiDanhMuc[]} choSua={boolean} />`.

- [ ] **Step 1: Page wiring** — in `app/ticket/[code]/page.tsx` add `dongMayCuaTicket(ma)` and `danhMucLoi()` to the `Promise.all`, and `sua: ['cs.ticket.tao_sua', 'CS']` to `hoiQuyen` (check the `GateCu` literal used for CS-level elsewhere in the repo, e.g. `grep -rn "'cs.ticket.tao_sua', '" apps/web/app`). Insert a new section right after "Khách & máy":

```tsx
<section className="bg-white rounded-xl border p-5">
  <h2 className="font-medium text-slate-900 mb-3">Máy & lỗi</h2>
  <DongMayTicket code={t.ticket_code} dong={dongMay} dsLoi={dsLoi} choSua={quyen.sua} />
</section>
```

- [ ] **Step 2: `DongMayTicket`** (client). Per line card:
  - Header: `nhanDongMay(d)` + serial (link `/may/<serial>` when `d.serial`) + state chip (`dang_xu_ly` amber "Đang xử lý", `da_xu_ly` emerald "Đã xử lý", `khong_loi` slate "Không phải lỗi").
  - Edit mode (when `choSua`): `SerialTraCuu`, `OChonGoiY` loi (excluding `ngung`), `mo_ta`, state buttons → `suaDongMay(id, patch)`.
  - Suggestion block: `const goiY = goiYHuongXuLy(d, dsLoi.find((l) => l.code === d.loi_code) ?? null)`. When `goiY`:
    ```tsx
    <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 text-sm">
      <div className="text-xs font-medium text-sky-900">Hướng xử lý đề xuất (theo danh mục lỗi)</div>
      <textarea defaultValue={goiY} … />
      <button onClick={() => xacNhanHuongXuLy(d.id, nd, nd.trim() === goiY)}>Xác nhận</button>
    </div>
    ```
    "Xác nhận" with unchanged text → `tuDanhMuc=true`; edited text → `false`. When `d.huong_xu_ly` exists, show it read-only with a small tag "theo danh mục" / "CS ghi" and a "Sửa" link that saves via `xacNhanHuongXuLy(id, text, false)`. Nothing here calls `updateTicket`.
  - "Bỏ dòng" (hidden when only 1 line) → `confirm('Bỏ dòng máy này khỏi ticket?')` → `xoaDongMay`.
  - Footer "＋ Thêm máy" → inline `DongMayNhap` with one line → `themDongMay(code, input)`.
  - After each action `router.refresh()`; show server error text.
- Keep the existing "Nhóm lỗi" section unchanged.

- [ ] **Step 3: Verify on local** — on a ticket whose line has an approved code with `huong_xu_ly`: block shows; "Xác nhận" stores `huong_xu_ly_nguon='danh_muc'` and the block disappears; ticket state unchanged (`select state from tickets …`); edit-then-confirm stores `'cs'`; cannot delete the last line (error text); add/remove lines works; list page reflects changes.

- [ ] **Step 4: Commit** (`feat(cskh): sửa dòng máy trên ticket + hướng xử lý đề xuất theo danh mục`)

---

### Task 13: UI — frequency report `/bao-cao-loi`

**Files:**
- Create: `apps/web/app/bao-cao-loi/page.tsx`, `apps/web/components/loi/BangTanSuat.tsx`
- Modify: `apps/web/app/ticket/loi-actions.ts` (add `duLieuTanSuat`)

**Interfaces:**
- Consumes: views (Task 4), `tinhTanSuat` (Task 7), `danhMucLoi`.
- Produces: `duLieuTanSuat(): Promise<{ ca: DongCa[]; ban: MauSo[]; nhap: MauSo[] }>` (gate `cs.ticket.xem`; reads all rows from `v_loi_ca`, `v_loi_so_ban` mapped `so = so_ban`, `v_loi_so_nhap` mapped `so = so_nhap`; page in chunks of 1000 like `searchTickets`); route `/bao-cao-loi?tu=YYYY-MM&den=YYYY-MM&nhom=&may=&loi=`.

- [ ] **Step 1: Add `duLieuTanSuat`** to `loi-actions.ts` (guard test from Task 8 covers it).
- [ ] **Step 2: Page** — defaults `tu` = 12 months back, `den` = current month (VN). Filters: two `<input type="month">` bound to URL via a small client form (or `LocNgay` if it supports month mode — check `apps/web/bang/LocNgay.tsx`; otherwise plain month inputs in a GET form), `BoLocGoiY param="nhom"` (issue_group names present in data), `BoLocGoiY param="may"` (internal codes present), `BoLocGoiY param="loi"`. Server computes `tinhTanSuat(ca filtered by nhom/may/loi, ban, nhap, { tu, den })`.
- [ ] **Step 3: `BangTanSuat`** — columns: Nhóm · Lỗi · Model · one column per month in range (counts, blank for 0) · Tổng ca · Bán lũy kế · % /bán · Nhập lũy kế · % /nhập · Ngày chạy (trung vị) · Máy báo lại. Footer note: "Tỷ lệ = số ca trong khoảng ÷ số máy bán/nhập lũy kế đến hết tháng cuối. Nhập = serial nạp theo PO (serial_registry). Ngày chạy = từ ngày lắp tới ngày báo, chỉ tính máy có ngày lắp." Row click → `/ticket?loi=<code>`.
- [ ] **Step 4: Verify on local** — numbers for one group match a hand count via `select count(*) from v_loi_ca where loi_code = … and thang between …`; `tsc`, `test`, `build` clean.
- [ ] **Step 5: Commit** (`feat(cskh): báo cáo tần suất lỗi theo nhóm × model × tháng`)

---

### Task 14: One-off — "Claude gom nhóm lỗi" → Google Sheet → chị Hiền duyệt → import

Operational task done by Claude in a session with Hiệp. Produces data, not code. Runs in parallel with Tasks 5–13 once Task 1 is defined. Nothing in this task writes to production except the final in-app import (Step 6), which happens only after anh Dũng applied the migrations and the PR is deployed.

**Files:**
- Create (gitignored, PII): `data/cskh-loi/tickets-<ngay>.csv`, `data/cskh-loi/gom-nhom-<ngay>.md` (Claude's working notes)
- Output: Google Sheet "Danh mục lỗi" (2 tabs) shared with chị Hiền + Hiệp

**Interfaces:**
- Produces: a Sheet matching `COT_DANH_MUC` / `COT_GAN_TICKET` (Task 6) exactly, so its `.xlsx` download imports in `/danh-muc-loi`.

- [ ] **Step 1: Export source data (Hiệp runs this read-only query in the Supabase SQL editor of the production project, then "Download CSV" into `data/cskh-loi/tickets-<ngay>.csv`).** Claude does not run it.

```sql
-- CHỈ ĐỌC. Không có tên/SĐT khách.
select t.ticket_code, (t.created_at at time zone 'Asia/Ho_Chi_Minh')::date as ngay, t.state,
       coalesce(ib.internal_code, sr.internal_code) as internal_code,
       t.ticket_type, t.description, t.last_note,
       (select string_agg(n.noi_dung, ' || ' order by n.created_at) from ticket_note n where n.ticket_code = t.ticket_code) as ghi_chu
  from tickets t
  left join installed_base ib on ib.serial = coalesce(t.serial, upper(btrim(t.source_serial)))
  left join serial_registry sr on sr.serial = coalesce(t.serial, upper(btrim(t.source_serial)))
 order by t.created_at;
```
Also export `select code, ten, muc_do from issue_group order by thu_tu;` → `data/cskh-loi/issue_group.csv`. Alternative source if SQL is unavailable: the app's ticket Excel export (`/ticket` → Xuất) — then notes are missing; say so in the Sheet's "Nguồn".

- [ ] **Step 2: Claude clusters** (in-session, no API): read every row; group by symptom × model into 10–25 entries; each entry gets `Mã` (`<MODEL>-<TRIEU-CHUNG>` or generic `RO-NUOC`, ASCII uppercase), `Nhóm` = one of the existing `issue_group.code`, `Tên chuẩn`, `Các cách ghi` (actual phrasings seen, `;`-separated, diacritics kept), `Mã máy áp dụng` (`CTS20` etc., blank = all), `Dấu hiệu`, `Phương án xử lý chuẩn` (only when the notes show a fix that worked — e.g. chị Hiền's E4 fix; otherwise blank), `Nguồn` (e.g. `ticket + Sheet 261026-CTS20 Updated Issues`), `Ví dụ ticket` (≤ 5 codes), `Duyệt` blank. Known anchors that must appear: CTS20 rò nước đáy (cross-check the 12 cases in Sheet "261026-CTS20 Updated Issues"), CTS20 rò nước đầu vòi lạnh, GTUN-8600HP-G lỗi E5 gia nhiệt, E4 (ask chị Hiền which model + the fix). Tab "Gán ticket": one row per ticket → proposed `Mã lỗi`. Never copy customer names/phones/addresses into any cell; paraphrase symptoms.
- [ ] **Step 3: Write the Google Sheet** via the `anthropic-skills:google-workspace` skill (or Google Drive connector): title "Danh mục lỗi", tabs "Danh mục lỗi" + "Gán ticket" with the exact headers; data validation on "Duyệt" (x / blank / ngừng); share edit with chị Hiền and Hiệp. Post the link to Hiệp.
- [ ] **Step 4: Review loop** — chị Hiền ticks "Duyệt", edits names/handling, writes in "Ghi chú chị Hiền". Claude re-reads comments and adjusts on request.
- [ ] **Step 5: Local dry run** — download as `.xlsx` → import on LOCAL `/danh-muc-loi` → "Chạy thử phân loại lại" → record `se_tao_chua_phan_loai` / per-code counts in the PR description. Target: < 15 % of tickets left "Chưa phân loại"; if higher, add aliases and repeat.
- [ ] **Step 6 (after deploy + anh Dũng's migration apply): production import** — an admin (Hiệp or chị Hiền) uploads the same `.xlsx` at `/danh-muc-loi` → "Chạy thử" → "Áp dụng". (This is normal app use, not a schema change.)

---

### Task 15: Final verification, PR, runbook for anh Dũng, bot follow-up note

**Files:**
- No new repo files (runbook goes in the PR body).

- [ ] **Step 1: Full gates**

```bash
cd ~/gwt-worktrees/feat-cskh-danh-muc-loi
npx --prefix apps/web tsc --noEmit
npm --prefix apps/web run test
npm --prefix apps/web run build
for f in loi_danh_muc ticket_may ticket_may_backfill loi_tan_suat; do
  docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/$f.test.sql || exit 1
done
python3 tools/scripts/scan_pii_secrets.py --help >/dev/null 2>&1 && git diff origin/main --name-only | xargs python3 tools/scripts/scan_pii_secrets.py
```
All must be clean (check the scanner's real CLI before relying on the last line; the pre-commit hook also runs it).

- [ ] **Step 2: Reset-from-zero check** — `supabase db reset` is destructive to local data; instead run `supabase migration up` on a fresh local stack only if another session is not using it (`bash tools/wt.sh ds`). Otherwise skip and note it.
- [ ] **Step 3: Show Hiệp/CEO locally** (CLAUDE.md flow): `env:local`, dev on port 3101, links `/danh-muc-loi`, `/ticket`, `/tao-ticket`, one `/ticket/<mã>`, `/bao-cao-loi`. Stop the server afterwards (`lsof -ti :3101 | xargs kill`) and `supabase stop`.
- [ ] **Step 4: Push + PR** (only after Hiệp OKs):

```bash
git push -u origin feat/cskh-danh-muc-loi
gh pr create --base main --title "CSKH: danh mục lỗi, dòng máy trong ticket, tra serial/khách, hướng xử lý đề xuất, báo cáo tần suất" --body-file <scratch>/pr.md
```

PR body must contain the **runbook for anh Dũng** (do NOT merge before step 3 of it):
1. Apply in order with Supabase MCP `apply_migration` (same file names): `20261109120000_cs_loi_danh_muc`, `20261109121000_cs_ticket_may`, `20261109122000_cs_ticket_may_backfill`, `20261109123000_cs_loi_tan_suat`.
2. Smoke: `select cs_loi_khop('rò nước đáy', 'CTS20NG');` → `CHUA_PHAN_LOAI` (catalogue still empty); create nothing.
3. `select jsonb_pretty(cs_ticket_may_backfill(true));` → review; then `select jsonb_pretty(cs_ticket_may_backfill(false));` → every ticket has ≥ 1 line: `select count(*) from tickets t where not exists (select 1 from ticket_may m where m.ticket_code = t.ticket_code);` = 0.
4. Bot check: next Discord ticket → `select * from ticket_may where ticket_code = '<mã mới>'` has 1 `tu_dong` row; Postgres logs show no `cs_ticket_may_tu_tao` warnings.
5. Merge PR → Vercel deploy → Task 14 Step 6 import.
6. Rollback: `-- ROLLBACK:` headers, reverse order (views → backfill fn → ticket_may + triggers → loi_danh_muc). App code must be reverted first (pages read the new tables).
Plus: local dry-run numbers from Task 14 Step 5, screenshots, and the follow-up below.

- [ ] **Step 5: Follow-up (NOT part of this plan's app tasks) — bot repo `~/Bots/gwt-discord-bot`:** "Tin Discord nhắc nhiều serial → tách nhiều dòng `ticket_may`." Suggested shape: after `bot_tao_ticket` returns `ticket_code`, call a new SECURITY DEFINER `bot_them_dong_may(ticket_code, serials text[])` (in the bot repo's `db/ticket/`, granted to `kho_bot_serial`) that inserts lines 2..n with `nguon='app'`-equivalent value agreed then (extend the `nguon` check with `'bot'` in a later migration), test-first in the bot's PGlite tests. Record it in `backlog/cskh.md` (local, not git) and mention it in the PR body.

---

## Open questions (each with the default this plan uses)

1. **Catalogue vs existing `issue_group` (13 regex groups, `/nhom-loi`).** Default: keep both — `loi_danh_muc.nhom` → `issue_group.code` (coarse group); `v_ticket_issue` / `/nhom-loi` unchanged. Merging the two is a later decision.
2. **Removing a machine line = hard delete?** Default: yes for `ticket_may` rows via the UI, audit-logged with a row snapshot, never the last line; migrations/backfill never delete.
3. **Serial with wrong format that exists nowhere.** Default: block saving that line (error text); legacy serials that exist in `installed_base`/`serial_registry` are accepted even if off-format.
4. **Ticket without any serial (consultation calls).** Default: `createTicket` still requires ≥ 1 serial (today's rule); bots may still create serial-less tickets (line has null serial).
5. **"Loại ticket" (`ticket_type`) after lines exist.** Default: keep it (bots write it); filter renamed "Loại ticket", new filter "Loại lỗi" (`?loi=`) works on lines.
6. **Label on the list: `CTS20NG` vs `CTS20`.** Default: show `internal_code` as stored; a short-name map can come later.
7. **Units "imported" source.** Default: `serial_registry` (serials loaded per PO, month of `imported_at`); Kho v2 ledger (`KHO_DB_URL`, `wh_app_bao_cao`) not used in v1; no manual-input table.
8. **Units "sold" source and exclusions.** Default: `sales_order_lines.quantity` by `internal_code`, excluding `fulfillment_status ~* (huỷ|hủy|cancel|hoàn)`; combos sold under a combo code are not exploded into components.
9. **Rate denominator.** Default: cases in the selected months ÷ cumulative units sold (or imported) up to the end month.
10. **Who approves catalogue rows / runs reclassify.** Default: `cs.nhom_loi.cau_hinh` at QUANLY (chị Hiền, admin). CS (`cs.ticket.tao_sua`) only edits lines and confirms suggestions.
11. **Assignments from the Sheet's "Gán ticket" tab overwrite which lines?** Default: only system lines (`nguon` in `tu_dong`, `backfill`) of that ticket; lines CS added by hand are never overwritten.
12. **Bot-created tickets get auto-classified by alias at insert.** Default: yes (trigger); CS can correct the line later.
13. **Report access.** Default: anyone with `cs.ticket.xem`; no export button in v1 (add via `cs.bao_cao.xuat` later).

## Self-review notes

- Spec coverage: F1 → Tasks 1, 6, 8, 9, 14; F2 → Tasks 2, 3, 10, 11, 12; F3 → Tasks 5, 8, 11; F4 → Tasks 5, 12; F5 → Tasks 4, 7, 13; bot follow-up → Task 15 Step 5; production apply only by anh Dũng → Global Constraints + Task 15 runbook.
- Names used across tasks: `loi_danh_muc`, `ticket_may`, `cs_loi_khop`, `cs_ticket_may_backfill`, `v_loi_ca`/`v_loi_so_ban`/`v_loi_so_nhap`, `CHUA_PHAN_LOAI`, `kiemDangSerial`, `nhanDongMay`, `goiYHuongXuLy`, `tomTatMayTicket`, `docDanhMuc`, `docGanTicket`, `tinhTanSuat`, `dongMayTheoTickets`, `ticketCodesTheoLoi`, `ganDongMayChoTicketMoi`, `traSerial`, `traKhachVaMay`, `phanLoaiLai`, `duLieuTanSuat`.
