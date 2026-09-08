# Wiki Training Ingest — lát 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Endpoint nhận Q&A từ routine → bảng đề xuất → màn duyệt trong `/wiki` → trang Hỏi–đáp động theo khu.

**Architecture:** Schema `wiki` + RPC `public.wiki_*` service_role-only (khuôn khu Kế toán); route handler bearer-secret cho routine; Server Actions gác `requireNhanSu` + vai `admin|ceo` cho màn duyệt; trang động đọc RPC. Routine cloud dựng SAU khi merge (Task 7 chỉ viết tài liệu).

**Tech Stack:** Next.js 16 (app router, route handler, server actions), Supabase (PostgREST RPC, service_role), vitest, Python smoke qua PostgREST (CI db-reset).

**Spec:** `docs/specs/2026-09-08-wiki-training-ingest-design.md`

## Global Constraints

- Migration mới trong `supabase/migrations/`, số hiệu giờ UTC, header có "cách lùi"; áp live CHỈ sau CI `db-reset` xanh; ledger version = số hiệu file; `get_advisors` sau DDL.
- RPC: `security definer set search_path = ''`, revoke public/anon/authenticated, grant service_role. UPDATE/DELETE luôn có WHERE (safeupdate).
- Action: gọi gác TRƯỚC `try`; không nhận email từ client; guard test như `lib/ke-toan-guard.test.ts`.
- Không thêm dependency npm. Không commit PII. eslint không tăng quá 7 lỗi cũ. `npx tsc --noEmit`, `npx vitest run`, `npm run build` sạch trước khi mời CEO.
- Route động `[khu]/[slug]` → trang mới phải là segment tĩnh `[khu]/hoi-dap`.

---

### Task 1: Migration `wiki_00` — schema, bảng, RPC, smoke

**Files:**
- Create: `supabase/migrations/20260908080000_wiki_00_de_xuat.sql`
- Modify: `tools/scripts/smoke_local.py` (thêm khối "Khu Wiki ingest" cuối file, trước `print("\nALL OK"…)`)

**Interfaces:**
- Produces: RPC theo spec §4 với chữ ký:
  - `wiki_ingest_nhan(p_kenh_id text, p_items jsonb) → {them:int, bo_qua:int}`
  - `wiki_watermark_get() → {"<kenh>": "<id>"}` · `wiki_watermark_set(p_kenh_id text, p_message_id text) → {ok:true}`
  - `wiki_ingest_run_ghi(p_kenh_id text, p_received int, p_inserted int, p_skipped int, p_rejected int) → {id}`
  - `wiki_de_xuat_list(p_email text, p_status text) → jsonb[]` (mọi cột proposals + `reviewed_by_email`)
  - `wiki_de_xuat_sua(p_email, p_id bigint, p_question text, p_answer text, p_khu text, p_pii_checked boolean) → {ok}`
  - `wiki_de_xuat_duyet(p_email, p_id) → {ok}` · `wiki_de_xuat_tu_choi(p_email, p_id, p_ly_do text) → {ok}`
  - `wiki_de_xuat_dem(p_email) → {pending:int}` · `wiki_hoi_dap(p_email, p_khu text) → jsonb[]` · `wiki_lan_quet(p_email) → jsonb[]`

- [ ] **Step 1: Viết migration** (nội dung đầy đủ — schema, 3 bảng, RLS, grant, `wiki.nv` (mọi nhân sự hoạt động) + `wiki.nv_duyet` (admin|ceo), 10 RPC, khối revoke/grant). Chi tiết SQL: xem file đã viết ở commit Task 1 — mỗi RPC phải có WHERE cho UPDATE; `wiki_ingest_nhan` dùng `insert … on conflict (channel_id, message_id) do nothing`, đếm `them` bằng `returning`, `bo_qua = tổng − them`; `wiki_de_xuat_duyet` raise nếu `can_pkb` hoặc `pii_checked = false` hoặc status ≠ pending.
- [ ] **Step 2: Smoke qua PostgREST** — thêm vào `smoke_local.py`: nhận 2 item (1 trùng message_id → them 1, bo_qua 1); watermark set/get; list pending = 1 (dev.admin); sua (khu=sales, pii_checked=true); duyet → ok; hoi_dap('sales') = 1; duyet lại → lỗi; tu_choi → ok; dem → 0; item `khu_goi_y='san-pham'` → `can_pkb=true` và duyet → lỗi; vai `dev.cs` gọi `wiki_de_xuat_list` → 403; anon → 401.
- [ ] **Step 3: Commit + push** → CI `db-reset` xanh → áp live qua MCP → sửa ledger version → `get_advisors`.

### Task 2: `lib/wiki-ingest/kiem-tra.ts` — validate + quét PII (thuần, có test)

**Files:**
- Create: `apps/web/lib/wiki-ingest/kiem-tra.ts`, `apps/web/lib/wiki-ingest/kiem-tra.test.ts`

