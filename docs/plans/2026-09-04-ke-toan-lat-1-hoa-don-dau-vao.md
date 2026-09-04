# Kế toán — Lát 1: upload NEXIA → phân loại HĐ đầu vào → tải Excel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người có vai trò kế toán upload file NEXIA tháng, thấy mã KMCP / TK Nợ / TK Có / Nợ 1331 cho từng dòng HĐ đầu vào trên app, tải về file `_DAXULY.xlsx` đúng bố cục kế toán đang nhận, với engine TypeScript khớp engine Python trên dữ liệu T8.

**Architecture:** Schema `accounting` (RLS bật, 0 policy, **không expose**) truy cập qua RPC `public.ke_toan_*` security definer — đúng khuôn khu Việc. Engine là hàm thuần ở `apps/web/lib/ke-toan/`, nhận luật + catalog + KMCP làm tham số, test bằng fixture sinh từ tool Python cũ. Server Action nối module với DB sau cổng `chanKeToan()`; xuất Excel qua route handler dùng `exceljs`.

**Tech Stack:** Next.js 16.2 (App Router, Server Actions với FormData), Supabase (Postgres 17, Storage, RPC), `xlsx` 0.18 (đọc), `exceljs` (ghi có màu), Vitest 4, Python 3.12 + openpyxl (chỉ để sinh fixture/golden từ tool cũ), GitHub Actions + Supabase CLI (CI `db-reset`).

**Spec:** `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` — plan này thực hiện §5 (bảng `periods`, `sources`, `invoice_lines`, `rules`, `corrections`, `settings`), §6 (`doc-file/nexia`, `chuan-hoa`, `engine/dau-vao`, `xuat/excel-hoa-don`), §7 (`/ke-toan`, `/ke-toan/hoa-don/[ky]` chỉ xem), §9, §10, §11 lát 1. **Sửa spec** (Task 0): §5 đổi "phải expose" → "không expose, qua RPC" vì repo đã có khuôn Work và prod chỉ expose `public`.

## Global Constraints

- Nhánh `feat/ke-toan-hoa-don` (đã tạo từ `main` tại `f2feccc`). Cổng dev **3501**. Commit author `ai@gwt.vn`.
- **Không PII vào git**: không commit file dưới `data/`; fixture chỉ chứa tên công ty, tên hàng, số tiền; không MST, không địa chỉ, không tên cá nhân. Hook `.githooks/pre-commit` chặn SĐT VN — nếu fixture có số 10 chữ số bắt đầu 03/05/07/08/09 thì thay bằng `0900000xxx` trong script che.
- Migration: chỉ thêm file vào `supabase/migrations/`, tên `2026MMDDhhmmss_ke_toan_NN_<mo_ta>.sql` (số hiệu = giờ **UTC** lúc tạo). Migration đã áp live = bất biến. Áp live **chỉ sau khi CI `db-reset` xanh trên đúng commit**, qua MCP `apply_migration` tên khớp file, rồi SELECT ledger sửa `version` nếu lệch.
- Bảng mới: `enable row level security`, **0 policy**, không grant cho `anon`/`authenticated`. Schema `accounting` **không** thêm vào `[api] schemas`.
- RPC: `public.ke_toan_<viec>(p_email text, ...)`, `security definer set search_path = ''`, `revoke all ... from public, anon, authenticated`, `grant execute ... to service_role`. Mọi RPC gọi `accounting.nv(p_email)` để gác vai trò.
- Vai trò vào khu: `['admin','ke_toan','tai_chinh','ceo']`.
- Mọi Server Action chạm DB gọi `chanKeToan()` trước (test guard bắt buộc).
- Filter/ô chọn theo `docs/CHUAN-FILTER.md`: dùng `@/bang`, bọc `<Suspense>` quanh component đọc `useSearchParams`, không `toISOString()`.
- Trước khi mời CEO: `npx tsc --noEmit` + `npm test` + `npm run build` xanh trong `apps/web`; server local cổng 3501 trỏ Supabase local; `npm run lint` được phép còn 7 lỗi cũ (ngoài phạm vi) nhưng **không thêm lỗi mới** (so bằng `npm run lint 2>&1 | grep -c error`).
- Tên hàm/biến trong app tiếng Việt không dấu theo quy ước repo (`danhSachKy`, `chanKeToan`); tên bảng/cột SQL tiếng Anh snake_case.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `.github/workflows/db-reset.yml` | Gate dựng DB từ 0 (chép khuôn Masterdata, bỏ Python auth) |
| `tools/scripts/smoke_local.py` | Smoke sau `db reset`: RPC kế toán gọi được, schema không expose, bucket, 24 KMCP, luật đã seed |
| `supabase/migrations/20260904040000_ke_toan_00_init.sql` | Schema `accounting` + 6 bảng + trigger updated_at + bucket + `public.expense_category` gương + mở rộng `sync_catalog`/`replace_catalog_table` |
| `supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql` | **Sinh bằng script** — insert `accounting.rules` từ Excel Rule + `overrides.json` + `name2code.json` |
| `supabase/migrations/20260904040200_ke_toan_02_rpc.sql` | `accounting.nv()`, `ke_toan_ky_list/ky_tao/nguon_them/dong_nhap/dong_list/luat_list` |
| `tools/scripts/ke_toan_sinh_luat_sql.py` | Đọc `data/ke-toan/...` → in SQL seed luật (chạy tay 1 lần, output commit) |
| `tools/scripts/ke_toan_sinh_golden.py` | Chạy engine Python trên T8 → fixture JSON đã che cho test parity |
| `apps/web/lib/ke-toan/__fixtures__/t8-dau-vao.json` | 415 dòng: input + kỳ vọng Python (nguon, kmcp, tkno, tkco, vat, kind) |
| `apps/web/lib/ke-toan/__fixtures__/chuan-hoa-cases.json` | Cặp input→output của `norm`/`sd`/`hard` tính bằng Python |
| `apps/web/lib/ke-toan/chuan-hoa.ts` (+ `.test.ts`) | `norm`, `sd`, `hard`, `boNgoac`, `khoaDong` |
| `apps/web/lib/ke-toan/doc-file/nexia.ts` (+ `.test.ts`) | Buffer xlsx → `{ tabs }` header theo vị trí + dòng thô + trường nghiệp vụ |
| `apps/web/lib/ke-toan/engine/kieu.ts` | Types `Luat`, `MucCatalog`, `MucKmcp`, `ThongKeHoc`, `KetQuaDauVao` |
| `apps/web/lib/ke-toan/engine/dau-vao.ts` (+ `.test.ts`) | `taoEngineDauVao()` — port 4 tầng + nhận diện hàng hoá |
| `apps/web/lib/ke-toan/xuat/excel-hoa-don.ts` (+ `.test.ts`) | Dựng workbook `_DAXULY.xlsx` bằng exceljs |
| `apps/web/lib/nen-tang/gac-cong.ts` | thêm `coTheVaoKeToan()` |
| `apps/web/app/ke-toan/actions.ts` | `chanKeToan`, `goi`, `danhSachKy`, `taoKy`, `uploadNexia`, `dongCuaKy` |
| `apps/web/lib/ke-toan-guard.test.ts` | Lưới: mọi hàm chạm DB trong actions gọi `chanKeToan` |
| `apps/web/app/ke-toan/page.tsx` | Danh sách kỳ + form tạo kỳ |
| `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx` | Màn kỳ: upload + bảng đầu vào chỉ xem + nút tải Excel |
| `apps/web/app/ke-toan/hoa-don/[ky]/FormUpload.tsx` | Client: chọn file, gọi action, báo kết quả |
| `apps/web/app/ke-toan/hoa-don/[ky]/xuat/route.ts` | GET → xlsx (Content-Disposition) |
| `apps/web/components/TopNav.tsx`, `TopNavClient.tsx` | Bật ô Kế toán, thêm module |
| `apps/web/next.config.ts` | `serverActions.bodySizeLimit: '8mb'` |
| `supabase/seed.sql` | thêm `dev.ketoan@gwt.vn` vai `ke_toan` |
| `docs/ke-toan/README.md`, `HANDOFF.md`, `CLAUDE.md`, spec | Tài liệu |

---

### Task 0: Sửa spec + cài dependency + cấu hình body limit

**Files:**
- Modify: `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` (§5 đoạn "Schema **phải expose**…")
- Modify: `apps/web/package.json` (thêm `exceljs`)
- Modify: `apps/web/next.config.ts`

**Interfaces:**
- Produces: `exceljs` sẵn trong `node_modules`; Server Action nhận file tới 8 MB.

- [ ] **Step 1: Sửa spec §5**

Thay đoạn bắt đầu bằng "`service_role`; `authenticated`/`anon` không đọc, **không cấp `usage` cho `anon`**. Schema **phải expose**…" cho tới "…RLS 0 policy vẫn chặn anon/authenticated dù schema đã expose." bằng:

```markdown
`service_role`; `authenticated`/`anon` không đọc, **không cấp `usage` cho `anon`**. Schema `accounting`
**KHÔNG expose** qua PostgREST (prod chỉ expose `public`; `supabase/config.toml` giữ nguyên). App truy
cập qua RPC `public.ke_toan_*(p_email text, …)` `security definer set search_path = ''`, revoke khỏi
`public/anon/authenticated`, grant `service_role` — đúng khuôn khu Việc (`public.work_*`). Mỗi RPC gọi
`accounting.nv(p_email)` để lấy `staff.id` và chặn vai trò ngoài `admin|ke_toan|tai_chinh|ceo`.
(Đổi 04/09 sau khảo sát repo: khu Việc đã đi đường này, không cần Config Dashboard.)
```

- [ ] **Step 2: Cài exceljs**

Run: `cd apps/web && npm install exceljs@^4.4.0 && npm install --save-dev @types/node@^20`
Expected: `package.json` có `"exceljs": "^4.4.0"` trong `dependencies`; `package-lock.json` đổi.

- [ ] **Step 3: Nâng body limit cho Server Action**

Trong `apps/web/next.config.ts`, thêm vào object `nextConfig` (sau `allowedDevOrigins`):

```ts
  // Khu Kế toán upload file Excel hoá đơn qua Server Action (FormData). Mặc định 1 MB;
  // file NEXIA tháng lớn nhất đo được 670 KB, HDCT có thể hơn → nâng lên 8 MB.
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
```

- [ ] **Step 4: Kiểm build config**

Run: `cd apps/web && npx tsc --noEmit`
Expected: không lỗi mới (lỗi cũ nếu có phải giống hệt trước khi sửa — so với `git stash` nếu nghi).

- [ ] **Step 5: Commit**

```bash
git add docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md apps/web/package.json apps/web/package-lock.json apps/web/next.config.ts
git commit -m "chore(ke-toan): spec đi đường RPC như khu Việc · cài exceljs · body limit 8mb cho upload"
```

---

### Task 1: CI `db-reset` cho repo + smoke script nền

**Files:**
- Create: `.github/workflows/db-reset.yml`
- Create: `tools/scripts/smoke_local.py`

**Interfaces:**
- Produces: workflow chạy khi push đụng `supabase/**`; `smoke_local.py` in `ALL OK`/exit 1. Task 8 thêm phép thử kế toán vào file này.

- [ ] **Step 1: Viết workflow**

```yaml
# Gate "dựng-từ-0" của gwt-app (bước 2 workflow DDL — rules/supabase-mcp.md). Chép khuôn
# GWT-Masterdata/.github/workflows/db-reset.yml. Runner ubuntu có Docker: replay toàn bộ
# supabase/migrations/ + seed.sql, rồi smoke chức năng. Xanh trên commit chứa migration = được áp live.
name: db-reset

on:
  push:
    paths:
      - "supabase/**"
      - "tools/scripts/smoke_local.py"
      - ".github/workflows/db-reset.yml"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: db-reset-${{ github.ref }}
  cancel-in-progress: true

jobs:
  db-reset:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - name: Supabase start (chỉ dịch vụ smoke cần)
        run: npx supabase@2 start -x studio,postgres-meta,imgproxy,mailpit,edge-runtime,logflare,vector,realtime,supavisor
      - name: db reset — replay từ 0 toàn bộ migration + seed
        run: npx supabase@2 db reset
      - name: Smoke test chức năng (phải ALL OK)
        run: |
          pip install --quiet requests
          python tools/scripts/smoke_local.py
      - name: Log khi đỏ
        if: failure()
        run: |
          npx supabase@2 status || true
          docker ps -a
          for c in db rest auth storage kong; do
            echo "===== supabase_${c}_gwt-platform"
            docker logs "supabase_${c}_gwt-platform" --tail 150 2>&1 || true
          done
      - name: Stop
        if: always()
        run: npx supabase@2 stop --no-backup || true
```

- [ ] **Step 2: Viết smoke nền (chưa có phép thử kế toán)**

```python
"""Smoke test DB LOCAL sau `npx supabase db reset` cho gwt-app. Chạy local hoặc trên CI db-reset.
Đọc key từ `npx supabase status -o json`. Phải in "ALL OK" (exit 1 khi lỗi → CI đỏ).
Khu mới thêm phép thử vào cuối file, KHÔNG sửa phép thử của khu khác.
"""
import json, subprocess, sys
import requests

sys.stdout.reconfigure(encoding="utf-8")
U = "http://127.0.0.1:54321"
raw = subprocess.run("npx supabase@2 status -o json", capture_output=True, text=True, shell=True).stdout
st = json.loads("\n".join(l for l in raw.splitlines() if l.strip().startswith(("{", "}", '"'))))
ANON, SVC = st["ANON_KEY"], st["SERVICE_ROLE_KEY"]
ok = True


def chk(name, cond, extra=""):
    global ok
    ok &= bool(cond)
    print(("✓" if cond else "✗"), name, extra)


def h(key, **more):
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", **more}


# --- Nền tảng: seed staff, RLS ---
r = requests.get(f"{U}/rest/v1/staff?select=email&email=eq.dev.admin@gwt.vn", headers=h(SVC))
chk("service_role: staff có dev.admin", r.status_code == 200 and len(r.json()) == 1, r.status_code)
r = requests.get(f"{U}/rest/v1/staff?select=email", headers=h(ANON))
chk("anon: staff bị chặn", r.status_code in (401, 403) or r.json() == [], r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/work_viec_cua_toi", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("service_role: rpc work_viec_cua_toi", r.status_code == 200, (r.status_code, r.text[:80]))

# --- Khu Kế toán: thêm ở Task 8 ---

print("\nALL OK" if ok else "\nCÓ LỖI")
sys.exit(0 if ok else 1)
```

- [ ] **Step 3: Commit, push, xem CI**

