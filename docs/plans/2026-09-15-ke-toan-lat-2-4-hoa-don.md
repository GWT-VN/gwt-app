# Kế toán — Lát 2–4: sửa tay + học, HĐ đầu ra, gộp HDCT/HDTQ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn tất luồng hoá đơn (spec §11 lát 2–4) để tháng 9/2026 chạy thật trên app: người soát sửa mã trên ô và engine học lại; tab đầu ra có mã nội bộ / mã khách / nhóm SP / kênh; file HDCT/HDTQ từ cổng thuế gộp vào kỳ; bấm "Đã gửi kế toán".

**Architecture:** Giữ khuôn lát 1 — hàm thuần ở `apps/web/lib/ke-toan/` (engine, đọc file, xuất Excel; test vitest), Server Actions ở `apps/web/app/ke-toan/actions.ts` gọi RPC `public.ke_toan_*` (schema `accounting` không expose), màn Next.js trong `apps/web/app/ke-toan/`. Mọi thứ "học" và "luật" là **dữ liệu** trong `accounting.rules`/`accounting.corrections`, engine chỉ đọc — không hard-code (CEO 15/09). Mỗi lát là một tracer bullet: migration → module + test → action → màn → CEO xem local → merge.

**Tech Stack:** Next.js 16.2 (dev `--webpack`), React 19, TypeScript, vitest 4, exceljs (thư viện Excel DUY NHẤT của khu), Supabase Postgres (project SalesTracking `bwzmqfbcgouhvhoslmmm`), Python 3.12 chỉ cho script sinh fixture/nạp lịch sử (chạy tay, không commit data).

**Spec:** `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` (§2 quyết định 6·9·10·11·12·13·15, §4 quy trình, §5 schema, §6 module, §7 màn, §8 xuất, §11 lát). Lát 1 đã xong: `docs/plans/2026-09-04-ke-toan-lat-1-hoa-don-dau-vao.md` + `docs/ke-toan/README.md` (bẫy 1–12, luật `app` migration 08).

**Phạm vi plan này:** lát 2, 3, 4 (mốc CEO: trước 05/10/2026). **Lát 5 (sao kê), 6 (Google), 7 (màn luật) là plan riêng** — lát 5 còn treo câu hỏi TCB Business có xuất Excel không; lát 6 cần CEO tạo service account; lát 7 tái dùng RPC luật của lát 2.

## Global Constraints

- **DB:** schema `accounting` KHÔNG expose; app chỉ qua RPC `public.ke_toan_*(p_email text, …)` `language plpgsql/sql security definer set search_path = ''`, mỗi RPC gọi `accounting.nv(p_email)` (vai `admin|ke_toan|tai_chinh|ceo`), cuối migration `revoke all … from public, anon, authenticated; grant execute … to service_role`.
- **PostgREST nạp `safeupdate`** (bẫy 9): mọi `UPDATE`/`DELETE` trong RPC phải có `WHERE`; mỗi RPC mới thêm smoke qua `POST /rest/v1/rpc/...` vào `tools/scripts/smoke_local.py` (không gọi psql).
- **Migration:** `supabase/migrations/<YYYYMMDDhhmmss UTC>_ke_toan_NN_<ten>.sql`, dòng 2 ghi "Cách lùi nếu hỏng". Workflow 6 bước (`rules/supabase-mcp.md`): commit + push → CI `db-reset` xanh trên đúng commit (`gh run list -w db-reset -c <sha>`) → `apply_migration` (MCP) tên = tên file không đuôi → `SELECT version,name FROM supabase_migrations.schema_migrations` và sửa `version` về số hiệu file nếu lệch (bẫy 1) → `get_advisors` (khi có DDL) → docs. Migration đã áp = bất biến.
- **Guard test** `apps/web/lib/ke-toan-guard.test.ts`: mọi `async function` trong `app/ke-toan/actions.ts` chạm DB phải gọi `chanKeToan()`/`goi()`; hàm có `try {` phải `await chanKeToan()` **trước** `try`; không `p_email: email` từ client.
- **Máy Windows không có Docker/Supabase local:** kiểm tự động = `npx tsc --noEmit`, `npm run test`, `npm run build`, `npx eslint lib/ke-toan app/ke-toan` (lint toàn repo đang 7 lỗi cũ — không được tăng); demo CEO = `cd apps/web && npx next dev --webpack -p 3000` cắm **prod** (Google redirect chỉ cho cổng 3000), đăng nhập `ai@gwt.vn`.
- **Không commit PII.** Data thật ở `data/ke-toan/` (gitignore). Fixture đã che ở `apps/web/lib/ke-toan/__fixtures__/`. Golden T8 đầu vào phải giữ **322/322**.
- **Excel:** chỉ `exceljs`; bộ đọc và bộ xuất dùng chung `chuoiO`/`moWorkbook`/`laTab`/`timCot` từ `lib/ke-toan/doc-file/nexia.ts`. Bẫy exceljs: sau `load`, ô cùng xf dùng chung object `style` → **thay** `cell.style = {...}`, không mutate (`datFill`, `keVien`).
- **UI:** Tailwind, màu khu `#3f8a6a`, bảng `text-xs`, ô chọn >10 mục dùng `OChonGoiY` từ `@/bang` (`MucChon = { gt, nhan, phu? }`), lọc theo `docs/CHUAN-FILTER.md` (tham số URL, `BoLocChon`). Dựng/sửa màn đi qua `gwt-ui-skills:designing-ui`; trước khi báo xong chạy `verifying-visual-changes`, trước khi mời CEO chạy `reviewing-finished-ui`.
- **Tên:** hàm/biến tiếng Việt không dấu như code hiện có (`suaDong`, `datThanhLuat`); cột DB snake_case tiếng Anh như schema đã có.
- **Luật/học = dữ liệu:** engine đọc `rules` (origin `rule_excel|override_json|history|app`) và thống kê từ `corrections`; không thêm hằng luật vào TS.
- **Commit:** `feat|fix|docs(ke-toan): …`, kết thúc `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; push nhánh cuối mỗi task; nhánh cắt từ `origin/main`, tên `feat/ke-toan-lat-2` … (mỗi lát một nhánh, merge `main` sau khi CEO gật).

---

## File Structure

```
supabase/migrations/
  20260916020000_ke_toan_09_sua_tay_hoc.sql      # Task 1: corrections nới line_id + origin; RPC dong_sua, luat_them, thong_ke_hoc, ky_gui, lich_su_nap
  20260923020000_ke_toan_10_dau_ra_hdct.sql       # Task 8+10: dong_list kèm first_source_kind; dong_nhap v3 (row_order nối đuôi cho nguồn ≠ nexia)
tools/scripts/
  smoke_local.py                                  # Task 1, 8, 10: smoke RPC mới
  ke_toan_nap_lich_su.py                          # Task 5: SQLite expense → JSON → RPC lich_su_nap (chạy tay, không commit output)
  ke_toan_sinh_golden.py                          # Task 7: thêm t8-dau-ra.json
  ke_toan_do_header.py                            # Task 9: in tên sheet + header dòng 1 của file HDCT (đo trước khi viết reader)
apps/web/lib/ke-toan/
  engine/kieu.ts                                  # Task 2: ThongKeHoc; Task 7: MucCatalog.capHai/capBa, KetQuaDauRa
  engine/dau-vao.ts                               # Task 2: tầng C học; Task 6: bỏ goiYMaNoiBo ra file riêng; export tkNoCuaTinhChat
  engine/dau-vao.test.ts                          # Task 2: test tầng C
  engine/ma-noi-bo.ts                             # Task 6: taoGoiYMaNoiBo (tách từ dau-vao, dùng cho cả vào/ra)
  engine/dau-ra.ts + dau-ra.test.ts               # Task 7: taoEngineDauRa
  __fixtures__/t8-dau-ra.json                     # Task 7: golden đầu ra (Python classify_output_row, che PII)
  __fixtures__/hdct-t8-vao.json                   # Task 9: 10 dòng HDCT che PII
  doc-file/nexia.ts + nexia.test.ts               # Task 9: docHoaDon(buf, { huong }) cho file 1 sheet
  xuat/excel-hoa-don.ts + excel-dien-goc.test.ts  # Task 8: cột template đầu ra; Task 10: dòng HDCT nối cuối + tô FFE699
apps/web/app/ke-toan/
  actions.ts                                      # Task 3: suaDong, datThanhLuat, guiKeToan, danhSachMa; Task 8: engine ra; Task 10: uploadNguon(loai)
  page.tsx                                        # Task 4: cột trạng thái kỳ trở lại
  hoa-don/[ky]/page.tsx                           # Task 4: dùng DongSua, nút Đã gửi; Task 8: cột tab ra; Task 11: lọc nguồn, tô dòng HDCT
  hoa-don/[ky]/DongSua.tsx                        # Task 4: ô Mã (OChonGoiY) + Ghi chú + Đặt thành luật (client)
  hoa-don/[ky]/NutGuiKeToan.tsx                   # Task 4: xác nhận số cảnh báo → guiKeToan (client)
  hoa-don/[ky]/FormUpload.tsx                     # Task 11: chọn loại nguồn
  hoa-don/[ky]/xuat/route.ts                      # Task 8/10: truyền cột đầu ra + nguồn
docs/ke-toan/README.md                            # mỗi task: cập nhật Route/Quy trình/Bẫy/Việc treo
```

---

## LÁT 2 — Sửa tay trên ô · corrections · học từ app · Đặt thành luật · Đã gửi kế toán

### Task 1: Migration 09 — corrections nới cho lịch sử + 5 RPC

**Files:**
- Create: `supabase/migrations/20260916020000_ke_toan_09_sua_tay_hoc.sql`
- Modify: `tools/scripts/smoke_local.py` (sau khối `ke_toan_dong_nhap`)

**Interfaces (Produces):**
- `public.ke_toan_dong_sua(p_email text, p_line_id bigint, p_code text, p_code_name text, p_tk_no text, p_tk_co text, p_note text, p_seller_norm text, p_desc_norm text) returns jsonb` → `{ "so_sua": int, "edits_after_sent": int }`
- `public.ke_toan_luat_them(p_email text, p_kind text, p_pattern text, p_target_code text, p_condition text) returns jsonb` → `{ "id": bigint, "moi": bool }`
- `public.ke_toan_thong_ke_hoc(p_email text) returns jsonb` → `{ "ncc": { "<seller_norm>": "<code>" }, "prefix": { "<5 từ đầu desc_norm>": "<code>" } }`
- `public.ke_toan_ky_gui(p_email text, p_period_id bigint) returns jsonb` → `{ "status": "da_gui", "sent_at": timestamptz, "so_canh_bao": int }`
- `public.ke_toan_lich_su_nap(p_email text, p_rows jsonb) returns jsonb` → `{ "inserted": int }`; `p_rows` = `[{ "seller_norm", "desc_norm", "code" }]`

- [ ] **Step 1: Viết migration**

```sql
-- ke_toan_09_sua_tay_hoc — lát 2: sửa tay trên ô ghi corrections, engine học từ corrections, Đặt thành luật, Đã gửi kế toán.
-- Cách lùi nếu hỏng: drop function các ke_toan_dong_sua/luat_them/thong_ke_hoc/ky_gui/lich_su_nap; delete from accounting.corrections where origin='history';
--   alter table accounting.corrections drop column origin, alter column line_id set not null.