**Interfaces:**
- Produces: `type ItemIngest = { message_id: string; thread_id: string | null; cau_hoi: string; tra_loi: string; nguoi_tra_loi: string | null; tra_loi_luc: string | null; jump_link: string; nguon_ids: string[]; khu_goi_y: string | null; do_tin_cay: number | null }`;
  `type ThanIngest = { kenh_id: string; watermark_moi: string | null; items: ItemIngest[] }`;
  `kiemTraThan(x: unknown): { ok: true; than: ThanIngest } | { ok: false; loi: string }` (≤200 item, chuỗi ≤ 8000 ký tự, message_id/kenh_id là chuỗi số 15–22 ký tự, jump_link bắt đầu `https://discord.com/channels/`);
  `timPii(s: string): string[]` (SĐT VN `0[35789]\d{8}`, `(\+84|84)[35789]\d{8}`, email) ; `KHU_HOP_LE`.

- [ ] Viết test trước (shape sai → loi; 201 item → loi; PII bắt SĐT dạng `0912 345 678`, `+84912345678`, email; không bắt số HĐ 10 số bắt đầu 1) → RED → implement → GREEN → commit.

### Task 3: Endpoint `/api/wiki-ingest` + `proxy.ts`

**Files:**
- Create: `apps/web/lib/wiki-ingest/xu-ly.ts` (logic thuần, nhận `rpc` inject), `apps/web/lib/wiki-ingest/xu-ly.test.ts`, `apps/web/app/api/wiki-ingest/route.ts`, `apps/web/app/api/wiki-ingest/watermark/route.ts`
- Modify: `apps/web/proxy.ts:65` (`DUONG_CONG_KHAI` thêm `'/api/wiki-ingest'`), `apps/web/.env.example` (thêm `WIKI_INGEST_SECRET=`)

**Interfaces:**
- Produces: `xuLyIngest(than: ThanIngest, rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>) → Promise<{ them: number; bo_qua_trung: number; tu_choi_pii: string[] }>`; `kiemBearer(req: Request): 'ok' | 'thieu_env' | 'sai'` (timing-safe).

- [ ] Test `xuLyIngest` với rpc giả: item PII bị loại và không gửi vào `wiki_ingest_nhan`; watermark chỉ set khi nhan OK; run_ghi ghi đúng số. Test `kiemBearer`. → implement → route dùng chúng → commit.

### Task 4: Màn duyệt `/wiki/de-xuat`

**Files:**
- Create: `apps/web/app/wiki/de-xuat/actions.ts`, `apps/web/app/wiki/de-xuat/page.tsx`, `apps/web/app/wiki/de-xuat/BangDeXuat.tsx` (client), `apps/web/lib/wiki-ingest-guard.test.ts`
- Modify: `apps/web/lib/nen-tang/gac-cong.ts` (thêm `coTheDuyetWiki(): admin|ceo`), `apps/web/lib/wiki/nav.ts` (mục "Đề xuất từ training" cho mọi khu tài liệu), `apps/web/components/wiki/WikiShell.tsx` + `app/wiki/layout.tsx` (badge pending qua `counts.deXuat`)

- [ ] Guard test (mọi `async function` chạm DB có `chanDuyetWiki()`/`goi()`, gác trước `try`) → actions (`danhSach(status)`, `sua`, `duyet`, `tuChoi`, `lanQuet`, `demPending`) → page + bảng (useActionState) → tsc/test → commit.

### Task 5: Trang động `/wiki/[khu]/hoi-dap`

**Files:**
- Create: `apps/web/app/wiki/[khu]/hoi-dap/page.tsx`, `apps/web/app/wiki/[khu]/hoi-dap/actions.ts` (hoặc dùng chung `lib/wiki-ingest/doc.ts` gác `requireNhanSu`)
- Modify: `apps/web/lib/wiki/nav.ts` (`navTaiLieu` thêm mục "Hỏi–đáp từ training" → `/wiki/<khu>/hoi-dap`)

- [ ] Page `dynamic = 'force-dynamic'`, `notFound()` nếu khu ∉ KHU tài liệu hoặc = `san-pham`; render Markdown trả lời; banner hạng D → commit.

### Task 6: Kiểm tra tổng, docs

- [ ] `tsc`, `vitest`, `eslint` (=7), `next build`; dev server cắm prod cổng 3401; CEO xem `/wiki/de-xuat` với 2 item nạp thử bằng `curl` (secret local).
- [ ] Docs: `docs/wiki-ingest.md` (kiến trúc, endpoint, secret, hướng dẫn dựng routine sau merge: prompt + 3 điều kiện env), `docs/wiki-cap-nhat.md` (mục mới "Q&A từ training"), `HANDOFF.md` bảng khu, `.env.example`.

### Task 7 (sau merge): Routine cloud

Duplicate ai-digest → prompt theo `docs/wiki-ingest.md` → chạy thử 1 lần → 2xx → pending hiện. Ngoài plan này.