```bash
git add .github/workflows/db-reset.yml tools/scripts/smoke_local.py
git commit -m "ci(db-reset): gate dựng DB từ 0 + smoke nền cho gwt-app (khuôn Masterdata)"
git push -u origin feat/ke-toan-hoa-don
gh run list -w db-reset -b feat/ke-toan-hoa-don --limit 1
gh run watch $(gh run list -w db-reset -b feat/ke-toan-hoa-don --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: ✓ xanh. **Nếu đỏ ở bước `db reset` vì migration CŨ** (baseline/extension, không phải file mới): dừng task, ghi log lỗi vào phiên và báo CEO — sửa migration cũ là quyết định ngoài phạm vi lát 1. Nếu đỏ ở smoke vì key/status parsing: sửa `smoke_local.py` và push lại.

---

### Task 2: Migration 00 — schema `accounting`, bucket, gương `expense_category`

**Files:**
- Create: `supabase/migrations/20260904040000_ke_toan_00_init.sql`
- Modify: `supabase/seed.sql` (thêm staff `dev.ketoan@gwt.vn`)

**Interfaces:**
- Produces: bảng `accounting.periods`, `.sources`, `.invoice_lines`, `.rules`, `.corrections`, `.settings`; `public.expense_category(ma, ten, dien_giai, tk_no_default, trang_thai, updated_at)`; bucket `accounting`; `public.sync_catalog()` gương thêm `expense_category`.

- [ ] **Step 1: Viết migration**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- ke_toan_00_init — Khu Kế toán, lát 1 (spec docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md §5)
-- Cách lùi nếu hỏng: drop schema accounting cascade; drop table public.expense_category;
--   delete from storage.buckets where id='accounting'; tạo lại sync_catalog/replace_catalog_table
--   theo db/cs/migrations/31_fix_replace_catalog_delete_where.sql (whitelist 6 bảng).
-- Nguyên tắc: RLS bật hết, 0 policy — app chỉ đi qua RPC public.ke_toan_* (security definer).
--   FK cứng CHỈ vào public.staff(id); mọi tham chiếu khác là soft ref (text).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists accounting;
comment on schema accounting is 'GWT Kế toán — hoá đơn NEXIA/HDCT, sao kê, luật phân loại. Không expose; truy cập qua RPC public.ke_toan_*.';

-- ── Kỳ tháng ──────────────────────────────────────────────────────────────
create table accounting.periods (
  id                bigint generated always as identity primary key,
  ky                text not null unique check (ky ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  status            text not null default 'dang_xu_ly' check (status in ('dang_xu_ly','da_gui')),
  sent_at           timestamptz,
  sent_by           uuid references public.staff(id),
  edits_after_sent  integer not null default 0,
  created_by        uuid references public.staff(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── File đã upload vào kỳ ────────────────────────────────────────────────
create table accounting.sources (
  id            bigint generated always as identity primary key,
  period_id     bigint not null references accounting.periods(id) on delete cascade,
  kind          text not null check (kind in ('nexia','hdct_vao','hdct_ra','hdtq_vao','hdtq_ra','bank_vcb21','bank_vcb63','bank_tcb')),
  file_name     text not null,
  storage_path  text not null,
  headers       jsonb not null default '{}'::jsonb,   -- {"vao": ["Mẫu số HD", ...], "ra": [...]} theo VỊ TRÍ, kể cả header trùng/rỗng
  row_count     integer not null default 0,
  uploaded_by   uuid references public.staff(id),
  uploaded_at   timestamptz not null default now()
);
create index sources_period_idx on accounting.sources(period_id);

-- ── Dòng hàng hoá đơn ────────────────────────────────────────────────────
create table accounting.invoice_lines (
  id                bigint generated always as identity primary key,
  period_id         bigint not null references accounting.periods(id) on delete cascade,
  direction         text not null check (direction in ('vao','ra')),
  line_key          text not null,          -- sha1(direction|ky_hieu|so_hd|sd(ten_hang)|round(thanh_tien))
  row_order         integer not null,       -- thứ tự trong file nguồn đầu tiên (để xuất lại đúng thứ tự)
  -- 20 cột nghiệp vụ tách riêng để lọc/tìm
  ky_hieu           text, so_hd text, ngay_lap date, mccqt text,
  ten_ban           text, mst_ban text, ten_mua text, mst_mua text,
  ten_hang          text, dvt text, so_luong numeric, don_gia numeric, thue_suat text,
  thanh_tien        numeric, tien_thue numeric, tong_thanh_toan numeric,
  trang_thai        text, tinh_chat text,
  raw               jsonb not null,         -- mảng ô thô theo VỊ TRÍ header của sources.headers
  first_source_id   bigint references accounting.sources(id),
  last_source_id    bigint references accounting.sources(id),
  missing_in_last_upload boolean not null default false,
  -- kết quả engine (không đổi khi người sửa)
  engine_code       text, engine_conf text, engine_reason text, engine_kind text,
  -- giá trị chốt (engine điền lần đầu; người sửa ghi đè)
  code              text, code_name text, tk_no text, tk_co text, vat_1331 text,
  customer_code     text, product_group text, channel_l1 text, channel_l2 text, dealer_name text,
  note_for_accountant text,
  edited_by         uuid references public.staff(id),
  edited_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (period_id, line_key)
);
create index invoice_lines_period_dir_idx on accounting.invoice_lines(period_id, direction, row_order);

-- ── Luật phân loại ────────────────────────────────────────────────────────
create table accounting.rules (
  id           bigint generated always as identity primary key,
  kind         text not null check (kind in ('supplier','keyword','product_name')),
  pattern      text not null,               -- đã chuẩn hoá: supplier/keyword dùng norm() (đ→d), product_name dùng sd() (giữ đ)
  target_code  text not null,
  condition    text,                        -- "Điều kiện tách mã" / "Ngoại lệ" — có → độ tin cậy giảm
  priority     integer not null default 0,  -- thứ tự duyệt trong cùng kind+origin (giữ thứ tự Python)
  origin       text not null check (origin in ('rule_excel','override_json','history','app')),
  created_by   uuid references public.staff(id),
  created_at   timestamptz not null default now(),
  active       boolean not null default true
);
create index rules_kind_active_idx on accounting.rules(kind, active, origin, priority);

-- ── Lịch sử sửa tay (engine học từ đây ở lát 2) ──────────────────────────
create table accounting.corrections (
  id           bigint generated always as identity primary key,
  line_id      bigint not null references accounting.invoice_lines(id) on delete cascade,
  field        text not null,
  old_value    text, new_value text,
  seller_norm  text, desc_norm text,
  "by"         uuid references public.staff(id),
  at           timestamptz not null default now()
);
create index corrections_seller_idx on accounting.corrections(seller_norm);

-- ── Cấu hình khu ──────────────────────────────────────────────────────────
create table accounting.settings (
  key         text primary key,
  value       text,
  updated_by  uuid references public.staff(id),
  updated_at  timestamptz not null default now()
);

-- ── updated_at (tái dùng public.set_updated_at có sẵn trong baseline) ───
create trigger tg_periods_updated_at before update on accounting.periods
  for each row execute function public.set_updated_at();
create trigger tg_invoice_lines_updated_at before update on accounting.invoice_lines
  for each row execute function public.set_updated_at();

-- ── RLS: bật hết, 0 policy; không grant anon/authenticated ───────────────
do $$
declare t text;
begin
  foreach t in array array['periods','sources','invoice_lines','rules','corrections','settings'] loop
    execute format('alter table accounting.%I enable row level security;', t);
  end loop;
end $$;
grant usage on schema accounting to service_role;
grant all on all tables in schema accounting to service_role;
grant all on all sequences in schema accounting to service_role;
alter default privileges for role postgres in schema accounting grant all on tables to service_role;
alter default privileges for role postgres in schema accounting grant all on sequences to service_role;

-- ── Storage bucket riêng tư cho file gốc upload ──────────────────────────
insert into storage.buckets (id, name, public)
values ('accounting', 'accounting', false)
on conflict (id) do nothing;

-- ── Gương expense_category từ Masterdata (24 mã KMCP) ────────────────────
create table if not exists public.expense_category (
  ma             text primary key,
  ten            text,
  dien_giai      text,
  tk_no_default  text,
  trang_thai     text,
  updated_at     timestamptz
);
alter table public.expense_category enable row level security;   -- 0 policy: chỉ service_role
grant select on public.expense_category to service_role;
comment on table public.expense_category is 'GƯƠNG từ GWT-Masterdata (sync_catalog hằng ngày). Không sửa tay ở đây.';

-- Seed 24 mã để local/CI có dữ liệu (live sẽ được sync_catalog ghi đè bằng nguồn thật)
insert into public.expense_category (ma, ten, tk_no_default, trang_thai) values
  ('DVVC','CP vận chuyển','6417','Đang sử dụng'),
  ('cp.642khac','CP khác','6427','Đang sử dụng'),
  ('cp.bank','Chi Phí ngân hàng','6427','Đang sử dụng'),
  ('cp.bhxh','CP bảo hiểm','6421','Đang sử dụng'),
  ('cp.ccdc','CP công cụ dụng cụ','6423','Đang sử dụng'),
  ('cp.congdoan','CP công đoàn','6421','Đang sử dụng'),
  ('cp.congtac','CP công tác','6427','Đang sử dụng'),
  ('cp.dichuyen','CP di chuyển','6427','Đang sử dụng'),
  ('cp.dvkt','CP dịch vụ kế toán','6427','Đang sử dụng'),
  ('cp.freelance','CP thuê ngoài','6427','Đang sử dụng'),
  ('cp.hoahong','CP hoa hồng','6427','Đang sử dụng'),
  ('cp.kiemdinh','CP kiểm định','6427','Đang sử dụng'),
  ('cp.kol','CP KOL','','Đang sử dụng'),
  ('cp.luong','CP lương','6421','Đang sử dụng'),
  ('cp.phucloi','CP phúc lợi','6427','Đang sử dụng'),
  ('cp.qc','CP quảng cáo','6427','Đang sử dụng'),
  ('cp.quatangbh','CP thưởng','','Đang sử dụng'),
  ('cp.shopeemall','CP shoppee','6417','Đang sử dụng'),
  ('cp.tangbh','CP quà tặng bán hàng','6427','Đang sử dụng'),
  ('cp.thuekho','CP thuê kho','6427','Đang sử dụng'),
  ('cp.tiepkhach','CP tiếp khách','6427','Đang sử dụng'),
  ('cp.ttqt','CP thanh toán quốc tế','6417','Đang sử dụng'),
  ('cp.vanhanhchung','CP vận hành chung','6428','Đang sử dụng'),
  ('cp.vattukho','CP vật tư kho','6427','Đang sử dụng')
on conflict (ma) do nothing;

-- Whitelist thêm expense_category (chép nguyên từ 31_fix_replace_catalog_delete_where.sql + 1 tên)
create or replace function public.replace_catalog_table(p_table text, p_rows jsonb)
 returns integer language plpgsql security definer set search_path to 'public'
as $function$
declare v_n integer;
begin
  if p_table not in ('catalog_item','catalog_category','supplier_code',
                     'product_bundle','product_filter','product_warranty','expense_category') then
    raise exception 'Bang khong duoc phep: %', p_table;
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'p_rows rong — tu choi xoa %', p_table;
  end if;
  execute format('delete from public.%I where true', p_table);
  execute format(
    'insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1)',
    p_table, p_table) using p_rows;
  execute format('select count(*) from public.%I', p_table) into v_n;
  return v_n;
end $function$;

-- sync_catalog: thân hàm chép nguyên từ live (pg_get_functiondef 04/09/2026), chỉ đổi v_tables
create or replace function public.sync_catalog()
 returns jsonb language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare
  v_key     text;
  v_base    text := 'https://qynpywysgltspmgnhhga.supabase.co/rest/v1/';
  v_tables  text[] := array['catalog_item','catalog_category','supplier_code',
                            'product_bundle','product_filter','product_warranty','expense_category'];
  v_t       text;
  v_resp    extensions.http_response;
  v_rows    jsonb;
  v_n       int;
  v_result  jsonb := '{}'::jsonb;
  v_ok      boolean := true;
  v_msg     text := '';
  v_started timestamptz := clock_timestamp();
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'masterdata_anon_key';
  if v_key is null then
    raise exception 'Vault secret masterdata_anon_key chua ton tai';
  end if;

  foreach v_t in array v_tables loop
    begin
      v_resp := extensions.http((
        'GET',
        v_base || v_t || '?limit=100000',
        array[ extensions.http_header('apikey', v_key),
               extensions.http_header('Authorization', 'Bearer ' || v_key) ],
        null, null
      )::extensions.http_request);

      if v_resp.status <> 200 then
        v_ok := false;
        v_msg := v_msg || format('%s: HTTP %s; ', v_t, v_resp.status);
        v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('error', 'http ' || v_resp.status));
        continue;
      end if;

      v_rows := v_resp.content::jsonb;
      if v_rows is null or jsonb_typeof(v_rows) <> 'array' or jsonb_array_length(v_rows) = 0 then
        v_ok := false;
        v_msg := v_msg || format('%s: nguon rong (giu nguyen mirror); ', v_t);
        v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('skipped', 'empty'));
        continue;
      end if;

      v_n := public.replace_catalog_table(v_t, v_rows);
      v_result := v_result || jsonb_build_object(v_t, v_n);
    exception when others then
      v_ok := false;
      v_msg := v_msg || format('%s: %s; ', v_t, sqlerrm);
      v_result := v_result || jsonb_build_object(v_t, jsonb_build_object('error', sqlerrm));
    end;
  end loop;

  insert into public.catalog_sync_log(ok, chi_tiet, thong_bao, ms)
  values (v_ok, v_result, nullif(v_msg, ''),
          extract(milliseconds from clock_timestamp() - v_started)::int);

  return jsonb_build_object('ok', v_ok, 'tables', v_result, 'msg', nullif(v_msg, ''));
end $function$;
```

- [ ] **Step 2: Thêm staff dev cho vai kế toán vào `supabase/seed.sql`**

Trong khối `insert into public.staff (...) values` thêm dòng (trước dòng cuối có dấu `;`):

```sql
  ('dev.ketoan@gwt.vn',   'Dev Kế toán',      array['ke_toan'],               true),
```

Ghi chú vào `docs/LOCAL-DEV.md` bảng tài khoản: `dev.ketoan@gwt.vn` tạo auth user bằng `bash tools/user-local.sh` với mật khẩu chung `gwtlocal123` (KHÔNG đổi hai tài khoản chuẩn).

- [ ] **Step 3: Kiểm cú pháp bằng CI (máy này không có Docker)**

```bash
git add supabase/migrations/20260904040000_ke_toan_00_init.sql supabase/seed.sql docs/LOCAL-DEV.md
git commit -m "feat(ke-toan): migration 00 — schema accounting, bucket, gương expense_category"
git push
gh run watch $(gh run list -w db-reset -b feat/ke-toan-hoa-don --limit 1 --json databaseId --jq '.[0].databaseId')
```
Expected: db-reset xanh (replay + seed + smoke nền). Đỏ → đọc log job, sửa SQL, push lại. **Chưa áp live** (áp ở Task 8 cùng migration 01 và 02 khi cả bộ xanh).

---

### Task 3: Sinh fixture & golden từ tool Python (chạy tay trên máy này)

**Files:**
- Create: `tools/scripts/ke_toan_sinh_golden.py`
- Create: `apps/web/lib/ke-toan/__fixtures__/t8-dau-vao.json` (output, ~120 KB)
- Create: `apps/web/lib/ke-toan/__fixtures__/chuan-hoa-cases.json` (output)

**Interfaces:**
- Produces: `t8-dau-vao.json` = `{ rows: DongGolden[] }` với `DongGolden = { i:number, kyHieu:string, soHd:string, seller:string, desc:string, thue:number, thanhTien:number, expected: { nguon:string, kmcp:string, ten:string, tkno:string, tkco:string, vat:string, kind:'goods'|'muahang'|'kmcp'|'unknown' } }`. `chuan-hoa-cases.json` = `{ norm:[[in,out]], sd:[[in,out]], hard:[[in,out]] }`.

- [ ] **Step 1: Viết script**

```python
"""Sinh fixture test parity cho engine TypeScript từ tool Python cũ (data/ke-toan, gitignore).
Chạy TAY trên máy có data: python tools/scripts/ke_toan_sinh_golden.py
Che PII: bỏ MST/địa chỉ/người mua; seller là tên công ty (giữ); nếu seller không có chữ
"CÔNG TY|CTY|TNHH|CỔ PHẦN|CP|DNTN|HỘ KINH DOANH" thì thay bằng "NCC-<số>" (cá nhân).
Số 10 chữ số dạng SĐT VN trong tên hàng → 0900000000 (dải giả của scan_pii_secrets.py).
"""
import glob, json, os, re, sys, warnings
warnings.filterwarnings("ignore")
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG = glob.glob(os.path.join(ROOT, "data", "ke-toan", "*", "*", "gwt_ketoan"))[0]
sys.path.insert(0, os.path.dirname(PKG))
from gwt_ketoan import engine, nexia  # noqa: E402

XLSX = glob.glob(os.path.join(ROOT, "data", "ke-toan", "**", "2026", "08.2026 - GWT - NEXIA.xlsx"), recursive=True)[0]
OUT = os.path.join(ROOT, "apps", "web", "lib", "ke-toan", "__fixtures__")
os.makedirs(OUT, exist_ok=True)

CTY = re.compile(r"c[ôo]ng ty|cty|tnhh|c[ổo] ph[ầa]n|\bcp\b|dntn|h[ộo] kinh doanh|bank|ltd|co\.|corp", re.I)
PHONE = re.compile(r"(?<!\d)0[35789]\d{8}(?!\d)")


def che(s):
    return PHONE.sub("0900000000", str(s or ""))


con = engine.connect()
clf = engine.Classifier(con, learn=True)
kmname = {r["ma"]: r["ten"] for r in con.execute("SELECT ma,ten FROM kmcp")}

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ws = wb["HĐ đầu vào"]
rows = list(ws.iter_rows(values_only=True))
hdr = {str(v).strip(): i for i, v in enumerate(rows[0]) if v}
c_seller, c_desc, c_thue = hdr["Tên người bán"], hdr["Tên hàng hóa, dịch vụ"], hdr["Tiền thuế"]
c_tt, c_kh, c_so = hdr["Thành tiền chưa thuế"], hdr["Ký hiệu hóa  đơn"], hdr["Số hóa đơn"]

out, ncc_map = [], {}
for i, r in enumerate(rows[1:], start=2):
    seller, desc, thue = r[c_seller], r[c_desc], r[c_thue]
    if seller is None and desc is None:
        continue
    goods = nexia._is_goods(desc)
    if goods:
        sg = {"nguon": "goods"}
    else:
        sg = clf.suggest(seller, desc)
    res = nexia.classify_input_row(clf, kmname, seller, desc, thue)
    s = str(seller or "")
    if s and not CTY.search(s):
        s = ncc_map.setdefault(s, f"NCC-{len(ncc_map) + 1}")
    out.append({
        "i": i, "kyHieu": str(r[c_kh] or "").strip(), "soHd": str(r[c_so] or "").strip(),
        "seller": che(s), "desc": che(desc), "thue": float(thue or 0), "thanhTien": float(r[c_tt] or 0),
        "expected": {"nguon": sg.get("nguon", ""), "kmcp": res["kmcp"], "ten": res["ten"],
                     "tkno": res["tkno"], "tkco": res["tkco"], "vat": res["vat"], "kind": res["kind"]},
    })
json.dump({"rows": out}, open(os.path.join(OUT, "t8-dau-vao.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# Cặp chuẩn hoá — lấy từ chính dữ liệu để phủ đủ dấu/đ/ngoặc/khoảng trắng
samples = sorted({str(x["desc"]) for x in out} | {str(x["seller"]) for x in out})[:300]
samples += ["Đường  Cây Keo", "Vòi sen tắm (Hồng)", "  A   B  ", "Ống  nước Đ/đ", ""]
cases = {
    "norm": [[s, engine.norm(s)] for s in samples],
    "sd": [[s, nexia.sd(s)] for s in samples],
    "hard": [[s, nexia._hard(s)] for s in samples],
}
json.dump(cases, open(os.path.join(OUT, "chuan-hoa-cases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
from collections import Counter
print("rows:", len(out), "nguon:", Counter(x["expected"]["nguon"] for x in out))
```