-- Lịch sử cũ (720 dòng chi phí T1–T6 từ SQLite tool Python) không gắn dòng hoá đơn nào → line_id nullable + cột origin.
alter table accounting.corrections alter column line_id drop not null;
alter table accounting.corrections add column if not exists origin text not null default 'app' check (origin in ('app','history'));
create index if not exists corrections_hoc_idx on accounting.corrections(field, seller_norm) where new_value is not null;

-- Sửa một dòng: ghi giá trị chốt + corrections cho từng trường đổi; kỳ đã gửi thì đếm edits_after_sent (spec §2 #13).
create or replace function public.ke_toan_dong_sua(p_email text, p_line_id bigint, p_code text, p_code_name text, p_tk_no text, p_tk_co text,
  p_note text, p_seller_norm text, p_desc_norm text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_cu accounting.invoice_lines; v_n int := 0; v_sau int := 0;
begin
  select * into v_cu from accounting.invoice_lines where id = p_line_id;
  if not found then raise exception 'Không có dòng %', p_line_id; end if;
  if p_code is distinct from v_cu.code then
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, "by", origin)
      values (p_line_id, 'code', v_cu.code, p_code, p_seller_norm, p_desc_norm, v_nv, 'app');
    v_n := v_n + 1;
  end if;
  if p_note is distinct from v_cu.note_for_accountant then
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, "by", origin)
      values (p_line_id, 'note_for_accountant', v_cu.note_for_accountant, p_note, p_seller_norm, p_desc_norm, v_nv, 'app');
    v_n := v_n + 1;
  end if;
  update accounting.invoice_lines
     set code = p_code, code_name = p_code_name, tk_no = p_tk_no, tk_co = p_tk_co, note_for_accountant = p_note,
         edited_by = v_nv, edited_at = now()
   where id = p_line_id;
  if v_n > 0 then
    update accounting.periods set edits_after_sent = edits_after_sent + 1
     where id = v_cu.period_id and status = 'da_gui'
     returning edits_after_sent into v_sau;
  end if;
  return jsonb_build_object('so_sua', v_n, 'edits_after_sent', coalesce(v_sau, 0));
end $$;

-- Đặt thành luật: luật origin 'app', ưu tiên sau luật app hiện có; trùng (kind, pattern, target, condition) đang active → trả luật cũ.
create or replace function public.ke_toan_luat_them(p_email text, p_kind text, p_pattern text, p_target_code text, p_condition text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  if p_kind not in ('supplier','keyword') then raise exception 'kind phải là supplier hoặc keyword'; end if;
  if length(btrim(p_pattern)) < 3 then raise exception 'pattern quá ngắn (≥ 3 ký tự)'; end if;
  if p_target_code is null or p_target_code = '' then raise exception 'thiếu mã đích'; end if;
  select id into v_id from accounting.rules
   where origin = 'app' and active and kind = p_kind and pattern = btrim(p_pattern) and target_code = p_target_code
     and condition is not distinct from nullif(p_condition, '');
  if v_id is not null then return jsonb_build_object('id', v_id, 'moi', false); end if;
  insert into accounting.rules (kind, pattern, target_code, condition, priority, origin, created_by)
  values (p_kind, btrim(p_pattern), p_target_code, nullif(p_condition, ''),
          (select coalesce(max(priority), -1) + 1 from accounting.rules where origin = 'app'), 'app', v_nv)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'moi', true);
end $$;

-- Thống kê học — ngưỡng chép từ tool Python (engine.py): NCC ≥70% (tối thiểu 1 lần), tiền tố 5 từ diễn giải ≥80% (tối thiểu 2 lần).
create or replace function public.ke_toan_thong_ke_hoc(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with c as (
    select seller_norm, desc_norm, new_value as code from accounting.corrections
    where accounting.nv(p_email) is not null and field = 'code' and coalesce(new_value, '') <> ''
  ),
  ncc as (
    select seller_norm, code, count(*) as n, sum(count(*)) over (partition by seller_norm) as tong
    from c where length(coalesce(seller_norm, '')) >= 6 group by 1, 2
  ),
  ncc_ok as (select distinct on (seller_norm) seller_norm, code from ncc where n::numeric / tong >= 0.7 order by seller_norm, n desc),
  pre as (
    select array_to_string((string_to_array(desc_norm, ' '))[1:5], ' ') as p5, code, count(*) as n,
           sum(count(*)) over (partition by array_to_string((string_to_array(desc_norm, ' '))[1:5], ' ')) as tong
    from c where coalesce(desc_norm, '') <> '' group by 1, 2
  ),
  pre_ok as (select distinct on (p5) p5, code from pre where tong >= 2 and n::numeric / tong >= 0.8 order by p5, n desc)
  select jsonb_build_object(
    'ncc',    coalesce((select jsonb_object_agg(seller_norm, code) from ncc_ok), '{}'::jsonb),
    'prefix', coalesce((select jsonb_object_agg(p5, code) from pre_ok), '{}'::jsonb));
$$;

-- Đã gửi kế toán: đổi trạng thái kỳ; vẫn sửa được sau đó (đếm ở dong_sua).
create or replace function public.ke_toan_ky_gui(p_email text, p_period_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_at timestamptz; v_cb int;
begin
  update accounting.periods set status = 'da_gui', sent_at = now(), sent_by = v_nv
   where id = p_period_id returning sent_at into v_at;
  if v_at is null then raise exception 'Không có kỳ %', p_period_id; end if;
  select count(*) into v_cb from accounting.invoice_lines l
   where l.period_id = p_period_id and l.direction = 'vao' and not l.missing_in_last_upload
     and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro'));
  return jsonb_build_object('status', 'da_gui', 'sent_at', v_at, 'so_canh_bao', v_cb);
end $$;

-- Nạp lịch sử cũ một lần (script tools/scripts/ke_toan_nap_lich_su.py): không gắn dòng, origin 'history'.
create or replace function public.ke_toan_lich_su_nap(p_email text, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform accounting.nv(p_email);
  with ins as (
    insert into accounting.corrections (line_id, field, old_value, new_value, seller_norm, desc_norm, origin)
    select null, 'code', null, r->>'code', r->>'seller_norm', r->>'desc_norm', 'history'
    from jsonb_array_elements(p_rows) r
    where coalesce(r->>'code', '') <> ''
    returning id)
  select count(*) into v_n from ins;
  return jsonb_build_object('inserted', v_n);
end $$;

do $$
declare f text;
begin
  foreach f in array array['ke_toan_dong_sua(text,bigint,text,text,text,text,text,text,text)',
      'ke_toan_luat_them(text,text,text,text,text)', 'ke_toan_thong_ke_hoc(text)',
      'ke_toan_ky_gui(text,bigint)', 'ke_toan_lich_su_nap(text,jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated;', f);
    execute format('grant execute on function public.%s to service_role;', f);
  end loop;
end $$;
```

- [ ] **Step 2: Thêm smoke qua PostgREST** (sau dòng cuối khối `ke_toan_dong_nhap` trong `tools/scripts/smoke_local.py`; biến `U`, `h`, `SVC`, `chk`, `ky_id`, `src_id` đã có)

```python
# --- Lát 2 (migration 09): sửa tay, học, luật, gửi ---
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_direction": "vao"})
line_id = r.json()[0]["id"] if r.status_code == 200 and r.json() else None
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_sua", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_line_id": line_id,
    "p_code": "cp.qc", "p_code_name": "CP quảng cáo", "p_tk_no": "6427", "p_tk_co": "331", "p_note": "smoke",
    "p_seller_norm": "cong ty smoke", "p_desc_norm": "phi quang cao thang 8 smoke"})
chk("ke_toan_dong_sua: đổi mã + ghi chú → so_sua 2", r.status_code == 200 and r.json()["so_sua"] == 2, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_sua", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_line_id": line_id,
    "p_code": "cp.qc", "p_code_name": "CP quảng cáo", "p_tk_no": "6427", "p_tk_co": "331", "p_note": "smoke",
    "p_seller_norm": "cong ty smoke", "p_desc_norm": "phi quang cao thang 8 smoke"})
chk("ke_toan_dong_sua: sửa lại y nguyên → so_sua 0", r.status_code == 200 and r.json()["so_sua"] == 0, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_thong_ke_hoc", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("ke_toan_thong_ke_hoc: NCC 1 lần đủ 70% → có 'cong ty smoke'", r.status_code == 200 and r.json()["ncc"].get("cong ty smoke") == "cp.qc", (r.status_code, r.text[:160]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_luat_them", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_kind": "supplier", "p_pattern": "cong ty smoke", "p_target_code": "cp.qc", "p_condition": ""})
chk("ke_toan_luat_them lần 1 → moi true", r.status_code == 200 and r.json()["moi"] is True, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_luat_them", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_kind": "supplier", "p_pattern": "cong ty smoke", "p_target_code": "cp.qc", "p_condition": ""})
chk("ke_toan_luat_them lần 2 → moi false (không trùng luật)", r.status_code == 200 and r.json()["moi"] is False, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_lich_su_nap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_rows": [{"seller_norm": "ncc lich su", "desc_norm": "tien dien thang", "code": "cp.vanhanhchung"}, {"seller_norm": "x", "desc_norm": "y", "code": ""}]})
chk("ke_toan_lich_su_nap: bỏ dòng không mã → inserted 1", r.status_code == 200 and r.json() == {"inserted": 1}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_gui", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id})
chk("ke_toan_ky_gui → da_gui", r.status_code == 200 and r.json()["status"] == "da_gui", (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_sua", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_line_id": line_id,
    "p_code": "cp.642khac", "p_code_name": "CP khác", "p_tk_no": "6427", "p_tk_co": "331", "p_note": "smoke",
    "p_seller_norm": "cong ty smoke", "p_desc_norm": "phi quang cao thang 8 smoke"})
chk("sửa sau khi gửi → edits_after_sent 1", r.status_code == 200 and r.json()["edits_after_sent"] == 1, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_dong_sua", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn", "p_line_id": line_id, "p_code": "x", "p_code_name": "x", "p_tk_no": "", "p_tk_co": "", "p_note": "", "p_seller_norm": "", "p_desc_norm": ""})
chk("vai cs: ke_toan_dong_sua BỊ từ chối", r.status_code >= 400, r.status_code)
```

- [ ] **Step 3: Commit + push, chờ CI `db-reset` xanh**

```bash
git add supabase/migrations/20260916020000_ke_toan_09_sua_tay_hoc.sql tools/scripts/smoke_local.py
git commit -m "feat(ke-toan): migration 09 — corrections cho lịch sử, RPC sửa dòng/đặt luật/thống kê học/gửi kế toán + smoke"
git push -u origin feat/ke-toan-lat-2
gh run list -w db-reset -c "$(git rev-parse HEAD)" --json databaseId --jq '.[0].databaseId' | xargs -I{} gh run watch {} --exit-status
```
Expected: run kết thúc `success`. Đỏ → sửa file (chưa áp = chưa bất biến), push lại.

- [ ] **Step 4: Áp live + đối chiếu ledger**

MCP `apply_migration(project_id='bwzmqfbcgouhvhoslmmm', name='ke_toan_09_sua_tay_hoc', query=<nội dung file>)`, rồi:
```sql
select version, name from supabase_migrations.schema_migrations where name like 'ke_toan_09%';
-- version ≠ 20260916020000 →
update supabase_migrations.schema_migrations set version = '20260916020000' where name = 'ke_toan_09_sua_tay_hoc';
```
Rồi `get_advisors(type='security')`: RPC `security definer` có `search_path=''` → không finding mới; có → ghi vào README "Điểm treo".

### Task 2: Engine tầng C — học từ `corrections`

**Files:**
- Modify: `apps/web/lib/ke-toan/engine/kieu.ts` (thêm type), `apps/web/lib/ke-toan/engine/dau-vao.ts` (đầu file + `suggest`)
- Test: `apps/web/lib/ke-toan/engine/dau-vao.test.ts`

**Interfaces:**
- Consumes: JSON của `ke_toan_thong_ke_hoc` (Task 1).
- Produces: `export type ThongKeHoc = { ncc: Record<string, string>; prefix: Record<string, string> }`; `taoEngineDauVao(input: { luat; catalog; kmcp; thongKe?: ThongKeHoc })`; `nguon` mới: `'hoc_ncc' | 'hoc_prefix'`, `conf: 'trung binh'`.

- [ ] **Step 1: Test đỏ** (thêm cuối `dau-vao.test.ts`)

```ts
describe('tầng C — học từ corrections (ke_toan_thong_ke_hoc)', () => {
  const thongKe = { ncc: { 'cong ty tnhh hoc thu': 'cp.qc' }, prefix: { 'phi quang cao facebook thang': 'cp.qc' } }
  const co = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp, thongKe })
  const khong = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  it('NCC từng được sửa ≥70% về một mã → mã đó, trung bình, nguon hoc_ncc', () => {
    expect(khong.phanLoai('CÔNG TY TNHH HỌC THỬ', 'dich vu abc', 1).kind).toBe('unknown')
    expect(co.phanLoai('CÔNG TY TNHH HỌC THỬ', 'dich vu abc', 1)).toMatchObject({ code: 'cp.qc', conf: 'trung binh', nguon: 'hoc_ncc' })
  })
  it('tiền tố 5 từ diễn giải ≥80% → mã đó, nguon hoc_prefix; NCC < 6 ký tự không học', () => {
    expect(co.phanLoai('X', 'Phí quảng cáo Facebook tháng 8 chiến dịch A', 1)).toMatchObject({ code: 'cp.qc', nguon: 'hoc_prefix' })
    expect(co.phanLoai('ABC', 'khong khop gi', 1).kind).toBe('unknown')
  })
  it('luật (override/rule) vẫn thắng học', () => {
    expect(co.phanLoai('CÔNG TY TNHH LALAMOVE VIETNAM', 'Phí quảng cáo Facebook tháng 8', 1).nguon).toBe('rule_ncc')
  })
})
```
`phanLoai` hiện trả `KetQuaDauVao` không có `nguon` → thêm `nguon` vào `KetQuaDauVao` (đã có sẵn trong object trả về ở `phanLoai`, chỉ thiếu ở type? kiểm: `KetQuaDauVao` có `nguon: string` — có rồi).

- [ ] **Step 2: Chạy → FAIL** `cd apps/web && npx vitest run lib/ke-toan/engine -t "tầng C"` — lỗi type `thongKe` không tồn tại.

- [ ] **Step 3: Implement**

`kieu.ts` thêm:
```ts
// Thống kê học từ corrections (RPC ke_toan_thong_ke_hoc) — ngưỡng tính ở SQL, engine chỉ tra.
export type ThongKeHoc = { ncc: Record<string, string>; prefix: Record<string, string> }
```
`dau-vao.ts`: import `ThongKeHoc`; chữ ký `taoEngineDauVao(input: { luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; thongKe?: ThongKeHoc })`; sau dòng `const kwCua = …` thêm
```ts
  const thongKe: ThongKeHoc = input.thongKe ?? { ncc: {}, prefix: {} }
  const tienTo = (desc: unknown, n = 5) => norm(desc).split(' ').slice(0, n).join(' ')
```
trong `suggest`, ngay trước `return { kmcp: '', conf: 'khong ro', …}`:
```ts
    if (p.length >= 6 && thongKe.ncc[p]) return { kmcp: thongKe.ncc[p], conf: 'trung binh', reason: `Lịch sử sửa tay: NCC này ≥70% vào '${thongKe.ncc[p]}'`, nguon: 'hoc_ncc' }
    const pref = tienTo(desc); if (pref && thongKe.prefix[pref]) return { kmcp: thongKe.prefix[pref], conf: 'trung binh', reason: `Lịch sử sửa tay: diễn giải "${pref}…" ≥80% vào '${thongKe.prefix[pref]}'`, nguon: 'hoc_prefix' }
```
Sửa comment đầu file: tầng C đã port, đọc từ `corrections`.

- [ ] **Step 4: Chạy** `npx vitest run lib/ke-toan/engine` → 13 passed, golden vẫn 322/322 (golden không truyền `thongKe`).
- [ ] **Step 5: Commit** `git commit -am "feat(ke-toan): engine tầng C học từ corrections (NCC ≥70%, tiền tố ≥80%)"`

### Task 3: Server actions — `suaDong`, `datThanhLuat`, `guiKeToan`, `danhSachMa`, engine dùng thống kê

**Files:**
- Modify: `apps/web/app/ke-toan/actions.ts`; `apps/web/lib/ke-toan/engine/dau-vao.ts` (export helper TK)
- Test: `apps/web/lib/ke-toan-guard.test.ts` (đã có — phải xanh), `apps/web/lib/ke-toan/engine/dau-vao.test.ts`

**Interfaces (Produces):**
```ts
export type KetQuaSua = { ok: true; soSua: number; suaSauGui: number } | { ok: false; error: string }
export async function suaDong(input: { lineId: number; code: string | null; note: string | null; tenBan: string | null; tenHang: string | null }): Promise<KetQuaSua>
export async function datThanhLuat(input: { kind: 'supplier' | 'keyword'; pattern: string; targetCode: string }): Promise<{ ok: true; id: number; moi: boolean } | { ok: false; error: string }>
export async function guiKeToan(periodId: number, ky: string): Promise<{ ok: false; error: string }>  // thành công thì redirect về màn kỳ
export async function danhSachMa(): Promise<MucChon[]>   // KMCP + catalog, gt = mã
export function tkNoCuaTinhChat(tinhChat: string | null | undefined): string   // trong engine/dau-vao.ts: 'Hàng hóa'|'Thành phẩm'→'1561', 'Nguyên vật liệu'→'152', 'Công cụ dụng cụ'→'153', khác→'1561'
```

- [ ] **Step 1: Test helper TK** (thêm vào `dau-vao.test.ts`)
```ts
it('tkNoCuaTinhChat theo bảng TINH_CHAT_TK, mặc định 1561', () => {
  expect(tkNoCuaTinhChat('Nguyên vật liệu')).toBe('152'); expect(tkNoCuaTinhChat('Công cụ dụng cụ')).toBe('153'); expect(tkNoCuaTinhChat(null)).toBe('1561')
})
```
Chạy → FAIL (chưa export). Thêm vào `dau-vao.ts` sau `TK_HANG_MAC_DINH`:
```ts
export function tkNoCuaTinhChat(tinhChat: string | null | undefined): string { return TINH_CHAT_TK[tinhChat ?? ''] ?? TK_HANG_MAC_DINH }
```
và import ở test. Chạy → PASS.

- [ ] **Step 2: Sửa `actions.ts`**

Đổi `duLieuEngine` để trả thêm `thongKe` và `catalog` giữ `tinhChat`:
```ts
async function duLieuEngine(): Promise<{ luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; thongKe: ThongKeHoc }> {
  await chanKeToan()
  const db = dataClient()
  const [luat, cat, km, thongKe] = await Promise.all([
    goi<…>('ke_toan_luat_list', {}),
    db.from('catalog_item').select('"Mã nội bộ", "Tên ngắn gọn (đề xuất)", "Tính chất"'),
    db.from('expense_category').select('ma, ten, tk_no_default'),
    goi<ThongKeHoc>('ke_toan_thong_ke_hoc', {}),
  ])
  …
  return { luat: …, catalog: …, kmcp: …, thongKe: thongKe ?? { ncc: {}, prefix: {} } }
}
```
`nhapNexia`: `const eng = taoEngineDauVao(dl)` giữ nguyên (dl có `thongKe`).

Thêm sau `dongCuaKy`:
```ts
import { norm } from '@/lib/ke-toan/chuan-hoa'
import { tkNoCuaTinhChat } from '@/lib/ke-toan/engine/dau-vao'
import type { MucChon } from '@/bang'

/** Tra tên + TK Nợ của một mã: KMCP (expense_category) hoặc mã nội bộ (catalog_item). null = không có trong danh mục. */
async function tenVaTk(code: string): Promise<{ codeName: string; tkNo: string } | null> {
  const dl = await duLieuEngine()
  const k = dl.kmcp.find((x) => x.ma === code); if (k) return { codeName: k.ten, tkNo: k.tkNoDefault }
  const c = dl.catalog.find((x) => x.ma === code); if (c) return { codeName: c.ten, tkNo: tkNoCuaTinhChat(c.tinhChat) }
  return null
}