- [ ] **Step 2: Chạy**

Run: `python tools/scripts/ke_toan_sinh_golden.py`
Expected: in `rows: 415 nguon: Counter({...})` với các nguồn `override_ncc`, `override_kw`, `rule_ncc`, `rule_kw`, `goods`, `hoc_ncc`, `hoc_prefix`, `''`. Ghi lại số đếm vào phiên.

- [ ] **Step 3: Quét PII fixture trước khi add**

Run: `python tools/scripts/scan_pii_secrets.py apps/web/lib/ke-toan/__fixtures__/t8-dau-vao.json apps/web/lib/ke-toan/__fixtures__/chuan-hoa-cases.json`
Expected: không báo gì. Mở file, tìm nhanh `grep -c "0110530659" ...` phải = 0 (MST GWT không được có mặt).

- [ ] **Step 4: Commit**

```bash
git add tools/scripts/ke_toan_sinh_golden.py apps/web/lib/ke-toan/__fixtures__/
git commit -m "test(ke-toan): fixture T8 đầu vào + cặp chuẩn hoá sinh từ tool Python (đã che PII)"
```

---

### Task 4: `chuan-hoa.ts` — norm / sd / hard / khoá dòng

**Files:**
- Create: `apps/web/lib/ke-toan/chuan-hoa.ts`
- Test: `apps/web/lib/ke-toan/chuan-hoa.test.ts`

**Interfaces:**
- Produces:
  - `norm(s: unknown): string` — bỏ dấu (NFD, bỏ Mn), `đ→d`, lowercase, gộp khoảng trắng, trim (= Python `engine.norm`).
  - `sd(s: unknown): string` — như `norm` nhưng **giữ `đ`** (= Python `nexia.sd`).
  - `hard(s: unknown): string` — `sd` rồi bỏ mọi ký tự ngoài `[a-z0-9]`.
  - `boNgoac(s: string): string` — bỏ `(...)` không tham lam (`re.sub(r"\(.*?\)", "")`) rồi trim.
  - `boTuNgoac(s: string): string` — bỏ từ `(` tới hết (`re.sub(r"\(.*$", "")`) rồi trim.
  - `khoaDong(direction: 'vao'|'ra', kyHieu: string, soHd: string, tenHang: string, thanhTien: number): string` — sha1 hex của `${direction}|${kyHieu.trim()}|${soHd.trim()}|${sd(tenHang)}|${Math.round(thanhTien)}`.

- [ ] **Step 1: Viết test**

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { norm, sd, hard, boNgoac, boTuNgoac, khoaDong } from './chuan-hoa'

const cases = JSON.parse(readFileSync(fileURLToPath(new URL('./__fixtures__/chuan-hoa-cases.json', import.meta.url)), 'utf8')) as {
  norm: [string, string][]; sd: [string, string][]; hard: [string, string][]
}

describe('chuan-hoa khớp Python', () => {
  it('norm: bỏ dấu, đ→d', () => { for (const [i, o] of cases.norm) expect(norm(i), i).toBe(o) })
  it('sd: bỏ dấu, giữ đ', () => { for (const [i, o] of cases.sd) expect(sd(i), i).toBe(o) })
  it('hard: chỉ a-z0-9', () => { for (const [i, o] of cases.hard) expect(hard(i), i).toBe(o) })
  it('null/undefined/số → chuỗi', () => {
    expect(norm(null)).toBe(''); expect(sd(undefined)).toBe(''); expect(norm(12.5)).toBe('12.5')
  })
})

describe('ngoặc', () => {
  it('boNgoac bỏ từng cặp', () => expect(boNgoac('vòi sen (hồng) xịn (2nd)')).toBe('vòi sen  xịn'))
  it('boTuNgoac bỏ từ ( tới hết kể cả chưa đóng', () => expect(boTuNgoac('cút vesbo 25mm (màu đen')).toBe('cút vesbo 25mm'))
})

describe('khoaDong', () => {
  it('ổn định, 40 hex, khác nhau khi đổi thành tiền', () => {
    const a = khoaDong('vao', 'C26MTS', ' 487', 'Má giòn mù tạt', 87000)
    expect(a).toMatch(/^[0-9a-f]{40}$/)
    expect(khoaDong('vao', 'C26MTS', '487', 'MÁ GIÒN MÙ TẠT ', 87000.4)).toBe(a)
    expect(khoaDong('vao', 'C26MTS', '487', 'Má giòn mù tạt', 88000)).not.toBe(a)
    expect(khoaDong('ra', 'C26MTS', '487', 'Má giòn mù tạt', 87000)).not.toBe(a)
  })
})
```

- [ ] **Step 2: Chạy test, phải fail**

Run: `cd apps/web && npx vitest run lib/ke-toan/chuan-hoa.test.ts`
Expected: FAIL — `Cannot find module './chuan-hoa'`.

- [ ] **Step 3: Viết module**

```ts
import { createHash } from 'node:crypto'

/**
 * Chuẩn hoá chuỗi cho khu Kế toán — port 1:1 từ tool Python cũ (engine.norm / nexia.sd / nexia._hard).
 * Giữ đúng hai biến thể vì luật & lịch sử được chuẩn hoá bằng hai hàm khác nhau:
 *   norm() → luật NCC/từ khoá (đ→d)      sd() → tên hàng/catalog (giữ đ)
 */
function boDauNFD(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '')
}
function gop(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}
export function norm(s: unknown): string {
  const t = boDauNFD(String(s ?? '').toLowerCase()).replace(/đ/g, 'd').replace(/Đ/g, 'D')
  return gop(t)
}
export function sd(s: unknown): string {
  return gop(boDauNFD(String(s ?? '')).toLowerCase())
}
export function hard(s: unknown): string {
  return sd(s).replace(/[^a-z0-9]/g, '')
}
export function boNgoac(s: string): string {
  return s.replace(/\(.*?\)/g, '').trim()
}
export function boTuNgoac(s: string): string {
  return s.replace(/\(.*$/s, '').trim()
}
export function khoaDong(
  direction: 'vao' | 'ra', kyHieu: string, soHd: string, tenHang: string, thanhTien: number,
): string {
  const chuoi = [direction, kyHieu.trim(), soHd.trim(), sd(tenHang), String(Math.round(thanhTien))].join('|')
  return createHash('sha1').update(chuoi, 'utf8').digest('hex')
}
```

Lưu ý port: Python `norm` gọi `.lower()` **trước** khi bỏ dấu, `sd` bỏ dấu **trước** rồi lower — kết quả như nhau với tiếng Việt; test fixture sẽ chứng minh.

- [ ] **Step 4: Chạy test, phải pass**

Run: `cd apps/web && npx vitest run lib/ke-toan/chuan-hoa.test.ts`
Expected: PASS 6 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/ke-toan/chuan-hoa.ts apps/web/lib/ke-toan/chuan-hoa.test.ts
git commit -m "feat(ke-toan): chuan-hoa — norm/sd/hard/khoaDong khớp Python trên fixture"
```

---

### Task 5: `doc-file/nexia.ts` — đọc file NEXIA theo tên cột, giữ header theo vị trí

**Files:**
- Create: `apps/web/lib/ke-toan/doc-file/nexia.ts`
- Test: `apps/web/lib/ke-toan/doc-file/nexia.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type DongTho = { rowOrder: number; raw: (string | number | null)[]; truong: TruongDong }
  export type TruongDong = {
    kyHieu: string; soHd: string; ngayLap: string | null /* YYYY-MM-DD */; mccqt: string
    tenBan: string; mstBan: string; tenMua: string; mstMua: string
    tenHang: string; dvt: string; soLuong: number | null; donGia: number | null; thueSuat: string
    thanhTien: number; tienThue: number; tongThanhToan: number | null; trangThai: string; tinhChat: string
  }
  export type TabNexia = { ten: 'vao' | 'ra'; headers: string[]; dong: DongTho[] }
  export type FileNexia = { vao: TabNexia | null; ra: TabNexia | null }
  export function docNexia(buf: ArrayBuffer | Uint8Array): FileNexia
  export function timCot(headers: string[], ...manh: string[]): number   // -1 nếu không có; khớp tất cả mảnh, không phân biệt hoa thường, gộp khoảng trắng
  ```
  Tab nhận diện theo tên sheet chứa `đầu vào` / `đầu ra` (không phân biệt hoa thường, bỏ dấu). Cột nghiệp vụ tìm theo mảnh tên: `Ký hiệu` + `hóa`; `Số hóa đơn`; `Ngày lập`; `MCCQT`; `Tên người bán`; `MST người bán`; `Tên người mua`; `MST người mua`; `Tên hàng`; `Đơn vị tính`; `Số lượng`; `Đơn giá`; `Thuế suất`; `Thành tiền chưa thuế`; `Tiền thuế`; `Tổng tiền thanh toán`; `Trạng thái hóa đơn`; `Tính chất`. Cột **không có** → trường rỗng/null, không ném lỗi. Dòng bỏ qua khi cả cột `Số hóa đơn` lẫn `Tên hàng` đều trống. Header `null` → `''` (giữ vị trí). Ngày `dd/mm/yyyy` hoặc Date → `YYYY-MM-DD`.

- [ ] **Step 1: Viết test (dựng workbook trong bộ nhớ, không fixture nhị phân)**

```ts
import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { docNexia, timCot } from './nexia'

function wb(sheets: Record<string, unknown[][]>): ArrayBuffer {
  const w = XLSX.utils.book_new()
  for (const [ten, aoa] of Object.entries(sheets)) XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet(aoa), ten)
  return XLSX.write(w, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}
const HDR = ['Mẫu số HD', 'Ký hiệu hóa  đơn', 'Số hóa đơn', 'Ngày lập hóa đơn', 'Ngày người bán ký số', 'MCCQT',
  'Ngày CQT ký số', 'Đơn vị tiền tệ', 'Tỷ giá', 'Tên người bán', 'MST người bán', 'Địa chỉ người bán',
  'Tên người mua', 'MST người mua', 'Địa chỉ người mua', 'Mã VT', 'Tên hàng hóa, dịch vụ', 'Đơn vị tính',
  'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thuế suất', 'Thành tiền chưa thuế', 'Tiền thuế', 'Tổng tiền CKTM',
  'Tổng tiền phí', 'Tổng tiền thanh toán', 'Trạng thái hóa đơn', 'Ghi chú 2', 'Số lô', null, 'Ghi chú 2', 'Tính chất']
const DONG = [1, 'C26MTS', ' 487', '23/08/2026', '23/08/2026', 'M1-26-X', '23/08/2026', 'VND', 1, 'CÔNG TY A', '0100000001', 'HN',
  'CÔNG TY B', '0100000002', 'HN', 0, 'Má giòn mù tạt', 'Phần', 3, 29000, 0, 0.08, 87000, 6960, null, null, 93960,
  'Hóa đơn mới', null, null, null, 'ghi ở cột 32', 'TM/CK']

describe('docNexia', () => {
  it('đọc 2 tab, header giữ vị trí kể cả trùng tên và rỗng', () => {
    const f = docNexia(wb({ Sheet1: [['ghi chú']], 'HĐ đầu vào': [HDR, DONG], 'HĐ Đầu ra': [HDR] }))
    expect(f.vao?.headers).toHaveLength(33)
    expect(f.vao?.headers[30]).toBe('')
    expect(f.vao?.headers[28]).toBe('Ghi chú 2'); expect(f.vao?.headers[31]).toBe('Ghi chú 2')
    expect(f.ra?.dong).toHaveLength(0)
  })
  it('trường nghiệp vụ tìm theo tên cột; raw giữ đúng vị trí', () => {
    const f = docNexia(wb({ 'HĐ đầu vào': [HDR, DONG] }))
    const d = f.vao!.dong[0]
    expect(d.rowOrder).toBe(1)
    expect(d.truong).toMatchObject({ kyHieu: 'C26MTS', soHd: '487', ngayLap: '2026-08-23', tenBan: 'CÔNG TY A',
      tenHang: 'Má giòn mù tạt', thanhTien: 87000, tienThue: 6960, tongThanhToan: 93960, trangThai: 'Hóa đơn mới', tinhChat: 'TM/CK' })
    expect(d.raw[31]).toBe('ghi ở cột 32'); expect(d.raw[30]).toBeNull()
  })
  it('bỏ dòng trống, cột thiếu không ném lỗi', () => {
    const hdrThieu = HDR.filter((h) => h !== 'Tính chất' && h !== 'MCCQT')
    const dongThieu = DONG.filter((_, i) => HDR[i] !== 'Tính chất' && HDR[i] !== 'MCCQT')
    const f = docNexia(wb({ 'HĐ đầu vào': [hdrThieu, dongThieu, [null, null, null], []] }))
    expect(f.vao!.dong).toHaveLength(1)
    expect(f.vao!.dong[0].truong.tinhChat).toBe(''); expect(f.vao!.dong[0].truong.mccqt).toBe('')
  })
  it('ngày dạng Date của Excel cũng ra YYYY-MM-DD', () => {
    const dong = [...DONG]; dong[3] = new Date(2026, 7, 5)
    const f = docNexia(wb({ 'HĐ đầu vào': [HDR, dong] }))
    expect(f.vao!.dong[0].truong.ngayLap).toBe('2026-08-05')
  })
  it('timCot khớp mảnh, không phân biệt hoa thường/khoảng trắng đôi', () => {
    expect(timCot(HDR, 'ký hiệu', 'hóa')).toBe(1)
    expect(timCot(HDR, 'không có')).toBe(-1)
  })
})
```

- [ ] **Step 2: Chạy test, phải fail**

Run: `cd apps/web && npx vitest run lib/ke-toan/doc-file/nexia.test.ts`
Expected: FAIL — module không tồn tại.

- [ ] **Step 3: Viết module**

```ts
import * as XLSX from 'xlsx'
import { sd } from '../chuan-hoa'

export type TruongDong = {
  kyHieu: string; soHd: string; ngayLap: string | null; mccqt: string
  tenBan: string; mstBan: string; tenMua: string; mstMua: string
  tenHang: string; dvt: string; soLuong: number | null; donGia: number | null; thueSuat: string
  thanhTien: number; tienThue: number; tongThanhToan: number | null; trangThai: string; tinhChat: string
}
export type DongTho = { rowOrder: number; raw: (string | number | null)[]; truong: TruongDong }
export type TabNexia = { ten: 'vao' | 'ra'; headers: string[]; dong: DongTho[] }
export type FileNexia = { vao: TabNexia | null; ra: TabNexia | null }

/** Tìm cột theo các mảnh tên (đều phải có), so sau khi bỏ dấu + gộp khoảng trắng. -1 nếu không có. */
export function timCot(headers: string[], ...manh: string[]): number {
  const m = manh.map((x) => sd(x))
  return headers.findIndex((h) => { const t = sd(h); return m.every((x) => t.includes(x)) })
}

function chuoi(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(v)
  return String(v).trim()
}
function so(v: unknown): number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  const n = Number(String(v).replace(/[,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}
function ngay(v: unknown): string | null {
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`
  }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(chuoi(v))
  if (!m) return null
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}
function oTho(v: unknown): string | number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  if (v instanceof Date) return ngay(v)
  return String(v)
}