export type KetQuaSua = { ok: true; soSua: number; suaSauGui: number } | { ok: false; error: string }
/** Sửa mã / ghi chú một dòng. tenBan/tenHang chỉ để tính khoá học (norm), không ghi vào dòng. */
export async function suaDong(input: { lineId: number; code: string | null; note: string | null; tenBan: string | null; tenHang: string | null }): Promise<KetQuaSua> {
  await chanKeToan()
  try {
    const code = input.code?.trim() || null
    const tt = code ? await tenVaTk(code) : null
    if (code && !tt) return { ok: false, error: `Mã "${code}" không có trong danh mục KMCP/catalog.` }
    const r = await goi<{ so_sua: number; edits_after_sent: number }>('ke_toan_dong_sua', {
      p_line_id: input.lineId, p_code: code, p_code_name: tt?.codeName ?? null, p_tk_no: tt?.tkNo ?? null, p_tk_co: code ? '331' : null,
      p_note: input.note?.trim() || null, p_seller_norm: norm(input.tenBan), p_desc_norm: norm(input.tenHang),
    })
    return { ok: true, soSua: r.so_sua, suaSauGui: r.edits_after_sent }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

export async function datThanhLuat(input: { kind: 'supplier' | 'keyword'; pattern: string; targetCode: string }): Promise<{ ok: true; id: number; moi: boolean } | { ok: false; error: string }> {
  await chanKeToan()
  try {
    const r = await goi<{ id: number; moi: boolean }>('ke_toan_luat_them', { p_kind: input.kind, p_pattern: norm(input.pattern), p_target_code: input.targetCode, p_condition: '' })
    await ghiAudit('ke_toan.dat_luat', input.targetCode, { kind: input.kind, pattern: norm(input.pattern), moi: r.moi })
    return { ok: true, ...r }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

export async function guiKeToan(periodId: number, ky: string): Promise<{ ok: false; error: string }> {
  await chanKeToan()
  try {
    const r = await goi<{ so_canh_bao: number }>('ke_toan_ky_gui', { p_period_id: periodId })
    await ghiAudit('ke_toan.da_gui', ky, { so_canh_bao: r.so_canh_bao })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/hoa-don/${ky}`)
  } catch (e) { return { ok: false, error: (e as Error).message } }
  redirect(`/ke-toan/hoa-don/${ky}`) // ngoài try: NEXT_REDIRECT
}

/** Danh sách mã cho ô chọn: KMCP trước, rồi catalog. gt = mã. */
export async function danhSachMa(): Promise<MucChon[]> {
  const dl = await duLieuEngine()
  return [
    ...dl.kmcp.map((k) => ({ gt: k.ma, nhan: `${k.ma} · ${k.ten}`, phu: `KMCP · TK ${k.tkNoDefault || '—'}` })),
    ...dl.catalog.map((c) => ({ gt: c.ma, nhan: `${c.ma} · ${c.ten}`, phu: c.tinhChat })),
  ]
}
```
Kiểm `ghiAudit` chữ ký ở `lib/nen-tang/nhat-ky.ts` (đã dùng: `ghiAudit(hanh_dong, doi_tuong, chi_tiet, muc?)`).

- [ ] **Step 3: Kiểm** `npx tsc --noEmit && npx vitest run lib/ke-toan-guard.test.ts lib/ke-toan && npx eslint app/ke-toan lib/ke-toan` → xanh. Guard: `suaDong`/`datThanhLuat`/`guiKeToan` có `chanKeToan()` trước `try` ✓, `tenVaTk` gọi `duLieuEngine` (gọi `chanKeToan`) ✓.
- [ ] **Step 4: Commit** `git commit -am "feat(ke-toan): action suaDong/datThanhLuat/guiKeToan/danhSachMa; upload dùng thống kê học"`

### Task 4: Màn kỳ — sửa trên ô, Đặt thành luật, Đã gửi kế toán, trạng thái kỳ

**Files:**
- Create: `apps/web/app/ke-toan/hoa-don/[ky]/DongSua.tsx`, `apps/web/app/ke-toan/hoa-don/[ky]/NutGuiKeToan.tsx`
- Modify: `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx` (thân bảng + header), `apps/web/app/ke-toan/page.tsx` (cột Trạng thái)

**Interfaces (Consumes):** `suaDong`, `datThanhLuat`, `guiKeToan`, `danhSachMa` (Task 3); `OChonGoiY`, `MucChon` từ `@/bang`; `DongRow`, `KyRow` từ `actions.ts`.

- [ ] **Step 1: Chạy router UI** `gwt-ui-skills:designing-ui` với brief: "màn bảng dữ liệu nội bộ, thêm sửa-tại-ô cho 2 cột (Mã, Ghi chú) + menu dòng + nút trạng thái ở header; tone khu Kế toán `#3f8a6a`; density `text-xs`". Ghi kết luận pha structure (ô nào sửa được, feedback ở đâu, state lỗi) vào đầu file `DongSua.tsx` dưới dạng comment 5 dòng.

- [ ] **Step 2: `DongSua.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { OChonGoiY, type MucChon } from '@/bang'
import { suaDong, datThanhLuat, type DongRow } from '../../actions'
import { norm } from '@/lib/ke-toan/chuan-hoa'

/** Ba ô sửa tại chỗ của một dòng: Mã (chọn gõ-để-tìm), Ghi chú (blur mới lưu), menu "Đặt thành luật".
 *  Lưu xong: chấm xanh 2s; lỗi: chữ đỏ ngay dưới ô, giữ giá trị người gõ. Không reload trang — hàng khác không nháy. */
export function DongSua({ d, ma, huong }: { d: DongRow; ma: MucChon[]; huong: 'vao' | 'ra' }) {
  const [code, setCode] = useState(d.code)
  const [codeName, setCodeName] = useState(d.code_name)
  const [note, setNote] = useState(d.note_for_accountant ?? '')
  const [tb, setTb] = useState<{ ok: boolean; msg: string } | null>(null)
  const [moLuat, setMoLuat] = useState(false)
  const [dang, batDau] = useTransition()

  function luu(codeMoi: string | null, noteMoi: string) {
    batDau(async () => {
      const r = await suaDong({ lineId: d.id, code: codeMoi, note: noteMoi, tenBan: d.ten_ban, tenHang: d.ten_hang })
      if (!r.ok) { setTb({ ok: false, msg: r.error }); return }
      setCode(codeMoi); setCodeName(ma.find((m) => m.gt === codeMoi)?.nhan.split(' · ')[1] ?? null)
      setTb({ ok: true, msg: r.suaSauGui > 0 ? `Đã lưu · sửa sau gửi #${r.suaSauGui}` : 'Đã lưu' }); setTimeout(() => setTb(null), 2000)
    })
  }
  function datLuat(kind: 'supplier' | 'keyword') {
    if (!code) return
    const pattern = kind === 'supplier' ? norm(d.ten_ban) : norm(d.ten_hang).split(' ').slice(0, 3).join(' ')
    batDau(async () => {
      const r = await datThanhLuat({ kind, pattern, targetCode: code })
      setTb(r.ok ? { ok: true, msg: r.moi ? `Đã đặt luật: ${kind === 'supplier' ? 'NCC' : 'diễn giải'} chứa "${pattern}" → ${code}` : 'Luật này đã có' } : { ok: false, msg: r.error })
      setMoLuat(false)
    })
  }
  return (
    <>
      <td className="p-1 min-w-[220px]">
        <OChonGoiY giaTri={code} onChon={(gt) => luu(gt || null, note)} tuyChon={ma} choTrong="Gõ mã / tên…" className="text-xs" />
        {codeName ? <div className="px-1 text-[11px] text-slate-500">{codeName}</div> : null}
      </td>
      <td className="p-1 min-w-[200px]">
        <input value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (d.note_for_accountant ?? '') && luu(code, note)}
          placeholder="Ghi chú cho kế toán" className="w-full rounded border px-1 py-0.5 text-xs" />
        {tb ? <div className={`px-1 text-[11px] ${tb.ok ? 'text-emerald-700' : 'text-red-600'}`}>{tb.msg}</div> : null}
      </td>
      <td className="p-1 whitespace-nowrap">
        {huong === 'vao' && code ? (
          moLuat ? (
            <span className="inline-flex gap-1">
              <button type="button" disabled={dang} onClick={() => datLuat('supplier')} className="rounded border px-1.5 text-[11px]">NCC → {code}</button>
              <button type="button" disabled={dang} onClick={() => datLuat('keyword')} className="rounded border px-1.5 text-[11px]">Diễn giải → {code}</button>
              <button type="button" onClick={() => setMoLuat(false)} className="px-1 text-[11px] text-slate-400">✕</button>
            </span>
          ) : <button type="button" onClick={() => setMoLuat(true)} className="text-[11px] text-[#3f8a6a] underline">Đặt thành luật</button>
        ) : null}
      </td>
    </>
  )
}
```

- [ ] **Step 3: `NutGuiKeToan.tsx`**

```tsx
'use client'
import { useActionState } from 'react'
import { guiKeToan, type KyRow } from '../../actions'

export function NutGuiKeToan({ period }: { period: KyRow }) {
  const [kq, act, dang] = useActionState(async () => guiKeToan(period.id, period.ky), null as null | { ok: false; error: string })
  if (period.status === 'da_gui') {
    return <span className="rounded bg-emerald-50 px-2 py-1 text-sm text-emerald-800">Đã gửi kế toán {period.sent_at ? new Date(period.sent_at).toLocaleDateString('vi-VN') : ''}{period.edits_after_sent > 0 ? ` · ${period.edits_after_sent} sửa sau gửi` : ''}</span>
  }
  return (
    <form action={act} onSubmit={(e) => { if (!window.confirm(period.so_canh_bao > 0 ? `Còn ${period.so_canh_bao} dòng cảnh báo chưa xử lý. Vẫn đánh dấu đã gửi?` : 'Đánh dấu kỳ đã gửi kế toán?')) e.preventDefault() }}>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-sm text-white disabled:opacity-50">{dang ? 'Đang ghi…' : 'Đã gửi kế toán'}</button>
      {kq && !kq.ok ? <span className="ml-2 text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
```
`KyRow` cần thêm `edits_after_sent: number` (RPC `ke_toan_ky_list` chưa trả → thêm `'edits_after_sent', p.edits_after_sent` vào jsonb của `ke_toan_ky_list` **trong migration 09 Task 1** — bổ sung `create or replace function public.ke_toan_ky_list` y nguyên bản migration 03 + trường mới; nhớ CI trước khi áp).

- [ ] **Step 4: Nối vào `hoa-don/[ky]/page.tsx`**
  - `const ma = await danhSachMa()` sau `dongCuaKy`.
  - Header: `<NutGuiKeToan period={period} />` cạnh nút tải Excel; `<h1>` thêm nhãn trạng thái nếu `da_gui`.
  - `<thead>`: thay 5 cột `Mã · Tên mã · TK Nợ · TK Có · 1331` bằng `Mã (sửa) · Ghi chú · Luật · TK Nợ · TK Có · 1331` — thứ tự: `# · Số HĐ · Ngày · Người bán · Tên hàng · Thành tiền · Mã · Ghi chú · Luật · TK Nợ · TK Có · 1331 · Độ tin cậy · Căn cứ`.
  - `<tbody>` mỗi dòng: `<DongSua d={d} ma={ma} huong={direction} />` thay cho 5 `<td>` cũ; TK/1331 vẫn `{d.tk_no}` (đọc lại sau F5 — chấp nhận; DongSua chỉ cập nhật mã/tên).
- [ ] **Step 5: `page.tsx` (danh sách kỳ)**: thêm lại cột "Trạng thái": `k.status === 'da_gui' ? 'Đã gửi' + (k.edits_after_sent ? ` · ${k.edits_after_sent} sửa` : '') : 'Đang xử lý'`; `colSpan` 6.
- [ ] **Step 6: Kiểm tự động** `npx tsc --noEmit && npm run test && npx eslint app/ke-toan && npm run build`.
- [ ] **Step 7: Kiểm thị giác** (gate `verifying-visual-changes`): bật `npx next dev --webpack -p 3000`, đăng nhập, `/ke-toan/hoa-don/2026-08`: đổi mã 1 dòng vàng → chấm "Đã lưu", F5 vẫn giữ; gõ ghi chú → blur → lưu; "Đặt thành luật" → thông báo; nút "Đã gửi kế toán" → confirm → nhãn xanh; sửa thêm 1 dòng → "sửa sau gửi #1". Chụp 2 ảnh vào phiên (không commit).
- [ ] **Step 8: `reviewing-finished-ui`** + sửa theo checklist; commit `feat(ke-toan): sửa mã/ghi chú tại ô, Đặt thành luật, Đã gửi kế toán`; push.

### Task 5: Nạp 720 dòng lịch sử chi phí (chạy tay, một lần) + README lát 2

**Files:**
- Create: `tools/scripts/ke_toan_nap_lich_su.py`
- Modify: `docs/ke-toan/README.md` (Route, Quy trình tháng, Việc treo), `apps/web/lib/ke-toan/xuat/_xem-truoc.test.ts` **không commit**

- [ ] **Step 1: Script** (mẫu kết nối như `ke_toan_sinh_golden.py`; bảng SQLite `expense` cột `ten_doi_tuong`, `dien_giai`, `ma_kmcp` — theo `ingest.py load_expense`)

```python
"""Nạp lịch sử chi phí T1–T6/2026 (SQLite tool Python) vào accounting.corrections origin='history' qua RPC.
Chạy TAY một lần: python tools/scripts/ke_toan_nap_lich_su.py [--dry]. Cần .env.local (service_role) — KHÔNG commit output.
seller_norm/desc_norm tính bằng cùng hàm norm của engine.py để khớp cách engine TS chuẩn hoá."""
import glob, json, os, sys, requests
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG = glob.glob(os.path.join(ROOT, "data", "ke-toan", "*", "*", "gwt_ketoan"))[0]
sys.path.insert(0, os.path.dirname(PKG))
from gwt_ketoan import engine  # noqa: E402
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "apps", "web", ".env.local"), encoding="utf-8") if "=" in l and not l.startswith("#"))
U, K = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]
con = engine.connect()
rows = [{"seller_norm": engine.norm(r["ten_doi_tuong"]), "desc_norm": engine.norm(r["dien_giai"]), "code": (r["ma_kmcp"] or "").strip()}
        for r in con.execute("SELECT ten_doi_tuong, dien_giai, ma_kmcp FROM expense WHERE ma_kmcp IS NOT NULL AND ma_kmcp <> ''")]
print("dòng lịch sử:", len(rows))
if "--dry" in sys.argv: sys.exit(0)
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_lich_su_nap", headers={"apikey": K, "Authorization": f"Bearer {K}", "Content-Type": "application/json"},
                  json={"p_email": "ai@gwt.vn", "p_rows": rows}, timeout=120)
print(r.status_code, r.text[:200])
```
- [ ] **Step 2: Chạy `--dry`** → in số dòng (kỳ vọng ≈ 720). Chạy thật → `{"inserted": N}`. Kiểm: `select origin, count(*) from accounting.corrections group by 1` (MCP, chỉ đọc). Chạy lần 2 sẽ nhân đôi → trước khi chạy lại phải `delete from accounting.corrections where origin='history'` (ghi trong docstring).
- [ ] **Step 3: Đo hiệu quả** bằng script tạm `_xem-truoc.test.ts` mục "engine + luật DB": thêm `thongKe` từ `ke_toan_thong_ke_hoc` vào `taoEngineDauVao` → in số dòng kỳ 08 engine gán được nhờ `hoc_*` so với trước (kỳ vọng ≥ 0, ghi số vào README "Trạng thái").
- [ ] **Step 4: README** — Route: ô sửa, Đặt thành luật, Đã gửi; Quy trình tháng bước 4–5 theo spec §4; Việc treo: bỏ mục đã làm (c, p), thêm "lịch sử nạp N dòng ngày …". Commit `docs(ke-toan): lát 2 — sửa tay, học, luật app, đã gửi`.
- [ ] **Step 5: Mời CEO** xem local (cổng 3000): kịch bản Task 4 Step 7. CEO OK → `finishing-a-development-branch` → merge `main`.

---

## LÁT 3 — HĐ đầu ra: mã nội bộ · mã khách · nhóm SP · kênh/đại lý · Excel đủ cột template

### Task 6: Tách gợi ý mã nội bộ ra `engine/ma-noi-bo.ts` (refactor, golden giữ nguyên)

**Files:**
- Create: `apps/web/lib/ke-toan/engine/ma-noi-bo.ts`
- Modify: `apps/web/lib/ke-toan/engine/dau-vao.ts` (bỏ `STOP`, `KWSET`, `chuKy`, `goiYMaNoiBo`, `sig`, `shipping`)
- Test: `apps/web/lib/ke-toan/engine/dau-vao.test.ts` (golden — không đổi), thêm `ma-noi-bo.test.ts`

**Interfaces (Produces):**
```ts
export type GoiYMa = { ma: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; canCu: string }
export function taoGoiYMaNoiBo(luat: Luat[]): (tenHang: unknown) => GoiYMa
```

- [ ] **Step 1: Test đỏ** `ma-noi-bo.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { taoGoiYMaNoiBo } from './ma-noi-bo'
import type { Luat } from './kieu'
const L: Luat[] = [
  { kind: 'product_name', pattern: 'máy lọc nước ge ctd50', targetCode: 'CTD50NG', condition: null, priority: 0, origin: 'history', active: true },
  { kind: 'product_name', pattern: 'dich vu van chuyen', targetCode: 'DVVC', condition: null, priority: 0, origin: 'override_json', active: true },
]
describe('taoGoiYMaNoiBo — port match_code Python', () => {
  const goiY = taoGoiYMaNoiBo(L)
  it('khớp tên lịch sử (sd) → cao', () => expect(goiY('Máy lọc nước GE CTD50')).toMatchObject({ ma: 'CTD50NG', conf: 'cao' }))
  it('CTS10 theo màu, vòi sen Aromatherapy theo màu, vận chuyển → DVVC', () => {
    expect(goiY('Máy lọc nước GE CTS10 (Trắng)').ma).toBe('CTS10NW')
    expect(goiY('Vòi sen tắm Aromatherapy GE (Hồng)').ma).toBe('GEUS-00X06')
    expect(goiY('Dịch vụ vận chuyển').ma).toBe('DVVC')
  })
  it('rỗng → trong; không khớp → can gan tay', () => { expect(goiY('').conf).toBe('trong'); expect(goiY('abc xyz').conf).toBe('can gan tay') })
})
```
- [ ] **Step 2: Chạy → FAIL** (module chưa có).
- [ ] **Step 3: Tạo `ma-noi-bo.ts`** — chuyển nguyên khối từ `dau-vao.ts`: `STOP`, `KWSET`, `chuKy`, dựng `ovName`/`n2c`/`sigCount`/`sig`/`shipping` từ `luat`, hàm `goiYMaNoiBo` → trả về hàm. `dau-vao.ts`: `import { taoGoiYMaNoiBo } from './ma-noi-bo'`; trong `taoEngineDauVao`: `const goiYMaNoiBo = taoGoiYMaNoiBo(L)`; giữ comment "Lệch Python có chủ đích" ở file mới.
- [ ] **Step 4: Chạy** `npx vitest run lib/ke-toan/engine` → tất cả xanh, golden 322/322.
- [ ] **Step 5: Commit** `refactor(ke-toan): tách gợi ý mã nội bộ ra engine/ma-noi-bo.ts dùng chung vào/ra`

### Task 7: `engine/dau-ra.ts` + golden đầu ra từ Python

**Files:**
- Create: `apps/web/lib/ke-toan/engine/dau-ra.ts`, `apps/web/lib/ke-toan/engine/dau-ra.test.ts`, `apps/web/lib/ke-toan/__fixtures__/t8-dau-ra.json`
- Modify: `apps/web/lib/ke-toan/engine/kieu.ts`, `tools/scripts/ke_toan_sinh_golden.py`

**Interfaces (Produces):**
```ts
// kieu.ts
export type MucCatalog = { ma: string; ten: string; tinhChat: string; capHai?: string; capBa?: string }   // capHai/capBa = "Danh mục cấp 2/3"
export type NhomSP = 'POE' | 'POU-Countertop' | 'POU-Undersink' | 'Others'
export type MucKenh = { mst: string | null; companyName: string | null; channelL1: string; channelL2: string }   // public.dim_channel
export type KetQuaDauRa = { code: string; codeName: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; reason: string; customerCode: string; productGroup: NhomSP | ''; channelL1: string; channelL2: string; dealerName: string }
// dau-ra.ts
export function nhomSpCua(c: MucCatalog | undefined): NhomSP | ''
export function taoEngineDauRa(input: { luat: Luat[]; catalog: MucCatalog[]; kenh: MucKenh[] }): { phanLoaiRa: (tenHang: unknown, mstMua: unknown, tenMua: unknown) => KetQuaDauRa }
```
Quy tắc (port `classify_output_row` + đo `kh_map.json` 15/09: `mst2kh` là ánh xạ MST→chính MST, `name2kh` cho ra `KHL`/`KHSP`/MST):
- `customerCode`: `mstMua` có → `mstMua.trim()`; không → `norm(tenMua)` chứa `shopee` → `'KHSP'`; còn lại `'KHL'`.
- `productGroup` từ catalog cấp 2/3: `POE`, `POE Filters` → `POE`; `POU` + cấp 3 `Undersink` → `POU-Undersink`; `POU` + (`Countertop`|`Sparkling`|`Standing`) → `POU-Countertop`; `POU Filters` → **`POU-Undersink`** (⚠ CEO chốt — ghi README "Điểm treo" cho tới khi gật); mã dịch vụ/KMCP/không có trong catalog → `''`; còn lại → `Others`.
- `channel`: `KHSP` → `Ecom`/`Shopee`; MST khớp `dim_channel.mst` → `channel_l1/l2` (**hiện 0/26 dòng có mst** — điền ở Masterdata, engine sẵn sàng); không khớp → `''`; `dealerName = channelL1 === 'Đại lý' ? channelL2 : ''`.

- [ ] **Step 1: Sinh golden** — thêm vào cuối `ke_toan_sinh_golden.py`:
```python
# --- Đầu ra: expected = classify_output_row (mã nội bộ, độ tin cậy, mã khách). Che: tên người mua cá nhân → "KH-<n>" giữ chữ "(shopee)" nếu có; MST giữ (mã số DN, không PII cá nhân).
ws_ra = next(ws for ws in openpyxl.load_workbook(XLSX, read_only=True) if nexia.sd("đầu ra") in nexia.sd(ws.title))
hmap = nexia._hdr_map(ws_ra)
c_ten, c_mst, c_mua = nexia._find(hmap, "tên hàng"), nexia._find(hmap, "mst người mua"), nexia._find(hmap, "tên người mua")
rows_ra, kh_seq = [], {}
for i, r in enumerate(ws_ra.iter_rows(min_row=2, values_only=True), start=1):
    desc, mst, buyer = r[c_ten - 1], r[c_mst - 1], r[c_mua - 1]
    if not desc and not r[nexia._find(hmap, "số hóa đơn") - 1]: continue
    ic, conf, makh = nexia.classify_output_row(desc, mst, buyer)
    b = str(buyer or "")
    b_che = b if CTY.search(b) else kh_seq.setdefault(b.lower(), f"KH-{len(kh_seq)+1}") + (" (shopee)" if "shopee" in b.lower() else "")
    rows_ra.append({"i": i, "desc": che(desc), "mst": str(mst or "").strip(), "buyer": b_che, "expected": {"ma": ic, "conf": conf, "makh": makh if makh in ("KHL", "KHSP") or CTY.search(b) else ("KHSP" if "shopee" in b.lower() else "KHL")}})
json.dump({"rows": rows_ra}, open(os.path.join(OUT, "t8-dau-ra.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("t8-dau-ra.json:", len(rows_ra), "dòng")
```
Chạy `python tools/scripts/ke_toan_sinh_golden.py` → kỳ vọng 85 dòng. Quét PII: `python tools/scripts/scan_pii_secrets.py apps/web/lib/ke-toan/__fixtures__/t8-dau-ra.json` sạch mới commit.

- [ ] **Step 2: Test đỏ** `dau-ra.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { taoEngineDauRa, nhomSpCua } from './dau-ra'
import type { Luat, MucCatalog } from './kieu'
type GoldenRa = { rows: { i: number; desc: string; mst: string; buyer: string; expected: { ma: string; conf: string; makh: string } }[] }
const golden = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-ra.json', import.meta.url)), 'utf8')) as GoldenRa
const catalog = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/catalog-t8.json', import.meta.url)), 'utf8')) as MucCatalog[]
function luatTuSeed(): Luat[] { /* chép nguyên hàm từ dau-vao.test.ts — cùng regex đọc migration 01 */ }
describe('engine đầu ra — parity Python classify_output_row trên T8', () => {
  const eng = taoEngineDauRa({ luat: luatTuSeed(), catalog, kenh: [] })
  it('mã nội bộ + mã khách khớp Python trên mọi dòng Python đã gán', () => {
    const lech: string[] = []
    for (const r of golden.rows) {
      const kq = eng.phanLoaiRa(r.desc, r.mst, r.buyer)
      if (r.expected.ma && kq.code !== r.expected.ma) lech.push(`#${r.i} ${r.desc}: python=${r.expected.ma} ts=${kq.code}`)
      if (kq.customerCode !== r.expected.makh) lech.push(`#${r.i} mã khách: python=${r.expected.makh} ts=${kq.customerCode}`)
    }
    expect(lech, lech.join('\n')).toEqual([])
  })
  it('nhóm SP theo danh mục cấp 2/3', () => {
    expect(nhomSpCua({ ma: 'CTD50NG', ten: '', tinhChat: 'Hàng hóa', capHai: 'POU', capBa: 'Countertop' })).toBe('POU-Countertop')
    expect(nhomSpCua({ ma: 'GTUN-8500VNDS', ten: '', tinhChat: 'Hàng hóa', capHai: 'POU', capBa: 'Undersink' })).toBe('POU-Undersink')
    expect(nhomSpCua({ ma: 'WH15A', ten: '', tinhChat: 'Thành phẩm', capHai: 'POE', capBa: 'System' })).toBe('POE')
    expect(nhomSpCua({ ma: 'GEUS-00X06', ten: '', tinhChat: 'Thành phẩm', capHai: 'Others', capBa: 'Showerhead' })).toBe('Others')
    expect(nhomSpCua(undefined)).toBe('')
  })
  it('kênh: Shopee → Ecom/Shopee; MST khớp dim_channel → kênh + đại lý', () => {
    const e2 = taoEngineDauRa({ luat: [], catalog, kenh: [{ mst: '0100000009', companyName: 'X', channelL1: 'Đại lý', channelL2: 'Vinsols' }] })
    expect(e2.phanLoaiRa('x', '', 'Cẩm Ly (shopee)')).toMatchObject({ customerCode: 'KHSP', channelL1: 'Ecom', channelL2: 'Shopee' })
    expect(e2.phanLoaiRa('x', '0100000009', 'CÔNG TY X')).toMatchObject({ customerCode: '0100000009', channelL1: 'Đại lý', dealerName: 'Vinsols' })
    expect(e2.phanLoaiRa('x', '', 'Nguyễn Văn A').customerCode).toBe('KHL')
  })
})
```
- [ ] **Step 3: Implement `dau-ra.ts`**
```ts
import { norm, sd } from '../chuan-hoa'
import { taoGoiYMaNoiBo } from './ma-noi-bo'
import type { KetQuaDauRa, Luat, MucCatalog, MucKenh, NhomSP } from './kieu'

export function nhomSpCua(c: MucCatalog | undefined): NhomSP | '' {
  if (!c || c.ma.startsWith('cp.') || c.tinhChat === 'Dịch vụ') return ''
  const c2 = c.capHai ?? '', c3 = c.capBa ?? ''
  if (c2 === 'POE' || c2 === 'POE Filters') return 'POE'
  if (c2 === 'POU') return c3 === 'Undersink' ? 'POU-Undersink' : 'POU-Countertop'
  if (c2 === 'POU Filters') return 'POU-Undersink' // ⚠ CEO chốt (README Điểm treo)
  return 'Others'
}

export function taoEngineDauRa(input: { luat: Luat[]; catalog: MucCatalog[]; kenh: MucKenh[] }) {
  const goiY = taoGoiYMaNoiBo(input.luat.filter((l) => l.active))
  const cat = new Map(input.catalog.map((c) => [c.ma, c]))
  const kenhTheoMst = new Map(input.kenh.filter((k) => k.mst).map((k) => [k.mst!.trim(), k]))
  function phanLoaiRa(tenHang: unknown, mstMua: unknown, tenMua: unknown): KetQuaDauRa {
    const g = goiY(tenHang)
    const c = cat.get(g.ma)
    const mst = String(mstMua ?? '').trim()
    const customerCode = mst ? mst : norm(tenMua).includes('shopee') ? 'KHSP' : 'KHL'
    const k = mst ? kenhTheoMst.get(mst) : undefined
    const channelL1 = customerCode === 'KHSP' ? 'Ecom' : k?.channelL1 ?? ''
    const channelL2 = customerCode === 'KHSP' ? 'Shopee' : k?.channelL2 ?? ''
    return { code: g.ma, codeName: c?.ten ?? '', conf: g.conf, reason: g.canCu, customerCode, productGroup: nhomSpCua(c), channelL1, channelL2, dealerName: channelL1 === 'Đại lý' ? channelL2 : '' }
  }
  return { phanLoaiRa }
}
```
- [ ] **Step 4: Chạy** `npx vitest run lib/ke-toan/engine/dau-ra` → PASS; lệch với Python → sửa `ma-noi-bo.ts` theo đúng Python (`match_code`), không sửa golden. Dòng Python trống mà TS điền → in ra, không fail (như đầu vào).
- [ ] **Step 5: Commit** `feat(ke-toan): engine đầu ra — mã nội bộ, mã khách, nhóm SP, kênh; golden T8 đầu ra`

### Task 8: Nối đầu ra vào upload · bảng tab ra · Excel đủ cột template

**Files:**
- Create: `supabase/migrations/20260923020000_ke_toan_10_dau_ra_hdct.sql` (**viết chung với Task 10** — một migration cho lát 3+4; `ke_toan_dong_list` trả `first_source_kind`)
- Modify: `apps/web/app/ke-toan/actions.ts` (`duLieuEngine` + `dongSql` + `nhapNexia`), `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx` (cột tab ra), `apps/web/app/ke-toan/hoa-don/[ky]/xuat/route.ts`, `apps/web/lib/ke-toan/xuat/excel-hoa-don.ts`
- Test: `apps/web/lib/ke-toan/xuat/excel-dien-goc.test.ts`

**Interfaces:**
- `DongXuat` thêm: `customerCode: string | null; productGroup: string | null; channelL1: string | null; channelL2: string | null; dealerName: string | null; nguon: 'nexia' | 'hdct' | 'hdtq'` (nguon dùng ở Task 10).
- `duLieuEngine()` trả thêm `kenh: MucKenh[]` (đọc `dim_channel` qua `dataClient().from('dim_channel').select('mst, company_name, channel_l1, channel_l2')`) và catalog có `capHai/capBa` (`select` thêm `"Danh mục cấp 2", "Danh mục cấp 3"`).

- [ ] **Step 1: Test đỏ exporter** (thêm vào `excel-dien-goc.test.ts`)
```ts
it('tab đầu ra: 2 cột thêm + điền cột template có sẵn (Mã hàng, Loại, Kênh, Đại lý) đúng dòng', async () => {
  const wb0 = new ExcelJS.Workbook()
  wb0.addWorksheet('HĐ đầu vào').addRow(H_VAO)
  const ra0 = wb0.addWorksheet('HĐ Đầu ra'); ra0.addRow([...H_RA, 'Loại', 'Kênh', 'Đại lý']); ra0.addRow([1, '10', 'Máy lọc', null, null, null, null])
  const goc = new Uint8Array(await wb0.xlsx.writeBuffer())
  const wb = await doc(await dienExcelHoaDon({ goc, vao: [], ra: [dong(1, '10', { code: 'CTD50NG', customerCode: 'KHSP', productGroup: 'POU-Countertop', channelL1: 'Ecom', channelL2: 'Shopee', dealerName: '' })] }))
  const ra = wb.getWorksheet('HĐ Đầu ra')!
  expect(ra.getCell(2, 4).value).toBe('CTD50NG')          // Mã hàng (template)
  expect(ra.getCell(2, 5).value).toBe('POU-Countertop')   // Loại
  expect(ra.getCell(2, 6).value).toBe('Ecom / Shopee')    // Kênh
  expect(ra.getCell(2, 7).value).toBeNull()               // Đại lý rỗng
  expect(ra.getCell(1, 8).value).toBe('Mã nội bộ (đề xuất)'); expect(ra.getCell(2, 8).value).toBe('CTD50NG'); expect(ra.getCell(2, 9).value).toBe('KHSP')
})
```
`dong()` helper thêm mặc định `customerCode: null, productGroup: null, channelL1: null, channelL2: null, dealerName: null, nguon: 'nexia'`.
- [ ] **Step 2: Implement exporter** — trong `dienTab` sau khi tính `headers`, với `tab === 'ra'`: `const cTpl = { maHang: timCot(headers.slice(0, nGoc), 'mã hàng'), loai: timCot(…, 'loại'), kenh: timCot(…, 'kênh'), daiLy: timCot(…, 'đại lý') }`; trong vòng `for (const d of dong)` sau `giaTriThem`: nếu `cTpl.maHang >= 0 && d.code` ghi `row.getCell(cTpl.maHang + 1).value = d.code`; `loai` ← `d.productGroup || null`; `kenh` ← `d.channelL1 ? (d.channelL2 ? `${d.channelL1} / ${d.channelL2}` : d.channelL1) : null`; `daiLy` ← `d.dealerName || null`. `giaTriThem` cho `ra`: `[d.code, d.customerCode]`.
- [ ] **Step 3: actions** — `dongSql(direction, d, lineKey, engine?: KetQuaDauVao, engineRa?: KetQuaDauRa)`: với `ra`: `engine_code: engineRa.code, engine_conf: engineRa.conf, engine_reason: engineRa.reason, engine_kind: 'goods', code: engineRa.code || null, code_name: engineRa.codeName || null, customer_code: engineRa.customerCode, product_group: engineRa.productGroup || null, channel_l1/l2, dealer_name`. `nhapNexia`: `const engRa = taoEngineDauRa({ luat: dl.luat, catalog: dl.catalog, kenh: dl.kenh })`; map dòng `ra` gọi `engRa.phanLoaiRa(d.truong.tenHang, d.truong.mstMua, d.truong.tenMua)`. `canhBao` đếm thêm dòng `ra` có `!code`.
  `route.ts` `toXuat`: thêm 5 trường + `nguon: d.first_source_kind === 'nexia' ? 'nexia' : d.first_source_kind?.startsWith('hdtq') ? 'hdtq' : 'hdct'` (trường `first_source_kind` từ migration 10, Task 10 — cho tới khi có, tạm `'nexia'`).
- [ ] **Step 4: Bảng tab ra** (`page.tsx`): khi `direction === 'ra'` header `# · Số HĐ · Ngày · Người mua · Tên hàng · Thành tiền · Mã nội bộ (sửa) · Ghi chú · Mã khách · Nhóm · Kênh · Đại lý · Độ tin cậy · Căn cứ`; `DongSua huong="ra"` (ô mã chỉ catalog: truyền `ma.filter((m) => !m.gt.startsWith('cp.'))`); `TC_OPTS` cho `ra`: `cao / trung binh / can gan tay / trong`. Bỏ chữ "— lát 3" ở tab.
- [ ] **Step 5: Kiểm** tsc/test/eslint/build; bật 3000, upload lại T8 → tab ra 85 dòng có mã/mã khách/nhóm; tải Excel → tab `HĐ Đầu ra` cột `Mã hàng`/`Loại`/`Kênh` có giá trị. Gate `verifying-visual-changes`.
- [ ] **Step 6: Commit** `feat(ke-toan): tab đầu ra — engine ra khi upload, sửa tại ô, Excel điền cột template`; README (Route, Trạng thái, Điểm treo: `POU Filters` nhóm nào; `dim_channel.mst` rỗng). Mời CEO.