function docTab(ws: XLSX.WorkSheet, ten: 'vao' | 'ra'): TabNexia {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, blankrows: false, defval: null })
  const headers = (aoa[0] ?? []).map((h) => chuoi(h))
  const c = {
    kyHieu: timCot(headers, 'ký hiệu', 'hóa'), soHd: timCot(headers, 'số hóa đơn'), ngayLap: timCot(headers, 'ngày lập'),
    mccqt: timCot(headers, 'mccqt'), tenBan: timCot(headers, 'tên người bán'), mstBan: timCot(headers, 'mst người bán'),
    tenMua: timCot(headers, 'tên người mua'), mstMua: timCot(headers, 'mst người mua'), tenHang: timCot(headers, 'tên hàng'),
    dvt: timCot(headers, 'đơn vị tính'), soLuong: timCot(headers, 'số lượng'), donGia: timCot(headers, 'đơn giá'),
    thueSuat: timCot(headers, 'thuế suất'), thanhTien: timCot(headers, 'thành tiền chưa thuế'), tienThue: timCot(headers, 'tiền thuế'),
    tongThanhToan: timCot(headers, 'tổng tiền thanh toán'), trangThai: timCot(headers, 'trạng thái hóa đơn'), tinhChat: timCot(headers, 'tính chất'),
  }
  const g = (r: unknown[], i: number) => (i >= 0 ? r[i] : null)
  const dong: DongTho[] = []
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] ?? []
    if (!chuoi(g(row, c.soHd)) && !chuoi(g(row, c.tenHang))) continue
    const raw = headers.map((_, i) => oTho(row[i]))
    dong.push({
      rowOrder: dong.length + 1, raw,
      truong: {
        kyHieu: chuoi(g(row, c.kyHieu)), soHd: chuoi(g(row, c.soHd)), ngayLap: ngay(g(row, c.ngayLap)), mccqt: chuoi(g(row, c.mccqt)),
        tenBan: chuoi(g(row, c.tenBan)), mstBan: chuoi(g(row, c.mstBan)), tenMua: chuoi(g(row, c.tenMua)), mstMua: chuoi(g(row, c.mstMua)),
        tenHang: chuoi(g(row, c.tenHang)), dvt: chuoi(g(row, c.dvt)), soLuong: so(g(row, c.soLuong)), donGia: so(g(row, c.donGia)),
        thueSuat: chuoi(g(row, c.thueSuat)), thanhTien: so(g(row, c.thanhTien)) ?? 0, tienThue: so(g(row, c.tienThue)) ?? 0,
        tongThanhToan: so(g(row, c.tongThanhToan)), trangThai: chuoi(g(row, c.trangThai)), tinhChat: chuoi(g(row, c.tinhChat)),
      },
    })
  }
  return { ten, headers, dong }
}

export function docNexia(buf: ArrayBuffer | Uint8Array): FileNexia {
  const wb = XLSX.read(buf, { type: buf instanceof Uint8Array ? 'buffer' : 'array', cellDates: true })
  let vao: TabNexia | null = null, ra: TabNexia | null = null
  for (const name of wb.SheetNames) {
    const n = sd(name)
    if (n.includes('đầu vào') && !vao) vao = docTab(wb.Sheets[name], 'vao')
    else if (n.includes('đầu ra') && !ra) ra = docTab(wb.Sheets[name], 'ra')
  }
  return { vao, ra }
}
```

- [ ] **Step 4: Chạy test, phải pass**

Run: `cd apps/web && npx vitest run lib/ke-toan/doc-file/nexia.test.ts`
Expected: PASS 5 tests. Nếu `ngày Date` fail vì `cellDates` đổi múi giờ: đọc ngày qua `XLSX.SSF.parse_date_code` theo giờ địa phương (`getFullYear/getMonth/getDate` — KHÔNG `toISOString`).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/ke-toan/doc-file/
git commit -m "feat(ke-toan): doc-file/nexia — đọc 2 tab theo tên cột, header giữ vị trí"
```

---

### Task 6: Seed luật vào DB (migration 01 sinh bằng script) + types engine

**Files:**
- Create: `tools/scripts/ke_toan_sinh_luat_sql.py`
- Create: `supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql` (output script)
- Create: `apps/web/lib/ke-toan/engine/kieu.ts`

**Interfaces:**
- Produces: bảng `accounting.rules` có 4 nhóm theo `origin`/`kind`:
  - `override_json`/`supplier` (17), `override_json`/`keyword` (26), `override_json`/`product_name` (16) — pattern = `norm()` cho supplier/keyword, `sd()` cho product_name; `priority` = thứ tự trong JSON.
  - `rule_excel`/`supplier` (66) — pattern = `norm(ncc)`, `condition` = "Điều kiện tách mã" (trống → null).
  - `rule_excel`/`keyword` — **một dòng cho MỖI cụm** đã tách bằng `engine._keyword_phrases()` của Python; `priority` = (thứ tự dòng Excel × 100 + thứ tự cụm); `condition` = "Ngoại lệ" nếu có.
  - `history`/`product_name` (444) — từ `name2code.json`, pattern = `sd(tên)`.
- `kieu.ts`:
  ```ts
  export type Luat = { id?: number; kind: 'supplier' | 'keyword' | 'product_name'; pattern: string; targetCode: string; condition: string | null; priority: number; origin: 'rule_excel' | 'override_json' | 'history' | 'app'; active: boolean }
  export type MucCatalog = { ma: string; ten: string; tinhChat: string }
  export type MucKmcp = { ma: string; ten: string; tkNoDefault: string }
  export type ThongKeHoc = { nccToMa: Record<string, string>; prefixToMa: Record<string, string> }   // lát 2 điền; lát 1 rỗng
  export type DoTinCay = 'cao' | 'trung binh' | 'can review' | 'khong ro'
  export type KetQuaDauVao = { kind: 'goods' | 'muahang' | 'kmcp' | 'unknown'; code: string; codeName: string; tkNo: string; tkCo: string; vat1331: string; conf: DoTinCay; reason: string; nguon: string }
  ```

- [ ] **Step 1: Viết `kieu.ts`** (đúng như khối trên, kèm comment 1 dòng mỗi type).

- [ ] **Step 2: Viết script sinh SQL**

```python
"""Sinh migration seed luật từ data/ke-toan (Excel Rule + overrides.json + name2code.json).
Chạy TAY: python tools/scripts/ke_toan_sinh_luat_sql.py > supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql
Không PII: chỉ tên công ty, từ khoá, tên hàng. Cột "Ngoại lệ" của Excel có tên cá nhân → bị lược bằng regex họ tên VN.
"""
import glob, json, os, re, sys, warnings
warnings.filterwarnings("ignore")
import openpyxl
sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG = glob.glob(os.path.join(ROOT, "data", "ke-toan", "*", "*", "gwt_ketoan"))[0]
sys.path.insert(0, os.path.dirname(PKG))
from gwt_ketoan import engine, nexia  # noqa: E402

XLSX = glob.glob(os.path.join(ROOT, "data", "ke-toan", "**", "GWT_Rule phan bo chi phi.xlsx"), recursive=True)[0]
OV = json.load(open(os.path.join(PKG, "overrides.json"), encoding="utf-8"))
N2C = json.load(open(os.path.join(PKG, "ref", "name2code.json"), encoding="utf-8"))
TEN_NGUOI = re.compile(r"\(?(Nguyễn|Trần|Lê|Phạm|Hoàng|Huỳnh|Phan|Vũ|Võ|Đặng|Bùi|Đỗ|Hồ|Ngô|Dương|Lý)\s+[^)\n,;·]+\)?")


def q(s):
    return "null" if s is None or s == "" else "'" + str(s).replace("'", "''") + "'"


rows = []  # (kind, pattern, target, condition, priority, origin)
for i, (k, v) in enumerate(OV["supplier_kmcp"].items()):
    rows.append(("supplier", engine.norm(k), v, None, i, "override_json"))
for i, (k, v) in enumerate(OV["keyword_kmcp"].items()):
    rows.append(("keyword", engine.norm(k), v, None, i, "override_json"))
for i, (k, v) in enumerate(OV["product_name_code"].items()):
    rows.append(("product_name", nexia.sd(k), v, None, i, "override_json"))

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)


def bang(ten, *must):
    ws = wb[ten]
    data = [list(r) for r in ws.iter_rows(values_only=True)]
    hi = next(i for i, r in enumerate(data) if r and all(any(x and m in str(x) for x in r) for m in must))
    hdr = [str(x).strip() if x else "" for x in data[hi]]
    return [dict(zip(hdr, r)) for r in data[hi + 1:] if r and any(r)]


for i, r in enumerate(bang("2.Rule theo NCC", "Nhà cung cấp", "Mã mặc định")):
    ncc, ma = r.get("Nhà cung cấp / Tên đối tượng"), r.get("Mã mặc định")
    if not ncc or not ma:
        continue
    dk = TEN_NGUOI.sub("", str(r.get("Điều kiện tách mã") or "")).strip() or None
    rows.append(("supplier", engine.norm(ncc), str(ma).strip(), dk, i, "rule_excel"))

for i, r in enumerate(bang("1.Rule theo loai GD", "Mã KMCP", "Từ khoá")):
    ma = r.get("Mã KMCP")
    if not ma:
        continue
    tk = next((v for k, v in r.items() if k.startswith("Từ khoá")), "")
    nl = next((v for k, v in r.items() if k.startswith("Ngoại lệ")), "")
    nl = TEN_NGUOI.sub("", str(nl or "")).strip()
    nl = None if nl in ("", "—", "-") else nl
    for j, ph in enumerate(engine._keyword_phrases(str(tk or ""))):
        rows.append(("keyword", ph, str(ma).strip(), nl, i * 100 + j, "rule_excel"))

for i, (k, v) in enumerate(N2C.items()):
    rows.append(("product_name", nexia.sd(k), v, None, i, "history"))

print("-- ke_toan_01_luat_seed — SINH BẰNG tools/scripts/ke_toan_sinh_luat_sql.py, KHÔNG sửa tay.")
print("-- Cách lùi nếu hỏng: delete from accounting.rules where origin in ('override_json','rule_excel','history');")
print("insert into accounting.rules (kind, pattern, target_code, condition, priority, origin) values")
print(",\n".join(f"  ({q(k)}, {q(p)}, {q(t)}, {q(c)}, {pr}, {q(o)})" for k, p, t, c, pr, o in rows) + ";")
print(f"-- tổng {len(rows)} luật", file=sys.stderr)
```

- [ ] **Step 3: Chạy sinh SQL + quét**

Run:
```bash
python tools/scripts/ke_toan_sinh_luat_sql.py > supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql
python tools/scripts/scan_pii_secrets.py supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql
grep -c "insert into" supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql
```
Expected: stderr `tổng ~600 luật`; quét sạch; đọc lướt file: không thấy tên cá nhân (tìm `Nguyễn`, `Trần`… phải 0 dòng ngoài tên công ty).

- [ ] **Step 4: Commit + CI**

```bash
git add tools/scripts/ke_toan_sinh_luat_sql.py supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql apps/web/lib/ke-toan/engine/kieu.ts
git commit -m "feat(ke-toan): seed luật từ Excel Rule + overrides + name2code (sinh bằng script) · types engine"
git push && gh run watch $(gh run list -w db-reset -b feat/ke-toan-hoa-don --limit 1 --json databaseId --jq '.[0].databaseId')
```
Expected: db-reset xanh.

---

### Task 7: `engine/dau-vao.ts` — port engine + test parity với Python

**Files:**
- Create: `apps/web/lib/ke-toan/engine/dau-vao.ts`
- Test: `apps/web/lib/ke-toan/engine/dau-vao.test.ts`

**Interfaces:**
- Consumes: `Luat`, `MucCatalog`, `MucKmcp`, `ThongKeHoc`, `KetQuaDauVao` từ `./kieu`; `norm`, `sd`, `hard`, `boNgoac`, `boTuNgoac` từ `../chuan-hoa`.
- Produces:
  ```ts
  export function taoEngineDauVao(input: { luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; thongKe?: ThongKeHoc }): {
    phanLoai(seller: unknown, desc: unknown, thue: number | null): KetQuaDauVao
    goiYMaNoiBo(tenHang: unknown): { ma: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; canCu: string }   // = Python match_code, tái dùng ở lát 3
  }
  ```
  Hằng: `MA_DICH_VU_KHONG_PHAI_HANG = ['DVVC','DVBT','DVLD','DVSC']`, `TINH_CHAT_TK = { 'Hàng hóa':'1561', 'Thành phẩm':'1561', 'Nguyên vật liệu':'152', 'Công cụ dụng cụ':'153' }`, `TK_NHAN = { '1561':'HÀNG HOÁ', '152':'VẬT TƯ (NVL)', '153':'CCDC' }`.

- [ ] **Step 1: Viết test parity**

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { taoEngineDauVao } from './dau-vao'
import type { Luat, MucCatalog, MucKmcp } from './kieu'

type Golden = { rows: { i: number; seller: string; desc: string; thue: number; expected: { nguon: string; kmcp: string; ten: string; tkno: string; tkco: string; vat: string; kind: string } }[] }
const golden = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/t8-dau-vao.json', import.meta.url)), 'utf8')) as Golden