---

## LÁT 4 — HDCT/HDTQ từ cổng thuế gộp vào kỳ

### Task 9: Đo file HDCT thật → fixture → bộ đọc chung `docHoaDon`

**Điều kiện vào (CEO/kế toán):** 4 file T8 `0110530659_HDCTMuaVao…`, `…HDCTBanra…`, `…HDTQMuaVao…`, `…HDTQBanra…` (Downloads/Thang 8.2026 trên máy Mac — HANDOFF §"Nguồn") chép vào `data/ke-toan/Báo cáo tài chính/Báo cáo tài chính/HDCT/2026.08/` (gitignore). **Máy Windows này chưa có file nào** (đo 15/09).

**Files:**
- Create: `tools/scripts/ke_toan_do_header.py`, `apps/web/lib/ke-toan/__fixtures__/hdct-t8-vao.json`
- Modify: `apps/web/lib/ke-toan/doc-file/nexia.ts`, `nexia.test.ts`, `tools/scripts/ke_toan_sinh_golden.py`

**Interfaces (Produces):** `export async function docHoaDon(buf: ArrayBuffer | Uint8Array, opt: { huong: 'vao' | 'ra' }): Promise<TabNexia>` — file nhiều sheet: lấy sheet `laTab(name, huong)`; không có → sheet đầu tiên; ném lỗi nếu dòng 1 thiếu cả `số hóa đơn` lẫn `tên hàng` ("File không đúng khuôn hoá đơn: thiếu cột Số hóa đơn / Tên hàng ở dòng 1"). `docNexia` giữ nguyên (gọi `docTab` như cũ).

- [ ] **Step 1: Script đo header**
```python
"""In tên sheet + header dòng 1..3 của một file Excel — để đối chiếu cột HDCT/HDTQ với bộ đọc (timCot theo tên). Không in dữ liệu dòng."""
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
for ws in wb:
    print("==", ws.title, ws.max_row, "dòng x", ws.max_column, "cột")
    for r in ws.iter_rows(min_row=1, max_row=3, values_only=True):
        print([str(c)[:28] if c is not None else "" for c in r])
```
Chạy trên 4 file → dán kết quả (chỉ header) vào README mục "Bẫy đã gặp" 13: "Khuôn HDCT/HDTQ đo ngày …: cột …". Nếu tên cột khác NEXIA (vd `Tên người bán/Tên NCC`), bổ sung mảnh tìm vào `timCot(headers, …)` trong `docTab` — mảnh phải khớp **cả hai** khuôn.
- [ ] **Step 2: Fixture** — thêm vào `ke_toan_sinh_golden.py`: đọc `HDCT/2026.08/*HDCTMuaVao*.xlsx`, lấy 10 dòng đầu, che như `che()` + người mua/bán cá nhân → `NCC-n`, ghi `hdct-t8-vao.json` dạng `{ headers: string[], rows: (string|number|null)[][] }`. Quét PII trước khi commit.
- [ ] **Step 3: Test đỏ** (`nexia.test.ts`)
```ts
describe('docHoaDon — file HDCT/HDTQ một sheet, chọn hướng từ ngoài', () => {
  const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/hdct-t8-vao.json', import.meta.url)), 'utf8')) as { headers: string[]; rows: unknown[][] }
  it('sheet không tên "đầu vào" vẫn đọc theo huong; số HĐ + tên hàng + thành tiền ra đúng', async () => {
    const t = await docHoaDon(await wb({ Sheet1: [fx.headers, ...fx.rows] }), { huong: 'vao' })
    expect(t.ten).toBe('vao'); expect(t.dong).toHaveLength(fx.rows.length)
    expect(t.dong[0].truong.soHd).not.toBe(''); expect(typeof t.dong[0].truong.thanhTien).toBe('number')
  })
  it('file không có cột Số hóa đơn/Tên hàng → lỗi rõ', async () => {
    await expect(docHoaDon(await wb({ Sheet1: [['a', 'b'], [1, 2]] }), { huong: 'ra' })).rejects.toThrow(/không đúng khuôn/)
  })
})
```
- [ ] **Step 4: Implement** trong `nexia.ts`:
```ts
export async function docHoaDon(buf: ArrayBuffer | Uint8Array, opt: { huong: 'vao' | 'ra' }): Promise<TabNexia> {
  const wb = await moWorkbook(buf)
  const ws = wb.worksheets.find((w) => laTab(w.name, opt.huong)) ?? wb.worksheets[0]
  if (!ws) throw new Error('File không có sheet nào.')
  const t = docTab(ws, opt.huong)
  if (timCot(t.headers, 'số hóa đơn') < 0 && timCot(t.headers, 'tên hàng') < 0) throw new Error('File không đúng khuôn hoá đơn: thiếu cột Số hóa đơn / Tên hàng ở dòng 1.')
  return t
}
```
- [ ] **Step 5: Chạy** `npx vitest run lib/ke-toan/doc-file` → PASS. Commit `feat(ke-toan): docHoaDon đọc file HDCT/HDTQ một sheet + fixture T8`.

### Task 10: Migration 10 + gộp nguồn: `row_order` nối đuôi, `first_source_kind`, dòng HDCT nối cuối tô cam khi xuất

**Files:**
- Create: `supabase/migrations/20260923020000_ke_toan_10_dau_ra_hdct.sql`
- Modify: `tools/scripts/smoke_local.py`, `apps/web/app/ke-toan/actions.ts` (`uploadNexia` → `uploadNguon`), `apps/web/lib/ke-toan/xuat/excel-hoa-don.ts`, `excel-dien-goc.test.ts`, `apps/web/app/ke-toan/hoa-don/[ky]/xuat/route.ts`

**Interfaces:**
- `ke_toan_dong_list` trả thêm `first_source_kind text` (join `sources`).
- `ke_toan_dong_nhap` v3: nếu `sources.kind` của `p_source_id` ≠ `'nexia'` thì dòng **mới** nhận `row_order = max(row_order của kỳ+hướng) + thứ tự trong lô`; dòng đã có (trùng khoá) chỉ cập nhật `last_source_id`, `missing_in_last_upload=false`, **không** đổi `raw`/`row_order` (NEXIA là bản gốc kế toán dùng).
- `uploadNguon(_prev, form)`: form có `loai ∈ nexia|hdct_vao|hdct_ra|hdtq_vao|hdtq_ra`; `nexia` → `docNexia` (như cũ); còn lại → `docHoaDon(buf, { huong })`, `p_kind = loai`, `p_headers = { [huong]: headers }`.
- `DongXuat.nguon` (Task 8) dùng ở exporter: dòng không có trong file gốc **và** `nguon !== 'nexia'` → nối cuối, tô `FFE699` các cột gốc (khôi phục nhánh đã bỏ 15/09, nay có chủ đích); không có trong file gốc mà `nguon === 'nexia'` → vẫn ném lỗi lệch.