/** Luật lấy từ chính SQL seed (nguồn sự thật) — parse đơn giản từng dòng `(kind, pattern, target, condition, priority, origin)`. */
function luatTuSeed(): Luat[] {
  const sql = readFileSync(fileURLToPath(new URL('../../../../../supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql', import.meta.url)), 'utf8')
  const re = /^\s*\('(supplier|keyword|product_name)', '((?:[^']|'')*)', '((?:[^']|'')*)', (null|'(?:[^']|'')*'), (\d+), '(\w+)'\)/gm
  const out: Luat[] = []; let m: RegExpExecArray | null
  const un = (s: string) => s.replace(/''/g, "'")
  while ((m = re.exec(sql))) out.push({ kind: m[1] as Luat['kind'], pattern: un(m[2]), targetCode: un(m[3]), condition: m[4] === 'null' ? null : un(m[4].slice(1, -1)), priority: Number(m[5]), origin: m[6] as Luat['origin'], active: true })
  return out
}
/** Catalog & KMCP: bản chụp nhỏ đủ cho T8 — lấy từ fixture riêng để test không cần DB. */
const catalog = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/catalog-t8.json', import.meta.url)), 'utf8')) as MucCatalog[]
const kmcp = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/kmcp.json', import.meta.url)), 'utf8')) as MucKmcp[]

const TANG_LAT_1 = new Set(['override_ncc', 'override_kw', 'rule_ncc', 'rule_kw', 'goods'])

describe('engine đầu vào khớp Python trên T8', () => {
  const eng = taoEngineDauVao({ luat: luatTuSeed(), catalog, kmcp })
  const lech: string[] = []; const themDuoc: string[] = []; let soSanh = 0
  for (const r of golden.rows) {
    const kq = eng.phanLoai(r.seller, r.desc, r.thue)
    if (!TANG_LAT_1.has(r.expected.nguon)) { if (kq.code && !r.expected.kmcp) themDuoc.push(`#${r.i} ${r.desc} → ${kq.code} (${kq.nguon})`); continue }
    soSanh++
    const got = [kq.code, kq.tkNo, kq.tkCo, kq.vat1331, kq.kind].join('|')
    const exp = [r.expected.kmcp, r.expected.tkno, r.expected.tkco, r.expected.vat, r.expected.kind].join('|')
    if (got !== exp) lech.push(`#${r.i} [${r.expected.nguon}] ${r.seller} / ${r.desc}\n     python=${exp}\n     ts    =${got} (${kq.nguon}: ${kq.reason})`)
  }
  it('so sánh ít nhất 250 dòng tầng 0/A/B/goods', () => expect(soSanh).toBeGreaterThanOrEqual(250))
  it('khớp 100% dòng Python đã gán ở tầng 0/A/B/goods', () => expect(lech, lech.join('\n')).toEqual([]))
  it('liệt kê dòng TS điền thêm (không fail)', () => { console.log(`TS điền thêm ${themDuoc.length} dòng:\n` + themDuoc.join('\n')) })
})

describe('luật cứng ngoài fixture', () => {
  const eng = taoEngineDauVao({ luat: [], catalog: [{ ma: 'T25VB', ten: 'Tê Vesbo 25mm', tinhChat: 'Nguyên vật liệu' }], kmcp: [{ ma: 'cp.muahang', ten: 'x', tkNoDefault: '' }] })
  it('hàng hoá trong catalog → mã nội bộ + TK theo tính chất, TK Có 331', () => {
    expect(eng.phanLoai('X', 'Tê Vesbo 25mm', 100)).toMatchObject({ kind: 'goods', code: 'T25VB', tkNo: '152', tkCo: '331', vat1331: '1331', codeName: 'VẬT TƯ (NVL)' })
  })
  it('có chữ "phí " thì không phải hàng hoá', () => {
    expect(eng.phanLoai('X', 'Phí tê Vesbo 25mm', 0).kind).not.toBe('goods')
  })
  it('không thuế → vat1331 rỗng; không khớp gì → unknown', () => {
    expect(eng.phanLoai('X', 'abc xyz', 0)).toMatchObject({ kind: 'unknown', code: '', vat1331: '', conf: 'khong ro' })
  })
})
```

- [ ] **Step 2: Sinh 2 fixture nhỏ `catalog-t8.json`, `kmcp.json`** (thêm vào cuối `tools/scripts/ke_toan_sinh_golden.py`, chạy lại):

```python
# catalog: catalog_map.json của tool (tên, mã, tính chất) — chính là bản chụp catalog_item Masterdata; không PII
cat = [{"ma": c, "ten": t, "tinhChat": tc} for t, c, tc in json.load(open(os.path.join(PKG, "ref", "catalog_map.json"), encoding="utf-8"))]
json.dump(cat, open(os.path.join(OUT, "catalog-t8.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
km = [{"ma": m, "ten": kmname.get(m, ""), "tkNoDefault": tk} for m, tk in json.load(open(os.path.join(PKG, "ref", "km2tk.json"), encoding="utf-8")).items() if not m.startswith("Cần")]
json.dump(km, open(os.path.join(OUT, "kmcp.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
```
Run: `python tools/scripts/ke_toan_sinh_golden.py` → 2 file mới trong `__fixtures__/`.

- [ ] **Step 3: Chạy test, phải fail** — `cd apps/web && npx vitest run lib/ke-toan/engine/dau-vao.test.ts` → module không tồn tại.

- [ ] **Step 4: Viết engine**

```ts
import { norm, sd, hard, boNgoac, boTuNgoac } from '../chuan-hoa'
import type { DoTinCay, KetQuaDauVao, Luat, MucCatalog, MucKmcp, ThongKeHoc } from './kieu'

/**
 * Engine phân loại HĐ ĐẦU VÀO — port 1:1 từ gwt_ketoan/engine.py (Classifier.suggest) và
 * gwt_ketoan/nexia.py (_is_goods, match_code, classify_input_row). Thứ tự tầng GIỮ NGUYÊN:
 *   goods? → 0) override NCC → override từ khoá → A) rule NCC (khớp dài nhất) → B) rule từ khoá
 *   → C) học lịch sử (NCC ≥70%, tiền tố diễn giải ≥80%; lát 2 mới có dữ liệu) → không rõ.
 * Hàm thuần: không DB, không React. Mọi input đã là dữ liệu đọc từ DB/fixture.
 */
export const MA_DICH_VU_KHONG_PHAI_HANG = ['DVVC', 'DVBT', 'DVLD', 'DVSC'] as const
export const TINH_CHAT_TK: Record<string, string> = { 'Hàng hóa': '1561', 'Thành phẩm': '1561', 'Nguyên vật liệu': '152', 'Công cụ dụng cụ': '153' }
export const TK_NHAN: Record<string, string> = { '1561': 'HÀNG HOÁ', '152': 'VẬT TƯ (NVL)', '153': 'CCDC' }
const TK_HANG_MAC_DINH = '1561'

const STOP = new Set('loc nuoc may ge cho bo loi filter use for machine dung cua phan bphan the he generation cai chiec va don gia hang tang khong tinh tien mua ban thiet bi bung 2nd showerhead shower'.split(' '))
const KWSET = new Set(['cpf', 'pcf', 'pcfb', 'pcff', 'nf', 'cfnc', 'pp', 'pac', 'sparkling', 'sen', 'muoi', 'aromatherapy'])

function chuKy(name: string): string | null {
  const s = sd(name).replace(/[^a-z0-9 ]/g, ' ')
  const toks = s.split(' ').filter((t) => t && !STOP.has(t) && t.length >= 2 && !/^\d+$/.test(t))
  const keep = toks.filter((t) => /\d/.test(t) || KWSET.has(t))
  return keep.length ? [...new Set(keep)].sort().join('+') : null
}
function tienTo(desc: unknown, n = 5): string { return norm(desc).split(' ').slice(0, n).join(' ') }

export function taoEngineDauVao(input: { luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; thongKe?: ThongKeHoc }) {
  const L = input.luat.filter((l) => l.active)
  const byPri = (a: Luat, b: Luat) => a.priority - b.priority
  const ovSup = L.filter((l) => l.origin === 'override_json' && l.kind === 'supplier').sort(byPri)
  const ovKw = L.filter((l) => l.origin === 'override_json' && l.kind === 'keyword').sort(byPri)
  const ovName = new Map(L.filter((l) => l.origin === 'override_json' && l.kind === 'product_name').sort(byPri).map((l) => [l.pattern, l.targetCode]))
  const ruleSup = L.filter((l) => l.origin === 'rule_excel' && l.kind === 'supplier').sort(byPri)
  const ruleKw = L.filter((l) => l.origin === 'rule_excel' && l.kind === 'keyword').sort(byPri)
  const appSup = L.filter((l) => l.origin === 'app' && l.kind === 'supplier').sort(byPri)   // "Đặt thành luật" (lát 2) — ưu tiên như override
  const appKw = L.filter((l) => l.origin === 'app' && l.kind === 'keyword').sort(byPri)
  const n2c = new Map<string, string>(); for (const l of L) if (l.origin === 'history' && l.kind === 'product_name') n2c.set(l.pattern, l.targetCode)
  const kmTen = new Map(input.kmcp.map((k) => [k.ma, k.ten])); const kmTk = new Map(input.kmcp.map((k) => [k.ma, k.tkNoDefault]))
  const thongKe: ThongKeHoc = input.thongKe ?? { nccToMa: {}, prefixToMa: {} }

  // catalog: khớp đúng (sd) / khớp cứng (hard); bỏ mã dịch vụ & mã cp.*
  const catExact = new Map<string, MucCatalog>(); const catHard = new Map<string, MucCatalog>(); const catTc = new Map<string, string>()
  for (const c of input.catalog) {
    if (c.ma.startsWith('cp.') || c.tinhChat === 'Dịch vụ') continue
    if (!catExact.has(sd(c.ten))) catExact.set(sd(c.ten), c)
    if (!catHard.has(hard(c.ten))) catHard.set(hard(c.ten), c)
    catTc.set(c.ma, c.tinhChat)
  }
  function catalogLookup(name: string): MucCatalog | null {
    const s = sd(name); if (catExact.has(s)) return catExact.get(s)!
    const h = hard(name); if (h && catHard.has(h)) return catHard.get(h)!
    const s2 = boTuNgoac(s); if (s2 && catExact.has(s2)) return catExact.get(s2)!
    const h2 = hard(s2); if (h2 && catHard.has(h2)) return catHard.get(h2)!
    return null
  }
  // chữ ký từ lịch sử tên hàng: sig → mã áp đảo
  const sigCount = new Map<string, Map<string, number>>()
  for (const [name, code] of n2c) { const g = chuKy(name); if (!g) continue; const m = sigCount.get(g) ?? new Map(); m.set(code, (m.get(code) ?? 0) + 1); sigCount.set(g, m) }
  const sig = new Map<string, string>(); for (const [g, m] of sigCount) sig.set(g, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0])
  const shipping = ovName.get('dich vu van chuyen') ?? 'DVVC'

  function goiYMaNoiBo(tenHang: unknown): { ma: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; canCu: string } {
    const s = sd(tenHang); if (!s) return { ma: '', conf: 'trong', canCu: '' }
    if (ovName.has(s)) return { ma: ovName.get(s)!, conf: 'cao', canCu: 'đã chốt tay' }
    if (n2c.has(s)) return { ma: n2c.get(s)!, conf: 'cao', canCu: 'khớp tên lịch sử' }
    const s2 = boNgoac(s)
    if (ovName.has(s2)) return { ma: ovName.get(s2)!, conf: 'cao', canCu: 'đã chốt tay' }
    if (n2c.has(s2)) return { ma: n2c.get(s2)!, conf: 'cao', canCu: 'khớp tên (bỏ ngoặc)' }
    if (s.includes('cts10')) { if (s.includes('trang')) return { ma: 'CTS10NW', conf: 'cao', canCu: 'CTS10 trắng' }; if (s.includes('den')) return { ma: 'CTS10NB', conf: 'cao', canCu: 'CTS10 đen' } }
    if (s.includes('aromatherapy') || s.includes('aromatheraphy')) { if (s.includes('hong')) return { ma: 'GEUS-00X06', conf: 'cao', canCu: 'vòi sen Hồng' }; if (s.includes('trang')) return { ma: 'GEUS-00X05', conf: 'cao', canCu: 'vòi sen Trắng' } }
    if (s.includes('van chuyen')) return { ma: shipping, conf: 'cao', canCu: 'dịch vụ vận chuyển' }
    const g = chuKy(String(tenHang ?? '')); if (g && sig.has(g)) return { ma: sig.get(g)!, conf: 'trung binh', canCu: 'khớp chữ ký ' + g }
    for (const [k, v] of n2c) if (k.length >= 12 && (s.includes(k) || k.includes(s))) return { ma: v, conf: 'trung binh', canCu: 'gần khớp tên' }
    return { ma: '', conf: 'can gan tay', canCu: 'chưa khớp' }
  }

  function laHangHoa(desc: unknown): { ma: string; tk: string; nhan: string } | null {
    const s = sd(desc)
    if (['phi ', 'phi(', 'dich vu', 'cuoc', 'hoa hong'].some((w) => s.includes(w))) return null
    const cat = catalogLookup(String(desc ?? ''))
    if (cat && !(MA_DICH_VU_KHONG_PHAI_HANG as readonly string[]).includes(cat.ma)) {
      const tk = TINH_CHAT_TK[cat.tinhChat] ?? TK_HANG_MAC_DINH; return { ma: cat.ma, tk, nhan: TK_NHAN[tk] ?? 'HÀNG HOÁ' }
    }
    const g = goiYMaNoiBo(desc)
    if (g.ma && (g.conf === 'cao' || g.conf === 'trung binh') && !['SHIP', 'DVVC', 'BT'].includes(g.ma)) {
      const tk = TINH_CHAT_TK[catTc.get(g.ma) ?? 'Hàng hóa'] ?? TK_HANG_MAC_DINH; return { ma: g.ma, tk, nhan: TK_NHAN[tk] ?? 'HÀNG HOÁ' }
    }
    return null
  }

  function suggest(seller: unknown, desc: unknown): { kmcp: string; conf: DoTinCay; reason: string; nguon: string } {
    const p = norm(seller), d = norm(desc)
    for (const l of [...ovSup, ...appSup]) if (l.pattern && p.includes(l.pattern)) return { kmcp: l.targetCode, conf: 'cao', reason: `Đã chốt tay: NCC ~«${l.pattern}» → ${l.targetCode}`, nguon: 'override_ncc' }
    for (const l of [...ovKw, ...appKw]) if (l.pattern && d.includes(l.pattern)) return { kmcp: l.targetCode, conf: 'cao', reason: `Đã chốt tay: từ khoá «${l.pattern}» → ${l.targetCode}`, nguon: 'override_kw' }
    let best: { len: number; l: Luat } | null = null
    for (const l of ruleSup) {
      if (l.pattern.length < 5) continue
      if (p.includes(l.pattern) || (p.length >= 8 && l.pattern.includes(p))) if (!best || l.pattern.length > best.len) best = { len: l.pattern.length, l }
    }
    if (best) { const dk = best.l.condition ?? ''; return { kmcp: best.l.targetCode, conf: dk ? 'trung binh' : 'cao', reason: `NCC khớp Rule «${best.l.pattern}»` + (dk ? ` — điều kiện tách: ${dk.slice(0, 50)}` : ''), nguon: 'rule_ncc' } }
    for (const l of ruleKw) if (l.pattern && d.includes(l.pattern)) { const nl = l.condition ?? ''; return { kmcp: l.targetCode, conf: nl ? 'can review' : 'trung binh', reason: `Từ khoá khớp «${l.pattern}» → ${l.targetCode}` + (nl ? ` (ngoại lệ: ${nl.slice(0, 50)})` : ''), nguon: 'rule_kw' } }
    if (p.length >= 6 && thongKe.nccToMa[p]) return { kmcp: thongKe.nccToMa[p], conf: 'trung binh', reason: `NCC này trong lịch sử luôn vào '${thongKe.nccToMa[p]}'`, nguon: 'hoc_ncc' }
    const pref = tienTo(desc); if (thongKe.prefixToMa[pref]) return { kmcp: thongKe.prefixToMa[pref], conf: 'trung binh', reason: `Diễn giải cùng mẫu «${pref}…» → '${thongKe.prefixToMa[pref]}'`, nguon: 'hoc_prefix' }
    return { kmcp: '', conf: 'khong ro', reason: 'Không khớp Rule/lịch sử — cần gán tay', nguon: '' }
  }

  function phanLoai(seller: unknown, desc: unknown, thue: number | null): KetQuaDauVao {
    const vat = thue && thue > 0 ? '1331' : ''
    const hh = laHangHoa(desc)
    if (hh) return { kind: 'goods', code: hh.ma, codeName: hh.nhan, tkNo: hh.tk, tkCo: '331', vat1331: vat, conf: 'cao', reason: 'Mua vào (mã nội bộ) — không phải chi phí', nguon: 'goods' }
    const sg = suggest(seller, desc)
    if (sg.kmcp === 'cp.muahang') return { kind: 'muahang', code: 'cp.muahang', codeName: 'CP mua hàng nhập khẩu', tkNo: '156', tkCo: '331', vat1331: vat, conf: sg.conf, reason: sg.reason, nguon: sg.nguon }
    if (sg.kmcp) return { kind: 'kmcp', code: sg.kmcp, codeName: kmTen.get(sg.kmcp) ?? '', tkNo: kmTk.get(sg.kmcp) ?? '', tkCo: '331', vat1331: vat, conf: sg.conf, reason: sg.reason, nguon: sg.nguon }
    return { kind: 'unknown', code: '', codeName: '', tkNo: '', tkCo: '', vat1331: vat, conf: 'khong ro', reason: sg.reason, nguon: '' }
  }

  return { phanLoai, goiYMaNoiBo }
}
```

- [ ] **Step 5: Chạy test, sửa tới khi khớp**

Run: `cd apps/web && npx vitest run lib/ke-toan/engine/dau-vao.test.ts`
Expected: PASS. Nếu có dòng lệch: đọc từng dòng in ra, so lại với hàm Python tương ứng (khả năng cao ở: thứ tự luật `keyword` (priority), `condition` rỗng vs null, catalog có mã `cp.*`, `hard()` với ký tự `đ`). **Không được nới test để pass**; nếu Python sai thật thì ghi vào phiên và thêm dòng đó vào danh sách `NGOAI_LE` trong test kèm lý do một dòng.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/ke-toan/engine/ apps/web/lib/ke-toan/__fixtures__/catalog-t8.json apps/web/lib/ke-toan/__fixtures__/kmcp.json tools/scripts/ke_toan_sinh_golden.py
git commit -m "feat(ke-toan): engine đầu vào TypeScript — khớp Python 100% tầng luật/hàng hoá trên T8"
```

---

### Task 8: Migration 02 — RPC `ke_toan_*` + smoke + áp live cả bộ

**Files:**
- Create: `supabase/migrations/20260904040200_ke_toan_02_rpc.sql`
- Modify: `tools/scripts/smoke_local.py` (thêm khối Kế toán)

**Interfaces:**
- Produces (mọi hàm `p_email text` đầu tiên; trả `jsonb`):
  - `accounting.nv(p_email) returns uuid` — staff id; raise `'Không có quyền khu Kế toán'` nếu không hoạt động hoặc vai trò ngoài danh sách.
  - `public.ke_toan_ky_list(p_email)` → `[{id, ky, status, sent_at, so_dong_vao, so_dong_ra, so_canh_bao, cap_nhat}]` (mới nhất trước).
  - `public.ke_toan_ky_tao(p_email, p_ky text)` → `{id, ky}` (tồn tại → trả cái có).
  - `public.ke_toan_nguon_them(p_email, p_period_id bigint, p_kind text, p_file_name text, p_storage_path text, p_headers jsonb, p_row_count int)` → `{id}`.
  - `public.ke_toan_dong_nhap(p_email, p_period_id bigint, p_source_id bigint, p_rows jsonb)` → `{inserted, updated, kept}`. `p_rows` = mảng object đúng tên cột `invoice_lines` (trừ id/period_id/timestamps) + `line_key`. Trùng `(period_id, line_key)`: cập nhật `raw`, `last_source_id`, `missing_in_last_upload=false`; **không** đụng `code*`, `tk_*`, `engine_*`.
  - `public.ke_toan_dong_list(p_email, p_period_id bigint, p_direction text)` → mảng dòng đầy đủ cột, `order by row_order`.
  - `public.ke_toan_luat_list(p_email)` → mảng `{id, kind, pattern, target_code, condition, priority, origin, active}` where active.

- [ ] **Step 1: Viết migration**

```sql
-- ke_toan_02_rpc — cửa duy nhất vào schema accounting (không expose). Khuôn: db/work/migrations/work_01_rpc_gd0.sql
-- Cách lùi nếu hỏng: drop function các hàm public.ke_toan_* và accounting.nv.

create or replace function accounting.nv(p_email text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_id uuid; v_roles text[];
begin
  select s.id, s.vai_tro into v_id, v_roles
    from public.staff s where s.email = lower(btrim(p_email)) and s.hoat_dong limit 1;
  if v_id is null or not (v_roles && array['admin','ke_toan','tai_chinh','ceo']) then
    raise exception 'Không có quyền khu Kế toán' using errcode = '42501';
  end if;
  return v_id;
end $$;

create or replace function public.ke_toan_ky_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'ky' desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', p.id, 'ky', p.ky, 'status', p.status, 'sent_at', p.sent_at, 'cap_nhat', p.updated_at,
      'so_dong_vao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'vao'),
      'so_dong_ra',  (select count(*) from accounting.invoice_lines l where l.period_id = p.id and l.direction = 'ra'),
      'so_canh_bao', (select count(*) from accounting.invoice_lines l where l.period_id = p.id and (l.code is null or l.code = '' or l.engine_conf in ('can review','khong ro')))
    ) x
    from accounting.periods p
    where accounting.nv(p_email) is not null
  ) t;
$$;

create or replace function public.ke_toan_ky_tao(p_email text, p_ky text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  if p_ky !~ '^\d{4}-(0[1-9]|1[0-2])$' then raise exception 'Kỳ phải dạng YYYY-MM'; end if;
  insert into accounting.periods (ky, created_by) values (p_ky, v_nv)
    on conflict (ky) do update set updated_at = accounting.periods.updated_at
    returning id into v_id;
  return jsonb_build_object('id', v_id, 'ky', p_ky);
end $$;

create or replace function public.ke_toan_nguon_them(p_email text, p_period_id bigint, p_kind text, p_file_name text,
                                                    p_storage_path text, p_headers jsonb, p_row_count int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv uuid := accounting.nv(p_email); v_id bigint;
begin
  insert into accounting.sources (period_id, kind, file_name, storage_path, headers, row_count, uploaded_by)
  values (p_period_id, p_kind, p_file_name, p_storage_path, coalesce(p_headers, '{}'::jsonb), coalesce(p_row_count, 0), v_nv)
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function public.ke_toan_dong_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0; v_tong int;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  v_tong := jsonb_array_length(p_rows);
  create temp table tmp_dong on commit drop as
    select * from jsonb_populate_recordset(null::accounting.invoice_lines, p_rows);
  update tmp_dong set period_id = p_period_id, first_source_id = p_source_id, last_source_id = p_source_id;

  with up as (
    update accounting.invoice_lines l
       set raw = t.raw, last_source_id = p_source_id, missing_in_last_upload = false
      from tmp_dong t
     where l.period_id = p_period_id and l.line_key = t.line_key
     returning l.id)
  select count(*) into v_upd from up;

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
    returning id)
  select count(*) into v_ins from ins;

  return jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'kept', v_tong - v_ins - v_upd);
end $$;

create or replace function public.ke_toan_dong_list(p_email text, p_period_id bigint, p_direction text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(l) order by l.row_order), '[]'::jsonb)
  from accounting.invoice_lines l
  where accounting.nv(p_email) is not null and l.period_id = p_period_id and l.direction = p_direction;
$$;

create or replace function public.ke_toan_luat_list(p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'kind', r.kind, 'pattern', r.pattern, 'target_code', r.target_code,
           'condition', r.condition, 'priority', r.priority, 'origin', r.origin, 'active', r.active) order by r.kind, r.origin, r.priority), '[]'::jsonb)
  from accounting.rules r where accounting.nv(p_email) is not null and r.active;
$$;

-- Khoá cửa: chỉ service_role (app server sau chanKeToan) gọi được
do $$
declare f text;
begin
  foreach f in array array['ke_toan_ky_list(text)','ke_toan_ky_tao(text,text)',
      'ke_toan_nguon_them(text,bigint,text,text,text,jsonb,int)','ke_toan_dong_nhap(text,bigint,bigint,jsonb)',
      'ke_toan_dong_list(text,bigint,text)','ke_toan_luat_list(text)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated;', f);
    execute format('grant execute on function public.%s to service_role;', f);
  end loop;
  revoke all on function accounting.nv(text) from public, anon, authenticated;
  grant execute on function accounting.nv(text) to service_role;
end $$;
```

- [ ] **Step 2: Thêm smoke Kế toán vào `tools/scripts/smoke_local.py`** (thay dòng `# --- Khu Kế toán: thêm ở Task 8 ---`):

```python
# --- Khu Kế toán ---
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("service_role: rpc ke_toan_ky_list (admin)", r.status_code == 200 and r.json() == [], (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.ketoan@gwt.vn"})
chk("service_role: rpc ke_toan_ky_list (vai ke_toan)", r.status_code == 200, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn"})
chk("vai cs: ke_toan_ky_list BỊ từ chối", r.status_code >= 400 and "Kế toán" in r.text, (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_list", headers=h(ANON), json={"p_email": "dev.admin@gwt.vn"})
chk("anon: rpc ke_toan_ky_list BỊ chặn", r.status_code in (401, 403, 404), r.status_code)
r = requests.get(f"{U}/rest/v1/periods?select=id", headers={**h(SVC), "Accept-Profile": "accounting"})
chk("schema accounting KHÔNG expose (406/404)", r.status_code in (404, 406), r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_tao", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_ky": "2026-08"})
chk("ke_toan_ky_tao 2026-08", r.status_code == 200 and r.json()["ky"] == "2026-08", (r.status_code, r.text[:80]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_ky_tao", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_ky": "2026-13"})
chk("ke_toan_ky_tao kỳ sai bị từ chối", r.status_code >= 400, r.status_code)
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_luat_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn"})
chk("luật đã seed ≥ 500", r.status_code == 200 and len(r.json()) >= 500, (r.status_code, len(r.json()) if r.status_code == 200 else r.text[:80]))
r = requests.get(f"{U}/rest/v1/expense_category?select=ma", headers=h(SVC))
chk("expense_category gương = 24", r.status_code == 200 and len(r.json()) == 24, r.status_code)
r = requests.get(f"{U}/storage/v1/bucket/accounting", headers=h(SVC))
chk("storage: bucket accounting riêng tư", r.status_code == 200 and r.json().get("public") is False, (r.status_code, r.text[:80]))
```

- [ ] **Step 3: Commit + CI xanh**

```bash
git add supabase/migrations/20260904040200_ke_toan_02_rpc.sql tools/scripts/smoke_local.py
git commit -m "feat(ke-toan): RPC ke_toan_* (cửa duy nhất vào schema accounting) + smoke"
git push && gh run watch $(gh run list -w db-reset -b feat/ke-toan-hoa-don --limit 1 --json databaseId --jq '.[0].databaseId')
```
Expected: db-reset xanh, smoke `ALL OK`.

- [ ] **Step 4: Áp live 3 migration (workflow DDL bước 3–4)**

Đích: **GWT-SalesTracking `bwzmqfbcgouhvhoslmmm`** (DB của app). Trước đó `git pull` để chắc repo ngang remote. Dùng MCP `apply_migration` lần lượt với `name` = đúng tên file không đuôi `.sql`, `query` = nội dung file: `20260904040000_ke_toan_00_init`, `20260904040100_ke_toan_01_luat_seed`, `20260904040200_ke_toan_02_rpc`.

Sau đó `execute_sql`:
```sql
select version, name from supabase_migrations.schema_migrations where name like '%ke_toan%' order by version;
```
Expected: 3 dòng, `version` = `20260904040000/040100/040200`. Lệch → sửa ngay:
```sql
update supabase_migrations.schema_migrations set version = '20260904040000' where name = '20260904040000_ke_toan_00_init';  -- tương tự 2 dòng kia
```
Rồi `get_advisors` (security): finding ERROR → xử lý trong phiên; WARN → ghi lại báo CEO. Chạy `select public.sync_catalog();` một lần để `expense_category` live lấy từ Masterdata (24 dòng, ghi đè seed).

---

### Task 9: Gác cửa + Server Actions + guard test

**Files:**
- Modify: `apps/web/lib/nen-tang/gac-cong.ts` (thêm `coTheVaoKeToan`)
- Create: `apps/web/app/ke-toan/actions.ts`
- Test: `apps/web/lib/ke-toan-guard.test.ts`

**Interfaces:**
- Consumes: `docNexia`, `khoaDong`, `sd`, `taoEngineDauVao`, `dataClient`, `requireNhanSu`, `chuanHoaEmail`, `ghiAudit`, RPC Task 8.
- Produces:
  ```ts
  export const VAI_TRO_VAO_KE_TOAN = ['admin', 'ke_toan', 'tai_chinh', 'ceo'] as const     // gac-cong.ts
  export async function coTheVaoKeToan(): Promise<boolean>                                     // gac-cong.ts
  // actions.ts ('use server')
  export type KyRow = { id: number; ky: string; status: 'dang_xu_ly' | 'da_gui'; sent_at: string | null; cap_nhat: string; so_dong_vao: number; so_dong_ra: number; so_canh_bao: number }
  export type DongRow = { id: number; row_order: number; line_key: string; ky_hieu: string | null; so_hd: string | null; ngay_lap: string | null; ten_ban: string | null; ten_hang: string | null; thanh_tien: number | null; tien_thue: number | null; raw: (string | number | null)[]; engine_code: string | null; engine_conf: string | null; engine_reason: string | null; engine_kind: string | null; code: string | null; code_name: string | null; tk_no: string | null; tk_co: string | null; vat_1331: string | null; note_for_accountant: string | null; first_source_id: number | null }
  export async function danhSachKy(): Promise<KyRow[]>
  export async function taoKy(ky: string): Promise<{ ok: true; id: number } | { ok: false; error: string }>
  export async function uploadNexia(prev: unknown, form: FormData): Promise<{ ok: true; inserted: number; updated: number; kept: number; canhBao: number } | { ok: false; error: string }>   // form: ky, file
  export async function dongCuaKy(ky: string, direction: 'vao' | 'ra'): Promise<{ period: KyRow | null; dong: DongRow[]; headers: string[] }>
  ```
  `uploadNexia`: kiểm `.xlsx`, ≤ 8 MB → `docNexia` → tab `vao` bắt buộc (không có → lỗi "File không có tab HĐ đầu vào") → upload Storage `accounting/{ky}/{timestamp}-{tên file}` → `ke_toan_nguon_them(kind='nexia', headers={vao:[...], ra:[...]})` → chạy engine trên từng dòng `vao` (luật từ `ke_toan_luat_list`, catalog từ `public.catalog_item` cột `"Mã nội bộ"`, `"Tên ngắn gọn (đề xuất)"`, `"Tính chất"`, kmcp từ `public.expense_category`) → `ke_toan_dong_nhap` theo lô 200 dòng; tab `ra` nhập **thô** (engine đầu ra là lát 3) với `engine_*`/`code` null → `ghiAudit('ke_toan.upload', ky, {...})` → `revalidatePath`.

- [ ] **Step 1: Viết guard test**

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = readFileSync(fileURLToPath(new URL('../app/ke-toan/actions.ts', import.meta.url)), 'utf8')

describe('ke-toan/actions.ts — mọi hàm chạm DB đều gác chanKeToan()', () => {
  const doan = src.split(/(?=async function )/)
  const viPham: string[] = []
  for (const p of doan) {
    const m = /\basync function (\w+)/.exec(p)
    if (!m || m[1] === 'chanKeToan' || m[1] === 'goi') continue
    if ((p.includes('dataClient(') || p.includes('goi<') || p.includes('goi(')) && !/\bchanKeToan\(/.test(p) && !/\bgoi[<(]/.test(p)) viPham.push(m[1])
  }
  it('không hàm nào chạm DB mà thiếu chanKeToan()/goi()', () => expect(viPham, viPham.join(', ')).toEqual([]))
  it('helper goi() luôn gọi chanKeToan()', () => {
    const goi = doan.find((p) => /async function goi\b/.test(p)) ?? ''
    expect(goi).toMatch(/chanKeToan\(\)/)
  })
  it('không nhận email từ tham số client', () => expect(src).not.toMatch(/p_email:\s*(email|form\.get)/))
})
```

- [ ] **Step 2: Chạy test, phải fail** — `cd apps/web && npx vitest run lib/ke-toan-guard.test.ts` → file actions không tồn tại.

- [ ] **Step 3: Thêm `coTheVaoKeToan` vào `apps/web/lib/nen-tang/gac-cong.ts`** (dưới `coTheVaoSales`):

```ts
/** Vai trò vào được KHU KẾ TOÁN — lát 1 gác bằng danh sách cứng; ma trận quyền chi tiết làm sau (spec §9). */
export const VAI_TRO_VAO_KE_TOAN = ['admin', 'ke_toan', 'tai_chinh', 'ceo'] as const

export async function coTheVaoKeToan(): Promise<boolean> {
  const nv = await layNhanVien()
  if (!nv) return false
  return nv.vai_tro.some((r) => (VAI_TRO_VAO_KE_TOAN as readonly string[]).includes(r))
}
```

- [ ] **Step 4: Viết `actions.ts`**

```ts
'use server'

/**
 * Server actions khu Kế toán — gọi RPC public.ke_toan_* bọc schema `accounting` (không expose),
 * đúng khuôn khu Việc. Mọi action: chanKeToan() (nền tảng + vai trò kế toán) → dataClient().
 * Email lấy từ session đã xác minh — KHÔNG nhận email từ client.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { dataClient } from '@/lib/nen-tang/db'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { chuanHoaEmail } from '@/lib/nen-tang/vao-cua'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { docNexia, type DongTho } from '@/lib/ke-toan/doc-file/nexia'
import { khoaDong } from '@/lib/ke-toan/chuan-hoa'
import { taoEngineDauVao } from '@/lib/ke-toan/engine/dau-vao'
import type { Luat, MucCatalog, MucKmcp } from '@/lib/ke-toan/engine/kieu'

export type KyRow = { id: number; ky: string; status: 'dang_xu_ly' | 'da_gui'; sent_at: string | null; cap_nhat: string; so_dong_vao: number; so_dong_ra: number; so_canh_bao: number }
export type DongRow = {
  id: number; row_order: number; line_key: string; ky_hieu: string | null; so_hd: string | null; ngay_lap: string | null
  ten_ban: string | null; ten_hang: string | null; thanh_tien: number | null; tien_thue: number | null
  raw: (string | number | null)[]; engine_code: string | null; engine_conf: string | null; engine_reason: string | null; engine_kind: string | null
  code: string | null; code_name: string | null; tk_no: string | null; tk_co: string | null; vat_1331: string | null
  note_for_accountant: string | null; first_source_id: number | null
}

const TOI_DA_BYTE = 8 * 1024 * 1024
const LO = 200

/** Gác khu Kế toán: nền tảng (mọi nhân sự) + vai trò trong VAI_TRO_VAO_KE_TOAN. Trả email đã chuẩn hoá. */
async function chanKeToan(): Promise<string> {
  const u = await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  return chuanHoaEmail(u.email)
}

/** Gọi RPC + ném lỗi kèm thông điệp gốc (tiếng Việt từ Postgres). */
async function goi<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const email = await chanKeToan()
  const { data, error } = await dataClient().rpc(fn, { p_email: email, ...args })
  if (error) throw new Error(error.message)
  return data as T
}

export async function danhSachKy(): Promise<KyRow[]> {
  return (await goi<KyRow[]>('ke_toan_ky_list', {})) ?? []
}

export async function taoKy(ky: string): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    const r = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky.trim() })
    revalidatePath('/ke-toan')
    return { ok: true, id: r.id }
  } catch (e) { return { ok: false, error: (e as Error).message } }
}

async function duLieuEngine(): Promise<{ luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[] }> {
  await chanKeToan()
  const db = dataClient()
  const [luat, cat, km] = await Promise.all([
    goi<{ id: number; kind: Luat['kind']; pattern: string; target_code: string; condition: string | null; priority: number; origin: Luat['origin']; active: boolean }[]>('ke_toan_luat_list', {}),
    db.from('catalog_item').select('"Mã nội bộ", "Tên ngắn gọn (đề xuất)", "Tính chất"'),
    db.from('expense_category').select('ma, ten, tk_no_default'),
  ])
  if (cat.error) throw new Error(cat.error.message)
  if (km.error) throw new Error(km.error.message)
  return {
    luat: (luat ?? []).map((l) => ({ id: l.id, kind: l.kind, pattern: l.pattern, targetCode: l.target_code, condition: l.condition, priority: l.priority, origin: l.origin, active: l.active })),
    catalog: (cat.data as Record<string, string | null>[]).map((c) => ({ ma: c['Mã nội bộ'] ?? '', ten: c['Tên ngắn gọn (đề xuất)'] ?? '', tinhChat: c['Tính chất'] ?? '' })).filter((c) => c.ma && c.ten),
    kmcp: (km.data as { ma: string; ten: string | null; tk_no_default: string | null }[]).map((k) => ({ ma: k.ma, ten: k.ten ?? '', tkNoDefault: k.tk_no_default ?? '' })),
  }
}

function dongSql(ky: string, direction: 'vao' | 'ra', d: DongTho, engine?: ReturnType<ReturnType<typeof taoEngineDauVao>['phanLoai']>) {
  const t = d.truong
  return {
    direction, line_key: khoaDong(direction, t.kyHieu, t.soHd, t.tenHang, t.thanhTien), row_order: d.rowOrder,
    ky_hieu: t.kyHieu || null, so_hd: t.soHd || null, ngay_lap: t.ngayLap, mccqt: t.mccqt || null,
    ten_ban: t.tenBan || null, mst_ban: t.mstBan || null, ten_mua: t.tenMua || null, mst_mua: t.mstMua || null,
    ten_hang: t.tenHang || null, dvt: t.dvt || null, so_luong: t.soLuong, don_gia: t.donGia, thue_suat: t.thueSuat || null,
    thanh_tien: t.thanhTien, tien_thue: t.tienThue, tong_thanh_toan: t.tongThanhToan, trang_thai: t.trangThai || null, tinh_chat: t.tinhChat || null,
    raw: d.raw,
    engine_code: engine?.code ?? null, engine_conf: engine?.conf ?? null, engine_reason: engine?.reason ?? null, engine_kind: engine?.kind ?? null,
    code: engine?.code || null, code_name: engine?.codeName || null, tk_no: engine?.tkNo || null, tk_co: engine?.tkCo || null, vat_1331: engine?.vat1331 || null,
  }
}

export async function uploadNexia(_prev: unknown, form: FormData): Promise<{ ok: true; inserted: number; updated: number; kept: number; canhBao: number } | { ok: false; error: string }> {
  const email = await chanKeToan()
  const ky = String(form.get('ky') ?? '').trim()
  const file = form.get('file')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ky)) return { ok: false, error: 'Kỳ không hợp lệ.' }
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) return { ok: false, error: 'Chọn file .xlsx (file NEXIA kế toán gửi).' }
  if (file.size > TOI_DA_BYTE) return { ok: false, error: 'File quá 8 MB.' }
  try {
    const buf = new Uint8Array(await file.arrayBuffer())
    const f = docNexia(buf)
    if (!f.vao) return { ok: false, error: 'File không có tab "HĐ đầu vào".' }

    const { id: periodId } = await goi<{ id: number }>('ke_toan_ky_tao', { p_ky: ky })
    const db = dataClient()
    const path = `${ky}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`
    const up = await db.storage.from('accounting').upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (up.error) return { ok: false, error: 'Không lưu được file gốc: ' + up.error.message }

    const { id: sourceId } = await goi<{ id: number }>('ke_toan_nguon_them', {
      p_period_id: periodId, p_kind: 'nexia', p_file_name: file.name, p_storage_path: path,
      p_headers: { vao: f.vao.headers, ra: f.ra?.headers ?? [] }, p_row_count: f.vao.dong.length + (f.ra?.dong.length ?? 0),
    })

    const dl = await duLieuEngine()
    const eng = taoEngineDauVao(dl)
    const rows = [
      ...f.vao.dong.map((d) => dongSql(ky, 'vao', d, eng.phanLoai(d.truong.tenBan, d.truong.tenHang, d.truong.tienThue))),
      ...(f.ra?.dong ?? []).map((d) => dongSql(ky, 'ra', d)),
    ]
    let inserted = 0, updated = 0, kept = 0
    for (let i = 0; i < rows.length; i += LO) {
      const r = await goi<{ inserted: number; updated: number; kept: number }>('ke_toan_dong_nhap', { p_period_id: periodId, p_source_id: sourceId, p_rows: rows.slice(i, i + LO) })
      inserted += r.inserted; updated += r.updated; kept += r.kept
    }
    const canhBao = rows.filter((r) => r.direction === 'vao' && (!r.code || r.engine_conf === 'can review' || r.engine_conf === 'khong ro')).length
    await ghiAudit('ke_toan.upload_nexia', ky, { file: file.name, inserted, updated, kept, canhBao, by: email })
    revalidatePath('/ke-toan'); revalidatePath(`/ke-toan/hoa-don/${ky}`)
    return { ok: true, inserted, updated, kept, canhBao }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function dongCuaKy(ky: string, direction: 'vao' | 'ra'): Promise<{ period: KyRow | null; dong: DongRow[]; headers: string[] }> {
  const ds = await danhSachKy()
  const period = ds.find((k) => k.ky === ky) ?? null
  if (!period) return { period: null, dong: [], headers: [] }
  const [dong, src] = await Promise.all([
    goi<DongRow[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: direction }),
    (async () => { await chanKeToan(); return dataClient().schema('public').from('catalog_sync_log').select('id').limit(0) })(),   // giữ chỗ: headers lấy từ sources ở bước dưới
  ])
  void src
  // headers của nguồn đầu tiên (NEXIA) — cần cho xuất Excel; lấy qua RPC dong_list là đủ vì raw giữ vị trí, header lưu ở sources
  const headers = await headersNguonDau(period.id, direction)
  return { period, dong: dong ?? [], headers }
}

async function headersNguonDau(periodId: number, direction: 'vao' | 'ra'): Promise<string[]> {
  await chanKeToan()
  // sources không expose → đọc qua RPC ky_list là không đủ; thêm RPC nhỏ ở lát này để không mở bảng:
  const r = await goi<{ headers: Record<string, string[]> }[]>('ke_toan_nguon_list', { p_period_id: periodId })
  const nexia = (r ?? []).find((s) => s.headers && s.headers[direction]?.length)
  return nexia?.headers[direction] ?? []
}
```

**Bổ sung RPC `ke_toan_nguon_list`** (thêm vào **migration 02 nếu chưa áp live**, hoặc migration mới `20260904040300_ke_toan_03_nguon_list.sql` nếu Task 8 đã áp — migration đã áp là bất biến):

```sql
create or replace function public.ke_toan_nguon_list(p_email text, p_period_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'kind', s.kind, 'file_name', s.file_name, 'headers', s.headers,
           'row_count', s.row_count, 'uploaded_at', s.uploaded_at) order by s.id), '[]'::jsonb)
  from accounting.sources s where accounting.nv(p_email) is not null and s.period_id = p_period_id;