- [ ] **Step 1: Migration**
```sql
-- ke_toan_10_dau_ra_hdct — lát 3+4: dong_list kèm loại nguồn đầu; dong_nhap v3 nối đuôi row_order cho nguồn ≠ nexia và không ghi đè raw của dòng NEXIA.
-- Cách lùi nếu hỏng: chạy lại thân ke_toan_dong_nhap của migration 07 và ke_toan_dong_list của migration 02.
create or replace function public.ke_toan_dong_list(p_email text, p_period_id bigint, p_direction text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg((to_jsonb(l) || jsonb_build_object('first_source_kind', s.kind)) order by l.row_order), '[]'::jsonb)
  from accounting.invoice_lines l left join accounting.sources s on s.id = l.first_source_id
  where accounting.nv(p_email) is not null and l.period_id = p_period_id and l.direction = p_direction;
$$;

create or replace function public.ke_toan_dong_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0; v_tong int; v_kind text; v_max int;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  v_tong := jsonb_array_length(p_rows);
  select kind into v_kind from accounting.sources where id = p_source_id;
  create temp table tmp_dong on commit drop as
    select * from jsonb_populate_recordset(null::accounting.invoice_lines,
      (select coalesce(jsonb_agg((e - 'period_id' - 'first_source_id' - 'last_source_id')
         || jsonb_build_object('period_id', p_period_id, 'first_source_id', p_source_id, 'last_source_id', p_source_id)), '[]'::jsonb)
       from jsonb_array_elements(p_rows) e));
  delete from tmp_dong a using tmp_dong b where a.line_key = b.line_key and a.row_order > b.row_order;

  if v_kind = 'nexia' then
    with up as (update accounting.invoice_lines l set raw = t.raw, row_order = t.row_order, last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t where l.period_id = p_period_id and l.line_key = t.line_key returning l.id)
    select count(*) into v_upd from up;
  else
    -- Nguồn bổ sung (HDCT/HDTQ): dòng đã có giữ nguyên raw/thứ tự của NEXIA; dòng mới xếp sau cùng theo hướng.
    with up as (update accounting.invoice_lines l set last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t where l.period_id = p_period_id and l.line_key = t.line_key returning l.id)
    select count(*) into v_upd from up;
    select coalesce(max(l.row_order), 0) into v_max from accounting.invoice_lines l
      where l.period_id = p_period_id and l.direction = (select direction from tmp_dong limit 1);
    update tmp_dong t set row_order = v_max + r.rn
      from (select line_key, row_number() over (order by row_order) rn from tmp_dong
            where not exists (select 1 from accounting.invoice_lines l where l.period_id = p_period_id and l.line_key = tmp_dong.line_key)) r
     where t.line_key = r.line_key;
  end if;

  with ins as (
    insert into accounting.invoice_lines (period_id, direction, line_key, row_order, ky_hieu, so_hd, ngay_lap, mccqt,
      ten_ban, mst_ban, ten_mua, mst_mua, ten_hang, dvt, so_luong, don_gia, thue_suat, thanh_tien, tien_thue, tong_thanh_toan,
      trang_thai, tinh_chat, raw, first_source_id, last_source_id,
      engine_code, engine_conf, engine_reason, engine_kind, code, code_name, tk_no, tk_co, vat_1331,
      customer_code, product_group, channel_l1, channel_l2, dealer_name)
    select p_period_id, direction, line_key, row_order, ky_hieu, so_hd, ngay_lap, mccqt,
      ten_ban, mst_ban, ten_mua, mst_mua, ten_hang, dvt, so_luong, don_gia, thue_suat, thanh_tien, tien_thue, tong_thanh_toan,
      trang_thai, tinh_chat, raw, p_source_id, p_source_id,
      engine_code, engine_conf, engine_reason, engine_kind, code, code_name, tk_no, tk_co, vat_1331,
      customer_code, product_group, channel_l1, channel_l2, dealer_name
    from tmp_dong t
    where not exists (select 1 from accounting.invoice_lines l where l.period_id = p_period_id and l.line_key = t.line_key)
    on conflict (period_id, line_key) do nothing returning id)
  select count(*) into v_ins from ins;
  return jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'kept', v_tong - v_ins - v_upd);
end $$;
-- Quyền: chữ ký không đổi → grant cũ còn hiệu lực; vẫn revoke/grant lại cho chắc.
do $$ begin
  execute 'revoke all on function public.ke_toan_dong_list(text,bigint,text) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_dong_list(text,bigint,text) to service_role';
  execute 'revoke all on function public.ke_toan_dong_nhap(text,bigint,bigint,jsonb) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_dong_nhap(text,bigint,bigint,jsonb) to service_role';
end $$;
```
Kiểm `sources.kind` có check constraint gồm `hdct_vao|hdct_ra|hdtq_vao|hdtq_ra` (migration 00 dòng 31–44); thiếu → thêm `alter table accounting.sources drop constraint …; add constraint … check (kind in (…))` vào migration này.
- [ ] **Step 2: Smoke** (sau khối lát 2): tạo nguồn `hdct_vao` → `ke_toan_dong_nhap` 2 dòng: 1 trùng khoá `smoke-k1` + 1 mới `smoke-k9` → `{"inserted":1,"updated":1,"kept":0}`; `ke_toan_dong_list` → dòng `smoke-k9` có `row_order` > mọi dòng cũ và `first_source_kind == "hdct_vao"`; dòng `smoke-k1` giữ `raw == ["x"]`.
- [ ] **Step 3: CI → áp → ledger** như Task 1 Step 3–4 (tên `ke_toan_10_dau_ra_hdct`, version `20260923020000`).
- [ ] **Step 4: Test đỏ exporter** (`excel-dien-goc.test.ts`): sửa test "dòng DB không có trong file gốc → từ chối" thành hai:
```ts
it('dòng nguồn NEXIA không có trong file gốc → từ chối xuất', async () => {
  await expect(dienExcelHoaDon({ goc: await fileGoc(), vao: [...vao, dong(4, '555', { raw: [1, 'C26', '555', 'Combo'], nguon: 'nexia' })], ra: [] })).rejects.toThrow(/không có trong file gốc/)
})
it('dòng nguồn HDCT không có trong file gốc → nối cuối, tô FFE699 cột gốc, có cột đề xuất + viền', async () => {
  const wb = await doc(await dienExcelHoaDon({ goc: await fileGoc(), vao: [...vao, dong(4, '555', { raw: [1, 'C26', '555', 'Combo', null, null, null], nguon: 'hdct' })], ra: [] }))
  const ws = wb.getWorksheet('HĐ đầu vào')!
  expect(ws.rowCount).toBe(6); expect(ws.getCell(6, 3).value).toBe('555'); expect(fill(ws.getCell(6, 1))).toBe('FFFFE699'); expect(ws.getCell(6, 8).value).toBe('cp.qc'); expect(ws.getCell(6, 1).border?.left?.style).toBe('thin')
})
```
- [ ] **Step 5: Implement exporter** — trong `dienTab`: `const HDCT = FILL('FFFFE699')` (khôi phục), `let cuoi = ws.rowCount`; nhánh `r == null`: nếu `d.nguon === 'nexia'` → `throw lech(...)`; ngược lại `row = ws.getRow(++cuoi); for c in 1..nGoc: row.getCell(c).value = d.raw[c-1] ?? null; datFill(row.getCell(c), HDCT)`; kẻ viền cho dòng nối thêm (mở rộng vòng `keVien` lấy cả `cuoi`). `coCotTheoNoiDung` chạy sau nên tự tính cả dòng mới.
- [ ] **Step 6: actions** — đổi `uploadNexia` thành `uploadNguon` (giữ tên export cũ làm alias 1 dòng `export const uploadNexia = uploadNguon` để `FormUpload` không đổi ngay), đọc `loai`, gọi `docNexia`/`docHoaDon`, `p_kind: loai`. Engine chạy như cũ cho dòng mới (dòng trùng khoá không đổi mã).
- [ ] **Step 7: Kiểm** tsc/test/eslint/build; commit `feat(ke-toan): gộp HDCT/HDTQ — dong_nhap v3 nối đuôi, first_source_kind, xuất nối cuối tô cam`.

### Task 11: UI nguồn — chọn loại khi upload, lọc/tô dòng bổ sung, README, mời CEO

**Files:**
- Modify: `apps/web/app/ke-toan/hoa-don/[ky]/FormUpload.tsx`, `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx`, `apps/web/app/ke-toan/actions.ts` (`DongRow` thêm `first_source_kind: string | null`), `docs/ke-toan/README.md`

- [ ] **Step 1: `FormUpload`** — khi có `ky` (màn kỳ) thêm `<select name="loai">` 5 lựa chọn: `nexia` "NEXIA (kế toán gửi)", `hdct_vao` "HDCT mua vào (cổng thuế)", `hdct_ra` "HDCT bán ra", `hdtq_vao` "HDTQ mua vào", `hdtq_ra` "HDTQ bán ra"; màn danh sách (`macDinh`) chỉ `nexia` (hidden). Nhãn nút theo loại: "Chọn file … & gộp vào kỳ".
- [ ] **Step 2: Bảng** — `BoLocChon param="nguon" nhan="Nguồn" tuyChon=[{giaTri:'nexia',nhan:'NEXIA'},{giaTri:'hdct',nhan:'HDCT'},{giaTri:'hdtq',nhan:'HDTQ'}]`; lọc `rows` theo `first_source_kind` (`hdct_*` → `hdct`); dòng `first_source_kind !== 'nexia'` thêm class `bg-amber-200/60` (cùng ý màu `FFE699` Excel) và ưu tiên thấp hơn `MAU_TC` cảnh báo; cột "Nguồn" nhỏ sau `#`. Thông báo upload: "Thêm N · cập nhật M · giữ K" đã đủ.
- [ ] **Step 3: Kiểm** tsc/test/eslint/build → bật 3000 → upload `HDCTMuaVao` T8 vào kỳ 08 → kỳ vọng ≈ +250 dòng (spec §1) tô cam, dòng trùng khoá không tăng; tải Excel → dòng bổ sung nối cuối tô cam; upload lại NEXIA T8 → 0 thêm, dòng HDCT không bị đánh `missing` (khác kind). Gate `verifying-visual-changes` + `reviewing-finished-ui`.
- [ ] **Step 4: README** — Route (loại nguồn), Quy trình tháng bước 3, Bẫy 13 (khuôn HDCT đo được), Trạng thái; Việc treo: "HDTQ (hoá đơn không mã) chưa gộp" xoá nếu đã thử. Commit `docs(ke-toan): lát 4 — HDCT/HDTQ` ; mời CEO; merge `main` sau khi gật.

---

## Sau plan này (plan riêng, không nằm ở đây)

| Lát | Điều kiện vào | Ghi chú |
|---|---|---|
| 5 sao kê | CEO trả lời: TCB Business xuất được Excel/CSV không? | Có file VCB21/63 `.xls` (BIFF, bảng từ dòng 14) và TCB `.pdf` T7–T8 trong `data/ke-toan/…/Sao kê các tài khoản NH/` |
| 6 Google | CEO tạo service account + share Sheet/Drive | `google/` là nơi duy nhất gọi Google; env `GOOGLE_SERVICE_ACCOUNT_KEY` |
| 7 màn luật | Lát 2 xong (RPC `ke_toan_luat_them`, `luat_list`) | thêm `ke_toan_luat_sua(active/target)`; UI danh sách + lọc origin |

## Self-review (đã chạy 15/09)

- Spec §2 #6 học từ app → Task 1/2/5; #9 luật sửa trên app → Task 3/4 (Đặt thành luật) + lát 7; #10 không tự động thành luật → chỉ `corrections`, nút riêng; #11 kỳ mở bằng NEXIA, HDCT vào sau → Task 10 (nguồn ≠ nexia không ghi đè raw/row_order); #12 xuất hỏi xác nhận không chặn → `NutGuiKeToan` confirm; #13 sửa sau gửi → `edits_after_sent`; #15 cột Loại/Kênh/Đại lý → Task 7/8. §8 màu `FFE699` dòng HDCT → Task 10; `DDEBF7`/`FFF2CC` đã có. §7 route `/ke-toan/hoa-don/[ky]` "upload nguồn (loại chọn), Đã gửi kế toán, menu dòng" → Task 4/11. Chưa phủ: "lưu vào Drive", "Cập nhật Sheet" (lát 6), `/ke-toan/luat` (lát 7), `customer_aliases` (bỏ — `kh_map` đo được là MST→MST + KHL/KHSP, không cần bảng PII).
- Placeholder: không còn "TBD"; Task 9 phụ thuộc file thật — bước đo header là bước cụ thể, không phải placeholder.
- Type: `KetQuaDauRa.conf` dùng bộ giá trị của `GoiYMa` (`'cao'|'trung binh'|'can gan tay'|'trong'`) — khác `DoTinCay` của đầu vào; `TC_OPTS` tab ra (Task 8 Step 4) dùng đúng bộ này. `DongXuat.nguon` định nghĩa ở Task 8, dùng ở Task 10. `ThongKeHoc` khoá `ncc`/`prefix` khớp JSON RPC Task 1.