$$;
revoke all on function public.ke_toan_nguon_list(text,bigint) from public, anon, authenticated;
grant execute on function public.ke_toan_nguon_list(text,bigint) to service_role;
```
Và **xoá** khối `(async () => {...})()` giữ chỗ + `void src` trong `dongCuaKy` — thay bằng gọi thẳng `headersNguonDau`:

```ts
export async function dongCuaKy(ky: string, direction: 'vao' | 'ra'): Promise<{ period: KyRow | null; dong: DongRow[]; headers: string[] }> {
  const ds = await danhSachKy()
  const period = ds.find((k) => k.ky === ky) ?? null
  if (!period) return { period: null, dong: [], headers: [] }
  const [dong, headers] = await Promise.all([
    goi<DongRow[]>('ke_toan_dong_list', { p_period_id: period.id, p_direction: direction }),
    headersNguonDau(period.id, direction),
  ])
  return { period, dong: dong ?? [], headers }
}
```

- [ ] **Step 5: Chạy guard test + tsc**

Run: `cd apps/web && npx vitest run lib/ke-toan-guard.test.ts && npx tsc --noEmit`
Expected: PASS 3; tsc sạch. Nếu `db.storage.from(...).upload` báo type với `Uint8Array`: truyền `Buffer.from(buf)`.

- [ ] **Step 6: Commit (+ CI nếu có migration mới)**

```bash
git add apps/web/lib/nen-tang/gac-cong.ts apps/web/app/ke-toan/actions.ts apps/web/lib/ke-toan-guard.test.ts supabase/migrations/
git commit -m "feat(ke-toan): gác cửa coTheVaoKeToan + actions upload NEXIA → engine → RPC + guard test"
git push
```

---

### Task 10: Màn `/ke-toan` (kỳ) và `/ke-toan/hoa-don/[ky]` (upload + bảng đầu vào) + launcher

**Files:**
- Create: `apps/web/app/ke-toan/page.tsx`
- Create: `apps/web/app/ke-toan/FormTaoKy.tsx`
- Create: `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx`
- Create: `apps/web/app/ke-toan/hoa-don/[ky]/FormUpload.tsx`
- Modify: `apps/web/components/TopNav.tsx`, `apps/web/components/TopNavClient.tsx`

**Interfaces:**
- Consumes: `danhSachKy`, `taoKy`, `uploadNexia`, `dongCuaKy`, `coTheVaoKeToan`, `@/bang` (`OTimKiem`, `BoLocChon`, `ThanhDangLoc`).
- Produces: route `/ke-toan`, `/ke-toan/hoa-don/2026-08?q=&tc=&tab=vao`. Tham số lọc: `q` (tìm tên NCC/tên hàng/số HĐ, khớp chuỗi con sau `boDau`), `tc` (độ tin cậy: `cao|trung binh|can review|khong ro`), `tab` (`vao|ra`, mặc định `vao`).

- [ ] **Step 1: Bật launcher.** Trong `TopNav.tsx`: thêm `coTheVaoKeToan` vào `Promise.all` và prop `coTheVaoKeToan={vaoKeToan}`. Trong `TopNavClient.tsx`: thêm prop `coTheVaoKeToan: boolean`; đổi dòng APPS thành `{ nhan: 'Kế toán', mau: '#3f8a6a', href: '/ke-toan', live: coTheVaoKeToan, icon: 'check' }` (dùng lại icon `check` sẵn có; icon riêng là việc lát UI); thêm module `keToan` vào `MODULES` khi `coTheVaoKeToan` với 1 trang `{ nhan: 'Hoá đơn', href: '/ke-toan' }` theo đúng cấu trúc `Module` của file (đọc kiểu `Module` ngay trên `viec`/`sales` và chép khuôn); `moduleActive` thêm nhánh `pathname.startsWith('/ke-toan') ? 'ke_toan'`.

- [ ] **Step 2: `FormTaoKy.tsx`** (client):

```tsx
'use client'
import { useActionState } from 'react'
import { taoKy } from './actions'

export function FormTaoKy() {
  const [kq, act, dang] = useActionState(async (_p: unknown, f: FormData) => taoKy(String(f.get('ky') ?? '')), null as null | Awaited<ReturnType<typeof taoKy>>)
  return (
    <form action={act} className="flex items-end gap-2">
      <label className="text-sm">Kỳ (YYYY-MM)
        <input name="ky" required pattern="\d{4}-(0[1-9]|1[0-2])" placeholder="2026-09" className="ml-2 rounded border px-2 py-1" />
      </label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">Tạo kỳ</button>
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
```

- [ ] **Step 3: `page.tsx` danh sách kỳ**

```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { danhSachKy } from './actions'
import { FormTaoKy } from './FormTaoKy'

export const metadata = { title: 'Kế toán · Kỳ hoá đơn' }
export const dynamic = 'force-dynamic'

export default async function KeToanPage() {
  await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  const ds = await danhSachKy()
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1100px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-xl font-semibold">Kế toán · Hoá đơn theo kỳ</h1>
            <p className="text-sm text-slate-500">Upload file NEXIA, app gán mã KMCP, tải lại Excel gửi kế toán.</p></div>
          <FormTaoKy />
        </header>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">Kỳ</th><th className="p-2">Trạng thái</th><th className="p-2 text-right">Dòng vào</th>
              <th className="p-2 text-right">Dòng ra</th><th className="p-2 text-right">Cảnh báo</th><th className="p-2">Cập nhật</th></tr></thead>
            <tbody>
              {ds.length === 0 ? <tr><td colSpan={6} className="p-4 text-center text-slate-500">Chưa có kỳ nào — tạo kỳ rồi upload file NEXIA.</td></tr> : null}
              {ds.map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="p-2"><Link className="font-medium text-[#3f8a6a] underline" href={`/ke-toan/hoa-don/${k.ky}`}>{k.ky}</Link></td>
                  <td className="p-2">{k.status === 'da_gui' ? 'Đã gửi kế toán' : 'Đang xử lý'}</td>
                  <td className="p-2 text-right">{k.so_dong_vao}</td><td className="p-2 text-right">{k.so_dong_ra}</td>
                  <td className="p-2 text-right">{k.so_canh_bao > 0 ? <span className="rounded bg-amber-100 px-2 text-amber-800">{k.so_canh_bao}</span> : 0}</td>
                  <td className="p-2 text-slate-500">{new Date(k.cap_nhat).toLocaleString('vi-VN')}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: `FormUpload.tsx`** (client):

```tsx
'use client'
import { useActionState } from 'react'
import { uploadNexia } from '../../actions'

export function FormUpload({ ky }: { ky: string }) {
  const [kq, act, dang] = useActionState(uploadNexia, null)
  return (
    <form action={act} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <input type="hidden" name="ky" value={ky} />
      <label className="text-sm">File NEXIA (.xlsx) <input type="file" name="file" accept=".xlsx" required className="ml-2 text-sm" /></label>
      <button disabled={dang} className="rounded bg-[#3f8a6a] px-3 py-1 text-white disabled:opacity-50">{dang ? 'Đang xử lý…' : 'Upload & phân loại'}</button>
      {kq?.ok ? <span className="text-sm text-emerald-700">Thêm {kq.inserted} · cập nhật {kq.updated} · giữ {kq.kept} · cảnh báo {kq.canhBao}</span> : null}
      {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
    </form>
  )
}
```

- [ ] **Step 5: `hoa-don/[ky]/page.tsx`**

```tsx
import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { BoLocChon, OTimKiem, ThanhDangLoc, boDau } from '@/bang'
import { dongCuaKy } from '../../actions'
import { FormUpload } from './FormUpload'

export const dynamic = 'force-dynamic'
type ThamSo = { q?: string; tc?: string; tab?: string }
const TC_OPTS = [{ giaTri: 'cao', nhan: 'Cao' }, { giaTri: 'trung binh', nhan: 'Trung bình' }, { giaTri: 'can review', nhan: 'Cần review' }, { giaTri: 'khong ro', nhan: 'Không rõ' }]
const MAU_TC: Record<string, string> = { 'can review': 'bg-amber-50', 'khong ro': 'bg-amber-100' }

export default async function KyPage({ params, searchParams }: { params: Promise<{ ky: string }>; searchParams: Promise<ThamSo> }) {
  await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  const { ky } = await params
  const { q = '', tc, tab = 'vao' } = await searchParams
  const direction = tab === 'ra' ? 'ra' : 'vao'
  const { period, dong } = await dongCuaKy(ky, direction)
  if (!period) redirect('/ke-toan')
  const qd = boDau(q)
  const rows = dong.filter((d) => (!tc || d.engine_conf === tc || (tc === 'khong ro' && !d.code))
    && (!qd || boDau(`${d.ten_ban ?? ''} ${d.ten_hang ?? ''} ${d.so_hd ?? ''}`).includes(qd)))
  const dieuKien = [q ? `q=${q}` : '', tc ? `độ tin cậy=${tc}` : ''].filter(Boolean)
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1320px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><Link href="/ke-toan" className="text-sm text-slate-500">← Kỳ</Link>
            <h1 className="text-xl font-semibold">Kỳ {period.ky} · {period.status === 'da_gui' ? 'Đã gửi kế toán' : 'Đang xử lý'}</h1></div>
          <a href={`/ke-toan/hoa-don/${period.ky}/xuat`} className="rounded border border-[#3f8a6a] px-3 py-1 text-[#3f8a6a]">Tải Excel _DAXULY</a>
        </header>
        <FormUpload ky={period.ky} />
        <nav className="flex gap-2 text-sm">
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=vao`} className={`rounded px-3 py-1 ${direction === 'vao' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu vào ({period.so_dong_vao})</Link>
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=ra`} className={`rounded px-3 py-1 ${direction === 'ra' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu ra ({period.so_dong_ra}) — lát 3</Link>
        </nav>
        <Suspense fallback={<div className="h-16" />}>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <OTimKiem placeholder="Tìm NCC / tên hàng / số HĐ…" />
            {direction === 'vao' ? <BoLocChon param="tc" nhan="Độ tin cậy" tuyChon={TC_OPTS} /> : null}
          </div>
        </Suspense>
        <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={dong.length} nhan="dòng" />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">#</th><th className="p-2">Số HĐ</th><th className="p-2">Ngày</th><th className="p-2">Người bán</th><th className="p-2">Tên hàng</th>
              <th className="p-2 text-right">Thành tiền</th><th className="p-2">Mã</th><th className="p-2">Tên mã</th><th className="p-2">TK Nợ</th><th className="p-2">TK Có</th><th className="p-2">1331</th>
              <th className="p-2">Độ tin cậy</th><th className="p-2">Căn cứ</th></tr></thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className={`border-t ${MAU_TC[d.engine_conf ?? ''] ?? (!d.code ? 'bg-amber-100' : '')}`}>
                  <td className="p-2 text-slate-400">{d.row_order}</td><td className="p-2">{d.ky_hieu} {d.so_hd}</td><td className="p-2">{d.ngay_lap}</td>
                  <td className="p-2 max-w-[220px] truncate" title={d.ten_ban ?? ''}>{d.ten_ban}</td>
                  <td className="p-2 max-w-[280px] truncate" title={d.ten_hang ?? ''}>{d.ten_hang}</td>
                  <td className="p-2 text-right tabular-nums">{d.thanh_tien?.toLocaleString('vi-VN')}</td>
                  <td className="p-2 font-medium">{d.code}</td><td className="p-2">{d.code_name}</td><td className="p-2">{d.tk_no}</td><td className="p-2">{d.tk_co}</td><td className="p-2">{d.vat_1331}</td>
                  <td className="p-2">{d.engine_conf}</td><td className="p-2 max-w-[260px] truncate text-slate-500" title={d.engine_reason ?? ''}>{d.engine_reason}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Kiểm tra local (CEO chưa cần vào)**

Chuẩn bị máy (một lần): `cd apps/web && npm install`; tạo `apps/web/.env.local` trỏ Supabase local theo `docs/LOCAL-DEV.md` (máy này chưa có Docker → thay bằng **project Supabase branch hoặc local của CEO**; nếu chỉ có prod, KHÔNG được test upload trên prod). Ghi rõ trong phiên môi trường nào đang dùng.

Run: `cd apps/web && npx tsc --noEmit && npx vitest run && npx next dev -p 3501` (nền), mở `http://localhost:3501/ke-toan` bằng `dev.admin@gwt.vn` → tạo kỳ `2026-08` → upload file T8 (từ `data/ke-toan/...`) → bảng hiện 415 dòng có mã, cảnh báo 0–19 dòng → so số mã với tab Excel gốc bằng mắt 10 dòng.
Expected: không lỗi console; upload < 30 s; số dòng khớp 415/85.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/ke-toan/ apps/web/components/TopNav.tsx apps/web/components/TopNavClient.tsx
git commit -m "feat(ke-toan): màn kỳ + màn hoá đơn (upload NEXIA, bảng đầu vào chỉ xem) + bật ô Kế toán"
```

---

### Task 11: Xuất Excel `_DAXULY.xlsx` (exceljs) + route handler

**Files:**
- Create: `apps/web/lib/ke-toan/xuat/excel-hoa-don.ts`
- Test: `apps/web/lib/ke-toan/xuat/excel-hoa-don.test.ts`
- Create: `apps/web/app/ke-toan/hoa-don/[ky]/xuat/route.ts`

**Interfaces:**
- Produces:
  ```ts
  export type DongXuat = { raw: (string | number | null)[]; code: string | null; codeName: string | null; tkNo: string | null; tkCo: string | null; vat1331: string | null; note: string | null; engineConf: string | null; engineKind: string | null; tuHdct: boolean }
  export const COT_THEM_VAO = ['Mã KMCP (đề xuất)', 'Tên KMCP', 'TK Nợ', 'TK Có', 'Nợ 1331 (VAT)', 'Ghi chú'] as const
  export const COT_THEM_RA = ['Mã nội bộ (đề xuất)', 'Mã khách hàng'] as const
  export async function dungExcelHoaDon(input: { headersVao: string[]; vao: DongXuat[]; headersRa: string[]; ra: DongXuat[] }): Promise<Uint8Array>
  ```
  Quy tắc: header thô giữ nguyên chuỗi (kể cả `''` cho cột không tên và trùng tên); cột thêm bên phải với font trắng nền `305496`; dòng `tuHdct` tô `FFE699` toàn dòng; `engineKind ∈ goods|muahang` tô `DDEBF7` ở 6 cột thêm; không có `code` tô `FFF2CC` ở 6 cột thêm; **không** có cột độ tin cậy/căn cứ; tab đầu ra lát 1 chỉ có cột thô + 2 cột thêm rỗng.

- [ ] **Step 1: Viết test**

```ts
import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { dungExcelHoaDon, COT_THEM_VAO } from './excel-hoa-don'

const H = ['Mẫu số HD', 'Ký hiệu hóa  đơn', 'Số hóa đơn', 'Ghi chú 2', '', 'Ghi chú 2']
describe('dungExcelHoaDon', () => {
  it('header thô giữ nguyên + 6 cột thêm; màu theo nguồn/loại', async () => {
    const buf = await dungExcelHoaDon({
      headersVao: H, headersRa: ['A'], ra: [],
      vao: [
        { raw: [1, 'C26', '1', null, null, 'x'], code: 'cp.qc', codeName: 'CP quảng cáo', tkNo: '6427', tkCo: '331', vat1331: '1331', note: null, engineConf: 'cao', engineKind: 'kmcp', tuHdct: false },
        { raw: [1, 'C26', '2', null, null, null], code: 'T25VB', codeName: 'VẬT TƯ (NVL)', tkNo: '152', tkCo: '331', vat1331: '', note: 'kho', engineConf: 'cao', engineKind: 'goods', tuHdct: true },
        { raw: [1, 'C26', '3', null, null, null], code: null, codeName: null, tkNo: null, tkCo: null, vat1331: '1331', note: null, engineConf: 'khong ro', engineKind: 'unknown', tuHdct: false },
      ],
    })
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf as unknown as ArrayBuffer)
    const ws = wb.getWorksheet('HĐ đầu vào')!
    expect(ws.getRow(1).values).toEqual([undefined, ...H, ...COT_THEM_VAO])
    expect(ws.getCell(2, 7).value).toBe('cp.qc'); expect(ws.getCell(2, 9).value).toBe('6427')
    expect((ws.getCell(3, 3).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFFFE699')   // dòng HDCT
    expect((ws.getCell(3, 7).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFDDEBF7')   // goods ở cột thêm
    expect((ws.getCell(4, 7).fill as ExcelJS.FillPattern).fgColor?.argb).toBe('FFFFF2CC')   // chưa khớp
    expect(ws.getCell(3, 12).value).toBe('kho')
    expect(wb.getWorksheet('HĐ Đầu ra')!.getRow(1).values).toEqual([undefined, 'A', 'Mã nội bộ (đề xuất)', 'Mã khách hàng'])
  })
})
```

- [ ] **Step 2: Chạy test, phải fail.** `cd apps/web && npx vitest run lib/ke-toan/xuat/excel-hoa-don.test.ts`

- [ ] **Step 3: Viết module**

```ts
import ExcelJS from 'exceljs'

export type DongXuat = { raw: (string | number | null)[]; code: string | null; codeName: string | null; tkNo: string | null; tkCo: string | null; vat1331: string | null; note: string | null; engineConf: string | null; engineKind: string | null; tuHdct: boolean }
export const COT_THEM_VAO = ['Mã KMCP (đề xuất)', 'Tên KMCP', 'TK Nợ', 'TK Có', 'Nợ 1331 (VAT)', 'Ghi chú'] as const
export const COT_THEM_RA = ['Mã nội bộ (đề xuất)', 'Mã khách hàng'] as const

const FILL = (argb: string): ExcelJS.FillPattern => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const HDCT = FILL('FFFFE699'), GOOD = FILL('FFDDEBF7'), WARN = FILL('FFFFF2CC'), HEAD = FILL('FF305496')

function ghiTab(wb: ExcelJS.Workbook, ten: string, headers: string[], them: readonly string[], dong: DongXuat[], cotThem: (d: DongXuat) => (string | null)[]) {
  const ws = wb.addWorksheet(ten)
  const n = headers.length
  ws.addRow([...headers, ...them])
  for (let c = 1; c <= n + them.length; c++) {
    const cell = ws.getRow(1).getCell(c)
    cell.font = { bold: true, color: c > n ? { argb: 'FFFFFFFF' } : undefined }
    if (c > n) { cell.fill = HEAD; cell.alignment = { wrapText: true, vertical: 'middle' }; ws.getColumn(c).width = 16 }
  }
  for (const d of dong) {
    const raw = Array.from({ length: n }, (_, i) => d.raw[i] ?? null)
    const row = ws.addRow([...raw, ...cotThem(d)])
    if (d.tuHdct) for (let c = 1; c <= n; c++) row.getCell(c).fill = HDCT
    const fillThem = d.engineKind === 'goods' || d.engineKind === 'muahang' ? GOOD : !d.code ? WARN : null
    if (fillThem) for (let c = n + 1; c <= n + them.length; c++) row.getCell(c).fill = fillThem
  }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

export async function dungExcelHoaDon(input: { headersVao: string[]; vao: DongXuat[]; headersRa: string[]; ra: DongXuat[] }): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  ghiTab(wb, 'HĐ đầu vào', input.headersVao, COT_THEM_VAO, input.vao, (d) => [d.code, d.codeName, d.tkNo, d.tkCo, d.vat1331, d.note])
  ghiTab(wb, 'HĐ Đầu ra', input.headersRa, COT_THEM_RA, input.ra, (d) => [d.code, null])
  return new Uint8Array(await wb.xlsx.writeBuffer())
}
```

- [ ] **Step 4: Chạy test, phải pass.**

- [ ] **Step 5: Route handler**

```ts
import { NextResponse } from 'next/server'
import { dongCuaKy } from '../../../actions'
import { dungExcelHoaDon, type DongXuat } from '@/lib/ke-toan/xuat/excel-hoa-don'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  // dongCuaKy() tự gác chanKeToan() (redirect nếu không có quyền)
  const [vao, ra] = await Promise.all([dongCuaKy(ky, 'vao'), dongCuaKy(ky, 'ra')])
  if (!vao.period) return NextResponse.json({ error: 'Không có kỳ' }, { status: 404 })
  const toXuat = (rows: typeof vao.dong, firstSourceNexia: number | null): DongXuat[] => rows.map((d) => ({
    raw: d.raw, code: d.code, codeName: d.code_name, tkNo: d.tk_no, tkCo: d.tk_co, vat1331: d.vat_1331, note: d.note_for_accountant,
    engineConf: d.engine_conf, engineKind: d.engine_kind, tuHdct: firstSourceNexia != null && d.first_source_id != null && d.first_source_id !== firstSourceNexia,
  }))
  const nguonNexia = vao.dong.length ? Math.min(...vao.dong.map((d) => d.first_source_id ?? Number.MAX_SAFE_INTEGER)) : null
  const buf = await dungExcelHoaDon({ headersVao: vao.headers, vao: toXuat(vao.dong, nguonNexia), headersRa: ra.headers, ra: toXuat(ra.dong, nguonNexia) })
  const [y, m] = ky.split('-')
  const ten = `${m}.${y} - GWT - NEXIA_DAXULY.xlsx`
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="NEXIA_DAXULY_${m}-${y}.xlsx"; filename*=UTF-8''${encodeURIComponent(ten)}`,
      'Cache-Control': 'no-store',
    },
  })
}
```

- [ ] **Step 6: Thử tay** — server 3501, bấm "Tải Excel _DAXULY" ở kỳ 2026-08: file mở được trong Excel, tab đầu vào 44 cột thô + 6 cột thêm, 415 dòng, mã ở cột 45 khớp bảng trên màn; dòng chưa khớp tô vàng nhạt. So sánh với file gốc T8 bằng script nhỏ (không commit) đếm số ô cột 45 giống nhau → ghi con số vào phiên.

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/ke-toan/xuat/ "apps/web/app/ke-toan/hoa-don/[ky]/xuat/route.ts"
git commit -m "feat(ke-toan): xuất Excel _DAXULY bằng exceljs — header thô nguyên vẹn, cột chốt, màu theo nguồn"
```

---

### Task 12: Tài liệu, kiểm tra tổng, mời CEO

**Files:**
- Create: `docs/ke-toan/README.md`
- Modify: `HANDOFF.md` (§2 bảng khu), `CLAUDE.md` (dải cổng), `docs/agents/domain.md` (nếu liệt kê khu)
- Modify: `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` (§13 thêm bẫy gặp khi làm)

- [ ] **Step 1: `docs/ke-toan/README.md`**

```markdown
# Khu Kế toán — hoá đơn NEXIA (lát 1)

Spec: `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` · Plan lát 1: `docs/plans/2026-09-04-ke-toan-lat-1-hoa-don-dau-vao.md`

## Kiến trúc tóm tắt
- Schema `accounting` (SalesTracking `bwzmqfbcgouhvhoslmmm`), **không expose**; app đi qua RPC `public.ke_toan_*` (khuôn khu Việc).
- Engine phân loại: `apps/web/lib/ke-toan/engine/dau-vao.ts` — hàm thuần, nghiệm thu bằng fixture T8 (`__fixtures__/`, đã che PII).
- Luật: `accounting.rules` (seed từ Excel Rule + overrides + lịch sử tên hàng). Sửa luật trên app từ lát 2; **file Excel Rule không còn là nguồn sự thật.**
- File gốc: Storage bucket `accounting` (private), đường dẫn `<kỳ>/<timestamp>-<tên file>`.
- Danh mục: `public.expense_category` gương từ Masterdata qua `sync_catalog()`; catalog từ `public.catalog_item`.

## Config ngoài migration (ghi để dựng lại được)
- Không có (lát 1). Lát 6 sẽ thêm biến môi trường `GOOGLE_SERVICE_ACCOUNT_KEY` và `accounting.settings`.

## Chạy local
- Cổng dev **3501**. Vai trò vào: `admin | ke_toan | tai_chinh | ceo`. Tài khoản local: `dev.admin@gwt.vn` (chuẩn) hoặc `dev.ketoan@gwt.vn` (tạo auth user bằng `tools/user-local.sh`, mật khẩu chung).
- Sinh lại fixture/seed khi tool Python đổi: `python tools/scripts/ke_toan_sinh_golden.py`, `python tools/scripts/ke_toan_sinh_luat_sql.py` (cần `data/ke-toan/`).

## Quy trình tháng (lát 1)
1. `/ke-toan` → tạo kỳ `YYYY-MM`. 2. Upload file NEXIA `.xlsx`. 3. Xem bảng đầu vào, dòng vàng = engine không chắc.
4. Tải `_DAXULY.xlsx` gửi kế toán (dòng chưa có mã người dùng điền tay trong Excel — lát 2 sửa trên app).

## Điểm treo
- Tab 5 Excel Rule ("TK Nợ bắt buộc", vd `cp.qc → 6417`) KHÁC `expense_category.tk_no_default` (6427). App theo Masterdata. CEO quyết với Masterdata.
- Lint CI đỏ từ 22/08 (7 lỗi cũ) — ngoài phạm vi khu này.
```

- [ ] **Step 2: HANDOFF.md §2** thêm dòng bảng: `| **Kế toán** | \`/ke-toan\`, \`/ke-toan/hoa-don/[ky]\` | schema \`accounting\` (RPC \`ke_toan_*\`) | Lát 1: upload NEXIA + phân loại đầu vào + tải Excel |` và sửa dòng "Kho · Nhân sự · Kế toán · Marketing chưa có" bỏ "Kế toán". **CLAUDE.md** bảng cổng: thêm `Kế toán 3501–3503`.

- [ ] **Step 3: Kiểm tra tổng (verification-before-completion)**

```bash
cd apps/web && npx tsc --noEmit && npx vitest run && npm run build && (npm run lint 2>&1 | grep -c " error " )
```
Expected: tsc 0 lỗi; vitest tất cả pass (kể cả 41 test cũ); build xong; số lỗi lint = **7** (không tăng). Ghi output vào phiên.

- [ ] **Step 4: Đối chiếu file thật (chạy tay, không commit)**

Upload T8 thật ở local → tải Excel → script tạm trong scratchpad so cột 45–49 của file tải về với file T8 gốc theo `row_order`: in số dòng giống / khác, liệt kê tối đa 20 dòng khác. Kỳ vọng: khác chỉ ở dòng Python thuộc tầng học lịch sử (`hoc_ncc`/`hoc_prefix`) — sẽ về khi lát 2 nạp lịch sử.

- [ ] **Step 5: Commit + push + mời CEO**

```bash
git add docs/ke-toan/README.md HANDOFF.md CLAUDE.md docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md
git commit -m "docs(ke-toan): README khu, HANDOFF/CLAUDE cập nhật khu + cổng 3501, bẫy đã gặp"
git push
```
Mời CEO xem tại `http://localhost:3501/ke-toan` (server đang chạy, DB **local**), kèm 3 việc để bấm: tạo kỳ 2026-08 → upload file T8 → tải Excel. Sau CEO OK: `superpowers:finishing-a-development-branch` (merge `main`, xoá nhánh, cập nhật memory theo luật memory-sync).

---

## Self-review

**Spec coverage (lát 1):** §5 bảng → Task 2 (6 bảng, bucket, gương) ✓; RPC thay expose → Task 0 + 8 ✓; §6 `doc-file/nexia` T5, `chuan-hoa` T4, `engine/dau-vao` T7, `xuat/excel-hoa-don` T11 ✓; `gop-nguon` — lát 4 (T8 `dong_nhap` đã giữ chốt khi trùng khoá, đủ cho lát 1) ✓; §7 `/ke-toan` + `/ke-toan/hoa-don/[ky]` chỉ xem T10 ✓; launcher T10 ✓; §8 Excel màu/cột T11 ✓ (Sheet/Drive lát 6); §9 vai trò cứng T9 ✓; §10 fixture che PII T3, parity T7, test đọc file T5, test xuất T11, tsc/test/build T12 ✓; §11 lát 1 CI db-reset T1 ✓; §12 điểm treo tab 5 ghi README T12 ✓.

**Placeholder scan:** không còn "TBD/TODO/tương tự Task N". Khối giữ chỗ trong `dongCuaKy` ở Task 9 đã được thay bằng bản cuối ngay dưới (giữ cả hai để người làm thấy vì sao cần RPC `ke_toan_nguon_list`).

**Type consistency:** `KetQuaDauVao.{code, codeName, tkNo, tkCo, vat1331, conf, reason, kind, nguon}` dùng thống nhất ở T7/T9; `DongRow` T9 ↔ cột `invoice_lines` T2 ↔ `DongXuat` T11 (map trong route); `Luat` T6 ↔ parse seed T7 ↔ `duLieuEngine` T9; RPC tên/tham số T8 ↔ `goi()` T9 (`ke_toan_nguon_list` bổ sung có ghi rõ chỗ đặt).

**Rủi ro ghi rõ:** (1) CI db-reset lần đầu cho repo có thể đỏ vì migration cũ — T1 dừng và báo; (2) máy Windows này không có Docker và chưa có `.env.local` — T10 Step 6 yêu cầu chốt môi trường test trước khi upload; (3) parity tầng học lịch sử để lát 2.
